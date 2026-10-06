// Room by Room: a Fractured region (25–40) from its base region (5–20), as the hourly Climb routine's first pass
// (7.278). The Fractured world is the familiar one seen in a broken mirror: every room is its base room reflected
// left to right (map, devices, people, routes), and each base quest becomes that person's echo, sealed until the
// base keepsake is held (q.needs). A room whose reflection does not play cleanly (its route, a late start, standing
// at the spawn, its side way) keeps its base orientation instead, as the Fractured Updrafts reuse the Updrafts'.
// Writes scripts/rbr-src/NN-f-<key>.mjs and its tapes; then run gen.mjs NN.
//   node scripts/rbr-src/fracture.mjs 25            (or several: 25 26 27 …)
import {writeFileSync} from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {dirname,resolve} from 'node:path';
import {readdirSync,readFileSync,existsSync} from 'node:fs';
import {Core,RBR,expand,keysToInput} from '../rbr-lib.mjs';
import {SAVED_FOR_LATER} from '../climb/spec.mjs';   // a room the Climb keeps for later never joins its road or branch
const here=dirname(fileURLToPath(import.meta.url));

// Each echo: what the person says at the door and at the far end, and what is remembered. Written for this pass;
// the base quest's own story stays as it is.
const ECHO={
 recruit:{title:'The Crossing Twice',name:'THE RECRUIT’S ECHO',at:['I made the crossing. I keep making it, to be sure I did.','You came up behind me. I didn’t duck.'],end:['The helmet was never what held me up.','I can put it down now. The bridge will still be there.'],gives:'He crossed the bridge with his head up, every time after. Shown at the end.'},
 archivist:{title:'The Fourth Volume',name:'THE ARCHIVIST’S ECHO',at:['There was a fourth volume. It agreed with all three, so I left it.','You found it. Read me the last line.'],end:['It says the gate was only ever a door.','I will sit with that one for a while.'],gives:'He wrote a fourth book that agreed with the other three. Shown at the end.'},
 keeper:{title:'The Door on the Latch',name:'THE KEEPER’S ECHO',at:['I still hold the door. Habit. Nobody comes through.','You came through. That’s a first.'],end:['Brown paper. Same lunch. Different side of the door.','Leave it open behind you. I’ll eat outside.'],gives:'The Keeper ate on the step with the door wide open. Shown at the end.'},
 winter:{title:'The Blue Cup',name:'THE NEIGHBOUR’S ECHO',at:['The stove went cold the day after. I kept the cup on the sill anyway.','You climbed it. The last step too.'],end:['That’s the warmth I remember. Not the coal.','Sit a minute. Then go on.'],gives:'Her blue cup stayed on the sill, and someone always stopped for it. Shown at the end.'},
 creature:{title:'Under the Jaw',name:'THE KEEPER’S ECHO',at:['He never settled again without the cold. I kept the glove.','Gently. He knows the glove, not you.'],end:['Look at his feet. Properly asleep.','That’s all I wanted. One more time.'],gives:'The creature slept on its frost, and the Keeper slept beside it. Shown at the end.'},
 quota:{title:'Both Counters Green',name:'THE WORKERS’ ECHO',at:['Same piece, round and round. We never stopped it.','You can stop it. Up there, with the counters.'],end:['Both green. Nobody counted after that.','Lunch for two, on the bench, for good.'],gives:'Maker and Breaker left the line running and never went back to it. Shown at the end.'},
 automaton:{title:'The Sixth Birdhouse',name:'THE AUTOMATON’S ECHO',at:['I made a sixth birdhouse. My hands are still too large for the roof.','Please hold the panel. Gently. A bird is near.'],end:['It is holding. The bird is inside.','We should stop moving. It is sleeping.'],gives:'A bird nested in the sixth birdhouse, and the automaton kept very still. Shown at the end.'},
 neighbours:{title:'Whose Floor',name:'THE NEIGHBOURS’ ECHO',at:['We never agreed which way was down. We had tea anyway.','Bring the second cup. Either table.'],end:['One sugar. She noticed.','Her down, my down. The tea stays in the cup.'],gives:'Two neighbours shared tea on a table that faced both ways. Shown at the end.'},
 figure:{title:'Behind the Lights',name:'THE FIGURE’S ECHO',at:['I went toward the lights. I wanted to see what was behind them.','Come and look. It’s not what I feared.'],end:['Only more windows. More people waving.','I’ll wave back, this time.'],gives:'The figure found other windows, and waved at every one. Shown at the end.'},
 alarm:{title:'Three Short, Two Long',name:'THE BELLKEEPER’S ECHO',at:['The bell rang one last time after you left. I still count it.','Three short, two long. Then nothing.'],end:['Quiet. The posts are empty.','They all went home. I can too.'],gives:'The Bellkeeper heard the last alarm end, and went home. Shown at the end.'},
 miner:{title:'The Ledger Line',name:'THE MINER’S ECHO',at:['My name is in the ledger. I keep reading it, to be sure.','Down the siding. You know the way now.'],end:['There. In ink, not chalk.','I’ll walk out on the main line this time.'],gives:'The Miner walked out of the Deep Line on his own legs. Shown at the end.'},
 sailors:{title:'Two Halves',name:'THE SAILORS’ ECHO',at:['We each kept a half. We never once let go.','The rigging again. Keep an eye out.'],end:['Still the rope. It was always the rope.','But we kept the charm.'],gives:'Two sailors kept two halves of one charm, and the ship held. Shown at the end.'},
 birthday:{title:'Quiet on the Porch',name:'THE SOLDIER’S ECHO',at:['They lit every candle. Nobody made an announcement.','Up in the wreck. Keep it dry.'],end:['That was a good cake.','It is quiet out here. I like it quiet.'],gives:'The soldier had his birthday on the porch, and nobody made a fuss. Shown at the end.'},
 mother:{title:'Mine First',name:'THE MOTHER’S ECHO',at:['The cup is still beside the bed. I asked my questions first.','The old shelter. You know where it’s been.'],end:['Only a little, to start. Then more.','She is asleep. We spoke quietly.'],gives:'The cup stayed beside the bed, and the questions got answers. Shown at the end.'},
 pilgrim:{title:'Travelling Lighter',name:'THE PILGRIM’S ECHO',at:['I left the medals somewhere. Not all of them.','Send the sack up. Don’t open it. Fine, open it.'],end:['One medal. It holds the pot steady.','That is the right weight to carry.'],gives:'The Pilgrim kept one medal, the useful one. Shown at the end.'},
 garden:{title:'The Evening Flower',name:'THE GARDENER’S ECHO',at:['The shutters stay closed now. The garden decided.','Through the gallery. Mind the light.'],end:['Look, by the bench. Every evening, now.','She liked it in the evenings. So do I.'],gives:'The garden bloomed in shade every evening after. Shown at the end.'},
};
const BLURB={
 5:['The watch is empty. The archers are still at their posts, facing the other way.','The last perch is behind you. The bridge you crossed is in front of you again.'],
 6:['The Keep stands reflected. Its lantern burns on the wrong side of every door.','The keystone turns the other way. The gaol bells are ringing backwards.'],
 7:['The cells face the other wall. The Warden walks his rounds in mirror.','The service door is on the latch. The frost beyond it is waiting.'],
 8:['Frostfell turned over. The wind blows the way it used to come back.','The last shelter is warm on the wrong side. The court above is glass.'],
 9:['The Sorcerer’s court, reflected in its own ice.','The pools freeze in the other order. The heat below is rising.'],
 10:['The pour schedule runs backwards along the other wall.','The last slab cools. The foundry beyond is hammering.'],
 11:['The Colossus works the other hand. The belts run the other way.','The anvils fall quiet. Up ahead, the floor and ceiling trade places.'],
 12:['The Inversion, inverted again: the prisms point the other way.','You are the right way up, or the other right way. The citadel waits.'],
 13:['The Tyrant’s footholds are spent on the other side.','The window faces the other way. The throne below is listening.'],
 14:['The King’s hall, in the mirror of its own echo.','The alarm is quiet. The line below the throne is running.'],
 15:['The Deep Line runs westbound now. The carts remember the way.','The last platform. The cliffs above are loud with thunder.'],
 16:['Thunder Cliffs, reflected in the storm.','The decks swing back. The shore below is already flooding.'],
 17:['The Landing Shores, the tide coming in from the other side.','The last float. The colony’s lights are sweeping.'],
 18:['The Colony under its smoke, seen in a broken window.','The watch lights turn away. The road to the palace is bright.'],
 19:['The Path to the Palace, walked the other way.','The last mirror. Sunspire is ahead, its shutters closed.'],
 20:['Sunspire in the mirror: the light comes through the other windows.','The garden blooms in shade. The fracture ends here, or begins.'],
};
const swapLR=s=>typeof s==='string'?s.replace(/\b(left|right|Left|Right|LEFT|RIGHT)\b/g,w=>({left:'right',right:'left',Left:'Right',Right:'Left',LEFT:'RIGHT',RIGHT:'LEFT'})[w]):s;
const SIDE={left:'right',right:'left'};
const swapSide=v=>SIDE[v]||v;
// tiles with a direction: spikes, foundry belts ({ left, } right), rail boost strips (( left, ) right)
const FLIP={'<':'>','>':'<','{':'}','}':'{','(':')',')':'('};
function mirrorMap(map){return map.map(r=>[...r].reverse().map(ch=>FLIP[ch]||ch).join(''));}
function deep(v,C,key,parent){
 if(Array.isArray(v)){
  if(key==='zips')return v.map(([a,b])=>[-a,b]);
  if((key==='to'||key==='dir')&&v.length===2&&v.every(x=>typeof x==='number'))return [-v[0],v[1]];
  if(key==='bays')return v.map(x=>C-1-x);
  return v.map(e=>deep(e,C,key,parent));
 }
 if(v&&typeof v==='object'){
  const o={};
  for(const [k,x] of Object.entries(v)){
   if(k==='c'&&typeof x==='number')o.c=C-x-(typeof v.w==='number'&&v.w<C?v.w:key==='portals'&&(v.face==='u'||v.face==='d')?2:1);   // (a floor or ceiling portal is two tiles wide)
   else if(k==='x'&&typeof x==='number')o.x=key==='combat'||parent==='combat'||key==='receivers'||key==='doors'?C*8-x-(v.w||8):C-1-x;
   else if(k==='dx'&&typeof x==='number')o.dx=-x;
   else if(k==='face')o.face=typeof x==='number'?-x:({r:'l',l:'r'})[x]||x;
   else if(['leave','body','edge','side','exit','entry'].includes(k))o[k]=swapSide(x);
   else if(k==='dir'&&typeof x==='number')o.dir=Math.abs(x)===1?-x:((180-x)%360+360)%360;
   else if(k==='dir'&&typeof x==='string')o.dir=({l:'r',r:'l',left:'right',right:'left'})[x]||x;
   else if(k==='c0'&&typeof x==='number')o.c0=C-1-v.c1;
   else if(k==='c1'&&typeof x==='number')o.c1=C-1-v.c0;
   else if(['cradle','cage'].includes(k)&&typeof x==='number')o[k]=C-1-x;
   else if((k==='from'||k==='to')&&typeof x==='number'&&key==='rescueEscort')o[k]=C-1-x;
   else o[k]=deep(x,C,k,key);
  }
  return o;
 }
 return v;
}
const TEXT=new Set(['name','hint','question','line','lineDone','title']);
function mirrorRoom(d){
 const C=d.cols||40,o={};
 for(const [k,v] of Object.entries(d)){
  if(k==='map')o.map=mirrorMap(v);
  else if(['exit','side','entry'].includes(k))o[k]=swapSide(v);
  else if(k==='hint'||k==='question')o[k]=swapLR(v);
  else if(TEXT.has(k)||k==='id'||k==='rbr'||k==='lock'||k==='palette'||k==='quest'||k==='sideQuest'||k==='bearing')o[k]=v;
  else o[k]=deep(v,C,k,null);
 }
 o.exit=swapSide(d.exit||'right');   // (a room with no exit leaves right, so its reflection leaves left)
 return o;
}
const mirrorTape=t=>t&&t.map(([n,k])=>[n,k.replace(/[rl]/g,ch=>ch==='r'?'l':'r')]);
function run(def,tape,extra=30){const g=Core.createGame([def],{room:0});const f=expand(tape);let out=null,deaths=0;
 for(let i=0;i<f.length+extra;i++){Core.step(g,keysToInput(f[i]||''));for(const e of g.events){if(e.type==='death')deaths++;if(e.type==='exit'&&!out)out=e;}g.events.length=0;if(out)break;}
 return {exited:!!out,side:!!(out&&out.side),deaths};}
// The knight always spawns facing right; a reflected route that acts before it moves (fires the portal key, cuts)
// starts with one frame of left instead, as a player would (fracture keeps whichever plays).
const turned=t=>t&&[[1,'l'],...t];
function playsEither(def,tapes,id){
 if(plays(def,tapes,id))return tapes;
 const alt=Object.fromEntries(Object.entries(tapes).map(([k,t])=>[k,turned(t)]));
 return plays(def,alt,id)?alt:null;
}
function plays(def,tapes,id){
 const t=tapes[id];if(!t)return false;
 const a=run(def,t),late=run(def,[[14,''],...t]),idle=run(def,[[60,'']],0);
 if(!(a.exited&&!a.side&&!a.deaths&&late.exited&&!late.deaths&&!idle.deaths))return false;
 if(def.side&&tapes[id+'#side']){const s=run(def,tapes[id+'#side']);if(!(s.exited&&s.side&&!s.deaths))return false;}
 return true;
}

for(const N of process.argv.slice(2).filter(a=>!a.startsWith('--')).map(Number)){
 const B=N-20,base=RBR.region(B),m=RBR.MANIFEST.find(x=>x.n===N);
 const srcFile=readdirSync(here).find(f=>f.startsWith(String(B).padStart(2,'0')+'-')&&f.endsWith('.mjs'));
 const src=(await import(pathToFileURL(resolve(here,srcFile)).href)).default;
 const baseTapes=base.tapes||JSON.parse(readFileSync(resolve(here,srcFile.replace('.mjs','.tapes.json')),'utf8'));
 const pre=id=>{const mm=/^([a-z]+)\d+-(.*)$/.exec(id);return mm?`f${mm[1]}${N}-${mm[2]}`:`f${N}-${id}`;};
 const keep=new Set(base.quests.filter(q=>q.rooms.length).map(q=>q.id));
 const echoId=q=>q+'-echo';
 const report=[],tapes={};
 // one room: reflected if its reflection plays, else as it was; ids, quests and people renamed for the echo
 // A region is reflected only if every room's reflection plays: a road that mixes reflected rooms with kept ones
 // doubles back on itself in the Climb (the first builds of 26, 29, 30, 31, 35 overlapped), so otherwise the whole
 // region keeps its base orientation.
 const mtOf=id=>{const mt={};for(const [k,t] of Object.entries(baseTapes))if(k===id||k.startsWith(id+'#'))mt[k]=mirrorTape(t);return mt;};
 const liveAll=[...base.rooms,...base.quests.filter(q=>keep.has(q.id)).flatMap(q=>q.rooms)];
 const chosen={};for(const d of liveAll){const t=playsEither(mirrorRoom(d),mtOf(d.id),d.id);if(t)chosen[d.id]=t;}
 const failing=liveAll.filter(d=>!chosen[d.id]&&!SAVED_FOR_LATER[d.id]).map(d=>d.id);
 if(process.argv.includes('--dry')){console.log(N,failing.length?'does not reflect: '+failing.join(', '):'reflects');continue;}
 const REFLECT=!failing.length;
 function convert(srcRoom){
  const flip=REFLECT&&!!chosen[srcRoom.id];   // (a saved room whose reflection fails keeps its orientation)
  const mt=chosen[srcRoom.id]||mtOf(srcRoom.id);
  const r=flip?mirrorRoom(srcRoom):{...srcRoom};
  const newId=pre(srcRoom.id);
  for(const [k,t] of Object.entries(flip?mt:baseTapes))if(k===srcRoom.id||k.startsWith(srcRoom.id+'#'))if(!k.endsWith('#bearing'))tapes[newId+k.slice(srcRoom.id.length)]=t;
  r.id=newId;
  // the Fractured world is empty but for the echoes: other people (and pickups for quests with no echo) go
  const ppl=(r.people||[]).filter(p=>p.quest&&keep.has(p.quest));
  if(ppl.length){const e=ECHO[ppl[0].quest];r.people=[{...ppl[0],who:ppl[0].who,name:e.name,quest:echoId(ppl[0].quest),line:e.at[0],lineDone:e.at[1]}];delete r.people[0].chart;}
  else delete r.people;
  if(r.bearing)delete r.bearing;
  if(r.sideQuest)r.sideQuest=echoId(r.sideQuest);
  if(r.quest&&keep.has(r.quest))r.quest=echoId(r.quest);
  if(r.side&&!base.quests.some(q=>keep.has(q.id)&&q.from===srcRoom.id))delete r.side;   // a side way only for a kept echo
  report.push(newId);
  return r;
 }
 const rooms=src.rooms.map(convert);
 const quests=[];
 for(const q of (src.quests||[])){
  if(!keep.has(q.id))continue;
  const e=ECHO[q.id];if(!e)throw new Error('no echo text for '+q.id);
  const qr=(q.rooms||[]).map(convert);
  // the echo at the far end, where the keepsake was (it stands under the pickup)
  const last=qr.at(-1);let pc=-1,pr=-1;last.map.forEach((row,ri)=>{const ci=row.indexOf('*');if(ci>=0){pc=ci;pr=ri;}});
  if(pc>=0){const giver=(base.rooms.flatMap(d=>d.people||[]).find(p=>p.quest===q.id)||{}).who||q.id;
   last.people=[...(last.people||[]),{who:giver,name:e.name,c:pc,r:pr+1,quest:echoId(q.id),line:e.end[0],lineDone:e.end[1]}];}
  const fromRoom=rooms.find(r=>r.id===pre(q.from));
  const flipped=REFLECT;
  quests.push({id:echoId(q.id),title:e.title,giver:e.name.replace(/’S ECHO$/,'’s echo').replace(/^THE /,'The ').toLowerCase().replace(/^the /,'The ').replace(/^./,ch=>ch.toUpperCase()),
   from:pre(q.from),back:q.back?{c:flipped?(fromRoom.cols||40)-1-q.back.c:q.back.c,r:q.back.r}:undefined,
   keepsake:{id:`${q.id}-remembered`,name:`${q.giver}, remembered`,gives:e.gives},rooms:qr,needs:q.keepsake.id});
 }
 const out={n:N,name:m.name,kit:src.kit||base.kit,folk:src.folk,props:src.props,palettes:src.palettes,
  blurb:BLURB[B][0],outro:BLURB[B][1],
  note:`First pass (7.278, the hourly Climb routine): ${base.name}’s rooms reflected by scripts/rbr-src/fracture.mjs; edit that, or replace this region by hand.`,
  rooms,quests};
 const nn=String(N);
 // (a hand-edited region drops the "Regenerate rather than edit" header: never overwrite it)
 {const f=resolve(here,`${nn}-${m.key}.mjs`);if(existsSync(f)&&!readFileSync(f,'utf8').includes('Regenerate rather than edit')){console.log(`${N}: hand-edited, left alone`);continue;}}
 writeFileSync(resolve(here,`${nn}-${m.key}.mjs`),`// ${m.name}: ${base.name}'s rooms reflected (scripts/rbr-src/fracture.mjs, 7.278). Regenerate rather than edit.\nexport default ${JSON.stringify(out,null,1)};\n`);
 writeFileSync(resolve(here,`${nn}-${m.key}.tapes.json`),JSON.stringify(tapes));
 out.note+=REFLECT?' Every room reflected.':` Kept in its base orientation: these rooms do not reflect cleanly yet: ${failing.join(', ')}.`;
 writeFileSync(resolve(here,`${nn}-${m.key}.mjs`),`// ${m.name}: ${base.name}'s rooms ${REFLECT?'reflected':'(base orientation)'} (scripts/rbr-src/fracture.mjs, 7.278). Regenerate rather than edit.\nexport default ${JSON.stringify(out,null,1)};\n`);
 console.log(`${N} ${m.name}: ${rooms.length} rooms + ${quests.map(q=>q.id+'['+q.rooms.length+']').join(', ')||'no echo'}; ${REFLECT?'reflected':'base orientation (does not reflect: '+failing.join(', ')+')'}`);
}
