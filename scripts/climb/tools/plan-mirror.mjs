// node plan-mirror.mjs N ... : which road rooms to lay reflected so each is met from its fire's side (only reflections that play)
import {Core,RBR,expand,keysToInput} from '../../rbr-lib.mjs';
import {mirrorRoom,mirrorTape} from '../../rbr-src/mirror-lib.mjs';
import {WORLDS} from '../spec.mjs';
function run(def,tape,extra=30){const g=Core.createGame([def],{room:0});const f=expand(tape);let out=null,deaths=0;
 for(let i=0;i<f.length+extra;i++){Core.step(g,keysToInput(f[i]||''));for(const e of g.events){if(e.type==='death')deaths++;if(e.type==='exit'&&!out)out=e;}g.events.length=0;if(out)break;}return {exited:!!out,side:!!(out&&out.side),deaths};}
const plays=(reg,d,id)=>{const m=mirrorRoom(d);const t=mirrorTape(reg.tapes[id]);const a=run(m,t),late=run(m,[[14,''],...t]),idle=run(m,[[60,'']],0);let side=true;if(m.side&&reg.tapes[id+'#side']){const s=run(m,mirrorTape(reg.tapes[id+'#side']));side=s.exited&&s.side&&!s.deaths;}return a.exited&&!a.side&&!a.deaths&&late.exited&&!late.deaths&&!idle.deaths&&side;};
const fire=d=>{let pc;d.map.forEach(r=>{if(r.includes('P'))pc=r.indexOf('P')});return pc<20?'L':'R';},ex=d=>(d.exit||'right')[0].toUpperCase();
for(const N of process.argv.slice(2).map(Number)){const w=WORLDS.find(x=>x.n===N),reg=RBR.region(N),mir=[],left=[];let prev=null;
 for(const id of w.order){const d=reg.rooms.find(r=>r.id===id);let use=d;
  const need=prev==='R'?'L':prev==='L'?'R':null;
  if(need&&fire(d)!==need){if(plays(reg,d,id)){use=mirrorRoom(d);mir.push(id);}else left.push(id);}
  prev=ex(use);}
 console.log(N,'mirror:',JSON.stringify(mir),left.length?'still mismatched (reflection does not play): '+left.join(','):'');}
