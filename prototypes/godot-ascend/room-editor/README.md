# Bladefall Room Editor

A local browser editor for the six native Movement Workshop rooms. It edits `levels/world4.tscn` through Godot's existing authoring codec. There is no upload, hosting account or manual conversion step, and no campaign scene is written.

## Open and edit

Double-click **Edit Workshop Rooms.command** in the prototype folder. Keep its small Terminal window open while editing. It uses Node.js (18+ with built-in fetch) and the pinned Godot binary already used by Play Ascend. Reopening the launcher reuses the running editor for this checkout.

1. Choose a room at the top.
2. Choose **Stone** or another terrain brush on the left. Click or drag to paint. Right-drag erases terrain.
3. Choose an object, then click to place it. It becomes selected. Drag it or use its Position fields on the right. Arrow keys nudge it; Shift moves five squares.
4. Select a moving block to see its destination. Drag the circular destination handle, or edit Destination. Moving the block carries its route with it. Drag its bottom-right handle or use Size to resize it. Pause and return times are shown in seconds; outward travel remains 0.5 seconds.
5. To move ground, choose **Tiles**, drag a selection, then drag that selection. Copy/paste and Delete work on the selected terrain. Terrain selections exclude objects.
6. Click **Save & play**. Godot opens the chosen room with the saved changes. Close the game window to return to the editor. Clicking Save & play again restarts the editor’s own playtest with your latest save. The local packaged app is a separate snapshot; the editor's Play action runs the current project.

**Select V · Paint B · Erase E · Fit F · Save ⌘S/Ctrl+S · Undo ⌘Z/Ctrl+Z · Redo ⌘⇧Z/Ctrl+Y · Duplicate ⌘D/Ctrl+D.** Middle-drag or Space+drag pans. Scroll zooms at the pointer. Use How to edit for the built-in walkthrough.

The palette contains solid stone, weathered stone, one-way ledges, four spike directions, moving blocks, dash refills, shards, springs, crumble platforms, pushable blocks, player start, finish flag, flowers and ferns. Player start and finish placement reposition the existing singleton. Decorations use the game's safe-ground drawing rules. Room size, title, optional hint and pickup requirement are editable. Shrinking cannot silently cut off existing terrain or objects.

## Saving and recovery

- Save changes the native scene used by the live Godot project. It preserves all other rooms, source metadata, quests and campaign data.
- Native saves are staged, validated, reopened and then atomically installed. An external-file revision check prevents replacing another editor's saved work. If a conflict appears, export your draft before Reload saved.
- Every save backs up the previous scene under the repository's ignored `.cache/room-editor/backups/`. **Saved backups** loads a version for review; Save is required to apply it.
- Unsaved work is also cached in this browser. Reopening offers to recover the draft. This is not a substitute for saving or exporting, particularly if browser storage is cleared.
- **Export file** downloads all six rooms as an editable JSON document. **Import file** loads one as an unsaved draft. Original room IDs and order are retained. The source `data/world4.json` remains the original workshop fixture.
- Old demonstrations are cleared only for changed rooms, because their recordings may no longer fit the edited geometry. Their prior versions remain in native backups. Unedited rooms retain their demonstrations.
- Validation catches missing starts/pickups, invalid sizes, overlapping fixtures/terrain, merged adjacent blocks, out-of-bounds objects/destinations and invalid timing. It does not solve the edited room or prove it can be finished; use Play to check your design.

Avoid saving the same scene from Godot and this editor at the same time. After changing it in Godot, use Reload saved here before making another edit. The revision check reports a conflict if you forget.

## Verification

```sh
node prototypes/godot-ascend/room-editor/check.mjs
```

Requires the repository's existing Puppeteer dependency. This test uses a copy of the native scene, real browser input and the real Godot bridge. It exercises painting/erasing, terrain selection/copy, object placement/movement/size/destination/timing, undo/redo, room switching and resizing, pan/zoom, native save, draft recovery, imports/exports, external conflicts and backup restoration. A native gameplay check verifies collision/device edits, preservation of unselected rooms and no-edit round trips, outdated-demo handling and live inputs. It also verifies the real workshop and user Outskirts scene were untouched. Reports and screenshots are written under `.cache/room-editor-check/`.

The workshop's existing `tests/workshop.gd` remains the regression test for the six original layouts. Its demonstration-based route checks will naturally need revisiting after intentional geometry edits.
