import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';

const require=createRequire(import.meta.url);
const Blood=require('../public/bladefall-blood.js');
const Inventory=require('../public/bladefall-inventory.js');
const Dialogue=require('../public/bladefall-dialogue.js');

test('Blood reserve uses whole measures and armor banks whole-wound Ward',()=>{
  assert.equal(Blood.maxMeasures(0),5);
  assert.equal(Blood.maxMeasures(2),5);
  assert.equal(Blood.maxMeasures(3),6);
  assert.equal(Blood.maxMeasures(4),6);
  assert.equal(Blood.maxMeasures(99),7);
  assert.equal(Blood.protection(.8),.25);
  let player={blood:5,bloodGuard:0};
  for(let i=0;i<4;i++){const hit=Blood.apply(player,20,.2,true,0);assert.equal(hit.lost,1);assert.equal(Number.isInteger(hit.blood),true);player={blood:hit.blood,bloodGuard:hit.guard};}
  const ward=Blood.apply(player,20,.2,true,0);assert.equal(ward.blocked,true);assert.equal(ward.lost,0);assert.equal(ward.blood,1);
});

test('all wounds cost one measure and fractional recovery stays hidden until whole',()=>{
  assert.equal(Blood.severity(6,true),1);
  assert.equal(Blood.severity(20,true),1);
  assert.equal(Blood.severity(60,true),1);
  assert.equal(Blood.severity(14,false),1);
  assert.equal(Blood.severity(0,false),1);
  const first=Blood.restore({blood:3,bloodRecovery:0},.4,0);assert.equal(first.blood,3);assert.equal(first.recovery,.4);
  const second=Blood.restore({blood:first.blood,bloodRecovery:first.recovery},.6,0);assert.equal(second.blood,4);assert.equal(second.recovery,0);
  assert.equal(Blood.normalize({blood:3.4},0).blood,3);
});

test('bag collection is persistent, bounded, detached, and never auto-equips',()=>{
  const sword={name:'Oathblade',arche:'sword',rarity:'common'};
  const result=Inventory.collect(null,sword,'oathblade');
  assert.equal(result.ok,true);assert.equal(result.state.items.length,1);
  sword.name='Mutated';assert.equal(result.state.items[0].item.name,'Oathblade');
  assert.equal(result.state.equippedWeaponId,undefined);
  assert.equal(Inventory.get(result.state,result.entry.id).kind,'weapon');
});

test('Levels 1–3 dialogue has a separate reset-proof editor surface',async()=>{
  const catalog=Dialogue.catalog();
  assert.ok(catalog.some(row=>row.level===0&&row.speaker==='Mara'));
  assert.ok(catalog.some(row=>row.level===1&&row.speaker==='Hale'));
  assert.ok(catalog.some(row=>row.level===2&&row.speaker==='Oren'));
  const editor=await readFile(new URL('../public/dialogue-editor.html',import.meta.url),'utf8');
  const source=await readFile(new URL('../public/index.html',import.meta.url),'utf8');
  assert.match(editor,/Bladefall Dialogue Editor/);
  assert.match(editor,/Full Reset does not erase them/);
  assert.match(editor,/Save &amp; return/);
  assert.match(editor,/filtering must never silently discard text/);
  assert.match(source,/window\.open\('\.\/dialogue-editor\.html'/);
});

test('first three levels use deliberate bagging, silent locked inputs, and visible armor slots',async()=>{
  const source=await readFile(new URL('../public/index.html',import.meta.url),'utf8');
  assert.match(source,/pickup:'KeyR'/);
  assert.match(source,/if\(keyPressedFor\('pickup'\)\)collectNearbyItem\(\)/);
  assert.match(source,/keyLabel\(kbCode\('pickup'\)\)\+' · TAKE'/);
  assert.match(source,/function lockedWeaponFeedback[\s\S]*BFWeaponProgression\.recordBlocked[\s\S]*return true/);
  assert.match(source,/function lockedPortalFeedback[\s\S]*return true/);
  assert.match(source,/if\(!n\)return false/);
  assert.match(source,/const hasHelm=!!\(p\.gear&&p\.gear\.helmet\),hasChest=!!\(p\.gear&&p\.gear\.chest\),hasLegs=!!\(p\.gear&&p\.gear\.legs\)/);
});

test('early-game presentation reveals systems only after the player finds them',async()=>{
  const source=await readFile(new URL('../public/index.html',import.meta.url),'utf8');
  const equipment=await readFile(new URL('../public/bladefall-equipment-economy.js',import.meta.url),'utf8');
  const echoes=await readFile(new URL('../public/bladefall-echoes.js',import.meta.url),'utf8');
  assert.match(source,/Dreambound Action-Adventure/);
  assert.doesNotMatch(source,/Stage 4 flies on/);
  assert.doesNotMatch(source,/Stage 12 turns the world/);
  assert.match(source,/<button class="bigbtn ghost" id="dialogueEditorBtn">✎ Dialogue Editor<\/button>/);
  assert.match(source,/mapBar\.style\.display=meta\.outskirtsFieldChart\?'flex':'none'/);
  assert.match(source,/abilityTag\.style\.display=G\.stageIndex<=2\?'none':'inline-flex'/);
  assert.match(source,/function playerBuildDiscovery\(\)/);
  assert.match(source,/discovery\.bag\?'<button class="bigbtn ghost" id="bagBtn"/);
  assert.match(source,/model\.rows\.filter\(row=>row\.status!=='unknown'\)/);
  assert.match(source,/MATERIAL_IDS\.filter\(id=>\(state\.materials\[id\]\|\|0\)>0\)/);
  assert.match(equipment,/Veiled Essence/);
  assert.doesNotMatch(equipment,/Datura Essence/);
  assert.match(equipment,/\+20 armor defense/);
  assert.match(source,/Every wound costs one whole measure/);
  assert.match(echoes,/Blood capacity falls/);
});

test('the Outskirts arrival carries authored evidence of an interrupted field camp',async()=>{
  const source=await readFile(new URL('../public/index.html',import.meta.url),'utf8');
  assert.match(source,/Scenery\(990,0,'collapsed-stretcher'/);
  assert.match(source,/Scenery\(1560,0,'abandoned-kit'/);
  assert.match(source,/kind==='collapsed-stretcher'/);
  assert.match(source,/kind==='abandoned-kit'/);
});
