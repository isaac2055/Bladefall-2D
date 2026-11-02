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
- **The top of the wardrobe:** Codex's ten approved Outskirts workshop rooms (from `levels/world4.tscn`)
  are a mandatory stretch after the curtain room. Each ends at one of the boy's drawings; reaching it
  fades to the next room, and the tenth opens onto the windowsill (the old crossroads), where the
  naming happens. Their geometry and routes are unchanged; all ten clear with zero deaths on their
  stored routes (`--reference workshop-relay --chain --report`).
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
