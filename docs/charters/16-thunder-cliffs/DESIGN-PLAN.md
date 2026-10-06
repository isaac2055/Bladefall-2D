# Thunder Cliffs — current design (7.196.1 · 2026-09-24)

Stage 16, Act Two's first region. Refines the existing voyage and chained Hydra;
keeps the stable deck, three-country ship, freeing the beast, and departure to Shores.
Code: `public/bladefall-act-two.js` and `public/bladefall-act-two-art.js`.

## Voyage and the Act One bridge

- Push-off: 9 seconds, first small swell at 3. Jumping uses the familiar platforming kit.
- Red Wake: 33 seconds; separated swells, then crackling iron, then combinations.
  Lightning gives 1.6 seconds of warning. Waves roll, shed spray and leave foam.
- Rigging: 39 seconds, three breakers instead of five repetitions. The sail pulls the
  rideable lines taut well before each breaker and keeps them usable through passage.
  Dash up the rope to the yard (270); the breaker (262) clears raised decks plus double jump.
  Gulls and a mast strike add pressure after the first breaker.
- Tow: seam dash or existing slate portals reach the fouled wreck. Slam the visibly split
  gold windlass cap, recalling Act One's slam vocabulary. It releases Oren's Chainhook,
  automatically equipped to A (or the player's binding), with one discovery explanation.
  The wreck drifts only 160 units before holding; three bright iron rings at 3120, 2700,
  2240 teach successive hooks. The last drops directly onto the forecastle. The wreck
  waits for the player to return, so learning A is not a blind sinking countdown.
- Chain Gate: retains low-jump/high-stay-down sweeps, lightning and gulls; then docking.
  Leg recovery remains. No new checkpoint flags or route signs.

## Hydra: evade, take the chain, slam the lock

Every committed bite/storm lunge now strains the chain; no hidden requirement to stand
outside an invisible radius. Near baits cannot send the usable collar under the quay.
The bright collar is an A target within the normal 470 range; the existing dash-onto-chain
route remains valid. Both carry the knight above the staple. The gold split cap and
falling motes indicate slam, matching the wreck windlass. Two strikes free each head.

- Bite: 3.4-second strained opening.
- Tide: wave and 3.4-second chain opening, with occasional lightning pressure.
- Storm: three warned strikes (1.2/1.55/1.9 seconds), then a distinct wind-up/lunge.
  Chain stays taut 2.6 seconds and begins crackling at 1.7; ground swells add pressure.
- Completing an ascent earns 1.8 seconds to slam even if the chain relaxes. Camping the
  lock cannot earn another hit. Finished heads latch and set ordinary encounter recovery
  near the next head, without healing. The camera keeps high locks and quay visible together.

The final release, broken pier and three-hook return aboard remain. Old saves already
past the Tow receive the moved unlock; the old quay relic remains a compatibility fallback.
Later Act Two regions keep the same hook interface and range. The Hydra's later friendly
return and the Echo left on the beach remain intact.

## Evidence / limits

46 focused Act Two tests passed; the 11 Thunder Cliffs tests passed again after final timing/recovery changes; live private fixtures exercised first-wave
stand/jump, dash up rigging, windlass discovery, all three training hooks and safe deck drop,
and each Hydra head's hook/ascent/slam through release. A failed storm attempt also exercised
recovery into phase three. Fixtures repositioned between encounters; no uninterrupted
human-style voyage or no-damage victory claimed. Representative wave and Hydra renders
reviewed, including corrected vertical framing. Owner pacing/feel feedback remains valuable.

Final-build checks also confirmed the old post-Tow save unlock, two storm locks with
lightning evasion (surviving with eight Blood), release/pier break and the helm requesting
the Landing Shores crossing. The private TAS boundary intentionally stops the crossing.
Local mirror rebuilt; no commit, push or deployment.
