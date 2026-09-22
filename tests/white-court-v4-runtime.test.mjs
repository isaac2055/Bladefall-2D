import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../public/index.html',import.meta.url),'utf8');
const plain=value=>JSON.parse(JSON.stringify(value));
function fn(name){
 const start=source.indexOf(`function ${name}(`);
 assert.ok(start>=0,`production function ${name} exists`);
 const brace=source.indexOf('{',start);let depth=0;
 for(let i=brace;i<source.length;i++){
  if(source[i]==='{')depth++;
  else if(source[i]==='}'&&--depth===0)return source.slice(start,i+1);
 }
 throw new Error(`unterminated production function ${name}`);
}
const modules=vm.runInNewContext((await Promise.all(['progression','capabilities','zones','recovery','portal-progression'].map(name=>
 readFile(new URL('../public/bladefall-'+name+'.js',import.meta.url),'utf8')))).join('\n')+
 ';({capabilities:BladefallCapabilities,recovery:BladefallRecovery,portals:BladefallPortalProgression})');
const constructors=['Pl','Gr','Wl','Slope','Slate','SlateWall','Check','Scenery','Fluid','RuneEmitter','LPortal','Anchor',
 'Lever','SpellSiphon','StoryRelic','SealedRecollection','AmbientFigure','CourtBeat','CourtScenery'];
const levelStart=source.indexOf('const WHITE_COURT_LEVEL='),levelEnd=source.indexOf('\nfunction ',levelStart);
const authored=vm.runInNewContext(constructors.map(fn).join('\n')+'\n'+source.slice(levelStart,levelEnd)+';WHITE_COURT_LEVEL');

function harness({preview=false,reducedMotion=false}={}){
 const circuits=new Set(),grants=[],annotations=[],toasts=[],saves=[],events=[],shots=[],damage=[];
 let persistence=0,captures=0;
 const G={stageIndex:8,ngPlus:0,levelSelectMode:preview,worldProgressEligible:!preview,cam:13500,time:0,
  obstacles:plain(authored.objects),npcs:[],enemies:[],pickups:[],particles:[],aoes:[],projectiles:[],openedZoneShortcuts:[],
  p:{x:14300,y:0,w:24,h:44,blood:1,maxBlood:5,hasJetpack:true,fuel:12},shake:0};
 const meta={soundOn:false,reducedMotion,bestStage:8,reach:{0:8},
  capabilities:modules.capabilities.createState({acquired:['portal-pair','counter','double-jump']})};
 if(preview)G.sessionCapabilities=modules.capabilities.createState(plain(meta.capabilities));
 const active=()=>G.sessionCapabilities||meta.capabilities;
 const ctx=vm.createContext({Math,G,meta,VW:1280,GROUND_Y:700,console,V4_LAST_STAGE:9,v4Region:i=>i>=0&&i<=9,
  BFWorldModule:{stageId:i=>i===8?'frost-sorcerer':null},BFCapabilitiesModule:modules.capabilities,BFRecoveryModule:modules.recovery,
  activeCapabilityProgress:active,hasCapability:id=>modules.capabilities.has(active(),id),
  syncMovementCapabilities(){},syncPortalCapabilities(){},syncWeaponCapabilities(){},syncEchoRuntimeMods(){},hudUpdate(){},
  persistentCircuitOpen:id=>circuits.has(id),circuitOpen:id=>circuits.has(id),
  markPersistentCircuitOpen(id,reason){const fresh=!circuits.has(id);circuits.add(id);if(fresh)events.push({id,reason});return fresh;},
  grantAuthoredAdvancementBundle:(reward,id)=>grants.push({reward,id}),
  captureCurrentZonePersistence(){captures++;},persist(){persistence++;},
  restoreBlood:p=>{p.blood=p.maxBlood;},snapOf:p=>plain(p),
  saveRunAtStage:(stage,snap)=>saves.push({stage,snap:plain(snap),capabilities:plain(active())}),
  showOutskirtsAnnotation:(o,text)=>annotations.push({o,text}),toast:text=>toasts.push(text),
  showStationNotice:text=>annotations.push(text),addText:(x,y,text)=>annotations.push(text),
  clearPlacedPortals(){G.cratePortals=[];},restoreSolvedBacktrackDoors(){},
  commitStageCompletion:()=>events.push('stage'),recordWorldClear:()=>events.push('world'),recordStoryStageClear:()=>events.push('story'),
  recordHelpedTravelers:()=>events.push('travelers'),recordQuestEvent:e=>events.push(e),
  bossShoot(e,p,kind){shots.push({x:e.x,y:e.y,target:plain(p),kind});G.projectiles.push({sourceType:e.type,kind});},
  hitEnemy(e,n){e.hp-=n;},hurtPlayer:(...args)=>damage.push(args),SFX:{},
 });
 vm.runInContext([...constructors,'grantPermanentCapability','activateRuntimeCheckpoint','completeCourtReward','restoreCourtVictory',
  'updateCourtKeeper','interactWhiteCourt','captureSorcererSpell','setupWhiteCourtBoss','installCourtArena','beginCourtFinal','beginCourtRupture',
  'updateCourtRupture','courtFinalDamage','courtFinalBeat','updateCourtFinal','updateCourtReceiver','updateWhiteCourtBoss','breakCourtWard'].map(fn).join('\n'),ctx);
 const boss={type:'sorcerer',x:14300,y:0,w:58,h:84,hp:900,maxHp:900,dmg:24,face:1,active:true,shot:{el:'ice'}};
 ctx.setupWhiteCourtBoss(boss,boss.x);G.boss=boss;G.enemies.push(boss);
 return{ctx,G,meta,boss,active,circuits,grants,annotations,toasts,saves,events,shots,damage,
  get persistence(){return persistence;},get captures(){return captures;}};
}

test('Court victory grants direct Attunement once and saves a healed Ember-approach checkpoint without a banner',()=>{
 const h=harness(),start={x:h.G.p.x,y:h.G.p.y};
 assert.equal(h.ctx.completeCourtReward(),true);
 assert.ok(modules.capabilities.has(h.active(),'attunement'));
 assert.ok(h.circuits.has('court-defeated'));
 assert.equal(h.G.p.blood,5);assert.equal(h.G.p.fuel,100);
 assert.deepEqual([h.G.p.ckX,h.G.p.ckY],[15320,0]);
 assert.deepEqual([h.G.p.x,h.G.p.y],[start.x,start.y],'saving victory does not teleport the player');
 assert.equal(h.saves.length,1);assert.equal(h.saves[0].stage,8);
 assert.ok(modules.capabilities.has(h.saves[0].capabilities,'attunement'));
 assert.deepEqual([h.saves[0].snap.ckX,h.saves[0].snap.ckY],[15320,0]);
 assert.equal(h.meta.recovery.activeCheckpoint.zoneId,'frost-sorcerer');
 assert.equal(h.annotations.length,0);assert.equal(h.toasts.length,0);
 const stored=h.persistence;
 assert.equal(h.ctx.completeCourtReward(),false);assert.equal(h.saves.length,1);assert.equal(h.persistence,stored);
 h.G.stageIndex=7;assert.equal(h.ctx.completeCourtReward(),false);
});

test('Level Select Attunement remains in its saved preview session',()=>{
 const h=harness({preview:true});h.ctx.completeCourtReward();
 assert.ok(modules.capabilities.has(h.active(),'attunement'));
 assert.equal(modules.capabilities.has(h.meta.capabilities,'attunement'),false);
 assert.ok(modules.capabilities.has(h.saves[0].capabilities,'attunement'));
 assert.equal(h.meta.bestStage,8);assert.equal(h.meta.reach[0],8);
 assert.equal(h.persistence,0);assert.equal(h.annotations.length,0);assert.equal(h.toasts.length,0);
});

test('restoring a completed Court removes only its boss pressure and does not replay rewards',()=>{
 const h=harness();assert.equal(h.ctx.restoreCourtVictory(),false);
 h.ctx.grantPermanentCapability('attunement','test-court-victory',{quiet:true});
 h.boss.courtFinal={hazards:[{x:13800,y:14,vx:470}],beat:'barrage'};
 h.G.aoes=[{courtAttack:true},{type:'foreign-effect'}];
 h.G.projectiles=[{sourceType:'sorcerer'},{sourceType:'grunt'}];
 for(const o of h.G.obstacles)if(o.courtGlaze||o.courtFinalGlaze){o.ice=true;o.courtFrostWarn=true;}
 assert.equal(h.ctx.restoreCourtVictory(),true);
 assert.equal(h.boss.dead,true);assert.equal(h.boss.hp,0);assert.equal(h.boss.active,false);
 assert.equal(h.boss.courtFinal?.hazards?.length||0,0);
 assert.deepEqual(plain(h.G.aoes),[{type:'foreign-effect'}]);assert.deepEqual(plain(h.G.projectiles),[{sourceType:'grunt'}]);
 assert.ok(h.G.obstacles.filter(o=>o.courtGlaze||o.courtFinalGlaze).every(o=>!o.ice&&!o.courtFrostWarn));
 assert.ok(['court-defeated','court-glass-cold','court-gallery-cold'].every(id=>h.circuits.has(id)));
 assert.equal(h.G.obstacles.find(o=>o.courtBossReceiver).courtSpent,true);
 const size=h.G.obstacles.length;h.ctx.installCourtArena(null);assert.equal(h.G.obstacles.length,size,'returning preserves one arena');
 assert.equal(h.saves.length,0);assert.equal(h.grants.length,0);assert.equal(h.annotations.length,0);
});

test('Vey recurs only when both old and new places are outside the camera',()=>{
 const h=harness(),vey=h.G.obstacles.find(o=>o.courtAction==='keeper');
 assert.equal(vey.x,3880);h.circuits.add('court-wheel');
 h.G.cam=3800;h.ctx.updateCourtKeeper();assert.equal(vey.x,3880,'do not move a visible person');
 h.G.cam=4900;h.ctx.updateCourtKeeper();assert.equal(vey.x,3880,'do not appear at a visible destination');
 h.G.cam=7000;h.ctx.updateCourtKeeper();assert.equal(vey.x,5080);assert.equal(vey.y,0);
 h.ctx.grantPermanentCapability('attunement','test-court-victory',{quiet:true});
 h.G.cam=12000;h.ctx.updateCourtKeeper();assert.equal(vey.x,5080);
 h.G.cam=5000;h.ctx.updateCourtKeeper();assert.equal(vey.x,5080);
 h.G.cam=8000;h.ctx.updateCourtKeeper();assert.equal(vey.x,12480);
 assert.ok(h.G.obstacles.some(o=>o.type==='plat'&&!o.gate&&o.y===vey.y&&Math.abs(vey.x-o.x)<=o.w/2),'Vey stands on the dry east bank');
 assert.equal(h.G.obstacles.filter(o=>o.courtAction==='keeper').length,1);
 h.G.stageIndex=7;vey.x=3880;h.ctx.updateCourtKeeper();assert.equal(vey.x,3880);
});

test('wheel and cache grant their authored contents once, silently, including restored interactions',()=>{
 const h=harness();
 for(const action of ['wheel','cache']){
  const o=h.G.obstacles.find(o=>o.courtAction===action);
  assert.equal(h.ctx.interactWhiteCourt(o),true);assert.equal(h.ctx.interactWhiteCourt(o),true);
 }
 assert.equal(h.grants.length,2);assert.equal(new Set(h.grants.map(g=>g.id)).size,2);
 assert.ok(h.circuits.has('court-wheel'));assert.ok(h.circuits.has('court-high-cache'));
 assert.equal(h.saves.length,2);assert.deepEqual(h.saves.map(s=>[s.snap.ckX,s.snap.ckY]),[[3240,0],[7340,420]]);
 assert.equal(h.annotations.length,0);assert.equal(h.toasts.length,0);
 // Simulate freshly reconstructed objects whose completion lives in persistence.
 for(const action of ['wheel','cache'])h.ctx.interactWhiteCourt({courtAction:action,x:3000,y:0});
 assert.equal(h.grants.length,2);assert.equal(h.saves.length,2);
 const preview=harness({preview:true});preview.ctx.interactWhiteCourt(preview.G.obstacles.find(o=>o.courtAction==='wheel'));
 assert.equal(preview.grants.length,1);assert.equal(preview.persistence,0);
});

test('condensers accept only live authored cold routed through a portal and save their own recovery once',()=>{
 for(const [gallery,checkpoint] of [[false,10330],[true,11420]]){
  const h=harness(),receiver=h.G.obstacles.find(o=>o.courtCondenser&&!!o.courtGalleryReceiver===gallery);
  const shot=()=>({x:receiver.x,y:receiver.y,life:1,courtCold:true,portalHops:1,el:'ice'});
  for(const invalid of [{courtCold:false},{portalHops:0},{el:'fire'},{life:0},{courtCold:false,stolenSpell:true}]){
   const pr=Object.assign(shot(),invalid);h.ctx.captureSorcererSpell(receiver,pr);
   assert.equal(h.circuits.has(receiver.circuitId),false,JSON.stringify(invalid));assert.equal(h.saves.length,0);
  }
  const valid=shot();h.ctx.captureSorcererSpell(receiver,valid);
  assert.equal(valid.life,0);assert.ok(h.circuits.has(receiver.circuitId));assert.equal(receiver.charge,1);
  assert.deepEqual([h.G.p.ckX,h.G.p.ckY],[checkpoint,0]);assert.equal(h.saves.length,1);
  assert.deepEqual([h.saves[0].snap.ckX,h.saves[0].snap.ckY],[checkpoint,0]);
  h.ctx.captureSorcererSpell(receiver,shot());assert.equal(h.saves.length,1);assert.equal(h.captures,1);
  assert.equal(h.annotations.length,0);assert.equal(h.toasts.length,0);
 }
});

test('the second frost shot holds its caster and committed target for the full warning',()=>{
 const h=harness(),e=h.boss,p=h.G.p;p.x=14600;p.y=20;
 Object.assign(e,{courtBreaks:1,courtCastWind:.01,courtCastCd:2,courtAimX:14500,courtAimY:2,courtBlinkCd:99,courtStormCd:99,courtEngaged:true});
 h.ctx.updateWhiteCourtBoss(e,p,.02);
 assert.equal(h.shots.length,1);assert.equal(h.shots[0].kind,'payload');assert.equal(e.courtSecondT,.7);
 const locked={x:e.courtSecondX,y:e.courtSecondY,caster:e.x};p.x=13200;p.y=190;
 for(let i=0;i<6;i++){
  h.ctx.updateWhiteCourtBoss(e,p,.1);
  assert.equal(e.x,locked.caster);assert.equal(e.courtSecondX,locked.x);assert.equal(e.courtSecondY,locked.y);
  assert.equal(h.shots.length,1);
 }
 h.ctx.updateWhiteCourtBoss(e,p,.12);
 assert.equal(h.shots.length,2);assert.equal(h.shots[1].kind,'followup');
 assert.deepEqual(h.shots[1].target,{x:locked.x,y:locked.y,h:0});assert.equal(h.shots[1].x,locked.caster);
});

test('reduced motion preserves warned and moving final hazards with identical combat timing',()=>{
 function trace(reducedMotion){
  const h=harness({reducedMotion}),out=[];h.ctx.beginCourtFinal(h.boss);h.boss.hp=h.boss.maxHp*.2;
  for(let i=0;i<170;i++){
   h.ctx.updateCourtFinal(h.boss,h.G.p,1/60);
   const f=h.boss.courtFinal;
   out.push({attack:f.attack,attackT:f.attackT,hazards:plain(f.hazards),x:h.boss.x,
    ice:h.G.obstacles.filter(o=>o.courtGlaze||o.courtFinalGlaze).map(o=>[!!o.ice,!!o.courtFrostWarn])});
  }
  return out;
 }
 const normal=trace(false),reduced=trace(true);assert.deepEqual(reduced,normal);
 assert.ok(reduced.some(row=>row.hazards.some(h=>h.warn>0)));
 assert.ok(reduced.some(row=>row.hazards.some(h=>h.warn<=0&&h.x>13060)));
 assert.ok(reduced.some(row=>row.attack==='recover'&&row.hazards.length>0));
});

test('Court co-op snapshots carry committed targets and final hazards, then clear stale tells',()=>{
 const start=source.indexOf('const COURT_TELL_FIELDS=');assert.ok(start>=0);
 const end=source.indexOf('\nfunction netPackWorldSnapshot',start);assert.ok(end>start);
 const ctx=vm.createContext({});vm.runInContext(source.slice(start,end),ctx);
 const host={whiteCourtFight:true,courtBreaks:2,courtCastWind:.6,courtAimX:13700,courtAimY:2,
  courtSecondT:.4,courtSecondX:14400,courtSecondY:110,courtBlinkWind:.7,courtBlinkX:13200,
  courtFinal:{beat:'rupture',ruptured:true,attack:'windup',attackT:.7,station:14140,hazards:[{x:13700,y:-35,r:18,vx:0,vy:480,warn:.6,hit:false}]}};
 const remote={whiteCourtFight:true};ctx.netApplyCourtTell(remote,plain(ctx.netPackCourtTell(host)));
 assert.equal(remote.courtSecondX,14400);assert.equal(remote.courtSecondT,.4);assert.equal(remote.courtBlinkX,13200);
 assert.deepEqual(plain(remote.courtFinal),host.courtFinal);
 host.courtSecondT=0;host.courtCastWind=0;host.courtBlinkWind=0;host.courtFinal=null;
 ctx.netApplyCourtTell(remote,plain(ctx.netPackCourtTell(host)));
 assert.equal(remote.courtSecondT,0);assert.equal(remote.courtCastWind,0);assert.equal(remote.courtBlinkWind,0);assert.equal(remote.courtFinal,null);
 assert.equal(ctx.netPackCourtTell({type:'grunt'}),null);
});


const echoes=vm.runInNewContext(await readFile(new URL('../public/bladefall-echoes.js',import.meta.url),'utf8')+';BladefallEchoes');
test('White Hush works with full slots, never stacks with itself, and respects frost tool qualifiers',()=>{
 function setup(state,preview=false){
  const events=[],toasts=[],saves=[];
  const meta={echoes:state,soundOn:false},G={stageIndex:8,ngPlus:0,worldProgressEligible:!preview,levelSelectMode:preview,p:{}};
  const ctx=vm.createContext({G,meta,BFEchoesModule:echoes,BFEchoes:{record(){}},BFRuntime:{events:{emit:(type,receipt)=>events.push({type,receipt})}},
   hasCapability:id=>preview&&id==='attunement',grantAuthoredAdvancement(){},syncEchoRuntimeMods(){},syncBloodMirror(){},
   saveRunAtStage:()=>saves.push(plain(meta.echoes)),snapOf:()=>({}),persist(){},hudUpdate(){},toast:t=>toasts.push(t),SFX:{}});
  vm.runInContext(['fieldPassiveEchoIds','passiveEchoActive','passiveEchoReceipts','echoState','whiteHushActive','whiteHushReceipts','echoModifier','resolveEchoEvent','grantEchoReward'].map(fn).join('\n'),ctx);
  return{ctx,G,meta,events,toasts,saves};
 }
 const slots=['far-thread','red-tempo','chain-vow'];
 const h=setup(echoes.createState({owned:slots,equipped:slots,capacityKnots:['extra-knot']}));
 assert.equal(echoes.profile(h.meta.echoes).equipped,3);
 assert.equal(h.ctx.grantEchoReward({type:'boss:defeated',boss:'sorcerer'}).changed,true);
 assert.deepEqual(plain(h.meta.echoes.equipped),[]);assert.ok(h.meta.echoes.owned.includes('white-hush'));
 assert.equal(h.ctx.echoModifier('status:ice','freeze-duration:mul',1),1.3);
 assert.equal(h.ctx.echoModifier({type:'tool:use',action:'rime'},'rime-radius:add',0),25);
 assert.equal(h.ctx.echoModifier({type:'tool:use',action:'cinder'},'rime-radius:add',0),0);
 assert.equal(h.ctx.resolveEchoEvent('tool:use',{action:'cinder'}).some(r=>r.echoId==='white-hush'),false);
 assert.equal(h.ctx.resolveEchoEvent('status:ice').filter(r=>r.echoId==='white-hush').length,1);
 assert.equal(h.ctx.grantEchoReward({type:'boss:defeated',boss:'sorcerer'}).changed,false);
 assert.equal(h.saves.length,1);assert.equal(h.toasts.length,0);
 h.meta.echoes=echoes.createState({...h.meta.echoes,equipped:['white-hush','red-tempo']});
 assert.equal(h.ctx.echoModifier('status:ice','freeze-duration:mul',1),1.3);
 assert.equal(h.ctx.resolveEchoEvent('status:ice').filter(r=>r.echoId==='white-hush').length,1);
 const legacy=setup(echoes.createState({owned:['white-hush'],equipped:['white-hush']}));
 legacy.ctx.grantEchoReward({type:'boss:defeated',boss:'sorcerer'});
 assert.deepEqual(plain(legacy.meta.echoes.equipped),[],'permanent frost benefit releases its old equipment slot');
 const preview=setup(echoes.createState({owned:slots,equipped:slots,capacityKnots:['extra-knot']}),true);
 assert.equal(preview.ctx.echoModifier('status:ice','freeze-duration:mul',1),1.3);
 assert.equal(preview.meta.echoes.owned.includes('white-hush'),false,'preview attunement does not grant a campaign echo');
});


test('the Gallery places its real floor mouth below zero and keeps the lower retry road above its local void',()=>{
 const h=harness(),slate=h.G.obstacles.find(o=>o.courtGalleryOutlet),placements=[];
 assert.ok(slate?.slate);assert.equal(slate.y,-80);
 Object.assign(h.G.p,{x:slate.x,y:slate.y,onGround:true,onWall:false,floorPlat:slate});
 Object.assign(h.ctx,{BFPortalProgressionModule:modules.portals,nearbyActivePortalAnchor:()=>null,
  playerSlate:()=>slate,BFPortalProgression:{recordPlacement:plan=>placements.push(plan)},
  lockedPortalFeedback(){assert.fail('owned paired portals must be usable on the gallery slate');}});
 vm.runInContext([fn('placePortal'),fn('updraftsVoidFloor')].join('\n'),h.ctx);
 const plan=h.ctx.placePortal();assert.equal(plan.allowed,true);assert.equal(placements.length,1);
 assert.equal(h.G.cratePortals.length,1);
 const mouth=h.G.cratePortals[0];assert.equal(mouth.x,slate.x);assert.equal(mouth.y,-80);assert.equal(mouth.ny,1);
 assert.equal(h.G.p._restMouth,mouth,'placement still arms the step-off guard');
 const floor=h.G.obstacles.find(o=>o.courtGalleryRecovery);assert.equal(floor.y,-80);
 for(const x of [11520,11980,12320])assert.equal(h.ctx.updraftsVoidFloor({x}),-160);
 for(const x of [11519,12321])assert.equal(h.ctx.updraftsVoidFloor({x}),-50);
 assert.ok(floor.y>h.ctx.updraftsVoidFloor({x:floor.x}));
 h.G.stageIndex=7;assert.equal(h.ctx.updraftsVoidFloor({x:11980}),-50);
});

test('rupture keeps its warned direction through the main enemy update and recommits after recovery',()=>{
 const h=harness(),e=h.boss,p=h.G.p;
 const start=source.indexOf('const dir=Math.sign(pursuitX-e.x)||1;');assert.ok(start>=0);
 const facingStatement=source.slice(start,source.indexOf('\n',start));
 vm.runInContext(fn('courtDirectionCommitted')+'\nfunction mainEnemyFacing(e,pursuitX){'+facingStatement+'}',h.ctx);
 for(const tell of [{courtCastWind:.5},{courtSecondT:.7},{courtFinal:{ruptured:true}}]){
  const actor={whiteCourtFight:true,x:100,face:1,...tell};
  assert.equal(h.ctx.courtDirectionCommitted(actor),true);
  h.ctx.mainEnemyFacing(actor,-100);assert.equal(actor.face,1,'the real main-loop assignment preserves the tell');
 }
 for(const actor of [{whiteCourtFight:true,x:100,face:1},{whiteCourtFight:false,x:100,face:1,courtCastWind:.5}]){
  assert.equal(h.ctx.courtDirectionCommitted(actor),false);
  h.ctx.mainEnemyFacing(actor,-100);assert.equal(actor.face,-1,'uncommitted actors still face their target');
 }
 p.x=e.x+300;h.ctx.beginCourtFinal(e);e.hp=e.maxHp*.2;
 h.ctx.updateCourtFinal(e,p,1/60);
 const f=e.courtFinal,origin=e.x;assert.equal(f.attack,'windup');assert.equal(f.rushDir,1);
 p.x=e.x-300;const warningFrames=Math.ceil(f.attackT*60)+2;
 for(let i=0;i<warningFrames&&f.attack==='windup';i++){
  h.ctx.mainEnemyFacing(e,p.x);h.ctx.updateCourtFinal(e,p,1/60);
  assert.equal(e.face,1);assert.equal(e.x,origin);assert.equal(f.rushDir,1);
 }
 assert.equal(f.attack,'rush');h.ctx.mainEnemyFacing(e,p.x);h.ctx.updateCourtFinal(e,p,.05);
 assert.ok(e.x>origin,'crossing behind cannot reverse the warned rush');assert.equal(e.face,1);
 p.x=e.x+23;h.ctx.mainEnemyFacing(e,p.x);h.ctx.updateCourtFinal(e,p,.05);
 assert.equal(h.damage.at(-1)[1],1,'contact knockback follows the committed rush');
 h.ctx.updateCourtFinal(e,p,f.attackT+.01);assert.equal(f.attack,'recover');
 p.x=e.x-300;h.ctx.mainEnemyFacing(e,p.x);h.ctx.updateCourtFinal(e,p,1.11);
 assert.equal(f.attack,'windup');assert.equal(f.rushDir,-1);assert.equal(e.face,-1,'the next warning commits to the new side');
});
