(function(root){'use strict';const rect=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
const S=()=>root.BladefallSunspire,Core=()=>root.BladefallPrecisionCore;
function draw(b,g){const k=g.dayKing,s=g.gardenShade,L=g.hydraLight;
 if(k){const x=k.x,y=k.y,need=k.need||2;rect(b,x-2,y+8,18,16,'#c8ad64');rect(b,x+1,y,12,10,'#e3d6b8');rect(b,x+3,y+4,2,2,'#4d493e');rect(b,x+9,y+4,2,2,'#4d493e');rect(b,x-1,y-3,16,3,'#e7c267');for(let i=0;i<3;i++)rect(b,x+i*6,y-6,3,4,'#e7c267');
  const fl=k.hour*need+k.hits,rowH=fl>9?3:fl>6?4:6;for(let i=0;i<fl;i++){const px=x+1+(i%3)*5,py=y+11+Math.floor(i/3)*rowH;rect(b,px,py,3,rowH-1,'#fff9df');rect(b,px-1,py+1,5,2,'#fff9df');}
  if(k.litSide)rect(b,k.litSide<0?x:x+12,y+7,2,14,'#fff9df');
  // 7.280 (opt-in `ripen`): while the routed light warms his side, the gold fills from the floor up.
  else if(k.ripen&&k.ripeSide&&k.ripeT>0){const hh=Math.max(1,Math.round(14*Math.min(1,k.ripeT/k.ripen)));rect(b,k.ripeSide<0?x:x+12,y+21-hh,2,hh,'#d9b85a');}
  if(!k.yielded){const ph=S()?S().glovePhase(k):'',side=g.p.x>=x?1:-1,fx=side>0?x+14:x-34;if(ph==='tell'){b.globalAlpha=.3;rect(b,fx,y+12,34,12,'#d9b85a');b.globalAlpha=1;}if(ph==='sweep')rect(b,fx,y+14,34,7,'#ead198');}
  // Sun-waves run along the floor.
  for(const w of k.waves||[]){rect(b,w.x,w.y+2,6,6,'#ead198');rect(b,w.x+1,w.y,4,2,'#fff6d5');rect(b,w.x-w.dir*4,w.y+5,4,3,'rgba(234,209,152,.45)');}
  // The hour turning: the next window glows and its line is drawn before it lights.
  if(k.sunNext){const n=k.sunNext,D={r:[1,0],l:[-1,0],u:[0,-1],d:[0,1]}[n.dir],C=Core(),blink=(g.frame>>2)&1;
   rect(b,n.c*8,n.r*8,8,8,blink?'#fff6d5':'#d9b85a');
   let c=n.c+D[0],r=n.r+D[1];for(let i=0;i<Math.max(60,g.room.cols,g.room.rows)&&C&&c>=0&&c<g.room.cols&&r>=0&&r<g.room.rows&&C.tileAt(g,c,r)!==C.SOLID;i++,c+=D[0],r+=D[1])if(i%2===0)rect(b,c*8+3,r*8+3,2,2,'rgba(255,246,213,.55)');}
 }
 if(s){rect(b,s.c*8-7,s.r*8-2,22,4,s.done?'#685945':'#c9b477');if(s.done){rect(b,s.c*8-5,139,1,5,'#738454');rect(b,s.c*8-7,136,5,4,'#e3dcef');}}
 if(g.room.def.hydraRide){const e=g.ents.find(e=>e.type==='deck');if(e){const x=e.x,y=e.y;rect(b,x,y+1,e.w,12,'#477477');
  if(L){// The King's last light, and the heads that shade it.
   for(const [bx,y0,y1]of L.bands){b.globalAlpha=.25;rect(b,bx-3,y0,6,y1-y0,'#ffe9a8');b.globalAlpha=1;rect(b,bx-1,y0,2,y1-y0,'#fff6d5');rect(b,bx-3,y1-2,6,2,'#ffe9a8');}
   for(const q of L.heads){const sh=q.tell?((g.frame>>1)&1)*2-1:0;
    const W=q.pw||16;if(q.upNow){const hx=q.x+sh;rect(b,hx+W/2-3,q.y+8,6,y-q.y-7,'#527f7d');rect(b,hx,q.y,W,8,'#74a094');rect(b,hx+W-4,q.y+2,2,2,'#e6d8a0');rect(b,hx+1,q.y-1,W-2,1,'#9fbdac');rect(b,hx,q.y+8,W,1,'rgba(36,58,58,.6)');}
    else{rect(b,q.x+W/2-4,y+11,8,4,'#527f7d');b.globalAlpha=.5;rect(b,q.x+2,y+14,W-4,2,'#9fbdac');b.globalAlpha=1;}}
  }else for(let i=0;i<3;i++){const hx=x+15+i*29;rect(b,hx,y-5-i%2*5,17,8,'#74a094');rect(b,hx+12,y-4-i%2*5,2,2,'#e6d8a0');rect(b,hx+3,y+3,8,17,'#527f7d');}
  rect(b,x+4,y,e.w-8,2,'#9fbdac');}}
}
const event=(e,{burst})=>{if(['dayking-bloom','garden-shade'].includes(e.type))burst(e.x,e.y,14,'#fff6d5',30,25);
 if(e.type==='dayking-turn'||e.type==='dayking-sun')burst(e.x,e.y,10,'#ffe9a8',24,20);};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'rbr-sunspire',draw,event});
})(typeof window!=='undefined'?window:globalThis);
