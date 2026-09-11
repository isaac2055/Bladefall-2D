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

function harness({stageIndex,capabilities=[],levelSelect=false,keepSeal=false}={}){
  const owned=new Set(capabilities),circuits=[];
  const context=vm.createContext({Math,console,
    meta:{world:keepSeal?{keepWestSealOpen:true}:{},zoneState:{}},
    BFZoneStateModule:{setCircuit(state,zone,id,value){circuits.push({zone,id,value});return state;}},
    BFWorldModule:{stageId(index){return ['outskirts','black-woods','broken-causeway','updrafts','hollow-marksman','ruined-keep'][index];}},
    hasCapability(id){return owned.has(id);},
    openUpdraftsShortcut(){context.shortcutOpened=true;return true;},
    G:{p:{hasJetpack:false,fuel:0},stageIndex,levelSelectMode:levelSelect,sessionZoneState:{},zonePersistenceZoneId:
      ['outskirts','black-woods','broken-causeway','updrafts','hollow-marksman','ruined-keep'][stageIndex],
      persistentCircuits:{},openedZoneShortcuts:[],secondMouthProved:false,keepWestSealOpen:false,obstacles:[]},
  });
  vm.runInContext([
    functionSource('persistentCircuitOpen'),functionSource('markPersistentCircuitOpen'),
    functionSource('restoreUpdraftsReturnGear'),functionSource('restoreSolvedBacktrackDoors'),functionSource('circuitOpen'),functionSource('doorOpen'),
  ].join('\n'),context);
  return{context,circuits};
}

function door(id,flags={}){return{type:'door',circuit:id,...flags};}
function plate(id){return{type:'plate',id,pressed:false};}

test('campaign Keep Key return opens all three mandatory Ruined Keep doors',()=>{
  const h=harness({stageIndex:5,capabilities:['wall-jump'],keepSeal:true});
  const ids=['keep-weight','belfry-fold','belfry-bell'];
  h.context.G.obstacles=[...ids.map(plate),...ids.map(id=>door(id))];
  assert.deepEqual([...h.context.restoreSolvedBacktrackDoors()],ids);
  for(const o of h.context.G.obstacles.filter(row=>row.type==='door'))assert.equal(h.context.doorOpen(o),true,o.circuit);
  assert.ok(h.context.G.obstacles.filter(row=>row.type==='plate').every(row=>row.pressed));
});

test('Level Select Grip immediately clears prior Keep gates and Key clears the Archive gate',()=>{
  const h=harness({stageIndex:5,capabilities:['wall-jump'],levelSelect:true});
  const doors=['keep-weight','belfry-fold','belfry-bell'].map(id=>door(id));h.context.G.obstacles=doors;
  h.context.restoreSolvedBacktrackDoors();
  assert.equal(h.context.doorOpen(doors[0]),true);assert.equal(h.context.doorOpen(doors[1]),true);
  assert.equal(h.context.doorOpen(doors[2]),false);
  h.context.G.keepWestSealOpen=true;h.context.restoreSolvedBacktrackDoors();
  assert.equal(h.context.doorOpen(doors[2]),true);
  assert.equal(h.context.meta.world.keepWestSealOpen,undefined,'Level Select does not mutate campaign world progress');
});

test('earned Updrafts and Marksman rewards clear every mandatory puzzle door behind them',()=>{
  const up=harness({stageIndex:3,capabilities:['portal-single'],levelSelect:true});
  const upIds=['aerie-pack-owned','wind-gate-1','wind-gate-2','wind-gate-3','updrafts-clearance'];
  up.context.G.obstacles=upIds.map(id=>door(id));up.context.restoreSolvedBacktrackDoors();
  assert.ok(up.context.G.obstacles.every(o=>up.context.doorOpen(o)));assert.equal(up.context.shortcutOpened,true);

  const marks=harness({stageIndex:4,capabilities:['portal-pair'],levelSelect:true});
  const marksDoors=[door('mantlet-release'),door('marksman-clearance')];marks.context.G.obstacles=marksDoors;
  marks.context.restoreSolvedBacktrackDoors();
  assert.ok(marksDoors.every(o=>marks.context.doorOpen(o)));assert.equal(marks.context.G.secondMouthProved,true);
});

test('hydrated persistent circuit state is an actual door authority',()=>{
  const h=harness({stageIndex:5});
  h.context.G.persistentCircuits['belfry-fold']={open:true,solved:true,source:'latched-plate'};
  assert.equal(h.context.circuitOpen('belfry-fold'),true);
  assert.equal(h.context.doorOpen(door('belfry-fold')),true);
});

test('latched plates and permanent levers write the circuit authority at solve time',()=>{
  assert.match(source,/if\(o\.latch&&o\.id!==undefined\)markPersistentCircuitOpen\(o\.id,'latched-plate'\)/);
  assert.match(source,/o\.dur>=1e8\)markPersistentCircuitOpen\(o\.id,'latched-lever'\)/);
  assert.match(source,/markPersistentCircuitOpen\('wind-gate-3','three-collectors'\)/);
  assert.match(source,/markPersistentCircuitOpen\(o\.id,'marksman-road-release'\)/);
});

test('the Fallen Refectory screen becomes clingable immediately after Mason’s Grip',()=>{
  const context=vm.createContext({hasCapability:id=>id==='wall-jump'});
  vm.runInContext(functionSource('wallFaceSlick'),context);
  const wall={slickL:1,slickR:1,refectoryScreen:1,returnClingAfterGrip:1};
  assert.equal(context.wallFaceSlick(wall,1),false,'west face is climbable');
  assert.equal(context.wallFaceSlick(wall,-1),false,'east/return face is climbable');
  assert.match(source,/Wl\(4270,520,520,72\).*refectoryScreen:1.*returnClingAfterGrip:1/s);
});

test('marked return walls stay slick before Grip and ordinary slick walls stay slick',()=>{
  const context=vm.createContext({hasCapability:()=>false});
  vm.runInContext(functionSource('wallFaceSlick'),context);
  assert.equal(context.wallFaceSlick({slickL:1,slickR:1,returnClingAfterGrip:1},-1),true);
  context.hasCapability=()=>true;
  assert.equal(context.wallFaceSlick({slickL:1,slickR:1},-1),true);
});


test('completed Updrafts reissues its local pack on return, but other levels do not',()=>{
  for(const stageIndex of [1,3,4,5]){
    const {context:c}=harness({stageIndex,capabilities:['portal-single']});
    c.restoreSolvedBacktrackDoors();
    assert.equal(c.G.p.hasJetpack,stageIndex===3);
    assert.equal(c.G.p.fuel,stageIndex===3?100:0);
    // Same helper repairs the gearless snapshot restored after zone assembly.
    c.G.p.hasJetpack=false;c.G.p.fuel=0;c.restoreUpdraftsReturnGear();
    assert.equal(c.G.p.hasJetpack,stageIndex===3);
  }
  const {context:c}=harness({stageIndex:3});c.restoreSolvedBacktrackDoors();
  assert.equal(c.G.p.hasJetpack,false,'first visit still requires the authored pickup');
});
