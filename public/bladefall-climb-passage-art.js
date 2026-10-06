/* Borderland art is drawn in world space. No player or simulation changes. */
(function(root){
'use strict';
const colors={1:['#111b30','#54536b','#343f51','#a5a989'],2:['#071b1b','#365750','#263d38','#83a878'],3:['#241f2b','#9b7560','#514548','#c3a278'],4:['#192d40','#ac9c83','#625f58','#d5c7a2'],5:['#211c2a','#88705e','#55444b','#c7ae83'],6:['#141a31','#676783','#45485e','#aeaac6'],7:['#0b1923','#405664','#313f48','#889b9e'],8:['#16324d','#9fbfc8','#536f86','#d0ebee'],9:['#13243c','#88a8bf','#405c77','#b9e6ed'],10:['#1c0d0b','#7a3a22','#4a2a22','#e08a52'],11:['#170f0c','#6b4a32','#43342c','#d0a066'],12:['#0f1426','#4f467a','#38345a','#b9a8ef'],13:['#0a0a16','#4a3a6a','#2e2840','#a68fd0'],14:['#05080f','#28405e','#1e2a3c','#7fa6c8'],
 15:['#0d0d12','#4a4038','#2c2824','#e0b060'],16:['#121a26','#5a6a7a','#36404c','#c8d4dc'],17:['#13263a','#8a8a70','#4a5560','#e2d6a8'],18:['#1a1512','#6a5240','#3e342c','#e0a868'],19:['#2a2236','#b09a78','#6a6058','#f0dca0'],20:['#2e2030','#c8a060','#7a6450','#ffe6a0'],
 21:['#150f22','#6a5a88','#3a3050','#c8b0f0'],22:['#0e1420','#506a80','#2c3a48','#a8c8e8'],23:['#1c1424','#8a6a88','#4a3a50','#e0b8e0'],24:['#141a2a','#8a86a8','#4a4a62','#d8d0f0'],
 25:['#140e20','#6e5e8c','#3a3050','#c8b0f0'],26:['#140e20','#6e5e8c','#3a3050','#c8b0f0'],27:['#140e20','#6e5e8c','#3a3050','#c8b0f0'],28:['#140e20','#6e5e8c','#3a3050','#c8b0f0'],29:['#140e20','#6e5e8c','#3a3050','#c8b0f0'],30:['#140e20','#6e5e8c','#3a3050','#c8b0f0'],31:['#140e20','#6e5e8c','#3a3050','#c8b0f0'],32:['#140e20','#6e5e8c','#3a3050','#c8b0f0'],33:['#140e20','#6e5e8c','#3a3050','#c8b0f0'],34:['#140e20','#6e5e8c','#3a3050','#c8b0f0'],35:['#140e20','#6e5e8c','#3a3050','#c8b0f0'],36:['#140e20','#6e5e8c','#3a3050','#c8b0f0'],37:['#140e20','#6e5e8c','#3a3050','#c8b0f0'],38:['#140e20','#6e5e8c','#3a3050','#c8b0f0'],39:['#140e20','#6e5e8c','#3a3050','#c8b0f0'],40:['#140e20','#6e5e8c','#3a3050','#c8b0f0']};
const hash=(n)=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
function mix(a,b,t){t=Math.max(0,Math.min(1,t));const n=parseInt(a.slice(1),16),m=parseInt(b.slice(1),16);return '#'+[16,8,0].map(s=>Math.round(((n>>s)&255)*(1-t)+((m>>s)&255)*t).toString(16).padStart(2,'0')).join('');}
function rect(b,x,y,w,h,c){b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function line(b,x,y,xx,yy,c,w=1){b.strokeStyle=c;b.lineWidth=w;b.beginPath();b.moveTo(x,y);b.lineTo(xx,yy);b.stroke();}
function shape(b,pts,c){b.fillStyle=c;b.beginPath();pts.forEach(([x,y],i)=>i?b.lineTo(x,y):b.moveTo(x,y));b.closePath();b.fill();}
function arch(b,x,y,w,h,c,thick=5){b.strokeStyle=c;b.lineWidth=thick;b.beginPath();b.moveTo(x,y+h);b.lineTo(x,y+w*.6);b.bezierCurveTo(x,y-w*.12,x+w,y-w*.12,x+w,y+w*.6);b.lineTo(x+w,y+h);b.stroke();}
function chain(b,x,y,len,c){for(let j=0;j<len;j+=8){b.strokeStyle=c;b.lineWidth=1;b.strokeRect(x+(j%16?1:0),y+j,3,6);}}
function background(b,g,cam,W,H){
 const d=g.room.def.atlasTransit,a=colors[d.left],z=colors[d.right],t=Math.max(0,Math.min(1,(cam.x+W/2)/g.room.w));
 const themes={roots:['#061b21','#254a40','#65876c'],canopy:['#091d29','#234942','#91bfa0'],viaduct:['#262137','#a37865','#e6bd91'],aqueduct:['#0c2631','#416d78','#85cbc8'],belltower:['#242136','#73666a','#d6b383'],siege:['#241827','#6a4349','#bc8770'],thaw:['#15334b','#7fa8ba','#d0eef1'],chains:['#080f1d','#28394b','#688399'],glass:['#142643','#607caa','#bbd7fb'],procession:['#17182f','#4b536f','#bcc3db'],spillway:['#081e27','#203e42','#739b91'],windbridge:['#24374d','#9296a1','#eed5b1'],cinder:['#1c0b08','#5e2414','#ff9a4a'],foundry:['#160e0b','#4d301e','#ffc070'],prism:['#101530','#3d3466','#c4b4ff'],void:['#07060f','#241a3a','#a77be0'],drowned:['#04070d','#132236','#7fa6c8'],rail:['#0b0b10','#2c2620','#e0a850'],cliffs:['#101826','#3c4c5e','#cfe0f0'],shores:['#10243a','#4a6a7a','#f0e0b0'],colony:['#18120f','#4a382c','#f0b070'],sunpath:['#2a2238','#8a6a5a','#ffe0a0'],sunspire:['#2c1e2e','#a07850','#fff0b8'],fractured:['#120a1e','#3a2a52','#c8b0f0']};
 const th=themes[d.style],sky=b.createLinearGradient(0,0,0,H);sky.addColorStop(0,th[0]);sky.addColorStop(1,th[1]);b.fillStyle=sky;b.fillRect(0,0,W,H);
 const time=g.frame,pt=(x,y,k)=>({x:x-cam.x*k,y:y-cam.y*k}),ink=(n)=>mix(th[0],th[2],n);
 // Geometry is anchored in the passage, so a tall shaft reveals a different
 // composition as one descends, while a long road reveals its own horizon.
 b.save();
 if(d.style==='roots'||d.style==='canopy'){
  for(let k=0;k<3;k++)for(let i=-1;i<10;i++){
   const dep=.17+k*.19,p=pt(i*119+(k%2)*53,80+k*45,dep),c=ink(.08+k*.06);
   b.strokeStyle=c;b.lineWidth=19+k*10;b.beginPath();b.moveTo(p.x-26,H+220);b.bezierCurveTo(p.x+20,140,p.x-12,-70,p.x+38,-230);b.stroke();
   for(let j=0;j<5;j++){const yy=p.y+j*60;shape(b,[[p.x-6,yy+24],[p.x-74,yy-30],[p.x-37,yy-17],[p.x+12,yy]],c);}
  }
  if(d.style==='roots'){
   const p=pt(265,170,.5);arch(b,p.x,p.y,190,220,ink(.3),15);arch(b,p.x+38,p.y+40,116,180,ink(.16),9);
   for(let i=0;i<12;i++){const q=pt(i*75,235+Math.sin(i)*14,.4);line(b,q.x,q.y,q.x+44,q.y,ink(.42));}
  }else{
   const p=pt(278,100,.56);shape(b,[[p.x-82,600],[p.x-39,70],[p.x-73,-180],[p.x+8,-220],[p.x+48,80],[p.x+82,600]],ink(.2));
   for(let i=0;i<8;i++){const q=pt(290+(i%2?65:-54),75+i*57,.56);shape(b,[[q.x-34,q.y],[q.x+36,q.y-14],[q.x+68,q.y-5],[q.x+13,q.y+10]],ink(.35));}
   const p2=pt(328,20,.3);b.globalAlpha=.16;shape(b,[[p2.x-36,-100],[p2.x+36,-100],[p2.x+140,H],[p2.x-85,H]],'#d8f5b4');b.globalAlpha=1;
  }
 }else if(d.style==='viaduct'){
  const sun=pt(340,40,.1);b.fillStyle='#c2998b';b.beginPath();b.arc(sun.x,sun.y,32,0,Math.PI*2);b.fill();
  for(let k=0;k<3;k++){const dep=.14+k*.18,c=ink(.08+k*.07);for(let i=-1;i<10;i++){const p=pt(i*121,92+k*53,dep);arch(b,p.x,p.y,100,250,c,13);rect(b,p.x-12,p.y-7,128,10,c);}}
  const p=pt(610,100,.63);shape(b,[[p.x-48,p.y],[p.x+29,p.y-23],[p.x+44,p.y-8],[p.x+4,p.y+36],[p.x-18,p.y+150]],ink(.22));
 }else if(d.style==='aqueduct'){
  for(let k=0;k<3;k++)for(let i=-1;i<9;i++){const p=pt(i*124,100+k*34,.18+k*.15);arch(b,p.x,p.y,103,170,ink(.11+k*.06),10);rect(b,p.x-5,p.y-9,121,6,ink(.22+k*.05));}
  for(let i=0;i<6;i++){const p=pt(80+i*159,0,.51);b.globalAlpha=.2;rect(b,p.x,20,5,400,'#bddcdb');for(let j=0;j<12;j++)rect(b,p.x+2,20+((j*31+time*.8)%350),2,11,'#d8f3de');b.globalAlpha=1;}
 }else if(d.style==='belltower'){
  for(let i=-1;i<8;i++){const p=pt(i*94,0,.24);shape(b,[[p.x,800],[p.x+6,76],[p.x+26,44],[p.x+42,77],[p.x+52,800]],ink(.1));}
  for(let i=0;i<5;i++){const p=pt(130,85+i*90,.63);arch(b,p.x,p.y,150,110,ink(.21),12);arch(b,p.x+29,p.y+18,30,54,ink(.05),4);arch(b,p.x+88,p.y+18,30,54,ink(.05),4);}
  const p=pt(292,110,.67);chain(b,p.x,p.y-200,208,ink(.35));shape(b,[[p.x-19,p.y],[p.x+19,p.y],[p.x+25,p.y+45],[p.x+39,p.y+59],[p.x-39,p.y+59],[p.x-25,p.y+45]],'#928072');line(b,p.x,p.y+50,p.x,p.y+77,'#bd9a70',4);
 }else if(d.style==='siege'){
  for(let k=0;k<3;k++)for(let i=-1;i<10;i++){const p=pt(i*109,80+k*55,.16+k*.18),c=ink(.1+k*.07);shape(b,[[p.x-12,400],[p.x,p.y+31],[p.x+10,p.y],[p.x+32,p.y+13],[p.x+44,p.y-10],[p.x+62,p.y+37],[p.x+73,400]],c);for(let j=0;j<4;j++)rect(b,p.x+j*15,p.y-2,7,22,c);}
  const p=pt(420,200,.55);b.save();b.translate(p.x,p.y);b.rotate(-.3);rect(b,-130,-14,260,23,ink(.25));for(const x of [-70,65]){b.strokeStyle=ink(.35);b.lineWidth=5;b.beginPath();b.arc(x,17,27,0,Math.PI*2);b.stroke();}b.restore();
 }else if(d.style==='thaw'){
  for(let k=0;k<3;k++){const dep=.17+k*.2,c=ink(.2+k*.14);for(let i=-1;i<8;i++){const p=pt(i*113,65+k*26,dep);shape(b,[[p.x-60,380],[p.x+10,p.y-120],[p.x+64,p.y],[p.x+113,380]],c);shape(b,[[p.x+10,p.y-120],[p.x-10,p.y-37],[p.x+15,p.y-52],[p.x+31,p.y-22],[p.x+37,p.y-55]],ink(.44+k*.13));}}
  b.globalAlpha=.25;for(let i=0;i<5;i++){const p=pt(i*140,115,.5);shape(b,[[p.x,-180],[p.x+72,-180],[p.x+28,p.y+51]],'#d6f1f5');}b.globalAlpha=1;
 }else if(d.style==='chains'){
  for(let k=0;k<3;k++)for(let i=-1;i<7;i++){const p=pt(i*101,0,.19+k*.19);rect(b,p.x-8,-100,15,1000,ink(.09+k*.07));chain(b,p.x+38,-(cam.y*(.19+k*.19))%16-16, H+40,ink(.18+k*.08));}
  for(let i=0;i<9;i++){const p=pt(i%2?270:150,40+i*95,.59);arch(b,p.x,p.y,53,60,ink(.25),3);rect(b,p.x-4,p.y+61,62,6,ink(.26));for(let j=1;j<6;j++)rect(b,p.x+j*8,p.y+18,2,44,ink(.18));}
  const p=pt(385,330,.71);chain(b,p.x+15,-cam.y*.71,550,ink(.38));rect(b,p.x,p.y,39,110,ink(.26));for(let j=0;j<4;j++)rect(b,p.x+3,p.y+j*29,33,3,ink(.38));
 }else if(d.style==='glass'){
  b.globalAlpha=.14;for(let i=0;i<4;i++){const y=28+i*15;shape(b,[[0,y],[W*.35,y+Math.sin(time*.004+i)*16],[W*.7,y-22],[W,y-3],[W,y+6],[W*.7,y-14],[W*.35,y+23],[0,y+8]],i%2?'#b6c3fa':'#96eddd');}b.globalAlpha=1;
  for(let k=0;k<3;k++)for(let i=-1;i<10;i++){const p=pt(i*99,110+k*36,.15+k*.16),c=ink(.2+k*.12);shape(b,[[p.x-29,400],[p.x-16,p.y],[p.x+9,p.y-70],[p.x+35,p.y+4],[p.x+42,400]],c);line(b,p.x+9,p.y-70,p.x+4,400,ink(.35+k*.12));}
  const p=pt(500,110,.4);arch(b,p.x,p.y,72,240,ink(.47),3);arch(b,p.x+20,p.y+27,32,180,ink(.4),2);
 }else if(d.style==='procession'){
  for(let k=0;k<3;k++)for(let i=-1;i<10;i++){const p=pt(i*110,75+k*43,.18+k*.16),c=ink(.1+k*.07);rect(b,p.x,p.y,17,300,c);shape(b,[[p.x-8,p.y],[p.x+8,p.y-31],[p.x+26,p.y]],c);arch(b,p.x+19,p.y+16,82,250,c,7);if(i%2){shape(b,[[p.x+23,p.y+19],[p.x+56,p.y+19],[p.x+51,p.y+109],[p.x+39,p.y+96],[p.x+23,p.y+113]],'#45415f');}}
  const p=pt(530,110,.44);rect(b,p.x,p.y,16,95,ink(.38));b.fillStyle=ink(.38);b.beginPath();b.arc(p.x+8,p.y-8,12,0,Math.PI*2);b.fill();shape(b,[[p.x-13,p.y+12],[p.x+30,p.y+12],[p.x+41,p.y+83],[p.x-22,p.y+83]],ink(.3));
 }else if(d.style==='spillway'){
  for(let i=-1;i<10;i++){const p=pt(i*135,195,.44);arch(b,p.x,p.y,110,180,ink(.19),16);arch(b,p.x+10,p.y+10,90,170,ink(.26),2);}
  for(let i=0;i<3;i++){const y=70+i*25-cam.y*.14;rect(b,0,y,W,10,ink(.12+i*.03));for(let x=-20;x<W;x+=63)rect(b,x-cam.x*.25%63,y-2,4,14,ink(.27));}
 }else if(d.style==='cinder'){
  // a stair cut through cooling slag: glowing seams below, chimneys above, embers rising
  for(let k=0;k<3;k++)for(let i=-1;i<9;i++){const p=pt(i*118,70+k*44,.16+k*.17),c=ink(.1+k*.08);rect(b,p.x,p.y-60,22,400,c);rect(b,p.x-4,p.y-66,30,7,c);b.globalAlpha=.4;rect(b,p.x+5,p.y-68,12,2,'#ff8a3d');b.globalAlpha=1;}
  for(let i=0;i<7;i++){const p=pt(i*150,250,.5);b.globalAlpha=.35;rect(b,p.x,p.y,90,3,'#ff7a32');rect(b,p.x+20,p.y+9,60,2,'#c4541f');b.globalAlpha=1;}
 }else if(d.style==='foundry'){
  // the shaft of the works: gantries, ladles on chains, a pour falling far off
  for(let k=0;k<3;k++)for(let i=-1;i<8;i++){const p=pt(i*140,40+k*60,.15+k*.18),c=ink(.1+k*.08);rect(b,p.x,p.y,120,6,c);rect(b,p.x+4,p.y,7,500,c);chain(b,p.x+80,p.y+6,60,ink(.3+k*.05));shape(b,[[p.x+66,p.y+66],[p.x+98,p.y+66],[p.x+92,p.y+88],[p.x+72,p.y+88]],c);}
  const p=pt(470,0,.4);b.globalAlpha=.45;rect(b,p.x,0,6,H,'#ff9a3a');for(let j=0;j<10;j++)rect(b,p.x-1,(j*37+time*1.6)%H,8,6,'#ffd27a');b.globalAlpha=1;
 }else if(d.style==='prism'){
  // a gallery hung upside down: arches open downward from the dark, prisms turning between them
  for(let k=0;k<3;k++)for(let i=-1;i<9;i++){const p=pt(i*120,-40+k*30,.14+k*.18),c=ink(.12+k*.08);rect(b,p.x,-200,16,p.y+260,c);rect(b,p.x+90,-200,16,p.y+260,c);
   b.strokeStyle=c;b.lineWidth=9;b.beginPath();b.moveTo(p.x+8,p.y+60);b.bezierCurveTo(p.x+8,p.y+140,p.x+98,p.y+140,p.x+98,p.y+60);b.stroke();}
  for(let i=0;i<8;i++){const p=pt(i*97+30,120+Math.sin(time*.01+i)*14,.45);b.globalAlpha=.3;shape(b,[[p.x,p.y-14],[p.x+9,p.y],[p.x,p.y+14],[p.x-9,p.y]],'#c4b4ff');b.globalAlpha=1;}
 }else if(d.style==='void'){
  // the breach between forge and citadel: ledgers torn open onto nothing
  for(let k=0;k<3;k++)for(let i=-1;i<9;i++){const p=pt(i*126,60+k*40,.16+k*.17),c=ink(.08+k*.08);rect(b,p.x,p.y,34,400,c);for(let j=0;j<6;j++)rect(b,p.x+2,p.y+8+j*14,30,1,ink(.02));}
  for(let i=0;i<5;i++){const p=pt(60+i*170,90,.5);b.globalAlpha=.5;b.strokeStyle='#a77be0';b.lineWidth=2;b.beginPath();b.moveTo(p.x,p.y-80);b.lineTo(p.x-10,p.y-10);b.lineTo(p.x+6,p.y+30);b.lineTo(p.x-4,p.y+120);b.stroke();b.globalAlpha=1;}
 }else if(d.style==='drowned'){
  // under the throne: drowned colonnades, light from far above, the water slowly moving
  b.globalAlpha=.12;for(let i=0;i<5;i++){const p=pt(60+i*150,0,.2);shape(b,[[p.x,-20],[p.x+30,-20],[p.x+90,H],[p.x+10,H]],'#9cc4e4');}b.globalAlpha=1;
  for(let k=0;k<3;k++)for(let i=-1;i<9;i++){const p=pt(i*112,90+k*40,.18+k*.17),c=ink(.1+k*.08);rect(b,p.x,p.y,14,400,c);rect(b,p.x-3,p.y-4,20,5,c);arch(b,p.x+7,p.y+10,98,300,c,6);}
 }else if(d.style==='rail'){
  // the Deep Line's workings: pit props and crossbeams, lamps hung along the gallery, rails catching their light
  for(let k=0;k<3;k++)for(let i=-1;i<9;i++){const p=pt(i*124,70+k*42,.16+k*.17),c=ink(.1+k*.08);rect(b,p.x,p.y-80,9,420,c);rect(b,p.x+92,p.y-80,9,420,c);rect(b,p.x-6,p.y-6,113,8,c);line(b,p.x+9,p.y+2,p.x+40,p.y+30,c,3);}
  for(let i=0;i<8;i++){const p=pt(i*124+50,96,.5),f=.3+.15*Math.sin(time*.05+i*1.7);chain(b,p.x,p.y-30,24,ink(.35));b.globalAlpha=f;rect(b,p.x-2,p.y-6,7,7,'#e0a850');b.globalAlpha=f*.35;b.fillStyle='#e0a850';b.beginPath();b.arc(p.x+1,p.y-2,16,0,Math.PI*2);b.fill();b.globalAlpha=1;}
  for(let i=0;i<2;i++){const y=246+i*6-cam.y*.5;rect(b,0,y,W,2,ink(.45));}
 }else if(d.style==='cliffs'){
  // sheer storm cliffs: jagged faces at three depths, chains slung between, now and then a flash of lightning
  for(let k=0;k<3;k++)for(let i=-1;i<8;i++){const p=pt(i*150+(k%2)*60,110+k*40,.14+k*.16),c=ink(.1+k*.09);shape(b,[[p.x-30,500],[p.x-10,p.y+40],[p.x+12,p.y],[p.x+30,p.y+22],[p.x+52,p.y-18],[p.x+80,p.y+30],[p.x+110,500]],c);}
  for(let i=0;i<4;i++){const p=pt(i*230+60,120,.48);b.strokeStyle=ink(.35);b.lineWidth=2;b.beginPath();b.moveTo(p.x,p.y);b.quadraticCurveTo(p.x+70,p.y+40,p.x+140,p.y);b.stroke();}
  if(time%310<5){const p=pt(((time/310|0)*173)%W+cam.x*.1,0,.1);b.globalAlpha=.55;line(b,p.x,0,p.x-14,60,'#e8f2ff',2);line(b,p.x-14,60,p.x+6,110,'#e8f2ff',2);line(b,p.x+6,110,p.x-8,170,'#e8f2ff',1);b.globalAlpha=1;}
 }else if(d.style==='shores'){
  // a landing beach: masts of beached ships, the long swell rolling in far below
  for(let k=0;k<2;k++)for(let i=-1;i<8;i++){const p=pt(i*170+k*80,150+k*30,.16+k*.2),c=ink(.14+k*.1);shape(b,[[p.x-50,p.y+40],[p.x+60,p.y+40],[p.x+46,p.y+58],[p.x-36,p.y+58]],c);line(b,p.x+4,p.y+40,p.x+4,p.y-80,c,3);line(b,p.x-24,p.y-50,p.x+34,p.y-50,c,2);}
  for(let j=0;j<5;j++){const y=232+j*9-cam.y*.4;b.globalAlpha=.18+j*.05;for(let x=-40;x<W+40;x+=46){const xx=x+((time*.4+j*13-cam.x*.3)%46);line(b,xx,y,xx+24,y+Math.sin(time*.03+x)*1.5,th[2]);}}b.globalAlpha=1;
 }else if(d.style==='colony'){
  // the colony under its smoke: huddled roofs with lit windows, chimneys trailing smoke
  for(let k=0;k<3;k++)for(let i=-1;i<9;i++){const p=pt(i*112+(k%2)*40,150+k*34,.15+k*.17),c=ink(.1+k*.08);rect(b,p.x,p.y,62,300,c);shape(b,[[p.x-6,p.y],[p.x+31,p.y-26],[p.x+68,p.y]],c);rect(b,p.x+46,p.y-34,8,22,c);
   if(k===2&&hash(i)>.35){b.globalAlpha=.55;rect(b,p.x+14,p.y+16,6,7,'#f0b070');rect(b,p.x+38,p.y+16,6,7,'#f0b070');b.globalAlpha=1;}}
  for(let i=0;i<6;i++){const p=pt(i*150+50,90,.4);b.globalAlpha=.12;for(let j=0;j<5;j++){b.fillStyle=th[2];b.beginPath();b.arc(p.x+j*7+Math.sin(time*.02+j+i)*4,p.y-j*14-(time*.2%14),6+j*2,0,Math.PI*2);b.fill();}b.globalAlpha=1;}
 }else if(d.style==='sunpath'||d.style==='sunspire'){
  // the road to the palace and the palace itself: white columns, a low sun, and (at Sunspire) gilded spires
  const sp=d.style==='sunspire',s0=pt(W*.7+cam.x*.05,60,.05);b.globalAlpha=.35;b.fillStyle='#ffe6a0';b.beginPath();b.arc(s0.x,s0.y,sp?34:26,0,Math.PI*2);b.fill();b.globalAlpha=.12;b.beginPath();b.arc(s0.x,s0.y,sp?70:52,0,Math.PI*2);b.fill();b.globalAlpha=1;
  for(let k=0;k<3;k++)for(let i=-1;i<9;i++){const p=pt(i*130+(k%2)*50,110+k*40,.15+k*.17),c=ink(.12+k*.09);
   if(sp){rect(b,p.x,p.y-40,26,400,c);shape(b,[[p.x-4,p.y-40],[p.x+13,p.y-110-hash(i+k)*40],[p.x+30,p.y-40]],c);if(k===2){b.globalAlpha=.4;rect(b,p.x+11,p.y-70,4,4,'#ffe6a0');b.globalAlpha=1;}}
   else{rect(b,p.x,p.y,12,400,c);rect(b,p.x-3,p.y-5,18,5,c);rect(b,p.x+58,p.y+10,12,400,c);rect(b,p.x+55,p.y+5,18,5,c);rect(b,p.x-3,p.y-12,76,6,c);}}
 }else if(d.style==='fractured'){
  // (7.278) the Fractured emerald: the familiar world broken into floating shards, a cold violet light through the cracks
  for(let k=0;k<3;k++)for(let i=-1;i<9;i++){const p=pt(i*126+(k%2)*48,120+k*38,.15+k*.17),c=ink(.1+k*.09),h=40+hash(i*7+k)*60,tilt=(hash(i+k*11)-.5)*18;
   shape(b,[[p.x,p.y],[p.x+38,p.y-h*.2+tilt],[p.x+52,p.y+h*.6],[p.x+20,p.y+h],[p.x-10,p.y+h*.5]],c);}
  for(let i=0;i<7;i++){const p=pt(i*140+30,70+hash(i)*90,.42),f=.25+.2*Math.sin(time*.04+i*2.1);b.globalAlpha=f;line(b,p.x,p.y,p.x+14,p.y+22,th[2],1);line(b,p.x+14,p.y+22,p.x+6,p.y+44,th[2],1);line(b,p.x+14,p.y+22,p.x+30,p.y+30,th[2],1);b.globalAlpha=1;}
 }else if(d.style==='windbridge'){
  for(let k=0;k<3;k++)for(let i=-1;i<8;i++){const p=pt(i*150,140+k*48,.13+k*.13);shape(b,[[p.x-70,400],[p.x+5,p.y-76],[p.x+81,p.y+11],[p.x+130,400]],ink(.2+k*.1));}
  for(let i=0;i<6;i++){const p=pt(i*170,100+i%2*34,.52);line(b,p.x,p.y-90,p.x,p.y+230,ink(.24),3);shape(b,[[p.x+2,p.y-74],[p.x+72,p.y-51],[p.x+12,p.y+29]],'#a7a0a0');}
  for(let i=0;i<9;i++){const x=((i*83-time*.7-cam.x*.3)%W+W)%W,y=(i*29+Math.sin(time*.02+i)*4)%H;line(b,x,y,x+31,y,'#bdc7ce');}
 }
 b.restore();
 // Distinct weather reads in silhouette: fireflies, embers, snow, or falling water.
 for(let i=0;i<24;i++){
  const rise=['cinder','foundry','drowned'].includes(d.style)?-2.4:1;
  const x=((hash(i)*W-time*(d.style==='windbridge'?.6:.06)-cam.x*.08)%W+W)%W,y=((hash(i+100)*H+rise*time*(d.style==='chains'?.18:.08)-cam.y*.04)%H+H)%H;
  b.globalAlpha=.12+hash(i+50)*.3;const cold=['glass','thaw'].includes(d.style);rect(b,x,y,cold?2:1,cold?2:1,th[2]);
 }b.globalAlpha=1;
 return true;
}
function terrainPalette(def,base){
 const style=def.atlasTransit?.style;
 const material={roots:['#294238','#88aa70'],canopy:['#354738','#a6ba80'],viaduct:['#67555b','#cfb797'],aqueduct:['#355c62','#91b6b4'],belltower:['#48414e','#b9ad95'],siege:['#51414a','#b49582'],thaw:['#4b768d','#d5ecec'],glass:['#39577e','#caeaff'],chains:['#223446','#94a5ad'],procession:['#45445e','#abb7d0'],spillway:['#263f42','#728d87'],windbridge:['#6a6665','#c3b391'],cinder:['#4a2a22','#e08a52'],foundry:['#43342c','#d0a066'],prism:['#38345a','#b9a8ef'],void:['#2e2840','#a68fd0'],drowned:['#1e2a3c','#7fa6c8'],rail:['#2c2824','#c09060'],cliffs:['#36404c','#b8c8d4'],shores:['#4a5560','#d8cca0'],colony:['#3e342c','#d09a68'],sunpath:['#6a6058','#e8d4a0'],sunspire:['#7a6450','#ffe0a0'],fractured:['#3c2c4e','#b49ae0']}[style];
 return material?{...base,rock:material[0],rockD:mix(material[0],'#101b24',.42),edge:material[1],moss:mix(material[0],material[1],.45)}:base;
}
function terrain(b,g){
 const d=g.room.def.atlasTransit;if(!d)return;
 const a=colors[d.left],z=colors[d.right];
 for(let r=0;r<g.room.rows;r++)for(let c=0;c<g.room.cols;c++){
  if(g.room.grid[r*g.room.cols+c]!==1)continue;
  const mat={roots:['#263e34','#88aa70'],canopy:['#354238','#a6ba80'],viaduct:['#67555b','#cfb797'],aqueduct:['#355c62','#91b6b4'],belltower:['#48414e','#b9ad95'],siege:['#51414a','#b49582'],thaw:['#4b768d','#d5ecec'],glass:['#39577e','#caeaff'],chains:['#223446','#94a5ad'],procession:['#45445e','#abb7d0'],spillway:['#263f42','#728d87'],windbridge:['#6a6665','#c3b391'],cinder:['#4a2a22','#e08a52'],foundry:['#43342c','#d0a066'],prism:['#38345a','#b9a8ef'],void:['#2e2840','#a68fd0'],drowned:['#1e2a3c','#7fa6c8'],rail:['#2c2824','#c09060'],cliffs:['#36404c','#b8c8d4'],shores:['#4a5560','#d8cca0'],colony:['#3e342c','#d09a68'],sunpath:['#6a6058','#e8d4a0'],sunspire:['#7a6450','#ffe0a0'],fractured:['#3c2c4e','#b49ae0']}[d.style];
  const t=c/(g.room.cols-1),nearLeft=c<g.room.cols/2,n=nearLeft?d.left:d.right;
  const region=root.BladefallClimb?.world(n),pal=root.BladefallPitchView?.climb?.palette(region?.palette);
  const fade=Math.min(1,(nearLeft?c:g.room.cols-1-c)*8/256);
  const exposed=!r||g.room.grid[(r-1)*g.room.cols+c]!==1||!c||c===g.room.cols-1||g.room.grid[r*g.room.cols+c-1]!==1||g.room.grid[r*g.room.cols+c+1]!==1;
  const base=(exposed?pal?.rock:pal?.rockD)||(nearLeft?a[2]:z[2]);
  const col=mix(base,mix(mat[0],mix(a[2],z[2],t),.15),fade),edge=mix(pal?.edge||(nearLeft?a[3]:z[3]),mat[1],fade);
  rect(b,c*8,r*8,8,8,col);
  if(!r||g.room.grid[(r-1)*g.room.cols+c]!==1){rect(b,c*8,r*8,8,2,edge);if(hash(c*7)>.5)rect(b,c*8+2,r*8-2,2,3,mix(edge,col,.3));}
  const organic=['roots','canopy','thaw','glass'].includes(d.style);
  if(organic&&hash(c*13+r*7)>.94){line(b,c*8,r*8,c*8+4,r*8+5,mix(col,edge,.22));}
  if(!organic&&(c+r)%3===0){line(b,c*8,r*8+7,c*8+7,r*8+7,mix(col,a[0],.22));line(b,c*8+(r%2?2:6),r*8,c*8+(r%2?2:6),r*8+7,mix(col,a[0],.22));}
 }
 if(['roots','canopy'].includes(d.style)){
  for(let c=3;c<g.room.cols-5;c+=9){
   const x=c*8,y=d.floor[c]*8;
   b.save();b.globalAlpha=Math.min(1,c*8/192,(g.room.cols-c)*8/192);
   b.strokeStyle='#52664a';b.lineWidth=3;b.beginPath();b.moveTo(x,y+6);b.bezierCurveTo(x-8,y+25,x+34,y+18,x+30,y+42);b.stroke();
   if(c%3===0){line(b,x,y,x-3,y-12,'#739265');for(let k=0;k<4;k++)shape(b,[[x-2,y-3-k*2],[x-10+k,y-7-k*2],[x-3,y-5-k*2],[x+5-k,y-11-k*2]],'#75936b');}
   if(hash(c)>.4){rect(b,x+12,y-3,1,4,'#a0ad86');rect(b,x+10,y-5,5,2,'#88b2a0');}
   b.restore();
  }
 }

}
function details(b,g,viewport){
 if(g.room.def.atlasTerrain){
  const terrain=g.room.def.atlasTerrain,d=g.room.def.atlasTransit;
  b.save();b.beginPath();
  for(let r=Math.max(0,Math.floor((viewport?.y||0)/8)-2);r<Math.min(g.room.rows,Math.ceil(((viewport?.y||0)+184)/8)+2);r++)for(const [a,z] of terrain.spans[r])b.rect(a*8,r*8,(z-a)*8,8);
  b.clip();
  const material={roots:'root',canopy:'root',thaw:'ice',glass:'ice',chains:'cage',windbridge:'rope',belltower:'bell',aqueduct:'pipe',spillway:'pipe',cinder:'stone',foundry:'cage',prism:'ice',void:'stone',drowned:'pipe',rail:'cage',cliffs:'rope',shores:'rope',colony:'stone',sunpath:'stone',sunspire:'stone'}[d.style];
  const decks=d.decks.filter(p=>!viewport||p.r*8>viewport.y-80&&p.r*8<viewport.y+240&&p.c*8<viewport.x+400&&(p.c+p.w)*8>viewport.x-80).map(p=>({...p,material}));
  details(b,{...g,ents:g.ents.filter(e=>e.type!=='stone'),room:{...g.room,def:{...g.room.def,atlasTerrain:null,atlasTransit:{...d,decks}}}});
  b.restore();
  const winch=g.ents.find(e=>e.type==='stone');
  if(winch){const x=winch.x+4,y=winch.y+4,col=winch.lit?'#e4d69a':'#92a89c';b.strokeStyle=col;b.lineWidth=1;b.beginPath();b.arc(x,y,7,0,Math.PI*2);b.stroke();line(b,x-5,y-5,x+5,y+5,col);line(b,x+5,y-5,x-5,y+5,col);b.fillStyle=col;b.font='5px monospace';b.textAlign='center';b.fillText(winch.lit?'SERVICE ROAD OPEN':'STRIKE · SERVICE WINCH',x,y-18);b.textAlign='left';}

  for(const port of g.room.def.atlasSockets){
   if(g.room.def.atlasFold)continue;
   const x=port.plane+(port.edge==='left'?18:-18),y=port.floor*8-24,label=root.BladefallClimb.world(port.world)?.name||'';
   b.font='5px monospace';b.textAlign=port.edge==='left'?'left':'right';b.fillStyle='#d8d4b2';b.fillText((port.edge==='left'?'← ':'')+label+(port.edge==='right'?' →':''),x,y);
   // (7.280) and where in that region this end comes out
   const end=root.BladefallClimb.world(port.world)?.rooms.find(d=>d.id===port.to);
   if(end){b.font='4px monospace';b.fillStyle='#b9b49a';b.fillText((end.atlasGate?'a postern over its road':String(end.id).endsWith('-atlas-crossroads')?'the end of its climb':'the start of its climb')+(end.name?' · '+end.name:''),x,y+6);}
   b.textAlign='left';
  }
  return;
 }
 const d=g.room.def.atlasTransit;
 if(!d){
  if(!g.room.def.atlasJunction)return;
  const n=g.room.def.atlasRegion,a=colors[n]||colors[1];
  const ground=g.room.def.atlasFloor;
  for(const e of g.ents.filter(e=>e.type==='thru')){
   const x=e.x,y=e.y,w=e.w;
   rect(b,x,y,w,2,mix(a[3],a[2],.25));rect(b,x,y+2,w,3,a[2]);
   for(let k=5;k<w;k+=17)line(b,x+k,y+1,x+k-2,y+4,a[0]);
   const bottom=(ground?.[Math.min(g.room.cols-1,Math.floor((x+w/2)/8))]||22)*8;
   if(bottom-y>14){
    if(n===2){b.strokeStyle=a[2];b.lineWidth=4;b.beginPath();b.moveTo(x+w*.5,y+4);b.bezierCurveTo(x+w*.2,y+12,x+w*.8,bottom-4,x+w*.4,bottom+6);b.stroke();}
    else if(n===8||n===9)shape(b,[[x+4,y+4],[x+w-4,y+4],[x+w*.6,Math.min(bottom,y+26)]],a[2]);
    else{arch(b,x+4,y+7,Math.max(8,w-8),Math.max(8,bottom-y-7),mix(a[2],a[0],.25),4);}
   }
  }
  if(g.room.def.atlasMain?.edge==='down'){
   const cs=g.room.def.atlasMain.cols,x=(cs[0]+cs.at(-1)+1)*4;
   b.font='4px monospace';b.textAlign='center';b.fillStyle='#f2df9b';b.fillText('↓ RETURN TO '+root.BladefallClimbPassages.names[n].toUpperCase(),x,g.room.h-17);b.textAlign='left';
  }
  for(const s of g.room.def.atlasSockets||[]){
   if(s.preview)continue;
   const x=s.edge==='left'?18:g.room.w-18,y=s.floor*8-10;
   const link=s.link&&root.BladefallClimbAtlas.links.find(l=>l.id===s.link),to=link?(link.a===n?link.b:link.a):n;
   const world=root.BladefallClimb.world(n),original=s.kind==='room'&&!s.link,begin=original&&s.to===world.atlasStart;
   // (7.280) each mouth says where it goes and whether it is open: a sealed one is barred and names what opens it;
   // an open one names where in that region it arrives (its start, its end, or a postern over its road)
   const info=!original&&s.link?root.BladefallClimbMap?.describeSocket?.(g.room.def,s):null,sealed=!!(info&&!info.open);
   if(sealed&&s.folded){const bx=s.edge==='left'?0:g.room.w-11,top=(s.floor-5)*8;rect(b,bx,top,11,40,'rgba(8,10,14,.72)');for(let k=1;k<11;k+=3){rect(b,bx+k,top,2,40,'#b9beb6');rect(b,bx+k+2,top,1,40,'#3d4140');}for(const r of [2,19,36])rect(b,bx,top+r,11,2,'#7b817c');}
   line(b,x,y-12,x,y+8,sealed?'#8a7f72':a[3]);line(b,x-7,y-10,x+7,y-10,sealed?'#8a7f72':a[3]);
   const label=root.BladefallClimbPassages.names[to],note=original?(begin?'ENTER THE CLIMB':'RETURN TO THE CLIMB'):info?(sealed?'SEALED · '+info.reason:info.where):root.BladefallClimbPassages.designs[s.link][0];
   const tx=s.edge==='left'?6:g.room.w-6,ty=s.floor*8-29,head=(s.edge==='left'?'← ':'')+label+(s.edge==='right'?' →':'');
   if(info){const wide=Math.max(head.length,note.length)*3+6,px=s.edge==='left'?tx-3:tx-wide+3;rect(b,px,ty-6,wide,15,'rgba(9,11,16,.72)');if(sealed){rect(b,px,ty-6,wide,1,'#a8695a');rect(b,px,ty+8,wide,1,'#a8695a');}}
   b.font='5px monospace';b.textAlign=s.edge==='left'?'left':'right';
   b.fillStyle=original?'#f2df9b':sealed?'#d9c9b8':a[3];b.fillText(head,tx,ty);
   b.font=info?'5px monospace':'4px monospace';b.fillStyle=original?'#f2df9b':sealed?'#f0a58a':info?'#cfd8c6':a[3];b.fillText(note,tx,ty+7);b.textAlign='left';
  }
  return;
 }
 const a=colors[d.left],z=colors[d.right],time=g.frame;
 for(const p of d.decks){
  const x=p.c*8,y=p.r*8,w=p.w*8,col=mix(a[3],z[3],x/g.room.w),dark=mix(a[2],z[2],x/g.room.w);
  if(p.material==='root'){
   shape(b,[[x,y],[x+w,y],[x+w-9,y+6],[x+8,y+9]],'#66735b');
   b.strokeStyle='#3b5045';b.lineWidth=5;b.beginPath();b.moveTo(x+5,y+5);b.bezierCurveTo(x-12,y+30,x+38,y+29,x+23,y+53);b.stroke();
   for(let k=0;k<w;k+=13){rect(b,x+k,y,8,2,'#a0bc79');rect(b,x+k+1,y+5,7,3,'#769561');rect(b,x+k+4,y+8,5,2,'#5d7e58');}
  }else if(p.material==='cage'){
   rect(b,x,y,w,4,'#98a2a4');chain(b,x+4,y-44,44,'#718895');chain(b,x+w-7,y-44,44,'#718895');
   for(let k=0;k<w;k+=12)line(b,x+k,y+4,x+k,y+20,'#4b6578');rect(b,x-2,y+21,w+4,3,'#4d6370');
  }else if(p.material==='rope'){
   rect(b,x,y,w,3,'#baa182');for(let k=0;k<w;k+=6)rect(b,x+k,y,1,4,'#6e6464');
   line(b,x+3,y-15,x+3,y+6,'#aaa397');line(b,x+w-3,y-15,x+w-3,y+6,'#aaa397');
   b.strokeStyle='#a09a87';b.lineWidth=1;b.beginPath();b.moveTo(x+3,y-14);b.bezierCurveTo(x+w*.3,y-6,x+w*.7,y-6,x+w-3,y-14);b.stroke();
  }else if(p.material==='ice'){
   shape(b,[[x,y],[x+w,y],[x+w-10,y+8],[x+w*.55,y+21],[x+w*.4,y+9],[x+5,y+8]],'#779eba');rect(b,x,y,w,2,'#d4f1ee');line(b,x+w*.55,y+2,x+w*.55-5,y+16,'#b8ddf5');
  }else if(p.material==='bridge'){
   rect(b,x,y,w,5,col);rect(b,x+5,y+5,w-10,5,dark);
   const bottom=d.floor[Math.max(0,Math.min(g.room.cols-1,p.c))]*8;
   rect(b,x+w/2-5,y+10,10,Math.max(0,bottom-y-10),dark);
   for(let k=0;k<w;k+=14)line(b,x+k,y+1,x+k+1,y+5,dark);
   line(b,x+2,y-9,x+2,y,col);line(b,x+w-2,y-9,x+w-2,y,col);
  }else if(p.material==='bell'){
   rect(b,x,y,w,5,'#b0a58f');shape(b,[[x+4,y+5],[x+w-4,y+5],[x+w-12,y+15],[x+12,y+15]],'#5c5666');
   line(b,x+8,y+7,x+w-8,y+7,'#8c7b75');
  }else if(p.material==='pipe'){
   rect(b,x,y,w,5,'#668983');for(let k=0;k<w;k+=18)rect(b,x+k,y-1,3,7,'#9aaf9c');
  }else{
   rect(b,x,y,w,4,col);shape(b,[[x+3,y+4],[x+w-3,y+4],[x+w-11,y+11],[x+10,y+11]],dark);
  }
 }
 for(const s of d.scenery){
  const x=s.c*8,y=s.r*8,w=(s.w||8)*8;
  if(s.kind==='hollow-tree'){
   b.save();b.globalAlpha=.65;
   shape(b,[[x-w*.35,y+210],[x-w*.18,y-140],[x-w*.3,y-260],[x+w*.16,y-240],[x+w*.12,y-40],[x+w*.35,y+210]],'#233e34');
   for(let j=0;j<7;j++){const yy=y-160+j*52;line(b,x-w*.12,yy,x-w*.62,yy-24,'#425a40',5);line(b,x+w*.1,yy+20,x+w*.5,yy-12,'#425a40',4);}
   arch(b,x-w*.16,y-10,w*.32,90,'#142c29',8);line(b,x+w*.1,y-140,x+w*.2,y+130,'#55754b',2);b.restore();
  }else if(s.kind==='broken-arch'){
   b.save();b.globalAlpha=.55;arch(b,x,y-80,w,190,'#65545a',12);rect(b,x-10,y-88,w*.4,9,'#ad9383');rect(b,x+w*.7,y-88,w*.34,9,'#ad9383');shape(b,[[x+w*.4,y-88],[x+w*.49,y-80],[x+w*.38,y-64]],'#78616a');b.restore();
  }else if(s.kind==='tower'){
   b.save();b.globalAlpha=.5;for(let j=0;j<4;j++){const yy=y+j*55;arch(b,x,yy,w,60,'#66596a',8);arch(b,x+16,yy+14,23,25,'#a08b7b',2);}b.restore();
  }else if(s.kind==='procession'){
   b.save();b.globalAlpha=.6;rect(b,x-w/2,y+100,w,12,'#5a596b');shape(b,[[x-12,y+8],[x+12,y+8],[x+30,y+98],[x-28,y+98]],'#737285');b.fillStyle='#9895a7';b.beginPath();b.arc(x,y-1,11,0,Math.PI*2);b.fill();line(b,x-3,y-6,x+4,y-6,'#343446',2);b.restore();
  }else if(s.kind==='root'){
   b.strokeStyle='#365447';b.lineWidth=7;b.beginPath();b.moveTo(x-50,0);b.bezierCurveTo(x-12,y-50,x+27,y-25,x+48,y+50);b.stroke();
   for(let j=0;j<9;j++)shape(b,[[x+j*5,y+j*7],[x+j*5-14,y+j*7-3],[x+j*5-7,y+j*7+9]],'#5a7960');
  }else if(s.kind==='pool'||s.kind==='mirror'||s.kind==='drain'){
   b.save();b.globalAlpha=s.kind==='mirror'?.45:.28;rect(b,x,y,w,14,s.kind==='mirror'?'#98bada':'#568a88');
   for(let i=0;i<12;i++)rect(b,x+((i*31+time*.1)%w),y+2+(i%4)*3,11+hash(i)*9,1,'#d2e3d5');b.restore();
   if(s.kind==='drain')for(let i=0;i<5;i++){const xx=x+i*w/5;arch(b,xx,y-18,22,26,'#314e52',3);for(let k=1;k<5;k++)line(b,xx+k*4,y-9,xx+k*4,y+5,'#7c928d');}
  }else if(s.kind==='waterfall'){
   const floor=d.floor[s.c]*8;b.save();b.globalAlpha=.34;rect(b,x,y,w,Math.max(0,floor-y),'#9bccce');
   for(let j=0;j<9;j++)rect(b,x+hash(j)*w,y+((j*37+time*.7)%Math.max(1,floor-y)),1,10,'#d3eddf');b.restore();
  }else if(s.kind==='pipe'){
   rect(b,x,y,w,9,'#4a7275');rect(b,x,y,w,2,'#8eaaa4');for(let j=0;j<w;j+=27)rect(b,x+j,y-2,4,13,'#658a86');
  }else if(s.kind==='torn-banner'){
   line(b,x,y-10,x,y+70,'#948181',2);line(b,x,y,x+25,y,'#948181');
   const flutter=Math.sin(time*.025+x)*3;shape(b,[[x+3,y+2],[x+25,y+2],[x+23+flutter,y+51],[x+16+flutter,y+43],[x+7+flutter,y+58]],d.style==='procession'?'#74768a':'#78515b');
   line(b,x+12,y+7,x+13+flutter,y+34,'#bda493');
  }else if(s.kind==='sail'){
   const flutter=Math.sin(time*.024+s.c)*5;line(b,x,y-12,x,y+160,'#9c9683',3);
   shape(b,[[x+3,y],[x+w+flutter,y+18],[x+8,y+65]],'#bbb9aa');line(b,x+4,y+3,x+9,y+57,'#e0d0b5');
  }else if(s.kind==='crystal'){
   b.save();b.globalAlpha=.6;shape(b,[[x,y+140],[x-9,y+18],[x+w*.35,y],[x+w*.7,y+32],[x+w*.6,y+140]],'#86adcb');shape(b,[[x+w*.35,y],[x+w*.3,y+140],[x+w*.6,y+140],[x+w*.7,y+32]],'#56799f');line(b,x+w*.35,y,x+w*.3,y+140,'#d4eeed');b.restore();
  }else if(s.kind==='ice-roof'){
   for(let i=0;i<w;i+=23){const tip=12+hash(i)*24;shape(b,[[x+i,y],[x+i+16,y],[x+i+7,y+tip]],'#769dae');line(b,x+i+8,y+2,x+i+7,y+tip-3,'#b2d6df');}
  }else if(s.kind==='ram'){
   rect(b,x-w/2,y,w,10,'#685159');shape(b,[[x+w/2-14,y-8],[x+w/2+10,y-1],[x+w/2+10,y+10],[x+w/2-14,y+15]],'#9b8580');for(const xx of [x-w*.3,x+w*.25]){b.strokeStyle='#817977';b.lineWidth=3;b.beginPath();b.arc(xx,y+17,13,0,Math.PI*2);b.stroke();}
  }else if(s.kind==='rubble'){
   for(let i=0;i<8;i++){const xx=x+i*11;shape(b,[[xx,y],[xx+4,y-7-hash(i)*12],[xx+12,y-4],[xx+18,y]],'#8d7774');}
  }else if(s.kind==='counterweight'){
   chain(b,x+12,0,y+68,'#75858e');rect(b,x,y,w,68,'#3c5164');for(let i=0;i<5;i++)rect(b,x+3,y+i*14,w-6,2,'#657885');
  }else if(s.kind==='bell'){
   chain(b,x,0,y,'#978f8a');shape(b,[[x-12,y],[x+12,y],[x+19,y+34],[x+26,y+41],[x-26,y+41],[x-19,y+34]],'#a0937a');line(b,x,y+34,x,y+48,'#c4b194',3);
  }else if(s.kind==='fallen-bell'){
   b.save();b.translate(x,y);b.rotate(.9);shape(b,[[-12,-27],[12,-27],[18,0],[25,5],[-25,5],[-18,0]],'#776760');b.restore();
  }
 }
 if(d.lift){
  const lift=g.ents.find(e=>e.type==='climb-lift')||{...d.lift,y:d.lift.bottom};
  for(const x of [lift.x+4,lift.x+lift.w-6])chain(b,x,d.lift.top-42,lift.y-d.lift.top+42,'#9badb5');
  rect(b,lift.x-2,lift.y,lift.w+4,5,'#b8b5a5');rect(b,lift.x+3,lift.y+5,lift.w-6,8,'#4a5b68');
  line(b,lift.x+3,lift.y-20,lift.x+3,lift.y,'#8e9da3',2);line(b,lift.x+lift.w-3,lift.y-20,lift.x+lift.w-3,lift.y,'#8e9da3',2);
  b.fillStyle='#b5beb3';b.font='5px monospace';b.textAlign='center';b.fillText('COUNTERWEIGHT',lift.x+lift.w/2,d.lift.bottom+23);b.textAlign='left';
 }
 const winch=g.ents.find(e=>e.type==='stone');
 if(winch){
  const x=winch.x+4,y=winch.y+4,col=winch.lit?'#e4d69a':'#92a89c';
  b.strokeStyle=col;b.lineWidth=1;b.beginPath();b.arc(x,y,7,0,Math.PI*2);b.stroke();line(b,x-5,y-5,x+5,y+5,col);line(b,x+5,y-5,x-5,y+5,col);
  line(b,x,y-8,x,d.crown*8-10,mix(col,a[0],.4));line(b,x,d.crown*8-10,d.gateC*8,d.crown*8-10,mix(col,a[0],.4));
  if(!winch.lit){b.fillStyle='#d8d4bc';b.font='6px monospace';b.textAlign='center';b.fillText('STRIKE · SERVICE WINCH',x,y-19);b.textAlign='left';}
 }
}
root.BladefallClimbPassageArt={background,terrain,details,terrainPalette};
})(typeof window!=='undefined'?window:globalThis);
