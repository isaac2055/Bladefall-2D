## Fractured order and Causeway refinement — 7.211.4 / cache v298
Level Select, map columns, forward/backward seams and transition graphs now follow the originals:
Outskirts → Woods → Causeway → Updrafts → Marksman → Keep. Stable stage IDs preserve save identity;
nextEcho orders by source region. New connectors: fw-fc, fc-fu, fm-fk; fu-fm retained.
Causeway: a mandatory bow-release/weight gate after the Standard teaches the boss mechanism.
Persistent practice and yard weights and crushed wreckage restore at floor height with solid
collision. Falling masses show a ground warning; matching cable/mass colors and severed releases
clarify the target. Iron Echo art uses world scale and a lowered charging body; the last-count
stamp marks its tracked target. Dead actors cannot advance the fight or take the bow.
47 focused tests pass. Browser fixtures: native bow pickup/shot opens the lesson without damage;
reload retains the gate and grounded weight. Native jump/shot completes one boss crush without
damage; reload retains the grounded wreck. Rendered lesson, warning and boss frames reviewed.
Native Woods exit reaches the corrected Causeway boundary; TAS intentionally stops at seams,
so transition plans were checked separately in both directions. No full-level/co-op claim.
Local deploy mirror rebuilt; no commit/push/deployment. Next refinement: Fractured Marksman.

# The Fractured Causeway (stage 25) — built 2026-09-24 (7.205.0)

Act Three's third echo: the Broken Causeway after the Echo walked it backwards. Night, a rust-red
sky; the machines running backwards — the hoists carry their masses out over the road and let them go
on whoever walks under. The kit is the one the Causeway was entered with: **one jump and the
Oathblade** (no dash — the dash was the Brute's). The **Chainwake Longbow** waits on the Broken
Standard, as it did (`KeyB` swaps bow and blade). The Muster applies.

**Code:** `public/bladefall-fractured-causeway.js` + `-art.js` on the Fractured core. Stage 25; zone
`fractured-causeway`; seam `fw-fc` from the Woods; rest site `chainwake-embers`; the east seam
opens once the Iron Echo is buried. Music: the original's themes walked backwards
(`fractured-the-iron-causeway.mp3`; `fractured-iron-juggernaut.mp3` for the fight).

The engine's Brute is not reused: its `killEnemy` branch grants the dash, commits a stage-2 clear
and swaps a gift; its machinery (traps, repair catches) is tied to stage 2's quest state.

## Masses
A mass hangs from a hoist (drawn with its chain, and its shadow on the deck). Walk under one and its
chain **rattles** (0.35 s) and it falls (2600 g) — crushing you if you are still under it (2 Blood).
Landed, it is a 60-high block (one jump) until the hoist takes it back up (2.4 s). A mass with a
**release** instead falls at once when an arrow cuts its release.

## The B-side
| Room | x | The original | The echo |
|---|---|---|---|
| Chainwake Camp | 0–2200 | the camp; a teaching trap | two masses over the road: run under without stopping (measured: no hits), or bait one down (step back as it rattles) and jump the block |
| The Drop Yard | 2200–4400 | drop the hoisted trap onto the plate | the yard gate is held by a plate; a hoist sweeps its mass over it and **lets go only over the plate, on someone standing there**: stand on the plate, step off as it rattles |
| The Chainwalk | 4400–6600 | spikes and an upper route | three thorn beds (down 1.6 s; a 1.0 s crossing), an outrider, a flyer, a grunt |
| The Counterweight Rise | 6600–7620 | two lifts in counter-phase | four lifts over the void, 40–70 apart, rising and falling 60 against each other: cross where two meet |
| The Broken Standard | 7420–7620 | the bow on its perch | the Chainwake Longbow (↑ TAKE THE LONGBOW) |
| The Iron Echo | 9260–10220 | the Brute | **the C-side** |

## The C-side: the Iron Echo — bait the committed charge
The Brute's echo: "It was a man in armour once. Now it is the armour, walking." **Nothing you carry
hurts it.** The court is 960 across, a **buffer stop** (64 high — you jump it, a charge does not) at
each end; three masses hang over it: **A** over where a charge west stops, **C** over where a charge
east stops, **B** in the middle. Each has a **release** post ~200 from it on the open side; along the
floor they run rA, rB, B, rB, rC — the first release in your line is the one your arrow hits.

| Move | Tell | Answer |
|---|---|---|
| Hunt | walks at you | outpace it; stay in its reach 1.1 s and it **shoves** you out (0.55 s tell) — and then it has room to charge |
| **Charge** | stamps (dust off the deck, the slit flares: 0.8 / 0.7 / 0.6 s) | it commits to a direction until something stops it. It charges head-down: **jump it** (its charge reaches 52; your jump 78) — stand before a buffer stop and it runs into it |
| Daze | against a buffer (or wreckage): 1.7 s, sparks off the helm | turn, and from the ground shoot the release of the mass over it: the mass falls at once and **crushes** it |
| The last count | it charges to **where you stood when it stamped**, and digs in there for 1.8 s | stand under B when it stamps; leave on the side it is not coming from; shoot that side's B release |

Three crushes and it stops trying; the east gate lifts. **What a mass crushes, it stays on** — the
court fills with wreckage, and wreckage stops a charge too. Crushes are latched (they survive a
death); a death puts it back to sleep. Off the screen, a chevron at that edge pulses with its stamp
and streaks with its charge.

Design lineage: the original Brute's committed charge turned into terrain; Hollow Knight's
"bait the charge into the wall" and Dark Souls' "use the arena"; the last count's locked target as
the Hammerfall's lesson made spatial.

## Historical construction verification (not replayed in this pass)
Muster off, one continuous run: the camp (run through, no hits), the yard (the mass on the plate, the
gate), the Chainwalk (no hits), the Rise (four lifts and the perch, single jumps), the Longbow (blade
stowed, arrows at 734 u/s), the court (A → C → B in 11.7 s with no hits, three runs identical), the
wreckage jumped, the east gate, the end card ("THE FRACTURED KEEP"). Enemy HP in every echo now scales
by the original's stage (see below).

Changed while verifying: the court's bulkheads were 300-high walls (you could not enter; now buffer
stops); the Echo was 84 tall against a 78 jump (the bait was impossible; now it charges head-down);
the releases were cross-wired to the far end (a 1.4 s arrow flight — longer than the daze); masses
under a release rattled before falling (the rattle is for traps); standing close deadlocked it (the
shove); the court was 1620 across (its stamp was off the screen; now 960, plus the edge tell); the
Rise's first gap was 620 (no dash in this kit).

**Engine (shared) change:** `spawnEnemy` scales a body's HP by the echo's SOURCE stage (not 21+'s ×3)
and rolls no elite affix in an echo — each echo's init sets `G.actTwo.echoSource`.

## Open
- Owner playtest: the stamp's readability; whether the release ordering ("the first in your line")
  reads without a sign; the fight is short once learned (a bot does it in 12 s).
- With the Muster alive (bot, 7.205): the Chainwalk's outrider killed; the diving flyer stalls a naive melee bot (13 hits)
  — a player with the blade answers a dive; worth watching in the playtest.
