// The two-player Ascend rooms (Ascend Together, 7.375), built from rectangles so the maps stay exact.
// node scripts/together/rooms.mjs prints them; public/bladefall-climb-together.js holds the result.
const blank=()=>Array.from({length:23},()=>Array(40).fill('.'));
const rect=(m,c0,r0,c1,r1,ch)=>{for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++)m[r][c]=ch;};
const shell=(m,exitRows)=>{rect(m,0,0,39,0,'#');rect(m,0,0,0,22,'#');rect(m,39,0,39,22,'#');rect(m,0,21,39,22,'#');for(const r of exitRows)m[r][39]='.';};
const out=m=>m.map(r=>r.join(''));
export function rooms(){
 // 1 · Hold the Door: a plate holds the door; the one through stands on the far plate for the other.
 const a=blank();shell(a,[18,19,20]);
 rect(a,18,1,19,13,'#');rect(a,18,14,19,20,'H');
 a[20][12]='_';
 rect(a,26,18,29,20,'#');a[17][28]='_';
 rect(a,31,20,35,20,'^');
 a[20][3]='P';
 // 2 · Ring for Me: the bell flips which steps are solid; ring it while your partner is in the air.
 const b=blank();shell(b,[15,16,17,18]);
 rect(b,1,19,11,20,'#');rect(b,34,19,38,20,'#');
 rect(b,12,20,33,20,'^');
 rect(b,13,19,14,19,'A');rect(b,20,19,21,19,'B');rect(b,27,19,28,19,'A');
 b[15][5]='x';b[15][36]='x';
 b[18][3]='P';
 // 3 · Two Lights: both stones lit open the gate. One is behind a held door, one at the top of the bell steps.
 const c=blank();shell(c,[18,19,20]);
 rect(c,36,1,37,13,'#');rect(c,36,14,37,20,'G');
 rect(c,1,12,8,12,'#');rect(c,8,13,8,13,'#');rect(c,8,14,8,20,'H');c[20][4]='c';
 c[20][11]='_';
 rect(c,19,18,20,18,'A');rect(c,22,16,23,16,'B');rect(c,25,14,26,14,'A');rect(c,28,12,29,12,'B');rect(c,31,10,34,10,'#');c[9][32]='c';
 c[19][24]='x';
 c[20][14]='P';
 return [
  {id:'together-1',name:'Hold the Door',hint:'A plate holds the door open while someone stands on it',map:out(a),exit:'right'},
  {id:'together-2',name:'Ring for Me',hint:'The bell turns which steps are solid · ring it while your partner is in the air',map:out(b),exit:'right'},
  {id:'together-3',name:'Two Lights',hint:'Both stones lit open the gate',map:out(c),exit:'right'},
 ];
}
if(import.meta.url===`file://${process.argv[1]}`)for(const r of rooms()){console.log('==',r.id,r.name);r.map.forEach((row,i)=>console.log(String(i).padStart(2),row));}
