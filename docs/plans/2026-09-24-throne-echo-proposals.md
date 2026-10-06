# Echo encounters — implemented in 7.195.0

This replaces the earlier proposals with the owner's accepted sequence. New Claude/Act Two regions are outside this pass.

## Citadel phase four

The three existing portal/paradox bands remain. Their final hit starts e.echoDuel rather than killing the Tyrant. Q unlocks immediately without healing the knight.

1. Place a Q Echo near him. He approaches, grabs, lifts, then attempts to throw it down. A sword hit during lift/throw interrupts him and scores one hit.
2. Repeat the bait. During the grab he instead turns toward the knight's locked position and attacks it. The held Echo moves behind him and counters for hit two.
3. Transit a personally placed portal pair to create G.combatEcho. It follows player displacement and attacks with the knight. Sword hits from both bodies within .32s score hit three.

He then visibly retreats via the western steps and exits at x40. Void traces remain along the retreat and along the corresponding road to the Right Hand. Actual death/rewards/exit availability wait until the retreat reaches the boundary. This campaign phase does not replace Boss Rush.

## Right Hand rematch

Three required combinations: sword + portal clone; bow + portal clone (actual arrows, .7s tolerance); sword + portal clone + a deployed Q Echo within 280 units. The third body visibly joins the finishing strike. F clears portal clones and mouths without undoing completed hits. The manual Echo remains independent.

## Rooms and gates

- Two Marks, Long Drowning and Divided Stair gates latch once crossed. Only an Echo standing on that gate's plate is consumed; a return wisp shows it rejoining the knight and Q readies immediately.
- First post-Hand crossing: leave Q on the lift at7700, transit the fixed pair into the relay chamber, use Up on the lever at8250, recall to the moving lift, ride to1150 and walk onto the upper span. Both walls are slick. The lever resets the lift and portal route if the anchor is missing; losing the Echo cannot strand the player.
- Q attaches to this lift by object reference, and recall restores the supporting platform so the knight stays aboard.
- The shielded guard at9200 commits its facing through a telegraphed strike/recovery window, allowing recall into its back.
- An optional upper press alcove at10800,y520 contains a deliberate Forge Seal cache. Take it with Up and recall before the press closes. The press deals ordinary damage, resets, and never erases the player's progress. The reward ledger prevents repeat awards and includes it in perfect-entry previews from14.

## King recall finale

After four existing crown fractures, the King survives into a two-conduit phase. Leave Q inside the current shelter, stand near the conduit to bait the marked strike, then recall before impact. His attack breaks the conduit only if the knight actually recalled to shelter. The second shelter swaps sides. A visible floor sweep pressures setup while leaving the shelter safe. Unrelated volleys pause during this phase; ordinary dodging can avoid damage but does not solve it. No heal. Existing portal interference remains in the preceding four cycles.

## Integration and evidence

- Menu: both respec buttons and handlers removed; Start remains.
- Flags: encounter graph now includes manual Echo, portal clone, cooldown, trail and platform-support identity. Runtime JSON round-trip restored phase-four hit count and Q body.
- 59 focused tests: Echo encounters, Abyss King, Void Tyrant, prior Throne cleanup, checkpoint, journey progression and late unlocks.
- Native runtime: three paradox hits enter phase four; Q key places body; bait/lift and turn/counter advance; a normal sword swing with its clone starts retreat; both actual bow projectiles advance rematch; three-body attack finishes rematch; two recalled King strikes finish while non-recalled dodges fail; fixed portal carries the knight into relay chamber; recall lands on moving lift and subsequent frames keep him supported; upper walkway is traversable; cache interaction claims its registered reward; title has Start and no respec buttons.
- Visual review: captured Echo raised beside Tyrant with reaching arm, recall shelter/conduit targeting and visible knight. Existing pixel art remains authoritative.
- No uninterrupted campaign playthrough claimed. Local mirror rebuilt; nothing committed or deployed.
