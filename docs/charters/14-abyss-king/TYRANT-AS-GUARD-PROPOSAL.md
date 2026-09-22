# The Void Tyrant, second meeting — a proposal

*Status: **PROPOSAL ONLY**. Nothing here is built. Written 2026-09-20 against
`VERSION='7.138.0'`. The owner's instruction: the Tyrant's third band is the halfway
point of his fight, not the end of it; he returns a third of the way into the Abyss
King's level as the King's guard, "making that level really a 2-boss level", and that
second fight "should be different than his first 3-part phase".*

## What already shipped, so this proposal has a foundation

In 7.138.0 the first fight was changed to set this up:

- **Blood is restored to full at every band.** Each band is its own puzzle — read the
  height, build the pair, charge the loop — and arriving at the next one half-dead
  punished the band you already solved.
- **The last band fires a quarter slower** (interval `1.15 → 1.53`). Head height is the
  one band whose pair must sit off the floor, so it is the band with the least ground to
  read from; at 1.15 dodging was a coin toss rather than a decision.
- **He does not die.** The third band ends with `tyrantWithdraws()`: no corpse and no
  scatter, the body folds inward along one vertical seam the way a portal shuts, the
  seam hangs for 2.6 s after he is gone, and the crown is the last thing to go — upward.
  One line of text, `THE CROWN DOES NOT FALL`. `meta.tyrantWithdrew` is now recorded.

That flag is the hook this whole proposal hangs on.

## The problem this fight has to solve

A returning boss is a promise the first fight made. It fails in exactly two ways:

1. **It is the same fight again**, and the return is filler.
2. **It is a different fight with the same name**, and the return is arbitrary.

So the second meeting has to be *recognisably the same creature solving the problem the
knight beat him with*. He lost to an opposed pair at a matched height. A thinking enemy
does not walk back into that.

## The shape I propose — "THE RIGHT HAND"

**Where.** A third of the way into the Abyss King's level, in the King's own hall, as a
door you cannot go around. Not an arena at the end of a road: the King is visible past
him the whole time — throned, ignoring you — so the fight reads as *getting through* the
guard rather than *beating* a boss.

**The turn.** He steps out of a seam like the one he left by, and the first thing he does
is the thing he learned: **he takes the mouths away.** The arena's slate faces are his
now. That is the fight's sentence in one line — *last time you moved your geometry around
him; this time he moves it around you.*

### The three things he does that he could not do before

1. **He closes his own seams.** Every few seconds he opens a portal pair of *his own*
   across the hall and steps through it, so he is never where your pair is aimed. His
   pair is visible for about a second before it opens: that tell is the fight's clock.
2. **He inverts a placed mouth.** If you leave a mouth on a face for more than a few
   seconds, he flips its facing — what went in comes back out at you. It is never
   destroyed, only turned, so the counter is to *use it before it turns* rather than to
   place it perfectly. This is the opposite of the first fight, where taking your time to
   align was the whole skill.
3. **He fights on the King's floor, not his own.** The hall has the King's hazard running
   through it (whatever the King's level ends up owning), and the Tyrant uses it — he is a
   guard in someone else's house, and the house is on his side.

### How you win — three answers, none of them the first fight's answer

The first fight was one verb repeated at three heights. This one asks for three different
verbs once each, in any order, and none of them is "align a pair and wait":

- **Take a seam from him.** When his pair is open and he is mid-transit, a mouth of your
  own placed on the *exit* face makes his transit come out where you chose. He arrives
  stunned and open. (Twin portals, used reactively rather than architecturally.)
- **Make him hold still.** Oren, sent to a post under the hall's own mechanism, denies
  him one of the two faces for a stretch — he cannot open a pair with only one face, so
  he must cross the floor on foot, which is the only time he is catchable.
  (Companion command, and the first fight had no use for Oren at all.)
- **Answer the volley.** His ranged pattern is the one you already know, slowed a quarter
  — and the Counter now sends it back through *his own open seam*, which puts his shot
  into his own back. (Counter, and a direct callback to the band fight's rhythm.)

Each of the three drops him to a knee for a few seconds. Three knees and he is done.
**Sword damage never moves him**, the same rule the Colossus holds.

### How it ends

He is not killed here either — but this time the player should *understand* it. He goes
down on the third knee, and the **King** ends him: a hand from the throne, without
standing up, without looking. The guard is spent and the King spends him. That is the
moment the level turns from "two bosses" into "one boss and the thing he owned", and it
costs the King nothing to show it.

That also answers the structural question cleanly: the Tyrant's arc finishes inside the
King's level instead of leaving a third meeting owed.

## What it reuses, and what is genuinely new

**Reuses:** the tyrant body, shot and band visuals; `portalGate`/`paradoxFight` plumbing;
the Colossus's three-plate "one verb each, order free" structure; `followerOnly`/`sendPost`
for Oren; the Counter rebound that already exists.

**New:** an enemy that *places* a portal pair (the player's own placement code, driven by
the boss); a mouth-inversion effect on player-placed mouths; the King's intervention beat.

**Rough size:** comparable to the Colossus's phase 3 — a new AI state machine plus three
verb triggers — and smaller than the Colossus's phase 2, because it needs no new room.

## Open questions for you

1. **Does the King's level exist enough to host this yet?** Stage 14 is still procedural.
   This proposal assumes the hall is authored first; if you would rather, the same fight
   works as the *opening* of the King's level rather than a third of the way in.
2. **Should the first fight tell the player anything?** Right now the withdrawal is pure
   implication — the seam and the crown going up, no text beyond "THE CROWN DOES NOT
   FALL". I would leave it exactly that quiet, but it is your call whether the
   Recollection or a stele should confirm it before the King's level.
3. **Oren's denial** is the one beat that could frustrate rather than empower. Alternative:
   he does not deny a face, he *holds one open for you* — the same mechanic read the
   generous way. I lean toward holding it open.
