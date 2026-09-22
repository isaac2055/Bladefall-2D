# Bladefall — current brief (7.169.0 · cache bladefall-v246 · 2026-09-22)

Read this first, then search the code. Rewritten in place on 2026-09-21; the previous
chronological brief (7.103–7.133) is `HISTORY-BRIEF-7.103-TO-7.133.md`, kept for traceability
only. **The code wins over every document, including this one.** Session-by-session detail for
7.134–7.166 lives in the owner's Claude Brain vault: `~/Vaults/Claude Brain/_System/Logs/2026-09-19..21-bladefall-*.md`
— useful for *why*, but several of its claims are wrong against the code (noted below).

## Project and rules
- Path `~/Projects/Bladefall-2D Antigravity` (outside iCloud since 2026-09-15; the Desktop path is a
  symlink; never touch `~/Desktop/Bladefall-2D Antigravity (old iCloud copy)`).
- Runtime: `public/index.html` (~25.8k lines: engine, every level, UI) + `public/bladefall-*.js`
  (51 modules; `bladefall-coop-journey.js` is plain functions over the page's globals, not a
  module object) + `public/bladefall-respec-renderer.js` (the v4 pixel renderer). Edit `public/`,
  never `netlify-deploy/`. **Never deploy to Netlify without explicit owner permission.**
- Branch `chore/track-authoritative-tree`; checkpoint commit `d7927b9` holds the full 7.166.0 tree;
  the 7.167.0 Deep Line pass, the 7.168.0 bow/boss pass and the 7.169.0 co-op pass on top of it
  are uncommitted.
  `main` is still at 2d6fe28. Commit or push only when asked.
- `USAGE-POLICY.md` still applies: targeted reads, one implementation pass plus one focused
  validation pass, a full suite only at integration boundaries.

## How the owner judges work (non-negotiable)
- **Every section is mandatory, or it is cut.** No optional side routes, coin climbs, chimneys,
  props without a job. One coin per stage, on the road.
- **Width gates nothing below ~800.** Full-kit reach is 671 flat / 726 off a 210 drop / 774 off a
  400 drop. Gate a verb with a mechanism (a plate, a door, a surface only it can use).
- **When the owner names a change, make exactly that change.** Report forced deviations with the
  number that forced them. The Citadel's second pass substituted redesigns and was rejected in capitals.
- **Felt impact, not mechanism.** Say what the player meets in the first minute from the real
  arrival. Load a region cold in the browser and look at the frame before calling it verified.
- No signs, banners, loot carpets, "memory missing" text or `1/3` counters. A switch needs
  visible feedback; a closed gate draws as a dashed outline, never as a floor.
- Level Select must give exactly the kit a real playthrough would have on entering that level
  (09-DECISIONS "Verification truthfulness").
- Frozen/accepted: Hollow Marksman balance; opening through Warden "complete in substance";
  Emberdeep `stillCamera` (no shake anywhere in it) and its owner cuts; Foundry owner cuts;
  White Court finale "longer AND harder". Region charters' OWNER CUTS sections override their plans.

## The world (code indices are 0-based; docs/charters are 1-based)
| # | Region | Level const | len | Walk | Verb granted | Owner status |
|---|---|---|---|---|---|---|
|0|Outskirts|LEVELS[0]|13800|E|jump|accepted in substance|
|1|Black Woods|LEVELS[1]|12400|E|weapon|accepted|
|2|Broken Causeway / Brute|LEVELS[2]|14000|E|dash|accepted|
|3|Updrafts|UPDRAFTS_LEVEL|18000|E|portal-single|accepted; return-spawn fix (7.164) unconfirmed; holds the **keel**|
|4|Hollow Marksman|HOLLOW_MARKSMAN_LEVEL|15000|E|portal-pair|accepted, frozen; holds the **mast**|
|5|Ruined Keep|RUINED_KEEP_LEVEL|18000|E|wall-jump|accepted; holds the **sail**; Deep Line boarding at far east|
|6|Gaol / Warden|WARDEN_LEVEL|15000|W|counter|accepted|
|7|Frostfell|FROSTFELL_LEVEL|15100|E|double-jump|"Love it"; Muster bell = world recall|
|8|White Court|WHITE_COURT_LEVEL|16000|E|attunement|beaten; harder finale built|
|9|Emberdeep|EMBERDEEP_LEVEL|16400|E, then down|companion-command|failed 09-19, fixed, re-playtest pending|
|10|Foundry / Colossus|FOUNDRY_LEVEL|16600|E, exits down|downward-strike|played 09-21, fixed 7.164, pending|
|11|Inversion|INVERSION_LEVEL|16100|W, down|gravity-flip|rebuild accepted; Last Breath pending|
|12|Paradox Citadel / Void Tyrant|VOID_TYRANT_LEVEL|17000|W|—|4th playtest pending (7.166 restore)|
|13|Drowned Throne / Right Hand + Abyss King|ABYSS_KING_LEVEL|18600|E|the Echo (stage-local verb)|fixes 7.157, pending|
|14|(cut Gilded Vault)|— inert slot|—|—|—|kept so later indices keep their numbers|
|15|Deep Line|SECRET_LEVEL / SECRET_LEVEL_RETURN|13950|cart E; mirrored return W|—|played 09-21; 7.167 return fixes (Level Select, westbound lean, switches) pending; content is still procedural-era|

**Road:** 0→1→2, back to 1, wind shaft→3→4→5, west back to 0, west breach→6 (walked west)→mine→7,
back east, Causeway high shaft→8→9→10→fall into 11→12 (west; the Tyrant withdraws, his seam is the
road)→13 (east; Right Hand at 5850, King at 17200)→15 by cart eastbound→surfaces at 5's far east.
**Act 1 ending:** after the Frostfell bell, claim keel/mast/sail (stages 3/4/5) → board at the Keep's
far east → mirrored westbound Deep Line → Throne (18300,0) → the hole's lid (17600–17980) is gone
once the ship is whole → beach at y=-900 → boat → "END OF ACT ONE / ACT TWO / The Thunder Cliffs",
then the title screen. That card is all of Act 2 today.

## Engine orientation (grep anchors in public/index.html)
- **Level blocks:** `^const [A-Z_]*_LEVEL=`, `^const CUSTOM_LEVELS` (keys 0–13, 15), `resolveCustomLevel`
  (stage 15 direction from `G._pendingZoneEndpoint`, kept in `G.deepLineReturn`).
- **Helpers:** `Pl` (h14) · `Gr` · `GrAt` (ground at a height) · `Slope` · `Sp`/`FJ`/`WSp` · `Wl`
  (cling) · `Slate`/`SlateWall` (only surfaces that hold a player mouth) · `Br` (brittle) · `Plate`
  (`circuitOpen(id)` = every plate with that id pressed) · `LPortal`/`FixedPortal`/`Anchor` · `Seam`
  (dash-entered zipline; `gate`, `setDown`, `once`, `period`) · `Roof` (ceilingOnly) · `Spent`
  (crumbles once, 0.45 s fuse — its `collapseDelay` is ignored) · `RailSwitch`/`RailCollapse`.
- **Loading:** `loadStage` → `resolveCustomLevel` → `buildCustomLevel` (objects, `L.build()`, cart
  setup, circuits, enemies, boss or boss-skip, the `apply*` passes) → `activateZonePersistence`
  (muster roster if recalled, recall routes, ship parts, court connections, hydrate, rest site,
  entrance checkpoint). There is no engine `reloadStage`; `__BF.reloadStage` is `loadStage`.
- **Frame order in `update(dt)`:** region keepers → input buffers → hitstop gate (early return) →
  obstacles → dash / cart block / run → `placePortal` → flip → jump → x move + wall sweep → player
  `portalTransit` (skipped while riding a seam or a cart) → gravity → floor/ceiling → spikes,
  checkpoints, out-of-bounds → camera → `updatePhysicalWorldSeams` → enemies → projectiles →
  **`updateSeams` near the very end** so a ride's position survives collision.
- **Out of bounds:** `p.y < updraftsVoidFloor(p)` (default -50, per-stage clauses written stage-first
  because tests eval that function bare) or `p.y > CEIL_Y+400 = 2000` → rewind to checkpoint.
  Nothing may be authored above 2000.
- **Datum:** only `levelFloorY(x)` and `cameraMinimumY(p)` may read `.datum` (a test enforces it).
  Only Emberdeep declares one (ED=640). Anything installed at runtime uses the level's datum.
- **Authored bosses must early-return before `bossArena`'s purge** (1,270-unit sweep) and before
  `applyFinaleActRemaster`. Record your own clear when a seam is gated on a boss.
- **Up interactions compete:** `outskirtsInteractionCandidate()` picks ONE nearest target by a
  distance score, and a scenery prop is only ever a target if `outskirtsAuthoredInteractable()`
  lists it. Two Up targets on one spot make one unreachable (the sail sat on the Keep Key), and an
  unlisted prop can never be used (the throne boat). Check both when placing anything Up-driven.
- **Zone entity ids are index-keyed** for enemies without an authored id
  (`enemies:type:x:y:index`, `buildZonePersistenceManifest`). Never remove an enemy from
  `G.enemies` before the manifest is built — every later body's stored identity shifts.
- **Physical seams:** `physicalSeamSpec()` (hand-written per stage) + `updatePhysicalWorldSeams`;
  gates checked by `bladefall-zones.js eligibility()` against `zoneTraversalState()` (capabilities,
  `meta.world.cleared ∪ G.sessionClearedZones`, `openedConnectors`, vault keys).
- **Renderer:** `SUPPORTED_STAGES` (0–13, 15) decides whether the pixel renderer draws a stage at
  all; `INTERIOR_STAGES` {9,10,11,12}. New object type → a `case` in the renderer's `switch(o.type)`
  or a `byType` bridge in `respecLegacyDrawers` (index.html); `legacyDraw` fails silently. Engine
  state reaches the renderer only through `respecLegacyDrawers` predicates. Tests regex the
  one-line `SUPPORTED_STAGES = new Set([...])`.

## Kit and numbers (TUNING in bladefall-movement-progression.js; gravity 1400 is a literal)
- Run 200 · jump 480 · second jump 450 · jump cut 220 · dash .22 s at 3× · wall jump 350/500 ·
  coyote .1 · y is up, **vy is positive downward**. 60 Hz fixed step.
- Capability ladder is prefix-closed (owning step N means owning 1..N): jump, weapon, dash,
  portal-single, portal-pair, wall-jump, counter, double-jump, attunement, companion-command,
  downward-strike, gravity-flip. Level Select grants every ability whose stage is **below** the
  entered stage. The Echo is stage 13 only and is not a capability.
- Weapons: after the Causeway, B swaps bow ⇄ Oathblade (`swapWeapon`, `p.stowedWeapon`); both infinite.
- Portals: exit speed = `ejectSpeed` or clamp(incoming,150,1400) along the exit normal; `_tpCd` .7.
  Seams: mouth 46, ride 1150, exit 640; a portal taken inside a seam's ballistic window ×2.4 (cap
  1200, side-mouth lift 1100). **Any player transit leaves no air jumps.**
- Double-jump apex ≈148 (continuous formula 154.6). The Knowledge note's "standing rise 210" does
  not reproduce from jump+double-jump alone (≈148); it probably included a dash. Measure in the
  engine before designing a tower against it.
- Cart (stage 15 only): see `G.cartMode`, `G.cartDirection`, `G.cartLean`, `RailSwitch`,
  `markRailTrestles`. Dash, slam, portals, echo and fields are off in the cart. `cartLean` is
  measured along the ride (+1 = the key pointing where the cart goes, either direction). A brass
  switch decides as the cart passes its post: lean > 0.18 → high line with a fixed launch floor.

## Level Select and saves (known sharp edges)
- `beginRun(..., {startStage:i, levelSelect:i!==0})` — stage 01 is NOT Level Select mode.
- Level Select seeds `sessionCapabilities`, fresh `sessionQuests` and a session zone state, and
  (7.167.0) `seedLevelSelectPriorWorld` treats every earlier stage as won: session clears for
  zones below the start plus the Keep key, Frostfell bell (not under the harness) and the three
  bossSkip latches. `worldProgressEligible=false`, so `recordWorldClear` never runs; the Tyrant
  and King kills also add session clears. Continue keeps them (`savedRunSession`).
- `meta.run` is one slot: a Level Select checkpoint overwrites the campaign Continue.
  Level Select also still writes `meta.recovery`, some `meta.zoneState` latches, `bestStage/reach`.
- `musterRecalled()` grants a Level Select amnesty for stage ≥ 8 and the ship stages 3/4/5.
- The vault logs say `openedConnectors` "is written by the crossing" — **nothing writes
  `king-deep-line` or `deep-line-keep` into it**; that bypass only passes in unit tests.
- `winGame()` (credits, NG+ unlock, `meta.secretCleared`) is reachable only through `nextStage()`,
  which only a completion portal or the co-op gate calls — and no campaign stage has a portal now.

## Harness
- `node --test` runs the 93 files in `tests/` (~4 min). **Baseline at 7.169.0: 847 / 825 / 22.**
  Failing set: white-court 9, backtrack-doors-runtime 4, hollow-marksman-runtime 2, one each in
  baseline, bot, brute-stage, frostfell-runtime, movement-progression, tas-runtime (basic jump),
  weapon-progression. Diff every run against this set by test name.
- `tests/coop-runtime.test.mjs` drives two isolated Chrome contexts with an in-page PeerJS stand-in
  relayed by the test (no internet). Its relay slows under full-suite load, so teleport both knights
  with `placeBoth` (it re-places until both machines agree) — never one alone, or the tether acts
  on stale positions.
- Stage tests slice `index.html` between two markers and eval in a `vm`; a new constant or
  constructor used by a later level can break an earlier level's slice. VM arrays need `[...]`
  before `deepStrictEqual`. Each test file has its own helpers — read its harness first.
  Several VM tests stub `V4_LAST_STAGE:9`; the real value is 15.
  Other tests read one function's source by name (`fn('slamImpact')`, `fn('updatePhysicalWorldSeams')`)
  and match exact text (`recordDeath(meta.recovery,zoneId,fallback)`): keep new behaviour inside the
  function a test reads, and put a new helper where every slice that calls it can see it (7.169's
  first co-op pass broke 19 tests this way, all fixed).
- TAS (`?tas`): `resetGame()` boots stage 0 with only `jump`; set `G.sessionCapabilities` BEFORE
  `__BF.reloadStage(n)`, then step one frame. `scripts/level-probe.mjs` does this, runs its own
  headless Chrome, and does macro BFS with `forbid` predicates (its `--validate` room-3 case is stale).
  `scripts/necessity-audit.mjs` answers "can this section be skipped" for stages 11–13.
- **Browser pane:** hidden pane → rAF stops, canvas composites black. Use `__BF.drawFrame()`, blit
  the canvas into an `<img>`, wait ~1 s, then screenshot. Freeze a live loop with `window.update=()=>{}`.
- **Cache stamps are manual.** Bumping `VERSION` (index.html) and `CACHE_NAME` (sw.js) does not
  bust a module: bump that module's own `?v=` in its `<script>` tag (only 8 carry one). When a
  correct edit "does nothing", unregister the service worker and delete caches.
- `./build-deploy.sh` rebuilds the mirror (a new public file must also join its `ASSETS=` list);
  `npm run release:check` is stamp-aware and exits 1 only on astra-respec.js / fable-respec.js
  (standalone pages, by design). Anything else it prints is real, including the 1.6 MB `index.html`
  budget — 7.169 moved the co-op journey code out to stay under it.

## Open items (not scheduled unless the owner asks)
- Owner playtests pending for 9–13 and 15 (see the table).
- The Abyss King's leftward approach (needs an 86-entity eastward shift of the Throne).
- Crownguard has no AI role / ecology profile. Hollow Marksman is excluded from roster hygiene.
- Citadel: 35 object-level skippables unexplained (all six sections are "the road").
- Colossus act-checkpoint restore never exercised in a live death.
- Deep Line: six acts are the procedural-era design; no charter.
- Act 2: no stage, zone or music exists; `meta.actTwoReached` is write-only. Adding a stage trips a
  boot-time 16-blueprint check, the `'/ 16'` banner, SUPPORTED_STAGES and ~9 count-asserting tests.
- The master vision's endings still assume the Gilded Vault; the direct/truth endings are unreachable.

## Latest pass
_See `01-CURRENT-STATE.md` "Latest change" for the most recent work and its verification._
