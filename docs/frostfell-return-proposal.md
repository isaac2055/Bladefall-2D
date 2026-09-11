# Frostfell finale and the changed return

Status: discussion proposal, 2026-09-10. No gameplay implementation authorized by this discussion. The owner found the first Frostfell pass uneventful and wants a more substantial Double Jump finale plus a thematic change that makes the long return interesting. Current runtime remains as documented in the Frostfell charter.

These notes supplement the master vision, progression constitution, level charters, and owner decisions. The Gemini observations below are useful secondary review prompts, not a replacement design constitution or a mandate to reopen completed levels.

## Implemented 2026-09-11: the recall on the return itinerary

The world-wide encounter pass proposed below is now implemented for the four
regions of the actual return, Warden, Outskirts, Black Woods and Broken
Causeway, as `MUSTER_ROSTERS` in `public/index.html`. The event has one source:
Frostfell's `frost-muster` circuit, read by `musterRecalled()` from any zone.
Each region installs its roster once, by stable entity id, before zone
hydration, exactly as Frostfell does, so deaths persist the ordinary way and a
reload never duplicates a post. Nothing existing is multiplied. Three recall
archetypes carry the difficulty as behaviour: the shieldbearer (a shield with a
turn delay, walked around or Countered), the linesman (ranged cover), and the
signaler, which winds up visibly and wakes the dormant posts within earshot
unless struck first. Raised standards mark the occupied posts, and Orra, Oren
and Olan each have one recalled line. `tests/muster-recall.test.mjs` proves
placement hygiene, idempotent installation through the real hydration hook,
the signaler's call and interruption, and the dialogue; the traversal bot
completes the recalled Outskirts and reaches the Brute's threshold on the
recalled Causeway with the return kit. Rewards, caches and shortcuts for the
return remain the next pass.

## Subsequent scope decision

The owner subsequently authorized the platforming finale and physical engine only. Those are now implemented. A subsequent request also authorized cinematic activation and enemy escalation within Frostfell, now implemented; the world-wide encounter pass remains future work. The owner explicitly chose surprise, superseding the foreshadowing suggestion below: do not add hints warning about the later enemy change.

## Proposed finale: the Muster Engine (working name)

Keep the protected Double Jump acquisition, then extend the court into a frozen signal tower. The player restores a road mechanism to reach the old high shaft; its activation also carries an old military recall through the world. Bells answer in the distance, empty posts become occupied, and familiar soldiers respond as organized patrols. Tie this to the existing military delirium through sound, insignia and repeated gestures; do not explain the diagnosis. Foreshadow that restoring the line will recall its sentries so this feels like a consequential action rather than an unexplained punishment for earning an ability.

The finale should be an actual platforming sequence, with three distinct beats:

1. A broken stair teaches delaying the second jump. Raised shelves and horizontal gaps require it; tall slick faces prevent wall-jump bypasses. Early mistakes land on a recovery shelf.
2. Icy platforms require braking and choosing where to spend the second jump. Fixed ice spikes make overshooting dangerous; dry landing pockets let the player reset. Keep hazards legible and avoid blind leaps.
3. A final ascent combines those skills with periodically active ground vents or ice bursts, clearly warning before activation. Put a checkpoint before this challenge and a safe landing at the mechanism. Avoid stacking a mandatory precision jump with an unseen ranged attack.

Tune jump distances against actual movement and portal capabilities, rather than nominal jump height alone. Alternate horizontal and vertical demands; do not make every gap maximal. Check the route with and without momentum and verify that existing portal tools cannot skip the required lesson accidentally. Intended clever shortcuts can remain.

Activation permanently changes the campaign encounter state and opens an immediate descent/service return to the refuge. The player should not repeat the same ice gauntlet backward. A first small changed patrol after the safe landing demonstrates the new rules. Preserve all earned capabilities, solved gates, checkpoints, quests, dead bosses, NPC rewards and shortcuts. No enemies should materialize inside the player, a shop, or a rest site.

## The long return as a second encounter pass

A world-wide change can affect ordinary enemy rosters throughout the campaign, but each region needs authored encounters. Avoid merely multiplying every enemy's HP, attack speed and count. Keep encounters reasonably quick; spend difficulty on behavior, complementary roles and positioning. Never upgrade difficulty again on every reload or reactivation.

- Warden / gaol return: surviving guards work in pairs, with a deliberate flank or ranged support. The defeated Warden remains defeated.
- Outskirts: recognizable patrol routes now contain a few coordinated groups. A new signaler can alert nearby soldiers until interrupted. Keep settlements safe.
- Black Woods: introduce an enemy that can contest a raised route or flank across a gap; mix it sparingly with existing ground enemies.
- Causeway: shielded advance plus ranged cover asks for Counter, portals, and Double Jump together. The new high route supplies useful alternate approach angles.

Density should rise at chosen combat spaces, with travel and discovery between them. Telegraph intelligence: a shield visibly turns, a signaler winds up, a flanker commits to its route. Avoid perfect tracking or instant reactions disguised as smarter AI. New variants need recognizable silhouettes and a safe first introduction.

Backtracking also needs new access and payoff: Double Jump shortcuts, previously visible caches, changed NPC reactions, a few useful rewards, and physical evidence of the recall. Avoid recreating the entire outward trip as mandatory combat. Retain discovered-anchor travel; players may trade optional encounters/rewards for convenience. Do not disable established travel just to enforce repetition.

Initial implementation, if later approved: one permanent world event; a complete Frostfell platforming finale; a small shared set of new enemy roles; and authored return encounter sets for the actual Frostfell → Warden → Outskirts → Woods → Causeway itinerary. Apply that event consistently to other campaign rosters as they receive their own authored passes, without claiming unbuilt encounters already exist. Exact roster coverage, signal mechanism name, and tuning remain decisions for the implementation scope.

## Ancillary design observations supplied by Gemini

1. **Rewards should change access or play, not only stats.** Passive boss echoes are fine alongside meaningful permanent traversal milestones. Bladefall already has a separate capability sequence: Warden gives Counter, Frostfell gives Double Jump, Frost Sorcerer gives Attunement, and Ember Colossus gives Downward Strike. Audit whether each milestone has a nearby demonstration and later world use before adding another ability. Gemini's example: Ember Step could burn roots or melt ice. Treat this as an option, not a decision: mandatory access must never depend on equipping an optional echo or compete confusingly with Attunement's established role.
2. **Avoid waiting-room bosses.** Frost Sorcerer and Ember Colossus should provide frequent opportunities and player actions that provoke a useful state. Missing one payload should allow a quick retry. Example: strike a valve or trigger a geyser to create coolant while the Colossus charges. Respect acquisition order: a fight cannot require Downward Strike if that fight awards it. Active setups must carry positioning or timing tradeoffs so they do not become an effortless stun loop.
3. **Reward portal understanding without pixel-perfect capture.** For Void Tyrant's proposed orb spread, use generous height bands, a visible catch area or forgiving angles. Preserve meaningful mouth orientation and positioning; accept a strategically correct setup despite small alignment error. A clear near-miss and recoverable retry are preferable to opaque rejection during bullet hell.
4. **Teach projectile redirection before testing it in a boss.** The owner confirms Bladefall already does this before Hollow Marksman. Preserve and articulate that successful progression; this is not a request to add duplicate tutorials or reopen Brute/Marksman. General principle: safe isolated lesson, mixed environmental use, then pressured boss application.

## Future verification prompts, not work ordered now

Prove the Double Jump requirement with actual inputs; check readable ice landings, spike collisions, checkpoint recovery, and shortcut travel. Verify the world event triggers once and survives death, rest, reload, and zone streaming; test old saves. Verify changed encounters cannot resurrect bosses, re-lock routes or overwrite NPC/quest progress. Play the actual long return for pacing and novelty; frame-level TAS reachability alone cannot prove it is fun.
