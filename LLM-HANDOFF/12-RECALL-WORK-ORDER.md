# The world-wide Muster recall — work order (2026-09-13)

## Run 3 — return payoff and White Court plan (2026-09-14)

Source **7.98.0**, cache **bladefall-v178**. Four visible reserves now pay off the
Frostfell return. They remain sealed before the Muster recall, with no explanation
that spoils the surprise. Each sits on a 130-unit perch reachable with earned
Double Jump; opening it with Up grants one existing advancement item and releases
a permanent physical route. Fast travel and all existing routes remain available.

| Region | Reserve perch | Reward | Released route |
| --- | --- | --- | --- |
| Warden | Red Court `(4820,130)` | 1 vitality fragment | Two floor maintenance bridges beneath Turning Cells, spanning `[5640,6080]` and `[6360,6760]`. Pillars, rotors and boss arena unchanged. |
| Outskirts | Hollow Mile `(7180,130)` | 1 Forge Seal | Bridges across the two road gaps, `[7530,7810]` and `[8230,8700]`; patrols remain. |
| Black Woods | Briar Run `(7400,130)` | 1 vitality fragment | Honest canopy stairs at x=7620/7840/8060/8280, heights 260/390/520/620, then a span to the root crown at x=9600. |
| Causeway | Chainwake Camp `(1020,130)` | 1 Forge Seal | Upper Chainwalk service span at y=265, with eastward steps at `(7690,200)` and `(7970,130)` above the floor teeth. Oren's door and Brute unchanged. |

Total: **two vitality fragments and two Forge Seals**, not two health upgrades
(four fragments form a knot). Enna, Olan, Orra and Oren point to the reserves only
on the recalled return. No new currency, ability, boss rule or progression gate.

Implementation: `RECALL_RETURN_ROUTES`, `installRecallReturnRoute`,
`syncRecallReturnRoute`, `interactRecallReserve` in `public/index.html`.
Objects append with stable IDs before the zone manifest is built, preserving old
object indices. Cache shortcut IDs use the existing permanent zone shortcut state;
road visibility/collision is derived after hydration. Advancement claims use
existing source-idempotent grants. Closed roads are not drawn as fallen slabs.
The bot's recalled bootstrap now synchronizes movement/portal capabilities after
granting the earned kit; previously its player still had maxJumps=1 despite owning
Double Jump in the fixture's capability list.

`tests/recall-return.test.mjs` covers sealed first visits, duplicate installation,
one-time rewards, serialized campaign state, reload/rest/death, and actual-input
reserve access with Double Jump versus single jump. `scripts/validate-recall-return.mjs`
proves all four released routes in both directions, touching every new road;
`docs/recall-return/receipt.json` records the targets and outcomes. Initial states
are positioned fixtures with damage suppressed, not campaign/combat completion.
Rendered cache/route fixtures are in `docs/recall-return/evidence/` (local ignored
PNG files). Final suite/release evidence is in `10-HANDOFF-VERIFICATION.md`.

White Court remains **design only**: see
[`DESIGN-PLAN.md`](../docs/charters/09-frost-sorcerer/DESIGN-PLAN.md).
It preserves the Causeway entry, far-side aqueduct unlock, Attunement and Emberdeep
exit; proposes inhabited approach rooms and three changing cold/receiver phases,
active player-requested casts and usable independent portal placement. Prototype
and human pacing review are the next steps after a new implementation instruction.
Do not mistake proposed ward counts, room dimensions or timing for shipped code.

No deployment, commit, push or project relocation in this run. Prior bot artifacts
are 7.97.0 evidence; their exact hashes are not expected to match 7.98.0 geometry.

## Run 2 — implemented (2026-09-14)

Run 1's outcome is preserved below. Run 2 changes developer scripts and tests;
normal gameplay, version 7.97.0/cache 177, and the deployment remain unchanged.

- Fixed abandoned-route inputs, unrecorded initial settlement, nested detour graph
  state and stopping at a target during a macro. Budget exhaustion retains the
  committed branch. A level-end pass now requires the actual seam; a custom
  horizontal target may be reached in the air.
- A solve pass requires byte-identical **full simulation** replay. Player equality
  is separate. Independent bot bootstraps restore a pristine runtime, including
  registered counters that survive `beginRun`. Warden failed-branch replay and
  same-browser repeat bootstrap have focused regression coverage.
- Added steered dash/jump and crystal-refill actions, including real release/press
  edges. The graph permits crystal-assisted rises and crossing low walls.
- Added pickup visits and fuel-consuming flight, with a landing feedback policy.
  The Updrafts probe releases the authored winch, acquires the pack, opens its gate
  and flies past x=4100. This is not the whole Updrafts level.
- Added real portal-button placement. Marksman's probe crosses both opening
  mantlets and the anchored road. Keep's independent floor-pair planner derives
  the slates and high drop perch from geometry, visits them, places both mouths
  and uses falling momentum to clear the refectory screen. Vertical-pair and
  projectile/keystone-routing puzzles are not thereby certified.
- Runner writes input artifacts with a full-state SHA-256 hash. `--replay FILE`
  reproduces them without search; a replay pass only certifies the stored route,
  not full-level completion. Failure receipts include segment, ledge, candidate
  attempts and failed setup visits. Observed refill/placement/flight evidence is
  counted during the final replay, not inferred from macro names.

**Verification:** `npm test -- --test-concurrency=2` completed **510/510**, with
no failures or skips. All seven focused bot tests pass, including same-browser
repeat bootstrap and full-state replay. The first integration attempt was 508/510:
one new assertion incorrectly required fuel to remain positive, and the other
exposed lifetime counters surviving `beginRun`; both were corrected. A closed
Chrome stderr pipe delayed final worker exit; the suite eventually exited normally,
and bot cleanup now explicitly destroys owned browser stdio after closing Chrome.
Post-cleanup `node --test tests/bot.test.mjs`: **7/7** and normal exit (109.2 seconds).
The recalled Causeway passes at x=13134; the Woods stored artifact also passes in
a fresh browser. Release parity passes for all **93 assets**, version/cache unchanged.

`docs/bot/receipt-run2.json` is the final eight-stage sweep at 12,000 expansions
per stage. All eight committed routes replay byte-identically; runtime errors are
empty. **Three route successes, five failures:**

| Stage | Result / exact retained failure |
| --- | --- |
| Outskirts | Exit seam, x=13738, 44 segments. |
| Black Woods | Exit seam, x=12338, 17 segments. |
| Causeway | Brute threshold, x=13132, 6 segments; not boss victory. |
| Updrafts | Budget exhausted, segment 20, x=7981; floor [5700,8400], y=0. |
| Marksman | Root search failed, segment 0, x=70; floor [0,1091], y=0. The local target through x=4700 passes; the far-goal planner does not retain that route. |
| Keep | Budget exhausted, segment 4, x=4980; Weight Hall floor [4800,7900], y=0. The independent-pair screen is passed. |
| Warden | Budget exhausted, segment 3, x=13169; ledge [13075,13285], y=170. Replay mismatch fixed, full traversal not solved. |
| Frostfell | Budget exhausted, segment 6, x=4445; floor [4250,4654], y=0. Bespoke validator remains separate. |

Scoped proofs and replay artifacts are in `docs/bot/run2/`; seven automated bot
tests prove the new verbs even where the far-goal planner fails. The recalled
Causeway also reaches the Brute threshold with the earned return kit. See
`TESTING.md` for commands. A lower-road x=3250 probe was initially described as
reaching the pack platform; inspection corrected it to y=0. The final pack test
actually acquires the gear and consumes fuel, so it supersedes that early probe.

**Remaining bot work is explicit:** better far-goal planning/recovery across
opposing-direction detours, projectile/keystone mechanism planning, vertical-pair
setups, and continuous campaign/boss handling. Adding input verbs did not by itself
solve all those puzzles. Failures above are bot limitations, not proven softlocks.

Historical run-2 boundary: run 3 followed separately and is recorded above.
No deployment, Git commit/push, project relocation, boss rewrite or campaign
completion claim is included in run 2.

## Run 1 of 3 — implemented 2026-09-13

Source is now **7.97.0 / bladefall-v177**. Run 1 expands the recall's actual
encounters: **14 Warden, 12 Outskirts, 13 Black Woods, 15 Causeway** reinforcement
actors (plus standards), replacing the former handful of posts. The distinct
regional roles are gaoler (telegraphed pulling lash), outrider (committed charge),
canopywing (locked-target dive), and chainmarshal (large shielded advance with
linesman support). Gaolers and marshals deliver two-Blood hits; ordinary wounds
remain one Blood. Regional AI leaves warnings and recovery openings.

Every ordinary enemy across all sixteen regions receives **one ×1.55 max-health
and ×1.25 raw-damage boost**, with notice range at least 480. Raw damage does not
change the ordinary one-Blood rule. These are the proposed implementation defaults,
not a separately confirmed balance preference. Boss stats remain unchanged.
The first recalled load of each region clears only dead ordinary rest-reset enemy
deltas once (`recall-garrisoned-v1`); bosses, unique encounters, other objects,
NPC progress, solved circuits and shortcuts remain intact. Later deaths use the
existing persistence/rest rules. Frostfell retains its eleven authored actors,
health boost and cinematic; its initial strike marks its local garrison transaction.

Standards and encounters now appear early on the return route. Warden's gaoler
is at x=850, 520 units beyond the mine arrival; Outskirts' first outrider is at
x=1460 after the safe chimney descent; Woods' first canopywing is at (660,200);
Causeway's first marshal is at x=340. Most new roles repeat deeper in the region.
Recall AI pauses attacks near residents, shops, rest sites and checkpoints.

**Evidence:** final full suite 506/506 (`npm test -- --test-concurrency=2`); release check 93 assets, parity OK; Frostfell
validator 15/15. Nine focused recall tests cover all sixteen regional stat loads,
no stacking, protected placement, live attack cycles, gaoler damage/pull, formation
support, first garrison and preservation of bosses/circuits/shortcuts/later deaths.
`docs/bot/receipt-recall-run1.json` records Outskirts and Woods traversal passes
with identical final player snapshots. Warden and Causeway failed; this is not
proof of a complete return or of full simulation replay identity. The bot uses
its existing per-stage starting fixtures, not a continuous saved campaign.
`node scripts/capture-muster-recall.mjs` reproduces isolated arrival/telegraph
screenshots in `docs/recall/evidence/`; they explicitly hide defeated bosses and
set player positions, so are presentation evidence only.

**Next:** run 2 addresses bot replay reliability and missing traversal/interaction
verbs, including these stopping points. Run 3 adds return rewards/shortcuts and
plans the White Court continuation. Those runs have not been implemented here.
The working copy is still on Desktop; Git commands remained responsive, but
moving outside iCloud remains advisable. The release mirror was rebuilt locally;
no Netlify deployment, commit or push was performed during run 1. GitHub main
therefore still represents the previous release, not these uncommitted changes.

## Prior work order and review (historical context)

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

## Original open tuning questions (defaults now used above)

- Damage multiplier for the world-wide baseline (assumed ×1.25).
- Killed ordinary enemies return under the recall (assumed yes).
- Whether the return's rewards, caches and shortcuts (the proposal's payoff
  half) ride in the same run or follow it.
