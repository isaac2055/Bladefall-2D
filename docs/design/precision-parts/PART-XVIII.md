# Part XVIII · The Colony (levels 170–179)

Built 30 September 2026 (7.254), finished in the afternoon pass. Files:

- `public/bladefall-pcore-part-170-colony.js`: the rooms and their tapes, palette `colony`.
- `scripts/verify-precision-part-170.mjs`: routes, wrong-strategy families and hunts.
- The device is `public/bladefall-pcore-dev-watch.js` (rules in its header) and its drawer
  `bladefall-pcore-dev-watch-view.js`. No other part uses `lights:` or smoke (`S`).

The Colony's verb in the base game is stealth: the Sunguard's watch lights and the smoke of the pit fires. The
precision mirror:

- A **watch lamp** that sees any part of you (head, middle or feet) for six frames running resets the room.
  Rock blocks its light, and so does anything solid (a slide stone, a shut gate).
- **Smoke** (`S`) hides you while any part of you is in it.
- The lamps watch the knight, never the lantern (the Base Bank's *Lantern Thief*).

"Speed past the lights" is the part's spine. Six frames is a glance: a walk can never cross a beam, a dash can
cross a narrow one, and wider ones need something faster still (a super, a hyper, a fling from a long fall).
Momentum may be required from 150; each technique used here was taught in its own room earlier in Act 2
(the super at 163 *Launch*, the hyper at 165 *Under the Jetty*, the ring release at 166 *Mooring Ring*) or is a
core portal rule taught in Part V (a floor portal remembers your fall).

## Shape and difficulty

| Stage | Levels | What they do |
|---|---|---|
| Teach | 170, 171, 172 | The lamp alone (shelter and timing), smoke alone, a glance (a dash through a beam). |
| Pair | 173, 174, 175 | The lantern (*Lantern Thief*), the super, the hyper. |
| Cross | 176, 177, 178 | A portal fling, the chain in the smoke, a slide stone as shade. |
| Summit | 179 | Smoke to smoke in one look-away: a hyper under thorns, then a super over the yard. |

**Intended curve.** 170 is easier than Landing Shores' close (169 *Landfall*): one lamp, one stop. It climbs
through the pairings; 176 and 177 are the hardest reads (a fall you set up in advance, a release you time from the
ledge); 178 is a breather with a new idea (anything solid is shade); 179 asks two momentum moves back to back
inside a half-second window, a little above 169.

> 170 (easy) < 171 (easy) < 172 (easy–medium) < 173 ≈ 174 (medium) < 175 (medium–hard) ≈ 176 < 177 (hard) > 178 (medium) < 179 (hard)

Enemies: none (the lamps are the watch). Portals: 176. Older devices returning: the lantern (173), the portal
(176), the hook ring (177), the slide stone (178).

## The rooms

Counts are from `node scripts/verify-precision-part-170.mjs`. A *hunt* is an adversarial beam search that forbids
the room's answer; in rooms whose lamp swings, its state key carries the lamp's clock so it can wait for the dark.

| Level | Room | Question | Wrong answer that fails (count) |
|---|---|---|---|
| 170 | Lamplight | The lamp swings over the gaps between the tents. When is the next gap dark? | Set out at any moment and never stop, walking or hopping (242 tried, 0). |
| 171 | Pit Smoke | The lamp never looks away. Where can it not see you? | Climb the lit ledges, a route that exits with the lamp out (21 tried, 0); hunt: no way up to the road but the smoke column (none). |
| 172 | A Glance | Each beam is too wide to walk through. What crosses one before the lamp is sure? | Walk or hop through (84 tried, 0); hunt without dashes (none). |
| 173 | Lantern Thief | Carrying the lantern you cannot dash, and the beam is too wide for a walk. How do the two of you cross? | Carry it through (63, 0); dash through without it (32, 0); hunt without a throw (none). |
| 174 | Faster Than a Hop | The lamp leaves the pit dark for a moment. What crosses it in one? | Run or hop across at any moment (202, 0); hunt without a dash (none). |
| 175 | Low Road | Under a roof too low for a jump, what carries you over the pit before the lamp looks back? | Super, jump-and-dash or plain dash (252, 0); a hyper while the lamp looks (31, 0); hunt without a hyper (none). |
| 176 | Fling | The lamp's curtain is too wide to walk, dash or leap through. How do you come out of the tower faster still? | Walk or hop out of the tower portal (82, 0); dash, super or hyper through the curtain (76, 0); hunt with no speed above 250 px/s (none). |
| 177 | Let Go | The swing is hidden in the smoke. The landing is not. When do you set out? | Set out while the lamp looks at the landing (84, 0); hunt without the chain (none). |
| 178 | Shade | The lamp looks down the whole hall and never turns. What can stand between you and it? | Hop over the stone and run the hall (30, 0); hunt with the stone left where it stands (none). |
| 179 | The Watch | The lamp looks away once. Which two moves carry you from smoke to smoke before it looks back? | Leave the smoke while the lamp looks (54, 0); super, jump-and-dash or dash under the thorn roof (60, 0); hunt without a hyper (none). |

## What the sweeps caught, and the fixes (this pass)

- **170 Lamplight.** Walking straight through after a half-second wait got past all three gaps: the beam swept
  left to right at almost walking pace, so a knight could follow it. The lamp now swings slower and wider
  (period 480, cone 24°), so the walker catches the beam in the second gap whenever they set out (0 of 242,
  walking or hopping, over a whole period). The answer is one stop under the first tent (a window of about 1.4 s).
- **171 Pit Smoke.** The old family ("a full hop out of the smoky floor", 23 of 27 exited) was not a wrong answer:
  the ledges shadow most of the floor, so a hop there is never seen. It is replaced by the real temptation, the
  ledge staircase, played as a route that exits with the lamp switched off (0 of 21 with it on). The floor smoke is
  now one row, so it reads as a haze on the ground. The old hunt was vacuous (its reject covered every road to the
  exit); it now forbids only the smoke column below the corridor, marked every frame.
- **172 A Glance.** Plain jumps crossed each beam just under the roof, where the old one-tile shafts made the beam
  8 px wide. The shafts are now three tiles wide and eleven rows tall with a 4° lamp, so every beam is 15–19 px at
  every height the knight can reach: wider than a walk or a jump crosses in six frames, narrower than a dash.
- **176 Fling.** A slow exit from the wall portal, a wall jump off the tower and a dash under the ceiling lamp
  crossed the sweeping cone near its narrow tip. The lamp is now fixed in a funnel in the yard roof, a still curtain
  26–40 px wide near the portal: a dash (4 px a frame), super or hyper stays in it six frames; a fling from a fall
  of more than about two-thirds of the tower (about 400 px/s) does not. The first fix left the funnel's sides dark,
  and the hunt climbed into them; the funnel is now one lamp-width wide, all lit. The tower's perch ledge went (it
  capped the climb and did nothing else), and the tape now climbs, fires the floor end on the way down, and falls.
- **177 Let Go, 178 Shade, 179 The Watch** had no checks at all.
  - 177: set out 168–284 frames after the first input (then every 300) and the flight lands in the dark; any
    other start is seen. Hanging on the chain to wait does not work: the swing decays, so the timing is chosen
    on the ledge, and the question now says so.
  - 178 was broken: the stone filled the only way out, so it was forced and had no wrong answer. The alcove roof
    is gone (you can hop the stone) and the lamp sits on the floor with a 3° cone, so the stone's shadow is the
    only dark in the hall; hop it and run, and you are seen. The dash's rebound pops the knight above the stone but
    out of the thin cone. The exit chimney is now straight.
  - 179: the hunt found a super under the thorn roof that fell into the pit and up-dashed out. The pit is now a
    thorn floor at road level, so anything that dips is caught; only the hyper's reach clears it.

## Dropped designs

- Waiting on the chain in 177 (release on a forward swing when the lamp turns): the pumped swing decays, and the
  success window was a single frame.
- A vertical *Shade* (dash a floating stone up a shaft to seal a ceiling lamp): the lamp could not be made to light
  the whole shaft without also lighting the approach.
- A moving deck as a travelling shield in 178: walking behind it was always safe, so it asked nothing.

## What the player does and feels

- **170 Lamplight.** You watch a lamp swing, walk to the first tent, wait under it while the light crosses the
  next gap, then go. The first lesson: shelter and timing.
- **171 Pit Smoke.** The ledges look like the way up and every one is lit. You walk the smoky floor and climb the
  pillar of smoke instead, unseen the whole way.
- **172 A Glance.** Three narrow beams in a corridor. A walk is always caught; a dash through each one is a flicker
  of alarm and nothing more.
- **173 Lantern Thief.** You throw the lantern through the beam (the lamp does not care) and dash through after
  it; it lands on the plate that opens the gate.
- **174 Faster Than a Hop.** The lamp leaves the floor dark for a moment at a time; two supers cross it.
- **175 Low Road.** A roof too low to jump under, a pit too long to dash: a hyper, timed to the lamp.
- **176 Fling.** A still curtain of light across the yard. You climb the tower, fire the floor end as you let go,
  and fall through it into the yard sideways, too fast to be seen.
- **177 Let Go.** The chain swings in the smoke, hidden; the long flight to the tunnel is not. You wait on the
  ledge until the lamp swings toward the tunnel, go, and let go as it looks away.
- **178 Shade.** You dash the stone down the hall and walk in its shadow; it comes to rest against the lamp itself.
- **179 The Watch.** One look-away, half a second long: a hyper out of the smoke under the thorns, a super across
  the lit yard into the smoke on the far ledge.

## Device changes

- `bladefall-pcore-dev-watch-view.js` only: smoke is now drawn as a translucent haze with soft rising puffs,
  clipped to the patch, instead of a grid of opaque grey 4 px squares that read as rock. No rule changed;
  `node scripts/verify-precision-devices.mjs` stays green and no other part uses the device.

## Checks

`node scripts/verify-precision-part-170.mjs`: 33 passed, 0 failed, 143 s of CPU (6.5 minutes wall on a machine
with a load average near 180 while nine builders ran; about 2.5 minutes idle). Hunt budgets were
cut from 600–1200 to 150–200 beams to keep the script near three minutes; the earlier, larger hunts on 173–175
also found nothing.
