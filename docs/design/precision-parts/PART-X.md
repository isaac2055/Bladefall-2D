# Part X · Emberdeep (levels 99–106)

Files: `public/bladefall-pcore-part-099-emberdeep.js` (rooms and tapes), `scripts/verify-precision-part-099.mjs`
(routes, wrong answers, hunts, one clock check). Device: `public/bladefall-pcore-dev-ember.js` (heat slab `E`,
`slabs:[{stone,molten,glass,start,offset}]`). **No device module was changed** in this pass.

**The region's one new thing** is the heat slab on the pour schedule: stone (floor and wall), molten (kills from
any side, and takes the lantern home), glass (a floor from above, a door from below and the side). It runs on the
room's clock, never on your dash, and pips count down to the next change. It mirrors Emberdeep's heat-state slabs
(lava → glass → stone) and the pour schedule. Old friends that return: the lantern (101, 106a), the zip lift (102,
106b), the seed pod (103, 106b), the portal (104, 106a), the spitter (105). Every room is a `study` room: the clock
starts with your first input, so you can read the pips first.

**Where the summit is.** The guideline names 99 as "Emberdeep's close", written when Emberdeep was expected to end
at 99. With eight levels a region, Emberdeep runs 99–106, so 99 is its *opener* and follows the sawtooth (easier than
the White Court's close, 98), and **106 The Pour is the summit**: a two-room level, each room a checkpoint, a little
harder than 98.

## The levels

Counts are from `node scripts/verify-precision-part-099.mjs`. "Hunt" is an adversarial beam search that forbids
the device; the verifier runs small beams, and the long offline searches listed under *What the sweeps caught*
were run at beam 1000–1500, depth 60–80.

| Level | Room | The question | The wrong answer that fails (machine-checked) |
|---|---|---|---|
| 99 | Cooling Road | Each slab sets a beat after the one below it, and none of them holds for long. Where do you wait? | Climb the stair without stopping on a slab, any start and hop rhythm, with or without dashes (1,248 tapes, 0 exit). Hunt: no way up the ledge's face without the top slab. |
| 100 | Glass Door | Stone stops you from below and molten burns. What lets you through, and when do you jump? | Hop up the shaft as soon as you land (408, 0). Climb the walls straight up through the doors (153, 0). The slabs span the shaft, so there is no hunt. |
| 101 | Slow Fall | The ledge melts long before the floor sets, and nothing in between will hold you. Where can you wait? | Drop down the shaft without the light, any time (153, 0). Throw the light down and follow it (153, 0). Hunt: no way to the plate without gliding down with the light. |
| 102 | Two Doors | The lift runs when you step on and not before. Which door do you wait for? | Board as the near door turns glass (40, 0). Hunt: no way over the thorns but the lift. |
| 103 | Pod Hours | The slab you wake on melts long before the far one sets. What holds you up for as long as you like? | Jump and dash across without a pod, any start (344, 0). Hunt: no crossing without the pods. |
| 104 | Open Window | A shot passes the window when it is not stone; it holds you when it is not molten. When do you fire, and when do you follow? | Fire while the window is stone (114, 0). Fire as it melts and follow at once (30, 0). Hunt: no way up but the portal. |
| 105 | Glass Underfoot | The stone that opens the gate is sealed under the slab. What passes through it while it still holds you? | Parry the first bolt down through stone (51, 0 light the stone). Stand on the slab and wait for it to open (36, 0). Clock check: over 2,400 frames every bolt crosses the slab on stone or glass, never molten. |
| 106a | Carried Down | Your shot needs the window open, the light needs it shut under you, and you cannot fire with the lantern in hand. In what order? | Pick up the light first, then try to fire (78, 0). Fire while the window is stone (49, 0). |
| 106b | The Last Pour | The slab you wake on melts, the roof opens late, and the lift's door keeps its own time. Where do you wait each time? | Up through the roof without the pod (248, 0). Hunt: no way through the roof without the pod. |

Hints appear only in 99 (the slab and its pips) and 100 (glass as a door, stone that waits for you to leave).

## What the player does and feels

- **99 Cooling Road.** Four slabs climb to a ledge, and none is floor for long. The first try is a run up the
  stair, and the second slab is molten when you arrive. Then you watch the pips and see the beat: each slab sets
  a moment after the one below it. You hop, wait a breath, hop again. It feels like walking up a clock.
- **100 Glass Door.** A shaft of five slab doors. You learn that glass lets you up through it and that stone
  closes over your head. The trick is to jump just as the door above turns glass. Once you have the timing, it is
  a steady climb, and the last door, sideways at the top, opens as you reach it.
- **101 Slow Fall.** The ledge melts under you, the floor far below is molten, and the shaft between is lined
  with thorns. The lantern is the answer: you step off holding it and float down so slowly that the floor has set
  by the time you land. Then the light goes on the plate, and you walk out through the door it holds.
- **102 Two Doors.** A lift across a thorn floor, two slab doors on its path. The near door is the tempting one
  to watch. The far door is the one that matters, and you board when the ride will meet it on glass.
- **103 Pod Hours.** You wake on a slab that melts, and the far one stays molten for five seconds. Two pods hang
  over the pit. You cut down on one, and again, and again, bobbing in the air until the far slab cools. Then you
  dash over and land on glass.
- **104 Open Window.** One small slab is both your window and your floor. The shot goes up through it while it
  is molten or glass. You come down on it while it is glass or stone. You fire during glass, step into the floor
  portal at once, and drop out of the roof onto the window just as it sets.
- **105 Glass Underfoot.** The spitter's first bolt comes while the slab is stone. You turn it away, and the slab
  melts, so you stand back and wait. The second bolt comes while it is glass. You stand on the glass and send the
  bolt down through it onto the stone below. The gate opens.
- **106 The Pour.** In *Carried Down*, the order matters: shoot through the window while it is open, fetch the
  light, and ride down through the roof onto the window as it sets. Then the light goes on the plate. In *The Last
  Pour*, you wake on a melting slab again. You hover on the pod until the roof turns glass, pass up through it,
  and ride the lift through a door that keeps its own time. It is the whole region at once, in two short rooms.

**Difficulty curve (intended).** 99 easy (below 98), 100 easy–medium, 101 medium, 102 easy–medium (a breather
before the pods), 103 medium, 104 medium, 105 medium–hard, 106 hard (two rooms, each about a 103/104). Momentum is
never needed. Enemies appear in one room (105). Portals appear in 104 and 106a.

## What the sweeps caught, and the fixes

- **105 could be skipped in a second.** The gate only covered the bottom half of the corridor, so a jump cleared
  it. The gate now spans the corridor. A long hunt also found a knight skimming in the air over the *molten* slab
  and parrying a bolt down through it. The slab's cycle is now exactly two volleys long (120 stone, 60 molten, 60
  glass against a bolt every 120 frames), so every bolt crosses on stone or on glass and never on molten. The
  verifier checks this directly. New tape: turn away the first bolt, wait out the melt, parry the second through
  the glass.
- **103 was crossable by a hyper.** The far slab started as stone for 80 frames, and hypers reached it before the
  wake slab melted. The far slab is now molten from the start (337 frames). A second hunt then found a hyper to
  the rock over the far slab and a cling there until it set, so that face is now thorned. The end of the tape was
  re-cut so the landing avoids the new thorns.
- **101: clinging to the shaft wall.** A hunt threw the light, clung to the shaft wall until the floor set, and
  caught the light on the way down. The shaft walls are now thorned, which the question already claimed
  ("nothing in between will hold you").
- **106b: clinging to the hall wall.** A hunt waited on the hall's left wall instead of the pod, then passed up
  through the glass roof. That wall is now thorned.
- **99: the top slab could be skipped.** A small hunt climbed the ledge's face from the third slab, using a
  wall-bounce off the left wall. The face is now thorned from its top tile down. The next hunt jumped and dashed
  straight from the second slab to the ledge. The ledge is now one row higher and one column farther, so only the
  top slab reaches it. The last hop of the tape is now a jump and an up-dash. (The hunt's check first saw only the
  end of each step, so it now also rejects any landing on the top slab in the middle of a step.)
- The verifier used to check only 99. Every room now has at least one wrong-strategy family.

## Designs dropped

- A hunt for 100 was dropped: every slab spans the shaft wall to wall, so there is no way round a door.
- A family for 105 that counted "no stone lit without standing on the slab" was replaced by the clock check.
  The only remaining way to light the stone from the air is a parry while falling onto the glass, which answers
  the room's question.

## Open points

- **Runtime.** The last full run was `30 passed, 0 failed` in 2 min 22 s of wall time (135 s CPU) on the shared machine.
- 106b's lift door (the first slab, `stone 60/molten 90/glass 45`) was not re-tuned. The tape meets it on glass
  with a comfortable margin.
