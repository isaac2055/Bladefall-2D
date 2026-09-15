# White Court implementation status — 2026-09-15

Implementation remains in progress. `DESIGN-PLAN.md` is the full acceptance scope;
passing tests do not replace its remaining design and human-playtest requirements.
`ACCEPTANCE-AUDIT.md` maps each requirement to evidence and outstanding work.
Source: **7.99.0 / bladefall-v179**, local review build. The current
93-asset deployment mirror matches source. Nothing has been deployed.

## Current verification

- Full regression: **541/541**, `node --test --test-concurrency=2`,183.05seconds.
  Log: `/tmp/white-court-full-regression-v7.log`. The final frost-cap draw-order
  fix followed this run; its continuous replay/capture passes, as does the7-check
  baseline/parity rerun. No simulation logic changed after the full suite.
- White Court: **28 focused checks** in `tests/white-court.test.mjs`.
- Six normal-keyboard connector directions, locked Emberdeep door, fresh-page
  campaign reload, two current Rusty Sword approaches, another ordinary weapon,
  delayed finishing, and continuous optional-route checks have separate evidence.
- `npm run release:check`: all93 assets present and byte-identical in the mirror.

## Authored region and traversal

Stage8 is a custom16,000-unit region with six owned rooms. Arrival is4800/0 in a
quiet refuge: Vey at3880, Ada at4380, counter4600, existing rest identity
`white-antechamber` at5100. The local wheel at3240 grants one Forge Seal; the high
cache at7340/420 grants one Vitality Fragment. Workers react to the wheel.

The west aqueduct latch at240 opens the existing reciprocal Frostfell connector.
The Causeway shaft remains at4800. Its Causeway approach is continuously verified
from10450/0 through the added shelves to10980/390 with the earned movement kit.

Thaw Court has real water, a hostile cold emitter, temporary4.5-second ice footing
and a final1.2-second crack warning. Its floor at-30 is above the fall-reset limit.
The ice crossing, thaw and recovery pass. The full optional high route now runs
from the authored arrival to its cache in989frames; replay reproduces the final
player state and actual interaction. A separate positive/negative check proves
the final delayed second jump needs Double Jump.

Glassworks uses a real player mouth and the retained fixed anchor9350/180. A
returned emitted shot hits its moving condenser and permanently freezes the
crossing. Walking across it is verified. The basin floor was corrected from-100
to-30 after an actual missed landing reset before reaching it; recovery now passes.

Petition Gallery has two ground slates, cold emitter11250/350, a lateral receiver
around11980/180, its own permanent cold circuit and an upper bridge at11980/260.
Real two-mouth transport and bridge traversal pass. A334-frame continuous route
from an entrance fixture10820/0 reaches the recollection shelf, interacts with it,
then descends to the12400 checkpoint. Original geometry tests suppress damage;
separate damage-enabled route replays pass without wounds. The high cache is a
metal chest with distinct closed/open states, inspected after actual collection.

The quiet overlook is implemented: ledges12650/90 and12900/190 lead to a white-cloth
railing. Up opens a4.5-second preview of boss, receiver and usable slates. Movement,
jump or attack cancels it; timeout returns the camera. Simulation continues. A
198-frame approach and the viewing period pass without invulnerability or wounds,
with no boss activation, at1440×900 and640×360. Reduced motion cuts to the framing;
the instruction card stays clear of the receiver. Desktop and narrow captures
were inspected.

## Boss and retry behavior

Three successful stolen-spell captures break the wards. Receiver movement changes
from vertical to lateral to two stops. Casts commit to a visible position; later
phases add a staggered shot, local floor frost and targeted ground marks. A real
sword strike on the paddle at13400 requests the next cast but retains its warning.
The arena uses independent player mouths; no fixed anchor silently overrides them.

The first ward freezes a real shallow channel, with dry shelves available before
it. Short sloped banks at13080–13140 and13260–13320 now allow walking recovery in
both directions: the former raised banks could leave a player below the floor.
The final ward stays down after exposure ends, allowing a conventional finish and
retry. Death restores boss, receiver, cold step, glaze, shots, AOEs and pair while
keeping earlier circuits and rewards.

Blink completion now resets `courtBlinkWind` to zero. Its negative remainder had
permanently stopped pursuit; all older stalled-boss victories are historical.
Missed Sorcerer shots now dissipate at horizontal arena bounds. Real returns at
±50 from receiver center capture; ±65 miss. A wrong pair can miss repeatedly,
be cleared/replaced through input, then produce a real capture.

Earlier unassisted/no-Counter receipts (timings precede the entrance visibility fix):

- `evidence/boss-unassisted.json`: Rusty Sword, right entry,39.83seconds.
- `evidence/boss-axe-unassisted.json`: Common Battle Axe,38.47seconds.
- `evidence/boss-missed-finish-unassisted.json`: waits out the final exposure,
  then wins in45.33seconds.
- `evidence/boss-left-unassisted.json`: left entry, real side change and channel
  recovery,66.83seconds, four wounds. This is a narrow survival margin, not balance
  approval. Victory heals Blood; inspect damage logs rather than final Blood.

The probe and combat tests share `scripts/white-court-fight-policy.mjs`. It waits
through hitstop before cycling the pair, lands before placing, rebuilds on the dry
eastern slate after the first ward, and holds jumps. It retains the last30 input
frames to explain failures before checkpoint resets. Default runs are isolated arena
attempts. Live mode forbids loadout/invulnerability overrides and skips the initial
position fixture; it records every input and the maximum ward count before death.

## Current continuous route and visual evidence

`node scripts/validate-white-court-continuous-approach.mjs --boss` passes **5361
frames** from the authored refuge arrival through high cache, real Glassworks
portal/bridge, gallery recollection, all three wards, a Rusty Sword finish, and the
usable Emberdeep door at15497.94. No intermediate resets, health grants, loadout
changes or progress grants; no attempt loss or page errors. Attunement comes from
the real kill. `evidence/continuous-boss.json` stores every input and wound.
The initial stage8 capability prefix remains a fixture. TAS stops at the usable
exit because asynchronous crossings are intentionally unsupported; the normal
connector validator separately verifies that seam.

The live policy chooses the second-phase receiver stop from its predicted lateral
phase, moves clear of the east shelf before jumping away from marks, releases the
portal-clear input after hitstop, and corrects melee facing after crossing the boss.
Earlier failed continuous attempts are superseded; the first failure is retained
as `continuous-boss-first-failure.json`.

First engagement now waits for both combatants to fit onscreen, with24-unit
margins; pursuit remains active. Once engaged, ordinary casts/blinks continue.
The regression checks hidden pursuit without attacks, followed by the full1.05s
visible warning. The paddle fixture places its camera with its combatants.

Primary casts use a halo/long-dashed line; follow-ups use a chevron/dotted line.
Both remain stealable. The300-unit frost patch cycles1s warning/2s ice/3s dry;
a returned spell clears it immediately. No permanent phase-long ice remains.

`node scripts/capture-white-court-phases.mjs` replays the winning inputs muted and
with reduced motion. It still wins and captures nine actual attack/phase states
in `evidence/phase-review.json` and `phase-*.png`. The refreshed first-cast capture
shows both characters and receiver onscreen. Keep the original800x600 simulation
viewport: changing width alters enemy activation and can invalidate a replay.
Exports crop to VW/VH to exclude stale backing-canvas pixels. Close frost/refuge/Glassworks views were also inspected. The slate skin had
covered the active frost: a final icy cap now draws above it while leaving portal
runes visible. Eleven captures are saved; frost/refuge views temporarily center
the camera only while rendering and restore it before simulation. These images
do not establish typical-player pacing.

## Aqueduct approach round trip

`node scripts/validate-white-court-aqueduct-route.mjs` now verifies one continuous
normal-keyboard round trip from4800/0: walk to the240 latch, open/cross to Frostfell,
walk along its650-high summit to the14680 service passage, use the existing
1330 →7220 →14680 service loop, walk back to the14950 aqueduct and return to the
White Court refuge. No endpoint repositioning, invulnerability assignment or
victory fixture occurs after the initial stage8 capability-prefix setup.
`evidence/aqueduct-route.json` records nine legs, no wounds and no page errors.
This proves the physical approaches/service connection for that setup; it is not
an entire campaign or a recalled-enemy pressure/balance claim.

## Persistence and connections

`evidence/connections.json` verifies normal keyboard/automatic-loop transitions:
Frostfell14920/650 ↔ WhiteCourt300/0; Causeway10980/390 ↔ WhiteCourt4800/0;
Emberdeep240/0 ↔ WhiteCourt15500/0. Emberdeep's return door is180/0. Attunement gates
its outgoing door. Endpoint positions and victory are fixtures, not full approaches.

`evidence/reload.json` uses actual page reloads in campaign mode. Open aqueduct,
wheel/cache rewards and Attunement survive; completed boss stays absent. Revisiting
rewards adds nothing. Boss advancement legitimately adds a fragment, so reward
idempotency compares against the post-victory balance. Actual checkpoint death,
rest and zone-state hydration also have focused checks. Annotation display guards
now cover stages0–9, so worker/door/recollection interactions actually display.

## Reproduce and inspect

- `node --test tests/white-court.test.mjs`
- `node scripts/white-court-boss-probe.mjs` with optional `--approach=left`,
  `--weapon=axe` or `--miss-finish`. `--invulnerable` is diagnostic only.
- `node scripts/validate-white-court-aqueduct-route.mjs`
- `node scripts/validate-white-court-connections.mjs`
- `node scripts/validate-white-court-reload.mjs`
- `node scripts/white-court-high-route-probe.mjs`, optionally `--gallery` or
  `--overlook`: local timing search followed by continuous replay. Receipts contain
  inputs and landings; tests consume them. Only the overlook test omits damage
  suppression. TAS render fixtures size the canvas after restoring the bootstrap.
- Render evidence: `gallery-before.png`, `gallery-solved.png`,
  `aim-left-reduced.png`, `aim-right-reduced.png`, `overlook.png`,
  `overlook-narrow.png`, all under `evidence/`.

The refreshed generic room bot (`evidence/generic-bot-current.json`) fails at
segment4 after303.7seconds and30,000 expansions. It commits1551frames and reaches
x10386, on ground10240–10399 before the Glassworks gate. `mechanisms: []` and no
runtime errors. Its approach goal remains13780, not boss victory. This is a bot
failure, not a level softlock: the continuous authored policy solves the gate
through a real portal return and reaches the post-boss exit. Older segment2
failure evidence is historical.

## Remaining acceptance work

- Owner review of the inspected room and attack presentation remains outstanding.
  Close frost, refuge, Glassworks, high route and gallery views are available.
- Review travel with the actual campaign/recall enemy state during combat-pressure
  validation. Physical aqueduct approaches now pass the normal-input round trip.
- Human review must assess the recorded attack transitions in motion; the full
  muted/reduced replay and nine captured attack/phase states are available.
- Complete the requirement-by-requirement design audit. Human play must judge pace,
  legibility and difficulty; neither a script nor the charter's timing estimate
  establishes typical-player experience.
- Refresh final bot/validation receipts as warranted, update charter acceptance
  evidence and the remaining handoff documents, bump version/cache, rebuild mirror
  and perform final release checks. No Netlify deployment without explicit request.


## Local review build receipt

`IMPLEMENTATION-RECEIPT.json` records7.99.0/cache179 source/evidence hashes,
93-asset release parity, baseline7/7 and scoped regression results. No deployment.
Final charter acceptance remains pending owner playthrough; do not use automated
policy timing as the requested typical-player fight-duration measurement.
