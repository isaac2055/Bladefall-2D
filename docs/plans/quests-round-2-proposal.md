# Five more quest stories, in Explore and Ascend

Proposal for Isaac · 2026-10-23 · awaiting approval. No quest implementation, geometry edits, or new voice generation is authorized by this document. These are five paired stories: five Explore quests and the same five characters and stories adapted to Ascend. The Outskirts and the three already reworked regions stay outside this proposal.

These replace the existing marker errands in the chosen regions after approval. Conversations are linear. Every reward comes from completing the optional quest; none heals. NPC travel is shown on screen. Ground hazards and attacks stay on the floor. Any change to collision, tile maps, exits, platforms, or device physics needs Isaac's separate approval before implementation. The road changes below are visual and optional ride access only; recorded road routes must keep working.

## 1. The Updrafts · The Blind Cartographer

The Cartographer wants to finish a wind chart before leaving his desk. His instruments agree with one another and disagree with the living trees. The thing he calls interference turns out to be the coast wind he has spent years trying to describe.

**Explore (region 3)**

1. **Route** the existing channel through a portal into the upper measuring funnel, climbing away from the desk to sight the stream. Wind plus an instrument receiver gives the familiar portal current a new purpose.
2. **Chase** his escaped measuring ribbon along the existing gust corridor, catching it during the slack between gusts. It follows a deterministic path with broad catch windows; it does not require perfect timing or a new platform.
3. **Tune** the hanging chimes by sending the current through them from the canyon side, using the same portal pair in the reverse direction. Match the ribbon's visible rhythm, with sound as an additional cue.

**Ascend (world 4)**

1. **Ride** the current through `cl4-u4-q-channel` and catch the ribbon at a selected `routePath` point; catch windows are based on the knight's reachable route, not a floating decoration.
2. **Settle** the ribbon against the funnel in `cl4-u4-q-funnel` by approaching during the gust's lull. The existing wind does the movement; no portal ability is added to a world whose kit lacks it.
3. **Carry** the reading back through the branch and **sound** the chimes at the intended high point of `cl4-u4-choir`, where the Cartographer can hear outside air.

**Turn and giver:** The ribbon catches on a living branch outside the instruments' sheltered line. It pulses to a different rhythm there. The Cartographer walks his desk out to hear it himself, visibly following the accessible floor; he does not teleport to the cliff.

**Afterwards and rewards:** Explore unlocks the region's existing kite flight ride, with its launch at the outdoor desk. No extra stat reward is needed. Ascend awards a heart and dresses `cl4-u4-choir` with the moved desk and chimes; its winds and exits keep their original behavior.

**Proof and risks:** Check forward and reverse receiver routing, ribbon loss/retry, generous catch windows, silent play, save/reload and exactly-once reward. In Ascend assert every quest spot belongs to `routePath` and prove a recorded gust traversal can catch it. Watch must ignore the ribbon. Avoid wind physics, the Crown and boss geometry; if the desk cannot move safely along existing ground, shorten its visible walk rather than add a ledge.

## 2. Hollow Marksman · Borrowed Courage

The Recruit thinks a lost helmet will let him cross the firing lane. Fetching it reveals the split through its crown. His eventual courage is moving while afraid, with someone reading the volley beside him.

**Explore (region 4)**

1. **Recover** the helmet from the existing upper shelter beyond the first firing lane. Use the region's volley rhythm to reach cover, rather than collecting it beside him.
2. **Escort** the Recruit west to east between existing shelters. He keeps the knight's pace and automatically waits at cover when the knight stops; no repeated signal button and no walking backwards to collect him.
3. **Brace** the discarded helmet on the last floor-level release so a volley rings against it while both of you cross the final safe interval. This combines a carried object with the firing device rather than adding another enemy.

**Ascend (world 5)**

1. **Climb** `cl5-m5-q-stair` and **recover** the helmet at a route point in `cl5-m5-q-top`.
2. **Return** it to `cl5-m5-release`. A visible hole and a shot striking the empty helmet reveal the turn.
3. **Cross** the existing room's firing windows beside the Recruit. His movement follows the same proven route samples as the knight, with visible waits at safe samples; deaths reset only the unfinished crossing.

**Turn and giver:** The helmet will not protect him. He tests it against a shot himself, then elects to keep walking. He physically carries it to the release and takes the far watch post after the crossing.

**Afterwards and rewards:** Explore opens the existing ballista throw shortcut at his new post; a weapon boost fits his gift of a spare, better maintained blade, if progression budgeting permits it. Ascend grants a heart and changes the dressing of `cl5-m5-release`: the helmet hangs over the completed crossing and the Recruit watches from the far safe perch.

**Proof and risks:** A straight crossing with pauses must succeed; test standing still, sprinting ahead, one mistimed volley, death, partner completion and reload. Verify the helmet cannot block unrelated projectiles or trivialize the Marksman fight. No boss arena or projectile timing changes. Ascend NPC traversal needs a dedicated route proof before approval of implementation; if safe waits are absent, revise the proposal rather than alter geometry.

## 3. Emberdeep · The Quota

The Maker and Breaker both believe the other is falsifying the counter. One tagged scrap reveals that their entire shift has been passing the same metal between them. They make a place to sit while the line finally does something useful.

**Explore (region 9)**

1. **Tag** one loose scrap at the far conveyor loading point, then follow it through the moving line. A bright identifying mark makes the machinery readable without a dialogue explanation.
2. **Divert** that scrap with the existing conveyor/portal combination into the return chute, timing the transfer between the stamping cycles.
3. **Catch and seat** the returning scrap in the counter's maintenance cradle while the Breaker holds the chute. It becomes a harmless circulating proof piece; the rest of the line continues unchanged.

**Ascend (world 10)**

1. **Track** a tagged piece through `cl10-e10-q-chute`, catching its transfer at a route point after the existing machinery crossing.
2. **Lift** the piece up `cl10-e10-q-loft` using the room's existing movement sequence. A dropped piece returns to the last safe quest sample.
3. **Feed** it to the side counter back in `cl10-e10-line` and **hold** the maintenance catch through one complete visible stamp cycle. This is a machine task at an existing safe spot, not another marker interaction.

**Turn and giver:** The mark comes back beneath an apparently new count. Both workers see it; neither is the culprit. The Breaker crosses to brace the return chute, the Maker lays down the tally board, and they sit together after a visible short walk.

**Afterwards and rewards:** Explore unlocks the existing conveyor cart ground ride and a forge seal, earned by making one useful part off the books. Ascend gives a heart and adds the circulating tagged piece and two resting workers to `cl10-e10-line`. It does not change the road's machinery cycle.

**Proof and risks:** Verify the same tag survives the complete loop, receiver order matters, missed stamps can retry, and reload cannot duplicate the seal. Assert deterministic device phase and unchanged watched routes. No conveyor speed, collision or Colossus arena edits. A new noncolliding quest scrap must not enter the normal crate solver or TAS random stream.

## 4. The Inversion · Tea on the Ceiling

Wendell and Ottilie want their tables joined across the broken landing. Their idea of a straight journey differs by half a turn. Their tea finally meets in the middle when neither has to declare the other's floor wrong.

**Explore (region 11)**

1. **Rescue** the rolling tea caddy on the existing courtyard shelf by flipping gravity before it reaches the shelf's edge. It resets visibly to its last safe shelf if missed.
2. **Anchor** the caddy in a recess, then **invert** the room to retrieve the cups from the opposite surface. The pot must be parked before a flip; holding it through the flip spills it and offers an immediate local retry.
3. **Link** the two table ends with the region's portals, then **slide** the closed pot through. Each neighbour catches it on their own floor, shown in the world.

**Ascend (world 12)**

1. **Intercept** the caddy at a route sample in `cl12-i12-q-shelf`, using the existing inversion sequence to reach its surface.
2. **Park** it at a safe route sample in `cl12-i12-q-service`, **flip**, and retrieve the cups on the intended opposite-surface route. The caddy is a quest item, not added solid geometry.
3. **Deliver** both to the meeting surface in `cl12-i12-court`. The neighbours tip a shared tray between their orientations as the knight completes the room's existing gravity traversal. Use the world's existing kit; do not add a portal power for this adaptation.

**Turn and giver:** The caddy rolls toward the ceiling resident instead of the floor resident. They each catch it and each insists they saved it from falling. Both move their tables to the surviving landing edges on screen.

**Afterwards and rewards:** Explore opens the existing ceiling blink shortcut, framed as passing through their joined tea tables. No extra stat reward. Ascend grants a heart and adds the shared tray and moved tables to `cl12-i12-court`; the collision and gravity rules remain unchanged.

**Proof and risks:** Test both orientations, park/flip/retrieve order, spills and unlimited local retry, inverted respawn, and persistence. Ascend points must be verified in upright coordinates against the intended route, including ceiling positions. The falling caddy must never be a solid blocker. No new floor, midair standing spot, boss change or gravity physics change without a separate request to Isaac.

## 5. Thunder Cliffs · Half a Charm

Hallam asks for his father's brass charm from the rigging. A stranded sailor has tied it to a torn safety line. Returning it immediately would take away the one thing keeping that sailor's hands steady.

**Explore (region 16)**

1. **Pursue** the flashing charm along the existing rigging with the Chainhook. Wind swings it between reachable hanging points; it pauses long enough to catch without a precision reflex test.
2. **Tension** a slack line by holding one hook position while Hallam takes up the other end on deck. The wind's swing exposes the knot, revealing that the charm is attached to someone.
3. **Guide** the sailor down through the existing hook landings, then **separate** the charm at the deck cleat while Hallam holds the line. Neither person is forced to abandon it in a conversation choice.

**Ascend (world 16)**

1. **Swing** through `cl16-t16-q-rigging` to intercept the charm at a route sample, using the existing hook sequence.
2. **Hold** the line at a safe intended-route point in `cl16-t16-q-charm` while the stranded sailor transfers their weight; the line's visual sag shows progress.
3. **Descend** with the sailor to `cl16-t16-sailors` and **split** the charm against its cleat. The NPC follows a proven, slower version of the knight's route; they do not teleport between rooms.

**Turn and giver:** The charm is a makeshift safety fitting. Hallam sees the sailor, takes the lower rope himself, and walks them to the deck bench. They agree in linear dialogue to carry half each; the split happens at the physical cleat.

**Afterwards and rewards:** Explore unlocks the existing storm sail zip ride. A vitality fragment fits Hallam giving up his reserve charm setting, if the region's advancement budget allows it. Ascend awards a heart and puts the two halves and occupied bench in `cl16-t16-sailors`, with a decorative tightened line above the road.

**Proof and risks:** Prove pursuit windows with hook input, release/retry behavior, a line hold interrupted by damage, the complete visible descent, and two-player shared progress. Check every Ascend handoff/landing against `routePath`; run Watch with and without the completed save. Avoid the Hydra arena, rope length and hook physics. If existing landings do not support the NPC descent, stop for Isaac before any geometry proposal.

## Approval and acceptance

Approve or revise the five stories before implementation. Voice generation for these proposals waits for that approval as Isaac requested; the current three reworked quests are the only scope of this release's new recordings.

For every approved pair, add a physical-action headless scenario, failure/recovery and save/reload checks, exactly-once reward assertions, speaker/text/clip coverage, and screenshots of the opening minute, the turn and the final award. Prove the Ascend quest samples and NPC routes on the existing intended routes, then run targeted world Watch and the complete `npm run verify:watch` sweep. Re-run side-story, co-op, precision-core, branch and published-refresh checks. Human visual review must find each new objective, success and next destination obvious without opening the journal.
