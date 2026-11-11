# Graphics Lab: implementation and verification

Both games now have **Original**, **Clear**, and **Atmospheric** in their developer pause menus. On Mac, open `Play Graphics Lab.command` from either game's source folder. It starts Bladefall in Fractured Woods and Felix in the final Causeway puzzle. Press **Esc** and open **Graphics Lab**, or press **F9** to cycle the presets while staying in the room. In Bladefall, the panel is under Appearance. Felix enables it with `--dev-graphics`.

- **Original** restores the original presentation and the existing automatic resolution for that platform and chapter.
- **Clear** bypasses the screen-reading vignette/grain effect and suppresses decorative shadows and ambient emissions. It keeps puzzle lights, Felix's glow, and narrative lighting.
- **Atmospheric** adds a layer behind tiles, hazards and actors: cool haze and embers in Bladefall; warm dust, Woods fireflies and cooler Causeway haze in Felix. Reduced Motion stops the added moving accents.
- Override ambient particles, decorative shadows, vignette/grain, atmospheric accents and render scale independently. **Reset to Original** clears the overrides. Developer choices are kept separately in `user://dev-graphics.cfg`. Player defaults and campaign save formats are unchanged.

For scripted captures, pass `--graphics-preset=original|clear|atmospheric` and optionally `--graphics-scale=auto|full|half` with `--dev-graphics`. Capture runs ignore saved developer choices; both games write timing and graphics settings alongside the PNG.

## Render samples

Native M1 Mac, warmed captures at the same room spawn with no input, 140 wall-frame samples per run. Frame times include presentation and pacing. Draw calls are a screenshot-frame count, not an average. These are scene samples, not device-wide claims.

| Scene and configuration | Median ms | p95 ms | Draw calls |
| --- | ---: | ---: | ---: |
| Bladefall Fractured Woods, Original | 20.4 | 23.2 | 835 |
| Bladefall Fractured Woods, Clear | 17.7 | 19.9 | 832 |
| Bladefall Fractured Woods, Clear + Half | 16.6 | 18.4 | 832 |
| Felix final Causeway puzzle, Original | 16.8 | 21.3 | 459 |
| Felix final Causeway puzzle, Clear | 15.7 | 29.9 | 457 |
| Felix final Causeway puzzle, Clear + Half | 14.3 | 30.1 | 457 |

Clear removed draw calls in both samples. Felix's lower median did not translate to a better p95, so there is no case here for switching its defaults. Bladefall's sample supports trying Clear or Half in demanding rooms, but subsequent timings varied with load. Automatic light budgets and any default tuning need repeat measurements on target hardware.

Pre-change and Original screenshots had the same 1280 × 832 framing, with a mean difference under 0.2 on the 0–255 scale per color channel for the two sampled scenes. Ambient animation and dialogue timing account for visible differences between captures. Additional native shots covered Bladefall Causeway and Felix's bedroom, Woods and challenge renderer. Local images and timing JSON are in the Felix worktree's `.cache/graphics-lab/`.

## Checks

- Developer tests switch presets while paused, check Full and Half scaling against the same logical rectangle, verify Reduced Motion and shadow restoration, and assert that room state and checkpoint identity are preserved. Bladefall also checks switching worlds and leaving dev mode.
- Bladefall player release, connected saves, passage reveal and touch controls passed. Felix connected story, story road, story saves and challenge saves passed.
- Phone-sized Chromium sessions booted the exported WebAssembly builds with Atmospheric and Half scale, rendered gameplay, and opened pause. The Felix capture showed the actor, moving platform, hazard edges, subtitles and touch overlay aligned. These runs are browser emulation.

This pass is available from source. Standalone download packages and public sites were not rebuilt or deployed.
