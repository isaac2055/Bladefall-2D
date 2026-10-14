import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {JSDOM} from 'jsdom';
const dom=new JSDOM('<body></body>',{url:'http://localhost/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({},{get:(t,k)=>t[k]||(()=>{}),set:(t,k,v)=>(t[k]=v,true)});
w.HTMLCanvasElement.prototype.getBoundingClientRect=()=>({left:0,top:0,width:800,height:500});
for(const f of ['model','ascend','store','selection','properties','ui'])w.eval(readFileSync('public/bladefall-workshop-'+f+'.js','utf8'));
const M=w.BladefallWorkshopModel,A=w.BladefallWorkshopAscend,store=w.BladefallWorkshopStore.create({indexedDB:null}),room={id:'edit-test',cols:20,rows:12,map:['P...................',...Array(9).fill('....................'),'....====............','####################'],exit:'right'};
const original=M.create({id:'test-document',mode:'ascend',name:'Test level',definition:A.fromRoom(room)});let tests=0,exits=0;
const ui=w.BladefallWorkshopUI.open({document:original,adapter:A,onSave:store.save,onTest:()=>tests++,onExit:()=>exits++}),el=ui.element,q=s=>el.querySelector(s),canvas=q('canvas');
const objects=A.objects(original.definition),platform=objects.find(o=>o.data.c===4&&o.data.r===10);ui.select(platform.id);
const input=q('[data-property=x]');input.value='48';input.dispatchEvent(new w.Event('change'));assert.equal(A.objects(ui.snapshot().definition).find(o=>o.id===platform.id).x,48);
q('[data-action=undo]').click();assert.equal(A.objects(ui.snapshot().definition).find(o=>o.id===platform.id).x,32);q('[data-action=redo]').click();assert.equal(A.objects(ui.snapshot().definition).find(o=>o.id===platform.id).x,48);
// UI fit is a deterministic affine camera: 20px padding, 4.75x scale for this 160x96 room.
ui.fit();const pointer=(type,x,y,button=0)=>canvas.dispatchEvent(new w.MouseEvent(type,{bubbles:true,clientX:x,clientY:y,button}));
pointer('pointerdown',20+56*4.75,20+84*4.75);pointer('pointermove',20+72*4.75,20+76*4.75);pointer('pointerup',20+72*4.75,20+76*4.75);
assert.equal(A.objects(ui.snapshot().definition).find(o=>o.id===platform.id).x,64);assert.equal(A.objects(ui.snapshot().definition).find(o=>o.id===platform.id).y,72);
// Drag lower-right handle to widen the same rectangle.
pointer('pointerdown',20+96*4.75,20+80*4.75);pointer('pointermove',20+112*4.75,20+80*4.75);pointer('pointerup',20+112*4.75,20+80*4.75);assert.equal(A.objects(ui.snapshot().definition).find(o=>o.id===platform.id).w,48);
q('[data-tool]').value='add:b';q('[data-tool]').dispatchEvent(new w.Event('change'));pointer('pointerdown',20+120*4.75,20+48*4.75);assert(A.objects(ui.snapshot().definition).some(o=>o.data.glyph==='b'&&o.x===120));const seed=A.objects(ui.snapshot().definition).find(o=>o.data.glyph==='b');q('[data-action=duplicate]').click();assert.equal(A.objects(ui.snapshot().definition).filter(o=>o.data.glyph==='b').length,2);q('[data-action=undo]').click();ui.select(seed.id);q('[data-action=delete]').click();assert(!A.objects(ui.snapshot().definition).some(o=>o.data.glyph==='b'));
const width=q('[data-level=cols]');width.value='24';width.dispatchEvent(new w.Event('change'));assert.equal(A.compile(ui.snapshot().definition).cols,24);
q('[data-action=test]').click();assert.equal(tests,1);await ui.save();const saved=await store.load(original.id);assert.equal(saved.revision,ui.snapshot().revision);
const reloaded=w.BladefallWorkshopStore.create({indexedDB:null});assert.equal((await reloaded.list())[0].name,'Test level');assert.deepEqual(await reloaded.load(original.id),saved);
await assert.rejects(store.save(original),/newer or different/);assert.deepEqual(await store.load(original.id),saved,'stale writes cannot replace durable edits');
const fullStore=w.BladefallWorkshopStore.create({indexedDB:null,storage:{getItem:()=>null,setItem:()=>{throw Error('Quota exceeded');}}});await assert.rejects(fullStore.save(original),/Quota/);
ui.close();assert.equal(exits,1);assert(!w.document.querySelector('.bfWorkshop'));dom.window.close();console.log('PASS: actual property and pointer move/resize/add/delete controls, undo/redo, test button, durable reload, stale-write rejection, storage failure and editor cleanup.');
