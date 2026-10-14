import assert from 'node:assert/strict';
import {exploreRuntime} from './explore-runtime-harness.mjs';
const app=await exploreRuntime('?workshopSource=1'),w=app.w,R=w.BladefallWorkshopExploreRuntime,A=w.BladefallWorkshopExplore,M=w.BladefallWorkshopModel;
const calls=[];let depth=0;
const ctx=new Proxy({globalAlpha:1,measureText:s=>({width:String(s).length*7}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),createPattern:()=>null,save:()=>depth++,restore:()=>depth--},{get:(t,k)=>k in t?t[k]:(...args)=>calls.push([k,...args]),set:(t,k,v)=>(t[k]=v,true)});
const area={pan:{x:-1000,y:-10000},width:100000,height:20000,zoom:1};
try{
 for(let i=0;i<R.stages().length;i++){
  const definition=R.captureSource(i);R.start(definition);R.pause();calls.length=0;
  try{R.drawWorkshop(ctx,area);}catch(e){throw Error('Stage '+i+' '+R.stages()[i].name+': '+e.stack);}
  assert.equal(depth,0,'balanced canvas for stage '+i);assert(calls.some(c=>c[0]==='fillRect'),'native art for stage '+i);
  const platform=A.objects(definition).find(o=>o.collection==='obstacles'&&o.label==='plat');
  if(platform){
   const session=M.session(M.create({id:'art-'+i,mode:'explore',name:'Art',definition}),{validateDefinition:d=>A.compile(d.definition)});
   assert(session.submit('artist',[A.move(definition,platform.id,{x:platform.x+37,y:platform.y-19})]).ok);
   R.start(session.snapshot().definition);R.pause();calls.length=0;R.drawWorkshop(ctx,area);
   assert(calls.some(c=>c[0]==='translate'&&c[1]===platform.data.x+37),'edited platform uses its native new position');assert.equal(depth,0);
  }
 }
 const parent=await exploreRuntime();
 try{
  const pw=parent.w;pw.beginRun(0,null,{hp:1,dmg:1},{startStage:0,levelSelect:true,testRun:true});
  const original=pw.BladefallWorkshopExploreRuntime.capture(),state=pw.__BF.G,player=state.p;
  const definition=R.captureSource(1),doc=M.create({id:'frame-art',mode:'explore',name:'Frame art',definition});let ready=0;
  const scene=pw.BladefallWorkshopRender.create(()=>ready++);
  assert.equal(scene.native(ctx,doc,area),false,'loading uses the schematic fallback');
  const frame=pw.document.querySelector('iframe[title="explore editor artwork"]');assert(frame);assert(frame.hidden);assert(frame.src.endsWith('index.html?workshopSource=1'));
  Object.defineProperty(frame,'contentWindow',{value:w});frame.onload();assert.equal(ready,1);
  assert(scene.native(ctx,doc,area));assert.equal(scene.error(),null);
  const preview=R.state().p;assert(scene.native(ctx,doc,area));assert.equal(R.state().p,preview,'unchanged draft reuses the scene');
  assert(scene.native(ctx,{...doc,revision:doc.revision+1},area));assert.notEqual(R.state().p,preview,'revision rebuilds the preview');
  assert.equal(pw.__BF.G,state);assert.equal(state.p,player);assert.deepEqual(pw.BladefallWorkshopExploreRuntime.capture(),original,'preview leaves campaign state untouched');
  assert.throws(()=>pw.BladefallWorkshopExploreRuntime.drawWorkshop(ctx,area),/isolated source/);
  scene.close();assert.equal(frame.isConnected,false);frame.onload();assert.equal(ready,1,'closed scene ignores late loads');
  assert.deepEqual(parent.errors,[]);
 }finally{parent.close();}
 assert.deepEqual(app.errors,[]);
 console.log('PASS: all 46 Explore stages draw native editor artwork with balanced canvas and moved platform geometry.');
}finally{app.close();}
