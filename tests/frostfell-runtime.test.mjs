import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../public/index.html',import.meta.url),'utf8');
function fn(name){const start=source.indexOf(`function ${name}(`),brace=source.indexOf('{',start);let depth=0;for(let i=brace;i<source.length;i++){if(source[i]==='{')depth++;if(source[i]==='}'&&!--depth)return source.slice(start,i+1);}}
function harness(){const circuits=new Set(),rewards=[],events=[];const nim={profileId:'nim',kind:'escort',state:'follow',x:0,y:0,done:false,abilities:['warmth']};const ctx=vm.createContext({Math,meta:{soundOn:false},GROUND_Y:700,
 G:{stageIndex:7,levelSelectMode:false,npcs:[nim],obstacles:['first-hearth','washhouse','workers-hearth'].map((id,i)=>({frostBrazier:id,x:1000+i*700,y:0})),p:{},particles:[],projectiles:[]},
 persistentCircuitOpen:id=>circuits.has(id),markPersistentCircuitOpen(id){const fresh=!circuits.has(id);circuits.add(id);return fresh;},
 recordQuestEvent:e=>events.push(e),grantAuthoredAdvancementBundle:(r,id)=>{assert.match(id,/^(boss|quest|secret|legacy|authored):/);rewards.push(r);},restoreBlood(){},showOutskirtsAnnotation(){},persist(){},hasCapability(){return false;},STAGES:{7:{theme:'frost'}},travelerHas:(n,id)=>n.abilities.includes(id)});
 vm.runInContext([fn('frostfellLit'),fn('updateFrostfell'),fn('followerWarmthAt')].join('\n'),ctx);return {ctx,circuits,nim,rewards,events};}
test('Nim lights permanent hearths in reach, rewards once, and remains at the workers hearth',()=>{const h=harness();
 h.ctx.updateFrostfell(1/60);assert.equal(h.circuits.size,0);
 for(const o of h.ctx.G.obstacles){h.nim.x=o.x;h.ctx.updateFrostfell(1/60);assert.equal(o.lit,true);}
 assert.ok(h.circuits.has('frost-hearths'));assert.equal(h.nim.done,true);assert.equal(h.nim.x,4350);assert.equal(h.rewards.length,1);
 h.ctx.updateFrostfell(1/60);assert.equal(h.rewards.length,1);
 h.nim.done=false;for(const o of h.ctx.G.obstacles)o.lit=false;
 h.ctx.updateFrostfell(1/60);assert.equal(h.rewards.length,1);assert.ok(h.nim.done);
});
test('lit hearths supply traction after Nim stops following',()=>{const h=harness();h.nim.done=true;h.nim.x=4350;
 assert.equal(h.ctx.followerWarmthAt(1000,0),false);h.ctx.G.obstacles[0].lit=true;
 assert.equal(h.ctx.followerWarmthAt(1000,0),true);assert.equal(h.ctx.followerWarmthAt(1500,0),false);
});
test('thermal receiver latches the gate after its heat signal expires',()=>{const h=harness();h.ctx.meta.soundOn=false;
 const receiver={frostThermalReceiver:1,timer:1},door={frostGate:1,circuit:'frost-thermal'};h.ctx.G.obstacles.push(receiver,door);
 h.ctx.updateFrostfell(1/60);assert.equal(door.open,true);receiver.timer=0;h.ctx.updateFrostfell(1/60);assert.equal(door.open,true);
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
 assert.equal(decks.length,20);assert.ok(decks.filter(o=>o.ice).length>=15);
 assert.ok(objects.filter(o=>o.type==='check').length>=5);
 assert.ok(objects.some(o=>o.iceSpikes&&o.upT===o.period));
 assert.ok(objects.some(o=>o.iceSpikes&&o.upT<o.period));
 const engine=objects.find(o=>o.frostMusterEngine);assert.ok(engine);
 assert.ok(decks.some(o=>Math.abs(engine.x-o.x)<o.w/2&&engine.y===o.y));
 assert.ok(objects.some(o=>o.frostSummitReturn));
 assert.match(fn('interactFrostfell'),/o.frostMusterEngine/);assert.match(fn('interactFrostfell'),/G.frostMusterSequence/);
});
test('Frostfell passages cycle through the summit only once reached',()=>{
 const circuits=new Set(),ctx=vm.createContext({G:{stageIndex:7,levelSelectMode:true,p:{}},VW:1440,
 persistentCircuitOpen:id=>circuits.has(id),markPersistentCircuitOpen:id=>circuits.add(id),
 showOutskirtsAnnotation(){},persist(){},clearPlacedPortals(){},BFCamera:{reset(){}},Math});
 vm.runInContext(fn('interactFrostfell'),ctx);
 ctx.interactFrostfell({frostReturn:1});assert.equal(ctx.G.p.x,1330);
 ctx.interactFrostfell({frostReturnExit:1});assert.equal(ctx.G.p.x,7220);
 ctx.interactFrostfell({frostReturn:1});assert.equal(ctx.G.p.x,1330);
 ctx.interactFrostfell({frostReturn:1,frostSummitReturn:1});assert.ok(circuits.has('frost-summit-service'));
 ctx.interactFrostfell({frostReturnExit:1});assert.equal(ctx.G.p.x,7220);
 ctx.interactFrostfell({frostReturn:1});assert.equal(ctx.G.p.x,14680);assert.equal(ctx.G.p.y,650);
 ctx.interactFrostfell({frostReturn:1,frostSummitReturn:1});assert.equal(ctx.G.p.x,1330);assert.equal(ctx.G.p.y,0);
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
