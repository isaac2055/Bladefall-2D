# The Fractured Tyrant (stage 33), built 2026-09-25 (7.213.0)

## Refinement — 7.220.2 (2026-09-25)

Pulse warning uses the gameplay radius/tell and steady boundary brackets. Completed Tearer remains visible; retry clears pulse/volley timers and dialogue. Pulse render and completed reload reviewed.

Part of the final nine-region batch: 78 focused tests passed; all18 modules passed syntax
checks. Browser fixtures reviewed changed cues, death cleanup and applicable completed
reloads. These are scoped checks, not new full-route or co-op verification. Authored
geometry/timing retained. Local mirror only; no deployment.

Act Three's thirteenth echo: the Citadel after the Echo walked it backwards. The Tyrant travelled by tearing
the room open. In the echo the tears are all that is left of him, and they do not stay open. The original was
walked east to west, so the echo runs west to east.

**The kit** is the one the Citadel was entered with: everything through the gravity flip. Like its original,
this Citadel never turns the flip on. No ability waits here; the original gave none either.

**The Muster applies.**

**Code:** `public/bladefall-fractured-tyrant.js` and `-art.js`.
- **Stage and seams:** stage 33, zone `fractured-tyrant`. The seam `fi-ft` comes from the Inversion; the east
  seam `ft-fk` opens once the Tearer is torn.
- **Rest site:** `tear-ash` (The Mended Hearth).
- **Music:** `fractured-paradox-void-assault.mp3` on the road, and `fractured-heat-of-battle.mp3` for the
  Tearer. "Heat of Battle" was the Brute's theme the owner supplied, and was unused.

**Engine parts reused:**
- rideable seams ("tears": dash into a mouth, ride at 1150, thrown on at 640 with the dash and air jump back
  after 0.28 s; `period`/`upT` to blink, `once` to spend);
- the seam carry (a mouth taken off a tear throws you at 1200, with 1100 of lift out of a side mouth);
- slate walls for the player's mouths;
- `authoredEcology`, so no variant enemies are seeded.

**Built here:** the teeth that rewind (drawn spikes and a fall), and the Tearer.

**Shared change:**
- **The Fractured core's `muster()`:** an enemy with no patrol got undefined Muster bounds. The engine clamps a
  mustered body to them every frame, so its x went NaN the first frame it moved. It now falls back to 240
  either side of its spawn. The earlier echoes gave every enemy a patrol, which hid the bug.

## The B-side
| Room | x | The original | The echo |
|---|---|---|---|
| The Torn Road | 0–1900 | the Fissure Mouth (a face ladder, one seam over the void) | a shielded crownguard, then one steady tear across a 1000-wide void (two dashes make 677) |
| The Blinking Chain | 1900–4700 | the Rising Ledgers | two steps up (rises of 120) to three tears stepping down over a 2300-wide void. Each is open 0.7 s of 2.4, and each opens 0.8 s after the one before, which is a ride plus the flight to the next mouth. Take the first as it opens: its exit gives the dash back after 0.28 s, and you spend it on the next mouth in the air. Measured window: 0.6 s |
| The Spent Line | 4700–7850 | room 4 (both mouths on the east face, a tear thrown into one, flung over the spike bed) | the same room walked the other way. You walk under a raised slate face, cling to its east side, and set both mouths (one near the tear's height, one above). A tear from the lip of the teeth runs back into the face. Ride it into the lower mouth and the upper one throws you ~2050 over the 1400 of teeth, landing at 7284–7341 wherever you set it (300–520). The teeth rewind you like a fall |
| The Tearer | 7850–9350 | the Hollow Crown (the paradox bands, the Echo duel) | **the C-side** |

## The C-side: the Tearer
What the Tyrant left of himself: a knot where a room was torn open too often. Steel goes through it and finds
nothing (`portalGate` never opens). Only a tear passes through it.

The cycle: it rests and glides away from you; it settles; its tear shows, faint and trembling, for 0.8 s; the
tear opens and it holds still. Ride the tear through it for the blow, once per tear. Meanwhile it fires volleys
of void bolts (3 or 5, every 3.2 / 2.6 / 2.2 s). From the second act it also strikes the floor where you stand
(0.9 s tell); jump it. Two blows in each of three acts:

1. **From the floor:** the tear rises from a mouth on the floor on your side, through it.
2. **From a perch:** it hovers high. The tear runs level from the edge of the perch nearer you. Each perch
   stands against a wall, with a step on the hall side; both are a double jump (rises of 110 and 120).
3. **Off a lift:** a first tear lifts you off the floor and is spent. The second begins 100 on, in the air, and
   runs through it: dash on, off the lift, after the 0.28 s lock.

Leaving the hall resets the fight; a finished act is kept.

## Verified (scripted input in the browser; not a human playthrough)
Chained with the Muster on, from spawn to the end card ("THE FRACTURED KING") in 82 s:
- past the crownguard, the road, the steps;
- all three chain tears;
- both mouths set by clinging (at 145 and 305);
- the throw;
- the Tearer in 48 s.

Separately:

| Section | Result |
|---|---|
| Chain, first tear entered 0.0–1.2 s after it opens | crosses at 0.0–0.5 s, falls at 0.6 s and later |
| Spent Line, mouths set by clinging | 3/3, landing 7284 |
| Tearer, from three entry points and times | 3/3 in 39–58 s. The bot took 4–6 hits: it never dodges the volleys |

Changed while verifying:
- **The chain's open time:** 1.2 s let a 1.1 s entry window through. Now 0.7.
- **The chain's steps:** first 140 and 280, then 120 and 240 (a double jump is 147).
- **The hall:** the throw landed at 7300, in the hall, so it moved 600 east.
- **The perches:** first 280 over 140 steps, beside the bars, with no room to jump from beside them. Now a
  110 step on the hall side and a 230 perch against the wall.
- **The lift:** the knight dashed straight back into the lift's own top end (it drifts ~25 in the dash lock).
  The lift is now spent, and the heart's mouth is 100 on.
- **Seeded enemies:** the level lacked `authoredEcology`, so the engine seeded a rifthound, a sporecaster on a
  perch (with its own slate and rune receiver) and a stormmote.
- **The first crownguard's x went NaN** (the core bug above).

## Open
- Owner playtest: whether "take the first tear as it opens" reads from the steps (the second and third are
  off-screen when you go), and whether the face reads as the place for both mouths without a sign.
- The volleys are the Tearer's only pressure on a knight who waits. A human will be hit more than the bot's
  4–6 if they don't dodge or counter.
