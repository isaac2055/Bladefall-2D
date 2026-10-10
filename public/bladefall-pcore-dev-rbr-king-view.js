(function(root){
'use strict';const rect=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
// (7.308) The Abyss King's court: empty thrones ahead, the King, his guard ring, his aim, and his knees.
function chair(b,t,lit){const x=t.c*8+4,y=(t.r+1)*8;rect(b,x-13,y-44,26,44,lit?'#2e2238':'#231b2b');rect(b,x-11,y-42,22,4,lit?'#6b5476':'#43364b');
 rect(b,x-15,y-14,30,14,lit?'#3d2e49':'#2b2233');rect(b,x-15,y-16,30,3,lit?'#8a7393':'#4d4055');rect(b,x-13,y-48,4,6,lit?'#c9a85c':'#5a4c3c');rect(b,x+9,y-48,4,6,lit?'#c9a85c':'#5a4c3c');rect(b,x-2,y-50,4,8,lit?'#c9a85c':'#5a4c3c');}
function ring(b,x,y,r,col,alpha,dash){b.save();b.globalAlpha=alpha;b.strokeStyle=col;b.lineWidth=1;if(dash)b.setLineDash(dash);b.beginPath();b.arc(x,y,r,0,Math.PI*2);b.stroke();b.restore();}
function drawCourt(b,g){const z=g.court,K=root.BladefallPrecisionKing;if(!z||!K)return;const T=z.d.thrones;
 T.forEach((t,i)=>{if(i>z.i||z.mode==='gone'||z.mode==='fall'||i===z.i&&z.mode==='leap')chair(b,t,i===z.i);else if(i<z.i){const x=t.c*8+4,y=(t.r+1)*8;rect(b,x-13,y-12,26,12,'#231b2b');rect(b,x-15,y-14,30,3,'#4d4055');}});
 if(z.mode==='gone')return;
 const cx=z.x+z.w/2,cy=z.y+z.h/2,x=Math.round(z.x),y=Math.round(z.y),fr=g.frame||0,guard=(T[z.i].guard??z.d.guard??K.CK.guard);
 if(z.mode!=='leap'&&z.mode!=='fall'){chair(b,T[z.i],true);
  if(z.mode==='rise'){const k=1-z.timer/(T[z.i].slamTell??z.d.slamTell??K.CK.slamTell);ring(b,cx,cy,guard,'#ff8a6a',.5+.5*k,null);b.globalAlpha=.12+.2*k;b.fillStyle='#ff6a4a';b.beginPath();b.arc(cx,cy,guard,0,Math.PI*2);b.fill();b.globalAlpha=1;}
  else if(z.mode==='kneel')ring(b,cx,cy,guard,'#ffe9a8',.55+.2*Math.sin(fr/4),[2,3]);   // still uncrossable while he kneels
  else ring(b,cx,cy,guard,'#b89ad0',.38,[3,4]);
  // A ward that turns parries: a pale shell round him.
  if((T[z.i].parry??z.d.parry)===false&&z.mode!=='kneel'){b.globalAlpha=.35+.15*Math.sin(fr/6);b.strokeStyle='#cfe8ff';b.lineWidth=1;b.strokeRect(x-4.5,y-8.5,29,40);b.globalAlpha=1;}}
 if(z.slamFx>0){ring(b,cx,cy,guard*(1-z.slamFx/14*.3),'#fff3d2',z.slamFx/14,null);}
 const kneel=z.mode==='kneel',robe=kneel?'#5b3f6e':'#4a2f5c',hem='#2c1d38';
 if(kneel){rect(b,x-2,y+16,24,14,robe);rect(b,x,y+28,20,2,hem);rect(b,x+4,y+8,12,10,'#a39ab0');rect(b,x+6,y+12,3,2,'#171421');rect(b,x+11,y+12,3,2,'#171421');
  rect(b,x+13,y+3,10,3,'#d9bd72');rect(b,x+20,y,3,3,'#d9bd72');// the crown slips
  const on=(fr>>3)%2===0;rect(b,x+2,y+18,16,2,on?'#fff1b8':'#e8b45a');b.globalAlpha=.25;rect(b,x-4,y+4,28,28,'#ffe9a8');b.globalAlpha=1;
  const st=z.winded?(T[z.i].winded??z.d.winded??K.CK.winded):(T[z.i].stun??z.d.stun??K.CK.stun);for(let i=0;i<10;i++)rect(b,x+i*2,y-6,1,2,i<z.timer/st*10?'#ffe9a8':'#4d4055');}
 else{const rise=z.mode==='rise'?-2:0;rect(b,x,y+10+rise,20,20-rise,robe);rect(b,x-2,y+26,24,4,hem);rect(b,x+2,y+12+rise,16,3,'#7d5f92');
  rect(b,x+4,y+1+rise,12,10,'#b3a9c0');rect(b,x+3,y+1+rise,1,10,'#7e7390');
  const due=K.courtDue(z),tell=(T[z.i].tell??z.d.tell??K.CK.tell),burn=z.mode==='seat'&&due<=tell;const eye=burn?(due<8||(due>>2)%2===0?'#ffffff':'#ffb38a'):'#171421';
  rect(b,x+6,y+5+rise,3,2,eye);rect(b,x+11,y+5+rise,3,2,eye);if(burn){b.globalAlpha=.3;rect(b,x+3,y+2+rise,14,8,'#ffd0a8');b.globalAlpha=1;}
  rect(b,x+2,y-2+rise,16,3,'#d9bd72');for(let k=0;k<3;k++)rect(b,x+3+k*6,y-6+rise,3,4,'#d9bd72');rect(b,x+9,y-5+rise,2,2,'#e86b7c');
  rect(b,x+20,y+6+rise,2,22,'#a8925f');rect(b,x+18,y+4+rise,6,3,'#d9bd72');}
 for(let i=0;i<z.need;i++)rect(b,x+1+i*7,y-12,5,3,i<z.wounds?'#4d4055':'#e2d3f2');
 if(z.aimAt){const ox=cx,oy=z.y+6,m=z.aimAt;b.save();b.globalAlpha=.55;b.strokeStyle=m.echo?'#c9b8ff':'#ffb38a';b.setLineDash([2,4]);b.beginPath();b.moveTo(ox,oy);b.lineTo(m.x,m.y);b.stroke();b.restore();}
}
function draw(b,g){const c=g.crown,h=g.hand,a=g.alarm;
 if(g.court){if(g.court.slamFx>0)g.court.slamFx--;drawCourt(b,g);}
 if(c){
  if(c.verdict&&!c.done&&c.verdict.t>0){const v=c.verdict;b.globalAlpha=.35;rect(b,v.x-4,v.y,8,46,'#ee9aaf');b.globalAlpha=1;rect(b,v.x-2,v.y,4,12,'#fff0b4');rect(b,v.x-6,v.y+3,12,2,'#d7a257');rect(b,v.x-1,v.y+12,2,5,'#ffffff');}
  c.marks.forEach((m,i)=>{rect(b,m.c*8-2,m.r*8+5,12,3,c.done?'#b3e5d0':c.lit[i]?'#ffe4a0':'#796381');for(let k=0;k<3;k++)rect(b,m.c*8+k*3,m.r*8+2,2,3,c.lit[i]?'#ffe4a0':'#aa87b8');});
  if(c.king){const x=(c.c??34)*8,y=(c.r??12)*8;rect(b,x-4,y-10,28,48,'#37283d');rect(b,x,y,20,8,'#877089');rect(b,x+3,y-18,14,18,c.done?'#696371':'#a69bad');rect(b,x+5,y-11,3,2,'#171421');rect(b,x+11,y-11,3,2,'#171421');rect(b,x,y-22,20,4,c.done?'#786550':'#d9bd72');for(let k=0;k<3;k++)rect(b,x+1+k*7,y-26,3,4,'#d9bd72');rect(b,x+5,y+12,4,25,'#7d668c');rect(b,x+12,y+12,4,25,'#7d668c');
   if(!c.done)for(let i=0;i<(c.hold||1);i+=5)rect(b,x-5+i/5*3,y-32,2,2,i<c.t?'#ffe4a0':'#514158');
   // (7.280) His eyes burn before he throws; the seals still to come are pips over the crown.
   const K=root.BladefallPrecisionKing;if(c.bolts&&!c.done&&K){const due=K.kingDue(c);if(due<=K.KB.tell){const on=due<8||(due>>2)%2===0;rect(b,x+4,y-12,5,3,on?'#ffffff':'#ffb38a');rect(b,x+11,y-12,5,3,on?'#ffffff':'#ffb38a');b.globalAlpha=.3;rect(b,x+1,y-16,18,10,'#ffd0a8');b.globalAlpha=1;}}
   if(c.phases)for(let i=0;i<=c.phases.length;i++)rect(b,x+2+i*6,y-38,4,3,c.done||i<c.phase?'#b3e5d0':i===c.phase?'#ffe4a0':'#514158');}
  // The next pair, faint: where the crown will turn.
  if(c.phases&&!c.done&&c.phase<c.phases.length){b.globalAlpha=.35;for(const m of c.phases[c.phase]){rect(b,m.c*8-2,m.r*8+5,12,3,'#9a87a6');for(let k=0;k<3;k++)rect(b,m.c*8+k*3,m.r*8+3,2,2,'#9a87a6');}b.globalAlpha=1;}
 }
 if(h&&h.fade<60){b.globalAlpha=h.gone?1-h.fade/60:1;
  rect(b,h.x,h.y+7,14,15,'#46324f');rect(b,h.x+2,h.y,10,8,'#afa4bd');rect(b,h.x+2,h.y+3,10,2,(root.BladefallPrecisionKing?root.BladefallPrecisionKing.handOpen(h):h.t<30||h.t>=60&&h.t<90)?'#fff0ad':'#302539');rect(b,h.x,h.y-3,14,3,'#bda16c');
  for(let i=0;i<(h.need||3)-h.hits;i++)rect(b,h.x+i*5,h.y-7,3,2,'#d4c3eb');b.globalAlpha=1;
  if(!h.gone&&h.t>=30&&h.t<60){const q=h.places[(h.i+1)%h.places.length];rect(b,q.c*8-3,(q.r+1)*8-2,20,2,'#dfc2ff');b.globalAlpha=.4;rect(b,q.c*8,(q.r+1)*8-22,14,20,'#c1a4dd');b.globalAlpha=1;}
 }
 if(a){for(const q of a.bells){const x=q.c*8,y=q.r*8;rect(b,x+3,y-2,2,3,'#8d7650');rect(b,x+(q.note==='long'?0:2),y+1,q.note==='long'?8:4,7,a.flash?'#ffe7a5':'#c1a267');rect(b,x+3,y+8,2,2,'#6f593d');}
  a.pattern.forEach((n,i)=>rect(b,140+i*9,22,n==='long'?7:3,3,i<a.at?'#c1e8d2':'#77615b'));}
}
const event=(e,{burst,view,shake})=>{if(['crown-seal','crown-answer','all-clear','hand-spent'].includes(e.type))burst(e.x,e.y,16,'#d8c4ea',45,28);if(e.type==='crown-turn')burst(e.x,e.y,12,'#ffe4a0',40,22);
 if(e.type==='court-slam'){const z=view?.g?.court;if(z)z.slamFx=14;shake?.(4);burst(e.x,e.y,18,'#ffd9b0',60,30);}
 if(e.type==='court-kneel'||e.type==='court-winded')burst(e.x,e.y,14,'#ffe9a8',50,24);if(e.type==='court-wound')burst(e.x,e.y,22,'#f2e2ff',70,34);if(e.type==='court-land')burst(e.x,e.y,12,'#b89ad0',40,20);
 if(e.type==='echo-break')burst(e.x,e.y,12,'#c9b8ff',45,22);if(e.type==='court-fall')burst(e.x,e.y,26,'#ffe4a0',80,40);};
const sfx={'alarm-note':(e,{tone})=>tone(e.note==='long'?330:660,e.note==='long'?.5:.15,'sine',.05), 'crown-seal':(e,{tone})=>tone(220,.7,'sine',.05,440),
 'court-guard':(e,{tone})=>tone(160,.35,'sawtooth',.03,120),'court-slam':(e,{tone})=>tone(90,.4,'square',.05,-40),'court-kneel':(e,{tone})=>tone(520,.3,'triangle',.05,-260),'court-winded':(e,{tone})=>tone(420,.35,'triangle',.05,-200),
 'court-wound':(e,{tone})=>{tone(330,.25,'square',.05,330);tone(660,.3,'sine',.04,-200,.06);},'echo-break':(e,{tone})=>tone(900,.12,'triangle',.03,-500),'court-fall':(e,{tone})=>tone(200,1,'sine',.05,-150)};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'rbr-king',draw,event,sfx});
})(typeof window!=='undefined'?window:globalThis);
