# Precision Core authoring kit (7.254)

Scratch-grade tools for building Precision Core rooms after Part VI. Nothing here runs in the game.

- `grid.py` — draw a 40×23 room: `G().walls()`, `rect(c,r,w,h,ch)`, `put(c,r,ch)`, `show()`, `js()`.
- `gen.py` — `emit(out, part, title, header, chapters, rooms, tapes)` writes a part file
  (`public/bladefall-pcore-part-NNN-name.js`) that calls `BladefallPrecisionRooms.addPart`.
- `plan.mjs` — `plan(roomId,{sets,score,key,...})`: beam search with a human action set
  (walk, jump, climb, dash, strike, parry, portal), compressed. Then `polish()` from
  `../pcore-search.mjs` to make the tape read like a person played it.
- `../pcore-search.mjs` — `search` (breadth-first, exhaustive within its action set and node budget),
  `beam` (deep, not exhaustive), `polish`, `compress`, `snapshot/restore`, `gameAt`, `run`.
  Use `search`/`beam` with a `reject` predicate to hunt for skips (e.g. "never touch the pod").
- `../pcore-shot.mjs <outDir> 75 76:0@120` — screenshots from headless Chrome, as a player sees them.
- `../pcore-sync-page.mjs <version>` — adds every device and part file to `precision.html`, `sw.js`
  and `build-deploy.sh`.
- `../verify-precision-devices.mjs` — device rule fixtures; `../verify-precision-part-NNN.mjs` — each
  part's routes and wrong-strategy families.
