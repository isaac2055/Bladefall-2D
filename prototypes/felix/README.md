# Felix · Chapter One, The New House

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

## Developer flags (after `--`)

`--from <room-id>` starts at a room with every gift. `--place x y` moves Felix inside it.
`--script prologue` plays the opening by itself. `--capture out.png --capture-after <frames>` saves
a screenshot and quits. `--reference <room-id> --report` drives a room with its stored browser
recording. Several of those recordings (road, Wait Below the Lip, Muster Yard) also die in the
untouched native layout, so they cannot prove a route.
