/* Precision Core — Room by Room · 5. The Hollow Marksman, drawing (7.259). A tall hooded archer with a pale
   mask and a long bow. While he draws, a dashed line runs from the bow along the locked aim and brightens just
   before he looses; his arrows are the foes' bolts with a dark fletching ring, so a marked arrow reads apart
   from a watch bow's. While his lens ward holds, a brass ring sits in front of him and turns returned arrows
   aside. Also draws the region's watch bows over the foes' spitter sprite (Room by Room region 5 only), so the
   canyon's shooters read as crossbows on posts rather than spitting pods. Simulation:
   bladefall-pcore-dev-rbr-marksman.js. */
(function(root){
'use strict';
const px=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
function line(b,x,y,xx,yy,c,dash){b.strokeStyle=c;b.lineWidth=1;if(dash)b.setLineDash(dash);b.beginPath();b.moveTo(Math.round(x)+.5,Math.round(y)+.5);b.lineTo(Math.round(xx)+.5,Math.round(yy)+.5);b.stroke();b.setLineDash([]);}
const COL={cloak:'#2b2630',cloakL:'#463e4c',mask:'#e6dcc4',eye:'#ff7a4a',bow:'#a07a48',string:'#d8d0c0',brass:'#e0b860',brassD:'#8a6a30'};
function drawBows(b,g){
 // Region 5's watch bows: a crossbow on a bracket, pointing the way it shoots; it glows as it winds.
 if(!g.foes||g.room.def.rbr!==5)return;
 for(const f of g.foes){
  if(f.kind!=='spit'||!f.alive)continue;
  const x=f.x,y=f.y,dx=f.dx||0,dy=f.dy||0;
  px(b,x,y,8,8,'#3a2e22');px(b,x+1,y+1,6,6,'#5a4630');
  const cx=x+4,cy=y+4;
  // the stock along the line of fire, the bow across it
  for(let i=-2;i<=4;i++)px(b,cx+dx*i-1,cy+dy*i-1,2,2,'#8a6a40');
  const ox=-dy,oy=dx;for(let i=-3;i<=3;i++)px(b,cx+dx*2+ox*i-.5,cy+dy*2+oy*i-.5,1,1,f.tell&&(f.every<=20||(g.frame>>1)&1)?'#ffd890':COL.bow);
  px(b,cx+dx*4-1,cy+dy*4-1,2,2,f.tell?'#ffe0a0':'#c08a50');
 }
}
/* A rain (opt-in `rain`): the band he marked on the ground, red through his draw and while the arrows fall. */
function drawBand(b,g){
 const m=g.mk;if(!m||!m.band)return;
 const B=m.band,t=g.frame,hot=m.state!=='draw'||(t>>2)&1;
 b.globalAlpha=hot?.32:.18;px(b,B.x,B.y-3,B.w,3,'#c8402a');b.globalAlpha=.1;px(b,B.x,0,B.w,B.y,'#c8402a');b.globalAlpha=1;
 for(let xx=B.x;xx<B.x+B.w;xx+=4)px(b,xx,B.y-1,2,1,'#ff8a5a');
 px(b,B.x,B.y-6,1,6,'#ff8a5a');px(b,B.x+B.w-1,B.y-6,1,6,'#ff8a5a');
}
function drawMarksman(b,g){
 const m=g.mk;if(!m||m.gone)return;
 const x=m.x,y=m.y,f=m.face||-1,t=g.frame;
 // tell: the locked aim
 if(m.state==='draw'&&m.aim){
  const k=m.tell-m.t,cx=x+m.w/2,cy=y+5;
  // the line runs until stone stops it, as the arrow will
  const C=root.BladefallPrecisionCore;let L=12;while(L<360&&!(C&&C.solidAt(g,Math.round(cx+m.aim.x*L),Math.round(cy+m.aim.y*L),1,1)))L+=3;
  line(b,cx,cy,cx+m.aim.x*L,cy+m.aim.y*L,k<10?'#ffe7b1':'#a3664a',[2,3]);
  if(k<10&&(t>>1)&1){px(b,cx-1,y-7,2,4,'#ffda85');px(b,cx-1,y-2,2,1,'#ffda85');}
 }
 // body: hooded cloak, pale mask, eye
 px(b,x+1,y+5,8,11,COL.cloak);px(b,x+2,y+6,6,1,COL.cloakL);px(b,x+1,y+15,3,1,'#18141a');px(b,x+6,y+15,3,1,'#18141a');
 px(b,x+2,y,6,6,COL.cloak);px(b,x+3,y+1,4,4,COL.mask);px(b,f>0?x+5:x+3,y+2,1,1,COL.eye);px(b,x+3,y+4,4,1,'#b8ac94');
 // the bow, held toward the aim (or the knight)
 const ax=m.aim?m.aim.x:f,ay=m.aim?m.aim.y:0,cx=x+5+ax*5,cy=y+7+ay*5,ox=-ay,oy=ax;
 for(let i=-6;i<=6;i++){const bend=Math.abs(i)<4?1:0;px(b,cx+ox*i+ax*bend,cy+oy*i+ay*bend,1,1,COL.bow);}
 if(m.state==='draw'){const pull=Math.min(4,m.t/6);line(b,cx+ox*6,cy+oy*6,cx-ax*pull,cy-ay*pull,COL.string);line(b,cx-ox*6,cy-oy*6,cx-ax*pull,cy-ay*pull,COL.string);}
 else line(b,cx+ox*6,cy+oy*6,cx-ox*6,cy-oy*6,COL.string);
 // the lens ward
 const R=root.BladefallRbrMarksman;
 if(R&&R.warded(g,m)){const lx=x+5+f*9,ly=y+7;b.strokeStyle=(t>>3)&1?COL.brass:COL.brassD;b.beginPath();b.arc(lx,ly,6,0,Math.PI*2);b.stroke();
  b.globalAlpha=.25;b.fillStyle='#ffe8a0';b.beginPath();b.arc(lx,ly,5,0,Math.PI*2);b.fill();b.globalAlpha=1;px(b,lx-2,ly-3,1,2,'#fff4d0');}
 // hits taken in this room, as notches over his hood
 for(let i=0;i<m.need;i++)px(b,x+i*3,y-4,2,1,i<m.hits?'#ff9a6a':'#6a5a5a');
}
function drawArrows(b,g){
 // A marked arrow (his): a dark fletching ring around the foes' bolt sprite.
 for(const o of g.bolts||[]){if(!o.marked||!o.alive)continue;b.strokeStyle=o.friendly?'#2f8f7a':'#5a1a14';b.beginPath();b.arc(o.x+3,o.y+3,5,0,Math.PI*2);b.stroke();}
 // A rain arrow: a falling shaft with its fletching up.
 for(const o of g.bolts||[]){if(o.from!=='mk-rain'||!o.alive)continue;const up=o.vy<0;px(b,o.x+2,o.y-4,2,9,'#d8cdb4');px(b,o.x+1,up?o.y+5:o.y-5,4,2,'#5a1a14');px(b,o.x+2,up?o.y-5:o.y+5,2,2,'#e8e0cc');}
}
function draw(b,g){drawBows(b,g);drawBand(b,g);drawMarksman(b,g);drawArrows(b,g);}
function event(e,{burst,shake}){
 if(e.type==='marksman-hit'){burst(e.x,e.y,14,'#ffb08a',70,22);shake&&shake(3);}
 else if(e.type==='marksman-leap')burst(e.x,e.y,6,'#c8b8a0',40,12);
 else if(e.type==='marksman-gone'&&e.how==='fall')burst(e.x,e.y,18,'#e6dcc4',80,30);
}
const sfx={'mk-rain':(e,{tone})=>{tone(1200,.06,'triangle',.02,-400);tone(600,.12,'triangle',.015,-200);},'marksman-hit':(e,{tone,noise})=>{noise(.08,.05,1800);tone(220,.18,'sawtooth',.04);},'mk-tell':(e,{tone})=>tone(880,.05,'triangle',.015),
 'marksman-gone':(e,{tone})=>{tone(330,.2,'triangle',.03);tone(165,.35,'triangle',.03);}};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'rbr-marksman',draw,event,sfx});
})(typeof window!=='undefined'?window:globalThis);
