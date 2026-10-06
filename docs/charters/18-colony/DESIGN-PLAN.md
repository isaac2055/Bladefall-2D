# The Colony (stage 18) — refined 2026-09-24 (7.198.0)

Act Two's third region, Charma Shores II: inside the gate where the King keeps his sick. Tents
on terraces down into a basin, pit fires, smoke, alms-bells; morning now, hazy, the golden
spire up the mountain in the east and the King's stone conduit climbing to it, carrying the
colony's spring away. The Landing Shores' choice carries in, is cured here, and closes when you
leave by the road.

**Code:** `public/bladefall-colony.js` and `public/bladefall-colony-art.js`, registered with the
Act Two core. This pass moved the act-wide cast into the core so every region shares it:
`kit.foes` (the Belled, the Sunguard, bells, silence, the fallen), `kit.follow`, `kit.say`,
`kit.cure`, and in the art core the figures (Belled, Sunguard, the kneeling man — now with a
cured face and a hammer swing), plus MENDED (gold measures that mend) and its HUD.

## The shape (10,800 long; shelves at 300, 200, 100, 0)

| Room | x | Idea | Answer |
|---|---|---|---|
| The Gate | 0–1500 | the colony's first tent, the first of the sick; the gate open behind you | a woman by the gate: the King came through in summer with one hand in a glove |
| The Tents | 1500–5400 | the Sunguard's gilt glasses throw a pool of sunlight that sweeps the ground | tents and pit-fire smoke hide you; a flare warns you for 0.85 seconds before the bell — get into cover and he loses you. Seen, the bell tolls and two conscripts come out of a tent: the fight is the price of being seen |
| Sable's Spring | 5400–7600 | the King's conduit took the spring; the yard gate is hung on the well's counterweight | ring the alms-bell and the conduit's Sunguard goes down to see who rang it — or go over him; two pier rings to the walk; come down hard on the King's tap. Water falls, the bucket sinks, the gate goes up |
| The Conscription Yard | 7600–10300 | four conscripts shackled to posts (each chain 160), driven by a ringer on the bell tower | alone: hook up his tower (you land behind him) and silence him — the shackled sit. With Oren: he breaks the shackles one by one; the colony turns |
| The Road | 10300–10800 | the way up to the palace | the choice closes here |

**The glasses.** Two watch towers (3000 on the second terrace, 4600 in the basin). Each pool
sweeps its span on a slow cosine (9 s and 8.5 s), under its tower and out either side. Cover
every ≤ 200: the tests prove every dash between covers has a window of at least its travel time
plus 0.4 s, from the pool's own formula. A bot that watches the sweep passes both towers 8/8
in 7–13 s each using the tents alone.

**Watch completion.** Defeated watch encounters latch individually; their glasses shutter and
do not summon another wave on a return visit or reload.

**The yard.** A shackled man beaten down cannot run: he yields and kneels in his chain (full
health; killing him from there takes a deliberate string of blows). Silenced, the shackled sit
where they are held; the ringer drops off his tower and runs; the gate guard runs; the road gate
lifts. Freed shackles persist individually. Returning with Oren after silencing the yard
restores the remaining seated prisoners, so the rescue can still be completed.

## The choice, carried in (owner decisions 2, 4, 5, 6)

- **Taken by the hand** (`oren:'helped'`): Oren walks with you. In the tents the sick stand up
  at two fixed gaps (2760 and 4780), holding canvas overhead for extra cover. Open ground
  still exposes you; compassion adds useful refuge without removing the searchlight encounter. At the spring Sable's water cures you both: the grey measures and the one taken
  at the touch come back **gold** (`kit.cure`: gold = 1 + grey), and **MENDED**: a lost measure
  comes back after six seconds unhurt, for the rest of the game (every stage since 7.191.0). The
  flowers on the cloak close into gold stitches. The bandage comes off: it is Oren ("…There. You
  know me now."). In the yard he breaks each shackle while you stay within 420 units of its post; when the last is off the colony turns
  (`colony:'turned'`), the bells stop, "Village Vigil" plays, and the sick come out and stand in
  the road.
- **Walked past** (`oren:'kneeling'`): Sable tells you the man is still kneeling at the gate. The
  gate behind you is a walked seam back to the Landing Shores, where he still kneels — take his
  hand and walk him in. Leave by the road east without him and it is forsaken too (`'left'`).
- **Struck** (`'struck'`): Sable "heard the bell inside the gate", and fills everyone's cup but yours.

## Numbers that are load-bearing (tests/colony-stage.test.mjs)
- Rings (Chainhook 470): pier ← ground 295; deck ← a pier hang 319 (538 from the ground); tower
  ← the yard 453, and its hang sets you on the ringer's platform, behind him.
- The conduit walk (440) and the tower top (380) are out of every jump (147).
- Posts 450 apart with 160 chains: there is always ground between two conscripts' reach.
- Bars: the yard gate until the tap; the road gate until the yard is done.

## Presentation
- Palette: packed earth, patched canvas, bread-coloured stone; warm low light. Only the King's
  things are gold (glasses, tap, gates, Sunguard, spire); only the flower is white.
- Music: "The Waystation Refuge" (−21) under the colony; "The Last Spark of Darrow" while a bell
  rings a fight; "Village Vigil" (−21) once the colony has turned.
- Rest: Sable's Spring (the well; not fast travel). Existing automatic recovery anchors remain;
  the global player-placed flag system is unchanged.
- Tap: split gold slam cap and falling motes; water advances down to the well, then the bucket
  fills and chain highlights travel toward the lifting gate. Sable speaks only within 230 units.
- Oren introduces his hammer during recognition rather than a separate interruption.

## Refinement verification (7.198.0)
Focused Colony, Landing Shores and Palace Path tests cover cover windows, hook reach, route
choices, rescue work and persistence. Browser fixtures reviewed the arrival, actual blanket
cover and flowing spring. A native down input opened the tap; the bucket lifted the gate and
Sable cured two grey measures plus the touch into three gold measures. Local cover stayed safe;
a warning on exposed ground summoned guards, whose defeat shuttered the watch across reload.
Oren freed the first post, waited when the player withdrew, and after a silenced-yard reload
only the other three seated prisoners returned. Advancing with him freed each, turned the
colony and retained the open road. These are targeted fixtures, not an uninterrupted playthrough.

Original 7.190 checks covered seams, bell lure, both hook rings and solo tower silencing;
those are historical evidence, not newly replayed full routes.

## Not yet done
- The owner's playtest (glass timing, yard pressure, whether the cure reads).
- Done in 7.191.0 (`docs/charters/19-palace-path/DESIGN-PLAN.md`): the road east is a walked seam
  to stage 19 (walking it closes the choice, as the card did); the turned colony and Oren march up
  with you; MENDED follows the knight into Act One; the forsaken path's sick fight for the King;
  Level Select asks which road the knight took.
