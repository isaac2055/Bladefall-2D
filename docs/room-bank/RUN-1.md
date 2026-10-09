# Run 1 — review decisions and revisions

> Historical delivery record. The 7.293 review decisions, classifications and current replacement solutions are in [Run 1/2/3 review revisions](RUN-2-3-REVIEW.md). Some rooms described below have since changed or moved into Banked.

Updated 8 October 2026. The user's review is applied: **six rooms banked; two revised for another review**. Approved room definitions and completion tapes are unchanged. The current new-room selection is [Run 2](RUN-2.md).

| Decision | Rooms |
| --- | --- |
| Banked — Base | B27 The Shelter Wakes (early/easy material), B29 The Shield You Send, B30 Make Your Own Shade |
| Banked — Fractured | F26 Keep the Borrowed Speed, F27 Catch the Passenger, F28 Reply in Passing |
| Revised — review again | B26 One More Hit; F30 Bring Back the Arc |

F26 retains the accepted dash-to-switch → wavedash → pogo alternative. These are qualitative approvals; numeric player ratings have not been invented.

**B26 — One More Hit:** the uppercut now parks the guard on a higher one-way ledge, allowing a deliberate jump and pogo. The room also adds a full return puzzle: use a stone as shade during the ascent, then send it down from the gallery to restore light to a protected tally and open the lower exit. Uppercut waiting, capture waiting, pogo timing and the following dash have successful full-room variations. [Review B26](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-b26).

**F30 — Bring Back the Arc:** the receiving shelf reaches seven tiles farther west and sits two tiles lower; the long thorned face is shortened. Rope control, the low tally, echo velocity transfer and zero-dash restriction remain. The revised room completes all 72 sampled release/swap combinations, versus 18 on the original. [Review F30](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-f30).

Open **Extras → Room Bank → Run 1 revisions** to review these two, or **Banked** to revisit the six approvals. Their original versions are preserved in `scripts/room-bank/archive/run-1-before-review/`. See [Run 2](RUN-2.md) for the current solutions and tolerance evidence.

---

## Original release notes — 7.290.0

The remaining sections describe the original eight-room release, before the decisions and revisions above. In particular, their B26/F30 solutions and original difficulty estimates are historical. Source links point to the current records; archived originals are in the directory above.

## Why eight

This is a qualitative interaction-coverage exercise, not a statistical factor analysis: no rating dataset exists yet. The selection spans finite enemy life, temporary enemy terrain, remote projectile paths, an object changing roles, constructed geometry, momentum through a contact, phase/resource restraint, moving-target interception and velocity relocation. One action changes the next problem in each room.

The initial outline had twelve rooms. Oren/cargo variants and additional projectile puzzles added too little beyond existing courses and the banked favorites, so they were dropped. The selected rooms isolate distinct combinations sufficiently to make the user’s ratings useful. They are not an exhaustive catalogue of every possible pairing; familiar ingredients such as water, cargo and gravity were not added merely to increase coverage counts.

Existing Precision Courses supplied the mechanics and closest comparisons; Merge Pitches were also inspected. The designs deliberately differ from the previous queue’s repeated safe-wait/cross structure. Two rooms use portals, four rebound from enemies, two use rope control, and two use moving-carriage launches (some categories overlap).

## Review list

The focus descriptions below reveal the central interaction. Full solutions follow in a collapsed section. Difficulty numbers are author estimates, not measured player ratings.

| ID | Room | Side | Estimated difficulty | Interaction focus |
| --- | --- | --- | ---: | --- |
| B26 | One More Hit | Base | 4/5 | Finite target / height |
| B27 | The Shelter Wakes | Base | 4/5 | Enemy state / temporary shelter |
| B29 | The Shield You Send | Base | 4/5 | Object role / remote route |
| B30 | Make Your Own Shade | Base | 4/5 | Constructed terrain / trajectory |
| F26 | Keep the Borrowed Speed | Fractured | 5/5 | Speed / rebound / phase |
| F27 | Catch the Passenger | Fractured | 5/5 | Moving target / interception |
| F28 | Reply in Passing | Fractured | 4/5 | Lift / airborne parry / resource |
| F30 | Bring Back the Arc | Fractured | 5/5 | Controlled launch / relocation |

## What each room is testing

| Room | Consequence carried into the next action |
| --- | --- |
| One More Hit | Raise an enemy before spending its last hit as a high pogo target. |
| The Shelter Wakes | A charge destroys masonry, then the dazed body replaces its beam shelter. |
| The Shield You Send | Send away the starting shield, then use its new shadow to redirect a shot. |
| Make Your Own Shade | An aerial cut creates shade and an obstruction that changes the recovery arc. |
| Keep the Borrowed Speed | Carry a hyper through a finite contact and resist the dash that would remove the landing. |
| Catch the Passenger | Separate the knight’s route from a transported enemy and meet it at the useful height. |
| Reply in Passing | Earn the crossing dash by returning a projectile into a remote receiver during flight. |
| Bring Back the Arc | Create a rising rope departure, release it, then relocate its velocity with the echo. |

Base uses ordinary movement in its saved routes; it is not intended to mean effortless. Fractured combines more constraints during motion. **Bring Back the Arc** uses the existing zero-dash room option, stated in its hint, to isolate rope-generated movement. This is a room restriction, not a change to the normal Survive kit.

**The Shield You Send** deliberately retains a quicker alternative: the knight can parry while descending and continue through the stone’s shade without landing on it. The alternate route still uses the prepared shade and projectile solution.

<details>
<summary>Solutions and nearest existing comparisons</summary>

### B26 — One More Hit

Raise the guard with an upward cut from below its one-way stand. Jump and dash beside it, cross above the rising body and use a downward cut for the last rebound and refreshed dash into the high eastern gallery.

Comparison: combat-10 The Living Stair sequences several enemies; fb4 Stepping Ram uses a stationary temporary step before a moth. This uses the same finite body twice, changing its height before spending its last hit.

Distinct consequence: The first contact changes where the second contact can occur. Killing or pogoing the target at its original height cannot supply the final high departure.

[Saved source and tape](</Users/computer/Projects/Bladefall-2D Antigravity/scripts/room-bank/base/bank-b26.json>)

### B27 — The Shelter Wakes

Stand close enough to draw a charge into the masonry. The ram breaks the old beam shield and its dazed solid body replaces it. Jump toward the new shelter, cut downward into the ram before it wakes, and use that rise plus an upward dash to reach the high gallery. The old masonry blocks the approach; after recovery the exposed beam burns it.

Comparison: fb4 Stepping Ram makes an enemy a step for a separate moth; fb5 Hunting Ground uses a charge to breach. Here the masonry and dazed ram exchange a necessary beam-shield role, with a blade interception before the replacement wakes.

Distinct consequence: A hostile charge destroys the permanent safety barrier but immediately becomes its temporary replacement. The same short window grants safe access and a rebound, so waiting and approaching cannot be solved separately.

[Saved source and tape](</Users/computer/Projects/Bladefall-2D Antigravity/scripts/room-bank/base/bank-b27.json>)

### B29 — The Shield You Send

Dash the shield east, then climb the western pillar and take the upper approach. The stone stops in the upward beam and creates shade with an optional landing. Redirect the upper bolt into the ceiling portal while arriving in that shadow; its distant exit feeds the protected coil. Either land on the stone before the last jump, or use the restored dash to fly straight to the eastern gallery.

Comparison: vi3 Parry Through joins an aimed shot and portals. Bank F15 Borrow the Mouth repurposes portal cargo as beam cover. Here the stone itself stays in the room: dispatching the original shot shield creates a second shielding/aiming job beyond a separate upper approach.

Distinct consequence: The object that protects the start must be sent away. Its final shadow makes the remote shot and crossing possible. It can be a safer landing, or the knight can parry during descent and fly directly through its shadow to the gallery.

[Saved source and tape](</Users/computer/Projects/Bladefall-2D Antigravity/scripts/room-bank/base/bank-b29.json>)

### B30 — Make Your Own Shade

Jump and dash from the takeoff to catch the first ring. Pay out the chain while pumping toward the mould, then cut right to set it before reaching the beam. Release and slide around the new iron: it now blocks the body as well as the light. Catch the second, lower ring from underneath the mould and reel in through the low arc before releasing up toward the exit.

Comparison: Cold Cast creates landing surfaces; Roof Underfoot supplies moving shelter. This room uses an aerial weapon cut to create permanent shade before the swing can cross a previously lethal column.

Distinct consequence: One aerial cut removes a lethal column below the mould but simultaneously creates an obstruction where the outgoing swing wanted to pass. The knight must turn a blocked crossing into a downward release and low catch, then reverse the descent by actively shortening the second chain.

[Saved source and tape](</Users/computer/Projects/Bladefall-2D Antigravity/scripts/room-bank/base/bank-b30.json>)

### F26 — Keep the Borrowed Speed

Launch beneath the low lintel with a hyper. Intercept the finite moth from above; its rebound adds height while preserving the fast horizontal departure. Reach the blue receiving shelf without spending the newly refreshed dash, which would phase the shelf away. Land on the shelf, then use the recovered footing for the final jump through the higher exit slot.

Comparison: combat-04 Keep the Landing pairs pogo with a toggle landing; combat-10 The Living Stair sequences enemies. This low approach makes a grounded speed technique feed the same blade contact that supplies the missing vertical arc, while the receiving surface punishes discarding that speed for another dash.

Distinct consequence: The target is a height conversion for already-earned horizontal speed. The refreshed dash is a tempting but destructive resource because it removes the only receiving floor.

[Saved source and tape](</Users/computer/Projects/Bladefall-2D Antigravity/scripts/room-bank/fractured/bank-f26.json>)

### F27 — Catch the Passenger

Step onto the shuttle carrying the guard. Leave the moving floor before it carries the passenger beneath the low stone overhang; intercept the travelling guard from above for a rebound and refreshed dash. Carry that moving departure into the high shelf while the shuttle and surviving guard continue underneath it.

Comparison: combat-10 The Living Stair uses enemies followed by a zip, and combat-06 The Passing Shot reflects from a moving rail. Here the rail carries the enemy itself into an inaccessible low tunnel; the knight must leave its support and intercept the passenger while both routes are still exposed.

Distinct consequence: The target and the launch floor share a moving frame until the knight leaves. Waiting for the rail to stop loses the useful target geometry beneath the overhang; jumping off without the blade lacks the height for the only far landing.

[Saved source and tape](</Users/computer/Projects/Bladefall-2D Antigravity/scripts/room-bank/fractured/bank-f27.json>)

### F28 — Reply in Passing

Ride into the carriage’s acceleration and jump with its sideways lift. Spend a diagonal dash to meet the bolt beneath the high mouth, aim a parry upward, then move right while the reply flies. The successful contact restores the dash for the rising continuation onto the high gallery, and the remotely routed bolt opens its exit door.

Comparison: combat-06 The Passing Shot places a Combat shot near moving transport; portal courses demonstrate remote receivers. This couples the launch trajectory, an airborne aimed return, and the dash earned by that contact, with no intermediate safe aiming floor.

Distinct consequence: The incoming projectile is both a remote key and an in-flight movement resource. Correct aim must coincide with the continuing launch trajectory.

[Saved source and tape](</Users/computer/Projects/Bladefall-2D Antigravity/scripts/room-bank/fractured/28-bank-f28.json>)

### F30 — Bring Back the Arc

Jump to the isolated upper perch and place the echo. Drop left of the beam onto the lower launch ledge, then jump and catch the ring. Let the chain extend on the far arc to reach the low tally; haul in and steer left to recover before the thorns. Pump the return toward the right, reel near the bottom to produce a rising departure, jump-release, then swap immediately. The echo relocates the moving knight above the beam. Hold the existing rightward launch to land across the upper gulf; landing on the little perch first loses the speed needed to cross.

Comparison: p131 The Citadel and F19 The Weight Must Stay relocate a prepared machinery launch. Here the launch is made by changing a rope length and steering a pendulum after a low objective; the direction and vertical component at release determine whether the relocated arc clears the gulf.

Distinct consequence: There is no dash fallback. The low tally asks for an extended outward arc; the exit asks for a shortened rising return. The same controllable pendulum must supply both trajectories, and the echo transports its velocity across an otherwise lethal beam partition. The upper route is deliberately beyond an ordinary jump from the echo perch.

[Saved source and tape](</Users/computer/Projects/Bladefall-2D Antigravity/scripts/room-bank/fractured/30-bank-f30.json>)

</details>

## Evidence and limits

All 39 active saved routes complete without deaths, including the eight new routes. The 22 new recorded shortcut checks fail to exit. They target omitted contacts, obvious direct approaches, mistimed state changes and spending the wrong resource; they do not prove the absence of every alternate solution.

| Room | Saved completion | Recorded shortcut checks |
| --- | ---: | ---: |
| One More Hit | 246 frames · 0 deaths | 2 |
| The Shelter Wakes | 205 frames · 0 deaths | 3 |
| The Shield You Send | 325 frames · 0 deaths | 3 |
| Make Your Own Shade | 179 frames · 0 deaths | 2 |
| Keep the Borrowed Speed | 130 frames · 0 deaths | 3 |
| Catch the Passenger | 184 frames · 0 deaths | 3 |
| Reply in Passing | 189 frames · 0 deaths | 3 |
| Bring Back the Arc | 316 frames · 0 deaths | 3 |

The existing browser check passes the Extras entry, Run 1/earlier review/banked membership, review submission with stable ID and revision, CSV export, play timer/pause, legacy F20 reclassification, and actual browser completions for all eight new rooms. Every new room received a visual check. Test ratings use a disposable browser profile; they are not user feedback.

The baseline contains 145 file hashes covering the Precision Core, its device/view/course files and all 31 prior room records. All match after Run 1. No new mechanic or entity module was created. The catalog also requires an empty newMechanics list for each new room. No spring transfer is used, avoiding the known bank/Survive spring-profile difference.

The source records save independently after each room. [Manifest](manifest.json), [route report](route-report.json), [source baseline](run-1-baseline.json), and browser captures under `scripts/climb/.cache/room-bank/` preserve the evidence. Local version: **7.290.0**, cache **v455-room-bank-run1**. The local bundle is rebuilt; nothing is published.

Fun, measured difficulty and suitability are intentionally unfilled. Use the reviews to decide which combinations deserve expansion, revision or removal before Run 2.
