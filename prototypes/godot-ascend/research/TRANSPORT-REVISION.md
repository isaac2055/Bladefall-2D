# Transport revision — 0.49.0

Implemented at the user's explicit request following `TRANSPORT-STORY-NEXT-LLM.md`.

## Presentation

- **The Watchman's Circuit:** sealed stone watch gate, brass signal bell, answering distant light and Woods silhouette. The local bell uses the existing bell effect.
- **The Ranger's Canopy:** root-bound ground, timber ranger shelter, rope crossing, a branch taking the load and moving leaves. The wooden sling uses the existing lantern effect; no watch gate or bell.
- **The Inspection Line:** freight barrier, wheel, chain and releasing counterweight precede the iron inspection cage. Steam and the existing lever effect accompany the machinery.

Each scene uses the proposed single caption. Existing regional music, puzzles, editable levels, quests and voices are unchanged.

## Continuous ownership

`sampler_run.gd` allocates the ride before the first establishing frame. Its phases are `reveal`, `travel` and `landing`; the same dictionary and `draw_transport_cradle()` serve every phase. The reveal ends by advancing the existing ride, without `cancel(false)` or a second `begin_ride()`.

The empty cradle descends to the knight's exact boarding transform and rests before acceleration. The existing eased Bézier carries the actor in world coordinates. A single critically damped camera spring preserves position and velocity; its target blends into travel framing over one second and into puzzle framing during the half-second dock. Destination ownership changes only after the path reaches its endpoint, preserving the preceding actor interpolation sample. The cradle fades during docking before control returns. Each destination still calls `world.enter(target, true)` separately.

Ride snapshots retain reveal age, phase, transform path, landing age and camera position/velocity inside the existing save payload. Old rides without a phase remain travel rides; existing gallery migration and carried-shiny restart rules remain in `world_save.gd`. Continue restores reveal, travel and docking through the actual app path. Retry cancels the presentation and returns to the individual checkpoint. Pause freezes all transport phases. Reduced motion shortens the reveal and suppresses branch/leaf/bell motion while retaining continuity. Changing that setting during a ride preserves the active boarding timeline. Autosave captures the current camera even when a ride has just begun and has not rendered yet.

## Verification and reproducible evidence

Engine: `/Users/computer/Projects/Fractured-Causeway/.cache/godot/Godot.app/Contents/MacOS/Godot`.

`tests/transport_continuity.gd` exercises the real app physics path in all three base districts with normal and reduced motion. It records every actor/current/previous/render sample, cradle position, camera position and camera velocity, checks ride identity across phase changes, pause, save/restore, once-only normal reveals, restart and actual Continue/Retry in every phase. Its trace is `/tmp/transport-continuity.json`.

At reveal -> travel the measured actor, cradle and camera position steps are zero. At travel -> landing the largest actor/cradle step across the three worlds is below 0.0002 world units. Across the complete runs the largest actor velocity change is below 0.26 world units per tick; camera velocity changes are below 0.5 world units per tick. These checks inspect movement across boundaries, rather than only destination coordinates.

GPU sequence capture:

```sh
ENGINE=/Users/computer/Projects/Fractured-Causeway/.cache/godot/Godot.app/Contents/MacOS/Godot
"$ENGINE" --path prototypes/godot-ascend --script tests/transport_continuity.gd -- --capture
```

This captures establishing frames, consecutive reveal/boarding frames, the last travel frames, consecutive docking frames and return to control for all three worlds under `/tmp/transport-*.png`. Local reviewed contact sheet and six boundary animation GIFs are in `.cache/transport-revision/`. Generated evidence and packages stay out of Git.

Regression suites: `road_presentation`, `saves_progression`, `sequential_unlocks`, `sampler_journey`, and `transport_continuity`. The Mac build is signed and checked using the actual shipping PCK plus a test-only overlay; results and logs are in `.cache/transport-revision/`. The missing-script negative control must be rejected.

World 1 remains SHA-256 `31dbed0936d4552718299175b24394ba5d0b1dc8fd073f3765949828cd056d47`. No level or puzzle data was changed. Rewards, N's real completion path, endings, room checkpoints and normal-input route traversal remain covered by the regression suites.
