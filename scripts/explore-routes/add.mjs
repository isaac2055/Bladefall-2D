// Adds your Explore recordings to the game (7.341). In the level select, ● Record a level (or a boss fight from where
// its route stops), then ⬇ Export recorded routes. Then, from the repository folder:
//   npm run explore-routes -- ~/Downloads/bladefall-explore-routes-2026-10-16.json
// Each recording is played through the real Watch in a headless game page; one that ends where you ended is merged
// into public/bladefall-explore-routes.js (replacing that level's route). --no-check merges without watching.
import {readFile} from 'node:fs/promises';
import {launchChrome} from '../../tests/launch-chrome.mjs';
import {serve,readRoutes,writeRoutes,watchRoute} from './lib.mjs';

const args=process.argv.slice(2),skip=args.includes('--no-check'),files=args.filter(a=>!a.startsWith('--'));
if(!files.length){console.log('Usage: npm run explore-routes -- <exported recordings .json> [--no-check]');process.exit(2);}
const routes=await readRoutes();
if(!routes.meta){console.log('public/bladefall-explore-routes.js has no start data yet; run scripts/explore-routes/build.mjs once first.');process.exit(1);}
const {server,url}=await serve(),browser=skip?null:await launchChrome({headless:true,protocolTimeout:3_600_000,args:['--no-sandbox']});
let added=0,failed=0;
for(const file of files){
 const pack=JSON.parse(await readFile(file,'utf8'));
 if(pack.schema!=='bladefall.explore-routes'){console.log(`${file}: not an exported recordings file`);failed++;continue;}
 if(pack.seed!==routes.seed||pack.view?.w!==routes.view.w||pack.view?.h!==routes.view.h){console.log(`${file}: recorded with different watch settings (seed/view); record again on the current build`);failed++;continue;}
 for(const [stage,route] of Object.entries(pack.stages||{})){
  if(!Array.isArray(route.tape)||!route.tape.every(s=>Array.isArray(s)&&Number.isInteger(s[0])&&s[0]>0&&typeof s[1]==='string'&&/^[a-z]*$/.test(s[1]))){console.log(`stage ${stage}: malformed recording, skipped`);failed++;continue;}
  if(!skip){
   const v=await watchRoute(browser,url,routes,stage,route);
   if(!v.ok||(route.reachedX!=null&&Math.abs((v.x??-1e9)-route.reachedX)>2)){console.log(`stage ${stage}: ✗ the watch ended at x=${v.x} (${v.reason||'you ended at x='+route.reachedX}); not added. Record it again on this build.`);failed++;continue;}
   console.log(`stage ${stage}: ✓ watched to x=${v.x}${route.end==='partial'?' (partial: it ends there)':''}`);
  }
  routes.stages[stage]={...route,source:'recorded'};added++;
 }
}
if(added)await writeRoutes(routes);
await browser?.close();server.close();
console.log(`${added} route${added===1?'':'s'} added to public/bladefall-explore-routes.js${failed?`, ${failed} not added`:''}.`+(added?' Ship a build to put them in the game.':''));
process.exit(failed?1:0);
