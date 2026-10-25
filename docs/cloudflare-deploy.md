# Deploying CarVet to Cloudflare

CarVet is a static site served by a Cloudflare Worker that only serves static assets (no server code, no bindings). `wrangler.jsonc` is the config source: it serves `./build/client` and uses the `404-page` mode (`/404.html`, produced by `scripts/postbuild.mjs`).

## Do this first: R2 CORS (Explore is broken without it)

Confirmed today: the R2 bucket behind `https://sait-r2.mss.io` sends **no CORS headers** for any origin, including localhost. Until the bucket owner adds a CORS rule, the Explore page cannot load its CSV and shows an error message in the status line (the static KPI cards still render). Home, Predict and Compare are unaffected.

Where: Cloudflare dashboard -> R2 -> the `sait-r2.mss.io` bucket -> Settings -> CORS policy -> add rule. Example policy (replace the placeholders; add each preview URL pattern or custom domain you use):

```json
[
  {
    "AllowedOrigins": [
      "https://carvet.<account>.workers.dev",
      "http://localhost:5173",
      "http://localhost:8787"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

Use your real production URL (the `workers.dev` URL or your custom domain). Preview branches get their own `*.workers.dev` hostnames; add those you want working. Then reload `/explore` and check the browser console for CORS errors.

## Checklist

1. Push the branch, or merge it to `main`, on GitHub.
2. Cloudflare dashboard -> Workers & Pages -> Create -> **Import a repository** (not the template flow that creates a new repo). Select the repo.
3. Keep the default commands:
   - Build: `npm run build`. Runs on every push (type generation, typecheck, prerender, copies the 404 page).
   - Deploy: `npm run deploy` (`wrangler deploy`). Runs for pushes to `main` (production).
   - Preview: `npx wrangler preview`. Runs for other branches.
4. Settings -> Builds -> enable **Builds for Preview branches** to get per-branch preview URLs.
5. Node version: Cloudflare uses the repo's `.node-version` (`22`). React Router 8 needs Node >=22.22.
6. Optional: add a custom domain (Settings -> Domains & Routes).
7. **R2 CORS**: see the section above. Do it before judging the deployment.
8. Manual deploy from a laptop: `npx wrangler login`, then `npm run build && npm run deploy`.
9. The Worker is assets-only; there is nothing to configure beyond `wrangler.jsonc`.

## Things you may notice

- `/explore` answers `307` to `/explore/` on Cloudflare (default trailing-slash handling for prerendered `folder/index.html` files). Client-side navigation is unaffected.
- Unknown URLs get the `404.html` shell with status 404; the client router renders the not-found page.
- `npm install` on npm 11 prints "install scripts" warnings for esbuild, fsevents and workerd. Harmless.
- `npm run build` prints a Vite chunk-size warning for the lazily loaded `cars.json` chunk used by `/compare`. Expected.
