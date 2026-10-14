import assert from 'node:assert/strict';
import {exploreRuntime} from './explore-runtime-harness.mjs';
const app=await exploreRuntime(),w=app.w,A=w.BladefallWorkshopExplore,M=w.BladefallWorkshopModel,R=w.BladefallWorkshopExploreRuntime;let count=0;
try{
 const originals=[];for(let i=0;i<w.__BF.STAGES.length;i++){w.beginRun(0,null,{hp:1,dmg:1},{startStage:i,levelSelect:true,testRun:true,runSeed:'workshop-test'});originals.push(R.capture());}
 for(let i=0;i<w.__BF.STAGES.length;i++){
  R.start(originals[i]);
  try{
   const d=originals[i],level=A.compile(d,{nativeRoot:w.__BF.G});count+=A.objects(d).length;
   assert.equal(level.obstacles.length,w.__BF.G.obstacles.length);
   assert.deepEqual(JSON.parse(JSON.stringify(A.pack(level,{nativeRoot:w.__BF.G}))),JSON.parse(JSON.stringify(d.graph)));
   const session=M.session(M.create({id:'stage-'+i,mode:'explore',name:'Stage '+i,definition:d}),{validateDefinition:doc=>A.compile(doc.definition)});
   const object=A.objects(d).find(o=>o.collection==='obstacles'&&o.label==='plat');
   if(object){assert(session.submit('player',[A.move(d,object.id,{x:object.x+24,y:object.y-12})]).ok);}
   const edited=session.snapshot().definition;R.start(edited);assert(w.__BF.G.workshop);assert.equal(w.__BF.G.leaderboardEligible,false);assert.equal(w.__BF.G.worldProgressEligible,false);
   if(object){const expected=A.compile(edited).obstacles.find(o=>o.x===object.data.x+24&&o.y===(object.data.y||0)+12);assert(expected,'edited platform survives native load');}
   for(let f=0;f<10;f++)w.gameUpdate();
   R.retry();const fresh=A.compile(edited);assert.equal(w.__BF.G.p.x,fresh.start.x);assert.equal(w.__BF.G.p.y,fresh.start.y);assert.equal(w.__BF.G.obstacles.length,fresh.obstacles.length);
  }catch(e){throw Error('Stage '+i+' '+w.__BF.STAGES[i].name+': '+e.stack);}
 }
 assert.deepEqual(app.errors,[],'no swallowed DOM errors');
 console.log('PASS: all 46 native Explore assemblies,',count,'objects, graph round trips, edited geometry, native steps, isolated eligibility, and fresh retries.');
}finally{app.close();}
