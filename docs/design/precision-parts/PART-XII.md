# Part XII · Inversion (levels 115–122)

Built 30 September 2026 (7.254). Files:

- `public/bladefall-pcore-part-115-inversion.js`: the rooms and their tapes, palette `inversion`.
- `scripts/verify-precision-part-115.mjs`: routes, wrong-strategy families and hunts. `node scripts/verify-precision-part-115.mjs p118` checks one room.
- The device is `public/bladefall-pcore-dev-gravity.js` and its view. Unchanged this pass.

Inversion's base-game verb is the gravity flip. The precision mirror is the **gravity prism** (`Q`): dash through it and the room turns over. The roof becomes the floor, thorns that hung overhead are now underfoot, and everything that falls (the knight, the lantern) falls the other way. Up and down on the controls stay up and down on the screen. The dash that turns the room over is spent turning it. After the teaching rooms, each room reads one old device upside down.

## Shape and difficulty

| Stage | Levels | What they do |
|---|---|---|
| Teach | 115, 116 | The prism alone, then the prism back (glass). |
| Old devices upside down | 117–121 | Pods, the stone, the lantern, the floor portal, machinery. One each. |
| Summit | 122 | Four turns in one room. Each turn's dash comes from a different place. |

**Intended curve:** 115 (easy, easier than the Foundry's close) < 116 < 117 ≈ 118 (medium) < 119 ≈ 120 (medium) < 121 (medium–hard) < 122 (hard, a little above the Foundry's peak and still under *Third Summit*). Momentum is never required. The hunts include supers and hypers so that momentum cannot skip a question either. No enemies. The draft 122 had a moth, which was cut with the redesign (see below). A portal appears in 120.

## The rooms

The counts come from `node scripts/verify-precision-part-115.mjs`. A "hunt" is an adversarial beam search (width 250) over walks, jumps, dashes, grabs, supers and hypers (plus strikes or throws where they matter). It forbids the room's answer and passes when it finds no way out.

| Level | Room | Question | What fails (checked) |
|---|---|---|---|
| 115 | The Other Floor | The floor ends in thorns long before the door. Where else is there a floor? | Run, jump and dash over the thorns (132 tapes, 0 cross). Hunt with no flip: none. |
| 116 | Falling Up | The flip spends your dash and the roof is thorns. Where do you get the dash that turns you back? | Flip, then reach for the prism back without the glass (297, 0). Hunt that never touches the glass: none. Hunt with no flip: none. |
| 117 | Pogo Up | The roof is thorns and the pods hang just under it. Which way do you cut to bounce off them? | Cut down on screen, toward your head (28, 0). Hunt that never cuts the second pod: none. Hunt with no flip: none. |
| 118 | Plumb Up | Upside down, the pit is in the roof and the stone hangs in the shaft above it. Which way must the stone go to become a floor? | Leave the stone where it hangs and jump the pit (132, 0). Hunt that never moves the stone: none. Hunt with no flip: none. |
| 119 | The Light Falls | The plate lies at the bottom of a shaft that opens only toward the roof. How does the light get down it? | Throw the lantern at the shaft from the floor (198, 0). Set it down and turn the room over twice (110, 0). Hunt that never picks it up: none. Hunt with no flip: none. |
| 120 | The Long Fall | The orange end throws you only as hard as you fell, and portal stone is only in the roof. Where does the longest fall start? | Dash or jump into a roof portal right way up (81, 0). Turn over, land on the roof, then step into the portal (66, 0). Hunt with no portal: none. |
| 121 | Count the Prism | The roof you must land on is cyan, and the prism is a dash. How many times will the machinery turn before your feet touch it? | Straight through the prism with no spare turn (528, 0 stand on the cyan). Flip back without the bell (48, 0). Hunt that never stands on the cyan: none. Hunt with no flip: none. |
| 122 | Inside Out | Four turns, thorns above and below, and one dash at a time. Where does each dash come from, and which way do you cut? | Cut the pod toward your head (44, 0). No cut, straight for the last prism (63, 0). Hunt that never touches the glass: none. Hunt that never cuts the pod: none. Hunt with fewer than four turns: none. |

### What the player does and feels

- **115 The Other Floor.** A run at the thorns fails. You dash through the violet crystal, the room turns over and you land on the roof. You walk it, hop three hanging thorns and drop out of the door. It is the first "oh" of the region.
- **116 Falling Up.** Turning the room over spent the dash, and the roof is thorns. You fall past the glass on the way up, take it, and dash through the second prism to land right way up on the far side.
- **117 Pogo Up.** Upside down, the pods hang under the thorn roof. Your first instinct cuts down on screen, which throws you into the roof. Cutting toward your feet (up on screen) bounces you back down and gives the dash back. It reads the Foundry's pogo from the ceiling.
- **118 Plumb Up.** You fall up the shaft and land under a block of stone that fills it wall to wall. You are boxed in. The shaft walls hide the corridor, and the roof pit is too far below the stone to jump. Dash toward your feet, which is up on screen. The stone slides up to the thorns and stops flush against them, and you fall after it onto a new floor level with the corridor. One jump and dash crosses what is left of the pit.
- **119 The Light Falls.** The lantern is carried up by the flip, dropped on the roof, and falls "up" into a shaft that opens only toward the roof, onto the plate. You never throw it.
- **120 The Long Fall.** You turn over on the floor and fall the whole height of the room into a portal you opened in the roof. The orange end on the pillar throws you sideways at full speed, under the hanging pillar, to the far strip of roof. Any shorter fall drops short into the thorns.
- **121 Count the Prism.** The prism's dash turns the cyan machinery like any other dash. You count it, spend one more dash turn, and the bell turns it back where you need it.
- **122 Inside Out.** The summit. Four prisms and no floor between them. The first dash comes from the ground, and you land on the roof. The second comes from the roof as you dash down and right off its end. The glass hangs on the fall. Upside down again, you cut the pod toward your feet for the last dash, and the fourth prism sets you right way up over the last strip of floor. Each turn spends the dash, and each dash comes from somewhere new.

## What the sweeps caught this pass, and the fixes

- **118 Plumb Up: jump the pit without the stone** (3 of 132 tapes, and the "never move the stone" hunt found a route). The stone was three tiles wide in a six-wide shaft. You fell past it or stood under it, and walking off its end gave a long upward fall that easily carried across the roof pit. Falling from where the stone hangs was always better than standing on it at the top, so the question answered itself the wrong way. **Fix:** the stone now fills the shaft wall to wall (six tiles). Under it you are walled in, and the only way up is to send the stone up. The family now fails 132 of 132, and the hunt finds nothing.
- **120 The Long Fall: across without the portal.** The hunt flipped at the start, stood on the roof, and used a super and a wall jump to dip under the hanging pillar and fall up onto the far roof strip. **Fix:** the pillar hangs one tile lower, and the far roof thorns run three tiles further (the safe strip is now cols 34–38). The portal throw still clears the pillar by 12 px and lands at col 35. A hunt of width 300 over the full action set, momentum included, finds nothing.
- **122 Inside Out had no tape.** The draft's four-prism room could not be crossed, and its moth sat inside a pillar. **Redesign:** a clean room with a roof ledge, four prisms, one glass and one pod. Each prism sits where the previous turn's fall carries you. The tape tolerates about ±3 frames at each input (checked by shifting each step).
- The hunts' beam width went from 1500 (2000 for 117) to 250 to keep the part fast. At 250 the full script is 35 checks in about 460 s of CPU (25 min wall on a machine at load ~150 during this pass). That is still over the three-minute target on a quiet machine; the next cut would be 150. A width of 250 still found both of the draft's real skips (118, and 120 at 300).

## Dropped designs

- The draft 122's moth: enemies are not needed to ask Inversion's question. The pod carries the "which way do you cut" half of the summit.
- A 118 where the stone was three tiles wide. It answered its own question (see above).
