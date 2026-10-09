# Timing patrols (batch 04)

The opt-in `sweepers` device adds moving thorn cores on visible, deterministic paths. It is intended for readable watch/commit/rest sequences, not for damage, combat, or invisible footing. Existing rooms with no `sweepers` array are unchanged.

```js
sweepers: [
  { id: 'crossing', path: [[12, 4], [12, 18]], period: 180, phase: 30, radius: 4 },
  { id: 'circuit', path: [[24, 12], [29, 12], [29, 18], [24, 18]],
    period: 220, phase: 0, loop: true }
]
```

- Points are **tile centers**: `[c, r]` becomes `(c*8+4, r*8+4)` pixels. Fractional coordinates are supported.
- `period` is the complete out-and-back duration in simulation frames, or one closed circuit for `loop:true`. Default: 180 frames. Motion has constant speed along the total path length; no easing or RNG.
- `phase` advances the initial position by this many frames. Default: zero. Input wakes the clock, including a portal/echo input. Death, restart, and room load restore the original phase. The common hit-stop pauses the patrol with the rest of the simulation.
- `radius` is the lethal circular core, default 4 pixels. The bright visible thorns extend approximately two pixels beyond it. Dotted routes and endpoint squares are always drawn; the core has a direction stroke while moving.
- Sweepers are not solid. They cannot hold the knight, stop a beam, press a plate, damage cargo, be parried, be destroyed, or be dashed through safely. Death cause: `sweeper`.
- Relative swept collision covers fast player and hazard motion between frames. Portal/echo travel checks the arrival rather than the unoccupied line between positions. Gravity inversion mirrors the path and its current position, then reset restores the original.

Keep paths away from the room's deliberate rest positions. A player must be able to observe the next segment and distinguish the direction of travel before committing. A return stroke can be the hazard that matters, even when the outbound stroke is already clear. Use forgiving phase windows rather than single-frame departures. Maddy Thorson's [Celeste & Forgiveness](https://www.maddymakesgames.com/articles/celeste_and_forgiveness/index.html) is the design reference for favoring player intent, readable opportunities, and retained platform lift.

## Four base examples

| Room | Timing problem | Safe observations |
| --- | --- | --- |
| B21 Passing Places | Follow a departing horizontal patrol, dip beneath its return, then climb out behind it. | Recessed pockets; broad central bay. |
| B22 Wait Below the Lip | A crossing must leave time for the landing, not only the dash through open air. | Alternating outer ledge ends. |
| B23 Miss One Ferry | The first boat does not guarantee a safe second connection. | Starting dock and central pier. |
| B24 Carry the Quiet Moment | A slow cargo fall meets a patrol later than an ordinary fall; carrying removes the emergency dash. | Starting shelf and middle pier. |

The saved `bank.timing` metadata describes each observable cue, action, and safe rest. Intended tapes prove a clean completion; focused negative tapes reproduce an immediate-departure or no-wait failure. These checks do not establish that every alternative route is impossible, and successful alternatives retaining the timing problem are welcome.

Focused smoke: `node scripts/room-bank/sweeper-check.mjs` covers opt-in behavior, reset, initial input, loop/path positions, non-solid collision, fast crossings, teleport discontinuities, and gravity. Room routes and timing regressions run through the normal bank checker.
