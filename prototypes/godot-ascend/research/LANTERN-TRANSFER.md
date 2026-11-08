# Lantern opening revision · 0.40.0

The opening now separates transporting the lantern from transporting the player. The starting bank ends at x88; a permanent receiving shelf begins at x168, sixteen pixels higher. Carrying blocks dash. Throw the lantern from the outward jump, let it travel ahead, then dash across empty-handed and retrieve it. The door wall catches its horizontal drift.

The receiving shelf is permanent so changing phase does not drop the cargo. Step left out of the low overhang, jump right onto the first ledge, then reverse left onto the blue plate platform. Set the lantern down, drop left to the lower floor and walk through the door before dashing. The opening bell has been removed.

The second half retains every map cell from column 29 onward, the same flag, and the exact final six reference inputs: hop, down-right landing dash, wavedash, up-right dash and landing. No movement constants or runtime scripts change. A complete Watch includes four extra walking frames after the old exit staircase so the isolated reference crosses its physical exit as well as the continuous-world boundary.

All 42 other room definitions, their recordings, chapter placements, required checkpoints and chapter metadata match the 0.39.0 baseline. Branch and Runway join Pod, Crossing and Wall as banked rooms; no rooms are added or combined. Existing local World 1 edits are preserved.

Verification uses actual normal inputs. The dedicated lantern test checks an airborne throw, empty-handed crossing, retrieval, two carrying jumps and plate activation before the original wavedash finish. A no-throw version fails. All 117 sampled carrying-only takeoff/release combinations miss the raised shelf; a deliberately shorter gap succeeds as a positive control. These bounded samples support the layout and do not prove the absence of every possible advanced movement shortcut. The existing buffered grab can produce an advanced dash-catch; its mechanics are preserved.

Nearby complete witnesses succeed across four starting-walk timings, four jump-hold timings and six post-throw delay timings; each offset is tested independently. Application tests check the hint, live clear, complete Watch exit and death/retry restoration. The full Fractured Woods tour clears 26 road sections and reaches the crossroads in 11,549 frames with zero deaths. The tour file includes 27 visited regions counting the final crossroads.

The packaged validation set covers `lantern_transfer`, `fractured_woods_next`, `fractured_woods_next_app`, `fractured_journey` and `fractured_woods_feel`. The harness requires actual test completion and rejects script errors, assertion failures and a missing-script negative control. Local logs and screenshots live in the private `.cache/godot/lantern-transfer/` directory.
