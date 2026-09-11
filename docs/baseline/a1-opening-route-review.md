# A1 opening-route attempt review — 2026-08-01

## Evidence boundary

The four opening stages received 35-second runtime-assisted keyboard attempts
against Bladefall `7.8.0` at the byte-verified localhost
`http://127.0.0.1:8372/`. The controller reads motion, nearby hazard/wall flags,
slate contact, checkpoint state, and enemy presence. It can move, jump, wall
jump, dash, attack, place a mouth, accept a portal prompt, and choose the first
level-up option.

The Outskirts begins from a genuine fresh run. The later stages use disclosed
development stage selection and one-time starting-health normalization. No
position, HP, invulnerability, test-mode, or geometry mutation occurs after a
stage starts.

This is stronger execution evidence than a blind macro and weaker than a human
review. A failure may expose a real friction point or merely the controller's
limited planning. No result below is a playability verdict.

## Results

| Stage | Maximum progress | Checkpoints | Resets | Boundary observed |
| --- | ---: | --- | ---: | --- |
| The Outskirts | 2,689 / 7,700 px (34.3%) | 1,700; 2,670 | 3 | Reached the second checkpoint; no slate or portal placement reached |
| Black Woods | 1,264 / 6,400 px (18.9%) | 810 | 0 | Stalled in the first spiked wall-jump chimney with 4 HP |
| The Brute | 2,110 / 3,800 px (54.7%) | 90; 1,450 | 7 | Repeatedly failed the falling-mass rehearsal; boss remained about 1,340 px away |
| The Updrafts | 1,739 / 7,500 px (22.5%) | 80 | 9 | Acquired the jetpack but repeatedly reset before completing fuel school |

No stage transition, intended portal solution, or boss encounter was reached.

## Interpretation

1. The Outskirts controller reached two checkpoints from a real fresh run, so
   ordinary movement, combat, and upgrade selection remain functional through
   the early movement school. Its three resets cluster after the first
   checkpoint, before the later authored combination systems.
2. Black Woods is the cleanest review target because it did not reset or lose
   its checkpoint. It remained inside the x≈1,090–1,290 chimney, repeatedly
   contacting the right wall beneath alternating spike bands. A human should
   determine whether the jump rhythm is readable; automation alone cannot call
   this a defect.
3. The Brute attempt never reached the boss. Seven resets occurred around the
   spike-topped falling-mass platforms between x≈1,640–1,980, so this evidence
   says nothing about the charge/pylon portal fight.
4. The Updrafts controller successfully acquired the temporary jetpack and
   reached the first air crystal area. Nine resets before the next checkpoint
   make the fuel-school landing chain the human review priority.
5. None of these attempts encountered a slate, so the opening portal curriculum
   remains untested by natural routing despite the separate targeted portal
   evidence.

## A1 status

Opening-stage automated attempts are complete. Human intended-route completion,
revisit, optional/collectible, speedrun, and two-player reviews remain pending.
A1 remains open.
