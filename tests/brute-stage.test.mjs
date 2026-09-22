import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
const start = source.indexOf('/* ---- STAGE 3 · BROKEN CAUSEWAY');
const end = source.indexOf('const UPDRAFTS_LEVEL', start);
const stage = source.slice(start, end);

function functionSource(name){
  const a=source.indexOf('function '+name+'('),b=source.indexOf('\nfunction ',a+1);
  assert.ok(a>=0&&b>a,name+' exists');return source.slice(a,b);
}
const constructors=['Pl','Gr','Wl','Sp','Plate','Trap','Check','CoinOb','RepairCatch'].map(functionSource).join('\n');
const makeObject=type=>(x,y,kind,options)=>({type,x,y,kind,...options});
const stageExpression=stage.slice(stage.indexOf('{len:'),stage.indexOf('\n];')).trim().replace(/,$/,'');
const authored=vm.runInNewContext(constructors+'\n('+stageExpression+')',{
  BFDialogueModule:{text:id=>id},STAGE_LORE:{2:{}},
  Scenery:makeObject('scenery'),AmbientFigure:makeObject('ambientFigure'),StoryRelic:makeObject('storyRelic'),
  OpeningBeat:(o,beat,system)=>Object.assign(o,{openingActBeat:beat,openingActSystem:system}),
  SealedRecollection:(x,y,id,title,options)=>({type:'storyRelic',x,y,id,title,...options}),
  LoreMarker:(x,y)=>({type:'lore',x,y}),Sign:(x,y,text)=>({type:'sign',x,y,text})
});
const bossGeometry=vm.runInNewContext(constructors+functionSource('bossArena')+
  ';const G={obstacles:[]};const e={type:"brute",x:'+String(authored.len-350)+',h:80};bossArena(e);({boss:e,objects:G.obstacles})',{
  OpeningBeat:(o,beat,system)=>Object.assign(o,{openingActBeat:beat,openingActSystem:system}),Scenery:makeObject('scenery')
});
const movement=vm.runInNewContext(
  await readFile(new URL('../public/bladefall-progression.js',import.meta.url),'utf8')+
  await readFile(new URL('../public/bladefall-capabilities.js',import.meta.url),'utf8')+
  await readFile(new URL('../public/bladefall-movement-progression.js',import.meta.url),'utf8')+
  ';BladefallMovementProgression.profile(BladefallCapabilities.createState()).tuning');
function jumpReach(rise){
  const disc=movement.jumpVelocity**2-2*1400*rise;
  return disc<0?-Infinity:movement.runSpeed*(movement.jumpVelocity+Math.sqrt(disc))/1400;
}
const platforms=Array.from(authored.objects).concat(Array.from(bossGeometry.objects))
  .filter(o=>o.type==='plat'&&!o.fake&&!o.gone&&!o.returnHook)
  .map(o=>({...o,left:o.x-o.w/2,right:o.x+o.w/2}));
function gap(a,b){return a.right<b.left?b.left-a.right:b.right<a.left?a.left-b.right:0;}
function routeExists(rows,from,to){
  const matches=(o,p)=>o.left<=p.x&&o.right>=p.x&&o.y===p.y;
  const seen=new Set(rows.flatMap((o,i)=>matches(o,from)?[i]:[])),queue=[...seen];
  while(queue.length){
    const i=queue.shift();if(matches(rows[i],to))return true;
    for(let j=0;j<rows.length;j++)if(!seen.has(j)&&gap(rows[i],rows[j])<=jumpReach(rows[j].y-rows[i].y)){
      seen.add(j);queue.push(j);
    }
  }
  return false;
}

test('Broken Causeway owns five long-form rooms using jump and weapon only', () => {
  assert.match(stage, /\{len:14000,portal:null,physicalExit:'return-to-black-woods'/);
  for (const landmark of ['chainwake-camp', 'drop-hoist', 'causeway-gears', 'broken-causeway-gate'])
    assert.match(stage, new RegExp(`'${landmark}'`));
  for (const boundary of ['Gr(0,2600)', 'Gr(2600,5600)', 'Gr(5600,8200)', 'Gr(8200,10500)', 'Gr(10500,14000)'])
    assert.ok(stage.includes(boundary), boundary);
  assert.doesNotMatch(stage, /\bSlate\(|\bAnchor\(|portalTruth|portalDecoy/);
  assert.match(source, /criticalCapabilities:\['jump','weapon'\]/);
});

test('Drop Yard machinery is deterministic, recoverable, and cannot softlock', () => {
  assert.match(stage, /Plate\(4050,0,'drop-yard',true\),\{trapOnly:1\}/);
  assert.match(stage, /targetCircuit:'drop-yard',resetMiss:2\.8/);
  assert.match(stage, /type:'door',x:5360.*circuit:'drop-yard'/);
  assert.match(source, /if\(o\.trapOnly\)/);
  assert.match(source, /if\(o\.hoist&&o\.state==='idle'\)/);
  assert.match(stage, /RepairCatch\(3420,130,'causeway-catch-yard'\)/);
  assert.match(stage, /RepairCatch\(4930,105,'causeway-catch-rise'\)/);
});

test('Chainwalk and Counterweight Rise offer authored route and combat choices', () => {
  assert.equal((stage.match(/upperRoute:1/g)||[]).length, 7);
  assert.equal(authored.enemies.length,5);
  assert.ok(authored.enemies.every(e=>e.noDrop&&Array.isArray(e.patrol)));
  assert.ok(authored.enemies.every(e=>e.noticeRange>0));
  for (const rise of [65,130,195,260,325])assert.match(stage,new RegExp(`Pl\\(\\d+,\\d+,${rise}`));
  assert.match(stage, /StoryRelic\(9300,360,'wristguard-bearer'/);
  assert.match(source, /if\(en\.causewayRole\)\{e\.causewayRole=en\.causewayRole;e\.authoredEncounter=true;e\.active=false;\}/);
});

test('Brute uses physical arrow targets, a remote release, and a resettable lure-and-drop transformation', () => {
  assert.match(source, /e\.portalGate='bruteRivets';e\.bruteMachineryFight=true/);
  assert.equal((source.match(/bruteRivetIndex:/g)||[]).length,3);
  assert.match(source, /bruteDropRelease:1/);
  assert.doesNotMatch(functionSource('strikeBruteWakeLever')+functionSource('strikeBruteDropRelease'),/airborneShot/);
  assert.match(source, /weight\.active=1;weight\.vy=0;weight\.resetT=0/);
  assert.match(source, /o\.active===3/);
  assert.match(source, /o\.y=Math\.min\(o\.y0,o\.y\+520\*dt\)/);
  assert.match(source, /beginBruteTransformation\(boss,o\)/);
  assert.match(source, /e\.bruteArmorBroken=true;e\.bruteState='transform'/);
  assert.match(source, /e\.bruteState='recover';e\.bruteRecover=\.72;e\.portalGate=null/);
  assert.match(source, /if\(e\.bruteRecover<=0\)e\.bruteState='pursuit'/);
  assert.match(source, /e\.bruteState='slamWind'/);
  assert.match(source, /e\.bruteState='rushWind'/);
});

test('Broken Standard introduces the bow through three physical precision rivets', () => {
  assert.match(stage, /Pl\(10840,180,65,\{archeryStep:1\}\).*Pl\(11400,210,260,\{archeryPerch:1\}\)/s);
  assert.match(stage, /Pl\(11840,150,65,\{archeryReturnStep:1\}\).*Pl\(11600,120,260,\{archeryReturnStep:1\}\)/s);
  assert.match(stage, /Scenery\(11400,260,'causeway-bow-rack'/);
  assert.match(stage, /\{x:11400,y:278,kind:'bruteBow',sourceKind:'causeway-bow-rack'\}/);
  assert.match(source, /makeWeapon\('bow','rare','Chainwake Longbow'\)/);
  assert.match(source, /e\.bruteState='dormant';\s*e\.bruteDormant=true/);
  assert.equal((source.match(/bruteWakeLever:1,bruteRivetIndex:/g)||[]).length,3);
  assert.match(source, /if\(e\.bruteDormant\)\{e\.active=false;e\.vx=0;e\.vy=0;e\.lunge=0;continue;\}/);
  assert.match(source, /boss\.bruteWakeRivets\[o\.id\]=true/);
  assert.match(source, /boss\.bruteWakeHits=Object\.keys\(boss\.bruteWakeRivets\)/);
  assert.match(source, /if\(boss\.bruteWakeHits>=need\)awakenBruteFromChain\(o,boss\)/);
  assert.equal((source.match(/bruteDropRelease:1,authoringCritical:1/g)||[]).length,2);
  assert.equal((source.match(/bruteReleaseStep:1/g)||[]).length,4);
  assert.equal((source.match(/bruteReleasePerch:1/g)||[]).length,2);
  assert.match(source,/Pl\(releaseX-300,80,55,\{bruteReleaseStep:1\}\)[\s\S]*Pl\(releaseX-220,80,110,\{bruteReleaseStep:1\}\)[\s\S]*Pl\(releaseX-105,190,170,\{bruteReleasePerch:1\}\)/);
  assert.match(source,/Pl\(weightX\+610,80,55,\{bruteReleaseStep:1\}\)[\s\S]*Pl\(weightX\+530,80,110,\{bruteReleaseStep:1\}\)[\s\S]*Pl\(weightX\+435,190,170,\{bruteReleasePerch:1\}\)/);
  assert.match(source, /bossContract:\{arrowRivets:3,remoteRelease:true,lureUnderWeight:true,missResets:true,returnStair:true,portal:false\}/);
  assert.doesNotMatch(stage, /THREE RIVETS HOLD|CUT THE CHAIN|BAIT THE BRACE/);
  assert.doesNotMatch(stage, /focus|charged|hold attack/i);
});

test('the counterweight breaks the armor without granting or requiring Focus', () => {
  assert.doesNotMatch(source, /grantWeaponTechnique\('focus','brute-counterweight'\)/);
  assert.match(source, /e\.bruteFocusArmor=false;e\.portalGate='bruteTransform'/);
  assert.match(source, /e\.bruteState='recover';e\.bruteRecover=\.72;e\.portalGate=null/);
  assert.match(source, /if\(weight\)\{weight\.active=2/);
  assert.doesNotMatch(source, /function breakBruteFocusArmor\(e\)/);
  assert.doesNotMatch(source, /HOLD ATTACK · BREAK PLATE/);
});

test('counterweight firing decks are reachable with opening jump and overlap the arrow target', () => {
  // Opening jump is 480 px/s against 1400 px/s² gravity: ~82px theoretical
  // height. Each authored rise stays comfortably below that envelope.
  const jumpHeight=(480*480)/(2*1400),rises=[55,55,60];
  assert.ok(rises.every(rise=>rise<jumpHeight),`${jumpHeight}px jump must clear ${rises.join(', ')}px rises`);
  // A bow spawns at player anchor + h/2 (44/2). Target collision accepts a
  // vertical difference strictly below 28 + arrow size (5), never equal to it.
  const deckY=170,arrowY=deckY+44/2,targetY=220,collisionRadius=28+5;
  assert.ok(Math.abs(targetY-arrowY)<collisionRadius,
    `arrow at ${arrowY} must overlap target at ${targetY} inside ${collisionRadius}px`);
});

test('Brute defeat grants Dash, records completion, and creates no exit portal', () => {
  assert.match(source, /grantPermanentCapability\('dash','brute-counterweight',\{quiet:true\}\)/);
  assert.match(source, /commitStageCompletion\(\);recordWorldClear\(\);recordStoryStageClear\(\);recordHelpedTravelers\(\)/);
  assert.match(source, /else if\(e\.whiteCourtFight\|\|e\.type==='brute'\|\|\(e\.type==='archer'&&G\.stageIndex===4\)/);
  assert.match(source, /G\.stageIndex===2&&G\.p\.x<G\.levelLength\/2.*targetStage:1/s);
  assert.match(source,/function showBruteDefeatBriefing\(\)/);
  const choice=functionSource('showBruteDefeatBriefing');
  assert.match(choice,/bruteBladeReturn/);assert.match(choice,/bruteRoadReturn/);
  assert.doesNotMatch(choice,/through the Causeway and Black Woods|in the bag/);
  assert.match(source,/if\(e\.type==='brute'&&G\.ngPlus===0\)showBruteDefeatBriefing\(\)/);
  assert.match(source,/function finishCausewayLoadout\(restoreBlade\)/);
});

test('Only Oren repair permanently opens the mandatory westbound Drop Yard gate', () => {
  assert.match(source,/if\(o\.causewayRepairShortcut\)return !!\(G\.causewayRepair&&G\.causewayRepair\.completed\)/);
  assert.doesNotMatch(source,/const causewayCleared=/);
  const gateX=Number(stage.match(/type:'door',x:(\d+).*causewayRepairShortcut:1/)[1]);
  const catches=[...stage.matchAll(/RepairCatch\((\d+),\d+,'causeway-catch-(?:yard|rise)'\)/g)].map(match=>Number(match[1]));
  assert.equal(catches.length,2);
  assert.ok(catches.every(x=>x<gateX),`both mandatory catches (${catches}) must be reachable west of gate ${gateX}`);
});

test('both repair catches and the bow have reversible approaches using the real opening jump', () => {
  assert.match(source,/target\.repairCatch\|\|target\.keepDropRelease\?'↑  RELEASE'/);
  assert.match(source,/if\(o\.repairCatch\)\{pullLever\(o\);return true;\}/);
  assert.match(stage,/Pl\(3200,170,65.*Pl\(3420,170,130/s);
  assert.match(stage,/Pl\(4700,150,50.*Pl\(4930,170,105/s);
  const west=platforms.filter(o=>o.left<5333).map(o=>({...o,right:Math.min(o.right,5333)}));
  for(const handle of authored.objects.filter(o=>o.repairCatch)){
    assert.ok(routeExists(west,{x:2680,y:0},{x:handle.x,y:handle.y}),'a single-jump route reaches '+handle.repairCatch);
    assert.ok(routeExists(west,{x:handle.x,y:handle.y},{x:2680,y:0}),'the route can return from '+handle.repairCatch);
  }
  assert.ok(routeExists(platforms,{x:10640,y:0},{x:11400,y:260}),'the bow can be reached before Dash');
  assert.ok(routeExists(platforms,{x:11840,y:0},{x:11400,y:260}),'the bow can be recovered from the arena side');
});

test('Level Select can run Oren locally without granting Focus or mutating campaign quests', () => {
  assert.match(source,/levelSelectMode:!!\(opts&&opts\.levelSelect\),sessionQuests:opts&&opts\.levelSelect\?BFQuestsModule\.createProgress\(\):null/);
  assert.match(source,/const sessionOnly=!!\(G&&G\.levelSelectMode\)/);
  assert.match(source,/capabilities:\[\.\.\.new Set\(activeCapabilityProgress\(\)&&activeCapabilityProgress\(\)\.acquired\|\|\[\]\)\]/);
  assert.match(source,/return !!\(G&&\(G\.bossRush\|\|G\.battle\)\)\|\|BFWeaponProgressionModule\.hasTechnique\(meta\.weaponTechniques,id\)/);
});

test('Up Arrow starts Oren and releases either broad-stance safety catch', () => {
  assert.match(source,/if\(o\.questActor&&talkQuestContact\(\)\)return true/);
  assert.match(source,/target\.questActor\|\|target\.kind==='survey'\|\|target\.profileId==='bram'\?'↑  TALK'/);
  assert.match(source,/else if\(o\.repairCatch\|\|o\.keepDropRelease\)\{xr=108;yr=120;\}/);
});

test('A newly offered quest remains readable longer than an ordinary toast', () => {
  assert.match(source,/before&&before\.state==='available'\?6000:undefined/);
});

test('Brute grants run-local Dash in Level Select and the seam accepts it', () => {
  assert.match(source,/function activeCapabilityProgress\(\)\{return G&&G\.sessionCapabilities\|\|meta\.capabilities;\}/);
  assert.match(source,/const sessionOnly=!!G\.levelSelectMode/);
  assert.match(source,/if\(sessionOnly\)G\.sessionCapabilities=result\.state;else meta\.capabilities=result\.state/);
  assert.match(source,/G\.levelSelectMode&&hasCapability\('dash'\)/);
  assert.match(source,/capabilities:activeCapabilityProgress\(\)&&activeCapabilityProgress\(\)\.acquired\|\|\[\]/);
});

test('Level Select hydrates fresh encounters instead of campaign boss clears', () => {
  assert.match(source,/sessionZoneState:opts&&opts\.levelSelect\?BFZoneStateModule\.createState\(\):null/);
  assert.match(source,/const state=G\.levelSelectMode\?G\.sessionZoneState:meta\.zoneState/);
  assert.match(source,/if\(G\.levelSelectMode\)G\.sessionZoneState=result\.state;else meta\.zoneState=result\.state/);
});

test('Dash turns the bruised Black Woods seam into the Updrafts road and preserves a return', () => {
  assert.match(source,/if\(o\.woodsReturnSecret&&verb==='dash-impact'\)openBlackWoodsWindShaft\(o\)/);
  assert.match(source,/function openBlackWoodsWindShaft\(sourceObject\)/);
  assert.match(source,/blackWoodsAscent:1/);
  assert.match(source,/h:1700/);
  assert.match(source,/threshold:1480/);
  assert.match(source,/inside&&G\.p\.y>=shaft\.threshold/);
  assert.match(source,/beginPhysicalBranchTransition\('black-woods-updrafts','black-woods',shaft\.sourceObject\)/);
  assert.match(source,/function beginPhysicalBranchTransition\(connector,zone,sourceObject\)/);
  assert.match(source,/BFZoneStreamer\.cross\(connector,zone,state\)/);
  assert.match(source,/sourceObject\.used=false;sourceObject\.gone=false;sourceObject\.opened=false/);
  assert.match(source,/plan\.connectorId==='black-woods-updrafts'&&plan\.targetZoneId==='updrafts'.*x=70;y=0/s);
  assert.match(source,/G\.stageIndex===3.*connector:'black-woods-updrafts'.*targetStage:1/s);
});

test('Brute transformation authority is included in co-op snapshots', () => {
  assert.match(source, /e\.bruteArmorBroken\?1:0,e\.bruteState\|\|null/);
  assert.match(source, /e\.portalGate=e\.bruteArmorBroken\?\(e\.bruteState==='transform'\?'bruteTransform':null\)/);
});

test('Causeway content is spatial, concise, and exposed for acceptance', () => {
  assert.match(stage, /residentId:'brute-chainwright'.*name:'Oren'/);
  assert.match(stage, /residentId:'brute-stretcher'.*name:'Sable'/);
  assert.match(source, /const CAUSEWAY_ROOM_CUES=Object\.freeze/);
  assert.match(source, /G\.causewayProduction=G\.stageIndex===2\?/);
  assert.match(source, /bossContract:\{arrowRivets:3,remoteRelease:true,lureUnderWeight:true,missResets:true,returnStair:true,portal:false\}/);
  assert.match(source, /causewayState:\(\)=>G&&G\.causewayProduction\|\|null/);
  assert.doesNotMatch(source,/JAMMED · ASK THE CHAINWRIGHT/);
  assert.match(source,/const repair=questRow\('release-the-causeway'\),disclosed=!!\(repair&&repair\.started\)/);
});

test('Brute deaths retry from the claimed boss-threshold checkpoint', () => {
  assert.match(source, /BFRecoveryModule\.recordDeath\(meta\.recovery,zoneId,fallback\)/);
  assert.match(source, /G\.p\.x=death\.plan\.position\.x;G\.p\.y=death\.plan\.position\.y/);
  assert.match(source, /captureCurrentZonePersistence\(\);/);
});


test('Counterweight Rise boards low lifts and transfers high on both sides of a real bulkhead',async()=>{
  const environment=vm.runInNewContext(await readFile(new URL('../public/bladefall-environment.js',import.meta.url),'utf8')+
    ';BladefallEnvironment.createEnvironment()');
  const west=platforms.find(o=>o.x===8860&&o.move),east=platforms.find(o=>o.x===9520&&o.move);
  assert.ok(west&&east,'both approaches own a moving lift');
  const bulkhead=authored.objects.find(o=>o.causewayBulkhead);
  assert.ok(bulkhead&&bulkhead.type==='wall'&&bulkhead.y===325&&bulkhead.h===325,
    'the timing route is required by actual collision geometry');
  const cap=platforms.find(o=>o.x===9300&&o.y===325),westStep=platforms.find(o=>o.x===8640),
    upperWalk=platforms.find(o=>o.x===9080),eastStep=platforms.find(o=>o.x===9740);
  const snapshots=(lift)=>{
    const low={...lift},high={...lift},period=lift.move.period,phase=lift.move.phase||0;
    environment.updateMechanism(low,(Math.PI*1.5-phase)*period/(Math.PI*2),.016);
    environment.updateMechanism(high,(Math.PI*.5-phase)*period/(Math.PI*2),.016);
    return{low,high};
  };
  const w=snapshots(west),e=snapshots(east);
  for(const [step,lift] of [[westStep,w],[eastStep,e]]){
    assert.ok(gap(step,lift.low)<=jumpReach(lift.low.y-step.y),'a low lift can be boarded without Dash');
    assert.ok(gap(step,lift.high)>jumpReach(lift.high.y-step.y),'waiting for a lift is a meaningful timing choice');
  }
  assert.ok(gap(w.high,upperWalk)<=jumpReach(upperWalk.y-w.high.y));
  assert.ok(gap(upperWalk,cap)<=jumpReach(cap.y-upperWalk.y));
  assert.ok(gap(e.high,cap)<=jumpReach(cap.y-e.high.y),'the east lift can return to the crown before Dash');
  assert.ok(gap(cap,e.high)<=jumpReach(e.high.y-cap.y));
  assert.ok(!authored.enemies.some(e=>e.causewayRole==='rise-diver'),'the lift transfer does not overlap a second aerial encounter');
});
