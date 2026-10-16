// Builds Explore's intended routes (7.341) for Watch in the level select. For each stage it starts the level the way
// the watch starts it (TAS rules: default save data, level-select loadout, fixed seed, 1440×900 simulation view),
// lets the traversal bot (scripts/bladefall-bot.mjs) find a route to the exit — or, on a boss level, to the edge of
// the boss arena — then plays that route through the real watch in a normal game page and keeps it only if the
// watch ends exactly where the bot did. Kept routes are merged into public/bladefall-explore-routes.js.
//   node scripts/explore-routes/build.mjs 0 1 3          these stages
//   node scripts/explore-routes/build.mjs base            every base stage (0–20, no cut slot)
//   node scripts/explore-routes/build.mjs fractured       stages 21–40
//   node scripts/explore-routes/build.mjs --no-boss base  skip stages with a boss
//   --budget 60000   bot search budget (default 30000)   --jobs 4   stages solved at once
//   --blood          let the bot take damage on a hop (a second try for stalled stages)
import {createServer} from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {launchChrome} from '../../tests/launch-chrome.mjs';
import {PLANS} from './plans.mjs';

const REPO=fileURLToPath(new URL('../../',import.meta.url)),PUBLIC=resolve(REPO,'public'),OUT=resolve(PUBLIC,'bladefall-explore-routes.js');
const SEED=0xB07,VIEW={w:1440,h:900};
const KEYS={left:'l',right:'r',down:'d',jump:'j',attack:'a',dodge:'x',dash:'x',portal:'p',flip:'f',command:'c',companion:'c',pickup:'k',counter:'n',slam:'s',tool:'t',interact:'i',hook:'h',up:'u',checkpoint:'q'};
const ORDER='lrdujaxpfcknsthiq';
const argv=process.argv.slice(2),opt=(n,d)=>{const i=argv.indexOf('--'+n);return i>=0?argv[i+1]:d;};
const budget=+opt('budget',30000),jobs=+opt('jobs',4),noBoss=argv.includes('--no-boss'),bossOnly=argv.includes('--boss-only'),blood=argv.includes('--blood');
const words=argv.filter((a,i)=>!a.startsWith('--')&&!['--budget','--jobs'].includes(argv[i-1]));
const BASE=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,15,16,17,18,19,20],FRACTURED=Array.from({length:20},(_,i)=>21+i);
const stages=words.flatMap(w=>w==='base'?BASE:w==='fractured'?FRACTURED:w==='all'?[...BASE,...FRACTURED]:[+w]).filter(Number.isInteger);
if(!stages.length){console.log('Usage: node scripts/explore-routes/build.mjs [base|fractured|all|<stage>…] [--no-boss|--boss-only] [--budget N] [--jobs N]');process.exit(2);}

const TYPES={'.html':'text/html','.js':'application/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.mp3':'audio/mpeg','.ogg':'audio/ogg','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
const server=createServer(async(req,res)=>{let body;try{const p=resolve(PUBLIC,'.'+decodeURIComponent(new URL(req.url,'http://x').pathname));if(!p.startsWith(PUBLIC))throw 0;body=await readFile(p);}catch{res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':TYPES[extname(req.url.split('?')[0])]||'application/octet-stream'});res.end(body);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const URL0=`http://127.0.0.1:${server.address().port}`;
const browser=await launchChrome({headless:true,protocolTimeout:10_800_000,args:['--no-sandbox']});
const bot=await import('../bladefall-bot.mjs');

async function existing(){
 if(!existsSync(OUT))return {version:1,view:VIEW,seed:SEED,meta:null,stages:{}};
 const text=await readFile(OUT,'utf8'),g={};new Function('globalThis',text)(g);return g.BladefallExploreRoutes;
}
const encode=inputs=>{const tape=[];for(const inp of inputs){const k=[...new Set(Object.entries(inp||{}).filter(([,v])=>v).map(([a])=>KEYS[a]).filter(Boolean))].sort((a,b)=>ORDER.indexOf(a)-ORDER.indexOf(b)).join('');const last=tape.at(-1);if(last&&last[1]===k)last[0]++;else tape.push([1,k]);}return tape;};

// In the TAS page: the watch's start, idle until the knight lands, and where a boss arena begins.
function boot({stage,seed}){
 window.__tasAutoDialogue=true;   // walk through conversations, loot swaps and shops exactly as the watch does
 tasPrepareRun();
 tasDeterministicCall(()=>beginRun(0,null,{hp:1,dmg:1},{startStage:stage,levelSelect:true,testRun:true,runSeed:seed}));
 const tas=window.__BF.tas;let settle=0;
 for(let i=0;i<90&&!G.p.onGround;i++){tas.stepFrames(1,{});settle++;}
 tas.stepFrames(2,{});settle+=2;
 // The first boss the knight meets, and the edge of its arena on the knight's side (levels run either way).
 const b=(G.enemies||[]).filter(e=>e.boss&&!e.dead).sort((a,c)=>Math.abs(a.x-G.p.x)-Math.abs(c.x-G.p.x))[0]||null;
 let arena=null,goal=null;
 if(b){const edge=re=>Object.keys(b).filter(k=>re.test(k)&&Number.isFinite(b[k])).map(k=>b[k]),west=b.x<G.p.x;
  arena=west?Math.max(...edge(/ArenaR$/),-Infinity):Math.min(...edge(/ArenaL$/),Infinity);
  if(!Number.isFinite(arena))arena=west?b.x+700:b.x-700;goal=west?arena+40:arena-40;}
 return {settle,meta:TAS_INITIAL_META,stage:G.stageIndex,levelLength:G.levelLength,x:G.p.x,boss:b?{type:b.type,x:Math.round(b.x),arena:Math.round(arena),goal:Math.round(goal)}:null};
}

async function solve(stage){
 const page=await browser.newPage();await page.setViewport({width:VIEW.w,height:VIEW.h,deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(URL0+'/index.html?tas=1',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__BF?.tas,{timeout:60000});
  const b=await page.evaluate(boot,{stage,seed:SEED});
  if(b.boss&&noBoss)return {stage,skip:'boss level'};if(!b.boss&&bossOnly)return {stage,skip:'no boss'};
  const goalX=b.boss?b.boss.goal:null,t0=Date.now();
  const plan=PLANS[stage]||null,finishX=b.boss?goalX:plan?.finish??null;
  const r=await page.evaluate(bot.solveLevel,{goalX:finishX,totalExpansions:budget,allowBloodLoss:blood,plan:plan?.steps||null});
  const inputs=[...Array(b.settle).fill({}),...(r.winningInputs||[])];
  return {stage,b,r,inputs,tape:encode(inputs),seconds:Math.round((Date.now()-t0)/1000),errors};
 }catch(e){return {stage,error:e.message};}
 finally{await page.close();}
}

// In a normal game page (not ?tas): play the route through the actual watch and report where it ended.
async function verify(routes,stage,route){
 const page=await browser.newPage();await page.setViewport({width:1280,height:720,deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.evaluateOnNewDocument(()=>{try{localStorage.setItem('bladefall.explore.watchSpeed','8');}catch(e){}});
  await page.goto(URL0+'/index.html',{waitUntil:'load'});await page.waitForFunction(()=>typeof exploreWatchStart==='function'&&window.__BF,{timeout:60000});
  await new Promise(r=>setTimeout(r,1000));
  const started=await page.evaluate((routes,stage,route)=>{window.BladefallExploreRoutes={...routes,stages:{[stage]:route}};return exploreWatchStart([stage]);},routes,stage,route);
  if(!started)return {ok:false,reason:'watch did not start'};
  const t0=Date.now();
  while(await page.evaluate(()=>!!exploreWatch)){if(Date.now()-t0>20*60*1000)return {ok:false,reason:'watch timed out'};await new Promise(r=>setTimeout(r,500));}
  const log=await page.evaluate(()=>window.__exploreWatchLog||[]);
  return {...(log[0]||{ok:false,reason:'no watch result'}),errors};
 }finally{await page.close();}
}

const routes=await existing(),results=[];let queue=[...stages];
async function worker(){
 while(queue.length){const stage=queue.shift(),s=await solve(stage);
  if(s.skip){console.log(`stage ${stage}: skipped (${s.skip})`);continue;}
  if(s.error){console.log(`stage ${stage}: ERROR ${s.error}`);results.push({stage,ok:false,why:s.error});continue;}
  if(!routes.meta)routes.meta=s.b.meta;
  const name=`${stage} ${s.b.boss?'(boss: '+s.b.boss.type+')':''}`;
  const goal=Number.isFinite(s.r.goalX)?Math.round(s.r.goalX):s.b.boss?s.b.boss.arena:s.b.levelLength,progress=Math.abs(s.r.reachedX-s.b.x)/Math.max(1,Math.abs(goal-s.b.x));
  // A route that stalls partway is still worth watching once it covers a fifth of the way; ● Record finishes it.
  if(!s.r.pass&&(progress<0.2||!(s.r.winningInputs||[]).length)){console.log(`stage ${name}: bot stopped at x=${s.r.reachedX}/${goal} (${s.r.reason||s.r.failure||'no route'}) in ${s.seconds} s`);results.push({stage,ok:false,why:'bot stopped at x='+s.r.reachedX,reached:s.r.reachedX,goal});continue;}
  const prior=routes.stages[stage];
  if(!s.r.pass&&prior&&(prior.end!=='partial'||(prior.reachedX||0)>=s.r.reachedX)){console.log(`stage ${name}: bot stopped at x=${s.r.reachedX}/${goal}; keeping the existing route`);results.push({stage,ok:!!prior,why:'kept existing'});continue;}
  const route={tape:s.tape,frames:s.inputs.length,end:s.r.pass?(s.b.boss?'boss':'level-end'):'partial',boss:s.b.boss?.type||null,reachedX:s.r.reachedX,goalX:goal,source:'bot',at:new Date().toISOString()};
  const v=await verify(routes,stage,route);
  if(!v.ok||Math.abs((v.x??-1e9)-s.r.reachedX)>2){console.log(`stage ${name}: route found (${s.inputs.length} frames) but the watch ended at x=${v.x} (${v.reason||'position differs'}, bot x=${s.r.reachedX})${v.errors?.length?' errors: '+v.errors.join(' | '):''}`);results.push({stage,ok:false,why:'watch replay differs: '+(v.reason||('x '+v.x+' vs '+s.r.reachedX))});continue;}
  routes.stages[stage]=route;results.push({stage,ok:route.end!=='partial',partial:route.end==='partial'});
  console.log(`stage ${name}: ${route.end==='partial'?'◐ partial':'✓'} ${Math.round(s.inputs.length/60)} s route, watched to x=${v.x}${route.end==='partial'?' of '+goal:''} (solved in ${s.seconds} s)`);
  await save();
 }
}
async function save(){
 const sorted=Object.fromEntries(Object.entries(routes.stages).sort((a,b)=>+a[0]-+b[0]));
 const text='/* Generated by scripts/explore-routes/build.mjs (and npm run explore-routes for recordings). Explore\'s intended routes:\n   each stage\'s button states from the level-select start, replayed by Watch in the level select. Do not hand-edit tapes. */\n'+
  'globalThis.BladefallExploreRoutes='+JSON.stringify({version:1,view:VIEW,seed:SEED,meta:routes.meta,stages:sorted})+';\n';
 await writeFile(OUT,text);
}
await Promise.all(Array.from({length:Math.min(jobs,stages.length)},worker));
await browser.close();server.close();
const ok=results.filter(r=>r.ok).length;
console.log(`\n${ok} of ${results.length} stages have a watched route.`+(results.some(r=>!r.ok)?'\nStill without a route: '+results.filter(r=>!r.ok).map(r=>r.stage).join(', '):''));
