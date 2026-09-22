# The Ember Colossus — a proposal for phases 2 and 3

*Status: **BUILT** in 7.133.0 (2026-09-19). Phase 1 is unchanged. The owner's answers:
phase 2 goes up (my call, alternative available on request); the crane plate needs
Oren, with a slightly harder route without him; about four minutes overall. See
"As built" at the end for every place the build differs from this proposal.*

## What the owner asked for

> The first phase is OK, but I don't like how the player has all his skills, and this
> boss fight only employs the ground pound throughout all 3 phases. The second and
> third phase should be cut entirely, and replaced with phases that actually employ
> the knight's full, new skillset, with platforming, pressure while being chased,
> things you need to dodge from above.

## Where the fight stands today

| Phase | What it asks | Verbs it actually uses |
|---|---|---|
| 1 · The bed | The machine walks to a mould and pours; you set the mould first with the strike. Three refusals. | strike, walk, jump |
| 2 · The mount | It climbs onto the bed and the bed becomes a conveyor. More refusals. | strike, walk against a belt |
| 3 · Fronts + the last order | Pour waves travel outward from its feet; then it kneels under a tank for 16 s and you climb and strike a lid. | strike, one climb |

The knight arrives with **eleven verbs**: jump, weapon, **dash**, **linked portal**, **twin portals**, **wall jump**, **guard/counter** (rebounds melee and projectiles), **double jump**, attunement, **companion command** (send Oren), and the **downward strike** this region just gave them. Phases 2 and 3 use one of them.

## The shape I propose

One sentence per phase, so each one is a different *kind* of play rather than more of phase 1:

- **Phase 1 — Refuse it.** (unchanged) *Read the machine and get there first.*
- **Phase 2 — Outclimb it.** *A vertical escape: the pit fills, it pours on you from above, and you climb.*
- **Phase 3 — Turn it on itself.** *A pursuit across the casting floor, won by sending its own weapons back into it.*

---

## Phase 2 — Outclimb it (the vertical escape)

**The turn.** On the third refusal the Colossus tears the bed out of its rails and throws it aside. The pit floor opens and **molten metal starts rising** from below at a steady, readable rate. The arena becomes a shaft: the two side walls are the forge's scaffold (rune-faced, wall-jumpable), and the Colossus hauls itself up the *outside* of the shaft alongside you, visible through the grille.

**What you do.** Climb roughly three screens before the metal catches you:

- **Wall jump** up the scaffold faces. They are the fastest way up and the most exposed to the pours.
- **Double jump** between hanging moulds that swing on crane chains.
- **Downward strike** a hanging mould to *set* it. An unset mould drips and sags, while a set one is a step that stays. This carries phase 1's sentence ("the strike makes ground") into the climb, instead of repeating the refusal.
- **Dash** through a shutter that slides shut on a cycle, a timed gate between tiers.
- **Companion command:** Oren rides a counterweight hoist. Send him to its pad and the hoist raises a platform on the other side of the shaft, opening a shortcut. You're never required to use it, but it clearly helps.

**Things to dodge from above.** The Colossus reaches over the rim and tips its ladle-hand into the shaft, using the pour language the region already taught: gathering chevrons over the column for about 1 s, then the column falls, top to bottom. Some columns hit the moulds and re-melt them, so a set mould is safe and an unset one gets taken. Slag chunks break off the rim and fall on a shadow tell. Both have a sound cue and a visual cue, and neither shakes the screen.

**How it ends.** You reach the top gantry. The Colossus's pour valve is right there at the rim, and one downward strike onto it from the gantry cracks it. It loses its grip and falls back down the shaft into its own metal, which is the transition to phase 3.

**Failure.** The metal reaching you, or a column hit, costs Blood as usual. Being caught by the rising metal rewinds you to the **start of phase 2**, not the start of the fight. Its progress is height, so there's nothing to lose except the climb.

## Phase 3 — Turn it on itself (the pursuit)

**The turn.** The metal drains, the Colossus hauls itself out cracked and furious, and it **comes after you** across the casting floor. It's faster than your walk and slower than your dash. It stops being a machine on a schedule and becomes a pursuer.

**What it does.**
- **Stomps** that send a short shockwave along the floor. Jump or double jump over it.
- **An arm sweep** at knee height with a wind-up. Dash *through* it: the dash's invulnerability frames already exist.
- **Molten slugs** thrown in an arc. **Guard/Counter rebounds them.** A slug countered back into its chest cracks a plate.
- **Pours from its ladle-hand** onto where you *are going*, not where you are, using the same chevron tell as phase 2.

**How you win.** It has three chest plates over its core. None of them can be worn down with sword damage (the fight's rule that "damage can never buy an act" stays). Each is broken by turning one of its own weapons back on it:
1. **Counter** a slug back into it.
2. **Twin portals:** put one mouth under its pour and the other facing its chest, so its own metal goes straight back into it. This is the phase's showpiece and the region's portal verb finally paying off.
3. **Downward strike** from above: send Oren to the crane pad so the hook swings over it (companion command), then ride the hook or wall-jump the crane mast and strike down onto the exposed core.

The order is free. Each plate is a different verb, so any ordering asks for the full kit.

**How it ends.** With the third plate broken it stops mid-stride. Weapons down, it goes still in a works that has gone quiet: the existing "pacify" beat, kept as it is. Its cooled body becomes the bridge east, as it does today.

**Failure.** Checkpoint at the start of phase 3. A plate you've broken stays broken if you die, so progress is kept.

---

## What this cuts and keeps in code

**Cut:** `beginColossusMount` (the bed as a conveyor), the act-3 fronts (`startColossusFront` / `updateColossusFront`), the last order (`beginLastOrder`, `updateLastOrder`, `foundryDumpChannel`, `spillFoundryCap`), the submerged shelf, the lid and the Oren sluice-gate plate from `installFoundryBed`. The coolant tank that last order knelt under is already gone.

**Kept:** all of phase 1; the bed, the ladle pour tell and heat-stone setting; `pacifyFoundryOrphan`, `colossusBodyBridge`, `latchFoundryColossus` and the boss-skip circuit.

**New pieces, all built on existing systems:**
- a rising lava body, using the Fluid system (the old dump channel already animated a fluid's height at runtime);
- hanging moulds, which are heat stone on a pendulum;
- a pursuit AI, extending the `forgeRush` code that already exists;
- a portal-to-core check, extending the jet/portal transfer the old quench already used;
- a slug the Counter can rebound, since the Warden's rebound already exists.

**Rough size:** similar to the Run 2 Foundry rebuild for phase 2 (it's mostly a new vertical room), and a bit less than that for phase 3 (new AI plus three plate triggers).

## Open questions

1. **Phase 2 direction.** An upward escape is the proposal. The other option is a horizontal escape along the works, with the metal flooding from behind. Upward uses wall jump and makes sense of the "from above" threats, so I'd pick that.
2. **Oren in phase 3.** Is the crane hook a fair thing to hang a *required* plate on, or should plate 3 have a no-Oren route too, such as wall-jumping the crane mast? The proposal allows both.
3. **Length.** Phase 1 is about 90 s today. I'd aim for about 60–75 s for phase 2 and about 90 s for phase 3, so the whole fight lands around 4 minutes.

---

## As built (7.133.0) — where it differs from the proposal, and why

**Phase 2 · Outclimb it.** The shaft sits between two slick walls (12790 and 14010).
From the bottom up: three moulds (+120 each), a ledge you walk under the chimney's feet
from, the chimney (two rune faces 180 apart), a ledge sitting on the east pillar's top,
the shutter (open 0.35 s in 2.4; dash through), a ledge, a swinging mould, one more
mould, and the gantry at 1,200 with the valve at its west end. The metal rises at
22 u/s after a 4 s grace.
- **Every rise is +120, not +140.** The double jump tops out near +148, and at +140
  the takeoff window was about 40 units wide.
- **Pours hit where you're going, not where you have to wait.** Two in three melt the
  next unset mould above you, which is then left alone for 6 s. The third comes for
  you, but only when you're on stone wide enough to step aside. The first version
  aimed at the player and locked the climb solid.
- **Being caught** costs Blood and restarts the climb with 5 s of grace. Moulds you
  set with the strike stay set, so each retry is shorter.
- **The Colossus hangs level with you** outside the east wall and pours from above
  your head. The warning chevrons are clamped into the frame, and a heat wash grows
  on the bottom edge of the screen as the metal closes in.
- **Not built:** falling slag chunks (the pours are the threat from above) and Oren's
  hoist in the shaft (Oren's job is phase 3).

**Phase 3 · Turn it on itself.** It chases at 150, rushes at 380 if you keep away,
and alternates melee (stomp shockwave, knee-high sweep) and ranged (a molten slug, a
pour onto where you're heading). Three chest plates, each rimmed in its verb's colour:
- **Counter (lilac):** a countered slug flies home to it.
- **Portals (cyan):** a slug through your mouths comes out forged and flies home. It
  reuses the Foundry's forged-slug path with no water involved. It's a slug, not the
  pour, because portalling a pour column would have needed a new fluid system.
- **Strike (amber):** a slam that starts at least 300 above it. With Oren: send him
  to the pad; the hook comes down one jump off the floor, lifts you, flies over the
  Colossus and holds, and a slam goes through the hook. Without him: wall-jump the
  chimney behind the crane mast to the perch, then drop onto it as it comes after you.
- **The telegraph is the ring.** Every attack raises the same arm, so the ring on the
  floor shows for the whole wind-up (the first build showed it for 0.18 s). The
  stomp's ring sits just below the floor and the sweep's at knee height, so any jump
  clears them and the dash goes through the sweep.
- **Sword damage** no longer moves it after phase 1 at all.

**Verified in the engine:**
- A bot doing only what the level teaches (wait for stone, set moulds with the strike,
  wall-jump, dash the shutter, slam the valve) clears phase 2 in 12 of 12 runs, in
  25–52 s (one straggler at 113 s), losing 0–4 Blood.
- A bot that reads the rings and keeps its distance took 0 hits in 4 × 30 s of phase 3.
- Each plate breaks by its verb. The hook boards from 3 of 4 takeoffs and the strike
  from it lands.
- The mast chimney takes six wall jumps and 2.6 s, and the strike from the perch lands
  with the Colossus anywhere from 13,150 to 13,290.
- The ending latches the region, lays the body bridge, clears the shaft and opens the
  fissure.

**Not verified by a single bot:** one run through all three plates at once. Each was
proven separately.
