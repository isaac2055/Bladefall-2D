import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';

const url=process.env.BLADEFALL_URL||'http://127.0.0.1:8877/index.html';
const origin=new URL(url).origin;
const browser=await puppeteer.launch({headless:true,protocolTimeout:60000,args:[
  '--no-sandbox','--disable-background-timer-throttling','--disable-renderer-backgrounding',
]});
const page=await browser.newPage(),errors=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('response',response=>{if(response.status()>=400&&!response.url().endsWith('/favicon.ico'))errors.push(`http ${response.status()}: ${response.url()}`);});
page.on('console',message=>{if(message.type()==='error'&&!message.text().startsWith('Failed to load resource:'))errors.push(`console: ${message.text()}`);});

try{
  await page.setBypassServiceWorker(true);
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:20000});
  await page.evaluate(()=>localStorage.clear());
  const setArchive=async(keyFound,found)=>page.evaluate(({keyFound,found})=>{
    localStorage.setItem('bladefall_v2',JSON.stringify({recollections:{schema:'bladefall.sealed-recollections',version:1,keyFound,found,revision:1}}));
  },{keyFound,found});

  await setArchive(false,['outskirts']);
  await page.goto(`${origin}/recollection-player.html?stage=0`,{waitUntil:'domcontentloaded',timeout:20000});
  await page.waitForFunction(()=>document.querySelector('#veilTitle')?.textContent==='The glass stays dark',{timeout:5000});
  const locked=await page.evaluate(()=>({title:document.querySelector('#veilTitle').textContent,frameReady:document.querySelector('#archiveFrame').classList.contains('ready')}));
  assert.equal(locked.frameReady,false);

  await page.goto(url,{waitUntil:'domcontentloaded',timeout:20000});
  await setArchive(true,['outskirts']);
  const savedBefore=await page.evaluate(()=>localStorage.getItem('bladefall_v2'));
  await page.goto(`${origin}/recollection-player.html?stage=0`,{waitUntil:'domcontentloaded',timeout:20000});
  await page.waitForFunction(()=>document.querySelector('#archiveFrame')?.classList.contains('ready'),{timeout:20000});
  const frame=page.frames().find(candidate=>candidate!==page.mainFrame());
  assert.ok(frame,'archive iframe must exist');
  await frame.waitForFunction(()=>window.__BF?.G?.recollectionMode===true,{timeout:10000});
  const runtime=await frame.evaluate(()=>({version:window.__BF.VERSION,stage:window.__BF.G.stageIndex,
    stageName:window.__BF.STAGES[window.__BF.G.stageIndex].name,hpScale:window.__BF.G.ngHp,
    damageScale:window.__BF.G.ngDmg,eligible:window.__BF.G.leaderboardEligible,
    isolated:window.__BLADEFALL_RECOLLECTION__===true}));
  assert.deepEqual(runtime,{version:'6.5.0',stage:0,stageName:'The Outskirts',hpScale:1.35,damageScale:1.2,eligible:false,isolated:true});
  const savedAfter=await page.evaluate(()=>localStorage.getItem('bladefall_v2'));
  assert.equal(savedAfter,savedBefore);

  await page.goto(url,{waitUntil:'domcontentloaded',timeout:20000});
  await page.waitForFunction(()=>window.__BF?.VERSION,{timeout:10000});
  await page.evaluate(()=>{openRecollectionArchive(()=>{});});
  const archiveUi=await page.evaluate(()=>({open:[...document.querySelectorAll('[data-recollection]')].map(node=>Number(node.dataset.recollection)),
    text:document.querySelector('#overlay').innerText}));
  assert.deepEqual(archiveUi.open,[0]);
  assert.match(archiveUi.text,/1\/16 recovered/);
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({ok:true,locked,runtime,campaignSaveUnchanged:savedAfter===savedBefore,archiveUi},null,2));
}finally{await browser.close();}
