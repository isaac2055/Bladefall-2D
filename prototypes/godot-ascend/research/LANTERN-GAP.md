# Restore throw and set; give the door a real gap · 0.42.0

The 0.40.0 throw, receiving shelf, two carrying jumps and plate placement are restored, including their exact first 23 reference segments. After placing the lantern, drop left onto a raised departure bank. It ends at x168; the opposite bank starts at x224, immediately before the door at x232. A real pit separates them. A small ledge at x184–208, y352 supplies the lower alternative. There is no continuous floor beneath the gap; thorns remain below it. The door bank is at y344, sixteen pixels below the departure bank at y328.

A rightward dash crosses the gap but removes the blue support, drops the lantern onto its original receiving shelf and closes the door before arrival. The no-dash witness drops onto the isolated ledge and jumps to the door bank. Once through the door, the existing final jump works as before.

The return platform at x88–128, y304 supports recovery. After a failed dash, jump back across the lower ledge to the departure bank and climb to that platform. Jump/dash back to the receiving shelf, retrieve the lantern and repeat the two carrying jumps. The full recovery witness reopens the door and finishes without death, retry, teleporting or state resets.

Every map cell from column 29 onward, the goal and the exact final six reference segments are preserved. All 42 other room definitions and recordings, chapter placements, checkpoints, metadata and shared physics are unchanged. The local World 1 edit is preserved. No art, voices or runtime mechanics are added.

`tests/lantern_bait.gd` verifies the restored throw setup and actual airborne throw, the physical pit and isolated ledge, complete no-dash clear, failed dash hitting the closed door, and full repair-to-finish witness. Making the lantern support permanent lets the same tempting dash pass the door as a positive control. The approach, ordinary crossing jump and final positioning have at least five successful nearby timing samples each, varied independently. Application and packaged checks cover native/source parity, hint, full Watch exit, retries and complete chapter playback. Private evidence is in `.cache/godot/lantern-gap/`.
