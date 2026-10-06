# Level 200 · The Summit Road (the capstone)

Built 30 September 2026 (7.255). Files:

- `public/bladefall-pcore-part-200-capstone.js`: one chapter (`level:200`, palette `summit`), six rooms, tapes. Part key `CAP`.
- `scripts/verify-precision-part-200.mjs`: routes, wrong-strategy families, hunts (`ONLY=p200c,p200e` runs a subset).
- Devices: portals, frost/water, gravity, foundry, rail, throne (echo), hook, beam. **None changed.**

The guideline asks for a multi-room capstone that speaks the whole game's vocabulary at full speed. Six rooms, each its
own checkpoint, each one question. Read in order they walk the game's arc: Parts II–VI (lantern, portals, crystals),
the Act 1 regions in order (White Court and Frostfell; Foundry and Inversion; Deep Line and Throne), then Act 2
(Thunder Cliffs' ring after Part V's fall-height door, and the Sunspire's light through portals). Each room pairs two or
three devices whose rules genuinely meet: the lantern's slow fall against a door that remembers your fall, the blade
that freezes water against a wall you can climb, the anvil's down-cut against an upturned room, the echo's kept speed
against the cart's speed, a portal fling into a hook ring, and light and the lantern through the same door.

## Shape and difficulty

> a (warm, sharp) < b < c ≈ d < e (execution peak) · f (the summit is a thought, not a sprint)

- No hints: nothing in the level is introduced here.
- Momentum required: super and dash chain through a crystal (c), a cart's kept speed carried by the echo plus a dash (d),
  a portal fling into a ring released on the upswing plus a dash (e). Execution windows are about as tight as 199b's
  (e: let go within a 6–10 frame window, then dash within about 8; d: a 7-frame dash window).
- No foes: the arc rooms already carry three or four devices each, and enemies never sharpened a question here.

## The rooms

Counts from `node scripts/verify-precision-part-200.mjs` (all green). "Hunt" is an adversarial beam search that forbids the
room's answer; its state key includes the lantern, the cart, the echo, the chain, frozen pools, flipped gravity and
coast/fling flags.

| Room | Name | Question | What fails (checked) |
|---|---|---|---|
| 200·1 `p200a` | Lamp Flight | The door throws you as hard as you fell, and the thorns run the whole way. What keeps you up? | Fall through the door without the lantern, with or without the coyote jump (189 real door passes, 0). Hunt to the far shelf never carrying the lantern: none. |
| 200·2 `p200b` | Frozen Fall | The only wall between you and the ledge is falling water. What makes it a wall, and for how long? | Go for the water without striking it: grab, dash, swim (108, 0). Freeze it, then hang on the ice before climbing (11, 0). Hunt up without a freeze: none. |
| 200·3 `p200c` | Iron Both Ways | Upside down, the way out is below you and the roof is thorns but for the anvil. Which way do you cut it? | Cut down the screen, as you would standing up (189, 0). Land on the anvil, then jump or dash for the door (132, 0). Hunt to the door without an anvil throw: none. |
| 200·4 `p200d` | Borrowed Speed | The cart is fast and low, and the ledge is high. How does the cart's speed get up to where you need it? | Ride and jump without trading places (96, 0). From the top of the wall without the cart: kick off, dash (126, 0). Hunt onto the ledge without an echo swap: none. |
| 200·5 `p200e` | Thrown to the Chain | The only way out of the well is the door in its floor, and the chain hangs over the thorns. How high must you fall? | Fall from the bottom third of the well, then jump, dash, hold the chain (168, 0). Hunt onto the ledge without the ring: none. |
| 200·6 `p200f` | The Summit | The light needs your door to reach the stone, and then it lies the whole length of the road. Where must the shade begin? | Go down without the lantern (11, 0). Carry it down, or throw it into the hall (33, 0). Set it on the road first, then open the door (26 real runs, stone never lit). Hunt out without the lantern going through the door: none. |

## What the sweeps caught, and the fixes

- **Wall-speed retention survives a portal (engine quirk, worked around).** A knight pressed against a wall in the
  frames before he drops into a floor door comes out of the other end at his old wall speed (the core's 4-frame
  retention restores `retained` after the portal has set the fling). Every floor door in this level now sits away from
  walls (a, e), so no player can trip on it. Worth fixing in the core: clear `retainTimer` on a portal pass.
- **Coyote jump after a floor door (engine quirk, worked around).** Landing on the rock beside a floor door on the frame
  you enter it refills `jumpGrace`, so you can jump in mid-air for six frames after coming out. In (a) the hunt used it
  to reset the fall and reach the shelf without the lantern. The door now stands on a pedestal with thorn gutters
  either side (no rock to touch while entering), and the corridor's roof is thorns flush with the exit, so a jump
  out of the door burns. Worth fixing in the portals module: zero `jumpGrace` on a pass.
- **(a)** with a dash in the room, a late up-right dash at 420 px/s recovered the fall; the room now has no dash
  (`dashes:0`), which also suits the lantern, which takes your dash anyway.
- **(a), (e)** fixed ends in a one-tile wall were enterable from behind (the knight climbing the well wall fell into the
  door's back). Both doors sit in two-thick walls.
- **(c)** the first draft let a super along the upturned roof and a wallbounce off the exit pillar reach the door; the
  pillar faces are thorned. The redraw replaced a walk along the roof with the chain: super, crystal, prism, anvil.
- **(d)** two redraws. With a ground ledge for the echo, a wavedash hyper and a dash reached the far pillar; with a pillar
  in mid-room, a hyper on the rail, a jump and an up-dash cleared it. The echo now hangs off a climbable wall (no ground
  up there, so no super or hyper), and the goal is a high ledge with a thorned lip that no rail-level jump reaches.
- **(e)** with the ledge one row higher only the very top worked without pumping; with it one row lower, a pumped swing
  from halfway worked. The final ledge needs a fall from at least about halfway up (pumping), and the bottom third never
  reaches the ring at all.
- **(f)** a thrown lantern bounced off the wall beside the door and came to rest half on rock; the throw window from the
  ledge is now 92–116 px (24 px wide). The road beam runs through the bottom row so the lantern lying on the tunnel floor
  stops it (a beam one row higher passed over it).

## Dropped designs

- *Doorstop* (the lantern inside amber machinery holding one body open while another holds you): every layout had a
  standing spot or a dash-through that made the lantern optional.
- *Recoil behind the warder* (pressure pod throwing you at a jailer's back): any fast approach answered it, so the pod
  was decoration.
- A zip-and-lantern glide for (a): it repeats Part II's *Lantern Line*; the portal fling gives the glide a speed
  nothing else in the game does.
- (f) with a wall door and a horizontal beam: the throw height, the beam row the knight survives under, and the row the
  lantern must lie in to shade the road cannot all agree. The floor door under a falling beam does.

## What the player does and feels

- **a · Lamp Flight**: steps off the top of the well, snatches the lantern off its ledge on the way past, floats down into
  the little door, and is thrown out under a roof of thorns at full speed, hanging under the lantern all the way to the
  far shelf. Without it the same throw drops into the thorns halfway.
- **b · Frozen Fall**: jumps at the waterfall and cuts it in mid-air; it freezes with a crack, and the climb begins with
  the ice already counting. Hop over the top, jump, dash, and the ice thaws behind you.
- **c · Iron Both Ways**: a super off the start, a crystal in the air, a dash through the prism, and the room turns over.
  You fall up at the thorned roof, where the only thing to touch is the anvil. Cut toward your feet, up on the screen,
  and it hurls you down through the gap between the thorned pillars.
- **d · Borrowed Speed**: climb the wall, leave yourself at the top, drop into the cart, lean, hit the boost, jump out at
  speed and trade places: you are back at the top of the wall, still doing three hundred, and the ledge comes to you.
- **e · Thrown to the Chain**: climb the well as high as your grip allows, let go, steer into the door, and the fling
  hands you to the ring. One swing, let go on the way up, dash, and you are on the ledge.
- **f · The Summit**: fire your door into the light's well and the far stone lights, the gate opens, and the road below
  burns end to end. Then the lantern goes through the same door and lands at the light's mouth, and the whole road falls
  into its shade. Walk down, along, and up out.
