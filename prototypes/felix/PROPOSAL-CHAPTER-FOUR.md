# Proposal · Chapter Four, *Borrowed Air* (the Updrafts)

Status: proposal for Isaac, nothing built. Base world 4, "The Updrafts", is not imported into the
Felix project yet (`data/world4.json` is the Movement Workshop; the export would need another name).

## What the world already gives us
- A vertical climb on wind: Rootbreach Lift, the Old Shaft, Bellows Rest, the Draw, **Kite Terraces**,
  **the Kite Lines**, Choir of Drafts, Needlewind Labyrinth, the Needle's Eye, Rain-Catcher, the
  Catcher Span, and the **Signal Crown** at the top. 15 checkpointed challenges and a final superroom.
- Its closing line: *"The Updrafts, floor to Crown, on borrowed air."*
- Kit: dash and strike only. No parry, so nothing from Chapter Three's counter carries over.
- One optional quest (the Blind Cartographer) and one secret, Ghost Wall. We'd strip the quest the way
  Chapter Three strips the defector quest.

## The story (Isaac is 11)
**The real day:** a windy Saturday in spring at Mom's. The big man from Chapter Three, who now has
a name the boy uses, pulls a kite out of his truck and asks Isaac to help fly it from the hill
behind the house.

**The problem, through a kid's eyes:** fun things are what Dad does: the knight story, the
flashlight. Liking a day with the man feels like taking something from Dad. The boy decides to be
polite about it, not to have fun.

**Felix becomes ACE**, a pilot with goggles and a long scarf, because Isaac is eleven and into
planes now. Strike becomes a scarf snap. The road is the kite going up: Felix rides the updrafts
from the lift to the Signal Crown while the kite climbs the sky behind him.

**The clues** follow Phantom's shape: Ace keeps a flight log, and each clue is misread.
1. **Kite Terraces:** the man doesn't know how to launch it, and it nosedives twice. *"he's never
   done this before."* (Isaac thinks it's proof the kite was never the man's idea.)
2. **Choir of Drafts:** the boy's phone buzzes. It's Dad. He doesn't answer. *"later."*
3. **Rain-Catcher:** the spar has writing on it the boy can't read from down here.

**The boss** (the superroom at the Signal Crown) is the kite caught in the top of the big tree,
seen through Ace's eyes as a storm with a mind of its own. The man holds the line steady below
("Hands Below, Cargo Above" is already one of this world's rooms) while Ace frees it.

**The reveal**, quiet the way Chapter Three's is: the kite comes down into the boy's hands, and
the writing on the spar is ISAAC, in Dad's handwriting. It's the same capitals as the box labels
in Chapter One. Dad bought it, and the man only picked it up. The grown-ups have been in on this
together all along.

**The ending:** Isaac calls Dad back from the hilltop and holds the phone up to the sky. Dad:
*"there she goes. you're a natural, bud."* The man stands a little back and lets them have it.
Liking one doesn't take anything from the other. Ace's log: *"WIND: borrowed. FLIGHT: ours."*

**The secret** (Ghost Wall): Dad's old plastic pilot's wings pin, from the first flight Isaac
ever took. It's a keepsake like Phantom's ID card.

## The second half (open question)
Chapters Two and Three end with ten Movement Workshop rooms. The workshop has no wind rooms, so
for Chapter Four the choices are:
- **A.** The kite's flight played through the Updrafts' own leftover rooms: three bank rooms
  ("No Place to Land", "Hands Below, Cargo Above", "Leave the Wind a Way Home"), the quest's
  Upper Channel and Measuring Funnel, and the passes. That's about 10 rooms, all with wind.
- **B.** Ask Codex for ten new wind workshop rooms in its Causeway-room style.
- **C.** No second half. The phone call at the Crown ends the chapter, which is shorter and
  maybe stronger.

My recommendation is **A**. The rooms already exist, they use this world's one mechanic, and
"Leave the Wind a Way Home" makes a good last room before the call.

## Why it fits the sample
- It stands alone: a kid, a kite, a new grown-up, and worrying that liking him is disloyal. No
  backstory needed.
- It follows on from Chapter Three. Phantom found out the man isn't the enemy, and Ace finds out
  the grown-ups are on the same side.
- One new device (wind), introduced alone and then chained, matching the one-mechanic-per-region rule.
- It's light. Nobody is sad at the end; the weight just goes.

## Steps if approved
1. Export world 4 under a new name (e.g. `node tools/export-world.mjs --world=4` → `world5.json`
   or `updrafts.json`) and wire `--chapter 4` the way Chapter Three was wired.
2. `ace_story.gd` / `ace_view.gd` modelled on the phantom pair (placeholder figures; Codex draws).
3. Record a road tour, then run sweeps and route checks as for Chapters Two and Three.
