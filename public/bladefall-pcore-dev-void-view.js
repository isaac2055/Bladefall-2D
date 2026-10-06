/* Precision Core — void stone, drawing (7.255). A slab of the gate walls' night: near-black violet with slow
   stars and a pale rim, so it reads as "not rock" at a glance. A knight inside it is a bright streak with a
   tail of stars; he bursts out of the far face in a ring. */
(function(root){
'use strict';
const px=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
const hash=(x,y)=>{let h=(x*374761393+y*668265263)^0x5bd1e995;h=(h^(h>>>13))*1274126177;return ((h^(h>>>16))>>>0)/4294967295;};
function draw(b,g){
 const t=g.frame;
 for(const e of g.ents){
  if(e.type!=='void')continue;
  px(b,e.x,e.y,e.w,e.h,'#0b0714');
  // Stars drift slowly left; each twinkles on its own beat.
  for(let yy=0;yy<e.h;yy+=4)for(let xx=0;xx<e.w;xx+=4){
   const h=hash(e.x+xx,e.y+yy);if(h>.22)continue;
   const sx=e.x+((xx+Math.floor(t/(12+h*40)))%e.w),on=((t+Math.floor(h*97))>>4)&1;
   px(b,sx,e.y+yy+Math.floor(h*4),1,1,on?'#d8c8ff':'#5a4a8a');
  }
  // Pale rim that breathes.
  b.globalAlpha=.55+.25*Math.sin(t/20);
  px(b,e.x,e.y,e.w,1,'#b8a0ff');px(b,e.x,e.y+e.h-1,e.w,1,'#6a50b0');px(b,e.x,e.y,1,e.h,'#8a70d8');px(b,e.x+e.w-1,e.y,1,e.h,'#8a70d8');
  b.globalAlpha=1;
 }
}
function drawFront(b,g){
 const p=g.p,V=g.voidTravel;
 if(!V||p.state!=='void')return;
 const s=Math.hypot(V.vx,V.vy)||1,dx=V.vx/s,dy=V.vy/s;
 for(let k=1;k<7;k++){b.globalAlpha=.5-k*.06;px(b,p.x+3-dx*k*3,p.y+4-dy*k*3,2,2,'#d8c8ff');}
 b.globalAlpha=1;px(b,p.x+1,p.y+2,6,7,'#f4eeff');px(b,p.x+3,p.y+4,2,3,'#ffffff');
}
function event(e,{burst,shake}){
 if(e.type==='void-in')burst(e.x,e.y,10,'#8a70d8',50,16);
 else if(e.type==='void-out'){burst(e.x,e.y,18,'#d8c8ff',90,20);shake(1,4);}
}
const sfx={'void-in':(e,{tone})=>tone(220,.18,'sine',.05,220),'void-out':(e,{tone})=>{tone(660,.14,'triangle',.04,-200);tone(990,.1,'sine',.02,0,.04);}};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'void',draw,drawFront,event,sfx});
})(typeof window!=='undefined'?window:globalThis);
