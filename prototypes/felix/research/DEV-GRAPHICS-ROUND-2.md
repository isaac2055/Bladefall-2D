# Graphics Lab, round 2

The source launchers are unchanged. Press **F9** to cycle Original, Clear, Atmospheric, Illustrated and Nightfall. For mix-and-match settings, pause and expand **Graphics Lab → Surface, scenery and weather**. Bladefall's panel is in Appearance; Felix's launcher enables its developer panel.

| Preset | Terrain | Backdrop and effects |
| --- | --- | --- |
| Illustrated | Etched marks, with the original tile alpha and lighting | Gentle parallax and drifting glints. Bladefall uses distant ridges, tree bands and shoreline posts; Felix uses bedroom wallpaper, Woods silhouettes and moonlit Causeway water. |
| Nightfall | Fine grit | Cooler backdrops and moving rain. The base ambient emitters switch off so they do not stack with the rain. |

The surface (Original, Grit, Etched), backdrop (Original, Illustrated, Nightfall), scenery motion (Still, Gentle, Full) and weather (Motes, Rain, Glints) can be mixed independently. The existing Atmospheric accents switch controls the weather layer. Still and Reduced Motion keep the scenery visible without moving weather. Changing speeds preserves the phase of the animation. Story characters in the Woods and Causeway backdrop nodes draw in front of the scenery. Spikes, actors, checkpoints, puzzle lights and subtitles retain their existing rendering and state.

Original removes the extra layer and restores the original tile material. The original presets keep their former behavior and a prior custom configuration remains Custom. The new options use the existing separate developer preferences file; they do not enter a campaign save.

## Verification

- Rendered and inspected native captures in Bladefall's Fractured Woods and Causeway, and Felix's bedroom, Woods, final Causeway puzzle and Fractured Causeway challenge. Captures and frame timing JSON are in the Felix worktree's `.cache/graphics-lab-round2/`.
- Dev checks cover F9 wrapping, old preference migration, weather and finish overrides, motion continuity, reset to the original material, and unchanged room/checkpoint state while paused. The Bladefall passage, touch, release and connected save suites and Felix connected story, story save and challenge save suites passed.
- Temporary phone-sized Chromium WebAssembly previews rendered the new presets. The screenshots are emulator-sized browser captures; they are not physical-phone performance tests.

No distribution packages or public sites were updated.
