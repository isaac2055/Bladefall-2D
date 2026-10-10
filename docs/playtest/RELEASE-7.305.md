# Bladefall 7.305 — superroom review and Explore finale

The ten planned finales are implemented as individually saved review candidates at **Extras → Room Bank → Superrooms for review**, on the website and in the APK. There are five Base and five Fractured rooms, including six native boss encounters. Proposed worlds: 1, 4, 6, 11, 20, 21, 25, 29, 37 and 40. The approved campaign and its previous 97 bank records remain intact.

[Review guide and solutions](../room-bank/SUPERROOMS-7.305.md) · [Explore changes and evidence](EXPLORE-FINALE-7.305.md)

Explore now has its own submenu with Level Select. Base ends at 20; Final Echo (41) and Vesper (42) are under Fractured. Echo hits cost three Blood and incoming damage is quartered. Returning to a planted flag leaves another attacking Echo sharing the fight's health. Directly selecting Vesper receives 99% damage resistance and no stored-choice multiplier; earning Merge through Echo and continuing directly into Vesper retains the intended advantage, including after reload/Continue.

## Validation

- All 107 saved room routes finish with zero deaths. The ten candidates also have 28 successful alternate timing/recovery tapes and 15 failed shortcut probes.
- All ten new rooms passed their actual browser routes, event checks and scrolling camera checks. Room Bank grouping, review submission/export, play clock and pause behavior passed. Final rendering checks covered the shared circuit labels, visible sluice/perch controls and changing King architecture.
- The preservation audit verifies 184 prior bank/campaign/device files unchanged. Three narrow native fixes cover room dimensions in Sorcerer water lookup, King floor waves and King beam telegraphs. All six native Sorcerer and six native King routes still pass.
- Explore's production-origin browser fixture passed menu navigation, real keyboard damage, actual flag placement/death/clone combat, story transitions, Merge persistence, direct Vesper selection and the ending. Encounter HP/story progress are accelerated for transition checks; it is not an unassisted full playthrough.
- The public/mobile fixture passed the Extras entry, mobile feedback controls and Survival-first leaderboard tabs. HTML module references and all new offline precache entries are present. Cloudflare asset validation and Git whitespace checks passed.

## Android

The signed [7.305.0 APK](https://github.com/isaac2055/Bladefall-2D/releases/download/v7.305.0/Bladefall-7.305.0.apk) is linked beneath Leaderboards. Its 441 game assets match the website source byte-for-byte; Android intentionally omits local hidden configuration and hosting-only files. The existing signing key is retained.

- File: `Bladefall-7.305.0.apk`
- Size: 432,810,718 bytes (about 412.8 MiB).
- SHA-256: `2028f2cdbec841dec13f7801031f871d05974785751225352830b6a38fb817f5`

Physical Android hardware and a physical controller were not tested in this change set. Human ratings still determine room fun, difficulty and suitability. The previous controller, touch, co-op and leaderboard implementation is retained. No API Worker or leaderboard-season change is needed for this release.

Ignored local receipts are under `scripts/climb/.cache/room-bank/`, `explore-finale-7.305/`, and `apk-7.305.json`. The repository includes the individual room records, saved tapes, review guide and preservation audit.
