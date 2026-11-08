# Seed clearance and higher Wall transfer · 0.38.0

Only chapter 22's **Pod Beneath Two Ceilings** and **Wall You Must Bring Back** change. Crossing, the banked Bridge and all other room definitions/references stay unchanged. Movement constants, dash/bell behavior, quests, voices and checkpoints retain their existing rules.

## Pod: space for the actual seed approach

The inner-facing thorn strip and its pointed lip are removed. The low stone partition moves two 8px tiles to the right, with its top one tile below the Amber runway. This opens the drop and side-cut approach beneath the Blue cap instead of asking the player to pass directly beside directional spikes. The seed, bell, high/low rebound sequence, launch runway and final landing retain their positions. The sealed canopy and guarded outer face remain.

The test compares the same 96 combinations of lateral approach and falling delay against the previous room. It covers the low seed contact and the following rightward movement, rather than measuring the later wavedash. The old room survives 67 samples and supplies 32 successful low rebounds without death. The new approach survives all 96 and supplies 49 successful low rebounds. A surviving miss is not counted as a successful bounce. These are finite timing samples, not proof of human difficulty or all possible approaches.

## Wall: a higher, longer transfer

The capped departure rises 32px. The seed moves from (248,232) to (264,216), farther outward and higher. The returning crumble, low roof and home landing rise 8px together, retaining the relative final launch geometry. The high shard moves to (248,152), along the up-left return from the seed rebound; the second remains near the returning crumble, now at (184,136). Both still have to reach the flag before the full-height exit gate opens.

The spawn-facing wall is guarded between y=160 and y=224, above the initial crossing window and below the returning ledge. A reproduced no-seed climb reaches the return in the otherwise identical unguarded layout; the same inputs fail with this guard. The initial crossing stays below it and the intended return stays above it. `tests/fixtures/woods-spawn-climb.json` retains the positive control.

The reference has a longer finite-stamina climb, a longer outward jump, the high rebound, and an up-left dash through the high shard before landing on the crumble. Five nearby departure/steering/landing variants also clear deathlessly with both items, one pod contact and the final powered launch. The old short-transfer reference misses the revised route.

The far bank is now Amber terrain. The initial crossing dash turns it off and spends the charge. The bell moves to (232,256), within reach before landing; striking it in midair restores the bank while the charge is unavailable. The restored landing then refills the dash normally. The reference is no longer a bell strike performed on safe permanent ground, where an ordinary ground dash was an easy substitute.

An executable positive control replaces the previous room's bell strike with a ground dash, removes its bells and still completes the old room. The new reference cannot simply omit its airborne bell and wait on the absent bank. This verifies a useful bell/resource sequence in this approach; it is not a claim that every possible alternative phase preparation or every bell in the game is mandatory. The shared dash/phase mechanics are unchanged.

## Verification

`tests/fractured_woods_clearance.gd` keeps the previous definitions in `tests/fixtures/woods-037-before.json`. It checks the reported seed approach, the earlier thorn failures, spent airborne charge, bell restoration, physical landing/refill and the ground-dash positive control. Existing suites cover complete live clears, complete Watch exits, both required return items, independent death/retry resets, hints, camera framing and native/source parity. Return-item checks use the current authored flag height.

A fresh pod-free Wall search starts before the climb, retains ordinary and powered movement, and finds no finish in 30,000 branches (budget exhausted). Its finite action set and beam pruning are limitations; it is not an exhaustive proof against all alternatives.

The continuous Woods reference is re-recorded through the same 24 regions in 8,682 frames without deaths. Private tuning, screenshots, search output and signed-package evidence live under `.cache/godot/woods-clearance/`; they are not committed. The unrelated local World 1 scene retains SHA-256 `31dbed0936d4552718299175b24394ba5d0b1dc8fd073f3765949828cd056d47`.

The final signed 0.38.0 app passes **26 packaged suites**, including the 1,221 route variations, the spawn-side positive/negative control, complete app clears, Watch, retries and full Woods playback. `final-verification.json` records every suite log and the shipping PCK hash.
