# Early campaign consolidation — 7.181.0 / cache v262

Scope: opening through Ember Colossus (runtime stages 0–10). Later region content stays for its refinement passes; earned upgrades/Gifts carry forward.

## Implemented
- `bladefall-journey.js` is the one-time authored reward ledger. Existing sealed recollections retain their postgame unlock behavior. Four Vitality Fragments add one visible health point; each Forge Seal adds 6% shared sword/bow power. Reward source IDs prevent farming; old authored advancement sources migrate. Gold payouts, coins and surplus equipment caches are removed from this scope. Required Oathblade, bow, harness and portal acquisitions remain. The Woods mantle grants permanent Ward.
- Level Select initializes a private perfect-entry reward/Gift profile; return-route rewards become available after Frostfell, rather than by the region they inhabit. Selected-level rewards remain unclaimed. Full health and one possible checkpoint charge on entry. Session reward/Gift/attitude state survives save/Continue and remains independent of campaign advancement. Fixed sword/bow bases prevent legacy equipment ranks adding another progression track.
- Earned early Gifts/Echoes are automatic, including Ward, Gale Stitch, combat Gifts and the Colossus's Ember Step. Gathering Thread attracts nearby loose unlocked pickups without pulling authored equipment out of puzzles. No forge, equipment or Gift selection is needed; Journey is read-only.
- Six early shops are one-time workshop/character exchanges, with distinct three-attitude choices, equal core rewards and no healing/stock catalogue. Spark feedback accompanies the exchange. Visits still advance existing quests.
- `bladefall-conversation.js` presents character/object text in a screen-resolution panel over the world: 22px desktop/20px phone, keyboard focus containment, Escape, scrollable touch panel, no time limit. All early annotation, escort greeting and quest-contact paths use it. Fifteen named voices cover the 21 runtime character appearances. Attitudes are saved by character/context, with a remembered response on revisits; choices never disable companion or puzzle mechanics.
- The Sky Kindling quest now uses the restored Choir flue rather than requiring a removed fire weapon. Ilyra/Oren and Nim's authored milestones emit its events.

## Evidence (fixture checks, not a full campaign playthrough)
- 102 focused tests pass: progression, blood/inventory/dialogue, shops, quests, Echoes, Emberdeep, Colossus stage/boss.
- Browser audit loaded every stage 0–10: no coins or alternate equipment; required acquisition objects preserved. Entry health/Gifts rise from 5/0 to 9/13 by Colossus; Colossus enters with all ten preceding capabilities.
- All six workshops × three attitudes: equal one-time reward, reply, return to play. All 21 character appearances: negative response, reply, return to play.
- Live reward checks: four fragments give 6/6 health; duplicate source adds nothing; ordinary kill grants checkpoint charge without gold; Brute reward grants its seal and both automatic combat Gifts.
- JSON save/Continue retains reward/Gifts; Gale Stitch retains 0.72 fuel multiplier. Ward blocks one whole wound over five hits.
- Desktop screenshot reviewed with game behind panel; phone 390px: panel fits 16–374px, 20px text, all three buttons visible. Actual campaign pacing/balance remains for owner playtest.

No commit or deployment. Build mirror rebuilt locally. New module files are registered in the build script and service worker; changed modules carry 7.181.0 cache queries.
