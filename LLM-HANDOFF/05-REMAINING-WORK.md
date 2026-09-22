# Remaining work and recommended production order

## Definition of “finished”

The target is not “all systems exist” or “the test suite is green.” The Base
single-player world is finished when all sixteen regions form one enjoyable,
readable, persistent journey; every level passes its own human and automated
acceptance gate; the two endings work; backtracking is rewarding; and no route
requires Test Mode, stale saves, unexplained geometry, or model knowledge.

## Priority 0 — protect the current project

1. Done: since 2026-09-11 Git tracks the whole authoritative tree, and on
   2026-09-13 it was pushed and `main` fast-forwarded. Keep `main` and the working
   copy in step: current work is on branch `chore/track-authoritative-tree`, pushed
   2026-09-15 and not yet merged. The owner's copy moved out of iCloud to
   `~/Projects/Bladefall-2D Antigravity` on 2026-09-15; never move it back under
   `~/Desktop` or `~/Documents`.
2. Preserve an independent runnable lean copy using
   `LLM-HANDOFF/make-working-copy.sh` before large future edits. The generator
   now ships the preserved original game that the Recollection player loads.
3. Never delete the old evidence/archive until a separate backup exists; it is
   deliberately not tracked in Git.

## Priority 1 — preserve accepted opening; observed polish only

The owner considers start through the end of Warden complete in substance.
Enemy additions, platforming adjustments and presentation polish remain possible
later. Do not reinterpret old review notes as permission to rework completed
bosses. Record and fix observed defects within the requested scope.

## Priority 2 — current Frostfell and the next decision

Frostfell's settlement, 20-landing finale, cinematic Muster activation, local
reinforcements, mine repair and three-stop service route are implemented; the
latest changes received positive owner feedback. Preserve the scoped evidence
in `10-HANDOFF-VERIFICATION.md`. A continuous full-campaign pacing review remains
useful, but is not an unfulfilled order to redesign Frostfell.

The next choices require a new implementation instruction:

- **Run 1 is implemented.** See `12-RECALL-WORK-ORDER.md` for the expanded
  rosters, global stat/re-garrison policy and exact checks. Human difficulty review
  remains distinct from the green tests and isolated screenshots.
- **Run 2 is implemented.** Full-state replay, clean repeated bootstraps,
  stored-input replay, and crystal/portal/pickup/flight verbs have focused proof.
  The recalled Causeway failure is resolved. Whole later levels still have the
  exact planner/mechanism blocks recorded in `12-RECALL-WORK-ORDER.md`; don't
  reinterpret scoped success as a campaign clear or a boss victory.
- **Run 3 is implemented.** Four reserves and physical shortcuts reward the return.
  White Court is implemented in local review build7.99.0; its continuous route
  wins the boss and reaches the usable exit. See the implementation receipt and
  acceptance audit under `docs/charters/09-frost-sorcerer/`. Owner playtesting is
  still required before final acceptance;
  its gameplay implementation and human pacing review remain next.

Known deferred issues: five unread secondary Echo hooks; the far half of the
White Court aqueduct. Bram, Gilded Instinct and the inert Gifts are resolved.
See `11-RECENT-CHANGES-AND-PLANS.md` and `KNOWN_BUGS.md`.

## Priority 3 — Levels 9–16

Apply the same P/G/S/E/V approach, combining Society and Encounters only when
the live spatial plan is already stable.

| Order | Region | Non-negotiable outcome | State |
| ---: | --- | --- | --- |
| 9 | Frost Sorcerer | Active chase plus changing moving-siphon/cold phases; Attunement reward; no portal camping. | **built**, owner-accepted |
| 10 | Emberdeep | Coherent inhabited foundry; traveler relay physically changes the furnace route; Companion Command reward. | **built** (Run 3: a real 640-unit descent); **played 2026-09-19 and it was broken** — three datum bugs, fixed in Run 7; re-playtest pending |
| 11 | Ember Colossus | One integrated molten-shot → coolant → forged-slug industrial failure; Downward Strike reward. | **played 2026-09-19**: level cut and rebuilt to owner's notes (7.132.0); **boss phases 2–3 rebuilt** (7.133.0: vertical escape, then three-plate pursuit; see the proposal's "As built"), playtest pending |
| 12 | Inversion | Long unavoidable gravity commitments, ceiling/floor mastery, Zenith Key, two-mouth gravity synthesis. | **played 2026-09-19 and it was UNFINISHABLE**; road and Drop-Lock rebuilt in 7.134.0 and accepted; **now 13,500 wide** — the Path of Inversion added as room 7 in 7.135.0; re-playtest pending |
| 13 | Void Tyrant | Low/middle/high opposed-pair body phases and narrative confirmation. | **played 2026-09-20**: approach rebuilt (Oren gate, a portal puzzle that rehearses the fight, lethal spent line, a shield that needs the Counter, coin route cut) and the fight is now the FIRST HALF — he withdraws rather than dies, and returns in the King's hall (proposal written) |
| 14 | Abyss King | Hardest fair portal-hijack/crown fight, stable retry, final direct ending. | **AUTHORED 2026-09-20** (7.141.0): The Drowned Throne, 12,400, a two-boss level — the Right Hand at its middle and the echo fight at its end. Playtest pending |
| 15 | ~~Gilded Vault~~ | — | **CUT 2026-09-20.** Not a zone, node, recollection or rest site; its campaign slot is inert so later indices keep their numbers |
| 16 | Deep Line | Truth-route synthesis, route signals, Waking Key, and rusty-axe ending. | procedural; now entered from the King and **surfaces at the Ruined Keep's east side** |

**Levels 12–13 are done and unplayed; 10 and 11 were played on 2026-09-19** and
rebuilt to the owner's notes (below, and each charter's OWNER CUTS section). The whole
road from the White Court's Ember Door to the Throne Gate was walked in both directions
in Run 6 and is green (`tests/late-game-road.test.mjs`). The owner's rule from those
two playtests applies to the rest: **every section is mandatory, or it is cut.**

**The Inversion had one on 2026-09-19 and it failed too, worse.** The owner crossed the
whole region without once pressing the flip — every "unjumpable" 400-wide void falls to
jump→dash→double-jump — and then hit a Drop-Lock that **could not be solved by anyone**:
the bin's walls stand to 390 under a roof at 400, and the knight is 44 tall, so the only
mouth that could fill the bin could only be placed inside the sealed bin. The region was
unfinishable, with the Void Tyrant behind it. Rebuilt in 7.134.0: three 900-wide voids
west of the anchor (against a measured 671–774 kit reach), a crumble that is now a
stepping stone rather than a 620-wide corridor with a 0.45 s fuse, the bin's ceiling
raised to 460 with its inner faces left bare, a new ceiling-plate gate, and `Roof()` made
`ceilingOnly` so a roof can never be climbed on top of. Read
`docs/charters/12-inversion/AUDIT-AND-FIX-PROPOSAL.md` before touching that region.
**The rule it leaves behind: a gap can never gate a mechanic — only a mechanism can, and
below ~800 units width gates nothing at all.**

On 2026-09-20 the owner accepted that rebuild and asked for a finish like the jetpack
path of pain, flipped, "about half the size" of the level. **The Inversion is now 13,500
wide**: rooms 1-5 moved EAST by exactly 4,500, the Void Fissure (0-1400) did not move, and
the new Path of Inversion fills 1,400-5,900. **Every pre-7.135.0 coordinate in that region
is its old value + 4,500** — the shift was verified object by object (66/66) rather than by
eye, and the same dump script is the way to do the next one. Two numbers from it worth
carrying: a floor thorn only bites within 30 of the floor, so any bank under ~350 wide is
cleared by a plain jump+dash and gates nothing; and a hazard at the region's ordinary
12-14 damage is a toll, not a gate — a bot that never flipped tanked four banks on it.

**Emberdeep has now had one, and it failed it.** On 2026-09-19 the owner reported
"everything minus Emberdeep — that level isn't working at all". Three defects, all
the same mistake: a literal `0` meaning "the floor" in the one region whose floor is
at 640. The camera framed 354 units of solid rock, the Cinder Ledger floated in the
void under the plateau, and the relay traveler fell out of the world and never
returned — which made the region **unfinishable**, since the gated bridges need her
on a pad. Fixed in Run 7 (`tests/level-datum.test.mjs`); Emberdeep's row below is
now playtest-pending on the FIX, not on the build. Read that run's entry in
`16-LATE-GAME-WORK-ORDER.md` before touching any level that raises its floor.

Each level should be materially longer, more authored, and more inhabited than
its legacy shell. Reuse mechanics and rendering primitives; do not reuse the
same puzzle answer.

## Priority 4 — cross-world integration

After all Base level passes. **Item 1 is done for the late road** (Run 6, 2026-09-18):
every seam from the Ember Door to the Throne Gate crosses in both directions, every
arrival stands on solid ground facing the way its level runs, each of the three verbs
is paid for at a protected midpoint and required before the exit past it, no region
signposts, every recall roster is present, and Continue resumes mid-road. What that
audit found and fixed: Emberdeep's return door was buried 640 units under the plateau
Run 3 raised; the fissure arrival faced the wall behind the player; and Emberdeep's and
the Inversion's rest sites were named differently from their `BFRecovery` contracts, so
both fell back to a ratio and landed in hazards.

**Named and deferred:** the Drowned Throne, the Gilded Vault and the Deep Line all
continue **west, underground**, under the opening regions, so the truth route ends
beneath the Outskirts where the knight actually lies. None of the three is authored yet;
the Throne Gate lands the player at stage 13's procedural west start as a stopgap.

1. Full topology and shortcut audit in both directions.
2. Backtracking reward/economy balance: seven keys, Recollections, quests,
   fragments, Seals, Echoes, Gifts, named gear, shops, and fast-travel anchors.
3. Narrative pacing: clue redundancy, clock progression, memory order,
   commander correspondence, no premature diagnosis, both endings.
4. Completion truth: every authored enemy, coin, and traveler counted; revisits
   may improve but never erase a better record.
5. Checkpoint/death/rest audit across every boss and dynamic mechanism.
6. Dialogue editor coverage for every NPC, sign, item, memory, quest, and ending.
7. Accessibility and presentation: reduced motion, high contrast, larger text,
   captions, remapping, camera, map readability, and hidden-debug/UI review.
8. Performance/device and offline-cache audit.

## Priority 5 — co-op adaptation

Once solo Base is accepted, test on two real devices/processes:

- visible/synchronized partner weapon, projectiles, attacks, cosmetics, Gifts,
  and temporary gear;
- shared enemy health/death and boss mechanisms;
- personal copies of ground/enemy/block loot;
- host-authoritative persistent mechanisms, travelers, quests, portals, fields,
  checkpoints, deaths, and world state;
- unanimous “go” transition handshake with stable join-later/reconnect;
- no unilateral map travel;
- shared endings and separate leaderboard eligibility as designed.

Keep co-op snapshots compact and semantic. Do not synchronize two independent
simulations and hope they converge.

## Priority 6 — NG+ and postgame

Revisit existing deterministic remix laws only after Base is stable. NG+1 and
NG+2 should change learned world rules and authored encounters, not merely scale
health/damage. Validate the NG+2 second-follower Deep Line condition and the
Linewalker cosmetic/Rift Bloom prototype against the final equipment/Gift
boundary. Boss Rush and all four leaderboard categories then receive dedicated
timing/completion audits.

## Deferred refinement backlog

- Upgrade checkpoint visual language and remove redundant pairs.
- Review all remaining random drops/material piles in Levels 9–16 and replace
  them with authored rewards.
- Complete appearance/Gift rebalance across every costume.
- Ensure armor acquisition visibly changes the knight and begins from no armor.
- Expand dialogue editor coverage and make missing registry entries obvious.
- Continue environment-driven lore, varied NPC silhouettes, occupations, and
  state changes.
- Make all environmental fields useful to enemies and reactions, never random
  decoration.
- Redesign each preserved Recollection stage darker/harder while isolating saves.
- Confirm leaderboard archives never reset on full reset and sort correctly by
  pure time versus time plus completion.
- Reassess graphics polish only after geography and gameplay read correctly;
  higher fidelity cannot rescue unsupported or incoherent layout.

## Per-change verification discipline

1. Inspect current runtime and source before editing.
2. State the exact capability prefix and expected route.
3. Build geometry from visible support/containment.
4. Use focused tests appropriate to the change; do not add tests merely to mirror prose or low-impact edits.
5. Add a real input-driven Browser probe for critical traversal/mechanism.
6. Test failure, death, checkpoint, reload, revisit, and stale state.
7. Run relevant checks; use the full suite at integration/release boundaries and report exactly what ran.
8. Bump version/cache when appropriate, rebuild the deploy mirror, run release
   parity, and inspect in the in-app Browser.
9. Record human uncertainty honestly; automation does not prove taste.


## Supporting future-design notes

`docs/frostfell-return-proposal.md` preserves the broader return plan and Gemini
review prompts. Its initial proposal/foreshadowing wording is historical: the
finale and Frostfell activation are now implemented; warning hints were rejected.
Mandatory traversal cannot depend on optional Echo equipment. A boss cannot
require its own unearned reward. Favor active, recoverable boss setups and
forgiving portal capture over waiting or exact-pixel alignment. The existing
pre-Marksman projectile lesson already fulfills that teaching recommendation.
