# Step relay

Status: implemented and saved. Focused physics checks pass; the actual game renderer was inspected in a local Chrome run with no page errors. Room difficulty and fun still need human playtesting.

Land on a relay to rearrange all platforms bearing the same letter. Stay aboard and it carries you; jump again to reverse the group on your next landing. This preserves your dash for a later gap. Walking onto a relay from an adjacent floor, grabbing its side, and dashing into its side do not switch it.

```js
stepRelays: [{
  id: 'A',
  duration: 36, // simulation frames for a full journey; default 36, minimum 6
  platforms: [
    { c: 10, r: 17, w: 4, h: 1, to: [0, -6] },
    { c: 23, r: 11, w: 4, h: 1, to: [0, 6] }
  ]
}]
```

Coordinates and `to` displacement are in eight-pixel tiles, as with moving decks. `h` defaults to one tile. Each array entry is an independent group; letters identify it visually. A landing during travel reverses the journey without teleporting. A room retry restores every group to its first position. The mechanic uses the existing moving-solid collision and lift-momentum rules, and supports the gravity-prism mirror hook.

Keep each platform's swept path clear of rock and other platforms, and allow at least eleven pixels above a carried knight. Moving solids can crush the knight against a ceiling, so an intentional escape must read clearly. Paired platforms should not pass through one another; use separate tracks. A group can contain one platform for a simple introduction or more for a landing-order puzzle.

Room ideas: choose which foothold is sacrificed to raise the exit; leave the lift early and spend retained velocity on a later dash; reverse a shuttle from its far end; land on a low relay to bring a distant bridge into position while preserving dash; chain independent A/B relays so their last landing order changes the route.

Validation: `node scripts/room-bank/step-relay-check.mjs` checks a physical fall and landing, linked and independent groups, uninterrupted carriage, a second landing, midflight reversal, inherited lift speed, preserved dash, walking and side-contact exclusions, deterministic retry, two gravity flips, and opt-in state. Browser inspection confirmed letters, endpoint outlines, travel rails, destination cues, and platform motion in the existing Precision Core renderer.
