## Fractured Updrafts refinement — 7.211.3 / cache v297
Full-height steady amber rails warn before thermal reversal; repeated arrows and brighter
exhale air reveal direction even above the grate. Storm motion/flashes respect reduced motion.
Ceiling teeth now end at their actual lower damage boundary; damage uses player height and
applies downward knockback after the shared hurt response. Dead players cannot trigger teeth
or crown completion. Geometry, kit, breath timings, crystal route and Lung remain intact.
21 focused tests pass. Native browser fixtures checked the First Breath, a Bellows transfer
without damage, and tooth contact (one Blood, downward velocity). Representative thermal and
teeth frames reviewed. No full-level/co-op playthrough claim. Local mirror rebuilt; no deployment.

# The Fractured Updrafts (stage 23) — built 2026-09-24 (7.203.0)

Act Three's fourth echo: Updraft Canyons after the Echo walked it backwards, in a storm at night —
basalt walls, rain driven sideways, lightning. The canyons **breathe the wrong way**: every thermal
inhales (lifts you, as it always did) and then **exhales** (throws you down). The kit is the one
the canyons were entered with: **jump, the Oathblade, the dash** (the dash from the Brute). The
Aerie Pack is gone — its harness hangs empty on the aerie. The Muster applies.

**Code:** `public/bladefall-fractured-updrafts.js` + `-art.js` on the Fractured core. Stage 23;
zone `fractured-updrafts`; seam `fc-fu` from the Causeway's east end; rest site `aerie-cinders`. Music:
the original's own theme, walked backwards (`fractured-canyon-updrafts.mp3`: 8% slower and lower,
dulled, a long echo; made by `scripts/fractured-music.py`), and "Archives of the Archmage" for
the Lung. The renderer gained one hook: a region may draw its own updrafts (`o.actArt`), because the
generic updraft draws rising air even while a column is exhaling.

## Measured kit (browser, 7.203)
Running jump 148 far / 78 high. Jump + dash at the top of it: 373 / 81. Jump + dash straight off
the ground: 504 / 153 (the dash carries the rising speed). Two dashes in one jump: 677. A column
lifts at 330 a second and throws you ~40 past its top. Width gates nothing below ~800 with this
kit — every gate here is a mechanism (the teeth, the breath, the crystal).

## The B-side

| Room | x | The original | The echo |
|---|---|---|---|
| The Rootbreach | 0–2300 | three dash gaps | three gaps over the void, each a different dash: 300 (any dash); 320 **under the canyon's teeth** — the early dash's arc (153) meets them and knocks you into the gap, the dash at the top of the jump (81) passes under; 420 — only the early dash |
| The First Breath | 2300–3150 | Bellows Rest; the Pack | one column over solid floor: go in on the inhale, ride, step off onto the ledge (250) at the top; in on the exhale and it presses you to the floor |
| The Bellows | 3150–3570 | the pack ascent | two columns over the void, breathing against each other: ride the first, **dash into the second as it begins to inhale**, up onto the aerie (720). Measured window: dash 0.1–0.5 s before the switch (the grate flickers for the last 0.45 s) |
| The Empty Aerie | 3570–4520 | the aerie | the rest fire, the empty harness, a shieldbearer and a signaler (the Muster) |
| The Kite Drop | 4520–6440 | Kite Terraces | two terraces down, then 1060 to the choir floor, 460 below: two dashes land ~6354 (short); **the crystal** on the arc's way down gives back the jump and the dash — jump + dash after it lands ~6492. Flyers dive over it |
| The Choir Floor | 6440–7400 | Choir of Drafts | the Muster on the canyon floor: an outrider, a grunt, a linesman at the Lung's mouth, one thorn bed |
| The Lung | 7400–7900 | Needlewind | **the C-side** |
| The Signal Crown | 7850–10400 | Signal Crown | the plinth where the Linked Portal waited is empty; down three ledges to the canyon path, an outrider on it |

## The C-side: the Lung
A shaft over the void. Four columns — left, right, left, right — each inhaling as the last
exhales. None reaches the next: L1 tops out at 290 (+40), L3 starts at 470, and there is no air
jump. So you ride each one and leave it for the next **on the breath** — a dash from the top of the
one you are in, into the next as it starts to inhale — three times, alternating direction, steering
to stay in 100-wide air, then off the last one's top onto the crown (1040). A dash rides through an
exhale (the exhale is skipped while dashing, as the engine skips the lift). The camera looks up in
the two climbs (the knight sits 60% down the screen instead of 25%) so the next column is on screen.

Measured window per transfer: 0.4 s before the switch to 0.05 s after (a bot sweeping the dash time
climbed it from 0.4 to −0.05; it fell at 0.5 and at −0.1). The Bellows teaches the same move with a
lower ledge.

What the player learns: amber rails along the column warn that the next column is about to
breathe in; leave on that warning. Pale upward and rose downward arrows show the current flow.

## Historical construction verification (not replayed in the refinement pass)
Enemies off: the three Rootbreach gaps (plain jump short, apex dash clears A and B, the early dash
under the teeth is knocked into the void, only the early dash clears C); the First Breath (entering
up to 0.6 s into the inhale lands the ledge); the Bellows across a dash-time sweep; the Kite Drop
(the terraces with air control; the crystal route lands, two dashes without it die); the Lung across
a dash-time sweep, crowned; the descent to the end card ("THE FRACTURED MARKSMAN").

Changed while verifying: columns resized so each ride is ~0.9 s of the 1.4 s inhale (the First
Breath's first 380 left a 0.2 s entry window); ground under the First Breath (a drift out of the
column fell into the void — wrong for a lesson); the aerie lowered twice (720) and brought closer
(a 3-unit miss off the column; a late arrival spends ~0.3 s just stopping its fall); the choir floor
moved to 6440 and the third terrace cut (two dashes cleared the old drop: the crystal gated nothing);
the Lung became four columns; the camera framing.

## Open
- Owner playtest: the breath's readability (the directional air and steady amber warning) without a
  sign; the Lung's strictness; the teeth's knock-down is lethal over the gap (by design — say so if
  it reads unfair).
- With the Muster alive (bot, 7.205): the choir floor, 3 kills for 4 hits in 10 s; the aerie's shieldbearer, passed with
  a jump-dash for 3 hits (a naive bot cannot beat its shield head-on); the Kite Drop's divers cost 2–3 Blood and the
  crystal route still lands.
