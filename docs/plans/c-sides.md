# C-sides: handoff for building the twenty bonus worlds (7.319)

> **7.325:** C-side 1, *Trumpet Hollow* (the Outskirts), is built and playable as candidate E (Claude's one try), beside Codex's Room Bank candidates A–D.
> - Code: `public/bladefall-climb-csides.js` (world n=101, `cside:1`), with routes in `bladefall-climb-cside-tapes.js`.
> - Wiring:
>   - played from the Garden & skins card's "Play C-side";
>   - gated in `startWorld` by `csideOpen(k)` (or review or the 100% view);
>   - `worldDone` records `csideBeaten(k)`;
>   - geography anchor 101 at [0, 4720].
> - Routes come from `scripts/climb/tools/cside-beam.mjs`, a beam search, which also works for the others.
> - Follow its pattern for C-sides 2–20 (n = 100 + k), or replace it with whichever candidate Isaac picks.

Isaac (2026-10-12) asked for one C-side per world pair, unlocked by perfect clears. The unlock mechanics, rewards and UI are built and shipped in 7.319.0. **The C-side worlds themselves are not built yet. This document is the brief for building them.**

## What already exists

All of this is in `public/bladefall-climb-rewards.js`; the hooks are in `public/bladefall-climb-view.js`.

**Perfect clear.** A perfect clear is a world finished from its start with no deaths on its road.
- Deaths in optional routes (quests and secrets) do not count.
- Skips are allowed for now, so a perfect clear is always possible even where a room still has an unavoidable death.
- Climb state: `st.perfectRun` (false when the world was resumed mid-way or left through a passage) and `st.roadDeaths`.
- On reaching the world's end, `rewardWorld()` calls `BladefallClimbRewards.perfect(n)`.

**Plants.** `PLANTS[k]` holds 20 plants, one per base world k (1–20).
- A perfect clear of base world k gives the bottom half (`root`).
- A perfect clear of Fractured world k+20 gives the top half (`top`).
- With both halves, `csideOpen(k)` is true. The game announces "its C-side is open"; the Garden & skins card and the map card say "C-side open · coming soon".
- Unlocking happens in-game only. Nothing launches a C-side yet.

| k | World | Plant | Bottom (base) | Top (Fractured) |
|---|---|---|---|---|
| 1 | The Outskirts | Outskirts Trumpet | Trumpet Bulb | White Trumpet |
| 2 | Black Woods | Black Woods Oak | Taproot | Crown of Leaves |
| 3 | Broken Causeway | Causeway Ivy | Clinging Rootlets | Climbing Vine |
| 4 | The Updrafts | Updraft Dandelion | Milkroot | Seed Clock |
| 5 | Hollow Marksman | Marksman Thistle | Spined Root | Thistle Head |
| 6 | Ruined Keep | Keep Mushroom | Mycelium | Fruiting Body |
| 7 | The Warden | Warden Fern | Rhizome | Fiddlehead |
| 8 | Frostfell | Frostfell Snowdrop | Snow Bulb | Snowdrop Bell |
| 9 | Frost Sorcerer | Sorcerer's Glass Lotus | Lotus Tuber | Glass Bloom |
| 10 | Emberdeep | Ember Cactus | Water Root | Ember Bloom |
| 11 | Ember Colossus | Colossus Sunflower | Deep Root | Sun Head |
| 12 | The Inversion | Inverted Orchid | Air Roots | Orchid Spur |
| 13 | The Void Tyrant | Tyrant Moonflower | Moon Corm | Moonflower |
| 14 | The Abyss King | Abyss Thornrose | Rose Cane | Thornrose |
| 15 | The Deep Line | Deep Line Kelp | Holdfast | Kelp Frond |
| 16 | Thunder Cliffs | Cliffside Edelweiss | Crevice Root | Edelweiss Star |
| 17 | The Landing Shores | Shore Sea Holly | Sand Runner | Holly Thistle |
| 18 | The Colony | Colony Clover | Stolon | Four-Leaf Clover |
| 19 | The Path to the Palace | Pilgrim's Lavender | Woody Crown | Lavender Spike |
| 20 | Sunspire Palace | Sunspire Lily | Golden Bulb | Sunspire Lily |

**Recording a beaten C-side.** `BladefallClimbRewards.csideBeaten(k)` records C-side k as beaten. All 20 beaten, together with everything else (every world and heart, your Echo and Vesper), earns the rarest skin, **Prism Paladin** (7.321).

**Skins** (`SKINS`, 7.321). There are ten:
- the Ascendant: worlds 1–20;
- the Fractured: worlds 21–40;
- Echo Self: your Echo and Vesper;
- Gilded Sovereign: every heart, your Echo and Vesper;
- Prism Paladin: everything plus every C-side;
- Ember Wretch: 41 hearts (7.328: a heart reward only);
- Starlit Regalia: the Abyss King;
- the Haunt: the Fractured King;
- Heartbound: 61 hearts;
- the Gardener: 21 hearts.

They are worn from the world map's Garden & skins card. Since 7.328 the card shows only the next skin in each line (story: Ascendant → Fractured → Echo Self → Gilded → Prism; hearts: Gardener → Ember → Heartbound) as a silhouette with its condition, so nothing ahead is spoiled; Starlit and the Haunt appear only once earned.

**State.** Saved in localStorage `bladefall.climb.rewards.v1` as `{perfect, csides, skin, seen}`.

## What to build: 20 C-side worlds

**Form.** Each C-side is a short Survive world: 3–5 sections, each with its own fire, ending in a hard finale room.
- It is the hardest remix of its world pair's single mechanic.
- No optional routes and no hearts.
- Skips: Isaac has not ruled on whether skips are allowed in C-sides. Ask him before deciding.
- Follow Isaac's design rules:
  - one mechanic, introduced alone and then chained;
  - the boss or hazard is on screen from the spawn;
  - every timer has a job;
  - no invisible rules;
  - real void under the challenge.

**Registration.** Register like the finale worlds in `public/bladefall-climb-finale.js`:
- call `CL.addWorld(w)` with `n = 100 + k` and `key = 'c-side-' + k`;
- set `passages:[]`, `atlasPassagesReady:true`, `requiredBankRooms:[]`, `requiredMainRooms:[]`;
- add `cside:k`;
- build rooms in code or as data;
- add tapes in a tapes file loaded before the module.

**Geography.** Each world needs an anchor in `bladefall-climb-geography-build.js`'s `anchors`, clear of every other region; `compile()` throws on overlap. One option is a row far below world 41 (y ≈ 5200) at x = −2000 + 200·k.

**Gating.**
- Start C-side k only when `BladefallClimbRewards.csideOpen(k)` is true (or in review).
- Add the check in `startWorld()` in `bladefall-climb-view.js`, next to the `n > 40` finale check. Note that the finale check currently catches every world above 40, so give C-sides (n ≥ 101) their own branch.
- Launch from the Garden & skins card (a Play button per open plant) and/or from the map card's "C-side open" line, replacing "coming soon".

**Completion.**
- At the C-side's end, call `BladefallClimbRewards.csideBeaten(k)`.
- `rewardWorld()` returns early for n > 40, so add a C-side branch (or call it from the C-side's last room, as the finale does with its own events).

**Map.** C-sides should stay off the Emerald map; the Garden card is their home.

**Proof.**
- Route-prove every room with a recorded tape and zero deaths. A scripted policy bot (see `scripts/climb/finale-check.mjs` and the finale's `fin-bot.mjs` approach) works well for multi-phase rooms.
- Include bypass probes that must fail.
- Add a checker like `scripts/climb/finale-check.mjs`.

**Room Bank.** Optionally add the rooms to the Room Bank review group (batch 20+, `needsReview:true`), as was done for the finale rooms.

## Open questions for Isaac

- Skips allowed in C-sides?
- Should a C-side be harder than the Echo's four-phase fight, or about the same as the hardest Fractured finales?
- Reward for beating a single C-side: a plant drawn whole in the Garden? A per-plant cosmetic?
