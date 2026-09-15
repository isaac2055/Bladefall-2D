# Owner decisions and non-regression rules

This is the “do not accidentally undo the hard-won lessons” list. It combines
repeated owner feedback with the current accepted implementation direction.

## Product and scope

- Build the Base single-player journey first. Co-op and NG+ are later adaptation
  projects, not acceptance blockers for current level work.
- The world must feel like one navigable place, not a level-select anthology.
  Physical entrances, exits, and return routes matter.
- Slow the experience down. Exploration, environmental storytelling, NPCs,
  quests, shops, secrets, and backtracking must coexist with optional speedrunning.
- Reuse engine capabilities, not old layouts merely because they exist.
- Do not deploy to Netlify without explicit owner permission.

## Spatial authorship

- Every platform, water body, wind column, hazard, checkpoint, enemy, and pickup
  needs a spatial purpose. Never place unsupported “pools,” random hazards, or
  scenery that contradicts basic physical composition.
- Test the actual route with the abilities available at that story point, at
  normal speed and without test-mode perks.
- Validate both directions wherever backtracking is promised.
- A failed jump or consumed payload must not permanently softlock progression.
  Death, checkpoint reset, save/load, and re-entry must restore solvable state.
- Do not put two checkpoints side by side. Place them around meaningful risk or
  route transitions, and use the authored waystation visual language.
- Missing abilities should simply do nothing; do not print “memory missing” or
  similar control-error text.

## Progression and interaction

- Start nearly powerless: jump first, then weapon, dash, one authored portal,
  independent twin portals, and later traversal powers.
- First weapon pickup uses **R**, auto-equips when no weapon is equipped, and
  teaches the bag later. **I** opens inventory.
- NPCs/signs use **Up** for interaction where that convention is established.
- Equipment found in the world should be intentionally staged and previewed,
  then stored/equipped through the bag. Avoid scattered generic loot prompts.
- Costumes are cosmetic. Attach swappable Gifts/perks separately.
- Use whole Blood reserves (readable hits), not a conventional granular health
  bar or lifesteal percentages that do not map cleanly to the Blood model.
- Critical hits are not universal from the beginning; introduce them through a
  later Gift, weapon property, or progression reward.
- Each level should offer a sealed Recollection discovery, visibly tracked but
  padlocked until the endgame key unlocks the darker remixed original campaign.

## Dialogue and story presentation

- Show rather than explain. Datura flowers, clocks, military echoes, environmental
  correspondences, and sparse memories should let the player infer the truth.
- Clues may be ambiguous but not needlessly cryptic. The player should understand
  immediate objectives even when the larger meaning remains uncertain.
- World text must be short, spatially anchored, discrete, and non-overlapping.
  It disappears after leaving its relevant spot and can be read again with Up.
- Dialogue boxes should visually distinguish people, signs, items, waystations,
  and major persistent messages.
- Major reward/defeat text waits for dismissal or remains long enough to read.
- The opening uses text over a thematic non-spoilery background with Outskirts
  music quiet beneath it, then fades to the normal level mix.
- Pause/map screens retain the current level's music; checkpoints do not swap the
  exploration track unless a real boss/scene transition requires it.
- NPC dialogue lives in the centralized dialogue/editor data path so the owner
  can revise prose without hunting through game logic.

## Combat and enemies

- Enemies that have seen the player must commit to believable action. They
  should not stare, turn away, or stop immediately beside the player.
- Enemies may traverse authored ledges when chasing, but should avoid blindly
  walking into bottomless pits. Spike resistance prevents offscreen self-kills
  without making enemies immobile.
- Shield enemies need a readable turn delay after the player crosses them so the
  back-hit opportunity is real.
- Projectiles and charged hits deal Blood damage; ordinary contact must not
  teleport the player to the checkpoint unless the hazard is explicitly lethal.
- Boss defenses should answer hiding/portal cheese while preserving readable
  counterplay. Difficulty should come from learning a coherent move set, not
  chaos, instant damage, or inaccessible attack angles.

## Portal puzzles

- No level should merely repeat an earlier portal verb, add a second copy of an
  old puzzle, or reuse a cannon without a new relationship.
- Use portal placement, sightlines, momentum, payloads, enemy/body targeting,
  temperature, followers, barriers, gravity, and hijacking in distinct integrated
  combinations.
- Include plausible decoy surfaces where appropriate. The answer should be
  inferred from geometry and behavior rather than painted as an obvious target.
- Give the player both portal mouths in spaces that genuinely use that freedom.
- Portal payloads require recovery/reset paths and generous enough collision
  margins to avoid edge catches.

## Accepted boss/level anchors

- **Hollow Marksman:** current balance is owner-approved and should be treated as
  frozen absent a specific request. Its learn/practice/master arc is the quality
  reference for later bosses.
- **Ruined Keep:** preserve the independent-portal identity, two Belfry payload
  routes, Mason's Grip reward, Archive wall-jump proof, Keep Key, and westward
  return. Do not restore earlier impossible fling/platform geometry.
- **Warden:** preserve the three Turning Cells, portal-dependent opposed-cross
  phases, portal attacks, Counter reward, and Frostfell seam. Improve only with
  evidence; it must eventually exceed Marksman in depth without copying it.
- **Void Tyrant target:** three positional portal phases—low legs, middle torso,
  high head.
- **Abyss King target:** portal hijacking and crowns; direct completion gives the
  death ending, while the Deep Line route enables the rusty-axe survival ending.

## Audio anchors

- Exploration music remains consistent across a non-boss level and resumes after
  pause/checkpoints without changing tracks.
- Use the supplied light/ethereal Cozy Tunes tracks for exploration and selected
  interiors, darker exploration sparingly, and dedicated combat music for bosses.
- `BGM 13 Tides of the Serpent` is reserved for the second-to-last boss; the old
  original full-game track is reserved for the final boss.
- Avoid repetitive chainmail landing sounds and other high-frequency effects that
  fatigue the player.

## Verification truthfulness

- A DOM inspection, coordinate jump, debug state mutation, or automated assertion
  is not equivalent to playing the route.
- For traversal and boss claims, use the in-app Browser with real key input when
  available; document any portion that was only structurally verified.
- Never report a route “playtested” unless the ordinary player sequence was
  actually completed.
- Level select must grant exactly the abilities/items a normal playthrough would
  have on entering that level, and rewards must persist whether earned through
  campaign or level-select testing.
- Turning test mode off must remove temporary movement, dash, jetpack, and other
  test-only entitlements.

## Latest owner decisions — September 2026

- The opening through Warden is complete in substance. Later polish is separate;
  do not add unrequested mechanics or difficulty changes to a targeted repair.
- Warden phase-three crashes consume each pair and remove only the two specified
  lure platforms, one per first/second crash. Keep pillars and rotors moving.
  Third crash immobilizes him with a ranged player-targeted AOE until a final
  weapon hit. Sentence damage is one Blood with no checkpoint teleport.
  Communicate damage visually, without `1/3` labels.
- Bram is invulnerable, has no health hearts, and uses a larger damaging truth-lamp.
  Distinguish false/invisible footing visually; no explicit solution labels.
- The Outskirts Sentinel requires an explicit challenge. Western spring/draft
  obey the Keep seal. Keep the real startup and westward return solvable.
- The Updrafts harness remains stage-local but usable on a legitimate revisit.
  The Rain-Catcher lift can already be open before Keep; don't relock it.
- Gilded Instinct is implemented (2026-09-11, on request): standing still makes
  unclaimed caches, keys and sealed memories glint. It reveals only what exists;
  never let it invent treasure or replace level readability.
- Frostfell's substantial exposed Double Jump finale and local Muster activation
  are implemented. The military escalation is a surprise, without warning hints.
  Owner decision 2026-09-13: the recall must be felt in every region — the
  general enemies beefed up once across all maps (health, damage, awareness),
  more of them, and a unique new enemy per map — not a few posts. The first
  four-region implementation was rejected as not noticeable. `12-RECALL-WORK-ORDER.md`.
- The mine uses Up at both ends, not held-direction boundaries. Summit use adds
  the third service stop; require a fresh Up press for each cycle leg.
- Muster is persistent and idempotent: no repeated HP stacking on reload, no
  duplicate roster, boss revival or reset of solved gates/NPC progress. Protect
  inhabited safe sites. This never meant "no buff": a one-time world-wide buff is
  required (2026-09-13).
- Larger Frostfell hulks are intentionally two-Blood threats, not instant-death
  checkpoint hazards. Keep their distinct silhouette and ordinary telegraphs.
- TAS setup/state access stays opt-in. Float movement checks use tolerances;
  deterministic serialized replay checks deliberately require exact identity.
- Future design prompts do not override ability order: no compulsory optional
  Echo, no unearned boss-reward requirement, no duplicate Marksman tutorial.

## Run 1 preservation rules

Preserve the single first-garrison transaction for ordinary enemies, with no
boss/unique revival and no stat stacking. The implemented tuning defaults are
×1.55 health, ×1.25 raw damage, minimum 480 notice; two-Blood hits are explicit
large-unit attacks rather than a change to all Blood wounds. Regional identity,
early encounters and safe settlement space matter alongside density. See
`12-RECALL-WORK-ORDER.md`; run 2 and run 3 are separate work.

## Run 2 bot evidence boundaries (2026-09-14)

- Require full serialized simulation equality for a solve pass, not only player
  state. Repeated bootstraps reset registered subsystem counters too.
- Keep saved route inputs portable and replayable; replay success is separate
  from a successful solve. Preserve exact failed segments and mechanism attempts.
- Portal/flight/pickup/crystal probes prove their scoped routes. They do not prove
  every later puzzle, boss combat, or a continuous campaign. No gameplay changes
  were needed for run 2. See `12-RECALL-WORK-ORDER.md`.
