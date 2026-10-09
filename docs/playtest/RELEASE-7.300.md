> Historical release: superseded by [7.301](RELEASE-7.301.md). The shared-checkpoint finales described below were reverted at the user’s request. Cloudflare replaces Netlify as the current hosting target.

# Bladefall playtest release

Version 7.300 adds shared world leaderboards, optional feedback, immediate Fractured access, map selection and Survival finales. The build is local; publication is a separate action.

## Playing and rating

Open Leaderboards from the title, Controls, or Survival header. Choose Explore or Survival, Base or Fractured, and a world; **Start selected world time trial** starts a fresh attempt. Normal fresh world starts are also timed. Pauses and feedback forms stop the timer. Room selection, skips, demonstrations, assists, co-op, returning through a side entrance and interrupted runs are practice rather than ranked clears.

Controls → **Feedback mode** enables Fun /10, Difficulty /5 and an optional comment. Explore asks after each completed level. Survival asks after each completed room, with a compound finale treated as one room. Saving feedback stores it locally and sends it privately to the organizer's server; Skip continues without submitting. The original Room Bank review workflow and suitability ratings remain available locally.

World completion shows that mode's five fastest saved times, deaths, an optional name and Save button, then **Skip to next world**, **Walk to next world**, and **Previous menu**. Skip is omitted when there is no next available world. Previous menu opens level selection in Explore or the selectable Emerald Ascent map in Survival.

Explore's pause menu scrolls on short screens. Zoom now ranges from 70% to 115%. Extras remains on localhost and file builds and is hidden on public hosts.

## World finales

Every Survival world has a three-chamber finale composed from its existing final connected challenges. One checkpoint covers all three chambers. Death or Retry returns to the first chamber and clears the finale's local tally and gate progress; returning through Continue also starts at that shared checkpoint. The world timer and death count continue across retries.

Boss finales retain the final authored boss instantiation alongside the approach or earlier boss chambers. Boss detection includes the Brute, Marksman, Warden, Sorcerer, Colossus, Tyrant, King, chain hydra, Sentinel and root crown. These are compositions of the existing connected rooms, not forty newly authored bank superrooms. Geometry, movement rules and the Room Bank's approval status are preserved. Their longer checkpoint spans still need human difficulty review.

## Scores

The new season starts empty. Legacy local time boards are archived under their previous storage keys with `.before-playtest-reset`; feedback and campaign saves are retained.

Ranks use elapsed time only. Deaths are displayed for the corresponding timed clear. Each browser profile contributes its best time per world; names are labels, not account identities. A backup can carry the same profile between devices.

**Whole game** appears only in Leaderboards. A profile needs a continuous clear of all twenty worlds in that mode and campaign. The total sums its best time for each world, even if completed on different days. Improving any world automatically improves the total. Explore and Survival, and Base and Fractured, are independent. Bonus content and unbuilt finale placeholders are not required.

## Fractured access

An Explore Rift Shard immediately unlocks its matching Fractured region. A purple portal appears at the collection point; use the displayed interaction key to enter. A portal at the echo entrance returns to the source. Independent world trials preserve the existing campaign save while visiting an echo.

Survival's base-world keepsake unlocks the matching Fractured region and opens a purple portal at the reward. Hold Up at the portal. Its return portal is at the Fractured world's entrance. Both modes also expose unlocked echoes through their level or map selection. A portal detour makes an unfinished source-world time a practice attempt.

## Offline saves and deployment

Scores and feedback are written to browser storage before any request is attempted. Failed requests stay queued and retry when the connection returns. The API uses only the origin hosting the game; there is no hardcoded external upload destination.

Run the local game with `node public/serve.mjs`. It receives submissions in `scripts/playtest-release/.cache/submissions/`, outside the public directory. Keep this directory and browser storage until the data has been backed up or deployed. Localhost and a published website have separate browser storage.

Run `./build-deploy.sh` before a function-enabled local Netlify deployment. The build includes local server submissions in `netlify/functions/playtest-seed.json`, a private function asset. Once the function runs, immutable records are imported into the persistent `bladefall-playtest-v1` Netlify Blobs store; repeated requests and deployments do not duplicate them. The seed is never copied into the public game files.

Deploy from the repository root with its `netlify.toml`, `public` publish directory and `netlify/functions`. A static drag-and-drop upload of `netlify-deploy` alone cannot provide online score or feedback storage. A Git deployment without the local private seed cannot see this machine's local records: use **Back up scores & feedback** locally, then **Restore backup** on the published game's Leaderboards to queue them there. Back up the destination profile first if it already has submissions from a different identity.

Netlify storage behavior follows the [Netlify Blobs documentation](https://docs.netlify.com/build/data-and-storage/netlify-blobs/). Local service tests cover the storage contract; a live online smoke check is still required after publication. No deployment or cloud write was performed during this change.

## Organizer feedback export

Run `node scripts/playtest-release/export-feedback.mjs` for local feedback. For the published store, supply `NETLIFY_SITE_ID` and `NETLIFY_AUTH_TOKEN` privately in the environment and run the same command with `--online`. CSV files are written to the ignored `scripts/playtest-release/.cache/exports/` directory. The public API exposes only scores, never feedback or profile tokens.

## Verification

`npm run verify:playtest-browser` runs the saved browser fixtures with an isolated temporary server and profile. `npm run verify:playtest` checks complete-world aggregation, improvements, separate modes and campaigns, time-only ranking, ownership, retries and feedback privacy. Browser checks cover all forty starts per mode, Survival finale checkpoint reset, world-finish actions, map selection, feedback, offline retry, Explore scrolling and zoom, and campaign-safe Rift Shard return. These checks verify integration, not the subjective difficulty or fun of the finales.
