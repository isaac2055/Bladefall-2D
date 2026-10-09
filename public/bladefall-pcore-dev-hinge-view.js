/* Hinged arms: the solid outline is the collision body. Faint alternatives show the four poses;
   a brass hub and clockwise arrow identify the part to strike. Red hatching means a turn jammed. */
(function(root){
'use strict';
const COLORS=['#e0b878','#9dd1c4','#c1b0e4','#b5c7e3'];
const color=e=>COLORS[e.group%COLORS.length];
const px=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
function drawBack(b,g){
 const H=root.BladefallPrecisionHinge;if(!H)return;
 b.save();b.lineWidth=1;
 for(const e of H.arms(g)){
  const next=H.nextDir(g,e);
  for(const dir of H.DIRS){
   if(dir===e.dir)continue;
   const q=H.pose(e,dir),isNext=dir===next;
   b.strokeStyle=e.jam&&isNext?'#ff887c':color(e);b.globalAlpha=e.jam&&isNext?.7:isNext?.26:.12;
   b.setLineDash(isNext?[2,2]:[1,3]);b.strokeRect(q.x+.5,q.y+.5,q.w-1,q.h-1);
   const tx=dir==='right'?q.x+q.w-4:dir==='left'?q.x+4:e.pivotX+4;
   const ty=dir==='down'?q.y+q.h-4:dir==='up'?q.y+4:e.pivotY+4;
   b.setLineDash([]);b.strokeRect(tx-2.5,ty-2.5,5,5);
   if(e.jam&&isNext){b.beginPath();b.moveTo(tx-2,ty-2);b.lineTo(tx+2,ty+2);b.moveTo(tx+2,ty-2);b.lineTo(tx-2,ty+2);b.stroke();}
  }
 }
 b.restore();
}
function draw(b,g){
 const H=root.BladefallPrecisionHinge;if(!H)return;
 b.save();
 for(const e of H.arms(g)){
  const c=e.jam?'#ee8875':e.pulse?'#fff0c4':color(e),horizontal=e.w>e.h,cx=e.pivotX+4,cy=e.pivotY+4;
  px(b,e.x,e.y,e.w,e.h,'#242a32');px(b,e.x+1,e.y+1,e.w-2,e.h-2,'#687079');
  if(horizontal){
   px(b,e.x+1,e.y+1,e.w-2,1,c);px(b,e.x+1,e.y+e.h-2,e.w-2,1,'#3a4047');
   for(let x=e.x+7;x<e.x+e.w-1;x+=8)px(b,x,e.y+2,1,e.h-4,'#3e4650');
  }else{
   px(b,e.x+1,e.y+1,1,e.h-2,c);px(b,e.x+e.w-2,e.y+1,1,e.h-2,'#3a4047');
   for(let y=e.y+7;y<e.y+e.h-1;y+=8)px(b,e.x+2,y,e.w-4,1,'#3e4650');
  }
  // Hub lettering stays upright after a gravity flip; the world-space arrow flips its winding too.
  px(b,e.pivotX,e.pivotY,8,8,c);px(b,e.pivotX+1,e.pivotY+1,6,6,'#292b32');
  b.save();b.translate(cx,cy);if(g.flipped)b.scale(1,-1);
  b.font='bold 6px monospace';b.textAlign='center';b.textBaseline='middle';b.fillStyle=c;b.fillText(e.label.slice(0,1),0,.5);
  if(e.jam){b.font='bold 5px monospace';b.fillText('JAM',0,-10);}
  b.restore();
  const s=g.flipped?-1:1,a0=-Math.PI*.8,a1=a0+s*Math.PI*1.35,rr=7;
  b.strokeStyle=c;b.lineWidth=1;b.globalAlpha=e.jam||e.pulse?1:.8;
  b.beginPath();b.arc(cx,cy,rr,a0,a1,s<0);b.stroke();
  const x=cx+Math.cos(a1)*rr,y=cy+Math.sin(a1)*rr,dx=-Math.sin(a1)*s,dy=Math.cos(a1)*s;
  b.beginPath();b.moveTo(x-dx*3-dy*2,y-dy*3+dx*2);b.lineTo(x,y);b.lineTo(x-dx*3+dy*2,y-dy*3-dx*2);b.stroke();b.globalAlpha=1;
 }
 b.restore();
}
function event(e,{burst}){if(e.type==='hinge-turn')burst(e.x,e.y,5,'#e0b878',24,10);else if(e.type==='hinge-jam')burst(e.x,e.y,3,'#ee8875',18,8);}
const sfx={
 'hinge-turn':(e,{tone,noise})=>{noise(.05,.025,700);tone(420,.09,'triangle',.03,-120);},
 'hinge-jam':(e,{tone,noise})=>{noise(.04,.02,1600);tone(130,.07,'square',.018);}
};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'hinge',drawBack,draw,event,sfx});
})(typeof window!=='undefined'?window:globalThis);
