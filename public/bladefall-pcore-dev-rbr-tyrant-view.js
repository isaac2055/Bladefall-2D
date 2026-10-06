/* The Tyrant's crown stays high; the lit band names the only return that matters. */
(function(root){
'use strict';
const rect=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
function draw(b,g){const z=g.tyrant;if(!z||z.gone)return;
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
const event=(e,{burst})=>{if(e.type==='tyrant-hit')burst(e.x,e.y,18,'#b6d9fa',55,24);if(e.type==='tyrant-walk')burst(e.x-8,e.y+2,10,'#d99afa',40,18);};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'rbr-tyrant',draw,event});
})(typeof window!=='undefined'?window:globalThis);
