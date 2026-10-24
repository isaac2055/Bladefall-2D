# Ascend Godot prototype — branch only, 2026-10-24, Codex

Isaac approved the small Ascend world 1 prototype from Claude's proposal. Explore is explicitly later. Work is isolated on `codex/godot-ascend-prototype` in `/Users/computer/Projects/Bladefall-Godot-Ascend`, based on `8b42d81`. Do not deploy this branch as the web game or merge it without a separate decision.

Read `prototypes/godot-ascend/README.md` for launch, source layout, validation, and limitations. A pinned official Godot 4.5.1 universal macOS binary is cached locally under `.cache/godot/` (SHA-256 checked). Source project and all current work are native GDScript, not a browser wrapper. A self-contained local `.app` is under the ignored `prototypes/godot-ascend/exports/` folder.

Evidence: 18 original world 1 tapes and 29 varied-input probes compare 14,221 browser/native frames, with native map/entity parsing, player scalar fields, entity fields, carry identity and lifecycle checks. Fourteen room-transfer fixtures match. The actual application accepts keyboard input, loads all 29 rooms, watches all 14 main challenges without death, and takes control correctly. An actual GPU screenshot and a shipping browser screenshot are under `.cache/godot/`.

Scope is world 1 movement, its devices, tile loading, native pixel presentation and basic Godot lighting. Campaign menus/saves/quests/audio/co-op/optional quest unlock routing/later worlds/Explore are not ported. No shipping public files, voice lines or dialogue were changed. No ElevenLabs generation was used. Do not infer any future voice authorization from this prototype.
