// Precision Core lab (7.280): teaching rooms for the zipline and the three Fractured devices (fault lines, the
// shade, mirror panes). Not a region: content agents copy a room into their region source (change the id prefix,
// keep the device fields) and re-prove it there. Proven here by rbr-find through the lab preload:
//   node --import ./scripts/pcore-lab/register.mjs scripts/rbr-find.mjs lab-zip-1 --acts climb --plain
// Screenshots: node scripts/pcore-lab/shot.mjs <outDir> lab-zip-1@40 ...
import {grid} from '../rbr-src/build.mjs';
const shell=()=>grid().frame();
const r=(id,name,hint,question,m,extra={})=>({id:'lab-'+id,name,hint,question,map:m.rows(),palette:'citadel',...extra});

// 1. The first tear: a level line across a thorned void. The gap (21 tiles) is far past a jump and a dash.
const zip1=shell().rect(0,18,9,22,'#').rect(10,21,30,21,'^').rect(10,22,30,22,'#').rect(31,18,39,22,'#')
 .rect(39,13,39,17,'.').put(3,17,'P');
// 2. Two tears, chained: a level ride sets you down on a perch; a climbing ride lifts you past a thorned face.
const zip2=shell().rect(0,18,6,22,'#').rect(7,21,38,21,'^').rect(7,22,38,22,'#').rect(11,1,12,13,'#').rect(11,14,12,14,'v')
 .rect(17,18,19,18,'#').rect(30,8,38,20,'#').rect(29,8,29,20,'<').rect(39,2,39,7,'.').put(3,17,'P');

// 3. Fault lines: a fault strip cracks from where you touch it and falls tile by tile; run it out.
const fault1=shell().rect(0,18,5,22,'#').rect(6,21,33,21,'^').rect(6,22,33,22,'#').rect(6,18,33,18,'T').rect(34,18,39,22,'#')
 .rect(39,13,39,17,'.').put(3,17,'P');
// 4. The shade: your own path, a second behind. Up the stair and back down the other side, never doubling back.
const shade1=shell().rect(0,18,39,22,'#').rect(8,15,13,17,'#').rect(16,12,21,17,'#').rect(24,9,29,17,'#')
 .rect(39,13,39,17,'.').put(3,17,'P');
// 5. Mirror panes: glass from floor to ceiling, passable only by a dash. Through the first, left is right for the
//    landing on the perch; the dash comes back there, and the second pane (the only way on) turns it back.
const mirror1=shell().rect(0,18,9,22,'#').rect(10,21,28,21,'^').rect(10,22,28,22,'#').rect(29,18,39,22,'#')
 .rect(14,1,14,20,'|').rect(22,1,22,20,'|').rect(19,15,20,15,'#').rect(39,13,39,17,'.').put(3,17,'P');

export const rooms=[
 r('zip-1','The First Tear','Dash into the tear · it carries you to the other end','How far can a tear carry what a dash cannot?',zip1,
  {lines:[{a:[9,17],b:[31,17]}]}),
 r('zip-2','Tear to Tear','A tear gives your dash back · the perch is the next mouth','Which tear do you take from the perch?',zip2,
  {lines:[{a:[6,17],b:[18,17],setDown:true},{a:[19,17],b:[30,5]}]}),
 r('fault-1','The Fault Line','Cracked stone falls where you touched it · then the crack runs','How far can you get before the crack catches you?',fault1,
  {palette:'fractured',fault:{}}),
 r('shade-1','Your Own Shadow','Your shade walks where you walked · a second behind','Where can you go that you have not just been?',shade1,
  {palette:'fractured',shade:{delay:60}}),
 r('mirror-1','The Glass','A dash through glass turns left into right · dash through glass again to turn it back','Which way is forward on the far side of the glass?',mirror1,
  {palette:'fractured',mirror:{}}),
];
