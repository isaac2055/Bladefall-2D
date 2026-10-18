# Handoff 7.344.0–7.349.0: quest shortcuts in every region (two-way, earned by playing through, each its own kind of ride; test mode and gallery), tester's tools behind test mode, a real New Game, plan-driven Explore routes

Written 2026-10-16 by Claude, in a cloud session. Everything below is on `main`. Give this file to the local LLM so it can bring the local/offline copy up to date and carry the work on.

## 1. Bringing the local/offline copy up to date

1. Run `git pull origin main`. Everything is in the repo; nothing lives only in the cloud.
2. Version **7.349.0**:
   - `VERSION`, the `sw.js?v=` registration, and `?v=7.349.0` on `bladefall-explore-mounts.js`, in `public/index.html` and `public/sw.js`.
   - `?v=7.349.0` on `bladefall-pcore-view.js`, in `public/precision.html` and `public/sw.js`. precision.html's `sw.js?v=` registration is also 7.349.0.
   - `bladefall-respec-renderer.js` stays at 7.348.0, `bladefall-explore-routes.js` at 7.344.0.
   - `CACHE_NAME = 'bladefall-v518-tester-tools'`.
3. The APK was not rebuilt, because the cloud container has no Android SDK. The download link still points at v7.341.0.
   - If the local machine can build the APK, build and release v7.349.0, then point `#apkBtn`'s href in `public/index.html` at it.
4. Checks worth running locally (each serves `public/` itself):
   - `npm run verify:mounts`: the Bellwing, Mara's chart, and the perch kept across a reload and in the save.
   - `npm run verify:mounts-tour`: the other 18 regions' shortcuts: home roost first, then both ways, and where each mount ends up perched.
   - `npm run verify:mounts-test-mode`: Explore's five-tap test mode (Base or Fractured), what it shows and hides, and the gallery.
   - `npm run verify:new-game`: New Game really starts over (7.349).
   - `npm run verify:explore-routes`: re-watches every stored route in the real Watch.
   - `npm run verify:looks`: Ascend themes from 7.342.

## 2. What changed in 7.343.x → 7.344.0

### a. The Bellwing grants Mara's chart

Flying the Bellwing from the camp to the Mothlight Door now does Mara's survey: all three bearings (survey stakes) are aligned and her field chart is granted, the same as finishing her quest on foot. The `arrive` hook on the door roost calls `outskirtsSurveyFromTheAir()`.

Test: `scripts/explore/mount-check.mjs`.

### b. A quest shortcut for every region (`public/bladefall-explore-mounts.js`)

Finishing a region's side story (the kind ending, phase `completed`) installs that region's shortcut.
- Each shortcut has two roosts. Up at either one rides to the other. **Where the roosts are, and when they open, changed in 7.346; see section b3.**
- There are three kinds:
  - **flight**: a creature or vehicle carries the knight over the level.
  - **zip**: a line.
  - **blink**: a door, gate or hatch that skips ahead.
- Before the abilities the region grants are held, the roost answers "Not yet…", so a shortcut never skips an ability pickup.
- **The Deep Line (15)** has no shortcut since 7.346, because the cart is the ride. The handcar, which used to be offered at load, was removed.
- Shortcuts are never installed under the TAS/Watch rules, so routes stay honest.

| Stage | Shortcut | Story id | Kind |
|---|---|---|---|
| 0 | The Bellwing | gatekeeper | flight |
| 1 | The Mothlight Swarm | refuge | flight |
| 2 | Silas's Chain Trolley | defector | zip |
| 3 | The Cartographer's Kite | cartographer | flight |
| 4 | The Recruit's Rope Arrow | recruit | zip |
| 5 | The Archivist's Bell-Ropes (7.348) | archivist | swing |
| 6 | The Keeper's Cage Run (7.348) | keeper | cage |
| 7 | The Perfect-Day Sled | winter | flight |
| 8 | The Rime Drake | ember-pet | flight |
| 9 | The Quota Cart | quota | blink |
| 10 | The Automaton's Throw | automaton | flight |
| 11 | The Ceiling Way | neighbors | blink |
| 12 | The Other Side | figure | blink |
| 13 | The Last Alarm | alarm | blink |
| 16 | The Sailors' Skiff | sailors | flight |
| 17 | The Birthday Rocket | birthday | flight |
| 18 | The Paper Crane | mother | flight |
| 19 | The Pilgrim's Feather Cloak | pilgrim | flight |
| 20 | The Moonflower | garden | flight |

**Owner decision pending.** Some regions already had a shortcut, for example Updrafts' own. The owner asked that the new quest shortcuts be added *alongside* existing ones for now. Where an old and a new shortcut cover similar distances, one should eventually go (usually the old one), **but only after asking the owner**. Nothing existing was removed.

Tests:
- `scripts/explore/mounts-tour.mjs [stage…] [--shots dir]`: only the home roost until it's reached, the gate refusal, the ride there and back, and the perch.
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
- **Test:** `scripts/explore/mounts-test-mode.mjs [--shots dir]`. It covers the 4 taps vs 5, the tab mark, all 19 regions with a shortcut in level-select runs with no story, none in a campaign run, the 19 gallery pictures drawn, and turning it off. It passes.

### b3. Two-way shortcuts, and only the Outskirts skippable on a first visit (7.346.0)

The owner's design goals:
- The Outskirts are a long, plain walk, so they may be skipped as soon as the quest is done.
- Every other region has to be played through first. Its shortcut is there to make backtracking quick, and it rewards finishing the quest.
- Every shortcut runs both ways.
- The Deep Line needs no shortcut.

**Rules, in `public/bladefall-explore-mounts.js`:**
- **Home roost** is `roosts[0]`, at the region's far end in the direction it is walked:
  - `near:'end'`: the exit;
  - `near:'arena'`: the edge of the boss's arena while the boss stands. Once the boss has fallen, `resolve()` falls back to `'end'`, by the exit.
  - The mount first waits here.
- **Entrance roost** is `roosts[1]`, at `near:'start'`, the region's entrance.
- **Unlock:** finishing the side story installs only the home roost. The entrance roost appears once the knight has stood at the home roost on foot (`noteReached()`, within 240×160, on the ground), which means having played the region to its end. A toast says "The way back is open".
  - Reaching the home roost counts even before the story is finished, because `G.mountHome` is tracked regardless.
  - The Outskirts are the exception: `opened()` is always true for stage 0, so the Bellwing waits by the camp and can skip the walk at once.
- **Both ways, and perched where it lands:** flights (creatures and craft) are a single mount, perched where it last set the knight down.
  - At the empty roost, Up offers to call it over ("↑ WHISTLE" for the drakes, "↑ CALL IT OVER" for the others) and then ride.
  - Zips (lines) and blinks (passages and doors) are fixed structures and work from both ends.
- **Persistence:**
  - In the campaign: `meta.mounts = {perch:{stage:roostId}, reached:{stage:true}}`, which is saved.
  - In a level-select run: `G.sessionMounts`, carried by `savedRunSession` in index.html.
  - So fly the Bellwing to the Mothlight Door, and it is still perched there when you come back from Black Woods to backtrack.
- Test mode (b2) opens every entrance roost too. The "Not yet" ability gate still applies outside test mode.

**Per region (base):**

| # | Region | Shortcut | Home roost (waits here; reached on foot opens the way back) | Entrance roost | Notes |
|---|---|---|---|---|---|
| 0 | Outskirts | Bellwing | the camp (x 1050) | the Mothlight Door (13330) | The only one skippable at once. Flying to the door also grants Mara's chart. |
| 1 | Black Woods | Mothlight Swarm | the Brute Road (end, ~11700) | the woods' edge (~1080) | Oathblade first: the ability gate, plus reaching the end. |
| 2 | Broken Causeway | Silas's Chain Trolley | Chainwake Camp (arena edge, east) | the causeway's west end | Rides east → west, then back. Possible double: the causeway repair door (5360). |
| 3 | The Updrafts | Cartographer's Kite | the canyon's end (~17300) | the canyon mouth (~230) | Possible double: Updrafts' own return shortcut (the owner mentioned it). |
| 4 | Hollow Marksman | Recruit's Ballista (7.347) | the Marksman's ridge (arena edge) | the trailhead | |
| 5 | Ruined Keep | Archivist's Bell-Ropes | the Keep's far wall (~17300) | the gatehouse | Possible doubles: keep-weight / belfry-fold. |
| 6 | The Warden (walked west) | Keeper's Cage Run | the Gaol's west yard (arena, ~3020) | the Eastern Crown (~14400) | |
| 7 | Frostfell | Perfect-Day Sled | the summit road (~14220, y 650) | the warden's gate (~600) | **Double:** the muster engine ring (1330 ↔ 7220 ↔ 14680) covers the same distance. Ask the owner which to keep. |
| 8 | Frost Sorcerer | The Winter Road (7.347) | the Court's last stair (arena) | the sluice | |
| 9 | Emberdeep | Quota Cart | the Deep Stair (~15700) | the mine head (~600, y 640) | |
| 10 | Ember Colossus | Automaton's Throw | the last bay (arena) | the foundry gate | |
| 11 | The Inversion (walked west) | Ceiling Way | the west gate (~700) | the Fall In (~15650, y 1200) | |
| 12 | Void Tyrant (walked west) | The Other Side | the Tyrant's hall (arena, ~1490) | the east gate (~16400) | |
| 13 | Abyss King | The Last Alarm | the throne road (King's arena edge, ~4770; by the rail head once he falls) | the Throne's gate | |
| 15 | The Deep Line | none | | | The cart is the ride. |
| 16 | Thunder Cliffs | Sailors' Skiff | the hydra's water (arena) | the cliff landing | |
| 17 | Landing Shores | Birthday Rocket | the far shore (~12100, y 720) | the landing beach | |
| 18 | The Colony | Paper Crane | the road gate (~10100) | the Colony gate | |
| 19 | Path to the Palace | Pilgrim's Feather Cloak | the palace steps (~9700, y 770) | the palace road | |
| 20 | Sunspire Palace | Moonflower | the Day King's court (arena) | the palace gate | |

Positions are what the tour measured in a level-select run; boss levels were measured with the boss alive. **Doubles are not removed**: per the owner, remove one only after asking them.

Ideas not used, if a region needs more locking later:
- an entrance roost that needs an item found near the end;
- a checkpoint flag.

The current rule, reaching the home roost on foot, already means the region has been played through.

### b4. Each shortcut its own kind of ride (7.347.0)

The owner's feedback on the first versions:
- Hollow Marksman's line was the same as the Causeway's.
- The Frostfell sled flew above everything.
- The White Court rode a white copy of the Bellwing.
- Emberdeep's cart, and the Inversion, Void Tyrant and Abyss King shortcuts, were just doors.
- The Colossus throw's fire trail read as a jetpack.

The owner liked Thunder Cliffs' skiff; Landing Shores, the Colony, Path to the Palace and Sunspire are fine as they are.

New ride kinds in `public/bladefall-explore-mounts.js`:
- **Shared machinery.** They share one path function, `trace(f,u)`, which gives the knight's feet `{x, y, a, flip, hidden}` along the ride. `PATHED` lists these kinds. `heroPose()` tells the renderers how to draw the knight: `rot` (radians), `flip` (upside down), `run`/`rate`, or `air`.
  - The hook is at the top of `drawHeroAt` in `public/bladefall-respec-renderer.js`.
  - The legacy renderer gets it around `drawHeroFull` in index.html.
- **Previews.** Each kind also has a gallery preview: `preview()` builds a synthetic ride and reuses `trace`.

| # | Region | Now | How it rides |
|---|---|---|---|
| 4 | Hollow Marksman | **The Recruit's Ballista** (`launch`) | A ballista stands at each end, aimed up the road. The knight rides the bolt on a ballistic arc (`arc: .2` of the distance, capped to the view), and the bolt tilts along its path. |
| 7 | Frostfell | **The Perfect-Day Sled** (`ground`, travels) | Two dogs in harness pull the sled along the region's floor: `profile()` follows the floor nearest the last height, keeps its height over gaps and is smoothed. The sled tilts with the slope, both uphill and downhill. It stays where it stops. |
| 8 | Frost Sorcerer | **The Winter Road** (`slide`) | No drake. The kept little winter is now a frost fox. It runs just ahead and freezes an ice road out of the air; the road melts behind the knight, who skates it. Frost cairns mark both ends, and the fox waits at the end nearer the knight. |
| 9 | Emberdeep | **The Quota Cart** (`rail`) | An actual cart ride. The knight sits in the cart on rails laid along the (heavily smoothed) floor, with sparks. The world goes dark apart from the cart's lantern (`darkness()`). The cart is gone from its roost while it runs. |
| 10 | Ember Colossus | **The Automaton's Throw** (`throw`, stays behind) | The automaton throws him on a true ballistic arc. He tumbles through two somersaults and lands on his feet, with speed lines instead of the comet trail. The automaton stays where it threw from; at the other end, Up calls it over. |
| 11 | The Inversion | **The Ceiling Way** (`ceiling`) | Gravity turns over: he falls up to the neighbours' ceiling (a band drawn `cruise` 340 above the higher end), runs it upside down, and falls back down at the far end. Hatches mark both ends. |
| 12 | Void Tyrant | **The Other Side** (`rift`) | Mirror shards hang about every 1500 units. He steps into one, streaks as light to the next and steps out, repeatedly. |
| 13 | Abyss King | **The Last Alarm** (`sprint`) | Ringing the bell sends shock rings out. He sprints the throne road on foot at bell speed, with afterimages and speed lines, while "every door opens for one breath". |

Unchanged: 0 Bellwing; 1 moths; 2 Silas's chain line; 3 kite; 16 skiff; 17 rocket; 18 crane; 19 cloak; 20 moonflower. Regions 5 and 6, which were still doors, changed in 7.348; see below.

**7.348.0: no shortcut is a plain door any more, and the knight is drawn steadily.**

| # | Region | Now | How it rides |
|---|---|---|---|
| 5 | Ruined Keep | **The Archivist's Bell-Ropes** (`swing`) | The Keep's bell-ropes hang every ~900 units. He swings rope to rope, with release points in the air between them. Each swing dips under its rope's bell, the rope is drawn to his hands, and he tilts with it. Bell posts mark both ends. |
| 6 | The Warden | **The Keeper's Cage Run** (`cage`, travels) | He steps into the jailers' iron cage. It is hoisted to an overhead rail (`cruise` 300, hanging 170 below), runs along it swaying, and is lowered at the far end. The cage stays where it stops; at the empty end, Up calls it over. |

- **No more flashing.** Rides used to give the knight invulnerability every frame, and its hurt-blink made him flash for the whole ride. The world is held still during a ride, so `update()` now sets `p.invuln=0` and `p.hurtFlash=0` instead, and he is drawn steadily, as in normal play.
- **Faded rides (a setting).** Settings › Camera & Motion › **Faded rides**, under Reduce flashes. It is stored as `meta.rideGhost`, default off. When it's on, the knight is drawn at a steady 50% alpha from boarding to landing on every quest shortcut, which reads as him passing through the walls and rock the rides cross.
  - Code: `BladefallMounts.heroAlpha()`, used by `drawHeroAt` in the respec renderer and around `drawHeroFull` in the legacy one.
  - The owner wants to try both looks; keep whichever they choose, and consider making it the only one.
- **Tests:** `scripts/explore/mounts-tour.mjs --ghost` runs the tour with faded rides on.

**Testing:** `npm run verify:mounts-tour` covers all 18 regions both ways, `verify:mounts` and `verify:mounts-test-mode` also pass, and every new ride was checked in mid-ride screenshots and in the gallery.

The ground-following rides (sled, cart, sprint) pass through walls and gates along the floor, which the stories cover ("every door opens"). If a region shows something ugly there, give its mount a cruise or its own path.




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

- `public/bladefall-explore-mounts.js` (7.345: test mode, `preview`; 7.346: home and entrance roosts, `store()`/`perchOf()`/`noteReached()`/`placeRoosts()`, no Deep Line; 7.347: `trace`/`profile`/`heroPose` and the new ride kinds and art)
- `public/bladefall-respec-renderer.js` (7.347: the `heroPose` hook in `drawHeroAt`)
- `public/bladefall-side-story-world.js`
- `public/bladefall-respec-renderer.js`
- `public/index.html`: Watch finish routes, mount hooks, version, and (7.345) the Base 5-tap toggle, the ✦ line, the gallery button, `openShortcutGallery()` and `.card.scgallery`.
- `public/sw.js`
- `public/bladefall-explore-routes.js`
- `scripts/bladefall-bot.mjs`
- `scripts/explore-routes/build.mjs`, `plans.mjs`, `plan-kit.mjs`, `plans/*.mjs`, `plans-wip/03.mjs`
- `scripts/explore/mount-check.mjs`, `mounts-tour.mjs`, `mounts-test-mode.mjs` (7.345)
- `package.json`, `build-deploy.sh`

## 4. 7.349.0: tester's tools behind test mode, a real New Game, a swinging swing

The owner wants to send the online build to friends for feedback, so the tools for testing and editing are hidden until test mode is switched on.

**Explore's test mode**
- Turn it on or off with five quick taps (within 3 s) on **Base or Fractured** in Level Select. Both tabs then show ✦, a gold line says it's on, and it is kept per device (`bladefall.mounts.test`).
- It is what shows:
  - ▶ Watch, ● Record, Watch all, and Export recordings in Level Select (`addExploreWatchButtons` runs only in test mode);
  - the **✦ Quest shortcuts** gallery button;
  - **Edit this level** in the Explore pause menu. That button also appears with the older developer unlock, `meta.devUnlocked`.
- It still opens every quest shortcut in level-select runs (section 2.b2).

**Ascend:** **Edit this level** in the pause menu now needs Ascend's own test mode (`save.assist.testMode`, five presses of Screen shake in Ascend's options). See `bladefall-pcore-view.js`.

**New Game / Begin New Dream really starts over.**
- **The bug:** `resetCampaignForNewGame()` reset only a list of fields. Side stories, Mara's chart, Act Two, quest mounts and perches, hints, gate trials and more survived.
- **The fix:** it now rebuilds `meta` from `META_DEFAULTS`, keeping only `NEW_GAME_KEEPS` (both in index.html): settings and controls, the leaderboard-facing records, achievements, skins, and the developer unlock. It then applies the fresh module states as before and saves.
- The factory reset (five presses of Reset Controls) is unchanged.
- Ascend's progress, kept under its own keys, is untouched.
- Check: `scripts/explore/new-game-check.mjs`.

**Ruined Keep bell-ropes: a real pendulum.**
- `swingPlan()` and `swingAt()` in the mounts module:
  1. He leaps to the first rope.
  2. He swings on a rope-length arc (`L` 330, ±0.9 rad), fast through the bottom and slowing at the ends.
  3. He lets go at the top, flies to the next rope and catches it, and drops to the floor after the last.
- Ropes are drawn bowed (`ropeLine`). The one he holds runs to his hands and bows with the swing. Released ropes swing back and settle; ropes ahead sway.
- He tilts with the rope.

**Test updates:** `record-check`, `workshop/bridge-check` and `workshop/explore-bridge-check` now switch test mode on before reaching the gated buttons.

