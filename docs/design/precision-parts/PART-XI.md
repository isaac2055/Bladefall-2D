# Part XI · The Foundry (levels 107–114)

Files: `public/bladefall-pcore-part-107-foundry.js` (rooms and tapes), `scripts/verify-precision-part-107.mjs`
(routes, wrong answers, hunts). Device: `public/bladefall-pcore-dev-foundry.js`: anvil `N`, belts `{ }`, mould
`U`. **No device module was changed** in this pass. Room 113 also uses Emberdeep's heat slab
(`bladefall-pcore-dev-ember.js`, unchanged).

**The region's one new thing** is the anvil, the precision mirror of the Foundry's downward strike. Cut down on it
and it throws you far higher than a pod (330 px/s against 210) and gives the dash back. A cut from the side only
rings. The works' machinery comes with it and is taught in its own rooms: casting belts, which carry you and the
lantern at a walk, and moulds, empty frames that set into iron for good when struck.

**Two gates** (`bladefall-gate-trials.js`, unchanged): the Anvil Gate (107–110, behind the counterweight gate)
teaches the anvil, the pod pairing, the mould and the belt. The Casting Gate (111–114, on the fissure floor after
the Colossus falls) combines them with older devices: a spitter and a husk (111), a portal (112), Emberdeep's pour
floor (113), then pods and a portal with a lantern and a grille (114).

## The levels

Counts are from `node scripts/verify-precision-part-107.mjs`. The verifier runs small hunts (beam 100, depth 40).
The long offline hunts, listed under *What the sweeps caught*, were run at beam 1000–1500, depth 60–70.
Momentum (super, hyper, ultra) is optional before 150. Where a hunt or family excludes it, the label says so, and
the kept momentum lines are listed.

| Level | Room | The question | The wrong answer that fails (machine-checked) |
|---|---|---|---|
| 107 | First Stroke | The ledge is higher than any jump and dash. What here answers a cut from above? | Run, jump and dash at the ledge from the floor or the anvil top (288 tapes, 0 exit). A side or upward cut only rings (66, 0). Hunt: no way up without the anvil. |
| 108 | Iron and Seed | A pod and an anvil hang over the thorns under a roof of teeth, and another anvil waits where the roof ends. Which do you cut? | Cut down on the pair under the teeth (84, 0). Jump and dash for the iron without the pod (198, 0). Hunts: none over the teeth without the pod (no momentum); none up without the far anvil. |
| 109 | Cold Cast | The anvil throws you over the teeth, and there is nothing on the far side to land on. What will hold you, once you strike it? | Over the teeth without casting a mould (462, 0). Hunt: no way across without a cast. |
| 110 | Passenger | The door over the anvil opens only while something rests on a plate at the end of a tunnel too low for you. What can go where you cannot? | Cut the anvil with the door shut (68, 0). Hunt: no way out without letting go of the light. |
| 111 | Down the Shaft | Bolts fall down the anvil's line, and the way out is sealed high on the far wall. Where must you be to send one there? | Parry from the floor at any aim (88, 0). Hunt: no way to break the husk without the anvil. |
| 112 | Sideways | The anvil throws you only up, and the far ledge is across the pit. Where do you put your end? | Your end over the anvil, but in by a jump or a dash (192, 0). Your end anywhere else on the stone, then the anvil (30, 0). Hunts: none across without the anvil; none without the portal. |
| 113 | Iron Island | The floor holds for a moment at a time, the far side is two moments away, and the roof is too low to jump. Where do you wait out the pour? | Run the whole floor in one window, dashing as often as the dash comes back (492, 0 without momentum). Wait on the floor or in the air and never strike (378, 0). Hunt: none across without casting the mould (no momentum). |
| 114a | Three Strokes | The anvil throws you short of the pod, the pod short of the ledge, and the mould holds nothing until it is struck. What does each cut give you? | From the pod straight for the ledge, with no cut (117, 0). From the anvil straight for the mould, with no pod (308, 0). Hunts: none up without casting the mould; none without the pod. |
| 114b | Grille | The belt carries the light through the grille into the orange end, and you cannot follow it. Where must it come out? | Carry the light up the block yourself (132, 0). Send the light in before your end is open, and walk away (27, 0). Hunt: no way to the plate except by the light passing the portal. |

Hints appear only where an object is introduced (107 anvil, 108 pod against anvil, 109 mould, 110 belt, 111
parry aim and husk). 112–114 have none.

## What the player does and feels

- **107 First Stroke.** A ledge you cannot reach and an anvil on the floor. You jump, cut down, and are flung
  higher than anything so far. It is the Foundry's first "oh".
- **108 Iron and Seed.** You start on a pillar over thorns, under a roof of teeth. Cut the pod and it bobs you
  across under the teeth. Land on the iron pair, but don't cut it, because it would throw you into the roof. Walk
  on to the far anvil where the roof ends, cut down, and ride it up to the walk.
- **109 Cold Cast.** The anvil throws you over a wall of teeth into open air. You strike an empty frame as you come
  down past it, and it sets under your feet. Then you do it again.
- **110 Passenger.** You set the light on the belt, and it rides off into a tunnel you can't enter, onto the plate.
  The hatch over the anvil opens and you go up through it.
- **111 Down the Shaft.** The spitter fires straight down the anvil's line. You ride the throw up into its bolts
  and parry one sideways, high across the room into the husk.
- **112 Sideways.** A low bay, an anvil, and a stone ceiling, with the orange end high on the far face of the bay's
  block. You put your end over the anvil, jump, and cut. You shoot up into the ceiling and out of the wall,
  sideways and fast, in a long arc over the pit, under a roof of teeth, onto the far ledge. If you just jump into
  your end, you drop out of the wall and fall short. That makes the anvil's speed clear. (The room deliberately
  echoes Part VI's spring into a portal. The anvil throws much harder.)
- **113 Iron Island.** The Foundry's floor runs on Emberdeep's pour clock: solid for a short beat, molten for a
  long one. The crawlway is too low to jump in, and too long to cross in one beat. Halfway along, the floor has a
  hole with an empty mould in it. You run out on the first beat, strike the mould, and it sets into a single tile
  of iron. You wait out the pour on it, with the floor glowing on both sides. On the next beat, you run for the far
  side.
- **114 The Casting** (two rooms, each a checkpoint).
  - *Three Strokes:* every cut is downward, and each gives something different. The anvil gives height, the pod a
    second wind, and the mould somewhere to stand. You chain them over one long thorn floor to a high ledge whose
    face is hot.
  - *Grille:* you toss the light onto a belt that carries it through a grille into the orange end, where it waits
    against the closed stone. You climb the block, walk off its far edge, and shoot your end into the ceiling above
    the plate on the high shelf. The light drops out onto the plate, and the door below opens as you land.

**Difficulty curve (intended).** 107 easy (well below Emberdeep's 106), 108 easy–medium, 109 medium, 110 medium,
111 medium–hard. The Casting Gate starts at 112, medium. 113 is medium–hard (short windows, dashing between them).
114 is hard, a little above 106 The Pour: *Three Strokes* is the execution peak and *Grille* the routing close.
Enemies appear in 111 only (one room in nine). A portal appears in 112 and 114b.

## What the sweeps caught, and the fixes

- **108's tape no longer exited** (a map change had put the spawn on a pillar). New tape: dash up off the pillar,
  cut the pod, land on the pair, jump to the far anvil, cut. Hunts then found the knight climbing the rock face
  beside the exit instead of using the far anvil, so that face (column 31) is thorned. A hyper off the pillar
  reaches the pair without the pod. This is **kept** as an optional momentum line, because it still has to answer
  "which do you cut", and the no-pod hunt excludes momentum.
- **112** went through three layouts. (1) With the ledge low and close, a hyper plus an air dash crossed the pit.
  The ledge was raised and its face thorned. (2) With the orange end low, a slow jump into the ceiling portal
  followed by a wall-jump off the exit wall and a dash still made it. The exit was moved to the top of the block
  under a roof of teeth, so a wall-jump off the exit spikes you. (3) The bay's back wall let a wall-jump carry you
  into the ceiling portal, so it is thorned. A hidden safe tile at the foot of the ledge's thorned face was also
  closed. Offline hunts for "no anvil" and "no portal" (beam 1000, depth 60) now find nothing.
- **113** began as *Backstop*: the belt carried the light past the plate into a furnace, and a cast mould stopped
  it. A hunt found that a light riding past a plate opens a held door for a few frames, and a knight waiting at the
  door slips through. No belt layout avoids that flicker, so the room was replaced by *Iron Island* (see *Designs
  dropped*). The first *Iron Island* was a tall hall with the mould hanging over the floor. Hunts crossed it in
  one window: dash along the floor, dash over the molten at knee height, and use jump arcs at both ends. Across
  four tunings, air reach stayed about two-thirds of the floor. The room is now a two-tile crawlway, so a jump
  barely leaves the ground. The mould is a hole in the floor, and the window is 40 frames (15 glass, 25 stone).
  The offline hunt without the cast (no momentum, beam 1000, depth 60) finds nothing. Two hypers still cross in
  one window. This is **kept** as optional momentum, and the family and the verifier's hunt exclude it.
- **114a** first had two moulds and a low roof. The anvil reached the pod directly and the first mould was never
  needed, so it was cut, and the roof, which then did nothing, went with it. A wall-jump off the ledge's top tile
  let the pod reach the ledge, so the whole face is thorned.

## Designs dropped

- **Backstop (belt, mould and lantern).** The light kept opening the door as it rode past the plate. See above.
- **Far Floor.** The orange end sat in a floor across the pit, under a high walk. A portal does not keep the
  anvil's jump hold, so the throw out of a floor rose only about 50 px. A dash could nearly match that.
- **A second mould in 114a and in 113.** In both it made stepping stones you could hop between in the air, which
  took away the wait.
- **A hanging mould in 113** (a tall hall with the mould over the floor): jump arcs at both ends made the wait
  optional.

## Open points

- **Runtime.** The last full run was `36 passed, 0 failed` in 2 min 47 s of wall time (159 s CPU) on the shared machine.
- 113 crosses Emberdeep's heat slab into the Foundry. That is one precision-only device borrowed from the previous
  region, not a new one. Isaac may prefer the room to stay pure Foundry.
- Kept momentum lines: 108 (hyper to the iron pair) and 113 (two hypers across one window). Isaac may want either
  blocked.
