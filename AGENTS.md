# Wedding Web

Vue 3 + Vite single-page wedding website. Deployed to GitHub Pages.

## Commands

```bash
npm run dev      # Dev server
npm run build    # Production build (outputs to ./dist)
npm run preview  # Preview production build locally
```

No linter, formatter, or test suite configured.

## Environment Variables

Forms require these Vite env vars (set in GitHub repo variables/secrets, environment "Sheet"):

| Variable | Type | Used in |
|---|---|---|
| `VITE_CONFIRMATION_SHEET_URL` | var | `ConfirmationForm.vue` - sheet.best endpoint |
| `VITE_CONFIRMATION_API_KEY` | secret | `ConfirmationForm.vue` |
| `VITE_SONG_SHEET_URL` | var | `SongForm.vue` - sheet.best endpoint |
| `VITE_SONG_API_KEY` | secret | `SongForm.vue` |

Local dev: create `.env` with the same keys. Forms will fail silently without them.

## Deploy

Push to `main` triggers GitHub Actions workflow (`.github/workflows/deploy.yml`):
1. `npm ci` → `npm run build` with env vars injected
2. Uploads `./dist` to GitHub Pages

`vite.config.js` sets `base: './'` for relative asset paths (required for GitHub Pages).

## Structure

- `src/App.vue` - Root component, assembles all sections in order
- `src/components/` - 11 Vue SFCs (all page sections + shared FormInput)
- `src/composables/useFootprintAnimation.ts` - Canvas-based scroll animation (TypeScript)
- `src/data/wedding.js` - Single source of truth: date (2027-06-26), schedule, location, photos
- `src/style.css` - Global CSS with CSS custom properties (`--color-primary`, `--color-background`, `--color-white`)
- `public/` - Static assets served as-is

## Conventions

- Components use `<script setup>`; ConfirmationForm/SongForm use `lang="ts"`, rest are plain JS
- UI text is in Spanish
- CSS variables defined in `:root` of `style.css`, consumed via `var(--color-*)` in components
- Assets imported via `new URL(..., import.meta.url)` in `wedding.js` (Vite asset handling)
