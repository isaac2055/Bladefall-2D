// Region 13 · The Void Tyrant / Paradox Citadel. Campaign sequence: Fissure Mouth,
// Rising Ledgers, Opposed Faces, Spent Line, Paradox Vigil, then three portal-alignment bands.
// A spent foothold holds until you leave; stopping is safe, doubling back is not.
// Introduction skip check: v13-ledgers without foothold-spent and without expert movement — no route found.
// Optional quest: the Figure's Other Side, an early look at the Throne's echo.
import {grid} from './build.mjs';
const shell=()=>grid().frame();
const r=(id,name,hint,question,m,extra={})=>({id:'v13-'+id,name,hint,question,map:m.rows(),...extra});
const mouth=shell().rect(0,18,39,22,'#').rect(14,18,18,18,'^').rect(24,15,28,15,'Y').rect(39,13,39,17,'.').put(3,17,'P');
const ledgers=shell().rect(0,18,8,22,'#').rect(9,21,29,21,'^').rect(9,22,29,22,'#').rect(30,7,39,22,'#').rect(29,8,29,20,'<').rect(39,3,39,6,'.').rect(12,15,16,15,'Y').rect(21,11,25,11,'Y').put(3,17,'P');
const tower=shell().rect(0,18,8,22,'#').rect(9,21,38,21,'^').rect(9,22,38,22,'#').rect(1,1,1,15,'>').rect(11,15,15,15,'Y').rect(23,11,27,11,'Y').rect(12,7,16,7,'Y').rect(28,3,39,3,'#').rect(39,1,39,2,'.').put(3,17,'P');
const rest=shell().rect(0,18,8,22,'#').rect(9,21,30,21,'^').rect(9,22,30,22,'#').rect(31,8,39,22,'#').rect(30,9,30,20,'<').rect(39,3,39,7,'.').rect(14,14,19,14,'Y').put(24,10,'o').put(3,17,'P');
const opposite=shell().rect(0,18,39,22,'#').rect(20,1,22,17,'#').rect(20,12,20,15,'%').rect(1,12,1,15,'%').rect(39,13,39,17,'.').put(3,17,'P');
const spent=shell().rect(0,18,7,22,'#').rect(8,21,38,21,'^').rect(8,22,38,22,'#').rect(12,15,15,15,'Y').rect(22,12,25,12,'~').rect(32,9,39,9,'Y').rect(39,4,39,8,'.').put(3,17,'P');
const vigil=shell().rect(0,18,39,22,'#').rect(20,18,25,18,'^').rect(39,13,39,17,'.').rect(3,0,7,0,'.').put(3,17,'P');
const broken=shell().rect(0,18,8,22,'#').rect(9,21,38,21,'^').rect(9,22,38,22,'#').rect(12,15,15,15,'Y').put(21,12,'b').rect(29,8,39,22,'#').rect(28,9,28,20,'<').rect(39,3,39,7,'.').put(3,17,'P');
const high=shell().rect(0,18,6,22,'#').rect(7,21,38,21,'^').rect(7,22,38,22,'#').rect(10,15,14,15,'Y').rect(21,11,24,11,'Y').put(30,8,'o').rect(34,4,39,22,'#').rect(33,5,33,20,'<').rect(39,1,39,3,'.').put(3,17,'P');
// (7.280) The tear, the main game's rideable seam: dash into a mouth and it carries you to the other end with your
// dash back. Taught alone over the void, then two chained off a ledger (which is spent as you leave it), then the
// main game's crossing to the Tyrant: three back-to-back rides, each onto a perch, the middle one rising. A wall of
// stone stands between each ride's two ends with only a slit the tear can thread, so no dash chain skips a ride.
const tearOne=shell().rect(0,18,9,22,'#').rect(10,21,30,21,'^').rect(10,22,30,22,'#').rect(31,18,39,22,'#').rect(39,13,39,17,'.').put(3,17,'P');
const tearTwo=shell().rect(0,18,6,22,'#').rect(7,21,38,21,'^').rect(7,22,38,22,'#').rect(11,1,12,13,'#').rect(11,14,12,14,'v').rect(17,18,19,18,'Y').rect(30,8,38,20,'#').rect(29,8,29,20,'<').rect(39,2,39,7,'.').put(3,17,'P');
const crossing=shell().rect(0,18,5,22,'#').rect(6,21,32,21,'^').rect(6,22,32,22,'#').rect(33,18,39,22,'#').rect(39,13,39,17,'.')
 .rect(9,1,9,20,'#').put(9,17,'.').rect(12,18,14,18,'#').rect(20,1,20,20,'#').put(20,14,'.').rect(24,13,27,13,'#').rect(30,1,30,20,'#').put(30,14,'.').put(3,17,'P');
function arena(shot,weak){return shell().rect(0,18,39,22,'#').rect(1,2,1,17,'%').rect(36,1,36,17,'G').rect(39,13,39,17,'.').rect(5,16,8,16,'Y').rect(11,12,14,12,'Y').rect(5,8,8,8,'Y').put(3,17,'P');}
const qrelease=shell().rect(0,18,39,22,'#').put(6,17,'_').rect(19,1,20,17,'H').rect(39,13,39,17,'.').put(3,17,'P');
const qlight=shell().rect(0,18,8,22,'#').rect(9,21,29,21,'^').rect(9,22,29,22,'#').rect(30,8,39,22,'#').rect(29,9,29,20,'<').rect(39,3,39,7,'.').rect(12,15,16,15,'Y').rect(21,11,25,11,'Y').put(34,7,'*').put(3,17,'P');
const boss=(id,name,shot,weak,hits,final=false,more={},hint='A bolt through a portal is yours · return it to the lit band')=>r(id,name,hint,'Which heights must the two mouths connect?',arena(shot,weak),{study:true,portalMode:'two',tyrant:{shotRow:shot,weakRow:weak,hits,final,...more}});
export default {n:13,name:'The Void Tyrant',kit:['dash','strike','parry','portal'],blurb:'The ledgers hold once. The Tyrant’s own bolts can cross the distance his armour cannot.',outro:'The ward folds into a seam. The crown rises through it. He has withdrawn; he has not fallen.',
 folk:{figure:{cloak:'#65607e',trim:'#b9d7ee',skin:'#c4bed1',hood:true}},
 props:{'citadel-window':[[0,-22,10,22,'#373048'],[1,-21,8,20,'#8b9bad']], 'citadel-window@figure-glass':[[0,-22,2,22,'#373048'],[8,-22,2,22,'#373048'],[2,-22,6,2,'#373048'],[3,-5,4,5,'#e5c98d']]},
 rooms:[
 r('mouth','The Fissure Mouth','A spent foothold lasts until you leave it','Can you read the ledge before spending it?',mouth,{people:[{who:'oren',c:7,r:17,line:'The books hold your weight. Once. Nobody here has been back to return them.'}]}),
 r('ledgers','The Rising Ledgers','Stop as long as you need · a foothold falls when you leave','Which ledge must still exist for the last jump?',ledgers),
 r('tower','The Turn of the Stair','A ledge is spent when you leave its side, too','Which way should you face before committing to the next shelf?',tower),
 r('rest','A Place to Wait','Resting keeps the ledge · a crystal restores one dash','What can you prepare without consuming the place you stand?',rest),
 r('opposed','The Opposed Faces','A portal joins two pale faces','Which face is on the far side of the wall?',opposite,{portalMode:'one',portals:[{color:'orange',c:22,r:14,face:'r'}]}),
 r('spent','The Spent Line','A spent ledge waits for you; cracked stone does not','Where can you stop to plan the next jump?',spent),
 r('tear','The First Tear','Dash into the tear · it carries you to the other end','How far can a tear carry what a dash cannot?',tearOne,{lines:[{a:[9,17],b:[31,17]}]}),
 r('vigil','The Paradox Vigil','The chimney leads to the figure behind the glass','Will you take the road or find the other side of the window?',vigil,{side:'up',people:[{who:'figure',c:9,r:17,quest:'figure',leaveDone:'right',line:'I was waving. The release is through that chimney. I can see the lights, but not what is behind them.',lineDone:'The glass was colder on the other side. I’ll stay by the lights a little.'}],decor:[{k:'citadel-window',c:11,r:17}]}),
 r('tears','Tear to Tear','A tear sets you down with your dash back · the ledger is the next mouth','Which tear do you take before the ledger falls?',tearTwo,{lines:[{a:[6,17],b:[18,17],setDown:true},{a:[19,17],b:[30,5]}]}),
 r('broken','The Broken Ledger','A downward cut on a pod gives height and a dash','Which resource does the pod replace after the first ledge is gone?',broken),
 r('high','The Crown Stair','One use per ledge; one dash per landing','What still remains after the second ledger falls?',high),
 r('crossing','The Vigil Crossing','Three tears to the ward · each sets you on a perch','Where does each ride leave you facing the next?',crossing,{lines:[{a:[5,17],b:[13,17],setDown:true},{a:[14,17],b:[24,12]},{a:[26,12],b:[35,17],setDown:true}]}),
 boss('low','The Lower Ward',14,10,2,false,{lanes:[14,17],every:120},'Return his bolt to the lit band · after a return his lane drops to the floor: re-aim, then get off it'),
 boss('middle','The Middle Ward',10,6,2,false,{lanes:[10,16],every:120,rake:{every:130,first:70,speed:140}},'Return his bolt to the lit band · when his eyes flare, his low hand throws at you: cut it'),
 boss('crown','The Crown Does Not Fall',6,14,3,true,{lanes:[6,17,17],bands:[14,14,4],every:120,rake:{every:120,first:90,speed:140}},'Three returns · his lane drops to the floor, then the band climbs: take the ledgers up as he rises')
 ],quests:[{id:'figure',title:'The Other Side',giver:'The Figure',from:'v13-vigil',back:{c:5,r:17},keepsake:{id:'figure-glass',name:'A Piece of Warm Glass',gives:'The figure leaves the window for the lights. Their Fractured echo opens.'},rooms:[
 r('q-release','The Second Contact','Here, the portal key leaves an echo · an echo holds a plate','How can you keep the contact pressed while crossing its door?',qrelease,{echo:true}),
 r('q-light','Behind the Lights','The ledges do not return until you retry','Which shelves take you to the warm glass?',qlight)
 ]}]};
