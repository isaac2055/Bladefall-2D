// Export the live authored Explore regions through the existing browser harness.
import {open} from '../../../scripts/quests/harness.mjs';
import {writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const target=new URL('../data/world.json',import.meta.url);
if(process.argv.includes('--check')){
 const current=JSON.parse(await readFile(target,'utf8'));
 for(const row of current.provenance){
  const actual=createHash('sha256').update(await readFile(new URL('../../../'+row.path,import.meta.url))).digest('hex');
  if(actual!==row.sha256)throw Error('Authored Explore source changed: '+row.path);
 }
 console.log('Explore world export matches all browser source hashes');
 process.exit(0);
}
const run=await open();
try {
 const data=await run.page.evaluate(()=>{
  const clean=value=>JSON.parse(JSON.stringify(value,(key,v)=>key.startsWith('_')||typeof v==='function'?undefined:v));
  const stages=[];
  for(const index of [0,1]){
   beginRun(0,null,{hp:1,dmg:1},{startStage:index,levelSelect:true,runSeed:'godot-explore-reference'});
   mode='pause';
   stages.push({index,catalog:clean(STAGES[index]),authored:clean(CUSTOM_LEVELS[index]),obstacles:clean(G.obstacles),enemies:clean(G.enemies),pickups:clean(G.pickups),npcs:clean(G.npcs),player:clean(G.p),rooms:clean(index===0?OUTSKIRTS_ROOM_CUES:BLACK_WOODS_ROOM_CUES),keys:Object.keys(G)});
  }
  return {stages,movement:clean(BladefallMovementProgression.TUNING),fresh:clean(freshPlayer()),profiles:clean(BladefallPlatformer.MOTION_PROFILES)};
 });
 const sources=['public/index.html','public/bladefall-platformer.js','public/bladefall-movement-progression.js','public/bladefall-campaign.js','public/bladefall-early-platforming.js','public/bladefall-quest-errands.js','public/bladefall-opening-stories.js','public/bladefall-side-stories.js'];
 data.provenance=[];
 for(const path of sources)data.provenance.push({path,sha256:createHash('sha256').update(await readFile(path)).digest('hex')});
 await writeFile(new URL('../data/world.json',import.meta.url),JSON.stringify(data,null,2)+'\n');
 console.log(data.stages.map(s=>({name:s.catalog.name,obstacles:s.obstacles.length,enemies:s.enemies.length,pickups:s.pickups.length,npcs:s.npcs.length})));
 if(run.errors.length)console.log('Browser diagnostics',run.errors);
} finally {await run.close();}
