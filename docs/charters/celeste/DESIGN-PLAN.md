# Precision Workshop update — 7.237.0

Six independent room proposals now live in the separate Precision Workshop menu. See [room designs and verification](PRECISION-WORKSHOP.md). Standard and Fractured geometry is preserved.

# Celeste Standard / Fractured Celeste

## Standard opening prototype — 7.235.0

The Dash Foundry is now the first room of Celeste Standard. Standard has 19 rooms; Fractured retains its original nine. The prototype's movement rules apply only inside the Foundry. All previous Standard rooms retain their geometry, translated by the new room's width; original controls resume at The First Tear. Neither version of The Whole Sentence was retuned.

- Eight-direction committed dash at 720 units/s for 0.16 seconds, preserving faster incoming momentum along its direction. One airborne charge; waiting does not restore it. Ground contact and visibly marked cyan refills restore dash only. Double jump is available (restored in 7.236.0); wall jump and ground pound remain disabled in this opening experiment.
- The cyan refill requires an airborne approach, followed by a second dash to the shuttle. It is personal and resets on retry.
- Any dash inside the marked blue rail field starts the shuttle. A knight dashing while aboard stays braced on its deck; a knight in the air keeps the dash trajectory and can intercept the moving deck. The shuttle returns for another attempt. The final 0.12 seconds of outward travel and 0.18 seconds at the endpoint provide momentum, with 0.12 seconds departure grace.
- A violet aether vein extends the committed dash through its volume. Entry without a dash fails; it does not choose a route automatically. The exit restores one dash, used to redirect over the final hazard before landing. The room has no device-receipt requirements: physical geometry determines success.
- Shared shuttle activation is predicted locally and confirmed by the host without repeatedly snapping its motion. Personal retries do not rewind the shared shuttle or consume a partner's refill.

Verification: `npm run verify:dash-foundry` checks a full legal-input opening traversal, four failing counterfactual replays (missing refill, stationary shuttle, missing exit dash, missing diagonal entry), all eight normalized dash directions, resistance to mid-dash reversal, no timed aerial recharge, clean retry, restoration of the original kit, airborne remote shuttle activation, fresh-save UI launch and native keyboard diagonal dash/retry. Counterfactuals establish necessity for the recorded route, not impossibility of every alternate route. Geometry comparison uses a pre-edit baseline, normalizing only room translation/IDs and decorative random phases.

`npm run verify:celeste` independently replays both complete courses: Standard 7,641 frames and Fractured 4,017, both zero retries. Both original Whole Sentence input tapes are exactly unchanged; all Fractured input tapes are unchanged. Existing 16 blade/momentum and 12 feedback checks, eight retry fixtures, cold-lift counterfactuals and flight/ring checks pass. Two-browser co-op passes the full courses with simultaneous and staggered starts; a final focused `node scripts/verify-celeste-coop.mjs --foundry-only` verifies the extended dash field, retries and reconnect. Simulated transport only; no external-network or human difficulty acceptance claim.

Evidence is in `evidence/foundry/` plus the full-course verification files. Desktop captures reviewed. Local deployment mirror rebuilt with 231 assets; version 7.235.0 / cache bladefall-v345-dash-foundry. Not published. Release check retains four existing editor-reference/size failures, with no new asset-stamp or mirror mismatches.

The original course design and historical verification follow.

Implemented as standalone stages 41 and 42. Open **Title → Precision Courses**, or find the named entries in Level Select's Base and Fractured tabs. No campaign clear, shard, or saved ability is required; the campaign's forty-region physical graph and twenty-echo itinerary remain unchanged.

## Course design

**Celeste Standard** has nine isolated lessons, then nine combinations. Lessons teach tear entry/refill, Chainhook and tension release, strike-activated counterweight momentum, slam rebounds, downward-slash pogo chains, upward-slash lift bells, finite steerable gale flight, gravity inversion, and fixed-portal momentum. Integrated rooms combine tear/rings, weight/anvil, gale/tear, gravity/rings, weight/anvil/tear/tension-ring, portal/gale, pogo/upward-slash/tear, upward-slash/pogo/tension-ring, and a final tear/gravity-weave/tension-ring. The last weave draws on Inversion’s floorless finale: flip through alternating hazards, cross an inverted arch followed by an upright arch, then catch the ring before landing.

**Fractured Celeste** consists entirely of those nine combinations, with faster counterweights, 66-unit anvil surfaces (Standard: 94), tighter overhead clearance, 6.2-second flight charges (Standard: 6.7), 30-unit blade targets (Standard: 42), and cycling hazards after rings where the player can wait. Two blade-relay rooms require both slash directions in the same airborne chain. Flight-to-zipline landings have no timed hazards. The first tension-ring transfer can be solved by a quick hook cancellation that stays below the timed overhead hazard.

Both levels use the real seam, Chainhook, portal, dash, jump, and gravity systems. New devices are restricted to these courses:

- **Counterweight:** sword strike starts its diagonal ride; jumping inherits horizontal and vertical motion. Arrival retains full travel momentum for a short 0.18-second window, with a 0.12-second departure grace. Waiting at the endpoint no longer preserves the boost indefinitely. Jump spends the charge. Every counterweight has a substantially widened physical crossing; charge is shown by a lit/dim strip without spent text.
- **Rebound anvil:** holding Down airborne for 0.18 seconds commits the ground pound; its impact launches the knight and restores the next aerial action. The rebound is not shortened by releasing Jump. Each Down hold can start only one pound; release Down to rearm it, preventing repeated rebounds while holding the button.
- **Pogo pearl:** Down + Slash above the pearl rebounds at 650 units/s and restores the air jump and dash. A sideways/upward swing or a miss grants no launch. Each pearl is consumed until retry. A brief Down tap does not pound; holding Down without Slash for 0.18 seconds does. Slash resets that hold timer.
- **Lift bell:** Up + Slash from below launches the knight at 760 units/s; steer/dash into the next target. Blue triangles and an upward blade animation distinguish it from the round pogo pearl. Only the first target of each type shows instructional text; later targets retain beige down arrows or blue up arrows. Both slash directions have a fixed 0.24-second recovery in these courses. An unconnected side swing accepts Up/Down within an 80-ms chord window, so Attack may arrive just before the direction.
- **Aether form (gale pickup):** the knight becomes a compact glowing shard, in both renderers. All four directions steer through curved turns with smoothed angular velocity and speed; Jump brakes and Dash exits. Each aether source is consumed until retry. A remaining-flight bar makes the limit visible. Every flight route spans two sets of four alternating obstacles with a required mid-route refill; rooms are 4,400 or 5,200 units wide. Refills preserve steering and speed.
- **Purple ring:** release automatically inverts gravity and grants three seconds of G control outside gravity rooms. Retry clears the lease. All course rings allow indefinite waiting.
- **Tension ring:** the striped amber ring preserves ordinary hanging but launches forward/up when jumping away. Early jump input has a short arrival buffer.

The exit shutter lights when the room's required devices have been used. A separate checkpoint shutter requires landing before entering the next room, preventing a long fling from silently skipping its checkpoint. Checkpoints show flags; **R** (or your configured checkpoint key) retries the current room without a Blood cost. Retry resets its device positions, consumption, hazards, pending movement, and clock together. Course speed is fixed at 212 units/s and dash cooldown at 0.75 seconds; attack speed is fixed and the kit supplies an Oathblade without a stowed bow. Directional slashes work here without the Pure Nail gift. Outside the courses, the Pure Nail still enables enemy pogo (560 units/s); upward strikes now loft ordinary enemies while bosses keep their authored movement. Saved equipment and gifts are unchanged.

## Verification

`npm run verify:celeste` independently replays the recorded frame-by-frame inputs in `evidence/routes.json` from each level's actual entrance. No invincibility, position corrections, granted progress, or modified hazards are used during either full traversal.

- Standard: all 18 rooms, 7,276 input frames, zero retries, course-complete screen.
- Fractured: all 9 rooms, 4,017 input frames, zero retries, course-complete screen.
- Five expanded counterweight gaps span 1,088–1,395 units edge-to-edge. Across 48 expired-charge jump/dash timings per lift (240 trials), no attempt reaches the destination at landing height. These sampled counterfactuals supplement the successful boosted full-course routes; they are not an exhaustive search of every input sequence.
- All five flight routes fail before the destination when their refill is removed. Purple-ring jump/drop inversion, G correction, lease expiry/retry clearing, and six-second gold-ring waiting are verified.
- Eight checkpoint fixtures verify identical restored device/player state after movement, including consumed wind and activated counterweights.
- Sixteen explicit collision/combat checks cover both strike directions, wrong-direction rejection, slam separation, missed/spent targets, air-action refill, exact TAS snapshot replay, retry clearing, Pure Nail enemy pogo/upward launch, hold-to-pound rejection/activation, and timely and expired endpoint jumps on all five counterweights. Fixture setup is separate from full-course traversal proof.
- Twelve additional checks exercise slash chords in both orders, one rebound per held pound, both portal launch bursts, and bounded four-direction aether steering. Native keyboard checks use Down/Up + W in both orders, including release frames between trials.
- Fresh-save UI clicks launch both named levels; keyboard movement works; both Level Select entries are enabled.
- Equipment-independent movement and valid campaign/world/progression registration are checked.
- `evidence/verification.json` contains the current results and source hashes. Screenshots cover the menu, both level entrances, and the new blade lessons and integrated rooms. New high launches use vertical camera tracking. The first tear and fixed portal now burst at 820 units/s with preserved ballistic motion.

Focused campaign, simulation, platformer, TAS, progression, world and zone checks: 47 tests pass across the current focused campaign/platformer/TAS/progression/zone runs. The existing jump-arc test was corrected to account for the already-implemented held-jump apex gravity easing. Count/connectivity assertions now distinguish the two standalone courses from the connected campaign.

The local deployment mirror is rebuilt; nothing is published. Automated traversal proves reachability and repeatability, not a human difficulty rating. Touch-specific balance was not evaluated.

## Co-op (7.227.0)

Connect through Co-op, then the host chooses either Precision Course (also unlocked in the co-op region picker). Both knights must use every required device and reach the end of each room themselves before the shared checkpoint advances. They can move simultaneously or one can arrive earlier; neither player's controls or camera are tethered to the partner. The completed knight can move around while waiting. Required-device receipts, pickups, flight, gravity, launch charge and retries are personal. Counterweight activation remains shared, and the lift returns for another rider after its brief launch window. The HUD shows each player's completion separately.

`npm run verify:celeste:coop` traverses all 27 rooms with legal inputs in two browser instances, once with the second player starting later and once with both moving simultaneously. Neither player inherits the other's completion. It also verifies personal retries, fresh reconnects with previous attempt counters, personal portal arrays, unlocked course access and the title menu. Results: `evidence/coop-verification.json`. The tests exercise production encoding and handlers over in-memory transport; external signaling and internet latency are not exercised.

Across the campaign and Fractured regions, each knight must reach the same exit or boarding point before the host commits travel. Completion requests are scoped to the stage seed and can precede interpolated body snapshots. Waiting never opens a modal or tethers movement. End-of-act cards likewise require both arrivals. Falls, wipes and reconnects use personal checkpoints, preventing a leader from carrying the other player past unfinished traversal. The shared world retains synchronized enemies, kills, switches and quest actions. Placed portal collision is local; partner mouths are decorative dashed outlines only.

Campaign regression covers matching builds for all 40 campaign/Fractured regions, two-arrival Act One/Act Two/Fractured exits, the final ending, boarding, independent movement, personal recovery/reconnects, shared deaths in both directions, and portal isolation. Dialogue networking and saved side-story Continue fixes remain in place.

The title menu omits Test NG+1/2, Appearances, Boss Rush, World Map, Memories and the Rift Shard counter. Its footer contains only the version.
