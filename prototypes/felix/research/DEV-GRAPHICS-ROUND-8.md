# Graphics Lab round 8 — Storm

**Storm** follows Dawn in the ten-preset F9 cycle. It combines a cool Nightfall backdrop, two drifting cloud bands and two depths of driving rain. Clouds and rain draw behind terrain, devices, actors and subtitles.

Use **Esc → Graphics Lab → Surface, scenery and weather** to adjust **Cloud cover** separately from the backdrop and rain. Set **Weather** to **Driving rain** to use it with another look. **Weather strength** and **Weather density** affect the rain, and **Weather wind** affects both clouds and rain. Calm keeps the rain vertical and stops cloud drift. Camera follow can still move clouds slightly as the camera moves. Reduced Motion freezes the clouds and suppresses rain streaks.

Cloud geometry stays cached while its two layers move at different speeds. Cloud strength and palette changes rebuild that geometry. Version 7 developer preferences save the Storm preset by name and retain numeric Custom settings from version 6.

For a reproducible capture, launch with `--dev-graphics --graphics-preset=storm`. Add `--graphics-cloud-strength=0` to isolate the rain, or `--graphics-weather-strength=0` to isolate the cloud cover. Native captures from Bladefall's Fractured Woods and Felix's Phantom Causeway are in the Felix worktree's `.cache/graphics-lab-round8/`.
