# Transport story: proposal and next-LLM handoff

**Superseded in 0.50.0:** the user requested walkable geometry in all four cradle worlds and removal of their cutscenes. See `CONNECTED-ROADS.md` for the current implementation and verification. The proposal below is historical.

**Implemented in 0.49.0 after the user explicitly requested implementation.** See `TRANSPORT-REVISION.md` for implementation details, continuity evidence and verification. The approval warning below records the original proposal-only status.

The user approved changing progression/music and removing Movement Workshop. Those changes are implemented in 0.48.0. They explicitly requested PROPOSAL ONLY for fixing the transport story/reset. Do not treat this handoff as approval to implement the story revision; wait for a new request.

## Proposed individualized stories

**Outskirts — The Watchman's Circuit.** The watch road terminates at a sealed watch gate. Its old signal bell still summons the service cradle that connects the watch stations. The knight rings the existing bell/lantern signal; a distant watch light answers; the same cradle lowers beside him. The rooms are the watch stations, rather than an unexplained alternate road. Use stone, brass, bell echoes and a distant Woods silhouette. One caption at most: “The watch road is shut. The signal still carries.” No new quest or physics mechanic is required.

**Black Woods — The Ranger's Canopy.** This is a living forest, not another collapsed stone bridge. Below the canopy, roots have reclaimed the trail; the ranger crossings follow the trees above. A warm lantern reveals a ranger rope line; a branch gently takes the load as the wooden sling descends. Stations are ranger shelters among the boughs. Use timber, rope, moving leaves and existing forest audio. Suggested caption: “The roots keep the ground. The rangers kept another way.” Avoid a second bell/watch-gate scene.

**Causeway — The Inspection Line.** The road reaches a freight barrier beside operating industrial machinery. A counterweight releases and an inspection cage moves into its dock; the maintenance route bypasses the freight lane through service chambers. Show the chain, wheel and counterweight before the cage approaches. Use iron, geared silhouettes, steam/water ambience and existing machinery effects. Suggested caption: “The freight road is closed. The inspection line still runs.” Avoid forest motion and watch signaling here.

## Fix the reset, not just the drawing

Use ONE persistent ride object and one cradle drawing from the first establishing frame, through boarding and acceleration, until landing. The reveal should transition its phase into boarding/travel; it must not cancel one scene and instantiate a differently positioned vehicle. Keep world coordinates, current/previous actor interpolation, camera position/velocity and the cradle transform continuous. Match transforms and velocity at the handoff, then ease the camera toward travel framing without a snap. Landing should likewise preserve the last camera/cradle frame before restoring control. Keep individual puzzle checkpoints.

Current discontinuity to investigate: `road_story.gd` finishes reveal by calling `cancel(false)`, which clears `landscape.story`; the next gameplay tick starts `sampler.begin_ride`. The story camera targets `origin - Vector2(112,124)`, while ride framing targets `actor - Vector2(153,100)`. Story and gameplay also draw different cradle shapes. This is a concrete explanation of the visible reset, not a verified final fix.

## Workspace and authoritative files

Repository: `/Users/computer/Projects/Bladefall-Complete`

Read `.agents/AGENTS.md` before work. Standing instructions authorize commit/push to origin main after checks; never force-push, deploy to Netlify, overwrite unrelated remote work or combine room checkpoints. Worktrees share the filesystem. No new quests/voices are authorized by this story proposal.

- `prototypes/godot-ascend/scripts/road_story.gd`: reveal/ending timing, captions, saved first-time reveal flags, handoff/cancel and camera target.
- `scripts/landscape.gd`: `story`, `draw_road_story`, `draw_sampler_rewards`, `target_camera`, `tick_feel`, actor interpolation and camera transforms. Paths in this list are relative to `prototypes/godot-ascend/` unless fully qualified.
- `scripts/sampler_run.gd`: persistent ride dictionary, `begin_ride`, Bézier path, duration, arrival and real completion. Transfers now go directly into the next puzzle without an intermediate gallery stop.
- `scripts/main.gd`: physics/story gating, scene synchronization, developer N and contextual audio pause.
- `scripts/affixed_route.gd`: gallery/room placements and route links; existing galleries remain inspection scenery.
- `scripts/world_save.gd`: snapshots, compatible old Outskirts metadata and migration of old gallery-targeted rides. Preserve in-flight resume and shiny restart behavior.
- `scripts/run_profile.gd`: sequential Fractured/Core gates, rewards, records, `story_seen` persistence.
- `scripts/audio.gd`: `chapter_audio`, regional score selection and existing effects. Fractured Woods = The Archive of Violet Portals; Fractured Causeway = Fractured the Iron Causeway. Fractured Outskirts now uses Midnight Field. Cores use the corresponding base score. No audio generation needed.
- `levels/world1.tscn`, `world2.tscn`, `world3.tscn`: native editable base worlds. Preserve player-edited World 1 (SHA-256 31dbed0936d4552718299175b24394ba5d0b1dc8fd073f3765949828cd056d47).
- `levels/world21.tscn`–`world23.tscn`: Fractured; `world101.tscn`–`world103.tscn`: Cores. `world4.tscn` remains a shared affixed-room authoring library, despite Movement Workshop being removed from the game.
- `tests/road_presentation.gd`: actual menu audio, developer N rewards/shinies, first reveals, continuous ride destinations/checkpoints, endings and direct developer launch.
- `tests/road_shots.gd`: GPU captures to `/tmp/bladefall-v47-*.png` (filenames historical).
- `tests/saves_progression.gd`, `sampler_journey.gd`, `sequential_unlocks.gd`: resume/identity, normal-input route traversal and current unlock/music/workshop requirements.
- `research/CONTINUOUS-LIFTS-AND-STORY.md`: shipped 0.47 behavior and prior evidence. `WATCH-STAIRS-AND-ENDINGS-PROPOSAL.md`: earlier approved design, superseded by THIS proposal for the next transport revision.

## Build and verification

Engine: `/Users/computer/Projects/Fractured-Causeway/.cache/godot/Godot.app/Contents/MacOS/Godot`

Run source tests with `ENGINE --headless --path prototypes/godot-ascend --script tests/road_presentation.gd`. Use the actual engine path for ENGINE. For GPU shots omit `--headless` and use `tests/road_shots.gd`.

Build: `GODOT=ENGINE prototypes/godot-ascend/tools/build-macos.sh`.

Verify packed resources: `GODOT=ENGINE python3 prototypes/godot-ascend/tools/check-macos.py --output .cache/transport-revision --suite road_presentation --suite saves_progression --suite sequential_unlocks`. Relevant normal-input traversal is `sampler_journey`.

App: `prototypes/godot-ascend/exports/Bladefall.app`; share ZIP: `exports/Bladefall-macOS.zip`. Launch with `open -n ABSOLUTE_APP_PATH --args --world 1` for developer mode. N skips challenges through the real awards/unlock pipeline. Normal startup shows the title. Do not arbitrarily kill existing user/editor processes or overwrite the package while packaged tests are running.

## Acceptance evidence required for a future fix

Capture video/frame sequences across the reveal→boarding→travel and travel→landing boundaries in all three base worlds. Verify cradle/actor/camera transforms and velocities remain continuous, rather than only checking final positions. Confirm each district has its own visible narrative cause, materials and animation rhythm. Test pause/resume, reduced motion, death/restart, saved in-flight rides and once-only normal-player reveals. N must still preview the same real story/reward path. Do not mark the task complete from a single still image or a green destination-only test.
