/* Recoil plate: the bright horizontal lip is the solid body; dotted rails show its full travel.
   Amber compression bars fill under weight. Cyan rising arrows mark the chosen release window. */
(function(root){
'use strict';
function drawBack(b,g){const R=root.BladefallPrecisionRecoil;if(!R)return;b.save();b.lineWidth=1;
 for(const e of R.platforms(g)){const y0=e.oy+e.h/2,y1=y0+e.axis*e.depth;
  b.strokeStyle='#747382';b.globalAlpha=.55;b.setLineDash([1,3]);for(const x of[e.x+3,e.x+e.w-3]){b.beginPath();b.moveTo(x+.5,y0);b.lineTo(x+.5,y1);b.stroke();}b.setLineDash([]);
  const anchor=e.oy+e.axis*e.depth+e.h/2;b.strokeStyle='#bda477';b.globalAlpha=.7;
  for(const x of[e.x+e.w*.3,e.x+e.w*.7]){b.beginPath();b.moveTo(x,e.y+e.h/2);for(let i=1;i<=6;i++)b.lineTo(x+(i%2?2:-2),e.y+e.h/2+(anchor-e.y-e.h/2)*i/6);b.stroke();}
  b.strokeStyle='#747382';b.beginPath();b.moveTo(e.x+1,anchor);b.lineTo(e.x+e.w-1,anchor);b.stroke();
 }b.restore();}
function draw(b,g){const R=root.BladefallPrecisionRecoil;if(!R)return;b.save();
 for(const e of R.platforms(g)){const c=e.jammed?'#f28179':e.state==='release'?'#a4edee':e.state==='load'?'#f1c572':'#c4b18c';
  b.fillStyle='#222a32';b.fillRect(e.x,e.y,e.w,e.h);b.fillStyle='#666472';b.fillRect(e.x+1,e.y+2,e.w-2,e.h-3);b.fillStyle=c;b.fillRect(e.x,e.y,e.w,2);
  for(let i=0;i<Math.floor(e.w/6);i++){b.fillStyle=i<Math.round(e.charge/e.depth*Math.floor(e.w/6))?c:'#333844';b.fillRect(e.x+2+i*6,e.y+4,3,2);}
  b.strokeStyle=c;b.lineWidth=1;const x=e.x+e.w/2,y=e.y-5,s=e.state==='release'?-1:1;b.beginPath();b.moveTo(x-3,y-s*2);b.lineTo(x,y+s);b.lineTo(x+3,y-s*2);b.stroke();
 }b.restore();}
function event(e,{burst}){if(e.type==='recoil-release')burst(e.x,e.y,4,'#a4edee',20,9);else if(e.type==='recoil-jump')burst(e.x,e.y,5,'#f1c572',26,10);}
const sfx={'recoil-load':(e,{tone})=>tone(160,.08,'triangle',.02,-30),'recoil-release':(e,{tone})=>tone(260,.12,'triangle',.028,180),'recoil-jump':(e,{tone})=>tone(420,.09,'triangle',.025,150)};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'recoil',drawBack,draw,event,sfx});
})(typeof window!=='undefined'?window:globalThis);
