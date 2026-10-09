/* Step relays: brass foot plates, lettered groups, ghost destinations and a visible travel rail. */
(function(root){
'use strict';
const COLORS=['#e8b95d','#91d9cb','#d9a6e8','#9fbded'];
const color=e=>COLORS[e.group%COLORS.length];
const px=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
function drawBack(b,g){
 b.save();
 for(const e of g.ents){
  if(e.type!=='stepRelay')continue;
  const ax=e.ox,ay=e.oy,bx=ax+e.relayDX,by=ay+e.relayDY;
  b.strokeStyle=color(e);b.lineWidth=1;b.globalAlpha=.25;b.setLineDash([1,3]);
  b.beginPath();b.moveTo(ax+e.w/2+.5,ay+e.h/2+.5);b.lineTo(bx+e.w/2+.5,by+e.h/2+.5);b.stroke();
  // Both endpoint outlines remain visible. The current destination is brighter and carries a small dot.
  for(let k=0;k<2;k++){
   const x=k?bx:ax,y=k?by:ay;
   b.globalAlpha=k===e.target?.45:.18;b.setLineDash([2,2]);b.strokeRect(Math.round(x)+.5,Math.round(y)+.5,e.w-1,e.h-1);
   if(k===e.target){b.globalAlpha=.6;px(b,x+e.w/2-1,y+e.h/2-1,2,2,color(e));}
  }
 }
 b.restore();
}
function draw(b,g){
 b.save();
 for(const e of g.ents){
  if(e.type!=='stepRelay')continue;
  const c=color(e),cx=e.x+e.w/2,cy=e.y+e.h/2;
  px(b,e.x,e.y,e.w,e.h,'#3a3030');px(b,e.x,e.y,e.w,2,e.pulse>0?'#fff1b8':c);
  px(b,e.x,e.y+e.h-1,e.w,1,'#181923');
  for(let x=e.x+3;x<e.x+e.w-2;x+=8)px(b,x,e.y+3,2,2,'#776044');
  // A boxed letter keeps independent groups readable without relying on colour alone.
  b.font='bold 6px monospace';b.textAlign='center';b.textBaseline='middle';
  px(b,cx-4,cy-3,8,6,'#28252b');b.fillStyle=e.pulse>0?'#fff1b8':c;b.fillText(e.label.slice(0,1),Math.round(cx),Math.round(cy)+.5);
  // A chevron travels with the body and points to its actual destination, including a midflight reversal.
  const tx=e.ox+e.relayDX*e.target,ty=e.oy+e.relayDY*e.target,dx=tx-e.x,dy=ty-e.y;
  if(Math.abs(dx)+Math.abs(dy)>1){
   const len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len,ax=cx+ux*7,ay=e.y-4+uy*2;
   b.strokeStyle=c;b.lineWidth=1;b.beginPath();b.moveTo(ax-ux*3-uy*2,ay-uy*3+ux*2);b.lineTo(ax,ay);b.lineTo(ax-ux*3+uy*2,ay-uy*3-ux*2);b.stroke();
  }
 }
 b.restore();
}
function event(e,{burst}){if(e.type==='step-relay')burst(e.x,e.y,7,COLORS[e.group%COLORS.length],32,12);}
const sfx={'step-relay':(e,{tone,noise})=>{noise(.035,.025,1200);tone(e.target?540:390,.09,'triangle',.035);}};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'step-relay',drawBack,draw,event,sfx});
})(typeof window!=='undefined'?window:globalThis);
