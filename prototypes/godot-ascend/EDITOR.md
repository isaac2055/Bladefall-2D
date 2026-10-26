# Editing Ascend

Double-click **Edit Ascend.command** to open the pinned Godot 4.5.1 editor. The **Ascend** dock opens all six chapters: Outskirts, Black Woods, Broken Causeway, and their Fractured versions. All 197 native rooms are present, including optional rooms and the existing passage previews.

Choose a chapter and click **Open chapter**. Choose a room and click **Select + frame room**. The view centers and zooms to the room. Use the mouse wheel to zoom. The scene tree has `Rooms / room-id / Tiles` and `Objects`.

**Movement Workshop · test level** is a separate seventh chapter containing The Broken Relay, Behind the Counterweight, Under the Lintel, The Return Ferry, The Counterweight Engine and The Smuggler’s Circuit. Open it from the chapter dropdown, choose a room, then **Save + play this room**. Its editable scene is `levels/world4.tscn`; it has no connection to the campaign. Double-click **Play Movement Workshop.command** to play directly. In play, **N** selects the next room; Esc offers room selection and a solution demonstration. Source data and recordings are in `data/world4.json`. Geometry edits may invalidate those recordings. In each room's advanced Settings, `workshopGoal` is the finish landing's `[x, floor_y, width, height]` rectangle in pixels. Keep it aligned with the gold flag. The Ferry, Engine and Circuit have `workshopRequireShard=true`: their flags require the carried pickup. Pickup progress resets on death/retry. Larger workshop rooms scroll in play; the first two retain fixed framing.

- **Terrain:** click **Paint tiles in this room**, then use Godot's TileMap palette and paint/erase tools. Tiles use an 8 pixel grid. Solid stone is `#` or `%`, one-way platforms `=`, and spikes `^ v < >`. The atlas stores each symbol in the tile's `glyph` custom data. Tracks use `- ( ) I { }`.
- **Objects:** click a prop, person, hazard, or device in the canvas or scene tree. Move it with the 2D move tool; edit its fields in Inspector. Godot's duplicate, delete, save and undo shortcuts work normally. The dock's template list and **Add a copy in this room** create a copy of an existing object with its configuration and editable path.
- **Props and people:** position is the object's foot. Tint, petal color, rotation and scale affect artwork. NPC Character Style can inherit the player's setting or choose any of the eight character designs (the expanded choices are intended for the Outskirts).
- **Machinery:** moving fixtures must be placed on the 8 pixel grid. Change **Footprint**, rather than node scale, to resize their collision. Keep the chapter and room nodes unscaled and unrotated. **Snap selected to 8px** is undoable.
- **Paths:** expand a bunny or lift and select **MotionPath**. Edit its Curve2D points with Godot's path tools. Bunny points form a polyline, with period, phase, radius and loop settings on its parent. Lift paths need exactly two endpoints; moving the fixture moves both endpoints. Curve control tangents do not affect gameplay: the simulation follows straight segments.
- **Lift timing:** on a moving fixture, **Parameters** may contain `holdFrames` and `returnFrames`, each a whole number from 1 to 3600 at 60 simulation frames per second. Omit them for the ordinary 30-frame hold and 120-frame return. Activation and outward travel remain 4 and 30 frames. The workshop ferry uses `holdFrames=60`; the Circuit finishing lift uses `returnFrames=600`. Timing edits can invalidate demonstrations and the intended activation order.
- **Other devices:** Mechanism nodes expose their existing data in **Parameters**. Their position edits update their coordinates. Advanced room, world and Gameplay Settings dictionaries retain settings that are not spatial nodes, including encounters, routes, top-level quest/reward coordinates, tuning and native layout flags. Do not rename a room ID without updating its references.
- **Play:** click **Validate chapter**, then **Save + play this room**. The saved chapter scene is read by normal gameplay too. F6 on a chapter plays its last chosen room; F5 runs the normal game. Stop play before editing again.

The editable sources are `levels/world1.tscn`, `world2.tscn`, `world3.tscn`, `world21.tscn`, `world22.tscn`, and `world23.tscn`. Commit these scenes to keep changes. The original `data/world*.json` files stay as browser-reference fixtures; native repairs are already included in the scenes and are not applied a second time. Existing quests and recordings are preserved; this editor creates neither quests nor voices.

Validation checks missing room references, duplicate IDs, spawn counts, off-grid fixtures, invalid paths, overlapping fixture tiles, and tiles outside room bounds. A scene with invalid data is not launched by the dock. Normal gameplay logs an error and uses the imported reference chapter if a saved scene fails validation. Geometry edits can naturally make existing Watch recordings or quests unreachable; play the affected route after editing.

`authoring/generate.gd` is an import/development tool, not the save workflow. It creates missing scenes and verifies exact data preservation. **Do not use `--force` on authored scenes:** it replaces edits with the browser/native baseline. A source fingerprint detects browser imports that have drifted since scene generation; reconcile those changes deliberately.

Verification:

```sh
.cache/godot/Godot.app/Contents/MacOS/Godot --headless --path prototypes/godot-ascend --script res://tests/editor_data.gd
.cache/godot/Godot.app/Contents/MacOS/Godot --editor --path prototypes/godot-ascend -- --ascend-editor-test=res://tests/editor_ui.gd
```

The UI check writes a temporary `tests/editor-workbench.tscn`; it does not save into the six authored chapter scenes. It tests opening all chapters, selection, adding an owned prop, undo/redo, editor save, and runtime loading of that saved edit.
