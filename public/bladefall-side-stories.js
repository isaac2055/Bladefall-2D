/* Main-game optional stories. Dialogue, local objectives and persistent decisions.
   Independent of the legacy quest ledger: old saves and the Fractured campaign keep their contracts. */
(function(root){
'use strict';
const task=(id,label,detail,capability)=>({id,label,detail,capability:capability||null});
const records=[
{
 id:'gatekeeper',stage:0,title:'A Bell for the Camp',name:'Rowan',silhouette:'watcher',accent:'#b8c5a0',
 opening:'Bell’s still up the tower, east along the road. I want it hung here, where the camp can hear it if there’s trouble. Counterweight first. Push the stone cart onto the iron stop and pull the brake handle. Can you do that?',short:'I’ll bring it down.',accept:'Cart secured, then up the tower ledges and let the bell go. The pulley brings it down. Bring it back to the empty post by my bench.',
 question:'Everyone’s moved to the camp. Why are you still here?',discussion:'I know where they’ve moved. It’s just—last time I left, I had a good reason. Thought I did. People got killed while I was gone.',
 forks:[['Could you watch the camp instead?','Could. I’d want to see this road. Put the bell by the camp; I’ll see whether I can hear it.'],['I could stay here while you have a look.','Until I’m back. You understand? Don’t go looking for me. Fetch the bell first.']],
 tasks:[task('ballast','Secure the counterweight','Push the stone-filled cart onto the iron stop east of camp, then pull the brake handle.'),task('bell','Lower the watch bell','Climb the tower ledges to the bell at the top and release its mounting.'),task('hang','Hang the bell at camp','Return along the road to the empty post beside the gatekeeper’s bench.')],
 ready:'I heard it. Clear enough from here, too.',ending:'All right. Give me a moment to move this bench. I can see the road from here, and that bell will carry over the tents. I’ll have supper with the others tonight. If I keep getting up to check the gate, you can tell me to sit down.',longEnding:'I used to take the evening watch with my brother. He’d complain about the cold, then give me half his blanket anyway. After he died, I kept doing both shifts. Nobody asked me to; I just didn’t know what else to do when evening came.\n\nThis is better. I can hear the bell from the bench, and I can still see anyone coming up the road. Will you tell Vey I’m coming over for supper? Tell him I’ll bring my own bowl. He always makes too much, but he’ll pretend he wasn’t expecting me.',
 harsh:'You’re guarding an empty road because you’re afraid to do anything else.',refusal:'Enough. You weren’t here. Keep walking.',after:'Bell’s holding. I’m staying here tonight.',afterHarsh:'Road’s open. Move along.',good:'Rowan drags his bench over to the camp side of the post, tests the bell rope, and sits down. For a while he keeps one hand on his spear. Then he props it against the bench and makes room beside him. The gate is still in view; he no longer has to spend the evening alone to watch it.',bad:'Rowan puts his hand out to end the conversation. He turns his bench back toward the gate and stays there, watching the empty approach. The camp carries on behind him. Any work you already did on the bell remains, but he will not come over for supper tonight.'
},
{
 id:'refuge',stage:1,title:'A Place for Supper',name:'Elsie',silhouette:'huddled',accent:'#deb985',
 opening:'Careful of the kitchen step, love. The end’s rotten. My lantern got caught in the branches east of here when I tried to pull it down. Could you climb up and untie the line? You’ll see its wooden peg at the fork. The lantern’s a little higher.',short:'Of course. Save me a place.',accept:'I’ll save you a bowl. When you’re back, help me fit a spare board over this step, then we can put the lantern above the table. I’d rather not spill supper trying to find the chairs.',
 question:'Part of your house is missing. Can we fix it?',discussion:'Bit by bit, yes. I put my foot through the pantry yesterday. Had to finish cooking from the doorway. I’ve tried everything I can think of. I’d rather get you fed while the kitchen still works.',
 forks:[['How long have you got?','I don’t know, love. The soup’s nearly done, though.'],['Would you rather leave with me?','I might. Let me get you fed first; I can’t think with someone standing there hungry.']],
 tasks:[task('line','Release the snagged line','Climb the branches east of the kitchen. Untie the line at the fork with the wooden peg.'),task('lantern','Recover the lantern','Continue up the higher branches to the hanging lantern.'),task('floor','Mend the kitchen step','Return to the kitchen and fit a spare board over the broken step.'),task('table','Set the supper table','Hang the recovered lantern over the table beside the stove.')],
 ready:'Is it too salty? I can never remember whether I’ve done it already.',ending:'There. A dry step, a working lamp, and two bowls. That’s a proper supper. Sit down before it gets cold. You’ve done enough climbing for one evening; the washing-up can wait.',longEnding:'My sister used to cut the carrots so small you could barely find them. Said it made the soup go farther. I cut mine bigger. If someone’s walked all day, I think they ought to find something on the spoon.\n\nI know this place needs more than a board and a lamp. I’m not ignoring it. But I can mend a little, cook a little, and have someone at the table while I work out what comes next. You’ve helped with all three. Take your time with that bowl. There’s another helping if you want it.',
 harsh:'Your house is falling apart and you want me to fetch a lamp?',refusal:'You can say no without talking to me like that. I’ll put the other bowl away. Mind the broken step on your way out.',after:'The refuge has gone. The lantern’s hook is still in the tree.',afterHarsh:'A small candle burns beside a single bowl. There is no place set for you.',good:'Elsie sets the lantern over the table and fills the second bowl. Steam gathers in the light while she pushes the bread within reach. She checks the repaired step with her heel, nods, and finally sits down. On a later visit, the kitchen has vanished; a few boards and the lantern hook show where it stood.',bad:'Elsie picks up the unused bowl and puts it on the shelf. She brings a candle close to her own place, sits down, and eats without looking up. The spare board stays where you left it. She will not ask you for anything else tonight.'
},
{
 id:'defector',stage:2,title:'The Clockwork Defector',name:'Silas',silhouette:'watcher',accent:'#d59a68',
 opening:'I walk forty paces. Then I turn. That governor above the maintenance lift controls it. Release the brake beside this walk, ride the lift up and break the gear. Then undo this gate so I can try walking somewhere else.',short:'I’ll stop the governor.',accept:'The brake handle is beside us, next to the lift. The gear is on the high shelf beyond it. I will still be here.',
 question:'You know it’s controlling you?',discussion:'Yes. I can watch the road, count the turns, decide that I wish to stop. None of those things stops my legs. Please be careful near the gear. It moves faster than it looks.',
 forks:[['Where would you go if it stopped?','I haven’t decided. There’s a patch of sunlight beyond the end of my route. I would like to stand there.'],['How long have you been walking?','I lost count of the days. I still count the paces.']],
 tasks:[task('brake','Release the maintenance brake','Use the handle beside the lift beside Silas’s patrol walk.'),task('gear','Break the Governor Gear','Ride the maintenance lift, jump to the high shelf, then strike the exposed gear.','weapon'),task('gate','Open the patrol gate','Return to Silas and swing the small gate away from his patrol walk.')],
 ready:'The mechanism has stopped. Thank you. Where should I go?',ending:'Walk with you? I would like that. Am I keeping you from somewhere?',longEnding:'I understand that I can go wherever I like. I’m having difficulty answering. Could I walk with you until I think of somewhere? There’s a place in the sunlight I wanted to look at.',
 harsh:'I broke the machine. Do I have to tell you how to walk now?',refusal:'No. You’ve done what I asked. I won’t delay you.',after:'I think I’ll sit here for a bit. I chose this place myself.',afterHarsh:'Silas walks his forty paces again. The gear is still.',good:'Silas takes one step past the old turning point, then another. The key in his back stays still. He follows you through the open gate and stops beside the bench. After a moment he sits down, testing the seat with one hand. He chose this place himself.',bad:'The broken governor remains still. Silas looks through the open gate, then turns back along his familiar walk. This time nothing pulls him around at the end. He turns anyway, slowly, while the loose teeth of the gear lie on the shelf above him.',harshAt:'ready'
},
{
 id:'cartographer',stage:3,title:'The Blind Cartographer',name:'The Cartographer',silhouette:'surveyor',accent:'#9fe0ff',
 opening:'One reading from the upper channel. Two, if the pressure changes—but start with one. Could you divert the current?',short:'Show me where it needs to go.',accept:'The measuring funnel, above the desk. Mind the old chimes on your way.',
 question:'When do you actually leave?',discussion:'In spring. That was the intention, at least. Not this spring originally. This sheet is nearly finished; the western sheets are another matter. There is always something I haven’t checked.',
 forks:[['Where do you want to go first?','The coast. I can describe most of it precisely. I have never been.'],['Could someone else finish the measurements?','Probably. I would have to stop checking their work. Yes, I can hear myself.']],
 tasks:[task('funnel','Link the wind channel to the funnel','Use a linked portal to carry the channel’s current.','portal-single'),task('chimes','Let the current sound the chimes','Redirect the linked current through the hanging chimes.','portal-single')],
 ready:'You’ve diverted it too far. Bring it back a little—no. Wait. Leave it there, please.',ending:'I would like to listen. Help me move the desk outside, would you?',longEnding:'That interval should not occur with this spacing. No, don’t change it. I can take another reading later. Would you help me move the desk? The instruments can come too.',
 harsh:'You’re finding excuses to stay at your desk.',refusal:'Possibly. You’re not the first person to suggest it. I would still prefer that you leave.',after:'The coast first, I think. I’m taking the smaller notebook.',afterHarsh:'The map is folded away. The chimes have been tied still.',good:'The cartographer moves his desk outside and listens.',bad:'He secures the chimes and withdraws his directions.'
},
{
 id:'recruit',stage:4,title:'Borrowed Courage',name:'The Recruit',silhouette:'watcher',accent:'#d8b875',
 opening:'I can make the crossing. I can. That’s not the—look, my helmet’s up in the watchtower. Could you get it? I’d go myself, but. Well.',short:'I’ll get it. Then we’ll cross together.',accept:'Right. Right. Stay close when we go, would you? Not that I—just close.',
 question:'That particular helmet? Is there something special about it?',discussion:'It was my uncle’s. Three campaigns, he wore it. Said he never went anywhere without it. I suppose I—decided the rest myself. I’d rather not lose it.',
 forks:[['You might still be scared when you have it.','I know. I—yes. I’d still like it back.'],['We’ll take one shelter at a time.','Right. The first wall. I can do the first wall. Just tell me before you move.']],
 tasks:[task('helmet','Recover the recruit’s helmet','Reach the ruined watchtower.'),task('crossing','Escort the recruit across the firing lane','Stay near him between the shelters.')],
 ready:'Is your leg—is it all right? I pulled hard when that brace came down. Sorry. Not sorry. You know what I mean.',ending:'My helmet? Oh, for—again? Could we still go back for it?',longEnding:'I didn’t even notice I’d lost it. You were under something heavy! I thought that thing was going to crush your leg. Could we—could we still go back for the helmet?',
 harsh:'If you need a lucky hat to do your job, I’d rather go alone.',refusal:'Fine. Go on, then. I wasn’t stopping you.',after:'I’m going to try the crossing again. With my helmet, preferably.',afterHarsh:'The recruit practices behind cover by himself.',good:'He loses the helmet but crosses and helps you anyway.',bad:'He withdraws from the escort and practices alone.'
},
{
 id:'archivist',stage:5,title:'The Archivist’s Burden',name:'The Archivist',silhouette:'surveyor',accent:'#bca4db',
 opening:'Three volumes are missing from these shelves. The upper gallery collapsed. If you can reach them, bring them here.',short:'I’ll find the volumes.',accept:'Handle the bindings carefully. They’re older than the shelves.',
 question:'What are you trying to find out?',discussion:'They disagree about the gate. Not the hour, not who was present. Just whether it was open. That would change who could have prevented what happened. I thought the third volume would settle it.',
 forks:[['Were you there?','On the stairs. I was helping someone down. Smoke, a sleeve coming apart in my hand. Nothing useful for the question.'],['What if the books can’t answer it?','Then I’ve spent a very long time in this room.']],
 tasks:[task('volume-one','Recover the first volume','Climb the archive shelves.','wall-jump'),task('volume-two','Recover the second volume','Cross to the upper gallery.','wall-jump'),task('volume-three','Recover the third volume','Reach the final shelf above the courtyard.','wall-jump')],
 ready:'The third account disagrees with both the others. Would you help me carry these to the courtyard?',ending:'I’m going to sit outside. That’s as far as I’ve decided.',longEnding:'I keep hoping one of them will tell me I couldn’t have stopped it. Put them by the bench, please. I need some air before I read another word.',
 harsh:'You want a book that says none of it was your fault.',refusal:'Put that down. Carefully. Then leave.',after:'I’ve packed the books. I’m still deciding where to go.',afterHarsh:'His books are packed. He refuses to discuss them with you.',good:'The archivist leaves the desk and takes his books outside.',bad:'He packs up but refuses further conversation.',resolutions:[['Keep the books by the bench.','keep'],['Burn the books in the courtyard brazier.','burn']],burnLine:'I haven’t forgiven you. I’m leaving, but that doesn’t make what you did all right.'
},
{
 id:'keeper',stage:6,title:'Stand Aside',name:'The Service Keeper',silhouette:'watcher',accent:'#acb3c2',
 opening:'Need a work order for this entrance.',short:'Can you make an exception? I only need the supply alcove.',accept:'Straight to the alcove and back. Grab the parcel on the shelf. Brown paper. That’s mine.',
 question:'Where do I get a work order?',discussion:'Office upstairs. Assuming somebody’s in. Hasn’t been all week, but that’s where they’ll tell you to go. Nobody tells me anything.',
 forks:[['I’m going to try to talk you into opening it.','All right. Let’s hear it. I’ve got another hour here. You only need the alcove? Fine.'],['I could stand here making increasingly annoying arguments.','You’re already doing quite well. Go on, then. Straight back.']],
 tasks:[task('door','Open the service entrance','The keeper has agreed to let you through.'),task('lunch','Bring back the lunch parcel','The brown-paper parcel is inside the service alcove.')],
 ready:'That’s the one. Someone moved it, before you ask.',ending:'Thanks. Leave the door on the latch, would you?',longEnding:'Service personnel are permitted to eat. Nobody specified which side of the door. Thanks. Leave it on the latch when you go.',
 harsh:'Finally found someone you can order around?',refusal:'Right. Work order, then. Same as everyone else.',after:'Door’s on the latch. Don’t make me regret it.',afterHarsh:'Work order. Or take the stairs.',good:'The optional service passage stays open.',bad:'The keeper bolts the service passage. The ordinary route stays open.'
},
{
 id:'winter',stage:7,title:'The Perfect Day',name:'The Frostfell Woman',silhouette:'huddled',accent:'#c6dce1',
 opening:'Coal’s in the upper shelter. Sack’s split, so use the bucket. I can’t manage the steps anymore.',short:'I’ll bring it down.',accept:'Thank you. Steps are dreadful. Mind the last one.',
 question:'Heating this room will melt everything. Are you sure?',discussion:'It will. I wouldn’t send you up there otherwise. I’ve been cold for a long time. Yes, I’m sure.',
 forks:[['Let’s move anything you want to keep first.','Blue cup. Set it outside, would you? The handle’s been glued, so take it underneath.'],['I can stay and help clean up.','That would be nice. There’ll be water everywhere.']],
 tasks:[task('coal','Fill the coal bucket','Climb to the upper shelter.'),task('stove','Light the stove','Put the coal in the stove inside the frozen room.')],
 ready:'Sit down. You’ve been on your feet all day.',ending:'That was his chair, yes. And he’d tell you to sit down too.',longEnding:'My husband insisted that was the comfortable chair. Absolutely dreadful thing. Sit down anyway; I’ll get you a cushion. Put a bowl under those flowers, would you?',
 harsh:'You could have spared me the family history.',refusal:'Could have. Leave the bucket there.',after:'Room’s warmer. Floor’s still wet. Mind your feet.',afterHarsh:'She has lit the stove herself. The conversation is over.',good:'The room thaws while you share a meal.',bad:'She continues thawing her home without your company.'
},
{
 id:'ember-pet',stage:8,title:'A Little Winter',name:'The Creature Keeper',silhouette:'huddled',accent:'#83d8f1',
 opening:'Don’t touch his back. Under the jaw, if he lets you. No—he’s not letting you. He’s too hot to settle.',short:'Let’s bring a little frost through.',accept:'Start little. I need to see how he takes it.',
 question:'What have you tried?',discussion:'Water, shade, moving his bed. Won’t drink, can’t settle. Been pacing since yesterday. Everyone down the road wants to get away from the cold; everyone down the road isn’t on fire.',
 forks:[['We’ll start with a small stream and watch him.','All right. Stop if he tries to get away.'],['Let’s cool one corner so he can choose.','Yes. That sounds better. Leave the other side warm.']],
 tasks:[task('frost','Link a little frost into the enclosure','Use a portal to carry cold from the channel.','portal-pair'),task('settle','Let the creature choose its cool corner','Adjust the flow at the enclosure and wait nearby.')],
 ready:'There. Look at his feet. He only does that when he’s properly asleep.',ending:'And now you’ve woken him. Well done. Still, that’s more like him.',longEnding:'I’m still watching for something to go wrong. Oh—there he is. Snapping at your glove. He’s always been a little bastard. Thank you.',
 harsh:'How long were you going to keep trying the same thing?',refusal:'Until I had something better. Help me with the channel or move back.',after:'Sleeping properly now. Don’t poke him.',afterHarsh:'The keeper has rigged a small cooling pipe without you.',good:'The creature settles in a patch of frost.',bad:'The keeper improvises another cooling arrangement.'
},
{
 id:'quota',stage:9,title:'The Quota',name:'The Foundry Workers',silhouette:'surveyor',accent:'#e3a571',
 opening:'Maker: Watch. I finish one, send it down, and he smashes it. Every time.\nBreaker: I scrap it.',short:'I’ll follow the conveyor and look at the counters.',accept:'Maker: Finally. Someone willing to look.\nBreaker: Keep your hands clear of the belt.',
 question:'Why are you destroying everything she makes?',discussion:'Breaker: That belt feeds the scrap station. This is the scrap station.\nMaker: Tell him what the supervisor said.\nBreaker: Keep the line moving.\nMaker: There you are.',
 forks:[['What happens if you both stop?','Maker: The counters fall behind and the alarm starts.\nBreaker: Through the whole building. We have tried it.'],['Where is the supervisor?','Maker: Empty office. Months now.\nBreaker: The instructions haven’t changed.']],
 tasks:[task('counter','Inspect both quota counters','Follow the belt to its counting mechanism.'),task('loop','Loop the stamped scrap through both counters','Move the return chute into the counting loop.')],
 ready:'Maker: Mine’s green. Yours?\nBreaker: Green.',ending:'Maker: I’m taking my break.\nBreaker: Yes. So am I.',longEnding:'Maker: Should we tell someone?\nBreaker: Who?\nMaker: Right. Sit down, then. I’ve got enough lunch for two.',
 harsh:'You’re both as stupid as the machine.',refusal:'Maker: Oh, he’s lovely.\nBreaker: We’re done talking to you.',after:'The counters keep turning. The workers are sharing lunch.',afterHarsh:'Both workers have stopped answering you.',good:'The counters count the same scrap while the workers rest.',bad:'They continue their shifts and refuse your help.'
},
{
 id:'automaton',stage:10,title:'Small Work',name:'The War Automaton',silhouette:'watcher',accent:'#e4b787',
 opening:'Please hold the left panel. The right panel is already damaged. I am making a birdhouse.',short:'I’ll find you a smaller tool.',accept:'There was a gripping attachment in the cooling forge. I cannot reach it.',
 question:'How many have you made?',discussion:'Four. None suitable for occupancy. I cannot feel the point at which the wood begins to split. The entrance was correctly sized. Then I installed the roof.',
 forks:[['Why a birdhouse?','They nest in the broken machinery. Their last nest fell.'],['Can you use a smaller tool?','There was another attachment in the forge. This is currently the smaller tool.']],
 tasks:[task('mould','Break open the cooling mould','Use Downward Strike on the old mould.','downward-strike'),task('roof','Help fit the birdhouse roof','Return the gripping attachment and hold the left panel.')],
 ready:'You may release the panel.',ending:'It is holding. Please keep your hand nearby.',longEnding:'Is the roof straight? Would you check again? I would prefer not to make a fifth. There is a bird approaching. We should stop moving.',
 harsh:'Stop before you crush one with birds inside.',refusal:'That is why I have not installed them.',after:'The bird is inspecting the roof. I will wait.',afterHarsh:'The unfinished house is beneath a tree. The automaton keeps its hands behind its back.',good:'A bird inspects the crooked, intact birdhouse.',bad:'The automaton stops building and watches from a distance.'
},
{
 id:'neighbors',stage:11,title:'Tea on the Ceiling',name:'The Neighbors',silhouette:'huddled',accent:'#baa5e2',
 opening:'First neighbor: I have invited her several times.\nSecond neighbor: And I’ve explained about the floor.',short:'I’ll connect the tables so you can both stay where you are.',accept:'Second neighbor: There. That’s a start. Mind the cups.',
 question:'How did you manage before?',discussion:'First neighbor: We met on the middle landing.\nSecond neighbor: It collapsed. Last time I went over, he nearly wore the tea.\nFirst neighbor: If you’d let me finish—\nSecond neighbor: I know how it finishes.',
 forks:[['Where would you each put your cup?','First neighbor: On the table, naturally.\nSecond neighbor: On my table. You’ll need both.'],['Which way would a biscuit fall?','First neighbor: Down.\nSecond neighbor: His down or my down? Try one.']],
 tasks:[task('service','Retrieve the stranded tea service','Flip gravity to reach the courtyard shelf.','gravity-flip'),task('tables','Connect the two tea tables','Use the paired portals between the neighbors’ surfaces.','portal-pair')],
 ready:'First neighbor: Two sugars?\nSecond neighbor: One. For about six years now.',ending:'First neighbor: You might have mentioned it.\nSecond neighbor: I did, dear.',longEnding:'First neighbor: I keep forgetting which way things fall over there.\nSecond neighbor: I know. You used to try catching my spoons. Pass the biscuits.',
 harsh:'You deserve each other.',refusal:'Second neighbor: Usually. We certainly don’t deserve you.\nFirst neighbor: You can leave the tray.',after:'They are arguing over the tea while passing biscuits through the portal.',afterHarsh:'Their shutters are closed to you. They are talking to each other again.',good:'Both neighbors share tea from their own surfaces.',bad:'They withdraw their cups and complain about you together.'
},
{
 id:'figure',stage:12,title:'The Other Side',name:'The Figure',silhouette:'watcher',accent:'#b2a6ef',
 opening:'The figure copies your movement. As you turn away, it stays at the glass and knocks.',short:'You want this open?',accept:'Yes. Please. The release is on the other side.',
 question:'You could have asked. Why were you copying me?',discussion:'I did ask. You were farther away. I thought you might not hear. That’s why I waved.',
 forks:[['How long have you been here?','I don’t know. There’s nothing here that changes.'],['What do you want to see outside?','Behind those lights. I can’t see that part from here.']],
 tasks:[task('release','Release the figure using your Echo','Hold the second contact with your Echo while using the release.','echo')],
 ready:'I thought the glass would be cold on this side too. It isn’t.',ending:'Could we stop by the lights first? I’ve only seen them through the glass.',longEnding:'I’d like to come with you for a little. Behind those lights first, though. You can go ahead if you need to. I want to see that part.',
 harsh:'You’re out. Stop following me around.',refusal:'I thought we were going together. All right.',after:'The figure is watching the lights instead of copying you.',afterHarsh:'It sees you and takes a different passage.',good:'The figure chooses to watch the lights.',bad:'The freed figure avoids you.',harshAt:'ready'
},
{
 id:'alarm',stage:13,title:'The Last Alarm',name:'The Bellkeeper',silhouette:'watcher',accent:'#c1b6dc',
 opening:'Hands off the striker. Break that and the backup starts. We need the all-clear from the upper tower.',short:'Teach me the signal. I’ll ring it.',accept:'Three short, two long. Don’t rush the last two.',
 question:'Why does breaking it start another alarm?',discussion:'Silence means this tower has fallen. It was built to keep working after everyone here was dead. Some of the soldiers know the fighting’s over. The alarm keeps calling them back.',
 forks:[['Why can’t you go?','Leg won’t take the ladder. I tried. You don’t need to look at it.'],['Let me practice the signal.','Three short, two long. Listen. Now you. Last two need more space. Don’t rush because you’re nervous.']],
 tasks:[task('signal','Climb the signal tower and ring the all-clear','Ring three short notes, then two long notes.')],
 ready:'That’s it. You got it. They’re leaving their posts.',ending:'Let them sleep. Some have been awake for days.',longEnding:'You can hear yourself think again. Look, that one’s asleep already. Will they know what to do tomorrow? Let them get through tonight first.',
 harsh:'Find someone else to climb your bloody tower.',refusal:'Fine. Keep the landing clear while I find them.',after:'Quiet at last. Thanks for taking the climb.',afterHarsh:'The bellkeeper is directing another volunteer from the window.',good:'The warning stops and the defenders rest.',bad:'She finds another volunteer and excludes you from the reward.'
},
{
 id:'miner',stage:15,title:'The Bell Below',name:'The Miner',silhouette:'huddled',accent:'#d3b184',
 opening:'A bell sounds below the condemned track. A voice calls up: “Someone there? The cage is stuck!”',short:'Hold on. I’ll find the hoist.',accept:'Take the siding! Main line goes straight past. I can hear every cart.',
 question:'The board says this shaft is empty. How long have you been down there?',discussion:'Lost count. I hear carts overhead. Ring whenever one passes. They must have crossed me out already. Look, we can talk up there. Try the hoist.',
 forks:[['Did anyone come looking?','Not down here. I kept ringing. Didn’t know what else to do.'],['Can you stand if I get the cage up?','We’ll find out. Get this leg out first; it’s gone numb.']],
 tasks:[task('hoist','Take the siding and raise the rescue cage','Use the loaded rail cart to drive the old hoist.'),task('ledger','Walk the miner to the station ledger','Stay near him until he reaches the ledger.')],
 ready:'Look at that. Crossed me clean out.',ending:'Pencil first. I’m not having somebody carry me off while we’re arguing.',longEnding:'Stationmaster can wait. Pass me the pencil. That’s me back in. This other name—has anyone actually checked that shaft?',
 harsh:'Please tell me this was worth more than a thank-you.',refusal:'I’ve nothing for you. Coat’s down the shaft, wages are overdue. Sorry.',after:'My name’s back where it belongs. I’m waiting for my legs to stop shaking.',afterHarsh:'He corrects the ledger himself and declines further conversation.',good:'The miner returns to the station and writes himself into the ledger.',bad:'The rescue stands, but the miner leaves without rewarding you.',harshAt:'ready'
},
{
 id:'sailors',stage:16,title:'Good Luck',name:'The Sailors',silhouette:'watcher',accent:'#a6c9d9',
 opening:'Lost a brass charm up in the rigging. Split down the middle, it is. If you’re going aloft, keep an eye out.',short:'I’ll look for it.',accept:'Mind the loose line above the crossbeam.',
 question:'Does it belong to someone?',discussion:'Was my father’s. He carried it every voyage. I’m not saying it holds the ship together. I’d just like it back.',
 forks:[['What if someone else has found it?','Ask. Don’t accuse anyone. We’ve enough to worry about.'],['I can’t promise it brings good luck.','Neither could my father. Still carried it.']],
 tasks:[task('charm','Reach the stranded sailor in the rigging','Use the Chainhook to reach the upper line.','chain-hook'),task('share','Separate the charm with both sailors’ agreement','Bring the sailors together on the deck.')],
 ready:'Owner: He can keep hold till we get him down.\nStranded sailor: You wouldn’t mind splitting it?\nOwner: Said I could.',ending:'Pocket it. Both hands on the rope now.',longEnding:'Stranded sailor: Is yours working?\nOwner: So far. Pocket it. Both hands on the rope now; we still have to get through the night.',
 harsh:'Stop fussing over your lucky rubbish and do something useful.',refusal:'Owner: He’s frightened. Give him a minute.',after:'Both sailors work the same line, each with half the charm.',afterHarsh:'They share the charm without involving you.',good:'The two sailors divide the charm and work together.',bad:'They cooperate with each other and withdraw from you.'
},
{
 id:'birthday',stage:17,title:'All at Once',name:'The Organizer',silhouette:'surveyor',accent:'#dfc297',
 opening:'Candles! We need the tin from the wreck. Put it behind the sail when you get it. Has he seen you?',short:'I’ll fetch the candles.',accept:'Keep them dry. We’ve only the one tin.',
 question:'I heard you talking about getting him inside. What are you planning?',discussion:'His birthday. Why? Oh. Is that why he’s hiding behind the boat? Right. You’d better help us explain.',
 forks:[['I may have told him to be careful.','Well, come with me once we’ve got the candles. You can explain that part.'],['Does he actually like surprises?','I don’t know. We probably should have asked. Offer him the porch if he’d rather.']],
 tasks:[task('candles','Retrieve the candle tin','Search the upper wreck cabin.'),task('invite','Find the soldier by the boat','Explain the party and let him choose where to sit.')],
 ready:'Soldier: You said there were six of them.\nOrganizer: There are. We made a cake.',ending:'Soldier: Porch would suit me. Don’t make an announcement about it.',longEnding:'Soldier: You could have checked about the cake before warning me. Porch would suit me. Don’t make an announcement about it.\nOrganizer: We’ll bring the food out.',
 harsh:'Stop hiding like an idiot. It’s a party.',refusal:'Soldier: I hid because I believed you. Let’s not do that again.',after:'The soldier eats on the porch while friends bring him cake.',afterHarsh:'The soldier joins the party. Your spare chair has been folded away.',good:'He chooses a quiet seat and the party comes to him.',bad:'The party continues without an invitation for you.',harshAt:'ready'
},
{
 id:'mother',stage:18,title:'One Spoon at a Time',name:'The Mother',silhouette:'huddled',accent:'#d7c4a4',
 opening:'My sealed cup is in the old shelter. Could you bring that one? I want to know where it’s been.',short:'I’ll bring your cup. You can decide about the water.',accept:'Thank you. Everyone else has had an argument with me by this point.',
 question:'Has anyone explained what Sable did to the water?',discussion:'They’ve told me to stop being difficult. That isn’t the same thing. You can tell me what you heard. I’ll still want to ask him before I give it to my children.',
 forks:[['I’ll ask Sable to come and talk to you.','After the little one’s asleep. Just him, please. I’m not doing this in front of half the camp.'],['I can leave the cup while you decide.','All right. And you’ll stop asking? Thank you.']],
 tasks:[task('cup','Recover her sealed cup','Return to the family’s former shelter.'),task('water','Ask Sable to explain the water in private','Speak with Sable by the restored spring.')],
 ready:'I spoke to him. I still had questions, but he actually answered them.',ending:'Mine first. Only a little, to start.',longEnding:'The neighbor used to defend the pipe too. She admitted it. That helped. Mine first, then we’ll see. Thank you for bringing our own cup.',
 harsh:'Stop making this about you.',refusal:'You don’t know what they’ve had to drink this week. Don’t stand there talking to me like that.',after:'The cup is beside her child’s bed. She greets you quietly.',afterHarsh:'She accepts help from Sable, but asks you to keep your distance.',good:'She chooses to try the water. Her cup later sits beside the child’s bed.',bad:'Her children still receive help. You lose her trust and reward.'
},
{
 id:'pilgrim',stage:19,title:'The Lightest Pilgrim',name:'The Pilgrim',silhouette:'surveyor',accent:'#e0cea2',
 opening:'I’ve been trying to travel with rather less. Could you carry this sack up the last climb? It does wonders for the attention.',short:'I’ll carry it to the summit.',accept:'Much obliged. Please don’t open it on the way.',
 question:'This weighs a lot. What’s in it?',discussion:'There are a few things I haven’t quite—please don’t open that. Yes, medals. Among other things. I know what the one about exemplary humility says.',
 forks:[['Why keep these?','People were kind enough to give them to me. And I liked receiving them. Mostly the second thing, I suppose.'],['Which is your favorite?','The first. Before anyone knew my name. I was very pleased with it. Still am, apparently.']],
 tasks:[task('sack','Carry the pilgrim’s sack up the side climb','Reach the summit bench above the sheltered path.')],
 ready:'I should have carried it myself. I could at least make lunch.',ending:'That medal’s holding the pot steady. Finally useful for something.',longEnding:'That one was for exceptional restraint. Holding up well under the pot, isn’t it? Sit down. I can manage lunch without making you carry anything else.',
 harsh:'You gave up everything except needing an audience.',refusal:'Yes, very good. Give me the bag.',after:'The pilgrim cooks with one medal under the pot. His sack is smaller.',afterHarsh:'He carries his own sack, stopping often. He does not invite you to lunch.',good:'He admits the contradiction and shares a meal.',bad:'He takes back the sack and continues without you.'
},
{
 id:'garden',stage:20,title:'The Night Garden',name:'The Palace Gardener',silhouette:'surveyor',accent:'#e4dab1',
 opening:'His Majesty has asked that the shutters remain open. I need them closed. The flowers need darkness.',short:'I’ll close them.',accept:'Three shutters, through the mirror gallery. Mind the light from the upper one.',
 question:'Have you explained what the light is doing to the plants?',discussion:'Several times. He says to find another way. There isn’t another way. They’re flowers. He wants the garden kept as she loved it. She never saw it like this.',
 forks:[['What was she like?','She’d come here to be left alone. Talk my ear off for an hour, then tell everyone she’d had a lovely quiet evening.'],['Where did she sit?','That bench. It used to face the evening flowers. You can clear the path if you like.']],
 tasks:[task('shutter-one','Close the lower garden shutter','Reach its handle beside the mirror gallery.'),task('shutter-two','Close the middle garden shutter','Climb the shaded gallery to the second handle.'),task('shutter-three','Close the upper garden shutter','Reach the third handle above the garden.')],
 ready:'Oh, good. I thought we’d lost that one. Look—by the bench.',ending:'She liked it in the evenings.',longEnding:'Will I get in trouble? Probably. I’m tired of watching the garden die. Sit here a moment. That one by the bench hasn’t opened in years.',
 harsh:'People are suffering, and you’re tending his dead wife’s flowers.',refusal:'I knew her for twenty years. Please go.',after:'The flowers are open. The gardener has cleared the path to the bench.',afterHarsh:'The gardener moves their chair away from you. Any shutters you closed remain closed.',good:'Darkness lets the flowers bloom. The gardener sits among them.',bad:'The gardener ends the arrangement; your physical changes remain.'
}
];
const byId=Object.fromEntries(records.map(q=>[q.id,q]));
function emptyRow(){return {phase:'offered',route:null,node:'offer',step:0,reward:0,claimed:false,visits:0,answers:[],resolution:null,rescued:false};}
function normalize(raw){
 const state={schema:'bladefall.side-stories',version:2,quests:{}};
 for(const q of records){const r=raw?.quests?.[q.id];if(!r)continue;const row=emptyRow();
 row.phase=['offered','active','ready','completed','harsh'].includes(r.phase)?r.phase:'offered';
 row.route=['short','medium','harsh'].includes(r.route)?r.route:null;
 row.step=Math.max(0,Math.min(q.tasks.length,Math.floor(Number(r.step)||0)));
 if((raw?.version||1)<2&&row.phase==='active'&&row.step===1&&['gatekeeper','refuge'].includes(q.id))row.step=2;
 row.node=['offer','discussion','answer','accept','active','ready','ending','refusal','return'].includes(r.node)?r.node:'offer';
 row.answers=Array.isArray(r.answers)?r.answers.filter(x=>x===0||x===1).slice(-8):[];
 row.resolution=['keep','burn'].includes(r.resolution)?r.resolution:null;
 row.visits=Math.max(0,Math.floor(Number(r.visits)||0));
 row.rescued=q.id==='recruit'&&r.rescued===true;
 row.reward=row.phase==='completed'?2:0;row.claimed=row.phase==='completed'&&r.claimed===true;
 if(row.phase==='ready'||row.phase==='completed')row.step=q.tasks.length;
 if(row.phase==='active'&&row.step>=q.tasks.length){row.phase='ready';row.node='ready';}
 if(row.phase==='harsh')row.route='harsh';
 state.quests[q.id]=row;
 }return state;
}
function row(state,id){return state?.quests?.[id]||emptyRow();}
function view(state,id){
 const q=byId[id];if(!q)return null;const r=row(state,id),c=(id,label)=>({id,label});
 let text='',choices=[];
 const harsh=c('harsh',q.harsh),leave=c('leave','I’ll leave you to it.');
 switch(r.node){
 case 'discussion':text=q.discussion;choices=q.forks.map((f,i)=>c('ask:'+i,f[0]));break;
 case 'answer':text=q.forks[r.answers.at(-1)||0][1];choices=[c('accept',q.short),c('ask:'+(1-(r.answers.at(-1)||0)),q.forks[1-(r.answers.at(-1)||0)][0]),leave];break;
 case 'accept':text=q.accept;choices=[c('leave','I’ll get started.')];break;
 case 'ending':text=r.resolution==='burn'?q.burnLine:r.route==='medium'?q.longEnding:q.ending;choices=[c('leave','Take care.')];break;
 case 'refusal':text=q.refusal;choices=[c('leave','Leave.')];break;
 default:
 if(r.phase==='completed'||r.phase==='harsh'){text=r.phase==='harsh'?q.afterHarsh:q.after;choices=[leave];}
 else if(r.phase==='ready'){text=q.ready;choices=q.resolutions?q.resolutions.map(([label,value])=>c('finish:'+value,label)):[c('finish','Stay a moment.'),c('finish:medium','Talk a little longer.')];choices.push(harsh,leave);}
 else if(r.phase==='active'){text=q.accept+'\n\n'+q.tasks[r.step].label+'. '+q.tasks[r.step].detail;choices=[c('medium',q.question),...(q.harshAt==='ready'?[]:[harsh]),leave];}
 else{text=q.opening;choices=[c('short',q.short),c('medium',q.question),...(q.harshAt==='ready'?[c('decline','Not now. I’ll come back.')]:[harsh]),leave];}
 }
 return {id,title:q.name,questTitle:q.title,accent:q.accent,text,choices,phase:r.phase,route:r.route,reward:r.reward,objective:r.phase==='active'?q.tasks[r.step]:null};
}
function reduce(raw,id,event){
 const state=normalize(raw),q=byId[id];if(!q)return {state,changed:false,error:'unknown-story'};
 const r=state.quests[id]||(state.quests[id]=emptyRow());let receipt=null;const before=JSON.stringify(r);
 if(event.type==='visit'){r.visits++;r.node=r.phase==='offered'?'offer':r.phase==='ready'?'ready':r.phase==='active'?'active':'return';}
 if(event.type==='choice'){
  const choice=event.choice;
  if(!view(state,id).choices.some(c=>c.id===choice))return {state,changed:false,error:'unavailable-choice'};
  if(choice==='leave'||choice==='decline')r.node=r.phase==='active'?'active':r.phase==='ready'?'ready':r.phase==='offered'?'offer':'return';
  else if(choice==='harsh'){r.phase='harsh';r.route='harsh';r.node='refusal';r.reward=0;}
  else if(choice==='medium'){r.route='medium';r.node='discussion';}
  else if(choice.startsWith('ask:')){r.answers.push(Number(choice.slice(4)));r.answers=r.answers.slice(-8);r.node='answer';}
  else if(choice==='short'||choice==='accept'){r.route=r.route||'short';r.phase='active';r.node='accept';}
  else if(choice.startsWith('finish')){if(choice==='finish:medium')r.route='medium';r.resolution=choice==='finish:burn'?'burn':choice==='finish:keep'?'keep':null;r.phase='completed';r.node='ending';r.reward=2;}
 }
 if(event.type==='task'&&r.phase==='active'&&q.tasks[r.step]?.id===event.task){
  const required=q.tasks[r.step].capability;
  if(required&&!event.capabilities?.includes(required))return {state,changed:false,error:'requires:'+required};
  r.step++;if(r.step===q.tasks.length)r.phase='ready';r.node=r.phase;
 }
 if(event.type==='rescue'&&id==='recruit'&&r.phase==='active'&&r.step===1)r.rescued=true;
 if(event.type==='claim'&&r.phase==='completed'&&!r.claimed){r.claimed=true;receipt={id,value:2,scope:'regional'};}
 return {state,changed:JSON.stringify(r)!==before,receipt};
}
function journal(state){return records.filter(q=>state?.quests?.[q.id]).map(q=>{const r=row(state,q.id);return {id:q.id,title:q.title,stage:q.stage,status:r.phase,route:r.route,reward:r.reward,claimed:r.claimed,objective:r.phase==='active'?q.tasks[r.step]?.label:r.phase==='ready'?'Return to '+q.name:r.phase==='harsh'?q.bad:r.phase==='completed'?q.good:'Speak with '+q.name};});}
root.BladefallSideStories=Object.freeze({records,byId,normalize,row,view,reduce,journal});
})(typeof globalThis!=='undefined'?globalThis:window);
