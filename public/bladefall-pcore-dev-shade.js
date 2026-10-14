/* Precision Core — the shade (7.280, the Fractured act): your own path, walked again behind you.

   Room field `shade:{delay:60, count:1, gap:40}` (frames). From your first input the room remembers where
   you were every frame. `delay` frames later a shade of the knight steps out of the spawn and walks exactly
   where you walked, the same delay behind you, forever. Touching it kills. With count > 1 a further shade
   follows every `gap` frames behind the one before (count is at most 3).
   What it asks: never go back the way you came while it is close, and never stand still longer than the
   delay (it reaches where you are standing). Before your first input nothing is recorded and no shade walks,
   so a room can be studied at the spawn for as long as you like.
   The touch box is a little smaller than the knight (6x8 inside 8x11), so a near miss reads as a miss.
   Each shade is a g.ents entity (type 'shade') so the route search's state key sees where it is; the trail is
   an Int16Array ring (x, y, pose) that turns over with a gravity prism (mirror hook). */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore;
const SK=Object.freeze({delay:60,count:1,gap:40,maxCount:3});
const overlap=(ax,ay,aw,ah,bx,by,bw,bh)=>ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;
const OFF=-999;
function poseOf(p){return p.state==='climb'?4:p.state==='dash'||p.state==='ride'?5:!p.onGround?(p.vy<0?2:3):Math.abs(p.vx)>10?1:0;}
function reset(g){
 const d=g.room.def.shade;g.shade=null;g.shadePlayers=null;if(!d)return;
 const cfg={...SK,...(typeof d==='object'?d:{})};
 const count=Math.max(1,Math.min(SK.maxCount,cfg.count|0||1)),len=cfg.delay+(count-1)*cfg.gap+1;
 g.shade={delay:cfg.delay,gap:cfg.gap,count,len,buf:new Int16Array(len*3),head:0,filled:0,on:false};
 for(let k=0;k<count;k++)g.ents.push({type:'shade',dev:true,solid:false,x:OFF,y:OFF,w:8,h:11,id:'sh'+k,k,f:1,pose:0,state:'',age:0});
}
function sharedReady(g){
 if(!g.shade)return;
 g.shadePlayers=g.players.map(()=>({...g.shade,buf:new Int16Array(g.shade.len*3)}));
 g.ents=g.ents.filter(e=>e.type!=='shade');
 for(const [owner,S]of g.shadePlayers.entries())for(let k=0;k<S.count;k++)g.ents.push({type:'shade',dev:true,solid:false,x:OFF,y:OFF,w:8,h:11,id:'sh'+owner+':'+k,owner,k,f:1,pose:0,state:'',age:0});
}
function after(g,inp){
 const S=g.players?g.shadePlayers?.[g.players.indexOf(g.p)]:g.shade;if(!S)return;
 const p=g.p,Core=C();if(p.state==='dead'||p.state==='respawn')return;
 if(!S.on){if(inp&&(inp.mx||inp.my||inp.jump||inp.dash||inp.grab))S.on=true;else return;}
 const i=S.head*3;S.buf[i]=p.x;S.buf[i+1]=p.y;S.buf[i+2]=poseOf(p)*2+(p.facing<0?1:0);
 S.head=(S.head+1)%S.len;S.filled=Math.min(S.filled+1,S.len);
 for(const e of g.ents){
  if(e.type!=='shade'||g.players&&e.owner!==g.players.indexOf(p))continue;
  const back=S.delay+e.k*S.gap;
  if(S.filled<=back){e.x=OFF;e.y=OFF;e.state='';continue;}
  const j=((S.head-1-back)%S.len+S.len)%S.len*3;
  e.x=S.buf[j];e.y=S.buf[j+1];e.pose=S.buf[j+2]>>1;e.f=S.buf[j+2]&1?-1:1;
  if(e.state!=='on'){e.state='on';Core.emit(g,'shade-wake',{x:e.x+4,y:e.y+6,k:e.k});}
  e.age++;
  if(!g.players&&overlap(p.x+1,p.y+2,6,8,e.x+1,e.y+2,6,8)){Core.kill(g,p,'shade');Core.emit(g,'shade-touch',{x:e.x+4,y:e.y+6});return;}
 }
}
/* The trail ahead of each shade (the positions it will walk next), for the view. */
function ahead(g,e,n){
 const S=g.players?g.shadePlayers?.[e.owner]:g.shade;if(!S||e.state!=='on')return [];
 const out=[],back=S.delay+e.k*S.gap;
 for(let s=Math.min(n,back);s>=1;s-=3){const j=((S.head-1-back+s)%S.len+S.len)%S.len*3;out.push([S.buf[j],S.buf[j+1]]);}
 return out;
}
function mirror(g){
 for(const S of g.shadePlayers||[g.shade]){if(!S)continue;
 const H=g.room.h||184;
 // The shades themselves are g.ents: the prism has already turned them over with everything else.
 for(let i=0;i<S.len;i++)S.buf[i*3+1]=H-S.buf[i*3+1]-11;
}}
function afterPlayers(g){
 if(!g.shadePlayers)return;const actor=g.coopActor;
 try{for(const [i,p]of g.players.entries()){
  if(p.state==='dead'||p.state==='respawn')continue;
  const e=g.ents.find(e=>e.type==='shade'&&e.state==='on'&&overlap(p.x+1,p.y+2,6,8,e.x+1,e.y+2,6,8));
  if(e){g.coopActor=i;C().kill(g,p,'shade');C().emit(g,'shade-touch',{x:e.x+4,y:e.y+6});}
 }}finally{g.coopActor=actor;}
}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'shade',reset,sharedReady,after,afterPlayer:after,afterPlayers,mirror});
root.BladefallPrecisionShade=Object.freeze({SK,ahead});
})(typeof window!=='undefined'?window:globalThis);
