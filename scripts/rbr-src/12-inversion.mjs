// Region 12 · The Inversion. The Fall In, Unreachable Line, Reversal, Polarity Gauntlet,
// Drop-Lock and Void Fissure from the campaign become twelve connected screens.
// Prisms are introduced alone, then alternated with landing, crystal and lantern decisions.
// Introduction skip check: i12-reversal without gravity, ordinary movement — no route found.
// Combination skips are allowed; the recorded route uses the hanging ledge and the crystal.
// Tea on the Ceiling is an optional two-room trip for the neighbours' tea service.
import {grid} from './build.mjs';
const room=(id,name,hint,question,g,extra={})=>({id:'i12-'+id,name,hint,question,map:g.rows(),...extra});
const shell=()=>grid().frame();
const fall=shell().rect(0,18,39,22,'#').rect(13,18,17,18,'^').rect(25,15,31,17,'#').rect(39,13,39,17,'.').put(3,17,'P');
const line=shell().rect(0,18,39,22,'#').rect(9,18,12,18,'^').rect(22,18,26,18,'^').rect(16,12,19,12,'#').rect(39,13,39,17,'.').put(3,17,'P');
const reverse=shell().rect(0,18,39,22,'#').rect(0,0,39,3,'#').rect(12,18,38,18,'^').rect(1,4,1,16,'>').rect(7,15,7,17,'Q').rect(39,4,39,7,'.').put(3,17,'P');
const lip=shell().rect(0,18,39,22,'#').rect(0,0,39,3,'#').rect(10,18,38,18,'^').rect(18,4,22,4,'v').rect(7,15,7,17,'Q').rect(39,4,39,7,'.').put(3,17,'P');
const alternate=shell().rect(0,18,39,22,'#').rect(0,0,39,3,'#').rect(10,18,25,18,'^').rect(27,4,38,4,'v').rect(7,15,7,17,'Q').rect(23,4,23,7,'Q').rect(39,14,39,17,'.').put(3,17,'P');
alternate.rect(18,8,20,18,'#').rect(17,8,17,17,'<');
const landing=shell().rect(0,18,39,22,'#').rect(0,0,39,3,'#').rect(10,18,38,18,'^').rect(18,4,23,4,'v').rect(16,10,25,10,'~').rect(7,15,7,17,'Q').rect(39,4,39,7,'.').put(3,17,'P');
const court=shell().rect(0,18,39,22,'#').rect(14,18,20,18,'^').rect(29,14,35,17,'#').rect(39,13,39,17,'.').rect(2,0,6,0,'.').put(3,17,'P');
const divide=shell().rect(0,18,39,22,'#').rect(0,0,39,3,'#').rect(10,18,29,18,'^').rect(30,4,38,4,'v').rect(7,15,7,17,'Q').rect(25,4,25,7,'Q').rect(30,12,32,17,'#').rect(39,13,39,17,'.').put(3,17,'P');
const glass=shell().rect(0,18,39,22,'#').rect(0,0,39,3,'#').rect(10,18,38,18,'^').rect(13,4,28,4,'v').rect(7,15,7,17,'Q').put(19,10,'o').rect(30,8,34,8,'#').rect(39,4,39,7,'.').put(3,17,'P');
const lock=shell().rect(0,18,39,22,'#').rect(0,0,39,3,'#').rect(10,18,38,18,'^').rect(7,15,7,17,'Q').put(4,17,'l').put(29,4,'_').rect(35,4,35,17,'H').rect(39,4,39,7,'.').put(2,17,'P');
const fissure=shell().rect(0,18,39,22,'#').rect(0,0,39,3,'#').rect(10,18,25,18,'^').rect(17,4,20,4,'v').rect(29,4,38,4,'v').rect(7,15,7,17,'Q').rect(25,4,25,8,'Q').rect(39,14,39,17,'.').put(3,17,'P');
fissure.rect(18,9,20,18,'#').rect(17,9,17,17,'<');
const threshold=shell().rect(0,18,39,22,'#').rect(12,18,16,18,'^').rect(23,14,27,17,'#').rect(30,18,34,18,'^').rect(39,13,39,17,'.').put(3,17,'P');
const shelf=shell().rect(0,18,39,22,'#').rect(0,0,39,3,'#').rect(10,18,38,18,'^').rect(18,4,23,4,'v').rect(7,15,7,17,'Q').rect(39,4,39,7,'.').put(3,17,'P');
const service=shell().rect(0,18,39,22,'#').rect(0,0,39,3,'#').rect(10,18,24,18,'^').rect(26,4,38,4,'v').rect(7,15,7,17,'Q').put(18,4,'*').rect(23,4,23,8,'Q').rect(39,14,39,17,'.').put(3,17,'P');
export default {n:12,name:'The Inversion',kit:['dash','strike','parry','portal'],blurb:'Prisms turn the ceiling into the road. A pair of neighbours disagree about down.',outro:'The fissure leads into the Citadel. The floor holds still again.',
 folk:{neighbour:{cloak:'#76618e',trim:'#d9c4aa',skin:'#d6b79b',hood:true},neighbour2:{cloak:'#596b91',trim:'#c3d6db',skin:'#cfae92',hood:true}},
 props:{'tea-table':[[0,-7,13,2,'#8c715a'],[2,-5,2,5,'#665343'],[10,-5,2,5,'#665343']],
 'tea-table@neighbours-cup':[[0,-7,13,2,'#8c715a'],[2,-5,2,5,'#665343'],[10,-5,2,5,'#665343'],[3,-10,3,3,'#dad1be'],[8,-10,3,3,'#b0cbdb']]},
 rooms:[
 room('fall','The Fall In','A held jump carries you farther','Where is the safe landing beyond the first cut?',fall,{people:[{who:'oren',c:7,r:17,line:'Down here, even the floor disagrees with you.'}]}),
 room('line','The Unreachable Line','A dash keeps its direction until it ends','Which gap needs height, and which needs distance?',line),
 room('reversal','The Reversal','Dash through a violet prism to turn gravity over','The floor is thorns. What surface could carry you instead?',reverse),
 room('lip','The Roof Has Teeth','Jump moves away from the surface you stand on','When the ceiling is the floor, which way is a jump?',lip),
 room('alternating','The Second Down','A second prism turns gravity back','Which prism gives you the floor beyond the poison?',alternate),
 room('landing','The Hanging Landing','Cracked stone breaks a moment after you land','Can the hanging ledge give you a place to prepare the next jump?',landing),
 room('court','The Middle Landing','The open chimney is an optional way up','Take the road, or visit the neighbours above it?',court,{side:'up',people:[{who:'neighbour',c:7,r:17,quest:'neighbours',line:'I invited her for tea. She says my floor is wrong. The service is up the chimney.',lineDone:'One sugar. Six years, and I still put in two.'},{who:'neighbour2',name:'Second neighbour',c:8,r:1,ceiling:true,quest:'neighbours',line:'On my table, please. His down is not my down.',lineDone:'Pass the biscuits. Slowly.'}],decor:[{k:'tea-table',c:8,r:17}]}),
 room('divide','Divided Ground','Your dash returns when you land, whichever way you fall','Where should you stand before making the second reversal?',divide),
 room('glass','Glass Between Floors','A crystal restores the dash while you are falling','The ceiling is poisonous too. What catches you between the floors?',glass),
 room('lock','The Drop-Lock','Gravity turns the lantern with you · a plate holds its door','How can the lantern reach a plate on the roof?',lock),
 room('fissure','The Void Fissure','Every prism reverses gravity once per pass','Which ceiling gap must be crossed before turning the world back?',fissure),
 room('threshold','The Quiet Threshold','The floor is steady here','Where do you spend the dash before reaching the Citadel?',threshold)
 ],quests:[{id:'neighbours',title:'Tea on the Ceiling',giver:'The Neighbours',from:'i12-court',back:{c:4,r:17},keepsake:{id:'neighbours-cup',name:'The Chipped Cup',gives:'Tea returns to the neighbours’ table. Their Fractured echo opens.'},rooms:[
 room('q-shelf','The Courtyard Shelf','Jump away from the roof to clear its thorns','How do you cross a poison bed above your head?',shelf),
 room('q-service','The Stranded Service','The tea service is on the first ceiling','What must you collect before the second reversal?',service)
 ]}]};
