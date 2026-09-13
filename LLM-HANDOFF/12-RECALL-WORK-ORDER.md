# The world-wide Muster recall — work order (2026-09-13)

This file is the authoritative statement of what the recall outside Frostfell
is supposed to be, exactly what exists today, why the gap happened, and the plan
the owner approved in shape. Read it before touching anything Muster-related.
It supersedes the softer wording in `05`, `09` and `11`, which now point here.

## The owner's review, 2026-09-13

Playing the current build (`7.96.0`) from Frostfell back through the Warden:

> "In Frostfell, when you hit the frost-muster, there are new enemies, more
> enemies, larger enemies, smarter enemies, and enemies that have more health
> and do more damage on the backtrack. However, none of these new enemies or
> elevated aspects of the enemies are present (noticeably so at least) when I
> return to the Warden and begin my backtracking. All elements should be present.
> Not every map needs the same new enemies; each map can have unique ones, while
> the general/consistent enemies that are present throughout the game can simply
> be beefed up across all maps."

That is the specification. The 2026-09-11 implementation does not meet it.

## What exists today, exactly

| Expected on the backtrack | Frostfell after the strike | The four return regions today |
| --- | --- | --- |
| New enemies, unique per map | 3 new ice types (frostpike 48/12, frostsinger 42/11, rimehulk 92/24), 11 placed | 3 shared types reused everywhere: shieldbearer 64/12, linesman 34/10 ranged, signaler 30/8 |
| More enemies | 11 added on top of the full roster | Warden 3, Outskirts 4, Black Woods 4, Broken Causeway 5 |
| Larger, smarter enemies | hulks at twice the size, two-Blood contact, `noticeRange` 480 | one larger unit (the shieldbearer); the signaler's call is the only new behaviour |
| Existing enemies with more health and damage | every enemy gets max health ×1.55, once | **nothing** — no health, damage or notice change to any existing enemy |

(`hp/dmg` pairs are `EARCH` values; an ordinary grunt is 22/8.)

Placement makes it worse. `WARDEN_LEVEL` is 15,000 units; the Frostfell mine
drops the knight at `(330, 0)` at the west end; the Warden's three recall units
stand at x = 10,900 and 12,800–13,400 (`MUSTER_ROSTERS.warden`). Ordinary enemy
deaths persist through zone state (`buildZonePersistenceManifest`,
`defaultPresent: !record.dead`), so the first two thirds of the return through
the Warden are emptier than the first visit. Outskirts and Black Woods posts are
sparse and mid-level; the Causeway's are the densest set. Standards
(`musterStandard` scenery) mark the posts, and Orra, Oren and Olan each have one
recalled line.

What the automated evidence proves is hygiene, not impact: posts stand on
footing and clear of safe sites, checkpoints and residents; a reload installs
exactly one roster; no boss is revived; the signaler's call is telegraphed and
interruptible. `tests/muster-recall.test.mjs` also asserts that **no unit's
health is multiplied** — the test encodes the wrong rule and must be rewritten,
not satisfied.

## Why the gap happened (so it is not repeated)

The return proposal says "avoid merely multiplying every enemy's HP, attack speed
and count", and an earlier decision says "no repeated HP stacking" on reload.
Those were read as "no buff at all". That was a misread. Reload hygiene
(idempotent, once per save, never stacking) stays; a one-time, world-wide buff
of the general enemies is required. A second lesson: the handoff reported the
mechanism ("the recall reaches four regions") rather than the felt result; every
future claim about the recall must say what a player meets in the first minute
of each region.

## The plan (shape approved 2026-09-13; assumptions marked)

1. **World-wide baseline, once.** After `frost-muster` opens, every ordinary
   enemy in every campaign region receives the same treatment Frostfell applies
   in `installFrostMusterEnemies`: max health ×1.55, damage ×1.25 *(assumed;
   confirm)*, `noticeRange` 480. One helper, called from
   `activateZonePersistence` for every zone when `musterRecalled()` is true,
   after hydration, marking `e.musterUpgraded` so persisted entities and reloads
   never stack it. Bosses, travelers, NPCs, residents and safe sites untouched.
2. **A re-garrisoned world.** The recall is a fresh army. Ordinary enemies killed
   on the outward trip return under the recall *(assumed yes; confirm)*.
   Mechanism: on a region's first load after the strike, clear the `dead`
   persistence of ordinary enemies once, keyed by a per-zone circuit such as
   `recall-garrisoned:<zoneId>` so it never repeats; then raise density at chosen
   combat spaces with authored posts. Deaths after that persist normally.
3. **One unique enemy per region**, distinct silhouette and behaviour, safe first
   introduction: a *gaoler* in the Warden (chain lash that drags the knight off a
   ledge), an *outrider* in the Outskirts (fast flanker that commits to a route),
   a winged unit in Black Woods that contests the raised route over the root
   wall, and a formation on the Causeway (shielded advance with linesman cover
   behind it, asking for Counter, portals and Double Jump together). Add each to
   `EARCH`, `BladefallEcology.SPECIES`, `drawEnemyVariant` (`e.muster` branch)
   and, where it has a call or a formation, `updateOrdinaryEnemyAI`. The current
   three types become the shared backbone, not the whole show.
4. **Evident on arrival.** The first post of every region stands within sight of
   its arrival point, standards raised, so the change reads in the first ten
   seconds. Arrival points: Warden from the mine `(330, 0)`; Outskirts, Black
   Woods and Causeway at the `outskirts-warden` and westward-return arrivals —
   verify with the streamer's arrival rules (`plan.connectorId` cases near
   `BFZoneStreamer`) rather than guessing.
5. **Keep every existing guarantee**: safe sites, checkpoints and residents clear
   (existing test); no boss revival; solved gates and NPC progress kept; the
   surprise (no warning hints); no duplicate posts and no stacking on reload;
   Frostfell's own roster unchanged (it is the reference).
6. **Evidence**: rewrite `tests/muster-recall.test.mjs` to lock the buff in
   (every ordinary enemy in every region carries the multiplier once, and only
   once after reload), lock the one-time re-garrison, and assert a unique type
   within sight of each arrival; bot receipts through each recalled region
   (`node scripts/run-bot.mjs --muster`); screenshots at each arrival point.
   Then the ordinary release boundary: version and cache bump, mirror rebuilt,
   `release:check`, handoff refreshed. No Netlify deployment without instruction.

## Where the code is

- `public/index.html`: `MUSTER_ROSTERS`, `musterRecalled()`,
  `installMusterRoster()`, the hook in `activateZonePersistence()`,
  `installFrostMusterEnemies()` (the ×1.55 boost, `noticeRange` 480,
  `musterUpgraded`), `updateMusterSignaler()`, `drawEnemyVariant` (`e.muster`),
  `EARCH` rows, `drawScenery` (`o.musterStandard`), `ambientFigureDialogue`
  (`musterDialogue`).
- `public/bladefall-ecology.js` (`SPECIES` rows), `public/bladefall-dialogue.js`
  (`woods.orra.muster`, `causeway.oren.muster`, `outskirts.olan.muster`).
- `tests/muster-recall.test.mjs`; `scripts/bladefall-bot.mjs`
  (`bootstrapStage({stage, muster: true})`); `docs/bot/receipt-muster.json`;
  `docs/frostfell-return-proposal.md`.
- The event has one source: Frostfell's `frost-muster` circuit in the save's
  zone state, read from any region. Verified 2026-09-13 in a real campaign
  session: strike, travel, save, reload all carry it. That part is not the bug.

## Still to confirm with the owner

- Damage multiplier for the world-wide baseline (assumed ×1.25).
- Killed ordinary enemies return under the recall (assumed yes).
- Whether the return's rewards, caches and shortcuts (the proposal's payoff
  half) ride in the same run or follow it.
