# Building a Precision Core region after Part VI (7.254)

This is the working brief every builder of levels 75–200 follows. The owner's guideline is
`docs/plans/precision-levels-75-200.md` — read it first; this brief turns it into files and checks.

## What already exists

- **The engine** (`public/bladefall-pcore.js`) has a device registry. Each region's device lives in its own
  module, `public/bladefall-pcore-dev-<name>.js`, with a drawer `-view.js`. The rules of every device are
  in the header comment of its module — read that before designing. Rule fixtures:
  `node scripts/verify-precision-devices.mjs` (must stay green).
- **Earlier rooms to learn from**: `public/bladefall-pcore-rooms.js` (Parts I–VI, Momentum) and their
  tapes in `public/bladefall-pcore-tapes.js`; the design history in `docs/design/PRECISION-CORE.md`,
  `FOES.md`, `PORTALS-AND-MOMENTUM.md`. Parts V and VI are the closest model: one room per level, a
  question per room, a tempting wrong answer that fails.
- **The first later part**, `public/bladefall-pcore-part-075-gaol.js` with
  `scripts/verify-precision-part-075.mjs`, is the model for file shape.

| Levels | Part | Region | Device module(s) | Palette |
|---|---|---|---|---|
| 75–82 | VII | Gaol (Warden) | gaol: jailers, pressure pods | gaol |
| 83–90 | VIII | Frostfell | frost: ice, wind, frost feather | frost |
| 91–98 | IX | White Court | water: pools, freezing, condensers, currents | court |
| 99–106 | X | Emberdeep | ember: heat slabs on a schedule | ember |
| 107–114 | XI | Foundry | foundry: anvils, belts, moulds | foundry |
| 115–122 | XII | Inversion | gravity: prisms | inversion |
| 123–131 | XIII | Citadel | citadel: spent footholds (+ the echo at the close) | citadel |
| 132–139 | XIV | Throne | throne: echo, wake, re-aimed portals | throne |
| 140–149 | XV | Deep Line | rail: carts, boost strips, switches | deepline |
| 150–159 | XVI | Thunder Cliffs | hook: rings, moving decks | cliffs |
| 160–169 | XVII | Landing Shores | water: the tide, floats | shores |
| 170–179 | XVIII | Colony | watch: lamps, smoke | colony |
| 180–189 | XIX | Palace Path | beam: emitters, mirrors, shutters | palace |
| 190–199 | XX | Sunspire | beam: light through portals | sunspire |
| 200 | — | Capstone | everything | summit |

Glyphs already taken (never reuse one for something else): `# = ^ v < > P o c b x s * l _ A B K Z G H M ~ % !`
and, from 7.254, `R` pressure pod, `I` ice, `f` frost feather, `w` water, `n` condenser, `F` float, `E` heat slab,
`N` anvil, `{ }` belts, `U` mould, `Q` gravity prism, `Y` spent foothold, `C` cart, `-` rail, `( )` boost strips,
`k` switch, `O` hook ring, `S` smoke, `/ \` mirrors, `X` shutter. Foes (`foes:[…]` in the room def: moth, shell,
ram, spit, husk), jailers (`jailers:[…]`), portals (`portalMode`, `portals`) and the other device lists are
room-def fields; see each module's header.

Controls on tapes: `l r u d` move/aim, `j` jump, `x` dash, `g` grab, `s` strike, `p` parry, `q` portal (and the
echo, in echo rooms).

## Files you write (and only these)

1. `public/bladefall-pcore-part-NNN-<region>.js` (NNN = first level). Author rooms with
   `scripts/pcore-author/grid.py` and write the file with `scripts/pcore-author/gen.py` (see the README
   there). Every chapter carries `level:<number>`; one room per level is the norm, a multi-room level is
   allowed occasionally (each room is its own checkpoint).
2. `scripts/verify-precision-part-NNN.mjs`, using `scripts/pcore-verify-kit.mjs`: `routes()`, then for
   **every room** at least one wrong-strategy family with `never(…)` (a few hundred to a few thousand
   tapes; state-based checks count only runs with no deaths), plus `hunt(…)` adversarial searches where a
   skip is plausible. Keep the script under about three minutes.
3. `docs/design/precision-parts/PART-<roman>.md`: the part's table (level · room · question · the wrong
   answer that fails, with counts), what the sweeps caught and how you fixed it, designs you dropped.
4. Your region's device module and drawer, **only** to fix a bug or tune a constant. Rerun the device
   fixtures afterwards and say what you changed in your report.

Do **not** edit `bladefall-pcore.js`, `bladefall-pcore-view.js`, the portals/foes/combat modules, the
Parts I–VI files, other regions' files, `precision.html`, `sw.js`, `build-deploy.sh`, the gate trials, or
the handoff. If a room needs an engine hook, describe it in your report instead. Other builders are
working at the same time in the same tree: never revert or reformat files you did not write.

## How to build a room

1. **Name the question in one sentence** before drawing. One question per room.
2. **Draw it** (grid.py). Rooms are one 320×184 screen. Solid rock around the edge except the exit.
3. **Find the intended route** with `scripts/pcore-author/plan.mjs` (beam search, human action set)
   or by hand with `node scripts/pcore-tape.mjs <id> '<tape>'`, then `polish()` it so the pause menu's
   "play the intended route" looks like a person playing.
4. **Attack it.** Write the tempting wrong strategies as tape families, and run adversarial searches
   (`hunt` with a `reject` that forbids the intended device). When something skips the question, change
   the room, not the check. Alternate solutions are fine only when you find them and decide to keep them;
   say so in the doc.
5. **Look at it.** `node scripts/pcore-shot.mjs <dir> id:<roomId> id:<roomId>@<frames>` and open the PNGs.
   Every device and hazard must read at a glance in the still picture; the route must be readable
   before the player moves. A room that plays but looks like a mess is not done.

## The owner's rules that apply to every room

- The guideline's principles: the mirror rule; one new thing per region (teach it alone, pair it with one
  old friend, then cross it with the rest); the sawtooth (a region's first level easier than the previous
  region's last; its last a little harder than the previous peak); the ceiling (Celeste forgiveness, no blind
  jumps, no frame-perfect windows beyond the core's buffers, one question per room, short retries).
- Momentum (super, hyper, wavedash, wallbounce, portal fling, hook release) is optional before level 150 and
  may be required from 150 on — but teach each one again in its own room first.
- Enemies in about a third of rooms after the Foes part. Portals come back wherever they sharpen a question.
  Older devices return in new contexts (the lantern through a portal was a highlight).
- **Every section mandatory or cut**: no optional side routes, coin climbs or purposeless props. A shard (`*`)
  is allowed only as a deliberate optional reward on a hidden or harder line, and never on the road.
- **Hints** appear only in rooms that introduce a control or an object, and name the rule, never the
  sequence. `question` is the one-sentence question (shown in the pause menu).
- Chapter `blurb` (menu) and `outro` (after the level) follow the tone of Parts V–VI: short, plain, a little
  dry. No exclamation marks.
- Report felt impact, not mechanism: in your doc, say what the player does and feels in each room.

## Checks before you report

- `node scripts/pcore-validate.mjs` (all rooms well-formed), your `verify-precision-part-NNN.mjs` all green,
  `node scripts/verify-precision-devices.mjs` still green.
- Screenshots of every room looked at.
- Your report lists: each level (number, name, question, wrong strategy and its count), device changes,
  anything you are unsure of, and the difficulty curve you intended.
