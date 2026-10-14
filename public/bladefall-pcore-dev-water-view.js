/* Precision Core — water, drawing (7.254). Water is translucent blue with a bright, moving surface line;
   currents show as drifting flecks. A frozen pool is pale ice with a row of ticks along its top that go
   out one by one as it thaws. A condenser is a frost-rimed brass coil. The tide draws its whole sea, its
   high and low marks on the rock, and floats as lashed planks. */
(function(root){
'use strict';
const TILE=8;
const px=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
function drawBack(b,g){
 const w=g.water;if(!w)return;
 const W=root.BladefallPrecisionWater,t=g.frame,room=g.room,COLS=room.cols,ROWS=room.rows;
 // pools
 for(const pool of w.pools){
  const frozen=pool.frozen>0;
  for(const i of pool.cells){
   const c=i%COLS,r=(i/COLS)|0,x=c*TILE,y=r*TILE,top=r>0&&!w.cells[i-COLS]&&room.grid[i-COLS]!==1;   // no surface line against a rock ceiling
   if(frozen&&room.grid[i]){px(b,x,y,8,8,'#a9d3e3');px(b,x,y,8,1,'#effbff');px(b,x+1+((c*5+r)%5),y+3,3,1,'#e3f5fb');px(b,x,y+7,8,1,'#7aa7ba');continue;}
   b.globalAlpha=.45;px(b,x,y,8,8,'#2f6f9f');b.globalAlpha=1;
   if(top){const k=Math.round(Math.sin((t+c*9)/10));px(b,x,y+1+k,8,1,'#9fd7ff');if((t+c*13)%70<4)px(b,x+3,y+k,2,1,'#ffffff');}
  }
  if(frozen){
   // thaw clock: ticks along the top of the ice, going out as it thaws
   const tops=pool.cells.filter(i=>!(i>=COLS&&pool.cells.includes(i-COLS))).sort((a,b)=>a-b);
   const n=tops.length*2,k=Math.ceil(pool.frozen/w.thaw*n);
   tops.forEach((i,j)=>{const x=(i%COLS)*TILE,y=((i/COLS)|0)*TILE;for(let h=0;h<2;h++){const lit=j*2+h<k;px(b,x+1+h*4,y-2,2,1,lit?(pool.frozen<60&&(t>>2)&1?'#ff9a6a':'#e8fbff'):'#40606e');}});
  }
 }
 // tide (7.336: every sea in the room)
 for(const tide of w.tides||(w.tide?[w.tide]:[])){
  const sy=W.surfaceY(g,tide),x0=tide.c0*TILE,x1=(tide.c1+1)*TILE;
  for(let r=Math.max(Math.floor(sy/TILE),tide.r0??0);r<=Math.min(ROWS-1,tide.r1??ROWS-1);r++)for(let c=tide.c0;c<=tide.c1;c++){
   if(room.grid[r*COLS+c]===1)continue;const y0=Math.max(r*TILE,sy);b.globalAlpha=.42;px(b,c*TILE,y0,8,(r+1)*TILE-y0,'#23628f');b.globalAlpha=1;}
  for(let x=x0;x<x1;x+=2){const k=Math.round(Math.sin((t+x)/9));px(b,x,sy+k,2,1,'#a8dcff');}
  // Optional local sight glass: shows the same tide when the basin is below the camera.
  const gauge=room.def.tideGauge;
  if(gauge){
   const x=gauge.c*TILE,y=gauge.r*TILE,h=(gauge.h||3)*TILE;
   const top=Math.min(tide.high,tide.low)*TILE,bottom=Math.max(tide.high,tide.low)*TILE;
   const fill=Math.max(0,Math.min(1,(bottom-sy)/Math.max(1,bottom-top))),level=y+h-2-Math.round(fill*(h-4));
   px(b,x,y,7,h,'#607584');px(b,x+1,y+1,5,h-2,'#192c3b');
   px(b,x+2,level,3,y+h-1-level,'#4c9bbc');
   for(let mark=2;mark<h-1;mark+=5)px(b,x+5,y+mark,2,1,'#cad9df');
   px(b,x+1,level-1,5,2,'#c49b63');px(b,x+2,level-1,3,1,'#f0d29a');
  }
  // high and low water marks on the left wall of the sea
  px(b,x0,tide.high*TILE,3,1,'#e8d8a0');px(b,x0,tide.low*TILE,3,1,'#8aa0b0');
 }
 for(const z of w.currents){
  b.globalAlpha=.6;const sp=Math.hypot(z.dx,z.dy)||1,ux=z.dx/sp,uy=z.dy/sp,n=Math.max(2,(z.w*z.h)/200|0);
  for(let i=0;i<n;i++){const ph=(t*sp/60+i*37)%200,x=z.x+((i*53+ux*ph)%z.w+z.w)%z.w,y=z.y+((i*29+uy*ph)%z.h+z.h)%z.h;px(b,x,y,2,1,'#cfeeff');}
  b.globalAlpha=1;
 }
}
function draw(b,g){
 const t=g.frame;
 for(const e of g.ents){
  if(e.type==='condenser'){const x=e.x,y=e.y,hot=e.timer>0;
   px(b,x+1,y+1,6,6,hot?'#e8fbff':'#8a6a3a');px(b,x+2,y+2,4,4,'#c9a25a');px(b,x+3,y,2,8,'#d9f2ff');px(b,x,y+3,8,2,'#d9f2ff');
   if(t%50<3)px(b,x+6,y+1,1,1,'#ffffff');}
  else if(e.type==='float'){px(b,e.x,e.y,e.w,e.h,'#6b4e2e');for(let x=e.x;x<e.x+e.w;x+=4)px(b,x,e.y,1,e.h,'#4a3520');px(b,e.x,e.y,e.w,1,'#b08a5a');px(b,e.x+2,e.y+e.h-2,e.w-4,1,'#8fb0c0');}
 }
}
function event(e,{burst}){
 switch(e.type){
  case 'splash':burst(e.x,e.y,8,'#9fd7ff',40,16,120);break;
  case 'freeze':burst(e.x,e.y,20,'#e8fbff',70,26);break;
  case 'thaw':burst(e.x,e.y,10,'#6fb6df',40,20,80);break;
  case 'stroke':burst(e.x,e.y+4,4,'#bfe8ff',25,12);break;
 }
}
const sfx={freeze:(e,{tone,noise})=>{noise(.25,.05,3000);tone(1400,.3,'sine',.03,-600);},
 thaw:(e,{tone})=>tone(500,.3,'sine',.03,-200),splash:(e,{noise})=>noise(.12,.04,900),
 stroke:(e,{noise})=>noise(.06,.02,1400),condenser:(e,{tone})=>{tone(880,.2,'triangle',.04);tone(660,.3,'sine',.03,0,.05);}};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'water',drawBack,draw,event,sfx});
})(typeof window!=='undefined'?window:globalThis);
