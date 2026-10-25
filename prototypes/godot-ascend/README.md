# Ascend in Godot — Outskirts and Black Woods prototype

A native Godot 4.5.1 prototype of **The Outskirts and Black Woods**, isolated from the shipping browser game on `codex/godot-ascend-black-woods`. This is an engine comparison, not a replacement release or a full Ascend port.

## Play

On this Mac, double-click `Play Ascend.command`. It uses the local pinned engine; on a fresh Mac checkout it downloads the official universal binary and checks its SHA-256. Alternatively, open `project.godot` in Godot and press F6/F5, or run:

```sh
prototypes/godot-ascend/tools/run.sh
```

The local standalone application is `exports/Bladefall Ascend Prototype.app`. Rebuild with `tools/build-macos.sh`. The app carries its own Godot binary and packed project, and runs without the repository or Node. Exports and engine downloads are ignored by Git. This first package uses the universal editor binary as its runtime carrier (about 352 MB), rather than a size-optimized export template. The game data and scripts are packed separately in the small PCK. The local app is ad-hoc signed for local use; it is not Developer ID signed or notarized for distribution.

Controls now match the browser defaults: **arrows** move/aim, **Space/C/J** jump, **D/X/K** dash, **A/Z/Shift/L** cling/climb/carry/throw, **W/V/I** strike, **F/O** parry, **P** portal and **R** retry. Each room’s original action locks still apply. **Esc** opens the pause menu; **M** toggles music and **F11** toggles fullscreen. The standard controller equivalents are mapped too (stick/d-pad, A jump, X/B dash, LB/LT cling, Y strike, RB portal and RT parry).

The pause menu includes a **chapter selector** for The Outskirts and Black Woods. Both chapters are constructed before play, and switching preserves each chapter’s progress and position. **Start world over** resets the current world, bearings, room machinery, deaths and dialogue history without closing the app. Retry resets only the current room and preserves bearings and lit stakes. The pause menu also contains the room selector, Watch/Take control, four separate volume controls, spoken dialogue toggle, reduced motion and lighting comparison. Audio and display preferences persist locally. The app starts directly in the game rather than an engine-study toolbar.

## What is native

- `scripts/core.gd`: fixed 60 Hz movement with per-pixel collision, subpixel remainders, JavaScript-compatible negative rounding, buffers, coyote time, variable jumps, directional dashes and freeze, supers/hypers/wallbounces, wall climbing and stamina. World 1's stakes/gates, lantern/plates, refills, crumbling platforms, moving lifts and swept thorn collisions are simulated in GDScript. Godot physics bodies are not used.
- `scripts/room_loader.gd`: reads the authored character maps at 8 pixels per tile, including grouped machinery. The runtime does not contain or use the JavaScript-parsed collision arrays.
- `scripts/landscape.gd`: cached TileMapLayer terrain with varied stone, grass edges and weathering; layered hills, clouds, towers and arches; animated tents, flags, clocks, palisades, campfires and NPC work poses; native GPU embers and drifting motes; ambient/point lighting with real terrain shadow occluders; a restrained grading/vignette shader. Jump, landing, dash, refill, gate and death effects sit above the unchanged simulation. Render interpolation, camera easing and a constrained animated plume smooth movement at higher display refresh rates. The plume turns slate when the dash is spent. Adjoining terrain stays visible across doors.
- `scripts/audio.gd`: original **Midnight Field** score and plains ambience, nearby fire audio, alternating existing effect/effort takes, footsteps and climbing sounds. Music continues across rooms, ducks beneath speech, and pauses/resumes with gameplay. Spoken NPC lines are queued, not cut off or restarted every frame; matching subtitles stay readable when voices are disabled.
- `scripts/controls.gd`: physical keyboard mappings imported from the shipping browser defaults, plus named Godot gamepad equivalents.
- `scripts/world.gd`: all 30 Outskirts and 27 Black Woods room simulations, entities and hazards constructed before play; shared world collision; persistent machinery; physical travel in either direction; carried-object transfers and recovery; Ash/Glass/Iron collection and Mara acknowledgement.
- `scripts/world_layout.gd`: native-only geometry repairs, including a one-tile Black Woods kitchen roof alignment and a separate upper-watch overlook and reversible stair instead of the old junction overlapping the Gatehouse. Exposed boundaries are visible stone. Original exported browser fixtures remain intact.
- `scripts/main.gd`: keyboard actions, room selection, retry, full-world restart, bearing HUD, recorded route playback, continuous room ownership, and the comparison lighting toggle.
- `data/world1.json` and `data/world2.json`: the original world definitions, tapes, constants, player defaults and source provenance. Parsed test oracles are generated fresh by the reference runner. Source hashes identify the exact browser modules used. JavaScript is used only by the development exporter/reference tests, never inside the Godot application.

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

The polish check verifies the real D/A/C/W events, controller input events, all 79 MP3 decodes, non-silent output from Godot's mix bus, exact matching speech/subtitles at all six main-road NPC approaches, no repeated speech, ducking, mute, pause/resume, actual shadow occluders, and reduced motion. It does not write user preferences. Physical controller hardware has not been exercised.

`tools/export-world.mjs` regenerates data after an intentional browser source update. `--check` detects stale exports. The default command checks World 1. Use `--world=2` for Black Woods. These establish the measured chapter cases, not compatibility with later worlds or every engine module.

Additional continuous-world checks (run with the same Godot command prefix): `tests/world_checks.gd`, `tests/connectivity.gd`, and `tests/stair.gd`. They verify preloaded machinery, walking across the repaired camp floor and back, climbing/dropping through the Lookout, cross-room lantern recovery, normal-input collection of all three actual bearings with no deaths, Mara’s recorded acknowledgement, progress retention on retry/death, full restart, reciprocal collider openings across the connected world, and normal jumps both ways through the new stair. `tests/world_shots.gd -- OUTPUT_DIRECTORY` captures the repaired areas and restart menu for visual inspection. Current captures and logs are in `.cache/godot/world/`.

## Deliberate prototype boundaries

This contains the full first-two-world room data and their supported movement/interactions, with all rooms selectable for inspection. All main-road rooms and optional branches are physically connected. The between-world passage previews remain outside the chapter travel model; use the chapter selector. Mara now registers all three bearings and speaks her existing completed-chart recording. Campaign saves, other quest chains/unlocks beyond Mara and Elsie, co-op, physical between-world passage travel, and later-region devices remain outside this prototype. Progress lasts for the current session until Start world over. Art is a more detailed Godot treatment, not a pixel-for-pixel copy of the browser renderer. The next decision is whether this looks and feels worth pursuing before expanding scope. Explore is a separate draft, left unchanged by this expansion.

## Reused audio provenance

`tools/import-audio.mjs` copies 91 existing source files byte-for-byte into `audio/` and records their paths and SHA-256 hashes in `data/audio.json`: both regions’ scores and ambient beds, effects/effort variations and eighteen matching NPC/quest lines, including Mara’s acknowledgement and Elsie’s actual errand lines. No dialogue was rewritten and no audio was generated. The existing unvoiced root-tender line in a between-world connector remains subtitle-only. `audio/ATTRIBUTION.md` preserves the original project provenance.

`tools/import-controls.mjs` extracts the actual keyboard/pad defaults from `public/bladefall-pcore-view.js`; its check detects drift. Neither importer changes the browser game. No ElevenLabs calls are made.

Godot binary: [official 4.5.1 release](https://github.com/godotengine/godot/releases/tag/4.5.1-stable). Engine license is included in `GODOT-LICENSE.txt`; Godot includes its third-party license viewer. [Godot's command-line documentation](https://docs.godotengine.org/en/stable/tutorials/editor/command_line_tutorial.html) covers editor and project launches.

## Black Woods expansion checks

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

The Explore comparison and proposal are in `docs/plans/godot-explore-comparison-and-proposal.md`. Explore and the shipping browser game remain unchanged. The prototype retains session-only progress; campaign saves, later worlds, online services, co-op and the workshop are not implemented. The two future-world passage previews in each chapter remain isolated until their destinations are ported.
