# Bladefall — concise current brief

Project: /Users/computer/Projects/Bladefall-2D Antigravity (moved off the iCloud
Desktop on 2026-09-15; the old Desktop path is now a symlink to it)
Runtime: public/index.html plus public/bladefall-*.js. Build mirror with
./build-deploy.sh. Never deploy to Netlify without explicit authorization.
Read USAGE-POLICY.md; owner explicitly prioritizes token/credit efficiency.

## Current direction — Bladefall v4
Fable won the look/feel respec. Redesign the existing opening through Frost
Sorcerer / White Court with less management: no bag access, clearer physical
affordances, distinct harder puzzles, less tedious combat, and fewer recurring
characters with better, shorter dialogue. Read 13-V4-RESPEC-WORK-ORDER.md when
assigned v4 work; it separates owner direction from implementation proposals.
Latest direction (2026-09-16): Fable reaffirmed after Astra retry; extend the
selected pixel renderer. Stages 0–8 have renderer coverage; region redesigns
and specific visual debt remain (work order §6). For integration conventions
read 14-V4-EXTENSION-CONVENTIONS.md. Step 3 implementation is delivered:
Outskirts, Black Woods, Broken Causeway / Brute, Updrafts, Hollow Marksman,
Ruined Keep, Gaol / Warden, Frostfell and White Court have first passes.
Current 7.124.0 / cache 213; mirror rebuilt.
Earlier passes add recoveries, physical telegraphs, deliberate residents,
mirror-resin clues, no-bag sword/mantle/bow, connected Drop Yard repair and
Causeway carriers. Updrafts adds direct harness/Crown acquisition without Ilyra
permission, persistent cinder + damper repair, truthful pixel wind/cup cues,
Needlewind nest, basin void/camera recovery and Gale Stitch without an Echo slot.
Ilyra recurs offscreen and speaks only on Up; the high mast is optional and awards
a Seal directly. Prior focused tests: Outskirts 32, Woods 22 + 16 compatibility,
Causeway 29, Updrafts 21 + camera 8; bounded browser checks completed.
Updrafts Continue retains local gear/powers without awarding campaign powers.
Marksman replaces the repeated Gallery crossing with a recoverable drop-speed
launch, adds committed bow/rush windups and cover collapse tells, relocates Daro
offscreen for deliberate token return, and fits Far Thread without an Echo slot.
Its pair reward opens the east road directly; Continue keeps the court cleared.
Marksman 31 focused checks pass, including real arrow cover, portal launch and
multiplayer tells; bounded browser/reward/Continue checks passed.
Keep adds named routed catches, an oscillating bell receiver, reachable approaches,
auto-fitted Grip, Archive recovery/lift, recurring Oren and truthful pixel machinery.
23 focused checks pass; actual portal shots, miss recall and preview Continue checked.
Level Select Continue now keeps its own checkpoint position.
Gaol adds a two-brake Hush Engine, cage/high-low cell route, local catch floors,
recurring Enna and truthful Warden windups. Committed rush directions and targeted
mouth strikes now match their tells; health inflation is reduced. Counter saves
and keeps the mine open on Continue. 30 focused checks and bounded browser checks
pass. Frostfell adds automatic Nim/hearth progression, a source-specific thermal
duct with timed shutter, direct Double Jump, dry moving rafts/catches, saved service
routes and a stateful pixel muster bell. Local encounter health is reduced while
the existing global Recall remains intact. 17 focused checks and bounded real
thermal-shot/reward/Continue checks pass. See 15-V4-LEVEL-REDESIGN.md.
White Court adds a wall-to-floor rising-cold Gallery crossing with a safe lower
retry road; retains Glassworks moving-condenser timing. Vey recurs, three ordinary
encounters replace six, and architecture/machinery/Sorcerer tells are pixel art.
The harder fight remains; follow-up casts hold position and rupture rushes commit
direction. Attunement saves at the Ember door and White Hush works without a slot.
Court geometry and repaired crossings survive Continue. 26 focused checks pass;
real cold/ward/final returns, finishing hit and Continue verified in bounded fixtures.
Shared cleanup completes the no-bag flow through stage8: found gear swaps in
the world; one Mantle; bought tools auto-carry and can be switched at their
seller; early Echoes activate passively without occupying slots. Pause offers
a read-only Journey; the refuge Forge uses gold and Seals, with no material
inventory needed. Legacy bag data remains saved. Later regions/modes retain
their existing menus. Anonymous material drops and portal instruction banners
are suppressed through8; physical effects and telegraphs remain.
Shared checks:18 Echo/module +10 loadout/shop/forge +3 affected region cases
pass. Browser Journey/Forge, actual temper, counter tool switching and direct
Mantle pickup verified; original test save restored. Scoped requirements audit
found no implementation blocker. This is the delivered pass, not human visual
or difficulty acceptance. Next: owner playtest feedback; no automatic further
polish, TAS search, full traversal or later-region expansion.

## 2026-09-16 owner pass (7.113.0 / cache 199)
Four owner-requested changes, all uncommitted and undeployed:
- Hollow Marksman hunt phase moved at all: its shot cooldown (.65s) was shorter than
  its recovery (.7s), so updateMarksmanShot returned true every frame and the
  reposition/leap code below the early return was unreachable. Cooldown is now
  1.2/1.05s and the leap carries to its target tier (marksmanLeapVx, cap 430).
  Measured: a leap every ~2.3-2.6s, ~900px of range, 141-200px jumps.
- Loot minimalism: enemy gear, boss keys and the boss chest are now gated to
  stageIndex>8, matching the boundary enemy materials already used. The Warden
  dropped armor because killEnemy excludes it from the boss-key branch and the old
  rollDrop gate was stageIndex>4. tests/loot-minimalism.test.mjs runs the real branch.
- Cast reduced to five across stages 0-8: Vey (0 quiet, 6, 8), Oren (2, 3, 5),
  Mara (0, 4), Bram (1), Nim (7). Ilyra, Daro and Enna folded into the recurring
  three. Internal ids (profileId 'ilyra', questActor 'daro') deliberately unchanged:
  they are stored quest-event actors and renaming them would orphan a live save.
  Dialogue rewritten shorter; Outskirts and Gaol tests now assert intent plus a
  word-count ceiling instead of exact phrasing.
- Boss move-name shouts (ENRAGED!, ARROW RAIN!, GROUND SLAM!, FROST STORM!,
  ERUPTION!, GROUND POUND!) are silent in stages 0-8 via combatShoutsQuiet();
  the pixel telegraphs carry them.
Verification: 629/649 focused tests pass. The 20 failures were confirmed
pre-existing against a reverted-source baseline run, and are the legacy browser/TAS
suites (white-court, tas-runtime, muster-recall roster hygiene) plus harness wiring
gaps (restoreMarksmanVictory / netPackWardenTell undefined in their VM contexts).
Not human playtest acceptance. Mirror rebuilt; nothing committed or deployed.

## 2026-09-16 Emberdeep v4 conversion (7.114.0 / cache 200)
Owner decision: the v4 rules extend past stage 8. Emberdeep (stage 9) is now an
authored region, not a procedural one, and is the first to use the new boundary.

- ONE boundary constant: `V4_LAST_STAGE=9` plus `v4Region(i)` in index.html now
  gates loot rolls, boss keys, the boss chest, enemy materials, combat shouts,
  portal banners, the field loadout and the interaction prompt. Converting the
  Colossus later is a one-line change. NOTE: VM test harnesses that extract single
  functions must supply `V4_LAST_STAGE` / `v4Region` in their context; five test
  files were updated to do so.
- `EMBERDEEP_LEVEL` (len 15200, spawn 330, portal 14880) is registered as
  CUSTOM_LEVELS[9]; the campaign blueprint is source 'custom', len 15200.
  Five rooms: cooling road, the draw, held bridge, pour floor, deep exit.
- Companion Command was a hollow reward: `commandFollower` was never gated by it
  and relay travelers were explicitly excluded from being commandable, so the
  stage-9 prize was a verb the player had owned since Bram in stage 1. It is now
  the SEND order: `sendPostFor` finds an unsatisfied post within 2400,
  `sendRouteMouth` decides whether the route needs a mouth, and a sent companion
  walks there, hops in feet-first (a floor mouth refuses a walker's velocity) and
  latches on arrival. FOLLOW/HOLD is untouched, so Bram and Nim lose nothing.
- Two engine bugs found and fixed while building it: a relay exit teleported the
  traveler to whichever pad he was assigned at spawn (wrong with several pads in
  one region), and a send post did not accept a held companion's weight because
  only `relayOnly` plates did.
- The three rooms ask three different things of one body: LEAD him through a seal
  that refuses iron (`payload:'escort'`), he HOLDS while you cross his weight-made
  bridge, then ORDER him where the pour stops you. Verified live: the player is
  refused by the seal; 6 stones exist while he holds and 0 when he steps off; the
  pour post latches and stays latched after he walks away.
- Geometry is checked against the shipped TUNING, not by eye. The first pass was
  unplayable: the final bridge hop was 420px against a 355px maximum. Every hop
  now clears on the double jump alone at worst phase (margins .46-.86).
- Cast unchanged at five: the courier is Oren, not Sera. The profile key stays
  'sera' because it is a stored quest-event actor; renaming it would orphan a save.
- Renderer: `volcano` theme (stacks skyline, rising embers, heat haze), eight
  ember structures, and flame-jet vents sized to the real spike hitbox.
  SUPPORTED_STAGES now includes 9.

Verification: 642/662 focused tests pass, including 13 new Emberdeep checks. The
20 failures are the same pre-existing set (legacy browser/TAS suites and harness
wiring gaps), confirmed against a reverted-source baseline earlier in the session.
Live browser checks covered all three rooms, the grant, the exit and the return
door. Not human playtest acceptance. Mirror rebuilt; nothing committed or deployed.
Next: The Inversion (stage 11) — raise V4_LAST_STAGE to 11 as part of that pass.

## 2026-09-17 Ember Colossus / The Foundry v4 conversion (7.115.0 / cache 201)
Stage 10 is now authored. V4_LAST_STAGE=10.

- The same hollow-reward pattern as Emberdeep, one level worse: `downward-strike`
  was granted NOWHERE in the repo. It existed in the movement module, the HUD and
  the locked-feedback path only. `claimFoundryMemory` now grants it after the kill,
  and the Breach's casting caps are the only thing that opens to it (no spring, no
  crate anywhere in the region, per the shatter rule at index.html shatterBrittle).
- `FOUNDRY_LEVEL` (len 15600, bossX 12600, spawn 320) is CUSTOM_LEVELS[10]. It is
  placed ABOVE `/* ---- STAGE 10 · EMBERDEEP` on purpose: tests/emberdeep-stage
  slices index.html from `const EMBERDEEP_LEVEL=` to `\nconst CUSTOM_LEVELS=`, so a
  block between them would be eval'd by that test. Helpers: FoundryBeat,
  FoundryScenery, Cap, FoundryVent (its own, so rooms tag as ember-colossus:0N).
- `setupFoundryBoss` + an early return in bossArena's colossus branch. Gated on
  `stageIndex===10 && !bossRush` and deliberately NOT on ngPlus: the authored level
  loads for every run, so an NG+ that fell through to the legacy branch had its
  2200-wide slate floor deleted by the arena purge, leaving a 450px hole between
  the corpse and the exit. The legacy arena still exists for boss rush.
- The exit is authored (colossus@10 added to the post-kill `G.portal=null`
  exclusion) and opens on `hasCapability('downward-strike') || ngPlus!==0 ||
  levelSelectMode` — NG+ and Level Select are refused the permanent grant, so
  requiring it sealed them in the region.
- The circuit is authored, not injected: slate floor, outlet Anchor with
  `ejectSpeed:420` (deterministic crossing), quench channel, ForgeCoolant. The
  coolant carries `buoyancy:0, drag:0.9` because water's default buoyancy (1720)
  throws the molten shot up and over the forge — the legacy arena only worked
  because its forge hitbox overlapped the water. A landed slug now sets `exposeT`
  as well as `forgeStunT`, so the stun is a real melee window rather than a pause
  that clangs off every blow.
- Renderer: SUPPORTED_STAGES += 10; drawColossusFigure (core seam is the fight's
  clock); drawForgeCoolantV4 (hit pips + latched `o.forged`, because shadowBlur
  does not survive the Z=0.5 buffer transform); brittle rock got a cracked-cap look
  so the reward has a visible target. Three renderer bugs fixed that affected
  EVERY region: the slate cue was stage-listed to 3/4/5 (a new region silently lost
  the one signal that a mouth will hold), drawBossFigure's switch had no `default`
  (a boss routed there without a case rendered as an empty silhouette), and the
  fluid halo was hard-coded cyan so lava glowed ice blue. The fluid sparkle now
  drifts WITH the current.
- Also fixed: the annotation/interaction system was hard-capped at `stageIndex>9`
  in five places, so the Foundry's ledger, its interaction prompt and the Downward
  Strike card were all invisible; the HUD mantle readout had its own stale `<=8`.

Method note: two Workflow passes (understand-then-trap, then audit-then-refute)
surfaced 34 + 18 findings. High-value ones confirmed against the real code: the
NG+ purge, the never-granted capability, the stage-capped interaction system, and
three platforms authored above the 154.6px double-jump ceiling. A reachability
test now guards that class (`every authored tier can actually be stood on`).

Verification: 657/678 focused tests pass, including 16 new Foundry checks. The 21
failures are the same pre-existing set. Live browser: full forge cycle lands 268 of
1600 HP with exposeT 0.8; melee lands while exposed and clangs otherwise; the grant
fires after the kill; slam shatters both cap pairs; NG+ keeps its authored floor
(only the intended pour-line gap) and gets an exit without the capability.
Not human playtest acceptance. Mirror rebuilt; nothing committed or deployed.

## 2026-09-17 heat chapter rebuild (7.117.0 / cache 203)
Owner review of the 7.115.0 pass was blunt and correct: both regions were half
the authored density of the Outskirts, had completion portals, no Sealed
Recollections, no charter, and no recall presence. Rebuilt around one idea.

**Charters written first**: docs/charters/10-emberdeep/DESIGN-PLAN.md and
11-ember-colossus/DESIGN-PLAN.md, in the Frost Sorcerer format. Write these
BEFORE implementing a region; the previous pass skipped them and it showed.

**The heat chapter's rule.** Cold was treacherous ground you could see; heat is
ground that is not finished yet. Three new primitives, none used elsewhere:
- `heatCycle` slabs: one slab is MOLTEN (gone — a hole with the channel showing),
  then SETTING (solid but `ice`, so fast and hard to stop on), then COLD. A run of
  them on staggered phases is a rhythm, not a sequence of jumps.
- `slagCycle` traps: scheduled, not player-triggered. Warn, fall, LAND AS FOOTING,
  then sink. A route built from slag is borrowed.
- `pourSpout`: the clock face. Gathers visibly, then lets go. A spout and the slab
  beneath it share one period/phase — a test enforces that so the tell cannot lie.
- Oren inherits the clock: he steps clear of a pour and returns when it sets, so
  his hold is a rhythm rather than a hit-point bar (owner-approved).

**The Foundry answers it**: Downward Strike moved to a protected midpoint
(owner-approved) and now MAKES ground — strike a slab inside its setting window
and it sets hard for good; miss and it pours again. The breaking half survives for
the casting caps. Second primitive: the casting line, `belt` conveyors with
opposed directions and a tread that visibly travels the way it carries you.

**Constitution repairs**: both completion portals deleted — Emberdeep exits by the
Deep Stair and the Foundry by a fissure, wired into `physicalSeamSpec` (stages 9
and 10 had no entries). Both Sealed Recollections placed (The Buried Forge, The
Furnace General). Density 51->91 and 50->78 objects.

**The recall finally reaches stages 8, 9 and 10.** `MUSTER_ROSTERS` only ever had
warden/outskirts/black-woods/causeway, so the stat baseline carried but no new
bodies did. Added rosters for emberdeep, ember-colossus and frost-sorcerer, plus
two ember uniques that spin the chapter's own primitive: the **slagwright** lobs
slag that lands as a burning pool (gives you ground you did not ask for) and the
**cinderling** burns out where it dies (takes ground away, so where you kill one
is a decision). First post of each roster is within sight of the arrival.

**Renderer bug the owner hit**: the pixel `drawPlat` never checked `gateOpen`, so
Emberdeep's bridge stones DREW whether or not Oren held the pad while collision
correctly refused them. The level drew a bridge that was not there. Heat slabs now
draw in every state including `gone`, which is what makes the clock readable.

Boss work was explicitly out of scope this run; the wet-forge circuit and arena
are unchanged in shape. Verification was deliberately light per owner instruction
(creativity over testing): 20 focused region checks pass, 615/625 in the
non-browser suite with the same pre-existing failures. Not playtested.

## Music for Emberdeep and the Foundry (7.116.0 / cache 202)
Both regions were falling through to DEFAULT_LEVEL_MUSIC (./music.mp3, the legacy
score). They now have LEVEL_MUSIC entries, marked `interim:true`:
- 9 Emberdeep: ClockWork, gain .90 — machinery that still keeps time.
- 10 The Foundry: Whispering Woods, gain .90, with a boss cue of Heat of Battle,
  gain .96, so the score does not announce the Colossus from the far side.
These are DELIBERATE REUSES, not new compositions. All ten files in
public/audio/music/ were already assigned and an agent cannot author audio, so
bespoke tracks for these two regions still need owner-supplied files — the same
route as heat-of-battle / abnormal-circumstances / element / clockwork. Swapping
one in is a single `src` (plus title/artist, and drop `interim:true`).
tests/ember-music.test.mjs guards: every named track exists on disk, neither new
region points at the legacy score, cue ids are unique, and `interim:true` marks
exactly stages 9 and 10 so the remaining work stays findable.

## Existing campaign baseline
Owner beat White Court and found it too easy. Approved a genuinely harder second
phase after the existing three ward breaks: environmental machinery, alternating
high/low frost volleys, shifting ice, a stationary receiver during the committed
heavy-orb return window, and earned melee relief. No hidden last-health assistance.
Implementation is in public/index.html: beginCourtFinal, updateCourtFinal,
courtFinalBeat, drawCourtFinal, updateCourtReceiver and breakCourtWard.
Second phase uses prepare → barrage → cast → return → exposed. Three volleys
alternate low/high/low; speed rises with successful returns; final escalation adds
one committed ground mark. Five-second melee openings. Each return window now fires three payloads, 1.4s
apart with .6s aim warnings; initial preparation is 1.2s. Misses repeat the sequence.
Needlewind final dip has a 25%-tank air crystal at (13020,210), with the normal
Updrafts full-tank override disabled. Final phase starts at 20% HP (damage is capped
there until transition): the condenser ruptures, the shield permanently drops, and the
Sorcerer draws the court's cold back to 70% of max (owner decision 2026-09-16, replacing
the former no-refill rule) so the finale runs ~3.5x longer in health. Its difficulty
numbers are deliberately untouched: owner asked for longer AND harder, not eased.
Alternating frost
lanes/ice continue during committed rushes and 1.1s recovery windows.
Frost barrage cadence is 1.4/1.2/1.0s, speed 470/540/610. Rupture fires
every 2.1s: from left, right, left, then upward/downward committed columns
(.8s warnings, horizontal speed 660, vertical 480; no tracking).
Functions: beginCourtRupture, updateCourtRupture, courtFinalDamage.
Level-select saves now preserve session capabilities, quests, zone state and mode
via savedRunSession; Continue restores these before loading the level. Old saves
that already lost these fields need a fresh level-select entry once.
Phase one remains the existing encounter. Attunement is awarded only on real death.
Current 7.117.0 / cache 203; regional/shared work checked and mirror rebuilt.
No deployment performed. Earlier White Court validation: all seven dependency-free
checks in tests/white-court-final.test.mjs pass, including inline-script syntax.
Browser startup rechecked 2026-09-15 at http://localhost:8372/: title screen
shows v7.101.1, no captured console errors. Seven focused checks rerun and pass;
public/index.html and sw.js match their deployment mirrors. This is startup and
mechanics evidence, not full-fight visual/difficulty acceptance. Earlier 541-test /
5361-frame receipts predate the harder phase and are not current proof.


## 2026-09-19 Emberdeep failed its first playtest — Run 7 (7.130.0 / cache 219)

**The owner played the late road and reported: "I can work with all of this minus
Emberdeep. That level isn't working at all."** One screenshot: the knight on a thin
strip of floor at the top of the frame, two thirds of the screen black below it, the
Cinder Ledger counter floating in that black beside a pale figure.

**All three defects were one mistake — a literal `0` used to mean "the floor".** That
is true in thirteen regions. Run 3 raised Emberdeep's rooms 1-5 onto a plateau at
`ED=640` and it stopped being true in the fourteenth, in every place that had written
it down independently.

- **The camera framed the rock.** `minimumY`, the clamp that stops the view dropping
  below the ground, was `0`. On the plateau that is 640 units of fill, so the camera
  sank 354 units into it. This is the entire content of the screenshot.
- **The counter was in the void.** `applyRegionalShop` installs at `y:0` — 640 units
  under its own plateau, visible in the dark, unreachable.
- **Sera fell out of the world and stayed there.** The NPC rescue fires below `-60`;
  from the plateau that is a 700-unit drop and she lodges at -40 without ever
  triggering it. She is the relay, so the gated bridges in rooms 3 and 5 could never
  open again: **the region was unfinishable.** She is the pale figure in the shot.

**The shape of the fix, which is the part worth carrying forward.** A level declares
`datum` and, if its ground descends, `datumDescent:{from,to,y}`. **Exactly two readers
interpret it**: `levelFloorY(x)` — conservative, the ground you can count on, for
placement and for "has this fallen out of the world" — and `cameraMinimumY(p)` — eased
down the descent and never above the player's own feet, because a switchback stair has
two landings at the same x. Every other call site asks one of them. A level with no
datum gets `0`, so this is an exact no-op everywhere else; that was verified by running
the whole suite against the pre-fix source and diffing the failure sets.

`tests/level-datum.test.mjs`, 9/9, eight of which fail against the pre-fix source. It
pins the rule rather than the three instances, and includes an architectural guard:
**only those two functions may read `.datum`.** If a third starts interpreting it, the
spread that caused this has restarted — that is the actual failure mode here, not any
one of the three bugs.

Also: the Cinder Ledger moved 330 -> 560 so you no longer materialise inside it.
**Then, 7.130.1:** the owner asked for all shaking cut from the region. Every slag
landing added screen shake with no distance check, so the frame shook about once a
second wherever you stood. Emberdeep now declares `stillCamera:true` (no shake, no
haptics, any source). Owner decision — do not restore it.
**Then, 7.131.0 — the owner's cuts.** Room 2 is one line (chimney, high line and all
falling weights cut; no weights anywhere in the region now); the room-3 chimney is cut;
room 2's slabs set a beat after their west neighbour so every hop is "wait until it's
stone, then jump"; cold heat stone glows for its last 30% before opening. The flag and
soldier in the stair sump were the Muster roster, written at y=0 — a fourth datum bug,
fixed in `installMusterRoster`. See the charter's OWNER CUTS section before touching
Emberdeep: it supersedes the room plans above it.
**Then, 7.132.0 — the Foundry, played.** Every optional route, coin climb, chimney and
water pool is gone; the climb is over lava and flows into the casting line; the tracks
throw you in; the Feeder is gated (width cannot stop an air dash — the full kit crosses
~1,100). Phases 2-3 of the Colossus are PROPOSED, not built:
`docs/charters/11-ember-colossus/BOSS-PHASES-PROPOSAL.md`. The owner's rule, now
applied to two regions: **every section is mandatory or it is cut.**
**Then, 7.133.0:** the Colossus's phases 2 (vertical escape from rising metal) and 3 (a
pursuit won by counter, portals and a strike from Oren's crane or the mast chimney) are
BUILT. Read `docs/charters/11-ember-colossus/BOSS-PHASES-PROPOSAL.md` "As built".
Whole suite 751/773, the same 22 pre-existing failures, diffed as a set. Mirror
rebuilt. Nothing committed, nothing deployed. **Stages 10-13 remain unplayed** — the
owner's verdict accepted the road, not the four regions on it.

## 2026-09-18 The whole road, walked — Run 6 (7.129.0 / cache 218)

**The late game is built, and entirely unplayed by a human.** Runs 2–5 authored the
Foundry, Emberdeep, the Inversion and the Paradox Citadel. Run 6 walked the road they
make — White Court's Ember Door → Emberdeep → Foundry → Inversion → Citadel → Throne
Gate — live, in both directions, and fixed what that turned up. **The next thing this
project needs is an owner playtest, not another region.**

**What holds.** All eight crossings commit in both directions. Every arrival stands on
solid ground and now faces the way its level runs. Each of the three verbs (Companion
Command, Downward Strike, Gravity Flip) is granted at a protected midpoint with its own
checkpoint and required by the exit past it. No region on the road carries a sign, a
banner or a pickup. Every recall roster is present, every region has its own cue, and
Continue resumes mid-road with the full kit.

**Three cross-region breaks, none of which a single region's suite could have caught:**

1. **Emberdeep's return door was buried.** `installCourtConnections` pushes it at `y=0`;
   Run 3 raised rooms 1–5 onto a plateau at `ED=640`, so the only way back west sat 640
   units inside solid rock. **Any runtime-installed object must be placed at its level's
   datum, not the world's.**
2. **A vertical seam has no opinion about facing.** An endpoint's inward vector is
   horizontal, so `colossus-inversion` handed back the default `+1` and pointed a player
   who had just fallen in at the wall behind them.
3. **Two rest sites were standing in hazards.** `installZoneRestSite` matches an anchor
   by the **contract's** id (`BFRecovery`'s table) and silently falls back to a ratio
   otherwise. Emberdeep declared `ember-refuge` against a contract named
   `furnace-shelter`; the Inversion declared `inversion-landing` against
   `inversion-plinth`. **If you author a rest stool, read the contract id first** — the
   new road test now refuses any anchor with no contract behind it.

`tests/late-game-road.test.mjs` pins all of the above, 8/8.

**Recorded, not fixed:** the Inversion and the Citadel reuse the White Court's music
files. Both are flagged `interim:true` in the cue table and the test pins that flag.

## 2026-09-18 The Paradox Citadel, authored and mirrored — Run 5 (7.128.1 / cache 217)

Six rooms over 17,000 units walked **east to west**: you arrive at the east gate out of
the Inversion and the Throne Gate is beyond the arena at the west end. The Gaol's
pattern. The charter plans it west-to-east — read each of its x values as `17000 − x`.
**The paradox fight's maths is byte-for-byte what it was.** What changed is that it is
visible, and that three things around it were outright broken.

**Three breakages, all real, all fixed — and all worth knowing about:**

1. **`tyrant-king` is the game's first `bossClear`-gated physical seam, and nothing
   recorded the clear.** The gate reads `meta.world.cleared`, which only
   `commitPhysicalDeparture` writes — and that runs *after* the seam has already been
   asked whether it may open. The Throne Gate would have refused forever. `latchVoidTyrant`
   records it on the kill. **If you gate another seam on a boss, record the clear yourself.**
2. **`applyFinaleActRemaster` deleted every `lowg`, `updraft`, `gravityWell` and `rotor`
   in stages 12–13**, authored or not. It only ever meant to drop *rolled* accents, and
   an authored region has none. Now gated off for any `CUSTOM_LEVELS` stage.
3. **The seam-failure nudge assumed forward meant east** (`p.x+=spec.forward?-48:48`), so
   a failed crossing shoved the player further *into* a west gate.

**`bossArena` purges a 1,270-unit sweep around `bx`** and tests each object's **centre**.
An authored boss region must early-return before it: `setupParadoxBoss` does, the way
`setupFoundryBoss` does. `installParadoxFloor` then keeps the floor, both faces and five
stairs after the victory, because the region's only road runs *through* its arena.

**The fight in pixels.** `drawTyrantFigure` puts the three bands on the BODY — greaves,
cuirass, crown at 48/178/302 of its height — with the live one lit. `drawParadoxRails`
draws them across the floor and draws the alignment line between the two mouths: straight
and bright on `tyrantPairStatus().ok`, sagging when not. Both read the real tables through
new legacy bridges (`paradoxBands`, `tyrantPairOk`).

**The camera anchor now follows travel direction.** Pinned at .38 from the left, a
westward run saw 620 units ahead against 930 going east — backwards in three regions now
authored right to left. This helps the Gaol too.

**`right-hand-seal`** — the memory that flips the story to *confirmed*, declared in
`bladefall-story.js` since it was written and placed **nowhere** in the runtime — is a
found object in the Paradox Vigil. Worth checking whether any other declared memory is
also unplaced.

## 2026-09-18 The Inversion goes vertical — Run 4 (7.127.0 / cache 216)

The first region in the game that is taller than it is readable in one screen: 9,000
by 1,500, entered top-right by falling out of the Foundry's floor, left bottom-left by
the west gate, six rooms each owning an x-span AND a height band (rooms are x-spans in
this engine, so two may never share one).

**The renderer came first, because the mechanic was invisible.** The pixel path had
zero handling of `gravityFlipped`. Now `flipWrap` mirrors the hero and every non-flying
walker about their own box, `polarityTrim` moves each platform's lit cap to the side you
currently owe, a flip stamps `G.flipTellAt` and gets a half-second whole-screen tell
with the motes reversed, `drawPlat` clamps the 200,000-wide world roof before its
per-pixel loop, and the camera mirrors `verticalThreshold` when flipped and leads a fall
from `vy`.

**Three geometry facts this region paid for, all found in play:**
- A roof that spans only its gap puts every landing back in the hole it was there to
  cross. Roofs must reach past the gap, over the island you land on.
- A thin overhang steals your jump from below and then offers its own top as a perch one
  jump up. Overhangs must be deep (96) to deny what they were placed to deny.
- **`playerSlate` measures a mouth against a plat's TOP, not its bottom.** So a ceiling
  slate thicker than 15 cannot hold a mouth from below, silently. `spGravity` has always
  used 14 and `Roof()` defaults to it. If you author a ceiling mouth anywhere, check this.

**A continuous flipped route is unavoidable** once every roof must reach over its
landing. So the roof line is deliberately the HARD road — it gives way, it has teeth, it
does not wait — and the world's own ceiling is toothed through the gauntlet rather than
left as a free highway west.

**Stale assets, third run running.** `bladefall-campaign.js`, `-zones.js`,
`-progression.js` and `-camera.js` were loaded with no version query, so edits to them
were served from the HTTP cache and a correct fix looked like a no-op for a whole cycle.
They carry `?v=` now. When a change seems to do nothing: bump the asset version, and
clear the service worker (`getRegistrations().unregister()`, `caches.delete()`).

## 2026-09-18 Emberdeep becomes a descent — Run 3 (7.126.1 / cache 215)

**The datum.** Rooms 1-5 stand on a plateau at `const ED=640`; room 6 walks you down
off it to y=0 in four switchback flights. Every y in the level is written through ED.
`GrAt(x1,x2,y)` is deep ground AT a height whose fill reaches the world floor, so the
plateau is solid rock underneath — nothing walks under it, and the renderer has no gap
to fill. A lava sump under the head of the stair means stepping off costs a rewind
rather than the whole descent, and `updraftsVoidFloor` rewinds the plateau rooms at
ED-160 instead of at the world's own void.

**Interior backdrop.** `INTERIOR_STAGES = {9,10,11}` in the renderer. Tiled rock
wrapped in BOTH axes, pinned to nothing, no horizon, no abyss gradient, plus y culling.
**This is the fact to carry forward:** the outdoor backdrop assumed a sky, a hill line
196px above the GROUND LINE, and darkness below it. Any region whose floor is not at
y=0 breaks all three at once. Run 4's Inversion is vertical — use `interior`, do not
work around it. And keep a backdrop dark and fine-grained: the first cut used courses
the size of the player at full strength and put the busiest thing in the frame behind
the level.

**Also:** room 2 is two lines over one clock (the high line is a chimney and graded
cold stone over the spouts, with the slag falling on it); room 3 has a lookout; two
slagwrights and a cinderling pair replace three plain emberlings; checkpoints 12 -> 7;
and a **dead ladle** hangs jammed over a set mould in the stair — no text, it is simply
what the player does next.

**Test harness note.** Reachability can no longer be "within 154.6 of y=0". The
Emberdeep suite derives a LOCAL floor per tier (the highest deep slab at or below it
within a screen) and also accepts a rune face beside a perch. Copy that shape for the
Inversion rather than re-pinning absolute heights.

## 2026-09-18 The Foundry rebuilt — Run 2 of the late-game order (7.125.0 / cache 214)

The region now teaches the fight it leads to, and leaves through its own floor.
Full detail in `16-LATE-GAME-WORK-ORDER.md`'s progress log; the load-bearing facts:

**The ladle is the new primitive.** `Ladle()` in the level data, `updateFoundryLadles`
in the engine. A machine goes to a mould, GATHERS over it — which holds that mould in
its setting window via the same `pourHold` the Colossus's arm uses — then pours. Open
stone fills; stone you already set refuses, and `seizeAt` refusals stop it for good.
An aimed mould sets `o.ladleAimed`, which `bankedCollar` honours, so the arena's one
unreadable tell is the same shape the region has shown a dozen times. Three of them:
the Anvil gate's weight (1 refusal), the Casting Line's belt (2, on two different
bays), the Mould Hall's walking feeder (3, and its wreck is the only step east).

**Rooms 2 and 3 are swapped** against the old charter table. A test cannot precede
its grant, so the Anvil is second (2800-6200) and the Casting Line third (6200-9200).

**The Sluice** (11640-12280) is the heat chapter's portal room: a mould whose setting
window is 0.23s, a coolant header to stand a mouth in, a slate under the mould. Carry
the cold to the stone. Building it exposed a real bug — the arena outlet anchor's
default 1500-unit envelope reached the whole room and silently demoted it to one-mouth
mode. Anchors may now declare `anchorRange`; the Foundry outlet's is 700. **If you add
a two-mouth room anywhere near an anchor, check its envelope first.**

**The exit goes down.** Three `foundryFissureCap` caps sit in the GROUND at the east
end; `shatterBrittle` refuses them while the Colossus stands. The crossing is height-
triggered inside `FOUNDRY_FISSURE_X1..X2` at y < -150, the void floor is exempt there,
and the OOB rewind now declines to fire while `G.physicalSeamCrossing` — a fall that
IS the road must not be undone. `colossus-inversion` became ember-colossus `south` ->
inversion `north` with authored arrivals at both ends, and the progression grid's
bottom row runs right to left to match the drawn map.

**Two harness facts worth keeping.** `updraftsVoidFloor` must be written stage-first:
several VM suites slice that one function and evaluate it bare, so a reference to any
outside constant has to sit behind a `G.stageIndex===...` short circuit. And the Browser
pane runs the real rAF loop, so scripted state drifts between calls — override
`window.update` with a no-op before framing a screenshot, and restore it after.

## 2026-09-18 Ember Colossus readability — Run 1 of the late-game order (7.124.0 / cache 213)
Work order: LLM-HANDOFF/16-LATE-GAME-WORK-ORDER.md. Runs 0 and 1 are delivered; Run 2
(the Foundry region) is next. Nothing committed, nothing deployed.

The gap 7.118-7.123 had no brief entry. What landed in it, recovered by reading the
code: the Colossus fight was rebuilt as "The Last Pour" (bed of six moulds, refusals
not HP, three acts and a Last Order), the Inversion got its capability grant and both
seams, the Citadel got its seams, and V4_LAST_STAGE went to 12.

RUN 0 — three regressions that the V4_LAST_STAGE=12 bump had caused:
- The Tyrant's pair-alignment readout was silenced by `quietV4` in placePortal. It is
  now exempt; it is the fight's only answer to "is my line right".
- The Tyrant's legendary had no delivery path (boss chests are gated past the v4
  boundary, which now includes stage 12). `completeTyrantReward` grants it in the
  world on the kill, equipped on contact, no chest and no bag.
- `alphaWrap` in the renderer ASSIGNED alpha instead of multiplying, so the arena's
  .22 dim did nothing to any structure that dimmed itself. It multiplies now.

RUN 1 — the fight reads. Rules unchanged; presentation and rule-count changed.
- THE BANKED BAY IS MARKED. Nothing showed which mould the machine was walking at,
  so the fight was a race to an invisible target. The mould now wears a raised
  collar with rising ticks plus two chevrons in open air above it, and the spout
  over that bay gathers. Four of six bays have a spout (the coolant header stands
  over the other two), so the MOULD carries the tell and the spout agrees with it.
- IT STANDS BEHIND THE BENCH at 2.2x, dark iron, drawn under the bed with its arm
  drawn over it. The arm reaches over the top and pours down into the bay from the
  player's side. A hit rims the silhouette instead of flashing 250px of white.
- THE JAM IS THE WAY IN. A sword swung from the bed misses the body in the pit by
  six units, by design. A grade-1 refusal now leaves the arm in the mould for the
  whole 1.6s expose window and melee finds it there (verified: 19 damage beside the
  arm, 0 from the next bay along, 0 once the arm pulls free).
- THE POUND, both of them. The player's strike has a dive pose, 3 frames of hitstop,
  a ring that runs along the struck surface and chips in the surface's own colour;
  setting a mould is now entirely blue-white, with no amber in the act of making
  cold stone. The machine's blow has one bay of reach (it was global), a hard shadow
  on the target for the full windup, and the mould opens ON the blow rather than
  0.35s before the warning — so reacting to the tell now saves the slab.
- TRIMMED: the shieldbearer add and the arena slag rain are out of the fight (the
  orphan story beat is parked in the source for Run 2's Mould Hall); the line
  reverses once mid-act after a second of dead line instead of every 5s.
- FIXED: striking the finale lid early permanently destroyed the only kill trigger
  and made the run unwinnable — it now refuses until the machine kneels. Dead
  `pourCapped` branch removed. `drawSlagBlock` was unreachable behind a duplicated
  `case 'trap'`. Damage numbers are off in this fight. The forge panel is a plain
  8-pip gauge; its wet-forge states died with the circuit.
- The renderer `<script>` tag was pinned at `?v=7.111.0`, so every browser has been
  running a renderer twelve versions stale. It follows VERSION now.

Verification: 12/12 ember-colossus-boss (two tests rewritten for the new rules),
52/52 across the neighbouring suites, 688/710 whole-suite with the same 22
pre-existing failures (white-court browser, tas-runtime, roster hygiene, harness
wiring). Live: a scripted perfect run reaches act 2 at 21.9s, act 3 at 42.7s, the
Last Order at 54.9s, kills, and builds the body bridge; the early-lid strike is
refused and the late one accepted; all 13 stages render without exception. Not
human playtest acceptance.

## Handoff / next steps
- 2026-09-18: Fable reviewed stages 9-12 (read-only) and wrote 16-LATE-GAME-WORK-ORDER.md
  for Opus: Colossus readability, Foundry teaching chain + downward exit, Emberdeep
  descent, vertical Inversion, mirrored Citadel. Assigned work starts there. Note this
  brief has no entry for 7.118-7.123; the work order's Run 0 covers that gap.
- 2026-09-16: owner chose the Fable Respec for Bladefall v4 (all levels through
  White Court redesigned on it, plus no bag, possible unique two-option item
  choices, fewer recurring characters, and a dedicated run per puzzle). Read 13-V4-RESPEC-WORK-ORDER.md before any v4 work. v4 is
  STARTED (2026-09-16): the respec renderer runs in-game for stages 0-8
  with per-region palettes, pixel structures, bosses, fluids and rotors (see
  the work order's progress log, runs 2-3)
  (public/bladefall-respec-renderer.js, toggle meta.rendererMode v4|classic),
  feel numbers ported, exit sign removed. First Outskirts, Black Woods,
  Causeway / Brute, Updrafts, Hollow Marksman, Keep, Gaol, Frostfell and White Court
  passes and shared no-bag cleanup are implemented; scoped audit completed. See
  15-V4-LEVEL-REDESIGN.md for current work and validation limits.
- Use this Projects path. Branch chore/track-authoritative-tree at 91be99f;
  8c07a2c contains gameplay backup. Both verified on origin; main remains 2d6fe28.
  This verification updates only this brief locally (not yet committed/pushed).
- Next validation, if requested: one bounded player traversal for pacing and
  difficulty feedback. Focused victory/Continue fixtures already passed.
  No TAS search or repeat broad suite by default.
- Owner assesses difficulty; do not autonomously add more phases or chase approval.
- Separate future recall work: read 12-RECALL-WORK-ORDER.md only if assigned that
  feature. Do not lose that pending design, or treat it as authorization to start.
- No merge, push to main, deployment, or deletion of the old iCloud copy was done
  in this verification. Netlify publishes public; main changes may auto-deploy.

## Look-and-feel respec (2026-09-15)
Owner judged the game solid through the frost sorcerer fight but the look basic
and the platforming feel loose. Two standalone respec pages are selectable from
the title screen in one grid row: "Astra Respec" (Astra's, do not read or edit)
and "Fable Respec" (public/fable-respec.html + fable-respec.js). Fable Respec is
self-contained and now covers the full movement trial: a 640x360 pixel buffer
with integer upscale, one twilight palette, pre-rendered sky/moon and three
parallax hill layers, brick-shaded platforms with grass caps and roots (rune-
edged "wall" solids mark cling faces), an animated hooded hero with trailing
cloak, squash/stretch, wall-cling and dash poses, dash afterimages, slime and
wisp enemies, glow, fog, vignette and a lookahead camera. Mechanics: run with
turn-around boost, jump with coyote/buffer/jump-cut/apex hang, double jump,
dash (Shift/C, .22s at 600, refills on ground or wall, kills enemies), wall
cling by holding into a wall with slide cap and wall jump (350/500, wall
coyote), and portals (velocity carried through, min 260 / max 640, exit read
by a camera snap). Base numbers mirror bladefall-movement-progression TUNING;
T opens a live tuner (21 sliders, Copy values), R restarts, ?inspect magnifies
the hero. Course (7600 wide, five checkpoints): basics, 200px double-jump pit,
320px jump-jump-dash pit, wall shaft with 48px doorway, run into amber portal A
-> launched from B over a pit, drop into cyan floor portal C -> flung from D
over a pit hands-free, rhythm stones, a 400px wall to climb over, then the
player-portal trial (2026-09-16): a Linked Portal memory orb (F sets ONE mouth,
only on pale slate panels, floor or wall while clinging; it links to a fixed
cyan anchor on a cliff top; a fresh press moves it) with a step stone and high
ledge above the floor slate so falling in launches ~300px out of the anchor vs
~70px for a hop, then a Twin Portals orb (F twice on slates, a third press
clears): floor slate at the foot of a 420px climb tower, wall slate on a 320px
pillar over a 300px chasm; dropping from the tower into the floor mouth flies
out of a high wall mouth across the chasm hands-free, a low one needs a dash.
Rules mirror placePortal/BFPortalProgression: feet-first entry for floor
mouths, exit speed from pre-landing velocity, a rest envelope so a mouth you
set or came out of stays quiet until you step off (no ping-pong), jump cut
applies only to real jumps, wall jumps commit. Floating feedback text matches
the main game's lines. Gate at 10480, level 10600 wide, eight checkpoints.
Scripted browser checks pass for each of these (debug hook __fableRespec
exposes step/draw so checks run without rAF when the pane is hidden). Both files are listed in
build-deploy.sh and sw.js CORE_ASSETS (cache v185, bumped by Astra). Nothing in
index.html imports the page. No deployment performed.

## Stable context
Opening through Warden accepted in substance. Frostfell is authored; White Court
has refuge workers/wheel, aqueduct, water/ice, Glassworks portal bridge, high cache,
gallery recollection/overlook. White Court arrival4800/0; exit15500 requires
Attunement. Public-folder Netlify upload is configured; no deployment performed.
White Court music: Floating Dream exploration, Abnormal Circumstances boss.
Preserve progression, endpoint identities, one-Blood damage and ordinary movement.

## Working discipline
Do not revive the previous giant goal or run TAS searches to certify difficulty.
Use focused mechanics checks, one visual check if useful, then owner playtesting.
Old first-phase-only winning policies/tests need adaptation where their final-death
expectation is obsolete. Do not weaken the new phase to keep old bot inputs green.
Since 2026-09-15 the project lives outside iCloud, so files are no longer evicted
to placeholders that hang reads. Never move it back under ~/Desktop or ~/Documents,
which iCloud syncs. The folder "~/Desktop/Bladefall-2D Antigravity (old iCloud
copy)" is a stale pre-move snapshot: never edit or test in it. netlify-cli 26.2.0
is installed in node_modules outside the lockfile, so prefer npm install over npm ci.
