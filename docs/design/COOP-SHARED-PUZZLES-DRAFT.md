# Dedicated two-player puzzle course — design draft

Concept only. No co-op gameplay or networking changes are authorized by this draft.

The existing shared-world experience can remain casual. A dedicated course would instead give two knights different, mutually dependent jobs. Each solution needs actions by both players, with roles swapping regularly. Difficulty should come from understanding, communication and coordinated movement, rather than a player spending most of the room holding a button.

## Candidate mechanics

| Mechanic | What both players do | Why one knight cannot do both | Fairness and recovery |
|---|---|---|---|
| Counterweight exchange | One knight rides a rising cage while the other transfers a heavy lantern between two lower scales. The rider opens a return bridge so they can swap jobs. | The moving cage and scale are separated by a sealed shaft; leaving the scale reverses the cage before the rider can reach its latch. | Visible chains show the connection; reversing is recoverable, not lethal. |
| Portal relay | Each knight owns one portal pair. One routes a thrown lantern out of a sealed bay; the other catches it and redirects it through a second pair toward a receiver. | Each pair reaches only its own marked surfaces, and the receiver is beyond the first pair’s reach. | Portal colors and matching surface marks identify ownership. Failed throws return the lantern to a nearby tray. |
| Two-sided brake | One player strikes a brake lever to expose a foothold for their partner. The partner crosses and operates a different brake to bring the first player over. | Each lever closes its own approach while opening the opposite route; neither side offers an independent complete path. | Generous lever windows, countdown lights, and a safe missed-jump shelf. |
| Shared shield and blade | One knight holds a directional shield against a continuous bolt stream while the other crosses behind it and cuts a tether from its unarmored side. The tether opens the shield-holder’s exit. | The shield consumes movement/hand control; the tether’s rear is reachable only behind the protected crossing. | Bolts have clear rhythm and impact cues. Shield direction is visible to both players. |
| Lift-and-release | One knight keeps a lift under their partner, then releases at a called moment to give the rider launch momentum. The rider lands at a latch that carries the operator up. | The lift controller is on a separate island; the launch needs a rider and an operator at the same time. | A wide successful release window, rehearsable lift travel, no latency-sensitive one-frame requirement. |
| Split information | One sees the order of three lantern colors through a grille; the other has the corresponding switches. The first player must simultaneously keep the room’s moving shutter open. | The clue and controls are separated, with an active physical dependency as well as hidden information. | In-game pings convey colors/shapes so voice chat and color perception are optional. |
| Partner rescue | One knight dives to collect a key while their partner raises a catch basket, then uses a portal to return both to the upper route. | The lower knight has no return surface until the upper knight moves the basket. | A failed catch returns both to the last shared checkpoint quickly; no prolonged spectator time. |
| Tandem gate | Each knight completes a distinct short route to opposing gate locks, then holds them together long enough for the gate to latch open. | The locks are too far apart for one body, portals cannot connect their alcoves, and the locks require occupied contact rather than dropped objects. | The locks need a forgiving overlap, not synchronized frame-perfect arrival. Both routes remain individually meaningful. |

## First course sketch: The Two Banks

One compact Causeway workshop with a shared central shaft, four connected puzzle spaces and three shared checkpoints:

1. **The balance yard:** transfer a counterweight to raise the partner, then exchange roles across a bridge. Establish dependence without lethal pressure.
2. **The relay bay:** carry the same lantern through two players’ portal pairs. A missed pass falls into a visible recovery tray.
3. **The broken brake:** use alternating levers to support the partner’s movement; the successful crossing changes access for both players.
4. **The return:** combine the familiar lift release with a portal lantern pass, then reach the paired exit locks. The workshop changes state rather than introducing a surprise final rule.

Keep roughly equal responsibility and playtime. Each player should make decisions, travel, and help the other recover. Include a role-swap prompt at each checkpoint, not fixed “good player” and “button holder” assignments.

## Requirements before implementation

- Start as a distinct two-player course; do not silently convert solo campaign rooms.
- Shared authoritative puzzle state for scales, portals, catches and checkpoints; visible acknowledgement when an action takes effect.
- Checkpoint both players and puzzle state together. Disconnect pauses the puzzle and permits rejoining; never strand the remaining knight.
- Test every intended dependency with a single knight, dropped objects, portal shortcuts and duplicated inputs. Avoid exits that merely count two player IDs after an otherwise solo solution.
- Measure timing windows under realistic latency. Use sustained overlaps and forgiving catches rather than precise simultaneous inputs.
- Support pinging surfaces, targets, colors and “ready”; make voice optional.
- Decide local versus online support and camera ownership before prototyping. A shared camera suits the balance yard; independently readable views suit split-information and separated relay bays.

Recommended first prototype, when requested: counterweight exchange plus a two-pair portal relay, with plain geometry and rapid shared resets. It tests genuine collaboration before investing in a full course.
