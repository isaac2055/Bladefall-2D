/* Room by Room view (7.259): plays the regions in bladefall-rbr-NN-*.js the way Merge Pitch A plays the Outskirts.
   Screens slide into each other; the region's people stand in the rooms and speak when the knight walks up;
   optional quests branch off a room's side exit and come back to it; keepsakes are kept across regions.

   It wraps BladefallPitchView: every hook answers for Room by Room chapters (chapter.rbr) and hands everything
   else to the pitch view, so the Merge Pitches, the Precision Courses, the survey and the gate trials are untouched.
   Saves under its own key (bladefall.rbr.v1). Registry and conventions: bladefall-rbr.js, docs/plans/room-by-room.md. */
(function(root){
'use strict';
const BASE=root.BladefallPitchView;if(!BASE)return;
const RBR=()=>root.BladefallRoomByRoom;
const R=()=>root.BladefallPrecisionRooms;
const H=BASE.helpers;
const SAVE='bladefall.rbr.v1';
function load(){try{return Object.assign({cleared:{},best:{},keepsakes:{},met:{}},JSON.parse(localStorage.getItem(SAVE))||{});}catch(e){return {cleared:{},best:{},keepsakes:{},met:{}};}}
function write(){try{localStorage.setItem(SAVE,JSON.stringify(save));}catch(e){}}
let save=load();
let st=null;   // {region, chapter, api, view, quest:{id,from}|null, slide, toast, trail, hearth, spoke:Set, gone:Set, walk:{}}
const PV={};
const isRbr=ch=>!!(ch&&ch.rbr);
const chapterNow=view=>R().chapters[view.chapter];
const regionOf=ch=>RBR().region(ch.rbr);
const firstIndex=c=>R().chapters.slice(0,c).reduce((n,x)=>n+x.rooms.length,0);

/* ---------------------------------------------------------------- people of the later regions */
Object.assign(H.FOLK,{
});

/* Regions bring their own people, props and palettes (addRegion's folk, props, palettes). */
const PROPS={};
function mergeRegions(){for(const r of RBR().regions){Object.assign(H.FOLK,r.folk||{});Object.assign(PROPS,r.props||{});Object.assign(PAL,r.palettes||{});}}

/* ---------------------------------------------------------------- palettes (tiles) and skies */
const PAL={
 outskirts:H.PAL.outskirts,mothlight:H.PAL.mothlight,
 woods:{sky0:'#0b1410',sky1:'#13211a',far:'#1b2e23',rock:'#34443a',rockD:'#202a24',edge:'#6c8a70',moss:'#7fa05d',accent:'#d8c27a'},
 causeway:{sky0:'#160f0e',sky1:'#241a1a',far:'#33231f',rock:'#4e3c34',rockD:'#30251f',edge:'#9a7a64',moss:'#6d6a45',accent:'#e8a86a'},
 updrafts:{sky0:'#17120c',sky1:'#2a2116',far:'#3a2d1e',rock:'#5a4630',rockD:'#3a2d1f',edge:'#b0905e',moss:'#7d7a46',accent:'#ffd28a'},
 marksman:{sky0:'#15110b',sky1:'#241c12',far:'#312718',rock:'#544430',rockD:'#352b1e',edge:'#a48a5e',moss:'#706a40',accent:'#f0c070'},
 keep:{sky0:'#110f1c',sky1:'#1c1830',far:'#2a2440',rock:'#4a4462',rockD:'#2d2a3e',edge:'#9a90bf',moss:'#6f7a5a',accent:'#e9c47a'},
 fractured:{sky0:'#0a0814',sky1:'#140d22',far:'#1e1630',rock:'#3a3048',rockD:'#221c2e',edge:'#a58fd0',moss:'#6a5a8a',accent:'#d6b0ff'},
};
PV.palette=ch=>{
 if(!st||!isRbr(ch))return BASE.palette(ch);
 const d=st.view.g&&st.view.g.room.def;return PAL[d&&d.palette]||null;   // null: the view's own palette for the region (gaol, frost, …)
};
function skyFor(name){
 const p=PAL[name]||{sky0:'#0e1116',sky1:'#1c2230',far:'#262d3c'};
 return p;
}
PV.background=function(b,pal,view,W,Hh){
 if(!st||!isRbr(chapterNow(view)))return BASE.background(b,pal,view,W,Hh);
 const d=view.g.room.def,t=view.g.frame,idx=view.g.roomIndex,cam=view.cam||{x:0,y:0};
 const p=PAL[d.palette]?skyFor(d.palette):pal;
 if(d.palette==='outskirts'){
  // The Outskirts at dusk: the base game's sky, a moon that sets as the road goes on, the ridge, the stars.
  const gr=b.createLinearGradient(0,0,0,Hh);gr.addColorStop(0,'#0c1224');gr.addColorStop(.7,'#2a2440');gr.addColorStop(1,'#43304a');b.fillStyle=gr;b.fillRect(0,0,W,Hh);
  for(let i=0;i<40;i++){const x=H.hash(i,idx+40)*W,y=H.hash(idx+40,i)*Hh*.55;b.globalAlpha=.25+.5*Math.abs(Math.sin(t/80+i));b.fillStyle='#e8e4ff';b.fillRect(x|0,y|0,1,1);}
  b.globalAlpha=1;
  const k=(idx-firstIndex(st.chapter))/Math.max(1,regionOf(chapterNow(view)).mainCount);
  const mx=270-k*240,my=30+k*24;b.fillStyle='#f3e6c4';b.beginPath();b.arc(mx,my,11,0,6.283);b.fill();b.fillStyle='#2a2440';b.globalAlpha=.25;b.beginPath();b.arc(mx+4,my-2,9,0,6.283);b.fill();b.globalAlpha=1;
  H.ridge(b,W,Hh,idx*90+cam.x*.1,96,'#262640',26,1,idx*7+3);
  H.ridge(b,W,Hh,idx*140+cam.x*.2,118,'#1f1d33',22,1,idx*5+9);
  return true;
 }
 // Every other region: its own sky, two ridges and a little weather in its accent colour.
 const gr=b.createLinearGradient(0,0,0,Hh);gr.addColorStop(0,p.sky0);gr.addColorStop(1,p.sky1);b.fillStyle=gr;b.fillRect(0,0,W,Hh);
 H.ridge(b,W,Hh,idx*90+cam.x*.1,100,p.far,26,1,idx*7+3);
 H.ridge(b,W,Hh,idx*140+cam.x*.2,124,p.sky0,22,.8,idx*5+9);
 b.fillStyle=(PAL[d.palette]||pal).accent||'#ffffff';
 for(let i=0;i<24;i++){const x=(H.hash(i,11)*W+Math.sin(t/70+i)*14+W)%W,y=(H.hash(11,i)*Hh+t*.2*(1+H.hash(i,3))+Hh)%Hh;b.globalAlpha=.25;b.fillRect(x|0,y|0,1,1);}
 b.globalAlpha=1;return true;
};

/* ---------------------------------------------------------------- start, the region list */
PV.start=function(q,api){
 if(q.get('pitch')!=='rbr')return BASE.start(q,api);
 const view=api.view;mergeRegions();
 st={region:0,chapter:-1,api,view,quest:null,slide:null,toast:null,trail:[],hearth:-1,spoke:new Set(),gone:new Set(),walk:{}};
 view.pitch=st;   // Room by Room uses the per-room review survey.
 const n=+(q.get('region')||0);
 if(n&&startRegion(n,+(q.get('room')||0)))return;
 regionMenu();
};
function startRegion(n,room=0){
 const c=R().chapters.findIndex(ch=>ch.rbr===n);if(c<0)return false;
 Object.assign(st,{region:n,chapter:c,quest:null,slide:null,toast:null,trail:[],hearth:-1,spoke:new Set(),gone:new Set(),walk:{}});
 st.api.startChapter(c,room);
 announce(regionOf(R().chapters[c]).name,180);
 return true;
}
function announce(text,t=150){st.toast={text,t,max:t};}
function regionMenu(){
 const api=st.api,view=st.view;view.mode='menu';api.music(false);
 const built=new Set(RBR().built());
 const kept=Object.keys(save.keepsakes).length,total=RBR().regions.reduce((n,r)=>n+r.quests.filter(q=>q.keepsake).length,0);
 const card=m=>{
  const r=RBR().region(m.n),done=save.cleared[m.n];
  const ks=r?r.quests.filter(q=>q.keepsake):[],got=ks.filter(q=>save.keepsakes[q.keepsake.id]).length;
  return `<button class="pcChoice" ${r?`data-region="${m.n}"`:'disabled'} style="${r?'':'opacity:.45'}"><span class="pcNum">${m.n}</span><span class="pcName">${m.name}${done?' <em>✓</em>':''}</span>
  <span class="pcDesc">${r?(r.blurb||''):(m.device?`Being built: ${m.device}.`:'Being built.')}</span>
  <span class="pcMeta">${r?`${r.mainCount} rooms${ks.length?` · keepsakes ${got}/${ks.length}`:''}${save.best[m.n]?` · best ${save.best[m.n].deaths} deaths`:''}`:'not yet built'}</span></button>`;};
 const base=RBR().MANIFEST.filter(m=>m.act==='base'),fr=RBR().MANIFEST.filter(m=>m.act==='fractured');
 api.showOverlay(`<div class="pcCard wide"><h1>Bladefall · Room by Room</h1>
 <p class="pcSub">The whole game in the new physics, one screen at a time, after Merge Pitch A. People stand in the rooms; quests branch off the road and come back to it, and they are never needed to go on. ${kept}/${total} keepsakes.</p>
 <h2 class="pcPart">The base game</h2><div class="pcGrid">${base.map(card).join('')}</div>
 <h2 class="pcPart">Fractured</h2><div class="pcGrid">${fr.map(card).join('')}</div>
 <button class="pcBtn ghost" id="rbrReviews">Room reviews</button><div class="pcRow"><a class="pcBtn ghost" href="index.html?pitches" data-back>Back to Merge Pitches</a></div></div>`);
 document.getElementById('rbrReviews').onclick=()=>root.BladefallPrecisionSurvey.rbr.panel({showOverlay:api.showOverlay,back:regionMenu});
 document.querySelectorAll('[data-region]').forEach(b=>b.onclick=()=>startRegion(+b.dataset.region));
}
PV.menu=function(){if(!st)return BASE.menu();regionMenu();return true;};

/* ---------------------------------------------------------------- quests and keepsakes */
function questsOf(n){const r=RBR().region(n);return r?r.quests:[];}
function questById(id){for(const r of RBR().regions){const q=r.quests.find(q=>q.id===id);if(q)return q;}return null;}
function hasShardIn(g,roomId){for(const s of g.shards)if(s.startsWith(roomId+':'))return true;return false;}
function bearingsHeld(g,q){
 // Mara-style quests: each named bearing is the shard in the room marked with that bearing.
 const reg=RBR().regions.find(r=>r.quests.includes(q));if(!reg)return [];
 return (q.bearings||[]).filter(b=>{const room=reg.rooms.find(r=>r.bearing===b);return room&&hasShardIn(g,room.id);});
}
function grant(q){
 if(!q.keepsake||save.keepsakes[q.keepsake.id])return;
 save.keepsakes[q.keepsake.id]=true;write();
 announce(`Keepsake · ${q.keepsake.name}`,240);
}
const questDone=q=>!!(q&&q.keepsake&&save.keepsakes[q.keepsake.id]);

/* ---------------------------------------------------------------- per tick */
PV.holding=function(){
 if(!st)return BASE.holding();
 const view=st.view,g=view.g;if(!g||!isRbr(chapterNow(view)))return false;
 if(st.slide){st.slide.t++;if(st.slide.t>=st.slide.n)st.slide=null;return true;}
 const d=g.room.def,p=g.p;
 // An echo branch (Fractured) stays sealed until its keepsake is held.
 if(d.side){const q=questById(d.sideQuest);g.sideSealed=!!(q&&q.needs&&!save.keepsakes[q.needs]);}
 if(d.hearths&&p.state==='normal'){
  d.hearths.forEach((h,i)=>{const hx=h.c*8,hy=h.r*8;
   if(i>st.hearth&&Math.abs(p.x+4-(hx+4))<12&&p.y+11<=hy+10&&p.y+11>=hy-32){st.hearth=i;g.room.spawn={x:hx,y:hy+8-11};if(i>0)announce('Hearth · your place is kept');}});
 }
 if(p.state==='normal'||p.state==='climb'){st.trail.push({x:p.x,y:p.y,f:p.facing});if(st.trail.length>90)st.trail.shift();}
 // A bearing taken: say so once.
 if(d.bearing&&hasShardIn(g,d.id)&&!st.spoke.has('bearing:'+d.bearing)){st.spoke.add('bearing:'+d.bearing);announce(`Bearing taken · ${d.bearing}`);}
 if(st.toast&&--st.toast.t<=0)st.toast=null;
 return false;
};

/* ---------------------------------------------------------------- leaving a room: main road, quest branch, return */
PV.exit=function(view,nextRoom){
 if(!st)return BASE.exit(view,nextRoom);
 const g=view.g,ch=chapterNow(view);if(!isRbr(ch))return false;
 const d=g.room.def;
 if(!view.replay&&root.BladefallPrecisionSurvey?.rbr.active()){
  view.mode='card';st.api.music(false);
  root.BladefallPrecisionView.persist();
  root.BladefallPrecisionSurvey.rbr.roomDone(ch,d,{showOverlay:st.api.showOverlay,hasNext:true,
   next:()=>{st.api.hideOverlay();view.mode='play';st.api.music(true);leaveRoom(view);},
   again:()=>{st.api.hideOverlay();view.mode='play';st.api.music(true);root.BladefallPrecisionView.retryRoom();},chapters:regionMenu});
  return true;
 }
 return leaveRoom(view);
};
function leaveRoom(view){
 const g=view.g,ch=chapterNow(view);
 const reg=regionOf(ch),first=firstIndex(view.chapter),d=g.room.def,p=g.p;
 const sideOut=!!d.side&&edgeOut(g,p,d.side);
 const dir=sideOut?d.side:(d.exit||'right');
 const go=(index,after)=>{
  const old=document.createElement('canvas');old.width=view.buf.width;old.height=view.buf.height;old.getContext('2d').drawImage(view.buf,0,0);
  root.BladefallPrecisionView.goRoom(index);
  if(after)after();
  st.trail=[];st.hearth=-1;st.slide={dir,t:0,n:26,old};
 };
 if(sideOut){
  const q=questById(d.sideQuest);if(!q||!q.rooms.length)return false;
  st.quest={id:q.id,from:g.roomIndex};
  go(first+ch.rooms.indexOf(q.rooms[0]));
  if(q.title)announce(`${q.title} · ${q.giver||''}`.replace(/ · $/,''),200);
  return true;
 }
 if(d.quest){
  const q=questById(d.quest),k=q.rooms.indexOf(d);
  if(k<q.rooms.length-1){go(first+ch.rooms.indexOf(q.rooms[k+1]));return true;}
  // The quest's last room: back to the room it left, at the quest's door.
  const from=st.quest?st.quest.from:first+ch.rooms.findIndex(r=>r.id===q.from);
  const took=q.rooms.some(r=>hasShardIn(g,r.id))||!q.rooms.some(r=>r.map.join('').includes('*'));
  go(from,()=>{const b=q.back;if(b){g.room.spawn={x:b.c*8,y:b.r*8+8-11};g.p.x=g.room.spawn.x;g.p.y=g.room.spawn.y;g.p.vx=g.p.vy=0;}});
  st.quest=null;
  if(took)grant(q);
  return true;
 }
 const k=g.roomIndex-first;
 if(k>=reg.mainCount-1){regionDone(view);return true;}
 go(g.roomIndex+1);return true;
};
function edgeOut(g,p,dir){const RW=g.room.w,RH=g.room.h;return dir==='right'?p.x>=RW-2:dir==='left'?p.x<=-p.w+2:dir==='up'?p.y<=-3:p.y>=RH-2;}
let slideCanvas=null;
PV.slideFrame=function(buf,W,Hh){
 if(!st)return BASE.slideFrame(buf,W,Hh);
 if(!st.slide)return null;
 const s=st.slide,k=H.ease(Math.min(1,s.t/s.n));
 slideCanvas=slideCanvas||document.createElement('canvas');slideCanvas.width=W;slideCanvas.height=Hh;
 const c=slideCanvas.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,W,Hh);
 const [dx,dy]={right:[-1,0],left:[1,0],up:[0,1],down:[0,-1]}[s.dir]||[-1,0];
 c.drawImage(s.old,Math.round(dx*k*W),Math.round(dy*k*Hh));
 c.drawImage(buf,Math.round(-dx*(1-k)*W),Math.round(-dy*(1-k)*Hh));
 return slideCanvas;
};

/* ---------------------------------------------------------------- the end of a region */
function regionDone(view){
 const ch=chapterNow(view),reg=regionOf(ch),api=st.api,s=view.chapterStats,secs=Math.round(s.frames/60);
 // Mara-style quests finish with the region if every bearing was taken.
 for(const q of reg.quests)if(q.bearings&&bearingsHeld(view.g,q).length===q.bearings.length)grant(q);
 root.BladefallPrecisionView.persist();   // the last room's pickups
 save.cleared[reg.n]=true;
 if(!save.best[reg.n]||s.deaths<save.best[reg.n].deaths)save.best[reg.n]={deaths:s.deaths,frames:s.frames};
 write();
 view.mode='card';view.replay=null;view.wipe=0;view.wipeTo=null;api.music(false);
 const rows=reg.quests.filter(q=>q.keepsake).map(q=>`<tr><td>${q.title}</td><td>${questDone(q)?`◆ ${q.keepsake.name} — ${q.keepsake.gives}`:'◇ not done (optional)'}</td></tr>`).join('');
 const next=RBR().MANIFEST.find(m=>m.n===reg.n+1),nextBuilt=next&&RBR().region(next.n);
 api.showOverlay(`<div class="pcCard"><h1>${reg.name}</h1><p class="pcSub">${reg.outro||''}</p>
 <table class="pcTable"><tr><td>Deaths</td><td>${s.deaths}</td></tr><tr><td>Time</td><td>${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}</td></tr>${rows}</table>
 ${nextBuilt?`<button class="pcBtn" id="rbrNext">On to ${next.name}</button>`:next?`<p class="pcSub">Next: ${next.name} — being built.</p>`:''}
 <button class="pcBtn ghost" id="rbrAgain">Play ${reg.name} again</button><button class="pcBtn ghost" id="rbrList" data-back>All regions</button></div>`);
 if(nextBuilt)document.getElementById('rbrNext').onclick=()=>startRegion(next.n);
 document.getElementById('rbrAgain').onclick=()=>startRegion(reg.n);
 document.getElementById('rbrList').onclick=regionMenu;
}
PV.chapterDone=function(ch,api){
 if(!st)return BASE.chapterDone(ch,api);
 if(!isRbr(R().chapters[ch]))return false;
 regionDone(st.view);return true;   // reached only if a region's rooms run out without PV.exit (a safety net)
};

/* ---------------------------------------------------------------- drawing: props, people, keepsakes */
function extraProp(b,k,x,y,t){
 const fy=y+8;
 if(k==='post'){b.fillStyle='#5a4a3a';b.fillRect(x+3,fy-18,2,18);b.fillRect(x,fy-18,8,2);
  if(questDone(questById('rowan'))){b.fillStyle='#c8a050';b.fillRect(x+1,fy-15,6,5);b.fillStyle='#8a6a30';b.fillRect(x+3,fy-10,2,1);}
  return true;}
 // 'kind@keepsakeId' is drawn instead of 'kind' once that keepsake is held: a quest's outcome you can see.
 const done=Object.keys(PROPS).find(n=>n.startsWith(k+'@')&&save.keepsakes[n.slice(k.length+1)]);
 const rects=PROPS[done||k];
 if(rects){for(const [dx,dy,w,h,col] of rects){b.fillStyle=col;b.fillRect(x+dx,fy+dy,w,h);}return true;}
 if(k==='bench'){b.fillStyle='#5a4632';b.fillRect(x,fy-4,12,2);b.fillRect(x+1,fy-2,1,2);b.fillRect(x+10,fy-2,1,2);return true;}
 return false;
}
PV.draw=function(b,g,view){
 if(!st)return BASE.draw(b,g,view);
 if(!isRbr(chapterNow(view)))return;
 const d=g.room.def,t=g.frame;
 // Props and people are authored in screen space, unlike mirrored physics bodies.
 b.save();if(g.flipped){b.translate(0,g.room.h);b.scale(1,-1);}
 for(const pr of d.decor||[])if(!extraProp(b,pr.k,pr.c*8,pr.r*8,t))H.prop(b,pr.k,pr.c*8,pr.r*8,t);
 (d.hearths||[]).forEach((h,i)=>{H.prop(b,'hearth',h.c*8,h.r*8,t);});
 // A sealed echo door: violet void across the side opening, until the keepsake is held.
 if(d.side&&g.sideSealed){const cols=g.room.cols,rows=g.room.rows,at=(c,r)=>(d.map[r]||'')[c]||'.';b.fillStyle='#1a0f2e';
  for(let i=0;i<(d.side==='left'||d.side==='right'?rows:cols);i++){const c=d.side==='right'?cols-1:d.side==='left'?0:i,r=d.side==='up'?0:d.side==='down'?rows-1:i;
   if(at(c,r)==='#')continue;b.fillRect(c*8,r*8,8,8);b.fillStyle=(t>>3)%2?'#7a4ad0':'#5a32a8';b.fillRect(c*8+((t+i)%8),r*8+3,1,2);b.fillStyle='#1a0f2e';}}
 // A bearing marker over each bearing's shard, drawn as Mara's survey stake with its letter.
 if(d.bearing)for(const e of g.ents)if(e.type==='shard'&&!e.gone){b.fillStyle='#e9c47a';b.fillRect(e.x+3,e.y-6,2,6);}
 for(const who of d.people||[]){
  const key=d.id+':'+who.who;
  if(st.gone.has(key))continue;
  let x=who.c*8+4,y=who.ceiling?who.r*8:who.r*8+8,face=g.p.x+4<x?-1:1;
  const w=st.walk[key];
  if(w){w.t++;x+=w.dx*w.t*1.3;y-=Math.abs(Math.sin(w.t/7))*3;face=w.dx;if(x<-10||x>g.room.w+10){st.gone.add(key);continue;}}
  if(who.follow){const tr=st.trail,lag=26,at=tr.length>lag?tr[tr.length-1-lag]:null;if(at){x=at.x+4-at.f*6;y=g.flipped?g.room.h-at.y:at.y+11;face=at.f;}}
  if(who.ceiling){b.save();b.translate(0,2*y);b.scale(1,-1);}
  if(!who.voiceUntilDone||questDone(questById(who.quest)))H.person(b,x,y,who.who,t,face);if(who.ceiling)b.restore();who._x=x;who._y=y;
 }
 b.restore();
};

/* ---------------------------------------------------------------- speech, the quest line, toasts */
const nameOf=w=>w==='sentinel'?'Sentinel':w[0].toUpperCase()+w.slice(1);
PV.hud=function(ctx,ox,oy,scale,g,view){
 if(!st)return BASE.hud(ctx,ox,oy,scale,g,view);
 if(!isRbr(chapterNow(view)))return;
 const d=g.room.def,cam=view.cam||{x:0,y:0},p=g.p,W0=view.buf?view.buf.width:320;
 const fs=Math.max(11,Math.round(scale*3.6),Math.round(10*(view.dpr||1)));ctx.font=`${fs}px ui-monospace,Menlo,monospace`;ctx.textBaseline='top';
 for(const who of d.people||[]){
  if(who._x===undefined)continue;
  const key=d.id+':'+who.who;if(st.gone.has(key))continue;
  const near=Math.abs(p.x+4-who._x)<44&&Math.abs((g.flipped?g.room.h-p.y:p.y+11)-who._y)<24;
  if(!near){
   // Someone who leaves (Mara running the road ahead) sets off once you have heard them and moved on.
   const leave=who.leave||(who.leaveDone&&questDone(questById(who.quest))?who.leaveDone:null);
   if(leave&&st.spoke.has(key)&&!st.walk[key])st.walk[key]={t:0,dx:leave==='left'?-1:1};
   continue;
  }
  const q=who.quest&&questById(who.quest);
  if(q&&!save.met[q.id]){save.met[q.id]=true;write();}
  // Mara at the Muster: the chart is handed over when every bearing is held.
  if(q&&who.chart&&q.bearings&&bearingsHeld(g,q).length===q.bearings.length)grant(q);
  const line=q&&questDone(q)&&who.lineDone?who.lineDone:who.line;
  st.spoke.add(key);
  bubble(ctx,ox,oy,scale,fs,cam,view,W0,who,q&&questDone(q)&&who.nameDone?who.nameDone:who.name||nameOf(who.who),line);
 }
 // The quest line under the deaths counter: Mara's chart once she has asked, a branch's errand while in it.
 const reg=regionOf(chapterNow(view));let y0=oy+Math.round(scale*3)+fs+8;
 for(const q of reg.quests){
  let txt=null;
  if(q.bearings&&(save.met[q.id]||bearingsHeld(g,q).length)){const held=bearingsHeld(g,q);txt=`${q.giver}: `+q.bearings.map(b=>(held.includes(b)?'◆':'◇')+' '+b).join('  ');}
  else if(st.quest&&st.quest.id===q.id)txt=`${q.title}${q.rooms.some(r=>hasShardIn(g,r.id))?' · ◆ got it':''}`;
  else if(questDone(q))continue;
  if(!txt)continue;
  const tw=ctx.measureText(txt).width+fs*1.2,x0=ox+W0*scale-8;
  ctx.fillStyle='rgba(14,16,24,.75)';ctx.fillRect(x0-tw,y0,tw,fs*1.6);ctx.fillStyle='#e9c47a';ctx.fillText(txt,x0-tw+fs*.6,y0+fs*.3);y0+=fs*1.9;
 }
 if(st.toast){const a=Math.min(1,st.toast.t/30,(st.toast.max-st.toast.t+1)/12);ctx.globalAlpha=a;const tw=ctx.measureText(st.toast.text).width+fs*1.4,x=ox+(W0*scale-tw)/2,y=oy+Math.round(scale*28);
  ctx.fillStyle='rgba(14,16,24,.85)';ctx.fillRect(x,y,tw,fs*1.7);ctx.fillStyle='#ffd98a';ctx.fillText(st.toast.text,x+fs*.7,y+fs*.35);ctx.globalAlpha=1;}
};
function bubble(ctx,ox,oy,scale,fs,cam,view,W0,who,name,text){
 const maxW=Math.min(view.canvas.width*.42,scale*150);
 const lines=H.wrap(ctx,text,maxW),lh=fs*1.25,w=Math.max(...lines.map(l=>ctx.measureText(l).width),ctx.measureText(name).width)+fs*1.4,h=lh*(lines.length+1)+fs*.8;
 let sx=ox+(who._x-cam.x)*scale-w/2,sy=who.ceiling?oy+(who._y-cam.y+18)*scale:oy+(who._y-cam.y-18)*scale-h;
 const rx0=Math.max(4,ox),rx1=Math.min(view.canvas.width-4,ox+W0*scale);
 sx=Math.max(rx0+4,Math.min(rx1-w-4,sx));sy=Math.max(oy+4,sy);
 ctx.fillStyle='rgba(14,16,24,.9)';ctx.fillRect(sx,sy,w,h);ctx.strokeStyle='#c9a86a';ctx.lineWidth=1;ctx.strokeRect(sx+.5,sy+.5,w-1,h-1);
 ctx.fillStyle='#c9a86a';ctx.fillText(name.toUpperCase(),sx+fs*.7,sy+fs*.4);
 ctx.fillStyle='#efe4cc';lines.forEach((l,i)=>ctx.fillText(l,sx+fs*.7,sy+fs*.4+lh*(i+1)));
}
PV.pocket=()=>st?null:BASE.pocket();
PV.helpers=H;
PV.rbr={state:()=>st,save:()=>save,startRegion:n=>startRegion(n),menu:()=>regionMenu()};
root.BladefallPitchView=PV;
})(typeof window!=='undefined'?window:globalThis);
