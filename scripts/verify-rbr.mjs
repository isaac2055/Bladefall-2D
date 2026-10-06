// Room by Room (7.259): every region's rooms finish on their tapes with no deaths, quest branches open and
// come back, keepsake pickups are reachable, and nothing leaks into the Precision Courses. No browser.
//   node scripts/verify-rbr.mjs [regionNumber ...]
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {readdirSync} from 'node:fs';
const here=dirname(fileURLToPath(import.meta.url)),require=createRequire(import.meta.url);
const pub=resolve(here,'../public');
let fail=0;const ok=(c,m)=>{if(!c||process.env.VERBOSE)console.log((c?'ok   ':'FAIL ')+m);if(!c)fail++;};

// Off a Room by Room page the regions register nothing.
const T=await import('./pcore-tape.mjs');
const before=T.Rooms.chapters.length;
require(resolve(pub,'bladefall-rbr.js'));
const files=readdirSync(pub).filter(f=>/^bladefall-rbr-\d\d-.*\.js$/.test(f)&&!/-view\.js$/.test(f)).sort();
for(const f of files)require(resolve(pub,f));
ok(T.Rooms.chapters.length===before&&!T.Rooms.chapters.some(c=>c.rbr),`without ?pitch=rbr the chapter list is untouched (${before})`);
{const missing=files.filter(f=>!globalThis.BladefallRoomByRoom.FILES.includes(f.slice(14,-3)));
 console.log(missing.length?`note  not yet on the page (add to FILES in bladefall-rbr.js when reviewed): ${missing.join(' ')}`:`ok   the page's FILES list names every region file (${files.length})`);}
// On the page (the flag stands in for the URL): reload the registry and the regions.
for(const f of ['bladefall-rbr.js',...files])delete require.cache[resolve(pub,f)];
globalThis.BLADEFALL_RBR=true;
const L=await import('./rbr-lib.mjs');
const {Rooms,RBR,sideRun,roomDef}=L;
ok(Rooms.chapters.every((c,i)=>c.level===undefined||c.level===i+1),'every numbered level keeps its chapter index');
const only=process.argv.slice(2).map(Number);
const ids=new Set();let rooms=0,regions=0;
for(const reg of RBR.regions){
 if(only.length&&!only.includes(reg.n))continue;regions++;
 const lock=['dash','strike','parry','portal'].filter(v=>!reg.kit.includes(v));
 const all=[...reg.rooms,...reg.quests.flatMap(q=>q.rooms)];
 for(const r of all){
  rooms++;
  ok(!ids.has(r.id),`${r.id}: id is unique`);ids.add(r.id);
  const cols=r.cols||40,rws=r.rows||23;
  ok(r.map.length===rws&&r.map.every(row=>row.length===cols),`${r.id}: map is ${cols}×${rws}`);
  ok(!!(r.name&&r.hint&&r.question),`${r.id}: has a name, a hint and a question`);
  ok(lock.every(v=>(r.lock||[]).includes(v)),`${r.id}: locks what ${reg.name} has not granted (${lock.join(',')||'nothing'}; a room before a grant may lock more)`);
  const t=Rooms.tapes[r.id];
  if(!t){ok(false,`${r.id}: has a tape`);continue;}
  const res=sideRun(r.id,t);
  ok(res.exited&&!res.side&&res.deaths===0,`${r.id} (${r.name}): finishes on its tape by its ${r.exit||'right'} exit, ${res.deaths} deaths, frame ${res.frame}`);
  // A player who waits at the spawn must not die there (the view idles before the first input).
  const idle=sideRun(r.id,[[60,'']],0),late=sideRun(r.id,[[14,''],...t]);
  ok(idle.deaths===0,`${r.id}: standing still at the spawn is safe for a second, ${idle.deaths} deaths`);
  ok(late.exited&&late.deaths===0,`${r.id}: its tape still finishes when started 14 frames late (as the real view plays it), ${late.deaths} deaths`);
  if(r.side){
   ok(r.side!==(r.exit||'right'),`${r.id}: side exit differs from the road's`);
   const ts=Rooms.tapes[r.id+'#side'];
   if(!ts)ok(false,`${r.id}: has a #side tape`);
   else{const s=sideRun(r.id,ts);ok(!s.events.some(e=>e.type==='shard')||!!r.quest,`${r.id}: its side tape leaves the room's pickup alone`);ok(s.exited&&s.side&&s.deaths===0,`${r.id}: its side tape leaves by the ${r.side} side into the quest, ${s.deaths} deaths`);}
  }
  if(!r.quest&&r.map.join('').includes('*'))ok(!res.events.some(e=>e.type==='shard'),`${r.id}: the road's tape leaves its pickup alone (a bearing or keepsake is a detour)`);
  if(r.bearing){
   const tb=Rooms.tapes[r.id+'#bearing'];
   if(!tb)ok(false,`${r.id}: has a #bearing tape`);
   else{const s=sideRun(r.id,tb);ok(s.exited&&!s.side&&s.deaths===0&&s.events.some(e=>e.type==='shard'),`${r.id}: the ${r.bearing} bearing can be taken on the way through, ${s.deaths} deaths`);}
  }
 }
 for(const q of reg.quests){
  ok(!!(q.title&&q.giver),`${reg.name} · quest ${q.id}: has a title and a giver`);
  ok(!q.keepsake||!!(q.keepsake.name&&q.keepsake.gives),`${reg.name} · quest ${q.id}: its keepsake says what it gives`);
  if(q.rooms.length){
   const from=reg.rooms.find(r=>r.id===q.from);
   ok(!!from&&from.sideQuest===q.id,`quest ${q.id}: opens from ${q.from}'s side exit`);
   ok(!!q.back&&roomDef(q.from).map[q.back.r][q.back.c]!=='#',`quest ${q.id}: comes back to open ground in ${q.from}`);
   const pick=q.rooms.filter(r=>r.map.join('').includes('*'));
   ok(pick.length===0||pick.some(r=>{const s=sideRun(r.id,Rooms.tapes[r.id]||[]);return s.events.some(e=>e.type==='shard');}),`quest ${q.id}: its tapes take the keepsake`);
  }
  if(q.bearings)for(const b of q.bearings)ok(reg.rooms.some(r=>r.bearing===b&&r.map.join('').includes('*')),`quest ${q.id}: bearing ${b} is set in a room`);
 }
}
console.log(`${regions} region(s), ${rooms} rooms`);
console.log(fail?`${fail} failed`:'all passed');
process.exit(fail?1:0);
