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
    G:{boss,p,obstacles,cratePortals:[],aoes:[],particles:[],shake:0},meta:{soundOn:false},
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

test('phase three turns the court and announces the new sentence contract',()=>{
  const h=harness();h.boss.hp=90;
  h.context.updateWardenPortalFight(h.boss,h.p,1/60,h.boss.speed);
  assert.equal(h.boss.wardenPhase,3);
  assert.equal(h.obstacles.filter(o=>o.wardenTurningCourt&&o.move).length,5);
  assert.equal(h.obstacles.filter(o=>o.wardenCourtRotor&&o.hazard).length,2);
  assert.match(h.context.notice,/TURNING SENTENCE/);
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
