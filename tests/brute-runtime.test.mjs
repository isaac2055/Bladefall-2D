import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const source=await readFile(new URL('../public/index.html',import.meta.url),'utf8');

function functionSource(name){
  const start=source.indexOf(`function ${name}(`);
  assert.ok(start>=0,`${name} exists`);
  const brace=source.indexOf('{',start);let depth=0;
  for(let i=brace;i<source.length;i++){
    if(source[i]==='{')depth++;
    else if(source[i]==='}'&&--depth===0)return source.slice(start,i+1);
  }
  throw new Error(`unterminated ${name}`);
}

function harness(){
  const boss={type:'brute',x:12200,y:0,w:66,h:80,hp:310,maxHp:310,phase:1,
    bruteState:'dormant',bruteDormant:true,active:false,bruteWakeHits:0,bruteWakeNeed:3,
    bruteArenaL:10650,bruteArenaR:13900,bruteWeightX:12085,bruteArmorBroken:false,
    bruteSlamCd:2.4,bruteRushCd:1.8,face:-1};
  const rivets=[0,1,2].map(i=>({type:'lever',id:`brute-rivet-${i}`,x:11000+i*88,y:215+i*53,w:12,h:12,bruteWakeLever:1,bruteRivetIndex:i}));
  const release={type:'lever',x:11530,y:235,w:22,h:34,bruteChain:1,bruteDropRelease:1};
  const weight={type:'bruteWeight',x:12085,y:455,y0:455,w:190,h:88,active:0,vy:0};
  const bloom={type:'scenery',x:12200,y:0,bruteBloom:1,gone:true};
  const context=vm.createContext({Math,console,GROUND_Y:700,
    G:{boss,p:{x:11000,y:0},obstacles:[...rivets,release,weight,bloom],particles:[],shake:0},
    meta:{soundOn:false},SFX:{hit(){},enemyDie(){}},clearPlacedPortals(){context.cleared=true;},
    addText(x,y,text){context.text=text;}});
  vm.runInContext([
    functionSource('awakenBruteFromChain'),
    functionSource('strikeBruteWakeLever'),
    functionSource('strikeBruteDropRelease'),
    functionSource('beginBruteTransformation'),
    functionSource('updateBruteMachineryFight'),
  ].join('\n'),context);
  return{context,boss,rivets,release,weight,bloom};
}

test('three distinct airborne arrows—and no grounded shot—wake the dormant Brute',()=>{
  const h=harness();
  h.context.strikeBruteWakeLever(h.rivets[0],{owner:'player',shape:'arrow',airborneShot:false});
  assert.equal(h.boss.bruteWakeHits,0);
  assert.equal(h.boss.bruteDormant,true);
  for(let hit=1;hit<=3;hit++)h.context.strikeBruteWakeLever(h.rivets[hit-1],{owner:'player',shape:'arrow',airborneShot:true,vx:680});
  assert.equal(h.boss.bruteWakeHits,3);assert.ok(h.rivets.every(r=>r.struck));
  assert.equal(h.boss.bruteDormant,false);
  assert.equal(h.boss.active,true);
  assert.equal(h.boss.bruteState,'wake');

  h.context.updateBruteMachineryFight(h.boss,{x:11000,y:0,h:56},2,52);
  assert.equal(h.boss.bruteState,'hunt');
});

test('remote release starts a drop but armor breaks only on a successful impact',()=>{
  const h=harness();
  h.context.strikeBruteDropRelease(h.release,{owner:'player',shape:'arrow',airborneShot:true});
  assert.equal(h.weight.active,0,'dormant machinery does not skip the rivets');
  Object.assign(h.boss,{bruteDormant:false,active:true,bruteState:'hunt'});
  h.context.strikeBruteDropRelease(h.release,{owner:'player',shape:'arrow',airborneShot:true});
  assert.equal(h.release.struck,true);assert.equal(h.weight.active,1);
  assert.equal(h.boss.bruteArmorBroken,false);
  h.context.beginBruteTransformation(h.boss,h.weight);
  assert.equal(h.boss.bruteArmorBroken,true);
  assert.equal(h.boss.bruteState,'transform');
  assert.equal(h.weight.active,2);
  assert.equal(h.context.cleared,true);
  assert.equal(h.context.focusGrant,undefined);

  h.context.updateBruteMachineryFight(h.boss,{x:11000,y:0,h:56},2,52);
  assert.equal(h.boss.bruteState,'recover');
  assert.equal(h.boss.portalGate,null);
  assert.equal(h.boss.bruteFocusArmor,false);
  h.context.updateBruteMachineryFight(h.boss,{x:11000,y:0,h:56},1,52);
  assert.equal(h.boss.bruteState,'pursuit');
});

test('grounded and non-arrow hits cannot trigger the remote drop',()=>{
  const h=harness();
  Object.assign(h.boss,{bruteDormant:false,active:true,bruteState:'hunt'});
  h.context.strikeBruteDropRelease(h.release,{owner:'player',shape:'orb',airborneShot:true});
  h.context.strikeBruteDropRelease(h.release,{owner:'player',shape:'arrow',airborneShot:false});
  assert.equal(h.release.struck,undefined);assert.equal(h.weight.active,0);assert.equal(h.boss.bruteArmorBroken,false);
});
