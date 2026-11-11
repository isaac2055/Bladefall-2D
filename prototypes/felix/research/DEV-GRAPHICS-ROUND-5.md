# Graphics Lab, round 5: mist, wind and backdrop caching

The **Mist** preset adds low, translucent ribbons behind terrain and actors. F9 cycles eight presets; F8 still compares the selected look with Original. Mist is also a weather choice independent of the preset, and keeps a still haze when motion is reduced.

Under **Esc → Graphics Lab → Surface, scenery and weather**, **Weather wind** offers Preset, Calm, Left and Right. Changing wind keeps the current drift position. Calm removes steady sideways drift while allowing effects such as snow to fall and sway. It does not change gameplay movement or camera following. Density and strength apply to mist as they do to other weather.

The optional backdrop keeps its drawing commands on a separate canvas. A stationary backdrop is reused while weather animates; camera-follow movement and backdrop settings refresh it. This avoids rebuilding static scenery every weather frame, without a claim about whole-game FPS.

The configuration now stores a stable preset name for both the selected look and the favorite. Versions 1–4 still load, including the old Custom slot, which does not become Mist. Original and campaign saves are unchanged.

For reproducible captures, use `--dev-graphics --graphics-preset=mist --graphics-wind=left` with the existing capture options. The source launchers remain unchanged.

## Checks

- Native Graphics Lab tests verify actual backdrop draw counts while weather moves, refresh on camera movement, continuous wind changes, preset/favorite migration and preserved world/checkpoint state.
- Bladefall connected save, passage and touch suites and Felix connected story, story save and challenge save suites passed. Native captures show Mist in both Causeways, Bladefall's Woods, Felix's bedroom and Felix's challenge view. Phone-sized Chromium WebAssembly previews check Mist with left wind and F8 comparison.
- Local images and JSON are in the Felix worktree's `.cache/graphics-lab-round5/`. Public downloads and sites remain unchanged.
