# L05 — Hollow Marksman production charter

Status: complete — automated acceptance passed  
Zone: `hollow-marksman` / Marksman Road  
Authored length: 15,000 px  
First-visit target: 28–36 minutes  
Practiced traversal: 4–6 minutes

## Purpose

Marksman Road is the first chapter built around the permanent linked portal.
The knight enters with Jump, Weapon, Dash, and `portal-single`: one movable blue
mouth that works only near an authored orange anchor. The Hollow Marksman grants
`portal-pair`; independent blue/orange placement must not exist before victory.

The level's theme is exposure. Players read glints, posture, arrow paths, cover,
and impact scars instead of floating detection labels. Each portal use changes
the verb rather than repeating one puzzle:

1. cross a physical barrier;
2. redirect a hostile shot into machinery;
3. traverse under active sightline pressure;
4. bank one marked shot into a rangefinder;
5. finish a mobile weapon duel without repeating the bank.

## World contract

- West seam: the first visit is intentionally one-way after the opening watch
  walls. Later Wall Cling from Ruined Keep restores physical westward travel.
- East seam: ordinary bidirectional watch gate to Ruined Keep.
- East gate requires the Hollow Marksman defeated and `portal-pair` earned.
- No completion portal is created.
- Level Select hydrates Jump, Weapon, Dash, and `portal-single`, but not
  `portal-pair`. Victory grants the pair for that preview route.
- Jetpack is local to Updrafts and must not cross the seam.
- Wall-jump and Double Jump are neither required nor available.

## Room map

| Cell | Span | Mandatory action | Optional value | Failure recovery |
|---|---:|---|---|---|
| `hollow-marksman:01` Shotfall Camp | 0–2,500 | Observe a full glint/draw/release cycle, then touch each unsupported crystal to refresh a mid-air jump over two broad mantlets. | Daro begins The Open Watch, a delayed-return quest whose token lies beyond the one-way walls. | Each crystal sits left of its wall inside the opening jump arc; misses return to continuous ground. |
| `hollow-marksman:02` The Watching Road | 2,500–5,600 | Place one blue mouth on the road slate and emerge from the fixed orange anchor beyond a 620 px unclimbable tower. | Senn explains ownership, not the solution. | Both sides have continuous ground; the anchor exit has a wide landing. |
| `hollow-marksman:03` Mantlet Works | 5,600–9,000 | Let a local watch arrow enter the floor mouth and leave a horizontal anchor into the brass release. | Moving mantlets offer alternate timing windows. | The sniper's visible brass command ward prevents its death until the circuit opens; the mouth is replaceable; the whole room is grounded. |
| `hollow-marksman:04` Windcut Gallery | 9,000–11,800 | Use the linked mouth to cross a 700 px tower while snipers relocate between perches. | The high shelf holds the Worn Command Token and one Forge Seal. | Exposed and sheltered approaches are both valid; every descent lands on solid floor. |
| `hollow-marksman:05` Deadeye Court | 11,800–15,000 | Bank one marked shot through the linked mouth, then defeat the vulnerable mobile Marksman. | `Far Thread`, an Echo-capacity knot, full Blood restoration, and `portal-pair`. | Threshold checkpoint at 12,100; death rebuilds lens, perch, rails, arrows, mouths, and gate. |

## Sightline language

- A bow glint and visible aim line precede every committed shot.
- A sniper faces the tracked player for the entire lock.
- After firing, watch snipers relocate to one of their authored perches.
- Runners advance when they retain sight and patrol only after awareness fades.
- Mantlet guards preserve shield facing for 0.85 seconds after the player crosses
  them, creating a deliberate rear-strike window before they turn.
- No `SEEN`, `LOCK`, `MARKED SHOT`, `SHIFT`, or phase-name text appears in
  Marksman Road. Sound, pose, moving brass, impact, and arena motion carry state.
- Ordinary enemies use authored pit recovery and do not die before interaction.

## Portal pedagogy

### Linked crossing

The orange anchor is visible beyond the tower before the first usable blue slate.
The tower is taller than Dash and single Jump combined. The landing is wider than
the maximum exit drift. Replacing the blue mouth is always allowed while the
anchor is within its 1,500 px puzzle envelope.

### Anchored shot

The Mantlet Works sniper sits west of the intake and the release sits east of the
orange outlet. A direct arrow cannot reach the release. Only a `watchShot` with a
portal hop and reflected ownership may latch the circuit. A player arrow visibly
ricochets from the receiver. The source sniper is command-warded until success,
so the renewable solution cannot be killed.

### Gallery crossing

The gallery tests execution, not a new rule. One approach is exposed and quick;
one is sheltered and slower. Both link to the same safe fixed landing. The high
reward uses only Jump, Dash, and the linked exit.

## Deadeye Court

### Phase A — warded apparatus

The Marksman tracks actively from a raised perch. The exposed floor slate lines
up with his marked arrow. A fixed horizontal anchor sits just west of the lens.
Only the boss's marked arrow after a portal hop can shatter it. A sheltered slate
under a mantlet is an honest non-answer: it moves the knight, but the cover catches
the arrow before entry. Marked shots renew until success.

### Phase B — pursuit

The lens and perch break once. The ward never returns during that attempt. Moving
rail cover wakes and the Marksman hunts across four authored tiers. Ordinary
weapons now damage him. A ground arrow-rain marker forces movement without a
floating instruction. Raised platforms are player terrain: the Marksman keeps
his airborne angled volleys but passes through those surfaces and completes every
descent on the arena floor.

### Phase C — exposed court

At 60% and 30% health, outer then inner cover visibly splinters. Shot cadence and
reposition speed rise, but telegraph duration remains readable. The portal answer
is not repeated. Once enraged, ground arrow-rain returns every 9.8 seconds—half
as frequently as the 4.9-second mastered build—while direct and airborne angled
volleys carry the continuous pressure. The final challenge is movement, spacing,
and weapon use.

## Story and economy

- Daro and Senn are residents, not followers. Daro's compact delayed-return
  quest turns the optional token into a reason to revisit after Wall Cling.
- The opened-watch command and missing faces remain ambiguous.
- White trumpet flowers appear twice without being named as poison.
- The optional Worn Command Token is memory four: enough to make the pattern
  suspicious, not enough to diagnose the dream.
- Ordinary encounters drop no random gear. The boss owns `Far Thread`; the
  optional high shelf owns one finite Forge Seal.

## Audio and presentation

- `Drifting Memories` plays continuously across the five road cells; checkpoints and
  room boundaries never restart or replace it.
- `Abnormal Circumstances` begins only when the Hollow Marksman encounter is
  active, then yields back to the road cue after victory.
- Daro, Senn, signs, and the Worn Command Token use compact world-anchored
  dialogue that clears with distance and can be reread deliberately with Up.
- Authored watch enemies suppress generic elite labels as well as detection and
  phase text; silhouettes, glints, aim lines, shields, and relocation communicate
  their state.

## Acceptance gates

1. A fresh Level Select stage begins with exactly the constitutional prefix
   through `portal-single` and no future movement or portal ability.
2. Every mandatory surface is traversable at normal speed without Test Mode.
3. The 620 px and 700 px towers cannot be bypassed by Jump plus Dash.
4. Each anchor is within placement range at its slate and releases to supported
   space.
5. Mantlet release rejects player arrows, direct watch arrows, and zero-hop shots.
6. Deadeye lens rejects every projectile except one marked, portal-routed boss shot.
7. The bank changes the fight once; ordinary damage works afterward.
8. Portal camping is answered by repositioning and ground denial, not unavoidable
   damage.
9. Boss death grants `portal-pair`, restores Blood, opens the east gate, and
   creates no generic portal or meaningless key.
10. Death and level reload produce a fresh, solvable mechanism.
11. West and east seams cross in both directions with safe arrival and rollback.
12. Room screenshots, runtime state probes, full tests, deploy parity, and the
    release audit all pass before this charter becomes complete.
