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
    G:{boss,p:{x:11000,y:0},obstacles:[...rivets,release,weight,bloom],particles:[],aoes:[],shake:0},
    meta:{soundOn:false},SFX:{hit(){},enemyDie(){},land(){}},clearPlacedPortals(){context.cleared=true;},
    addText(x,y,text){context.text=text;}});
  vm.runInContext([
    functionSource('awakenBruteFromChain'),
    functionSource('strikeBruteWakeLever'),
    functionSource('strikeBruteDropRelease'),
    functionSource('beginBruteTransformation'),
    functionSource('updateBruteMachineryFight'),
  ].join('\n'),context);
  const weightStart=source.indexOf("    if(o.type==='bruteWeight'){"),weightEnd=source.indexOf("    if(o.type==='windDebris'){",weightStart);
  assert.ok(weightStart>=0&&weightEnd>weightStart);
  context.weight=weight;
  vm.runInContext('function tickWeight(dt){const o=weight;'+source.slice(weightStart,weightEnd)+'}',context);
  return{context,boss,rivets,release,weight,bloom};
}

test('three distinct player-arrow hits wake the Brute without a hidden airborne requirement',()=>{
  const h=harness();
  h.context.strikeBruteWakeLever(h.rivets[0],{owner:'enemy',shape:'arrow',airborneShot:true});
  h.context.strikeBruteWakeLever(h.rivets[0],{owner:'player',shape:'orb',airborneShot:true});
  assert.equal(h.boss.bruteWakeHits,0);
  assert.equal(h.boss.bruteDormant,true);
  for(let hit=1;hit<=3;hit++){
    h.context.strikeBruteWakeLever(h.rivets[hit-1],{owner:'player',shape:'arrow',airborneShot:false,vx:680});
    h.context.strikeBruteWakeLever(h.rivets[hit-1],{owner:'player',shape:'arrow',airborneShot:false,vx:680});
    assert.equal(h.boss.bruteWakeHits,hit,'repeat hits cannot substitute for a distinct rivet');
    assert.equal(h.boss.bruteDormant,hit<3);
  }
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

test('enemy and non-arrow hits cannot trigger the remote drop',()=>{
  const h=harness();
  Object.assign(h.boss,{bruteDormant:false,active:true,bruteState:'hunt'});
  h.context.strikeBruteDropRelease(h.release,{owner:'player',shape:'orb',airborneShot:true});
  h.context.strikeBruteDropRelease(h.release,{owner:'enemy',shape:'arrow',airborneShot:true});
  assert.equal(h.release.struck,undefined);assert.equal(h.weight.active,0);assert.equal(h.boss.bruteArmorBroken,false);
});


test('a missed counterweight resets both release handles and a later aligned drop breaks armor',()=>{
  const h=harness(),east={...h.release,x:h.weight.x+330,struck:false};
  h.context.G.obstacles.push(east);
  Object.assign(h.boss,{bruteDormant:false,active:true,bruteState:'hunt',x:h.weight.x-600});
  h.context.strikeBruteDropRelease(h.release,{owner:'player',shape:'arrow',airborneShot:false});
  assert.equal(h.weight.active,1,'grounded arrows operate the visible release');
  assert.equal(h.boss.bruteArmorBroken,false,'operating the release alone never removes armor');
  h.context.tickWeight(1);
  assert.equal(h.weight.active,3,'an empty fall enters the recall cycle');
  assert.equal(h.weight.y,0);assert.equal(h.boss.bruteArmorBroken,false);
  east.struck=true;
  h.context.tickWeight(2);
  assert.equal(h.weight.active,0);assert.equal(h.weight.y,h.weight.y0);
  assert.equal(h.release.struck,false);assert.equal(east.struck,false);
  h.boss.x=h.weight.x;
  h.context.strikeBruteDropRelease(east,{owner:'player',shape:'arrow',airborneShot:false});
  h.context.tickWeight(.2);
  assert.equal(h.boss.bruteArmorBroken,false,'the weight must physically reach the armor');
  h.context.tickWeight(.7);
  assert.equal(h.boss.bruteArmorBroken,true);assert.equal(h.boss.bruteState,'transform');
  assert.equal(h.weight.active,2);assert.equal(h.weight.y,h.boss.y+h.boss.h);
});

test('the exposed Brute locks rush direction at its visible windup and gives a bounded recovery',()=>{
  const h=harness(),p={x:h.boss.x+400,y:0,h:44};
  Object.assign(h.boss,{bruteArmorBroken:true,bruteDormant:false,bruteState:'pursuit',bruteRushCd:0,bruteSlamCd:10});
  h.context.updateBruteMachineryFight(h.boss,p,.01,72);
  assert.equal(h.boss.bruteState,'rushWind');assert.equal(h.boss.face,1);
  p.x=h.boss.x-400;
  h.context.updateBruteMachineryFight(h.boss,p,.05,72);
  assert.equal(h.boss.face,1,'crossing behind cannot swivel the warned charge');
  h.context.updateBruteMachineryFight(h.boss,p,1,72);
  assert.equal(h.boss.bruteState,'rush');assert.equal(h.boss.bruteChargeDir,1);
  const x=h.boss.x;h.context.updateBruteMachineryFight(h.boss,p,.05,72);
  assert.ok(h.boss.x>x,'rush follows the committed direction');
  h.boss.x=h.boss.bruteArenaR-2;h.context.updateBruteMachineryFight(h.boss,p,.05,72);
  assert.equal(h.boss.x,h.boss.bruteArenaR);assert.equal(h.boss.bruteState,'recover');
  assert.equal(h.boss.vx,0);assert.equal(h.boss.lunge,0);assert.ok(h.boss.bruteRecover>0);
  h.context.updateBruteMachineryFight(h.boss,p,1,72);
  assert.equal(h.boss.bruteState,'pursuit');
});

function blockBody(prefix){
  const start=source.indexOf(prefix);assert.ok(start>=0,prefix+' exists');
  const brace=source.indexOf('{',start);let depth=0;
  for(let i=brace;i<source.length;i++){
    if(source[i]==='{')depth++;
    else if(source[i]==='}'&&--depth===0)return source.slice(brace+1,i);
  }
  throw Error('unterminated block: '+prefix);
}
const Quests=vm.runInNewContext(await readFile(new URL('../public/bladefall-quests.js',import.meta.url),'utf8')+';BladefallQuests');
function repairHarness(levelSelect=false){
  const catches=[{repairCatch:'causeway-catch-yard',x:3420,y:130,struck:false},
    {repairCatch:'causeway-catch-rise',x:4930,y:105,struck:false}],
    trap={type:'trap',x:4050,x0:4050,y:410,y0:410,w:74,h:58,state:'idle',vy:0,
      hoist:{dx:250,period:4.6,phase:0},targetCircuit:'drop-yard',requiresRepairCatch:'causeway-catch-yard',resetMiss:2.8},
    plate={type:'plate',id:'drop-yard',x:4050,y:0,w:60,latch:true,trapOnly:true,pressed:false,down:0},
    door={type:'door',causewayRepairShortcut:1,circuit:'drop-yard'},
    G={stageIndex:2,ngPlus:0,worldProgressEligible:!levelSelect,levelSelectMode:levelSelect,
      sessionQuests:levelSelect?Quests.createProgress():null,causewayRepair:{completed:false},
      obstacles:[...catches,trap,plate,door],plates:{'drop-yard':[plate]},
      p:{x:4050,y:0,h:44,w:28,invuln:1},boss:{type:'brute',dead:true},particles:[],shake:0,time:0},
    meta={soundOn:false,quests:Quests.createProgress(),world:{cleared:['brute']},gold:0};
  const context=vm.createContext({G,meta,trap,plate,GROUND_Y:700,BFQuestsModule:Quests,
    BFWorldModule:{stageId:()=> 'brute'},activeCapabilityProgress:()=>({acquired:['jump','weapon']}),
    addGold:amount=>{meta.gold+=amount;},persist:()=>{},grantEchoReward:()=>{},
    coopSendTravelerIntent:()=>{},circuitOpen:()=>plate.pressed,
    markPersistentCircuitOpen:()=>{},addText:()=>{throw Error('repair uses physical feedback');},
    toast:()=>{throw Error('repair should not force quest banners');}
  });
  vm.runInContext(['questStageId','activeQuestProgress','questProgressionContext','recordQuestEvent','questRow',
    'syncCausewayQuestFromWorld','pullLever','doorOpen'].map(functionSource).join('\n')+
    ';function tickTrap(dt){const o=trap,p=G.p;'+blockBody("    else if(o.type==='trap'){")+'}'+
    ';function tickPlate(){const o=plate,p=G.p;'+blockBody("    else if(o.type==='plate'){")+'}',context);
  return{context,G,meta,catches,trap,plate,door};
}

test('Drop Yard repair follows first catch, committed hoist, latched plate, then second catch without requiring dialogue',()=>{
  for(const levelSelect of [false,true]){
    const h=repairHarness(levelSelect),oldQuests=JSON.stringify(h.meta.quests);
    assert.equal(h.context.doorOpen(h.door),false,'a cleared Brute cannot replace the repair');
    h.context.tickTrap(.1);assert.equal(h.trap.state,'idle','the first catch physically arms the hoist');
    h.context.pullLever(h.catches[1]);assert.equal(h.catches[1].struck,false,'the second handle alone cannot open the gate');
    h.context.pullLever(h.catches[0]);assert.equal(h.catches[0].struck,true);
    assert.equal(h.context.questRow('release-the-causeway').started,true,'world interaction quietly starts the quest');
    h.context.pullLever(h.catches[1]);assert.equal(h.catches[1].struck,false,'first catch alone does not bypass the plate');
    h.context.tickTrap(.01);assert.equal(h.trap.state,'warn');
    const committedX=h.trap.x;h.G.time=1.1;h.context.tickTrap(.4);
    assert.equal(h.trap.state,'falling');assert.equal(h.trap.x,committedX,'the hoist cannot move during its warning');
    h.context.tickTrap(.5);assert.equal(h.trap.state,'landed');
    h.context.tickPlate();assert.equal(h.plate.pressed,true);
    assert.equal(h.context.doorOpen(h.door),false,'latching the plate alone does not replace the second repair');
    h.context.pullLever(h.catches[1]);
    assert.equal(h.catches[1].struck,true);assert.equal(h.G.causewayRepair.completed,true);
    assert.equal(h.context.doorOpen(h.door),true);
    assert.equal(h.meta.gold,levelSelect?0:160);
    h.context.pullLever(h.catches[1]);h.context.pullLever(h.catches[0]);
    assert.equal(h.meta.gold,levelSelect?0:160,'repeat interaction cannot duplicate the reward');
    if(levelSelect)assert.equal(JSON.stringify(h.meta.quests),oldQuests,'preview repair never changes campaign quests');
  }
});

test('completed repair saves still open the gate without replaying the newly required plate sequence',()=>{
  const h=repairHarness();
  let state=h.meta.quests;
  for(const event of [{type:'talk',target:'oren'},{type:'inspect',target:'causeway-catch-yard'},
    {type:'inspect',target:'causeway-catch-rise'}]){
    state=Quests.record(state,{...event,stage:'brute'},{capabilities:['jump','weapon']}).progress;
  }
  h.meta.quests=state;h.context.syncCausewayQuestFromWorld();
  assert.equal(h.plate.pressed,false);assert.equal(h.G.causewayRepair.completed,true);
  assert.equal(h.context.doorOpen(h.door),true,'existing completed saves retain their return road');
});

const weaponSystems=vm.runInNewContext(
  await readFile(new URL('../public/bladefall-progression.js',import.meta.url),'utf8')+
  await readFile(new URL('../public/bladefall-capabilities.js',import.meta.url),'utf8')+
  await readFile(new URL('../public/bladefall-weapon-progression.js',import.meta.url),'utf8')+
  ';({weapons:BladefallWeaponProgression,capabilities:BladefallCapabilities})');
function bowHarness(){
  const blade={arche:'sword',name:'Recovered Oathblade',rarity:'common',dmg:10},
    pk={x:11400,y:278,causewayBow:true,authoredAcquisition:true,weapon:{arche:'bow',name:'Chainwake Longbow',rarity:'rare',dmg:15}},
    G={stageIndex:2,p:{x:11400,y:260,h:44,hp:60,blood:3,maxBlood:5,weapon:blade,gear:{chest:null},stats:{power:1},
      atkTimer:.3,atkCd:.4,atkBuf:.1,swingT:.2,charging:true},boss:{dead:false},pickups:[pk],particles:[]},
    meta={soundOn:false,run:true,inventory:{items:Array.from({length:24},(_,i)=>({id:'bag-'+i}))}},
    buttons={},saved=[];
  const context=vm.createContext({G,meta,GROUND_Y:700,QUICK_ITEM_X:58,QUICK_ITEM_Y:54,BFCachedWeaponProfile:{},
    BFWeaponProgressionModule:weaponSystems.weapons,BFWeaponProgression:{recordEquip:()=>{}},
    BFWorldModule:{stageId:()=> 'brute'},weaponCompatibilityMode:()=>false,
    activeCapabilityProgress:()=>weaponSystems.capabilities.createState({acquired:['jump','weapon']}),
    BFInventoryModule:{collect:()=>{throw Error('the bow must not use inventory');}},
    BFReleaseModule:{normalizePlayerAdvancement:p=>p},effMaxBlood:()=>5,cloneGear:g=>JSON.parse(JSON.stringify(g)),
    saveRunAtStage:(_,snap)=>saved.push(snap),coopRememberPickupTaken:()=>{},noteItem:()=>{},hudUpdate:()=>{},
    BFAISystem:{lineOfSight:()=>true},mode:'play',hasGift:()=>false,showGameUI:()=>{},showOverlay:()=>{},
    escText:s=>s,keyLabel:s=>s,kbCode:s=>s,showOvHTML:html=>{context.html=html;},
    document:{getElementById:id=>buttons[id]||(buttons[id]={})}
  });
  const a=source.indexOf('  for(const pk of G.pickups){if(pk.taken)continue;pk.bob='),b=source.indexOf('\n  // Chests',a);
  assert.ok(a>=0&&b>a);
  vm.runInContext(['equipProgressionWeapon','acquireCausewayBow','collectNearbyItem','itemInQuickRange',
    'snapOf','finishCausewayLoadout','showBruteDefeatBriefing'].map(functionSource).join('\n')+
    ';function tickPickup(dt=.016){const p=G.p;'+source.slice(a,b)+'}',context);
  return{context,G,meta,blade,pk,buttons,saved};
}

test('the Causeway bow equips on contact or pickup key despite a full bag and preserves the displaced blade',()=>{
  for(const manual of [false,true]){
    const h=bowHarness(),bag=JSON.stringify(h.meta.inventory);
    if(manual)assert.equal(h.context.collectNearbyItem(),true);else h.context.tickPickup();
    assert.equal(h.pk.taken,true);assert.equal(h.G.p.weapon.arche,'bow');
    assert.equal(h.G.p.causewayBlade.arche,'sword');assert.notEqual(h.G.p.causewayBlade,h.blade);
    assert.equal(h.G.p.blood,3);assert.equal(h.G.p.hp,60);assert.equal(JSON.stringify(h.meta.inventory),bag);
    assert.equal(h.G.p.atkTimer,0);assert.equal(h.G.p.atkCd,0);assert.equal(h.G.p.charging,false);
    assert.equal(h.saved.at(-1).weapon.arche,'bow');assert.equal(h.saved.at(-1).causewayBlade.arche,'sword');
    assert.equal(h.context.acquireCausewayBow(h.pk),false,'a used rack cannot replace the saved weapon again');
    assert.equal(h.context.finishCausewayLoadout(true),false,'the postfight choice cannot run before the boss falls');
  }
  assert.match(source,/p\.causewayBlade=snap&&snap\.causewayBlade\?BFWeaponProgressionModule\.normalizeWeapon\(snap\.causewayBlade\):null/,
    'loading the saved run restores the stowed blade');
});

test('the compact postfight choice directly keeps the bow or restores the saved blade and resumes play',()=>{
  for(const restoreBlade of [false,true]){
    const h=bowHarness();h.context.tickPickup();h.G.boss.dead=true;
    assert.equal(h.context.showBruteDefeatBriefing(),true);assert.equal(h.context.mode,'pause');
    assert.doesNotMatch(h.context.html,/bag|eastern gate|return <b>west/i,'the choice does not become a management or route instruction panel');
    const button=h.buttons[restoreBlade?'bruteBladeReturn':'bruteRoadReturn'];
    assert.equal(typeof button.onclick,'function');button.onclick();
    assert.equal(h.G.p.weapon.arche,restoreBlade?'sword':'bow');assert.equal(h.G.p.causewayBlade,null);
    assert.equal(h.saved.at(-1).weapon.arche,restoreBlade?'sword':'bow');assert.equal(h.saved.at(-1).causewayBlade,null);
    assert.equal(h.G.p.blood,3);assert.equal(h.context.mode,'play');
  }
});
