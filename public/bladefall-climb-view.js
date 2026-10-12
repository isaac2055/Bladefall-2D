/* The Climb view (7.265): plays the worlds in bladefall-climb-worlds.js as continuous places, after Merge Pitch B.

   - One camera over the whole world. The sections around the knight are drawn where they sit (their own rooms,
     at rest), so the road ahead and behind is always there and nothing cuts.
   - Seams: leaving a section by its exit carries the knight into the next with the speed he had (BladefallClimb.carry);
     the next section's opening (its seam) closes behind him once he reaches its fire, so the room then plays
     exactly as designed.
   - Fires: each section's spawn is a fire. Dying puts you back at the fire of the section you are in, and only
     that section resets.
   - Quests leave the road by a room's side exit, play their own short chain, and bring you back to the door.
     Keepsakes are saved with Room by Room's (bladefall.rbr.v1), so the Fractured echoes see them.
   It wraps BladefallPitchView: every hook answers only for Climb chapters (chapter.climb). */
(function(root){
'use strict';
const BASE=root.BladefallPitchView;if(!BASE)return;
const CL=()=>root.BladefallClimb;
const R=()=>root.BladefallPrecisionRooms;
const C=()=>root.BladefallPrecisionCore;
const V=()=>root.BladefallPrecisionView;
const H=BASE.helpers;
const TILE=8;
let SW=320,SH=184;
function viewport(view){SW=view?.viewportW||320;SH=view?.viewportH||184;}
const SAVE='bladefall.climb.v1',RBR_SAVE='bladefall.rbr.v1';
const load=k=>{try{return JSON.parse(localStorage.getItem(k))||{};}catch(e){return {};}};
const store=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}};
let save=Object.assign({cleared:{},best:{}},load(SAVE));
const keepsakes=()=>(load(RBR_SAVE).keepsakes)||{};
function grantKeepsake(id){const s=Object.assign({cleared:{},best:{},keepsakes:{},met:{}},load(RBR_SAVE));if(s.keepsakes[id])return false;s.keepsakes[id]=true;store(RBR_SAVE,s);return true;}

let st=null;   // {api, view, world, chapter, quest:{id,fromIdx}|null, cam:{x,y}|null, closed:Set, toast, slide, spoke:Set, gone:Set, walk:{}, trail:[], shown:{}}
const PV={};
const isClimb=ch=>!!(ch&&ch.climb);
const chapterNow=view=>R().chapters[view.chapter];
const firstIndex=c=>R().chapters.slice(0,c).reduce((n,x)=>n+x.rooms.length,0);

/* ---------------------------------------------------------------- palettes (tiles) */
const CPAL={
 woods:{sky0:'#0b1410',sky1:'#13211a',far:'#1b2e23',rock:'#34443a',rockD:'#202a24',edge:'#6c8a70',moss:'#7fa05d',accent:'#d8c27a'},
 causeway:{sky0:'#160f0e',sky1:'#241a1a',far:'#33231f',rock:'#4e3c34',rockD:'#30251f',edge:'#9a7a64',moss:'#6d6a45',accent:'#e8a86a'},
 updrafts:{sky0:'#17120c',sky1:'#2a2116',far:'#3a2d1e',rock:'#5a4630',rockD:'#3a2d1f',edge:'#b0905e',moss:'#7d7a46',accent:'#ffd28a'},
 marksman:{sky0:'#15110b',sky1:'#241c12',far:'#312718',rock:'#544430',rockD:'#352b1e',edge:'#a48a5e',moss:'#706a40',accent:'#f0c070'},
 keep:{sky0:'#110f1c',sky1:'#1c1830',far:'#2a2440',rock:'#4a4462',rockD:'#2d2a3e',edge:'#9a90bf',moss:'#6f7a5a',accent:'#e9c47a'},
};
function palFor(name){
 const w=st&&st.world;
 return CPAL[name]||(CL().worlds.find(region=>region.palettes?.[name])?.palettes[name])||(V().palettes&&V().palettes[name])||(H.PAL&&H.PAL[name])||V().palettes.footing;
}
PV.palette=ch=>{
 if(!st||!isClimb(ch))return BASE.palette(ch);
 const d=st.view.g&&st.view.g.room.def;return palFor(d&&d.palette||st.world.palette);
};

/* ---------------------------------------------------------------- where things are */
function defOf(id){return R().all.find(r=>r.id===id)||(st&&st.world&&CL().def(st.world,id))||null;}
function sectionOf(g){const pl=CL().place(st.world,g.room.id);return pl;}
/* (7.280) The Inversion's gravity prisms simulate a flipped room mirrored top to bottom (g.room is a mirrored copy,
   the knight's y mirrored). The Climb frames and draws the world upright, so whatever places the knight in the world
   reads his upright height, and a room is turned back upright (with him in it) before he leaves it. */
const uprightY=g=>g.flipped?g.room.h-g.p.y-g.p.h:g.p.y;
function uprightBeforeLeaving(g){if(g&&g.flipped&&root.BladefallPrecisionGravity)root.BladefallPrecisionGravity.mirror(g);}
function chainIndex(pl,roomId){return pl.chain.findIndex(s=>s.room===roomId);}
function roomIdx(roomId){const ch=R().chapters[st.chapter];return firstIndex(st.chapter)+ch.rooms.findIndex(r=>r.id===roomId);}
function bounds(chain){
 viewport(st.view);const current=st.view.g,place=sectionOf(current);
 if(current.room.def.atlasTransit)return {x0:place.x,y0:place.y,x1:place.x+current.room.w,y1:place.y+current.room.h};
 chain=CL().all(st.world).filter(s=>!defOf(s.room).atlasTransit);
 let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
 for(const s of chain){const d=defOf(s.room);const w=(d.cols||40)*TILE,h=(d.rows||23)*TILE;x0=Math.min(x0,s.x*TILE);y0=Math.min(y0,s.y*TILE);x1=Math.max(x1,s.x*TILE+w);y1=Math.max(y1,s.y*TILE+h);}
 return {x0,y0,x1,y1};
}

/* ---------------------------------------------------------------- start and the world list */
PV.start=function(q,api){
 if(q.get('pitch')!=='climb')return BASE.start(q,api);
 if(!q.has('legacygeography'))root.BladefallClimbGeographyBuild?.install();
 const view=api.view;viewport(view);
 for(const w of CL().worlds){Object.assign(H.FOLK,w.folk||{});}
 st={api,view,world:null,chapter:-1,quest:null,cam:null,closed:new Set(),toast:null,slide:null,spoke:new Set(),gone:new Set(),walk:{},trail:[],dispCache:new Map()};
 view.pitch=st;
 st.atlas=root.BladefallClimbAtlas.create(CL().worlds,load('bladefall.climb.atlas.v1'));
 for(let n=21;n<=40;n++)if(purpleHeld(n-20)&&worldBeaten(n-20))root.BladefallPlaytest?.unlock('survival',n);   // (7.316) leaderboards follow the same rule
 if(!load('bladefall.climb.atlas.v1').version){
  for(const w of CL().worlds)if(save.cleared[w.n]){st.atlas.state.visited[w.n]=true;for(const sec of w.sections)st.atlas.solve(sec.room);}
  store('bladefall.climb.atlas.v1',st.atlas.snapshot());
 }
 st.review=q.has('review');
 root.BladefallClimbSession?.init(st,q);
 const n=+(q.get('world')||q.get('region')||0);
 if(n&&startWorld(n,q.has('room')?+q.get('room'):null))return;
 worldMenu();
 if(q.has('resume'))document.getElementById('clContinue')?.click();
 if(q.has('coopmenu'))document.getElementById('coPanel')?.scrollIntoView({block:'center'});
};
function startWorld(n,room=null){
 const w=CL().world(n);if(!w||!w.chapter)return false;
 if(n>40&&!st.review&&!root.BladefallClimbFinale?.open()){announce('Complete all forty worlds first.',220);return false;}
 if(n>20&&n<=40&&!st.review&&!fracturedOpen(n)){announce(fracturedLockedWhy(n),240);return false;}
 const resumeProgress=room!=null;
 if(room==null)room=Math.max(0,w.chapter.rooms.findIndex(r=>r.id===w.atlasStart));
 const c=R().chapters.indexOf(w.chapter);if(c<0)return false;
 Object.assign(st,{resumeProgress,trialProgress:true,trialSolved:new Set(),walkTrial:false,riftCooldown:60,completionOffered:false,skips:3,dropHint:null,burst:null,sealedSaid:false,branchVia:null,returningCeiling:null,enteredAt:null,portCache:null,nearPort:null,lit:{},world:w,chapter:c,quest:null,cam:null,closed:new Set(),toast:null,slide:null,spoke:new Set(),gone:new Set(),walk:{},trail:[],dispCache:new Map(),frozen:new Map()});
 st.api.startChapter(c,room);
 root.BladefallClimbSession?.start();
 keepProgress(st.view.g);
 rememberLocation();
 announce(w.name,200);
 if(root.BladefallClimbCoop)try{root.BladefallClimbCoop.worldStarted(n);}catch(e){}
 return true;
}
function announce(text,t=150){st.toast={text,t,max:t};}
function rememberLocation(){
 const g=st.view.g;
 if(st.atlas&&g&&!st.view.replay&&!st.review){st.atlas.visit(st.world.n,g.room.id,st.branchVia,g.room.def.atlasTransit?(g.room.def.atlasTerrain?st.passageEntry||g.room.def.atlasSockets[0].edge:g.room.spawn.x>g.room.w/2?'right':'left'):null);store('bladefall.climb.atlas.v1',st.atlas.snapshot());store('bladefall.last-played.v1',{game:'survive',mode:root.BladefallClimbSession?.state().mode||'play'});}
}
function socketTarget(g,s){
 let world,room,edge,floor;
 if(s.kind==='room'){world=s.world?CL().world(s.world):st.world;room=s.to;edge=s.edge==='left'?'right':'left';floor=s.toFloor;}
 else if(s.kind==='passage'){world=CL().world(s.world);room=s.to;edge=s.edge==='left'?'right':'left';floor=defOf(room).atlasSockets.find(p=>p.edge===edge).floor;}
 else{world=CL().world(s.world);room=st.atlas.endpoint(s.link,s.world);const port=defOf(room).atlasSockets.find(p=>p.link===s.link);if(!port)return null;edge=port.edge;floor=port.floor;}
 const peer=defOf(room)?.atlasSockets?.find(p=>p.to===g.room.id);
 return {world,room,edge:peer?.edge||edge,floor:peer?.floor??floor,plane:peer?.plane};
}
function enterPassage(s){
 const view=st.view,g=view.g,target=socketTarget(g,s);if(!target)return false;
 if(target.world.n>20&&!st.review&&!fracturedOpen(target.world.n)){announce(fracturedLockedWhy(target.world.n),200);return false;}
 uprightBeforeLeaving(g);
 const old=sectionOf(g),oldX=g.p.x,oldY=g.p.y,snap=CL().snap(g),oldWidth=g.room.w,previous=st.world.n;
 const oldCam=st.cam?{...st.cam}:null;
 if(CL().geography){const frozen=freeze(g);if(frozen)st.frozen.set(g.room.id,frozen);}
 if(previous!==target.world.n){st.resumeProgress=true;st.trialSolved=new Set();st.lit={};st.completionOffered=false;st.walkTrial=true;}
 st.world=target.world;st.chapter=R().chapters.indexOf(target.world.chapter);view.chapter=st.chapter;
 C().enterRoom(g,roomIdx(target.room));keepProgress(g);
 const newX=target.edge==='left'?oldX-oldWidth:oldX+g.room.w,newY=oldY+(target.floor-s.floor)*8;
 syncWalkSeams(g);
 if(s.folded){
  const sourcePlane=s.plane??(s.edge==='left'?0:oldWidth),targetPlane=target.plane??(target.edge==='left'?0:g.room.w);
  const x=targetPlane+(snap.x+g.p.w/2-sourcePlane)-g.p.w/2,y=snap.y+(target.floor-s.floor)*8;
  CL().carry(C(),g,{...snap,x,y},{x:0,y:0},{x:0,y:0},true);
  const place=sectionOf(g);
  if(oldCam)st.cam={x:oldCam.x+place.x+g.p.x-old.x-oldX,y:oldCam.y+place.y+g.p.y-old.y-oldY};
 }else if(CL().geography)CL().carry(C(),g,snap,old,sectionOf(g),true);
 else CL().carry(C(),g,snap,{x:newX-oldX,y:newY-oldY},{x:0,y:0},true);
 const place=sectionOf(g),dx=g.p.x-oldX,dy=g.p.y-oldY;
 for(const list of [view.scarf,view.trail,view.parts,st.trail])for(const q of list||[]){q.x+=dx;q.y+=dy;}
 // Preserve screen position at the seam; subsequent camera ticks follow normally.
 if(oldCam&&!CL().geography)st.cam={x:oldCam.x+place.x-old.x+dx,y:oldCam.y+place.y-old.y+dy};
 st.enteredAt=g.frame;st.passageCool=0;st.nearPort=null;st.branchVia=null;st.quest=null;view.roomTimer=0;
 if(g.room.def.atlasTransit){const x=g.room.def.atlasTerrain?(target.plane??0)+(target.edge==='left'?32:-40):target.edge==='left'?32:g.room.w-40;g.room.spawn={x,y:g.room.def.atlasTerrain?target.floor*8-g.p.h:g.room.def.atlasTransit.floor[Math.floor(x/8)]*8-g.p.h};st.passageEntry=target.edge;}
 rememberLocation();V().persist?.();
 announce(g.room.def.atlasTransit?g.room.name:target.world.name,160);
 if(g.room.def.atlasTransit||g.room.def.atlasJunction)st.landmarkTitle={name:g.room.name,t:240};
 if(previous!==st.world.n)st.api.music(true);
 return true;
}
// The Chainwell's counterweight is a slow service lift, separate from the
// original fast zip blocks. Its movement uses the core's existing rider logic.
function updatePassageLift(g){
 const spec=g.room.def.atlasTransit?.lift;if(!spec||st.view.replay||g.p.state==='dead'||g.p.state==='respawn')return;
 let lift=g.ents.find(e=>e.type==='climb-lift');
 if(!lift){lift={type:'climb-lift',id:20000,dev:true,solid:true,presses:true,x:spec.x,y:spec.bottom,w:spec.w,h:5,remX:0,remY:0,state:'idle',timer:0};g.ents.push(lift);}
 if(spec.lockedByWinch&&!g.ents.some(e=>e.type==='stone'&&e.lit))return;
 if(lift.state==='idle'&&C().riderOf(g,lift)){lift.state='up';lift.timer=0;}
 else if(lift.state==='up'){
  const dy=Math.max(-1.25,spec.top-lift.y);C().moveSolid(g,lift,0,dy);
  if(lift.y<=spec.top){lift.state='wait';lift.timer=90;}
 }else if(lift.state==='wait'){if(--lift.timer<=0)lift.state='down';}
 else if(lift.state==='down'){
  const dy=Math.min(1.25,spec.bottom-lift.y);C().moveSolid(g,lift,0,dy);
  if(lift.y>=spec.bottom){lift.state='idle';lift.remY=0;}
 }
}
function portOpen(g,s){return !s.link||!!g.room.def.atlasTransit||!!st.atlas.state.open[s.link];}
function syncWalkSeams(g){
 g.walkSeams=(g.room.def.atlasSockets||[]).filter(s=>!s.preview&&portOpen(g,s));
}
function passageWalk(g){
 if(st.passageCool>0){st.passageCool--;return false;}
 if(st.view.replay||g.p.state==='dead'||g.p.state==='respawn')return false;
 const p=g.p,inp=st.view.lastInput||{};st.nearPort=null;
 for(const s of g.room.def.atlasSockets||[]){
  if(s.preview)continue;
  const plane=s.plane??(s.edge==='left'?0:g.room.w),near=Math.abs(p.x+p.w/2-plane)<28;
  if(!near||p.y+p.h>s.floor*8+2||p.y<s.floor*8-32)continue;
  const open=portOpen(g,s);st.nearPort={socket:s,open};
  const out=s.edge==='left'?p.x+p.w/2<=plane&&(inp.l||p.vx<0):p.x+p.w/2>=plane&&(inp.r||p.vx>0);
  if(out&&open)return enterPassage(s);
 }
 return false;
}
function visibleSockets(g){
 // Every entrance has a permanent piece of the landscape. Never choose a
 // destination using the knight's height: that turns other open roads into walls.
 const out=[];
 for(const edge of ['left','right']){
  const ports=(g.room.def.atlasSockets||[]).filter(s=>s.edge===edge).sort((a,b)=>a.floor-b.floor);
  ports.forEach((port,i)=>out.push({...port,
   viewTop:i?(ports[i-1].floor+port.floor)*4-16:-Infinity,
   viewBottom:i<ports.length-1?(port.floor+ports[i+1].floor)*4-16:Infinity}));
 }
 return out;
}
function neighbourScene(g,s){
 const target=socketTarget(g,s);if(!target)return null;
 const def=defOf(target.room),tw=(def.cols||40)*8,dx=s.edge==='left'?-tw:g.room.w,dy=(s.floor-target.floor)*8;
 const anchor=CL().place(target.world,target.room);
 const sections=def.atlasTransit?[anchor.sec]:CL().all(target.world).filter(sec=>!defOf(sec.room).atlasTransit);
 const rooms=sections.map(sec=>{const d=defOf(sec.room);return {room:sec.room,x:dx+sec.x*8-anchor.x,y:dy+sec.y*8-anchor.y,w:(d.cols||40)*8,h:(d.rows||23)*8};});
 return {target,def,dx,dy,rooms};
}
function drawPassageViews(b,g){
 const cam=st.view.cam;
 for(const s of visibleSockets(g)){
  const scene=neighbourScene(g,s);if(!scene)continue;
  const edge=s.edge==='left'?0:g.room.w;
  if(s.edge==='left'?edge<=cam.x:edge>=cam.x+SW)continue;
  b.save();b.beginPath();const top=Math.max(cam.y,s.viewTop),bottom=Math.min(cam.y+SH,s.viewBottom);if(bottom<=top){b.restore();continue;}
  b.rect(s.edge==='left'?cam.x:edge,top,s.edge==='left'?edge-cam.x:cam.x+SW-edge,bottom-top);b.clip();
  for(const r of scene.rooms){
   if(r.x>cam.x+SW||r.x+r.w<cam.x||r.y>cam.y+SH||r.y+r.h<cam.y)continue;
   const def=defOf(r.room),cached=st.frozen?.get(r.room)||displayGame(r.room,true),other={...cached,frame:g.frame};
   b.save();b.translate(r.x,r.y);V().drawOther(b,other,palFor(def.palette));root.BladefallClimbPassageArt?.details(b,other);drawFolk(b,other,def,false,scene.target.world);b.restore();
  }
  b.restore();
 }
}
function worldMenu(select=false){
 if(!st.review){atlasMap();return;}
 const api=st.api,view=st.view;view.mode='menu';api.music(false);
 const card=w=>{const done=save.cleared[w.n],best=save.best[w.n];
  return `<button class="pcChoice" data-world="${w.n}"><span class="pcNum">${w.n}</span><span class="pcName">${w.name}${done?' <em>✓</em>':''}</span>
  <span class="pcDesc">${w.sections.filter(s=>!CL().def(w,s.room).connector).length} sections, one climb · ${w.difficulty&&w.difficulty.min!=null&&isFinite(w.difficulty.min)?`difficulty ${w.difficulty.min}–${w.difficulty.max}`:'not yet rated'}${w.quests.filter(q=>q.sections.length||q.bearings).length?` · ${w.quests.filter(q=>q.sections.length||q.bearings).length} optional errand${w.quests.length>1?'s':''}`:''}</span>
  <span class="pcMeta">${(()=>{const hs=(w.secrets||[]),qs=w.quests.filter(q=>q.keepsake&&q.sections.length);const k=keepsakes();
   return `♥ ${hs.filter(x=>(save.secrets||{})[x.id]).length}/${hs.length} · ◆ ${qs.filter(q=>k[q.keepsake.id]).length}/${qs.length} · `;})()}${best?`best ${best.deaths} deaths · ${Math.floor(best.frames/3600)}:${String(Math.round(best.frames/60)%60).padStart(2,'0')}`:'not yet climbed'}${w.saved.length?` · ${w.saved.length} room${w.saved.length>1?'s':''} kept for later`:''}</span></button>`;};
 const saved=CL().worlds.flatMap(w=>w.saved.map(s=>`${s.name} (${w.name}, ${s.diff??'?'})`));
 api.showOverlay(`<div class="pcCard wide"><h1>Bladefall · Survive</h1>
 <p class="pcSub">Forty connected worlds: each room has its own fire and checkpoint. Worlds 1–20 form the base ascent; 21–40 are the harder Fractured ascent.</p>
 <div class="pcGrid">${CL().worlds.map(card).join('')}</div>
 ${root.BladefallClimbCoop?root.BladefallClimbCoop.menuHtml():''}
 ${saved.length?`<p class="pcSub">Kept for later: ${saved.join(' · ')}.</p>`:''}
 <div class="pcRow"><button class="pcBtn ghost" id="clMap">World map</button><a class="pcBtn ghost" href="index.html" data-back>Return to title menu</a></div></div>`);
 document.getElementById('clMap').onclick=atlasMap;
 document.querySelectorAll('[data-world]').forEach(b=>b.onclick=()=>startWorld(+b.dataset.world));
 if(root.BladefallClimbCoop)try{root.BladefallClimbCoop.bindMenu();}catch(e){}
}
// (7.314) the 100% view: every region visited and cleared, every road open, drawn over a copy (the save is untouched)
// (7.315) hearts found per world (the 100% view: all of them)
function heartCounts(all){const out={};for(const w of CL().worlds){if(w.n>40)continue;const hs=heartRoutes(w),pq=hs.find(br=>isPurple(w,br));
 out[w.n]={total:hs.length,got:all?hs.length:hs.filter(br=>heartTaken(w,br)).length,purple:pq?{got:all||heartTaken(w,pq),opens:w.n+20}:null};}return out;}
function completeAtlas(){
 const A=st.atlas,s=A.state,state={...s,visited:{},open:{},solved:{...s.solved}};
 for(let n=1;n<=40;n++)state.visited[n]=true;for(const l of A.links)state.open[l.id]=true;
 for(const w of CL().worlds)for(const sec of CL().all(w))state.solved[sec.room]=true;
 return {...A,state,complete:()=>true};
}
function atlasMap(){
 const view=st.view,active=!!view.g&&!!st.world,cp=st.atlas.state.checkpoint;
 view.paused=true;st.api.music(false);
 const point=n=>{const [x,y]=st.atlas.positions[n];return [160+x*92,35+(y-2.8)*70];};
 const visible=n=>!!st.atlas.state.visited[n];
 const paths=st.atlas.links.map(l=>{const [x,y]=point(l.a),[xx,yy]=point(l.b);return `<path d="M${x} ${y}L${xx} ${yy}" fill="none" stroke="${st.atlas.state.open[l.id]?'#cabd83':'#4d5366'}" stroke-width="2" ${st.atlas.state.open[l.id]?'':'stroke-dasharray="4 6"'}/>`;}).join('');
 const nodes=CL().worlds.filter(w=>st.atlas.positions[w.n]).map(w=>{const [x,y]=point(w.n),seen=visible(w.n);return `<g><circle cx="${x}" cy="${y}" r="${w.n===(st.world?.n||cp?.world)?11:7}" fill="${seen?'#d0bc80':'#353b4b'}"/><text x="${x}" y="${y+26}" text-anchor="middle" fill="#e8e2ce" font-size="9">${seen?w.n+' · '+w.name:'Unexplored'}</text></g>`;}).join('');
 const where=active?sectionOf(view.g):null,player=where?{x:where.x+view.g.p.x+4,y:where.y+view.g.p.y+5}:null;
 const physicalMap=CL().geography?root.BladefallClimbGeography.mapSvg(CL().geography,st.atlas.state.visited,st.world?.n||cp?.world,st.atlas.state.open,player):null;
 // (7.280) the schematic Emerald Ascent (bladefall-climb-map.js): one node per region, both emeralds, zoom and pan.
 // The room-by-room drawing above stays one toggle away.
 const schematic=!!root.BladefallClimbMap&&!st.roomLayout,tr=active?view.g.room.def.atlasTransit:null;
 let current=active?{world:st.world.n,room:view.g.room.id}:cp?{world:cp.world,room:cp.room}:null;
 if(tr){const g=view.g,s=g.room.def.atlasSockets||[],A=s.find(p=>p.world===tr.a),B=s.find(p=>p.world===tr.b),pa=A?.plane??(A?.edge==='left'?0:g.room.w),pb=B?.plane??(B?.edge==='left'?0:g.room.w);current={world:st.world.n,room:g.room.id,link:tr.link,t:Math.max(0,Math.min(1,(g.p.x+g.p.w/2-pa)/((pb-pa)||1)))};}
 const mapControls=physicalMap?`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin:10px 0">${CL().worlds.filter(w=>w.n<=40||root.BladefallClimbFinale?.open()).map(w=>`<button class="pcBtn ghost" style="padding:7px;font-size:11px" data-map-region="${w.n}">${w.n} · ${w.name}</button>`).join('')}</div><button class="pcBtn ghost" id="clMapAll">Whole map</button>`:'';
 st.api.showOverlay(`<div class="pcCard" style="max-width:900px"><h1>The Emerald Ascent</h1><p class="pcSub">${active?st.world.name:cp?'Continue from '+CL().world(cp.world).name:'Begin in the Outskirts. Open roads weave the climb together.'}</p>${schematic?'<div id="clEmerald"></div>':physicalMap||`<svg viewBox="0 0 320 405" style="width:100%;max-height:55vh" role="img" aria-label="Nine regions in the inner braided ascent. Solid roads are open; dotted roads are sealed.">${paths}${nodes}<text x="160" y="14" text-anchor="middle" fill="#929aaa" font-size="9">The upper crown · future journey</text></svg>`}${schematic?'':mapControls}<p class="pcSub">${schematic?'Select a region on the map to play it or inspect its roads.':physicalMap?'Gold dot: you · Solid roads: open · Dotted roads: sealed. Select a region to zoom.':'Solid: open roads · Dotted: sealed passages'}<br>Follow the short passages between regions.</p>${root.BladefallClimbMap&&CL().geography?`<button class="pcBtn ghost" id="clLayout">${schematic?'Show the room layout instead':'Show the Emerald Ascent map'}</button>`:''}<button class="pcBtn" id="clContinue" data-back data-focus-first>${active?'Return to the climb':cp?'Continue the journey':'Begin in the Outskirts'}</button><button class="pcBtn ghost" id="clScores">Leaderboards</button><button class="pcBtn ghost" id="clSettings">Settings</button>${root.BladefallClimbCoop?root.BladefallClimbCoop.menuHtml():''}<a class="pcBtn ghost" href="index.html">Return to title menu</a></div>`);
 if(schematic)root.BladefallClimbMap.mount(document.getElementById('clEmerald'),{hearts:heartCounts(!!root.BladefallClimbFinale?.unlockedAll?.()),atlas:root.BladefallClimbFinale?.unlockedAll?.()?completeAtlas():st.atlas,current,finale:root.BladefallClimbFinale?.mapState(),preview:root.BladefallClimbFinale?.preview(),brilliant:!!root.BladefallClimbFinale?.unlockedAll?.(),onStart:n=>startWorld(n),canStart:n=>n>40?!!root.BladefallClimbFinale?.canPlay(n):fracturedOpen(n),lockedWhy:n=>n>20&&n<=40?fracturedLockedWhy(n):''});
 {const t=document.getElementById('clLayout');if(t)t.onclick=()=>{st.roomLayout=!st.roomLayout;atlasMap();};}
 if(!schematic&&physicalMap){const svg=document.querySelector('svg[aria-label="Physical map of the Emerald Ascent"]'),full=svg.getAttribute('viewBox');document.getElementById('clMapAll').onclick=()=>svg.setAttribute('viewBox',full);document.querySelectorAll('[data-map-region]').forEach(button=>button.onclick=()=>{const r=CL().geography.regions.get(+button.dataset.mapRegion).bounds;svg.setAttribute('viewBox',[(r.x-65)*1.65,r.y-65,(r.w+130)*1.65,r.h+130].join(' '));});}
 document.getElementById('clScores').onclick=()=>root.BladefallPlaytest?.boards('survival');
 {const b=document.getElementById('clSettings');if(b)b.onclick=()=>V().options?.(()=>atlasMap(),{fromMenu:!active});}
 document.getElementById('clContinue').onclick=()=>{if(active){view.mode='play';view.paused=false;st.api.hideOverlay();st.api.music(true);}else if(cp){const w=CL().world(cp.world);startWorld(cp.world,w.chapter.rooms.findIndex(r=>r.id===cp.room));st.branchVia=cp.via;const g=view.g;if(g.room.def.atlasTransit&&cp.entry){const port=g.room.def.atlasSockets.find(p=>p.edge===cp.entry),x=g.room.def.atlasTerrain?port.plane+(cp.entry==='left'?32:-40):cp.entry==='left'?32:g.room.w-40,y=g.room.def.atlasTerrain?port.floor*8-11:g.room.def.atlasTransit.floor[Math.floor(x/8)]*8-11;st.passageEntry=cp.entry;g.room.spawn={x,y};g.p.x=x;g.p.y=y;for(const q of view.scarf||[]){q.x=x+4;q.y=y+3;}}rememberLocation();}else startWorld(1);};
 if(root.BladefallClimbCoop)root.BladefallClimbCoop.bindMenu();
}
PV.menu=function(){if(!st)return BASE.menu();worldMenu();return true;};

/* ---------------------------------------------------------------- the camera, over the whole chain */
PV.camera=function(g,view){
 if(!st||!isClimb(chapterNow(view)))return BASE.camera?BASE.camera(g,view):false;
 const pl=sectionOf(g);if(!pl)return false;
 if(CL().geography){
  viewport(st.view);const p=g.p,target=root.BladefallClimbGeography.cameraTarget(CL().geography,{x:pl.x+p.x+4,y:pl.y+uprightY(g)+5},SW,SH),tx=target.x,ty=target.y;
  if(!st.cam)st.cam={x:tx,y:ty};else{st.cam.x+=(tx-st.cam.x)*.16;st.cam.y+=(ty-st.cam.y)*.13;}
  view.cam.x=st.cam.x-pl.x;view.cam.y=st.cam.y-pl.y;view.camRoom=g.room.id;return true;
 }
 const b=bounds(pl.chain),p=g.p;
 for(const s of g.room.def.atlasSockets||[]){if(s.kind==='passage'&&!st.atlas.state.open[s.link])continue;
  if(s.edge==='left')b.x0=Math.min(b.x0,pl.x-SW/2);else b.x1=Math.max(b.x1,pl.x+g.room.w+SW/2);
  const target=socketTarget(g,s);if(target){const d=defOf(target.room),y=pl.y+(s.floor-target.floor)*8;b.y0=Math.min(b.y0,y);b.y1=Math.max(b.y1,y+(d.rows||23)*8);}
 }
 const tx=Math.max(b.x0,Math.min(b.x1-SW,pl.x+p.x+4-SW/2)),rawY=pl.y+uprightY(g)+5-SH*.55;
 const clamp01=n=>Math.max(0,Math.min(1,n));
 const seamWeight=Math.max(0,...(g.walkSeams||g.room.def.atlasSockets||[]).map(s=>{
  if(s.kind==='passage'&&!st.atlas.state.open[s.link])return 0;
  const distance=s.edge==='left'?p.x+p.w/2:g.room.w-p.x-p.w/2;
  return clamp01((SW/2-distance)/32)*clamp01((64-Math.abs(uprightY(g)+p.h-s.floor*8))/32);
 }));
 // A one-screen authored room must not pull the camera down to its floor as
 // soon as ownership changes. Ease its normal vertical clamp in after entry.
 const ty=Math.max(b.y0,Math.min(b.y1-SH,rawY))*(1-seamWeight)+rawY*seamWeight;
 // one camera for the whole world: it glides into a quest or a secret like anywhere else (no cut)
 if(!st.cam||Math.hypot(tx-st.cam.x,ty-st.cam.y)>420){st.cam={x:tx,y:ty};}   // a jump from the pause list cuts; walking never does
 else{st.cam.x+=(tx-st.cam.x)*.16;st.cam.y+=(ty-st.cam.y)*.13;}
 view.cam.x=st.cam.x-pl.x;view.cam.y=st.cam.y-pl.y;view.camRoom=g.room.id;
 return true;
};

/* ---------------------------------------------------------------- the sections around the knight */
function displayGame(roomId,open){
 const key=roomId+(open?'|open':'');let g2=st.dispCache.get(key);
 if(g2)return g2;
 const def=defOf(roomId);g2=C().createGame([def],{room:0});
 if(!open)closeSeam(g2,def);
 st.dispCache.set(key,g2);return g2;
}
const CLOSE_WHILE_PLAYED=new Set(['k6-stacks','s9-wheel']);
// (7.308.2) An imported room keeps its own drop-through rules, but the one-way ledge capping its entrance shaft belongs
// to the doorway: standing on it, Down + Jump drops you back out the way you came in. (Only ledges cut out of the wall:
// a retracting entry bridge is a walkway, and it stays a walkway.)
const DOOR_LEDGES=new WeakMap();
function onDoorwayLedge(g,d){const p=g.p,Core=C();if(!d.seam?.length||p.state!=='normal'||g.flipped)return false;
 const bottom=p.y+p.h;if(bottom%TILE)return false;
 // ledges cut from the wall (closed char rock), not an entry bridge
 let set=DOOR_LEDGES.get(d);if(!set)DOOR_LEDGES.set(d,set=new Set(d.seam.filter(([,,ch])=>ch==='#'||ch==='%').map(([c,r])=>c+','+r)));const r=bottom/TILE;let any=false;
 for(let c=Math.floor(p.x/TILE);c<=Math.floor((p.x+p.w-1)/TILE);c++)if(Core.tileAt(g,c,r)===Core.THRU){if(!set.has(c+','+r))return false;any=true;}
 return any;}
// Moving supports retain their authored origin even after cargo lowers them.
function fireSupport(g){const p=g.p,sp=g.room.spawn;return g.ents.find(e=>!e.gone&&(e.solid||e.type==='zip'||e.type==='slide'||e.type==='thru'||e.thru)&&Math.abs(e.oy-(sp.y+p.h))<=1&&sp.x<e.ox+e.w&&sp.x+p.w>e.ox);}

function openSeam(room,def){
 if(!def.seam)return;const cols=room.cols,opened=C().parseRoom(def);
 for(const [c,r] of def.seam){const i=r*cols+c;room.grid[i]=opened.grid[i];room.portalable[i]=opened.portalable[i];}
 room.rev=(room.rev||0)+1;
}
function closeSeam(g,def,requireClear=false){
 if(!def.seam||!def.seam.length)return false;
 const room=g.room,cols=room.cols,map=def.map.map(row=>row.split(''));
 for(const [c,r,ch] of def.seam)map[r][c]=ch;
 const closed=C().parseRoom({...def,map:map.map(row=>row.join(''))});
 // A nearby fire does not imply that the whole body has cleared the doorway.
 // Leave the visible approach open until restoring its solids or spikes is safe.
 if(requireClear){const p=g.p;if(def.seam.some(([c,r])=>closed.grid[r*cols+c]&&p.x<(c+1)*TILE&&p.x+p.w>c*TILE&&p.y<(r+1)*TILE&&p.y+p.h>r*TILE))return false;
  const opened=room.grid,restored=opened.slice();for(const [c,r]of def.seam)restored[r*cols+c]=closed.grid[r*cols+c];let supported=false;try{room.grid=restored;supported=C().onGroundCheck(g,p);}finally{room.grid=opened;}
  const support=fireSupport(g);if(!supported&&support&&p.x<support.x+support.w&&p.x+p.w>support.x&&support.y>=p.y+p.h&&support.y-(p.y+p.h)<=48)supported=true;
  if(!supported)return false;
 }
 for(const [c,r] of def.seam){const i=r*cols+c;room.grid[i]=closed.grid[i];room.portalable[i]=closed.portalable[i];}
 room.rev=(room.rev||0)+1;return true;
}
PV.drawWorld=function(b,g,view,pal){
 viewport(view);
 if(!st||!isClimb(chapterNow(view)))return BASE.drawWorld?BASE.drawWorld(b,g,view,pal):undefined;
 if(!g.flipped)return drawWorldUpright(b,g,view,pal);
 // (7.280) the view has turned the canvas over for a flipped room; the world around it is drawn the right way up
 b.save();b.translate(0,SH);b.scale(1,-1);try{return drawWorldUpright(b,g,view,pal);}finally{b.restore();}
};
function drawWorldUpright(b,g,view,pal){
 const pl=sectionOf(g);if(!pl)return;
 if(CL().geography)return drawConnectedGeography(b,g,view,pl);
 const cx=st.cam?st.cam.x:pl.x,cy=st.cam?st.cam.y:pl.y,all=CL().all(st.world);
 // Outside the sections is solid ground, so nothing looks like a way through that is not one.
 const neighbours=[];
 const rects=all.map(s=>{const d=defOf(s.room),sky=d.atlasJunction?SH*2:0;return {x:s.x*TILE-pl.x,y:s.y*TILE-pl.y-sky,w:(d.cols||40)*8,h:(d.rows||23)*8+sky};});
 for(const socket of visibleSockets(g)){const scene=neighbourScene(g,socket);if(!scene)continue;
  for(const r of scene.rooms){const left=socket.edge==='left'?r.x:Math.max(g.room.w,r.x),right=socket.edge==='left'?Math.min(0,r.x+r.w):r.x+r.w;if(right>left){const sky=defOf(r.room).atlasJunction?SH*2:0,top=Math.max(r.y-sky,socket.viewTop),bottom=Math.min(r.y+r.h,socket.viewBottom);if(bottom>top)rects.push({...r,x:left,y:top,w:right-left,h:bottom-top});}}
  neighbours.push({edge:socket.edge,top:socket.viewTop,bottom:socket.viewBottom,color:palFor(scene.def.palette).rockD});
 }
 // Fill the complement of the union, rather than an even/odd mask: overlapping
 // views at an atlas junction must never turn the neighbour into a solid panel.
 const vx=cx-pl.x-16,vy=cy-pl.y-16,vw=SW+32,vh=SH+32;
 const visible=rects.filter(r=>r.x<vx+vw&&r.x+r.w>vx&&r.y<vy+vh&&r.y+r.h>vy);
 const ys=[vy,vy+vh,...visible.flatMap(r=>[Math.max(vy,r.y),Math.min(vy+vh,r.y+r.h)])].sort((a,b)=>a-b);
 b.save();const ownRock=palFor(g.room.def.palette||st.world.palette).rockD;
 const fillGap=(x,y,w,h)=>{
  const cuts=[x,...[0,g.room.w].filter(v=>v>x&&v<x+w),x+w];
  for(let j=1;j<cuts.length;j++){const left=cuts[j-1],right=cuts[j],mid=(left+right)/2;
   b.fillStyle=(neighbours.find(r=>y+h/2>=r.top&&y+h/2<r.bottom&&(mid<0?r.edge==='left':mid>=g.room.w?r.edge==='right':false))?.color)||ownRock;b.fillRect(left,y,right-left,h);}
 };
 for(let i=1;i<ys.length;i++){const y=ys[i-1],h=ys[i]-y;if(h<=0)continue;let x=vx;
  const spans=visible.filter(r=>r.y<=y&&r.y+r.h>=y+h).map(r=>[Math.max(vx,r.x),Math.min(vx+vw,r.x+r.w)]).sort((a,b)=>a[0]-b[0]);
  for(const [left,right] of spans){if(left>x)fillGap(x,y,left-x,h);x=Math.max(x,right);}if(x<vx+vw)fillGap(x,y,vx+vw-x,h);
 }
 b.restore();
 // The connected room owns its whole viewport, including transparent air.
 // Suppress unrelated local sections behind it at a folded atlas junction.
 b.save();b.beginPath();b.rect(vx,vy,vw,vh);for(const edge of new Set(neighbours.map(r=>r.edge))){if(edge==='left'&&vx<0)b.rect(vx,vy,-vx,vh);if(edge==='right'&&vx+vw>g.room.w)b.rect(g.room.w,vy,vx+vw-g.room.w,vh);}b.clip('evenodd');
 // Pits: where a section's floor is open and nothing is below, the dark falls away instead of looking like ground.
 for(const s of all){const d=defOf(s.room),x=s.x*TILE,y=s.y*TILE,w=(d.cols||40)*TILE,h=(d.rows||23)*TILE;
  if(x>cx+SW+8||x+w<cx-8||y+h>cy+SH+40||y+h<cy-8||d.exit==='down')continue;
  const pits=pitCols(s.room);if(!pits.length)continue;
  const gr=b.createLinearGradient(0,y+h-pl.y,0,y+h-pl.y+28);gr.addColorStop(0,'rgba(0,0,0,.95)');gr.addColorStop(1,'rgba(0,0,0,0)');b.fillStyle=gr;
  for(const [c0,c1] of pits)b.fillRect(x+c0*TILE-pl.x,y+h-pl.y,(c1-c0+1)*TILE,28);}
 all.forEach((s,i)=>{
  if(s.room===g.room.id)return;const k=-1;
  const def=defOf(s.room),x=s.x*TILE,y=s.y*TILE,w=(def.cols||40)*TILE,h=(def.rows||23)*TILE;
  if(x>cx+SW+8||x+w<cx-8||y>cy+SH+8||y+h<cy-8)return;   // off camera
  // Behind: the section as you left it (gates open, the boss gone). Ahead: as it waits, the next one's way in open.
  const g2=(st.frozen&&st.frozen.get(s.room))||displayGame(s.room,true);
  b.save();b.translate(x-pl.x,y-pl.y);
  V().drawOther(b,g2,palFor(def.palette));root.BladefallClimbPassageArt?.details(b,g2);
  drawFolk(b,g2,def,false);drawReward(b,s.room,g.frame);
  b.restore();
 });
 b.restore();
 drawPassageViews(b,g);
};

// Clip to unoccupied space outside physical regional footprints. Overlapping
// rooms are unioned per row, so one room can never punch a hole in another.
function clipExterior(b,window,rooms){
 const {x,y,w,h}=window,right=x+w,bottom=y+h;
 const cuts=[y,bottom,...rooms.flatMap(r=>[Math.max(y,r.y),Math.min(bottom,r.y+r.h)])].filter(v=>v>=y&&v<=bottom).sort((a,z)=>a-z);
 b.beginPath();
 for(let i=1;i<cuts.length;i++){
  const top=cuts[i-1],end=cuts[i];if(end<=top)continue;let at=x;
  const spans=rooms.filter(r=>r.y<=top&&r.y+r.h>=end).map(r=>[Math.max(x,r.x),Math.min(right,r.x+r.w)]).filter(([a,z])=>z>a).sort((a,z)=>a[0]-z[0]);
  for(const [a,z] of spans){if(a>at)b.rect(at,top,a-at,end-top);at=Math.max(at,z);}if(at<right)b.rect(at,top,right-at,end-top);
 }
 b.clip();
}

// Render the actual far side of each fold in its mouth's local frame. Every
// socket gets a fixed aperture; the player's height never selects the scenery.
function drawFoldedViews(b,g,pl,visible,cam){
 const localCam={x:cam.x-pl.x,y:cam.y-pl.y};
 for(const r of visible){
  if(!r.def.atlasSockets?.some(s=>s.folded))continue;
  const source=r.id===st.view.g.room.id?st.view.g:st.frozen.get(r.id)||displayGame(r.id,true);
  // Lower mouths first: their upper lintels must not paint over a higher corridor's supporting floor.
  for(const s of visibleSockets(source).filter(s=>s.folded).sort((a,b)=>b.floor-a.floor)){
   const target=defOf(s.to),peer=target?.atlasSockets?.find(p=>p.to===r.id);if(!peer)continue;
   const sx=r.x*8-pl.x+(s.plane??(s.edge==='left'?0:r.w*8)),floor=(r.y+s.floor)*8-pl.y;
   const top=Math.max(floor-48,r.y*8-pl.y+s.viewTop),bottom=Math.min(floor+16,r.y*8-pl.y+s.viewBottom);
   const left=s.edge==='left'?localCam.x:Math.max(localCam.x,sx),right=s.edge==='left'?Math.min(sx,localCam.x+SW):localCam.x+SW;
   if(right<=left||top>localCam.y+SH||bottom<localCam.y)continue;
   const dx=sx-peer.plane,dy=floor-peer.floor*8,scene={...(st.frozen.get(target.id)||displayGame(target.id,true)),frame:st.view.g.frame,foldPreview:true},pal=palFor(target.palette);
   b.save();clipExterior(b,{x:left,y:top,w:right-left,h:bottom-top},visible.map(room=>({x:room.x*8-pl.x,y:room.y*8-pl.y,w:room.w*8,h:room.h*8})));
   // Background is rendered at the same local camera as the destination tiles.
   b.save();b.translate(localCam.x,localCam.y);
   const remoteCam={x:localCam.x-dx,y:localCam.y-dy};
   if(target.atlasTransit)root.BladefallClimbPassageArt.background(b,scene,remoteCam,SW,SH);
   else root.BladefallClimbArt.background(b,scene,remoteCam,SW,SH,pal);
   b.restore();b.translate(dx,dy);
   if(target.id===st.view.g.room.id)V().drawStatic(b,scene,pal,remoteCam);else V().drawOther(b,scene,pal,remoteCam);drawFolk(b,scene,target,target.id===st.view.g.room.id,CL().world(s.world));
   b.restore();
   b.save();clipExterior(b,{x:left,y:top-7,w:right-left,h:bottom-top+14},visible.map(room=>({x:room.x*8-pl.x,y:room.y*8-pl.y,w:room.w*8,h:room.h*8})));
   // A continuous lintel and foundation frame a traversable tunnel, rather
   // than a rectangular hole in empty space. The floor is the actual peer floor.
   b.fillStyle=pal.rockD;b.fillRect(left,top-7,right-left,7);b.fillRect(left,bottom,right-left,7);
   b.fillStyle=pal.rock;b.fillRect(left,top-2,right-left,2);
   const jamb=s.edge==='left'?sx-3:sx;
   b.fillStyle=pal.edge;b.fillRect(jamb,top-7,3,7);b.fillRect(jamb,floor,3,7);
   if(!portOpen(source,s)){b.fillStyle='#7b8783';for(let y=top+2;y<floor;y+=7){b.fillRect(sx-2,y,4,5);}b.fillRect(sx-7,top+9,14,2);}
   b.restore();
  }
 }
}

function drawGeography(b,g,view,pl,cam=st.cam||{x:pl.x,y:pl.y}){
 viewport(st.view);const geo=CL().geography,visible=geo.visible({x:cam.x-16,y:cam.y-16},SW+32,SH+32);
 const rects=[];
 for(const r of visible){
  if(r.def.atlasTerrain){for(let y=Math.max(0,Math.floor(cam.y/8-r.y)-2);y<Math.min(r.h,Math.ceil((cam.y+SH)/8-r.y)+2);y++)for(const [a,z] of r.def.atlasTerrain.spans[y])rects.push({x:(r.x+a)*8,y:(r.y+y)*8,w:(z-a)*8,h:8});}
  else rects.push({x:r.x*8,y:r.y*8,w:r.w*8,h:r.h*8});
 }
 const x0=cam.x-16,x1=cam.x+SW+16,y0=cam.y-16,y1=cam.y+SH+16,ys=[y0,y1,...rects.flatMap(r=>[Math.max(y0,r.y),Math.min(y1,r.y+r.h)])].filter(y=>y>=y0&&y<=y1).sort((a,b)=>a-b);
 const masonry=palFor(g.room.def.palette||st.world.palette);
 const rock=(x,y,w,h)=>{b.fillStyle=masonry.rockD;b.fillRect(x-pl.x,y-pl.y,w,h);b.save();b.beginPath();b.rect(x-pl.x,y-pl.y,w,h);b.clip();b.fillStyle=masonry.rock;for(let yy=Math.floor(y/8)*8;yy<y+h;yy+=8)for(let xx=Math.floor(x/16)*16;xx<x+w;xx+=16)b.fillRect(xx-pl.x+2+(Math.floor(yy/8)%2)*4,yy-pl.y+5,7,1);b.restore();};
 for(let i=1;i<ys.length;i++){
  const y=ys[i-1],h=ys[i]-y;if(h<=0)continue;let x=x0;
  const spans=rects.filter(r=>r.y<=y&&r.y+r.h>=y+h).map(r=>[Math.max(x0,r.x),Math.min(x1,r.x+r.w)]).filter(([a,z])=>z>a).sort((a,b)=>a[0]-b[0]);
  for(const [a,z] of spans){if(a>x)rock(x,y,a-x,h);x=Math.max(x,z);}if(x<x1)rock(x,y,x1-x,h);
 }
 for(const r of visible){
  const cached=r.id===st.view.g.room.id?st.view.g:st.frozen.get(r.id)||displayGame(r.id,true),scene={...cached,frame:st.view.g.frame};
  if(cached.flipped){scene.room=cached.room.upright||cached.room;scene.flipped=false;}   // a flipped room's tiles, the right way up (7.280)
  b.save();b.translate(r.x*8-pl.x,r.y*8-pl.y);
  const local={x:cam.x-r.x*8,y:cam.y-r.y*8};
  if(r.id===st.view.g.room.id)V().drawStatic(b,scene,palFor(r.def.palette),local);else{V().drawOther(b,scene,palFor(r.def.palette),local);drawReward(b,r.id,g.frame);drawDoorBeams(b,r.def,scene.room,g.frame,CL().world(r.world));}
  drawFolk(b,scene,r.def,r.id===st.view.g.room.id,CL().world(r.world));
  b.restore();
 }
 // A mouth can be offscreen while its corridor is still in view. Keep these
 // scene donors alive for a full viewport beyond the junction bounds.
 drawFoldedViews(b,g,pl,geo.visible({x:cam.x-SW,y:cam.y-SH},SW*3,SH*3),cam);
 return true;
}

// A fold changes simulation coordinates, not the landscape. Render both sides
// in the junction's coordinate frame near each mouth. Deeper in the corridor,
// a spatial mask carries its own scene in; the mask never depends on ownership.
const sceneLayers=new Map();
function sceneLayer(key){
 let layer=sceneLayers.get(key);
 if(!layer){layer=document.createElement('canvas');sceneLayers.set(key,layer);}if(layer.width!==SW||layer.height!==SH){layer.width=SW;layer.height=SH;}
 const brush=layer.getContext('2d');brush.setTransform(1,0,0,1,0,0);brush.clearRect(0,0,SW,SH);return {layer,brush};
}
function paintRegion(key,game,place,cam){
 const {layer,brush}=sceneLayer(key);
 geographyBackground(brush,{...st.view,g:game},SW,SH,cam);
 brush.save();brush.translate(place.x-cam.x,place.y-cam.y);
 drawGeography(brush,game,st.view,place,cam);brush.restore();return layer;
}
function paintCorridor(key,game,local){
 const {layer,brush}=sceneLayer(key),pal=root.BladefallClimbPassageArt.terrainPalette(game.room.def,palFor(game.room.def.palette));
 root.BladefallClimbPassageArt.background(brush,game,local,SW,SH);
 // The room's surrounding stone belongs to this corridor, never the active world.
 brush.save();brush.translate(-local.x,-local.y);brush.fillStyle=pal.rockD;
 brush.fillRect(local.x,local.y,SW,Math.max(0,-local.y));
 brush.fillRect(local.x,game.room.h,SW,Math.max(0,local.y+SH-game.room.h));
 const scene={...game,foldPreview:true,frame:st.view.g.frame};
 if(game.room.id===st.view.g.room.id)V().drawStatic(brush,scene,pal,local);else V().drawOther(brush,scene,pal,local);
 drawFolk(brush,scene,game.room.def,game.room.id===st.view.g.room.id,CL().world(game.room.def.atlasTransit.a));
 brush.restore();return layer;
}
function maskEndpoint(brush,plane,edge,inverse=false,occupied=[]){
 // The first 80 pixels retain the same complete junction scene. The next
 // 64 blend into the corridor. Opposite-end masks never overlap.
 const sign=edge==='left'?1:-1,a=plane+sign*80,z=plane+sign*144;
 const {layer,brush:mask}=sceneLayer('mask');
 const gradient=mask.createLinearGradient(a,0,z,0);
 gradient.addColorStop(0,inverse?'transparent':'#000');gradient.addColorStop(1,inverse?'#000':'transparent');
 mask.fillStyle=gradient;mask.fillRect(0,0,SW,SH);
 if(!inverse){mask.fillStyle='#000';for(const r of occupied)mask.fillRect(r.x,r.y,r.w,r.h);}
 brush.save();brush.globalCompositeOperation='destination-in';brush.drawImage(layer,0,0);brush.restore();
}
function drawConnectedGeography(b,g,view,pl){
 // Integer camera coordinates must be identical for preview and live rendering.
 const local={x:Math.round(view.cam.x),y:Math.round(view.cam.y)},cam={x:pl.x+local.x,y:pl.y+local.y};
 const {layer:result,brush:out}=sceneLayer('result');
 if(g.room.def.atlasFold){
  out.drawImage(paintCorridor('corridor',g,local),0,0);
  for(const port of g.room.def.atlasSockets){
   const screenPlane=port.plane-local.x;
   if(port.edge==='left'?screenPlane+144<=0:screenPlane-144>=SW)continue;
   const hub=defOf(port.to),peer=hub.atlasSockets.find(p=>p.to===g.room.id),where=CL().place(CL().world(port.world),hub.id);
   const dx=where.x+peer.plane-port.plane,dy=where.y+(peer.floor-port.floor)*8;
   const remote={x:local.x+dx,y:local.y+dy},game={...(st.frozen.get(hub.id)||displayGame(hub.id,true)),frame:g.frame};
   const patch=paintRegion('endpoint',game,where,remote),q=patch.getContext('2d');
   const occupied=CL().geography.visible(remote,SW,SH).filter(r=>!r.def.atlasTerrain).map(r=>({x:r.x*8-remote.x,y:r.y*8-remote.y,w:r.w*8,h:r.h*8}));
   maskEndpoint(q,screenPlane,port.edge,false,occupied);out.drawImage(patch,0,0);
  }
 }else{
  out.drawImage(paintRegion('region',g,pl,cam),0,0);
  // Match the same corridor composition seen from within it. Every mouth still
  // has its fixed opening; only distant scenery blends beyond the stone throat.
  const candidates=[];
  for(const room of CL().geography.visible({x:cam.x-SW,y:cam.y-SH},SW*3,SH*3))for(const port of room.def.atlasSockets||[]){
   if(!port.folded)continue;
   const x=room.x*8+port.plane-cam.x,y=(room.y+port.floor)*8-cam.y;
   if(port.edge==='left'?x<=80:x>=SW-80)continue;
   candidates.push({room,port,x,y,d:Math.abs(y-SH*.55)});
  }
  // One camera can look along one distant corridor at a time. Mouths and nearby
  // tiers remain fully rendered; this affects only scenery 80+ pixels beyond them.
  candidates.sort((a,z)=>a.d-z.d);
  const chosen=candidates[0];
  if(chosen){
   const {room,port,x}=chosen,target=defOf(port.to),peer=target.atlasSockets.find(p=>p.to===room.id);
   const dx=room.x*8+port.plane-peer.plane,dy=(room.y+port.floor-peer.floor)*8;
   const remote={x:cam.x-dx,y:cam.y-dy},game={...(st.frozen.get(target.id)||displayGame(target.id,true)),frame:g.frame};
   const patch=paintCorridor('continuation',game,remote);
   maskEndpoint(patch.getContext('2d'),x,peer.edge,true);
   // Looking between stacked roads must not abruptly swap distant scenery.
   const next=candidates[1],weight=next?Math.min(1,Math.max(0,(next.d-chosen.d)/32)):1;
   out.save();clipExterior(out,{x:0,y:0,w:SW,h:SH},CL().geography.visible(cam,SW,SH).filter(r=>!r.def.atlasTerrain).map(r=>({x:r.x*8-cam.x,y:r.y*8-cam.y,w:r.w*8,h:r.h*8})));out.globalAlpha=weight;out.drawImage(patch,0,0);out.restore();
  }
 }
 b.drawImage(result,local.x,local.y);return true;
}

/* ---------------------------------------------------------------- per tick: seams, fires, the trail */
PV.holding=function(){
 if(!st)return BASE.holding();
 const view=st.view,g=view.g;if(!g||!isClimb(chapterNow(view)))return false;
 root.BladefallClimbSession?.tick();
 if(st.slide){st.slide.t++;if(st.slide.t>=st.slide.n)st.slide=null;return true;}
 const d=g.room.def,p=g.p;
 if(st.returningCeiling===d.id&&p.y>=0){g.exited=false;st.returningCeiling=null;}
 if(d.atlasTransit&&view.replay&&view.replay.i>=view.replay.frames.length){view.replay=null;V().retryRoom();announce('Your turn',150);return true;}
 if(st.landmarkTitle&&--st.landmarkTitle.t<=0)st.landmarkTitle=null;
 if(st.lastRecordedRoom!==d.id&&!view.replay){rememberLocation();st.lastRecordedRoom=d.id;}
 if(st.riftCooldown>0)st.riftCooldown--;const portal=riftPortal();if(portal&&portal.room===g.room.id&&!st.riftCooldown&&st.view.lastInput?.u&&Math.abs(g.p.x-portal.x)<18&&Math.abs(g.p.y-portal.y)<25){useRiftPortal();return true;}
 updatePassageLift(g);
 syncWalkSeams(g);
 if(passageWalk(g))return false;
 g.dropThru=d.campaignImport?!!d.dropThru||onDoorwayLedge(g,d):true;   // Imported puzzles retain their reviewed drop-through rules; their doorway ledge does not.
 g.springUp=!d.campaignImport;   // Native road springs stay upright; bank springs retain authored momentum.
 if(p.dropT>0&&!save.dropUsed){save.dropUsed=true;store(SAVE,save);}
 teachDrop(g,p);
 updateProof(g);
 touchReward(g,p);
 if(d.side){const q=questFrom(d.id);g.sideSealed=sealedQuest(q);if(g.sideSealed&&(d.side==='left'?p.x<=2:d.side==='right'?p.x>=g.room.w-p.w-2:false))sayEchoSealed(q);}
 if(root.BladefallClimbCoop)try{if(root.BladefallClimbCoop.tick(g))return true;}catch(e){}
 // The seam closes once the knight stands at the fire (or is well clear of it).
 if(d.seam&&d.seam.length&&!st.closed.has(g.room.id)){
  const sp=g.room.spawn,support=fireSupport(g),near=Math.abs(p.x-sp.x)<=12&&(Math.abs(p.y-sp.y)<=12||support&&C().standingOn(g,p,support))&&p.onGround;
  const clear=!d.seam.some(([c,r])=>Math.abs(c*TILE+4-(p.x+4))<20&&Math.abs(r*TILE+4-(p.y+5))<24);
  // Isaac (7.265.2): seams stay open so you can walk back, except where the room's own route needs that wall:
  // those close at the fire while you play the section and reopen once you have cleared it.
  if((d.closeWhilePlayed||CLOSE_WHILE_PLAYED.has(d.origin))&&p.state==='normal'&&p.onGround&&(d.closeWhilePlayed?near:near||clear&&(p.x-sp.x)**2+(p.y-sp.y)**2<48*48)&&closeSeam(g,d,true))st.closed.add(g.room.id);
 }
 // Walking back: pressing out through the edge you came in by carries you into the previous section.
 {const pl=sectionOf(g),k=pl?chainIndex(pl,g.room.id):-1;
  const hostId=pl&&pl.branch?(st.world.sections.map(s=>defOf(s.room)).find(r=>(r.doors||[]).some(dr=>dr.to===pl.branch.obj.id))||{id:pl.branch.host}).id:null;
  const prev=k>0?pl.chain[k-1]:(hostId?st.world.sections.find(s=>s.room===hostId):null);
  const py=uprightY(g),pvy=g.flipped?-p.vy:p.vy;   // (7.280) where he is the right way up (a flipped room is mirrored)
  // (7.280) Hold Up under a ceiling door and you are lifted up through it (Isaac: entering secrets was finicky).
  liftThroughDoor(g,pl);
  // A secret's opening: climb up into it and you are in the secret.
  // A door cut in a ceiling corner (a secret, or a quest whose own door is blocked by the road): climb up into it.
  for(const dr of d.doors||[]){if(py>1||pvy>0||p.state==='dead')break;const cs=dr.cols;   // going up into it (dropping back out of it is not)
   if(p.x+p.w>cs[0]*TILE&&p.x<(cs[cs.length-1]+1)*TILE){const br=(st.world.secrets||[]).find(x=>x.id===dr.to)||st.world.quests.find(q=>q.id===dr.to);
    if(br&&sealedQuest(br)){sayEchoSealed(br);continue;}
    if(br&&br.sections.length){if(br.title)announce(`${br.title}${br.giver?' · '+br.giver:''}`,200);st.branchVia='door';p.vy=Math.min(p.vy,-150);carryInto(pl,br.sections[0]);
     // (7.280) a branch with no shaft over its door (it starts on a cart: worlds 15 and 35) set him into rock, where he
     // fell out of the room and died: he starts at its fire instead
     {const q=g.p;if(C().solidAt(g,q.x,q.y,q.w,q.h)){q.x=g.room.spawn.x;q.y=g.room.spawn.y;q.vx=q.vy=0;st.lift=null;for(const k of st.view.scarf||[]){k.x=q.x+4;k.y=q.y+3;}}}
     return false;}}}   // he goes up through it, still rising
  // The opening where a branch's way back comes out: go in and you walk that passage the other way.
  if((st.enteredAt==null||g.frame-st.enteredAt>30)&&p.state!=='dead'&&p.state!=='respawn')for(const ret of d.returns||[]){   // not the moment he comes out of it
   const br=branchById(ret.from);if(!br||sealedQuest(br))continue;const cs=ret.cols,e=ret.edge||'up',lastPass=br.sections.filter(s=>s.passage).at(-1);if(!lastPass)continue;
   const inUp=e==='up'&&py<=1&&pvy<=0&&p.x+p.w>cs[0]*TILE&&p.x<(cs[cs.length-1]+1)*TILE;
   const inSide=(e==='left'&&p.x<=0||e==='right'&&p.x>=g.room.w-p.w)&&py+p.h>cs[0]*TILE&&py<(cs[cs.length-1]+1)*TILE&&st.view.lastInput&&st.view.lastInput[e==='left'?'l':'r'];
   if(inUp||inSide){if(inUp)p.vy=Math.min(p.vy,-150);st.branchVia='back';if(branchKind(br)==='quest')st.quest={id:br.id};carryInto(pl,lastPass);settleInside(g);return false;}}
  if(prev&&!root.BladefallClimbBankPassages?.checkpointLink(st.world,prev.room,g.room.id)&&!(d.atlasSockets||[]).some(s=>!s.preview&&s.edge===d.entry)&&!st.closed.has(g.room.id)&&g.frame-(st.enteredAt||0)>8&&p.state!=='dead'&&p.state!=='respawn'){const dx=prev.x*TILE-pl.x,dy=prev.y*TILE-pl.y,LI=st.view.lastInput||{};
   // (7.277) falling back down the way you came up goes home at once: the 45-frame grace (against bouncing back
   // out of a side the moment you arrive) let a knight who missed a door's shaft fall out of the floor and die
   const late=d.passage||g.frame-(st.enteredAt||0)>45;
   // a passage piece knows the edge it is entered by; a road section is told by where the previous one sits
   const proved=(st.world.continuousSeams||[]).some(s=>s.from===prev.room&&s.to===g.room.id);
   const entry=proved?({left:'right',right:'left',up:'down',down:'up'}[defOf(prev.room)?.exit||'right']):d.entry;
   const L=entry?entry==='left':dx<0,Rt=entry?entry==='right':dx>0,Dn=entry?entry==='down':dy>0,Up=entry?entry==='up':dy<0;
   // Isaac (7.270): back through the way in however you move into it (walking, jumping, dashing), as long as his
   // whole body is in the opening (so a climb on the wall beside it is not a way back). A room whose entrance was
   // already open (no tunnel cut, so no seam) counts its open edge as the way in.
   const rm=g.flipped&&g.room.upright||g.room,solidT=(c,r)=>c>=0&&r>=0&&c<rm.cols&&r<rm.rows&&rm.grid[r*rm.cols+c]===1;   // (7.280) the upright tiles, with his upright height
   const r0=Math.floor(py/TILE),r1=Math.floor((py+p.h-1)/TILE),c0=Math.floor(p.x/TILE),c1=Math.floor((p.x+p.w-1)/TILE);
   const sideOK=col=>{for(let r=Math.max(0,r0);r<=Math.min(rm.rows-1,r1);r++)if(solidT(col,r))return false;return true;};
   const vertOK=row=>{for(let c=Math.max(0,c0);c<=Math.min(rm.cols-1,c1);c++)if(solidT(c,row))return false;return true;};
   const atSeam=(d.seam||[]).some(([c,r])=>c*TILE<p.x+p.w+8&&c*TILE+8>p.x-8&&r*TILE<py+p.h+8&&r*TILE+8>py-8),noSeam=!(d.seam&&d.seam.length);
   const dd=p.state==='dash'&&p.dashDir?p.dashDir.x:0,inWay=atSeam||noSeam,pushL=LI.l||p.vx<-20||dd<0,pushR=LI.r||p.vx>20||dd>0;
   // (7.280) a branch's pieces hand a slow knight (climbing, or at the top of a rise) back down only once most of him is
   // below the seam: the way up hands him on as his head crosses, so a pause on the wall there is not a way back. A fall
   // (faster than a climb) still goes home at once, well before the floor could kill him.
   const piece=!!(d.passage||d.connector||pl.branch||defOf(prev.room)?.campaignWalk),dnAt=piece?py>=rm.h-2||py>=rm.h-p.h-1&&pvy>45&&p.state!=='climb':py>=rm.h-p.h-1;
   const out=late&&(L&&p.x<=0&&pushL&&p.state!=='climb'&&sideOK(0)&&inWay)||late&&(Rt&&p.x>=rm.w-p.w&&pushR&&p.state!=='climb'&&sideOK(rm.cols-1)&&inWay)
    ||(Dn&&dnAt&&pvy>=0&&(atSeam||noSeam&&vertOK(rm.rows-1)))||late&&(Up&&py<=0&&pvy<0&&(atSeam||noSeam&&vertOK(0)));
   // (7.276) dropped home out of a short shaft (a gate's), his feet are on the room below's top edge: set him just
   // inside it, or its closed top holds him standing above its ceiling (and its door takes him back up)
   // and inside the columns of the door he came up through (the shaft above can sit a column off it)
   if(out){const down=Dn&&py>=rm.h-p.h-1,br=pl.branch&&pl.branch.obj;carryInto(pl,prev);settleInside(g);
    if(down){const q=g.p,dr=br&&(g.room.def.doors||[]).find(x=>x.to===br.id);if(q.y<0&&g.room.exit!=='up')q.y=0;
     if(dr&&q.y<=8)q.x=Math.max(dr.cols[0]*TILE,Math.min((dr.cols[dr.cols.length-1]+1)*TILE-q.w,q.x));}
    return false;}}}
 keepProgress(g);
 if(p.state==='normal'||p.state==='climb'){st.trail.push({x:p.x,y:uprightY(g),f:p.facing});if(st.trail.length>90)st.trail.shift();}
 if(d.bearing&&hasShardIn(g,d.id)&&!st.spoke.has('bearing:'+d.bearing)){st.spoke.add('bearing:'+d.bearing);announce(`Bearing taken · ${d.bearing}`);}
 if(st.toast&&--st.toast.t<=0)st.toast=null;
 return false;
};

/* Progress stays: a stake you lit stays lit (through deaths, and when you leave and come back), so its gate stays open. */
/* (7.316) Which stakes do not stay lit through a death (or a walk out and back). A room imported from the Room Bank
   was designed to reset whole, so none of its stakes stay. In a native room a stake stays lit unless the fire is
   clearly nearer the way out than the stake is (8+ tiles of open ground): there, light it, die, and the respawn
   would carry you most of the way home. Measured once per room by a flood of the open tiles from its way out. */
function freshStakes(g){
 const d=g.room.def,key='fresh:'+d.id;if(st.dispCache.has(key))return st.dispCache.get(key);
 const stones=g.ents.filter(e=>e.type==='stone'),out=new Set();
 if(stones.length&&!d.atlasTransit?.winch){
  if(d.campaignImport||/^cl\d+-bank-/.test(d.id))for(const e of stones)out.add(e.id);
  else{const rm=g.room,Cc=rm.cols,Rr=rm.rows,ex=rm.exit,bad=v=>v===1||v>=3&&v<=6;
   if(ex&&ex!=='none'){const dist=new Int32Array(Cc*Rr).fill(-1),q=[];const src=(c,r)=>{const i=r*Cc+c;if(!bad(rm.grid[i])&&dist[i]<0){dist[i]=0;q.push(i);}};
    for(let i=0;i<(ex==='up'||ex==='down'?Cc:Rr);i++){if(ex==='up')src(i,0);else if(ex==='down')src(i,Rr-1);else if(ex==='left')src(0,i);else src(Cc-1,i);}
    for(let h=0;h<q.length;h++){const k=q[h],c=k%Cc,r=(k-c)/Cc;for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){const nc=c+dc,nr=r+dr;if(nc<0||nr<0||nc>=Cc||nr>=Rr)continue;const j=nr*Cc+nc;if(dist[j]<0&&!bad(rm.grid[j])){dist[j]=dist[k]+1;q.push(j);}}}
    const at=(x,y)=>dist[Math.floor(y/TILE)*Cc+Math.floor(x/TILE)],S=at(rm.spawn.x+4,rm.spawn.y+6);
    for(const e of stones){const K=at(e.x+4,e.y+4);if(S>=0&&K>=0&&K-S>=8)out.add(e.id);}}}
 }
 st.dispCache.set(key,out);return out;
}
function keepProgress(g){
 if(!st.lit)st.lit={};const set=st.lit[g.room.id]||(st.lit[g.room.id]=new Set(st.trialProgress?[]:save.stakes?.[g.room.id]||[]));
 const before=set.size;
 if(g.room.def.atlasTransit?.winch&&(save.stakes?.[g.room.id]||[]).length)for(const e of g.ents)if(e.type==='stone')set.add(e.id);
 let relit=false;
 const fresh=freshStakes(g);   // (7.316) stakes that reset on death: lighting one then dying would skip the room
 for(const id of fresh)set.delete(id);
 for(const e of g.ents)if(e.type==='stone'){if(fresh.has(e.id))continue;if(e.lit)set.add(e.id);else if(set.has(e.id)){e.lit=true;relit=true;}}
 if(relit||set.size){const stones=g.ents.filter(e=>e.type==='stone');if(stones.length&&stones.every(e=>e.lit))for(const e of g.ents)if(e.type==='gate'&&!e.open){e.open=true;e.t=99;}}
 g.solvedBefore=!!(st.trialProgress?st.trialSolved?.has(g.room.id):st.atlas?.state.solved[g.room.id]);
 if(g.solvedBefore)for(const e of g.ents){
  if(e.type==='gate'){e.open=true;e.t=99;}
  if(e.type==='held'){e.latchedOpen=true;e.solid=false;e.gone=true;}
 }
 if(set.size!==before&&!st.view.replay){save.stakes=save.stakes||{};save.stakes[g.room.id]=[...set];store(SAVE,save);}
}

/* ---------------------------------------------------------------- leaving a section */
function hasShardIn(g,roomId){for(const s of g.shards)if(s.startsWith(roomId+':'))return true;return false;}
function questOf(id){return st.world.quests.find(q=>q.id===id);}
function questFrom(roomId){return st.world.quests.find(q=>q.from===roomId&&q.sections.length);}
function bearingsHeld(g,q){return (q.bearings||[]).filter(b=>{const s=st.world.sections.find(s=>{const d=defOf(s.room);return d.bearing===b;});return s&&hasShardIn(g,s.room);});}
const questDone=q=>!!(q&&q.keepsake&&keepsakes()[q.keepsake.id]);
/* (7.316) Hearts. Every optional route (a quest or a secret, the rooms you are lifted into) holds one heart. In a base
   world the secret's heart (the route the white light lifts you into) is purple: holding it, with that world beaten,
   opens the matching Fractured world (the two can happen at separate times). A heart is earned only by finishing every room of its route properly: each room left
   by its own way out, having passed through the middle of its intended route (its waypoints). Rooms proven once stay
   proven (save.proper). A quest's heart is its keepsake of 7.270; a secret's is save.secrets, as before. */
const heartRoutes=w=>[...w.quests.filter(q=>q.sections.length&&!/^socket/.test(q.id)),...(w.secrets||[])];
const isPurple=(w,br)=>!!(w&&w.n<=20&&(w.secrets||[]).includes(br));
const heartTaken=(w,br)=>w.quests.includes(br)?questDone(br):!!(save.secrets||{})[br.id];
const PURPLE='#b77cff';
function worldBeaten(n){return !!(save.cleared[n]||st?.atlas?.complete?.(n));}
function purpleRoute(n){const w=CL().world(n);return w?(w.secrets||[]).find(x=>x.sections.length)||null:null;}
function purpleHeld(n){const x=purpleRoute(n);return !!(x&&(save.secrets||{})[x.id]);}
function fracturedOpen(n){
 if(n<=20)return true;if(n>40)return !!root.BladefallClimbFinale?.open();
 return !!root.BladefallClimbFinale?.unlockedAll?.()||purpleHeld(n-20)&&worldBeaten(n-20);
}
function fracturedLockedWhy(n){const b=CL().world(n-20)?.name||'its base world';
 return purpleHeld(n-20)?`Finish ${b} to open its Fractured world.`:`Find the purple heart in ${b} (an optional route), and finish ${b}, to open this world.`;}
// the middle of a room's intended route: two points it passes, at about a third and two thirds of the way
function waypoints(def){
 const key='way:'+def.id;if(st.dispCache.has(key))return st.dispCache.get(key);
 const path=def.passage||def.connector?null:routePath(def),out=path&&path.length>=30?[.35,.65].map(f=>path[Math.floor(path.length*f)]):[];
 st.dispCache.set(key,out);return out;
}
function updateProof(g){
 const pl=sectionOf(g);if(!pl||!pl.branch)return;const id=g.room.id;
 if(!st.way||st.way.room!==id||st.way.deaths!==g.deaths)st.way={room:id,deaths:g.deaths,hit:new Set()};
 const p=g.p;if(p.state==='dead'||st.view.replay)return;const x=p.x+4,y=uprightY(g)+11;
 waypoints(g.room.def).forEach((q,i)=>{if(Math.abs(q.x-x)<=28&&Math.abs(q.y-y)<=28)st.way.hit.add(i);});
}
const roomProper=g=>!!(st.way&&st.way.room===g.room.id&&st.way.deaths===g.deaths&&st.way.hit.size>=waypoints(g.room.def).length);
const routeRooms=br=>br.sections.filter(s=>!s.passage&&!defOf(s.room)?.connector&&!defOf(s.room)?.passage).map(s=>s.room);
function routeProven(g,br){return routeRooms(br).every(r=>(save.proper||{})[r]||r===g.room.id&&roomProper(g));}
function markProper(g){if(!roomProper(g))return;save.proper=save.proper||{};if(!save.proper[g.room.id]){save.proper[g.room.id]=1;store(SAVE,save);}}
/* (7.277) A Fractured world's errand is an echo: only someone holding the base quest's keepsake can enter it (Room by
   Room's rule, q.needs). Its door, its side way and its way back's opening stay sealed until then. */
const sealedQuest=q=>!!(q&&q.needs&&!keepsakes()[q.needs]);
function neededName(q){for(const w of CL().worlds||[])for(const b of w.quests||[])if(b.keepsake&&b.keepsake.id===q.needs)return b.keepsake.name;return 'a keepsake';}
function sayEchoSealed(q){if(st.echoSaid===q.id)return;st.echoSaid=q.id;announce(`Sealed · this echo needs ${neededName(q)}`,200);}
function drawEchoSeals(b,g,t){
 const d=g.room.def,rm=g.flipped&&g.room.upright||g.room,mark=(c,r,i)=>{b.fillStyle='#1a0f2e';b.fillRect(c*TILE,r*TILE,TILE,TILE);b.fillStyle=(t>>3)%2?'#7a4ad0':'#5a32a8';b.fillRect(c*TILE+((t+i)%8),r*TILE+3,1,2);};
 const solid=(c,r)=>rm.grid[r*rm.cols+c]===1;
 if(d.side&&g.sideSealed)for(let i=0;i<(d.side==='left'||d.side==='right'?rm.rows:rm.cols);i++){const c=d.side==='right'?rm.cols-1:d.side==='left'?0:i,r=d.side==='up'?0:d.side==='down'?rm.rows-1:i;if(!solid(c,r))mark(c,r,i);}
 for(const dr of d.doors||[]){const q=st.world.quests.find(x=>x.id===dr.to);if(sealedQuest(q))dr.cols.forEach((c,i)=>mark(c,0,i));}
 for(const ret of d.returns||[]){const q=st.world.quests.find(x=>x.id===ret.from);if(!sealedQuest(q))continue;const e=ret.edge||'up';
  ret.cols.forEach((v,i)=>e==='up'?mark(v,0,i):mark(e==='left'?0:rm.cols-1,v,i));}
}
function grant(q){if(!q||!q.keepsake||!grantKeepsake(q.keepsake.id))return;root.BladefallPlaytest?.collectHeart(q.id);announce(`♥ Heart · ${q.title||'an errand'}`,240);}
function openFracturedPortal(){
 if(!st||st.world.n>20)return;const g=st.view.g,to=st.world.n+20;
 if(fracturedOpen(to))root.BladefallPlaytest?.unlock('survival',to);save.riftPortals=save.riftPortals||{};
 save.riftPortals[st.world.n]={world:st.world.n,room:g.room.id,x:g.p.x,y:g.p.y,to};store(SAVE,save);st.riftCooldown=45;
}
function riftPortal(){
 if(st.world.n>40)return null;   // (7.309) the finale's worlds have no base twin
 if(st.world.n<=20)return fracturedOpen(st.world.n+20)?save.riftPortals?.[st.world.n]||null:null;   // (7.316) the portal opens once the world is beaten too
 const w=st.world,g=st.view.g;if(g.room.id!==w.atlasStart)return null;
 return {world:w.n,room:g.room.id,x:g.room.spawn.x+20,y:g.room.spawn.y,to:w.n-20,returning:true};
}
function useRiftPortal(){
 const portal=riftPortal();if(!portal)return false;
 root.BladefallClimbSession?.invalidate('Fractured detour');
 if(!portal.returning){save.riftReturn={...portal};store(SAVE,save);startWorld(portal.to);}
 else {const back=save.riftReturn?.to===st.world.n?save.riftReturn:null,w=CL().world(portal.to);startWorld(portal.to,back?w.chapter.rooms.findIndex(d=>d.id===back.room):null);if(back){const p=st.view.g.p;p.x=back.x;p.y=back.y;root.BladefallClimbSession?.invalidate('returned mid-world');}}
 st.riftCooldown=60;return true;
}


PV.exit=function(view,nextRoom){
 if(!st)return BASE.exit(view,nextRoom);
 const g=view.g;if(!isClimb(chapterNow(view)))return false;
 // Isaac (7.270): watching the intended route shows you the way, then the room is yours to try (not a skip)
 if(view.replay){view.replay=null;V().retryRoom();announce('Your turn',150);return true;}
 const pl=sectionOf(g),k=chainIndex(pl,g.room.id),d=g.room.def,p=g.p;
 const sideOut=!!d.side&&edgeOut(g,p,d.side)&&!edgeOut(g,p,d.exit||'right');
 if(sideOut){
  const q=questFrom(g.room.id);if(!q)return false;
  st.quest={id:q.id,fromIdx:g.roomIndex};st.branchVia='door';
  carryInto(pl,q.sections[0]);
  if(q.title)announce(`${q.title}${q.giver?' · '+q.giver:''}`,200);
  return true;
 }
 if(root.BladefallClimbSession?.complete(d,()=>PV.exit(view,nextRoom)))return true;
 if(pl.branch){
  if(!d.passage&&!d.connector)markProper(g);
  const cur=pl.chain[k],next=pl.chain[k+1];
  // stepping from the branch's last room into its way back: the reward is yours
  if(!cur.passage&&(!next||next.passage)&&st.branchVia!=='back')claimBranch(g,pl.branch);
  if(next){carryInto(pl,next);return true;}
  const home=CL().all(st.world).find(s=>s.room===pl.branch.obj.returnTo);
  if(home){carryInto(pl,home);if(st.world.sections.includes(home)){st.quest=null;st.branchVia=null;}return true;}
  endOfBranch(g);return true;
 }
 if(!st.review){
  st.trialSolved?.add(g.room.id);
  const opened=st.atlas.solve(g.room.id);
  store('bladefall.climb.atlas.v1',st.atlas.snapshot());
  if(opened.length)announce('Road opened · '+st.atlas.routes(st.world.n).filter(l=>opened.includes(l.id)).map(l=>CL().world(l.to).name).join(' / '),240);
  if(g.room.id===st.world.atlasEnd&&worldClearReady()){const was=!!save.cleared[st.world.n];save.cleared[st.world.n]=true;store(SAVE,save);
   if(!was&&st.world.n<=20&&purpleHeld(st.world.n)){root.BladefallPlaytest?.unlock('survival',st.world.n+20);announce(`${CL().world(st.world.n+20)?.name||'Its Fractured world'} is open · play it from the map`,300);}if(st.world.n===9)announce('The inner ascent is open · the upper crown lies ahead',360);}
 }
 if(g.room.id===st.world.atlasEnd&&!worldClearReady()){root.BladefallClimbSession?.invalidate('unfinished rooms');announce('Finish your remaining rooms to complete this world. Your partner’s progress stays separate.',240);}
 if(g.room.id===st.world.atlasEnd&&worldClearReady()&&!st.completionOffered&&root.BladefallPlaytest){
  st.completionOffered=true;
  const w=st.world,next=CL().world(w.n+1),canNext=next&&(next.n<=20||root.BladefallPlaytest.unlocked('survival',next.n));
  const walk=()=>{view.mode='play';view.paused=false;st.api.hideOverlay();if(k<pl.chain.length-1)carryInto(pl,pl.chain[k+1]);else{g.exited=false;g.p.x=Math.min(g.room.w-g.p.w-2,Math.max(2,g.p.x));}};
  void root.BladefallPlaytest.complete({next:canNext?()=>startWorld(next.n):null,walk,menu:()=>atlasMap()});return true;
 }
 if(k<pl.chain.length-1){carryInto(pl,pl.chain[k+1]);return true;}
 worldDone(view);return true;
};
/* ---------------------------------------------------------------- pits */
function pitCols(roomId){
 const key='pits:'+roomId;if(st.dispCache.has(key))return st.dispCache.get(key);
 const d=defOf(roomId),g2=displayGame(roomId,true),rm=g2.room,out=[];let run=null;
 const seam=new Set((d.seam||[]).map(([c,r])=>c+','+r));
 for(let c=0;c<rm.cols;c++){const t=rm.grid[(rm.rows-1)*rm.cols+c],open=t!==1&&t!==2&&!seam.has(c+','+(rm.rows-1));
  if(open){if(run)run[1]=c;else{run=[c,c];out.push(run);}}else run=null;}
 st.dispCache.set(key,out);return out;
}

/* ---------------------------------------------------------------- rewards you pick up (Isaac, 7.270) */
/* A secret's far end holds that world's heart; a quest's, its keepsake. Touch it to take it. Taken, it stays as a
   faint outline (like Celeste's). Coming in the back way, it is there but sealed: it is earned from the door. */
const HEARTS={1:['Lantern Heart','#ffcf7a'],2:['Moss Heart','#9fdc7a'],3:['Cog Heart','#e8a86a'],4:['Wind Heart','#9fe0ff'],5:['Ash Heart','#e6d6a8'],
 6:['Bell Heart','#c9a6ff'],7:['Iron Heart','#c4ccd6'],8:['Frost Heart','#bfe8ff'],9:['Glass Heart','#ffffff'],
 10:['Cinder Heart','#ff9a4a'],11:['Anvil Heart','#ffc070'],12:['Prism Heart','#c4b4ff'],13:['Ledger Heart','#a77be0'],14:['Tide Heart','#7fa6c8']};
function heartOf(w){const h=HEARTS[w.n]||['Heart','#ffd28a'];return {name:h[0],col:h[1]};}
function rewardSpots(){
 const key='rewards';if(st.dispCache.has(key))return st.dispCache.get(key);
 const out=[];
 for(const br of [...st.world.quests.filter(q=>q.sections.length&&q.keepsake),...(st.world.secrets||[])]){
  const last=br.sections.filter(s=>!s.passage&&!defOf(s.room).connector).at(-1);if(!last)continue;
  const d=defOf(last.room),rm=displayGame(last.room,true).room,ex=d.exit||'right',C0=rm.cols,R0=rm.rows;
  const solid=(c,r)=>c<0||r<0||c>=C0||r>=R0||rm.grid[r*C0+c]===1;
  const edge=[];for(let i=0;i<(ex==='up'||ex==='down'?C0:R0);i++){const [c,r]=ex==='up'?[i,0]:ex==='down'?[i,R0-1]:ex==='left'?[0,i]:[C0-1,i];if(!solid(c,r))edge.push(i);}
  if(!edge.length)continue;const mid=edge[Math.floor(edge.length/2)];
  // on the room's own route, a moment before its way out (where anyone who finishes it passes)
  const path=routePath(d);
  if(path&&path.length>8){const q=path[Math.max(0,path.length-22)];out.push({br,kind:st.world.quests.includes(br)?'quest':'secret',room:last.room,x:q.x,y:q.y-6});continue;}
  // no route: two tiles in from the way out
  let [c,r]=ex==='up'?[mid,2]:ex==='down'?[mid,R0-3]:ex==='left'?[2,mid]:[C0-3,mid];
  for(let k=0;k<6&&solid(c,r);k++){if(ex==='up')r++;else if(ex==='down')r--;else if(ex==='left')c++;else c--;}
  out.push({br,kind:st.world.quests.includes(br)?'quest':'secret',room:last.room,x:c*TILE+4,y:r*TILE+4});
 }
 st.dispCache.set(key,out);return out;
}
const rewardTaken=sp=>sp.kind==='quest'?questDone(sp.br):!!(save.secrets||{})[sp.br.id];
const heartCol=(w,br)=>isPurple(w,br)?PURPLE:w.quests.includes(br)?'#ff9fc8':heartOf(w).col;
function touchReward(g,p){
 for(const sp of rewardSpots()){
  if(sp.room!==g.room.id||(rewardTaken(sp)&&(sp.kind!=='secret'||root.BladefallPlaytest?.hasHeart(sp.br.id))))continue;
  if(Math.abs(p.x+p.w/2-sp.x)>9||Math.abs(uprightY(g)+p.h/2-sp.y)>11)continue;   // (rewards sit the right way up, 7.280)
  if(st.branchVia==='back'){if(!st.sealedSaid){st.sealedSaid=true;announce('Sealed · it is earned from the door',160);}continue;}
  claimBranch(g,{kind:sp.kind,obj:sp.br});
  if(rewardTaken(sp))st.burst={x:sp.x,y:sp.y,t:30,col:heartCol(st.world,sp.br),room:g.room.id};
 }
}
function drawReward(b,roomId,t){
 for(const sp of rewardSpots()){
  if(sp.room!==roomId)continue;const taken=rewardTaken(sp),bob=Math.round(Math.sin(t/14)*1.5),x=sp.x,y=sp.y+bob;
  b.save();b.globalAlpha=taken?.25:1;
  if(!taken){const gl=b.createRadialGradient(x,y,1,x,y,12);gl.addColorStop(0,'rgba(255,240,200,.45)');gl.addColorStop(1,'rgba(255,240,200,0)');b.fillStyle=gl;b.fillRect(x-12,y-12,24,24);}
  {b.fillStyle=heartCol(st.world,sp.br);   // (7.316) every route's reward is a heart; the base quest's is purple
   for(const [dx,dy,w] of [[-4,-3,3],[1,-3,3],[-5,-2,10],[-5,-1,10],[-4,0,8],[-3,1,6],[-2,2,4],[-1,3,2]])b.fillRect(x+dx,y+dy,w,1);   // a pixel heart
   b.fillStyle='#ffffff';b.fillRect(x-3,y-2,1,1);}
  if(st.branchVia==='back'&&!taken&&st.view.g.room.id===roomId){b.strokeStyle='rgba(200,220,255,.7)';b.beginPath();b.arc(x,y,8,0,6.283);b.stroke();}
  b.restore();
 }
 if(st.burst&&st.burst.room===roomId&&st.burst.t>0){const q=st.burst;q.t--;b.save();b.globalAlpha=q.t/30;b.strokeStyle=q.col;b.lineWidth=1;b.beginPath();b.arc(q.x,q.y,(30-q.t)*.8+4,0,6.283);b.stroke();b.restore();}
}

/* ---------------------------------------------------------------- the drop-through lesson */
/* Until you have used it once: standing on a one-way ledge with room below it shows "down + jump". The first ledge
   over a drop comes on the road (the Lookout, world 1), before any secret needs it. */
function teachDrop(g,p){
 st.dropHint=null;if(save.dropUsed||!p.onGround||g.flipped)return;   // (a flipped room's ledges are mirrored: no hint there)
 const rm=g.room,c=Math.floor((p.x+p.w/2)/TILE),r=Math.floor((p.y+p.h)/TILE);
 if(r<0||r>=rm.rows-1||c<0||c>=rm.cols||rm.grid[r*rm.cols+c]!==2)return;if(rm.grid[(r+1)*rm.cols+c]===1)return;
 st.dropHint={x:p.x+p.w/2,y:p.y-6};
}
function drawDropHint(b){
 const h=st.dropHint;if(!h)return;b.save();b.font='6px ui-monospace,Menlo,monospace';const txt='↓ + jump: drop through',w=b.measureText(txt).width+6;
 b.fillStyle='rgba(14,16,24,.8)';b.fillRect(Math.round(h.x-w/2),Math.round(h.y-9),w,9);b.fillStyle='#ffd98a';b.fillText(txt,Math.round(h.x-w/2+3),Math.round(h.y-2));b.restore();
}

/* ---------------------------------------------------------------- ceiling doors: a beam and a lift (7.280) */
/* Isaac: entering secrets was finicky. A secret, an errand cut in a ceiling and a gate room are all entered by a
   two-tile hole in a road room's ceiling corner. Now a soft beam of light falls from every such door, standing under
   it shows "hold ↑", and holding Up there carries the knight up: a gentle lift, centred on the shaft, through the
   seam (the usual handoff, so he arrives moving) and up the branch's shaft onto its ledge. Nothing happens unless Up
   is held under a door (for a moment, so a quick up-dash or an up-aim is never taken for it). Letting go drops him
   home as before; a sealed echo's door neither lifts nor shines. */
const LIFT_TOP=150,LIFT_ARM=5;   // px/s at full lift; frames Up is held before it lifts
function doorBranch(dr){const br=branchById(dr.to);return br&&br.sections.length?br:null;}
function doorSpan(dr){return [dr.cols[0]*TILE,(dr.cols[dr.cols.length-1]+1)*TILE];}
/* Under the door's columns, with open air up to it (one-way ledges are risen through). */
function underDoor(g,dr,slack=2){
 const p=g.p,rm=g.room,[x0,x1]=doorSpan(dr),cx=p.x+p.w/2;if(cx<x0-slack||cx>x1+slack)return false;
 const head=Math.min(rm.rows-1,Math.floor(p.y/TILE));
 for(let r=0;r<=head;r++)for(const c of dr.cols)if(rm.grid[r*rm.cols+c]===C().SOLID)return false;
 return true;
}
/* A branch room's way in from below: the shaft cut up through its floor (its seam), and the shaft's top (its ledge). */
function shaftOf(def){
 const seam=def&&def.seam||[],rows=def&&(def.rows||def.map.length);if(!seam.length||!seam.some(([c,r])=>r===rows-1))return null;
 const cols=seam.map(c=>c[0]);return {c0:Math.min(...cols),c1:Math.max(...cols),top:Math.min(...seam.map(c=>c[1]))};
}
/* Where in a branch room's shaft to hold him: nearest its middle where he can stand on its ledge (a shaft can open
   onto its ledge on one side only). */
function shaftLiftX(g2,sh,w,h){
 const a=sh.c0*TILE,z=(sh.c1+1)*TILE,mid=(a+z)/2-w/2,top=sh.top*TILE;let best=null;
 for(let x=a;x<=z-w;x++)if(!C().solidAt(g2,x,top-h-2,w,h+2)&&(best==null||Math.abs(x-mid)<Math.abs(best-mid)))best=x;
 return best??Math.round(mid);
}
/* Where to hold him in the host: under the door, and in line with the shaft above it too (it can sit a column off). */
function hostLiftX(g,pl,dr,br){
 const [x0,x1]=doorSpan(dr),f=br.sections[0],sh=shaftOf(defOf(f.room)),w=g.p.w;
 if(sh){const fx=f.x*TILE-pl.x,sa=Math.max(x0,fx+sh.c0*TILE),sz=Math.min(x1,fx+(sh.c1+1)*TILE);
  if(sz-sa>=w)return Math.max(sa,Math.min(sz-w,fx+shaftLiftX(displayGame(f.room,true),sh,w,g.p.h)));}
 return Math.round((x0+x1)/2-w/2);
}
/* The shaft he is rising through in a branch room: where to hold him, and the height his feet clear it at (or null). */
function liftShaft(g,pl){
 const p=g.p,rm=g.room,sh=shaftOf(rm.def);
 if(sh){const a=sh.c0*TILE,z=(sh.c1+1)*TILE;return p.x+p.w>a&&p.x<z&&p.y+p.h>sh.top*TILE?{x:shaftLiftX(g,sh,p.w,p.h),top:sh.top*TILE}:null;}   // out on its ledge: done
 // no shaft recorded (a connector piece): a corridor no wider than four tiles around him, all the way up it
 const r=Math.max(0,Math.min(rm.rows-1,Math.floor((p.y+p.h-1)/TILE))),c=Math.floor((p.x+p.w/2)/TILE);
 const open=k=>k>=0&&k<rm.cols&&rm.grid[r*rm.cols+k]!==C().SOLID;if(!open(c))return null;
 let a=c,z=c;while(open(a-1)&&c-a<5)a--;while(open(z+1)&&z-c<5)z++;if(z-a+1>4)return null;
 const x0=a*TILE,x1=(z+1)*TILE,k=pl?chainIndex(pl,g.room.id):-1,nx=k>=0?pl.chain[k+1]:null,sh2=nx&&rm.exit==='up'?shaftOf(defOf(nx.room)):null;
 // held in line with the shaft of the piece above, so he goes on up it without a nudge
 if(sh2){const fx=nx.x*TILE-pl.x,sa=Math.max(x0,fx+sh2.c0*TILE),sz=Math.min(x1,fx+(sh2.c1+1)*TILE);
  if(sz-sa>=p.w)return {x:Math.max(sa,Math.min(sz-p.w,fx+shaftLiftX(displayGame(nx.room,true),sh2,p.w,p.h))),top:null};}
 return {x:Math.round((x0+x1)/2-p.w/2),top:null};
}
function liftThroughDoor(g,pl){
 const p=g.p,inp=st.view.lastInput||{},L0=st.lift;st.lift=null;
 // Up alone: running with Up held (an aim) is not asking to be lifted, and pressing a way to go lets him go
 if(st.view.replay||g.flipped||!inp.u||inp.d||inp.l||inp.r||inp.dash||p.state==='dead'||p.state==='respawn'||p.state==='dash')return;
 let L=null,x=null,top=null;
 for(const dr of g.room.def.doors||[]){
  if(!underDoor(g,dr))continue;const br=doorBranch(dr);if(!br)continue;if(sealedQuest(br)){sayEchoSealed(br);continue;}   // asking at a sealed echo's door says why
  L=L0&&L0.to===br.id?L0:{to:br.id,arm:0,t:0};x=hostLiftX(g,pl,dr,br);break;
 }
 // through the seam and on up the shaft of the branch he is being lifted into
 if(x==null&&L0&&L0.t>0&&pl&&pl.branch&&pl.branch.obj.id===L0.to){const sh=liftShaft(g,pl);if(sh){L=L0;x=sh.x;top=sh.top;}}
 if(x==null)return;
 // held for a moment first, standing or hovering (not while a jump, a dash or a climb is still taking him up: a route
 // that holds Up on its way through a door is left exactly as it was)
 st.lift=L;if(L.t===0){if(p.vy<-40||Math.abs(p.vx)>40){L.arm=0;return;}if(++L.arm<LIFT_ARM)return;}
 L.t++;const v=Math.min(LIFT_TOP,30+L.t*10,top!=null?40+Math.max(0,p.y+p.h-top)*5:Infinity);   // easing in, and out onto the ledge at the shaft's top
 // never slower than he is already rising (the end of an up-dash, a spring): then it only centres him
 if(-p.vy<v){p.state='normal';p.vy=-(v+C().K.gravity*C().DT);p.varJump=0;p.autoJump=false;}
 p.vx=0;p.remX=0;p.forceMoveTimer=0;
 const dx=Math.sign(x-p.x)*Math.min(1,Math.abs(x-p.x));if(dx&&!C().solidAt(g,p.x+dx,p.y,p.w,p.h))p.x+=dx;
}
const rgba=(hex,a)=>{const n=parseInt(hex.slice(1),16);return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`;};
function drawDoorBeams(b,def,rm,t,world=st.world){
 for(const dr of def.doors||[]){
  const br=[...world.quests,...(world.secrets||[])].find(br=>br.id===dr.to);if(!br?.sections.length||sealedQuest(br))continue;
  const quest=world.quests.includes(br),gate=quest&&/^socket/.test(br.id),col=gate?'#cfe6ff':isPurple(world,br)?PURPLE:quest?'#ffb3cf':heartOf(world).col;
  const taken=!gate&&(quest?questDone(br):!!(save.secrets||{})[br.id]),a=(taken?.45:1)*(.85+.15*Math.sin(t/20));
  let r=0;while(r<rm.rows&&dr.cols.every(c=>rm.grid[r*rm.cols+c]!==C().SOLID))r++;   // down through the opening to the floor
  const x0=dr.cols[0]*TILE,w=dr.cols.length*TILE,y1=Math.max(24,r*TILE);
  b.save();
  let gr=b.createLinearGradient(0,0,0,y1);gr.addColorStop(0,rgba(col,.16*a));gr.addColorStop(1,rgba(col,0));b.fillStyle=gr;b.fillRect(x0-3,0,w+6,y1);
  gr=b.createLinearGradient(0,0,0,y1);gr.addColorStop(0,rgba(col,.55*a));gr.addColorStop(.5,rgba(col,.22*a));gr.addColorStop(1,rgba(col,0));b.fillStyle=gr;b.fillRect(x0+2,0,w-4,y1);
  b.fillStyle=rgba(col,.8*a);b.fillRect(x0,0,w,1);
  for(let i=0;i<6;i++){const k=((t*.5+i*41)%y1)/y1;b.fillStyle=rgba('#ffffff',.75*a*Math.min(1,k*4)*(1-k));b.fillRect(x0+2+((i*7+Math.floor(t/23))%(w-4)),Math.round(y1*k),1,1);}   // motes rising
  b.restore();
 }
}
function drawLiftHint(b,g){
 if(g.flipped||st.lift&&st.lift.t>0)return;const p=g.p;
 for(const dr of g.room.def.doors||[]){
  const br=doorBranch(dr);if(!br||sealedQuest(br)||!underDoor(g,dr,20))continue;
  // near it: an arrow bobbing in the beam over his head; right under it: the words too
  const [x0,x1]=doorSpan(dr),cx=(x0+x1)/2,bob=(g.frame>>4)&1,ay=Math.round(p.y-19-bob);
  b.save();b.fillStyle='#fff3c8';for(let i=0;i<3;i++)b.fillRect(Math.round(cx)-1-i,ay+i,2+i*2,1);
  if(underDoor(g,dr)){b.font='6px ui-monospace,Menlo,monospace';const txt='hold',w=Math.ceil(b.measureText(txt).width)+13,hx=Math.round(p.x+p.w/2-w/2),hy=Math.round(p.y-6);
   b.fillStyle='rgba(14,16,24,.8)';b.fillRect(hx,hy-9,w,9);b.fillStyle='#ffd98a';b.fillText(txt,hx+3,hy-2);
   const ax=hx+w-7;b.fillRect(ax+2,hy-7,1,6);b.fillRect(ax+1,hy-6,3,1);b.fillRect(ax,hy-5,5,1);}   // "hold" and an up arrow (a glyph is unreadable at this size)
  b.restore();return;
 }
}

/* ---------------------------------------------------------------- skips (Isaac, 7.270) */
/* Three per world: normal challenges cost one; the ending superroom costs two in Base, three in Fractured. */
function skipInfo(){
 const view=st?.view,g=view?.g,pl=g&&st.world&&sectionOf(g),d=g?.room?.def;
 // (7.314) test mode (five presses of Screen shake): skips never run out, and bosses and large rooms can be skipped
 const test=!!V().testMode?.(),remaining=test?Infinity:st?.skips??0,finale=!!d&&st.world?.bankIntegration?.superroom===d.id;
 const cost=finale?(st.world.n>20?3:2):1;
 let reason='';
 if(!pl||view.mode!=='play')reason='Start a world first';
 else if(pl.branch)reason='Optional routes cannot be skipped';
 else if(!test&&!finale&&(d.campaignImport?.superroom||d.bank?.format==='superroom'||d.superroom||
   ['boss','sentinel','marksman','colossus','warden','sorcerer','tyrant','crown','chainHydra','dayKing','rootCrown'].some(k=>d[k])||d.combat?.enemies?.some(e=>e.brute)))reason='This boss cannot be skipped';
 else if(d.connector||d.passage||d.atlasJunction||d.atlasTransit)reason='Skips apply to normal challenges';
 else if(!test&&!finale&&(d.bank?.format==='extended'||(d.cols||40)*(d.rows||23)>40*23))reason='Large challenges cannot be skipped';
 else if(!pl.chain[chainIndex(pl,g.room.id)+1])reason='This is the last section';
 else if(remaining<cost)reason=finale?`This finale needs ${cost} skips · ${remaining} left`:'No skips left in this world';
 return {allowed:!reason,remaining,cost,finale,reason};
}
function skipSection({fromPause=false}={}){
 const info=skipInfo();if(!info.allowed){announce(info.reason,150);return false;}
 const view=st.view,g=view.g,pl=sectionOf(g);
 if(view.paused&&!fromPause)return false;
 const next=pl.chain[chainIndex(pl,g.room.id)+1];
 const proceed=()=>{root.BladefallClimbSession?.invalidate('skip');
 if(!V().testMode?.())st.skips-=info.cost;st.trialSolved?.add(g.room.id);st.atlas?.solve(g.room.id);store('bladefall.climb.atlas.v1',st.atlas.snapshot());st.trail=[];C().enterRoom(g,roomIdx(next.room));st.enteredAt=g.frame;view.roomTimer=0;
 announce(V().testMode?.()?'Skipped · test mode':`Skipped · used ${info.cost} · ${st.skips} left in ${st.world.name}`,170);};
 if(!root.BladefallClimbSession?.request(g.room.def,proceed,'skipped'))proceed();
 return true;
}
if(typeof addEventListener==='function')addEventListener('keydown',e=>{
 if(!st||!st.world||e.repeat||!isClimb(chapterNow(st.view)))return;
 if(e.key==='n'||e.key==='N')skipSection();
});

/* ---------------------------------------------------------------- branches and their way back */
/* Isaac (7.269): a quest or a secret is a place to explore, with a reward at its far end, and its way back is a
   passage you walk (a spring where it climbs) to the room you entered it from — never a shortcut on. The opening
   where that passage comes out can be gone into too: the same passage, the other way. */
function branchById(id){return st.world.quests.find(q=>q.id===id)||(st.world.secrets||[]).find(x=>x.id===id)||null;}
function branchKind(br){return st.world.quests.includes(br)?'quest':'secret';}
/* Coming into a room by its own exit (walking a way back the other way): not so far that he is through it again. */
function settleInside(g){
 const p=g.p,ex=g.room.exit,RW=g.room.w,RH=g.room.h;
 if(ex==='down'&&p.y>=RH-2-p.h)p.y=RH-p.h-3;else if(ex==='right'&&p.x>=RW-p.w-1)p.x=RW-p.w-3;else if(ex==='left'&&p.x<=1)p.x=2;
}
function claimBranch(g,br){
 if(!routeProven(g,br.obj)){if(st.provenSaid!==br.obj.id){st.provenSaid=br.obj.id;announce('The heart stays · finish every room of this route by its own way',220);}return;}
 if(br.kind==='quest'){const q=br.obj,took=q.sections.some(s=>hasShardIn(g,s.room))||!q.sections.some(s=>{const d=defOf(s.room);return d.map.join('').includes('*');});
  if(took)grant(q);else announce('Something was left behind in there…',150);}
 else{const x=br.obj;root.BladefallPlaytest?.collectHeart(x.id);if(!save.secrets)save.secrets={};
  if(!save.secrets[x.id]){save.secrets[x.id]=true;store(SAVE,save);
   if(isPurple(st.world,x)){const f=CL().world(st.world.n+20)?.name||'the Fractured world';openFracturedPortal();
    announce(worldBeaten(st.world.n)?`Purple heart · ${f} is open`:`Purple heart · finish ${st.world.name} to open ${f}`,300);}
   else announce(`♥ ${heartOf(st.world).name} · ${x.name}`,260);}}
}
function endOfBranch(g){
 const p=g.p,room=g.room;room.exit='none';g.exited=false;
 if(st.closed.has(room.id)){openSeam(room,room.def);st.closed.delete(room.id);}   // the way back is always open after the reward
 p.x=Math.max(0,Math.min(room.w-p.w,p.x));p.y=Math.max(0,Math.min(room.h-p.h,p.y));
}
function edgeOut(g,p,dir){const RW=g.room.w,RH=g.room.h;return dir==='right'?p.x>=RW-2:dir==='left'?p.x<=-p.w+2:dir==='up'?p.y<=-3:p.y>=RH-2;}
/* The seam: the next section becomes the room in play, and the knight is set down where he is in the world. */
/* A copy of a section's state as the knight leaves it, to draw it that way behind him. */
function freeze(g){
 try{const o={};for(const k in g){if(k==='defs'||k==='rooms'||k==='room'||k==='events')continue;o[k]=g[k];}
  const c=structuredClone(o);c.defs=g.defs;c.rooms=g.rooms;c.room=g.room;c.events=[];return c;}catch(e){return null;}
}
function carryInto(pl,next){
 const view=st.view,g=view.g;
 const checkpoint=root.BladefallClimbBankPassages?.checkpointLink(st.world,g.room.id,next.room);
 // (7.280) leaving a flipped room he crosses where he is seen (turned upright), unless what lies beyond was laid out
 // for his mirrored height (a way back the builder placed from a flipped exit): then as before
 const mirrored=g.flipped&&root.BladefallPrecisionGravity?CL().snap(g):null;uprightBeforeLeaving(g);
 let snap=CL().snap(g);const from={x:pl.x,y:pl.y},to={x:next.x*TILE,y:next.y*TILE};
 if(st.closed.has(g.room.id)&&R().all.indexOf(g.room.def)>=0){openSeam(g.room,g.room.def);st.closed.delete(g.room.id);}   // cleared: the way back opens again
 const fz=freeze(g);if(fz&&st.frozen)st.frozen.set(g.room.id,fz);
 C().enterRoom(g,roomIdx(next.room));
 keepProgress(g);
 if(g.room.def.atlasTerrain){const port=g.room.def.atlasSockets.find(s=>s.to===pl.sec.room);st.passageEntry=port?.edge;}
 syncWalkSeams(g);
 if(mirrored){const q=g.p,x=Math.max(0,Math.min(g.room.w-q.w,Math.round(snap.x+from.x-to.x))),y=Math.max(0,Math.min(g.room.h-q.h,Math.round(snap.y+from.y-to.y)));if(C().solidAt(g,x,y,q.w,q.h))snap=mirrored;}
 if(checkpoint){root.BladefallClimbBankPassages.arrive(g);st.cam=null;view.camRoom=null;}
 else CL().carry(C(),g,snap,from,to,!!(defOf(pl.sec.room)?.atlasJunction||g.room.def.atlasJunction||defOf(pl.sec.room)?.atlasTerrain||g.room.def.atlasTerrain));st.enteredAt=g.frame;
 // Falling back through an upward exit is an entrance until the head has
 // cleared the ceiling; it must not immediately fire the exit again.
 if(g.room.exit==='up'&&g.p.y<0&&g.p.vy>=0){g.exited=true;st.returningCeiling=g.room.id;}   // a moment to find your feet before the way back counts
 // An upward exit can cross on the final pixel of its arc. Settle its feet on
 // the receiving one-way landing instead of leaving its body below that ledge.
 if(g.room.def.atlasJunction&&g.room.def.entry==='down')g.p.y=Math.min(g.p.y,g.room.h-19);
 // A junction entered from above (a road that ends by dropping, as the Colossus's Last Pour does): the knight crosses
 // the top edge already falling, so he is set just inside it (at most two pixels) rather than inside its boundary.
 if(g.room.def.atlasJunction&&g.room.def.entry==='up'&&g.p.y<0)g.p.y=0;
 rememberLocation();
 const dx=from.x-to.x,dy=from.y-to.y;
 for(const q of view.scarf||[]){q.x+=dx;q.y+=dy;}for(const q of view.trail||[]){q.x+=dx;q.y+=dy;}for(const q of view.parts||[]){q.x+=dx;q.y+=dy;}
 for(const q of st.trail){q.x+=dx;q.y+=dy;}
 if(checkpoint){view.trail=[];view.parts=[];st.trail=[];for(const q of view.scarf||[]){q.x=g.p.x+4;q.y=g.p.y+3;}}
 view.roomTimer=0;
 V().persist&&V().persist();
 if(view.mode==='play')st.api.music(true);   // a boss section may change the track
}
function slideTo(index,dir,after){
 const view=st.view,old=document.createElement('canvas');old.width=view.buf.width;old.height=view.buf.height;old.getContext('2d').drawImage(view.buf,0,0);
 V().goRoom(index);if(after)after();
 st.trail=[];st.cam=null;st.slide={dir,t:0,n:26,old};view.roomTimer=0;
}
let slideCanvas=null;
PV.slideFrame=function(buf,W,Hh){
 if(!st)return BASE.slideFrame(buf,W,Hh);
 if(!st.slide)return null;
 const s=st.slide,k=H.ease(Math.min(1,s.t/s.n));
 slideCanvas=slideCanvas||document.createElement('canvas');slideCanvas.width=W;slideCanvas.height=Hh;
 const c=slideCanvas.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,W,Hh);
 const [dx,dy]={right:[-1,0],left:[1,0],up:[0,1],down:[0,-1]}[s.dir]||[-1,0];
 c.drawImage(s.old,Math.round(dx*k*W),Math.round(dy*k*Hh));c.drawImage(buf,Math.round(-dx*(1-k)*W),Math.round(-dy*(1-k)*Hh));
 return slideCanvas;
};

/* ---------------------------------------------------------------- the end of a world */
function worldClearReady(){
 const required=st.world.requiredMainRooms||[];
 return required.every(id=>st.trialSolved?.has(id)||st.resumeProgress&&st.atlas?.state.solved[id]);
}
function worldDone(view){
 if(!worldClearReady()){root.BladefallClimbSession?.invalidate('unfinished rooms');atlasMap();return;}

 const w=st.world,api=st.api,s=view.chapterStats,secs=Math.round(s.frames/60);
 for(const q of w.quests)if(q.bearings&&bearingsHeld(view.g,q).length===q.bearings.length)grant(q);
 V().persist&&V().persist();
 save.cleared[w.n]=true;if(!save.best[w.n]||s.deaths<save.best[w.n].deaths)save.best[w.n]={deaths:s.deaths,frames:s.frames};store(SAVE,save);
 view.mode='card';view.replay=null;view.wipe=0;view.wipeTo=null;api.music(false);
 const rows=w.quests.filter(q=>q.keepsake&&(q.sections.length||q.bearings)).map(q=>`<tr><td>${q.title}</td><td>${questDone(q)?'♥ heart':'♡ not found (optional)'}</td></tr>`).join('')
  +(w.secrets||[]).map(x=>`<tr><td>Secret · ${x.name}</td><td>${(save.secrets||{})[x.id]?(isPurple(w,x)?'♥ purple heart':`♥ ${heartOf(w).name}`):isPurple(w,x)?'♡ purple heart not found (it opens the Fractured world)':'♡ not found'}</td></tr>`).join('');
 const next=CL().world(w.n+1);
 api.showOverlay(`<div class="pcCard"><h1>${w.name}</h1><p class="pcSub">${w.outro||'The climb is done.'}</p>
 <table class="pcTable"><tr><td>Deaths</td><td>${s.deaths}</td></tr><tr><td>Time</td><td>${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}</td></tr>${rows}</table>
 ${next?`<button class="pcBtn" id="clNext">On to ${next.name}</button>`:''}<button class="pcBtn ghost" id="clAgain">Climb ${w.name} again</button><button class="pcBtn ghost" id="clList" data-back>All worlds</button></div>`);
 if(next)document.getElementById('clNext').onclick=()=>startWorld(next.n);
 document.getElementById('clAgain').onclick=()=>startWorld(w.n);
 document.getElementById('clList').onclick=worldMenu;
}
PV.chapterDone=function(ch,api){if(!st)return BASE.chapterDone(ch,api);if(!isClimb(R().chapters[ch]))return false;worldDone(st.view);return true;};

/* ---------------------------------------------------------------- drawing: fires, props, people */
/* Someone walking off (Mara running the road ahead): along the ground like the knight, up small steps, down drops;
   a wall too high stops her, and she is gone once she is out of sight. */
/* Someone leaving (Mara running ahead) runs the room's own route, the way the knight would: she jumps and
   climbs exactly as the intended tape does, from the point on it nearest her, and leaves by the room's exit. */
function routePath(def){
 const key='path:'+def.id;if(st.dispCache.has(key))return st.dispCache.get(key);
 const t=R().tapes[def.id];let path=null;
 if(def.atlasTerrain){path=[];const points=def.atlasTerrain.path;for(let i=1;i<points.length;i++){const a=points[i-1],z=points[i],n=Math.max(1,Math.ceil(Math.hypot(z.c-a.c,z.r-a.r)*8));for(let j=0;j<n;j++)path.push({x:(a.c+(z.c-a.c)*j/n)*8+4,y:(a.r+(z.r-a.r)*j/n)*8,f:z.c<a.c?-1:1});}}
 if(t){const g=C().createGame([def],{room:0}),out=[];const kin=k=>({l:k.includes('l'),r:k.includes('r'),u:k.includes('u'),d:k.includes('d'),jump:k.includes('j'),dash:k.includes('x'),grab:k.includes('g'),strike:k.includes('s'),parry:k.includes('p'),portal:k.includes('q')});
  for(const [n,k] of t)for(let i=0;i<n;i++){C().step(g,kin(k));out.push({x:g.p.x+4,y:uprightY(g)+11,f:g.p.facing});if(g.events.some(e=>e.type==='exit'))i=n;g.events.length=0;}
  path=out;}
 st.dispCache.set(key,path);return path;
}
/* She travels on: along this section's route, then each next one's, until the section where she next appears
   (her destination), where she stays. Catching her up does not make her vanish; she keeps going. */
function startWalk(key,who,d,x0,y0,dx){
 const k=st.world.sections.findIndex(s=>s.room===d.id);
 let dest=null;if(k>=0)for(let j=k+1;j<st.world.sections.length&&!dest;j++){const dd=defOf(st.world.sections[j].room);if((dd.people||[]).some(p=>p.who===who.who))dest=dd.id;}
 const s0=k>=0?st.world.sections[k]:CL().place(st.world,d.id).sec;
 st.walk[key]={world:st.world.n,who:who.who,dx,k,sec:s0,dest,i:undefined,x:s0.x*TILE+x0,y:s0.y*TILE+y0,last:k<0||!dest&&k===st.world.sections.length-1};
}
function stepWalk(w){
 const def=defOf(w.sec.room),path=routePath(def),ox=w.sec.x*TILE,oy=w.sec.y*TILE;
 if(!path||!path.length){w.done=true;return;}
 if(w.i===undefined){let best=0,bd=1e9;path.forEach((q,i)=>{const d=Math.hypot(q.x+ox-w.x,q.y+oy-w.y);if(d<bd){bd=d;best=i;}});w.i=best;}
 w.i=Math.min(path.length-1,w.i+1);const q=path[w.i];w.x=q.x+ox;w.y=q.y+oy;w.dx=q.f||w.dx;
 if(w.i<path.length-1)return;
 // the end of this section's route: on into the next, unless this is where she was going
 const nk=w.k+1,next=w.k>=0&&CL().world(w.world||st.world.n).sections[nk];
 if(!next||!w.dest||w.sec.room===w.dest){w.done=true;return;}
 w.k=nk;w.sec=next;w.i=0;
 if(next.room===w.dest){const dd=defOf(w.dest);const pp=(dd.people||[]).find(p=>p.who===w.who);w.arrive=pp?{x:next.x*TILE+pp.c*8+4,y:next.y*TILE+(pp.ceiling?pp.r*8:pp.r*8+8)}:null;}
}
function drawWalkers(b,g,pl){
 const t=g.frame;
 for(const [key,w] of Object.entries(st.walk)){
  if(w.done)continue;
  stepWalk(w);
  if(w.done){st.gone.add(key);continue;}   // arrived (she stands at her spot there) or gone off the end
  if(w.arrive&&Math.hypot(w.arrive.x-w.x,w.arrive.y-w.y)<10){w.done=true;st.gone.add(key);continue;}
  (root.BladefallClimbArt?.person||H.person)(b,w.x-pl.x,w.y-pl.y,w.who,t,w.dx);
 }
}
function drawFolk(b,g,d,live,world=st.world){
 const t=(st.view.g||g).frame,sec=CL().place(world,d.id);
 if(d.atlasTerrain){for(const port of d.atlasSockets)H.prop(b,'hearth',port.plane+(port.edge==='left'?32:-40),(port.floor-1)*8,t);}
 else if(d.atlasTransit){for(const c of [4,g.room.cols-5])H.prop(b,'hearth',c*8,(d.atlasTransit.floor[c]-1)*8,t);}
 else if(sec&&sec.sec.fire)H.prop(b,'hearth',sec.sec.fire.c*8,sec.sec.fire.r*8,t);
 for(const pr of d.decor||[])H.prop(b,pr.k,pr.c*8,pr.r*8,t);
 for(const who of d.people||[]){
  const key=d.id+':'+who.who;if(st.gone.has(key))continue;
  if(who.voiceUntilDone&&!questDone(questOf(who.quest)))continue;
  let x=who.c*8+4,y=who.ceiling?who.r*8:who.r*8+8,face=live?(g.p.x+4<x?-1:1):(who.face||1);
  if(st.walk[key])continue;                                  // on her way: drawn by drawWalkers
  if(live&&Object.values(st.walk).some(w=>!w.done&&w.who===who.who&&w.dest===d.id))continue;   // not there yet
  if(!live&&Object.values(st.walk).some(w=>!w.done&&w.who===who.who&&w.dest===d.id))continue;
  if(live&&who.follow){const tr=st.trail,lag=26,at=tr.length>lag?tr[tr.length-1-lag]:null;if(at){x=at.x+4-at.f*6;y=at.y+11;face=at.f;}}
  if(who.ceiling){b.save();b.translate(0,2*y);b.scale(1,-1);}
  (root.BladefallClimbArt?.person||H.person)(b,x,y,who.who,t,face);if(who.ceiling)b.restore();
  if(live){who._x=x;who._y=y;}
 }
}
PV.draw=function(b,g,view){
 if(!st)return BASE.draw(b,g,view);
 if(!isClimb(chapterNow(view)))return;
 b.save();if(g.flipped){b.translate(0,g.room.h);b.scale(1,-1);}
 if(!CL().geography)drawFolk(b,g,g.room.def,true);
 if(!CL().geography)root.BladefallClimbPassageArt?.details(b,g);
 for(const socket of g.room.def.atlasSockets||[]){
  if(socket.kind!=='passage'||st.atlas.state.open[socket.link])continue;
  const x=socket.edge==='left'?1:g.room.w-5;b.fillStyle='#6c7775';
  for(let y=socket.floor*8-32;y<socket.floor*8;y+=6)b.fillRect(x,y,4,3);
 }
 // (7.280) only over the Sealed Crown, and "sealed" only while all three roads up are (the mouth signs say the rest)
 if(g.room.def.atlasJunction&&st.world.n===9&&g.room.id.endsWith('-atlas-crossroads')){b.fillStyle='#c9bc84';b.font='7px monospace';b.textAlign='center';b.fillText('THE UPPER CROWN',g.room.w/2,g.room.spawn.y-28);if(!(g.room.def.atlasSockets||[]).some(s=>s.link&&st.atlas.state.open[s.link])){b.font='6px monospace';b.fillText('The way ahead is sealed',g.room.w/2,g.room.spawn.y-16);}b.textAlign='left';}
 {const pl=sectionOf(g);if(pl&&st.walk)drawWalkers(b,g,pl);}
 drawDoorBeams(b,g.room.def,g.flipped&&g.room.upright||g.room,g.frame);drawLiftHint(b,g);   // (7.280) ceiling doors shine
 {const portal=riftPortal();if(portal&&portal.room===g.room.id){b.strokeStyle='#c8a5ff';b.lineWidth=2;b.strokeRect(portal.x-4,portal.y-8,16,24);b.fillStyle='#d9c3ff';b.font='6px monospace';b.fillText('↑ '+(portal.returning?'Return':'Fractured'),portal.x-12,portal.y-12);}}
 root.BladefallClimbBankPassages?.draw(b,g,st.world,g.frame);
 drawReward(b,g.room.id,g.frame);drawEchoSeals(b,g,g.frame);drawDropHint(b);
 {const pl=sectionOf(g);if(pl&&root.BladefallClimbCoop)try{root.BladefallClimbCoop.draw(b,g,pl);}catch(e){}}
 if(g.room.def.bearing)for(const e of g.ents)if(e.type==='shard'&&!e.gone){b.fillStyle='#e9c47a';b.fillRect(e.x+3,e.y-6,2,6);}
 b.restore();
};

/* ---------------------------------------------------------------- the sky, continuous across the world */
function geographyBackground(b,view,W,Hh,cam=st.cam||{x:0,y:0}){
 const geo=CL().geography,cx=(cam.x+W/2)/8,cy=(cam.y+Hh/2)/8;
 if(view.g.room.def.atlasFold){const pl=sectionOf(view.g);root.BladefallClimbPassageArt.background(b,view.g,{x:cam.x-pl.x,y:cam.y-pl.y},W,Hh);return true;}
 const regions=[...geo.regions.values()].map(r=>{const a=root.BladefallClimbGeographyBuild.anchors[r.world];return {r,d:Math.hypot(cx-a[0],cy-a[1])};}).sort((a,b)=>a.d-b.d).slice(0,2);
 for(let i=0;i<regions.length;i++){
  const {r,d}=regions[i],w=CL().world(r.world),scene={...displayGame(w.atlasStart,true),frame:view.g.frame};
  b.save();if(i)b.globalAlpha=Math.min(.5,Math.pow((regions[0].d+30)/(d+30),4)*.5);
  root.BladefallClimbArt.background(b,scene,cam,W,Hh,palFor(w.palette));b.restore();
 }
 for(const room of geo.visible(cam,W,Hh))if(room.def.atlasTerrain){
  const scene={...(room.id===view.g.room.id?view.g:st.frozen.get(room.id)||displayGame(room.id,true)),frame:view.g.frame};
  b.save();b.beginPath();
  for(let y=Math.max(0,Math.floor(cam.y/8-room.y));y<Math.min(room.h,Math.ceil((cam.y+Hh)/8-room.y));y++)for(const [left,right] of room.def.atlasTerrain.spans[y])b.rect((room.x+left)*8-cam.x,(room.y+y)*8-cam.y,(right-left)*8,8);
  b.clip();root.BladefallClimbPassageArt.background(b,scene,{x:cam.x-room.x*8,y:cam.y-room.y*8},W,Hh);b.restore();
 }
 return true;
}
PV.background=function(b,pal,view,W,Hh){
 if(!st||!isClimb(chapterNow(view)))return BASE.background(b,pal,view,W,Hh);
 if(CL().geography)return true;
 const d=view.g.room.def,t=view.g.frame,cam=st.cam||{x:0,y:0},p=palFor(d.palette||st.world.palette);
 if(root.BladefallClimbArt){
  const paint=(game,local,world,brush=b)=>{if(game.room.def.atlasTransit){
   root.BladefallClimbPassageArt.background(brush,game,local,W,Hh);
   // Carry the actual neighbouring skyline into the borderland. Both sides of
   // a seam render this same spatial blend, so ownership never swaps the sky.
   const layer=PV._borderSky||(PV._borderSky=document.createElement('canvas'));
   if(layer.width!==W||layer.height!==Hh){layer.width=W;layer.height=Hh;}
   const q=layer.getContext('2d'),reach=320;
   for(const port of game.room.def.atlasSockets||[]){
    const left=port.edge==='left',edge=(left?0:game.room.w)-local.x;
    if(left?edge+reach<0:edge-reach>W)continue;
    const target=socketTarget(game,port);if(!target)continue;
    const other=displayGame(target.room,true),pos=CL().place(target.world,target.room);
    const dx=left?-other.room.w:game.room.w,dy=(port.floor-target.floor)*8;
    q.clearRect(0,0,W,Hh);
    root.BladefallClimbArt.background(q,{...other,frame:game.frame},{x:local.x-dx+pos.x,y:local.y-dy+pos.y},W,Hh,palFor(other.room.def.palette));
    q.save();q.globalCompositeOperation='destination-in';
    const fade=q.createLinearGradient(left?edge:edge-reach,0,left?edge+reach:edge,0);
    fade.addColorStop(0,left?'#000':'transparent');fade.addColorStop(1,left?'transparent':'#000');
    q.fillStyle=fade;q.fillRect(0,0,W,Hh);q.restore();brush.drawImage(layer,0,0);
   }
   return true;
  }
   const pos=CL().place(world,game.room.id);return root.BladefallClimbArt.background(brush,game,{x:local.x+(pos?.x||0),y:local.y+(pos?.y||0)},W,Hh,palFor(game.room.def.palette));};
  paint(view.g,view.cam,st.world);
  for(const s of visibleSockets(view.g)){
   const target=socketTarget(view.g,s);if(!target)continue;const def=defOf(target.room),tw=(def.cols||40)*8;
   const dx=s.edge==='left'?-tw:view.g.room.w,dy=(s.floor-target.floor)*8,edgeX=(s.edge==='left'?0:view.g.room.w)-view.cam.x;
   if(s.edge==='left'?edgeX<=0:edgeX>=W)continue;
   const other=displayGame(target.room,true),scene={...other,frame:view.g.frame};
   const layer=PV._portSky||(PV._portSky=document.createElement('canvas'));
   if(layer.width!==W||layer.height!==Hh){layer.width=W;layer.height=Hh;}
   const q=layer.getContext('2d');q.clearRect(0,0,W,Hh);
   paint(scene,{x:view.cam.x-dx,y:view.cam.y-dy},target.world,q);
   // Soften atmosphere between adjacent openings; their geometry remains fixed.
   q.save();q.globalCompositeOperation='destination-in';
   for(const [y,upper] of [[s.viewTop-view.cam.y,true],[s.viewBottom-view.cam.y,false]])if(Number.isFinite(y)){
    const fade=q.createLinearGradient(0,y-8,0,y+8);fade.addColorStop(0,upper?'transparent':'#000');fade.addColorStop(1,upper?'#000':'transparent');q.fillStyle=fade;q.fillRect(0,0,W,Hh);
   }q.restore();
   b.save();b.beginPath();b.rect(s.edge==='left'?0:edgeX,0,s.edge==='left'?edgeX:W-edgeX,Hh);b.clip();b.drawImage(layer,0,0);b.restore();
  }
  return true;
 }
 const gr=b.createLinearGradient(0,0,0,Hh);
 if(d.palette==='outskirts'){gr.addColorStop(0,'#0c1224');gr.addColorStop(.7,'#2a2440');gr.addColorStop(1,'#43304a');}
 else if(d.palette==='frost'){gr.addColorStop(0,'#1b2d44');gr.addColorStop(1,'#7f98ad');}
 else{gr.addColorStop(0,p.sky0);gr.addColorStop(1,p.sky1);}
 b.fillStyle=gr;b.fillRect(0,0,W,Hh);
 if(d.palette==='outskirts'){
  for(let i=0;i<40;i++){const x=((H.hash(i,40)*W*3-cam.x*.03)%W+W)%W,y=H.hash(40,i)*Hh*.55;b.globalAlpha=.25+.5*Math.abs(Math.sin(t/80+i));b.fillStyle='#e8e4ff';b.fillRect(x|0,y|0,1,1);}
  b.globalAlpha=1;const mx=270-((cam.x*.02)%300),my=34;b.fillStyle='#f3e6c4';b.beginPath();b.arc(mx,my,11,0,6.283);b.fill();
 }
 const far=d.palette==='outskirts'?'#262640':d.palette==='frost'?'#5c738a':p.far,near=d.palette==='outskirts'?'#1f1d33':d.palette==='frost'?'#465b72':p.sky0;
 H.ridge(b,W,Hh,cam.x*.1,96-cam.y*.04,far,26,1,7);
 H.ridge(b,W,Hh,cam.x*.22,120-cam.y*.08,near,22,.85,13);
 b.fillStyle=d.palette==='frost'?'#ffffff':(p.accent||'#ffffff');
 for(let i=0;i<(d.palette==='frost'?60:24);i++){const sp=.3+H.hash(i,7)*.7,x=((H.hash(i,3)*W*2-cam.x*sp*.5+Math.sin(t/50+i)*6+t*.1*sp)%W+W)%W,y=((H.hash(7,i)*Hh*2+t*(d.palette==='frost'?.45:.15)*sp-cam.y*sp*.5)%Hh+Hh)%Hh;
  b.globalAlpha=d.palette==='frost'?.35+.4*sp:.25;b.fillRect(x|0,y|0,sp>.7?2:1,sp>.7?2:1);}
 b.globalAlpha=1;return true;
};

/* ---------------------------------------------------------------- speech and toasts */
const nameOf=w=>w==='sentinel'?'Sentinel':w[0].toUpperCase()+w.slice(1);
const H0=(scale,view)=>Math.round(SH*scale);
PV.hud=function(ctx,ox,oy,scale,g,view){
 if(!st)return BASE.hud(ctx,ox,oy,scale,g,view);
 if(!isClimb(chapterNow(view)))return;
 const d=g.room.def,cam=view.cam||{x:0,y:0},p=g.p,W0=view.buf?view.buf.width:320;
 const fs=Math.max(11,Math.round(scale*3.6),Math.round(10*(view.dpr||1)));ctx.font=`${fs}px ui-monospace,Menlo,monospace`;ctx.textBaseline='top';
 for(const who of d.people||[]){
  if(who._x===undefined)continue;const key=d.id+':'+who.who;if(st.gone.has(key)||st.walk[key])continue;
  const near=Math.abs(p.x+4-who._x)<44&&Math.abs(uprightY(g)+11-who._y)<24;
  if(!near){const leave=who.leave||(who.leaveDone&&questDone(questOf(who.quest))?who.leaveDone:null);if(leave&&st.spoke.has(key)&&!st.walk[key])startWalk(key,who,d,who._x,who._y,leave==='left'?-1:1);continue;}
  const q=who.quest&&questOf(who.quest);
  if(q&&who.chart&&q.bearings&&bearingsHeld(g,q).length===q.bearings.length)grant(q);
  const line=q&&questDone(q)&&who.lineDone?who.lineDone:who.line;st.spoke.add(key);
  bubble(ctx,ox,oy,scale,fs,cam,view,W0,who,q&&questDone(q)&&who.nameDone?who.nameDone:who.name||nameOf(who.who),line);
 }
 if(d.atlasJunction||d.atlasTransit){
  const title=g.room.name,region=d.atlasTransit?`${root.BladefallClimbPassages.names[d.atlasTransit.a]} ↔ ${root.BladefallClimbPassages.names[d.atlasTransit.b]}`:st.world.name,px=ox+8*scale,py=oy+5*scale;
  ctx.save();ctx.font=`${fs}px ui-monospace,Menlo,monospace`;
  const width=Math.max(ctx.measureText(title).width,ctx.measureText(region).width)+12;
  ctx.fillStyle='rgba(10,14,20,.88)';ctx.fillRect(px-5,py-3,width,fs*2.7);
  ctx.fillStyle='#f1e5c5';ctx.fillText(title,px,py);ctx.fillStyle='#a9b9c2';ctx.fillText(region,px,py+fs*1.3);ctx.restore();
 }
 let y0=oy+Math.round(scale*3)+fs+8;
 if(st.landmarkTitle){
  const title=st.landmarkTitle,a=Math.min(1,(240-title.t)/40,title.t/50);ctx.save();ctx.globalAlpha=a;
  ctx.font=`${Math.max(18,Math.round(scale*8))}px Georgia,serif`;ctx.textAlign='center';ctx.fillStyle='#e6dfc9';
  const x=ox+W0*scale/2,y=oy+H0(scale,view)*.76;ctx.fillText(title.name,x,y);ctx.fillStyle='#a49b7c';ctx.fillRect(x-32*scale,y+11*scale,64*scale,1);ctx.restore();
 }
 if(st.nearPort&&!st.nearPort.open){const info=root.BladefallClimbMap?.describeSocket?.(g.room.def,st.nearPort.socket,st.atlas);ctx.fillStyle='#c8c4b5';ctx.fillText(info?`Sealed · the road to ${info.toName} opens when you ${info.reasonLong}`:'The crossing is barred · explore the adjoining climbs',ox+10,oy+H0(scale,view)-fs*3.8);}
 if(root.BladefallClimbCoop)try{root.BladefallClimbCoop.hud(ctx,ox,oy,scale,fs,g,view);}catch(e){}
 // skips left in this world (N)
 if(!d.atlasJunction&&!d.atlasTransit){const info=skipInfo(),txt=info.allowed?(info.remaining===Infinity?`Skip · test mode · Pause for map`:`Skip costs ${info.cost} · ${info.remaining} left · Pause for map`):`${info.reason} · Pause for map`,tw=ctx.measureText(txt).width+fs*1.2,x0=ox+Math.round(scale*3);   // (7.316) top left, under the room's name: the hint line along the bottom stays clear
  ctx.globalAlpha=.75;ctx.fillStyle='rgba(14,16,24,.6)';ctx.fillRect(x0-fs*.3,y0-fs*.3,tw,fs*1.6);ctx.fillStyle='#cfd6e2';ctx.fillText(txt,x0+fs*.3,y0);ctx.globalAlpha=1;y0+=fs*1.8;}
 for(const q of st.world.quests){
  let txt=null;const plq=sectionOf(g);if(plq&&plq.quest===q&&!st.quest)st.quest={id:q.id};
  if(q.bearings&&bearingsHeld(g,q).length){const held=bearingsHeld(g,q);txt=`${q.giver}: `+q.bearings.map(b=>(held.includes(b)?'◆':'◇')+' '+b).join('  ');}
  else if(st.quest&&st.quest.id===q.id)txt=q.title;
  if(!txt)continue;const tw=ctx.measureText(txt).width+fs*1.2,x0=ox+W0*scale-8;
  ctx.fillStyle='rgba(14,16,24,.75)';ctx.fillRect(x0-tw,y0,tw,fs*1.6);ctx.fillStyle='#e9c47a';ctx.fillText(txt,x0-tw+fs*.6,y0+fs*.3);y0+=fs*1.9;
 }
 if(st.toast){const a=Math.min(1,st.toast.t/30,(st.toast.max-st.toast.t+1)/12);ctx.globalAlpha=a;const tw=ctx.measureText(st.toast.text).width+fs*1.4,x=ox+(W0*scale-tw)/2,y=oy+Math.round(scale*28);
  ctx.fillStyle='rgba(14,16,24,.85)';ctx.fillRect(x,y,tw,fs*1.7);ctx.fillStyle='#ffd98a';ctx.fillText(st.toast.text,x+fs*.7,y+fs*.35);ctx.globalAlpha=1;}
};
function bubble(ctx,ox,oy,scale,fs,cam,view,W0,who,name,text){
 const maxW=Math.min(view.canvas.width*.42,scale*150);
 const lines=H.wrap(ctx,text,maxW),lh=fs*1.25,w=Math.max(...lines.map(l=>ctx.measureText(l).width),ctx.measureText(name).width)+fs*1.4,h=lh*(lines.length+1)+fs*.8;
 let sx=ox+(who._x-cam.x)*scale-w/2,sy=who.ceiling?oy+(who._y-cam.y+18)*scale:oy+(who._y-cam.y-18)*scale-h;
 const rx0=Math.max(4,ox),rx1=Math.min(view.canvas.width-4,ox+W0*scale);sx=Math.max(rx0+4,Math.min(rx1-w-4,sx));sy=Math.max(oy+4,sy);
 ctx.fillStyle='rgba(14,16,24,.9)';ctx.fillRect(sx,sy,w,h);ctx.strokeStyle='#c9a86a';ctx.lineWidth=1;ctx.strokeRect(sx+.5,sy+.5,w-1,h-1);
 ctx.fillStyle='#c9a86a';ctx.fillText(name.toUpperCase(),sx+fs*.7,sy+fs*.4);ctx.fillStyle='#efe4cc';lines.forEach((l,i)=>ctx.fillText(l,sx+fs*.7,sy+fs*.4+lh*(i+1)));
}
/* Each world plays its base-game track; a boss section plays the boss's. */
const TRACKS={1:['midnight-field'],2:['watchful-greenwood'],3:['the-iron-causeway','iron-juggernaut'],4:['canyon-updrafts'],
 5:['crosshairs-over-open-ground','crosshairs-in-the-dark'],6:['stony-whispers-of-the-keep'],7:['iron-gavel-descent','sentence-of-the-shield-warden'],
 8:['hearthfire-in-the-frost'],9:['glaciated-court-of-glass','the-sorcerers-hall-of-mirrors'],
 10:['embers-of-the-weary-forge'],11:['the-obsidian-foundry','forge-of-the-molten-colossus'],12:['chamber-of-inverted-gravity'],
 13:['paradox-void-assault','iron-oath-of-the-night-attack'],14:['the-black-procession','a-crown-of-ashes']};
// The Right Hand, who did not die in the Citadel, meets you again to his own theme (as in the main game).
const DUEL={'k14-hand':'iron-oath-of-the-night-attack'};
const BOSS=/^cl\d+-(c3-(brace|counterweight)|m5-(court|tiers|perch)|g7-(mouth|well|sentence)|s9-(white|gglass|ward)|f11-(pit|bed|pour)|v13-(low|middle|crown)|k14-(throne|last))$/;
PV.track=function(view){
 if(!st||!isClimb(chapterNow(view)))return BASE.track?BASE.track(view):null;
 const ft=root.BladefallClimbFinale?.track(st.world.n,view.g);if(ft)return ft;
 const t=TRACKS[st.world.n];if(!t)return null;
 const duel=view.g&&DUEL[(view.g.room.def.origin||'')];if(duel)return 'audio/music/'+duel+'.mp3';
 const boss=t[1]&&view.g&&BOSS.test(view.g.room.id);
 return 'audio/music/'+(boss?t[1]:t[0])+'.mp3';
};
PV.pocket=()=>st?null:BASE.pocket();
PV.helpers=H;
/* Co-op (bladefall-climb-coop.js): set the knight down where his partner is, anywhere in this world. Into a quest or
   a secret that way, its reward is sealed (it is earned from the door). */
function teleportTo(roomId,wx,wy){
 const view=st.view,g=view.g,target=CL().geography?CL().worlds.find(w=>CL().all(w).some(s=>s.room===roomId)):st.world,sec=target&&CL().all(target).find(s=>s.room===roomId);if(!sec||!g)return false;
 uprightBeforeLeaving(g);
 const fz=freeze(g);if(fz&&st.frozen)st.frozen.set(g.room.id,fz);
 const previous=st.world.n;st.world=target;st.chapter=R().chapters.indexOf(target.chapter);view.chapter=st.chapter;
 C().enterRoom(g,roomIdx(roomId));keepProgress(g);syncWalkSeams(g);
 // Watching a partner never grants their solved devices or skips the destination's challenge.
 const earned=st.trialSolved?.has(roomId)||st.resumeProgress&&st.atlas?.state.solved[roomId];
 if(earned)CL().carry(C(),g,{x:wx,y:wy,vx:0,vy:0,facing:g.p.facing,dashes:g.p.maxDashes||1,stamina:110},{x:0,y:0},{x:sec.x*TILE,y:sec.y*TILE});
 else announce('Joined at your own checkpoint · clear this room yourself',180);
 root.BladefallClimbSession?.invalidate('co-op teleport');
 st.enteredAt=g.frame;st.trail=[];view.roomTimer=0;
 if(previous!==target.n)st.api.music(true);
 if(g.room.def.atlasTransit){const port=g.room.def.atlasSockets.reduce((a,b)=>Math.abs((a.plane??0)-g.p.x)<Math.abs((b.plane??0)-g.p.x)?a:b);st.passageEntry=port.edge;}
 rememberLocation();
 const npl=sectionOf(g);if(npl&&npl.branch){st.branchVia='back';if(npl.quest)st.quest={id:npl.quest.id};}else{st.branchVia=null;st.quest=null;}
 return true;
}
function returnPassage(){
 const g=st?.view.g,link=g&&root.BladefallClimbBankPassages?.previousLink(st.world,g.room.id);
 if(!link||st.view.replay)return false;
 const from=sectionOf(g),to=st.world.sections.find(s=>s.room===link.from);if(!from||!to)return false;
 st.view.paused=false;st.api.hideOverlay();carryInto(from,to);announce('Back through the passage · previous checkpoint',140);return true;
}
PV.climb={fracturedOpen:n=>fracturedOpen(n),skipInfo,skipSection,returnPassage,useRiftPortal,riftPortal,portViews:visibleSockets,palette:palFor,state:()=>st,startWorld:n=>startWorld(n),menu:()=>worldMenu(),levels:()=>worldMenu(true),teleport:teleportTo,sectionOf:g=>sectionOf(g),defOf:id=>defOf(id),announce:(t,n)=>announce(t,n)};
root.BladefallPitchView=PV;
/* (7.280) A gravity prism's flip keeps the picture still. The scarf, the dash's afterimages and the sparks live in the
   room's own coordinates, which the flip mirrors, so they are turned over with it (first in the list, so the flip's own
   burst, drawn after this, is left alone). */
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).unshift({name:'climb-flip',event(e,{view}){
 if(e.type!=='gravity'||!st||!view||!view.g||!isClimb(chapterNow(view)))return;
 const Hh=view.g.room.h;
 for(const q of view.scarf||[])q.y=Hh-q.y;
 for(const q of view.trail||[])q.y=Hh-q.y-11;
 for(const q of view.parts||[]){q.y=Hh-q.y-(q.size||1);q.vy=-q.vy;q.grav=-(q.grav||0);}
}});
})(typeof window!=='undefined'?window:globalThis);
