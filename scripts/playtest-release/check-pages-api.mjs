// Actual compiled Pages Functions -> service binding -> SQLite Durable Object.
// All data is temporary and local. This never contacts or writes production.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtemp,rm,mkdir} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {Miniflare,Log,LogLevel,convertV4MiniflareOptions} from 'miniflare';
import '../../public/bladefall-playtest-worlds.js';
import '../../public/bladefall-playtest-model.js';
const M=globalThis.BladefallPlaytestModel,root=process.cwd();
await mkdir('cloudflare-dist',{recursive:true});
const temp=await mkdtemp(resolve('cloudflare-dist/pages-api-check-'));
let mf;
try{
 const wrangler=resolve('node_modules/wrangler/bin/wrangler.js'),build=(...args)=>execFileSync(process.execPath,[wrangler,...args],{cwd:root,stdio:'pipe',env:{...process.env,WRANGLER_SEND_METRICS:'false'}});
 build('deploy','--config','wrangler.api.jsonc','--dry-run','--outdir',join(temp,'api'));
 build('pages','functions','build','functions','--outdir',join(temp,'pages'),'--output-routes-path',join(temp,'routes.json'),'--compatibility-date','2026-10-09');
 const common={modules:true,compatibilityDate:'2026-10-09'},secret='local-export-test-only';
 const options=convertV4MiniflareOptions({log:new Log(LogLevel.ERROR),resourcePersistencePath:join(temp,'storage'),telemetry:{enabled:false},workers:[
  {...common,name:'pages',scriptPath:join(temp,'pages/index.js'),serviceBindings:{PLAYTEST_API:'bladefall-2d',ASSETS:'assets'}},
  {...common,name:'bladefall-2d',scriptPath:join(temp,'api/playtest-api.js'),durableObjects:{PLAYTEST:{className:'PlaytestStore',useSQLite:true}},bindings:{FEEDBACK_EXPORT_TOKEN:secret}},
  {...common,name:'preview',scriptPath:join(temp,'pages/index.js'),serviceBindings:{ASSETS:'assets'}},
  {...common,name:'assets',script:'export default {fetch(){return new Response("static asset")}}'}
 ]});
 mf=new Miniflare(options);await mf.ready;
 const site='https://bladefall2d.pages.dev',apk='https://appassets.bladefall',url=site+'/api/playtest',token='local-profile-test-'.repeat(4);
 const record=(id,over={})=>({id,player:'local-player-0001',season:M.SEASON,mode:'survival',campaign:'base',world:'1',name:'Local API check',ms:1500,deaths:2,hearts:1,eligible:true,...over});
 const post=(r,{origin=site,kind='time',profileToken=token}={})=>mf.dispatchFetch(url,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({kind,player:r.player,token:profileToken,record:r})});
 let response=await post(record('local-heart-0001'));assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');
 assert.equal((await post(record('local-heart-0001'))).status,200,'retry is idempotent');
 assert.equal((await post(record('local-time-0001',{hearts:0,ms:1000}),{origin:apk})).status,200);
 response=await mf.dispatchFetch(url,{headers:{Origin:apk}});assert.equal(response.headers.get('access-control-allow-origin'),apk);
 const board=await response.json();assert.equal(board.records.length,2,'time and heart records both retained');assert.deepEqual(board.records.map(r=>r.hearts).sort(),[0,1]);
 response=await mf.dispatchFetch(url,{method:'OPTIONS',headers:{Origin:apk,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'Content-Type'}});
 assert.equal(response.status,204);assert.equal(response.headers.get('access-control-allow-origin'),apk);assert.match(response.headers.get('access-control-allow-methods'),/POST/);
 assert.equal((await mf.dispatchFetch(url,{method:'OPTIONS',headers:{Origin:site}})).status,403,'same-origin requests need no CORS preflight; only APK and local playtest preflights are accepted');
 assert.equal((await post(record('local-cross-0001'),{origin:'https://untrusted.example'})).status,403);
 assert.equal((await post(record('local-token-0001'),{profileToken:'different-local-token-'.repeat(4)})).status,403);
 assert.equal((await post(record('local-invalid-0001',{hearts:999}))).status,400);
 assert.equal((await post(record('local-feedback-0001',{room:'local-room',fun:8,difficulty:3,comment:'private local proof'}),{kind:'feedback',origin:apk})).status,200);
 const review=record('local-review-0001',{mode:'review',campaign:'room-bank',world:'bank-fractured-cores-1',room:'bank-f96',fun:9,difficulty:5,suitability:4,revision:'test-revision',comment:'private review proof',tester:'Review fixture',bankSide:'fractured',bankBatch:25,frames:90});
 assert.equal((await post(review,{kind:'feedback',origin:'http://localhost:8371'})).status,200);
 assert.equal((await post(review,{kind:'feedback',origin:'http://localhost:8371'})).status,200);
 const core=record('local-core-feedback-0001',{mode:'review',campaign:'cores',world:'101',room:'core-outskirts',fun:9,difficulty:5,comment:'private core proof',part:5,x:1290,y:589});
 assert.equal((await post(core,{kind:'feedback',origin:site})).status,200);
 const route=record('local-route-0001',{format:'bladefall-route-v1',room:'bank-f97',name:'Private route proof',world:'102',build:'test',revision:'2',recordedAt:new Date().toISOString(),assisted:true,frames:3,tape:[[3,'r']],poses:[[3,264,565,1,'normal']],markers:[],scene:JSON.stringify({root:{$:0},nodes:[{object:{note:'private route scene'}}]}),outcome:'saved'});
 assert.equal((await post(route,{kind:'recording',origin:'http://localhost:8371'})).status,200);assert.equal((await post(route,{kind:'recording'})).status,200);assert.equal((await post({...route,frames:4},{kind:'recording'})).status,400);
 response=await mf.dispatchFetch(url,{method:'OPTIONS',headers:{Origin:'http://localhost:8371'}});assert.equal(response.status,204);assert.equal(response.headers.get('access-control-allow-origin'),'http://localhost:8371');
 response=await mf.dispatchFetch(site+'/api/feedback-export');assert.equal(response.status,403);
 response=await mf.dispatchFetch(site+'/api/feedback-export',{headers:{Authorization:'Bearer '+secret}});const feedback=await response.json();assert.equal(feedback.recordings.length,1);assert.equal(feedback.recordings[0].scene,route.scene);assert.equal(feedback.feedback.length,3);assert(feedback.feedback.some(r=>r.comment==='private local proof'));assert(feedback.feedback.some(r=>r.id===review.id&&r.suitability===4&&r.revision==='test-revision'));assert(feedback.feedback.some(r=>r.id===core.id&&r.part===5&&r.x===1290));
 const publicText=await(await mf.dispatchFetch(url)).text();assert(!publicText.includes('private local proof'));assert(!publicText.includes('token'));assert(!publicText.includes('feedback'));assert(!publicText.includes('private route scene'));
 const preview=await mf.getWorker('preview');response=await preview.fetch(url);assert.equal(response.status,503);assert.deepEqual(await response.json(),{error:'api-not-connected'});
 const api=await mf.getWorker('bladefall-2d');assert.equal((await api.fetch(site+'/index.html')).status,404,'API Worker has no duplicated asset fallback');
 assert.equal(await(await mf.dispatchFetch(site+'/')).text(),'static asset');
 await mf.dispose();mf=new Miniflare(options);await mf.ready;
 const persisted=await(await mf.dispatchFetch(url)).json();assert.equal(persisted.records.length,2,'SQLite records survive a runtime restart');
 const privateAfter=await(await mf.dispatchFetch(site+'/api/feedback-export',{headers:{Authorization:'Bearer '+secret}})).json();assert.equal(privateAfter.recordings.length,1);
 console.log('PASS: compiled Pages Functions -> private service binding -> SQLite Durable Object; same-origin and APK scores/hearts; APK CORS; token ownership; retry deduplication; private feedback export; unbound preview 503; static routing; durable restart. No production requests.');
}finally{if(mf)await mf.dispose();await rm(temp,{recursive:true,force:true});}
