# Bladefall: start here (reference sheet, 2026-10-22, at 7.373.0)

Read this first. Then read the newest entries at the top of `01-CURRENT-STATE.md`. The code wins over every document.

## What the game is
- A browser game, `public/`, with no build step. It is hosted on Cloudflare Pages: https://bladefall2d.pages.dev, which deploys automatically when you push to `main` on isaac2055/Bladefall-2D.
- There is an Android APK, built locally and released on GitHub.
- The owner is Isaac (pronouns: they/them). The current build is the **pre-alpha**, out with outside testers. Ascend is the focus.
- **Explore** (`public/index.html`, LittleJS; about 27k lines of inline script): regions 0–20 base and 21–40 Fractured (`STAGES`). Level select is `openLevelSelect()`. Test mode: tap Base or Fractured 5 times in Level Select. It unlocks every level, Watch/● Record, the quest shortcuts and Edit this level.
- **Ascend** (`public/precision.html?pitch=climb`, the Precision Core engine `bladefall-pcore*.js`):
  - The 40 climb worlds are in `bladefall-climb-*.js`, the map in `bladefall-climb-map.js`, the views in `bladefall-climb-view.js` and `bladefall-pcore-view.js`.
  - The Cores (worlds 101–120) live in `scripts/room-bank/fractured/96–115`.
  - Test mode: press Screen shake 5 times in Assist & options.
- **Shared:**
  - leaderboards and feedback: `bladefall-playtest.js`;
  - the level builder: `bladefall-workshop-*.js`;
  - Ascend draft routes: `bladefall-route-solver.js` and `docs/WATCH-ROUTES.md`;
  - Explore watch routes: `bladefall-explore-routes.js` and `scripts/explore-routes/`.
- **Server:** `server/playtest-service.mjs` and `cloudflare/worker.js` (a Durable Object with SQLite). Deploy it with `npm run deploy:api`; this needs Isaac's OK. Public feedback is read at `/api/playtest?feedback=1`.

## Quests
Read `VOICE-POLICY.md`: voice work requires separate, explicit authorization and comes last.
See `QUESTS-HANDOFF.md` (how the reworked quests are built, six fixes owed, and the proposal for the next ones).

## Shipping a change (standing authorization: commit and push to main after checks; never Netlify; never force-push)
1. Check for concurrent work. Codex and cloud sessions also push: run `git pull`, then read the top of `01-CURRENT-STATE.md`.
2. Bump the version:
   - `const VERSION` in `index.html`, and `BLADEFALL_VERSION` in `precision.html`'s head;
   - `?v=` on every changed `public/*.js`, in `index.html`, `precision.html`, `coop-practice.html` and `sw.js`;
   - every `sw.js?v=`;
   - `CACHE_NAME` in `sw.js`;
   - the APK link `releases/download/vX/Bladefall-X.apk` in `index.html`.
   - New files go into `build-deploy.sh` ASSETS and the `sw.js` list.
3. Add a handoff entry at the top of `01-CURRENT-STATE.md`.
4. Commit with the trailer `Co-Authored-By: Claude …`, then push. Wait until `curl https://bladefall2d.pages.dev/` shows the new VERSION.
5. Run `./android/build-apk.sh` (it reads VERSION, takes about 2 minutes and produces about 420 MB; keep `android/bladefall.keystore`). Then release it: `gh release create vX android/dist/Bladefall-X.apk`. Cloud sessions have no Android SDK, so the APK is built locally.

## Checks (pick what your change touches)
- `npm run verify:level-editor`: the workshop suite.
- `npm run verify:watch`: Ascend watch, all worlds and Cores.
- `node scripts/verify-precision-core.mjs`: 440 tests.
- `node scripts/room-bank/check.mjs`.
- `npm run verify:api`.
- `npm run verify:explore-routes`.
- `node scripts/explore-routes/record-check.mjs`.
- Unit tests: `node --test` on the non-browser `tests/`. About 73 failures predate this sheet; compare them by name against a `git worktree` of the previous commit.
- Look at the screen as well: preview with `.claude/launch.json` "bladefall" (port 8371).
  - Unregister the service worker and clear the caches first.
  - The browser pane pauses the game loop while hidden; take a screenshot to wake it.

## Traps
- Frozen objects: zone plans are frozen, and so is `BladefallPrecisionCore`. Writing to them throws inside async code.
- Explore's TAS mode (`?tas=1`) and the watch/record mode (`exploreWatch`, `watchLike()`/`watchAuto()`) depend on determinism.
  - The game logic runs in a 1440×900 view.
  - Keep `Math.random` calls in sim code consistent.
- Don't run headless Chrome sweeps with more than 2 jobs at once; 6 crashed Isaac's Mac.
- Keyboard reads `event.code`. "Only Shift+D dashes" was a browser extension (Vimium).
- Never stage `LLM-HANDOFF/.Rhistory` or Codex's in-progress notes.

## Where the owner's preferences live
Claude's memory files (`~/.claude/projects/...Bladefall.../memory/`), `02-MASTER-VISION.md`, and `09-DECISIONS-AND-NONREGRESSIONS.md`.
