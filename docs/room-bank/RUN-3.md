# Run 3 — new entities

> Historical delivery record. The 7.293 review decisions, classifications and current replacement solutions are in [Run 1/2/3 review revisions](RUN-2-3-REVIEW.md). Some rooms described below have since changed or moved into Banked.

**Ready for review: eight new rooms, four Base and four Fractured.** Updated 8 October 2026, version 7.292.0. Run 2 remains available beside this set, with all eight room records unchanged. Each new room is saved individually with its completion route and timing variations. No new banking decisions or human ratings are inferred.

| Review set | Base | Fractured |
| --- | --- | --- |
| Run 3 — new entities | [Review Base](http://localhost:8371/precision.html?pitch=bank&mode=review&side=base&group=run3) | [Review Fractured](http://localhost:8371/precision.html?pitch=bank&mode=review&side=fractured&group=run3) |
| Run 2 — movement choices | [Review Base](http://localhost:8371/precision.html?pitch=bank&mode=review&side=base&group=run2) | [Review Fractured](http://localhost:8371/precision.html?pitch=bank&mode=review&side=fractured&group=run2) |

Open **Extras → Room Bank → Run 3** or **Run 2**. Review asks for **Fun /10, Difficulty /5, Suitability /5** and an optional comment. **Rate room** accepts unfinished attempts. After an attempt, the pause menu offers **Watch the intended route**. Play mode omits the survey and keeps the set timer. Reviews remain local and export to CSV; difficulty estimates below are not measured player scores.

## Three additions from the existing entity report

The existing [Survive entity report](../design/SURVIVE-ENTITY-REPORT.md) supplied these families. It and the [tech report](../design/SURVIVE-TECH-REPORT.md) are unchanged. The selection connects a new object to existing carrying, blade direction, lift inheritance, rope control, beams and dash choices.

| Entity | Control and rule | Applications |
| --- | --- | --- |
| Recoil plate | Stand on it and hold Down to load its spring; release Down to let it rise. A loose lantern or grounded living enemy can also load it. Depart during the rise to inherit its lift. Partial compression produces less lift. | B35 removes and restores a cargo weight; F35 combines a chosen amount of lift with an ordinary hyper. |
| Movable impulse seed | The first blade strike shifts the seed in the cut direction and charges it gold. A fresh strike while gold launches the knight **away from the seed’s centre**. Your contact position sets the angle. | B36 relocates the origin beyond a roof; F36 prepares it from below and returns around a wall to intercept it from the other side. |
| Moving hook anchor | Hold Grab to catch the ring under a visible carriage. Up reels in, Down pays out, left/right pumps the swing; Jump releases. Carriage motion contributes once to the release velocity. | B37 changes clearance; B38 borrows vertical motion; F37 transfers between carriages; F38 uses the carriage as beam cover. |

These are shared engine entities, placed only in the new rooms. Run 3 uses ordinary existing movement and does not enable Run 2’s `survive-2` profile. Fractured can still use existing advanced moves, notably F35’s hyper. The seed grants no dash or stamina refill, and the recoil plate does not apply a forced spring launch. Visible geometry and ordinary interactions determine success; exits do not secretly require a named mechanic.

## New review set

| ID | Room | Side | Estimated difficulty | Central problem | Positive variations |
| --- | --- | --- | ---: | --- | ---: |
| B35 | [Put the Weight Back](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-b35) | Base | 4/5 | Remove the launch weight, carry it upward, then return it to restore beam shade. | 9 |
| B36 | [Plant the Exit](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-b36) | Base | 3/5 | Move a launch origin out of its roof, then approach from the useful angle. | 11 |
| B37 | [Pay Out After the Wall](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-b37) | Base | 4/5 | Short rope over a wall, long rope for a low objective on the same trip. | 10 |
| B38 | [Borrow the Rise](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-b38) | Base | 4/5 | Descend for a tally, then borrow the returning carrier’s upward speed. | 10 |
| F35 | [Borrow Only Enough](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-f35) | Fractured | 4/5 | Choose enough recoil for a raised shelf without hitting the low thorn roof. | 10 |
| F36 | [Meet It on the Way Back](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-f36) | Fractured | 5/5 | Send the seed up a short route, take the long route around, then intercept it. | 12 |
| F37 | [Catch the Other Train](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-f37) | Fractured | 5/5 | Transfer between two moving rings travelling in opposite directions. | 10 |
| F38 | [Borrow the Shadow](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-f38) | Fractured | 5/5 | Keep a travelling rope and its passenger inside the carrier’s moving shade. | 10 |

B36 and F36 each have eight consecutive successful timings for their final cut or dash with the corresponding saved setup. B36 also allows a 95-frame preparation pause; F36 allows an extra 40 frames. Moving-hook rooms include variations in an earlier rope decision and the final departure. F35 accepts useful alternate charge/departure/jump-hold combinations instead of demanding one exact charge. These examples establish playable timing ranges for the saved approaches, not a human success rate or a guarantee that every combination works.

There are **82 additional successful full-room tapes** for this set and **20 negative probes** addressing specific wrong approaches, mistimings or shortcuts. Each starts from the normal spawn. The room records retain the actual inputs and results.

<details>
<summary>Solutions and comparisons — spoilers</summary>

### B35 — Put the Weight Back

Let the lantern load the plate. Pick it up, let the plate rise, and jump late with its lift while carrying the lantern to the high tally gallery. Collect the tally, then carry the lantern back over the plate and drop it. Return to the plate as it reloads into the beam; its weight makes the lower eastern crossing safe.

Comparison: B12 Umbrella Exchange substitutes one source of shade for another; B35 instead removes and restores the same weight. The moving shield is also the only ordinary carrying launch to the high gallery.

[Source and saved tape](../../scripts/room-bank/base/bank-b35.json). Clean completion: 349 simulation frames.

### B36 — Plant the Exit

With no dash, side-cut the seed out from under the low roof. Follow into the open, then jump past its centre and cut down from above and slightly east. The prepared origin gives a rising rightward launch onto the thorn-fronted balcony. Staying on the original west side sends the burst back toward the low tunnel.

Comparison: Ordinary b pods reward an immediate downward cut from their fixed location. This seed first changes its launch origin and charges; the useful launch must be prepared outside the enclosing roof.

[Source and saved tape](../../scripts/room-bank/base/bank-b36.json). Clean completion: 154 simulation frames.

### B37 — Pay Out After the Wall

Board the moving ring and shorten the chain above the central wall. Once the wall is behind, pay out to the low tally, then reel back up and release toward the high exit.

Comparison: F23 Shorten the Arc moves the knight around fixed rings. This makes the carrier advance the rope origin while the player changes its length across a high obstacle and a low objective.

[Source and saved tape](../../scripts/room-bank/base/bank-b37.json). Clean completion: 235 simulation frames.

### B38 — Borrow the Rise

Take the travelling ring down to the low tally. Reel in on its upward return, then pump right and jump-release while the carriage is still climbing. Use the rising origin to return the low objective to the high departure window.

Comparison: Moving deck lifts offer ordinary standing jumps, and B37 changes clearance along a horizontal track. This target lies beneath the carrier, so the return launch must be built while hanging below a rising origin.

[Source and saved tape](../../scripts/room-bank/base/bank-b38.json). Clean completion: 379 simulation frames.

### F35 — Borrow Only Enough

Store a partial load, release the plate and take a hyper while its upward lift is still available. The borrowed height reaches the raised eastern shelf, while the low dash-jump stays beneath the roof. More charge and later departure are not automatically better; a full late recoil drives the same held trajectory into the roof.

Comparison: F32 Brake Below the Teeth uses reverse-hyper height and later braking; F35 instead authors the vertical lift before departure. The long crossing needs more rise than a normal hyper, but less than a full late recoil can provide.

[Source and saved tape](../../scripts/room-bank/fractured/35-bank-f35.json). Clean completion: 136 simulation frames.

### F36 — Meet It on the Way Back

Drop into the well and upward-cut the seed so it rises into the upper travel channel. Climb back up the west face, wall-jump over the relocated seed, then brake and fall on its east side. Face the seed and cut left for a flat rightward launch. Let that arc cross the first part of the gulf, then use the saved diagonal dash to lift the inherited speed onto the far shelf.

Comparison: B36 Plant the Exit prepares a vertical launch just outside a roof; Return Freight and Reply in Passing move a body and intercept its useful state. Here the object takes a short vertical route while the knight returns around the wall, then uses a deliberately flatter outgoing angle.

[Source and saved tape](../../scripts/room-bank/fractured/36-bank-f36.json). Clean completion: 259 simulation frames.

### F37 — Catch the Other Train

Catch and shorten beneath the lower outgoing carriage. As the upper carriage approaches from the other side, jump-release while holding Grab to intercept its ring. Reel in on the higher rail and release onto the east gallery.

Comparison: F23 transfers between fixed rings while controlling their lengths. Here both attachment points approach and then separate, and the useful transfer moves between rails travelling in opposite directions.

[Source and saved tape](../../scripts/room-bank/base/37-bank-f37.json). Clean completion: 257 simulation frames.

### F38 — Borrow the Shadow

Catch the leftbound shield from below and keep the rope short while it crosses the beam. Beyond the light, extend the chain for the low western tally. Reel in for the returning crossing, remain below the shield, then release right onto the higher eastern shelf.

Comparison: B12 Umbrella Exchange trades stationary sources of shade, while Return Freight carries a prepared object through a route. Here the support point and the only beam cover are the same moving body, and the knight has to keep its pendulum inside that travelling shadow in both directions.

[Source and saved tape](../../scripts/room-bank/base/38-bank-f38.json). Clean completion: 429 simulation frames.

</details>

## Integration and evidence

The complete pool is **55 playable rooms**: 29 Base and 26 Fractured. Run 3 and Run 2 each contain 4+4; Run 1 revisions contain 1+1; earlier review contains 9+6; banked contains 11+11. All prior approvals remain banked, including B27 as easy Base material. B26 and F30 remain revised for review. The overall side imbalance predates this run; both new sets are balanced.

Completed checks:

- Exact catalog membership and entity coverage: one recoil room, one seed room and two moving-hook rooms on each side.
- All 55 canonical routes finish without deaths; all **243 positive variations** succeed and all **100 recorded negative probes** fail to exit.
- Focused entity contracts cover loading, partial/full lift, cargo/enemy weight, seed priming and burst direction, reset, attachment cleanup, moving-anchor release velocity, collision and blocked-carrier pause/resume. The existing 21 Run 2 movement contracts also pass.
- Combined browser checks render and complete all 16 Run 2/Run 3 rooms, assert their intended-route events, exercise all five groups, save separate real Run 3 Base and Run 2 Fractured completion surveys, export CSV, and check play timer/pause behavior. All eight new layouts received a visual pass.
- All 47 earlier room source records, both design reports and the world lock match the pre-run [preservation baseline](run-3-baseline.json). Old fixed-hook behavior is also covered by the existing F23 completion route and focused hook checks.
- Local bundle rebuilt with 416 game files. Version 7.292.0, cache v457-room-bank-run3. Nothing published.

These checks establish completion routes and specific interaction contracts. They do not settle fun, measured difficulty, suitability or every possible alternate solution. Those remain the purpose of the combined review.

Implementation boundaries: recoil plates and seeds have mirrored-state/reset checks. Moving carriers in this run use ordinary gravity and continuous rails; inversion and portal transport for the carriers have not been authored or established as supported. A blocked carrier pauses its rail clock, and an obstructed rope detaches. Seeds are not solids, cargo, beam shields or portal passengers. These limits should guide later integrations rather than silently assuming every entity combination is supported.

Generated [manifest](manifest.json) and [route report](route-report.json) hold the current results. [Run 2 guide](RUN-2.md) retains its solutions and movement rules. Permanent checks:

```sh
node scripts/test-recoil.mjs
node scripts/test-impulse.mjs
node scripts/test-moving-hooks.mjs
node scripts/test-survive2-movement.mjs
node scripts/room-bank/build.mjs --check-batch
node scripts/room-bank/check.mjs --write
node scripts/room-bank/browser-check.mjs bank-b35 bank-b36 bank-b37 bank-b38 bank-f35 bank-f36 bank-f37 bank-f38 bank-b31 bank-b32 bank-b33 bank-b34 bank-f31 bank-f32 bank-f33 bank-f34
```

The browser check uses the local server at port 8371. Stop here for the user’s combined review of Runs 2 and 3. Run 4 has not started.
