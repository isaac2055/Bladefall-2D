/* Thin world adapter for the optional main-game stories. Regional props never enter a bag. */
(function(root){
'use strict';
const S=root.BladefallSideStories;
const RETURN_TASKS=new Set(['hang','table','stove','roof','share','invite','ledger','water','tables','settle']);
const LABELS={bell:'Watch bell',hang:'Camp bell post',lantern:'Lantern',table:'Supper table',gear:'Governor Gear',funnel:'Measuring funnel',chimes:'Wind chimes',helmet:'Lucky helmet',crossing:'Far shelter','volume-one':'First volume','volume-two':'Second volume','volume-three':'Third volume',door:'Service door',lunch:'Lunch parcel',coal:'Coal bucket',stove:'Stove',frost:'Cold channel',settle:'Cool corner',counter:'Quota counters',loop:'Return chute',mould:'Cooling mould',roof:'Birdhouse',service:'Tea service',tables:'Tea tables',release:'Glass release',signal:'All-clear bell',hoist:'Rescue hoist',ledger:'Station ledger',charm:'Stranded sailor',share:'Deck line',candles:'Candle tin',invite:'Soldier by the boat',cup:'Sealed cup',water:'Sable’s water',sack:'Summit bench','shutter-one':'Lower shutter','shutter-two':'Middle shutter','shutter-three':'Upper shutter'};
function active(){return typeof G!=='undefined'&&G&&S.records.some(q=>q.stage===G.stageIndex)&&!G.bossRush;}
let cachedRaw,cachedState;
function state(){const raw=G?.levelSelectMode||G?.coopSession?G.sessionSideStories:meta.sideStories;if(raw!==cachedRaw||!cachedState){cachedRaw=raw;cachedState=S.normalize(raw);}return cachedState;}
function save(value){if(G.levelSelectMode||G.coopSession){G.sessionSideStories=value;if(!G.coopSession&&meta.run)meta.run.sessionSideStories=value;}else meta.sideStories=value;persist();}
function shared(){return !!(G?.coopSession&&typeof NET!=='undefined'&&coopActive());}
function broadcast(ack,receipt){if(shared()&&NET.isHost())netSend({t:'sideStoryState',stage:G.stageIndex,state:state(),revision:G.sideStoryRevision||0,ack:ack||0,receipt:receipt||null,receipts:Object.values(G._sideStoryGuestReceipts||{})});}
function commit(id,event){
 const result=S.reduce(state(),id,event);
 if(result.changed){
  if(shared()&&NET.isGuest()){
   const sequence=(G._sideStorySequence||0)+1;G._sideStorySequence=sequence;
   (G._sideStoryPending||(G._sideStoryPending=[])).push({sequence,id,event});
   netSend({t:'sideStoryEvent',stage:G.stageIndex,sequence,id,event});
  }
  save(result.state);
  if(shared()&&NET.isHost()){G.sideStoryRevision=(G.sideStoryRevision||0)+1;broadcast();}
 }
 // A guest receives the one-use rest only after the host accepts the claim.
 return shared()&&NET.isGuest()?{...result,receipt:null}:result;
}
let dialogueId=null;
function receiveNetwork(m){
 if(!shared()||m.stage!==G.stageIndex)return false;
 if(m.t==='sideStoryScene'&&NET.isGuest()&&G.sideStoryScene?.id===m.id){
  const scene=G.sideStoryScene,actor=G.obstacles.find(o=>o.sideStoryRole==='actor');
  if(scene.escort&&m.escort)Object.assign(scene.escort,m.escort);
  if(scene.rescue&&m.rescue)Object.assign(scene.rescue,m.rescue);
  if(typeof m.revisit==='boolean')scene.revisit=m.revisit;
  apply();if(actor&&Number.isFinite(m.x)&&Number.isFinite(m.y)){actor.x=m.x;actor.y=m.y;}
  return true;
 }
 if(m.t==='sideStoryEvent'&&NET.isHost()){
  const q=S.byId[m.id],event=m.event;
  if(!q||q.stage!==G.stageIndex||!Number.isSafeInteger(m.sequence)||m.sequence<=0||!event||!['visit','choice','task','rescue','claim'].includes(event.type))return false;
  if(m.sequence<=(G._sideStoryReceived||0)){broadcast(m.sequence);return true;}
  G._sideStoryReceived=m.sequence;
  const g=NET.ghost;
  const target=G.obstacles.find(o=>o.sideStory===q.id&&(event.type==='task'?o.task===event.task:event.type==='claim'?o.sideStoryRole==='reward':event.type==='rescue'?o.sideStoryRole==='brace':o.sideStoryRole==='actor'));
  if(!g||g.stage!==G.stageIndex||!target||Math.abs(g.x-target.x)>260||Math.abs(g.y-target.y)>220){broadcast(m.sequence);return false;}
  if(event.type==='task'&&window.BladefallOpeningStories?.requirement(target,S.row(state(),q.id))){broadcast(m.sequence);return false;}
  const safeEvent=event.type==='task'?{type:'task',task:event.task,capabilities:capabilities()}:event;
  const result=S.reduce(state(),q.id,safeEvent);
  if(result.changed){save(result.state);G.sideStoryRevision=(G.sideStoryRevision||0)+1;apply();}
  if(result.receipt)(G._sideStoryGuestReceipts||(G._sideStoryGuestReceipts={}))[q.id]=result.receipt;
  broadcast(m.sequence,result.receipt);
  if(dialogueId===q.id)renderDialogue(q.id);
  return true;
 }
 if(m.t==='sideStoryState'&&NET.isGuest()){
  G._sideStoryAck=Math.max(G._sideStoryAck||0,m.ack||0);
  G._sideStoryPending=(G._sideStoryPending||[]).filter(p=>p.sequence>G._sideStoryAck);
  if((m.revision||0)>=(G.sideStoryRevision||0)){G.sideStoryRevision=m.revision||0;G._sideStoryAuthoritative=S.normalize(m.state);}
  let next=G._sideStoryAuthoritative||state();
  for(const pending of G._sideStoryPending)next=S.reduce(next,pending.id,pending.event).state;
  G.sessionSideStories=next;apply();
  if(dialogueId)renderDialogue(dialogueId);
  receiveRewards(m.receipts||(m.receipt?[m.receipt]:[]),false);
  return true;
 }
 return false;
}
/* What finishing a side story actually gives, said plainly (owner 7.234: "you accept the help offered here"
   didn't say it gave anything). Every story leaves its shortcut ride (bladefall-explore-mounts.js); a few also give
   something to keep: Elsie's supper a vitality fragment, the Archivist a forge seal. (7.375, Isaac: no healing;
   with checkpoints it is pointless.) */
const KEEPS={quota:[{forgeSeals:1},'a forge seal. Spend it at a forge to strengthen your blade'],refuge:[{vitalityFragments:1},'a vitality fragment. Four of them add a measure of Blood'],archivist:[{forgeSeals:1},'a forge seal. Spend it at a forge to strengthen your blade']};
function rideLine(q){const m=Object.values(root.BladefallMounts?.MOUNTS||{}).find(m=>m.story===q?.id);return m?m.name+' is yours: a shortcut across '+(STAGES?.[q.stage]?.name||'this region')+', from the far end once you have walked it.':'';}
function grantReward(q){
 const keep=KEEPS[q?.id];
 if(keep&&typeof grantAuthoredAdvancementBundle==='function'){
  grantAuthoredAdvancementBundle(keep[0],'sidestory:'+q.id);apply();hudUpdate();
  return thanks(q,q.name+' gives you '+keep[1]+'. '+rideLine(q));
 }
 apply();hudUpdate();
 // 7.343: the Bellwing. Its roost goes up by the camp straight away (bladefall-explore-mounts.js).
 if(q?.id==='gatekeeper'&&root.BladefallMounts){root.BladefallMounts.install();
  // (7.359) Three beats: what happens, Rowan's own (voiced) line, and how to use the drake.
  const session=G;BladefallConversation.show({title:'Rowan’s thanks',accent:q.accent,onClose:()=>closeSession(session),lines:[
   {text:'Something bronze drops out of the empty belfry and lands on the bell-post by the camp: the drake that nested over the old bell.',speaker:'Rowan’s thanks',portrait:null},
   {text:'A drake roosted over that bell. Followed it all the way down. It’ll carry you, if you let it.',speaker:'Rowan'},
   {text:'The Bellwing roosts by the camp. Press Up at its roost to fly to the Mothlight Door, and back; hold the way you are flying to hurry it.',speaker:'The Bellwing',portrait:null}]});mode='conversation';return true;}
 return thanks(q,rideLine(q)||(q?.name||'They')+' thanks you.');
}
/* (7.360) What the reward is, then the giver's own (voiced) line about it, when they have one. */
function thanks(q,what){
 const line=q?.rewardLine;if(!line)return inspect((q?.name||'A friend')+'’s thanks',what);
 const [who,t]=Array.isArray(line)?line:[q.name,line],session=G;
 BladefallConversation.show({title:(q.name||'A friend')+'’s thanks',accent:q.accent,onClose:()=>closeSession(session),
  lines:[{text:what,speaker:(q.name||'A friend')+'’s thanks',portrait:null},{text:t,speaker:who}]});
 mode='conversation';return true;
}
function receiveRewards(receipts,quiet=true){
 if(!G?.coopSession||!NET.isGuest()||!Array.isArray(receipts))return;
 const received=G._sideStoryReceivedRewards||(G._sideStoryReceivedRewards={});let healed=false;
 for(const receipt of receipts){
  if(!S.byId[receipt?.id]||receipt.scope!=='regional'||receipt.value!==2||received[receipt.id]||!S.row(state(),receipt.id).claimed)continue;
  received[receipt.id]=true;healed=true;
 }
 if(healed){hudUpdate();if(!quiet)inspect('A friend’s thanks','Their shortcut is open to you both.');}
}
function capabilities(){return ['weapon','dash','portal-single','portal-pair','wall-jump','downward-strike','gravity-flip','chain-hook'].filter(id=>hasCapability(id)).concat(typeof echoVerbAvailable==='function'&&echoVerbAvailable()?['echo']:[]);}
function closeSession(session){if(G!==session)return;dialogueId=null;mode='play';G.outskirtsAnnotation=null;BFKeyboard.clearPressed();showGameUI(true);hudUpdate();}
function panel(title,text,choices,accent,lines){const session=G;BladefallConversation.show({title,text,lines:lines||undefined,accent,onClose:()=>closeSession(session),choices:choices&&choices.length?choices:undefined});mode='conversation';document.getElementById('bosshpwrap')?.classList.remove('on');}
function renderDialogue(id){
 const v=S.view(state(),id);if(!v)return false;
 const record=S.row(state(),id);
 if(id==='recruit'&&!S.byId[id].revision&&!record.rescued){if(record.node==='ready')v.text='Wait. Where’s my helmet? I didn’t even notice it go.';if(record.node==='ending')v.text=record.route==='medium'?S.plain(S.byId.recruit.longEnding):'My helmet? Oh, for… again? Could we still go back for it?';}
 if(v.lines){commit(id,{type:'heard'});apply();}   // the first return's exchange, heard once
 panel(v.title,v.text,v.choices.map(c=>({label:c.label,action:()=>{
   const result=commit(id,{type:'choice',choice:c.id});if(result.error)return;
   apply();
   renderDialogue(id);
 }})),v.accent,v.lines);dialogueId=id;return true;
}
function inspect(title,text){panel(title,text,undefined,'#ccbfa7');return true;}
function supportingFloor(x,y){return G.obstacles.filter(o=>o.type==='plat'&&!o.gone&&!o.ceiling&&!o.fake&&!o.crumble&&!o.gate&&o.w>=100&&x>=o.x-o.w/2+25&&x<=o.x+o.w/2-25).sort((a,b)=>Math.abs(a.y-y)-Math.abs(b.y-y))[0];}
function install(){
 if(!active())return;
 let q=S.records.find(q=>q.stage===G.stageIndex);
 // Recorded routes keep the exact old background props; live quests replace these with noncolliding scenes.
 if(q.watchTasks&&typeof watchLike==='function'&&watchLike())q={...q,tasks:q.watchTasks};
 G.obstacles=G.obstacles.filter(o=>!o.sideStory);
 const rest=G.zoneRestSite||{x:G.p.x,y:G.p.y};
 const dir=[0,6,11].includes(q.stage)?-1:1;
 let x=Math.max(180,Math.min(G.levelLength-650,rest.x+dir*150)),y=rest.y||0;
 // The Citadel refuge is bounded by two existing walls: keep its side climb inside them.
 if(q.id==='figure')x=rest.x-60;
 const floor=supportingFloor(x,y);if(floor)y=floor.y;else{x=rest.x;y=rest.y||0;}
 const custom=(window.BladefallOpeningStories?.layout(q)||window.BladefallCausewayStory?.layout(q));if(custom){x=custom.x;y=custom.y;}
 const base={x,y,dir:custom?.dir||dir};
 const row=S.row(state(),q.id);
 // The Cartographer's work needs the portal gun from the end of the Updrafts. Until then his stairs, frames and
 // anchor stay packed away so Bellows Rest isn't cluttered with a puzzle nobody can touch yet (owner 7.234).
 G.sideStoryScene={id:q.id,base,signal:[],revisit:row.phase==='completed',age:0,waitsFor:q.id==='cartographer'?'portal-single':null};
 const actor={type:'sideStoryActor',sideStory:q.id,sideStoryRole:'actor',x,y,w:34,h:52,name:q.name,title:q.title,accent:q.accent,baseX:x,baseY:y};
 G.obstacles.push(actor);
 // An optional short climb off the refuge floor; no mandatory route is replaced.
 for(let n=1;n<=(q.id==='gatekeeper'?1:3);n++)G.obstacles.push({type:'plat',sideStory:q.id,sideStoryRole:'step',x:x+dir*(10+n*90),y:y+n*56,w:q.id==='figure'&&n>1?80:132,h:16});
 q.tasks.forEach((t,i)=>{
   const low=RETURN_TASKS.has(t.id)||t.id==='door';const tier=Math.min(i+1,3);
   const tx=low?x+dir*(70+i*45):x+dir*(10+tier*90),ty=low?y:y+tier*56;
   G.obstacles.push({type:'sideStoryProp',sideStory:q.id,sideStoryRole:'task',task:t.id,index:i,x:tx,y:ty,w:40,h:46,title:LABELS[t.id]||t.label,accent:q.accent});
 });
 if(q.id==='gatekeeper'){const post=G.obstacles.find(o=>o.sideStory===q.id&&o.task==='hang');post.x=x+110;}
 // These small local walks have continuous support and stay away from boss geometry.
 if(['recruit','miner','defector'].includes(q.id)){
  const destination=x+dir*(q.id==='miner'?-150:q.id==='recruit'?320:160);
  G.sideStoryScene.escort={destination,y,finished:row.phase==='completed',helmetDropped:row.step>1};
  if(q.id==='recruit'){G.sideStoryScene.rescue={t:0,started:row.rescued,done:row.rescued};G.obstacles.push({type:'sideStoryProp',sideStory:q.id,sideStoryRole:'brace',x:x+dir*240,y,w:70,h:160,accent:q.accent});}
  G.obstacles.push({type:'plat',sideStory:q.id,sideStoryRole:'step',x:x+dir*80,y,w:520,h:12});
  const endpoint=G.obstacles.find(o=>o.sideStory===q.id&&o.task===(q.id==='recruit'?'crossing':'ledger'));
  if(endpoint){endpoint.x=destination+(q.id==='miner'?dir*60:0);endpoint.y=y;}
 }
 // Slate belongs to the local puzzle; it does not turn the whole refuge floor into a portal surface.
 const portalTasks=q.tasks.filter(t=>['funnel','chimes','frost','tables'].includes(t.id));
 if(portalTasks.length){
  const source={x:x-dir*35,y};G.sideStoryScene.flowSource=source;
  G.obstacles.push({type:'plat',sideStory:q.id,sideStoryRole:'step',x:source.x,y,w:72,h:4,slate:1});
  for(const t of portalTasks){const prop=G.obstacles.find(o=>o.sideStory===q.id&&o.task===t.id);
   G.obstacles.push({type:'plat',sideStory:q.id,sideStoryRole:'step',x:prop.x,y:prop.y,w:72,h:4,slate:1});}
  if(q.id==='cartographer'){
   const destination=G.obstacles.find(o=>o.sideStory===q.id&&o.task==='funnel');
   const anchor=Object.assign(Anchor(destination.x,destination.y,'floor',{anchorRange:420}),{sideStory:q.id,sideStoryRole:'anchor'});
   G.obstacles.push(anchor);G.lportals={'side-story-wind':[anchor],...G.lportals};G.sideStoryScene.anchor=anchor;
  }
 }
 if(q.id==='figure'){G.sideStoryScene.echoPad={x:x+dir*138,y:y+56};const release=G.obstacles.find(o=>o.task==='release'&&o.sideStory===q.id);release.x=x+dir*280;release.y=y+168;G.obstacles.push({type:'sideStoryProp',sideStory:q.id,sideStoryRole:'echo-contact',x:x+dir*138,y:y+56,w:55,h:6,accent:q.accent});}
 if(q.id==='sailors'){
  // The aft deck ends at x=850; keep the conversation on that deck, not over its drop.
  const share=G.obstacles.find(o=>o.task==='share'&&o.sideStory===q.id);if(share){share.x=x-35;share.y=y;}
  // Leave room between the speaker and the ship’s existing interaction at x=780.
  actor.x+=20;actor.baseX+=20;
  const prop=G.obstacles.find(o=>o.task==='charm'&&o.sideStory===q.id);
  G.obstacles.push({type:'actRing',sideStory:q.id,sideStoryRole:'hook',x:prop.x,y:prop.y+90,w:30,h:30});
 }
 if(q.id==='keeper')G.obstacles.push({type:'wall',sideStory:q.id,sideStoryRole:'gate',x:x+dir*155,y:y+124,w:18,h:68});
 if(q.id==='miner'){
  const prop=G.obstacles.find(o=>o.task==='hoist'&&o.sideStory===q.id);prop.x=x+dir*210;prop.y=y;
  G.obstacles.push({type:'plat',sideStory:q.id,sideStoryRole:'step',x:x+dir*140,y,w:390,h:12});
  G.obstacles.push(Object.assign(Crate(x+dir*90,y),{sideStory:q.id,sideStoryRole:'cart'}));
 }
 // Supporting speakers occupy the places their conversations refer to.
 const support=(name,sx,sy,extra={})=>G.obstacles.push({type:'sideStoryPerson',sideStory:q.id,sideStoryRole:'support',name,x:sx,y:sy,w:30,h:48,accent:q.accent,...extra});
 if(q.id==='birthday'){const p=G.obstacles.find(o=>o.task==='invite'&&o.sideStory===q.id);support('The Soldier',p.x,p.y,{supportKind:'soldier'});}
 if(q.id==='sailors'){const p=G.obstacles.find(o=>o.task==='charm'&&o.sideStory===q.id);support('The Stranded Sailor',p.x,p.y,{supportKind:'sailor',perchX:p.x,perchY:p.y});}
 if(q.id==='neighbors'){support('The Upstairs Neighbor',x+dir*220,y+178,{supportKind:'neighbor',inverted:true});G.obstacles.push({type:'plat',sideStory:q.id,sideStoryRole:'step',x:x+dir*220,y:y+178,w:100,h:10});}
 if(q.id==='alarm'){
  support('The Tired Defender',x-35,y,{supportKind:'defender'});
  support('The Lookout',x-80,y,{supportKind:'defender'});
  const signal=G.obstacles.find(o=>o.sideStory===q.id&&o.task==='signal');
  support('The Volunteer',signal.x+30,signal.y,{supportKind:'volunteer',gone:true});
 }
 if(q.id==='quota')support('The Breaker',x+dir*45,y,{supportKind:'worker'});
 if(q.id==='mother'){
  const sable=G.obstacles.find(o=>o.type==='actSable'),water=G.obstacles.find(o=>o.task==='water'&&o.sideStory===q.id);
  if(sable&&water){water.x=sable.x+50;water.y=sable.y;water.title='Speak with Sable';}
 }
 G.obstacles.push({type:'sideStoryProp',sideStory:q.id,sideStoryRole:'scene',x:q.id==='figure'?x+100:q.id==='gatekeeper'?x-60:x-dir*60,y,w:90,h:60,title:q.title,accent:q.accent});
 G.obstacles.push({type:'sideStoryProp',sideStory:q.id,sideStoryRole:'reward',x:q.id==='figure'?x+140:q.id==='gatekeeper'?x-100:x-dir*100,y,w:32,h:30,title:KEEPS[q.id]?'A gift':'Thanks',accent:q.accent});
 if(q.stage===16){for(const o of G.obstacles)if(o.sideStory===q.id)o.actShip=1;G.sideStoryScene.shipOffset=G.actTwo?.shipOff||0;}
 window.BladefallOpeningStories?.install(q,G.sideStoryScene);
 window.BladefallCausewayStory?.install(q,G.sideStoryScene);
 window.BladefallQuestErrands?.install(q,G.sideStoryScene);   // (7.375) steps you go and do (bladefall-quest-errands.js)
 apply();
}
function syncErrands(){if(G.sideStoryScene?.round2||G.sideStoryScene?.errand)window.BladefallQuestErrands?.sync();}
function waiting(scene,r){return !!scene.waitsFor&&r.phase==='offered'&&!capabilities().includes(scene.waitsFor);}
function apply(){
 if(!active()||!G.sideStoryScene)return;
 const q=S.byId[G.sideStoryScene.id],r=S.row(state(),q.id),scene=G.sideStoryScene;
 const good=r.phase==='completed',bad=r.phase==='harsh';
 scene.waiting=waiting(scene,r);
 if(scene.round2){root.BladefallRound2Explore.sync();return;}
 for(const o of G.obstacles.filter(o=>o.sideStory===q.id)){
  o.storyPhase=r.phase;o.storyStep=r.step;
  if(['step','task','anchor'].includes(o.sideStoryRole)&&scene.waitsFor)o.gone=scene.waiting;
  if(o.sideStoryRole==='reward')o.gone=!good||r.claimed;
  if(o.sideStoryRole==='gate')o.gone=r.step>0&&!bad;
  if(o.sideStoryRole==='anchor'){const target=G.obstacles.find(p=>p.sideStory===q.id&&p.task===(r.step>0?'chimes':'funnel'));if(target){o.x=target.x;o.y=target.y;}}
  if(o.sideStoryRole==='task')o.storyDone=o.index<r.step;
  if(o.sideStoryRole==='support'){
   if(o.supportKind==='sailor'){o.x=r.step>0||bad?scene.base.x+45:o.perchX;o.y=r.step>0||bad?scene.base.y:o.perchY;}
   if(o.supportKind==='defender')o.seated=r.step>0;
   if(o.supportKind==='volunteer')o.gone=!bad;
   if(o.supportKind==='worker')o.seated=good;
   if(o.supportKind==='soldier'){const invited=good||bad;o.x=scene.base.x+(invited?-45:115)*scene.base.dir;o.y=scene.base.y;o.seated=invited;}
  }

  if(o.sideStoryRole==='actor'){
   o.gone=q.id==='refuge'&&good&&scene.revisit;
   let shift=0;if(good&&['gatekeeper','cartographer','archivist','figure','miner'].includes(q.id))shift=70*scene.base.dir;
   if(good&&q.id==='gatekeeper')shift=70;
   if(bad&&['garden','automaton'].includes(q.id))shift=-100*scene.base.dir;
   if(bad&&q.id==='figure')shift=190;
   if(bad&&q.id==='pilgrim')shift=85*scene.base.dir;
   if(scene.escort){
    const walking=q.id==='defector'?good:r.phase==='active'&&r.step===1;
    if(scene.escort.finished||(q.id!=='defector'&&r.step>=2))o.x=scene.escort.destination;
    else if(!walking)o.x=o.baseX+shift;
   }else if(q.stage>1)o.x=o.baseX+shift;
   o.y=o.baseY;
   if(q.id==='refuge'&&good&&scene.revisit)o.gone=true;
  }
 }
 syncErrands();
}
function taskAction(o){
 const q=S.byId[o.sideStory],r=S.row(state(),q.id),t=q.tasks[o.index];
 if(r.phase==='harsh')return inspect(q.name,q.afterHarsh);
 if(r.phase==='offered')return inspect(o.title,'Speak with '+q.name+' before using this.');
 if(o.index<r.step)return inspect(o.title,'This part of the work is done.');
 if(r.phase!=='active'||q.tasks[r.step]?.id!==o.task)return inspect(o.title,'First: '+(q.tasks[r.step]?.label||'return to '+q.name)+'.');
 if(t.capability&&!capabilities().includes(t.capability))return inspect(o.title,t.detail+' Return after learning '+t.capability.replaceAll('-',' ')+'.');
 const unmet=window.BladefallOpeningStories?.requirement(o,r)||window.BladefallCausewayStory?.requirement(o,r)||mechanicRequirement(o);if(unmet)return inspect(o.title,unmet);
 if(o.task==='signal')return ringPanel(o);
 const result=commit(q.id,{type:'task',task:o.task,capabilities:capabilities()});
 if(result.error)return inspect(o.title,t.detail);
 apply();const next=S.row(state(),q.id);
 return inspect(o.title,next.phase==='ready'?'Done. Return to '+q.name+'.':q.tasks[next.step].label+'. '+q.tasks[next.step].detail);
}
function mechanicRequirement(o){
 const scene=G.sideStoryScene;
 if(['crossing','ledger'].includes(o.task)&&!scene.escort?.finished)return o.task==='crossing'?'Stay close to the recruit and walk with him to this shelter.':'Walk back with the miner. He needs time to reach the ledger.';
 if(o.task==='water'&&!G.actTwo?.tapOpen)return 'The spring is still dry. Open the King’s tap above the well before asking Sable to bring water.';
 if(o.task==='gear')return 'Strike the exposed Governor Gear from its maintenance shelf.';
 if(o.task==='mould')return 'Use Downward Strike on the cooling mould.';
 if(['funnel','chimes','frost','tables'].includes(o.task)){
  const source=scene.flowSource;
  const near=(m,p)=>Math.hypot(m.x-p.x,m.y-p.y)<52;
  const linked=portalPairs().some(pair=>(near(pair.a,source)&&near(pair.b,o))||(near(pair.b,source)&&near(pair.a,o)));
  if(!linked)return 'Place a portal on the pale slate by the source, then link it to this slate. The current needs a complete connection.';
 }
 if(o.task==='release'){
  const echo=echoStanding(),pad=scene.echoPad;
  if(!echo||Math.hypot(echo.x-pad.x,echo.y-pad.y)>55)return 'Leave your Echo on the first ledge’s contact, then come back to this release.';
 }
 if(o.task==='service'&&!G.gravityFlipped)return 'Flip gravity to reach the tea service from the neighbors’ ceiling.';
 if(o.task==='charm'&&!scene.hooked)return 'Use your Chainhook on the ring above the stranded sailor.';
 if(o.task==='hoist'){
  const cart=G.obstacles.find(p=>p.sideStory===o.sideStory&&p.sideStoryRole==='cart');
  if(!cart||Math.abs(cart.x-o.x)>48)return 'Push the loaded cart onto the hoist plate, then work the handle.';
 }
 return null;
}
function completePhysicalTask(o){
 const result=commit(o.sideStory,{type:'task',task:o.task,capabilities:capabilities()});
 if(result.changed){apply();addText(o.x,GROUND_Y-o.y-60,'DONE · RETURN WHEN READY',o.accent,false);}
}
function ringPanel(o){
 const scene=G.sideStoryScene,notes=scene.signal;
 const sound=kind=>{
  notes.push(kind);if(meta.soundOn&&typeof SFX!=='undefined')SFX.pickup();
  const expected=['short','short','short','long','long'];
  if(notes.some((n,i)=>n!==expected[i])){scene.signal=[];return inspect(o.title,'The signal is wrong; the alarm is still sounding. Three short notes, then two long notes. Try again.');}
  if(notes.length===5){commit(o.sideStory,{type:'task',task:o.task,capabilities:capabilities()});scene.signal=[];apply();return inspect(o.title,'The warning stops. Below, the defenders lower their weapons. Return to the bellkeeper.');}
  ringPanel(o);
 };
 panel(o.title,(notes.length?'Rung: '+notes.join(', ')+'.\n\n':'')+'All-clear: three short notes, then two long notes.',[
  {label:'Ring a short note.',action:()=>sound('short')},{label:'Ring a long note.',action:()=>sound('long')},{label:'Stop for now.',action:()=>BladefallConversation.close()}
 ],o.accent);return true;
}
function interact(o){
 if(!active()||!o?.sideStory||o.gone)return false;
 if(Math.abs(G.p.x-o.x)>72||Math.abs(G.p.y-o.y)>(o.sideStoryRole==='actor'||o.task==='service'?80:34))return false;
 if(o.sideStoryRole==='actor'){
  if(o.sideStory==='miner'&&G.cartMode){G.sideStoryScene.parkedCart=true;G.cartMode=false;G.p.vx=0;G.p.vy=0;G.p.x=o.x;G.p.y=o.y;}
  if(G.sideStoryScene?.waiting&&o.sideStory==='sailors')return inspect(o.name,'The windlass on the derelict holds the Chainhook. Once the chain gate is clear, the harbour rings will take you up to that charm.');
  if(G.sideStoryScene?.waiting)return inspect(o.name,'I need the wind moved, and a sword can’t do that. There’s a portal gun up at the Crown—if you find it, come back. Please.');
  commit(o.sideStory,{type:'visit'});return renderDialogue(o.sideStory);
 }
 if(o.sideStoryRole==='task')return taskAction(o);
 if(o.sideStoryRole==='reward'){
  const result=commit(o.sideStory,{type:'claim'});if(result.receipt)return grantReward(S.byId[o.sideStory]);
  return false;
 }
 if(o.sideStoryRole==='scene'){const q=S.byId[o.sideStory],r=S.row(state(),q.id);return inspect(q.title,r.phase==='harsh'?q.bad:r.phase==='completed'?q.good:'Someone here could use a hand.');}
 return false;
}
// A story's backdrop is scenery (7.234): as an Up target it sat over Silas and stole his conversation.
function interactable(o){return !!o?.sideStory&&!o.gone&&['actor','task','reward'].includes(o.sideStoryRole);}
function prompt(o){return o.sideStoryRole==='actor'?'↑  TALK · '+o.name:o.sideStoryRole==='reward'?'↑  THANKS':o.sideStoryRole==='scene'?'↑  LOOK':'↑  '+o.title.toUpperCase();}
function update(dt){
 if(!active()||!G.sideStoryScene)return;G.sideStoryScene.age+=dt;
 const scene=G.sideStoryScene,r=S.row(state(),scene.id);const actor=G.obstacles.find(o=>o.sideStoryRole==='actor');
 if(scene.waitsFor&&scene.waiting!==waiting(scene,r))apply();
 if(scene.id==='sailors'){const offset=G.actTwo?.shipOff||0,dx=offset-(scene.shipOffset||0);if(dx){scene.base.x+=dx;for(const o of G.obstacles)if(o.sideStory===scene.id){if(o.baseX!=null)o.baseX+=dx;if(o.perchX!=null)o.perchX+=dx;}scene.shipOffset=offset;}}
 if(G.p.actHook?.ring?.sideStory===scene.id)scene.hooked=true;
 if(scene.parkedCart&&Math.abs(G.p.x-scene.base.x)>440){G.cartMode=true;scene.parkedCart=false;}
 if(r.phase==='active'&&!window.BladefallQuestErrands?.handles(scene.id)){
  const task=S.byId[scene.id].tasks[r.step],o=G.obstacles.find(o=>o.sideStory===scene.id&&o.task===task.id);
  if(o&&Math.abs(G.p.x-o.x)<60){
   if(task.id==='gear'&&G.p.swingT>0&&!G.p.pogoSwing&&!G.p.upSlashSwing&&Math.abs(G.p.y+G.p.h/2-o.y)<55)completePhysicalTask(o);
   if(task.id==='mould'&&G.p.slamming&&G.p.y>=o.y&&G.p.y<o.y+100)completePhysicalTask(o);
  }
 }

 window.BladefallQuestErrands?.update(dt);   // (7.375) both partners do steps; a guest's step goes to the host (commit)
 // The host moves shared followers; the guest sends its own ability/task intentions above.
 if(shared()&&NET.isGuest())return;
 const partner=shared()&&NET.isHost()&&NET.ghost?.stage===G.stageIndex&&!NET.ghost.dead?NET.ghost:null;
 const players=partner?[G.p,partner]:[G.p];
 if(actor&&!root.BladefallRound2Explore?.handles(scene.id)&&scene.rescue&&r.phase==='active'&&r.step===1){
  const rescue=scene.rescue,brace=G.obstacles.find(o=>o.sideStory===scene.id&&o.sideStoryRole==='brace');
  const threatened=brace&&players.find(p=>Math.abs(p.x-brace.x)<65&&Math.abs(p.y-brace.y)<45);
  if(!rescue.started&&threatened&&Math.abs(actor.x-actor.baseX)>145){rescue.started=true;rescue.remote=threatened===partner;}
  if(rescue.started&&!rescue.done){
   rescue.t+=dt;
   if(rescue.t>=.32){
    // A brief authored rescue on the optional crossing, never a damage check or boss change.
    const savedPlayer=rescue.remote&&partner?partner:G.p,safeX=brace.x+scene.base.dir*75;
    if(savedPlayer===partner)netSend({t:'teleport',x:safeX,y:brace.y});
    savedPlayer.x=safeX;savedPlayer.vx=0;savedPlayer.invuln=Math.max(savedPlayer.invuln||0,.5);
    rescue.done=true;commit(scene.id,{type:'rescue'});addText(G.p.x,GROUND_Y-G.p.y-65,'HE PULLS YOU CLEAR',S.byId[scene.id].accent,false);
   }
  }
 }
 if(actor&&!root.BladefallRound2Explore?.handles(scene.id)&&scene.escort){
  const escort=scene.escort,walking=scene.id==='defector'?r.phase==='completed':r.phase==='active'&&r.step===1;
  if(walking&&!escort.finished){
   const distance=escort.destination-actor.x;
   const leader=players.find(p=>Math.abs(p.x-actor.x)<200&&Math.abs(p.y-actor.y)<90&&Math.sign(p.x-actor.x)===Math.sign(distance)&&Math.abs(p.x-actor.x)>22);
   // The companion waits when abandoned; arriving at the marker alone never completes an escort.
   if(leader){
    actor.x+=Math.sign(distance)*Math.min(Math.abs(distance),dt*(scene.id==='miner'?48:76));
   }
   if(scene.id==='recruit'&&Math.abs(actor.x-actor.baseX)>135)escort.helmetDropped=true;
   if(Math.abs(distance)<46&&players.some(p=>Math.abs(p.x-escort.destination)<90&&Math.abs(p.y-escort.y)<90)){escort.finished=true;actor.x=escort.destination;
    if(scene.id==='recruit'&&r.phase==='active'&&r.step===1){const crossing=G.obstacles.find(o=>o.sideStory===scene.id&&o.task==='crossing');if(crossing)completePhysicalTask(crossing);}
    apply();}
  }
 }
 if(shared()&&NET.isHost()&&actor){
  scene.syncT=(scene.syncT||0)+dt;if(scene.syncT>=.1){scene.syncT=0;netSend({t:'sideStoryScene',stage:G.stageIndex,id:scene.id,x:actor.x,y:actor.y,escort:scene.escort||null,rescue:scene.rescue||null,revisit:!!scene.revisit},true);}
 }
 if(actor&&scene.id==='defector'&&r.phase!=='completed'&&(r.phase==='harsh'||r.step<1))actor.x=actor.baseX+Math.sin(G.time*.7)*45;   // his forty paces, until the governor stops
}
function draw(c,o){
 if(o.gone||o.sideStoryRole==='step')return;
 if(o.sideStory==='refuge'&&o.sideStoryRole==='scene'&&G.sideStoryScene?.revisit&&S.row(state(),'refuge').phase==='completed'&&!window.BladefallOpeningStories)return;
 const q=S.byId[o.sideStory],r=S.row(state(),q.id),good=r.phase==='completed',bad=r.phase==='harsh',scene=G.sideStoryScene;
 if(window.BladefallQuestErrands?.draw(c,o,q,r))return;
 if(window.BladefallResidentArt?.drawStory(c,o,q,r,scene))return;   // givers and supporting speakers: bladefall-resident-art.js
 if(window.BladefallOpeningStories?.draw(c,o,q,r,scene))return;
 if(window.BladefallCausewayStory?.draw(c,o,q,r,scene))return;
 const x=o.x,y=GROUND_Y-o.y;
 c.save();c.translate(x,y);c.lineWidth=2;c.strokeStyle=o.accent;c.fillStyle='#252830';
 if(o.sideStoryRole==='brace'){
  const rescue=scene.rescue||{},fall=rescue.done?1:rescue.started?Math.min(1,rescue.t/.32):0;
  c.translate(0,-150*(1-fall)-8);c.rotate(fall*.28);c.fillStyle='#6e5c50';c.fillRect(-35,-7,70,14);c.strokeRect(-35,-7,70,14);
 }
 else if(o.sideStoryRole==='echo-contact'){const echo=echoStanding();c.fillStyle=echo&&Math.hypot(echo.x-o.x,echo.y-o.y)<55?'#e9d9ff':'#776793';c.fillRect(-27,-4,54,5);c.strokeStyle='#bfa4e8';c.strokeRect(-27,-4,54,5);}
 else if(o.sideStoryRole==='anchor'){c.strokeStyle='#eaa460';c.beginPath();c.ellipse(0,-5,28,7,0,0,7);c.stroke();}
 else if(o.sideStoryRole==='hook'){c.beginPath();c.arc(0,0,14,0,7);c.stroke();}
 else if(o.sideStoryRole==='gate'){c.fillStyle='#686377';c.fillRect(-o.w/2,0,o.w,o.h);}
 else if(o.sideStoryRole==='cart'){c.fillStyle='#695851';c.fillRect(-18,-34,36,29);c.strokeRect(-18,-34,36,29);for(const dx of [-12,12]){c.beginPath();c.arc(dx,-3,5,0,7);c.stroke();}}
 else if(o.sideStoryRole==='support'){
  if(o.inverted)c.scale(1,-1);
  const h=o.seated?27:40;c.fillStyle=o.supportKind==='worker'?'#777478':o.supportKind==='sailor'?'#76979a':'#a19785';
  c.fillRect(-10,-h,20,h);c.fillStyle='#b9a18e';c.beginPath();c.arc(0,-h-5,7,0,7);c.fill();
  if(o.supportKind==='soldier'){c.fillStyle='#494853';c.fillRect(-9,-h-12,18,7);}
  if(o.supportKind==='neighbor'&&good){c.strokeStyle='#b8a6ed';c.beginPath();c.ellipse(20,-25,12,5,0,0,7);c.stroke();c.fillStyle='#dfd4bd';c.fillRect(16,-31,7,5);}
  if(o.seated){c.strokeStyle='#816b55';c.strokeRect(-14,-15,28,15);}
 }
 else if(o.sideStoryRole==='actor'){
  const seated=(bad&&q.id==='garden')||(good&&['gatekeeper','winter','quota','refuge','alarm','pilgrim','garden','defector','cartographer'].includes(q.id));
  const h=seated?29:43;
  if(q.id==='automaton'){c.fillStyle='#53505b';c.fillRect(-17,-h,34,h);c.strokeRect(-17,-h,34,h);c.fillRect(-23,-h+7,8,27);c.fillRect(15,-h+7,8,27);}
  else{c.fillStyle=q.accent;c.globalAlpha=q.id==='figure'?.65:1;c.beginPath();c.moveTo(-12,0);c.lineTo(-9,-h+8);c.lineTo(8,-h+8);c.lineTo(13,0);c.fill();}
  c.fillStyle='#b9a18e';c.beginPath();c.arc(0,-h-1,7,0,Math.PI*2);c.fill();
  c.fillStyle='#31313b';if(q.silhouette==='watcher'&&!(q.id==='recruit'&&scene.escort?.helmetDropped))c.fillRect(-9,-h-9,18,7);else if(q.silhouette==='surveyor'){c.fillRect(8,-23,12,15);c.strokeRect(8,-23,12,15);}else{c.beginPath();c.arc(0,-h-2,10,Math.PI,Math.PI*2);c.stroke();}
  if(seated){c.strokeStyle='#8e715c';c.strokeRect(-15,-17,30,17);}
  if(q.id==='pilgrim'&&bad){c.fillStyle='#8a785d';c.beginPath();c.ellipse(17,-12,11,14,0,0,7);c.fill();c.strokeStyle='#c5b593';c.beginPath();c.moveTo(12,-27);c.lineTo(22,-27);c.stroke();}
  if(q.id==='figure'&&r.step===0){c.strokeStyle='#9cbedb';c.strokeRect(-25,-65,50,65);}
  if(q.id==='recruit'&&scene.escort?.helmetDropped){const hx=scene.base.x+135*scene.base.dir-o.x;c.fillStyle='#686879';c.fillRect(hx-10,-7,20,7);c.beginPath();c.arc(hx,-7,8,Math.PI,2*Math.PI);c.fill();}
  if(q.id==='miner'&&r.step===0){c.strokeStyle='#77737e';c.strokeRect(-25,-64,50,64);for(let bar=-15;bar<=15;bar+=15){c.beginPath();c.moveTo(bar,-64);c.lineTo(bar,0);c.stroke();}}
  if(r.phase==='offered'||r.phase==='ready'){c.fillStyle=q.accent;c.font='bold 16px system-ui';c.textAlign='center';c.fillText(r.phase==='ready'?'✓':'…',0,-h-20);}
 }else if(o.sideStoryRole==='reward'){
  c.fillStyle='#827452';c.fillRect(-13,-13,26,13);c.strokeRect(-13,-13,26,13);c.fillStyle='#d5cfaa';c.fillRect(-8,-18,16,7);
 }else if(o.sideStoryRole==='task'){
  c.globalAlpha=o.storyDone?.5:1;
  if(/bell|signal/.test(o.task)){c.beginPath();c.moveTo(-15,-12);c.quadraticCurveTo(-10,-48,0,-47);c.quadraticCurveTo(10,-48,15,-12);c.closePath();c.fill();c.stroke();c.beginPath();c.arc(0,-9,3,0,7);c.fill();}
  else if(/gear|counter|loop|hoist/.test(o.task)){c.save();if(!o.storyDone||o.task==='loop')c.rotate(G.time*.7);c.strokeRect(-20,-35,40,30);c.beginPath();c.arc(0,-20,10,0,7);c.stroke();c.restore();}
  else if(/shutter|door|release/.test(o.task)){c.strokeRect(-20,-64,40,64);c.fillStyle=o.storyDone?'#111421':'#b8a272';c.fillRect(-16,-60,o.storyDone?8:32,58);}
  else if(/lantern|chimes|funnel|frost/.test(o.task)){c.strokeRect(-12,-37,24,28);c.fillStyle=o.storyDone?'#f1d991':'#777982';c.fillRect(-8,-32,16,18);}
  else{c.fillStyle=o.accent;c.fillRect(-12,-19,24,18);c.strokeRect(-15,-22,30,22);}
  if(Math.abs(G.p.x-o.x)<200&&Math.abs(G.p.y-o.y)<180){c.globalAlpha=1;c.fillStyle='#e6e0d4';c.font='12px system-ui';c.textAlign='center';c.fillText(o.title,0,-75);}
 }else{
  // Small outcome tableaux, derived from saved state rather than decorative text alone.
  if(q.id==='refuge'){
   c.fillStyle='#a48d64';c.beginPath();c.moveTo(-58,-66);c.lineTo(5,-86);c.lineTo(63,-66);c.closePath();c.fill();
   c.strokeStyle='#75604b';for(const dx of [-55,60]){c.beginPath();c.moveTo(dx,0);c.lineTo(dx,-67);c.stroke();}
  }
  if(q.id==='garden'){
   c.fillStyle='rgba(30,33,49,'+(.08+r.step*.14)+')';c.fillRect(-62,-82,124,82);
   c.strokeStyle='#928876';c.strokeRect(-62,-84,124,6);
   for(let i=0;i<3;i++){c.fillStyle=i<r.step?'#555966':'#c2b99e';c.fillRect(-60+i*40,-80,i<r.step?38:5,8);}
  }
  c.strokeStyle='#796c60';c.strokeRect(-35,-25,70,8);c.fillRect(-30,-17,5,17);c.fillRect(25,-17,5,17);
  const lit=q.id==='garden'?r.step>=3:good||r.step>0||(bad&&['refuge','winter','ember-pet'].includes(q.id));
  if(['refuge','winter','pilgrim','birthday','neighbors'].includes(q.id)){
   c.fillStyle='#c9b99b';c.fillRect(-22,-30,16,5);if(!bad)c.fillRect(10,-30,16,5);
   c.fillStyle=lit?'#ffd781':'#585766';c.fillRect(-2,-44,4,17);
   if(q.id==='neighbors'&&good){c.strokeStyle='#b8a6ed';c.beginPath();c.ellipse(20,-31,12,5,0,0,7);c.stroke();c.fillStyle='#dfd4bd';c.fillRect(16,-37,7,5);}
   if(q.id==='winter'){c.fillStyle=lit?'#739aac':'#c2d5e2';c.globalAlpha=.5;c.beginPath();c.ellipse(0,0,lit?48:28,lit?5:14,0,0,7);c.fill();c.globalAlpha=1;}
  }else if(q.id==='garden'){
   c.fillStyle=lit?'#e8dbff':'#6e7858';for(let i=-2;i<=2;i++){c.fillRect(i*15,-20,2,20);c.beginPath();c.ellipse(i*15,-23,lit?8:3,6,0,0,7);c.fill();}
  }else if(q.id==='automaton'){
   c.strokeRect(-15,-55,30,25);c.beginPath();c.moveTo(-20,-55);c.lineTo(0,-70);c.lineTo(20,-55);c.stroke();if(good){c.fillStyle='#c2af79';c.beginPath();c.ellipse(8,-75,7,4,0,0,7);c.fill();}
  }else if(q.id==='ember-pet'){
   c.fillStyle=lit?'#9cdaee':'#ed904d';c.fillRect(-25,-8,50,8);c.fillStyle='#e39a61';c.beginPath();c.ellipse(0,-13,lit?18:10,lit?8:18,0,0,7);c.fill();
   if(bad){c.strokeStyle='#9faab0';c.lineWidth=5;c.beginPath();c.moveTo(-35,-35);c.lineTo(-35,-13);c.lineTo(-20,-13);c.stroke();}
  }else if(q.id==='archivist'){
   c.fillStyle=r.resolution==='burn'?'#ec9b56':'#c3aa91';for(let i=0;i<3;i++)c.fillRect(-15,-30-i*5,30,4);
  }else if(q.id==='mother'){c.fillStyle=lit||bad?'#bcdde8':'#847f73';c.fillRect(8,-38,9,12);}
  else{c.fillStyle=good?'#c7d6aa':bad?'#706c73':'#a38e68';c.fillRect(-12,-38,24,12);}
 }
 c.restore();
}
function journal(){return S.journal(state()).map(q=>({id:'side:'+q.id,title:q.title,accent:S.byId[q.id].accent,status:q.status,step:S.row(state(),q.id).step,total:S.byId[q.id].tasks.length,objective:{label:q.status==='active'&&G.sideStoryScene?.round2&&G.sideStoryScene.id===q.id?root.BladefallRound2Explore.objective(G.sideStoryScene,S.row(state(),q.id)).text:q.objective},rewardValue:q.reward,claimed:q.claimed,sideStory:true}));}
/* (7.375) A step done out in the world (bladefall-quest-errands.js). */
function completeTask(id,task,at){const o=G.obstacles.find(o=>o.sideStory===id&&o.sideStoryRole==='errand'&&o.task===task)||{sideStory:id,task,x:G.p.x,y:G.p.y,accent:S.byId[id].accent};
 const result=commit(id,{type:'task',task,capabilities:capabilities()});if(result.changed){apply();const next=S.row(state(),id);
 if(G.sideStoryScene)G.sideStoryScene.questBeat={time:G.time,x:at?.x??G.p.x,y:at?.y??G.p.y,text:next.phase==='ready'?'DONE · RETURN TO '+S.byId[id].name.toUpperCase():S.byId[id].tasks[next.step].label.toUpperCase()};
 root.BladefallSfx?.play?.('quest');
 addText(G.p.x,GROUND_Y-G.p.y-95,next.phase==='ready'?'DONE · RETURN TO '+S.byId[id].name.toUpperCase():S.byId[id].tasks[next.step].label.toUpperCase(),S.byId[id].accent,false);}return result;}
root.BladefallSideStoryWorld=Object.freeze({receiveRewards,receiveNetwork,install,update,interact,interactable,prompt,draw,state,apply,journal,completeTask});
})(typeof globalThis!=='undefined'?globalThis:window);
