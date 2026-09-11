import test from 'node:test';
import assert from 'node:assert/strict';

await import('../public/bladefall-milestones.js');
const Milestones=globalThis.BladefallMilestones;

test('all seven bosses declare ability-aware solution and retry contracts',()=>{
  assert.deepEqual(Milestones.validate(),{ok:true,errors:[],bosses:7,categories:4});
  const tyrant=Milestones.bossContracts.find(row=>row.type==='tyrant');
  assert.equal(tyrant.phases,3);
  assert.equal(tyrant.solution,'align-low-mid-high-paradox-bands');
  assert.deepEqual(Milestones.bossEligibility('tyrant',['jump','weapon','portal-pair']).missing,['gravity-flip']);
  assert.equal(Milestones.bossEligibility('tyrant',tyrant.required).ok,true);
});

test('boss contract attaches to runtime enemy without inventing a second encounter',()=>{
  const enemy={type:'archer',boss:true};
  const result=Milestones.attachBossContract(enemy,['jump','weapon','dash','portal-single']);
  assert.equal(result.ok,true);assert.equal(enemy.milestoneContract.phases,3);
  assert.equal(enemy.milestoneContract.reward,'portal-pair');
  assert.equal(enemy.milestoneEligibility.reason,'ready');
});

test('zone completion keeps the best revisit and accepts an expanded denominator',()=>{
  let run=Milestones.createRun();
  run=Milestones.commitZone(run,'outskirts',{enemyDone:2,enemyTotal:4,coinDone:0,coinTotal:1,travelerDone:1,travelerTotal:1},10).run;
  assert.equal(Milestones.completionPercent(run),50);
  const worse=Milestones.commitZone(run,'outskirts',{enemyDone:1,enemyTotal:4,coinDone:0,coinTotal:1,travelerDone:1,travelerTotal:1},20);
  assert.equal(worse.changed,false);assert.equal(worse.run.done,3);
  run=Milestones.commitZone(run,'outskirts',{enemyDone:4,enemyTotal:4,coinDone:1,coinTotal:1,travelerDone:1,travelerTotal:1},30).run;
  assert.equal(Milestones.completionPercent(run),100);
  run=Milestones.commitZone(run,'outskirts',{enemyDone:4,enemyTotal:5,coinDone:1,coinTotal:1,travelerDone:1,travelerTotal:1},40).run;
  assert.equal(run.total,7);assert.equal(run.done,6);
});

test('leaderboard archive sanitizes entries, ranks deterministically, and never truncates',()=>{
  const raw={lastName:'  Moss  Knight ',base:[
    {name:'A',time:90,completion:80,at:2},{name:'B',time:90,completion:100,at:1},{name:'',time:1,completion:100},
  ]};
  let archive=Milestones.createArchive(raw);
  assert.equal(archive.base.length,2);assert.equal(archive.lastName,'Moss Knight');
  assert.equal(Milestones.rank(archive.base,'time')[0].name,'B');
  assert.equal(Milestones.rank(archive.base,'completion')[0].name,'B');
  const added=Milestones.addEntry(archive,'base',{name:' C ',time:70,completion:50,at:3});
  assert.equal(added.ok,true);assert.equal(added.archive.base.length,3);assert.equal(added.archive.lastName,'C');
});

test('record eligibility is explicitly single-player and separates four run types',()=>{
  assert.equal(Milestones.runEligibility({ngPlus:2}).category,'ng2');
  assert.equal(Milestones.runEligibility({bossRush:true}).category,'rush');
  assert.deepEqual(Milestones.runEligibility({coop:true}).reasons,['single-player-only']);
  assert.equal(Milestones.runEligibility({testMode:true}).ok,false);
});
