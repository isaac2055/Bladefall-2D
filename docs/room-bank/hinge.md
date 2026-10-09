# Hinged stone arms

A hinged arm is the same solid stone body in four orientations. Strike its brass hub to turn it one quarter-turn clockwise on screen. It can change from a bridge to a wall or a useful ceiling. It blocks beams and offers the normal solid surfaces for climbing and wall jumps. A turn gives no recoil, dash refill or momentum.

```js
hingeArms: [{ id: 'A', c: 12, r: 10, length: 6, dir: 'right' }]
```

Coordinates and length use 8-pixel tiles. The pivot tile is included in the length. IDs are unique within a room. Direction is `right`, `down`, `left` or `up`. There is no new map glyph.

| Direction | Solid rectangle in tiles |
| --- | --- |
| right | c, r, length, 1 |
| down | c, r, 1, length |
| left | c - length + 1, r, length, 1 |
| up | c, r - length + 1, 1, length |

Only a strike touching the hub operates the arm; striking its far end does nothing. One swing can operate one hub, even if the blade remains out. There is no cooldown beyond the ordinary strike.

The pose change is immediate. The destination rectangle must fit within the room and cannot overlap rock, another solid body, the living knight or a lantern. A blocked turn leaves the original geometry intact, gives a red ghost and `JAM` cue, and emits `hinge-jam`. The next swing can retry. The intervening swept area is not collision-tested. This is a discrete quarter-turn puzzle, not a moving rotor.

Faint outlines show the other poses; the next pose is brighter. The solid arm outline is always the actual collision body. Successful turns emit `hinge-turn`. Room retry restores the authored pose. Gravity inversion mirrors the hub and its direction; rotations remain clockwise on screen.

The hinge device registers before the beam device so a turn changes the same frame's light path. The core's post-reset `ready` hook runs the initial beam trace after every device has built its bodies, including arms and spent footholds. No temporary ray passes through an uninitialized blocker.

Clockwise-only means intermediate poses matter: an arm at row 16 with length 9 cannot point down inside a 23-row room. After `left → up → right`, it cannot return to `up` unless all intermediate poses fit. Use such a jam deliberately as a one-way commitment, or leave space for the complete cycle. A later geometry change can clear a jam; there is no reverse-turn input.

For authors: give the same arm two distinct physical jobs, preserve routes to different sides of its hub, and make the consequence of a turn visible. Invalid starting geometry throws a room/id-specific error. Leave a safe place to observe a jam. Avoid treating the hub as a generic door switch.

Targeted check: `node scripts/room-bank/hinge-check.mjs`.
