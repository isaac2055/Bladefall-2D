/* Precision Core — light, drawing (7.254). A beam is a hot white core in a gold glow; emitters are sun
   windows set in the rock. Mirrors are silvered slants on a brass pivot. Shutters are louvres: slats open
   edge-on or shut flat, with a row of pips counting to the next change. */
(function(root){
'use strict';
const px=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
function drawFront(b,g){
 if(!g.beams)return;const t=g.frame;
 for(const [x0,y0,x1,y1]of g.beams.paths){
  b.globalAlpha=.35+.1*Math.sin(t/5);b.strokeStyle='#ffd05a';b.lineWidth=5;b.beginPath();b.moveTo(x0+.5,y0+.5);b.lineTo(x1+.5,y1+.5);b.stroke();
  b.globalAlpha=1;b.strokeStyle='#fffbe8';b.lineWidth=1;b.beginPath();b.moveTo(x0+.5,y0+.5);b.lineTo(x1+.5,y1+.5);b.stroke();
 }
 b.lineWidth=1;
 for(const em of g.beams.emit){const x=em.c*8,y=em.r*8;px(b,x,y,8,8,'#fff2b0');px(b,x+2,y+2,4,4,'#ffffff');}
}
function draw(b,g){
 const t=g.frame;
 for(const e of g.ents){
  if(e.type==='mirror'){px(b,e.x+3,e.y+3,2,2,'#b08a3a');b.strokeStyle=e.timer>0?'#ffffff':'#d8e4f0';b.lineWidth=2;b.beginPath();
   if(e.slant==='/'){b.moveTo(e.x+1,e.y+7);b.lineTo(e.x+7,e.y+1);}else{b.moveTo(e.x+1,e.y+1);b.lineTo(e.x+7,e.y+7);}b.stroke();b.lineWidth=1;}
  else if(e.type==='shutter'){
   for(let y=e.y;y<e.y+e.h;y+=3){if(e.open)px(b,e.x,y,e.w,1,'#5a4a3a');else px(b,e.x,y,e.w,3,y%6?'#8a6a4a':'#6a4e36');}
   const cyc=e.beat.open+e.beat.shut,clock=g.beams?g.beams.clock:g.roomFrame,k=((clock+e.beat.offset)%cyc+cyc)%cyc,left=e.open?e.beat.open-k:cyc-k,n=Math.min(6,Math.ceil(left/15));
   for(let i=0;i<n;i++)px(b,e.x+1+i*3,e.y-3,2,2,e.open?'#6a4e36':'#ffd05a');
  }
 }
}
function event(e,{burst}){if(e.type==='mirror')burst(e.x,e.y,6,'#ffffff',40,12);}
const sfx={mirror:(e,{tone})=>tone(1040,.1,'triangle',.03),'shutter-shut':(e,{noise})=>noise(.06,.02,900),'shutter-open':(e,{noise})=>noise(.05,.015,1500)};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'beam',draw,drawFront,event,sfx});
})(typeof window!=='undefined'?window:globalThis);
