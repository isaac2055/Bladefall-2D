# 16 — Late-game work order: the heat chapter, the Inversion, the Paradox Citadel

Written 2026-09-18 by Fable for Opus, from a read-only review at 7.123.0 / cache 212.
Owner's brief: fix up Emberdeep, the Foundry (Ember Colossus), the Inversion and the
Void Tyrant so the game follows its intended progression, matches the drawn world map,
keeps the design philosophy, and is fun. Read this file, `02-MASTER-VISION.md`,
`13-V4-RESPEC-WORK-ORDER.md` §3 and `USAGE-POLICY.md`. Do not read the whole folder.

Work in the order below. One run = one numbered section. Stop at every **STOP** line
and report; do not roll into the next run without the owner. Never deploy. Do not
commit unless the owner asks (Run 0 asks for it explicitly).

## 0. Ground rules for every run

- **Anchor by name, not by line number.** index.html is ~22,700 lines and moves. Find
  `const EMBERDEEP_LEVEL=`, `function physicalSeamSpec`, `function setupFoundryBoss`, etc.
- **Geometry is checked against shipped TUNING, never by eye.** Double-jump ceiling is
  154.6 units of rise; the widest flat double-jump gap is 355. Every authored tier needs the
  "can be stood on / can be reached" test that `tests/emberdeep-stage.test.mjs` already has.
- **Teach, test, combine, breathe** (master vision, pacing rules). A boss's core verb must
  appear twice in its level first: one safe isolated lesson, one mixed environmental use.
- **No signage, no banners, no loot carpets, no bag.** Tells are geometry first, colour
  second, motion third. One speaking resident per region, lines under 15 words, Up to talk.
- **One hot colour, one meaning.** In the heat chapter orange-white means "live heat that
  can hurt you within a second". Decoration is dark rust. Cold stone, quench, set seams and
  steam are blue-white. Never signal a cold event with orange particles.
- **Big shapes for decisions, small shapes for flavour.** A state the player must act on is
  never thinner than 3 buffer pixels or smaller than 6x6.
- **Everything new is pixel-drawn** in `public/bladefall-respec-renderer.js`. No new legacy
  vector drawing inside the pixel frame. The classic renderer cannot show heat states, flip
  or the new fights: in stages 9-12 force v4 (`useRespecRenderer` returns true regardless
  of `meta.rendererMode`) and say so in the Settings label ("Classic: stages 1-9 only").
- **Testing in the hidden preview pane.** rAF is paused and the canvas is 0x0. Before any
  scripted check: `mainCanvas.width=1280;mainCanvas.height=720;recalcVP();` then
  `beginRun(0,null,{hp:1,dmg:1},{intro:false}); loadStage(i);` then step `update(1/60)` in a
  loop, keep the hero alive by resetting hp/blood/invuln each step, call `render()` once,
  screenshot. Re-fetch `G.p`/`G.boss` after any respawn. Never use TaskOutput on agents.
- **Tests:** add one focused `tests/<region>-stage.test.mjs` (or extend the existing one)
  per run; run only focused suites. ~20 legacy browser/TAS failures are pre-existing.
  VM harnesses that slice index.html need `V4_LAST_STAGE`/`v4Region` in context, and
  `tests/emberdeep-stage` slices from `const EMBERDEEP_LEVEL=` to `\nconst CUSTOM_LEVELS=`,
  so keep new level consts ABOVE the Emberdeep block.
- **End of each run:** bump VERSION and sw cache, `./build-deploy.sh`, update
  `NEXT-MODEL-BRIEF.md` (short) and the progress log at the bottom of this file.

## The shape of the late game (the thing every run serves)

The drawn map (`DREAM_MAP_LAYOUT`) is the owner's intent. The top row runs east to the
Foundry. Then the road goes **down** into the Inversion, **down-left** to the Paradox
Citadel, and **left** along the bottom row to the Drowned Throne, the Vault and the Deep
Line, which ends beneath the Outskirts, where the knight actually lies. The last third of
the game is a return journey under the first third. Levels must be traversed the way the
map draws them:

| Stage | Enter | Travel | Exit |
|---|---|---|---|
| 9 Emberdeep | west door, high | east, then a real stair down | east edge, low |
| 10 Foundry | west, ground | east | **down** through the floor at the east end |
| 11 Inversion | **top-right, falling in** | down and left | bottom-left edge |
| 12 Paradox Citadel | **east gate** | **right to left** | west gate, after the Tyrant |
| 13 Drowned Throne | out of scope | unchanged for now | unchanged |

Precedent: the Gaol (stage 6) is already right-to-left by data (`spawnX:14480`,
`bossX:1500`, `build(){G.p.face=-1}`), and Black Woods to Updrafts is a height-triggered
seam (`updateBlackWoodsWindShaft`). Copy those patterns; do not invent new systems.

---

## Run 0 — Safety and records (short)

1. Ask the owner for a checkpoint commit on `chore/track-authoritative-tree` (36 modified
   + 25 untracked files, including the whole pixel renderer, are uncommitted since
   2026-09-15). No push to main, no deploy.
2. Refresh stale records: `03-LEVEL-BY-LEVEL.md` §11 still describes the deleted
   cannonball fight as current; `NEXT-MODEL-BRIEF.md` has nothing for 7.118-7.123 (the
   "Last Pour" rebuild, the Inversion grant and seams, the Citadel seams, V4_LAST_STAGE=12).
3. Fix three live regressions that make things worse than before, each a few lines:
   - Tyrant pair-alignment readout is wrapped in `if(!quietV4)` inside `placePortal`.
     Exempt it: `if(!quietV4||(G.boss&&G.boss.paradoxFight))`.
   - Boss chest/key gating on `stageIndex>V4_LAST_STAGE` removed the Tyrant's weapon
     reward path. Grant the stage-12 reward directly on the kill (no chest, no bag),
     the way the White Court grants Attunement.
   - `hall()` in the renderer calls `alphaWrap(.9)` which SETS alpha, defeating the .22
     arena dim. Make `alphaWrap` multiply the current alpha (check every caller renders the
     same when the outer alpha is 1).
**STOP.**

## Run 1 — The Ember Colossus: readability, the pound, and a body worth the name

Rules of the fight stay ("The Last Pour": beat its arm to the mould, set it cold, the pour
is refused; progress = `forgeQuenches`, 8 to win). This run changes what the player SEES
and trims what they must hold in mind. Source: `setupFoundryBoss`, `installFoundryBed`,
`updateColossusForge`, `colossusBankBed`, `beginColossusPour`, `resolveColossusQuench`;
renderer: `drawColossusFigure`, `drawHeatStone`, `drawFoundryAOE`, `drawAmbience`.

**1a. Show the target.** Today nothing marks the banked mould during the walk (the
renderer never reads `forgeTargetBed`). Give the spouts to the boss for the fight:
- During `forgeFight`, the four authored spouts stop their own clock. Add two spouts so all
  six bays have one. The spout over `e.forgeTargetBed` **gathers** (bright bead growing,
  housing lit) from the moment of banking; all others are dark. On release the column
  falls from that spout. Spout columns stop hurting on the bed clock during the fight.
- The banked mould also gets a 3px amber rim from banking, not only from wind-up.
- The hammer target (1c) uses the same language in a different shape: a **shadow**.

**1b. Put the Colossus behind the bed and make it colossal.** Drawing only; AI and
collision are unchanged (it still walks x on the pit floor). Draw the figure at ~2.2x
(about 185 wide, 250 tall) on a layer BEHIND the casting bed and platforms, so head and
shoulders rise above the bed line and it reads as a smith at a bench with the player on
the bench. Dark iron body, no ambient body glow; the only white-hot parts are the core
seam and the pouring arm's lip. The arm now comes **over the top** and pours down into the
mould from the player's side of the screen. On a jam (grade 1.0) the arm sticks in the cold
mould at bed height for the 1.6s expose window, so expose melee happens on the bed; remove
the need to drop to the pit floor. Keep contact damage off the drawn-behind body.

**1c. The pound.** Two pounds exist; fix both.
- *Player's Downward Strike* (`slamImpact`, called "Ground Slam" in code): add a dive pose
  to the pixel hero (`heroState` must read `p.slamming`): blade down, cloak streaming up,
  a 3-ghost afterimage column. On impact: 3 frames of hitstop, a pixel shock ring that runs
  left and right ALONG the struck surface for one slab width, 8-12 chips in the surface's
  own colour at 2-4 px. Replace the legacy gradient ellipse and the 30 large orange/gold
  squares. When a mould sets: blue-white quench wave along the slab, steam puffs rising,
  the set seam appears; no orange anywhere in that effect. On a cap: same, smaller.
- *The Colossus's blow* (the `hammerWind` beat): it must walk until it stands behind the
  mould you are on (give it a reach of one bay; no more global range). Tell = its fist
  rises above you and a hard-edged shadow darkens your mould for the full 0.85s. The mould
  re-melts ON impact, not before the warning. Debris comes from the slab, at slab height
  (the shared slam code spawns particles at `GROUND_Y-10`; pass the AoE's `y`). The shock
  travels one bay each way as a visible ring the player can jump. On set stone the fist
  rings off with a cold spark and a bell-like clank, and the boss recoils (0.55s).

**1d. Quiet the room during the fight.** Embers: halve the count in the arena, never draw
motes over the bed band, and fix the jump on wind-up (integrate drift per frame; do not
multiply absolute time by a changing speed). Fix the duplicated `case 'trap'` in the
renderer so `drawSlagBlock` is reachable. Remove damage-number popups in this fight.
Convert the boss shot to a pixel projectile. The forge panel becomes a plain 8-pip gauge
with 5x5 pips. Hall, crane and heap dim correctly once Run 0's alpha fix is in.

**1e. Trim the rule count.** Remove the shieldbearer add and the slag rain from the fight.
Belts in Act II stay but do not reverse on a timer (direction flips once, at the act's
midpoint, with a 1s stall as the tell). Keep the Act III pour front and the Last Order.
The coolant jet stays only because Run 2 teaches it; if Run 2's sluice room is cut, cut it.

**1f. Bugs.** Striking the finale lid before `forgeBeat==='last'` shatters it for good and
appears to make the fight unwinnable that life: make the lid unbreakable until the Last
Order begins. The `bed.pourCapped` branch in `releaseColossusPour` is dead; either delete it
or make a cap still drop the pour at your feet as the plan intended (prefer delete).
Remove the dormant wet-forge pipeline from this fight (`coolMoltenShot` path, `forge.boss`
hookup, hot/flash states in `drawForgeCoolantV4`).

Acceptance: from a cold start a player can tell which mould is next within one second of
banking, in greyscale; a screenshot at any beat has exactly one dominant figure; the pound
reads cause then effect; scripted run reaches all acts and the kill; tests in
`tests/ember-colossus-boss.test.mjs` updated. **STOP for owner playtest.**
Fallback if the owner rejects 1b: keep the floor-walker, scale 1.5x, keep everything else.

## Run 2 — The Foundry: teach the fight, use the kit, leave through the floor

Keep: the local rule ("here you make ground"), belts, strike-to-set, casting caps, Oren,
the recollection, the ledger, density >= 6 per 1,000 units. Rebuild rooms 2-4 and 6.

**The teaching chain (new primitive: the ladle).** A small unmanned pouring ladle on an
overhead rail. It travels to a mould, gathers, pours. If the mould is set cold when it
pours, the ladle jams: it recoils, vents steam, and **stays jammed**. Same code path as the
boss's refusal where possible (`pourArm`, `heatSet`, a `ladle` object with a rail span,
targets and a period). The spout-gathers tell from Run 1a is reused exactly.
1. **The Anvil (teach, safe floor).** After the grant, the way on is a counterweight gate
   held open only while one mould is solid; a single ladle keeps re-melting it. Set the
   mould, the ladle jams, the gate's weight drops for good. First strike is REQUIRED. Miss
   = wait one cycle. Then the three-slab climb, made real: those slabs are cold for under a
   second, so an unset slab cannot be chained; setting them is the only way up, over a
   catch floor. The coin moves to a side perch.
2. **The Casting Line (test).** One ladle, three moulds in a row across a belt crossing.
   The ladle visibly travels to its next mould; jam it twice (two different moulds) to
   stall the belt that otherwise carries you back. This teaches reading the target.
3. **The Mould Hall (combine, two planes).** You on a bed of four moulds; below you a
   walking feeder, the Colossus in miniature, banks and pours from beneath, with no shots.
   Jam it three times and it seizes; its wreck is the step up to the arena overlook.
   Keep the sealed-mould cache as the optional cap-breaking reward.
4. **The Sluice (portal lesson, replaces filler in the hall's east end).** The heat
   chapter lost its portal puzzle when the cannonball circuit was deleted, and the Foundry
   currently has no slate before the arena. One room: a water header, two slate faces, and a
   mould whose setting window is too short to strike. Route the coolant jet through your
   pair onto the mould and it holds in SETTING; strike it. This is the Act III answer, and
   the constitution's "carry the cold to the stone" noun. Broad catch area, no pixel hunt.

**Use the kit.** The player owns dash, wall jump, double jump and both mouths. Add
vertical structure: at least 8 rune-faced walls across the region, one wall-jump chimney
beside the casting line (the dry route), the overlook reached by a climb. Target: 90% of
platforms at or below ~450, highest ~650 (today 310 / 420).

**De-template.** Rooms 2 and 4 currently mirror Emberdeep's basins down to coordinates
(basin at 4450/4500 with a dry high line and coin at centre; identical flat exit
corridor). After this run no room in the Foundry may share a skeleton with Emberdeep.

**The exit goes down (room 6).** Replace the flat corridor and door prop. The Fissure is a
cracked casting floor at the east end, sealed by three casting caps in the GROUND. Break
through with Downward Strike (the connector already requires it) and fall. Engine:
- In `update`, before the void check, for stage 10 inside the fissure's x band and
  `p.y < -40`, start the `colossus-inversion` crossing (pattern:
  `updateBlackWoodsWindShaft` + `beginPhysicalBranchTransition`). Exempt that band from
  `pit`/void rewind. Boss-alive guard stays.
- `bladefall-zones.js` seamSpecs: `colossus-inversion` becomes ember-colossus `south`
  `plunge` to inversion `north` `emerge`. Fix the progression grid rows to match the drawn
  map. Update any zones/progression tests that pin the old sides; keep the bidirectional
  invariant green (the way back is Run 4's return shaft).
- `compatibilityZoneArrival`: add overrides for both ends (today the Inversion arrival lands
  mid-level at ratio .35 and the Foundry return at ratio .62).
- Remove the stage-10 east-edge forward branch from `physicalSeamSpec`.
The Furnace General recollection sits on a ledge inside the fissure mouth, visible as you
fall, reachable by wall jump from the lip.

Acceptance: a fresh player cannot reach the arena without having jammed a pour three
times; focused tests assert "strike required" (no route past the Anvil gate without
`heatSet`), ladle/spout share one clock, fissure seam fires only after the kill and only
inside the band, arrival overrides exist. **STOP for owner playtest.**

## Run 3 — Emberdeep: a descent, not a corridor

Keep: the pour clock (heat slabs, slag, spouts on one period), Oren inheriting the clock,
the Draw, the Held Bridge, the Pour Floor and the SEND order, the recollection. It stays
left-to-right because the map draws it east.
1. **Raise the datum, then descend.** Author rooms 1-5 on a plateau at y=640 (add a
   `GrAt(x1,x2,y)` helper = deep plat at height; re-base every y in the level through one
   `const ED=640`; lava basins, void handling and catch floors move with it). Room 6, the
   Deep Stair, becomes a real 640-unit descent to y=0 over ~2,000 units: worked stair
   flights, two wall-jump drops, slag steps and one heat-slab run on the way down, with a
   recovery landing per flight. Block the space under the plateau. Arrival overrides:
   `sorcerer-emberdeep` lands at (330, ED); the east seam stays an edge walk at y=0.
2. **Interior backdrop (renderer).** Underground regions must not show sky. Add a
   per-level `interior:true` mode: tiled rock-wall parallax not anchored to the ground
   line, no abyss gradient, deep slabs drawn only to their own depth when a lower room
   exists, and y culling. Use it for stages 9, 10, 11. (Three of the current ground-line
   assumptions are Fable's prototype scaffolding; replace them, do not work around them.)
3. **Break the shared skeleton and use the kit.** Rework room 2 (the Pour Schedule) into a
   two-tier space: the low line is the slab rhythm, the high line is a wall-jump and dash
   route over the spouts that is faster but exposed to slag. Add >= 6 walls region-wide.
   Target heights: 90% of platforms within 450 of the local floor, highest ~650.
4. **Enemies that use the clock.** Replace three of the six plain emberlings: two
   slagwrights (lob slag that lands as a burning pool, then cools into footing) and one
   cinderling pair (burn out where they die) promoted from recall-only to ordinary
   residents, tuned gently. Encounters sit beside a slab run so the fight and the clock
   interact. Keep all `noDrop`.
5. **Foreshadow the Foundry without a verb.** In the Deep Stair, one dead ladle jammed in a
   set mould with slag frozen up its arm. No text. It is what the player will do next.
6. **Checkpoints:** 12 is too many for "sparse, intentional". Target 7: one per room plus
   one mid-stair. Every heat run keeps a catch floor instead.

Acceptance: metrics script (platform heights, walls, enemy types) shows the targets;
reachability test green after re-basing; Continue/checkpoint positions valid at the new
datum; interior backdrop shows no sky at any camera position. **STOP for playtest.**

## Run 4 — The Inversion: the vertical level

Discard the unbuilt horizontal charter's layout (keep its rule, numbers and errata). The
old 8,400 level, its procedural coda (`customExtension:2600`, `spGravity`, both weapon
pickups, five signs) and the unconditional `populateVoid` enemy spawn are deleted. Set
`authoredEcology:true`, catalog `len` = level `len`, `source:'custom'`.

**Rule of the place:** there are two floors and you may owe only one at a time. Owner
default: the flip stays one world switch and walkers follow the player's gravity (engine
cheap), but it must be READABLE and crates stay the exception the puzzles use.

**0. Renderer first (the core mechanic is currently unreadable in v4).** The pixel path
has zero handling of `G.gravityFlipped`: flip the hero and every non-flying walker about
their own box; draw platform caps on the side that is currently "floor" and roots/hanging
detail on the other; on a flip, a half-second whole-screen tell (motes reverse, a soft
vertical smear) and the camera re-frames so the surface you now owe sits in the lower
third of the screen (mirror `verticalThreshold` when flipped; add fall look-ahead from
`vy`, which also helps Runs 2 and 3). Clamp the 200,000-wide ceiling plat when drawing.

**1. Shape.** About 9,000 wide by 1,500 tall, entered at the top-right, left at the
bottom-left, played right-to-left and downward as a diagonal of terraces. Every room owns
its own x-span AND height band (rooms are x-spans in the engine, so never stack two rooms
at one x). Stay inside the survivable band: highest content y <= 1,500 (upper kill plane
is 2,000), nothing below y=0. `spawnX`/`spawnY` top-right, `build(){G.p.face=-1}`.
**2. Rooms** (design intent; derive coordinates from TUNING):
   - *The Fall In* (top-right). You drop out of the Foundry's floor onto a landing terrace.
     Shelter, Oren, the plinth lore. The return shaft is here: a rune-walled chimney plus
     open air, so the way back up is a wall-jump climb now and a fall-up later. The return
     seam is a height threshold in this band (wind-shaft pattern), keeping the connection
     two-way as the zone rules require.
   - *The Unreachable Line.* A stepped descent under low overhangs that steal your jump;
     a coin on the underside of a terrace you cannot owe yet.
   - *The Reversal* (protected midpoint). Gravity Flip granted on safe ground
     (`claimInversionMemory` exists; move its anchor here). First use: the stair down is
     broken; flip, fall up to the underside of the terrace above, walk left across it past
     the break, unflip, drop. That switchback is the level's grammar.
   - *The Polarity Gauntlet.* Four switchbacks that escalate one thing each: a crumbling
     roof perch, `{ceil:1}` teeth, a moving roof shelf, a wrong-way belt. Long enough that
     dash and double jump cannot skip a flip.
   - *The Drop-Lock* (the region's portal puzzle, hand-authored, no pickup reward).
     Crates do not flip. One mouth on a floor slate, one on a roof slate: send a crate
     through so it falls UP relative to you and lands on the roof plate that opens the way
     down. Broad receiver, automatic crate recall, one plausible decoy surface.
   - *The Void Fissure* (bottom-left). The Upside-Down Road recollection under a roof shelf
     reached only flipped; the Zenith Key sanctum if the vault-key chain expects it here
     (check `BFSecretsModule`); then the west-edge seam to the Citadel.
**3. Seams.** Forward seam: west edge at y=0, `x<=62 && face<0`, `requires:'gravity-flip'`.
   Back seam: the height threshold in the Fall In. seamSpecs: `inversion-tyrant` becomes
   inversion `west` to void-tyrant `east`. Arrival overrides for all four endpoints.
**4. People, recall, tests.** Oren only. `MUSTER_ROSTERS.inversion` with the `keelman`
   flyer unique from the charter. New `tests/inversion-stage.test.mjs`: no portal, no
   signs, flip required by geometry (no flip-free path from grant to exit), grant at the
   midpoint, every tier standable in the orientation it is used, rooms never share an x.
**5. Eight enemies maximum, authored, `noDrop`:** favour flyers and ceiling crawlers whose
   behaviour differs by orientation; no generic 23-body void population.

**STOP for owner playtest.**

## Run 5 — The Paradox Citadel: mirrored, authored, and the fight made readable

The fight's maths is good groundwork and stays byte-for-byte: `TYRANT_PARADOX_BANDS`
(legs 48 / torso 178 / head 302), `tyrantPairStatus`, `chargeParadoxOrb`,
`advanceTyrantParadox` (three hits, each clears your pair and escalates). Region rule from
the charter stays: **every answer is spent by being right.**

1. **Author the level from the charter, mirrored.** `docs/charters/13-void-tyrant/
   DESIGN-PLAN.md` plans six rooms west-to-east over 17,000 units. Build the same rooms
   **east-to-west**: spawn at the east gate (arrival from the Inversion's bottom-left),
   Fissure Mouth, Rising Ledgers (the latched-plate void crossing), Opposed Faces (the
   arena's exact geometry rehearsed as traversal, no enemy), the Spent Line (same pair
   raised, climbing is the price), the Paradox Vigil (rest under a roof you break by
   standing on it; an overlook that shows all three band heights), then the arena at the
   WEST end with the Throne Gate beyond it. Gaol pattern: `spawnX` high, `bossX` low,
   `build(){G.p.face=-1}`, enemies authored with facing toward the arrival.
2. **Arena by absolute coordinates** (`setupParadoxBoss`, early return in `bossArena`'s
   tyrant branch, like `setupFoundryBoss`): the legacy branch is left-biased around `bx`
   and purges obstacles. Note `applyFinaleActRemaster` deletes every `lowg`, `updraft`,
   `gravityWell` and `rotor` in stages 12-13, authored or not: gate it off for authored
   levels. No arena sign.
3. **Seams.** Back seam at the EAST edge to the Inversion. Forward seam at the WEST edge
   (`x<=62 && face<0`) only after the Tyrant is dead, no `requires`. seamSpecs:
   `tyrant-king` void-tyrant `west`. Stage 13 is still procedural left-to-right, so keep a
   `compatibilityZoneArrival` override that lands the player at its west start (x=240)
   until the Throne gets its own run. Fix the seam failure nudge (`p.x+=spec.forward?-48:48`
   assumes forward means east).
4. **Camera for leftward play** (`public/bladefall-camera.js`): the anchor is fixed at
   .38 of the view from the left, so moving left shows about 620 units ahead against 930
   moving right. Make the anchor follow travel direction with easing; keep
   `tests/camera.test.mjs` green and add a leftward case. This also improves the Gaol.
   Make the progress bar route-based or hide it in right-to-left stages.
5. **The fight in pixels.** Add `case 'tyrant'` to `drawBossFigure` (today it falls to a
   legacy blob over pixel rings): a tall crowned figure whose three bands are physically
   distinct (greaves, cuirass, crown) and whose LIVE band is lit, so the target height is
   on the body. Port the LOW/MID/HIGH band guide to the pixel path as three faint rails
   across the arena at 48/178/302 with the live one bright. Alignment feedback: when both
   mouths are placed, draw a line between them; it snaps bright and straight when
   `tyrantPairStatus().ok`, sags and dims when not. No text needed. Generous bands stay.
6. **Story payload.** `right-hand-seal` (the memory that flips the story to "confirmed")
   is placed nowhere in the runtime. Place it in the Vigil as a found object. The Hollow
   Crown recollection goes beyond the arena, before the Throne Gate. Oren only; twelve-row
   `void-tyrant` Muster roster with the `crownguard` unique from the charter.
7. `tests/void-tyrant-stage.test.mjs`: authored and mirrored (spawn x > boss x), no portal,
   no signs, arena geometry equals room 3's geometry, forward seam closed while the boss
   lives, reward granted without a chest, `right-hand-seal` obtainable.

**STOP for owner playtest.**

## Run 6 — The whole road, once

A bounded continuous traversal from the White Court's Ember Door to the Throne Gate on a
fresh save and again by Continue mid-way: every seam both directions, every arrival on
solid ground facing the way the level runs, abilities granted in order (Companion
Command, Downward Strike, Gravity Flip) each at a protected point and each REQUIRED before
its boss or exit, no sign or banner, music continuity, recall rosters present. Then update
`03-LEVEL-BY-LEVEL.md`, `05-REMAINING-WORK.md` and the brief. Out of scope and named for
later: the Drowned Throne, the Vault and the Deep Line all continuing west under the
opening regions so the truth route ends beneath the Outskirts.

## Owner defaults baked into this plan (veto any of them)

1. The Colossus stands behind the bed at ~2.2x (Run 1b). Fallback given.
2. Its blow becomes a physical fist with a shadow tell rather than being cut (Run 1c).
3. The coolant jet is taught in a Foundry sluice room rather than cut (Run 2.4).
4. In the Inversion walkers keep following the player's gravity; crates do not (Run 4).
5. Classic renderer is locked out of stages 9-12 because it cannot draw them.

## Progress log
(append one dated paragraph per run: what landed, what was verified and how, what was cut)
- 2026-09-18 (Opus, Runs 0-1). Run 0: the three regressions are fixed as written.
  The checkpoint commit was NOT taken — the owner was not asked in-session, so 36
  modified + 25 untracked files remain uncommitted since 2026-09-15. Run 1: all of
  1a-1f landed, with two deliberate deviations. (i) 1a said add two spouts so all six
  bays have one; `installFoundryBed` deliberately omits spouts over bays 1-2 because
  the coolant header stands there and a feed pipe through a water tank reads worse
  than none. The tell therefore lives on the MOULD (collar + chevrons, geometric, so
  it survives greyscale) and the spout only agrees where one exists. (ii) The spout
  no longer pours a column during the fight at all — at 2.2x the column and the body
  occupied the same air. The ladle on the arm delivers; the spout gathers. This also
  matches the boss plan's own rule that the arm, not the spout, is the pour.
  Discovered and fixed in passing: the renderer script tag was pinned at v7.111.0.
  Parked for Run 2: `spawnFoundryOrphan` is now uncalled — give the "one body" beat
  to the Mould Hall feeder rather than losing it. Version 7.124.0, cache v213.
  NOT DONE from Run 1: the hammer's shock does not travel a bay each way as a
  separate jumpable ring (the AoE keeps its 104 radius and the drawn track);
  `updateLastOrder` still pours on its own 1.6s wave with no boss pose.
- 2026-09-18 (Opus, Run 2). The Foundry is rebuilt around the fight's own sentence.
  NEW PRIMITIVE: the ladle (`Ladle()` in the level data, `updateFoundryLadles` in the
  engine). It travels a rail to a mould, GATHERS over it — one frame of `pourHold`,
  renewed, which is the same field the Colossus's arm uses and which `updateHeatStone`
  already reads as SETTING — then pours. Open stone fills (phase reset + a pour AoE);
  stone you set refuses (`jamLadle`), and `seizeAt` refusals stop it for good. An
  aimed mould sets `o.ladleAimed`, which `bankedCollar` now honours, so the region and
  the arena wear ONE tell.
  ROOMS 2 AND 3 ARE SWAPPED, deliberately and against the charter's old table: the
  work order's chain makes the Casting Line the TEST of a verb the Anvil grants, and a
  test cannot precede its grant. Room 2 is now the Anvil (2800-6200), room 3 the
  Casting Line (6200-9200). The charter's table is updated to match.
  1 ANVIL: gate is a `door` with `foundryAnvilGate`, held open by `anvilMould` being
  solid (`doorOpen`). Measured live: across 12s untouched the gate is open for 0.00s,
  because the ladle's pours keep resetting the mould's phase; the mould reads SETTING
  for 6.0s and wears the collar for 8.8s, so the strike is always on offer. Striking
  opens the gate; the ladle's next pour jams, seizes, and drops the weight.
  Climb: three slabs cold for 0.62s each over the room's own catch floor.
  2 LINE: one ladle, three moulds standing in a belt that runs WEST. Verified two
  refusals on two different bays (7780, 8260) seize it and stall all four segments to
  belt 0. A wall-jump chimney is the dry route onto the crossing's middle.
  3 MOULD HALL: bed of four at y=200, a walking feeder below on `railX1..railX2`.
  Verified three refusals seize it; it slumps east to 11040 and leaves a 210-wide
  wreck at y=130. Between the bed's east edge (10832) and the east bank (11200) there
  is no other authored footing, so the wreck is load-bearing — the acceptance rule
  ("cannot reach the arena without three jams") is geometry, not a flag.
  4 SLUICE: the chapter's portal room. Mould window 0.23s (`molten:.90,set:.95`);
  unaided it is solid 0.93s in 10s and never long enough to cross. With a mouth in the
  header and its partner on the slate beneath, one water jet holds it SETTING 100% of
  the time; a slam makes it permanent and it survives the pair being cleared.
  `updateFoundryQuenchJets` now covers `o.castingBed||o.quenchTarget` — one jet rule.
  BUG FOUND AND FIXED HERE: the arena outlet anchor's default 1500-unit envelope
  reached the whole Sluice, which silently demoted it to one-mouth mode and made the
  room unsolvable. Anchors may now declare `anchorRange`; the outlet's is 700.
  5 EXIT: three `foundryFissureCap` caps in the GROUND at 16053-16467, band
  `FOUNDRY_FISSURE_X1/X2`, crossing at y < -150. `shatterBrittle` refuses them while
  the Colossus stands (verified: refused before the kill, accepted after, `reform:9999`
  so it stays open). The void floor is exempt in the band and the OOB rewind now
  declines to fire while `G.physicalSeamCrossing` — a fall that IS the road must not be
  undone. Verified end to end: fell from y=0 at x=16260, crossed at y=-161, and landed
  in the Inversion at x=180 y=0 with `bestStage` 11. The recollection ledge at y=-110
  catches a drop down the west half (landed at exactly -110, relic 10 units away);
  stepping east off it crosses at -155. `physicalSeamSpec`'s east-edge branch is gone.
  ZONES/MAP: `colossus-inversion` is ember-colossus `south` `plunge` -> inversion
  `north` `emerge`; both arrivals are authored in `compatibilityZoneArrival`. The
  progression grid's bottom row now runs RIGHT TO LEFT (void-tyrant 3,5; abyss-king
  2,5; gilded-vault 1,5; deep-line 0,5) to match the drawn map.
  KIT: 8 cling walls, three chimneys, highest tier 640, 85% of tiers at or below 450.
  De-templated: no coordinate the Foundry uses appears in the Emberdeep block, and
  slag rain is gone from the Foundry entirely — Emberdeep owns it.
  TESTS: `tests/ember-colossus-stage.test.mjs` rewritten, 17/17. Whole suite re-run.
  Two pre-existing suites needed honest updates, not workarounds: `updrafts-runtime`
  pinned the exact OOB condition string (now pins the seam guard too), and
  `updraftsVoidFloor` is written stage-first so the sliced VM harnesses never evaluate
  the band constants. Version 7.125.0, cache v214, deploy mirror rebuilt.
  STILL NOT DONE: `spawnFoundryOrphan` is still uncalled — the "one body" beat was
  meant to move to the feeder this run and did not; the feeder seizes into a wreck
  instead of birthing a shieldbearer. Room 1 (the Receiving Floor) and room 5 (the
  arena approach west of the overlook) were left as they were, per "rebuild 2-4 and 6".
- 2026-09-18 (Opus, Run 3). Emberdeep is a descent. `const ED=640` is the datum and
  every y in the level is written through it; `GrAt(x1,x2,y)` is deep ground AT a
  height whose fill runs to the world floor, so the plateau is solid rock underneath
  rather than a shelf with sky beneath it (verified: `getFloor` finds nothing standable
  at y=200 anywhere under rooms 1-5). Room 6 walks you 640 units down in four
  switchback flights — worked steps, a controlled drop between two rune faces, a slag
  and slab run, a last step to the floor — with a `Landing()` per flight and a lava
  sump under the head so stepping off the plateau costs a rewind, not the descent.
  Probed live surface by surface: 640 road across all five rooms, then
  580/520/460/440/260/225/190/150/110/0, and the east seam is ground at y=0.
  ROOM 2 is two lines over one clock: the low line is the slab rhythm, the HIGH line is
  a chimney whose feet start above head height (so the low road runs on underneath) and
  a graded run of cold stone over the spouts, with the slag falling ON it and a ramp
  back down to the road at its east end. Room 3 gained a lookout level with the top of
  the seal arch — the one thing in the region worth the whole climb.
  ENEMIES: two slagwrights (their lob lands as a pool that cools into footing — they
  GIVE ground) and a cinderling pair (they burn out where they fall — they take it
  away) replace three plain emberlings. All keep noDrop; all stand on the plateau.
  CHECKPOINTS 12 -> 7, asserted exactly.
  THE DEAD LADLE hangs jammed over a mould set cold for good, with the slag gone hard
  up its arm, on the third flight. `updateFoundryLadles` is stage-10 only so it is inert
  here; the drawer has a `deadLadle` branch that does not vent, because it is a corpse.
  INTERIOR BACKDROP (renderer): `INTERIOR_STAGES = {9,10,11}`. Tiled rock wrapped in
  BOTH axes and pinned to nothing, no horizon, no abyss gradient, plus y culling on
  plats and on `vis`. The outdoor backdrop assumed a sky, a hill line 196px above the
  GROUND LINE, and darkness below it; raise a floor 640 units and all three break at
  once, which is why this replaces them rather than covering them.
  FIRST CUT WAS WRONG and worth recording: courses the size of the player drawn at full
  strength put the brightest, busiest thing in the frame BEHIND the level. Rock is small
  broken blocks in the bottom of the theme's colour range, at .85/.4 alpha.
  TESTS: `tests/emberdeep-stage.test.mjs` 15/15, with reachability re-derived against
  the LOCAL floor (the highest deep slab at or below a tier within a screen) and a wall
  clause, because "within 154.6 of y=0" stopped meaning anything at this datum.
  Whole suite 700/722 — the same 22 pre-existing failures, diffed as a set.
  Version 7.126.1, cache v215, deploy mirror rebuilt. Nothing committed, nothing
  deployed.
  NOT DONE: the work order asked for "deep slabs drawn only to their own depth when a
  lower room exists"; that turned out to need no renderer change — `drawPlat` already
  fills only to `o.h`, and `GrAt` gives the plateau a real depth — so the fix is in the
  data, not the drawer. Room 1 and rooms 4-5 were re-based but not re-authored; only
  room 2's second line and room 3's lookout are new shape.
- 2026-09-18 (Opus, Run 4). The Inversion is the game's first vertical region: 9,000
  by 1,500, entered top-right by falling out of the Foundry's floor, left bottom-left
  by the west gate at y=0, six rooms each owning an x-span AND a height band. The old
  flat level, `customExtension:2600`, `spGravity`, both weapon pickups and every sign
  are gone; `populateVoid` now runs only for a level without `authoredEcology`, and
  the region's one lore stone is AUTHORED on the plinth so the auto-placer skips it.
  RENDERER FIRST, as the order said. `flipWrap` mirrors the hero and every non-flying
  walker about their own box (`p.y` is the box bottom in both orientations — see
  `playerSlate`, which is also why roof slates must be thinner than 16). `polarityTrim`
  moves each platform's lit cap to the side you currently owe and grows the hanging
  fringe on the other. A flip stamps `G.flipTellAt`; the renderer answers with a
  half-second whole-screen smear and reverses the mote drift. `drawPlat` clamps the
  200,000-wide world roof to the view before its per-pixel brick loop. The camera
  mirrors `verticalThreshold` when flipped and leads a long fall from `vy` (`fallLook`
  in bladefall-camera.js, which helps Runs 2 and 3 too).
  THE GRAMMAR, verified live: step off the lip, flip in the air over the gap, the roof
  catches you (944/894/901 against undersides of 940/890/840-oscillating, never the
  world ceiling); walk the underside west; right the world and land on the next island
  (700/640/580, all exact). Floor gaps are 400 against a 355 double jump.
  THREE THINGS I GOT WRONG AND FOUND IN PLAY, each worth keeping:
   (i) Roofs that spanned only their gap put every landing back in the hole they were
       there to cross. They now reach ~200 past it, over the island you land on.
   (ii) A thin overhang steals your jump from below and then offers its own top as a
       perch one jump up — exactly the route it was placed to deny. Overhangs are 96 deep.
   (iii) A crate shelf directly over its own floor slate can never deliver a crate to
       it. The shelf stands beside the slate, as spGravity always did.
  DELIBERATE DEVIATION: the order asked for FOUR switchbacks in the gauntlet, each
  escalating one thing. Room 4 is 2,600 wide and a switchback costs an 800-unit island
  plus gap, so it holds three (crumble, teeth, mover) and the fourth escalation is a
  floor that runs the wrong way. The Reversal's taught crossing is the fourth in the
  region. Also: the roof line IS walkable end to end — a continuous flipped route is
  unavoidable once each roof must reach over its landing — so it is made the HARD road
  (it gives way, it has teeth, it does not wait) and the world's own ceiling is toothed
  through the gauntlet rather than left as a free highway.
  THE DROP-LOCK, verified both ways: the decoy pair dumps the crate on open floor at
  (1700,180) and presses nothing; the true pair drops it into the bin at (2200,186),
  presses the crate-only plate, and opens the door. The Zenith Key is claimed by
  standing on the ceiling beside its socket (keys 0 -> 1).
  TESTS: new `tests/inversion-stage.test.mjs`, 10/10. Whole suite 710/732 — the same
  22 pre-existing failures, diffed as a set. `tests/campaign.test.mjs` had the old
  extension pinned and was updated honestly. Version 7.127.0, cache v216, mirror rebuilt.
  ALSO FIXED IN PASSING: `bladefall-campaign.js`, `-zones.js`, `-progression.js` and
  `-camera.js` were loaded WITHOUT a version query, so an edit to any of them was
  served stale from the HTTP cache. They now carry `?v=`. This is the third run in a
  row where a stale asset made a correct fix look like a no-op.
- 2026-09-18 (Opus, Run 5). The Paradox Citadel is authored and MIRRORED: six rooms over
  17,000 units walked east to west, spawnX 16700, bossX 1100, `build(){G.p.face=-1}`,
  every authored body facing the arrival. The charter plans it west-to-east; its box now
  says to read each x as 17000-x, and its rooms, rules and numbers are carried over
  unchanged. The fight's maths is byte-for-byte what it was.
  THE ARENA IS ABSOLUTE. `setupParadoxBoss` is an early return in `bossArena`'s tyrant
  branch (the `setupFoundryBoss` pattern), so the authored region never reaches the
  left-biased 1,270-unit sweep that purges every object whose CENTRE falls inside it —
  verified live: 53 authored objects survive a load that would have deleted them.
  `installParadoxFloor(full)` pushes the floor and both faces when the fight is over and
  the five stairs over the faces always. Proven: a cleared Citadel still has its floor,
  both faces and a walkable road at x=1400 and x=300. Without it the region's only road
  has a 1,280-unit hole in it on every revisit.
  THE FORWARD SEAM COULD NOT OPEN. `tyrant-king` is the game's first bossClear-gated
  physical seam; the gate reads `meta.world.cleared`, which only `commitPhysicalDeparture`
  writes, and that runs AFTER the seam has already been asked. Verified before and after:
  `planTransition('tyrant-king',...)` returns `boss-clear-required` before
  `latchVoidTyrant()` and `ok` after it. Nothing recorded the clear on the kill.
  TWO MORE OUTRIGHT BREAKAGES fixed: `applyFinaleActRemaster` deleted every lowg,
  updraft, gravityWell and rotor in stages 12-13 whether a person put it there or not
  (now gated off for any CUSTOM_LEVELS stage); and the seam-failure nudge
  (`p.x+=spec.forward?-48:48`) assumed forward meant east, so a failed crossing shoved
  the player further INTO a west gate. It now nudges off whichever edge they are on.
  THE FIGHT IN PIXELS. `drawTyrantFigure`: a crowned figure whose greaves, cuirass and
  crown sit at 48/178/302 of its height — the three band heights — with the live one lit
  and the answered ones cold, so the target is on the body. `drawParadoxRails` draws the
  bands across the arena floor and the alignment line between the two mouths, straight
  and bright on `tyrantPairStatus().ok` and sagging when not. Both read the real tables
  through two new legacy bridges (`paradoxBands`, `tyrantPairOk`). Verified live: a pair
  on the two faces at the low band reports LEGS ALIGNED; both mouths on one face is
  refused with PLACE THE MOUTHS ACROSS FROM EACH OTHER.
  CAMERA. The anchor was pinned at .38 of the view from the left, so a westward run saw
  620 units ahead against 930 going east — backwards in three regions now authored right
  to left. It follows travel direction with easing and reduces to the old framing going
  east. Helps the Gaol too.
  STORY. `right-hand-seal` — the memory that flips the story to "confirmed", declared in
  bladefall-story.js since it was written and placed NOWHERE in the runtime — is a found
  object in the Paradox Vigil. The Hollow Crown sits west of the arena before the Throne
  Gate. Oren only; twelve-row `void-tyrant` roster with the `crownguard` unique.
  ALSO: the Citadel joins INTERIOR_STAGES, because the whole bottom row of the drawn map
  runs under the first third of the game.
  DEVIATION: the charter's chapel is a 300-tall pen you break into from its roof, and a
  floor at y=0 cannot be left on a 154.6 double jump. There is a ledge at 150 inside it.
  TESTS: new `tests/void-tyrant-stage.test.mjs`, 9/9. Version 7.128.1, cache v217.
- 2026-09-18 (Opus, Run 6). The whole road, walked. From the White Court's Ember Door to
  the Throne Gate and back again, live, with every seam exercised in both directions.
  WHAT HOLDS: all eight crossings commit (8->9->10->11->12->13 and 12->11->10->9->8);
  every arrival stands on solid ground; every arrival now faces the way its level runs;
  each of the three verbs is granted at a protected midpoint with its own checkpoint and
  is required by the exit past it; no region on the road carries a sign or a banner or a
  pickup; every recall roster is present; every region has its own music cue; and
  Continue resumes mid-road at the Inversion's landing with all twelve capabilities.
  THREE THINGS WERE BROKEN AND ARE NOT NOW — all of them cross-region, which is why no
  single region's suite caught any of them:
   (i) EMBERDEEP'S RETURN DOOR WAS BURIED. `installCourtConnections` pushes it at y=0;
       Run 3 raised rooms 1-5 onto a plateau at ED=640, so the only way back west sat
       640 units inside solid rock. It is on the datum now.
   (ii) THE FISSURE ARRIVAL FACED THE WALL. An endpoint's inward vector is horizontal,
       so a VERTICAL seam has no opinion and hands back the default +1 — which points a
       player who just fell into the Inversion back the way they came. Both right-to-left
       regions are now entered facing the way they run.
   (iii) TWO REST SITES WERE IN HAZARDS. `installZoneRestSite` matches an anchor by the
       CONTRACT's id and falls back to a ratio otherwise, silently. Emberdeep declared
       'ember-refuge' against a contract named 'furnace-shelter' and the Inversion
       declared 'inversion-landing' against 'inversion-plinth', so Emberdeep's site was
       floating in room 2 and the Inversion's was standing in the middle of the polarity
       gauntlet. Both renamed; the Citadel's spare anchor, which answered to nothing, is
       now just a stool.
  NEW TEST: `tests/late-game-road.test.mjs`, 8/8 — the cross-region invariants, including
  a rule that no level may declare a rest anchor with no contract behind it.
  RECORDED, NOT FIXED: the Inversion and the Citadel both reuse the White Court's music
  files (`floating-dream.ogg` and `abnormal-circumstances.mp3`). Both are flagged
  `interim:true` in the cue table and the test now pins that flag, so the next music pass
  can find them. Walking the road you currently hear the Court's ambient again two
  regions later.
  Version 7.129.0, cache v218. Docs updated: 03-LEVEL-BY-LEVEL.md, 05-REMAINING-WORK.md,
  NEXT-MODEL-BRIEF.md. THE LATE GAME IS BUILT AND ENTIRELY UNPLAYED BY A HUMAN — Runs
  2 through 5 are all waiting on the same owner playtest.

---

## Run 7 (2026-09-19) — the owner's first playtest of Emberdeep, and what it found

NOT part of the original work order. The owner played the late road, reported
"everything minus Emberdeep — that level isn't working at all", and sent one
screenshot: the knight on a thin strip of floor at the top of the frame, two thirds
of the screen solid black below it, and the Cinder Ledger counter floating in that
black beside a pale figure.

Every defect was ONE MISTAKE wearing three costumes: **a literal `0` used to mean
"the floor"**. That is true in thirteen regions. Run 3 raised Emberdeep's rooms 1-5
onto a plateau at `ED=640`, and it stopped being true in the fourteenth.

 (i) **THE CAMERA WAS FRAMING THE ROCK.** `minimumY` — the clamp that stops the view
     dropping below the ground — was the literal `0`. On the plateau that is 640 units
     of fill, so the camera sank 354 units into it and the road drew along the top of
     the screen. This is the whole of what the screenshot shows. The clamp is now the
     level's floor, eased down the Deep Stair, and never above the player's own feet
     (the stair switches back, so two landings share an x and a floor derived from x
     alone would push the player off the bottom of the frame).
 (ii) **THE CINDER LEDGER WAS IN THE VOID.** `applyRegionalShop` installs at `y:0`.
     640 units under its own plateau, visible in the dark, impossible to reach.
 (iii) **SERA FELL OUT OF THE WORLD AND STAYED THERE.** The NPC out-of-world rescue
     fires below `-60`. From the plateau that is a 700-unit drop, and she lodges at
     -40 and never triggers it. She is the relay: the gated bridges in rooms 3 and 5
     cannot open without her on a pad, so **the region was unfinishable** from the
     first time she stepped into the pour channel. She is the pale figure in the
     screenshot, standing under the rooms, trailing the player.

Also fixed in passing, same cause: the crate pit-reset threshold, and the rest-site
ratio fallback's no-support branch.

**THE SHAPE OF THE FIX.** A level declares `datum` and, if its ground descends,
`datumDescent:{from,to,y}`. Two readers interpret it — `levelFloorY(x)` (conservative:
the ground you can count on, for placement and "has this fallen out of the world")
and `cameraMinimumY(p)` (eased, and floored by the player). Every other call site asks
one of them. Levels that declare no datum get `0`, so this is an exact no-op in every
region but Emberdeep — verified by running the whole suite against the pre-fix source.

The Cinder Ledger also moved 330 -> 560 so you no longer materialise inside it; the
Ember Door arrival is at 330 and every other region separates the two by ~200.

NEW TEST: `tests/level-datum.test.mjs`, 9/9. Eight of the nine fail against the pre-fix
source, so they are load-bearing. They pin the RULE, not the three instances — including
one architectural guard: **only `levelFloorY` and `cameraMinimumY` may read `.datum`.**
If a third function starts interpreting it, the spread that caused this has restarted.

Version 7.130.0, cache v219, mirror rebuilt. Whole suite 751/773 with the same 22
pre-existing failures, diffed as a set against the pre-fix tree: zero new, zero resolved.

STILL UNPLAYED: stages 10-13. The owner's verdict was "I can work with all of this
minus Emberdeep", which is acceptance of the road, not of the four regions on it.

**Run 7 addendum (7.130.1 / cache v220) — Emberdeep's camera holds still.** Owner, same
day: "the knight and general world keep shaking … can you cut all vibration/shaking
from the level?" Cause: each of the six slag weights adds 7 to `G.shake` on landing,
with NO distance check, so the pour schedule shook the frame about once a second
wherever you stood (measured: shaking 194 of 600 frames while standing idle at the
Ember Door). The level now declares `stillCamera:true`; `levelIsStill()` gates the
single `BFCamera.shakeOffset` call and `buzz()`. Verified 0 px of screen offset over the
whole level, no haptics, and the White Court unchanged. Pinned in
`tests/emberdeep-stage.test.mjs`. **Do not re-add shake to this region.** Note for later:
the slag landing's shake is still distance-blind in any OTHER region that uses `Slag()`
(the Foundry uses none today).

**Run 7, second addendum (7.131.0 / cache v221) — the owner's cuts.** Three screenshots:
the room-3 chimney ("serves no purpose"), a flag and a soldier standing in the stair
sump, and the room-2 chimney that let a player climb over the first platforming lesson.
Cut: room 2's chimney, high line, step down and all four weights; the room-3 chimney,
its shelf and its step; the remaining two weights (room 4, stair). Room 2 re-phased so
every slab sets a beat AFTER its west neighbour — "wait for it to be stone, then jump",
which is how the owner describes the challenge; the old order needed the weights as
rests. Two slabs replace the weights that were steps; spouts moved over matching
slabs; the coin moved onto the rhythm. Cold heat stone now glows for its last 30%
before opening (applies wherever heat stone runs free, the Foundry included).
THE FLAG AND THE SOLDIER WERE A FOURTH DATUM BUG: the whole Emberdeep Muster roster
was written at y=0 and spawned inside the plateau. `installMusterRoster` now adds
`levelFloorY`, and the roster was re-laid clear of every safe place (the recall-hygiene
test never covered Emberdeep — its region list is warden/outskirts/woods/brute).
Suite 754/776, same 22 pre-existing failures. Charter has an OWNER CUTS section that
supersedes its room plans.

**Run 7, third addendum (7.132.0 / cache v222) — the Foundry, played.** Owner: the coin
climb is pointless, the climb should be mandatory over lava and lead into the casting
line, the line was cheesable, the tracks should throw you in, the Feeder was skippable,
the floating water and two soldiers standing in lava made no sense, the end chimney
was purposeless, and phases 2-3 of the fight use nothing but the strike. ALL DONE
except the fight, which is PROPOSED in `docs/charters/11-ember-colossus/BOSS-PHASES-
PROPOSAL.md` (phase 2: a vertical escape from rising metal; phase 3: a pursuit won by
turning its weapons on it — counter, twin portals, strike via Oren's crane). Read the
charter's OWNER CUTS section before touching the Foundry. Measured along the way: the
full kit crosses ~1,100 units of lava (an air dash keeps ~500 u/s for a second), so NO
gap in this game is unskippable by width — gate it on the mechanic instead. Verified
in-engine: a bot that only waits for stone crosses the line from 10/10 arrival times
with the ladle frozen and 29/40 with it live; the strike answer to the ladle (set your
mould, wait out the pour) was proven in a scripted scenario; 24 full-kit skip attempts
at the Feeder all end in the lava against the gate. Suite 754/776, same 22 failures.

**Run 7, fourth addendum (7.133.0 / cache v223): the Colossus, phases 2 and 3 built.**
The owner approved the proposal. Phase 2 goes up (my pick); the crane plate needs Oren,
with a harder route without him; about four minutes overall.
- **Phase 2:** a shaft of +120 steps, a chimney and a dash shutter up to a valve, racing
  metal at 22 u/s while the Colossus pours on the next step up.
- **Phase 3:** three plates, one each for counter, portals and a strike from the crane.
  Oren runs the hook from a pad; without him you wall-jump the mast chimney.
- **What playtesting the design in the engine changed:**
  - rises from +140 to +120;
  - the chimney exit ledge onto the pillar top;
  - the shutter seal cut short so it no longer splits the gantry;
  - pours aimed ahead, never at the mould you wait on, with a 6 s breather each;
  - grace after being caught raised to 5 s;
  - the hook parked away from the perch's drop, boardable at +60, and passable by a slam;
  - the crane pad made `followerOnly` so the Foundry's non-relay Oren can press it. Its
    old sluice-gate pad never could, which is pre-existing;
  - attack rings shown for the whole wind-up.
- **Measured:**
  - 12/12 phase-2 clears, 25–52 s typical;
  - 0 hits in 4 × 30 s for a ring-reading evader;
  - every plate verb proven separately;
  - the ending latches the region and lays the bridge.
- **Tests:** `ember-colossus-boss.test.mjs` rewritten, with new tests for the shaft, the
  race, the plates and the crane. Suite 756/778, with the same 22 failures.
