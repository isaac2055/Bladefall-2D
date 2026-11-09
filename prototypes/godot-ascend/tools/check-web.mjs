// Exercise the actual WASM game, browser file pickers, persistence and native saves.
import puppeteer from 'puppeteer';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base=process.argv[2] || 'http://localhost:8765';
const out=path.resolve(process.argv[3] || '.cache/web/check');
await fs.mkdir(out,{recursive:true});
const downloads=path.join(out,'downloads');await fs.rm(downloads,{recursive:true,force:true});await fs.mkdir(downloads);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const browser=await puppeteer.launch({headless:true,...(process.env.CHROME?{executablePath:process.env.CHROME}:process.platform==='darwin'?{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{}),args:['--enable-unsafe-swiftshader']});
const errors=[];
try {
 const page=await browser.newPage();await page.setViewport({width:1280,height:930,deviceScaleFactor:1});
 page.on('console',m=>{if(m.type()==='error') errors.push(m.text());});page.on('pageerror',e=>errors.push(e.message));
 const client=await page.createCDPSession();await client.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:downloads});
 async function exportSave(){
  const file=path.join(downloads,'Bladefall-save.json');await fs.rm(file,{force:true});
  await page.mouse.click(400,264);
  for(let n=0;n<100;n++){try{const text=await fs.readFile(file,'utf8');const bundle=JSON.parse(text);assert.equal(bundle.format,'bladefall-save');return {file,bundle};}catch{}await sleep(100);}
  throw Error('Export Save did not produce a valid download');
 }
 async function load(){await page.click('#start');await page.waitForFunction(()=>window.bladefallReady || document.querySelector('#error').textContent,{timeout:180000});assert.equal(await page.$eval('#error',x=>x.textContent),'');await sleep(16000);}
 async function checkpoint(){return page.evaluate(()=>new Promise((resolve,reject)=>{const req=indexedDB.open('/userfs');req.onerror=()=>reject(req.error);req.onsuccess=()=>{const db=req.result;const store=db.transaction('FILE_DATA').objectStore('FILE_DATA');const request=store.getAll();const keys=store.getAllKeys();request.onerror=()=>reject(request.error);keys.onsuccess=()=>{const i=keys.result.findIndex(x=>x.endsWith('/bladefall-garden.json.world-1.save'));resolve(i<0?null:Array.from(request.result[i].contents));db.close();};};}));}
 await page.goto(base,{waitUntil:'networkidle0'});
 assert.match(await page.title(),/Bladefall/);
 assert.match(await page.$eval('a.secondary',a=>a.href),/ascend-v0\.51\.0\/Bladefall-macOS.zip$/);
 await page.screenshot({path:path.join(out,'landing.png'),fullPage:true});
 await page.setViewport({width:390,height:844,deviceScaleFactor:1});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile layout overflows');
 await page.screenshot({path:path.join(out,'mobile.png'),fullPage:true});
 await page.setViewport({width:1280,height:930,deviceScaleFactor:1});
 await page.goto(new URL('/play/',base).href,{waitUntil:'networkidle0'});await load();
 await page.screenshot({path:path.join(out,'menu.png')});
 await page.keyboard.press('Enter');await sleep(2000);await page.keyboard.down('ArrowRight');await sleep(300);await page.keyboard.up('ArrowRight');
 await page.screenshot({path:path.join(out,'gameplay.png')});await page.keyboard.press('Escape');await sleep(300);
 const exported=await exportSave();assert(exported.bundle.files['bladefall-garden.json.world-1.save']);
 await sleep(1500);const stored=await checkpoint();assert(stored?.length>1000,'checkpoint not persisted to IndexedDB');
 assert.deepEqual(Buffer.from(stored),Buffer.from(exported.bundle.files['bladefall-garden.json.world-1.save'],'base64'));
 console.log('PASS browser gameplay, export download and IndexedDB checkpoint');
 const godot=process.env.GODOT;
 if(!godot)throw Error('Set GODOT to the matching Godot executable for the native save round trip.');
 const nativeFile=path.join(out,'native-save.json');
 const native=spawnSync(godot,['--headless','--path',project,'--script','tests/web_save_roundtrip.gd','--',exported.file,nativeFile],{encoding:'utf8',timeout:60000});
 assert.equal(native.status,0,native.stdout+native.stderr);assert.match(native.stdout,/PASS browser checkpoint resumes natively/);console.log(native.stdout.trim());
 const chooser=page.waitForFileChooser();await page.mouse.click(525,264);await (await chooser).accept([nativeFile]);
 await sleep(30000);await page.screenshot({path:path.join(out,'import-menu.png')});
 // Imported reduced motion skips the opening. Enter resumes the same checkpoint.
 await page.keyboard.press('Enter');await sleep(1500);await page.keyboard.press('Escape');await sleep(300);
 const returned=await exportSave();
 const settings=Buffer.from(returned.bundle.files['prototype-settings.cfg'],'base64').toString();
 assert.match(settings,/reduced_motion=true/,'native preferences were not imported');
 const checkNative=spawnSync(godot,['--headless','--path',project,'--script','tests/web_save_roundtrip.gd','--',returned.file,path.join(out,'returned-save.json')],{encoding:'utf8',timeout:60000});
 assert.equal(checkNative.status,0,checkNative.stdout+checkNative.stderr);assert.match(checkNative.stdout,/PASS browser checkpoint resumes natively/);
 console.log('PASS native-to-browser import and resumed checkpoint');
 await sleep(1500);const before=await checkpoint();
 await page.reload({waitUntil:'networkidle0'});assert.deepEqual(await checkpoint(),before,'checkpoint lost after reload');await load();
 await page.screenshot({path:path.join(out,'reload-menu.png')});
 console.log('PASS browser reload preserves checkpoint');
 assert.deepEqual(errors,[],'browser errors');
 await fs.writeFile(path.join(out,'result.json'),JSON.stringify({url:base,passed:true,errors,native:native.stdout,returned:checkNative.stdout},null,2)+'\n');
} finally {await browser.close();}
