# Emberdeep — "The Buried Forge" design plan

Status: design, 2026-09-17. Supersedes the thin 7.114.0 pass, which was half the
authored density of the Outskirts and carried none of this. Boss work is out of
scope for this charter; the Ember Colossus has its own.

## What exists and must survive

Entry is the White Court's Ember Door (`sorcerer-emberdeep`), arriving west with
the return door already installed at x=180. The player owns Jump, Weapon, Dash,
both portal mouths, Wall Jump, Counter, Double Jump and Attunement. Emberdeep
awards **Companion Command**; nothing in it may require Downward Strike.

Oren is the courier — his fourth appearance after the Causeway, the Crown and the
Keep. `payload:'escort'` anchors, the relay pad and `relayHold` already work.
Keep them. The Sealed Recollection for this region is **The Buried Forge**.

## The idea this region owns

Frostfell and the White Court were the cold chapter: endurance on ice, then
control of hostile magic. Emberdeep opens the heat chapter, and heat's lesson is
the opposite of ice's. Ice was *treacherous ground you could see*. Heat is
**ground that is not finished yet**.

> **Local rule: the pour cycle. Nothing here is permanently floor.**

Three authored primitives, none of which appear anywhere else in the game:

1. **Heat-state stone** (`heatCycle`). A single slab moves through three states on
   a visible cadence: **molten** (it burns — you cannot stand), **setting** (solid
   but slick, real ice physics, so it is *fast* and hard to stop on), and **cold**
   (ordinary safe stone). The same rock is lava, then glass, then stone. The
   player learns to arrive late enough to survive and early enough to slide.
2. **Slag rain** (`slagFall`). Scheduled falls, not player-triggered. A block
   warns, drops, and **lands as footing** — the hazard is also the route. It
   settles back into the floor after a while, so a route built from slag is
   borrowed, never owned.
3. **The pour schedule.** Spouts brighten before they pour; channels flood and
   drain on the same clock that drives the slabs. One clock, three readings.

The escort inherits the clock. **Oren steps off a pad that goes molten** and
returns when it cools — so his hold is a rhythm, not a hit-point bar. The bridge
is his weight *and* the schedule's permission.

## Spatial outline (~16,400 units, six rooms, ~30–40 min first visit)

| Room | Range | Player experience |
| --- | --- | --- |
| The Cooling Road | 0–2700 | Arrival with the Court's cold still behind. Refuge, Oren at a bellows, the ledger. One heat-state slab over safe ground: watch it cycle, cross it three ways. |
| The Pour Schedule | 2700–6000 | The rule alone, on two lines over one clock. The LOW line is three staggered spouts over a floor of heat-state slabs. The HIGH line is a chimney and a run of cold stone over those same spouts — faster, and directly under the slag. |
| The Draw | 6000–9000 | The selective seal: iron is turned back, a courier is not. Oren's pad is itself a heat-state slab, so the seal holds in windows. Lead him — you do not own the order yet. |
| The Held Bridge | 9000–12200 | His weight is the bridge over a live channel whose level rides the pour cycle. When it rises the low stones go molten. One cooled island halves the crossing. |
| The Pour Floor | 12200–14400 | Companion Command earned at a protected anvil, then proved: the far post is across a pour you cannot cross, so the order is the only move. |
| The Deep Stair | 14400–16400 | Where the plateau ENDS. Four flights that switch back on themselves — worked steps, a controlled drop between two rune faces, slag and one slab run, a last step to the floor — with a recovery landing each and a sump under the head, so stepping off costs a rewind rather than the whole descent. The Buried Forge recollection sits on the second landing. |

### The datum (Run 3, 2026-09-18)

Rooms 1–5 stand on a **plateau at `ED` = 640**, filled to the world floor so nothing
walks under it; room 6 walks you 640 units down off it to y=0, where the east seam is
an ordinary edge walk into the Foundry. Every y in the level is written through `ED`,
so the datum is one number. `GrAt(x1,x2,y)` is deep ground at a height; `Landing()` is
a worked stair landing. The plateau rooms rewind at `ED-160` rather than at the world's
own void, so falling off the road costs what it always cost.

Underground regions get their own backdrop (`INTERIOR_STAGES` in the renderer, stages
9–11): tiled rock wrapped in both axes, pinned to nothing, with no horizon and no abyss
gradient. The outdoor backdrop assumed a sky, a hill line 196px above the GROUND LINE,
and darkness below it — raise a floor 640 units and all three break at once.

## People and story

Oren is the only speaking resident. He has read machinery for the player since
the Causeway; here the machine is him, and he knows it. His lines stay under
fifteen words and never explain the schedule — the spouts do that.

The Buried Forge is where the army that is currently killing the knight in a tent
was cast. Nothing says so. The evidence is the scale of the moulds, the standing
orders still legible on the ledger, and the fact that the works is running with
nobody in it.

## The recall

Emberdeep is inside the world-wide Muster and must read as such in the first ten
seconds after the bell. Its unique unit is the **slagwright**: heavy, slow, and
it throws cooling slag that lands as hostile terrain — the region's own primitive
turned against the player. Ordinary bodies carry the world-wide ×1.55/×1.25
baseline. See `12-RECALL-WORK-ORDER.md`; stages 8–10 were never given rosters.

## Rules this region must not break

- Every slab, spout, channel and machine has a visible support and a reason to be
  where it is. No floating clutter, no water without a basin.
- Recoveries below every heat-state run; a missed window costs the crossing, not
  the region.
- No instructional banners. The spout tell, the slab colour and the slag warning
  are the whole teaching surface.
- One Sealed Recollection, one optional coin route, no second currency.
- Density target ≈ 6 objects per 1,000 units, matching the Keep and the Court.

---

## THE DATUM IS A CONTRACT (2026-09-19, after the owner's first playtest)

This region is the game's only raised floor, and that made it the only place where a
literal `0` and "the ground" are different numbers. The first playtest failed on three
symptoms of that single fact: the camera framed 354 units of solid fill, the Cinder
Ledger was installed inside the plateau, and the relay traveler fell out of the world
and stayed there — which made the region unfinishable, because rooms 3 and 5 cannot
open without her on a pad.

**Anything added to this region from now on must obey the contract, not the habit.**

- The level declares `datum: ED` and `datumDescent:{from:14800,to:16060,y:0}`. Those
  are the only two places the height of this floor is written down.
- `datumDescent.from` **must equal** the x in `updraftsVoidFloor`'s stage-9 branch.
  Those two numbers are the same fact — where the plateau stops being the floor — and
  `tests/level-datum.test.mjs` fails if they drift.
- Code that places or rescues something asks `levelFloorY(x)`. It is deliberately
  conservative: past the head of the stair it returns the *lower* datum, because the
  stair switches back and two landings share an x. Never use it to ask "what is
  directly under this point" — it does not know, and is not trying to.
- Code that frames asks `cameraMinimumY(p)`, which eases down the descent and is
  floored by the player's own feet.
- **Nothing else may read `.datum`.** The test enforces exactly two readers. The
  failure mode this region taught is not any one of the three bugs; it is the
  knowledge spreading back out into every place that needs it.

If a future region raises its floor, it declares a datum and inherits all of this for
free. If it declares one without a descent, its floor is flat at that height.

## NO SCREEN SHAKE (owner, 2026-09-19)

Emberdeep declares `stillCamera:true`: no screen shake and no haptic vibration from any
source. The pour schedule made the frame shake about once a second and the owner found
it uncomfortable. The schedule is taught by the spouts, the slab colour and the slag
warning — never by the screen moving. Keep it that way.

## OWNER CUTS (2026-09-19) — these supersede the room plans above

Played and reviewed by the owner. Everything below is a decision, not a draft.

- **Room 2 is ONE line.** The chimney, the whole high line, its step back down and
  every falling weight are gone. The high line let a player climb over the lesson;
  now everyone crosses the eight slabs. Read the room-2 plan above as the LOW line only.
- **The rhythm is "wait, then jump."** Each slab sets one beat (1.4s) *after* the slab
  west of it, so you stand on stone, watch the next slab go from lava to stone, and
  jump while both are solid (1.37s window, every hop). The original order ran the other
  way and needed the weights as rest points. Two new slabs stand where the weights
  landed. Each spout hangs over a slab on its own clock.
- **Cold stone warns before it opens**: lit seams for the last 30% of its cycle, steady,
  no strobe. The lead is longer than a full double-jump hop (~1s) on purpose.
- **No falling weights anywhere in the region** (room 4 and the stair lost theirs too).
- **The room 3 chimney and its step are gone** — it led to an empty shelf.
- **The room's coin** now hangs 170 over slab 5: a double jump from the slab while it is
  solid, through the diver's lane. A single jump misses it by design.
- **The Muster roster was re-laid.** It was authored at y=0 for the flat Emberdeep and
  spawned all twelve rows inside the rock after the plateau went up. Rows are now
  heights above the level's floor, clear of every safe place; the stair pair was cut.
  Two standards and six soldiers, down from three and nine.

Verified: a bot that only ever waits for the next slab to be stone and not glowing,
then jumps, crosses room 2 from all 40 arrival times tried, in 12–15.5s.
