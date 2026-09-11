import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const OUTPUT=resolve(ROOT,'docs/tas/tas-smoke-receipt.json');
const BASE_URL=process.env.BLADEFALL_URL||'http://127.0.0.1:8371/index.html';
const URL=`${BASE_URL}${BASE_URL.includes('?')?'&':'?'}tas=1`;
const source=await readFile(resolve(ROOT,'public/index.html'),'utf8');
const expectedVersion=source.match(/const VERSION='([^']+)'/)?.[1]||null;

/* This is intentionally a real fresh-campaign movement smoke, not a claimed
   completion. Subsequent route packs will extend this same JSON vocabulary with
   each authored puzzle, boss, and physical zone transition. */
const PLAN={id:'opening-movement-smoke',commands:[
  {ticks:80,held:['right'],label:'walk from the fresh Outskirts spawn'},
  {ticks:1,held:['right','jump'],press:['jump'],label:'jump initiation'},
  {ticks:46,held:['right','jump'],label:'hold the first leap'},
  {ticks:100,held:['right'],label:'recover and continue'},
  {ticks:1,held:['right','jump'],press:['jump'],label:'second jump initiation'},
  {ticks:52,held:['right','jump'],label:'hold the second leap'},
  {ticks:180,held:['right'],label:'continue through live opening terrain'},
]};

function projection(receipt){
  return JSON.stringify({checksum:receipt.checksum,ticks:receipt.ticks,samples:receipt.samples,nativeTrace:receipt.nativeTrace,errors:receipt.errors});
}

const browser=await puppeteer.launch({headless:true,protocolTimeout:60000,
  executablePath:process.env.PUPPETEER_EXECUTABLE_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args:['--no-sandbox','--disable-background-timer-throttling','--disable-renderer-backgrounding']});
const page=await browser.newPage();await page.setViewport({width:1280,height:720,deviceScaleFactor:1});
const pageErrors=[];page.on('pageerror',error=>pageErrors.push(error.message));
try{
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.__BF&&window.__BF.tas,{timeout:20000});
  const result=await page.evaluate(plan=>{
    const first=window.__BF.tas.run(plan,{seed:0x5A5A5A5A,snapshotEvery:30,maxTicks:1000});
    const replay=window.__BF.tas.run(plan,{seed:0x5A5A5A5A,snapshotEvery:30,maxTicks:1000});
    const maxX=Math.max(...first.samples.map(sample=>sample.player?.x||0));
    const same=JSON.stringify({checksum:first.checksum,ticks:first.ticks,samples:first.samples,nativeTrace:first.nativeTrace,errors:first.errors})===
      JSON.stringify({checksum:replay.checksum,ticks:replay.ticks,samples:replay.samples,nativeTrace:replay.nativeTrace,errors:replay.errors});
    return{first,replay:{checksum:replay.checksum,ticks:replay.ticks},same,maxX};
  },PLAN);
  const receipt={schema:'bladefall.tas-smoke',version:1,gameVersion:result.first.gameVersion,expectedVersion,url:URL,
    plan:PLAN,pass:result.first.complete&&result.first.stage===undefined&&result.same&&result.first.errors.length===0&&pageErrors.length===0&&result.maxX>120,
    replayMatch:result.same,maxX:result.maxX,pageErrors,first:result.first,replay:result.replay,
    limitations:['This verifies deterministic fresh-run input playback and replay equivalence.',
      'It is not a full campaign completion; no level, puzzle, boss, or ending is certified until a route pack reaches it through declared inputs.']};
  await mkdir(dirname(OUTPUT),{recursive:true});await writeFile(OUTPUT,`${JSON.stringify(receipt,null,2)}\n`);
  console.log(JSON.stringify(receipt,null,2));if(!receipt.pass)process.exitCode=1;
}finally{await browser.close();}
