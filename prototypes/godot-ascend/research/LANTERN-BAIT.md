# The Lantern Above the Door · dash temptation · 0.41.0

The throw-across setup is replaced by a phase dependency that continues after placement. Carry the lantern onto its blue platform and set it on the plate. From the raised approach, the opening toward the door suggests a horizontal dash. That dash removes blue, the lantern drops, and the door closes before the player arrives. The failed dash physically hits the door, then drops onto the safe lower path.

The solution uses that visible lower path from the outset: step off, land, and make an ordinary jump up through the open doorway. The lantern stays on its support until the original final jump begins beyond the door. Changing phase there closes the door behind the player.

Recovery requires no death or room restart. The dropped lantern lands on permanent ground beneath its plate. Restore blue while empty-handed, retrieve it, carry it up the small left-hand steps and through the one-way return platform, and place it again. This is ordinary geometry and existing lantern, plate, phase-platform and door behavior; there are no new runtime rules, event requirements, voices or physics changes.

All map cells from column 29 onward—including the complete door and final jump—match 0.40.0. The last six puzzle reference segments are identical. All 42 other room definitions and recordings, placements, checkpoints, chapter metadata, movement constants and existing World 1 edits are preserved. Branch and Runway remain banked alongside Pod, Crossing and Wall.

`tests/lantern_bait.gd` replaces the superseded throw-transfer test. It checks the live lower route, the failed dash actually hitting the closed door, and a full failed-dash/retrieve/re-place/finish witness without resetting any state. A positive control replaces blue support with permanent terrain: the same tempting dash then crosses the door, establishing that the failure comes from the falling lantern. Independently varied approach, drop and ordinary-jump timings each have at least five nearby deathless complete witnesses.

The application suite checks the actual hint, full clear, complete Watch exit, native/source parity and death/retry restoration. The whole chapter tour reaches the crossroads in 11,424 normal-input frames with zero deaths through 26 road sections (27 visited regions including the crossroads). Packaged checks cover the new puzzle, the three recent rooms, application behavior, the full journey and camera playback. Private evidence is in `.cache/godot/lantern-bait/`.
