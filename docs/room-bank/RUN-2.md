# Run 2 — movement choices

> Historical delivery record. The 7.293 review decisions, classifications and current replacement solutions are in [Run 1/2/3 review revisions](RUN-2-3-REVIEW.md). Some rooms described below have since changed or moved into Banked.

**Ready for review: eight new rooms, four Base and four Fractured.** Updated 8 October 2026, version 7.291.0. Each room is saved separately with a completion tape and successful timing variations. The two Run 1 revisions are in their own selection. Run 3 is now ready beside it for the combined review; see the [Run 3 guide](RUN-3.md). All eight Run 2 room records and movement rules are unchanged. Everything is local.

[Review Base Run 2](http://localhost:8371/precision.html?pitch=bank&mode=review&side=base&group=run2) · [Review Fractured Run 2](http://localhost:8371/precision.html?pitch=bank&mode=review&side=fractured&group=run2)

Open **Extras → Room Bank → Run 2**. Room hints explain the controls before the first action. Review asks for **Fun /10, Difficulty /5, Suitability /5** and an optional comment. Rate room also accepts unfinished attempts; the pause menu offers the intended route after an attempt. Play mode keeps the set timer and omits the survey. Numeric human ratings remain unmeasured; all difficulty numbers below are author estimates.

## Run 1 decisions applied

| Decision | Rooms |
| --- | --- |
| Banked — Base | B27 The Shelter Wakes (early/easy material), B29 The Shield You Send, B30 Make Your Own Shade |
| Banked — Fractured | F26 Keep the Borrowed Speed, F27 Catch the Passenger, F28 Reply in Passing |
| Revised — review again | B26 One More Hit; F30 Bring Back the Arc |

All six approvals retain their original room definitions and tapes. F26 records the accepted dash-to-switch → wavedash → pogo alternative. There are now **22 banked rooms**, 11 per side; revisions have not been automatically approved.

**[B26 — One More Hit](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-b26):** first send the stone across as beam shade. Uppercut the guard from below its stand; it now lands on a higher catch ledge, allowing a deliberate jump and finishing pogo into the upper gallery. From there, send the stone down again. The restored beam reaches the protected tally and opens the lower return exit. Descend beyond the emitter using Down + Jump through the visible one-way ledge. This replaces the moving-target race and gives the launch a larger puzzle to serve.

The saved sweep has 119 clean full-room outcomes among 136 samples, with outer failures retained in the evidence. Successful samples include a 0–180-frame pause before the uppercut, 0–120-frame wait after the catch, 19 consecutive pogo timings, and 18 consecutive follow-up dash timings. These ranges hold with the corresponding recorded setup, not every arbitrary combination. Twelve representative full tapes are replayed by the shared checker. [Tolerance data](../../scripts/room-bank/b26-tolerance.json).

**[F30 — Bring Back the Arc](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-f30):** keep the original low tally, rope-generated launch, echo velocity transfer and zero-dash restriction. The receiving shelf extends seven tiles west and sits two tiles lower; the long thorned face becomes a short underside lip. Release from the rising swing, swap back to the waiting echo, and use the transferred motion to reach that shelf.

All **72** sampled release/swap combinations now finish cleanly, compared with **18** on the original. Seven reel-duration variations also finish. Twelve boundary/center/reel tapes remain in the shared checker. [Before/after timing evidence](../../scripts/room-bank/evidence/run-1-review/30-bank-f30-tolerance.json).

## Four additions from the existing tech report

The existing [Survive tech report](../design/SURVIVE-TECH-REPORT.md) supplies these four proposals. Its entity report supplies the now-completed [Run 3 new-entity set](RUN-3.md). The reports themselves were not regenerated.

| Movement addition | Control and rule | Rooms |
| --- | --- | --- |
| Controlled pogo height | On a valid downward blade contact, hold Jump for the existing lofted rebound; release it for a lower rebound. Incoming horizontal speed survives either choice. | B31, B32 |
| Cargo dash catch | Hold Grab into a loose lantern during a dash. Contact ends the dash and preserves its actual velocity, then normal carrying/gliding takes over. | B33, B34 |
| Reverse dash jump | During a grounded/coyote horizontal or down-diagonal dash, hold the opposite direction when pressing Jump. Neutral direction keeps the old launch direction. | F31, F32 |
| Late wallbounce | After a straight upward dash ends, Jump can still bounce from a valid wall for six simulation frames. A buffered press waits for wall contact. | F33, F34 |

These give four different decisions: choose rebound height, temporarily release and recover cargo, disagree with the dash's direction, or use residual upward motion. Each has two applications. The rooms use enough existing geometry and machinery to make the choice meaningful while keeping the new movement central. This is representative coverage, not a statistical difficulty distribution or the entire report implemented.

The shared Survive engine implements these rules behind **`movement: 'survive-2'`**, enabled in these eight rooms. Campaign placement and existing-room movement remain unchanged until the new rules receive review. A cargo catch gives no dash refill of its own; ordinary ground/refill rules still apply. Catch speed persists in the air until normal braking/landing interrupts it. Carrying still prevents starting a dash. Pogo misses grant nothing; successful targets keep their existing damage/refill rules. Late wallbounce adds neither invulnerability nor another phase flip, rejects thorned faces, and cannot carry through a teleport, strike, grab or new movement state. Pogo and cargo inputs each have a five-frame intent buffer. The lower pogo speed is 135 versus the existing loft speed of 210; the six-frame wall window is 0.1 seconds at 60 simulation steps per second.

Delayed ultras, side-cut recoil, throw backboosts and the other report proposals remain future selections. No new entity family was added in Run 2.

## New review set

| ID | Room | Side | Estimated difficulty | Movement problem | Saved positive variations |
| --- | --- | --- | ---: | --- | ---: |
| B31 | [The Same Target, Twice](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-b31) | Base | 4/5 | One target, two heights, with a beam changed between visits. | 10 |
| B32 | [Height Becomes Distance](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-b32) | Base | 4/5 | Loft into a portal; preserve its forward launch with a low second pogo. | 9 |
| B33 | [Take It Running](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-b33) | Base | 3/5 | Catch a lantern during a dash, then jump into a long carrying glide. | 28 |
| B34 | [The Catch That Lifts](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-b34) | Base | 3/5 | Throw to free the hands, dash up, and catch without losing the rise. | 36 |
| F31 | [Take It Back](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-f31) | Fractured | 4/5 | Two opposed reverse supers across alternating phase shores. | 16 |
| F32 | [Brake Below the Teeth](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-f32) | Fractured | 4/5 | Reverse hyper below a roof, then brake into a lower receiving slot. | 20 |
| F33 | [Below the Lip](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-f33) | Fractured | 4/5 | A late wallbounce converts the end of an upward dash into the return route. | 6 |
| F34 | [Give Back the Wall](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-f34) | Fractured | 4/5 | The dash creates the launch wall; an airborne blade strike restores the landing. | 12 |

B32 explicitly uses zero dash so the two rebound heights supply the route. B34 catches failed lifts in a safe well. F31's variations pair the second approach with the first launch rather than claiming every independent timing combination works. F32 checks several launch/braking pairs. F33 and F34 each complete across all six late-Jump timings; F34 also tolerates seven consecutive bell-strike timings. Positive counts represent saved full routes from the normal spawn, not a human success rate.

F33 also preserves a conventional jump-before-dash wallbounce as a legitimate alternative. F31/F32 do not prohibit equivalent advanced solutions that retain their trajectory problem. Required-event assertions verify the intended tapes only; room exits do not secretly demand a named move.

<details>
<summary>Solutions and comparisons</summary>

### B31 — The Same Target, Twice

Use a low contact on the central pod to cross beneath the live beam to the eastern mirror alcove. Cut the lower mirror from below to send the beam away from the central space. Return to the same pod and choose a lofted contact; its higher arc and returned dash reach the upper western gallery.

Comparison: B12 Umbrella Exchange changes the necessary source of shade; F23 Shorten the Arc chooses clearance through rope length. Here one persistent target supports two different return trajectories, and the mirror changes which rebound is safe.

[Source and saved tape](../../scripts/room-bank/base/bank-b31.json). Clean completion: 303 simulation frames.

### B32 — Height Becomes Distance

Drop from the west ledge onto a lofted blade rebound. The ceiling portal converts that climb into an eastward launch. Release Jump before the second downward contact to preserve the launch under the low thorn roof, then continue to the receiving shelf.

Comparison: B31 revisits one target after changing a beam. Here two rebound heights serve one continuous velocity transfer: the first earns a portal entry, and the second keeps its horizontal launch usable under a ceiling.

[Source and saved tape](../../scripts/room-bank/base/bank-b32.json). Clean completion: 151 simulation frames.

### B33 — Take It Running

Run at the lantern, start a horizontal dash while holding Grab, then jump once the catch has ended the dash. The catch retains approach speed; the lantern supplies the glide and shades the final sun-window. Walking pickup loses too much approach speed.

Comparison: Earlier lantern rooms ask for carrying, throwing or waiting under cover. This asks for the new dash-to-catch transfer itself: carry cannot start a dash, so the high-speed carrying launch must be assembled in the opposite order.

[Source and saved tape](../../scripts/room-bank/base/bank-b33.json). Clean completion: 156 simulation frames.

### B34 — The Catch That Lifts

Pick up the lantern and jump beside the step. Throw it into the step face, dash upward with free hands, then hold Grab during the rise to retrieve it. The catch preserves the upward dash speed and lifts the lantern onto the rim. Carry it past the overhead beam. An ordinary carrying jump or an unaccompanied upward dash cannot deliver the shade.

Comparison: No Place to Land trades a lantern for an extra feather jump. This uses the new dash catch to reconnect an object to an already-moving knight: the object is briefly released to permit the ascent, then its return does not cancel the upward velocity.

[Source and saved tape](../../scripts/room-bank/base/bank-b34.json). Clean completion: 179 simulation frames.

### F31 — Take It Back

Two opposed outgoing dashes collect the tallies outside the supports. Reverse each dash jump toward the next phase shelf. The second rising return reaches the upper eastern exit.

Comparison: p005 phase-floor departures and the Switchback phase rooms use the dash to change terrain; this makes the outward contact and the return jump disagree in direction twice.

[Source and saved tape](../../scripts/room-bank/fractured/31-bank-f31.json). Clean completion: 179 simulation frames.

### F32 — Brake Below the Teeth

Use the outward down-diagonal dash to take the tally and reverse its jump into a low, fast hyper. Begin countersteering while still above the long thorn bed; the remaining leftward momentum clears it. Drop into the receiving bay without reaching the hanging thorn face too high, then leave underneath to the western exit.

Comparison: Precision low hyper tunnels teach staying low, while F31 returns across alternating phase shores. Here the landing is below a hanging wall: speed is required for the long low crossing, then must be shed in flight to enter the vertical receiving slot.

[Source and saved tape](../../scripts/room-bank/fractured/32-bank-f32.json). Clean completion: 173 simulation frames.

### F33 — Below the Lip

Drop into the tally pocket, move to the hanging wall and dash straight up. As the burst finishes, keep rising and press Jump at the polished face. Its wallbounce reaches the upper west shelf.

Comparison: The ordinary slick-wall wallbounce rooms in World 27 contact the wall during the dash. Here the lower approach deliberately finishes its burst just below the wall, leaving the short residual rise useful.

[Source and saved tape](../../scripts/room-bank/fractured/33-bank-f33.json). Clean completion: 195 simulation frames.

### F34 — Give Back the Wall

Updash beside the ghost wall: the dash makes it solid but removes the upper landing. Let the short residual rise reach its bottom edge, then wallbounce right. Strike the overhead bell after leaving the wall, restoring the upper landing beneath your arc.

Comparison: Switchback rooms trade phase footholds and earlier slick-wall rooms teach ordinary wallbounce. The receiving floor here disappears on the exact dash that creates the launch face; an airborne bell changes the same machinery back only after the launch is secured.

[Source and saved tape](../../scripts/room-bank/fractured/34-bank-f34.json). Clean completion: 160 simulation frames.

</details>

## Run 2 delivery evidence — 7.291.0

The following counts record the Run 2 delivery. For the current 55-room pool and combined browser check, see [Run 3](RUN-3.md). At Run 2 delivery, the complete pool was **47 playable rooms**: 25 Base and 22 Fractured. Groups are Run 2 (4+4), Run 1 revisions (1+1), earlier review (9+6), and banked (11+11). Stable IDs, review hashes, previous review records and archived originals remain available.

Completed checks:

- Exact catalog membership and both rooms per movement family, with four new rooms on each side.
- All 47 saved routes finish with zero deaths; 161 additional positive tapes succeed and 80 recorded shortcut/mistiming probes fail to exit. Base routes use no super, hyper, ultra or wallbounce.
- 21 permanent movement contracts cover inputs, velocity/resource retention, reset, thorn/slick surfaces and cancellation. A separate before/after comparison also matched unprofiled frame digests and event traces against the saved pre-edit core.
- Browser checks exercise Extras, all four groups, a real completion survey, stable revision IDs, CSV export, the play timer and pause behavior. All ten new/revised rooms render and complete in the browser; their layouts received a visual pass.
- Local static bundle rebuilt with 410 game files. Version 7.291.0, cache v456-room-bank-run2. Nothing published.

The [route report](route-report.json) records the current results. [Source manifest](manifest.json) includes per-room solutions, inputs, provenance and estimates. Reproduce the permanent checks with:

```sh
node scripts/test-survive2-movement.mjs
node scripts/room-bank/build.mjs --check-batch
node scripts/room-bank/check.mjs --write
node scripts/room-bank/browser-check.mjs bank-b26 bank-f30 bank-b31 bank-b32 bank-b33 bank-b34 bank-f31 bank-f32 bank-f33 bank-f34
```

The browser command uses the local server at port 8371. The independent timing samples demonstrate wider usable inputs; they do not prove every alternate route is blocked or replace your judgment of fun, difficulty and suitability. Runs 2 and 3 are now ready for review together. Run 4 has not started.
