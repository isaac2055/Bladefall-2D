# The Ember Colossus — "The Last Pour" boss design plan

Status: design, 2026-09-17, second draft, post-audit. This supersedes the
out-of-scope clause in `docs/charters/11-ember-colossus/DESIGN-PLAN.md`, which
reserved the fight and declared the wet-forge circuit "unchanged in shape." The
owner has played it and called it extremely easy; it runs about twenty seconds
against a two-to-three minute standard. This run reopens it. The region charter's
local rule, spatial outline, escort and recollection all stand.

Every line number in this document is either one an auditor confirmed against
source or one re-opened and checked during this revision. Where the first draft's
arithmetic was wrong, the real number is here, not a footnote. §9 lists every
correction.

**On the score board.** The aggregate handed to this run reads `DESIGN 3 = 14.5`
as the leader. That number is an artifact of label matching: two judges wrote the
identical string "DESIGN 3: The Last Order" and their scores summed, while the
third judge's entry for the same design — "Design 3: The Last Order (production
line, standards, Oren)", **3.0, last place** — was counted as a separate design.
Summed honestly by design, the board is Design 4 = 24.0, Design 1 = 23.0,
Design 2 = 23.0, Design 3 = 17.5, Design 5 = 17.5. Design 3 is fourth, and the
judge who ranked it last did so on the fun lens — the exact lens this run exists
to answer. This plan is built on **Design 4's vertical arena** carrying
**Design 1's damage condition, act gating and ending**, with the named grafts
from 2 and 5 and every flagged defect removed.

---

## 1. What exists and must survive

### The fight as it stands

`setupFoundryBoss` (`public/index.html:5552`) runs a wet-forge circuit. The
Colossus fires a molten shot; a floor mouth catches it; the fixed exit sends it
through the authored water channel so it picks up `coolantWet`; the current walks
it into `ForgeCoolant` and `coolMoltenShot` (`:11772`) turns it into an obsidian
slug worth `maxHp/forgeHits+1` (`:11788`). Six slugs kill it. Between slugs it
advances at speed 80, telegraphs a rush, drops eruption AoEs under `hpR<0.8` and
lays a fire trail (`:14010-14036`).

It dies in twenty seconds for **four** separate reasons. The first draft named
three; the audit found the fourth, and it is the one that makes the others worse.

1. **The fight's length is arithmetic.** `e.forgeHits=6` (`:5553`) against
   `shootCd:2.2` (`:626`) means the boss hands the player its own ammunition
   every 2.2 seconds. Six shots is 13.2 seconds of supply. The generic ENRAGE at
   `hpR<0.50` (`:14105`) sets `e.phase=2`, and `:13934` then multiplies the
   cadence by 0.6 — 1.32s intervals.
2. **`exposeT` is an uncapped gate bypass.** `if(e.portalGate && !(e.exposeT>0)
   && src!==e.portalGate){bossDeflect(e);return;}` (`:10226`). A landed slug sets
   `e.forgeStunT=0.8` and `e.exposeT=Math.max(e.exposeT||0,0.8)` (`:14434`), and
   for 0.8s *every* damage source lands with no ceiling: `:10268` computes
   `rawDamage` and `:10271` subtracts it whole. A late-game weapon shaves whole
   slugs off the six.
3. **`dotDamage` has no portal gate at all.** `dotDamage` (`:10190`) is a wholly
   parallel path — `e.hp-=amt` at `:10196`, `killEnemy(e)` at `:10199` — with
   five live callers and no `portalGate` test anywhere in it. A burn or bleed
   applied inside an expose window (via `applyStatus` at `:10287`, which is
   itself inside `hitEnemy`) keeps stripping HP after the window shuts. This is
   a permanent bypass, not a timed one, and it is why the clamps in §4 are
   mandatory rather than defensive.
4. **Nothing in the arena asks for the region's verb.** The Foundry grants
   Downward Strike at the anvil at x=6560 (`claimFoundryMemory`, `:4817`),
   teaches the constructive half on four slabs, and then the boss never asks for
   it once.

### What survives

- **The pit floor.** `Object.assign(Pl(13300,2200,0,{deep:1}),{slate:1,h:20,foundryFloor:1})`
  (`:5980`) — 12200 to 14400, the only `slate` object in `FOUNDRY_LEVEL`. It
  stays, whole, and permanently safe. It is what keeps
  `at(o=>o.slate)[0].w >= 2000` passing at `tests/ember-colossus-stage.test.mjs:100`.
- **The approach.** Recovery ledge `Pl(12380,140,130)` (`:5976` — already bed
  height), the overlook `Pl(12620,300,260,{foundryOverlook:1})` (`:5977`),
  `Check(12300,0)` (`:5978`), the casting crane at 12900 (`:5979`), the slag heap
  at 14200 (`:5986`).
- **The quench header and the forge.** `Fluid(13160,300,150,120,'water',{…
  forgeCircuit:1, buoyancy:0 …})` (`:5982`) and `ForgeCoolant(13310,220)`
  (`:5985`). `buoyancy:0` is load-bearing — see §3 for what it actually does,
  which is not what the first draft said.
- **The anchor.** `Anchor(12980,220,'wallR',{…,ejectSpeed:420,foundryOutlet:1})`
  (`:5981`) stays in level data. It is silenced at runtime, not deleted — §3.
- **The constructive strike.** `slamImpact`'s heat-set branch (`:11505-11515`,
  inside the function at `:11488-11516`) already latches a `heatCycle` slab COLD
  forever if you land on it inside its SETTING window. It has never once been
  asked for in combat. It becomes the entire offence.
- **The ledger.** *"Ember was never defeated — only cooled, aimed, and
  returned."* For the record: this sits at **x=1340, Room 1, the Receiving
  Floor** (`:5907-5908`), not at the pit entrance. Four of the five designs
  placed it at the arena mouth. It is still the fight's thesis; the player reads
  it eleven thousand units before they need it, which is better.

### What is deleted from stage 10

`moltenCapture` / `coolantWet` / `coolMoltenShot` / `forgedSlug` — the entire
catch-his-shot-and-return-it circuit. Four of seven bosses already own that verb.
`forgeRushWind` / `forgeRushT` / `forgeRushDir`, `mouthCampT`, the eruption AoE
and the fire trail.

**`e.forgeFight` itself survives and must survive.** `drawBossFigure`
(`bladefall-respec-renderer.js:2103`) routes at `:2107` on
`e.type === 'colossus' && e.forgeFight`; its own `switch(e.type)` has no colossus
case, so a falsy `forgeFight` drops the boss to `default: legacyDraw(L.drawEnemyFull, e)`
— the vector renderer, mid-pixel-frame. The flag stays set for the whole fight.

**The legacy colossus block is not in the dispatch chain and does not go away by
itself.** `if(e.type==='colossus'&&!(e.forgeStunT>0)){` at `:14011` sits *outside*
the boss movement if/else chain (which runs `:13912-13939`) and fires
unconditionally every frame for every colossus. Adding an `else if` at `:13916`
does nothing to it. It is gated: change `:14011` to

```
if(e.type==='colossus'&&!e.colossusForge&&!(e.forgeStunT>0)){
```

and set `e.colossusForge=1` in `setupFoundryBoss`. The block survives intact for
Boss Rush, which never sets the flag.

**The ENRAGE branch keeps its `whiteCourtFight` exemption and gains ours.**
`:14105` currently reads `if(!e.whiteCourtFight&&hpR<0.50&&e.phase<2){…}`. There
is no `forgeFight` in it to delete — the first draft was wrong about that. With
this plan's Act II floor at 0.26 of maxHp, `hpR` crosses 0.50 *by construction*,
so the branch **will** fire and silently buy `e.speed*=1.22`, `shootCd*0.6`
(`:13934`), rush windup 0.62→0.42 (`:13921`) and rush speed 360→430 (`:13924`).
Add `&&!e.forgeFight` to `:14105`. Act speed and cadence are bought with
quenches inside `updateColossusForge` or they are not bought at all.

**NG+ already plays the Foundry boss and will play the new fight.** `:14719` is
`if(G.stageIndex===10&&!G.bossRush){setupFoundryBoss(e,bx);return;}` — there is
no `G.ngPlus===0` test, unlike the White Court's `:14694`. The first draft
claimed NG+ falls through to the legacy arena at `:14724`. It does not, today or
under this plan. **Boss Rush** falls through; NG+ does not. That is a statement
of fact, not a preservation, and §8 records it as such.

### Engine facts the design record got wrong

Every one of these was checked in source. They are listed because four of the
five designs leaned on at least one of them, and because the first draft of this
plan got three of them wrong in its own turn.

| Claim in the record | Truth |
| --- | --- |
| "Portal jets are drawn by nothing." | They are drawn — by the **legacy vector** `drawFluidJet` inside the pixel frame (`bladefall-respec-renderer.js:2943`), on **every stage**, with no guard. Global visual debt. |
| "Aim the coolant at the floor" / "sightlines from slate perches" | A jet fires out of the **partner** mouth along **that** mouth's surface normal (`bladefall-fluids.js:171-200`). A floor mouth fires **straight up**. Horizontal aiming from a floor perch does not exist. |
| "Bosses have a fixed `e.y` and ignore `gone`." | False. The enemy gravity block (`:14160-14215`) has no boss guard and maintains `e.floorPlat` from `getEnemyFloor` (`:10750`). Only `enemyGroundStep` early-returns for bosses (`:10824-10825`), so **belts do not carry them** — that is the one opt-out. |
| "The boss heals by standing in its own molten pour." | Unreachable. `updateHeatStone` sets `o.gone=state===HEAT_MOLTEN` (`:4781`) and `platTop` returns null for `gone` (`:10671`). `floorPlat` can never be a molten heat slab. |
| "Falling in lava costs one measure and a shove." | `hurtPlayer(dmg,dir,false)` **rewinds to the checkpoint and calls `clearPlacedPortals(false)`** (`:10069-10080`), and fluid damage passes `false` (`:13006`). Routine lava here would eject the player and wipe their rig. |
| "Beds would need adding to `NET_DYNAMIC_TYPES`." | `plat` is already in the set (`:21042`). What is missing is `heatSet` **and the re-phased `heatCycle.phase`**, and `netApplyWorldSnapshot` never syncs `G.time`. See §7.12. |
| "`FHeat` gives a 1.7s setting window"; "Phase 3 moves `set` to `.62`." | `FHeat` defaults are `period 4.4, molten .32, set .62` (`:5889-5890`) → MOLTEN 1.408s, **SETTING 1.32s**, against a 1.3s strike cooldown. `.62` is already the default and collapses nothing. Fixed in §3. |
| "The arena is fine on revisit." | `FOUNDRY_LEVEL` (`:5898`) has no `bossSkipCapability`, and the gate at `:7020` checks capability only. **The boss respawns forever.** Real bug. Note it is not unique: only stages 6 and 8 carry a skip, so the Causeway brute and the Hollow Marksman archer respawn for the same reason. |
| `Slate(x,w,y,{flag})` | **`Slate` takes three arguments** (`:3115`). A fourth is silently discarded. Every tagged `Slate` in the first draft dropped its flag. Use the idiom the level itself uses at `:5980`: `Object.assign(Slate(…),{flag:1})`. |
| "`meta.soundCaptions` entries." | `meta.soundCaptions` is a **boolean preference** (`:651`), consumed only by `showSoundCaption(text,pan)` (`:1603-1604`). There is no entry table. |
| "`combatShoutsQuiet()` suppresses every shout at stage 10." | It suppresses nothing by itself. It is a helper consulted at six boss-shout sites (`:13945, :13966, :13976, :14005, :14027, :14108`). `addText` (`:10486`) is ungated and fires from 116 call sites, several in the Foundry today. Silence is a house rule this design enforces, not an engine guarantee. |
| — | The **14400–15400 void is real**: the pit floor ends at 14400, Room 6's `Gr(15400,16600)` (`:5990`) begins at 15400, and the only object between is scenery (`:5986`). `loadStage` also pushes a level-wide `{type:'pit'}` (`:6840`) and falling out of bounds calls `hurtPlayer(0,0,false)` (`:13642`). |

---

## 2. The idea this fight owns

The region already states it: *you are the last machine on the line. Here you
make ground.* The fight is that sentence turned on the thing that gives the
orders.

> **Local rule: the machine has to put its heat somewhere. Make the somewhere
> stone.**

The Colossus's `reality` is not a person — it is `fever-peak`
(`bladefall-story.js:30`), the only boss in the game whose truth is a symptom.
You do not kill a fever. You take the heat out of it, and the heat has to go
somewhere, and the only place it can go is the ground. So:

- **The Colossus has no cannonball to return.** The wet-forge circuit is gone.
  Nothing of its is ever caught, carried, transformed, banked, looped or
  delivered. Its weapon is the casting bed and so is yours.
- **You never deplete a health bar.** You deny its pours. The fight advances on
  `e.forgeQuenches`, not on HP, so no weapon and no expose window can buy a
  single act.
- **Damage is a refusal, not a blow.** When the machine puts its arm into a mould
  it has to fill, and the mould is cold stone you made this minute, the heat has
  nowhere to go and comes back down the arm. That is the only thing that hurts
  it.
- **The health bar is the floor.** Set moulds are pale slabs with a dashed seam.
  Blown moulds are craters with a notch tally. You can count the fight's progress
  in greyscale from anywhere in the pit, with the sound off and motion reduced.

And the ending performs the ledger instead of quoting it: the general cools, sets
with the bed, and its body becomes the bridge east — the artillery piece, cooled
and aimed and returned, left as ground for whoever comes next.

---

## 3. The arena

The Casting Pit (12000–15400, `bossX 13600`) becomes two planes. **The pit floor
at y=0 is where the Colossus walks. The casting bed at y=130 is where you work.**
Every other boss in this game is eye-level; this one is beneath your footing,
reaching up into it.

That relationship is load-bearing in three engine systems. All three were
re-derived, and two of the first draft's numbers were wrong.

- **Contact damage needs vertical overlap** (`:14242`):
  `const vOv=Math.abs((e.y+e.h/2)-(p.y+p.h/2))<(e.h/2+p.h/2);`. There is no
  literal 80 — the threshold is derived. Colossus `w:84,h:112` (`:626`), player
  `w:26,h:44` (`:2531`). Threshold = 56+22 = **78**. Boss on the pit floor:
  centre 56. Player on the bed: centre 152. Gap **96**. 96 > 78 → **the Colossus
  cannot touch a player on the bed — by 18px.** Horizontal reach is
  `e.w/2+p.w/2` = **55px**, which is how walkable the pit floor actually is.
  Once the boss climbs onto a mould in Act II its centre is 186, the gap is 34,
  and contact damage **is** live. That is wanted, and it is stated.
- **AoEs are a ±60 band in y** (`:14587`, not `:14588` — that is the closing
  brace). `a.r` is a half-width in x only. A pour AoE at y=130 does not reach a
  player at y=0, and every legacy y=0 AoE misses a player on the bed.
- **A 130px drop lands on permanent slate.** There is no fall damage anywhere
  in the codebase; the touchdown block (`:13478-13484`) is SFX, squash and
  particles. No lava, no void, no `hurtPlayer(...,false)`, no rewind, no wiped
  pair.

**The clearance under the bed.** The Colossus at y=0 has its head at 112.
`FHeat` bakes `h:16`, which would put a mould's underside at 114 — two pixels.
That is under one frame of vertical motion for anything moving faster than
120px/s and nothing in the engine enforces it. The bed is authored with
**`h:12`**, underside at **118**, six pixels. §7.12 asserts it.

### Authored geometry

Everything new is **pushed at runtime by `installFoundryBed(e)`**, following
`installCourtArena` (`:5570`). `FOUNDRY_LEVEL.objects` is not edited at all.
Consequence: `tests/ember-colossus-stage.test.mjs` **passes unmodified** — and
for a stronger reason than the first draft gave. The test slices the source text
from `const FOUNDRY_LEVEL=` to the `/* ---- STAGE 10 · EMBERDEEP` marker and
evaluates it in a bare `vm.runInNewContext(…, { Math, Object })`. It never runs
the game, so runtime pushes are structurally invisible to it.

Two consequences of that mechanism, both binding:

- `installFoundryBed` must be **defined outside** that source span or the vm
  slice swallows it and throws on undefined identifiers. Following
  `installCourtArena` at `:5570` satisfies this.
- The test extracts and evaluates the constructors `Pl, Gr, Wl, Slate, Check,
  …, Cap, FHeat, FSlag, FSpout, Line` **by source** (`:26-30`). **No shared
  constructor is edited by this plan** — not `Slate`, not `FSpout` — precisely
  so those bodies stay valid under `{Math, Object}` alone.

`installFoundryBed` opens with a sentinel, matching `installCourtArena:5571`:

```
if(G.obstacles.some(o=>o.castingBed))return;
```

| Object | Placement | Purpose |
| --- | --- | --- |
| **The casting bed** | six × `FHeat(12900+i*200, 204, 130, 0, 6.0, {castingBed:1, bedIndex:i, h:12, heatCycle:{period:6.0, phase:phase_i, molten:.13867, set:.416}})` | the fight. Span **12798–14002**, flush, 4px overlap at every junction |
| **The pour heads** | `FoundryScenery(x, 130, 'pour-spout', {w:120, h:340, pourSpout:{period:6.0, phase:phase_i, molten:.13867}})` at x = 12900, 13500, 13700, 13900 — **four, not six** | the clock's face. Bays 1 and 2 are under the coolant header and have no spout; see below |
| **West apron** | `Object.assign(Slate(12740,160,130),{bedApron:1})` | 12660–12820, overlaps mould 0's west edge by 22px. Lands off the authored 12380 ledge |
| **East apron** | `Object.assign(Slate(14100,200,130),{bedApron:1})` | 14000–14200, abuts mould 5's east edge at 14002 |
| **East lip** | `Object.assign(Slate(14500,240,0),{bedApron:1})` | 14380–14620 at y=0. Extends the safe floor past the pit floor's 14400 edge so the 14400 void is not reachable from the arena. Closes the §8 rule |
| **The header** | mutate the authored `Fluid` at `:5982` **in place**: `y:300, h:120, drag:0, jetWidth:58` | relocated from 150–270 to **300–420**, a 150-unit lift. x is unchanged: 13010–13310. Keeps `forgeCircuit`, `basinId`, `contained`, `buoyancy:0` |
| **Sluice step** | `Object.assign(Slate(13380,120,250),{sluiceStep:1})` | 13320–13440. Bed 130 → step 250, **Δ120** |
| **Sluice shelf** | `Object.assign(Slate(13160,240,318),{sluiceShelf:1})` | 13040–13280, inside the header by `containsPoint`. Step 250 → shelf 318, **Δ68**, ~80px west |
| **The lid** | `Object.assign(Cap(13160,320,420),{foundryLid:1})` | **one** panel, 13000–13320, flush on the header's surface. Shelf 318 → lid 420, **Δ102**, vertical |
| **The gate** | `Object.assign(Plate(12700,0,'foundry-sluice-gate'),{sendPost:1, foundryGate:1})` | Oren's post, on the pit floor **west of the boss pen** |
| **The stacks** | `FoundryScenery(12500+i*260, 0, 'ember-stack', {w:150,h:420})` × 8, backdrop | one goes dark per quench. `ember-stack` exists in the renderer (`bladefall-respec-renderer.js:2313`) but is authored only in Emberdeep (`:6055`, `:6140`) |
| **Slag** | six × `FoundryBeat(Object.assign(Trap(x,330),{y0:330, floorY:114, slagReal:1, requiresRepairCatch:'foundry-line-live'}),'twist','slag-rain')` placed at the mould junctions | Act II footing. **Not `FSlag`** — see below |

Boss pen: `e.forgeArenaL=12860`, `e.forgeArenaR=13940` — set in `setupFoundryBoss`,
and **applied by `updateColossusForge` itself**. The clamp at `:13936` lives
inside the `else{` movement block that begins at `:13927`; a dispatched boss never
reaches it, exactly as `updateWhiteCourtBoss` already bypasses the siphon clamp
at `:13935`. The only clamp still running is the loop boundary at `:14236`. The
pen clamp runs **after** the Act II belt push, or the belt walks the boss out of
its own arena. `e.cadenceArenaL` stays at its authored `bx-1400`=12200, which
puts `applyCampaignCadence`'s `endX` at 11940 (`:8710-8712`) — well west of the
bed, so the cadence pass at `:8737` can never stamp `belt` on a mould.

**Why four spouts, not six.** The coolant header occupies x 13010–13310 at
y 300–420 with a brittle lid on top of it. The `'pour-spout'` drawer
(`bladefall-respec-renderer.js:2286-2291`) unconditionally runs a 400px feed pipe
upward from `by - h - 400` and a housing from `o.y` to `o.y + h`. A spout over
bays 1 or 2 would be drawn straight through the water tank and its lid. The
header standing over those two bays is the in-world reason they have no spout,
and §5 already makes the mould's own state and the boss's raised arm the primary
tell for every mould. This is the beat that got simplified rather than
engineered around: four spouts is cheaper and reads better than a pipe through a
basin.

**Why the slag is hand-built and not `FSlag`.** `FSlag` (`:5891-5892`) *always*
installs a live `slagCycle`, so "dormant until Act II" is not a thing the
constructor does. Worse, deleting `slagCycle` would not disarm it: the trap's
other trigger is proximity and is independent of the cycle —
`if(o.state==='idle'&&armed&&Math.abs(p.x-o.x)<58&&p.y<o.y){o.state='warn';…}`
(`:12324`), where `armed` is `!o.requiresRepairCatch||…` (`:12323`). A block at
y=330 over a bed at 130 satisfies `p.y<o.y` for any player on the bed, so every
"dormant" block would drop the first time the player walked under it in Act I.
The arena's blocks are pushed with `requiresRepairCatch:'foundry-line-live'` and
no matching `repairCatch` object, so `armed` is false and they hang inert. The
Act II transition deletes the flag and assigns `slagCycle:{period:7.2, phase, warn:.6, dwell:4.2}`.

Two further corrections to that beat, both from the audit:

- **The crush at `:12329` calls the banned path.** `if(p.invuln<=0&&…)hurtPlayer(22,Math.sign(p.x-o.x)||1,false);`
  — a rewind and a wiped pair, mid-fight, from a falling block. Change that one
  argument to `!!o.slagReal`. Existing traps have no `slagReal`, so
  `undefined` → `false` and nothing outside this arena changes; the arena's
  blocks carry `slagReal:1` and deal a real wound.
- **`floorY:114`, not 130.** A landed trap's standing surface is `o.y+o.h`
  (`platTop:10697`) and `Trap` is `h:58` (`:3576`). At `floorY:130` the footing
  would be at **188**, and a player standing there is 58 above the mould, so
  `Math.abs(o.y-aoeY)>44` (`:11507`) **rejects the mould underneath** — a landed
  block would lock its own bay out of the quench loop for its whole 4.2s dwell.
  At `floorY:114` the footing is at 172 and the blocks are placed at the mould
  junctions (x = 13000, 13200, 13400, 13600, 13800, and 12900), so they never
  sit over a bay's strike zone at all.

### The pour clock, stated exactly

`period:6.0, molten:.13867, set:.416` in `heatStateOf` (`:4769-4772`,
`const period=c.period||4.2,t=(((G.time+(c.phase||0))%period)+period)%period,f=t/period;`):

- **MOLTEN** 0 → **0.832s**. A hole.
- **SETTING** 0.832 → 2.496s. **A 1.664-second window** against a 1.3s strike
  cooldown (`SLAM_CD`, `:11485` ← `bladefall-movement-progression.js:36`), so a
  missed strike leaves **0.364s** of usable margin inside the same window — and
  only if you jump and slam immediately (the gate at `:12822` has no
  minimum-height guard, so jump-into-slam is legal and near-instant). It is a
  second chance, not a comfortable one. This is the correction to `FHeat`'s
  default 1.32s, which is the whiff-fest the fun judge named, and it is the
  first number to playtest.
- **COLD** 2.496 → 6.0s.

**The period is 6.0, not 5.2.** Six moulds on a 1.0s stride need 6.0s of clock.
At 5.2 the wave wraps onto itself: mould 5 (phase .2) is molten on
`G.time ∈ [5.0,5.2)∪[0,0.632)` while mould 0 is molten on `[0,0.832)`, so for
**0.632s of every cycle there are two holes**, at opposite ends, and the "one
travelling hole" read never resolves. At 6.0 the sweep is clean.

`phase_i = ((-1.0*i) % 6.0 + 6.0) % 6.0` → **`0.0, 5.0, 4.0, 3.0, 2.0, 1.0`**.
`heatStateOf` *adds* phase to `G.time`, so mould *i* is MOLTEN when
`(G.time + phase_i) mod 6 < 0.832`, i.e. when `G.time mod 6 ∈ [i, i+0.832)`.
Mould 0 at 12900 opens at t=0; mould 5 at 13900 opens at t=5.0. **The hole
sweeps east, 200px per 1.0s = 200px/s — exactly `runSpeed: 200`**
(`bladefall-movement-progression.js:19`). Mould 5 closes at 5.832 and mould 0
reopens at 6.0, so the bed is completely solid for **0.168s** of every cycle.
The molten window (0.832s) is less than the stride (1.0s), so no two moulds are
ever holes at once. **The bed has at most one hole in it, ever.**

**The hole is 196px, not 190.** Moulds are 204 wide on 200 centres: mould *i*
spans `[12798+200i, 13002+200i]`, so every junction has a **4px overlap** and
there are no seams. When mould *i* is MOLTEN the standable edges are at
`13002+200(i-1)` and `12798+200(i+1)` — a **196px** gap. At the west end it is
178px (apron edge 12820 → mould 1's edge 12998); at the east end 198px.

**The jump envelope, derived.** Jump velocities are set absolutely
(`p.vy=-jumpVelocity*gravDir`, `:12762`), so the optimum is a second jump exactly
at apex. With `jumpVelocity: 480`, `secondJumpVelocity: 450` and gravity 1400
(`:13021`):

- rise = 480²/2800 + 450²/2800 = 82.29 + 72.32 = **154.61px** — the same
  constant the repo's own test computes at `tests/ember-colossus-stage.test.mjs:31`.
- airtime = 480/1400 + 450/1400 + √(2·154.61/1400) = 0.3429 + 0.3214 + 0.4700 = **1.1343s**
- distance at 200px/s = **226.9px**, plus a small addition from the held-apex
  assist (`apexGravityScale: 0.55`, `apexBand: 60`).

**196px against 226.9px is 31px of margin**, from an edge launch at full run
speed. Crossable and demanding; falling through is safe and costs you position,
time, and proximity to a furnace. That is the graft from Design 2 and it is what
makes the first thirty seconds legible without a word of text.

`FHeat` bakes `molten:.32, set:.62` into its literal (`:5889-5890`), but `o` is
the last argument to `Object.assign`, so a whole `heatCycle` passed in `o`
**replaces** it wholesale — shallow, not deep-merged. The positional `phase` and
`period` arguments become dead, which is why the table above passes `0, 6.0`
positionally and then supplies the real values inside the object. Any key omitted
from the replacement falls back to `heatStateOf`'s own defaults, not `FHeat`'s.

`FSpout` hard-codes `molten:.32` and takes no `y` (`:5893-5894`), so the spouts
are built with `FoundryScenery(x,y,kind,extra)` (`:5879`) directly. **`FSpout` is
not edited** — the stage test evaluates its source body.

### One strike sets one mould

`slamImpact`'s heat loop (`:11505-11515`) runs over every obstacle with **no
`break`**, and its x tolerance is `o.w/2+26` = **±128** against 200 centres.
Adjacent strikeable bands overlap by 56px and adjacent SETTING windows overlap by
0.664s, so a strike near a junction would set **two** moulds — roughly halving
what every act costs. The same is true of the brittle loop at `:11498-11500`
(`o.w/2+30`).

The fix is nearest-only selection for the bed, and it is six lines inside
`slamImpact`, above the existing heat loop:

```
let bedPick=null,bedD=1e9;
for(const o of G.obstacles){
  if(o.type!=='plat'||!o.castingBed||o.heatSet)continue;
  if(Math.abs(o.x-p.x)>o.w/2+26||Math.abs(o.y-aoeY)>44)continue;
  if(o.heatState!==HEAT_SETTING)continue;
  const d=Math.abs(o.x-p.x); if(d<bedD){bedD=d;bedPick=o;}
}
```

and one added clause in the existing loop: `if(o.castingBed&&o!==bedPick)continue;`.
Nothing outside this arena carries `castingBed`, so no other level's behaviour
moves. The stage test's three regexes on `slamImpact`
(`o.heatState!==HEAT_SETTING`, `o.heatSet=true`, `o.brittle`,
`tests/ember-colossus-stage.test.mjs:55-57`) all still match.

**The lid is one panel and one strike.** `shatterBrittle`'s caller tolerance is
`o.w/2+30`, so non-overlap needs spacing `> w + 60` while continuity needs
spacing `≤ w`. **A continuous lid can never require three separate strikes.**
Three 110-wide caps on 100 centres would break two at a time; three spaced caps
would leave gaps the player falls through, under a clock, three times. The lid is
therefore one 320-wide panel: `Cap(13160,320,420)`, `reform:9999` (`:5884` →
`Br`, `:3118`, where `o` merges last so 9999 beats the 4.5 default), tagged
`foundryLid:1` at push time. One decisive strike at the top of a three-rung
climb is a cleaner finale than three fiddly ones, and the climb is the race.

**The lid hook gates on `foundryLid`, not `castingCap`.** `Cap()` stamps
`castingCap:1` on everything it builds, including the two Room 4 cache caps
`Cap(11940,120,140),Cap(12060,120,140)` (`:5967`). An unqualified hook would fire
on those — 1,100 units west, on floor the player can walk to — and a player who
opened the cache on the way in has already spent them (`reform:9999`), so the
finale could never be satisfied on a later attempt.

### The reachability ladder, derived

The header is mutated to `drag:0`. The authored `drag:0.9` (`:5982`) exists for
the wet-forge shot transport this fight deletes, and `fluidResponse` applies
`ent.vy *= Math.exp(-sample.drag*dt)` every frame (`:10808-10810`) — a damped
double jump out of a submerged shelf lands somewhere near 129px against a 114px
requirement, which is too thin to ship on an estimate. With `buoyancy:0` and
`drag:0` the volume is mechanically inert: it is a jet source and a picture, and
the ladder is dry-air arithmetic that can be stated exactly.

While we are here: **`buoyancy:0` does not make the coolant "standable."** There
is no swim state anywhere in the engine; fluids are non-solid force fields
(`fluidResponse`, `:10801-10818`). Default water is `buoyancy:1720, density:1`
against gravity 1400, so ordinary water floats you. `buoyancy:0` zeroes that
term and **gravity carries you straight through onto whatever platform is
below**. You stand on the shelf because the shelf is there.

| Rung | From | To | Δ | Margin against 154.61 |
| --- | --- | --- | --- | --- |
| 1 | bed 130 | step 250 | **120** | 34.6 |
| 2 | step 250 (13320–13440) | shelf 318 (13040–13280) | **68**, ~80px west | 86.6 |
| 3 | shelf 318 | lid 420 (directly above) | **102**, vertical | 52.6 |

A single jump reaches only 82.29px, so rungs 1 and 3 require the double jump and
rung 2 requires it for the horizontal (a single jump landing +68 allows ~80px of
travel; the double allows ~203px). The lid is wider than the shelf, so a vertical
jump from anywhere on the shelf lands on it.

The step sits at y=250, 120 above the bed. A player standing on it is outside the
pour AoE's ±60 band and cannot reach any mould with a strike
(`|250-130| = 120 > 44`). Camping it is a rest, not an exploit: the fight
advances on quenches and nothing else.

### Both mouths, without touching level data

`setupFoundryBoss` sets `outlet.gone = true` on the authored anchor; the new
colossus block in `killEnemy` restores it. Both `nearbyActivePortalAnchor`
(`:781`, test at `:787`) and `portalPairs` (`:3251`, anchor clause at `:3265`)
test `!gone`, so the 1500-unit proximity rule that silently forces one-mouth mode
across the whole pit is switched off for the fight and switched back on
afterward. The truncation itself lives in `bladefall-portal-progression.js:87`
(`else if (context && context.anchorPresent) kept = input.slice(0, 1);`), fed by
`anchorPresent:!!nearbyActivePortalAnchor()`. `drawLPortal` returns early on
`gone` (`:18687`), `foundryOutlet` has exactly one occurrence in the repo, and
the anchor has no `zoneEntityId`, so zone persistence ignores it. This is the
graft from Design 5 and the feasibility judge called it the best anchor answer
anyone proposed: the approach lesson survives, the stage test survives, and
nothing is deleted.

**There is a third reader the first draft missed.** `:12897` is the mouth-hygiene
sweep at range **1700**, not 1500:
`const anchorNear=G.lportals&&Object.values(G.lportals).some(m=>m.length===1&&m[0].anchor&&!m[0].gone&&Math.abs(m[0].x-p.x)<1700);`
followed two lines later by `if(!ownNear&&!anchorNear)G.cratePortals=[];`. With
the anchor silenced, the arena loses that keepalive. `ownNear` is a 1500-unit
test against the player's own mouths, and the entire working area — bed 12798 to
14002, shelf 13160, gate 12700 — is 1300 units wide, so a mouth anywhere in it
is always within 1500 of the player. **No edit is required, but the arena's width
is the reason, and any future widening of the pen re-opens it.** §7.12 asserts it.

### The jet, with its geometry stated correctly

One mouth on the sluice shelf sits inside the header volume, so `BFFluidSystem`
projects a jet **out of the partner mouth, along that mouth's surface normal**
(`bladefall-fluids.js:171-200`): `entry` is tested for submersion, `exit` supplies
position and normal. `placePortal` (`:3194`) gives a floor placement `nx=0, ny=1`
and world y is up-positive, so **a mouth on the pit floor fires straight up**,
280 long and 58 wide, into the underside of whatever mould is above it. That is
the one jet geometry in the entire design set that is correct as written, and it
is exactly the shape this fight needs.

`containsPoint` (`bladefall-fluids.js:90-98`) runs `y >= value.y - pad` to
`surfaceAt(value,x) + pad`, and `surfaceAt` is `value.y + value.h + column
offset` — so the mutated header spans **300 to 420** and a mouth on the shelf at
318 qualifies without needing the pad at all. The x band is 13010–13310, which
contains the 240-wide shelf.

**The jet record's fields are `nx, ny, w, length, strength, source, pairId`** —
there is no `direction`, no `width`, no `owner` (`bladefall-fluids.js:183-196`).
Code that reads `jet.width` or `jet.direction` gets `undefined` and fails
silently.

`updateFoundryQuenchJets(dt)` walks `G._fluidJets`, finds the single nearest
`castingBed` mould each water jet covers, and sets `o.quenchHold = 0.35` on it:

```
function jetCovers(jet,o){
  if(!jet||jet.kind!=='water'||!(jet.ny>0.9))return false;   // a floor mouth only
  if(Math.abs(o.x-jet.x)>o.w/2)return false;                 // its own footprint, not a wide band
  const under=o.y-(o.h||14);
  return under>=jet.y&&under<=jet.y+jet.length;
}
```

The `jet.ny>0.9` guard is not decoration: a wall mouth has `nx=±1` and the band
runs horizontally, and `portalJets` will happily emit a **lava** jet from the same
mouth if it ever ends up in a different volume. The `o.w/2` test rather than
`o.w/2 + jet.w/2` is what keeps one mouth from holding two moulds; the nearest-
only rule is the backstop.

**`transferRate` is not the jet's strength knob for this mechanic.** It gates
emission (`:180`) and scales `strength` (`:192`), and `strength` is consumed only
in `jetSample` as a push force on a sampled **entity** (`:219-220`). A `plat` is
never sampled, so a rectangle test is completely insensitive to it. Raising it
.85 → 1.0 would do nothing for a jet that holds a platform open. It is not
touched.

`jetLength` and `jetWidth` are real authorable fields, whitelisted at
`bladefall-fluids.js:59-62` and read at `:191`, but a repo-wide grep finds them
authored in **no level anywhere** — the only three occurrences are the module's
own lines. Writing `jetLength:280, jetWidth:58` onto the header would be a
literal no-op. This fight is the first place in the game to author either, and it
authors **`jetWidth` only**, as Oren's gate (§6).

**A clause in `updateHeatStone` honours the hold — and it is four assignments,
not one.** The first draft said "force `HEAT_SETTING` and `o.ice=1`." That leaves
`o.gone` at whatever the previous frame wrote, and `:4781` is the only writer. A
jet fired at a MOLTEN mould — the normal case, since that is what you are trying
to reopen — would leave `o.gone` true, `platTop` would return null (`:10671`),
and **the mould would still be a hole you fall through**, with `slamImpact`'s
heat loop unable to fire because landing on the pit floor gives `aoeY=0` and
`Math.abs(o.y-aoeY)=130 > 44` (`:11507`). The jet mechanic — the stated answer to
Act III — would not exist. The clause is:

```
if(o.quenchHold>0){o.heatState=HEAT_SETTING;o.gone=false;o.ice=1;o.quenchHold=Math.max(0,o.quenchHold-dt);continue;}
```

**A jet holds a mould open for as long as you keep the water on it.** You stop
waiting for the bed's clock and start making windows where the fight needs them.
It is unlimited: there is no channel drain and no resource meter. The readout of
this fight is the floor, and a second gauge would fight it.

---

## 4. The fight

`e.portalGate='quench'`. New dispatch at `:13916`, immediately below
`else if(e.whiteCourtFight)updateWhiteCourtBoss(e,enemyTarget,dt);` at `:13915`:

```
else if(e.forgeFight && G.stageIndex===10) updateColossusForge(e, enemyTarget, dt);
```

`:13917` is the existing `else if(e.forgeStunT>0){e.forgeStunT-=dt;e.vx=0;e.lunge=0;}`
handler, which the new branch now sits above and therefore swallows.
**`updateColossusForge` decrements `e.forgeStunT` itself.**

### The core exchange — the pour, and the refusal

**POUR** is both the boss's attack and its only vulnerability, which is what
keeps the fight from having a dead half.

1. `beginColossusPour(e)` picks the nearest `castingBed` mould that is **not**
   `heatSet` and **banks it** in `e.forgeTargetBed` at windup start. If every
   mould is set it picks the nearest one anyway — and jams. Being out-built is a
   reward, never a softlock.
2. **Windup** 0.95s (Act I) / 0.75s (Act II and III). Four simultaneous tells,
   one per channel, detailed in §5. The banked mould is forced to `HEAT_SETTING`
   and **held** for the whole windup via `o.pourHold`: it is solid, slick and lit
   while it fills. Standing on it is standing on ice over a furnace that will
   become a hole in one second.
3. **Release.** The mould loses its hold, is forced MOLTEN, any mouth on it is
   cleared with a cinder puff, and a column AoE lands:
   `{x:mould.x, y:130, r:96, t:.35, dmg:e.dmg*1.2, type:'pour', color:'#ff7a3a'}`.
   Boss AoEs pass `a.real!==false` (`:14587`), so it is a **real wound** — one
   measure — not a rewind. Note `a.bloodDamage` is deliberately omitted: it would
   force a whole-measure loss through `hurtPlayer`'s fourth argument.
4. **Cadence** 4.2s (Act I) / 3.4s (Act II) / 4.6s (Act III, alternating with the
   front), measured from release.

Two ways to refuse it, and the two-grade split is the graft from Design 5 that
every judge asked for:

- **Grade 1.0 — the mould was already `heatSet` when the boss banked it.** The
  arm goes into cold stone. Full jam. `e.forgeQuenches += 1`. **No pour AoE** —
  the arm never got in, and the heat went back up it.
- **Grade 0.45 — you cap the pour.** Downward-Strike the banked mould *while the
  arm is in it*. `slamImpact`'s heat-set loop fires (the mould is held in
  SETTING, so it qualifies), and a new clause appended inside that loop before
  its closing brace at `:11515`, guarded on `o===G.boss.forgeTargetBed &&
  o.pourArm`, calls `resolveColossusQuench(e, mould, 0.45)`. **The mould stays
  `heatSet` — it is yours now.** The pour AoE **still lands**, at your feet,
  because you jammed it late. `e.forgeQuenches += 0.45`.

**Only grade 1.0 blows moulds out.** The first draft had grade 0.45 claim the
mould and then hand it to a `resolveColossusQuench` body that immediately set
`heatSet=false` and re-phased it MOLTEN. That contradiction is resolved in favour
of the cap keeping its mould. The full jam is the violent one.

Grade 0.45 is the panic answer and it is the reason the first minute works. It
lands from a player who understands nothing, in the first ten seconds, at the
cost of standing exactly where the pour lands and taking a measure for it. A pure
capper needs 8/0.45 ≈ **18 caps** across the fight against 8 jams — roughly 2.2×
slower and considerably bloodier — so the skill curve is inside the damage model
rather than behind a lockout. No player is ever walled; some are just slower.

```
function resolveColossusQuench(e, mould, grade){
  if(e.forgeQuenchCd>0)return false;               // one quench per event, ever
  e.forgeQuenchCd = 1.2;
  e.forgeQuenches += grade;
  const dir = Math.sign(e.x - mould.x) || 1;
  hitEnemy(e, e.maxHp*0.14*grade, dir, 90, 0, null, 'quench');   // BEFORE the window opens
  if(grade >= 1){
    for(const o of bedNeighbourhood(mould)){       // the target and both its neighbours
      o.heatSet = false;
      o.heatCycle.phase = -G.time;                 // MOLTEN now, permanently out of step
      o.blownOut = (o.blownOut||0) + 1;            // the crater tally
    }
    e.forgeStunT = 1.6;
  }
  e.exposeT = grade >= 1 ? 1.6 : 0.9;
  e.forgeExposeBudget = e.maxHp * 0.05;
  darkenStack(Math.floor(e.forgeQuenches));
  advanceColossusAct(e);
  return true;
}
```

Three things in that ordering are load-bearing, and all three were wrong in the
first draft:

- **`hitEnemy` runs before `exposeT` opens.** This is the engine's own idiom —
  `:14433` calls `hitEnemy`, `:14434` then sets `exposeT`. With the order
  reversed, `colossusExposeDamage` would see an open window and cap the quench's
  own 14% at 1.5% of maxHp, burning the whole 5% budget in the one blow it exists
  to reward. `colossusExposeDamage` **also** exempts `src==='quench'`, because
  belt and braces is cheap and the ordering is easy to break by accident later.
- **`dir` is derived, not inherited.** It is not a parameter of
  `resolveColossusQuench` and referencing it bare is a `ReferenceError`.
- **`e.forgeQuenchCd` is the single structural brake.** One field, one guard,
  and it subsumes three separate double-resolution bugs the audit found:
  a two-sided pour front paying twice, a strike setting two moulds paying twice,
  and a jam that also triggers a cap.

**`mould.heatCycle.phase = -G.time` is safe here and only here.** `heatStateOf`
computes `t=((G.time+phase)%period+period)%period`; with `phase=-G.time`, `t=0`,
`f=0 < molten`, so HEAT_MOLTEN. But `buildCustomLevel:6818` clones level objects
**shallowly** (`Object.assign({},raw)`), so nested objects are shared with the
module-level literal for the life of the page. The same write against an authored
`FHeat` — the Anvil slabs at `:5940-5944`, the Mould Hall slabs at `:5956-5957` —
would permanently desync that slab across every later stage load, NG+ run and
Boss Rush in the session. The bed's moulds are pushed fresh by
`installFoundryBed`, each with its own `heatCycle` literal from its own `FHeat`
call, so mutating one cannot alias another or anything authored.

**Two consequences worth naming.** You pay ground for damage — a full jam spends
three moulds, not one. And the bed's readable rhythm decays exactly as much as
you have hurt it: by Act III the pour wave is a mess of out-of-step craters. That
is the health bar, and it is made of floor.

### Why the bed cannot be farmed

Six moulds can all be set in about eight seconds off the bed clock alone. If a
full bed meant a free grade-1.0 on every pour, the fight would be over in under a
minute — the audit priced it at ~55 seconds. Two rules close it, and they are
both one-liners:

1. **The boss targets the nearest mould that is *not* set.** It walks at your
   holes, not your stone.
2. **A full jam re-melts the target and both its neighbours.**

So pre-setting all six buys exactly **one** free jam. The jam opens three
craters, rule 1 aims the next pour straight at one of them, and the loop
self-corrects. What the player actually has to do is predict *which mould the
machine will want next* and make that one first — a legible spatial chase,
which is Design 1's herding finally earned by the act structure instead of by
luring a slow walker onto a slab.

### Two clamps that close the twenty-second bug

**`colossusActFloor(e, amount)`** — the `wardFloor` pattern (`:10269-10270`), with
Act III using the warden's 1-HP primitive (`:10195`, `:10271`) rather than a
floor of 0, which is **no clamp at all** and would let a weapon or a lingering
burn call `killEnemy` before the finale ever begins.

```
const COLOSSUS_ACT_FLOOR = [0.62, 0.26];          // acts 1 and 2; act 3 is 1 HP
function colossusActFloor(e, amount){
  if(e.foundryOrphan) return Math.min(amount, Math.max(0, e.hp - 1));
  if(!e.forgeFight) return amount;
  const act = e.forgeAct || 1;
  const floor = act >= 3 ? 1 : e.maxHp * COLOSSUS_ACT_FLOOR[act-1];
  return Math.min(amount, Math.max(0, e.hp - floor));
}
```

Acts advance on `forgeQuenches >= 3 / 6 / 8`. **No weapon, no Echo, no
damage-over-time and no expose window can buy a single act**, because act
advancement is not HP-keyed at all. This is the structural answer, and it is the
one thing the feasibility judge singled out as a fix rather than a tuning.

**`colossusExposeDamage(e, amount, src)`** — beside `courtFinalDamage` (`:5647`).
While `exposeT>0`, ordinary damage is capped at **1.5% of maxHp per blow and 5%
per window**, tracked in `e.forgeExposeBudget` and reset when a window opens.
`src==='quench'` is exempt. This is the graft from Design 2, and it is what stops
a good weapon from erasing the *feel* even though the floors already stop it from
erasing the *fight*. Melee stays a satisfying flourish — roughly two moulds'
worth across the whole encounter — and never an answer.

Note the shapes honestly: `colossusActFloor` mirrors `courtFinalDamage`'s
HP-floor form. `colossusExposeDamage` is a per-blow-plus-per-window budget and
has **no existing analogue in the codebase**; it is new.

**Where the clamps go.** Not a "one clamp line each." `:10271` computes `actual`
and does `e.hp-=actual` in the same statement — there is no gap after it. The
hitEnemy clamp is a **wrap of `rawDamage` at `:10268`**:

```
const rawDamage=colossusActFloor(e,colossusExposeDamage(e,courtFinalDamage(e,(meta.testMode?e.hp+1:dmg*mod)*critMul),src));
```

**This also swallows `meta.testMode?e.hp+1:`, so Test Mode no longer one-shots
the Colossus.** That is a deliberate decision, taken here rather than discovered
in play: Test Mode is a diagnostics tool and a boss whose entire design is "damage
cannot buy an act" should not have a back door that contradicts it. The bot
reaches the finale by playing the fight.

The `dotDamage` clamp is easy — one line immediately before `e.hp-=amt;` at
`:10196`:

```
if(e.forgeFight){amt=colossusExposeDamage(e,amt,'dot');amt=colossusActFloor(e,amt);}
```

`dotDamage` bypasses `hitEnemy` and therefore the portal gate entirely, so this
is what makes the DoT hole non-lethal rather than merely small.

---

### ACT I · THE BED — it is under you
*Quenches 1–3. HP floor 0.62. ~55 seconds.*

**What the player does.** Read the wave off the spouts, get ahead of the boss to
the mould it is about to want, strike it inside its 1.664s SETTING window — and
be somewhere else when the arm comes up. The pour warning runs 1.2s ahead of the
hole (`o.pourWarn` at `f>.80` over a 6.0s period, `updatePourSpouts:4804-4810`),
so the roof announces the floor.

**What the boss does.** It walks the pit floor at speed 80, banks moulds, plants,
raises the casting arm into their undersides. Plus:

- **HAMMER** (wind 0.85s, cd 4.6s). It rears and strikes the underside of the
  mould the player is standing on:
  `{x:mould.x, y:130, r:104, t:.35, dmg:e.dmg*1.3, type:'slam', color:'#ffcf72'}`,
  and the mould is re-phased to the top of MOLTEN. **The ground goes out from
  under you, as a warned attack.** This is the anti-camping answer the
  constitution demands, and it replaces `mouthCampT` — an untelegraphed rush
  accelerator — outright. The `color` is **not** optional: `:14584` pushes 25
  particles with `a.color` for any `type:'slam'` record, and omitting it renders
  them with `color:undefined`.
- **A hammer on a set mould rings off it.** No re-phase; the boss recoils 0.55s.
  Your stone is yours, and this is where the player learns it.
- **The shot finally has a tell.** `e.forgeAimT=0.45` before every `bossShoot`,
  drawn as a dotted `pixelLimb` aim line committed at draw. The current boss
  fires the instant `shootT<=0` with no windup of any kind (`:13934`). `shootCd`
  2.6, unmodified by phase because `updateColossusForge` owns its own cadence.
  The shot is pressure, not a puzzle: it is the reason you cannot stand still on
  the bed reading the clock.

**How the arena changes.** It doesn't. Act I is the clean statement of the loop.

**Failure.** A missed strike costs nothing — the mould re-pours in 6.0s. A fall
through a hole is 196px wide, 130px down, onto permanent slate, and then you are
standing next to the Colossus, where contact damage is real, immediate, worth
`e.dmg` on a 55px horizontal reach, and no rewind (`enemyDamageStaysInPlace`
returns true for any enemy, `:10027`; consumed at `:14250`). Note `:14241`
suppresses contact entirely while `e.forgeStunT>0`, so a grade-1.0 jam's 1.6s
stun is also 1.6s of safe passage down there. That is the price of a miss: a
wound and a climb, never a checkpoint.

---

### ACT II · THE LINE — it is beside you
*Quenches 4–6. HP floor 0.26. ~60 seconds.*

**The transition is physical, not textual.** On the third quench the Colossus
plants both feet, vents, every spout lights at once, and **it climbs onto the
line.** Not by writing `e.y` against the gravity integrator — by launching it and
letting `getEnemyFloor` catch it on a mould.

**The launch velocity is 700, not 520.** Boss gravity is exactly 1400 with
`gMul` pinned to 1 (`enemyAirField:10790-10791` returns `{gMul:1,…}` for any
boss; integration at `:14173`, `e.y -= e.vy*dt` at `:14184`). A launch of 520
apexes at 520²/2800 = **96.6px** against a 130px lip — it cannot reach, arcs up,
misses, and drops straight back onto the pit floor **every single time**. Act II
would never start. The minimum is √(2·1400·130) = **603.3** and that only grazes
the surface with vy=0, while the catch at `:14181` requires `e.y <= eFloor &&
e.vy > 0` — it must be *descending*. At **700** the apex is 175px, 45 above the
bed, and it crosses 130 downward at 355px/s — about 6px per tick. Solid.

`beginColossusMount(e)` also snaps `e.x` to the chosen mould's centre and sets
that mould's `pourHold` to 1.2s, which forces it SETTING and `gone=false` for the
whole flight (0.5s up, 0.354s down). Without that, a mould that cycles MOLTEN
mid-flight drops the boss through its own landing pad on a 16% roll.

At the same moment every mould gains `belt = ±1`, reversing every 5s, and the
tread starts scrolling.

**What changes for the player.** You are carried at 130px/s while you work.
`belt` is a signed **multiplier**, not a flag —
`p.x+=p.floorPlat.belt*supportMaterial.playerConveyor*dt` (`:12605-12606`) — and
`playerConveyor` is 130 on all four materials (`bladefall-environment.js:6-9`),
which matters because a held mould carries `ice:1` and resolves as ice. **Belt
stays strictly ±1.** A headwind belt at 130 against a run speed of 200 is a fight
you can always win, so the belt is pressure, never a trap.

But the boss is carried too, and this is the one deliberate engine exemption in
the whole design. `enemyGroundStep` returns early for bosses (`:10824-10825`), so
one line inside `updateColossusForge`, **before** the pen clamp:

```
if(e.forgeAct>=2 && e.floorPlat && e.floorPlat.belt)
  e.x += e.floorPlat.belt * BFEnvironment.material(e.floorPlat,false).enemyConveyor * dt;
```

`enemyConveyor` is 92 on every material, so this reproduces `:10829` exactly —
and reads it from the table rather than hard-coding 92, so it cannot silently
diverge.

**The Colossus is now delivered rather than pursuing.** You can no longer get to
a mould before it does; you have to put the mould where the line is taking it,
before it arrives. That is a genuinely different verb from Act I, and it is the
inversion of Design 1's herding problem — the machine comes to you on rails.

**What the boss does.** It pours **downward, into the mould under its own feet**,
feeding the line the way a machine on the line does. Same rule, other
orientation: if that mould is `heatSet`, the pour jams and the heat comes back up
through its feet.

And if it pours into a mould that *isn't* set, it re-melts its own footing and
**falls through its own pour** — 130px, onto the safe pit floor, and it has to
climb back. `updateHeatStone` sets `o.gone` on MOLTEN (`:4781`), `platTop`
returns null for `gone` (`:10671`), and `getEnemyFloor` falls through to plain
`getFloor` for anything without `ignoreRaisedPlatforms` — which the Colossus does
not have. The engine gives that beat away for free and it is the best thing in
the act.

**Slag rain begins.** The six inert blocks get their `slagCycle` and lose their
`requiresRepairCatch`, landing at `floorY:114` so their standing surface is 172 —
58 above the bed, at the mould junctions, never over a bay's strike zone.
Traversal only: a trap has no `heatCycle`, so both `updateHeatStone:4776` and
`slamImpact:11506` exclude it and it can never be quench ground. This closes the
"the bed is full of holes and I am stranded" failure mode, and it is Emberdeep's
primitive appearing in the arena exactly once, doing its own job. The block still
warns off your position (`:12324`) — it is aimed at you, which is correct for a
works that is done with you — and its crush is a **real wound** (`slagReal:1`),
not a rewind.

**One body.** The first time a pour *completes* in Act II — the first one you
fail to deny — the mould fills, the metal breaks out of the bottom, and a
**shieldbearer** steps out of it: the same silhouette the player has walked past
since the Causeway, shield up, walking at them. Once.

```
const sb = spawnEnemy('shieldbearer', mould.x);
Object.assign(sb, {y:130, baseY:130, safeX:mould.x, safeY:130,
  authoredEncounter:true, noDrop:true, noticeRange:460,
  frontShield:true, shieldFace:-1, turnDelay:1.15,
  musterUpgraded:true, foundryOrphan:1});
```

Three corrections against the first draft's copy of `installMusterRoster`'s block
(`:4670-4679`):

- **No `muster:true`.** `:14237` runs `if(e.frostMuster||e.muster){e.x=Math.max(e.musterMin,Math.min(e.musterMax,e.x));}`
  for every enemy. The roster always supplies `musterMin`/`musterMax` from its
  row (`:4671`); a bare spawn does not, and `Math.max(undefined, NaN)` is NaN —
  **the shieldbearer's x becomes NaN on its first frame** and it vanishes from
  every position, collision and render query. The revelation beat silently does
  not happen. The clamp is not needed for a one-body walk-out; dropping the flag
  is cleaner than inventing bounds.
- **`turnDelay:1.15`** is the third line of the same clause at `:4673` and the
  first draft dropped it; without it the shield turns on the 1.2s default and the
  body reads differently from every other shieldbearer in the game.
- **`musterUpgraded:true`.** `:13812` runs
  `if(G.recallBaselineActive&&!e.musterUpgraded)applyRecallBaseline(e);` inside
  the enemy update loop — so an enemy spawned at *any* moment, not just at load,
  is upgraded on its first frame to 1.55× maxHp and 1.25× damage (`:4630`). On
  any save where the Frostfell muster was recalled, the revelation would arrive
  55% tankier in the middle of Act II. This is a revelation, not a fight; it
  stays the authored silhouette.

**It cannot be killed.** `colossusActFloor`'s first line clamps anything carrying
`foundryOrphan` to a 1-HP floor, through both `hitEnemy` and `dotDamage`, so the
finale always has its soldier. It can be knocked around; it keeps walking.

**Do not touch `G.killGoal`.** `spawnEnemy` (`:8599-8626`) never touches it, and
`bladefall-milestones.js`'s zone receipt clamps the numerator against the total,
so an uncounted kill cannot inflate anything. No wave, no adds cycle, no mob
phase — the judges were unanimous that a mob wave here is a downgrade from a
boss. One body is the whole point, and what it means is in §6.

**Failure.** Unchanged, plus: the belt never carries you into a hazard because
there isn't one, and the east lip closes the void. Set moulds stay set unless the
boss re-melts them, and it can only do that by standing on them and pouring —
which is the thing you are trying to make it do.

---

### ACT III · THE LAST POUR — it is beneath you, taking the bed with it
*Quenches 7–8. HP floor 1 HP. ~30 seconds.*

The line stops. The Colossus drops back to the pit floor, wades to bed centre,
plants, and opens its own casting seam.

**THE POUR FRONT.** Every 4.6s a front travels outward from directly above its
feet, **one mould per 0.24s in both directions**, forcing each to MOLTEN and
un-setting it as it goes. The bed visibly un-makes itself from the machine
outward. Between fronts it takes three heavy wading strides at speed 70 on the
pit floor. Where it stands, the line above it dies.

**And a front that reaches a mould you have set does not un-make it — it jams.**
The front stops dead at your wall and the machine takes the quench. So the act's
verb is not chasing and it is not baiting: **you are laying a wall in front of an
advancing line of destruction.** The bed clock cannot give you a mould in 2.5
seconds. The jet can. Everything the fight has taught converges on one action:
mouth on the shelf, mouth on the pit floor under the mould you want, water up
through its underside, strike it on your own schedule.

**A front resolves at most one quench.** The front is bidirectional, so a player
who walls both sides would otherwise take two grade-1.0s from a single event and
finish the act 4.6 seconds after it began. `e.forgeQuenchCd` makes this
structural rather than special-cased: the first side to jam takes the quench and
stops the whole front.

Per mould as the front passes: `{x:mould.x, y:130, r:70, t:.28, dmg:e.dmg*1.1,
type:'pour-front', color:'#ff6a1a'}` — so the front is a real hazard on the bed
and invisible from the pit floor, which is where you go when you lose the race.

**The ordinary POUR beat continues between fronts**, at cadence 4.6s, alternating
with them. This is not decoration: the first draft gave Act III only the front,
and the front is the *only* source of grade 1.0. A player who never masters the
jet would have had no way to advance — and with the boss at the Act III floor,
the bed fully restorable and nothing about the act losable, that is a **soft-lock:
unwinnable and unloseable**. Keeping the pour beat alive keeps grade 0.45
available for the whole fight, which is the promise §8 makes and must keep.

**Failure.** The bed is fully restorable: blown moulds re-enter the cycle, un-set
moulds are re-settable, and the slag keeps falling. Nothing about Act III is
losable, and now nothing about it is unwinnable either.

---

### THE LAST ORDER — the finale
*~20 seconds.*

The eighth quench leaves it cold enough to crack. Plates shed, the core seam is
nearly black, and it stops fighting. It walks to x=13160, kneels on the pit floor
directly under the header, and pours the last of itself up into the bed through
both arms: a **16-second clock**.

**If it completes**, the bed is destroyed — every mould molten and re-phased — it
re-heats to the Act III floor, and Act III repeats. **Time lost, progress kept.**
`e.forgeQuenches` never decreases within a life. (A death inside the arena
destroys the entity entirely and rebuilds the stage, so the counter is reset
along with everything else; `installFoundryBed` re-runs and the fight starts
clean. That is the honest scope of the rule, and it is the same scope
`installCourtArena` operates under.)

**To stop it:** bed 130 → sluice step 250 → shelf 318 → lid 420, and
Downward-Strike the lid. One panel, `reform:9999`, gone for good. The coolant
falls. The climb is the race; the strike is the answer.

`foundryDumpChannel(e, dt)`:

- Collapse the header `Fluid`'s `h` from 120 to **10** over 1.2s. `drawFluidV4`
  (`bladefall-respec-renderer.js:2155-2177`) reads `WY(o.y)` and `WY(o.y+o.h)`
  live, and nothing caches basin geometry — `ensureVolume` early-returns on a
  ready volume (`bladefall-fluids.js:68`) and `columns` derives from `w` only —
  so a draining basin draws for free. **Not to 0**: at `h=0`, `surfaceAt` returns
  300, `containsPoint(vol, x, 318, 10)` fails, `portalJets`'s `volumes.find`
  returns undefined and the jet stops being emitted at all. At `h=10` the shelf
  mouth stays submerged and nothing can break mid-sequence.
- Set `o.heatFrozen` on all six moulds. A clause in `updateHeatStone` **above**
  the `heatSet` guard forces COLD, so the whole bed goes pale-seamed at once.
- Run a 2.2s setting death on the boss: the figure locks into a cold statue, then
  `killEnemy`.
- **The orphan beat.** The shieldbearer stops mid-stride:
  `e.active=false; e.noticeRange=0; e.frontShield=false; e.shieldFace=0; e.vx=0; e.lunge=0;`
  and stands there — ordinary and confused. `:13875` (`if(!e.active)continue;`)
  is above the contact-damage block at `:14239-14250` in the same loop, so an
  inactive body deals nothing and does nothing; `noticeRange=0` stops `:13874`
  from re-waking it, and `musterUpgraded:true` keeps `applyRecallBaseline` from
  restoring the notice range behind our backs. It still draws. **No text** — not
  because the engine suppresses it (it does not; `combatShoutsQuiet()` gates six
  boss shouts and nothing else) but because this design chooses geometry over
  captions, and because `essential:1` on Oren removes the only ungated `addText`
  the arena would otherwise produce (`:13411`, `'PROTECT ME!'`). It was never a
  monster. It was being told.

`colossusBodyBridge()` then pushes
`Object.assign(Pl(14900,1000,60,{heatSet:1, colossusBody:1}),{slate:1, h:44})` —
**the Colossus's cooled body, spanning 14400 to 15400 exactly**, closing the real
unbridged void with the fight's own product. The eastward seam is not a level
object: it is a `physicalSeamSpec` branch at `:7848-7850`, gated
`requires:'downward-strike'`, and it fires at `G.p.x>=G.levelLength-62` = 16538 —
the level's right edge, not the fissure door at 16420. The bridge lands the
player on `Gr(15400,16600)` (`:5990`), which carries them to 16538 and on to The
Furnace General recollection at `SealedRecollection(16220,90,…)` (`:5994`). The
bridge is slate, so you can set mouths on it.

Then latch it, twice, following the engine's own two idioms:

```
markPersistentCircuitOpen('foundry-colossus','ember-colossus');
meta.zoneState = BFZoneStateModule.setCircuit(meta.zoneState,'ember-colossus','foundry-colossus',{open:true,source:'ember-colossus'});
```

The second line is what the revisit gate actually reads, and it follows `:4644`
exactly. It does not depend on `G.zonePersistenceZoneId` being set.

On revisit, `installFoundryBed(null)` runs in its **cooled** configuration —
every mould `heatSet` from the start, spouts dark, belts still — plus
`colossusBodyBridge()`. The arena you come back to is a finished floor and a
monument you walk on.

### Pace

| Act | Quenches | Clock | Typical | Floor |
| --- | --- | --- | --- | --- |
| I · The Bed | 3 | pour cadence 4.2s + 0.95s wind | ~55s | ~31s |
| II · The Line | 3 | cadence 3.4s + 0.75s wind, 5s belt reversal | ~60s | ~25s |
| III · The Last Pour | 2 | front / pour alternating at 4.6s | ~30s | ~18s |
| The Last Order | — | 16s clock, one strike | ~20s | ~12s |

**≈2:45 on a clean run; a hard floor near 1:25.** The first draft claimed a 2:20
floor and that number was wrong: it assumed a rebuild cost the design did not
actually impose. The real floor is set by two things and only two — the pour
cadence, which releases every window, and the three-mould re-melt, which means a
player can rarely be ready for the very next pour and realistically lands a jam
every second or third cycle. Damage output is irrelevant to length by
construction: the act floors make it so, and the acts are not HP-keyed.

If the floor reads too low in play, **the lever is the re-melt radius, not the
quench counts** — widening a jam from three moulds to five raises the floor
without adding a single repetition. Do not raise 3/6/8; that only makes the fight
longer, not harder.

---

## 5. Readability

Nothing in this fight is colour-only or motion-only, and nothing depends on a
flash, a particle or a sound.

| Beat | Geometry (survives everything) | Colour | Motion (optional) |
| --- | --- | --- | --- |
| Mould MOLTEN | a hole you see through | `#e0561f` / `#ff8a3a` (renderer `:1418`) | lava roll |
| Mould SETTING | solid, white glassy skin line | `#cdd8dc` (`:1427`) | — |
| Mould `heatSet` | flat, pale dashed seam | `#9fb4bd` / `#6e8590` (`:1433-1434`) | — |
| Mould blown out | permanent rim + notch tally | `#bfeaff` on `#4a3228` | — |
| POUR windup | arm raised into the mould's underside; **solid drawn column**, not particles | spout bead `#ffd98a` | **whole-screen ember drift inverts** |
| HAMMER | arm reared over one mould; under-edge pips for 0.85s | `#ffcf72` | back-spray |
| QUENCH | **five 1px blue-white notches rise from the mould into the arm**, one per 0.3s, static once placed | `#bfeaff` | steam burst |
| Act II | tread scrolls on every mould; rollers turn | — | reduced motion: static tread, direction chevrons only |
| Pour front | **5-pip ground track drawn 0.5s ahead of the head** | `#ff6a1a` | — |
| Spent | all plates gapped, seam 1px | `#6d3a24` | — |

**The pour tell is the arm, not the spout.** The first draft promised "a 1px
dotted hairline from the lit spout down to the mould" as the pour's telegraph.
Those are two unrelated clocks wearing the same costume: `updatePourSpouts`
(`:4804-4810`) sets `o.pourWarn` purely off the spout's own cycle — the bed's
travelling-hole wave — while the boss banks its target on its own 4.2s/3.4s
cadence. Spouts would light for holes that are not pours, and the boss would pour
into bays whose spout is dark, and the one geometric tell would mean two things.
Two of the six bays have no spout at all. So: **the spouts are the bed clock and
nothing else; the boss's raised arm and the drawn column are the pour.** One
signal, one meaning, in both directions.

**The DRAW is the graft from Design 2 and it is the best telegraph anyone wrote.**
`drawAmbience` (`renderer:121`) reads its drift speed from **a literal in its own
per-mote loop at `renderer:125`**, selected by `T.amb`:
`const sp = T.amb === 'snow' ? 18 : T.amb === 'ember' ? -24 : 6`. It is not a
theme constant — `THEMES.volcano` (`renderer:36`) supplies only `amb:'ember'` and
`ambCol`, and no theme carries a speed field. So no theme-table edit is involved.
`drawAmbience` already has `curG` in module scope, so it reads
`curG.boss && curG.boss.forgeBeat === 'pour' ? 30 : -24` directly, with **no env
plumbing at all** — one expression in one file, not two. (The ember branch is
shared with stage 9 Emberdeep, `bladefall-campaign.js:21`, so the override must
be keyed on the boss and must fall through to -24.) During a pour windup the
entire screen's embers fall into the machine. Whole-screen, legible with the
sound off and motion reduced, and it belongs to this chapter and nowhere else.

**Vitality, with no bar and no number**, in four redundant static channels:

1. **The bed.** Pale set seams and rimmed craters, countable in greyscale from
   anywhere in the pit. `drawHeatStone`'s COLD tail (`renderer:1433-1434`) draws
   the set seam for free — but it draws only because `updateHeatStone:4778`
   short-circuits any `heatSet` slab to `HEAT_COLD`, and that dependency is worth
   knowing before anyone touches either. The **crater rim and notch tally must be
   drawn before the `state === 0` test at `renderer:1415`**, not appended to the
   tail: `drawHeatStone` is three self-returning arms (MOLTEN returns at `:1422`,
   SETTING at `:1430`), and a blown mould is re-phased permanently MOLTEN — so a
   tally in the tail would be invisible on exactly the moulds it counts.
2. **The skyline.** One `ember-stack` flue goes dark per quench.
   `o.stackDark` does not exist yet — `renderer:2313` has no handling for it —
   so it is ~3 lines: skip the `alphaWrap` smoke block, swap `tower`'s colour.
   Visible mid-air, from either end. (Both authored instances carry
   `roomLandmark:1`; the eight runtime stacks omit it deliberately.)
3. **The seam.** `drawColossusFigure`'s core seam is sized at **`renderer:2089`**
   — `const seamH = cooling ? 2 : wind ? Math.round(H * .16) : Math.round(H * .09);`
   — and drawn at `:2090`. It is a **height scaled off H**, not a width; the
   width is the constant `W * .48`. (`:2093` is the comment `// head + shoulders`.)
   It rebinds to:
   ```
   const seamH = cooling ? 2 : Math.round(H * (.04 + .14 * (1 - Math.min(1,(e.forgeQuenches||0)/8))));
   ```
   keeping `cooling` first so the stun readout survives, and narrowing from a
   furnace mouth (H·.18) to a hairline (H·.04) across the fight. It steps on
   half-quenches, which is correct: a cap is visible progress. That is the health
   bar, on the body, without being a bar.
4. **The forge.** `drawForgeCoolantV4`'s pip row. **This is not "zero new
   renderer code."** `need` at `renderer:2058` is `(o.boss && o.boss.forgeHits) || 6`
   — true — but `lit` on the next line is `i < (o.hits || 0)`, the coolant's own
   landed-slug counter, which this plan deletes. Both lines change:
   `need` → 8, `lit` → `i < Math.floor((o.boss&&o.boss.forgeQuenches)||0)`. And
   three further states in the same drawer die with the circuit — `hot` at
   `:2051` (`o.forged === 1 && (o.flash||0) > 0`), the mouth highlight at `:2056`,
   the wet-latch flash at `:2062-2066`. They are **retired**: the panel is a
   gauge now, not a machine, and it draws cold with a live pip row. Roughly 6
   lines.

**The figure loses four states and must be re-keyed.** `drawColossusFigure`
currently reads `e.forgeRushWind` and `e.forgeRushT` to drive the stride
(`:2081`), the white-hot core (`:2076`), the 1.5× glow (`:2079`), the extended
casting arm (`:2086`) and the ember spray (`:2087`). §1 deletes both fields. Item
10 of §7 lists six branches to add; **the existing five go dead unless the pour
and hammer windups inherit them**, and they do: `armX` keys on the pour windup,
the white-hot core and the 1.5× glow key on the hammer rear, the stride keys on
`Math.abs(e.vx)` alone. This is the largest single piece of renderer work in the
plan and it is a rewrite of a function, not an addition to one.

**`drawFoundryCombat` needs a second call slot.** `drawCourtCombat`
(`renderer:1355`) is the right structural pattern — a stage guard, a boss guard,
telegraphs in `pixelLimb`/`B` inside `alphaWrap`, ~35 lines — but it is called at
`renderer:2946`, which is **after** `drawAmbience` (`:2944`) and **before** the
AOE chain (`:2947`), pickups (`:2948`), enemies (`:2949`) and the hero (`:2954`).
The court gets away with that because its telegraphs are thin distant lines. A
"solid drawn column" from the spout into the mould and an arm raised into the
mould's underside would be painted **under** the Colossus and under the player.
The pour column and the arm are drawn **inside `drawColossusFigure`**; the aim
line, the jet band and the front's pip track go in `drawFoundryCombat` at
`:2946`, where being behind the actors is correct.

**Act changes are events, not captions.** The boss climbs. The tread starts. The
bed begins dying. `G.shake` already zeroes under `reducedMotion`. Sound captions
are three `showSoundCaption(text,pan)` calls (`:1603`) at the pour release, the
quench and the lid break — `meta.soundCaptions` is a boolean preference (`:651`)
with nothing to add entries to. **Add no strobes.**

**Fix the live visual debt while here — and price it honestly.** Stage 10 falls
through to the legacy vector `drawAOE` inside the pixel frame (`renderer:2947`);
every guard in that chain rejects stage 10 (`:651`, `:1037`, `:1392`, `:2019`).
Portal jets are drawn by the legacy vector `drawFluidJet` (`renderer:2943`) with
**no stage guard at all** — that is global debt, on every stage, not stage-10
debt. `LLM-HANDOFF/13-V4-RESPEC-WORK-ORDER.md:238` records "AOEs / projectiles
still come from legacy drawers"; **fluid jets appear in no handoff document**,
and the first draft's citation of `14-V4-EXTENSION-CONVENTIONS.md` was false —
that file is 38 lines and contains neither word. The pixel jet is debt this plan
is discovering, not inheriting, and it should not be dressed as scheduled
cleanup.

Add `drawFoundryAOE(a)` to the `||` chain at `:2947`, and a pixel jet band drawn
at exactly `jet.w` wide from `along=0` to `along=jet.length`. Be precise about
what "pixel-identical to its collision rectangle" can mean: there is **no single
collision rectangle**. `jetSample` (`bladefall-fluids.js:217`) tests
`along < -8 || along > jet.length || Math.abs(across) > jet.w/2 + radius` — the
entity band starts 8 units *behind* the mouth and is inflated per-body. The
current legacy draw is a taper, 0.84w narrowing to 0.36w with an alpha fade. So:
**the drawn band is the `jetCovers` footprint** — the thing that holds the mould
— and the entity push band is wider. That is the honest promise, and it is the
one the player cares about.

**Renderer scope, stated plainly.** Eight sites plus a call site: `drawHeatStone`
restructured, `drawColossusFigure` rewritten, `drawForgeCoolantV4` rebound,
`drawAmbience` one expression, `ember-stack` +3 lines, `pour-spout` +`pourAim`,
new `drawFoundryCombat`, new `drawFoundryAOE`, new pixel jet band. Roughly
250–350 lines. It is the second-largest work item in this plan and item 10 of §7
writes it as a tidy list. It is not tidy.

---

## 6. Story

The charter's logic is that the enemy commander who ordered the knight's
poisoning is rendered as **the thing that casts the army**, and the evidence is
the scale of the moulds, the standing orders, and a general shaped like a
furnace. Four of the five designs fought a furnace and dropped the general. The
fidelity judge was right that this is the gap, and right that the answer already
existed in the design the fun judge ranked last. **Take the meaning, not the
mechanism.**

**The moulds are the army.** Not adds — evidence. Six casting moulds at the scale
Emberdeep established, and you spend the entire fight trying to stop them being
filled. The first time you fail, one opens and a Causeway shieldbearer walks out
of it, shield up, and the player realises what the Foundry has been making. That
is one spawn call and one flag, and it lands harder than a wave would, because a
wave is a downgrade from a boss and one body is a revelation.

**The last order is the finale.** When the lid breaks and the coolant falls, the
general cools — and the soldier stops. Weapons down, shield lowered, standing in
a works that has gone quiet. It was never a monster; it was being told. The whole
meaning of the room changes through geometry and timing, with no text, which is
the v4 way.

**Oren.** The verified state: `FOUNDRY_LEVEL.npcs` is
`[{x:1020,y:0,kind:'escort',profileId:'sera'}]` (`:5998`) — no `relay`, no
`essential` — and **there is no `sendPost` or relay plate anywhere in the level**
(the three that exist are at `:6084`, `:6099`, `:6122`, all inside
`EMBERDEEP_LEVEL`). That is why `bladefall-milestones.js:24`'s `companion-command`
promise is a false *description*. To be precise: the **gate still functions** —
companion-command is granted in Emberdeep (`:4843`) and `physicalSeamSpec:7847`
already requires it to reach stage 10 at all. Nothing is currently broken. What
is untrue is what the contract says the fight does. Emberdeep already spent the
relay-on-a-heat-pad idea, so repeating it here would be a rerun.

Give him one job that is his: **he works the sluice gate.** One `sendPost` plate
on the pit floor at **x=12700**, west of `forgeArenaL`. Send him and he turns the
wheel: the header's **`jetWidth` goes 58 → 150** and `updateFoundryQuenchJets`
holds the **two** nearest moulds instead of one, while the plate is pressed.
**Your spray widens.** That is the difference between laying one wall and laying
two in front of an Act III front, and it is one branch.

Three things the first draft got wrong here, all corrected:

- **The plate is not at 13160.** That was inside the boss pen *and* the exact
  coordinate the last order kneels on — the Colossus would stand on Oren and
  kneel on top of him for the whole finale. 12700 is 160px west of the pen and
  460 from the kneel.
- **`transferRate` and `jetLength` are not his effect.** `transferRate` scales
  only `strength`, a push force on sampled entities, and cannot touch a rectangle
  test against a platform. `jetLength` 280 already reaches a bed underside at 118
  from a pit floor at 0 with 162 to spare; 360 buys nothing. `jetWidth` is the
  one authorable field the covering rule and the drawn band both see.
- **He must not ride his own jet.** `:13343` runs `portalTransit(n,dt)` for any
  escort in state `'follow'` or `'send'`, so a following Oren who walks over the
  pit-floor mouth is teleported onto the submerged shelf at 318 and has to walk
  off and fall back — repeatedly, because the mouth sits on his route. Set
  `n.noPortalTransit=1` on the Foundry escort and add `&&!n.noPortalTransit` to
  the `:13343` condition. One token; nothing else in the game sets the flag.

He is **`essential:1`** — matching Emberdeep's escort (`:6143`), but **without**
that escort's `noRubberband:true`, which would leave him behind in a boss arena.
`essential` guards exactly two damage paths: the fluid DoT at `:13321` and the
enemy-contact loop at `:13407`, whose body at `:13413` is the only place an
escort's hp reaches zero. Falling out of the world recalls him (`:13331`). So he
genuinely cannot die, and as a side effect the arena's only ungated `addText` —
`'PROTECT ME!'` at `:13411` — never fires, which is how the fight is actually
silent.

He is not a damage source, not a timer, and not something that can be shot off
and re-sent in a loop; escort micromanagement inside a boss fight is a reliable
fun-killer and this design refuses it. If you never send him the fight is
entirely winnable; the spray is just narrower. He came to read the machine, and
the machine turned out to be an officer, and the last useful thing he does is
open the tap.

That makes the milestone contract true instead of a lie, in one plate.

---

## 7. Implementation order

1. **Free the mouths and fix the revisit.** In `setupFoundryBoss` (`:5552`), set
   `outlet.gone=true` on the authored `Anchor` and set `e.colossusForge=1`. **Add
   a colossus block to `killEnemy`** — there is no branch to edit; the only
   mention of the type in the whole function is a clause in a shared conditional
   at `:10443` whose entire effect is `G.portal=null`. Put the restore inside
   `if(e.boss){` at `:10436-10445`, and note `:10439` already calls
   `clearPlacedPortals(false)` on every boss death, so the restore must not
   assume a surviving pair. Add `bossSkipCircuit:'foundry-colossus'` to
   `FOUNDRY_LEVEL` and widen the spawn gate at `:7020`:

   ```
   const zs=G.levelSelectMode?G.sessionZoneState:meta.zoneState;
   let bossDone=false;
   if(L.bossSkipCircuit){try{bossDone=!!BFZoneStateModule.hydrate(zs,'ember-colossus',[]).circuits[L.bossSkipCircuit]?.open;}catch(_e){bossDone=false;}}
   if(s.boss&&!hasCapability(L.bossSkipCapability||'__never__')&&!bossDone){ … }
   ```

   **Not `persistentCircuitOpen`.** It reads `G.persistentCircuits`, which is
   assigned in exactly one place — `applyZoneHydration:7163`, reached from
   `activateZonePersistence` at `:7409`, **after** `buildCustomLevel` at `:7405`.
   At `:7020` it is empty on a first load or holds the previous zone's circuits.
   The condition could never be true when it matters. `hydrate` reads the save
   directly and is the idiom `:4643` and `:4658` already use. **And
   `meta.world.cleared` is not a substitute either**: `recordWorldClear()` fires
   from `claimFoundryMemory` at `:4823`, at the anvil, before the player ever
   reaches the pit.

2. **`installFoundryBed(e)`**, following `installCourtArena` (`:5570`) and
   defined outside the `FOUNDRY_LEVEL` source span. Sentinel-guarded on
   `o.castingBed`. Pushes everything in §3 and mutates the authored header
   `Fluid` in place (`y:300, h:120, drag:0, jetWidth:58`). Guard on
   `G.stageIndex===10 && !G.bossRush`, which matches the existing branch
   condition at `:14719` exactly. Called from `setupFoundryBoss`, and mirrored on
   revisit **at `:7024`, beside the court's hook, inside `buildCustomLevel`** —
   not in `loadStage`, which returns at `:7411` immediately after calling
   `buildCustomLevel`:

   ```
   if(G.stageIndex===10&&!G.obstacles.some(o=>o.castingBed)&&<circuit open>){installFoundryBed(null);registerCircuits();}
   ```

   `registerCircuits()` (`:10652`) is what indexes the sluice plate into
   `G.plates`, and the court's hook calls it for the same reason. It must also be
   called after the boss-path install.

3. **The mould clauses in `updateHeatStone`.** First change its signature:
   `function updateHeatStone(dt){` at `:4774` and `updateHeatStone(dt);` at
   `:12516` — it currently takes **no arguments** and there is no `G.dt` anywhere
   in the file, so nothing can decrement without this. Then, respecting the
   `if(o.heatSet){…continue;}` guard at `:4778`:
   - `o.heatFrozen` → force COLD. **Above** `:4778`, so it reaches set moulds.
   - `o.quenchHold>0` → `heatState=HEAT_SETTING; gone=false; ice=1;` decrement.
     **Below** `:4778`, so a jet cannot reopen stone the player has won.
   - `o.pourHold>0` → same, decrement. **Below** `:4778`.

   A clause placed literally "at the top" would flip a finished `heatSet` mould
   to SETTING with `ice=1` — slick footing on stone the player has already won,
   and a `heatState` that no longer agrees with `heatSet`.

4. **`updateFoundryQuenchJets(dt)`** — walks `G._fluidJets`, applies
   `jetCovers(jet,o)` (§3) over `castingBed` plats, holds the single nearest
   (two, while Oren's gate is pressed), sets `o.quenchHold=0.35`. ~20 lines.
   **Called at `:12516`, immediately before `updateHeatStone(dt)`** — not from
   `updateFoundry()` at `:4829`, which runs at `:12518`, one line *after* the
   heat update, costing a second frame of latency. `G._fluidJets` is rebuilt at
   `:12019-12020` inside `updateObstacles(dt)`, which runs at `:12591` — so the
   jets are always one tick stale. At 60fps that is 16ms against a 0.35s hold
   (~21 ticks): the mould never flickers, and the plan does not pretend the
   ordering is free.

5. **The damage layer.** `resolveColossusQuench(e,mould,grade)` (§4, exact
   ordering); `colossusActFloor(e,amount)` and `colossusExposeDamage(e,amount,src)`
   beside `courtFinalDamage` (`:5647`); the wrap of `rawDamage` at `:10268`; the
   clamp before `e.hp-=amt;` at `:10196`; `&&!e.forgeFight` added to `:14105`;
   `&&!e.colossusForge` added to `:14011`. **Build and test this before any
   behaviour** — it is the fix for the reported bug, and everything else is the
   fight around it. Record the Test Mode change in the commit message.

6. **`updateColossusForge(e,target,dt)`, Act I only.** The walk / plant / pour /
   hammer / aimed-shot machine, dispatched at `:13916`. It owns its own
   `e.forgeStunT` decrement (it sits above `:13917`) and its own pen clamp (it
   bypasses `:13936`). Plus `beginColossusPour(e)` / `releaseColossusPour(e)`,
   and the `mould.pourArm` clause appended inside `slamImpact`'s heat loop before
   its closing brace at `:11515`, guarded on the banked target. Plus the
   nearest-only bed selection (§3). **Playtest the 1.664s window and the 130px
   bed height for feel before tuning a single cadence.** If the strike whiffs,
   lengthen the period before touching anything else — and re-derive the phase
   offsets when you do, because the 1.0s stride and the 200px/s sweep are the
   same number.

7. **Act II.** `beginColossusMount(e)` (`e.vy=-700`, x snapped to the target
   mould's centre, `pourHold=1.2` on it), `belt=±1` on every mould with a 5s
   reversal, the belt exemption line before the pen clamp, the slag activation
   (`delete requiresRepairCatch`, assign `slagCycle`), the `!!o.slagReal` change
   at `:12329`, and the single shieldbearer spawn on the first completed pour.

8. **Act III.** `colossusPourFront(e,dt)` — outward from `e.x` at one mould per
   0.24s in both directions, stopping and quenching on the first `heatSet` mould
   it meets on either side, subject to `e.forgeQuenchCd`. Three wading strides
   between fronts, and the ordinary POUR beat alternating with them.

9. **The finale.** `beginLastOrder(e)`; `spillFoundryCap(o)` hooked from
   `shatterBrittle` (`:11517`). Note the signature is `function shatterBrittle(o)`
   — **there is no `e` in scope**, so the condition reads
   `if(o.foundryLid&&G.boss&&G.boss.forgeAct>=3)spillFoundryCap(o);`, gated on
   the runtime-pushed `foundryLid` and **not** on `castingCap`, which the Room 4
   cache caps also carry (`:5967`). Then `foundryDumpChannel(e,dt)`; the 2.2s
   setting death; the orphan pacification; `colossusBodyBridge()`; both circuit
   latches.

10. **Renderer.** Priced at ~250–350 lines in §5, not a list. `drawHeatStone`
    (`renderer:1412`) gains the crater rim and notch tally **before the
    `state === 0` test at `:1415`**, and the Act II tread — `drawPlat`'s ladder
    at `renderer:1464-1466` hands any `heatCycle` plat to `drawHeatStone` and
    returns, so it never reaches `drawCastingLine` (`:1438`); the cheapest
    implementation is to call `drawCastingLine`'s existing tread-and-roller block
    from inside `drawHeatStone` rather than author a new overlay.
    `drawColossusFigure` (`:2070`) is **rewritten**: plant / pour / hammer /
    mounted / front / spent, the four dead rush states re-keyed onto the new
    windups, seam thickness bound to `forgeQuenches` at `:2089`, the setting
    death. `drawForgeCoolantV4` (`:2049`) rebinds `need` and `lit` at
    `:2058-2060` and retires `o.forged`/`o.flash`/`o.hits`. `drawAmbience`
    (`:121`) reads the boss at `:125`. `'ember-stack'` (`:2313`) gains
    `o.stackDark`. `'pour-spout'` (`:2286`) gains a `pourAim` state. New
    `drawFoundryCombat()` at `:2946` for the aim line, the jet band and the
    front's pip track; the pour column and the arm live inside
    `drawColossusFigure` for z-order. New `drawFoundryAOE(a)` added to the chain
    at `:2947`.

11. **Oren.** The `sendPost` plate at x=12700 built as
    `Object.assign(Plate(12700,0,'foundry-sluice-gate'),{sendPost:1,foundryGate:1})`
    — **not a raw object literal**; `Plate` (`:3128`) supplies `pressed`, `down`
    and `w:60`, and the plate update path reads `w` for its overlap test.
    `essential:1` on the Foundry escort (no `noRubberband`). `n.noPortalTransit=1`
    plus the `&&!n.noPortalTransit` guard at `:13343`. The `foundryGate` effect on
    the header's `jetWidth` and the jet's mould count.

12. **Contracts and bookkeeping.**
    - `bladefall-milestones.js:24` →
      `required:['jump','weapon','portal-pair','double-jump','downward-strike','companion-command']`,
      `solution:'make-the-ground-and-refuse-the-pour'`, `phases:4`. It currently
      promises `attunement`, which is the White Court's gate (`:5405`) and which
      this fight does not touch.
    - **`advanceColossusAct(e)` also writes `e.phase = e.forgeAct + 1`**, plus
      `phase2Started` / `phase3Started`. `summarizeBossProbe` — the only thing
      `tests/boss-baseline.test.mjs` actually exercises — keys entirely on
      `boss.phase` / `phase2Started` / `phase3Started` / `hpFraction`. A fight
      that advances on `forgeQuenches` and never writes `phase` reports as a flat
      fight with no progression. (With `&&!e.forgeFight` on `:14105`, nothing
      else writes `phase` for this boss, so there is no contention.)
    - `e.finalePhases` — four entries. It does **not** reach a HUD: `:9913` sits
      inside `applyFinaleActRemaster()` (`:9833`), whose first statement is
      `if(G.stageIndex<12||G.stageIndex>15)return;`, and the object is only
      reachable through the `window.__BF.finaleActState()` diagnostics export.
      What it does reach is `scripts/boss-baseline.mjs:139`
      (`finalePhases: boss.finalePhases || null,`), which is unconditional. That
      is the reason to set it.
    - `scripts/boss-baseline.mjs` samples `forgeHits` at **:141** (in the
      one-shot `bossContract` block) and `forgeStunT` at **:192** (in the
      per-sample `sampleBoss` block) — two different structures. Add
      `forgeQuenches` and `forgeAct` to the per-sample block.
    - **Co-op: deferred, and the deferral is mould-clock replication, not one bit
      per mould.** `COURT_TELL_FIELDS` (`:21191`) is packed last in the enemy row
      at `:21210` and read back as `r[20]` at `:21225`, so index **21** is
      genuinely the next free slot, and `plat` is already in `NET_DYNAMIC_TYPES`
      (`:21042`). But the packed plat row (`:21048-21058`) carries no `heatSet`,
      no `heatState`, no `heatCycle` and no generic `ice` — and
      `resolveColossusQuench` writes `heatCycle.phase = -G.time` while
      `netApplyWorldSnapshot` (`:21222`) never assigns `G.time`. A `forgeSetMask`
      would sync the set flags while every guest's bed ran on a different phase
      and a different clock. Nothing in `tests/` or `scripts/` exercises co-op on
      stage 10; single-player is the declared foundation mode.
    - Tests: `tests/ember-colossus-stage.test.mjs` **passes unmodified**,
      including under the two level-data edits this plan does make
      (`bossSkipCircuit` on the level object, `essential:1` on the npc) — no
      assertion reads either. If it fails, the arena has been authored into level
      data by mistake; fix the implementation, not the test.
      Add `tests/ember-colossus-boss.test.mjs` asserting the runtime arena:
      six `castingBed` moulds at y=130 spanning 12798–14002 with **no gaps**
      (`w=204` on 200 centres) and **`h:12`** (6px of head clearance under
      112); the six phases distinct and equal to `(6 - i) % 6`; the mutated
      header at `y:300, h:120, drag:0`; the shelf, step and lid each carrying
      their flag (the regression for `Slate`'s three-argument signature); the
      ladder rungs all ≤ 154.61; the lid a single `foundryLid` panel and the Room
      4 caps **not** carrying it; the anchor `gone` during the fight and restored
      after; `COLOSSUS_ACT_FLOOR` and the 1-HP act III floor; and the working
      area narrower than 1500 units, which is what keeps `:12897` from wiping the
      player's mouths.

---

## 8. Rules this fight must not break

- **The pit floor stays whole, slate and safe for the entire fight.** No lava, no
  spikes, no pit, no fluid in the arena below the bed. The fun lens will call
  that defanged; the answer is that the pit floor is where the Colossus is
  standing, and contact damage down there is real, immediate and costs a measure
  — on a 55px horizontal reach, so it is escapable, which is why the fall-through
  beat is a cost and not a punishment.
- **No routine hazard may call `hurtPlayer(…, false).`** It rewinds to the
  checkpoint and calls `clearPlacedPortals(false)` (`:10069-10080`). This rule
  had two live violations in the first draft and both are closed: the slag crush
  at `:12329` now passes `!!o.slagReal`, and the east lip at 14380–14620 puts the
  out-of-bounds rewind (`:13642`, via the level-wide pit at `:6840`) 420 units
  beyond the arena's east edge instead of 120. Every wound in this arena is a
  real wound.
- **Act advancement is never HP-keyed.** `e.forgeQuenches` only. The generic
  ENRAGE at `:14105` is exempted explicitly, because with an Act II floor of 0.26
  it would otherwise fire by construction.
- **`e.forgeQuenches` never decreases within a life.** Not on a failed finale,
  not on a re-melt. Time may be lost; progress may not. A death rebuilds the
  stage and resets everything, which is the same scope every runtime arena in the
  game operates under.
- **`e.exposeT` never opens an unbudgeted window.** Both clamps ship together,
  and the quench's own hit lands **before** the window opens.
- **One quench per event.** `e.forgeQuenchCd` is checked at the top of
  `resolveColossusQuench`, not at each call site.
- **The pit floor must remain the first `slate` object in `FOUNDRY_LEVEL.objects`**
  — the stage test reads `at(o=>o.slate)[0].w >= 2000` at `:100`. All new slate
  is pushed at runtime, after it.
- **No new anchor inside the arena.** The authored one is silenced by `gone`, not
  deleted, and is restored on the kill.
- **Boss Rush keeps falling through to the legacy arena at `:14724`; NG+ does
  not, and never did.** `:14719` tests `!G.bossRush` only — unlike the White
  Court's `:14694`, which tests `G.ngPlus===0&&!G.bossRush`. NG+ at stage 10
  already runs `setupFoundryBoss` today and will run the new fight. If it is ever
  decided NG+ should get the legacy wet-forge arena, that is a **behaviour
  change** requiring `G.ngPlus===0` at `:14719`, not a preservation.
- **No signs, no loot, no shouts, no key.** `LEVEL.loot.length === 0` and the
  zero-signs assertion stand; `:10427` already withholds the key at stage 10 via
  `G.stageIndex>V4_LAST_STAGE`. The silence is enforced by *not writing*
  `addText`, and by `essential:1` removing the escort's `'PROTECT ME!'` — not by
  `combatShoutsQuiet()`, which gates six boss shouts and nothing else. You walk
  east past the body to the fissure.
- **Nothing may require an optional Echo, a drop, a specific weapon, or Test
  Mode.** Grade 0.45 is available in **every act**, including Act III, which is
  why the ordinary pour beat keeps running between fronts. A player who never
  masters the jet or the window still finishes. (Test Mode no longer one-shots
  this boss; that is deliberate and recorded.)
- **Oren cannot die and is never required.** The fight is winnable without ever
  sending him.
- **The shieldbearer cannot die and cannot be the recalled body.** A 1-HP floor
  through `colossusActFloor`, and `musterUpgraded:true` at spawn so
  `applyRecallBaseline` (`:13812` → `:4630`) never makes it 1.55× tankier. The
  finale always has its soldier, and it is always the authored silhouette.
- **The strike's constructive half stays the verb.** Breaking the lid is the
  region's other half and it appears exactly once, at the end, where it opens the
  coolant rather than a box.
- **Density target ≈ 6 objects per 1,000 units**, and every conveyor, mould and
  pour has visible drive and a reason to be there.
- **The bot is not proof.** The room-by-room bot must report its exact remaining
  failures, and a human playthrough still judges pace and legibility. No
  deployment without the owner's explicit request.

---

## 9. Errata against the first draft

Eight auditors checked 182 claims against source; 90 were wrong or mis-cited and
10 were fatal. Every fatal and major finding is resolved in the design above.
One line per correction.

**Fatal — beats that could not have worked**

- `updateHeatStone()` takes **no arguments** and there is no `G.dt` (`:4774`,
  called at `:12516`); the signature and call site change, or no clause can
  decrement anything.
- The `quenchHold` clause must also set `o.gone=false`; as first specified a jet
  on a molten mould held a **hole** open, not a window, and the Act III verb did
  not exist.
- Period 5.2 with six moulds on a 1.0s stride **overlaps** — moulds 0 and 5 are
  both holes for 0.632s of every cycle. Period is now **6.0** (`molten:.13867,
  set:.416`, MOLTEN 0.832s and SETTING 1.664s preserved exactly, 0.168s of solid
  bed per cycle).
- 190-wide moulds on 200 centres left **five 10px seams** against an unpadded
  point floor query (`:13457`, `getFloor` pad 0). Moulds are now **204 wide**,
  4px overlap, no seams. The hole is **196px**, not 190, against a **226.9px**
  double jump.
- `slamImpact`'s ±(w/2+26) tolerance set **two** moulds per strike; nearest-only
  selection for `castingBed` added. Same for the lid.
- Act I slag could not be made dormant by withholding `slagCycle` — traps also
  drop on player proximity (`:12324`). They now carry
  `requiresRepairCatch:'foundry-line-live'` and are hand-built, not `FSlag`.
- Grade 0.45 said the mould stays `heatSet` while the pseudocode it called blew
  it out. **Only grade 1.0 blows moulds out**, and it blows out three.
- `COLOSSUS_ACT_FLOOR`'s third entry of **0 is no clamp at all**; Act III now
  uses the warden 1-HP primitive (`:10195`, `:10271`) so the boss cannot die
  before its own finale.
- `e.vy = -520` apexes at **96.6px** against a 130px bed under g=1400 — Act II
  never started. It is **-700** (apex 175), with the landing mould held solid for
  the flight.
- `Slate(x,w,y)` takes **three arguments** (`:3115`); every tagged `Slate` in the
  first draft silently dropped its flag, which would have defeated the test the
  plan itself commissioned. All four use `Object.assign(Slate(…),{flag})`, the
  idiom the level already uses at `:5980`.
- `persistentCircuitOpen` at `:7020` reads `G.persistentCircuits`, hydrated at
  `:7163` **after** `buildCustomLevel` — the revisit condition could never be
  true. It reads `BFZoneStateModule.hydrate(…)` directly, per `:4643`.
- Act III had **no grade-0.45 path** (no pour, no arm, no `pourArm`) and an
  uncappable boss — unwinnable and unloseable. The pour beat now alternates with
  the front.
- Pre-setting all six moulds made every pour a free grade-1.0 and the fight ~55
  seconds. The boss targets un-set moulds and a jam re-melts three.
- A bidirectional front paid **two** quenches, ending Act III in 4.6s.
  `e.forgeQuenchCd` makes one quench per event structural.

**Major — beats that would have shipped broken**

- `killEnemy` has **no colossus branch**; the only mention is a clause at
  `:10443` that nulls a portal. The restore is new code inside `if(e.boss){` at
  `:10436`, where `:10439` already wipes placed portals.
- The `hitEnemy` clamp cannot be "one line" — `:10271` computes and subtracts in
  one statement. It wraps `rawDamage` at `:10268`, which also swallows
  `meta.testMode`; Test Mode no longer one-shots this boss, deliberately.
- `dotDamage` (`:10190`) has **no portal gate at all** and five live callers. Its
  clamp is mandatory, not defensive, and it is a fourth independent reason the
  fight was short.
- `resolveColossusQuench` opened `exposeT` **before** calling `hitEnemy`, so its
  own 14% was capped at 1.5% by its own clamp. Reordered to match `:14433/:14434`,
  and `src==='quench'` exempted. `dir` was undeclared — a `ReferenceError`; it is
  derived.
- ENRAGE at `:14105` contains **no `forgeFight`** to delete and **would have
  fired** at the Act II floor, silently buying speed×1.22 and shootCd×0.6.
  `&&!e.forgeFight` added.
- The legacy colossus block at `:14011` sits **outside** the dispatch chain and
  keeps firing eruption AoEs, the fire trail and the rush accelerator regardless
  of any `else if`. It is gated on `!e.colossusForge`.
- **NG+ does not fall through to the legacy arena** and never did (`:14719` tests
  `!G.bossRush` only). §1 and §8 now state it as fact.
- `FSlag`'s landed surface is `o.y+o.h` = **188**, not 130, and a player standing
  there **locks out the mould below** (`|130-188| = 58 > 44`). `floorY:114`, and
  the blocks sit at the junctions.
- The slag crush at `:12329` calls the banned `hurtPlayer(…,false)`. One
  argument changes to `!!o.slagReal`.
- The east apron sat **120px** from the 14400 void and a real rewind. An east lip
  at 14380–14620 closes it.
- `muster:true` without `musterMin`/`musterMax` **NaNs the shieldbearer's x** on
  its first frame (`:14237`); the flag is dropped. `turnDelay:1.15` restored.
  `musterUpgraded:true` added so `applyRecallBaseline` (`:13812`) cannot make the
  revelation 55% tankier.
- "Frontshield off, speed restored" does **not** pacify — contact damage is
  authorised by `e.boss||…directive(e).attack` at `:14240`. It is
  `e.active=false; e.noticeRange=0`, which `:13875` short-circuits before the
  contact block.
- A pacified body could also be **killed** during Act II, silently deleting the
  finale beat. `foundryOrphan` gets a 1-HP floor.
- Three `Cap(…,110,…)` panels on 100 centres break **two at a time**
  (`o.w/2+30`), and a continuous lid provably cannot require three strikes. The
  lid is one 320-wide panel and one strike — the beat simplified rather than
  engineered around.
- `castingCap` is **not unique to the lid**: `Cap(11940,120,140),Cap(12060,120,140)`
  (`:5967`) carry it, so the finale could be pre-broken from Room 4 and
  permanently unsatisfiable on a retry (`reform:9999`). The hook gates on
  `foundryLid`.
- `shatterBrittle(o)` has **no `e` in scope**; the hook reads `G.boss`.
- The jet record has **`nx, ny, w, length, source, pairId`** — no `direction`, no
  `width`, no `owner`. Reading the wrong names fails silently.
- `transferRate` scales only a push force on sampled **entities** and cannot
  affect a rectangle test against a platform; Oren's gate moves **`jetWidth`**
  and the mould count instead.
- `jetLength:280, jetWidth:58` on the header is a **literal no-op** — those are
  the defaults, and no level in the repo authors either field.
- Draining the header's `h` to **0** kills the jet outright
  (`containsPoint(…,318,10)` fails). It drains to 10.
- `buoyancy:0` does not make the coolant "standable" — there is no swim state
  anywhere; it removes the float so gravity carries you through onto whatever is
  below. The authored `drag:0.9` would also have made the 102px rung a guess;
  the mutation sets `drag:0` and the ladder is stated in dry-air arithmetic.
- Oren's plate at x=13160 was **inside the boss pen and on the last order's kneel
  coordinate**. It is at 12700. `portalTransit` (`:13343`) also teleports a
  following escort through the fight's own jet mouth; `noPortalTransit` closes it.
- `drawForgeCoolantV4` is **not "zero new renderer code"** — `lit` at `:2059`
  reads the deleted `o.hits`, and three more states (`:2051`, `:2056`,
  `:2062-2066`) die with the circuit. ~6 lines, plus a decision to retire them.
- The figure's seam is **`seamH` at `:2089`**, a height scaled off `H`, not a
  width at `:2093` (a comment). Deleting `forgeRushWind`/`forgeRushT` also blanks
  **four** of its five existing states, which must be re-keyed.
- `drawFoundryCombat` at `renderer:2946` paints **under** the boss and the hero;
  the pour column and the arm move inside `drawColossusFigure`.
- `drawHeatStone` has **three early returns** (`:1422`, `:1430`, tail); the
  crater tally must be drawn before `:1415` or it is invisible on exactly the
  permanently-MOLTEN moulds it counts.
- `LLM-HANDOFF/14-V4-EXTENSION-CONVENTIONS.md` names **neither** `drawAOE` nor
  `drawFluidJet`. The real citation is `13-V4-RESPEC-WORK-ORDER.md:238`, and the
  pixel jet is undocumented debt this plan discovers, not inherits.
- "Pixel-identical to its collision rectangle" is not achievable — `jetSample`
  starts 8 units behind the mouth and inflates by each body's radius. The drawn
  band matches the **`jetCovers`** footprint, which is the part that matters.
- `combatShoutsQuiet()` suppresses **nothing** by itself; the fight's silence is
  a house rule plus `essential:1`.
- `meta.soundCaptions` is a **boolean**, not a table; it is three
  `showSoundCaption(text,pan)` calls.
- `e.finalePhases` cannot reach `:9913` — `applyFinaleActRemaster` returns for
  any stage below 12. It is set for `scripts/boss-baseline.mjs:139`.
- `summarizeBossProbe` keys entirely on `e.phase`; an acts-not-HP fight reported
  **no progression at all**. `advanceColossusAct` now writes `e.phase`.
- The revisit hook belongs at **`:7024` inside `buildCustomLevel`**, beside the
  court's, with `registerCircuits()` — not in `loadStage`, which returns
  immediately after.
- The sluice plate as a raw literal omitted `pressed`, `down` and `w`; it is
  built with `Plate(…)` (`:3128`).
- A **third** anchor reader exists at `:12897`, range **1700**, and wipes the
  player's mouths when nothing is near. The arena's 1300-unit working area is why
  no edit is needed — and §7.12 asserts that width so a future widening cannot
  reopen it.
- `pour-spout` (`renderer:2286-2291`) draws an unconditional **400px feed pipe**
  that would have run straight through the header and the lid. Two of six bays
  have no spout, and the pour tell is the arm.
- The spout clock and the boss's pour cadence are **unrelated**; a spout-lit
  hairline would have meant two different things. Spouts read the bed clock only.
- The Act II belt exemption reads `enemyConveyor` from
  `BFEnvironment.material(…)` (92 on all four materials) rather than a literal;
  `belt` is a signed **multiplier**, and stays strictly ±1.
- `applyCampaignCadence` (`:8702`) can stamp `belt` on any plat with `w>=90`
  (`:8737`); `e.cadenceArenaL` stays at its authored 12200, which puts `endX` at
  11940, west of the bed.
- The boss pen clamp at `:13936` is inside the `else{` block at `:13927` and
  **never runs for a dispatched boss**. `updateColossusForge` owns it, after the
  belt push. Authored pen values are 12520/13780; they are re-set to
  12860/13940.
- `installFoundryBed` must be defined **outside** the `FOUNDRY_LEVEL` source
  span or the stage test's vm slice swallows it. No shared constructor is edited,
  for the same reason.
- `FHeat`'s `o` **replaces** `heatCycle` wholesale, so the positional `phase` and
  `period` arguments go dead and omitted keys fall back to `heatStateOf`'s
  defaults, not `FHeat`'s.
- The shallow clone at `:6818` shares nested objects with the module literal, so
  `heatCycle.phase = -G.time` is safe **only** on runtime-pushed moulds; the same
  write on an authored `FHeat` would desync that slab for the life of the page.
- The mould underside at `h:16` gave the boss's head **2px** of clearance. `h:12`
  gives 6, and the test asserts it.

**Minor — numbers and citations corrected in place**

- Contact damage: boss centre **56**, player centre **152**, gap **96**, against
  a derived threshold of **78** — an **18px** margin, not "98 > 80." Horizontal
  reach is **55px**. On a mould the gap is 34 and contact **is** live.
- The AoE damage line is **`:14587`**, not `:14588`. `a.warn` does not exist; the
  telegraph is `t`/`t0` (`:14579`). A `type:'slam'` record needs a `color` or
  `:14584` pushes 25 particles with `undefined`.
- `heatStateOf` is **`:4769`**, `updateHeatStone` **`:4774`**, the loop head
  `:4776`. `dotDamage` is **`:10190`** (`:10189` is its comment). `wardFloor` is
  **`:10269`**, its consumer `:10270`, `courtFinalDamage`'s call `:10268`. The
  dispatch is **`:13915`**. `slamImpact` is **`:11488-11516`**, its heat branch
  `:11505-11515`. The legacy colossus block is **`:14010-14036`**. `G._fluidJets`
  is assigned at **`:12020`**. `runSpeed: 200` is
  `bladefall-movement-progression.js:19`. `playerConveyor` is
  `bladefall-environment.js:6-9`, uniform across materials. The set seam is
  `renderer:1433-1434`; `drawPlat`'s ladder is `renderer:1464-1466`. The ledger
  is `:5907-5908`. `installMusterRoster`'s block is `:4670-4679` with
  `G.killGoal++` at `:4679`. The slate assertion is
  `tests/ember-colossus-stage.test.mjs:100`, not `:93`.
- The pit floor's real text is
  `Object.assign(Pl(13300,2200,0,{deep:1}),{slate:1,h:20,foundryFloor:1})`
  (`:5980`), not a single options object.
- The eastward seam is a `physicalSeamSpec` branch at **`:7848-7850`**, gated
  `requires:'downward-strike'`, crossing at the level edge **16538** — not the
  fissure door at 16420, and not a level object at all.
- `tests/boss-baseline.test.mjs` asserts **nothing** about this boss or arena;
  it is two tests over hand-written brute and king fixtures.
- The boss-respawn bug is real but **not unique to stage 10** — only stages 6 and
  8 carry a `bossSkipCapability`, so the Causeway brute and the Hollow Marksman
  archer respawn for the same reason.
- `companion-command` is a false **description**, not a broken gate: it is
  granted in Emberdeep (`:4843`) and `physicalSeamSpec:7847` already requires it
  to reach stage 10.
- The 1.664s window against a 1.3s cooldown leaves **0.364s** of usable margin
  and requires an immediate jump-into-slam. It is a second chance, not a
  comfortable one.
- The pace table's "hard floor near 2:20" was arithmetic against a rebuild cost
  the design did not impose. The honest floor is **~1:25**, typical **~2:45**,
  and the tuning lever is the re-melt radius.
---

## 10. Built — what changed against this spec

Implemented 2026-09-17 at **7.118.0 / cache 204**. The spec above is the design;
this section is the honest record of where the build departed from it and why.
Every departure was forced by something visible in play, not by convenience.

**Cut**

- **The skyline readout is gone from the arena.** The spec put eight
  `ember-stack` flues behind the pit, one going dark per refusal. `tower()`
  draws opaque brick with no depth treatment, and eight of them across
  12500–14320 covered the bed, the header and the Colossus completely — the
  first screenshot of the fight was a brick wall. The stacks are not authored in
  the pit. `darkenFoundryStack` survives and still darkens whatever stacks a
  region has, so the readout works in Emberdeep; the arena keeps three redundant
  channels instead of four, and all three are inside the frame you are looking
  at: the bed's craters, the core seam, and the forge's pip row.

**Added, because the fight needed it**

- **The machine never pours twice into the same bay.** `colossusBankBed` excludes
  `e.forgeLastBed`. Without it the first playtest had the Colossus standing at
  one mould pouring into it every 4.2 seconds forever, because the nearest un-set
  mould after a completed pour is the one it just used. It now steps along the
  bed, which is the spatial chase the design is built on.
- **The hammer's cooldown ticks on the fight's clock, not the walk beat's.** As
  specified it only decremented inside `walk`, and the boss spends most of a
  cycle in `wind`/`recover` — the anti-camping attack fired roughly never.
- **It climbs back onto the line.** §4 says a Colossus that pours into a mould
  that is not yours "re-melts its own footing and falls through its own pour",
  and the engine gives that away for free — but nothing sent it back up, so one
  failed pour ended Act II's whole premise and the rest of the act happened on
  the pit floor. `beginColossusMount(e, first)` now takes a re-mount, on a 2.2s
  cooldown, and only the first mount starts the belts and arms the slag.
- **Mould walls.** Six bays did not read as six from across the pit — the bed was
  one pale strip. `heatCrater` draws each `castingBed` mould's own end walls in
  every state, and a set mould's surface is paler than the works' own stone.

**Verified in play, not merely in test**

- The full arc runs: Act I → II → III → THE LAST ORDER → the lid → the channel →
  the death → the body bridge at 14400–15400, with the circuit latched in
  `meta.zoneState` and the arena re-entered cooled on the next load.
- The act floors hold exactly as derived. Against this save's NG-scaled
  `maxHp 1600`, refusals landed 224 each and the boss sat at **992** after
  quench 3 (0.62 × 1600) and at **1 HP** entering the finale — damage never
  bought an act.
- A jam blows the target and both neighbours; `forgeQuenchCd` keeps a
  bidirectional front to one refusal.
- The Act II launch reaches: apex **169** measured against the 175 predicted,
  landing on the bed descending at ~355px/s, then carried by the belt.
- A player standing still on the bed dies in about ten seconds to the pour plus
  the newly-telegraphed shot. That is the intended cost of not moving.
- Emberdeep is unaffected: 11 slabs still cycling, molten still holes, setting
  still slick, and no arena object leaks into stage 9.

**Not done**

- **Co-op remains deferred**, for the reason §7.12 gives: the packed plat row
  carries no `heatSet`, and `resolveColossusQuench` re-phases `heatCycle.phase`
  against a `G.time` that `netApplyWorldSnapshot` never syncs.
- **The `pour-spout` `pourAim` state** was not added; the mould's own held-open
  rim and the raised arm carry the tell, and a fifth cue on the roof was not
  worth the renderer time.
- **No human has played this fight.** Every cadence in §4 is still a starting
  point. The first numbers to judge are the 1.664s setting window and the 4.2s
  pour cadence, in that order.
