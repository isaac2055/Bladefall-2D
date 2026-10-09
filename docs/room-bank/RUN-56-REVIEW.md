# Run 5 and Run 6 feedback — 7.298.0

The requested review changes are complete locally. No new rooms were added. The two original Celeste reports remain unchanged; the new [synthesis report](../design/SURVIVE-ROOM-SYNTHESIS.md) examines the gap between the implemented systems and the movement/pattern learning the recent rooms actually required.

Open **Extras → Room Bank → Run 5 / Run 6** for the revisions. Approved rooms move to **Banked**, keeping their stable IDs. The four earlier **Superrooms** remain unchanged and awaiting the deferred refinements.

## Your decisions

| Room | Disposition | Result |
| --- | --- | --- |
| B46 — Let the Train Go Low | Revised; review pending | Low cart routing clears the receiver; the flight now includes an aerial mirror cut. The old high-cart exit and waiting at spawn no longer solve it. |
| B47 | Cut | Removed from the playable pool; original archived. |
| B48 — The Train Comes Back Empty | Banked Base after fixes | Start door sealed. Independent corner lasers cover the missed-freeze recovery path; intercepting the cart before that corner now matters. |
| B49 — The Rooms Trade Their Floors | Revised; review pending | Start door sealed. Timed patrols make the outward/return bridge and departure from the far relay active crossings. |
| F47 — Spend the Return | Revised; review pending | Reworked pod approach and return geometry; the old pillar-to-exit shortcut is closed. |
| F48 — Bring the Ram Down | Retained for review | Your positive, easy/fun feedback is recorded. Geometry, route and Fractured classification are unchanged; no banking or side transfer was explicitly requested. |
| F49 — Open It on the Way Out | Banked Fractured | Geometry and route unchanged. |
| F50 — Walk the Answer Twice | Banked early Fractured | Geometry and route unchanged. Chosen from your allowed placement options; its late wallbounce fits early Fractured. |
| B50 — Close the Receiving Mouth | Revised; review pending | Automatic portal-disable grill removed. A small marked ceiling surface allows deliberate relinking, restoring the cargo stop. |
| B51 — Make the Watch Look Away | Banked middle Fractured | Side changed, stable B51 ID retained. Geometry and route unchanged. Historical room links resolve to its new side. |
| B52 — Send the Bolt Upwind | Revised; review pending | Active hook ride with alternating reel-in/pay-out clearance. Cool smoke, a visible cover cue and clearer amber watch sight explain the protective relationship through play. |
| B53 — What the Tide Leaves Behind | Revised; review pending | The widened tide crossing gives the raised float a necessary takeoff role. The lower-right approach now leads to the far anvil and a pogo ascent to the tally. A tide gauge makes the return wait visible. |
| F51 — Wait for the Arrow | Revised; review pending | An inlet dash and disappearing departure surface prevent the free ground refill; the directional crystal supplies the continuation. |
| F52 — Put It on the Other Floor | Revised; review pending | The floor-edge jump/dash skip is closed while retaining the seed/inversion idea. |
| F53 | Cut | Removed from the playable pool; original archived. |
| F54 | Cut | Removed from the playable pool; original archived. |

No numeric human ratings were inferred. Banked candidates are reserve content, not automatically inserted into the campaign.

## Review links

- [Run 5 Base: B46 / B49](http://localhost:8371/precision.html?pitch=bank&mode=review&side=base&group=run5)
- [Run 5 Fractured: F47 / F48](http://localhost:8371/precision.html?pitch=bank&mode=review&side=fractured&group=run5)
- [Run 6 Base: B50 / B52 / B53](http://localhost:8371/precision.html?pitch=bank&mode=review&side=base&group=run6)
- [Run 6 Fractured: F51 / F52](http://localhost:8371/precision.html?pitch=bank&mode=review&side=fractured&group=run6)
- [Banked Base](http://localhost:8371/precision.html?pitch=bank&mode=review&side=base&group=banked) · [Banked Fractured](http://localhost:8371/precision.html?pitch=bank&mode=review&side=fractured&group=banked)

These links use the local development server on port 8371. Each room keeps the existing Fun /10, Difficulty /5, Suitability /5 and optional comment form, plus the intended-route preview. Exported reviews include the room revision so earlier feedback remains attributable.

## Scope and evidence

The active pool is now **83 rooms: 47 Base / 36 Fractured**, including **50 banked: 27 Base / 23 Fractured**. Nine rooms were revised, of which B48 fulfills a conditional approval; eight revisions await your review. Three rooms were cut. Seventy records outside this feedback are preserved byte-for-byte.

The existing reports, unrelated engine files and world lock are preserved. B52 alone opts into the watch/smoke drawing improvement; its detector and physics are unchanged. B53 alone adds a sight glass displaying the actual tide while its float is below the camera. Original room records are archived in `scripts/room-bank/archive/before-run56-feedback/`. Cuts are listed in [run56-cuts.json](run56-cuts.json).

All 83 saved routes finish without deaths; 363 positive variations and 207 specific shortcut probes pass. The preservation audit checks 12 actual original-success/revision-failure routes. Browser checks cover the nine revised rooms, B51/F49/F50 approvals, menu membership, review export and play timing. Validation results are recorded in [route-report.json](route-report.json) and [the final handoff](../../LLM-HANDOFF/ROOM-BANK-REVIEW-7.298.md). The regression audit replays the actual reported shortcuts successfully on the archived originals, then verifies that they fail on the revisions. This is stronger evidence than simply deleting an action from the intended tape; it is still not proof that every possible alternative is closed. Positive timing variations, browser playback and visual inspection establish working routes and readable presentation, while fun and final difficulty remain human judgments.

The historical [Run 5 guide](RUN-5.md) and [Run 6 guide](RUN-6.md) describe the original releases. Use this guide for current membership and decisions. No further run is underway.
