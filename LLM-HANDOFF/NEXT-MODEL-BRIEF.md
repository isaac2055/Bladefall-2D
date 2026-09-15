# Bladefall — concise current brief

Project: /Users/computer/Projects/Bladefall-2D Antigravity (moved off the iCloud
Desktop on 2026-09-15; the old Desktop path is now a symlink to it)
Runtime: public/index.html plus public/bladefall-*.js. Build mirror with
./build-deploy.sh. Never deploy to Netlify without explicit authorization.
Read USAGE-POLICY.md; owner explicitly prioritizes token/credit efficiency.

## Current task
Owner beat White Court and found it too easy. Approved a genuinely harder second
phase after the existing three ward breaks: environmental machinery, alternating
high/low frost volleys, shifting ice, a stationary receiver during the committed
heavy-orb return window, and earned melee relief. No hidden last-health assistance.
Implementation is in public/index.html: beginCourtFinal, updateCourtFinal,
courtFinalBeat, drawCourtFinal, updateCourtReceiver and breakCourtWard.
Second phase uses prepare → barrage → cast → return → exposed. Three volleys
alternate low/high/low; speed rises with successful returns; final escalation adds
one committed ground mark. Five-second melee openings. Each return window now fires three payloads, 1.4s
apart with .6s aim warnings; initial preparation is 1.2s. Misses repeat the sequence.
Needlewind final dip has a 25%-tank air crystal at (13020,210), with the normal
Updrafts full-tank override disabled. Final phase now starts at 20% HP (damage is capped there until transition):
condenser ruptures, shield permanently drops, no HP refill. Alternating frost
lanes/ice continue during committed rushes and 1.1s recovery windows.
Frost barrage cadence is 1.4/1.2/1.0s, speed 470/540/610. Rupture fires
every 2.1s: from left, right, left, then upward/downward committed columns
(.8s warnings, horizontal speed 660, vertical 480; no tracking).
Functions: beginCourtRupture, updateCourtRupture, courtFinalDamage.
Level-select saves now preserve session capabilities, quests, zone state and mode
via savedRunSession; Continue restores these before loading the level. Old saves
that already lost these fields need a fresh level-select entry once.
Phase one remains the existing encounter. Attunement is awarded only on real death.
Version 7.101.1 / cache 184. Both changed runtime files are mirrored in
netlify-deploy; no deployment performed. Validation: all seven dependency-free
checks in tests/white-court-final.test.mjs pass, including inline-script syntax.
Browser/full-suite validation was blocked by iCloud-evicted game modules and
dependencies; that blocker was removed on 2026-09-15 by moving the project out of
iCloud (see the last paragraph), but
the browser validation of the new phase itself has not been run yet. Visual readability and difficulty still need human playtesting. Earlier541-test/5361-frame
receipts predate this harder phase and must not be claimed as current proof.

## Stable context
Opening through Warden accepted in substance. Frostfell is authored; White Court
has refuge workers/wheel, aqueduct, water/ice, Glassworks portal bridge, high cache,
gallery recollection/overlook. White Court arrival4800/0; exit15500 requires
Attunement. Public-folder Netlify upload is configured; no deployment performed.
White Court music: Floating Dream exploration, Abnormal Circumstances boss.
Preserve progression, endpoint identities, one-Blood damage and ordinary movement.

## Working discipline
Do not revive the previous giant goal or run TAS searches to certify difficulty.
Use focused mechanics checks, one visual check if useful, then owner playtesting.
Old first-phase-only winning policies/tests need adaptation where their final-death
expectation is obsolete. Do not weaken the new phase to keep old bot inputs green.
Since 2026-09-15 the project lives outside iCloud, so files are no longer evicted
to placeholders that hang reads. Never move it back under ~/Desktop or ~/Documents,
which iCloud syncs. The folder "~/Desktop/Bladefall-2D Antigravity (old iCloud
copy)" is a stale pre-move snapshot: never edit or test in it. netlify-cli 26.2.0
is installed in node_modules outside the lockfile, so prefer npm install over npm ci.
