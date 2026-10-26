# Four linked movement rooms

These rooms implement the four approved proposals as standalone tests in chapter 4. They replace the unsuccessful Aqueduct experiment; the campaign is unchanged. The native editor scene is `levels/world4.tscn` and the source/ordinary-input demonstrations are in `data/world4.json`.

The earlier room let permanent landings reset the problem between moves. Its recorded solutions often survived removing carrier motion, inherited momentum or crumble behavior. The new rooms each preserve a consequence across the next transfer.

## The Broken Relay

Jump onto the first carrier without spending the dash. Leave during its fast outward motion; the jump supplies horizontal reach, and the dash completes the transfer to the lower side of the vertical counterweight. Its rising motion then supplies the exit height with no dash remaining.

The final weight rises into a fixed housing. The housing prevents standing on its top and restoring the dash. The upper thorn collar and the finish's guarded underside prevent using those static surfaces as an easier route. The collar leaves room to choose an upward departure, including the normal lift grace period; it does not demand the demonstration's exact takeoff frame.

The witnessed route has no intermediate landing after departing the horizontal carrier. Removing either horizontal or vertical inherited momentum breaks it. Removing the dash or freezing the blocks also breaks it. A bounded direct-jump/dash search from the first carrier does not skip the second block.

## Behind the Counterweight

Touch the weight's near side to raise it, release before being taken into the housing, then dash underneath to the far wall. Its thorn collar prevents a direct climb onto the finish. Wait for the weight to descend into catching range, jump back onto its right side, climb a little and jump across to the flag.

The weight is short enough that its parked lower position cannot be caught from the upper wall grip. At its raised endpoint its bottom is out of reach. Only the intermediate return positions provide the foothold. Fixed housing denies a standing reset on top. The descending velocity supplies no upward jump bonus: this room uses the foothold's position and a second ordinary jump.

The solution still succeeds with inherited momentum disabled. It fails with the block frozen at its raised stop or returned immediately to its parked lower position after the dash. This is intentionally a spatial return puzzle rather than a second momentum relay.

## Under the Lintel

The entrance is on the right. Ride the narrow rising block, judge the low roof, then transfer left onto the horizontal block's right side while preserving the dash. Its outward motion carries you right. Leave it with useful horizontal momentum, use the saved upward dash outside the roof, and steer onto the upper-right flag.

The roof makes a strong upward launch near the first block's upper stop unsafe. Waiting for that boost to settle is the recorded solution; a lower departure can trade launch height against inherited speed. The later transfer needs horizontal reach. This permits different movement choices instead of enforcing one exact input sequence.

The horizontal block remains beneath a fixed roof, so it does not provide a standing dash reset. The finish's side collar denies grabbing the platform from below after a direct jump/dash from the first lift. The solution survives disabling vertical inherited momentum but fails without horizontal inherited momentum. A bounded direct-finish search from the first lift finds no clear.

## The Return Ferry

The outward carrier launch reaches a shard beside the far wall while preserving the dash. That wall offers a grip, with spikes preventing a climb onto its top. The carrier is retreating when you leave. Jump and dash back to catch its returning top or side, recover on the carrier, then jump home.

The widened carrier makes the return catch more forgiving. Standing on it after that catch can restore resources: the critical return dash has already been spent. There is no far-bank landing where an outward dash can be restored before making the catch.

The shard is carried until home, never permanently awarded at touch. The home flag requires the shard, so spawning or dying there cannot clear the room. Death/retry restores an unbanked pickup. The demonstration reaches the shard with one dash, spends it on the return, catches the carrier with zero and banks it at home. Retimed wall-jump attempts without the return dash do not catch the retreating carrier.

## Verification and limits

`tests/workshop.gd` runs ordinary inputs through both the fixed-tick physics and the actual application. `tests/workshop_routes.gd` records launches, moving-block contacts, landings, dash state and completion. The suite exercises:

- Native scene compilation and validation, including four independently editable rooms.
- Four deathless clears with no super, hyper, ultra or wall-bounce inputs.
- Static-block, missing-dash and inherited-momentum counterfactuals, with different expected outcomes for each room.
- Both unavailable endpoint positions in the returning-door room.
- A genuinely early first-lift launch dying at the lintel, before reaching the second block.
- Nearby successful timings for each compound transfer.
- Bounded direct-finish searches in the relay/lintel and retimed dashless ferry returns.
- Live room completion, carried pickup death/retry, home-flag requirements, solution playback without awards, next/previous navigation and campaign isolation.

GPU mode additionally renders all four starts, critical transfer states, finishes and the workshop menu. Run it with an absolute output directory after `--` to save PNGs and `checks.json`.

A failed counterfactual replay proves a dependency of that replay, not the impossibility of every alternate solution. The small shortcut searches broaden that evidence but are not exhaustive. Human playtesting is still needed to judge how clearly the rooms teach their relationships and how satisfying they feel. Successful alternatives that retain the central dependencies are welcome.
