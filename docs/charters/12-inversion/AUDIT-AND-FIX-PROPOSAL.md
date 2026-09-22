# The Inversion — audit and fix proposal

*Written 2026-09-19 against `VERSION='7.133.0'`, driven in the live engine on stage 11.
**Status: BUILT in 7.134.0.** The owner read the audit and said "go ahead and take your
lead", so all three tiers went in, with my own call on the three open decisions. The audit
below is kept as the record of what was wrong; **"As built" at the end** is what shipped,
including one finding (F4) I got wrong and have corrected in place.*

> **The owner's report**
>
> "In the inversion, I was able to get to here without using gravity flip at all (big
> issue for level centered on this mechanic), and now I can't get the crate onto the spot
> it needs to go because it is entirely enclosed by walls."
>
> Both halves of that sentence are correct, and the second one is worse than it sounds:
> **the region cannot be finished.** It is not a puzzle the player has failed to read.

## How this was checked

Everything below was measured by driving the real game (preview pane, stage 11, full
stage-11 kit granted), not read off the source. Bots do only what the level teaches.
Numbers are world units; the player is 26 wide and 44 tall.

---

## The two defects the owner hit

### F1 · The Drop-Lock is a sealed box — the region is unfinishable · **BLOCKER**

The plate that opens the only west door (`inv-lock`, door at x 1520) sits at (2200,180)
inside a bin made of two walls at x 2110 and 2290. The walls run from the floor (180) to
**390**. The roof slate that is supposed to hold the ceiling mouth is directly above, its
underside at **400**.

That leaves a **10-unit slit** between the wall tops and the roof. The knight is 44 tall.

Measured in the engine:

| Attempt | Result |
| --- | --- |
| Run + jump east along the floor toward the bin | stops at **x = 2084**, never past the wall |
| Walk the ceiling east from x 2030 (flipped) | stops at **x = 2084** — the wall tops block the ceiling lane |
| Walk the ceiling west from x 2380 (flipped) | stops at **x = 2316** |
| Placed inside the bin, jump out (240 frames) | cannot escape — apex from the floor is +148, the walls are 210 |
| Placed inside the bin, flip | reaches the true slate at y 360 ✔ |

So the only place in the world where a ceiling mouth would drop the crate into the bin is
**inside the sealed bin**, which the player can neither enter nor stand above. The mouth
can be set on the true slate, but only at x ≤ 2084 or x ≥ 2316 — both outside the bin, so
the crate lands on open floor every time. The two "decoys" flanking it are irrelevant:
there is no non-decoy answer.

The exit geometry that *would* have worked, for reference: a mouth placed while flipped
sits at the player's y (= ceiling − 44 ≈ 356) and ejects a crate 36 below it at ~150 u/s
straight down. Put the standable ceiling above the bin's interior and the crate lands on
the plate with room to spare. The bin is 154 wide inside; the crate is 36.

**Contributing detail.** The procedural twin of this puzzle (`index.html:7690`) ships two
safety nets the authored one does not: a fixed `Anchor(...,{ejectSpeed:780})` exit ("fixed
high arc clears the bin lip consistently") and `targetPlate` on the crate so a routed miss
recalls immediately. The Inversion's crate has neither, so a miss falls back to the
generic rule — any crate resting more than 40 below its start recalls after 3 s — which
happens to be harmless here but is not the puzzle's own logic.

### F2 · The whole region can be crossed without ever flipping · **DESIGN BREAK**

The charter states the load-bearing number plainly:

> **Floor gaps are 400.** A double jump clears 355 in EITHER orientation — the flip
> changes which way the budget points, not how far it reaches.

The budget is right for jump + double jump. **It does not include the dash.** With
jump → dash → double jump, all four crossings land on the far island, every time:

| Crossing | Width | Drop | Crossed without flipping | Landed at |
| --- | ---: | ---: | --- | --- |
| Room 3 break (6100 → 5700) | 400 | −50 | **yes** | x 5606 |
| Gauntlet 1 (5100 → 4700) | 400 | −60 | **yes** | x 4615 |
| Gauntlet 2 (4300 → 3900) | 400 | −60 | **yes** | x 3800 |
| Gauntlet 3 (3500 → 3100) | 400 | −60 | **yes** | x 3017 |

Every other join in the level is contiguous ground (room 1→2, 5500, 6600, and the 400-unit
step down into the Drop-Lock). So the floor is a **complete, unbroken road** from the
landing terrace to the Drop-Lock door, and the flip is decoration until the last room —
where it is required and impossible.

This is the Foundry feeder lesson again, in the region that could least afford it: **with
the full kit the knight covers roughly 1,100 units, so no gap can gate anything. Only a
mechanism can.**

---

## What else the audit found

### F3 · The "too thick to stand on" overhangs are standable

The charter's erratum says overhangs must be `h = 96` because a thin one "offers its own
top as a perch one jump up — the route it was placed to deny." The thick ones deny the
perch *from directly below* (+166 vs a 148 apex) but not **from the neighbouring floor
lip with a dash-jump**: 12 of 28 timings tried put the knight on top of the 7300 overhang
at y 1246. From there the room-2 coin at (7120,1262) — the reward for owning the ceiling —
is +16 away and falls out without the verb.

So room 2's "second floor" is an ordinary mezzanine.

### F4 · ~~The gauntlet's ceiling teeth are 620 units above the road~~ — **I was wrong**

I filed this as dead content: `CeilTeeth` places at `CEIL_Y − 40` = y **1560** while the
gauntlet's roof road runs at **874–940**, so the five sets at x 3400–5300 looked like
props nothing could reach. They are not. **Flipped, you fall UP** — step off the west edge
of any roof with open sky above it and you rise to the roof of the world and can walk it
west over everything. I confirmed it in the engine: flipping at x 4380, in the gap between
two roofs, put the knight on the world ceiling at y 1520, and my first crossing bot
finished two of three crossings up there. The teeth are what make that route cost blood,
and the charter says so in the helper's own comment.

What was true is narrower: the teeth covered 700 of the gauntlet's 2,600 units, and there
was no hazard on the roof road itself except the one ceil spike at (4010, 890). The fix is
**both** — teeth on the road where they can be felt, and teeth kept at the world ceiling
over every crossing.

### F5 · The recall roster seals a keelman inside the bin

`MUSTER_ROSTERS.inversion` includes `['keelman',2180,340,1600,2800]`. The Inversion
declares no `datum`, so that is world y 340 at x 2180 — **between the bin walls**. Once
the Muster is recalled, that keelman drops onto the plate floor and can never be reached
or killed, while `installMusterRoster` counts it in `killGoal`. Same family as the
Emberdeep roster bug, one region over.

### F6 · The verb arrives in room 3 of 6, and is asked for exactly once

Gravity Flip is granted by proximity at the anchor (6420, 860) — room 3. Rooms 1 and 2
are authored *before* the player owns it, room 4 doesn't need it (F2), and the only place
in 9,000 units that genuinely demands it is the room-5 puzzle that cannot be solved. The
two flip-only rewards (the Recollection and the Zenith socket, both hanging at y 262 in
room 6) are behind that door. A player who never touches G can reach the end of the
playable region; a player who masters it gains nothing extra along the way.

### F7 · Every flip press shakes the screen

`G.shake = 10` fires on each toggle. In a region whose verb you press dozens of times,
that is the exact sensation the owner asked to have cut from Emberdeep. Worth deciding
deliberately rather than inheriting.

---

## Root cause, in one line

**Every distance in this level was sized against jump + double jump, and the knight has a
dash.** F2 and F3 are the same arithmetic error; F1 is the same error pointed vertically
(a 10-unit slit where a 44-tall body was expected to pass). The region was verified by
geometry and by tests that assert the authored shape, and none of that can see a route the
player actually has.

---

## Proposal

Three tiers. Tier 1 makes the region finishable; Tier 2 makes the verb the reason the
region exists; Tier 3 removes the dead content. I'd do all three in one run — Tier 1 alone
ships a level whose middle is still optional.

### Tier 1 — Make the Drop-Lock solvable (must ship)

The room's sentence is good and worth keeping: *a crate always falls the world's way, so
the only way into a sealed bin is a mouth on the ceiling above it.* The bin just has to be
a place the ceiling can be stood over.

**Recommended (A): raise the bin's roof and let the bin be escaped.**
1. Lift the true roof slate above the bin from underside 400 to **460** (walls stay at
   390). The flipped knight then occupies 416–460 and walks clear over both wall tops with
   26 units of headroom.
2. The mouth then sits at y ≈ 416 and ejects the crate at y 380, *inside* the bin. Landing
   window is x 2141–2259 — 118 units wide, comfortably hit by standing anywhere near the
   slate's middle.
3. Because a 460 roof also lets the *player* hop the 390 wall, the bin must stop being a
   trap: clear `slickL`/`slickR` on the two **inner** faces so a knight who drops in
   wall-jumps out. (Outer faces stay slick, so the bin is still not a climbing frame.)
4. Give the crate `targetPlate:'inv-lock'` so a miss recalls to its shelf at once instead
   of resting three seconds first.
5. Keep the two decoy slates — with a real answer present they finally do their job.

**Alternative (B): open the bin's top and gate it on the crate.** Drop the walls to 300
and rely on `crateOnly` plus a lip the knight cannot stand on. Simpler geometry, but it
loses the "sealed vault" read the room is built around and makes the decoys pointless.

**Alternative (C): keep the seal and give the room a fixed exit anchor**, as the
procedural version does. Cheapest, but it turns the region's two-mouth graduation exercise
back into a one-mouth exercise — wrong for the last room before the Citadel.

### Tier 2 — Make the flip mandatory, four times, in escalating order

The fix is structural: **the floor road must stop existing**, in places, and the fact that
it stops must be visible before the player commits. Distance cannot do this; only absence
and mechanism can.

1. **Move the grant to room 1 (the Fall In).** The anchor belongs on the landing terrace,
   not 2,300 units in. That buys four rooms of escalation instead of two and lets room 2
   ask for something instead of miming it.
2. **Room 2 — the first commitment.** Delete the 7150–7500 step. The only thing spanning
   that hole is the overhang line, whose underside is the road; you step off, flip in the
   air (already legal and free), run the ceiling, and right yourself over the next
   terrace. Checkpoint on the lip so a miss costs seconds.
3. **Room 4 — the gauntlet becomes the gauntlet.** Remove the intermediate islands at
   4300–4700 and 3500–3900 entirely, so the crossing is 1,200+ of void with a roof over it.
   Keep the crumble roof, the mover and the belt; they finally matter because the roof is
   the ground. Each crossing keeps the "reach ~200 past the gap" rule the charter learned
   in play.
4. **One mechanism gate, not a distance gate.** At the gauntlet's west exit, a **ceiling
   plate** — a plate mounted on a roof that only a flipped, grounded knight can weigh —
   opens the way on. It reuses the plate/door system already in the room and states the
   requirement in one screen. (If we want a second flavour, `nojump` fields already exist:
   a corridor where the legs won't fire, so the ceiling is the only floor.)
5. **Leave one honest floor stretch per room** so the region reads as a switchback rather
   than a long ceiling walk. The charter's grammar — *neither line is a route alone* —
   is right; it was just never enforced.

Oren rubberbands (no `noRubberband` on the Inversion's Sera), so a ceiling-only stretch
will not strand the escort. Worth confirming on the rebuilt road before sign-off.

### Tier 3 — Make the second floor mean something

6. **A roof should never be a mezzanine.** `platTop` already returns `null` for
   `o.ceiling`; add a sibling flag (`ceilingOnly`) set by the `Roof()` helper so roofs are
   surfaces *only from below*. One line in the helper, one in `platTop` — and it makes F3
   unreachable by construction rather than by choosing bigger numbers. (Do not reuse
   `ceiling:1`; the renderer paints that as the world's dead-rock roof.)
7. **Put the teeth on the road.** Move the five `CeilTeeth` from y 1560 down onto the
   gauntlet's roof line (874–940), or cut them. Right now they are neither hazard nor
   scenery.
8. **Move the roster keelman out of the bin** (`['keelman',2180,340,...]` → the open floor
   west of it), so the Muster's completion count stays reachable.
9. **Decide about the flip's screen shake** (F7). My recommendation: cut `G.shake` on the
   toggle and let the existing half-second whole-screen tell carry it — it is already the
   strongest visual in the game.

### The test that would have caught all of this

Geometry tests pass on this region today. Add the one assertion that actually matters for
a region named after a verb:

> **`tests/inversion-requires-flip.test.mjs`** — drive the level with a bot that has the
> full kit and never presses G, and assert it **cannot** reach the west gate. Then drive
> one that does, and assert it can.

The general form is worth adopting for every region whose charter names a verb: *prove the
region cannot be finished without it.* That is the check that distinguishes a level built
around a mechanic from a level decorated with one, and no amount of shape-assertion
substitutes for it.

---

## What I need from you before building

1. **Tier 1 option** — A (raise the roof, open the inner faces), B (drop the walls) or C
   (fixed anchor). I recommend **A**.
2. **How far to go on Tier 2.** Removing the gauntlet's islands is a real change to the
   region's middle: it makes the ceiling the ground for two long stretches. That is the
   level the charter describes, but it is more vertigo than what you have played.
3. **The flip's screen shake** — cut it, or keep it as the verb's punctuation?

## Cost

Tier 1 is small and contained (five numbers and a flag in room 5). Tier 2 is a room-4
rebuild plus a room-2 edit and one new gate mechanism — comparable to the Colossus phase-2
shaft. Tier 3 is small but touches a shared helper (`Roof`), so it needs the whole late
road re-walked afterwards, exactly as the datum change did.

---

## As built (7.134.0) — what shipped, and the three calls I made

**The three open decisions.** Tier 1 option **A** (raise the bin's roof). Tier 2 **in
full**, with one change of plan below. The flip's screen shake is **cut**.

### The road, rebuilt (rooms 3–4)

The anchor stays at the protected midpoint — moving it to room 1 would have broken the
cross-region rule that each of the three late verbs is paid for mid-region, and it was
never necessary: rooms 1–2 sit *before* the grant, so they were always meant to be walked
the right way up. Everything **west** of the anchor is now flip-only. Rooms 1 and 2 are
untouched apart from the shared roof change.

| | span | what it is |
|---|---|---|
| Terrace B | 6200–6600 @860 | the anchor, its checkpoint, the roof that lets you flip standing still |
| **Crossing 1** | 5300–6200 (**900**) | plain. Just the commitment. |
| Terrace C | 5000–5300 @760 | checkpoint, the hound |
| **Crossing 2** | 4100–5000 (**900**) | it gives way, and it has teeth |
| Terrace D | 3800–4100 @700 | the belt — a floor that shoves you back at the void, over a spike |
| **Crossing 3** | 2900–3800 (**900**) | and it does not wait |
| Room 5 | from 2900 | the last roof hands you to a balcony at 420 |

Three voids at 900, against a measured kit reach of 671–774. Each is roofed end to end,
each roof step down is 60 against the 148 a flipped jump buys, and each road reaches past
its void over the terrace you land on.

**The crumble had to change shape.** A crumbling roof's fuse is 0.45 s from the moment you
stand on it — about 90 units of walking. The 620-wide crumbling roof this region shipped
with **could not be crossed by anyone playing correctly**; my first bot fell off it every
time. It is now a 200-wide stepping stone with an 80-unit landing window at each end and a
**perch above it**: when it drops you, you fall up onto the perch and back down when it
returns (3.2 s). Giving way is a setback, not a death.

### Room 5 · the Drop-Lock

- **The bin's roof went 400 → 460**, so the ceiling lane over the bin clears the 390 walls
  with 26 units to spare. The walk now reaches the slate over the bin's interior.
- **The bin's inner faces are bare** (slick kept on the outside), because a 460 ceiling
  also lets you hop the lip in. A knight who drops in wall-jumps out in **0.8 s**.
- **The crate moved off its shelf onto the floor.** The shelf's own underside hangs 106
  over the floor and a single jump buys 82, so it could only be mounted by a double jump
  run up from 260 units west — which lands you on the *wrong side* of the crate. And a
  crate resting below its start recalls after 3 s, putting a stopwatch on a puzzle whose
  difficulty should be the idea. It now sits on the floor beside its slate, `targetPlate`
  routed so a missed portal comes straight back.
- **New: the keel gate**, the room's first sentence. A plate on the *underside* of a roof,
  where a flipped knight's anchor sits, with a door between it and the bin sealed to the
  roof of the world. It says "a ceiling is a floor" in one press, immediately before the
  room asks for a mouth on one.

### Shared changes

- **`Roof()` now sets `ceilingOnly`, and `platTop` refuses it.** A roof is only ever a
  ceiling. `platBottom` does not consult the flag, so flipped landings are untouched. One
  author, one reader, asserted — the same guard the level-datum readers hold.
- **The flip no longer shakes the screen.** The whole-screen tell carries it.
- **The recall roster** no longer spawns a keelman inside the sealed bin, and every row
  was re-laid onto the new terraces. The authored cast moved with them; the gauntlet's bat
  now patrols over a crossing, where a flyer belongs.

### Verified in the engine (not on paper)

- **The floor road is broken.** 210 launch techniques per void — every jump timing × dash
  delay × double-jump delay — and all three voids resist: short by 163, 143 and 125.
- **The roof road works.** A bot that only walks, jumps and flips clears all three
  crossings in ~6 s each **without ever touching the world ceiling**, losing 0–20 blood.
- **The drop-lock is solvable end to end**: flip → ceiling → keel plate opens its door →
  walk over the bin → mouth on the true slate → right the world → mouth on the floor slate
  → hop the crate → shove it west → **it comes out of the ceiling inside the bin, lands on
  the plate, and the west door opens.**
- **The bin is not a trap**: 3 of 3 attempts wall-jump out in 0.8 s.
- **Roof tops are gone**: the dash-jump mount onto room 2's overhang, which landed 12 times
  in 28 tries, now lands **0 in 84**.
- **The escort survives the voids**: Sera rubberbands across crossing 1 and lands on the
  terrace alive and following.
- **Suite**: `tests/inversion-stage.test.mjs` rewritten to the new contract — 12 tests,
  including the regression guard for the ten-unit slit and the `ceilingOnly` architectural
  guard. The late-game road, platformer, camera and capability suites are unchanged and
  green.

---

## 7.135.0 — the Path of Inversion

The owner's next request after playing the rebuild: a finish like the jetpack path of
pain, but flipped — *"you have to use G to flip gravity and avoid spikes in a narrow,
difficult to navigate path… more width/room than the path of pain, as the gravity flip is
not as precise and has wider standard deviation… about half the size as what the current
level already is."*

Built as **room 7, x 1400-5900**: one channel 4,500 long, floor 40, roof 440, thorned on
both faces, four wards, four checkpoints, no enemies. The region grew to **13,500** — rooms
1-5 moved east by 4,500 and the Void Fissure did not move, so the gate and its seam are
untouched. See the charter for the three numbers that carry it (400 of clearance, banks
wider than 350, one Blood a touch).

**Verified in the engine:**
- A bot that only does what the Path teaches — leave the face you are on when its thorns
  are coming and the place you will land is already clear — **clears all 4,500 units in
  6 of 6 runs, 22 s each, 9-11 flips, taking zero damage.**
- A bot with the full kit that never presses G passes **zero of eleven banks**, in all
  three styles tried (walk, jump-spam, jump+dash). The first bank alone stops it.
- The three voids in rooms 3-4 still resist 210 launch techniques each at their shifted
  coordinates, short by 156-188.
- The drop-lock still works at its shifted coordinates: the keel gate opens and a mouth
  sets over the bin at 6704.
- The hand-offs hold: the drop-lock's door stops you at 6050 until the crate lock is
  open, and from the Path's west end the road runs unbroken to the gate at x 20.

**Two things the build was changed by, both found by the bot and not by reading:**
1. **Ward 4's first shape was impossible.** Two banks sitting *on* each other, 200 wide
   and both faces thorned end to end, needs 244 units of crossing and the kit has 189.
   Staggering them keeps the sentence ("cross HERE") and makes it a thing a knight can
   do: the overlap is 40, which leaves 61 units to leave in on foot and 149 with a dash.
2. **Thorn damage had to go up to a full Blood.** At 14 the Path was a toll, not a gate.

### Not done

- A single bot run from the region's east arrival to the west gate in one pass. Each
  crossing, the drop-lock and the Path were proven separately.
- The room-2 coin's flip-only status is proven by the overhang mount failing (0/84) and by
  geometry (252 up against a 154 double jump), not by a bot grabbing it — my own save had
  already collected it, and zone persistence keeps it collected.

---

## 7.136.0 — the Path rebuilt as a serpentine

The owner played the straight-tube Path and named exactly what was wrong with it:

> "WAY too short and WAY too easy… Right now, you can simply flip to ceiling, walk a
> bit, flip to floor, walk a bit, repeat. Extremely simple, easy, and boring."
>
> "…where the current 'end' is, it should switch from spikes above and below to spikes
> as a wall on the left, so you have to flip up, then travel to the right down another
> windy path — eventually, a wall of spikes to your right appears, you flip to go up,
> then go left to avoid the spikes now above and below you again until you make it all
> the way to the left."

Built exactly that. **Three lanes stacked in the same footprint**, walked west → up →
east → up → west → down: 13,200 units of road where there were 4,400, in the same 4,500
of level, so the region did **not** have to move again.

**The walking was the problem, so the lane now winds.** Thorn banks alone can be walked
past — they only forbid a face, and both faces are always long and clear somewhere. A
**wall** cannot: eight steps to a lane, 500 apart, alternating a pillar off the floor
and a stalactite off the roof, each shutting half the channel outright, each carrying a
300-wide bank of thorns on the half it leaves open. Every step is a change of floors.
Both wall faces are slick, or clinging one would skip the flip entirely.

**Verified in the engine:**
- A bot following only the Path's own rule — *a pillar means run the roof, a stalactite
  means run the floor* — walks the whole serpentine **end to end in 67.2 s with 24 flips
  and zero damage**, and the two turns fire on their own at x 1496 and x 5886.
- Each lane individually: 7–8 flips, 0 hits, ~21 s.
- **A bot that never flips is stopped by the first pillar** (x 5230 of 5700), in both
  styles tried. A pillar is a wall, not a hazard — there is nothing to tank.
- The thorn wall at the lane-A dead end bites: a floor-walker stops at 1496 on 2 hits.
- The shaft drops the whole 868 to the fissure floor and the road runs on west.
- **Zero sky gaps** over the whole Path: lane C's roof is unbroken, so the roof of the
  world is never a road over the maze.
- Suite 762/785, the same 23 long-standing failures, no regressions.

---

## 7.137.0 — the Last Breath, the lash, and a renderer that was lying

Three asks after playing the serpentine.

**1 · "It should damage you at ALL points/parts."** A real render/collision mismatch, and
not one I introduced — `drawSpikes` read a wall band's `len` as the distance its teeth
jut OUT and painted a bar that long lying on its side, while the hitbox `WSp` actually
owns is a `len`-TALL strip only SPIKE_REACH (24) wide against the wall face. The 400-unit
band at each turn drew a 400-unit spear across the room and bit a narrow invisible strip
of it. The renderer now draws what the collision reads: a column of teeth running the
band's full height, jutting 24. Every level's wall spikes were drawing wrong; all of them
are fixed by the same four lines.

**2 · "Amp that up and serpentine will be great."** Twelve **lashes** — bars of thorns
that throw out and pull back on a 2.6 s cycle, hung in the middle of each lane at the one
height where nothing ever rests. A lash cannot touch a knight standing on either face; it
can only hit a **crossing**. So every other gap in the weave became a moment as well as a
place: wait for it, then go. The verified serpentine run went from 67 s to 80 s.

**3 · "Completely spikes… absolutely nowhere to land. Nowhere."** **Room 8, The Last
Breath**: 2,600 units of curved tube with thorns on both walls for its whole length,
entered off the end of lane C with no ground between, and left by falling through the
Fissure's own roof — which is `ceilingOnly`, so it catches nobody from above — into the
safe end room with the recollection, the Zenith socket and the gate.

### What the tube cost to get right

- **A hairpin is impossible here.** The walls are axis-aligned blocks stacked under a
  sampled curve, so where the curve goes near-vertical the blocks of neighbouring samples
  stack into the channel: a folded-back tube closed a 460 channel to **78**. It runs one
  way, and earns its length from the 2,600 the region grew instead.
- **The curve is sloped to what a falling body can trace.** Nothing holds the knight up
  but the flip, so the line flown is a chain of ballistic arcs — about 70 either side of
  the middle, 179 units of ground a swing. The first cut swung 260 over 240 (a slope of
  1.08) and **no flown line survived 500 units of it**. What ships swings ~150 over 240,
  reads as 0.6, and flies.
- **The walls are one-way platforms, so a thorn hit drops you out of the tube** and the
  checkpoint takes you back. That is the retry loop, and it is why the channel had to be
  460-560 rather than the 300 a first pass gave it.
- **It is flown on a cadence, not a calculation.** Every predictive controller I wrote
  thrashed; a steady twelve-frame beat with a nudge toward the channel's middle clears the
  whole tube in **13.1 s, 43 flips, 3.3 a second, 4 runs of 5.**

### Verified

- Tube channel **461-560 throughout**, never below the 224 it had to beat.
- The hand-off: walking off lane C at 4072 enters the tube **mid-channel at 868**.
- The exit: dropping from the west mouth lands at (1252, 0) on the Fissure floor, and the
  road runs on west past the socket to the gate.
- The serpentine still clears with the lashes in it (80 s, 22 flips, 1 hit).
- Deck holes are exactly the two turns; lane C's roof is unbroken.
- Suite 765/788 — the same 23 long-standing failures, none new.

### One mistake worth recording

The bulk coordinate shift was applied with a regex over the **whole file** instead of the
Inversion's own block, and it moved **86 enemy positions in other regions** — Black Woods,
the Outskirts, the Gaol. The suite caught it (six new failures in levels I had not
touched), and the inverse transform was safe to apply because the shift had a clean
signature. The object-by-object dump verifies the *level*; it does not verify what a
regex did to everything else. Scope the edit, not just the check.

