# Bonus · Void Stone (labels V1–V6, 7.255)

A bonus demonstration set: Celeste's dream block, in the fiction of the abyssal gate walls. Files:
`public/bladefall-pcore-dev-void.js` (rules) and `-void-view.js` (drawing), `public/bladefall-pcore-part-902-bonus-void.js`
(part key `BV`), `scripts/verify-precision-part-902.mjs` (rule fixtures, routes, wrong strategies; about 2.5 minutes).

**The device (glyph `V`).** Void stone is solid to everything: you stand on it, climb its face, the lantern rests on it.
A dash that meets it carries the knight straight through at dash speed, the way he was dashing, with no gravity and no
steering. Coming out gives the dash back and keeps the speed (a sideways exit carries through the air like a fling, an
upward one throws you higher than a jump). Off a level or falling exit you get six frames of jump grace, as if jumping
off its edge. Rock, the room's wall or any solid body (a jailer) in the way inside is fatal.

## The rooms

| Label · room | Question | Wrong answer that fails (count) |
|---|---|---|
| V1 · Into the Night | Two walls of night and no ground between them: what does the dark give back? | Through the first wall, then jump, wait or hang on the second wall's face over the thorns (165 tapes, 0 succeed). Beam search with no void: none. |
| V2 · Kept Speed | The shelf is out of reach and the thorns are longer than a dash: what does the dark keep when it lets go? | Jump and dash across the thorns from the floor, with a second jump (240, 0). Jump and dash up to the shelf without the slab (144, 0). Beam search with no void: none. |
| V3 · Which Way In | Straight in falls short and straight up lands on thorns: which way in comes out on the ledge? | Straight right, straight up or down-right, each followed by any second dash (1152, 0). Beam search allowing anything but an up-right entry: none. |
| V4 · Rock Behind | Rock waits behind most of each wall of night: at what height do you go in to come out clear? | The first wall from the floor or on a slant (66, 0). The second wall at the top of a jump, the line that worked on the first (88, 0). Beam search with no void: none. |
| V5 · Behind the Shield (jailer) | The jailer faces you over thorns and the roof of his cell is night: where do you come down? | At him from the front with jump, dash, cut or parry (297, 0). Down through the roof on top of him (12, 0; his body is solid inside the dark). Beam search allowing anything except coming down behind him, blade and parry included: none. |
| V6 · Night Crossing | There is no ground between the ledges: what gives you each next dash? | Leave out any one of the four dashes and wait longer instead (16, 0). Beam search for anywhere to stand between the ledges: none. Beam search with no void: none. |

Rule fixtures at the top of the verifier (21): pass-through; walking and jumping into it stop; the dash back in the air and the
speed kept for ten frames; that dash spent at once; a dash pressed inside fires as you come out; rock fatal, the room's wall
fatal, rock behind part of the face survivable on the clear line; the upward throw (30 px above the slab against a jump's
28, no jump grace to cut it short); standing on it; level-exit jump grace (3 frames after: yes; 9 frames after: no); a
diagonal pass; climbing its face; thorns on the far face pointing your way are safe, pointing back are fatal; the lantern rests
on it; a gravity prism and a void taken in one dash.

## What the player does and feels

- **V1.** A wall of night to the ceiling. You dash at it and come out the far side over a small thorn pit, straight into
  a second wall. The dash is there again, and you go through that too. The window for the second dash is wide: you can
  hang on its face as you slide down. You learn that the dark never asks how many dashes you have.
- **V2.** A slab of night hangs through a shelf you cannot jump to. Jump under it, dash up, and the dark throws you out
  on top. A second wall of night stands at the shelf's edge over a long thorn floor. Dash into it, and you sail across
  the thorns at full speed without touching a key. The first time, it feels like being thrown.
- **V3.** One block of night with thorns on its crown and its far face, a ledge up and across. Going in straight, you drop
  short of the ledge's thorned face. Going in straight up, you come down on the crown. Up-right carries you out of the far
  corner and onto the ledge. The success band is wide (about ten frames by a few tiles of run-up). This room is about
  reading the angle, not about timing.
- **V4.** Two walls, each with rock showing behind it. The first is clear only at jump height, so you jump and dash. The
  second is clear only at the floor, so the habit from the first wall kills you. Short retries.
- **V5.** The Gaol's jailer, facing you across thorns under a long roof of night. You climb the roof's face and walk
  along the top. Dash down behind him and you land at his back. Turn and cut him before he turns round, and the gate
  opens. Dash down on top of him and you die in the dark.
- **V6.** From one ledge to the other with nothing to stand on: right through a block, up-right into a second, right
  into a third, and right into the tall last wall. Every exit hands you the next dash. The thorned crowns rule out resting
  on top, so the rhythm stays in, out, in, out.

Difficulty: V1–V2 gentle, V3–V4 gentle to medium (one read each), V5 medium (climb, drop, then a turn before his commit
time), V6 medium (four dashes with no ground between them, each window several frames wide).

## What the sweeps caught, and the fixes

- **The seed room (one wall, thorns right after it)** died on the exit every time: at floor level, the thorn strip
  overlaps the knight's hurtbox. Redesigned as V1. The pit is lower than the exit, and the second wall reaches down into it.
- **V1, first redraw:** a knight sliding down into the pit met the floor's rock beside the second wall before the void,
  and so could not enter. The second wall now reaches the pit, the start floor is raised two tiles, and the pit stays
  clear of the hint bar.
- **V2:** the second void stood one tile in from the shelf's edge, so the knight came out on the shelf and ground friction
  ate the speed. The void's face now lines up with the edge, and the shelf's face is thorned so it cannot be climbed.
- **V3:** the beam search hypered into the gap, wall-jumped off the void's far face and climbed it onto the ledge. Thorns
  now line that face. They point outward, so coming out through them is safe.
- **V5:** the beam search grabbed the jailer's shield (his body is solid, so you can hold it) while hanging over the thorns,
  parried his thrust and cut him. The cell is now closed on the left. The only way in is the roof.
- **V6:** the search stood on top of the first block after climbing its face. Its crown is now thorned, like the second's.
- **Tape timing:** the core reads a dash's aim when the freeze ends, so diagonal dashes on tapes hold the direction for
  five frames.

## Device changes (my module)

- The exit check now runs pixel by pixel. The knight is out the moment he clears the void. Before, the rest of that
  frame's travel was still taken in void rules, so rock two pixels past the face killed him.
- A dash that only grazes a corner and never goes in carries on as a dash. Before, it would have handed out a free
  refill.
- A dash pressed inside is buffered as usual and fires on the frame you come out. Before, it was swallowed.
- Jump grace is given only off level or falling exits. A jump after an upward exit would have replaced the 240 px/s throw
  with a 105 px/s jump.
- While travelling, the knight's speed reads as the travel speed for the rest of the frame, with remainders set so the
  core moves him nothing. Thorns pointing the way he goes are then safe, as everywhere else.
- The dash refill on exit goes through `refillDash`, so the view's dash flash and sound play.

## Dropped designs

- **V5 with the lantern** (the lantern cannot dash): it was to slide under the wall of night through a one-tile slot. A
  thrown lantern flies about 90 px before it lands, and it slid in only from one narrow band of throw points. Dropped for
  the jailer.
- **A down-through finish for V6**, with the last void as a roof you dash down through. Thorns on its top kill a
  knight dashing down into them. Without thorns, it is ground, and the third exit's refill no longer matters. Replaced
  by a tall last wall you must dash into from the air.
- **Gravity prisms** in a room: void travel is not a dash, so a prism inside a void's path does nothing. Only the
  prism-then-void fixture is kept.
