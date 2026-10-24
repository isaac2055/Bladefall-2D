# Ascend in Godot — world 1 prototype

A native Godot 4.5.1 prototype of **The Outskirts**, isolated from the shipping browser game on `codex/godot-ascend-prototype`. This is an engine comparison, not a replacement release or a full Ascend port.

## Play

On this Mac, double-click `Play Ascend.command`. It uses the local pinned engine; on a fresh Mac checkout it downloads the official universal binary and checks its SHA-256. Alternatively, open `project.godot` in Godot and press F6/F5, or run:

```sh
prototypes/godot-ascend/tools/run.sh
```

The local standalone application is `exports/Bladefall Ascend Prototype.app`. Rebuild with `tools/build-macos.sh`. The app carries its own Godot binary and packed project, and runs without the repository or Node. Exports and engine downloads are ignored by Git. This first package uses the universal editor binary as its runtime carrier (about 352 MB), rather than a size-optimized export template. The game data and scripts are packed separately in the small PCK. The local app is ad-hoc signed for local use; it is not Developer ID signed or notarized for distribution.

Use arrows or A/D to move, Space to jump, X to dash, Shift to grab a wall or pick up/throw the lantern, and Up/Down or W/S to aim or climb. R restarts. **Watch route** plays the existing recorded inputs; **Take control** returns to keyboard play. The room selector includes all 29 world 1 rooms, including optional routes and connecting passages. **Lighting** toggles Godot's ambient and point lights for comparison.

## What is native

- `scripts/core.gd`: fixed 60 Hz movement with per-pixel collision, subpixel remainders, JavaScript-compatible negative rounding, buffers, coyote time, variable jumps, directional dashes and freeze, supers/hypers/wallbounces, wall climbing and stamina. World 1's stakes/gates, lantern/plates, refills, crumbling platforms, moving lifts and swept thorn collisions are simulated in GDScript. Godot physics bodies are not used.
- `scripts/room_loader.gd`: reads the authored character maps at 8 pixels per tile, including grouped machinery. The runtime does not contain or use the JavaScript-parsed collision arrays.
- `scripts/landscape.gd`: native TileMapLayer terrain, nearest-neighbour pixel drawing, rebuilt scenery, CanvasModulate ambient light and a PointLight2D fire. Adjoining terrain is visible, and room transfers retain the browser's position/motion rules.
- `scripts/main.gd`: keyboard actions, room selection, retry, recorded route playback, continuous main-road handoffs, and the comparison lighting toggle.
- `data/world1.json`: the original world definitions, tapes, constants, player defaults and source provenance. Parsed test oracles are generated fresh by the reference runner. Source hashes identify the exact browser modules used. JavaScript is used only by the development exporter/reference tests, never inside the Godot application.

## Verify

From the repository root, with Godot available via `GODOT` or the downloaded local engine:

```sh
node prototypes/godot-ascend/tools/export-world.mjs --check
node prototypes/godot-ascend/tools/parity.mjs
node prototypes/godot-ascend/tools/seam-check.mjs
.cache/godot/Godot.app/Contents/MacOS/Godot --headless --path prototypes/godot-ascend --script res://tests/application.gd
```

The reference runner loads the real browser core and all its device modules. It generates fresh traces, then launches Godot to compare native state every frame. The checked state includes player scalar fields (positions, velocities, remainders, stamina, movement states and timers), entity fields, carried-object identity, freeze/death/exit state, and the native map/entity parser. Numeric tolerance is 1e-8; whole-pixel movement is unchanged.

Current result: **18 authored route traces + 29 deterministic varied-input probes, 14,221 compared frames, no differences**. All 14 main-road transfers also match the browser. The application check feeds real keyboard events, loads every room, plays all 14 main challenges to the crossroads without death, and takes control from playback. Captures from the actual GPU renderer and browser are in `.cache/godot/`.

`tools/export-world.mjs` regenerates data after an intentional browser source update. `--check` detects stale exports. These checks establish world 1 compatibility, not compatibility with later worlds or every engine module.

## Deliberate prototype boundaries

This contains the full world 1 room data and its movement/interactions, with all rooms selectable for inspection. It does not port the campaign menus, saves, quests/dialogue, audio, co-op, between-world travel, or later-region devices. Optional branches can be opened from the selector; campaign unlock/quest routing is not implemented. Art is a basic Godot treatment, not a pixel-for-pixel copy of the browser renderer. The next decision is whether this looks and feels worth pursuing before expanding scope. Explore remains a later, separate prototype.

No changes to the shipping game, dialogue, recordings or deployment are required. No ElevenLabs calls are made.

Godot binary: [official 4.5.1 release](https://github.com/godotengine/godot/releases/tag/4.5.1-stable). Engine license is included in `GODOT-LICENSE.txt`; Godot includes its third-party license viewer. [Godot's command-line documentation](https://docs.godotengine.org/en/stable/tutorials/editor/command_line_tutorial.html) covers editor and project launches.
