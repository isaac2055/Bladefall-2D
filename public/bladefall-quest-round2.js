/* Physical Explore adaptations of the five approved stories. Quest props are noncolliding.
   Surface skins paint existing floors; the level's platforms, hazards and physics are never replaced. */
(function(root){
'use strict';
const D=root.BladefallQuestRound2Stories.stories;
const CONFIG={
 cartographer:{actor:[8540,105],points:{intake:[6220,340],funnel:[6800,520],chimes:[7050,0]},ribbon:[[7370,430],[7940,570],[8520,105]]},
 recruit:{actor:[5920,0],points:{helmet:[6730,340],end:[6990,0],brace:[7200,0],clear:[7440,0]},shelters:[6100,6500]},
 quota:{actor:[8350,640],points:{tag:[6760,640],outlet:[7760,640],cradle:[8180,640]}},
 neighbors:{actor:[9250,180],points:{caddy:[8850,414],park:[9720,414],cups:[9720,180],entry:[9720,180],exit:[9320,474]}},
 sailors:{actor:[700,100],points:{cleat:[760,100]},rings:['ring-ship','ring-1','ring-0']}
};
const handles=id=>!!CONFIG[id];
const current=()=>typeof G!=='undefined'&&G?.sideStoryScene&&handles(G.sideStoryScene.id)?G.sideStoryScene:null;
const row=id=>root.BladefallSideStories.row(root.BladefallSideStoryWorld.state(),id);
const actor=id=>G.obstacles.find(o=>o.sideStory===id&&o.sideStoryRole==='actor');
const others=id=>G.obstacles.filter(o=>o.sideStory===id&&o.sideStoryRole==='support');
const near=(p,a,rx=65,ry=75)=>Math.abs(p.x-a[0])<rx&&Math.min(Math.abs(p.y-a[1]),Math.abs(p.y+(p.h||0)-a[1]))<ry;
const feet=p=>G.gravityFlipped?p.y+p.h:p.y;
const lerp=(a,b,t)=>a+(b-a)*t;
function obj(id,kind,at,extra={}){return {type:'sideStoryProp',sideStory:id,sideStoryRole:'errand',round2:true,kind,x:at[0],y:at[1],w:28,h:30,...extra};}
function add(id,kind,at,extra){const o=obj(id,kind,at,{actShip:id==='sailors'?1:undefined,...extra});G.obstacles.push(o);return o;}
function skin(id,at,w=90){return add(id,'slate',at,{surfaceSkin:true,slate:1,w});}
function sound(name='quest'){root.BladefallSfx?.play(name);}
function tell(text,at){const sc=current();if(!sc)return;sc.questBeat={time:G.time,x:at?.[0]??G.p.x,y:at?.[1]??G.p.y,text};sound();}
function finish(task,at){const sc=current(),q=D[sc.id];const t=typeof task==='number'?q.tasks[task].id:task;return root.BladefallSideStoryWorld.completeTask(sc.id,t,{x:at[0],y:at[1]});}
function memo(id){const all=G._round2||(G._round2={});return all[id]||(all[id]={revision:2,held:null,perch:0,charge:0,walk:0,trail:[],flip:!!G.gravityFlipped,blood:G.p.blood});}
function install(q,scene){
 if(!handles(q.id)||q.stage!==G.stageIndex||typeof watchLike==='function'&&watchLike())return false;
 G.obstacles=G.obstacles.filter(o=>o.sideStory!==q.id||['actor','support','scene','reward'].includes(o.sideStoryRole));
 if(G.lportals)delete G.lportals['side-story-wind'];
 scene.waitsFor=q.id==='cartographer'?'portal-single':q.id==='sailors'?'chain-hook':null;scene.escort=null;scene.rescue=null;
 const cfg=CONFIG[q.id],a=actor(q.id),off=q.id==='sailors'?(G.actTwo?.shipOff||0):0;
 scene.base={x:cfg.actor[0]+off,y:cfg.actor[1],dir:1};Object.assign(a,{x:scene.base.x,y:scene.base.y,baseX:scene.base.x,baseY:scene.base.y});
 const m=memo(q.id),saved=row(q.id);scene.round2=m;
 if(saved.step>0&&q.id==='quota')m.tagged=true;
 if(saved.step>=2&&q.id==='neighbors'){m.parked=true;m.cups=true;}
 if(saved.step>=1&&q.id==='sailors')m.perch=2;
 if(saved.step>=2&&q.id==='recruit'){a.x=6990;m.returned=true;}
 // Keep only the real supporting characters; no duplicated upstairs neighbour.
 const supports=others(q.id);for(const o of supports.slice(1))G.obstacles.splice(G.obstacles.indexOf(o),1);
 for(const [key,at] of Object.entries(cfg.points))add(q.id,key,[at[0]+off,at[1]]);
 if(q.id==='cartographer'){
  for(const k of ['intake','funnel'])skin(q.id,cfg.points[k]);
  add(q.id,'ribbon',cfg.ribbon[m.perch]||cfg.ribbon.at(-1));
  // The receiver is a fixed mouth; the player places its entry on a painted existing shelf.
  const mouth={type:'lportal',sideStory:q.id,sideStoryRole:'round2-mouth',round2:true,x:6800,y:520,nx:0,ny:1,anchor:1,anchorRange:2400,t:0,col:'#9fe0ff',pg:'round2-choir'};
  G.obstacles.push(mouth);G.lportals['round2-choir']=[mouth];
 }
 if(q.id==='quota'){add(q.id,'scrap',cfg.points.tag);add(q.id,'divert',cfg.points.tag);}
 if(q.id==='neighbors'){
  const upper=supports[0];if(upper)Object.assign(upper,{x:9320,y:474,perchX:9320,perchY:474,inverted:true,round2:true});
  add(q.id,'pot',saved.step>=2?cfg.points.park:cfg.points.caddy);add(q.id,'cupsItem',cfg.points.cups);
 }
 if(q.id==='sailors'){
  const rings=cfg.rings.map(id=>G.obstacles.find(o=>o.actId===id)),ring=rings[m.perch]||rings.at(-1);
  add(q.id,'charm',[ring.x,ring.y-15],{actShip:0});
  add(q.id,'tension',[rings.at(-1).x,rings.at(-1).y],{actShip:0});
  const sailor=supports[0],last=rings.at(-1);if(sailor)Object.assign(sailor,{x:last.x,y:last.y-58,perchX:last.x,perchY:last.y-58,round2:true,actShip:0});
  scene.shipOffset=off;
 }
 const targets={cartographer:['intake','ribbon','chimes'],recruit:['helmet','end','brace'],quota:['tag','divert','cradle'],neighbors:['caddy','cups','park'],sailors:['charm','tension','cleat']}[q.id];
 targets.forEach((kind,i)=>{const o=G.obstacles.find(o=>o.sideStory===q.id&&o.kind===kind&&!o.task);if(o){o.task=q.tasks[i].id;o.index=i;}});
 // Reward and scene props follow the real giver, on an existing floor.
 for(const o of G.obstacles.filter(o=>o.sideStory===q.id&&['scene','reward'].includes(o.sideStoryRole))){o.x=a.x-(o.sideStoryRole==='reward'?90:40);o.y=a.y;}
 sync();return true;
}
function prop(sc,kind){return G.obstacles.find(o=>o.sideStory===sc.id&&o.kind===kind);}
function at(sc,key){const o=prop(sc,key);return [o.x,o.y];}
function sync(){
 const sc=current();if(!sc?.round2)return;
 const r=row(sc.id),m=sc.round2,a=actor(sc.id),done=r.phase==='completed';
 for(const o of G.obstacles.filter(o=>o.sideStory===sc.id)){
  o.storyPhase=r.phase;o.storyStep=r.step;
  if(o.sideStoryRole==='reward')o.gone=!done||r.claimed;
  if(o.task)o.storyDone=r.step>o.index||done;
 }
 if(done){m.finished=true;if(sc.id==='recruit'){a.x=7440;a.y=0;}if(sc.id==='sailors'&&sc.revisit){const s=others(sc.id)[0];if(s){s.x=a.x+60;s.y=a.y;s.seated=true;}}}
 if(done){const gift=G.obstacles.find(o=>o.sideStory===sc.id&&o.sideStoryRole==='reward');if(gift){gift.x=sc.id==='cartographer'?Math.max(8444,a.x-90):a.x-90;gift.y=a.y;}}
 const mouth=G.obstacles.find(o=>o.sideStory===sc.id&&o.sideStoryRole==='round2-mouth');
 if(mouth){const p=CONFIG.cartographer.points[r.step>=2?'chimes':'funnel'];mouth.x=p[0];mouth.y=p[1];mouth.gone=r.phase!=='active';}
}
/* A surface decal is considered only while standing on its already-existing floor.
   It has no collision box and cannot become a new foothold or change a recorded route. */
function slate(p){const sc=current();if(!sc||row(sc.id).phase!=='active'||typeof watchLike==='function'&&watchLike()||!p.onGround)return null;return G.obstacles.find(o=>o.sideStory===sc.id&&o.surfaceSkin&&!o.gone&&Math.abs(p.x-o.x)<o.w/2&&Math.abs(feet(p)-o.y)<12)||null;}
function link(from,to){
 return typeof portalPairs==='function'&&portalPairs().some(pair=>{
  const n=(m,a)=>Math.hypot(m.x-a[0],m.y-a[1])<65;
  return n(pair.a,from)&&n(pair.b,to)||!pair.oneWay&&n(pair.b,from)&&n(pair.a,to);
 });
}
function held(sc,item){sc.round2.held=item;}
function move(o,to,speed,dt){const d=Math.hypot(to[0]-o.x,to[1]-o.y);if(d<1)return true;const k=Math.min(1,speed*dt/d);o.x=lerp(o.x,to[0],k);o.y=lerp(o.y,to[1],k);o.openingWalking=true;return k===1;}
function walkWork(sc,dt){
 const r=row(sc.id),m=sc.round2,a=actor(sc.id),workers=others(sc.id);
 if(sc.id==='cartographer'&&(r.phase==='ready'||r.phase==='completed'))move(a,[8495,105],35,dt);
 if(sc.id==='quota'&&r.step>=2){if(workers[0])move(workers[0],[8220,640],100,dt);if(r.phase==='completed'){move(a,[8275,640],75,dt);a.seated=true;if(workers[0])workers[0].seated=true;}}
 if(sc.id==='neighbors'&&r.step>=2){move(a,[9440,180],45,dt);if(workers[0])move(workers[0],[9380,474],30,dt);}
 if(sc.id==='sailors'&&r.step>=1){const off=G.actTwo?.shipOff||0;move(a,[810+off,100],80,dt);if(r.phase==='completed'&&workers[0]){move(workers[0],[a.x+60,100],65,dt);workers[0].seated=true;}}
}
function update(dt){
 const sc=current();if(!sc?.round2||mode!=='play'||typeof watchLike==='function'&&watchLike())return;
 const m=sc.round2,r=row(sc.id),p=G.p;
 const hit=p.blood<m.blood||p.dead;m.blood=p.blood;
 const strike=p.swingT>0&&!p.pogoSwing&&!p.upSlashSwing,newStrike=strike&&!m.strike;m.strike=strike;
 const flip=!!G.gravityFlipped,flipped=flip!==m.flip;m.flip=flip;
 walkWork(sc,dt);
 if(r.phase!=='active')return;
 if(hit){m.charge=0;if(m.held&&sc.id!=='neighbors'){m.held=null;tell('DROPPED · RETURN TO THE LAST CATCH');}if(sc.id==='sailors'){m.trail=[];m.following=false;}}
 if(sc.id==='cartographer')cartographer(sc,m,r,dt,newStrike);
 if(sc.id==='recruit')recruit(sc,m,r,dt,newStrike);
 if(sc.id==='quota')quota(sc,m,r,dt,newStrike);
 if(sc.id==='neighbors')neighbors(sc,m,r,dt,newStrike,flipped);
 if(sc.id==='sailors')sailors(sc,m,r,dt,newStrike);
 sync();
}
function cartographer(sc,m,r,dt,strike){
 const cfg=CONFIG.cartographer,p=G.p;
 if(r.step===0){const connected=link(at(sc,'intake'),at(sc,'funnel'));m.flow=connected;m.charge=connected?Math.min(1.4,m.charge+dt):0;if(m.charge>=1.4){m.charge=0;finish(0,at(sc,'funnel'));tell('THE RIBBON TEARS FREE · FOLLOW IT EAST',at(sc,'funnel'));}}
 if(r.step===1){const ribbon=prop(sc,'ribbon'),to=cfg.ribbon[m.perch],gust=(G.time%3.6)<2.0;
  move(ribbon,to,gust?240:95,dt);ribbon.y=to[1]+Math.sin(G.time*3)*12;
  if(near(p,[ribbon.x,ribbon.y],m.perch===2?75:135,95)&&!gust){if(m.perch<2){m.perch++;sound('gust');}else{m.held='ribbon';finish(1,[ribbon.x,ribbon.y]);tell('A DIFFERENT RHYTHM · RETURN TO THE FUNNEL');}}
 }
 if(r.step===2){m.flow=link(at(sc,'funnel'),at(sc,'chimes'));const beat=(G.time%2.4)<1.1;m.bright=beat;
  if(strike&&near(p,at(sc,'chimes'),90,100)){if(m.flow&&beat){finish(2,at(sc,'chimes'));m.held=null;}else tell(m.flow?'WAIT FOR THE RIBBON’S BRIGHT BEAT':'LINK THE FUNNEL TO THE CHIMES FIRST');}}
}
function recruit(sc,m,r,dt,strike){
 const p=G.p,a=actor(sc.id),cfg=CONFIG.recruit;
 if(r.step===0&&near(p,at(sc,'helmet'))){m.held='helmet';finish(0,at(sc,'helmet'));tell('A HOLE THROUGH THE CROWN · BRING IT BACK');}
 if(r.step===1){
  if(!m.returned&&near(p,[a.x,a.y],85,90)){m.returned=true;m.held=null;tell('IT WILL NOT STOP A SHOT · WALK TOGETHER');}
  const sniper=G.enemies.find(e=>e.watchSniper&&!e.dead&&Math.abs(e.x-a.x)<1250);
  const warning=!!sniper&&sniper.railAimT>0,danger=G.projectiles.some(pr=>pr.watchShot&&Math.abs(pr.x-a.x)<160&&Math.abs(pr.y-a.y-25)<65);m.volley=danger;m.warning=warning;
  // Existing moving mantlets are the cover; the quest never redirects a road projectile.
  if(m.returned&&Math.abs(p.vx)>35&&Math.abs(p.x-a.x)<300){
   const cover=cfg.shelters.find(x=>Math.abs(a.x-x)<85);
   if(danger&&!cover){if(!m.volleyHit){m.volleyHit=true;move(a,[Math.max(5920,a.x-90),0],800,dt);tell('VOLLEY · WAIT BENEATH THE SHIELD',[a.x,a.y]);}}
   else move(a,[cfg.points.end[0],0],Math.max(180,Math.abs(p.vx)),dt);
  }
  if(!danger)m.volleyHit=false;
  if(a.x>=cfg.points.end[0]-2&&near(p,[a.x,0],120,90)){m.held='helmet';finish(1,[a.x,a.y]);}
 }
 if(r.step===2){const b=at(sc,'brace');
  if(strike&&near(p,b,90,90)&&!m.braced){m.braced=true;m.held=null;m.shot=0;tell('HELMET BRACED · WAIT FOR THE SHOT',b);}
  if(m.braced&&!m.rang){m.shot+=dt;if(m.shot>1.8){m.rang=true;sound('clang');tell('A CLEAN HOLE · CROSS TO THE FAR POST',b);}}
  if(m.rang){move(a,cfg.points.clear,210,dt);if(near(p,cfg.points.clear,90,90)&&a.x>=cfg.points.clear[0]-2)finish(2,b);}
 }
}
function quota(sc,m,r,dt,strike){
 const p=G.p,cfg=CONFIG.quota,scrap=prop(sc,'scrap');
 if(r.step===0&&strike&&near(p,at(sc,'tag'),85,90)){m.tagged=true;m.scrapT=0;finish(0,at(sc,'tag'));}
 if(r.step===1){m.scrapT=(m.scrapT||0)+dt;const u=Math.min(1,m.scrapT/3);scrap.x=lerp(6880,6760,u);scrap.y=640;
  m.flow=link(at(sc,'tag'),at(sc,'outlet'));
  if(u>=1&&m.flow){scrap.x=7760;finish(1,at(sc,'outlet'));m.scrapT=0;tell('THE SAME WHITE MARK · CATCH IT AT THE RETURN',[7760,640]);}}
 if(r.step===2){
  if(!m.held&&!m.seated){m.scrapT=(m.scrapT||0)+dt;const k=(m.scrapT%4)/4;scrap.x=7760+Math.sin(k*Math.PI*2)*95;scrap.y=640;
   if(near(p,[scrap.x,scrap.y],50,70)){m.held='scrap';tell('PROOF PIECE CAUGHT · TO THE MAINTENANCE CRADLE');}}
  if(m.held==='scrap'&&near(p,at(sc,'cradle'),60,75)){m.held=null;m.seated=true;m.charge=0;tell('HOLD THE CATCH · ONE STAMP CYCLE',at(sc,'cradle'));}
  if(m.seated){m.charge=near(p,at(sc,'cradle'),70,75)&&Math.abs(p.vx)<45?m.charge+dt:0;if(m.charge>=2.4)finish(2,at(sc,'cradle'));}
 }
}
function neighbors(sc,m,r,dt,strike,flipped){
 const p=G.p,pot=prop(sc,'pot'),cfg=CONFIG.neighbors;
 if(r.step===0){m.roll=(m.roll||0)+dt;pot.x=8850+Math.sin(m.roll*.8)*180;pot.y=414;
  if(G.gravityFlipped&&near(p,[pot.x,pot.y],60,65)){m.held='pot';finish(0,[pot.x,pot.y]);m.roll=0;}
  if(m.roll>8){m.roll=0;tell('THE CADDY ROLLS BACK · TURN AND CATCH IT',[8850,414]);}}
 if(r.step===1){
  if(flipped&&m.held==='pot'){m.held=null;m.parked=false;pot.x=8850;pot.y=414;tell('SPILLED · THE POT IS BACK ON THE SHELF',[8850,414]);}
  if(!m.held&&!m.parked&&G.gravityFlipped&&near(p,[pot.x,pot.y],60,65))m.held='pot';
  if(strike&&m.held==='pot'&&near(p,at(sc,'park'),85,80)){m.held=null;m.parked=true;pot.x=9720;pot.y=414;tell('POT PARKED · TURN OVER FOR THE CUPS',at(sc,'park'));}
  if(m.parked&&!G.gravityFlipped&&near(p,at(sc,'cups'),60,65)){m.cups=true;finish(1,at(sc,'cups'));tell('CUPS SAFE · LINK THE TWO PALE TABLE SURFACES');}
 }
 if(r.step===2){m.flow=link(at(sc,'entry'),at(sc,'exit'))||link(at(sc,'exit'),at(sc,'entry'));
  if(strike&&near(p,at(sc,'park'),100,90)){if(m.flow){m.slide=.001;sound('page');}else tell('LINK THE TWO EXISTING PALE SURFACES FIRST');}
  if(m.slide){m.slide+=dt;const k=Math.min(1,m.slide/1.6),a=k<.5?at(sc,'park'):at(sc,'exit'),b=k<.5?at(sc,'entry'):[9380,474];pot.x=lerp(a[0],b[0],(k%0.5)*2);pot.y=lerp(a[1],b[1],(k%0.5)*2);if(k>=1){m.slide=0;finish(2,at(sc,'exit'));}}
 }
}
function sailors(sc,m,r,dt,strike){
 const p=G.p,sailor=others(sc.id)[0],off=G.actTwo?.shipOff||0,charm=prop(sc,'charm');
 const ringObjects=CONFIG.sailors.rings.map(id=>G.obstacles.find(o=>o.actId===id));
 const rings=ringObjects.map(o=>[o.x,o.y]);
 Object.assign(prop(sc,'tension'),{x:rings[2][0],y:rings[2][1]});
 if(ringObjects.some(o=>o.gone)){m.waitingHarbour=true;return;}m.waitingHarbour=false;
 if(sailor&&r.step<2){sailor.x=rings.at(-1)[0];sailor.y=rings.at(-1)[1]-58;}
 const hook=p.actHook,ring=hook?.ring;
 if(r.step===1){charm.x=rings[2][0];charm.y=rings[2][1]-15;}
 if(r.step===0){const target=rings[m.perch];charm.x=target[0]+Math.sin(G.time*1.5)*12;charm.y=target[1]-15;
  if(ring&&Math.hypot(ring.x-target[0],ring.y-target[1])<50){if(m.perch<2){m.perch++;sound('chain');}else{finish(0,target);m.charge=0;tell('SOMEONE ON THE LINE · HOLD THE LAST HOOK',target);}}
 }
 if(r.step===1){const target=rings[2];m.charge=ring&&Math.hypot(ring.x-target[0],ring.y-target[1])<50?m.charge+dt:0;
  if(m.charge>=1.05){m.following=true;m.trail=[];finish(1,target);tell('LINE TAUT · BRING THE SAILOR DOWN',target);}}
 if(r.step===2&&sailor){
  if(!m.following&&Math.hypot(p.x-sailor.x,p.y-sailor.y)<180)m.following=true;
  if(m.following){
   const tail=m.trail.at(-1);if(!tail||Math.hypot(tail[0]-p.x,tail[1]-p.y)>8)m.trail.push([p.x,p.y,p.actHook?.ring?.x,p.actHook?.ring?.y]);
   if(m.trail.length){const to=m.trail[0];sailor.hookX=to[2];sailor.hookY=to[3];if(move(sailor,to,220,dt))m.trail.shift();}
  }
  const cleat=at(sc,'cleat');if(strike&&near(p,cleat,90,90)&&near(sailor,cleat,120,100)){m.half=true;finish(2,cleat);}
 }
}
function draw(c,o,q,r){
 if(!handles(q.id))return false;
 if(o.sideStoryRole==='scene'){drawScene(c,q,r);return true;}
 if(!o.round2||o.sideStoryRole!=='errand')return false;
 const sc=current();if(!sc)return true;const m=sc.round2,done=r.phase==='completed',t=G.time;
 const active=r.phase==='active',step=r.step;let show=true;
 if(['intake','funnel','chimes'].includes(o.kind))show=q.id==='cartographer';
 if(o.kind==='ribbon')show=active&&step===1;
 if(o.kind==='helmet')show=active&&step===0;
 if(o.kind==='scrap')show=active&&step<3||done;
 if(o.kind==='cupsItem')show=active&&step===1&&!m.cups;
 if(o.kind==='pot'&&m.held==='pot')show=false;
 if(o.kind==='charm')show=active&&step<2&&!m.waitingHarbour;
 if(!show)return true;
 c.save();c.translate(o.x,GROUND_Y-o.y);c.lineWidth=2;c.strokeStyle=q.accent;c.fillStyle=q.accent;
 const box=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 if(o.surfaceSkin){box(-o.w/2,-2,o.w,3,'#c4e1e8');for(let x=-o.w/2+5;x<o.w/2;x+=15)box(x,-6,4,4,'#9fe0ff');}
 else if(o.kind==='ribbon'){c.beginPath();c.moveTo(-20,-20);for(let i=0;i<7;i++)c.lineTo(-20+i*8,-20+Math.sin(t*5+i)*10);c.stroke();}
 else if(o.kind==='funnel'){c.beginPath();c.moveTo(-22,-55);c.lineTo(0,-22);c.lineTo(22,-55);c.closePath();c.stroke();box(-3,-22,6,20,'#9fe0ff');}
 else if(o.kind==='chimes'){for(let i=0;i<4;i++){box(-22+i*13,-70,3,35+i*6,m.bright?'#fff2b0':'#9fe0ff');}box(-26,-72,52,4,'#725d43');}
 else if(['helmet','brace'].includes(o.kind)){box(-13,-24,26,14,'#9e947c');box(-17,-10,34,5,'#d8b875');if(o.kind==='brace'&&m.braced||m.returned)box(0,-22,7,8,'#15181c');}
 else if(o.kind==='scrap'){box(-12,-16,24,13,'#766861');if(m.tagged)box(-5,-14,10,4,'#fff6d0');}
 else if(o.kind==='tag'||o.kind==='divert'||o.kind==='outlet'||o.kind==='cradle'){box(-30,-7,60,7,'#766861');for(let i=0;i<4;i++)box(-26+i*16+((t*15)%12),-10,6,3,'#a48466');if(o.kind==='cradle'){box(-12,-40,24,22,'#352b29');box(-8,-36,6,10,done?'#95d988':'#da9858');box(2,-36,6,10,done?'#95d988':'#da9858');}}
 else if(o.kind==='pot'){box(-13,-18,26,16,'#c9b3d8');box(-17,-22,34,4,'#eee2be');box(13,-16,9,5,'#c9b3d8');}
 else if(o.kind==='cupsItem'){box(-12,-12,10,12,'#e9dfc7');box(5,-12,10,12,'#e9dfc7');}
 else if(o.kind==='charm'){box(-8,-18,16,12,'#e8c17c');box(-1,-18,2,12,'#8a633d');}
 else if(o.kind==='cleat'){box(-20,-8,40,5,'#ad997c');box(-10,-22,5,16,'#ad997c');box(5,-22,5,16,'#ad997c');}
 else if(['park','entry','exit'].includes(o.kind)){box(-35,-8,70,8,'#92775b');box(-26,-24,52,4,'#baa5e2');}
 c.restore();
 const hints={cartographer:['PLACE A MOUTH ON THE LOWER PALE PANEL','FOLLOW THE RIBBON BETWEEN GUSTS','LINK THE FUNNEL · STRIKE ON THE BRIGHT BEAT'],recruit:['RECOVER THE HELMET','WALK TOGETHER · PAUSE UNDER THE SHIELDS',m.rang?'CROSS TO THE FAR POST':'SET THE HELMET · WAIT FOR THE SHOT'],quota:['STRIKE TO MARK THIS PIECE','LINK THE INTAKE TO THE RETURN',m.seated?'HOLD THE CATCH · '+Math.max(0,2.4-m.charge).toFixed(1)+'s':'CATCH THE MARK · CARRY IT TO THE CRADLE'],neighbors:['TURN THE ROOM · CATCH THE CADDY',m.parked?'TURN OVER FOR THE CUPS':'PARK THE POT BEFORE TURNING','LINK THE PALE SURFACES · SLIDE THE POT'],sailors:['FOLLOW THE FLASHES ON YOUR HOOK','HOLD THE LAST HOOK · '+Math.round(m.charge/1.05*100)+'%','BRING THE SAILOR TO THE CLEAT · STRIKE']}[q.id];
 if(active&&o.task===D[q.id].tasks[step]?.id&&near(G.p,[o.x,o.y],230,230))label(c,o.x,GROUND_Y-o.y-85,hints[step],q.accent);
 if(q.id==='recruit'&&active&&step===1&&o.kind==='end')label(c,G.p.x,GROUND_Y-G.p.y-150,m.warning?'VOLLEY · WAIT UNDER COVER':'CLEAR · WALK TOGETHER',m.warning?'#ffad7d':'#c4e7c4');
 return true;
}
function drawScene(c,q,r){
 const a=actor(q.id),m=current()?.round2;if(!a||!m)return;
 c.save();c.fillStyle='#826849';c.strokeStyle=q.accent;c.lineWidth=2;
 const table=(x,y,w=65)=>{const sy=GROUND_Y-y;c.fillRect(x-w/2,sy-30,w,5);c.fillRect(x-w/2+7,sy-25,4,25);c.fillRect(x+w/2-11,sy-25,4,25);};
 if(q.id==='cartographer'){table(a.x+30,a.y,68);c.fillStyle='#d7ccac';c.fillRect(a.x+3,GROUND_Y-a.y-36,46,6);c.strokeStyle='#7e7659';c.beginPath();c.moveTo(a.x+8,GROUND_Y-a.y-33);c.lineTo(a.x+20,GROUND_Y-a.y-35);c.lineTo(a.x+41,GROUND_Y-a.y-31);c.stroke();}
 if(q.id==='neighbors'){table(a.x,a.y);const upper=others(q.id)[0];if(upper){c.save();c.translate(0,2*(GROUND_Y-upper.y));c.scale(1,-1);table(upper.x,upper.y);c.restore();}}
 if(q.id==='quota'){const b=at(current(),'cradle');table(8290,640,95);c.fillStyle=r.phase==='completed'?'#c6d1a3':'#a28163';c.fillRect(8270,GROUND_Y-640-37,26,7);const y=GROUND_Y-b[1];c.fillStyle='#655951';c.fillRect(b[0]-48,y-96,6,96);c.fillRect(b[0]+42,y-96,6,96);c.fillRect(b[0]-48,y-96,96,8);const dip=m.seated?(Math.sin(G.time*Math.PI/1.2)+1)*16:0;c.fillRect(b[0]-20,y-88+dip,40,12);}
 if(q.id==='recruit'&&m.braced&&!m.rang){const k=Math.min(1,(m.shot||0)/1.8),b=at(current(),'brace');c.fillStyle='#f7dfad';c.fillRect(b[0]-260+k*260,GROUND_Y-b[1]-25,20,2);}
 if(q.id==='sailors'&&r.phase==='completed')table(a.x+65,a.y,105);
 c.restore();
}
function label(c,x,y,text,col){c.save();c.font='bold 12px system-ui';c.textAlign='center';const w=c.measureText(text).width+16;c.fillStyle='rgba(14,16,24,.9)';c.fillRect(x-w/2,y-17,w,26);c.fillStyle=col;c.fillText(text,x,y);c.restore();}
function drawStatus(c){
 const sc=current();if(!sc?.round2)return;const r=row(sc.id),q=root.BladefallSideStories.byId[sc.id],m=sc.round2;
 if(sc.id==='sailors'&&m.waitingHarbour)label(c,G.p.x,GROUND_Y-G.p.y-160,'THE HARBOUR RINGS OPEN AFTER THE CHAIN GATE',q.accent);
 if(m.held){c.save();c.fillStyle=q.accent;c.fillRect(G.p.x-20,GROUND_Y-G.p.y-36,18,14);c.fillStyle='#fff1c8';c.fillRect(G.p.x-17,GROUND_Y-G.p.y-33,8,3);c.restore();}
 if(!['active','ready'].includes(r.phase))return;
 const b=sc.questBeat,ready=r.phase==='ready';
 if(!ready&&(!b||G.time-b.time>=5)){
  let target=G.obstacles.find(o=>o.sideStory===sc.id&&o.task===q.tasks[r.step]?.id),text=q.tasks[r.step]?.label||'';
  if(sc.id==='cartographer'&&r.step===2)target=prop(sc,m.flow?'chimes':'funnel');
  if(sc.id==='recruit'&&r.step===2){target=prop(sc,m.rang?'clear':'brace');text=m.rang?'Cross to the far post':m.braced?'Wait for the next shot':text;}
  if(sc.id==='quota'&&r.step===2){target=prop(sc,m.held||m.seated?'cradle':'scrap');text=m.seated?'Hold the catch for one stamp cycle':m.held?'Carry the proof piece to the cradle':'Catch the marked piece at the return';}
  if(sc.id==='neighbors'&&r.step===1){target=prop(sc,m.parked?'cups':'park');text=m.parked?'Turn over for the cups':'Park the pot before turning';}
  if(sc.id==='neighbors'&&r.step===2){target=prop(sc,m.flow?'park':G.cratePortals?.length?'exit':'entry');text=m.flow?'Strike the parked pot to slide it through':'Link the two pale table surfaces';}
  const arrow=target?Math.abs(target.y-G.p.y)>130?(target.y>G.p.y?'↑ ':'↓ '):Math.abs(target.x-G.p.x)<65?'':target.x<G.p.x?'← ':'→ ':'';
  label(c,G.p.x,GROUND_Y-G.p.y-120,arrow+text.toUpperCase(),q.accent);
 }

 if(ready||b&&G.time-b.time<5){const a=actor(sc.id),text=ready?'✓ DONE · '+(a.x<G.p.x?'← ':'→ ')+'RETURN TO '+q.name.toUpperCase():b.text;label(c,G.p.x,GROUND_Y-G.p.y-120,text,q.accent);
  if(b&&G.time-b.time<2){c.save();c.strokeStyle=q.accent;c.globalAlpha=1-(G.time-b.time)/2;c.beginPath();c.arc(b.x,GROUND_Y-b.y-20,12+(G.time-b.time)*35,0,7);c.stroke();c.restore();}}
 if(sc.id==='sailors'&&r.step===2){const s=others(sc.id)[0];if(s&&Number.isFinite(s.hookX)){c.save();c.strokeStyle=q.accent;c.beginPath();c.moveTo(s.x,GROUND_Y-s.y-30);c.lineTo(s.hookX,GROUND_Y-s.hookY);c.stroke();c.restore();}}
 if(sc.id==='sailors'&&m.charge>0&&r.step===1){c.save();c.strokeStyle=q.accent;c.lineWidth=2;const a=actor(sc.id),s=others(sc.id)[0];c.beginPath();c.moveTo(a.x,GROUND_Y-a.y-35);c.quadraticCurveTo((a.x+s.x)/2,GROUND_Y-s.y+80*(1-m.charge/1.05),s.x,GROUND_Y-s.y-20);c.stroke();c.restore();}
}
root.BladefallRound2Explore=Object.freeze({CONFIG,handles,install,sync,update,draw,drawStatus,slate,link,memo});
})(typeof globalThis!=='undefined'?globalThis:window);
