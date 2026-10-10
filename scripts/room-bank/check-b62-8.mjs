import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {runRoom} from '../rbr-lib.mjs';
const file=new URL('./base/bank-b62.json',import.meta.url),rec=JSON.parse(readFileSync(file));
// Broad one-way arrival beneath the final pressure bed removes an unnecessary edge jump.
rec.room.map[6]=rec.room.map[6].slice(0,14)+'='.repeat(9)+rec.room.map[6].slice(23);
const approach=[[21,'r'],[1,'g'],[83,'r'],[1,'dg'],[80,'r'],[100,''],[65,'r'],[1,'g'],[32,'rj'],[12,''],[30,'rj'],[12,''],[30,'lj'],[12,''],[30,'rj'],[12,''],[30,'lj'],[12,''],[196,'l'],[12,''],[30,'j'],[12,''],[30,'lj'],[12,''],[30,'rj'],[12,''],[30,'rj'],[12,''],[30,'lj'],[12,'']];
const arrival=[[30,'j'],[12,'']],exit=[[28,'r'],[12,'rx'],[28,'r'],[12,'rx'],[28,'r'],[12,'rx'],[28,'r'],[12,'rx'],[140,'r']];
const cases=[
 {id:'canonical',label:'Carry, reclaim, return and park the shared weight',tape:[...approach,...arrival,[1,'dg'],[40,''],...exit],exited:true},
 {id:'late-delivery',label:'Wait 90 additional frames before setting down the final weight',tape:[...approach,...arrival,[90,''],[1,'dg'],[40,''],...exit],exited:true},
 {id:'other-end-of-plate',label:'Set the final weight 14 pixels farther along the pressure bed',tape:[...approach,...arrival,[8,'r'],[12,''],[1,'dg'],[40,''],...exit],exited:true},
 {id:'missed-upper-stair',label:'Walk off the penultimate stair, land below and recover with the same weight',tape:[...approach,[30,'r'],[24,''],[30,'lj'],[12,''],...arrival,[1,'dg'],[40,''],...exit],exited:true},
 {id:'body-as-final-weight',label:'Try to carry the weight away and use only the knight to open the final plate',tape:[...approach,...arrival,[250,'r']],exited:false}
];
const results=[];
for(const c of cases){const r=runRoom([rec.room],0,c.tape,{trace:true,maxExtra:0});assert.equal(r.exited,c.exited,c.id+' completion');assert.equal(r.deaths,0,c.id+' deaths');const events=r.events.map(e=>e.type);if(c.exited)for(const e of rec.bank.requiredEvents)assert(events.includes(e),c.id+' missing '+e);results.push({...c,deaths:r.deaths,frames:r.frames||r.log.length,final:{x:r.g.p.x,y:r.g.p.y},events:[...new Set(events)]});console.log(c.id,r.exited?'exit':'blocked',r.deaths+' deaths',r.log.length+' frames');}
if(process.argv.includes('--save')){rec.tape=cases[0].tape;rec.bank.status='route-proven';rec.bank.route={exited:true,deaths:0,frames:results[0].frames};rec.bank.positiveChecks=results.slice(1).filter(c=>c.exited).map(c=>({...c,name:c.label}));rec.bank.shortcutChecks=results.slice(1).filter(c=>!c.exited).map(c=>({...c,name:c.label}));delete rec.bank.checks;rec.bank.endingForgiveness='The six-tile pressure bed accepts both tested delivery positions and an additional 90-frame wait. A deliberate miss of the upper stair lands on the prior stair and recovers with the lantern. The final gallery has a stable floor and no timed closing once the weight is parked.';writeFileSync(file,JSON.stringify(rec,null,2)+'\n');}
