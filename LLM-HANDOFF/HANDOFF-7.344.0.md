# Handoff 7.344.0–7.345.0: quest shortcuts in every region (with a test mode and gallery), plan-driven Explore routes

Written 2026-10-16 by Claude, in a cloud session. Everything below is on `main`. Give this file to the local LLM so it can bring the local/offline copy up to date and carry the work on.

## 1. Bringing the local/offline copy up to date

1. Run `git pull origin main`. Everything is in the repo; nothing lives only in the cloud.
2. Version **7.345.0**:
   - `VERSION`, the `sw.js?v=` registration, and `?v=7.345.0` on `bladefall-explore-mounts.js`, in `public/index.html` and `public/sw.js`;
   - `bladefall-explore-routes.js` stays at `?v=7.344.0`;
   - `CACHE_NAME = 'bladefall-v514-shortcut-gallery'`.
3. The APK was not rebuilt, because the cloud container has no Android SDK. The download link still points at v7.341.0.
   - If the local machine can build the APK, build and release v7.345.0, then point `#apkBtn`'s href in `public/index.html` at it.
4. Checks worth running locally (each serves `public/` itself):
   - `npm run verify:mounts`: the Bellwing, plus Mara's chart.
   - `npm run verify:mounts-tour`: all 19 other regions' shortcuts.
   - `npm run verify:mounts-test-mode`: the five-tap test mode and the gallery (7.345).
   - `npm run verify:explore-routes`: re-watches every stored route in the real Watch.
   - `npm run verify:looks`: Ascend themes from 7.342.

## 2. What changed in 7.343.x → 7.344.0

### a. The Bellwing grants Mara's chart

Flying the Bellwing from the camp to the Mothlight Door now does Mara's survey: all three bearings (survey stakes) are aligned and her field chart is granted, the same as finishing her quest on foot. The `arrive` hook on the door roost calls `outskirtsSurveyFromTheAir()`.

Test: `scripts/explore/mount-check.mjs`.

### b. A quest shortcut for every region (`public/bladefall-explore-mounts.js`)

Finishing a region's side story (the kind ending, phase `completed`) installs that region's shortcut.
- Each shortcut has two roosts: one by the quest giver, one near the region's far end. Up at either one rides to the other.
- There are three kinds:
  - **flight**: a creature or vehicle carries the knight over the level.
  - **zip**: a line.
  - **blink**: a door, gate or hatch that skips ahead.
- Before the abilities the region grants are held, the roost answers "Not yet…", so a shortcut never skips an ability pickup.
- **The Deep Line (15)** is a cart level. Its handcar is offered as the stage loads instead: press Up in the first ~7 s.
- Shortcuts are never installed under the TAS/Watch rules, so routes stay honest.

| Stage | Shortcut | Story id | Kind |
|---|---|---|---|
| 0 | The Bellwing | gatekeeper | flight |
| 1 | The Mothlight Swarm | refuge | flight |
| 2 | Silas's Chain Trolley | defector | zip |
| 3 | The Cartographer's Kite | cartographer | flight |
| 4 | The Recruit's Rope Arrow | recruit | zip |
| 5 | The Archivist's Postern | archivist | blink |
| 6 | The Keeper's Service Way | keeper | blink |
| 7 | The Perfect-Day Sled | winter | flight |
| 8 | The Rime Drake | ember-pet | flight |
| 9 | The Quota Cart | quota | blink |
| 10 | The Automaton's Throw | automaton | flight |
| 11 | The Ceiling Way | neighbors | blink |
| 12 | The Other Side | figure | blink |
| 13 | The Last Alarm | alarm | blink |
| 15 | The Miner's Handcar | miner | blink (offer at load) |
| 16 | The Sailors' Skiff | sailors | flight |
| 17 | The Birthday Rocket | birthday | flight |
| 18 | The Paper Crane | mother | flight |
| 19 | The Pilgrim's Feather Cloak | pilgrim | flight |
| 20 | The Moonflower | garden | flight |

**Owner decision pending.** Some regions already had a shortcut, for example Updrafts' own. The owner asked that the new quest shortcuts be added *alongside* existing ones for now. Where an old and a new shortcut cover similar distances, one should eventually go (usually the old one), **but only after asking the owner**. Nothing existing was removed.

Tests:
- `scripts/explore/mounts-tour.mjs [stage…] [--shots dir]`: the gate refusal, the ride there and back, and the offer mode on 15.
- `scripts/explore/mount-check.mjs`.

### b2. Shortcut test mode and gallery (7.345.0)

- **Test mode.** In Explore → Level Select, tap **Base** (the tab left of Fractured) **5 times within 3 s**.
  - A toast confirms it, the tab reads **Base ✦**, and a gold line under the tabs says the test is on.
  - While it's on, every **level-select run** gets its region's quest shortcut without the side story. The "Not yet" ability gate is lifted too, so each shortcut can be tried at once.
  - Campaign runs never see it, and neither do Watch/● Record/TAS or co-op.
  - It is kept on this device (`localStorage` key `bladefall.mounts.test`) until 5 more taps turn it off.
  - Code: `testing()`, `setTestMode()` and `testMode()` in `public/bladefall-explore-mounts.js`; `earned()` and `missing()` consult it. The tap counter is `lvlBaseTaps` in `openLevelSelect()` (index.html).
- **Gallery.** Level Select (Base tab) → **✦ Quest shortcuts** opens `openShortcutGallery()`, a grid of 20 cards. Each card has:
  - a looping picture of the shortcut, drawn with the game's own mount art by `BladefallMounts.preview(ctx, stage, t, w, h)`, showing the two roosts, the route between them and the knight riding;
  - the shortcut's name, region and kind;
  - start → destination;
  - the side story that earns it, and its intro line.
  - It works without the test mode. CSS class `.card.scgallery` widens the overlay; the grid falls to one column on phones.
- **Test:** `scripts/explore/mounts-test-mode.mjs [--shots dir]`. It covers the 4 taps vs 5, the tab mark, all 20 regions in level-select runs with no story, none in a campaign run, the 20 gallery pictures drawn, and turning it off. It passes.



The bot (`scripts/bladefall-bot.mjs`) drives platforming well but cannot discover a level's own mechanisms: rituals, levers, hoists, rings, lifts and gate fights. Levels now get a **plan**: `scripts/explore-routes/plans/NN.mjs`, one file per stage, loaded by `plans.mjs`.

Step kinds are documented in `scripts/explore-routes/plan-kit.mjs`:
- `{reach:[x,y],xr,yr}`: the bot drives there.
- `{press:[[input,frames]…]}`: holds raw inputs.
- `script(label, body)`: a closed-loop controller in the page that uses inputs only.
  - Every frame it steps is recorded into the route. `tas.saveState/restoreState` rewinds the recording, so a script can search over timings.
  - **After a restore every game object is new.** Re-find objects (`G.obstacles.find(...)`) after each restore.
  - Helpers available inside a script: `go`, `wait`, `press`, `steer`, `fight`, `foes`.
- `finish: x` plus `finishNote`: for a level whose end is a place, not a door. Frostfell has no exit: its summit is the end, because its aqueduct only opens from the White Court.
  - The Watch (`exploreWatchTick` in index.html) accepts such a route when the knight is past `finishX` at the tape's end.

Other changes:
- **Bot:**
  - plan execution before the main drive;
  - "blade approaches" (up-striking resin blades, for Black Woods);
  - `stateDiff` in the result when a replay differs.
  - A route that crosses the exit seam now passes when the knight's own state replays exactly, even if effects/RNG in the throwing last frame differ. The Watch replay remains the deciding check.
- **Builder:** `build.mjs --out file` writes to a separate routes file, so builds can run in parallel. Merge by copying the stage entries; a scratch merge script did this, and it is trivial to rewrite.

**Routes now stored** (`public/bladefall-explore-routes.js`):

| Status | Stages |
|---|---|
| Full (level-end) | 0, **1 Black Woods**, **7 Frostfell (summit)**, 15, **17 Landing Shores**, **18 the Colony**, **19 Path to the Palace**, 35 |
| To the boss | **2 (the Brute)** |
| Partial | 3, 4, 5, 6, 8, 10, 11, 12, 21, 23, 24, 25, 30, 39 |
| None | 9, 13, 16, 20, 22, 26–29, 31–34, 36–38, 40 |

Bold marks routes that are new in this version.

What each new plan does:
- **1, Black Woods:**
  1. Reach the top oath step (3425, 205).
  2. Drop onto the stump ledge (3640, 40) and pick up the Oathblade.
  3. The bot then up-strikes the resin blades.
- **2, the Keep causeway:**
  1. Strike the yard catch with Up on the 130 step at 3420.
  2. Stand on the plate at 4050 so the swinging hoist drops its mass, then step clear.
  3. Fight the grunt, then strike the rise catch (4930, 105). The repair is done and the door at 5360 opens.
  4. Reach 8250, fight, board the freight lift at home (8520, 65), and jump while it is lit. The launch lands on 9115/300.
  5. The bot walks to the arena.
- **7, Frostfell:** the warden gate, the thermal portal at 5500, the frost memory (double jump), then a searched finale over 19 landings to the summit. `finish 14400`.
- **17, 18, 19 (Act Two):** Chainhook rings (`hook`), slams (Down in the air), and gate fights. Each file comments its steps.

### d. Known next steps for routes (the owner's goals, in order)

1. **Base non-boss levels: full routes.** Still missing 3, 5, 9 and 11.
   - **3, Updrafts:**
     - Aerie Pack: strike the mooring brake, take the harness.
     - Choir: strike the cinder vessel and the high damper; the heat reaches wind-gate-1 in 3.2 s.
     - Then wind-gates 2 and 3, the Crown's portal gun, and the exit at y ≥ 720 with portal-single.
     - An unverified draft is in `scripts/explore-routes/plans-wip/03.mjs`. It is not loaded; move it into `plans/` to try it.
   - **5, the Ruined Keep:** stalls at about 5797. Look at keep-weight, belfry-fold and wall-jump in `restoreSolvedBacktrackDoors`.
   - **9, Emberdeep:** the graph breaks at the first gate. The exit is the Ember exit door, which needs companion-command (`command`).
   - **11, the Inversion:** walked right to left. It needs gravity-flip (`flip`). It stalls at about 9610; the exit is x ≤ 62 facing west.
2. **Base boss levels: routes to the arena.** Done: 2. Missing: 4 (archer, stalls 2823, portal walls), 6 (warden), 8 (sorcerer), 10 (colossus), 12 (tyrant), 13 (King), 16 and 20 (Act Two bosses).
3. **The same for Fractured (21–40).**

Workflow that worked, per level:
1. `node <tools>/eval.mjs STAGE "expr"` dumps objects. This and the other probe tools were scratch tools in the cloud session; `scripts/explore-routes/build.mjs`'s `boot()` shows how to boot a stage the same way.
2. Read the mechanism's code: grep its flag, read `physicalSeamSpec()` for the exit, and read tests/validators.
3. Write the plan script with inputs only.
4. Build with `node scripts/explore-routes/build.mjs N --blood --jobs 1 --budget 6000`. ✓ means it was verified in the Watch and saved.

## 3. Files touched in this stretch

- `public/bladefall-explore-mounts.js` (7.345: test mode, `preview`)
- `public/bladefall-side-story-world.js`
- `public/bladefall-respec-renderer.js`
- `public/index.html`: Watch finish routes, mount hooks, version, and (7.345) the Base 5-tap toggle, the ✦ line, the gallery button, `openShortcutGallery()` and `.card.scgallery`.
- `public/sw.js`
- `public/bladefall-explore-routes.js`
- `scripts/bladefall-bot.mjs`
- `scripts/explore-routes/build.mjs`, `plans.mjs`, `plan-kit.mjs`, `plans/*.mjs`, `plans-wip/03.mjs`
- `scripts/explore/mount-check.mjs`, `mounts-tour.mjs`, `mounts-test-mode.mjs` (7.345)
- `package.json`, `build-deploy.sh`
