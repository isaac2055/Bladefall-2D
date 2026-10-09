# 7.299.0: Run 7 — sixteen candidates for review (2026-10-09)

**Run 7 is complete locally and ready for human review.** Routes, focused device checks, all-room browser checks, the final six-room refresh and the local bundle are complete. No room is newly banked and nothing is published.

The user authorized more meaningful rooms after the Run 5/6 feedback and synthesis. Run 7 delivers **16 new candidates: eight Base B54–B61 and eight Fractured F55–F62**, saved individually throughout authoring. The set follows four learning families: timing and controlled pogo; moving anchors and airborne cargo catches; departure-armed faces and resource-carrying climbs; airborne parries and cycling recoil routes. Smaller encounters prepare later combinations. There is no new-mechanic quota and no campaign placement.

The latest user clarification is authoritative: endings may be the hardest part. Do not automatically soften them or require a broad landing after every phrase. Execution should be readable, learnable and human-achievable. Earlier feedback asking to ease particular rooms is not a blanket instruction for every new finale. The synthesis report's contrary general guidance was corrected without rewriting the already completed original tech/entity reports.

## Current pool and review

- Active: **99 — 55 Base / 44 Fractured**.
- Banked: **50 — 27 Base / 23 Fractured**; approval decisions unchanged.
- Awaiting review: **49 — 28 Base / 21 Fractured**, comprising 18 revisions and 31 candidates.
- All 16 Run 7 rooms are candidates; none has a human numeric rating or approval inferred from the author routes.
- All 83 prior source records are byte-for-byte preserved. The four old Superrooms remain in their separate review queue; their deferred edits were not performed here.

Open **Extras → Room Bank → Run 7**. Guide: [docs/room-bank/RUN-7.md](../docs/room-bank/RUN-7.md). Current index: [docs/room-bank/README.md](../docs/room-bank/README.md). The source README is updated from its stale Run 4 state. The Run 5/6 feedback guide remains the current account of those cuts, approvals, transfers and revisions.

Review records Fun /10, Difficulty /5, Suitability /5 and optional comments; unfinished attempts may also be rated. Reviews are local and exported as CSV with stable IDs and definition hashes. Play uses a timer without the survey. Intended-route viewing is practice, not leaderboard evidence. Human testing still decides fun, suitability, measured difficulty and eventual distribution.

## Learning paths and distinct decisions

| Family | Base preparation | Fractured application | What makes the combination consequential |
| --- | --- | --- | --- |
| Timed launch/pogo | B54 chooses low then loft; B55 intercepts two moving moths | F55 extended wavedash into low pogo; F56 folded return using reverse hyper and moving-target loft | Roof clearance and patrol phase demand different rebound heights; the outward hinge becomes the return runway. |
| Moving anchor/cargo | B56 pays out under a thorn then reels above stone; B57 catches rising freight horizontally | F57 releases into a loft behind a diagonal patrol; F58 joins moving rope, upward catch and later throw/dash/recatch | Arrival depends on rope length and release; landing loses cargo catch speed; the same lantern supplies both directional catches and later shade. |
| Spent faces | B58 returns under its used top; B59 carries an aerial refill into the next grip | F59 reverse-hyper/wallbounce return; F60 three-grip continuous shaft | Used faces remain solid but remove recovery choices; stamina, air refills and patrols stay connected without intermediate floors. |
| Reply/thermal cycle | B60 parries in flight; B61 turns a cooling ceiling into a takeoff floor | F61 replies upward during a low launch; F62 crosses the same thermal window low outward and high homeward | A projectile replaces a missing resource reset; retained recoil and a later glass interval provide the return height. |

There are 12 compact and four extended rooms. F56/F62 are 48×36 extended routes; F58 is an 80×36 two-part sequence; F60 is a 40×52 extended shaft. F58 is honestly labelled extended despite its nominal canvas exceeding three room areas: its played sequence does not claim three normal rooms of content. Other rooms are shorter focused lessons or applications, including modest scrolling layouts. Map area alone is not a quality claim. Endings in the later rooms deliberately retain execution pressure.

## New opt-in device

`public/bladefall-pcore-dev-spent-thorn.js` and `-view.js` add persistent solid rectangles with one marked face. First contact stays safe indefinitely. Departure starts an 18-simulation-frame visible warning, then that face is lethal until death/reset. Recontact cannot cancel arming; the other faces remain ordinary solid. Folded hairs, a stripe, an amber warning and raised red teeth communicate the exact face. The armed collision strip is three pixels deep.

Only B58/B59/F59/F60 opt in with `spentThorns`. The new module uses the normal solid-body physics and emits touch/leave/arm events. It excludes teleports from swept lethal checks and reflects private face orientation when gravity mirrors the body. Existing movement constants and old room definitions are unchanged. No exit is gated on invisible proof that a named movement or device event happened.

## Evidence completed

All **99 canonical routes finish without deaths**. Saved focused checks pass **410 positive variations and 260 shortcut probes**. The Run 7 contribution is **47 variations and 53 probes**. Its canonical frame counts are B54 177, B55 229, B56 242, B57 175, B58 380, B59 391, B60 267, B61 243; F55 129, F56 394, F57 295, F58 382, F59 295, F60 676, F61 143, F62 530.

Actual route events now include hyper/wavedash in F55/F56/F59/F61; reverse-hyper in F56/F59; reverse-super in F62; wallbounce in F59/F60; controlled pogo in B54/B55/F55/F56/F57; airborne cargo catches in B57/F58; airborne parry in B60/F61; and recoil launches in B61/F62. Evidence is saved in each source's route/event data or `routeMovement`, with the generated aggregate in `docs/room-bank/route-report.json`.

Negative cases actively attempt plausible alternatives: nearest-edge ordinary jumps/dashes, riding carrier roofs, an ordinary lantern pickup and carrying jump, the wrong pogo height, skipping an air refill, returning to a spent grip, aiming the projectile forward, unloading the recoil, and launching before the thermal opening. B61's patrol phase was adjusted after the read-only audit found it decorative: the saved overstay now dies to the returning thorn before molten begins, while the canonical route and its three variants still pass. F62 also has an active nearest-edge ordinary return attempt during the glass interval, rather than merely omitting the intended reverse input. This preserves timing counterplay rather than merely requiring an event log.

`node scripts/room-bank/spent-thorn-check.mjs` passes four-face contact/departure, indefinite holding, noncancelable warning/recontact, lethal retained solids, death reset, an actual movement attempt, larger bounds, private gravity mirroring and opt-in absence checks. Separate read-only code/map review found no additional concrete collision or obvious geometry blocker; it is not exhaustive route search.

The baseline has 415 hashes: 409 match unchanged, and six expected shared files change for the new page/menu/registry/cache integration and synthesis clarification. In particular all 83 original room sources and existing engine files match the baseline. Both original Celeste reports and the unrelated world lock are preserved.

Browser playback completes all 16 new rooms, including actual camera travel in extended maps; group membership, review/revision/CSV and play timer/pause checks pass. The final B56/B57/B58/B59/F58/B61 refresh also passes: Grab hints render correctly, the first spent-face hints display at rest, F58 is labelled extended, and B61 uses its final patrol phase. All 16 entrance views and 17 intermediate views were inspected without an observed rendering or camera issue. Browser evidence is `scripts/climb/.cache/room-bank/run7-browser-review.json`. The 418-file local bundle was rebuilt; byte parity is confirmed for registry, menu, versions, service worker and new device files. The final F62 record includes five saved negative cases.

Passing tapes establish feasible routes and named cases, not measured human quality or proof against every alternative. A few early/late variants are specific successful inputs, not a universal tolerance measurement. Preserve creative alternate solutions when they still engage the central problem.

## Files and continuation

- Source records: `scripts/room-bank/base/` and `scripts/room-bank/fractured/`, stable IDs above. Some filenames retain numeric prefixes; use `room.id` and `bank.side` as authority.
- Source contract: `scripts/room-bank/catalog.json`, batch14 / activeRun7.
- Generated registry: `public/bladefall-room-bank.js`; manifest and route report under `docs/room-bank/`.
- Preservation baseline: `docs/room-bank/run-7-baseline.json`; originals: `scripts/room-bank/archive/before-run7/`; result: `docs/room-bank/run-7-preservation.json`.
- Actual movement and final route/check counts: `docs/room-bank/run-7-movement-audit.json`.
- New device and view: `public/bladefall-pcore-dev-spent-thorn*.js`; contract: `scripts/room-bank/spent-thorn-check.mjs`.
- Version: **7.299.0**; cache **bladefall-v464-room-bank-run7**.
- Browser captures and review: `scripts/climb/.cache/room-bank/`; final receipt `run7-browser-review.json`.

Reproduce only when a relevant change or concrete concern calls for it:

```sh
node scripts/room-bank/build.mjs --check-batch
node scripts/room-bank/check.mjs --write
node scripts/room-bank/spent-thorn-check.mjs
node scripts/room-bank/browser-check.mjs bank-b54 bank-b55 bank-b56 bank-b57 bank-b58 bank-b59 bank-b60 bank-b61 bank-f55 bank-f56 bank-f57 bank-f58 bank-f59 bank-f60 bank-f61 bank-f62
bash build-deploy.sh
```

The last command assembles a local static bundle; it does not authorize publishing. Nothing has been committed or published. Stop for human review. Do not create another set, change approvals or insert rooms into campaigns without user direction. Preserve prior sources, caches, unrelated Climb work and completed reports. The repository's older long histories describe their own releases; this handoff and current code are the relevant state.
