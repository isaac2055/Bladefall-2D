# Run 3 handoff — 7.292.0

Completed 8 October 2026. The user requested Run 3 next and will review it together with Run 2. Both sets are ready in Extras → Room Bank. Stop before Run 4. All work local; no publication or commits.

Read `docs/room-bank/RUN-3.md` for review links, controls, solutions and evidence. Read `RUN-2.md` for unchanged movement-room solutions. Do not rewrite the existing tech/entity reports.

## Saved additions

- Base B35 Put the Weight Back; B36 Plant the Exit; B37 Pay Out After the Wall; B38 Borrow the Rise.
- Fractured F35 Borrow Only Enough; F36 Meet It on the Way Back; F37 Catch the Other Train; F38 Borrow the Shadow.
- Sources and full routes: `scripts/room-bank/base/bank-b35.json` through `bank-b38.json`, `scripts/room-bank/fractured/35-bank-f35.json` through `38-bank-f38.json`.
- Shared entity modules and views: `public/bladefall-pcore-dev-recoil*.js`, `-impulse*.js`, `-moving-hook*.js`; a narrow opt-in extension in the existing hook module handles moving rings.
- Recoil loads manually with Down or from loose lantern/living grounded enemy weight. Lift comes through actual solid motion; partial load matters. B35 returns the real cargo to shade the exit.
- Seeds move on first blade contact, charge gold, then burst radially away from their centre on a fresh cut. F36 hint is corrected. No resource refill, same-swing double trigger or cargo/solid behavior.
- Moving anchors use visible solid carriers, relative pendulum velocity and actual carrier motion once. Blocked rail motion pauses its clock; obstructed rope detaches. These rooms use ordinary gravity and nonteleporting rails.

## Completion evidence

55 canonical routes, 243 positive variations, 100 negative probes, exact batch coverage, all focused entity tests and 21 Run 2 movement contracts pass. The new set contributes 82 successful variations and 20 probes. Browser check completes all 16 Run 2/3 rooms, verifies required route events, surveys from both sets, CSV, all five groups, timer/pause and legacy F20 classification. All eight new layouts visually inspected. Generated manifest and route report are current. Local bundle: 416 files, cache v457-room-bank-run3.

All 47 earlier room records, both reports and the world lock match the 534-file pre-run hash baseline at `docs/room-bank/run-3-baseline.json`. Expected changed baseline files are menu/build/catalog/browser integration, HTML/version/cache, the fixed-hook opt-in extension and first-input hint view. New devices/rooms/tests were not present in that baseline. Preserve all unrelated work.

Banking stays 22 rooms (11+11). B26/F30 remain revised; six Run 1 approvals stay banked, including B27 as easy Base material. New rooms are candidates until user approval; no numeric scores invented. Full pool: 29 Base/26 Fractured, with Run 3 4+4, Run 2 4+4, Run 1 revisions 1+1, earlier review 9+6 and banked 11+11.
