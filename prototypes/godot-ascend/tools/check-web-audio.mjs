// Measure real speaker-bound samples; a running AudioContext alone isn't enough.
import puppeteer from 'puppeteer';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const url=process.argv[2] || 'http://localhost:8765/play/';
const browser=await puppeteer.launch({headless:true,executablePath:process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--enable-unsafe-swiftshader','--autoplay-policy=user-gesture-required']});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
try {
 const page=await browser.newPage();await page.setViewport({width:1280,height:930});const errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.evaluateOnNewDocument(()=>{
  window.audioWitness={contexts:[],meters:[],shortStarts:0};
  const Native=window.AudioContext;
  window.AudioContext=class extends Native {constructor(...args){super(...args);audioWitness.contexts.push(this)}};
  const connect=AudioNode.prototype.connect;
  AudioNode.prototype.connect=function(target,...args){
   if(target instanceof AudioDestinationNode){const meter=this.context.createAnalyser();connect.call(this,meter);connect.call(meter,target,...args);audioWitness.meters.push(meter);return target;}
   return connect.call(this,target,...args);
  };
  const start=AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start=function(...args){if(this.buffer && this.buffer.duration<3)audioWitness.shortStarts++;return start.apply(this,args)};
 });
 await page.goto(url,{waitUntil:'networkidle0'});await page.click('#start');
 await page.waitForFunction(()=>window.bladefallReady || document.querySelector('#error').textContent,{timeout:180000});
 assert.equal(await page.$eval('#error',x=>x.textContent),'');await sleep(14000);
 async function peak(){let maximum=0;for(let i=0;i<20;i++){maximum=Math.max(maximum,await page.evaluate(()=>Math.max(0,...audioWitness.meters.map(m=>{const b=new Float32Array(m.fftSize);m.getFloatTimeDomainData(b);return Math.max(...b.map(Math.abs))}))));await sleep(50);}return maximum;}
 const titlePeak=await peak();assert(titlePeak>0.0001,`Title music is silent: ${titlePeak}`);
 await page.keyboard.press('Enter');await sleep(2000);
 const gamePeak=await peak();assert(gamePeak>0.0001,`Gameplay audio is silent: ${gamePeak}`);
 const before=await page.evaluate(()=>audioWitness.shortStarts);
 await page.keyboard.press('Space');await sleep(150);
 const effectPeak=await peak();
 assert(await page.evaluate(()=>audioWitness.shortStarts)>before,'Jump did not start a short sound effect');
 assert(effectPeak>0.0001,'No output during the sound effect');
 assert.deepEqual(errors,[]);
 const result={url,titlePeak,gamePeak,effectPeak,errors};
 if(process.env.AUDIO_RECEIPT)await fs.writeFile(process.env.AUDIO_RECEIPT,JSON.stringify(result,null,2)+'\n');
 console.log('PASS audible title music, gameplay mix and jump effect',JSON.stringify(result));
} finally {await browser.close();}
