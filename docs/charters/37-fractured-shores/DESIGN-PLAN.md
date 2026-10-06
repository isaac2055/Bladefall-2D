# The Fractured Shores (stage 37), built 2026-09-25 (7.217.0)

## Refinement — 7.220.2 (2026-09-25)

Tide staffs show the flood limit/current level; shield bash shows its reach and bell opening shows remaining time. Completed Sunguard remains visible. Retry clears health, bell/turn timing and dialogue. Tide, bash and toll renders reviewed.

Part of the final nine-region batch: 78 focused tests passed; all18 modules passed syntax
checks. Browser fixtures reviewed changed cues, death cleanup and applicable completed
reloads. These are scoped checks, not new full-route or co-op verification. Authored
geometry/timing retained. Local mirror only; no deployment.

Act Three's seventeenth echo: the Landing Shores after the Echo walked it backwards. It is the strand of wrecks
at a higher tide. The gut is wider, the flats drown instead of wetting, and the bell rings for nobody.

**The kit** is the one the Shores were entered with: everything through the Chainhook. Nothing waits here; the
original granted nothing either.

**The Muster applies.**

**Code:** `public/bladefall-fractured-shores.js` and `-art.js`.
- **Stage and seams:** stage 37, zone `fractured-shores`. The seam `fc-fs` comes from the Cliffs; the east seam
  `fs-fco` opens once the Sunguard's echo is broken.
- **Rest site:** `strand-ash` (The Strand Fire).
- **Music:** `fractured-the-shore-of-broken-ships.mp3` on the road, and `fractured-the-last-spark-of-darrow.mp3`
  for the Sunguard. That was the original's bell-fight cue.

**Engine parts reused:** the Chainhook and `actRing`, and coated walls (`noCling`, slick).

**Built here:** the tide, the float, the bell, and the Sunguard's echo. The original's tide, bells and
encounters are all local to its region file.

**No shared changes.**

## The B-side
| Room | x | The original | The echo |
|---|---|---|---|
| The Gut | 0–2750 | the gut (980 of water, two rings) | 1,150 of water and three rings, from the strand at 200 |
| The Hull | 2750–3300 | the hull (coated walls, two rings to the deck at 600) | the same climb, as it was |
| The Flats at Flood | 3300–7200 | tide flats: low 10 s, flood 5, high 7, ebb 4; water −70 to 170; floodwater hurts for 10 and throws you up | low 4 s, flood 3, high 5, ebb 3; water −70 to 190; the flood **drowns** (a fall back to your last refuge). Dry about 6.2 s of every 15, so ~1,300 units of running. The refuges are a rib (200, reached by its ring), a wreck (250, by its ring), and a float that rests on the sand at low water and rides the tide up. Every raised face is coated, so nothing walks into a refuge. Each leg fits one dry window, and no two legs do together, so every refuge is needed |
| The Shore | 7200–7760 | the jetty | two steps up (a double jump each) to the jetty at 300 |
| The Sunguard's echo | 7900–9400 | the Colony Gate fight (the Sunguard; the first blow while the bell rings cracks it) | **the C-side** |

## The C-side: the Sunguard's echo
A tall shield on the side it faces, turning to you 1.1 / 0.95 / 0.8 s late, and a bash (0.5 s tell).

The bell on the court's west ledge tolls every 2.4 s, and every 1.9 s in the last act. A blow counts only on the
Sunguard's back, and only while the toll still rings (0.75 / 0.7 / 0.55 s after it). One blow a toll; its back
lights gold while a blow there would count.

Get over it (a double jump clears it) or around it, and strike on the toll. Two blows in each of three acts. From
the second act the court floods: −60 to 130, wet ~3.5 s of every 7.7. The water hurts 12 and throws you up; the
three perches (130, a double jump) stand above it. The Sunguard camps under your perch, so drop off behind it.
Leaving the court resets the fight; a finished act is kept.

## Verified (scripted input in the browser; not a human playthrough)
Chained with the Muster on, from spawn to the end card ("THE FRACTURED COLONY") in 105 s: the gut, the hull, the
four flats legs (the rib, the wreck, the float through the high tide, the shore), and the Sunguard in 24 s.

Separately:

| Check | Result |
|---|---|
| The flats, refuge to refuge | 3/3 |
| The flats, running straight across | drowned 15 times, never through |
| The Sunguard, from three entry points | 3/3 in 31–46 s; the bot took 4–13 hits, as it trades badly against the bash |

Changed while verifying:
- **Raised blocks** are solid only from above, so the knight walked into the rib at sand level and drowned
  behind it. Every raised face is now coated, as the original's were.
- **The rib** first stood at 220, higher than any jump. It is now 200, with a ring.
- **The float** first sat under the sand at low water and would rise through a knight standing there. It now
  rests on the sand, and you hop on.
- **The gut's last ring** landed you with 1 unit to spare. The far strand now starts 50 sooner.
- **The court's tide** flooded ~6 s of every 9, which left too little dry court for the toll pattern. It is now
  ~3.5 of 7.7.
- **The court's perches** were first 200, beyond a jump with no ring. They are now 130.

## Open
- Owner playtest: whether the tide's line reads early enough to plan a leg, whether "only on the toll" reads
  from the bell's swing and glow, and whether the gold rim on the Sunguard's back is seen in time.
- The original's moral choice at the Colony Gate (the man's hand) has no echo here.
