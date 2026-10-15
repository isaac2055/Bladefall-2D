// Checks and repairs the intended routes of exported Ascend drafts (7.340), offline, with no LLM needed.
// Export a level from the level builder (Export → name.bladefall.json), then:
//   npm run routes -- my-level.bladefall.json            check; repair any broken route and save it into the file
//   npm run routes -- --check drafts/                     check every *.bladefall.json in a folder; exit 1 if one is broken
//   npm run routes -- --budget 3000000 hard.bladefall.json  search longer (default 600000 tries, about a minute)
// A repaired file is re-imported with New / Open → Import a level; its route then plays from Test play → Watch route.
// The search follows the old route (or the run you recorded) waypoint by waypoint. If it cannot, clear the level
// yourself without dying in Test play: that clear is saved as the route.
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,statSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import '../pcore-tape.mjs';   // the game engine and every device, as the game loads them
const require=createRequire(import.meta.url);
for(const f of ['bladefall-workshop-model','bladefall-workshop-ascend','bladefall-route-solver'])require('../../public/'+f+'.js');
const M=globalThis.BladefallWorkshopModel,A=globalThis.BladefallWorkshopAscend,RS=globalThis.BladefallRouteSolver;

const args=process.argv.slice(2),check=args.includes('--check'),bi=args.indexOf('--budget'),budget=bi>=0?+args[bi+1]:600000;
const paths=args.filter((a,i)=>!a.startsWith('--')&&(bi<0||i!==bi+1));
if(!paths.length){console.log('Usage: npm run routes -- [--check] [--budget N] <level.bladefall.json | folder> …');process.exit(2);}
const files=paths.flatMap(p=>statSync(p).isDirectory()?readdirSync(p).filter(f=>f.endsWith('.json')).map(f=>join(p,f)):[p]);
const secs=f=>(f/60).toFixed(1)+' s';let broken=0,repaired=0;
for(const file of files){
 let doc;try{doc=M.validate(JSON.parse(readFileSync(file,'utf8')));}catch(e){console.log(`${file}: not a level-builder file (${e.message})`);broken++;continue;}
 if(doc.mode!=='ascend'){console.log(`${file}: Explore level · routes are Ascend-only`);continue;}
 const room=A.compile(doc.definition),route=doc.definition.route,flags=route?.flags||{};
 if(route?.tape){const r=RS.play(room,route.tape,{flags});if(r.ok){console.log(`${file}: ✓ route fits (${route.source}, ${secs(r.exit+1)})`);continue;}
  console.log(`${file}: ✗ route ${r.death>=0?'dies at '+secs(r.death):'stops short of the exit'}`);}
 else console.log(`${file}: no route yet`);
 broken++;if(check)continue;
 let last=0;const t0=Date.now();
 const res=RS.solve(room,{tape:route?.tape||null,path:route?.path?.length?route.path:null,flags,budget,onProgress:p=>{if(p.text&&Date.now()-last>2000){last=Date.now();process.stdout.write(`  searching · ${p.text}\r`);}}});
 if(!res.ok){console.log(`  could not find a route: ${res.reason} (${Math.round((Date.now()-t0)/1000)} s) · try --budget ${budget*4}, or clear it yourself in Test play`);continue;}
 const next=M.validate({...doc,revision:doc.revision+1,definition:{...doc.definition,route:{...res.route,source:'solved'}}});
 writeFileSync(file,JSON.stringify(next,null,2));repaired++;broken--;
 console.log(`  repaired: new route ${secs(res.route.frames)} found in ${Math.round((Date.now()-t0)/1000)} s, saved into the file`);
}
console.log(check?`${files.length} checked, ${broken} need a route`:`${files.length} checked, ${repaired} repaired, ${broken} still need a route`);
process.exit(broken?1:0);
