import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=n=>readFileSync(new URL('../public/'+n,import.meta.url),'utf8');
const expected=[21,22,25,23,24,26,27,28,29,30,31];
const names=['outskirts','woods','causeway','updrafts','marksman','keep','warden','frostfell','sorcerer','emberdeep','colossus'];
test('Fractured travel and Level Select follow source order while retaining saved stage IDs',()=>{
  const window={BladefallActTwo:{register(){},kit:{}}};
  vm.runInNewContext(read('bladefall-fractured.js'),{window});
  const F=window.BladefallFractured;
  // Deliberately register in construction order.
  for(const stage of [...expected].sort((a,b)=>a-b))F.registerEcho(expected.indexOf(stage),stage);
  for(let i=0;i<expected.length;i++)assert.equal(F.nextEcho(expected[i]),expected[i+1]??null);
  assert.equal(F.nextEcho(999),null);
  vm.runInNewContext(read('bladefall-rift-shards.js'),{window});
  const R=window.BladefallRiftShards;
  assert.deepEqual(Array.from(R.FRACTURED,r=>r[1]),[0,1,2,3,4,5,6,7,8,9,10,11,12,13,15,16,17,18,19,20]);
  assert.deepEqual([...R.levelSelectRows().matchAll(/data-fx="(\d+)"/g)].map(m=>+m[1]),expected);
  for(let i=0;i<names.length;i++){
    const source=read('bladefall-fractured-'+names[i]+'.js');
    assert.match(source,new RegExp(`STAGE = ${expected[i]},`));
    assert.match(source,new RegExp(`SOURCE = ${i};`));
  }
});
test('both walking directions, arrivals and every graph agree on the corrected neighbors',()=>{
  for(const [id,from,to,fromStage,toStage] of [
    ['fw-fc','woods','causeway',22,25],['fc-fu','causeway','updrafts',25,23],
    ['fu-fm','updrafts','marksman',23,24],['fm-fk','marksman','keep',24,26]]){
    const left=read(`bladefall-fractured-${from}.js`),right=read(`bladefall-fractured-${to}.js`);
    assert.ok(left.includes(`F.seamOn(STAGE, ZONE, '${id}'`));
    assert.ok(left.includes(`plan.connectorId === '${id}' ? { x:LEN - 160`));
    assert.ok(right.includes(`connector:'${id}', zone:ZONE, targetStage:${fromStage}`));
    for(const f of ['progression','world','zones']){
      const line=read(`bladefall-${f}.js`).split('\n').find(l=>l.includes(`'${id}'`));
      assert.ok(line?.includes(`'fractured-${from}'`)&&line.includes(`'fractured-${to}'`),`${f}: ${id}`);
    }
  }
  for(const f of ['progression','world','zones'])assert.doesNotMatch(read(`bladefall-${f}.js`),/'(?:fw-fu|fm-fc|fc-fk)'/);
});

test('zone transition plans resolve both ways and map positions follow the source road',async()=>{
  await import('../public/bladefall-progression.js');
  await import('../public/bladefall-zones.js');
  const P=globalThis.BladefallProgression,Z=globalThis.BladefallZones;
  for(const [id,from,to] of [['fw-fc','woods','causeway'],['fc-fu','causeway','updrafts'],['fu-fm','updrafts','marksman'],['fm-fk','marksman','keep']]){
    for(const [a,b] of [[from,to],[to,from]]){
      const plan=Z.planTransition(id,'fractured-'+a,{});
      assert.equal(plan.ok,true);assert.equal(plan.targetZoneId,'fractured-'+b);
      assert.equal(plan.arrival.inward.x,a===from?1:-1);
    }
  }
  assert.deepEqual(names.map(n=>P.zone('fractured-'+n).position.column),[1,2,3,4,5,6,7,8,9,10,11]);
});
