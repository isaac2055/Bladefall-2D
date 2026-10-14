/* Shared native Ascend simulation. Extension rooms are gated until their actor hooks are adapted. */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore;
const fields=new Set(['id','name','hint','cols','rows','map','exit','exitSpan','side','movement','aim8','dashes','lock','study','zips','palette','slabs','winds','beams','beamsHarmless','shutters','currents','tide','tides','thaw','decks','portalMode','portals','foes','combat','hingeArms','fault','lights','jailers','impulseSeeds','vectorRefills','stepRelays','recoilPlatforms','lines','movingHooks','mirror','shade','echo','wake','reaim','cargoClasps','coreCheckpoints','spentThorns','sweepers','companion','question','rbr','breathing','slick','rescueHoist','rescueEscort','cargoDock','oathRoot','resinWind','lashes','rootCrown','windVanes','weightCircuits','sunStructures','sentinel','chainHydra','colossus','warden','marksman','sorcerer','tyrant','crown','alarm','hand','court','dayKing','hydraRide','gardenShade','bearingLifts','wardenBreaks','anvilSleds','wardenFloor','dropThru','counterweightFlow','hearths','people','decor','origin','bankOrigin','bank','campaignImport','bearing','sideQuest','quest','crate','tideGauge','showHintAtRest','retiredChallenge','watchClarity','core','coreProgressKey','coreProgressRevision','coreProgressMigrations','crumbleExtraFrames','cameraZones','superFractured','echoDuel','curtain','vesper','seam','doors','entry','returns','passage','secret','connector','entryBridge','closeWhilePlayed','atlasSockets','atlasJunction','atlasMain','atlasRegion','atlasRoads','atlasDecks','atlasFloor','atlasGate','atlasTransit','atlasMouth','campaignWalk']);
const glyphs=new Set('.#=^v<>%!Pocbxs*l_ABKZGHM~EIfN{}UYXwnFOC-()kQTVSR|/\\'.split(''));
function unsupported(def){
 const reasons=Object.keys(def).filter(k=>!fields.has(k));
 for(const ch of new Set(def.map.join('')))if(!glyphs.has(ch))reasons.push('tile '+ch);
 if(def.map.some(row=>row.includes('Q'))&&(def.tide||def.map.some(row=>/[wn]/.test(row))))reasons.push('gravity prisms with water (unsupported by native physics)');
 return reasons;
}
function actors(g){
 const second=C().createGame([g.room.def]).p;
 second.x=g.p.x;second.y=g.p.y;second.facing=g.p.facing;
 if(g.p.state==='respawn'){second.state='respawn';second.respawnTimer=g.p.respawnTimer;}
 g.players=[g.p,second];C().devCall('sharedReady',g);return g.players.map(p=>({p,prev:{},buf:{jump:0,dash:0,grab:0,strike:0},exited:false}));
}
function create(def){
 const missing=unsupported(def);if(missing.length)throw Error('Shared Ascend support is still being added for: '+missing.join(', '));
 const g=C().createGame([def]);return {g,actors:actors(g),complete:false,epoch:0};
}
function bind(g,a){g.p=a.p;g.prev=a.prev;g.buf=a.buf;g.exited=a.exited;}
function step(s,inputs=[{},{}]){
 if(s.complete)return;const g=s.g,frozen=g.freeze>0;inputs=inputs.map((input,i)=>s.actors[i]?.exited?{}:input);g.coopInputs=inputs;
 const active=keys=>inputs.some(input=>keys.some(key=>input?.[key]&&!g.room.def.lock?.includes(key)));
 const waking=active(['l','r','u','d','jump','dash','grab','strike','parry']);
 g.coopInputActive=waking||active(['portal']);
 if(!frozen&&!g.awake&&waking)g.awake=true;
 const first=s.actors.findIndex(a=>!a.exited&&a.p.state!=='dead'&&a.p.state!=='respawn'),order=first===1?[1,0]:[0,1];
 let turn=0;for(const i of order){
  const a=s.actors[i];if(a.exited)continue;g.coopActor=i;bind(g,a);C().step(g,inputs[i]||{},{secondary:turn++>0,frozen});
  // A native respawn rebuilds the single shared room, including both knights.
  if(g.p!==a.p){s.actors=actors(g);s.epoch++;s.complete=false;g.coopActor=null;bind(g,s.actors[0]);return;}
  a.prev=g.prev;a.buf=g.buf;a.exited=g.exited;if(a.exited)park(a.p);
 }
 g.coopActor=null;bind(g,s.actors[0]);if(!frozen){root.BladefallPrecisionCombat?.afterPlayers?.(g);root.BladefallPrecisionFoes?.afterPlayers?.(g);root.BladefallPrecisionPortals?.afterPlayers?.(g);C().devCall('afterPlayers',g);}
 for(const a of s.actors)if(a.p.state==='dead')a.exited=false;
 s.complete=s.actors.every(a=>a.exited);g.exited=s.complete;
}
// Use native nonparticipating respawn state, without advancing its timer, while waiting.
// Keep the exit pose for the local camera; this actor no longer runs movement or attacks.
function park(p){
 if(p.carrying){p.carrying.held=false;p.carrying=null;}
 Object.assign(p,{waitingForPartner:true,state:'respawn',respawnTimer:10,vx:0,vy:0,onGround:false,hook:null,ride:null,strikeTimer:0,parryTimer:0,dashTimer:0});
}
function retry(s){const g=s.g;C().resetRoom(g);s.actors=actors(g);for(const p of g.players){p.state='normal';p.respawnTimer=0;}s.epoch++;s.complete=false;g.coopActor=null;bind(g,s.actors[0]);}
root.BladefallWorkshopAscendCoopCore={create,step,retry,unsupported};
})(globalThis);
