import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {runRoom} from '../rbr-lib.mjs';
const file=new URL('./base/bank-b63.json',import.meta.url),rec=JSON.parse(readFileSync(file));
if(process.argv.includes('--apply-fix')){
 // The future arm covers these upward points with a safe bridge floor after the lower-loop turn.
 // Before that turn the divider cannot provide a second takeoff toward the hub.
 rec.room.map[20]=rec.room.map[20].slice(0,34)+'^'.repeat(14)+rec.room.map[20].slice(48);
 rec.room.hingeArms[0].c=48;rec.room.hingeArms[0].length=15;
 rec.room.windVanes[0].states.left[0].c=49;rec.room.windVanes[0].states.left[0].w=7;
}
const prefix=rec.tape.slice(0,8);
const newSkips=[
 {name:'Jump from the first plate onto the divider, then dash directly to the vane',tape:[...prefix,[30,'rj'],[20,''],[20,'rj'],[12,'rx'],[70,'lgu'],[1,'ds'],[25,''],[80,'l'],[1,'g'],[105,'r'],[210,''],[300,'l']]},
 {name:'Jump and dash directly from the first shelf across the uncapped thorn bed',tape:[...prefix,[6,'r'],[18,'rj'],[12,'rx'],[80,'rgu'],[1,'ds'],[25,''],[80,'l'],[1,'g'],[105,'r'],[210,''],[300,'l']]}
];
const shortcuts=[...(rec.bank.shortcutChecks||[]).filter(c=>!newSkips.some(n=>n.name===c.name)),...newSkips];
for(const [group,cases]of [['canonical',[{name:'canonical',tape:rec.tape}]],['positive',rec.bank.positiveChecks||[]],['shortcut',shortcuts]])for(const c of cases){
 const r=runRoom([rec.room],0,c.tape,{trace:true,maxExtra:0});assert.equal(r.exited,group!=='shortcut',c.name);
 if(group!=='shortcut'){assert.equal(r.deaths,0,c.name);for(const e of rec.bank.requiredEvents)assert(r.events.some(q=>q.type===e),c.name+' missing '+e);}
 Object.assign(c,{exited:r.exited,deaths:r.deaths,frames:r.exited?r.log.length:null});
 if(group==='canonical'){rec.bank.route={exited:true,deaths:r.deaths,frames:r.log.length};rec.bank.routeEvents=r.events.filter(e=>rec.bank.requiredEvents.includes(e.type)).map(({i,...e})=>e);}
 console.log(group,c.name,r.exited?'exit':'blocked',r.deaths+' deaths',r.log.length+' frames');
}
if(process.argv.includes('--save')){rec.bank.shortcutChecks=shortcuts;rec.bank.status='route-proven';rec.bank.priorDraft={file:'scripts/room-bank/archive/b63-before-shortcut-fix-7.305.json',note:'Complete original proven geometry and tapes before the lower-loop shortcut repair.'};rec.bank.endingForgiveness='The original canonical and both positive tapes still complete without deaths. The longer arm covers the divider thorns when it becomes the return bridge. The upper shaft opens into a wide sheltered gallery; a missed landing falls into the same draft and can be retried without losing the lantern.';writeFileSync(file,JSON.stringify(rec,null,2)+'\n');}
