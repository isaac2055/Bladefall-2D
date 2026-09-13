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
   copy in step. The owner's copy is in iCloud-synced `~/Desktop`, which evicted the
   whole tree once; moving the clone to a non-synced path is recommended, not done.
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

- The recall now reaches Warden, Outskirts, Black Woods and Broken Causeway with
  authored rosters (`MUSTER_ROSTERS`). Still open: the return's rewards, caches
  and shortcuts, and rosters for later regions as they receive their passes.
- Design Frost Sorcerer / White Court with active spell/siphon/cold-state play
  and Attunement, respecting the high-shaft return itinerary.
- Extend the traversal bot with portal placement; that single verb is what
  every level from the Updrafts on stops at. See `TESTING.md`.

Known deferred issues: five unread secondary Echo hooks; the far half of the
White Court aqueduct. Bram, Gilded Instinct and the inert Gifts are resolved.
See `11-RECENT-CHANGES-AND-PLANS.md` and `KNOWN_BUGS.md`.

## Priority 3 — Levels 9–16

Apply the same P/G/S/E/V approach, combining Society and Encounters only when
the live spatial plan is already stable.

| Order | Region | Non-negotiable outcome |
| ---: | --- | --- |
| 9 | Frost Sorcerer | Active chase plus changing moving-siphon/cold phases; Attunement reward; no portal camping. |
| 10 | Emberdeep | Coherent inhabited foundry; traveler relay physically changes the furnace route; Companion Command reward. |
| 11 | Ember Colossus | One integrated molten-shot → coolant → forged-slug industrial failure; Downward Strike reward. |
| 12 | Inversion | Long unavoidable gravity commitments, ceiling/floor mastery, Zenith Key, two-mouth gravity synthesis. |
| 13 | Void Tyrant | Low/middle/high opposed-pair body phases and narrative confirmation. |
| 14 | Abyss King | Hardest fair portal-hijack/crown fight, stable retry, final direct ending. |
| 15 | Gilded Vault | Seven-key combat-free precision platforming route with architectural portal arc. |
| 16 | Deep Line | Truth-route synthesis, route signals, Waking Key, and rusty-axe ending. |

Each level should be materially longer, more authored, and more inhabited than
its legacy shell. Reuse mechanics and rendering primitives; do not reuse the
same puzzle answer.

## Priority 4 — cross-world integration

After all Base level passes:

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
