# The Landing Shores (stage 17) — refined 2026-09-24 (7.197.0)

Act Two's second region, Charma Shores I. The holed boat from Thunder Cliffs comes in on the
current and grounds on a strand of older wrecks under a grey dawn. The knight's mouth is dry as
ash. Walked west to east, and rising, to the gate of the colony the King keeps his sick in,
where the act's one choice is made.

**Code:** `public/bladefall-landing-shores.js` (level, tide, foes, fights, choice) and
`public/bladefall-landing-shores-art.js` (everything it draws). Both register with the Act Two
core (`bladefall-act-two.js` / `bladefall-act-two-art.js`), which now owns what the whole act
shares: the Chainhook in every Act Two region, the white flower (grey measures, flowers on the
cloak), the camera/void floors a region supplies, and the frontier card.

## The shape (12,800 long; shelves at 200, 0, 300, 720)

| Room | x | Idea | Answer |
|---|---|---|---|
| The Wreck Line | 0–3950 | a tidal gut (980, no jump) and a stranded hull (400 of coated wall) | the Chainhook **across** (two mast rings) and **up** (a ring off the stern, one on deck) |
| The Tide Flats | 3950–6640 | the region's own rule: the sea goes out and comes back on a clock you can watch | **low water** is a road across the sand to a walled wreck (its mast ring gets you aboard); **high water** lifts two pieces of wreckage into footing to the jetty |
| The King's Landing | 6640–8350 | a gilt jetty kept swept; violet silk on a nail; two sets of prints | fight 1: three Belled, barred in by the Sun Arch |
| The Bell Cliff | 8350–10750 | a Sunguard rings them on from a ledge no one reaches | hook to the bell hoist and slam its retaining cap; the single squad flees and both arches open; then climb to the headland |
| The Colony Gate | 10750–12800 | the same Sunguard on the ground, ringing more of them out of the gate | fight 3: silence the bell (the first blow that lands, from behind), then beat him; then the choice |

**The tide.** Low 10 s, flood 5, high 7, ebb 4 (water −70 → 170). Its clock begins
on the first approach to the dune, so the low-water road is visible before the first crossing.
Two raised wreck ribs at 4520/5030 (tops 200) give recovery footing and a jump–dash–hook
route into the refuge. Floats are 220 wide to give their moving surfaces useful landing room.
Floodwater deals normal damage in place, knocks upward, and grants 1.2 s recovery immunity;
it does not teleport to dry ground. Falling beneath the actual void floor still recovers.
Foam moves with the tide; submerged ribs and weed show the water's height without labels.

**The Belled** (conscripts; bandaged, a bell at the belt, a white flower in the wrappings)
close to a stand-off and hesitate — shaking, pike low — until they talk themselves into a
thrust, or a bell does it for them. The thrust is readable: the pike goes back first. A
knight can dash through it. Beaten, they kneel a moment, then get up and go.

**The bell is the fight.** At the cliff, a new reachable hoist ring at (9260,570) carries you
to a real shelf at 470. Slam the split gold retaining cap beneath it, repeating the
Thunder Cliffs windlass/lock vocabulary: the bell stops, the squad flees and the overseer
leaves for the gate. Clearing the squad alone does not open the route.

 It starts each one (the landing's ringer strikes its bell; the Sunguard
tolls from his ledge; at the gate he tolls at his back), drives each thrust (on a stroke, every
conscript standing off winds up at once), and the last fight ends when it stops. At the gate
the bell rings more of them out of the postern for as long as it rings, and each stroke swings
back into the man kneeling behind him. The Sunguard's shield turns slowly (1.1 s, 0.9 once
silenced): go over him, strike his back — the first blow that lands cracks the bell, the
conscripts drop their pikes and run, and he fights alone.

## The choice (owner decisions 2, 4, 5)

A bearded man, bandaged to the eyes, kneels by the gate with a chainwright's hammer beside him.
He is Oren; nothing says so. When the Sunguard is down and you come near, he warns you:
"Don't. It goes to whoever touches it." Three answers, each with his reply; all of them imply
months ("I was, the first month", "since the leaves turned").

- **↑ TAKE HIS HAND** — the white flower is yours (`BladefallActTwo.kit.afflict`): every 30 s of
  play one Blood measure greys over and stays grey (rest does not fill it), never below three
  usable; a white trumpet flower opens on the cloak for the touch and one for each grey
  measure. He stands, takes up the hammer, and walks with you.
- **Walk past** — lift the bar and go in. He kneels there (`oren:'kneeling'`) until you leave the
  Colony: since 7.190.0 the gate is a walked seam both ways, so you can come back out to him.
- **Strike him** — the first blow: he covers his head and does not reach for the hammer (said, so
  the second is deliberate). The second: he falls, the light goes cold, a bell tolls inside the
  gate, and the forsaken path is sealed at once (`oren:'struck', forsaken:true`). A blade during
  the fight never counts.

The choice is campaign state (`meta.actTwoPath`); a Level Select run keeps its own
(`G.actTwoSessionPath`). The disease is never named (a test forbids the word).

## Numbers that are load-bearing (tests/landing-shores-stage.test.mjs)
- Chainhook range 470: strand lip → gut-a 369; gut-a hang → gut-b 453; gut-b → far lip 250
  (jump + double jump, no dash). Hull: strand → stern ring 275; → deck ring 331 (479 from the
  ground). Refuge ring 365 from the sand. Cliff ring 251 from the road; lip ring 422 from its hang.
- Refuge → jetty 805 (no jump without the floats). Floats: 140 apart; the last 60 short of the
  jetty and 114 under it at high water (double jump 147), 284 under at low water.
- Every step up that is walked into from below carries a coated, no-cling wall (raised ground
  has no sides in this engine), so no wall-jump climbs a shelf.
- Bars: floor (300) to 1180, and a Chainhook will not target a ring on the far side of a
  lowered bar. The overseer's shelf now has real footing and its own hook hoist; the other rings remain outside the barred encounter.

## Presentation
- Palette: bleached sand, salt-grey wood, rust. Only the King's things are gold (the jetty's
  gilt, the arches and bars, the Sunguard, the spire far inland); only the flower is white.
- The camera stands on the shelf you are on (`cameraFloor`): 200 / 0 / 300 / 720, deep only over
  the gut, so no view opens onto half a screen of the shelf's own body.
- Music (Aerth score, loudness-matched): "The Shore of Broken Ships" (−21); "Safe Harbor" once
  at the first landfall (−21); "The Last Spark of Darrow" while a bell fight rings (−18); "The
  Breaking of the Keeps" once when the bell is silenced (−18).
- Rest: The Holed Boat (not fast travel). Checkpoints: the dune above the flats, the jetty, after
  each fight, the headland.

## Verification of this refinement

17 focused Landing Shores/Colony tests passed, including new behavior tests for in-place
water damage, immunity and the descending-slam bell condition. Live private fixtures:
water damage without coordinate rewind; hook to hoist, slam cap, conscripts flee and bars
open; jump–dash–hook from the second wreck rib onto the refuge; both floating platforms
and double jump onto the jetty, with full Blood remaining. Arrival, high-water ribs and
bell shelf rendered and reviewed. No uninterrupted playthrough or co-op verification claimed.

Oren's hand/walk-past/two-strike choice and its later effects are unchanged. Gate fight,
walked Colony seam and ship arrival retained. Owner pacing/feel feedback and co-op remain
unverified. Local mirror rebuilt; no commit/push/deploy.
