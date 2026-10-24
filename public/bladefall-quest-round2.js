/* Physical Explore adaptations of the five approved stories. Quest props are noncolliding.
   Surface skins paint existing floors; the level's platforms, hazards and physics are never replaced. */
(function(root){
'use strict';
const D=root.BladefallQuestRound2Stories.stories;
const CONFIG={
 cartographer:{actor:[8455,105],points:{intake:[6220,0],funnel:[6800,520],chimes:[8160,0]},ribbon:[[6800,520],[7120,620],[7370,430],[7650,520],[7940,570],[8180,350],[8520,105]]},
 recruit:{actor:[5920,0],points:{helmet:[6730,340],end:[6990,0],brace:[7060,0],clear:[7440,0]},shelters:[6100,6500]},
 quota:{actor:[8350,640],points:{tag:[7000,640],outlet:[7760,640],cradle:[8030,640]}},
 neighbors:{actor:[8890,180],points:{caddy:[8850,414],park:[9020,414],cups:[9020,180],entry:[9020,180],exit:[8850,414],release:[8940,180],off:[8765,414]}},
 sailors:{actor:[1990,100],points:{cleat:[2050,100]},rings:['ring-ship','ring-1','ring-0']}
};
const handles=id=>!!CONFIG[id];
const current=()=>typeof G!=='undefined'&&G?.sideStoryScene&&handles(G.sideStoryScene.id)&&D[G.sideStoryScene.id].stage===G.stageIndex?G.sideStoryScene:null;
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
function memo(id){const all=G._round2||(G._round2={});return all[id]||(all[id]={revision:3,held:null,perch:0,charge:0,walk:0,trail:[],flip:!!G.gravityFlipped,blood:G.p.blood});}
function install(q,scene){
 if(!handles(q.id)||q.stage!==G.stageIndex||typeof watchLike==='function'&&watchLike())return false;
 G.obstacles=G.obstacles.filter(o=>o.sideStory!==q.id||['actor','support','scene','reward'].includes(o.sideStoryRole));
 if(G.lportals)delete G.lportals['side-story-wind'];
 scene.waitsFor=q.id==='cartographer'?'portal-single':q.id==='sailors'?'chain-hook':null;scene.escort=null;scene.rescue=null;
 const cfg=CONFIG[q.id],a=actor(q.id),off=q.id==='sailors'?(G.actTwo?.shipOff||0):0;
 scene.base={x:cfg.actor[0]+off,y:cfg.actor[1],dir:1};Object.assign(a,{x:scene.base.x,y:scene.base.y,baseX:scene.base.x,baseY:scene.base.y});
 const m=memo(q.id),saved=row(q.id);scene.round2=m;
 if(saved.step>0&&q.id==='quota')m.tagged=true;
 if(saved.step===1&&q.id==='recruit'&&!m.returned)m.held='helmet';
 if(saved.step>=2&&q.id==='neighbors'){m.parked=true;m.cups=true;}
 if(saved.step>=1&&q.id==='sailors')m.perch=2;
 if(saved.step>=2&&q.id==='recruit'){m.helmetDropped=true;}
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
 if(q.id==='quota'){skin(q.id,cfg.points.tag);add(q.id,'scrap',cfg.points.tag);add(q.id,'divert',cfg.points.tag);}
 if(q.id==='neighbors'){
  skin(q.id,cfg.points.entry);
  const upper=supports[0];if(upper)Object.assign(upper,{x:8850,y:414,perchX:8850,perchY:414,inverted:true,round2:true});
  add(q.id,'pot',saved.step>=2?cfg.points.entry:cfg.points.caddy);add(q.id,'cupsItem',cfg.points.cups);
 }
 if(q.id==='sailors'){
  const rings=cfg.rings.map(id=>G.obstacles.find(o=>o.actId===id)),ring=rings[m.perch]||rings.at(-1);
  add(q.id,'charm',[ring.x,ring.y-15],{actShip:0});
  add(q.id,'tension',[rings.at(-1).x,rings.at(-1).y],{actShip:0});
  const sailor=supports[0],last=rings.at(-1),safe=saved.step>=2&&saved.phase==='active'?m.sailorSafe:null;if(sailor)Object.assign(sailor,{x:safe?.x??last.x,y:safe?.y??last.y-58,hookX:safe?.hookX,hookY:safe?.hookY,perchX:last.x,perchY:last.y-58,round2:true,actShip:0});
  if(saved.step===2&&saved.phase==='active'){m.following=false;m.trail=[];}
  scene.shipOffset=off;
 }
 const targets={cartographer:['funnel','ribbon','chimes'],recruit:['helmet','end','clear'],quota:['tag','divert','cradle'],neighbors:['caddy','cups','entry'],sailors:['charm','tension','cleat']}[q.id];
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
 if(sc.id==='quota'&&r.step>0)m.tagged=true;
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
 if(sc.id==='cartographer'){if(r.step>=2){const funnel=prop(sc,'funnel');funnel.y=Math.max(0,funnel.y-160*dt);const decal=G.obstacles.find(o=>o.sideStory===sc.id&&o.surfaceSkin&&o.x===6800);if(decal)decal.y=0;}if(r.phase==='ready'||r.phase==='completed')move(a,[8470,105],35,dt);}
 if(sc.id==='quota'&&r.step>=2){if(workers[0])move(workers[0],[8220,640],100,dt);if(r.phase==='completed'){move(a,[8275,640],75,dt);a.seated=true;if(workers[0])workers[0].seated=true;}}
 if(sc.id==='neighbors'&&r.step>=2){move(a,[8960,180],45,dt);if(workers[0])move(workers[0],[8890,414],30,dt);}
 if(sc.id==='sailors'&&r.step>=1){const off=G.actTwo?.shipOff||0;move(a,[2100+off,100],80,dt);if(r.phase==='completed'&&workers[0]){move(workers[0],[a.x+60,100],65,dt);workers[0].seated=true;}}
}
function update(dt){
 const sc=current();if(!sc?.round2||mode!=='play'||typeof watchLike==='function'&&watchLike())return;
 const m=sc.round2,r=row(sc.id),p=G.p;
 const hit=p.blood<m.blood||p.dead;m.blood=p.blood;
 const strike=p.weapon?.cls==='melee'&&p.swingT>0&&!p.pogoSwing&&!p.upSlashSwing,newStrike=strike&&p.swingId!==m.swingId;m.swingId=p.swingId;m.strike=strike;
 const flip=!!G.gravityFlipped,flipped=flip!==m.flip;m.flip=flip;
 walkWork(sc,dt);
 if(r.phase!=='active')return;
 m.time=(m.time||0)+dt;
 if(hit){m.charge=0;if(m.held&&sc.id==='quota'){m.held=null;tell('DROPPED · RETURN TO THE LAST CATCH');}if(sc.id==='sailors'){m.trail=[];m.following=false;const s=others(sc.id)[0];if(s&&m.sailorSafe)Object.assign(s,m.sailorSafe);tell('SAILOR WAITING ON THE LINE · GO BACK FOR THEM');}}
 if(sc.id==='cartographer')cartographer(sc,m,r,dt,newStrike);
 if(sc.id==='recruit')recruit(sc,m,r,dt,newStrike);
 if(sc.id==='quota')quota(sc,m,r,dt,newStrike);
 if(sc.id==='neighbors')neighbors(sc,m,r,dt,newStrike,flipped);
 if(sc.id==='sailors')sailors(sc,m,r,dt,newStrike);
 sync();
}
function cartographer(sc,m,r,dt,strike){
 const cfg=CONFIG.cartographer,p=G.p;
 if(r.step===0){m.flow=link(at(sc,'intake'),at(sc,'funnel'));m.charge=m.flow?Math.min(2,m.charge+dt):0;
  if(m.charge>=2&&strike&&near(p,at(sc,'funnel'),85,85)){m.charge=0;m.perch=0;finish(0,at(sc,'funnel'));tell('FUNNEL OPEN · THE RIBBON BLOWS EAST',at(sc,'funnel'));}}
 if(r.step===1){const ribbon=prop(sc,'ribbon'),to=cfg.ribbon[m.perch],gust=(G.time%3.6)<2.0;
  move(ribbon,to,gust?240:95,dt);ribbon.y=to[1]+Math.sin(G.time*3)*12;m.perchAge=(m.perchAge||0)+dt;
  if(m.perchAge>1.2&&near(p,[ribbon.x,ribbon.y],65,75)&&!gust){if(m.perch<cfg.ribbon.length-1){m.perch++;m.perchAge=0;sound('gust');}else{m.held='ribbon';m.notes=0;finish(1,[ribbon.x,ribbon.y]);tell('RIBBON CAUGHT · FUNNEL WINCH LOWERING');}}
 }
 if(r.step===2){m.flow=link(at(sc,'funnel'),at(sc,'chimes'));const cycle=Math.floor(G.time/2.4),phase=G.time%2.4;m.bright=phase>=1.6&&phase<1.96&&!(m.muteUntil>G.time);
  if(strike&&near(p,at(sc,'chimes'),90,100)){
   if(m.flow&&m.bright&&m.lastNote!==cycle){m.notes=(m.notes||0)+1;m.lastNote=cycle;sound('clang');tell('CLEAR NOTE · '+m.notes+'/3',at(sc,'chimes'));if(m.notes>=3){finish(2,at(sc,'chimes'));m.held=null;}}
   else{m.notes=0;m.muteUntil=G.time+2.4;tell(m.flow?'DISCORD · NOTES RESET · WAIT FOR GOLD':'NO WIND · LINK THE FUNNEL TO THE CHIMES');}
  }}
}
function recruit(sc,m,r,dt,strike){
 const p=G.p,a=actor(sc.id),cfg=CONFIG.recruit,helmet=prop(sc,'helmet');
 if(r.step===0){
  if(!m.helmetDropped&&Math.abs(p.x-helmet.x)<650){m.helmetDropped=true;m.helmetVy=0;tell('THE HELMET SLIPS OFF THE SHELF · CATCH IT BELOW',[helmet.x,helmet.y]);}
  if(m.helmetDropped){m.helmetVy=(m.helmetVy||0)-500*dt;helmet.y=Math.max(0,helmet.y+m.helmetVy*dt);}
  if(m.helmetDropped&&near(p,[helmet.x,helmet.y],50,65)){m.held='helmet';finish(0,[helmet.x,helmet.y]);tell('A HOLE THROUGH THE CROWN · BRING IT BACK');}}
 if(r.step===1){
  if(!m.returned&&near(p,[a.x,a.y],85,90)){m.returned=true;m.held=null;tell('IT WILL NOT STOP A SHOT · WALK TOGETHER');}
  const sniper=G.enemies.find(e=>e.gateMechanismSniper&&!e.dead);
  const warning=!!sniper&&sniper.railAimT>0,danger=G.projectiles.some(pr=>pr.watchShot&&Math.abs(pr.x-a.x)<160&&Math.abs(pr.y-a.y-25)<65);m.volley=danger;m.warning=warning;
  if(m.returned&&Math.abs(p.vx)>35&&Math.abs(p.x-a.x)<300){
   const cover=cfg.shelters.find(x=>Math.abs(a.x-x)<85);
   if(danger&&!cover){if(!m.volleyHit){m.volleyHit=true;move(a,[Math.max(5920,a.x-90),0],800,dt);tell('VOLLEY · WAIT BENEATH THE SHIELD',[a.x,a.y]);}}
   else move(a,cfg.points.end,Math.max(180,Math.abs(p.vx)),dt);
  }
  if(!danger)m.volleyHit=false;
  if(a.x>=cfg.points.end[0]-2&&near(p,[a.x,0],120,90)){m.held='helmet';finish(1,[a.x,a.y]);tell('USE THE HELMET AS A DECOY · DRAW A SHOT BEFORE CROSSING');}}
 if(r.step===2){const b=at(sc,'brace');
  if(strike&&near(p,b,90,90)&&!m.braced){m.braced=true;m.held=null;const sniper=G.enemies.find(e=>e.gateMechanismSniper);if(sniper){sniper.railAimT=0;sniper.watchCooldown=Math.min(sniper.watchCooldown||0,.4);}tell('DECOY SET · WAIT FOR THE SNIPER TO HIT IT',b);}
  if(m.rang&&G.time>=m.reloadUntil){m.rang=false;tell('RELOAD OVER · WAIT FOR THE DECOY TO RING AGAIN',b);}
  if(m.rang&&p.x>b[0]+35&&Math.abs(p.x-a.x)<500){move(a,[Math.min(cfg.points.clear[0],p.x+8),0],Math.max(280,Math.abs(p.vx)),dt);if(near(p,cfg.points.clear,85,85)&&a.x>=cfg.points.clear[0]-2)finish(2,b);}
 }
}
function quota(sc,m,r,dt,strike){
 const p=G.p,cfg=CONFIG.quota,scrap=prop(sc,'scrap'),inlet=at(sc,'tag');
 if(r.step===0){m.scrapT=(m.scrapT||0)+dt;scrap.x=inlet[0]+Math.sin(m.scrapT*1.2)*105;scrap.y=inlet[1];
  const dx=(scrap.x-p.x)*p.face;
  if(strike&&dx>0&&dx<85&&near(p,[scrap.x,scrap.y],85,65)){m.tagged=true;m.scrapT=0;m.inlet=G.cratePortals?.find(o=>Math.hypot(o.x-inlet[0],o.y-inlet[1])<65);finish(0,[scrap.x,scrap.y]);tell('WHITE MARK · OPEN THE INTAKE AS IT PASSES');}}
 if(r.step===1){m.scrapT=(m.scrapT||0)+dt;const phase=(m.scrapT%3.6)/3.6;scrap.x=inlet[0]-180+phase*360;scrap.y=inlet[1];
  m.flow=link(inlet,at(sc,'outlet'));const mouth=G.cratePortals?.find(o=>Math.hypot(o.x-inlet[0],o.y-inlet[1])<65);
  if(mouth&&mouth!==m.inlet){m.inlet=mouth;const lap=Math.floor(m.scrapT/3.6);if(m.pulseLap!==lap){m.pulseLap=lap;m.valveUntil=G.time+.32;m.missed=false;}else tell('DIVERTER REARMING · WAIT FOR THE NEXT WHITE MARK');}
  if(!mouth)m.inlet=null;
  if(m.valveUntil&&m.valveUntil<G.time&&!m.missed){m.missed=true;tell('MISSED THE WHITE MARK · WAIT FOR THE NEXT LAP');}
  if(m.flow&&m.valveUntil>G.time&&Math.abs(scrap.x-inlet[0])<28){scrap.x=cfg.points.outlet[0];m.scrapT=0;finish(1,at(sc,'outlet'));tell('RETURN CHUTE · CATCH THE SAME WHITE MARK');}}
 if(r.step===2){
  if(!m.held&&!m.seated){m.scrapT=(m.scrapT||0)+dt;const k=(m.scrapT%3.2)/3.2;scrap.x=cfg.points.outlet[0]+Math.sin(k*Math.PI*2)*105;scrap.y=640;
   if(keyPressedFor('pickup')&&near(p,[scrap.x,scrap.y],45,65)){m.held='scrap';tell('WHITE MARK CAUGHT · CARRY IT TO THE CATCH');}}
  if(m.held==='scrap'&&near(p,at(sc,'cradle'),60,75)&&keyPressedFor('pickup')){m.held=null;m.seated=true;m.charge=0;tell('PIECE SEATED · HOLD THE CATCH FOR ONE STAMP',at(sc,'cradle'));}
  if(m.seated){m.charge=near(p,at(sc,'cradle'),65,75)&&Math.abs(p.vx)<45&&keyDownFor('pickup')?m.charge+dt:0;if(m.charge>=2.4)finish(2,at(sc,'cradle'));}
 }
}
function neighbors(sc,m,r,dt,strike,flipped){
 const p=G.p,pot=prop(sc,'pot'),cfg=CONFIG.neighbors;
 if(r.step===0){m.roll=(m.roll||0)+dt;pot.x=8850+Math.sin(m.roll*.8)*150;pot.y=414;
  if(G.gravityFlipped&&near(p,[pot.x,pot.y],55,65)){m.held='pot';finish(0,[pot.x,pot.y]);m.roll=0;tell('POT CAUGHT · PARK IT BEFORE YOU TURN OVER');}
  if(m.roll>8)m.roll=0;}
 if(r.step===1){
  if(flipped&&m.held==='pot'){m.held=null;m.parked=false;pot.x=8850;pot.y=414;tell('SPILLED · CATCH THE CADDY ON THE SHELF AGAIN',[8850,414]);}
  if(!m.held&&!m.parked&&G.gravityFlipped&&near(p,[pot.x,pot.y],55,65))m.held='pot';
  if(strike&&m.held==='pot'&&near(p,at(sc,'park'),80,80)){m.held=null;m.parked=true;pot.x=cfg.points.park[0];pot.y=cfg.points.park[1];tell('POT CLOSED AND PARKED · TURN OVER FOR THE CUPS',at(sc,'park'));}
  if(m.parked&&!G.gravityFlipped&&near(p,at(sc,'cups'),55,65)){m.cups=true;m.held='cups';m.lower=.001;finish(1,at(sc,'cups'));tell('CUPS SAFE · THE CLOSED POT LOWERS TO YOUR TABLE');}}
 if(r.step===2){
  if(m.lower){m.lower+=dt;const k=Math.min(1,m.lower/.9);pot.x=cfg.points.entry[0];pot.y=lerp(cfg.points.park[1],cfg.points.entry[1],k);if(k>=1)m.lower=0;}
  m.flow=link(at(sc,'entry'),at(sc,'exit'))||link(at(sc,'exit'),at(sc,'entry'));
  if(strike&&!m.lower&&near(p,at(sc,'entry'),90,80)){if(m.flow){m.slide=.001;sound('page');}else tell('LINK YOUR PALE TABLE TO HERS FIRST');}
  if(m.slide){m.slide+=dt;const k=Math.min(1,m.slide/1.2),from=k<.5?at(sc,'entry'):at(sc,'exit'),to=k<.5?at(sc,'entry'):[8890,414];pot.x=lerp(from[0],to[0],(k%0.5)*2);pot.y=from[1];if(k>=1){m.slide=0;m.held=null;pot.x=8890;pot.y=414;finish(2,at(sc,'exit'));}}
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
  if(m.charge>=1.05){m.following=true;m.trail=[];m.sailorSafe={x:sailor.x,y:sailor.y,hookX:target[0],hookY:target[1]};finish(1,target);tell('LINE TAUT · BRING THE SAILOR DOWN',target);}}
 if(r.step===2&&sailor){
  if(!m.following&&Math.hypot(p.x-sailor.x,p.y-sailor.y)<180)m.following=true;
  if(m.following){
   const tail=m.trail.at(-1);if(!tail||Math.hypot(tail[0]-p.x,tail[1]-p.y)>8)m.trail.push([p.x,p.y,p.actHook?.ring?.x,p.actHook?.ring?.y]);
   if(m.trail.length){const to=m.trail[0];sailor.hookX=to[2];sailor.hookY=to[3];if(move(sailor,to,220,dt))m.trail.shift();
    const floor=typeof getFloor==='function'?getFloor(sailor.x,sailor.y):null;if(Number.isFinite(sailor.hookX)||floor&&Math.abs(floor.y-sailor.y)<8)m.sailorSafe={x:sailor.x,y:sailor.y,hookX:sailor.hookX,hookY:sailor.hookY};}
  }
  const cleat=at(sc,'cleat');if(strike&&near(p,cleat,90,90)&&near(sailor,cleat,120,100)){m.half=true;finish(2,cleat);}
 }
}
// These hooks are local to the optional Explore scene and are inert under Watch.
function protectedEnemy(e){return current()?.id==='recruit'&&e.gateMechanismSniper&&!(typeof watchLike==='function'&&watchLike());}
function aimTarget(e){const sc=current();if(sc?.id!=='recruit'||!sc.round2?.braced||sc.round2.rang||row(sc.id).step!==2||row(sc.id).phase!=='active'||!protectedEnemy(e))return null;const b=prop(sc,'brace');return {x:b.x,y:b.y,h:40,w:30,vx:0,vy:0,face:1};}
function catchShot(pr,x,y){const sc=current();if(sc?.id!=='recruit'||!sc.round2?.braced||sc.round2.rang||row(sc.id).step!==2||!pr.watchShot||pr.reflected||pr.life<=0)return false;
 const b=prop(sc,'brace'),dx=pr.x-x,dy=pr.y-y,t=Math.max(0,Math.min(1,((b.x-x)*dx+(b.y+20-y)*dy)/(dx*dx+dy*dy||1)));
 if(Math.hypot(x+dx*t-b.x,y+dy*t-b.y-20)>25)return false;
 pr.life=0;const m=sc.round2;m.rang=true;m.reloadUntil=G.time+3.2;sound('clang');tell('THE DECOY DRAWS THE SHOT · CROSS DURING THE RELOAD',[b.x,b.y]);return true;
}
function prepareStart(id){
 const q=root.BladefallSideStories.byId[id];if(!G?.levelSelectMode||!handles(id)||G.stageIndex!==q.stage)return false;
 G.questPreview=id;G.playtestResumed=true;G.leaderboardEligible=false;
 // A local optional-quest preview: no campaign clear, boss reward or movement cheat is granted.
 if(id==='cartographer'){grantPermanentCapability('portal-single','quest-preview',{quiet:true});restoreUpdraftsReturnGear();}
 if(id==='neighbors')grantPermanentCapability('gravity-flip','quest-preview',{quiet:true});
 if(id==='sailors')grantPermanentCapability('chain-hook','quest-preview',{quiet:true});
 restorePreviewWorld();
 BladefallSideStoryWorld.install();BladefallSideStoryWorld.apply();const a=actor(id);
 Object.assign(G.p,{x:a.x+(id==='sailors'?35:-25),y:a.y,vx:0,vy:0,onGround:true});G.p.floorPlat=null;G.usedTestMode=false;
 G.cam=Math.max(0,G.p.x-VW*.45);G.camY=Math.max(0,G.p.y-220);BFCamera.reset(G.cam,G.camY);
 activateRuntimeCheckpoint('quest-preview:'+id,{x:G.p.x,y:G.p.y},'rest',null,true);
 root.BladefallPlaytest?.invalidate('optional quest preview');showStationNotice('Optional quest · talk to '+q.name+' · normal movement',3600);return true;
}
function restorePreviewWorld(){const id=G?.questPreview;if(!G?.levelSelectMode||!handles(id)||G.stageIndex!==root.BladefallSideStories.byId[id].stage)return false;
 G.stageBanner=0;
 const circuits={cartographer:['choir-kindled','choir-damper','wind-gate-1'],quota:['ember-draw'],neighbors:['inv-keel','inv-lock']}[id]||[];
 G.persistentCircuits=G.persistentCircuits||{};for(const c of circuits)G.persistentCircuits[c]=true;
 for(const o of G.obstacles){if(circuits.includes(o.id)){o.timer=1e9;o.pressed=true;}if(circuits.includes(o.circuit)&&o.type==='door')o._aiOpen=true;}
 if(id==='sailors'){
  Object.assign(G.actTwo,{released:true,docked:true,leg:5,shipOff:0,harbourOff:0,shoveT:9});
  for(const o of G.obstacles){if(o.actHarbour)o.x=o.fx;if(o.type==='actRing'&&!o.towRing)o.gone=false;}
 }
 return true;
}
function keyName(action){const code=typeof kbCode==='function'?kbCode(action):action;return code==='Space'?'SPACE':code.replace(/^Key/,'').replace('Arrow','').toUpperCase();}
function objective(sc,r){const m=sc.round2,K=keyName,step=r.step;
 const lookup={
  cartographer:step===0?[m.flow?'funnel':'intake',m.charge>=2?K('attack')+' · Open the filled funnel':m.flow?'Wind filling funnel · '+Math.round(m.charge/2*100)+'%':K('portal')+' · Place the entry on the lower BLUE INTAKE',m.flow?'Hop onto the blue mouth to reach the funnel’s fixed exit':'Route wind to the ribbon · the funnel above holds the fixed exit']:
   step===1?['ribbon','Catch the ribbon between gusts · '+((m.perch||0)+1)+'/7','Hold '+K('jump')+' for the regional flight harness · land on shelves to refill']:
   [m.flow?'chimes':'funnel',m.flow?(m.muteUntil>G.time?'Discord · wait for gold':K('attack')+' once on GOLD · '+(m.notes||0)+'/3 clear notes'):K('portal')+' on the lowered funnel · send wind to the chimes','Wrong strikes reset the tune · keep time with the ribbon'],
  recruit:step===0?['helmet','Recover the falling helmet below the sniper','The shelf is too high · the loose helmet falls to the road']:
   step===1?[m.returned?'end':null,m.returned?'Walk beside the Recruit · stop under cover':'Bring the split helmet back to the Recruit','The sniper is armoured · cross between its volleys']:
   [m.rang?'clear':'brace',m.rang?'GO · cross together · '+Math.max(0,m.reloadUntil-G.time).toFixed(1)+'s reload':m.braced?'Wait for a REAL shot to hit the decoy':K('attack')+' · Set the helmet on the decoy catch','Draw the sniper’s aim away from your final crossing'],
  quota:step===0?['scrap',K('attack')+' · Strike the moving scrap to mark it white','Prove whether both workers are counting the same piece']:
   step===1?['tag',K('portal')+' as the WHITE MARK crosses the intake','One brief opening per lap · early presses and a held link will miss']:
   [m.held||m.seated?'cradle':'scrap',m.seated?'HOLD '+K('pickup')+' · one stamp · '+Math.round(m.charge/2.4*100)+'%':m.held?K('pickup')+' · Seat the white piece in the catch':K('pickup')+' · Catch the moving white piece','Carry the same mark through both counters · no duplicate piece'],
  neighbors:step===0?['pot',K('flip')+' to turn over · catch the rolling pot','Tea for two neighbors living on opposite floors']:
   step===1?[m.parked?'cups':m.held?'park':'pot',m.parked?K('flip')+' · Turn back for the cups':m.held?K('attack')+' · Park and close the pot before turning':K('flip')+' · Catch the spilled pot again','An open pot spills when you flip · close it in the bracket first']:
   [m.flow?(G.gravityFlipped?'off':'release'):G.cratePortals?.length?'exit':'entry',m.lower?'The closed pot lowers to your table':m.flow?(G.gravityFlipped?'Step LEFT off the mouth · '+K('flip')+' to return':K('attack')+' from the LEFT · Slide the closed pot through'):K('portal')+' · Link your pale table to hers','Step off the mouths before turning · the pot goes through, you stay beside it'],
  sailors:step===0?['charm',K('jump')+' to jump · '+K('hook')+' to hook the glowing ring','Follow the gold flash · jump toward the next ring before hooking again']:
   step===1?['tension',K('hook')+' · Stay hooked at the gold flash · '+Math.round(m.charge/1.05*100)+'%','Take the strain so the stranded sailor can free their safety line']:
   [m.following?'cleat':'person',m.following?'Lead the sailor back · '+K('attack')+' at the deck cleat':K('hook')+' · Return to the waiting sailor','Wait for the sailor beside you before splitting the charm']
 };
 const [kind,text,why]=lookup[sc.id],target=kind==='person'?others(sc.id)[0]:kind?prop(sc,kind):actor(sc.id);return {target,text,why};
}
function draw(c,o,q,r){
 if(!handles(q.id))return false;
 if(o.sideStoryRole==='scene'){drawScene(c,q,r);return true;}
 if(!o.round2||o.sideStoryRole!=='errand')return false;
 const sc=current();if(!sc)return true;const m=sc.round2,done=r.phase==='completed',t=G.time;
 const active=r.phase==='active',step=r.step;let show=!['divert','caddy','cups','end','clear','tension'].includes(o.kind);
 if(['intake','funnel','chimes'].includes(o.kind))show=q.id==='cartographer';
 if(o.kind==='ribbon')show=active&&step===1;
 if(o.kind==='helmet')show=active&&step===0;
 if(o.kind==='scrap')show=active&&step<3&&!m.held&&!m.seated||done;
 if(o.surfaceSkin&&!active)show=false;
 if(o.kind==='cupsItem')show=active&&step===1&&!m.cups;
 if(o.kind==='pot'&&m.held==='pot')show=false;
 if(o.kind==='charm')show=active&&step<2&&!m.waitingHarbour;
 if(!show)return true;
 c.save();const x=done&&o.kind==='scrap'?7000+(G.time*75)%1030:o.x;c.translate(x,GROUND_Y-o.y);c.lineWidth=2;c.strokeStyle=q.accent;c.fillStyle=q.accent;
 const box=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 if(o.surfaceSkin){box(-o.w/2,-2,o.w,3,'#c4e1e8');for(let x=-o.w/2+5;x<o.w/2;x+=15)box(x,-6,4,4,'#9fe0ff');}
 else if(o.kind==='ribbon'){c.beginPath();c.moveTo(-20,-20);for(let i=0;i<7;i++)c.lineTo(-20+i*8,-20+Math.sin(t*5+i)*10);c.stroke();}
 else if(o.kind==='funnel'){if(r.step>=2){c.strokeStyle='#796d58';c.beginPath();c.moveTo(0,-Math.max(0,520-o.y));c.lineTo(0,-55);c.stroke();c.strokeStyle=q.accent;}c.beginPath();c.moveTo(-22,-55);c.lineTo(0,-22);c.lineTo(22,-55);c.closePath();c.stroke();box(-3,-22,6,20,'#9fe0ff');box(-18,-53,36,Math.min(25,(m.charge||0)*12),'#75c9dc');box(19,-18,12,5,m.charge>=2?'#b8eeac':'#89775d');}
 else if(o.kind==='chimes'){for(let i=0;i<4;i++){box(-22+i*13,-70,3,35+i*6,m.bright?'#fff2b0':'#9fe0ff');}box(-26,-72,52,4,'#725d43');for(let i=0;i<3;i++)box(-19+i*16,-88,10,7,i<(m.notes||0)?'#e9d986':m.muteUntil>G.time?'#ac6c65':'#384652');}
 else if(['helmet','brace'].includes(o.kind)){if(o.kind==='brace'&&!m.braced){box(-16,-8,32,5,'#836c4e');box(-3,-22,6,22,'#a08b64');}else{box(-13,-24,26,14,'#9e947c');box(-17,-10,34,5,'#d8b875');if(o.kind==='brace'&&m.braced||m.returned)box(0,-22,7,8,'#15181c');}}
 else if(o.kind==='scrap'){box(-12,-16,24,13,'#766861');if(m.tagged)box(-5,-14,10,4,'#fff6d0');}
 else if(o.kind==='tag'||o.kind==='divert'||o.kind==='outlet'||o.kind==='cradle'){box(o.kind==='tag'?-180:-30,-7,o.kind==='tag'?360:60,7,'#766861');if(o.kind==='tag'){box(-7,-54,14,32,m.valveUntil>G.time?'#aee3b1':'#8b7770');box(25,-36,9,9,m.tagged?'#95d988':'#da9858');}for(let i=0;i<4;i++)box(-26+i*16+((t*15)%12),-10,6,3,'#a48466');if(o.kind==='cradle'){if(m.seated&&!done){box(-12,-17,24,9,'#766861');box(-5,-15,10,3,'#fff6d0');}box(-12,-40,24,22,'#352b29');box(-8,-36,6,10,done?'#95d988':'#da9858');box(2,-36,6,10,done?'#95d988':'#da9858');}}
 else if(o.kind==='pot'){box(-13,-18,26,16,'#c9b3d8');box(-17,-22,34,4,'#eee2be');box(13,-16,9,5,'#c9b3d8');}
 else if(o.kind==='cupsItem'){box(-12,-12,10,12,'#e9dfc7');box(5,-12,10,12,'#e9dfc7');}
 else if(o.kind==='charm'){box(-8,-18,16,12,'#e8c17c');box(-1,-18,2,12,'#8a633d');}
 else if(o.kind==='cleat'){box(-20,-8,40,5,'#ad997c');box(-10,-22,5,16,'#ad997c');box(5,-22,5,16,'#ad997c');}
 else if(['park','entry','exit'].includes(o.kind)){box(-35,-8,70,8,'#92775b');box(-26,-24,52,4,'#baa5e2');}
 c.restore();
 return true;
}
function drawScene(c,q,r){
 const a=actor(q.id),m=current()?.round2;if(!a||!m)return;
 c.save();c.fillStyle='#826849';c.strokeStyle=q.accent;c.lineWidth=2;
 const table=(x,y,w=65)=>{const sy=GROUND_Y-y;c.fillRect(x-w/2,sy-30,w,5);c.fillRect(x-w/2+7,sy-25,4,25);c.fillRect(x+w/2-11,sy-25,4,25);};
 if(q.id==='cartographer'){table(a.x+30,a.y,68);c.fillStyle='#d7ccac';c.fillRect(a.x+3,GROUND_Y-a.y-36,46,6);c.strokeStyle='#7e7659';c.beginPath();c.moveTo(a.x+8,GROUND_Y-a.y-33);c.lineTo(a.x+20,GROUND_Y-a.y-35);c.lineTo(a.x+41,GROUND_Y-a.y-31);c.stroke();}
 if(q.id==='neighbors'){table(a.x,a.y);const upper=others(q.id)[0];if(upper){c.save();c.translate(0,2*(GROUND_Y-upper.y));c.scale(1,-1);table(upper.x,upper.y);c.restore();}}
 if(q.id==='quota'){const b=at(current(),'cradle');table(8290,640,95);c.fillStyle=r.phase==='completed'?'#c6d1a3':'#a28163';c.fillRect(8270,GROUND_Y-640-37,26,7);const y=GROUND_Y-b[1];c.fillStyle='#655951';c.fillRect(b[0]-48,y-96,6,96);c.fillRect(b[0]+42,y-96,6,96);c.fillRect(b[0]-48,y-96,96,8);const dip=m.seated?(Math.sin(G.time*Math.PI/1.2)+1)*16:0;c.fillRect(b[0]-20,y-88+dip,40,12);}

 if(q.id==='sailors'&&r.phase==='completed')table(a.x+65,a.y,105);
 c.restore();
}
function label(c,x,y,text,col){
 c.save();c.font='bold 12px system-ui';c.textAlign='center';const rows=[],words=String(text).split(' ');let row='';
 for(const word of words){const next=row?row+' '+word:word;if(row&&c.measureText(next).width>400){rows.push(row);row=word;}else row=next;}if(row)rows.push(row);
 const w=Math.max(...rows.map(line=>c.measureText(line).width))+16;c.fillStyle='rgba(14,16,24,.92)';c.fillRect(x-w/2,y-17,w,26+(rows.length-1)*15);c.fillStyle=col;rows.forEach((line,i)=>c.fillText(line,x,y+i*15));c.restore();
}
function drawStatus(c){
 const sc=current();if(!sc?.round2||typeof watchLike==='function'&&watchLike())return;const r=row(sc.id),q=root.BladefallSideStories.byId[sc.id],m=sc.round2;
 if(!['active','ready'].includes(r.phase))return;
 const b=sc.questBeat,ready=r.phase==='ready',goal=objective(sc,r),target=ready?actor(sc.id):goal.target;
 const arrow=target?Math.abs(target.y-G.p.y)>130?(target.y>G.p.y?'↑ ':'↓ '):Math.abs(target.x-G.p.x)<65?'':target.x<G.p.x?'← ':'→ ':'';
 const text=ready?'✓ DONE · '+arrow+'RETURN TO '+q.name.toUpperCase():arrow+goal.text.toUpperCase();
 label(c,G.p.x,GROUND_Y-G.p.y-150,text,q.accent);
 if(!ready)label(c,G.p.x,GROUND_Y-G.p.y-105,goal.why,'#c8cbd1');
 if(b&&G.time-b.time<3.5)label(c,G.p.x,GROUND_Y-G.p.y-200,b.text,'#fff0ba');
 if(m.held){c.save();c.translate(G.p.x-20,GROUND_Y-G.p.y-26);c.fillStyle=q.accent;
  if(m.held==='helmet'){c.fillStyle='#b3a787';c.fillRect(-4,-12,22,10);c.fillRect(-7,-2,28,4);c.fillStyle='#302d2a';c.fillRect(5,-10,4,6);}
  else if(m.held==='ribbon'){c.strokeStyle='#e9d599';c.lineWidth=3;c.beginPath();c.moveTo(-9,-3);for(let i=0;i<6;i++)c.lineTo(-9+i*5,Math.sin(G.time*4+i)*5);c.stroke();}
  else if(m.held==='pot'){c.fillRect(-5,-12,20,15);c.fillRect(13,-9,8,4);c.fillStyle='#f2e2be';c.fillRect(-7,-15,24,3);}
  else if(m.held==='cups'){c.fillStyle='#e9dfc7';c.fillRect(-7,-9,9,12);c.fillRect(8,-9,9,12);}
  else{c.fillRect(-5,-10,22,15);c.fillStyle='#fff1c8';c.fillRect(-1,-7,10,3);}c.restore();}
 if(sc.id==='cartographer'&&m.flow){const from=at(sc,r.step>=2?'funnel':'intake'),to=at(sc,r.step>=2?'chimes':'funnel');c.save();c.strokeStyle='#9fe0ff';c.setLineDash([8,10]);c.lineDashOffset=-G.time*35;c.beginPath();c.moveTo(from[0],GROUND_Y-from[1]-15);c.quadraticCurveTo((from[0]+to[0])/2,GROUND_Y-Math.max(from[1],to[1])-90,to[0],GROUND_Y-to[1]-30);c.stroke();c.restore();}
 if(sc.id==='sailors'&&r.step===0){const rings=CONFIG.sailors.rings.map(id=>G.obstacles.find(o=>o.actId===id)),next=rings[m.perch];if(next&&!next.gone){c.save();c.strokeStyle='#ffe598';c.lineWidth=3;c.beginPath();c.arc(next.x,GROUND_Y-next.y,23+Math.sin(G.time*5)*4,0,7);c.stroke();c.setLineDash([5,9]);c.beginPath();c.moveTo(G.p.x,GROUND_Y-G.p.y-30);c.lineTo(next.x,GROUND_Y-next.y);c.stroke();c.restore();}}
 if(sc.id==='sailors'&&m.waitingHarbour)label(c,G.p.x,GROUND_Y-G.p.y-189,'HARBOUR RINGS AFTER THE CHAIN GATE · LEVEL SELECT HAS OPTIONAL QUEST START',q.accent);
 if(sc.id==='sailors'&&r.step===2){const person=others(sc.id)[0];if(person&&Number.isFinite(person.hookX)){c.save();c.strokeStyle=q.accent;c.beginPath();c.moveTo(person.x,GROUND_Y-person.y-30);c.lineTo(person.hookX,GROUND_Y-person.hookY);c.stroke();c.restore();}}
}
root.BladefallRound2Explore=Object.freeze({CONFIG,handles,install,sync,update,draw,drawStatus,slate,link,memo,prepareStart,protectedEnemy,aimTarget,catchShot,objective,restorePreviewWorld});
})(typeof globalThis!=='undefined'?globalThis:window);
