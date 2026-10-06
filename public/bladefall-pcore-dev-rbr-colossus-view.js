/* Precision Core — Room by Room · 11. The Ember Colossus, drawing (7.259).
   Behind the room's `body` wall stands the Colossus: a furnace for a chest, a grate of embers, a helm with two
   coals for eyes, too big for the screen. Its arm runs along the rail under the roof to the ladle. Gathering, the
   ladle tips and its lip whitens while chevrons run down the column it means to fill; pouring, a white-hot
   column falls to the first solid thing. A refused pour stands as an iron pillar still glowing from inside, and
   the ladle shudders on it. Beaten, the arm drags the ladle away, or the whole machine sinks out of sight. */
(function(root){
'use strict';
const px=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
const COL={iron:'#2a2622',ironL:'#4a423a',ironD:'#16130f',rim:'#7a6a58',coal:'#ff8a2a',hot:'#ffd27a',white:'#fff6d8',slag:'#c8501e'};
function bodyX(g,c){return (c.d.body||'right')==='left'?-6:g.room.w-58;}
function drawBack(b,g){
 const c=g.colossus;if(!c)return;
 const t=g.frame,left=(c.d.body||'right')==='left';
 const bx=bodyX(g,c),by=c.y0-34+(c.sink||0);
 if(c.gone&&(c.d.leave==='down'||c.d.leave==='up'))return;
 // the body stands behind the works: drawn only through open air, never over rock
 const room=g.room,cols=room.cols;b.save();b.beginPath();
 for(let r=0;r<room.rows;r++)for(let c=0;c<cols;c++){const x=c*8;if(x+8<bx||x>bx+64)continue;if(room.grid[r*cols+c]===0)b.rect(x,r*8,8,8);}
 b.clip();
 b.globalAlpha=.8;
 px(b,bx,by+18,64,140,COL.ironD);px(b,bx+4,by+20,56,136,COL.iron);
 px(b,bx+14,by-4,36,26,COL.iron);px(b,bx+14,by-4,36,2,COL.ironL);px(b,bx+18,by+18,28,4,COL.ironD);
 const eye=c.state==='gather'?((t>>2)&1?COL.white:COL.hot):c.state==='jam'?'#ff4a2a':c.state==='leave'?'#5a2a1a':COL.coal;
 px(b,bx+20,by+6,7,3,eye);px(b,bx+37,by+6,7,3,eye);
 px(b,bx+12,by+40,40,30,COL.ironD);
 for(let i=0;i<5;i++){const fl=.5+.5*Math.sin(t/9+i*1.7);b.globalAlpha=.4+.3*fl;px(b,bx+14+i*8,by+44,5,22,i%2?COL.coal:COL.slag);}
 b.globalAlpha=.8;for(let i=0;i<6;i++)px(b,bx+12,by+43+i*5,40,1,COL.ironD);
 for(let i=0;i<6;i++)px(b,bx+6+i*10,by+24,2,2,COL.rim);
 b.globalAlpha=1;b.restore();
}
function draw(b,g){
 const c=g.colossus;
 // refused pours: iron pillars, glowing from inside for a while
 for(const e of g.ents){if(e.type!=='cpillar')continue;
  px(b,e.x,e.y,8,e.h,'#4a4d55');px(b,e.x,e.y,8,1,'#b8bcc6');px(b,e.x+1,e.y+1,1,e.h-1,'#5a5e68');px(b,e.x+6,e.y+1,1,e.h-1,'#33363c');
  for(let y=e.y+6;y<e.y+e.h;y+=9)px(b,e.x+2,y,4,1,'#3a3d44');
  if(e.glow>0){e.glow-=.5;b.globalAlpha=Math.min(1,e.glow/40);px(b,e.x+2,e.y+2,4,e.h-3,'#ff9a3a');b.globalAlpha=1;}}
 if(!c||c.gone)return;
 const t=g.frame,left=(c.d.body||'right')==='left';
 if((c.d.leave==='down'||c.d.leave==='up')&&c.state==='leave'&&Math.abs(c.sink)>200)return;
 const sink=c.state==='leave'&&c.d.leave!=='left'&&c.d.leave!=='right'?c.sink:0;
 const lx=Math.round(c.x-12),ly=c.y0-12+sink;
 // the arm: from the shoulder (beyond the wall) along the rail to the ladle's yoke
 const sx=left?-4:g.room.w+4,ay=ly-4;
 const x0=Math.min(sx,c.x),x1=Math.max(sx,c.x);
 px(b,x0,ay-3,x1-x0,6,COL.iron);px(b,x0,ay-3,x1-x0,1,COL.ironL);px(b,x0,ay+3,x1-x0,1,COL.ironD);
 for(let x=Math.ceil(x0/12)*12;x<x1;x+=12)px(b,x,ay-1,2,2,COL.rim);
 px(b,c.x-2,ay,4,5,COL.ironL);
 // the ladle: tipping while it gathers, shuddering when refused
 const jam=c.state==='jam'?((t>>1)&1)*2-1:0,tip=c.state==='gather'?Math.min(3,c.t/12)|0:c.state==='pour'?3:0;
 px(b,lx+jam,ly+tip,24,10,COL.ironL);px(b,lx+2+jam,ly+2+tip,20,8,COL.iron);px(b,lx+jam,ly+tip,24,1,COL.rim);
 const glow=c.state==='gather'?((t>>2)&1?COL.white:COL.hot):c.state==='jam'?'#7a3a1a':COL.coal;
 px(b,lx+3+jam,ly+1+tip,18,2,glow);
 // the lip over the bay
 px(b,c.x-4,c.y0-3,8,3,COL.ironD);
 const bx=(c.col??c.bays[c.i])*8;
 if(c.state==='gather'){
  // chevrons down the column it is about to fill, to the floor it will find (a hunt: red, and locked once it holds)
  const k=(c.t>>2)%4,h=c.hunt&&c.d.hunt,locked=h&&c.t>=(c.d.gather||60)-(h.lock??18),cc=h?(locked?'#ff4a2a':'#ff8a5a'):COL.hot;
  for(let y=c.y0+4+k*4;y<g.room.h;y+=16){b.globalAlpha=.75;px(b,bx+1,y,2,1,cc);px(b,bx+5,y,2,1,cc);px(b,bx+3,y+1,2,1,cc);b.globalAlpha=1;}
  if(h){b.globalAlpha=locked?.22:.1;px(b,bx,c.y0,8,g.room.h-c.y0,'#ff4a2a');b.globalAlpha=1;}
 }
 if((c.state==='pour'||c.state==='rest')&&c.len>c.drain){
  const top=c.y0+c.drain,h=c.len-c.drain;
  px(b,bx+1,top,6,h,COL.coal);px(b,bx+2,top,4,h,COL.hot);px(b,bx+3,top,2,h,COL.white);
  for(let y=top+((t*3)%6);y<top+h;y+=6)px(b,bx+(y%3?2:5),y,1,2,COL.coal);
  // splash where it lands
  if(c.state==='pour'){const fy=c.y0+c.len;for(let i=0;i<4;i++){const a=(t*7+i*40)%23;px(b,bx-3+((i*5+t)%14),fy-1-(a%4),1,1,i%2?COL.hot:COL.coal);}}
 }
}
function event(e,{burst,shake}){
 switch(e.type){
  case 'colossus-pour':shake&&shake(1,6);break;
  case 'colossus-refuse':burst(e.x,e.y,22,'#ffd27a',90,28,60);burst(e.x,e.y-10,12,'#c8d0da',50,30,-20);shake&&shake(3.5,12);break;
  case 'colossus-down':burst(e.x,e.y,20,'#ff8a2a',70,40,80);shake&&shake(4,30);break;
 }
}
const sfx={'colossus-gather':(e,{tone})=>tone(110,.5,'square',.03,30),
 'colossus-pour':(e,{noise,tone})=>{noise(.4,.05,900);tone(80,.3,'triangle',.04,-10);},
 'colossus-refuse':(e,{tone,noise})=>{noise(.3,.08,2600);tone(520,.35,'square',.04,-300);},
 'colossus-down':(e,{tone,noise})=>{noise(.8,.08,300);tone(60,.9,'square',.05,-20);}};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'rbr-colossus',drawBack,draw,event,sfx});
})(typeof window!=='undefined'?window:globalThis);
