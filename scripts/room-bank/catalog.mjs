// Active-bank contract; archived sources never enter registration or play.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
export const catalog=JSON.parse(readFileSync(new URL('./catalog.json',import.meta.url),'utf8'));
export function bankGroups(activeRun=catalog.activeRun){
 if(catalog.defaultGroup==='cores')return ['cores','superrooms','banked'];
 if(catalog.defaultGroup==='banked')return ['banked'];
 if(catalog.defaultGroup==='superrooms')return ['superrooms','banked'];
 if(catalog.defaultGroup==='pending')return ['pending','banked'];
 const runs=Array.from({length:activeRun},(_,i)=>'run'+(activeRun-i));
 return [...runs.filter(x=>+x.slice(3)>=5),'superrooms',...runs.filter(x=>+x.slice(3)<5),'review','banked'];
}
export function orderRecords(records){return records.sort((a,b)=>{
 const order=catalog.order||catalog.retained,ka=order.indexOf(a.room.id),kb=order.indexOf(b.room.id);
 if(ka>=0||kb>=0)return (ka<0?Infinity:ka)-(kb<0?Infinity:kb);
 return a.room.id.localeCompare(b.room.id,undefined,{numeric:true});
});}
export function assertBatch(records){
 const fresh=records.filter(x=>x.bank.batch===catalog.activeBatch);
 const quotas=catalog.newRoomsBySide||{base:catalog.newRoomsPerSide,fractured:catalog.newRoomsPerSide};
 assert.equal(records.length,catalog.retained.length+quotas.base+quotas.fractured,'Active bank size');
 assert.deepEqual(records.filter(x=>x.bank.batch!==catalog.activeBatch).map(x=>x.room.id).sort(),[...catalog.retained].sort(),'Only explicitly retained earlier rooms belong in the bank');
 for(const side of ['base','fractured'])assert.equal(fresh.filter(x=>x.bank.side===side).length,quotas[side],`${side}: current batch count`);
 if(catalog.reviewCycle)assert.deepEqual(fresh.map(x=>({id:x.room.id,side:x.bank.side,run:x.bank.run??null,acceptance:x.bank.acceptance})).sort((a,b)=>a.id.localeCompare(b.id)),[...catalog.reviewRecords].sort((a,b)=>a.id.localeCompare(b.id)),'Every requested revision and variant belongs to its original run and correct side');
 if(catalog.activeRun&&!catalog.reviewCycle)for(const x of fresh)assert.equal(x.bank.run,catalog.activeRun,`${x.room.id}: active run`);
 for(const req of catalog.newTechRequirements||[])assert.ok(fresh.filter(x=>x.bank.side===req.side&&x.bank.newMechanics.includes(req.tag)&&x.room.movement==='survive-2').length>=req.minimum,`${req.side}: at least ${req.minimum} ${req.tag} rooms with the new movement profile`);
 for(const req of catalog.newEntityRequirements||[])assert.ok(fresh.filter(x=>x.bank.side===req.side&&x.bank.newMechanics.includes(req.tag)&&x.room[req.field]?.length).length>=req.minimum,`${req.side}: at least ${req.minimum} ${req.tag} entity rooms`);
 if(catalog.requireNewMovementEntityPair)for(const x of fresh){
  assert.equal(x.room.movement,'survive-2',`${x.room.id}: Run 4 uses the new movement profile`);
  const movement={"controlled-pogo":['pogo-low','pogo-loft'],"cargo-dash-catch":['cargo-dash-catch'],"reverse-dash-jump":['reverse-hyper','reverse-super'],"wallbounce-grace":['late-wallbounce']};
  const entity={"recoil-platform":'recoilPlatforms',"impulse-seed":'impulseSeeds',"moving-hook":'movingHooks'};
  assert.ok(Object.entries(movement).some(([tag,events])=>x.bank.newMechanics.includes(tag)&&events.some(e=>x.bank.requiredEvents.includes(e))),`${x.room.id}: required new movement interaction`);
  assert.ok(Object.entries(entity).some(([tag,field])=>x.bank.newMechanics.includes(tag)&&x.room[field]?.length),`${x.room.id}: new entity used`);
 }
 if(catalog.superrooms)for(const x of fresh){
  assert.equal(x.bank.collection,'superrooms',`${x.room.id}: scrolling collection`);
  assert.ok((x.room.cols||40)*(x.room.rows||23)>=40*23*3,`${x.room.id}: at least three normal room areas`);
  assert.ok(x.bank.approvedIngredients?.length>=2,`${x.room.id}: banked sources documented`);
  for(const id of x.bank.approvedIngredients)assert.ok(catalog.banked.includes(id),`${x.room.id}: approved source ${id}`);
  assert.ok(x.bank.interconnection,`${x.room.id}: shared-state design documented`);
 }
 if(catalog.roomFormats){
  for(const side of ['base','fractured'])for(const [format,count]of Object.entries(catalog.roomFormats))assert.equal(fresh.filter(x=>x.bank.side===side&&x.bank.format===format).length,count,`${side}: ${format} quota`);
  for(const x of fresh){
   assert.equal(x.bank.collection,'run'+catalog.activeRun,`${x.room.id}: current run stays separate from previous review groups`);
   assert.ok(x.bank.novelty&&x.bank.nearestExisting,`${x.room.id}: discovery and comparison documented`);
   if(x.bank.format==='superroom'){
    assert.ok((x.room.cols||40)*(x.room.rows||23)>=40*23*3,`${x.room.id}: at least three normal room areas`);
    assert.ok(x.bank.interconnection,`${x.room.id}: shared-state design documented`);
   }
  }
 }
 if(catalog.existingSystemsOnly)for(const x of fresh){
  assert.equal(x.bank.run,catalog.activeRun,`${x.room.id}: current run`);
  assert.deepEqual(x.bank.newMechanics,[],`${x.room.id}: Run 1 only uses existing systems`);
 }
 for(const req of catalog.mechanicRequirements){
  const matches=fresh.filter(x=>x.bank.side===req.side&&(req.field?x.room[req.field]?.length:x.room.map.some(r=>r.includes(req.glyph))));
  assert.ok(matches.length>=req.minimum,`${req.side}: at least ${req.minimum} ${req.tag} rooms`);
 }
 if(catalog.timingStagesPerNewRoom)for(const x of fresh){
  assert.ok(x.bank.timing?.principle,`${x.room.id}: timing principle`);
  assert.ok(x.bank.timing.stages?.length>=catalog.timingStagesPerNewRoom,`${x.room.id}: multiple timing decisions`);
  for(const stage of x.bank.timing.stages)for(const key of ['cue','action','rest'])assert.ok(stage[key],`${x.room.id}: timing stage ${key}`);
  assert.ok(x.room.sweepers?.length||x.room.shutters?.length||x.room.slabs?.length,`${x.room.id}: live cyclic hazard`);
 }
 for(const [key,acceptance] of [['banked','banked'],['revised','revised']])assert.deepEqual(records.filter(x=>x.bank.acceptance===acceptance).map(x=>x.room.id).sort(),[...catalog[key]].sort(),`${acceptance}: follow the user's decisions`);
}
