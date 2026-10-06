# Part V · Portals, Part VI · Portals and Everything Before, and Momentum (X1–X5) — 7.252–7.253

Two additions to the Precision Core (`precision.html`), built 30 September 2026:

- **Part V · Portals** is levels 50–59. Levels 50–54 give you one portal against a fixed end. Levels 55–59 give you both ends.
- **Momentum** is the optional X1–X5 run after Part V. X1 is the two existing rooms, Super and Low Road. X2–X5 are new.

The X labels stay when more parts are inserted ahead of Momentum, so it can keep being pushed back.

All 14 new rooms follow the same rule as Parts I–IV. Each has a recorded route that replays to the exit with no deaths. Each also has a family of tempting wrong strategies, and none of them finishes (see *Checks*).

## Controls (Isaac's decisions)

| Input | Keyboard | Controller |
|---|---|---|
| Portal | **P** | **RB** (button 5) |
| Blade | unchanged | **Y** (button 3) |
| Pause | **Esc** | **Start** |

- **Aim.** The portal fires the way you hold (8 directions). With nothing held, it fires the way you face.
- **Colours.** In two-portal rooms one key alternates blue → orange → blue. A pip over the knight shows the colour of the next shot.
- **Old bindings.** Saved controls that had P or RB on pause move to portal the first time the page loads.

## Portal rules (`public/bladefall-pcore-portals.js`)

**Surfaces**
- **`%` portal stone.** Pale, panelled rock. It is the only surface that takes a portal. An end covers two tiles on one face (u, d, l or r).
- **Placement.** The shot is instant. It snaps to a two-tile slot on the face it hits, so a recorded input always lands in the same place.
- **`!` barrier line.** It stops portal shots. When the knight crosses it, both of his ends close. Bolts pass through it.

**Room modes**
- **`portalMode:'one'`.** The room fixes one end (`portals:[{color,c,r,face}]`, drawn with a white rivet), and your shot moves the blue end.
- **`portalMode:'two'`.** Both ends are yours, and your shots alternate colours.

**Passing through**
- **Opening.** While both ends exist, the stone behind each one opens. Anything that reaches it goes through.
- **Direction.** Velocity turns by quarter turns: the direction into one face becomes the direction out of the other. A dash keeps dashing.
- **Floor exits.** Leaving through a floor end, you move at no less than 170 px/s.
- **Fall memory.** A floor end remembers your fall. You enter it as fast as a free fall from your highest point, up to 420 px/s.
- **Fling.** Leaving any end, the knight is *flung*:
  - Speed above a run is kept in the air, and pressing back brakes it.
  - A fall can build to 420 px/s.
  - The fling ends when he lands, grabs or dashes.
  - A floor end under a roof end is therefore a loop that keeps gaining speed.

**What passes**
- **Passes:** the knight, the lantern, slide stones, foe bolts and Combat shots.
- **Does not pass:** creatures (Isaac: "certain creatures who can or can't, at your discretion"). For now none can. The rule is per actor, so a future creature can be allowed.
- **Bolts and shots.** One that comes out of a portal becomes the knight's, exactly as if parried. It lights coils and stones and breaks husks.

**Drawing (`bladefall-pcore-portals-view.js`)**
- **Surfaces.** Portal stone, shimmering barrier lines, and oval ends. An end is bright when linked and hollow while waiting for its pair.
- **Sight line.** A dotted line shows where a shot fired now would land: a bracket if it would open, a small cross if not.

## Part V · Portals

| Level | Room | The question |
|---|---|---|
| 50 | Where You Stand | One end is fixed in an alcove you cannot reach. Where do you put yours? |
| 51 | Speedy Thing | Fall into your end from the top of the tower; the fixed end throws you across the pit. The higher the fall, the farther. |
| 52 | Dash Goes Vertical | Air-dash sideways into stone. You come out still dashing, upward, through a crystal. |
| 53 | Special Delivery | Throw the lantern through your end onto the plates. You cannot hold the door yourself. |
| 54 | Catch and Move | One end has two jobs: first catch the spitter's bolt for the coil, then carry yourself. |
| 55 | Both Ends | A thorned wall with room over it for a shot, not for you. One end in the roof beyond it, one at your side. |
| 56 | Loop and Let Go | A floor end under a roof end is a loop that builds speed. Move the end you fall out of to be flung across. Since 7.253 a tally stone hangs over the pit where only the flight passes, and it opens the exit gate, because Isaac could hyper across the pit without the loop. |
| 57 | Stone Through Stone | Dash the slide stone through the stub. It comes out high on the far wall and slides to become your step up. |
| 58 | Bolt Relay | Two coils behind a barrier line. Catch one bolt and deliver it high, then move the end that delivered and send the next one low. |
| 59 | Thinking with Portals | Dash into the post and come up out of the first island through a crystal. In mid-air, fire the post's end at the second island, fall back in, get thrown up out of the second, and dash to the ledge. The order of the first two shots decides which end the mid-air shot moves. |

Levels 55–59 and the pip teach the alternation. Level 59 is the only room where the order matters: fire the post end first and the island second, so the mid-air shot moves the post end.

## Part VI · Portals and Everything Before (levels 60–69, 7.253)

Isaac's brief was "unique portal puzzles integrated with our previous mechanics", plus new portal ideas or expansions. Each room pairs portals with one earlier object or foe, and level 69 puts the part's ideas together.

| Level | Room | Paired with | The question |
|---|---|---|---|
| 60 | Spring Loaded | spring (one portal) | The spring only throws you up. Put your end over it so up comes out of the fixed end sideways, then dash on. |
| 61 | Behind the Cyan | cyan/amber machinery | Machinery stops a shot. One dash clears the cyan from the stone, but it also takes the cyan bridge away. Go through, and dash in the air to bring the bridge back under you. |
| 62 | Bell from Afar | lantern, bell, bolts | You can't dash or fire with the lantern in hand, and the stair is machinery. Relay the spitter's bolts through your portals into a sealed bell, then climb on its beat. |
| 63 | Parry Through | parry, bolts, tally stone | The spitter only shoots along the floor, and the stone is sealed high up, open to the right. Parry the bolt straight up into a roof end, and it comes out of the far wall into the pocket. |
| 64 | Lantern Flight | lantern glide | Carry the lantern in from the floor: you come out high and slow. Glide back down into the floor end, which now remembers the height, and you come out fast. The lantern's glide carries you across. |
| 65 | Tally Tour | tally stones and gate | One loop, let go twice: once sideways through one stone, then back (fire down on the far stone), loop again, and once straight up through the other. The pip decides which end moves. |
| 66 | Moth Flight | moths (pogo) | Flung, you keep your speed until you land. Strike down on a moth to stay up without slowing. |
| 67 | Hold the Door | plate and door | Only you can hold the plate. Shots pass through the door while it is open, so shoot beyond it while standing there, then step into the end behind you. |
| 68 | Ram Breach | ram, cracked masonry | Drop into the arena through the roof. Stand between the ram and the cracked wall, and jump its charge rather than parrying it, so it breaks through for you. |
| 69 | Everything Before | door, loop, tally gate, moth | Hold the door and shoot through it, loop for speed, and let go through the stone that opens the gate mid-flight. Then pogo the moth onto the ledge. |

**Engine change (7.253).** While the knight carries the lantern, the glide cap wins over the portal fling. Speed still carries sideways with no drag, but the fall stays slow. Nothing in Parts I–V carried the lantern through a portal.

**Designs dropped along the way:**
- **Stone Drop.** A stone sent down a shaft to become a step. Whatever the geometry, the knight could follow through the same portals and use the height of the fall, or drift onto the tunnel lip, without the stone.
- **Its Own Shot.** A sentry killed by its own shot through the portals. A parry sends a shot straight back along its line, so the portals were never needed.
- **Barrier Order.** Every version reduced to "who goes through first", with nothing that forced the order.

Wrong-strategy counts from planning (all zero successes):
- 60: 3,476
- 61: 3,361
- 62: 768
- 63: 7,139
- 64: 3,469
- 65: 1,156
- 66: 9,395
- 67: 638
- 68: 2,288
- 69: see TESTING.md

## Gate Trials after 7.253

Part VI fits the other session's Ruined Keep placeholders, which were planned as "portals where they help and everything so far":

| Gate | Levels |
|---|---|
| The Weight Gate | `[60,64]` |
| The Grip Gate | `[65,69]` |
| The Stair Gate (Momentum) | `[70,74]` (was `[60,64]` at 7.252; shown as X1–X5) |

Mantlet and Deadeye stay at `[50,54]` and `[55,59]`.

## Momentum (X1–X5)

| Label | Room | What it asks |
|---|---|---|
| X1 | Super · Low Road | The two existing rooms: a super, then a hyper. |
| X2 | Two Flips | The super's dash flips the machinery. Let it build your landing, then read what the next dash builds over your head (a hyper). |
| X3 | Pod in the Arc | A super carries you farther than a jump and dash. Cut the pod at the top of the arc to get the dash back. |
| X4 | Clear the Lane | Dash the stone out of the lane over a bottomless pit, then hyper under the low roof. |
| X5 | Both at the End | The easy part first (tally stone, pillar climb). Then, back to back, a super up onto the raised ledge, which a hyper cannot reach, and a hyper under the roof, where a super would hit. Miss either and you die and redo only the last few steps. |

The runs are meant to be relatively easy, as asked, and only X5 asks for two techniques back to back. Nobody has playtested them yet, so how hard they feel is unknown.

## Gate Trials at 7.252 (the other session's `bladefall-gate-trials.js`, not edited here)

Superseded by *Gate Trials after 7.253* above: Part VI pushed Momentum to 70–74. At 7.252 the gates placed but not yet filled were:

| Gate | Levels |
|---|---|
| The Mantlet Gate | `[50,54]` (Part V, one portal) |
| The Deadeye Gate | `[55,59]` (Part V, two portals) |
| The Stair Gate (optional) | `[60,64]` (Momentum, shown as X1–X5 in the menu) |

## Checks

`npm run verify:precision-core` adds two groups:

**Part V portal rules**
- Slot snapping.
- Blue, orange, blue alternation.
- Two relayed bolts lighting both coils behind a barrier.
- The barrier closing both ends.
- A dash that keeps dashing through a post into a floor.
- The pw1 loop reaching the 420 fling limit.
- Speed above a run kept in the air.

**Wrong strategies for every new room.** Each family fails completely. Examples:
- **56:** one drop without the loop.
- **57:** the knight going through the portals without the stone.
- **58:** coils struck by blade or parry, or one delivery end only.
- **59:** island first; walking into the post; no mid-air shot; linking the islands from a jump.
- **X2–X5:** the wrong technique at each step.

The planning families were larger than what the verifier runs (for example, 9,042 wrong-way runs for level 59 and 4,592 for level 57). The verifier keeps a sample of each, so it finishes in about six minutes.

## Tools

- **Portal input on tapes.** Tapes use `q` for the portal key. `scripts/pcore-tape.mjs` reads it.
- **Level sources.** Rooms were generated from Python level blocks and routes found with the staged planner, as in Parts I–IV. The planners are scratch tools; the recorded tapes live in `public/bladefall-pcore-tapes.js`.

## Open

- **Isaac's playtest.** Portal feel on keyboard and pad (P and RB), sight-line readability, whether 55–59 ramp properly, and whether X5 is "the most difficult but still relatively easy".
- **Creatures through portals.** The rule is per actor, and none passes yet.
