# The Fractured Woods (stage 22) — refined 2026-09-24 (7.211.2)

Act Three's second echo: Black Woods after the Echo walked it backwards. Dead trunks against a
violet night, fog in the hollows, the refuge's lanterns out. The original taught "the woods lie;
read the honest resin" through a *recoverable* thicket. The echo keeps the upper climb exact, with a catch floor for learning its first two hops. The kit is the one the woods gave you: **a single jump (78 high, 136 long at a 199
run), and the Oathblade only once you take it from its stump.** The Muster applies
(`BladefallFractured.muster()` at the first frame: roles, the frontal shields, ×1.55 health,
×1.25 damage).

**Code:** `public/bladefall-fractured-woods.js` + `-art.js`, on the shared Act Three core
`public/bladefall-fractured.js` (kit, Muster, checkpoints, the echo-to-echo seam, the end card,
the registry the Fractured tab reads, the art's night). Stage 22 via the Act Two region registry;
`CUSTOM_LEVELS[22]`, `LEVEL_MUSIC[22]` ("Hall of the Violet Discipline"), `V4_LAST_STAGE=22`;
campaign row `act: 3`; zone `fractured-woods`; seam `fo-fw` from the Outskirts' east end (open once
the Sentinel is bound); rest site `woods-embers`.

## Refinement — 7.211.2

- The first two wind hops now have a catch basin. It cannot bypass the climb: the second
  branch is120 high against a78-high single jump. Upper branches, reversals, false branches,
  two rests,2.6s wind period and0.45s cue remain unchanged. Patrols and root descent retained.
- Held branches have solid amber top edges. Incoming branches show bright dotted edges
  during the warning; outgoing edges shorten with the actual time remaining. False branches
  stay dim, broken and resinless. Both-edge rests have distinct rivets and local wind ribbons.
  Essential cues remain visible with reduced motion; flutter/shiver/leaf movement stop.
- The counterweight is visibly below its pressure surface. Landing sinks it and lights a
  root tendon to the stump while the sword's bindings pull apart. Physics of the platform is
  unchanged. Taking the blade remains a separate, one-time interaction; reload restores it.
- Thorn beds draw root knots when down, amber buds during the harmless warning, and24-unit
  thorn silhouettes when live, using exactly the collision clock. Timings/damage unchanged.
  The loop's crumbling bough now shows its real crumble countdown.
- Wind solidity is reapplied each frame so hydrated geometry cannot contradict the wind
  until the next turn. Warning state clears immediately at a turn. Dead actors cannot
  activate the counterweight or claim the crown.

**Current evidence:**26 focused tests pass (Woods, Outskirts, player checkpoints), including
collision/render thorn-clock parity, phase restoration, safe basin extent and deliberate
blade acquisition. Browser: a native jump landed on the weight, then movement to the stump
and interaction acquired the sword; reload retained roots/blade. A mistimed early landing
fell safely into the basin. From a first-branch fixture, native jumps crossed two wind turns
and reached the first rest with five Blood. A down thorn bed was crossed unharmed; its warning
was harmless and exposure during growth cost one Blood. Runtime corrected deliberately stale
branch solidity on the next frame. Arrival, root linkage and wind warning/held/false branches
were visually reviewed; no runtime errors observed. These are targeted fixtures, not a fresh
uninterrupted full-level or co-op completion. Local mirror rebuilt; no commit/push/deploy.

## The B-side: the original's five rooms, remixed and made exact

| Room | x | The original | The echo |
|---|---|---|---|
| The Burnt Refuge | 0–2300 | the Mothlight Refuge: a pause | a rolling thorn wave: four beds (160 wide — too wide to jump), each down 1.2 s of 2.4, each 0.6 s behind the last going east. Cross one, wait on the stone, cross the next. Walking straight through costs four hits |
| The Oathblade Clearing | 2300–3700 | recover the Oathblade in its clearing | a 520 thorn bed you cannot run in its 0.6 s down time; the road is a loop of stones over it (one crumbles), to a **counterweight**. Stand on it and, below you, the roots let the blade go. Drop off the far side and take it (↑ TAKE THE OATHBLADE) with the Muster's outrider already coming for you: the first thing you do with the blade is use it |
| The Biting Canopy | 3700–4700 | armed enemies occupying terrain | the floor under the canopy is gone: the canopy is the road (six boughs, rises of 60, gaps 35–50), a toxling on it, a diver above it |
| The Muster Road | 4700–6560 | — | two timed beds (down 1.4 s, a 1.05 s crossing), a shieldbearer turning slowly, an outrider |
| The Mirror Thicket | 6560–7700 | read the honest resin (recoverable) | **the C-side** |
| The Rootbound Passage | 7700–10400 | leave by the root tunnel | down from the crown on narrow roots over the void: 90-wide steps, 90 gaps — walking off falls short; every step is a hop — a shadeling and a grunt on them; a linesman at the tunnel |

Every gap is checked against the measured arc (tests) and was landed in the browser by scripted
input (the loop, the canopy, all nine root steps, the crown's first drop with air control).

## The C-side: the Mirror Thicket — climb on the beat of the wind

Every branch carries its amber resin on one edge and **holds only while the wind blows against that
edge**. The wind turns every 2.6 s. For the last 0.45 s before it turns, the streamers flutter, the
leaves gust, the branches it will harden stir and the ones it will drop shiver. Resin on both edges
holds in either wind (a rest). **No resin never holds** (the lie: three of them, placed where an
easy step would be). Only the first two branches have a catch floor (6560–6780); the rest hangs over the void.

- Ten branches, rises of 60, edge gaps of 50, and one reversal (the climb goes east, doubles back
  west, then east again to the crown).
- From a branch that drops at the turn to one that holds after it, you must jump **before** the turn
  and land **after** it. A 60-rise jump is in the air 0.50 s, so the flutter's 0.45 s is the cue:
  jump as they flutter. Measured in the browser: a jump from 0.50 s before the turn to ~0.08 s after
  it (the coyote frames) lands. 0.55 s before, it falls through a branch that is not there yet.
- The two rests (240, 480) are where you wait for the beat after an in-wind hop.
- The crown is latched: a death after it starts you on it.

What the player learns: the resin tells you which wind holds a branch; the streamers tell you when
the wind will turn; the lie never stirs. It is a rhythm puzzle, not a reflex test.

## Original construction evidence (7.202; not replayed in full during refinement)
With the patrols off: the refuge wave crossed with no hits (a naive walk takes four); the loop to
the counterweight; the roots released; the blade taken at the stump (kit `['jump','weapon']`, the
Oathblade line shown); the canopy; the road's beds (a clean walk the moment they drop: 0.35–0.43 s
to spare); the whole thicket on the beat (11 of 11 hops, crowned); the root stair to the end; the
end card ("THE FRACTURED UPDRAFTS — the next echo to be built"). With the outrider alive: the blade
taken 100 units ahead of it, then the outrider killed by a face-tanking bot for two hits (its Muster
role ran windup → strike → recover).

Changed while verifying: the flutter was 0.6 s (longer than the jump's airtime: jumping at its start
fell through); the stump was west of the loop (three crossings of a crumbling loop to take the blade:
moved east, one crossing); the road's second bed was 200 wide down 1.1 s (a 1.1 s walk); the root
stair's steps were 170 wide with 10 gaps (a walk: now every step is a hop). The backdrop's tree bands
read as barcode noise: replaced by trunks with bare limbs at three depths.

## Open
- Owner playtest: whether the thicket's rule reads without a sign (the resin, the streamers, the
  gust, the stir/shiver); whether 2.6 s is the right beat.
- With the Muster alive (bot, 7.205): the road's shieldbearer is passed by a timed jump over it (58 high against a 78 jump;
  a naive bot walking into its shield is bashed back indefinitely); the root stair with its guards alive, nine of nine
  hops with air control, 2 hits.
