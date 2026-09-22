import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../public/index.html',import.meta.url),'utf8');
const plain=value=>JSON.parse(JSON.stringify(value));
function fn(name){
 const start=source.indexOf(`function ${name}(`);
 assert.ok(start>=0,`production function ${name} exists`);
 const brace=source.indexOf('{',start);let depth=0;
 for(let i=brace;i<source.length;i++){
  if(source[i]==='{')depth++;
  else if(source[i]==='}'&&--depth===0)return source.slice(start,i+1);
 }
 throw new Error(`unterminated production function ${name}`);
}
const modules=vm.runInNewContext((await Promise.all([
 'progression','capabilities','weapon-progression','equipment-economy','inventory','blood','shops',
].map(name=>readFile(new URL('../public/bladefall-'+name+'.js',import.meta.url),'utf8')))).join('\n')+
 ';({capabilities:BladefallCapabilities,weapons:BladefallWeaponProgression,equipment:BladefallEquipmentEconomy,'+
 'inventory:BladefallInventory,blood:BladefallBlood,shops:BladefallShops})');
const weapon=(name='Old Blade',arche='sword')=>({arche,name,rarity:'common',dmg:10,baseDmg:10,cd:.4,cls:'melee',dur:17,maxDur:40,temper:1,affixes:[]});
const armor=(slot='chest',name='Old Chestplate')=>({slot,name,rarity:'common',defense:30,baseDefense:30,reinforce:1,discipline:'bulwark',affixes:[{stat:'hp',val:10}]});
function fullBag(){
 let bag=modules.inventory.createState();
 for(let i=0;i<modules.inventory.CAPACITY;i++)bag=modules.inventory.collect(bag,weapon(`Saved blade ${i}`),`legacy-${i}`).state;
 return bag;
}
function harness({stage=2,capability=true,preview=false}={}){
 const notes=[],notices=[],saved=[],remembered=[],dispatch=[],events=[],buttons=[];
 let purchaseCalls=0,visible=true;
 const G={stageIndex:stage,ngPlus:0,worldProgressEligible:!preview,levelSelectMode:preview,
  sessionQuests:{},sessionZoneState:{},pickups:[],
  p:{x:100,y:0,h:44,weapon:weapon(),gear:{helmet:null,chest:null,legs:null},
   hp:40,maxHp:100,blood:2,maxBlood:5,bloodGuard:.2,bloodRecovery:.4}};
 const meta={soundOn:false,gold:500,run:null,capabilities:modules.capabilities.createState({acquired:capability?['jump','weapon']:['jump']}),
  equipment:modules.equipment.createState(),inventory:modules.inventory.createState(),shops:modules.shops.createProgress()};
 if(preview)G.sessionCapabilities=plain(meta.capabilities);
 const ctx=vm.createContext({Math,G,meta,console,mode:'play',SLOTIDS:['helmet','chest','legs'],QUICK_ITEM_X:58,QUICK_ITEM_Y:54,V4_LAST_STAGE:9,v4Region:i=>i>=0&&i<=9,
  GROUND_Y:700,RARITY:{common:{color:'#aaa'},rare:{color:'#ccf'}},BFCachedWeaponProfile:{key:null,weapon:null,value:null},
  BFWeaponProgressionModule:modules.weapons,BFEquipmentEconomyModule:modules.equipment,
  BFInventoryModule:modules.inventory,BFBloodModule:modules.blood,
  BFShopsModule:{...modules.shops,purchase(...args){purchaseCalls++;return modules.shops.purchase(...args);}},
  BFWorldModule:{stageId:i=>i===1?'black-woods':'test-stage-'+i},
  BFAdvancementModule:{vitalityBonus:()=>0,profile:()=>({vitalityKnots:0})},echoModifier:(event,id,fallback)=>fallback,
  activeCapabilityProgress:()=>G.sessionCapabilities||meta.capabilities,
  BFWeaponProgression:{recordEquip:arche=>events.push(['equip',arche])},
  BFEquipmentEconomy:{record:(...args)=>events.push(args)},
  BFAISystem:{lineOfSight:()=>visible},
  noteItem:item=>notes.push(plain(item)),coopRememberPickupTaken:pk=>remembered.push(pk),
  snapOf:p=>plain(p),persist:()=>saved.push(plain(meta)),hudUpdate(){},SFX:{pickup(){}},
  showStationNotice:text=>notices.push(text),addText:(x,y,text)=>notices.push(text),toast:text=>notices.push(text),
  claimSignalCrownPortal:pk=>{dispatch.push(['crown',pk]);return true;},
  acquireAuthoredFirstWeapon:pk=>{dispatch.push(['first',pk]);return true;},
  acquireCausewayBow:pk=>{dispatch.push(['bow',pk]);return true;},
  acquireAuthoredMantle:pk=>{dispatch.push(['mantle',pk]);return true;},
  makeWeapon:(arche,rarity,name)=>({...weapon(name,arche),rarity}),
  makeArmor:(rarity,slot)=>({...armor(slot),rarity}),
  BFQuestsModule:{dialogue:()=>null},questProgressionContext:()=>({}),recordQuestEvent(){},
  showGameUI(){},showOverlay(){},escText:String,
  showOvHTML(html){buttons.splice(0,buttons.length,...[...html.matchAll(/data-shop-item="(\d+)"/g)].map(m=>({dataset:{shopItem:m[1]}})));},
  document:{querySelectorAll:()=>buttons,getElementById:()=>({})},
 });
 vm.runInContext(['fieldLoadoutActive','fieldMantle','equipFieldFind','itemInQuickRange','collectNearbyItem',
  'weaponCompatibilityMode','weaponProgressionProfile','equipProgressionWeapon','recomputeArmor','effMaxHp',
  'vitalityKnotCount','syncBloodMirror','restoreBlood','savedRunSession','saveRunAtStage','equipmentState',
  'shopGrant','shopItemUsable','carryShopTool','openRegionalShop','fieldForgeCost'].map(fn).join('\n'),ctx);
 return{ctx,G,meta,notes,notices,saved,remembered,dispatch,events,buttons,
  set visible(value){visible=value;},get purchaseCalls(){return purchaseCalls;}};
}

// These tests exercise extracted production entry points; only browser, persistence
// and authored special-acquisition boundaries are replaced with observable adapters.
test('field loadout covers NG0 stages 0–9 and previews, retaining challenge and later-stage compatibility',()=>{
 const h=harness();
 for(let stage=0;stage<=9;stage++){h.G.stageIndex=stage;assert.equal(h.ctx.fieldLoadoutActive(),true,`stage ${stage}`);}
 assert.equal(harness({stage:8,preview:true}).ctx.fieldLoadoutActive(),true);
 for(const override of [{stageIndex:-1},{stageIndex:10},{stageIndex:15},{ngPlus:1},{battle:true},{bossRush:true}]){
  Object.assign(h.G,{stageIndex:4,ngPlus:0,battle:false,bossRush:false},override);
  assert.equal(h.ctx.fieldLoadoutActive(),false,JSON.stringify(override));
 }
 h.ctx.G=null;assert.equal(h.ctx.fieldLoadoutActive(),false);
});

test('mantle conversion preserves reinforcement and affixes without mutating the original armor',()=>{
 const h=harness(),original=armor('legs','Watch Greaves'),before=plain(original);
 const mantle=h.ctx.fieldMantle(original);
 assert.equal(mantle.slot,'chest');assert.equal(mantle.mantle,true);assert.equal(mantle.name,'Watch Mantle');
 assert.equal(mantle.reinforce,1);assert.equal(mantle.defense,32.4);
 assert.deepEqual(plain(mantle.affixes),before.affixes);assert.deepEqual(original,before);
 assert.equal(h.ctx.fieldMantle({slot:'ring'}),null);assert.equal(h.ctx.fieldMantle(null),null);
});

test('R equips a generic weapon through a full legacy bag and leaves the old weapon for a reversible swap',()=>{
 const h=harness();h.meta.inventory=fullBag();const bag=plain(h.meta.inventory),old=plain(h.G.p.weapon);
 const bow={...weapon('Found Bow','bow'),ammo:3,maxAmmo:12};
 const pk={x:105,y:0,weapon:bow,dwell:.5,offered:true};h.G.pickups.push(pk);
 assert.equal(h.ctx.collectNearbyItem(),true);assert.equal(h.G.p.weapon.name,'Found Bow');
 assert.equal(pk.taken,true);assert.equal(pk.dwell,0);assert.equal(pk.offered,false);
 assert.equal(h.G.p.weapon.ammo,3);assert.deepEqual(plain(h.meta.inventory),bag);
 const oldDrop=h.G.pickups.find(p=>p.fieldSwap);
 assert.deepEqual(plain(oldDrop.weapon),old);assert.deepEqual([oldDrop.x,oldDrop.y],[105,0]);
 assert.equal(h.remembered[0],pk);assert.equal(h.saved.at(-1).run.p.weapon.name,'Found Bow');
 assert.equal(h.ctx.collectNearbyItem(),true);assert.equal(h.G.p.weapon.name,'Old Blade');
 assert.equal(h.G.p.weapon.dur,17);assert.equal(oldDrop.taken,true);
 const returnedBow=h.G.pickups.find(p=>p.fieldSwap&&!p.taken);
 assert.equal(returnedBow.weapon.name,'Found Bow');assert.equal(returnedBow.weapon.ammo,3);
 assert.equal(h.saved.at(-1).run.p.weapon.name,'Old Blade');assert.deepEqual(plain(h.meta.inventory),bag);
 assert.equal(h.notices.length,0,'the field swap does not invoke bag messages');
});

test('a late-region mantle replaces all legacy armor without healing and preserves the pieces in the world',()=>{
 const h=harness({stage:8});h.meta.inventory=fullBag();const bag=plain(h.meta.inventory);
 h.G.p.gear={helmet:armor('helmet','Guard Helmet'),chest:armor(),legs:armor('legs','Guard Greaves')};
 const old=plain(h.G.p.gear),blood=plain({blood:h.G.p.blood,guard:h.G.p.bloodGuard,recovery:h.G.p.bloodRecovery,hp:h.G.p.hp});
 h.ctx.recomputeArmor(h.G.p);
 assert.equal(h.G.p.armorMods.discipline,null,'legacy set bonuses do not leak into the field mantle');
 assert.ok(Math.abs(h.G.p.armorMods.defense-40/300)<1e-12,'only chest defense and its affix count');
 const pk={x:100,y:0,armor:{...armor('helmet','New Visor'),defense:200,baseDefense:200}};h.G.pickups.push(pk);
 assert.equal(h.ctx.collectNearbyItem(),true);
 assert.equal(h.G.p.gear.helmet,null);assert.equal(h.G.p.gear.legs,null);assert.equal(h.G.p.gear.chest.mantle,true);
 assert.equal(h.G.p.gear.chest.name,'New Mantle');assert.equal(h.G.p.armorMods.defense,.22);
 assert.deepEqual(plain({blood:h.G.p.blood,guard:h.G.p.bloodGuard,recovery:h.G.p.bloodRecovery,hp:h.G.p.hp}),blood);
 assert.deepEqual(h.G.pickups.filter(p=>p.fieldSwap).map(p=>plain(p.armor)),Object.values(old));
 const chestDrop=h.G.pickups.find(p=>p.fieldSwap&&p.armor.slot==='chest');
 for(const p of h.G.pickups)if(p!==chestDrop)p.x=300;
 assert.equal(h.ctx.collectNearbyItem(),true);assert.equal(h.G.p.gear.chest.name,'Old Mantle');
 assert.equal(h.G.p.gear.chest.reinforce,1);assert.equal(h.G.p.blood,2);
 assert.deepEqual(plain(h.meta.inventory),bag);assert.equal(h.saved.at(-1).run.p.gear.chest.mantle,true);
});

test('locked, denied and malformed finds cannot consume the pickup or replace the carried equipment',()=>{
 for(const override of [{taken:true},{ritualLocked:true},{weaponMemoryLocked:true},{weapon:{arche:'not-a-weapon'}}]){
  const h=harness(),pk={x:100,y:0,weapon:weapon('Candidate'),...override};h.G.pickups.push(pk);
  const before=plain({player:h.G.p,pk,bag:h.meta.inventory});
  assert.equal(h.ctx.equipFieldFind(pk),false);
  assert.deepEqual(plain({player:h.G.p,pk,bag:h.meta.inventory}),before);assert.equal(h.G.pickups.length,1);
  assert.equal(h.saved.length,0);assert.equal(h.remembered.length,0);
 }
 for(const pk of [{x:100,y:0,armor:{slot:'ring'}},{x:100,y:0}]){
  const h=harness();h.G.pickups.push(pk);assert.equal(h.ctx.equipFieldFind(pk),false);assert.equal(pk.taken,undefined);
 }
 const h=harness({capability:false});h.G.p.weapon=null;const pk={x:100,y:0,weapon:weapon()};h.G.pickups.push(pk);
 assert.equal(h.ctx.collectNearbyItem(),false,'R cannot bypass the weapon memory gate');
 assert.equal(h.G.p.weapon,null);assert.equal(pk.taken,undefined);assert.equal(h.saved.length,0);
 assert.equal(h.G.pickups.length,1);assert.equal(h.meta.inventory.items.length,0);
});

test('pickup dispatch preserves authored acquisitions, distance, line of sight and nearest-choice behavior',()=>{
 for(const [kind,extra] of [['first',{acquisitionId:modules.weapons.FIRST_WEAPON.id}],['bow',{causewayBow:true}],
  ['mantle',{weapon:null,armor:armor(),autoEquip:true}],['crown',{weapon:null,portalSingle:true}]]){
  const h=harness(),pk={x:100,y:0,weapon:weapon(),...extra};h.G.pickups.push(pk);
  assert.equal(h.ctx.collectNearbyItem(),true);assert.equal(h.dispatch.length,1);assert.equal(h.dispatch[0][0],kind);
  assert.equal(h.dispatch[0][1],pk);assert.equal(h.G.p.weapon.name,'Old Blade');
 }
 const h=harness(),far={x:159,y:0,weapon:weapon('Far')};h.G.pickups.push(far);
 assert.equal(h.ctx.collectNearbyItem(),false);far.x=100;h.visible=false;assert.equal(h.ctx.collectNearbyItem(),false);
 h.visible=true;far.x=140;h.G.pickups.push({x:110,y:0,weapon:weapon('Near')});
 assert.equal(h.ctx.collectNearbyItem(),true);assert.equal(h.G.p.weapon.name,'Near');assert.equal(far.taken,undefined);
});

test('later stages and challenge modes retain bag pickups, slot armor and previous tool selection',()=>{
 for(const override of [{stageIndex:10},{stageIndex:4,battle:true},{stageIndex:4,bossRush:true},{stageIndex:4,ngPlus:1}]){
  const h=harness();Object.assign(h.G,override);
  const pk={x:100,y:0,weapon:weapon('Stored Blade')};h.G.pickups.push(pk);
  assert.equal(h.ctx.collectNearbyItem(),true);assert.equal(h.G.p.weapon.name,'Old Blade');
  assert.equal(h.meta.inventory.items[0].item.name,'Stored Blade');assert.equal(pk.taken,true);
  assert.equal(h.G.pickups.length,1,'legacy bag collection does not create a swap pickup');
  h.meta.inventory=fullBag();const full={x:100,y:0,weapon:weapon('Overflow')};h.G.pickups.push(full);
  assert.equal(h.ctx.collectNearbyItem(),false);assert.equal(full.taken,undefined);
  h.G.p.gear.chest=armor();
  assert.equal(h.ctx.shopGrant({grant:{kind:'armor',slot:'helmet',rarity:'common',name:'Guard Helmet'}}),true);
  assert.equal(h.G.p.gear.helmet.slot,'helmet');assert.equal(h.G.p.gear.chest.name,'Old Chestplate');
  h.meta.equipment=modules.equipment.acquireTool(h.meta.equipment,'retrieval-coil').state;
  assert.equal(h.ctx.shopGrant({grant:{kind:'tool',toolId:'assessor-lens'}}),true);
  assert.equal(h.meta.equipment.equippedTool,'retrieval-coil');
  assert.equal(h.ctx.carryShopTool({grant:{kind:'tool',toolId:'assessor-lens'}}),false);
 }
});

test('shop purchase carries its tool immediately; owned-tool selection saves without repurchase or charge refill',()=>{
 const h=harness({stage:5});
 h.meta.equipment=modules.equipment.acquireTool(h.meta.equipment,'retrieval-coil').state;
 h.meta.equipment=modules.equipment.consumeTool(h.meta.equipment).state;
 const lensShop=modules.shops.shops.find(s=>s.stock.some(i=>i.grant.toolId==='assessor-lens'));
 assert.equal(h.ctx.openRegionalShop({shopId:lensShop.id}),true);
 const lensIndex=modules.shops.inventory(h.meta.shops,lensShop.id).findIndex(i=>i.grant.toolId==='assessor-lens');
 const price=lensShop.stock[lensIndex].price;h.buttons[lensIndex].onclick();
 assert.equal(h.purchaseCalls,1);assert.equal(h.meta.gold,500-price);assert.equal(h.meta.equipment.equippedTool,'assessor-lens');
 assert.equal(h.saved.at(-1).equipment.equippedTool,'assessor-lens');
 assert.equal(h.meta.equipment.charges['retrieval-coil'],3);
 h.meta.equipment=modules.equipment.consumeTool(h.meta.equipment).state;
 const coilShop=modules.shops.shops.find(s=>s.stock.some(i=>i.grant.toolId==='retrieval-coil'));
 h.ctx.openRegionalShop({shopId:coilShop.id});
 const before={gold:h.meta.gold,shops:plain(h.meta.shops),charges:plain(h.meta.equipment.charges),owned:plain(h.meta.equipment.ownedTools)};
 const coilIndex=modules.shops.inventory(h.meta.shops,coilShop.id).findIndex(i=>i.grant.toolId==='retrieval-coil');
 h.buttons[coilIndex].onclick();
 assert.equal(h.purchaseCalls,1);assert.equal(h.meta.gold,before.gold);assert.deepEqual(plain(h.meta.shops),before.shops);
 assert.equal(h.meta.equipment.equippedTool,'retrieval-coil');assert.equal(h.saved.at(-1).equipment.equippedTool,'retrieval-coil');
 assert.deepEqual(plain(h.meta.equipment.charges),before.charges);assert.deepEqual(plain(h.meta.equipment.ownedTools),before.owned);
 assert.equal(h.events.filter(e=>e[0]==='tool-acquired').length,1);
 const saved=h.saved.length;
 assert.equal(h.ctx.carryShopTool({grant:{kind:'tool',toolId:'grounding-spike'}}),false);
 assert.equal(h.saved.length,saved);assert.equal(h.meta.equipment.equippedTool,'retrieval-coil');
});

test('shop armor in the completed regions is one mantle and neither heals nor revives legacy set bonuses',()=>{
 for(let stage=5;stage<=9;stage++){
  const h=harness({stage});h.G.p.gear={helmet:armor('helmet'),chest:armor(),legs:armor('legs')};
  assert.equal(h.ctx.shopGrant({grant:{kind:'armor',slot:'legs',rarity:'rare',name:'Snow Greaves'}}),true);
  assert.equal(h.G.p.gear.chest.name,'Snow Mantle');assert.equal(h.G.p.gear.chest.mantle,true);
  assert.equal(h.G.p.gear.helmet,null);assert.equal(h.G.p.gear.legs,null);assert.equal(h.G.p.armorMods.discipline,null);
  assert.equal(h.G.p.blood,2);assert.equal(h.G.p.hp,40);assert.equal(h.G.p.bloodGuard,.2);
 }
});

test('field forge spending charges gold while preserving anonymous material balances and legacy costs',()=>{
 const h=harness({stage:8}),cost={gold:45,materials:{iron:4,weave:2}};
 const state=modules.equipment.createState({materials:{iron:5,weave:3,prism:8,essence:2}});
 const fieldCost=h.ctx.fieldForgeCost(cost),spent=modules.equipment.spend(state,100,fieldCost);
 assert.equal(spent.ok,true);assert.equal(spent.gold,55);assert.deepEqual(plain(spent.state.materials),plain(state.materials));
 assert.deepEqual(cost,{gold:45,materials:{iron:4,weave:2}},'the legacy recipe is not mutated');
 assert.equal(modules.equipment.spend(modules.equipment.createState(),100,fieldCost).ok,true,'field recipes need no hidden material stock');
 assert.equal(modules.equipment.spend(state,44,fieldCost).ok,false,'gold still gates the work');
 h.G.stageIndex=10;assert.equal(h.ctx.fieldForgeCost(cost),cost);
 const legacy=modules.equipment.spend(state,100,h.ctx.fieldForgeCost(cost));
 assert.equal(legacy.ok,true);assert.equal(legacy.gold,55);
 assert.deepEqual(plain(legacy.state.materials),{iron:1,weave:1,prism:8,essence:2});
});
