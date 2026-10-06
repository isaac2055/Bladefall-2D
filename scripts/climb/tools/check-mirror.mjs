// node check-mirror.mjs N id ... : do these rooms' reflections play (route, late start, idle spawn, side)?
import {Core,RBR,expand,keysToInput} from '../../rbr-lib.mjs';
import {mirrorRoom,mirrorTape} from '../../rbr-src/mirror-lib.mjs';
const [N,...ids]=process.argv.slice(2);const reg=RBR.region(+N);
function run(def,tape,extra=30){const g=Core.createGame([def],{room:0});const f=expand(tape);let out=null,deaths=0;
 for(let i=0;i<f.length+extra;i++){Core.step(g,keysToInput(f[i]||''));for(const e of g.events){if(e.type==='death')deaths++;if(e.type==='exit'&&!out)out=e;}g.events.length=0;if(out)break;}return {exited:!!out,side:!!(out&&out.side),deaths};}
const res={};
for(const id of ids){const d=[...reg.rooms,...reg.quests.flatMap(q=>q.rooms)].find(r=>r.id===id);const m=mirrorRoom(d);
 const keys=Object.keys(reg.tapes).filter(k=>k===id||k.startsWith(id+'#'));
 const tryT=(pre)=>{const T={};for(const k of keys)T[k]=pre?[[1,'l'],...mirrorTape(reg.tapes[k])]:mirrorTape(reg.tapes[k]);
  const a=run(m,T[id]),late=run(m,[[14,''],...T[id]]),idle=run(m,[[60,'']],0);let side=true;if(m.side&&T[id+'#side']){const s=run(m,T[id+'#side']);side=s.exited&&s.side&&!s.deaths;}
  return {ok:a.exited&&!a.side&&!a.deaths&&late.exited&&!late.deaths&&!idle.deaths&&side,T,why:JSON.stringify({a,late:late.deaths,idle:idle.deaths,side})};};
 let r=tryT(false);if(!r.ok){const r2=tryT(true);if(r2.ok)r={...r2,turned:true};}
 console.log(id,r.ok?'OK'+(r.turned?' (with a first-frame turn)':''):'FAILS '+r.why);if(r.ok)Object.assign(res,r.turned?r.T:{});}
if(Object.keys(res).length)console.log('TURNED_TAPES',JSON.stringify(res));
