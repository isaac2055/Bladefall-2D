# Connected roads — 0.50.0

The user requested replacing the cradle routes in the three base worlds and Fractured Causeway with interconnected geometry and removing their cutscenes. This supersedes the transport presentation shipped in 0.49.0.

## Player-facing behavior

The old junction leads up a physical staircase into a service walk. Puzzle exits open into short walks at the next room's checkpoint height. The knight remains under normal movement control throughout; there is no ride, teleport, camera reset, establishing shot, or ending delay on these four routes. The earned results card opens directly. Fractured Outskirts and Fractured Woods keep their existing connected routes.

The original room IDs, mechanisms, objectives and individual puzzle checkpoints remain. Approach tubes close after the knight reaches the original checkpoint, restoring the authored terrain. Puzzle mechanisms and enemies wait until that activation, so a player cannot accidentally alter a puzzle or be attacked before reaching its start. Checkpoint activation resets puzzle inventory/machinery and transient actor state while retaining world position and movement velocity. Foreign puzzle objects return to their source, as the former hoist transfer did; carried Garden rewards remain governed by the original whole-world rules.

After the actual finish condition is met, the flag ledge and rightward service passage become safe and obstructing machinery retracts. Entering a corridor does not replace the preceding puzzle's checkpoint. Retry from a corridor returns to that checkpoint. No rooms or checkpoints are combined, no finale is imported, and no quests, voices, score changes or physics constants are added.

Fractured Causeway's superseded cover study stays in the native authoring library. Its gameplay footprint is now a safe sloping freight bypass between the existing bridge and delivery puzzle. The delivery objective remains required before its physical exit opens.

The generated layout reserves puzzle footprints against existing roads, optional rooms and inter-world passages. All native level files remain unchanged, including the player-edited World 1 SHA-256 `31dbed0936d4552718299175b24394ba5d0b1dc8fd073f3765949828cd056d47`.

## Saves

The save format remains `BLADEFALL SAVE 1`. The retained 0.49 layout builder supplies its exact previous fingerprint, including the older Outskirts bonus-metadata compatibility fingerprint. Migration restores the run clock, deaths, eligibility, room-local actor/machinery state, inventory links and room progress into the new placements, rather than restoring obsolete geometry over the new map. Core world origins are rebound to the new placements.

An old in-flight save docks once at its intended next puzzle checkpoint and resumes on foot; an old gallery save enters its corresponding puzzle. Neither operation grants a completion or reward. New saves retain whether a puzzle approach has closed and which completed exits are open. A fresh run closes those exits again. Carried shiny attempts still restart the world when resumed or retried.

## Verification

- `connected_roads`: all 35 appended rooms; original puzzle input tapes; normal-input approach and exit traversal; no automatic transport; individual checkpoint ownership; no overlap with existing road/secret/passage footprints.
- `sampler_journey` and the `connected_outskirts_journey`, `connected_causeway_journey`, `connected_fractured_journey` wrappers: normal-input traversal, actual finish conditions and real rewards, with zero deaths. Outskirts starts at its old junction; the original Outskirts road remains covered by `world_checks`. The other three traverse their recorded original roads before the connected additions. Fractured Causeway additionally crosses the physical freight bypass and solves the existing delivery puzzle.
- `connected_saves`: a test-only fixture of World from commit `33c05e9` constructs genuine previous-layout snapshots, including partial puzzles, galleries, in-flight rides and pre-bonus Outskirts saves. Checks relocation, inventory/machinery identity, eligibility, clock/deaths, intended checkpoint docking and absence of unearned rewards.
- `connected_shots`: actual application input handling and actor/camera samples across both room seams, in all four worlds with normal and reduced motion. Actor steps at these joins are at most two world pixels per physics tick; the camera continues its existing spring motion. `--capture` writes consecutive GPU frames to `/tmp/connected-*.png`; the complete sampled trace is `/tmp/connected-camera.json`. Reviewed contact sheets and boundary animations are local in `.cache/connected-roads/`.
- Existing presentation, save/progression, unlock, sampler, app sampler, release controls and original-world checks remain part of the packaged verification. `fractured_journey` retains the unchanged World 21/22 native-road witnesses; the longer connected Fractured Causeway witness replaces World 23's superseded cover recording.

Build with `GODOT=/Users/computer/Projects/Fractured-Causeway/.cache/godot/Godot.app/Contents/MacOS/Godot prototypes/godot-ascend/tools/build-macos.sh`. Packed-resource results, logs and test-only overlay are in `.cache/connected-roads/`. Generated evidence, caches and Mac packages stay out of Git.
