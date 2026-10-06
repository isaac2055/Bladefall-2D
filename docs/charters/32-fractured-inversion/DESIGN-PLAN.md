# The Fractured Inversion (stage 32), built 2026-09-25 (7.212.0)

## Refinement — 7.220.2 (2026-09-25)

Steady surface-sweep bounds and a committed dive lane; completed Keel remains on the floor. Retry clears pending dive/sweep/health state and dialogue. Native flip fixture reached the roof; sweep render reviewed.

Part of the final nine-region batch: 78 focused tests passed; all18 modules passed syntax
checks. Browser fixtures reviewed changed cues, death cleanup and applicable completed
reloads. These are scoped checks, not new full-route or co-op verification. Authored
geometry/timing retained. Local mirror only; no deployment.

Act Three's twelfth echo: the Inversion after the Echo walked it backwards. The Inversion is the right way up,
which is the wrong way for it. The original was walked east to west, so the echo runs west to east. It has two
floors, the world's below and a roof above, and each of them fails in places.

**The kit** is the one the Inversion was entered with: jump, the Oathblade, the dash, the twin mouths, the wall
jump, the Counter, the double jump, Attunement, Companion Command and the downward strike.

**The gravity flip** waits at the anchor, where it did (`F.grant('gravity-flip')`).

**The Muster applies.**

**Code:** `public/bladefall-fractured-inversion.js` and `-art.js`.
- **Stage and seams:** stage 32, zone `fractured-inversion`. The seam `fcl-fi` comes from the Colossus; the
  east seam `fi-ft` opens once the Keel settles.
- **Rest site:** `keel-ash` (The Upturned Hearth).
- **Music:** `fractured-chamber-of-inverted-gravity.mp3` on the road, and `fractured-abnormal-circumstances.mp3`
  for the Keel. That track was the Hollow Marksman's before the score replaced it, and was unused.

**Engine parts reused:**
- the flip (`L.flip`: the flip, the world's ceiling), with `authoredEcology` so no random void-dwellers;
- crumbling roof (`crumble`, a 0.45 s fuse);
- timed spikes, `ceil` on the roof.

**Built here:**
- the fall into the sky, which rewinds like a fall into the void and rights you;
- the Keel.

**Shared changes:**
- **The camera may be capped** (`maximumY` in `bladefall-camera.js`, and a `cameraCeiling` region hook in Act
  Two). The engine frames a flipped knight a third of the way up the screen, which from the roof hides the floor
  you are about to flip to. The Inversion caps the view while you stand on the roof, so both floors stay in view.
  The floor still wins over the cap, and the camera is unchanged wherever no region sets one.
- **Level Select test:** the echo list follows the originals' order after another agent's reorder.

## The B-side
| Room | x | The original | The echo |
|---|---|---|---|
| The Right Way Up | 0–1500 | the anchor after two rooms (the flip) | the anchor at 1100 lit; the roof starts at 600 so the first flip lands |
| The Crossings | 1500–3550 | the two-floors test | where the floor fails, a pillar stands in the gap, taller than any jump, so you go up and walk the roof. Where the roof fails, a spur hangs into the gap, so you come down and walk the floor. They never fail over each other. The first roof crumbles (only stopping loses it); the second has two sets of teeth on a beat, half a period apart |
| The Gulf | 3550–4100 | — | both floors gone. A spur hangs from the sky to 150 (a double jump puts your head into it), then a pillar stands from the void to 350. Jump off the edge, pass under the spur, flip up and over the pillar, and flip down onto the far floor |
| The last crossing | 4100–4950 | — | a crumbling roof with teeth in the middle of it; wait on the solid roof before it (400 of it) for the teeth, then run |
| The Weave | 5350–7150 | the three stacked lanes | walls up from the floor and down from the roof, 300 apart. You pass each one on the other surface. Thorns wait on your own surface just past each wall, and a flip at a run, begun just past a wall, carries you over them (it drifts ~173) |
| The Keel | 7500–8600 | — (the original has no boss; its climax is the Last Breath) | **the C-side** |

## The C-side: the Keel
A hull with a keel instead of legs, hovering between the floor and a lower roof (420). Two marks in each of
three acts; one mark a cycle.

1. **Turn.** It shows its keel to the surface you are **not** on, and glides off 260 to one side of you
   (0.5 s).
2. **Sweep.** It burns the surface it turned away from, which is where you were (0.9 s tell, 0.9 s burn).
   Flip at a run and you arrive under it, or over it, with its keel bare: strike. Only a blade from the side it
   shows counts; everything else clangs off.
3. **From the second act,** a second sweep follows you to the surface you fled to, 1.0 s after the first. It
   never burns while the first still does. You strike and flip back.
4. **In the third act,** each cycle ends with a dive along your surface (0.6 s tell). Flip off it or jump it.

A blow never cuts a cycle short: the second sweep and the dive still come. Leaving the hall resets the fight;
a finished act is kept.

## Verified (scripted input in the browser; not a human playthrough)
Chained with the Muster on, from spawn to the end card ("THE FRACTURED TYRANT") in 77 s:
- every crossing, the Gulf and the Weave on the first try;
- the Keel in 27 s;
- one hit taken, from the rifthound at the hall's door.

Separately:

| Check | Result |
|---|---|
| The Keel | 3/3 from different entry points and times, 23–24 s, 0–1 hits |
| A knight who stands in the hall | burned by every sweep |
| A knight who stays on the surface during a dive | struck by it |
| The Gulf, swept over both flip points | 18 of 63 pairs cross. The first flip is good over ~120 units (0.57 s at a run), the second over ~90 (0.43 s) |
| A fall into the sky | rewinds you and rights you |

Measured:
- the knight is 44 tall;
- a flip crosses 500 in 0.82 s and 420 in 0.73 s, carrying a runner ~173;
- a flipped jump reaches 79 below the roof.

Changed while verifying:
- **The Gulf:** with the void at −140 and the sky at 900, the flip windows were 60 units each. The void is now
  −320 and the sky 1200.
- **The last crossing:** the crumble began where a knight lands after the Gulf, so there was nowhere to wait
  for its teeth. It moved 150 east, and the Weave with it.
- **The Keel's first build** followed you and showed its keel on a timer. A perfect-reaction bot took all six
  marks in 11 s.
- **The Keel's first rebuild** swept the surface you ended its turn on. A knight who flipped early was burned
  where its keel was bare.
- **Blows:** a blow cancelled the rest of the cycle (the second sweep, the dive). Now it only marks.
- **Roof teeth:** the renderer draws every floor spike standing up, so the roof teeth stood on top of the
  roof. The echo draws its own.
- **The camera** hid the floor from a knight on the roof. It is now capped (see Shared changes).
- **The Keel turned over with the world:** the renderer turns over every walker while the world is flipped, so
  its keel, shown to the roof, drew under its hull. It is a flyer now (`kind:'fly'`) and stays upright.

## Open
- Owner playtest: whether the Gulf reads (a spur, then a pillar, and nothing under either), and whether its
  windows are fair for a first attempt.
- Whether the Keel's bare keel reads from the far surface (it lights when a blow from where you stand would
  count).
- The keelmen patrol the band between the floors in the Crossings and the Weave; the chained run never met
  them. They may be too passive to matter.
