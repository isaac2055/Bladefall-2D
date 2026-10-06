import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
const helper=source.slice(source.indexOf('function updateBossHealthBar(){'),source.indexOf('function hudUpdate(){'));
function setup(){
 const elements={bosshpwrap:{classList:{toggle(_,v){elements.visible=v;}}},bossname:{},bosshp:{firstElementChild:{style:{}},setAttribute(k,v){this[k]=v;}}};
 const ctx=vm.createContext({G:{p:{x:0,y:0},boss:{x:300,y:0,active:true,hp:40,maxHp:100,label:'Warden'}},VW:1280,mode:'play',document:{getElementById:id=>elements[id]}});
 vm.runInContext(helper,ctx);
 return {ctx,e:elements,update:()=>vm.runInContext('updateBossHealthBar()',ctx)};
}
test('damage bosses show current health, including a restored checkpoint snapshot',()=>{
 const t=setup();t.update();assert.equal(t.e.visible,true);assert.equal(t.e.bossname.textContent,'Warden');assert.equal(t.e.bosshp.firstElementChild.style.width,'40%');
 t.ctx.G.boss={...t.ctx.G.boss,hp:75};t.update();assert.equal(t.e.bosshp['aria-valuenow'],'75');
});
test('puzzle encounters never present artificial health as damage progress',()=>{
 for(const flag of ['colossusForge','paradoxFight','echoFight','rightHandFight']){const t=setup();t.ctx.G.boss[flag]=true;t.update();assert.equal(t.e.visible,false,flag);}
});
test('bars hide outside live nearby encounters',()=>{
 for(const change of [{dead:true},{active:false},{bruteDormant:true},{hp:0},{maxHp:0},{x:5000}]){const t=setup();Object.assign(t.ctx.G.boss,change);t.update();assert.equal(t.e.visible,false);}
 const t=setup();t.ctx.mode='pause';t.update();assert.equal(t.e.visible,false);t.ctx.G=null;t.update();assert.equal(t.e.visible,false);
});
