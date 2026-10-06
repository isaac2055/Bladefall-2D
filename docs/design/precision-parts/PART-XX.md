# Part XX · Sunspire (levels 190–199)

Built 30 September 2026 (7.254). Files:

- `public/bladefall-pcore-part-190-sunspire.js`: rooms and tapes, palette `sunspire`.
- `scripts/verify-precision-part-190.mjs`: routes, wrong-strategy families, hunts (`ONLY=p193,p196` runs a subset).
- Device: `public/bladefall-pcore-dev-beam.js` (owned by the Palace Path builder) with the portals module. Not changed by this part.

The Sunspire's verb is light through portals: a beam that reaches an open end comes out of the other, turned the way the knight would be. Tally stones sit where only light can reach. Then everything before: mirrors, louvres, the lantern, the engine, the hook, bolts, momentum.

## Shape and difficulty

> 190 (easy) < 191 < 192 ≈ 193 < 194 < 195 < 196 (medium–hard) > 197 ≈ 198 (medium) < 199 (summit, two rooms)

- 190 is one well-placed shot, easier than Palace Path's 189.
- 196 is a small in-region peak (two rings, a shot mid-swing). 197–198 dip back to puzzle rooms before the summit.
- 199 is two rooms, each a checkpoint. Each asks one question under real execution: dash parity under a roof of light (a), and a fling on a louvre beat through a door the light also uses, into a ring swing (b). Momentum is required in 195, 196, 199a and 199b (portal fling, hook release, hyper/super), all taught in Parts XVI–XIX.
- Enemies: 198 (husk, spitter). Portals in every room but 199a.

## The rooms

Counts from `node scripts/verify-precision-part-190.mjs` (38 passed, 0 failed; about 190 s CPU). "Hunt" is an adversarial beam search that forbids the intended device; its state key includes your portal end, the engine phase, the glass, the louvre beat, the lantern, the ring and bolts.

| Level | Room | Question | What fails (checked) |
|---|---|---|---|
| 190 | Sun Through Stone | The light runs overhead into portal stone, and the fixed end hangs in the roof of a sealed room. Where can you stand to open your end in the light's way? | Fire straight at the wall from the floor or a jump (105, 0). |
| 191 | Light It, Then Let Go | Once the stone is lit, how do you get the road back? | Walk, hop or dash through the column of light (48, 0). Hunt past the column without moving your end: none. |
| 192 | Both Ends | Where must you be standing when you open the second end? | Open the near face of the low pillar second (31, 0 light the stone and live). Stand in the pocket and open its end last (21, 0). |
| 193 | Glass in the Dark | What do you do while it is still dark? | Open the light first, then go and turn the glass (22, 0). Hunt that never strikes the glass: none. |
| 194 | Lantern Post | How does the shade get there before you do? | Carry the lantern down the shaft and set it down or throw it (33, 0). Drop through your own door without it (11, 0). Hunt where the lantern never goes through a door: none. |
| 195 | The Light's Door | When is the door yours? | Go through while the louvre is open (67, 0). Drop in from the pillar without climbing higher (31, 0). Hunt with no door: none. |
| 196 | Ring Light | Only the far ring sees the panel on the landing's roof. When in the swing do you fire, and when do you let go? | Shoot from the ledge or a jump off it (54, 0). Shoot from the first ring (63, 0). Hunt to the landing without a ring: none (also none at beam 2000, depth 60). |
| 197 | Noon Engine | What does your next dash do to the island, to the light, and to your line? | Dash first, then shoot from the air (88, 0). Hunt with any shot fired off the cyan island: none. |
| 198 | Two Deliveries | The glass turns light but not bolts. Which goes first? | Keep the low end and let bolts do everything (11, 0). Take the light first (11, 0). |
| 199a | The Sun Court | Only a dash carries you under the roof of light, and every dash turns the engine. Which colour must it show as you pass each shaft? | Hyper without setting the engine (26, 0). Set it twice (16, 0). A short super without setting it (26, 0). Hunt with no dash: none. |
| 199b | The Hall of Hours | The light takes your door on the louvre's beat and lies across the hall. When do you go, and where are you when it follows? | Take the door while the louvre is open (71, 0). Take it as the shut beat runs out (71, 0). Hunt onto the landing without the ring (light made harmless): none. |

## What the sweeps caught, and the fixes

- **195**: the wall beside the shaft stopped at row 8, so a climb onto it and a super or hyper could clear the thorns without the door. The wall now reaches the roof.
- **196** (rebuilt twice): the draft let a jump-and-up-dash mid-air shot plus a hyper and dash reach the far floor with no ring (found twice by the full-room hunt). The landing is now a raised tunnel with thorns down its face, the start ledge is lower, and a second ring does the carrying. The first rebuild still let a hyper plus up-right dash land on the lip at exactly the floor pixel; the tunnel floor went up a row. Moving the panel and glass right next to each other took the light out of the swing and widened the fire-and-let-go window from about 4 frames to 5 × 10.
- **197**: the dash off the island hit the amber bridge's side; the bridge now starts two tiles from the island.
- **198**: a bolt through your door lights stones too, so two bolts solved the room without light. The slot now ends at a glass that turns the light down to a stone in the floor; bolts fly straight past into rock. The unreachable space above the slot was filled in.
- **199a**: the hunt found a super, a mid-air dash to reset the engine, then another super. It keeps the room's rule (the colour as you pass each shaft), so the question was reworded to name the rule and the hunt now forbids dashing at all.
- **199b** (redrawn): in the draft the louvre's light went straight through the well to the stone, so the ring and the high window did nothing. Now the stone is lit only by light following you through your door, the landing is above its line behind a thorned face, and the shut beat is 100 frames (it was 70; the door-to-landing flight takes about 65, which left a 5-frame window).
- 199 is two rooms, not three as the draft header said.

## Dropped designs

- 199b's high-window panel reached from the ring (the draft): the floor door lit the stone on its own, and the well floor can't be seen from the ring past the wall.
- 196 with one ring: the fire-and-release window was 3–4 frames.
- 196's ledge sightline pillar: it gave a perch on its far face that saw the panel.

## What the player does and feels

- **190**: stands under the light, fires at the pale stone, and the sealed room across the hall lights from inside. A small "oh".
- **191**: the same shot, then the road is cut by a pillar of light. Firing your end at the low stone lets go of it.
- **192**: both ends are yours. The obvious shot at the pillar floods the floor at your feet; the pocket end fired from inside burns you. Open the pocket first, then step back and close the circuit from the road.
- **193**: walk to the glass in the dark, turn it, go back and let the light in. Then let go of it to cross.
- **194**: lob the lantern into your own door and watch it land, far below, in front of the window. The light stops at it.
- **195**: climb, jump, fire under yourself, and fall into your end on the shut beat. You come out flying.
- **196**: catch a ring, jump to the next, fire up at the roof as the swing peaks, let go into the tunnel. It flows once you see it.
- **197**: one shot from the island while the line is clear; the dash pulls the island away, drops the light onto the stone and puts a bridge under you.
- **198**: jump a bolt so it goes into your door and cracks the husk; then take the light.
- **199a**: dash once in the start room before you run; each dash-jump under the roof has to leave the right colour behind it.
- **199b**: wait on the pillar for the louvre to shut, dive through, catch the ring, swing up and dash onto the landing. On the next open beat the light comes through the door behind you and lights the stone below.

## Unsure

- The page replay in `pcore-shot` (with `@frames`) shows a death in 199a: the louvre's clock runs during the page's half-second load before the tape starts. In node the tapes run clean. Worth a look when checking the pause-menu replay for louvre rooms.
- 196 is harder than 197–198. That's deliberate but worth a play.
