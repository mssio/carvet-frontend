# CarVet

CarVet by Team Moneyball estimates vehicle CO2 emissions and fuel consumption. It is built on the Natural Resources Canada (NRCan) Fuel Consumption Ratings dataset (Open Government Licence - Canada). This repo is the React conversion of the static mockup at <https://github.com/mssio/carvet-mockup>.

## Pages

- `/` Home: overview and entry points.
- `/explore` Explore: dataset KPIs, filters and Chart.js charts over the CSV loaded from R2.
- `/predict` Predict: choose a vehicle (or preset), see estimated emissions and running cost. State is shared via the URL hash (`#preset=...&km=...&price=...`).
- `/compare` Compare: pick up to four cars (Year, Make, Model, Variant) and compare CO2, fuel use and cost.

## Tech stack

React 19, React Router 8 (framework mode, `ssr: false`, prerendered), Vite 8, TypeScript 6, Tailwind CSS 4, Chart.js 4 with react-chartjs-2, PapaParse, Fontsource fonts (Inter, JetBrains Mono, Plus Jakarta Sans), React Compiler (Babel 7), Vitest 5, Oxlint, Wrangler 4 (Cloudflare Workers static assets). `isbot` is a dependency because React Router's default `entry.server` uses it during prerender.

## Prerequisites

Node >=22.22 (see `.node-version`).

## Setup

```sh
npm install
npm run dev
```

`npm install` on npm 11 prints install-scripts warnings for esbuild, fsevents and workerd. They are harmless (optionally run `npm install-scripts approve esbuild workerd`).

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | React Router dev server (http://localhost:5173) |
| `npm run build` | Generate route types, typecheck, prerender to `build/client`, create `404.html` |
| `npm run preview` | Build, then serve the result with `wrangler dev` (http://localhost:8787) |
| `npm run deploy` | `wrangler deploy` (used by Cloudflare; do not run casually) |
| `npm run typecheck` | Generate route types and run `tsc -b` |
| `npm run lint` | Oxlint |
| `npm test` | Vitest (node environment) |
| `npm run check:build` | Sanity-check the build output (pages, 404, React Compiler active in route chunks) |

The build prints a chunk-size warning for the lazily loaded `cars.json` chunk on `/compare`. That is expected.

## Project structure

```
app/
  root.tsx, routes.ts, app.css     shell, route table, Tailwind theme tokens
  routes/                          home, explore, predict, compare, not-found (+ tests)
  components/                      shared UI (header, footer, charts, icons)
    explore/ predict/ compare/     page-specific components and pure view logic
  lib/                             pure logic and the data layer (data.ts)
  data/                            generated stats.json and cars.json
public/                            logo and images
scripts/                           convert-mockup-data, postbuild, check-build
docs/cloudflare-deploy.md          owner's deployment checklist
wrangler.jsonc                     Worker config (assets only)
```

## Data sources

- `app/data/stats.json` and `app/data/cars.json` are generated from the mockup by `scripts/convert-mockup-data.mjs` (run with the mockup cloned into `.mockup/`; it also generates `app/components/icons.ts`). Do not hand-edit them.
- Explore loads the full CSV at runtime from R2 (`CSV_URL` in `app/lib/data.ts`).

### Known issue: R2 CORS

The R2 bucket currently sends no CORS headers, so Explore shows its error state (the static KPI cards remain) until a CORS rule is added. See [docs/cloudflare-deploy.md](docs/cloudflare-deploy.md) for the policy to apply.

## Predict data seam

All data access goes through `app/lib/data.ts`. `predict(spec)` is the single place to swap the mockup behaviour (matching example records) for a real prediction API call.

## Deployment

See [docs/cloudflare-deploy.md](docs/cloudflare-deploy.md). Note that `/explore` redirects (307) to `/explore/` on Cloudflare; client navigation is unaffected.

## Roadmap

- Prediction API behind `predict()`.
- 2027 data refresh.
- Regenerating stats from the dataset instead of the mockup.

See also [AGENTS.md](AGENTS.md) for contributor and AI-tool conventions.
