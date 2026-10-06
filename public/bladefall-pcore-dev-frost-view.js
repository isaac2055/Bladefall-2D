/* Precision Core — Frostfell, drawing (7.254). Ice is a pale glaze over the rock with bright streaks, so a
   slippery floor reads at a glance. Wind is a field of drifting streaks moving the way it blows. The frost
   feather is a pale blue quill; carried, it rides on the knight's helm as a second, icy plume. */
(function(root){
'use strict';
const TILE=8,COLS=40,ROWS=23;
const px=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
const hash=(x,y)=>{let h=(x*374761393+y*668265263)^0x5bd1e995;h=(h^(h>>>13))*1274126177;return ((h^(h>>>16))>>>0)/4294967295;};
function drawBack(b,g){
 const room=g.room,t=g.frame;
 const COLS=room.cols||40,ROWS=room.rows||23;
 if(room.ice)for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
  if(!room.ice[r*COLS+c])continue;const x=c*TILE,y=r*TILE;
  px(b,x,y,8,8,'#9fc6d8');px(b,x,y,8,1,'#eefaff');px(b,x+1,y+1,6,1,'#cfeaf5');
  const h=hash(c,r);px(b,x+(h*5|0),y+3+(h*3|0),3,1,'#e6f6ff');px(b,x+1,y+7,7,1,'#6f97aa');
  if((t+c*11)%90<3)px(b,x+(h*7|0),y+1,1,1,'#ffffff');
 }
 for(const z of g.winds||[]){
  b.globalAlpha=.1;px(b,z.x,z.y,z.w,z.h,'#cfe8ff');b.globalAlpha=.5;
  const n=Math.max(3,(z.w*z.h)/160|0),sp=Math.hypot(z.dx,z.dy)||1,ux=z.dx/sp,uy=z.dy/sp;
  for(let i=0;i<n;i++){
   const ph=(t*sp/60+hash(i,z.x)*400)%400;
   const x=z.x+((hash(i,7)*z.w+ux*ph)%z.w+z.w)%z.w,y=z.y+((hash(i,3)*z.h+uy*ph)%z.h+z.h)%z.h;
   px(b,x,y,Math.max(1,Math.abs(ux)*4|0),Math.max(1,Math.abs(uy)*4|0),'#e9f4ff');
  }
  b.globalAlpha=1;
 }
}
function draw(b,g){
 const t=g.frame;
 for(const e of g.ents){
  if(e.type!=='feather')continue;
  if(e.timer>0){b.strokeStyle='#4d6f86';b.beginPath();b.moveTo(e.x+2.5,e.y+7.5);b.lineTo(e.x+6.5,e.y+1.5);b.stroke();continue;}
  const bob=Math.round(Math.sin(t/12+e.x)*1.5),x=e.x,y=e.y+bob;
  px(b,x+5,y,2,2,'#e9f7ff');px(b,x+4,y+1,2,3,'#bfe4ff');px(b,x+3,y+3,2,3,'#8fcaf2');px(b,x+2,y+5,2,2,'#6aaee0');px(b,x+1,y+7,1,1,'#e9f7ff');
  if(t%36<3)px(b,x+7,y,1,1,'#ffffff');
 }
}
function drawFront(b,g){
 const p=g.p;if(!(p.airJumps>0)||p.state==='dead')return;
 const t=g.frame;px(b,p.x+(p.facing>0?1:5),p.y-4+((t>>3)&1),2,3,'#bfe4ff');px(b,p.x+(p.facing>0?1:5),p.y-5,1,1,'#ffffff');
}
function event(e,{burst,dust}){
 switch(e.type){
  case 'feather':burst(e.x,e.y,10,'#bfe4ff',45,22);break;
  case 'feather-jump':burst(e.x,e.y,10,'#e9f7ff',50,18,40);break;
  case 'feather-melt':burst(e.x,e.y,4,'#8fcaf2',20,14);break;
 }
}
const sfx={feather:(e,{tone})=>{tone(990,.12,'triangle',.04);tone(1320,.14,'sine',.03,0,.05);},
 'feather-jump':(e,{tone,noise})=>{noise(.08,.03,3000);tone(740,.1,'triangle',.04,300);}};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'frost',drawBack,draw,drawFront,event,sfx});
})(typeof window!=='undefined'?window:globalThis);
