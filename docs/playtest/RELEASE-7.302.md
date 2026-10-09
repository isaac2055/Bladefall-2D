# Bladefall 7.302 — Cloudflare Pages output correction

The live `bladefall2d.pages.dev` project is Cloudflare Pages. Its previous deployment published the repository root: `/` returned 404, while `/public/` served the game. The successful preview deployment showed the same output paths.

The root `wrangler.jsonc` now supplies Pages configuration with `pages_build_output_dir: "./public"`. Git-integrated Pages builds can therefore publish the game at the site root. The repository root remains the build root; `npm run build` validates the configuration and public assets. This configuration takes effect after a successful Pages redeployment; saving or locally checking it does not change the live site. [Cloudflare Pages configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/).

The existing Worker configuration is preserved unchanged in `wrangler.worker.jsonc`. `npm run deploy`, `npm run dev:cloudflare`, and `npm run verify:cloudflare` explicitly select that file. The verification command remains a dry run. Its asset directory, API routes, SQLite Durable Object binding and migration are preserved.

The live Pages `/api/playtest` endpoint returned 404 before this correction. Changing the static output directory does not deploy that API or provision its storage. The existing Worker still requires a separate deployment and, if the game remains on Pages, a Pages Function with a binding or proxy to that Worker. Pages cannot create and deploy a Durable Object itself. No backend provisioning is included in this change. [Cloudflare Pages bindings](https://developers.cloudflare.com/pages/functions/bindings/#durable-objects).

The earlier [7.301 deployment guide](RELEASE-7.301.md) describes a Worker project. Use its server setup guidance with the explicitly selected Worker configuration; the current `pages.dev` game host uses the Pages configuration described here.
