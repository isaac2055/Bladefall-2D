# 13 — Bladefall v4: the Fable Respec work order

Owner decision (2026-09-16): the Fable Respec wins. Bladefall v4 = redesign every
existing level (opening through the frost sorcerer / White Court) on the respec's
look and feel while fixing the design-fatigue problems listed below. Renderer
conversion and part of the feel pass are implemented; see §6 for actual scope.
The earlier documentation-only hold is historical. Owner reaffirmed Fable on
2026-09-16 and asked Astra to study and extend that direction. Region redesigns
remain bounded work, one region/puzzle at a time; no wholesale rewrite implied.
Read 14-V4-EXTENSION-CONVENTIONS.md for Astra's inspected integration map.

## 1. What exists (the reference implementation)

- `public/fable-respec.html` + `public/fable-respec.js` (~580 lines, IIFE, no
  imports; nothing in index.html imports it). Title screen button "Fable Respec"
  (index.html, `fableRespecBtn`, next to Astra's slot). Listed in build-deploy.sh
  and sw.js CORE_ASSETS. Do not read or edit Astra's `astra-respec.*`.
- Open it from the title or `fable-respec.html`; `?inspect` paints a 4x hero crop
  top-right; `T` opens the live tuner (all TUNE values, Copy values = JSON to
  clipboard); `R` restarts; debug hook `window.__fableRespec()` returns
  `{player, cam, enemies, hp, won, TUNE, caps, playerMouths, anchors, texts,
  step(dt), draw()}` — scripted checks call `step(1/120)` in loops so they work
  even when the browser pane is hidden (rAF paused). Re-fetch the hook after any
  respawn: `player`, `texts`, `playerMouths` are reassigned on reset.

### Look (the pixel pipeline)
- 640x360 buffer, `Z = 0.5` world→buffer, integer CSS upscale, `image-rendering:
  pixelated`, every draw rounds to buffer pixels. `R()` draws in world units,
  `B()` in buffer units.
- One palette object `P` (twilight ramp). All colours come from it. Add colours
  there, never inline.
- Pre-rendered layers: sky gradient + stars + moon halo, three hill silhouettes
  (parallax .15/.3/.5, drawn at `y = 30 - oy*py`, 420 tall so pits never show
  raw sky), vignette. Fog bands drift by `time`.
- Solids: brick courses via `hash(x,y)`, lit top-left / dark bottom-right edges,
  grass cap + tufts, roots under `float` stones, drop shadow. `wall:true` solids
  render rune-edged faces instead of grass (the cling affordance).
- Hero: `drawHero(x,y,face,ghost)` ~13x22 buffer px: hood, glowing eyes, tunic,
  scarf, cloak rows that trail against velocity and lift in air, run cycle from
  `p.anim`, squash/stretch from landing/jumps, wall pose with hand, dash pose
  (scaled 1.18/.86) plus afterimage ghosts, blade sheathed (glint) or a stroked
  arc on strike. Hurt flicker via `hurtT`.
- Enemies: slime (squash by state, blink, drips), wisp (additive glow, tail).
  Hit flash white, death burst, dash-through kill.
- Post: additive hero light, vignette, HUD (pixel hearts, ability pips, portal
  mode, timer), floating texts (`say()`), signs, gate glow.

### Feel (TUNE, defaults = main game TUNING where one exists)
run 200, groundAccel 22, turnBoost 1.8, airAccel 9, airDrag 1.2 (no input in the
air keeps momentum), gravity 1400, fallCap 900, jump 480, secondJump 450,
jumpCut 220 (only on real jumps: `jumpCutOk`), apexScale .55 in |vy|<60 while
held, coyote .10, buffer .12, dash 600 for .22s, dashGravity .15, dashFallCap
140, dashCooldown .30 (refills on ground/wall; kills enemies), wallSlide 80
(only while pushing into the wall), wallJump 350/500 committed (no cut),
wallCoyote .09, re-grab only when vy > -60, camLook 90 + vx*.28, camLerp 4,
portalMin 260 / portalMax 900. Hitstop .04–.08 on hits, screen shake, dust.
Sub-steps when dt > 1/100 so dash speeds never tunnel.

### Mechanics rules worth keeping verbatim
- Jump order: coyote ground jump → wall jump (onWall or wallCoyote) → second
  leap (`jumps===1`). Walking off a ledge past coyote leaves one air jump.
- Portals: entry needs velocity into the mouth (dot < -40) using the
  PRE-collision velocity (`pvx/pvy`, saved at the top of moveBody); floor mouths
  are entered feet-first; exit = mouth centre + normal*(half + hero half + 6);
  exit speed = clamp(|v|, portalMin, portalMax) along the exit normal; camera
  snaps 60 % of the way; `restMouth/restKind`: a mouth you SET ('placed') is
  quiet until you step off or hop 30px clear; a mouth you CAME OUT OF ('exit')
  is quiet until you leave sideways or stand somewhere else (kills ping-pong).
- Player portals mirror `placePortal` + `BFPortalProgressionModule`: mouths hold
  only on `slates` (floor / left / right facing); floor mouth 80x28 under the
  feet, wall mouth 16x80 on the player's side of the face while clinging;
  'single' = one mouth linked to the nearest fixed `anchor` (a fresh press moves
  it), 'pair' = two mouths, third press clears; picking up a new memory clears
  old mouths. Feedback strings are the main game's.

### Level data schema (all world units, GROUND 560, tile 32)
`solids[{x,y,w,h,float?,wall?}]`, `slates[{x,y,w,h,side}]`, `portals` (authored
pairs by id/to), `anchors`, `pickups[{x,y,kind}]`, `signs`, `spawnEnemies()`,
`checkpoints[]`, `gate`. Course sections and the move each pit demands are
commented inline in `solids`. Current course: basics · 200px double-jump pit ·
320px jump-jump-dash pit · wall shaft (48px doorway) · authored portal launch ·
floor-portal fling · rhythm stones · 400px wall · Linked Portal trial (ledge
drop = ~300px pop vs ~70px hop) · Twin Portals trial (tower drop → wall mouth
→ hands-free 300px chasm) · gate at 10480, width 10600.

## 2. Porting plan (recommended order)
1. Presentation layer first, as a switchable renderer inside the main game
   (`bladefall-renderer.js` / `bladefall-presentation.js`), not a rewrite of
   index.html: pixel buffer, palette, layered backdrop per region, tile shading,
   hero/enemy sprites drawn procedurally from entity state. ~80 `draw*`
   functions in index.html are the surface to replace; keep old draw code alive
   behind a flag until a region is converted, then delete it per region.
2. Feel: fold TUNE into `bladefall-movement-progression.js` TUNING (most values
   already match); add turnBoost, airDrag, apex hang, jumpCutOk gating,
   committed wall jump, pre-collision portal speed, rest-mouth rule, hitstop.
   Re-tune with the T panel, then freeze values into TUNING and adapt tests.
3. One level end to end (owner picks; suggest the opening) with the v4 design
   rules below. That level becomes the template and the visual bible.
4. Remaining levels one per run, each with its own puzzle pass; then bosses.
5. Tests: old bot inputs/receipts assume old geometry; do not weaken v4 to keep
   them green. Keep dependency-free node checks like tests/white-court-final.

## 3. v4 design rules (owner, 2026-09-16 — the brief for every level)
- Look and feel per §1. Look first, feel second, both before content.
- NO BAG. The player never opens an inventory. Progression powers stay. Items
  like wards may remain, but obtaining/using them must never require opening
  a bag. Owner suggested (not yet a fixed system): certain pickups could offer
  two alternatives at acquisition, with no repeated options across the game.
  Do not turn every pickup into another decision. Keep the active mental load
  small; Pac-Man World 2 is the owner's reference for bag-free play, not a
  request to grant every progression power at the start.
- Hints come from reduced fatigue, not signage: e.g. the bow beside the three
  Brute-gate targets auto-equips instead of going to the bag. Remove blatant
  signs and text banners where the design itself can point (133 `addText`
  banners and ~45 signs exist today; most should go). Keep immersion.
- Harder is fine (later portal puzzles especially) but the player must never
  be lost or feel walled. Each puzzle gets its own dedicated run so none are
  weak copies; current portal puzzles are too simple and too similar.
- Address enemies that take too much effort to kill: review durability,
  openings, pacing and feedback; better hit effects alone are not a solution.
- Dialogue: fewer characters, less text, recurring across the whole game.
  Cut the sprawling cast; improve the writing as well as its quantity. Give
  recurring characters a purpose and continuity across levels.
- Preserve: progression order, endpoint identities, one-Blood damage, ordinary
  movement numbers (tune, don't replace), no Netlify deploy without approval.

## 4. Size estimate (ballpark, Claude-class effort)

Fable's unvalidated planning estimate, not an owner-approved budget or schedule.
Large, not huge. Renderer port 3–5 focused runs; feel port 1–2; systems (no bag
→ choice pickups, auto-equip hints) 2–3; per-level redesign 1–2 runs each for
~7 regions plus bosses; dialogue/cast 1–2; test adaptation ongoing. Roughly
15–25 runs, tens of millions of tokens, a few weeks of calendar at one or two
runs a day. Rewriting index.html from scratch instead would be huge; the
switchable-renderer route keeps it large.

## 5. Astra takeaways (proposals, not additional owner requirements)
- Reduce management, not mastery: preserve meaningful movement/combat and make
  later puzzles harder through distinct ideas, not obscure rules or busywork.
- The Brute bow example is the model: acquisition immediately enables the
  relevant action. Composition, tool readiness and visible world reactions
  should explain affordances before adding instructions.
- Each dedicated puzzle pass should identify its unique idea, what the player
  can infer, visible feedback for attempts, and a quick way to retry. Check
  that failure teaches something and cannot strand the player or lock progress.
- Acquisition choices must not let a player discard a mandatory gate-solving
  capability. Auto-equip should not silently remove another required tool.
- Audit every redesigned level for bag dependence, unnecessary decisions,
  repetitive puzzles, tedious kills, and dialogue that adds no useful meaning.

## 6. Progress log
- 2026-09-16 (Fable): STARTED. Step 1 landed as `public/bladefall-respec-renderer.js`
  (`BFRespecRenderer.render(ctx, env)`, `supports(stageIndex)`, `SUPPORTED_STAGES`
  = {0}). Hooked in index.html `render()` right after the camera shake is
  computed: when `useRespecRenderer()` is true the module draws the world into
  a VW/2 x VH/2 buffer (Z = .5, world y-up mapped by `WX/WY`) and blits 2x with
  smoothing off; then `renderScreenTail(ctx,s,{skipVignette:true})` draws the
  main-canvas extras (HP pulse, combat cue, combo, progress bar, banner, room
  card) — that tail was extracted from render() and is shared with the classic
  path. Toggle: `meta.rendererMode` 'v4' (default) | 'classic', a Renderer
  select in Settings next to Graphics Quality. Converted in v4 style: deep
  ground slabs (brick face + dark earth to frame bottom), plats (float roots,
  crumble variant), walls (rune faces), hero via `drawFigure` (state from
  G.p: onGround, vx/vy, dodgeTimer = dash + afterimages, atkTimer arc when
  p.weapon, hurtFlash/invuln flicker, onWall/wallDir cling pose, dead/downed),
  grunt (scaled by e.h for the sentinel), shadeling, residents/NPCs as figures
  with palettes (ash/watcher/survey), props by scenery kind (tents, watchfire,
  trumpets, survey post, milestone, palisade, kit, signal mast, lantern,
  mothlight gate, dead clock, caches, standard, pylon), checkpoint, spring,
  updraft, survey stake, sign, coin, relic, restSite brazier, particles (in
  world-transform space), floating texts, hero light, vignette, abyss below the
  ground line. Everything else falls back to the legacy drawer on the scaled
  buffer context (`respecLegacyDrawers()` map in index.html). v4 hint pattern:
  `nearGlow()` makes stakes, lore signs, relics and unmet residents breathe when
  the hero is within 140 world units instead of a text prompt.
- Step 2 (feel) partially landed in the main game: platformer precision profile
  groundAccel 22 / groundTurn 40 / groundBrake 22 / airAccel 9 / airTurn 14
  (air no-input momentum already carried via airOverspeed 1); TUNING jumpCut
  220 + apexGravityScale .55 / apexBand 60 with the apex hang in update()'s
  gravity; wall jumps commit (jumpCutOk=false). Not ported yet: hitstop,
  portal pre-collision speed / rest-mouth rule (no portals in stage 0), camera
  lookahead numbers (BFCamera has its own assist). tests/platformer.test.mjs
  expectation updated to the new accel; 14/14 focused tests pass.
- Step 3 (opening level) begun lightly: exit Sign removed (the lit mothlight
  gate is the cue); geometry untouched pending owner playtest of look + feel.
  Version 7.102.0, sw cache v186, mirror rebuilt, nothing deployed/committed.
- Verified: stage 0 renders in-game at x≈0, 420, 3000, 3650, 13300 via
  `beginRun(0,null,{hp:1,dmg:1},{intro:false})` + `update()` + `render()`
  from the console (the hidden browser pane pauses rAF; drive frames manually).
- Next: owner playtest of The Outskirts → then the geometry/pacing redesign of
  the six rooms under §3, then Black Woods (stage 1) with the weapon reveal.
- 2026-09-16 (Fable, run 2): v4 renderer extended to ALL stages 0-8
  (`SUPPORTED_STAGES`). Per-region palettes in `THEMES` (plains, forest,
  badlands, canyon, ruins, dungeon, frost): sky ramp, moon on/off, three hill
  silhouettes with a shape per region (hills / trees / mesa / ruins / arches /
  peaks), masonry colours, cap (grass, moss, dry grass, bare stone, snow),
  fog and ambient motes (dust / leaves / snow). New pixel drawers: floor and
  wall spikes (use legacy `spikesUp/spikesWarn` for state), doors (`doorOpen`),
  levers (+ brute rivet targets), crystals, crates, plates, chests, wind
  fields, updrafts; enemies grunt / toxling / frostling (walker palettes),
  shadeling, flyer, rifthound, gargoyle, stormmote, sparkling; NPC palettes
  escort / windwright. Bosses (brute, archer, warden, sorcerer), fluids,
  rotors, lowg, lportals, rune emitters, spell siphons, pickups, court
  architecture, drawCourtFinal / drawCircuitLinks, crate portals and any
  scenery kind not in `drawProp` draw through their legacy functions on the
  scaled buffer (`legacyDraw`). Interaction verb prompt extracted to
  `interactionPrompt()` in index.html and drawn in both paths; the v4 branch
  also calls `drawFrostMusterAtmosphere`. Ceiling slab drawn when
  `G.hasCeiling` (none in 0-8). Verified: every stage 1-8 renders at three
  positions with no exception (loadStage(i) + update + render from the
  console), screenshots reviewed for 1, 2, 3, 5, 6, 7, 8. Not done: stages
  9-15 (volcano / void / apex themes stay classic), pixel versions of bosses
  and region structures, level geometry redesigns, hitstop.
- Conversion queue for later runs (highest value first): Black Woods props
  (root arches, resin racks), the weapon/armor pickups (legacy glow + label),
  Causeway gears / hoist / bow rack, Updrafts sails / signal crown / kite
  stairs, Keep gatehouse + belfry, Gaol cells + hush engine, Frostfell houses
  / aqueduct / muster engine, White Court wheel / glassworks / doors, then the
  four bosses as pixel figures, then fluids and rotors.
- 2026-09-16 (Fable, run 3): region structures, bosses, fluids, rotors.
  `STRUCT` table in the renderer maps ~95 scenery kinds (Black Woods roots and
  racks, Causeway gears / hoist / gate / bow rack, Updrafts sails / lifts /
  signal crown / plinth / seal, Marksman frames / racks / towers, Keep clock /
  hearth / arches / belfries / halls / vault key / mason's grip, Gaol halls,
  cells, thresholds, vigil, hush engine, Frostfell houses (warm windows follow
  frost-hearths / frost-thermal circuits), tower, aqueduct, mine mouths, muster
  engine (spins when the frost-muster circuit is open), plaques, White Court
  wheel / channel / bench / overlook / lockbox / doors / ember door / refuge /
  glassworks / gallery) onto pixel primitives (`frame, hall, house, tower,
  arcade, wheel, cog, mineMouth, chain, plaque, sail, stepArc`) sized from the
  legacy defaults (world units x Z). Kinds not in the table still fall back to
  legacy `drawScenery`; room-scale landmarks (w > 2000) are skipped because the
  backdrop carries them. `courtArchitecture` panels remain legacy.
  Bosses: `drawBossFigure` for brute / archer / warden / sorcerer (size from
  e.w/e.h, walk cycle, attack lean, hit flash, rage from `lunge` or phase 2
  with red eyes + ember motes, Warden shield on `shieldFace`, Sorcerer staff and
  orbiting shards). Boss telegraphs that lived inside legacy drawEnemyFull are
  not reproduced; AOEs / projectiles still come from legacy drawers.
  `drawAwareness` restores the stage 0 / 1 patrol perception cones. Fluids:
  `drawFluidV4` fills pixel columns under `BFFluidSystem.renderPoints` with
  body / deep / foam from `BFFluidsModule.typeOf`. Rotors: `drawRotorV4`
  dashed hazard bar + hub. Verified: stages 1-8 render at three positions
  without exception; screenshots reviewed at the Brute, Updrafts pool and sails,
  Marksman, Keep gatehouse, Gaol hush engine with rotors, Frostfell muster
  crown, White Court cold rand with the Sorcerer, Black Woods root arch.
  Remaining visual debt: legacy court architecture panels, pickups, lportals,
  rune emitters / spell siphons, boss telegraphs, undersized stage-0 small
  props (tent / palisade drawn at roughly half the legacy footprint).
- 2026-09-16 (Astra, step 3): first Outskirts, Black Woods, Causeway / Brute,
  Updrafts, Hollow Marksman, Ruined Keep, Gaol / Warden, Frostfell and White Court
  passes and shared cleanup implemented and mirrored at 7.112.0 / cache 197.
  Owner clarified: retain physical telegraphs; avoid explicit warning text.
  Direct equipment/rewards, deliberate recurring residents, distinct repair
  mechanisms and truthful pixel cues now cover these regions. Updrafts adds
  cinder + damper repair, fixed cup catches, Needlewind recovery, recessed basin
  camera and directly fitted Gale Stitch. Updrafts 21 + camera 8 checks pass;
  bounded browser/Continue checks passed. Marksman adds a recoverable Gallery
  drop launch, committed bow/rush tells, delayed cover collapse, recurring Daro,
  direct Far Thread and a compact pair reward. Marksman 31 checks pass; browser
  checks confirm real cover and Continue retaining the cleared court. See
  15-V4-LEVEL-REDESIGN.md for details and prior receipts. Keep adds three named
  payload catches, moving bell receiver, direct Grip, Archive recovery/lift and
  Oren recurrence; 23 focused checks and bounded physics/Continue checks pass.
  Gaol adds the two-brake Hush machine, cell cage/high-low route, safe catch floors,
  Enna recurrence, committed Warden tells and saved Counter/mine access. 30 focused
  checks pass; live portal, brake, reward and Continue checks completed.
  Frostfell adds automatic Nim/hearth progression, a timed thermal duct shutter,
  direct Double Jump, moving dry rafts/catches, saved service routes and a stateful
  pixel muster bell; 17 focused checks and bounded thermal/reward/Continue checks
  pass. White Court now has a distinct rising-cold Gallery crossing/recovery,
  recurring Vey, pixel architecture/machinery and truthful Sorcerer tells.
  Harder boss phases remain, with committed rush direction and stationary cast
  follow-ups; direct Attunement/White Hush and post-victory Continue are covered.
  26 focused checks and bounded live projectile/victory/Continue checks pass.
  Shared no-bag cleanup is delivered: direct reversible gear swaps, one Mantle,
  tools carried on purchase/switched at sellers, passive early Echoes, read-only
  Journey and a gold/Seal Forge. Legacy stored items remain intact. Anonymous
  materials and portal text prompts are quiet through8.31 focused shared and
  affected-region checks pass; menu, upgrade/save, tool-switch and pickup browser
  checks pass. Scoped audit found no implementation blocker. Step3 implementation
  is delivered; await owner feedback. Continuous traversal, live co-op and human
  aesthetic/difficulty acceptance are not claimed. Nothing committed or deployed.
