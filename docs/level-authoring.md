# Bladefall level authoring

Run 10 introduced a detached authoring layer. It can describe, inspect, edit,
validate, and compile a level document, but it does not apply drafts to the live
campaign. Run 11 now uses that boundary for campaign blueprints and parity-checked
handcrafted-stage compilation.

## Workbench

Start the local server and open:

`http://localhost:8371/authoring.html`

The workbench supports:

- JSON import by file picker, drag-and-drop, or pasted text.
- Schema migration and formatting.
- A scaled traversal, hazard, actor, reward, checkpoint, and exit preview.
- Encounter grouping with role mix, pressure, recovery, and readability findings.
- Static reachability and softlock findings.
- Adding common objects and actors with undo/redo history.
- Downloading a normalized manifest.
- Importing a runtime capture when the workbench was opened from a running game
  window.

The workbench never writes a manifest into the campaign or touches save and
leaderboard storage.

## Runtime tools

The development hook exposes:

```js
window.__BF.levelManifest() // detached manifest for the current assembled stage
window.__BF.analyzeLevel()  // validation, softlock, and encounter report
window.__BF.exportLevel()   // normalized JSON
window.__BF.authoringState()
```

The lower-level API is available as `window.BladefallAuthoring`.

## Schema

Every document uses `bladefall.level@1`:

```json
{
  "schema": "bladefall.level",
  "version": 1,
  "id": "example",
  "meta": {
    "name": "Example",
    "theme": "ruins",
    "length": 2400
  },
  "start": { "x": 70, "y": 0 },
  "exit": { "type": "portal", "x": 2320, "y": 0 },
  "objects": [],
  "enemies": [],
  "pickups": [],
  "travelers": [],
  "annotations": {}
}
```

Collection ids are stable and unique across the document. Runtime-only state
such as timers, animation flashes, velocities, death flags, and collected flags
is excluded from captures. Circuit ids remain semantic references rather than
being mistaken for entity ids.

## Validation and softlock confidence

Schema errors prevent compilation. Design findings remain warnings so an
intentional puzzle is never silently rewritten.

The softlock analyzer proves ordinary static walk, jump, and drop routes. When
the route depends on a portal, moving platform, door, crumble surface, updraft,
low-gravity field, or spring, it reports the route as an explicit dynamic
unknown. That is distinct from a high-confidence disconnected static route.

This confidence split is important for Bladefall: its best rooms deliberately
look impossible until the player understands the mechanic.

## Campaign migration

`compileManifest()` returns detached stage, object, enemy, pickup, and traveler
records only after schema validation succeeds. The campaign compatibility
compiler now produces and validates those documents for every handcrafted,
bonus, and secret stage before runtime construction. See
`docs/campaign-conversion.md` for the blueprint and parity contracts.
