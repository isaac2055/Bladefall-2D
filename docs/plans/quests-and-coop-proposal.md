# Quests in Explore and Ascend, and a two-player Ascend: diagnosis and proposal

2026-10-22, at 7.374.1. This is a proposal only; nothing is built. The code and data referenced are current.

---

## Part 1. Where the quests stand today

### Explore

There are three quest layers:

- **Side stories.** There is one per region, in `bladefall-side-stories.js`, with geometry in `bladefall-side-story-world.js` and the Causeway's in `bladefall-causeway-story.js`. There are 20 of them. Region 14 is cut.
- **Travelling questlines.** There are six, in `bladefall-quests.js`: Mara, Ilyra, Sera, the Ethereal Goods, Oren and Daro. Each is "inspect two things in other regions, then talk".
- **Residents' lines.** These are in `bladefall-dialogue.js`.

**The template every side story from Black Woods on follows:**

1. The giver stands still and asks for a thing.
2. You get three conversation choices, and they are the same three every time:
   - **short:** you accept;
   - **medium:** you ask two questions, then accept;
   - **harsh:** you insult them, which locks the quest and gives no reward.
3. There are two to four tasks. Each is a marker (`sideStoryProp`) that you reach and press Up on.
4. You go back and they say an ending line.
5. One line of "good" text describes what changed.
6. The reward is the same everywhere: a placeholder rest that restores two blood measures.

**The tasks across all 19 regions:**

| Region | Quest | Tasks as built |
|---|---|---|
| 1 Black Woods | Elsie, *A Place for Supper* | untie line → get lantern → mend step → set table |
| 2 Causeway | Silas, *The Clockwork Defector* | brake → strike gear → open gate |
| 3 Updrafts | Cartographer | portal the current → portal it through the chimes |
| 4 Hollow Marksman | Recruit | get helmet → escort him |
| 5 Ruined Keep | Archivist | volume 1 → volume 2 → volume 3 (all three are wall-jump fetches) |
| 6 Warden | Service Keeper | open door → fetch parcel |
| 7 Frostfell | Ines | fill bucket → light stove |
| 8 Frost Sorcerer | Creature Keeper | portal frost in → creature settles |
| 9 Emberdeep | Foundry Workers | inspect counters → loop scrap |
| 10 Ember Colossus | War Automaton | break mould (down-strike) → fit roof |
| 11 Inversion | Neighbours | fetch tea set (gravity flip) → connect tables (portals) |
| 12 Void Tyrant | The Figure | release with Echo |
| 13 Abyss King | Bellkeeper | climb tower → ring bell |
| 15 Deep Line | Miner | raise cage → walk him to the ledger |
| 16 Thunder Cliffs | Sailors | reach sailor (hook) → split charm |
| 17 Landing Shores | Organizer | candle tin → find soldier |
| 18 Colony | Mother | fetch cup → ask Sable |
| 19 Palace Path | Pilgrim | carry sack up |
| 20 Sunspire | Gardener | shutter → shutter → shutter |

### What the Outskirts does that the others don't

The Outskirts has Rowan's bell and Mara's road.

- **The world is machinery.** You don't touch a marker. You roll the cart onto the stop, pull the brake, climb the tower and let the bell go. The pulley brings it down, and then you hang it. Each step is a physical cause and effect that you can see.
- **The person changes during the quest.**
  - Rowan reveals his past on your first return ("Last time I left a post, people died").
  - He gives his name only when the work is ready.
  - He then moves his bench, so the place itself is different afterwards.
- **It touches the rest of the region.** Vey gets a new line once Rowan's quest is done, and the bell is now heard at camp.
- **It continues elsewhere.** Mara's chart runs through other regions, and in Ascend it opens her echo.

### The design problem

Each side story is a **request with errands attached**, not a situation.

1. **The steps are markers, not mechanisms.** Fetch volume 1, 2, 3; shutter, shutter, shutter; helmet, then parcel. These are reach-and-press-Up steps. The region's own device is used as a lock on a fetch, not as the puzzle itself.
2. **Nothing goes wrong and nothing is learned mid-quest.** You walk out, do the steps, walk back, and the giver says what the opening implied. Rowan's history shift is the only mid-quest reveal in the game.
3. **The giver is furniture.** Silas and the Recruit walk a little at the very end. No one works alongside you, is seen travelling, or reacts while you do the task.
4. **The same conversation shape runs 20 times.** Short, medium or harsh, and harsh always means "insult the giver". After two regions the player knows the grammar, so the choices stop feeling like choices.
5. **The endings are text.** The "good" consequence is one sentence. The region rarely changes: there's no new shortcut, open door, light, or person somewhere new.
6. **The rewards are identical and invisible.** Every quest gives the same placeholder rest. This breaks the standing rule that rewards come from optional quests and say what they give.
7. **The questlines are checklists.** "Inspect X in region A and Y in region B" is a trip, not a story. The objects inspected have no puzzle attached.

Silas and the Archivist feel alike because both are three interactions in a side room, then a speech, for the same reward.

### Ascend

The climb worlds (`bladefall-climb-worlds.js`) copy each side story as data:
- `giver`: a figure with one speech-bubble line (`line`, plus `lineDone` after);
- `sections`: a two-room optional branch, for example `cl3-c3-q-ladder` and `cl3-c3-q-governor`;
- `keepsake`: at the far end, worth a heart and opening that character's Fractured echo.

`bladefall-climb-view.js` draws the bubble when you stand near the giver. It shows the quest title in the HUD while you're in its branch, and grants the keepsake when you touch it.

**The design problem in Ascend:**

1. **The quest is a harder side room, not a quest.** The branch rooms are standard bank rooms. Nothing in them is the object of the request: there's no governor gear, no volumes, no stove. Whatever Silas asks, you do a platforming detour and pick up a token.
2. **The giver never speaks again and never acts.** There's one bubble before and one after. There's no conversation, no named step, no movement.
3. **The road and the quest don't touch.** The quest happens off-road. It doesn't change the road, and the road doesn't carry it.
4. **Mara's quest is the exception, and the template to copy.**
   - Her bearings (ASH, GLASS, IRON) sit in sections of the road itself.
   - The HUD tracks them.
   - She needs you to look closely at places you were already going.
   - The payoff (her chart, her echo) ties forward.

   Its only weakness is that collecting is passive.

---

## Part 2. Rules for every proposal below

Each quest gets five things.

1. **A device, not a marker.** Every step is done with the region's own mechanism, in a combination the main road doesn't use. This follows the one-mechanic-per-region rule: the quest is where the region's device gets its "chained" use. No step is "reach X and press Up".
2. **A turn.** One thing goes differently from the ask. It's discovered in the world, not told, and it changes what you do next.
3. **A giver who acts.** The giver works alongside you, crosses the screen, operates something, or is found somewhere new. Anyone who reappears elsewhere is seen going there, as Mara runs the route.
4. **A change you can see.** On return, the region is different: a shortcut, an open door, a lit room, a moved person, or a new resident line (as Vey's is).
5. **A named reward.** Each reward is specific and stated: a Fractured echo key (as now), a map-revealed shortcut, a rift shard, a charm or a skin. The shared rest placeholder goes away.

**Conversation.** Drop the fixed short/medium/harsh triad. Each quest has one decision that matters to that story, such as:
- what to do with what you found;
- whom to side with;
- whether to tell them something;
- whether to leave something broken.

A refusal is still possible. It is a decision about the story, not a choice to be rude.

**Ascend.** The same character and story are told as a climb.
- **Part of the quest overlays the road**, as Mara's bearings do. You carry, light, ring or move something as you go.
- **The branch rooms are built around the quest's object**: the gear room is the gear.
- **The giver gets a line at each step and is seen moving.**
- **Finishing changes one room on the road** (a lift, a door or a light), and still gives the heart and the keepsake.

---

## Part 3. Explore, region by region

Each region has five parts: what it is now, the steps, the turn, the change you see, and the reward.

### 1 · Black Woods: Elsie, *A Place for Supper*
**Now:** four fetch steps, then a supper line.

**Steps:**
- The lantern line runs through the canopy and is hooked over three branches. You free it branch by branch, using the Woods' colour-reading.
- Each freed branch swings the lantern lower. The light reveals the path to the next branch.

**Turn:** Her house is the "place that will not remain". With the lantern lit, part of the house is gone each time you look away. You have to bring the table out under the lantern before the kitchen fades.

**Change:** Supper is laid outdoors under the lantern. On later visits only the lantern hook remains, and Elsie is at Vey's fire in the Outskirts, seen walking there.

**Reward:** Elsie's Lantern, a carried light that reveals hidden colour platforms in the Woods.

### 2 · Broken Causeway: Silas, *The Clockwork Defector*
**Now:** brake → strike gear → gate.

**Steps:**
- The governor is a counterweight machine, which is the Causeway's device. Stopping it means unbalancing it: shift weights so that his patrol arm locks while he is at the far end.
- He walks his forty paces throughout, so the timing matters.

**Turn:** When the gear stops, Silas stops mid-stride, and he can't start walking on his own. You lead him a pace at a time: he copies your stops and starts. This is a short escort where he mirrors you.

**Change:** He reaches the patch of sunlight past his route and stays there. The patrol walk's gate becomes a shortcut.

**Reward:** Silas's Winding Key, which opens his echo as now, plus the shortcut.

### 3 · The Updrafts: the Cartographer
**Now:** portal the current twice.

**Steps:**
- He asks for three readings. Each reading means routing the wind with a portal to a different instrument: funnel, vane, chimes.
- He calls out the expected value. You watch the instrument and see it's wrong.

**Turn:** The third reading can only be taken by sending the current out over the canyon. The instrument he needs is the open air, so he has to come outside to hear it.

**Change:** His desk is outside at the cliff edge. His map, read at the desk, marks the Updrafts' hidden kite route.

**Reward:** A map reveal for the region, plus his line in Mara's questline. The two cartographers compare notes.

### 4 · Hollow Marksman: the Recruit, *Borrowed Courage*
**Now:** fetch helmet → escort.

**Steps:**
- He refuses to cross the firing lane, so you cross with him, shelter to shelter.
- The Marksman's volleys have a rhythm. He moves only on your signal (stand next to him and press Up), so you read the volley and call each move.

**Turn:** Halfway across, the helmet falls into the lane. You can risk it, or cross without it. If you cross without it, he says he didn't need it.

**Change:** He takes the watch post on the far side, and his volley warnings appear as a cue on later attempts at the boss.

**Reward:** A Watchman's Whistle: the volley rhythm is shown on screen for the boss.

### 5 · Ruined Keep: the Archivist (the "bookkeeper")
**Now:** three identical wall-jump fetches.

**Steps:**
- The three accounts disagree about one fact: whether the gate was open.
- Each volume is found where its writer stood that night: gatehouse, tower stair, courtyard. The climb to each shows what that writer could and couldn't see. You read the page in place.

**Turn:** At the gatehouse you can see that the gate's counterweight was cut from inside. Nobody could have held it. The question he wanted answered isn't the one that matters.

**Decision:** Tell him, or let him keep looking.

**Change:**
- If you tell him, he carries the books into the courtyard and closes the archive.
- If you don't, he stays and keeps reading.
- Either way, the gatehouse stair you used becomes a road shortcut.

**Reward:** The Third Account, a lore page plus a Keep rift shard.

### 6 · The Warden: the Service Keeper, *Stand Aside*
**Now:** open the door → fetch the parcel.

**Steps:**
- The service passage runs parallel to the prison block, with cell doors on a timed lock cycle.
- He runs the board from his booth and opens doors as you call them (stand at a speaker grille). You guide each other: he can see the board, and you can see the guards.

**Turn:** The parcel isn't lunch. It's a key someone left for a prisoner. Bring it to him, or to the cell it was meant for.

**Change:** Either the service passage stays on the latch (a shortcut), or one cell is empty and the prisoner turns up in the Frostfell camp, seen walking out.

**Reward:** The shortcut, or the prisoner's charm. Each says what it does.

### 7 · Frostfell: Ines, *The Perfect Day*
**Now:** bucket → stove.

**Steps:**
- The coal is above the frozen room, and carrying it warms the ice under you. That is Frostfell's device (ice that melts with heat), so the route down has to be planned: a melted step won't hold twice.
- At the stove, the room thaws in stages. Each stage reveals one object from the day she's remembering.

**Turn:** Thawing the room floods the lower shelter. Her neighbour's things are there. Choose which room stays frozen.

**Change:** The room is warm and set for two. The flooded shelter becomes a swim route, or stays frozen as a climb.

**Reward:** Her husband's scarf, as a skin or charm, and the route you chose.

### 8 · Frost Sorcerer: the Creature Keeper, *A Little Winter*
**Now:** portal frost in → it settles.

**Steps:**
- The creature follows cold.
- Using portal pairs, you lead it across the court through a series of cold spots. Each pair you place moves the cold, and the creature walks toward it.

**Turn:** The creature wants to go back to the Sorcerer's tower. The cold there is the Sorcerer's. Keep it, or let it go.

**Change:** It either settles in the enclosure or walks the route into the tower. If it goes, it is later seen in the boss arena, where it slows the Sorcerer's frost once.

**Reward:** Its cold patch, a one-time freeze of the boss, or a Frostfell skin.

### 9 · Emberdeep: the Foundry Workers, *The Quota*
**Now:** inspect two counters → loop scrap.

**Steps:**
- The maker and the breaker each insist the other's counter is wrong.
- Route scrap through the line with the conveyors and portals so that both counters tick together. You need to watch both counters at once.

**Turn:** The counters agree only when the scrap goes round forever. Neither worker needs to work, and the foreman notices.

**Decision:** Leave the loop (they rest), or break it (they keep their jobs).

**Change:** Either the line runs empty and the workers sit, or the line runs and they give you a lift up the forge.

**Reward:** Different by choice: rest gives a forge rest point, work gives a lift shortcut.

### 10 · Ember Colossus: the War Automaton, *Small Work*
**Now:** break the mould → fit the roof.

**Steps:**
- The automaton's hands are too strong for small work.
- You down-strike moulds to cast each birdhouse part, and it assembles them. You time each strike as it holds a part, because one hit too many breaks it.

**Turn:** When the birdhouse is done, the bird won't come while the automaton is near. It has to leave its post, and its post is the Colossus's door.

**Change:** The automaton walks away from the door, and the Colossus arena has a second entrance.

**Reward:** The Crooked Birdhouse as a decoration in camp, plus the new arena entrance.

### 11 · The Inversion: the Neighbours, *Tea on the Ceiling*
**Now:** fetch the tea set → connect the tables.

**Steps:**
- One neighbour lives on the floor, the other on the ceiling. Each set has to reach its owner.
- Pour (carry) the tea through gravity flips without spilling: a flip with the pot spills it, and the pot resets.

**Turn:** Each neighbour is sure the other lives upside down.

**Decision:** Whose floor is the real one? You can't satisfy both. Or you link them with portals so that each sees the other right way up.

**Change:** The two rooms are joined by a portal table, which is also a road shortcut.

**Reward:** The Two-Sided Cup: one free gravity flip charge in the region.

### 12 · The Void Tyrant: the Figure, *The Other Side*
**Now:** one Echo release.

**Steps:**
- The figure is trapped in a reflected room.
- Your Echo has to do in their room what you do in yours, so you solve two mirrored rooms at once, one with each body.

**Turn:** Freed, the figure is the Tyrant's, a part it lost.

**Decision:** Return it to the Tyrant's tower, or let it go.

**Change:** The figure watches the lights at camp, or the Tyrant fight is weaker by one phase.

**Reward:** By decision: a Fractured echo, or a shorter boss fight.

### 13 · The Abyss King: the Bellkeeper, *The Last Alarm*
**Now:** climb → ring.

**Steps:**
- The alarm never stops because three bells are cross-wired.
- Ringing one rings the others out of order. You climb between three towers to ring a sequence that silences them, guided by what you hear.

**Turn:** The last bell is under the King's arena. The all-clear can only be rung there, so you ring it from inside before the fight.

**Change:** The defenders stand down and line the road to the King, seen walking up.

**Reward:** The defenders' help: one guard holds a door in the King fight, or a King rift shard.

### 15 · The Deep Line: the Miner, *The Bell Below*
**Now:** raise the cage → walk him to the ledger.

**Steps:**
- Rescue him from a collapsed shaft with the rails: switch points so that an empty cart reaches him and a loaded one counterweights the cage.
- You ride with him, and he calls out the switches by memory.

**Turn:** At the station, the ledger lists him as dead and paid out. Write him back in, or leave it so his family keeps the payment.

**Change:** He works the station and sends carts for you, a new cart shortcut. Or he's gone home, walking out along the line.

**Reward:** The shortcut, or his lamp, which lights the dark shaft.

### 16 · Thunder Cliffs: the Sailors, *Good Luck*
**Now:** hook up → split the charm.

**Steps:**
- One sailor is in the rigging, and the other holds the line below.
- You hook between them during lightning, because the strikes break the rigging in a pattern. Each sailor holds a section of line steady for you while you swing.

**Turn:** The charm they're fighting over is fake. Both of them know it.

**Decision:** Say so, or keep the secret between them.

**Change:** They work the cliff winch together, which raises a platform on the road.

**Reward:** The winch platform, plus the charm as a skin trinket.

### 17 · The Landing Shores: the Organizer, *All at Once*
**Now:** candle tin → find the soldier.

**Steps:**
- The party is on the beach, and the tide is coming in.
- Carry the party's things up to high ground between waves, using the shores' tide device. Each wave changes the route.

**Turn:** The guest of honour, the soldier, is sitting in the wreck and won't come. He goes only if the party comes to him.

**Change:** The party is held on the wreck at low tide, and the wreck's deck becomes a road platform.

**Reward:** Party lights, which mark tide timings on screen in the Shores.

### 18 · The Colony: the Mother, *One Spoon at a Time*
**Now:** fetch the cup → ask Sable.

**Steps:**
- The Colony's lamps watch you, so you move between shadows.
- Her cup is in Sable's water room. You bring water back in the sealed cup unseen. If a lamp sees you, the cup is confiscated.

**Turn:** Sable admits the water is fine and the lamps are what's wrong.

**Decision:** Tell the mother, or put out a lamp so she can see for herself.

**Change:** One lamp is dark for good. That stretch of road can be crossed openly.

**Reward:** The dark lamp, which opens a hidden Colony room, plus a rift shard there.

### 19 · The Path to the Palace: the Pilgrim, *The Lightest Pilgrim*
**Now:** carry the sack up.

**Steps:**
- He insists on carrying his own sack and has to be launched by the Path's sling with it.
- You aim each sling, and his weight changes the arc.

**Turn:** Halfway up, the sack turns out to be full of stones he's carrying as penance. Each stone you take out lengthens his arc. You decide how many he keeps.

**Change:** The stones become steps on the sling route, a permanent assist.

**Reward:** Pilgrim's Stone, a charm that steadies the sling arc.

### 20 · Sunspire Palace: the Gardener, *The Night Garden*
**Now:** three identical shutters.

**Steps:**
- The garden needs dark, and the palace's light beams fall across it.
- You don't close shutters. You redirect the beams with the palace's mirrors so that they light the road above instead of the garden. That's three mirrors, and each one interacts with the last.

**Turn:** With the garden dark, the road above is now lit. The final ascent becomes easier, and the Gardener says the palace never wanted it to be.

**Change:** The flowers bloom, and the upper road is lit.

**Reward:** The lit road, plus a Night Bloom skin.

**The travelling questlines** (Mara's excepted) get the same treatment. Each "inspect" becomes an action that uses that region's device; Ilyra's flame, for example, has to be carried through Frostfell without it going out, which is the Ascend lantern mechanic. Merge Oren's two Brute inspections into the Causeway story, since they're the same region.

---

## Part 4. Ascend, world by world

The same characters and the same story are told as a climb. Each entry has three parts:
- **Road:** what overlays the main road.
- **Branch:** what the two quest rooms become.
- **Done:** what changes on the road.

Each still gives its heart and keepsake, and the keepsake still opens that character's echo.

| World | Road | Branch | Done |
|---|---|---|---|
| **2 Black Woods**, Elsie | A lantern you carry: it lights the colour platforms in each road section. | The canopy line, freed branch by branch. Each freed branch drops the lantern to light the next. | Elsie is seen walking to the world's first fire. The lantern hangs there and lights the opening room. |
| **3 Causeway**, Silas | He walks his patrol in a road room, and the counterweights sync to his steps. | The governor room *is* the gear: unbalance it with the counterweights while his arm is at the far end. | He walks on screen to the sunlight ledge. His patrol gate opens as a shortcut. |
| **4 Updrafts**, Cartographer | Three readings: stand in three road updrafts at their peak, collected like Mara's bearings. | The current room: portal the wind out over the canyon. | His desk moves to the cliff, and a kite updraft on the road is now marked. |
| **5 Marksman**, Recruit | He crosses with you through the arrow room, moving when you stop under cover. | The helmet room inside the firing lane. | He takes the watch post, and the arrows in that room come with a visible tell. |
| **6 Ruined Keep**, Archivist | Three volumes in three road sections, where each writer stood; HUD-tracked like Mara's. | The gatehouse climb, where you see the cut counterweight. | He carries the books out. The gatehouse stair becomes a road link. |
| **7 Warden**, Service Keeper | His board opens cells along the road on a cycle that you follow. | The service passage, with the key. | The latch stays open: a cell becomes a passage. |
| **8 Frostfell**, Ines | Coal you carry through the road: ice melts under you while you carry it. | The thaw room, in stages. | The room is warm and becomes a fire (save point) on the road. |
| **9 Frost Sorcerer**, Creature Keeper | The creature follows cold spots you open along the court. | The tower-walk room. | It settles or leaves (seen), and one ice section on the road softens. |
| **10 Emberdeep**, the Workers | Scrap carried on road conveyors ticks the two counters, shown on the HUD. | The loop room. | The line stops for good, and a crusher on the road stays still. |
| **11 Ember Colossus**, Automaton | Moulds on the road: down-strike them to cast the parts. | The assembly room. | It leaves its post. A side door on the road to the boss opens. |
| **12 Inversion**, Neighbours | The tea set has to be carried through flips without spilling. | The two-table room. | The portal table joins two road rooms. |
| **13 Void Tyrant**, the Figure | Its reflection follows you through a road section, doing what you do. | The mirrored twin rooms. | It watches from a ledge; one dark road room is lit. |
| **14 Abyss King**, Bellkeeper | Three bells on the road: ring them in the order you hear. | The bell beneath the arena. | The defenders line the last climb, and one holds a door open. |
| **15 Deep Line**, Miner | You switch the rail points as you pass so the cart reaches him. | The collapsed shaft and cage. | He runs the station, and a road cart runs for you. |
| **16 Thunder Cliffs**, Sailors | Each holds a line on the road that you can hook to while they hold. | The rigging during lightning. | The winch raises a road platform. |
| **17 Landing Shores**, Organizer | The party's things are carried between waves on the tide road. | The wreck at low tide. | The wreck deck is a road platform. |
| **18 Colony**, Mother | Water carried in the cup through lamp-watched road rooms. | Sable's water room. | One lamp stays dark on the road. |
| **19 Palace Path**, Pilgrim | His sack's weight changes your sling arc on the road. | The penance climb. | The stones become steps on a sling route. |
| **20 Sunspire**, Gardener | Three road mirrors: turn them as you climb. | The garden beneath. | The final road is lit, and the flowers bloom. |

Two engine notes:
- **Carrying** already exists: `p.carrying`, the lantern and the cargo clasp. Most "Road" rows reuse it.
- **Road changes after completion** can reuse the atlas solve/open state and the room variants Rowan already uses.

---

## Part 5. The two-player Ascend puzzles

### What it was (*The Two Banks*, removed in 7.370.0)

It was a separate page, `coop-practice.html`, with its own engine (`bladefall-coop-practice-{core,session,view}.js`) and eight rooms. You reached it from a link in the Climb menu.

**Why it felt like a different game:**

1. **Not fullscreen.** It was a web page: header, lobby, a 16:9 canvas capped at 1280 px inside a bordered box, a toolbar, a written brief, a ping bar and a row of touch buttons. None of the Ascend view, camera, close view or HUD was used.
2. **A different engine.** Two separate pcore games were kept in step by hand-synced "practice bodies" (`moveBody` carried riders between the two worlds). Devices, deaths and resets were special-cased per room in a 170-line `step()`.
3. **No art or world.** Rooms were drawn with `rect()` boxes on an 80×45 grid. There was no palette, folk, props or place: just grey rectangles.
4. **Different controls.** It had its own bindings that exist nowhere else in Ascend: E to use or carry, K shield, J blade, R shared retry, and 1–6 pings.
5. **Puzzles told you the answer.** Each room had a written job per player, such as "Hold E at the lever to raise the tilted lift. Release near the top…". The puzzle was following instructions, and the roles were assigned.
6. **No progression.** There were eight rooms in a menu, with no world, reward or route proof.

The current Ascend co-op (`bladefall-climb-coop.js`) is something else. It puts two knights in the same world, each on their own run, so you can watch each other, and holding T teleports you to your partner. It's a shared exploration feature, not shared puzzles.

### The proposal: *Ascend Together*

The goal is normal Ascend, built for two, the way Portal 2's co-op is normal Portal.

**1. The same screen and game.**
- It runs inside `precision.html?pitch=climb`, fullscreen, with the Ascend view, close view, HUD, fires, pause menu and touch layout.
- You start it from the world map: a co-op world on the atlas, reached through a door.
- A partner joins with the existing four-letter PeerJS code, or `?coop=local` for two tabs.
- **Add couch co-op:** two players on one machine (arrows and WASD, or two pads). This is also how it gets tested.

**2. One world, two knights.**
- Both knights live in the same `pcore` game.
- The core already has the seams: `g.players`, `g.coopActor`, multi-occupant movers and crush handling, and per-player event tags.
- The host simulates, the guest sends inputs, and the host sends state. Every device then reacts to both bodies for free: plates, held doors, counterweights, lifts and crumbles.
- No second engine.

**3. Puzzles from Ascend's own devices, Portal 2 style.**
- **Portals:** each knight owns one colour, so the two portals form a pair only together. This is the core co-op verb, exactly Portal 2's.
- **Weight:** plates, counterweights and cargo need two bodies, or one body and the cargo.
- **Echo and gravity:** one knight flips or echoes, and the other uses the flipped world.
- **The partner as a platform:** you can stand on your partner, and dashing off them refreshes your dash.
- **Carry and throw the lantern** across gaps, as in the old Two Banks room 1, now using the real lantern.

No co-op-only buttons beyond **ping**: hold a key to place a marker where you're aiming, shown in-world. There is no written brief. Each room's job is discovered, and the roles are not fixed: either knight can do either part.

**4. Structure.**
- There are five co-op chapters: Weight, Portals, Lanterns, Flips, Everything. Each has six to eight rooms.
- Each chapter teaches one device alone, then chained, following the one-mechanic rule.
- Fires are shared, and a death resets only the current room.
- It is authored in the level builder with two spawn points.

**5. Proof.**
- Each room has a **two-track intended route**: two tapes, one per knight, played together.
- Extend `bladefall-route-solver.js` and `verify:watch` to replay both, so a co-op room is proven like every other room.
- Watch mode plays both knights.

**6. Rewards.** Co-op hearts and a pair of matching skins, one per chapter, stated on the world-map card.

**What it needs (sizes, not commitments):**
- the multi-knight step loop and input streaming;
- builder support for two spawns and two-track routes;
- a shared camera that holds both knights in the close view, widening within a room's bounds, with an arrow for a partner off screen;
- the five chapters of rooms.

The old Two Banks room ideas (counterweight exchange, portal relay, two-sided brake, shield and blade, split information, partner rescue, tandem gate) are good starting points to re-author as real Ascend rooms. "Split information" becomes one knight seeing a code through a window and pinging it.

---

## Decisions for Isaac

1. **Explore turns.** Which ones change who a character is (the Figure belongs to the Tyrant; the Pilgrim's sack is stones), and are any off-limits for the story?
2. **Rewards.** Which mix: a shortcut, a rift shard, a boss assist or a skin, per region? Above, each region has one; the rest placeholder goes.
3. **Conversation.** Drop the fixed short/medium/harsh triad for one story decision per quest?
4. **Ascend Together.** Couch co-op first (fastest to build and test), then online?
