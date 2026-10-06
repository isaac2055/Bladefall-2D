// Precision Core lab (7.280): every lab room finishes on its tape with no deaths (also started 14 frames late),
// standing at the spawn is safe, the route actually uses the room's device, and each device's rule bites
// (a short tape that breaks the rule dies). Run through the lab preload:
//   node --import ./scripts/pcore-lab/register.mjs scripts/pcore-lab/check.mjs
import {Rooms,sideRun} from '../rbr-lib.mjs';
let fail=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)fail++;};
const uses={'lab-zip-1':['zip-in','zip-out'],'lab-zip-2':['zip-in','zip-out'],'lab-fault-1':['fault-crack','fault-fall'],'lab-shade-1':['shade-wake'],'lab-mirror-1':['mirror']};
for(const id of Object.keys(uses)){
 const t=Rooms.tapes[id];if(!t){ok(false,id+': has a lab tape');continue;}
 const r=sideRun(id,t),late=sideRun(id,[[14,''],...t]),idle=sideRun(id,[[90,'']],0);
 ok(r.exited&&r.deaths===0,`${id}: finishes on its tape, ${r.deaths} deaths, frame ${r.frame}`);
 ok(late.exited&&late.deaths===0,`${id}: still finishes started 14 frames late`);
 ok(idle.deaths===0,`${id}: standing at the spawn for 1.5 s is safe`);
 const ev=new Set(r.events.map(e=>e.type));
 ok(uses[id].every(u=>ev.has(u)),`${id}: the route uses the device (${uses[id].join(', ')})`);
 ok(!['super','hyper','ultra','wallbounce'].some(u=>ev.has(u)),`${id}: no momentum tech on the route`);
}
// The rules bite.
const dies=(id,t,cause)=>{const r=sideRun(id,t,0);return r.events.some(e=>e.type==='death'&&(!cause||e.cause===cause));};
ok(dies('lab-shade-1',[[40,'r'],[50,'l']],'shade'),'shade: walking out and back the way you came meets your shade');
ok(dies('lab-shade-1',[[4,'r'],[80,'']],'shade'),'shade: standing still longer than the delay is fatal');
ok(dies('lab-fault-1',[[24,'r'],[60,'']]),'fault: stopping on a fault strip drops you (into the thorns)');
{const r=sideRun('lab-zip-1',[[20,'r'],[40,'r']],0);ok(r.deaths>0,'zip: without the tear the first gap is fatal (walking off)');}
{const r=sideRun('lab-mirror-1',[[20,'r'],[12,'rj'],[5,'rx'],[40,'r']],0);ok(r.events.some(e=>e.type==='mirror'&&e.on)&&r.deaths>0,'mirror: through the glass, holding right runs you back into the pit');}
{const r=sideRun('lab-mirror-1',[[40,'r']],0);ok(r.g.p.x<14*8-7&&r.deaths===0,'mirror: walking into the glass stops you at it');}
console.log(fail?`${fail} failed`:'all passed');process.exit(fail?1:0);
