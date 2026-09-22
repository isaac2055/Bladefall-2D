import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../public/index.html',import.meta.url),'utf8');
const Echoes=vm.runInNewContext(await readFile(new URL('../public/bladefall-echoes.js',import.meta.url),'utf8')+';BladefallEchoes');
const start=source.indexOf('function fieldPassiveEchoIds('),end=source.indexOf('function grantAuthoredAdvancementBundle(',start);
assert.ok(start>=0&&end>start);
const helpers=source.slice(start,end),plain=value=>JSON.parse(JSON.stringify(value));
const passiveIds=['fault-bell','far-thread','red-tempo','white-hush','road-knot','sky-kindling','chain-vow','gale-stitch'];
const knots=['watch-thread','gaol-knot','rime-knot','cinder-knot','paradox-knot','crown-knot'];

function harness({state,preview=false,capabilities=[],stage=8,pack=false,circuits:initialCircuits=[]}={}){
  const meta={echoes:state||Echoes.createState(),soundOn:false};
  const G={stageIndex:stage,ngPlus:0,worldProgressEligible:!preview,levelSelectMode:preview,p:{mods:{},hasJetpack:pack}};
  const capabilitiesSet=new Set(capabilities),circuits=new Set(initialCircuits),events=[],records=[],toasts=[],saves=[];
  let persistence=0,advancements=0;
  const ctx=vm.createContext({meta,G,BFEchoesModule:Echoes,
    hasCapability:id=>capabilitiesSet.has(id),persistentCircuitOpen:id=>circuits.has(id),
    markPersistentCircuitOpen:id=>{const changed=!circuits.has(id);circuits.add(id);return changed;},
    BFEchoes:{record:(type,id)=>records.push({type,id})},BFRuntime:{events:{emit:(type,value)=>events.push({type,value:plain(value)})}},
    syncBloodMirror(){},grantAuthoredAdvancement(){advancements++;},saveRunAtStage:(stage,snapshot)=>saves.push({stage,snapshot}),
    snapOf:player=>plain(player),persist(){persistence++;},hudUpdate(){},toast:message=>toasts.push(message),escText:String,SFX:{levelup(){}}
  });
  vm.runInContext(helpers,ctx);
  return{ctx,meta,G,capabilities:capabilitiesSet,circuits,events,records,toasts,saves,get persistence(){return persistence;},get advancements(){return advancements;}};
}

test('all early Echo hooks work beside a full later loadout, without consuming slots',()=>{
  const later=['ember-step','hollow-edge','crown-afterimage'];
  const h=harness({state:Echoes.createState({owned:[...passiveIds,...later],equipped:later,capacityKnots:knots}),pack:true});
  assert.deepEqual(plain(h.ctx.fieldPassiveEchoIds()),passiveIds);
  assert.equal(h.ctx.echoProfile().free,0);
  for(const id of passiveIds){
    assert.equal(h.ctx.hasEcho(id),true,id);
    for(const hook of Echoes.ECHOES[id].hooks){
      const packet={type:hook.event,...hook.qualifier&&{action:hook.qualifier}};
      const base=hook.operation.endsWith(':mul')?1:0;
      const expected=hook.operation==='pierce:add'?1:hook.value;
      assert.equal(h.ctx.echoModifier(packet,hook.operation,base),expected,`${id}: ${hook.operation}`);
      const receipts=h.ctx.resolveEchoEvent(hook.event,packet).filter(row=>row.echoId===id&&row.operation===hook.operation);
      assert.equal(receipts.length,1,`${id} produces exactly one receipt`);
    }
  }
  assert.deepEqual(plain(h.meta.echoes.equipped),later);
  assert.equal(h.ctx.echoModifier('stats:combat','power:mul',1),1.25,'later selected effects remain live');
  const mods=h.ctx.syncEchoRuntimeMods();
  for(const key of ['pierce','adren','thorns','dashFire','execute'])assert.equal(mods[key],true,key);
  assert.deepEqual(plain(h.G.p.mods),Object.fromEntries(Object.keys(Echoes.LEGACY_MODS).map(key=>[key,!!mods[key]])));
});

test('legacy passive selections free capacity before normalization and never apply twice',()=>{
  // A stale oversized request must retain its later choice once passive costs go.
  const raw={owned:[...passiveIds,'ember-step'],equipped:['fault-bell','white-hush','ember-step'],capacityKnots:[],sources:{}};
  const h=harness({state:raw,pack:true});
  assert.deepEqual(plain(h.ctx.echoState().equipped),['ember-step']);
  assert.deepEqual(plain(h.meta.echoes.owned),[...passiveIds,'ember-step']);
  assert.equal(h.ctx.echoProfile().used,2);
  for(const id of passiveIds){
    h.meta.echoes={...h.meta.echoes,equipped:[id,'ember-step']};
    for(const hook of Echoes.ECHOES[id].hooks){
      const packet={type:hook.event,...hook.qualifier&&{kind:hook.qualifier}};
      assert.equal(h.ctx.resolveEchoEvent(hook.event,packet).filter(row=>row.echoId===id&&row.operation===hook.operation).length,1);
      assert.equal(h.ctx.echoModifier(packet,hook.operation,hook.operation.endsWith(':mul')?1:0),hook.value);
    }
    assert.deepEqual(plain(h.meta.echoes.equipped),['ember-step']);
  }
});

test('qualifiers and operation fallback semantics match the module',()=>{
  const h=harness({state:Echoes.createState({owned:passiveIds}),pack:true});
  for(const [id,qualifier] of [['white-hush','rime'],['sky-kindling','cinder']]){
    const hook=Echoes.ECHOES[id].hooks.find(row=>row.qualifier);
    for(const field of ['action','kind','element']){
      const packet={type:hook.event,[field]:qualifier};
      assert.equal(h.ctx.echoModifier(packet,hook.operation,0),hook.value);
      assert.equal(h.ctx.resolveEchoEvent(packet.type,packet).filter(row=>row.echoId===id).length,1);
    }
    assert.equal(h.ctx.echoModifier({type:hook.event,action:'retrieve'},hook.operation,7),7);
    assert.equal(h.ctx.resolveEchoEvent(hook.event,{action:'retrieve'}).filter(row=>row.echoId===id).length,0);
  }
  assert.equal(h.ctx.echoModifier('status:ice','freeze-duration:mul',undefined),1.3);
  assert.equal(h.ctx.echoModifier('status:ice','freeze-duration:mul',2),2.6);
  assert.equal(h.ctx.echoModifier('enemy:defeated','attack-haste:seconds',2),5);
  assert.equal(h.ctx.echoModifier('player:dash','fault-bell:prime',99),1.5);
  assert.equal(h.ctx.echoModifier('unhandled','unknown',undefined),undefined);
  assert.equal(h.ctx.whiteHushActive(),true);
  assert.equal(h.ctx.whiteHushReceipts({type:'tool:use',element:'rime'}).length,1);
  assert.equal(h.ctx.whiteHushReceipts('player:dash').length,0);
});

test('unearned passives and unselected later Echoes never affect a player',()=>{
  const h=harness({state:Echoes.createState({owned:['ember-step','hollow-edge','crown-afterimage','courier-loop']})});
  Object.assign(h.G.p.mods,{pierce:true,adren:true,thorns:true,dashFire:true,execute:true});
  for(const id of [...passiveIds,'ember-step','hollow-edge','crown-afterimage','courier-loop'])assert.equal(h.ctx.hasEcho(id),false,id);
  for(const id of passiveIds)for(const hook of Echoes.ECHOES[id].hooks){
    const packet={type:hook.event,action:hook.qualifier},base=hook.operation.endsWith(':mul')?1:0;
    assert.equal(h.ctx.echoModifier(packet,hook.operation,base),base);
    assert.equal(h.ctx.resolveEchoEvent(packet.type,packet).length,0);
  }
  const mods=h.ctx.syncEchoRuntimeMods();
  for(const key of Object.keys(Echoes.LEGACY_MODS)){assert.equal(mods[key],false);assert.equal(h.G.p.mods[key],false);}
});

test('preview boss passives follow session capabilities and never modify campaign Echoes',()=>{
  const owned=Echoes.createState({owned:passiveIds,equipped:['far-thread','red-tempo'],capacityKnots:knots});
  const h=harness({state:owned,preview:true,pack:true}),before=JSON.stringify(h.meta);
  for(const [id,capability] of Object.entries({'fault-bell':'dash','far-thread':'portal-pair','red-tempo':'counter','white-hush':'attunement'})){
    assert.equal(h.ctx.hasEcho(id),false,`${id} cannot leak from campaign ownership into an earlier preview`);
    h.capabilities.add(capability);assert.equal(h.ctx.hasEcho(id),true);
    const hook=Echoes.ECHOES[id].hooks[0],packet={type:hook.event,action:hook.qualifier};
    assert.equal(h.ctx.echoModifier(packet,hook.operation,0),hook.value);
    assert.equal(h.ctx.resolveEchoEvent(packet.type,packet).filter(row=>row.echoId===id).length,1);
  }
  assert.equal(h.ctx.whiteHushActive(),true);assert.equal(h.ctx.farThreadActive(),true);
  h.ctx.echoState();h.ctx.echoProfile();h.ctx.syncEchoRuntimeMods();
  // Even inconsistent eligibility from an old preview must not save grants.
  h.G.worldProgressEligible=true;
  assert.equal(h.ctx.grantEchoReward({type:'boss:defeated',boss:'brute'}),null);
  assert.equal(h.ctx.grantAuthoredEcho('road-knot','test'),null);
  assert.equal(JSON.stringify(h.meta),before);assert.equal(h.persistence,0);assert.equal(h.saves.length,0);assert.equal(h.advancements,0);
  const fresh=harness({preview:true,capabilities:['attunement']});
  assert.equal(fresh.ctx.echoModifier('status:ice','freeze-duration:mul',1),1.3);
  assert.deepEqual(plain(fresh.meta.echoes.owned),[]);
});

test('Gale Stitch fits locally in preview and stays passive when campaign-owned',()=>{
  const h=harness({preview:true,stage:3,pack:true}),before=JSON.stringify(h.meta);
  assert.equal(h.ctx.hasEcho('gale-stitch'),false);
  h.ctx.grantAuthoredEcho('gale-stitch','secret:needlewind-mastery');
  assert.equal(h.ctx.hasEcho('gale-stitch'),true);
  assert.equal(h.ctx.echoModifier('player:jetpack','fuel-use:mul',1),.72);
  assert.equal(h.ctx.echoModifier('environment:air','control:mul',1),1.08);
  h.ctx.grantAuthoredEcho('gale-stitch','secret:needlewind-mastery');
  assert.equal(h.toasts.length,1);assert.equal(h.saves.length,1);assert.equal(JSON.stringify(h.meta),before);
  h.G.stageIndex=4;assert.equal(h.ctx.echoModifier('environment:air','control:mul',1),1);
  h.G.stageIndex=3;h.G.p.hasJetpack=false;assert.equal(h.ctx.hasEcho('gale-stitch'),false);
  const campaign=harness({state:Echoes.createState({owned:['gale-stitch']}),stage:4});
  assert.equal(campaign.ctx.hasEcho('gale-stitch'),true);
  assert.equal(campaign.ctx.echoModifier('environment:air','control:mul',1),1.08);
  assert.equal(campaign.ctx.echoModifier('player:jetpack','fuel-use:mul',1),1);
  campaign.G.p.hasJetpack=true;assert.equal(campaign.ctx.echoModifier('player:jetpack','fuel-use:mul',1),.72);
});

test('boss and quest grants activate immediately, preserve later choices and are idempotent',()=>{
  const later=['ember-step','hollow-edge','crown-afterimage'];
  const h=harness({state:Echoes.createState({owned:later,equipped:later,capacityKnots:knots}),pack:true});
  const rewards=[...['brute','archer','warden','sorcerer'].map(boss=>({type:'boss:defeated',boss})),
    ...['road-without-a-name','kindling-the-sky','release-the-causeway'].map(questId=>({type:'quest:completed',questId}))];
  for(const event of rewards){
    const result=h.ctx.grantEchoReward(event);assert.equal(result.changed,true);assert.equal(h.ctx.hasEcho(result.echo.echo.id),true);
    const saves=h.saves.length,persist=h.persistence,acquisitions=h.records.filter(row=>row.type==='acquired').length;
    assert.equal(h.ctx.grantEchoReward(event).changed,false);assert.equal(h.saves.length,saves);assert.equal(h.persistence,persist);
    assert.equal(h.records.filter(row=>row.type==='acquired').length,acquisitions);
  }
  assert.equal(h.ctx.grantAuthoredEcho('gale-stitch','secret:needlewind-mastery').changed,true);
  const count=h.persistence;assert.equal(h.ctx.grantAuthoredEcho('gale-stitch','secret:needlewind-mastery').changed,false);assert.equal(h.persistence,count);
  assert.deepEqual(plain(h.meta.echoes.equipped),later);
  assert.equal(h.toasts.some(message=>/refuge to equip|capacity expanded|equipped automatically/i.test(message)),false);
  assert.equal(h.ctx.syncEchoRuntimeMods().adren,true);assert.equal(h.G.p.mods.thorns,true);assert.equal(h.G.p.mods.pierce,true);
});

test('later boss rewards still require selection rather than becoming passive',()=>{
  const h=harness();
  h.ctx.grantEchoReward({type:'boss:defeated',boss:'colossus'});
  assert.ok(h.meta.echoes.owned.includes('ember-step'));assert.equal(h.ctx.hasEcho('ember-step'),false);
  assert.equal(h.ctx.echoModifier('player:dash','fire-trail:enable',0),0);
  h.meta.echoes=Echoes.equip(h.meta.echoes,'ember-step',{atRest:true}).state;
  assert.equal(h.ctx.hasEcho('ember-step'),true);assert.equal(h.ctx.echoModifier('player:dash','fire-trail:enable',0),1);
  assert.equal(h.ctx.syncEchoRuntimeMods().dashFire,true);
});
