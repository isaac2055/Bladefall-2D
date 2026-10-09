# Directional crystals

Status: implemented and saved. Focused rule checks pass, including an exact 210-frame comparison with the ordinary crystal on a legal approach. The four directions use clear pixel arrows; root is checking their integration in the actual Fractured rooms.

A directional crystal refills the knight only while moving along its arrow. A jump, fall, run, fling or dash can collect it. Touching it from the wrong direction does nothing and leaves it available for a second approach. There is no extra button or timed gate.

```js
vectorRefills: [
  { c: 20, r: 10, dir: 'up' },
  { c: 27, r: 8, dir: 'left' }
]
```

Coordinates use eight-pixel tiles. The four directions are `up`, `down`, `left`, and `right`. Put `.` in the map at this location, not an ordinary `o` crystal. Collection uses the ordinary crystal's 8×8 overlap and the knight's velocity after movement: the component along the marked arrow must exceed 4 pixels/second. A diagonal approach works if its component is positive enough. Still, perpendicular and reverse motion do not collect it. Do not place the crystal against a wall that cancels the required velocity before contact.

A legal approach restores all dash charges and stamina with the ordinary crystal's two-frame hit stop and normal recharge time. It is consumed only if a dash is missing or stamina is below the ordinary crystal's tired threshold. Optional `once:true` makes it stay spent until a room retry; the default recharges. Retry resets it, and gravity prisms mirror its directional rule along with its body. Events include normal `refill` and the distinct `vector-refill` marker for route checks. Use `newMechanics:["vector-refill"]` in room metadata.

The arrow marks the direction of motion, not the side to touch. Put it where the route can visibly bend through it: a descending collection before a rising exit, an upward pass that denies a low shortcut, or a leftward turnaround whose refill funds the return. An arrow that merely agrees with every possible approach adds little decision value.

Validation: `node scripts/room-bank/vector-refill-check.mjs` checks legal-approach parity, the four directions, wrong and perpendicular approaches, reapproach after rejection, the speed threshold, normal-motion collection, full/tired resource rules, recharge, once-only reset, gravity reflection, and opt-in behavior. The four adapted Fractured rooms retain their original completion tapes.
