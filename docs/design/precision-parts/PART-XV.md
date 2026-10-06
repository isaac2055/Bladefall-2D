# Part XV · The Deep Line (levels 140–149, 7.254)

The last region of Act 1. Going east (140–144) is a breather that previews momentum: you ride a cart, and its
speed is lent to you, never your own. Coming back west toward the boat (145–149) is the Act 1 finale: each room
brings back one old friend (crystal, tally stones, bells, portals, lantern, moths, seed pod) and asks it at the
speed of a cart. Momentum techniques (super, hyper, wavedash) are never required; a cart cannot launch one.

Files: `public/bladefall-pcore-part-140-deep-line.js`, `scripts/verify-precision-part-140.mjs`. Device module
`public/bladefall-pcore-dev-rail.js` (+ `-view.js`), **unchanged this pass**.

## The levels

| Level | Room | The question | Wrong answer that fails (count) |
|---|---|---|---|
| 140 | Thorn Line | Thorns grow along the whole line. What can cross them that you cannot? (Ride the cart.) | Jump out and cross on foot, any jump and dash (648, 0 exit on foot); on-foot search finds nothing |
| 141 | Buffer Stop | The ledge is farther than any jump and dash. Where does the extra distance come from? (Jump out at full lean, then dash.) | Jump and dash from the stopped cart (176); lean a little, coast, jump and dash (462); search from a stopped cart with climbing finds nothing; on foot finds nothing |
| 142 | Back Up | The bridge falls a moment after the cart touches it. Which way do you lean first? (West, onto the strip, which throws you east at 300.) | Lean east at any pace (264); back up short of the strip (65); jump out over the bridge (44); search without the strip finds nothing |
| 143 | High Line | What sends the cart up to the high line? (Lean the way it rolls at the brass post.) | Let go as the cart passes the post, then lean on (33 no-hop tapes); search without a hop finds nothing |
| 144 | The Cut Fork | Two posts. At which do you lean, and at which do you let go? (Let go, then lean.) | Lean through the first post (72); let go at both (30); search without the second post's hop finds nothing |
| 145 | Westbound | The ledge is higher and farther than one dash. Where is your second dash? (The crystal, mid-leap.) | One dash only, any direction and timing (462); search that never touches the crystal finds nothing |
| 146 | Tally Line | The second stone is far above the line. How does the cart put you up there? (Lean at the post; jump at the top of the hop.) | Let go at the post, then jump and dash (840, only runs with no hop count); search without the hop finds nothing |
| 147 | Bell Line | A dash flips the colours but takes you out of the cart. What else flips them, and when? (Up-cut each bell as you pass under it.) | One bell or none (43); jump out and dash to flip (88); search that never rings a bell finds nothing |
| 148 | Speedy Line | The shaft is thorned, and the fixed portal is in its floor. What goes into your end fast enough? (A knight thrown off the strip at 250; shoot the pillar in flight, dash up at the top.) | Jump out before the strip, shoot and dash (588); search that never rides the strip finds nothing |
| 149a | Lamp Car | The chasm is wider than any leap from the cart. What keeps you up? (Grab the lantern from the seat, jump at the buffer, glide.) | Jump and dash without the lantern (252); search that never picks it up finds nothing |
| 149b | Moth Line | Thrown off the line you are far below the ledge. What lifts you, twice? (Down-cut both moths.) | Thrown leap and a dash, no moth (396); search allowing at most one moth finds nothing |
| 149c | The Boat | The quay is high and far. Where does the height come from, and where the distance? (Height from the switch's throw, jumping at its top; distance from a dash, the pod's pogo and a second dash.) | Let the cart pass the post low, then jump and dash (840, no-hop runs); the throw and two dashes without the pod (336); searches without the pod and without the hop find nothing |

Level 149 is three rooms, each its own checkpoint (summit palette), in the manner of *Third Summit*.

## What the player does and feels

- **140** Holds right and watches the thorns go by under the tub. A first ride; nothing asked but trust.
- **141** Leans hard, jumps just before the buffer and flies farther than they ever have on foot, then dashes onto
  the ledge. The first taste of borrowed speed.
- **142** The instinct is to lean at the bridge; it falls. Backing up onto the chevrons behind you throws the cart
  across before the bridge can drop. A small "oh".
- **143** Holds the lean through the brass post and the cart leaps a floor. Letting go at the post parks you under
  the high line.
- **144** Two posts; the first high line dead-ends at a thorned pillar. Let go, then lean. A reading room.
- **145** Turning for home: a long leap off the cart, a dash up, the green glass, a second dash to the high ledge.
  Harder than anything east of here.
- **146** Cut the low stone in passing, lean at the post, and jump off the top of the hop to touch the high stone.
  The gate lifts ahead of you.
- **147** Two up-cuts from the seat, timed to the bridges. A dash would do it but would leave you on the thorns.
- **148** Thrown off the strip, you shoot the pillar while flying and come up out of the floor of the shaft fast
  enough to clear its thorns, with a dash at the top. The portals return at cart speed.
- **149a** Snatch the lantern from the track as you pass, jump at the buffer and glide the whole chasm.
- **149b** Thrown at full speed over a pit, two down-cuts on two moths carry you up to the high ledge.
- **149c** The finale: lean at the post, jump at the top of the throw, dash, pogo off the seed pod, dash onto the
  quay. Every beat is something the act taught.

Difficulty intended: 140–144 gentle (below Part XIV's close); 145 steps up; 146–148 medium; 149's three rooms climb
to about *Third Summit*: 149a moderate, 149b tight (a pogo chain at 250 px/s), 149c the longest sequence.

## What the sweeps caught and the fixes

- **140**: the draft's "leave the cart" family counted exits after a death (you respawn in the cart) and a dash
  that ends on the cart seats you again. The check now counts only a clean run that leaves on foot; none does.
- **141**: a search from the stopped cart found jump, dash and a walljump off the thorned ledge's top corner (a
  plain walljump works off thorns if you touch the strip moving away). The ledge moved two tiles farther; the
  stopped-cart search (with climbing) finds nothing, and a full-lean jump plus dash still lands with room.
- **145**: the draft ledge was reachable with one dash; the crystal was decorative. The exit ledge was raised to
  row 8; now the second dash from the glass is required.
- **148**: the draft shaft was two tiles wide and a planner walljumped up it without speed. The shaft is now
  thorned on both sides and the exit ledge set so the strip's throw (fling at ~300 px/s up) plus a dash reaches
  it and a lean-speed entry does not.
- **149a**: removed a purposeless amber column; the lantern sits on the track (a lantern placed in the air
  falls to the thorns and floats home, which looked broken). Moved one tile east so the grab-then-jump has room.
- **149b** (new): first version was solved by the boost leap and one dash; the line was lowered four rows so two
  moth pogos are needed.
- **149c** (new): four iterations. A rock shelf over the start let the knight walljump up the right wall and use
  the pod twice without the cart; a hop under low rock crushed the knight; a thin quay's end face could be grabbed
  after a single dash. Final: the post is right by the start (slow throw, all height, little distance), the start
  is tunnelled so the on-foot knight cannot climb out, and the quay's end is thorned.
- Families for 143/146/149c now count only runs with no hop (a tape that happens to lean at the post is the answer).

Stronger searches run while authoring (not in the verifier, for time): 145 without the crystal (beam 800, climb)
and 149c without the pod (beam 1200, climb and blade) both found nothing.

## Dropped designs

- 149c with a high line and a boost strip before the leap: the jump from the rising hop made the strip pointless.
- 149c with a thorn ceiling: its rock faces became walljump walls.
- An overhead lantern in 149a that you jump out to fetch and land back in the cart: lanterns fall without support.

## Notes and open points

- Engine behaviour worth knowing (not changed; core is not mine): a plain walljump works off a thorned face when
  the knight touches the strip while jumping away from it, because moving the way thorns point is safe. Only the
  wallbounce refuses thorned faces. Rooms here avoid reachable thorned walls at the heights that matter.
- The verifier: 44 checks, about 150 s (hunts use beam 200 to stay in budget; the stronger authoring searches
  above back them up).
