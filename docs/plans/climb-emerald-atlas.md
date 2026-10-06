# Emerald Ascent: regions 1–9

The approved regional layout is the normal Climb journey at `precision.html?pitch=climb`.

The lower braid is Outskirts → Black Woods / Broken Causeway → Updrafts / Hollow Marksman → Ruined Keep. The upper braid is Ruined Keep → Frostfell / Warden → Frost Sorcerer. Clearing each region opens its outgoing roads in both directions. Clearing the middle authored sections on both sides opens Black Woods ↔ Broken Causeway and Updrafts ↔ Hollow Marksman.

## October 3 connector rework

The first connector implementation repeated a staircase over a central gate. Its boundary test placed the knight directly at the transfer point; it missed the preceding collision with the room bounds, and its carry function discarded the active dash/jump state. The renderer also revealed only a thin slice of the destination, causing scenery to appear suddenly after entry.

Walking seams now admit the knight's whole body through the open aperture and transfer at the body centre. They preserve movement state, dash timing/colour, variable-jump timing, input buffers, scarf and trails, and the camera's coordinate frame. No physics tick is skipped. Closed apertures and ordinary Core room bounds remain solid.

The adjoining environment is drawn before crossing, including the original rooms below upward junctions. A union mask and corridor priority prevent overlapping atlas scenes from showing through each other. Camera bounds include the destination's elevation, and the authored room's vertical clamp eases in after crossing instead of pulling the knight down the screen. Rock colours remain tied to their side of the boundary. The first room's return entrance uses the same walking-seam logic. Falling back through an upward exit suppresses re-exit until the knight clears the ceiling, preventing a return-path loop.

## Twelve different places

| Connection | Passage | Shape and identity |
| --- | --- | --- |
| 1–2 | Rootwater Descent | Rooted riverbank descending through forest, ferns and mushrooms |
| 1–3 | Pilgrims’ Viaduct | Broken masonry piers above an undercroft, distant bridge arches |
| 2–4 | The Canopy Vent | Vertical branch switchbacks inside a hollow tree |
| 3–5 | Sentry’s Aqueduct | A sunken channel with cascades, pipes and stepped banks |
| 4–6 | Bellwind Stair | A tall bell tower with staggered stone landings and a great bell |
| 5–6 | The Forgotten Siegeway | Collapsed siege engine, rubble and a shuttered service road |
| 6–8 | Thawline Cloister | Meltwater basin beneath hanging ice |
| 6–7 | The Chainwell | Deep prison shaft, abandoned cages and a working counterweight lift |
| 8–9 | Glasswater Gallery | Ice shelves across a mirror lake, crystals and aurora |
| 7–9 | Condemned Procession | Rising ceremonial avenue, statues, banners and service passage |
| 2–3 | The Buried Spillway | Low, vaulted drainage culvert with an inspection walk |
| 4–5 | Windcut Underpass | Sagging rope spans, sails and wind across an exposed ravine |

Passages differ in their terrain, size, elevation, material and silhouettes. Only three use shutter winches. The Chainwell lift carries a rider slowly to the upper dock, waits for dismount, then returns empty. All passages have safe lower ground and fires at both ends. Four residents describe the places. Regional junctions use the adjoining region's platform materials.

The broader world design draws on Team Cherry's emphasis on geographical logic and memorable places in their [map-design interview](https://www.pcgamer.com/how-to-design-a-great-metroidvania-map/) and [ACMI interview](https://www.acmi.net.au/stories-and-ideas/from-ludum-dare-to-pharloom/). Artwork is original canvas geometry; no Hollow Knight assets are used.

## Navigation and preservation

Pause exposes room select, connecting passages, level select, world map, and return to title in ordinary play. Level select starts at the original authored section. Continue retains the last fire and the side from which a passage was entered. Demonstrations return to the starting fire without awarding completion. The three section skips remain available.

Optional errands, secret branches, one dash, and knight rendering are preserved. The knight/scarf drawing block is byte-for-byte identical to the pre-enhancement backup. Generated authored world source is unchanged. Old winch saves migrate across the connector layout change; cleared gates and pressure doors remain open on return.

Regions 10–20 remain reserved topology only. No later playable regions were added.

## Implementation and verification

`bladefall-climb-atlas.js` owns progression. `bladefall-climb-passages.js` constructs the twelve authored layouts and junctions at registry load. `bladefall-climb-passage-art.js` renders their scenery and materials. `bladefall-climb-view.js` manages live seams, neighbouring views, checkpoints and the counterweight. Core's boundary exception applies only to a game's explicitly opened walking seams. Demonstrations are generated by `scripts/build-climb-passage-tapes.mjs`.

- `node scripts/verify-climb-atlas-runtime.mjs`: aggregate connector regression suite. Covers 71 directed seams in four movement conditions (284 actual approach/cross/follow-through cases, with elapsed time before approach), all 105 original main-section tapes, twelve complete routes in both directions, three winches, 39 reachable junction outlets, original final exits and return paths, demonstrations, non-overlap, frozen-state drawing, the counterweight ride/dismount/return, fresh-state checkpoint restoration and old-save migration.
- `node scripts/verify-climb-atlas.mjs`: graph, unlock conditions, save round-trip, endpoints, one dash and future boundaries.
- `node scripts/verify-climb-art.mjs`: original environments and character overlays remain render-safe and isolated to Climb.
- `node scripts/verify-precision-core.mjs --movement-and-routes`: 287 shared movement and original intended-route checks. The default invocation still includes the much longer puzzle-strategy search; that full search was not completed for this change.

`climb-passage-review.html` is a local review fixture using the actual game loop and renderer. It provides passage selection, frame stepping, counterweight boarding, the original Outskirts ending, road traversal, and a before/after scenery pixel audit. The previous stationary audit did not catch a delayed routing conflict; a small pixel difference alone does not prove a journey is correct.

## Junction revision after route screenshots

The reported wall trap was reproducible after waiting in Wayside Arches: generic return logic fired when the knight's body reached the left edge, before the Black Woods socket could transfer its centre. It returned to the Gatehouse at the wrong elevation. Socket-owned entrance edges now bypass that legacy handler. Horizontal terminal entrances have explicit reciprocal room sockets; forward previews preserve the original section-completion event. The Black Woods return mouth accounts for the actual toggle-block floor and its two-tile clearance.

The missing reciprocal preview also caused the original Gatehouse behind the knight to be replaced by Rootwater scenery on entering the junction. Both sides now draw the original room and the junction consistently, including the junction's supported roads. Open junction skylines are not masked by a rectangular artificial ceiling.

Junctions now span 84–104 columns where the map allows it, with solid lower banks, long branching roads, and masonry arches, roots or ice beneath upper roads. The two upward terminal entrances retain their 40-column footprint and an open shaft through the bank. Region-specific junction names replace the generic high/lower-way titles. No six-level central platform stack remains. The fire sits in the central basin. Layout checks ensure the broader approaches do not overlap original or optional rooms.

Each passage carries its adjoining region's actual skyline 320 pixels into the borderland with a spatial alpha blend. Ground colours transition over 256 pixels to the passage material. The same blend is used before and after crossing, with parallax anchored to the adjoining region.

`verify-climb-journey-continuity.mjs` plays the original Outskirts ending, waits at junctions and follows ordinary movement inputs through both requested complete trips: Rootwater Descent → Black Woods; and Pilgrims’ Viaduct → Broken Causeway → Buried Spillway → Black Woods. Both finish in the original Black Woods first section with zero deaths. All final authored exits also check clear arrival geometry before testing return travel.

The new stationary audit covers 71 directed sockets, with 0–3.10% changed pixels (including dynamic gates and the player). This supplements complete route tests and visual inspection. Evidence in `docs/evidence/climb-passages/junction-revision/` includes the original Outskirts scene before and after walking across its boundary. Normal browser checks confirm room select, connecting passages, all nine level cards, and the title-return link.


## Fixed entrances and Gatehouse audio follow-up

The previous revision still selected just one neighbour per edge using the knight's height. As a result, jumping made other entrances appear to close. `visibleSockets` now returns every entrance with a fixed vertical view interval determined only by map geometry. Terrain, background views, clipping and labels share those intervals; atmospheric blending softens the boundary between nearby views. Pilgrims’ Landing's Spillway and Viaduct entrances stay visible together. Rootwater Hollow displays its original Black Woods entrance below the Outskirts road. All main room entrances now have gold **ENTER THE CLIMB** / **RETURN TO THE CLIMB** signs. Junction and passage titles remain visible, and passage headers show both connected regions.

The loud Gatehouse buzz was a repeated `held-close` event. Restoring a solved room opened a pressure gate before each simulation tick; Core's plate logic closed it again during that tick. The reproduction emitted 180 closing sounds over 180 frames. Cleared pressure gates now carry `latchedOpen`, which the existing gate update honours. Three separate 600-frame visits generate zero open/close sounds; ordinary unsolved pressure gates still close normally.

`verify-climb-junction-regressions.mjs` checks every junction entrance remains in the render plan across a range of player heights, that each walking aperture fits in its permanent view, and the audio regression. The complete-journey test now also follows the Causeway → Spillway → Hollow → Rootwater → Wayside route into the original Gatehouse and walks back to Muster Yard. Both Black Woods trips continue beyond entry and complete the first playable section. These trips use normal simulation input and have zero deaths.

Evidence for this follow-up is in `docs/evidence/climb-passages/static-entrances/`. The earlier stationary seam pixel figures belong to the preceding revision; they are not used as evidence for this change. Browser inspection confirms both Pilgrims’ Landing exits at different elevations, the labeled Black Woods entrance and actual crossing into The Root Tunnel. The full connector suite and all 287 movement/intended-route checks pass.
