// Bonus · Crossings (labels C1–C6, 7.255): routes and the wrong answers that fail.
//   node scripts/verify-precision-part-903.mjs            (ONLY=bc3,bc6 runs a subset while authoring)
// Each room pairs two regional devices that never meet in levels 75–199; the checks below show that the way
// they act on each other is what the room asks. A "control" is a copy of the room with one device taken out
// (in memory only), run to show that the other device alone would not answer, or would answer too easily.
import {kit,X,range} from './pcore-verify-kit.mjs';
import {ACT,beam} from './pcore-search.mjs';
import {Rooms} from './pcore-tape.mjs';
const K=kit('BC');
const ONLY=process.env.ONLY?process.env.ONLY.split(','):null,on=id=>!ONLY||ONLY.includes(id);
if(!ONLY)K.routes();
console.log('Bonus · Crossings: tempting wrong strategies fail');

// A state key that also sees gravity, the cart, the foothold, the deck clock, the lamp's count and the chain.
const key=g=>{const p=g.p,cart=g.ents.find(e=>e.type==='cart'),fh=g.ents.find(e=>e.type==='foothold');
 return [p.x>>1,p.y>>1,Math.round(p.vx/20),Math.round(p.vy/20),p.state,p.dashes,p.onGround?1:0,g.flipped?1:0,p.hook?Math.round(p.hook.len/4):'',
  p.seenT||0,cart?(cart.x>>2)+','+Math.round(cart.vx/30):'',fh?(fh.gone?1:0):'',g.decksAwake?Math.floor((g.ents.find(e=>e.type==='deck')||{clock:0}).clock/6):''].join('|');};
const ev=(...ts)=>(g,e)=>e.some(x=>ts.includes(x.type));
const HOOK=[[[8,'rg']],[[8,'g']],[[4,'rg']],[[1,'rjg']],[[8,'rug']],[[8,'rdg']]];
// A copy of a room with some of its def replaced, registered in memory under a new id for a control search.
const variant=(id,over,tag)=>{const d=Rooms.all.find(r=>r.id===id);const v={...d,...over,id:id+'-'+tag};Rooms.all.push(v);return v.id;};
const found=(id,opts)=>beam(id,{actions:ACT.basic,goal:g=>g.exited,score:g=>-g.p.x,beam:800,maxDepth:60,key,...opts});

// C1 Ice Throws Shade: the light rises through the pool to the roof. Walking, hopping, dashing or swimming
// through it burns; struck, the pool freezes and the ice stops the light. It thaws on its clock and the
// light comes back, so freezing early and dawdling fails too.
if(on('bc1')){
K.never('Ice Throws Shade: walk, hop or dash through the column of light','bc1',
 X(range(0,60,4),['walk','hop','dash','swim']).map(([w,k])=>[[50+w,'r'],...(k==='hop'?[[1,'rj'],[14,'rj']]:k==='dash'?[[1,'rx']]:k==='swim'?[[30,'r'],[1,'rj'],[1,''],[1,'rj']]:[]),[200,'r']]));
K.never('Ice Throws Shade: freeze the pool, then wait out the thaw before crossing','bc1',
 range(190,330,10).map(w=>[[66,'r'],[1,'rj'],[10,'r'],[1,'rds'],[8,''],[w,'l'],[300,'r']]));
// The search shares the room's tiles between branches and freezing writes ice into them, so this hunt leaves the
// blade out altogether (nothing else here answers a strike): no branch can freeze the pool.
K.hunt('Ice Throws Shade: no way past the light without the blade (so without freezing the pool)','bc1',{actions:ACT.basic,reject:ev('freeze'),key,beam:400,maxDepth:45});
}

// C2 Shade on Wheels: the light runs the low line at head height. Without the cart in front of you it burns;
// a cart pushed down the line carries the shade with it to the end.
if(on('bc2')){
K.never('Shade on Wheels: drop into the line and go without the cart','bc2',
 X(range(0,50,5),['walk','hop','dash','dashjump']).map(([w,k])=>[[60+w,'r'],...(k==='hop'?[[1,'rj'],[14,'rj']]:k==='dash'?[[1,'rx']]:k==='dashjump'?[[1,'rj'],[6,'rj'],[1,'rx']]:[]),[300,'r']]));
K.hunt('Shade on Wheels: no way down the line while the cart stays in the yard','bc2',{reject:g=>{const c=g.ents.find(e=>e.type==='cart');return c.x!==c.ox||c.y!==c.oy;},key,beam:400,maxDepth:50});
}

// C3 Roof Underfoot: the lamp in the chasm looks up through everything but solid things. The stepping
// stones overhead are the obvious way and the lamp sees every hop; on the deck its body hides you.
// Controls: without the deck no route exists; without the deck and the lamp, the stepping stones do work.
if(on('bc3')){
K.never('Roof Underfoot: hop the stepping stones','bc3',
 X(range(0,16,2),[10,14],[0,4,8],['','rx','rux']).map(([w,j,g,d])=>[[30+w,'r'],[j,'rj'],[g,'r'],[j,'rj'],[g,'r'],[j,'rj'],...(d?[[1,d]]:[]),[g,'r'],[j,'rj'],[g,'r'],[j,'rj'],[200,'r']]));
// Leaving the deck in the last third of its run is fine (the lamp only glimpses you); before halfway it is not.
K.never('Roof Underfoot: jump or dash off the deck before it is halfway across','bc3',
 X(range(0,90,6),['rj','rx','rux']).map(([w,k])=>[[40,'r'],[w,''],[1,k],[14,k==='rj'?'rj':'r'],[200,'r']]));
const noDeck=variant('bc3',{decks:[]},'nodeck'),noDeckNoLamp=variant('bc3',{decks:[],lights:[]},'nodecknolamp');
{const r=beam(noDeck,{actions:ACT.basic,goal:g=>g.exited,score:g=>-g.p.x,beam:1500,maxDepth:70,key});K.say(!r,`bc3 control: deck taken out, lamp kept: ${r?'FOUND '+JSON.stringify(r.tape):'no route'}`);}
{const r=found(noDeckNoLamp);K.say(!!r,`bc3 control: deck and lamp both taken out: the stepping stones ${r?'cross ('+r.tape.length+' steps)':'do not cross (control failed)'}`);}
}

// C4 High Wind: the gale blows only up near the roof. A jump never reaches it; the anvil (in a narrow socket, so
// no run-up speed survives into the cut) throws you into it,
// and the longer you stay up there the farther it carries you. Dashing for the ledge too early cuts the
// climb short and falls in the thorns. Control: without the wind, no anvil flight reaches the ledge.
if(on('bc4')){
const pogo=[[34,'r'],[30,''],[1,'j'],[10,''],[1,'ds']];
K.never('High Wind: dash for the ledge straight off the anvil','bc4',
 X(range(0,22,2),['rx','rux','rdx']).map(([k,d])=>[...pogo,[k,'r'],[1,d],[200,'r']]));
K.never('High Wind: jump and dash from the edge of the floor, no anvil','bc4',
 X(range(16,40,2),[6,10,14],['rx','rux']).map(([w,j,d])=>[[w,'r'],[1,'rj'],[j,'rj'],[1,d],[200,'r']]));
K.hunt('High Wind: no way across without the anvil','bc4',{reject:ev('anvil'),key,beam:800,maxDepth:50});
const calm=variant('bc4',{winds:[]},'calm');
{const r=beam(calm,{actions:[...ACT.basic,...ACT.strikes],goal:g=>g.exited,score:g=>-g.p.x,beam:800,maxDepth:50,key});K.say(!r,`bc4 control: wind taken out, anvil kept: ${r?'FOUND '+JSON.stringify(r.tape):'no route'}`);}
}

// C5 The Last of It: the foothold plugs the shaft's foot and keeps the light out of it. Leave it and the
// light comes up the shaft at once. Falling onto it from the window and climbing on burns; the way up
// never touches it. Hunt: no exit at all once the foothold is spent.
if(on('bc5')){
const shelf=[[14,'rj'],[5,'rux'],[14,'rj'],[14,'rj'],[14,'rj'],[8,'r']];
K.never('The Last of It: drop onto the foothold from the window, then climb or jump on','bc5',
 X(range(0,30,3),['j','gu','rgu','lgu','ux']).map(([w,k])=>[...shelf,[30,'r'],[20+w,''],[1,k==='ux'?'ux':k],[60,k==='j'||k==='ux'?'':k],[14,'rj'],[20,'rgu'],[14,'rj'],[20,'rgu'],[14,'rj']]));
K.hunt('The Last of It: no way out once the foothold is spent','bc5',{actions:ACT.climb,key,beam:300,maxDepth:60,
 goal:g=>g.exited&&g.ents.some(e=>e.type==='foothold'&&e.gone),score:g=>g.p.y+Math.abs(g.p.x-160)});
}

// C6 Hang From the Roof: the prism is the only way out of the pocket, and upside down the ring hangs over
// the thorns of the roof. The chain swings you toward the roof; let go on the upswing onto the block.
if(on('bc6')){
K.hunt('Hang From the Roof: no way out of the pocket without turning over','bc6',{actions:[...ACT.climb,...HOOK],reject:ev('gravity'),key,beam:700,maxDepth:45});
const flipped=[[5,'ux'],[40,'']];
K.hunt('Hang From the Roof: upside down, no way to the block without the ring','bc6',{actions:ACT.basic,reject:ev('hook'),key,start:flipped,beam:1500,maxDepth:70});
K.never('Hang From the Roof: jump and dash for the block from the roof','bc6',
 X(range(0,40,4),[8,14],['rx','rux','rdx']).map(([w,j,d])=>[...flipped,[w,'r'],[1,'rj'],[j,'rj'],[1,d],[200,'r']]));
}
K.done();
