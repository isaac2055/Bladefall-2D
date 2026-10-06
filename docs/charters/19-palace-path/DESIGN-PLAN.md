# The Path to the Palace (stage 19) — refined 2026-09-24 (7.199.0)

Act Two's fourth region: the climb from the Colony's road to the Sunspire. Sunrise, pale stone,
the sea falling away to the west; the golden palace always ahead of you. The Sunspire's mirrors
throw burning light down the road. The choice made at the Colony Gate walks up with you, or
comes up behind you.

**Code:** `public/bladefall-palace-path.js` and `public/bladefall-palace-path-art.js`, registered
with the Act Two core. This pass also moved MENDED out of the Act Two stages (`everywhere(dt)`),
added the forsaken sick to the act-wide cast (`e.zealot`), and gave Level Select a path picker.

## The shape (10,400 long; the road climbs 0 → 770)

| Room | x | Idea | Answer |
|---|---|---|---|
| The Smoke Line | 0–2600 | the colony's smoke rises up the slope and gives out here; the first mirror (1850) finds the road | pilgrims' shelters (a roof on two posts) and the vent smoke hide you. A first shelter is the rest site |
| The Mirror Stair | 2600–5600 | five risers of 110 under two mirrors (3350, 4850), each pool sweeping its own stretch | shelter to shelter, when the light is away: every dash has a window (tested from the pool's own formula) |
| The Hydra Overlook | 5600–6900 | the road is broken: 1300 of drop, and far below in the sea the beast you set free is circling | three signal masts with rings; the Chainhook from the lip, ring to ring, release onto the far lip. Fall and the sea gives you back at the lip |
| The Apron | 6900–9000 | the last mirror has mechanical shutters | cross during its 2.6-second dark interval; a 0.65-second slit/pool warning precedes reopening; shelters remain usable |
| The Sun Gate | 9000–10300 | the gate hangs on two anchor chains and a counterweight; one Sunguard holds the windlass | alone: go over his shield, strike his back, then come down hard on the windlass three times. With Oren: he breaks both chains |
| The Road On | 10300– | the Sunspire | walked on into Sunspire Palace (stage 20, 7.192.0) |

**The mirrors.** A mirror on a gilt tower throws a pool of light (100 wide) that sweeps its span on
a slow cosine (7–8 s). The pool and the short cone above it burn one measure (a flinch, then 1.2 s
before it can burn again). A shelter's roof or a vent's smoke puts you out of it. The glare on the
screen grows as the road climbs.

**The gate, alone.** One Sunguard (`holdPost`) stands 120 from the windlass: inside his reach (132),
so you cannot turn it in front of him. Behind him is 230 of apron to fight his back, and no second
shield to close it (a first draft had a second guard nearer the gate, leaving a 220 pocket between
his back and the bars that the other guard could walk into — going over him put you between two
shields with nowhere to go). Each slam turns the windlass a third; the portcullis rises with it; the third opens it. Each turn
persists individually across reloads. A split gold cap matches the Colony tap, the wheel kicks
on impact, and the visible counterweight descends. The gate and collider are 540 high, still
well above jump reach, with the crown and mechanism framed by the normal camera.
The gate fight stands clear of the last mirror (m4 ends at 8700).

## The choice, carried up (owner decisions 2, 4, 6)

- **The colony turned** (`oren:'helped'`, `colony:'turned'`): Oren, cured, and three of the sick walk
  with you. The lead resident carries a broad canvas: it protects within 95 horizontal and
  60 vertical units of the actual carrier. Running ahead or jumping above it exposes you.
  The companions wait at the bank during the hook crossing and regroup on landing. At the gate the sick take hold of the Sunguard one at
  a time so his shield is turned away, and Oren walks to the anchors and breaks both chains with his
  hammer (2 s each), only while the knight is within 420 units of the working anchor.
  Broken anchors persist individually. The released counterweight hauls the gate upward;
  the dialogue now agrees with the visible motion.
- **Oren without the turn** (`oren:'helped'`, colony not turned): Oren walks with you and breaks the
  chains; the mirrors and the Sunguard are yours.
- **The forsaken path** (`forsaken`: struck, or left kneeling): **the sick fight for the King.** At the
  smoke line a far bell rings behind you and three of them come up the road: no bell drives them
  and none stops them (`e.zealot`: they never hesitate, silencing a bell does not turn them). Three
  more come up behind you at the gate. When the gate falls they stop and run back down the road.

## MENDED follows the knight (owner request, 7.191.0)

MENDED was updated by the Act Two core's frame hook, which runs only in stages ≥ 16. It now runs
from `BladefallActTwo.everywhere(dt)`, called by the page every frame in every stage, and reads the
path with `peekPath()` (it never creates one). The gold stitches on the cloak are drawn by the
renderer's direct call to `BladefallActTwoArt.hero` in every region; the white flower stays an
Act Two mark. Verified in the Updrafts (stage 3): two measures back at 6 s and 12 s, the gold pips
outlined on the HUD, the stitches on the knight (dimmed by the stage's night grading).

## Level Select path choices (owner request, 7.191.0)

Choosing stage 18, 19 or 20 asks "The man at the Colony Gate — which road did this knight take?"
(`BladefallActTwo.pickPath`), with Back to the list. The picked profile seeds the run's own path
(`G.actTwoSessionPath`, never the saved game's):

| Stage | Choices |
|---|---|
| 18 | He took the man's hand (infected, one grey measure) · He walked past (he still kneels) · He struck him (forsaken) |
| 19 | The colony turned (cured: MENDED, two gold measures, Oren known) · He left him kneeling (forsaken) · He struck him (forsaken) |

## Numbers that are load-bearing (tests/palace-path-stage.test.mjs)
- Chasm 1300 > 800: no jump crosses. Lip → o1 407, o1 hang → o2 and o2 hang → o3 409 (Chainhook
  470); the lip does not reach o2.
- Every dash between covers under every mirror is < 520 of open ground and has a window of at least
  its travel time (+0.25 s per riser) plus 0.4 s.
- The windlass is inside the Sunguard's reach; 230 behind him to the bars; m4's pool ends short of
  his reach.

## Presentation
- Palette: pale road stone, whitewashed shelters with thatch, the King's gold only on the mirrors,
  the gate and the Sunguard; sunrise sky; the sea to the west and in the drop.
- Music: "Towering Sea Cliffs" (Aerth, −21.6 LUFS) on the road; "The Last Spark of Darrow" while the
  ambush or the gate fight is live.
- Rest: the Pilgrims' Shelter (the first shelter). Existing automatic recovery anchors remain;
  player-placed flags are unchanged.
- The distant palace is seated on a supported ridge, with a smaller complete silhouette.
  The Hydra circles in world space rather than following the visible slice of the chasm.
- Deviation from the proposal: the plan's table called the mirrors "light as a portal noun". Here
  the light is a hazard with cover; routing a beam is left for the Sunspire, where the plan has it
  land on the King's back.

## Refinement verification (7.199.0)
32 focused Path/Colony/Sunspire tests passed. Path tests additionally cover actual carrier
proximity, shutter timing versus the widest shelter crossing, and nearby anchor work/latching.
After the final gate-height adjustment, the 12 Path tests passed again.

Browser fixtures loaded the real arrival, reviewed canvas/shutter warning and the fully framed
Sun Gate, and exercised all three hooks plus a jump-and-dash onto the far bank. Oren waited
while the knight was back on the apron, broke one anchor nearby, retained it through reload,
and completed the second. The solo windlass retained its first turn through reload and opened
on the third native-input slam. Guard deaths/invulnerability and repositioning were used to
isolate these mechanics; this is not an uninterrupted route or a new solo combat playthrough.
The aid and forsaken branches, MENDED and both seams retain their existing logic/tests.

Historical 7.191 evidence covered full scripted assisted/solo climbs, guard combat, seams and
Level Select; those checks were not all replayed for this refinement.

## Not yet done
- The owner's playtest (mirror timing, whether the solo gate is fair, whether the sick read as
  walking with you or coming for you).
- Done in 7.192.0 (`docs/charters/20-sunspire/DESIGN-PLAN.md`): the open Sun Gate is a walked seam
  into Sunspire Palace (the frontier card shows only if no stage 20 is registered).
- Co-op through 16-19.
