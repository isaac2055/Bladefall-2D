# 7.334 — ten Cores, Ascend, and world-specific scenery

Implementation and native/DOM checks complete. Release commit/push and Cloudflare byte verification are the final publication steps. Do not deploy to Netlify. Browser automation was denied earlier: no browser/CDP workaround and no claim of live browser or human completion. Never stage unrelated `.Rhistory`.

## Player-facing changes

Survive is now ✨ Ascend; Explore uses 🪐. Main/co-op menus, leaderboard tabs/completion, play/review labels, touch help, and document titles use the new name. Existing `survival`/`survive-2` API, physics, save, and leaderboard identifiers remain compatible.

Cores use their origin-world palettes, background scenery, and terrain details in Room Bank as well as Ascend. All ten palette/background paths are checked through the real view hooks.

The original five Cores now have 6/8/4/4/4 checkpoints, twice their former counts. Each includes a new checkpoint before its old first flag. Supplemental saves preserve device clocks, and stored checkpoint revisions migrate to the equivalent original flags. Every complete route and every fresh reset is proven. The 132 ordinary source rooms retain their baseline hashes.

Extra crumble grace is 60 frames for Cores 1–5, 40 for 6–10, 20 for 11–15, and zero for 16–20. Only Cores 1–10 exist. The next two bands are a policy helper, not authored rooms.

## Five new single-room Cores

All are batch 27/run 17, F101–105, playable in the Core bank and through their Garden plants. They are route-proven candidates/drafts awaiting player review, not user-approved banked rooms. Each has five checkpoints and six sections. Native proofs use normal stamina and physics, no test assist.

| Core | Room | Shape / interactions | Whole frames | Fresh sections |
|---|---|---|---:|---|
| 6 / Keep | The Mason’s Grip | Rising climbing courts; thorned cap/far-face catches; four hanging portal transfers; carriers and arrows; alternate seed-free opening | 1817 | 287/579/257/324/270/99 |
| 7 / Gaol | The Unwritten Sentence | Descending cell gauntlet; alternating thorn barriers; jailers, pogo/backcuts, recoil transfers | 2048 | 407/249/418/383/575/47 |
| 8 / Frost | The Winter Between | Long rising ridge; ice momentum, feathers, wind, carrier, hanging parry into the next transfer | 1554 | 381/403/273/261/215/26 |
| 9 / Court | The Borrowed Marble | Courtyard loop; freeze falling water into temporary climbing walls; hanging condensers renew ice; portal landing | 2166 | 446/307/550/393/455/50 |
| 10 / Ember | The Shape of the Fire | Furnace ascent/returns; eight stone-phase wall grips, two upward glass-gate crossings, hanging portal transfer, carriers and final crumble | 2303 | 383/363/443/262/436/485 |

Keep’s alternate opening is independently proven. Waiting too long on its wall fails from stamina depletion. Each new Core has no-grab and basic run/jump/dash sensitivity probes; Gaol additionally removes recoil pods, Frost feathers, Court water columns, and Ember heat columns/permanent stone. These are meaningful authored-route and basic bypass checks, not exhaustive proof that every possible shortcut is impossible. Difficulty remains a player judgment.

## Authoring and verification

Source records: `scripts/room-bank/fractured/101-bank-f101.json` through `105-bank-f105.json`. `author-{keep,gaol,frost,court,ember}-core.mjs` match exact geometry/configuration; running them resets tapes. Do not regenerate over saved proofs unintentionally.

The native search snapshot helper now copies mutable water grid/ice data so one search branch cannot alter another. This changes authoring simulation isolation, not production physics. Cap-catch and checkpoint helpers support independent restart proofs. No live proof writers remain.

Checks passed:
- `node scripts/climb/cores-check.mjs` — all ten full/fresh routes, exact checkpoint totals, saves/deaths, timing, Garden gates, demo/draft rewards, geography, ordinary source hashes.
- `node scripts/climb/expansion-cores-check.mjs 101 102 103 104 105` — author parity, full/fresh routes, interaction counts, world-specific probes.
- `node scripts/climb/keep-core-check.mjs` — alternate route and stamina sensitivity.
- `node scripts/climb/new-cores-check.mjs` — prior Updraft/Marksman routes and fresh saves.
- `node scripts/climb/test-tools-check.mjs` — real key/pointer handlers, checkpoint flags, replay guards, camera, all ten palettes/backgrounds.
- `node scripts/climb/search-water-snapshot-check.mjs` — isolated freezing/thawing search branches.
- Garden, finale, co-op practice and co-op UI checks; recordings, cloud review sync and Cloudflare asset checks.
- `node scripts/room-bank/build.mjs --check-batch` — 142 playable / 142 saved; bank approvals preserved.
- `./build-deploy.sh` — offline mirror rebuilt locally; no Netlify deployment, no APK requested.

Generated Core data contains ten worlds 101–110. Geography anchors include all ten; the public geography map still hides Core worlds. Public version 7.334.0, serviceworker cache v502. Proof receipts are under `docs/room-bank/`.
