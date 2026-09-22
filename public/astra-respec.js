/* Astra's isolated movement trial; never reads or writes campaign saves. */
'use strict';
const canvas=document.getElementById('scene');
let c=canvas.getContext('2d');
const W=1280,H=720,LENGTH=5700,keys=new Set();
const FEEL={speed:320,groundAccel:3200,airAccel:2100,brake:4200,jump:570,airJump:530,gravity:1550,fallGravity:1950,coyote:.12,buffer:.14,wallGrace:.12,wallSlide:85,dashSpeed:760,dashTime:.16};
let time=0,cam=0,last=0,accumulator=0,particles=[],enemies=[],p,completed=false,checkpoint=0,portals=[],nextPortal=0,trails=[],cue='',cueT=0,paused=false;
// Ledges are one-way; brass-edged pillars are solid and climbable.
const platforms=[{x:-100,y:564,w:860,h:210},{x:890,y:508,w:220,h:260},{x:1270,y:442,w:240,h:330},{x:1630,y:564,w:1260,h:220},{x:2010,y:430,w:155,h:28},{x:2420,y:335,w:180,h:28},{x:2940,y:564,w:410,h:210},{x:3460,y:630,w:260,h:140},{x:3910,y:440,w:360,h:320},{x:4420,y:530,w:250,h:240},{x:4860,y:425,w:190,h:340},{x:5210,y:540,w:600,h:230}];
const walls=[{x:2230,y:305,w:62,h:259},{x:2680,y:245,w:64,h:319},{x:4690,y:275,w:58,h:445}];
const stations=[
 {x:170,y:564,name:'01 · Stride & air',hint:'Tap / hold jump for height. Jump again in midair. Dash across the long gaps.'},
 {x:1730,y:564,name:'02 · The climbing court',hint:'Hold toward a brass wall to cling; jump away. Wall-jumps restore your air jump and dash.'},
 {x:3050,y:564,name:'03 · Folded space',hint:'Drop into the blue floor portal. Keep your momentum through the amber exit.'},
 {x:3990,y:440,name:'04 · Flow run',hint:'Chain jump → dash → cling → wall-jump. Reach the rose gate, then retry or choose another station.'}
];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const approach=(v,target,step)=>v<target?Math.min(v+step,target):Math.max(v-step,target);
function poly(points,fill,stroke){c.beginPath();points.forEach((q,i)=>i?c.lineTo(...q):c.moveTo(...q));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=1.5;c.stroke();}}
function line(x,y,xx,yy,color,width=1){c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function ellipse(x,y,rx,ry,color){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();}
function glow(x,y,r,col){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
function announce(text){cue=text;cueT=1.4;}
function defaultPortals(){portals=[{x:3580,y:607,nx:0,ny:-1},{x:3950,y:352,nx:1,ny:0}];nextPortal=0;announce('Course portal pair restored');}
function spawn(index=checkpoint){checkpoint=index;const s=stations[index];keys.clear();p={x:s.x,y:s.y,vx:0,vy:0,face:1,ground:true,coyote:FEEL.coyote,buffer:0,dashBuffer:0,attack:0,cool:0,dash:0,dashCd:0,dashReady:true,dashX:1,dashY:0,hurt:0,hp:5,airJump:true,wall:0,wallGrace:0,wallSide:0,cling:0,wallLock:0,portalCd:0,momentum:0,squash:0,anim:0};trails=[];cam=clamp(p.x-440,0,LENGTH-W);completed=false;updateHud();}
function reset(){time=0;particles=[];enemies=[{x:590,y:564,home:590,hp:3,face:-1,t:0,hit:0},{x:4200,y:440,home:4170,hp:3,face:-1,t:1,hit:0}];defaultPortals();spawn(0);}
const jumpKeys=['Space','KeyW','ArrowUp'];
function press(key){if(!keys.has(key)){
 if(jumpKeys.includes(key))p.buffer=FEEL.buffer;
 if(key==='KeyJ'&&p.cool<=0){p.attack=.25;p.cool=.34;enemies.forEach(e=>e.struck=false);}
 if(key.startsWith('Shift'))p.dashBuffer=FEEL.buffer;
 if(key==='KeyQ')placePortal(0);if(key==='KeyE')placePortal(1);
 if(key==='KeyF'){if(placePortal(nextPortal))nextPortal=1-nextPortal;}
 if(key==='KeyX')defaultPortals();
 }keys.add(key);}
function release(key){keys.delete(key);if(jumpKeys.includes(key)&&!jumpKeys.some(k=>keys.has(k))&&p.vy<-210&&p.dash<=0)p.vy=-210;}
addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight','KeyJ','KeyA','KeyD','KeyW','KeyS','KeyQ','KeyE','KeyF','KeyX','Escape','KeyR','Digit1','Digit2','Digit3','Digit4'].includes(e.code))e.preventDefault();
 if(e.repeat)return;if(e.code==='Escape'){location.href='./index.html';return;}if(e.code==='KeyR'){spawn();return;}if(/^Digit[1-4]$/.test(e.code)){spawn(Number(e.code.slice(-1))-1);return;}press(e.code);});
addEventListener('keyup',e=>release(e.code));
addEventListener('blur',()=>{keys.clear();paused=true;last=0;});addEventListener('focus',()=>{paused=false;last=0;});
document.querySelectorAll('[data-key]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);press(b.dataset.key);};b.onpointerup=b.onpointercancel=()=>release(b.dataset.key);});
document.querySelectorAll('[data-station]').forEach(b=>b.onclick=()=>spawn(Number(b.dataset.station)));
document.getElementById('reset').onclick=reset;
document.getElementById('retry').onclick=()=>spawn();
document.getElementById('restore').onclick=defaultPortals;
function burst(x,y,color,n=12){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=40+Math.random()*150;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-30,life:.3+Math.random()*.4,color});}}
function placePortal(index){
 const floor=keys.has('ArrowDown')||keys.has('KeyS');
 const candidate=floor?{x:p.x+p.face*65,y:p.y-23,nx:0,ny:-1}:{x:p.x+p.face*64,y:p.y-35,nx:-p.face,ny:0};
 // A mouth needs a clear opening and enough room to eject the full player.
 const ex=candidate.x+candidate.nx*46,ey=candidate.y+candidate.ny*46;
 const blocked=walls.some(w=>(ex+16>w.x&&ex-16<w.x+w.w&&ey+34>w.y&&ey-34<w.y+w.h)||(candidate.x+10>w.x&&candidate.x-10<w.x+w.w&&candidate.y+52>w.y&&candidate.y-52<w.y+w.h))||
 platforms.some(s=>ex+16>s.x&&ex-16<s.x+s.w&&ey-32<s.y&&ey+34>s.y);
 if(blocked||candidate.x<40||candidate.x>LENGTH-40||candidate.y<90||candidate.y>680){announce('Move into clear space to place this mouth');return false;}
 portals[index]=candidate;burst(candidate.x,candidate.y,index?'#eec586':'#99e9ee',16);announce((index?'Amber':'Blue')+' mouth placed · '+(floor?'floor-facing':'walk into it'));return true;
}
function jump(kind){p.vy=-(kind==='double'?FEEL.airJump:FEEL.jump);p.buffer=0;p.coyote=0;p.ground=false;p.dash=0;p.squash=-.15;
 if(kind==='wall'){p.vx=-p.wallSide*380;p.face=-p.wallSide;p.wallLock=.15;p.wall=0;p.wallGrace=0;p.airJump=true;p.dashReady=true;announce('Wall kick · air jump + dash refreshed');}
 if(kind==='double'){p.airJump=false;announce('Second jump');burst(p.x,p.y-4,'#d2e9b6',15);}else burst(p.x,p.y,'#a0b7a8',7);
 // A buffered tap released before landing still produces a short hop.
 if(!jumpKeys.some(k=>keys.has(k)))p.vy=Math.max(p.vy,-300);
}
function startDash(){let dx=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));
 let dy=Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp'));
 if(!dx&&!dy)dx=p.face;const length=Math.hypot(dx,dy);p.dashX=dx/length;p.dashY=dy/length;p.dash=FEEL.dashTime;p.dashCd=.24;p.dashReady=false;p.dashBuffer=0;p.wallLock=0;p.momentum=0;p.vx=p.dashX*FEEL.dashSpeed;p.vy=p.dashY*FEEL.dashSpeed;announce('Dash');}
function teleport(oldX,oldY){if(p.portalCd>0||portals.length<2)return false;
 for(let i=0;i<2;i++){const a=portals[i],b=portals[1-i];if(!a||!b)continue;
 const before=(oldX-a.x)*a.nx+(oldY-34-a.y)*a.ny,after=(p.x-a.x)*a.nx+(p.y-34-a.y)*a.ny;
 const tangent=(p.x-a.x)*(-a.ny)+(p.y-34-a.y)*a.nx;
 if(before>=0&&after<=20&&after<before&&Math.abs(tangent)<47){
 const into=-(p.vx*a.nx+p.vy*a.ny),across=p.vx*(-a.ny)+p.vy*a.nx;
 if(into<=0)continue;
 p.x=b.x+b.nx*48;p.y=b.y+b.ny*48+34;
 const speed=Math.max(320,into);p.vx=b.nx*speed+(-b.ny)*across;p.vy=b.ny*speed+b.nx*across;
 p.face=p.vx<0?-1:1;p.portalCd=.28;p.ground=false;p.coyote=0;p.wall=0;p.wallGrace=0;p.airJump=true;p.dashReady=true;p.momentum=.22;p.dash=0;p.wallLock=0;
 burst(a.x,a.y,i?'#eec586':'#99e9ee',20);burst(b.x,b.y,i?'#99e9ee':'#eec586',20);cam=clamp(p.x-440,0,LENGTH-W);announce('Fold · momentum carried through');return true;
 }}return false;
}
function update(dt){time+=dt;cueT-=dt;for(const key of ['buffer','dashBuffer','coyote','attack','cool','dash','dashCd','hurt','wallGrace','wallLock','portalCd','momentum'])p[key]=Math.max(0,p[key]-dt);
 const move=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));
 if(move&&p.wallLock<=0&&p.dash<=0)p.face=move;
 if(p.ground){p.coyote=FEEL.coyote;p.airJump=true;if(p.dash<=0&&p.dashCd<=0)p.dashReady=true;}
 if(p.buffer>0){if(p.ground||p.coyote>0)jump('ground');else if(p.wallGrace>0)jump('wall');else if(p.airJump)jump('double');}
 if(p.dashBuffer>0&&p.dashCd<=0&&p.dashReady)startDash();
 if(p.dash>0){p.vx=p.dashX*FEEL.dashSpeed;p.vy=p.dashY*FEEL.dashSpeed;}
 else{if(p.wallLock<=0&&p.momentum<=0)p.vx=approach(p.vx,move*FEEL.speed,dt*(move?(p.ground?FEEL.groundAccel:FEEL.airAccel):(p.ground?FEEL.brake:1000)));
 const apex=Math.abs(p.vy)<65&&!p.ground?.75:1;p.vy+=dt*(p.vy>0?FEEL.fallGravity:FEEL.gravity)*apex;p.vy=Math.min(p.vy,1050);}
 const oldX=p.x,oldY=p.y;const wasGround=p.ground;p.wall=0;p.ground=false;
 p.x=clamp(p.x+p.vx*dt,18,LENGTH-18);
 for(const w of walls)if(p.y>w.y+2&&p.y-66<w.y+w.h-2){
  if(oldX+15<=w.x+.1&&p.x+15>=w.x){p.x=w.x-15;p.vx=0;p.wall=1;}
  else if(oldX-15>=w.x+w.w-.1&&p.x-15<=w.x+w.w){p.x=w.x+w.w+15;p.vx=0;p.wall=-1;}
 }
 if(p.wall&&p.dash>0)p.dash=0;
 p.y+=p.vy*dt;
 // Detect a portal before a floor landing; a floor mouth is a traversable opening.
 const folded=teleport(oldX,oldY);
 if(!folded){for(const s of [...platforms,...walls]){
  if(p.x+13>s.x&&p.x-13<s.x+s.w&&p.vy>=0&&oldY<=s.y+1&&p.y>=s.y){if(p.vy>200){burst(p.x,s.y,'#a8bbaa',7);p.squash=.12;}p.y=s.y;p.vy=0;p.ground=true;p.wall=0;}
 }
 for(const w of walls)if(p.x+13>w.x&&p.x-13<w.x+w.w&&p.vy<0&&oldY-66>=w.y+w.h&&p.y-66<w.y+w.h){p.y=w.y+w.h+66;p.vy=0;p.dash=0;}
 }
 if(p.wall&&!p.ground&&p.wallLock<=0){p.wallSide=p.wall;p.wallGrace=FEEL.wallGrace;
  if(move===p.wall&&p.vy>=0){if(p.cling<=0)p.cling=.16;p.vy=Math.min(p.vy,p.cling>dt?22:FEEL.wallSlide);p.cling=Math.max(dt,p.cling-dt);if(Math.random()<dt*18)burst(p.x+p.wall*15,p.y-30,'#ddcf9d',1);}
 }else p.cling=0;
 if(p.ground){p.airJump=true;if(p.dashCd<=0&&p.dash<=0)p.dashReady=true;if(p.buffer>0)jump('ground');}
 if(wasGround&&!p.ground&&p.vy>=0)p.coyote=FEEL.coyote;
 p.squash=approach(p.squash,0,dt*1.3);p.anim+=Math.abs(p.vx)*dt*.055;
 if(p.dash>0||p.momentum>0){if(!trails.length||time-trails[trails.length-1].born>.025)trails.push({x:p.x,y:p.y,face:p.face,born:time});}trails=trails.filter(t=>time-t.born<.18);
 if(p.y>810){spawn();announce('Back at the lantern · try again');return;}
 for(let i=checkpoint+1;i<stations.length;i++)if(p.x>=stations[i].x&&p.ground){checkpoint=i;announce('Lantern reached · R to retry here');}
 for(const e of enemies){if(e.hp<=0)continue;e.t+=dt;e.hit-=dt;const distance=p.x-e.x;e.face=distance>0?1:-1;
  if(Math.abs(distance)<170&&Math.abs(p.y-e.y)<65)e.x+=e.face*(Math.abs(distance)>43?45:0)*dt;else e.x+=Math.sin(e.t)*13*dt;e.x=clamp(e.x,e.home-70,e.home+70);
  if(p.attack>0&&!e.struck&&Math.abs(distance)<98&&-distance*p.face>-15&&Math.abs(p.y-e.y)<70){e.struck=true;e.hp--;e.hit=.18;e.x+=p.face*18;burst(e.x,e.y-35,e.hp?'#e6c17b':'#9ae2d6',e.hp?14:30);}
  if(Math.abs(distance)<36&&Math.abs(p.y-e.y)<48&&p.hurt<=0&&p.dash<=0&&p.attack<=0){p.hp=Math.max(1,p.hp-1);p.hurt=1;burst(p.x,p.y-25,'#cf846c');announce('Practice hit · no movement interruption');}
 }
 particles=particles.filter(q=>q.life>0);particles.forEach(q=>{q.life-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=240*dt;});
 cam+=(clamp(p.x-440+clamp(p.vx*.18,-65,90),0,LENGTH-W)-cam)*(1-Math.exp(-dt*9));
 if(p.x>5510&&!completed){completed=true;announce('Flow complete · R to repeat, or 1 for the start');burst(5510,470,'#f6d68c',35);}
 updateHud();
}
function hudText(id,value){const node=document.getElementById(id);if(node.textContent!==value)node.textContent=value;}
function updateHud(){hudText('status',stations[checkpoint].name+' · '+stations[checkpoint].hint);
 hudText('readout',(p.airJump?'AIR JUMP ●':'AIR JUMP ○')+'   '+(p.dashReady?'DASH ●':'DASH ○')+'   '+(p.wall?'WALL '+(p.vy<=25?'CLING':'SLIDE'):p.ground?'GROUNDED':p.coyote>0?'COYOTE':'AIRBORNE'));
 hudText('cue',cueT>0?cue:completed?'Flow complete · choose a station to go again':'');
 document.querySelectorAll('[data-station]').forEach(b=>{const active=String(Number(b.dataset.station)===checkpoint);if(b.getAttribute('aria-pressed')!==active)b.setAttribute('aria-pressed',active);});
}
// Art direction: weathered limestone, blue-hour air, worn steel and linen.
// Material textures are deterministic and baked once; motion stays crisp.
const ART={ink:'#14262d',stone:'#556365',light:'#bec7b1',moss:'#526958',steel:'#8ba5ab',gold:'#bb9c64'};
const stoneCache=new Map();
const noise=(a,b=0)=>{const n=Math.sin(a*127.1+b*311.7)*43758.5453;return n-Math.floor(n);};
function shade(x,y,x2,y2,colors){const g=c.createLinearGradient(x,y,x2,y2);colors.forEach((col,i)=>g.addColorStop(i/(colors.length-1),col));return g;}
function shape(points,fill,edge){c.beginPath();for(const [i,q] of points.entries()){if(i===0)c.moveTo(q[0],q[1]);else if(q.length===6)c.bezierCurveTo(...q);else if(q.length===4)c.quadraticCurveTo(...q);else c.lineTo(...q);}c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(edge){c.strokeStyle=edge;c.lineWidth=.8;c.stroke();}}
function arch(x,y,w,h,color){c.strokeStyle=color;c.lineWidth=11;c.beginPath();c.moveTo(x,y+h);c.lineTo(x,y+w*.65);c.bezierCurveTo(x,y+w*.22,x+w*.25,y+w*.17,x+w*.5,y);c.bezierCurveTo(x+w*.75,y+w*.17,x+w,y+w*.22,x+w,y+w*.65);c.lineTo(x+w,y+h);c.stroke();}
function fern(x,y,size,seed,col){c.save();c.translate(x,y);c.strokeStyle=col;c.lineWidth=1;for(let j=-2;j<=2;j++){const ex=j*size*.32,ey=-size*(1-Math.abs(j)*.15);c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(ex*.2,ey*.8,ex,ey);c.stroke();for(let k=2;k<7;k++){const t=k/7,px=ex*t*t,py=ey*t,leaf=size*.15*(1-t)+1;shape([[px,py],[px-leaf-2,py-3],[px-leaf,py-7],[px+1,py-3]],col);shape([[px,py],[px+leaf,py-5],[px+leaf+2,py-8],[px+2,py-3]],col);}}c.restore();}
function background(){
 c.fillStyle=shade(0,0,0,H,['#101d30','#344957','#6d8083','#8e9b91']);c.fillRect(0,0,W,H);
 const moonX=975-cam*.035;glow(moonX,150,220,'#d5e0d019');ellipse(moonX,150,48,48,'#c6d2c4');ellipse(moonX-10,142,37,36,'#c0ccbf');
 for(let i=0;i<27;i++){let x=noise(i,9)*W,y=noise(i,20)*230;ellipse(x,y,.7,.7,'#c9d5ca66');}
 // Long, quiet clouds cut across the light. No repeated triangular beams.
 for(let i=0;i<7;i++){const x=noise(i,2)*1450-100-cam*.015,y=95+i*29;c.fillStyle=shade(0,y,0,y+18,['#273a4a00','#273a4a44','#273a4a00']);c.fillRect(x,y,220+noise(i,4)*400,18);}
 for(let layer=0;layer<3;layer++){c.save();c.translate(-cam*(.08+layer*.085),0);const col=['#4b616a','#465c65','#3c535f'][layer];for(let i=-1;i<15;i++){const x=i*265+noise(i,layer)*80,y=245+noise(i,30+layer)*130-layer*12;shape([[x,560],[x,y+75],[x+45,y+60],[x+65,y-55],[x+80,y-80],[x+105,y-58],[x+121,y+65],[x+180,y+85],[x+195,560]],col);if(layer>0){for(let k=0;k<3;k++){c.fillStyle='#aebbaa12';c.fillRect(x+72+k*12,y-25,5,28);}}}c.restore();}
 // An old aqueduct recedes behind the playable masonry. Broken crowns vary.
 c.save();c.translate(-cam*.36,0);
 for(let i=-1;i<15;i++){const x=i*320,y=190+noise(i,7)*44;const col=i%3===0?'#425a60':'#3c555c';
  arch(x+32,y,218,430,col);arch(x+44,y+16,194,414,'#70847e29');
  for(let k=0;k<7;k++){const yy=y+155+k*39;line(x+28,yy,x+38,yy,'#b0b9a71b');line(x+244,yy,x+255,yy,'#b0b9a71b');}
  for(let k=0;k<6;k++){const t=k/6,xx=x+34+t*103,yy=y+132*(1-t)*(1-t);line(xx-3,yy-5,xx+4,yy+4,'#c7cdb41c');line(x+282-(xx-x),yy-5,x+276-(xx-x),yy+4,'#c7cdb417');}

  c.fillStyle=shade(x,0,x+47,0,['#29434d',col,'#526b6b']);c.fillRect(x+13,y+142,34,390);
  poly([[x,y+130],[x+16,y+119],[x+47,y+124],[x+56,y+138],[x+50,y+151],[x,y+151]],col);
  for(let j=0;j<5;j++){line(x+15,y+180+j*62,x+44,y+178+j*62,'#1e35452e');}
  if(i%3!==1){line(x+30,y+6,x+97,y-20,'#677e771f',10);line(x+169,y-9,x+253,y+28,col,15);}
  // Hanging ivy belongs to this depth plane.
  for(let j=0;j<5;j++){const xx=x+45+j*6,len=30+noise(i,j)*120;line(xx,y+147,xx+Math.sin(j)*8,y+147+len,'#334e49',2);}
 }
 c.restore();
 const mist=shade(0,410,0,H,['#a2b3a100','#819b9648','#657f8130']);c.fillStyle=mist;c.fillRect(0,410,W,H-410);
 // Soft distant tree silhouettes break the architectural repetition.
 c.save();c.translate(-cam*.52,0);for(let i=0;i<8;i++){const x=i*660+520;shape([[x-14,640],[x-10,350],[x-58,270],[x-53,260],[x+3,332],[x+34,232],[x+39,236],[x+13,365],[x+22,640]],'#223c444b');}c.restore();
}
function lantern(x,y){
 line(x-12,y+22,x-12,y-69,'#263b41',3);shape([[x-16,y-64],[x-14,y-81,x+4,y-84,x+8,y-66]],null,'#81938c');line(x+7,y-67,x+7,y-36,'#697a76');
 glow(x+7,y-22,56,'#f0b76415');poly([[x-1,y-34],[x+15,y-34],[x+12,y-11],[x+2,y-11]],shade(x,0,x+14,0,['#bd8b50','#f3d290','#ac794b']),'#2d3838');line(x+4,y-32,x+4,y-13,'#fae7b4');line(x+9,y-32,x+9,y-12,'#695f49');poly([[x-4,y-34],[x+7,y-41],[x+18,y-34]],'#435052');
}
function paintStone(s){const {x,y,w,h}=s;
 c.save();c.beginPath();c.rect(x,y,w,h);c.clip();c.fillStyle=shade(x,y,x+w*.3,y+h,['#63716c','#435455','#23373f']);c.fillRect(x,y,w,h);
 // Hand-cut blocks: staggered joints, varied faces, chips and a narrow mortar bed.
 for(let row=0;row<Math.ceil(h/37);row++){const yy=y+14+row*37;for(let j=-1;j<Math.ceil(w/78)+1;j++){
 const xx=x+j*78+(row%2)*39,seed=xx+yy;const v=noise(j+x,row);const ww=74;
 c.fillStyle=['#6a79712b','#82908322','#101f2c28','#abaf9417'][Math.floor(v*4)];c.fillRect(xx+2,yy+2,ww,33);
 line(xx+3,yy+1,xx+ww-3,yy+1,'#b8c0a12c');line(xx+ww,yy+3,xx+ww,yy+34,'#142b354d');line(xx+2,yy+35,xx+ww,yy+35,'#162b365e');
 if(v>.56){poly([[xx+6,yy+2],[xx+19,yy+3],[xx+12,yy+7]],'#344c4b66');line(xx+31,yy+10,xx+37,yy+18,'#1d35382b');}
 if(v>.8){line(xx+53,yy+1,xx+49,yy+13,'#1b343751');line(xx+49,yy+13,xx+54,yy+24,'#1b343751');}
 }}
 // Fine mineral grain, larger damp patches, and lichen all stay fixed in world space.
 for(let i=0;i<w*h/100;i++){const xx=x+noise(i,x)*w,yy=y+noise(i,y)*h;c.fillStyle=i%2?'#c8c5a80d':'#09243318';c.fillRect(xx,yy,1+noise(i,8)*3,1);}
 for(let i=0;i<w/55;i++){const xx=x+noise(i,31)*w,yy=y+15+noise(i,29)*Math.min(h,70);ellipse(xx,yy,8+noise(i,3)*15,3+noise(i,6)*8,'#7482680d');}
 c.fillStyle=shade(0,y,0,y+28,['#071d294f','#0c253100']);c.fillRect(x,y,w,28);
 c.restore();
 // The lit walking edge stays at the exact collision height.
 for(let j=0;j<w;j+=58){const ww=Math.min(58,w-j),xx=x+j,chip=1+noise(j,x)*3;
 poly([[xx,y],[xx+ww,y],[xx+ww,y+8],[xx+ww-chip,y+11],[xx+3,y+10],[xx,y+7]],shade(0,y,0,y+11,['#b4bba1','#8b9a89','#607469']));line(xx+2,y+.7,xx+ww-2,y+.7,'#d3d2b2b0',1);line(xx+ww,y+2,xx+ww,y+8,'#344a4580');}
 // Moss grows in patches, leaving most of the readable edge clear.
 for(let i=0;i<w/15;i++){if(noise(i,x)<.55)continue;const xx=x+i*15,len=4+noise(i,9)*19;shape([[xx,y+8],[xx+8,y+7],[xx+6,y+len],[xx+3,y+len-2]],'#4b6655');ellipse(xx+3,y+8,7,2,'#788a61');}
}
function stone(s){let tile=stoneCache.get(s);if(!tile){tile=document.createElement('canvas');tile.width=s.w+4;tile.height=s.h+4;const previous=c;c=tile.getContext('2d');c.translate(2-s.x,2-s.y);paintStone(s);c=previous;stoneCache.set(s,tile);}c.drawImage(tile,s.x-2,s.y-2);}
function knight(x,y,face,enemy=false,walk=0,hit=false){
 c.save();c.translate(x,y);c.scale(face,1);const moving=Math.abs(walk)>0,step=Math.sin(walk),lift=Math.max(0,Math.cos(walk))*3;
 if(!enemy)c.scale(1+p.squash*.65,1-p.squash*.65);
 const air=!enemy&&!p.ground,wall=!enemy&&p.wall&&!p.ground,dash=!enemy&&p.dash>0;
 const lean=dash?.20:wall?-.08:!enemy?clamp(p.vx/320,-1,1)*.04:0;c.transform(1,0,lean,1,0,0);
 const cloak=enemy?['#927567','#634f50','#354049']:['#7b9c9d','#426878','#263f50'];
 // Rear leg, jointed knee and worn boot. Feet plant rather than sliding in place.
 let rear=air?-7:step*6,front=air?6:-step*6;
 shape([[-9,-26],[-2,-24],[-3+rear,-13],[-7+rear,-5],[-14+rear,-5]],shade(-12,-25,2,-5,['#596b71','#253a48']),ART.ink);
 shape([[-13+rear,-7],[-6+rear,-7],[-5+rear,-2],[-1+rear,0],[-14+rear,0]],'#283943',ART.ink);line(-12+rear,-2,-3+rear,-2,'#778276');
 const flutter=Math.sin(time*6+x*.1)*2+(enemy?2:Math.abs(p.vx)*.018);
 shape([[-7,-53],[-17,-45,-14,-29,-23-flutter,-10],[-15,-14,-9,-6,0,-12],[7,-22,8,-43,5,-50]],shade(-23,-35,10,-32,cloak),ART.ink);
 shape([[-10,-47],[-13,-34,-12,-22,-18-flutter,-14],[-9,-19,-6,-18,-3,-14],[-7,-27,-3,-43,-4,-50]],'#6f90944d');
 shape([[-4,-48],[-8,-29,-6,-22,-2,-15],[2,-19],[0,-35,4,-40,4,-48]],'#1b344953');
 // Folds pick up the same cool upper-left light as the stones.
 shape([[-12,-44],[-14,-29,-14,-23,-18-flutter,-16]],null,'#b6c7b15e');
 shape([[0,-26],[9,-27],[11+front,-15],[8+front,-4],[1+front,-4]],shade(0,-20,12,-15,['#859994','#3c5461','#253c48']),ART.ink);
 shape([[1+front,-6],[9+front,-6],[10+front,-2],[15+front,0],[0+front,0]],'#2b3e48',ART.ink);line(2+front,-2,12+front,-2,'#829081');
 // A rounded cuirass replaces the flat polygon sticker.
 shape([[-8,-46],[-3,-51,8,-48,10,-40],[12,-31,9,-26,7,-23],[-6,-23],[-10,-34,-10,-41,-8,-46]],shade(-10,-40,12,-35,['#a4b4ab','#647e87','#344d60']),ART.ink);
 shape([[-7,-44],[-5,-34,-5,-30,-2,-26],[1,-25],[-1,-35,0,-42,2,-47]],'#d1d8bf36');line(-6,-25,8,-25,'#b1996e',3);ellipse(3,-25,2,2,'#d3bc88');
 // Shoulder, linen collar, helmet bowl and a dark recessed visor.
 shape([[-11,-43],[-13,-51,-5,-54,0,-48],[-1,-43,-7,-41,-11,-43]],shade(-10,-51,-2,-43,['#c3cabb','#687f86','#314b5a']),ART.ink);
 shape([[-7,-53],[-9,-59,-7,-67,-1,-69],[7,-71,13,-63,12,-56],[9,-49,0,-48,-7,-53]],shade(-9,-65,13,-55,enemy?['#dac7a0','#ac9c80','#5b6669']:['#d5d9c3','#a7bcb5','#587885']),ART.ink);
 shape([[-7,-57],[-2,-55,4,-56,12,-59],[11,-53,4,-50,-4,-52]],'#203842');line(2,-54,9,-56,enemy?'#cba675':'#d0dfc4',1);line(-5,-65,-1,-67,'#eff0d088',1.5);
 if(enemy){shape([[-7,-64],[-13,-72],[-12,-60],[-7,-57]],'#b9b497');shape([[8,-64],[15,-71],[13,-58]],'#aaa48e');}
 // Sword shoulder/arm changes with the strike and cling states.
 const striking=!enemy&&p.attack>0,armX=wall?15:striking?27:15,armY=wall?-49:striking?-35:-32;
 line(7,-43,armX,armY,'#203843',8);line(6,-43,armX,armY,'#9aada4',5);ellipse(armX,armY,3,3,'#b8b7a1');
 c.save();c.translate(armX,armY);c.rotate(enemy?-.08:striking?-1.15+(1-p.attack/.25)*2.2:wall?-.7:.72);
 line(-6,3,7,3,'#323c3d',4);line(-5,2,6,2,'#baa777',2);line(0,3,0,10,'#4d4945',3);
 shape([[-2,0],[-3,-26],[0,-42],[3,-26],[2,0]],shade(-3,0,3,0,['#718f9a','#e0e5d3','#a8c1bd','#526f80']),ART.ink);line(0,-36,0,-1,'#d8e1cd',.7);c.restore();
 if(hit){c.globalAlpha=.35;c.fillStyle='#f7e4bb';c.fillRect(-11,-64,23,42);}c.restore();
}
function oldTree(x,y,seed){
 c.save();c.translate(x,y);const bark=shade(-38,0,24,0,['#213c43','#52635b','#364e50','#263f48']);
 shape([[-42,0],[-15,-12,-8,-83,-16,-134],[-34,-190,-23,-253,-45,-319],[-31,-305,-21,-282,-13,-253],[0,-282,18,-302,48,-316],[20,-286,5,-273,1,-238],[4,-191,24,-157,19,-119],[11,-64,20,-16,44,0],[19,-3,2,-8,-6,-1]],bark);
 shape([[-12,-171],[-48,-194,-77,-199,-115,-232],[-80,-215,-51,-215,-13,-207]],'#3c5552');
 shape([[12,-137],[35,-170,65,-177,95,-189],[59,-178,46,-149,18,-113]],'#2f4b4d');
 for(let i=0;i<8;i++){const xx=-9+i*3;c.beginPath();c.moveTo(xx, -20-noise(i,seed)*30);c.bezierCurveTo(xx-12,-105,xx+6,-152,xx-6,-221);c.strokeStyle=i%2?'#a0a5841c':'#102f3c40';c.lineWidth=1;c.stroke();}
 // Broken bark picks up oblique sky light rather than a continuous outline.
 line(-15,-244,-12,-224,'#81907855');line(-11,-195,-8,-178,'#81907855');
 for(let cl=0;cl<6;cl++){const cx=[-65,-30,20,65,-103,96][cl],cy=[-296,-326,-314,-289,-230,-193][cl];
 for(let j=0;j<24;j++){const xx=cx+(noise(j+cl*29,seed)-.5)*85,yy=cy+(noise(j+cl*19,7)-.5)*48,len=6+noise(j,cl)*12;
 shape([[xx,yy],[xx-5,yy-5,xx+2,yy-len,xx+8,yy-len-2],[xx+12,yy-7,xx+8,yy-2,xx,yy]],['#3c5752','#4a6358','#5d725e','#758166'][Math.floor(noise(j,cl+11)*4)]);
 }}
 fern(-12,0,30,seed,'#405e4f');fern(25,0,19,seed,'#77836a');c.restore();
}
function scenery(){
 for(const [x,y] of [[710,564],[1940,564],[3300,564],[5300,540]])if(x>cam-180&&x<cam+W+180)oldTree(x,y,x);
 // A few authored objects, with roots and shadows tying them into the masonry.
 for(const [x,y] of [[90,564],[470,564],[1010,508],[1750,564],[2540,335],[3070,564],[4170,440],[5410,540]]){
  fern(x,y-1,22+noise(x)*14,x,'#486353');fern(x+19,y,15,x+1,'#748769');
 }
 for(const s of stations)lantern(s.x-58,s.y-17);
 // Fallen column and partially buried urn at the opening.
 ellipse(385,562,47,5,'#0b252e44');shape([[350,558],[355,540],[406,541],[417,558]],shade(0,541,0,559,['#81918a','#4c6264','#293e47']),'#344c51');line(356,543,403,544,'#a7b49b80');
 shape([[461,563],[457,550,452,536,458,529],[472,526],[481,535,473,555,470,563]],shade(453,0,479,0,['#314951','#73817a','#536a69','#263e48']));ellipse(465,530,8,2,'#263d46');fern(475,563,22,4,'#566e55');
 // A destination gate built from the same stone and metal as the room.
 const x=5520,y=540;arch(x-49,y-154,98,153,'#566d70');arch(x-37,y-137,74,137,'#8c9b8b');c.fillStyle='#182f3b';c.fillRect(x-24,y-98,48,98);for(let k=-2;k<=2;k++)line(x+k*10,y-97,x+k*10,y,'#8c997f',2);line(x-24,y-67,x+24,y-67,'#9caa8d',2);lantern(x+64,y-30);
}
function drawTrial(){
 for(const w of walls){stone(w);line(w.x+3,w.y+4,w.x+3,w.y+w.h,'#b6aa78',2);line(w.x+w.w-3,w.y+4,w.x+w.w-3,w.y+w.h,'#a59b72',1);for(let y=w.y+20;y<w.y+w.h;y+=38){line(w.x+8,y,w.x+w.w-8,y,'#9f9e7844');}}
 portals.forEach((a,i)=>{if(!a)return;const col=i?'#dbb67b':'#a0cbd1';c.save();c.translate(a.x,a.y);c.rotate(Math.atan2(a.ny,a.nx));glow(0,0,69,i?'#bf9a541c':'#7eb8be1c');ellipse(0,0,10,51,'#101f30');c.strokeStyle='#637b7d';c.lineWidth=7;c.beginPath();c.ellipse(0,0,11,53,0,0,Math.PI*2);c.stroke();c.strokeStyle=col;c.lineWidth=1.7;c.stroke();for(let j=0;j<11;j++){const angle=j*Math.PI*2/11;ellipse(Math.cos(angle)*11,Math.sin(angle)*53,1,1.5,'#e0d3aa');}c.save();c.beginPath();c.ellipse(0,0,8,48,0,0,Math.PI*2);c.clip();for(let k=0;k<5;k++){const yy=((time*22+k*21)%106)-53;line(-8,yy,8,yy-9,i?'#d3b47688':'#86c2ca88',1);}c.restore();c.restore();});
}
function contactShadow(x,y){let floor=null;for(const s of [...platforms,...walls])if(x>s.x-8&&x<s.x+s.w+8&&s.y>=y-1&&(!floor||s.y<floor.y))floor=s;if(!floor)return;const height=Math.max(0,floor.y-y),alpha=Math.max(0,.25-height*.001);if(!alpha)return;c.save();c.globalAlpha=alpha;ellipse(x+3,floor.y+2,18+height*.03,3.5,'#071b28');ellipse(x,floor.y+1,10,2,'#071b28');c.restore();}
function draw(){const dpr=Math.min(devicePixelRatio||1,2),rw=Math.round(innerWidth*dpr),rh=Math.round(innerHeight*dpr);if(canvas.width!==rw||canvas.height!==rh){canvas.width=rw;canvas.height=rh;}const scale=Math.min(rw/W,rh/H);c.setTransform(1,0,0,1,0,0);c.fillStyle='#11232e';c.fillRect(0,0,rw,rh);c.setTransform(scale,0,0,scale,(rw-W*scale)/2,(rh-H*scale)/2);background();c.save();c.translate(-cam,0);
 for(const s of platforms)if(s.x+s.w>cam-80&&s.x<cam+W+80)stone(s);scenery();drawTrial();
 for(const t of trails){c.save();c.globalAlpha=(1-(time-t.born)/.18)*.18;knight(t.x,t.y,t.face);c.restore();}
 for(const e of enemies)if(e.hp>0&&Math.abs(e.x-p.x)<1100){contactShadow(e.x,e.y);knight(e.x,e.y,e.face,true,e.t*4,e.hit>0);}
 contactShadow(p.x,p.y);c.save();if(p.hurt>0)c.globalAlpha=.65+Math.sin(time*35)*.2;knight(p.x,p.y,p.face,false,p.ground?p.anim:0);c.restore();
 if(p.attack>0){c.save();c.translate(p.x,p.y-32);c.scale(p.face,1);const progress=1-p.attack/.25;c.strokeStyle='#dce5d1';c.lineWidth=2;c.beginPath();c.ellipse(12,0,70,49,0,-1.6+progress*1.1,.8+progress*.9);c.stroke();c.restore();}
 for(const q of particles){c.globalAlpha=clamp(q.life*1.4,0,1);line(q.x,q.y,q.x-q.vx*.018,q.y-q.vy*.018,q.color,1.3);}c.globalAlpha=1;
 // Small foreground tufts overlap the feet, never the face or landing edge.
 for(const s of platforms)if(s.h>60&&s.x+s.w>cam&&s.x<cam+W){for(let i=23;i<s.w;i+=163){const x=s.x+i;for(let k=-2;k<=2;k++){c.beginPath();c.moveTo(x,s.y+5);c.quadraticCurveTo(x+k*2,s.y-4,x+k*4,s.y-8-noise(i,k)*9);c.strokeStyle='#647e66';c.lineWidth=1;c.stroke();}}}
 c.restore();
 for(let i=0;i<16;i++){const x=((i*151+time*(3+i%3)-cam*.4)%W+W)%W,y=260+(i*73)%400+Math.sin(time+i)*5;ellipse(x,y,.8,.6,'#d4d2ad44');}
 // Restrained edge falloff; preserve midtone material detail.
 const vignette=c.createRadialGradient(W/2,H*.45,330,W/2,H*.45,820);vignette.addColorStop(0,'transparent');vignette.addColorStop(1,'#06162466');c.fillStyle=vignette;c.fillRect(0,0,W,H);
}
function frame(now){if(!last)last=now;const elapsed=Math.min((now-last)/1000,.05);last=now;if(!paused){accumulator+=elapsed;while(accumulator>=1/120){update(1/120);accumulator-=1/120;}}draw();requestAnimationFrame(frame);}
reset();requestAnimationFrame(frame);
