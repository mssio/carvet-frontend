# AGENTS.md

Guidance for AI coding tools and contributors. This file is the source of truth.

## Overview

CarVet is a React Router 8 app (`ssr: false`) prerendered to static files and served by a Cloudflare Worker with static assets. It is static-only: no server code, no `action` or `headers` route exports, no bindings.

## Commands

- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Test: `npm test`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Check build output: `npm run check:build`
- Preview built site locally: `npm run preview`

## Layout

- `app/routes/` route modules; `app/components/` UI, with `explore/`, `predict/`, `compare/` subfolders
- `app/lib/` pure logic and the data layer (`data.ts`)
- `app/data/` generated JSON; `scripts/` build helpers; `docs/` deploy guide

## Conventions

- Use Tailwind theme tokens (`bg-primary`, `text-on-surface-variant`), not hex colours in JSX. Exception: chart series colours copied from the mockup.
- All data access goes through `app/lib/data.ts` (including the R2 CSV URL and `predict()`).
- Generated files: do not hand-edit `app/data/stats.json`, `app/data/cars.json`, `app/components/icons.ts`. Regenerate with `node scripts/convert-mockup-data.mjs` from `.mockup/`.
- Format numbers with the `en-CA` locale everywhere, so prerendered and client output agree.
- Do not touch `window`/`document` during render (prerender and hydration). Apply browser-only state after mount.
- React Compiler is on: do not add `useMemo`/`useCallback` for performance. Babel stays on 7.
- Follow React Router v8 docs, not v7 examples.
- No CDN scripts or font links; everything comes from npm or `public/`.

### Mockup parity

- Reference: https://github.com/mssio/carvet-mockup at commit `2d4e53efb27c09553a4ad3f91d1107a08c5f81bf`. Clone it into `.mockup/` (gitignored).
- The parity target is the mockup as rendered. Class names with no rule in its compiled CSS were no-ops and were dropped in the port.
- Header nav is centred only on `/`; the Data-source strip appears only on `/compare`.
- The one intentional difference is Predict's submit, which calls `predict()` in `app/lib/data.ts`.

### Tests

- Vitest, node environment. Component tests use `renderToString` and strip `<!-- -->` before asserting text.
- Keep logic pure and unit-tested: in `app/lib/*`, and in `app/components/**/*-view.ts` files and reducers.

## Verification before claiming done

Run `npm run lint && npm run typecheck && npm test && npm run build && npm run check:build`, then compare visually against the mockup reference.

## Do not

- Run `npm run deploy` (Cloudflare does this); see `docs/cloudflare-deploy.md`.
