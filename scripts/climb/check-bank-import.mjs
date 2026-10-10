// Audit the saved 7.306 continuous registry; never rerun the geometry search here.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {Core,keysToInput,expand} from '../pcore-tape.mjs';
import {records} from '../room-bank/register.mjs';
import {CUTS} from './import-bank.mjs';
import {FINALES,REPLACE_BOSS} from './continuous-bank.mjs';
import {CL} from './seam-tools.mjs';
const require=createRequire(import.meta.url),copy=x=>JSON.parse(JSON.stringify(x));
// This exact demonstration retiming already ships in atlas.prepareWorld.
const nativeTapeOverrides={'cl4-u4-crown':[[20,'ru'],[5,'rx'],[20,'ru'],[5,'ux'],[55,'ru'],[10,'l'],[1,'ds'],[100,'ru']]};
export function loadWorlds(){const raw=[];vm.runInNewContext(readFileSync('public/bladefall-climb-worlds.js','utf8'),{BladefallClimb:{addWorld:w=>raw.push(w)}});return copy(raw);}
export function closedDef(d){const out=copy(d);if(out.seam?.length){const map=out.map.map(r=>r.split(''));for(const [c,r,ch]of out.seam){assert(map[r]?.[c]!==undefined,d.id+': invalid entrance restoration');map[r][c]=ch;}out.map=map.map(r=>r.join(''));}return out;}
export function liveFlags(g){g.dropThru=g.room.def.campaignImport?!!g.room.def.dropThru:true;g.springUp=!g.room.def.campaignImport;return g;}
export function exitRoute(d,tape){const g=liveFlags(Core.createGame([d.closeWhilePlayed?closedDef(d):d],{room:0})),frames=expand(tape);let deaths=0;for(let i=0;i<frames.length+40;i++){Core.step(g,keysToInput(frames[i]||''));for(const e of g.events){if(e.type==='death')deaths++;if(e.type==='exit'){if(g.flipped&&globalThis.BladefallPrecisionGravity)globalThis.BladefallPrecisionGravity.mirror(g);return {exit:{side:!!e.side,i},deaths,snap:CL.snap(g),g};}}g.events.length=0;}return {exit:null,deaths,snap:null,g};}
export function fireTarget(d){const g=liveFlags(Core.createGame([d],{room:0})),spawn={...g.room.spawn};for(let i=0;i<30;i++){Core.step(g,keysToInput(''));g.events.length=0;}return {spawn,settled:g.p.onGround&&Math.abs(g.p.x-spawn.x)<=10?g.p.y:spawn.y};}
export function atFire(g,target=fireTarget(g.room.def)){return g.p.onGround&&Math.abs(g.p.x-target.spawn.x)<=10&&(Math.abs(g.p.y-target.spawn.y)<=2||Math.abs(g.p.y-target.settled)<=2);}
const sections=w=>[...w.sections,...(w.quests||[]).flatMap(q=>q.sections),...(w.secrets||[]).flatMap(q=>q.sections)];
const shape=d=>{const a=closedDef(d);for(const k of ['seam','closeWhilePlayed','entryBridge','people'])delete a[k];return a;};
const inheritedAtlasSharedMouth=[];
function inheritedSharedMouth(w,a,b,ad,bd){
 // W38's secret return already shares the first room's exact left mouth
 // with its atlas arrival. Preserve only those two original passage footprints.
 if(w.n!==38)return false;
 const hub=ad.id==='cl38-atlas-arrival'?{s:a,d:ad}:bd.id==='cl38-atlas-arrival'?{s:b,d:bd}:null;if(!hub)return false;
 const p=hub.s===a?{s:b,d:bd}:{s:a,d:ad},expected={'cl38-pass-46':[51,-35,4,37],'cl38-pass-47':[51,2,5,5]}[p.d.id];
 if(!expected||hub.d.cols!==56||hub.d.rows!==32)return false;
 if(JSON.stringify([p.s.x-hub.s.x,p.s.y-hub.s.y,p.d.cols,p.d.rows])!==JSON.stringify(expected))return false;
 inheritedAtlasSharedMouth.push([hub.d.id,p.d.id]);return true;
}
function noOverlap(w,old){const defs=new Map(w.rooms.map(d=>[d.id,d])),prior=new Map(sections(old).map(s=>[s.room,s])),all=sections(w);let shared=0;
 for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){const a=all[i],b=all[j],ad=defs.get(a.room),bd=defs.get(b.room),x0=Math.max(a.x,b.x),x1=Math.min(a.x+(ad.cols||40),b.x+(bd.cols||40)),y0=Math.max(a.y,b.y),y1=Math.min(a.y+(ad.rows||23),b.y+(bd.rows||23));if(x0>=x1||y0>=y1)continue;
  const pa=prior.get(a.room),pb=prior.get(b.room);if(pa&&pb&&a.x-b.x===pa.x-pb.x&&a.y-b.y===pa.y-pb.y)continue; // Preserve intentional original native joins.
  if(inheritedSharedMouth(w,a,b,ad,bd))continue;
  assert(x1-x0===1||y1-y0===1,`W${w.n}: overlapping footprints ${a.room} / ${b.room}`);
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)assert('#%'.includes(ad.map[y-a.y]?.[x-a.x]||'#')&&'#%'.includes(bd.map[y-b.y]?.[x-b.x]||'#'),`W${w.n}: overlapping walkable tiles ${a.room} / ${b.room} at ${x},${y}`);shared++;
 }return shared;
}
function branchesPreserved(w,old){let n=0;const all=new Map(sections(w).map(s=>[s.room,s])),before=new Map(sections(old).map(s=>[s.room,s]));
 for(const field of ['quests','secrets']){assert.equal(w[field].length,old[field].length,`W${w.n} ${field} count`);for(const q of w[field]){const prev=old[field].find(x=>x.id===q.id);assert(prev,`unknown branch ${q.id}`);const {sections:nowSec,...meta}=q,{sections:oldSec,...oldMeta}=prev;assert.deepEqual(meta,oldMeta,`${q.id}: branch metadata`);assert.equal(nowSec.length,oldSec.length);let shift=null;
  const refs=[q.from,q.host,q.returnTo,...old.rooms.filter(d=>d.doors?.some(p=>p.to===q.id)||d.returns?.some(p=>p.from===q.id)).map(d=>d.id)].filter(Boolean);
  for(const id of [...oldSec.map(s=>s.room),...refs]){const a=all.get(id),b=before.get(id);assert(a&&b,`${q.id}: missing branch/attachment ${id}`);const delta=[a.x-b.x,a.y-b.y];if(!shift)shift=delta;else assert.deepEqual(delta,shift,`${q.id}: ${id} separated from its branch`);}
  for(let i=0;i<nowSec.length;i++){const {x,y,...a}=nowSec[i],{x:ox,y:oy,...b}=oldSec[i];assert.deepEqual(a,b,`${q.id}: section/fire changed`);}n++;
 }}return n;
}
export function audit(){
 inheritedAtlasSharedMouth.length=0;
 const source=JSON.parse(readFileSync('scripts/climb/source-worlds-7.303.json','utf8')),worlds=loadWorlds(),quiet=JSON.parse(readFileSync('scripts/climb/retired-passages-7.306.json','utf8'));
 assert.equal(worlds.length,40);assert(worlds.every(w=>w.bankIntegration?.version==='7.306.0'&&w.bankIntegration?.geography==='continuous'),'Rebuild the complete 7.306 campaign before running this audit.');
 const originals=new Map(records.map(r=>[r.room.id,r])),imports=worlds.flatMap(w=>w.rooms.filter(d=>d.campaignImport));
 assert.equal(imports.length,117,'expected 87 ordinary rooms + 30 finales');assert.equal(new Set(imports.map(d=>d.bankOrigin)).size,117);assert.deepEqual(imports.map(d=>d.bankOrigin).sort(),records.map(r=>r.room.id).sort());
 let dialogues=0,branches=0,sharedWalls=0,native=0;const routes=[],seams=[],retired=[],routeSnapshots=new Map();
 for(const w of worlds){
  const old=source.find(x=>x.n===w.n),byId=new Map(w.rooms.map(d=>[d.id,d])),oldById=new Map(old.rooms.map(d=>[d.id,d])),places=new Map(w.sections.map(s=>[s.room,s]));
  assert.deepEqual(w.checkpointLinks,[],`W${w.n}: teleport links survived`);assert(w.bankIntegration.ordinary.length>=2&&w.bankIntegration.ordinary.length<=3);assert.equal(w.bankIntegration.superroom,FINALES[w.n]?`cl${w.n}-${FINALES[w.n]}`:null);
  assert.deepEqual([...w.requiredBankRooms].sort(),w.rooms.filter(d=>d.campaignImport).map(d=>d.id).sort());
  assert.deepEqual(w.requiredMainRooms,w.sections.filter(s=>{const d=byId.get(s.room);return !d.connector&&!d.passage&&!d.atlasJunction&&!d.atlasGate&&!d.atlasTransit;}).map(s=>s.room));
  for(const id of w.requiredBankRooms)assert(w.requiredMainRooms.includes(id),id+': bank challenge omitted from personal completion');
  const allowedRetired=new Set([...CUTS,...Object.values(REPLACE_BOSS)]);
  for(const cut of w.retiredRoomDetails){assert(allowedRetired.has(cut.id),`unplanned retirement ${cut.id}`);assert(places.has(cut.to)&&byId.has(cut.to),`invalid retired checkpoint ${cut.id}`);const d=byId.get(cut.id);if(d)assert(d.retiredChallenge&&d.connector,`${cut.id}: retired fight remains playable`);retired.push({world:w.n,...cut});}
  for(const d of old.rooms)for(const person of d.people||[]){assert(w.rooms.some(x=>x.people?.some(p=>p.who===person.who&&p.line===person.line)),`${d.id}: lost dialogue`);dialogues++;}
  branches+=branchesPreserved(w,old);sharedWalls+=noOverlap(w,old);
  for(const d of w.rooms)for(const field of ['doors','returns'])for(const port of d[field]||[])assert([...w.quests,...w.secrets].some(q=>q.id===(port.to||port.from)),`${d.id}: dangling ${field}`);
  for(const d of w.rooms.filter(d=>!d.campaignImport&&!d.campaignWalk&&!d.campaignTransfer)){
   const prev=d.retiredChallenge?quiet.rooms.find(q=>q.id===d.id)?.def:oldById.get(d.id);assert(prev,`${d.id}: unexplained native definition`);assert.deepEqual(shape(d),shape(prev),`${d.id}: native geometry/profile changed beyond entrance restoration`);native++;
   if(!d.retiredChallenge)for(const [key,tape]of Object.entries(old.tapes).filter(([k])=>k===d.id||k.startsWith(d.id+'#')))assert.deepEqual(w.tapes[key],nativeTapeOverrides[key]||tape,`${key}: native tape changed`);
  }
  for(let i=1;i<w.sections.length;i++){const a=w.sections[i-1],b=w.sections[i],k=old.sections.findIndex(s=>s.room===a.room),wasAdjacent=k>=0&&old.sections[k+1]?.room===b.room,proof=w.continuousSeams.find(s=>s.from===a.room&&s.to===b.room);assert(wasAdjacent||proof,`${a.room} → ${b.room}: no continuous proof`);if(wasAdjacent)assert.deepEqual([b.x-a.x,b.y-a.y],[old.sections[k+1].x-old.sections[k].x,old.sections[k+1].y-old.sections[k].y],`${a.room} → ${b.room}: native cluster stretched`);}
  const boss=REPLACE_BOSS[w.n];if(boss&&FINALES[w.n])assert(!byId.has(boss)||byId.get(boss).retiredChallenge,`${boss}: old boss still fights after replacement`);
  for(const d of w.rooms.filter(d=>d.campaignImport||d.campaignWalk||d.retiredChallenge)){
   if(d.campaignImport){const record=originals.get(d.bankOrigin),definition=shape(d);for(const k of ['origin','bankOrigin','rbr','bank','campaignImport'])delete definition[k];definition.id=record.room.id;const originalDefinition=shape(record.room);delete originalDefinition.rbr;assert.equal(d.rbr,w.n,`${d.id}: campaign world profile`);assert.deepEqual(definition,originalDefinition,`${d.id}: approved bank geometry/profile`);assert.deepEqual(w.tapes[d.id],record.tape,`${d.id}: approved tape changed`);
    for(const p of record.room.people||[])assert(d.people?.some(x=>JSON.stringify(x)===JSON.stringify(p)),`${d.id}: missing authored NPC`);
    const used=new Set(record.tape.map(x=>x[1]).join(''));for(const [key,ability]of Object.entries({x:'dash',s:'strike',p:'parry',q:'portal'}))if(used.has(key))assert(w.kit.includes(ability),`${d.id}: kit lacks ${ability}`);
   }
   const r=exitRoute({...d,closeWhilePlayed:true},w.tapes[d.id]);assert(r.exit&&!r.exit.side&&!r.deaths,`${d.id}: closed-entrance route ${JSON.stringify({exit:r.exit,deaths:r.deaths})}`);routeSnapshots.set(d.id,r);routes.push({world:w.n,id:d.id,source:d.bankOrigin||null,kind:d.campaignImport?'bank':d.retiredChallenge?'quiet passage':'connecting road',frames:r.exit.i+1,deaths:r.deaths});
  }
  for(const proof of w.continuousSeams){const from=places.get(proof.from),to=places.get(proof.to),fd=byId.get(proof.from),td=byId.get(proof.to);assert(from&&to&&w.sections.indexOf(to)===w.sections.indexOf(from)+1,`stale seam ${proof.from} → ${proof.to}`);
   const r=exitRoute(fd,w.tapes[fd.id]);routeSnapshots.set(fd.id,r);assert(r.exit&&!r.exit.side&&!r.deaths,`${fd.id}: source exit route`);const g=liveFlags(Core.createGame([td],{room:0}));CL.carry(Core,g,r.snap,{x:from.x*8,y:from.y*8},{x:to.x*8,y:to.y*8});const delta=Math.hypot(g.p.x+to.x*8-r.snap.x-from.x*8,g.p.y+to.y*8-r.snap.y-from.y*8);assert(delta<=12.001,`${fd.id} → ${td.id}: teleport ${delta}px`);assert(Math.abs(delta-proof.entryDelta)<.001,`${fd.id} → ${td.id}: stale entry state`);
   let deaths=0,exits=0;for(const key of expand(proof.toFire)){Core.step(g,keysToInput(key));for(const e of g.events){if(e.type==='death')deaths++;if(e.type==='exit')exits++;}g.events.length=0;}assert(!deaths&&!exits&&atFire(g),`${fd.id} → ${td.id}: saved approach no longer reaches fire ${JSON.stringify({deaths,exits,x:g.p.x,y:g.p.y,spawn:g.room.spawn,ground:g.p.onGround})}`);
   let pristinePuzzle=null;if(['bank-f31','bank-f32'].includes(td.bankOrigin)){pristinePuzzle={phase:g.phase,lit:g.ents.filter(e=>e.type==='stone'&&e.lit).length,openGates:g.ents.filter(e=>e.type==='gate'&&e.open).length};assert.deepEqual(pristinePuzzle,{phase:0,lit:0,openGates:0},`${td.id}: approach pre-solves the phase/tally puzzle`);}
   seams.push({world:w.n,...proof,pristinePuzzle,sourceExitFrame:r.exit.i+1,frames:expand(proof.toFire).length,entryDelta:delta,atFire:true});
  }
 }
 // The atlas has its own registry in the browser. Reload CL after the authoring tools' disabled registry.
 globalThis.BLADEFALL_CLIMB=true;
 for(const name of ['climb','climb-atlas','climb-passages','climb-worlds','climb-geography','climb-geography-build']){const path=require.resolve(`../../public/bladefall-${name}.js`);delete require.cache[path];require(path);}
 globalThis.BladefallClimbGeographyBuild.install();const runtime=globalThis.BladefallClimb;
 let atlasSharedWalls=0;const terminalArrivals=[];
 for(const w of runtime.worlds){const raw=worlds.find(x=>x.n===w.n),after=new Map(sections(w).map(s=>[s.room,s]));let shift=null;
  // Atlas positioning may translate a whole region, never re-space its road or branches.
  for(const before of sections(raw)){const current=after.get(before.room);assert(current,`${before.room}: atlas lost a physical section`);const delta=[current.x-before.x,current.y-before.y];if(!shift)shift=delta;else assert.deepEqual(delta,shift,`${before.room}: atlas changed a proved seam offset`);const zone=runtime.geography.cameraZones.get(`${w.n}-world`),d=w.rooms.find(d=>d.id===current.room);assert(d.cameraZone===zone.id&&current.x>=zone.x&&current.y>=zone.y&&current.x+(d.cols||40)<=zone.x+zone.w&&current.y+(d.rows||23)<=zone.y+zone.h,`${current.room}: outside continuous camera region`);}
  atlasSharedWalls+=noOverlap(w,raw);
  // Use the last challenge's actual exit state, then mirror the live view's
  // continuous atlas carry (including its small vertical landing adjustment).
  const sourceDef=w.rooms.find(d=>d.id===w.atlasEnd),from=after.get(w.atlasEnd),to=w.sections.at(-1),targetDef=w.rooms.find(d=>d.id===to.room);
  assert(targetDef.atlasJunction,`W${w.n}: missing departure junction`);
  const run=routeSnapshots.get(sourceDef.id)||exitRoute(sourceDef,w.tapes[sourceDef.id]);
  assert(run.exit&&!run.exit.side&&!run.deaths,`${sourceDef.id}: final completion state`);
  const g=liveFlags(Core.createGame([targetDef],{room:0}));g.walkSeams=(targetDef.atlasSockets||[]).filter(s=>!s.preview&&!s.link);
  runtime.carry(Core,g,run.snap,{x:from.x*8,y:from.y*8},{x:to.x*8,y:to.y*8},true);
  if(targetDef.entry==='down')g.p.y=Math.min(g.p.y,g.room.h-19);
  if(targetDef.entry==='up'&&g.p.y<0)g.p.y=0;
  const delta=Math.hypot(g.p.x+to.x*8-run.snap.x-from.x*8,g.p.y+to.y*8-run.snap.y-from.y*8),blocked=!!Core.solidAt(g,g.p.x,g.p.y,g.p.w,g.p.h);
  assert(delta<=12.001&&!blocked,`${sourceDef.id} → ${targetDef.id}: unsafe atlas arrival ${JSON.stringify({delta,blocked,x:g.p.x,y:g.p.y})}`);
  let deaths=0;for(let i=0;i<60;i++){Core.step(g,keysToInput(''));deaths+=g.events.filter(e=>e.type==='death').length;g.events.length=0;}
  assert.equal(deaths,0,`${sourceDef.id}: atlas arrival falls into danger`);
  terminalArrivals.push({world:w.n,from:sourceDef.id,to:targetDef.id,entryDelta:delta,collisionFree:true,settlingFrames:60,deaths});
  for(const section of w.passages||[]){const d=w.rooms.find(d=>d.id===section.room),hits=runtime.geography.query({x:section.x,y:section.y,w:d.cols,h:d.rows});assert.deepEqual(hits.map(x=>x.id),[d.id],`${d.id}: folded interworld passage overlaps authored terrain`);}
 }

 for(const w of runtime.worlds)for(const d of w.rooms.filter(r=>r.campaignImport))assert.deepEqual(closedDef(d).map,originals.get(d.bankOrigin).room.map,`${d.id}: atlas cut the closed bank puzzle`);
 for(const w of runtime.worlds){const A=globalThis.BladefallClimbAtlas.create(runtime.worlds,{}),B=globalThis.BladefallClimbAtlas.create(runtime.worlds,{});assert(!A.complete(w.n));A.solve(w.atlasEnd);assert(!A.complete(w.n),'last room alone cannot clear world');for(const id of w.requiredMainRooms)B.solve(id);B.solve(w.atlasEnd);assert(B.complete(w.n));assert(!A.complete(w.n),'another player cannot finish your world');for(const id of w.requiredMainRooms.slice(1))A.solve(id);assert(!A.complete(w.n),'one missed personal challenge blocks completion');A.solve(w.requiredMainRooms[0]);assert(A.complete(w.n));
  for(const [id,to]of Object.entries(w.retiredRooms)){const migrated=globalThis.BladefallClimbAtlas.create(runtime.worlds,{version:1,checkpoint:{world:w.n,room:id},solved:{}});assert.equal(migrated.state.checkpoint.room,to,`${id}: old save migration`);}
 }
 const report={version:'7.306.0',worlds:worlds.length,imports:imports.length,ordinary:87,superrooms:Object.keys(FINALES).length,retirements:retired.length,mainChallenges:worlds.reduce((n,w)=>n+w.requiredMainRooms.length,0),closedEntranceRoutes:routes.length,physicalSeams:seams.length,checkpointTeleports:0,nativeDefinitionsPreserved:native,existingRuntimeRetimings:Object.keys(nativeTapeOverrides),dialogueRecordsPreserved:dialogues,translatedBranches:branches,sharedSolidWalls:sharedWalls,atlasSharedSolidWalls:atlasSharedWalls,atlasTranslationsPreserveAllSeams:true,inheritedAtlasSharedMouth,ownCompletionGuard:true,retiredCheckpointMigration:true,geographySections:runtime.geography.rooms.size,terminalArrivals,routes,seams};
 if(process.argv.includes('--write'))writeFileSync('docs/room-bank/campaign-integration-7.306-audit.json',JSON.stringify(report,null,2)+'\n');console.log('PASS',JSON.stringify({...report,routes:undefined,seams:undefined,terminalArrivals:terminalArrivals.length}));return report;
}
if(process.argv[1]===fileURLToPath(import.meta.url))audit();
