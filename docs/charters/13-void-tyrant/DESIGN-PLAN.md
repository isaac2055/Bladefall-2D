# The Void Tyrant / Paradox Citadel — design plan

> ## PLAYED 2026-09-20. The road was rebuilt and the fight is now half a fight.
>
> The owner on the approach: *"No unique portal puzzles, no real platforming challenges,
> all enemies can easily be skipped, no need for Oren, artifactual coin route, and no
> real call for knight to use his wide arsenal of abilities."* All six, in 7.138.0:
>
> - **The coin route is gone.** Both `CoinOb` rewards cut. A coin route is a second road
>   that exists to be collected.
> - **Oren is the gate.** The planks over the 1,260-unit void at 11880-13140 are laid by
>   a `followerOnly`+`sendPost` latch at the foot of the ledgers. You climb the ledgers to
>   read the void, then send him. The road west does not exist until he is told to make it.
> - **Room 3 is the fight's own question, asked once where nothing shoots.** A crate on a
>   shelf that runs into the east face, a ledger below the west one, and a door that stays
>   shut until the crate is on it. A crate can only enter a mouth level with its own
>   centre, so a pair placed on the floor is 197 units outside a 36-unit window — the
>   mouths have to go UP, across from each other, at a matched height. That is the
>   Tyrant's whole sentence, with a crate standing in for the bolt.
>   The ledger sits **below** the shelf deliberately: level with it, the pair would have
>   to land inside a 16-unit band, which is precision rather than a puzzle.
> - **The spent line is lethal.** The teeth under the raised pair are continuous from
>   6320 to 6980; the only way across is ledges that answer once.
> - **One body cannot be walked past.** The vigil guard carries a front shield in the
>   chapel doorway, which is the first thing on this road that asks for the Counter.
>   (`frontShield` authored on a level enemy was silently dropped by the spawn loop; it
>   now survives.)
>
> ### And the fight is the first half of a fight
>
> - **Blood restores to full at every band.** Each band is its own puzzle; arriving at the
>   next one half-dead punished the band you already solved.
> - **The head band fires a quarter slower** (`1.15 -> 1.53`). It is the one band whose
>   pair must sit off the floor, so it has the least ground to read from.
> - **He does not die.** `tyrantWithdraws()`: no corpse, no scatter — the body folds
>   inward along one vertical seam the way a portal shuts, the seam hangs 2.6 s, and the
>   crown goes last and goes *up*. One line: `THE CROWN DOES NOT FALL`. `meta.tyrantWithdrew`
>   is recorded, and the second meeting is proposed in
>   `docs/charters/14-abyss-king/TYRANT-AS-GUARD-PROPOSAL.md`.

# The Void Tyrant — "The Paradox Citadel" design plan

> ## BUILT, 2026-09-18 (Run 5). The COORDINATES below this box are MIRRORED.
>
> Everything below plans the region **west to east** over 17,000 units. It was built
> **east to west**, because the drawn map puts the Inversion above this region's east
> gate and the Drowned Throne beyond its west one. **Every room, rule, number and
> erratum below still holds — read each x as `17000 − x`.** The Gaol's pattern:
> `spawnX: 16700`, `bossX: 1100`, `build(){G.p.face=-1}`, enemies facing the arrival.
>
> | Room | Charter (W→E) | As built (E→W) |
> | --- | --- | --- |
> | 1 · The Fissure Mouth | 0–2,600 | **14,400–17,000** |
> | 2 · The Rising Ledgers | 2,600–5,800 | **11,200–14,400** |
> | 3 · The Opposed Faces | 5,800–8,900 | **8,100–11,200** |
> | 4 · The Spent Line | 8,900–11,800 | **5,200–8,100** |
> | 5 · The Paradox Vigil | 11,800–14,400 | **2,600–5,200** |
> | 6 · The Three-Band Arena | 14,400–17,000 | **0–2,600** |
>
> **The arena is absolute, not derived.** `setupParadoxBoss` is an early return in
> `bossArena`'s tyrant branch (the `setupFoundryBoss` pattern), so the authored region
> never reaches the left-biased 1,270-unit sweep that purges every object whose centre
> falls inside it. Floor `Pl(1400,1280,0)`; faces at **1,950 and 850**, still 1,100
> apart and still 360 tall; **no sign**. `installParadoxFloor(full)` pushes the floor
> and faces when the fight is over, and the five stairs over the faces always — proven
> live: a cleared Citadel keeps its floor, both faces and a walkable road at x=1400.
>
> **The three fixes in "The arena" below were all real, and all landed:**
> **A** the arena now outlives its own victory; **B** the kill records the zone clear —
> verified: the Throne Gate plan returns `boss-clear-required` before `latchVoidTyrant()`
> and `ok` after it; **C** the readout is in the pixel path (`drawTyrantFigure` puts the
> three bands on the BODY as greaves, cuirass and crown with the live one lit;
> `drawParadoxRails` draws them across the arena floor and draws the alignment line,
> which snaps straight when `tyrantPairStatus().ok` and sags when it does not).
>
> **Also built:** `applyFinaleActRemaster` no longer deletes `lowg`/`updraft`/
> `gravityWell`/`rotor` from an authored level — it only ever deleted rolled accents,
> and an authored region has none. The camera anchor now follows travel direction, so a
> westward run sees ahead of itself (this helps the Gaol too). `right-hand-seal` — the
> memory that flips the story to *confirmed*, declared since the story module was
> written and placed nowhere — is a found object in the Vigil. The Citadel joins
> `INTERIOR_STAGES`, because the whole bottom row of the map runs underground.
>
> **Deviation:** the charter's room 5 chapel needed one step inside it. Broken into
> from the roof, a 300-tall pen with a floor at y=0 cannot be left on a double jump
> (154.6). There is a ledge at 150 inside it now.

Status: design, 2026-09-17, second draft. Stage index 12, the first region of the finale act. This
is a **carry-forward**, not a reinvention: Emberdeep, the Foundry and the Inversion set the standard
over the last three runs and this region joins that line. The paradox fight is **not** reopened — it
is documented, given a floor and a stair that survive its own victory, and made readable in v4.

Line numbers are against `VERSION='7.122.0'` (`public/index.html:334`), `public/index.html` at
22,663 lines (md5 `4bbd42c25acddcc0de64ee8de4b73889`), `public/bladefall-respec-renderer.js` at
3,174 lines, all re-read 2026-09-17 after the first draft's audit. **Another session was converting
stage 11 during the first research pass** (`VERSION` moved 7.121.0 → 7.122.0, `CACHE_NAME` v210 →
v211, and a `case 'tyrant'` appeared in `drawEnemy`). Anchor by symbol, re-grep before citing.
Everything below was re-derived at the line, and the reference densities were re-measured in a VM,
not quoted.

---

## What exists and must survive

**There is no authored level.** `CUSTOM_LEVELS` (`public/index.html:6688`) is
`{0…11, 15}` — no key `12`. `loadStage` resolves `customL` to null at `:7941` and stage 12 runs the
procedural chunk generator. `bladefall-campaign.js:230` is `source:'procedural'`; every converted
region says `'custom'`. The stage record is `bladefall-campaign.js:24`:
`{ name:'The Void Tyrant', len:8550, theme:'apex', sky:'#0c0716', ground:'#1c1029', grunts:1, flyers:1, type:'miniboss', boss:'tyrant' }`
against a zone budget of **17,000** (`bladefall-progression.js:36`,
`['void-tyrant', 12, 'Paradox Citadel', 5, 4, 'boss', 17000, 38, 9]`). The region is half the
authored length of every converted neighbour and none of that length is authored at all.

What the generator produces, read out of
`docs/baseline/evidence/13-void-tyrant/runtime-manifest.json` rather than assumed: **96 objects —
51 plats, 17 spikes, 6 signs, 5 walls, 3 levers, 3 springs, 3 traps, 3 checkpoints (x = 2,340 /
5,000 / 7,880), 1 chest, 1 coin, 1 door, 1 crystal, 1 pit** — plus 9 enemies and **2 legendary
armour pickups**. Four set-pieces are injected at x = 1,710 / 3,420 / 5,130 / 6,840 (`:7973`,
`Math.floor(s.len*k/(nInj+1))` with `nInj=4` and `len` 8,550) in spOrder / spAttic / spIce /
spChimney order, from `NONPORTAL_SETPIECES` (`:7176`) indexed `(12*5+injIdx*3)%5` → 0, 3, 1, 4.
`bossIsPortal` is true for `tyrant` at `:7986`, so `buildStageVerb` never runs and the *approach
teaches the region's verb nowhere*. None of it is owned by anything: the manifest records carry
`authoringAct` and no `authoringOwner` at all, and the code path that would assign one falls to
`'procedural-stage-generator'` (`:7647`).

**The fight is authored and good, and stays exactly as it is.** `bossArena`'s tyrant branch
(`:15363-15388`, the function at `:15227`) installs the three-band paradox:

- `TYRANT_PARADOX_BANDS` (`:12395-12399`) — LEGS y48/tol46, TORSO y178/tol48, HEAD y302/tol50.
- `tyrantPairStatus` (`:12403-12414`) requires two mouths, both `nx!==0`, opposed signs,
  `|a.x−b.x| > 700` (`:12408`), `|a.y−b.y| ≤ 72`, and the midpoint within the live band's tolerance.
- Geometry (`:15381-15387`): one plain floor `Pl(bx-300,1280,0,{})` (**not** slate), two
  `SlateWall(bx-850,360,360)` / `SlateWall(bx+250,360,360)` tagged `tyrantWall:1` — **1,100 apart**,
  which is what satisfies the `>700` test — and one `Sign(bx-610,0,'LOW · MID · HIGH — REBUILD THE LINE')`.
  `SlateWall` sets `slate:1` (`:3130`); `Wl(x,y,h,w)` occupies world y from `y−h` to `y` (`:3123`),
  so each face spans y 0…360 and every band sits on it.
- `advanceTyrantParadox` (`:12415-12428`) calls `clearPlacedPortals(false)` (`:12417`), voids every
  in-flight paradox bolt (`:12419`), sets `paradoxStunT=0.95` and `shootT=0.45` (`:12420`), and
  escalates: `shootCd` 2.0 → 1.55 → 1.15, `shot.count` 5 → 6 → 8, `spread` 0.13 → 0.18 → 0.24,
  `speed *= 1.12`, `portalPursuit` +0.18 capped at 1.15 (`:12423-12426`). Base `shootCd` 2.0 comes
  from `EARCH.tyrant` (`:641`), base `spread` 0.13 from `bossArena` (`:15373`).
- `chargeParadoxOrb` (`:12430-12461`) needs **three** loops before it arms for
  `maxHp/(paradoxHits||3)+1` (`:12455`). At stage 12 NG0, `hpScale = ngHp*(1+12*0.10) = 2.2`
  (`:9151`) against `hp:700`, so maxHp 1,540 and each orb deals **514.333**. Three orbs = 1,543.
  Three rounds, dead.

These lines are not in scope. The charter places the arena, gives it a floor and a stair that
outlive the fight, and makes it legible in the renderer the game actually ships with.

**The arena's two faces are solid barriers, and the charter says so.** This is the first draft's
worst omission. `blockingWalls` (`:13446-13448`) takes every `type==='wall'`, and
`BFPlatformer.sweepHorizontal` (`bladefall-platformer.js:115`) skips a solid only when
`bodyTop - 4 <= solidBottom || bodyBottom + 4 >= solidTop`. With `solidTop = 360` and the player at
`{w:26,h:44}` (`:2545`), each face blocks for every `p.y < 356` — **201 units above the 154.607
double-jump ceiling**. Approaching from the arena floor's west lip at 14,960 the player is stopped at
`15050 − 13 − 13 = 15,024`, a 64-unit pocket. **The only way into the boss pen is to cling-ladder a
26-wide, 360-tall pillar.** That is true of the shipped procedural fight today; it is not something
this charter introduces. It does work — after a wall jump sets `vx=-350`, the `airTurn` rate of the
precision motion profile pulls `vx` back through zero in ~0.072 s, so the body drifts ~10.6 units off
the face and is back against it well before the 0.357 s apex — but it is the hardest traversal in the
region, and rooms 3 and 5 now teach it on purpose, in places where failure costs seconds.

**Pre-v4 debt, to be deleted rather than migrated:**

- `cadence:{adds:3,foes:['shadeling','stormmote','rifthound'],accents:[]}` (`bladefall-campaign.js:235`).
  `applyCampaignCadence` (`:9253`) runs on custom levels too (called at `:7564`), so authoring the
  level does **not** by itself stop the three adds. Every converted region zeroes it explicitly
  (`campaign.js:118`, `:184`, `:197`, `:207`, `:216`).
- `acts` is three (`campaign.js:233`) where Emberdeep (`:205`) and the Foundry (`:214`) declare six.
  `bladefall-charters.js:68` builds `charter.rooms` from `acts` and `:71` gives each the owner
  `` `${blueprint.id}:${nn}` `` → `void-tyrant:01`…`:06`; `:166` raises `geometry.room.unknown` for
  any `authoringRoom` outside that set. **Six rooms need six acts first.**
- The boss chest at `x:200` (`:7916`), the boss key (`:10980`), `rollDrop` (`:10984`) and enemy
  material credit (`:10895`) — all live because `12 > V4_LAST_STAGE`. The chest is the key's only
  consumer (`grep 'p\.keys'` returns only `:7918` reset, `:15111` pickup, `:15131`/`:15135` spend,
  `:19573` HUD), and it leads to `dropBossItem` → `legendaryReward` with
  `BOSS_WEAPON.tyrant='stormrod'` (`:11020`), so the two go together with no softlock.
- **The completion portal.** `:10999-11000`: the exclusion list names whiteCourt / brute /
  archer@4 / warden@6 / colossus@10 and **not** tyrant@12, so `else G.portal = {x: G.levelLength-300, …}`.
  Killing the Tyrant opens a portal. Travel is a place.

**The entry seam already exists** — correcting the brief. `physicalSeamSpec` (`:8351`) carries
stage 11's forward branch at `:8401-8403`:
`{connector:'inversion-tyrant',zone:'inversion',targetStage:12,…,requires:'gravity-flip'}`.
The comment above it at `:8398` saying the seam "waits on that region's own run" is **stale**.
Stage 12 has no branch of any kind; `physicalSeamSpec` falls to `return null;` at `:8404`.

**Worth keeping, unchanged:** `LEVEL_MUSIC[12]` (`:381`, `tyrant-abnormal-circumstances`,
`interim:true`, mood string at `:383` — `tests/ember-music.test.mjs:43` pins the interim set to
exactly `[9,10,11,12]`). The boss echo reward `'boss:tyrant' → {echoId:'hollow-edge', capacityKnot:'paradox-knot'}`
(`bladefall-echoes.js:52`), which is the named reward that replaces the loot the v4 bump deletes.
The arena's internal numbers. The `apex` theme (`bladefall-respec-renderer.js:41`).

**Stage 11 is half-converted. Do not build on it.** Measured in a VM, not recalled: `INVERSION_LEVEL`
(`:5376`) is `{len:8400,portal:null,flip:true}` with **26 objects, 0 of them tagged with an
`authoringOwner`, 3 `Sign()` objects, a two-entry `loot`, 4 enemies none of which carry `noDrop`**,
and `customExtension: 2600` still live at `campaign.js:226`. The grant and the forward seam landed;
the level rewrite did not. Stage 12 depends on nothing from stage 11 except the capability
`gravity-flip`, which is already granted.

---

## The idea this region owns

Emberdeep said the ground is not finished. The Foundry answered it: here you make ground. The
Inversion removed the premise — two floors, and you may only owe one at a time.

Stage 12 is the first region since the Outskirts that **gives nothing**. `abilityRecords` ends at
`['gravity-flip','inversion','movement',12]` (`bladefall-progression.js:59`); the keys end at
`zenith-key` in `inversion`; `connector('tyrant-king','void-tyrant','abyss-king','throne-gate',[],{bossClear:'void-tyrant'})`
(`:90`) asks for no capability at all. The boss contract is entirely retrospective —
`required:['jump','weapon','portal-pair','gravity-flip']` (`bladefall-milestones.js:25`), which is
stages 0, 1, 4 and 11. **The verb is the oldest tool in the game.** So the region cannot be about
acquisition. It has to be about cost.

And the mechanism already states the cost exactly. `advanceTyrantParadox` fires the instant a band
breaks and immediately calls `clearPlacedPortals(false)` (`:12417`). The pair that just worked is
destroyed **by having worked**. Then the next band is higher and the barrage is faster.

> **Local rule: here, every answer is spent by being right.**

What it means for the approach: a solution in this region is consumed at the moment it succeeds.
Not a timer, not a trap — the *correct* action is what removes the thing that made it possible.
Three authored expressions, all built from vocabulary that already ships, and all three re-checked
against the runtime because the first draft got the first one wrong:

1. **Spent ledges** — `Pl(…,{crumble:1, respawnDelay:9999})`. A bare `crumble:1` ledge is **not**
   spent: the lifecycle at `:12693-12698` sets `o.gone=true; o.respawn=3.2` and reforms it 3.2 s
   later. The fuse itself is `crDur` 0.45 s (`:14103`, 0.30 s once `applyNgHazards` sets `ngFast`
   at `:9025`). What makes a ledge actually spent is the line the first draft missed: `:12694`,
   `if(o.respawnDelay)o.respawn=o.respawnDelay;` — an authored override with a shipped precedent in
   `RailCollapse` (`:5419-5421`, `respawnDelay:2.2`). At 9,999 s the return is 2 h 46 m away, past
   any visit; a stage reload rebuilds the level, so a spent ledge is spent **for the visit, not for
   the save**. Hence the hard rule below: a spent ledge is never the only route.
2. **Answered doors** — `Br` with `reform:9999` (`:3132`, the Foundry's `Cap` at `:6414`). Downward
   Strike opens a brittle cap permanently. A `Br` can only ever *remove* floor, so it can only ever
   open a way down; the region uses it exactly once, on the Paradox Vigil's roof, where the room
   below connects onward two ways.
3. **Latched plates** — `Plate(x,y,id,latch=true)` (`:3142`; press test `:12885` on
   `p.onGround && |p.y−o.y| < 10`, latch retention `:12900`, `markPersistentCircuitOpen` at `:12902`
   → `:11104`). A circuit that can only be opened, never closed, and a gated plat is solid only while
   its circuit is open (`gateOpen` `:11205`, consumed at `:11233`). This is the region's one
   mandatory gate and its clearest statement of the rule.

No new systems. The whole grammar already exists, and the fight already enforces the rule; the
approach's job is to make the player *recognise* it before the Tyrant charges them for it.

The fiction agrees. `bladefall-story.js:15` gives stage 12 the game's only memory whose `clarity`
is `'confirmation'` — `right-hand-seal`, relic *Seal of the Tyrant*, reality `enemy-officer-signet`;
`validateStory` (`:250`) hard-asserts at `:252` that the Void Tyrant owns it. It is not decoration:
`revelation()` at `:209` reads
`const tyrantConfirmed = read.has('right-hand-seal') && state.bossEchoes.includes('tyrant');`
and that flag is what promotes the whole story readout from `'pattern'` to `'confirmed'`. **Placing
this lore is the only way the game's diagnosis ever resolves.** The Colossus's reality is
`'fever-peak'` (`:30`) — a symptom. The Tyrant's is `'officer-who-led-the-night-attack'` (`:31`) —
a person. The King's is `'unseen-commander-who-gave-the-order'` (`:32`). **The Tyrant is the last
enemy the knight can name.** Recognition is itself a thing you spend: once you have named him you
cannot un-name him, and the next one has no face. The symptom row says it in one word —
`['void-tyrant','lucid-recognition',4]` (`story.js:48`), between the Inversion's seizure and the
King's unconsciousness.

`STAGE_LORE[12]` is already written and unplaced (`:3490`): *TYRANT'S TRIPTYCH — "Kneel the body.
Break the heart. Unmake the crown."* Three bands as liturgy, with "crown" pointing forward.

**Stage 12 is not a flip region.** `L.flip` is the only path to `addCeiling()` and
`G.flipUnlocked=true` (`:7445`), and the same line calls `populateVoid(L.len)` unconditionally,
which seeds `max(3, floor(len/500))` random crawler/voidbat/bloodeye (`:7309`) and gives each a 35%
chance of cursed gear — only the gear is `v4Region`-gated (`:7320`), not the spawns. Beyond that,
`grep -c gravityFlipped public/bladefall-respec-renderer.js` returns **0**: the v4 renderer has no
concept of an inverted world, so a flipped hero draws right-way-up. Both of those are stage 11's
charter items and **neither has landed**. This is also the house pattern, not an exception:
`warden-frostfell` requires `counter` and Frostfell is not a counter region;
`colossus-inversion` requires `downward-strike` and the Inversion authors no brittle stone. A
capability on a connector is a **ticket**, not a grammar. `inversion-tyrant` requires
`gravity-flip` (`bladefall-progression.js:89`) so that the road is earned; the Citadel does not
also have to be about it.

---

## The spatial outline

**17,000 units, six rooms, 84 objects — 4.941 per 1,000.** The references were re-measured by
evaluating each level out of `index.html` in a VM with the same `fn()`/ctor harness the shipped tests
use, not quoted from the first draft:

| region | len | objects | tagged | checks | signs | enemies / noDrop | npcs | loot | per 1,000 | beat coverage |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Emberdeep | 16,400 | 86 | 74 | 12 | 0 | 9 / 9 | 1 | 0 | **5.244** | 86.0% |
| The Foundry | 16,600 | 76 | 63 | 9 | 0 | 8 / 8 | 1 | 0 | **4.578** | 82.9% |
| White Court | 16,000 | 75 | 62 | 5 | 0 | 3 / 3 | 0 | 0 | **4.688** | 82.7% |
| The Inversion | 8,400 | 26 | **0** | 6 | **3** | 4 / **0** | 0 | **2** | 3.095 | — |
| **Void Tyrant** | **17,000** | **84** | **74** | **12** | **0** | **8 / 8** | **1** | **0** | **4.941** | **88.1%** |

Emberdeep's rooms are 12/15/13/14/11/9; the Foundry's 9/12/12/12/13/5. 84 over 17,000 sits between
the two converted boss-adjacent regions.

**17,000 is the zone budget** (`bladefall-progression.js:36`), and that is the entire argument. The
first draft claimed it was "the only length at which the eastern return arrival lands correctly."
That is false and is deleted: both arrival branches are length-relative.
`compatibilityZoneArrival` (`:8230`) computes the west case as
`x=Math.min(length-70,Math.max(70,plan.arrival.spawn.x))` (`:8235`) → **240 at any length ≥ 310**,
and the east case as `x=Math.max(70,length-Math.max(70,zone.localBounds.x2-plan.arrival.spawn.x))`
(`:8236`), where `zone.localBounds.x2 - spawn.x` is a constant 240 → **length − 240 at any length**.
No override is needed at 17,000 and none would be needed at any other length.

| Room | Range | Player experience |
| --- | --- | --- |
| 1 · The Fissure Mouth | 0–2,600 | Arrival east out of the Inversion, right-way-up and staying that way. Refuge, Oren, the rest anchor of the region's manner. Three ledges at the same height over open floor; the middle one is spent. Step on it, watch it go, land on the floor you never left. The rule is introduced where it costs nothing. |
| 2 · The Rising Ledgers | 2,600–5,800 | Height as a resource, and the region's one gate. A void 1,260 wide with no ground under it. A latched plate at the top of the west ledgers materialises three planks across it — permanently, because `markPersistentCircuitOpen` has no inverse. The spent ledges are a higher optional line over the planks, carrying the room's coin. |
| 3 · The Opposed Faces | 5,800–8,900 | **Two authored slate faces, 1,100 apart, spanning y 0…360** — the arena's exact geometry as an ordinary traversal problem. The west face has no step-over: you cling-ladder it, which is the arena's entry rehearsed with a checkpoint 600 units behind you and nothing shooting. Inside, mouths on both faces, cross the gap, and the ledge you launched from is spent — over a floor that is always there. The east face has a lintel: the way out is a walk. The triptych stele stands between them. No enemy inside the pen. |
| 4 · The Spent Line | 8,900–11,800 | The rule raised. The opposed pair returns as two **raised** faces, `SlateWall(x,490,360)`, spanning y 130…490 over a continuous floor: you walk *under* them (`bodyTop − 4 ≤ solidBottom` skips the solid at y=0) and must climb to use them. A timed spike run on the floor between them is the reason to. Two hounds and a mote contest the approach, never the crossing. |
| 5 · The Paradox Vigil | 11,800–14,400 | The rest site *Paradox Vigil* at 12,580 sits in a chapel closed by two 300-tall slate faces and roofed by a brittle cap. You stand on the roof and slam it. The vigil is open forever after; one step inside makes the exit a plain double jump. The overlook at 14,050 shows the arena floor, both faces and the three band heights as one readable line before commitment — the Foundry's Casting Pit overlook, carried forward. |
| 6 · The Three-Band Arena | 14,400–17,000 | Approach floor, checkpoint at 14,880, the fight. East of it the floor resumes; *The Hollow Crown* sits on an authored ledge at 16,540 and the Throne Gate at 16,880. No portal at either end. |

Per-room object budget: **15 / 16 / 16 / 15 / 12 / 10 = 84.** Checkpoints: **12**, two in every
span, matching the shape of the assertion at `tests/emberdeep-stage.test.mjs:114-118`. Enemies:
**8** plus the boss, all carrying `noDrop:true`, `patrol`, `noticeRange` and a `citadelRole`; none
east of 13,600, none in the pen of room 3, none in room 6.

Beat coverage: **74 of 84 (88.1%)**, against Emberdeep's measured 86.0% and the Foundry's 82.9%.
The ten untagged objects are the eight `Gr()` floors, the plain `Scenery` rest stool (copying the
Foundry's `:6437` exactly) and the `SealedRecollection` — the same classes the references leave bare.

**Reachability, stated as the shipped test states it.** `tests/emberdeep-stage.test.mjs:94-102`:

```js
const tiers = at(o => o.type === 'plat' && !o.deep && o.y > 0)…
if(t.y <= CEILING) continue;
const step = tiers.some(o => o !== t && o.y < t.y && t.y - o.y <= CEILING &&
  o.right > t.left - 240 && o.left < t.right + 240);
```

`CEILING = 480²/2800 + 450²/2800 = 154.607`, from `jumpVelocity 480` / `secondJumpVelocity 450`
(`bladefall-movement-progression.js:19-21`) against the literal `1400` gravity at `:13631`. Two
things the first draft did not state and that matter: the step must be a **strictly lower non-`deep`
plat** — ground never counts, so a same-height run over a void fails — and the ±240 is **edge to
edge**, not centre to centre. The constant is deliberately conservative: the v4 apex hang
(`apexGravityScale` 0.55 inside the apex band, `:13630-13631`, `movement-progression.js:25`) lifts
the true peak to ~156.7, and a dash adds `0.22 × 200 × 3 ≈ 132` units of horizontal reach. A later
run should not "correct" 154.607 upward. Flat double-jump airtime is 1.1343 s → 226.9 units at
`runSpeed 200`, which is what ±240 approximates.

**Walls need their own rule, and the first draft had none.** `type==='wall'` was exempt by object
type, so an unreachable band on a room-4 face would have passed every test proposed. Replace the
exemption with: every authored wall satisfies **at least one** of

- **(a)** `raisedFace` — its bottom `o.y − o.h ≥ 48`, so a player on the floor walks under it;
- **(b)** a step-over — an authored plat with `y ≥ o.y` whose span comes within 240 of `o.x`
  (a body at `bodyBottom + 4 ≥ solidTop` clears the wall, so a plat at the wall top is enough);
- **(c)** `ladderFace` **and** a `type==='check'` at y=0 within 900 of `o.x`.

Room 3's west face is (c) only, on purpose. Room 3's east face is (b) and (c). Room 4's pair is (a).
Room 5's chapel is (b) before the cap is broken and (c) after — which is exactly why it carries both
tags.

**Region-local helpers**, placed immediately above the level, mirroring `FoundryBeat`/`FoundryScenery`
(`:6407`, `:6409`) and `EmberScenery` (`:6551`). Note **`FinaleBeat` (`:3603`), not `ElementBeat`
(`:3600`)**: `applyElementalActRemaster` hard-returns outside 8–11 (`:10318`),
`applyFinaleActRemaster` covers 12–15 (`:10383-10384`) and reads/writes `finaleActBeat`, and
`ownerFor` maps it to `'finale-act-remaster'` (`:7645`).

```js
function TyrantBeat(o,beat,system){return FinaleBeat(Object.assign(o,{citadelAuthored:1,authoringOwner:'void-tyrant',
  authoringRoom:'void-tyrant:'+String(o.x<2600?1:o.x<5800?2:o.x<8900?3:o.x<11800?4:o.x<14400?5:6).padStart(2,'0')}),beat,system);}
function TyrantScenery(x,y,kind,extra){
  const o=Scenery(x,y,kind,Object.assign({citadelArchitecture:1},extra||{}));
  if(o.lore&&typeof o.lore==='object'){const e=o.lore;Object.assign(o,{lore:1,loreId:e.id,title:e.title,text:e.text,accent:e.accent,read:false});}
  return TyrantBeat(o,'place','apex-road');
}
function Face(x,y,h,o){return TyrantBeat(Object.assign(SlateWall(x,y,h),o||{}),'test','two-mouth-placement');}
function Spent(x,w,y,o){return TyrantBeat(Pl(x,w,y,Object.assign({crumble:1,respawnDelay:9999},o||{})),'twist','spent-by-being-right');}
function Seal(x,w,y,o){return TyrantBeat(Br(x,w||110,y||0,Object.assign({reform:9999,citadelSeal:1},o||{})),'twist','spent-by-being-right');}
```

`Face` takes `SlateWall`'s own `(x,y,h)` so a raised face is `Face(9600,490,360,{raisedFace:1})`.
`TyrantBeat`, `TyrantScenery`, `Face`, `Spent` and `Seal` are all free — no `function <name>(` for
any of the five exists anywhere in `index.html` (the only `Face` hits are prose inside strings at
`:1070`, `:5361`, `:8739`). **Do not reuse `Cap`**; it is taken by the Foundry at `:6414`. The `lore`
unwrap in `TyrantScenery` is what makes `applyPeopleAndPlace` skip the auto-placer (`:9547-9550`
checks `!G.obstacles.some(o=>o.lore&&o.loreId===lore.id)`).

**Where the level goes in the file.** Insert the helpers and `VOID_TYRANT_LEVEL` between
`SECRET_LEVEL`'s close (`:5493`) and the `/* Sparse stage->level map` comment (`:5495`). Four
existing test boundaries slice `index.html` and none of them crosses that point:

- `tests/warden-stage.test.mjs:7` bounds `WARDEN_LEVEL` by the literal
  `'/* ====…\n   THE INVERSION (stage 12)'` at `:5371-5372` — that is the **stage-11** banner under
  the house 1-based label. Keep it byte-identical. A stage-12 banner reading
  `THE VOID TYRANT (stage 13)` does not collide, and the label is consistent:
  `:6541` `'---- STAGE 10 · EMBERDEEP'` bounds stage index 9 and `:6399` `'STAGE 11 · THE FOUNDRY'`
  bounds stage index 10.
- `tests/emberdeep-stage.test.mjs:25` bounds `EMBERDEEP_LEVEL` by `'\nconst CUSTOM_LEVELS='`.
  **Nothing may go between `EMBERDEEP_LEVEL` (`:6568`) and `CUSTOM_LEVELS` (`:6688`).**
- `tests/ember-colossus-stage.test.mjs:24` bounds `FOUNDRY_LEVEL` (`:6428`) by
  `'\n/* ---- STAGE 10 · EMBERDEEP'`.
- `tests/white-court-v4-stage.test.mjs:17` bounds `WHITE_COURT_LEVEL` (`:5500`) by
  `'\nfunction interactWhiteCourt'` (`:5575`).
- A future inversion test will bound on `'\n/* THE DEEP LINE'` (`:5414`), per
  `docs/charters/12-inversion/DESIGN-PLAN.md`. Stay east of it.

The new test bounds `const VOID_TYRANT_LEVEL=` → `'\nfunction CourtBeat('` (`:5498`) — a real
symbol, not a comment.

---

## The level

```js
const VOID_TYRANT_LEVEL={len:17000,portal:null,spawnX:330,spawnY:0,bossX:15900,authoredEcology:true,
 physicalExit:'tyrant-king',bossSkipCircuit:'paradox-broken',bossSkipZone:'void-tyrant',
 objects:[ … 84 … ], loot:[],
 npcs:[{x:960,y:0,kind:'escort',profileId:'sera',essential:1,noPortalTransit:1}],
 enemies:[ … 8 … ]};
```

`authoredEcology` sets `G.suppressVariantEnemies` at `:7544`, which is what stops
`seedVariantEnemies()` (`:7545`, `:9199`) putting bodies into measured spaces. `spawnX:330` matches
both ember regions against the same arrival x of 240.

### Room 1 · The Fissure Mouth (0–2,600) — 15

```
Gr(0,2600)
TyrantScenery(120,0,'void-fissure',{w:180,h:300,physicalSeam:'inversion-tyrant'})   // spans 30–210
TyrantBeat(Check(330,0),'recovery','apex-road')
TyrantScenery(700,0,'keep-gatehouse',{w:820,h:440,roomLandmark:1})
TyrantScenery(1060,0,'east-collapse',{w:170,h:90})
TyrantBeat(Pl(1240,170,130),'teach','spent-by-being-right')     // 1155–1325
Spent(1480,150,130)                                            // 1405–1555 — the free lesson
TyrantBeat(Pl(1720,170,130),'teach','spent-by-being-right')     // 1635–1805
TyrantBeat(CoinOb(1480,186),'reward','apex-road')               // the coin is on the ledge that goes
TyrantScenery(1560,0,'boundary-lantern',{w:30,h:50})
TyrantBeat(Check(1900,0),'recovery','apex-road')
TyrantScenery(2060,0,'split-belfry',{w:90,h:380})
TyrantBeat(Pl(2300,180,130),'teach','two-mouth-placement')      // 2210–2390
TyrantBeat(Pl(2520,200,255),'teach','two-mouth-placement')      // 2420–2620
TyrantScenery(2400,0,'keep-clock',{w:40,h:60})
```

Oren stands at 960 on `Gr(0,2600)`. All three y=130 ledges sit over the floor: the spent one costs
nothing at all, which is the point.

### Room 2 · The Rising Ledgers (2,600–5,800) — 16

Two ground shelves with a **1,260-unit void** between them.

```
Gr(2600,3620)                                                   // west shelf
Gr(4880,5800)                                                   // east shelf
TyrantBeat(Check(2740,0),'recovery','apex-road')
TyrantBeat(Pl(2960,180,130),'teach','height-phases')            // 2870–3050
TyrantBeat(Pl(3200,180,255),'teach','height-phases')            // 3110–3290
TyrantBeat(Pl(3440,190,380),'test','height-phases')             // 3345–3535
TyrantBeat(Plate(3440,380,'ledger-gate',true),'twist','spent-by-being-right')
TyrantBeat(Pl(3760,260,255,{gate:'ledger-gate'}),'twist','spent-by-being-right')   // 3630–3890
TyrantBeat(Pl(4060,260,130,{gate:'ledger-gate'}),'twist','spent-by-being-right')   // 3930–4190
TyrantBeat(Pl(4360,260,255,{gate:'ledger-gate'}),'twist','spent-by-being-right')   // 4230–4490
TyrantBeat(Pl(4660,240,130),'test','height-phases')             // 4540–4780
Spent(4100,170,380)                                             // 4015–4185, over the planks
TyrantBeat(CoinOb(4100,431),'reward','apex-road')
Spent(4400,170,380)                                             // 4315–4485
TyrantBeat(Check(5040,0),'recovery','apex-road')
TyrantScenery(5400,0,'answered-door',{w:150,h:230,roomLandmark:1})
```

The plate is on the 380 ledge, so the ascent is its price. Until it is pressed the void has no
crossing; once pressed it can never be un-pressed. The two spent ledges are a parallel line 125
above the planks, and each drops onto a plank, not into the void.

### Room 3 · The Opposed Faces (5,800–8,900) — 16

```
Gr(5800,8900)
TyrantBeat(Check(6300,0),'recovery','apex-road')                // 600 west of the ladder face
TyrantScenery(6060,0,'keep-gatehouse',{w:420,h:440,roomLandmark:1})
TyrantBeat(Pl(6540,180,130),'teach','two-mouth-placement')      // the run-up
Face(6900,360,360,{ladderFace:1})                               // no step-over: you climb it
Spent(7060,170,255)                                             // 6975–7145, against the west face
TyrantBeat(CoinOb(7060,306),'reward','apex-road')
TyrantBeat(Pl(7240,180,130),'test','two-mouth-placement')
TyrantScenery(7450,0,'triptych-stele',{w:90,h:150,lore:{id:'three-wounds',title:'TYRANT’S TRIPTYCH',
  text:'Kneel the body. Break the heart. Unmake the crown.',accent:'#c89cff'}})
TyrantBeat(Pl(7600,180,130),'test','two-mouth-placement')
Spent(7840,170,255)                                             // 7755–7925, against the east face
Face(8000,360,360,{ladderFace:1})
TyrantBeat(Pl(8000,200,380),'test','two-mouth-placement')       // 7900–8100 — the east lintel
TyrantBeat(Pl(8180,180,255),'test','two-mouth-placement')
TyrantBeat(Pl(8360,180,130),'test','two-mouth-placement')
TyrantBeat(Check(8560,0),'recovery','apex-road')
```

Faces at 6,900 and 8,000: **separation 1,100**, the arena's number. The pen is 6,913 … 7,987 with
the floor at y=0 under all of it, so nothing here can strand or kill. The stele stands at the centre
of the pen; `STAGE_LORE[12].at` is `.47`, and `0.47 × 17,000 = 7,990` falls in this same room, so
authoring it here agrees with its declared room even though 7,450 is the better place for it.

### Room 4 · The Spent Line (8,900–11,800) — 15

```
Gr(8900,11800)
TyrantBeat(Check(9060,0),'recovery','apex-road')
TyrantScenery(9180,0,'weight-hall',{w:640,h:420,roomLandmark:1})
TyrantBeat(Pl(9240,180,130),'teach','two-mouth-placement')      // 9150–9330
Spent(9440,160,255)                                             // 9360–9520, clear of the face
Face(9600,490,360,{raisedFace:1})                               // world y 130…490
TyrantBeat(Pl(10120,200,130),'test','two-mouth-placement')      // 10020–10220
TyrantBeat(Sp(10160,0,{w:240,period:2.6,phase:0}),'test','spent-by-being-right')
TyrantBeat(Sp(10420,0,{w:240,period:2.6,phase:1.3}),'test','spent-by-being-right')
Face(10700,490,360,{raisedFace:1})                              // separation 1,100
Spent(10860,160,255)                                            // 10780–10940
TyrantBeat(CoinOb(10860,306),'reward','apex-road')
TyrantBeat(Pl(11060,180,130),'test','two-mouth-placement')      // 10970–11150
TyrantBeat(Check(11180,0),'recovery','apex-road')
TyrantScenery(11400,0,'split-belfry',{w:90,h:380})
```

The raised pair is the HEAD band rehearsed. `placePortal` sets `py = max(20, p.y + p.h*0.4)`
(`:3207`) and `p.h` is 44, so a mouth from the 255 ledge lands at ~272.6 — just under the arena's
HEAD band at 302, which needs the player at ~284.4. To match it here you must leave the ledge and
climb the face. The climb is the price of the placement, and the ledge you left is gone.

### Room 5 · The Paradox Vigil (11,800–14,400) — 12

```
Gr(11800,14400)
TyrantBeat(Check(11960,0),'recovery','apex-road')
TyrantBeat(Pl(12260,180,150),'teach','height-phases')           // 12170–12350
Face(12420,300,300,{ladderFace:1,chapelFace:1})
Seal(12580,360,300)                                             // 12400–12760 — the chapel roof
Scenery(12580,0,'rest-stool',{restSiteAnchor:'paradox-vigil'})
TyrantBeat(Pl(12660,100,150),'recovery','apex-road')            // 12610–12710, the step out
Face(12740,300,300,{ladderFace:1,chapelFace:1})
TyrantBeat(Pl(12900,180,150),'test','height-phases')            // 12810–12990
TyrantBeat(Check(13180,0),'recovery','apex-road')
TyrantScenery(13400,0,'weight-hall',{w:560,h:420,roomLandmark:1})
TyrantScenery(14050,0,'citadel-terrace',{w:420,h:300,roomLandmark:1})
```

The road crosses the chapel on its roof: 150 → 300 → 150. Slam the roof and you fall into a
294-wide slate box with the rest site in it, and the roof never comes back. The step at y=150
inside makes the exit a plain double jump (150 + 154.607 = 304.6 clears the 300 faces), so the
chapel can be entered and left by anyone who reaches it — but the faces are slate and 300 tall, so
it is also the friendliest place in the game to practise the ladder the arena will ask for. The
rest-stool is plain `Scenery`, copying the Foundry's `:6437`; `installZoneRestSite` (`:7721`) finds
it by `restSiteAnchor` at `:7723` and never reaches `compatibilityRecoveryPosition` (`:7708`, called
at `:7724`). `round(17,000 × 0.74) = 12,580` matches `bladefall-recovery.js:49` exactly.

### Room 6 · The Three-Band Arena (14,400–17,000) — 10

```
Gr(14400,14960)                                                 // centre 14,680 — survives the sweep
TyrantScenery(14600,0,'keep-gatehouse',{w:400,h:440,roomLandmark:1})
TyrantBeat(CoinOb(14700,0),'reward','apex-road')
TyrantBeat(Check(14880,0),'recovery','three-band-paradox')      // 80 west of the lip
Gr(16240,17000)                                                 // centre 16,620 — survives
TyrantBeat(Check(16420,0),'recovery','apex-road')
TyrantBeat(Pl(16460,190,130),'teach','apex-road')               // 16365–16555
SealedRecollection(16540,130,'void-tyrant','The Hollow Crown')
TyrantScenery(16660,0,'east-collapse',{w:180,h:100})
TyrantScenery(16880,0,'throne-gate',{w:220,h:340,roomLandmark:1,physicalSeam:'tyrant-king'})
```

`Gr(14400,14960)` is the approach floor the first draft never authored; it abuts the arena floor's
west lip exactly. `Gr(16240,17000)` abuts its east edge. The Crown sits east of the arena, so it is
what you take on the way out rather than a prize you clear a boss for; `Pl(16460,190,130)` spans it
within ±8 at the same y and `Check(16420,0)` sits under that span. `SealedRecollection` carries
`authoringCritical:1` (`:3421`), which `bladefall-charters.js:171` counts.

What the Hollow Crown was: the signet of a man who commanded on someone else's authority. Nothing
says so. The evidence is that every room in this Citadel is built to be walked through once, and
that the throne at the far end of it is empty.

### Enemies — 8, all `noDrop`

Row shape copied verbatim from `FOUNDRY_LEVEL`'s enemies array: the key is **`t:`**, not `type:`.

```js
{t:'rifthound', x:3300,             noDrop:true, patrol:[3150,3560],   noticeRange:460, citadelRole:'courser'},
{t:'stormmote', x:4200, y:300,      noDrop:true, patrol:[3980,4520],   noticeRange:420, citadelRole:'sentry'},
{t:'shadeling', x:5500,             noDrop:true, patrol:[5300,5760],   noticeRange:400, citadelRole:'picket'},
{t:'rifthound', x:6560,             noDrop:true, patrol:[6380,6800],   noticeRange:460, citadelRole:'courser'},
{t:'stormmote', x:8320, y:280,      noDrop:true, patrol:[8140,8560],   noticeRange:420, citadelRole:'sentry'},
{t:'shadeling', x:9300,             noDrop:true, patrol:[9120,9480],   noticeRange:400, citadelRole:'picket'},
{t:'rifthound', x:10560,            noDrop:true, patrol:[10380,10660], noticeRange:460, citadelRole:'courser'},
{t:'shadeling', x:13600,            noDrop:true, patrol:[13440,13820], noticeRange:400, citadelRole:'picket'}
```

None inside room 3's pen (6,913–7,987), none in room 6, nothing east of 13,600 — well clear of the
arena sweep. `shadeling` (`:629`) and `rifthound` (`:631`) declare no `shot` at all; `stormmote`'s
is `el:'storm'` (`:635`). No authored body in this region carries `el:'void'` on a projectile, for
the reason under the Muster below.

---

## The arena

**`bossX: 15900`**, the only arena coordinate this charter chooses. Everything else falls out of
`bossArena` unchanged:

| | value |
| --- | --- |
| Floor | `Pl(15600, 1280, 0)` → spans 14,960 … 16,240 |
| West face | `SlateWall(15050, 360, 360)` → x 15,050 (solid 15,037–15,063), world y 0…360, `tyrantWall:1` |
| East face | `SlateWall(16150, 360, 360)` → separation **1,100 > 700** ✓ |
| Sign | `Sign(15290, 0, 'LOW · MID · HIGH — REBUILD THE LINE')` |
| Clear sweep | `[bx−940, bx+330]` = **14,960 … 16,230** (`:15374`) |
| Pacing cage | `[bx−90, bx+70]` = 15,810 … 15,970 (`:15372`, clamped each frame at `:14554`) |
| Bands | world y 48 / 178 / 302 on both faces |

**The sweep is the hard authoring constraint.** `:15375-15376`:

```js
G.obstacles=G.obstacles.filter(o=>o.x<arenaL||o.x>arenaR||
  o.type==='pit'||o.type==='check'||o.type==='coin'||o.type==='chest'||o.type==='vault');
```

It tests the object's **centre** x — `Pl` stores `x` verbatim (`:3100`) and `Gr(x1,x2)` is
`Pl((x1+x2)/2, …)` (`:3101`). Any plat, wall, scenery, spike or story relic whose centre falls in
14,960 … 16,230 is deleted after the level is built; only pit / check / coin / chest / vault
survive. Every room-6 object above is at centre x < 14,960 or > 16,230, or is exempt. No authored
`Check` goes inside the sweep — a checkpoint in the arena would respawn the player mid-fight, and
`check` is on the keep-list. The retry site is `Check(14880,0)`, 80 units west of the lip. Enemies
inside the sweep are filtered at `:15378` with `killGoal` decremented at `:15379` — so the eight
authored bodies stop at 13,600.

**What the approach shows.** The Foundry's rule for a boss region is that the circuit is readable
before commitment. Here that means four things, in order:

1. **Room 3 teaches the entry.** A 360-tall slate face with no step-over and a checkpoint 600 units
   behind it. You cling-ladder it, exactly as the arena will demand, with nothing shooting.
2. **Room 3 teaches the shape.** Two faces **1,100 apart**, spanning y 0…360, over a continuous
   floor — the arena's exact geometry as an ordinary traversal problem. Mouths on both, cross the
   gap, and the ledge you launched from is `Spent()`. The player learns *opposed, far apart, heights
   matched* as a way of moving, with no boss attached.
3. **Room 4 raises it.** The same pair with its usable band above the floor, so the climb is the
   price of the placement.
4. **Room 5 shows the answer.** `TyrantScenery(14050,0,'citadel-terrace',{w:420,h:300,roomLandmark:1})`
   is an overlook with three horizontal courses at the band heights, looking down the arena floor at
   both faces. Not a diagram — a building that happens to be measured.

**Three fixes, all outright breakage, none a mechanics change:**

**A. The arena must outlive its own victory, and be crossable.** With `bossSkipCircuit`/`bossSkipZone`
on the level, a returning player skips the boss spawn at `:7557-7559` — and `bossArena` never runs,
so the floor, the faces and the sign are never pushed. That leaves a **1,280-unit hole** between
14,960 and 16,240 in a cleared region, and the Citadel's only road runs through it. The Foundry
already solved the first half of this at `:7563`:

```js
if(G.stageIndex===10&&bossDone&&!G.obstacles.some(o=>o.castingBed)){installFoundryBed(null);registerCircuits();}
```

Add `installParadoxFloor(full)` beside `installFoundryBed` (`:5687`), modelled on it — that function
already pushes moulds, spouts **and step ledges** (`bedApron`, `sluiceStep`, `sluiceShelf`), so
pushing a stair is precedented, not invented. It takes one argument and pushes, all tagged
`paradoxFloor:1`:

| when `full` | always |
| --- | --- |
| `Pl(15600,1280,0)` — the floor | `Pl(14760,180,130)` — 14,670–14,850 |
| `SlateWall(15050,360,360)` + `tyrantWall:1` | `Pl(14930,160,255)` — 14,850–15,010, clear of the face |
| `SlateWall(16150,360,360)` + `tyrantWall:1` | `Pl(15050,200,380)` — 14,950–15,150, **over** the west face |
| | `Pl(16150,200,380)` — 16,050–16,250, over the east face |
| | `Pl(16290,170,255)` — 16,205–16,375 |

No sign. The east stair's bottom step is room 6's own authored `Pl(16460,190,130)`, so only two
plats are needed on that side. Every tier has a lower partner within 154.607 and 240. Call it twice:

- from `latchVoidTyrant()` on the kill, as `installParadoxFloor(false)` — the boss death runs
  `clearPlacedPortals(false)` at `:10992`, which would otherwise leave the player inside the pen with
  no mouths and a 360-tall wall between them and the Throne Gate. The citadel opens the moment it is
  answered.
- from `loadStage` on a revisit, as
  `if(G.stageIndex===12&&bossDone&&!G.obstacles.some(o=>o.paradoxFloor)){installParadoxFloor(true);registerCircuits();}`,
  beside the Foundry's line at `:7563`.

**`bossArena` is not touched** — this is strictly additive, on the far side of the boss branch. The
faces stay slate and stay 1,100 apart, so the monument is still two opposed portal faces you can use;
it is now also a road you can walk.

**B. The Tyrant's death must record the zone clear.** The forward connector is gated
`{bossClear:'void-tyrant'}` (`bladefall-progression.js:90`), enforced in `eligibility` at
`bladefall-zones.js:222` against `state.clearedZones`, which `zoneTraversalState` (`:7862`) fills
from `meta.world.cleared`. But that state is captured at `:8788`, `warm()` runs at `:8796`, and
`commitPhysicalDeparture` — the only thing that calls `recordWorldClear()` (`:1119`) on a walk-out
seam (`:8345`) — does not run until `:8799`. **Nothing records the clear on tyrant death today**, so
the seam would fail `boss-clear-required` and toast *"The road shudders but holds."* forever. This is
the first `bossClear`-gated physical seam in the game; the precedent to copy is the Brute's inline
clear at `:10926-10937`. `BFWorldModule.stageId(12)` is `'void-tyrant'`
(`bladefall-world.js:25`), so `recordWorldClear` writes exactly the id the gate reads.

**C. The paradox readout must not go silent.** See Rule 3 and the Renderer.

**What the fight is, recorded and left alone.** `#bosshpwrap,#bosshpwrap.on{display:none!important;}`
(`:39`) — there is no boss health bar in this game at all. The paradox fight's entire progress
readout is (a) the band guides on the two walls and (b) the alignment line printed when the second
mouth lands. Both are currently invisible or about to become invisible in v4.

Two behaviours documented but not changed. The `'void-barrage'` system the blueprint advertises
(`campaign.js:231`) is **dead**: the teleport-flank branch at `:14656` is guarded by
`!e.paradoxFight` and `bossArena` sets `e.paradoxFight=true` unconditionally at `:15368`, on both
the procedural and custom paths. The generic `ENRAGE` at `hpR<0.5` (`:14722`) *does* fire, after the
second orb. `systems` is left alone — deleting a declared archetype behaviour is a fight change.

One more thing already in the file and worth knowing: `applyFinaleActRemaster` carries a stage-12
block at `:10399-10405` that tags every `tyrantWall` and the REBUILD THE LINE sign. It uses `||`, so
`bossArena`'s own `FinaleBeat` wrapping wins and nothing is overwritten.

---

## Seams

`portal:null`, `physicalExit:'tyrant-king'`, and no completion portal at either end. **Three new
branches**, inserted between the stage-11 forward branch (`:8401-8403`) and `physicalSeamSpec`'s
`return null;` (`:8404` — anchor by the closing `return null;` of the function, not the number):

```js
// The Paradox Citadel. Back down the void fissure to the Inversion; out through the
// Throne Gate once the Tyrant falls. You do not walk past the man you came to name.
if(G.stageIndex===12&&G.p.x<G.levelLength/2)return{connector:'inversion-tyrant',zone:'void-tyrant',targetStage:11,
  warm:G.p.x<=1400,cross:G.p.x<=62&&G.p.face<0,forward:false,commitClear:false};
if(G.stageIndex===12&&G.boss&&!G.boss.dead&&G.boss.type==='tyrant')return null;
if(G.stageIndex===12)return{connector:'tyrant-king',zone:'void-tyrant',targetStage:13,
  warm:G.p.x>=G.levelLength-1400,cross:G.p.x>=G.levelLength-62&&G.p.face>0,
  forward:true,commitClear:true};
```

Order matters and is copied verbatim from stage 10 (`:8387-8394`: westward return `:8387-8388`,
boss guard `:8391`, forward branch `:8392-8394`) — so the way home stays open while the Tyrant lives
and only the way onward is closed. The guard is not optional and it is the only defence: the pacing
cage clamps the *boss* to 15,810–15,970 (`:14554`), not the player, and `Gr(16240,17000)` runs
straight to the cross line at `levelLength−62 = 16,938`. `G.boss` is armed from level load —
`spawnEnemy` assigns `G.boss=e` at `:9174` and `loadStage` nulls it at `:7907` — so the guard is true
from the first frame.

The forward branch carries **no `requires`** — `connector('tyrant-king','void-tyrant','abyss-king','throne-gate',[],{bossClear:'void-tyrant'})`
(`bladefall-progression.js:90`) declares no capability, and the boss-clear half is enforced inside
`BFZonesModule.eligibility` (`bladefall-zones.js:222`).

**Stage 11's forward seam already exists** at `:8401-8403`. Delete nothing; **do** correct the now
false comment at `:8398` ("Its forward seam to the Void Tyrant waits on that region's own run") in
the same edit, since this run is that run.

**No `compatibilityZoneArrival` override is needed.** Recomputed:

- `inversion-tyrant → void-tyrant` is `side:'west'` (`bladefall-zones.js:122`).
  `safeArrival = rect(x1+ARRIVAL_NEAR, …, x1+ARRIVAL_FAR, …)` with `ARRIVAL_NEAR=180`,
  `ARRIVAL_FAR=300` (`:13-14`, `:66`) and `bounds.x1 = 0` (`boundsFor` `:54-56`), so `center` gives
  **spawn.x = 240**. The west branch at `index.html:8235` yields **x = 240** for any length ≥ 310.
- `tyrant-king → void-tyrant` is `side:'east'` (`zones.js:123`), so
  `safeArrival = rect(x2−300, …, x2−180, …)` with `x2 = 17,000` → **spawn.x = 16,760**. The east
  branch at `:8236` yields `length − 240` for **any** length; at 17,000 that is **16,760**.

Boss stages take no coda: `const ext=(!L.cart&&!L.bonus&&!s.boss)?(CUSTOM_EXT[G.stageIndex]||0):0;`
(`:7345`), so `G.levelLength` is exactly `L.len`.

**A prop at each seam, beside the arrival rather than around it:**

```js
TyrantScenery(120,0,'void-fissure',{w:180,h:300,physicalSeam:'inversion-tyrant'}),      // spans 30–210, arrival 240
TyrantScenery(16880,0,'throne-gate',{w:220,h:340,roomLandmark:1,physicalSeam:'tyrant-king'}),  // spans 16,770–16,990, arrival 16,760
```

Both names come from the world graph, not from invention: `void-fissure` and `throne-gate` are the
seam names at `bladefall-progression.js:89-90`. The first draft put them at 200 and 16,780, which
enclosed both arrival points — the player would have materialised *inside* the door. That is also
what the Foundry (`:6435`, prop 110–290 against arrival 240) and Emberdeep (`:6670`, prop
16,080–16,280 against arrival 16,160) do today, so it is a house habit and not a defect; the Citadel
simply steps out of the doorway, which costs nothing.

Two honest caveats. **`physicalSeam` is inert** — five writers in `public/` (`:3615`, `:3758`,
`:3929`, `:6435`, `:6670`), zero readers; it is documentation. **`physicalExit` is inert too** — no
runtime read of `.physicalExit` exists anywhere; the only non-literal occurrences are the three
production-manifest rows at `:9638`, `:9653`, `:9672`, and **four** tests assert it by name or regex
(`tests/emberdeep-stage.test.mjs:44`, `outskirts-stage.test.mjs:63`, `black-woods-stage.test.mjs:72`,
`brute-stage.test.mjs:55`). `FOUNDRY_LEVEL` does not carry one; `EMBERDEEP_LEVEL` does (`:6569`).
Both are kept for the reading and pinned by the new test. **What actually draws is the `kind`**, and
neither kind exists in `STRUCT` — see the Renderer.

One shared debt, named and left alone: `compatibilityZoneArrival` returns
`compatibility: zone.authoring.geometryStatus!=='authored'` (`:8258`), and `geometryStatus` is
hardcoded to `'authored'` only for `outskirts`/`black-woods`/`brute` (`bladefall-zones.js:192`).
Every converted region since is still flagged compatibility-true. That allowlist is not this
region's to extend.

---

## People, story and the recall

**Oren, carried forward.** `npcs:[{x:960,y:0,kind:'escort',profileId:'sera',essential:1,noPortalTransit:1}]`,
copying the Foundry's row. `STAGE_TRAVELER_PROFILE` (`:3474-3476`) is `{0,1,3,5,7,9,10}` — add
`12:'sera'` (and `11:'sera'` if stage 11's own run has not, or any authored npc falls back to
`'wanderer'` at `:9529`). Both converted reference tests assert `LEVEL.npcs[0].profileId === 'sera'`
(`tests/emberdeep-stage.test.mjs:111`, `tests/ember-colossus-stage.test.mjs:110`). No escort
mechanic: his thread closed at the Foundry. He is here because the road is, his lines stay under
fifteen words, and he never explains the bands.

Travelers and any record whose type is in `SUPPORT_TYPES = {'shop','traveler','escort'}`
(`bladefall-charters.js:14`) are support-checked at `:176` through `supported()` (`:138-144`):
`x >= span.left − 8 && x <= span.right + 8 && |platform.y − y| <= 28`. 960 sits inside
`Gr(0,2600)` at y=0.

**Two authored silences, kept.** `residents` (`story.js:65`) has no void-tyrant row and
`searcherTrail` (`:54`) jumps from `inversion` to `deep-line` — the searcher does not reach him
here. `bladefall-shops.js:70` makes stage 11's shop *The Last Inventory*; stage 12 gets no shop, by
name. Do not invent either.

**The Sealed Recollection is *The Hollow Crown***, declared at `bladefall-recollections.js:13` and
never placed — the eleven `SealedRecollection(…)` call sites (`:3712` … `:6669`) cover stages 0–10
only. It goes in room 6, east of the arena, on `Pl(16460,190,130)` with `Check(16420,0)` beneath.

**The recall.** `MUSTER_ROSTERS` (`:4517`) has keys warden, emberdeep, ember-colossus,
frost-sorcerer, outskirts, black-woods, brute — **no `void-tyrant`**, so `installMusterRoster`
(`:4679-4681`) returns immediately and a recalled muster is invisible in the region. Add twelve rows
on the Emberdeep / Foundry pattern (`[unitId, x, y]` or `[unitId, x, y, patrolLo, patrolHi]`, both
opening `['standard',520,0]`; the installer supplies `noDrop`, `noticeRange:460` and `G.killGoal++`
itself at `:4690-4699`):

```js
'void-tyrant':[
  ['standard',520,0],       ['crownguard',1400,0,1260,1560],
  ['linesman',2180,0,2060,2320], ['crownguard',3020,0,2880,3180],
  ['standard',5200,0],      ['shieldbearer',5620,0,5480,5760],
  ['crownguard',6600,0,6460,6740], ['linesman',8820,0,8700,8890],
  ['gaoler',9860,0,9720,10000],    ['crownguard',11400,0,11260,11540],
  ['shieldbearer',12960,0,12820,13100], ['standard',13320,0],
],
```

Twelve rows, nine bodies, three standards — the exact shape of both ember rosters. **The first
draft's roster failed its own hygiene rule**: a crownguard at 780 sits 180 from Oren at 960 and its
patrol 660–1020 walked straight through him, which `tests/muster-recall.test.mjs:62` fails at
`< 350`. The first post is now at 1,400, 440 clear of him. Every rule the test enforces on the four
regions it covers was re-checked against these rows and the twelve authored checkpoints:
x ∈ [220, 16,780] (`:55`); `EARCH[type]` exists (`:57`); `BladefallEcology.SPECIES[type]` exists
(`:58`); `lo < x < hi` (`:59`); no checkpoint within 200 at |Δy| < 60 (`:60`) — the tightest is 220,
which is why room 3's east check moved to 8,560 and room 4's west check to 9,060; no resident within
350 (`:61`); no npc within 350 (`:62`); and a non-`fly` post stands on a `plat` at `|Δy| ≤ 2`
(`:65-68`) — every post above is on a `Gr()` at y=0. Nothing east of 13,320, so nothing inside the
arena sweep.

The region's unique is the **crownguard** — the Tyrant's own officers, declared in `EARCH` (`:604`)
beside `cinderling` (`:623`), using only fields that already exist:

```js
crownguard:{muster:1,hp:72,dmg:16,speed:40,w:48,h:72,xp:42,color:'#6a5aa0',kind:'walk',element:'void',
  ranged:true,shootCd:3.2,shot:{count:3,spread:0.34,speed:300,size:7,color:'#d2c4ff',shape:'bolt',glow:1}},
```

It is the triptych made into a body: a **three-bolt vertical fan** that answers low, mid and high at
once — which is precisely what the player cannot do. It is slow, it does not chase, it holds one
post. Colours are lifted from the apex theme's `cap` (`bladefall-respec-renderer.js:41`,
`['#9a86d8','#d2c4ff','#6a5aa0']`); the shot borrows `linesman`'s shape (`:618`) with `count` 1→3
and `spread` 0→0.34.

**Its bolt carries no `el`, and that is load-bearing, not taste.** `index.html:14972`, inside the
enemy-projectile portal-transit block at `:14967`:

```js
if(pr.el==='void'&&G.boss&&G.boss.paradoxFight)chargeParadoxOrb(pr);
```

Any enemy projectile with `el:'void'` that transits a player pair feeds the Tyrant's own puzzle.
`bossShoot` (`:15879`) builds the projectile with `el:cfg.el||null` — it reads the shot config only,
never `e.element`, and every ranged non-boss routes through the same function — so declaring
`element:'void'` on the archetype while omitting `el` from the shot is exactly right. **No authored
body in stage 12 may carry `el:'void'` on its shot**, which the eight authored bodies already satisfy.

It also needs one ecology row — required by `tests/muster-recall.test.mjs:58`, **not** by anything
inside `installMusterRoster`, which has no such check (`spawnEnemy` tolerates a null ecology at
`:9145`). `bladefall-ecology.js` `validate` (`:83-94`) checks role, locomotion, non-empty habitats,
a material in `MATERIALS` (`:41`, `['iron','weave','prism','essence']`) and `pressure > 0`;
`row(role, locomotion, habitats, pressure, material, element)` is at `:43`:

```js
crownguard: row('artillery', 'ground', ['void', 'apex', 'ruin'], 2.0, 'essence', 'void'),
```

Adding an `EARCH` key alone would be safe — `validate` iterates `SPECIES`/`BOSSES` *into* the
archetype id set at `:91`, never the reverse — but the test wants both, so write both.

---

## The renderer

Most of it has already landed. Verified now, not remembered:

- `SUPPORTED_STAGES = new Set([0…12])` — `bladefall-respec-renderer.js:15`. **Stage 12 already draws
  in v4 today**, gated through `supports()` (`:3059`) and `useRespecRenderer()` (`index.html:16323`).
  Every readability gap below is therefore live right now, not a consequence of this charter.
- `THEMES.apex` — `:41`. Structurally complete: all 13 keys (`sky`, `moon`, `hills`, `shape`,
  `stone`, `stoneLit`, `stoneDark`, `line`, `deep`, `cap`, `fog`, `amb`, `ambCol`), `shape:'arches'`,
  `moon:true`, `amb:'void'`. A *partial* theme throws; a missing one silently falls back to plains.
  Do not touch it.
- `hills()` (`:101`) draws `'arches'` at `:115` — paired 4-wide piers with an 18-wide lintel across.
  Right for a citadel.
- `drawAmbience`'s void branch — `:147` (`46` motes) and `:154` (`sp = (i%2 ? 11 : -11)`). Apex
  inherits it.
- All four authored body types already have v4 drawers, unguarded by stage: `shadeling` `:2378`,
  `voidbat` `:2383`, `rifthound` `:2385`, `stormmote` `:2387`. The walker group is `:2374-2377`.
- `drawEnemy` already routes the boss: `case 'tyrant': case 'king': return drawBossFigure(e);`
  (`:2390`), added mid-session by the concurrent run.
- The paradox tell — counter-rotating rings, star-burst while stunned — is already pixel-drawn
  inside `drawBossFigure` (`:2245`) at `:2261-2275`, **before** the switch at `:2276`.
- The v4 `drawWall`'s generic branch already marks slate: `:1679` draws pale 3px edges with rungs.
  Slate is legible; only the bands are not.

Five things remain, and the first two are the ones that make the fight unplayable rather than
merely unfinished.

1. **`case 'tyrant'` in `drawBossFigure`'s switch** (`:2276-2311`). Today it falls to
   `default: return legacyDraw(L.drawEnemyFull, e)` (`:2311`) — so the Tyrant renders as pixel rings
   with a legacy vector blob drawn **on top of them**. Follow the `warden` case's shape (`:2294-2301`)
   with the apex palette: body `#6a5aa0`, dark `#2f2352`, lit `#9a86d8`, a tall crowned head, and
   three horizontal courses across the torso at the band fractions, so the body itself states the
   triptych. `e.w` 78 / `e.h` 104 (`index.html:641`).

2. **The band guides do not exist in v4.** `grep -c tyrantWall public/bladefall-respec-renderer.js`
   returns **0**. The LOW / MID / HEAD readout — green for cleared rounds, bright for the live one,
   dim for the rest — lives only in the classic `drawWall` at `index.html:17541-17552`. The v4
   `drawWall` is `:1641`, its generic branch is `:1676-1679`, and it has no `tyrantWall`
   reference. **At the default `rendererMode:'v4'` the player is currently given no indication of
   which band is live.** Port it into the v4 `drawWall`'s generic branch, in buffer pixels:

   ```js
   if(o.tyrantWall && curG.boss && curG.boss.paradoxFight){
     const round = curG.boss.paradoxRound || 0;
     for(let i = 0; i < 3; i++){
       const b = TYRANT_BANDS[i], yy = WY(b.y);
       const col = i < round ? '#5fd17a' : i === round ? '#f1d6ff' : '#72568c';
       B(bx - 4, yy, w + 8, i === round ? 2 : 1, col);
       if(i === round) glow(bx + w / 2, yy, 26, '241,214,255', .3);
     }
   }
   ```

   `WY = wy => Math.round(groundBy - wy * Z)` (`:83`), so a world band y maps directly. The band
   table is a module-local copy of the three `{y,label}` pairs — the renderer does not import from
   `index.html`. **This is item 1 of the implementation order, not item 10.** It is a gameplay
   regression that is live in the shipped build.

3. **`shape:'arches'` is not exempt from the tuft guard** at `:125`
   (`for(let x = 0; x < 1024; x += 6){ if(shape === 'stacks') continue;`, density
   `r() < (shape === 'trees' ? .85 : .5)`), so apex ridges still get the generic 50% rock-and-shrub
   scatter the volcano conversion deliberately removed. `'shards'` is missing too — the Inversion's
   own outstanding item. Exempt both in one edit.

4. **`STRUCT` entries** (`:2442`) for exactly five new kinds: `'void-fissure'`, `'throne-gate'`,
   `'citadel-terrace'`, `'answered-door'` and `'triptych-stele'`. An unknown kind falls through
   `drawScenery`'s `default: if(!drawStructure(o)) legacyDraw(L.byType.scenery, o)` (`:2993`) to the
   legacy blob. Model them on `'inversion-anchor'` (`:2506-2514`) and `'ember-forge-door'`
   (`:2515-2517`); `hall()`, `frame()`, `stepArc()` and `mineMouth()` are already available.
   **`'void-fissure'` serves the Inversion's east prop as well** — one entry, two regions. Every
   other kind this level uses already draws: `'keep-gatehouse'`, `'weight-hall'`, `'split-belfry'`
   and `'east-collapse'` are in `STRUCT`, and `'boundary-lantern'` (`:2985`), `'keep-clock'`
   (`:2987`) and `'rest-stool'` (`:2991`) are direct cases in `drawScenery`.

5. **`WALKER_PALS.crownguard`** beside the void-chapter block (`:53-70`) plus a `case 'crownguard':`
   in `drawEnemy`'s walker group (`:2374-2377`), or the new Muster unique falls to
   `default: legacyDraw(L.drawEnemyFull, e)` (`:2391`) — verbatim the failure the file's own comment
   at `:57-59` describes. `{ body:'#6a5aa0', dark:'#2f2352', lit:'#9a86d8', eye:'#d2c4ff', mask:'#c4b8e8' }`.

Also fix while you are in there: the header comment at `:9` still claims *"every stage through the
Frost Sorcerer (0-8)"* against a set of 0–12.

Named and **out of scope**: the armed orb draws legacy. `:3163` routes every projectile through
`legacyDraw(L.drawProjectile, pr)` except stage 7 and stage 8, and `shape:'paradox'`
(`index.html:12454`) has no v4 drawer. It is visible and coloured; it is simply not pixel art yet.
Also unrelated and real: `case 'trap'` appears **twice** in the same obstacle switch (`:3112` and
`:3132`), and the second — the `o.slagCycle` route to `drawSlagBlock` — is unreachable. Not this
region's to fix; worth a separate task.

---

## Implementation order

1. **The band guides first.** `bladefall-respec-renderer.js`: the `tyrantWall` readout in `drawWall`
   (`:1641`, generic branch `:1676-1679`) and `case 'tyrant'` in `drawBossFigure`'s switch
   (`:2276-2311`). Both are live regressions in the shipped build; neither depends on anything else
   in this list.
2. **Blueprint.** `public/bladefall-campaign.js`: stage record `:24` `len: 8550` → `17000`, theme
   stays `'apex'`, `sky`/`ground` untouched. Detail block `:228-236`: `source: 'procedural'` →
   `'custom'`; `cadence:{adds:3,foes:[…]}` → `{ adds: 0, foes: [], accents: [] }`; `acts` from
   `['apex route','paradox threshold','three-band arena']` to
   `['fissure mouth','rising ledgers','opposed faces','the spent line','paradox vigil','three-band arena']`.
   **Leave `systems` and `composition` alone.** `validateBlueprints` (`:493-512`) never inspects
   `len`, `grunts`, `flyers` or cadence, and its `acts` check is only `if (!item.acts.length)` — so
   nothing catches a mistake here and the new test must.
3. **Region helpers.** `TyrantBeat`, `TyrantScenery`, `Face`, `Spent`, `Seal` immediately above the
   level, at `index.html:5495` (between `SECRET_LEVEL`'s close at `:5493` and
   `/* Sparse stage->level map`), under a new banner reading `THE VOID TYRANT (stage 13)`.
4. **The level.** The full 84-object body from §The level, with `loot:[]`, one npc and eight
   `noDrop` enemies in `{t:…}` row form.
5. **Register.** `CUSTOM_LEVELS` (`:6688`) gains `12:VOID_TYRANT_LEVEL`. `buildCustomLevel` (`:7334`)
   throws on `!migration.validation.ok` (`:7336`), so the manifest must normalize on first load.
6. **The arena monument.** `installParadoxFloor(full)` beside `installFoundryBed` (`:5687`), and its
   revisit call beside the Foundry's at `:7563`. `bossArena` is not edited.
7. **The clear on death.** `latchVoidTyrant()` beside `latchFoundryColossus` (`:5743`), called from
   the `if(e.boss){` block at `:10989`, beside the Foundry's latch at `:10996`:
   ```js
   function latchVoidTyrant(){
     try{markPersistentCircuitOpen('paradox-broken','void-tyrant');}catch(_e){}
     try{meta.zoneState=BFZoneStateModule.setCircuit(meta.zoneState,'void-tyrant','paradox-broken',{open:true,source:'void-tyrant'});persist();}catch(_e){}
     installParadoxFloor(false);registerCircuits();
     if(G.levelSelectMode||!G.worldProgressEligible||G.ngPlus!==0)return;
     commitStageCompletion();recordWorldClear();recordStoryStageClear();recordHelpedTravelers();
     meta.bestStage=Math.max(meta.bestStage||0,12);meta.reach=meta.reach||{};
     meta.reach[0]=Math.max(meta.reach[0]||0,12);persist();
   }
   ```
   Modelled on the Brute's inline clear at `:10926-10937`, with one deliberate difference: **do not
   set `G.physicalDepartureCommitted`.** The Brute sets it at `:10932` because its stage has no
   forward seam; `commitPhysicalDeparture` early-returns on that flag at `:8342`, so setting it here
   would silently stop the eastward seam's `commitClear:true` from ever advancing `bestStage`/`reach`
   to 13. `meta.reach[0]` is correct because the function returns early on NG+ and
   `commitPhysicalDeparture` indexes `reach` by `Math.min(G.ngPlus||0,2)` (`:8347`). Verify both fire
   cleanly in one run.
8. **No portal.** `:10999` — extend the exclusion list with `||(e.type==='tyrant'&&G.stageIndex===12)`.
9. **Seams.** The three branches from §Seams, inserted before `physicalSeamSpec`'s `return null;`
   (`:8404`). Correct the stale comment at `:8398`. **No arrival override.**
10. **Tables.** `STAGE_TRAVELER_PROFILE` (`:3475`) add `12:'sera'`. `MUSTER_ROSTERS` (`:4517`) add
    the `void-tyrant` key. `EARCH` (`:604`) add `crownguard` beside `cinderling` (`:623`).
    `bladefall-ecology.js` `SPECIES` add the matching `row(…)`. `LEVEL_MUSIC[12]` **already exists**
    (`:381`) — leave it interim; `tests/ember-music.test.mjs:43` pins the interim set to `[9,10,11,12]`.
11. **Raise the boundary.** `const V4_LAST_STAGE=11;` → `12` at `:338`. Do this **with** step 1, not
    after: the annotation helpers and the paradox alignment line are both gated on it (see Rule 3).
12. **Renderer, the rest.** Items 3–5 of §The renderer, plus the header comment at `:9`.
13. **Tests.** New `tests/void-tyrant-stage.test.mjs` on the `emberdeep-stage.test.mjs` shape:
    VM-evaluate the level out of `index.html` between `const VOID_TYRANT_LEVEL=` and
    `'\nfunction CourtBeat('`, lifting every constructor with the `fn()` helper. **No existing test
    file changes** — verify that, do not assume it.
14. **Delivery.** `VERSION` (`:334`) 7.122.0 → **7.123.0**; `CACHE_NAME` in `public/sw.js:4`
    `bladefall-v211` → **bladefall-v212**. Append a section to
    `LLM-HANDOFF/15-V4-LEVEL-REDESIGN.md` ending in a Verification paragraph stating the object and
    tagging counts, the browser checks actually run, and the limits — *no full human traversal, no
    aesthetic acceptance, no boss-fight completion claimed; no commit or deployment.*

**The new test must assert, at minimum:** `len === 17000` and `V4_LAST >= 12`; `12:VOID_TYRANT_LEVEL`
in `CUSTOM_LEVELS`; `campaign.js` carries `len: 17000`, `source:'custom'`, `cadence.adds === 0` and
exactly six `acts`; `portal === null`, `physicalExit === 'tyrant-king'`, `bossX === 15900`, and a
`physicalSeam` prop at each end; all three `physicalSeamSpec` branches by regex **including the boss
guard**, plus `/connector:'inversion-tyrant',zone:'inversion'/g` matching exactly once (stage 11's
branch is not duplicated); `:10999` naming `tyrant` and stage 12; `loot.length === 0`, zero
`type==='sign'`, zero enemies without `noDrop`, zero enemy shots with `el:'void'`, exactly one
`sealedRecollection`, exactly one npc with `profileId === 'sera'`; a `type==='check'` inside each of
the six spans; `installParadoxFloor` existing, dispatched on `bossDone`, and called from
`latchVoidTyrant`; `latchVoidTyrant` calling `recordWorldClear` and **not** assigning
`G.physicalDepartureCommitted`; the `void-tyrant` roster present with a `crownguard`, a first
non-standard post under x=1500, and no post within 350 of `npcs[0].x`; and `/tyrantWall/` plus
`/case 'tyrant'/` present in the renderer source.

**Seven geometry assertions, each stated by constant rather than by threshold:**

- **Tiers.** `CEILING = 480²/2800 + 450²/2800` (154.607). Copy `emberdeep-stage.test.mjs:94-102`
  verbatim: for every non-`deep` plat with `y > CEILING`, some other non-`deep` plat with a strictly
  lower `y` within `CEILING` overlaps it edge-to-edge within 240.
- **Walls.** For every `type === 'wall'`: `o.y - o.h >= 48` (a raised face), **or** a plat with
  `y >= o.y` whose span comes within 240 of `o.x` (a step-over), **or** `o.ladderFace` with a
  `type === 'check'` at y=0 within 900 of `o.x`. This is what the first draft's `type==='wall'`
  exemption let through.
- **Spent ledges are never the only route.** For every plat with `crumble`, some non-`crumble`,
  non-`gate` plat or `deep` floor exists with a lower `y` whose span contains its `x`. A spent ledge
  that strands the player would otherwise survive a reload as `gone`.
- **Every `crumble` plat carries `respawnDelay >= 9999`.** Without it the ledge reforms in 3.2 s
  (`:12693`) and the region's rule is a lie.
- **Nothing authored inside the sweep.** For every object, `o.type` in
  `{pit,check,coin,chest,vault}` **or** `o.x < 14960` **or** `o.x > 16230` — recomputed from
  `bossX ∓ 940 / + 330`, not hardcoded.
- **No authored checkpoint between 14,960 and 16,240** (a checkpoint inside the arena respawns the
  player mid-fight, and `check` survives the sweep). Note the floor's true east edge is 16,240 while
  the sweep's is 16,230.
- **The recollection is supported:** an authored plat spans its x within ±8 at its y within ±28, and
  a floor `check` sits beneath that plat's span.

---

## Rules this region must not break

- **No completion portal, either end.** Fissure in, Throne Gate out. Step 8 is not optional: without
  it the Tyrant's death opens `G.portal={x:G.levelLength-300,…}` (`:11000`) and the region ends in a
  hole in the air.
- **The Tyrant's mechanics are closed.** Bands, tolerances, the `>700` separation, the three-loop
  charge, `clearPlacedPortals` on every success, the escalation table, the stun window and the orb's
  damage formula are not touched. This charter adds a floor and a stair that outlive the fight, a
  clear record on death, a renderer body and a band readout. Nothing else.
- **A spent ledge is never the only route.** `respawnDelay:9999` survives a checkpoint respawn — only
  a stage reload rebuilds it — so any mandatory line built on one is a softlock. Every `Spent()` in
  this level is either directly over a floor or parallel to a permanent line.
- **`   THE INVERSION (stage 12)` stays byte-identical.** `tests/warden-stage.test.mjs:7` bounds
  `WARDEN_LEVEL` with it. The new banner reads `THE VOID TYRANT (stage 13)` — the same 1-based house
  label the Foundry (`STAGE 11 · THE FOUNDRY`) and the Inversion already use.
- **Nothing between `EMBERDEEP_LEVEL` and `const CUSTOM_LEVELS=`.** `tests/emberdeep-stage.test.mjs:25`
  slices there. Three more boundaries are listed in §The spatial outline; all four must survive
  untouched.
- **No random loot.** `loot:[]`, `noDrop:true` on every body, zero `type==='sign'`. Raising
  `V4_LAST_STAGE` to 12 switches off the boss chest (`:7916`), the boss key (`:10980`), `rollDrop`
  (`:10984`) and ecology material credit (`:10895`). Unlike stage 11, **stage 12 has a real boss**,
  so the chest and the key are real deletions, not vacuous ones — and they go together, since the
  chest is the key's only consumer (`:15131-15140`), so removing both cannot softlock. The
  procedural region also ships a chest and two legendary armour pickups in its manifest; those go
  with it. The Tyrant's reward is `hollow-edge` / `paradox-knot` (`bladefall-echoes.js:52`).
- **Everything else `V4_LAST_STAGE=12` switches ON must be checked, not assumed.** All nine
  `v4Region(` call sites (the tenth `grep` hit is the definition at `:344`) and all thirteen
  consequential `V4_LAST_STAGE` references were read at the exact line. Switched on for stage 12:
  single-Mantle campaign armour (`:1453`, `:19557`); the field-loadout no-bag flow (`:12975`); quiet
  combat shouts (`:11045`); quiet `PORTALS CLEARED` (`:3188`); quiet crate-recall text (`:12824`,
  `:12854`); quiet forge text (`:12377`, `:12390`, inert here); the whole read/annotate/`↑ READ`
  layer (`:8544`, `:8554`, `:8571`, `:8674`, `:8781`, and `interactionPrompt` at `:16344`); and
  `:13125`
  `if(v4Region(G.stageIndex)&&G.stageIndex>=9){updateFoundryQuenchJets();updateHeatStone(dt);updateSlagRain(dt);updatePourSpouts(dt);}`
  — harmless, because `updateFoundryQuenchJets` hard-returns unless `stageIndex===10` and the other
  three iterate obstacles for `heatCycle`/`slagCycle`/spout keys **this region authors none of**.
  Do not adopt heat primitives here.
- **The paradox alignment line must not go silent.** This is the one v4 gate that costs the player
  the fight. `placePortal`'s `quietV4=v4Region(G.stageIndex)` (`:3193`) wraps five messages, and the
  fifth is the band readout printed when the second mouth lands (`:3230-3235`,
  `tyrantPairStatus(G.boss).message`, green `#9dffc4` when aligned). With `#bosshpwrap` permanently
  hidden (`:39`), that line plus the wall guides are the **entire** progress display. Either exempt
  it (`if(!quietV4||G.boss&&G.boss.paradoxFight)`) **or** land the renderer's band guides in the same
  pass. Landing both is the intent; landing neither ships an unwinnable fight. Note that
  `advanceTyrantParadox`'s prompt (`:12427`), `chargeParadoxOrb`'s rejection hint (`:12439`),
  `'PARADOX n/3'` (`:12449`) and `'PARADOX ARMED'` (`:12457`) are direct `addText` calls with **no**
  v4 gate and stay as they are — the bump does not silence them.
- **Teaching by geometry, plus at most one annotation.** `showOutskirtsAnnotation` (`:8543`)
  hard-returns above `V4_LAST_STAGE` at `:8544`, so any annotation and the boundary bump land in the
  same pass or not at all. The teaching surface is room 1's free spent ledge, room 2's latch, room
  3's ladder face and opposed pair, room 4's raised pair, room 5's chapel and room 5's measured
  overlook. The arena's own `Sign()` is pushed by `bossArena` and is not ours to delete — but note
  that in v4 a bare `Sign()` **does render a wooden post** (`bladefall-respec-renderer.js:3017`
  draws unconditionally; only the classic `drawSign` has `if(!o.lore)return;` at `index.html:19066`).
  It is the region's one signpost and it is the boss's. **Author no second one.**
- **No `el:'void'` on any authored shot.** `:14972` routes any enemy void projectile through a
  player pair into `chargeParadoxOrb`. The crownguard's bolt, and every authored body's, carries none.
- **No `lowg`, `updraft`, `gravityWell` or `rotor`.** `applyFinaleActRemaster` builds the `detached`
  Set at `:10395` and filters at `:10396`, on stages 12 and 13, **after** the level is built
  (`:7570`). An authored field of any of those types is silently removed and the geometry around it
  becomes a lie. Author none, rather than granting an exemption. One live exception worth knowing and
  not acting on: `ngRemixCrumble` (`:9082`) injects an `updraft` field beside a collapsing ledge when
  the NG+ remix `brittle-breath` is active (`bladefall-remix.js:29`). That is added at runtime, after
  the filter, and is not authored.
- **No `flip`, no ceiling, no `populateVoid`.** Reasons in §The idea this region owns. The connector's
  `gravity-flip` requirement is the ticket into the region, not its grammar.
- **Six acts, six rooms, one owner each.** `bladefall-charters.js:68` builds `charter.rooms` from
  `blueprint.acts`, `:71` names each owner `void-tyrant:NN`, `:123` makes three the floor and `:166`
  errors `geometry.room.unknown` for any `authoringRoom` outside that set. The `TyrantBeat`
  quantizer's thresholds (2,600 / 5,800 / 8,900 / 11,800 / 14,400) are the authoritative bounds and
  produce exactly `void-tyrant:01`…`:06`.
- **Every fixture has a visible support and a reason to be where it is.** No floating clutter. Oren
  stands on authored ground within the ±8/±28 window `supported()` checks
  (`bladefall-charters.js:138-144`, reached from `:176`).
- **Recoveries below every spent ledge.** Twelve checkpoints, two per room, one 80 units west of the
  arena lip as the Tyrant's real retry site.
- **One Sealed Recollection, one optional coin route, no second currency.** Five coins, all on the
  spent line or in room 6.
- **Density ≈ 5 objects per 1,000 units** — 84 over 17,000 is 4.941, against Emberdeep's measured
  5.244 and the Foundry's 4.578.

### Known, bounded, and deliberately not fixed here

- **`retry:'citadel-checkpoint'`** (`bladefall-milestones.js:25`) is unimplemented —
  `grep -rn citadel public/` matches exactly two lines, that one and the music mood string at
  `index.html:383`. All seven boss contracts drift the same way; this is systemic naming, not a
  stage-12 defect. The real retry site is the `Check(14880,0)` this charter authors. Leave the id
  alone.
- **The contract omits `wall-jump`.** The arena cannot be entered without it — 360-tall solid faces,
  201 above the double-jump ceiling — and the HEAD band needs a clinging player at y ≈ 284.4.
  `wall-jump` is owned by stage 5, so the contract is not wrong in practice, only incomplete as a
  statement of the verbs the fight uses. Documented, not edited; room 3's west face and room 5's
  chapel are this charter's answer in geometry rather than in the table.
- **A player can satisfy `tyrantPairStatus` from the approach faces.** It tests only mouth normals,
  `|Δx|>700`, `|Δy|≤72` and the midpoint — not proximity to the boss. Room 3's and room 4's faces
  are both 1,100 apart and both ≥ 3,000 units from the Tyrant's 160-unit pacing cage, so no bolt of
  its can ever reach them, and `advanceTyrantParadox` clears the pair on every success. The readout
  may read "LEGS ALIGNED" from across the region; nothing follows from it. This is a pre-existing
  property of the gate, and the authored faces do not create an exploit — only a harmless echo.
- **`geometryStatus`** stays `'shell-until-dedicated-level-runs'`. The allowlist at
  `bladefall-zones.js:192` covers only stages 0–2 and has not been extended for **any** converted
  region. Shared debt; propose it, do not take it unilaterally.
- **The armed orb and the duplicate `case 'trap'`** — §The renderer, both named, both out of scope.

---

## Errata against the first draft

Every item below was re-read at the line; the ones marked **design** changed the plan, not the prose.

**Design changes**

1. **design — Spent ledges reform.** `crumble:1` alone is not "spent": `:12693` sets `respawn=3.2`
   and the ledge comes back. `Spent()` now carries `respawnDelay:9999` (`:12694`, precedent
   `RailCollapse` `:5419-5421`), and a new rule plus a new test assertion forbid building a mandatory
   route on one, because a spent ledge survives a checkpoint respawn.
2. **design — the arena's faces are solid barriers.** 360-tall walls block every `p.y < 356`
   (`bladefall-platformer.js:115`, `index.html:13446`); the boss pen can only be entered by
   cling-laddering a 26-wide pillar. Room 3's west face is now a deliberate rehearsal of exactly that,
   and room 5's chapel practises it where failure is free.
3. **design — `installParadoxFloor` would have re-erected two barriers across the only road.** It now
   pushes a five-plat stair as well as the floor and faces, modelled on `installFoundryBed`'s own
   aprons and steps, and it is called on the kill (`installParadoxFloor(false)`) as well as on a
   revisit (`true`), because `clearPlacedPortals(false)` at `:10992` otherwise strands the victor
   inside the pen.
4. **design — the Muster roster failed the charter's own hygiene rule.** `['crownguard',780,…]` sits
   180 from Oren at 960 and patrolled through him; `tests/muster-recall.test.mjs:62` fails at < 350.
   The first post moved to 1,400, and the whole roster was re-checked against the twelve authored
   checkpoints (two checkpoints moved to 8,560 and 9,060 to clear the 200-unit rule).
5. **design — rooms 1–5 had eight coordinates and no geometry.** All 84 objects are now authored with
   spans, and every tier was checked against the shipped assertion
   (`tests/emberdeep-stage.test.mjs:94-102`), which requires a **strictly lower non-`deep`** plat and
   compares **edge to edge**, not centre to centre — neither of which the first draft stated.
6. **design — `type==='wall'` was exempt from the reachability gate**, so an unreachable band would
   have passed every proposed test. Replaced with a three-way wall rule (`raisedFace` / step-over /
   `ladderFace` + a checkpoint within 900).
7. **design — the region's heights were far above house practice.** Measured: Emberdeep's tallest
   authored plat is y=250, the Foundry's y=380. The first draft's terraces implied 755+. Everything
   now tops out at 380, which is also the arena stair's height.
8. **design — the "answered door" had no safe home.** `Br(reform:9999)` can only remove floor, so it
   can only open a way down; the one authored Seal is the Paradox Vigil's chapel roof, where the room
   below connects onward two ways (a step-out double jump and a slate ladder).
9. **design — the seam props enclosed their own arrival points.** `void-fissure` moved 200 → 120
   (spans 30–210 against arrival 240) and `throne-gate` 16,780 → 16,880 (16,770–16,990 against
   16,760). Noted honestly: the Foundry and Emberdeep both do the enclosing version today.
10. **design — room 6 had no ground between 14,400 and the arena lip.** `Gr(14400,14960)` and
    `Gr(16240,17000)` are now authored, abutting the arena floor at both edges.

**Corrections of fact**

11. "17,000 is the only length at which the eastern arrival lands correctly" — **false**. Both
    branches are length-relative: west is 240 and east is `length − 240` at any length
    (`:8235-8236`). 17,000 stands on the zone budget alone (`bladefall-progression.js:36`).
12. "One mid-stage checkpoint" in the procedural capture — **false**: three, at x = 2,340 / 5,000 /
    7,880. The manifest also carries 96 objects, six signs, a chest and two legendary armour pickups,
    and no `authoringOwner` field at all, so it cannot evidence the ownership claim; `:7647` does.
13. The crownguard ecology row is required by `tests/muster-recall.test.mjs:58`, **not** by any check
    inside `installMusterRoster`, which has none (`spawnEnemy` tolerates a null ecology at `:9145`).
14. Arena sweep filter is `:15375-15376`, not `:15379-15380`. Enemy filter `:15378`, `killGoal`
    `:15379`, floor push `:15381`.
15. Stage 10's seam group is `:8387-8394` (return `:8387-8388`, guard `:8391`, forward `:8392-8394`),
    not `:8391-8396`.
16. Boss-spawn guard `:7557-7559`, Foundry revisit `:7563`, `applyCampaignCadence()` call `:7564`,
    `applyFinaleActRemaster()` call `:7570` — the first draft was one line low across this block.
17. `assignAuthoringOwnership`'s procedural fallback is `:7647`, not `:7646`; `ownerFor`'s
    `'finale-act-remaster'` at `:7645` was right.
18. `Cap` is `:6414`; `linesman` `:618`; `cinderling` `:623`; plate press test `:12885`;
    `validateBlueprints` `:493-512`; ecology `validate` `:83-94`; `TYRANT_PARADOX_BANDS` `:12395-12399`;
    `chargeParadoxOrb` `:12430-12461`; `applyElementalActRemaster` guard `:10318`; the
    `lowg/updraft/gravityWell/rotor` Set and filter `:10395-10396`; `drawBossFigure`'s warden case
    `:2294-2301`; `WY` `:83`; wall-mouth `py` `:3207`; the alignment block `:3230-3235`;
    `STAGE_TRAVELER_PROFILE` map `:3475`; wanderer fallback `:9529`; `tests/ember-music.test.mjs:43`.
19. `crumble:1` has no declaration site — `:3100` is `function Pl` and the flag is an untyped
    pass-through property. The three usage cites (`:3692`, `:5401`, `:6633`) were exact.
20. `compatibilityRecoveryPosition` is at **`:7708`** — both auditors said `:7704`; the first draft's
    number was right. Called at `:7724` from `installZoneRestSite` (`:7721`, anchor lookup `:7723`).
21. `physicalExit` is asserted by **four** tests (`emberdeep:44`, `outskirts:63`, `black-woods:72`,
    `brute:55`), not one; and it appears in three production-manifest rows (`:9638`, `:9653`,
    `:9672`) besides the four level literals. Still no runtime reader.
22. `auditGeometry` support-checks travelers **and** any record whose type is in `SUPPORT_TYPES`
    (`bladefall-charters.js:14`, `:176`); the ±8/±28 window lives in `supported()` at `:138-144`, not
    at `:176`.
23. `validateStory`'s right-hand-seal assertion is real and at `bladefall-story.js:252` (function at
    `:250`) — the first draft's cite was correct and the audit's UNVERIFIED is resolved.
24. Reference densities were re-measured in a VM, not quoted: Emberdeep 86/16,400 = 5.244 (74 tagged,
    12 checks, 9 `noDrop` enemies, 1 npc, rooms 12/15/13/14/11/9); Foundry 76/16,600 = 4.578 (63, 9,
    8, 1, `bossX` 13,600, rooms 9/12/12/12/13/5); White Court 75/16,000 = 4.688; Inversion 26/8,400
    with 0 tagged, 3 signs, 2 loot and 0 `noDrop`.
25. Beat-coverage target restated: **74 of 84 = 88.1%**. The first draft's "≥ 71 of 84 (85%)" was
    84.5%.
26. Enemy rows use **`t:`**, not `type:` (`FOUNDRY_LEVEL` enemies array), and `installMusterRoster`
    supplies `noDrop`, `noticeRange:460` and `G.killGoal++` itself (`:4690-4699`).
27. Checkpoint count raised 10 → **12**, two per room, to keep every spent ledge and every ladder
    face within a short walk of a recovery.
28. Added, not in the first draft: the lore prop has a runtime consequence — `bladefall-story.js:209`
    makes `right-hand-seal` plus the tyrant boss echo the only route to `revelation().stage ===
    'confirmed'`. Also added: `applyFinaleActRemaster` already tags `tyrantWall` and the arena sign at
    `:10399-10405`; the v4 `drawWall` already marks slate at `:1679`; and the crumble fuse is 0.45 s
    (`:14103`, 0.30 s under `ngFast`, `:9025`).