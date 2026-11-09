# Player-facing release 0.45.0

Branch: `codex/player-release`; native project: `/Users/computer/Projects/Bladefall-Complete/prototypes/godot-ascend`.

## Requested behavior and implementation

1. Player menus omit Test / Movement Workshop. Its shared native source remains available internally because the thirty approved campaign extensions use it.
2. Five consecutive Spoken dialogue presses enter session-only developer mode. Intervening input or a gap over two seconds resets the sequence. Mixer, appearance controls and animation examples are hidden otherwise. Leaving developer mode restores the player preset.
3. Section and world menus list real saved arrivals only. The starting world is Outskirts. No unknown entries or locked placeholders are inserted. Newly earned onward, Fractured and Core routes are reachable from their completion screen and from the title; taking a route records its first actual arrival. The title remembers the last visited world.
4. All chapters use Brush knight (5), Paper Cutout people (7), Original scenery (0), Measured walking (1), Weathered/rock-strata treatment (2). Per-person editor style overrides cannot override the player preset. The title cutscene uses the same Brush knight renderer.
5. Controllers work for gameplay, title, pause, results and settings. Persistent remapping supports keyboard keys, gamepad buttons, sticks/triggers, deadzone and reset. Bindings accept every controller device ID, including secondary/reconnected pads. Escape/Start remain fallbacks. Disconnection preserves keyboard input; binding conflicts are identified.
6. Watch uses a deep-copied room and independent simulation. It cannot mutate live position, entities, terrain, machinery metadata, discoveries, quests or scores. Demo completion waits for an explicit choice. Player Try yourself returns to the real checkpoint and counts as Retry; normal real runs can still finish. In a carried shiny attempt it restarts the whole world. Developer Take control remains available and invalidates that run.
7. Boot shows a growing Willow Studios mark, a knight crossing a windy moonlit bridge as Bladefall appears, then the animated title. Enter/A/click skips. Reduced motion skips the opening. Gameplay and its clock stay paused until Play.
8. The first eligible Outskirts completion explicitly explains the full-world deathless flower-root reward. Both plant-half acquisition orders can reach the newly opened Core.
9. A code-authored on-theme SVG provides window, splash and multi-resolution `.icns` artwork. The standalone app has its own engine/resources/license/readme and a universal Intel/Apple Silicon launcher. `exports/Bladefall-macOS.zip` contains `Bladefall.app` and `Read Me.txt`.

## Verification

- All eleven packaged regression suites passed: player_release, sampler, sampler_app, sampler_journey, run_profile, cores, world_checks, world2_journey, world3_journey, fractured_journey, woods_nine. Evidence: `.cache/player-package-check-final/pack-results.json`.
- Subsequent watch-completion, saved title selection, deep-copy isolation and multi-device controller fixes passed focused packaged player_release, sampler_app and cores suites. Final evidence: `.cache/player-package-controllers/pack-results.json`; all verified true, no loading/runtime errors. The harness rejects its missing-script negative control.
- Controller probes established the original device-0-only limitation and verify that devices 0, 1 and 3 now match bindings. Player tests inject real Godot joypad/button/axis events, navigate GUI focus, save/reload bindings, and exercise keyboard fallback and capture cancellation.
- Studio, cutscene, title, remapping, player pause and first-clear screens were rendered and inspected. Latest GPU test log contains no runtime errors. World 1's native scene still matches the user's source SHA-256 `31dbed0936d4552718299175b24394ba5d0b1dc8fd073f3765949828cd056d47`.
- Bundle signature verifies with `codesign --verify --deep --strict`. ZIP integrity and its icon/version plist entries verify. The launcher has both arm64 and x86_64 slices. A ZIP-extracted app boots successfully from `/tmp`, outside the repository, without project files or an engine install.

## Remaining release considerations

No physical controller is connected to this Mac; physical feel/hardware testing remains advisable. Signing is local/ad hoc, not Apple Developer ID notarization. Ordinary active checkpoint/machinery runs are not restored after quitting: permanent discoveries, rewards, records and preferences persist, while title Play begins a fresh world. A future ordinary save/resume feature must continue to prohibit shiny challenge checkpoint resumption. Windows/Linux packages are separate future builds, not part of this macOS artifact.
