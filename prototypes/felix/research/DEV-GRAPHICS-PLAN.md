# Bladefall and Felix: developer graphics plan

Build a **Graphics Lab** in both games: compare three looks in the same room, isolate the cost of individual effects, and keep the published appearance as the default. This is a proposal for the next implementation pass.

## Where to build it

- **Bladefall (`0b24221`):** extend the existing developer Appearance controls in `scripts/main.gd`. Keep the knight, NPC and environment pickers. The existing `--capture` report already records frame timing, draw calls, light counts and renderer timings; extend it with the selected preset and effect settings.
- **Felix (`78d9dca`):** add an explicit `--dev-graphics` entry to the pause menu in `scripts/felix_main.gd`, the actual startup scene's script. Its current developer flags are useful for capture but do not provide a graphics panel. Apply settings to both the story landscape (bedroom, Woods and Phantom views inherit it) and the separate challenge landscape. Preserve story-driven darkness, Felix's glow, and readable puzzle lights.
- Use the same preset names and control semantics in both games, with palettes tuned per game. Store experimental choices separately from player graphics preferences and game saves. Provide **Reset to Original** and a one-click preset comparison that stays in the same room. Do not tie render settings to scoring or progression.

## Priority and stop points

| Pass | Work and deliverable | Rough working time |
| --- | --- | --- |
| 1. Controls and baseline | Add the dev panel with **Original**, **Clear** and **Atmospheric**, plus overrides for ambient particles, decorative shadows, the vignette/grain pass and render scale (**Auto / Full / Half**). Original keeps today's platform-specific scale; Clear removes cosmetic work while keeping visibility cues. Capture matched Original and Clear scenes with frame timing in both games. | 35–55 min |
| 2. Distinct looks | Bladefall Atmospheric: ember drift and a cooler distance tint. Felix Atmospheric: warm bedroom dust motes, softer Woods fireflies and a faint cool Causeway haze. Reuse existing layers or small bounded emitters; keep new effects behind separate toggles and clear of HUD and hazard silhouettes. Reduced Motion takes precedence over moving cosmetics. Deliver matched screenshots of all three looks. | 25–45 min |
| 3. Tune the expensive option | Profile one setting at a time. If decorative lights or shadows dominate, test a budget that prioritizes the player and puzzle lights. If fill rate dominates, tune the half-resolution path while keeping UI and touch coordinates unchanged. If neither improves the measurements, keep the control as a comparison tool and record the result. | 20–35 min |

Pass 1 is the minimum useful delivery. Aim for passes 1 and 2 and use pass 3 only if usage and time remain. These are rough implementation estimates, not a conversion of the user's remaining weekly usage. Recheck available usage after pass 1; reserve the final part of the session for checks and handoff. Defer asset generation, a new renderer, and cross-platform packaging/publication to a separate pass.

## What to measure and protect

1. Capture the same camera and recorded input in Bladefall's late Fractured Woods and Causeway and in Felix's later Woods and Causeway. Include one Felix challenge room to exercise its separate renderer and one bedroom shot to check narrative lighting. Take a warmed sample on Mac and a browser smoke run at phone dimensions; label the browser results as emulation.
2. Compare median and 95th-percentile frame time, draw calls and visual readability. Measure physics separately to distinguish renderer load from save or simulation stalls. Keep an optimization only when it beats normal run-to-run variation. Turning post-processing off should bypass the screen-reading draw, and turning particles off should stop their work; a transparent effect can still cost time.
3. Verify Original against the pre-change screenshot, switch presets in a paused room and after a route change, and verify scale changes preserve framing, crisp pixels, subtitle anchors and touch alignment. Check Felix's story lights after its per-chapter draw overrides run. Run the relevant passage/route and save regression checks; puzzles, collision, saves, checkpoints and rewards stay intact.

For the first hands-on comparison, open Felix's **The Launch Waiting on the Return** and switch Original → Clear → Atmospheric. The last piece, moving platforms and spike edges should be equally readable in all three. In Bladefall, do the same at an attached Fractured room passage while it opens. If any cosmetic effect hides a cue, disable it there before expanding its use.
