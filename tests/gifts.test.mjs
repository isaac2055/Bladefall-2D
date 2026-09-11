import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
await import('../public/bladefall-gifts.js');
const Gifts=globalThis.BladefallGifts;

test('appearance and Gift ownership are independent',()=>{
  const migrated=Gifts.migrate(null,{skin:'crimson',skinsOwned:{warden:true,crimson:true},bossTypeKills:{brute:1}});
  assert.deepEqual(migrated.state.owned,['steadfast','blood-vow']);
  assert.equal(migrated.state.equipped,'blood-vow');
  const equipped=Gifts.equip(migrated.state,'steadfast');
  assert.equal(equipped.ok,true);
  assert.equal(equipped.state.equipped,'steadfast');
});

test('Blood Vow replaces lifesteal with a discrete retaliation rule',()=>{
  const gift=Gifts.GIFTS['blood-vow'];
  assert.equal(gift.hooks.find(row=>row.event==='player:wounded').value,6);
  assert.equal(gift.hooks.find(row=>row.operation==='damage:mul').value,1.25);
  assert.doesNotMatch(JSON.stringify(gift.hooks),/life|heal/i);
  assert.equal(Gifts.validate().ok,true);
});

test('Gilded Instinct is wired to the runtime and no longer advertises itself as inactive', async () => {
  const source = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
  const gift = globalThis.BladefallGifts.uiModel({}).rows.find((row) => row.id === 'gilded-instinct');
  assert.ok(gift, 'gilded-instinct is present in the catalog');
  assert.doesNotMatch(gift.description, /inactive|no gameplay effect/i);

  // The Gift reveals placed, unclaimed treasure only. It must never open or
  // move anything, so no route can come to depend on wearing it.
  assert.match(source, /function updateCacheSense\(p,dt\)/);
  assert.match(source, /if\(!hasGift\('gilded-instinct'\)\)/);
  assert.match(source, /updateCacheSense\(p,dt\);/);
  assert.match(source, /function cacheSenseTarget\(o\)\{\n\s*if\(o\.gone\|\|o\.read\|\|o\.taken\)return false;/);
  assert.match(source, /return o\.type==='coin'\|\|!!o\.sealedRecollection\|\|!!o\.vaultKeyId;/);
  const body = source.slice(source.indexOf('function updateCacheSense'), source.indexOf('function concludeRootboundLesson'));
  assert.doesNotMatch(body, /\.taken=|\.read=|\.gone=|G\.pickups\.push|grantPermanentCapability/,
    'cache sense may only draw attention, never claim or unlock anything');
});

test('every Gift that promises an effect is wired to the runtime',async()=>{
  const source=await readFile(new URL('../public/index.html',import.meta.url),'utf8');
  // Gift hooks are declarative metadata; the runtime reads hasGift(), so a Gift
  // with hooks and no hasGift() call silently promises an effect it never has.
  const unwired=Gifts.uiModel({}).rows
    .filter((row)=>(row.hooks||[]).length>0)
    .filter((row)=>!source.includes(`hasGift('${row.id}')`))
    .map((row)=>row.id);
  assert.deepEqual(unwired,[],'these Gifts describe an effect but have no runtime hook');
  // Steadfast is the deliberate exception: it declares no hooks and alters no rule.
  const steadfast=Gifts.uiModel({}).rows.find((row)=>row.id==='steadfast');
  assert.deepEqual(steadfast.hooks,[]);
  assert.match(steadfast.description,/No altered rule/);
});
