# L03 — Broken Causeway charter

Status: planning, geometry, content, progression, and automated validation complete. Human feel/readability review remains part of the Level 2 + Level 3 package pass.

## Full-success vision

Broken Causeway is the first boss chapter and the place where the knight earns Dash. It uses only the abilities a fresh campaign owns on arrival: one jump and the Oathblade. It is a physical eastward dead end connected to Black Woods by the same root tunnel in both directions.

The chapter establishes one spatial law: suspended weight is a threat; committed weight becomes terrain and machinery. The Drop Yard demonstrates that law with one recoverable hoist. Chainwalk turns it into a choice between a guarded lower road and a quicker exposed upper road. Counterweight Rise makes precise single jumps and authored combat share the same machinery silhouette. Broken Standard makes the Brute itself the final committed mass.

No portal, wall jump, dash, double jump, or gravity flip is required to finish the level. No random ecology or elite may alter its authored encounter spaces.

## Spatial charter

| Room | Span | Purpose | Recovery |
| --- | ---: | --- | --- |
| Chainwake Camp | 0–2,600 | Enemy-free arrival, Oren and Sable, grounded weight demonstration, direct boss foreshadowing | Continuous floor and entrance checkpoint |
| Drop Yard | 2,600–5,600 | One oscillating hoist commits onto a plate; optional repair catch and coin route | Missed hoist recalls to its authored origin; door latches |
| Chainwalk | 5,600–8,200 | Stable guarded lower road versus narrow, visible upper chainwalk | Both routes remain above continuous catch ground and rejoin |
| Counterweight Rise | 8,200–10,500 | Measured 65 px jump staircase, combat, optional wristguard memory and record | Every miss returns to the room floor |
| Broken Standard | 10,500–14,000 | Quiet preparation, four-step bow perch, three-rivet alarm chain, then the integrated brace/chain/counterweight boss | Threshold checkpoint; the bow remains recoverable, a permanent arena-side stair returns to the firing perch, and missed charges recover locally |

## Brute contract

1. The Brute is genuinely dormant: proximity, movement, melee, spells, and locked
   charged input cannot wake it or reveal its health bar.
2. A fixed **Chainwake Longbow** rests on an authored four-step perch. Its ordinary
   attack line passes over the cracked brace and reaches the alarm chain. Three
   visible rivets provide persistent `0/3`–`3/3` feedback; only ordinary player
   arrows loosen them. The third report wakes the Brute and starts the combat score.
3. Armored attacks deflect and the boss bar says **BAIT THE BRACE**. The Brute
   commits to a readable directional charge. A collision with the cracked brace
   permanently destroys it.
4. The collapse reveals two short wreckage steps and arms the same hanging chain
   used to wake the boss. The Brute is pinned beneath the weight and cannot deal
   contact damage.
5. The player climbs the wreckage and cuts or shoots the armed chain. The
   counterweight falls and breaks the armor completely. No held attack or later
   technique is introduced here: the newly acquired bow is the room's only new verb.
6. The unarmored Brute immediately alternates chase, rush, slam, and recovery. The solved
   machinery cannot be repeated or used as permanent cover.
7. Victory grants permanent Dash, records the zone clear immediately, creates no
   completion portal, and leaves the player free to walk west into Black Woods.

## People and story

- Oren, Causeway Chainwright, explains the exact machinery sequence in plain language and owns the optional persistent repair quest.
- Sable, Stretcher-Keeper, explains the lower/upper route tradeoff without presenting either route as secretly correct.
- The wristguard memory and counterweight record remain optional and undiagnostic.
- The victory correspondence is one brief world-space fragment: **GLOVED HANDS · EARTH · RELEASE**. It does not pause the Dash reward or stack another large dialogue card.

## Acceptance gates

- Five continuous authored rooms across 14,000 px.
- Jump + weapon are the only critical capabilities.
- Camp has zero enemies; all six ordinary encounters have explicit roles, patrol bounds, and notice ranges.
- Drop Yard success opens its door; failure visibly recalls and cannot softlock.
- The bow pickup is fixed, reachable with the current single jump, and fires from
  a supported perch whose horizontal shot line reaches the chain above the brace.
- Crossing into the arena before releasing all three rivets cannot softlock the
  encounter: a fixed four-step stair on the arena side returns to the firing height.
- Non-arrow hits do not increment the alarm. Hits one and two leave the Brute
  dormant; hit three alone starts its wake state, boss bar, and combat music.
- Brace collision, wreckage reveal, armed chain, counterweight transformation,
  and vulnerable pursuit occur in order; Focus remains locked for a later chapter.
- Brute defeat grants Dash, saves completion, creates no portal, and preserves the westward physical seam.
- Compact room/location annotations remain anchored, proximity-bounded, and replayable with Up.
- Reduced-motion and checkpoint behavior do not change the mechanic contract.

Automated evidence lives in [evidence/validation/receipt.json](./evidence/validation/receipt.json).
The validator now runs the real browser game: it equips the authored bow, fires
three natural projectiles, records the dormant-to-awake timeline, forces a brace
collision, fires a fourth natural arrow at the same armed chain, verifies that an
ordinary bow shot damages the now-vulnerable Brute, and inventories the permanent
arena-side return stair. Its
[`two-rivet screenshot`](./evidence/validation/bow-perch-two-rivets.png) is spatial
evidence only; first-read visual clarity and natural-route feel still require the
human package pass.
