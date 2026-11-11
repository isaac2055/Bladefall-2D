# Graphics Lab, round 3: fine tuning and comparison

Both source launchers now include:

- **Surface, backdrop and weather strength**, each from 0 to 100%. Zero surface strength removes the experimental tile material; zero backdrop/weather strength skips the corresponding experimental drawing.
- **Sparse, Balanced and Lush weather density.** Balanced retains the previous counts; Sparse uses fewer motes/rain strokes.
- **Scenery follows camera**, independent of weather movement. Camera following now eases toward its target, starts at the correct camera position and retains its position when disabled. Reduced Motion and Still remain effective.
- **F8 / Compare with Original**, a temporary A/B view. It does not overwrite your custom settings or save the comparison state. A small upper-right badge identifies which look is displayed. Editing or choosing a preset exits comparison.
- **Save favorite look / Recall favorite look.** One favorite slot retains all switches, render scale, finish, scenery, motion, density and strengths. Reset to Original does not delete it. Favorites and settings use the existing separate developer configuration, with compatibility for earlier versions.

F9 still cycles the five presets. Open **Esc → Graphics Lab → Surface, scenery and weather** for fine tuning. The source launchers remain `Play Graphics Lab.command` in each game folder.

For repeatable captures, the existing preset/scale flags can be combined with `--graphics-surface-strength=40`, `--graphics-backdrop-strength=55` and `--graphics-weather-strength=45`. Captures write the effective graphics configuration, including whether Original comparison was active.

## Verification

Native developer checks cover the real render uniforms, zero-strength bypass, F8 round trips without losing a custom look, favorite persistence through a fresh configuration instance, existing-setting migration, and unchanged paused world/checkpoint state. They run against Bladefall and Felix's story/challenge views.

Bladefall's player release, connected saves, passage and touch checks passed. Felix's connected story, story save and challenge save checks passed. The native comparison captures retain the same room and character position. Phone-sized Chromium WebAssembly previews exercise custom strengths, F8 Original and return without script or shader errors. These are emulated phone dimensions, not physical-phone performance measurements.

Local images and configuration JSON are under the Felix worktree's `.cache/graphics-lab-round3/`. Public sites and standalone packages were not updated.
