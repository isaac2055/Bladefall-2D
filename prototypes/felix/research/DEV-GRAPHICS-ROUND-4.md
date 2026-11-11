# Graphics Lab, round 4: seasonal looks

F9 now cycles seven presets: Original, Clear, Atmospheric, Illustrated, Nightfall, **Autumn** and **Frostlight**. The existing source launchers and F8 comparison still work.

- **Autumn:** gentle falling leaves, an Amber scenery palette and the new Brushed terrain finish.
- **Frostlight:** slow snow, a Frost scenery palette and fine-grit terrain.
- **Scenery palette** can be set independently to Original, Amber or Frost. It changes the experimental scenery and existing mote/rain accents, without recoloring the actor or puzzle indicators.
- **Weather** now offers Snow and Leaves as well as Motes, Rain and Glints. Density, strength, camera following, favorite recall, Still and Reduced Motion remain effective.
- **Brushed** is a low-contrast directional surface treatment. Like the other finishes, it preserves the tile's alpha, geometry and light masks, and strength zero restores the original material.

The new seasonal effects are decorative, stay behind tiles and actors, and do not accumulate into terrain or create landings. The backdrop preserves the scene's authored sun or moon instead of drawing a second disc. Original retains its existing defaults.

## Compatibility and checks

The expanded list moves Custom to a new slot. Version 1–3 options and favorites are migrated explicitly so an old Custom favorite does not become Autumn. New seasonal IDs remain available after a save/recall round trip.

Developer checks cover seasonal preset cycling, the real finish uniform and layer parameters, Reduced Motion, F8, favorite persistence, migration, and unchanged paused world/checkpoint state. Native captures cover Bladefall's Fractured Woods/Causeway and Felix's bedroom, Woods, Causeway and challenge view. Local images and graphics JSON are in the Felix worktree's `.cache/graphics-lab-round4/`.

Phone-sized Chromium WebAssembly previews check Autumn, Frostlight and A/B comparison without shader or script errors. These are emulated phone dimensions; no physical-device performance claim is made. Distribution packages and public sites are unchanged.
