## Fractured Keep refinement — 7.211.6 / cache v300
Keystones draw as inlaid masonry via an opt-in crate art hook. Visible release-to-hoist and
receiver-to-gate cables explain the mechanisms; a tensioning cable marks failed-stone recall.
Wet faces have a steady rim, the cradle deck matches its collision top, and the bell/chain use
consistent world coordinates. A plumb line gives the cradle swing a fixed centre reference.
The Belfry camera now includes the bell while standing at the release.
Completed weights use the engine's seated-weight path. The docked stone stays in its socket;
the rung bell-stone attaches to the moving cradle, including after reload/hydration, instead
of respawning on its hoist. Dead players cannot take the Grip or complete a mechanism.
19 focused tests pass (Keep, campaign order, player flags). Browser position fixtures with
native mouth/attack inputs completed the hall route without damage and native interaction
took the Grip. A native Belfry throw missed; its stone returned to the hoist. A separate
landing fixture verified the physical catch, opening gate, moving seated stone and stage
reload retention. No successful timed portal throw, full traversal or co-op verification is
claimed for this pass; historical construction runs below were not repeated. Representative
dock and Belfry renders reviewed; no runtime errors. Geometry, swing period and catch window
retained. Local mirror rebuilt; no commit/push/deploy. Next refinement: Fractured Warden.

# The Fractured Keep (stage 26) — built 2026-09-24 (7.206.0)

Act Three's sixth echo: the Ruined Keep after the Echo walked it backwards — every gate open, which
is worse. The Keep remembered its shape once; now it has forgotten the way up, and you build it with
your own two mouths. The kit is the one the Keep was entered with: **jump, the Oathblade, the dash and
the twin mouths** (portal key on slate: the first, the second; a third press clears them). **Mason's
Grip** (the wall jump) waits in the Mason's Quarter, as it did (session-only, `F.grant('wall-jump')`).
No boss, as in the original. The Muster applies.

**Code:** `public/bladefall-fractured-keep.js` + `-art.js`. Stage 26; zone `fractured-keep`; seam
`fm-fk` from the Marksman; rest site `hearth-ash`; the east seam opens once the bell has rung. Music:
`fractured-stony-whispers-of-the-keep.mp3`; "Crystalline Trials" in the Belfry.

Engine parts reused as they are: slate, the player pair, transit (exit speed = entry speed, along the
exit mouth's face), crates through mouths, a keystone (`keepMasonry`) clearing your mouths when it
passes, lever-released shelves (`dropOnCircuit`), wall cling/slide/jump, wet faces (`slickL/R`),
moving platforms (the engine's oscillator carries a crate that rests on one). Re-implemented here,
because the original's are stage-5-only: docking (`seatKeepWeight`), the Grip, the gates.

## The B-side
| Room | x | The original | The echo |
|---|---|---|---|
| The Cold Hearth | 0–1300 | the gatehouse hearth | the fire cold, a grunt |
| The Fallen Refectory | 1300–3700 | a pair turns a known route into height over a slick screen | the same, exact: a mouth on the floor slate under the drop perch (480), a mouth on the balcony slate (240) close under the screen (640, wet); fall from the perch's far edge back onto the floor mouth — out of the balcony at ~1100, the rise peaks at 730 (measured) and carries you over the screen onto the landing (600) |
| The Weight Hall | 3700–5560 | the keystone through the pair onto the dock | a mouth under the keystone's hoist, a mouth on the dock slate, strike the release: the stone falls through, rises out of the dock mouth (the mouths clear behind it), comes down on the dock; the hall gate lifts |
| The Mason's Quarter | 5560–7000 | the Grip | ↑ TAKE THE GRIP (wall jump); two walls straight after, climbed a wall at a time |
| The Clinging Archive | 7000–8000 | the alternating walls to the crown | walk in under the outer wall (its outside is wet), climb the chimney; where the inner wall's inside is wet (300–620) climb the outer wall alone; out onto the crown (920) and over the east wall |
| The Belfry | 8000–9600 | the bell and its moving plate | **the C-side** |

## The C-side: the Belfry — the throw
The bell's cradle swings on its chain across the belfry (±150, a 4 s swing). The only thing that
rings the bell is the bell-stone, thrown into the cradle:
1. walk in under the belfry wall (hung from 60), climb its face and **cling in its band of slate**
   (420–520) — set a mouth there, facing the cradle;
2. set the other on the floor slate under the bell-stone's hoist;
3. strike the release **on the cradle's beat**: the stone falls ~720, leaves the wall mouth level at
   ~1360 and comes down about 600 on — where the cradle is, or is not.

Measured window: the cradle is under the landing point ~0.4 s, twice a swing (a sweep of release times
rang the bell at 0.25–0.5 s and 2.5–2.75 s into the 4 s swing). A miss: the stone lands, the hoist
takes it back up — try again. Rung: the stone rides the cradle, the bell goes on ringing, the tower
gate lifts.

## Historical construction verification (not replayed in this pass)
Muster off, in two chained runs: spawn → the Refectory (mouths, both climbs, the drop, over the screen)
→ down → the Weight Hall (mouths, the stair, the release, docked, the gate) → the Grip → the two walls
→ the Archive (in under, up the chimney, the wet band on one wall, onto the crown) → over the east wall
→ the Belfry (the band mouth, the floor mouth, the release on the beat, rung, the tower gate) → the end
card ("THE FRACTURED WARDEN").

Changed while verifying: the C-side was first a thrown **knight** (fall into a floor mouth, out of a
wall mouth at ~1300): measured, walking off a higher perch with two dashes reaches as far, so it gated
nothing — the stone cannot be carried any other way; the keystone first sat over the Refectory's last
step (it landed on it); a crate's `y` is its foot (the dock missed it); the Archive's outer wall could
be climbed from outside (now wet outside, hung from 100); the Belfry wall hung from 200 was out of a
jump's reach; the 80-high band lost to the stone above it (a clinging knight is 44 tall and the first
wall found is the one he is on: the band is now 100 high and found first).

## Open
- Owner playtest: whether "the band" reads as the place to put a mouth; whether the Belfry's beat is
  learnable without a sign (the cradle's swing is the only tell).
- With the Muster alive (bot, 7.206): the Archive climb with its gargoyle alive, three of three, 0–1 hits; the rest of
  the Keep's bodies were not bot-verified alive.
