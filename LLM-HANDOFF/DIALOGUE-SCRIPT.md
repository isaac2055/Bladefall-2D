# Bladefall dialogue script: "Busy, then they notice you"

Status: **the Outskirts are implemented and voiced (7.359.0); every other region is written, not implemented.** This is the full replacement script for every spoken line in the game, in the style the owner picked ("#1": each person reacts in their own way). The next run implements it and animates the actions.

---

## The rules of the style

1. **Everyone is a stranger at first.** Nobody knows the knight, assumes a history with him, calls him "friend", or welcomes him back before he has been somewhere.
2. **People are busy.** Every first meeting opens on an action, written in *italics*. That action is an animation (its id is in `[brackets]`). They finish or interrupt it, and *then* notice you.
3. **How they react to you depends on who they are.** Each person is one of two types:
   - **Polite (P)**: they finish what they were doing, apologise for it, and give their name.
   - **Curious (C)**: they look twice, ask something blunt about you (the armour, where you came from, how you got past something), and only give their name after you've helped.
4. **The knight speaks only when spoken to**, in five words or fewer, and never opens a conversation. He doesn't remember his name or where he came from, and never says so unless asked.
5. **Familiarity is earned.** Second lines ("when you come back") assume only what you've actually done. Recurring people (Vey, Oren, Mara) recognise you *from the last place you met them*, not from before the game.
6. **No line repeats** anywhere in the game, and no two people share a pet phrase.
7. **No menus** except where the choice changes the world: the Archivist's books, the kneeling man, and the rift shards.

`ending` vs `longEnding`: the game shows `longEnding` when a quest has one, so `ending` is only its short fallback and may share words with it.

How to read the entries:

- `key` is where the line lives now: a `BFDialogueModule` id, a side-story field, or a function name.
- **K:** is the knight.
- Lines tagged *(stage direction)* are animations with no speech.

---

## How the Outskirts were built (7.359.0), for the next regions

- **Lines** live where they always did: `bladefall-dialogue.js` (residents), `bladefall-side-stories.js` (Rowan: `firstReturn`, `readyLines`, `unnamed`, `thanks:null`), `index.html` (`ambientFigureDialogue`, `residentHeading`, `residentTalk`).
- **Voices**: `public/audio/voice/<region>/<id>.mp3`, listed with their exact text in `public/bladefall-voice.js`. The conversation box plays a clip when the line on screen matches it (case and punctuation ignored) and types the text out to finish with the voice. Settings → Voices turns them off. Clips are ElevenLabs `eleven_v4`, the first of four takes, loudness-normalised to -18 LUFS, 64 kbps mono.
- **Cast**: Vey · Clara V. (`0ggs85h7hrWz8ExXnsBc`), Olan · Sir Stephen (`Aaz7hX6MUrjjm0ncqvAg`), Mara · Alice (`Xb7hH8MSUJpSbSDYk0k2`), Rowan · Mark Ritson (`S5BwrXIpDqxu5sni2xES`), the Knight · Daniel (`onwK4e9ZLuTAKqWW03F9`), the Traveler · Jordie (`U977vpWUjb8YL0J1JaFF`). Keep the Knight's voice for every region.
- **Animations**: `bladefall-resident-art.js` `BUSY`/`attend()`: a person is busy (`s.busy`) until the knight is within 130 units, gives a one-pixel start (`s.notice`) and turns to him, and goes back to work when he leaves. Busy poses so far: Vey rewraps her knee, Olan counts patrols on his tally stick, Mara slaps her chart flat, Rowan hones his spear.
- **Not yet animated**: the after-quest beats (Vey's ladle, Rowan ringing the bell, the Traveler's boot).

---

## 00 · The Outskirts

### Vey · Wounded Standard-Bearer · P
`outskirts.vey.before / .after`, plus a new third line once Rowan's quest is done.

- *[`vey-rewrap`] Rewrapping the bandage on her leg. She pulls the knot tight, winces, and looks up.*
- **First:** "Nearly... there. Sorry, I'd stand, but I'd regret it. Vey. The fire's for anyone."
- **When you come back:** "Back again. Sit, if you like. I won't ask where you've been."
- **After Rowan's bell:** *[`vey-ladle`] Ladling stew into a second bowl.* "Rowan's coming over tonight. Says he's bringing his own bowl. I'll pretend that's a surprise."

### Olan · Road Keeper · C
`outskirts.olan.first / .revisit / .muster`, plus the cut-watcher hint at index.html ~18276.

- *[`olan-clock`] Up on his toes under the stopped clock, poking the minute hand. It won't move.*
- **First:** "Twenty to four. Every blessed day." *(He notices you and stops.)* "...You came from the west? There's nothing west but the old camp." *(He studies your armour a moment too long.)* "Patrols turn at the post. Mind them."
- **When you come back:** *[`olan-crate`] Standing on an upturned crate that's still too short.* "You got past the patrols? Hm. Most turn round at the first post."
- **Soldiers at the posts (muster):** *[`olan-squint`] Shading his eyes, staring down the road.* "Soldiers at every post, and I never heard them march in. Did you?"
  **K:** "No."
  "Then go slow at the crossing."
- **Mara's quest active (hint):** "Mara's after the Glass post? Upper road. Quicker, if heights don't bother you."

### Mara · Road Surveyor · P
`outskirts.mara.ask / .progress / .done`, the `outskirtsReplayText` chart line, and the "Keep it dry" annotation.

- *[`mara-chart-wind`] Pinning her chart to a stake against the wind. It keeps lifting.*
- **Ask:** "Stay *flat*, you..." *(She looks up.)* "Oh. Hello. Mara, surveyor. Could I borrow your legs? Three posts between here and the Muster, and I need a bearing off each one. Stand close until the vane swings."
- **Progress:** *[`mara-pencil`] Sharpening a pencil with a short knife.* "Still missing some. Ash is by the old camp. Glass is up on the high ledge in Watcher's Cut. Iron's at the Muster."
- **Done:** "That's all three. It reaches the woods. Thank you. Keep the chart; I'll draw another."
- **Handing it over (annotation):** "Keep it out of the rain. I've only got the one."
- **Chart replay:** "Everything you've walked is drawn in. The blanks are the bits you haven't."

### Rowan · Gatekeeper · C · side story `gatekeeper`

- *[`rowan-sharpen`] Sharpening a spear that's already sharp.*
- **opening:** "Gate's shut. Nothing gets through." *(He looks at you properly.)* "Except you. How?"
- **short (K):** "I walked."
- **accept:** "Hm. Then walk up that tower and bring the bell down. Cart onto the iron stop first, then pull the brake. Bell comes to the empty post by my bench."
- **First return** (replaces the old question and discussion beats):
  - Rowan: *[`rowan-look-tents`] Looking over at the tents, not at you.* "Everyone moved to the camp. I didn't. Last time I left a post, people died while I was gone. You ever leave one you shouldn't have?"
  - **K:** "I don't remember."
  - Rowan: "Lucky."
- **ready:** *[`rowan-ring`] He rings it once and listens to the note carry over the tents.* "That'll carry."
- **thanks:** none. Rowan closes instead: "Rowan, by the way. I'm still deciding what to make of you."
- **ending:** "I'll move the bench to the camp side. Still see the road from there."
- **longEnding:** "My brother and I took the evening watch together. He'd moan about the cold, then hand me half his blanket. After he died I kept doing both shifts. Nobody asked me to. Evening came and I didn't know what else to do with it.\n\nThis is better. I can hear the bell from the bench, and I can see the road."
- **after:** *[`rowan-bench`] Sitting on the camp side of the post, spear propped against the bench.* "Bench faces the tents now."
- **Reward (Bellwing, `grantReward`):** "A drake roosted over that bell. Followed it all the way down. It'll carry you, if you let it."

### Traveler · Hollow Wanderer · P (generic escort)
- **greeting:** *[`traveler-tie-boot`] Retying a boot.* "Oh, hello. Road ahead goes through, I think. Mind if I walk behind you?"
- **bark:** "WAIT FOR ME!"

---

## 01 · Black Woods

### Orra · Clock Keeper · P
`woods.orra.*`, the pulse-one line, and the Resinworkers' Reserve line.

- *[`orra-shake-watch`] Holding a pocket watch to her ear, then giving it a shake.*
- **First:** "Stopped. Again." *(She sees you.)* "Oh, hello. Orra. I'd tell you the time if I had it. If you're going deeper, look at a branch before you trust it. Some of them aren't there."
- **When you come back:** *[`orra-wind`] Winding the watch very, very carefully.* "Still stopped. I've been told never to shake it, so I've stopped shaking it. The path back's clear."
- **Clock moved (pulse-one):** "It's reading {time}. One minute since you left. Don't say anything. It hasn't done it twice yet."
- **Bells started (muster and reserve):** "Bells started while you were off. Nobody I know is ringing them. If the low road's crowded, there's the workers' reserve above the far end of Briar Run. My daughter used to fetch wraps from it. Let it go and a walkway drops through the canopy."

### Pell · Resin Worker · C
`woods.pell.*`

- *[`pell-scrape`] Scraping amber off the bark into a jar.*
- **First:** *(He looks at your boots, then at you.)* "You're not resin crew. Here's the trick, then. Amber on the windward side of a branch, it's real. Amber on the lee side, don't jump. You'll go straight through."
- **When you come back:** *[`pell-label`] Labelling jars.* "Worked it out, did you? Took me a nettle patch."

### Hale · Quiet Veteran · C
`woods.hale.before / .after`

- *[`hale-shoulder`] Sitting on a root, rolling his bad shoulder.*
- **Before:** "Another one for the sword?" *(He nods up the path.)* "Roots have it. Vine runs to a counterweight. Hang off that, not the hilt."
- **After:** *(His eyes go to the blade, then to your grip on it.)* "Where'd you learn to hold it like that?" *(He doesn't wait for an answer.)* "I'll sit a while. Shoulder's not finished complaining."

### Bram · Lantern-Keeper · P (escort)
`woods.bram.*`

- *[`bram-lamp-steady`] His lamp is swinging wildly, and he's trying to steady it with both hands.*
- **greeting:** "Easy, easy..." *(He sees you.)* "Oh! Bram. Sorry. Crossing? Stay where my lamp reaches. Any branch the light shines through isn't real."
- **repeat:** "There, see how it goes straight through that one? Not that one. I'll wait while you find another."
- **done:** "Across! I'll leave her burning on this side, so you can find your way back."
- **bark:** "MY LAMP—!" (unchanged)

### Elsie · side story `refuge` · P

- *[`elsie-stir`] Stirring a pot and keeping one foot clear of a broken step.*
- **opening:** "Mind the step, the end's rotten." *(She sets the spoon down.)* "Elsie. You look like you've walked a long way. My lantern caught in the branches east of here when I tried to take it down. Could you untie it? There's a wooden peg at the fork, and the lantern's just above."
- **short (K):** "I'll get it."
- **accept:** "When you're back, help me lay a board over this step and we'll hang it over the table. I'd rather not eat in the dark."
- **First return:** *[`elsie-floor-gap`] She steps back from a fresh hole in the floor.* "Lost a bit of pantry yesterday. I finished cooking from the doorway. The house isn't what it was. Lantern first; then we'll see to the step."
- **ready:** *[`elsie-taste`] She tastes the stew and frowns.* "Is it too salty? I never remember if I've salted it."
- **thanks (K):** "It's good."
- **ending:** "Two bowls and a working lamp. That's supper. Sit before it gets cold."
- **longEnding:** "My sister cut the carrots so small you could barely find them. Said it made the soup go further. I cut mine big. If someone's walked all day, there ought to be something on the spoon.\n\nI know this place needs more than a board and a lamp. But I can mend a little and cook a little while I work out what's next. There's another helping if you want it."
- **after:** *[`elsie-lantern`] Adjusting the lantern over the table.* "Still mostly a kitchen."

### Tamsin · The Assessor · P (Ethereal Goods, and the *Inventory of Effects* quest)

- *[`tamsin-sort`] Turning bottles on a shelf so their labels face out.*
- **greeting:** "One moment, these all face the front. There. Tamsin. I assess what's left and sell what's useful. The bottles are sealed, and I've checked the lens myself."
- **workshop gift:** "I set this fragment aside when I sorted the last delivery. I'd rather it went with someone than sat in my drawer."
- **gift closer:** "Then it has somewhere to be."
- **Already claimed:** "You have the fragment already. The stall's still open."
- **Inventory, ask:** *[`tamsin-ledger`] Running a finger down a list, then stopping.* "This list says these things are yours. I've never seen you before, which is odd. Three entries are missing: the broken standard past the Woods, the Frost Court's siphon record, and the Foundry ledger. If you pass them, would you look?"
- **Inventory, done:** "That completes it. I hoped the list would feel less familiar once it was finished. It doesn't. Forgive me, that isn't your concern."
- **Inventory, after:** "All entered, and in order. I'm sorry they were ever scattered."

---

## 02 · Broken Causeway

### Oren · Causeway Chainwright · P
`causeway.oren.*`, the *Release the Causeway* quest, and the Chainwright's Reserve.

- *[`oren-ear-chain`] One hand on the chain handle, his ear pressed to the links.*
- **First:** "Hear that?" *(He straightens.)* "Gate chain, carrying the whole load on its own. Oren. Chainwright. If you're headed through the Drop Yard, you could save it."
- **Quest, ask:** "Two safety catches in the Drop Yard. Knock the first loose, let the hoist settle on its cradle, then free the upper one."
- **Quest, progress:** "The cradle's meant to take that weight. Right now the gate's taking it. First catch, then the upper."
- **Quest, done:** *[`oren-release-handle`] He lets go of the handle and flexes his fingers.* "Listen. Nothing. That's a chain that isn't about to snap."
- **Quest, after:** "I'll keep this road open. You'll want somewhere to come back to."
- **When you come back:** "Still pulling. I can feel it through the handle."
- **Muster:** "Every link rattled last night, end to end. Nobody touched the handle."
- **Reserve:** "There's a spare seal up on the camp's high bracket. Unwind the drum and the Chainwalk service span comes down."

### Sable · Stretcher-Keeper · C
`causeway.sable.*`

- *[`sable-knot`] Re-knotting a stretcher pole.*
- **First:** "Two ways over." *(He looks you up and down.)* "You're not one of the yard's. Lower planks: slow, but covered. Hanging walk: quick, and every guard can see you. Pick the one you can manage today."
- **When you come back:** "Another crossing? Breathe first, whichever way."

### Silas · side story `defector` · P

- *[`silas-pace`] Walking a fixed line, counting under his breath. He turns sharply at the end.*
- **opening:** "...thirty-nine, forty." *(He turns, and on the next pass he sees you.)* "Good evening. I'm Silas. Forgive me for not stopping; I can't. The governor above the maintenance lift turns me every forty paces. Release the brake beside this walk, ride the lift up and break the gear. Then open this gate, if you would."
- **short (K):** "Where's the brake?"
- **accept:** "Beside the lift. The gear's on the high shelf beyond it. I'll be here. I'm always here."
- **First return:** "I can count the turns. I can decide to stop. My legs listen to neither. There's a patch of sunlight past the end of my route. I'd like to stand in it."
- **ready:** *[`silas-step41`] He takes a forty-first step and looks down at his feet.* "Forty-one."
- **thanks:** none.
- **ending:** "The sunlight first, I think."
- **longEnding:** "I can go anywhere. I find I can't think of anywhere. May I walk with you until I do? The sunlight first."
- **after:** *[`silas-bench`] Sitting on the bench and testing the seat with one hand.* "I chose this bench. Myself."
- **Reward (Chain Trolley):** "It counts its own links now. Hold on, and it will take you."

---

## 03 · The Updrafts

### Talla · Kite-Mender · P
index.html ~5350.

- *[`talla-thread`] Biting off a thread and holding the sailcloth up to the light.*
- **First:** "Hold on." *(She finishes the knot.)* "Talla. I mend the kites. The harness is tied off above the drafts, with the brake pin beside it. Take both."
- **When you come back:** "Look at the stretch in that cloth. You've flown it hard. That's what it's for."

### Edrin · Rain-Catcher Keeper · C
index.html ~5463.

- *[`edrin-tip-cup`] Tipping a cup into a gutter and watching the water run down.*
- **First:** "Each gutter spills into the next, see?" *(He turns.)* "Where'd you climb up from? Nobody comes up the drafts. The cups tip when they're full. Nobody's touched them in years."
- **After:** "Basin's holding level. Everyone's sharing it."

### Oren at the Crown · C, recognises you
Profile `ilyra` in code, `interactWithIlyra`, and *Kindling the Sky*.

- *[`oren-oil-wheel`] Oiling a seized wheel. He stops with the can tipped.*
- **ask:** "You. From the Causeway." *(He goes back to oiling.)* "The Crown runs on three machines. None's turned since the wind changed. Get them going."
- **thanks:** "All three turning. And it's lowering something it was never built to carry."
- **Harness:** "I patched that harness. The wind found every loose stitch."
- **Flues:** "Warm air. The old flues are drawing again."
- **Gutters:** "Rain's running. All it wanted was an open gutter."
- **Staying:** "I'm stopping up here with the sails."
- **Cache:** "There. The Crown kept it dry all this while. It's yours."
- **Kindling, ask:** "Frostfell folk can bank a fire to keep for days. Help Nim carry one through Frostfell, then come and look at the Choir flue. I want to know if heat rides this wind."
- **Kindling, done:** "The flue sang. Should've roared. Don't ask me why."
- **Kindling, after:** "Every time the wind shifts, I hear that note."

### The Cartographer · side story `cartographer` · C

- *[`carto-fingers`] Running his fingertips over raised lines on a map. He's blind.*
- **opening:** "Someone on the stairs. Heavier than the wind." *(He tilts his head toward you.)* "You walk like you're carrying iron. I need one reading from the upper channel. Could you divert the current into the funnel above my desk?"
- **short (K):** "Show me where."
- **accept:** "Funnel above the desk. Mind the chimes on the way. They're older than I am."
- **First return:** "I meant to leave in spring. Not this spring; an earlier one. There's always another sheet to check. The coast first, when I go. I can describe every inch of it. I've never been."
- **ready:** *[`carto-listen`] His head snaps toward the chimes as they ring a new note.* "That interval shouldn't occur. Don't touch it. Leave it."
- **ending:** "Help me move the desk outside? I'd like to listen."
- **longEnding:** "I could take another reading. I won't. Help me move the desk outside, would you? The instruments can come. I'd like to listen to that for a while."
- **after:** "The coast first. I'm taking the small notebook."
- **Reward (Kite):** "Frame's mended. On this wind, she'll carry you the length of the canyon."

### Aven the Sail-Cutter · Bellows Exchange · C

- *[`aven-snip`] Snipping sailcloth along a chalk line.*
- **greeting:** "Nothing I sell beats the wind." *(She glances at your boots.)* "It just lets you live through your mistakes. Most of them. Have you flown before?"
- **workshop gift:** "Your grips are coming unbound. Hold still, I'll do both."
- **gift closer:** "There. They'll hold a few more falls."

---

## 04 · Hollow Marksman

### Mara · Road Surveyor · P, recognises you
Profile `marksman-fletcher` / `daro`, index.html ~5543, and *The Open Watch*.

- *[`mara-sight-tube`] Squinting through a sighting tube, then lowering it.*
- **First:** "That's not right." *(She sees you.)* "You. From the camp road. You got through the Woods, then."
- **Token:** "The watch token above the gallery's got my mark on it. I charted this road before anyone put a watch on it. I'd like it back."
- **Open Watch, waiting:** "I'll be at the far gate, out of the line of fire."
- **Open Watch, done:** "That's my mark. Cut it before any of them wore masks. Here, the purse is yours."
- **After:** "The road east is on my chart. Nobody's walked it since I measured it."
- **Note:** the quest text says "Daro", but the person you see is named Mara. Pick one when implementing.

### Senn · Veil-Mender · C
index.html ~5574.

- *[`senn-needle`] Mending a torn veil, needle held between her teeth.*
- **First:** "Mm." *(She takes the needle out.)* "You've got a portal on you? Blue's yours. Put it wherever you want to start. Orange is nailed to the far scaffold."
- **When you come back:** "Blue moves, orange doesn't. Orange belongs to the watch. Don't ask me to unpick it."

### The Recruit · side story `recruit` · P

- *[`recruit-duck`] Peeking over a wall and ducking back as a bolt thunks into it.*
- **opening:** "Nope." *(He sees you.)* "Oh. Hi. Sorry. I'm... I can make the crossing. I can. My helmet's up in the watchtower, is the thing. Could you get it? I'd go, but."
- **short (K):** "Which tower?"
- **accept:** "The one with the flag. Right. Then we cross together. Stay close? Not that I need... just close."
- **First return:** "It was my uncle's. Three campaigns. I know it won't make me less scared. I'd still like it back."
- **ready:** "Your leg, is it all right? I pulled hard when that brace came down. Sorry. Not sorry. You know."
- **Helmet lost (`renderDialogue`):** "Wait. Where's my helmet? I didn't even notice it go."
- **ending:** "We got across."
- **longEnding:** "I thought I'd feel different with it on. I'm still scared, mostly. But we got across. Could we go back for it later?"
- **after:** *[`recruit-drill`] Practising runs between two walls.* "Again. With the helmet, ideally."
- **Reward (Ballista):** "I re-strung both ballistas. A bolt will carry you. I've done the sums. Mostly."

---

## 05 · Ruined Keep

### Oren · Chainwright · P, recognises you
`keepKeeper`, index.html ~6734 and `ambientFigureDialogue`.

- *[`oren-tap-chain`] Tapping each chain link with a small hammer and listening.*
- **First:** "Chains hold." *(He looks over.)* "Causeway, wasn't it? The floor's another story. Watch your feet."
- **When you come back:** "I know these links. Mended half of them myself, years back."
- **Has wall-jump:** "Grip suits you."
- **West seal open:** "That's a road home, open. Worth more than a crown."

### Veya · Hearth Keeper · C
index.html ~6737.

- *[`veya-blow-coals`] Kneeling and blowing on the coals.*
- **First:** "How'd you get in? The gate's been shut a month." *(She goes back to the coals.)* "The west gate's the only road out. East is more Keep, and it isn't friendly."
- **When you come back:** "If you bring anything down from the high archive, bring it west. Don't leave it lying about."

### Tovin · Keep Mason · P (escort, and Keeper's Counter)

- *[`tovin-brace`] His shoulder braced against a gate that keeps sliding shut.*
- **Escort greeting:** "Tovin, mason. These gates take two: one to hold, one to pass. I'll stand on the plate. You go."
- **bark:** "THE GATE, GO!"
- **Shop greeting:** *[`tovin-rummage`] Rummaging in a tool chest.* "I'm hopeless with names, but I never forget a tool. Keep's still got a few good ones."
- **Workshop gift:** "My old stamp still takes! Bring the blade over. Bow as well."
- **Gift closer:** "Mind you don't notch it on the first door."

### The Archivist · side story `archivist` · C

- *[`archivist-count`] On a ladder, counting spines with one finger. The finger stops at a gap.*
- **opening:** "Forty, forty-one... gap." *(He looks down at you.)* "Three volumes missing. The upper gallery came down. Can you climb?"
- **short (K):** "I can."
- **accept:** "The bindings are older than the shelves. Carry them flat."
- **First return:** "They disagree about the gate, whether it was open. If it was, someone could have stopped what happened. I was on the stairs, helping someone down. Smoke. A sleeve tearing in my hand."
- **ready:** "The third disagrees with both of the others."
- **ending:** "I keep hoping one of them will say I couldn't have stopped it. Help me carry them to the courtyard. I need air."
- **Resolution (the one kept choice):**
  - **K:** "Keep them by the bench." → "Then I'll keep reading. Outside, at least."
  - **K:** "Burn them." → *[`archivist-brazier`] He holds the first one over the brazier for a long time.* "...All right. All right."
- **after:** "I'm still deciding where to go."
- **Reward (Bell-Ropes):** "The ringers' plan. They could cross the whole wall on the ropes. You'll manage."

---

## 06 · The Warden (Gaol)

### Vey · Standard-Bearer, in a cell · P, recognises you
index.html ~6981.

- *[`vey-keys-turn`] Sitting against the bars, turning a ring of keys over and over.* (Vey is a woman in the art.)
- **First:** "You. From the fire." *(She holds up the keys.)* "They locked me in with his keys. Funny, if you think about it."
- **Later:** "These doors open from this side. Always did. Nobody tried."
- **Has counter:** "Take them. I've set down heavier things than keys."
- **Turnkey's Reserve:** "They've unsealed the reserve above the east end of the court. Pull its chain and two maintenance bridges come down. There's a dressing in it. Nobody in here's going to use it."

### The Service Keeper · side story `keeper` · P

- *[`keeper-stamp`] Stamping forms one after another without looking up.*
- **opening:** "Work order?" *(Stamp.)* "No work order. I'm the Service Keeper; this entrance needs one."
- **short (K):** "Only the alcove."
- **accept:** *(Stamp. A long look.)* "...Straight there and back. There's a brown-paper parcel on the shelf. That's mine."
- **First return:** "Office upstairs sends the orders. The office has been empty all week. I stamp what comes. Nothing comes."
- **ready:** "That's the one. Someone moved it, before you ask."
- **ending:** "Leave the door on the latch."
- **longEnding:** "Service personnel are permitted to eat. Nobody specified which side of the door. Leave it on the latch when you go."
- **after:** "On the latch. Don't make me regret it."
- **Reward (Cage Run):** "Jailers' cage. Runs on the overhead rail. I didn't see you take it."

---

## 07 · Frostfell

### Nim · Frost Tender · C (escort, and `frostNimLine`)

- *[`nim-cup-flame`] Cupping a flame in both mittens, shielding it from the wind.*
- **greeting:** "Shh, don't breathe on it." *(He looks up at you.)* "You're not from the streets. Stay near the flame. Some walls here aren't real; it shows you which."
- **Heard it:** "You heard that too? It's all right. The fire's still ours."
- **Footprints:**
  - Nim: "Your footprints stopped in the snow, then started again higher up. How?"
  - **K:** "I jumped."
  - Nim: "Nobody jumps that high."
- **Saved one:** "I saved one flame. Just one. It's enough if we're careful."
- **Staying:** "I'll mind the fires now. Go on."
- **bark:** "MIND THE FLAME!"

### The Frostfell Woman · side story `winter` · P
Suggested name: **Ines**.

- *[`ines-chip-ice`] Chipping ice off a chair with a spoon.*
- **opening:** "Don't mind me." *(She sets the spoon down.)* "Ines. The coal's in the upper shelter. The sack's split, so use the bucket. I can't manage the steps anymore."
- **short (K):** "I'll bring it."
- **accept:** "Mind the last step. It's dreadful."
- **First return:** "Heating this room will melt everything in it. I know. I've been cold a long time. Could you set the blue cup outside first? The handle's glued; hold it from underneath."
- **ready:** *[`ines-point-chair`] Pointing at the armchair.* "Sit. That was my husband's chair. He'd have told you to sit as well."
- **ending:** "He swore it was the comfortable one. It's a dreadful chair."
- **longEnding:** "He swore it was the comfortable chair. It's a dreadful chair. Sit anyway; I'll find a cushion. Put a bowl under those flowers, would you? They're about to drip."
- **after:** "The floor's still wet. Mind your feet."
- **Reward (Sled):** "My sled from the perfect day. The dogs know every road up here."

### Venn · Stove Factor · C (The White Exchange)

- *[`venn-coal-count`] Counting lumps of coal into a scuttle.*
- **greeting:** "Eleven, twelve." *(He eyes your armour.)* "That's not cold-country iron. Warmth costs, same as everything. Coal's dear this high."
- **Workshop gift:** "Found this under the stove. Kept dry all winter, somehow. Take it; I can't sell it."
- **Gift closer:** "Carefully's the only way anything lasts up here."

---

## 08 · Frost Sorcerer · White Court

### Vey · Sluice Keeper · P, recognises you
`interactWhiteCourt`, index.html ~8074, and ~7998.

- *[`vey-hand-water`] Sitting by the channel with one hand trailing in the water.*
- **First:** "You made it out of there too, then." *(She nods west.)* "Could you free the service wheel, back that way? Nothing flows until it turns."
- **Wheel turning:** "Hear it? I used to keep the road. Water's easier; it goes where you send it."
- **Has attunement:** "No orders today. Sit a minute. Listen."
- **Standard:** "I put the standard down for good. Water runs downhill and doesn't argue."

### Ada · Glassworker · C
- *[`ada-tap-mold`] Tapping a cracked mold and listening to it.*
- **Before the wheel:** "Dry molds crack. I'm idle till Vey's wheel turns." *(She looks you over.)* "You're no petitioner. Past the refuge, their cold spells freeze a channel hard enough to stand on."
- **After the wheel:** "Molds are cooling. The court still orders cups, and nobody leaves with anything in them."

### The Creature Keeper · side story `ember-pet` · C

- *[`creature-fan`] Fanning a small fire-creature with an apron.*
- **opening:** "Don't touch his back." *(She sniffs.)* "You smell of frost. Where've you been? Never mind. He's too hot to settle. Could you bring a little cold through?"
- **short (K):** "A little."
- **accept:** "Start small. I need to see how he takes it."
- **First return:** "Water, shade, moving his bed. Won't drink. Been pacing since yesterday. Everyone up the road wants out of the cold, and he's on fire."
- **ready:** *[`creature-curl`] The creature curls up and its feet twitch.* "Look at his feet. He only does that asleep."
- **ending:** "There he is, snapping at your glove."
- **longEnding:** "I'm still waiting for something to go wrong. Oh, there he is, snapping at your glove. He's always been a little bastard. Thank you."
- **after:** "Asleep. Don't poke him."
- **Reward (Winter Road):** "Your bit of winter grew into a fox. It'll make you a road."

### Sluice Counter · Vey's Service Drawer (no one behind it)
- **greeting (note):** "Leave the cost beneath the weight. The tools belong to whoever returns them."
- **Workshop (note):** "Take what you can use."
- **Closer:** *[`drawer-shut`] The drawer slides shut on its own.*

---

## 09 · Emberdeep

### Oren · Chainwright · P, recognises you (escort, profile `sera`)
- *[`oren-heat-seal`] Holding his palm near the seal, then pulling it back from the heat.*
- **greeting:** "You again. I'm starting to think you're following me. That seal throws back anything iron. It's never once stopped me."
- **bark:** "STILL HOLDING!"

### Sera the Courier · C (The Cinder Ledger, and *The Courier's Proof*)

- *[`sera-chalk-crates`] Marking crates with charcoal and counting under her breath.*
- **greeting:** "Everything down here came through the fire on somebody's back." *(She looks at yours.)* "Mostly mine. Prices reflect that. Who sent you?"
- **Workshop gift:** "Carried this through three collapsed tunnels, one of them on fire. Your turn."
- **Gift closer:** "It's been through enough. Don't waste it."
- **Proof, ask:** "Two things. Send one of their shots back through your portals. Then read the prayer in the Inversion. Tell me after."
- **Proof, done:** "So the seal never cared what you are. Only what it takes you for. I can use that."
- **Proof, after:** "Every locked door I see now, I think: beaten one of you."

### The Foundry Workers · side story `quota` · Maker P, Breaker C

- *[`foundry-loop`] The Maker sets a part on the belt. The Breaker smashes it at the other end. Both sigh.*
- **opening:**
  - Maker: "Watch."
  - Breaker: "Scrap."
  - Maker *(seeing you)*: "You're not the supervisor, are you?"
- **short (K):** "No."
- **accept:**
  - Maker: "Shame. Follow the belt and look at the counters, then. Someone should."
  - Breaker: "Hands clear of the belt."
- **First return:**
  - Breaker: "That belt feeds scrap. I'm scrap. Supervisor said keep the line moving."
  - Maker: "The supervisor's office has been empty for months."
- **ready:**
  - Maker: "Mine's green. Yours?"
  - Breaker: "Green."
- **ending:**
  - Maker: "Should we tell someone?"
  - Breaker: "Who?"
- **longEnding:**
  - Maker: "Should we tell someone?"
  - Breaker: "Who?"
  - Maker: "Right. Sit down, then. I've lunch for two."
- **after:** *[`foundry-lunch`] Both sit on the belt and share lunch.*
- **Reward (Quota Cart):** Maker: "One cart, off the books. Don't tell the counters."

---

## 10 · Ember Colossus

### The War Automaton · side story `automaton` · P

- *[`automaton-panels`] Holding two wooden panels in enormous fingers. One splinters.*
- **opening:** "Ah." *(It turns its head toward you.)* "Good evening. Please hold the left panel. The right is already damaged. I am building a birdhouse."
- **short (K):** "I'll find a tool."
- **accept:** "There was a gripping attachment in the cooling forge. I cannot reach it."
- **First return:** "This is the fifth. I cannot feel the point where the wood begins to split. They nest in the broken machinery. Their last nest fell."
- **ready:** "You may release the panel."
- **ending:** "A bird is approaching. We should be still."
- **longEnding:** "Is the roof straight? Please check again. I would prefer not to make a sixth. A bird is approaching. We should be still."
- **after:** *[`automaton-wait`] Hands folded behind its back, watching a bird on the roof.* "It is inspecting the roof. I am waiting."
- **Reward (Throw):** "I have found small work that I like. Please stand in my hands."

---

## 11 · The Inversion

### The Neighbors · side story `neighbors` · P
Suggested names: **Wendell** (on the floor) and **Ottilie** (on the ceiling).

- *[`neighbors-tea`] One sits on the floor and one on the ceiling, both holding teacups and arguing.*
- **opening:**
  - Wendell: "I've invited her several times."
  - Ottilie: "And I've explained about the floor."
  - Wendell *(seeing you)*: "Oh, a visitor. Do excuse us. Wendell. And that's Ottilie, upside down."
  - Ottilie: "He's the one upside down. Could you join our tables? Then neither of us has to move."
- **short (K):** "Show me the tables."
- **accept:** Ottilie: "That one, and mine. Mind the cups."
- **First return:**
  - Wendell: "We used to meet on the middle landing."
  - Ottilie: "It collapsed. Last time I went over, he wore the tea."
- **ready:**
  - Wendell: "Two sugars?"
  - Ottilie: "One. For six years now."
- **ending:**
  - Wendell: "You might have said."
  - Ottilie: "I did, dear."
- **longEnding:**
  - Wendell: "You might have said."
  - Ottilie: "I did, dear. You used to try catching my spoons. Pass the biscuits."
- **after:** *[`neighbors-biscuit`] A biscuit passes through the portal between them.*
- **Reward (Ceiling Way):** Ottilie: "Up here it's one long corridor. Wipe your feet."

### The Sleepless Clerk · C (The Last Inventory)
- *[`clerk-stamp-upside`] Stamping a ledger that's upside down.*
- **greeting:** "Whichever way up you stand, your total comes out the same. I've checked. Several times." *(He stares at you.)* "You're not on any of my lists. I don't sleep, so I'd know."
- **Workshop gift:** "The damp missed this drawer. Take the fragment. One less thing to count, and I count all night."
- **Gift closer:** "Don't get it wet. Off you go."

---

## 12 · The Void Tyrant

### The Figure · side story `figure` · C

- *[`figure-mirror`] It copies your movement behind the glass. When you stop, it knocks.*
- **opening:** "Can you hear me? Through the glass?"
- **short (K):** "Yes."
- **accept:** "The release is on your side. I can see it. I can't reach it."
- **First return:** "How long have I been in here? Nothing on this side changes, so nothing marks the time. There are lights behind you. I've never seen them up close."
- **ready:** *[`figure-palm-glass`] It presses its palm to the glass.* "It's warm on this side too. I thought it'd be cold."
- **ending:** "Could we stop by the lights first?"
- **longEnding:** "Could we stop by the lights first? You can go on ahead if you need to. I want to see that part."
- **after:** *[`figure-lights`] It watches the lights instead of copying you.*
- **Reward (The Other Side):** "Step into one shard, out of the next. The glass remembers you now."

---

## 13 · The Abyss King

### The Bellkeeper · side story `alarm` · C

- *[`bellkeeper-striker`] Holding a striker away from a broken mechanism while it shudders.*
- **opening:** "Hands off the striker. Break it and the backup starts." *(Her eyes go to your armour.)* "You're no soldier of ours. Can you climb? We need the all-clear rung from the upper tower."
- **short (K):** "Teach me the signal."
- **accept:** "Three short, two long. Don't rush the last two."
- **First return:** "Silence means the tower's fallen. It was built to keep ringing after everyone here was dead. Half these soldiers know the fight's over. The alarm keeps calling them back."
- **ready:** "That's it. They're leaving their posts."
- **ending:** "Look, that one's asleep already."
- **longEnding:** "You can hear yourself think. Look, that one's asleep already. Tomorrow can wait."
- **after:** "Quiet at last."
- **Ring panel:** "All-clear: three short, two long." (unchanged)
- **Reward (Last Alarm):** "Ring it, and every door on the throne road opens for one breath. Run."

---

## 15 · The Deep Line

### The Miner · side story `miner` · C

- *[`miner-bell`] A bell rings from below the condemned track.*
- **opening:** *(A voice from below.)* "Someone up there? The cage is stuck!"
- **short (K):** "Keep ringing."
- **accept:** "Take the siding! The main line goes straight past. I hear every cart."
- **First return:**
  - Miner: "Is the board still up by the hoist? Is my name on it?"
  - **K:** "Crossed out."
  - Miner: "...Course it is."
- **ready:** "Look at that. Crossed me clean out."
- **ending:** "Pass me the pencil."
- **longEnding:** "Pass me the pencil. That's me back in. This other name, has anyone actually checked that shaft?"
- **after:** "Name's back. Waiting for my legs to stop shaking."

---

## 16 · Thunder Cliffs

### The Sailors · side story `sailors` · Owner P, Stranded sailor C
Suggested name for the owner: **Hallam**.

- *[`sailor-coil`] The owner is coiling rope and scanning the rigging.*
- **opening:** "Lost a brass charm up in the rigging." *(He turns.)* "Begging pardon. Hallam, bosun. If you're going aloft, keep an eye out."
- **short (K):** "What's it look like?"
- **accept:** "Brass, size of a thumb, split down the middle. Mind the loose line above the crossbeam."
- **First return:** "My father's. Carried it every voyage. I'm not saying it holds the ship together. I'd just like it back."
- **ready:**
  - Hallam: "He's got hold of it. Let him keep it till we get him down."
  - Stranded: "You'd split it?"
  - Hallam: "Said I would."
- **ending:** "Both hands on the rope now."
- **longEnding:**
  - Stranded: "Is yours working?"
  - Hallam: "So far. Both hands on the rope now; there's still the night to get through."
- **after:** *[`sailors-haul`] Both haul the same line, each with half the charm.*
- **Reward (Skiff):** "For luck. She runs before any wind on these cliffs."

---

## 17 · The Landing Shores

### The Organizer · side story `birthday` · P

- *[`organizer-hide-cake`] Hiding a cake under a sail and glancing around.*
- **opening:** "Is he looking? Oh, you're not him. Hello! Candles. We need the tin from the wreck. Put it behind the sail when you have it."
- **short (K):** "Who's 'him'?"
- **accept:** "Cobb. It's his birthday. Six of us and one cake. Keep the candles dry; there's only the one tin."
- **First return:**
  - Organizer: "Why is he hiding behind the boat? Did someone warn him?"
  - **K:** "I said be careful."
  - Organizer: "Then you can help explain."
- **ready:**
  - Cobb: "You said there were six of them."
  - Organizer: "There are. We made a cake."
- **ending:** Cobb: "Porch would suit me. Don't make an announcement."
- **longEnding:**
  - Cobb: "Porch would suit me. Don't make an announcement about it."
  - Organizer: "We'll bring the food out."
- **after:** *[`cobb-porch`] Cobb eats on the porch while the others bring him cake.*
- **Reward (Rocket):** "Saved the biggest one. Light it and hold on."

### The Kneeling Man · Act Two (`updateOren` / `takeHand`; the choice is kept)
- *[`kneeler-still`] Kneeling at the gate, head down, hands wrapped.*
- **First:** *(He does not look up.)* "Don't. It goes to whoever touches it."
- **K:** "I'm not afraid of it." → "You should be. I was, the first month. After that you're too tired."
- **What is it:** "Nobody here calls it anything. The flowers come up through the wrappings. After a while the bell's all you hear."
- **K:** "Then stay down." → "Haven't done anything else since the leaves turned."
- **Take his hand:** "...You'd do that? I've knelt here since the leaves turned, and not one of them—"
- **K:** "Can you walk?" → "If you're going in there, I can."
- **K:** "Who are you?" → "Nobody the King remembers. Ask me again when there's water."
- **K:** "Keep up." → "I've been following people a long while. I'll keep up."

---

## 18 · The Colony

### The Bandaged Man at the Well · C, later revealed as Oren
`sableIntro` / `sableWater`

- *[`bandaged-fill-cups`] Filling the cups of the sick one by one, with his back to you.*
- **Intro:** "I heard what happened at the gate." *(He doesn't turn.)* "The King's tap is on the conduit, over the well. Do what you came for."
- **If you brought the man:** "And you brought one in by the hand. Get the water down and I'll see to you both."
- **If you didn't:** "There's a man kneeling at the gate. Nobody's taken his hand, and they won't let me out to him."
- **K:** "I'll get the water down." → "Not by rushing. Mind the one who walks the conduit."
- **K:** "Why does the King want it?" → "For his fountains. He says the sun's coming up, and he wants to be clean for it."
- **K:** "Nothing to drink here?" → "Not since the leaves turned. We give them the dew, a spoon at a time."
- **Reveal:** *[`oren-unwrap`] He unwinds the bandage from his face. Months of beard.* "...There. Know me now? Stay close in the yard. I can open those shackles. It's what I do."
- **Water:** "Slowly. One spoon at a time."
- **Spring returning:** "The spring will find its way back up the pipe now."
- **Last shackle:** "That's the last one."

### The Mother · side story `mother` · P

- *[`mother-dew`] Spooning dew into a child's cup, shielding it with her body.*
- **opening:** "Not you as well. Everyone's told me to stop being difficult." *(She looks properly.)* "...No. You're new here. My sealed cup is in the old shelter. Would you bring that one? I want to know where it's been."
- **short (K):** "Which shelter?"
- **accept:** "The old one, past the pipe. Thank you. Everyone else has argued with me by now."
- **First return:** "They told me to drink and stop being difficult. That isn't the same as explaining what Sable did to the water. I'll ask him myself, after the little one's asleep."
- **ready:** "I spoke to him. He actually answered."
- **ending:** "Mine first. Only a little, to start."
- **longEnding:** "The neighbour used to defend the pipe as well. She admitted it. That helped. Mine first, only a little. Thank you for bringing our own cup."
- **after:** *[`mother-bedside`] The cup sits beside her child's bed.*
- **Reward (Paper Crane):** "He folded this for you. Don't laugh; it flies."

### A Woman by the Gate · C
- *[`gatewoman-blanket`] Pulling a blanket around her shoulders.*
- **First:** "You're not one of the King's." *(She squints.)* "He came through in summer, on foot, one hand in a glove. Had the pipe built before the leaves turned. Never took that glove off."
- **Later:** "Somebody walks that conduit all day. Wait for his back."

### Rift Shard: Colony Woman · C (decisive, so the choice is kept)
- **First:** "Before the King, another one came through that gate. Looked like you. Went straight through the tents like we weren't there, and a bell rang for it that nobody pulled."
- **K:** "What did it leave?" → "A bit of itself. Glass. Fell right by my cup." *(She holds out a violet shard.)*
- **K:** "Did it hurt anyone?" → "Didn't look at anyone. That was worse."
- **K:** "You're feverish." → "We all are. Doesn't mean I didn't see it."

---

## 19 · The Path to the Palace

### The Pilgrim · side story `pilgrim` · P

- *[`pilgrim-heave`] Heaving an enormous, clinking sack up onto one shoulder, cheerfully.*
- **opening:** "Oof. Good afternoon! I'm travelling with rather less these days. Would you carry this up the last climb? Please don't open it."
- **short (K):** "To the summit."
- **accept:** "Much obliged."
- **First return:** "Yes, it clinks. Medals. Among other things. I know what the one for exemplary humility says."
- **ready:** "I should have carried it myself. At least let me make lunch."
- **ending:** "That one was for exceptional restraint. Holds the pot steady, doesn't it?"
- **longEnding:** "That one was for exceptional restraint. Holds the pot steady, doesn't it? Sit. I can manage lunch without asking you to carry anything else."
- **after:** *[`pilgrim-pot`] Cooking, with one medal wedged under the pot. The sack is smaller.*
- **Reward (Feather Cloak):** "My lightest cloak. Jump from the shrine wall; the road will pass under you."

### Oren at the Palace Gate
- **Chain snaps:** "He always did build things to open from the inside."

---

## 20 · Sunspire Palace

### The Palace Gardener · side story `garden` · C

- *[`gardener-shutter`] Straining to close a shutter against the light. It swings back open.*
- **opening:** "His Majesty wants these open. The flowers need the dark." *(They see you.)* "Who let you into the garden? Doesn't matter. Three shutters, through the mirror gallery. Mind the light off the upper one."
- **short (K):** "Which first?"
- **accept:** "Nearest. Then up."
- **First return:** "I've told him what the light does. He says find another way. They're flowers. He wants it kept the way she loved it. She never saw it like this."
- **ready:** "We didn't lose that one. Look, by the bench."
- **ending:** "Will I be in trouble? Probably."
- **longEnding:** "Will I be in trouble? Probably. I'm tired of watching it die. Sit a moment. That one by the bench hasn't opened in years."
- **after:** *[`gardener-bench`] Sitting among the open flowers on the cleared path.*
- **Reward (Moonflower):** "Gone to seed. The pod lifts at dusk. Point it, and it drifts."

### The Servant in the Gold Mask · C
Choices kept (they're questions).

- *[`servant-scrub`] Scrubbing the fountain's gold and never stopping.*
- **First:** "The gardens must be green by first light, sir. The King says it's always first light."
- **K:** "Whose water?" → "The King's, sir." *(Quieter.)* "It came up the pipe from the tents. You can taste the tents in it."
- **K:** "Why the mask?" → "So he needn't see our faces, sir. The gold's for him."
- **K:** "Where is he?" → "The Throne of Noon, past the Crown. The doors only open for the sun."
- **Rift shard:** "You were here already, sir. Last night, in the Hall of Hours. You stood at the big dial and it ran backwards."
  - **K:** "That wasn't me." → "This was under the dial." *(A violet sliver.)* "It won't take a shine."
  - **K:** "Backwards?" → "A quarter to four. Half past three. Three. Then it was gone."
  - **K:** "Keep scrubbing." → "Yes, sir."

### The King (`yieldKing`)
- *[`king-glove`] He sits on the throne step and takes off the glove. The hand beneath is all flowers.*
- **Line:** "Every dial in this house says a quarter to four. I had them made that way. I wanted it to be morning a little longer."
- **Oren:** "Leave him the sun. It's all he has." Then: "He'll not run. There's nowhere higher."

### The Hydra (`updateHydra`)
- "You broke our chains, little knight. We don't forget that."
- "The one you left on the beach didn't stay there. It's walking back along every road you took."
- "Wherever it goes, the fights you won start again. Climb on. We'll carry you to the island."

---

## Gate Trials (`bladefall-gate-trials.js`)

### Olan
- *[`olan-wall`] Palm flat against the black wall. It drops a little.*
- **Offer:**
  - "Every time I come near it, it drops like that. Like it hears me."
  - *(He turns.)* "You're the one from the road. It isn't locked; it's asking. Climbs, crossings. I can't do them alone."
  - "Will you help me through?"
- **Help:** "Stay close. It opens from the inside, if you're quick."
- **Refuse:** "...Right. I won't ask twice."
- **Thanks:** "Half my life I've stood at that wall. Mind if I walk with you a while? I'd like to see where the road goes."
- **Back:** "Still there. It'll wait. So will I."
- **Follow:**
  - "Keep thinking it'll come down again behind us."
  - "Mara says the road bends north after the Muster. Never seen it bend."
  - "Lead on."

### Mara
- **Offer:**
  - *[`mara-measure-wall`] Holding a measuring rod against the wall.* "Came down an hour ago. I've been measuring it since. It doesn't measure."
  - "Olan, you got through yours? Then help me with mine. The Woods are on the other side, and I mean to chart them."
- **Thanks:** "Strangest survey I'll ever file. Come on, the Woods won't map themselves."
- **Follow:**
  - "Stay on the path. The Woods move it when you're not looking."
  - "I'm writing all of this down. Nobody will believe a word."
- **Ahead:** "I'll run ahead and see what the roots are hiding. Don't dawdle."
- **Again:** "Ready? The Woods aren't getting any closer."

### Hale
- **Offer:**
  - "Visitors. Nobody comes this deep for the trees."
  - "You'll want the gate. Go on, then."
- **Thanks:** "Faster than the last lot. The Woods are yours, for what they're worth."
- **Again:** "Still here? They're watching."

### Bram
- **Offer:**
  - "Not through that. I've seen it swallow people and spit them out the far side, shaking."
  - "You go. I'll hold the lamp here, for when you come back."
- **Thanks:** "You came out." *(He holds the lamp out to you.)* "I can't go past it. You carry her. She shows what's real in the Thicket."
- **After:** "Go on. She's better with you."
- **Again:** "I'll hold the lamp. You go."

### Mara (Marksman gate)
- **Offer:** "This one's a beauty. Ten turns, and not one of them kind."
- **Again:** "Ten turns. I'll wait at the top."

### Keep Sweeper
- *[`sweeper-broom`] Sweeping the same step over and over.*
- **Offer:**
  - "Nothing behind that wall but the stair and the damp."
  - "You've got the grip already. You'll come up the far side of it soon enough."
  - "Still. It'll let you try, if you're stubborn."

---

## Unchanged (not dialogue, or already in the right voice)

- Region captions, field notes, signs, relic descriptions, HUD and toasts.
- Act Two narration (`say`, `reachColony`, `leaveColony`, `reachPalace`, `openSluice`, `endOfAct`).
- The Vesper finale and its cards ("You cannot cut away what is missing."), and the comrade's line ("He who saved us has awoken.").
- The Tallyman and the Iron Echo descriptions.

## Removed

- The legacy side-story routes, which are already unreachable since 7.358: `harsh`, `refusal`, `afterHarsh`, `bad`, the hidden `leave`/`decline` buttons, and the second `forks`.
- `VOICES` in `bladefall-conversation.js`. Each resident's first meeting above replaces it, and the knight now speaks only when asked.
- Workshop knight lines (`work[1]`–`work[3]`). Each keeper gives the gift and closes the scene themselves.

## Names to approve
- Ines (Frostfell Woman)
- Wendell and Ottilie (Neighbors)
- Hallam (sailor)
- Cobb (birthday soldier)
- Ada (glassworker, already in code)
- Mara vs. Daro in Hollow Marksman

## Animation list for the implementation run
Every `[id]` above is one short loop or one-shot. Each person has a **busy loop** (played until you come near), a **notice beat** (stop, turn, look up), and sometimes an **after pose**. Count: 90 animations.
