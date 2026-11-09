# Ascend in Godot — the first three worlds and their Fractured versions

Version **0.53.0** · Player-facing Bladefall sampler for mobile web, Android, Windows and macOS: Outskirts, Woods and Causeway, their Fractured routes and Cores 1–3. Open `exports/Bladefall.app`, or share `exports/Bladefall-macOS.zip`. The app includes its own engine and all game resources.

## Sequential advanced worlds · 0.48.0

Completing bases 1–3 opens Fractured Outskirts. Completing all three Fractured worlds then opens Core Outskirts. Each advanced route unlocks independently in order: Outskirts → Woods → Causeway. Existing discoveries cannot bypass the prerequisite clear. Fractured flower pickups require an earned crown. Core scores use their original base regions; Fractured Outskirts now reuses Midnight Field, while Fractured Woods and Causeway retain their distinct scores.

Movement Workshop is removed from the game, including developer navigation and its play launcher. The shared world4 authoring data remains an internal source for already integrated affixed rooms. Transport-story changes are proposal only this release: see [next-LLM handoff](research/TRANSPORT-STORY-NEXT-LLM.md).

## Continuous lifts and story scenes · 0.47.0

Title Settings preserves music; in-game pause still pauses it. Affixed transfers now go directly from finish to the next puzzle in one continuous ride, with no intermediate gallery stop or second descent. Individual puzzle checkpoints remain. Existing galleries stay available for inspection.

The first lantern-route arrival establishes the collapsed road, lights the route and lowers the cradle. Outskirts, Woods and Causeway use district-specific scenery/captions. The reveal is remembered across saves; developer mode replays it once per restarted world. Clears persist before a short in-world ending: the knight steps along the safe finish ledge, lanterns dim, the next district appears in the skyline and the earned reward rises before the results card fades over the same shot. Reduced motion shortens the presentation. There are no new finale rooms, quests or generated voices.

In developer/test mode, **N** completes the current challenge and advances through the normal completion/reward/unlock pipeline, preserving deaths and carried shiny status. Ordinary players cannot use it. This deliberately writes real local awards and records for testing. Watch, practice and room selection retain their ordinary restrictions unless N is explicitly used. Existing isolated comparison launchers retain their N navigation.

Optional bonus routes have purple collectible hearts, including the missing Outskirts Hang Time heart and the bell-tower bonus. Visible secret hearts can be collected by touch even when entering through practice. Affixed rooms award no bonus hearts. Hearts persist in Garden.

See [validation and implementation](research/CONTINUOUS-LIFTS-AND-STORY.md).

## Saves and progression · 0.46.0

Title Settings now contains audio, reduced motion, fullscreen, controls and quit; gameplay actions appear only while playing. The opening advances automatically, without a Skip control. Spoken dialogue defaults off with subtitles on. Continue restores eligible world attempts, including live machinery, inventory, route travel, time and deaths. Autosaves are atomic and content-versioned. Practice cannot overwrite eligible saves; carried shiny challenges always restart the world when resumed.

Any base clear earns a root; a deathless base clear makes it shiny. Black Woods and Causeway unlock persistently after the preceding base clear. All three base worlds must be complete before any Fractured route opens. Fractured crowns and Core keepsakes retain their carried deathless shiny challenges. Purple bonus hearts persist in the collection. Garden & records lives in Settings after Outskirts is complete; records remain local. Route version sampler-2 separates the changed transfer timing from older records.

Affixed-room hoists use a continuous eased arc, interpolated actor/camera movement and a lantern cradle. Existing room geometry and individual checkpoints remain intact. See [verification](research/SAVES-AND-PROGRESSION.md) and the [unimplemented story proposal](research/WATCH-STAIRS-AND-ENDINGS-PROPOSAL.md).

Earlier release entries below describe historical behavior superseded above.

## Player release · 0.45.0

Boot plays an original Willow Studios tree animation, a Bladefall bridge/knight cutscene and an animated title menu. Enter/A skips the opening; reduced motion skips it automatically. Gameplay and its clock wait until Play. The title starts a fresh journey in a discovered world. Natural onward/Fractured/Core routes are offered after qualifying clears and remain accessible from the title, so a player who leaves an ending screen can still reach newly opened routes.

Player navigation lists only worlds and real sections actually arrived at, persisted with the Garden and records. No Test/Workshop entry or unknown-world placeholders appear. Section selection is labelled Practice; Start world over begins a full eligible run. The detailed mixer, appearance selectors and animation examples are session-only developer tools. Five consecutive presses of Spoken dialogue (within two seconds of each other, with no intervening controls) enter developer mode. This shortcut is intentionally absent from the bundled player readme.

Every player chapter defaults to Illustration/Brush knight, Paper/Cutout people, Original scenery, Measured walking and Weathered/rock-strata treatment. Per-person style overrides cannot change the player preset. Exiting developer mode restores it.

Controllers support gameplay and all menus. Controls and remapping exposes keyboard, gamepad buttons, sticks/triggers, deadzone, reset and persistent bindings. Escape and Start remain menu fallbacks. Device disconnect keeps keyboard input available. No physical controller was connected on the build Mac; validation uses injected Godot joypad events and actual InputMap/UI routing.

References run in a detached simulation. They cannot move the real player, unlock rooms/worlds, alter machinery or award clears. Try yourself returns to the actual checkpoint and counts as a Retry, so the real run can still finish. A carried shiny attempt instead resets the whole world. Taking over the demonstration's position is restricted to developer mode. The first Outskirts completion explicitly explains the deathless flower-root reward.

The on-theme vector icon is included as window, boot splash and multi-resolution macOS bundle artwork. The app and launcher contain Intel/Apple Silicon binaries. The ZIP includes a readme and a self-contained app; no project checkout, Godot install or online service is needed. Signing is local/ad hoc; Apple Developer ID notarization remains a separate public-distribution step. Saves retain places/rewards/records/settings, not resumable active world attempts.

## Complete sampler · 0.44.0

Each normal world includes its ten approved workshop rooms, reached automatically at the end of the original road. Walk along each stone gallery to its lantern dock; a hoist lowers the knight to the puzzle's original spawn and collects him only after its finish requirements are met. Fractured routes retain their original physical passages and the nine Outskirts / nine Woods / ten Causeway additions. The five newest Causeway additions now live in the native World 23 scene; the superseded cover draft is bypassed. Individual room checkpoints remain available during ordinary play.

The active-play clock runs through the whole world, including the extensions and hoists. Completing the required route opens a results card and saves time and deaths to this Mac's leaderboard, separately for normal and carried shiny attempts. Pause time is excluded. Retry counts as a death during ordinary runs. Watch, direct room selection and recorded developer tours are practice and cannot award records or rewards. Start world over begins a fresh eligible attempt. Changing chapter cancels the previous attempt; returning to a partly played chapter is practice until restarted.

Garden / Records displays the three world plants and animated Core rewards. A deathless normal clear earns the root; any Fractured clear earns the crown. All three Fractured clears unlock Core Outskirts; the Cores then unlock sequentially. Any Core clear earns its animated Trumpet Sprite, Oak Wisp or Clockwork Seed. On later Fractured and Core replays, walk left a little from the world spawn to collect the owned reward and begin a fresh carried attempt. Death or Retry drops it and resets the entire world, including every Core lantern. Carrying never changes movement or machinery interactions. Complete that attempt without deaths to make the corresponding reward shiny. Ownership and local records persist; active attempts do not resume from saves.

Editable sources: normal extensions remain shared with `levels/world4.tscn`; Fractured additions are in `world21.tscn`, `world22.tscn`, `world23.tscn`. Cores are `world101.tscn`–`world103.tscn`. The player's edited World 1 scene is preserved byte for byte. The chapter editor includes all ten chapters. Room geometry and interactions remain separate from procedural reward visuals.

Earlier entries below describe development history and isolated comparison launchers. Their historical room counts and proposed drafts are superseded by this sampler.

## Compare two weight fixes · 0.43.0

Open **Play Both Weight Fixes.command** for **A · The Throw During the Launch** and **B · Meet the Weight on Its Way Down**. N switches rooms, R retries the current checkpoint, H gives an optional hint, and Watch solution plays the full reference. A combines an airborne lantern throw with its committed launch; B intercepts a descending receiver and dashes out as removing its load releases it upward. Their lower-right bypasses are closed and their receiving roofs extend to the ceiling. The previous Roof room remains unchanged in **Play Two Launch Puzzles.command**, room 2. See [design and verification](research/WEIGHT-COMPARISON.md).

## Two launch puzzles · 0.42.0

Open **Play Two Launch Puzzles.command** to test **The Weight You Must Send Ahead**, then **The Roof You Must Launch Through**. **N** switches rooms, **R** retries the current checkpoint, **H** gives its optional hint, and **Watch solution** plays a complete ordinary-input demonstration. Both have native editable rooms and recovery routes. These are two new playtest candidates; the existing chapter and cover alternatives remain separate and unchanged. See [design and verification](research/CAUSEWAY-LAUNCH-ROOMS.md).

## Compare both cover ideas · 0.41.0

Open **Play Both Cover Ideas.command** to test **A · Spend the Shelter**, followed by **B · Deliver the Brute**. A now starts at the charge encounter: jump and dash through its thorned overhead opening, land behind the returning guard and retrieve the shard. B uses a high left refuge, a jump-dash crossing over a spiked gantry, and a prompt fold before the brute charges again. Both retain forgiving ordinary-hop endings, catch floors and individual checkpoints.

Walk out of A to reach B, press **N** for the next test, or use **Esc → Explore a section** to select either room. Each has its own checkpoint, **H** hint, full **Watch reference**, and editable native room in `levels/causeway-cover-comparison.tscn`. The comparison loads only with `--cover-comparison`; the current chapter and its 43 definitions remain unchanged. See [design and verification](research/COVER-COMPARISON.md).

## Two-stage cover puzzle · 0.38.1

**The Cover You Must Take Away** now requires separate leftward and rightward brute lures. Folding the cover opens the descent; it no longer opens the route automatically. Escape each charge onto a sheltered perch and use the first breach to cross to the opposite bait pocket. The final jump and other rooms retain their accepted geometry. Open room 41 with `--world 23 --room 41`, or select its name under **Esc → Explore a section**.

## Next three Fractured Causeway rooms · 0.38.0

**The Bridge You Must Build Backwards**, **The Cover You Must Take Away**, and **The Delivery You Cannot Ride With** are ready for playtesting. They develop construction order, the brute's blocked sightline, and separate delivery routes for knight and lantern. Each preparation leads to a powered finish using existing movement and machinery.

Open **Play Next Fractured Causeway Rooms.command**, or `--world 23 --room 40`. Use **Esc → Explore a section** for rooms 41 and 42. Every room has its own checkpoint, optional **H** hint, complete **Watch reference**, and native editable data. The prior three accepted Causeway rooms are unchanged; their original launcher still opens room 37. The chapter now has **43 definitions and 19 required main challenges**. The eight retired studies remain absent.

The entire road clears **26 sections in 16,492 normal-input frames with zero deaths**, preserving all **12,775 earlier input frames** as an exact prefix. Shared physics, art, voices, quests, browser files and other chapters are unchanged. The approved Woods additions remain in their separate checkout. See [design and verification](research/FRACTURED-CAUSEWAY-NEXT-THREE.md).

## Three spatial Fractured Causeway puzzles · 0.37.0

The approved replacements are implemented: **The Line Behind the Brittle Wall**, **The Weight You Must Take Back**, and **The Wall You Must Fold After Climbing**. They use the existing brute, lantern, recoil plate, hinged arm and one-way lines. The first directs the same brute into two walls; the second transfers a stored load from lantern to knight before an empty-handed launch; the third turns a climbed wall into the receiving runway for a wavedash finish.

Open **Play Fractured Causeway Rooms.command**, or `--world 23 --room 37`. Choose the other two by name under **Esc → Explore a section**. Each has its own checkpoint, optional **H** hint, complete **Watch reference**, and native editable room. Chapter 23 has **40 definitions and 16 required challenges**. The eight retired introductory studies remain absent. Other chapters, browser files, physics, art, voices and quests are unchanged. This Causeway checkout is separate from the approved nine-room Woods checkout.

See [design and verification](research/FRACTURED-CAUSEWAY-THREE-PUZZLES.md). The earlier [proposal](research/FRACTURED-CAUSEWAY-REVIEW-AND-PROPOSALS.md) records the approved design intent.

## Cores 1–3 · Claude, branch `claude/godot-cores`

The browser game's first three Cores are now chapters: **Core 1 · Outskirts**, **Core 2 · Black Woods** and **Core 3 · Causeway** (worlds 101–103, under Esc → chapter). Each is one continuous room in parts. Its save lanterns keep the next part, and death and **Retry** return you to the latest one. **Start world over** clears them. Each Core plays its base world's score and wears its backdrop (Outskirts ruins, Black Woods forest, Causeway dusk), and the bar reads `CORE · PART n / m`.

- **Data:** `node tools/export-world.mjs --world=101` (or 102, 103) exports from `public/bladefall-climb-core-tapes.js` and `bladefall-climb-cores.js`. Those load only for Core exports, so the existing world exports and their `--check` stay unchanged. The scenes are `levels/world101.tscn` to `world103.tscn`, generated with `authoring/generate.gd -- --world 101 --force`.
- **Engine:** I ported four Core features from the browser:
  - `scripts/core_checkpoints.gd`, the save lanterns;
  - `crumbleExtraFrames`, 60 extra frames on cracked stone in Cores;
  - `counterweightFlow`: a lift-carried hyper keeps its speed and refills the dash, and the momentum resets as the browser's does;
  - `cameraZones`, a look-ahead in the Black Woods Core.
  
  `riding()` now counts only a live knight, matching the browser's `riderOf`. The Woods Core starts on cracked stone, which exposed the difference.
- **Parity:** `node tools/parity.mjs --world=101` (or 102, 103) compares each Core's full route, Codex's varied-input probe, and two new probes that pass a save lantern and then die. Every frame matches the browser. Worlds 1–3 and 21–23 still match exactly.
- **App:** `tests/cores.gd` (39 checks) selects each Core and confirms:
  - Watch clears it without dying and lights every lantern in order (6, 8 and 4);
  - death in normal play respawns on the earned lantern;
  - Retry keeps it, and Start world over clears it.

The lanterns are simple posts with a lamp, lit once saved. They are placeholders for real art.

## Close the Woods route bypasses · 0.36.0

**Bridge is banked and unchanged.** The three Woods studies now use the approved physical route constraints:

- **Pod Beneath Two Ceilings:** the canopy reaches the ceiling and has a guarded outer face, closing its elevated rest/refill shortcut while keeping the low powered launch clear.
- **Ring It After the Crossing:** amber approach roots replace the fixed roof. The upper bell preserves the launch dash, blue housing constrains the pod approach, and the farther blue landing rewards speed carried through the rebound.
- **Wall You Must Bring Back:** an amber overhang caps the climb, making the outward high pod rebound useful for reaching the returning crumble ledge. The final low launch home remains.

Use **Play Fractured Black Woods Rooms.command**, or select each room by name under **Esc → Explore a section**. All three have updated **H** hints, complete **Esc → Watch reference** recordings and their own checkpoint. The existing Bridge launcher opens the accepted 0.35.0 Bridge. No physics, quests, voices, art, other levels or workshop rooms changed. See [route requirements and verification](research/FRACTURED-WOODS-ROUTE-REQUIREMENTS.md).

The signed app passed **24 packaged suites**, including **1,221 shortcut variations** and three historical positive controls. Five fresh bounded searches found no ordinary-movement finish or omitted-preparation finish within their stated limits. The Woods campaign recording reaches the crossroads through 24 regions in 8,685 frames without deaths. The packaged checks use a corrected test-only overlay and require actual test output; older exit-code-only counts below are unreliable.

## Previous Woods build and accepted Bridge · 0.35.0

The Woods layouts below are historical and superseded by 0.36.0. Bridge remains accepted in this form.

The four latest studies now connect preparation to sustained Fractured movement. Bridge restores its original six-tile carriage roof, six-tile crumble opening and higher home flag, with only the local setup-hop ceiling raised. The former ordinary-jump recovery no longer clears that finish.

The existing **Play Easier Bridge.command** launcher still opens Bridge. **Play Fractured Black Woods Rooms.command** opens the revised Woods trio:

- **The Pod Beneath Two Ceilings:** reach the higher bell with the first rebound, return low, wavedash from a short amber runway and use the recovered dash to restore the distant blue landing.
- **Ring It After the Crossing:** reach the bell window below, circle the roof to reach it above, then link its phase change to a wavedash, a momentum-preserving high pod rebound and the final blue landing.
- **The Wall You Must Bring Back:** leave the restored wall for an outward pod transfer, dash back through it onto a crumbling ledge, then wavedash under the low roof and dash upward beside home.

The old harness reported 23 packaged suites for 0.35.0, but those counts were invalid: excluded test scripts could fail to load while Godot returned zero. The 0.36.0 harness mounts test-only resources and rejects missing assertions and runtime errors. Fresh bounded searches found no ordinary-movement substitute in the three payoff tests and no pod-free route in the three spawn tests; their budgets and limits are recorded in the notes. Both full chapter journeys reach the crossroads without deaths.

All four retain independent checkpoints, updated **H** hints and complete **Esc → Watch reference** recordings. No movement constants, quests, voices, art, other room layouts or workshop rooms changed. The camera and native editor use the revised geometry. See [design and verification notes](research/FRACTURED-DIFFICULTY-REVISION.md).

## Previous build: easier Bridge and three Woods additions · 0.34.0

The following describes the earlier build; 0.35.0 replaces its four layouts and references as described above.

**Play Easier Bridge.command** opens the revised **Bridge Above Your Landing** in chapter 21. Its roof and boarding opening are wider, its setup hop has more headroom, and its home landing is closer. The reference hops in place and escapes straight upward after the launch; the former rightward correction is gone. A later landing can still be recovered from. The crumble preparation and returning carriage remain useful, with unchanged movement and device timings.

**Play Fractured Black Woods Rooms.command** opens the first of three additions at the end of chapter **22 · The Fractured Woods**:

- **The Pod Beneath Two Ceilings:** rebound high to the bell, then approach the same pod from the exposed side of its newly closed ceiling and rebound low through the opening.
- **Ring It After the Crossing:** use the shared bell from both faces, restore the upper blue route, then make a phase-preserving side rebound toward home.
- **The Wall You Must Bring Back:** remove the wall to cross, restore it to climb, then use the upper pod and dash back through it to the blue landing.

Each has its own checkpoint, **H** hint and **Esc → Watch reference**, plus selection by name under **Esc → Explore a section**. The guided Woods routes use normal jumps, dashes, sword rebounds and climbing; no mandatory hyper or wavedash was added. An advanced super/wall/bell alternative in the first room remains valid. Source chapter 22 now contains **40 definitions and 16 required challenges**, including these first three of the planned nine new Woods rooms. The nine added Outskirts rooms and thirty base-world workshop extensions remain in place.

The old harness reported **23 packaged verification suites** for 0.34.0; that packaged count is unreliable because of the loading/exit-code flaw corrected in 0.36.0. The Woods campaign reference covers **9,177 frames and 24 regions with zero deaths**; the Outskirts reference remains deathless across **17,419 frames and 28 regions**. Checks include the new rooms, recovery routes, earlier accepted layouts, independent resets, camera framing, existing quests, all thirty campaign workshop additions and editor playback.

See [implementation and verification notes](research/FRACTURED-WOODS-FIRST-THREE.md). No new art, quests or voices were generated. The shared workshop editor remains at thirty rooms; these additions are editable in the native chapter-22 scene.

## Nine added Fractured Outskirts rooms · 0.33.0

**Play Latest Fractured Rooms.command** opens **The Catch You Leave Behind**. In chapter **21 · The Fractured Outskirts**, use **Esc → Explore a section** to select Catch or the three new rooms:

- **The Door That Stops the Stone:** use the closed gate as the first stop, weight its plate, then relocate the stone through the opened gate.
- **The Stone That Gives You Back the Dash:** prepare a recovery landing beyond the throat before spending the dash needed to reach it.
- **The Bridge Above Your Landing:** remove the crumble cap to expose the returning, lowering carriage roof for the homeward wavedash.

Catch now ties its hook approach to clearing the final throat: return to the stone, wait for the carrier to pass, lower the stone, then catch and release onto the launch lip. Wavedash left and dash up to the home flag. **H** supplies a hint; **Esc → Watch reference** demonstrates each complete route. All four retain independent checkpoints and normal movement.

This brings the added Fractured Outskirts study lineup to **nine**, pending your judgment of the new rooms. Chapter 21 has **47 definitions and 23 required challenges**. Its continuous recording covers **17,419 frames and 28 regions with zero deaths**. The five other accepted added layouts and recordings are preserved. Fractured Woods and Fractured Causeway are unchanged; the base-world workshop extensions remain ten per world, thirty total. No new art, quests or voices were generated.

The [design and implementation notes](research/FRACTURED-CATCH-REVISION-AND-NEXT-THREE.md) explain where existing stone physics required fixed launch lips and how Bridge's demonstrated sequence differs from its proposal. Source verification includes all four live clears and complete Watch exits, nearby setup timings, preparation counterfactuals, native parity and death/retry resets. The signed 0.33.0 macOS app passed twenty relevant suites, including the full campaign journey, all authored Fractured Watch routes, the thirty-room campaign workshop integration and editor playback.

## Campaign puzzle extensions and section selector · 0.32.0

Each base world now has its **ten approved workshop puzzles** after the final crossroads. At the blue arch beside the crossroads checkpoint, press **Up** to enter. Reach each gold flag with its required return items or stakes, then press **Up** to continue. The tenth flag returns to the crossroads. Every puzzle keeps its own retry checkpoint, normal movement, approved geometry, optional hints and selectable demonstrations. Campaign completion stays separate from Movement Workshop practice completion; restarting a world clears its campaign puzzle marks.

**Esc → Explore a section** lists named playable sections in road order, followed by side routes, secrets and passage previews. Internal unnamed passage pieces remain in the world but are no longer selectable destinations. Menu positions map to stable room IDs; launcher room indices and recordings remain unchanged. Menu numbers now reflect the visible list, so older release notes below retain their historical raw room numbers. Select a room by its name.

The editable puzzle source remains **levels/world4.tscn**: each base world reads the matching ten rooms from that saved scene. Editing an approved workshop layout therefore changes its practice and campaign versions together. Existing base-world native scenes are preserved, including local World 1 edits. The extensions use finish-to-next-room navigation so the enclosed approved layouts and return objectives stay intact; they do not add connecting platforming passages.

The proposed Catch overhaul and three additional Fractured concepts are documented in [Catch revision and next three proposals](research/FRACTURED-CATCH-REVISION-AND-NEXT-THREE.md). They were subsequently built in 0.33.0, described above. The following section records the 0.32.0 changes.

Verification: `tests/section_menu.gd` checks actual selection, ordering, valid practice spawns and restart behavior across all six campaign worlds plus the workshop. `tests/campaign_workshop.gd` checks preservation, all thirty live campaign clears, every demonstration, entrance/finish navigation, required pickups, independent retry/death resets, completion isolation and the unchanged user World 1 scene. Existing road, quest, workshop and Fractured regressions remain applicable. The signed 0.32.0 packaged app passed fifteen suites, including the 264-check standalone workshop suite; GPU captures cover all six section menus and the three campaign entrances.

## Three more Fractured Outskirts rooms · 0.31.0

**Play Next Fractured Rooms.command** opens **The Ceiling You Walk On**. You can also choose chapter **21 · The Fractured Outskirts**, rooms **42–44**:

- **The Ceiling You Walk On:** break the upper crumble slab, settle below it, then wavedash under the divider and dash upward through the opening.
- **The Catch Below the Exit:** reel down beneath the fixed thorn screen, reel up on the far side, and recover on the shelf before the final wavedash.
- **The Runway Coming Toward You:** wake the carriage, climb to the sheltered bank, and dash to the thin drop shelf. Use **Down + Jump** to drop, land a down-left dash on the returning roof, then rise beside the housing to the home platform and upper gallery.

Each has its own checkpoint, **H** hint and **Esc → Watch reference**. They follow Door You Need Shut and precede the crossroads. World 21 now contains **44 definitions and 20 required challenges**. All 41 previous room layouts and recordings are retained, including the accepted carriage room and both wavedash revisions. Only the crossroads' incoming link and placement change to extend the road. The full reference covers **12,502 frames and 25 regions with zero deaths**, preserving the entire prior 10,358-frame input prefix.

These use existing physics, one dash, ordinary air steering and the established wavedash. No new art, quests, voices or movement constants were added. The native Godot scene includes all three; the separate browser workshop editor remains at 30 rooms. See [the designs, implementation details and verification](research/NEXT-THREE-FRACTURED-PROPOSALS.md).

## Fractured wavedash finishes · 0.30.0

**The Lower Runway** and **The Door You Need Shut** now finish with a wavedash. Keep their original preparation, then reach the small landing: hop left, dash down-right onto it and jump as the dash returns. Carry the speed across the gap and use the recovered dash upward-right to the exit. **The Other Side of the Carriage** keeps its accepted layout and recording.

Use **Play Fractured Puzzle Rooms.command**, or chapter 21, rooms **39–41**. **H** explains the wavedash; **Esc → Watch reference** demonstrates it. The camera shows the far landing before the final commitment. Each room retains its own checkpoint and retry. The gap and overhead clearance replace the old super shortcuts through ordinary geometry; no action counter or modified physics decides completion.

The full road now takes **10,358 frames**, with zero deaths. The original 7,907-frame chapter prefix is preserved. Room count remains **41**, with **17 required challenges**; the workshop remains **30**. The first and third rooms are wider, shifting the carriage and later sections along the road without changing the carriage's local layout. Tests protect all 39 untouched definitions and their recordings, reproduce five former shortcuts, and check 3,600 grounded-hyper and ordinary jump/dash alternatives from the small landings. Bounded searches supplement those checks; they do not prove every possible alternative impossible.

The [three further Fractured proposals](research/NEXT-THREE-FRACTURED-PROPOSALS.md) were subsequently approved and built in 0.31.0, described above.

## Three Fractured Outskirts puzzles · 0.29.0

**Play Fractured Puzzle Rooms.command** starts at **The Lower Runway**. Alternatively, select chapter **21 · The Fractured Outskirts** in Esc, then rooms **39–41**:

- **The Lower Runway:** lower the stone to make a clear launch surface beneath the ceiling.
- **The Other Side of the Carriage:** rest at the far stop, change faces, and use the return for a wall jump toward home.
- **The Door You Need Shut:** travel through the open doorway, remove its lantern weight, then use the closed door as the final runway.

They follow Ring It from the Other Side on the continuous road, before The Broken Gate crossroads. Each has an independent checkpoint, **H** hint and **Esc → Watch reference** demonstration. The question appears first; the detailed route remains optional. The door room frames its elevated lantern from the entrance.

World 21 now has **41 room definitions and 17 required challenges**. All earlier layouts and individual recordings are preserved; only the old ending links and crossroads placement change to accommodate the additions. The complete road reference takes 10,172 ordinary-input frames with zero deaths. These use existing mechanics and the chapter's taught supers, without new movement constants. The 30-room workshop and its browser editor remain separate; chapter-21 rooms are editable in Godot. See [the approved designs and implementation evidence](research/FRACTURED-OUTSKIRTS-PROPOSALS.md).

## Six new rooms · 0.28.0

**Play Six New Rooms.command** starts at room 25. The active workshop now contains **30 rooms, ten per biome**. The existing 24 definitions, recordings and positions are preserved.

- **25 · The Load That Opens the Lift** (Outskirts): bring the lantern down to a pressure plate, then reuse the lift empty-handed through the held door.
- **26 · The Descending Invitation** (Outskirts): send the lift down, collect both lower shards, and launch from its rising return.
- **27 · The Lantern and the Missing Root** (Woods): prepare the blue carrying road, deliver the load, then restore the amber finish.
- **28 · The Landing You Make in Midair** (Woods): loft through a ghost cap before restoring the blue landing with a late upward dash.
- **29 · The Spring Under the Stone** (Causeway): move the obstructing stone to a distant dock, recoil onto it, then recover for the flag.
- **30 · The Launch Waiting on the Return** (Causeway): recoil onto the descending lift, visit the lower shard, then use its rising return to finish.

Each has its own retry, hint and Watch demonstration. The simple editor now offers **Pressure plate** and **Weight-held gate**. These rooms use existing mechanics and the normal one-dash kit. Player feedback will determine which remain in the liked lineup. Earlier release notes below describe their original milestones.

## Five new puzzles · 0.27.0

**Play New Puzzle Rooms.command** starts at room 20. The browser editor also includes all five:

- **20 · The Root That Stops the Stone** — create a useful stop, then remove it. Watch offers the pod route and an alternate plan that restores, climbs and dashes away the root.
- **21 · Two Ways Through the Canopy** — two demonstrations use different bell orders and arrival phases to reach the same flag.
- **22 · The Ferry Beneath the Roots** — prepare the ferry before leaving, bring the visible shard home, then use the return movement before the final phase change.
- **23 · The Weight You Can Finally Move** — let the arm take over the first plate's load, transfer the lantern, then free that plate for the finish.
- **24 · The Dock You Need Only Once** — use a temporary stone dock for service access, turn B into a return bridge, send the stone onward, then turn B upright for the final launch.

All use the normal one-dash kit and existing mechanics. The original nineteen room definitions, placements and recordings are preserved. These are separate rooms with their own retries; no connecting passages are added. The five additions bring each biome to eight rooms, pending your playtest verdict.

## Active workshop · 0.26.0

The introductory Causeway studies **Stored Rise**, **Turned Span** and **Loaded Span** have been removed from both the game and editor. The active lineup is **30 rooms: 10 Outskirts, 10 Black Woods and 10 Causeway**. Causeway’s first puzzle set is now rooms **14–16**, and its dash puzzles are **17–19**. Both launchers follow the new numbering. Older editor files retain surviving rooms by ID and cannot restore the retired studies to the active list. The mechanism palette remains available.

Five further rooms are **proposals only**: see [the next-room proposals](research/NEXT-FIVE-PROPOSALS.md). No new rooms or voices were built in this update.

The release notes below use their original room numbering.

## Causeway dash puzzles · 0.25.0

Rooms **20–22** add **The Landing You Must Spend**, **The Obstruction Is Your Landing**, and **Your Shortcut Cannot Carry the Weight**. Double-click **Play Dash Puzzles.command**, or choose them in Esc. All three retain the normal one-dash kit; H shows an optional hint and Watch demonstrates a deathless ordinary-input solution. They are available in the browser room editor. The original 19 rooms and their recordings are preserved.

## Causeway puzzles · 0.24.0

Open **Play Causeway Puzzles.command**, or choose workshop rooms **17–19** in Esc:

- **The Bridge You Must Remove:** cross for the return shard, then fold the borrowed bridge away because it blocks the spring launch home.
- **The Wrong First Turn:** stage arm B away from its final useful pose, move A, visit its shard shelf, then finish B upright. Turning A first locks the pair; R restores the nearby checkpoint. A/B labels identify the hubs.
- **Leave Your Weight Behind:** park the lantern on a recoil plate to hold it below the arm's next position while you work at the distant hub. Retrieve it after opening the upper route.

These are separate puzzle checkpoints following the earlier machinery introductions. Each has an optional H hint and an ordinary-input demonstration. All sixteen previous room definitions and recordings are preserved. The editor now includes **Lantern weight**, which can be placed, moved and duplicated. A resting lantern travels with the recoil plate, keeping it loaded; taking it away releases the plate. This corrects contact loss during loading without changing player movement constants.

## Causeway workshop rooms · 0.23.0

Open **Play Causeway Rooms.command**, or choose workshop rooms **14–16** in Esc. These are three separate checkpoints with optional H hints and ordinary-input demonstrations:

- **The Stored Rise:** load and release two recoil plates, recovering between launches.
- **The Turned Span:** turn an upright arm into a bridge, use a short hop beneath the overhead teeth, then climb the far steps.
- **The Loaded Span:** launch to the hub landing, turn and cross the arm, then rise straight up from the far plate before steering over the final teeth.

These are no-dash studies using the existing jump, climb, strike and lift-momentum rules. All thirteen earlier workshop layouts and recordings are preserved. The simple editor now places **Recoil platform** and **Hinged arm** objects. Recoil settings expose width, load depth, loading time and release speed; arm settings expose hub position, length and starting direction. Saving edits clears the changed room's outdated demonstration, with its previous version retained in backups. Older thirteen-room imports preserve the new rooms.

## Play

On this Mac, double-click `Play Ascend.command`. It uses the local pinned engine; on a fresh Mac checkout it downloads the official universal binary and checks its SHA-256. Alternatively, open `project.godot` in Godot and press F6/F5, or run:

```sh
prototypes/godot-ascend/tools/run.sh
```

The local standalone application is `exports/Bladefall Ascend Prototype.app`. Rebuild with `tools/build-macos.sh`. The app carries its own Godot binary and packed project, and runs without the repository or Node. Exports and engine downloads are ignored by Git. This first package uses the universal editor binary as its runtime carrier (about 352 MB), rather than a size-optimized export template. The game data and scripts are packed separately in the small PCK. The local app is ad-hoc signed for local use; it is not Developer ID signed or notarized for distribution.

Controls now match the browser defaults: **arrows** move/aim, **Space/C/J** jump, **D/X/K** dash, **A/Z/Shift/L** cling/climb/carry/throw, **W/V/I** strike, **F/O** parry, **P** portal and **R** retry. Each room’s original action locks still apply. **Esc** opens the pause menu; **M** toggles music and **F11** toggles fullscreen. The standard controller equivalents are mapped too (stick/d-pad, A jump, X/B dash, LB/LT cling, Y strike, RB portal and RT parry).

The pause menu includes a **chapter selector** for The Outskirts, Black Woods, Broken Causeway and their three Fractured versions. All six chapters are constructed before play, and switching preserves each chapter’s progress and position. **Start world over** resets the current world, bearings, room machinery, deaths and dialogue history without closing the app. Retry resets only the current room and preserves bearings and lit stakes. The pause menu also contains the room selector, Watch/Take control, a dedicated sound mixer, spoken dialogue toggle, reduced motion and lighting comparison. Audio and display preferences persist locally. The app starts directly in the game rather than an engine-study toolbar.


Returning Seed now requires all three route pickups to be brought back to the flag. The browser editor offers **Return shard · one** and **Return shards · all**, with a shared room finish rule and live pickup counter. Death/retry restores unbanked shards.

## Two more Black Woods rooms · 0.21.0

**The Overturned Hollow** and **The Returning Seed** are workshop rooms **12 and 13**. Open **Play New Woods Rooms.command**, or choose either room in Esc. H provides an optional hint; Esc includes a deathless ordinary-input demonstration. Both rooms are available in the simple browser editor.

Overturned Hollow uses amber as starting floor, missing ceiling and restored landing. Returning Seed uses one pod twice through different faces of a phase-controlled housing: rebound outward in blue, reach the bell from the far loop, open the roof in amber, then rebound and dash to create the blue homeward landing. The outward cut is diagonal down-left with jump held, followed by steering right; the upper return approaches the same pod from the other side. This develops the proposed two-way use with the actual existing rebound rules.

The previous eleven layouts, movement constants and campaign scenes are preserved. No quests, voices, art conversion or campaign connections were added. Old eleven-room editor files retain both new rooms when imported.

## Black Woods puzzle workshop · 0.20.0

The **three initial Black Woods rooms** are available in the Movement Workshop, numbered **9–11**: The Borrowed Branch, The Crooked Orchard and The Hollow Crown. Borrowed Branch remains a short introduction; Orchard and Crown are rebuilt around phase preparation and route commitment. The original eight rooms and campaign layouts are preserved. Open **Play Black Woods Puzzles.command**, select room 9 with Esc, or launch `-- --world 4 --room 8`.

Use **W + arrows** to cut, **Space** to jump (hold it for a high downward pod rebound), **D + arrows** to dash, **A** to cling, **R** to retry, **H** for an optional hint and **N** for the next room. Esc offers solution demonstrations.

The six weaker standalone Woods layouts are retired from the active list. Older six-, eight- and seventeen-room editor documents merge surviving rooms by ID. A seventeen-room import retains its complete original document in browser storage before filtering retired rooms. Native backups and Git also preserve the earlier layouts. No new quests, speech or campaign connections are included. Gameplay retains its 8px grid and collision independent of visuals.

See [the room descriptions and verification](WORKSHOP.md).

## Two workshop rooms added in 0.18.0

The workshop now has **eight rooms**. **The Divided Tower** offers two ordinary-input solutions around one counterweight: take its rising launch to the airborne refill pair and cross high, or dash through the opened lower passage and catch the returning weight as a foothold. **The Falling Gallery** uses a crumble platform first as a dash-restoring foothold, then as the opening through which you return to the retreating ferry with the shard.

Both rooms have two demonstrations in **Esc → Demonstration**, including a Gallery return discovered by independent input search. The original six rooms are preserved. Open **Play Movement Workshop.command**, press Esc and choose room 7 or 8; **N** advances rooms. They are also editable directly in **Edit Workshop Rooms.command**. Older six-room editor exports/drafts merge into the current workshop while retaining the appended rooms.

The new native tests compare both Tower routes under separate mechanic restrictions, retain actual solver-discovered shortcuts as positive regression controls, and search for fresh inputs instead of only replaying intended tapes. Search failures remain bounded evidence. See [WORKSHOP.md](WORKSHOP.md) for the design and verification limits.

## Dedicated room editor · 0.17.0

Double-click **Edit Workshop Rooms.command** for a simple local browser editor of all thirteen workshop rooms. Choose a terrain brush, paint on the grid, or place and drag objects. Select a moving block to drag its destination, resize it, or change its pause and return timing. Select a rectangle of terrain to move ground. Undo/redo, exact positions, room settings and optional hints are available without Godot's scene tree or Inspector.

**Save & play** saves directly to the native workshop scene and opens that room in the actual Godot project. Every save keeps a backup; unsaved browser drafts can be recovered after reload. Import/export provides a portable editable file. Conflicting external edits are reported before writing, and changed rooms stop offering outdated demonstrations. Campaign scenes and browser shipping files are outside this editor's write path. The packaged app is rebuilt separately; the editor's Play action always uses current project files.

See [the short editor guide](room-editor/README.md), or click **How to edit** inside the editor. Node.js and the pinned Godot engine are required; both are already present on this Mac. No hosting or account is needed.

## Movement Workshop · 0.16.0

Six standalone movement rooms are available through **Play Movement Workshop.command**, or **Esc → chapter selector → Test · Movement Workshop** in the standalone app. No campaign progress is needed. **R** retries, **N** selects the next room, and **H** reveals a hint. Esc offers room selection, Previous/Next and **Watch solution**. Every room has an ordinary-input demonstration; watching awards no completion.

| Room | Connected problem |
| --- | --- |
| The Broken Relay | Launch horizontally, spend the dash catching the vertical weight, then finish using its upward launch. Preserved from 0.15. |
| Behind the Counterweight | Open the passage, cross beneath the weight, then catch it returning as a higher foothold. Preserved from 0.15. |
| Under the Lintel | Preserve the dash through the first lift transfer; ride beneath a structural dividing wall, then launch from the horizontal carrier toward the flag. |
| The Return Ferry | Prepare the gate outward, collect the shard, then dash through the opened lower passage and catch the returning ferry. |
| The Counterweight Engine | Relay into an upper seal/refill pocket, pass beneath the partition, then reuse the same returning counterweight as the final foothold. |
| The Smuggler’s Circuit | Prepare the gate and return with the shard, recover on the ferry, reach the high refill, and activate the finishing lift for its upward launch. |

The last three require their carried pickup at the flag. Death/retry restores an unbanked pickup; Start world over clears session completion. Player movement constants are unchanged. Blocks retain the default 4-frame activation, 30-frame outward trip, 30-frame hold and 120-frame return unless explicitly authored: the ferry pauses for 60 frames, and the Circuit's finishing lift returns over 600 frames. These local timing choices support preparation and activation order; they are not new player abilities.

The workshop is chapter 4 in `levels/world4.tscn`, with source data and demonstrations in `data/world4.json`. All six rooms are separately editable through **Movement Workshop · test level** in the Ascend dock. Larger rooms have smooth camera follow clamped within their boundaries; the first two retain fixed framing. No connecting passages, campaign edits, quests or recordings are added.

`tests/workshop.gd` verifies native round trip, six deathless ordinary-input solutions, observed resource/device states, nearby successful timings, causal counterfactuals and bounded shortcut searches with positive controls reproducing earlier failures. It also checks actual application play, pickup resets, demonstrations, navigation and camera behavior. GPU mode captures starts, critical transfers, finishes and the menu. These checks establish functional behavior, not enjoyment or exhaustive route uniqueness. See [WORKSHOP.md](WORKSHOP.md).

```sh
.cache/godot/Godot.app/Contents/MacOS/Godot --headless --path prototypes/godot-ascend --script tests/workshop.gd
```

## Classic knight, scenery treatments and mixer · 0.12.0

**Esc → Sound mixer** is now near the top of pause. The dedicated panel has Master, Music, Effects, Voices, Ambience, Knight efforts and Menu sounds channels. Individual effect gains apply to live playback; zero stops and disables that sound. Preview rotates through an effect's existing takes, with separate music, ambience and dialogue previews and a Stop button. Channel levels and effect overrides save automatically. Esc returns from the mixer to pause; Back and Resume stop previews. Restore mixer defaults resets gains and channels.

Opening and closing pause are silent, including the actual pause and Resume buttons. The old pause callback played `ui-pause.mp3` after the other players had been paused, making the clip particularly prominent. That recording, its import resource and its manifest entry are removed; the importer prevents its return. The prototype now reuses **124 existing files and 42 dialogue entries**. The browser audio bank remains a separate reference source.

The **knight** menu now has ten close relatives of Pixel Classic: Classic, Fine, Weathered and Bold pixel variants; Contour and Crosshatch ink; Soft and Brush illustration; Folded Classic and Layered Classic paper. Every alternative retains the compact helmet, facing side visor, blue tunic, small gold crest and scarf, boots and classic proportions. The previous non-Classic knight renderers are removed. Pixel Classic's renderer is unchanged, and the eight people renderers and shared prop drawing functions are byte-for-byte preserved. The existing gradual cape settling remains.

**Scenery** offers Original Watch Road, Moonlit Engraving and Purple Original Game; Dawn Ramparts is removed and its saved selection migrates to Original. Purple uses the browser Outskirts sky and stone colors. A separate **Treatment** selector offers Masonry, Smooth continuous stone and Weathered rock strata for every palette: **nine combinations**. Smooth interior tiles have identical colors and no internal grid, with exposed edge highlights and softened ridges. Weathered adds organic strata/grain and restrained atmosphere. Each palette keeps its landmarks and overall composition across treatments; physics, collision, routes and checkpoints stay unchanged. The new scenery and knight selectors remain focused on the base Outskirts.

`tests/refinements.gd` exercises silent pause buttons, absent audio resources, channel mute, actual preview gain, immediate per-effect stop/disable, all ten knight choices, nine terrain combinations, seam-free smooth interiors, unchanged gameplay, and preference reload. GPU mode produces knight and nine-scenery sheets plus the mixer capture, verifies distinct knight pixels and compares each silhouette with Classic. Evidence is in `.cache/godot/refinements/`.

## Outskirts styles · 0.11.0 (history)

In **Esc → Outskirts appearance**, the knight and people now have independent menus with four drawing families and two designs each. The original Pixel, Ink and Illustration drawings retain their IDs and appearance; the additions are Pixel Steel, Ink Etched, Illustration Storybook, Paper Folded and Paper Cutout. The new designs change silhouettes, helmets, clothing, faces and mark-making. NPC work tools and poses and the knight's held lantern, attacks and parry remain in place.

The Outskirts cape uses shared, render-time cloth direction across all eight designs. It preserves momentum when stopping and settles to hanging over about one second. Its exponential easing uses elapsed time, with matching settling at 30 and 144 fps. The pixel chain follows the same smoothed direction; draw calls and previews never advance the cloth simulation.

The **Scenery** menu retains Original Watch Road and adds **Dawn Ramparts** (warm light, layered hills, aqueduct arches, cypresses and sandstone masonry) and **Moonlit Engraving** (indigo sky, crescent moon, outlined ridges, etched spires and blue hatched blocks). Both replace the background drawing and terrain atlas while preserving collision, room geometry, routes and hazards. They update while paused and persist independently of character choices. New preferences apply only to the base Outskirts; the other five chapters retain their existing appearance. Older appearance preferences migrate as the initial Outskirts selection. The controls are disabled in other chapters.

`tests/style_expansion.gd` verifies actual menu choices, the other chapters' retained settings, cloth momentum/settling/frame-rate independence, unchanged gameplay/collision, and actual preference save/reload. Its GPU mode produces an eight-design knight/resident comparison and all three scenery captures, and checks distinct pixels for every design. Native source and packaged evidence lives in `.cache/godot/styles/`.

## Native chapter editor · 0.10.0

Double-click **Edit Ascend.command**. The Ascend dock opens all six chapters and their **197 native rooms**. Choose a room to center the 2D view, paint its TileMapLayer, move/select objects, edit Inspector values and Curve2D routes, then **Save + play this room**. Standard Godot save, duplicate, delete and undo work. The dock's Add action copies a configured object into the selected room and supports undo/redo.

Saved `levels/world*.tscn` scenes feed gameplay directly. Exact no-edit round trips preserve every imported/native room, map, device setting, route, quest and reward. The browser JSON references remain unchanged, and native repairs are applied once during import. Props expose position, rotation, scale, tint and petal colors; people add per-instance style. Bunnies expose paths, timing, radius and tint. Fixture footprints control their map/collision size, and advanced dictionaries retain other device and story settings. Validation catches invalid placement, paths and missing references before the dock launches play.

See [EDITOR.md](EDITOR.md) for the editing workflow, source boundaries and verification commands. Editor checks exercise saved tile collision, props, NPC styles, bunny paths/timing, mechanism coordinates and palettes in every chapter; the actual Godot UI check covers all chapters, selection, framing, layout, add/undo/redo and saved edits. The packaged game passes 27 integration cases, plus GPU checks for authored colors and transforms. All 322 browser-reference traces / 95,367 frames still match. Local evidence is in `.cache/godot/editor/`. This editor adds no quests, recordings or Explore changes.

## Outskirts hazards and character renderers · 0.9.0

Outskirts dust bunnies now advance while their rooms are unvisited/asleep and during the player's freeze, death and respawn. Retry preserves their phase; world restart begins a new clock. Other machinery retains its authored wake rules. This is a native World 1 behavior change; the other chapters' bunny behavior and colors are unchanged.

Four hand-placed **white flower** patches in the Outskirts put Vey's warning into play. Sap lasts 180 physics frames (three seconds) after last contact and refreshes while touching a patch. Running is reduced to 55%, jump launch to 67%, and dash speed to 60%; an existing dash/jump is weakened immediately on first contact. The status line shows remaining time and petals mark the affected knight. Death/retry cures it. Ordinary movement constants are never edited. The first gap has a tested clean jump over the patch and thorns; touching the patch makes the same crossing lethal. Harmless colored flowers stay clear of the toxic patches. Native placements and tuning live in `data/white-flowers.json`; original browser maps are unchanged.

Esc → Knight appearance now offers **Pixel, Ink and Illustration**, with independent **People** styles and live previews. The two new knight renderers use continuous curves and pen/paint shapes, keeping the silver helmet, visor, blue body and golden cloth. They replace the old costume swaps. All characters render at full output resolution; pixel terrain remains crisp. Measured walking is fixed for the base knight and the other gait choices have been removed. Saved obsolete gait choices migrate to measured. NPCs have new drawn silhouettes/faces with their existing tools/poses, plus the original pixel option.

The real carried lantern now uses the same handled glass/flame/cage drawing as the floor lantern, with raised hands instead of an anonymous block. Outskirts lifts have timber decking, iron straps, rivets, cables and pulleys. Causeway lift artwork is retained. No changes were made to Elsie's table placement/shape, Mirror Thicket's spike layout or Black Woods bunny colors. At 0.9.0 no editor was built; 0.10.0 adds the native chapter editor described above.

**Watch reference** remains the original browser-reference room fixture, without the new live-only flower hazards or autonomous bunny clock. Take control, room entry and chapter switching restore the live rules. `tests/revision.gd` checks these transitions, all bunny clocks, freeze/death/retry, contact/expiration/cure, recovery, run/jump/dash strength, in-flight dash contact, all four patches, lethal versus clean crossings, style selection and saved preferences. `tests/art.gd` now tests all knight/people combinations and renderer pixels. The final packaged build passes 25 integration/regression cases, GPU renderer/style checks and all 322 unmodified browser-reference traces / 95,367 frames. Native mechanic tests cover the requested deviations separately. A mixed audio capture has no clipped samples; the local app signature verifies. Evidence lives in `.cache/godot/revision/`.

## Character and environment art · 0.8.0 (history)

**Esc → Knight appearance** offers **Measured, Stride, March, or Off** for walking and **Classic, Wayfarer, or Sentinel** for the knight. The three designs retain the same small blue knight, narrow visor and gold cloth silhouette. Live previews show idle and both walking directions while paused. Both selections persist and apply across all six chapters; the menu scrolls to keep the audio/display controls accessible. Off freezes the legs while retaining the normal movement, cape and feel effects.

At rest the shoulder cloth hangs nearly vertically with a small wave. At speed it blends into the previous trailing curve. Walking uses visual foot placement, lift and knee details; no input, body dimensions, physics or collision is changed. NPCs now have shaped coats, lapels, faces, boots and role-specific clothing while keeping their authored tools and work poses.

The environment pass adds staggered masonry and chips, moss and grass clusters, colored flowers and detailed ferns, background ruin/forest/viaduct detail, bark scars, four directional pale hazard silhouettes, fuzzy dust bunnies, cut-gem bezels/facets, lantern handles/flames and machinery inlays. Foliage checks actual support, headroom, nearby hazards, people, campfires and devices. Authored flower/fern patches move to a nearby safe ledge within their room, or are omitted if none exists; the original map/prop data remains unchanged. Grass checks live terrain clearance before drawing, including retractable seams.

`tests/art.gd` covers cape geometry, all 12 appearance combinations across chapters, unchanged simulation state, actual preference save/reload and all painted foliage patches. Its GPU mode compares pixels for all four gait choices and three designs and confirms still legs with Off. `tests/art_gallery.gd` renders a native art sheet. The final audit covers 16 safe painted patches: six relocated and four omitted. The 0.8.0 app passes 24 integration/regression cases plus GPU appearance, gallery, entity and movable-stone checks. All 322 browser traces / 95,367 frames still match. Its inspected 4.59-second mixed capture is non-silent with zero clipped samples. Evidence is in `.cache/godot/art/`; gameplay and browser data are unchanged.

## Feel and atmosphere · 0.7.0

Presentation now adds speed-scaled landing compression, two-sided dust, floor shock lines, a damped camera impact and the existing heavy landing recording. Dash-start (the actual core event) launches a pulse, a short actor presentation hold and a tinted, stretched trail. Contact sparks follow real wall-slide state at a simulation-frame cadence. None of these effects change inputs, movement, collisions, simulation freeze, checkpoint timing or physics steps; the 45 ms visual hold sits over the existing three-frame dash freeze.

The camera uses velocity lead and a critically damped spring with continuous world coordinates. Impact impulses decay separately; respawn resets framing at the checkpoint. Death breaks into rose-colored fragments and a fading pulse, then respawn has a warm ring and vertical bloom. Quest/secret hearts expand with rays, hold above the player, arc toward the HUD, then settle with a halo; awards stay idempotent and do not stall play.

All six chapters have distinct effect accents, lighting and ambient drift: cool blue and gold Outskirts, green woodland motes, warm iron wind, violet Fractured Outskirts, teal Fractured Woods and rose-violet Fractured Causeway. Reduced motion removes visual holds, camera impulses, shake, look-ahead and ambient drift, and reduces burst counts and sprite compression. No new assets, voices or quests are generated.

`tests/feel.gd` exercises actual landing/dash/wall contact/death/respawn events, reward fixtures, camera settling and reduced motion. It snapshots player/entity/combat/beam/event/frame/freeze state around 679 presentation updates at varied render deltas. Run with an output directory using the GPU renderer to capture six moods and each effect. Existing browser parity and continuous-road tests remain the movement authority. `tests/feel_journey.gd` replays the complete Outskirts Fractured road through the actual app: 7,907 unchanged physics frames, 18 smooth ownership transfers and zero deaths with varied render deltas. All 322 browser traces / 95,367 frames still match, and the packed build passes 22 integration/regression cases plus the GPU effect check. The inspected 3.67-second mixed audio take has no clipped samples. Core, world, devices, authored data and application input/physics scheduling remain unchanged. Evidence lives in `.cache/godot/feel/`.

## Fractured worlds · 0.6.0

Choose **Esc → chapter selector → Fractured Outskirts, Fractured Woods or Fractured Causeway**. All 112 authored rooms (38/37/37) are preloaded alongside the original three chapters. This imports existing authored worlds; it adds no quests, dialogue or voices. Existing echo errands and regional secret hearts have front-entry gates, one-time rewards, retry retention and restart reset. Progress remains session-only. Inter-world passages remain previews, and Explore/browser files are unchanged.

Native devices now include Sentinel bells and the two-stage encounter, moving hooks and rings, ziplines, beam mirrors/shutters, oath roots and resin wind, moths, anvils, feathers, void stones, paired portals, gravity prisms and mine carts. World-only entry repairs preserve authored shafts and align the East Counterweight and final arena mouths with their four-tile climbing connectors; three retractable entry seams visibly close near their campfire and reopen for backtracking. Watch restores the browser's authored closed seam at those checkpoints. Original exported room maps remain intact for reference tests. Dash-movable stones now have a visible body both before and after being moved.

The audio manifest reuses **125 existing files and 42 voice entries**, including regional Fractured scores and recorded echo dialogue. The original unvoiced connector line stays subtitle-only. No synthesis or ElevenLabs requests were made.

Reference checks cover all six worlds: **322 traces / 95,367 frames, zero mismatches**, including nested rope/riding state, combat, beams, roots, and targeted parry/portal inputs. The Fractured main roads complete in **7,907 / 6,583 / 8,954 frames**, all with zero deaths. Their recordings use normal inputs from the initial campfire through the crossroads, without position changes, room warps or state resets. Room Watch checks cover 21/23/23 playable authored routes; socket previews are excluded. GPU checks verify visible paint for all 28 authored entity types, including sliding stones.

```sh
node prototypes/godot-ascend/tools/export-world.mjs --world=21 --check
node prototypes/godot-ascend/tools/parity.mjs --world=21
# Repeat for 22 and 23.
# Godot --path prototypes/godot-ascend --script res://tests/fractured.gd
# Godot --path prototypes/godot-ascend --script res://tests/fractured_journey.gd
# GPU renderer required for tests/fractured_render.gd.
```

`--fractured-tour 21` (or 22/23) replays a continuous road through the actual application. Tests distinguish geometric branch connectivity, checkpoint route completion, and reward-state fixtures; they do not claim complete normal-input optional-branch return journeys. The 0.6.0 packed app passes 21 integration/regression cases, plus both GPU paint checks (28 entity types and idle/moving stones). Actual packed captures cover all three Fractured chapters. Its inspected 3.52-second mixed WAV is non-silent with zero clipped samples; the local app signature verifies. Evidence is in `.cache/godot/fractured/`.

## Broken Causeway · 0.5.0 (history)

Choose **Esc → chapter selector → 3 · Broken Causeway**. The new chapter contains all 28 authored rooms, including the 15 taped main-road sections, Silas’s existing **The Clockwork Defector** quest, and the **Glass Ladder / Cog Heart** secret. Inter-world passages remain isolated previews; the chapter selector switches worlds. Explore and the browser game are unchanged.

Causeway has its own dusk palette, layered broken viaducts, chains, winches, crates, standards, clockwork Silas and armored Brutes. Sliding stones now react to directional dashes. Native devices include load/release platforms, safely jamming hinged arms, cracked braces, counterweights, the Brute’s two-crush armor and grounded stamp waves. Combat actors keep the original arena bounds while the knight uses continuous world collision. One native-only repair gives the governor entry clearance for the lower room’s four-tile block and a one-way lip onto the upper floor; original browser exports stay unchanged.

The Iron Causeway score, Iron Juggernaut boss score, heights ambience and existing dialogue are copied byte-for-byte. Across all three worlds the manifest contains **102 existing files and 26 voice entries**, with SHA-256 provenance. No quest or voice was generated. Silas’s governor opening, key pickup, death recovery, toll-hook hand-in and visible heart award use the existing quest. Progress remains session-only; retry keeps rewards and Start world over clears them.

Verification adds:

```sh
node prototypes/godot-ascend/tools/export-world.mjs --world=3 --check
node prototypes/godot-ascend/tools/parity.mjs --world=3
node prototypes/godot-ascend/tools/seam-check.mjs --world=3
```

World 3 matches **46 browser/native traces and 14,496 frames**, including complete combat actor state and stamp waves. World 1 retains 47 traces / 14,221 frames; World 2 retains 41 / 12,340. Native packed-app checks cover chapter switching, all main-road Watch routes, governor timing, key recovery, reward idempotence, existing recordings and restart. Continuous normal-input proofs reach the crossroads in **5,386 frames**, complete Silas’s whole quest in **2,261 frames**, and enter, earn and return with the Cog Heart in **1,302 frames**, all with zero deaths. Each proof starts from one checkpoint and then uses no room warps, state resets, forced quest steps, physics edits or invulnerability.

The corresponding checks are `tests/causeway.gd`, `tests/world3_journey.gd`, `tests/silas_journey.gd` and `tests/world3_secret.gd`. Development tools `record-world3.gd`, `record-silas.gd` and `record-cog-heart.gd` regenerate the input recordings. `--causeway-tour` and `--silas-tour` play the road and quest through the actual application. Tests and development tools are excluded from the packaged application. The evidence directory is `.cache/godot/causeway/`.

## What is native

- `scripts/core.gd`: fixed 60 Hz movement with per-pixel collision, subpixel remainders, JavaScript-compatible negative rounding, buffers, coyote time, variable jumps, directional dashes and freeze, supers/hypers/wallbounces, wall climbing and stamina. World 1's stakes/gates, lantern/plates, refills, crumbling platforms, moving lifts and swept thorn collisions are simulated in GDScript. Godot physics bodies are not used.
- `scripts/room_loader.gd`: reads the authored character maps at 8 pixels per tile, including grouped machinery. The runtime does not contain or use the JavaScript-parsed collision arrays.
- `scripts/landscape.gd`: cached TileMapLayer terrain with varied stone, grass edges and weathering; layered hills, clouds, towers and arches; animated tents, flags, clocks, palisades, campfires and NPC work poses; native GPU embers and drifting motes; ambient/point lighting with real terrain shadow occluders; a restrained grading/vignette shader. Jump, landing, dash, refill, gate and death effects sit above the unchanged simulation. Render interpolation, camera easing and a constrained animated plume smooth movement at higher display refresh rates. The plume turns slate when the dash is spent. Adjoining terrain stays visible across doors.
- `scripts/audio.gd`: original **Midnight Field** score and plains ambience, nearby fire audio, alternating existing effect/effort takes, footsteps and climbing sounds. Music continues across rooms, ducks beneath speech, and pauses/resumes with gameplay. Spoken NPC lines are queued, not cut off or restarted every frame; matching subtitles stay readable when voices are disabled.
- `scripts/controls.gd`: physical keyboard mappings imported from the shipping browser defaults, plus named Godot gamepad equivalents.
- `scripts/world.gd`: all 30 Outskirts, 27 Black Woods and 28 Causeway room simulations, entities and hazards constructed before play; shared world collision; persistent machinery; physical travel in either direction; carried-object transfers and recovery; Ash/Glass/Iron collection and Mara acknowledgement.
- `scripts/world_layout.gd`: native-only geometry repairs, including a one-tile Black Woods kitchen roof alignment and a separate upper-watch overlook and reversible stair instead of the old junction overlapping the Gatehouse. Exposed boundaries are visible stone. Original exported browser fixtures remain intact.
- `scripts/main.gd`: keyboard actions, room selection, retry, full-world restart, bearing HUD, recorded route playback, continuous room ownership, and the comparison lighting toggle.
- `data/world1.json`, `data/world2.json` and `data/world3.json`: the original world definitions, tapes, constants, player defaults and source provenance. Parsed test oracles are generated fresh by the reference runner. Source hashes identify the exact browser modules used. JavaScript is used only by the development exporter/reference tests, never inside the Godot application.

## Verify

From the repository root, with Godot available via `GODOT` or the downloaded local engine:

```sh
node prototypes/godot-ascend/tools/export-world.mjs --check
node prototypes/godot-ascend/tools/parity.mjs
node prototypes/godot-ascend/tools/seam-check.mjs
.cache/godot/Godot.app/Contents/MacOS/Godot --headless --path prototypes/godot-ascend --script res://tests/application.gd
```

The reference runner loads the real browser core and all its device modules. It generates fresh traces, then launches Godot to compare native state every frame. The checked state includes player scalar fields (positions, velocities, remainders, stamina, movement states and timers), entity fields, carried-object identity, freeze/death/exit state, and the native map/entity parser. Numeric tolerance is 1e-8; whole-pixel movement is unchanged.

Current Outskirts result: **18 authored route traces + 29 deterministic varied-input probes, 14,221 compared frames, no differences**. The standalone core retains its original behavior; optional world collision callbacks enable continuous play. All 14 reference main-road transfers also match the browser. The exported browser data stays unchanged; native geometry fixes are applied separately at startup. The application check feeds real keyboard events, loads every room, plays all 14 main challenges to the crossroads without death, takes control from playback, presses the actual full restart button, and exercises death with a cross-room lantern. Watch replays the original isolated room fixtures; normal play uses the continuous world. Captures from the actual GPU renderer and browser are in `.cache/godot/`; the second pass is under `.cache/godot/polish/`. A captured mixed WAV demonstrates music, effects and speech with no clipped samples in the inspected take. An earlier polish capture reported 118 fps; the 0.3 full-world LaunchServices capture reported 81 fps on this Mac. These are observations, not portable performance guarantees. The 0.3 packed application, polish, world, connectivity and stair checks all pass. Its 5.18-second mixed WAV contains music, effects and speech with zero clipped samples.

Additional checks:

```sh
node prototypes/godot-ascend/tools/import-controls.mjs --check
node prototypes/godot-ascend/tools/import-audio.mjs --check
.cache/godot/Godot.app/Contents/MacOS/Godot --headless --audio-driver Dummy --path prototypes/godot-ascend --script res://tests/polish.gd
```

The polish check verifies the real D/A/C/W events, controller input events, all manifest MP3 decodes, non-silent output from Godot's mix bus, exact matching speech/subtitles at all six main-road NPC approaches, no repeated speech, ducking, mute, pause/resume, actual shadow occluders, and reduced motion. It does not write user preferences. Physical controller hardware has not been exercised.

`tools/export-world.mjs` regenerates data after an intentional browser source update. `--check` detects stale exports. The default command checks World 1. Use `--world=2` for Black Woods or `--world=3` for Causeway. These establish the measured chapter cases, not compatibility with later worlds or every engine module.

Additional continuous-world checks (run with the same Godot command prefix): `tests/world_checks.gd`, `tests/connectivity.gd`, and `tests/stair.gd`. They verify preloaded machinery, walking across the repaired camp floor and back, climbing/dropping through the Lookout, cross-room lantern recovery, normal-input collection of all three actual bearings with no deaths, Mara’s recorded acknowledgement, progress retention on retry/death, full restart, reciprocal collider openings across the connected world, and normal jumps both ways through the new stair. `tests/world_shots.gd -- OUTPUT_DIRECTORY` captures the repaired areas and restart menu for visual inspection. Current captures and logs are in `.cache/godot/world/`.

## Deliberate prototype boundaries

This contains the full first-three-world and corresponding Fractured room data and their supported movement/interactions, with all rooms selectable for inspection. All main-road rooms and optional branches are physically connected. The between-world passage previews remain outside the chapter travel model; use the chapter selector. Mara now registers all three bearings and speaks her existing completed-chart recording. Campaign saves, other quest chains/unlocks beyond Mara, Elsie, Silas and the regional secret hearts, co-op, physical between-world passage travel, and devices outside these six chapters remain outside this prototype. Progress lasts for the current session until Start world over. Art is a more detailed Godot treatment, not a pixel-for-pixel copy of the browser renderer. The next decision is whether this looks and feels worth pursuing before expanding scope. Explore is a separate draft, left unchanged by this expansion.

## Reused audio provenance

`tools/import-audio.mjs` copies 125 existing source files byte-for-byte into `audio/` and records their paths and SHA-256 hashes in `data/audio.json`: all three regions’ scores and ambient beds, the Causeway boss score, effects/effort variations and 42 matching NPC/quest voice entries, including Mara’s acknowledgement and the actual Elsie and Silas errand lines. No dialogue was rewritten and no audio was generated. The existing unvoiced root-tender line in a between-world connector remains subtitle-only. `audio/ATTRIBUTION.md` preserves the original project provenance.

`tools/import-controls.mjs` extracts the actual keyboard/pad defaults from `public/bladefall-pcore-view.js`; its check detects drift. Neither importer changes the browser game. No ElevenLabs calls are made.

Godot binary: [official 4.5.1 release](https://github.com/godotengine/godot/releases/tag/4.5.1-stable). Engine license is included in `GODOT-LICENSE.txt`; Godot includes its third-party license viewer. [Godot's command-line documentation](https://docs.godotengine.org/en/stable/tutorials/editor/command_line_tutorial.html) covers editor and project launches.

## Black Woods expansion checks · 0.4 history

`data/world2.json` exports the authored Black Woods chapter and its route-derived existing Elsie quest spots. All 27 room simulations are preloaded. Native device support includes pod blade rebounds, bell/dash phase switches, deferred solidification while occupied, springs, moving decks and spent footholds. The forest uses its own terrain palette, layered trees, lanterns, kitchen props and resident work poses; the knight follows the browser default sprite's blue tunic, narrow helmet, visor, belt, sword hilt and orange plume.

The importer now reuses 91 existing recordings across both chapters, with source hashes. Black Woods uses Watchful Greenwood and forest ambience. Elsie's actual errand lines, lantern-death reset and heart hand-in are included; no voices or quests were generated. Required audio resources are warmed before play. The sky gradient and device lists are cached, terrain hazard drawing is restricted to the visible cells, offscreen entities are culled, inactive chapter rendering/particles are disabled, and only the active room is scanned for newly collected progress. Preloaded machinery retains its state; study-room machinery waits for its first input.

Additional verification commands (same Godot prefix as above):

```sh
node prototypes/godot-ascend/tools/export-world.mjs --world=2 --check
node prototypes/godot-ascend/tools/parity.mjs --world=2
node prototypes/godot-ascend/tools/seam-check.mjs --world=2
```

World 2 has **41 browser/native traces and 12,340 compared frames, with no differences**, plus twelve matching browser/native transfers. World 1 retains its 47 traces and 14,221 compared frames. `tests/black_woods.gd` exercises chapter switching, existing quest state/retry/heart awards and all twelve main-road challenge Watch routes. `tests/world2_journey.gd` runs **11,880 consecutive normal-input frames** through the real continuous world to the crossroads with **zero deaths**, without room warps, state resets, physics edits or invulnerability. It includes walking to the next fire and waiting for machinery cycles. `tests/black_woods_branch.gd` climbs from the kitchen into the fork and drops back through the same shaft using normal inputs, with no deaths. `tests/connectivity.gd -- 2` checks reciprocal collider openings for every main/optional/secret room; this geometric check complements the traversal evidence.

`tools/record-world2.gd -- OUTPUT_JSON` regenerates the native continuous input trace. It is a development tool excluded from exports. `--world 2 --tour` runs that trace in the actual application for presentation/performance checks. Capture reports contain frame/physics median, p95, p99 and worst timing samples; short staged samples should not be treated as comprehensive performance guarantees.

The Explore comparison and proposal are in `docs/plans/godot-explore-comparison-and-proposal.md`. Explore and the shipping browser game remain unchanged. The prototype retains session-only progress; campaign saves, worlds after Causeway, online services, co-op and the workshop are not implemented. Inter-world passage previews remain isolated; use the chapter selector.

The final Black Woods verification also includes `tests/elsie_journey.gd`: **1,535 normal-input frames through the actual application**, chasing every moth perch, returning across the kitchen gap, climbing the branch, carrying the lantern through its return pipes and handing it to Elsie, with no deaths or forced quest steps. Her existing closing recording queues at the hand-in; the carry reminder does not start over the completion. `tests/world2_secret.gd` enters the secret from The Hollow Trunk, completes its challenge, collects the existing **Moss Heart** and returns through all six pipes to the clearing in **1,116 frames**, with no deaths. It also checks retained rewards, no duplicate heart, full reset and sealed preview/back entry. The native layout aligns the Hollow Trunk roof with this shaft and preserves its authored width; exported browser maps remain untouched.

Forest layer drawing commands are cached until the parallax chunk changes, reducing measured background script drawing from roughly 1.0 ms to 0.12 ms on this Mac. On macOS, presentation is paced to the detected display refresh rate with OpenGL VSync disabled; physics remains fixed at 60 Hz. This was selected after direct timing comparisons on the host's 60 Hz display. `wall_frame_ms` records actual elapsed frame times separately from Godot's smoothed delta. Packaged GPU captures, complete timing reports and the non-silent mixed audio recording are in `.cache/godot/black-woods/`. The reported results describe this Mac and these routes; they do not establish a portable frame-rate guarantee.

The 0.4 package passes application, polish/audio, Outskirts world/connectivity/stair, Black Woods integration/branch/continuous road, full Elsie and full secret checks against its packed resources. It is ad-hoc signed and verified for local use. The Explore runtime and browser `public/` tree match `e0ac32b` exactly.

Final packaged timing observations on this 60 Hz Mac: wall-frame median about 16.7 ms, p95 about 17–22.4 ms across captures, with occasional larger spikes. The final 26.9-second mixed WAV has no clipped samples. The stable compatibility renderer is retained; an experimental Metal backend was rejected after an exit crash. The optimization work improves resource loading, drawing cost and presentation pacing, but does not promise stutter-free performance under every host load.

Silas’s hook hand-in plays his existing closing recording immediately and removes any queued carry instruction, so the heart award and spoken line agree. The full application quest check verifies this exact transition.

0.5.1 fixes invisible dash-movable stones: the renderer now draws their actual simulated rectangles before and after movement. `tests/sliding_block_render.gd` checks GPU-rendered pixels from an authored Causeway block in both states.


## Mobile and native exports (0.53.0)

The browser and Android builds share multi-touch movement/aim and action controls. Landscape phone menus use larger targets; rotation, focus loss and pause cancel held touches. Physical keyboard/controller input remains independent. Browser sizing honors the header and safe areas. Android Back pauses the game.

Build with `tools/build-web.mjs`, `tools/build-windows.sh`, `tools/build-macos.sh` and `tools/build-android.sh`. Android requirements and signing environment are in `ANDROID-README.txt`. Outputs are ignored under `exports/`; signing secrets and keys are never added to the export preset.

`tests/touch_controls.gd` exercises real game movement, simultaneous jump/dash, action buttons and cleanup. `tests/sequential_unlocks.gd` checks legacy discoveries, third-Fractured result navigation and preserved Core rewards. Use `tools/check-macos.py --suite touch_controls --suite sequential_unlocks` with an output folder to test the packaged game. `tools/check-web.mjs` verifies browser/native save round trips; `tools/check-web-audio.mjs` measures actual speaker-bound audio. `tools/check-web-mobile.mjs URL webkit` checks phone menus, save downloads and rotation; select `chromium` to also exercise simultaneous trusted touch input. Install the Playwright WebKit runtime with `npx playwright install webkit`.
