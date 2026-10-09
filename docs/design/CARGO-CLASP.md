# Cargo clasp

Room opt-in: `cargoClasps: [{id: 'A', c: 12, r: 8}]`. Coordinates are an empty 8×8 tile. IDs are unique inside the room. Load the device and drawer after the other moving-object devices.

An open ring catches a loose lantern touching it and suspends it exactly inside the tile. It has no collision body, does not stop light, and gives no movement refill. The caught lantern remains an ordinary unheld lantern: it shades beams and weights receivers. Grab retrieves it. Strike the ring to release it into the room’s current gravity. Both actions visibly open the ring for 24 frames, allowing the lantern to leave before another catch. Retrying resets it.

The renderer uses open cyan brackets, gold occupied brackets, and muted open brackets after release, with catch/release particles and sound. Labels remain upright during gravity inversion.

The mechanism stores position rather than adding movement. It is useful when cargo must keep doing a job while the knight uses both hands elsewhere, or when the knight and cargo need different lasting results from one gravity change. It is not a platform, a second dash, or an exit trigger.

Focused check: `node scripts/check-cargo-clasp.mjs` exercises ID-zero cargo, stable capture/shade, normal pickup, repeat catch, blade release, gravity mirroring/release, retry and rooms without the opt-in. B16 and B17 provide clean normal-input routes through the mechanism. Bank records remain candidates for human fun/difficulty/suitability review.
