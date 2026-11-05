# Felix · Chapter One, The New House · Chapter Two, Sir Felix · Chapter Three, Phantom

A story remake of Ascend's first world, The Outskirts, as the opening of the imaginary-friend game.
It is a separate copy of the Godot Ascend prototype (`prototypes/godot-ascend` is untouched), on branch
`claude/felix-outskirts`.

**Play:** double-click `Play Felix.command`. Arrows move, Space jumps, D dashes, A clings and carries,
R retries the room, Esc pauses.

## What changed and what did not

- **Unchanged:** the movement physics, the Outskirts' native rooms from `levels/world1.tscn`, their
  order, checkpoints and every device's rules.
- **Cut:** Rowan's and the Pilgrims' Postern side quests, their rooms and every resident. Mara's crayons stay on the road as pickups.
- **Story (scripts/felix_story.gd):** the night a five-year-old moves into a new house. The game
  opens on black and a child crying. One button makes a spark. The boy gives the light legs at the
  first bricks (jump), his sock as a cape on the rug (dash) and arms at the tall boxes (climb), each
  at the moment it is needed. He goes to bed and asks the light to check underneath. The dark from
  under the bed climbs the wall as the night goes on. The nightlight on its dock holds it back. At
  the windowsill, half asleep, he says "...Felix." and the light gets a face.
- **Look (scripts/felix_view.gd):** Felix is a firefly-sized light, so the bedroom is the mountain.
  Floorboards and furniture are wood, free-standing blocks are moving boxes. Floor spikes are loose
  building bricks, wall spikes are pushpins and checkpoints are crayon stars. Crystals are
  glow-in-the-dark star stickers, stakes are firefly jars and gates are cardboard flaps. The lantern
  is a nightlight and the held door is a wall of the dark. Crumbling stone is alphabet blocks,
  patrols are dust bunnies, the lift is a berry basket on a string and shards are crayons.
  Behind the play rooms: the hallway door with light under it, the bed and the sleeping boy,
  bookshelves, the desk, the dresser, and the window with the moon.
- **The turn (scripts/felix_story.gd):** the new house is Mom's, after the separation. Two stacks of
  boxes, "MOM" and "DAD - TAKE", say so without anyone saying it. At the top of the overlook stair,
  after the curtain room, Felix hears the parents arguing through the floor. A door closes. The boy
  hides under the quilt, the dark surges and the music drops out. Felix goes up to the wardrobe,
  where the family photos are packed, to bring the good days back to him.
- **The top of the wardrobe:** Codex's ten approved Outskirts workshop rooms (from `levels/world4.tscn`)
  are joined into the world after the curtain room. Codex's overlook stair climbs from the curtain
  room's nook onto a walkway along the top of the wardrobe (`join_wardrobe` in `scripts/world.gd`).
  - **Entering a room:** each room hangs below the walkway. You drop through a two-tile hatch cut
    in its ceiling and land on its authored start.
  - **Inside a room:** each room is the inside of a box of family things. It ends at a photo of a
    good day hanging on the boy's string. Rooms that needed a shard now need the photo's torn corner
    (or two torn pieces).
  - **Leaving a room:** reaching the photo, with the room's finish rules met, lowers the basket. It
    lifts Felix straight up onto the walkway. Only when the photo is left of the walkway's wall does
    it nudge him right, just past the wall. The checkpoint is where he lands.
  - **The ending:** the photos end up propped along the windowsill when the boy says his name.
  - **The end:** after the tenth room the walkway leads to the windowsill (the old Upper Watch room),
    where the naming happens.
  - **Changed in the rooms:** only the entry hatch. Spawns, routes, devices and finish rules are as
    approved.
  - **Checked:** `--reference workshop-relay --chain --report` walks every stretch of walkway, drops
    into every room, plays its stored route, rides every basket and reaches the naming with zero
    deaths.
- **Slime:** the white flowers are now spilled green slime puddles. The patches and the slowing are the
  same (run 55%, jump 67%, dash 60% for 3 seconds). Felix turns green and drips while it lasts, and the
  first touch after the legs gift gets "eww, SLIME!".
- **Collectible:** the first drawing of Felix, hidden in Hang Time (the secret above Watcher's Cut).

## Chapter Two, Sir Felix (the Black Woods)

Reached from Chapter One's end card ("press any button for Chapter Two"), or from the pause menu.
Developer flag: `--chapter 2`. Story: `scripts/woods_story.gd`. Look: `scripts/woods_view.gd`, drawn over
Codex's Black Woods (`levels/world2.tscn`), whose forest, tiles and devices are unchanged.

- **The walk (two years later, every other weekend):** the boy walks Felix through the woods to Dad's
  new cabin. He walks a little ahead in the forest's depth and talks along the way. Afternoon turns to
  dusk room by room, and thunder starts far off near the end.
- **The knighting:** in Oathblade Clearing the world stops. The boy kneels with Dad's walking stick:
  "this is dad's stick. but now it's a SWORD." / "kneel." / "I dub thee..." (a cardboard helmet) /
  "SIR FELIX!" (the stick becomes his sword). Strike (W) is locked until then.
- **New devices get one line each:** moth pods, the branch swap and the bell.
- **Dad's cabin:** the road ends in the old Rootbound Overlook. Dad sits on the porch step, a backlit
  shape whose face is never shown. "there's my guy!" / "DAD! this is Sir Felix." / "...Sir Felix. very
  nice to meet you, sir." Then rain, lightning and the power goes out. Dad offers a story; the boy
  asks for a knight one.
- **Dad's story:** Codex's ten Woods workshop rooms (`levels/world4.tscn`) are the tale, joined into
  one walkable row east of the big tree (`join_story` in `scripts/world.gd`). The road cuts into the story
  when Dad starts telling it. Each room gets a line of Dad's as Felix drops in and another at its
  finish, with the boy interrupting now and then. The finish is where Dad's flashlight points, and its
  beam lifts Felix out onto the next stretch, straight up as in Chapter One. Two rooms (Two Ways Through
  the Canopy, The Landing You Make in Midair) and The Overturned Hollow have no clear drop to their
  start, so the beam lowers Felix in instead. Their layouts are untouched.
- **The ending:** the last finish lifts Felix out of the story, back to the porch. The boy is asleep across
  Dad's knees. "...and Sir Felix kept watch all night," / "so nobody had to be scared." / "...I've got
  the watch tonight, Sir Felix." Felix sets the helmet and sword down. End card: "Chapter Two · Sir Felix".
- **Cut:** Elsie's supper quest and its rooms, the hall behind the start, and the passages to other worlds.
  The secret (Read the Colors) gives the boy's drawing of Sir Felix instead of a heart.
- **Checked:** `--chapter 2 --tour --report` plays Codex's recorded Black Woods tour through every scene
  to the cabin and into the story with zero deaths. `--chapter 2 --reference workshop-borrowed --chain
  --report` plays all ten story rooms, every beam and the ending with zero deaths. Chapter One's chain
  still passes.

## Chapter Three, Phantom (the Causeway)

Run it with `--chapter 3`, or press a button at the end of Chapter Two.

- **Story (scripts/phantom_story.gd):** Isaac is ten. Every other Friday he is handed over at a lot
  across the Causeway. This Friday the bridge is stuck, so Mom and her new friend, a big man in a work
  jacket, walk him over to Dad's car. At the camp the boy decides knights are for little kids: Felix
  becomes **Phantom**, a spy (hood, mask, Dad's stick snapped into a dagger, so W still strikes), and
  his mission is to tail the big man and find out what he's hiding. The boy talks on a toy radio.
  - **Three clues, each misread:** his phone keeps buzzing (The Patrol Road), he keeps looking back
    (The Upper Chain), he's carrying two coffees (Counterweight Rise).
  - **The counter (F)** is given in Broken Standard, the first fight.
  - **The Brute:** in "Let Him Clear the Causeway" the big man is the Brute as the boy sees him,
    and he smashes the broken road open.
  - **The handoff, at the lot (cl3-atlas-crossroads):** goodbyes, the boy gets into Dad's car, and as
    it pulls away, through the back window, Mom's smile drops and the man puts his arm around her.
    Nobody says anything. The boy keeps it to himself.
- **The drive (`join_story(source,3)` in scripts/world.gd):** Codex's ten Causeway workshop rooms hang
  below their own road east of the lot, entered the same way as Dad's story. Each room has one line
  as Felix drops in and one at its finish: Dad's small talk, the boy's short answers, and the three
  clues re-read in Phantom's notebook ("...it was her. calling him."). The finish is a streetlight's
  pool and headlights carry him on.
- **Sunday night:** back at the lot, the boy gets out of Dad's car and hands the big man his bag.
  "hey." / "...hey, bud. got it." Felix takes his mask off.
- **Cut:** the Defector side quest and its rooms, the Pilgrims' Landing hall, and the passage to other
  worlds. **Secret:** Phantom's ID card at the top of the Glass Ladder.
- **Look (scripts/phantom_view.gd):** placeholder figures drawn in code over Codex's Causeway tiles
  (the man, Mom, the boy, Dad's car, the hood and mask), Friday gold to sunset, the drive at night
  under passing streetlights.
- **Checks:** `--chapter 3 --tour --report` plays the whole Causeway to the lot and into
  story-walk-0; `--chapter 3 --reference workshop-borrowed-bridge --chain --report` plays the drive
  to Sunday night (`phase=end`). `tools/phantom-shots.sh <dir>` saves 13 shots.

## Reviewing a whole chapter

`tools/sweep.sh <dir> <every> <quit-after> [flags]` plays with the given flags, saves a frame every
`<every>` ticks as `<tick>_<room>_<phase>.png`, quits at `<quit-after>` (printing `QUIT-AFTER` with
room, deaths and phase), and tiles the frames into labelled `sheet-NN.png` contact sheets. Example:
`tools/sweep.sh shots/sweep-c3 150 8100 --chapter 3 --tour --report`. The game flags `--sweep`,
`--sweep-every` and `--quit-after` can also be used on their own (`--quit-after` lets route checks end
without a timeout wrapper). Latest findings: `PLAYTEST-2026-11-05.md`.

## Developer flags (after `--`)

`--from <room-id>` starts at a room with every gift. `--place x y` moves Felix inside it.
`--script prologue` plays the opening by itself. `--capture out.png --capture-after <frames>` saves
a screenshot and quits. `--reference <room-id> --report` drives a room with its stored browser
recording. Several of those recordings (road, Wait Below the Lip, Muster Yard) also die in the
untouched native layout, so they cannot prove a route.
