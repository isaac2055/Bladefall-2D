# Ascend Godot prototype — branch only, 0.2.0, 2026-10-24, Codex

Isaac approved the world 1 prototype, then requested standard controls, music, effects, voice lines and extensive visual/animation polish. Explore remains later. Work is isolated on `codex/godot-ascend-prototype` in `/Users/computer/Projects/Bladefall-Godot-Ascend`. Do not deploy this branch as the web game or merge it without a separate decision.

Read `prototypes/godot-ascend/README.md` for launch, source layout and validation. The standalone local app is `prototypes/godot-ascend/exports/Bladefall Ascend Prototype.app`, rebuilt as 0.2.0 and ad-hoc signed. It uses the pinned official Godot 4.5.1 universal macOS binary (SHA-256 checked) as its runtime carrier. `Play Ascend.command` opens the source project. Neither runtime depends on the browser.

## Current behavior

- Controls are imported from the browser defaults: arrows move/aim; Space/C/J jump; D/X/K dash; A/Z/Shift/L cling/carry; W/V/I strike; F/O parry; P portal; R retry; Esc pause. Standard controller equivalents are mapped using Godot's named buttons/axes (its indices differ from the browser). Original world 1 action locks remain. M toggles music; F11 fullscreen.
- Music is the original Midnight Field; plains ambience, fire, footsteps, actions, machinery and knight effort sounds reuse existing MP3s. 79 files are copied byte-for-byte with source hashes in `data/audio.json`; eight NPC recordings are included (six approach lines and two completion clips reserved for future quest integration). All six main-road NPC approaches play matching speech/subtitles once per run. Existing unvoiced root-tender connector text stays subtitle-only. No dialogue or voice generation was performed and no ElevenLabs calls were made.
- Separate music/effects/voices/ambience buses, speech ducking, noninterrupting dialogue queue, pause/resume and saved volumes/reduced-motion preference. Subtitles remain visible if voices are disabled. The pause menu contains room selection and Watch/Take control. Music survives room changes.
- The renderer now caches all static terrain, uses varied/weathered masonry, grass, pale hazard flowers, parallax hills/clouds/towers/arches, animated people and authored props (tent, clock, mast, palisades, posts, gatehouse), native GPU embers/motes, real terrain shadow occluders and fire lights, grading/vignette, action particles and dash afterimages. A constrained animated plume shows dash readiness; render interpolation and eased camera motion do not change simulation. GPU captures observed 114–119 fps on this Mac, not a cross-hardware guarantee.

## Evidence

- Physics/map-loading sources and authored world data are byte-for-byte unchanged from the first prototype. 18 original tapes + 29 varied-input probes still compare 14,221 browser/native frames with no differences; all 14 room transfers match.
- `tests/polish.gd` exercises real D/A/C/W and controller input events, all 79 MP3 decode/hash checks, Godot output-bus audio, music ducking, every main NPC approach, no repeated speech, all volume controls, M/menu synchronization, pause/resume, subtitles, shadow occluders and reduced motion. It passes against the actual packed app as well as source.
- The packed app's application test loads all 29 rooms, watches all 14 challenges to the crossroads without deaths, and takes control without resetting position. Actual macOS LaunchServices launch and GPU screenshots pass. A 5.11-second packaged mixed WAV has peak 0.748, RMS 0.093 and zero clipped samples. Captures/logs are under `.cache/godot/polish/`.
- Packaging trap resolved: Godot exports MP3s as imported resources. Use `ResourceLoader.load` and duplicate the stream to set looping, not raw FileAccess to the source MP3 path. The packed-stream `.data` hashes exactly match the original files. Audio is tested from the PCK, not inferred from source playback.

## Scope

World 1 movement/devices and presentation only. Campaign saves, quest progression/unlocks, co-op, between-world travel, later-region devices and Explore are not ported. Optional branches remain selectable for inspection. Main web files, dialogue, recordings and deployments are untouched. The source and local generated exports are separate; do not stage `.godot/` or `exports/`.
