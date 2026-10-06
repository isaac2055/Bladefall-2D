# The Fractured King (stage 34), built 2026-09-25 (7.214.0)

## Refinement — 7.220.2 (2026-09-25)

Remaining kneel time and Return-gate hold time are visible; the gate timer is placed by the reachable ledge. Dead players cannot advance road plates. Retry clears pending attacks and dialogue; completed Crown remains visible. Kneel and gate renders reviewed.

Part of the final nine-region batch: 78 focused tests passed; all18 modules passed syntax
checks. Browser fixtures reviewed changed cues, death cleanup and applicable completed
reloads. These are scoped checks, not new full-route or co-op verification. Authored
geometry/timing retained. Local mirror only; no deployment.

Act Three's fourteenth echo: the Drowned Throne after the Echo walked it backwards. The Throne gave the knight
a second body. The echo asks what one knight can do with it alone: there is no Oren to hold the other mark and
no Right Hand to learn from.

**The kit** is the one the Throne was entered with: everything through the gravity flip (never turned on here).
The Echo works from the first step, as it did.

**The Muster applies.**

**Code:** `public/bladefall-fractured-king.js` and `-art.js`.
- **Stage and seams:** stage 34, zone `fractured-king`. The seam `ft-fk` comes from the Tyrant; the east seam
  `fk-fl` opens once the Crown stays down.
- **Rest site:** `crown-ash` (The Drained Hearth).
- **Music:** `fractured-the-black-procession.mp3` on the road, and `fractured-a-crown-of-ashes.mp3` for the
  Weighed Crown.

**Engine parts reused:**
- the Echo: leave, trade places, 14 s of life, `echoStanding`/`echoWeighs`;
- plates, including `echoOnly` marks that only the echo weighs;
- a blinking seam;
- timed teeth.

**Shared changes (both additive):**
- **`echoVerbAvailable`** also answers true on a level that sets `echoVerb`. The verb was hard-gated to
  stage 13 and the Tyrant's duel; the stage-13 test's regex still holds.
- **The renderer's `plate` case** asks the region's art first (`if(o.actArt && ext('object', o))`), as `trap`
  and `spikes` already did. The echo-only look was stage-13-only.

**Built here:** the gates the marks hold, the Return's timed hold, the span, and the Crown.

## The B-side
| Room | x | The original | The echo |
|---|---|---|---|
| The First Mark | 0–1000 | the rite; the Two Marks door (Oren and the echo) | a mark only the echo weighs, and a full-height gate beside it held while it does. Passing lets that echo go; otherwise the next press of the key would trade you back to it |
| The Return | 1000–3600 | the Long Drowning's lever and recall | a stair to a long ledge (360) with a hole in it; the gate at its east end. Below, a closed room with wet walls and your plate under the hole. The plate holds the gate for 2.5 s after you leave it. Leave the echo at the gate, jump the hole going east, come back and drop through, stand on the plate, trade places, walk through. The way round by the stair takes ~8 s |
| Two Marks at Once | 3600–7800 | the Divided Stair's echo-only door | the echo's mark; a void crossed by a blinking tear; three rows of teeth on a wave; your mark. While both are weighed together, a span comes over the next void and stays. The echo lasts 14 s; a clean run takes ~7 s once it's left. Crossing lets the echo go |
| The Weighed Crown | 8000–9600 | the King (the echo trial, the recall finale) | **the C-side** |

## The C-side: the Weighed Crown
The King's echo is hung over his hall at 330, and nothing reaches it. Two marks lie under it: the echo's, on
the floor, and yours. Weigh both together and it is pulled down onto the echo's mark and kneels for 2.0 s. Trade
places and you are beside it: strike. Only one blow counts per kneel. Two blows in each of three acts:

1. **Marks 520 apart:** too far to run while it kneels (2.5 s), so trade.
2. **Marks 820 apart, and it breaks the echoes it sees:** an echo stands here 4.2 s before a blow falls on it
   (1.0 s tell: a ring closing on it). Reach your mark before then. It never strikes while it is pulled down.
3. **Your mark on a perch** against the wall (a 110 step, a 230 perch), and the echo's on the floor 420 in
   from it. Leave the echo, walk, climb, weigh.

Volleys of 3–4 bolts every 3.4 / 3.0 / 2.6 s keep you moving. Leaving the hall resets the fight; a finished
act is kept.

## Verified (scripted input in the browser; not a human playthrough)
Chained with the Muster on, from spawn to the end card ("THE FRACTURED LINE") in 116 s: the First Mark, the
Return, Two Marks at Once (the span with the echo still standing), past the shielded crownguard, and the Crown
in 66 s. Every blow was landed after a trade.

Separately:

| Section | Result |
|---|---|
| The Return | 3/3 (the plate, the trade, through inside the hold) |
| The Crown, from three entry points and times | 3/3 in 64–67 s, 6 trades each |

Changed while verifying:
- **The Shield Wall, cut before it was built:** a section with a front-shielded crownguard in a low corridor,
  passed by trading places behind it. Measured: the knight walks through a crownguard for one wound. It gated
  nothing.
- **The echo left behind:** the First Mark's echo was still standing at the Return's gate. Pressing the key
  there traded the knight 1,700 units back, behind a gate that then shut. Marks now let their echo go once their
  work is done.
- **The Crown's blow at the echo:** it landed as the Crown was pulled down, leaving it kneeling with no echo to
  trade with. It now falls only while the Crown hangs, and its clock runs only while an echo stands.
- **The last act's marks** were 1,030 apart across the hall, more than the echo's time allows with the climb.
  The echo's mark now sits 420 from the perch, on the same side.
- **Volleys:** 3–5 bolts every 2.8 / 2.4 / 2.0 s had the bot hit ~10 times in a fight about walking. Now 3–4
  every 3.4 / 3.0 / 2.6.

## Open
- Owner playtest: whether the hollow sigil reads as "not for you" without a sign, whether the Return's drop is
  found (the plate under the hole is visible from the ledge), and whether "weigh both, then trade" reads in the
  hall. The Crown's hang threads and its lit crown when kneeling are the tells.
- Whether 66 s (a perfect bot) is too long for a C-side.
