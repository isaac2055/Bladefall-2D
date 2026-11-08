# Two Causeway launch puzzles · 0.42.0

Open **Play Two Launch Puzzles.command** (`--causeway-launch-rooms --world 23 --room 0`). N selects the next room, R retries its own checkpoint, H gives an optional hint, and Watch solution plays its complete ordinary-input reference. The two new candidates use their own JSON and native editable scene. The regular 43-definition chapter and the two cover alternatives retain their existing layouts and recordings.

## The Weight You Must Send Ahead

Set the lantern on the launch plate. Hold Down while taking it back so that the knight preserves the loaded arrangement. Throw right: the settling trough delivers the lantern through the eight-pixel letterbox to the receiving plate. That plate lowers beneath its roof while the knight uses the released first plate to launch over the tall thorned divider.

Brake into the small shelf between the divider and receiving roof. The roof's top is thorned, so landing on it does not replace entering the lowered alcove. Drop through the shelf and move right to board the receiving plate. Hold Down while retrieving the lantern, carry it to the plate's uncovered end, throw clear, and make the short flag transfer. The starting plate does not need a bespoke activation flag, and the receiving plate has no scripted success condition: their bodies and actual loads determine access.

The initial draft's throw guide intersected the unloaded plate. The finished room instead uses a separate settling trough beyond the launch plate. The divider demands the substantial crossing; the short final transfer uses no dash in the reference. A missed short crossing can return to the first plate, recharge it with the knight, and try again while the lantern remains at the destination. Lower shelves also return toward the first bank. An outer thorn strip closes climbing onto the receiving plate's exposed end from the recovery floor.

## The Roof You Must Launch Through

The checkpoint sits in a low entrance corridor beneath the upper flag landing. Walking left enters the recoil chamber. The horizontal arm seals its launch shaft; the adjacent masonry prevents climbing around its far end. The entrance begins at the operating chamber rather than adding a separate approach across the top of the roof.

Charge the plate near the left hub. Release and jump, strike upward during the rise to fold the roof down, then dash up beside the resulting hanging wall and jump again to bounce toward the broad upper flag. The unfolding happens during the demonstrated launch rather than from a separate stationary operating pocket. The shared hinge rotation, strike range, collision and player movement rules are unchanged. An earlier fold is allowed if achieved with ordinary play; the room has no hidden required sequence counter.

The upper landing extends toward the chamber to give nearby successful bounce timings. It is the end of the main maneuver, followed by an ordinary walk across the flag. Thorned masonry prevents replacing the hanging wall with a climb up the outer enclosure or flag side. Missed transfers can land on the plate, recharge it and retry with the roof already folded. Lower one-way steps lead back through the entrance floor after deeper falls.

## Verification

`tests/causeway_launch_rooms.gd` covers ordinary-input flags without deaths, real lantern loading and handoff, entering below the receiving roof, braking on the small shelf, airborne folding and wall bounce, reference counterfactuals, nearby successful timings, two complete missed-transfer recovery recordings, safe flags, native round-trip and validation, the actual application's room controls, hints, Watch demonstrations, live completion and independent checkpoint retries. Preservation hashes cover the canonical Causeway data, native scene and tour, both cover alternatives, and the unchanged core and mechanism scripts.

`tests/causeway_launch_search.gd` supplies prepared-finish positive controls for both rooms and bounded searches for omitting the lantern, replacing the first stored launch, or keeping the second roof horizontal. Searches allow advanced movement and use at most 12,000 nodes, width 28 and depth 32. A failed search is limited evidence within that budget, rather than proof that every possible shortcut is impossible. Reference counterfactuals establish dependencies of those recordings, not uniqueness of their solutions.

No new movement mechanic, enemy tuning, art, quest or voice is introduced. Other chapters and their editor scenes are untouched. The two rooms remain separate candidates with individual checkpoints; no inter-world passage or combined finale is added.

The source and signed macOS room suites pass all 62 checks. All five bounded search cases match their expected outcomes. The packaged cover comparison regression passes its 85 checks, and all three Fractured chapter journeys pass. The packaged harness also rejects its missing-script negative control. Rendered captures confirm the receiving alcove, visible launch machinery, folded wall and broad final landing. The separate World 1 native edit retains its existing SHA-256 hash.
