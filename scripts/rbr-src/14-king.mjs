// Region 14 · The Drowned Throne. Two bodies on two marks is the King's rule, taught first with a lantern.
// The Right Hand returns as a seam duel, then echo placement/swapping and the following wake shape the approach.
// The Last Alarm is optional: climb to the small and great bells and play the Bellkeeper's all-clear.
import {grid} from './build.mjs';
const g=()=>grid().frame();
const road=()=>g().rect(0,18,39,22,'#').rect(39,13,39,17,'.').put(3,17,'P');
const gate=m=>m.rect(36,1,36,17,'G');
const room=(id,name,hint,question,m,extra={})=>({id:'k14-'+id,name,hint,question,map:m.rows(),...extra});
const stair=road().rect(14,18,17,18,'^').rect(24,15,28,17,'#');
const marks=gate(road()).put(6,17,'l');
const hand=gate(road()).rect(17,18,21,18,'^');
const alcove=road().rect(12,18,14,18,'^').rect(21,16,25,17,'#');
const echo=gate(road()).rect(15,18,22,18,'^');
const switchback=gate(road()).rect(0,8,9,8,'#').rect(1,9,9,17,'.').put(3,17,'.').put(3,7,'P').rect(12,18,17,18,'^');
switchback.rect(39,13,39,17,'#').rect(39,4,39,7,'.').rect(28,8,39,17,'#').rect(27,8,27,17,'<').rect(36,1,36,7,'G').rect(1,9,9,9,'v').put(18,6,'o');
const wake=road().rect(11,18,13,18,'^').rect(22,18,25,18,'^');
const climb=g().rect(0,18,8,22,'#').rect(9,21,38,21,'^').rect(9,22,38,22,'#').rect(12,15,16,15,'Y').rect(22,11,26,11,'~').rect(31,7,39,22,'#').rect(30,8,30,20,'<').rect(39,3,39,6,'.').put(3,17,'P');
const bellkeeper=road().rect(19,18,22,18,'^').rect(2,0,6,0,'.');
const hall=gate(road()).rect(14,18,20,18,'^').rect(24,14,29,17,'#');
const throne=gate(road()).rect(14,18,21,18,'^').rect(23,14,29,17,'#');
// (7.280) The Last Seal turns: after the first pair, the crown lights the block and a high perch over the thorns
// that only the King's seam reaches (it blinks), while the wake walks your old path towards the echo you left.
const final=gate(road()).rect(12,18,23,18,'^').rect(16,14,19,14,'Y').rect(25,11,30,17,'#').rect(14,6,17,6,'#');
const rail=road().rect(11,18,15,18,'^').rect(24,16,27,17,'#');
const qtower=g().rect(0,18,8,22,'#').rect(9,21,38,21,'^').rect(9,22,38,22,'#').rect(12,15,16,15,'Y').rect(23,11,27,11,'Y').rect(30,7,39,22,'#').rect(29,8,29,20,'<').rect(39,3,39,6,'.').put(3,17,'P');
const qsignal=gate(road()).put(32,17,'*');
// (7.280) The King's seam: the tear from the Tyrant's citadel, here opened on the King's rhythm (it blinks: a shut
// tear is a dotted scar). Then the echo with a tear: leave the echo on one mark, ride a one-way tear up into a sealed
// gallery to the other, and trade back to the echo to get out.
// The second ride rises (the main game's last breath): it threads a slit in the far wall and lifts you onto a ledge
// whose face is thorned, so neither ride can be skipped with a jump and a dash.
const seam=g().rect(0,18,7,22,'#').rect(8,21,30,21,'^').rect(8,22,30,22,'#').rect(32,13,39,22,'#').rect(31,14,31,21,'<').rect(39,8,39,12,'.').put(3,17,'P')
 .rect(13,1,13,20,'#').put(13,17,'.').rect(18,18,20,18,'#').rect(26,1,26,20,'#').rect(26,14,26,15,'.');
const trade=gate(g().rect(0,18,11,22,'#').rect(12,21,31,21,'^').rect(12,22,31,22,'#').rect(32,18,39,22,'#').rect(39,13,39,17,'.').put(3,17,'P'))
 .rect(18,1,18,5,'#').rect(19,7,24,7,'#').rect(25,1,25,7,'#').rect(19,1,24,1,'v');
const crown=(marks,extra={})=>({marks:marks.map(([c,r])=>({c,r})),...extra});
export default {n:14,name:'The Abyss King',kit:['dash','strike','parry','portal'],blurb:'Two marks need two bodies. The echo stays where you leave it; the wake follows where you went.',outro:'The two marks dim. The King is still. Behind the throne, the rails descend toward the Deep Line.',
 folk:{bellkeeper:{cloak:'#70516c',trim:'#dfc995',skin:'#cdb095',hood:true}},
 props:{'quiet-bell':[[2,-14,2,14,'#6b5a4a'],[2,-14,12,2,'#6b5a4a'],[9,-12,5,7,'#bd9960']], 'quiet-bell@all-clear':[[2,-14,2,14,'#6b5a4a'],[2,-14,12,2,'#6b5a4a'],[9,-12,5,7,'#bd9960'],[10,-11,3,4,'#6c8c82']]},
 rooms:[
 room('stair','The Drowned Stair','A dash does not protect you from thorns','Which landing gives you time to see the next cut?',stair,{people:[{who:'oren',c:7,r:17,line:'Two marks, one visitor. There’s always a catch.'}]}),
 room('marks','The Two Marks','Both crown marks must be held at once · a lantern counts','Which mark can the lantern hold while you stand on the other?',marks,{crown:crown([[8,17],[29,17]])}),
 room('seam','The King’s Seam','His tear opens on a rhythm · wait on the perch for it to light, then ride it up','When will the rising tear be open?',seam,{lines:[{a:[7,17],b:[19,17],setDown:true},{a:[20,17],b:[33,12],period:120,upT:50,phase:60}]}),
 room('hand','The Right Hand','His seam shows where he will arrive · his ward opens at either end','Where can you wait to strike the opening instead of the armour?',hand,{study:true,hand:{places:[{c:11,r:17},{c:28,r:17}]}}),
 room('alcove','The Empty Alcove','Here, the portal key leaves an echo · press again to trade places','What position would you want to return to?',alcove,{echo:true,people:[{who:'oren',c:7,r:17,line:'Something stayed behind when you moved. Try the key again.'}]}),
 room('echo','The Borrowed Body','The echo holds a crown mark without moving','Where can you leave a body before crossing the cut?',echo,{echo:true,crown:crown([[7,17],[29,17]],{echoOnly:true})}),
 room('return','The Place You Left','A trade keeps your motion · the echo takes the place you leave','The high mark is behind you. How can two places remain occupied?',switchback,{echo:true,crown:crown([[5,7],[22,17]],{echoOnly:true})}),
 room('trade','Ride Away, Trade Back','The tear runs one way · the echo is the way back','Who holds the low mark while you ride to the high one?',trade,{echo:true,crown:crown([[5,17],[21,6]],{echoOnly:true}),lines:[{a:[8,17],b:[19,6],oneWay:true},{a:[11,17],b:[32,17]}]}),
 room('wake','The Long Drowning','The wake walks your path a moment after you','Which gaps can you cross without retracing your steps?',wake,{wake:{delay:90},study:true}),
 room('climb','The Drowning Stair','The wake follows; the ledges disappear behind you','Where can you pause, and how long before your path catches up?',climb,{wake:{delay:130},study:true}),
 room('bellkeeper','The Last Landing','The bell tower is optional; the throne lies ahead','Will you climb for the all-clear before entering the throne?',bellkeeper,{side:'up',people:[{who:'bellkeeper',c:8,r:17,quest:'alarm',line:'Three short, two long. Break a bell and the backup starts. The tower’s up the chimney.',lineDone:'Quiet at last. They’re leaving their posts.'}],decor:[{k:'quiet-bell',c:11,r:17}]}),
 room('hall','The Audience Hall','Leave the echo where a second body will be needed','Which mark should you leave behind before the climb?',hall,{echo:true,crown:crown([[7,17],[27,13]],{echoOnly:true})}),
 room('throne','The First Seal','Both marks must stay lit until the crown dims · when his eyes burn, he throws: parry or cut while you hold','Where should the echo wait while you claim the other mark?',throne,{echo:true,study:true,crown:crown([[7,17],[26,13]],{echoOnly:true,hold:60,king:true,bolts:{every:80,first:50,speed:120}})}),
 room('last','The Last Seal','The crown turns after the first seal · trade to the echo, then ride his seam before your wake arrives','Can you hold both pairs before your old path reaches you?',final,{echo:true,wake:{delay:240},study:true,crown:crown([[6,17],[28,10]],{echoOnly:true,hold:30,king:true,phases:[[[28,10],[15,5]]],bolts:{every:110,first:80,speed:120}}),lines:[{a:[9,17],b:[15,5],period:120,upT:60,phase:90}]}),
 room('rail','The Rail Head','The way down is open','Where do you land before following the rails?',rail,{people:[{who:'oren',c:7,r:17,line:'Tracks. Someone built a way out. I’m taking it.',leave:'right'}]})
 ],quests:[{id:'alarm',title:'The Last Alarm',giver:'The Bellkeeper',from:'k14-bellkeeper',back:{c:5,r:17},keepsake:{id:'all-clear',name:'The All-Clear Clapper',gives:'The warning bell falls quiet, and the Bellkeeper’s Fractured echo opens.'},rooms:[
 room('q-tower','The Signal Tower','The ledges hold only once','Which side of each ledger leaves you facing the next?',qtower),
 room('q-signal','The All-Clear','Strike the small bell for a short note, the great bell for a long one','Which signal did the Bellkeeper ask you to send?',qsignal,{alarm:{bells:[{c:10,r:16,note:'short'},{c:24,r:16,note:'long'}],pattern:['short','short','short','long','long']}})
 ]}]};
