import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';
import {runRoom} from '../pcore-tape.mjs';
const root=path.resolve(import.meta.dirname,'../..'),here=path.join(root,'scripts/room-bank');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const collect=base=>['base','fractured'].flatMap(side=>fs.readdirSync(path.join(base,side)).filter(f=>f.endsWith('.json')).map(f=>({path:path.join(base,side,f),x:read(path.join(base,side,f))})));
const old=collect(path.join(here,'archive/before-run56-feedback')),now=collect(here),byId=new Map(now.map(x=>[x.x.room.id,x]));
const cuts=new Set(['bank-b47','bank-f53','bank-f54']),revisions=new Set(['bank-b46','bank-b48','bank-b49','bank-b50','bank-b52','bank-b53','bank-f47','bank-f51','bank-f52']),metadata=new Set(['bank-b51','bank-f48','bank-f49','bank-f50']);
assert.equal(old.length,86);assert.equal(now.length,83);let untouched=0,probes=0;
for(const {path:file,x:o} of old){const id=o.room.id,n=byId.get(id);
 if(cuts.has(id)){assert.equal(n,undefined,id+' cut from active pool');continue;}assert.ok(n,id+' retained');const x=n.x;
 assert.equal(x.bank.run,o.bank.run,id+' original run');
 if(revisions.has(id)){assert.equal(x.bank.status,'route-proven');assert.equal(x.bank.acceptance,id==='bank-b48'?'banked':'revised');assert.equal(x.bank.batch,13);
  for(const probe of x.bank.review?.reportedBypasses||[]){const a=runRoom([o.room],0,probe.tape,{maxExtra:30}),b=runRoom([x.room],0,probe.tape,{maxExtra:30});assert.equal(a.exited,true,id+' original reported bypass '+probe.name);assert.equal(a.deaths,0,id+' original bypass survives');assert.equal(b.exited,false,id+' revised blocks reported bypass '+probe.name);probes++;}
 }else{assert.deepEqual(x.room,o.room,id+' unchanged geometry/rules');assert.deepEqual(x.tape,o.tape,id+' unchanged route');if(!metadata.has(id)){assert.equal(fs.readFileSync(n.path,'utf8'),fs.readFileSync(file,'utf8'),id+' completely unchanged');untouched++;}}
 if(o.bank.acceptance==='banked')assert.equal(x.bank.acceptance,'banked',id+' existing approval');
}
assert.equal(untouched,70);assert.ok(probes>=11,'actual reported shortcut comparisons saved');
for(const [id,count]of Object.entries({'bank-b46':1,'bank-b48':2,'bank-b49':1,'bank-b52':1,'bank-b53':2,'bank-f47':2,'bank-f51':1,'bank-f52':2}))assert.ok((byId.get(id).x.bank.review?.reportedBypasses?.length||0)>=count,id+' actual shortcut evidence retained');
const get=id=>byId.get(id).x;
for(const id of ['bank-b48','bank-b51','bank-f49','bank-f50'])assert.equal(get(id).bank.acceptance,'banked');
assert.equal(get('bank-b51').bank.side,'fractured');assert.equal(get('bank-b51').bank.reclassifiedFrom,'base');assert.equal(get('bank-f50').bank.side,'fractured');assert.equal(get('bank-f48').bank.acceptance,'candidate');
assert.deepEqual(Object.fromEntries(['base','fractured'].map(s=>[s,now.filter(r=>r.x.bank.side===s&&r.x.bank.acceptance==='banked').length])),{base:27,fractured:23});
assert.ok(now.filter(r=>r.x.bank.collection==='superrooms').every(r=>r.x.bank.acceptance==='candidate'));assert.equal(now.filter(r=>r.x.bank.collection==='superrooms').length,4);
const baseline=read(path.join(root,'docs/room-bank/run56-feedback-baseline.json')).sha256,allowed=new Set(['public/index.html','public/precision.html','public/sw.js','public/bladefall-room-bank.js','public/bladefall-room-bank-view.js','public/bladefall-pcore-dev-watch-view.js','public/bladefall-pcore-dev-water-view.js']);let preserved=0;
for(const [f,h]of Object.entries(baseline))if(f.startsWith('scripts/room-bank/')){const archived=f.replace('scripts/room-bank/','scripts/room-bank/archive/before-run56-feedback/');assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root,archived))).digest('hex'),h,f+' exact archived original');}
for(const [f,h]of Object.entries(baseline))if((f.startsWith('public/')&&!allowed.has(f))||f.startsWith('docs/design/')||f.startsWith('LLM-HANDOFF/locks/')){assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex'),h,f+' outside scope preserved');preserved++;}
assert.ok(get('bank-b53').room.tideGauge);assert.ok(now.filter(r=>r.x.room.tideGauge).every(r=>r.x.room.id==='bank-b53'));
assert.ok(get('bank-b52').room.watchClarity);assert.ok(now.filter(r=>r.x.room.watchClarity).every(r=>r.x.room.id==='bank-b52'));
console.log(`PASS:3 cuts,4 approvals,9 revisions,70 untouched sources;${probes} original-success/revision-failure shortcut comparisons;${preserved} unrelated runtime/report/lock files preserved.`);
