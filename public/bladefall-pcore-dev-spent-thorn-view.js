/* Persistent marked stone, with folded safe hairs, a departure warning, and raised lethal teeth.
   The continuous armed edge is the exact three-pixel collision strip; colour is reinforced by shape. */
(function(root){
'use strict';
function draw(b,g){
 b.save();
 for(const e of g.ents){
  if(e.type!=='spentThorn')continue;
  b.fillStyle='#283b3a';b.fillRect(e.x,e.y,e.w,e.h);b.strokeStyle='#708e85';b.lineWidth=1;b.strokeRect(e.x+.5,e.y+.5,e.w-1,e.h-1);
  b.fillStyle='#425950';for(let y=e.y+3;y<e.y+e.h-2;y+=8)for(let x=e.x+3;x<e.x+e.w-2;x+=8)b.fillRect(x,y,2,2);
  const horizontal=e.face==='up'||e.face==='down',len=horizontal?e.w:e.h;
  const nx=e.face==='left'?-1:e.face==='right'?1:0,ny=e.face==='up'?-1:e.face==='down'?1:0;
  const ox=e.face==='right'?e.x+e.w:e.x,oy=e.face==='down'?e.y+e.h:e.y;
  const armed=e.state==='armed',warning=e.state==='arming',pressed=e.state==='contact',k=warning?1-e.remaining/e.arm:0;
  const col=armed?'#fa8890':warning?(k>.5?'#ffc586':'#e3b86f'):pressed?'#e9ddae':'#8eb7a0';
  b.strokeStyle=col;b.fillStyle=col;b.lineWidth=1;
  // A boxed endpoint and consistent stripe identify the entire spent face before it activates.
  b.beginPath();b.moveTo(ox+.5,oy+.5);b.lineTo(ox+(horizontal?len:0)+.5,oy+(horizontal?0:len)+.5);b.stroke();
  for(let n=2;n<len-1;n+=4){
   const x=ox+(horizontal?n:0),y=oy+(horizontal?0:n),height=armed?3:warning?1+2*k:pressed?0:1;
   b.beginPath();b.moveTo(x-(horizontal?1:0),y-(horizontal?0:1));b.lineTo(x+nx*height,y+ny*height);b.lineTo(x+(horizontal?1:0),y+(horizontal?0:1));b.stroke();
  }
  if(warning){b.globalAlpha=.45;b.fillRect(ox+nx*4-1,oy+ny*4-1,2,2);b.fillRect(ox+(horizontal?len:0)+nx*4-1,oy+(horizontal?0:len)+ny*4-1,2,2);b.globalAlpha=1;}
  if(armed){b.globalAlpha=.28;const s=root.BladefallPrecisionSpentThorn.strip(e);b.fillRect(...s);b.globalAlpha=1;}
 }
 b.restore();
}
function event(e,{burst}){if(e.type==='spent-thorn-leave')burst(e.x,e.y,4,'#e3b86f',18,12);else if(e.type==='spent-thorn-arm')burst(e.x,e.y,3,'#fa8890',15,8);}
const sfx={'spent-thorn-leave':(e,{tone})=>tone(250,.08,'triangle',.025),'spent-thorn-arm':(e,{noise})=>noise(.045,.02,1100)};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'spent-thorn',draw,event,sfx});
})(typeof window!=='undefined'?window:globalThis);
