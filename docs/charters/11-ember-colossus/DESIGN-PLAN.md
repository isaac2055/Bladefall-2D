# The Foundry — "The Furnace General" design plan

Status: design, 2026-09-17. This charter covers the **region**. The Ember Colossus
fight is deliberately out of scope here and keeps its existing wet-forge circuit
(slate floor, escort-free outlet, quench channel, forge) unchanged in shape.

## What exists and must survive

Entry is the Deep Stair from Emberdeep. The player owns everything through
Companion Command. The Foundry awards **Downward Strike**, which by the ability
table is a *"combat-movement verb and foundry breach"* — both halves, not one.

Per owner approval (2026-09-17) the strike is granted at a **protected midpoint**
rather than after the kill, so the region can teach it, test it, and combine it
before the arena — the acquisition rule the master vision sets out. The Sealed
Recollection is **The Furnace General**.

## The idea this region owns

Emberdeep taught that ground is not finished. The Foundry answers it:

> **Local rule: you are the last machine on the line. Here you make ground.**

Where Emberdeep's slag was borrowed footing that sank away, the Foundry hands the
player the verb that **fixes it**:

- **Downward Strike compresses setting slag into permanent cold stone.** Strike a
  slab while it is in its slick setting window and it sets hard, forever. Miss the
  window and it sinks like any other slag. The region's whole traversal grammar is
  *make your own floor, on the clock*.
- That is the same verb as the breach — brittle casting caps still shatter — but
  the interesting half is constructive, not destructive, and nothing else in the
  game does it.

Second primitive, unique to the Foundry: **the casting line.** Conveyor slabs
(`belt`) carry moulds through the works. They are moving ground with a direction,
and they feed the pour — ride them, or strike a casting on one to stop it.

## Spatial outline (~16,600 units, six rooms)

Rooms 2 and 3 **swapped** in the Run 2 rebuild (2026-09-18). The work order's
teaching chain makes the Casting Line the *test* of the strike, which cannot come
before the grant. The Anvil is now second and the Casting Line third.

| Room | Range | Player experience |
| --- | --- | --- |
| The Receiving Floor | 0–2800 | Arrival off the Deep Stair into a works that is running. The casting line introduced flat and safe: stand on it, ride it, step off. Refuge and Oren. |
| The Anvil | 2800–6200 | **Downward Strike granted**, protected, then spent twice: a counterweight gate a ladle keeps re-melting open, and a three-slab climb whose steps do not exist until you make them. |
| The Casting Line | 6200–9200 | The conveyor as real traversal — it runs against you, and three moulds stand in it as holes. One ladle walks those three; refuse it twice and the line stalls. A wall-jump chimney is the dry route onto the crossing's middle. |
| The Mould Hall + The Sluice | 9200–12280 | Combine, on two planes: you on a bed of four, a walking feeder beneath it. Three refusals and it seizes, and its wreck is the only step east. Then the Sluice — a mould whose setting window is too short to strike, and a coolant header to carry the cold to it through your pair. Sealed casting caps hide the optional cache. |
| The Casting Pit | 12280–15400 | The Colossus arena, unchanged in shape. Its approach is authored: an overlook that shows the outlet, the quench and the forge as one readable line before commitment. |
| The Fissure | 15400–16600 | A cracked casting floor sealed by three caps in the GROUND. Break through and the fall is the crossing to the Inversion — a physical seam, not a portal. The Furnace General recollection sits on a ledge inside the mouth, which catches you as you drop. |

## People and story

Oren again, and this is where his thread ends for the chapter: he came to read the
machine and the machine turns out to be an officer. **"The Furnace General"** is
the recollection title, and the delirium's logic is that the enemy commander who
ordered the knight's poisoning is rendered as the thing that casts the army.
Nothing states it. The evidence is the scale of the moulds in Emberdeep, the
standing orders, and a general shaped like a furnace.

## The recall

The Foundry's unique Muster unit is the **cinderling**: light, fast, and it leaves
a burning pool where it dies — so *where* you kill it edits the floor. It is the
inverse of the slagwright, which gives ground; this one takes it away. Ordinary
bodies carry the world-wide baseline.

## Rules this region must not break

- The arena's internal geometry and the wet-forge circuit stay as they are. This
  charter does not reopen the fight.
- The strike is granted at a protected midpoint, demonstrated safely, then
  required only where a miss costs a retry and never progress.
- Conveyors, moulds and pours all have visible drive and a reason to be there.
- No completion portal at either end. Deep Stair in, fissure out.
- Density target ≈ 6 objects per 1,000 units.

## The ladle (Run 2)

The region's own pouring machine, and the Colossus's whole sentence at one tenth
the scale. It rides a rail (or walks, as the Mould Hall's feeder), goes to a
mould, **gathers** — which holds that mould in its setting window, so the strike
being offered is always there — and then **pours**. A pour into open stone fills
the mould and reopens it under you. A pour onto stone you have already set is a
refusal it cannot survive: it recoils, vents cold, and jams. `seizeAt` refusals
and it stops for good, and whatever it drives stops with it — the Anvil gate's
weight drops (1), the casting line stalls (2), the feeder seizes and becomes the
step across (3). An aimed mould wears the fight's own collar and chevrons, drawn
by the same `bankedCollar`, so the arena's one unreadable tell has been read a
dozen times before the fight asks for it. See `updateFoundryLadles`.

---

## OWNER CUTS (2026-09-19) — these supersede the room plans above

Played and reviewed by the owner. Decisions, not drafts. The principle behind all of
them: **every section is mandatory, or it is cut.** Optional side routes, coin climbs
and chimneys read as clutter and as ways to skip the lesson.

- **The climb is over lava** and is the only way up (4480-5400). The floor stops under
  the first slab (its underside is at 124: a jump from a lava edge bonked into it).
- **The coin climb is gone** (the chimney and the perch off the climb). So are the dry
  route over the casting line and the sealed-mould cache. The Vault counts one coin
  per stage, so the Foundry keeps exactly one: over the third line mould, a double
  jump while it is solid.
- **The climb comes down onto the casting line** (5500-6880), one lava floor from the gate
  to the far bank. Four moulds, each setting one beat after the one behind it: wait
  for stone, then go. Three tracks between them run west at 3.5x (455 u/s) and throw
  you in. Refuse the ladle twice and the line stalls, making the tracks a road. The
  ladle's pour on the line holds a mould open, then hands it back to its own clock,
  so the rhythm survives. The ladle is slower, with a 1.8 s warning and a 2.8 s rest.
- **The Feeder cannot be skipped.** Distance can't enforce it: the full kit crosses about
  1,100 units of lava because an air dash carries roughly 500 u/s. So the far bank is
  gated and the gate is held by the Feeder (`foundryFeederGate`). Its 400-wide wreck
  spans the 760 gap in a 218 hop and a 142 hop, each a plain double jump in both
  directions. The seizure latches `foundry-feeder` so the road back west still works.
- **No water anywhere.** The Sluice (its header, slates and quench mould) and the arena's
  coolant tank are gone; the gap the Sluice bridged is floor now.
- **No chimneys anywhere**, including the last one by the fissure.
- **The lava pits sit just below the floor** (h 104 → 64). At 104 the surface stood 34
  over the floor, and standing within half a body of an edge counted as lava.
- **Engine fixes this needed:** a belt that carries you off its end throws you with its
  speed, and the ledge assist never catches you back onto the belt that carried you.
  Before, running against a strong belt parked you at its lip forever.
- **Phases 2 and 3 of the fight were replaced (7.133.0).** Phase 2 is a vertical escape
  from rising metal, and phase 3 is a pursuit you win by breaking three plates with
  three verbs. The old conveyor bed, fronts, last order, lid, sluice shelf and Oren's
  sluice pad are gone. `BOSS-PHASES-PROPOSAL.md` has the design and an "As built"
  section. Phase 1 is unchanged.
