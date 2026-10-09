# Room bank — Superrooms, 7.295.0 (2026-10-09)

## Completed request

Seven approvals saved: F31 Fractured; B40 moved to late Fractured; B43 hard Base; F41 moved to Base; F42/F43 Fractured; F44 moved to Base. Their room definitions and tapes are unchanged. IDs are stable. The bank now has 46 approved rooms: 26 Base and 20 Fractured. F35's previous approval is revoked pending its new revision. F41's explicitly approved reverse-super Base route has a narrow catalog exception; other Base movement restrictions remain.

Four revisions are saved for review: F32 whole starting roof/spike row raised 8px and two lanterns replace the old single one; F35 higher bridge/low teeth require controlled recoil height while its lantern opens the lower gate; B41 now exchanges mutually exclusive boarding and exit floors; B42 is reinvented around keeping a guard alive to lower a cargo passage before removing its weight to create the return lift. F35 allows a deliberately shortened higher-charge jump as a valid alternate; do not claim only one charge value works.

Four superrooms, individually saved and route-proven, remain candidates: B44 The Light Takes the Long Way — 96×36 (1338f); B45 Bring the Sun Upstairs — 64×48 (1202f); F45 The Upper Address — 64×48 (606f); F46 The Line Must Stay Open — 96×30 (592f). All are single continuous scrolling maps larger than three standard 40×23 rooms. B44 reuses one lantern through two lifts, shade, a cargo vent, gate and upper return. B45 reuses its transformed bridge and moving carrier on outbound/return paths before recovering and echo-delivering its original lantern. F45 connects three floors via cargo/echo/momentum. F46 catches the same train three times across an echo station, recoil/mirror signal and shaded wallbounce.

B45's final source includes a three-tile one-way recovery ledge beside the hinge hub. All authors have frozen their sources. The final B45 browser check compares its current geometry hash to the generated record and pauses simulation between screenshots; unpaused capture gaps otherwise insert unintended idle frames into the tape.

## Runtime and integration

Room Bank defaults to Superrooms, with two rooms per side and the earlier queues retained. Source catalog batch 10 / active Run 4. Totals 70: 41 Base / 29 Fractured. Groups: Superrooms 2+2; Run 4 revisions 2+0; Run 3 revisions 2+0 (B37/F35); Run 2 revision 0+1 (F32); Earlier review 9+6; Banked 26+20. All old transfer links follow current side/group, including B40 moving to Fractured.

Device fixes replace old 40×23 limits with actual room dimensions for beam/mirror trace, fixed-hook parsing, moving-hook bounds, conveyor collision/drawing, portal placement/indices, Combat actors/shots and Foes/bolts. Larger rooms snap the camera on echo/knight-portal transfers and respawns, retaining eased ordinary travel. No movement constants changed this cycle. Gravity inversion remains unsupported for these larger authored rooms and is not used.

Version 7.295.0 / cache v460-room-bank-superrooms. Local netlify-deploy bundle rebuilt with 416 game files. Nothing published or committed.

## Evidence and continuation

All 70 saved canonical routes pass with 0 deaths, along with 324 saved positive variations and 166 specific shortcut probes. Final B45 ledge received an additional focused route/variation/probe check after its change. Large-room device fixture, 21 movement contracts and 49 reverse-grace contracts pass. Browser checks cover all 4 revisions and 4 superrooms, real camera travel, immediate transfer visibility, review forms, CSV/revision IDs, timer/pause and historical URLs. Screenshots are under scripts/climb/.cache/room-bank/. This is feasibility/regression evidence, not measured fun or proof of every possible shortcut.

All 66 prior sources were archived byte-for-byte before edits in scripts/room-bank/archive/run4-before-superrooms/. Fifty-five untouched records and all 7 approved room definitions/tapes are preserved. The 314 unrelated public files, both already-completed design reports and unrelated world lock match docs/room-bank/superrooms-baseline.json. Current audit: scripts/room-bank/superrooms-preservation-check.mjs. Older run4/run23 audits describe historical releases.

Current guide: docs/room-bank/SUPERROOMS.md. Index: docs/room-bank/README.md. Run 5 plan: docs/room-bank/RUN-5-PLAN.md. Original sequence: RUN-PLAN.md. Run 5 is NOT BUILT. The plan recommends 5A four compact synthesis rooms 2+2, review, then 5B four superrooms 2+2 chosen from the strongest ideas. Stop for user review; do not start Run 5 automatically or regenerate the earlier tech/entity reports.
