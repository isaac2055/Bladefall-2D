import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {launchChrome} from '../tests/launch-chrome.mjs';
import {bootstrapStage} from './bladefall-bot.mjs';
import {runCourseRoom} from './celeste-route-policy.mjs';
const onlyFoundry=process.argv.includes('--foundry-only');
const root=resolve('public'),server=createServer(async(req,res)=>{try{const p=resolve(root,'.'+new URL(req.url,'http://x').pathname);if(!p.startsWith(root+'/'))throw Error();res.setHeader('Content-Type',extname(p)==='.js'?'text/javascript':'text/html');res.end(await readFile(p));}catch{res.statusCode=404;res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await launchChrome({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-sandbox']});
const pages=await Promise.all([0,1,2].map(()=>browser.newPage())),[host,guest,solo]=pages,errors=[],receipt={courses:[],scope:'Two browsers, production network encoding and handlers over queued in-memory transport. Legal movement inputs; fixture-only retry/reconnect checks. No external signaling service.'};
const pump=async()=>{for(let n=0;n<20;n++){let count=0;for(const [from,to]of [[host,guest],[guest,host]]){const messages=await from.evaluate(()=>window.__out.splice(0));count+=messages.length;if(messages.length)await to.evaluate(ms=>ms.forEach(netOnMessage),messages);}if(!count)return;}throw Error('transport did not settle');};
try{
 for(const p of pages){p.on('pageerror',e=>errors.push(e.message));await p.goto(`http://127.0.0.1:${server.address().port}/index.html?tas=1`,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__BF?.tas);}
 for(const [p,role]of [[host,'host'],[guest,'guest']])await p.evaluate(role=>{window.__out=[];NET.role=role;netInitProtocol(role);NET.conn={open:true,send:m=>__out.push(m)};},role);
 for(const together of [false,true])for(const stage of (onlyFoundry?[41]:[41,42])){
  await host.evaluate(stage=>{BladefallCeleste.menu();document.getElementById(stage===41?'ceStandard':'ceFractured').click();},stage);await pump();
  for(const p of [host,guest])assert.equal(await p.evaluate(()=>G.coopSession&&G.stageIndex),stage);
  const n=onlyFoundry?1:await host.evaluate(()=>G.celeste.rooms.length),runs=[];
  for(let room=0;room<n;room++){
   // Generate a legal route from the checkpoint in an isolated solo fixture.
   await solo.evaluate(bootstrapStage,stage);
   await solo.evaluate(room=>{const a=G.celeste;a.room=room;a.checkpoint=a.rooms[room].x+120;BladefallCeleste.retry();a.deaths=0;},room);
   const route=await solo.evaluate(runCourseRoom);assert.ok(route.pass,JSON.stringify({...route,tape:undefined}));
   const frames=route.tape;
   for(const [lead,follow]of (together?[[host,guest]]:[[host,guest],[guest,host]])){
    
    for(let i=0;i<frames.length;i+=3){
     if(await lead.evaluate(({room,together})=>G.celeste.room!==room||(!together&&G.celeste.ready)||G.celeste.complete,{room,together}))break;
     await lead.evaluate(tape=>tape.forEach(k=>__BF.tas.stepFrames(1,k)),frames.slice(i,i+3));
     if(together)await follow.evaluate(tape=>tape.forEach(k=>__BF.tas.stepFrames(1,k)),frames.slice(i,i+3));else await follow.evaluate(()=>__BF.tas.stepFrames(3,{}));await pump();
     const failed=await lead.evaluate(()=>G.celeste.deaths);if(failed)throw Error('failed '+JSON.stringify({stage,room,i,side:lead===host?'host':'guest',state:await lead.evaluate(()=>({x:G.p.x,y:G.p.y,lift:G.obstacles.find(o=>o.ceRoom===G.celeste.room&&o.ceWeight),used:G.celeste.used}))}));
    }
    const states=await Promise.all([host,guest].map(p=>p.evaluate(()=>({room:G.celeste.room,ready:!!G.celeste.ready,complete:G.celeste.complete,deaths:G.celeste.deaths,mode,x:G.p.x,used:G.celeste.used}))));
    assert.equal(states[0].deaths,0,JSON.stringify({stage,room,states}));assert.equal(states[1].deaths,0,JSON.stringify({stage,room,states}));
    if(lead===host&&!together){assert.equal(states[0].room,room);assert.equal(states[1].room,room);assert.equal(states[0].ready,true);assert.equal(states[1].ready,false);assert.deepEqual(states[1].used,[],'Watching does not complete the partner’s devices');}
    else {assert.equal(states[0].room,states[1].room);assert.ok(states[0].room===room+1||states[0].complete,JSON.stringify({stage,room,states}));}
   }
   runs.push({room,kind:route.kind,bothCompleted:true,framesPerPlayer:frames.length});console.log('PASS BOTH',stage,room,route.kind);
  }
  receipt.courses.push({stage,together,runs});
 }
 // A fresh guest restarts the current room without inheriting the host's completed devices.
 await host.evaluate(()=>{coopStartRun('select',41);});await pump();
 const resume=await host.evaluate(()=>{const a=G.celeste;a.used=a.rooms[0].required.slice();a.ready=true;a.peerProgress={attempt:9,used:[],ready:false};return {t:'coopStage',reason:'resume',i:41,seed:NET.stageSeed,x:a.rooms[0].end,y:0,session:coopSessionPacket()};});
 await guest.evaluate(m=>{G=null;coopEnterStage(m);},resume);await pump();
 assert.equal(await guest.evaluate(()=>G.p.x),120);assert.deepEqual(await guest.evaluate(()=>G.celeste.used),[]);
 assert.ok(await host.evaluate(()=>G.celeste.peerProgress.attempt>9));assert.equal(await host.evaluate(()=>G.celeste.room),0);
 // Personal retries neither reset nor move the partner, and portal data never overwrites their pair.
 await host.evaluate(()=>coopStartRun('select',41));await pump();
 const before=await host.evaluate(()=>({x:G.p.x,deaths:G.celeste.deaths}));
 await guest.evaluate(()=>BladefallCeleste.retry());await pump();
 assert.deepEqual(await host.evaluate(()=>({x:G.p.x,deaths:G.celeste.deaths})),before);
 assert.equal(await guest.evaluate(()=>G.celeste.deaths),1);
 await host.evaluate(()=>{G.cratePortals=[{x:220,y:40,nx:1,ny:0}];});
 await guest.evaluate(()=>{G.cratePortals=[{x:720,y:40,nx:-1,ny:0}];});
 await host.evaluate(()=>netSend({t:'snapshot',...netPackWorldSnapshot()}));await pump();
 assert.equal(await guest.evaluate(()=>G.cratePortals[0].x),720);
 await guest.evaluate(()=>netSend({t:'portalIntent',p:G.cratePortals}));await pump();
 assert.equal(await host.evaluate(()=>G.cratePortals[0].x),220);
 await host.evaluate(()=>{openCoopRegionPicker();});
 for(const stage of [41,42])assert.equal(await host.evaluate(stage=>document.querySelector('[data-stage="'+stage+'"]').disabled,stage),false);
 await host.evaluate(()=>{titleScreen();meta.devUnlocked=true;meta.bossKills=10;meta.bestStage=40;meta.outskirtsFieldChart=true;titleScreen();});
 const menu=await host.evaluate(()=>({removed:['ng1Btn','ng2Btn','skinsBtn','rushBtn','worldBtn','abilitiesBtn','riftBtn'].filter(id=>document.getElementById(id)),hint:document.querySelector('#overlay .hint')?.textContent,version:'v'+VERSION}));assert.deepEqual(menu.removed,[]);assert.equal(menu.hint,menu.version);
 assert.deepEqual(errors,[]);receipt.errors=errors;receipt.menu=menu;receipt.personalRetry=true;receipt.reconnectCannotSkip=true;receipt.personalPortals=true;
 await writeFile(onlyFoundry?'docs/charters/celeste/evidence/foundry/coop-verification.json':'docs/charters/celeste/evidence/coop-verification.json',JSON.stringify(receipt,null,2)+'\n');
 console.log(onlyFoundry?'PASS: foundry with simultaneous and staggered players, personal retries and reconnect.':'PASS: both co-op courses, both players complete every room, personal retries/portals and menu.');
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
