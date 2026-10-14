import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {Core} from '../pcore-tape.mjs';
const dom=new JSDOM('<body></body>',{url:'http://localhost/',runScripts:'outside-only'}),w=dom.window;
w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({},{get:(t,k)=>t[k]||(()=>{}),set:(t,k,v)=>(t[k]=v,true)});
for(const f of ['model','ascend','explore','selection','properties','ui'])w.eval(readFileSync('public/bladefall-workshop-'+f+'.js','utf8'));
try{
 const M=w.BladefallWorkshopModel,A=w.BladefallWorkshopAscend,P=w.BladefallWorkshopProperties;
 const map=Array.from({length:23},()=>'.'.repeat(40));map[1]='P'+'.'.repeat(39);map[10]='....EEE...XXX...ZZZ'.padEnd(40,'.');map[22]='#'.repeat(40);
 const doc=M.create({id:'settings',mode:'ascend',name:'Settings',definition:A.fromRoom({id:'settings-room',cols:40,rows:23,map})});
 const ui=w.BladefallWorkshopUI.open({document:doc,adapter:A,onSave:async()=>{}}),el=ui.element;
 const object=glyph=>A.objects(ui.snapshot().definition).find(o=>o.data.glyph===glyph);
 const set=(key,value)=>{const input=el.querySelector('[data-device='+key+']');assert(input,key+' control exists');input.value=String(value);input.dispatchEvent(new w.Event('change'));};
 ui.select(object('E').id);set('stone',30);set('molten',10);set('glass',5);set('start','molten');
 ui.select(object('X').id);set('open',12);set('shut',20);set('offset',5);
 ui.select(object('Z').id);set('travelX',8);set('travelY',-3);
 const game=Core.createGame([A.compile(ui.snapshot().definition)]),slab=game.slabs[0],shutter=game.ents.find(e=>e.type==='shutter'),zip=game.ents.find(e=>e.type==='zip');
 assert.equal(slab.state,'molten');assert.deepEqual(slab.durs,{stone:30,molten:10,glass:5});assert.equal(shutter.beat.open,12);assert.equal(shutter.beat.shut,20);assert.equal(shutter.beat.offset,5);assert.equal(zip.tx-zip.x,64);assert.equal(zip.ty-zip.y,-24);
 ui.select(object('X').id);set('open',0);const revision=ui.snapshot().revision;set('shut',0);assert.equal(ui.snapshot().revision,revision);assert(el.querySelector('[data-status]').textContent.includes('positive duration'));set('shut',-2);assert.equal(ui.snapshot().revision,revision);
 ui.select(object('Z').id);const old=ui.snapshot().revision;set('travelX',2.5);assert.equal(ui.snapshot().revision,old);assert.throws(()=>P.edit(ui.snapshot(),object('Z'),'travelX',Infinity));
 // A focused stale control never overwrites a remote change.
 const input=el.querySelector('[data-device=travelX]');input.focus();const o=object('Z');assert(ui.session.submit('friend',[P.edit(ui.snapshot(),o,'travelX',12)]).ok);ui.refresh({remote:true});input.value='10';input.dispatchEvent(new w.Event('change'));assert.equal(object('Z').data.settings[0],12);assert(el.querySelector('[data-status]').textContent.includes('changed'));
 await ui.save();ui.close();
 console.log('PASS: friendly device controls drive native carrier travel, slab phases, shutter timing; invalid cycles and stale co-builder settings are rejected.');
}finally{dom.window.close();}
const {exploreRuntime}=await import('./explore-runtime-harness.mjs');
const app=await exploreRuntime('?workshopSource=1');
try{
 const {w}=app,A=w.BladefallWorkshopExplore,M=w.BladefallWorkshopModel,P=w.BladefallWorkshopProperties,R=w.BladefallWorkshopExploreRuntime;
 const model=M.session(M.create({id:'device-level',mode:'explore',name:'Devices',definition:A.blank()}),{validateDefinition:d=>A.compile(d.definition)});
 for(const [id,glyph,x,y]of [['spike','spikes',300,-20],['lever','lever',500,-40],['door','door',800,-180],['mouth1','lportal',1000,-120],['mouth2','lportal',1500,-120],['spring','spring',1700,-20]])assert(model.submit('author',A.insert(model.snapshot().definition,{id,glyph,x,y})).ok);
 const set=(id,key,value)=>{const doc=model.snapshot(),o=A.objects(doc.definition).find(o=>o.id===id);const result=model.submit('author',[P.edit(doc,o,key,value)]);assert(result.ok,result.error);};
 set('spike','period',4);set('spike','upT',1.2);set('spike','phase',.1);set('lever','id','test-door');set('door','circuit','test-door');set('lever','dur',8);set('mouth1','pg','test-pair');set('mouth2','pg','test-pair');set('mouth2','face','up');set('spring','pow',1100);
 R.start(model.snapshot().definition);const g=w.__BF.G,spike=g.obstacles.find(o=>o.type==='spikes');g.time=.5;assert(w.spikesUp(spike));g.time=2;assert(!w.spikesUp(spike));assert.equal(g.levers['test-door'].dur,8);g.levers['test-door'].timer=2;assert(w.circuitOpen(g.obstacles.find(o=>o.type==='door').circuit));assert.equal(g.lportals['test-pair'].length,2);assert(w.portalPairs().some(pair=>pair.id==='fixed:test-pair'));assert.equal(g.lportals['test-pair'][1].ny,1);assert.equal(g.obstacles.find(o=>o.type==='spring').pow,1100);
 set('mouth1','connection','anchor');const changed=A.compile(model.snapshot().definition).obstacles.find(o=>o.pg==='test-pair');assert(changed.anchor);assert.notEqual(changed.portalLesson,'fixed');
 assert.deepEqual(app.errors,[]);console.log('PASS: edited Explore spike timing, lever/door circuits, usable fixed portal pairs, orientation, anchor selection and spring strength in the native runtime.');
}finally{app.close();}
