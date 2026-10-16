// Watches every Explore route in public/bladefall-explore-routes.js through the real Watch (7.341) and lists any that
// no longer end where they were recorded, e.g. after a level changed. Fix one by ● Recording it again in the level
// select and adding the export (npm run explore-routes -- file), or by re-running scripts/explore-routes/build.mjs.
//   npm run verify:explore-routes          every route
//   npm run verify:explore-routes -- 0 7   just these stages
import {launchChrome} from '../../tests/launch-chrome.mjs';
import {serve,readRoutes,watchRoute} from './lib.mjs';

const only=process.argv.slice(2).map(Number).filter(Number.isInteger);
const routes=await readRoutes(),stages=Object.keys(routes.stages).map(Number).filter(s=>!only.length||only.includes(s));
const {server,url}=await serve(),browser=await launchChrome({headless:true,protocolTimeout:3_600_000,args:['--no-sandbox']});
const bad=[],queue=[...stages];
async function worker(){while(queue.length){const s=queue.shift(),r=routes.stages[s],v=await watchRoute(browser,url,routes,s,r);
 const ok=v.ok&&(r.reachedX==null||Math.abs((v.x??-1e9)-r.reachedX)<=2);
 console.log(`stage ${s} (${r.end}, ${r.source}): ${ok?'✓':'✗'} watched to x=${v.x}${ok?'':` (${v.reason||'expected x='+r.reachedX})`}${v.errors?.length?' errors: '+v.errors.join(' | '):''}`);
 if(!ok)bad.push(s);}}
await Promise.all(Array.from({length:Math.min(4,stages.length)},worker));
await browser.close();server.close();
console.log(bad.length?`FAIL: ${bad.length} of ${stages.length} routes no longer play through: ${bad.join(', ')}`:`PASS: all ${stages.length} Explore routes play through in the real Watch.`);
process.exit(bad.length?1:0);
