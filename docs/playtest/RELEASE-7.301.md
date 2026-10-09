# Bladefall 7.301 — Cloudflare and original room checkpoints

Survival again saves and retries each room independently. Future superroom finales will come from Room Bank; none were added to worlds. The pause menu has one **World map** choice and no **Connecting passages** section. The existing passages remain playable. Room Bank geometry, approval states and pending superroom reviews are unchanged.

## Connect GitHub to Cloudflare

Use **Cloudflare Workers & Pages → Create application → Import a repository** and create a **Worker** with Git integration. This project includes a server API and a SQLite Durable Object; a static-only Pages upload is insufficient.

| Setting | Value |
| --- | --- |
| Repository | `isaac2055/Bladefall-2D` |
| Production branch | `main` |
| Worker/project name | `bladefall-2d` |
| Root directory | repository root (`/`) |
| Build command | `npm run build` |
| Deploy command | `npm run deploy` |
| Build environment | `PUPPETEER_SKIP_DOWNLOAD=true` |

Keep the project name aligned with `wrangler.jsonc`. Cloudflare installs dependencies from the lockfile; Wrangler uploads `public/`, bundles the Worker and provisions the `PLAYTEST` SQLite Durable Object from its migration. No database ID needs to be pasted into source. After connection, successful pushes to `main` trigger builds and deployments. See [Cloudflare Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/).

The API is `/api/playtest`. Public reads contain leaderboard scores only. Private feedback and ownership hashes are stored outside static assets. Production deployment is performed when you connect/deploy; local and dry-run checks do not publish anything.

## Scores, feedback and saved data

Explore and Survival have separate boards, each with Base/Fractured and By world/Whole game. Ranks use fastest time; death counts accompany the timed clear. Whole-game totals aggregate each profile's best continuous time for all twenty worlds of the selected mode/campaign. Improving one world updates the aggregate. Interrupted/practice runs do not qualify.

World finishes show the top five, optional time saving, and Skip to next world, Walk to next world, or Previous menu. Feedback mode in Controls prompts after every Explore level or Survival room: Fun /10, Difficulty /5, optional comment. Pauses and feedback stop the timer. Extras remains available locally and hidden on public hosts.

Browser saves happen before uploads; failed submissions stay queued and retry online on the same site. Localhost and Cloudflare have separate browser storage. Before moving sites, use **Leaderboards → Back up scores & feedback** locally, then **Restore backup** on the published site. This restores the profile and queues its scores/feedback for that host. Back up any different destination profile first. Private local submissions and tokens are never committed to GitHub. Keep backups private.

For organizer feedback downloads, optionally add a Cloudflare Worker **secret** called `FEEDBACK_EXPORT_TOKEN` with a long random value. Set `PLAYTEST_SITE_URL` to your HTTPS game URL and `PLAYTEST_EXPORT_TOKEN` to that secret in your private local environment, then run:

```sh
node scripts/playtest-release/export-feedback.mjs --online
```

The CSV is written under ignored `scripts/playtest-release/.cache/exports/`. Without the server secret, the export route is disabled; ordinary feedback saving still works. Without `--online`, the exporter reads the private local server store. Back up exports periodically. Public leaderboard names are visible to other players; feedback is organizer-only.

## Local use and verification

```sh
npm install
npm run serve
npm run verify:playtest
npm run verify:playtest-browser
npm run build
npm run verify:cloudflare
```

`npm run dev:cloudflare` runs the actual Worker and persistent storage locally. `verify:cloudflare` only creates an ignored dry-run bundle. Existing Netlify adapters/build scripts are retained for history, but are not used by Cloudflare.

After the first production deployment, check one saved world time, one feedback entry and a refresh/revisit. This verifies the actual account's storage permissions and deployment settings. No anti-cheat or account login is implied by the playtest boards.

Standing workflow: after each completed game run/change set, run relevant checks, commit the complete current game and push to GitHub `main`. Keep private submissions, backups and caches out of Git; never force-push.
