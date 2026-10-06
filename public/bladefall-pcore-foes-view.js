/* Precision Core foes — drawing (7.248, merged 7.250). Pixel sprites for the foes in bladefall-pcore-foes.js,
   their tells, bolts and husks. Every state that matters to a decision has its own look: a tell before
   every attack, a warning before a flipped or dazed foe recovers, and the contact rule on the body itself —
   a thorned foe (hurts to touch) bristles with pale spikes on a dark outline; a plain foe has none.
   The shared parry ward is drawn by the Combat view, so both foe sets show the same ward. */
(function(root){
'use strict';
const px=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
const COL={moth:'#e8dcb0',mothD:'#a89668',glow:'#fff3c2',shell:'#3b3346',shellL:'#5b5070',thorn:'#d9d2e6',belly:'#c9a27a',leg:'#2a2430',
 ram:'#7a5a44',ramD:'#4e3a2c',horn:'#e3d6bd',eye:'#ff6a4a',spit:'#5f7a3a',spitD:'#3d5226',mouth:'#2a1e16',
 bolt:'#ff9a4a',boltC:'#ffe0a0',friend:'#9ff6e0',friendC:'#ffffff',husk:'#9a7a4c',huskD:'#6a5232',huskL:'#c4a56e',ward:'#b5ffea'};

/* Thorns: pale spikes around a body, the same colour as tile thorns — the one sign that touching hurts. */
function drawThorns(b,f,t){
 const c=COL.thorn,x=f.x,y=f.y,w=f.w,h=f.h;
 for(let i=1;i<w;i+=3){px(b,x+i,y-2,1,2,c);px(b,x+i,y+h,1,2,c);}
 for(let j=1;j<h;j+=3){px(b,x-2,y+j,2,1,c);px(b,x+w,y+j,2,1,c);}
}
function drawMoth(b,f,t){
 const x=f.x,y=f.y,flap=(t>>3)&1;
 if(f.thorns)drawThorns(b,f,t);
 px(b,x+3,y+2,2,5,COL.mothD);                       // body
 px(b,x+2,y+1,4,1,COL.glow);                        // lantern glow on the head
 if(flap){px(b,x,y+2,3,3,COL.moth);px(b,x+5,y+2,3,3,COL.moth);}
 else{px(b,x,y+4,3,2,COL.moth);px(b,x+5,y+4,3,2,COL.moth);}
}
function drawShell(b,f,t){
 const x=f.x,y=f.y;
 if(f.state==='flip'){
  const warn=f.timer<40&&(t>>2)&1;
  px(b,x+1,y+6,14,6,warn?'#e07060':COL.belly);    // belly up: a flat, safe top
  px(b,x,y+4,16,2,COL.shell);
  for(let i=0;i<4;i++){const k=(t>>2)+i&1;px(b,x+2+i*4,y+1+k,1,3,COL.leg);}  // legs pedal the air
  return;
 }
 drawThorns(b,f,t);                                               // thorned: it hurts to touch
 px(b,x+1,y+4,14,8,COL.shell);px(b,x+2,y+5,12,2,COL.shellL);
 for(let i=0;i<5;i++)px(b,x+2+i*3,y+1,1,3,COL.thorn);           // the thorned back
 const step=(t>>3)&1;px(b,x+2+step,y+11,2,1,COL.leg);px(b,x+11-step,y+11,2,1,COL.leg);
 px(b,f.dir>0?x+13:x+1,y+6,2,2,'#e8e0f0');                       // an eye on the leading end
}
function drawRam(b,f,t){
 const x=f.x,y=f.y,d=f.dir,stun=f.state==='stun',tell=f.state==='tell',charge=f.state==='charge';
 if(f.thorns)drawThorns(b,f,t);
 const shake=tell?((t>>1)&1):0;
 px(b,x+2+shake,y+3,12,7,COL.ram);px(b,x+2+shake,y+9,12,1,COL.ramD);
 const hx=d>0?x+11:x+1;px(b,hx+shake,y+1,4,6,COL.ramD);                       // head
 // A charge is an attack: the horns burn bright, as a Combat actor's weapon does when it is active.
 px(b,d>0?hx+2:hx-2,y,4,2,charge?'#ffccaa':COL.horn);px(b,d>0?hx+4:hx-2,y+2,2,3,charge?'#ffccaa':COL.horn);
 px(b,d>0?hx+2:hx+1,y+3,1,1,stun?'#8c8c8c':tell?COL.eye:'#f0e6cc');
 const leg=f.state==='charge'?(t>>1)&1:(t>>3)&1;
 px(b,x+3+leg,y+10,2,2,COL.ramD);px(b,x+10-leg,y+10,2,2,COL.ramD);
 if(stun){const warn=f.timer<30;for(let i=0;i<3;i++){const a=t/6+i*2.1;px(b,x+8+Math.cos(a)*6,y-3+Math.sin(a)*2,1,1,warn&&(t>>2)&1?COL.eye:'#fff1a0');}}
 if(tell){px(b,d>0?x-2:x+16,y+10,2,1,'#c9b89a');}                           // pawing dust
}
function drawSpit(b,f,t){
 const x=f.x,y=f.y,swell=f.tell?1:0;
 if(f.thorns)drawThorns(b,f,t);
 px(b,x+1-swell,y+1-swell,6+2*swell,6+2*swell,f.tell&&(t>>1)&1?'#8fb04e':COL.spit);
 px(b,x+2,y+2,4,4,COL.spitD);
 const mx=x+3+Math.round(f.dx*3),my=y+3+Math.round(f.dy*3);px(b,mx,my,2,2,COL.mouth);
}
function drawHusk(b,f){
 px(b,f.x,f.y,f.w,f.h,COL.husk);
 for(let yy=0;yy<f.h;yy+=4)for(let xx=(yy/4&1)*2;xx<f.w;xx+=4)px(b,f.x+xx,f.y+yy,2,1,COL.huskD);   // woven husk
 px(b,f.x,f.y,f.w,1,COL.huskL);px(b,f.x,f.y,1,f.h,COL.huskL);
}
function drawBolt(b,o,t){
 const x=Math.round(o.x),y=Math.round(o.y);
 px(b,x,y+1,6,4,o.friendly?COL.friend:COL.bolt);px(b,x+1,y,4,6,o.friendly?COL.friend:COL.bolt);
 px(b,x+2,y+2,2,2,o.friendly?COL.friendC:COL.boltC);
 // a short tail so the direction reads at a glance
 const n=Math.hypot(o.vx,o.vy)||1;px(b,x+2-Math.round(o.vx/n*4),y+2-Math.round(o.vy/n*4),2,2,o.friendly?'#5fc9b0':'#b8602a');
}
// The same ward the Combat view draws: a ring, and the aim line when a direction was held at the press.
function drawWard(b,p,t){
 if(!(p.parryTimer>0))return;
 b.strokeStyle='#d5f7e9';b.lineWidth=1;b.beginPath();b.arc(p.x+4,p.y+5,12,0,Math.PI*2);b.stroke();
 const a=p.parryAim;if(a&&(a.x||a.y)){b.strokeStyle='#e9fff5';b.beginPath();b.moveTo(p.x+4.5,p.y+5.5);b.lineTo(p.x+4.5+a.x*16,p.y+5.5+a.y*16);b.stroke();}
}
function draw(b,g){
 if(!g.foes)return;
 const t=g.roomFrame;
 for(const f of g.foes){if(f.alive&&f.kind==='husk')drawHusk(b,f);}
 for(const f of g.foes){
  if(!f.alive||f.kind==='husk')continue;
  if(f.kind==='moth')drawMoth(b,f,t);else if(f.kind==='shell')drawShell(b,f,t);else if(f.kind==='ram')drawRam(b,f,t);else if(f.kind==='spit')drawSpit(b,f,t);
  root.BladefallClimbArt?.foeDetail(b,g,f);
 }
 for(const o of g.bolts)drawBolt(b,o,t);
 if(!g.combat&&g.p&&g.p.state!=='dead')drawWard(b,g.p,t);   // with Combat actors present, their view draws the one ward
}
root.BladefallPrecisionFoesView=Object.freeze({draw});
})(typeof window!=='undefined'?window:globalThis);
