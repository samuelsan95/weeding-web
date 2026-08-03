# Wedding Web

Vue 3 + Vite single-page wedding website. Deployed to **Vercel** (static build + 3 serverless functions: `/api/search` for iTunes, `/api/confirm` and `/api/song` as form proxies to Google Apps Script).

## Commands

```bash
npm run dev        # Vite dev server (forms will 404 — use vercel dev for full stack)
vercel dev         # Vercel dev (runs api/* functions too) — recommended for local form testing
npm run build      # Production build (outputs to ./dist)
npm run preview    # Preview production build locally
```

No linter, formatter, or test suite configured.

## Environment Variables

All env vars are set in the **Vercel project** (*Settings → Environment Variables*). For local dev, create `.env` with the same keys — see `.env.example` for placeholders.

### Client (`VITE_*` prefix → inlined in JS bundle)

| Variable | Type | Used in |
|---|---|---|
| `VITE_SONG_PROXY_URL` | var | `useSongSearch.ts` - URL of the `/api/search` function on the same Vercel project (e.g. `https://ireneysamuel.xyz/api/search`) |
| `VITE_CLOUDINARY_CLOUD_NAME` | var | `wedding.js` - Cloudinary cloud name for the photos gallery (free tier at cloudinary.com) |

### Server (read by `api/*` functions via `process.env`)

| Variable | Type | Used in |
|---|---|---|
| `VITE_CONFIRMATION_SHEET_URL` | secret | `api/confirm.js` - Google Apps Script `/exec` URL for confirmations |
| `VITE_CONFIRMATION_TOKEN` | secret | `api/confirm.js` - token validated by the Apps Script `doPost` (rotate to invalidate old tokens) |
| `VITE_SONG_SHEET_URL` | secret | `api/song.js` - Google Apps Script `/exec` URL for songs |
| `VITE_SONG_TOKEN` | secret | `api/song.js` - token validated by the Apps Script `doPost` |
| `ALLOWED_ORIGIN` | var | `api/_lib/cors.js` - production origin for CORS allow-list (e.g. `https://ireneysamuel.xyz`) |

> The `VITE_` prefix on the four form vars is a naming choice, **not** a security mechanism. Only the client bundle reads `VITE_*` vars via `import.meta.env`; the serverless functions read them via `process.env`, so a `VITE_` server-only var is never sent to the browser. `ALLOWED_ORIGIN` has no prefix because no client code reads it.

Forms will fail silently without the server-side env vars. The browser **never** sees the sheet URLs or the server tokens.

## Deploy

Push to `main` triggers a Vercel build automatically:
1. `npm ci` → `npm run build` (only `VITE_*` env vars injected at build time)
2. Static assets served from the project domain
3. `api/search.js`, `api/confirm.js`, `api/song.js` are deployed as serverless functions

## Structure

- `src/App.vue` - Root component, assembles all sections in order
- `src/components/` - 11 Vue SFCs (all page sections + shared FormInput)
- `src/composables/useFootprintAnimation.ts` - Canvas-based scroll animation (TypeScript)
- `src/composables/useSongSearch.ts` - Debounced song autocomplete via iTunes Search API (proxied through `/api/search`)
- `src/data/wedding.js` - Single source of truth: date (2027-06-26), schedule, location, photos (Cloudinary URLs)
- `src/style.css` - Global CSS with CSS custom properties (`--color-primary`, `--color-background`, `--color-white`)
- `api/search.js` - Vercel serverless function (iTunes Search CORS proxy)
- `api/confirm.js` - Vercel serverless function (confirmation form proxy)
- `api/song.js` - Vercel serverless function (song request form proxy)
- `api/_lib/` - Shared helpers (CORS, rate-limit, validation, Apps Script forwarding). The `_` prefix prevents Vercel from deploying them as functions.
- `public/` - Static assets served as-is (gitignored; populated by Vite plugin at build time)

## Form Architecture (Nivel 2)

The browser **never** talks to Google Apps Script directly. The flow is:

```
[Browser]  --POST /api/confirm or /api/song-->  [Vercel Function]  --POST-->  [Apps Script]
   │           JSON + honeypot + debounced              │                              │
   │                                                   ▼                              ▼
   │                                            origin allow-list              appendRow
   │                                            payload validation
   │                                            per-IP rate-limit (in-memory)
   │                                            forward with server token
   ▼
honeypot, maxlength, 5s submit debounce, soft localStorage gate (confirmation only)
```

**Why**: the old `VITE_*` tokens were bundled in the JS and readable by anyone. Now the Apps Script URLs and tokens live only on the server.

**Defenses (client)**:
- **Honeypot** (`name="company"`, off-screen) — bots auto-fill it; if non-empty, the form silently fakes success without sending.
- **Maxlength** on every input (name 100, allergies 500, dedication 500, author 100, manual song 200).
- **5-second submit debounce** after any click (anti double-click and accidental loops).
- **Soft localStorage gate** on the confirmation form only: if `wedding-confirmation-submitted` is set, the form is replaced with a "ya has enviado" panel and a "Volver a permitir" button. Songs do not gate (guests can add more later).

**Defenses (server, `api/_lib/`)**:
- **CORS allow-list**: only `ALLOWED_ORIGIN` (plus localhost in dev). No more `*`.
- **Origin check** on every request → 403 if not in allow-list.
- **Payload validation**: types, lengths, allowed values; rejects chars de control.
- **Rate-limit in-memory per IP** (hashed with SHA-256): 1 req / 30s, 5 req / 10 min. State resets on cold start; acceptable for ~100 guests.

**Token rotation**: when you rotate `VITE_CONFIRMATION_TOKEN` or `VITE_SONG_TOKEN`, update both the Vercel env var **and** the expected value in the corresponding Apps Script `doPost`. The old token stops working as soon as you redeploy the Apps Script.

## Photos Gallery (`src/components/PhotosGallery.vue`)

Photos are served from **Cloudinary** (free tier, ~25GB bandwidth/month). Set `VITE_CLOUDINARY_CLOUD_NAME` to your cloud name (visible in the Cloudinary dashboard URL). For each photo, the app requests on-the-fly variants from Cloudinary:

- **Thumb** (3:2 crop, used in the carousel): `c_fill,q_auto,f_auto` at 600w and 1200w
- **Lightbox** (preserve aspect ratio, used in the modal): `c_limit,q_auto,f_auto` at 1600w and 2400w

The `f_auto` flag tells Cloudinary to serve AVIF/WebP/JPEG based on the visitor's browser. The components use `<img srcset>` with `sizes` for responsive selection (mobile → 600w, desktop → 1200w).

**Upload workflow**:
1. Create a Cloudinary account at cloudinary.com
2. Upload the wedding photos with public IDs `boda-1`, `boda-2`, ..., `boda-10` (or update the `publicId` argument in `wedding.js`)
3. Set `VITE_CLOUDINARY_CLOUD_NAME` in Vercel (and `.env` for local dev)
4. Update the `alt` text in `wedding.js` for each photo

**Why Cloudinary**:
- Free tier is more than enough for a wedding (a few hundred visitors × a few minutes of browsing)
- On-the-fly transforms mean we ship no image assets in the repo
- `f_auto` handles WebP/AVIF negotiation server-side via the `Accept` header
- Global CDN, fast everywhere
- If the free tier is exceeded, costs are negligible (~$0.005/GB)

## Song Form (`src/components/SongForm.vue`)

Guests can request up to **3 songs** per submission. Each slot is a `SongPicker.vue` instance: search via autocomplete (iTunes Search API via the `/api/search` Vercel function, 300ms debounce, 8 results, min 3 chars), pick one to reveal a 30-sec preview player.

- Progressive UX: starts with 1 empty slot. The `+ Añadir otra` button only appears when the last slot is filled (no gaps). The × button is always available to clear a slot; removing shifts remaining slots up (if it empties the list, a fresh empty slot is auto-added). A solo `HTMLAudioElement` is shared across all slots; playing another slot stops the current one. A manual-entry fallback (`¿No la encuentras? Añádela manualmente`) lets the guest type the title (required) and artist (optional) when the song isn't in iTunes.
- **Payload** sent to `/api/song`: `{ dedication, author, songs: [{ trackId, name, artist, album }] }`. The function expands this into one row per song for the sheet (1–3 rows). Each row has `Timestamp`, `Cancion` (formatted as `Track — Artist`), `Artista`, `Album`, `TrackId`, `Quien`. The `Dedicatoria` is set on the first row only. The function uses `Promise.allSettled` server-side; a partial failure returns HTTP 207.
- Keyboard (per picker): `↓`/`↑` navigate, `Enter` selects, `Esc` closes, `mousedown` (not `click`) so the option picks before the dropdown unmounts. Each picker listens for outside `mousedown` (capture phase) to close its own dropdown. Tracks without a preview show `Sin preview` instead of a play button (rare with iTunes).
- iTunes returns `artworkUrl100`; the composable swaps the suffix to `300x300bb` for a sharper thumbnail.

## Song Search API (`api/search.js`)

The browser **cannot** call `itunes.apple.com` directly: on mobile the response redirects to the custom scheme `musics://` (to open Apple Music), which the browser blocks. This Vercel serverless function bridges it with a server-to-server fetch (non-mobile User-Agent) and adds the CORS headers the browser requires.

- **No setup**: Vercel auto-detects `api/*.js` as functions. Just commit the file; deploy handles the rest.
- **No secrets**: iTunes is public, no keys.
- **Edge cache**: `Cache-Control: s-maxage=600` makes Vercel cache identical queries for 10 min, so repeat searches (and tests) don't re-hit iTunes.
- **Free tier**: Vercel's free plan is more than enough for a wedding (100 GB-hours/month).

Set `VITE_SONG_PROXY_URL` to the function URL: `https://<your-project>.vercel.app/api/search` (same domain as the site).

## Security Headers

`vercel.json` sets a baseline for every response:

- `Content-Security-Policy` — `default-src 'self'`, image sources allow Cloudinary + iTunes artwork (`*.mzstatic.com`) + iTunes media (`*.apple.com`), audio previews from the same iTunes CDN, styles allow Google Fonts + `'unsafe-inline'` (Vue scoped styles), no frames, no objects.
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Robots-Tag: noindex, nofollow` (private wedding site)

`/assets/*` and `/_app/immutable/*` get `Cache-Control: public, max-age=31536000, immutable`.

## Conventions

- Components use `<script setup>`; ConfirmationForm/SongForm use `lang="ts"`, rest are plain JS
- UI text is in Spanish
- CSS variables defined in `:root` of `style.css`, consumed via `var(--color-*)` in components
- Assets imported via `new URL(..., import.meta.url)` in `wedding.js` (Vite asset handling)

## Footprint Animation Config (`src/composables/useFootprintAnimation.ts`)

Top-level constants control the scroll-driven footprint effect:

| Constant | Default | Effect |
|---|---|---|
| `SCROLL_THRESHOLD` | `80` | px of scroll between each footprint. Higher = more spaced out. |
| `LATERAL_OFFSET` | `35` | px each foot deviates from the path center line (left/right separation). |
| `FADE_SPEED` | `0.002` | opacity lost per animation frame. Lower = slower fade. |
| `INITIAL_OPACITY` | `0.85` | starting opacity of a new footprint. |
| `FOOTPRINT_WIDTH` / `FOOTPRINT_HEIGHT` | `64` / `80` | draw dimensions in px. |

**Path shape** — defined in `buildPath()` as 6 cubic Bézier segments. Each segment has 4 points (`p0`–`p3`):
- `x` is a fraction of viewport width (`vw * 0.25` = 25% from left).
- `y` is a fraction of total document height (`docHeight * 0.50` = middle of page).
- `p0` of segment N must equal `p3` of segment N-1 for continuity.
- `p1` and `p2` are control points that shape the curve.

**Layering**: canvas `z-index: 50`, sections `z-index: 101` (in `style.css`). Footprints render behind all content.
