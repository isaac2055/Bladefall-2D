# Battle 42 · The Cloaked Man (stage 43), built 2026-09-26 (7.228.0)

The last fight in the game: a four-phase boss designed by the owner's little brother. The concept sheets are in
`docs/concept-art/cloaked-man/`. For now it is reached only from Level Select: it is the last row of the Base tab,
labelled 42, and always open. The Fractured tab ends with a placeholder row, 41, for the final echo's battle, which
comes right before this fight and is not built yet.

**Code:** `public/bladefall-cloaked-man.js` (the fight) and `-art.js` (the drawing).
- **Stage and zone:** stage 43, zone `cloaked-man`. It is standalone, like the precision courses, so it has no
  seams.
- **Registered in:** `bladefall-campaign.js` (`finalBattle`, `selectTag: '42'`), `-progression.js`, `-world.js`,
  `index.html` (`CUSTOM_LEVELS[43]` and the script tags), `SUPPORTED_STAGES` in the renderer, and `sw.js`.
- **Kit:** the whole journey's. The capability state fills in Gravity Flip, as it does for the Palace, and the
  arena gives it nothing to do.
- **Music:**
  - the road in: `fractured-the-last-spark-of-darrow`;
  - I: `iron-oath-of-the-night-attack`;
  - II: `through-the-void-breach`;
  - III: `fractured-the-black-procession`;
  - IV: `the-breaking-of-the-keeps`.

## The road in (placeholder; the owner will design it)
- Stone from 0 to 900, then a pit of 130: a running double jump, or a dash.
- Two single-jump steps, at 60 and 130, then a wall topped at 200.
- The vestibule and its fire at 2470, and a checkpoint at 2560.
- The arena runs from 2800 to 4600. Bars close behind you when you enter.
- In the arena: two slabs at y 150 (x 3450 and 3950) and two hook rings at y 380.

## The fight
Every blow landed costs one Blood measure. The jaw's snap costs two.

- **Blood:** Level Select's late-journey profile starts you at 5 of 10. The fight fills you to 10 at the stage's
  start and again at the arena.
- **Phase changes:** each gives one measure back.
- **Death:** you come back at the vestibule with full Blood, and the phases you finished are kept (circuits
  `cm-p1` to `cm-p3`).

Each phase has its own share of the bar: 460 / 380 / 540 / 500. An Oathblade blow lands for about 25 here.

**I · THE CLOAKED MAN.** On his feet: purple-cloaked, chained, gloved, no eyes and a faded mouth. These are his
three attacks as the brother wrote them.
- **The dash-slash.** He crouches (0.5 s, with a line on the floor to where he will stop). Then he crosses up to
  620 at 1500/s and slashes, reaching 108. He recovers for 0.7 s. A counter staggers him for 1.1 s.
- **The far slash.** If the slash starts while he is more than 430 away, he vanishes. His ghost shows where he
  will come out, 90 behind you by your facing, and he finishes the slash from there.
- **The bat.** Black, with white-crested wings.
  - It hunts for up to 5 s at 215/s. One blow ends it.
  - If it reaches you, it carries you to him and hovers you over him, and he cuts upward three times, 0.55 s
    apart.
  - Pressing Jump / Attack / Dash five times breaks you free.
- Three blows in quick succession and he steps back out of reach.

**II · UNBOUND.** Aloft, with the sleeves blown apart, a shinier cloak and skeleton hands.
- **The swarm.** He rises and raises his hands. Three curtains of bats roost for 0.6 s, then fall at 360/s. Each
  curtain has one gap, 176 wide, and each gap is within 340 of the last.
- **The gale dive.** A 0.7 s tell with a dashed line. He dives at 1150/s. The landing sends a shockwave along the
  floor both ways (jump it), and he stays dazed on the floor for 1.6 s.
- **The shackle ring.** Below half, ten shards fly out.

**III · WHAT WAS UNDER THE CLOAK.** A spider-like skeleton about five times the knight's height. The skull (96
across) is what you strike.
- **The lunge.** For 0.95 s its legs wring round its own body and its eyes flare. Then it throws itself up to 900
  at 1400/s, hands first, and is stuck for 1.3 s.
- **The jaw.** It rears, and the jaw drops to the floor. It breathes in, pulling you at 150/s (a run outpaces it),
  and snaps shut: two measures if you are in the mouth.
- **The fingers.** Three stabs where you stand, each marked for 0.55 s.

**IV · ALL OF HIM.** The concept's Horizon. The skull rises behind the arena, its far legs cage the sky, and its
hands hold the floor's two ends.
- **The gaze.** A 0.9 s tell with a dotted line. A beam comes down where you stood. Then the eyes stay open for
  2.3 s, ringed, and they are what you strike: from a slab, or with a double jump.
- **The drag.** The hand on your side lifts, then drags across the floor with its fingers 52 high: jump them, or
  stand on a slab. It rests on the far side for 1.8 s, when its knuckles can be struck, then drags back more
  slowly.
- **The maw.** Five teeth come up through the middle of the floor (0.9 s tell). The slabs and the walls are safe.
- **The storm.** Below half, bats pour from the eye sockets in two curtains.

When the last of the bar goes, the skull cracks with light and sinks. The cloak comes down alone, and the closing
card reads "Boss designed by Isaac's little brother".

## Verified (scripted input in the browser, not a human playthrough)
- **The road in:** from spawn to the fight in 12.9 s, with only run, jump and double jump. Both checkpoints taken,
  no falls.
- **Each phase, with the knight standing still:**
  - I: the phantom came out behind him and the bat carried him to three cuts.
  - II: the dive, the shockwave, and three curtains.
  - III: the lunge, the stabs, and the jaw's inhale and two-measure snap.
  - IV: the gaze, the drag there and back, and the teeth.
- **Striking:** blows at the man drain I in about 19 hits. From a slab, the open eyes take IV to the closing card
  (21 hits, about 38 s).
- **Death in II:** back at the vestibule with 10/10 Blood and II kept. Walking back in resumes II.
- **Renders:** headless renders of 25 moments across the four phases were reviewed.
- **Fixed while verifying:**
  - A blow's knockback walked the giant's eye off its skull and out of reach. The eyes are now pinned.
  - The swarm roosted above the top of the view.
  - The bat's black body vanished against the sky.
  - The road's pit and first step were beyond a plain jump.
  - The deferred spawns were closures (TAS snapshots reject functions); they are now plain orders.
- 12 focused tests (`tests/cloaked-man-stage.test.mjs`) run the fight against stub engine hooks.
- **Full suite:** 1238 tests. The failures are 71 that already failed before this change (a pre-change copy of the
  tree gives 1226 / 1153 / 73). Renumbering fixed two stale Level Select tests (`fractured-order`, `rift-shards`).
  Count assertions in `progression`, `zones`, `world` and `campaign` were updated for the 44th stage. The co-op
  exit test fails under full-suite load and passes alone.

## Open
- The owner's playtest: timings, pool sizes, and whether every tell reads at speed.
- The road in is a placeholder, and the final echo (41) is a placeholder row.
- Co-op was not exercised.
- The brother's Phase II had a second attack still to be written; the gale dive and the shackle ring fill it for
  now.
