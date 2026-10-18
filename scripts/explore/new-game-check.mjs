// New Game (7.349): "Begin New Dream" starts the journey over for real. In a real browser, a save with progress
// everywhere (run, world, side stories, Mara's chart, Act Two, quest mounts, hints, gold) and settings/records:
// after New Game every piece of journey is gone, the settings, records, achievements and skins remain, and the
// new run starts at the Outskirts.
//   node scripts/explore/new-game-check.mjs      (serves public/ itself)
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {extname,join,normalize} from 'node:path';
import {fileURLToPath} from 'node:url';
import {launchChrome} from '../../tests/launch-chrome.mjs';
const ROOT=fileURLToPath(new URL('../../public/',import.meta.url));
const TYPES={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
 try{const path=normalize(decodeURIComponent(new URL(req.url,'http://x').pathname)).replace(/^\/+/,'')||'index.html';
  const body=await readFile(join(ROOT,path));res.writeHead(200,{'content-type':TYPES[extname(path)]||'application/octet-stream'});res.end(body);}
 catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await launchChrome({headless:true,args:['--no-sandbox']}),errors=[],sleep=ms=>new Promise(r=>setTimeout(r,ms));
const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/index.html?nosw=1`,{waitUntil:'load'});
await page.waitForFunction(()=>typeof openExploreMenu==='function'&&window.__BF,{timeout:60000});await sleep(800);
await page.evaluate(()=>{
 Object.assign(meta,{run:{stageIndex:3},bestStage:7,actTwoReached:true,gold:420,outskirtsFieldChart:true,outskirtsMaraRelocated:true,upStrikeTaught:true,flagHintShown:true,
  sideStories:{quests:{gatekeeper:{phase:'completed',claimed:true}}},mounts:{perch:{0:'door'},reached:{1:true}},loreRead:{a:1},
  musicVolume:.13,rideGhost:true,keybinds:{jump:'KeyK'},bossRushBest:99,achievements:{first:true},skin:'ember',skinsOwned:{warden:true,ember:true}});
 meta.world=BFWorldModule.createProgress();meta.world.visited.push('black-woods');persist();
 openExploreMenu();
});
await page.click('#exploreNew');await sleep(400);
assert.ok(await page.$('#freshBtn'),'New Game asks first when there is progress');
await page.click('#freshBtn');await sleep(1500);
const after=await page.evaluate(()=>{const saved=loadSave();return {
 run:!!meta.run&&meta.run.stageIndex,stage:G?.stageIndex,bestStage:meta.bestStage,actTwo:meta.actTwoReached,gold:meta.gold,chart:meta.outskirtsFieldChart,mara:meta.outskirtsMaraRelocated,
 hints:[meta.upStrikeTaught,meta.flagHintShown],stories:JSON.stringify(meta.sideStories),mounts:meta.mounts?JSON.stringify(meta.mounts):null,lore:JSON.stringify(meta.loreRead),
 visited:BFWorldModule.createProgress(meta.world).visited,
 kept:{music:meta.musicVolume,ghost:meta.rideGhost,keys:meta.keybinds?.jump,rush:meta.bossRushBest,ach:meta.achievements?.first,skin:meta.skin,skins:Object.keys(meta.skinsOwned||{}).length},
 savedChart:saved.outskirtsFieldChart,savedMusic:saved.musicVolume};});
assert.equal(after.stage,0,'the new run starts in the Outskirts');
assert.equal(after.bestStage,0);assert.equal(after.actTwo,false);assert.equal(after.gold,0);assert.equal(after.chart,false);assert.equal(after.mara,false);
assert.deepEqual(after.hints,[false,false],'hints shown again');
assert.ok(!/gatekeeper/.test(after.stories||''),'side stories cleared: '+after.stories);
assert.ok(!after.mounts||!/door|true/.test(after.mounts),'quest mounts cleared: '+after.mounts);
assert.ok(!/"a"/.test(after.lore||''),'lore read cleared');
assert.deepEqual(after.visited,['outskirts'],'world progress cleared');
assert.deepEqual(after.kept,{music:.13,ghost:true,keys:'KeyK',rush:99,ach:true,skin:'ember',skins:2},'settings, records, achievements and skins kept');
assert.equal(after.savedChart,false,'the reset is saved');assert.equal(after.savedMusic,.13);
await browser.close();server.close();
assert.deepEqual(errors,[],'page errors');
console.log('PASS: New Game clears the whole journey (run, world, side stories, Mara\'s chart, Act Two, quest mounts, hints, gold, lore) and keeps settings, records, achievements and skins; the new run starts in the Outskirts.');
