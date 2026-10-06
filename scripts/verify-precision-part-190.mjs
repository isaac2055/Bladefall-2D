// Part XX · Sunspire (levels 190–199, 7.254): routes and the wrong answers that fail.
//   node scripts/verify-precision-part-190.mjs            (ONLY=p193,p196 runs a subset while authoring)
// Light through portals (bladefall-pcore-dev-beam.js with the portals module). A beam that reaches an open
// end comes out of the other, turned; a tally stone the light falls on is lit; a lit stone opens the gate.
import {kit,X,range} from './pcore-verify-kit.mjs';
import {ACT} from './pcore-search.mjs';
const K=kit('XX');
const ONLY=process.env.ONLY?process.env.ONLY.split(','):null,on=id=>!ONLY||ONLY.includes(id);
const B=globalThis.BladefallPrecisionBeam;
console.log('Part XX: tempting wrong strategies fail');
if(!ONLY)K.routes();

// A state key that sees what the default one does not: where your end is, the machinery's phase, the
// glass, the louvre's beat, the lantern, the ring, foes and bolts.
const key=g=>{const p=g.p,b=g.portals&&g.portals.blue,l=g.ents.find(e=>e.type==='lantern');
 return [p.x>>1,p.y>>1,Math.round(p.vx/30),Math.round(p.vy/30),p.state,p.dashes,p.onGround?1:0,p.carrying?1:0,g.phase,
  b?b.c+','+b.r+b.face:'-',g.ents.map(e=>e.type==='mirror'?e.slant:e.type==='stone'?(e.lit?1:0):e.type==='shutter'?(e.open?'o':'s'):'').join(''),
  g.beams&&g.ents.some(e=>e.type==='shutter')?Math.floor(g.beams.clock/10):'',l?(l.x>>2)+','+(l.y>>2)+(l.held?'h':''):'',
  p.hook?Math.round(p.hook.len/4):'',g.foes?g.foes.map(f=>f.alive?1:0).join(''):'',g.bolts?g.bolts.map(o=>(o.x>>3)+','+(o.y>>3)).join(';'):''].join('|');};
const PQ=['r','l','u','d','ru','lu','rd','ld'].map(d=>[[1,d+'q'],[1,'']]);
const lit=r=>r.g.ents.some(e=>e.type==='stone'&&e.lit);
const litG=g=>g.ents.some(e=>e.type==='stone'&&e.lit);
const anyEv=(...ts)=>(g,e)=>e.some(x=>ts.includes(x.type)||ts.includes(x.type+':'+x.kind));

// 190 Sun Through Stone: the portal stone hangs at the height of the light. Fired straight at it from the
// floor, or from the top of a jump, the shot lands low and fizzles; the stone never lights.
if(on('p190')){
K.never('Sun Through Stone: fire straight at the wall from the floor or a jump','p190',
 X(range(0,120,6),[0,4,8,12,16]).map(([w,j])=>[[w,'r'],...(j?[[1,'j'],[j,'j']]:[]),[1,'lq'],[1,''],[300,'r']]));
}

// 191 Light It, Then Let Go: once the stone is lit the light stands across the road from roof to pit.
// Walking, jumping or dashing through it burns; nothing gets past while your end still holds the light.
if(on('p191')){
const lit191=[[14,'r'],[1,'luq'],[1,'']];
K.never('Light It, Then Let Go: walk, hop or dash through the column of light','p191',
 X(range(0,60,4),['walk','hop','dash']).map(([w,k])=>[...lit191,[w,''],...(k==='walk'?[]:k==='hop'?[[80,'r'],[1,'rj'],[14,'rj']]:[[90,'r'],[1,'rx']]),[300,'r']]));
K.hunt('Light It, Then Let Go: no way past the column without moving your end','p191',{start:lit191,key,beam:150,maxDepth:30});
}

// 192 Both Ends: the tempting shot is the pillar face you can see from the road; the light then pours
// along the floor at you. And the pocket end opened last, standing in the pocket, burns.
if(on('p192')){
const pillar=[[20,'r'],[8,''],[1,'ruq'],[1,'']];     // the first end, on the stone in the light's way
K.never('Both Ends: open the near face of the low pillar second','p192',
 range(0,120,4).map(w=>[...pillar,[w,'r'],[1,'rq'],[1,''],[300,'r']]),r=>lit(r));
K.never('Both Ends: stand in the pocket and open its end last','p192',
 range(0,60,3).map(w=>[...pillar,[140,'r'],[14,'rj'],[18,'r'],[20+w,''],[1,'lq'],[1,''],[200,'r']]),r=>lit(r));
}

// 193 Glass in the Dark: open your end while the glass leans the way it starts and the light comes back
// along the road; turning the glass then means walking into it.
if(on('p193')){
K.never('Glass in the Dark: open the light first, then go and turn the glass','p193',
 X(range(0,40,4),[0,1]).map(([w,j])=>[[18,'r'],[1,'luq'],[1,''],[w,''],...(j?[[1,'rj'],[20,'rj']]:[]),[70,'r'],[1,'rs'],[200,'r']]),r=>lit(r));
K.hunt('Glass in the Dark: the stone never lights while the glass is left alone','p193',
 {actions:[...ACT.basic,...PQ],reject:anyEv('mirror'),goal:litG,key,beam:120,maxDepth:25});
}

// 194 Lantern Post: the drop out of the room crosses the passage's light. Carried down the shaft and set
// down or thrown, the lantern shades only what lies past it; your own door alone lands you in the light.
if(on('p194')){
const got=[[20,'l'],[1,'g'],[2,'']];
K.never('Lantern Post: carry the lantern down the shaft and set it down or throw it','p194',
 X(range(0,30,3),['dg','lg','rg']).map(([w,k])=>[...got,[60,'r'],[w,''],[1,k],[40,''],[160,'l'],[40,'']]));
K.never('Lantern Post: drop through your own door without the lantern','p194',
 range(0,40,4).map(w=>[[56,'l'],[1,'ldq'],[1,''],[w,''],[12,'l'],[40,''],[40,'r'],[40,'']]));
K.hunt('Lantern Post: no way down without the lantern going through the door','p194',
 {actions:[...ACT.basic,...PQ,[[1,'g']],[[1,'lg']],[[1,'dg']]],key,reject:(g,e)=>e.some(x=>x.type==='portal-pass'&&(x.kind==='lantern'||g.p.carrying)),
  score:g=>g.p.y>100?Math.abs(g.p.x-60):300-g.p.y,beam:150,maxDepth:45});
}

// 195 The Light's Door: whenever you go in, the light comes through the same door on the louvre's open
// beat. A run whose flight begins while the louvre is open never lands.
if(on('p195')){
const go=w=>[[108,'rgu'],[30+w,''],[7,'rj'],[1,'dq'],[45,''],[60,'r']];
const beat={beat:{open:50,shut:70,offset:0}};
K.never('The Light’s Door: go through the door while the louvre is open','p195',
 range(0,200,3).map(go),r=>{const pass=r.events.find(e=>e.type==='portal-pass');return r.exited&&pass&&B.shutterOpen(beat,pass.i+1)&&B.shutterOpen(beat,pass.i+3);});
K.never('The Light’s Door: drop in from the pillar without climbing higher','p195',
 range(0,120,4).map(w=>[[108,'rgu'],[30+w,''],[6,'r'],[1,'dq'],[1,''],[80,''],[60,'r']]));
K.hunt('The Light’s Door: no way over the thorns but the door','p195',{actions:[...ACT.climb],reject:anyEv('portal-pass'),key,beam:150,maxDepth:40});
}

// 196 Ring Light: from the ledge, a jump off it, or the first ring the panel is out of sight; only the far
// ring sees it, and only the rings get you across and up to the landing.
if(on('p196')){
K.never('Ring Light: shoot from the ledge or a jump off it','p196',
 X(range(0,40,5),[0,6,12],['rq','ruq']).map(([w,j,q])=>[[w,'r'],...(j?[[1,'j'],[j,'j']]:[]),[1,q],[1,''],[200,'r']]),r=>lit(r));
K.never('Ring Light: shoot from the first ring','p196',
 X(range(0,40,2),['rgq','rugq','ugq']).map(([w,q])=>[[30,'r'],[1,'rjg'],[10,'rjg'],[w,'rg'],[1,q],[1,'g'],[60,'']]),r=>lit(r));
K.hunt('Ring Light: no way to the landing without a ring','p196',{actions:[...ACT.basic,...ACT.grabs],reject:anyEv('hook'),
 goal:g=>g.p.x>=248&&g.p.y<=85,score:g=>Math.hypot(g.p.x-260,g.p.y-80),beam:300,maxDepth:45});
}

// 197 Noon Engine: a dash before the shot takes the island away and puts amber in the line; a shot from
// the floor never sees the panel.
if(on('p197')){
K.never('Noon Engine: dash first, then shoot from the air','p197',
 X(range(0,30,3),[4,8,12,16],['ruq','rq']).map(([w,j,q])=>[[30+w,'r'],[1,'rj'],[j,'rj'],[1,'rx'],[4,''],[1,q],[1,''],[200,'r']]),r=>lit(r));
K.hunt('Noon Engine: the panel is seen only from the cyan island','p197',{actions:[...ACT.basic,...PQ],key,
 reject:(g,e)=>e.some(x=>x.type==='portal-open')&&!(g.p.x>=104&&g.p.x<=136&&g.p.y<=126),goal:litG,key,beam:200,maxDepth:35});
}

// 198 Two Deliveries: a bolt breaks the husk, but a bolt goes straight past the glass; only light turns
// down to the stone. The light first is stopped by the husk.
if(on('p198')){
K.never('Two Deliveries: keep the low end and let the bolts do everything','p198',
 range(0,60,6).map(w=>[[8,'r'],[1,'lq'],[1,''],[162+w,''],[1,'j'],[20,'j'],[100,''],[1,'j'],[20,'j'],[100,''],[1,'j'],[20,'j'],[60,'']]),r=>lit(r));
K.never('Two Deliveries: take the light first','p198',
 range(0,60,6).map(w=>[[8,'r'],[1,'luq'],[1,''],[162+w,''],[1,'j'],[20,'j'],[100,''],[1,'j'],[20,'j'],[60,'']]),r=>lit(r));
}

// 199 The Sunspire. Room a: the first hyper started from amber turns the engine to amber, and the shaft
// in the middle burns; a jump meets the roof of light.
if(on('p199a')){
K.never('The Sun Court: hyper without setting the engine first','p199a',
 range(0,100,4).map(w=>[[1,'l'],[44+w,''],[34,'r'],[5,'rdx'],[26,'rj'],[10,''],[5,'rdx'],[26,'rj'],[60,'r']]));
K.never('The Sun Court: set it twice before the first hyper','p199a',
 range(0,60,4).map(w=>[[2,'lx'],[20,''],[2,'rx'],[22+w,''],[34,'r'],[5,'rdx'],[26,'rj'],[10,''],[5,'rdx'],[26,'rj'],[60,'r']]));
K.never('The Sun Court: a super jump, short and low, without setting the engine','p199a',
 range(0,100,4).map(w=>[[1,'l'],[44+w,''],[34,'r'],[5,'rx'],[4,'rj'],[20,'r'],[10,''],[5,'rx'],[4,'rj'],[60,'r']]));
K.hunt('The Sun Court: no crossing without a dash','p199a',{reject:anyEv('dash'),key,beam:300,maxDepth:40});
}

// Room b: the door is the louvre's too. Taken on the open beat it burns you in the shaft or at the door;
// taken late in the shut beat, the light follows before you are off its line.
if(on('p199b')){
const beat={beat:{open:40,shut:100,offset:0}},cyc=140;
const go=w=>[[108,'rgu'],[w,''],[1,'j'],[12,'j'],[8,'r'],[4,''],[1,'dq'],[1,''],[38,''],[16,'g'],[1,''],[15,'r'],[5,'rux'],[140,''],[60,'r']];
const passAt=r=>{const e=r.events.find(x=>x.type==='portal-pass');return e?e.i+1:null;};
K.never('The Hall of Hours: take the door while the louvre is open','p199b',range(0,280,4).map(go),
 r=>{const t=passAt(r);return r.exited&&t!==null&&B.shutterOpen(beat,t)&&B.shutterOpen(beat,t+3);});
K.never('The Hall of Hours: take the door as the shut beat runs out','p199b',range(0,280,4).map(go),
 r=>{const t=passAt(r);return r.exited&&t!==null&&((t%cyc)>=120);});
// The skip hunt ignores the light: nothing but the ring reaches the landing, burning or not.
const def=globalThis.BladefallPrecisionRooms.all.find(d=>d.id==='p199b');def.beamsHarmless=true;
K.hunt('The Hall of Hours: no way onto the landing without the ring','p199b',{start:[[108,'rgu'],[60,'']],actions:[...ACT.basic,...PQ],
 reject:anyEv('hook'),goal:g=>g.p.x>=248&&g.p.y<=50,score:g=>Math.hypot(g.p.x-270,g.p.y-45),key,beam:150,maxDepth:30});
delete def.beamsHarmless;
}

K.done();
