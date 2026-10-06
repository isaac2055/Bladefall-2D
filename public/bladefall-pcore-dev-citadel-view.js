/* Precision Core — the Citadel, drawing (7.254). A spent foothold is pale masonry with a crack down its face;
   once you have stood on it the crack glows, and when you leave it crumbles away. */
(function(root){
'use strict';
const px=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
function draw(b,g){
 for(const e of g.ents){
  if(e.type!=='foothold'||e.gone)continue;
  px(b,e.x,e.y,e.w,e.h,'#8a8274');px(b,e.x,e.y,e.w,1,'#d8cfbc');px(b,e.x,e.y+e.h-1,e.w,1,'#5a5448');
  const col=e.used?((g.frame>>2)&1?'#ffcf6a':'#c98a3a'):'#4a4438';
  for(let x=e.x+3;x<e.x+e.w-2;x+=8){px(b,x,e.y+1,1,2,col);px(b,x+1,e.y+3,1,2,col);px(b,x,e.y+5,1,e.h-6>0?e.h-6:1,col);}
 }
}
function event(e,{view}){
 if(e.type==='foothold-spent'){for(let i=0;i<(e.w/3|0);i++)view.parts.push({x:e.x-e.w/2+Math.random()*e.w,y:e.y,vx:(Math.random()-.5)*20,vy:Math.random()*20,life:30,max:30,col:'#8a8274',grav:300,size:2});}
}
const sfx={'foothold-spent':(e,{noise})=>noise(.2,.05,300)};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'citadel',draw,event,sfx});
})(typeof window!=='undefined'?window:globalThis);
