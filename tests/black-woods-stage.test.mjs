import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';

const source=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
const campaign=readFileSync(new URL('../public/bladefall-campaign.js',import.meta.url),'utf8');
const progression=readFileSync(new URL('../public/bladefall-progression.js',import.meta.url),'utf8');
const shops=readFileSync(new URL('../public/bladefall-shops.js',import.meta.url),'utf8');
const start=source.indexOf('/* ---- STAGE 2 · BLACK WOODS');
const end=source.indexOf('/* ---- STAGE 3 · BROKEN CAUSEWAY',start);
const stage=source.slice(start,end);

function sourceFunction(name){
  const a=source.indexOf('function '+name+'('),b=source.indexOf('\nfunction ',a+1);
  assert.ok(a>=0&&b>a,'production function exists: '+name);
  return source.slice(a,b);
}
function sourceBetween(from,to){
  const a=source.indexOf(from),b=source.indexOf(to,a+from.length);
  assert.ok(a>=0&&b>a,'production block exists: '+from);
  return source.slice(a,b);
}
const read=name=>readFileSync(new URL('../public/'+name,import.meta.url),'utf8');
const systems=runInNewContext(progression+read('bladefall-capabilities.js')+
  read('bladefall-movement-progression.js')+read('bladefall-weapon-progression.js')+
  read('bladefall-equipment-economy.js')+
  ';({capabilities:BladefallCapabilities,movement:BladefallMovementProgression,weapon:BladefallWeaponProgression,equipment:BladefallEquipmentEconomy})');
const Dialogue=createRequire(import.meta.url)('../public/bladefall-dialogue.js');
const makeObject=type=>(x,y,kind,options)=>({type,x,y,kind,...options});
const authored=runInNewContext(
  source.slice(source.indexOf('function Pl('),source.indexOf('function Gr('))+
  source.slice(source.indexOf('function Gr(')).split('\n')[0]+
  '\n('+stage.slice(stage.indexOf('{len:')).trim().replace(/,$/,'')+')',{
    BFDialogueModule:Dialogue,STALAC_Y:900,HANG_STALAC:850,
    Scenery:makeObject('scenery'),AmbientFigure:makeObject('ambientFigure'),
    StoryRelic:makeObject('storyRelic'),
    SealedRecollection:(x,y,zone,title,options)=>({type:'storyRelic',x,y,zone,title,...options}),
    Wl:(x,y,h,w)=>({type:'wall',x,y,h,w}),
    Sp:(x,y,options)=>({type:'spike',x,y,...options}),
    Sign:(x,y,text)=>({type:'sign',x,y,text}),
    Check:(x,y)=>({type:'check',x,y}),CoinOb:(x,y)=>({type:'coin',x,y})
  });
function surfaces(){
  return authored.objects.filter(o=>o.type==='plat'&&!o.fake&&!o.returnHook)
    .map(o=>({...o,left:o.x-o.w/2,right:o.x+o.w/2}));
}
function jumpReach(rise){
  // Use the production opening speed and jump. Constant gravity deliberately
  // ignores the held-jump apex bonus: the route must work without that aid.
  const {jumpVelocity,runSpeed}=systems.movement.profile(systems.capabilities.createState()).tuning;
  const gravity=1400,disc=jumpVelocity*jumpVelocity-2*gravity*rise;
  return disc<0?-Infinity:runSpeed*(jumpVelocity+Math.sqrt(disc))/gravity;
}
function gap(a,b){return a.right<b.left?b.left-a.right:b.right<a.left?a.left-b.right:0;}
function routeExists(rows,from,to){
  const matches=(row,point)=>row.left<=point.x&&row.right>=point.x&&row.y===point.y;
  const starts=rows.map((row,i)=>matches(row,from)?i:-1).filter(i=>i>=0);
  const goals=new Set(rows.map((row,i)=>matches(row,to)?i:-1).filter(i=>i>=0));
  const seen=new Set(starts),queue=[...starts];
  while(queue.length){
    const i=queue.shift();if(goals.has(i))return true;
    for(let j=0;j<rows.length;j++)if(!seen.has(j)&&gap(rows[i],rows[j])<=jumpReach(rows[j].y-rows[i].y)){
      seen.add(j);queue.push(j);
    }
  }
  return false;
}

test('Black Woods is a long-form five-room physical stage with no portal verb',()=>{
  assert.match(stage,/\{len:12400,portal:null,physicalExit:'black-woods-brute'/);
  for(const room of ['MOTHLIGHT REFUGE','OATHBLADE CLEARING','BITING CANOPY','MIRROR THICKET','ROOTBOUND PASSAGE'])
    assert.match(source,new RegExp(room));
  assert.doesNotMatch(stage,/\bSlate\(|\bAnchor\(|\bspSelfFling\(/);
  assert.match(campaign,/systems: \['weapon-awakening', 'single-jump-combat', 'false-surfaces'/);
  assert.doesNotMatch(campaign.slice(campaign.indexOf("id: 'black-woods'"),campaign.indexOf("id: 'brute'")),/portalVerb:/);
});

test('the refuge is enemy-free and spaces each resident, shop, and boundary landmark',()=>{
  assert.match(stage,/Gr\(0,2400\)/);
  assert.match(stage,/AmbientFigure\(430,0,'clock-keeper'/);
  assert.match(stage,/AmbientFigure\(1550,0,'resin-worker'/);
  assert.match(stage,/AmbientFigure\(2190,0,'quiet-veteran'/);
  assert.match(shops,/id: 'ethereal-goods', stageIndex: 1, x: 980/);
  const firstEnemy=stage.indexOf("{t:'grunt'");
  assert.ok(firstEnemy>stage.indexOf('Gr(9700,12400)'),'enemy declarations remain outside the authored object rooms');
  const baseEnemies=stage.slice(stage.indexOf(' enemies:['),stage.indexOf(' /* NG+1'));
  const enemyXs=[...baseEnemies.matchAll(/\{t:'[^']+',x:(\d+)/g)].map(match=>Number(match[1]));
  assert.ok(enemyXs.every(x=>x>=2400),'the refuge must not contain authored enemies');
});

test('the Oathblade owns a quiet acquisition beat before the first authored duel',()=>{
  assert.match(stage,/Scenery\(2800,0,'oathblade-stump'.*weaponAwakening:1/);
  assert.match(stage,/loot:\[\{x:2800,y:40,kind:'firstWeapon',sourceKind:'oathblade-stump'\}/);
  assert.match(source,/if\(best\.acquisitionId===BFWeaponProgressionModule\.FIRST_WEAPON\.id\)\s*return acquireAuthoredFirstWeapon\(best\)/);
  assert.match(stage,/\{t:'grunt',x:3650,patrol:\[3540,3900\].*forestRole:'oathblade-guard'/);
  assert.match(source,/if\(en\.forestRole\)\{e\.forestRole=en\.forestRole;e\.authoredEncounter=true;e\.active=hasCapability\('weapon'\);[\s\S]*?e\.forestCooldown=\.4\+\(en\.x%7\)\*\.11;/);
  assert.match(source,/for\(const enemy of G\.enemies\|\|\[\]\)if\(enemy\.authoredEncounter&&!enemy\.dead\)enemy\.active=true/);
  assert.match(source,/if\(G\.stageIndex>2&&!e\.boss&&!e\.creepy&&!a\.muster&&gameChance\('enemy'/);
});

test('Biting Canopy combines only single-jump rises, recoverable ground, thorn rhythm, and combat',()=>{
  assert.match(stage,/Gr\(4200,6700\),Check\(4280,0\)/);
  for(const rise of [65,130,195,260,325,250,185])assert.match(stage,new RegExp(`Pl\\(\\d+,\\d+,${rise}`));
  assert.equal((stage.match(/Sp\([^\n]+period:3\.[02]/g)||[]).length,3);
  assert.match(stage,/StoryRelic\(5420,360,'red-clasp'/);
  assert.match(stage,/forestRole:'canopy-controller'/);
  assert.match(stage,/forestRole:'canopy-diver'/);
});

test('Mirror Thicket uses wind-facing resin as one rule without an alternating answer pattern',()=>{
  assert.match(stage,/Gr\(6700,9700\),Check\(6780,0\)/);
  const thicket=stage.slice(stage.indexOf('// ROOM 4'),stage.indexOf('// ROOM 5'));
  assert.equal((thicket.match(/mirrorCopy:1/g)||[]).length,6);
  assert.equal((thicket.match(/mirrorTruth:1/g)||[]).length,8);
  assert.match(thicket,/resin-streamer'.*windDir:1/);
  assert.match(thicket,/resin-streamer'.*windDir:-1/);
  const choices=[];
  for(const match of thicket.matchAll(/Pl\((\d+),[^\n]+?(mirrorTruth:1|mirrorCopy:1)[^\n]*\)/g))
    choices.push({x:Number(match[1]),kind:match[2]==='mirrorTruth:1'?'T':'F'});
  const pattern=choices.sort((a,b)=>a.x-b.x).map(row=>row.kind).join('');
  assert.match(pattern,/TT/,'truths must sometimes be consecutive');
  assert.match(pattern,/FF/,'copies must sometimes be consecutive');
  assert.match(source,/const windward=dir>0\?-w\/2\+7:w\/2-43,leeward=dir>0\?w\/2-43:-w\/2\+7/);
  assert.match(source,/const rx=honest\?windward:leeward/);
  assert.doesNotMatch(source,/addText\(o\.x,GROUND_Y-o\.y-30,'FAKE!'/);
  assert.match(source,/if\(o\.portalDecoy&&o\.lampSeen\)/);
  assert.match(stage,/Object\.assign\(Wl\(9600,620,620,54\),\{slickL:1,slickR:1,rootWall:1,returnClingAfterGrip:1\}\)/);
  assert.match(stage,/Pl\(9600,220,620,\{truthSurface:1,rootboundCrown:1\}\)/);
});

test('Rootbound Passage gives the east side of the wall a reversible, hazardous platform route',()=>{
  const passage=stage.slice(stage.indexOf('// ROOM 5'),stage.indexOf(' ],\n npcs:'));
  assert.match(passage,/Check\(9780,560\)/);
  assert.equal((passage.match(/rootboundStep:1/g)||[]).length,8);
  assert.equal((passage.match(/rootThorns:1/g)||[]).length,4);
  assert.doesNotMatch(passage,/mirrorCopy:1/);
  const steps=[...passage.matchAll(/Pl\((\d+),(\d+),(\d+),\{truthSurface:1,rootboundStep:1\}/g)]
    .map(match=>({x:Number(match[1]),w:Number(match[2]),y:Number(match[3])}));
  assert.deepEqual(steps.map(step=>step.y),[560,490,420,350,280,210,140,70]);
  for(let i=1;i<steps.length;i++){
    assert.ok(Math.abs(steps[i].y-steps[i-1].y)<=70,'each reverse climb stays within the single jump rise');
    assert.ok(steps[i].x-steps[i-1].x-(steps[i].w+steps[i-1].w)/2<=60,'each step has a deliberate reachable gap');
  }
  assert.match(stage,/CoinOb\(10690,302\)/);
  assert.match(stage,/\{x:6320,y:285,kind:'namedMantle'.*name:'Mothsilk Mantle'.*sourceKind:'canopy-veteran-rack'\}/);
  assert.match(source,/if\(o\.rootThorns\)/);
});

test('Level 2 inherits compact anchored dialogue and Up-to-reread behavior',()=>{
  assert.match(source,/if\(!G\|\|G\.stageIndex<0\|\|G\.stageIndex>V4_LAST_STAGE\|\|!source\)return false/);
  assert.match(source,/const rooms=G\.stageIndex===0\?OUTSKIRTS_ROOM_CUES:G\.stageIndex===1\?BLACK_WOODS_ROOM_CUES:G\.stageIndex===2\?CAUSEWAY_ROOM_CUES:G\.stageIndex===5\?RUINED_KEEP_ROOM_CUES:G\.stageIndex===7\?FROSTFELL_ROOM_CUES:G\.stageIndex===8\?WHITE_COURT_ROOM_CUES:WARDEN_ROOM_CUES/);
  assert.match(source,/G\.stageIndex>=0&&G\.stageIndex<=4\)showOutskirtsAnnotation\(o,loreHtml/);
  assert.match(source,/if\(G\.stageIndex===1\)showOutskirtsAnnotation\(n,greeting/);
  assert.match(source,/G\.stageIndex<0\|\|G\.stageIndex>V4_LAST_STAGE/);
  assert.match(source,/wrapAnnotationLines\(c,a\.body,width-pad\*2,kind==='person'\?4:3\)/);
  assert.match(source,/function outskirtsAnnotationKind\(source,options\)/);
});

test('the dash return secret is visible early, capability-gated, and persistent',()=>{
  assert.match(stage,/Scenery\(6470,260,'root-seam'.*returnHook:'dash'.*vaultKeyId:'root-key'.*secretVerb:'dash-impact'/s);
  assert.match(stage,/secretCue:'One old root seam is bruised as if it remembers speed\.'/);
  assert.match(source,/meta\.loreRead\['black-woods-root-seam'\]=true;sightVaultSecretObject\(o\);persist\(\)/);
  assert.match(source,/o\.read=!!meta\.loreRead\['black-woods-root-seam'\]/);
  assert.match(progression,/\{ id: 'root-key', zone: 'black-woods'.*requirements: \['dash'\], returnVisit: true \}/);
});

test('all ordinary encounters are authored and the refuge cannot receive ecology filler',()=>{
  assert.equal(authored.enemies.length,6);
  assert.ok(authored.enemies.every(e=>Array.isArray(e.patrol)&&e.patrol.length===2));
  assert.ok(authored.enemies.every(e=>e.noticeRange>0));
  assert.match(source,/if\(G\.stageIndex>4\)seedVariantEnemies\(\)/);
  for(const role of ['oathblade-guard','canopy-controller','canopy-diver','root-stalker','root-guard','tunnel-controller'])
    assert.match(stage,new RegExp(`forestRole:'${role}'`));
});

test('the forest encounter system owns readable perception and terrain-specific behavior loops',()=>{
  assert.match(source,/function updateForestPerception\(e,target,dt\)/);
  assert.match(source,/const insideCone=\(ahead&&Math\.abs\(dy\)<Math\.max\(96,Math\.abs\(dx\)\*\.68\)\)\|\|distance<170/);
  assert.match(source,/BFAISystem\.lineOfSight\(e,target\)/);
  assert.match(source,/awareness=e\.forestSight>=\.34\?'alert':e\.forestAlertT>0\?'search':e\.forestSight>\.08\?'suspicious':'unaware'/);
  assert.match(source,/Math\.max\(20,lo-900\).*Math\.min\(G\.levelLength-20,hi\+900\)/);
  const roles=['canopy-controller','tunnel-controller','canopy-diver','mirror-diver','root-stalker','oathblade-guard','mirror-pursuer','root-guard'];
  for(const role of roles)assert.match(source,new RegExp(`e\\.forestRole==='${role}'`));
  assert.match(source,/function forestSeedAttack\(e,target,sense,dt,eff,tunnel\)/);
  assert.match(source,/function updateForestDiver\(e,target,sense,dt,eff,mirror\)/);
  assert.match(source,/function updateForestStalker\(e,target,sense,dt,eff\)/);
  assert.match(source,/function updateForestDuelist\(e,target,sense,dt,eff,profile\)/);
  assert.match(source,/if\(updateForestEncounter\(e,target,dt,eff\)\)return/);
  assert.match(source,/e\.forestContactDanger\|\|e\.boss\|\|\s*\(!e\.forestRole&&BFAISystem\.directive\(e\)\.attack\)/s);
});

test('forest roles telegraph their commitments and react to the authored landscape',()=>{
  assert.match(source,/e\.forestRole==='mirror-pursuer'\|\|e\.forestRole==='mirror-diver'/);
  assert.match(source,/e\.forestNoiseX=o\.x;e\.forestNoiseY=o\.y;e\.forestNoiseT=3\.2/);
  assert.match(source,/forestEncounterState\(e,'seed-wind'.*'ROOTS'/s);
  assert.match(source,/G\.aoes\.push\(\{x:e\.forestAimX,y:e\.forestAimY,r:radius,t:\.72/);
  assert.match(source,/forestEncounterState\(e,'dive-mark'.*mirror\?'FEINT':'DIVE'/s);
  assert.match(source,/forestEncounterState\(e,'veil',\.62\)/);
  assert.match(source,/cue:'SALUTE'/);
  assert.match(source,/cue:'HUNT'/);
  assert.match(source,/cue:'BRACE',shield:true/);
  assert.match(source,/e\.forestMode==='seed-wind'.*e\.forestAimX/s);
  assert.match(source,/e\.forestMode==='dive-mark'.*e\.forestDiveX/s);
  assert.match(stage,/patrol:\[10155,10305\].*forestRole:'root-stalker'/);
  assert.match(stage,/patrol:\[10845,10995\].*forestRole:'root-guard'/);
});

test('Black Woods and Broken Causeway share a bidirectional physical root tunnel',()=>{
  assert.match(source,/G\.stageIndex===1&&G\.p\.x>G\.levelLength\/2.*connector:'black-woods-brute'.*zone:'black-woods'.*targetStage:2/s);
  assert.match(source,/G\.stageIndex===2&&G\.p\.x<G\.levelLength\/2.*connector:'black-woods-brute'.*zone:'brute'.*targetStage:1/s);
  assert.match(stage,/Scenery\(12240,0,'root-tunnel'.*routeReveal:'brute'/);
  assert.ok(!authored.objects.some(o=>o.type==='sign'),'the physical tunnel does not need an instructional exit sign');
});

test('the runtime exposes a Level 2 production receipt for playable acceptance',()=>{
  assert.match(source,/G\.blackWoodsProduction=G\.stageIndex===1\?/);
  assert.match(source,/rooms:\['mothlight-refuge','oathblade-clearing','biting-canopy','mirror-thicket','rootbound-passage'\]/);
  assert.match(source,/criticalCapabilities:\['jump','weapon'\],portalFree:/);
  assert.match(source,/refugeEnemies:\(G\.enemies\|\|\[\]\)\.filter/);
  assert.match(source,/authoredEncounters:\(G\.enemies\|\|\[\]\)\.filter\(e=>e\.authoredEncounter\)/);
  assert.match(source,/blackWoodsState:\(\)=>G&&G\.blackWoodsProduction\|\|null/);
});

test('Bram’s truth lesson concludes at the root wall instead of a stage boundary Black Woods never reaches',()=>{
  // Black Woods leaves through physical zone streaming, so nextStage()'s escort
  // payoff cannot fire here and Bram was previously never marked done at all.
  assert.match(source,/function concludeRootboundLesson\(n,p\)\{/);
  assert.match(source,/if\(G\.stageIndex!==1\|\|n\.profileId!=='bram'\|\|n\.done\|\|n\.state!=='follow'\)return false;/);
  // The conclusion is anchored to the authored wall, not a hard-coded x.
  assert.match(source,/const wall=G\.obstacles\.find\(o=>o\.rootWall&&!o\.gone\);/);
  assert.match(source,/if\(!wall\|\|p\.x<wall\.x\+wall\.w\|\|n\.x>=wall\.x\)return false;/);
  assert.match(source,/rootWall:1/);
  // It persists, so a reload or revisit restores his finished state.
  assert.match(source,/recordQuestEvent\(\{type:'traveler-helped',target:n\.profileId\},true\);/);
  assert.match(source,/if\(concludeRootboundLesson\(n,p\)\)continue;/);
  // Authored levels pay in their own currency, not a random legendary.
  assert.match(source,/if\(n\.profileId==='bram'\)\{\n\s*addGold\(60\);restoreBlood\(G\.p,Infinity\);persist\(\);/);
  // The escort plate mechanism needs Companion Command, which is not earned
  // until Emberdeep, so it must not be what gates his conclusion.
  const conclusion=source.slice(source.indexOf('function concludeRootboundLesson'),source.indexOf('function followerPathBlocked'));
  assert.doesNotMatch(conclusion,/followerOnly|FollowerPlate|companion/i);
});

test('the mirror ascent and root wall remain reversible with the real single jump',()=>{
  const rows=surfaces(),truths=rows.filter(o=>o.mirrorTruth).sort((a,b)=>a.x-b.x);
  assert.equal(systems.movement.profile(systems.capabilities.createState()).maxJumps,1);
  assert.equal(truths.length,8);
  const route=[rows.find(o=>o.left===6700&&o.y===0),...truths,rows.find(o=>o.rootboundCrown)];
  for(let i=1;i<route.length;i++){
    assert.ok(gap(route[i-1],route[i])<=jumpReach(route[i].y-route[i-1].y),`single jump reaches truth ${i}`);
    assert.ok(gap(route[i-1],route[i])<=jumpReach(route[i-1].y-route[i].y),`single jump returns from truth ${i}`);
  }
  assert.ok(routeExists(rows,{x:6900,y:0},{x:9600,y:620}),'honest surfaces alone reach the crown');
  assert.ok(routeExists(rows,{x:12200,y:0},{x:9600,y:620}),'east staircase reaches the crown without wall jump');
  assert.ok(authored.objects.some(o=>o.type==='check'&&o.x===8510&&o.y===280),'the checkpoint stands at the midpoint truth');
  assert.ok(authored.enemies.every(e=>e.x<6700||e.x>=9700),'the reading puzzle has no simultaneous encounter');
});

test('late false choices land on recoverable shelves without erasing the resin rule',()=>{
  const catches=surfaces().filter(o=>o.mirrorRest);
  assert.deepEqual(Array.from(catches,o=>[o.x,o.w,o.y]),[[8570,400,210],[9230,360,350]]);
  const floor=runInNewContext(sourceFunction('platTop')+sourceFunction('getFloor')+';getFloor',{
    G:{obstacles:authored.objects.map(o=>({...o,gone:!!o.mirrorCopy}))}
  });
  for(const fake of authored.objects.filter(o=>o.mirrorCopy)){
    const landing=floor(fake.x,fake.y-5);
    assert.ok(landing.o&&!landing.o.fake,`copy ${fake.x} has a real landing`);
    assert.ok(routeExists(surfaces(),{x:fake.x,y:landing.y},{x:9600,y:620}),`copy ${fake.x} can recover to the crown`);
  }
  assert.ok(floor(8625,320).o.mirrorRest,'a failed reversed-wind choice catches partway down');
  for(const shelf of catches){
    assert.ok(shelf.truthSurface,'catch shelves use honest bark');
    assert.ok(routeExists(surfaces(),{x:shelf.x,y:shelf.y},{x:9600,y:620}),'each catch supports recovery');
  }
});

test('the first duel is short without changing later encounter health',()=>{
  const block=sourceBetween('    if(en.forestRole){','    if(en.causewayRole)');
  for(const [role,expected] of [['oathblade-guard',20],['root-guard',46],['canopy-controller',46]]){
    const e={x:3400,y:0,hp:46,maxHp:46};
    runInNewContext(block,{e,en:{x:e.x,forestRole:role},G:{ngHp:1},hasCapability:()=>false});
    assert.equal(e.hp,expected);assert.equal(e.maxHp,expected);
    assert.equal(e.active,false,'forest encounters remain dormant before steel is earned');
  }
});

test('duelist windup and lunge keep the direction shown before the player crosses over',()=>{
  const e={x:100,y:0,face:1,forestHomeX:100,patrolMin:0,patrolMax:200,forestMode:'advance',forestTimer:0};
  const target={x:160,y:0},sense={engaged:true,awareness:'alert',clear:true,lastX:160};
  const update=runInNewContext(sourceFunction('forestEncounterState')+sourceFunction('updateForestDuelist')+';updateForestDuelist',{
    G:{levelLength:12400,time:0},forestPatrol:()=>{},outskirtsEncounterMove:()=>false,enemyGroundStep:(_,dx)=>dx
  });
  update(e,target,sense,.01,62,{shield:true});
  assert.equal(e.forestMode,'strike-wind');assert.equal(e.forestCommitDir,1);
  target.x=40;sense.lastX=40;
  update(e,target,sense,.01,62,{shield:true});
  assert.equal(e.face,1,'crossing behind cannot swivel the warned attack');
  assert.equal(e.shieldFace,1,'the shield stays on the displayed side');
  sense.engaged=false;sense.awareness='unaware';sense.clear=false;
  e.forestTimer=0;update(e,target,sense,.01,62,{shield:true});
  assert.equal(e.forestMode,'lunge','losing sight cannot cancel an already warned attack');
  e.forestTimer=.2;const before=e.x;update(e,target,sense,.05,62,{shield:true});
  assert.ok(e.x>before,'the committed lunge travels away from the dodging player');
  e.forestTimer=0;update(e,target,sense,.01,62,{shield:true});
  assert.equal(e.forestMode,'recover');assert.equal(e.frontShield,false);
});

test('the stalker chooses a visible destination at veil entry and keeps it until reappearance',()=>{
  const e={x:10230,y:420,face:1,forestHomeX:10230,forestHomeY:420,
    patrolMin:10155,patrolMax:10305,forestMode:'perch',forestTimer:0,forestCooldown:0};
  const target={x:10300,y:420,face:1},sense={engaged:true,awareness:'alert',clear:true};
  const probes=[];
  const update=runInNewContext(sourceFunction('forestEncounterState')+sourceFunction('updateForestStalker')+';updateForestStalker',{
    forestPatrol:()=>{},enemyGroundStep:(_,dx)=>dx,
    getFloor:(x,y)=>{probes.push([x,y]);return{o:{type:'plat'},y:420};}
  });
  update(e,target,sense,.01,62);
  assert.equal(e.forestMode,'veil');assert.equal(e.forestTeleportX,10224);assert.equal(e.forestTeleportY,420);
  target.x=10155;target.y=0;target.face=-1;
  e.forestTimer=0;update(e,target,sense,.01,62);
  assert.equal(e.x,10224);assert.equal(e.y,420);
  assert.equal(e.safeX,e.x);assert.equal(e.safeY,e.y);
  assert.equal(probes.length,1,'the destination is not retargeted at the last instant');
  assert.equal(e.forestMode,'strike-wind','reappearance grants a separate reaction window');
});

function equipmentHarness(){
  const G={stageIndex:1,ngPlus:0,particles:[],pickups:[],
    enemies:[{authoredEncounter:true,active:false},{authoredEncounter:true,dead:true,active:false}],
    p:{x:2800,y:40,h:38,hp:60,blood:3,maxBlood:5,weapon:null,gear:{helmet:null,chest:null,legs:null}}};
  const meta={soundOn:false,capabilities:systems.capabilities.createState(),
    inventory:{items:Array.from({length:24},(_,i)=>({id:'bag-'+i,sourceId:'legacy-'+i}))}};
  const saved=[],remembered=[],Blood=createRequire(import.meta.url)('../public/bladefall-blood.js');
  const pickupLoop=sourceBetween('  for(const pk of G.pickups){if(pk.taken)continue;pk.bob=', '\n  // Chests');
  const api=runInNewContext(
    ['equipProgressionWeapon','acquireAuthoredFirstWeapon','enforceWeaponPickupAccess','acquireAuthoredMantle',
      'itemInQuickRange','collectNearbyItem','recomputeArmor','syncBloodMirror'].map(sourceFunction).join('\n')+
    `;({take:acquireAuthoredFirstWeapon,mantle:acquireAuthoredMantle,manual:collectNearbyItem,tick(dt=.016){const p=G.p;${pickupLoop}}})`,{
      G,meta,GROUND_Y:600,QUICK_ITEM_X:58,QUICK_ITEM_Y:54,SLOTIDS:['helmet','chest','legs'],
      V4_LAST_STAGE:9,v4Region:i=>i>=0&&i<=9,
      BFWeaponProgressionModule:systems.weapon,BFEquipmentEconomyModule:systems.equipment,BFBloodModule:Blood,
      BFWorldModule:{stageId:index=>index===1?'black-woods':'outskirts'},BFCachedWeaponProfile:{},
      BFWeaponProgression:{recordEquip:()=>{},recordAcquisition:()=>{}},
      BFInventoryModule:{collect:()=>{throw Error('authored acquisition must not touch the bag');}},
      activeCapabilityProgress:()=>meta.capabilities,
      hasCapability:id=>systems.capabilities.has(meta.capabilities,id),weaponCompatibilityMode:()=>false,
      grantPermanentCapability:(id,source)=>{
        const result=systems.capabilities.grant(meta.capabilities,id,{zone:'black-woods',earned:true,source});
        meta.capabilities=result.state;return result;
      },
      coopRememberPickupTaken:pk=>remembered.push(pk),
      snapOf:p=>JSON.parse(JSON.stringify(p)),saveRunAtStage:(_,snap)=>saved.push(snap),
      BFAISystem:{lineOfSight:()=>true},lockedWeaponFeedback:()=>{},
      vitalityKnotCount:()=>0,effMaxHp:()=>100,noteItem:()=>{},persist:()=>{},hudUpdate:()=>{}
    });
  return{G,meta,saved,remembered,api};
}
function oathblade(){return{x:2800,y:40,ritualLocked:true,authoredAcquisition:true,
  acquisitionId:systems.weapon.FIRST_WEAPON.id,weapon:{arche:'sword',rarity:'common',name:'Recovered Oathblade',dmg:10}};}
function mantle(defense=80){return{x:2800,y:40,autoEquip:true,authoredAcquisition:true,
  armor:{slot:'chest',name:'Mothsilk Mantle',rarity:'uncommon',defense,baseDefense:defense,affixes:[],mantle:true}};}

test('the released Oathblade equips on contact even with a full bag and preserves capability order',()=>{
  const {G,meta,saved,remembered,api}=equipmentHarness(),pk=oathblade(),bag=JSON.stringify(meta.inventory);
  G.pickups.push(pk);api.tick();
  assert.equal(pk.taken,undefined,'the intact root binding prevents contact acquisition');
  assert.equal(api.take(pk),false,'manual taking also respects the binding');
  assert.equal(systems.capabilities.has(meta.capabilities,'weapon'),false);
  pk.ritualLocked=false;api.tick();
  assert.equal(pk.taken,true);assert.equal(G.p.weapon.name,'Recovered Oathblade');
  assert.deepEqual(Array.from(meta.capabilities.acquired),['jump','weapon']);
  assert.equal(JSON.stringify(meta.inventory),bag,'progression never needs space in a legacy bag');
  assert.equal(G.p.blood,3);assert.equal(G.p.hp,60);
  assert.equal(G.enemies[0].active,true);assert.equal(G.enemies[1].active,false);
  assert.equal(G.pickups.length,0);assert.equal(remembered.length,1);
  assert.equal(G.checkpointLoadout.weapon.name,'Recovered Oathblade');
  assert.equal(saved.at(-1).weapon.name,'Recovered Oathblade');
  assert.equal(api.take(pk),false,'a spent source does not grant a second receipt');
  const other=equipmentHarness(),manual=oathblade();manual.ritualLocked=false;other.G.pickups.push(manual);
  assert.equal(other.api.manual(),true,'the pickup key still works for a released blade');
});

test('the mantle equips a better ward on touch, preserves stronger gear, and permits a deliberate swap',()=>{
  const {G,meta,api,saved,remembered}=equipmentHarness(),pk=mantle(),bag=JSON.stringify(meta.inventory);
  G.pickups.push(pk);api.tick();
  assert.equal(pk.taken,true);assert.equal(G.p.gear.chest.defense,80);
  assert.equal(G.p.blood,3);assert.equal(G.p.hp,60,'equipment does not restore lost Blood');
  assert.equal(JSON.stringify(meta.inventory),bag);
  assert.equal(saved.at(-1).gear.chest.name,'Mothsilk Mantle');
  const stronger=systems.equipment.normalizeArmor(mantle(120).armor);
  G.p.gear.chest=stronger;
  for(const defense of [80,120]){
    const weaker=mantle(defense);G.pickups=[weaker];api.tick();
    assert.equal(weaker.taken,undefined,'contact leaves equal or weaker ward in the world');
    assert.equal(G.p.gear.chest,stronger);
  }
  const deliberate=mantle(80);G.pickups=[deliberate];
  assert.equal(api.manual(),true);assert.equal(G.p.gear.chest.defense,80);
  assert.equal(G.p.blood,3);assert.equal(G.p.hp,60);
  assert.equal(remembered.length,2,'only actual acquisitions consume a pickup');
});

test('Bram is the deliberate speaking encounter and his wall reward is paid only once',()=>{
  for(const id of ['woods-clockkeeper','woods-resinworker','woods-veteran']){
    const resident=authored.objects.find(o=>o.residentId===id);
    assert.ok(resident.quietV4,'refuge residents remain scenery without interrupting dialogue');
  }
  const start="    if(n.kind==='escort'){",stop="      } else if(n.state==='follow'||n.state==='wait'||n.state==='send'){";
  const greeting=sourceBetween(start,stop).slice(start.length);
  const n={profileId:'bram',kind:'escort',state:'idle',x:6900,y:0},
    G={stageIndex:1,npcs:[n],p:{x:6900,y:0,blood:3},obstacles:authored.objects},meta={soundOn:false,gold:0};
  let heals=0;const annotations=[],events=[];
  const api=runInNewContext(sourceFunction('concludeRootboundLesson')+
    sourceFunction('coopTravelerIndex')+sourceFunction('coopGrantTravelerReward')+
    `;({talk(residentInteraction){const near=true;${greeting}}},conclude:()=>concludeRootboundLesson(n,G.p),reward:()=>coopGrantTravelerReward(n)})`,{
      n,G,meta,profile:{greeting:Dialogue.text('woods.bram.first')},BFDialogueModule:Dialogue,
      TRAVELER_PROFILES:{wanderer:{}},travelerProfile:()=>({rescue:'I will keep the lamp here.'}),travelerLabel:()=> 'Bram',
      showOutskirtsAnnotation:(_,html)=>annotations.push(html),coopSendTravelerIntent:()=>{},
      recordQuestEvent:event=>events.push(event),addGold:n=>{meta.gold+=n;},
      restoreBlood:p=>{heals++;p.blood=5;},persist:()=>{},addText:()=>{},GROUND_Y:600
    });
  api.talk(null);assert.equal(n.state,'idle');assert.equal(annotations.length,0);
  api.talk(n);assert.equal(n.state,'follow');assert.equal(annotations.length,1);
  assert.equal(api.conclude(),false,'talk alone does not award completion');
  G.p.x=9700;n.x=9520;assert.equal(api.conclude(),true);
  assert.equal(n.done,true);assert.equal(n.state,'wait');assert.equal(meta.gold,60);assert.equal(heals,1);
  assert.equal(api.conclude(),false);assert.equal(api.reward(),false);
  assert.equal(meta.gold,60);assert.equal(heals,1);
  assert.ok(events.some(e=>e.type==='traveler-helped'&&e.target==='bram'),'completed lesson is recorded for reloads');
});
