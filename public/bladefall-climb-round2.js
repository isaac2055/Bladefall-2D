/* Approved paired quests in Ascend. All task and NPC positions come from existing intended routes.
   These props never enter the core's entity/collision arrays and do nothing during Watch. */
(function(root){
'use strict';
const KEY='bladefall.climb.round2.v1',DATA=root.BladefallQuestRound2Stories;
const CONFIG={
 cartographer:{world:4,source:'cartographer',rooms:['cl4-u4-q-channel','cl4-u4-q-funnel'],road:'cl4-u4-choir',who:'cartographer'},
 recruit:{world:5,source:'recruit',rooms:['cl5-m5-q-stair','cl5-m5-q-top'],road:'cl5-m5-release',who:'recruit'},
 quota:{world:10,source:'quota',rooms:['cl10-e10-q-chute','cl10-e10-q-loft'],road:'cl10-e10-line',who:'maker'},
 neighbours:{world:12,source:'neighbors',rooms:['cl12-i12-q-shelf','cl12-i12-q-service'],road:'cl12-i12-court',who:'neighbour'},
 sailors:{world:16,source:'sailors',rooms:['cl16-t16-q-rigging','cl16-t16-q-charm'],road:'cl16-t16-sailors',who:'sailor'}
};
let ctx=null,raw=null,cache={};
const handles=q=>!!CONFIG[typeof q==='string'?q:q?.id];
function read(){let value;try{value=localStorage.getItem(KEY);}catch(e){}if(value!==raw){raw=value;try{cache=JSON.parse(value)||{};}catch(e){cache={};}}return cache;}
function state(id){const all=read();return all[id]||(all[id]={step:0,perch:0,held:null,found:[],visits:[],npc:null,queue:[]});}
function save(){try{raw=JSON.stringify(cache);localStorage.setItem(KEY,raw);}catch(e){}}
function reset(id){delete read()[id];save();}
const data=id=>DATA.stories[CONFIG[id].source];
function route(room){return ctx.routePath(ctx.defOf(room))||[];}
/* Route y is the knight's feet; quest points are at body centre. Prefer a real, steady landing for holds. */
function spot(room,fraction,stable=false){
 const path=route(room);if(!path.length)return null;let candidates=path.map((p,i)=>({...p,i}));
 if(stable){const map=ctx.defOf(room).map;
  const safe=candidates.filter(p=>{const col=Math.floor(p.x/8),row=Math.floor((p.y+1)/8);return /[#=]/.test(map[row]?.[col]||' ');});if(safe.length)candidates=safe;
 }
 let q;if(fraction==='top')q=candidates.reduce((a,b)=>a.y<b.y?a:b);else{const index=Math.round((path.length-1)*fraction);q=candidates.reduce((a,b)=>Math.abs(a.i-index)<Math.abs(b.i-index)?a:b);}
 return {room,x:q.x,y:q.y-6,index:q.i};
}
function giver(id){const cfg=CONFIG[id],who=(ctx.defOf(cfg.road).people||[]).find(p=>p.who===cfg.who);return {room:cfg.road,x:who.c*8+4,y:who.ceiling?who.r*8+6:who.r*8+2};}
function where(id){if(!ctx||!handles(id))return null;const c=CONFIG[id];
 if(id==='cartographer')return [[.2,.5,.82].map(f=>spot(c.rooms[0],f)),spot(c.rooms[1],'top',true),spot(c.road,'top',true)];
 if(id==='recruit')return [spot(c.rooms[1],.82,true),giver(id),[.32,.6,.91].map(f=>spot(c.road,f))];
 if(id==='quota')return [spot(c.rooms[0],.55,true),spot(c.rooms[1],.9,true),giver(id)];
 if(id==='neighbours')return [spot(c.rooms[0],.72),[spot(c.rooms[1],.12,true),spot(c.rooms[1],.82)],giver(id)];
 return [[spot(c.rooms[0],.3),spot(c.rooms[0],.72),spot(c.rooms[1],.62)],spot(c.rooms[1],.62),giver(id)];
}
function live(){return ctx?.st?.world&&!ctx.st.view.replay&&!ctx.st.review&&!ctx.st.watching;}
function quest(){return ctx.st.world?.quests.find(q=>handles(q)&&CONFIG[q.id].world===ctx.st.world.n);}
function announce(text,t=200){ctx.announce(text,t);root.BladefallSfx?.play('quest');}
function advance(q,s,text,claim=false){s.step++;s.perch=0;s.hold=0;save();if(claim){s.done=true;s.replayAward=!!s.replay;s.replay=false;save();ctx.claim(q);}else announce(text);}
function near(g,p,sp,rx=13,ry=16){return sp?.room===g.room.id&&Math.abs(p.x+p.w/2-sp.x)<rx&&Math.abs(ctx.uprightY(g)+p.h/2-sp.y)<ry;}
function strike(g,p,sp,fresh){return fresh&&sp?.room===g.room.id&&ctx.Core.overlap(...ctx.Core.strikeBox(p),sp.x-10,(g.flipped?g.room.h-sp.y:sp.y)-10,20,20);}
function nearest(path,x,y){let best=0,d=Infinity;path.forEach((p,i)=>{const n=Math.hypot(x-p.x,y-p.y);if(n<d){d=n;best=i;}});return {index:best,distance:d};}
function currentNPC(g,p){return {room:g.room.id,x:p.x+p.w/2,y:ctx.uprightY(g)+p.h/2,f:p.facing,hook:p.hook?{x:p.hook.ring.x+4,y:g.flipped?g.room.h-p.hook.ring.y-4:p.hook.ring.y+4}:null};}
/* Followers consume the knight's actual, continuous trail. A room seam is preserved as a seam, never a jump
   to the giver. An abandoned companion waits at the last reachable point until the knight comes back. */
function follow(s,g,p){
 const pos=currentNPC(g,p);if(!s.npc)s.npc={...pos};const last=s.queue.at(-1)||s.npc;
 if(last.room!==pos.room||Math.hypot(last.x-pos.x,last.y-pos.y)>1.5){
  // Reject discontinuous placements (editor/test teleports); they are not a route for a person to follow.
  if(last.room!==pos.room||Math.hypot(last.x-pos.x,last.y-pos.y)<40)s.queue.push(pos);
 }
 if(s.queue.length){const to=s.queue[0];
  if(to.room!==s.npc.room){s.npc={...to};s.queue.shift();}
  else{const d=Math.hypot(to.x-s.npc.x,to.y-s.npc.y),k=d<1?1:Math.min(1,2.5/d);s.npc.x+=(to.x-s.npc.x)*k;s.npc.y+=(to.y-s.npc.y)*k;s.npc.f=to.f;s.npc.hook=to.hook;if(k===1)s.queue.shift();}
 }
 if(s.queue.length>5000)s.queue.splice(0,s.queue.length-5000);
}
function tick(c){
 ctx=c;if(!live())return;const q=quest();if(!q)return;
 const s=state(q.id),g=ctx.st.view.g,p=g.p,cfg=CONFIG[q.id],Q=data(q.id),room=g.room.id;
 const E=ctx.st._round2||(ctx.st._round2={});
 if(E.id!==q.id){Object.assign(E,{id:q.id,room:null,flip:g.flipped,deaths:g.deaths,striking:false});}
 const fresh=p.strikeTimer>0&&!E.striking;E.striking=p.strikeTimer>0;
 const roomChanged=E.room!==room,flipped=!roomChanged&&E.flip!==g.flipped,died=g.deaths>E.deaths;E.room=room;E.flip=g.flipped;E.deaths=g.deaths;
 if(ctx.questDone(q)&&!s.replay){aftermath(q,s,g);return;}
 const met=(ctx.defOf(q.from).people||[]).some(w=>w.quest===q.id&&ctx.st.spoke.has(q.from+':'+w.who));if(!met)return;
 if(p.state==='dead'||p.state==='respawn'){if(!s.dead){s.dead=true;s.hold=0;save();}return;}
 if(died||s.dead){s.dead=false;s.hold=0;
  if(q.id==='recruit'&&s.step===2){s.visits=[];s.escortIndex=null;announce('Retry the crossing · the Recruit waits at the release');}
  if(q.id==='sailors'&&s.step===2){s.queue=[];s.following=false;if(s.anchor)s.npc={...s.anchor};announce('The sailor holds the last line · go back for them');}
  if(s.held){s.held=null;announce(q.id==='neighbours'?'Spilled · return to the parked pot':'Dropped · return to the last safe catch');}save();return;
 }
 const W=where(q.id),at=(sp,rx,ry)=>near(g,p,sp,rx,ry);
 if(q.id==='cartographer'){
  if(s.step===0){const sp=W[0][s.perch],inWind=(g.room.def.winds||[]).some(w=>p.x+p.w>w.c*8&&p.x<(w.c+w.w)*8&&p.y+p.h>w.r*8&&p.y<(w.r+w.h)*8);s.windSeen=s.windSeen||inWind;
   if(s.windSeen&&at(sp,25,25)){if(s.perch<2){s.perch++;save();announce('The ribbon moves on · follow the current',120);}else{s.held='ribbon';advance(q,s,'Ribbon caught · steady it at the upper funnel');}}
  }else if(s.step===1){if(!s.held&&at(W[0].at(-1),25,25))s.held='ribbon';
   if(s.held&&at(W[1],18,20)){const lull=g.frame%150<100;s.hold=lull?(s.hold||0)+1:0;if(s.hold>=16){s.held='reading';advance(q,s,'A different rhythm · bring it to the Choir chimes');}}
  }else if(s.step===2){if(!s.held&&at(W[1],18,20))s.held='reading';s.bright=g.frame%144<72;if(s.held&&strike(g,p,W[2],fresh)){if(s.bright){s.held=null;advance(q,s,'',true);}else announce('Wait for the ribbon’s bright beat',100);}}
 }
 if(q.id==='recruit'){
  if(s.step===0&&at(W[0])){s.held='helmet';advance(q,s,'The crown is split · bring it to the Recruit');}
  else if(s.step===1){if(!s.held&&at(W[0]))s.held='helmet';if(s.held&&at(W[1],20,22)){s.held=null;s.visits=[];s.npc={...W[1]};advance(q,s,'A hole through it · cross with the Recruit after the volley');}}
  else if(s.step===2){
   const path=route(cfg.road),start=nearest(path,W[1].x,W[1].y+6).index;
   if(s.escortIndex==null)s.escortIndex=start;
   if(room===cfg.road){
    const pos=currentNPC(g,p),after=path.slice(s.escortIndex),n=nearest(after,pos.x,pos.y+6);
    const target=s.escortIndex+n.index;if(n.distance<22&&target>s.escortIndex)s.escortIndex=Math.min(target,s.escortIndex+(target-s.escortIndex>24?2:1));
    W[2].forEach((sp,i)=>{if(i===s.visits.length&&at(sp,18,20))s.visits.push(i);});
   }else if(s.visits.length===3)s.escortIndex=Math.min(path.length-1,s.escortIndex+1);
   const np=path[s.escortIndex];s.npc={room:cfg.road,x:np.x,y:np.y-6};
   if(s.visits.length===3&&s.escortIndex>=path.length*.9){s.npc={...spot(cfg.road,.91)};advance(q,s,'',true);}
  }
 }
 if(q.id==='quota'){
  if(s.step===0){const sp=W[0];if(strike(g,p,sp,fresh)){s.tagged=true;announce('White mark · catch it at the next counter');save();}
   if(s.tagged&&at(sp,18,20)&&g.frame%120<80){s.held='scrap';s.safe={...sp};advance(q,s,'Follow the same mark · lift it through the cooling loft');}}
  else if(s.step===1){if(!s.held&&at(s.safe||W[0],18,20))s.held='scrap';if(s.held&&p.onGround)s.safe=currentNPC(g,p);
   if(s.held&&at(W[1],18,20))advance(q,s,'Same piece at both counters · feed it at the Stamping Line');}
  else if(s.step===2){if(!s.held&&!s.fed&&at(s.safe||W[1],18,20))s.held='scrap';
   if(s.held&&strike(g,p,W[2],fresh)){s.held=null;s.fed=true;s.hold=0;announce('Hold the maintenance catch · one complete stamp');save();}
   if(s.fed){s.hold=at(W[2],20,22)&&Math.abs(p.vx)<20?(s.hold||0)+1:0;if(s.hold>=230)advance(q,s,'',true);}
  }
 }
 if(q.id==='neighbours'){
  if(room===cfg.rooms[0]&&flipped)s.shelfTurned=true;
  if(s.step===0&&s.shelfTurned&&at(W[0],20,22)){s.held='pot';advance(q,s,'Caddy caught · park it before turning for the cups');}
  else if(s.step===1){
   if(flipped&&s.held==='pot'){s.held=null;s.parked=false;announce('Spilled · catch the caddy again');save();}
   if(!s.held&&!s.parked&&at(W[0],20,22))s.held='pot';
   if(s.held&&strike(g,p,W[1][0],fresh)){s.held=null;s.parked=true;s.parkFlip=!!g.flipped;announce('Pot parked · turn the room for the cups');save();}
   if(s.parked&&flipped)s.cupTurned=true;
   if(s.parked&&s.cupTurned&&at(W[1][1],20,22)){s.held='tea';advance(q,s,'Cups and closed pot · bring both to the Middle Landing');}
  }else if(s.step===2){if(!s.held&&at(W[1][0],20,22))s.held='tea';
   if(s.held&&at(W[2],20,22)&&!s.delivered){s.delivered=true;s.visits=[];announce('Tray shared · cross the landing while they tip it');save();}
   if(s.delivered&&room===cfg.road){const path=route(room),np=nearest(path,p.x+p.w/2,ctx.uprightY(g)+p.h/2+6);
    const fraction=np.index/Math.max(1,path.length-1);if(fraction>.35&&!s.visits.includes(0))s.visits.push(0);if(fraction>.7&&s.visits.includes(0))s.visits.push(1);
    if(fraction>.9&&s.visits.length>=2){s.held=null;advance(q,s,'',true);}}
  }
 }
 if(q.id==='sailors'){
  if(p.hook)s.hookSeen=true;
  if(s.step===0){const sp=W[0][s.perch];if(s.hookSeen&&at(sp,22,24)){if(s.perch<2){s.perch++;save();announce('The charm flashes farther up the line',120);}else{advance(q,s,'Someone on the line · hold the upper hook');s.npc={...W[1]};save();}}}
  else if(s.step===1){s.hold=room===cfg.rooms[1]&&p.hook?(s.hold||0)+1:0;if(s.hold>=60){s.following=true;s.queue=[];s.npc=currentNPC(g,p);s.anchor={...s.npc};advance(q,s,'Line taut · bring the sailor down to the deck');}}
  else if(s.step===2){if(!s.following&&at(s.npc,24,26)){s.following=true;s.queue=[];announce('Together again · lead the way down');}
   if(s.following){follow(s,g,p);if(s.npc?.hook)s.anchor={...s.npc};}
   if(strike(g,p,W[2],fresh)&&s.npc?.room===room&&Math.hypot(s.npc.x-W[2].x,s.npc.y-W[2].y)<24){s.half=true;advance(q,s,'',true);}}
 }
 if(roomChanged||g.frame%120===0)save();
}
function aftermath(q,s,g){
 if(!s.done)return;
 if(q.id==='quota'&&g.room.id===CONFIG[q.id].road){const path=route(g.room.id),people=ctx.defOf(g.room.id).people;s.workers=s.workers||{};for(const who of people.filter(w=>w.quest===q.id)){const idx=s.workers[who.who]??nearest(path,who.c*8+4,who.r*8+8).index;s.workers[who.who]=Math.max(0,idx-1);}if(g.frame%120===0)save();}
 if(q.id==='cartographer'&&g.room.id===CONFIG[q.id].road){const path=route(g.room.id);s.workIndex=s.workIndex??nearest(path,giver(q.id).x,giver(q.id).y+6).index;s.workIndex=Math.min(path.length-1,s.workIndex+1);}
}
function pose(id,who,g){
 if(!handles(id)||!ctx||ctx.st.watching||ctx.st.view.replay)return null;const s=state(id),cfg=CONFIG[id];
 if(id==='sailors'&&who==='apprentice'){if(!s.done){const q=quest();if(!q||!ctx.questDone(q)||s.replay)return {hidden:true};}if(s.npc)return {...s.npc,feet:s.npc.y+6};}
 if(id==='quota'&&s.done&&s.workers?.[who]!=null&&g.room.id===cfg.road){const p=route(g.room.id)[s.workers[who]];return {x:p.x,y:p.y-6,feet:p.y};}
 if(id==='neighbours'&&s.delivered&&g.room.id===cfg.road){const person=ctx.defOf(cfg.road).people.find(w=>w.who===who);if(person)return {x:person.c*8+4+(who==='neighbour2'?4:8),y:person.r*8+2,feet:person.ceiling?person.r*8:person.r*8+8};}
 if(id==='recruit'&&who==='recruit'&&s.step>=2&&s.npc?.room===g.room.id)return {...s.npc,feet:s.npc.y+6};
 if(id==='cartographer'&&s.done&&g.room.id===cfg.road&&s.workIndex!=null){const p=route(g.room.id)[s.workIndex];return {x:p.x,y:p.y-6,feet:p.y};}
 return null;
}
function glyph(b,kind,x,y,t,col){
 b.save();b.translate(Math.round(x),Math.round(y));b.fillStyle=col;b.strokeStyle=col;b.lineWidth=1;
 if(kind==='ribbon'){b.beginPath();b.moveTo(-5,0);for(let i=0;i<6;i++)b.lineTo(-5+i*2,Math.sin(t/9+i)*2);b.stroke();}
 else if(kind==='helmet'){b.fillRect(-4,-4,8,4);b.fillRect(-5,0,10,1);b.fillStyle='#16171c';b.fillRect(0,-3,2,2);}
 else if(kind==='pot'||kind==='tea'){b.fillRect(-4,-4,8,5);b.fillRect(-5,-5,10,1);b.fillRect(4,-3,3,1);}
 else if(kind==='chime'){for(let i=0;i<4;i++)b.fillRect(-5+i*3,-9,1,6+i);}
 else if(kind==='scrap'){b.fillRect(-4,-3,8,5);b.fillStyle='#fff4c9';b.fillRect(-2,-2,4,1);}
 else if(kind==='charm'){b.fillRect(-3,-3,6,5);b.fillStyle='#705b43';b.fillRect(0,-3,1,5);}
 else{b.strokeRect(-5,-4,10,6);b.fillRect(-3,-2,2,2);b.fillRect(1,-2,2,2);}
 b.restore();
}
function draw(b,c){
 ctx=c;if(!ctx.st.world||ctx.st.watching||ctx.st.view.replay)return;const q=quest();if(!q)return;
 const s=state(q.id),g=ctx.st.view.g,cfg=CONFIG[q.id],t=g.frame,W=where(q.id),done=ctx.questDone(q)&&!s.replay,col=cfg.source==='quota'?'#f1bc82':cfg.source==='neighbors'?'#cbb5ee':'#ebd29a';
 const show=(sp,kind)=>{if(sp?.room===g.room.id)glyph(b,kind,sp.x,sp.y,t,col);};
 if(q.id==='cartographer'){
  if(!done&&s.step===0)show(W[0][s.perch],'ribbon');if(!done&&s.step===1)show(W[1],'counter');show(W[2],'chime');
  if(done&&g.room.id===cfg.road){const p=pose(q.id,cfg.who,g)||giver(q.id);b.fillStyle='#8f7858';b.fillRect(p.x+5,p.y+3,10,2);b.fillRect(p.x+7,p.y+5,1,5);show(W[2],'ribbon');}
 }
 if(q.id==='recruit'){if(!done&&s.step===0)show(W[0],'helmet');if(s.step>=2)show(W[1],'helmet');}
 if(q.id==='quota'){if(!done&&s.step===0)show(W[0],'scrap');if(!done&&s.step===1&&!s.held)show(s.safe||W[0],'scrap');show(W[2],'counter');if(done&&g.room.id===cfg.road){b.fillStyle='#96d697';b.fillRect(W[2].x-3,W[2].y-2,2,2);b.fillRect(W[2].x+1,W[2].y-2,2,2);glyph(b,'scrap',W[2].x+15+Math.sin(t/30)*7,W[2].y,t,col);}}
 if(q.id==='neighbours'){if(!done&&s.step===0)show(W[0],'pot');if(!done&&s.step===1){if(s.parked)show(W[1][0],'pot');show(W[1][1],'tea');}if(s.delivered||done){if(g.room.id===cfg.road){b.strokeStyle=col;b.beginPath();b.moveTo(W[2].x,W[2].y);b.lineTo(W[2].x+14,W[2].y-4-Math.sin(t/30)*2);b.stroke();glyph(b,'tea',W[2].x+7,W[2].y-4,t,col);}}}
 if(q.id==='sailors'){if(!done&&s.step===0)show(W[0][s.perch],'charm');if(!done&&s.step===1){show(W[1],'charm');if(g.room.id===cfg.rooms[1]&&g.p.hook){b.strokeStyle=col;b.beginPath();b.moveTo(g.p.x+4,ctx.uprightY(g)+4);b.lineTo(g.p.hook.ring.x+4,g.p.hook.ring.y+4);b.lineTo(g.p.hook.ring.x+12,g.room.h);b.stroke();}}if(s.npc?.room===g.room.id&&s.step>=2&&!done){const a=s.npc;if(a.hook){b.strokeStyle=col;b.beginPath();b.moveTo(a.x,a.y);b.lineTo(a.hook.x,a.hook.y);b.stroke();}(root.BladefallClimbArt?.person)(b,a.x,a.y+6,'apprentice',t,a.f||1,false);if(s.half)glyph(b,'charm',a.x-5,a.y,t,col);}}
 if(s.held&&!done)glyph(b,s.held,g.p.x-3,ctx.uprightY(g)+1,t,col);
 if(s.hold>0&&!done){b.fillStyle='#fff0c0';b.font='6px monospace';b.textAlign='center';const max=q.id==='quota'?230:q.id==='sailors'?60:16;b.fillText(Math.min(100,Math.floor(s.hold/max*100))+'%',g.p.x+4,ctx.uprightY(g)-6);}
 if(q.id==='recruit'&&s.step===2&&!done&&s.npc?.room===g.room.id){const a=s.npc;(root.BladefallClimbArt?.person)(b,a.x,a.y+6,'recruit',t,1,false);}
}
function line(q,done,who){if(!handles(q))return null;const s=state(q.id),Q=data(q.id);
 if(done&&!s.replay)return Q.ascendDone;
 if(q.id==='quota'&&who==='breaker')return s.step>=2?'Same white mark. I will hold the chute while you work the catch.':'Mark the piece, then follow it. Hands clear of the stamp.';
 if(q.id==='neighbours'&&who==='neighbour2')return s.step>=2?'I have this end. Tip the tray gently.':'Park the pot before turning. His down is not my down.';
 return Q.ascendLines[Math.min(2,s.step)];}
function hideDecor(room,pr){if(ctx?.st?.watching||ctx?.st?.view.replay)return false;return room===CONFIG.cartographer.road&&pr.k==='desk'&&state('cartographer').done||room===CONFIG.neighbours.road&&pr.k==='tea-table'&&state('neighbours').delivered;}
function hud(q){if(!handles(q))return null;const s=state(q.id),labels={cartographer:['Ride the drafts after the ribbon','Steady the ribbon at the upper funnel','Bring the reading · ring the Choir chimes'],recruit:['Recover the helmet up the tower','Bring the split helmet to the Recruit','Cross together · '+s.visits.length+'/3 shelters'],quota:['Mark and catch the moving scrap','Carry the same mark through the cooling loft',s.fed?'Hold the catch for one stamp':'Feed the marked piece to the side counter'],neighbours:['Turn the room · catch the caddy',s.parked?'Turn over for the cups':'Park the pot before turning',s.delivered?'Cross while they tip the tray':'Bring the pot and cups to the landing'],sailors:['Follow the charm on the hooks','Hold the upper hook · take the strain','Bring the sailor down · split the charm at the cleat']};return labels[q.id][Math.min(2,s.step)];}
function replay(q){if(!handles(q))return false;delete read()[q.id];const s=state(q.id);s.replay=true;save();return true;}
function replaying(q){return handles(q)&&!!state(q.id).replay;}
function consumeReplayAward(q){if(!handles(q))return false;const s=state(q.id),yes=!!s.replayAward;if(yes){delete s.replayAward;save();}return yes;}
root.BladefallClimbRound2=Object.freeze({CONFIG,KEY,handles,tick,draw,line,hud,where,state,reset,pose,spot,follow,hideDecor,replay,replaying,consumeReplayAward});
})(typeof globalThis!=='undefined'?globalThis:window);
