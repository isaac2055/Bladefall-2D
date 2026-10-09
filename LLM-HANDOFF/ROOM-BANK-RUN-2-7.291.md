# Room bank Run 2 — 7.291.0

The user's six Run 1 approvals are banked: B27 (early/easy Base), B29/B30, F26/F27/F28. Their room definitions/tapes equal the archived originals; F26 records the accepted dash-first/wavedash/pogo alternative. B26 and F30 are revised, not banked. B26 now parks the uppercut guard on a higher ledge and adds a stone-shade/beam-return puzzle; 12 representative positive tapes plus the broader 119-clean-case sample establish a usable execution range. F30 preserves rope/tally/echo/zero-dash design with a wider, lower final shelf; 72/72 sampled release/swap routes pass versus 18/72 originally.

Run 2 is complete: four Base B31–B34 and four Fractured F31–F34. Shared-core `movement: 'survive-2'` enables controlled pogo height, buffered cargo dash catch, reverse super/hyper and six-frame late wallbounce only for these rooms. Existing-room rules remain intact. Hints are visible before first input. The existing two design reports were used, not regenerated. No new entities; Run 3 has not started.

Current pool: 47 active (25 Base / 22 Fractured). Run 2 4+4; Run 1 revisions 1+1; earlier review 9+6; banked 11+11. All 47 clean routes, 161 positive variations, 80 negative probes and the exact catalog contract pass. Movement tests: 21 permanent contracts plus a successful one-time legacy trace comparison. Browser review/export/play flow passes; all ten new/revised rooms rendered and completed. Local bundle rebuilt (410 files), no publication. Version 7.291.0; cache v456-room-bank-run2.

Start at **Extras → Room Bank → Run 2**. Guides: `docs/room-bank/RUN-2.md`, updated `RUN-1.md`, and `README.md`. Sources save each room individually. Broader timing evidence: `scripts/room-bank/b26-tolerance.json` and `scripts/room-bank/evidence/run-1-review/30-bank-f30-tolerance.json`. Numeric player scores remain unmeasured. Preserve unrelated edits and the world lock file. Stop before Run 3 until the user continues.


## Files and boundaries

- Canonical records/tapes: `scripts/room-bank/base/` and `fractured/`. Generated registration: `public/bladefall-room-bank.js`; generated manifest/report: `docs/room-bank/`.
- Catalog and UI preserve four groups; accepted Run 1 rooms moved to Banked, only B26/F30 remain in Run 1 revisions.
- Core edits: `public/bladefall-pcore.js`, the slick-wall exception in `public/bladefall-pcore-dev-rbr-f-updrafts.js`, and early hint display in `public/bladefall-pcore-view.js`. Targeted contracts: `scripts/test-survive2-movement.mjs`.
- Original Run 1 records: `scripts/room-bank/archive/run-1-before-review/`. Pre-run hashes: `docs/room-bank/run-2-baseline.json`. The 31 rooms before Run 1 remain byte-identical to that baseline; six Run 1 approvals change bank metadata only.
- No reset, commits, campaign insertion, deployment or new-entity work. `./build-deploy.sh` refreshed only the local bundle.

Use the Run 2 guide for control rules, solutions, real timing limitations and reproduction commands. The full distributed playtest and difficulty distribution analysis still require human ratings.
