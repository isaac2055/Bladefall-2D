// Native acceptance evidence for the next five authored Cores. No browser/human completion is implied.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import vm from 'node:vm';
import {Core,expand,keysToInput,runRoom} from '../pcore-tape.mjs';
import {coreCrumbleGrace} from './core-difficulty.mjs';
const worlds={101:'keep',102:'gaol',103:'frost',104:'court',105:'ember',106:'foundry',107:'inversion',108:'citadel',109:'throne',110:'deepline',111:'cliffs',112:'shores',113:'colony',114:'path',115:'sunspire'};
const ids=process.argv.slice(2).map(Number);assert.ok(ids.length,'Pass each source id to verify.');
for(const id of ids){
 const x=JSON.parse(readFileSync(`scripts/room-bank/fractured/${id}-bank-f${id}.json`)),name=worlds[id];assert.ok(name);
 let authored;vm.runInNewContext(readFileSync(`scripts/climb/author-${name}-core.mjs`,'utf8').replace(/^import .*;\n/gm,''),{writeFileSync:(_p,s)=>{authored=JSON.parse(s);},coreCrumbleGrace});assert.deepEqual(authored.room,x.room,'Author geometry/configuration parity');
 assert.equal(x.room.crumbleExtraFrames,coreCrumbleGrace(id-95));assert.equal(x.room.core,id-95);assert.ok(x.room.coreCheckpoints.length>=5);
 const whole=runRoom([x.room],0,x.tape,{trace:true});assert.ok(whole.exited);assert.equal(whole.deaths,0);
 const counts={};for(const e of whole.events)counts[e.type]=(counts[e.type]||0)+1;for(const [event,n]of Object.entries(x.bank.requiredEventCounts))assert.ok(counts[event]>=n,`${id}: ${event}: ${counts[event]} < ${n}`);
 const parts=[];assert.equal(x.verification.partTapes.length,x.room.coreCheckpoints.length+1);
 for(let part=0;part<x.verification.partTapes.length;part++){
  const g=Core.createGame([x.room]);if(part){g.coreRun.index=part-1;Core.resetRoom(g);g.p.state='normal';g.p.respawnTimer=0;}
  let done=false,frames=0;for(const k of expand(x.verification.partTapes[part])){Core.step(g,keysToInput(k));frames++;assert.equal(g.deaths,0,`${id} part ${part+1}`);if(part===x.room.coreCheckpoints.length?g.exited:g.coreRun.index>=part){done=true;break;}g.events.length=0;}assert.ok(done);parts.push(frames);
 }
 const probes=[];for(const[name,tape]of [...(id===107||id===112||id===113||id===115?[]:[['remove grab',x.tape.map(([n,k])=>[n,k.replaceAll('g','')])]]),['hold right',[[1800,'r']]],['jump/dash right',Array.from({length:70},()=>[[8,'rj'],[8,'rx'],[20,'r']]).flat()]]){const r=runRoom([x.room],0,tape);assert.ok(!r.exited,`${id}: ${name} bypassed the room`);probes.push({name,exited:r.exited,deaths:r.deaths});}
 if(id===102){const r=runRoom([{...x.room,map:x.room.map.map(row=>row.replaceAll('R','.'))}],0,x.tape);assert.ok(!r.exited&&r.deaths>0);probes.push({name:'authored route without pressure pods',exited:r.exited,deaths:r.deaths});}
 if(id===103){const r=runRoom([{...x.room,map:x.room.map.map(row=>row.replaceAll('f','.'))}],0,x.tape);assert.ok(!r.exited&&r.deaths>0);probes.push({name:'authored route without frost feathers',exited:r.exited,deaths:r.deaths});assert.ok(whole.events.some(e=>e.type==='parry'&&whole.log[e.i]?.st==='climb'),'Frost route must include the hanging parry');}
 if(id===104){const r=runRoom([{...x.room,map:x.room.map.map(row=>row.replaceAll('w','.'))}],0,x.tape);assert.ok(!r.exited&&r.deaths>0);probes.push({name:'authored route without water columns',exited:r.exited,deaths:r.deaths});assert.ok(whole.events.some(e=>e.type==='condenser'&&(whole.log[e.i]?.st==='climb'||whole.log[e.i-1]?.st==='climb')),'Court route must activate a condenser from a hanging position');}
 let worldInteractions;
 if(id===111){
  assert.deepEqual(authored.verification.stages,x.verification.stages,'Cliffs stage/source parity');
  // each save turns the cliff back; every blue ledge stood on was reached by a dash that turned it
  const g=Core.createGame([x.room]);let blueLandings=0;
  for(const k of expand(x.tape)){Core.step(g,keysToInput(k));for(const e of g.events){if(e.type==='core-checkpoint')assert.equal(g.phase,0,'a save turns the cliff back');if(e.type==='land'){const c=Math.floor((g.p.x+4)/8),r=Math.floor((g.p.y+g.p.h)/8);if(x.room.map[r]?.[c]==='B')blueLandings++;}}g.events.length=0;}
  assert.ok(blueLandings>=8,'route stands on at least eight blue ledges');
  for(const[label,room]of [['without rings',{...x.room,map:x.room.map.map(row=>row.replaceAll('O','.'))}],['without blue ledges',{...x.room,map:x.room.map.map(row=>row.replaceAll('B','.'))}]]){const r=runRoom([room],0,x.tape);assert.ok(!r.exited&&r.deaths>0,label);probes.push({name:label,exited:r.exited,deaths:r.deaths});}
  worldInteractions={blueLandings,hooks:counts.hook,turns:counts.phase};
 }
 if(id===113){
  assert.deepEqual(authored.verification.stages,x.verification.stages,'Colony stage/source parity');
  const g=Core.createGame([x.room]),Wt=globalThis.BladefallPrecisionWatch;let shelteredFrames=0;
  for(const k of expand(x.tape)){Core.step(g,keysToInput(k));const p=g.p,pts=[[p.x+4,p.y+1],[p.x+4,p.y+5],[p.x+4,p.y+10]];if(Wt.hidden(g,p)&&g.lights.some(l=>pts.some(([px,py])=>Wt.inCone(g,l,px,py))))shelteredFrames++;g.events.length=0;}
  assert.ok(shelteredFrames>=6,'the route shelters in smoke while a lamp looks at it');
  for(const[label,room]of [['without smoke',{...x.room,map:x.room.map.map(row=>row.replaceAll('S','.'))}]]){const r=runRoom([room],0,x.tape);assert.ok(!r.exited&&r.deaths>0,label);probes.push({name:label,exited:r.exited,deaths:r.deaths});}
  worldInteractions={shelteredFrames,lamps:x.room.lights.length,glimpses:counts.glimpse||0};
 }
 if(id===114){
  assert.deepEqual(authored.verification.stages,x.verification.stages,'Path stage/source parity');
  assert.ok((counts.mirror||0)>=6,'every section turns its mirror');
  for(const[label,room]of [['without louvres (the sun never stops)',{...x.room,map:x.room.map.map(row=>row.replaceAll('X','.'))}],['mirrors left untouched',{...x.room,map:x.room.map}]].slice(0,1)){const r=runRoom([room],0,x.tape);assert.ok(!r.exited&&r.deaths>0,label);probes.push({name:label,exited:r.exited,deaths:r.deaths});}
  worldInteractions={mirrors:counts.mirror,beams:x.room.beams.length,louvres:x.room.shutters.length};
 }
 if(id===115){
  assert.deepEqual(authored.verification.stages,x.verification.stages,'Sunspire stage/source parity');
  // every crossing is a portal pass that rises: the knight leaves the far pit upward, onto a higher floor
  const g=Core.createGame([x.room]),rises=[];
  for(const k of expand(x.tape)){Core.step(g,keysToInput(k));for(const e of g.events)if(e.type==='portal-pass'&&e.kind==='knight')rises.push(Math.round(g.p.vy));g.events.length=0;}
  assert.ok(rises.filter(v=>v<=-150).length>=6,'six crossings leave a floor door fast and upward');
  for(const[label,room]of [['without portal stone',{...x.room,map:x.room.map.map(row=>row.replaceAll('%','#'))}]]){const r=runRoom([room],0,x.tape);assert.ok(!r.exited,label);probes.push({name:label,exited:r.exited,deaths:r.deaths});}
  worldInteractions={crossings:rises.length,exitSpeeds:rises,lightWalls:x.room.beams.length};
 }
 if(id===112){
  assert.deepEqual(authored.verification.stages,x.verification.stages,'Shores stage/source parity');
  const g=Core.createGame([x.room]);let swimFrames=0,rideFrames=0;
  for(const k of expand(x.tape)){Core.step(g,keysToInput(k));if(g.p.swimming)swimFrames++;if(g.p.onGround&&g.ents.some(e=>e.type==='float'&&e.y<e.homeY&&Math.abs(g.p.y+g.p.h-e.y)<1&&g.p.x+g.p.w>e.x&&g.p.x<e.x+e.w))rideFrames++;g.events.length=0;}
  assert.ok(swimFrames>=60,'the route swims the drowned thorn fields');assert.ok(rideFrames>=60,'the route rides floats on a rising sea');
  for(const[label,room]of [['without the tides',{...x.room,tides:[]}]]){const r=runRoom([room],0,x.tape);assert.ok(!r.exited&&r.deaths>0,label);probes.push({name:label,exited:r.exited,deaths:r.deaths});}
  worldInteractions={swimFrames,rideFrames,tides:x.room.tides.length};
 }
 let deeplineInteractions;
 if(id===110){
  assert.deepEqual(authored.verification.stages,x.verification.stages,'Deep Line stage/source parity');
  // every cart ride must end with an airborne departure that carries real speed out over the gap
  const g=Core.createGame([x.room]),departures=[];let riding=false;
  for(const k of expand(x.tape)){Core.step(g,keysToInput(k));const on=g.ents.some(e=>e.type==='cart'&&!e.gone&&g.p.y+g.p.h===e.y&&g.p.x<e.x+e.w&&g.p.x+g.p.w>e.x);if(riding&&!on)departures.push({frame:g.frame,vx:Math.round(g.p.vx),x:Math.round(g.p.x),y:Math.round(g.p.y)});riding=on;g.events.length=0;}
  assert.ok(departures.length>=5,'Deep Line route leaves at least five carts');
  for(const[label,room]of [['without carts',{...x.room,map:x.room.map.map(row=>row.replaceAll('C','.'))}],['without seeds',{...x.room,map:x.room.map.map(row=>row.replaceAll('b','.'))}],['without switches',{...x.room,map:x.room.map.map(row=>row.replaceAll('k','.'))}]]){const r=runRoom([room],0,x.tape);assert.ok(!r.exited&&r.deaths>0,label);probes.push({name:label,exited:r.exited,deaths:r.deaths});}
  deeplineInteractions={cartDepartures:departures};
 }
 let throneInteractions;
 if(id===109){
  assert.deepEqual(authored.verification.stages,x.verification.stages,'Throne stage/source parity');
  const g=Core.createGame([x.room]),transfers=[];let saves=0,wakeFrames=0;
  for(const k of expand(x.tape)){Core.step(g,keysToInput(k));if(g.wake?.shade)wakeFrames++;
   for(const e of g.events){if(e.type==='echo-swap'){assert.ok(g.p.vy<=-150,'each exchange carries a real upward launch');assert.ok(e.fy-e.y>=16,'each exchange gains authored height');transfers.push({frame:g.frame,from:[e.fx,e.fy],to:[e.x,e.y],vy:g.p.vy});}if(e.type==='core-checkpoint'){saves++;assert.equal(g.echo,null,'each new save releases the previous echo');assert.ok(!g.ents.some(e=>e.type==='echo'));}}g.events.length=0;
  }
  assert.equal(transfers.length,6);assert.equal(saves,5);assert.ok(wakeFrames>1000,'wake remains active through most of the route');
  for(const[label,room]of [['without echoes',{...x.room,echo:false}],['without anvils',{...x.room,map:x.room.map.map(row=>row.replaceAll('N','.'))}],['without seeds',{...x.room,map:x.room.map.map(row=>row.replaceAll('b','.'))}]]){const r=runRoom([room],0,x.tape);assert.ok(!r.exited&&r.deaths>0,label);probes.push({name:label,exited:r.exited,deaths:r.deaths});}
  throneInteractions={upwardEchoTransfers:transfers,wakeFrames,echoClearingSaves:saves};
 }
 let citadelInteractions;
 if(id===108){
  const g=Core.createGame([x.room]),crossed=new Set(),spent=new Set(),walls=g.ents.filter(e=>e.type==='foothold'&&e.h>8).map(e=>e.id);
  for(const k of expand(x.tape)){Core.step(g,keysToInput(k));for(const e of g.ents)if(e.type==='foothold'&&e.gone){spent.add(e.id);if(e.h>8&&Core.overlap(g.p.x,g.p.y,g.p.w,g.p.h,e.x,e.y,e.w,e.h))crossed.add(e.id);}g.events.length=0;}
  assert.equal(spent.size,13,'all thirteen authored footholds are spent');assert.equal(walls.length,11);assert.equal(crossed.size,11,'route passes through all eleven walls after spending them');
  for(const [label,room]of [['permanent footholds',{...x.room,map:x.room.map.map(row=>row.replaceAll('Y','#'))}],['without refills',{...x.room,map:x.room.map.map(row=>row.replaceAll('o','.'))}]]){const r=runRoom([room],0,x.tape);assert.ok(!r.exited&&r.deaths>0,label);probes.push({name:label,exited:r.exited,deaths:r.deaths});}
  citadelInteractions={spentFootholds:spent.size,vanishedWallsTraversed:crossed.size};
 }
 let inversionInteractions;
 if(id===107){
  const g=Core.createGame([x.room]),ceilings=new Set(),prisms=new Set();let invertedPods=0;
  for(const k of expand(x.tape)){Core.step(g,keysToInput(k));
   if(g.flipped&&g.p.onGround)for(const e of g.ents)if(e.type==='crumble'&&!e.gone&&Math.abs(g.p.y+g.p.h-e.y)<1&&g.p.x+g.p.w>e.x&&g.p.x<e.x+e.w)ceilings.add(e.id);
   for(const e of g.events){if(e.type==='gravity')prisms.add(e.x+','+(e.flipped?g.room.h-e.y:e.y));if(e.type==='pod'&&g.flipped)invertedPods++;if(e.type==='core-checkpoint')assert.ok(!g.flipped,'save is earned upright');}g.events.length=0;
  }
  assert.equal(prisms.size,12,'all twelve distinct prisms are used');assert.equal(ceilings.size,6,'each of the six cracked ceiling landings is used');assert.ok(invertedPods>=2,'two seed cuts while inverted');
  for(const [label,room]of [['without prisms',{...x.room,map:x.room.map.map(row=>row.replaceAll('Q','.'))}],['without seeds',{...x.room,map:x.room.map.map(row=>row.replaceAll('b','.'))}]]){const r=runRoom([room],0,x.tape);assert.ok(!r.exited&&r.deaths>0,label);probes.push({name:label,exited:r.exited,deaths:r.deaths});}
  inversionInteractions={distinctPrisms:prisms.size,crackedCeilingLandings:ceilings.size,invertedSeedCuts:invertedPods};
 }
 let foundryInteractions;
 if(id===106){
  const anvils=new Set(whole.events.filter(e=>e.type==='anvil').map(e=>e.x+','+e.y));
  assert.equal(anvils.size,9,'Foundry route must use all nine distinct anvils');
  const castGroups=[[48,94],[102,72],[77,37],[46,11],[124,7]];
  for(const[c,r]of castGroups)assert.ok(whole.events.some(e=>e.type==='cast'&&e.x>=c*8&&e.x<(c+4)*8&&e.y===r*8+4),'Foundry route makes each airborne casting group');
  for(const[label,room]of [['without anvils',{...x.room,map:x.room.map.map(row=>row.replaceAll('N','.'))}],['without casting frames',{...x.room,map:x.room.map.map(row=>row.replaceAll('U','.'))}]]){
   const r=runRoom([room],0,x.tape);assert.ok(!r.exited&&r.deaths>0,label);probes.push({name:label,exited:r.exited,deaths:r.deaths});
  }
  let openingProbes=0,reachedFirstSave=0;
  for(const run of [0,6,12,18,24])for(const jump of [6,12,18,24])for(const dash of ['rx','rux','ux'])for(const at of [0,6,12,18,24]){
   const g=Core.createGame([x.room]);for(let f=0;f<200;f++){Core.step(g,keysToInput(f<run?'r':f<run+jump?'rj':f===run+jump+at?dash:'r'));if(g.deaths)break;if(g.coreRun.index>=0){reachedFirstSave++;break;}g.events.length=0;}openingProbes++;
  }
  assert.equal(reachedFirstSave,0,'ordinary run/jump/dash samples must not skip the opening iron climb');
  foundryInteractions={distinctAnvils:anvils.size,castingGroups:castGroups.length,ordinaryOpeningProbes:openingProbes,reachedFirstSave};
 }
 let heatInteractions;
 if(id===105){
  const g=Core.createGame([x.room]),gripped=new Set(),glassEntries=new Set();
  for(const k of expand(x.tape)){const y=g.p.y;Core.step(g,keysToInput(k));const p=g.p;
   for(const s of g.slabs){
    if(p.state==='climb'&&s.state==='stone'&&p.y+p.h>s.y&&p.y<s.y+s.h&&(Math.abs(p.x+p.w-s.x)<1||Math.abs(p.x-s.x-s.w)<1))gripped.add(s.id);
    if(s.state==='glass'&&p.vy<0&&p.x+p.w>s.x&&p.x<s.x+s.w&&y>=s.y+s.h&&p.y<s.y+s.h)glassEntries.add(s.id);
   }g.events.length=0;
  }
  assert.ok(gripped.size>=7,'Ember route must grip seven distinct cooling columns');assert.ok(glassEntries.size>=2,'Ember route must enter both glass gates from below');
  for(const [label,room]of [['no heated columns',{...x.room,map:x.room.map.map(row=>row.replaceAll('E','.'))}],['permanently stone slabs',{...x.room,slabs:x.room.slabs.map(()=>({stone:100000,molten:1,glass:1,offset:0}))}]]){const r=runRoom([room],0,x.tape);assert.ok(!r.exited&&r.deaths>0,label);probes.push({name:label,exited:r.exited,deaths:r.deaths});}
  heatInteractions={stoneColumnsGripped:gripped.size,glassGatesEnteredFromBelow:glassEntries.size};
 }
 const proof={room:x.room.id,status:x.bank.localOnly?'Native route verified; local draft awaiting integration and player review':'Native route verified; integrated as a playable Core draft awaiting player review',whole:{frames:whole.exitFrame+1,deaths:0,eventCounts:counts,minimumStamina:Math.min(...whole.log.map(t=>t.st2))},freshParts:parts,probes,...(heatInteractions?{heatInteractions}:{}),...(foundryInteractions?{foundryInteractions}:{}),...(inversionInteractions?{inversionInteractions}:{}),...(citadelInteractions?{citadelInteractions}:{}),...(throneInteractions?{throneInteractions}:{}),...(deeplineInteractions?{deeplineInteractions}:{}),...(worldInteractions?{worldInteractions}:{}),limits:'These authored-route and basic bypass probes are not exhaustive path search. No live browser or human completion claimed.'};writeFileSync(`docs/room-bank/${name}-expansion-proof.json`,JSON.stringify(proof,null,2)+'\n');console.log(`PASS ${name}: whole ${proof.whole.frames}f; fresh ${parts.join('/')}; author parity; ${probes.length} sensitivity/bypass probes.`);
}
