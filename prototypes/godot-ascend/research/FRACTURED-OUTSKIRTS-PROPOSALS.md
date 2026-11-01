# Three Fractured Outskirts puzzle proposals

**0.31.0 continuation:** the three further concepts mentioned in the historical sections below have now been approved and built. See [their implementation and evidence](NEXT-THREE-FRACTURED-PROPOSALS.md).

**0.30.0 update:** the user accepted room 2 unchanged and explicitly requested wavedash finishes in rooms 1 and 3. The original 0.29.0 super-based intent and evidence below are historical; the final section records the superseding wavedash revision. The next three concepts are [proposals only](NEXT-THREE-FRACTURED-PROPOSALS.md).

2026-10-31. **Approved and implemented in 0.29.0.** The original proposals below describe the design intent. All three now extend the Fractured Outskirts road after Ring It from the Other Side and before The Broken Gate crossroads, preserving earlier room geometry and individual checkpoints. Implementation evidence and differences follow the original proposals.

Basis: [Celeste 1B research](FRACTURED-OUTSKIRTS-CELESTE-1B.md), world-21 definitions, the existing workshop studies, and `scripts/core.gd`. The routes below began as spatial hypotheses; the implementation section records their tested layouts. All use existing mechanics, one normal dash and normal stamina. Supers are already taught by this chapter; no new mandatory hypers, wavedashes or wallbounces are introduced.

## 1. The Lower Runway

**Question:** Why would lowering your foothold let you jump farther?

**Setup.** A raised pushable stone interrupts the far end of a low launch corridor. Its upper surface sits inside a service recess; the onward ceiling prevents that higher position serving as an easy launch. Beneath the stone is a short socket with a visible solid stop. When lowered into it, the stone's top would join the corridor floor and extend the launch surface toward a broad final gap. The ceiling ends before the useful launch edge, leaving room for an ordinary super jump.

**Intended plan.** Reach the service recess above the stone and dash downward into it. The existing stone response moves it down to the stop and bounces the player away. Recover on the safe approach, then use the lowered stone as the final part of the runway. Start a ground dash and super from the newly available edge to reach the exit.

**Discovery.** Higher is not always better. The stone's initial height obstructs access to the useful launch position; lowering it changes both clearance and where the player can leave the ground.

**Why it belongs here.** The Ash Verge teaches what a super does. The Survey Stone and Cracked Road ask when to use temporary ground. This asks the player to create the right launch surface first. Compared with The Spring Under the Stone, there is no recoil platform or remote stone dock: the relationship is between floor height, overhead clearance and a super departure.

**Readability and recovery.** Keep the setup beside a safe floor, show the socket and its stop, and let the player inspect the gap before committing. The successful shove should produce a stable arrangement, with time to examine it and choose the dash start. A bad shove can be recovered where practical or reset at this room's checkpoint; no collapse deadline should be added just to increase difficulty.

**Reject or revise if:** the initial high stone can substitute for the prepared launch; a normal jump and air dash bypass the super; the approach floor reaches the exit without the stone; a wall climb replaces the lowered position; or the lowered block leaves insufficient headroom for the proposed movement. Do not claim that a short platform cannot support a super merely because it is short. The required distinction is launch position and clearance, not an invented minimum run-up length. Test downward, upward and diagonal shoves, the existing bounce, and several dash/jump timings.

## 2. The Other Side of the Carriage

**Question:** Which side of the same moving block will you need for the journey home?

**Setup.** A horizontal carriage travels through a low passage toward a far alcove. The accessible starting contact is its leading face. Its top is unavailable as a standing reset along the relevant passage, but the far alcove offers a proper rest and a way around the block. The exit is high on the home side. Returning on the opposite face would let a normal wall jump send the player toward that exit while preserving the dash for the final rise.

**Intended plan.** Cling to the outward face and ride to the alcove. Rest to recover stamina. While the carriage is at its far stop, move around it and catch the home-facing side for the return. Leave that side with an ordinary wall jump toward home, then use the saved dash to gain the remaining height.

**Discovery.** Reaching the moving block is only half the plan. The contact face determines where a jump sends you and whether the remaining dash can solve the next problem.

**Why it belongs here.** Existing counterweight rooms develop returning footholds and launch momentum. This focuses on changing the player's relationship to one body before reversing direction. It follows the contact and resource questions visible in Celeste 1B without adding a new movement technique. The Fractured decision is choosing a useful arrival state, rather than executing a longer sequence of identical transfers.

**Readability and recovery.** The far alcove should be a genuine place to stand and inspect the return, with a generous carriage hold. Do not require hanging through both trips on one stamina bar. Make the exit and the obstructed top readable. Because current world 21 has no zippers, include a safe first activation rather than assume the player knows the workshop.

**Reject or revise if:** jumping from the wrong face and steering back solves the same finish just as easily; either face can climb onto an equivalent standing reset; the idle carriage or starting bank reaches the exit; or the swap requires a narrow deadline. An earlier safe face swap is a valid alternative if it preserves the intended decision. Do not script a compulsory far-alcove visit or secretly count side changes. Normal wall jumping is the baseline; a wallbounce is not an acceptable undeclared requirement.

## 3. The Door You Need Shut

**Question:** When does closing the door help you escape?

**Setup.** The room begins with a lantern already resting on an elevated pressure plate, holding a broad vertical door open. The open door permits the low outward route. That route loops up to the plate's service ledge, which cannot be reached directly from the entrance. The same door, when closed, would have a broad top at the height of the missing final runway. Its body therefore serves two physical roles: a low passage obstruction and a high launch surface.

**Intended plan.** Travel through the open doorway and climb to the service ledge beside the lantern. Pick the lantern up, emptying the plate and closing the door below. Set it down on an ordinary resting shelf, away from the plate: carrying it would prevent the dash needed next. Step onto the closed door's top and use a super from its homeward edge to reach the exit.

**Discovery.** The useful final state is an empty switch and a closed door. Keeping the route open has become the wrong objective. Putting the lantern down is a movement decision, not delivery of an arbitrary quest item.

**Why it belongs here.** Workshop rooms 25 and 27 reward leaving a load behind so a gate stays open. This reverses that familiar relationship. The player must withdraw the load to create a surface, then stop carrying it to use the chapter's taught movement. Unlike Leave the Light Behind, this uses neither beam cover nor mirror alignment. Unlike the Sentinel ending, it changes architecture through weight rather than recalls an opponent.

**Readability and recovery.** Show the existing lantern/plate relationship and the door's missing upper connection. Put the service ledge outside the door's closing volume, with a clear off-switch resting shelf for the lantern. The final configuration should be stable, not timed. Carrying is not yet introduced in world 21, so a short optional hint should explain pickup and set-down if inspection alone is insufficient.

**Reject or revise if:** the plate can be emptied from the entrance; the closed door can be climbed from below without the outward trip; the far ledge reaches the exit while the door remains open; or throwing the lantern makes a simple direct shortcut that removes the main relationship. A throw that empties the plate and still creates/uses the runway can be a legitimate solution. The door must reappear safely with the player clear, using the existing overlap rule. Retry must restore the initial resting weight and door state. No hidden carrying, switch-use or machine-use counters are proposed.

## Recommended sequence and later build criteria

Use the order above: **prepare a surface → prepare a contact → choose the architectural state needed for the final launch**. The first makes a stable spatial change; the second adds moving-body arrival and resource management; the third combines an observable state reversal with a stable final super. This is an intended progression in reasoning, not a measured difficulty rating.

Before accepting any later build, require a full normal-input route, multiple nearby successful timings, relevant bypass attempts and counterfactuals, visible cause and effect, and reliable death/retry behavior. Preserve current chapter geometry, recordings, progress and exits. Each new room keeps its own checkpoint; no passages or world finale are part of these proposals.

Native world-21 placement and completion tracking would need to be handled deliberately in a future implementation. The simple browser editor currently targets world 4; editing chapter-21 additions there would require chapter access support as a separate explicit part of that build scope. This document does not change the editor.

At the proposal stage, no quests, voices, assets, movement constants, rooms or proof tapes were created. The user subsequently approved all three rooms.

## Implemented layout and evidence · 0.29.0

The native editable chapter and source contain all three additions at indices 38–40 (menu 39–41). `Play Fractured Puzzle Rooms.command` opens the first. They have separate live checkpoints, optional hints and complete Watch references reaching their physical exits. No workshop award or hidden action counter controls progression. No new quests, voices, art or movement constants were added.

**Lower Runway:** the stone lowers from y=216 to y=248. Fixed side lips and the overhead mass make its original height obstruct the useful departure. The lowered arrangement remains stable during an extra 180-frame wait. The reference uses the same ground-dash recovery, super and air-dash pattern already present in Ash Verge.

**Carriage:** the far bank restores full stamina. A generous 240-frame hold permits the player to walk underneath, grab the opposite face and return. An exposed high contact remains available for the homeward wall jump; the lower parked face and gallery entrance are guarded. The ordinary wall jump and upward dash preserve the proposed contact decision.

**Door:** the lantern settles onto the plate at the start, opening the low route. The far steps lead back to the service ledge. Picking up the lantern closes the door on the following simulation tick; setting it aside leaves the stable runway. A spiked lintel prevents a direct open-door launch. A fresh search also finds a late air-dash finish from the closed runway without a super. This alternative preserves the architectural decision and is deliberately allowed.

**Preservation and placement:** the previous 38 definitions and their recordings are protected by fingerprints. Only F63's onward socket and the crossroads' incoming link metadata change. The three sections start at tile coordinates (306,-190), (354,-190), and (406,-211). The crossroads moves to (462,-200). Other old placements, optional spaces, rewards and quest metadata stay unchanged. World 21 contains 41 definitions and 17 required challenges; the workshop remains 30 rooms. Browser editing still targets world 4, as scoped above.

**Verification:**

- `tests/fractured_puzzles.gd` proves three deathless routes with the normal kit, machinery states, full stamina recovery, stable preparation and six nearby timing sweeps. Five saved successful shortcuts from earlier drafts reproduce as positive controls and fail in the revised geometry: three carriage escapes and two open-door escapes.
- `tests/fractured_puzzle_search.gd` runs 12 fresh-input cases, including positive controls and searches against both the carriage's home platform and actual exit gallery. Each case uses at most 20,000 branches, width 50 and depth 50. Negative results are bounded evidence, not exhaustive proofs.
- `tests/fractured_puzzles_app.gd` checks source/native equality, native validation, preservation, actual gameplay routes, individual checkpoints, hint cleanup, Watch exits and death/retry restoration after interrupted stone, carriage and cargo actions.
- `tests/fractured_journey.gd` completes the extended 10,172-frame road through 22 regions with zero deaths. Its original 7,907-frame prefix is unchanged. `tests/feel_journey.gd` repeats that route through the real application with camera/presentation enabled.
- Packaged regression suites cover the earlier workshop, five-room and six-room puzzle sets, editor playback, pickups, Causeway and chapter behavior. All six browser-reference parity sets also pass: 322 traces and 95,367 frames.
- Actual GPU captures from the signed app were inspected at the starts, decisions, finishes, hints and pause menus. A room-specific camera anchor makes the elevated lantern visible from the door-room entrance.

The broader flower regression initially failed two assertions because it placed the player at the original patch coordinates, while the user's existing edited world-1 scene had moved the patch. Running the previous code with that same scene reproduced both failures. The test now reads the native patch's actual position; gameplay and the user's scene remain untouched.

Run the new suites with the pinned Godot binary, `--headless --path prototypes/godot-ascend --script tests/<name>.gd`. The search accepts an optional report path after `--`. Packaged verification uses external test scripts against the app's actual PCK because tests are excluded from exports.

Human playtesting remains necessary for route readability and enjoyment. Passing routes and bounded shortcut checks do not establish that every alternative has been eliminated.

## Wavedash revision · 0.30.0

The approved change strengthens Lower Runway and Door You Need Shut while preserving their stone/door preparation. Each now leads to a small landing and a wider final gap. A diagonal downward **air** dash lands on that surface, restores the charge and supplies the low 325 px/s jump. A later upward-right dash completes the gap. Hints and Watch references demonstrate the complete route. The overhead clearance and gap distance make the former supers and the previously accepted non-wavedash late-air-dash route insufficient. Completion remains ordinary physical traversal; no runtime wavedash flag, secret input check or movement-constant change was introduced.

The two rooms grow by 16 tiles each. Their starts remain at (306,-190) and move to (422,-211), respectively; the unchanged carriage moves to (370,-190), and the crossroads to (494,-200). The other 39 room definitions and recordings remain exact. All checkpoints remain separate. The full chapter's 7,907-frame original prefix is unchanged; the complete revised road is 10,358 frames. Native/source parity remains exact.

`tests/fractured_puzzles.gd` now checks an airborne downward-diagonal dash, recovered charge and the resulting low fast jump in both revised references, plus nearby landing/jump/exit timings. The carriage retains its ordinary route. `tests/wavedash_finishes.gd` preserves the other 39 definitions and their tapes, reproduces the two 0.29.0 super clears and three grounded-hyper shortcuts from the first wavedash draft, then rejects those same tapes in the final geometry. It also checks 1,800 grounded-hyper and ordinary jump/dash attempts per landing across every supported integer starting position. Its fixtures preserve the actual earlier successful layouts.

`tests/fractured_puzzle_search.gd` includes fresh positive controls after the wavedash and negative searches that reject the actual airborne downward-diagonal-dash-to-low-jump sequence, from both the prepared approach and the small landing. Other air dashes and grounded hypers remain available to those searches. It also retains the original stone, open-door and carriage counterfactuals. Each search has a 24,000-branch budget, width 60 and depth 50; negative results remain bounded evidence. Existing application checks cover the updated Watch routes, retries, deaths and checkpoints. They also verify that each distant finish is visible from the pre-wavedash landing. Actual app captures were inspected at preparation, landing, launch and finish.

No additional rooms, quests, voices or art were built in this revision. The three further proposals require approval before implementation.

Final validation used the signed 0.30.0 app: 13 packaged suites passed, including the 264-check workshop regression. Eight final search cases for the revised rooms passed with the stronger wavedash-specific filter. A positive and negative comparison against the previous search helper preserved its default results, exact input tape and node counts. The final camera/app road check completed all 10,358 frames with zero deaths.
