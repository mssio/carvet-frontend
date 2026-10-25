# CarVet React Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the static CarVet mockup (4 HTML pages) into a React Router v8 app, prerendered to static files for Cloudflare Workers static assets, with README, AGENTS.md and a Cloudflare setup note.

**Architecture:** React Router v8 framework mode with `ssr: false` + `prerender` for `/`, `/explore`, `/predict`, `/compare`. Output is static HTML in `build/client`, served by an assets-only Worker (no `main`). Pure logic lives in `app/lib/*` (unit-tested with Vitest). All data access goes through `app/lib/data.ts` so the future prediction API only changes that file. Pages are composed from small components in `app/components/`.

**Tech Stack:** React 19.3, React Router 8.5, Vite 8, TypeScript 6, Tailwind CSS 4.3, React Compiler 1.0 (Babel 7), Chart.js 4.6 + react-chartjs-2 5.3, PapaParse 5.7, @fontsource, Wrangler 4.152, Vitest 5, oxlint.

**Spec:** `docs/superpowers/specs/2026-10-25-react-conversion-design.md`. Read it first. It records the decided versions, the verified Vite config and the Predict behaviour.

## Global Constraints

- Versions (save as `^` ranges): `react-router` ^8.5.0, `@react-router/dev` ^8.5.0 (dev), `tailwindcss` ^4.3.3, `@tailwindcss/vite` ^4.3.3, `chart.js` ^4.6.1, `react-chartjs-2` ^5.3.1, `papaparse` ^5.7.0, `@types/papaparse` ^5.5.2 (dev), `@fontsource/inter` ^5.3.0, `@fontsource/jetbrains-mono` ^5.3.0, `@fontsource/plus-jakarta-sans` ^5.3.0, `wrangler` ^4.152.0 (dev), `vitest` ^5.0.5 (dev). Remove `@vitejs/plugin-react`. Keep `react`/`react-dom` ^19.3.1, `vite` ^8.3.4, `typescript` ~6.0.3, `oxlint`, `@babel/core` ^7.29.7, `@rolldown/plugin-babel`, `babel-plugin-react-compiler` ^1.0.0. **No other runtime packages.**
- Stay on Babel 7. Don't upgrade `@babel/core` to 8.
- Node `>=22.22.0` (`engines` in package.json + `.node-version` containing `22`).
- React Compiler is required and must be active in the production build. If it conflicts with `reactRouter()`, stop and report. Don't drop it.
- `ssr: false`: no `action` or `headers` route exports, no server-only code. Follow React Router **v8** docs, not v7 examples.
- No CDN `<script>` or font `<link>`. Everything comes from npm or `public/`.
- Visual and behavioural parity with the mockup (pinned reference: `https://github.com/mssio/carvet-mockup` @ `2d4e53efb27c09553a4ad3f91d1107a08c5f81bf`). The only intended behaviour change is Predict's submit (Task 5).
- Colours via Tailwind theme tokens (`bg-primary`, `text-on-surface-variant`, …), not hex in JSX. Exception: chart series colours, which are copied verbatim from the mockup JS.
- Number formatting locale is `en-CA` everywhere (mockup `CarVet.fmt`). Explore's mockup used the browser locale. Use `en-CA` there too so prerendered and client output agree.
- Page titles: `CarVet · Home`, `CarVet · Explore`, `CarVet · Predict`, `CarVet · Compare`. Meta description copied from the mockup `<head>`.
- The R2 CSV URL is `https://sait-r2.mss.io/carvet/mockup/combined-output.csv`, defined in exactly one place (`app/lib/data.ts`).
- Don't run `npm run deploy` or `wrangler preview` unless the owner asks.

## Review Focus

1. **Direct load of a hash URL** (`/predict#preset=f150&km=15000&price=1.80`): the page shows the F-150 and those inputs with **no hydration warning** in the console. The prerendered HTML can't know the hash, so hash state must be applied after mount. Test: Task 5 Step 1 (`readPredictHash`) plus the Task 5 manual check.
2. **Blank, negative or non-numeric km/fuel price** on Predict and Compare: outputs show `—`, never `NaN`, `$NaN` or `Infinity`. Test: Task 2 `formatMoney`/`toNumber` tests.
3. **Pressing Predict repeatedly, or picking a preset while a prediction is pending:** the most recent action wins, and a stale result never overwrites a newer preset pick. Test: Task 2 `createLatestGuard` test.
4. **The CSV fails to load** (R2 CORS not yet updated for the new origin, or offline): Explore shows an error message in the status line and keeps the static KPI cards. No blank page, no uncaught promise. Test: Task 2 `loadCsv` rejection test plus the Task 7 manual check.
5. **Compare edge cases:** adding a duplicate car, a 5th car, or an incomplete picker selection keeps "Add this car" disabled with the mockup's exact messages, and removing a car re-enables it. Test: Task 2 `compareAddState` test.

---

## File Structure

```
.node-version                     22
.gitignore                        + build/ .react-router/ .wrangler/ .mockup/
package.json                      scripts, engines, deps
vite.config.ts                    tailwindcss(), reactRouter(), babel(react-compiler)
vitest.config.ts                  node environment, include app/**/*.test.ts(x)
react-router.config.ts            ssr:false, prerender list
wrangler.jsonc                    assets-only Worker "carvet"
tsconfig*.json                    adjusted for app/ + .react-router/types
scripts/convert-mockup-data.mjs   one-off: mockup stats.js/cars.js/icons.js -> JSON/TS
scripts/postbuild.mjs             copy __spa-fallback.html -> 404.html
scripts/check-build.mjs           asserts build output (prerender files, compiler, 404)
public/logo.svg, public/img/car-{sedan,suv,pickup,van}.svg
app/root.tsx                      Layout, fonts, css, ErrorBoundary, SiteHeader/SiteFooter
app/routes.ts                     route config
app/app.css                       Tailwind import, @theme tokens, component classes
app/routes/{home,explore,predict,compare,not-found}.tsx
app/components/
  SiteHeader.tsx, SiteFooter.tsx  shell (nav, mobile menu, skip link)
  Icon.tsx, icons.ts              lucide icon set from mockup (icons.ts generated)
  Co2BandChip.tsx                 chip with band label/colour
  PresetButtons.tsx               preset pill buttons (Predict)
  HBarChart.tsx                   SVG horizontal bars (Compare), port of charts.js hbars
  explore/*.tsx                   Explore KPI cards, filters, chart cards
  predict/*.tsx                   form, results, running cost
  compare/*.tsx                   picker, car cards, results
app/lib/
  types.ts                        shared types
  carvet.ts (+ .test.ts)          ported CarVet.* pure helpers
  vehicle-labels.ts (+ .test.ts)  fuelLabel, transLabel, carImage
  explore-stats.ts (+ .test.ts)   mean, by, correlation, linearLine, histogram
  compare-state.ts (+ .test.ts)   compareAddState
  latest-guard.ts (+ .test.ts)    createLatestGuard
  data.ts (+ .test.ts)            stats, loadCars, CSV_URL, loadCsv, predict
app/data/stats.json, app/data/cars.json   converted mockup data (generated, don't hand-edit)
README.md, AGENTS.md, CLAUDE.md, docs/cloudflare-deploy.md
```

Delete: `index.html`, `src/` (whole folder), `public/vite.svg` (and any other scaffold-only assets in `public/`).

---

### Task 1: React Router v8 scaffold, build pipeline and Cloudflare config

**Files:**
- Create: `react-router.config.ts`, `app/root.tsx`, `app/routes.ts`, `app/app.css`, `app/routes/{home,explore,predict,compare,not-found}.tsx` (placeholders), `wrangler.jsonc`, `.node-version`, `vitest.config.ts`, `scripts/postbuild.mjs`, `scripts/check-build.mjs`
- Modify: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `.gitignore`, `.oxlintrc.json` (if it references `src/`)
- Delete: `index.html`, `src/`, `public/vite.svg`

**Interfaces:**
- Produces: route ids/paths `/` → `routes/home.tsx`, `/explore` → `routes/explore.tsx`, `/predict` → `routes/predict.tsx`, `/compare` → `routes/compare.tsx`, `*` → `routes/not-found.tsx`. Each route module exports `meta()` and a default component. `npm run` scripts below. `.mockup/` reference checkout for all later tasks.

- [ ] **Step 1: Check out the mockup reference** (gitignored, used by later tasks)

Run: `git clone https://github.com/mssio/carvet-mockup.git .mockup && git -C .mockup checkout 2d4e53efb27c09553a4ad3f91d1107a08c5f81bf` and add `.mockup/` to `.gitignore`.
Expected: `.mockup/index.html` exists, and `git status` doesn't list `.mockup`.

- [ ] **Step 2: Install and remove packages**

Run: `npm uninstall @vitejs/plugin-react && npm install react-router@^8.5.0 tailwindcss@^4.3.3 @tailwindcss/vite@^4.3.3 chart.js@^4.6.1 react-chartjs-2@^5.3.1 papaparse@^5.7.0 @fontsource/inter@^5.3.0 @fontsource/jetbrains-mono@^5.3.0 @fontsource/plus-jakarta-sans@^5.3.0 && npm install -D @react-router/dev@^8.5.0 @types/papaparse@^5.5.2 wrangler@^4.152.0 vitest@^5.0.5`
Expected: exits 0. Only `install-scripts` warnings (esbuild/fsevents/workerd) and optional-peer notes. No `ERESOLVE`.

- [ ] **Step 3: Write config**

- `vite.config.ts`: exactly the plugin order verified in the spec: `[tailwindcss(), reactRouter(), babel({ include: /\/app\/.*\.[jt]sx?$/, plugins: [["babel-plugin-react-compiler", {}]] })]`.
- `vitest.config.ts`: its own config **without** `reactRouter()` (`environment: "node"`, `include: ["app/**/*.test.{ts,tsx}"]`), so tests don't boot the RR plugin.
- `react-router.config.ts`: `{ ssr: false, prerender: ["/", "/explore", "/predict", "/compare"] }`.
- `app/routes.ts`: the five routes from Interfaces.
- `app/root.tsx`: `Layout` (html `lang="en"`, charset, viewport, `<Meta/>`, `<Links/>`, favicon `<link rel="icon" href="/logo.svg" type="image/svg+xml">`), default `App` rendering `<Outlet/>`, and an `ErrorBoundary`. Import `./app.css` (for now only `@import "tailwindcss";`).
- Placeholder route modules: each `meta()` returns its title from Global Constraints. `not-found.tsx` title is `CarVet · Not found`.
- `wrangler.jsonc`: `{ "name": "carvet", "compatibility_date": "2026-10-01", "assets": { "directory": "./build/client", "not_found_handling": "404-page" } }` with a comment pointing to `docs/cloudflare-deploy.md`.
- `scripts/postbuild.mjs`: copy `build/client/__spa-fallback.html` to `build/client/404.html` (Node `fs`, cross-platform). Cloudflare's `404-page` mode then serves it with status 404, and the client router renders `not-found.tsx`.
- tsconfig: the `app/` include, `rootDirs: [".", "./.react-router/types"]`, `types: ["vite/client"]`. Drop references to `src/`.
- `.gitignore`: add `build/`, `.react-router/`, `.wrangler/`, `.mockup/`.
- `.node-version`: `22`. `package.json`: `"engines": { "node": ">=22.22.0" }`.

- [ ] **Step 4: Set `package.json` scripts**

```json
"dev": "react-router dev",
"build": "react-router typegen && tsc -b && react-router build && node scripts/postbuild.mjs",
"preview": "npm run build && wrangler dev",
"deploy": "wrangler deploy",
"typecheck": "react-router typegen && tsc -b",
"lint": "oxlint",
"test": "vitest run",
"check:build": "node scripts/check-build.mjs"
```

- [ ] **Step 5: Write `scripts/check-build.mjs`** (the build's test). It exits non-zero with a message unless all of these hold:
  - `build/client/index.html`, `build/client/explore/index.html`, `build/client/predict/index.html`, `build/client/compare/index.html` and `build/client/404.html` exist.
  - Each page HTML contains its `<title>` from Global Constraints. The HTML entity or raw `·` are both acceptable.
  - At least one `build/client/assets/*.js` file contains `react.memo_cache_sentinel` (React Compiler active).
  - No HTML file references `cdn.jsdelivr.net` or `fonts.googleapis.com`.
  - `build/server` does not need to exist. Ignore it if present.

- [ ] **Step 6: Run the checks before the build to see them fail**

Run: `npm run check:build`
Expected: FAIL with a message naming the missing `build/client/index.html`.

- [ ] **Step 7: Build and verify**

Run: `npm run build && npm run check:build && npx wrangler deploy --dry-run`
Expected: build prints `Prerender (html): /explore -> build/client/explore/index.html` (and the same for the others). `check:build` prints OK. The dry run reads `build/client` and prints `No bindings found.` and `--dry-run: exiting now.`

- [ ] **Step 8: Check routing on the local Worker**

Run `npx wrangler dev --port 8787` in the background, then:
`curl -s -o /dev/null -w '%{http_code}\n' localhost:8787/explore` → `200` (same for `/explore/`), and `curl -s -o /dev/null -w '%{http_code}\n' localhost:8787/nope` → `404`.
Stop the dev server afterwards.

- [ ] **Step 9: Lint, test, commit**

Run: `npm run lint && npm test -- --passWithNoTests`
Expected: both exit 0.

```bash
git add -A && git commit -m "build: scaffold React Router v8 static app for Cloudflare"
```

---

### Task 2: Data, types and pure helpers

**Files:**
- Create: `scripts/convert-mockup-data.mjs`, `app/data/stats.json`, `app/data/cars.json`, `app/components/icons.ts`, `app/lib/types.ts`, `app/lib/carvet.ts`, `app/lib/vehicle-labels.ts`, `app/lib/explore-stats.ts`, `app/lib/compare-state.ts`, `app/lib/latest-guard.ts`, `app/lib/data.ts`, and a `*.test.ts` next to each lib file
- Create: `public/logo.svg`, `public/img/car-sedan.svg`, `public/img/car-suv.svg`, `public/img/car-pickup.svg`, `public/img/car-van.svg` (copied from `.mockup/assets/img/`)

**Interfaces:**
- Consumes: `.mockup/` from Task 1.
- Produces (`app/lib/types.ts`):
  - `FuelCode = "X" | "Z" | "E" | "D" | "N"`
  - `VehicleRecord { year: number; make: string; model: string; cls: string; engine: number; cyl: number; trans: string; fuel: FuelCode; city: number; hwy: number; comb: number; co2: number }`
  - `VehicleSpec = Pick<VehicleRecord, "year" | "make" | "cls" | "engine" | "cyl" | "trans" | "fuel">`
  - `Preset { id: string; label: string; icon?: string; record: VehicleRecord }`
  - `Stats`: typed shape of `stats.json` (`generated`, `source`, `kpis`, `quality`, `domains`, `hist`, `yearly`, `byClass`, `byFuel`, `byCylinders`, `corr`, `fuelVsCo2`, `scatter`, `rareMakes`, `presets: { predict: Preset[]; compare: unknown[] }`). Type the fields the pages read precisely, and use `unknown` for the rest.
  - `Prediction { co2: number; comb: number; city: number; hwy: number; label: string; source: "preset" | "model" }`
  - `CsvRow`: object keyed by the CSV header names (`"Model year"`, `"Make"`, `"Model"`, `"Vehicle class"`, `"Engine size (L)"`, `"Cylinders"`, `"Transmission"`, `"Fuel type"`, `"City (L/100 km)"`, `"Highway (L/100 km)"`, `"Combined (L/100 km)"`, `"Combined (mpg)"`, `"CO2 emissions (g/km)"`, `"CO2 rating"`, `"Smog rating"`). The numeric columns are `number | null` and the rest are `string`.
  - `Co2BandKey = "low" | "moderate" | "elevated" | "severe"`
- Produces (functions):
  - `carvet.ts`: `toNumber(v: unknown): number | null`, `annualCost(l100: number|null, km: number|null, price: number|null): number | null`, `annualCo2Tonnes(gkm: number|null, km: number|null): number | null`, `co2Band(gkm: number): { key: Co2BandKey; label: string }`, `fmt(n: number|null|undefined, digits?: number): string`, `fmtSigned(n: number|null|undefined, digits?: number): string`, `formatMoney(n: number|null): string` (`"$" + fmt(n)` or `"—"`), `hashParam(hash: string, key: string): string | null`, `pickPreset<T extends { id: string }>(list: T[], hash: string): T`, `compareDeltas(a: VehicleRecord, b: VehicleRecord, km: number|null, price: number|null, years?: number)`, `cumulative(rec: VehicleRecord, km: number|null, price: number|null, years?: number): { year: number; km: number; cost: number; co2T: number }[]`, `vehicleName(r: Pick<VehicleRecord,"year"|"make"|"model">): string` (`"2024 Toyota RAV4 AWD"`)
  - `vehicle-labels.ts`: `FUEL_LABELS: Record<FuelCode, string>`, `fuelLabel(code: string): string`, `transLabel(t: string): string`, `carImage(cls: string): string` (returns `/img/car-*.svg`)
  - `explore-stats.ts`: `mean(values: (number|null)[]): number | null`, `by<T>(rows: T[], key: keyof T): Map<unknown, T[]>`, `sortedNumericKeys(map: Map<unknown, unknown>): unknown[]`, `averageFor<T>(rows: T[], field: keyof T): number | null`, `correlation<T>(rows: T[], xKey: keyof T, yKey: keyof T): number | null`, `linearLine(points: {x:number;y:number}[]): {x:number;y:number}[]`, `histogram(values: (number|null)[], bins?: number): { labels: string[]; counts: number[] }`
  - `compare-state.ts`: `MAX_CARS = 4`, `compareAddState(selected: VehicleRecord[], current: VehicleRecord | null): { disabled: boolean; note: string | null }`
  - `latest-guard.ts`: `createLatestGuard(): { next(): number; isLatest(id: number): boolean }`
  - `data.ts`: `stats: Stats` (static import of `stats.json`), `loadCars(): Promise<VehicleRecord[]>` (dynamic `import("../data/cars.json")`, so it's a separate chunk), `CSV_URL` (constant from Global Constraints), `loadCsv(url?: string): Promise<CsvRow[]>`, `predict(spec: VehicleSpec): Promise<Prediction | null>`, `matchesSpec(r: VehicleRecord, spec: VehicleSpec): boolean`
  - `icons.ts`: `ICONS: Record<IconName, string>` (inner SVG markup) and `type IconName` (union of the 39 names in mockup `icons.js`)

- [ ] **Step 1: Write `scripts/convert-mockup-data.mjs` and run it**

It loads `.mockup/assets/js/stats.js`, `cars.js` and `icons.js` in a `node:vm` context with a `window` object, then writes `app/data/stats.json` (`window.CARVET_STATS`), `app/data/cars.json` (`window.CARVET_CARS`) and `app/components/icons.ts` (`ICONS` map plus `IconName` union, with a header comment: generated from lucide-static 0.460.0 (ISC) via the mockup, don't edit). Copy the 5 SVGs to `public/`.
Run: `node scripts/convert-mockup-data.mjs`
Expected: `stats.json` has `kpis.records === 29215` and `presets.predict.length === 4`. `cars.json` is about 860 KB. `icons.ts` has 39 entries.

- [ ] **Step 2: Write failing tests** (values computed from the mockup implementation)

`app/lib/carvet.test.ts`:
```ts
expect(annualCost(8.5, 20000, 1.65)).toBe(2805);
expect(annualCost(8.5, null, 1.65)).toBeNull();
expect(annualCo2Tonnes(199, 20000)).toBe(3.98);
expect(toNumber("12")).toBe(12);
expect(toNumber(" ")).toBeNull();
expect(toNumber("-1")).toBeNull();
expect(toNumber("abc")).toBeNull();
expect(co2Band(99).key).toBe("low"); expect(co2Band(100).key).toBe("moderate");
expect(co2Band(165).key).toBe("moderate"); expect(co2Band(165.1).key).toBe("elevated");
expect(co2Band(225).key).toBe("elevated"); expect(co2Band(226)).toEqual({ key: "severe", label: "Severe" });
expect(fmt(1234.5, 1)).toBe("1,234.5"); expect(fmt(2805)).toBe("2,805"); expect(fmt(null)).toBe("—"); expect(fmt(NaN)).toBe("—");
expect(fmtSigned(-3)).toBe("−3"); /* U+2212 */ expect(fmtSigned(2.5, 1)).toBe("+2.5"); expect(fmtSigned(0)).toBe("0");
expect(formatMoney(2805)).toBe("$2,805"); expect(formatMoney(null)).toBe("—");
expect(formatMoney(annualCost(8.5, toNumber(""), 1.65))).toBe("—");   // Review Focus 2
expect(hashParam("#preset=f150&km=15000", "km")).toBe("15000");
expect(hashParam("#preset=f150", "km")).toBeNull();
expect(hashParam("#x=%E0%A4%A", "x")).toBeNull();   // bad encoding
expect(pickPreset(presets, "#preset=civic").id).toBe("civic");
expect(pickPreset(presets, "#preset=nope").id).toBe("rav4");
expect(compareDeltas(civic, f150, 20000, 1.65)).toMatchObject({ co2Diff: -122, co2Pct: -43, fuelPct: -43, costDiff: -1716, costDiffTotal: -8580, co2AvoidedT: 2.44, co2AvoidedTotalT: 12.2 });
expect(cumulative(civic, 20000, 1.65, 2)).toEqual([{ year: 1, km: 20000, cost: 2277, co2T: 3.24 }, { year: 2, km: 40000, cost: 4554, co2T: 6.48 }]);
expect(cumulative(civic, null, 1.65)).toEqual([]);
expect(vehicleName(rav4)).toBe("2024 Toyota RAV4 AWD");
```
(`presets`, `rav4`, `civic`, `f150` come from `stats.presets.predict`.)

`app/lib/vehicle-labels.test.ts`: `transLabel("AS8") === "Auto (select shift) 8-spd"`, `transLabel("AV") === "CVT"`, `transLabel("M6") === "Manual 6-spd"`, `transLabel("A10") === "Automatic 10-spd"`. `fuelLabel("Z") === "Premium gasoline"`, `fuelLabel("Q") === "Q"`. `carImage("Pickup truck: Standard") === "/img/car-pickup.svg"`, `carImage("Sport utility vehicle: Small") === "/img/car-suv.svg"`, `carImage("Minivan") === "/img/car-van.svg"`, `carImage("Mid-size") === "/img/car-sedan.svg"`.

`app/lib/explore-stats.test.ts`: `mean([1, null, 3]) === 2`, `mean([]) === null`. `correlation([{x:1,y:2},{x:2,y:4},{x:3,y:6}], "x", "y")` ≈ 1, and `null` with fewer than 2 valid rows. `linearLine([{x:0,y:1},{x:2,y:5}])` equals `[{x:0,y:1},{x:2,y:5}]`, `linearLine([{x:1,y:1}])` equals `[]`. `histogram([5,5,5], 2)` gives `counts` `[0,3]` (degenerate-range widening ±0.5, top value clamps into the last bin). `histogram([0,10], 2)` gives labels `["0–5","5–10"]` and counts `[1,1]`. `histogram([null])` gives `{ labels: [], counts: [] }`.

`app/lib/compare-state.test.ts` (Review Focus 5): no current gives `{ disabled: true, note: null }`. A new car with 1 selected gives `{ disabled: false, note: null }`. A duplicate (same object already selected) gives `{ disabled: true, note: "This car is already added — pick a different model or version." }`. With 4 selected gives `{ disabled: true, note: "You can compare up to 4 cars. Remove one to add another." }` (the full check wins over the duplicate check).

`app/lib/latest-guard.test.ts` (Review Focus 3): `const g = createLatestGuard(); const a = g.next(); const b = g.next(); expect(g.isLatest(a)).toBe(false); expect(g.isLatest(b)).toBe(true);`

`app/lib/data.test.ts`:
- `predict` with `rav4`'s spec resolves to `{ co2: 199, comb: 8.5, city: 9.5, hwy: 7.2, label: "2024 Toyota RAV4 AWD", source: "preset" }`.
- `predict({ ...rav4Spec, engine: 2.6 })` resolves to `null`.
- `matchesSpec` compares engine at 0.1 L precision (`2.5` matches `2.50000001`).
- `loadCsv` (with `vi.mock("papaparse")`): when Papa calls `error(new Error("Failed to fetch"))`, `loadCsv()` rejects with an `Error` whose message contains `Failed to fetch` (Review Focus 4). When `complete` gets `{ data: [{ "Model year": "2024", "Make": " Toyota ", "CO2 emissions (g/km)": "" , ... }], errors: [] }`, it resolves to one row with `"Model year": 2024`, `"Make": "Toyota"`, `"CO2 emissions (g/km)": null`. When `complete` gets `{ data: [], errors: [{…}] }`, it rejects.
- `loadCars()` resolves to an array whose first item has `year`, `make` and `co2`.

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL. The modules don't exist yet.

- [ ] **Step 4: Implement the lib files with the signatures above**

Port the logic from `.mockup/assets/js/app.js` (lines 1–88), `compare.js` (lines 13–31; `carImage` paths change to `/img/…`) and `explore-filters.js` (lines 19–98). Keep the same rounding and labels. `fmt` uses `toLocaleString("en-CA", { minimumFractionDigits: d, maximumFractionDigits: d })`. Explore's own histogram labels use `en-CA` with `maximumFractionDigits: 0`. `loadCsv` wraps `Papa.parse(url, { download: true, header: true, skipEmptyLines: true, dynamicTyping: false })` in a Promise, coerces the numeric columns with the Explore `number` rule (blank → `null`, negatives allowed) and trims strings. `predict` returns `Promise.resolve` of the first `stats.presets.predict` record for which `matchesSpec` is true, mapped to `Prediction`, otherwise `null`. Add the comment `// Phase 2: replace body with a call to the prediction API; keep the signature.`

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test && npm run typecheck`
Expected: all PASS, and tsc exits 0.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add data layer, converted mockup data and tested helpers"
```

---

### Task 3: Theme and site shell

**Files:**
- Modify: `app/app.css`, `app/root.tsx`
- Create: `app/components/SiteHeader.tsx`, `SiteFooter.tsx`, `Icon.tsx`, `Co2BandChip.tsx`, `app/components/shell.test.tsx`

**Interfaces:**
- Consumes: `ICONS`/`IconName` (Task 2), `co2Band` (Task 2).
- Produces: `<Icon name: IconName; className?: string />` (inline `<svg>` with lucide attributes `viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"`, sized `1em` like the mockup's hydrated icons). Check `.mockup/assets/js/icons.js` `hydrate` for the exact attributes. `<Co2BandChip gkm: number />` renders `<span class="chip chip-{key}">{label}</span>`. `<SiteHeader />`, `<SiteFooter />`. Theme utility and class names listed below.

- [ ] **Step 1: Write failing tests** in `app/components/shell.test.tsx` (use `renderToString` from `react-dom/server`, no extra packages):
  - `renderToString(<MemoryRouter initialEntries={["/predict"]}><SiteHeader/></MemoryRouter>)` contains `aria-current="page"` exactly twice (desktop and mobile nav), both on the `/predict` links, and contains `aria-controls="mobileNav"` and `aria-expanded="false"`.
  - `renderToString(<Icon name="car" />)` contains `<svg` and `stroke="currentColor"`.
  - `renderToString(<Co2BandChip gkm={199} />)` contains `chip-elevated` and `Elevated`.

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- shell`
Expected: FAIL (modules missing).

- [ ] **Step 3: Rebuild the theme in `app/app.css`** from `.mockup/assets/carvet.css` (Tailwind v3.4.19 output):
  - `@theme` colours (rgb values from the compiled CSS): `primary` 13 99 27, `primary-container` 46 125 50, `on-primary` 255 255 255, `on-primary-container` 203 255 194, `secondary-container` 104 250 221, `on-secondary-container` 0 114 97, `error` 186 26 26, `surface-container` 229 238 255, `surface-container-low` 239 244 255, `inverse-surface` 33 49 69, `on-surface` 11 28 48, `on-surface-variant` 64 73 61, `tertiary` 75 86 106, `band-low` 22 163 74, `band-moderate` 234 179 8, `band-elevated` 249 115 22, `band-severe` 220 38 38. Grep the compiled CSS for any other custom colour the HTML uses (e.g. `secondary`, used by `ring-secondary`, and `surface`, `outline`) and add it.
  - Font families: `headline` = Plus Jakarta Sans, `body`/`label`/`title` = Inter, `code` = JetBrains Mono (each with the mockup's fallbacks). Map every `font-*` class the mockup HTML uses (`font-headline-lg`, `font-body-md`, `font-label-md`, …) to the matching family.
  - Text sizes, as `--text-*` with line-height, letter-spacing and weight: `display-mobile` 32/40 −.025em 800, `headline-xl-mobile` 26/34 −.02em 700, `headline-lg` 28/36 −.02em 700, `headline-md` 22/28 −.015em 600, `headline-sm` 18/24 −.01em 600, `title` 16/24 −.005em 600, `body-lg` 16/26 400, `body-md` 14/22 400, `body-sm` 13, `label-md` 12/16 .02em 600, `label-sm` 11/14 .03em 500, `code` 12/18 400. Also grep for custom spacing such as `py-space-lg` and port it.
  - Component classes in `@layer components`: `card`, `chip`, `eyebrow`, `chip-low|moderate|elevated|severe`, `btn-primary`, `btn-secondary`, `nav-link` (including `[aria-current=page]` and `:hover`). Copy the exact values from `.mockup/assets/carvet.css` (grep `\.card\{`, `\.chip`, `\.btn-primary`, `\.nav-link`).
  - Restore the Tailwind v3 defaults the markup relies on, using the values in the preflight at the top of `.mockup/assets/carvet.css`: the default border colour (v4 uses `currentColor`), `button { cursor: pointer }` and the placeholder colour. Mirror any other preflight default that v4 changed.
  - Import the fonts in `root.tsx`: `@fontsource/inter/{400,500,600,700}.css`, `@fontsource/jetbrains-mono/{400,600}.css`, `@fontsource/plus-jakarta-sans/{600,700,800}.css`.

- [ ] **Step 4: Implement the shell components** by translating `.mockup/index.html`'s header/footer markup (between `<!-- SHELL:HEADER -->` comments, and the footer) to JSX with identical classes. Use `NavLink` with `end` for `/` (React Router sets `aria-current="page"`). The mobile menu toggle is local state: it toggles `hidden` and `aria-expanded`, and closes on navigation. The "Skip to content" link targets `#main`. `root.tsx` renders `<SiteHeader/>`, `<main id="main" …>` with the mockup's main classes, `<Outlet/>` and `<SiteFooter/>`. `body` gets the mockup `<body>` classes.

- [ ] **Step 5: Run tests and build**

Run: `npm test && npm run build && npm run check:build`
Expected: PASS.

- [ ] **Step 6: Visual check**

Run `npm run dev`, then open `/` beside `.mockup/index.html` (served with `npx serve .mockup` or by opening the file directly) at 1280px and 375px widths. The header, nav active state, mobile menu, footer, fonts and colours match.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: port CarVet theme and site shell"
```

---

### Task 4: Home page

**Files:**
- Modify: `app/routes/home.tsx`
- Create: `app/routes/home.test.tsx`

**Interfaces:**
- Consumes: `stats`, `vehicleName`, `fmt`, `formatMoney`, `annualCost`, `Co2BandChip`, `Icon`.

- [ ] **Step 1: Write a failing test.** `renderToString(<MemoryRouter><Home/></MemoryRouter>)` contains `29,215`, `2024 Toyota RAV4 AWD`, `Sport utility vehicle: Small · 2.5 L · 4 cyl · AS8 · fuel X`, `199`, `8.5`, `$2,805`, `0.8–8.4 L`, and links to `/predict`, `/explore` and `/compare`.

- [ ] **Step 2: Run it.** `npm test -- home` → FAIL.

- [ ] **Step 3: Implement.** Translate `.mockup/index.html`'s `<main>` sections (Hero, What CarVet helps you do, Seven input features, About the model, Interactive Action Banner) to JSX with identical classes and copy. Fill the dynamic slots the way `CarVet.pages.home` does (`app.js` lines 301–314): `heroRecords`, `exVehicle`, `exClass`, `exCo2` + band chip, `exFuel`, `exCost` (20000 km, $1.65/L), `featMakes`, `featClasses`, `featTrans`, `featEngine`. Internal links become `<Link to="/explore">` etc.

- [ ] **Step 4: Verify.** `npm test && npm run build && npm run check:build`, then compare visually with `.mockup/index.html` at 1280px and 375px.

- [ ] **Step 5: Commit.** `git add -A && git commit -m "feat: port Home page"`

---

### Task 5: Predict page (wired to `predict()`)

**Files:**
- Modify: `app/routes/predict.tsx`
- Create: `app/components/PresetButtons.tsx`, `app/components/predict/{VehicleForm,ResultsPanel,RunningCost}.tsx`, `app/components/predict/predict-hash.ts` (+ `predict-hash.test.ts`)

**Interfaces:**
- Consumes: `stats`, `predict`, `VehicleSpec`, `Prediction`, `Preset`, `createLatestGuard`, `pickPreset`, `hashParam`, `toNumber`, `annualCost`, `annualCo2Tonnes`, `fmt`, `formatMoney`, `vehicleName`, `Co2BandChip`, `Icon`.
- Produces: `readPredictHash(hash: string, presets: Preset[]): { preset: Preset; km: string | null; price: string | null }`. `<PresetButtons presets: Preset[]; activeId: string | null; onPick(id: string): void />`.

**Behaviour (from the spec, decided with the owner):**
- Results state is a discriminated union: `{ kind: "result"; prediction: Prediction } | { kind: "pending" } | { kind: "empty" } | { kind: "error"; message: string }`.
- First render (prerendered) uses `presets[0]` (RAV4), km `20000` and price `1.65`. After mount, a `useEffect` applies `readPredictHash(location.hash, …)`. This avoids a hydration mismatch (Review Focus 1). Don't read `window` during render.
- Picking a preset fills the form and shows that preset's record as a result (no `predict` call). The active button is highlighted.
- Submit: `guard.next()`, set `pending`, `await predict(spec)`, and apply the result only if `guard.isLatest(id)`. Picking a preset also calls `guard.next()`, so a pending prediction can't overwrite it (Review Focus 3). A result shows the prediction. `null` gives `empty` with the copy **"No estimate available yet for this vehicle."**. A thrown error gives `error` with **"Something went wrong while estimating. Please try again."**. Then scroll `#resultsPanel` into view (`behavior: "smooth", block: "start"`). The active preset highlight clears as soon as any form field is edited.
- While pending: the submit button is disabled and its label is `Estimating…`. Results keep the previous values dimmed (`opacity-60`) and set `aria-busy="true"`.
- Running cost uses the current result's `comb`/`co2`. With an empty, error or pending state, the three outputs show `—`.
- The form is fully controlled. Year range and select stay in sync. Option lists come from `stats.domains`, built exactly as `CarVet.fillVehicleForm` does (`app.js` lines 116–145: years descending, fuel labels `"X — Regular gasoline"`, and cylinders as radio pills with the same classes).
- Copy all static text (hero, the "Try an example" label, the band-scale legend, the disclaimer "Estimate, not an official NRCan rating.", and the "About these estimates" section) from `.mockup/predict.html`.

- [ ] **Step 1: Write failing tests** in `predict-hash.test.ts`: `readPredictHash("", presets)` gives `{ preset: rav4, km: null, price: null }`. `readPredictHash("#preset=f150&km=15000&price=1.80", presets)` gives `{ preset: f150, km: "15000", price: "1.80" }`. `readPredictHash("#preset=bogus", presets).preset.id === "rav4"`.

- [ ] **Step 2: Run it.** `npm test -- predict-hash` → FAIL.

- [ ] **Step 3: Implement** `readPredictHash`, the components and the page as described above, translating `.mockup/predict.html` markup with identical classes.

- [ ] **Step 4: Run tests and build.** `npm test && npm run build && npm run check:build` → PASS.

- [ ] **Step 5: Manual checks** (`npm run preview`, then open the Wrangler URL):
  - Open `/predict#preset=f150&km=15000&price=1.80` directly: the F-150 and inputs 15000 and 1.80 are shown, there are **no** hydration warnings in the console, and the annual fuel cost shows `$3,267` (12.1 × 15000 / 100 × 1.80).
  - Click Civic, change nothing, and press Predict: the same Civic numbers appear (source preset).
  - Change engine to 2.6 and press Predict: "No estimate available yet for this vehicle." appears and the running-cost outputs show `—`.
  - Clear km: the running-cost outputs show `—`, never `NaN`.
  - Compare the layout with `.mockup/predict.html` at 1280px and 375px.

- [ ] **Step 6: Commit.** `git add -A && git commit -m "feat: port Predict page wired to predict()"`

---

### Task 6: Compare page

**Files:**
- Modify: `app/routes/compare.tsx`
- Create: `app/components/HBarChart.tsx` (+ `HBarChart.test.tsx`), `app/components/compare/{CarPicker,CarCards,CompareResults}.tsx`

**Interfaces:**
- Consumes: `loadCars`, `compareAddState`, `MAX_CARS`, `fuelLabel`, `transLabel`, `carImage`, `toNumber`, `annualCost`, `annualCo2Tonnes`, `fmt`, `fmtSigned`, `formatMoney`, `vehicleName`, `Icon`.
- Produces: `<HBarChart unit: string; items: { label: string; value: number; color: string }[] />`, an SVG port of `hbars` in `.mockup/assets/js/charts.js` (lines 135–146, plus the `svgOpen`/`esc` helpers it uses). React escapes text, so `esc` isn't needed.

**Behaviour:** port the live `.mockup/assets/js/compare.js` only (not `CarVet.pages.compare` in `app.js`). No URL state. `loadCars()` runs in a `useEffect`. Until it resolves, the pickers are disabled and show `Loading cars…`. The prerendered HTML shows the page chrome plus the empty-state card. The pickers cascade Year (descending) → Make → Model → Variant. "Add this car" uses `compareAddState` for `disabled` and the note. After adding, the picker resets to blank. Series colours are `['#2e7d32', '#ba1a1a', '#1d4ed8', '#b45309']` by selection index. The km/year and fuel price inputs feed the result calculations. Copy all markup, classes and copy (empty state "No cars yet — use the selector above to add your first car.", verdict text, card layout) from `.mockup/compare.html` and `compare.js` `render()`.

- [ ] **Step 1: Write a failing test.** `renderToString(<HBarChart unit="g/km" items={[{label:"A",value:200,color:"#2e7d32"},{label:"B",value:100,color:"#ba1a1a"}]} />)` contains `<svg`, both labels, `fill="#2e7d32"` and `200`. The bar for A is twice the width of B's (assert the two `width` attributes parse to a 2:1 ratio).

- [ ] **Step 2: Run it.** `npm test -- HBarChart` → FAIL.

- [ ] **Step 3: Implement** the chart, the components and the page.

- [ ] **Step 4: Verify.** `npm test && npm run build && npm run check:build` → PASS. Confirm the network tab on `/` doesn't load the `cars` chunk, and that `/compare` does.

- [ ] **Step 5: Manual checks:** add 4 cars and see the "up to 4" note. Re-select an added car and see the duplicate note. Remove one and Add re-enables. Blank fuel price gives `—` in the cost cells. Compare with `.mockup/compare.html` at 1280px and 375px.

- [ ] **Step 6: Commit.** `git add -A && git commit -m "feat: port Compare page"`

---

### Task 7: Explore page

**Files:**
- Modify: `app/routes/explore.tsx`
- Create: `app/components/explore/{KpiCards,ExploreFilters,ChartCard,ExploreCharts,DataDictionary}.tsx`, `app/components/explore/chart-setup.ts`

**Interfaces:**
- Consumes: `stats`, `loadCsv`, `CSV_URL`, `CsvRow`, `FUEL_LABELS`, `mean`, `by`, `sortedNumericKeys`, `averageFor`, `correlation`, `linearLine`, `histogram`, `fmt`.
- Produces: `chart-setup.ts` registers the Chart.js controllers, elements, scales and plugins that the mockup configs use (bar, line, scatter, linear/category scales, tooltip, legend), once.

**Behaviour:** port `.mockup/assets/js/explore-filters.js` and `CarVet.pages.explore` (`app.js` lines 278–299).
- The static KPI cards and data-quality numbers render from `stats` (prerendered).
- On mount, call `loadCsv()`. While it loads, the status line says `Loading the attached CSV dataset…`. If it rejects, the status line says `The vehicle dataset could not be loaded. Check your connection and try again.`, the charts grid is hidden and the KPI cards stay (Review Focus 4). Log the error with `console.error`.
- After the load, the fuel and class filters (options from the data) and Reset drive `filteredRows`. KPIs, `resultsSummary`, `activeFilterSummary`, the chart titles and eyebrows, visible chart cards, the empty state and the "Only one matching record…" note behave exactly like `render()` (lines 597–650), `renderOverview` (lines 212–456) and `renderFiltered` (lines 457–596). Chart titles and eyebrows become derived props, not DOM mutation.
- Each chart is a `react-chartjs-2` component (`Bar`, `Line`, `Scatter`, or `Chart` for mixed bar+line) whose `options`/`data` are copied from the mockup's `chart(id, config)` calls, including the `COLORS` constants. Chart components render client-only (inside the loaded state), so prerender never touches canvas.

- [ ] **Step 1: Write a failing test.** `renderToString(<MemoryRouter><Explore/></MemoryRouter>)` contains `29,215`, the static KPI values, `Loading the attached CSV dataset…`, and no `<canvas`.

- [ ] **Step 2: Run it.** `npm test -- explore` → FAIL.

- [ ] **Step 3: Implement** the components and the page.

- [ ] **Step 4: Verify.** `npm test && npm run build && npm run check:build` → PASS.

- [ ] **Step 5: Manual checks** (`npm run dev`, from `localhost`): the CSV loads (if R2 CORS blocks `localhost`, note it for the owner and check the error state instead). Overview charts match `.mockup/explore.html`. Fuel only, class only, both, and an empty combination each behave like the mockup. Reset works. To test the error path, set `CSV_URL` to a bad URL temporarily and see the error status with KPIs intact. Compare at 1280px and 375px.

- [ ] **Step 6: Commit.** `git add -A && git commit -m "feat: port Explore page with Chart.js"`

---

### Task 8: Documentation

**Files:**
- Create/replace: `README.md`, `AGENTS.md`, `CLAUDE.md`, `docs/cloudflare-deploy.md`

- [ ] **Step 1: `docs/cloudflare-deploy.md`.** The owner's checklist, in order:
  1. Push the branch or merge to `main` on GitHub.
  2. In the Cloudflare dashboard, go to Workers & Pages → Create → **Import a repository** (not the template flow that creates a new repo). Select the repo.
  3. Leave the defaults: Build `npm run build`, Deploy `npm run deploy`, Preview `npx wrangler preview`. Explain what each does (build every push, deploy on `main`, preview for other branches).
  4. Settings → Builds → enable **Builds for Preview branches** to get per-branch preview URLs.
  5. Node version: the repo's `.node-version` (22) is used. React Router 8 needs Node ≥22.22.
  6. Optional: add a custom domain (Settings → Domains & Routes).
  7. **R2 CORS:** add the production URL (`https://carvet.<account>.workers.dev` or the custom domain), the preview URL pattern, and `http://localhost:5173` / `http://localhost:8787` to the `sait-r2.mss.io` bucket's CORS `AllowedOrigins` (method `GET`), or Explore can't load the CSV.
  8. Manual deploy from a laptop: `npx wrangler login`, then `npm run build && npm run deploy`.
  9. The Worker is assets-only (no server code, no bindings), and `wrangler.jsonc` is the config source.

- [ ] **Step 2: `README.md`.** What CarVet is (Team Moneyball; NRCan Fuel Consumption Ratings, Open Government Licence – Canada), the four pages, tech stack with versions, prerequisites (Node ≥22.22), setup (`npm install`, `npm run dev`), a scripts table (all scripts from Task 1), the npm 11 `install-scripts` warning (harmless; optional `npm install-scripts approve esbuild workerd`), project structure (from this plan's File Structure), data sources (`stats.json`/`cars.json` generated from the mockup by `scripts/convert-mockup-data.mjs`, R2 CSV), the Predict data seam (`app/lib/data.ts#predict`), deployment (link to `docs/cloudflare-deploy.md`), and the roadmap (prediction API, 2027 data refresh, regenerating stats).

- [ ] **Step 3: `AGENTS.md`.** Tool-agnostic, using plain headings, no tool-specific syntax:
  - Overview and the static-only constraint.
  - Commands: install, dev, build, test, lint, typecheck, check:build, preview.
  - Layout.
  - Conventions: theme tokens not hex; data only via `app/lib/data.ts`; `app/data/*.json` and `app/components/icons.ts` are generated, so don't hand-edit them; `en-CA` formatting; no `window` access during render (prerender and hydration); no `action`/`headers` exports; React Compiler is on, so don't hand-add `useMemo`/`useCallback` for performance; Babel stays on 7; follow React Router v8 docs.
  - Verification before claiming done: `npm run lint && npm run typecheck && npm test && npm run build && npm run check:build`, plus a visual comparison against the mockup reference (clone command from Task 1 Step 1).
  - Don't run `npm run deploy`.
- [ ] `CLAUDE.md` contains only `@AGENTS.md` (Claude Code import syntax) plus one line saying AGENTS.md is the source of truth.

- [ ] **Step 4: Verify** that every command named in README and AGENTS.md exists in `package.json` (`node -e` one-liner, or by eye), and that the links resolve.

- [ ] **Step 5: Commit.** `git add -A && git commit -m "docs: add README, AGENTS.md and Cloudflare deploy guide"`

---

### Task 9: Final verification

- [ ] **Step 1:** Run `npm ci && npm run lint && npm run typecheck && npm test && npm run build && npm run check:build && npx wrangler deploy --dry-run`. All must exit 0.
- [ ] **Step 2:** Run `npm run preview` and walk through all four pages and an unknown URL (404 page with status 404) at 1280px and 375px against `.mockup/*.html`. List any visual differences you couldn't resolve in the final report.
- [ ] **Step 3:** Run `grep -rn "cdn.jsdelivr\|fonts.googleapis" app public` → no matches.
- [ ] **Step 4:** Report to the owner: what was built, anything that deviates from the mockup, the R2 CORS reminder, and that nothing was deployed.
