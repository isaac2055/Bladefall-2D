# Part XIX · Palace Path (levels 180–189)

Files: `public/bladefall-pcore-part-180-palace-path.js` (rooms and tapes), `scripts/verify-precision-part-180.mjs`
(routes, wrong answers, hunts). Device: `public/bladefall-pcore-dev-beam.js` (+ `-view`): sun windows
(`beams:[{c,r,dir}]`), mirrors `/ \`, louvres `X` (`shutters:[{open,shut,offset}]`). The core's machinery `A B`
is the Base Bank's *Switchback Engine*. **No device module was changed.**

**The region's one new thing** is light: a beam from a sun window burns, and you live in its shade. Everything
else in the part is a way of making shade: a louvre on a beat (180), a struck mirror (181), the lantern carried
(183) or thrown (186), machinery every dash flips (184), a turned shellback (188). Old friends: the tally stone
(182), the lantern (183, 186), the shellback (188), the hyper (187, taught again with a hint; required from here).

## The levels

| Level | Room | The question | The wrong answer that fails (machine-checked) |
|---|---|---|---|
| 180 | Sun Window | Three lines of sun and three louvres, each on its own beat: when do you cross each one? | Set out at any moment (0–238 frames) and walk or hop on at one pace (360 tapes, 0 exit). |
| 181 | Turn the Glass | The mirror throws the light down across the road. Which way will it throw it once struck? | Walk, hop, jump, dash or jump-dash through the light (105, 0). No hunt: unturned, the light closes the road floor to wall. |
| 182 | Light It, Then Turn It Back | Only the light can reach the stone, and the light that reaches it crosses the road. What do you do once it is lit? | Light it and go straight on under it (44, 0); leave the stone dark and try the gate (33, 0). |
| 183 | Carried Shade | Three lines of sun, no louvres, and thorns under the middle one. What can you hold between you and the sun? | Go without the lantern (48, 0); throw it into the first light and walk after it (26, 0). |
| 184 | Switchback Engine | The dash that carries you over the thorns takes the shade off them. When in the jump do you spend it? | Jump without a dash (20, 0); dash from the ground or early in the jump (70, 0). Hunt: no crossing without a dash that starts past the middle light. |
| 185 | Beat and Glass | The louvre gives you the floor for one beat, and the only step off the floor lies under the mirror's light. What must you get done before the louvre opens? | Drop while the louvre is open (16, 0); cross in the dark and leave the glass alone (42, 0). Hunt (beat-aware): no way out without turning the glass. |
| 186 | Throw the Shade | A line of sun on the walk and another along the floor of the passage below, and one lantern. Which light do you carry it through, and where do you leave it? | Carry it down into the passage (24, 0); set it down on the walk and go on without it (11, 0). Hunt: no way along the passage unless the lantern is down in its light. |
| 187 | Low Light | A bed of thorns too long to jump, under a roof of light too low to jump into. What carries you across without lifting your head? | Jump, super, jump-and-dash or plain dash from any run-up (72, 0). Hunt: no crossing without a hyper. |
| 188 | Belly Shade | The floor is lit from the window to the kerb, and only a turned shellback throws a shadow on it. Which side of it do you come down on? | Go down without turning it, walking or jumping, any moment (82, 0); pogo on its back instead (123, 0). Hunt: no way to the kerb without a flip. |
| 189 | The Engine Road | Every dash flips the engine, and the pit is too long for anything but a dash. Where do you spend the dashes that are only for the engine? | Straight into a hyper or super with no spare flip (62, 0); spare flip and hyper but nothing after the pit (16, 0). Hunt: no crossing on fewer than three flips. |
| 189 | The Sun Gate | Turn the glass and the light leaves the road, and lies over the thorns instead. How do you cross under it? | Once turned: jump, super or jump-and-dash (63, 0). Hunt: no crossing without a hyper or a super. |

Verifier: `36 passed, 0 failed`, about 176 s of CPU (8 min wall on a machine at load 75 with the other builders).
Each intended tape also replays to the exit with no deaths through `precision.html` (retry the room, step past
the wipe, then play the tape). Hints appear only where a thing is introduced: 180 (sun, louvre), 181 (mirror),
182 (stone in light), 183 (lantern as shade), 184 (engine), 186 (lantern landing in light), 187 (hyper), 188
(shellback as shade). 185 and 189 have none.

## What the sweeps caught, and the fix

This pass started from drafts with no tapes; most rooms were redrawn.

- **All rooms**: roofs lowered so each room is the band the knight actually uses (the drafts had 15 empty rows).
- **181**: the draft's light came from the left along head height, so every jump to reach the glass burned and
  the strike window was 6 px. The light now comes from the right: the side you approach from is dark, and you
  jump and strike freely.
- **182**: the draft's stone sat in a shaft under a plank the knight could drop through and touch. The stone is
  now under a single thorn in the road: light passes a thorn, a knight does not.
- **184**: the draft needed two dashes and a jump that could not clear its pit. Redrawn: one pit, the light over
  its near half shaded by the machinery, the far light shaded by the other colour. Found in authoring and kept:
  a pre-flip dash followed by a hyper (two early dashes cancel) still ends with the dash past the light.
- **185**: the hunt found a hyper off the ledge onto a one-tile step that sat 1 px under the mirror's light. The
  step is now two tiles; standing on it puts your head in the light until the glass is turned.
- **186**: a set-down on the walk that slid into the shaft counted as a wrong answer in the first family; it is
  the right answer (the lantern ends in the passage light). The family now only sets it down before the shaft.
- **188**: the draft's plank was never used by any route and the shellback killed you on it. Plank cut; the
  question is now where you land relative to the turned shell.
- **189a**: redrawn as a three-flip engine road. The hunt found a jump plus an up-right air dash over the pit
  instead of a hyper: it keeps the same flip schedule, so it answers the question and is kept; the check was
  narrowed honestly from "needs a hyper" to "needs three flips".
- **189b**: the hunt found a tapped super (head stays low) carried on by an air dash. It keeps the head down,
  which is the question, so it is kept; the check is "needs a hyper or a super".

## Dropped designs

- 189a's opening louvre (a second question in a room that already has one).
- 188's plank (purposeless once the shell had to be turned in the air).
- Hunts in 180–183 and 189b's glass: in each the light stands wall to floor across the road, so the families
  are the whole question; each such hunt cost 30–160 s for nothing.

## What the player does and feels

- **180 Sun Window.** Three shafts of sun down a hall, each under a slatted louvre with pips counting down.
  You walk, stop in the dark between shafts, watch the pips, and go. The first minute teaches that light is a wall.
- **181 Turn the Glass.** The light comes in along the ceiling and a silvered slant throws it down across the
  road. You hop up beside it and strike; the beam swings up and away. You walk out under the rest of it.
- **182 Light It, Then Turn It Back.** Striking the glass throws the light down through a thorn onto a stone in
  the floor; the gate opens. The light is now standing in your road, so you strike again. Twice struck, once lit.
- **183 Carried Shade.** Three shafts and no louvres. You pick up the lantern and walk straight through them with
  the light stopping on the lantern over your head, and jump the thorns still holding it.
- **184 Switchback Engine.** Two roofs of machinery shade the first two shafts; the last is open. Your dash over
  the thorns flips the machinery, so dash too early and the light is on you mid-air; dash just past it and the
  other roof swings in over the landing.
- **185 Beat and Glass.** From a ledge you watch a louvre on the floor line. When it shuts you drop, run, turn the
  glass on the way, and get onto the step before the floor lights up again. It is a race, and a fair one.
- **186 Throw the Shade.** You carry the lantern through the light on the walk, then throw it down the shaft. It
  lands in the passage light and the floor past it goes dark; you drop in behind it.
- **187 Low Light.** A roof of light just above your head and a long bed of thorns. The hint teaches the hyper;
  the room is the first place it is required.
- **188 Belly Shade.** The whole floor is lit. You jump off the ledge as the shellback passes below, strike it
  over in the air, bounce off it, and land in the three seconds of shade it throws.
- **189 The Palace Road.** First the engine road: dash once just to flip it before the first light, hyper (or
  jump and dash) over the long pit which flips it back, then dash again before the last light. Then the Sun
  Gate: turn the glass, and hyper under the light it lays over the thorns.

## Difficulty curve (intended)

180 is a walk with pauses, easier than the Colony's *The Watch* (179). 181–183 stay gentle, one object each.
184 and 185 add a timing inside a move. 186 is a breather with a throw. 187 requires momentum (taught in the
room). 188 asks for an aerial strike timed to a patrol. 189 chains three placed flips with a hyper, then a strike
and a hyper: a little above 179's two-move smoke run.
