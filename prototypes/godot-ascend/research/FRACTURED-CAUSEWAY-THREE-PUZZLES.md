# Three spatial Fractured Causeway puzzles · 0.37.0

The approved Brittle Wall revision and two replacements are implemented. Open **Play Fractured Causeway Rooms.command** (`--world 23 --room 37`); select the other rooms by name under **Esc → Explore a section**. Each has an independent checkpoint, optional question/hint, complete Watch reference, and native editable data. Chapter 23 contains 40 definitions and 16 required main challenges. The eight retired introductory studies stay absent.

## The Line Behind the Brittle Wall

The starting roof carries the knight past the brute. From the right alcove's roof, the brute opens the first wall. Moving left to the lower bait pocket exposes a different target and sends the brute away from the opened alcove. The knight can then cross the small stop and enter the line. It returns to a lookout enclosed by the starting roof, a floor, the second wall and a thorn grating. The brute sees through the grating; a knight cannot walk through it. Existing line riding ignores tile hazards, so the incoming line can enter safely.

The same living brute now opens the second wall. From the lookout the knight drops through that opening, then jumps and dashes onto the flag beneath the starting roof. A separate one-way connector above the flag returns to the outer exit road. Unused upper rows are trimmed so the room bounds leave the existing secret and its passages clear. A ceiling-to-floor partition prevents the starting roof from bypassing the puzzle and reaching that road directly.

There is no hidden stage counter. A long wait on either initial safe ledge opens only the first wall. The first leftward charge ends short of the second wall; the line changes where the knight can bait the next charge. The grating continues to the running floor to prevent walking beneath the lookout instead. The right alcove's low stop blocks the brute but can be jumped by the knight.

## The Weight You Must Take Back

The lantern holds the recoil plate down while the knight visits the lower hub. The depressed plate leaves room for the hinged arm to turn through its right pose and down. The knight boards from below, holds Down while taking the lantern, then throws it left onto the permanent service shelf. Releasing the knight's load and jumping uses the stored lift velocity; the empty-handed final dash reaches the high flag. The initial upright arm and ceiling prevent crossing over the machinery before opening it.

The flag's guarded edge prevents grabbing its side from replacing the stored launch. Its one-way connector reaches an isolated outer road, preventing the approach staircase or a rightward boost from skipping the flag. The lantern lands on the lower service shelf and remains retrievable. Missing the launch is recoverable: hold the empty plate down again and relaunch without restarting. The entry staircase leads physically from the previous room to the upstairs checkpoint; the full campaign recording climbs it using ordinary inputs.

## The Wall You Must Fold After Climbing

The hanging arm supplies the climb to the service ledge. That ledge is 72 pixels above the nearby bank, preventing the direct jump-dash that reached the earlier lower arrangement. From the service ledge, an upward strike folds the arm left. A cap prevents boarding that new shelf directly from the service ledge. The upper one-way line returns to the prepared arm.

Hop, dash down-left onto the arm and wavedash beneath the canopy; then dash up-left onto the distant flag. Guarded canopy faces prevent climbing around the payoff. The flag is lower and farther left than the first implementation, giving the powered transfer several nearby successful timings while its guarded edge still rejects the reproduced ordinary edge-grab route. Ordinary post-flag stairs lead through the upper corridor to the exit. The initial wall, final receiving arm and line are physical geometry; no required-turn or movement-input flags gate success.

## Verification and preservation

`tests/fractured_causeway_studies.gd` checks all three deathless flags and physical exits, two breaches by the same living brute, long safe waits, the cage/partition bypasses, lantern loading and knight handoff, retrievable throw, missed-launch recovery, lift velocity, climbing/folding/riding, airborne landing dash and wavedash, nearby complete input variations, reproduced edge-grab shortcuts, native parity/validation, non-overlapping room/secret/passage bounds, actual room selection, individual checkpoints, full application Watch and retry restoration. Preservation fixtures cover the earlier rooms, recordings, section/checkpoint prefix, main requirements, quests, secrets, passages and chapter metadata.

`tests/causeway_three_search.gd` performs bounded input searches with two successful prepared-finish controls and searches without the lantern, lift boost, climb, useful arm pose, line, or advanced finish. Each search uses at most 18,000 expanded nodes, width 32 and depth 32. Snapshots retain player/input buffers, awake state, entity timers, combat/waves and held-object aliases; optional advanced actions are explicitly enabled. A failed bounded search is evidence within that budget, not proof that every possible shortcut is impossible.

The full continuous chapter recording reaches the crossroads through all 23 road sections in **12,775 ordinary-input frames with zero deaths**. It includes the visible entry staircase and post-flag exits without teleports, state resets, invulnerability or physics edits. The native scene round-trips all 40 rooms. Real application captures cover preparation, machine changes, returned landings and finishes.

Shared gameplay scripts/constants, other chapters, browser files, art, voices, quests and workshop definitions are unchanged. The approved nine Woods additions remain in their separate checkout; this isolated Causeway branch does not overwrite them or the existing World 1 edit. The signed macOS prototype is rebuilt with the same data. Packaged checks mount test-only resources over the shipping PCK and reject script errors or missing assertions, including a missing-script negative control.

Final validation: **90 room/application/preservation checks**, the general Fractured suite and all three Fractured chapter journeys pass against the final signed shipping PCK. The packaged harness also rejects its missing-script negative control. All eight bounded searches meet their expected outcomes (two successful prepared-finish controls and six searches finding no omitted-preparation or ordinary-movement replacement within budget). Existing Causeway physics/puzzles, workshop routes, World 3 road/secret journeys and world checks pass; native editor mechanism import and selected-room playback are verified.
