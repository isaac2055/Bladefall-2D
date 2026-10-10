// Reproducible 7.307 campaign integration. Bank puzzles restore their reviewed
// maps at their fires; every new approach is a proved, physically joined road.
import {readFileSync, writeFileSync, renameSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve, dirname} from 'node:path';
import assert from 'node:assert/strict';
import {records} from '../room-bank/register.mjs';
import {continuousBank,FINALES,REPLACE_BOSS} from './continuous-bank.mjs';
// Release placements live outside the unchanged geometry compiler, preserving its cache fingerprint.
Object.assign(FINALES,{10:'bank-b72',13:'bank-b73',14:'bank-b74',16:'bank-b75',17:'bank-b76',31:'bank-f73',33:'bank-f74',34:'bank-f75',36:'bank-f76',39:'bank-f77'});
Object.assign(REPLACE_BOSS,{13:'cl13-v13-crown',14:'cl14-k14-last',16:'cl16-t16-storm',31:'cl31-ff31-pour',33:'cl33-fv33-crown',34:'cl34-fk34-last',36:'cl36-ft36-storm'});
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const plan=JSON.parse(readFileSync(resolve(root,'docs/room-bank/world-placement-7.303.json'),'utf8'));
const byBank=new Map(records.map(r=>[r.room.id,r]));
export const CUTS=[
 'cl2-w2-tunnel','cl2-w2-called','cl3-c3-drop','cl4-u4-flue','cl6-k6-hearth',
 'cl7-g7-crown','cl7-g7-bellows','cl10-e10-foot','cl11-f11-line',
 'cl12-i12-line','cl12-i12-threshold','cl13-v13-crossing','cl14-k14-hall','cl15-d15-west',
 'cl17-s17-road','cl18-c18-road','cl19-p19-line','cl19-p19-road',
 'cl21-fo21-torn','cl22-fw22-tower','cl23-fc23-well','cl23-fc23-rise','cl24-fu24-catcher',
 'cl25-fm25-shaft','cl26-fk26-quarter','cl27-fg27-bellows','cl28-ff28-engine','cl29-fs29-glazed',
 'cl30-fe30-cooling','cl31-ff31-hot','cl32-fi32-lock','cl33-fv33-thrown','cl34-fk34-climb',
 'cl35-fd35-shadeline','cl36-ft36-staple','cl37-fs37-tern','cl38-fc38-shade','cl39-fp39-panes',
 'cl40-fs40-hours'
];
// Forty world-appropriate finales: native bosses replace their final encounter;
// traversal finales follow the original road. Individual checkpoints remain.
export const SUPERS=FINALES;
export const BOSS_START={3:'cl3-c3-brace',5:'cl5-m5-court',7:'cl7-g7-mouth',9:'cl9-s9-white',11:'cl11-f11-pit',13:'cl13-v13-low',14:'cl14-k14-throne',16:'cl16-t16-bite',20:'cl20-s20-dawn',21:'cl21-fo21-hammer',22:'cl22-fw22-oath1',23:'cl23-fc23-west',25:'cl25-fm25-court',27:'cl27-fg27-mouth',29:'cl29-fs29-white',31:'cl31-ff31-pit',33:'cl33-fv33-low',34:'cl34-fk34-throne',36:'cl36-ft36-bite',40:'cl40-fs40-dawn'};
const copy=x=>JSON.parse(JSON.stringify(x));
const spawn=d=>{for(let r=0;r<d.map.length;r++){const c=d.map[r].indexOf('P');if(c>=0)return {c,r};}throw Error('Missing spawn: '+d.id);};
const isChallenge=d=>!d.connector&&!d.passage&&!d.atlasJunction&&!d.atlasGate&&!d.atlasTransit;
export function integrateCampaignWorld(source){
 if(source.bankIntegration?.version==='7.307.0')return source;
 const w=copy(source),assignment=plan.worlds.find(x=>x.world===w.n);assert(assignment,'Missing world assignment '+w.n);
 // Match the existing live atlas demonstration before proving its outgoing seam.
 if(w.n===4)w.tapes['cl4-u4-crown']=[[20,'ru'],[5,'rx'],[20,'ru'],[5,'ux'],[55,'ru'],[10,'l'],[1,'ds'],[100,'ru']];
 const allIds=new Set(w.rooms.map(d=>d.id)),originalMain=w.sections.map(s=>s.room),cuts=CUTS.filter(id=>allIds.has(id));
 const candidates=new Map(assignment.replacementCandidates.map(x=>[x.id,x]));
 const protectedLinks=new Set([...w.quests,...(w.secrets||[])].flatMap(q=>[q.from,q.host,q.returnTo]).filter(Boolean));
 w.retiredRooms={};w.retiredRoomDetails=[];
 for(const id of cuts){
  const d=w.rooms.find(r=>r.id===id),candidate=candidates.get(id);assert(candidate,'Cut not documented: '+id);
  assert(!assignment.protectedCurrentRooms.includes(id),'Protected lesson: '+id);
  assert(!protectedLinks.has(id)&&!d.doors?.length&&!d.returns?.length&&!d.bearing&&!d.sideQuest,'Attached branch: '+id);
  const at=originalMain.indexOf(id),survivor=originalMain.slice(at+1).find(x=>!cuts.includes(x))||originalMain.slice(0,at).reverse().find(x=>!cuts.includes(x));
  assert(survivor,'No checkpoint migration: '+id);w.retiredRooms[id]=survivor;
  const receiver=w.rooms.find(r=>r.id===survivor),fire=spawn(receiver);
  if(d.people?.length)receiver.people=[...(receiver.people||[]),...d.people.map((p,i)=>({...p,c:Math.min((receiver.cols||40)-3,fire.c+3+i*2),r:fire.r}))];
  w.retiredRoomDetails.push({id,name:d.name,to:survivor,grade:candidate.grade,evidence:candidate.evidence,dialogueMoved:(d.people||[]).map(p=>p.who||p.name)});
 }
 w.sections=w.sections.filter(s=>!cuts.includes(s.room));w.rooms=w.rooms.filter(d=>!cuts.includes(d.id));
 for(const id of cuts)for(const key of Object.keys(w.tapes))if(key===id||key.startsWith(id+'#'))delete w.tapes[key];
 const additions=[...assignment.rooms.map(x=>x.id),...(SUPERS[w.n]&&byBank.has(SUPERS[w.n])?[SUPERS[w.n]]:[])];
 const sections=[];
 for(const sourceId of additions){
  const record=byBank.get(sourceId);assert(record,'Missing bank record: '+sourceId);assert(record.bank.acceptance==='banked'||SUPERS[w.n]===sourceId,'Not approved: '+sourceId);
  const id=`cl${w.n}-${sourceId}`,room={...copy(record.room),id,origin:sourceId,bankOrigin:sourceId,rbr:w.n,
   bank:{id:sourceId,side:record.bank.side,format:SUPERS[w.n]===sourceId?'superroom':record.bank.format||'room',collection:record.bank.collection||'',acceptance:'banked'},
   campaignImport:{version:'7.307.0',source:sourceId,superroom:SUPERS[w.n]===sourceId}};
  w.rooms.push(room);w.tapes[id]=copy(record.tape);
  const fire=spawn(room);sections.push({room:id,x:0,y:0,fire});
 }
 const before=BOSS_START[w.n];
 w.checkpointLinks=[];
 w.requiredBankRooms=sections.map(s=>s.room);
 w.requiredMainRooms=w.sections.filter(s=>isChallenge(w.rooms.find(d=>d.id===s.room))).map(s=>s.room);
 w.bankIntegration={version:'7.307.0',ordinary:assignment.rooms.map(r=>`cl${w.n}-${r.id}`),superroom:SUPERS[w.n]?`cl${w.n}-${SUPERS[w.n]}`:null,beforeBoss:before||null,sourceMainCount:originalMain.filter(id=>isChallenge(source.rooms.find(d=>d.id===id))).length};
 w.blurb=`${w.name}: ${w.requiredMainRooms.length} checkpointed challenges${SUPERS[w.n]?', ending in a superroom':before?', leading into its original boss finale':''}.`;
 const integrated=continuousBank(source,w,{ordinary:assignment.rooms.map(r=>`cl${w.n}-${r.id}`),superroom:SUPERS[w.n]&&byBank.has(SUPERS[w.n])?`cl${w.n}-${SUPERS[w.n]}`:null,cuts});
 integrated.bankIntegration.version='7.307.0';return integrated;
}
export function integrateCampaign(worlds){return worlds.map(integrateCampaignWorld);}
export function serializeWorlds(worlds){return `/* Survive campaign 7.307: generated by scripts/climb/import-bank.mjs.\n   Native branch clusters stay together; bank rooms join the road through visible passages.\n   Checkpoint entrance seals restore each bank puzzle before its challenge begins. */\n(function(root){'use strict';const CL=root.BladefallClimb;if(!CL)return;\n${worlds.map(w=>`CL.addWorld(${JSON.stringify(w)});`).join('\n')}\n})(typeof window!=='undefined'?window:globalThis);\n`;}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const baseline=JSON.parse(readFileSync(resolve(root,'scripts/climb/source-worlds-7.303.json'),'utf8'));
 const only=process.argv.includes('--only')?+process.argv[process.argv.indexOf('--only')+1]:0;
 const dest=resolve(root,'public/bladefall-climb-worlds.js'),update=+(process.argv.find(x=>x.startsWith('--update='))?.split('=')[1]||0);
 let worlds;
 if(update){
  assert(!only&&baseline.some(w=>w.n===update),'Choose one existing world for --update');
  const current=[];const {runInNewContext}=await import('node:vm');runInNewContext(readFileSync(dest,'utf8'),{BladefallClimb:{addWorld:w=>current.push(w)}});
  assert(current.length===40&&current.every(w=>['7.306.0','7.307.0'].includes(w.bankIntegration?.version)),'Incremental updates require a complete current registry');
  worlds=current.map(w=>w.n===update?integrateCampaignWorld(baseline.find(x=>x.n===update)):w);
  // Metadata-only upgrade leaves the other 39 physical layouts and their proofs intact.
  for(const w of worlds){w.bankIntegration.version='7.307.0';for(const d of w.rooms)if(d.campaignImport)d.campaignImport.version='7.307.0';}
 }else worlds=integrateCampaign(only?baseline.filter(w=>w.n===only):baseline);
 if(update&&!process.argv.includes('--check')){
  // Another world's geometry search may have finished while this one ran.
  const done=worlds.find(w=>w.n===update),latest=[];const {runInNewContext}=await import('node:vm');runInNewContext(readFileSync(dest,'utf8'),{BladefallClimb:{addWorld:w=>latest.push(w)}});worlds=latest.map(w=>w.n===update?done:w);for(const w of worlds){w.bankIntegration.version='7.307.0';for(const d of w.rooms)if(d.campaignImport)d.campaignImport.version='7.307.0';}
 }
 const output=serializeWorlds(worlds);
 if(process.argv.includes('--check'))assert.equal(readFileSync(dest,'utf8'),output,'Rebuild campaign import');else if(!only){const temp=dest+'.'+process.pid+'.tmp';writeFileSync(temp,output);renameSync(temp,dest);}
 const manifest={version:'7.307.0',source:'source-worlds-7.303.json',worlds:worlds.map(w=>({world:w.n,name:w.name,ordinary:w.bankIntegration.ordinary,superroom:w.bankIntegration.superroom,beforeBoss:w.bankIntegration.beforeBoss,cut:w.retiredRoomDetails,geography:w.bankIntegration.geography,continuousSeams:w.continuousSeams,checkpointLinks:w.checkpointLinks,requiredMainRooms:w.requiredMainRooms,requiredBankRooms:w.requiredBankRooms})),totals:{worlds:worlds.length,cuts:worlds.reduce((n,w)=>n+w.retiredRoomDetails.length,0),ordinary:worlds.reduce((n,w)=>n+w.bankIntegration.ordinary.length,0),superrooms:worlds.filter(w=>w.bankIntegration.superroom).length,challenges:worlds.reduce((n,w)=>n+w.requiredMainRooms.length,0)}};
 if(!only&&!process.argv.includes('--check'))writeFileSync(resolve(root,'docs/room-bank/campaign-integration-7.307.json'),JSON.stringify(manifest,null,2)+'\n');
 console.log(JSON.stringify(manifest.totals));
}
