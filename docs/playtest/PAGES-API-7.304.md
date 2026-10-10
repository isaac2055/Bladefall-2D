# Pages leaderboard API — 7.304

Prepared locally; not activated or deployed. At preparation, Wrangler was signed out and the public Pages site had no working `/api/playtest` backend. The game/APK can publish independently; shared leaderboard submission still needs the activation below. Local scores and queued submissions remain useful meanwhile.

The request path is `bladefall2d.pages.dev/api/playtest` → Pages Function → `PLAYTEST_API` service binding → existing `bladefall-2d` Worker → `PLAYTEST` SQLite Durable Object. The new API-only entry reuses `cloudflare/worker.js` and `server/playtest-service.mjs`; it does not copy game assets or create another storage implementation. The Worker name, class `PlaytestStore`, migration `v1`, and named object `playtest-v1` stay stable so an existing deployment's data is retained.

Cloudflare requires Durable Objects to live in a Worker, while Pages Functions can call Workers through service bindings. Requests remain on Cloudflare's internal network. [Pages bindings](https://developers.cloudflare.com/pages/functions/bindings/), [Pages configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/).

## Files and deployment boundary

- `wrangler.api.jsonc`: API-only Worker; public workers.dev and preview URLs disabled.
- `functions/api/playtest.js`, `functions/api/feedback-export.js`: forward the original request, preserving URL, origin, body and authorization.
- `cloudflare/pages-api.mjs`: missing bindings return JSON 503; no unauthenticated relay or HTML fallback.
- `public/_routes.json`: only the two API paths invoke Functions; game files and APK remain static. This hosting file does not need to be inside the APK. [Functions routing](https://developers.cloudflare.com/pages/functions/routing/).
- `scripts/playtest-release/pages-api-binding.json`: proposed production binding; preview services explicitly empty so preview playtests cannot write production records.
- `npm run activate:api`: merges that binding into `wrangler.jsonc`. It changes a local file only and refuses to overwrite unexpected configuration. **Run only after the Worker exists in the same Cloudflare account.**

The active Pages configuration is deliberately unchanged until that deployment succeeds. Before activation, API requests receive `503 {"error":"api-not-connected"}`. Legacy `wrangler.worker.jsonc` and `npm run deploy` remain available for compatibility, but the API service uses `npm run deploy:api`.

## Activate when account access is available

From the repository root, sign into the account that owns Pages project `bladefall2d`. This needs Pages deployment access and Worker/Durable Object deployment access. Never put tokens into a tracked file or command transcript.

```sh
npx wrangler login
npx wrangler whoami
npx wrangler pages project list
npm run verify:api
npm run deploy:api
```

Confirm that `bladefall-2d` deployed successfully in the Pages account. Then stage the Pages production binding:

```sh
npm run activate:api
npm run build
```

Commit and push the binding through the existing Git-connected Pages deployment. Confirm the production build is for `main` and publishes `public/`. If a manual deployment is specifically needed instead of the normal Git deploy:

```sh
npx wrangler pages deploy public --project-name bladefall2d --branch main
```

The optional private feedback export is disabled with 404 until a secret is configured. Set it interactively when needed:

```sh
npx wrangler secret put FEEDBACK_EXPORT_TOKEN --config wrangler.api.jsonc
```

The export endpoint then requires its existing bearer token and otherwise returns 403. The score endpoint never returns feedback text or ownership tokens. Do not add this secret to Pages or the Android app.

After deployment, read-only smoke checks:

```sh
curl -i https://bladefall2d.pages.dev/api/playtest
curl -i -X OPTIONS https://bladefall2d.pages.dev/api/playtest -H 'Origin: https://appassets.bladefall' -H 'Access-Control-Request-Method: POST' -H 'Access-Control-Request-Headers: Content-Type'
curl -i https://bladefall2d.pages.dev/api/feedback-export
```

Expect JSON 200 with season `playtest-2026-10-v2`; APK preflight 204 allowing only `https://appassets.bladefall`; unauthenticated export 403 or 404. Normal same-origin browser requests do not preflight. Server OPTIONS intentionally permits the APK origin only. A preview deployment should give API JSON 503 and remain playable. Check a real completed run on website and APK when ready; do not seed synthetic scores into production.

## Keep future pushes synchronized

Pages Git builds update the site and Functions, not the separately deployed API Worker. Until Worker Git builds are connected, run `npm run deploy:api` whenever `cloudflare/`, `server/playtest-service.mjs`, `public/bladefall-playtest-model.js` or `public/bladefall-playtest-worlds.js` changes. An account owner can connect the existing `bladefall-2d` Worker to the same repository and `main` branch using Cloudflare Workers Builds, with deploy command `npm run deploy:api`; keep non-production branch builds disabled for this storage service. This setup is not performed by the local activation script.

## Local verification

`npm run verify:api` compiles both real bundles, runs local workerd/Miniflare workers with a service binding and SQLite Durable Object, then removes all test data. It checks same-origin/APK score submission, retained time and heart personal bests, APK preflight, rejected foreign origins and invalid heart counts, token ownership, retry deduplication, private feedback export, unbound preview 503, static routing, no API asset copy, and SQLite persistence across runtime restart. No production request is made. `npm run build` also validates staged/active binding shape, routes and stable storage identities.

Verified locally on 2026-10-09. The local bundled runtime requires generated modules to remain under the project root; the test uses ignored `cloudflare-dist/` and cleans up afterward. Compilation or local proof does not confirm the live Pages connection.
