/* Explore counterpart of Ascend's Smooth preset (bladefall-pcore-touch.js).
   Gesture timing advances with the game loop; keyboard/gamepad state stays separate. */
(function(root){
 'use strict';
 function create(api){
  const pointers=new Map(),input=api.input;
  let clock=0,stick=null,jumpUntil=0,jumpGap=0,dashUntil=0,dashGap=0,aim=null,lastPreset;
  const preset=()=>api.preset?.()==='buttons'?'buttons':'smooth';
  const active=()=>api.playing()&&!(root.document?.hidden);
  const radius=()=>api.stickLayout?.().r||52;
  function drawStick(){
   const joy=api.joy,knob=api.knob;
   if(!stick){joy.style.display='none';return;}
   const rect=api.zone.getBoundingClientRect(),r=radius(),size=r/52;
   joy.style.display='block';joy.style.width=joy.style.height=2*r+'px';
   joy.style.left=stick.ox-rect.left-r+'px';joy.style.top=stick.oy-rect.top-r+'px';
   knob.style.width=knob.style.height=46*size+'px';knob.style.left=knob.style.top=29*size+'px';
   const dx=stick.x-stick.ox,dy=stick.y-stick.oy,d=Math.hypot(dx,dy),k=d?Math.min(r,d)/d:0;
   knob.style.transform=`translate(${dx*k}px,${dy*k}px)`;
  }
  function releaseAll(){
   pointers.clear();stick=null;jumpUntil=jumpGap=dashUntil=dashGap=0;aim=null;
   input.jx=input.jz=input.touchUpT=0;input.touchUpUsed=false;
   input.jump=input.dodge=input.jumpEdge=input.dodgeEdge=false;
   drawStick();
  }
  function beginJump(){
   if(input.jump){jumpGap=clock+1.5/60;jumpUntil=0;}
   jumpUntil=Math.max(jumpUntil,Math.max(clock,jumpGap)+.2);
  }
  function step(p){
   const dx=p.x-p.x0,dy=p.y-p.y0,dist=Math.hypot(dx,dy),age=clock-p.t0;
   if(!p.dashed&&dist>=24&&api.canDash()&&(p.state==='pending'||age<.62)){
    // Explore supports horizontal/upward dash aiming through its existing stick input.
    // Do not change the simulation or grant an unearned movement ability.
    aim={x:Math.abs(dx)>Math.abs(dy)*.5?Math.sign(dx):0,y:dy<0?-1:0,until:clock+.12};
    if(input.dodge)dashGap=clock+1.5/60;
    dashUntil=Math.max(clock,dashGap)+.05;p.dashed=true;
    if(p.state==='pending')p.state='swiped';
   }else if(p.state==='pending'&&age>=.065&&!(dist>=24*.35&&age<.135)){
    beginJump();p.state='jumping';
   }
  }
  function sync(){
   input.jx=input.jz=0;
   if(stick){
    const dx=stick.x-stick.ox,dy=stick.y-stick.oy,d=Math.hypot(dx,dy),r=radius();
    if(d>6){input.jx=dx/Math.max(r,d);input.jz=dy/Math.max(r,d);}
   }
   if(preset()==='smooth'){
    if(aim&&clock<aim.until){input.jx=aim.x;input.jz=aim.y;}else aim=null;
    const jump=clock>=jumpGap&&(clock<jumpUntil||[...pointers.values()].some(p=>p.role==='gesture'&&p.state==='jumping'));
    const dash=clock>=dashGap&&clock<dashUntil;
    if(jump&&!input.jump)input.jumpEdge=true;
    if(dash&&!input.dodge)input.dodgeEdge=true;
    input.jump=jump;input.dodge=dash;
   }
   drawStick();
  }
  function down(e,role){
   if(e.pointerType==='mouse'||!active())return;
   e.preventDefault();api.fullscreen?.();
   if(role==='gesture'&&preset()!=='smooth')return;
   if(role==='stick'&&stick)return;
   const p={role,x0:e.clientX,y0:e.clientY,x:e.clientX,y:e.clientY,t0:clock,state:'pending',dashed:false};
   pointers.set(e.pointerId,p);
   if(role==='stick'){
    const fixed=api.fixedStick?.(),layout=api.stickLayout?.();
    stick={id:e.pointerId,x:e.clientX,y:e.clientY,ox:fixed?layout.x:e.clientX,oy:fixed?layout.y:e.clientY};
   }
   try{e.currentTarget?.setPointerCapture(e.pointerId);}catch{}
   sync();
  }
  function move(e){
   const p=pointers.get(e.pointerId);if(!p)return;e.preventDefault();
   p.x=e.clientX;p.y=e.clientY;
   if(p.role==='stick'&&stick){
    stick.x=p.x;stick.y=p.y;
    const dx=p.x-stick.ox,dy=p.y-stick.oy,d=Math.hypot(dx,dy),r=radius();
    if(d>r&&!api.fixedStick?.()){stick.ox=p.x-dx/d*r;stick.oy=p.y-dy/d*r;}
   }else step(p);
   sync();
  }
  function end(e,canceled=false){
   const p=pointers.get(e.pointerId);if(!p)return;e.preventDefault?.();
   pointers.delete(e.pointerId);
   if(p.role==='stick'){
    stick=null;
    if(!canceled&&preset()==='smooth'&&clock-p.t0<.2&&Math.hypot(p.x-p.x0,p.y-p.y0)<12)beginJump();
   }else if(!canceled&&p.state==='pending')beginJump();
   sync();
  }
  function tick(dt){
   clock+=Math.max(0,Math.min(.1,dt||0));
   if(lastPreset!==preset()){releaseAll();lastPreset=preset();api.changed?.(lastPreset);}
   if(!active()){releaseAll();return;}
   for(const p of pointers.values())if(p.role==='gesture')step(p);
   sync();
  }
  for(const [element,role] of [[api.zone,'stick'],[api.gestureZone,'gesture']]){
   element.addEventListener('pointerdown',e=>down(e,role));
   element.addEventListener('pointermove',move);
   element.addEventListener('pointerup',e=>end(e));
   for(const kind of ['pointercancel','lostpointercapture'])element.addEventListener(kind,e=>end(e,true));
   element.addEventListener('contextmenu',e=>e.preventDefault());
  }
  root.addEventListener?.('blur',releaseAll);
  root.addEventListener?.('resize',releaseAll);
  root.document?.addEventListener('visibilitychange',()=>{if(root.document.hidden)releaseAll();});
  lastPreset=preset();api.changed?.(lastPreset);
  return {tick,releaseAll,preset,down,move,end,state:()=>({preset:preset(),pointers:pointers.size,stick:!!stick,clock,aim:aim?{...aim}:null})};
 }
 root.BladefallExploreTouch={create};
})(typeof window==='undefined'?globalThis:window);
