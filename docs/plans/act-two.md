# Act Two — the plan the owner accepted (2026-09-23)

Act Two follows the Abyss King, who ran at the end of Act One (Oren went after him; "neither
body is shown again"). It climbs where Act One descended: from sea level to above the clouds,
from storm-night to noon. The owner's starting points came from a Gemini chat with little
Bladefall context and were adapted to the game's Datura-delirium core; the decisions below are
the owner's own answers and override the proposal wherever they differ.

## Owner decisions (verbatim in substance)

1. **The final boss of Act Two is the Abyss King.** His rematch shows his flower-sickness
   further along, which says time has passed (getting the sail, making the crossing). Oren has a
   beard; dialogue implies the time.
2. **Oren** is the kneeling conscript you can help; **Sable** (the Causeway's stretcher-keeper) is
   the prophet.
3. **The Chainhook** is Act Two's one new permanent verb. Region-only mechanics are allowed (the
   way the Updrafts owns the harness).
4. **Striking the kneeling conscript is an immediate forsaken path.**
5. **No "leprosy".** The affliction is the white-flower disease — unnamed, shown as white trumpet
   flowers — because leprosy is harsh and rife with historical connotations.
6. **The Echo stays behind** on the Throne's beach when the boat leaves. **Returning to Act One
   finishes Act Two:** after the King in Daylight, the hydra comes to you — boss music, and then
   it does not attack; it warns you of the trouble your Echo has been causing — and you ride the
   hydra back to the island to look for your Echo. Act Two ends riding the hydra.
   *Act Three (vision only):* flying with the hydra, knight on top, to the white-flower colony;
   told your Echo is hiding within the echoes of the existing levels (the void fragments / rift
   shards); collect them all, beat them all, and a final level unlocks with the Echo at the end.
   The game's true ending is at the end of Act Three.
7. **Keep the stage scaling and the Muster buff**; balance, enemy stats etc. will be overhauled
   later across the whole game.
- Music: the Aerth score (from the 3D Bladefall) may be used.

## The act (five regions, stages 16-20)

| # | Region | What it is about | Set piece | Aerth cue |
|---|---|---|---|---|
| 16 | Thunder Cliffs | a timed voyage on a deck that won't hold still; a taut line is a road | the Chained Hydra | Navigating the Red Wake / Chains of the Deep |
| 17 | Landing Shores | a wreck beach; the tide; the Chainhook | the first conscripts; the choice | The Shore of Broken Ships |
| 18 | The Colony | smoke, bells, the white-flower disease | Sable's spring; the colony turns | The Waystation Refuge -> Village Vigil |
| 19 | Path to the Palace | the climb; mirror beams (light as a portal noun) | storming the Sun Gate | Towering Sea Cliffs |
| 20 | Sunspire Palace | mirrors, sundials, the hoarded water | the King in Daylight | White Marble Palace / The Fallen Champion Duel |

**The choice.** At the colony gate an overseer beats a bandaged conscript who has dropped his
weapon (Oren, unrecognised until the cure). `↑ TAKE HIS HAND` infects you (Blood measures go
grey, never below three usable); walking past leaves him kneeling until you leave the colony;
striking him seals the forsaken path at once. Sable's water turns grey measures gold (Mended:
a lost measure returns after ~6 s unhurt, for the rest of the game), Oren breaks the conscripts'
shackles, and the colony marches with you. Allies change fights, never routes: every gate and
beam has a solo answer. In the final fight the King is untouched until touched from two sides
at once (his Act One sentence): an ally's touch and your strike, or a mirror's beam you route
onto his back. On the forsaken path the sick fight for him.

**Story ledger (inferable).** The "lepers" are the knight's own poisoned company in the sick tent;
the flowers in their bandages are the poison; Sable is the camp physician; the Sunspire is dawn
through dilated pupils; the sundials read 3:4x in full sun. The Act Two choice is the natural
condition for the true ending's line, "He who saved us has awoken."

## Build order (each run stops for the owner's playtest)

0. Scaffold stage 16, the boat crossing, Continue and Level Select, music. **Done in 7.188.0.**
1. The voyage. **Done in 7.188.0.**
2. The Chained Hydra and the Chainhook. **Done in 7.188.0.**
3. Landing Shores and the choice. **Done in 7.189.0** (`docs/charters/17-landing-shores/DESIGN-PLAN.md`).
4. The Colony: infection, cure, the turn. **Done in 7.190.0** (`docs/charters/18-colony/DESIGN-PLAN.md`).
5. The Path and the Sun Gate. **Done in 7.191.0** (`docs/charters/19-palace-path/DESIGN-PLAN.md`), with
   MENDED following the knight back to Act One, the forsaken path's sick fighting for the King, and
   Level Select path choices.
6. Sunspire, the King in Daylight, the hydra's return and the ride that ends the act. **Done in
   7.192.0** (`docs/charters/20-sunspire/DESIGN-PLAN.md`).
7. The whole act on both paths, co-op. (Level Select path profiles: done in 7.191.0.)

Stage 16's own record: `docs/charters/16-thunder-cliffs/DESIGN-PLAN.md`; stage 17's:
`docs/charters/17-landing-shores/DESIGN-PLAN.md`; stage 18's: `docs/charters/18-colony/DESIGN-PLAN.md`;
stage 19's: `docs/charters/19-palace-path/DESIGN-PLAN.md`; stage 20's: `docs/charters/20-sunspire/DESIGN-PLAN.md`.

**How a region is added (7.189.0).** A region is its own pair of files that register with the
Act Two core: `BladefallActTwo.register(i, {level, update, lateUpdate, interact, swing, updateFoe,
voidFloor, cameraFloor, seamSpec, arrival, musicCue})` and `BladefallActTwoArt.register(i, {draw})`.
The core owns the Chainhook (every Act Two region), the white flower (`kit.path()`,
`kit.afflict()`, grey measures on the HUD and flowers on the cloak), `kit.crossTo` and the
frontier card, and (7.190.0) the act-wide cast: `kit.foes` (the Belled, the Sunguard, tolls,
silence, the fallen), `kit.follow`, `kit.say`, `kit.cure`; the art core draws the figures. The
choice lives in `meta.actTwoPath` = `{oren:'kneeling'|'helped'|'struck'|'left', strikes, infected,
grey, greyT, forsaken, mended, gold, orenKnown, colony}` (a Level Select run: `G.actTwoSessionPath`,
seeded by `pickPath(stage, go)` from the `PATHS` profiles; `peekPath()` reads without creating).
(7.191.0) MENDED runs from `everywhere(dt)`, which the page calls in every stage; the gold stitches
are drawn by the renderer's direct `BladefallActTwoArt.hero` call in every region. The forsaken
sick are Belled with `e.zealot`: they never hesitate, and silencing a bell does not stop them.
Stage 20 reads `forsaken` (the sick fight for the King), `oren` and `colony:'turned'` (the sick
touch him). (7.192.0) Light through portals is region code (`bladefall-sunspire.js` `trace`): no
beam had passed through a portal before. The act ends on `meta.actTwoDone` and a card; Continue
returns to the title until Act Three exists.

**Act Three** (7.201.0): the rift shards and the Fractured regions — `docs/plans/act-three.md`. Its echoes
register with this core as stages 21+ (the Fractured Outskirts is 21).
