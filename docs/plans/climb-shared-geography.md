# Emerald Ascent: intact worlds and short folded crossings

Default build: `precision.html?pitch=climb`.
Cache v434-grounded-scenes; main scripts7.273.40.

## Current design

All nine worlds retain the original main sequence, maps, relative room
coordinates, and optional branches. There are no internal switchbacks.

Only the12 interworld passages use folded geometry: a short local corridor
connects two distant regional mouths. The overview keeps the emerald regional
arrangement, but its distance no longer dictates playable travel distance.
Each corridor is48 tiles wide, with40 tiles between its mouths and an8-row
collision envelope matching its visible ceiling, headroom, and floor. Junctions
are56 columns wide, with openings positioned clear of the neighbouring authored
room. Hearths sit near the forks, keeping travel short despite that clearance.

Socket transfer maps mouth-relative position into the destination mouth,
preserving direction, velocity, dash state/timer, and remaining dash count.
The camera translates by the same amount as the knight, preserving his screen
position across a crossing. Subsequent frames follow normally, without a shade
transition or a room-boundary camera clamp.
Original physical room joins retain global-coordinate continuity. No changes
to knight drawing, animation, movement constants, or challenge geometry.

Passage names and IDs, NPCs, biome art, destination labels, hearths, regional
unlock rules, and legacy checkpoint migration remain. Long service-lift rides
and transit winch detours are absent from the compact passages. The map projects
the player's passage progress onto the corresponding regional link. Passage
resume still uses the same saved left/right entrance, with new local positions.

Every visible folded mouth now draws its actual destination in a fixed aperture,
with the destination floor aligned to the approach. Preview rendering receives
the translated local camera so terrain culling works across distant coordinates.
Jumping between junction tiers does not select or replace the other openings.
Short solid tunnel roofs match the aperture, with stone lintels, foundations,
and masonry around the passages. Approach signs identify destinations; folded
corridors no longer introduce a second return label at the ownership change.
Ordinary room joins are unchanged.

The complete surrounding scene now shares a junction coordinate frame on both
sides of each folded boundary. Regional scenery, masonry, and neighbouring tiers
remain visible after entering a passage. Reusable canvas layers carry that scene
80 pixels into the corridor, then blend spatially into its interior over64 pixels.
Physical regional footprints remain opaque throughout the blend. Projected
corridors are clipped out of those footprints, and scene donors remain available
for a full viewport after their mouths scroll offscreen. Decorative corridor
aprons cannot be entered above the walking opening.
Both endpoint scenes are composed independently, avoiding a midpoint scene swap.
The same composition is visible from the approach. Integer camera coordinates,
terrain culling, and NPC/hearth rendering are shared by live and preview views.
Stacked openings remain fixed; only distant atmosphere blends as the camera
looks between roads. This is a spatial blend, not a timed screen fade.

## Verification

- New full-view regression checks address what the old boundary-only check missed:
 24 projected corridor footprints have zero overlap with original rooms. All24
 mouth boundaries reject access to decorative aprons. All24 passage trips with
 repeated jumps and dashes reach their correct destinations without deaths.
- Browser `Audit ground and scrolling`:2808 supporting-floor probes across all12
 corridors and three camera offsets; zero erased floor probes. Frozen-frame,
 one-pixel camera sweeps compensate for scrolling before comparing the image.
 Maximum changed area: Gatehouse0.312%, Rootwater Descent1.948%, Pilgrims’
 Viaduct0.365% (threshold32 color levels). These checks caught the offscreen-mouth
 culling failure and the full-scene overlays obscuring physical rooms.

- Complete regional journey harness: all12 links in both directions, plus the
 three original lower-world itineraries, without repositioning during trips.
 Normal-speed hearth-to-hearth traversal:8.4–9.8 seconds, mean9.2.
 Full harness:21584 movement frames.
 This measures actual input simulation at60fps; it does not accelerate physics.
-48 folded socket handoffs preserve an active dash, including timer, direction,
 velocity, and consumed dash. No arrival intersects solid terrain.
-71 directed socket transitions pass;105 individual original challenge tapes
 still exit directly to the next original section or final regional junction.
- All12 local corridor interiors and39 junction roads traverse both ways.
-24 passage entrance checkpoints resume through the Continue handler.
- Nine intact original sequences,96 direct challenge joins, and25 retired
 switchback checkpoint migrations pass.
-4608 passage tiles have exclusive ownership and no overlap with original
 worlds. Branch/return geometry remains unchanged.
-39 junction apertures stay stable; cleared Gatehouse revisits remain silent.
-48 mouth previews tested at three player heights: actual destination, aligned
 floors, stable rendering transforms, and translated terrain cameras. All71
 directed runtime seams retain camera continuity, including folded screen position.
- Browser raster gate (`Audit folded crossings` on the geography review page):
 all48 directed folded handoffs pass, with fewer than0.05% of scene pixels
 changing at a fixed camera/frame. Maximum20 of58976 pixels (0.034%).
 Wayside Arches ↔ Pilgrims’ Viaduct:0 changed pixels in either direction.
 Wayside Arches ↔ Rootwater Descent:0 pixels in either direction.
 This captures the production scene renderer without HUD or knight, and checks
 actual room transfer before comparing. Movement/dash continuity is covered by
 the separate runtime tests. Original aperture-only preview tests did not catch
 the whole-scene swap; the raster gate now covers that failure.
- Co-op cross-region drawing/hold-T checks pass. The map marker stays within
 the overview while the player is in a folded passage.
- Browser inspected compact Rootwater and walked its exit into Rootwater Hollow,
 with preserved velocity and no death. Standard pause menu retains11 Outskirts
 rooms, optional routes, the two external passages, level select, and title return.
 The review iframe still sometimes logs an unattributed MutationObserver error
 during navigation; no game-rendering failure was observed.
- Browser inspected both Rootwater Hollow return openings, both Pilgrims’ Landing
 openings, and the Wayside Arches Woods opening. The connected floors and scenery
 are visible before crossing. Walked Rootwater Hollow into The Buried Spillway
 at normal speed, with no death or loss of movement.

Tests are individual authored challenge replays plus integrated regional trips,
not a claimed uninterrupted fresh-save playthrough of all nine worlds.
No deployment or Git commit was performed.
