/* Precision Core — the Foundry, drawing (7.254). Anvils are dark iron with a bright face; belts are dark
   treads whose chevrons crawl the way they run; an empty mould is a dotted iron frame, and a cast one is
   solid iron, still glowing for a moment. */
(function(root){
'use strict';
const TILE=8,COLS=40,ROWS=23;
const px=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
function drawBack(b,g){
 const room=g.room;if(!room.belt)return;const t=g.frame;
 for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const d=room.belt[r*COLS+c];if(!d)continue;const x=c*TILE,y=r*TILE;
  px(b,x,y,8,8,'#2b2a2e');px(b,x,y,8,2,'#55535a');
  const o=((t*d)>>2)&3;for(let k=-1;k<3;k++){const xx=x+((k*4+o)%8+8)%8;px(b,xx,y+3,1,3,'#c9a24a');px(b,xx+(d>0?1:-1),y+4,1,1,'#c9a24a');}
 }
}
function draw(b,g){
 const t=g.frame;
 for(const e of g.ents){
  if(e.type==='anvil'){const x=e.x,y=e.y;px(b,x,y+1,8,3,'#4a4d55');px(b,x+2,y+4,4,2,'#35373d');px(b,x+1,y+6,6,2,'#4a4d55');px(b,x,y+1,8,1,'#c9ced8');px(b,x-1,y+2,2,1,'#6a6e78');}
  else if(e.type==='mould'){
   if(e.solid||e.pending){px(b,e.x,e.y,8,8,'#5a5d66');px(b,e.x,e.y,8,1,'#b8bcc6');if(e.glow===undefined)e.glow=30;if(e.glow>0){e.glow--;b.globalAlpha=e.glow/30;px(b,e.x+1,e.y+1,6,6,'#ff9a3a');b.globalAlpha=1;}}
   else{b.strokeStyle='#8a8e98';b.setLineDash([2,2]);b.strokeRect(e.x+.5,e.y+.5,7,7);b.setLineDash([]);px(b,e.x+3,e.y+3,2,2,'#6a4a2a');}
  }
 }
}
function event(e,{burst,shake}){
 if(e.type==='anvil'){burst(e.x,e.y,14,'#ffe2a0',80,18);shake(2.5,7);}
 else if(e.type==='cast'){burst(e.x,e.y,12,'#ff9a3a',40,22,60);}
}
const sfx={anvil:(e,{tone,noise})=>{tone(1200,.25,'square',.04,-200);tone(600,.3,'triangle',.04);noise(.05,.05,3000);},cast:(e,{tone,noise})=>{noise(.2,.04,700);tone(200,.2,'triangle',.04,-60);}};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'foundry',drawBack,draw,event,sfx});
})(typeof window!=='undefined'?window:globalThis);
