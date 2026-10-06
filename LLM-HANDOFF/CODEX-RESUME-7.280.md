# Resume brief for Codex: The Climb, 7.280 cleanup (written 2026-10-06)

Read this first, then the 7.280.0 entry at the top of `LLM-HANDOFF/01-CURRENT-STATE.md` and the run-6 entries at the top of
`docs/plans/climb-worlds-15-20-progress.md`. The connected-world design you must preserve is
`LLM-HANDOFF/EMERALD-ASCENT-TRANSITIONS.txt` (sections 1–8). The game is played at `public/precision.html?pitch=climb`.

## 1. What Isaac asked for (2026-10-04) and where each item stands

| # | Request | State |
|---|---|---|
| 1 | Zipline from the base game's Void Tyrant in 13/14 and later | **Done.** Device `public/bladefall-pcore-dev-zipline.js` (+view), room field `lines:[{a:[c,r],b:[c,r],setDown,oneWay,once,period,upT,phase}]`. Taught in base 13 (three-ride crossing to the arena), used in 14, 16, 17, 18, 19 and across the Fractured act. |
| 2 | Momentum moves (super/hyper/ultra/wallbounce) only in the Fractured act | **Done** for base 1–20 (no base route uses them; scan with the event check in §6). Six momentum-lesson rooms and the momentum secret rooms moved to Fractured 22, 23, 37–40. |
| 3 | Inversion screen glitch on a gravity flip | **Done** (`public/bladefall-climb-view.js`: camera, connected drawing, frozen rooms, scarf). |
| 4 | Fractured levels much harder, rising from 21 | **Rooms done** for all of 21–40 (Room by Room sources; `verify-rbr` passes 1–40; ramp measured by `scripts/pcore-lab/difficulty.mjs`, brief `docs/plans/fractured-hard.md`, per-region notes `docs/plans/fractured-progress/NN.md`). **Climb builds unfinished** for 21–24, 29, 31, 32, 35, 38–40 (see §3). |
| 5 | Harder bosses; new Fractured mechanics | **Done.** Base bosses (Brute, Marksman, Warden, Sorcerer, Colossus, Tyrant, King, Hydra, King in Daylight) have more phases, a second attack and one twist each, all opt-in room fields (see each `bladefall-pcore-dev-rbr-*.js` header). New devices: fault stone (`T` + `fault:{}`), the shade (`shade:{delay,count,gap}`), mirror panes (`|` + `mirror:{}`). |
| 6 | Entering secrets is finicky | **Done.** Every ceiling door shows a light beam; hold Up under it and the knight is lifted in (`scripts/climb/lift-check.mjs [world…]`). |
| 7 | Map/navigation; approved nested-diamond map | **Done.** `public/bladefall-climb-map.js` (schematic, zoom/pan, both emeralds, open/locked links, YOU pin); junction signs say where each mouth leads and why a sealed one is sealed. |

## 2. What is deployed (7.280.0, `./build-deploy.sh` output in `netlify-deploy/`, not yet published)

- Base worlds 1–20: rebuilt with everything above.
- Fractured worlds rebuilt hard: **25, 26, 27, 28, 30, 33, 34, 37**.
- Fractured worlds still on their old 7.279 builds (easy first-pass reflections): **21, 22, 23, 24, 29, 31, 32, 35, 36, 38, 39, 40**.
- All section-8 verifiers, `feature-check` and page-check of the new worlds passed on that set.
- Versions: every changed script `?v=7.280.0` in `public/precision.html` and `public/sw.js`; cache `bladefall-v444-game-cleanup`.

## 3. What is left, in order

The machine had six builds running when this was written (31, 32, 38, 39, an old 23, and 40 queued). Isaac is killing them;
nothing of value is lost: every road they had finished is cached (§5).

1. **Add World 36.** It finished: `scripts/climb/.cache/worlds-r6/w36.json`. Copy it to `scripts/climb/.cache/worlds/`.
2. **31, 32, 38, 39: the secret-door search never ends** on the hard rooms (16–20 h each). Give each a short
   `secret:{hosts:[…2–3 road rooms…], rooms:[…3 rooms…]}` in `scripts/climb/spec.mjs` (pick road rooms with a thick, quiet
   ceiling and no moving devices), then rebuild with the road cache:
   `node scripts/climb/build-climbs.mjs --only N --verbose --reuse-road --emit scripts/climb/.cache/worlds-r6`
   (`--reuse-road` takes the newest `road-N-*.json`; their roads are from 2026-10-05 and match the current rooms).
3. **21: "no way back from rowan-echo".** Rowan's echo (fo21-q-lamp, fo21-q-bell) finds no passage home. Options: let it
   return into its own first room (`spec.noLoop` not set), move its door room, or give it a builder `lift`; rebuild 21
   (its road is NOT cached for the current mirror set; a fresh road takes 30–90 min).
4. **22, 23, 24: the road runs back into its own rooms.** Each region has "U-turn" rooms (fire and exit on the same wall).
   I added `spec.mirror:[…]` (lay a room reflected in the Climb; `scripts/rbr-src/mirror-lib.mjs`) so each room is met from
   its fire's side, but the road then doubles back: 22 `fw22-oath3` overlaps `fw22-oath1`; 23 `fc23-well` overlaps
   `fc23-counterpoise`; 24 `fu24-span` overlaps `fu24-needle`. Fix by changing which rooms are mirrored (mirror the U-turn
   room itself and fewer after it), by reordering a little, or by a builder option that offsets the next room vertically.
   Check pairs with `node scripts/climb/tools/plan-mirror.mjs N` (plans) and `node scripts/climb/tools/check-mirror.mjs N id…`
   (does a reflection still play). The old World 23 build was stuck 20 h in its road search (nested turn fallbacks).
5. **29: its departure junction has no free wall.** Both right-hand mouth heights of 29's crossroads project over its own
   `fs29-gglass` / `conn-4`, and the left wall holds only two mouths (29-30, 29-31, 29-32 need three). The new 29 build is
   `worlds-r6/w29.json` and plays fine; only the junction fails `verify-climb-projected-terrain`. Options: a third departure
   slot in `landscapeJunction` (`public/bladefall-climb-geography-build.js`), a gate room for one link (`spec.sockets`, as
   19–1 and 20–3/5/7), or reordering 29's last rooms so the crossroads sits clear.
6. **35: its secret door is in a cart room** (`fd35-buffer`): the hold-Up lift cannot hold a knight on a moving cart and
   page-check's door route dies. Set `secret.hosts` to still rooms and rebuild (road cached). When the new 35 goes in,
   **delete the five `'3x-35'` entries in `SIDE` in `public/bladefall-climb-passages.js`** (they are for the old reflected 35;
   the new 35 is entered from the left like the Deep Line, and its `reserve` in spec.mjs is already the left-hand one).
7. **40:** build it fresh (`scripts/climb/tools/build-world.sh 40`, no `--reuse-road`; its cached road is from before the redesign).
8. **37's echo way back** stalls in one passage piece in page-check (`cl37-pass-165`); not a softlock. Optional fix.
9. **Assemble, check, deploy:** copy each finished `worlds-r6/wN.json` into `scripts/climb/.cache/worlds/`, then
   `node scripts/climb/build-climbs.mjs --assemble scripts/climb/.cache/worlds`; run the verifiers below; page-check the
   changed worlds; bump `?v=` for `bladefall-climb-worlds.js` (and any other changed file) in `public/precision.html` and
   `public/sw.js` and the `CACHE_NAME` together; `./build-deploy.sh`. Update the handoff and progress docs.

## 4. Decisions waiting for Isaac (do not decide them yourself)

- Should a road also open from its far end (walk back the way you came)? Now a road opens only when its source region is done.
- Keep the old room-layout map behind its toggle, or remove it?
- The six momentum-lesson rooms moved to Fractured (some have plain routes): keep moved, or keep in base?
- Lift feel (150 px/s, Up held 5 frames); should the lift protect him from a room's hazards (World 18/38 watch lights)?
- Mirror panes are walls unless dashed through; the shade kills if you stand still; Fractured 33–40 lean heavily on tears
  and three-lane rooms: playtest for fairness and variety.
- Fractured bosses' twists, the King in Daylight's air-only hits, Noon kept at three blooms.
- The gate links 39–21 and 40–23/25/27 (mirrors of 19–1 and 20–3/5/7) are not built.

## 5. Where things are

- **Room sources:** `scripts/rbr-src/NN-*.mjs` + `NN-*.tapes.json` → `node scripts/rbr-src/gen.mjs NN` →
  `public/bladefall-rbr-NN-*.js`. Never regenerate 25–40 with `fracture.mjs` (they are hand-made now; it refuses anyway).
- **Climb spec:** `scripts/climb/spec.mjs` (`WORLDS` order/quests/secret/mirror/sockets/reserve; `SAVED_FOR_LATER`).
  Builder: `scripts/climb/build-climbs.mjs` (7.280 additions: `ringed`/`cutAtSeam` way-back proofs, upright exit snapshot,
  `spec.mirror`, `spec.noLoop`, `spec.exits`, `spec.secret.first`).
- **Build outputs (gitignored, on this machine only; rebuildable but slow):** `scripts/climb/.cache/worlds/` (the set the
  page is assembled from), `worlds-r6/` (this run's builds and logs, `run.sh`/`run-reuse.sh`), `worlds-7279/` (backup of the
  7.279 set), `road-N-*.json` (cached roads). Do not delete them.
- **Lab:** `scripts/pcore-lab/` (device teaching rooms, `difficulty.mjs`, `check.mjs`).
- **Helpers:** `scripts/climb/tools/probe-wayback.mjs N branchId` (walks a way back in the page, tries plain climbing when
  a scripted piece stalls), `apply-orders.mjs` (writes orders into spec.mjs), `shot-world.mjs N`, `shot-map.mjs`.

## 6. Checks (lean; Isaac does not want endless verification)

- Server: `node public/serve.mjs` (port 8371).
- Rooms: `node scripts/verify-rbr.mjs [NN…]`.
- Geography (section 8 of the transitions doc): `node scripts/verify-climb-geography-footprints.mjs`,
  `verify-climb-projected-terrain.mjs`, `verify-climb-folds.mjs`, `verify-climb-geography-runtime.mjs`,
  `verify-climb-geography-resume.mjs`, `verify-climb-geography-traversal.mjs`, `verify-climb-mouth-views.mjs`,
  `verify-climb-geography-coop.mjs`, `verify-climb-junction-regressions.mjs --geography`, `verify-climb-contained-worlds.mjs`.
- Page: `node scripts/climb/page-check.mjs N` (roads, branches, ways back), `scripts/climb/feature-check.mjs`,
  `scripts/climb/lift-check.mjs N`.
- Known page-check quirks that are not bugs: World 1's and 6's secrets "not entered" (the scripted door route; the lift works);
  gate rooms (`socket-*`) have no reward or way home; a way back that "stalls" in a climbing piece may still be passable by
  plain grab+up (check with probe-wayback).
- Look at a screenshot of anything you change before calling it done.

## 7. Traps

- Headless Chrome leaves ~700 MB profiles in `$TMPDIR/puppeteer_dev_chrome_profile-*`; one run filled the disk. Delete stale ones.
- Device modules must load in sorted file order on the page (`precision.html` was fixed); node (`scripts/pcore-tape.mjs`)
  sorts too. Keep new `pcore-dev-*.js` tags in that order.
- A junction mouth must not share a wall with its corridor's far end (folded passages cannot do same-wall corridors);
  `SIDE` overrides in `bladefall-climb-passages.js` set both ends.
- Don't bump `?v=` per file by hand piecemeal: bump every changed script and `CACHE_NAME` together before deploying.
- Do not commit unless Isaac asks; do not build the APK.
