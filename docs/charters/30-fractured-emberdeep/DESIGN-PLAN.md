# The Fractured Emberdeep (stage 30), built 2026-09-24 (7.210.0)

Act Three's tenth echo: Emberdeep after the Echo walked it backwards. The Foundry is cold, and Oren is
not here.

**The kit** is the one Emberdeep was entered with: jump, the Oathblade, the dash, the twin mouths, the
wall jump, the Counter, the double jump and Attunement.

**Companion Command** comes from the Command Post, where it was, and there is no one to command. The
original's second half is built on Oren, and his relay logic is partly stage-9-only. The original had
no boss; the echo's C-side is a platforming gauntlet.

**The Muster applies.**

**Code:** `public/bladefall-fractured-emberdeep.js` and `-art.js`.
- **Stage and seams:** stage 30, zone `fractured-emberdeep`. The seam `fs-fe` comes from the Sorcerer;
  the east seam opens once the Purge is behind you.
- **Rest site:** `furnace-ash`.
- **Music:** `fractured-embers-of-the-weary-forge.mp3` on the road, and `fractured-the-eternal-furnace.mp3`
  in the Purge. That track was unused in the score; the Colossus's theme is kept for the next echo.

**Engine parts reused:**
- heat slabs (`heatCycle`: molten = gone, glass = slick, stone; they glow in the last 30%);
- slag (`Trap` + `slagCycle`: warns, falls, lands as a 58 step, sinks);
- `Sp` vents, drawn only.

The heat slabs, slag and spouts run only while `v4Region(stage) && stage>=9`. The registration raises
`V4_LAST_STAGE` to 30, so they run here.

**Built here:**
- the spouts (`actSpout`);
- the post;
- the purge's sweep, which returns you to where the purge began, like a fall. The engine's spikes
  only wound.

**Shared changes:**
- **Renderer:** `trap` and `spikes` ask the region's art first.
- **Tests:** every stage test that pinned `V4_LAST_STAGE` with a regex (fifteen of them, several
  capped at 29) now checks it is at least that stage's number.

## The B-side
| Room | x | The original | The echo |
|---|---|---|---|
| The Cooling Road | 0–1500 | the road, the furnace shelter, the first slab | the forge cold, one coal in the hearth; an emberling |
| The Pour Schedule | 1500–4200 | eight slabs over lava. Each sets 1.4 s after the one west of it, so the cool runs east with you | **walked backwards**: nine slabs over the void, each 1.0 s further along than the one west of it. The slab ahead is always the first to melt, so you hop two at a time, over the molten one. Gaps are 160 (a running jump is 148). Spouts pour onto slabs 3 and 6 while they are stone |
| The Slag Stair | 4200–5100 | the Deep Stair, walked down | walked **up**. The forge wall is wet and taller than any jump. Three ledges, 210 apart (a double jump and a dash make 191), and a slag lands under each as a 58 step. The dash that lifts you also carries ~185 across, so each ledge is ~200 across from its slag. Each slag hangs over the far end of its ledge, so you land clear of it. Without the slags, both hops fall short (measured) |
| The Command Post | 5100–6400 | Companion Command; send Oren | Companion Command, and no one to send; a cinderling |
| The Purge | 6400–9150 | three vents fire in order at the Deep Stair's foot | **the C-side** |

## The C-side: the Purge
Everything runs on one 3.0 s clock.
- **The sweep:** vents every 100 along the forge floor rise in a sweep that runs east at 450, faster
  than a run (211, measured), for 0.5 s at each vent.
- **Only the floor burns.** The three slabs over the gaps are refuges, cooled 0.6 s before their sweep
  reaches them and melting again after it, so nobody waits on one.
- **The route:** go on the sweep's heels, board the next slab as it cools, let the sweep pass under
  you, and go again.
- **Getting caught:** the sweep takes you back to where the purge began. There is no dashing through
  it, and a spout stands between the second and third refuges.
- **Why the refuges are needed:** a runner who never stops is caught just past the first refuge
  (measured; about 990 units in, by the numbers).

The first cut ran on a 2.4 s clock and assumed a run of 280. At the real 211 the second refuge was out
of reach between sweeps. At 3.0 it takes 17–19 s with no sweeps.

## Verified (scripted input in the browser; not a human playthrough)
Chained, with the Muster on, from spawn to the end card ("THE FRACTURED COLOSSUS"):
- the Pour Schedule first try (3 hits from the spouts and the slagwright);
- the Slag Stair on the third try (the slagwright at its foot, and the slag's dwell running out);
- the Post grants Companion Command;
- the Purge in one run of 17 s.

Separately, the Pour Schedule and the Purge each ran 3 times out of 3. The Pour Schedule took 9–11 s
with no falls; the Purge took 17–19 s with no sweeps.

## Fractured Emberdeep refinement — 7.211.10 / cache v304
Molten slabs render in the world pass because gone platforms skip the shared platform pass.
Solid slabs show remaining time before melting; refuge brackets mark the safe span. Slag
has a landing footprint while warning/falling and a remaining-dwell rim once landed.
Spout warning brackets and the pouring envelope cover its actual 44-unit damage corridor.
Purge vents gain steady eastward warning ticks and a 30-unit heat envelope. Purge music
state stops on death/completion. Route, collision and hazard timings retained.
18 focused tests pass (Emberdeep, campaign order, player checkpoint). Browser position/clock
fixtures confirmed active-vent rewind to x6250 and standing safely on the first refuge during
a sweep window. Position fixtures granted Command and completed the Purge; both survived
stage reload. Pour Schedule, Slag Stair and refuge renders inspected; no runtime errors.
No full Pour/Stair/Purge traversal or co-op check was repeated. Historical construction
runs remain historical evidence. Local mirror rebuilt; no commit/push/deploy.
Next refinement: Fractured Colossus; inspect its current construction status before editing.

## Open
- Owner playtest: whether the slabs' glow (the last 30%) reads early enough to plan two hops; whether
  "stand on the slab as the fire passes under you" reads without a sign. Steady directional vent warnings, refuge brackets and remaining-solid rims now supplement the glow.
- Companion Command is granted with nothing to use it on. That is faithful to the kit; whether the echo
  should carry Oren is the owner's call.
