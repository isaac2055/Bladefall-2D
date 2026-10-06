# Bonus · Oren's Relay (R1–R6, 7.255)

Files: `public/bladefall-pcore-part-901-bonus-relay.js` (part `BR`), `scripts/verify-precision-part-901.mjs`,
device `public/bladefall-pcore-dev-relay.js` (with plates and held doors, the foes module's sentries, fixed portals
and the lantern). The guideline's idea: "a companion you send and hold (Oren's relay), who can stand on plates
and take a hit for you." Oren walks your path a few steps behind; the portal key makes him hold where he stands,
and holding he keeps a plate down, is a one-way step, and breaks hostile bolts on his shield. Press again and he
runs to catch you up.

**No dash in Oren's rooms** (`dashes:0` on all six). A jump and an up-dash reach 68 px; his shoulders add 11. With the
dash on, every step room either let you skip him or needed a frame-tight jump-dash off his head, and a dash chain
outran every lane of volleys. Walking pace suits a companion who walks.

| Label | Room | Question | Wrong answer that fails (count) |
|---|---|---|---|
| R1 | Hold the Door | The door is open only while someone stands on the plate. Who stands there while you go through? | Run, hop or wait at the door without telling him to hold (396, 0 exit); beam hunt with no hold (none) |
| R2 | A Leg Up | The shelf is a step higher than your jump. Where does the step come from? | Jump for the shelf from the floor (390, 0); climb or kick off the wall under the exit (198, 0); beam hunt with climbing and no hold (none) |
| R3 | Under His Shield | The volleys come from behind and outrun you down the lane. What can stand between you and the slit? | Wait for a gap, then walk or hop the lane (122, 0); answer the volley with parries or cuts every 6–12 frames (372, 0); beam hunt with no hold and parries/cuts at most one per 8 frames (none) |
| R4 | Through After You | The plate is in a sealed room on the far side of the portal, and the door is on this side. Who stays behind? | Stand on the plate yourself and race back through the portal (66, 0); hold him on this side of the portal (20, 0); hold him anywhere in the sealed room but on the plate (82, 0 that exit with him off the plate); beam hunt with no hold (none) |
| R5 | Lantern or Oren | Either of them can keep the plate down. Which one do you need on the other side? | Oren on the plate, the lantern carried through, then set down, thrown, released or jumped from (264, 0); beam hunt from there with every verb including releasing him (none); lantern on the plate but Oren never held, hunt with climbing (none) |
| R6 | Shield, Then Shoulders | He has to hold the lane behind you and then be a step in the chamber. How does he get from one to the other? | Walk or hop the lane in a gap without him (122, 0 reach the chamber alive); leave him holding the lane and jump for the shelf (240, 0); hunt with him never released (none); hunt for the chamber with no hold (none) |

Verifier: `node scripts/verify-precision-part-901.mjs` → **25 passed, 0 failed**, about 176 s. `ONLY=br3,br6` runs a subset.

## What the player does and feels

- **R1 Hold the Door.** A low hall, three plates, a portcullis. Walk to the door and stop: Oren, a few steps
  behind, is standing on the plates. One press, the door lifts, and you walk out leaving him there. The point
  is that he is somebody you can leave somewhere.
- **R2 A Leg Up.** A one-way shelf just out of reach, thorns on the wall under the exit so it can't be climbed.
  Walk under the shelf, let him catch up, hold, hop onto his head and up. It feels like being given a leg up.
- **R3 Under His Shield.** A long two-tile lane under an arrow slit in the left wall. Volleys of twenty bolts
  pour out of it every two seconds, too thick to cut or parry, faster than you walk. You start in a dip below the
  line of fire and watch one go over. Then hop out, take a few steps so he's in the lane behind you, hold, and
  walk the whole lane while the bolts burst on his shield. The room is about trust: the danger is behind you.
- **R4 Through After You.** A fixed portal pair: one end in the hall's left wall, the other in a sealed room
  upstairs with the plate. Walk in, cross the plate and stop at the far wall. He comes through the portal after
  you and ends up on the plate. Hold, walk back through the portal, and you come out heading for the open door.
- **R5 Lantern or Oren.** The lantern and Oren both hold plates; only one can be stood on. The first instinct is
  to leave Oren on the plate as in R1. Then you are past the door with a lantern you can't climb, and a released
  Oren stops at the shut door. Set the lantern down on the plate instead and take him with you.
- **R6 Shield, Then Shoulders.** R3's lane leads into a chamber with R2's shelf. Hold him in the lane and walk
  it, then drop into the chamber below the line of fire. He is still back at the slit. Press again and he runs
  the lane after you (bolts pass through him while he walks). He drops in, you walk him under the shelf, hold,
  and climb. This is the first room that needs the second press.

Difficulty: R1, R2 and R4 are gentle. R3 asks for one timing: leave the dip after a volley. The window to hold
him before the next one is about 40 frames. R5 is a small think. R6 is the longest at about 7 s and is medium.

## What the sweeps caught, and the fixes

- **Mid-air hold (device bug).** Told to hold while he was partway along one of your jumps, Oren froze in the
  air. That gave you a floating step anywhere you had jumped. Probe: jump, hold as he reached the apex, and he
  hung at y=124 while the knight stood at 149.
- **Walking through shut doors (device bug).** A released Oren walked his path straight through a held door
  that had shut after he left the plate. That would have solved R5 the wrong way (Oren on the plate, then
  release him and he follows you anyway), and it made held doors meaningless to him.
- **R3/R6, first draft (3-tile lane, sentries one tile offscreen, open slit):** the beam hunt found a run that
  stepped to the wall and **cut the sentries through the slit** (a cut reaches 15 px). After that, bunny hops in a
  3-tall lane kept the hurtbox above the bolt line between bolts. Fix: the lane is 2 tiles tall, so a hop
  can't clear the line. The slit is one tile high and three deep, too low for the knight, so the blade can't
  reach the sentries and a returned bolt dies at the room edge before reaching them.
- **R3 volleys of 6, then 14 bolts:** parries and cuts got through (27, then 14 of the family; the hunt mixed both).
  Volleys are now 20 bolts, one every 2 frames, every 120 frames, at 420 px/s. The human-rate family fails
  completely. **Honest caveat:** an unconstrained beam hunt still finds a tool-assisted chain of a parry or cut
  every 4–5 frames through a whole volley. A person can't do that, so the hunt is limited to at most one answer
  per 8 frames and says so in its label.
- **Dash (all rooms):** a ground dash chain averaged about 4 px/frame and escaped R3's lane between volleys. That
  drove the no-dash decision above.
- **R2/R5/R6 exits:** the first exits sat above a plain wall, and from the floor you could climb it or wall-kick
  off it beside the shelf. The search found the wall-kick in R6. Now the exit is a gap above a thorned wall, with a
  one-tile air gap between the shelf and the thorns.
- **R4 first draft:** the portal was on a knee-high pillar in the hall, so the return trip meant hopping over
  your own portal. It now sits in the hall's left wall, so you come back out already heading for the door.

## Device change (bladefall-pcore-dev-relay.js only)

1. Hold now means "plant at the next ground". Pressed while he is airborne, he keeps walking your path one point
   per frame and plants (presses, becomes a step, blocks bolts) where his feet first find ground. If that ground
   goes away while he holds, he walks on the same way. The `oren-hold` event fires at the moment he plants.
2. While he follows and you stand still, he finishes the jump or fall he was in rather than hovering, unless he
   is on a wall.
3. He no longer steps into anything solid he isn't already inside (a shut held door, machinery, a closed
   portal). He waits there instead.

`node scripts/verify-precision-devices.mjs` is still 50/50. No room used the device before this set.

## Dropped designs

- **A visible sentry** for the shield room: any sentry in reach dies to one parried bolt or one cut, which is
  Part IV's answer, not Oren's. The sentries now sit outside the screen behind the slit, and the stream is what
  you read.
- **A continuous stream** that starts when you move: holding first was the only answer, so it killed you before
  you had seen a bolt. Volleys with a dip to wait in show the danger first.
- **Spent footholds** as R5's friend: Oren can't reach a foothold you are standing on (he is 20 steps behind),
  and it falls the moment you leave. The pairing had no clean question.
- **Plate, then shoulders** for R6: since he no longer walks through shut doors, a door held by him can't also
  be a door he follows you through. Shield then shoulders uses the release without a door.
