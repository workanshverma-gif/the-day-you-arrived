# The Day You Arrived

Enter a birthday (1950 to today) and optionally a birth city to see the moon, the weather, the #1 song,
the news, prices then vs. now, and more from the day you were born. Compare two birthdays, and save
1080×1920 Story cards for Instagram.

Free to run: no database, no accounts, **no environment variables or API keys**.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Deploy (Vercel, free tier)

Import the repo on Vercel and deploy with the defaults. Nothing needs configuring: share-image URLs
pick up the deployment domain from variables Vercel sets automatically.

## Data sources

| What | Source |
| --- | --- |
| Weather on the day | Open-Meteo archive + geocoding (browser, no key) |
| News and birthday twin | Wikipedia "On this day" REST feed (browser, no key) |
| Song preview and artwork | iTunes Search API, proxied by `/api/song-preview` |
| #1 songs | Billboard Hot 100 archive, bundled as `src/data/top-songs.json` |
| Prices, markets, population, birthday ranks | Bundled in `src/data/` (approximate; see below) |

`npm run data:songs` refreshes the Billboard file; `npm run data:build` regenerates the economy,
population and birthday-rank files from `scripts/build-data.mjs`.

## Accuracy notes

Economic series are annual averages entered from published figures and interpolated between anchor
years, with 2025-26 values marked as estimates. Birthday popularity is modeled from the seasonal shape of
published US birth counts. Treat both as approximate.
