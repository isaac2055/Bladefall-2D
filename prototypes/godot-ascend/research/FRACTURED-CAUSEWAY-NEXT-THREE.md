# Fractured Causeway rooms four to six · 0.38.0

The three approved pitches are implemented for playtesting. Open **Play Next Fractured Causeway Rooms.command** (`--world 23 --room 40`), then select the other two by name under **Esc → Explore a section**. Each has an independent checkpoint, optional question/hint, complete Watch reference, and editable native room. The bridge and delivery rooms are accepted; the revised cover opening awaits human playtest approval. The previously accepted three Causeway rooms are unchanged.

## The Bridge You Must Build Backwards

The far bridge starts pointing left, spanning the entrance bank. That useful bridge physically obstructs the near arm's intermediate upright pose. Park the far arm upright, descend to the near hub, and turn the near arm through left and up to right. A permanent service line carries the knight back to the far operating ledge. Only now can the far arm turn through right and down back to left without obstructing the near arm's construction.

The restored upper bridge leads back beneath the upper roof to the return line on the entrance bank. That line enters the completed lower bridge beneath its guarded roof. An airborne down-right landing dash and wavedash carry the knight beyond the canopy, followed by an up-right dash to the flag. A separate one-way connector handles the post-flag exit.

The same arms matter during construction and traversal: the upper arm restores access to the return line; the lower arm supplies the finishing runway. The temporary upright far arm is not the desired final arrangement. The jam checks use the actual geometric obstruction routine, rather than hidden turn counts. Guarded roof openings and the near runway's guarded left edge reject a reproduced route that skipped restoring the far bridge by grabbing the low arm from below.

## The Cover You Must Take Away

Revised in **0.38.1** after the opening proved too easy. Folding the bridge now opens a descent to the sheltered left waiting perch. The brute cannot see the knight there. Drop into the exposed lower pocket to commit its leftward charge, jump and dash upward, then shift left onto the higher stone refuge. The brute opens only the first barrier. Its opened upper passage gives access to the line alcove; dash left across the small gap, then right into the line to cross to the opposite perch.

The brute's low thorn-lined lane is too tight for the knight to cross safely. The initial bank and fixed walls also prevent dropping directly into the opposite pocket. Drop from the receiving perch and move left into view to draw the same brute back toward the second brittle wall. Jump right and dash up to its sheltered perch. Only this opposed charge opens the right alcove and its line to the existing finishing runway.

Waiting on the first stone refuge was explicitly checked: an earlier draft allowed the brute to see upward and automatically charge back toward the second barrier. The final solid refuge blocks that sightline. The opposite waiting perch also leaves the second barrier intact indefinitely in the tested wait. Each committed charge requires an escape, and nearby successful input timings are checked. The camera frames more of the arena to the left so the brute remains visible from the second bait pocket. No enemy or movement code changes. The original finishing tiles, goal, landing point, wavedash inputs and post-flag exit remain exact.

## The Delivery You Cannot Ride With

Carry the lantern onto the hinged throwing dock. The short low guide and settling trough lead to an eight-pixel letterbox: the lantern fits, while the knight's eleven-pixel body does not. The lantern slides through that route onto the distant recoil plate, depressing it into the receiving runway.

Return to the dock's hub and fold it down. Its former horizontal body was also the roof of the enclosed line chamber; removing it lets the knight enter and ride across empty-handed. Carrying the lantern disables the required entry dash. The far plate, initially too high beneath its roof, must already be lowered when the knight arrives. Leave the lantern loading it while making the powered finish beneath the overhang and across to the high flag.

The throw is not a one-pixel shot through a slit: the guide, shallow drop and trough settle the object before the opening. Nearby complete throw timings are checked. A reproduced ordinary coyote-jump/dash finish prompted a longer overhang and a farther flag; the same witness now falls short, while the demonstrated wavedash route still clears. The post-flag connector leads to the outer exit road.

## Verification and preservation

`tests/causeway_next.gd` verifies the three ordinary-input deathless flags and physical exits; actual arm-order obstructions and their clearance; the covered brute's inactivity followed by a charge after folding; the living brute's breach; lantern delivery before dock removal; separate player/object paths; sustained lantern loading during the finish; airborne landing dashes and wavedashes; preparation counterfactuals; nearby successful finish inputs; reproduced shortcuts; all prior room/recording hashes; earlier section/checkpoint and main-requirement prefixes; unchanged quests, secrets, passages and chapter metadata; native round-trip/validation; the real menu, hints, Watch recordings, live preparation and full retries.

The independent full-road recording clears all **26 road sections in 16,492 ordinary-input frames with zero deaths**. Its first **12,775 frames** are the previous recording exactly. The new upper-court approach and all post-flag exits are traversed with normal inputs, without room warps, state resets, invulnerability or movement changes. New room and crossroads bounds leave existing roads, secrets and passages clear.

`tests/causeway_next_search.gd` supplies three successful prepared-finish controls and nine bounded searches for omitted preparation or ordinary-movement substitutes. Each search uses at most **12,000 nodes, width 28 and depth 32**. Optional advanced moves are explicitly enabled when testing preparation. Snapshots include awake state, actor bounds, combat actors/waves and held-object aliases; combat state also participates in duplicate-state pruning. No shortcut found within this budget is not a proof of impossibility. The earlier discovered successful shortcuts are retained separately as replayable fixtures.

Actual application captures cover parked/restored arm states, the lower operating ledge, the brute under its cover and after the breach, lantern delivery, the opened hatch, the lowered receiving runway and the final transfers. The signed macOS app is rebuilt from these same native definitions. Packaged tests use the existing test-only overlay and reject script errors, missing assertions and a missing-script negative control.

The initial 0.38.0 packaged verification passed all four suites: `causeway_next` (103 checks), `fractured_causeway_studies` (90 checks), `fractured`, and `fractured_journey`. All twelve initial bounded-search outcomes matched their expected results. The existing World 1 native edit retained its original SHA-256 hash.

Chapter 23 now has **43 definitions, 19 required main challenges, and six added puzzle rooms**. The prior accepted three rooms, every other earlier room except the crossroads' incoming connection, and all earlier recordings except this revised cover room and the full-road tour remain unchanged. Other chapters, the separate approved Woods checkout, the existing World 1 edit, shared gameplay code/constants, browser files, workshop definitions, quests, art and voices are untouched. No inter-world passage or world-ending superroom is added.

### Cover revision verification · 0.38.1

`tests/cover_two_baits.gd` adds 75 checks covering both opposed breaches, lower-pocket exposure before each useful charge, escape positions, safe waits, permanent-barrier and missing-route counterfactuals, the old solution, nearby input variations, and preservation of all 42 other definitions and their Watch recordings. The chapter placements and checkpoints are unchanged. The first 14,476 full-road input frames remain identical. `tests/cover_two_baits_search.gd` adds prepared-access controls and bounded searches for jumping the barriers or replacing the first crossing with the low lane, using the existing 12,000-node, width-28, depth-32 budget. Search failure is limited evidence, not a proof of impossibility.

The signed 0.38.1 app passed all five packaged suites: `cover_two_baits` (75 checks), `causeway_next` (103), `fractured_causeway_studies` (90), `fractured`, and `fractured_journey`. All eight revision search outcomes matched their expected results. Actual application captures confirm both refuges, the exposed bait pockets and visibility of the brute from the second pocket. The existing World 1 native edit retains its original SHA-256 hash.
