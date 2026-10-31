# Three Fractured Outskirts puzzle proposals

2026-10-31. **Proposals only. No building authorized or performed.** These would extend the existing Fractured Outskirts road after Ring It from the Other Side and before The Broken Gate crossroads, preserving the current rooms and their individual checkpoints. They are three separate candidate rooms, not a combined finale.

Basis: [Celeste 1B research](FRACTURED-OUTSKIRTS-CELESTE-1B.md), current world-21 definitions, the existing workshop studies, and `scripts/core.gd`. The intended routes below are spatial hypotheses. They have not been laid out, simulated or proved, and exact geometry may need revision. All use existing mechanics, one normal dash and normal stamina. Supers are already taught by this chapter; no new mandatory hypers, wavedashes or wallbounces are proposed.

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

No new quests, voices, assets, movement constants, rooms or proof tapes were created. These concepts await the user's selection or approval before implementation.
