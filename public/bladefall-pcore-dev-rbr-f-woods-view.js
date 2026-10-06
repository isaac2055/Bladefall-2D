(function(root){'use strict';const rect=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
function draw(b,g){drawRoot(b,g);const o=g.oathRoot,w=g.resinWind;if(o){const x=o.bladeC*8,y=o.bladeR*8;rect(b,x-2,y+4,12,4,'#685143');rect(b,o.c*8,o.r*8,16,3,o.released?'#cfb37a':'#8f795b');rect(b,o.c*8+4,o.r*8+4,8,10,'#685a49');if(!o.taken){rect(b,x+3,y-7,2,11,'#d2d4cf');rect(b,x,y+1,8,2,'#b6a078');}if(!o.released){rect(b,x-3,y,14,2,'#72536b');rect(b,x+1,y-5,2,12,'#72536b');for(let xx=o.c*8;xx<x;xx+=4)rect(b,xx,o.r*8+15+(xx-o.c*8)/8,3,1,'#72536b');}}
 if(w){const warning=w.t%w.period>=w.period-27;for(const e of g.ents)if(e.type==='resinBranch'){rect(b,e.x,e.y+1,e.w,3,e.phase===-1?'#342a3e':'#66505d');if(e.solid)rect(b,e.x,e.y,e.w,1,'#d6b66d');else if(warning&&e.phase>=0)for(let x=e.x;x<e.x+e.w;x+=4)rect(b,x,e.y,2,1,'#e8ca82');else for(let x=e.x;x<e.x+e.w;x+=7)rect(b,x,e.y,2,1,'#665066');if(e.phase===2){rect(b,e.x+2,e.y+2,1,1,'#f0dfac');rect(b,e.x+e.w-3,e.y+2,1,1,'#f0dfac');}}
 const dx=w.phase===0?1:-1;for(const x of [35,155,270]){rect(b,x,23,1,15,'#857384');rect(b,x+(dx>0?1:-12),24,12,2,warning?'#f1d28c':'#ad8c70');rect(b,x+(dx>0?7:-12),26,6,2,'#856b72');}}
}
// (7.280) the Oath Root: lashes (thorned roots on a clock) and its crown
function drawRoot(b,g){const L=g.rootLash;if(!L)return;const t=L.t;
 for(const l of L.lashes){const x=l.c0*8,y=l.r0*8,w=(l.c1-l.c0+1)*8,h=(l.r1-l.r0+1)*8;
  if(l.live){rect(b,x,y,w,h,'#3c2434');for(let xx=x;xx<x+w;xx+=4)for(let yy=y;yy<y+h;yy+=4)rect(b,xx+((yy>>2)&1)*2,yy+1,2,2,'#c8577a');rect(b,x,y,w,1,'#e889a6');rect(b,x,y+h-1,w,1,'#e889a6');}
  else if(l.warn){const on=((t>>2)&1)===0;for(let xx=x;xx<x+w;xx+=4){rect(b,xx,y,2,1,on?'#f0a0b8':'#8a4a60');rect(b,xx,y+h-1,2,1,on?'#f0a0b8':'#8a4a60');}for(let yy=y;yy<y+h;yy+=4){rect(b,x,yy,1,2,on?'#f0a0b8':'#8a4a60');rect(b,x+w-1,yy,1,2,on?'#f0a0b8':'#8a4a60');}}
  else{for(let xx=x;xx<x+w;xx+=8)rect(b,xx+3,y,2,1,'#4a3040');}}
 const c=L.crown;if(c){const x=c.c*8,y=c.r*8;if(!c.cut){rect(b,x,y,16,16,'#4a3a2a');rect(b,x+2,y+2,12,12,'#6a5232');rect(b,x+5,y+5,6,6,(t>>3)&1?'#e8c06a':'#c89a4a');rect(b,x+7,y+7,2,2,'#2a1810');for(const [dx,dy]of [[-3,4],[16,6],[5,-3],[7,16]])rect(b,x+dx,y+dy,3,3,'#5a4632');}
  else{rect(b,x+2,y+8,12,8,'#3a2a20');rect(b,x+4,y+10,8,2,'#7a6448');}}
}
const event=(e,{burst})=>{if(['oath-roots','oath-taken'].includes(e.type))burst(e.x,e.y,12,'#d6ba85',30,25);if(e.type==='root-cut')burst(e.x,e.y,24,'#e8c06a',45,35);};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'rbr-f-woods',draw,event});
})(typeof window!=='undefined'?window:globalThis);
