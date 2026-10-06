import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
function fn(name){const start=source.indexOf('function '+name+'('),brace=source.indexOf('{',start);let depth=0;for(let i=brace;i<source.length;i++){if(source[i]==='{')depth++;if(source[i]==='}'&&!--depth)return source.slice(start,i+1);}throw Error(name);}
test('Oren requires every optional find and never awards damage merely for reaching a stage',()=>{
 const ids=['secret:frost-washhouse-wrap','secret:court-high-cache','workshop:cinder-ledger'];
 let claimed=[];const c=vm.createContext({OREN_REPAIR_FINDS:ids,journeyState:()=>({claimed})});vm.runInContext(fn('orenRepairReady'),c);
 for(const id of ids){assert.equal(vm.runInContext('orenRepairReady()',c),false);claimed.push(id);}
 assert.equal(vm.runInContext('orenRepairReady()',c),true);
});
test('Pure Nail grants once, updates either sword slot, and preserves the bow',()=>{
 const gifts=new Set();let notices=0;
 const bow={cls:'ranged',name:'Bow'},blade={cls:'melee',name:'Old blade'};
 const c=vm.createContext({G:{p:{weapon:bow,stowedWeapon:blade}},hasGift:id=>gifts.has(id),grantJourneyGift:id=>{if(gifts.has(id))return false;gifts.add(id);return true;},toast:()=>notices++});
 vm.runInContext(fn('applyPureNail')+'\n'+fn('unlockPureNail'),c);
 assert.equal(vm.runInContext('unlockPureNail()',c),true);
 assert.equal(blade.name,'Pure Nail');assert.equal(blade.pureNail,true);assert.equal(bow.name,'Bow');
 assert.equal(vm.runInContext('unlockPureNail()',c),false);assert.equal(notices,1);
});
test('Tyrant victory cannot heal even if the player is badly wounded',()=>{
 const c=vm.createContext({G:{stageIndex:12,p:{blood:1},boss:{}},tyrantWithdraws:()=>{},restoreBlood:()=>{throw Error('unexpected heal');}});
 vm.runInContext(fn('completeTyrantReward'),c);assert.equal(vm.runInContext('completeTyrantReward()',c),true);assert.equal(c.G.p.blood,1);
});
