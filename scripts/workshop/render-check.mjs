import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {Core,Rooms} from '../pcore-tape.mjs';
const dom=new JSDOM('<canvas id="pcCanvas"></canvas><div id="pcOverlay"></div>',{url:'http://localhost/precision.html?chapter=0',runScripts:'outside-only'}),w=dom.window;
Object.defineProperty(w.document,'readyState',{value:'complete'});w.structuredClone=structuredClone;w.requestAnimationFrame=()=>0;w.matchMedia=()=>({matches:false});w.Audio=class{constructor(){this.dataset={};}pause(){}play(){return Promise.resolve();}};
const calls=[];let depth=0;
const ctx=new Proxy({measureText:s=>({width:String(s).length*5}),createLinearGradient:()=>({addColorStop(){}}),createPattern:()=>null,save:()=>depth++,restore:()=>depth--},{get:(t,k)=>k in t?t[k]:(...args)=>calls.push([k,...args]),set:(t,k,v)=>(t[k]=v,true)});
w.HTMLCanvasElement.prototype.getContext=()=>ctx;w.BladefallPrecisionCore=Core;w.BladefallPrecisionRooms=Rooms;
for(const f of ['bladefall-input','bladefall-workshop-model','bladefall-workshop-ascend','bladefall-workshop-explore','bladefall-workshop-selection','bladefall-workshop-properties','bladefall-workshop-render','bladefall-workshop-ui','bladefall-pcore-view'])w.eval(readFileSync('public/'+f+'.js','utf8'));
try{
 const V=w.BladefallPrecisionView,M=w.BladefallWorkshopModel,A=w.BladefallWorkshopAscend,R=w.BladefallWorkshopRender;
 const map=Array.from({length:23},()=>'.'.repeat(40));map[1]='P'+'.'.repeat(39);map[8]='.....ZZZ....b...r'.padEnd(40,'.');map[22]='#'.repeat(40);
 const doc=M.create({id:'native-art',mode:'ascend',name:'Native art',definition:A.fromRoom({id:'native-art',cols:40,rows:23,map,zips:[[6,-3]]})});
 const original=V.view.g,originalCam=JSON.stringify(V.view.cam),scene=R.create(),area={pan:{x:0,y:0},zoom:2,width:320,height:184};
 calls.length=0;assert(scene.native(ctx,doc,area));assert.equal(scene.error(),null);assert(calls.filter(c=>c[0]==='fillRect').length>60,'native masonry and sprites are drawn');assert.equal(V.view.g,original);assert.equal(JSON.stringify(V.view.cam),originalCam);assert.equal(depth,0);
 const tallMap=Array.from({length:30},()=>'.'.repeat(24));tallMap[2]='..P'+'.'.repeat(21);tallMap[29]='#'.repeat(24);const tall=Core.createGame([{id:'tall-inversion',cols:24,rows:30,map:tallMap}]);globalThis.BladefallPrecisionGravity.mirror(tall);calls.length=0;V.drawWorkshop(ctx,tall,{...area,height:240});assert(calls.some(c=>c[0]==='translate'&&c[1]===0&&c[2]===240),'native editor art flips around the authored height');
 V.view.g=tall;V.view.camRoom=null;V.advance([]);assert.equal(V.view.cam.y,0,'camera follows screen-space position in a tall inverted room');V.view.g=original;Object.assign(V.view.cam,JSON.parse(originalCam));
 const zip=A.objects(doc.definition).find(o=>o.data.glyph==='Z');calls.length=0;R.guides(ctx,doc,A.objects(doc.definition),{zoom:2,selected:new Set([zip.id])});assert(calls.some(c=>c[0]==='strokeRect'&&c[1]===zip.x+48&&c[2]===zip.y-24));
 // Actual UI uses native art again after a property edit and preserves the campaign scene.
 const seen=[],draw=V.drawWorkshop;V.drawWorkshop=(c,g,a)=>{seen.push(g);draw(c,g,a);};
 const ui=w.BladefallWorkshopUI.open({document:doc,adapter:A,onSave:async()=>{}});assert(seen.length);const first=seen.at(-1);ui.select(zip.id);assert.equal(seen.at(-1),first,'selection reuses the draft scene');
 const input=ui.element.querySelector('[data-property=x]');input.value=String(zip.x+8);input.dispatchEvent(new w.Event('change'));assert.notEqual(seen.at(-1),first,'changed geometry rebuilds the isolated scene');assert.equal(seen.at(-1).ents.find(e=>e.type==='zip').x,zip.x+8);assert.equal(V.view.g,original);await ui.save();ui.close();
 // Explore's page can render Ascend artwork through an isolated source frame too.
 delete w.BladefallPrecisionView;let loaded=0;const cross=R.create(()=>loaded++);
 assert.equal(cross.native(ctx,doc,area),false);const frame=w.document.querySelector('iframe[title="ascend editor artwork"]');assert(frame.src.endsWith('precision.html?pitch=climb&workshopSource=1'));
 Object.defineProperty(frame,'contentWindow',{value:{BladefallPrecisionCore:Core,BladefallPrecisionView:V}});frame.onload();assert.equal(loaded,1);assert(cross.native(ctx,doc,area));assert.equal(V.view.g,original);cross.close();assert.equal(frame.isConnected,false);w.BladefallPrecisionView=V;
 // A broken device renderer cannot leave the editor canvas transformed.
 w.BladefallPrecisionDeviceViews=[{draw(){throw Error('broken art');}}];assert.equal(R.create().native(ctx,doc,area),false);assert.equal(depth,0);w.BladefallPrecisionDeviceViews=[];
 const E=w.BladefallWorkshopExplore,model=M.session(M.create({id:'links',mode:'explore',name:'Links',definition:E.blank()}),{validateDefinition:d=>E.compile(d.definition)});
 for(const [id,glyph,x,y]of [['lever','lever',200,-40],['door','door',500,-180],['portal1','lportal',700,-80],['portal2','lportal',900,-80]])assert(model.submit('a',E.insert(model.snapshot().definition,{id,glyph,x,y})).ok);
 const d=model.snapshot(),os=E.objects(d.definition),lever=os.find(o=>o.id==='lever'),door=os.find(o=>o.id==='door');calls.length=0;R.guides(ctx,d,os,{zoom:2,selected:new Set(['lever'])});assert(calls.some(c=>c[0]==='lineTo'&&c[1]===door.x+door.w/2&&c[2]===door.y+door.h/2));
 calls.length=0;R.guides(ctx,d,os,{zoom:2,selected:new Set(['portal1'])});assert(calls.some(c=>c[0]==='lineTo'&&c[1]===920));assert.equal(depth,0);
 // Exercise every loaded course with the actual device art modules, not just basic blocks.
 V.drawWorkshop=draw;for(const key of Object.keys(globalThis))if(key.startsWith('Bladefall')&&key!=='BladefallPrecisionDeviceViews')w[key]=globalThis[key];
 for(const file of readdirSync('public').filter(f=>/^bladefall-pcore-(dev-.*|combat|foes|portals)-view\.js$/.test(f)))w.eval(readFileSync('public/'+file,'utf8'));
 let checked=0;for(const room of Rooms.all){calls.length=0;const g=Core.createGame([room]);V.drawWorkshop(ctx,g,area);assert.equal(depth,0,room.id);checked++;}
 console.log('PASS: native device art for '+checked+' loaded course rooms.');
 console.log('PASS: native Ascend editor art, draft scene reuse/rebuild, untouched campaign camera/state, balanced canvas on renderer failure, carrier targets and Explore circuit/portal guides.');
}finally{dom.window.close();}
