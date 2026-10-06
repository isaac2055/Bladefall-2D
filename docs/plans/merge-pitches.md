# Merge Pitches (7.257.0)

Isaac asked to see how the new physics could reach further into the base game, "like a merge", using the Outskirts and Frostfell as examples. These are three playable prototypes behind **Title → Merge Pitches**. They are pitches, not decisions: nothing in the campaign changed.

| Pitch | What it is | Where it runs |
|---|---|---|
| A · The Outskirts, room by room | The whole region rebuilt in the new physics as six linked screens | `precision.html?pitch=outskirts` |
| B · Frostfell, one mountain | Frostfell as one continuous scrolling climb | `precision.html?pitch=frostfell` |
| C · The road itself | The real base-game road, with two stretches handed to the new physics in place | the base game (`index.html`), Level Select–style session |

## A · The Outskirts, room by room

Six screens slide into each other the way Celeste's do. There is no wipe and no card between rooms; one card appears at the end.

| Room | What it asks | Who is there |
|---|---|---|
| The Poisoned Verge | Jump the poison, then dash a pool too wide to jump | Vey at the watchfire |
| Camp Echo | Climb to the sentinel's perch; the ASH stake opens the shaft; leave by the top | The sentinel |
| Watcher's Cut | A chasm two crystals wide; GLASS on the far post | Olan |
| Hollow Mile | Cracked road over a long pit; IRON at the far post | Mara |
| Mothlight Descent | Strike a moth pod to cross the thorns; leave by the floor | — |
| The Gatehouse | Set the boundary lantern on the plate to hold the Mothlight gate | — |

- **People stand in the rooms** and speak when the knight walks up; their lines appear over the room, with no conversation screen.
- **Mara's survey is the puzzle's key.** Her three bearings (ASH, GLASS, IRON) are tally stakes that open each room's way. Her chart fills in at the top of the screen and appears on the end card.
- **What adopting it would mean:** each region becomes a chain of precision screens. The base game's combat, shops and long walks would need their own answer, because the screens carry the platforming and the story only.

## B · Frostfell, one mountain

One room of 120 × 46 tiles (about six screens). The camera follows the knight, so there are no screen edges. The route snakes through the mountain:

1. Banked Refuge
2. Working Streets: ice floes over the river
3. Thermal Works: the duct's wind carries a long jump over the pit, with a crystal halfway
4. Frozen Stair: an updraft, then a feather jump onto the ledge
5. Exposed Galleries: ice landings and feathers over the thorn gulf
6. Muster Crown: the vent out of the top

**Hearths** (Nim's braziers) keep your place: dying puts you back at the last hearth you passed, not at the bottom. **Nim** follows the knight's own path a moment behind.

**What adopting it would mean:** the base game's continuous world survives, but the new physics runs it. This is the closest of the three to a full merge.

## C · The road itself

The real Outskirts road from Hollow Mile to Broken Muster, played in the base game with nothing changed. It has two **pockets**:

| Pocket | World x | Covers |
|---|---|---|
| The Fallen Mile | 7440–8720 | The Hollow Mile's two pits |
| Broken Muster | 9640–10920 | The muster's palisade and gate (the IRON stake again) |

Walking into a pocket:
1. The camera pulls back about 2×, until the stretch fills the screen.
2. The stretch plays as one precision screen, drawn over the base game's own sky, moon, scenery and road.
3. The pocket's floor is the road's ground line. Walking out of its right edge puts the knight back on the base road at that spot.
4. The camera closes back in.

There is no wall, no menu and no frame to step into. Once a pocket is cleared, the base game's own ledges come back on that stretch, so walking back is ordinary base-game road.

**What adopting it would mean:** both engines stay, and the new physics owns only the stretches where the road "breaks". That is the cheapest path from today's Gate Trials (walls that open a level in a frame) to something seamless.

## How it is built

**Core.** A room may now be larger than one screen (`cols`/`rows` in the room definition; default 40 × 23).
- `bladefall-pcore.js` reads the room's own size everywhere it used the screen size.
- The view (`bladefall-pcore-view.js`) gives a large room a camera that follows the knight.
- Every existing room replays identically: a digest of all 273 taped rooms matches the pre-change core frame for frame.

**Pitch rooms.** `public/bladefall-pcore-pitches.js` registers its rooms only on a pitch page (`?pitch=`), so the Precision Courses menu, level numbers and gate trials never see them.
- The chapters are `bonus:true`, so they sit after level 200 and the bonus sets.
- Every room has an intended tape, and each tape finishes with no deaths.

**Pitch view.** `public/bladefall-pcore-pitches-view.js` (`BladefallPitchView`) handles:
- palettes and backdrops (the Outskirts at dusk, Mothlight, snow);
- people, props and hearths, the speech lines and Mara's chart;
- the room slide and the end card;
- pocket mode (transparent page, placement from the host).

The view calls it through one-line hooks, each a no-op outside pitch pages.

**Pocket host.** `public/bladefall-merge-road.js` (`BladefallMergeRoad`) owns the title menu and Pitch C. It places the frame with the respec renderer's own mapping:
- canvas x = world x − `G.cam`
- canvas y = `GROUND_Y` + `G.camY` − world y
- one precision pixel = 4 world units, so both knights stand 44 units tall.

The base game answers three hooks, all keyed on `G.mergeRoad`:
- `saveRunAtStage` leaves the Continue save alone;
- the renderer skips a knight marked `mergeHidden`;
- the gate trials stand aside.

## Checked

| Check | Result |
|---|---|
| Pitch A, headless Chrome | All six rooms on their tapes, five slides, all three bearings, the end card |
| Pitch B, headless Chrome | The mountain on its tape; hearths 1–5 taken in order; camera and Nim followed |
| Pitch C, headless Chrome (title → Merge Pitches → C) | Walked the road; both pockets opened, played and returned the knight to the road; the end card appeared; the Continue save stayed empty; no page errors |
| Regressions | Precision Courses menu still lists 218 chapters with no pitch; level 1 plays to its card; a gate trial opens; `?pitches` lands on the menu |

Screenshots were checked at 1280 × 720.

## Isaac's calls

- Which direction, if any, to take further: A (screens), B (one continuous world) or C (pockets in the road).
- **If C:** should a cleared pocket stay a precision stretch on the way back, rather than handing the road back to the base game?
- **If A or B:** what replaces base-game combat inside the new physics? Part IV's foes are the starting point.
