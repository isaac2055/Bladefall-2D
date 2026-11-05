# Easier Bridge and the first three Fractured Black Woods additions

Historical 0.34.0 build. These layouts and acceptance criteria were superseded by the [0.35.0 difficulty revision](FRACTURED-DIFFICULTY-REVISION.md) after user playtesting found all four too easy.

2026-11-01. Approved builds for prototype **0.34.0**. The historical twenty-three-suite packaged count is unreliable: 0.36.0 found that the old harness accepted zero exit codes when excluded scripts failed to load. See the [corrected verification procedure](FRACTURED-WOODS-ROUTE-REQUIREMENTS.md). The full Woods route reaches the crossroads through all 24 recorded regions in 9,177 ordinary-input frames with zero deaths. No new physics, quests, voices or art were introduced. Each room retains its own checkpoint.

## Bridge: keep the preparation, widen the execution

The carriage roof and crumble opening are now eight tiles wide instead of six. The local ceiling is higher, the home platform is one tile lower and its approach is closer. The reference uses a straight setup hop, a down-left landing and leftward jump, then a straight upward dash beside the home wall. The former rightward correction between the launch and upward dash is gone. Carriage hold/return timings and crumble duration are unchanged.

The preferred reference still wavedashes. A longer hop and later landing also admit an ordinary jump and upward dash after boarding the carriage, providing a recovery when the wavedash is imperfect. There is no runtime wavedash check. A small lip and guards prevent the witnessed intact-bridge launches from replacing the carriage landing; the extra exposed portion of the wider parked roof is guarded as well. The wider roof therefore does not simply become an entrance-side shortcut.

## The Pod Beneath Two Ceilings

The first rebound rises through the open shaft to a bell ledge. Ringing blue closes a ceiling above the pod, opens the amber exit and restores the blue landing. Return down the right edge of the new ceiling, cut the pod below-left for a low rebound, and steer through the low opening without dashing. The blue supports provide places to inspect the changed room. A recorded wrong approach lands on the closed ceiling, jumps back to the bell ledge and completes the return without dying or retrying. The room's geometry changes how the same pod can be approached; it does not count pod visits or require a particular rebound event to authorize completion.

Compared with the proposal, the second cut comes from the exposed side of the closed ceiling. This prevents replacing both rebounds and the bell with an ordinary phase-dash route through the shaft. The existing diagonal sword cut and low rebound supply that approach; no new action or collision rule was added.

An advanced alternate is deliberately retained: a super and wall contact reach the passage, then an airborne bell cut prepares the landing. It uses a different physical phase plan rather than discarding the preparation. Its replay fixture is separate from the guided two-rebound reference, which requires no advanced movement.

## Ring It After the Crossing

The shared bell can be struck from both sides of the divider. Ring blue before the low entrance dash; the dash opens the blue gate. Reach its other face and ring blue again to restore the upper roots and home landing. Climb the roots, then jump and cut the upper pod from its left side to rebound through the absent amber gate. A low ceiling limits an ordinary jump's reach, and the landing's guarded face removes the witnessed grab-and-climb substitute.

The far-face bell is reachable soon after the crossing. The lower loop provides recovery rather than a compulsory trip to the far bank. This keeps the control-order decision and removes unnecessary backtracking. Plain steps after the flag lead to the next checkpoint.

## The Wall You Must Bring Back

The outward dash removes the lower amber obstruction. The far bell restores it as a climbing surface. An ordinary jump into the wall shortens the climb; normal finite stamina suffices to reach the upper pod. Its high rebound restores resources without changing phase. Dash left through the upper part of the same wall: it disappears and the blue home landing appears.

The pod is high enough to make the restored wall useful. Upper exit steps are reached from the home landing; they introduce no further timed machine. The climb, pod and final dash share a preparation rather than becoming separate rooms under one checkpoint.

## Relationship to Celeste 2B

The approved research used the full authored [Old Site B-side room maps](https://berrycamp.github.io/celeste/site/b), especially different entry/exit faces and repeated uses of a central obstacle. These rooms adapt that reading to Bladefall's pods, bells and phase roots. They do not implement Celeste dream-block physics. The Bridge changes also follow the developer's principle of widening execution opportunities in [Celeste & Forgiveness](https://www.maddymakesgames.com/articles/celeste_and_forgiveness/index.html).

## Verification

`tests/fractured_woods_three.gd` covers the four preferred references, preparation counterfactuals, nearby timings, finite climb stamina, the forgiving Bridge continuation and witnessed shortcuts before/after their guards. It also protects the retained advanced alternate. `tests/fractured_woods_feel.gd` verifies the complete Woods journey, every required room, camera continuity and physics-state preservation under varied render updates. The optional arrival area is outside that recorded road.

`tests/fractured_woods_three_app.gd` checks native parity, preserved definitions/recordings/placements and metadata, real live clears, complete Watch exits, menus, hints and independent retry/death resets. Its optional first argument is an absolute source-project directory for file-preservation SHA checks when the tests run against an exported pack.

Searches are finite diagnostic evidence; neither a failed search nor a working reference proves every alternate route impossible or establishes enjoyment. The remaining six planned Woods additions await a later proposal/build request.


The packaged suites were `fractured_woods_three`, `fractured_woods_three_app`, `fractured_woods_feel`, `fractured_nine`, `fractured_nine_app`, `feel_journey`, `fractured_next`, `fractured`, `section_menu`, `campaign_workshop`, `application`, `world_checks`, `world2_journey`, `world3_journey`, `black_woods`, `causeway`, `fractured_next_app`, `fractured_puzzles_app`, `fractured_journey`, `workshop`, `six_puzzles_app`, `five_puzzles_app` and `editor_play`.

The Outskirts application journey retains 17,419 input frames and 28 regions, with zero deaths and a maximum camera step of 14.0 pixels. The Woods application journey has 23 ownership changes with a maximum camera step of 8.56 pixels. Three existing secret-passage borders coincide with the new first room's stone boundary: all 23 shared cells remain the same solid wall. Preservation checks cover those edges explicitly. Rendered captures cover starts, preparations, finishes, hints and menus; the first two Woods rooms now keep the player, pod and nearby landing in view together.

The user's pre-existing World 1 scene remains unchanged at SHA `31dbed0936d4552718299175b24394ba5d0b1dc8fd073f3765949828cd056d47`. Other native chapters, the thirty workshop layouts, prior quests and audio are preserved. No online deployment was performed.

Run the new source checks with Godot 4.5.1 using `--headless --path prototypes/godot-ascend --script tests/fractured_woods_three.gd`, then the same command with `tests/fractured_woods_three_app.gd` and `tests/fractured_woods_feel.gd`. Build the signed app with `bash prototypes/godot-ascend/tools/build-macos.sh`.
