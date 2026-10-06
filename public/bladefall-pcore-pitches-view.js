/* Precision Core — Merge Pitches view (7.257). Draws and runs the three prototypes in bladefall-pcore-pitches.js:
   A · the Outskirts room by room: screens slide into each other (no wipe, no card between rooms), the region's
       people stand in the rooms and speak when you walk up, and Mara's three bearings fill a chart as you touch them;
   B · Frostfell as one mountain: the room scrolls (the view's camera), hearths keep your place, Nim follows;
   C · pockets: a single screen drawn over the base game's own world (bladefall-merge-road.js hosts the frame).
   Every hook here answers only for pitch chapters, so the Precision Courses, the survey and gate trials are untouched. */
(function(root){
'use strict';
const PV={};
const R=()=>root.BladefallPrecisionRooms;
let st=null;   // {kind, chapter, bearings:Set, slide, pocket, hearth, trail, toast, spoke:Set}
const isPitch=ch=>!!(ch&&ch.pitch);
const chapterNow=view=>R().chapters[view.chapter];
const roomDef=view=>view.g&&view.g.room.def;

/* ---------------------------------------------------------------- palettes */
const PAL={
 outskirts:{sky0:'#0d1324',sky1:'#2b2541',far:'#2a2b44',rock:'#4a4658',rockD:'#2b2937',edge:'#8f88a6',moss:'#6f8d5a',accent:'#e9c47a'},
 mothlight:{sky0:'#081214',sky1:'#132529',far:'#1a3036',rock:'#34474c',rockD:'#1e2b2f',edge:'#6f9196',moss:'#5f8d6c',accent:'#c4ecd0'},
 pocket:{sky0:'#000',sky1:'#000',far:'#000',rock:'#4b4656',rockD:'#2a2834',edge:'#958cab',moss:'#73905d',accent:'#e9c47a'},
};
PV.palette=ch=>{if(!st||!isPitch(ch))return null;const d=root.BladefallPrecisionView?.view.g?.room.def;return PAL[d&&d.palette]||null;};

/* ---------------------------------------------------------------- start */
PV.start=function(q,api){
 const kind=q.get('pitch'),view=api.view;
 const id={outskirts:'mp-outskirts',frostfell:'mp-frostfell','pocket-a':'mp-pocket-a','pocket-b':'mp-pocket-b'}[kind]||'mp-outskirts';
 const c=R().chapters.findIndex(ch=>ch.id===id);if(c<0)return api.startChapter(0);
 st={kind,chapter:c,bearings:new Set(),slide:null,pocket:null,hearth:-1,trail:[],toast:null,spoke:new Set(),api,view,held:false};
 view.pitch=st;
 if(kind.startsWith('pocket')){
  st.pocket={ox:0,oy:0,scale:4,go:false,done:false};
  document.documentElement.classList.add('pcPocket');document.body.classList.add('pcPocket');
  addEventListener('message',onHostMessage);
 }
 api.startChapter(c);
 if(st.pocket){api.music(false);tellHost({type:'pocket-ready',room:roomDef(view).id});}
};
function tellHost(m){try{if(root.parent&&root.parent!==root)root.parent.postMessage({source:'bladefall-pcore',...m},'*');}catch(e){}}
function onHostMessage(e){
 const m=e.data;if(!m||m.source!=='bladefall-road'||!st||!st.pocket)return;
 if(m.type==='pocket-frame'){st.pocket.ox=m.ox;st.pocket.oy=m.oy;st.pocket.scale=m.scale;}
 if(m.type==='pocket-go'){st.pocket.go=true;try{root.focus();}catch(err){}}
}
PV.pocket=()=>st&&st.pocket?st.pocket:null;

/* ---------------------------------------------------------------- per tick: slides, hearths, the follower */
PV.holding=function(){
 if(!st)return false;
 const view=st.view,g=view.g;
 if(st.pocket&&(!st.pocket.go||st.pocket.done))return true;
 if(st.slide){st.slide.t++;if(st.slide.t>=st.slide.n)st.slide=null;return true;}
 const d=g.room.def,p=g.p;
 // Hearths: walking past one keeps your place there (Frostfell's braziers as checkpoints).
 if(d.hearths&&p.state==='normal'){
  d.hearths.forEach((h,i)=>{const hx=h.c*8,hy=h.r*8;
   // Passing over a hearth counts, not only stopping at it: within a tile and a half of it, up to five tiles above.
   if(i>st.hearth&&Math.abs(p.x+4-(hx+4))<12&&p.y+11<=hy+10&&p.y+11>=hy-32){
    st.hearth=i;g.room.spawn={x:hx,y:hy+8-11};if(i>0)st.toast={text:'Hearth · your place is kept',t:150};
   }});
 }
 // The follower walks the knight's own path a moment behind.
 if(p.state==='normal'||p.state==='climb'){st.trail.push({x:p.x,y:p.y,g:p.onGround,f:p.facing});if(st.trail.length>90)st.trail.shift();}
 // Bearings: a stake lit in a bearing room fills Mara's chart.
 if(d.bearing&&g.ents.some(e=>e.type==='stone'&&e.lit)&&!st.bearings.has(d.bearing)){st.bearings.add(d.bearing);
  st.toast={text:`Bearing taken · ${d.bearing}`,t:150};}
 if(st.toast&&--st.toast.t<=0)st.toast=null;
 return false;
};

/* ---------------------------------------------------------------- room to room: Celeste's slide */
PV.exit=function(view,nextRoom){
 if(!st)return false;
 const g=view.g,ch=chapterNow(view);if(!isPitch(ch))return false;
 if(st.pocket){st.pocket.done=true;view.mode='play';
  tellHost({type:'pocket-cleared',x:g.p.x,y:g.p.y,vx:g.p.vx,vy:g.p.vy,room:g.room.id});return true;}
 const first=R().chapters.slice(0,view.chapter).reduce((n,c)=>n+c.rooms.length,0);
 const last=g.roomIndex>=first+ch.rooms.length-1;
 if(last)return false;
 const dir=g.room.exit||'right';
 const old=document.createElement('canvas');old.width=view.buf.width;old.height=view.buf.height;old.getContext('2d').drawImage(view.buf,0,0);
 nextRoom();
 st.trail=[];
 st.slide={dir,t:0,n:26,old};
 return true;
};
let slideCanvas=null;
PV.slideFrame=function(buf,W,H){
 if(!st||!st.slide)return null;
 const s=st.slide,k=ease(Math.min(1,s.t/s.n));
 slideCanvas=slideCanvas||document.createElement('canvas');slideCanvas.width=W;slideCanvas.height=H;
 const c=slideCanvas.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);
 const [dx,dy]={right:[-1,0],left:[1,0],up:[0,1],down:[0,-1]}[s.dir]||[-1,0];
 c.drawImage(s.old,Math.round(dx*k*W),Math.round(dy*k*H));
 c.drawImage(buf,Math.round(-dx*(1-k)*W),Math.round(-dy*(1-k)*H));
 return slideCanvas;
};
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;

/* ---------------------------------------------------------------- the end of a pitch */
PV.chapterDone=function(ch,api){
 if(!st)return false;
 const chap=R().chapters[ch];if(!isPitch(chap))return false;
 const view=st.view;view.mode='card';view.replay=null;view.wipe=0;view.wipeTo=null;api.music(false);
 const s=view.chapterStats,secs=Math.round(s.frames/60);
 const chart=chap.pitch==='outskirts'?`<tr><td>Mara's chart</td><td>${['ASH','GLASS','IRON'].map(b=>(st.bearings.has(b)?'◆ ':'◇ ')+b).join(' · ')}</td></tr>`:'';
 api.showOverlay(`<div class="pcCard"><h1>${chap.name}</h1><p class="pcSub">${chap.outro||''}</p>
 <table class="pcTable"><tr><td>Deaths</td><td>${s.deaths}</td></tr><tr><td>Time</td><td>${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}</td></tr>${chart}</table>
 <p class="pcSub">${chap.blurb||''}</p>
 <button class="pcBtn" id="pcPitchAgain">Play this pitch again</button><a class="pcBtn ghost" id="pcPitchBack" href="index.html?pitches" data-back>Back to Merge Pitches</a></div>`);
 document.getElementById('pcPitchAgain').onclick=()=>{st.bearings.clear();st.hearth=-1;st.trail=[];api.startChapter(ch);};
 return true;
};
/* The pause menu's "Chapters" goes back to the pitches, not the Precision Courses. */
PV.menu=function(){if(!st)return false;location.href='index.html?pitches';return true;};

/* ---------------------------------------------------------------- backdrops */
function hash(x,y){let h=(x*374761393+y*668265263)^0x5bd1e995;h=(h^(h>>>13))*1274126177;return ((h^(h>>>16))>>>0)/4294967295;}
PV.background=function(b,pal,view,W,H){
 if(!st)return false;
 const d=roomDef(view);if(!d||!isPitch(chapterNow(view)))return false;
 const cam=view.cam||{x:0,y:0},t=view.g.frame;
 if(d.pocket){
  // The base game's world shows through: only the ground line down is the pocket's own dark.
  b.clearRect(0,0,W,H);b.fillStyle='#07080d';b.fillRect(0,144,W,H-144);return true;
 }
 if(d.palette==='frost'){
  const rh=view.g.room.h||H,climb=cam.y/Math.max(1,rh-H);
  const gr=b.createLinearGradient(0,0,0,H);gr.addColorStop(0,climb<.5?'#1b2d44':'#22344c');gr.addColorStop(1,'#7f98ad');b.fillStyle=gr;b.fillRect(0,0,W,H);
  // Far peaks, then nearer ridges: they move slower than the rock so the mountain has depth.
  ridge(b,W,H,cam.x*.08,cam.y*.06+70,'#5c738a',38,.9,11);
  ridge(b,W,H,cam.x*.18,cam.y*.14+100,'#465b72',30,.95,23);
  b.fillStyle='#ffffff';
  for(let i=0;i<70;i++){const sp=.3+hash(i,7)*.7,x=((hash(i,3)*W*2-cam.x*sp*.5+Math.sin(t/50+i)*6+t*.15*sp)%W+W)%W,y=((hash(7,i)*H*2+t*.45*sp-cam.y*sp*.5)%H+H)%H;
   b.globalAlpha=.35+.4*sp;b.fillRect(x|0,y|0,sp>.7?2:1,sp>.7?2:1);}
  b.globalAlpha=1;return true;
 }
 if(d.palette==='mothlight'){
  const gr=b.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#071012');gr.addColorStop(1,'#14282c');b.fillStyle=gr;b.fillRect(0,0,W,H);
  b.fillStyle='#0f1d20';for(let i=0;i<9;i++){const x=i*40+((hash(i,1)*18)|0);b.fillRect(x,0,12+((hash(i,2)*10)|0),H);}
  for(let i=0;i<22;i++){const x=(hash(i,11)*W+Math.sin(t/70+i)*14+W)%W,y=(hash(11,i)*H+Math.cos(t/90+i*2)*10+H)%H,a=.3+.5*Math.abs(Math.sin(t/40+i));
   b.globalAlpha=a*.35;b.fillStyle='#bff0c8';b.fillRect((x|0)-1,(y|0)-1,3,3);b.globalAlpha=a;b.fillRect(x|0,y|0,1,1);}
  b.globalAlpha=1;return true;
 }
 // The Outskirts at dusk: the same sky the base game draws, a moon, the ridge, the road's distant fires.
 const idx=view.g.roomIndex;
 const gr=b.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#0c1224');gr.addColorStop(.7,'#2a2440');gr.addColorStop(1,'#43304a');b.fillStyle=gr;b.fillRect(0,0,W,H);
 for(let i=0;i<40;i++){const x=hash(i,idx+40)*W,y=hash(idx+40,i)*H*.55;b.globalAlpha=.25+.5*Math.abs(Math.sin(t/80+i));b.fillStyle='#e8e4ff';b.fillRect(x|0,y|0,1,1);}
 b.globalAlpha=1;
 const mx=250-idx*30,my=34;b.fillStyle='#f3e6c4';b.beginPath();b.arc(mx,my,11,0,6.283);b.fill();b.fillStyle='#2a2440';b.globalAlpha=.25;b.beginPath();b.arc(mx+4,my-2,9,0,6.283);b.fill();b.globalAlpha=1;
 ridge(b,W,H,idx*90,96,'#262640',26,1,idx*7+3);
 ridge(b,W,H,idx*140,118,'#1f1d33',22,1,idx*5+9);
 return true;
};
function ridge(b,W,H,off,base,col,amp,alpha,seed){
 b.fillStyle=col;b.globalAlpha=alpha;b.beginPath();b.moveTo(0,H);
 for(let x=0;x<=W;x+=4){const u=(x+off)/53;const y=base-amp*(.55*Math.abs(Math.sin(u+seed))+.3*Math.abs(Math.sin(u*2.3+seed*1.7))+.15*Math.sin(u*5.1));b.lineTo(x,y);}
 b.lineTo(W,H);b.closePath();b.fill();b.globalAlpha=1;
}

/* ---------------------------------------------------------------- people, props, hearths */
const FOLK={
 vey:{cloak:'#7a5a44',trim:'#c79a62',skin:'#d9b38c',hood:true},
 sentinel:{cloak:'#555b66',trim:'#a9b2bf',skin:'#c9a98a',helm:true,spear:true},
 olan:{cloak:'#56624d',trim:'#b7a77a',skin:'#d2ad86',cap:true},
 mara:{cloak:'#3f6a6e',trim:'#e0c27a',skin:'#d8b08a',staff:true},
 nim:{cloak:'#52788d',trim:'#ffd98a',skin:'#e2c4a2',hood:true,flame:true},
};
function person(b,x,y,who,t,face){
 // (x,y) is the feet's centre. 9 px wide, 14 tall.
 const f=FOLK[who]||FOLK.olan,bob=Math.round(Math.sin(t/30)*.6);
 const X=x-4,Y=y-14+bob;
 b.fillStyle='#00000055';b.fillRect(x-4,y-1,9,1);
 b.fillStyle=f.cloak;b.fillRect(X+1,Y+5,7,8);b.fillRect(X+2,Y+13,2,1);b.fillRect(X+5,Y+13,2,1);
 b.fillStyle=f.trim;b.fillRect(X+1,Y+11,7,1);
 b.fillStyle=f.skin;b.fillRect(X+2,Y+1,5,4);
 b.fillStyle='#1a1416';b.fillRect(face>0?X+5:X+3,Y+2,1,1);
 if(f.hood){b.fillStyle=f.cloak;b.fillRect(X+1,Y,7,2);b.fillRect(face>0?X+1:X+7,Y+1,1,4);}
 if(f.cap){b.fillStyle='#3a3226';b.fillRect(X+1,Y,7,2);b.fillRect(face>0?X+6:X,Y+1,3,1);}
 if(f.helm){b.fillStyle='#8b93a0';b.fillRect(X+1,Y-1,7,3);b.fillStyle='#c8d0da';b.fillRect(X+4,Y-2,1,1);}
 if(f.spear){b.fillStyle='#8a7350';b.fillRect(face>0?X+9:X-1,Y-4,1,18);b.fillStyle='#d8dde4';b.fillRect(face>0?X+8:X-2,Y-6,3,2);}
 if(f.staff){b.fillStyle='#8a6a40';b.fillRect(face>0?X+9:X-1,Y-2,1,16);b.fillStyle='#e0c27a';b.fillRect(face>0?X+8:X-2,Y-3,3,1);}
 if(f.flame){const fl=Math.abs(Math.sin(t/7));b.fillStyle='#3a2a1a';b.fillRect(face>0?X+8:X-1,Y+7,2,3);
  b.fillStyle='#ffb347';b.fillRect(face>0?X+8:X-1,Y+5,2,2);b.fillStyle='#fff1b0';b.fillRect(face>0?X+8:X-1,Y+5+(fl>.5?0:1),1,1);
  b.globalAlpha=.18;b.fillStyle='#ffd98a';b.beginPath();b.arc(face>0?X+9:X,Y+6,9,0,6.283);b.fill();b.globalAlpha=1;}
}
function prop(b,k,x,y,t){
 // (x,y) is the tile the prop stands in; it sits on the floor below that tile.
 const fy=y+8;
 if(k==='watchfire'||k==='hearth'){
  b.fillStyle='#4a3a2c';b.fillRect(x,fy-2,8,2);b.fillStyle='#2c221a';b.fillRect(x+1,fy-3,6,1);
  for(let i=0;i<3;i++){const h=3+Math.round(2*Math.abs(Math.sin(t/6+i*2)));b.fillStyle=i===1?'#ffe08a':'#ff8a3a';b.fillRect(x+2+i*1.5|0,fy-3-h,2,h);}
  b.globalAlpha=.16;b.fillStyle='#ffb347';b.beginPath();b.arc(x+4,fy-5,k==='hearth'?16:12,0,6.283);b.fill();b.globalAlpha=1;
  if(k==='hearth'){b.fillStyle='#6a5a4a';b.fillRect(x-1,fy-1,10,1);}
 }else if(k==='tent'){b.fillStyle='#5a4e46';b.beginPath();b.moveTo(x-6,fy);b.lineTo(x+4,fy-11);b.lineTo(x+14,fy);b.fill();b.fillStyle='#2a2322';b.fillRect(x+2,fy-6,4,6);}
 else if(k==='trumpets'){for(let i=0;i<3;i++){b.fillStyle='#3e5a36';b.fillRect(x+i*3,fy-5-i,1,5+i);b.fillStyle='#f0ece0';b.fillRect(x+i*3-1,fy-7-i,3,2);}}
 else if(k==='clock'){b.fillStyle='#4a4038';b.fillRect(x+3,fy-16,2,16);b.fillStyle='#d8cfb4';b.beginPath();b.arc(x+4,fy-19,4,0,6.283);b.fill();b.fillStyle='#2a2420';b.fillRect(x+4,fy-22,1,3);b.fillRect(x+2,fy-19,2,1);}
 else if(k==='mast'){b.fillStyle='#5a4a3a';b.fillRect(x+3,fy-28,2,28);b.fillStyle='#b44a3a';b.fillRect(x+5,fy-28,6,4);}
 else if(k==='milestone'){b.fillStyle='#7a7484';b.fillRect(x+1,fy-7,6,7);b.fillStyle='#5a5664';b.fillRect(x+2,fy-5,4,1);}
 else if(k==='palisade'){b.fillStyle='#5a4632';for(let i=0;i<4;i++){b.fillRect(x+i*3,fy-10+(i%2)*2,2,10-(i%2)*2);}}
 else if(k==='lantern'){b.fillStyle='#3a3a3a';b.fillRect(x+3,fy-14,1,14);b.fillStyle='#c4ecd0';b.fillRect(x+2,fy-17,3,3);b.globalAlpha=.2;b.beginPath();b.arc(x+3,fy-16,8,0,6.283);b.fill();b.globalAlpha=1;}
 else if(k==='gatehouse'){b.fillStyle='#2a3436';b.fillRect(x-3,0,3,fy);b.fillRect(x+16,0,3,fy);}
 else if(k==='house'){b.fillStyle='#4b3b33';b.fillRect(x,fy-10,14,10);b.fillStyle='#e8f2fa';b.fillRect(x-1,fy-12,16,2);b.fillStyle='#ffcf7a';b.fillRect(x+3,fy-7,3,3);}
 else if(k==='bell'){b.fillStyle='#4a4032';b.fillRect(x,fy-14,10,1);b.fillStyle='#b89a5a';b.fillRect(x+3,fy-13,4,5);}
}
PV.draw=function(b,g,view){
 if(!st)return;
 const d=g.room.def;if(!isPitch(chapterNow(view)))return;
 const t=g.frame;
 for(const pr of d.decor||[])prop(b,pr.k,pr.c*8,pr.r*8,t);
 (d.hearths||[]).forEach((h,i)=>{prop(b,'hearth',h.c*8,h.r*8,t);if(i<=st.hearth){b.globalAlpha=.25;b.fillStyle='#ffd98a';b.fillRect(h.c*8-1,h.r*8+8,10,1);b.globalAlpha=1;}});
 for(const who of d.people||[]){
  if(who.follow){
   const tr=st.trail,p=g.p,lag=26;
   const at=tr.length>lag?tr[tr.length-1-lag]:(tr[0]||{x:who.c*8,y:who.r*8-3,f:1});
   const x=tr.length?at.x+4-at.f*6:who.c*8+4,y=tr.length?at.y+11:who.r*8+8;
   person(b,x,y,who.who,t,tr.length?at.f:who.face);
   who._x=x;who._y=y;continue;
  }
  const x=who.c*8+4,y=who.r*8+8;person(b,x,y,who.who,t,g.p.x+4<x?-1:1);who._x=x;who._y=y;
 }
};

/* ---------------------------------------------------------------- speech, the chart and toasts (screen space) */
function wrap(ctx,text,maxW){const words=text.split(' '),lines=[];let cur='';for(const w of words){const tryL=cur?cur+' '+w:w;if(ctx.measureText(tryL).width>maxW&&cur){lines.push(cur);cur=w;}else cur=tryL;}if(cur)lines.push(cur);return lines;}
PV.hud=function(ctx,ox,oy,scale,g,view){
 if(!st||!isPitch(chapterNow(view)))return;
 const d=g.room.def,cam=view.cam||{x:0,y:0},p=g.p;
 const fs=Math.max(11,Math.round(scale*3.6),Math.round(10*(view.dpr||1)));ctx.font=`${fs}px ui-monospace,Menlo,monospace`;ctx.textBaseline='top';
 // A person speaks when you walk up to them; the line stays up while you are near.
 for(const who of d.people||[]){
  if(who._x===undefined)continue;
  const near=Math.abs(p.x+4-who._x)<(who.follow?28:44)&&Math.abs(p.y+11-who._y)<24;
  if(who.follow&&st.spoke.has(who.who)&&!near)continue;
  if(!near)continue;
  st.spoke.add(who.who);
  const name=who.who==='sentinel'?'Sentinel':who.who[0].toUpperCase()+who.who.slice(1);
  const maxW=Math.min(view.canvas.width*.42,scale*150);
  const lines=wrap(ctx,who.line,maxW),lh=fs*1.25,w=Math.max(...lines.map(l=>ctx.measureText(l).width),ctx.measureText(name).width)+fs*1.4,h=lh*(lines.length+1)+fs*.8;
  let sx=ox+(who._x-cam.x)*scale-w/2,sy=oy+(who._y-cam.y-18)*scale-h;
  const rx0=Math.max(4,ox),rx1=Math.min(view.canvas.width-4,ox+W0(view)*scale);   // keep the line over the room
  sx=Math.max(rx0+4,Math.min(rx1-w-4,sx));sy=Math.max(oy+4,sy);
  ctx.fillStyle='rgba(14,16,24,.9)';ctx.fillRect(sx,sy,w,h);ctx.strokeStyle='#c9a86a';ctx.lineWidth=1;ctx.strokeRect(sx+.5,sy+.5,w-1,h-1);
  ctx.fillStyle='#c9a86a';ctx.fillText(name.toUpperCase(),sx+fs*.7,sy+fs*.4);
  ctx.fillStyle='#efe4cc';lines.forEach((l,i)=>ctx.fillText(l,sx+fs*.7,sy+fs*.4+lh*(i+1)));
 }
 // Mara's chart: the Outskirts' quest drawn into the run.
 if(st.kind==='outskirts'){
  const items=['ASH','GLASS','IRON'],x0=ox+W0(view)*scale-8,y0=oy+Math.round(scale*3)+fs+8;   // under the deaths line
  const txt=items.map(b=>(st.bearings.has(b)?'◆':'◇')+' '+b).join('   ');
  const tw=ctx.measureText(txt).width+fs*1.2;
  ctx.fillStyle='rgba(14,16,24,.75)';ctx.fillRect(x0-tw,y0,tw,fs*1.6);
  ctx.fillStyle='#e9c47a';ctx.fillText(txt,x0-tw+fs*.6,y0+fs*.3);
 }
 // A pocket has no HUD of its own; its rule shows under the road for the first seconds.
 if(st.pocket&&st.pocket.go&&d.hint&&view.roomTimer<420){ctx.globalAlpha=Math.min(1,(420-view.roomTimer)/60);
  const tw=ctx.measureText(d.hint).width+fs*1.4,x=ox+(W0(view)*scale-tw)/2,y=oy+156*scale;
  ctx.fillStyle='rgba(14,16,24,.8)';ctx.fillRect(x,y,tw,fs*1.7);ctx.fillStyle='#e9dcc0';ctx.fillText(d.hint,x+fs*.7,y+fs*.35);ctx.globalAlpha=1;}
 if(st.toast){const a=Math.min(1,st.toast.t/30);ctx.globalAlpha=a;const tw=ctx.measureText(st.toast.text).width+fs*1.4,x=ox+(W0(view)*scale-tw)/2,y=oy+Math.round(scale*28);
  ctx.fillStyle='rgba(14,16,24,.85)';ctx.fillRect(x,y,tw,fs*1.7);ctx.fillStyle='#ffd98a';ctx.fillText(st.toast.text,x+fs*.7,y+fs*.35);ctx.globalAlpha=1;}
};
const W0=view=>view.buf?view.buf.width:320;

// Room by Room (7.259) reuses these drawing helpers and adds its own people to FOLK.
PV.helpers={person,prop,ridge,hash,wrap,ease,FOLK,PAL};
root.BladefallPitchView=PV;
})(typeof window!=='undefined'?window:globalThis);
