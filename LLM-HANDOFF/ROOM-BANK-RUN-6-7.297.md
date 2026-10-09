# Room bank Run 6 — 7.297.0

The user requested another set after Run 5: “Now that you're in the groove, go ahead and do this again, that way I have more levels I can play and test.” Eight new candidates are complete under **Extras → Room Bank → Run 6**. Everything is local.

## Delivered

| Room | Side | Format | Discovery |
| --- | --- | --- | --- |
| B50 — Close the Receiving Mouth | Base | compact | Turn the delivery portal into the physical stop that parks its own cargo |
| B51 — Make the Watch Look Away | Base | compact | Borrow an ice wall for concealment, then remove it before the prepared launch |
| B52 — Send the Bolt Upwind | Base | superroom | Send a bolt upwind, then circle below and above its lane to build the return screen |
| B53 — What the Tide Leaves Behind | Base | superroom | Turn a flooded obstruction into a dry return stair. |
| F51 — Wait for the Arrow | Fractured | compact | Restore the bridge to land, then withdraw it to free the shot |
| F52 — Put It on the Other Floor | Fractured | compact | Set the seed’s height on one floor and launch from the other |
| F53 — Let It Through First | Fractured | superroom | Deliver through liquid, then freeze the cargo route into your ascent |
| F54 — Open the Fall | Fractured | superroom | Send a shot to open the height needed for your own portal launch |

[Guide and solutions](../docs/room-bank/RUN-6.md) · [Pool index](../docs/room-bank/README.md).

All 78 prior room definitions, routes and approval/side decisions are preserved exactly. Run 5 still has eight candidates; the earlier B44/B45/F45/F46 remain in Superrooms awaiting deferred refinements. The active pool has 86 rooms, with 46 banked (26 Base / 20 Fractured). New numeric human ratings are unmeasured.

## Integration and evidence

The catalog uses batch 12, active Run 6 and a reusable `roomFormats` quota (two compact and two superrooms per side). Builder, menu and browser checks add Run 6 while preserving all prior groups. Cache/page version is 7.297.0, `bladefall-v462-room-bank-run6`. The local `netlify-deploy` bundle is rebuilt; nothing published or committed.

All 86 canonical zero-death routes, 371 positive variations and 214 specific bypass probes pass. Run 6 adds 23 variations and 24 probes. Browser checks complete all eight, verify actual continuous scrolling in large maps and review/play behavior. Visual checks include initial layouts and intermediate scrolling views.

Primary checks:

```sh
node scripts/room-bank/build.mjs --check-batch
node scripts/room-bank/check.mjs --write
node scripts/room-bank/run6-preservation-check.mjs
node scripts/room-bank/browser-check.mjs bank-b50 bank-b51 bank-b52 bank-b53 bank-f51 bank-f52 bank-f53 bank-f54
bash build-deploy.sh
```

Sources: individual JSON files under `scripts/room-bank/base/` and `fractured/`. Baseline: `docs/room-bank/run-6-baseline.json`; exact originals: `scripts/room-bank/archive/before-run6/`; evidence: `docs/room-bank/route-report.json`; browser images: `scripts/climb/.cache/room-bank/`.

Do not rerun broad checks without a new reason. Passing routes do not measure fun or guarantee complete route uniqueness. Next step is human review. Do not regenerate the already completed `SURVIVE-TECH-REPORT.md` or `SURVIVE-ENTITY-REPORT.md`. Preserve unrelated Climb work and caches. Do not publish, start another set or change approval decisions without user direction.
