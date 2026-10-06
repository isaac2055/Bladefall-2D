/* Precision Core — Inversion, drawing (7.254). A gravity prism is a violet crystal with a small chevron that
   points the way you will fall after passing it. While gravity is turned over, a thin violet line runs along the
   top of the screen, the new floor. (The main view draws a flipped room upside down, so the room itself
   stays where it was and the knight stands on the ceiling.) */
(function(root){
'use strict';
const px=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
function draw(b,g){
 const t=g.frame;
 for(const e of g.ents){
  if(e.type!=='prism')continue;
  const x=e.x,y=e.y,cx=x+e.w/2,glow=e.armed?1:.4;
  b.globalAlpha=.2*glow;px(b,x-2,y-2,e.w+4,e.h+4,'#c9a0ff');b.globalAlpha=glow;
  b.fillStyle='#8a5cd6';b.beginPath();b.moveTo(cx,y);b.lineTo(x+e.w,y+e.h/2);b.lineTo(cx,y+e.h);b.lineTo(x,y+e.h/2);b.closePath();b.fill();
  px(b,cx-1,y+2,2,e.h-4,'#e8d8ff');
  // A small chevron over the crystal points to where "down" will be after a pass: away from the current
  // floor (sim-up; under a flipped view that is screen-down). It bobs toward the way you will fall.
  const k=(t>>4)&1,ay=y-4-k;px(b,cx-1,ay,2,1,'#ffffff');px(b,cx-2,ay+1,1,1,'#ffffff');px(b,cx+1,ay+1,1,1,'#ffffff');
  b.globalAlpha=1;
 }
}
function drawFront(b,g){
 if(!g.flipped)return;
 // Under the view's flip, sim y = 183 is the top of the screen.
 b.globalAlpha=.55;px(b,0,183,320,1,'#b98cff');b.globalAlpha=1;
}
function event(e,{burst,shake}){if(e.type==='gravity'){burst(e.x,e.y,24,'#c9a0ff',80,26);shake(2,8);}}
const sfx={gravity:(e,{tone})=>{tone(e.flipped?300:600,.3,'sine',.05,e.flipped?300:-300);tone(900,.2,'triangle',.02,0,.05);}};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'gravity',draw,drawFront,event,sfx});
})(typeof window!=='undefined'?window:globalThis);
