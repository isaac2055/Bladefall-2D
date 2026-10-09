/* Precision Core — the Deep Line, drawing (7.254). Rails are twin steel lines on timber sleepers; boost
   strips glow with chevrons that point the way they throw; a brass switch post stands beside the track
   with an arrow up to the high line. A cart is an iron tub on two wheels; the knight rides in it. */
(function(root){
'use strict';
const TILE=8;
const px=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
function drawBack(b,g){
 const room=g.room,COLS=room.cols,ROWS=room.rows;if(!room.rail)return;const t=g.frame;
 for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const i=r*COLS+c;if(!room.rail[i])continue;const x=c*TILE,y=r*TILE;
  px(b,x,y,8,8,'#2a2320');px(b,x+1,y+2,2,6,'#5a4330');px(b,x+5,y+2,2,6,'#5a4330');px(b,x,y,8,1,'#c8ccd4');px(b,x,y+1,8,1,'#6a6e76');
  const d=room.boost[i];if(d){const on=((t>>2)+c)%3===0;px(b,x+(d>0?2:4),y+3,2,1,on?'#ffe07a':'#b08a2a');px(b,x+(d>0?4:2),y+4,2,1,on?'#ffe07a':'#b08a2a');px(b,x+(d>0?2:4),y+5,2,1,on?'#ffe07a':'#b08a2a');}
 }
}
function draw(b,g){
 const t=g.frame;
 for(const e of g.ents){
  if(e.type==='switch'){const x=e.x,y=e.y;px(b,x+3,y,2,8,'#b08a3a');px(b,x+2,y,4,2,'#e0c070');px(b,x+3,y-3,2,2,'#e0c070');px(b,x+2,y-2,1,1,'#e0c070');px(b,x+5,y-2,1,1,'#e0c070');}
  else if(e.type==='cart'&&!e.gone){const {x,y,w,h}=e;
   px(b,x,y+1,w,h-3,'#4d4f57');px(b,x,y,w,1,'#9ea3ad');px(b,x+1,y+2,w-2,1,'#34363c');
   const spin=(Math.round(e.x/3))&1;px(b,x+1,y+h-3,3,3,'#1c1d22');px(b,x+w-4,y+h-3,3,3,'#1c1d22');px(b,x+2,y+h-2,1,1,spin?'#c8ccd4':'#6a6e76');px(b,x+w-3,y+h-2,1,1,spin?'#6a6e76':'#c8ccd4');
  }
 }
}
function event(e,{burst,shake,dust}){
 if(e.type==='boost')burst(e.x,e.y,8,'#ffe07a',50,14);
 else if(e.type==='switch-high'){burst(e.x,e.y,10,'#e0c070',50,18);shake(1.5,5);}
 else if(e.type==='cart-bump'){burst(e.x,e.y,8,'#c8ccd4',40,14);shake(2,6);}
 else if(e.type==='cart-land')dust(e.x,e.y,6);
}
const sfx={boost:(e,{tone})=>tone(300,.2,'sawtooth',.03,500),'switch-high':(e,{tone,noise})=>{noise(.08,.04,2000);tone(700,.12,'square',.03);},
 'switch-low':(e,{tone})=>tone(400,.06,'square',.02),'cart-bump':(e,{noise})=>noise(.15,.06,300),'cart-land':(e,{noise})=>noise(.1,.04,400)};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'rail',drawBack,draw,event,sfx});
})(typeof window!=='undefined'?window:globalThis);
