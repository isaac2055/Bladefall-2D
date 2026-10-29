# Ascend in Godot — the first three worlds and their Fractured versions

Version **0.23.0** · A native Godot 4.5.1 prototype of **The Outskirts, Black Woods, Broken Causeway and their Fractured versions**, plus a standalone **Movement Workshop**, isolated from the shipping browser game on `codex/godot-outskirts-refinements`. This is an engine comparison, not a replacement release or a full Ascend port.

## Causeway workshop rooms · 0.23.0

Open **Play Causeway Rooms.command**, or choose workshop rooms **14–16** in Esc. These are three separate checkpoints with optional H hints and ordinary-input demonstrations:

- **The Stored Rise:** load and release two recoil plates, recovering between launches.
- **The Turned Span:** turn an upright arm into a bridge, use a short hop beneath the overhead teeth, then climb the far steps.
- **The Loaded Span:** launch to the hub landing, turn and cross the arm, then rise straight up from the far plate before steering over the final teeth.

These are no-dash studies using the existing jump, climb, strike and lift-momentum rules. All thirteen earlier workshop layouts and recordings are preserved. The simple editor now places **Recoil platform** and **Hinged arm** objects. Recoil settings expose width, load depth, loading time and release speed; arm settings expose hub position, length and starting direction. Saving edits clears the changed room's outdated demonstration, with its previous version retained in backups. Older thirteen-room imports preserve the new rooms.

## Play

On this Mac, double-click `Play Ascend.command`. It uses the local pinned engine; on a fresh Mac checkout it downloads the official universal binary and checks its SHA-256. Alternatively, open `project.godot` in Godot and press F6/F5, or run:

```sh
prototypes/godot-ascend/tools/run.sh
```

The local standalone application is `exports/Bladefall Ascend Prototype.app`. Rebuild with `tools/build-macos.sh`. The app carries its own Godot binary and packed project, and runs without the repository or Node. Exports and engine downloads are ignored by Git. This first package uses the universal editor binary as its runtime carrier (about 352 MB), rather than a size-optimized export template. The game data and scripts are packed separately in the small PCK. The local app is ad-hoc signed for local use; it is not Developer ID signed or notarized for distribution.

Controls now match the browser defaults: **arrows** move/aim, **Space/C/J** jump, **D/X/K** dash, **A/Z/Shift/L** cling/climb/carry/throw, **W/V/I** strike, **F/O** parry, **P** portal and **R** retry. Each room’s original action locks still apply. **Esc** opens the pause menu; **M** toggles music and **F11** toggles fullscreen. The standard controller equivalents are mapped too (stick/d-pad, A jump, X/B dash, LB/LT cling, Y strike, RB portal and RT parry).

The pause menu includes a **chapter selector** for The Outskirts, Black Woods, Broken Causeway and their three Fractured versions. All six chapters are constructed before play, and switching preserves each chapter’s progress and position. **Start world over** resets the current world, bearings, room machinery, deaths and dialogue history without closing the app. Retry resets only the current room and preserves bearings and lit stakes. The pause menu also contains the room selector, Watch/Take control, a dedicated sound mixer, spoken dialogue toggle, reduced motion and lighting comparison. Audio and display preferences persist locally. The app starts directly in the game rather than an engine-study toolbar.


Returning Seed now requires all three route pickups to be brought back to the flag. The browser editor offers **Return shard · one** and **Return shards · all**, with a shared room finish rule and live pickup counter. Death/retry restores unbanked shards.

## Two more Black Woods rooms · 0.21.0

**The Overturned Hollow** and **The Returning Seed** are workshop rooms **12 and 13**. Open **Play New Woods Rooms.command**, or choose either room in Esc. H provides an optional hint; Esc includes a deathless ordinary-input demonstration. Both rooms are available in the simple browser editor.

Overturned Hollow uses amber as starting floor, missing ceiling and restored landing. Returning Seed uses one pod twice through different faces of a phase-controlled housing: rebound outward in blue, reach the bell from the far loop, open the roof in amber, then rebound and dash to create the blue homeward landing. The outward cut is diagonal down-left with jump held, followed by steering right; the upper return approaches the same pod from the other side. This develops the proposed two-way use with the actual existing rebound rules.

The previous eleven layouts, movement constants and campaign scenes are preserved. No quests, voices, art conversion or campaign connections were added. Old eleven-room editor files retain both new rooms when imported.

## Black Woods puzzle workshop · 0.20.0

The **three initial Black Woods rooms** are available in the Movement Workshop, numbered **9–11**: The Borrowed Branch, The Crooked Orchard and The Hollow Crown. Borrowed Branch remains a short introduction; Orchard and Crown are rebuilt around phase preparation and route commitment. The original eight rooms and campaign layouts are preserved. Open **Play Black Woods Puzzles.command**, select room 9 with Esc, or launch `-- --world 4 --room 8`.

Use **W + arrows** to cut, **Space** to jump (hold it for a high downward pod rebound), **D + arrows** to dash, **A** to cling, **R** to retry, **H** for an optional hint and **N** for the next room. Esc offers solution demonstrations.

The six weaker standalone Woods layouts are retired from the active list. Older six-, eight- and seventeen-room editor documents merge surviving rooms by ID. A seventeen-room import retains its complete original document in browser storage before filtering retired rooms. Native backups and Git also preserve the earlier layouts. No new quests, speech or campaign connections are included. Gameplay retains its 8px grid and collision independent of visuals.

See [the room descriptions and verification](WORKSHOP.md).

## Two workshop rooms added in 0.18.0

The workshop now has **eight rooms**. **The Divided Tower** offers two ordinary-input solutions around one counterweight: take its rising launch to the airborne refill pair and cross high, or dash through the opened lower passage and catch the returning weight as a foothold. **The Falling Gallery** uses a crumble platform first as a dash-restoring foothold, then as the opening through which you return to the retreating ferry with the shard.

Both rooms have two demonstrations in **Esc → Demonstration**, including a Gallery return discovered by independent input search. The original six rooms are preserved. Open **Play Movement Workshop.command**, press Esc and choose room 7 or 8; **N** advances rooms. They are also editable directly in **Edit Workshop Rooms.command**. Older six-room editor exports/drafts merge into the current workshop while retaining the appended rooms.

The new native tests compare both Tower routes under separate mechanic restrictions, retain actual solver-discovered shortcuts as positive regression controls, and search for fresh inputs instead of only replaying intended tapes. Search failures remain bounded evidence. See [WORKSHOP.md](WORKSHOP.md) for the design and verification limits.

## Dedicated room editor · 0.17.0

Double-click **Edit Workshop Rooms.command** for a simple local browser editor of all thirteen workshop rooms. Choose a terrain brush, paint on the grid, or place and drag objects. Select a moving block to drag its destination, resize it, or change its pause and return timing. Select a rectangle of terrain to move ground. Undo/redo, exact positions, room settings and optional hints are available without Godot's scene tree or Inspector.

**Save & play** saves directly to the native workshop scene and opens that room in the actual Godot project. Every save keeps a backup; unsaved browser drafts can be recovered after reload. Import/export provides a portable editable file. Conflicting external edits are reported before writing, and changed rooms stop offering outdated demonstrations. Campaign scenes and browser shipping files are outside this editor's write path. The packaged app is rebuilt separately; the editor's Play action always uses current project files.

See [the short editor guide](room-editor/README.md), or click **How to edit** inside the editor. Node.js and the pinned Godot engine are required; both are already present on this Mac. No hosting or account is needed.

## Movement Workshop · 0.16.0

Six standalone movement rooms are available through **Play Movement Workshop.command**, or **Esc → chapter selector → Test · Movement Workshop** in the standalone app. No campaign progress is needed. **R** retries, **N** selects the next room, and **H** reveals a hint. Esc offers room selection, Previous/Next and **Watch solution**. Every room has an ordinary-input demonstration; watching awards no completion.

| Room | Connected problem |
| --- | --- |
| The Broken Relay | Launch horizontally, spend the dash catching the vertical weight, then finish using its upward launch. Preserved from 0.15. |
| Behind the Counterweight | Open the passage, cross beneath the weight, then catch it returning as a higher foothold. Preserved from 0.15. |
| Under the Lintel | Preserve the dash through the first lift transfer; ride beneath a structural dividing wall, then launch from the horizontal carrier toward the flag. |
| The Return Ferry | Prepare the gate outward, collect the shard, then dash through the opened lower passage and catch the returning ferry. |
| The Counterweight Engine | Relay into an upper seal/refill pocket, pass beneath the partition, then reuse the same returning counterweight as the final foothold. |
| The Smuggler’s Circuit | Prepare the gate and return with the shard, recover on the ferry, reach the high refill, and activate the finishing lift for its upward launch. |

The last three require their carried pickup at the flag. Death/retry restores an unbanked pickup; Start world over clears session completion. Player movement constants are unchanged. Blocks retain the default 4-frame activation, 30-frame outward trip, 30-frame hold and 120-frame return unless explicitly authored: the ferry pauses for 60 frames, and the Circuit's finishing lift returns over 600 frames. These local timing choices support preparation and activation order; they are not new player abilities.

The workshop is chapter 4 in `levels/world4.tscn`, with source data and demonstrations in `data/world4.json`. All six rooms are separately editable through **Movement Workshop · test level** in the Ascend dock. Larger rooms have smooth camera follow clamped within their boundaries; the first two retain fixed framing. No connecting passages, campaign edits, quests or recordings are added.

`tests/workshop.gd` verifies native round trip, six deathless ordinary-input solutions, observed resource/device states, nearby successful timings, causal counterfactuals and bounded shortcut searches with positive controls reproducing earlier failures. It also checks actual application play, pickup resets, demonstrations, navigation and camera behavior. GPU mode captures starts, critical transfers, finishes and the menu. These checks establish functional behavior, not enjoyment or exhaustive route uniqueness. See [WORKSHOP.md](WORKSHOP.md).

```sh
.cache/godot/Godot.app/Contents/MacOS/Godot --headless --path prototypes/godot-ascend --script tests/workshop.gd
```

## Classic knight, scenery treatments and mixer · 0.12.0

**Esc → Sound mixer** is now near the top of pause. The dedicated panel has Master, Music, Effects, Voices, Ambience, Knight efforts and Menu sounds channels. Individual effect gains apply to live playback; zero stops and disables that sound. Preview rotates through an effect's existing takes, with separate music, ambience and dialogue previews and a Stop button. Channel levels and effect overrides save automatically. Esc returns from the mixer to pause; Back and Resume stop previews. Restore mixer defaults resets gains and channels.

Opening and closing pause are silent, including the actual pause and Resume buttons. The old pause callback played `ui-pause.mp3` after the other players had been paused, making the clip particularly prominent. That recording, its import resource and its manifest entry are removed; the importer prevents its return. The prototype now reuses **124 existing files and 42 dialogue entries**. The browser audio bank remains a separate reference source.

The **knight** menu now has ten close relatives of Pixel Classic: Classic, Fine, Weathered and Bold pixel variants; Contour and Crosshatch ink; Soft and Brush illustration; Folded Classic and Layered Classic paper. Every alternative retains the compact helmet, facing side visor, blue tunic, small gold crest and scarf, boots and classic proportions. The previous non-Classic knight renderers are removed. Pixel Classic's renderer is unchanged, and the eight people renderers and shared prop drawing functions are byte-for-byte preserved. The existing gradual cape settling remains.

**Scenery** offers Original Watch Road, Moonlit Engraving and Purple Original Game; Dawn Ramparts is removed and its saved selection migrates to Original. Purple uses the browser Outskirts sky and stone colors. A separate **Treatment** selector offers Masonry, Smooth continuous stone and Weathered rock strata for every palette: **nine combinations**. Smooth interior tiles have identical colors and no internal grid, with exposed edge highlights and softened ridges. Weathered adds organic strata/grain and restrained atmosphere. Each palette keeps its landmarks and overall composition across treatments; physics, collision, routes and checkpoints stay unchanged. The new scenery and knight selectors remain focused on the base Outskirts.

`tests/refinements.gd` exercises silent pause buttons, absent audio resources, channel mute, actual preview gain, immediate per-effect stop/disable, all ten knight choices, nine terrain combinations, seam-free smooth interiors, unchanged gameplay, and preference reload. GPU mode produces knight and nine-scenery sheets plus the mixer capture, verifies distinct knight pixels and compares each silhouette with Classic. Evidence is in `.cache/godot/refinements/`.

## Outskirts styles · 0.11.0 (history)

In **Esc → Outskirts appearance**, the knight and people now have independent menus with four drawing families and two designs each. The original Pixel, Ink and Illustration drawings retain their IDs and appearance; the additions are Pixel Steel, Ink Etched, Illustration Storybook, Paper Folded and Paper Cutout. The new designs change silhouettes, helmets, clothing, faces and mark-making. NPC work tools and poses and the knight's held lantern, attacks and parry remain in place.

The Outskirts cape uses shared, render-time cloth direction across all eight designs. It preserves momentum when stopping and settles to hanging over about one second. Its exponential easing uses elapsed time, with matching settling at 30 and 144 fps. The pixel chain follows the same smoothed direction; draw calls and previews never advance the cloth simulation.

The **Scenery** menu retains Original Watch Road and adds **Dawn Ramparts** (warm light, layered hills, aqueduct arches, cypresses and sandstone masonry) and **Moonlit Engraving** (indigo sky, crescent moon, outlined ridges, etched spires and blue hatched blocks). Both replace the background drawing and terrain atlas while preserving collision, room geometry, routes and hazards. They update while paused and persist independently of character choices. New preferences apply only to the base Outskirts; the other five chapters retain their existing appearance. Older appearance preferences migrate as the initial Outskirts selection. The controls are disabled in other chapters.

`tests/style_expansion.gd` verifies actual menu choices, the other chapters' retained settings, cloth momentum/settling/frame-rate independence, unchanged gameplay/collision, and actual preference save/reload. Its GPU mode produces an eight-design knight/resident comparison and all three scenery captures, and checks distinct pixels for every design. Native source and packaged evidence lives in `.cache/godot/styles/`.

## Native chapter editor · 0.10.0

Double-click **Edit Ascend.command**. The Ascend dock opens all six chapters and their **197 native rooms**. Choose a room to center the 2D view, paint its TileMapLayer, move/select objects, edit Inspector values and Curve2D routes, then **Save + play this room**. Standard Godot save, duplicate, delete and undo work. The dock's Add action copies a configured object into the selected room and supports undo/redo.

Saved `levels/world*.tscn` scenes feed gameplay directly. Exact no-edit round trips preserve every imported/native room, map, device setting, route, quest and reward. The browser JSON references remain unchanged, and native repairs are applied once during import. Props expose position, rotation, scale, tint and petal colors; people add per-instance style. Bunnies expose paths, timing, radius and tint. Fixture footprints control their map/collision size, and advanced dictionaries retain other device and story settings. Validation catches invalid placement, paths and missing references before the dock launches play.

See [EDITOR.md](EDITOR.md) for the editing workflow, source boundaries and verification commands. Editor checks exercise saved tile collision, props, NPC styles, bunny paths/timing, mechanism coordinates and palettes in every chapter; the actual Godot UI check covers all chapters, selection, framing, layout, add/undo/redo and saved edits. The packaged game passes 27 integration cases, plus GPU checks for authored colors and transforms. All 322 browser-reference traces / 95,367 frames still match. Local evidence is in `.cache/godot/editor/`. This editor adds no quests, recordings or Explore changes.

## Outskirts hazards and character renderers · 0.9.0

Outskirts dust bunnies now advance while their rooms are unvisited/asleep and during the player's freeze, death and respawn. Retry preserves their phase; world restart begins a new clock. Other machinery retains its authored wake rules. This is a native World 1 behavior change; the other chapters' bunny behavior and colors are unchanged.

Four hand-placed **white flower** patches in the Outskirts put Vey's warning into play. Sap lasts 180 physics frames (three seconds) after last contact and refreshes while touching a patch. Running is reduced to 55%, jump launch to 67%, and dash speed to 60%; an existing dash/jump is weakened immediately on first contact. The status line shows remaining time and petals mark the affected knight. Death/retry cures it. Ordinary movement constants are never edited. The first gap has a tested clean jump over the patch and thorns; touching the patch makes the same crossing lethal. Harmless colored flowers stay clear of the toxic patches. Native placements and tuning live in `data/white-flowers.json`; original browser maps are unchanged.

Esc → Knight appearance now offers **Pixel, Ink and Illustration**, with independent **People** styles and live previews. The two new knight renderers use continuous curves and pen/paint shapes, keeping the silver helmet, visor, blue body and golden cloth. They replace the old costume swaps. All characters render at full output resolution; pixel terrain remains crisp. Measured walking is fixed for the base knight and the other gait choices have been removed. Saved obsolete gait choices migrate to measured. NPCs have new drawn silhouettes/faces with their existing tools/poses, plus the original pixel option.

The real carried lantern now uses the same handled glass/flame/cage drawing as the floor lantern, with raised hands instead of an anonymous block. Outskirts lifts have timber decking, iron straps, rivets, cables and pulleys. Causeway lift artwork is retained. No changes were made to Elsie's table placement/shape, Mirror Thicket's spike layout or Black Woods bunny colors. At 0.9.0 no editor was built; 0.10.0 adds the native chapter editor described above.

**Watch reference** remains the original browser-reference room fixture, without the new live-only flower hazards or autonomous bunny clock. Take control, room entry and chapter switching restore the live rules. `tests/revision.gd` checks these transitions, all bunny clocks, freeze/death/retry, contact/expiration/cure, recovery, run/jump/dash strength, in-flight dash contact, all four patches, lethal versus clean crossings, style selection and saved preferences. `tests/art.gd` now tests all knight/people combinations and renderer pixels. The final packaged build passes 25 integration/regression cases, GPU renderer/style checks and all 322 unmodified browser-reference traces / 95,367 frames. Native mechanic tests cover the requested deviations separately. A mixed audio capture has no clipped samples; the local app signature verifies. Evidence lives in `.cache/godot/revision/`.

## Character and environment art · 0.8.0 (history)

**Esc → Knight appearance** offers **Measured, Stride, March, or Off** for walking and **Classic, Wayfarer, or Sentinel** for the knight. The three designs retain the same small blue knight, narrow visor and gold cloth silhouette. Live previews show idle and both walking directions while paused. Both selections persist and apply across all six chapters; the menu scrolls to keep the audio/display controls accessible. Off freezes the legs while retaining the normal movement, cape and feel effects.

At rest the shoulder cloth hangs nearly vertically with a small wave. At speed it blends into the previous trailing curve. Walking uses visual foot placement, lift and knee details; no input, body dimensions, physics or collision is changed. NPCs now have shaped coats, lapels, faces, boots and role-specific clothing while keeping their authored tools and work poses.

The environment pass adds staggered masonry and chips, moss and grass clusters, colored flowers and detailed ferns, background ruin/forest/viaduct detail, bark scars, four directional pale hazard silhouettes, fuzzy dust bunnies, cut-gem bezels/facets, lantern handles/flames and machinery inlays. Foliage checks actual support, headroom, nearby hazards, people, campfires and devices. Authored flower/fern patches move to a nearby safe ledge within their room, or are omitted if none exists; the original map/prop data remains unchanged. Grass checks live terrain clearance before drawing, including retractable seams.

`tests/art.gd` covers cape geometry, all 12 appearance combinations across chapters, unchanged simulation state, actual preference save/reload and all painted foliage patches. Its GPU mode compares pixels for all four gait choices and three designs and confirms still legs with Off. `tests/art_gallery.gd` renders a native art sheet. The final audit covers 16 safe painted patches: six relocated and four omitted. The 0.8.0 app passes 24 integration/regression cases plus GPU appearance, gallery, entity and movable-stone checks. All 322 browser traces / 95,367 frames still match. Its inspected 4.59-second mixed capture is non-silent with zero clipped samples. Evidence is in `.cache/godot/art/`; gameplay and browser data are unchanged.

## Feel and atmosphere · 0.7.0

Presentation now adds speed-scaled landing compression, two-sided dust, floor shock lines, a damped camera impact and the existing heavy landing recording. Dash-start (the actual core event) launches a pulse, a short actor presentation hold and a tinted, stretched trail. Contact sparks follow real wall-slide state at a simulation-frame cadence. None of these effects change inputs, movement, collisions, simulation freeze, checkpoint timing or physics steps; the 45 ms visual hold sits over the existing three-frame dash freeze.

The camera uses velocity lead and a critically damped spring with continuous world coordinates. Impact impulses decay separately; respawn resets framing at the checkpoint. Death breaks into rose-colored fragments and a fading pulse, then respawn has a warm ring and vertical bloom. Quest/secret hearts expand with rays, hold above the player, arc toward the HUD, then settle with a halo; awards stay idempotent and do not stall play.

All six chapters have distinct effect accents, lighting and ambient drift: cool blue and gold Outskirts, green woodland motes, warm iron wind, violet Fractured Outskirts, teal Fractured Woods and rose-violet Fractured Causeway. Reduced motion removes visual holds, camera impulses, shake, look-ahead and ambient drift, and reduces burst counts and sprite compression. No new assets, voices or quests are generated.

`tests/feel.gd` exercises actual landing/dash/wall contact/death/respawn events, reward fixtures, camera settling and reduced motion. It snapshots player/entity/combat/beam/event/frame/freeze state around 679 presentation updates at varied render deltas. Run with an output directory using the GPU renderer to capture six moods and each effect. Existing browser parity and continuous-road tests remain the movement authority. `tests/feel_journey.gd` replays the complete Outskirts Fractured road through the actual app: 7,907 unchanged physics frames, 18 smooth ownership transfers and zero deaths with varied render deltas. All 322 browser traces / 95,367 frames still match, and the packed build passes 22 integration/regression cases plus the GPU effect check. The inspected 3.67-second mixed audio take has no clipped samples. Core, world, devices, authored data and application input/physics scheduling remain unchanged. Evidence lives in `.cache/godot/feel/`.

## Fractured worlds · 0.6.0

Choose **Esc → chapter selector → Fractured Outskirts, Fractured Woods or Fractured Causeway**. All 112 authored rooms (38/37/37) are preloaded alongside the original three chapters. This imports existing authored worlds; it adds no quests, dialogue or voices. Existing echo errands and regional secret hearts have front-entry gates, one-time rewards, retry retention and restart reset. Progress remains session-only. Inter-world passages remain previews, and Explore/browser files are unchanged.

Native devices now include Sentinel bells and the two-stage encounter, moving hooks and rings, ziplines, beam mirrors/shutters, oath roots and resin wind, moths, anvils, feathers, void stones, paired portals, gravity prisms and mine carts. World-only entry repairs preserve authored shafts and align the East Counterweight and final arena mouths with their four-tile climbing connectors; three retractable entry seams visibly close near their campfire and reopen for backtracking. Watch restores the browser's authored closed seam at those checkpoints. Original exported room maps remain intact for reference tests. Dash-movable stones now have a visible body both before and after being moved.

The audio manifest reuses **125 existing files and 42 voice entries**, including regional Fractured scores and recorded echo dialogue. The original unvoiced connector line stays subtitle-only. No synthesis or ElevenLabs requests were made.

Reference checks cover all six worlds: **322 traces / 95,367 frames, zero mismatches**, including nested rope/riding state, combat, beams, roots, and targeted parry/portal inputs. The Fractured main roads complete in **7,907 / 6,583 / 8,954 frames**, all with zero deaths. Their recordings use normal inputs from the initial campfire through the crossroads, without position changes, room warps or state resets. Room Watch checks cover 21/23/23 playable authored routes; socket previews are excluded. GPU checks verify visible paint for all 28 authored entity types, including sliding stones.

```sh
node prototypes/godot-ascend/tools/export-world.mjs --world=21 --check
node prototypes/godot-ascend/tools/parity.mjs --world=21
# Repeat for 22 and 23.
# Godot --path prototypes/godot-ascend --script res://tests/fractured.gd
# Godot --path prototypes/godot-ascend --script res://tests/fractured_journey.gd
# GPU renderer required for tests/fractured_render.gd.
```

`--fractured-tour 21` (or 22/23) replays a continuous road through the actual application. Tests distinguish geometric branch connectivity, checkpoint route completion, and reward-state fixtures; they do not claim complete normal-input optional-branch return journeys. The 0.6.0 packed app passes 21 integration/regression cases, plus both GPU paint checks (28 entity types and idle/moving stones). Actual packed captures cover all three Fractured chapters. Its inspected 3.52-second mixed WAV is non-silent with zero clipped samples; the local app signature verifies. Evidence is in `.cache/godot/fractured/`.

## Broken Causeway · 0.5.0 (history)

Choose **Esc → chapter selector → 3 · Broken Causeway**. The new chapter contains all 28 authored rooms, including the 15 taped main-road sections, Silas’s existing **The Clockwork Defector** quest, and the **Glass Ladder / Cog Heart** secret. Inter-world passages remain isolated previews; the chapter selector switches worlds. Explore and the browser game are unchanged.

Causeway has its own dusk palette, layered broken viaducts, chains, winches, crates, standards, clockwork Silas and armored Brutes. Sliding stones now react to directional dashes. Native devices include load/release platforms, safely jamming hinged arms, cracked braces, counterweights, the Brute’s two-crush armor and grounded stamp waves. Combat actors keep the original arena bounds while the knight uses continuous world collision. One native-only repair gives the governor entry clearance for the lower room’s four-tile block and a one-way lip onto the upper floor; original browser exports stay unchanged.

The Iron Causeway score, Iron Juggernaut boss score, heights ambience and existing dialogue are copied byte-for-byte. Across all three worlds the manifest contains **102 existing files and 26 voice entries**, with SHA-256 provenance. No quest or voice was generated. Silas’s governor opening, key pickup, death recovery, toll-hook hand-in and visible heart award use the existing quest. Progress remains session-only; retry keeps rewards and Start world over clears them.

Verification adds:

```sh
node prototypes/godot-ascend/tools/export-world.mjs --world=3 --check
node prototypes/godot-ascend/tools/parity.mjs --world=3
node prototypes/godot-ascend/tools/seam-check.mjs --world=3
```

World 3 matches **46 browser/native traces and 14,496 frames**, including complete combat actor state and stamp waves. World 1 retains 47 traces / 14,221 frames; World 2 retains 41 / 12,340. Native packed-app checks cover chapter switching, all main-road Watch routes, governor timing, key recovery, reward idempotence, existing recordings and restart. Continuous normal-input proofs reach the crossroads in **5,386 frames**, complete Silas’s whole quest in **2,261 frames**, and enter, earn and return with the Cog Heart in **1,302 frames**, all with zero deaths. Each proof starts from one checkpoint and then uses no room warps, state resets, forced quest steps, physics edits or invulnerability.

The corresponding checks are `tests/causeway.gd`, `tests/world3_journey.gd`, `tests/silas_journey.gd` and `tests/world3_secret.gd`. Development tools `record-world3.gd`, `record-silas.gd` and `record-cog-heart.gd` regenerate the input recordings. `--causeway-tour` and `--silas-tour` play the road and quest through the actual application. Tests and development tools are excluded from the packaged application. The evidence directory is `.cache/godot/causeway/`.

## What is native

- `scripts/core.gd`: fixed 60 Hz movement with per-pixel collision, subpixel remainders, JavaScript-compatible negative rounding, buffers, coyote time, variable jumps, directional dashes and freeze, supers/hypers/wallbounces, wall climbing and stamina. World 1's stakes/gates, lantern/plates, refills, crumbling platforms, moving lifts and swept thorn collisions are simulated in GDScript. Godot physics bodies are not used.
- `scripts/room_loader.gd`: reads the authored character maps at 8 pixels per tile, including grouped machinery. The runtime does not contain or use the JavaScript-parsed collision arrays.
- `scripts/landscape.gd`: cached TileMapLayer terrain with varied stone, grass edges and weathering; layered hills, clouds, towers and arches; animated tents, flags, clocks, palisades, campfires and NPC work poses; native GPU embers and drifting motes; ambient/point lighting with real terrain shadow occluders; a restrained grading/vignette shader. Jump, landing, dash, refill, gate and death effects sit above the unchanged simulation. Render interpolation, camera easing and a constrained animated plume smooth movement at higher display refresh rates. The plume turns slate when the dash is spent. Adjoining terrain stays visible across doors.
- `scripts/audio.gd`: original **Midnight Field** score and plains ambience, nearby fire audio, alternating existing effect/effort takes, footsteps and climbing sounds. Music continues across rooms, ducks beneath speech, and pauses/resumes with gameplay. Spoken NPC lines are queued, not cut off or restarted every frame; matching subtitles stay readable when voices are disabled.
- `scripts/controls.gd`: physical keyboard mappings imported from the shipping browser defaults, plus named Godot gamepad equivalents.
- `scripts/world.gd`: all 30 Outskirts, 27 Black Woods and 28 Causeway room simulations, entities and hazards constructed before play; shared world collision; persistent machinery; physical travel in either direction; carried-object transfers and recovery; Ash/Glass/Iron collection and Mara acknowledgement.
- `scripts/world_layout.gd`: native-only geometry repairs, including a one-tile Black Woods kitchen roof alignment and a separate upper-watch overlook and reversible stair instead of the old junction overlapping the Gatehouse. Exposed boundaries are visible stone. Original exported browser fixtures remain intact.
- `scripts/main.gd`: keyboard actions, room selection, retry, full-world restart, bearing HUD, recorded route playback, continuous room ownership, and the comparison lighting toggle.
- `data/world1.json`, `data/world2.json` and `data/world3.json`: the original world definitions, tapes, constants, player defaults and source provenance. Parsed test oracles are generated fresh by the reference runner. Source hashes identify the exact browser modules used. JavaScript is used only by the development exporter/reference tests, never inside the Godot application.

## Verify

From the repository root, with Godot available via `GODOT` or the downloaded local engine:

```sh
node prototypes/godot-ascend/tools/export-world.mjs --check
node prototypes/godot-ascend/tools/parity.mjs
node prototypes/godot-ascend/tools/seam-check.mjs
.cache/godot/Godot.app/Contents/MacOS/Godot --headless --path prototypes/godot-ascend --script res://tests/application.gd
```

The reference runner loads the real browser core and all its device modules. It generates fresh traces, then launches Godot to compare native state every frame. The checked state includes player scalar fields (positions, velocities, remainders, stamina, movement states and timers), entity fields, carried-object identity, freeze/death/exit state, and the native map/entity parser. Numeric tolerance is 1e-8; whole-pixel movement is unchanged.

Current Outskirts result: **18 authored route traces + 29 deterministic varied-input probes, 14,221 compared frames, no differences**. The standalone core retains its original behavior; optional world collision callbacks enable continuous play. All 14 reference main-road transfers also match the browser. The exported browser data stays unchanged; native geometry fixes are applied separately at startup. The application check feeds real keyboard events, loads every room, plays all 14 main challenges to the crossroads without death, takes control from playback, presses the actual full restart button, and exercises death with a cross-room lantern. Watch replays the original isolated room fixtures; normal play uses the continuous world. Captures from the actual GPU renderer and browser are in `.cache/godot/`; the second pass is under `.cache/godot/polish/`. A captured mixed WAV demonstrates music, effects and speech with no clipped samples in the inspected take. An earlier polish capture reported 118 fps; the 0.3 full-world LaunchServices capture reported 81 fps on this Mac. These are observations, not portable performance guarantees. The 0.3 packed application, polish, world, connectivity and stair checks all pass. Its 5.18-second mixed WAV contains music, effects and speech with zero clipped samples.

Additional checks:

```sh
node prototypes/godot-ascend/tools/import-controls.mjs --check
node prototypes/godot-ascend/tools/import-audio.mjs --check
.cache/godot/Godot.app/Contents/MacOS/Godot --headless --audio-driver Dummy --path prototypes/godot-ascend --script res://tests/polish.gd
```

The polish check verifies the real D/A/C/W events, controller input events, all manifest MP3 decodes, non-silent output from Godot's mix bus, exact matching speech/subtitles at all six main-road NPC approaches, no repeated speech, ducking, mute, pause/resume, actual shadow occluders, and reduced motion. It does not write user preferences. Physical controller hardware has not been exercised.

`tools/export-world.mjs` regenerates data after an intentional browser source update. `--check` detects stale exports. The default command checks World 1. Use `--world=2` for Black Woods or `--world=3` for Causeway. These establish the measured chapter cases, not compatibility with later worlds or every engine module.

Additional continuous-world checks (run with the same Godot command prefix): `tests/world_checks.gd`, `tests/connectivity.gd`, and `tests/stair.gd`. They verify preloaded machinery, walking across the repaired camp floor and back, climbing/dropping through the Lookout, cross-room lantern recovery, normal-input collection of all three actual bearings with no deaths, Mara’s recorded acknowledgement, progress retention on retry/death, full restart, reciprocal collider openings across the connected world, and normal jumps both ways through the new stair. `tests/world_shots.gd -- OUTPUT_DIRECTORY` captures the repaired areas and restart menu for visual inspection. Current captures and logs are in `.cache/godot/world/`.

## Deliberate prototype boundaries

This contains the full first-three-world and corresponding Fractured room data and their supported movement/interactions, with all rooms selectable for inspection. All main-road rooms and optional branches are physically connected. The between-world passage previews remain outside the chapter travel model; use the chapter selector. Mara now registers all three bearings and speaks her existing completed-chart recording. Campaign saves, other quest chains/unlocks beyond Mara, Elsie, Silas and the regional secret hearts, co-op, physical between-world passage travel, and devices outside these six chapters remain outside this prototype. Progress lasts for the current session until Start world over. Art is a more detailed Godot treatment, not a pixel-for-pixel copy of the browser renderer. The next decision is whether this looks and feels worth pursuing before expanding scope. Explore is a separate draft, left unchanged by this expansion.

## Reused audio provenance

`tools/import-audio.mjs` copies 125 existing source files byte-for-byte into `audio/` and records their paths and SHA-256 hashes in `data/audio.json`: all three regions’ scores and ambient beds, the Causeway boss score, effects/effort variations and 42 matching NPC/quest voice entries, including Mara’s acknowledgement and the actual Elsie and Silas errand lines. No dialogue was rewritten and no audio was generated. The existing unvoiced root-tender line in a between-world connector remains subtitle-only. `audio/ATTRIBUTION.md` preserves the original project provenance.

`tools/import-controls.mjs` extracts the actual keyboard/pad defaults from `public/bladefall-pcore-view.js`; its check detects drift. Neither importer changes the browser game. No ElevenLabs calls are made.

Godot binary: [official 4.5.1 release](https://github.com/godotengine/godot/releases/tag/4.5.1-stable). Engine license is included in `GODOT-LICENSE.txt`; Godot includes its third-party license viewer. [Godot's command-line documentation](https://docs.godotengine.org/en/stable/tutorials/editor/command_line_tutorial.html) covers editor and project launches.

## Black Woods expansion checks · 0.4 history

`data/world2.json` exports the authored Black Woods chapter and its route-derived existing Elsie quest spots. All 27 room simulations are preloaded. Native device support includes pod blade rebounds, bell/dash phase switches, deferred solidification while occupied, springs, moving decks and spent footholds. The forest uses its own terrain palette, layered trees, lanterns, kitchen props and resident work poses; the knight follows the browser default sprite's blue tunic, narrow helmet, visor, belt, sword hilt and orange plume.

The importer now reuses 91 existing recordings across both chapters, with source hashes. Black Woods uses Watchful Greenwood and forest ambience. Elsie's actual errand lines, lantern-death reset and heart hand-in are included; no voices or quests were generated. Required audio resources are warmed before play. The sky gradient and device lists are cached, terrain hazard drawing is restricted to the visible cells, offscreen entities are culled, inactive chapter rendering/particles are disabled, and only the active room is scanned for newly collected progress. Preloaded machinery retains its state; study-room machinery waits for its first input.

Additional verification commands (same Godot prefix as above):

```sh
node prototypes/godot-ascend/tools/export-world.mjs --world=2 --check
node prototypes/godot-ascend/tools/parity.mjs --world=2
node prototypes/godot-ascend/tools/seam-check.mjs --world=2
```

World 2 has **41 browser/native traces and 12,340 compared frames, with no differences**, plus twelve matching browser/native transfers. World 1 retains its 47 traces and 14,221 compared frames. `tests/black_woods.gd` exercises chapter switching, existing quest state/retry/heart awards and all twelve main-road challenge Watch routes. `tests/world2_journey.gd` runs **11,880 consecutive normal-input frames** through the real continuous world to the crossroads with **zero deaths**, without room warps, state resets, physics edits or invulnerability. It includes walking to the next fire and waiting for machinery cycles. `tests/black_woods_branch.gd` climbs from the kitchen into the fork and drops back through the same shaft using normal inputs, with no deaths. `tests/connectivity.gd -- 2` checks reciprocal collider openings for every main/optional/secret room; this geometric check complements the traversal evidence.

`tools/record-world2.gd -- OUTPUT_JSON` regenerates the native continuous input trace. It is a development tool excluded from exports. `--world 2 --tour` runs that trace in the actual application for presentation/performance checks. Capture reports contain frame/physics median, p95, p99 and worst timing samples; short staged samples should not be treated as comprehensive performance guarantees.

The Explore comparison and proposal are in `docs/plans/godot-explore-comparison-and-proposal.md`. Explore and the shipping browser game remain unchanged. The prototype retains session-only progress; campaign saves, worlds after Causeway, online services, co-op and the workshop are not implemented. Inter-world passage previews remain isolated; use the chapter selector.

The final Black Woods verification also includes `tests/elsie_journey.gd`: **1,535 normal-input frames through the actual application**, chasing every moth perch, returning across the kitchen gap, climbing the branch, carrying the lantern through its return pipes and handing it to Elsie, with no deaths or forced quest steps. Her existing closing recording queues at the hand-in; the carry reminder does not start over the completion. `tests/world2_secret.gd` enters the secret from The Hollow Trunk, completes its challenge, collects the existing **Moss Heart** and returns through all six pipes to the clearing in **1,116 frames**, with no deaths. It also checks retained rewards, no duplicate heart, full reset and sealed preview/back entry. The native layout aligns the Hollow Trunk roof with this shaft and preserves its authored width; exported browser maps remain untouched.

Forest layer drawing commands are cached until the parallax chunk changes, reducing measured background script drawing from roughly 1.0 ms to 0.12 ms on this Mac. On macOS, presentation is paced to the detected display refresh rate with OpenGL VSync disabled; physics remains fixed at 60 Hz. This was selected after direct timing comparisons on the host's 60 Hz display. `wall_frame_ms` records actual elapsed frame times separately from Godot's smoothed delta. Packaged GPU captures, complete timing reports and the non-silent mixed audio recording are in `.cache/godot/black-woods/`. The reported results describe this Mac and these routes; they do not establish a portable frame-rate guarantee.

The 0.4 package passes application, polish/audio, Outskirts world/connectivity/stair, Black Woods integration/branch/continuous road, full Elsie and full secret checks against its packed resources. It is ad-hoc signed and verified for local use. The Explore runtime and browser `public/` tree match `e0ac32b` exactly.

Final packaged timing observations on this 60 Hz Mac: wall-frame median about 16.7 ms, p95 about 17–22.4 ms across captures, with occasional larger spikes. The final 26.9-second mixed WAV has no clipped samples. The stable compatibility renderer is retained; an experimental Metal backend was rejected after an exit crash. The optimization work improves resource loading, drawing cost and presentation pacing, but does not promise stutter-free performance under every host load.

Silas’s hook hand-in plays his existing closing recording immediately and removes any queued carry instruction, so the heart award and spoken line agree. The full application quest check verifies this exact transition.

0.5.1 fixes invisible dash-movable stones: the renderer now draws their actual simulated rectangles before and after movement. `tests/sliding_block_render.gd` checks GPU-rendered pixels from an authored Causeway block in both states.
