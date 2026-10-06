// Room reflection, shared by scripts/rbr-src/fracture.mjs (made the reflected Fractured regions) and the Climb builder
// (spec.mirror: a room the road meets from the side opposite its fire is laid as its reflection). 7.280: tears (lines)
// and polished rock (slick) reflect too.
const swapLR=s=>typeof s==='string'?s.replace(/\b(left|right|Left|Right|LEFT|RIGHT)\b/g,w=>({left:'right',right:'left',Left:'Right',Right:'Left',LEFT:'RIGHT',RIGHT:'LEFT'})[w]):s;
const SIDE={left:'right',right:'left'};
const swapSide=v=>SIDE[v]||v;
// tiles with a direction: spikes, foundry belts ({ left, } right), rail boost strips (( left, ) right)
const FLIP={'<':'>','>':'<','{':'}','}':'{','(':')',')':'('};
function mirrorMap(map){return map.map(r=>[...r].reverse().map(ch=>FLIP[ch]||ch).join(''));}
function deep(v,C,key,parent){
 if(Array.isArray(v)){
  if(key==='zips')return v.map(([a,b])=>[-a,b]);
  if((key==='to'||key==='dir')&&v.length===2&&v.every(x=>typeof x==='number'))return [-v[0],v[1]];
  if(key==='bays')return v.map(x=>C-1-x);
  if((key==='a'||key==='b')&&parent==='lines'&&v.length===2&&v.every(x=>typeof x==='number'))return [C-1-v[0],v[1]];   // a tear's mouths (7.280)
  if(key==='range'&&parent==='sentinel'&&v.length===2)return [C*8-v[1],C*8-v[0]];   // the Sentinel's aim band, in px (7.280)
  if(key==='slick')return v.map(q=>Array.isArray(q)&&q.length===4?[C-1-q[2],q[1],C-1-q[0],q[3]]:q);   // polished rock rectangles (7.280)
  return v.map(e=>deep(e,C,key,parent));
 }
 if(v&&typeof v==='object'){
  const o={};
  for(const [k,x] of Object.entries(v)){
   if(k==='c'&&typeof x==='number')o.c=C-x-(typeof v.w==='number'&&v.w<C?v.w:key==='portals'&&(v.face==='u'||v.face==='d')?2:1);   // (a floor or ceiling portal is two tiles wide)
   else if(k==='x'&&typeof x==='number')o.x=key==='combat'||parent==='combat'||key==='receivers'||key==='doors'?C*8-x-(v.w||8):C-1-x;
   else if(k==='dx'&&typeof x==='number')o.dx=-x;
   else if(k==='face')o.face=typeof x==='number'?-x:({r:'l',l:'r'})[x]||x;
   else if(['leave','body','edge','side','exit','entry'].includes(k))o[k]=swapSide(x);
   else if(k==='dir'&&typeof x==='number')o.dir=Math.abs(x)===1?-x:((180-x)%360+360)%360;
   else if(k==='dir'&&typeof x==='string')o.dir=({l:'r',r:'l',left:'right',right:'left'})[x]||x;
   else if(k==='c0'&&typeof x==='number')o.c0=C-1-v.c1;
   else if(k==='c1'&&typeof x==='number')o.c1=C-1-v.c0;
   else if(['cradle','cage'].includes(k)&&typeof x==='number')o[k]=C-1-x;
   else if((k==='from'||k==='to')&&typeof x==='number'&&key==='rescueEscort')o[k]=C-1-x;
   else if((k==='from'||k==='to')&&typeof x==='number'&&key==='sentinel')o[k]=C*8-x-28;   // a rush's ends, in px, for its 28-px body (7.280)
   else o[k]=deep(x,C,k,key);
  }
  return o;
 }
 return v;
}
const TEXT=new Set(['name','hint','question','line','lineDone','title']);
function mirrorRoom(d){
 const C=d.cols||40,o={};
 for(const [k,v] of Object.entries(d)){
  if(k==='map')o.map=mirrorMap(v);
  else if(['exit','side','entry'].includes(k))o[k]=swapSide(v);
  else if(k==='hint'||k==='question')o[k]=swapLR(v);
  else if(TEXT.has(k)||k==='id'||k==='rbr'||k==='lock'||k==='palette'||k==='quest'||k==='sideQuest'||k==='bearing')o[k]=v;
  else o[k]=deep(v,C,k,null);
 }
 o.exit=swapSide(d.exit||'right');   // (a room with no exit leaves right, so its reflection leaves left)
 return o;
}
const mirrorTape=t=>t&&t.map(([n,k])=>[n,k.replace(/[rl]/g,ch=>ch==='r'?'l':'r')]);
function run(def,tape,extra=30){const g=Core.createGame([def],{room:0});const f=expand(tape);let out=null,deaths=0;
 for(let i=0;i<f.length+extra;i++){Core.step(g,keysToInput(f[i]||''));for(const e of g.events){if(e.type==='death')deaths++;if(e.type==='exit'&&!out)out=e;}g.events.length=0;if(out)break;}
 return {exited:!!out,side:!!(out&&out.side),deaths};}
// The knight always spawns facing right; a reflected route that acts before it moves (fires the portal key, cuts)
// starts with one frame of left instead, as a player would (fracture keeps whichever plays).
const turned=t=>t&&[[1,'l'],...t];

export {mirrorRoom,mirrorTape,mirrorMap,swapLR};
