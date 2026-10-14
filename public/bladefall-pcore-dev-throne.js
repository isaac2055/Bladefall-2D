/* Precision Core — the Throne (7.254, Part XIV, levels 132–139; introduced at the Citadel's close):
   the echo, the wake, and portals the room re-aims.

   Echo (room def `echo:true`): the portal key leaves an echo of the knight where he stands. Press it again
   and you trade places with your echo: you appear where it stood, still moving as you were, and it takes
   your old place. It stands where it is left, in the air if need be, and it holds a plate down as a
   lantern would. A trade releases a held rope and preserves its departure velocity. A trade that would put you inside something solid fizzles.
   Wake (room def `wake:{delay}`): a shade walks your exact path `delay` frames behind you, from your
   first move. Touching it is death. Never double back through where you have just been.
   Re-aimed portals (room def `portalMode:'fixed'` and `reaim:{every,sets:[[end,end],…]}`): both ends
   belong to the room, and every `every` frames they move to the next pair in the list. You cannot fire. */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore;
const overlap=(ax,ay,aw,ah,bx,by,bw,bh)=>ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;
function reset(g){
 const def=g.room.def;
 g.echo=null;g.echoOn=!!def.echo;
 g.wake=def.wake?{delay:def.wake.delay||60,path:[],shade:null,started:false}:null;
 g.reaim=def.reaim?{every:def.reaim.every,sets:def.reaim.sets,i:0,t:0}:null;
 if(g.reaim)setEnds(g,0);
}
function setEnds(g,i){
 const P=root.BladefallPrecisionPortals;if(!g.portals||!P)return;
 const set=g.reaim.sets[i%g.reaim.sets.length];
 for(const d of set)g.portals[d.color]={color:d.color,c:d.c,r:d.r,face:d.face,fixed:true};
 P.refresh(g);
}
function sharedReady(g){for(const p of g.players){p.echo=null;p.wake=g.wake?{...g.wake,path:[],shade:null,started:false}:null;}}
function before(g,inp,actorOnly=false){
 const Core=C(),p=g.p,S=g.players?p:g;
 if(g.echoOn&&g.buf.portal>0&&p.state!=='dead'&&p.state!=='respawn'){
  g.buf.portal=0;
  if(!S.echo){S.echo={type:'echo',dev:true,presses:true,x:p.x,y:p.y,w:p.w,h:p.h,id:g.players?'echo:'+g.players.indexOf(p):'echo',facing:p.facing};g.ents.push(S.echo);Core.emit(g,'echo-place',{x:p.x+4,y:p.y+5});}
  else{
   const e=S.echo;
   if(Core.solidAt(g,e.x,e.y,p.w,p.h)){Core.emit(g,'echo-fizzle',{x:e.x+4,y:e.y+5});}
   else{
    // A spatial exchange ends the old tether. Keeping it would pull the knight back toward
    // the old ring on this same frame and turn teleport distance into enormous velocity.
    // Release through the hook module so moving-ring velocity is inherited exactly once.
    if(p.hook)root.BladefallPrecisionHook.release(g,p,'echo');
    const ox=p.x,oy=p.y;p.x=e.x;p.y=e.y;p.remX=p.remY=0;e.x=ox;e.y=oy;e.facing=p.facing;
    if(p.state==='climb')p.state='normal';p.onGround=false;
    if(p.carrying){p.carrying.x=p.x;p.carrying.y=p.y-8;}
    Core.emit(g,'echo-swap',{x:p.x+4,y:p.y+5,fx:ox+4,fy:oy+5});}
  }
 }
 if(!actorOnly&&g.reaim&&g.awake){if(++g.reaim.t>=g.reaim.every){g.reaim.t=0;g.reaim.i++;setEnds(g,g.reaim.i);Core.emit(g,'reaim',{});}}
 if(S.wake&&g.awake){
  const w=S.wake,alive=p.state!=='dead'&&p.state!=='respawn';
  if(!w.started&&alive&&(inp.mx||inp.my||inp.jump||inp.dash))w.started=true;
  if(w.started){w.path.push({x:p.x,y:p.y});if(w.path.length>w.delay){const s=w.path.shift();if(!w.shade)Core.emit(g,'wake-rise',{x:s.x+4,y:s.y+5});w.shade={x:s.x,y:s.y,w:8,h:11};}}
 }
}
function after(g){
 if(g.players)return;
 const p=g.p,w=g.wake;
 if(w&&w.shade&&p.state!=='dead'&&p.state!=='respawn'&&overlap(p.x+1,p.y+1,p.w-2,8,w.shade.x+1,w.shade.y+1,6,9)){C().kill(g,p,'wake');}
}
function mirror(g){
 const H=g.room.h;
 // Echoes are entities and were already mirrored by the gravity module.
 for(const state of g.players||[g])if(state.wake){for(const s of state.wake.path)s.y=H-s.y-11;if(state.wake.shade)state.wake.shade.y=H-state.wake.shade.y-11;}
}
function afterPlayers(g){
 const actor=g.coopActor;
 try{for(const [i,p]of g.players.entries()){
  if(p.state==='dead'||p.state==='respawn')continue;
  if(g.players.some(q=>q.wake?.shade&&overlap(p.x+1,p.y+1,p.w-2,8,q.wake.shade.x+1,q.wake.shade.y+1,6,9))){g.coopActor=i;C().kill(g,p,'wake');}
 }}finally{g.coopActor=actor;}
}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'throne',reset,sharedReady,before,beforePlayer:(g,inp)=>before(g,inp,true),after,afterPlayers,mirror});
})(typeof window!=='undefined'?window:globalThis);
