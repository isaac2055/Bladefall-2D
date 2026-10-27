import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,copyFile,appendFile,stat,readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import puppeteer from 'puppeteer';
import {start,bridge,nativeScene} from './server.mjs';
import {clone,validate} from './model.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),project=path.dirname(here),repo=path.resolve(project,'../..'),out=path.join(repo,'.cache/room-editor-check');
await mkdir(out,{recursive:true});const fixture=path.join(out,'workshop.tscn'),noop=path.join(out,'no-edit.tscn'),editedFile=path.join(out,'edited.tscn');
const hash=async file=>createHash('sha256').update(await readFile(file)).digest('hex');
const originalHash=await hash(nativeScene),campaign=await hash(path.join(project,'levels/world1.tscn'));
await copyFile(nativeScene,fixture);
const initial=await bridge('read',fixture);assert.deepEqual(validate(initial),[]);await bridge('apply',fixture,initial,noop);assert.deepEqual(await bridge('read',noop),initial);
const invalid=clone(initial);invalid.rooms[0].objects.find(o=>o.kind==='Spawn').x=-1;assert(validate(invalid).length>0);
const editor=await start({scene:fixture,port:0,test:true});
let browser;const failures=[];const counts=[];const pass=name=>{counts.push(name);console.log('PASS '+name);};
const post=async(route,body,headers={})=>{const response=await fetch(editor.url+route,{method:'POST',headers:{'Content-Type':'application/json','X-Editor-Token':editor.token,...headers},body:JSON.stringify(body)});return {status:response.status,body:await response.json()};};
try{
 const forbidden=await fetch(editor.url+'/api/save',{method:'POST',headers:{Origin:'https://other.example','Content-Type':'application/json'},body:'{}'});assert.equal(forbidden.status,403);assert.equal((await fetch(editor.url+'/api/backup?id=../../levels/world1.tscn')).status,400);pass('local request boundaries reject foreign writes and arbitrary backup paths');
 browser=await puppeteer.launch({headless:true,defaultViewport:{width:1440,height:980}});const page=await browser.newPage();
 page.on('pageerror',e=>failures.push(e.message));page.on('dialog',d=>d.accept());
 await page.goto(editor.url,{waitUntil:'networkidle0'});await page.waitForFunction(()=>window.editorState?.().document);if(await page.$eval('#welcome',e=>!e.hidden))await page.click('#dismiss-welcome');
 assert.equal(await page.$$eval('#rooms option',nodes=>nodes.length),8);assert.equal(await page.$eval('#issues',e=>e.hidden),true);pass('all eight existing native rooms open without validation errors');
 const state=()=>page.evaluate(()=>window.editorState());
 const point=async(x,y)=>page.evaluate((x,y)=>{const v=window.editorState().view,b=document.querySelector('canvas').getBoundingClientRect();return {x:b.x+v.x+x*v.cell,y:b.y+v.y+y*v.cell};},x,y);
 const click=async(x,y)=>{const p=await point(x,y);await page.mouse.click(p.x,p.y);};
 const drag=async(x,y,ex,ey,button='left')=>{const a=await point(x,y),b=await point(ex,ey);await page.mouse.move(a.x,a.y);await page.mouse.down({button});await page.mouse.move(b.x,b.y,{steps:8});await page.mouse.up({button});};
 const hotkey=async(key,shift=false)=>{await page.keyboard.down('Control');if(shift)await page.keyboard.down('Shift');await page.keyboard.press(key);if(shift)await page.keyboard.up('Shift');await page.keyboard.up('Control');};
 const input=async(selector,value)=>{await page.$eval(selector,(el,value)=>{el.value=String(value);el.dispatchEvent(new Event('change',{bubbles:true}));},value);};
 await page.click('[data-brush="#"]');await drag(5.5,8.5,7.5,8.5);assert.equal((await state()).document.rooms[0].tiles[8].slice(5,8),'###');
 await hotkey('z');assert.equal((await state()).document.rooms[0].tiles[8].slice(5,8),'...');await hotkey('z',true);assert.equal((await state()).document.rooms[0].tiles[8].slice(5,8),'###');
 await drag(5.5,8.5,5.5,8.5,'right');assert.equal((await state()).document.rooms[0].tiles[8][5],'.');await hotkey('z');pass('real brush strokes and right-click erase undo/redo as whole gestures');
 await page.click('[data-tool="area"]');await drag(5.5,8.5,7.5,8.5);await drag(6.5,8.5,6.5,10.5);assert.equal((await state()).document.rooms[0].tiles[10].slice(5,8),'###');assert.equal((await state()).document.rooms[0].tiles[8].slice(5,8),'...');pass('terrain area selection moves ground without moving objects');
 await hotkey('c');await hotkey('v');await click(10.5,10.5);assert.equal((await state()).document.rooms[0].tiles[10].slice(10,13),'###');await hotkey('z');assert.equal((await state()).document.rooms[0].tiles[10].slice(10,13),'...');pass('terrain copy/paste places an independent undoable copy');
 const beforeView=(await state()).view;await page.mouse.move((await point(20,12)).x,(await point(20,12)).y);await page.mouse.wheel({deltaY:-150});await new Promise(r=>setTimeout(r,100));assert((await state()).view.cell>beforeView.cell);const beforePan=(await state()).view;await drag(4.5,4.5,6.5,5.5,'middle');assert.notEqual((await state()).view.x,beforePan.x);await page.click('#fit');pass('scroll zoom, middle-drag pan and fit keep the canvas navigable');
 await page.click('[data-tool="select"]');await drag(9.5,20,11.5,20);let moving=(await state()).document.rooms[0].objects.find(o=>o.id==='Fixture_Z_8_19');assert.equal(moving.x,10);assert.equal(moving.targetX,18);
 await drag(moving.targetX+moving.w/2,moving.targetY+moving.h/2,moving.targetX+moving.w/2,moving.targetY+moving.h/2-2);moving=(await state()).document.rooms[0].objects.find(o=>o.id==='Fixture_Z_8_19');assert.equal(moving.targetY,17);
 await drag(moving.x+moving.w,moving.y+moving.h,moving.x+moving.w+1,moving.y+moving.h);assert.equal((await state()).document.rooms[0].objects.find(o=>o.id===moving.id).w,4);
 await input('#hold-seconds',.75);assert.equal((await state()).document.rooms[0].objects.find(o=>o.id===moving.id).holdFrames,45);pass('dragged block carries its route; destination handle and timing edit reach the document');
 await page.click('canvas');await click(11.5,20);const n=(await state()).document.rooms[0].objects.length;await hotkey('d');assert.equal((await state()).document.rooms[0].objects.length,n+1);await page.keyboard.press('Delete');assert.equal((await state()).document.rooms[0].objects.length,n);pass('duplicate and delete operate on the selected object');
 await page.click('[data-object="o"]');await click(15.5,10.5);await drag(15.5,10.5,16.5,10.5);assert((await state()).document.rooms[0].objects.some(o=>o.glyph==='o'&&o.x===16&&o.y===10));
 for(const type of ['Z','s','~','K','prop:trumpets','prop:fern']){const n=(await state()).document.rooms[0].objects.length;await page.click(`[data-object="${type}"]`);await click(15.5,4.5);assert.equal((await state()).document.rooms[0].objects.length,n+1);await hotkey('z');}
 await page.click('[data-object="P"]');await click(5.5,20.5);assert.equal((await state()).document.rooms[0].objects.filter(o=>o.kind==='Spawn').length,1);assert.equal((await state()).document.rooms[0].objects.find(o=>o.kind==='Spawn').x,5);await hotkey('z');
 await page.click('[data-object="flag"]');await click(25.5,8.5);assert.equal((await state()).document.rooms[0].goal.x,25);await hotkey('z');pass('all object palette types place correctly; start and finish reposition without duplicates');
 const oldWidth=(await state()).document.rooms[0].width;await input('#room-width',oldWidth+2);assert.equal((await state()).document.rooms[0].tiles[0].length,oldWidth+2);await page.click('#undo');assert.equal((await state()).document.rooms[0].width,oldWidth);pass('room expansion preserves terrain and is undoable');
 await input('#room-name','Editor test room');await page.select('#rooms','4');assert.equal((await state()).roomIndex,4);await page.select('#rooms','0');assert.equal((await state()).document.rooms[0].name,'Editor test room');pass('new objects drag correctly and unsaved edits survive room switching');
 await page.click('#save');await page.waitForFunction(()=>!window.editorState().busy&&!window.editorState().dirty,{timeout:60000});assert.equal(await page.$eval('#issues',e=>e.hidden),true);await copyFile(fixture,editedFile);let savedDoc=await bridge('read',fixture);assert.equal(savedDoc.rooms[0].name,'Editor test room');assert.equal(savedDoc.rooms[0].tiles[10].slice(5,8),'###');pass('Save writes the edited native scene and rereads it without losing object edits');
 const stored=await apiDoc();
 const rejected=await post('/api/save',{...invalid,revision:stored.revision});assert.equal(rejected.status,422);assert.equal((await apiDoc()).revision,stored.revision);pass('invalid edits are rejected without touching the native scene');
 // Exports are real browser downloads, then imported again through the file picker.
 const session=await page.createCDPSession();await session.send('Page.setDownloadBehavior',{behavior:'allow',downloadPath:out});await page.click('#export');
 const exportName=`bladefall-workshop-${new Date().toISOString().slice(0,10)}.json`;for(let i=0;i<50;i++){try{if((await stat(path.join(out,exportName))).size>0)break;}catch{}await new Promise(r=>setTimeout(r,50));}
 const exported=JSON.parse(await readFile(path.join(out,exportName),'utf8'));assert.deepEqual(validate(exported),[]);await page.select('#rooms','0');await input('#room-name','Temporary draft');await (await page.$('#file')).uploadFile(path.join(out,exportName));await page.waitForFunction(()=>window.editorState().document.rooms[0].name==='Editor test room');pass('export and import use a complete editable file');
 const legacy=clone(exported);legacy.rooms=legacy.rooms.slice(0,6);legacy.rooms[0].name='Legacy six-room draft';const legacyPath=path.join(out,'legacy-six.json');await writeFile(legacyPath,JSON.stringify(legacy));
 await (await page.$('#file')).uploadFile(legacyPath);await page.waitForFunction(()=>window.editorState().document.rooms[0].name==='Legacy six-room draft');assert.equal((await state()).document.rooms.length,8);assert.deepEqual((await state()).document.rooms.slice(6),exported.rooms.slice(6));await page.click('#undo');pass('older six-room imports preserve the two appended rooms');

 await input('#room-name','Recovered browser draft');await new Promise(r=>setTimeout(r,250));await page.reload({waitUntil:'networkidle0'});await page.waitForSelector('#draft-dialog[open]');await page.click('#restore-draft');assert.equal((await state()).document.rooms[0].name,'Recovered browser draft');pass('unsaved drafts recover after browser reload');
 await appendFile(fixture,'\n');const conflicting=await post('/api/save',{...exported,revision:stored.revision});assert.equal(conflicting.status,409);pass('external native edits cause a conflict instead of being overwritten');
 await page.click('#reload');await page.waitForFunction(()=>!window.editorState().dirty);await page.click('#backups');await page.waitForSelector('#backup-list button');await page.click('#backup-list button');await page.waitForFunction(()=>window.editorState().document.rooms[0].name==='The Broken Relay');assert((await state()).dirty);await page.click('#save');await page.waitForFunction(()=>!window.editorState().busy&&!window.editorState().dirty,{timeout:60000});assert.deepEqual(await bridge('read',fixture),initial);pass('backup review and save restore the complete original native room data');
 await page.select('#rooms','4');await page.screenshot({path:path.join(out,'editor.png')});await page.click('#help');await page.screenshot({path:path.join(out,'walkthrough.png')});await page.click('.dialog-done');
 await page.setViewport({width:1024,height:768});await page.click('#fit');assert(await page.$eval('body',el=>el.scrollWidth<=innerWidth));await page.screenshot({path:path.join(out,'editor-compact.png')});await page.setViewport({width:1440,height:980});await page.click('#fit');
 assert.deepEqual(failures,[]);pass('browser UI works at desktop and compact window sizes without script errors');
 const result=await promisify(execFile)(path.join(repo,'.cache/godot/Godot.app/Contents/MacOS/Godot'),['--headless','--path',project,'--script',path.join(here,'check-native.gd'),'--',nativeScene,noop,editedFile,fixture],{timeout:60000,maxBuffer:1024*1024});await writeFile(path.join(out,'native.log'),result.stdout+result.stderr);assert(!/FAIL|SCRIPT ERROR|ERROR:/.test(result.stdout+result.stderr));pass('native runtime and actual gameplay controller read browser-authored collision, devices and resources');
 assert.equal(await hash(nativeScene),originalHash);assert.equal(await hash(path.join(project,'levels/world1.tscn')),campaign);pass('all integration tests leave the real workshop and user campaign scene unchanged');
 await writeFile(path.join(out,'checks.json'),JSON.stringify({passed:counts.length,checks:counts},null,2));console.log(`ROOM EDITOR PASSED · ${counts.length} integration groups`);
 async function apiDoc(){return fetch(editor.url+'/api/document').then(r=>r.json());}
}finally{await browser?.close();await editor.close();}
