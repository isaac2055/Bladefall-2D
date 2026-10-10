# Pages leaderboard API — 7.304

Activated on 2026-10-09. The public Pages API is connected to the API-only Worker. Production GET and Android-origin GET/preflight passed; the current board was empty at activation. The live browser opened the Survival leaderboard, fetched the API successfully and exposed heart sorting. Score writes, heart rankings and storage persistence passed the local end-to-end check; no synthetic scores were submitted to production.

Activation receipt: binding commit `e10e0a5`; Pages deployment `0baf9c0e-43c5-4d30-9501-76469fc94cab`; Worker version `1f7c1f70-bf3e-446e-b069-29c9bf99210d` at 100%.

The request path is `bladefall2d.pages.dev/api/playtest` → Pages Function → `PLAYTEST_API` service binding → existing `bladefall-2d` Worker → `PLAYTEST` SQLite Durable Object. The new API-only entry reuses `cloudflare/worker.js` and `server/playtest-service.mjs`; it does not copy game assets or create another storage implementation. The Worker name, class `PlaytestStore`, migration `v1`, and named object `playtest-v1` stay stable so an existing deployment's data is retained.

Cloudflare requires Durable Objects to live in a Worker, while Pages Functions can call Workers through service bindings. Requests remain on Cloudflare's internal network. [Pages bindings](https://developers.cloudflare.com/pages/functions/bindings/), [Pages configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/).

## Files and deployment boundary

- `wrangler.api.jsonc`: API-only Worker; public workers.dev and preview URLs disabled.
- `functions/api/playtest.js`, `functions/api/feedback-export.js`: forward the original request, preserving URL, origin, body and authorization.
- `cloudflare/pages-api.mjs`: missing bindings return JSON 503; no unauthenticated relay or HTML fallback.
- `public/_routes.json`: only the two API paths invoke Functions; game files and APK remain static. This hosting file does not need to be inside the APK. [Functions routing](https://developers.cloudflare.com/pages/functions/routing/).
- `scripts/playtest-release/pages-api-binding.json`: production binding template, now applied to `wrangler.jsonc`; preview services explicitly empty. The live Pages project configuration confirms an empty preview services map; the unbound behavior passed locally. A request against a deployed preview has not been tested.
- `npm run activate:api`: merges that binding into `wrangler.jsonc`. It changes a local file only and refuses to overwrite unexpected configuration. **Run only after the Worker exists in the same Cloudflare account.**

The active Pages configuration binds `PLAYTEST_API` to `bladefall-2d`. An unbound environment returns `503 {"error":"api-not-connected"}`. Legacy `wrangler.worker.jsonc` and `npm run deploy` remain available for compatibility, but the API service uses `npm run deploy:api`.

## Deployment and recovery procedure

The initial activation is complete. For a new machine or future recovery, use the account that owns Pages project `bladefall2d`. This needs Pages deployment access and Worker/Durable Object deployment access. Never put tokens into a tracked file or command transcript.

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

The production checks returned:

| Request | Observed result |
|---|---|
| Public GET `/api/playtest` | 200 JSON, season `playtest-2026-10-v2`, zero records |
| Same-origin POST with invalid `{}` body | 400 from validation; no score created |
| GET with Android app Origin | 200 with `Access-Control-Allow-Origin: https://appassets.bladefall` |
| APK OPTIONS preflight | 204 |
| Foreign-origin OPTIONS | 403 |
| Unauthenticated feedback export | 404; export secret not configured |

Normal same-origin browser requests do not preflight. Server OPTIONS permits the APK origin only. A live preview should return API JSON 503 and remain playable, but this has not been checked against a deployed preview. Check a real completed run on website and APK when ready; do not seed synthetic scores into production.

### Wrangler post-upload error

Wrangler 4.149 uploaded and activated the Worker, then failed its `GET /accounts/{account}/workers/workers/bladefall-2d` lookup with code 10007. Deployment/version inspection confirmed the version above was already serving 100%, so another code upload was unnecessary. The stable `GET /accounts/{account}/workers/scripts/bladefall-2d/subdomain` endpoint confirmed `enabled: false` and `previews_enabled: false`. If recovery is needed, the corresponding POST accepts those same two fields. Verify the existing deployment before retrying a command that failed after upload. [Cloudflare script subdomain API](https://developers.cloudflare.com/api/resources/workers/subresources/scripts/subresources/subdomain/).

For binding inspection, the Pages project response field is `deployment_configs.production.services`, keyed by binding name; it is not `service_bindings`. Also inspect `deployment_configs.preview.services`. The live configuration confirmed production `PLAYTEST_API: {service: 'bladefall-2d', environment: ''}`, preview `services: {}`, and production branch `main` (local receipt `live-bindings-7.304.json`). The deployed endpoint's successful response is the runtime proof that production reaches the Worker. [Pages project API](https://developers.cloudflare.com/api/resources/pages/subresources/projects/methods/get/).

## Keep future pushes synchronized

Pages Git builds update the site and Functions, not the separately deployed API Worker. Until Worker Git builds are connected, run `npm run deploy:api` whenever `cloudflare/`, `server/playtest-service.mjs`, `public/bladefall-playtest-model.js` or `public/bladefall-playtest-worlds.js` changes. An account owner can connect the existing `bladefall-2d` Worker to the same repository and `main` branch using Cloudflare Workers Builds, with deploy command `npm run deploy:api`; keep non-production branch builds disabled for this storage service. This setup is not performed by the local activation script.

## Local verification

`npm run verify:api` compiles both real bundles, runs local workerd/Miniflare workers with a service binding and SQLite Durable Object, then removes all test data. It checks same-origin/APK score submission, retained time and heart personal bests, APK preflight, rejected foreign origins and invalid heart counts, token ownership, retry deduplication, private feedback export, unbound preview 503, static routing, no API asset copy, and SQLite persistence across runtime restart. No production request is made. `npm run build` also validates staged/active binding shape, routes and stable storage identities.

Verified locally on 2026-10-09. The local bundled runtime requires generated modules to remain under the project root; the test uses ignored `cloudflare-dist/` and cleans up afterward. The production checks above confirm the live Pages connection; score writes and restart persistence were tested locally without polluting the public board.
