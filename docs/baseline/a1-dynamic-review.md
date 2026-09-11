# A1 targeted dynamic review — 2026-07-31

## Evidence boundary

Eight targeted probes were captured against Bladefall `7.8.0` at the
byte-verified localhost `http://127.0.0.1:8372/`. The in-app browser-control
bridge was unavailable, so the same version-verified local Chromium fallback
used for the entrance baseline produced these recordings.

Every probe discloses its setup. Six begin with the player positioned near the
mechanic, one begins at The Inversion's ordinary stage start, and the checkpoint
probe includes an explicitly synthetic out-of-bounds failure. The successful
portal speed-gate probe also injects the documented entry speed. These clips
show system behavior; they do not prove natural route access or full puzzle
resolution.

## Results

| Probe | Setup classification | Result |
| --- | --- | --- |
| Outskirts portal, low speed | Positioned on authored slate; keyboard portal placement and walking | Mouth placement observed; walking back over it did not satisfy transit |
| Outskirts portal, speed gate | Positioned on slate; keyboard placement; disclosed 950-speed drop | Fixed anchor transit observed through its authored 800-speed gate |
| Updrafts water/current | Positioned in the water volume; keyboard movement | 50.3% maximum submersion observed; the run later rewound to a checkpoint |
| Updrafts lift | Positioned inside the authored lift | 220 px of lift observed; the run later rewound to a checkpoint |
| Ruined Keep follower | Positioned within greeting range; keyboard commands | Follow, hold, and resumed follow states observed |
| Inversion gravity | Ordinary stage start; keyboard only | Flipped and righted gravity states observed |
| Deep Line signal/collapse | Positioned before first switch; keyboard cart control | High route banked one signal and collapsing rails activated |
| Gilded Vault checkpoint | Positioned before checkpoint; keyboard crossing; synthetic OOB | Checkpoint activation and rewind observed with an 8 HP penalty |

## Design findings

1. The Outskirts anchor has a real minimum-speed rule. The low-speed clip shows
   that simply returning to the floor mouth is insufficient; the separate
   high-speed clip proves the transport path. A natural route recording must
   still demonstrate how the level teaches and supplies that speed.
2. Both Updrafts probes made contact with their systems and later triggered
   checkpoint rewinds. The recordings do not establish that fluid or lift
   directly caused the failures, but they do show that these isolated contacts
   do not end in a stable landing under the chosen approach. Natural entry,
   containment, shores, and recovery need human review.
3. The Ruined Keep traveler accepted both commands, but the positioned greeting
   point had no detected support and the player subsequently rewound. That room
   needs a natural-route footing and companion-path check before signoff.
4. The Inversion's core flip input works cleanly from the actual entrance. It
   still needs both openings traversed without setup positioning.
5. The Deep Line successfully connected lean, route choice, signal memory, and
   collapsing rail in one continuous keyboard-controlled sequence after the
   approach setup. This is the strongest integrated dynamic result in this set.
6. The Gilded Vault checkpoint correctly rewound a synthetic failure and
   applied the expected penalty. Natural furnace and precision-platforming
   failures remain unrecorded.

## Remaining A1 work

- Natural setup, failure, recovery, and successful resolution for every dynamic
  room.
- All boss phases, one death/restart, and one win per boss.
- Fresh intended, returning revisit, optional/collectible, credible speedrun,
  and two-player route reviews.

A1 remains open.
