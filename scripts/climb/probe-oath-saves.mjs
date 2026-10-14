import {readFileSync} from 'node:fs';import {runRoom} from '../pcore-tape.mjs';
const src=JSON.parse(readFileSync('scripts/room-bank/fractured/97-bank-f97.json'));
const whole=runRoom([src.room],0,src.tape,{trace:true});
const arrivals=whole.events.filter(e=>e.type==='core-checkpoint').map(e=>e.i);let begin=0;
for(let seg=0;seg<4;seg++){
 const end=arrivals[seg],mid=(begin+end)/2,candidates=whole.log.filter(t=>t.i>begin+40&&t.i<end-40&&t.vy>=0).sort((a,b)=>Math.abs(a.i-mid)-Math.abs(b.i-mid)),seen=new Set();let count=0;
 for(const t of candidates){let c=Math.floor((t.x+4)/8),r=Math.ceil((t.y+11)/8);if(seen.has(c+','+r))continue;seen.add(c+','+r);const room=structuredClone(src.room),map=room.map.map(r=>r.split(''));if(!map[r]||![c-1,c,c+1].every(c=>map[r][c]==='.'))continue;
 for(let a=c-1;a<=c+1;a++)map[r][a]='~';room.map=map.map(r=>r.join(''));room.coreCheckpoints.splice(seg,0,{c,r:r-1,width:24,resetClocks:false,name:'Probe',facing:seg===2?-1:1});const trial=runRoom([room],0,src.tape,{trace:true});const hit=trial.events.find(e=>e.type==='core-checkpoint'&&e.name==='Probe');
 if(trial.exited&&!trial.deaths&&hit){console.log(JSON.stringify({seg,c,r,t:t.i,hit:hit.i,mid}));if(++count>=5)break;}
 }
 begin=end;
}
