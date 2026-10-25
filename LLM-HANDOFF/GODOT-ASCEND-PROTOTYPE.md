# Fractured worlds expansion · 0.6.0 · 2026-10-25

Current branch: `codex/godot-ascend-fractured`. The first three Ascend worlds and their three authored Fractured counterparts are selectable. Source: `prototypes/godot-ascend/`; local standalone: `prototypes/godot-ascend/exports/Bladefall Ascend Prototype.app`. No browser/Explore changes or deployment. The movable dash stones now render before and after movement.

The new chapters contain 112 authored rooms (38/37/37), existing echo quests and three secret hearts, 67 playable Watch routes, and native ports of the devices needed by these chapters. All six chapters are preloaded and retain session state across switching. Use the README's 0.6 section for mechanisms, entry repairs, commands, input recordings and validation boundaries. Existing recordings only: 125 unique files, 42 voice entries, SHA-256 provenance; no ElevenLabs synthesis and no newly authored quests.

Browser/native reference results: 322 traces and 95,367 frames with zero mismatches across worlds 1/2/3/21/22/23. Additional tests cover geometric connectivity, visible entity paint, playable Watch routes, reward gating/idempotence/retry/restart and normal-input main-road recordings. Optional-branch return journeys are not fully recorded; reward fixture checks are labeled separately. Packed 0.6.0: 21 integration cases plus two GPU paint checks pass; all three Fractured chapters were captured in the actual packaged renderer. Inspected packed mix: 3.52 seconds, non-silent, zero clipped samples. Continuous roads: 7,907 / 6,583 / 8,954 normal-input frames, zero deaths. Evidence is local and ignored under `.cache/godot/fractured/`. Engine remains pinned to Godot 4.5.1; progress remains session-only. Inter-world passages remain previews.

---

# Broken Causeway expansion · 0.5.0 · 2026-10-25

Current branch: `codex/godot-ascend-causeway`. Source: `prototypes/godot-ascend/`. Local standalone: `prototypes/godot-ascend/exports/Bladefall Ascend Prototype.app`. Godot remains pinned to 4.5.1 with the stable compatibility renderer.

The chapter selector now contains all three worlds, preserving each world’s state across switches. Causeway has all 28 original room definitions, its existing Silas quest and Cog Heart secret. Explore and `public/` are unchanged. Physical inter-world passages are explicitly out of scope at Isaac’s request; previews remain isolated. No new quests, dialogue or ElevenLabs audio were created.

Read the new 0.5 section in the prototype README for devices, source provenance, commands and session-only progress boundaries. `causeway_devices.gd` ports recoil platforms, hinged arms and the Causeway Combat/Brute subset from the actual browser modules. Arena actors use authored room bounds while the knight crosses the shared world. Future combat regions with other actor kinds need their own port; current world data only uses Brutes. Parity compares combat state and wave arrays in addition to existing player/entity/lifecycle state.

A native-only governor seam repair admits the lower room’s four-tile moving block, preserves its west clearance, and makes the upper entry lip one-way. Without this, the original isolated fixtures pass but their block jams in continuous world collision. The exported original remains untouched and is still used by Watch/parity.

Current evidence: `.cache/godot/causeway/`. World 3 parity: 46 traces / 14,496 frames. Continuous road: 5,386 frames. Full Silas quest: 2,261 frames. Full Cog Heart entrance, challenge and return: 1,302 frames. All three journeys use normal inputs with zero deaths, no intermediate warps/resets/physics edits. All 16 packaged integration/regression cases pass, including previous-world checks. The audio manifest reuses 102 source recordings with SHA-256 provenance and 26 voice entries. Main switches the music/ambience and disables inactive rendering.

Previous development history follows; older version limits below are historical.

---

# Native Ascend 0.4 · Black Woods (2026-10-25)

The local standalone app is `prototypes/godot-ascend/exports/Bladefall Ascend Prototype.app`, version 0.4.0. Source is on `codex/godot-ascend-black-woods`. Esc opens the chapter selector; Black Woods starts at Mothlight Refuge. Both chapters are preloaded and retain their individual session progress. No Explore or shipping browser code was changed; no recordings were generated.

- Black Woods contains all 27 authored rooms, its mechanisms, people/props, forest presentation, existing music/voices, the existing Elsie quest and Moss Heart. Native repairs align the kitchen/fork and Hollow Trunk/secret shafts and retain the secret shaft's authored width. Source browser fixtures remain intact.
- Knight rendering follows the browser default's 8×11 proportions, blue tunic, narrow silver helmet/visor, belt, sword hilt and orange plume/scarf, with corresponding movement poses.
- Browser parity: World 1 47 traces / 14,221 frames; World 2 41 traces / 12,340 frames, no differences. All 14 World 1 and 12 World 2 reference transfers match.
- `world2_journey.gd`: 11,880 consecutive normal-input frames from the initial spawn through every main challenge to the crossroads, no deaths, room warps, state resets or physics edits. `black_woods_branch.gd` physically climbs into the branch and drops back. `elsie_journey.gd` completes the entire quest through Main in 1,535 frames with zero deaths and queues the correct existing closing recording without a stale carry reminder. `world2_secret.gd` enters from the actual road, finishes the secret, collects its existing Moss Heart and returns through all six pipes in 1,116 frames with zero deaths; reward retention/duplicates/reset/sealing are also checked.
- Packaged checks: application, polish, world_checks, connectivity, stair, black_woods, black_woods_branch, world2_journey, elsie_journey and world2_secret all pass against the actual PCK with no engine errors/warnings. The final audio-only adjustment was rechecked with packaged polish and the full Elsie application route. All 91 reused recordings decode and match source hashes.
- Optimizations: visible-cell/entity culling; active-room progress scans; cached device lists, sky and forest drawing commands; disabled inactive chapter viewports/particles; warm audio resources. Forest background drawing measured about 1.0 ms before caching and 0.12 ms after. Study machinery sleeps until first input and subsequently retains/advances state offscreen. macOS presentation pacing follows the detected refresh rate; fixed 60 Hz simulation is unchanged.
- Actual packed GPU menu and quest-ending screenshots were inspected. LaunchServices startup and deep code-signature validation pass. Timing reports and mixed WAV are under `.cache/godot/black-woods/`. Use actual wall-clock samples; Godot's delta is smoothed. The performance observations are specific to this host and route, with occasional outliers, not a cross-hardware guarantee.
- Explore comparison/proposal: `docs/plans/godot-explore-comparison-and-proposal.md` inventories the draft's gameplay, recovery, combat, visual, dialogue, audio, progression, save/UI and campaign differences. It confirms the added dash cue and missing local surviving-fall rewind. Conversation and input gates are proven stalls; other reported freezes are not claimed diagnosed. The improvement plan is proposal-only.

Prototype boundaries: session-only progress, menu-based chapter switching, and isolated inter-world preview passages. Later chapters, campaign saves, co-op and online/workshop systems are outside this two-world prototype. Do not publish to main, deploy the browser game, alter Explore or create dialogue/recordings as follow-up cleanup.

---

# Ascend Godot prototype — branch only, 0.3.0, 2026-10-24, Codex

Isaac approved the world 1 prototype, then requested standard controls, music, effects, voice lines and extensive visual/animation polish. Explore remains later. Work is isolated on `codex/godot-ascend-prototype` in `/Users/computer/Projects/Bladefall-Godot-Ascend`. Do not deploy this branch as the web game or merge it without a separate decision.

Read `prototypes/godot-ascend/README.md` for launch, source layout and validation. The standalone local app is `prototypes/godot-ascend/exports/Bladefall Ascend Prototype.app`, rebuilt as 0.3.0 and ad-hoc signed. It uses the pinned official Godot 4.5.1 universal macOS binary (SHA-256 checked) as its runtime carrier. `Play Ascend.command` opens the source project. Neither runtime depends on the browser.

## Current behavior

- Controls are imported from the browser defaults: arrows move/aim; Space/C/J jump; D/X/K dash; A/Z/Shift/L cling/carry; W/V/I strike; F/O parry; P portal; R retry; Esc pause. Standard controller equivalents are mapped using Godot's named buttons/axes (its indices differ from the browser). Original world 1 action locks remain. M toggles music; F11 fullscreen.
- Music is the original Midnight Field; plains ambience, fire, footsteps, actions, machinery and knight effort sounds reuse existing MP3s. 79 files are copied byte-for-byte with source hashes in `data/audio.json`; eight NPC recordings are included (six approach lines and two completion clips, including Mara’s now-active completion line). All six main-road NPC approaches play matching speech/subtitles once per run. Existing unvoiced root-tender connector text stays subtitle-only. No dialogue or voice generation was performed and no ElevenLabs calls were made.
- Separate music/effects/voices/ambience buses, speech ducking, noninterrupting dialogue queue, pause/resume and saved volumes/reduced-motion preference. Subtitles remain visible if voices are disabled. The pause menu contains room selection and Watch/Take control. Music survives room changes.
- The renderer now caches all static terrain, uses varied/weathered masonry, grass, pale hazard flowers, parallax hills/clouds/towers/arches, animated people and authored props (tent, clock, mast, palisades, posts, gatehouse), native GPU embers/motes, real terrain shadow occluders and fire lights, grading/vignette, action particles and dash afterimages. A constrained animated plume shows dash readiness; render interpolation and eased camera motion do not change simulation. The earlier 0.2 GPU captures observed 114–119 fps on this Mac; the 0.3 full-world LaunchServices capture observed 81 fps. These are observations, not cross-hardware guarantees.

## Continuous world repairs in 0.3

- `world.gd` constructs all 30 room simulations, entities and moving hazards before gameplay. Shared collision and rendering use the same merged terrain. Walking through a doorway keeps existing room state and player motion; the world camera does not reset at a room change. Backtracking works through horizontal doors and vertical landings. Down + Jump drops through one-way platforms.
- The visible floor to the right of the Camp Echo fire now collides. Carried lanterns travel across doors and recover safely on retry/death without duplication. Retry preserves collected bearings and lit stakes.
- Ash, Glass and Iron are registered from actual shard pickups. The HUD shows progress; returning to Mara after all three triggers her existing completed-chart recording and acknowledgement. Death/retry preserve completion.
- Start world over in the pause menu reconstructs the world, clears quest/items/deaths/dialogue history, and returns to the first spawn. Audio/display preferences remain.
- Native `world_layout.gd` removes the old Wayside Arches/Gatehouse overlap: the final overlook has its own space and a real, reversible Watch Stair from the final gallery. Exposed map edges have visible solid masonry. Dark varied rock backing, stair sconces, persistent off-room machinery and retracting gates improve presentation. Original browser JSON remains untouched.
- `tests/world_checks.gd` proves actual movement across the repaired floor and back, vertical Lookout travel, carried-item recovery, all three authored bearing routes with zero deaths, Mara’s recording, and retry/death/restart state. `tests/connectivity.gd` checks reciprocal physical openings for all world 1 branches and rooms. `tests/stair.gd` ascends and descends the new stair with normal movement. `tests/application.gd` presses the real restart button and tests native death with a foreign lantern through the renderer/effect pipeline. Screenshots and logs: `.cache/godot/world/`.

## Evidence

- Exported browser world data is unchanged. The core and loader now have optional shared-world hooks; standalone reference behavior is preserved. 18 original tapes + 29 varied-input probes still compare 14,221 browser/native frames with no differences; all 14 room transfers match.
- `tests/polish.gd` exercises real D/A/C/W and controller input events, all 79 MP3 decode/hash checks, Godot output-bus audio, music ducking, every main NPC approach, no repeated speech, all volume controls, M/menu synchronization, pause/resume, subtitles, shadow occluders and reduced motion. It passes against the actual packed app as well as source.
- The packed app's application test loads all 30 rooms, watches all 14 challenges to the crossroads without deaths, and takes control without resetting position. Actual macOS LaunchServices launch and GPU screenshots pass. A 5.11-second packaged mixed WAV has peak 0.748, RMS 0.093 and zero clipped samples. Captures/logs are under `.cache/godot/polish/`.
- The 0.3 packed app passes application, polish, world checks, connectivity and stair checks with no engine errors or warnings. Its LaunchServices capture has 25 real lights and 203 terrain shadow occluders. The 5.18-second mixed WAV has peak 0.722, RMS 0.092 and zero clipped samples; captures/logs are under `.cache/godot/world/`.
- Packaging trap resolved: Godot exports MP3s as imported resources. Use `ResourceLoader.load` and duplicate the stream to set looping, not raw FileAccess to the source MP3 path. The packed-stream `.data` hashes exactly match the original files. Audio is tested from the PCK, not inferred from source playback.

## Scope

World 1 movement/devices and presentation only. Mara’s three-bearing quest is integrated for the current session. Campaign saves, other quest chains/unlocks, co-op, between-world travel, later-region devices and Explore are not ported. All world 1 main-road rooms and optional branches connect physically; the two later-world connector previews stay isolated. Main web files, dialogue, recordings and deployments are untouched. The source and local generated exports are separate; do not stage `.godot/` or `exports/`.

## Black Woods expansion in progress (2026-10-24)

Branch `codex/godot-ascend-black-woods`, following `e0ac32b`. Browser game and `prototypes/godot-explore` remain unchanged. Do not ship or claim completion solely from the fixtures below.

- Added original World 2 export (`data/world2.json`), all 27 preloaded simulations, a persistent chapter selector, forest background/terrain/props/NPC dressing, and exact default browser knight sprite proportions/palette/poses. Two future-world connector previews remain isolated, as with World 1.
- Added native pods/blade rebounds, bell/dash phase changes, safe pending toggle solids, springs, moving decks and spent footholds. Fixed `js_round` at the IEEE-double value immediately below 0.5; `floor(v+0.5)` rounded that value incorrectly. Authored routes and varied input comparisons pass against the actual browser core: World 1 47 traces/14,221 frames; World 2 41 traces/12,340 frames.
- Native-only World 2 repair opens kitchen roof column 5, aligning the fork's bottom shaft; original exported geometry remains unchanged. Reciprocal collider graph now connects all main rooms, optional branch/return pipes and secret. A collider graph is not a real-input traversal proof.
- Existing Elsie quest uses the browser route-derived moth perches, existing lines/recordings, carry-home/death-reset and heart award. No new quests, dialogue or voices generated. Audio importer now copies 91 existing files with hashes, including regional music/ambience and the actual errand lines.
- Optimization so far: collect progress only in the active room; restrict foreground hazard tile scans to camera bounds; cull offscreen entities; disable hidden chapter viewport/particles; cache device lists so rooms without decks/footholds skip those scans. Offscreen deck state advances in preloaded rooms.
- `tests/black_woods.gd`: chapter/state retention, all twelve main challenge Watch exits, quest state/retry/award/no duplicate, existing recordings, restart. Existing application and world checks pass. Polish check updated to verify every recording in the expanded manifest rather than hardcoding 79.
- GPU source captures and logs: `.cache/godot/black-woods/`. Capture reports now include frame/physics median, p95, p99 and worst samples. Short staged samples are not comprehensive performance evidence.
- Explore audit/proposal: `docs/plans/godot-explore-comparison-and-proposal.md`. Confirmed missing local fall rewind and incorrect native dash cue; conversation/input gates are confirmed stalls but not a diagnosis of every reported freeze.

Historical checkpoint: traversal/reward proofs, profiling, packaging and delivery were still pending here. See the 0.4 delivery entry above for the final evidence. Explore runtime and voice generation remain outside this task.

Further verification this pass: `tools/record-world2.gd` generated `data/world2-tour.json` from a single continuous normal-input world, with no room warps, position/state assignments, resets or physics edits. It reaches every main challenge and the crossroads in 11,880 frames with zero deaths; it walks to fires and waits for machinery cycles using normal inputs. `tests/world2_journey.gd` replays and verifies that complete journey. `tests/black_woods_branch.gd` physically climbs from the kitchen fire into the fork and drops back through the shaft, with zero deaths. World 2's twelve original browser/native transfer fixtures also pass after parameterizing the seam checker. Study-room sweepers now wait for first input, then retain/advance their state offscreen; spring centering applies only in the continuous Ascend world (standalone browser fixtures remain unchanged).

Short GPU samples at the kitchen (not a final benchmark): physics median ~0.39 ms, p95 ~0.46 ms; displayed frame median ~15.3 ms with occasional ~29 ms frames. Removing shadows in a diagnostic sample improved the median to ~14.3 ms but did not eliminate outliers. Keep lighting enabled by default; representative moving-route profiling is still owed. Sky gradient is now cached and audio files are warmed before play. `--world 2 --tour` drives the recorded continuous native journey for GPU profiling. Do not call the optimization complete based on the current short samples.

### Final timing and renderer decision

Packaged quest captures on this 60 Hz Mac measured wall-clock medians around 16.7 ms. Across runs, p95 varied from about 17.0 to 22.4 ms, with occasional larger outliers (the last capture's worst sample was 95.4 ms). Physics stayed sub-millisecond in the median. These measurements are intentionally reported as variable rather than selecting the best run. The roughly 26.9-second final mixed WAV is non-silent (peak 0.593, RMS 0.056) with zero clipped samples. The final screenshot shows the heart award and the correct closing subtitle, “Two bowls and a working lamp…”; the carry reminder no longer plays over it.

An unshipped Metal/mobile-renderer CLI experiment had steadier timing but crashed during exit (signal 11). The package keeps the established compatibility renderer. Do not enable Metal based solely on that experiment's FPS. Remaining occasional frame-time spikes are a documented limitation, not a claim that Explore's reported freezes were fixed. All packaged-check logs are free of engine errors and warnings; the failed Metal experiment is separate (`metal-profile.log`).

Silas’s hook hand-in plays his existing closing recording immediately and removes any queued carry instruction, so the heart award and spoken line agree. The full application quest check verifies this exact transition.
