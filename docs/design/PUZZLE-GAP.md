# The puzzle gap in the precision workshop

> **Follow-up (7.245):** the owner chose to rebuild rather than patch. The result is a separate puzzle engine and 24 rooms: [PRECISION-CORE.md](PRECISION-CORE.md).

29 September 2026, written against local 7.244.0. This is a diagnosis and proposal. No code, layout or tape changed.

## The answer

In Celeste, a room asks a question you can answer by looking before you move: *with what I have right now, from where, and in what order?* Execution then tests your answer. Thorson's rule ([2018 AMA](https://www.reddit.com/r/NintendoSwitch/comments/7tuubc/hey_were_the_dev_team_behind_celeste_ask_us/)) is that a room hard to execute should be easy to figure out, and vice versa. She has three dials: puzzle, exploration and precise platforming.

The banked Fractured rooms (G, H·Needle, I, J, L, H-F, M-F, N-F, P-F, Q-F) turn the precision dial to maximum and leave the puzzle dial at zero. That combination is legitimate, and it is what they are good at. But no room in that set asks an answerable question. Five things in the code prevent it.

## Why the banked rooms play as "learn the pattern, hit the timing"

1. **The dash is a cooldown, not a resource.** Every workshop dash sets `a.recharge=.38`, and the charge returns in the air ([bladefall-celeste.js](../../public/bladefall-celeste.js), `labBefore`). Ground contact, vein exits, bells, prisms, crumble landings and vaults also set `charge=1`. Double jump is always on (`p.maxJumps=2`). You are never choosing *where to spend* a dash, because you will have another in 0.38 s. Celeste's routing puzzle is exactly that choice. The `noDashFlight` drag added in 7.243 patches a symptom of this: free dashes let players fly.
2. **Each device fixes the answer.** Bells only fire when dashed from the left (`l.dx>0`) and throw you at a fixed `dx,dy × 850`. Vaults launch at a fixed 680/−720, and prisms at 480/−360. The vein exit follows your entry. Each object has one correct input and one result, so the player only decides *when*.
3. **One order, left to right, each object used once.** The G–L builders ([bladefall-precision-workshop.js](../../public/bladefall-precision-workshop.js) `build`) place objects at increasing x, and each is `ceSpent` after use. There is no branch, no revisit and no choice of order. The solution *is* the object list.
4. **You can't see the problem.** In H the start view shows about a quarter of the room: roughly 1,100 units of 4,520 (my estimate from a screenshot at the entrance). Banked rooms run 3,400–6,000 units. You can't plan a route you can't see, so you learn it by dying forward. That is memorisation, not solving. Celeste rooms fit on one screen.
5. **We print the solution.** Entrance hints spell out the sequence ("Two gold departures, no waiting. Vault into the bell, land on failing stone, vault again."). Several HUD cues give instructions: `JUMP → VAULT`, `RIDE IT HOME · HATCH OPENS ON RETURN`, `EXIT + JUMP`, `DASH` over bells. A puzzle whose answer is on screen is a checklist.

A sixth, smaller cause: the state in these rooms is mostly **timers**, such as crumbles, rail drops, root decay and gate grace. Timers punish standing still, and solving needs standing still. Celeste's puzzle state mostly **stays where you put it**: switch blocks, a moved Kevin, a thrown jellyfish, touched switches, a key, whether you still have your dash.

## What already has the puzzle vibe

The seeds are in the Base Bank and the candidates, not the Fractured Bank:

- **Switchback Engine** and **R**: every dash toggles the footholds, so dashing has a cost.
- **O / O-F**: the recoil pods answer *your* aim, so where you stand and which way you dash is the question.
- **P / S**: a second object on its own route, like Celeste's jellyfish.
- **T**: the outward route builds the return.
- **V**: a remote command decides a future landing.

Even these have two of the five problems: the free dash, and hints that give the answer (R's hint is the exception, because it asks a question). R–V have not had your playtest yet.

## Keep what you like

G's rail timing, L's relay, P-F's arrangement and the other approved rooms are good **execution rooms**. Leave their layouts and tapes alone. The fix is to add the missing dial alongside them, not to sand them into puzzles.

## Proposed fixes

In order of impact per unit of work.

### Systemic

1. **A scarce-dash room flag.** Add `r.dashEconomy='scarce'`: no timed recharge; refill only on ground and at an explicit refill crystal (`ceDashRefill` already exists in the original courses). Devices refill only when they visibly say so. The code changes are the `a.recharge` block in `labBefore` and each `l.charge=1` in the workshop `late()` for prisms, bells and vaults. This one flag turns every existing device into a routing question. Keep it off for the banked rooms, so their tapes stay valid.
2. **Put dash state on the knight,** not only in the HUD corner. Celeste's hair is readable mid-air while you are looking at the hazard. A blade glow or cloak colour does the same job.
3. **Let devices answer the player's aim.** Bells could reflect the incoming dash across their face (angle in, angle out) and accept any side. Or they could rotate one notch per hit, with that state persisting. O's pods already do this, so extend the idea.
4. **One-screen puzzle rooms.** Lock the camera to room bounds and keep puzzle rooms within one view. A long sequence becomes a chain of rooms, with respawn at each entrance. That also makes failure cheaper.
5. **Hint policy: name, never sequence.** In puzzle rooms, the entrance text names the new object at most, and instruction cues go. Keep the diegetic connectors you already draw, such as cables, conduits, brake linkages and ballast lines. They show *what is connected to what*, which is the fair half of a puzzle.
6. **No timers on the puzzle state.** State the player sets up should stay put. Timers belong only to the execution that follows the plan.
7. **A safe spot to think** at the entrance and at each decision point. Thorson calls safety her main pacing control.
8. **Tag every room solve / explore / execute** and never max two. G–L are execute rooms, so each can be paired with a solve room using the same device.

### New room sketches (one screen, scarce dash, existing systems unless marked)

| Sketch | Question to answer | Built from |
|---|---|---|
| **Tally** | Three touch-stones open the exit gate. You have one dash and one refill crystal. Only one order reaches the crystal while you still need it. | **New:** touch-stone (the "coins that open barriers"). Existing: `ceDashRefill`, crumble |
| **Parity** | Every dash flips cyan/amber. The exit is amber, and you arrive on cyan. Count the dashes; a jump-only detour changes the count. | `dashSwitch` folds + scarce flag |
| **The Held Gate** | The lantern in its socket holds the gate open, but you need its slow fall to cross the pit beyond. Get the gate held another way, or get the lantern through first. | Lantern, socket, ballast (P/S) |
| **Angle of Approach** | One pressure pod, three perches, and an exit under an overhang. Only one perch and dash angle sends you there, and you get one dash per landing. | O pressure pods + scarce flag |
| **Wait on the Wall** | Throw the lantern onto a plate to start a slow hoist. Cling in the shaft while it passes, then drop onto it. | Lantern, hoist, wall cling |
| **Slide Stone** | Dash into a stone and it slides until it hits something, then stays. Build your own foothold; a wrong push means retry. | **New:** Kevin-style slider |

Each can sit in front of a banked execution room as its "solve" partner. For example, Parity could come before H-F, or The Held Gate before P-F.

### Verification to add for puzzle rooms

The current checks prove the route works, that removing a device breaks it, and that a few simple policies fail. For puzzle rooms, also check:

- **The greedy move fails.** "Dash toward the exit whenever you can" must not finish, and the reason must be visible on screen.
- **At least one real decision.** From the entrance, two available first moves lead to different outcomes because of a rule the player can see.
- **The hint does not contain the solution sequence.**

No automated check proves a room *feels* like a puzzle; that remains your playtest.

## Suggested first step

Implement the scarce-dash flag and dash-on-knight, then build **Parity** and **Angle of Approach** as two one-screen candidates. Both reuse approved systems, so the playtest isolates the question you asked: does taking the free dash away, plus not telling the answer, create the Celeste itch?
