# Wedding Web

Vue 3 + Vite single-page wedding website.

## Commands

```bash
cd wedding-app
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

## Structure

- `src/components/` - Vue components (AppHeader, HeroSection, LocationSection, etc.)
- `src/data/wedding.js` - Mocked data (date, schedule, photos, location)
- `public/` - Static assets (logo.png, finca.png)

## Google Sheets Integration

Forms submit to [sheet.best](https://sheet.best) API. Replace `YOUR_SHEET_ID_HERE` in `ConfirmationForm.vue` and `SongForm.vue` with actual sheet URL.

## Colors

- Primary/Header: `#5E9286`
- Background: `#F8F5F0`
- White: `#FFFFFF`