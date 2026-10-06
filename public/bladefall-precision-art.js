/* Pixel-built quarry / abandoned ironworks. Physical boundaries remain legible;
   stone knocks you out of flight; amber machinery transfers impulse; lilac is phaseable. */
(function(root){
'use strict';
function draw(phase,api,o){
 const {B,WX,WY,Z,ctx:c,bw,bh,G}=api,a=G.celeste;if(!a||G.stageIndex!==44)return false;
 const hard=a.room>=6,theme=({12:0,13:1,14:0,15:4,16:3,17:3,18:4,19:0,20:1,21:3,22:4,23:0,24:0})[a.room]??a.room%6,t=a.clock,P={sky:hard?'#151420':'#121c24',deep:'#1c242b',stone:'#3d464b',light:'#697274',dark:'#283038',iron:'#4c514b',bone:'#d2cbb4',gold:'#d1ae69',cyan:'#94c0bd',violet:'#aba0c3'};
 const text=(s,x,y,col=P.bone,size=7)=>{c.save();c.textAlign='left';c.textBaseline='alphabetic';c.fillStyle=col;c.font=size+'px monospace';c.fillText(s,Math.round(x),Math.round(y));c.restore();};
 const line=(x,y,xx,yy,col,w=1)=>{const n=Math.max(1,Math.ceil(Math.max(Math.abs(xx-x),Math.abs(yy-y))));for(let i=0;i<=n;i++)B(Math.round(x+(xx-x)*i/n),Math.round(y+(yy-y)*i/n),w,w,col);};
 const hub=(x,y,r,col)=>{for(let iy=-r;iy<=r;iy+=2){const q=Math.min(r,r+4-Math.abs(iy));B(x-q,y+iy,q*2,2,P.dark);B(x-q,y+iy,2,2,col);B(x+q-2,y+iy,2,2,col);}B(x-r+4,y-r,r*2-8,2,col);B(x-r+4,y+r,r*2-8,2,col);B(x-2,y-2,4,4,col);};
 const arrow=(x,y,dx,dy,col)=>{line(x-5*dx,y+5*dy,x+5*dx,y-5*dy,col,2);line(x+5*dx,y-5*dy,x+5*dx-5,y-5*dy,col,2);line(x+5*dx,y-5*dy,x+5*dx,y-5*dy+5,col,2);};
 if(phase==='backdrop'){
  B(0,0,bw,bh,['#151e23','#1b1a29','#19221e','#1c192b','#132522','#211b20'][theme]);
  // Architectural silhouettes give each route a purpose: mine, aqueduct, quarry,
  // observatory, overgrown conservatory, and the abandoned belfry.
  for(let k=-1;k<bw/160+2;k++){const x=k*160-(api.camX*.18)%160;
   if(theme===1){B(x,bh*.68,160,8,'#282637');for(let j=0;j<7;j++){B(x+j*9,bh*.68+8+j*5,8,6,'#302b3e');B(x+150-j*9,bh*.68+8+j*5,8,6,'#302b3e');}}
   if(theme===2||theme===4){for(let j=0;j<9;j++){B(x+j*7,bh-j*24,6,25,'#253a30');B(x+j*7-12,bh-j*24,17,3,'#344839');}for(let j=0;j<8;j++)B(x+j*21,70+(j%3)*12,24,5,'#263c34');}
   if(theme===3){hub(x+75,95,35,'#39344b');for(let j=0;j<6;j++)B(x+25+j*19,150,2,2,'#7b6d83');}
   if(theme===5){B(x+60,35,3,105,'#3e3438');B(x+48,140,28,7,'#534341');B(x+43,147,38,8,'#3c3336');}
  }
  // Background anchors remain decorative: they never add hidden collision.
  for(const z of G.obstacles){if(z.ceRoom!==a.room)continue;const x=WX(z.x),y=WY(z.y+(z.h||0)/2);if(x< -100||x>bw+100)continue;
   if(z.ceFold||z.type==='ceSwitchMotor'){const yy=WY(z.y);line(x,yy+12,x,yy+50,'#3d4147',2);line(x,yy+50,x-90,yy+50,'#363d43',2);hub(x,yy+50,5,'#5c665c');for(let j=0;j<3;j++)B(x-70+j*20,yy+48,5,5,z.cePhase?'#685940':'#476560');}
   if(z.ceSeedPerch||z.ceWakePerch||z.cePressurePerch){const yy=WY(z.y),w=z.w*Z;B(x-w/2+4,yy+12,w-8,6,'#343f3c');line(x-w/2+7,yy+16,x,yy+42,'#434c44',3);line(x+w/2-7,yy+16,x,yy+42,'#434c44',3);B(x-7,yy+40,14,18,'#2e3837');}
   if(z.type==='cePressurePod'){const yy=WY(z.y+24);line(x,yy+23,x,yy+85,'#514f44',5);line(x,yy+85,x+65,yy+85,'#514f44',5);for(let j=30;j<86;j+=18)B(x-5,yy+j,10,3,'#7a715a');}
   if(z.type==='ceSeedSocket'){const gate=G.obstacles.find(g=>g.ceRoom===a.room&&g.ceSeedGate===z.ceSocketId);if(gate){const yy=WY(z.y);line(x+18,yy,WX(gate.x),yy,'#415c45',2);line(WX(gate.x),yy,WX(gate.x),yy-65,'#415c45',2);for(let j=0;j<5;j++){const q=x+25+j*(WX(gate.x)-x-25)/5;B(q,yy-4,7,3,z.ceLit?'#acc47c':'#5f7651');}}}
   if(['ceRicochet','cePrism','actRing'].includes(z.type)){for(let yy=-5;yy<y-14;yy+=7){B(x-1,yy,2,4,'#4b4546');B(x,yy+3,2,2,'#625b56');}B(x-7,7,14,4,'#6a6256');}
   if(z.ceBlade==='uppercut'){for(let yy=0;yy<y-8;yy+=7){const q=x+Math.sin(yy*.035)*3;B(q,yy,3,8,'#515c42');if(yy%5===0)B(q-6,yy,9,3,'#718064');}}
   if(['ceAetherSpring','ceGale'].includes(z.type)){const low=bh+20;for(let yy=y+10;yy<low;yy+=8){const q=x+Math.sin(yy*.04+z.x)*5;B(q,yy,3,9,'#3e5944');if(yy%3<1)B(q-7,yy,10,3,'#597451');}}
  }
  for(let i=-1;i<bw/110+2;i++){const x=i*110-(api.camX*.12)%110,h=70+(i%3)*25;B(x,bh*.45-h,30,bh,P.deep);B(x+3,bh*.45-h,4,bh,'#252d34');for(let y=bh*.45-h;y<bh;y+=22){B(x,y,30,1,'#30363b');B(x+(Math.floor(y/22)%2?10:20),y,1,22,P.sky);}B(x-4,bh*.45-h-4,38,4,'#30363b');}
  for(let i=0;i<40;i++){const x=((i*87-api.camX*.025)%bw+bw)%bw,y=(i*43+21)%(bh*.55);B(x,y,1,1,'#59626b');}
  return true;
 }
 if(phase==='plat'&&o.ceRoom!=null){
  if(o.gone)return true;const x=WX(o.x-o.w/2),y=WY(o.y),w=o.w*Z,h=o.deep?bh-y:Math.max(9,(o.h||20)*Z);
  if(o.ceShuttle){B(x,y,w,5,P.iron);B(x+3,y+5,w-6,4,P.dark);for(let q=3;q<w-2;q+=9){B(x+q,y,2,2,P.bone);B(x+q,y+4,5,2,'#323a37');}const t=o.labArmed?G.time-o.labStart:0;B(x+4,y-3,w-8,3,o.labCharged?P.gold:t>.83?P.bone:P.cyan);for(let k=0;k<3;k++){const xx=x+8+k*(w-16)/2;hub(xx,y+10,4,P.iron);line(xx,y+10,xx+Math.cos(t*14)*3,y+10+Math.sin(t*14)*3,P.gold);}if(o.labCharged){B(x+2,y-6,3,3,P.gold);B(x+w-5,y-6,3,3,P.gold);}return true;}
  if(o.ceCrumble){
   if(o.ceBloom){const grown=o.ceGrow||0;B(x,y,w*grown,4,'#829766');for(let q=0;q<w;q+=7){B(x+q,y+4,6,4,'#56613e');B(x+q+2,y-3,5,3,'#a6b57a');}line(x+w/2,y+6,x+w/2-7,y+45,'#495039',3);return true;}
   const crack=o.ceTimer?1-o.ceTimer/o.ceCrumbleTime:0;
   B(x+2,y,w-4,3,'#9c9682');B(x,y+3,w,5,'#716e60');B(x+2,y+8,w-4,4,'#514f47');B(x+5,y+12,w-10,3,'#343a36');
   for(let q=3;q<w-3;q+=7){B(x+q,y+4,4,2,'#8a8472');B(x+q+2,y+10,3,3,'#41463f');}
   line(x+w*.28,y,x+w*.4,y+6+crack*8,'#171d23',1+Math.floor(crack*2));line(x+w*.65,y+2,x+w*.52,y+10,'#171d23',1+Math.floor(crack*2));
   if(crack>.4)for(let j=0;j<5;j++)B(x+2+j*w/6,y+16+(j*3+crack*18)%13,2,2,'#8a8472');return true;
  }
  B(x,y,w,h,P.dark);B(x,y,w,3,P.light);
  for(let yy=4;yy<h;yy+=10)for(let q=0;q<w;q+=14){const k=(q/14+yy/10)|0;B(x+q,y+yy,Math.min(12,w-q),8,k%3?P.stone:'#454d51');B(x+q+2,y+yy+2,Math.min(5,w-q-2),1,'#566063');}
  if(o.ceCrumble){const crack=o.ceTimer?1-o.ceTimer/o.ceCrumbleTime:0;B(x,y+9,w,4,P.deep);for(let q=0;q<w;q+=8)B(x+q,y+12,Math.min(7,w-q),2+(q%3)*2,P.dark);line(x+w*.25,y,x+w*.4,y+4+crack*8,'#171d23',1+Math.floor(crack*2));line(x+w*.65,y+2,x+w*.5,y+6+crack*8,'#171d23',1+Math.floor(crack*2));if(crack>.45){for(let j=0;j<4;j++)B(x+4+j*w/5,y+15+(j+crack*20)%13,2,2,P.light);}}
  return true;
 }
 if(phase==='object'){
  if(o.type==='ceHazard'){
   if(o.ceSluice){const x=WX(o.x-o.w/2),top=WY(710),w=o.w*Z,open=o.gone;B(x-3,top,w+6,7,P.iron);for(let k=0;k<3;k++)B(x+k*w/3,top+7,w/3-2,open?14:Math.min(api.bh-top,1100*Z),P.iron);B(x+w/2-2,top-5,4,4,open?P.gold:P.bone);return true;}
   if(o.gone)return true;
   if(o.ceContour){const x=WX(o.x-o.w/2),y=WY(o.y+o.h),w=o.w*Z,h=o.h*Z,floor=o.y<0,edge=floor?y:y+h;B(x,y,w+.5,h,'#344037');B(x,edge+(floor?0:-3),w+.5,3,'#71835a');B(x,edge+(floor?4:-9),w+.5,5,'#43553b');const low=Math.max(-8,y),high=Math.min(bh+8,y+h);for(let yy=low;yy<high;yy+=32){const yy2=yy+Math.sin(o.x*.017+yy*.03)*5;line(x,yy2,x+w,yy2+Math.sin(o.x*.023)*3,'#26382f',2);}if(Math.floor(o.x/20)%3===0){const dir=floor?1:-1;line(x+5,edge+dir*8,x+w-3,edge+dir*27,'#61734c',2);}return true;}
   if(o.ceCrag){const x=WX(o.x-o.w/2),y=WY(o.y+o.h),w=o.w*Z,h=o.h*Z;
    B(x,y,w,h,'#344037');B(x+1,y+1,w-2,2,'#7b8765');
    if(o.ceTunnel){
     // Interlocking rock plates and embedded roots follow the real stepped boundary.
     const lo=Math.max(y,-24),hi=Math.min(y+h,bh+24),floor=o.y<0,edge=floor?y:y+h,sign=floor?1:-1;
     for(let yy=lo;yy<hi;yy+=27){const row=Math.floor((yy-y)/27),cut=x+10+((row*23+o.x)%Math.max(12,w-20));line(x,yy,cut,yy+7,'#26362f',2);line(cut,yy+7,x+w,yy+2,'#26362f',2);B(cut,yy+7,2,18,'#26362f');B(x+5,yy+12,Math.max(3,cut-x-9),2,'#475640');}
     line(x,edge-sign*0.5,x+w,edge-sign*0.5,'#71835a',2);
     for(let q=2;q<w-5;q+=13){const depth=4+(Math.floor(q+o.x)%4)*2;B(x+q,edge+(floor?0:-depth),6,depth,'#667751');line(x+q+3,edge+sign*depth,x+q+9,edge+sign*(depth+14),'#536645',2);}
     for(let k=0;k<3;k++){const ax=x+w*(k+.3)/3,ay=Math.max(lo,Math.min(hi,edge+sign*(45+k*38)));line(ax,ay,ax+12,ay-sign*28,'#687652',3);line(ax+12,ay-sign*28,ax+21,ay-sign*39,'#687652',2);line(ax+12,ay-sign*28,ax+3,ay-sign*36,'#687652',2);}
     return true;
    }
    for(let k=0;k<12;k++){const xx=x+((k*17+o.x*.1)%(Math.max(1,w-7))),yy=y+(k*11)%(Math.max(1,h-4));B(xx,yy,5+k%3,2,k%2?'#526249':'#273a31');}
    line(x+w*.2,y+h,x+w*.6,y,'#1d302a',2);line(x+w*.6,y+h*.5,x+w*.87,y+h*.3,'#1d302a',2);
    for(let k=0;k<w;k+=11){B(x+k,y,6,2,'#7f9061');B(x+k+2,y+2,2,3,'#606f4b');}return true;}

   const x=WX(o.x-o.w/2),y=WY(o.y+o.h),w=o.w*Z,h=o.h*Z;
   if(o.ceMover){const cx=x+w/2,cy=y+h/2;hub(cx,cy,Math.max(w,h)/2-3,P.bone);for(let k=0;k<4;k++){const angle=G.celeste.clock*5+k*Math.PI/2;line(cx,cy,cx+Math.cos(angle)*w/2,cy+Math.sin(angle)*h/2,P.light,3);}return true;}
   B(x,y,w,h,P.dark);B(x+2,y+2,w-4,h-4,P.stone);
   for(let yy=8;yy<h;yy+=15){B(x+2,y+yy,w-4,1,'#222a30');B(x+Math.floor(yy/15)%2*w*.35+3,y+yy,2,8,'#556064');}
   // Worn pale edges outline stone; no decorative spikes imply instant death.
   B(x,y,w,2,P.light);B(x,y+h-2,w,2,P.light);for(let q=3;q<w;q+=13)B(x+q,y+2,5,2,theme===2||theme===4?'#667954':P.stone);
   for(let yy=5;yy<h-5;yy+=8){B(x,y+yy,2,5,P.light);B(x+w-2,y+yy,2,5,P.light);}return true;
  }
  if(o.type==='seam'){
   const ax=WX(o.ax),ay=WY(o.ay),bx=WX(o.bx),by=WY(o.by);line(ax,ay+3,bx,by+3,P.dark,3);line(ax,ay,bx,by,o.spent?'#555565':P.violet,1);
   const n=Math.max(1,Math.hypot(bx-ax,by-ay)/9);for(let j=0;j<n;j++)B(ax+(bx-ax)*j/n,ay+(by-ay)*j/n,3,2,P.iron);
   for(const [xx,yy]of [[ax,ay],[bx,by]]){B(xx-10,yy-10,20,21,P.dark);B(xx-9,yy-9,18,3,P.stone);B(xx-9,yy+9,18,3,P.stone);hub(xx,yy,7,o.spent?P.iron:P.violet);B(xx-2,yy-10,4,4,P.bone);}return true;
  }
  if(o.type==='ceVein'){
   const x=WX(o.x-o.w/2),y=WY(o.y+o.h),w=o.w*Z,h=o.h*Z;
   // A mineral fault held open by weathered stone jaws, with filaments flowing
   // in the current dash direction. The rectangular membrane is the full hitbox.
   B(x,y,w,h,'#24202f');for(let yy=0;yy<h;yy+=8){B(x,y+yy,3,6,P.violet);B(x+w-3,y+yy,3,6,o.ceVault?P.gold:P.violet);const q=(yy*13+t*35)%Math.max(1,w-8);B(x+4+q,y+yy+2,5,1,'#796888');}
   for(let q=0;q<w;q+=9){B(x+q,y,Math.min(8,w-q),3,P.stone);B(x+q,y+h-3,Math.min(8,w-q),3,P.stone);B(x+q+2,y+3,3,2,P.violet);}
   if(o.ceVault)for(let k=0;k<3;k++){B(x+w-7-k*2,y+h-9-k*7,3,3,P.gold);B(x+4+k*2,y+h-9-k*7,3,3,P.gold);}return true;
  }
  if(o.type==='cePrism'){
   const x=WX(o.x),y=WY(o.y+o.h/2),r=o.w*Z/2,col=o.ceSpent?P.iron:P.violet;
   B(x-r-3,y-8,4,22,P.iron);B(x+r-1,y-8,4,22,P.iron);B(x-r-3,y+13,r*2+6,4,P.stone);
   const turn=o.ceReact?Math.sin(o.ceReact*12)*3:0;
   for(let yy=-16;yy<=16;yy+=2){const w=Math.max(2,(16-Math.abs(yy))*.65);B(x-w+turn,y+yy,w*2,2,yy<0?col:'#625b7a');}
   B(x-2,y+(o.ceUp?-10:7),4,4,P.bone);if(!o.ceSpent)for(let k=0;k<3;k++)B(x-12+k*10,y+((t*22+k*13)%38)-19,1,2,P.violet);return true;
  }
  if(o.type==='ceRicochet'){
   const x=WX(o.x),y=WY(o.y+o.h/2),r=o.w*Z/2,col=o.ceSpent?P.iron:P.gold,shake=Math.sin((o.ceReact||0)*50)*(o.ceReact||0)*5;
   // A bell on a directional spring yoke: the struck clapper swings visibly.
   B(x-r-4,y-r,r*2+8,3,P.iron);for(let k=0;k<4;k++)B(x-r-5+k%2*2,y-r+3+k*4,4,2,P.light);
   for(let yy=-r+3;yy<r-2;yy+=2){const w=r*.45+(yy+r)/(r*2)*r*.5;B(x-w+shake,y+yy,w*2,2,col);B(x-w+2+shake,y+yy,2,2,P.bone);}
   B(x-r-2+shake,y+r-2,r*2+4,3,col);B(x+shake-2,y+r+1,4,4,P.bone);arrow(x,y,o.dx,o.dy,P.dark);return true;
  }
  if(o.type==='ceAetherSpring'){
   const x=WX(o.x),y=WY(o.y),squash=(o.ceReact||0)*8,col=o.ceSpent?'#56644e':'#8da572';
   for(let yy=-13;yy<14;yy+=3){const w=16-Math.abs(yy)*.55;B(x-w,y+yy*.8+squash,w*2,3,col);B(x-w+3,y+yy*.8+squash,3,3,'#bac197');}
   B(x-2,y-17+squash,4,6,'#475f42');arrow(x,y,o.dx,o.dy,'#d8d6a8');for(let k=0;k<3;k++)B(x-6+k*6,y-6+squash,2,7,'#567553');
   if(o.ceReact>0)for(let k=0;k<4;k++)B(x+o.dx*(k+1)*8,y-o.dy*(k+1)*8,2,2,P.bone);return true;
  }
  if(o.type==='ceGale'){
   const x=WX(o.x),y=WY(o.y),col=o.ceSpent?'#516252':P.cyan;
   // A split seed lantern releases the same compact aether form as the knight.
   for(let j=-12;j<=12;j+=3){const w=12-Math.abs(j)*.6;B(x-w,y+j,w*2,3,'#465d48');B(x-w+2,y+j,2,3,'#83967b');}
   for(let j=-7;j<=7;j+=2)B(x-3,y+j,6,2,col);
   if(!o.ceSpent){const flutter=Math.sin(t*9)*3;B(x-16,y-4+flutter,9,3,col);B(x+7,y-4-flutter,9,3,col);}return true;
  }
  if(o.type==='ceBlade'){
   const x=WX(o.x),y=WY(o.y),r=o.w*Z/2,col=o.ceSpent?'#606452':o.ceBlade==='pogo'?'#afad85':'#aa9978',kick=(o.ceFlash||0)*12;
   if(o.ceBlade==='pogo'){
    // Hovering shell beetle: a hard carapace receives the downward strike.
    const wing=o.ceSpent?3:Math.sin(t*19+o.x)*4;B(x-r-6,y+wing,8,3,'#778773');B(x+r-2,y-wing,8,3,'#778773');
    B(x-r,y-5+kick,r*2,9,col);B(x-r+3,y-8+kick,r*2-6,3,P.bone);B(x-1,y-6+kick,2,10,'#646952');
    B(x-r+2,y+5+kick,4,4,'#353d34');B(x+r-6,y+5+kick,4,4,'#353d34');B(x+r-1,y+1+kick,2,2,P.gold);
   }else{
    // Hanging seed pod: the soft underside opens when struck from below.
    for(let j=-12;j<12;j+=3){const w=12-Math.abs(j)*.45;B(x-w,y+j-kick,w*2,3,col);B(x-1,y+j-kick,2,3,'#6d634d');}
    B(x-8,y+12-kick,16,3,o.ceSpent?'#454c3c':P.bone);if(o.ceSpent)B(x-4,y+5-kick,8,6,P.dark);
   }return true;
  }
  if(o.type==='ceCheckpoint'){
   const x=WX(o.x),y=WY(o.y),lit=a.workshopCheckpoint?.room===a.room;
   B(x-3,y-30,6,30,P.iron);B(x-8,y-33,16,4,P.iron);B(x-7,y-29,14,12,lit?P.gold:P.dark);B(x-4,y-27,8,8,lit?P.bone:P.light);if(lit)text('REST LIT',x-20,y-40,P.gold);return true;
  }
  if(o.type==='ceGravityArch'){
   const x=WX(o.x),y=WY(o.y+o.h),h=o.h*Z,col=a.used.includes(o.ceMark)?P.cyan:P.violet;
   for(let yy=0;yy<h;yy+=12){B(x-15,y+yy,3,6,col);B(x+12,y+yy,3,6,col);}B(x-17,y-5,34,3,P.iron);return true;
  }
  if(o.type==='actRing'){const x=WX(o.x),y=WY(o.y);hub(x,y,8,P.gold);B(x-3,y-14,6,5,P.iron);B(x-5,y+9,10,3,P.iron);return true;}
  if(o.type==='ceWind'){
   const left=WX(o.x-o.w/2),top=WY(o.y+o.h),w=o.w*Z;
   for(let k=0;k<14;k++){const xx=left+((k*53+a.clock*o.wx*.3)%w+w)%w,yy=top+12+(k*23)%(o.h*Z-12);line(xx,yy,xx+Math.sign(o.wx)*8,yy-Math.sign(o.wy)*3,'#597d83');B(xx,yy,1,1,P.cyan);}return true;
  }
 }
 if(phase==='world'){
  for(const z of G.obstacles){if(z.ceRoom!==a.room)continue;
   if(z.ceShuttle){line(WX(z.ceHomeX),WY(z.ceHomeY)+10,WX(z.ceToX),WY(z.ceHomeY)+10,'#535853',2);hub(WX(z.ceHomeX),WY(z.ceHomeY)+10,4,P.iron);hub(WX(z.ceToX),WY(z.ceHomeY)+10,4,P.iron);if(z.gone){B(WX(z.x-z.w/2),WY(z.y),z.w*Z,4,P.iron);for(let k=0;k<4;k++)B(WX(z.x-z.w*.4+k*z.w*.25),WY(z.y)-8-k*3,2,3,P.gold);}}
   if(z.ceCrumble&&z.gone){const t=a.clock-z.ceFellAt;if(t<.65)for(let k=0;k<6;k++)B(WX(z.x-z.w*.4+k*z.w*.15),WY(z.ceHomeY-t*t*500)-k%3*5,3,3,P.stone);}
   if(z.ceMover){const x=WX(z.x),top=WY(z.ceHomeY+z.ceSpan+z.h),bottom=WY(z.ceHomeY-z.ceSpan);B(x-2,top,4,bottom-top,'#414b46');for(let yy=top;yy<bottom;yy+=8)B(x-3,yy,6,2,'#6a7166');hub(x,top,5,P.iron);hub(x,bottom,5,P.iron);}
  }
  if(G.p.actHook)line(WX(G.p.x),WY(G.p.y+26),WX(G.p.actHook.ring.x),WY(G.p.actHook.ring.y),P.gold);
  return true;
 }
 return false;
}
function flight(ctx,p,WX,WY,Z,f){
 ctx.save();
 for(let k=0;k<f.trail.length;k++){const t=f.trail[k];ctx.globalAlpha=k/f.trail.length*.35;ctx.fillStyle='#7fa9b1';ctx.fillRect(Math.round(WX(t.x))-2*Z,Math.round(WY(t.y))-2*Z,4*Z,4*Z);}
 ctx.globalAlpha=1;const angle=Math.round(Math.atan2(f.vy,f.vx)/(Math.PI/4))*Math.PI/4,co=Math.cos(angle),si=Math.sin(angle);
 for(let i=-15;i<=21;i+=3)for(let j=-12;j<=12;j+=3){if(Math.abs(i-1)/21+Math.abs(j)/13>1)continue;ctx.fillStyle=Math.abs(j)<4&&i>0?'#dddac5':Math.abs(j)<8?'#93bbb6':'#496c7e';ctx.fillRect(Math.round(WX(p.x+i*co-j*si)),Math.round(WY(p.y+22+i*si+j*co)),Math.max(1,3*Z),Math.max(1,3*Z));}
 ctx.restore();return true;
}
root.BladefallPrecisionArt=Object.freeze({draw,flight});
})(typeof window!=='undefined'?window:globalThis);
