// Part XIX · Palace Path (levels 180–189, 7.254): routes and the wrong answers that fail.
//   node scripts/verify-precision-part-180.mjs          (ONLY=p184,p189a to run a few rooms)
// Light (bladefall-pcore-dev-beam.js): a beam burns; louvres shut it on a beat; a struck mirror swings it; the
// lantern, solid machinery and a turned shellback stop it.
import {kit,X,range} from './pcore-verify-kit.mjs';
import {ACT,defaultKey} from './pcore-search.mjs';
import {Rooms} from './pcore-tape.mjs';
const K=kit('XIX');
// Every run parses the room list it is given; this part's rooms need nothing from the others, so the list is cut
// to them. That makes each tape several times faster and keeps this script working while another part is mid-edit.
{const mine=Rooms.chapters.filter(c=>c.part==='XIX').flatMap(c=>c.rooms);Rooms.all.splice(0,Rooms.all.length,...mine);}
const t0=Date.now();
const ONLY=process.env.ONLY?process.env.ONLY.split(','):null,on=id=>!ONLY||ONLY.includes(id);
const ev=(...ts)=>(g,e)=>e.some(x=>ts.includes(x.type));
// Louvre rooms: a wait is a real move, so the search key carries the beat.
const beatKey=g=>defaultKey(g)+'|'+(g.beams?g.beams.clock%360:0);
// A probe (this script only): counts the engine's flips, for 189a.
(globalThis.BladefallPrecisionDevices||[]).push({name:'xix-probe',after(g){for(const e of g.events)if(e.type==='phase')g.flips=(g.flips||0)+1;}});
const toward=(x,y)=>g=>Math.hypot(g.p.x-x,g.p.y-y);
const hopTail=j=>j?[[1,'rj'],[j,'rj'],[400,'r']]:[[400,'r']];
if(!ONLY)K.routes();
console.log('Part XIX: tempting wrong strategies fail');

// 180 Sun Window: walking or hopping on at one pace meets an open louvre, whenever you set out.
if(on('p180')){
K.never('Sun Window: set out at any moment and never stop','p180',
 X(range(0,238,2),[0,6,14]).map(([w,j])=>[[1,'l'],[w,''],...hopTail(j)]));
}

// 181 Turn the Glass: the beam reaches the floor; nothing passes it but a turn of the glass.
if(on('p181')){
K.never('Turn the Glass: walk, hop or dash through the light','p181',
 X(range(0,80,4),['walk','hop','jump','dash','jd']).map(([w,k])=>[[w,'r'],
  ...(k==='walk'?[]:k==='hop'?[[1,'rj'],[3,'rj']]:k==='jump'?[[1,'rj'],[14,'rj']]:k==='dash'?[[1,'rx']]:[[1,'rj'],[8,'rj'],[1,'rx']]),[300,'r']]));
// (no hunt: the light reaches the floor wall to wall; the family above is the whole question)
}

// 182 Light It, Then Turn It Back: lit, the stone opens the gate, but the light that lit it is on the road.
if(on('p182')){
const lit=[[94,'r'],[1,'j'],[14,'j'],[1,'jus'],[40,'']];
K.never('Light It: light the stone, then go straight on under it','p182',
 X(range(0,40,4),['walk','hop','jump','dash']).map(([w,k])=>[...lit,[w,''],
  ...(k==='walk'?[[10,'r']]:k==='hop'?[[4,'r'],[1,'rj'],[3,'rj']]:k==='jump'?[[4,'r'],[1,'rj'],[14,'rj']]:[[1,'rx']]),[300,'r']]));
K.never('Light It: leave the stone dark and try the gate','p182',
 X(range(0,60,6),[0,6,14]).map(([w,j])=>[[80,'r'],[w,''],...hopTail(j)]));
// (no hunt: the light reaches the floor wall to wall; the family above is the whole question)
}

// 183 Carried Shade: without the lantern overhead every line of sun is a wall; thrown ahead, it shades the floor, not you.
if(on('p183')){
K.never('Carried Shade: go without the lantern','p183',
 X(range(0,60,4),['walk','hop','dash']).map(([w,k])=>[[w,'r'],...(k==='walk'?[]:k==='hop'?[[1,'rj'],[14,'rj']]:[[1,'rx']]),[300,'r']]));
K.never('Carried Shade: throw the lantern into the first light and walk after it','p183',
 range(0,50,2).map(w=>[[16,'r'],[1,'rg'],[w,'r'],[1,'rg'],[300,'r']]));
// (no hunt: the light reaches the floor wall to wall; the family above is the whole question)
}

// 184 Switchback Engine: the dash that clears the thorns flips the roof off the middle light, so it must come after it.
if(on('p184')){
K.never('Switchback Engine: jump the thorns without a dash','p184',
 X(range(48,66,2),[8,14]).map(([w,j])=>[[w,'r'],[1,'rj'],[j,'rj'],[200,'r']]));
K.never('Switchback Engine: dash early in the jump, or from the ground','p184',
 X(range(48,66,2),[-1,0,2,4,6,8,10]).map(([w,d])=>d<0?[[w,'r'],[1,'rx'],[4,'r'],[1,'rj'],[20,'rj'],[200,'r']]:[[w,'r'],[1,'rj'],[d+1,'rj'],[1,'rx'],[200,'r']]));
K.hunt('Switchback Engine: no crossing without a dash past the middle light','p184',
 {reject:(g,e)=>e.some(x=>x.type==='dash')&&g.p.x>140,beam:300,maxDepth:40});
}

// 185 Beat and Glass: drop onto the floor while the louvre is open and burn; cross in the dark without turning
// the glass and the light on the step burns you.
if(on('p185')){
K.never('Beat and Glass: drop at once, while the louvre is open','p185',
 X(range(0,22,3),[0,10]).map(([w,s])=>[[w,''],[16,'r'],[1,'rj'],[14,'rj'],[56+s,'r'],[1,'us'],[14,'r'],[1,'rj'],[14,'rj'],[200,'r']]));
K.never('Beat and Glass: cross in the dark and leave the glass alone','p185',
 X(range(36,90,4),[0,6,14]).map(([w,j])=>[[w,''],[16,'r'],[1,'rj'],[14,'rj'],...hopTail(j)]));
K.hunt('Beat and Glass: no way out without turning the glass','p185',{reject:ev('mirror'),key:beatKey,score:toward(318,149),beam:300,maxDepth:50});
}

// 186 Throw the Shade: the passage floor is lit end to end; the lantern held overhead shades only your head.
if(on('p186')){
const got=[[16,'r'],[1,'rg']];
K.never('Throw the Shade: carry the lantern down into the passage','p186',
 X(range(40,110,6),[0,1]).map(([w,k])=>[...got,[w,'r'],...(k?[[1,'rj'],[14,'rj']]:[]),[300,'r']]));
K.never('Throw the Shade: set it down on the walk and go on without it','p186',
 range(20,70,5).map(w=>[...got,[w,'r'],[1,'dg'],[300,'r']]));
const passage=g=>g.ents.some(e=>e.type==='lantern'&&!e.held&&!e.returning&&e.y>120);
K.hunt('Throw the Shade: no way along the passage without the lantern down in its light','p186',
 {actions:[...ACT.basic,[[1,'g']],[[1,'rg']],[[1,'dg']]],reject:passage,score:toward(318,149),beam:300,maxDepth:50});
}

// 187 Low Light: the thorns are too long for a jump and a super, jump-dash and plain jump all lift the head into the light.
if(on('p187')){
K.never('Low Light: jump, super, jump and dash, or a plain dash','p187',
 X(range(20,90,4),['jump','super','jd','dash']).map(([w,k])=>[[w,'r'],
  ...(k==='jump'?[[1,'rj'],[20,'rj']]:k==='super'?[[1,'rx'],[4,'r'],[1,'rj'],[20,'rj']]:k==='jd'?[[1,'rj'],[6,'rj'],[1,'rx']]:[[1,'rx']]),[200,'r']]));
K.hunt('Low Light: no crossing without a hyper','p187',{reject:ev('hyper'),beam:300,maxDepth:40});
}

// 188 Belly Shade: the floor is lit end to end; come down anywhere but in a turned shellback's shadow and burn.
if(on('p188')){
K.never('Belly Shade: go down without turning the shellback','p188',
 X(range(0,200,5),[0,1]).map(([w,k])=>[[w,''],...(k?[[30,'r'],[1,'rj'],[14,'rj']]:[[30,'r']]),[300,'r']]));
K.never('Belly Shade: bounce on its back instead of turning it','p188',
 X(range(0,200,5),[20,26,32]).map(([w,d])=>[[w,''],[36,'r'],[d,''],[1,'ds'],[200,'r']]));
K.hunt('Belly Shade: no way down to the kerb without a turned shellback','p188',
 {actions:[...ACT.basic.filter(a=>!a[0][1].includes('x')),...ACT.strikes],reject:(g,e)=>e.some(x=>x.type==='enemy-hit'&&x.why==='flip'),score:toward(318,149),beam:300,maxDepth:50});
}

// 189a The Engine Road: a hyper or super over the pit flips the engine as it starts, so without a spare flip
// before the first light the middle light is on over the thorns; with no flip after the pit, the last one is on.
if(on('p189a')){
K.never('The Engine Road: straight into a hyper or super, no spare flip','p189a',
 X(range(0,90,3),['hyper','super']).map(([w,k])=>[[w,'r'],...(k==='hyper'?[[1,'rdx'],[5,'rd'],[1,'rj'],[36,'rj']]:[[1,'rx'],[4,'r'],[1,'rj'],[36,'rj']]),[1,'rx'],[100,'r']]));
K.never('The Engine Road: spare flip and a hyper, but nothing after the pit','p189a',
 range(10,40,2).map(w=>[[20,'r'],[1,'rx'],[w,'r'],[1,'rdx'],[5,'rd'],[1,'rj'],[36,'rj'],[100,'r']]));
K.hunt('The Engine Road: no crossing on fewer than three flips of the engine','p189a',{goal:g=>g.exited&&(g.flips||0)<3,beam:300,maxDepth:40});
}

// 189b The Sun Gate: struck, the glass lays the light over the thorns; only a hyper runs under it.
if(on('p189b')){
const turned=[[34,'r'],[1,'j'],[6,'j'],[1,'rs'],[10,'']];
K.never('The Sun Gate: jump, super, or jump and dash under the turned light','p189b',
 X(range(0,40,2),['jump','super','jd']).map(([w,k])=>[...turned,[w,'r'],
  ...(k==='jump'?[[1,'rj'],[20,'rj']]:k==='super'?[[1,'rx'],[4,'r'],[1,'rj'],[20,'rj']]:[[1,'rj'],[6,'rj'],[1,'rx']]),[200,'r']]));
// (no hunt for the glass: unturned, its light closes the road from the floor to the far wall)
K.hunt('The Sun Gate: once turned, no crossing without a low launch (hyper or super)','p189b',{start:turned,reject:ev('hyper','super'),beam:300,maxDepth:40});
}

console.log(`(${((Date.now()-t0)/1000).toFixed(0)} s)`);
K.done();
