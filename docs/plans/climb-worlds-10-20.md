# The Climb · worlds 10–20 — plan

**Progress (7.274.0, 2026-10-04): worlds 10–14 are built and connected** (see the handoff's 7.274.0 entry). Still to do: 15 The Deep Line (an arrival with 5 mouths, 3 on one side), the outer circuit 16–19, 20 Sunspire (mid-world sockets), the 19–1 arrival junction for the Outskirts, and ratings for 10–20.

Written 2026-10-03, on 7.273.41. Production is paused on Isaac's word. This file records what extending the connected Climb to 10–20 needs, in the order the working design requires it. The design itself is `LLM-HANDOFF/EMERALD-ASCENT-TRANSITIONS.txt` (Codex, confirmed working by Isaac): read it first and do not rebuild what it describes.

## How the connected world works (what must be preserved)

**The road.** Each original world is one continuous climb, built by `scripts/climb/build-climbs.mjs` from Room by Room's regions and Isaac's ratings, and written to `public/bladefall-climb-worlds.js`. At page load the geography layers place it and connect it, without changing any challenge room:

- **`bladefall-climb-atlas.js`** holds the regional graph: positions, links, opening rules and the checkpoint save.
  - A road opens when its source world's last room is solved. A crossing opens when both ends' last rooms are solved.
  - Open links work both ways.
- **`bladefall-climb-passages.js`** gives every world two junctions:
  - an *arrival* junction before its first room, holding its incoming links and crossings;
  - a *departure* junction after its last room, holding its outgoing roads.
- **`bladefall-climb-geography-build.js`**:
  - reshapes junctions to 56 columns with tiered roads;
  - translates each whole world to its anchor;
  - replaces every link with a **folded** corridor of 48×8 tiles, with mouths at x=32 and x=352. The corridor is stored off the map and projected at its two mouths.
- **`bladefall-climb-geography.js`** handles spatial queries and the camera.
- **`bladefall-climb-view.js`** handles the crossing itself (`enterPassage`: the full motion snapshot, with x and y translated by the mouth planes and floors) and the rendering:
  - `drawConnectedGeography`, `clipExterior` and `maskEndpoint`;
  - offscreen scene donors are kept.

**What not to change.** Map distance is never walking distance. Never choose which doorway exists from the player's height. Never fade or swap the scene at a seam.

## What 10–20 needs, in order

### 1. Inputs (Isaac)
- **Ratings.** Room by Room has all eleven regions built: 12–16 rooms each, one errand each, the full kit, and a route for every room. Of these, only five rooms of region 13 are rated. The climb order (easy first, nothing above the cap, hard rooms kept for later) needs his difficulty and fun ratings. They come from the Room reviews panel, exported as `room-reviews.json` and `.csv`.
- **Difficulty cap.** It is 7 today, and the cap's original purpose was "nothing above 7 yet; hard rooms later". 10–20 is "later", so ask whether the cap rises (8–10) there, and where the rooms kept for later (o1-ridge, w2-canopy, m5-drop and others) go.
- **Secrets.** Each world needs a pool of Precision Course rooms. Parts VII–XX are themed per region.
- **The oathblade's eight-way cut (`spec.aim8`)** is on in worlds 1–2 only. Ask before extending it.

### 2. Graph (`bladefall-climb-atlas.js`)
There are 23 new links.
- **Crown roads (10):** 9–10, 9–11, 9–12, 10–13, 12–14, 13–15, 10–15, 11–15, 12–15, 14–15.
- **Outer roads (6):** 13–16, 16–17, 17–18, 18–19, 19–20, 20–14.
- **Spokes (7),** unlockable crossings drawn dashed on the map: 16–8, 17–4, 18–2, 19–1, 20–7, 20–5, 20–3.

The positions are in the handoff. Move the `reserved` entries into `links`.

### 3. Junction capacity: the real blockers
Counted with the current side rule (`side(l,n)` from the x positions):

| World | Arrival junction (left / right) | Problem |
|---|---|---|
| 15 The Deep Line | 3 / 2 | geography-build allows **2 mouths per side** (arrival floors [18,26]) |
| 20 Sunspire Palace | 4 / 0 | over, and by design it must not be one junction (below) |
| 1 The Outskirts | 1 / 0 | it has **no arrival junction** today (`w.n!==1`); the 19–1 spoke needs one |

All the others fit. Fixes:
- **Deep Line:** give the arrival junction three floors per side, or route 11–15 through the bottom edge (11 sits directly below 15). The floors must keep `clipExterior` clearance from the first room.
- **Outskirts:** build an arrival junction for 1, holding only 19–1.
- **Sunspire is one continuous region, the whole right flank.** Its entrances must sit **along its climb**, opposite the Warden (7), Hollow Marksman (5) and Broken Causeway (3), with its ends at 19 and 14.
  - This needs a new capability: **mid-world sockets**. A side mouth is cut into a chosen road section at a given floor, with a reciprocal socket, the same folded corridor, and the same projected view.
  - Nothing else in the 20-region map needs it, so build it once, for Sunspire, using the existing socket and fold helpers.
- **Deep Line departure:** it has none. It is the apex, so decide whether it ends the game there or loops.

### 4. Corridors and art
- Each new link needs a `designs` entry in `bladefall-climb-passages.js` (name, style, floors, columns) and a style in `bladefall-climb-passage-art.js`.
- New biomes (ember, inversion, void, abyss, deep line, cliffs, shores, colony, path, sunspire) need materials and scenery. `furnishPassage` takes the scenery per style.
- Add `highNames`, `lowNames`, `names` and `palettes` for 10–20.
- Add `anchors` in geography-build: regional px for the crown above 9, the outer left column, and Sunspire's tall right flank.

### 5. Build
- Add `WORLDS` entries for 10–20 in `scripts/climb/spec.mjs` (order from the ratings, quests, secret pool), then `node scripts/climb/build-climbs.mjs --only N --verbose --emit scripts/climb/.cache/worlds` for each world in parallel, and `--assemble`.
- The road cache (`scripts/climb/.cache/road-N-*.json`) keeps rebuilds of branches quick. A first road build takes about 20–30 minutes per world, all in parallel.
- Branch rules still apply: a quest or secret is a place to explore with a reward at its end; its way back leads to its door room or its own entrance, never on ahead; there's a spring where a passage climbs; drop-through works.

### 6. Validation (from the handoff, with counts extended past nine regions)
```
node scripts/verify-climb-projected-terrain.mjs
node scripts/verify-climb-geography-journeys.mjs
node scripts/verify-climb-geography-traversal.mjs
node scripts/verify-climb-geography-runtime.mjs
node scripts/verify-climb-folds.mjs
node scripts/verify-climb-mouth-views.mjs
node scripts/verify-climb-geography-footprints.mjs
node scripts/verify-climb-geography-resume.mjs
node scripts/verify-climb-contained-worlds.mjs
node scripts/verify-climb-junction-regressions.mjs --geography
node scripts/verify-climb-geography-coop.mjs
node scripts/climb/page-check.mjs N        # each new world: road, branches, rewards, ways back
node scripts/climb/feature-check.mjs       # co-op across worlds and passages, T, N, the route
```
Then, in `climb-geography-review.html`, run "Audit folded crossings" and "Audit ground and scrolling", and walk it by eye. Isaac asked for short runs rather than long suites, so run the targeted ones for what changed.

## Co-op on the connected map (7.273.41, checked)
- Joining puts you in your partner's world; after that neither player is ever pulled along (explore at leisure).
- Your partner is drawn live across worlds. Inside a folded passage they are placed along that passage's route between its mouths, not in the off-map fold space. An edge arrow shows them when they're out of sight.
- Holding T folds you into light beside your partner: across worlds, into passages, landing on clear ground. A quest or secret reached that way is sealed.
- Each player clears their own sections; opened links are per player.
- "Watch the intended route" hands the room back ("Your turn"), and N skips three road sections per world.

## Next (Isaac): touch controls on the APK
The last APK was good, but the controls are still tricky. See `docs/plans/` and the memory note on mobile touch (7.258: a floating stick; right side tap to jump, swipe to dash, hold to grab, double-tap to parry; two fingers swipe to strike, tap for the portal). Start from his playtest notes on what feels tricky.
