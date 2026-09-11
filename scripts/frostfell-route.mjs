// Browser-side scenarios run through the existing TAS frame API.
// Only initial loading and the explicitly isolated Counter fixture set up state.

export function initialRoute(campaign=false){
tasPrepareRun();
if(campaign){G=null;meta.capabilities=BFCapabilitiesModule.createState({acquired:['counter']});meta.world=BFWorldModule.createProgress({current:'warden',visited:['warden'],cleared:['warden']});}
tasDeterministicCall(()=>beginRun(0,null,{hp:1,dmg:1},{startStage:7,levelSelect:!campaign,testRun:!campaign,runSeed:0xF2057}));
if(campaign)G.p.weapon=startWeapon();
const tas=window.__BF.tas;
function drive(x,max=2000){for(let i=0;i<max&&Math.abs(G.p.x-x)>15&&!G.p.dead;i++)tas.stepFrames(1,{right:x>G.p.x,left:x<G.p.x,attack:i%30===0,counter:i%45===0});}
drive(2240);tas.stepFrames(1,{interact:true});tas.stepFrames(1,{});drive(4420);tas.stepFrames(180,{});drive(5180);tas.stepFrames(40,{});tas.saveState('works');
return {player:tas.getPlayerState(),screen:{VW,VH,GROUND_Y},renderer:BFRenderer&&Object.keys(BFRenderer),circuits:G.persistentCircuits};

}

export function thermalRoute(){
const tas=window.__BF.tas;tas.restoreState('works');
const trace=[];let placed=false;
for(let i=0;i<600&&!G.p.dead;i++){
 const target=G.p.onWall&&G.p.wallObj?.x===5500&&G.p.y>=60&&G.p.y<=125;
 tas.stepFrames(1,{right:true,jump:i%45<22,portal:target});
 if(i%20===0)trace.push({x:G.p.x,y:G.p.y,onWall:G.p.onWall,wall:G.p.wallObj?.x});
 if(target&&G.cratePortals.length){placed=true;break;}
}
const mouth=JSON.parse(JSON.stringify(G.cratePortals));
tas.stepFrames(360,{});tas.saveState('signal');
return {placed,mouth,open:circuitOpen('frost-thermal'),player:tas.getPlayerState(),trace,projectiles:G.projectiles.map(pr=>({x:pr.x,y:pr.y,el:pr.el,owner:pr.owner,hops:pr.portalHops,air:pr._bfAirReactions})),receiver:G.obstacles.find(o=>o.frostThermalReceiver)};

}

export function rewardRoute(){
const tas=window.__BF.tas;tas.restoreState('signal');
const trace=[];let teleported=false;
// Leave the resting mouth, then approach it again from below.
tas.stepFrames(18,{left:true});tas.stepFrames(3,{});
for(let i=0;i<1000&&G.p.x<7240&&!G.p.dead;i++){
 const jump=G.p.x<5650&&i%45<24;
 const before=G.p.x;tas.stepFrames(1,{right:true,jump});
 if(G.p.x-before>150)teleported=true;
 if(i%90===0)trace.push({x:G.p.x,y:G.p.y});
}
tas.stepFrames(10,{left:true});tas.stepFrames(35,{});
const before=tas.getPlayerState();tas.stepFrames(1,{interact:true});tas.stepFrames(1,{});
tas.saveState('reward');
return {teleported,trace,before,after:tas.getPlayerState(),doubleJump:hasCapability('double-jump'),candidate:outskirtsInteractionCandidate()?.kind,circuits:G.persistentCircuits};

}

export function galleryRoute(){
const tas=window.__BF.tas;tas.restoreState('reward');
const trace=[];
function go(x,max=400){for(let i=0;i<max&&Math.abs(G.p.x-x)>6;i++)tas.stepFrames(1,{right:G.p.x<x,left:G.p.x>x});tas.stepFrames(12,{});}
function leap(x,max=100){for(let i=0;i<max;i++){
 tas.stepFrames(1,{right:G.p.x<x-7,left:G.p.x>x+7,jump:i<20||(i>=22&&i<65)});
 if(i%10===0)trace.push({i,x:G.p.x,y:G.p.y,ground:G.p.onGround,jumps:G.p.jumps,max:G.p.maxJumps});
 if(i>25&&G.p.onGround&&G.p.y>100)return true;
}return false;}
go(7370);const first=leap(7520);tas.stepFrames(10,{});tas.saveState('first-gallery');
go(7510);const second=leap(7320);tas.stepFrames(20,{});
const before=tas.getPlayerState();tas.stepFrames(1,{interact:true});tas.stepFrames(1,{});
tas.saveState('returned');
return {first,second,trace,before,after:tas.getPlayerState(),shortcut:persistentCircuitOpen('frost-service')};

}

export function optionalAndRevisit(){
const tas=window.__BF.tas;tas.restoreState('first-gallery');const trace=[];
for(let i=0;i<150&&G.p.x<7760;i++)tas.stepFrames(1,{right:true});
let landed=false;
for(let i=0;i<120;i++){tas.stepFrames(1,{right:G.p.x<8100,jump:i<20||(i>=22&&i<65)});if(i%20===0)trace.push({x:G.p.x,y:G.p.y});if(i>25&&G.p.onGround&&G.p.y===210){landed=true;break;}}
for(let i=0;i<150&&G.p.x<8070;i++)tas.stepFrames(1,{right:true});tas.stepFrames(25,{});tas.stepFrames(1,{interact:true});
const relic=G.obstacles.find(o=>o.sealedRecollection==='frostfell');
const optional={landed,trace,player:tas.getPlayerState(),relic:{x:relic.x,y:relic.y,found:relic.found,read:relic.read},mode};
mode='play';showOverlay(false);tas.restoreState('returned');
tas.saveState('identity');tas.stepFrames(10,{});const first=tas.saveState('a');tas.restoreState('identity');tas.stepFrames(10,{});const replay=tas.saveState('b');
captureCurrentZonePersistence();loadStage(7);tas.stepFrames(2,{});
return {optional,replayIdentical:first===replay,revisit:{player:tas.getPlayerState(),nim:G.npcs.map(n=>({x:n.x,done:n.done})),gates:G.obstacles.filter(o=>o.frostGate).map(o=>({id:o.circuit,open:doorOpen(o)})),hearths:G.obstacles.filter(o=>o.frostBrazier).map(o=>o.lit),shortcut:persistentCircuitOpen('frost-service'),doubleJump:hasCapability('double-jump')}};

}

export function counterCheck(){
const tas=window.__BF.tas;
// Isolated real enemy timing check, separate from the uninterrupted route.
const e=G.enemies.find(e=>e.wardenRole==='turnkey');
Object.assign(G.p,{x:1900,y:0,vx:0,vy:0,face:1,invuln:0,onGround:true,blood:5,hp:100,counterCd:0});
Object.assign(e,{x:1938,y:0,vx:0,vy:0,active:true,dead:false,wardenState:'windup',wardenStateT:.05,wardenCommitDir:-1,wardenCooldown:2,counterStunT:0});
const before=G.p.blood;let stunned=false;const trace=[];
tas.stepFrames(1,{counter:true,right:true});
for(let i=0;i<18;i++){tas.stepFrames(1,{});if(e.counterStunT>0)stunned=true;trace.push({i,x:G.p.x,ex:e.x,face:G.p.face,ct:G.p.counterT,cc:G.p.counterCd,st:e.wardenState,b:G.p.blood});}
return {trace,stunned,unhurt:G.p.blood===before,enemyState:e.wardenState,player:tas.getPlayerState()};

}

export function finaleRoute(){
const tas=window.__BF.tas;tas.restoreState('reward');
for(let i=0;i<700&&G.p.x<8835;i++)tas.stepFrames(1,{right:true});tas.stepFrames(30,{});
const targets=G.obstacles.filter(o=>Number.isInteger(o.frostFinaleLanding)).sort((a,b)=>a.frostFinaleLanding-b.frostFinaleLanding);const log=[],winningInputs=[];tas.saveState("frost-finale-start");
function steer(x){const e=x-G.p.x-G.p.vx*.13;return {right:e>3,left:e< -3};}
let previous={x:8840,w:320,y:0};
for(const target of targets){
 tas.saveState('from');let solved=false;
 for(const launchInset of [20,40,5,65]){for(const secondAt of [22,18,26,30,34]){
 tas.restoreState('from');const blood=G.p.blood;const sequence=[];
 const edge=previous.x+previous.w/2-launchInset;
 for(let i=0;i<180&&G.p.onGround&&Math.abs(G.p.x-edge)>7;i++){const input={right:G.p.x<edge,left:G.p.x>edge+8};tas.stepFrames(1,input);sequence.push(input);}
 for(let i=0;i<120;i++){
 const aim=target.frostFinaleLanding===19?14100:target.x-(target.w>200?55:10);
 const input={...steer(aim),jump:i<14||(i>=secondAt&&i<secondAt+24)};
 tas.stepFrames(1,input);sequence.push(input);
 if(G.p.dead||G.p.blood<blood||G.p.y<previous.y-400)break;
 if(i>10&&G.p.onGround&&Math.abs(G.p.y-target.y)<.1&&Math.abs(G.p.x-target.x)<target.w/2){solved=true;log.push({id:target.frostFinaleLanding,x:G.p.x,y:G.p.y,secondAt,launchInset,frames:sequence.length,blood:G.p.blood});break;}
 }
 if(solved){winningInputs.push(...sequence);break;}
 }if(solved)break;}
 if(!solved){return {pass:false,failed:target.frostFinaleLanding,log,p:tas.getPlayerState(),previous};}
 if([4,9,14].includes(target.frostFinaleLanding))tas.saveState("frost-rest-"+target.frostFinaleLanding);
 previous=target;
}
tas.saveState('summit');
const final=tas.getPlayerState();tas.restoreState('frost-finale-start');for(const input of winningInputs)tas.stepFrames(1,input);
const replayIdentical=JSON.stringify(final)===JSON.stringify(tas.getPlayerState());
const recoveries=[];
for(const id of [4,9,14]){
 tas.restoreState('frost-rest-'+id);const platform=G.obstacles.find(o=>o.frostFinaleLanding===id),before=G.p.blood,ck={x:G.p.ckX,y:G.p.ckY};
 // Walk into the next chasm without jumping, then brake in the gap.
 const gap=platform.x+platform.w/2+35;
 for(let i=0;i<240&&G.p.blood===before;i++)tas.stepFrames(1,steer(gap));
 recoveries.push({id,checkpoint:ck,bloodLost:before-G.p.blood,returned:Math.abs(G.p.x-ck.x)<40&&Math.abs(G.p.y-ck.y)<65});
}
tas.restoreState('summit');for(let i=0;i<250&&G.p.x<14400;i++)tas.stepFrames(1,{right:true});tas.stepFrames(25,{});
const before={enemies:G.enemies.length,circuits:JSON.stringify(G.persistentCircuits)};
tas.stepFrames(2,{});
const inert=before.enemies===G.enemies.length&&before.circuits===JSON.stringify(G.persistentCircuits);
tas.saveState('muster-engine');
for(let i=0;i<180&&G.p.x<14660;i++)tas.stepFrames(1,{right:true});tas.stepFrames(20,{});tas.stepFrames(1,{interact:true});tas.stepFrames(1,{});
return {pass:replayIdentical&&recoveries.every(r=>r.returned&&r.bloodLost===1)&&inert&&Math.abs(G.p.x-1330)<3,log,frames:winningInputs.length,replayIdentical,recoveries,inert,returned:tas.getPlayerState(),summit:final,inputs:winningInputs};

}
