# Final room-bank review — 7.302

The latest review approves 39 more rooms. The active pool is **98 rooms: 89 banked (51 Base / 38 Fractured) and nine revisions (4 Base / 5 Fractured)**. F62 is archived and removed from play. Existing campaign placement and room checkpoints are unchanged.

The Final review tab gathers every remaining revision. Stable IDs survive movement between Base and Fractured; historical room links resolve to their current side. Qualitative placement notes are recorded separately from numerical ratings, which remain unmeasured.

## Banking decisions

- **Late Fractured:** B54, B55, F58, F61. **Fractured, exact position open:** F55, F56. **Very late Fractured:** F57.
- **Late Base, with early Fractured as an alternative:** B56, B57, B61. **Early Fractured, with late Base as an alternative:** F60.
- **Base:** B37, F35, B41, B42, B44 (superroom). **Late Base:** B45 (superroom), F48.
- **Middle Base:** B16, B17, B18, B20, B25, F21, F47, B50, B53. **Middle–late Base:** B49 (superroom).
- **Early Base:** B21, B22, B23, F22; B23 and F22 are a step above B21.
- **Early Fractured:** B46. **Early–middle Fractured:** B52, F51, F52, F17, F23. **Late Fractured superroom:** F46.

B54/B55/B46/B52 move from Base to Fractured. F21/F22/F47/F48 move from Fractured to Base. The previous 50 approvals remain approved. All 89 approved room definitions and saved routes match their pre-review originals.

## Nine revised rooms

[Review four Base rooms](https://bladefall2d.pages.dev/precision?pitch=bank&mode=review&side=base&group=pending) · [Review five Fractured rooms](https://bladefall2d.pages.dev/precision?pitch=bank&mode=review&side=fractured&group=pending)

Local equivalents use `http://localhost:8371/precision.html` with the same query. Room Bank opens on **Final review**, with **Banked** beside it. Approved superrooms remain identified as superrooms inside Banked.

| Room | Revision |
| --- | --- |
| B24 — Carry the Quiet Moment | Send the lantern through a cargo slot to hold the door, then take a separate lower dash–pogo–dash route behind the patrol. |
| B58 — Leave Yourself a Landing | The outbound route spends only touched patches. Return through untouched gaps while avoiding fixed thorns, a vertical patrol and a looping far patrol. |
| B59 — Down One Side, Up the Other | Descend and climb opposite sides of a solid pier. Leave and recatch fresh wall patches around fixed knots, then time the upper patrol. The continuous outer-wall route is blocked. |
| B60 — Let the Reply Through | Airborne parry, then use the refilled dash to remove the phase wall so the reply passes through. Its arrival restores that same wall for the catch. The original ground-parry shortcut was reproduced on the old room and fails on this revision. |
| F24 — Both Ends Clear | Time both portal approaches, continue directly into a low pogo and dash without a receiving rest. Clearing only one end is insufficient on the saved timing probes. |
| F25 — Freight Has Right of Way | Use the outward deck to reach the tally, then meet its return underneath the same island. The used top becomes unsafe; the lower return leads into the launch loft. |
| F32 — Take the Shade With You | Exactly three extra seed lanterns: two left of the original pair and one to their right. Five in total; existing route retained. |
| F45 — The Upper Address | The final pressure dock extends 16 pixels toward the carriage. The preview now swaps while the plate is lit, then jumps, with a three-frame gap; one- and five-frame gaps also pass. |
| F59 — Reverse the Departure | Raised the launch corridor and its matching ceiling eight pixels to increase clearance above the bottom spikes. The existing route still works; additional delayed-launch variations pass. |

The nine revisions remain unapproved until human review. The baseline B59 human shortcut was not reproduced exactly; its direct outside-climb and other saved probes fail on the new layout. This is not a claim that every possible shortcut has been eliminated.

## Validation

All **98 canonical routes** complete without deaths; **417 positive variations** and **268 targeted shortcut probes** pass. The nine revisions contribute 31 positive variations and 40 shortcut probes. Stationary patrol and segmented-thorn checks pass. The nine-room browser pass also completes every revised route, verifies menus/counts and historical links, exercises review/revision/CSV and play timer/pause, and checks actual scrolling. [Route report](route-report.json) and [preservation result](final-review-7.302-preservation.json) are saved. These checks establish working routes and specific protections, not measured fun, difficulty or suitability.

## Hazard direction

Dust-bunny routes and endpoint markers are hidden in all rooms. Players learn motion by observing the hazards. Existing accepted patrol paths are preserved. Single-point paths now support stationary thorns, while multi-point and closed paths support nonlinear moving hazards. The rebuilt spent-face rooms opt into independently contacted patches; existing whole-face rooms retain their behavior.

## Scope and preservation

No new room IDs are created. No room is inserted into the campaign. The pre-review sources are saved in `scripts/room-bank/archive/before-final-review-7.302/`; the preservation baseline is [final-review-7.302-baseline.json](final-review-7.302-baseline.json). F62 remains recoverable under `archive/rejected-final-review/`. Publication uses the authorized GitHub main push workflow and Cloudflare Pages. The Pages output is corrected to `public/`; the separate feedback/leaderboard API still requires backend connection. See [release notes](../playtest/RELEASE-7.302.md).
