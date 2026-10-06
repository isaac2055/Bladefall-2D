/* Course art: amber launches, cyan flight, violet tears, red lethal surfaces. */
(function(root){
'use strict';
const ART=root.BladefallActTwoArt,C=root.BladefallCeleste;if(!ART||!C)return;
function text(api,s,x,y,color,size=9){const c=api.ctx;c.save();c.fillStyle=color;c.textAlign='left';c.textBaseline='alphabetic';c.font=`${size}px monospace`;c.fillText(s,Math.round(x),Math.round(y));c.restore();}
function line(api,x,y,xx,yy,col,width=1){const c=api.ctx;c.save();c.strokeStyle=col;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();c.restore();}
function draw(phase,api,o){
 const {B,WX,WY,Z,bw,bh}=api,a=api.G.celeste;if(!a)return false;
 if(root.BladefallPrecisionWorkshop.draw(phase,api,o))return true;
 const hard=a.stage===42,accent=hard?'#c79aff':'#8ee8df';
 if(phase==='backdrop'){
  B(0,0,bw,bh,hard?'#100d21':'#101e30');
  for(let i=-1;i<bw/90+1;i++){const x=i*90-(api.camX*.08)%90;B(x,bh*.28,28,bh,'#18273b');B(x+4,bh*.28,2,bh,'#253449');}
  for(let i=0;i<24;i++){const x=(i*89+43)%bw,y=(i*37+21)%Math.max(1,bh*.5);B(x,y,1,1,'#667895');}
  return true;
 }
 if(phase==='plat'&&o.ceRoom!=null){
  const x=WX(o.x-o.w/2),w=o.w*Z,y=WY(o.y),h=o.deep?bh-y:Math.max(6,(o.h||20)*Z);
  let color=o.ceWeight?'#ad813c':o.ceAnvil?'#cb9150':'#40556d';B(x,y,w,h,'#202e43');B(x,y,w,3,color);
  for(let q=x+8;q<x+w;q+=18)B(q,y+5,9,1,'#34475c');
  if(o.ceShuttle){B(x+3,y-5,w-6,5,o.labCharged?'#ffe49a':'#77b9dd');text(api,o.labArmed?'JUMP WHEN GOLD':'DASH TO DRIVE',x,y-13,'#d5eafa',8);}
  if(o.ceAnvil){B(x+w*.2,y-5,w*.6,5,'#f6c779');text(api,'↓',x+w*.4,y-9,'#ffd68d',12);}
  if(o.ceWeight){const charged=o.ceArmed&&!o.ceReturning&&!o.ceLaunchSpent&&(o.ceT<1||o.ceTopAge<=.18);B(x+4,y-4,w-8,4,charged?'#ffe3a6':'#554d42');if(!o.ceArmed)text(api,'STRIKE',x,y-10,'#c7b18d',8);}

  return true;
 }
 if(phase==='object'&&o.ceRoom!=null){
  if(o.type==='wall'){
   if(o.gone)return true;const x=WX(o.x-o.w/2),y=WY(o.y),w=o.w*Z,h=o.h*Z;
   if(o.ceBoundary){for(let q=y;q<y+h;q+=12)B(x,q,w,3,accent);text(api,'LAND',x-30,WY(65),accent,8);return true;}
   B(x,y,w,h,o.ceGate?'#775e9e':'#34475e');B(x,y,2,h,o.ceGate?accent:'#63738b');return true;
  }
  if(o.type==='ceDashRefill'){
   const x=WX(o.x),y=WY(o.y),spent=o.ceSpent,col=spent?'#395c63':'#87ffdf';
   line(api,x,y-10,x+10,y,col,2);line(api,x+10,y,x,y+10,col,2);line(api,x,y+10,x-10,y,col,2);line(api,x-10,y,x,y-10,col,2);if(!spent)text(api,'+ DASH',x-18,y-17,col,7);return true;
  }
  if(o.type==='ceVein'){
   const x=WX(o.x-o.w/2),y=WY(o.y+o.h),w=o.w*Z,h=o.h*Z;
   B(x,y,w,h,'#412960');B(x,y,w,2,'#d2a3ff');B(x,y+h-2,w,2,'#d2a3ff');
   for(let k=9;k<w;k+=16)line(api,x+k,y+5,x+k-5,y+h-5,'#76528e');text(api,'DASH THROUGH →',x+7,y+h/2,'#efd8ff',8);return true;
  }
  if(o.type==='actRing'){
   const x=WX(o.x),y=WY(o.y),c=api.ctx;c.save();c.strokeStyle=o.ceTension?'#ffcd78':'#c79aff';c.lineWidth=2;c.beginPath();c.arc(x,y,8,0,Math.PI*2);c.stroke();c.restore();
   if(o.ceTension){B(x-11,y+10,22,2,'#ffcd78');B(x-6,y+14,12,2,'#ffcd78');}
   return true;
  }
  if(o.type==='ceBlade'){
   const x=WX(o.x),y=WY(o.y),c=api.ctx,col=o.ceSpent?'#4b596a':o.ceBlade==='pogo'?'#f6f3d6':'#9fcaff';
   c.save();c.strokeStyle=col;c.lineWidth=o.ceFlash>0?4:2;c.beginPath();
   if(o.ceBlade==='pogo')c.arc(x,y,o.w*Z/2,0,Math.PI*2);
   else{c.moveTo(x,y-15*Z);c.lineTo(x+o.w*Z/2,y+10*Z);c.lineTo(x-o.w*Z/2,y+10*Z);c.closePath();}
   c.stroke();c.restore();text(api,o.ceBlade==='pogo'?'↓':'↑',x-4,y+4,col,12);
   if(o.ceTeach&&!o.ceSpent)text(api,o.ceBlade==='pogo'?'POGO':'UP + SLASH',x-23,y-23,col,7);
   return true;
  }
  if(o.type==='ceGravityArch'){
   const x=WX(o.x),y=WY(o.y+o.h),h=o.h*Z,col=a.used.includes(o.ceMark)?'#91e9b7':'#c59aff';
   line(api,x-15,y,x-15,y+h,col);line(api,x+15,y,x+15,y+h,col);
   text(api,o.inverted?'↑ FLIP':'↓ RIGHT',x-18,y-8,col,8);return true;
  }
  if(o.type==='ceGale'){
   const x=WX(o.x),y=WY(o.y);if(o.ceRefill&&!o.ceSpent){const c=api.ctx;c.save();c.strokeStyle='#bcfff0';c.lineWidth=2;c.beginPath();c.arc(x,y,17,0,Math.PI*2);c.stroke();c.restore();text(api,'+',x-4,y+4,'#bcfff0',14);}for(let k=0;k<3;k++){line(api,x-12,y-8+k*8,x+12,y-13+k*8,o.ceSpent?'#426975':'#82eee7',2);}return true;
  }
  if(o.type==='ceHazard'){
   const x=WX(o.x-o.w/2),y=WY(o.y+o.h),w=o.w*Z,h=o.h*Z,hot=C.hot(o);
   B(x,y,w,h,hot?'#793346':'#302b40');B(x,y,w,2,hot?'#ff8294':'#896477');B(x,y,2,h,hot?'#ff8294':'#896477');
   for(let q=y+5;q<y+h;q+=12)line(api,x,q,x+w,Math.min(q+8,y+h),hot?'#d45470':'#685061');return true;
  }
 }
 if(phase==='world'){
  for(const r of a.rooms){const x=WX(r.x+120),y=WY(0);if(x< -20||x>bw+20)continue;B(x,y-32,2,32,accent);B(x+2,y-32,16,10,r.i<=a.room?accent:'#506176');}
  for(const z of api.G.obstacles){if(z.ceShuttle){const left=WX(z.ceHomeX-160),right=WX(z.ceToX+80),top=WY(z.y+280),bottom=WY(z.y-30);line(api,left,top,right,top,'#314b63');for(let yy=top;yy<bottom;yy+=10){B(left,yy,1,4,'#507590');B(right,yy,1,4,'#507590');}text(api,'DASH-LINKED RAIL',left+5,top-5,'#80bbdb',8);line(api,WX(z.ceHomeX),WY(z.y)-6,WX(z.ceToX),WY(z.y)-6,'#6b8295',2);B(WX(z.ceToX)-3,WY(z.y)-11,6,12,'#b4c9d2');}if(z.ceWeight){line(api,WX(z.ceHomeX),WY(z.ceHomeY),WX(z.ceToX),WY(z.ceToY),'#917044',2);B(WX(z.ceToX)-4,WY(z.ceToY)-4,8,8,'#d8b06d');}}
  const p=api.G.p;if(p.actHook)line(api,WX(p.x),WY(p.y+26),WX(p.actHook.ring.x),WY(p.actHook.ring.y),accent,1);
  
  return true;
 }
 if(phase==='overlay'){
  const r=a.rooms[a.room];B(8,37,Math.min(bw-16,580),49,'#101725');
  text(api,(a.stage===44?(a.room>=6?'FRACTURED WORKSHOP':'PRECISION WORKSHOP'):hard?'FRACTURED CELESTE':'CELESTE STANDARD')+'  '+(a.stage===44?a.room%6+1:a.room+1)+' / '+(a.stage===44?6:a.rooms.length),16,49,accent,9);
  text(api,r.title.toUpperCase(),16,62,'#edf3fb',10);
  const hint=r.hint.replace('Hook',typeof keyLabel==='function'?'Hook ['+keyLabel(kbCode('hook'))+']':'Hook');
  text(api,hint,16,76,'#b7c6d8',7);
  if(C.lab()){const ready=(a.lab?.charge??1)>0;text(api,ready?'◆ DASH READY':'◇ DASH SPENT · LAND OR TOUCH CYAN',16,96,ready?'#87ffdf':'#dca080',8);}
  const next=r.required.filter(id=>!a.used.includes(id)).map(id=>id.split(':')[1]);
  if(!C.lab())text(api,'EXIT '+(next.length?'· '+next.join(' → '):'OPEN')+'     RETRIES '+a.deaths,16,96,next.length?'#d7bd89':'#91e9b7',8);
  if(api.G.coopSession)text(api,'YOU '+(a.ready?'FINISHED':'TRAVERSING')+' · PARTNER '+(a.peerProgress?.ready?'FINISHED':'TRAVERSING'),16,109,'#d7c3ee',8);
  text(api,'JUMP '+keyLabel(kbCode('jump'))+'  DASH '+keyLabel(kbCode('dash'))+'  HOOK '+keyLabel(kbCode('hook'))+'  FLIP '+keyLabel(kbCode('flip'))+'  RETRY '+keyLabel(kbCode('checkpoint')),16,bh-12,'#b7c6d8',7);
  if(C.lab())text(api,'THIS ROOM: AIM + DASH · ONE AIR DASH · DOUBLE JUMP',16,bh-24,'#edf3fb',8);
  if(a.stage===41&&r.kind==='tear')text(api,'ORIGINAL COURSE CONTROLS RESUME HERE',16,bh-24,'#edf3fb',7);
  if(['pogo','uppercut'].includes(r.kind))text(api,'DOWN / UP + SLASH '+keyLabel(kbCode('attack'))+'   ·   HOLD DOWN = POUND',16,bh-24,'#edf3fb',7);
  if(a.gravityLeaseT>0)text(api,'GRAVITY '+(G.gravityFlipped?'↑':'↓')+'  '+a.gravityLeaseT.toFixed(1)+'s · '+keyLabel(kbCode('flip')),16,bh-24,'#d4b2ff',8);
  if(a.flight){B(bw/2-50,bh-30,100,4,'#34465a');B(bw/2-50,bh-30,100*Math.max(0,a.flight.t)/C.flightTime(a.stage),4,'#87eadf');}
  return true;
 }
 return false;
}
function drawFlight(ctx,p,WX,WY,Z){
 const a=C.state(),f=p.aether?{vx:p.vx||310,vy:-(p.vy||0),trail:[]}:p===G.p?a?.flight:null;if(!f)return false;
 if(a?.stage===44&&root.BladefallPrecisionArt)return root.BladefallPrecisionArt.flight(ctx,p,WX,WY,Z,f);
 ctx.save();
 for(let i=0;i<f.trail.length;i++){const t=f.trail[i];ctx.globalAlpha=i/f.trail.length*.4;ctx.fillStyle='#76e9ee';ctx.beginPath();ctx.arc(WX(t.x),WY(t.y),(2+i*.3)*Z,0,Math.PI*2);ctx.fill();}
 ctx.globalAlpha=1;ctx.translate(WX(p.x),WY(p.y+22));ctx.rotate(-Math.atan2(f.vy,f.vx));ctx.scale(Z,Z);
 ctx.shadowColor='#76ffee';ctx.shadowBlur=12;ctx.fillStyle='#367d99';ctx.strokeStyle='#a6fff1';ctx.lineWidth=2;
 ctx.beginPath();ctx.moveTo(26,0);ctx.lineTo(-5,-15);ctx.lineTo(-18,0);ctx.lineTo(-5,15);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.shadowBlur=0;ctx.fillStyle='#e5fff9';ctx.beginPath();ctx.moveTo(18,0);ctx.lineTo(-5,-6);ctx.lineTo(-11,0);ctx.lineTo(-5,6);ctx.closePath();ctx.fill();ctx.restore();return true;
}
root.BladefallCelesteArt=Object.freeze({drawFlight});
for(const stage of [41,42,44])ART.register(stage,{draw});
})(typeof window!=='undefined'?window:globalThis);
