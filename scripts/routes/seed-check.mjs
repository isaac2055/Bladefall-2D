// Copies every original Ascend level into a draft the way the level builder's library does (7.340) and checks that
// its route came along and replays in Test play's rules. A route that does not fit is listed: the builder will ask
// for a recorded clear or Find a route there. Serves public/ itself; nothing else needs to be running.
//   node scripts/routes/seed-check.mjs            every original level
//   node scripts/routes/seed-check.mjs world-3    only catalogue ids containing "world-3"
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {extname,join,normalize} from 'node:path';
import {fileURLToPath} from 'node:url';
import {launchChrome} from '../../tests/launch-chrome.mjs';
const ROOT=fileURLToPath(new URL('../../public/',import.meta.url));
const TYPES={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.mp3':'audio/mpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{try{const path=normalize(decodeURIComponent(new URL(req.url,'http://x').pathname)).replace(/^\/+/,'')||'index.html';const body=await readFile(join(ROOT,path));res.writeHead(200,{'content-type':TYPES[extname(path)]||'application/octet-stream'});res.end(body);}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await launchChrome({headless:true,args:['--no-sandbox']}),page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/precision.html?pitch=climb&workshopSource=1&nosw=1`,{waitUntil:'load'});
await page.waitForFunction(()=>!!window.BladefallWorkshopSources&&!!window.BladefallClimb?.worlds?.length&&!!window.BladefallWorkshopRoutes,{timeout:60000});
const filter=process.argv[2]||'';
const rows=await page.evaluate(async filter=>{const S=window.BladefallWorkshopSources,out=[];
 for(const row of S.entries('ascend').filter(r=>r.id.includes(filter))){let r;try{const s=S.source('ascend',row.id);r={id:row.id,group:row.group,tape:!!s.definition.route?.tape,ok:!!s.definition.route?.ok,frames:s.definition.route?.frames};}catch(e){r={id:row.id,group:row.group,error:e.message};}out.push(r);if(out.length%50===0)await new Promise(r=>setTimeout(r,0));}
 return out;},filter);
await browser.close();server.close();
const withTape=rows.filter(r=>r.tape),fit=withTape.filter(r=>r.ok),bad=withTape.filter(r=>!r.ok),err=rows.filter(r=>r.error);
const byGroup={};for(const r of bad)(byGroup[r.group]??=[]).push(r.id.replace(/^[^:]+:/,''));
console.log(`${rows.length} original levels · ${withTape.length} have a route · ${fit.length} fit Test play · ${bad.length} do not`);
for(const [g,ids]of Object.entries(byGroup))console.log(`  ${g}: ${ids.join(', ')}`);
if(err.length)console.log('ERRORS:\n  '+err.map(r=>r.id+': '+r.error).join('\n  '));if(errors.length)console.log('PAGE ERRORS:\n  '+errors.join('\n  '));
process.exit(err.length||errors.length?1:0);
