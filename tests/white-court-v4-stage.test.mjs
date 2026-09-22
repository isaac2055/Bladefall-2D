import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const source=await readFile(new URL('../public/index.html',import.meta.url),'utf8');
function fn(name){
  const start=source.indexOf('function '+name+'(');assert.ok(start>=0,name+' exists');
  const brace=source.indexOf('{',start);let depth=0;
  for(let i=brace;i<source.length;i++){
    if(source[i]==='{')depth++;
    else if(source[i]==='}'&&--depth===0)return source.slice(start,i+1);
  }
  throw Error('unterminated '+name);
}
const constructors=['Pl','Gr','Wl','Slate','SlateWall','Check','Scenery','AmbientFigure','Fluid','RuneEmitter','SpellSiphon','LPortal','Anchor','StoryRelic','SealedRecollection','CourtBeat','CourtScenery'];
const start=source.indexOf('const WHITE_COURT_LEVEL='),end=source.indexOf('\nfunction interactWhiteCourt',start);
const level=vm.runInNewContext(constructors.map(fn).join('\n')+'\n'+source.slice(start,end)+';WHITE_COURT_LEVEL');
const objects=level.objects;
const supports=(x,y)=>objects.some(o=>o.type==='plat'&&!o.gate&&o.y===y&&Math.abs(x-o.x)<=o.w/2);
const object=id=>objects.find(o=>o.zoneEntityId===id);

test('White Court retains its three connector landings and the original boss arena floor',()=>{
  assert.equal(level.len,16000);assert.equal(level.spawnX,4800);assert.equal(level.spawnY,0);
  assert.equal(level.bossX,14300);assert.equal(level.bossSkipCapability,'attunement');assert.equal(level.portal,null);
  for(const [id,x] of [['court-aqueduct-latch',240],['court-causeway-shaft',4800],['court-ember-door',15500]]){
    const endpoint=object(id);assert.equal(endpoint.x,x);assert.equal(endpoint.y,0);assert.ok(supports(x,0));
  }
  const arena=objects.find(o=>o.type==='plat'&&o.deep&&o.x-o.w/2===13000&&o.x+o.w/2===16000);
  assert.ok(arena);assert.equal(arena.y,0);
  assert.equal(objects.filter(o=>o.x>=13000&&o!==arena).length,1,'the authored pass adds no obstacles to the boss arena');
});

test('the Glassworks preserves its downward intake, horizontal outlet and moving condenser timing lesson',()=>{
  const source=objects.find(o=>o.type==='runeEmitter'&&o.courtRoom==='glassworks');
  const anchor=object('court-glass-anchor'),receiver=object('court-glass-condenser');
  assert.equal(source.dir,'down');assert.equal(source.el,'ice');assert.equal(source.circuit,receiver.circuitId);
  assert.ok(objects.some(o=>o.slate&&o.type==='plat'&&o.x===source.x&&o.y===0));
  assert.equal(anchor.nx,1);assert.equal(anchor.ny,0);assert.equal(anchor.y,receiver.y0);
  assert.equal(receiver.oscillate,true);assert.ok(receiver.amplitude>0&&receiver.period>0);
  assert.equal(object('court-glass-ice-bridge').gate,receiver.circuitId);
});

test('the Gallery routes horizontal cold through a wall intake into an upward basin outlet',()=>{
  const source=objects.find(o=>o.type==='runeEmitter'&&o.courtRoom==='petition-gallery');
  const intake=objects.find(o=>o.courtGalleryIntake),outlet=objects.find(o=>o.courtGalleryOutlet),receiver=object('court-gallery-condenser');
  assert.equal(source.dir,'right');assert.equal(source.el,'ice');assert.ok(source.x<intake.x);
  assert.equal(intake.type,'wall');assert.equal(intake.slate,1);
  assert.ok(source.y>intake.y-intake.h&&source.y<intake.y,'the source actually strikes the portalable face');
  assert.equal(outlet.type,'plat');assert.equal(outlet.slate,1);assert.equal(outlet.y,-80);
  assert.equal(receiver.x,outlet.x);assert.ok(receiver.y>outlet.y+300,'the condenser receives a rising shot above the basin');
  assert.equal(receiver.oscillate,undefined);assert.equal(source.circuit,receiver.circuitId);
  assert.equal(receiver.circuitId,object('court-gallery-bridge').gate,'one cold circuit stops the source and provides the crossing');
});

test('the cold span creates a useful crossing to a high pier over a genuinely recessed road',()=>{
  const bridge=object('court-gallery-bridge'),pier=objects.find(o=>o.courtGalleryPier),landing=objects.find(o=>o.courtGalleryLanding);
  const western=objects.filter(o=>o.courtGalleryApproach).sort((a,b)=>b.y-a.y)[0];
  assert.ok(!objects.some(o=>o.type==='plat'&&o.deep&&o.y===0&&Math.abs(o.x-bridge.x)<=o.w/2),'there is no flat road under the solved span');
  assert.equal(bridge.y,western.y);assert.ok(western.x+western.w/2>=bridge.x-bridge.w/2);
  assert.ok(landing.x-landing.w/2-(western.x+western.w/2)>600,'the missing span cannot be replaced by one short hop');
  assert.ok(pier.slickL&&pier.slickR);assert.ok(pier.y-bridge.y>80&&pier.y-bridge.y<=150,'the last rise uses the acquired second jump');
  assert.ok(bridge.x+bridge.w/2>=pier.x-pier.w/2);
  assert.equal(landing.y,pier.y);assert.ok(Math.abs(landing.x-pier.x)<=landing.w/2);
});

test('missed Gallery approaches land on a dry catch with an ordinary jump route back west',()=>{
  const catchFloor=objects.find(o=>o.courtGalleryRecovery),step=objects.find(o=>o.courtGalleryRecoveryStep),outlet=objects.find(o=>o.courtGalleryOutlet);
  assert.ok(catchFloor.deep&&!catchFloor.ice&&!catchFloor.gate);assert.ok(supports(outlet.x,outlet.y));
  assert.ok(outlet.x-outlet.w/2>=catchFloor.x-catchFloor.w/2&&outlet.x+outlet.w/2<=catchFloor.x+catchFloor.w/2);
  assert.ok(step.y-catchFloor.y>0&&step.y-catchFloor.y<=80);
  assert.ok(Math.abs(step.x-catchFloor.x)<=catchFloor.w/2+step.w/2);
  assert.ok(supports(step.x-step.w/2,0));assert.ok(-step.y<=80,'the service step reaches the west bank without Double Jump');
  assert.equal(objects.filter(o=>o.courtRoom==='petition-gallery'&&['spikes','fluid'].includes(o.type)).length,0);
});

test('White Court checkpoints and the relocated sealed memory retain real supporting ledges',()=>{
  for(const checkpoint of objects.filter(o=>o.type==='check'))assert.ok(supports(checkpoint.x,checkpoint.y),'checkpoint '+checkpoint.x+' is supported');
  const memory=objects.find(o=>o.sealedRecollection==='frost-sorcerer');assert.ok(memory);
  assert.ok(objects.some(o=>o.courtGalleryApproach&&Math.abs(memory.x-o.x)<o.w/2&&memory.y-o.y>0&&memory.y-o.y<=60));
  assert.equal(memory.zoneEntityId,'sealed-recollection-frost-sorcerer');
});

test('Vey is the sole speaking resident and three deliberate encounters leave the Gallery quiet',()=>{
  const residents=objects.filter(o=>o.type==='ambientFigure');assert.equal(residents.length,1);
  assert.equal(residents[0].name,'Vey');assert.equal(residents[0].residentId,'outskirts-survivor');assert.equal(residents[0].courtKeeper,true);
  assert.equal(level.enemies.length,3);assert.ok(level.enemies.every(e=>e.courtEncounter&&e.noDrop&&e.x<10800));
  assert.equal(level.loot.length,0);assert.equal(objects.filter(o=>o.type==='sign').length,0);
});
