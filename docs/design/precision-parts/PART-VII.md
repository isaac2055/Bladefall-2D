# Part VII · The Gaol (levels 75–82, 7.254)

The Warden's region. The base game's verb here is the counter, and its rooms are shielded jailers that commit to a
facing. The precision mirror is the **jailer** (a parry-deepened foe) and the region's one precision-only device is
the Base Bank's **Recoil Well**: the **pressure pod**.

Files: `public/bladefall-pcore-dev-gaol.js` (+ `-view.js`), `public/bladefall-pcore-part-075-gaol.js`,
`scripts/verify-precision-part-075.mjs`.

## The devices

- **Jailer** (`jailers:[{x,y,dir,turn,keys}]`). A solid grey warder with a tall shield on the side it faces. From the
  front, the blade glances off and a returned bolt breaks on the shield. Step into its reach and it thrusts after an
  18-frame tell; a parry staggers it with the shield down, and then any cut fells it. From behind, one cut fells it
  and throws you like a seed pod. A down-cut on its helm is a pogo. Stand behind it and a ring of ticks over its helm
  fills; when the ring closes (`turn` frames, 45 by default) it turns to face you. While a jailer with keys stands,
  every tally gate stays shut.
- **Pressure pod** (glyph `R`). Dash into it and it throws you back the way you came at 280 px/s and returns the
  dash. Down into it sends you straight up (about twice a jump); sideways speed carries through the air until you land.

## Engine changes made while building this part

- **A thorned face is not a wall to push off.** The thorn strip is 3 px thick, so a wallbounce (checked 5 px out)
  could reach the rock behind thorns. Recoil Well's first draft was skipped that way (hyper, then a wallbounce off
  the thorned wall). The core now ignores a wall for the wallbounce when thorns on it point at the knight. Parts I–VI
  still pass all 282 checks.
- The jailer's thrust reach is 14 px, one less than the blade's, so a knight standing where it thrusts can always
  answer with the blade after a parry.

## The levels

| Level | Room | The question | Wrong answer that fails |
|---|---|---|---|
| 75 | Committed | The jailer faces you over thorns under a low roof. Where is it not looking, and how do you get there? (Climb to the attic crawl, drop down the shaft behind it, cut its back before it turns.) | Straight at the shield by jump, dash, cut or parry (576); an adversarial search that forbids the shaft finds nothing |
| 76 | Stagger | No way round. What makes it lower its shield? (Parry the thrust, then cut.) | Every cut, dash or jump without a parry (396) |
| 77 | Recoil Well | The ledge is higher than a jump and a dash. Which way do you dash to go up? (Down into the pod.) | Jump and dash without the pod (1,296); adversarial search without the pod finds nothing |
| 78 | Back Door | The jailer's cell has no door, only a portal open in its roof behind it. Where do you put yours? (In the floor of the pit below your ledge; you drop in behind it and cut its back before it turns.) | Land behind it, wait until it turns, then cut (72 tapes, 0 exit); a portal shot anywhere but the pit floor (84, 0); search without a portal pass finds nothing |
| 79 | Up and Over | The way round is a crawl high in the wall, and its face is thorned. How do you get up to it? (The pod.) | Every jump-and-dash onto the crawl without the pod (729); search without the pod |
| 80 | Two Wardens | Drop in between them and you are behind both, but one turns much sooner. Which back do you take first? (The quick one, beside you.) | The slow one first, with no parry (3,240) |
| 81 | On the Lip | The pod lifts you onto the very lip of its ledge, face to face with it. What gets you past? (The parry, on the lip.) | Up by the pod but no parry (792); no way up without the pod (198) |
| 82 | The Sentence (two rooms) | *Roof Door:* your portal stone is in the chamber roof, higher than a jump and a dash — the pod throws you into it and you drop into the sealed cell behind the jailer. *Sentence:* the pod lifts you in front of one jailer with nowhere to stand: parry in the air, cut, dash back to the ledge, then parry the second one, which turned while you fought. | The roof out of reach without the pod (189, 0); search without a portal pass; no parry in the air (528, 0) |

What the player does, in feel: 75–76 are gentle one-verb rooms (go round; parry). 77 is the "down is up" surprise.
78–79 pair the jailer with one old friend each (portal; pod). 80 is a reading room — look at the two rings.
81 and 82 put the parry where you have no ground, and 82 is the Gaol's summit: about Part VI's *Everything Before*,
with two rooms, each its own checkpoint.

## Difficulty curve (intended)

The Gaol opens below the Keep's close (Part VI, 60–69): 75 and 76 are one-verb rooms with no execution to speak of,
easier than anything in the Keep's second half. 77–79 each add one old friend (pod, portal) with generous windows;
78 is now the gentlest of them (one shot, one drop, one cut). 80 is a reading room. 81 and 82 are the climb: a parry
in the air off a pod throw, and 82's two rooms chain everything, sitting a little above *Everything Before*. Nothing
needs momentum.

Verifier: 25 checks, all green. Hunt beams were trimmed this pass (p78 and p82a are sealed, so 300 is ample; the
others 500–600, each still well above the beam that found the morning's skips) to bring the run toward the
three-minute budget. Measured at 8.5 CPU-minutes (12.5 wall) with nine builders loading the machine; the
3,240-tape Two Wardens family and the p75/p77/p79 hunts are the bulk if it needs trimming further.

## What the 30 September sweep caught

- **78 Back Door** and **82 Roof Door** were skipped by the adversarial search: a hyper off the ledge crossed the
  thorn moat, the knight landed on the one floor tile in front of the jailer (or hung in the air there), parried
  the thrust and cut. That answers the jailer with the parry, which is 76's question, and never uses the portal.
  A wider moat would not have closed it (hypers cross any flat pit, and the parry works in the air). Both cells are
  now sealed: three tiles of rock stand between the last place you can reach and the jailer's shield, so its
  thrust never comes and the blade never reaches. The only way in is the portal in the cell roof, which drops you
  behind it. 78's moat family went with the moat; its wrong answer is now dawdling behind the jailer until it
  turns (the ring is visible), then cutting the shield. Both hunts now find nothing.

## Dropped along the way

- **Over the Top** (79, first draft): a pod behind you throws you forward over a thorn moat to the jailer's back.
  A hyper and a dash from the start ledge crossed the same moat, and a pure horizontal throw fell short. Replaced
  by *Up and Over*, where the pod's only job is height, which no ground technique gives.
- **Recoil Well** with a step and an open well: the step and the well's climbable left wall gave a wallbounce route.
  The step went, the well's high walls are thorned, and the thorned-face rule above closed the rest.
- **Two Wardens** with the hole in the middle: taking the slow one first and then the quick one's back still worked
  (1,216 of 5,400). The hole now opens beside the quick one, and the slow one is far enough away that going for it
  first leaves the quick one facing you.

## Open

- Nobody has played these. The parry windows (9 frames) against an 18-frame tell are the old Foes values; 81–82 ask for
  them in the air, which may feel harder than intended.
