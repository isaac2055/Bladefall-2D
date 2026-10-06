# Combat Rooms

> **Since 7.250.0 these rooms are part of Part IV · Foes (levels 30–49), merged with Claude's foes. See [FOES.md](FOES.md).**
> - **Borrowed Wings retired.** Moth Wing teaches the pogo instead.
> - **Parry arming and the look-first wait moved into the core.** Both are shared with the foes, with the timings unchanged, so all nine recordings replay frame-for-frame identically.
> - **The contact rule is now shared.** Attacks hurt, and bodies hurt only if they wear thorns.
> - **Returned shots cross between the two sets:** coils, husks and enemies of either kind.
> - **Rules and checks below are unchanged unless they say otherwise.** The room count is now nine.

Ten playable enemy/platforming studies in Claude's Precision Core. Open **Title → Precision Courses → Combat Rooms**, or `precision.html?combat=1`. The Precision Core chapter menu also contains **Combat Rooms**. Pause to select any of the ten rooms or watch its recorded solution.

The rooms use the existing 320×184 screen, fixed 60 Hz simulation, pixel-swept collision, jump/climb/dash constants, phase machinery, lantern and zip blocks. There is no second player controller. These are isolated examples; campaign combat has not been replaced.

## Player rules

- Arrow keys move and aim. Space/C/J jumps; D/X/K dashes; A/Z/Shift/L grabs, climbs and carries; W/V/I strikes; **F/O parries**. R resets the whole room. Esc/P pauses.
- Standard pad: A jump, X/B dash, LB/LT grab, Y/RB blade, **RT parry**, Back retry, Start pause. Physical gamepad feel still needs a human playtest.
- Every entrance waits for the player's first movement or action. Study the whole room safely; the pause menu states its question without giving the solution.
- A parry has a nine-tick active window and an eighteen-tick whiff cooldown. It blocks an active attack, restores a spent dash up to normal capacity, briefly freezes the simulation and exposes a melee attacker. Holding the button does not repeatedly re-arm it.
- Air parry preserves the movement trajectory; it does not create a special launch. It does not flip phase machinery. A later dash does.
- Neutral projectile parry returns the incoming bolt; directional input aims it in one of eight directions. Returned bolts can damage enemies, power linked coils or strike existing bells. Ordinary hostile bolts do not power coils.
- A down-cut on a creature uses the **same rebound helper as a seed pod**, including its dash/stamina refund. The rebound happens even on a lethal hit.
- An exposed side cut deals bonus damage. An upward cut trades that bonus for a living, launched target. Guard shields protect their front until exposed; attacks from other angles work.
- Carrying prevents both striking and parrying. Put the lantern down with down + grab.
- Ordinary body contact is safe. Committed attacks and projectiles cause the Precision Core's usual death/retry. There is no campaign health or loot layer in these examples.

## Enemy rules

| Actor | Readable commitment | Useful consequence |
| --- | --- | --- |
| Guard | Stops to telegraph, then thrusts toward the acquired side | Parry opens the shield; side cut finishes, up-cut launches, down-cut rebounds |
| Needlewing | Patrols a bounded region, then dives along its acquired direction | Intercept its approach for a pogo or air parry |
| Sentry | Aims at the knight when its tell begins, then fires on that fixed line | Reposition to arrange a return angle or interception |
| Ram hound | Winds up, charges in one direction, recovers at impact | Bait the charge into cracked masonry; parrying stops it early |

Tells have a pose, dotted aim and a bright final warning. Exposed enemies show a pale line; remaining hit points are small pips. Coils have lit/unlit shapes and physical wires to their gates. The projectile changes appearance when returned.

Enemies share the core's swept movement. Moving solids carry grounded enemies, push flying enemies and crush them against solid obstructions. Appearing phase blocks and closing plate gates wait for overlapping living enemies to leave. Attack, collision and parry state resets with the room.

## The ten rooms

| # | Room | Decision and combination |
| --- | --- | --- |
| 1 | An Opening | Learn the guard's tell, parry opening and blade response; its ward visibly links to the exit gate |
| 2 | Borrowed Wings | Meet a diving creature above the pit, rebound and spend the returned dash to reach the high far wall |
| 3 | Return to Sender | Turn a sentry's harmless-to-machinery bolt into power for the exit coil |
| 4 | Keep the Landing | Chain two creature rebounds while preserving cyan footing by avoiding a dash |
| 5 | Aim Above | Choose an interception position and redirect a shot upward to the high coil |
| 6 | The Passing Shot | Ride a zip, intercept on its return, then jump/dash and climb to the destination |
| 7 | Make a Breach | Get to the right side of the hound before its commitment; evade so its charge breaks the wall |
| 8 | Leave the Light | Leave the lantern holding its plate, freeing the blade hand for the sentry's shot |
| 9 | Two Angles | Change phase to open the high return line, climb the dividing pillar, then power the second coil |
| 10 | The Living Stair | Guard opening, moving platform, air parry, lethal pogo, preserved cyan landing and a final returned shot |

The first rooms teach individual responses. Later rooms compose enemy state with existing traversal rules. Gates test physical outcomes (powered coils or a visibly linked guard's defeat), not invisible counters proving that a prescribed sequence was followed. Alternate solutions are welcome. A killed puzzle tool can require R; resets are immediate and restore all enemies and mechanisms. Shards remain optional and use the core's existing persistence.

## Verification

`npm run verify:combat-rooms` checks all ten legal input recordings, comparing the complete simulation state on every frame between two runs. Each recording exits without deaths and exercises the room's named mechanics. It also removes key inputs to verify that those particular routes depend on their intended interactions. This is not an exhaustive proof against every possible bypass.

Focused checks cover idle safety, parry resource caps and whiffs, holding versus pressing, air trajectory, carrying restrictions, shield angles, exposed launches, lethal pogo, committed aim, projectile collision, hostile versus returned shots, bell activation, hound barriers, solid carry/push/crush, phase occupancy and complete room reset. The machine-readable receipt is `docs/evidence/combat-rooms-verification.json`; regenerate with `node scripts/verify-combat-rooms.mjs --write`.

The original precision verification also includes the ten additional recordings. Its full movement/route/bypass suite remains the regression gate. Browser review checks room selection, rendered rooms, controls, retry, recorded-route transitions and chapter completion. Automated solutions prove reachability and repeatability; **difficulty and enjoyment still need human playtesting**.

## Files

- `public/bladefall-pcore-combat.js`: enemy state machines, parry, projectiles and solid interactions.
- `public/bladefall-pcore-combat-rooms.js`: the ten maps and actor placements.
- `public/bladefall-pcore-combat-tapes.js`: real input recordings.
- `public/bladefall-pcore-combat-view.js`: enemy, attack, coil and gate presentation.
- `public/bladefall-pcore.js`: small optional combat hooks and the shared blade rebound; movement constants are unchanged.
- `public/bladefall-pcore-view.js`: keyboard/pad mapping, chapter card, questions, sound and replay integration.

All four combat assets are included in `precision.html`, the offline asset list and the local deployment build. Building the deployment folder does not publish it.
