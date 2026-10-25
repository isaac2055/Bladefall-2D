// Fresh browser evidence for the shared opening movement, not a hand-authored oracle.
import {open} from '../../../scripts/quests/harness.mjs';
import {writeFile,mkdir} from 'node:fs/promises';
await mkdir(new URL('../../../.cache/godot/explore/',import.meta.url),{recursive:true});
const run=await open();
try{
 const traces=await run.page.evaluate(()=>{
  const cases=[
   {name:'run brake and reverse',tape:[[120,{right:true}],[30,{}],[80,{left:true}],[60,{}]]},
   {name:'held jump arc',tape:[[20,{}],[40,{jump:true}],[60,{}]]},
   {name:'tapped jump arc',tape:[[20,{}],[1,{jump:true}],[90,{}]]},
   {name:'running jump and landing',tape:[[30,{right:true}],[35,{right:true,jump:true}],[60,{right:true}],[25,{}],[70,{left:true}]]}
  ];
  const out=[];
  for(const test of cases){
   beginRun(0,null,{hp:1,dmg:1},{startStage:0,levelSelect:true,runSeed:'native-explore-oracle'});
   G.workshopBlank=true;G.enemies=[];G.npcs=[];G.pickups=[];G.projectiles=[];G.blight=[];G.sideStoryScene=null;
   G.obstacles=[{type:'plat',x:500,w:10000,y:0,h:20,deep:1}];
   Object.assign(G.p,freshPlayer(),{x:500,y:0,onGround:true,weapon:null});
   meta.exploreJumpHeight=.9;
   const keys=__BF.input.keys,pr=__BF.input.pressed;
   let old={};const frames=[];
   for(const [count,input] of test.tape)for(let i=0;i<count;i++){
    mode='play';
    for(const [key,code] of [['left','ArrowLeft'],['right','ArrowRight'],['jump','Space']]){
     keys[code]=!!input[key];if(input[key]&&!old[key])pr[code]=true;
    }
    update(1/60);BFKeyboard.clearPressed();old=input;
    frames.push({input,state:Object.fromEntries(['x','y','vx','vy','onGround','jumps'].map(k=>[k,G.p[k]]))});
   }
   out.push({name:test.name,frames});
  }
  mode='pause';return out;
 });
 await writeFile(new URL('../../../.cache/godot/explore/reference.json',import.meta.url),JSON.stringify(traces));
 console.log(traces.map(t=>`${t.name}: ${t.frames.length} frames`).join('\n'));
}finally{await run.close();}
