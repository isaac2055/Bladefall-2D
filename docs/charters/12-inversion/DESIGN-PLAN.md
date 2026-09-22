# The Inversion — "The Upside-Down Road" design plan

> ## 7.137.0 — THE LAST BREATH, the lash, and the region is now 16,100 wide.
>
> The owner played the serpentine and asked for three things: amp up the wall spikes so
> they "damage you at ALL points/parts, so that you have to time your way past", and add
> a finale that is "completely spikes — i.e., there is absolutely nowhere to land.
> Nowhere", "pretty long", and "somewhat windy, as in curves, real ones, similar to path
> of pain, but wider."
>
> **Room 8 · The Last Breath (1400-4000).** A curved tube whose every wall is thorns,
> entered straight off the end of lane C with no ground in between, and left by falling
> through the Void Fissure's own roof into the safe end room. 2,600 units, a 460-560
> channel (the jetpack tube is 224), and nothing to stand on anywhere in it: the flip
> stops being a way to change floors and becomes the only thing holding you up.
> A bot on a steady twelve-frame beat flies it in 13 s at 3.3 flips a second, 4 runs of 5.
>
> **The lash.** Twelve bars of thorns that throw out and pull back on a 2.6 s cycle, hung
> in the MIDDLE of each lane where nothing ever rests — so a lash can only ever hit a
> crossing. Each gap in the weave became a moment as well as a place.
>
> **The wall thorns now bite what they draw.** `drawSpikes` read a wall band's `len` as
> how far its teeth jut OUT and painted a bar that long lying on its side, while the
> hitbox it owns is a `len`-TALL strip SPIKE_REACH wide against the wall. A 400 band drew
> a 400-unit spear across the room and bit almost none of it. Fixed in the renderer, so
> every level's wall spikes now match their hitbox.
>
> **Where it went.** Everything east of the Fissure moved 2,600 further east (the Fissure
> and the west gate have still never moved). Verified object by object: 148/148.


> ## 7.135.0 — THE PATH OF INVERSION, and the region is now 13,500 wide.
>
> The owner asked for a finish "similar to the earlier path of pain with the jetpack…
> you have to use G to flip gravity and avoid spikes in a narrow, difficult to navigate
> path… more width/room than the path of pain, as the gravity flip is not as precise…
> about half the size as what the current level already is."
>
> **Where it went.** A road can only be lengthened at its end, so rooms 1-5 moved EAST
> by exactly 4,500 and the Void Fissure (0-1400) did not move at all — which leaves the
> west gate, its seam, the Zenith socket and the recollection where they were. The Path
> occupies the 1,400-5,900 that opened between them. The shift was verified object by
> object against a dump of the old level, not by eye: 66/66 at +4,500, every other field
> identical. **Every pre-7.135.0 coordinate in this region is its old value + 4,500.**
>
> **Room 7 · The Path of Inversion (1400-5900).** **Rebuilt in 7.136.0 as a serpentine**
> after the owner played the first version: *"Right now, you can simply flip to ceiling,
> walk a bit, flip to floor, walk a bit, repeat. Extremely simple, easy, and boring."*
> Three lanes stacked in the same 4,500-unit footprint and walked **west along the
> bottom, east along the middle, west along the top**, then out down a shaft into the
> fissure — **13,200 units of road, 67 seconds, 24 flips**, three times the straight
> tube it replaces.
>
> Each lane is a 400 channel that **winds**: eight steps, 500 apart, alternating a
> **pillar** off the floor and a **stalactite** off the roof, each shutting half the
> channel outright and each carrying a 300-wide bank of thorns on the face it leaves
> open. A wall cannot be tanked, jumped or dashed past, so every step is a change of
> floors and the thorns say exactly where. Both faces of every wall are slick: a knight
> who could cling one would go over it without ever turning the world over.
>
> At the end of a lane a **wall of thorns** stops you dead and the only way on is up,
> through the one hole in that lane's own ceiling — lane A's at its west end, lane B's
> at its east end. Lane C's roof has no hole at all, because a hole there is a hole to
> the roof of the world and a free road over the whole maze. Twelve checkpoints. No
> enemies: the channel is the encounter.
>
> ### The numbers that carry it
>
> - **400 of clearance**, against Needlewind's 224-wide jetpack tube. A jetpack holds a
>   line; a flip does not — you let go of one floor and fall the whole way to the other,
>   half a second you cannot steer. The channel has to be a place you can live in.
> - **The gate is a WALL, not a thorn.** A floor thorn only bites an anchor within 30 of
>   the floor, so a jump clears a short bank and jump+dash stays above that band for about
>   350 — thorns forbid a face, they never forbid the passage. A pillar does: the first
>   one stops a bot that refuses to flip at x 5230 of 5700, with nothing to tank.
> - **500 spacing, 300 banks — so 200 of clear ground** stands between one step and the
>   next, twice the ~100 a crossing costs. That is the window the thorns aim at.
> - **One Blood a touch (20).** At the region's ordinary 12-14 a bot that never flipped
>   once brute-forced four thorn banks; at 20, five touches is death. A knight who reads
>   the Path takes none at all — the verified run is 67 s and zero damage.

> ## PLAYED 2026-09-19, AND IT FAILED. Rebuilt in 7.134.0.
>
> The owner reached the Drop-Lock **without ever using Gravity Flip**, and then could not
> solve it: the plate sits in a bin whose walls rise to 390 under a roof at 400, and the
> knight is 44 tall. That ten-unit slit meant the one mouth that could fill the bin could
> only be set from *inside the sealed bin*. **The region could not be finished.**
>
> The root cause of both is one line in "Numbers that are load-bearing" below:
> *"Floor gaps are 400. A double jump clears 355 in EITHER orientation."* True, and it
> forgot the dash. Measured in the engine, the full kit reaches **671 flat, 726 off a 210
> drop, 774 off a 400 one** — so all four crossings were dashable and the region named for
> the verb never asked for it. **Gap width is not a gate below ~800.** The rebuilt road
> uses three 900-wide voids west of the anchor, verified against 210 launch techniques
> each. See `AUDIT-AND-FIX-PROPOSAL.md` for the audit, the fixes and the engine evidence.
>
> Also corrected there: the `CeilTeeth` at the world ceiling are **not** dead props, as I
> first claimed. Flipped, you fall UP — step off a roof edge with open sky above it and
> the roof of the world is a free road west. The teeth are what make that cost blood.

> ## BUILT, 2026-09-18 (Run 4). The layout below this box is SUPERSEDED.
>
> Everything from "## What exists and must survive" down was written for a flat
> 8,400-unit region walked left to right. **Its rule, its numbers and its errata
> are still authoritative; its layout is not.** The built region is below.
>
> ### The region as built
>
> About **9,000 wide by 1,500 tall**, entered at the **top right** by falling out
> of the Foundry's floor and left at the **bottom left** by the west gate at y=0 —
> right to left and downward, as a diagonal of terraces, because that is how the
> map draws it. `authoredEcology`, no procedural coda, no `populateVoid`.
>
> ### The idea it owns
>
> **There are two floors, and you may owe only one at a time.** The grammar is the
> switchback: a floor run ends at a gap too wide for any jump; the only thing over
> that gap is a roof, whose UNDERSIDE you reach by stepping off the lip and turning
> the world over in the air; that roof reaches past the gap, over the next floor,
> where you right the world and drop. Neither line is a route alone.
>
> ### Six rooms (rooms are x-spans in this engine, so none may share an x)
>
> | Room | Range | Floor | What it is |
> | --- | --- | --- | --- |
> | The Fall In | 7800–9000 | 1200 | Landing terrace, shelter, Oren, the surveyor's plinth. The way back is the one hole in this room's roof: a rune chimney, climbed now and fallen up later. Height-triggered seam, the wind-shaft pattern. |
> | The Unreachable Line | 6600–7800 | 1150→940 | A stepped descent under overhangs deep enough to steal your jump and too thick to stand on. One coin on a ceiling 250 up. Nothing asks for the verb; it shows you the shape of it. |
> | The Reversal | 5500–6600 | 860 / 810 | Gravity Flip granted on solid ground, spent four seconds later. The teaching roof has GENEROUS LIPS so flipping while standing still still works. |
> | The Polarity Gauntlet | 2900–5500 | 760→580 | Three crossings; 400-wide gaps and islands. Each roof escalates one thing: it gives way, it has teeth, it does not wait. Plus a floor that runs the wrong way. The world ceiling is toothed so it is not a shortcut. |
> | The Drop-Lock | 1400–2900 | 180 | The portal room. A crate always falls the world's way. The plate is sealed in a bin and the only mouth that can fill it is on a ROOF SLATE — standable only flipped. Two decoys dump the crate on open floor. |
> | The Void Fissure | 0–1400 | 0 | The recollection and the Zenith socket both rest on a ceiling 260 up. Then the west gate. |
>
> ### Numbers that are load-bearing
>
> - **Floor gaps are 400.** A double jump clears 355 in EITHER orientation — the
>   flip changes which way the budget points, not how far it reaches.
> - **Roofs span their gap and reach ~200 past it**, over the island you land on.
>   A roof that stopped at its gap put every landing back in the hole it crossed.
>   Found in play, not on paper.
> - **Roof slates must be thin (h < 16).** `playerSlate` measures a mouth against a
>   plat's TOP, so a thicker roof cannot hold one from below. `Roof()` defaults to 14.
> - **Overhangs must be thick (h = 96).** A thin one steals your jump from below and
>   then offers its own top as a perch one jump up — the route it was placed to deny.
> - Highest content 1,480; upper kill plane 2,000; nothing below y=0.
>
> ### Cast
>
> Oren only. `MUSTER_ROSTERS.inversion` with the **keelman** — a thing with a keel
> instead of legs, which owes neither floor and never has to choose. Eight authored
> bodies, all `noDrop`. No loot, no signs; the Drop-Lock's reward is the way down.

Status: design, 2026-09-17. Stage index 11, the last pre-v4 region before the
Void Tyrant. This is a **carry-forward**, not a redesign: Emberdeep and the
Foundry set the standard over the last two runs and this region joins that line.
Boss work is out of scope — the Void Tyrant is its own charter. Line numbers are
against `VERSION='7.120.0'` (`public/index.html:334`), regenerated against the
working tree on 2026-09-17, and will drift.

## What exists and must survive

`INVERSION_LEVEL` is at `public/index.html:5349`: `{len:8400,portal:8250,flip:true}`,
**25** top-level objects, 5 checkpoints, **zero scenery objects**, and a two-entry
`loot` array. Density is **2.98** objects per 1,000 units, or **2.27** across the
11,000 actually played. Emberdeep runs 5.24 (86 objects over 16,400) and the
Foundry 4.58 (76 over 16,600). It is the thinnest late region in the game by a
factor of **1.76**.

**The banner is not stale.** `public/index.html:5344-5345` reads

```
/* ================================================================
   THE INVERSION (stage 12) — the anti-gravity level. G flips the world;
```

and `(stage 12)` is the house 1-based label — `FOUNDRY_LEVEL` is banner-labelled
`STAGE 11 · THE FOUNDRY` at `:6370` while being `CUSTOM_LEVELS[10]` (`:6659`).
Those bytes are load-bearing: `tests/warden-stage.test.mjs:7` bounds
`WARDEN_LEVEL` by searching for `'/* ====…\n   THE INVERSION (stage 12)'` and
`tests/warden-runtime.test.mjs:174` for `'/* ====…\n   THE INVERSION'`.
**Keep the rule line and the prefix `   THE INVERSION (stage 12)` byte-identical.**
Everything after that prefix on line 5345, and every line below it, is free.
Note there is a second, decoy `THE INVERSION` banner at `:5040-5042` above
`RUINED_KEEP_LEVEL`; both searches start after it (`WARDEN_LEVEL` is at `:5221`),
so it is inert — do not "tidy" it away.

Worth keeping, in shape if not in coordinates:

- The four beats the level already names — `gravity-flip`, `ceiling-route`,
  `inverted-circuit`, `alternating-polarity`. Three of those are blueprint
  systems; `inverted-circuit` is a level-local `ElementBeat` tag. The blueprint's
  actual systems are `['gravity-flip','alternating-polarity','ceiling-route','portal-crate']`
  (`public/bladefall-campaign.js:222`), and **`portal-crate` is the one the level
  never answers** — today only the coda's `spGravity` does.
- The inverted button: `Pl(4650,160,STALAC_Y)` plus `Plate(4650,HANG_STALAC,'inv',true)`
  and a full-height `{type:'door',circuit:'inv'}` + `DoorSeal(5080,340,1560)` meeting
  the world's roof (`:5361-5364`). A plate at hang height genuinely works —
  `public/index.html:12852` presses on `p.onGround && Math.abs(p.y-o.y)<10`, and a
  hanging player's `p.y` is exactly `HANG_STALAC`.
- The UP · DOWN · UP · DOWN gauntlet: crumbling roof perch at `STALAC_Y`, floor
  refuge, moving roof shelf `{move:{dx:-70,period:3.8,phase:2.3}}` (`:5368-5372`).
- The drop-lock, which today exists **only** inside the procedural coda's `spGravity`
  (`public/index.html:7122-7146`): a crate-only latching plate sealed in a slick bin,
  three ceiling `slate:1` plats and three floor `Slate` entries, one true pair.
  The blueprint lists `'drop-lock'` as an act (`bladefall-campaign.js:224`) and no
  authored geometry answers it. Lift it out of the coda and author it — and drop
  `spGravity`'s epic-weapon reward with it (`:7143-7144` pushes
  `weapon:makeWeapon(randLootArch(),'epic')` at `x+1740`), or the region breaks its
  own no-random-loot rule on the way in.

Pre-v4 debt, to be deleted rather than migrated:

- `portal:8250` (`:5349`), which the coda relocates to 10850 (`:7530`,
  `G.portal={x:L.portal+ext,t:0}`) — 2,450 units past the last authored object.
  Stages 5–10 are all `portal:null`.
- `customExtension: 2600` (`bladefall-campaign.js:226`). Stage 11 is the **only**
  stage left with a coda — `customExtensions()` (`:323-327`) skips falsy entries —
  and `tests/campaign.test.mjs:60` pins `{11:2600}`.
- **Four** `Sign()` objects that render nothing: `:5353`, `:5354`, `:5360`, `:5372`.
  `drawSign` opens with `if(!o.lore)return;` (`public/index.html:19032`) and
  `Sign()` (`:3408`) never sets `lore`. Two more are generated — the coda's
  `inversionAuthored` block (`:7400-7406`) and `spGravity`'s own
  `'TWO MOUTHS. TWO ORIENTATIONS. ONE TRUE LINE.'` (`:7127`) — and both die with
  `customExtension`. The level currently teaches with invisible text.
- `loot:[{x:3000,…},{x:7000,…}]` (`:5376`) and four bare `{t,x}` enemies (`:5377`)
  with no `patrol`, `noticeRange` or `noDrop`.
- `populateVoid(L.len)` (`:7415` → `:7280-7296`), which seeds 16 random
  crawler/voidbat/bloodeye (`n=Math.max(3,Math.floor(len/500))`) and gives each a
  35% chance of dropping **cursed random gear** at `VOID_Y`. **That is not gated on
  `V4_LAST_STAGE` in any way** — only suppressing the call removes it.
- The stage-11 tail of the coda: the `inversionAuthored` sign block (`:7400-7406`)
  and the roof epic-weapon drop (`:7409-7412`).

And the hole under everything: **the verb is unobtainable.**
`grantPermanentCapability('gravity-flip',…)` appears nowhere in the repo.
`public/index.html:13298` gates the flip on `G.flipUnlocked && movement.gravityFlip`;
the first is place state set at `:7415`, the second is `has('gravity-flip')`
(`public/bladefall-movement-progression.js:56`), which nothing grants. Press G today
and you get `GRAVITY WILL NOT ANSWER` (`bladefall-movement-progression.js:44`, via
`:13305`). Level Select does not cover it either: `gravity-flip` lives in zone
`inversion` = stageIndex 11 (`bladefall-progression.js:59`, `:35`), and entry grants
only `ability.id==='jump'||(zone&&zone.stageIndex<target)` (`public/index.html:776`),
so 11 < 11 is false. This is character-for-character the hole `claimFoundryMemory`
was written to close — see the comment at `public/index.html:4879-4882`.

## The idea this region owns

Emberdeep said ground is not finished. The Foundry answered it: here you make
ground. The Inversion takes the argument to its end and removes the premise.

> **Local rule: there are two floors, and you may only owe one of them at a time.**

Gravity flip is not a jump and not a traversal tool. It is a **declaration about
which surface is real for you**, made in mid-air, reversible at any moment, and
paid for by the other floor continuing to run while you are not on it. A crumbling
perch you left keeps crumbling. A moving shelf keeps moving. An updraft you abandoned
is still there and still refuses to lift an inverted knight.

Three consequences, all of which the engine already does — **no new systems**:

1. **The ceiling is a place you cannot use before it is a floor.** It cannot be a
   *hazard* to a floor-walker: `o.ceil` rows fire on
   `p.y+p.h > o.y-30 && p.y+p.h < o.y+8` (`public/index.html:14180`), and a
   floor-walker's head tops out near 199, more than 1,200 below the roof. So Room 2
   establishes the roof by what it holds and what lives on it, and the thing that
   punishes jumping out of the problem is a **low overhang**: a plat whose underside
   stops the rise at `p.y = cl.y-40` (`:14116-14118`) and takes your arc away. It
   costs height, not blood. Room 3 hands over the flip and the same roof becomes
   standable; `{ceil:1}` teeth then become real, because the flipped head is at the
   roof line.
2. **Some tools belong to one floor only.** Every updraft is switched off while
   inverted — `field.type==='updraft' && !flipped` at
   `public/bladefall-environment.js:157`, and the same guard on
   `lportal emit:'updraft'` at `:170`. `lowg` bubbles (`:150`) carry no such guard
   and work both ways. That asymmetry is free enforcement: a route that needs lift
   forces you to right yourself first. Crates are the exception and the reason the
   drop-lock works at all — see below.
3. **Landing on a roof is unforgiving in a way landing on a floor is not.**
   `getCeiling(x,oldY,h)` (`public/index.html:11283`) takes no `pad` argument, unlike
   `getFloor(x,oldY,pad)` at `:11255`, and the 9px ledge assist at `:14042-14053`
   sits inside the `if (gravDir === 1)` branch opened at `:14037`. Ceiling shelf
   edges have no grace. Author roof spans wide and roof gaps honest.

The reward for the region is its own recollection, and it hangs from the roof.

### The numbers you author against

`public/index.html:3092-3096`, unchanged:

```
const CEIL_Y=1600;                 // ceiling slab (h=40) -> bottom 1560
const HANG_SLAB=CEIL_Y-40-40;      // 1520: standing under the ceiling proper
const STALAC_Y=CEIL_Y-190;         // 1410: hanging shelves (h=14) -> bottom 1396
const HANG_STALAC=STALAC_Y-14-40;  // 1356: standing under a shelf
const VOID_Y=HANG_SLAB;            // cursed loot rests on the ceiling floor
```

Anything a flipped player must touch sits at `bottom-40`, never on top of the shelf.
The flipped landing branch is `public/index.html:14121-14144`: `p.y=targetCeil-40`
(`:14126`), then `p.onGround=true; p.vy=0; p.jumps=0; p.floorPlat=cl.o` (`:14134`).

Head line: `freshPlayer` is `h:44` while every flip path uses the literal `40`, so a
hanging player's head sits 4px inside the slab. A `{ceil:1}` spike row triggers on
`p.y+p.h > o.y-30 && p.y+p.h < o.y+8` (`:14180`), so place roof teeth at
**`HANG_STALAC+44` = 1400** (under a shelf) or **`HANG_SLAB+44` = 1564** (under the
world roof). The ±30/+8 window absorbs the 4px: 1400 fires for `p.y ∈ (1326,1364)`
and `HANG_STALAC` is 1356; 1564 fires for `p.y ∈ (1490,1528)` and `HANG_SLAB` is 1520.
The only precedent for authoring one is the procedural `'U'` tile at
`public/index.html:8064`, which pairs the row with an invisible plat at the same `y`
so the stopped jumper's head lands inside the window.

**Three arithmetic facts that bind the layout:**

- `HANG_SLAB − HANG_STALAC = 164`, and the double-jump ceiling is **154.6**
  (`480²/2800 + 450²/2800`, from `jumpVelocity` and `secondJumpVelocity` at
  `public/bladefall-movement-progression.js:20-21` against the literal `1400` gravity
  at `public/index.html:13597`). **No route may require a climb from a hanging shelf
  to the world roof** — it is 164 up and cannot be jumped in either orientation.
- `getCeiling` returns the **lowest** bottom above the actor (`:11283-11295`,
  `bottom<cy`). **Every intended flip column must be clear of intervening plats**, or
  the flip lands you on the underside of the nearest low tier instead of the roof.
- 154.6 is conservative, not physical: the v4 apex hang
  (`apexGravityScale: 0.55` within `apexBand: 60`, `bladefall-movement-progression.js:25-26`,
  applied at `public/index.html:13596-13597`) adds ~1.05 per jump, so the real
  ceiling is ~156.7. Author against 154.6 and the test is honest with room to spare.
  The paired ±240 horizontal tolerance is a **parity constant** copied from
  Emberdeep, not a derivation: a flat double jump is airborne
  `480/1400 + 450/1400 + √(2·154.6/1400) = 1.134 s`, which at `runSpeed: 200` is
  **~227 units**, and much less at full height.

## The spatial outline

**16,800 units, six rooms, ~88 objects (5.24 per 1,000).** Emberdeep is 16,400 at
5.244 and the Foundry 16,600 at 4.578; the zone target is 19,000
(`bladefall-progression.js:35`). Room spans drive the `InvBeat` quantizer, exactly as
`EmberBeat` (`:6520`) and `FoundryBeat` (`:6378`) do.

| Room | Range | Player experience |
| --- | --- | --- |
| The Sunken Landing | 0–2,800 | Arrival up out of the Foundry's fissure, right-way-up and staying that way. Pilgrim shelter, the plinth, Oren, the Last Inventory. A roof road is plainly visible overhead at `STALAC_Y` and plainly out of reach. |
| The Unreachable Line | 2,800–6,000 | Floor traversal under low authored overhangs that steal the jump: broken footing, crumbles, one moving low shelf. An updraft lifts you to look at the roof and sets you back down. A coin sits on the roof and you cannot have it. Nothing up there touches you; that is the point. |
| The Reversal | 6,000–9,000 | **Gravity flip granted**, protected, on continuous ground. Taught on one roof shelf directly above safe floor: flip, land, walk, flip back, fall nowhere. Then the first gap only the roof crosses, then the first roof teeth at 1400, so the ceiling is never free. |
| The Polarity Gauntlet | 9,000–12,000 | UP · DOWN · UP · DOWN, carried forward at scale: crumbling roof perch, floor refuge below at **150**, moving roof shelf, a belt running the wrong way along the ceiling, opposed spike bands on both floors. One climb sits inside an updraft column, so it must be taken right-way-up. |
| The Drop-Lock | 12,000–14,600 | The `spGravity` set-piece authored by hand, and the blueprint's `portal-crate` system finally answered. Three ceiling slates and three floor slates, one true pair; a crate-only latching plate sealed in a slick bin; a full-height circuit door sealed to the roof. Wrong pairs dump the crate on open floor and the standard crate recovery returns it. No reward pickup. |
| The Void Fissure | 14,600–16,800 | A fissure east toward the Paradox Citadel — a seam, never a portal. The Upside-Down Road recollection hangs under a roof shelf, so the region's own verb is what collects it. |

Per-room object budget: **15 / 17 / 16 / 16 / 14 / 10 = 88**. Checkpoints: at least
one in every span, matching `tests/emberdeep-stage.test.mjs:114-118`.

Region-local constructors, mirroring `Heat`/`Slag`/`Spout` (`:6531`, `:6534`, `:6536`)
and `FHeat`/`FSlag`/`Line` (`:6390`, `:6392`, `:6397`):

```
function InvBeat(o,beat,system){return ElementBeat(Object.assign(o,{inversionAuthored:1,authoringOwner:'inversion',
  authoringRoom:'inversion:'+String(o.x<2800?1:o.x<6000?2:o.x<9000?3:o.x<12000?4:o.x<14600?5:6).padStart(2,'0')}),beat,system);}
function InvScenery(x,y,kind,extra){ …Scenery + the lore-object unwrap, exactly as EmberScenery (:6522)… }
function Roof(x,w,o){return InvBeat(Pl(x,w,STALAC_Y,Object.assign({h:14},o||{})),'test','ceiling-route');}
function RoofPlate(x,id,latch){return InvBeat(Plate(x,HANG_STALAC,id,!!latch),'test','inverted-circuit');}
function Fang(x,y,o){return InvBeat(Sp(x,y,Object.assign({w:110,ceil:1,period:2.3,phase:0,dmg:12},o||{})),'test','two-floors');}
```

`Roof(…,{crumble:1})` works but note the ceiling branch hardcodes `crT=0.45`
(`:14135`) and ignores the `railCollapse`/`collapseDelay` path the floor uses
(`:12655-12656`) — author for 0.45.
`Roof(…,{belt:-1})` works because the flipped branch sets `p.floorPlat=cl.o` (`:14134`)
and `:13181` conveys off `p.floorPlat.belt`.
`Roof(…,{slate:1})` is a valid portal mouth: `:3206` resolves
`p.onGround && G.gravityFlipped` to `surf='ceiling'` with
`surfObj=playerSlate(p)||p.floorPlat`, and `:3209` requires `surfObj.slate`.
Springs have their own `gravDir===-1` arms (`:13622-13627`). Traps do not invert at
all — they arm only on `p.y<o.y` (`:12893`) and always fall world-down
(`o.vy+=2600*dt;o.y-=o.vy*dt`, `:12896`) — do not use them on the roof. Fluids carry
no gravity term at all (`public/bladefall-fluids.js` has zero occurrences of
`gravity` or `flip`) — do not use them on the roof either.

**Two engine facts that decide the bodies and the set-piece.**

*Walkers belong to whoever is holding the world.* `enemyGroundStep` (`:11347`)
resolves a non-fly enemy's support with
`G.gravityFlipped?getCeiling(e.x,e.y,e.h):getFloor(e.x,e.y+12)` (`:11349`) and probes
its ledge the same way (`:11363-11371`); bosses do the same through `bossRestY`
(`:11301-11309`). There is no such thing as an authored roof-walker — every walker
swaps floors the instant you press G. A body that genuinely holds the band between
the two floors has to be `kind:'fly'`.

*Crates do not flip.* The crate branch passes `gravityFlipped:false` into its field
query (`:12741-12742`), accumulates `o.vy+=1400*crateField.gravityScale*dt` (`:12746`)
and integrates `o.y-=o.vy*dt` (`:12748`) — the comment at `:12738-12740` says the
orientation is deliberately fixed. A crate always falls world-down, and always rides
an updraft (`:12747`) whichever way you are pointing. **That fixed orientation is the
drop-lock**: you flip up to set a mouth over the bin, right yourself to set the other
under the shelf crate, and the crate falls down through the pair. Nothing new is
needed to author it by hand.

## The verb, taught and tested

Granted at a **protected midpoint**, per the house rule the Foundry and Emberdeep
both follow. The Foundry's is `FoundryScenery(6560,0,'anvil-block',{w:140,h:110,foundryMemory:1})`
in ROOM 3 on continuous `Gr(6200,9200)` with `FoundryBeat(Check(6800,0),…)` beside it
(`:6438-6440`). Copy that shape and those offsets:

```
InvScenery(6560,0,'inversion-altar',{w:140,h:110,inversionMemory:1}),
InvBeat(Check(6800,0),'recovery','inversion-flip'),
```

`claimInversionMemory(o)` mirrors `claimFoundryMemory` (`public/index.html:4883-4894`)
line for line:

```
function claimInversionMemory(o){
  if(!G||G.stageIndex!==11||!o||!o.inversionMemory||hasCapability('gravity-flip'))return false;
  const grant=grantPermanentCapability('gravity-flip','inversion-altar',{quiet:true});
  if(!grant.changed)return false;
  o.read=true;markPersistentCircuitOpen('inversion-flip','inversion-altar');
  if(!G.levelSelectMode){commitStageCompletion();recordWorldClear();recordStoryStageClear();recordHelpedTravelers();
    meta.bestStage=Math.max(meta.bestStage,11);meta.reach=meta.reach||{};meta.reach[0]=Math.max(meta.reach[0]||0,11);persist();}
  restoreBlood(G.p,Infinity);
  activateRuntimeCheckpoint('inversion:flip',{x:o.x,y:o.y},'checkpoint',null,true);
  showOutskirtsAnnotation(o,'<b>GRAVITY FLIP</b><br>'+escText(keyLabel(kbCode('flip')))+' turns the world over.',
    {accent:'#c47bff',manual:true,radius:360});
  if(meta.soundOn)SFX.levelup();return true;
}
function updateInversion(){
  if(!G||G.stageIndex!==11)return;
  const memory=G.obstacles.find(o=>o.inversionMemory);
  if(memory&&!memory.read&&Math.abs(G.p.x-memory.x)<38&&Math.abs(G.p.y-memory.y)<54)claimInversionMemory(memory);
  if(memory)memory.read=hasCapability('gravity-flip');
}
```

`updateInversion()` goes beside `updateEmberdeep(); updateFoundry();` at
`public/index.html:13093-13094`. `'flip'` is a live action id — `kbCode('flip')`
resolves through `KB_DEFAULTS` `flip:'KeyG'` (`:1502`) and `keyPressedFor('flip')`
is at `:13297`.

`G.flipUnlocked` stays as the **place** gate (`:7415`), so a returning player who
already owns the verb can flip from x=0 and a first-time player cannot. That is
precisely the Foundry's arrangement, where the place gate is the level itself.

**Teaching without signage.** All four authored `Sign()` objects are deleted; they
render nothing anyway, and the two generated ones die with the coda. The teaching
surface is:

- Room 2's low overhangs and its withheld roof coin — the ceiling is established as
  a place that exists, is inhabited, and is not yours.
- One `showOutskirtsAnnotation` at the altar, naming the key. That helper
  hard-returns on `G.stageIndex>V4_LAST_STAGE` (`:8511`, and the same gate at
  `:8521`, `:8538`, `:8641`, `:8748`, and via `v4Region` in `interactionPrompt` at
  `:16310`), so **the grant fires silently until `V4_LAST_STAGE` moves to 11.** Bump
  the constant in the same pass, not after. It honours `opts.radius` at `:8513`.
- Room 3's lesson span: a roof shelf over continuous `Gr(6000,9000)`, where a wrong
  flip costs nothing.

Beat progression, using the existing `ElementBeat` vocabulary (`:3597` — free-form
`elementalActBeat`/`elementalActSystem` strings):
`teach` in room 3's lesson span → `test` on room 3's first required crossing →
`twist` through room 4's alternation and the withdrawn updraft →
`synthesis` at the drop-lock → `reward` at the recollection.
`recovery` on every `Check`, `place` on every scenery object. Target **≥ 76 of ~88**
objects tagged, matching Emberdeep's verified **74 of 86** (the Foundry is 61 of 76).

## Seams

No completion portal at either end. `portal:null`, `physicalExit:'inversion-tyrant'`.

**The back seam already exists.** `public/index.html:8369-8370` is already the
stage-11 `colossus-inversion` branch, with a comment at `:8365-8368` saying its
forward seam "waits on that region's own run", and
`tests/ember-colossus-stage.test.mjs:41` already asserts the Foundry-side half.
**Add exactly one branch**, between that line and `physicalSeamSpec`'s `return null;`
(currently `:8371`; anchor by the closing `return null;` of `function physicalSeamSpec()`
at `:8321`, not by line number). A bare `if(G.stageIndex===11)` placed after the
`x<G.levelLength/2` branch is correctly shadowed:

```
if(G.stageIndex===11)return{connector:'inversion-tyrant',zone:'inversion',targetStage:12,
  warm:G.p.x>=G.levelLength-1400,cross:G.p.x>=G.levelLength-62&&G.p.face>0,
  forward:true,commitClear:true,requires:'gravity-flip'};
```

`requires:'gravity-flip'` matches the connector contract at
`bladefall-progression.js:89` and `bladefall-world.js:54`, and is satisfiable because
the altar is at 6,560 and the fissure at 16,600.

**Three** overrides into `compatibilityZoneArrival()` before its `return{x,y,…}` at
`public/index.html:8228` (the last existing override is `sorcerer-emberdeep` at
`:8227`). None exists for either connector today:

```
if(plan.connectorId==='colossus-inversion'&&plan.targetZoneId==='inversion'){x=330;y=0;}
if(plan.connectorId==='colossus-inversion'&&plan.targetZoneId==='ember-colossus'){x=Math.max(70,length-170);y=0;}
if(plan.connectorId==='inversion-tyrant'&&plan.targetZoneId==='inversion'){x=Math.max(70,length-170);y=0;}
```

Line 1 is the one that matters. The `inversion` endpoint for `colossus-inversion` is
`side:'south'`, ratio 0.35 (`bladefall-zones.js:121`), so the `else` branch at `:8207`
computes `0.35 × G.levelLength` — **x ≈ 3,850 on today's level and ≈ 5,880 on the new
one, past the entire flip lesson, the shop, Oren and the plinth.**
Line 2 is the Foundry return: `ember-colossus`'s endpoint is `side:'north'`, ratio
0.62, so the `else` branch drops you at `0.62 × 16,600 ≈ 10,292` — mid-Foundry. The
override lands at 16,430, against its east fissure prop at 16,420 (`:6497`).
Line 3 is cosmetic parity: the east branch at `:8206` already computes
`16,800 − 240 = 16,560`; the override moves it to 16,630, beside the prop.

**There is no fourth line.** The first draft added a guard for
`inversion-tyrant → void-tyrant` on the theory that the arrival computes
`min(length−70, 0.5×17000) = 8,480` on an 8,550-long stage 12. It does not:
void-tyrant's endpoint is `side:'west'` (`bladefall-zones.js:122`), the west branch is
`x=Math.min(length-70,Math.max(70,plan.arrival.spawn.x))` (`:8205`), and
`plan.arrival.spawn` is `center(safeArrival)` (`bladefall-zones.js:103`) over
`rect(x1+ARRIVAL_NEAR, …, x1+ARRIVAL_FAR, …)` with `ARRIVAL_NEAR=180`,
`ARRIVAL_FAR=300` (`:13-14`, `:66`). **spawn.x = 240**, so the un-overridden arrival
is the start of stage 12. That is the Tyrant's charter's business, and it is already
correct. Leave it alone.

Both seams need a prop, the way `:6406` and `:6641` carry theirs:

```
InvScenery(200,0,'void-fissure',{w:180,h:300,physicalSeam:'colossus-inversion'}),
InvScenery(16600,0,'void-fissure',{w:200,h:300,roomLandmark:1,physicalSeam:'inversion-tyrant'}),
```

Two honest caveats. **`physicalSeam` is inert.** It appears on exactly five authored
scenery objects (`:3612`, `:3755`, `:3926`, `:6406`, `:6641`) and has no reader
anywhere in `public/` — `physicalSeamCrossing` is an unrelated runtime flag. It is
documentation, and the Foundry's own east prop does not even carry it (`:6497` uses
`foundryFissure:1`). Keep it for the reading, not the behaviour. **What draws is the
`kind`,** and nothing in `public/bladefall-respec-renderer.js` knows `'void-fissure'`
today; an unknown kind falls through `drawScenery`'s
`default: if(!drawStructure(o)) legacyDraw(L.byType.scenery, o)` (`:2962`) to the
legacy blob. Add a three-line `STRUCT['void-fissure']` entry modelled on
`'ember-forge-door'` (`:2484-2486`) in the renderer pass. The connector is literally
named `void-fissure` in the world graph (`bladefall-progression.js:89`), so the name
is not invented.

## People, story and the recall

**Oren, carried forward.** `npcs:[{x:1020,y:0,kind:'escort',profileId:'sera',essential:1,noPortalTransit:1}]`,
copying the Foundry's row at `:6500`. `STAGE_TRAVELER_PROFILE` (`:3471-3473`) has
entries only through 10; add `11:'sera'`. Both reference tests assert
`LEVEL.npcs[0].profileId === 'sera'` — `tests/emberdeep-stage.test.mjs:111` with the
comment *"Oren carried forward, not a new face"*, and
`tests/ember-colossus-stage.test.mjs:110`. No escort mechanic here: his thread closed
at the Foundry, and he is in the Inversion because the road is. Lines under fifteen
words, and he never explains the flip.

The story is already written and unplaced. `STAGE_LORE[11]` is
`{id:'two-floors',title:'POLARITY PRAYER',text:'The Hollow has two floors. Pilgrims trusted whichever held.',accent:'#d8b7ff',at:.38}`
(`public/index.html:3486`), today dropped by fraction via `safeLorePosition`
(`:9479`, called at `:9514-9518`) rather than authored.
`bladefall-quests.js:49` has an `inspect` objective depending on that marker. Author
it into the plinth, the way Emberdeep authors `returned-ember` into `ember-ledger`
(`:6409-6410`) and the Foundry does the same at `:6409`:

```
InvScenery(1340,0,'polarity-plinth',{w:90,h:130,lore:{id:'two-floors',title:'POLARITY PRAYER',
  text:'The Hollow has two floors. Pilgrims trusted whichever held.',accent:'#d8b7ff'}}),
```

The auto-placer then skips it — `:9515` checks
`!G.obstacles.some(o=>o.lore&&o.loreId===lore.id)` — provided `InvScenery` performs
`EmberScenery`'s lore-object unwrap (`:6524`).

The rest site is contracted as `['inversion-plinth','inversion','Inversion Plinth',0.40,true]`
(`public/bladefall-recovery.js:48`). Copy the **Foundry**, not Emberdeep: `:6408`
uses `restSiteAnchor:'foundry-threshold'` and matches, while Emberdeep's `:6547`
says `'ember-refuge'` against a contract id of `furnace-shelter`
(`bladefall-recovery.js:46`) and silently falls through to
`compatibilityRecoveryPosition` (`installZoneRestSite`, `:7691-7698`).
So: `Scenery(1120,0,'rest-stool',{restSiteAnchor:'inversion-plinth'})`. The shop
`last-inventory` at `stageIndex:11, x:330` (`bladefall-shops.js:70`) already lands on
room 1's ground; give it a room.

**The recall.** `MUSTER_ROSTERS` (`public/index.html:4514`) has no `inversion` key, so
a recalled muster is invisible here (`:7715`). Add twelve rows on the
Emberdeep (`:4526-4533`) / Foundry (`:4534-4541`) pattern — the row form is
`[unitId, x, y]` or `[unitId, x, y, patrolLo, patrolHi]`, both rosters open with
`['standard',520,0]` — using the region's own unique, declared in `EARCH` (`:601`)
beside `cinderling` (`:620`):

```
keelman:{muster:1,hp:46,dmg:13,speed:86,w:38,h:34,xp:34,color:'#8a6ad0',kind:'fly',element:'void',
  ranged:true,shootCd:3.0,shot:{count:1,spread:0,speed:300,size:7,color:'#c4a8ff',shape:'bolt',glow:1}},
```

The keelman holds the band **between** the two floors — the one place neither
allegiance protects you — and it is the only Muster unit that is equally dangerous
whichever way you are pointing. It is `kind:'fly'`, which is not a flourish: every
walker's support follows the player's gravity (`:11349`), so a walker cannot hold a
floor you have abandoned, and only a flyer can. Colours are lifted from the void
theme's `cap` (`bladefall-respec-renderer.js:40`,
`cap:['#8a6ad0','#c4a8ff','#5a3f8f']`). The shot borrows `linesman`'s shape
(`:615` — same `count`, `spread`, `shape`, `glow`, recoloured, with `speed` 340→300
and `size` 6→7) with no `el`, because a `void` projectile element is unproven.

The Sealed Recollection is **The Upside-Down Road**, already declared at
`public/bladefall-recollections.js:12` and never placed. It hangs under a roof shelf
in room 6 — `SealedRecollection(15980,HANG_STALAC+10,'inversion','The Upside-Down Road')` —
so the verb the region taught is what collects it. It carries `authoringCritical:1`
(`:3418`), which `public/bladefall-charters.js:171` counts, so the shelf above it must
span at least ±90 and a `Check` must sit on the floor directly beneath. Verify that in
the test, not by eye.

What the Upside-Down Road was: the pilgrims' route, walked on the roof because the
floor belonged to somebody else. Nothing says so. The evidence is the plinth, the
prayer, and the fact that every shelter in this region is built under something.

## The renderer

Most of it has already landed. Verified now, not remembered:

- `SUPPORTED_STAGES = new Set([0…11])` — `public/bladefall-respec-renderer.js:15`. Done.
- `THEMES.void` — `:40`. Structurally complete: all 13 keys (`sky`, `moon`, `hills`,
  `shape`, `stone`, `stoneLit`, `stoneDark`, `line`, `deep`, `cap`, `fog`, `amb`,
  `ambCol`). A **partial** theme throws; a missing one silently falls back to plains.
  Do not touch it.
- `hills()` `shape:'shards'` — `:111` quantises the ridge to /10, and `:121-123` draws
  a spire up from the ridge **and** one down from tile y=0, so the horizon reads the
  same whichever way the world is pointing. Exactly right for this region.
- `drawAmbience` void branch — `:145`, 46 motes (`:147`) with
  `sp = (i%2 ? 11 : -11)` (`:153-154`): half drift up, half drift down. One ternary,
  and it is the cheapest statement of the local rule in the build.
- The void band above the ceiling — `:3059`,
  `if(G.hasCeiling){ const cy = WY(env.CEIL_Y || 1600); B(0,0,bw,Math.max(0,cy),'#06030a'); }`.
- `crawler`/`voidbat`/`bloodeye` now have `drawFlyer` cases (`:2364-2366`), and
  `shadeling` (`:2360`) was already v4. All three are `kind:'fly'`
  (`public/index.html:605-607`); with `populateVoid` suppressed they stop spawning
  here at all.

Five things remain, and the first two are the ones that make stage 11 look broken
rather than unfinished:

1. **Nothing in the v4 renderer knows about `gravityFlipped`.**
   `grep -c gravityFlipped public/bladefall-respec-renderer.js` returns **0**.
   `drawFigure` (`:1848`) and `drawWalker` (`:1972`) compose from `B()` fills with no
   transform, so on the roof the hero and every walker stand right-way-up. The classic
   path does flip both — `public/index.html:16407`
   `if(G.gravityFlipped){c.translate(0,-40); c.scale(1,-1);}` for the hero, and
   `:16485` `if(G.gravityFlipped && e.kind!=='fly'){c.translate(0,-e.h); c.scale(1,-1);}`
   for enemies, with the paired `rotation` sign flips at `:16408`/`:16486`. Wrap the
   `drawFigure` call in `drawHeroAt` (`:1908`, the call at `:1911` is
   `drawFigure(WX(p.x - 13), WY(p.y) - 22, heroState(p))`) and the `drawWalker` body in
   a mirror about the figure's own vertical midline in buffer px — for the hero that is
   `ctx.translate(0, 2*(WY(p.y)-11)); ctx.scale(1,-1)`, 11 being half of the
   22-buffer-px figure. **The acceptance check is that the flipped hero's FEET are
   against the slab and the hood points down** — feet land at `WY(p.y)-22`, two buffer
   px inside the slab, which is the same 4 world units the `h:44` vs literal-`40`
   mismatch already produces. A head touching the slab is the current bug, not the fix.
   Flyers stay upright, matching `e.kind!=='fly'`.
2. **The world roof is drawn at 200,000 units wide, every frame.** `addCeiling()`
   (`public/index.html:7275-7278`) pushes
   `{type:'plat',x:G.levelLength/2,w:200000,y:CEIL_Y,h:40,ceiling:1}`. The plat cull at
   `bladefall-respec-renderer.js:3069` is
   `o.deep || (o.x+o.w/2 > VX0 && o.x-o.w/2 < VX1)` — always true — and `drawPlat`
   (`:1540`) computes `w = Math.round(o.w * Z)` = **100,000 buffer px** at `:1541` with
   no clamp. `bricks()` (`:467`, called from `:1625`) runs two mortar rows
   (`h = 20`, `yy = 6, 14`) of **6,250** columns each, and because `floating = o.y > 0`
   (`:1593`) is true at `CEIL_Y=1600` the hanging-root loop at `:1635`
   (`for(xx=4; xx<w-4; xx+=7)`) runs **14,285** iterations and draws on about half.
   Roughly **23,000 `fillRect`s** plus a **100,001px `strokeRect`** (`:1639`) for one
   object. Clamp `bx` and `w` into `[0, bw]` at the top of `drawPlat` — a pure win
   everywhere, not a stage-11 special case. (The classic renderer is *not* the
   comparison: `public/index.html:16104-16111` draws the **void band above** the
   ceiling, not the slab, and the slab goes through the ordinary plat drawer in both
   paths.)
3. `shards` is missing from the tuft-suppression guard at **`:125`**
   (`for(let x = 0; x < 1024; x += 6){ if(shape === 'stacks') continue;`), so void hills
   still get the generic 50%-density rock and shrub scatter the volcano conversion
   deliberately removed. Add it.
4. A `WALKER_PALS.keelman` entry beside the void-chapter block at `:64-69` (the table
   runs `:53-70`), or the new Muster unique falls to
   `default: legacyDraw(L.drawEnemyFull, e)` (`:2372`) — verbatim the failure the
   file's own comment at `:57-59` describes.
5. A `STRUCT['void-fissure']` entry beside `'ember-forge-door'` (`:2484-2486`), or both
   seam props fall to the legacy scenery blob through `:2962`.

Also: the header comment at `:9` still claims *"every stage through the Frost
Sorcerer (0-8)"* against a set of 0–11. Fix it while you are in there.

## Implementation order

1. **Blueprint.** `public/bladefall-campaign.js`: stage record `:23` `len: 5200` → `16800`,
   theme stays `'void'`. Detail block `:219-227`: delete `customExtension: 2600`, add
   `cadence: { adds: 0, foes: [], accents: [] }` — seven of the sixteen detail blocks
   carry one (`:118`, `:184`, `:197`, `:207`, `:216`, `:235`, `:244`), and the Inversion
   is the only stage in the 7–13 run without one, though nothing enforces it:
   `validateBlueprints` (`:493-511`) never inspects cadence. Re-map `acts` from
   `['flip lesson','polarity gauntlet','drop-lock','inverted coda']` to
   `['flip lesson','ceiling route','polarity gauntlet','drop-lock']`, and **leave
   `systems` alone** — `portal-crate` at `:222` is the system the hand-authored
   drop-lock finally answers.
2. **Coda removal.** `public/index.html`: delete the `inversionAuthored` sign block
   (`:7400-7406`) and the stage-11 roof epic-weapon drop (`:7409-7412`); the flag
   itself is set at `:7362`. With `CUSTOM_EXT[11]` gone, `ext` is 0 at `:7315` and the
   whole `if(ext)` branch never runs for stage 11.
3. **`populateVoid` suppression.** `:7415` becomes
   `if(L.flip){addCeiling();if(!L.authoredEcology)populateVoid(L.len);G.flipUnlocked=true;}`.
   The Gilded Vault's `L.secretFlip` path at `:7418` is untouched. **This step, and
   only this step, removes the cursed roof pickups** — they are not gated on
   `V4_LAST_STAGE` anywhere.
4. **Region helpers.** Add `InvBeat`, `InvScenery`, `Roof`, `RoofPlate`, `Fang`
   immediately above `INVERSION_LEVEL`, under the preserved banner.
5. **The level.** Rewrite `INVERSION_LEVEL` (`:5349`) to
   `{len:16800,portal:null,spawnX:330,spawnY:0,flip:true,authoredEcology:true,physicalExit:'inversion-tyrant',…}`
   with the six rooms, `loot:[]`, the `sera` npc row, and nine or ten enemies all
   carrying `noDrop:true`, `patrol`, `noticeRange` and an `inversionRole`.
   `authoredEcology` sets `G.suppressVariantEnemies` at `:7514`, which is what stops
   `seedVariantEnemies()` (`:9167`) putting bodies into measured spaces.
6. **The grant.** `claimInversionMemory` and `updateInversion` beside
   `claimFoundryMemory` (`:4883-4894`) and `updateFoundry` (`:4895-4901`); dispatch
   `updateInversion()` at `:13093-13094`.
7. **Seams and arrival.** **One** new branch before `physicalSeamSpec`'s `return null;`
   (currently `:8371`); **three** overrides before `compatibilityZoneArrival`'s return
   (`:8228`).
8. **Tables.** `STAGE_TRAVELER_PROFILE` `:3471-3473` add `11:'sera'`. `MUSTER_ROSTERS`
   `:4514` add the `inversion` key. `EARCH` `:601` add `keelman` beside `cinderling`
   (`:620`). `LEVEL_MUSIC` **already has stage 11** — `inversion-floating-dream`,
   `interim:true`, at `:381-383`; leave it.
9. **Raise the boundary.** `const V4_LAST_STAGE=11;` at `:338`. Do this **with** step 6,
   not after: the annotation helpers are all gated on it.
10. **Renderer.** The five items above, in `public/bladefall-respec-renderer.js`.
11. **Tests.** New `tests/inversion-stage.test.mjs`, modelled on
    `tests/emberdeep-stage.test.mjs` (VM-evaluate the level out of `index.html` between
    `const INVERSION_LEVEL=` and `'\n/* THE DEEP LINE'`, currently `:5385`, the way the
    Emberdeep test slices to `'\nconst CUSTOM_LEVELS='`). Then update
    `tests/campaign.test.mjs:60` to `assert.deepEqual(extensions, {})`.
12. **Delivery.** `VERSION` `:334` → `7.121.0`; `CACHE_NAME` in `public/sw.js:4` →
    `bladefall-v210` (currently `bladefall-v209`); append a section to
    `LLM-HANDOFF/15-V4-LEVEL-REDESIGN.md` ending in a Verification paragraph that states
    the test counts, the browser checks, and the limits — *no full human traversal or
    aesthetic acceptance claimed; no commit or deployment.*

The new test must assert, at minimum: `len === 16800` and `V4_LAST >= 11`;
`portal === null`, `physicalExit === 'inversion-tyrant'`, and a `physicalSeam` prop at
each end; the **forward** `physicalSeamSpec` branch by regex, including
`requires:'gravity-flip'`, **and that the existing back branch is still single**
(`/connector:'colossus-inversion',zone:'inversion'/g` matches exactly once);
`loot.length === 0`, zero `type==='sign'`, zero enemies without `noDrop`, exactly one
`sealedRecollection`, exactly one npc with `profileId === 'sera'`; a `type==='check'`
inside each of the six spans; the recollection inside an authored roof shelf's span
with a floor `Check` beneath it; `claimInversionMemory` granting `gravity-flip` and
`updateInversion` dispatched; the `inversion` roster present with a `keelman` and a
first post under x=1200; and `/function drawPlat/` clamping plus a `gravityFlipped`
reference in the renderer source.

Four geometry assertions, each stated by constant rather than by threshold:

- `CEILING = 480²/2800 + 450²/2800` (154.607). Every non-`deep` plat with
  `0 < y < STALAC_Y` needs a step under it within `CEILING` vertically and ±240
  horizontally — **except** a tier whose x-span overlaps an authored
  `type==='updraft'` object's rect, exempted by object type, not by height.
- Every roof object sits at exactly `STALAC_Y` or `CEIL_Y`; every roof plate at
  `HANG_STALAC`; every `{ceil:1}` row at exactly `HANG_STALAC+44` (1400) or
  `HANG_SLAB+44` (1564) — with no room-2 exception, because there are no floor-facing
  teeth.
- **No shelf-to-slab climb:** no required route may pair a `STALAC_Y` object with a
  `CEIL_Y` object as consecutive steps, since the gap is 164 > `CEILING`.
- **Clear flip columns:** for every authored roof shelf, no non-`deep` plat with
  `0 < y < STALAC_Y` overlaps its x-span, or `getCeiling` catches the flip on the low
  tier's underside instead.

## Rules this region must not break

- **The banner's first line and the `   THE INVERSION (stage 12)` prefix stay
  byte-identical.** `tests/warden-stage.test.mjs:7` and
  `tests/warden-runtime.test.mjs:174` both bound `WARDEN_LEVEL` with them.
- **No completion portal, either end.** Fissure in, fissure out. Travel is a place.
- **No signage.** The low overhangs, the withheld coin and one annotation at the altar
  are the whole teaching surface.
- **No random loot.** `loot:[]`, `noDrop:true` on every body, `populateVoid` suppressed
  (step 3, not the `V4_LAST_STAGE` bump), no roof gear drop, and no `spGravity` epic
  reward carried into the hand-authored drop-lock. Raising `V4_LAST_STAGE` to 11
  switches off `rollDrop` (`:10951`), the boss key (`:10947`) and ecology material
  credit (`:10862`). It does **not** touch the cursed roof pickups, and the boss-chest
  gate (`:7886`, `if (s.boss&&i>V4_LAST_STAGE)`) is vacuous here — stage 11 is
  `type: 'normal'` with no boss (`bladefall-campaign.js:23`).
- **Everything else `V4_LAST_STAGE=11` switches on must be checked, not assumed.**
  Single-Mantle campaign armour (`:1450`, `:19523`), the field-loadout no-bag flow
  (`:12942`), quiet combat shouts (`:11012`), quiet `PORTALS CLEARED` / echo-pair text
  (`:3185`, `:3190`), quiet crate-recall text (`:12791`, `:12821`, both
  `>=5 && <=V4_LAST_STAGE`), quiet forge text (`:12344`, `:12357`), and the whole
  read/annotate/`↑ READ` layer (`:8511`, `:8521`, `:8538`, `:8641`, `:8748`, `:16310`).
  All nineteen verified at the exact line. Note `:13092` —
  `if(v4Region(G.stageIndex)&&G.stageIndex>=9){updateFoundryQuenchJets();updateHeatStone(dt);updateSlagRain(dt);updatePourSpouts(dt);}`
  — begins running on stage 11. `updateFoundryQuenchJets` hard-returns on
  `stageIndex!==10` (`:4824`); `updateHeatStone` (`:4790`), `updateSlagRain` (`:4844`)
  and `updatePourSpouts` (`:4859`) iterate obstacles for `heatCycle`/`slagCycle`/spout
  keys the Inversion authors none of. Confirm that; do not adopt heat primitives here.
- **`tests/loot-minimalism.test.mjs` moves its own subject.** It reads `V4_LAST_STAGE`
  out of the source (`:10`) and asserts at `:58-63` that `V4+1` still rolls gear and
  still leaves a key. After the bump that is stage 12, a procedural miniboss stage, and
  the gates are pure `>V4_LAST_STAGE` comparisons, so it still passes. Verify rather
  than assume.
- **Nothing authored above the double jump** except what the flip or an authored
  updraft reaches. Roof geometry at `STALAC_Y`/`CEIL_Y` is exempt because it is reached
  by inversion, not by jumping; updraft tiers are exempt by overlapping an authored
  updraft object. The test must state both exemptions by constant and by object type,
  never by threshold.
- **No traps and no fluids on the roof.** `Trap` arms only on `p.y<o.y` (`:12893`) and
  always falls world-down (`:12896`); `bladefall-fluids.js` has no gravity term at all.
  A hazard that does not invert is a hazard that lies.
- **No authored roof-walkers.** A non-fly enemy's support is
  `G.gravityFlipped?getCeiling(…):getFloor(…)` (`:11349`), so every walker changes
  floors when the player does. Bodies that hold the band between floors must be
  `kind:'fly'`.
- **Recoveries below every roof run.** A missed ceiling edge has no ledge assist
  (`:14037-14053` is floor-only) and no `pad` (`:11283` vs `:11255`), so a miss must
  cost the crossing, never the region.
- One Sealed Recollection, one optional coin route, no second currency.
- Density target ≈ **5.2** objects per 1,000 units — 88 over 16,800 is 5.238, against
  Emberdeep's 5.244 and the Foundry's 4.578.

## Errata against the first draft

- **`{ceil:1}` teeth cannot punish a floor-walker.** A floor-walker's head tops out
  near 199; rows at 1400/1564 fire only for a hanging player. Room 2's teeth are
  replaced by low overhangs that steal the jump (`:14116-14118`), Consequence 1 is
  reworded, and the test pins every `{ceil:1}` row to 1400/1564 with no exception.
- **The gauntlet's floor refuge moves from 160 to 150.** 160 > `CEILING` (154.6) over a
  pit, and it is reached by flipping down — a case the imported reachability rule
  (`tests/emberdeep-stage.test.mjs:94-103`) has no concept of. 150 reads identically
  and passes.
- **The reachability rule gains one named exemption**, by object type: a tier whose
  x-span overlaps an authored `type==='updraft'` object. Room 2's and Room 4's updraft
  climbs would otherwise fail the charter's own test.
- **Two new authoring constraints, both derived and both untested in the first draft:**
  `HANG_SLAB − HANG_STALAC = 164 > 154.6`, so no route may climb from a shelf to the
  world roof; and `getCeiling` takes the lowest bottom above (`:11283-11295`), so every
  intended flip column must be clear of intervening plats.
- **The renderer acceptance check was backwards.** After the mirror the flipped hero's
  *feet* are against the slab and the hood points down. Head-to-slab is the current bug.
- **The back seam already exists** at `:8369-8370`, with a comment at `:8365-8368`
  saying so and `tests/ember-colossus-stage.test.mjs:41` asserting the far half. One
  branch is added, not two.
- **Three arrival overrides, not four.** The `inversion-tyrant → void-tyrant` guard was
  justified by an arithmetic error: void-tyrant's endpoint is `west`, the west branch
  uses `plan.arrival.spawn.x` (`:8205`), and `center(safeArrival)` over
  `ARRIVAL_NEAR=180`/`ARRIVAL_FAR=300` gives **240**, the start of stage 12 — not 8,480.
- **25 top-level objects, not 26.** Density 2.98 per 1,000, or 2.27 across 11,000 — not
  3.10/2.36 — and 1.76× thinner than Emberdeep, not "a factor of two."
- **Four authored `Sign()` objects, not six** (`:5353`, `:5354`, `:5360`, `:5372`), plus
  two generated ones that die with the coda (`:7400-7406`, `:7127`).
- **`inverted-circuit` is not a blueprint system.** `bladefall-campaign.js:222` is
  `['gravity-flip','alternating-polarity','ceiling-route','portal-crate']`, and
  `portal-crate` — unmentioned in the first draft — is exactly what the hand-authored
  drop-lock answers. `systems` is no longer re-mapped.
- **The cadence gap is not unique.** Seven of sixteen detail blocks carry one; the
  Inversion is the only stage in the 7–13 run without.
- **Raising `V4_LAST_STAGE` does not remove the cursed roof pickups.** `populateVoid`
  (`:7280-7296`) pushes them ungated; only step 3 removes them. The boss-chest item is
  vacuous — stage 11 has no boss.
- **`spGravity` also pushes an epic weapon** at `x+1740` (`:7143-7144`). The
  hand-authored drop-lock drops it.
- **`physicalSeam` is inert metadata** — five writers in `public/`, no reader — and the
  Foundry's east prop at `:6497` uses `foundryFissure:1` instead. What draws is the
  `kind`, and `'void-fissure'` has no drawer; a renderer `STRUCT` entry is now item 5.
- **The classic renderer does not draw the slab as one rect.** `:16104-16111` is the
  void band above the ceiling. The comparison is dropped; the `drawPlat` clamp stands
  on its own measurements, which were correct.
- **Crate physics, missing from the first draft, are now stated:** crates pass
  `gravityFlipped:false` (`:12742`) and always fall world-down (`:12746`, `:12748`).
  That fixed orientation is what makes the drop-lock authorable with no new systems.
- **Walker allegiance, also missing:** `enemyGroundStep` (`:11349`) hands every non-fly
  enemy whichever surface the *player's* gravity points at. There is no authored
  roof-walker, which is the real argument for the keelman being `kind:'fly'`.
- **154.6 and ±240 are parity constants, not derivations.** The apex hang
  (`apexGravityScale: 0.55`, `apexBand: 60`) puts the true ceiling near 156.7, and a
  flat double jump covers ~227 units horizontally, not 240.
- **Emberdeep's tagging figure survives:** 74 of 86 verified (the Foundry is 61 of 76).
  The object target drops from ~102 to **88** so the density (5.238) actually matches
  Emberdeep's 5.244 instead of overshooting both references at 6.07.
- **Citations regenerated against the working tree.** The two that landed in unrelated
  code are fixed: `physicalSeamSpec`'s `return null;` is `:8371` (not `:8393`) and
  `claimFoundryMemory` starts at `:4883` (not `:4874`). Others corrected:
  `INVERSION_LEVEL` `:5349`, banner `:5344-5345`, `Sign()` `:3411`→`:3408`,
  `drawSign` `:19029` with its guard at `:19032`, `SealedRecollection` `:3416-3419`,
  `STAGE_TRAVELER_PROFILE` `:3471`, `MUSTER_ROSTERS` `:4514`, `EARCH` `:601`,
  `cinderling` `:620`, `LEVEL_MUSIC` `:381`, `compatibilityZoneArrival` return `:8228`,
  `spGravity` `:7122-7146`, `addCeiling` `:7275-7278`, `populateVoid` `:7280-7296`,
  the `ceil:1` precedent `:8064`, the flipped landing `:14121-14144`, the ceil-row
  trigger `:14180`, `crT=0.45` `:14135`, springs `:13622-13627`, environment guards
  `:150`/`:157`/`:170`, the lore skip check `:9515`, `campaign.test.mjs:60`,
  renderer `bricks` `:467`, tuft guard **`:125`**, `drawHeroAt` `:1908`,
  `WALKER_PALS` `:53-70`, void band `:3059`, plat cull `:3069`.
- **Two `THE INVERSION` banners exist.** The decoy at `:5040-5042` above
  `RUINED_KEEP_LEVEL` is inert because both test searches start after `:5221`. Noted so
  nobody deletes it.