# Part XVII · Landing Shores (levels 160–169)

File: `public/bladefall-pcore-part-160-landing-shores.js` · checks: `scripts/verify-precision-part-160.mjs`
(`ONLY=p163,p165` runs a few rooms). Devices used, none edited: `-dev-water.js` (tide, floats), `-dev-hook.js`
(rings), `-dev-gaol.js` (the jailer), the moth from `bladefall-pcore-foes.js`.

The region's device is the tide: the sea between two columns rises and falls on a clock that starts with your
first input. It drowns what it covers (thorns included) and lifts floats; a float on the rise lends its speed to
a jump (the lift, capped at 130 px/s, and a few frames of grace after it stops). Act 2 opens momentum, so each
piece is taught in its own room here (super 163, moth 164, wavedash/hyper 165, ring release 166) before the
crossings (167–169).

## Rooms

| Level | Room | Question | Wrong answers that fail (tried / succeed) |
|---|---|---|---|
| 160 | Slack Water | The reef hangs down to a hand's breadth over the thorns. What does the sea do to thorns? | dive under the reef before the sea comes, dash along it (784 / 0); hunt: no way under the reef without swimming |
| 161 | Wreck Lift | The pier is out of reach from the sand and from the sea. What will the sea lift? | jump and dash from the hull at rest (second low water) (500 / 0); from the sand (600 / 0); stroke and dash up the thorned pier from the high sea (162 / 0); hunt: nothing without riding the lifted hull |
| 162 | Spring Tide | Resting at high water, the float leaves you short of the pier. When is it worth more? | jump and up-dash from the float at rest, high or low (1120 / 0); hunt: no way up without a lifted jump |
| 163 | Launch | Past the sea wall the drop is longer than a jump and a dash. How do you keep a dash's speed? | jump and dash from anywhere on the float at high water (600 / 0); early supers that spend the dash (36 / 0); hunt: no crossing without a dash's speed carried into a jump |
| 164 | Tern | The pier is higher than a stroke and a dash can take you from the water. What over the water gives you more? | stroke and dash up the pier face (90 / 0); hunt: no way up without the moth |
| 165 | Buoy | The buoy is too short to dash along. How do you leave it with speed and a dash to spare? | stand on the buoy, then super, hyper or jump and dash (1372 / 0); the same straight from the ledge (1715 / 0); hunt: no crossing without a hyper |
| 166 | Mooring Ring | The headland is past any leap from the hull. How do you get above the ring, and where do you let go? | supers, hypers, jump and dash from the hull at every height (2744 / 0); jump for the ring from the hull at rest, high or low (2016 / 0); hunt: no crossing without the chain |
| 167 | Spring Super | The ledge is higher than a super and farther than the float's leap. What if you did both at once? | supers and hypers from the float at rest (1944 / 0); lifted jump and dash (3300 / 0); hunt: none without a lifted super |
| 168 | Belled | His shield faces the sea from the very edge of the pier. How do you come down behind him? | supers, hypers, jump and dash from the float at rest, then a cut (2744 / 0); lifted jump and dash, then a cut (2400 / 0); hunt: the gate never opens without a lifted leap |
| 169 | Landfall | From the float to the headland is one flight. What keeps you up each time you would fall? | supers and hypers at rest, then the moth and ring (1458 / 0); hunts: ashore without the moth, without the ring, without a lifted super — none |

Verifier: `39 passed, 0 failed`, about 230 s of CPU (4 min wall on a loaded machine; a little over the
three-minute guide). Intended routes exit at 354, 246, 167, 227, 294, 228, 225, 183, 207 and 177 frames (earlier: up to 667). Every
tape also replays through the page (precision.html) to the exit with no deaths.

## What the player does and feels

- **160 Slack Water.** Two rock chambers joined only by a low passage over a bed of thorns. You wait on the
  ledge, the sea comes in, and you wade through the passage on the drowned thorns and climb out the far side
  before it goes out. The wait is short (about two seconds).
- **161 Wreck Lift.** You hop onto a beached hull; the sea floats it up the thorned pier face and you step off
  at the top. The pier is out of reach from the sand, the resting hull and the water.
- **162 Spring Tide.** You stand on a float in a thorn-walled cove. At rest it leaves you short; jump while it
  shoots up and you fly past the lip.
- **163 Launch.** The sea raises a plank to the top of its basin. You dash along it and jump late in the dash:
  a long fast jump, with the dash back for the far side.
- **164 Tern.** You swim out under a moth hanging over the water, stroke up, cut down on it, and use the dash
  it gives back to reach the pier.
- **165 Buoy.** A three-tile buoy in the bay. Stood on, it's too short to launch from; you jump at it and dash
  down onto it, and the slide becomes a low, very fast hyper with the dash in hand.
- **166 Mooring Ring.** The hull rises; jump as it rises and you go above the ring, fall into the chain,
  swing through, let go at the top and dash onto the headland.
- **167 Spring Super.** The float shoots up; a super off it while it's rising goes both high and far.
- **168 Belled.** A shielded conscript stands at the very edge of the pier, facing you. A lifted super carries
  you over his helm; you land behind him and cut before he turns. The gate opens.
- **169 Landfall.** One flight: lifted super to the moth, cut down for the dash, dash to the ring, swing,
  let go onto the headland.

Difficulty: 160–162 are gentle tide rooms (easier than the Thunder Cliffs' close); 163–166 each teach one
momentum tech with a single demanding input (late super, wavedash, fall into the ring); 167–168 cross the lift
with the super; 169 is the peak, four beats in about three seconds of flight.

## What the sweeps caught, and the fixes

- **160** A hyper and a dash cleared the old open thorn bed. Rebuilt as two chambers under a reef that hangs
  to two tiles over the thorns: nothing flies a passage that low and that long.
- **161** The failing family included the hull already lifting (the sea's answer). Narrowed honestly to the
  hull at rest (second low water); the spawn moved beside the hull so a short tide works. The hunt then found a
  climb up the rising hull's side; the probe now marks riding a lifted float by landing and jump events too,
  since a landing and a buffered jump can share one frame.
- **163** Jump-and-dash chains via the float, and a dash run off the float's edge into a coyote jump. The
  float is now the basin's only ground (spawn on it) and the gap is set between jump-and-dash (≈115 px) and a
  late super with its dash kept (≈160). The dash-off-the-edge jump keeps the dash's speed, so it answers the
  question; the hunt forbids any jump carrying 150 px/s or more.
- **165** Under the Jetty's deck could not separate the hyper from a tap-jump super that keeps its dash: in
  this engine the two differ only by speed (325 vs 260 px/s), a one-tile window. Rebuilt as **Buoy**: a
  three-tile float where no ground dash lasts long enough to give the dash back; arriving mid-dash (a wavedash,
  or a dash off the ledge that lands on the buoy — kept as the same idea) gives it back at once. A swim across
  was also found (the landing sat just above high water): the sea now ends at a thorn-capped post and a dry
  thorn pit guards the pier.
- **166** Supers and jump-and-dash reached the old ledge; a swimmer stroked and dashed up the headland. The
  headland is now 72 px over high water and far from the hull; only falling into the ring gives a big enough
  swing. Low water was drowning the thorn bed (low was the thorn row); fixed to the row below.
- **167 / 168** "At rest" families were catching the rise; prefixes are now computed from each room's tide.
  168's sea wall top gave a free runway (thorns on it now); the pier edge moved out a tile so a lifted jump and
  dash can't reach his helm. A lifted jump plus a climb up his shield still works — kept: it is the sea's lift
  that gets you over him, and the hunt forbids any lifted leap. (A wall jump off a lifted float's side also
  counts as riding it, for 161's hunt: the hull did the lifting.)
- **169** Rebuilt around measured reaches: the moth sits beyond anything unlifted, the ring beyond anything
  with its dash spent, the headland beyond the moth's bounce and dash.
- **All** Tide holds shortened (240–300 → 30–130 frames). Tapes start with 16 frames of up, so a replay that
  loses its first frames to a wipe keeps its timing.

## Dropped designs

- Under the Jetty (hyper under a low deck): see 165.
- A reversed tide (sea starts high): the water module places floats at their drawn position, so a float would
  snap up on the first input. Would need a module change (float starts at `surface - h`) — not made.
- A 166 with the ring above the hull and a rest-high swing: the chain's pump alone never built a big enough
  swing (1% of timings).
