# Catch revision and three further concepts

2026-11-01. **All four approved changes are built and verified in prototype 0.33.0.** Each has a deathless ordinary-input recording, a live application clear, a complete Watch replay to its exit, and independent death/retry checks. Nearby setup timing samples pass. The continuous campaign recording reaches the crossroads through all 28 regions in 17,419 frames with zero deaths; the signed packaged app passed twenty relevant suites. No art, voices, quests or movement constants were added.

## Revise The Catch Below the Exit: The Catch You Leave Behind

The criticism identifies a structural problem: lowering the rope solves one obstacle, then a full recovery shelf starts an unrelated wavedash exercise. More teeth or a longer rope ride would only lengthen that sequence.

**Replace that structure with an outward preparation and a homeward launch.** Put the flag above the entrance. The moving ring initially hangs above a broad, pushable stone whose exposed top would make a useful homeward wavedash landing. In its initial high position, however, that stone seals the lower return throat. The far service ledge gives access to its opposite face through a short upper approach. The stone's lower socket is visible from both sides; lowering it clears the throat and puts its top at the useful landing height.

Ride the hook outward, changing hanging height to pass the fixed thorn screen. Recover at the far service ledge, inspect the home flag and descend to shove the stone into its lower socket. Catch the same ring on its return and use its adjustable hanging height to enter the newly cleared throat. Release into a diagonal downward dash onto the lowered stone, wavedash home and spend the recovered dash upward to the flag.

**The discovery is that the return landing must be prepared from the other side.** The ring supplies access to the preparation and the return approach; the stone supplies both clearance and the landing needed to leave that approach. The far rest remains generous, but it comes before the decision's payoff. There is no separate safe bank between the final hook approach and its landing.

This deliberately combines the successful useful-side question from Carriage with the useful-height question from Lower Runway. It earns its place only if the ring gives access that the stone alone cannot provide, and the socket changes both clearance and launch position. If it plays like those rooms merely placed end to end, reject the draft rather than extend it.

**Build risks and acceptance checks:** the actual rope is cut by solid obstructions, so the thorn screen must leave clear rope sight lines; do not send a rope through the lowered stone. The final release and landing must admit a broad range of approach timings. Test an unlowered stone, a permanently lowered stone from spawn, no hook, both hook endpoints, direct jumps from the service ledge, early stone access, riding the carrier roof and abandoning the hook before the return. Accept an earlier safe reel adjustment or another route that still uses the prepared clearance and landing. Reject a draft whose return requires an exact carrier phase, excessive hanging stamina or a disguised compulsory key-press sequence. These are spatial hypotheses, not proven feasible geometry.

## 1. The Door That Stops the Stone

**Question:** Why would opening the door too soon take away your route to its switch?

A pushable stone begins under a low housing. A closed weight-held gate lies beyond a short gap in the stone's horizontal track. The gate is initially the stone's useful stop: shove toward it and the stone parks beneath an upper service ledge. That ledge contains the lantern and its pressure plate. The initial housing prevents the unmoved stone providing the same approach.

Use the closed gate as the temporary stop, stand on the parked stone to reach the service ledge, and put the lantern onto the plate. The gate retracts, removing the temporary stop. Return to the stone and shove again through the newly open doorway toward its final fixed stop. Its new position supplies the far wavedash landing beneath the high exit. Recover on the approach, drop onto that landing and use the recovered dash for the finish.

**The discovery is that the obstruction is useful before it is removed.** The closed gate positions the stepping stone that gives access to its own opening. Opening then makes that stepping stone movable again. Unlike Door You Need Shut, the closed door is not the launch surface and closing is not the final objective. Unlike Lower Runway, a single shove into an obvious socket cannot finish the preparation. This develops the successful temporary-dock relationship using the Outskirts' stone and weight-held gate, without importing Causeway arms.

**Verify before acceptance:** test reaching the service ledge before moving the stone, moving the stone directly to its final stop, activating the plate by a throw from below, climbing the closed gate, riding a shove and launching from the temporary dock. Ordinary cargo throws remain valid; if one removes the entire temporary-stop decision, move the service ledge rather than disable throwing. The final stone position must remain physically distinct from the first useful dock. Check real shove travel and fixed-gate collision: the gate must stop the stone rather than permit overlap. No hidden requirement counts the two shoves.

## 2. The Stone That Gives You Back the Dash

**Question:** Where should the obstacle end up after it opens the way?

A pushable stone blocks a low exit from an inspection balcony. Two visible stops are possible. The near stop opens the passage but leaves no landing in the shaft beyond it. The far stop places the same stone below the shaft's far lip. A safe lower floor lets the player inspect and recover from the wrong stop.

Reach the balcony, shove the stone toward the far stop, then return to the shaft entrance. Dash through the low throat, land on the relocated stone to recover the charge, wavedash from its top and spend the recovered dash to climb out of the shaft. The initial stone clears one route and becomes the next route's resource recovery.

**Why it develops the earlier rooms:** Lower Runway asks for a lower launch surface; this asks for the right horizontal destination after the obvious obstruction has already been removed. It borrows Obstruction Is Your Landing's good cause-and-effect relationship without adding a Causeway arm. The wrong stop should look plausible and remain recoverable, so the decision is discovered through layout rather than a fatal guessing game.

**Verify before acceptance:** try every stationary starting surface, near-stop launches, wall climbing, direct balcony-to-exit dashes and following the moving stone. Landing on the stone must contribute something the lower safety floor cannot replace. The safe recovery path must not itself reach the finish. Test actual stone dimensions and dash-shove direction; reject if a wall jump from the shaft side supplies the missing resource just as easily.

## 3. The Bridge Above Your Landing

**Question:** Which part of your return route should you remove?

A horizontal carriage passes below an overhead crumble bridge. The bridge gives a safe outward crossing to the far activation side of the carriage. Intact, it also prevents a diagonal downward dash reaching the carriage roof at the useful place on the return. An ordinary fixed rest sits beside the far end of the bridge.

Cross the bridge, activate the carriage and recover at the far rest. Step onto the marked middle crumble span to remove the cover over the carriage's return path. Drop back to the adjacent rest, watch the carriage approach, then dash diagonally down through the opened span onto its returning roof. Wavedash home and use the recovered charge for the high exit.

**Why it develops the successes:** Ceiling makes absent ceiling useful; Runway makes a future moving landing useful. Here those facts constrain the same landing: the route used outward is the obstacle to reaching the roof on return. The crumble change and the carriage are therefore causally connected, rather than two consecutive demonstrations.

**Verify before acceptance:** ordinary crumble respawn is only 120 frames. The useful return must occur within a comfortable window after breaking, with time to settle on the fixed rest. Do not solve this by adding a custom crumble timeout. Reject the arrangement if it creates an exact synchronization trick; move the activation point and shorten the crossing instead. Test the intact bridge, parked carriage at either end, outward-moving carriage, a direct bridge wavedash and early bridge breaking. If a direct drop from either bridge edge replaces opening the middle, revise its surrounding architecture. Accept earlier preparation when it remains useful and legible.

## Recommendation

Prioritize the Catch revision, then Door and Stone. Bridge is a promising combination but needs a particularly careful timing prototype. All four were subsequently approved for construction; the status above records implementation progress. Each eventual build needs its own checkpoint, ordinary-input demonstration, readable setup, nearby timing samples, actual wrong-plan attempts and death/retry verification. Finite searches can challenge obvious bypasses; they cannot establish that a room is enjoyable or that every alternative is impossible.


## Implementation discoveries in progress

A downward dash into a pushable stone shoves it and bounces the player. Its roof cannot directly supply the proposed wavedash. Door therefore uses the relocated stone to reach a guarded fixed launch lip; Stone uses the prepared roof for dash recovery before jumping/dashing to its fixed lip. The existing stone and movement physics remain unchanged.

Door's first roof supplied a substitute approach to the service ledge. A fresh-input search reproduced that shortcut; the guarded roof and a separate return shaft remove that witnessed plan while shortening the return. Stone's fixed stop similarly supplied an unintended wall jump when its faces were exposed. The final stop has guarded sides; the primary reference still clears. Search failures describe their finite budgets, rather than universal impossibility.


## Current implementation and differences from the proposals

The descriptions above record the approved concepts. Existing stone physics require a change to their literal launch surfaces: a downward dash shoves a pushable stone and bounces, so it cannot directly supply a wavedash. All three stone rooms therefore use a fixed launch lip after the stone preparation.

- **Catch:** the hook travels diagonally over a deep entrance and beneath a thorn screen. The returning ride reaches a refill and the high stone. Wait for the hook to clear below before lowering the stone; catch and immediately release right onto the fixed lip, then wavedash left through the cleared throat and dash up to the home flag. The lowered stone clears the route rather than becoming the wavedash surface. The flag has a physical stair/gallery route to the next checkpoint.
- **Door:** the closed gate stops the first shove beneath the service ledge. A lantern holds the gate open for the second shove, which relocates the stone beneath the fixed launch lip. The return uses a short shaft. A guarded starting roof removes the witnessed shortcut to the service ledge.
- **Stone:** the wrong dock is below the starting dock, rather than a second horizontal stop. A partial support leaves an underslot for an upward dash to restore the stone; the correct rightward shove supplies the recovery landing beyond the throat. The fixed stop has guarded sides to prevent replacing that landing with a wall jump.
- **Bridge:** activation comes before the far rest in the demonstrated route; an outward bridge crossing is not required. A crumble cap blocks boarding the returning roof. Breaking it exposes that landing, and the carriage lowers slightly on its return to create clearance for the wavedash. The carriage has a 120-frame return and the cap retains the existing crumble timing.

`tests/fractured_nine.gd` checks the four references, their preparation counterfactuals and nearby setup waits. `tests/fractured_nine_app.gd` checks native/source parity, preservation of accepted rooms and recordings, live clears, complete Watch exits and independent resets. Finite search results remain diagnostic evidence, not proof that all alternate routes are impossible. Human playtesting still decides whether these three additions belong in the liked lineup.


## Release verification · 0.33.0

The signed macOS app passed twenty suites: `fractured_nine`, `fractured_nine_app`, `feel_journey`, `fractured_next`, `fractured`, `section_menu`, `campaign_workshop`, `application`, `world_checks`, `world2_journey`, `world3_journey`, `black_woods`, `causeway`, `fractured_next_app`, `fractured_puzzles_app`, `fractured_journey`, `workshop`, `six_puzzles_app`, `five_puzzles_app` and `editor_play`. The new physics suite also replays the recoverable wrong dock and the two witnessed pre-guard shortcuts. Source and exported-resource tests use the same gameplay definitions. Exported scenes are binary-remapped, so the preservation SHA check reads the external source World 1 scene; native parity checks still inspect the packaged scene itself.

The application journey observes 27 ownership changes, a maximum camera step of 14.06 pixels and zero deaths. Chapters 22 and 23 retain their existing deathless continuous recordings. Rendered captures cover each room's start, preparation, launch, finish, hint and menu. The user's existing World 1 scene remains byte-identical to its pre-change SHA `31dbed0936d4552718299175b24394ba5d0b1dc8fd073f3765949828cd056d47`.

To replay the new checks from source, run Godot 4.5.1 with `--headless --path prototypes/godot-ascend --script tests/fractured_nine.gd`, then `tests/fractured_nine_app.gd` and `tests/feel_journey.gd` in the same way. Build the signed app with `bash prototypes/godot-ascend/tools/build-macos.sh`. No online deployment was performed.
