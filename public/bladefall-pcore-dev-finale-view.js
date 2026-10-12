/* The finale's drawing (7.309): your Echo, Vesper's four forms, the bats, and every tell and opening. The Echo wears
   Explore's Echo colours (pale hood, violet cloak, sea-green scarf); Vesper keeps the Cloaked Man's: a hood with a
   shadow for a face and no eyes, ever; violet robes; chains. An opening is drawn bright, a ward pale. */
(function(root){
'use strict';
const rect=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));};
const F=()=>root.BladefallPrecisionFinale;
const ECHO={hood:'#b9b7d4',hoodD:'#7d7a9c',cloak:'#645087',lit:'#a997d1',dark:'#312940',scarf:'#86e6d8',face:'#30204d',blade:'#eee5ff'};
const VES={cloak:'#5b3a8c',lit:'#8a63c7',dark:'#34205a',deep:'#1f1236',hoodIn:'#0e0918',mouth:'#8c7aa6',chain:'#848b9b',chainLit:'#d6deeb',bone:'#e9dfc9',boneD:'#a89d86',boneL:'#fff8e8'};
const TELL='#f2b583';
function label(b,text,x,y,col){b.save();b.font='6px monospace';b.textAlign='center';b.lineWidth=2;b.strokeStyle='#07060c';b.strokeText(text,Math.round(x),Math.round(y));b.fillStyle=col;b.fillText(text,Math.round(x),Math.round(y));b.restore();}
function pips(b,x,y,n,done,col){const max=Math.min(n,18),w=n>9?3:5,gap=n>9?1:2,tot=max*(w+gap)-gap;for(let i=0;i<max;i++)rect(b,x-tot/2+i*(w+gap),y,w,2,i<done*max/n?'#4d4055':col);}

/* ---------------------------------------------------------------- your Echo */
function echoSprite(b,x,y,f,pose,t,alpha=1,hurt=false){
 b.globalAlpha=alpha;const P=hurt?{...ECHO,cloak:'#f4efff',lit:'#ffffff',hood:'#ffffff'}:ECHO;
 const crouch=pose==='tell'?1:0,kneel=pose==='kneel';
 const by=y+crouch+(kneel?3:0);
 if(pose==='dash'){rect(b,x-f*10,by+5,10,3,P.lit);b.globalAlpha=alpha*.5;rect(b,x-f*18,by+6,8,1,P.scarf);b.globalAlpha=alpha;}
 // legs, cloak, hood, scarf, blade
 if(!kneel){const step=pose==='run'?(Math.floor(t/4)%2):0;rect(b,x+1+step,by+9,2,2,P.dark);rect(b,x+5-step,by+9,2,2,P.dark);}
 rect(b,x+1,by+4,6,kneel?5:6,P.cloak);rect(b,x+1,by+4,6,1,P.lit);rect(b,f>0?x+1:x+6,by+5,1,4,P.dark);
 rect(b,x+1,by,6,5,P.hood);rect(b,f>0?x+5:x+1,by+1,2,3,P.hoodD);rect(b,f>0?x+4:x+2,by+2,2,1,P.face);
 rect(b,x+3,by-2,2,2,P.scarf);rect(b,f>0?x:x+6,by+4,2,1,P.scarf);
 if(kneel){rect(b,x+(f>0?7:-4),by+8,5,1,P.blade);}
 else if(pose==='tell'||pose==='dash'){rect(b,f>0?x+7:x-4,by+5,5,1,P.blade);rect(b,f>0?x+7:x,by+4,1,3,'#c9ced8');}
 else rect(b,f>0?x+7:x,by+3,1,5,P.blade);
 b.globalAlpha=1;
}
function drawDuel(b,g){
 const z=g.duel;if(!z)return;const fr=g.frame||0,fy=z.d.floor*8;
 // tells
 if(z.mode==='dash-tell'){const k=z.t/(z.d.tell??F().EK.tell),x0=Math.min(z.x,z.to),x1=Math.max(z.x,z.to)+8;b.globalAlpha=.35+.5*k;rect(b,x0,fy-2,x1-x0,2,TELL);b.globalAlpha=.18*k;rect(b,x0,z.y,x1-x0,11,TELL);b.globalAlpha=1;}
 if(z.mode==='leap-tell'){const k=z.t/(z.d.leapTell??F().EK.leapTell),on=k>.7?(fr>>1)%2:1;rect(b,z.to-12,fy-3,32,3,on?TELL:'#fff1d8');b.globalAlpha=.2+.25*k;rect(b,z.to,fy-40,8,38,TELL);b.globalAlpha=1;}
 for(const q of z.ghosts){const x0=Math.min(q.x,q.to),x1=Math.max(q.x,q.to)+8;b.globalAlpha=q.delay>0?.3:.15;rect(b,x0,fy-2,x1-x0,2,'#c9b8ff');b.globalAlpha=1;
  if(q.delay<=0)echoSprite(b,q.x,z.base,q.dir,'dash',fr,.55);}
 for(const w of z.waves){rect(b,w.x-3,fy-7,6,7,'#b5a3ed');rect(b,w.x-2,fy-7,4,2,'#efe8ff');b.globalAlpha=.4;rect(b,w.x-3-w.dir*6,fy-4,6,4,'#b5a3ed');b.globalAlpha=1;}
 if(z.mode==='gone')return;
 const open=(z.mode==='recover'||z.mode==='stagger')&&z.need>0;
 if(open){b.globalAlpha=.35+.25*Math.sin(fr/3);rect(b,z.x-3,z.y-3,14,17,'#fff1b8');b.globalAlpha=1;}
 const pose=z.mode==='dash-tell'||z.mode==='leap-tell'?'tell':z.mode==='dash'?'dash':z.mode==='leave'?'run':z.mode==='kneel'?'kneel':'rest';
 echoSprite(b,z.x,z.y,z.face,pose,fr,1,z.hurt>0&&(z.hurt>>1)%2===0);
 if(z.mode==='stagger'&&(fr>>2)%2)rect(b,z.x+3,z.y-5,2,2,'#ffe9a8');
 if(z.need>0&&z.mode!=='leave'&&z.mode!=='kneel'){pips(b,z.x+4,z.y-7,z.need,z.wounds,'#e2d3f2');
  label(b,z.ph?.name||(z.d.kneel?'STAY WITH ME':'THE PART YOU LEFT'),z.x+4,z.y-11,'#d8cdf5');
  if(z.d.phases)for(let i=0;i<z.d.phases.length;i++)rect(b,z.x+4-z.d.phases.length*3+i*6,z.y-20,4,2,i<z.phase?'#86e6d8':i===z.phase?'#e2d3f2':'#4d4055');}
 if(z.mode==='shift'){b.globalAlpha=.4+.3*Math.sin((g.frame||0)/3);rect(b,z.x-4,z.y-4,16,19,'#86e6d8');b.globalAlpha=1;}
}

/* ---------------------------------------------------------------- bats */
function batWall(b,cu,top,bottom,fr){
 if(cu.t<cu.tell){const k=cu.t/cu.tell,x=cu.dir>0?cu.x+8:cu.x-2;b.globalAlpha=.3+.6*k;rect(b,x,cu.top,2,cu.bot-cu.top,'#bff0ff');rect(b,x-3,cu.top,8,1,'#bff0ff');rect(b,x-3,cu.bot-1,8,1,'#bff0ff');
  b.globalAlpha=.12+.12*k;rect(b,Math.min(x,x+cu.dir*400),cu.top,400,cu.bot-cu.top,'#bff0ff');b.globalAlpha=1;return;}
 // a dark wall of wings, then the bats in it; the gap stays clear and bright-edged
 b.globalAlpha=.45;rect(b,cu.x-1,top,10,Math.max(0,cu.top-top),'#1a1026');rect(b,cu.x-1,cu.bot,10,Math.max(0,bottom-cu.bot),'#1a1026');b.globalAlpha=1;
 for(let y=top;y<bottom;y+=4){if(y+4>cu.top&&y<cu.bot)continue;const k=(y>>2),flap=((fr>>2)+k)%2,x=cu.x+(k*5)%3-1;
  rect(b,x+3,y+1,3,3,'#2a1d3d');rect(b,x,y+(flap?0:2),3,1,'#4a3566');rect(b,x+6,y+(flap?0:2),3,1,'#4a3566');rect(b,x+1,y+(flap?1:3),1,1,'#4a3566');rect(b,x+8,y+(flap?1:3),1,1,'#4a3566');
  rect(b,x+3,y+2,1,1,'#ff9fd8');rect(b,x+5,y+2,1,1,'#ff9fd8');}
 b.globalAlpha=.6;rect(b,cu.x-1,cu.top-1,10,1,'#bff0ff');rect(b,cu.x-1,cu.bot,10,1,'#bff0ff');b.globalAlpha=1;
}
function drawCurtains(b,g){const z=g.curtain;if(!z)return;const fr=g.frame||0;for(const cu of z.list)batWall(b,cu,8,g.room.h-8,fr);}

/* ---------------------------------------------------------------- Vesper */
function hood(b,cx,top,w=10){const prof=[2,4,6,8,9];while(prof.length<10)prof.push(w);
 prof.forEach((ww,r)=>{const x=Math.round(cx-ww/2);rect(b,x,top+r,ww,1,r===0?VES.lit:VES.cloak);rect(b,x,top+r,1,1,VES.lit);rect(b,x+ww-2,top+r,2,1,VES.dark);});
 rect(b,cx-3,top+4,6,4,VES.hoodIn);rect(b,cx-2,top+8,4,1,'#1a1128');b.globalAlpha=.45;rect(b,cx-1,top+7,3,1,VES.mouth);b.globalAlpha=1;}
function chains(b,pts){for(let i=1;i<pts.length;i++){const [x0,y0]=pts[i-1],[x1,y1]=pts[i],n=Math.max(1,Math.round(Math.hypot(x1-x0,y1-y0)/2));for(let k=0;k<n;k++)rect(b,x0+(x1-x0)*k/n,y0+(y1-y0)*k/n,1,1,k%2?VES.chain:VES.chainLit);}}
function cloaked(b,x,y,f,t,mode,alpha=1){
 b.globalAlpha=alpha;const cx=x+6,top=y,by=y+28,lean=mode==='slash'?2*f:0;
 // robe with a torn hem
 for(let r=10;r<28;r++){const w=Math.round(6+(r-10)*.45),xx=Math.round(cx-w+lean*(28-r)/18);rect(b,xx,top+r,w*2,1,r%5===0?VES.lit:VES.cloak);rect(b,xx,top+r,1,1,VES.lit);rect(b,xx+w*2-2,top+r,2,1,VES.dark);}
 for(let i=0;i<6;i++)rect(b,cx-12+i*4+((t>>3)+i)%2,by-1,2,1+(i%3),VES.dark);
 hood(b,cx+lean,top);
 if(mode==='slash'){rect(b,cx+f*4,top+13,f*14,2,VES.cloak);rect(b,cx+f*18,top+12,2,3,'#40364a');}
 else if(mode==='chains-tell'){rect(b,cx-8,top+12,3,6,VES.cloak);rect(b,cx+5,top+12,3,6,VES.cloak);}
 else{rect(b,cx-6,top+13,3,7,VES.cloak);rect(b,cx+3,top+13,3,7,VES.cloak);}
 chains(b,[[cx-4,top+20],[cx-8,top+26],[cx-14,by-1]]);chains(b,[[cx+4,top+20],[cx+7,top+25],[cx+13,by-1]]);
 b.globalAlpha=1;
}
function unbound(b,x,y,t){
 const cx=x+6,top=y;
 for(const s of [-1,1])for(let i=0;i<5;i++){const L=10+i*3,a=(.35+i*.18)*s,fl=Math.sin(t/6+i)*2;rect(b,cx+s*4+Math.sin(a)*L*.4*s,top+10+i*3+fl,s*L,2,i%2?VES.lit:VES.cloak);}
 for(let r=10;r<24;r++){const w=6-Math.floor((r-10)/4);rect(b,cx-w,top+r,w*2,1,VES.cloak);}
 hood(b,cx,top);
}
function skull(b,x,y,w,h,t,open){
 rect(b,x+2,y+2,w-4,h-4,VES.bone);rect(b,x+4,y,w-8,3,VES.boneL);rect(b,x+2,y+h-4,w-4,2,VES.boneD);
 const eye=open?'#ffe9a8':'#120a1a';rect(b,x+5,y+4,5,4,eye);rect(b,x+w-10,y+4,5,4,eye);if(open){b.globalAlpha=.3;rect(b,x+3,y+2,w-6,8,'#ffe9a8');b.globalAlpha=1;}
 for(let i=0;i<4;i++)rect(b,x+6+i*3,y+h-3,2,3,VES.boneL);
 for(const s of [-1,1])for(let i=0;i<3;i++){const sx=s<0?x:x+w,kx=sx+s*(5+i*3),ky=y+2+i*3+Math.round(Math.sin(t/5+i)*1.5);rect(b,Math.min(sx,kx),ky,Math.abs(kx-sx),1,VES.boneD);rect(b,kx,ky,1,y+h-ky,VES.bone);}
}
function giant(b,g,z,t){
 const x0=z.d.arena[0]*8,x1=(z.d.arena[1]+1)*8,cx=(x0+x1)/2,top=z.d.top*8+4;
 b.globalAlpha=.32;rect(b,cx-40,top,80,52,'#a397ae');rect(b,cx-34,top-6,68,8,'#cdc1d6');rect(b,cx-28,top+14,18,14,'#120a1a');rect(b,cx+10,top+14,18,14,'#120a1a');
 for(let i=0;i<8;i++)rect(b,cx-26+i*7,top+44,4,10,'#cdc1d6');b.globalAlpha=1;
 const h=z.hand;
 for(const side of [0,2]){if(h&&h.third===side&&h.mode!=='up')continue;const hx=side?x1-30:x0+6;rect(b,hx,z.fy-8,24,8,'#8f869c');for(let i=0;i<4;i++)rect(b,hx+2+i*6,z.fy-11,3,4,'#b3a9bf');}
}
function hand(b,z,fr){
 const h=z.hand;if(!h||h.mode==='up')return;const S=F().VK.slam,cx=(h.x0+h.x1)/2,y=h.mode==='lift'?z.fy-S.h-30+Math.sin(fr/5)*2:z.fy-S.hand.h;
 if(h.mode==='lift'){const k=h.t/S.tell;b.globalAlpha=.15+.35*k;rect(b,h.x0,z.fy-S.h,h.x1-h.x0,S.h,'#ff9a8a');b.globalAlpha=.6+.4*k;rect(b,h.x0,z.fy-2,h.x1-h.x0,2,k>.7&&(fr>>1)%2?'#ffffff':'#ff9a8a');b.globalAlpha=1;}
 const open=h.mode==='rest';
 if(open){b.globalAlpha=.35+.25*Math.sin(fr/3);rect(b,cx-15,y-3,30,S.hand.h+3,'#fff1b8');b.globalAlpha=1;}
 rect(b,cx-12,y,24,S.hand.h,open?VES.boneL:'#b3a9bf');rect(b,cx-12,y+S.hand.h-3,24,3,VES.boneD);for(let i=0;i<4;i++)rect(b,cx-11+i*6,y-4,3,5,VES.bone);
}
function drawVesper(b,g){
 const z=g.vesper;if(!z)return;const fr=g.frame||0,fy=z.fy,VK=F().VK;
 if(z.form===3&&z.mode!=='still')giant(b,g,z,fr);
 // hazards and tells
 for(const w of z.waves){rect(b,w.x-3,w.y-7,6,7,VES.chainLit);rect(b,w.x-3,w.y-7,6,1,'#ffffff');}
 for(const cu of z.curtains)batWall(b,cu,8,fy,fr);
 if(z.teeth)for(const s of z.teeth.segs){if(s.crack){b.globalAlpha=.5+.5*((fr>>1)%2);for(let i=0;i<3;i++)rect(b,s.x+3+i*8,fy-1-(i%2),5,1,'#ffd9b0');b.globalAlpha=1;}
  if(s.up)for(let i=0;i<4;i++){const tx=s.x+2+i*6;for(let r=0;r<VK.teeth.h;r++){const w=Math.max(1,4-Math.floor(r/4));rect(b,tx+2-w/2,fy-r-1,w,1,r>VK.teeth.h-4?VES.boneL:VES.bone);}}}
 if(z.mode==='lunge-tell'){const k=z.t/VK.lunge.tell,x0=z.lunge.dir>0?z.x+z.w:z.d.arena[0]*8,x1=z.lunge.dir>0?(z.d.arena[1]+1)*8:z.x;b.globalAlpha=.3+.5*k;rect(b,x0,fy-2,x1-x0,2,TELL);b.globalAlpha=.15*k;rect(b,x0,fy-VK.skull.h,x1-x0,VK.skull.h,TELL);b.globalAlpha=1;}
 if(z.mode==='dive-tell'){const k=z.t/VK.dive.tell;b.globalAlpha=.3+.5*k;rect(b,z.diveX+5,z.y+z.h,2,fy-z.y-z.h,TELL);rect(b,z.diveX-4,fy-2,20,2,TELL);b.globalAlpha=1;}
 if(z.form===3)hand(b,z,fr);
 if(z.ghost){const gz=z.ghost,k=z.t/(z.second?VK.phantom.tell2:VK.phantom.tell),R=VK.phantom.reach,cx=gz.x+6;
  b.globalAlpha=.2+.3*k;rect(b,gz.face>0?cx:cx-R,gz.y+VK.h-30,R,30,'#c9a8ff');b.globalAlpha=1;cloaked(b,gz.x,gz.y,gz.face,fr,'ghost',.35+.35*k);}
 if(z.mode==='slash'){const R=VK.phantom.reach,cx=z.x+6;b.globalAlpha=1-z.t/VK.phantom.slash;rect(b,z.face>0?cx:cx-R,z.y+14,R,2,'#f1e8ff');rect(b,z.face>0?cx+R-6:cx-R,z.y+6,6,18,'#b596e6');b.globalAlpha=1;}
 if(z.mode==='idle'&&!g.awake){}
 const open=z.mode==='open'&&z.form!==3,ward=z.need>3;
 if(z.mode==='vanish'){cloaked(b,z.x,z.y,z.face,fr,'',1-z.t/VK.vanish);}
 else if(z.mode!=='ghost'&&z.form!==3||z.mode==='still'){
  if(open){b.globalAlpha=.35+.25*Math.sin(fr/3);rect(b,z.x-3,z.y-3,z.w+6,z.h+6,'#fff1b8');b.globalAlpha=1;}
  const hurt=z.hurt>0&&(z.hurt>>1)%2===0;if(hurt)b.globalAlpha=.55;
  if(z.form===2&&z.mode!=='still')skull(b,z.x,z.y,z.w,z.h,fr,open);
  else if(z.form===1&&z.mode!=='still'&&!z.dizzy)unbound(b,z.x,z.y,fr);
  else cloaked(b,z.x,z.y,z.face,fr,z.mode==='still'?'':z.mode,1);
  b.globalAlpha=1;
  if(z.dizzy&&(fr>>2)%2)rect(b,z.x+5,z.y-4,2,2,'#ffe9a8');
  if(ward&&!open&&z.mode!=='still'){b.globalAlpha=.25+.12*Math.sin(fr/6);b.strokeStyle='#cfe8ff';b.lineWidth=1;b.strokeRect(z.x-4.5,z.y-4.5,z.w+9,z.h+9);b.globalAlpha=1;}
 }
 if(z.mode==='still'){label(b,'VESPER IS STILL',z.x+6,z.y-8,'#f0d9a8');return;}
 if(z.mode==='idle')return;
 const at=z.ghost||(z.mode==='vanish'?null:z),lx=z.form===3?(z.d.arena[0]+z.d.arena[1]+1)*4:at?(z.ghost?at.x+6:z.x+z.w/2):null,ly=z.form===3?z.d.top*8:at?(z.ghost?at.y:z.y)-12:0;
 if(lx==null)return;
 pips(b,lx,ly+3,z.need,z.wounds,'#e2d3f2');label(b,F().FORMS[z.form]+(ward?' · HIS WARD HOLDS':''),lx,ly,ward?'#cfe8ff':'#d8cdf5');
}

function draw(b,g){drawCurtains(b,g);drawDuel(b,g);drawVesper(b,g);}
const event=(e,{burst,shake})=>{
 const inClimb=!!root.BladefallPitchView?.climb?.state?.();   // the Room Bank plays these rooms without Survive's state
 if(e.type==='echo-wound'||e.type==='vesper-wound')burst(e.x,e.y,20,'#f2e2ff',70,32);
 if(e.type==='echo-parried')burst(e.x,e.y,16,'#b5ffea',70,22);
 if(e.type==='echo-wave'||e.type==='vesper-chains')burst(e.x,e.y,10,'#b5a3ed',40,18);
 if(e.type==='vesper-slam'||e.type==='vesper-land'){shake?.(4);burst(e.x,e.y,18,'#e9dfc9',60,28);}
if((e.type==='vesper-form'||e.type==='vesper-wake')&&inClimb)root.BladefallPitchView?.climb?.state?.()?.api?.music?.(true);
 if(e.type==='vesper-form'){shake?.(3,14);burst(e.x,e.y,30,'#c9a8ff',80,40);if(inClimb)root.BladefallPitchView.climb.announce(e.name,170);}
 if(e.type==='echo-phase'&&root.BladefallPitchView?.climb?.state?.())root.BladefallPitchView.climb.announce(e.name,170);
 if(e.type==='echo-shift')burst(e.x,e.y,24,'#86e6d8',70,30);
 if(e.type==='echo-yield'){burst(e.x,e.y,26,'#86e6d8',60,40);root.BladefallClimbFinale?.echoYielded?.();}
 if(e.type==='vesper-still'){burst(e.x,e.y,40,'#f0d9a8',90,60);root.BladefallClimbFinale?.vesperStill?.();}
 if(e.type==='echo-leave')root.BladefallClimbFinale?.say?.('echo-leave');
 if(e.type==='vesper-wake')root.BladefallClimbFinale?.say?.('vesper-wake');
};
const sfx={'echo-tell':(e,{tone})=>tone(e.leap?300:520,.18,'triangle',.03,e.leap?120:-60),'echo-dash':(e,{noise})=>noise?.(.12,.04),'echo-wave':(e,{tone})=>tone(110,.3,'square',.04,-40),
 'echo-wound':(e,{tone})=>{tone(392,.2,'square',.05,200);tone(784,.25,'sine',.04,-300,.05);},'echo-parried':(e,{tone})=>tone(880,.15,'triangle',.05,-200),'echo-yield':(e,{tone})=>{tone(262,.8,'sine',.05,0);tone(392,.9,'sine',.04,0,.2);},
 'vesper-ghost':(e,{tone})=>tone(180,.4,'sine',.04,-60),'vesper-slash':(e,{noise})=>noise?.(.15,.05),'vesper-bats':(e,{tone})=>tone(1200,.3,'square',.015,600),'vesper-slam':(e,{tone})=>tone(70,.5,'square',.06,-30),
 'vesper-wound':(e,{tone})=>{tone(330,.25,'square',.05,330);tone(660,.3,'sine',.04,-200,.06);},'vesper-form':(e,{tone})=>tone(140,1.1,'sawtooth',.04,-60),'vesper-still':(e,{tone})=>{tone(196,1.5,'sine',.05,0);tone(294,1.6,'sine',.04,0,.3);tone(392,1.8,'sine',.03,0,.6);}};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'finale',draw,event,sfx});
})(typeof window!=='undefined'?window:globalThis);
