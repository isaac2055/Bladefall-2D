# The Climb (7.265): worlds 1–9 as continuous places

Isaac's call (2 Oct 2026): of the merges, his favourite is **Frostfell, one mountain** (Merge Pitch B). He likes the single scrolling climb with no screens, where a death sends you back to the fire at the start of that section. He asked for the existing worlds to be remade that way, using his ratings:
- easy in the starting worlds and harder later;
- nothing rated above 7 in the game yet;
- the hard rooms he likes are kept to use later.

He rated through Frost Sorcerer, so worlds 1–9 are remade. The ratings are in `docs/playtest/room-reviews-2026-10-01.csv` and `.json`: difficulty 1–10 and fun 1–5 for 134 Room by Room rooms.

**Where:** Title → Merge Pitches → **The Climb · worlds 1–9** (`precision.html?pitch=climb`, `&world=N`). Room by Room, the Precision Courses and the other pitches are unchanged.

## How a world plays

- **One world is one continuous place.** Its rooms (Room by Room's) become **sections** set side by side, or stacked, wherever each one's exit leads. The camera follows the knight over the whole world and never cuts. The sections ahead and behind are drawn where they sit; the ones behind look as you left them.
- **Seams.** Walking out of a section carries you straight into the next with the speed you had. The next section's edge is opened to let you in:
  - from the side, a short tunnel beside its fire;
  - from below, a two-tile shaft up through its floor, capped with a one-way ledge;
  - from above, a hole through its ceiling over the fire.

  The opening stays open so you can walk back (7.265.2). Only a room whose own route needs that wall (now just the Wheel) closes it while you play it, and it reopens when you leave.
- **Fires.** Every section starts at a fire. A death puts you back at the fire of the section you are in, and only that section resets. Retry does the same.
- **Every section keeps its own rules.** Gates and their stakes, plates and their doors, the toggle phase, the bosses (Brute, Marksman, Warden, Sorcerer), portals and locked verbs behave exactly as in Room by Room. Each room's intended route is unchanged.
- **Quests and secrets (branches).** A quest leaves by its room's side door, or by a door cut in a ceiling corner, and plays its own short chain, also continuous. Each world has one secret: a ceiling-corner door up into a harder room with a reward. The camera glides into a branch like anywhere else. Keepsakes are saved with Room by Room's, so the Fractured echoes recognise them.
- **Branches are places to explore, never shortcuts (7.269).** A quest or secret is an extra area with a reward at its far end.
  - Its way back is a passage you walk. A spring launches you where it climbs.
  - It comes out only in the room you entered the branch from, or by the branch's own entrance. It never leads later in the world.
  - The opening where it comes out can be walked into, which takes you along the same passage the other way. The reward only counts when you come in by the branch's door.
  - Passage pieces are rooms named after their branch ("… · the way back"), kept out of the pause menu's room list.
- **Rewards (7.270).** A secret's far end holds its world's heart; a quest's, its keepsake. You pick it up by touch, on the room's own route; once taken it stays as an outline. The world list counts them.
- **Co-op (7.270).** Two knights, one world, each clearing every section. You see your partner live, either of you may go ahead, and holding T takes you to your partner. Host or join from the world list (`bladefall-climb-coop.js`).
- **Skips (7.270).** Three per world: N moves you on to the next section's fire.
- **Drop-through (7.269).** Down + jump on a one-way ledge falls through it (`g.dropThru`, set by the Climb only). Every shaft you came up, on the road or into a branch, is a way back down.
- **Progress stays.** A lit stake stays lit, so its gate stays open, through deaths and after leaving and returning.
- **Worlds 1–2: the oathblade cuts in all eight dash directions** (room flag `aim8`, read by the core; `spec.aim8`).

## The worlds

| World | Sections | Difficulty | Mean | Fun (mean) | Kept for later |
|---|---|---|---|---|---|
| 1 · The Outskirts | 11 | 1–3 | 1.9 | 3.0 | Watcher's Ridge (8) |
| 2 · Black Woods | 10 | 1–5 | 2.9 | 2.7 | Biting Canopy (7), The Root Door (8), The Lantern Bough (9) |
| 3 · Broken Causeway | 12 | 1–6 | 2.2 | 2.3 | — |
| 4 · The Updrafts | 13 | 1–4 | 1.5 | 1.9 | — |
| 5 · Hollow Marksman | 9 | 1–6 | 3.7 | 3.1 | Windcut Drop (9), Windcut Gallery (8), Deadeye Approach (10) |
| 6 · Ruined Keep | 12 | 1–3 | 1.3 | 2.4 | — |
| 7 · The Warden | 13 | 1–4 | 2.2 | 2.3 | — |
| 8 · Frostfell | 12 | 1–3 | 1.7 | 1.8 | — |
| 9 · Frost Sorcerer | 13 | 1–4 | 2.3 | 2.5 | The Cold Intake (10) |

**How the ratings were used:**
- **Above 7: kept for later.** Seven rooms. Nothing is deleted: every one of them still plays in Room by Room.
- **Too hard for its place: kept for later.** Biting Canopy (7) would have been the second world's hardest room by two points.
- **Within a world, the harder rooms move towards the end** where the story allows: Rise Gantry (6) before the Brute, and the Choir Flue (4) before the Signal Crown. Story beats and boss sequences keep their places.
- **Errands that lost a room:**
  - Elsie's ends at The Lantern Tree.
  - The creature errand starts at The Pen Line.
  - Daro's errand is out of world 5 for now, because his token lies in Windcut Gallery. It returns with that room.

**Two things the ratings show that this pass does not fix:**
1. **The difficulty rises, then falls.** World 5 (Marksman) is the hardest, and worlds 6–9 are easier again. The later worlds simply have few harder rooms, because their 5–7 material doesn't exist yet. The kept-for-later rooms and new sections rated 5–7 are the natural way to lift worlds 6–9.
2. **Fun 1 rooms.** These are mostly easy connecting rooms, and they are kept for now. They could be trimmed with one line in `scripts/climb/spec.mjs`:

   | World | Fun-1 rooms |
   |---|---|
   | Updrafts | Rootbreach Lift, The Draw, Kite Terraces, The Kite Lines, Choir of Drafts |
   | Frostfell | Banked Refuge, Working Streets, Thermal Works, Thawed Court, Muster Engine, Muster Crown |
   | Causeway | Chainwake Camp, Drop Yard, The Weigh Well, Broken Standard |
   | Keep | Gatehouse Hearth, Fallen Refectory, The Long Table |

## How it is built

- `scripts/climb/spec.mjs`: each world's rooms in order, its quests, and what is kept for later and why. **This is the file to edit.**
- `scripts/climb/build-climbs.mjs` (`npm run build:climb`) reads Room by Room's regions and the ratings, then places the sections and opens their seams. It **proves every seam by simulation** before writing `public/bladefall-climb-worlds.js`. Any failure stops the build. For each seam:
  - the previous room's own route carries the knight across, using the same carry the page uses;
  - a search walks or climbs him to the next fire with no death;
  - the next room's own route still finishes from its fire;
  - idling at the fire is safe.

  `npm run verify:climb` re-proves everything and checks that the page's file is current.
- `public/bladefall-climb.js`: the registry and the seam carry (page and node).
- `public/bladefall-climb-view.js`:
  - the world camera, the sections around the knight, and closing seams;
  - fires, people, quests and keepsakes;
  - the world list and end cards.

  It wraps `BladefallPitchView`, as Room by Room's view does.
- **Shared view hooks** in `bladefall-pcore-view.js` (no-ops elsewhere):
  - `PV.camera` and `PV.drawWorld`;
  - `drawOther` and `palettes`, exported;
  - a static-layer cache that holds several rooms (keyed by `room.rev`, so a closed seam redraws).
- **No core physics changed.**
- **When Room by Room's rooms change,** rerun `npm run build:climb`. The climb copies the rooms at build time.

## Checked

| Check | Result |
|---|---|
| `npm run verify:climb` | All 9 worlds; every seam and route proved |
| In headless Chrome, every world | Each section's route played through every seam to the world's end card, with 0 deaths, including the Brute, Marksman, Warden and Sorcerer sections |
| Rowan's errand | Side door → Bell Yard → Bell Tower → back at Camp Echo's door, with the keepsake saved |
| Seams (screenshots) | Road and camp seams, the up-shaft into the Lookout, the drops into Two Cells and the Sentence Well. The beaten Warden no longer reappears in the section behind. |
| Unchanged | Precision Courses, Room by Room, Pitches A and B, touch controls (14 checks) |

## Next

- Isaac rates the worlds as continuous climbs.
- Worlds 10+ follow once he has rated them in Room by Room.
- Decide whether to trim the fun-1 sections, and where the kept-for-later rooms go.
