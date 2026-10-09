// Historical author-route evidence: this is not a measure of required tech or player difficulty.
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const originals=['base','fractured'].flatMap(side=>fs.readdirSync(path.join(root,'scripts/room-bank/archive/before-run56-feedback',side)).filter(f=>f.endsWith('.json')).map(f=>read('scripts/room-bank/archive/before-run56-feedback/'+side+'/'+f)));
const routes=new Map(read('docs/room-bank/run56-before-routes.json').rooms.map(r=>[r.id,r]));
const families={dashLaunch:['super','hyper','ultra','reverse-super','reverse-hyper'],wallbounce:['wallbounce','late-wallbounce'],controlledPogo:['pogo-low','pogo-loft'],cargoDashCatch:['cargo-dash-catch'],parry:['parry'],movingHook:['moving-hook'],anyHook:['hook','moving-hook'],portal:['portal-pass']};
const rooms=originals.filter(x=>[5,6].includes(x.bank.run)).sort((a,b)=>a.room.id.localeCompare(b.room.id)).map(x=>({id:x.room.id,run:x.bank.run,side:x.bank.side,format:x.bank.format,movement:x.room.movement||'default',events:routes.get(x.room.id).events,hasPathSweepers:!!x.room.sweepers?.length,tags:x.bank.tags}));
const sets=[5,6,'both'].map(run=>{const set=rooms.filter(x=>run==='both'||x.run===run);return {run,rooms:set.length,families:Object.fromEntries(Object.entries(families).map(([k,ev])=>[k,set.filter(x=>ev.some(e=>x.events[e]>0)).map(x=>x.id)])),pathSweepers:set.filter(x=>x.hasPathSweepers).map(x=>x.id)};});
const result={scope:'The 16 delivered Run5/Run6 author routes before the 9 October feedback. Presence shows use in that tape, not necessity; absence does not prove the engine lacks a move. Wavedashes log hyper/ultra, not a distinct wavedash event.',sets,rooms};
fs.writeFileSync(path.join(root,'docs/design/ROOM-MOVEMENT-AUDIT-2026-10-09.json'),JSON.stringify(result,null,2)+'\n');
for(const s of sets)console.log(JSON.stringify({run:s.run,rooms:s.rooms,counts:Object.fromEntries(Object.entries(s.families).map(([k,v])=>[k,v.length])),pathSweepers:s.pathSweepers.length}));
