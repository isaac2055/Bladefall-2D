# Handoff verification — 2026-09-13

## 2026-09-15 — White Court local review build

Source **7.99.0**, cache **bladefall-v179**. `release:check` passes all93 assets
and mirror/header parity. Baseline suite7/7 after rebuilding. No deployment.
Full regression541/541 preceded the final visual-only frost-cap draw order and
version/cache edits; the final cap passed continuous replay/capture afterward.

`docs/charters/09-frost-sorcerer/IMPLEMENTATION-RECEIPT.json` records current source
and evidence hashes. The continuous5361-frame route wins the boss and reaches the
usable Emberdeep door without intermediate resets or health/progress grants.
Initial capability prefix is a fixture; normal keyboard/reload validators cover
the asynchronous seam separately. Muted/reduced replay also wins.
Generic bot fails segment4 atx10386 after30,000 expansions/303.7seconds, with no
mechanism interactions or runtime errors. Do not confuse it with the authored
winning policy. Human pace/legibility/difficulty acceptance remains pending.


## 2026-09-15 — direct public-folder Netlify upload

`public/` is self-contained and now includes `_headers` for service-worker/entry
revalidation and manifest MIME type. The mirror builder copies the same file;
release checks enforce parity and required headers. Upload `public/` itself to
Netlify's existing-site Deploys area, or configure Git publishing with directory
`public` and no build command. No deployment performed; gameplay/version unchanged.
Release check passes all 93 assets plus header parity. Normal browser startup
reaches the title screen at 7.98.0, service worker caches 93 requests, and no
runtime errors or missing game requests occur. This smoke served unchanged public
assets from memory after a disk-backed attempt hit a local navigation timeout.

## 2026-09-14 — run 3: return reserves and White Court design

- Source **7.98.0 / bladefall-v178**; rebuilt mirror and `npm run release:check`
  pass all **93 assets**, no failures. No deployment.
- `node --test tests/recall-return.test.mjs tests/muster-recall.test.mjs`:
  **12/12**, zero failures/skips, normal exit. The three new tests cover sealed
  first visits, stable installation, one-time rewards, serialized campaign state,
  rest/death/reload, and earned Double Jump access in all four return regions.
- `node scripts/validate-recall-return.mjs`: **8/8 directional route checks**,
  every new road touched, no runtime errors. Causeway includes the old approach
  staircase from ground, not only a fixture already on the new span. Receipt:
  `docs/recall-return/receipt.json`. Geometry fixtures suppress combat damage;
  they do not claim a continuous campaign or boss victory.
- Cache/route PNG fixtures inspected in `docs/recall-return/evidence/`.
  The Woods canopy is visibly distinct from the copied lower paths; absent
  road platforms are not rendered as solid fallen slabs.
- `docs/charters/09-frost-sorcerer/DESIGN-PLAN.md` is the White Court design
  deliverable. No Sorcerer gameplay was changed. Handoff and `TESTING.md` updated.
- `npm test -- --test-concurrency=2`: **513/513 pass**, zero failures, skips or
  cancellations; normal exit, 568.1 seconds (`/tmp/run3-full.log`). This includes
  all seven existing bot tests and the three new reserve tests.


## 2026-09-14 — run 2: bot reliability and traversal verbs

- `npm test -- --test-concurrency=2`: **510 tests, 510 pass, 0 fail, 0 skip**.
  `/tmp/run2-full-final.log` records the completed run (473.6 seconds; an orphaned
  Chrome stderr pipe delayed worker exit after its tests had passed). Cleanup now
  explicitly closes the owned browser stdio after `browser.close()`.
- Seven focused bot tests cover the original routes/failure contract, Warden
  failed-branch full-state replay, Marksman crystal/linked traversal, the Keep
  independent-pair launch with repeat-bootstrap replay, and actual pack pickup/
  fuel-consuming flight. An earlier 508/510 attempt exposed the repeated-bootstrap
  counter issue plus an invalid positive-fuel expectation; both are resolved.
- Post-cleanup `node --test tests/bot.test.mjs`: **7/7**, normal exit (109.2 s).
  Recalled Causeway: threshold x=13134; Woods artifact: independent browser replay
  hash matches. Both receipts are in `docs/bot/run2/`.
- `docs/bot/receipt-run2.json`: **3 successful routes / 5 failures**, all eight
  committed routes full-state replay-identical, runtime errors empty. Budgets are
  12,000 expansions per stage. The detailed failure table is in
  `12-RECALL-WORK-ORDER.md`. Boss threshold means no boss victory.
- Scoped proofs and independently replayable input artifacts are in `docs/bot/run2/`.
  `--replay` verifies a full-state SHA-256 hash without invoking the solver. Input
  artifacts use the same version and viewport as their producing runner.
- `npm run release:check`: **ok**, 7.97.0 / bladefall-v177, **93 assets**, no failures.
  Run 2 changes scripts, tests and documentation; no gameplay/version/deploy change.

The old run-1 and Fable receipts below remain historical, not the current bot's
acceptance boundary. The generic bot still does not solve all later-level puzzles
or a continuous campaign. See `TESTING.md` for commands and exact limits.


## Run 1 verification — 2026-09-13

- `npm test -- --test-concurrency=2`: **506 tests, 506 pass, 0 fail, 0 skipped**.
- `npm run release:check`: **ok**, `7.97.0`, `bladefall-v177`, **93 assets**,
  source/deploy parity; rebuilt with `./build-deploy.sh`. No deployment.
- `npm run validate:frostfell`: **15/15 checks true**, no runtime errors.
- `tests/muster-recall.test.mjs`: nine focused tests covering placement, all
  sixteen regional stat loads, non-stacking, AI phases, attacks and persistence.
- `docs/bot/receipt-recall-run1.json`: **overall false**. Outskirts and Woods pass
  with matching final player snapshots; Warden and Causeway fail. The current bot
  fixtures are not an actual continuous west-to-east return campaign.
- `scripts/capture-muster-recall.mjs`: eight staged arrival/telegraph screenshots,
  inspected locally. Not evidence of natural travel or boss victories.

The earlier full-suite attempt had 502/503 passing: only the stale mirror failed.
After rebuilding, a 505-test run passed. Adding the Causeway input regression
brought the suite to 506; the default-concurrency attempt lost a Chrome page
(`TargetCloseError`, not a gameplay assertion). The final two-worker run above
passed all 506. The extra test proves passage past the opening marshal with
earned Double Jump/Dash despite the general bot failure.
Version/cache bumps and source changes are local, not pushed to GitHub main.
See `12-RECALL-WORK-ORDER.md` for behavioral details and remaining runs.

## 2026-09-13 re-verification after the iCloud eviction

The owner's working copy (iCloud-synced `~/Desktop`) had every loose Git object
and most of `public/` evicted to placeholders; after iCloud released them:
`git fsck --strict` clean, `git status` clean, `npm test` **500/500** (90 s),
`npm run release:check` ok with **93** assets, zero evicted files anywhere in the
project. Then pushed: `chore/track-authoritative-tree` and `main` both at the
release commit `707e473` plus handoff-only commits. No deployment.

## The 2026-09-11 release boundary

Source version `7.96.0`, cache `bladefall-v176`, both bumped at this boundary.
`npm test`: **500 tests, 500 pass, 0 fail** (includes the new bot, recall, gift,
echo and harness-state tests). `npm run release:check`: ok, **93** assets, manifest
parsed from `build-deploy.sh`. Mirror rebuilt from `public/`. No deployment.

Git: branch `chore/track-authoritative-tree` (from `main` at `dd2d9a7`) tracks the
whole authoritative tree; a fresh clone rebuilt the mirror and passed
`release:check`. Pushed 2026-09-13; GitHub `main` fast-forwarded `dd2d9a7` → `707e473`.

## Retained gameplay evidence

- `docs/charters/08-frostfell/evidence/receipt.json`: 15/15 checks, unchanged.
- `docs/bot/receipt.json`: the traversal bot across all eight authored stages.
  Outskirts, Black Woods and Broken Causeway complete with byte-identical replay;
  each later stage's exact stopping point is recorded.
- `docs/bot/receipt-muster.json`: the recalled Outskirts completed with no Blood
  spent and the recalled Causeway to the Brute's threshold, booted with the return
  kit.

## Limits

This is not proof of a full continuous fresh campaign, all optional routes, co-op,
White Court streaming, or subjective balance. The owner played the long return on
2026-09-13 and found the recall outside Frostfell not noticeable; the receipts
above prove placement hygiene and completion, not impact. See
`12-RECALL-WORK-ORDER.md`. Positive owner feedback is recorded separately
from automated coverage.

## Historical August receipt — not current-tree certification

The following is retained from 2026-08-21. The old summary called this “466/466,”
but its actual output says `tests 466`, `pass 448`, `fail 0`; do not reinterpret
those unequal counters as 466 passing leaf tests or carry them forward as today's
suite result. Copy sizes/counts below are also historical.

### August working-copy generator

`bash -n LLM-HANDOFF/make-working-copy.sh` passed. The script was run into clean
temporary destinations in both modes.

| Check | Runnable | Code-only |
| --- | --- | --- |
| Size | 79 MB | 6.0 MB |
| File count | 246 | 212 |
| `public/index.html` and current modules | present | present |
| Tests, scripts, deploy builder, compact docs | present | present |
| Current audio and `public/music.mp3` | present | intentionally omitted |
| `.git`, `node_modules`, `netlify-deploy` | absent | absent |
| Historical screenshot/video evidence | absent | absent |

The runnable copy was served directly with its dependency-free local server on
an alternate port. HTTP checks returned:

- `index.html`: 200, version `7.95.2`;
- `bladefall-progression.js`: 200;
- `audio/music/strange-worlds.ogg`: 200.

### August project verification

`npm test` completed successfully:

```text
tests 466
pass 448
fail 0
duration_ms 89090.178375
```

`npm run release:check` completed successfully:

```json
{
  "ok": true,
  "version": "7.95.2",
  "cache": "bladefall-v175",
  "assets": 73,
  "sourceBytes": 78600233,
  "failures": []
}
```

No Netlify deployment was performed.

