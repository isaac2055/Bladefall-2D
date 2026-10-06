// Level 200 · The Summit Road (7.255): routes and the wrong answers that fail.
//   node scripts/verify-precision-part-200.mjs            (ONLY=p200c,p200e runs a subset while authoring)
// Six rooms, each a checkpoint, each one question asked with devices from a different stretch of the game:
// a lantern and portals (Parts II–VI), freezing water and ice (White Court, Frostfell), a prism and an anvil
// (Inversion, Foundry, with a crystal), a cart and the echo (Deep Line, Throne), a fall-height door and a hook
// ring (Part V, Thunder Cliffs), and light through portals with the lantern (Sunspire).
import {kit,X,range} from './pcore-verify-kit.mjs';
import {ACT} from './pcore-search.mjs';
const K=kit('CAP');
const ONLY=process.env.ONLY?process.env.ONLY.split(','):null,on=id=>!ONLY||ONLY.includes(id);
console.log('Level 200: tempting wrong strategies fail');
if(!ONLY)K.routes();

const key=g=>{const p=g.p,l=g.ents.find(e=>e.type==='lantern'),c=g.ents.find(e=>e.type==='cart');
 return [p.x>>1,p.y>>1,Math.round(p.vx/30),Math.round(p.vy/30),p.state,p.dashes,p.onGround?1:0,p.carrying?1:0,g.flipped?1:0,p.airJumps||0,
  p.coast?1:0,p.fling?1:0,l?(l.x>>2)+','+(l.y>>2):'',c?(c.x>>2)+','+(c.y>>2)+','+Math.round(c.vx/30):'',g.echo?(g.echo.x>>2)+','+(g.echo.y>>2):'',
  p.hook?Math.round(p.hook.len/4):'',g.water?g.water.pools.map(q=>q.frozen?1:0).join(''):'',
  g.ents.map(e=>e.type==='stone'?(e.lit?1:0):e.type==='anvil'||e.type==='refill'?(e.timer>0?1:0):'').join('')].join('|');};
const ev=(...ts)=>(g,e)=>e.some(x=>ts.includes(x.type)||ts.includes(x.type+':'+x.kind));
const lit=r=>r.g.ents.some(e=>e.type==='stone'&&e.lit);

// a · Lamp Flight. The door in the well's floor throws you over the thorns as hard as you fell, and the
// thorns run the whole way. Without the lantern you come down long before the far shelf (there is no dash
// in this room). Every fall into the door, from either side of the well, lands in the thorns.
if(on('p200a')){
const thru=X(range(10,20,2),range(12,26,3),[0,4,8],['rj','r','']).map(([w,d,t,k])=>[[w,'r'],[d,'l'],[66-d,''],[t,'r'],...(k?[[1,k],[12,k]]:[]),[150,'r']])
 .filter(t=>K.sim('p200a',t).events.some(e=>e.type==='portal-pass'));   // only falls that really go through the door
K.never('Lamp Flight: fall through the door without the lantern, with or without a jump','p200a',thru);
K.hunt('Lamp Flight: no way to the shelf without carrying the lantern','p200a',{reject:g=>!!g.p.carrying,key,beam:400,maxDepth:40,
 score:g=>Math.abs(g.p.x-310)+Math.abs(g.p.y-100)});
}

// b · Frozen Fall. The only wall is a column of falling water; struck, it freezes into ice for 200 frames.
// Jumping at it, dashing through it or swimming in it without the blade only ever carries you down.
if(on('p200b')){
K.never('Frozen Fall: go for the water without striking it','p200b',
 X(range(0,24,3),['rg','rgu','rux','ux'],[0,6,12]).map(([w,a,m])=>[[28+w,'r'],[12,'rj'],[m,'r'],[a.includes('x')?5:60,a],[20,'rj'],[60,'rgu'],[30,'rj'],[5,'rux'],[60,'r']]));
K.never('Frozen Fall: freeze it, then hang on the ice before climbing','p200b',
 range(60,160,10).map(w=>[[28,'r'],[37,'rj'],[1,'rs'],[4,'r'],[7,'rg'],[w,'rg'],[137,'rgu'],[16,''],[12,'rj'],[5,'rx'],[75,'r']]));
K.hunt('Frozen Fall: no way up without freezing the water','p200b',{actions:[...ACT.climb],reject:ev('freeze'),key,beam:300,maxDepth:45,
 score:g=>Math.abs(g.p.x-300)+Math.abs(g.p.y-50)});
}

// c · Iron Both Ways. A super, a crystal, a dash through the prism; upside down you fall up to the anvil in
// the thorned roof. Cut toward your feet (up on the screen) and it throws you down to the way out; cut the
// way you would the right way up and it only rings.
if(on('p200c')){
const pre=[[5,'rx'],[5,'rx'],[14,'rj'],[5,'rux'],[14,'r'],[2,'rx']];
K.never('Iron Both Ways: cut the anvil down the screen (the way you would standing up)','p200c',
 X(range(30,50,1),['ds','s','rs'],[0,10,20]).map(([w,s,m])=>[...pre,[w,'r'],[1,s],[m,'r'],[5,'rux'],[60,'r']]));
K.never('Iron Both Ways: land on the anvil, then jump or dash for the door','p200c',
 X(range(0,30,3),['rdx','rx','dx',''],[0,6,12]).map(([w,d,m])=>[...pre,[42,'r'],[12,''],[w,''],[1,'rj'],[m,'rj'],...(d?[[5,d]]:[]),[60,'r']]));
K.hunt('Iron Both Ways: no way out without the anvil','p200c',{actions:[...ACT.basic,...ACT.strikes],reject:ev('anvil'),key,beam:500,maxDepth:50,
 score:g=>{const p=g.p,y=g.flipped?184-p.y-11:p.y;return Math.abs(p.x-316)+Math.abs(y-96)*0.7+(g.flipped?0:60);}});
}

// d · Borrowed Speed. The cart is fast and low; the ledge is high, past a thorned lip. Off the cart without
// the echo you stay under the ledge; from the top of the wall without the cart's speed you fall short.
if(on('p200d')){
const ride=[[6,'l'],[7,'lj'],[16,'']];                      // hop into the cart, never having left an echo
K.never('Borrowed Speed: ride the cart and jump without trading places','p200d',
 X(range(20,90,10),['','rux','ux','rx'],[0,8,16]).map(([w,d,m])=>[...ride,[w,'r'],[1,'rj'],[12,'rj'],[m,'r'],...(d?[[5,d]]:[]),[80,'r']]));
const top=[[8,'l'],[1,'lj'],[150,'lgu']];
K.never('Borrowed Speed: from the top of the wall without the cart (kick off, dash)','p200d',
 X([0,1],range(0,12,2),['rx','rux','ux'],[0,6,12]).map(([q,w,d,m])=>[...top,...(q?[[1,'lgq']]:[]),[w,'lgu'],[1,'rj'],[m,'rj'],[5,d],[80,'r']]));
K.hunt('Borrowed Speed: no way onto the ledge without trading places','p200d',{reject:ev('echo-swap'),key,beam:400,maxDepth:45,
 score:g=>Math.abs(g.p.x-200)+Math.abs(g.p.y-40)});
}

// e · Thrown to the Chain. The door in the well's floor throws you as hard as you fell. From the bottom
// third of the well the ring cannot swing you onto the ledge, however you pump, let go or dash.
if(on('p200e')){
// Holding grab from the moment you let go of the wall, so the chain takes any ring in reach.
K.never('Thrown to the Chain: fall from the bottom third of the well (then jump, dash, hold the chain)','p200e',
 X([0,20,40,60],[0,1],range(0,24,4),['rux','ux','rx']).map(([c,j,m,d])=>[[3,'r'],[c,'rgu'],[1,'g'],[12,'l'],[2,''],[8+Math.round(c/2.2),'g'],...(j?[[1,'gj'],[4,'g']]:[]),[m,'rg'],[5,d],[60,'rg'],[60,'r']]));
K.hunt('Thrown to the Chain: no way onto the ledge without the ring','p200e',{actions:[...ACT.climb],reject:ev('hook'),key,beam:400,maxDepth:50,
 score:g=>Math.abs(g.p.x-300)+Math.abs(g.p.y-20)});
}

// f · The Summit. Your door is the only way the light reaches the stone; once it does, it runs the length of
// the road at your feet. Shade put anywhere but at the light's own door leaves the tunnel burning.
if(on('p200f')){
const fired=[[70,'r'],[3,''],[1,'rdq'],[1,'']];
const got=[...fired,[55,'l'],[1,'g'],[2,'']];
K.never('The Summit: go down to the road without the lantern','p200f',
 range(0,40,4).map(w=>[...fired,[w,''],[80,'l'],[60,''],[140,'r'],[13,'j'],[120,'rgu'],[40,'r']]));
K.never('The Summit: carry the lantern down, or throw it into the hall','p200f',
 X(range(0,30,3),['carry','throw','set']).map(([w,k])=>[...got,[w,'l'],...(k==='carry'?[]:[[1,k==='throw'?'rg':'dg']]),[60,'l'],[40,''],[140,'r'],[13,'j'],[120,'rgu'],[40,'r']]));
// Lantern first: carry it down, set it on the road, climb back up the far wall and open the door. Only runs
// that really leave the lantern on the road and really open the door are counted.
const first=range(40,190,6).map(L=>[[17,'r'],[1,'g'],[2,''],[35,'l'],[105,''],[L,'r'],[1,'dg'],[3,''],[L-24,'l'],[14,'lj'],[24,'l'],[132,'lgu'],[10,'rj'],[75,'r'],[6,''],[1,'rdq'],[60,'']])
 .filter(t=>{const r=K.sim('p200f',t),l=r.g.ents.find(e=>e.type==='lantern');return l.y>=150&&r.events.some(e=>e.type==='portal-open');});
K.never('The Summit: set the lantern on the road first, then open the door','p200f',first,r=>lit(r));
K.hunt('The Summit: no way out without the lantern going through the door','p200f',{start:got,
 actions:[...ACT.basic,...ACT.grabs,[[1,'g']],[[1,'rg']],[[1,'lg']],[[1,'dg']]],key,reject:ev('portal-pass:lantern','portal-pass:knight'),
 score:g=>g.p.y<100?300-g.p.x+200:Math.abs(g.p.x-208)+Math.abs(g.p.y-100),beam:150,maxDepth:50});
}

K.done();
