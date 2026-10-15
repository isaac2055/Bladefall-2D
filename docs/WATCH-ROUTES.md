# Intended routes: watching them, and keeping them working after you edit a level

Since 7.340, every Ascend level you copy into the level builder brings its intended route with it. You can
check, watch, re-record and repair that route yourself, in the game or offline. You don't need an LLM for any of it.

## Watching (the finished game)

- **World map** card: **Watch world** plays every room of that world's road in order.
- **Emerald** between regions (when every world in it is open): watch the whole Emerald (1–20) or Fractured
  (21–40) ascent.
- **Garden & skins**: **Watch Core** under each Core, and **Watch all Cores** in the header.
- **Pause menu** in any room that has a route: **Watch the intended route**.
- `[` and `]` set the watch speed (1×, 2×, 4×, 8×).

## Editing a level without losing its route

1. Open the level in the builder, from **Pause → Edit this level** or from **Level builder → New / Open → Original
   game levels**. The draft stores the game's route (and the climb physics the game plays the room with) in
   `definition.route`.
2. Edit it. The builder's footer says whether the route was made for this version of the level.
3. Press **Test play**. The bar at the top checks the route against the edited level:
   - *Intended route fits*: press **Watch route** to see it play to the exit.
   - *Your edits broke the intended route*: fix it with one of the three ways below.
   - *No intended route yet*: a level you started from blank; same three ways.

### Three ways to fix a broken route

| Way | What you do | What happens |
|---|---|---|
| **Play it** | Clear the level in Test play without dying, starting from **Restart test** | Your inputs are replayed off-screen to make sure they reproduce exactly, then saved as the route. If the old route still worked, the bar asks first (**Use my run**). |
| **Play it, with deaths** | Clear it however you can (deaths and save lanterns are fine) | The bar offers **Use my run**: the solver follows the path you took and builds a clean, deathless route from it. Good for Cores and other long levels. |
| **Find a route** | Press **Find a route** | The solver follows the old route waypoint by waypoint, plays around your edit, and picks the old inputs back up wherever they work again. |

The route is saved into the draft (and undo/redo, sharing, Export and cloud drafts all carry it).

### Offline, with no game open

Export the level (**Export** → `name.bladefall.json`), then from the repository folder run:

```bash
npm run routes -- name.bladefall.json
```

That command checks the route and, if it's broken, searches for a new one and saves it into the file. Re-import the
file with **New / Open → Import a level**. To check a whole folder of exported levels without changing anything
(exit code 1 if any route is broken):

```bash
npm run routes -- --check my-alpha-levels/
```

Hard levels can search longer: `npm run routes -- --budget 3000000 name.bladefall.json`.

## What the solver can and cannot do

The solver searches the same engine the game runs (`public/bladefall-route-solver.js`), so a route it finds
replays exactly. Measured on rooms with one wall tile dropped onto the route (`node scripts/routes/repair-rate.mjs`),
it repaired about 4 in 5 broken routes in Precision Core rooms and about 3 in 5 in the banked superrooms,
usually in about a second (numbers in the 7.340 handoff entry). It struggles where the old
route hit a moving thing at an exact moment (pogoing a patrolling foe, catching a clock or a carrier), because
the edit changes when you arrive. In those places, play the level yourself: a clean clear always works, and a
clear with deaths gives the solver your path to follow.

Six original rooms' routes do not replay inside the builder's test play, because they rely on game-view logic
outside the room (the two finale bosses, and four Fractured rooms whose exits or ledges come from the world map).
Copies of those start with a broken route; re-record or **Find a route** there.

## Checks

- `npm run verify:watch`: every world, both ascents and every Core watched in a real browser, with skipped
  sections listed.
- `npm run verify:routes`: every original level copied into a draft, with routes that don't fit
  listed.
- `node scripts/workshop/routes-check.mjs` (part of `npm run verify:level-editor`): the builder's route flow,
  end to end.

## Making the alpha

Pick your levels, edit them, make sure each has a route that fits (`npm run routes -- --check folder/`), and
keep the exported files together. A release that packages them into the game is the one step that needs Claude or
Codex.
