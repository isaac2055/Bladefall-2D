// The v4 regions (stages 0-V4_LAST_STAGE) are bag-free: gear reaches the player from named
// world sources, never from a body, a boss key or a chest. These checks run the
// real drop branch out of killEnemy rather than asserting on its source text.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const source=await readFile(new URL('../public/index.html',import.meta.url),'utf8');
const V4 = Number(/const V4_LAST_STAGE=(\d+);/.exec(source)[1]);

function block(prefix,body=false){
  const start=source.indexOf(prefix);assert.ok(start>=0,prefix+' exists');
  const brace=source.indexOf('{',start);let depth=0;
  for(let i=brace;i<source.length;i++){
    if(source[i]==='{')depth++;
    else if(source[i]==='}'&&--depth===0)return body?source.slice(brace+1,i):source.slice(start,i+1);
  }
  throw Error('unterminated '+prefix);
}

// The exact drop decision from killEnemy, lifted verbatim.
const dropStart=source.indexOf('  const enemyIndex=coopOpts.enemyIndex==null'),
  dropEnd=source.indexOf('  const coopDrops=G.pickups.slice(dropStart)',dropStart);
assert.ok(dropStart>=0&&dropEnd>dropStart,'the killEnemy drop branch is locatable');
const dropBranch=source.slice(dropStart,dropEnd);

function dropsFor(e,stageIndex,{bossRush=false}={}){
  const G={stageIndex,pickups:[],enemies:[e],bossRush:bossRush?{}:null};
  let rolled=0;
  vm.runInNewContext('function run(){'+dropBranch+'}\nrun();',{
    G,coopOpts:{},coopClonePickup:p=>p,e,V4_LAST_STAGE:V4,
    rollDrop:()=>{rolled++;G.pickups.push({armor:{slot:'chest'}});}
  });
  return{pickups:G.pickups,rolled};
}

const WARDEN=()=>({type:'warden',boss:true,x:100,y:0});
const BRUTE=()=>({type:'brute',boss:true,x:100,y:0});
const MOB=()=>({type:'rifthound',x:100,y:0});

test('the Warden fight drops no armor, weapon, key or chest key',()=>{
  const r=dropsFor(WARDEN(),6);
  assert.equal(r.rolled,0,'no gear roll');
  assert.deepEqual(r.pickups,[],'the Warden leaves nothing on the floor');
});

test('no v4-region enemy or boss yields gear, including seeded variants without noDrop',()=>{
  for(let stage=0;stage<=V4;stage++){
    for(const make of [MOB,WARDEN,BRUTE]){
      const r=dropsFor(make(),stage);
      assert.equal(r.rolled,0,`stage ${stage} ${make().type} rolled gear`);
      assert.deepEqual(r.pickups,[],`stage ${stage} ${make().type} left a pickup`);
    }
  }
});

test('later, un-redesigned biomes keep their legacy economy', ()=>{
  assert.equal(dropsFor(MOB(),V4+1).rolled,1,'the first unconverted stage still rolls gear');
  const boss=dropsFor(BRUTE(),V4+1);
  assert.equal(boss.pickups.length,1);
  assert.equal(boss.pickups[0].key,true,'the first unconverted stage still leaves its key');
  assert.equal(dropsFor(BRUTE(),10,{bossRush:true}).pickups.length,0,'the rush never spawns keys');
});

test('the boss chest, the key’s only lock, is absent from every v4 region',()=>{
  const line=block('  if (s.boss&&i>V4_LAST_STAGE) G.obstacles.push({type: \'chest\'');
  assert.ok(/i>V4_LAST_STAGE/.test(line),'chest spawn is gated above the v4 boundary');
  assert.match(source,/const V4_LAST_STAGE=\d+;/);
});

test('enemy material credit uses the same stage boundary as gear',()=>{
  assert.match(source,/if\(!e\.boss&&!coopOpts\.remote&&G\.stageIndex>V4_LAST_STAGE\)\{/);
});
