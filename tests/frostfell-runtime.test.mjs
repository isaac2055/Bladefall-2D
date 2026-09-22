import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../public/index.html',import.meta.url),'utf8');
function fn(name){const start=source.indexOf(`function ${name}(`),brace=source.indexOf('{',start);let depth=0;for(let i=brace;i<source.length;i++){if(source[i]==='{')depth++;if(source[i]==='}'&&!--depth)return source.slice(start,i+1);}}
const modules=vm.runInNewContext((await Promise.all(['progression','capabilities','zones','recovery'].map(name=>readFile(new URL('../public/bladefall-'+name+'.js',import.meta.url),'utf8')))).join('\n')+';({capabilities:BladefallCapabilities,recovery:BladefallRecovery})');
function harness({preview=false}={}){
 const circuits=new Set(),rewards=[],events=[],annotations=[],toasts=[],saved=[],leverHits=[];
 const nim={profileId:'nim',kind:'escort',state:'idle',x:1020,y:0,done:false,abilities:['warmth']};
 const G={stageIndex:7,ngPlus:0,levelSelectMode:preview,worldProgressEligible:!preview,cam:0,npcs:[nim],
  obstacles:['first-hearth','washhouse','workers-hearth'].map((id,i)=>({frostBrazier:id,x:1000+i*700,y:0})),
  p:{x:0,y:0,blood:1,maxBlood:5},particles:[],projectiles:[]};
 const meta={soundOn:false,bestStage:7,capabilities:modules.capabilities.createState({acquired:['counter']})};
 if(preview)G.sessionCapabilities=modules.capabilities.createState({acquired:['counter']});
 const active=()=>G.sessionCapabilities||meta.capabilities;
 const ctx=vm.createContext({Math,G,meta,GROUND_Y:700,VW:1024,
  BFCapabilitiesModule:modules.capabilities,BFRecoveryModule:modules.recovery,BFWorldModule:{stageId:()=> 'frostfell'},
  activeCapabilityProgress:active,hasCapability:id=>modules.capabilities.has(active(),id),
  syncMovementCapabilities(){},syncPortalCapabilities(){},syncWeaponCapabilities(){},hudUpdate(){},
  persistentCircuitOpen:id=>circuits.has(id),markPersistentCircuitOpen(id){const fresh=!circuits.has(id);circuits.add(id);return fresh;},
  recordQuestEvent:e=>events.push(e),grantAuthoredAdvancementBundle:(r,id)=>{assert.match(id,/^(boss|quest|secret|legacy|authored):/);rewards.push(r);},
  restoreBlood:p=>{p.blood=p.maxBlood;},showOutskirtsAnnotation:(o,html)=>annotations.push({o,html}),toast:html=>toasts.push(html),persist(){},
  snapOf:p=>structuredClone(p),saveRunAtStage:(stage,snap)=>saved.push({stage,snap:structuredClone(snap),capabilities:structuredClone(active())}),
  commitStageCompletion:()=>events.push('stage'),recordWorldClear:()=>events.push('world'),recordStoryStageClear:()=>events.push('story'),recordHelpedTravelers:()=>events.push('travelers'),
  escText:s=>s,keyLabel:s=>s,kbCode:()=> 'Space',STAGES:{7:{theme:'frost'}},travelerHas:(n,id)=>n.abilities.includes(id),
  doorOpen:o=>!!o.open,pullLever:o=>{leverHits.push(o);o.timer=o.dur||1e9;},clearPlacedPortals(){},BFCamera:{reset(){}}
 });
 vm.runInContext(['frostfellLit','frostNimLine','updateFrostNim','claimFrostMemory','frostShutterHit','receiveFrostHeat','updateFrostfell','interactFrostfell','followerWarmthAt','grantPermanentCapability','activateRuntimeCheckpoint'].map(fn).join('\n'),ctx);
 return {ctx,G,meta,active,circuits,nim,rewards,events,annotations,toasts,saved,leverHits};
}
test('Nim joins by proximity without dialogue and resumes a saved walk without another interaction',()=>{
 const h=harness();h.G.p.x=864;h.ctx.updateFrostNim(h.nim);assert.equal(h.nim.state,'idle');
 h.G.p.x=866;h.ctx.updateFrostNim(h.nim);assert.equal(h.nim.state,'follow');assert.equal(h.nim.asked,true);
 assert.ok(h.circuits.has('frost-nim-joined'));assert.equal(h.annotations.length,0);assert.equal(h.toasts.length,0);
 h.nim.state='idle';h.G.p.x=8000;h.ctx.updateFrostNim(h.nim);assert.equal(h.nim.state,'follow');
});
test('Nim lights permanent hearths in reach and rewards once without teleporting on completion',()=>{const h=harness();
 h.ctx.updateFrostfell(1/60);assert.equal(h.circuits.size,0);
 for(const o of h.ctx.G.obstacles){h.nim.x=o.x;h.G.p.x=o.x;h.G.cam=o.x-400;h.ctx.updateFrostfell(1/60);assert.equal(o.lit,true);}
 assert.ok(h.circuits.has('frost-hearths'));assert.equal(h.nim.done,true);assert.equal(h.nim.x,2400);assert.equal(h.rewards.length,1);
 assert.equal(h.G.p.ckX,4300);assert.equal(h.G.p.ckY,0);assert.equal(h.saved.length,1);assert.equal(h.annotations.length,0);
 h.ctx.updateFrostfell(1/60);assert.equal(h.rewards.length,1);
 h.nim.done=false;for(const o of h.ctx.G.obstacles)o.lit=false;
 h.ctx.updateFrostfell(1/60);assert.equal(h.rewards.length,1);assert.ok(h.nim.done);
});
test('Nim recurs only while both old and new positions are outside the camera',()=>{
 const h=harness();h.nim.done=true;h.nim.x=4100;h.G.cam=3900;
 h.ctx.updateFrostNim(h.nim);assert.equal(h.nim.x,4100,'visible completion position remains');
 h.G.cam=0;h.ctx.updateFrostNim(h.nim);assert.equal(h.nim.x,4350);
 h.ctx.grantPermanentCapability('double-jump','frost-second-step',{quiet:true});
 h.G.cam=6700;h.ctx.updateFrostNim(h.nim);assert.equal(h.nim.x,4350,'visible destination remains empty');
 h.G.cam=9000;h.ctx.updateFrostNim(h.nim);assert.equal(h.nim.x,6970);
 assert.match(h.ctx.frostNimLine(h.nim),/footprints/);
 h.circuits.add('frost-muster');h.ctx.updateFrostNim(h.nim);assert.equal(h.nim.x,1020);
 assert.match(h.ctx.frostNimLine(h.nim),/fire is still ours/);assert.equal(h.G.npcs.length,1);
});
test('lit hearths supply traction after Nim stops following',()=>{const h=harness();h.nim.done=true;h.nim.x=4350;
 assert.equal(h.ctx.followerWarmthAt(1000,0),false);h.ctx.G.obstacles[0].lit=true;
 assert.equal(h.ctx.followerWarmthAt(1000,0),true);assert.equal(h.ctx.followerWarmthAt(1500,0),false);
});
test('thermal receiver latches the gate after its heat signal expires',()=>{const h=harness();h.ctx.meta.soundOn=false;
 const receiver={frostThermalReceiver:1,timer:1},door={frostGate:1,circuit:'frost-thermal'};h.ctx.G.obstacles.push(receiver,door);
 h.ctx.updateFrostfell(1/60);assert.equal(door.open,true);receiver.timer=0;h.ctx.updateFrostfell(1/60);assert.equal(door.open,true);
});
test('the second-step memory requires thawed works and grants a quiet permanent power on contact once',()=>{
 const h=harness(),memory={x:7250,y:0,frostMemory:1};h.G.obstacles.push(memory);h.G.p.x=7250;
 h.ctx.updateFrostfell(1/60);assert.equal(h.ctx.hasCapability('double-jump'),false);assert.equal(h.saved.length,0);
 h.circuits.add('frost-thermal');h.G.p.x=7210;h.ctx.updateFrostfell(1/60);assert.equal(h.ctx.hasCapability('double-jump'),false);
 h.G.p.x=7230;h.ctx.updateFrostfell(1/60);
 assert.ok(h.ctx.hasCapability('double-jump'));assert.ok(h.circuits.has('frost-complete'));assert.equal(memory.read,true);
 assert.equal(h.G.p.blood,5);assert.equal(h.G.p.ckX,7250);assert.equal(h.G.p.ckY,0);
 assert.equal(h.saved.length,1);assert.ok(modules.capabilities.has(h.saved[0].capabilities,'double-jump'));
 assert.equal(h.toasts.length,0);assert.equal(h.annotations.length,1);assert.match(h.annotations[0].html,/Space again in the air/);
 assert.equal(h.meta.bestStage,8);assert.equal(h.meta.reach[0],8);assert.deepEqual(h.events,['stage','world','story','travelers']);
 h.ctx.updateFrostfell(1/60);assert.equal(h.ctx.claimFrostMemory(memory),false);
 assert.equal(h.saved.length,1);assert.equal(h.annotations.length,1);assert.equal(h.events.length,4);
});
test('preview memory saves its local Double Jump checkpoint without awarding campaign progression',()=>{
 const h=harness({preview:true}),memory={x:7250,y:0,frostMemory:1};h.G.obstacles.push(memory);h.G.p.x=7250;h.circuits.add('frost-thermal');
 h.ctx.updateFrostfell(1/60);assert.ok(h.ctx.hasCapability('double-jump'));
 assert.equal(modules.capabilities.has(h.meta.capabilities,'double-jump'),false);assert.equal(h.meta.bestStage,7);
 assert.equal(h.events.length,0);assert.equal(h.saved.length,1);assert.equal(h.saved[0].snap.ckX,7250);
 assert.ok(modules.capabilities.has(h.saved[0].capabilities,'double-jump'));assert.equal(h.toasts.length,0);
});
test('the heat coil accepts only a live source flame with a portal hop and real firestream reaction',()=>{
 const h=harness(),coil={x:6260,y:340,frostThermalReceiver:1};
 const shot=()=>({x:6260,y:340,life:1,frostThermalShot:true,el:'fire',portalHops:1,_bfAirReactions:{firestream:1}});
 for(const invalid of [{frostThermalShot:false},{el:'ice'},{portalHops:0},{_bfAirReactions:{}},{life:0},{x:6300}]){
  assert.equal(h.ctx.receiveFrostHeat(coil,Object.assign(shot(),invalid)),false);assert.equal(h.leverHits.length,0);
 }
 const valid=shot();assert.equal(h.ctx.receiveFrostHeat(coil,valid),true);assert.equal(valid.life,0);assert.equal(h.leverHits.length,1);
 assert.equal(h.ctx.receiveFrostHeat(coil,valid),false);assert.equal(h.leverHits.length,1);
});
test('the closed damper blocks swept heat in either direction while the open gate and clear lanes pass',()=>{
 const h=harness(),shutter={x:6180,y:420,h:165,w:24,frostDamperShutter:1};h.G.obstacles.push(shutter);
 for(const [from,to] of [[6100,6300],[6300,6100]]){
  const pr={x:to,y:340,life:1,size:5};assert.equal(h.ctx.frostShutterHit(pr,from,340),true);assert.equal(pr.life,0);
 }
 for(const y of [200,470])assert.equal(h.ctx.frostShutterHit({x:6300,y,life:1,size:5},6100,y),false);
 shutter.open=true;assert.equal(h.ctx.frostShutterHit({x:6300,y:340,life:1},6100,340),false);
});
test('the projectile pipeline sweeps real travel before transit and checks only the local exit afterward',()=>{
 const h=harness(),shutter={x:6180,y:420,h:165,w:24,frostDamperShutter:1};h.G.obstacles.push(shutter);
 const start=source.indexOf('    const projectilePrevX=pr.x,projectilePrevY=pr.y;'),end=source.indexOf('    // Watch-road hardware',start);
 assert.ok(start>0&&end>start);let transits=0,exitX=6300;
 h.ctx.marksmanArrowCoverHit=()=>false;h.ctx.portalTransit=pr=>{transits++;pr.x=exitX;return true;};
 vm.runInContext('function stepFrostShot(pr,dt){for(const shot of [pr]){'+source.slice(start,end)+'}}',h.ctx);
 const across={x:6000,y:340,vx:400,vy:0,life:1,owner:'puzzle'};h.ctx.stepFrostShot(across,1);
 assert.equal(across.life,0);assert.equal(transits,0,'a shutter hit happens before entering a farther mouth');
 const portaled={x:6000,y:340,vx:10,vy:0,life:1,owner:'puzzle'};h.ctx.stepFrostShot(portaled,1);
 assert.equal(portaled.life,1);assert.equal(portaled.portalHops,1,'teleporting across the gate never invents a blocked flight segment');
 exitX=6180;const into={x:6000,y:340,vx:10,vy:0,life:1,owner:'puzzle'};h.ctx.stepFrostShot(into,1);assert.equal(into.life,0,'an exit inside the shutter is blocked');
});
test('Frostfell owns its layout, reward, future seam, and local return passage',()=>{
 const level=source.slice(source.indexOf('const FROSTFELL_LEVEL='),source.indexOf('function frostfellLit'));
 assert.match(level,/len:15100,portal:null/);assert.match(level,/frostMemory:1/);assert.match(level,/frostReturn:1/);assert.match(level,/frostReturnExit:1/);
 assert.match(level,/vaultKeyId:'rime-key'/);assert.match(level,/requiredAirReaction:'firestream'/);assert.match(source,/7:FROSTFELL_LEVEL/);
 assert.match(source,/id:'frostfell-drifting-memories'/);
});
test('the exposed finale has ice landings, timed and fixed hazards, checkpoints, and an engine requiring deliberate activation',()=>{
 const ctx=vm.createContext({Object,Number,
   Pl:(x,w,y,o)=>({type:'plat',x,w,y,...o}),Check:(x,y)=>({type:'check',x,y}),
   Sp:(x,y,o)=>({type:'spikes',x,y,...o}),FrostScenery:(x,y,kind,o)=>({x,y,kind,...o}),
   FrostBeat:o=>o});
 vm.runInContext(fn('frostfellFinale'),ctx);const objects=ctx.frostfellFinale();
 const decks=objects.filter(o=>Number.isInteger(o.frostFinaleLanding));
 assert.equal(decks.length,20);assert.ok(decks.filter(o=>o.ice).length>=14);
 assert.ok(objects.filter(o=>o.type==='check').length>=5);
 assert.ok(objects.some(o=>o.iceSpikes&&o.upT===o.period));
 assert.ok(objects.some(o=>o.iceSpikes&&o.upT<o.period));
 const engine=objects.find(o=>o.frostMusterEngine);assert.ok(engine);
 assert.ok(decks.some(o=>Math.abs(engine.x-o.x)<o.w/2&&engine.y===o.y));
 assert.ok(objects.some(o=>o.frostSummitReturn));
 assert.match(fn('interactFrostfell'),/o.frostMusterEngine/);assert.match(fn('interactFrostfell'),/G.frostMusterSequence/);
});
function authoredLevel(){
 const ctx=vm.createContext({Object,Math});
 const helpers=['Pl','Gr','Sp','Wl','SlateWall','Scenery','StoryRelic','SealedRecollection','Check','Lever','RuneEmitter','RuneReceiver','LPortal','Anchor','DoorSeal'];
 vm.runInContext(helpers.map(fn).join('\n')+'\n'+source.slice(source.indexOf('/* FROSTFELL —'),source.indexOf('const FROST_MUSTER_ROSTER=')),ctx);
 return vm.runInContext('FROSTFELL_LEVEL',ctx);
}
test('the thermal wheel has reachable dry footing and its shutter cuts the real heat lane',()=>{
 const {objects}=authoredLevel(),wheel=objects.find(o=>o.frostDamperLever),shutter=objects.find(o=>o.frostDamperShutter);
 const outlet=objects.find(o=>o.anchor&&o.x===5800),receiver=objects.find(o=>o.frostThermalReceiver);
 assert.ok(wheel&&shutter&&outlet&&receiver);
 assert.ok(objects.some(o=>o.type==='plat'&&!o.ice&&o.y===wheel.y&&Math.abs(o.x-wheel.x)<o.w/2-25),'wheel stands on a dry bench');
 const approach=objects.find(o=>o.type==='plat'&&o.x===5950&&o.y===60);
 assert.ok(approach&&wheel.y-approach.y<=80,'bench is reachable before Double Jump');
 assert.equal(shutter.circuit,wheel.id);assert.ok(wheel.dur>0&&wheel.dur<2);
 assert.ok(outlet.x<shutter.x&&shutter.x<receiver.x);
 assert.equal(outlet.y,receiver.y);assert.ok(receiver.y>=shutter.y-shutter.h&&receiver.y<=shutter.y);
 for(let x=4720;x<=6620;x+=100)assert.ok(objects.some(o=>o.type==='plat'&&o.y===0&&Math.abs(o.x-x)<=o.w/2),'misses retain the thermal recovery floor');
});
test('moving thaw rafts have lower catches and a reachable return to the ice route',()=>{
 const {objects}=authoredLevel(),rafts=objects.filter(o=>o.frostThawRaft),catches=objects.filter(o=>o.frostRecoveryLanding);
 assert.equal(rafts.length,2);assert.equal(catches.length,2);
 for(const raft of rafts){
  assert.ok(!raft.ice&&raft.move.dx>0&&raft.move.dy===0);
  const catchDeck=catches.find(o=>o.y<raft.y&&o.x-o.w/2<=raft.x-raft.move.dx-raft.w/2&&o.x+o.w/2>=raft.x+raft.move.dx+raft.w/2);
  assert.ok(catchDeck,'the whole raft sweep has a catch underneath');
  assert.ok(objects.some(o=>Number.isInteger(o.frostFinaleLanding)&&o.x<raft.x&&o.y>catchDeck.y&&o.y-catchDeck.y<=150&&Math.abs(o.x-catchDeck.x)<catchDeck.w/2),'missed rafts have a backward Double Jump return');
 }
});
test('Frostfell passages cycle through the summit only once reached and save each arrival checkpoint',()=>{
 const {ctx,circuits,saved}=harness({preview:true});
 assert.equal(ctx.interactFrostfell({frostReturnExit:1}),false);assert.equal(saved.length,0);
 ctx.interactFrostfell({frostReturn:1});assert.equal(ctx.G.p.x,1330);
 ctx.interactFrostfell({frostReturnExit:1});assert.equal(ctx.G.p.x,7220);
 ctx.interactFrostfell({frostReturn:1});assert.equal(ctx.G.p.x,1330);
 ctx.interactFrostfell({frostReturn:1,frostSummitReturn:1});assert.ok(circuits.has('frost-summit-service'));
 ctx.interactFrostfell({frostReturnExit:1});assert.equal(ctx.G.p.x,7220);
 ctx.interactFrostfell({frostReturn:1});assert.equal(ctx.G.p.x,14680);assert.equal(ctx.G.p.y,650);assert.equal(ctx.G.p.ckX,14680);assert.equal(ctx.G.p.ckY,650);
 ctx.interactFrostfell({frostReturn:1,frostSummitReturn:1});assert.equal(ctx.G.p.x,1330);assert.equal(ctx.G.p.y,0);
 assert.equal(ctx.G.p.ckX,1330);assert.equal(ctx.G.p.ckY,0);assert.equal(saved.length,7);
 assert.deepEqual(saved.map(row=>[row.snap.ckX,row.snap.ckY]),[[1330,0],[7220,210],[1330,0],[1330,0],[7220,210],[14680,650],[1330,0]]);
});
test('holding left alone cannot cross either end of the folded mine',()=>{
 const ctx=vm.createContext({G:{stageIndex:6,levelLength:15000,p:{x:20,y:0,face:-1}}});
 vm.runInContext(fn('physicalSeamSpec'),ctx);
 for(const stage of [6,7]){ctx.G.stageIndex=stage;ctx.G.frostMineRequested=false;assert.equal(ctx.physicalSeamSpec().cross,false);
 ctx.G.frostMineRequested=true;assert.equal(ctx.physicalSeamSpec().cross,true);}
});

test('the White Court aqueduct stays a sealed far-side shortcut with a supported Frostfell landing',async()=>{
  const progression=await readFile(new URL('../public/bladefall-progression.js',import.meta.url),'utf8');
  // It is opened from the Frost Sorcerer side, so it can never become a way to
  // skip forward into an undesigned chapter from Frostfell.
  assert.match(progression,/connector\('frostfell-sorcerer', 'frostfell', 'frost-sorcerer', 'frozen-aqueduct', \['double-jump'\], \{\n\s*shortcut: true, opensFrom: 'frost-sorcerer', initiallySealed: true,/);
  // The in-world plaque says so plainly rather than implying a route exists.
  assert.match(source,/The far sluice is barred from the White Court\. The old high shaft above the Causeway is still the way in\./);
  // Arrivals land at (14920,650), which must sit on the summit deck.
  assert.match(source,/if\(plan\.connectorId==='frostfell-sorcerer'&&plan\.targetZoneId==='frostfell'\)\{x=14920;y=650;\}/);
  const level=source.slice(source.indexOf('/* FROSTFELL'),source.indexOf('function frostfellLit'));
  const deck=[...level.matchAll(/Pl\((\d+),(\d+),(\d+)/g)]
    .map(([,x,w,y])=>({x:+x,w:+w,y:+y}))
    .find(p=>p.y===650&&14920>=p.x-p.w/2&&14920<=p.x+p.w/2);
  assert.ok(deck,'the aqueduct arrival has a summit platform under it');
});
