# Fractured Causeway rooms four to six · 0.38.0

The three approved pitches are implemented for playtesting. Open **Play Next Fractured Causeway Rooms.command** (`--world 23 --room 40`), then select the other two by name under **Esc → Explore a section**. Each has an independent checkpoint, optional question/hint, complete Watch reference, and editable native room. These additions await human playtest approval. The previously accepted three Causeway rooms are unchanged.

## The Bridge You Must Build Backwards

The far bridge starts pointing left, spanning the entrance bank. That useful bridge physically obstructs the near arm's intermediate upright pose. Park the far arm upright, descend to the near hub, and turn the near arm through left and up to right. A permanent service line carries the knight back to the far operating ledge. Only now can the far arm turn through right and down back to left without obstructing the near arm's construction.

The restored upper bridge leads back beneath the upper roof to the return line on the entrance bank. That line enters the completed lower bridge beneath its guarded roof. An airborne down-right landing dash and wavedash carry the knight beyond the canopy, followed by an up-right dash to the flag. A separate one-way connector handles the post-flag exit.

The same arms matter during construction and traversal: the upper arm restores access to the return line; the lower arm supplies the finishing runway. The temporary upright far arm is not the desired final arrangement. The jam checks use the actual geometric obstruction routine, rather than hidden turn counts. Guarded roof openings and the near runway's guarded left edge reject a reproduced route that skipped restoring the far bridge by grabbing the low arm from below.

## The Cover You Must Take Away

Cross the horizontal bridge to its hub. The bridge also blocks the brute's view of the knight; waiting on its permanent perch never starts a charge. Folding it down removes that cover and exposes the bait. The same turn opens the upper court's floor and leaves a hanging divider for the descent.

The brute breaks the left wall. Descend on the divider's right side, draw the next charge away from the opened alcove, and cross the lower footing into it. Its line delivers to the separated finishing runway. A wavedash beneath the canopy and an up-right dash reach the flag.

The upper entry road drops through a marked opening directly onto the covered starting bank, keeping the brute unaware before preparation. The fixed court walls prevent descending around the intact cover to activate the brute from a different starting position. The lower openings remain tall enough for the brute to reach the brittle wall. None of this changes enemy detection, charge duration, or combat physics. There is a safe standing area for reading the arrangement and waiting for a commitment.

## The Delivery You Cannot Ride With

Carry the lantern onto the hinged throwing dock. The short low guide and settling trough lead to an eight-pixel letterbox: the lantern fits, while the knight's eleven-pixel body does not. The lantern slides through that route onto the distant recoil plate, depressing it into the receiving runway.

Return to the dock's hub and fold it down. Its former horizontal body was also the roof of the enclosed line chamber; removing it lets the knight enter and ride across empty-handed. Carrying the lantern disables the required entry dash. The far plate, initially too high beneath its roof, must already be lowered when the knight arrives. Leave the lantern loading it while making the powered finish beneath the overhang and across to the high flag.

The throw is not a one-pixel shot through a slit: the guide, shallow drop and trough settle the object before the opening. Nearby complete throw timings are checked. A reproduced ordinary coyote-jump/dash finish prompted a longer overhang and a farther flag; the same witness now falls short, while the demonstrated wavedash route still clears. The post-flag connector leads to the outer exit road.

## Verification and preservation

`tests/causeway_next.gd` verifies the three ordinary-input deathless flags and physical exits; actual arm-order obstructions and their clearance; the covered brute's inactivity followed by a charge after folding; the living brute's breach; lantern delivery before dock removal; separate player/object paths; sustained lantern loading during the finish; airborne landing dashes and wavedashes; preparation counterfactuals; nearby successful finish inputs; reproduced shortcuts; all prior room/recording hashes; earlier section/checkpoint and main-requirement prefixes; unchanged quests, secrets, passages and chapter metadata; native round-trip/validation; the real menu, hints, Watch recordings, live preparation and full retries.

The independent full-road recording clears all **26 road sections in 16,121 ordinary-input frames with zero deaths**. Its first **12,775 frames** are the previous recording exactly. The new upper-court approach and all post-flag exits are traversed with normal inputs, without room warps, state resets, invulnerability or movement changes. New room and crossroads bounds leave existing roads, secrets and passages clear.

`tests/causeway_next_search.gd` supplies three successful prepared-finish controls and nine bounded searches for omitted preparation or ordinary-movement substitutes. Each search uses at most **12,000 nodes, width 28 and depth 32**. Optional advanced moves are explicitly enabled when testing preparation. Snapshots include awake state, actor bounds, combat actors/waves and held-object aliases; combat state also participates in duplicate-state pruning. No shortcut found within this budget is not a proof of impossibility. The earlier discovered successful shortcuts are retained separately as replayable fixtures.

Actual application captures cover parked/restored arm states, the lower operating ledge, the brute under its cover and after the breach, lantern delivery, the opened hatch, the lowered receiving runway and the final transfers. The signed macOS app is rebuilt from these same native definitions. Packaged tests use the existing test-only overlay and reject script errors, missing assertions and a missing-script negative control.

Final packaged verification passed all four suites: `causeway_next` (103 checks), `fractured_causeway_studies` (90 checks), `fractured`, and `fractured_journey`. All twelve bounded-search outcomes matched their expected results. The existing World 1 native edit retained its original SHA-256 hash.

Chapter 23 now has **43 definitions, 19 required main challenges, and six added puzzle rooms**. The prior accepted three rooms, every other earlier room except the crossroads' incoming connection, and all earlier recordings remain unchanged. Other chapters, the separate approved Woods checkout, the existing World 1 edit, shared gameplay code/constants, browser files, workshop definitions, quests, art and voices are untouched. No inter-world passage or world-ending superroom is added.
