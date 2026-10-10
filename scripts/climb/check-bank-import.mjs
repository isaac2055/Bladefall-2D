// Verify the actual imported 40-world registry, routes, changed joins and migration.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {Core,keysToInput,expand} from '../pcore-tape.mjs';
import {records} from '../room-bank/register.mjs';
import {CUTS,SUPERS,BOSS_START,integrateCampaign} from './import-bank.mjs';
const require=createRequire(import.meta.url),source=JSON.parse(readFileSync('scripts/climb/source-worlds-7.303.json','utf8'));
const raw=[];vm.runInNewContext(readFileSync('public/bladefall-climb-worlds.js','utf8'),{BladefallClimb:{addWorld:w=>raw.push(w)}});
const worlds=JSON.parse(JSON.stringify(raw));assert.deepEqual(worlds,integrateCampaign(source));
require('../../public/bladefall-climb-bank-passages.js');const Passage=globalThis.BladefallClimbBankPassages;
const originals=new Map(records.map(r=>[r.room.id,r])),imports=worlds.flatMap(w=>w.rooms.filter(d=>d.campaignImport));
assert.equal(worlds.length,40);assert.equal(imports.length,97);assert.equal(new Set(imports.map(d=>d.bankOrigin)).size,97);
assert.deepEqual(imports.map(d=>d.bankOrigin).sort(),records.map(r=>r.room.id).sort());
let dialogues=0,links=0;const routes=[];
function play(g,tape){let exited=false,deaths=0,frames=0;for(const k of [...expand(tape),...Array(30).fill('')]){Core.step(g,keysToInput(k));frames++;for(const e of g.events){if(e.type==='death')deaths++;if(e.type==='exit'&&!e.side)exited=true;}g.events.length=0;if(exited)break;}return {exited,deaths,frames};}
for(const w of worlds){
 const old=source.find(x=>x.n===w.n),byId=new Map(w.rooms.map(d=>[d.id,d])),oldById=new Map(old.rooms.map(d=>[d.id,d]));
 assert(w.bankIntegration.ordinary.length>=2&&w.bankIntegration.ordinary.length<=3);
 assert.equal(w.bankIntegration.superroom,SUPERS[w.n]?`cl${w.n}-${SUPERS[w.n]}`:null);
 for(const id of w.requiredMainRooms)assert(w.sections.some(s=>s.room===id)&&!byId.get(id).connector);
 for(const id of w.requiredBankRooms)assert(w.requiredMainRooms.includes(id));
 for(const cut of w.retiredRoomDetails){assert(CUTS.includes(cut.id));assert(!byId.has(cut.id));assert(byId.has(cut.to));assert(w.sections.some(s=>s.room===cut.to));for(const person of oldById.get(cut.id).people||[]){assert(byId.get(cut.to).people.some(p=>p.who===person.who&&p.line===person.line));dialogues++;}}
 for(const q of [...w.quests,...w.secrets])for(const id of [q.from,q.host,q.returnTo].filter(Boolean))assert(byId.has(id),`branch ${q.id} host missing`);
 for(const d of w.rooms){for(const field of ['doors','returns'])for(const port of d[field]||[])assert([...w.quests,...w.secrets].some(q=>q.id===(port.to||port.from)),`${d.id} dangling ${field}`);}
 assert.deepEqual(w.quests,old.quests);assert.deepEqual(w.secrets,old.secrets);
 for(const d of w.rooms.filter(d=>!d.campaignImport&&!d.campaignTransfer)){
  const prev=oldById.get(d.id);assert(prev,'unexpected native room');const a={...d},b={...prev};delete a.people;delete b.people;assert.deepEqual(a,b,`${d.id}: native definition changed`);
  for(const [key,tape]of Object.entries(old.tapes).filter(([k])=>k===d.id||k.startsWith(d.id+'#')))assert.deepEqual(w.tapes[key],tape,`${key}: native tape changed`);
 }
 for(let i=1;i<w.sections.length;i++){
  const from=w.sections[i-1].room,to=w.sections[i].room,j=old.sections.findIndex(s=>s.room===from),continuous=j>=0&&old.sections[j+1]?.room===to;
  const link=Passage.checkpointLink(w,from,to);assert.equal(!!link,!continuous,`${from} -> ${to} transition definition`);
  if(link){links++;assert(Passage.checkpointLink(w,to,from).reverse);assert.equal(Passage.previousLink(w,to).from,from);
   const g=Core.createGame(w.rooms,{room:w.rooms.findIndex(d=>d.id===from)});g.p.vx=800;g.p.vy=-900;g.p.carrying=1;g.prev={jump:true,dash:true};g.freeze=7;g.frame=12345;
   Core.enterRoom(g,w.rooms.findIndex(d=>d.id===to));Passage.arrive(g);
   assert.equal(g.p.x,g.room.spawn.x);assert.equal(g.p.y,g.room.spawn.y);assert.equal(g.p.vx,0);assert.equal(g.p.vy,0);assert.equal(g.p.carrying,null);assert.equal(g.freeze,0);assert.equal(g.p.dashes,g.p.maxDashes);
   assert.equal(Passage.previousLink(w,to).from,from,'pause return points backward only');
  }
 }
 const boss=BOSS_START[w.n];if(boss){const first=w.sections.findIndex(s=>s.room===boss);assert(w.bankIntegration.ordinary.every(id=>w.sections.findIndex(s=>s.room===id)<first));assert(!w.bankIntegration.superroom);}
 const challenge=w.sections.filter(s=>!byId.get(s.room).connector);if(SUPERS[w.n])assert.equal(challenge.at(-1).room,w.bankIntegration.superroom);
 const g=Core.createGame(w.rooms,{room:0});
 for(const d of w.rooms.filter(d=>d.campaignImport)){
  const record=originals.get(d.bankOrigin),definition={...d};for(const k of ['origin','bankOrigin','rbr','bank','campaignImport'])delete definition[k];definition.id=record.room.id;assert.deepEqual(definition,record.room,`${d.id}: approved geometry/profile`);assert.deepEqual(w.tapes[d.id],record.tape);
  const used=new Set(record.tape.map(x=>x[1]).join(''));for(const [key,ability]of Object.entries({x:'dash',s:'strike',p:'parry',q:'portal'}))if(used.has(key))assert(w.kit.includes(ability),`${d.id}: world kit lacks ${ability}`);
  g.frame=12345;g.freeze=7;Core.enterRoom(g,w.rooms.findIndex(r=>r.id===d.id));Passage.arrive(g);const r=play(g,w.tapes[d.id]);assert(r.exited&&r.deaths===0,`${d.id} integrated route ${JSON.stringify(r)}`);routes.push({world:w.n,id:d.id,source:d.bankOrigin,...r});
 }
}
// Load the same registry/atlas/physical geography modules as the browser.
globalThis.BLADEFALL_CLIMB=true;
for(const name of ['climb','climb-atlas','climb-passages','climb-worlds','climb-geography','climb-geography-build'])require(`../../public/bladefall-${name}.js`);
globalThis.BladefallClimbGeographyBuild.install();const CL=globalThis.BladefallClimb;
for(const w of CL.worlds)for(const d of w.rooms.filter(r=>r.campaignImport))assert.deepEqual(d.map,originals.get(d.bankOrigin).room.map,`${d.id}: atlas cut through bank geometry`);
for(const w of CL.worlds){
 const atlas=globalThis.BladefallClimbAtlas.create(CL.worlds,{});assert(!atlas.complete(w.n));
 atlas.solve(w.atlasEnd);assert(!atlas.complete(w.n),'last room alone cannot clear world');
 for(const id of w.requiredMainRooms.slice(1))atlas.solve(id);assert(!atlas.complete(w.n),'one missed personal challenge blocks world completion');
 atlas.solve(w.requiredMainRooms[0]);assert(atlas.complete(w.n));
 for(const [id,to]of Object.entries(w.retiredRooms)){const migrated=globalThis.BladefallClimbAtlas.create(CL.worlds,{version:1,checkpoint:{world:w.n,room:id},solved:{}});assert.equal(migrated.state.checkpoint.room,to);}
}
const report={version:'7.304.0',worlds:40,cuts:CUTS.length,ordinary:87,superrooms:10,mainChallenges:worlds.reduce((n,w)=>n+w.requiredMainRooms.length,0),unchangedBankDefinitions:97,integratedRoutes:routes.length,checkpointLinks:links,dialogueRecordsPreserved:dialogues,questAndSecretChainsPreserved:true,nativeGeometryAndTapesPreserved:true,ownCompletionGuard:true,cutCheckpointMigration:true,geographySections:CL.geography.rooms.size,routes};
if(process.argv.includes('--write'))writeFileSync('docs/room-bank/campaign-integration-7.304-audit.json',JSON.stringify(report,null,2)+'\n');
console.log('PASS',JSON.stringify({...report,routes:undefined}));
