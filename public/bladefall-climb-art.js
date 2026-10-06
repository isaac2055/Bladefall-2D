/* The Climb: presentation only. No simulation state, collision shapes, player sprites or saves are changed.
   Scenery uses world coordinates; terrain details are baked into the existing room cache. */
(function(root){
'use strict';
const px=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
const hash=(x,y)=>{let n=Math.imul(x+71,374761393)^Math.imul(y+29,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;};
const active=g=>/^cl\d+-/.test(g?.room?.id||'');
const theme=g=>({1:'outskirts',2:'woods',3:'causeway',4:'updrafts',5:'marksman',6:'keep',7:'gaol',8:'frost',9:'court',10:'ember',11:'foundry',12:'inversion',13:'citadel',14:'throne',15:'deepline',16:'cliffs',17:'shores',18:'colony',19:'palace',20:'sunspire'})[/^cl(\d+)-/.exec(g.room.id)?.[1]]||g.room.def.palette;
function poly(b,points,col){b.fillStyle=col;b.beginPath();points.forEach(([x,y],i)=>i?b.lineTo(Math.round(x),Math.round(y)):b.moveTo(Math.round(x),Math.round(y)));b.closePath();b.fill();}
function line(b,x,y,xx,yy,col){b.strokeStyle=col;b.lineWidth=1;b.beginPath();b.moveTo(Math.round(x)+.5,Math.round(y)+.5);b.lineTo(Math.round(xx)+.5,Math.round(yy)+.5);b.stroke();}
function arch(b,x,y,w,h,col){b.strokeStyle=col;b.lineWidth=3;b.beginPath();b.moveTo(x,y+h);b.lineTo(x,y+w/2);b.quadraticCurveTo(x+w/2,y-7,x+w,y+w/2);b.lineTo(x+w,y+h);b.stroke();}
const skies={outskirts:['#10182b','#51415b'],woods:['#091b1c','#203c35'],causeway:['#231b29','#65483e'],updrafts:['#263444','#a28b65'],marksman:['#211e27','#62513d'],keep:['#14182b','#383452'],gaol:['#10191e','#2d393b'],frost:['#182c47','#73999e'],court:['#17243a','#4c6b80'],
 ember:['#1c0d0b','#5a2216'],foundry:['#170f0c','#4a2d1c'],inversion:['#0f1426','#3a2f55'],citadel:['#0a0a16','#2a1f3d'],throne:['#05080f','#162238'],
 deepline:['#0b0b10','#2a241e'],cliffs:['#101826','#3a4a5c'],shores:['#14304a','#6a8a96'],colony:['#18120f','#4a3428'],palace:['#2c2440','#a8806a'],sunspire:['#3a2638','#d0a060'],
 fractured:['#0e0a1a','#3a2652']};   // (7.278) the Fractured worlds 21–24
function background(b,g,cam,W,H,p){
 const k=theme(g),t=g.frame,sky=skies[k]||skies.outskirts;
 b.save();const gr=b.createLinearGradient(0,0,0,H);gr.addColorStop(0,sky[0]);gr.addColorStop(1,sky[1]);b.fillStyle=gr;b.fillRect(0,0,W,H);
 if(['outskirts','keep','frost','court'].includes(k)){
  for(let i=0;i<32;i++){b.globalAlpha=.2+.3*Math.abs(Math.sin(t/100+i));px(b,((hash(i,2)*W-cam.x*.025)%W+W)%W,hash(i,7)*H*.6,1,1,'#cbdde0');}b.globalAlpha=1;
 }
 if(k==='outskirts'){
  const x=W*.82-cam.x*.012%W,y=31; b.fillStyle='#e7dbbb';b.beginPath();b.arc(x,y,10,0,Math.PI*2);b.fill();
  px(b,x-4,y-5,3,2,'#c6c4b1');px(b,x+2,y+3,4,2,'#cfccb6');
 }
 if(k==='palace'||k==='sunspire'){
  const x=W*.74-cam.x*.012%W,y=k==='sunspire'?30:44;b.globalAlpha=.75;b.fillStyle='#ffe6a0';b.beginPath();b.arc(x,y,k==='sunspire'?14:11,0,Math.PI*2);b.fill();
  b.globalAlpha=.15;b.beginPath();b.arc(x,y,30,0,Math.PI*2);b.fill();b.globalAlpha=1;
 }
 if(k==='frost'){
  for(let j=0;j<3;j++){b.globalAlpha=.08;poly(b,Array.from({length:42},(_,i)=>[i*W/40,22+j*8+Math.sin(i/7+t/250+j)*11]).concat([[W,65],[0,47]]),j===1?'#83dbc8':'#b3aedb');}b.globalAlpha=1;
 }
 // Two layers move at different speeds, without resetting at a section seam.
 for(let layer=0;layer<2;layer++){
  const speed=layer?.16:.055,spacing=k==='woods'?49:94,off=cam.x*speed,base=H*(layer?.93:.78)-Math.sin(cam.y*.001)*7;
  const col=layer?sky[0]:p.far;b.globalAlpha=layer?.64:.75;
  for(let i=Math.floor(off/spacing)-1;i<=Math.floor((off+W)/spacing)+1;i++){
   const x=i*spacing-off,h=42+hash(i,layer)*48,y=base-h;
   if(k==='woods'){
    const crown=y-25;
    poly(b,[[x-3,base+30],[x+7,y+17],[x+8,crown],[x+14,crown-17],[x+17,y+16],[x+26,base+30]],col);
    for(let j=0;j<4;j++){
     const by=y+j*15,side=j%2?-1:1;
     poly(b,[[x+10,by+14],[x+10+side*25,by-9],[x+10+side*37,by-14],[x+10+side*25,by-3],[x+15,by+22]],col);
    }
    for(let j=0;j<7;j++){
     const lx=x-24+j*10,ly=crown-9+hash(i,j+layer)*14;
     px(b,lx,ly,13,8,col);px(b,lx+3,ly-3,8,3,col);
    }
   }else if(k==='causeway'){
    px(b,x,y,64,5,col);px(b,x+1,y-7,4,7,col);px(b,x+55,y-4,4,4,col);
    arch(b,x+6,y+9,43,h,col);px(b,x,y+5,7,h+30,col);px(b,x+54,y+5,8,h+30,col);
    line(b,x+65,y+4,x+83,y+15,col);
   }else if(k==='updrafts'){
    poly(b,[[x-12,base+30],[x+2,y+18],[x+12,y],[x+26,y+5],[x+41,base+30]],col);
    px(b,x+12,y-17,2,21,col);line(b,x+13,y-17,x+36,y-10,col);
    poly(b,[[x+14,y-16],[x+35,y-11],[x+23,y-8]],col);
   }else if(k==='frost'){
    poly(b,[[x-45,base+30],[x+13,y-30],[x+83,base+30]],col);
    poly(b,[[x+13,y-30],[x-1,y-2],[x+10,y-8],[x+17,y+2],[x+24,y-2]],'#849eac');
    if(layer)for(let j=0;j<3;j++)poly(b,[[x+52,y+14+j*8],[x+40-j*3,y+39+j*8],[x+64+j*3,y+39+j*8]],col);
   }else if(k==='ember'){
    // forge chimneys with a glow at the mouth, and slag pipes between them
    px(b,x+6,y-18,12,h+50,col);px(b,x+3,y-22,18,5,col);
    b.globalAlpha=layer?.5:.35;px(b,x+8,y-23,8,2,'#ff8a3d');b.globalAlpha=layer?.64:.75;
    px(b,x+18,y+20,40,4,col);px(b,x+54,y+20,4,h,col);
   }else if(k==='foundry'){
    // gantry cranes with ladles hanging on chains, and squat crucibles
    px(b,x,y-10,70,4,col);px(b,x+2,y-10,4,h+40,col);
    for(let j=0;j<5;j++)px(b,x+44,y-6+j*6,2,4,col);
    poly(b,[[x+36,y+24],[x+54,y+24],[x+50,y+38],[x+40,y+38]],col);
    poly(b,[[x+8,base+30],[x+12,y+30],[x+30,y+30],[x+34,base+30]],col);
   }else if(k==='inversion'){
    // towers hanging from the dark above, upside down; prisms between
    const top=H*(layer?.07:.2)+Math.sin(cam.y*.001)*7,hh=42+hash(i,layer+5)*48;
    px(b,x+8,top-30,26,hh+30,col);poly(b,[[x+3,top+hh],[x+21,top+hh+22],[x+39,top+hh]],col);
    px(b,x+15,top+hh-14,3,8,sky[1]);
    if(!layer){b.globalAlpha=.25;poly(b,[[x+60,y-30],[x+66,y-44],[x+72,y-30],[x+66,y-20]],'#b9a8ef');b.globalAlpha=.75;}
   }else if(k==='citadel'){
    // ledger towers: tall shelving, split by violet cracks of the void
    px(b,x+4,y-20,30,h+50,col);for(let j=0;j<5;j++)px(b,x+6,y-14+j*12,26,1,sky[1]);
    b.globalAlpha=.35;line(b,x+19,y-20,x+16,y+14,'#a77be0');line(b,x+16,y+14,x+21,y+40,'#a77be0');b.globalAlpha=layer?.64:.75;
   }else if(k==='throne'){
    // drowned columns and broken arches under dark water
    px(b,x+6,y,10,h+40,col);px(b,x+4,y-3,14,4,col);px(b,x+48,y+12,10,h+40,col);
    arch(b,x+10,y+4,44,h,col);
   }else if(k==='deepline'){
    // pithead frames and their wheels, rails on trestles between
    px(b,x+6,y-24,4,h+60,col);px(b,x+30,y-24,4,h+60,col);line(b,x+8,y-24,x+32,y+10,col);line(b,x+32,y-24,x+8,y+10,col);
    b.strokeStyle=col;b.lineWidth=2;b.beginPath();b.arc(x+20,y-30,9,0,Math.PI*2);b.stroke();px(b,x+34,y+18,56,3,col);for(let j=0;j<4;j++)px(b,x+40+j*14,y+21,2,h,col);
   }else if(k==='cliffs'){
    // storm cliffs, sheer and jagged
    poly(b,[[x-20,base+30],[x-6,y+10],[x+8,y-14],[x+22,y+4],[x+36,y-28],[x+54,y+12],[x+70,base+30]],col);
   }else if(k==='shores'){
    // dunes and beached hulls with their masts
    poly(b,[[x-40,base+30],[x+15,base-12-hash(i,layer+7)*10],[x+75,base+30]],col);
    if(hash(i,layer+2)>.45){poly(b,[[x+4,base-22],[x+54,base-22],[x+46,base-10],[x+12,base-10]],col);
     px(b,x+27,base-70,2,48,col);poly(b,[[x+29,base-66],[x+46,base-34],[x+29,base-34]],col);}
   }else if(k==='colony'){
    // close-built houses, steep roofs, chimneys
    px(b,x+4,y,34,h+40,col);poly(b,[[x,y],[x+21,y-16],[x+42,y]],col);px(b,x+30,y-20,5,12,col);
    if(layer){b.globalAlpha=.5;px(b,x+12,y+10,4,5,'#f0b070');b.globalAlpha=.64;}
   }else if(k==='palace'){
    // the colonnade of the pilgrims' road
    px(b,x+6,y,8,h+40,col);px(b,x+3,y-4,14,4,col);px(b,x+46,y,8,h+40,col);px(b,x+43,y-4,14,4,col);px(b,x+2,y-9,56,5,col);
   }else if(k==='sunspire'){
    // gilded spires catching the sun
    px(b,x+10,y,18,h+40,col);poly(b,[[x+8,y],[x+19,y-40-hash(i,layer+3)*30],[x+30,y]],col);
    b.globalAlpha=layer?.4:.3;px(b,x+17,y-14,4,4,'#ffe6a0');b.globalAlpha=layer?.64:.75;
   }else if(k==='gaol'){
    px(b,x+10,y-30,6,h+60,col);px(b,x-4,y,68,5,col);arch(b,x+21,y+12,30,h,col);
    for(let j=0;j<4;j++)px(b,x+26+j*6,y+24,1,h,col);
    for(let j=0;j<7;j++){b.strokeStyle=col;b.lineWidth=1;b.strokeRect(x+65+(j%2),y-20+j*6,3,5);}
   }else{
    const tower=k==='court'?26:k==='marksman'?18:31;
    px(b,x+8,y,tower,h+30,col);px(b,x+5,y, tower+6,3,col);
    if(k==='court'||k==='keep')poly(b,[[x+3,y],[x+8+tower/2,y-22],[x+tower+13,y]],col);
    else for(let j=0;j<4;j++)px(b,x+7+j*8,y-5,5,7,col);
    px(b,x+15,y+13,3,10,sky[0]);px(b,x+15,y+38,3,7,sky[0]);
    if(k==='outskirts') {px(b,x+37,base-19,34,25,col);poly(b,[[x+34,base-19],[x+50,base-33],[x+75,base-19]],col);}
    if(k==='keep'||k==='court')arch(b,x+44,y+30,35,h,col);
    if(k==='marksman'){px(b,x+12,y-19,1,16,col);poly(b,[[x+13,y-19],[x+34,y-15],[x+13,y-10]],col);}
   }
  }
 }
 b.globalAlpha=1;
 // Atmospheric particles are deliberately dimmer than gameplay cues.
 const snow=k==='frost'||k==='court',wind=k==='updrafts'||k==='marksman';
 if(['ember','foundry','throne','inversion','citadel'].includes(k)){
  const rise=k!=='citadel',col={ember:'#ff9a4a',foundry:'#ffc070',throne:'#7fa6c8',inversion:'#c4b4ff',citadel:'#cdbfa0'}[k];
  for(let i=0;i<22;i++){const s2=.3+hash(i,9)*.7,x=((hash(i,3)*W+Math.sin(t/60+i)*6-cam.x*.2)%W+W)%W,y=((hash(i,4)*H+(rise?-1:1)*t*.22*s2-cam.y*.08)%H+H)%H;
   b.globalAlpha=k==='throne'?.22:.35*s2;if(k==='throne'){b.strokeStyle=col;b.lineWidth=1;b.strokeRect(Math.round(x),Math.round(y),2,2);}else px(b,x,y,k==='citadel'?3:1,k==='citadel'?2:1,col);}
  b.globalAlpha=1;b.restore();return true;
 }
 for(let i=0;i<(snow?32:14);i++){
  const s=.3+hash(i,8)*.7,x=((hash(i,3)*W+t*(wind?.65:.12)*s-cam.x*.2)%W+W)%W,y=((hash(i,4)*H+t*(snow?.24:.025)*s-cam.y*.08)%H+H)%H;
  b.globalAlpha=snow?.25:wind?.12:.18;px(b,x,y,wind?4:1,1,snow?'#e7f5ef':k==='woods'?'#c2daa2':p.accent);
 }
 b.restore();return true;
}
function terrain(b,g,p){
 if(!active(g))return;
 const k=theme(g),rm=g.room,cols=rm.cols,rows=rm.rows;
 const solid=(c,r)=>c>=0&&r>=0&&c<cols&&r<rows&&rm.grid[r*cols+c]===1;
 b.save();
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
  if(!solid(c,r))continue;const x=c*8,y=r*8,n=hash(c,r),top=r>0&&!solid(c,r-1);
  // Weathered courses stay inside solid stone; all walkable edges stay readable.
  if((!solid(c-1,r)||!solid(c+1,r)||top)&&n>.55){px(b,x+1,y+6,6,1,p.rockD);px(b,x+6,y+2,1,4,p.rockD);}
  if(k==='woods'||k==='outskirts'){
   if(top&&n>.35){px(b,x+1,y+1,5,1,p.moss);px(b,x+2,y+2,2,2,p.moss);}
   if(solid(c,r-1)&&!solid(c+1,r)&&n>.5){px(b,x+6,y,1,7,p.moss);px(b,x+4,y+4,2,1,p.moss);}
   if(k==='woods'&&n>.94){px(b,x+2,y+3,2,1,'#596957');px(b,x+3,y+4,1,2,'#596957');}
  }else if(k==='frost'||k==='court'){
   if(top){px(b,x,y,8,1,'#d1e3e7');px(b,x+1,y+1,6,1,'#8daebf');if(n>.5)px(b,x+5,y+2,1,2,'#8daebf');}
   if(n>.92){line(b,x+1,y+2,x+4,y+4,'#657e92');line(b,x+4,y+4,x+3,y+6,'#657e92');}
  }else if(k==='gaol'){
   if(c%4===0){px(b,x+3,y,2,8,'#252c30');if(r%2===0)px(b,x+3,y+3,1,1,'#81827a');}
   if(n>.7)px(b,x+5,y+4,2,2,'#575046');
  }else if(k==='ember'||k==='foundry'){
   if(top&&n>.6)px(b,x+1+Math.floor(n*5),y+1,2,1,k==='ember'?'#ff7a32':'#e0a050');
   if(k==='foundry'&&c%3===0&&r%3===1)px(b,x+3,y+3,2,2,'#2a1d18');
  }else if(k==='inversion'){
   if(r<rows-1&&!solid(c,r+1)&&n>.5)px(b,x+2,y+7,3,1,'#9c8be0');
   if(top&&n>.7)px(b,x+4,y+1,1,1,'#c4b4ff');
  }else if(k==='citadel'){
   if(c%2===0)px(b,x+3,y+1,1,6,'#1d1730');if(n>.93)px(b,x+1,y+3,5,1,'#8a6cc0');
  }else if(k==='throne'){
   if(top){px(b,x,y,8,1,'#3f5f7c');if(n>.6)px(b,x+2,y+1,3,1,'#2a4560');}
  }else if(k==='deepline'){
   if(top&&c%5===0)px(b,x,y+1,8,1,'#5a4a3a');if(n>.9)px(b,x+2,y+3,2,2,'#e0b060');
  }else if(k==='cliffs'){
   if(n>.6)line(b,x+1,y+1,x+5,y+6,'#283240');if(top)px(b,x,y,8,1,'#7a8a9a');
  }else if(k==='shores'){
   if(top){px(b,x,y,8,1,'#cfc49a');if(n>.6)px(b,x+3,y+1,2,1,'#a89c78');}
  }else if(k==='colony'){
   if(r%2===0&&c%3===0)px(b,x+1,y+3,6,1,'#2a221c');if(top&&n>.7)px(b,x+2,y+1,3,1,'#8a6a4c');
  }else if(k==='palace'||k==='sunspire'){
   if(top){px(b,x,y,8,1,k==='sunspire'?'#ffe0a0':'#e8d4a0');}if(c%4===0&&r%2===0)px(b,x+3,y+1,1,6,'#00000022');
  }else if(k==='keep'){
   if(r%3===0&&c%4===1){px(b,x+2,y+2,4,4,p.rock);px(b,x+3,y+3,2,1,'#76708a');px(b,x+3,y+4,1,2,'#76708a');}
  }else{
   if(n>.45)px(b,x+1,y+3,5,1,k==='updrafts'?'#745a3e':p.rockD);
   if(n>.8){px(b,x+4,y+4,1,3,p.rockD);px(b,x+5,y+5,2,1,p.rockD);}
  }
 }
 b.restore();
}
// Named belongings and proportions break up the old shared robe silhouette.
const people={vey:['pack',1],mara:['chart',2],sentinel:['armor',3],olan:['pack',4],rowan:['bell',5],orra:['herbs',6],pell:['tools',7],hale:['armor',8],bram:['pack',9],elsie:['basket',10],oren:['tools',11],sable:['scarf',12],silas:['armor',13],talla:['scarf',14],edrin:['pack',15],ilyra:['crystal',16],cartographer:['chart',17],recruit:['armor',18],tovin:['tools',19],veya:['lantern',20],idris:['book',21],archivist:['book',22],keeper:['keys',23],enna:['basket',24],nim:['lantern',25],neighbour:['scarf',26],ada:['tools',27],handler:['glove',28]};
function person(b,x,y,who,t,face){
 const H=root.BladefallPitchView.helpers,f=H.FOLK[who]||H.FOLK.olan,[role,seed]=people[who]||['pack',0],d=face<0?-1:1;
 const bob=Math.sin(t/36+seed)>.85?1:0,X=Math.round(x)-4,Y=Math.round(y)-15;
 b.save();px(b,X-1,y-1,11,1,'#00000055');
 // Boots remain planted while shoulders breathe; hems and scarves have a separate idle rhythm.
 px(b,X+1,Y+12,3,3,'#302d32');px(b,X+6,Y+12,3,3,'#302d32');
 poly(b,[[X+2,Y+5+bob],[X+7,Y+5+bob],[X+9,Y+12],[X,Y+12]],f.cloak);
 px(b,X+2,Y+7+bob,1,5,'#ffffff18');px(b,X+6,Y+7+bob,2,5,'#00000035');
 px(b,X+1,Y+9,7,1,'#322d32');px(b,X+4,Y+9,1,1,f.trim);px(b,X+2,Y+12,5,1,f.trim);
 px(b,X+2,Y+1+bob,5,4,f.skin);px(b,X+2,Y+bob,5,2,f.trim);
 if(f.hood){px(b,X+1,Y+bob,7,2,f.cloak);px(b,d>0?X+1:X+7,Y+2+bob,1,4,f.cloak);px(b,X+2,Y+5+bob,5,1,f.trim);}
 if(f.cap){px(b,X+1,Y+bob,7,2,f.cloak);px(b,d>0?X+5:X,Y+1+bob,4,1,f.trim);}
 if(f.helm){px(b,X+1,Y-1+bob,7,4,'#8e9da7');px(b,X+2,Y-1+bob,4,1,'#c1c6bf');px(b,X+2,Y+2+bob,5,1,'#29323d');}
 if((t+seed*13)%181>5)px(b,d>0?X+6:X+3,Y+3+bob,1,1,'#251f29');
 const hand=d>0?X+8:X-1,back=d>0?X-1:X+8;
 px(b,hand,Y+7+bob,2,3,f.skin);
 if(role==='pack'){px(b,back-1,Y+5,3,6,'#4c4036');px(b,back-1,Y+5,3,1,f.trim);px(b,back,Y+3,2,2,'#92917a');}
 if(role==='chart'||role==='book'){px(b,hand-2,Y+6+bob,6,5,role==='book'?'#614856':'#cabb94');px(b,hand,Y+7+bob,1,3,role==='book'?f.trim:'#897854');px(b,hand+2,Y+8+bob,1,1,f.trim);}
 if(role==='armor'){px(b,X,Y+5+bob,3,3,'#92999b');px(b,X+6,Y+5+bob,3,3,'#92999b');px(b,X+3,Y+6+bob,3,3,'#697783');px(b,X+4,Y+6+bob,1,2,f.trim);}
 if(role==='scarf'||who==='mara'){const wave=Math.round(Math.sin(t/17+seed));px(b,X,Y+5+bob,9,2,f.trim);px(b,back-2,Y+6+bob,3,3+wave,f.trim);}
 if(role==='tools'||role==='keys'){px(b,hand,Y+9,1,4,'#a6a8a0');px(b,hand-1,Y+9,3,1,f.trim);px(b,hand,Y+12,3,1,'#a6a8a0');if(role==='keys')px(b,hand+3,Y+10,1,3,f.trim);}
 if(role==='basket'||role==='herbs'){px(b,hand-1,Y+9,4,4,'#896e4a');px(b,hand-1,Y+10,4,1,f.trim);for(let i=0;i<3;i++)px(b,hand-1+i,Y+6+(i%2),1,3,'#899b67');}
 if(role==='bell'){px(b,hand,Y+9,1,2,'#574332');px(b,hand-1,Y+11,3,2,'#bea16a');px(b,hand,Y+13,1,1,'#dec28b');}
 if(role==='glove')px(b,hand-1,Y+7+bob,3,4,'#b0865c');
 if(f.staff||f.spear){const sx=d>0?X+11:X-3;px(b,sx,Y-2,1,17,'#8a7350');if(f.spear){poly(b,[[sx-1,Y-2],[sx,Y-6],[sx+2,Y-2]],'#bac9cc');px(b,sx-1,Y+1,3,1,f.trim);}else{px(b,sx-1,Y-3,3,2,f.trim);if(role==='crystal')poly(b,[[sx,Y-7],[sx+2,Y-4],[sx,Y-1],[sx-2,Y-4]],'#a4cdda');}}
 if(f.flame||role==='lantern'){
  const lx=hand+1;px(b,lx-1,Y+5,3,1,'#bda77c');px(b,lx-2,Y+6,5,6,'#394149');px(b,lx-1,Y+7,3,3,'#d88c44');px(b,lx,Y+7+(t%12<6?1:0),1,2,'#ffe0a0');px(b,lx-1,Y+11,3,1,'#bda77c');
 }
 b.restore();
}
function foeDetail(b,g,f){
 if(!active(g)||!f.alive)return;const x=f.x,y=f.y,t=g.roomFrame;
 b.save();
 if(f.kind==='moth'){const yy=y+(((t>>3)&1)?2:4);px(b,x+1,yy,1,1,'#927650');px(b,x+6,yy,1,1,'#927650');px(b,x+3,y+3,1,3,'#fff0b8');px(b,x+2,y,1,1,'#c7b784');px(b,x+5,y,1,1,'#c7b784');}
 if(f.kind==='shell'&&f.state!=='flip'){for(let i=0;i<3;i++){px(b,x+3+i*4,y+5,1,5,'#817190');px(b,x+4+i*4,y+6,2,1,'#30283e');}px(b,x+4,y+9,7,1,'#262333');}
 if(f.kind==='ram'){for(let i=0;i<4;i++)px(b,x+3+i*2,y+4+(i%2),1,3,'#a78158');px(b,x+4,y+8,7,1,'#513d31');}
 if(f.kind==='spit'){px(b,x+1,y+2,2,1,'#a5af64');px(b,x+5,y+5,2,1,'#879958');px(b,x+2,y+6,1,1,'#bdc580');}
 b.restore();
}
function combatDetail(b,g,e){
 if(!active(g)||e.dead||e.flash>0)return;const x=e.x,y=e.y,d=e.face>0?1:-1;
 b.save();
 if(e.kind==='guard'){px(b,x+3,y+6,1,6,'#a17271');px(b,x+6,y+7,2,4,'#352f3c');px(b,x+3,y+12,6,1,'#c3a26f');px(b,x+5,y,1,2,'#eece93');if(e.exposed<=0){const sx=d>0?x+9:x-1;px(b,sx+1,y+6,1,6,'#c5bda5');px(b,sx,y+8,4,1,'#c5bda5');}}
 else if(e.kind==='wing'){for(let i=0;i<3;i++){const flap=g.frame%16<8?-3:1;px(b,x-4+i*2,y+4+flap,1,2,'#bdad97');px(b,x+11+i*2,y+4+flap,1,2,'#bdad97');}px(b,x+4,y+5,3,2,'#3d4e60');}
 else if(e.kind==='hound'){px(b,x+3,y+3,7,1,'#b57d71');px(b,x+5,y+4,1,3,'#4b3d47');px(b,x+8,y+4,1,3,'#4b3d47');px(b,d>0?x+13:x+1,y+4,2,1,'#ded3b6');}
 else{px(b,x+3,y+6,2,6,'#baa37d');px(b,x+7,y+7,1,5,'#3a3e46');px(b,x+2,y+13,8,1,'#b79a63');line(b,x+1,y+4,x-2,y+12,'#746e5c');px(b,x-3,y+5,1,6,'#c4b38c');}
 b.restore();
}
// Boss details follow their existing poses and never cover aim lines, wards or recovery cues.
function bosses(b,g){
 if(!active(g))return;
 b.save();
 const m=g.mk;
 if(m&&!m.gone){
  px(b,m.x+2,m.y+8,1,6,'#635369');px(b,m.x+6,m.y+9,1,5,'#181923');
  px(b,m.x+3,m.y+7,4,1,'#947854');px(b,m.x+4,m.y+8,1,2,'#b29261');
  const qx=m.face>0?m.x:m.x+8;
  px(b,qx,m.y+6,2,6,'#594536');for(let i=0;i<2;i++)px(b,qx+i*2,m.y+2,1,4,'#9d8c71');
 }
 const w=g.warden;
 if(w&&!w.gone){
  const lean=w.state==='rush'?w.dir*2:w.state==='back'?-w.dir*2:0;
  if(!['crash','kneel'].includes(w.state)){
   px(b,w.x+5+lean,w.y+12,1,4,'#718699');px(b,w.x+w.w-6+lean,w.y+12,1,4,'#718699');
   if(w.state!=='back'){
    const sx=w.dir>0?w.x+w.w-3+lean:w.x-2+lean;
    px(b,sx+2,w.y+5,1,w.h-12,'#606e83');px(b,sx+1,w.y+8,3,1,'#d0ba88');
    px(b,sx+2,w.y+7,1,4,'#d0ba88');px(b,sx+1,w.y+w.h-5,1,1,'#e0d1ac');
   }
  }
 }
 const s=g.sorc;
 if(s&&!s.gone&&!['down','kneel','leave','blink'].includes(s.state)){
  const sway=s.state==='broken'?Math.round(Math.sin(g.frame/5)*1.5):0;
  px(b,s.x+5+sway,s.y+7,2,6,'#759db5');px(b,s.x+5+sway,s.y+8,1,1,'#e6ddb3');
  for(let i=0;i<3;i++)px(b,s.x+1+i*3,s.y+15,1,1,'#7293b7');
  px(b,s.x+5+sway,s.y-2,1,2,'#f3ffff');
 }
 b.restore();
}
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'climb-art',draw:bosses});
root.BladefallClimbArt={active,background,terrain,person,foeDetail,combatDetail};
})(typeof window!=='undefined'?window:globalThis);
