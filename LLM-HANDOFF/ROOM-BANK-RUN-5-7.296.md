# Room bank Run 5 — 7.296.0

The user asked to complete Run 5 after strongly liking the preceding four Superrooms. The historical Run 5 plan's pauses between compact and expanded rooms were superseded by this direct completion request. Eight candidates are now available under **Extras → Room Bank → Run 5**. Everything is local.

## Delivered

| Side | Compact | Continuous superrooms |
| --- | --- | --- |
| Base | B46 Let the Train Go Low; B47 Two Landings, One Light | B48 The Train Comes Back Empty; B49 The Rooms Trade Their Floors |
| Fractured | F47 Come From the Wrong Side; F48 Bring the Ram Down | F49 Open It on the Way Out; F50 Walk the Answer Twice |

[Guide and spoiler solutions](../docs/room-bank/RUN-5.md) · [Pool index](../docs/room-bank/README.md) · [Original sequence](../docs/room-bank/RUN-PLAN.md).

The previous B44/B45/F45/F46 remain candidates under **Superrooms**. Do not bank them or revise their endings until requested. All 70 preexisting room records, approval classifications and routes are preserved exactly. The 78 active records contain 46 banked rooms (26 Base / 20 Fractured), eight Run 5 candidates and unchanged earlier review groups. No numeric human ratings were invented.

## Runtime and integration

- `bladefall-pcore-dev-rail.js`, `rail-view.js`, `water.js`, `water-view.js`: use actual room cols/rows/height. The wider switchyard requires correctly parsed far rails, water pools and drawing. The rail lost-cart boundary follows room height.
- `bladefall-pcore-view.js`: `{companion}` hint resolves through the same remappable Portal action as Echo; Controls labels it “Oren · hold / follow” in companion rooms. Previous camera changes remain intact.
- Room-bank builder, catalog and view add Run 5 with two compact/two super per side. Prior Superrooms remain separate. Default menu is Run 5. Browser checker covers these groups plus intermediate screenshots from large-room routes.
- Cache and page URLs: 7.296.0, `bladefall-v461-room-bank-run5`. `netlify-deploy` rebuilt locally; nothing published.

No movement constants changed. New rooms opt into existing movement/entities as authored. Avoid assuming gravity inversion works in large companion rooms; the old companion mirror helper still assumes a normal viewport, and these new rooms do not invert gravity.

## Evidence

All 78 canonical zero-death routes, 348 positive variations and 190 targeted bypass probes pass. Run 5 adds 24 variations/24 probes. The normal/wide-tall device fixture exercises freeze/thaw/swim and cart/rail/boost beyond the old viewport. Browser route completions cover all 8; large rooms remain one continuous room and scroll substantially within bounds. Reviews persist room/revision/side and export CSV; play timer and pause work; companion Controls label is checked. Layouts and intermediate scrolling views were inspected.

Primary checks:

```sh
node scripts/room-bank/build.mjs --check-batch
node scripts/room-bank/check.mjs --write
node scripts/room-bank/run5-device-check.mjs
node scripts/room-bank/run5-preservation-check.mjs
node scripts/room-bank/browser-check.mjs bank-b46 bank-b47 bank-b48 bank-b49 bank-f47 bank-f48 bank-f49 bank-f50
bash build-deploy.sh
```

Do not rerun broad sweeps without a new reason. Passing tapes establish working routes, not human quality or exhaustive uniqueness. The next step is player review, including how the larger rooms feel and whether Fractured endings are forgiving enough. Existing reports `SURVIVE-TECH-REPORT.md` and `SURVIVE-ENTITY-REPORT.md` are complete and unchanged; do not regenerate them.

Baseline: `docs/room-bank/run-5-baseline.json`; exact originals: `scripts/room-bank/archive/before-run5/`; new records: individual JSONs under `scripts/room-bank/base/` and `fractured/`; evidence: `docs/room-bank/route-report.json`; screenshots: `scripts/climb/.cache/room-bank/`.

Do not deploy, begin another run or change previous approval decisions without further user direction. Preserve all unrelated local changes and Climb caches.
