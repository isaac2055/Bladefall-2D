import assert from 'node:assert/strict';
import {exploreRuntime} from './explore-runtime-harness.mjs';
const a=await exploreRuntime('?workshopSource=1'),b=await exploreRuntime('?workshopSource=1');
try{
 const w=a.w,v=b.w,A=w.BladefallWorkshopExplore,M=w.BladefallWorkshopModel,model=M.session(M.create({id:'coop-draft',mode:'explore',name:'Shared test',definition:A.blank()}),{validateDefinition:d=>A.compile(d.definition)});
 for(const [id,glyph,x,y]of [['lever','lever',300,-40],['door','door',850,-180],['plate','plate',500,-10]])assert(model.submit('a',A.insert(model.snapshot().definition,{id,glyph,x,y})).ok);
 let now=0;w.performance.now=v.performance.now=()=>now;
 const doc=JSON.parse(JSON.stringify(model.snapshot())),toA=[],toB=[],clone=x=>JSON.parse(JSON.stringify(x));
 w.BladefallWorkshopNativePlay.start({document:doc,role:'host',connected:true,send:m=>toB.push(clone(m))});
 v.BladefallWorkshopNativePlay.start({document:doc,role:'guest',connected:true,send:m=>toA.push(clone(m))});
 function exchange(){let n=0;while(toA.length||toB.length){for(const m of toA.splice(0))w.BladefallWorkshopNativePlay.receive(m);for(const m of toB.splice(0))v.BladefallWorkshopNativePlay.receive(m);if(++n>20)throw Error('Packet loop');}}
 function tick(n=1){for(let i=0;i<n;i++){now+=1000/60;w.gameUpdate();v.gameUpdate();exchange();}}
 assert(w.__BF.G.coopSession&&v.__BF.G.coopSession);v.__BF.G.p.x=530;v.__BF.G.p.y=0;tick(30);
 assert(w.__NET.ghost.synced);assert(Math.abs(w.__NET.ghost.x-v.__BF.G.p.x)<5,'host sees the guest knight');assert(v.__NET.ghost.synced,'guest sees the host knight');
 const hp=w.__BF.G.obstacles.find(o=>o.type==='plate');assert(hp.pressed,'guest weight operates the host plate');assert(w.circuitOpen('new-circuit'));assert(v.circuitOpen('new-circuit'),'host circuit reaches guest');
 v.__BF.G.p.x=320;tick(30);v.pullLever(v.__BF.G.obstacles.find(o=>o.type==='lever'));exchange();assert(w.__BF.G.levers['new-circuit'].timer>0,'guest lever pull changes host world');tick(5);assert(v.circuitOpen('new-circuit'));
 w.__BF.G.p.x=420;tick(20);assert(Math.abs(v.__NET.ghost.x-w.__BF.G.p.x)<5,JSON.stringify({remote:v.__NET.ghost.x,local:w.__BF.G.p.x,mode:w.__BF.mode}));
 // Native stage-changing messages cannot replace the draft; both players finish together.
 w.BladefallWorkshopNativePlay.receive({t:'stage',i:4,fresh:1});assert.equal(w.__BF.G.stageIndex,0);
 w.nextStage();exchange();assert.equal(w.__BF.mode,'play','first finisher can help the partner');v.nextStage();exchange();assert.equal(w.__BF.mode,'pause');assert.equal(v.__BF.mode,'pause');
 w.BladefallWorkshopNativePlay.start({document:doc,role:'host',connected:false,send:()=>{}});assert.equal(w.__BF.mode,'pause');assert.equal(w.__BF.G.p.x,100);v.BladefallWorkshopNativePlay.disconnected();assert.equal(v.__BF.mode,'pause');assert(!v.__NET.conn.open);
 w.BladefallWorkshopNativePlay.stop();v.BladefallWorkshopNativePlay.stop();assert(!w.__NET.conn);assert(!v.__NET.conn);assert.deepEqual(a.errors,[]);assert.deepEqual(b.errors,[]);
 console.log('PASS: two native Explore runtimes share knights, guest plate weight, lever actions and circuits; draft boundaries, joint completion, disconnected pause and cleanup.');
}finally{a.close();b.close();}
