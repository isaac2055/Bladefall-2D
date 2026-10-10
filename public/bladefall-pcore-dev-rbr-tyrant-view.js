/* The Tyrant's crown stays high; the lit band names the only return that matters. */
(function(root){
'use strict';
const rect=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
function draw(b,g){const z=g.tyrant;if(!z||z.gone)return;
 if(z.d.hunt){drawHunt(b,g,z);return;}
 const width=z.retreat?Math.max(1,16-z.retreat/3):16,x=z.x+(16-width)/2;
 rect(b,x,z.y,width,z.h,'#28213c');rect(b,x,z.y,1,z.h,'#8e78bd');rect(b,x+width-1,z.y,1,z.h,'#8e78bd');
 if(!z.retreat){
  // A split mantle hangs from broad shoulders; the pale mask looks down the firing lane.
  b.fillStyle='#352942';b.beginPath();b.moveTo(z.x-7,z.y+18);b.lineTo(z.x+23,z.y+18);b.lineTo(z.x+18,z.y+z.h);b.lineTo(z.x+9,z.y+z.h-12);b.lineTo(z.x-3,z.y+z.h);b.closePath();b.fill();
  rect(b,z.x+3,z.y+1,10,14,'#a59db5');rect(b,z.x+2,z.y+5,12,4,'#171521');rect(b,z.x+3,z.y+6,3,1,'#dfc9ff');rect(b,z.x+9,z.y+6,3,1,'#dfc9ff');
  rect(b,z.x-9,z.y+20,4,30,'#75618d');rect(b,z.x+21,z.y+20,4,30,'#75618d');
  rect(b,z.x+7,z.y+22,2,z.h-30,'#a58bb9');
 }
 for(let i=0;i<3;i++)rect(b,x+2,z.y+24+i*26,Math.max(1,width-4),2,'#5b4b7b');
 const cy=z.y-6-(z.retreat&&z.d.final?z.retreat*1.7:0);
 rect(b,z.x-2,cy,20,4,'#c5a767');for(let i=0;i<3;i++)rect(b,z.x+i*7,cy-4,3,4,'#e6d294');
 const lane=z.lane??z.d.shotRow,band=z.band??z.d.weakRow;
 if(!z.retreat){if(z.d.lanes||z.d.bands){b.globalAlpha=.3;rect(b,z.x-3,band*8-8,22,20,'#b6d9fa');b.globalAlpha=1;}rect(b,z.x-2,band*8-3,20,6,'#b6d9fa');rect(b,z.x,band*8-1,16,2,'#ffffff');
  const first=z.d.first??80,every=z.d.every||140,until=z.t<first?first-z.t:every-(z.t-first)%every;
  if(until<=30){b.globalAlpha=.6;for(let x=12;x<z.x;x+=8)rect(b,x,lane*8+1,4,1,until<10?'#ffffff':'#d99afa');b.globalAlpha=1;}
  // (7.280) A walking lane is always marked on his mantle: a violet notch at the height he will fire from.
  if(z.d.lanes){rect(b,z.x-10,lane*8,6,4,'#d99afa');rect(b,z.x-12,lane*8+1,2,2,'#ffffff');}
  // The rake: the mask's eyes flare white before the aimed bolt.
  const T=root.BladefallPrecisionTyrant;if(z.d.rake&&T){const due=T.rakeDue(z);if(due<=T.RAKE.tell){const on=due<8||(due>>2)%2===0;rect(b,z.x+2,z.y+5,12,4,on?'#ffffff':'#f0c9ff');b.globalAlpha=.35;rect(b,z.x-1,z.y+3,18,8,'#f6d9ff');b.globalAlpha=1;
   const hx=z.x+T.RAKE.ox,hy=z.y+T.RAKE.oy;rect(b,hx-3,hy-3,6,6,on?'#ffffff':'#e9b8ff');b.globalAlpha=.3;rect(b,hx-6,hy-6,12,12,'#f6d9ff');b.globalAlpha=1;}
   else if(z.d.rake)rect(b,z.x+T.RAKE.ox-2,z.y+T.RAKE.oy-2,4,4,'#9b7cc4');}
  for(let i=0;i<z.need;i++)rect(b,z.x+i*5,z.y-14,3,2,i<z.need-z.hits?'#b6d9fa':'#393147');}
 for(const q of z.shots){if(q.rake&&!q.through){rect(b,q.x-1,q.y-1,q.w+2,q.h+2,'#5d2f6f');rect(b,q.x,q.y,q.w,q.h,'#ffd0f4');}else rect(b,q.x,q.y,q.w,q.h,q.through?'#b8f6ff':'#efb1ff');}
}
// (7.308) The hunting Tyrant: a tall void figure whose whole body is the ward. His mask burns and a line runs to
// the knight before each bolt; a bolt out of a door streaks home. Between perches he folds to a seam and unfolds.
function drawHunt(b,g,z){const T=root.BladefallPrecisionTyrant,fr=g.frame||0,HF=z.d.hunt.fold??T.HUNT.fold;
 let k=1;if(z.fold){const u=z.fold/HF;k=u<.5?1-u*2:(u-.5)*2;}if(z.retreat)k=Math.max(0,1-z.retreat/40);
 const cx=z.x+8,width=Math.max(1,Math.round(16*k)),x=cx-width/2,y=z.y,h=z.h;
 // the seam he stands in
 b.globalAlpha=.25;rect(b,cx-1,y-6,2,h+12,'#c9b2ff');b.globalAlpha=1;
 if(k<=0.05){rect(b,cx-1,y,2,h,'#e8dcff');}
 else{
  b.fillStyle='#2a2140';b.beginPath();b.moveTo(cx-12*k,y+18);b.lineTo(cx+12*k,y+18);b.lineTo(cx+9*k,y+h);b.lineTo(cx,y+h-14);b.lineTo(cx-9*k,y+h);b.closePath();b.fill();
  rect(b,x,y+14,width,h-28,'#3a2d55');rect(b,x,y+14,1,h-28,'#9a84cc');rect(b,x+width-1,y+14,1,h-28,'#9a84cc');
  for(let i=0;i<4;i++){const yy=y+24+i*((h-40)/4);rect(b,cx-5*k,yy,10*k,2,'#6c5a92');}
  // arms
  rect(b,cx-14*k,y+20,3*k,h*.4,'#6f5c8b');rect(b,cx+11*k,y+20,3*k,h*.4,'#6f5c8b');
  // mask
  const due=T.huntDue(z),tell=z.d.hunt.tell??T.HUNT.tell,burn=!z.fold&&!z.retreat&&due<=tell,on=due<8||(due>>2)%2===0;
  rect(b,cx-5*k,y+2,10*k,13,'#aaa0bd');rect(b,cx-6*k,y+6,12*k,4,'#171521');
  rect(b,cx-4*k,y+7,3*k,2,burn?(on?'#ffffff':'#ffb0f0'):'#dfc9ff');rect(b,cx+1*k,y+7,3*k,2,burn?(on?'#ffffff':'#ffb0f0'):'#dfc9ff');
  if(burn){b.globalAlpha=.35;rect(b,cx-8,y,16,16,'#f6d9ff');b.globalAlpha=1;}
  // crown
  rect(b,cx-9*k,y-4,18*k,3,'#c5a767');for(let i=0;i<3;i++)rect(b,cx-8*k+i*6*k,y-8,3*k,4,'#e6d294');
  // the ward: his whole body, pale while his own bolt can wound him
  b.globalAlpha=.18+.08*Math.sin(fr/7);b.strokeStyle='#b6d9fa';b.lineWidth=1;b.strokeRect(x-3.5,y-9.5,width+7,h+12);b.globalAlpha=1;
  for(let i=0;i<z.need;i++)rect(b,cx-7+i*5,y-16,3,2,i<z.need-z.hits?'#b6d9fa':'#393147');
  if(z.aimAt&&!z.fold){const m={x:cx,y:y+10};b.save();b.globalAlpha=.55;b.strokeStyle='#ffb0f0';b.setLineDash([2,4]);b.beginPath();b.moveTo(m.x,m.y);b.lineTo(z.aimAt.x,z.aimAt.y);b.stroke();b.restore();}
 }
 // the next perch, faint, while he folds
 if(z.fold&&z.d.perches){const q=z.d.perches[Math.min(z.hits,z.d.perches.length-1)];b.globalAlpha=.3;rect(b,q.c*8+7,q.r*8,2,z.h,'#e8dcff');b.globalAlpha=1;}
 for(const q of z.shots){if(q.home){b.globalAlpha=.4;rect(b,q.x-q.vx/60*2,q.y-q.vy/60*2,q.w,q.h,'#b8f6ff');b.globalAlpha=1;rect(b,q.x-1,q.y-1,q.w+2,q.h+2,'#e9fdff');}
  else{rect(b,q.x-1,q.y-1,q.w+2,q.h+2,'#5d2f6f');rect(b,q.x,q.y,q.w,q.h,q.through?'#b8f6ff':'#ffd0f4');}}
}
const event=(e,{burst})=>{if(e.type==='tyrant-fold'||e.type==='tyrant-unfold')burst(e.x,e.y,16,'#d9c8ff',50,30);if(e.type==='portal-pass'&&e.kind==='tyrant-bolt')burst(e.x,e.y,8,'#b8f6ff',30,14);if(e.type==='tyrant-hit')burst(e.x,e.y,18,'#b6d9fa',55,24);if(e.type==='tyrant-walk')burst(e.x-8,e.y+2,10,'#d99afa',40,18);};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'rbr-tyrant',draw,event});
})(typeof window!=='undefined'?window:globalThis);
