# Continuous Survive campaign — 7.306

Each of the forty worlds is again a continuous road. The 87 ordinary bank imports are distributed among the existing challenges rather than appended in a separate gallery. Thirty finales are assigned. Retained native rooms and their attached optional routes move as whole clusters, preserving their relative geometry and every original checkpoint. A retired checkpoint migrates to a surviving challenge when an older save loads.

Native boss superrooms replace their corresponding final compact fight; earlier boss phases and the Sunspire terrace epilogues remain. Three retired challenges retain a quiet walkable footprint because an existing optional branch depends on that location. The replacement is a passage, not another boss fight.

The compiler connects mismatched entrances with visible stairs, climbs and drops. It reserves the real atlas arrival and departure footprints, keeps a continuous camera, and carries the player’s physical exit velocity across each connection. A temporary entrance closes only after the player reaches the room’s fire, restoring its reviewed geometry. After completing a room the entrance opens for backtracking. F31/F32 enter beside their phase roofs so approaching the fire does not flip the phase or collect the opening objective.

No bank import uses checkpoint teleport links. Deliberate navigation through room select, retry and earned checkpoint return remains available. All mandatory challenges, including bank imports and finales, must be completed personally; another co-op player cannot solve the world for you.

The saved integration contains **555 mandatory challenges**, **87 ordinary imports**, **30 finales** and **52 retired challenges** (39 previously selected compact cuts plus 13 final boss replacements). The three preserved quiet footprints are excluded from challenge counts.

The final checks pass: all **306 physical joins** reach their checkpoints in the real browser with zero deaths or errors, and all **215 closed-room route proofs** pass. All 40 terminal exits reach their atlas roads safely; the audit preserves 87 optional branches and 112 dialogue records. A clean compiler reproduction matches the saved registry. [Structural audit](campaign-integration-7.306-audit.json) · [Browser results](campaign-integration-7.306-browser.json).

## Placements

| World | Ordinary bank rooms | Finale |
| --- | --- | --- |
| 1 · The Outskirts | B21, B22 | B62 |
| 2 · Black Woods | B23, F22 | B67 |
| 3 · Broken Causeway | B39, B11 | B68 |
| 4 · The Updrafts | B15, B38 | B63 |
| 5 · Hollow Marksman | B27, B31 | B69 |
| 6 · Ruined Keep | B50, F20 | B64 |
| 7 · The Warden | B20, F47 | B70 |
| 8 · Frostfell | F21, B16, B33 | B53 |
| 9 · Frost Sorcerer | B26, B34 | B71 |
| 10 · Emberdeep | B25, B18 | Still to author |
| 11 · Ember Colossus | B13, B35, B30 | B65 |
| 12 · The Inversion | B05, B14, B17 | B49 |
| 13 · The Void Tyrant | B58, B59 | Still to author |
| 14 · The Abyss King | F39, B19, F41 | Still to author |
| 15 · The Deep Line | B37, F37, F44 | B48 |
| 16 · Thunder Cliffs | B41, B43 | Still to author |
| 17 · The Landing Shores | F35, B32, B36 | Still to author |
| 18 · The Colony | F38, B42 | B44 |
| 19 · The Path to the Palace | B12, B29, B24 | B45 |
| 20 · Sunspire Palace | B61, F48 | B66 |
| 21 · The Fractured Outskirts | B56, F40 | F63 |
| 22 · The Fractured Woods | F17, F26 | F68 |
| 23 · The Fractured Causeway | B46, F23 | F69 |
| 24 · The Fractured Updrafts | F59, F60 | F50 |
| 25 · The Fractured Marksman | F27, F33 | F64 |
| 26 · The Fractured Keep | B57, F34 | B52 |
| 27 · The Fractured Warden | F51, F11 | F70 |
| 28 · The Fractured Frostfell | B51, F18 | F71 |
| 29 · The Fractured Sorcerer | F14, F15 | F65 |
| 30 · The Fractured Emberdeep | F36, F43 | F72 |
| 31 · The Fractured Colossus | F42, F24 | Still to author |
| 32 · The Fractured Inversion | F52, F12 | F49 |
| 33 · The Fractured Tyrant | F13, F31 | Still to author |
| 34 · The Fractured King | F30, F19 | Still to author |
| 35 · The Fractured Line | F16, F25 | F45 |
| 36 · The Fractured Cliffs | B54, B55 | Still to author |
| 37 · The Fractured Shores | F55, F56 | F66 |
| 38 · The Fractured Colony | B40, F58 | F46 |
| 39 · The Fractured Path | F28, F61 | Still to author |
| 40 · The Fractured Palace | F32, F57 | F67 |

## Finales still to author

Ten worlds remain: 10, 13, 14, 16, 17, 31, 33, 34, 36 and 39. No additional rooms for these worlds were made in this release.

## Reproduction and evidence

- `node scripts/room-bank/build.mjs` builds the individually saved room records and review groups.
- `node scripts/climb/import-bank.mjs` rebuilds all forty worlds from the preserved 7.303 native source, reviewed placements and current bank records.
- `node scripts/climb/check-bank-import.mjs --write` checks approved closed maps, puzzle routes, branch geometry, physical seams, atlas layout, personal completion and save migration.
- `node scripts/climb/verify-import-seams-browser.mjs` exercises actual view transitions, camera continuity, checkpoint closure, mobile viewport and skip restrictions.

Successful layout searches are cached locally, and every cached movement proof is replayed before reuse. Local caches are excluded from Git. The individual room records, compiler, manifest and shareable audit are tracked.
