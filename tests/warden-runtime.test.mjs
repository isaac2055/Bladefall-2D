import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const source=await readFile(new URL('../public/index.html',import.meta.url),'utf8');

function functionSource(name){
  const start=source.indexOf(`function ${name}(`);assert.ok(start>=0,`${name} exists`);
  const brace=source.indexOf('{',start);let depth=0;
  for(let i=brace;i<source.length;i++){
    if(source[i]==='{')depth++;
    else if(source[i]==='}'&&--depth===0)return source.slice(start,i+1);
  }
  throw new Error(`unterminated ${name}`);
}

function harness(){
  const boss={type:'warden',x:1500,y:0,w:68,h:82,hp:300,maxHp:300,phase:1,wardenPhase:1,
    wardenState:'pursuit',wardenStateT:0,wardenRushCd:2,wardenSlamCd:2,wardenSentenceCd:5,
    wardenPortalBreakCd:5,wardenPortalBreakSide:0,wardenArenaL:300,wardenArenaR:2700,
    speed:76,dmg:20,face:1};
  const p={x:2200,y:0,h:56,wardenFlankT:0};
  const obstacles=Array.from({length:5},(_,i)=>({wardenTurningCourt:1,x:500+i*350,y:i*30,
    x0:500+i*350,y0:i*30,wardenTurnMove:{dx:i===4?260:0,dy:100+i*20,period:4,phase:i}}));
  obstacles.push({wardenCourtRotor:1,hazard:0,dormant:1},{wardenCourtRotor:1,hazard:0,dormant:1});
  const context=vm.createContext({Math,console,GROUND_Y:700,
    G:{boss,p,obstacles,cratePortals:[],aoes:[],particles:[],shake:0,stageIndex:6,time:0},meta:{soundOn:false},
    courtFinalDamage:(e,amt)=>amt,restoreWardenVictory:()=>false,
    killEnemy(e){e.dead=true;},
    SFX:{},showStationNotice(message){context.notice=message;},addText(x,y,text){context.text=text;},
    clearPlacedPortals(){context.G.cratePortals=[];},portalTransit(){return context.returnRush?{x:2300,y:210}:null;}});
  vm.runInContext([
    functionSource('dotDamage'),
    functionSource('setWardenCourtRotors'),
    functionSource('setWardenTurningCourt'),
    functionSource('updateWardenPortalFight'),
  ].join('\n'),context);
  return{context,boss,p,obstacles};
}

test('phase three turns the court with physical changes and no instructional banner',()=>{
  const h=harness();h.boss.hp=90;
  h.context.updateWardenPortalFight(h.boss,h.p,1/60,h.boss.speed);
  assert.equal(h.boss.wardenPhase,3);
  assert.equal(h.obstacles.filter(o=>o.wardenTurningCourt&&o.move).length,5);
  assert.equal(h.obstacles.filter(o=>o.wardenCourtRotor&&o.hazard).length,2);
  assert.equal(h.context.notice,undefined);
  assert.equal(h.context.text,undefined);
});

test('the threefold sentence telegraphs, rebounds, and can be returned through a pair',()=>{
  const h=harness();Object.assign(h.boss,{hp:90,phase:3,wardenPhase:3,wardenState:'pursuit',wardenSentenceCd:-1,wardenPortalBreakCd:9});
  h.context.updateWardenPortalFight(h.boss,h.p,1/60,h.boss.speed);
  assert.equal(h.boss.wardenState,'sentenceWind');
  assert.equal(h.context.G.aoes.at(-1).real,false);
  h.context.updateWardenPortalFight(h.boss,h.p,1.1,h.boss.speed);
  assert.equal(h.boss.wardenState,'sentenceRush');
  assert.equal(h.boss.wardenSentenceChain,3);

  Object.assign(h.boss,{x:2698,wardenRushDir:1,wardenStateT:1});
  h.context.updateWardenPortalFight(h.boss,h.p,1/60,h.boss.speed);
  assert.equal(h.boss.wardenState,'sentenceRebound');
  assert.equal(h.boss.wardenSentenceChain,2);
  assert.equal(h.context.G.aoes.at(-1).type,'sentence');

  Object.assign(h.boss,{x:1200,wardenState:'sentenceRush',wardenStateT:1,wardenRushDir:1});
  h.context.returnRush=true;
  h.context.updateWardenPortalFight(h.boss,h.p,1/60,h.boss.speed);
  assert.equal(h.boss.wardenState,'sentenceCrash');
  assert.equal(h.boss.wardenSentenceReturns,1);
  assert.ok(h.p.wardenFlankT>2);
  assert.equal(h.boss.hitFlash,.65);
  assert.ok(h.context.G.particles.length>=24);
  assert.equal(h.boss.hp,57);
});

test('turning court reset restores every authored origin after victory or retry',()=>{
  const h=harness();h.context.setWardenTurningCourt(true);
  for(const o of h.obstacles.filter(q=>q.wardenTurningCourt)){o.x+=17;o.y+=23;}
  h.context.setWardenTurningCourt(false);
  for(const o of h.obstacles.filter(q=>q.wardenTurningCourt)){
    assert.equal(o.x,o.x0);assert.equal(o.y,o.y0);assert.equal(o.move,null);
  }
});

test('final court keeps both portals while remote mouth strikes remain dangerous',()=>{
  const h=harness();Object.assign(h.boss,{hp:90,phase:3,wardenPhase:3,wardenState:'pursuit',wardenPortalBreakCd:-1,wardenSentenceCd:9});
  h.context.G.cratePortals=[{x:600,y:0,side:0},{x:2400,y:210,side:1}];
  h.context.updateWardenPortalFight(h.boss,h.p,1/60,h.boss.speed);
  assert.equal(h.boss.wardenState,'portalBreakWind');
  h.context.updateWardenPortalFight(h.boss,h.p,1,h.boss.speed);
  assert.equal(h.context.G.cratePortals.length,2);
  assert.equal(h.context.G.aoes.at(-1).real,true);
});

test('entering the final court clears the previous phase portal pair',()=>{
  const h=harness();h.context.G.cratePortals=[{x:600,y:0,side:0},{x:2400,y:210,side:1}];h.boss.hp=90;
  h.context.updateWardenPortalFight(h.boss,h.p,1/60,h.boss.speed);
  assert.equal(h.boss.wardenPhase,3);
  assert.equal(h.context.G.cratePortals.length,0);
});

test('final court suppresses the ordinary dash and spaces its sentence rush',()=>{
  const h=harness();Object.assign(h.boss,{hp:90,phase:3,wardenPhase:3,wardenState:'pursuit',wardenRushCd:-1,
    wardenSlamCd:5,wardenSentenceCd:5,wardenPortalBreakCd:5});
  h.context.updateWardenPortalFight(h.boss,h.p,1/60,h.boss.speed);
  assert.equal(h.boss.wardenState,'pursuit');
  assert.match(source,/wardenSentenceCd=8\.4/);
  assert.match(source,/e\.vx=e\.wardenRushDir\*590/);
});

 test('three crashes consume pairs and galleries, then leave a rooted finisher',()=>{
  const h=harness();Object.assign(h.boss,{hp:99,phase:3,wardenPhase:3,wardenPortalFight:true});h.context.returnRush=true;
  h.context.setWardenTurningCourt(true);h.context.setWardenCourtRotors(true);
  h.context.G.obstacles.push({wardenLurePlatform:1,x:760,y:180,w:180},{wardenLurePlatform:2,x:2240,y:220,w:180});
  for(let i=1;i<=3;i++){
    h.context.G.cratePortals=[{side:0},{side:1}];
    Object.assign(h.boss,{x:1200,wardenState:'sentenceRush',wardenStateT:1,wardenRushDir:1});
    h.context.updateWardenPortalFight(h.boss,h.p,1/60,h.boss.speed);
    assert.equal(h.boss.hp,Math.max(1,99-i*33));
    assert.equal(!!h.boss.dead,false);
    assert.ok(h.context.G.obstacles.filter(o=>o.wardenTurningCourt).every(o=>o.move));
    assert.ok(h.context.G.obstacles.filter(o=>o.wardenCourtRotor).every(o=>o.hazard));
    assert.equal(h.context.G.cratePortals.length,0);
    assert.equal(h.context.G.obstacles.filter(o=>o.wardenLurePlatform).length,Math.max(0,2-i));
  }
  assert.equal(h.boss.wardenBroken,true);assert.equal(h.boss.frontShield,false);
  const x=h.boss.x;h.p.x=400;
  for(let i=0;i<2;i++){
    h.p.x=400+i*1600;h.p.y=i*210;
    h.context.updateWardenPortalFight(h.boss,h.p,3,76);
    assert.equal(h.boss.x,x);assert.equal(h.boss.y,0);
    const a=h.context.G.aoes.at(-1);
    assert.equal(a.x,h.p.x);assert.equal(a.y,h.p.y);assert.equal(a.type,'sentence');
    assert.equal(a.t,.82);
  }
  assert.equal(h.context.G.aoes.length,2);
  assert.ok(h.context.G.aoes.every(a=>a.bloodDamage===1&&a.real));
  h.context.dotDamage(h.boss,100,'red');assert.equal(h.boss.hp,1);
  const hitStart=source.indexOf('function hitEnemy(');
  const gateEnd=source.indexOf('  // This watchman',hitStart);
  vm.runInContext(source.slice(hitStart,gateEnd)+'}',h.context);
  h.context.hitEnemy(h.boss,100,1,0,0,null,'truth-lamp');assert.equal(!!h.boss.dead,false);
  h.context.hitEnemy(h.boss,1,1,0,0,null,'melee');assert.equal(h.boss.dead,true);
});

test('Turning Cells turnkey starts on solid ground instead of the entry pit',()=>{
  assert.match(source,/Gr\(7380,7700\)/);
  assert.match(source,/t:'grunt',x:7500,noDrop:true,patrol:\[7420,7640\],wardenRole:'turnkey'/);
});

test('phase-three ground impacts cost one Blood and stay in place',()=>{
  for(const state of ['sentenceRush','slamWind','portalBreakWind']){
    const h=harness();Object.assign(h.boss,{hp:90,phase:3,wardenPhase:3,wardenState:state,wardenStateT:0,wardenRushDir:1});
    h.context.updateWardenPortalFight(h.boss,h.p,1/60,h.boss.speed);
    const a=h.context.G.aoes.at(-1);
    assert.equal(a.dmg,1,state);assert.equal(a.bloodDamage,1,state);assert.equal(a.real,true,state);
  }
});

test('zero-damage warning circles never call the damage or checkpoint handler',()=>{
  const start=source.indexOf('if(a.dmg>0 && Math.abs(p.x - a.x)');
  assert.ok(start>=0);const statement=source.slice(start,source.indexOf(';',start)+1);
  const calls=[];const c=vm.createContext({Math,p:{x:100,y:0},a:{x:100,y:0,r:150,dmg:0,real:false},hurtPlayer(...args){calls.push(args);}});
  vm.runInContext(statement,c);assert.equal(calls.length,0);
  Object.assign(c.a,{dmg:1,real:true,bloodDamage:1});vm.runInContext(statement,c);
  assert.deepEqual(calls,[[1,1,true,1]]);
});


// Evaluate the actual authored objects so recovery, field bounds and route tags
// are checked together with the runtime that consumes them.
const stageStart=source.indexOf('const WARDEN_LEVEL='),stageEnd=source.indexOf('/* ================================================================\n   THE INVERSION',stageStart);
const constructors=['Pl','Gr','Wl','Slate','SlateWall','Cry','Plate','Check','CoinOb','Scenery','Sign',
  'LoreMarker','StoryRelic','SealedRecollection','AmbientFigure','DoorSeal','WardenBeat'];
const authored=vm.runInNewContext(constructors.map(functionSource).join('\n')+'\n'+source.slice(stageStart,stageEnd)+';WARDEN_LEVEL',{
  STAGE_LORE:{6:{id:'warden-lore',title:'Gaol',text:'Stone'}}
});
const environment=vm.runInNewContext(await readFile(new URL('../public/bladefall-environment.js',import.meta.url),'utf8')+';BladefallEnvironment');
function machineryHarness(){
  const circuits=new Set(),receipts=[],objects=JSON.parse(JSON.stringify(authored.objects));
  const context=vm.createContext({Math,G:{stageIndex:6,obstacles:objects,cratePortals:[],time:4,p:{wardenFlankT:1},aoes:[]},meta:{soundOn:false},
    circuitOpen:id=>circuits.has(id),persistentCircuitOpen:id=>circuits.has(id),hasCapability:()=>false,
    markPersistentCircuitOpen:(id,reason)=>{circuits.add(id);receipts.push({id,reason});},SFX:{}});
  vm.runInContext(['updateGaolMachinery','recordGaolPassage','syncGaolMouths','updraftsVoidFloor',
    'restoreWardenVictory','setWardenCourtRotors','setWardenTurningCourt'].map(functionSource).join('\n'),context);
  return{context,circuits,objects,receipts};
}

test('Hush needs both distinct brakes, and a stopped wheel keeps its captured angle',()=>{
  const h=machineryHarness(),rotors=h.objects.filter(o=>o.wardenRotor);
  h.context.updateGaolMachinery();assert.equal(h.circuits.has('gaol-hush-open'),false);
  h.circuits.add('gaol-hush-east');h.context.updateGaolMachinery();
  assert.equal(h.circuits.has('gaol-hush-open'),false);
  assert.equal(rotors[0].hazard,0);assert.equal(rotors[0].dormant,1);
  assert.equal(rotors[1].hazard,1);assert.equal(rotors[0].gaolBrakeTime,4);
  const angle=environment.rotorState(rotors[0],rotors[0].gaolBrakeTime).angle;
  h.context.G.time=9;h.context.updateGaolMachinery();
  assert.equal(environment.rotorState(rotors[0],rotors[0].gaolBrakeTime).angle,angle);
  h.circuits.add('gaol-hush-west');h.context.updateGaolMachinery();
  assert.equal(h.circuits.has('gaol-hush-open'),true);
  assert.equal(rotors[1].hazard,0);assert.equal(rotors[1].gaolBrakeTime,9);
  h.context.updateGaolMachinery();
  assert.equal(h.receipts.filter(r=>r.id==='gaol-hush-open').length,1);
});

test('the visible Hush field matches its actual influence and has reachable local retries',()=>{
  const h=machineryHarness(),field=h.objects.find(o=>o.wardenHushField);
  assert.equal(field.w,field.r*2);
  assert.equal(environment.sampleFields({x:9470,y:215,h:40},[field]).gravityScale,.35);
  const retry=h.objects.find(o=>o.supportedBy==='engine-service-stair');
  assert.equal(retry.y-(-120),70);
  assert.equal(environment.sampleFields({x:retry.x,y:retry.y,h:40},[field]).gravityScale,.35);
  assert.equal(environment.sampleFields({x:9950,y:0,h:40},[field]).gravityScale,1);
  for(const x of [9740,8900,8100])assert.equal(h.context.updraftsVoidFloor({x}),-200);
  assert.equal(h.context.updraftsVoidFloor({x:7840}),-50);
  assert.equal(h.context.updraftsVoidFloor({x:6580}),-200);
  assert.equal(h.context.updraftsVoidFloor({x:5845}),-200);
  h.context.G.stageIndex=5;assert.equal(h.context.updraftsVoidFloor({x:8900}),-50);
});

test('only the high west-facing personal route releases the service gate',()=>{
  const h=machineryHarness(),low=h.objects.find(o=>o.gaolRouteMouth==='entry'),high=h.objects.find(o=>o.gaolRouteMouth==='exit');
  const route={pair:{source:{kind:'personal'}},entry:{x:low.x,y:low.y,_support:low},exit:{x:high.x-13,y:610,nx:-1,_support:high}};
  assert.equal(h.context.recordGaolPassage({...route,pair:{kind:'fixed'}}),false);
  assert.equal(h.context.recordGaolPassage({...route,exit:{...route.exit,nx:1}}),false);
  assert.equal(h.context.recordGaolPassage({...route,exit:{...route.exit,y:120}}),false);
  assert.equal(h.context.recordGaolPassage({...route,entry:{...route.entry,_support:{slate:1}}}),false);
  assert.equal(h.circuits.size,0);
  assert.equal(h.context.recordGaolPassage(route),true);
  assert.equal(h.circuits.has('gaol-cell-passage'),true);
  assert.ok(h.objects.find(o=>o.gaolCellGate).flash>0);
  assert.equal(h.context.recordGaolPassage(route),false);
  assert.match(functionSource('portalTransit'),/if\(ent===G\.p\)\{if\(G\.stageIndex===6\)recordGaolPassage\(result\)/);
});

test('a mouth follows only its own moving court support',()=>{
  const h=machineryHarness(),support={x:900,y:210},other={x:700,y:90};
  const mouth={_support:support,supportDx:-35,supportDy:15,x:0,y:0},fixed={_support:other,x:700,y:90};
  h.context.G.cratePortals=[mouth,fixed];h.context.syncGaolMouths(support);
  assert.equal(mouth.x,865);assert.equal(mouth.y,225);assert.equal(fixed.x,700);
  support.x=1060;support.y=340;h.context.syncGaolMouths(support);
  assert.equal(mouth.x,1025);assert.equal(mouth.y,355);
});

test('a committed mouth break removes just its chosen mouth even when side values match',()=>{
  const h=harness();Object.assign(h.boss,{hp:150,phase:2,wardenPhase:2,wardenState:'pursuit',wardenPortalBreakCd:-1,wardenSentenceCd:9});
  const first={x:600,y:0,side:0},second={x:2400,y:210,side:0};h.context.G.cratePortals=[first,second];
  h.context.updateWardenPortalFight(h.boss,h.p,1/60,h.boss.speed);
  assert.equal(h.boss.wardenTargetMouth,first);h.context.updateWardenPortalFight(h.boss,h.p,1,h.boss.speed);
  assert.equal(h.context.G.cratePortals.length,1);assert.equal(h.context.G.cratePortals[0],second);
});

test('Continue preserves real Warden victory without awarding Counter early',()=>{
  const h=machineryHarness(),gate=h.objects.find(o=>o.wardenMineGate);
  h.context.G.boss={dead:false,hp:300,active:true,frontShield:true};
  assert.equal(h.context.restoreWardenVictory(),false);assert.equal(gate.gone,false);
  h.context.hasCapability=id=>id==='counter';h.context.G.aoes=[{type:'sentence'},{type:'slam'},{type:'other'}];
  assert.equal(h.context.restoreWardenVictory(),true);assert.equal(gate.gone,true);
  assert.equal(h.context.G.boss.dead,true);assert.equal(h.context.G.boss.hp,0);
  assert.equal(h.context.G.wardenRewarded,true);assert.equal(h.context.G.aoes.length,1);
  assert.ok(h.objects.filter(o=>o.wardenCourtRotor).every(o=>!o.hazard));
});

test('Gaol regression: rush, sentence and rebound keep their windup direction after a crossing',()=>{
  const ordinary=harness();ordinary.boss.wardenRushCd=-1;
  ordinary.context.updateWardenPortalFight(ordinary.boss,ordinary.p,1/60,76);
  assert.equal(ordinary.boss.wardenState,'rushWind');assert.equal(ordinary.boss.wardenRushDir,1);
  ordinary.p.x=900;ordinary.context.updateWardenPortalFight(ordinary.boss,ordinary.p,.53,76);
  assert.equal(ordinary.boss.wardenState,'rush');assert.equal(ordinary.boss.face,1);
  const start=ordinary.boss.x;ordinary.context.updateWardenPortalFight(ordinary.boss,ordinary.p,1/60,76);
  assert.ok(ordinary.boss.x>start);assert.equal(ordinary.boss.wardenRushDir,1);

  const sentence=harness();Object.assign(sentence.boss,{hp:90,phase:3,wardenPhase:3,wardenSentenceCd:-1});
  sentence.context.updateWardenPortalFight(sentence.boss,sentence.p,1/60,76);
  assert.equal(sentence.boss.wardenState,'sentenceWind');assert.equal(sentence.boss.wardenRushDir,1);
  sentence.p.x=900;sentence.context.updateWardenPortalFight(sentence.boss,sentence.p,1.06,76);
  assert.equal(sentence.boss.wardenState,'sentenceRush');assert.equal(sentence.boss.face,1);
  const sentenceStart=sentence.boss.x;sentence.context.updateWardenPortalFight(sentence.boss,sentence.p,1/60,76);
  assert.ok(sentence.boss.x>sentenceStart);
  Object.assign(sentence.boss,{x:2698,wardenStateT:1});
  sentence.context.updateWardenPortalFight(sentence.boss,sentence.p,1/60,76);
  assert.equal(sentence.boss.wardenState,'sentenceRebound');assert.equal(sentence.boss.wardenRushDir,-1);
  sentence.p.x=2850;sentence.context.updateWardenPortalFight(sentence.boss,sentence.p,.25,76);
  assert.equal(sentence.boss.wardenState,'sentenceRush');assert.equal(sentence.boss.face,-1);
  const reboundStart=sentence.boss.x;sentence.context.updateWardenPortalFight(sentence.boss,sentence.p,1/60,76);
  assert.ok(sentence.boss.x<reboundStart);assert.equal(sentence.boss.wardenRushDir,-1);
});

test('Gaol regression: a replacement portal pair survives a strike committed to the old mouth',()=>{
  const h=harness();Object.assign(h.boss,{hp:150,phase:2,wardenPhase:2,wardenPortalBreakCd:-1});
  const oldTarget={x:600,y:0,side:0};h.context.G.cratePortals=[oldTarget,{x:2400,y:210,side:1}];
  h.context.updateWardenPortalFight(h.boss,h.p,1/60,76);
  assert.equal(h.boss.wardenState,'portalBreakWind');assert.equal(h.boss.wardenTargetMouth,oldTarget);
  const first={x:900,y:200,side:0},second={x:2100,y:400,side:1};h.context.G.cratePortals=[first,second];
  h.context.updateWardenPortalFight(h.boss,h.p,1,76);
  assert.equal(h.context.G.cratePortals.length,2);
  assert.equal(h.context.G.cratePortals[0],first);assert.equal(h.context.G.cratePortals[1],second);
  const impact=h.context.G.aoes.at(-1);assert.equal(impact.x,600);assert.equal(impact.y,0);assert.equal(impact.real,true);
  assert.equal(h.boss.wardenTargetMouth,null);
});

test('Gaol regression: Vey waits for Counter and relocates only when both places are out of view',()=>{
  const h=machineryHarness(),enna=h.objects.find(o=>o.gaolKeeper);
  Object.assign(h.context,{VW:1280,RECALL_RETURN_ROUTES:{},BFWorldModule:{stageId:()=> 'warden'},musterRecalled:()=>false});
  vm.runInContext(['updateGaolKeeper','ambientFigureDialogue'].map(functionSource).join('\n'),h.context);
  h.context.G.cam=2000;h.context.updateGaolKeeper();assert.equal(enna.x,4620);
  const before=h.context.ambientFigureDialogue(enna,false);assert.match(before,/carry his keys/);
  assert.ok(before.split(/\s+/).length<=15);
  h.context.hasCapability=id=>id==='counter';
  h.context.G.cam=4400;h.context.updateGaolKeeper();assert.equal(enna.x,4620,'old place remains visible');
  h.context.G.cam=200;h.context.updateGaolKeeper();assert.equal(enna.x,4620,'new place remains visible');
  h.context.G.cam=2000;h.context.updateGaolKeeper();assert.equal(enna.x,420);assert.equal(enna.y,0);
  const after=h.context.ambientFigureDialogue(enna,true);assert.match(after,/set down heavier things/);
  assert.ok(after.split(/\s+/).length<=15);assert.notEqual(after,before);
  enna.x=4620;h.context.G.stageIndex=5;h.context.updateGaolKeeper();assert.equal(enna.x,4620);
});

test('Warden snapshots carry the committed tell, shield side and real exposure window',()=>{
  const start=source.indexOf('const WARDEN_TELL_FIELDS=');
  const context=vm.createContext({G:{p:{wardenFlankT:1.2}}});
  vm.runInContext(source.slice(start,source.indexOf('\nfunction netPackWorldSnapshot',start)),context);
  const host={wardenPortalFight:true,wardenState:'sentenceWind',wardenRushDir:-1,shieldFace:1,frontShield:true};
  const remote={wardenPortalFight:true};
  context.netApplyWardenTell(remote,JSON.parse(JSON.stringify(context.netPackWardenTell(host))));
  assert.equal(remote.wardenState,'sentenceWind');assert.equal(remote.wardenRushDir,-1);
  assert.equal(remote.shieldFace,1);assert.equal(remote.wardenExposureT,1.2);
  context.G.p.wardenFlankT=0;host.wardenState='recover';
  context.netApplyWardenTell(remote,context.netPackWardenTell(host));
  assert.equal(remote.wardenExposureT,0,'a later closed guard cannot retain stale exposure');
  assert.equal(remote.wardenState,'recover');
  assert.equal(context.netPackWardenTell({type:'grunt'}),null);
});
