/* Visible persistent architecture made by the Fractured arena bosses. */
(function(root){'use strict';
const px=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
function draw(b,g){
 for(const e of g.ents){if(e.type!=='superRest')continue;px(b,e.x,e.y,e.w,e.h,'#6a635d');px(b,e.x,e.y,e.w,2,'#d4bf83');for(let x=e.x+4;x<e.x+e.w;x+=8)px(b,x,e.y+4,3,2,'#403e43');}
 const a=g.superFractured;if(!a)return;const d=a.d;
 if(d.kind==='sentinel'&&a.stage){
  const q=g.room.def.sentinel,x=q.c*8,y=q.r*8;
  px(b,x+3,0,1,y,'#544d45');px(b,x,y,8,7,'#746650');px(b,x+2,y+7,4,2,'#8d7f64');
  // The spent low bell stays visible; its leftward brass sign points back to the rest.
  px(b,x-14,y+2,9,2,'#cfb77b');px(b,x-14,y,2,6,'#cfb77b');px(b,x-16,y+2,2,2,'#cfb77b');
 }
 if(d.kind==='frost'){
  const q=d.sluice,x=q.c*8,y=q.r*8;
  px(b,x+2,y+6,4,8,'#64553e');px(b,x-2,y-2,12,12,'#7a5e34');px(b,x,y,8,8,'#d4b16a');px(b,x+2,y+2,4,4,a.stage?'#423e38':'#88cfee');
  if(a.stage){px(b,x-1,y+3,10,2,'#f2d99a');px(b,x+7,y+2,2,4,'#f2d99a');}
  else {px(b,x+3,y-3,2,14,'#f2d99a');px(b,x+2,y-3,4,2,'#f2d99a');}
  // Pipe points at the actual spillway; its empty gauge changes with the water.
  px(b,x+12,y+1,5,10,'#7a5e34');px(b,x+13,y+2,3,8,a.stage?'#302e35':'#88cfee');
 }
 if(d.kind==='marksman')d.stations.forEach((q,i)=>{
  const x=q.c*8,y=q.r*8,w=q.w*8,used=a.stage>i,ready=g.mk&&g.mk.hits>i;
  px(b,x,y-2,w,3,used?'#75b9ad':ready?'#e4c888':'#736953');
  for(let k=5;k<w-4;k+=12){px(b,x+k,y-1,6,1,'#37353c');px(b,x+k+3,y-(used?1:4),3,1,used?'#b8e5d7':ready?'#f9e0a4':'#988264');}
  // A short upward pointing signal marks the carrier's next tier.
  px(b,x+w-4,y-10,2,7,used?'#75b9ad':'#b9a276');px(b,x+w-6,y-9,6,1,used?'#b8e5d7':'#b9a276');
 });
}
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'superrooms-fractured',draw});
})(typeof window!=='undefined'?window:globalThis);
