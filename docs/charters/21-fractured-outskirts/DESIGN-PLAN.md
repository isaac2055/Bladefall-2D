# The Fractured Outskirts — refined 2026-09-24 (7.211.1)

Stage 21, Act Three's first echo. The owner's first playtest found the road too easy and
could not discover how to begin the boss. This pass keeps the single jump, no weapon,
forced Muster, five-room road and three-bell Mile Sentinel, and addresses that feedback.

Code: `public/bladefall-fractured-outskirts.js` and `-art.js`. Shared registration and
later Fractured regions are unchanged by this pass. Code supersedes older plans.

## The approach

- Ash Verge: narrower stepping stones and more crumbling landings. The stable stone at
  x1470 has a bronze edge and a bell overhead. Jump into the bell to lift the portcullis
  at2240; its cable lights and the bell stays rung through reload. This mandatory, safe
  interaction teaches the boss's objective without a sign or a combat tutorial modal.
- Three chain winches at1810,4550,7500 add timed low sweeps. Each winds visibly for1.05s,
  then sweeps for0.24s, with periods3.8/3.6/3.4s. The warning is harmless. Above40 units
  relative to the sweep's base is safe; standing exposed costs one Blood. Each cycle can
  hit only once. The middle chain overlaps the crumbling road, requiring timed departure
  and air control; the final chain combines with the Hollow Mile's refuges and patrols.
- The Muster Road's long floor breaks into two new crumbling steps at6360/6490.
  Recovery moves to stable ground at6620. The Hollow Mile gains steps at7550/7680;
  adjacent enemy patrols remain on actual floor. Existing raised refuges remain.
- Seventeen of the twenty authored stepping stones now crumble. The art reads the
  engine's actual `crT`/`crDur` countdown: illuminated cracks, a shortening bright edge,
  and falling chips. Previously it checked unused fields and never showed the warning.
- Every authored gap retains at least15 units of conservative single-jump reach margin.
  Narrow landings and continuous departures supply precision, rather than impossible gaps.

## The Mile Sentinel

The release chain is now at8440, just inside the yard. Pulling it starts a visible drop
at8840, followed by the existing landing pause. No modal interrupts the release.

Three bells remain reachable only by using the Sentinel's moves:

| Bell | Position | Answer |
| --- | --- | --- |
| Centre |9000,190| Bait a Hammerfall below it, leave the committed mark, jump onto the stuck grip, then into the bell. |
| East |9250,230| Bait the rush into the standing stone; jump from the stone onto the exposed shoulders, then into the bell. |
| West |8520,180| Bait another hammer below it and climb before the follow-up low chain sweep; a correctly positioned shoulder opening also works. |

Bronze riveted edges share the road's foothold vocabulary. The hammer grip is physically
connected to its buried head and drawn at its actual64-high platform. Stunned shoulder
armour is drawn exactly at its130-high,56-wide platform; the old renderer hid that
platform above a much lower crouched figure. The upright silhouette is taller so the
stun reads as a lowered back. No weapon or HP damage is required.

Unrung bells have visible lips; moths and a stronger steady glow emphasize centre, then
east, then west. Other orders still work. Bell cables connect to gate locks and remain
gold when rung. The hammer mark uses the real strike width and becomes solid after
commitment. Rushes draw their lane and illuminate the stone they will strike. The
follow-up sweep shows its full reach. Tells do not depend on sound.

| Timing | Before | Refined |
| --- | --- | --- |
| Hammer tell, by phase |1.0 /0.85 /0.75s|1.25 /1.05 /0.9s|
| Stuck grip, by phase |2.2 /1.9 /1.6s|3.1 /2.5 /2.0s|
| Rush tell, later phases |0.8 /0.7s|1.05 /0.85s|
| Stone stun |2.0s|2.8s|

Commitment remains55% through the hammer tell. The fixed phase rhythms, narrowing
windows, shockwaves, third-phase sweep and positional puzzle remain. Bells persist;
no heal is added. Death removes both temporary platforms and resets transient attack
flags. Old player-flag snapshots can lack the new road fields without throwing.
Expired bell rings are now removed rather than accumulating indefinitely.

## Verification of this pass

- 29 focused tests pass: Outskirts, player flags, recovery and rift shards. Includes
  gap reach, bell access restrictions, harmless warnings/low-sweep damage, persistent
  practice gate, stable recovery, and temporary-platform cleanup across death/reload.
- Browser: real jump input rang the practice bell and opened its gate. The new
  6240→6360→6490→bank sequence was traversed with native movement and air control,
  retaining five Blood and activating recovery at6620. Targeted landings in the
  middle chain/crumble section were also exercised; missed air-control attempts
  confirm the narrow ledges require precision rather than merely holding right.
- Browser: first chain warning caused no damage; a native jump cleared its live sweep;
  standing in the live sweep cost exactly one Blood (50→40 internal HP).
- Complete continuous Sentinel fight from an initial fixture at the release lever:
  native interaction/movement, all three bells, no damage, healing, ability grants or
  boss-state overrides during the fight. One missed shoulder landing was recovered.
  This is a scripted, paused-between-inputs verification, not a first-time human playtest.
- Actual stage reload retained the practice bell, all boss bells and open exit,
  with no temporary platforms and the jump-only, weaponless kit.
- Representative arrival, practice bell, chain warning/live sweep, hammer target/grip,
  rush lane, stunned shoulders and victory frames reviewed. No runtime errors observed.

No uninterrupted full road playthrough or co-op verification is claimed. The owner's
next playtest remains the test of discoverability and feel. Local deploy mirror rebuilt;
no commit, push or deployment. Next refinement remains Fractured Woods when requested.
