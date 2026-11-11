# Graphics Lab round 6 — Dawn

F9 cycles through nine presets, including **Dawn** after Mist. Dawn pairs Illustrated scenery in the warm **Rose** palette with sparse glints, gentle motion and soft light shafts at 65%. F8 compares the current look with Original.

Under **Esc → Graphics Lab → Surface, scenery and weather**, **Light shaft strength** runs from 0 to 100 and works independently of scenery and weather. At zero, the shaft pass is skipped. Shafts share the cached backdrop canvas behind terrain and actors and respect the existing parallax and Reduced Motion settings.

The configuration stores Dawn by name and saves shaft strength with the current look and the favorite. Version 5 settings with only a numeric Custom index still load as Custom.

The existing development launchers enable Graphics Lab. For captures, use `--dev-graphics --graphics-preset=dawn`. Add `--graphics-shaft-strength=0` for a comparison with the shafts disabled.

## Verification

- Native Graphics Lab tests in both games covered preset cycling, strength without scenery or weather, zero-strength removal, settings migration, and world and checkpoint preservation.
- Local web exports loaded in phone-sized Chromium and passed the Dawn and F8 comparison smoke checks.
- Bladefall connected-save and Felix story-save suites reported zero failures.
- Desktop and browser captures are in the Felix worktree's `.cache/graphics-lab-round6/`.
