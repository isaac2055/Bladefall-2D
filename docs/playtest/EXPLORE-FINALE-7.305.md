# Explore finale · 7.305

Explore now opens a submenu containing Continue Explore, New Game, and Level Select. Title-screen Continue still resumes whichever mode was played last. Base lists worlds 1–20; Final Echo (41) and Vesper (42) both sit after worlds 21–40 in Fractured. The forty-world public unlock and local-preview exception remain unchanged.

The Echo now removes three Blood per hit and receives one quarter of its previous incoming damage. Its two phases, attacks and recovery timings are unchanged. A flag planted during the fight saves the actual encounter state, including shared references between the boss bar and enemy bodies. Returning to that flag adds another active Echo: it attacks, can be struck, shares boss health, and stops when the fight ends. Repeated returns to the same saved flag restore the same pair rather than multiplying without limit; a later flag can capture the expanded fight.

Vesper's existing flag duplication remains intact. Investigation confirmed that the old checkpoint restores his enemies while the rebuilt encounter spawns another body; both run combat logic. Echo's equivalent behavior is now intentional and preserves its encounter health and phase.

A saved Merge choice alone no longer weakens a directly selected Vesper. A realistic attempt requires winning Echo, choosing Merge, then following Return to Vesper. That attempt keeps the ×3 blade power and removes the ward. Kill and Forget still have their ×1.15 / ×0.7 power, but Vesper absorbs 75% of incoming damage and costs at least three Blood. Direct Level Select grants no choice-based power multiplier, and Vesper absorbs 99% of incoming damage regardless of any old choice. Continue/reload and checkpoint death preserve the current legitimate attempt; selecting Vesper afresh does not.

## Focused verification

- 25 unit tests passed across `explore-finale`, `cloaked-man-stage`, and `player-checkpoint`; the changed Fractured listing test also passed.
- `node scripts/explore/check-finale.mjs` uses local assets under a production-origin browser fixture. It checked menu navigation, public unlocks, the Palace story transition, actual flag placement and lethal death, clone combat, Merge persistence through reload/Continue, direct Vesper selection, and the four-phase conclusion. Boss HP and story completion are accelerated for transition checks; this is not an unassisted playthrough.
- Real keyboard blade hits dealt **5.72 HP** to Echo (previously 22.88), **68.64 HP** to the immediate Merge-route Vesper, and **0.2288 HP** to direct Vesper with any persistent choice.
- A restored Echo clone dealt exactly three Blood through the real damage hook. Both restored Echo bodies use the same boss state, and hitting the clone with the keyboard damages that state.
- Ignored receipts and screenshots: `scripts/climb/.cache/explore-finale-7.305/`.
