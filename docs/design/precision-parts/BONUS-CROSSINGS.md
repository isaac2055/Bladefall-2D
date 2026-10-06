# Bonus · Crossings (labels C1–C6)

Built 30 September 2026 (7.255). Files:

- `public/bladefall-pcore-part-903-bonus-crossings.js`: six one-room bonus chapters (`bonus:true`, labels C1–C6), part key `BC`.
- `scripts/verify-precision-part-903.mjs`: routes, wrong-strategy families, hunts and controls (`ONLY=bc3,bc6` runs a subset).
- Devices: `frost`, `water`, `rail`, `hook`, `watch`, `foundry`, `citadel`, `beam`, `gravity` modules, all unchanged.

The idea: the regional devices of levels 75–199 mostly stay in their own region. Each room here takes two that
never meet and asks a question that only their interaction answers. Nothing new is taught; hints are empty, and
the blurb says only what is in the room.

## Which pairs meet already

A census of every room in levels 75–199 (134 rooms), detecting each device by its glyph or room-def field:
pods `R`, jailers, ice `I`, wind, feather `f`, water `w`, condenser `n`, currents, heat slabs `E`, anvil `N`,
belts `{ }`, moulds `U`, prisms `Q`, footholds `Y`, echo, wake, re-aim, carts `C`, switches `k`, rings `O`, decks,
tide, floats `F`, watch lights, smoke `S`, beams, mirrors `/ \`, shutters `X`.

Cross-region pairs that already share a room: jailer+water/currents (95, 98b), jailer+ring (159b),
jailer+tide/float (168), slab+mould (113), foothold+echo (131), ring+tide/float (166, 169), ring+lamp/smoke (177),
ring+beam/mirror/shutter (196, 199b). Every other cross-region pair never meets.

The candidate pairs from the brief, checked: wind+lantern 1 room (p87, same region), wind+plate 0, ice+belt 0,
ice+cart 0, slab+tide 0, slab+water 0, prism+ring 0, echo+lamp 0, mirror/beam+water 0, beam+condenser 0,
foothold+deck 0, anvil+wind 0, pod+prism 0, prism+deck 0.

## The rooms

Counts from `node scripts/verify-precision-part-903.mjs` (24 passed, 0 failed). "Hunt" is an adversarial beam
search that forbids the device the room is about. A "control" runs the same search in an in-memory copy of the
room with one device removed, to show what the other device does alone.

| Label | Room | Pair | Question | What fails (checked) |
|---|---|---|---|---|
| C1 | Ice Throws Shade | White Court freezing × Palace light | The light rises through the pool to the roof. What can the blade make of the water that the light cannot pass? | Walk, hop, dash or swim through the column (64, 0). Freeze it, then wait out the thaw (15, 0). Hunt with no blade: none. |
| C2 | Shade on Wheels | Deep Line cart × Palace light | The light runs the whole low line, too low to jump over. What can go ahead of you? | Drop into the line without the cart: walk, hop, dash, dash-jump (44, 0). Hunt with the cart left in the yard: none. |
| C3 | Roof Underfoot | Thunder Cliffs deck × Colony lamp | The lamp in the chasm watches all the air over it. What can stand between you and it? | Hop the stepping stones (162, 0). Jump or dash off the deck before it is halfway (48, 0). Control: deck removed, no route; deck and lamp removed, the stepping stones cross. |
| C4 | High Wind | Foundry anvil × Frostfell wind | The gale blows only up near the roof, and the far ledge is high and beyond any jump and dash. How long can you stay up there? | Dash for the ledge straight off the anvil (36, 0). Jump and dash from the floor's edge (78, 0). Hunt without the anvil: none. Control: wind removed, anvil kept, no route. |
| C5 | The Last of It | Citadel foothold × Palace light | The light rises from the floor and stops under the foothold; above it the shaft is dark all the way up. What comes up the shaft the moment you leave the foothold? | Drop onto the foothold from the window, then climb or jump on (55, 0). Hunt for any exit after the foothold is spent: none. |
| C6 | Hang From the Roof | Inversion prism × Cliffs ring | Once the room is over, the ring hangs above the thorns in the roof. Which way does the chain swing you now? | Out of the pocket without turning over (hunt, with the chain: none). Upside down, to the block without the ring (hunt: none). Jump and dash for the block from the roof (66, 0). |

Difficulty: C1–C3 gentle (one read, one action), C4 gentle-to-medium (a dash with a 20-frame window), C5 medium
(grab the wall the moment you come through the window), C6 medium (a flipped swing and release). No momentum tech
is needed anywhere, and the sweeps now rule it out as a skip.

## What the player does and feels

- **C1.** A gold column stands from the pool to the roof and cuts the hall in two. You jump over the pool, cut down,
  and the pool goes white; the column is gone. You walk across on ice while it lasts. Slow down and the light
  comes back up through the thaw.
- **C2.** The low line glows its whole length. Standing on the platform you are above it; step down and you burn.
  You dash the cart off the platform, it drops onto the rails and rolls away, and the glow stops at its back. You
  walk behind it to the end of the line.
- **C3.** Four stepping stones lead straight over the chasm, inside the lamp's cone. Every hop gets you seen. The
  deck below is slow, and the cone has a dark wedge exactly where it is. You stand on it and ride across in its
  shadow.
- **C4.** There is no way up except the anvil, in a narrow socket. The cut throws you straight up into the wind
  streaks, and they carry you sideways. Dash straight off the anvil and you lose the climb, so you fall short.
  Wait until you are high in the gale, then dash.
- **C5.** The shaft is the only way out, and the foothold sits under it like a floor. Step through the side
  window, fall onto the foothold and climb, and the light follows you up the shaft. You learn to grab the wall
  as you come through the window. The foothold is never touched.
- **C6.** The prism closes the pocket, so you have to turn over. On the roof the ring hangs below you over thorns.
  You jump down to it, swing toward the roof thorns, and let go on the upswing onto the underside of the hanging
  block.

## What the sweeps caught, and the fixes

- **C1**: the first hunt "found" a crossing without freezing. Replayed, it died. The search shares the room's tile
  grid between branches, and a struck pool writes ice into that grid. A branch that froze the pool and was then
  rejected left ice behind for the other branches. The hunt now leaves the blade out entirely, which is the same
  question, since nothing else in the room answers a strike.
- **C3**: jumping off the deck in its last third does reach the far ledge, because the lamp only glimpses you.
  That still uses the deck's cover for most of the crossing, so it was kept. The family now checks leaving before
  halfway.
- **C4**: with a low far ledge, a hyper (and a hyper carried into the anvil's bounce) crossed with the wind
  removed. The ledge is now high (row 10) with a thorned face, so only the anvil reaches that height. The anvil
  sits in a two-tile socket, so no run-up speed survives into the cut. The wind-removed control finds no route.
- **C5**: in an earlier layout, a climb-jump off the very bottom corner of the foothold did not spend it, so the
  foothold could be used as a wall without falling. The shaft walls now come down beside the foothold, so its
  sides cannot be held. In another earlier layout the empty half of the room served nothing, and it is now rock.
- **C6**: three skips were caught and fixed. First, a hyper along the roof crossed the thorns. The far landing
  became a hanging block whose underside is higher than any flipped jump and dash. Second, the upright knight
  could escape the start by hyper and wall-jump, and reach the ring from below. The start is now a pocket with
  thorned walls, and its whole roof is the prism, so any way out turns you over. Third, a wavedash-hyper and
  up-dash reached the block. The block moved right to column 32.

## Dropped pairings

- **Echo × watch lights.** In code, the lamps test only the knight (`watch.after` reads `g.p`). The echo is not a
  blocker, so it neither is seen nor casts shade. Leaving it in the light works, but nothing interacts. Every
  layout tried was an echo-on-plate room with a lamp nearby, or needed a swap inside the 6-frame glance (about
  4 frames of window), which is too tight for a bonus room.
- **Ice under a belt or a cart.** Belts and ice cannot share a tile. A belt pushes regardless of traction, and a
  cart ignores traction (any solid counts as track). No interaction.
- **Heat slabs beside a tide.** These are two independent clocks. Neither module reads the other's state, so the only
  question is waiting for both clocks to agree. Dropped.
- **Spent footholds × moving decks.** A deck carries the knight, not other entities, and a foothold does not
  move. All that is left is waiting on the foothold, which is not a crossing.
- **Pressure pod × gravity prism.** A pod's throw is not a dash, so it never flips you on the way back through
  the prism. A pod on the roof upside down is just a mirrored pod. No question.
- **Wind × lantern onto a plate.** It works (`frost.after` moves a loose lantern), but the lantern and plate are
  core objects, so this is not a regional pair, and p87 already carries the lantern on wind.
- **Slab × cart.** This one is real: a glass top holds the knight but not a cart, because the cart falls through
  anything that is not solid. Making the cart necessary needed extra devices, though, so it was cut.
- **Foothold × light lighting a tally stone.** This was the first C5. It does not work, because the light module
  traces once at room start, before the Citadel module has added its footholds. The stone behind the foothold
  was lit on frame 0. See the engine notes.

## Engine notes (no device module was edited)

- **Light traced before later devices exist.** `beam.reset` traces before modules that load after it (`citadel`,
  `ember`, `foundry`, `gaol`, `gravity`, `hook`, `rail`) add their solid entities. Footholds, carts, decks, slabs,
  moulds and jailer bodies are therefore missing from the room-start trace. Any tally stone behind one of them is
  lit on frame 0. Later frames trace correctly. A fix would be a second `trace(g)` on the first `before`, or a
  core hook that runs after every module's `reset`.
- **Searches share tiles between branches.** `pcore-search`'s `snapshot` shares `g.room` between branches.
  Freezing water writes into `room.grid` and `room.ice`, so a search that strikes water leaks ice between
  branches. Gravity avoids this by swapping room objects. Hunts in rooms with freezing water should leave out the
  blade, or replay what they find.
- **Climb-jump off a foothold's bottom corner.** When the knight's head only clips a foothold's bottom edge, a
  climb-jump off it does not spend it. The kick test uses the position before the move, which is one pixel below
  the foothold. C5 avoids this by enclosing the foothold's sides.
