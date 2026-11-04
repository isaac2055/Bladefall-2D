# Felix: instructions for coding agents

This folder is **Felix**, a story remake of Bladefall's first worlds, built in Godot 4.5. The owner is
Isaac. Two agents work on it at the same time, each in its own git worktree and branch. Read
"Working alongside Claude" before you change anything.

These instructions replace anything in `.agents/AGENTS.md` at the repo root. That file is for the
old Bladefall web game. **Never push to `main`.**

## The story so far (Chapter One: The New House)

Isaac is five and has just moved into a new house. His parents are separating; nobody says so, but
two of the moving boxes are labelled `MOM` and `DAD - TAKE`. On the first night he cries in the dark,
and imagines a friend: **Felix**, a ball of white light about the size of a firefly.

The player is Felix. Because Felix is tiny, the bedroom is a mountain range. The floorboards,
moving boxes, bed, bookshelf, desk and dresser are the climb, and the window is the summit.
The boy gives Felix a body at the moment Felix needs each part, so each one arrives as a gift:

1. **Legs** (jump): "wait — you need LEGS."
2. **A sock cape** (dash): "heroes need a cape."
3. **Arms** (climb): "it's too tall... you need ARMS!"

The boy then goes to bed and asks Felix to check under it. The night gets darker as Felix climbs.
A nightlight carried to its socket pushes the dark back.

**The turn.** At the top of the stair after the curtain room, the game pauses. The parents' fight
comes up muffled through the floor, a door slams, and the boy hides under his quilt. The hint reads
"the good days are packed in the boxes up here." Felix climbs into the wardrobe. Each of its ten
rooms is the corrugated inside of a box labelled PHOTOS, FAMILY, BABY STUFF or XMAS, and each ends at
a small family photo of a good day, hanging on a string. A basket on that string lifts Felix out.

**The ending.** All the photos are propped along the moonlit windowsill. The boy, half asleep,
murmurs "...Felix." Felix gets a face.

**The tone:** warm, quiet, a little sad, never scary-for-real. The art is a child's room at night,
seen at the scale of a toy. Crayon and kid-made details. Moonlight from the window; warm light under
the door and from the nightlight; the story's "dark" closing in as soft black. Hazards are Lego
bricks and pushpins. White-flower patches are spilled green slime. Checkpoints are the boy's
glow-in-the-dark crayon stars.

## Your job: Chapter One sprites

Today every visual is drawn in code: rectangles, lines and circles in `scripts/felix_view.gd`, plus
Felix in `scripts/felix_body.gd`. Replace them with **hand-made pixel-art sprites and tiles**. Isaac
likes 16-bit pixel art. Make it look like a finished indie game, not a prototype, while keeping
everything the code draws today readable.

**What to make, roughly in this order of impact:**
1. **Felix** and each stage of his gifts: bare light, + legs, + cape, + arms, + face. Also his
   dash stretch, his slimed tint, climbing, and riding the basket. He stays about 8 × 9 world pixels.
2. **The terrain tiles:** wooden floorboard frames and cardboard-box tiles, including the deep
   variants, plus the ruler one-way platform. See `make_tiles()` and `build_terrain()`.
3. **The boy** in every pose: crying, looking, run, kneel with the sock, point, in bed, asleep,
   and hidden under the quilt. See `draw_boy()` and the `boy_*` functions.
4. **The bedroom backdrop:** wallpaper, door with light underneath, labelled moving boxes, bed,
   bookshelf, desk, dresser, window with the moon, curtains, and the wardrobe with its box interiors.
5. **Devices and props:** Lego and pushpin hazards, crayon-star checkpoints, the nightlight, the
   alphabet-block crumble, glow-star refill, firefly jar, dust bunnies, the cardboard gate, slime
   puddles, the photos (10 scenes) and torn pieces, and the basket.
6. **The dark:** the tendrils in `story_dark()`.

**How the game draws:**
- The camera shows about 320 × 192 **world pixels**, scaled 4× to the 1280 × 832 window. Author
  sprites at **1 sprite pixel = 1 world pixel**. A tile is 8 × 8.
- Texture filtering is already nearest-neighbour (`project.godot`). Keep it that way.
- Draw with `draw_texture`/`draw_texture_rect_region` inside the existing functions. Keep each
  function's name, position and draw order, and swap its body. That keeps the layering right.
- Lighting is real: `PointLight2D` on Felix, the door, the moon and the glow stars, and a
  `CanvasModulate` for night. Sprites must read in the dark. Test them lit and unlit.
- Put art in `art/` (`art/felix/`, `art/tiles/`, `art/boy/`, `art/room/`, `art/props/`). Commit the
  `.png` files **and** the `.import` files Godot creates. To make Godot import new files, run:
  `$GODOT --headless --path . --import`

## Hard rules

- **Drawing only.** Never change collision, tile solidity, room layouts, spawn points, timing,
  movement, story beats or text. The rooms and routes are approved by Isaac. If a sprite can't fit
  the collision box, draw it to fit the box, and tell Isaac.
- **Stay in your files** (see the table below).
- **Don't touch** `prototypes/godot-ascend/` (Codex's original Bladefall build) or anything outside
  `prototypes/felix/`.
- After every change, run the screenshot check and the route check below. Look at the screenshots
  yourself before calling anything done.
- Commit often on your branch with plain messages. You may push your branch
  (`git push -u origin codex/felix-art`). Never push to `main`, never force-push.

## Working alongside Claude

| Who | Folder | Branch |
|---|---|---|
| Codex (you): Chapter One art | `~/Projects/Felix-Art` | `codex/felix-art` |
| Claude: Chapter Two, Black Woods | `~/Projects/Felix-Woods` | `claude/felix-woods` |

Both branches start from the same Chapter One commit. Claude merges `codex/felix-art` into
Chapter Two when Isaac says so. To keep that merge clean, the files are split:

| Files | Owner |
|---|---|
| `scripts/felix_view.gd`, `scripts/felix_body.gd`, `art/**`, new art helper scripts | **you** |
| `scripts/felix_story.gd`, `scripts/world.gd`, `data/**`, `levels/**` | Claude |
| `scripts/felix_main.gd`, `felix.tscn`, `project.godot` | Claude. Ask Isaac before changing these |
| `scripts/woods_*.gd` and anything else named for Chapter Two | Claude |
| Engine scripts (`core.gd`, `landscape.gd`, devices, etc.) | nobody. Leave them alone |

**One shared seam:** `felix_body.gd` draws Felix's body and returns his center. Chapter Two will dress
him as a knight (a cardboard helmet and a stick sword) by drawing on top of that center. Keep the
function signature `draw(v, g) -> center`. Keep Felix about the same size and centered the same way,
so a costume lines up. If you change either, note it in your commit message.

## Running and checking

The Godot binary:
`/Users/computer/Projects/Bladefall-Godot-Ascend/.cache/godot/Godot.app/Contents/MacOS/Godot`.
The scripts below use it unless `GODOT` is set.

- **Play:** double-click `Play Felix.command`, or run `$GODOT --path .`. Arrow keys move, Space jumps,
  D dashes, A climbs.
- **Screenshots:** `tools/felix-shots.sh <out-dir>` saves 17 shots covering every place in the
  chapter: the opening, each gift, the bed, the dark, the curtain, the fight, three box rooms, the
  secret and the windowsill ending. Run it once **before** you start (into `shots/before`) and after
  each pass (into `shots/after-N`), and compare. `shots/` is scratch, so don't commit it.
- **One frame anywhere:** `$GODOT --path . -- --from <room-id> [--place x y] --capture out.png --capture-after 120`
- **Route check (must still pass):**
  `$GODOT --path . -- --reference workshop-relay --chain --report`
  It plays every box room and basket and ends at the windowsill. Success is the log repeating
  `AT cl1-atlas-crossroads ... deaths=0 ... phase=end`. Stop it once it reaches that, because it doesn't
  quit by itself. Any `SCRIPT ERROR` is a failure.
- `README.md` describes the chapter's rooms and the other developer flags.

## When you finish a pass

Tell Isaac, in plain words:
- what now looks different and where, with the screenshot paths;
- what you didn't get to;
- anything you had to bend, such as a sprite that couldn't match its collision box.
