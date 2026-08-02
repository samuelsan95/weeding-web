# Wedding Web

Vue 3 + Vite single-page wedding website. Deployed to **Vercel** (static build + a serverless function at `/api/search` for the iTunes song-search proxy).

## Commands

```bash
npm run dev      # Dev server
npm run build    # Production build (outputs to ./dist)
npm run preview  # Preview production build locally
```

No linter, formatter, or test suite configured.

## Environment Variables

All env vars are set in the **Vercel project** (*Settings → Environment Variables*). For local dev, create `.env` with the same keys.

| Variable | Type | Used in |
|---|---|---|
| `VITE_CONFIRMATION_SHEET_URL` | var | `ConfirmationForm.vue` - Google Apps Script Web App `/exec` URL (confirmations sheet) |
| `VITE_CONFIRMATION_TOKEN` | secret | `ConfirmationForm.vue` - token validated by the Apps Script `doPost` |
| `VITE_SONG_SHEET_URL` | var | `SongForm.vue` - Google Apps Script Web App `/exec` URL (songs sheet) |
| `VITE_SONG_TOKEN` | secret | `SongForm.vue` - token validated by the Apps Script `doPost` |
| `VITE_SONG_PROXY_URL` | var | `useSongSearch.ts` - URL of the `/api/search` function on the same Vercel project (e.g. `https://wedding-app.vercel.app/api/search`) |
| `VITE_CLOUDINARY_CLOUD_NAME` | var | `wedding.js` - Cloudinary cloud name for the photos gallery (free tier at cloudinary.com) |

Forms will fail silently without them.

## Deploy

Push to `main` triggers a Vercel build automatically:
1. `npm ci` → `npm run build` (env vars injected at build time)
2. Static assets served from the project domain
3. `api/search.js` is deployed as a serverless function at `/api/search`

## Structure

- `src/App.vue` - Root component, assembles all sections in order
- `src/components/` - 11 Vue SFCs (all page sections + shared FormInput)
- `src/composables/useFootprintAnimation.ts` - Canvas-based scroll animation (TypeScript)
- `src/composables/useSongSearch.ts` - Debounced song autocomplete via iTunes Search API (proxied through the Vercel function at `/api/search`, see below)
- `src/data/wedding.js` - Single source of truth: date (2027-06-26), schedule, location, photos (Cloudinary URLs)
- `src/style.css` - Global CSS with CSS custom properties (`--color-primary`, `--color-background`, `--color-white`)
- `api/search.js` - Vercel serverless function (iTunes Search CORS proxy)
- `public/` - Static assets served as-is (gitignored; populated by Vite plugin at build time)

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
- Sheet payload: **one row per song** (1–3 rows per submission). Each row has `Timestamp`, `Cancion` (formatted as `Track — Artist`), `Artista`, `Album`, `TrackId` (iTunes ID), `Quien`. The `Dedicatoria` is sent only on the first row of a submission (the rest get `''`). The whole submission is sent with `Promise.allSettled` so a partial failure reports how many of N got through.
- Keyboard (per picker): `↓`/`↑` navigate, `Enter` selects, `Esc` closes, `mousedown` (not `click`) so the option picks before the dropdown unmounts. Each picker listens for outside `mousedown` (capture phase) to close its own dropdown. Tracks without a preview show `Sin preview` instead of a play button (rare with iTunes).
- iTunes returns `artworkUrl100`; the composable swaps the suffix to `300x300bb` for a sharper thumbnail.

## Song Search API (`api/search.js`)

The browser **cannot** call `itunes.apple.com` directly: on mobile the response redirects to the custom scheme `musics://` (to open Apple Music), which the browser blocks. This Vercel serverless function bridges it with a server-to-server fetch (non-mobile User-Agent) and adds the CORS headers the browser requires.

- **No setup**: Vercel auto-detects `api/*.js` as functions. Just commit the file; deploy handles the rest.
- **No secrets**: iTunes is public, no keys.
- **Edge cache**: `Cache-Control: s-maxage=600` makes Vercel cache identical queries for 10 min, so repeat searches (and tests) don't re-hit iTunes.
- **Free tier**: Vercel's free plan is more than enough for a wedding (100 GB-hours/month).

Set `VITE_SONG_PROXY_URL` to the function URL: `https://<your-project>.vercel.app/api/search` (same domain as the site).

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
