import test from 'node:test';
import assert from 'node:assert/strict';
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
