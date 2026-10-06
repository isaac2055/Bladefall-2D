import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
function fn(name){const start=source.indexOf('function '+name+'('),brace=source.indexOf('{',start);let depth=0;for(let i=brace;i<source.length;i++){if(source[i]==='{')depth++;if(source[i]==='}'&&!--depth)return source.slice(start,i+1);}throw Error(name);}
const names=['duelBoss','startCombatEcho','combatEchoAttack','advanceEchoDuel','echoDuelHit','updateEchoDuel','updateCombatEcho','echoStanding','kingRecallLayout','updateKingRecall','updateEchoGateLatches','interactEchoMachine','updateEchoRooms','updateEchoFlankGuard'];
function context(e){
 const G={stageIndex:13,time:10,p:{x:100,y:0,h:44,face:1},enemies:[e],boss:e,projectiles:[],aoes:[],particles:[],obstacles:[],voidTrail:[],shake:0};
 const c=vm.createContext({G,Math,GROUND_Y:600,journeyState:()=>({claimed:[]}),toast(){},bossDeflect(){},bossShoot(){},hurtPlayer(){},killEnemy:e=>e.dead=true,rightHandSpent:e=>e.dead=true,doorOpen:o=>o.open,markPersistentCircuitOpen:id=>{G.latched=id;},grantAuthoredAdvancementBundle:()=>true});
 vm.runInContext(names.map(fn).join('\n'),c);return {G,c,run:x=>vm.runInContext(x,c)};
}
test('first duel: ordinary damage cannot skip bait; sword during lift then the turning counter',()=>{
 const e={x:1000,y:0,w:90,h:100,echoDuel:{mode:'first',hit:0,state:'bait',t:0}};const {G,run}=context(e);
 run("echoDuelHit(G.boss,'melee')");assert.equal(e.echoDuel.hit,0);
 G.echoBody={x:1040,y:0,life:14,spent:false};G.p.x=900;
 for(let i=0;i<70;i++)run('updateEchoDuel(G.boss,1/60)');assert.equal(e.echoDuel.state,'lift');assert.ok(G.echoBody.y>0);
 run("echoDuelHit(G.boss,'shot')");assert.equal(e.echoDuel.hit,0);
 run("echoDuelHit(G.boss,'melee')");assert.equal(e.echoDuel.hit,1);
 run('updateEchoDuel(G.boss,1.1)');G.echoBody={x:e.x+30,y:0,life:14,spent:false};
 for(let i=0;i<140;i++)run('updateEchoDuel(G.boss,1/60)');assert.equal(e.echoDuel.hit,2);assert.ok(G.aoes.length>0,'turnaround attacks the knight');
});
test('first duel: final strike needs both bodies within the same timing window',()=>{
 const e={x:1000,y:0,w:90,h:100,echoDuel:{mode:'first',hit:2,state:'bait',t:0}};const {G,run}=context(e);
 run("echoDuelHit(G.boss,'melee')");G.time+=1;run("echoDuelHit(G.boss,'clone-melee')");assert.equal(e.echoDuel.hit,2);
 run("echoDuelHit(G.boss,'melee')");assert.equal(e.echoDuel.hit,3);assert.equal(e.echoDuel.state,'flee');assert.ok(!e.dead);
 for(let i=0;i<600&&!e.dead;i++)run('updateEchoDuel(G.boss,1/60)');assert.equal(e.dead,true);assert.ok(G.voidTrail.some(p=>p.y>200),'fleeing path climbs the actual western steps');
});
test('rematch requires sword pair, bow pair, then Q body plus sword pair',()=>{
 const e={x:5800,y:0,w:90,h:100,echoDuel:{mode:'rematch',hit:0,state:'bait',t:0}};const {G,run}=context(e);
 for(const src of ['shot','clone-shot'])run(`echoDuelHit(G.boss,'${src}')`);assert.equal(e.echoDuel.hit,0);
 for(const src of ['melee','clone-melee'])run(`echoDuelHit(G.boss,'${src}')`);assert.equal(e.echoDuel.hit,1);
 run('updateEchoDuel(G.boss,1.1)');for(const src of ['shot','clone-shot'])run(`echoDuelHit(G.boss,'${src}')`);assert.equal(e.echoDuel.hit,2);
 run('updateEchoDuel(G.boss,1.1)');for(const src of ['melee','clone-melee'])run(`echoDuelHit(G.boss,'${src}')`);assert.ok(!e.dead);
 G.echoBody={x:e.x-100,y:0,life:14,spent:false};run("echoDuelHit(G.boss,'melee')");assert.equal(e.echoDuel.state,'triple');run('updateEchoDuel(G.boss,.4)');assert.equal(e.dead,true);
});
test('King conduit cannot be broken by merely dodging; two actual recalled strikes finish',()=>{
 const e={x:17200,y:0,echoOrigin:17200,echoArenaL:15900,echoArenaR:17420,kingRecall:{hit:0,state:'strike',t:0,sweep:0,recalled:false}};const {G,run}=context(e);
 G.p.x=16080;run('updateKingRecall(G.boss,1.1)');assert.equal(e.kingRecall.hit,0);
 for(let i=0;i<2;i++){e.kingRecall.state='strike';e.kingRecall.t=0;e.kingRecall.recalled=true;G.p.x=run('kingRecallLayout(G.boss).shelter');run('updateKingRecall(G.boss,1.1)');}
 assert.equal(e.dead,true);assert.equal(e.kingRecallDone,true);
});
test('crossing latches only the passed gate and consumes only its plate Echo',()=>{
 const {G,run}=context({});G.p.x=9470;G.obstacles=[{type:'door',x:9420,circuit:'throne-gate-b',open:true},{type:'plate',id:'throne-gate-b',echoOnly:true,x:8980,y:0}];G.echoBody={x:8980,y:0};
 run('updateEchoGateLatches()');assert.equal(G.latched,'throne-gate-b');assert.equal(G.echoBody.spent,true);assert.equal(G.echoCd,0);assert.ok(G.echoReturn);
});
test('relay carries the Echo and resets if its anchor has expired',()=>{
 const {G,run}=context({});const lift={type:'plat',x:7700,y:0,echoRelayLift:true},portal={echoRelayPortal:true};G.obstacles=[lift,portal];G.echoBody={x:7700,y:0,support:lift,supportDX:0};
 run('interactEchoMachine({echoRelayLever:true})');assert.equal(lift.released,true);assert.equal(portal.gone,true);run('updateEchoRooms(1)');assert.equal(G.echoBody.y,190);
 G.echoBody=null;run('interactEchoMachine({echoRelayLever:true})');assert.equal(lift.y,12);assert.equal(portal.gone,false);
});

test('the shield guard commits its facing so a recalled flank stays open',()=>{
 const e={x:100,y:0,face:1};const {G,run}=context(e);G.p.x=200;run('updateEchoFlankGuard(G.boss,.1)');G.p.x=0;run('updateEchoFlankGuard(G.boss,.4)');assert.equal(e.face,1);assert.equal(e.shieldFace,1);run('updateEchoFlankGuard(G.boss,.3)');assert.equal(e.echoGuardState,'strike');assert.equal(G.aoes[0].x,200);
});
