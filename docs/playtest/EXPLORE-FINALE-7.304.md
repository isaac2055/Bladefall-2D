# Explore finale · 7.304

The Fractured Palace's existing King in the Dark fight and road remain intact. Walking beyond the defeated king now reveals Vesper. This first confrontation reuses his arena without changing the saved stage identities. His first-phase ward cannot be depleted by ordinary damage; his attacks remove three Blood measures, and a final overwhelming blow ends the confrontation after fourteen seconds. The defeat advances the story, including in Hardcore, rather than restarting the entire game. Test Mode can break the ward.

The fall leads to **41 · The Final Echo**, a new playable two-phase duel. The Echo uses the knight renderer and the existing blade, dash, jump and counter systems. Read the windup, evade the cut or jump the landing wave, then strike its recovery. Two phases total 480 HP, compared with Vesper's original four phases totaling 1,880; recovery windows are deliberately longer. An ordinary death retries the Echo checkpoint.

Victory offers **Kill**, **Merge**, or **Forget**. The result is persistent, survives Continue/reload, and affects actual blade/projectile power: Kill ×1.15, Merge ×3, Forget ×0.7. Merge breaks Vesper's remaining ward and restores his original one-measure attacks. Without Merge, his ward absorbs three quarters of incoming damage and his blows cost at least two measures. This leaves Kill possible but extremely demanding and Forget weaker still. Standalone precision courses and Boss Rush retain their existing power. Defeating the Echo again permits another choice.

The next fight is **42 · Vesper**, using the existing four forms, animation, attacks and phase checkpoints. Its concluding text reflects the chosen path and saves Explore completion. Existing internal IDs 41, 42 and 44 belong to precision courses; the new Echo uses internal ID 45, and Vesper retains 43 (`cloaked-man`) so old saves and boss checkpoints remain compatible.

Public Level Select hides both finale rows until all forty ordinary Explore worlds have actually been completed. The independent completion ledger accepts solo campaign and unassisted Level Select finishes; it also recognizes old world-clear flags and the player's own saved world times, including archived earlier leaderboard seasons. Shard unlocks, someone else's records, Test Mode and co-op do not count as solo clears. Localhost/file previews may show both rows immediately. The online forty-world playtest catalog is unchanged.

No Survive story ending was added; that remains deferred until its remaining superrooms exist.

## Verification

- `node --test tests/explore-finale.test.mjs tests/campaign.test.mjs tests/world.test.mjs tests/progression.test.mjs tests/cloaked-man-stage.test.mjs tests/fractured-palace-stage.test.mjs`: 54 tests pass.
- `node --test --test-name-pattern='LEVEL SELECT' tests/rift-shards.test.mjs`: gated playable row passes. That older file has a separate pre-existing assertion requiring a title-screen Rift Shards button which the current title no longer has.
- `node scripts/explore/check-finale.mjs`: local assets under a production-origin browser fixture exercise the public gating, Palace exit, first Vesper ward, actual lethal defeat, Echo checkpoint retry, choice UI, reload/Continue, all four final phases, and conclusion flags. It accelerates boss HP and the Palace clear, so it is an integration check, not a claim of an unassisted whole-game playthrough.
- Real keyboard blade contact against Vesper measured **6.578 damage with Kill**, **68.64 with Merge**, and **4.004 with Forget**, with the same late-game preview loadout.
- Ignored receipts and screenshots: `scripts/climb/.cache/explore-finale-7.304/`.

The combat route and persistent consequences work. Human feedback is still needed for the new Echo's difficulty and Vesper's choice balance.
