# Handoff verification — 2026-09-13

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

