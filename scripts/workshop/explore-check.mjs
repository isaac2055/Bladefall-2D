import assert from 'node:assert/strict';
import '../../public/bladefall-workshop-model.js';
import '../../public/bladefall-workshop-explore.js';
const A=globalThis.BladefallWorkshopExplore,M=globalThis.BladefallWorkshopModel;
const boss={type:'warden',x:100,y:30,w:40,h:50,hit:new Set(['sword']),route:new Map([['a',{x:2,y:3}]])};
const door={type:'door',id:'red-circuit',x:200,y:0,w:20,h:80,boss};boss.door=door;
const state={stageIndex:6,levelLength:2000,p:{x:70,y:0},boss,obstacles:[door,{type:'lever',id:'red-circuit',x:160,y:0,w:12,h:12}],enemies:[boss],pickups:[],npcs:[],portal:{x:1900,y:0},killGoal:1};
const def=A.fromState(state),level=A.compile(def);assert.equal(level.boss,level.enemies[0]);assert.equal(level.obstacles[0].boss,level.boss);assert.equal(level.boss.door,level.obstacles[0]);assert(level.boss.hit.has('sword'));assert.deepEqual(level.boss.route.get('a'),{x:2,y:3});assert.equal(level.obstacles[0].id,'red-circuit');assert.deepEqual(A.pack(A.unpack(def.graph)),def.graph);
const session=M.session(M.create({id:'explore-draft',mode:'explore',name:'Gate',definition:def}),{validateDefinition:d=>A.compile(d.definition)}),object=A.objects(def).find(o=>o.label==='warden');
assert.equal(A.objects(def).filter(o=>o.label==='warden').length,1,'shared boss is selectable once');
assert(session.submit('player',[A.move(def,object.id,{x:300,y:-100,w:60,h:80})]).ok);const changed=A.compile(session.snapshot().definition);assert.equal(changed.boss.x,330);assert.equal(changed.boss.y,20);assert.equal(changed.boss.w,60);assert.equal(changed.obstacles[0].boss,changed.boss,'references follow object edits');assert(session.undo('player').ok);assert.deepEqual(session.snapshot().definition,def);
const broken=M.json(def);broken.graph.nodes[object.id].props.door={$ref:'missing'};assert.throws(()=>A.compile(broken));
assert.throws(()=>A.pack({run(){}}),'executable properties must not silently disappear');assert.throws(()=>A.unpack(JSON.parse('{"entry":{"$ref":"a"},"nodes":{"a":{"kind":"object","props":{"__proto__":{}}}}}')));
console.log('PASS: Explore circuit IDs, boss aliases/cycles, native Sets/Maps, canvas coordinate conversion, move/resize/undo, link validation and executable-data rejection.');
// Real geometry anchors: platforms/walls/doors extend down; characters/crates extend up.
const geometry=A.fromState({stageIndex:0,levelLength:3000,p:{x:70,y:0},obstacles:[{type:'plat',x:100,y:200,w:120,h:20,x0:100,y0:200,move:{dx:100,dy:20}},{type:'wall',x:400,y:500,w:30,h:300},{type:'pit',x:700,w:150},{type:'crate',x:900,y:50,w:36,h:34,x0:900,y0:50,yPrev:50}],enemies:[],pickups:[],npcs:[]});
const platform=A.objects(geometry).find(o=>o.label==='plat');assert.equal(platform.y,-200);assert.equal(A.objects(geometry).find(o=>o.label==='wall').y,-500);assert(A.objects(geometry).find(o=>o.label==='pit').y===0);
const moved=A.move(geometry,platform.id,{x:platform.x+50,y:platform.y-30}).value;assert.equal(moved.x0,150);assert.equal(moved.y0,230);
const edits=M.session(M.create({id:'edits',mode:'explore',name:'Build',definition:geometry}),{validateDefinition:d=>A.compile(d.definition)});
for(const [glyph]of A.palette){assert(edits.submit('a',A.insert(edits.snapshot().definition,{id:'added-'+glyph,glyph,x:1100,y:-200})).ok,glyph);}
for(const [glyph]of A.palette){const d=edits.snapshot().definition;assert(A.objects(d).some(o=>o.id==='added-'+glyph));assert(edits.submit('a',A.remove(d,'added-'+glyph)).ok);}
assert.throws(()=>A.remove(geometry,A.objects(geometry).find(o=>o.collection==='spawn').id));
const duplicated=session.submit('player',A.duplicate(def,object.id,{newId:'boss-copy',dx:80,dy:-20}));assert(duplicated.ok,duplicated.error);
const copy=A.compile(session.snapshot().definition);assert.equal(copy.enemies.length,2);assert.notEqual(copy.enemies[0],copy.enemies[1]);assert.notEqual(copy.enemies[0].route,copy.enemies[1].route);assert.equal(copy.enemies[1].door,copy.obstacles[0],'duplicated entity keeps external circuit links');
assert(session.undo('player').ok);assert(session.submit('player',A.remove(def,object.id)).ok);const removed=A.compile(session.snapshot().definition);assert.equal(removed.boss,null);assert.equal(removed.enemies.length,0);assert.equal(removed.obstacles[0].boss,null);assert(session.undo('player').ok);assert.deepEqual(session.snapshot().definition,def);
const behavior=()=>42,native={...state,actTwo:{enc:{gate:{fleeX:behavior}}}};const nativeDef=A.fromState(native);assert.equal(A.compile(nativeDef,{nativeRoot:native}).context.actTwo.enc.gate.fleeX,behavior);assert.equal(A.compile(nativeDef).context.actTwo.enc.gate.fleeX,undefined);assert.throws(()=>A.compile(nativeDef,{nativeRoot:state}),/no longer available/);
console.log('PASS: native anchor conventions, moving origins, all palette insertions/deletions, linked duplicate/delete/undo and data-only native behavior bindings.');
