import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
const html=fs.readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){
  if(m[2].trim()&&!/type=["'](?:module|application\/ld\+json)/.test(m[1]))new vm.Script(m[2]);
}
const dom=new JSDOM('<div id="overlay"><select id="viewZoomSelect"></select><select id="viewScaleSelect"></select><input type="range"><input type="checkbox"></div><canvas></canvas>',{runScripts:'outside-only'});
const {window}=dom;
const shim=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].find(m=>m[1].includes('Touch click-synthesis shim'))[1];
window.eval(shim);
// Model the actual LittleJS document handler: menus must not reach it.
window.document.addEventListener('mousedown',e=>e.preventDefault());
for(const el of window.document.querySelectorAll('#overlay select,#overlay input')){
 const e=new window.MouseEvent('mousedown',{bubbles:true,cancelable:true});el.dispatchEvent(e);assert.equal(e.defaultPrevented,false);
}
const e=new window.MouseEvent('mousedown',{bubbles:true,cancelable:true});window.document.querySelector('canvas').dispatchEvent(e);assert.equal(e.defaultPrevented,true);
let saves=0;
const ctx={meta:{viewZoom:1,viewScale:'close'},persist:()=>saves++,applyViewScale:()=>{},toast:()=>{},document:window.document};vm.createContext(ctx);
for(const name of ['setGameZoom','handleGameZoomShortcut'])vm.runInContext(html.match(new RegExp('function '+name+'\\([^]*?\\n\\}'))[0],ctx);
function key(key,mods={ctrlKey:true},target=window.document.body,code=''){
 const e={key,code,...mods,target,preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;}};ctx.handleGameZoomShortcut(e);return e;
}
assert(key('=') .prevented);assert.equal(ctx.meta.viewZoom,1.05);
key('-', {metaKey:true});assert.equal(ctx.meta.viewZoom,1);
key('+',{metaKey:true,shiftKey:true});assert.equal(ctx.meta.viewZoom,1.05);
for(let i=0;i<20;i++)key('+');assert.equal(ctx.meta.viewZoom,1.15);
for(let i=0;i<20;i++)key('-');assert.equal(ctx.meta.viewZoom,.85);
key('0',{metaKey:true});assert.equal(ctx.meta.viewZoom,1);
key('',{ctrlKey:true},window.document.body,'NumpadAdd');assert.equal(ctx.meta.viewZoom,1.05);
assert(!key('+',{}).prevented);assert(!key('+',{ctrlKey:true,altKey:true}).prevented);
const input=window.document.createElement('input');assert(!key('+',{ctrlKey:true},input).prevented);
const rebind=window.document.createElement('button');rebind.className='kbkey listening';window.document.body.append(rebind);assert(!key('+').prevented);rebind.remove();
ctx.meta.viewScale='window';key('0');assert.equal(ctx.meta.viewScale,'close');assert(saves>0);
console.log('PASS: shortcut modifiers, keypad, limits, reset, text/rebinding exclusions, save, wide-view switch, and native menu mouse events.');
window.close();
