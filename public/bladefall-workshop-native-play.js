/* Native Explore co-op over the builder's authenticated relay. No campaign networking or saves. */
(function(root){
'use strict';
const allowed=new Set(['input','snapshot','p','w','earlyReturn','precisionAction','precisionState','upIntent','slamIntent','caps','zoneSync','teleport','coopWipe','attack','enemyHit','combatIntent','enemyKill','enemyDead','down','revive','interact','travelerIntent','remixIntent']);
let current=null;
function stop(){if(!current)return;current.engine?.stop();current=null;root.netTeardown?.();const g=root.BladefallWorkshopExploreRuntime?.state();if(g)g.coopSession=false;}
function start({document,role,connected,send}){
 if(document.mode==='ascend')return startAscend({document,role,connected,send});
 if(document.mode!=='explore')throw Error('Unknown shared play mode.');
 stop();const runtime=root.BladefallWorkshopExploreRuntime;runtime.start(document.definition);
 const c=current={document,role,send,localDone:false,remoteDone:false,connected};
 const N=root.__NET,g=runtime.state();N.role=role;N.code=null;N.status=connected?'connected':'waiting';N.stageSeed=g.stageSeed;N.inputSeq=0;N.sessionToken=null;
 N.conn={open:connected,send:packet=>{if(current===c)c.send(packet);},close(){this.open=false;}};
 root.netInitProtocol(role);g.coopSession=true;g.levelSelectMode=true;g.worldProgressEligible=g.leaderboardEligible=false;root.netResetGhost();
 if(!connected)runtime.pause();return c;
}
function startAscend({document,role,connected,send}){
 const V=root.BladefallPrecisionView,definition=root.BladefallWorkshopAscend.compile(document.definition);
 stop();const c={document,role,send,connected};
 c.engine=root.BladefallWorkshopAscendPlay.create({definition,role,send:packet=>{if(current===c&&c.connected)send(packet);},onFrame:s=>{
  s.g.workshop=true;s.g.p=s.g.players[role==='host'?0:1];V.workshopFrame(s.g);
 },onComplete:()=>{if(current===c)root.BladefallWorkshopBridge.complete();},onError:message=>{c.connected=false;V.view.paused=true;root.parent.postMessage({type:'bladefall-workshop-error',message},root.location.origin);}});
 current=c;const g=c.engine.state().simulation.g;g.workshop=true;g.p=g.players[role==='host'?0:1];V.view.g=g;V.view.replay=null;V.view.wipe=0;V.view.wipeTo=null;V.view.frameAcc=0;V.view.camRoom=null;V.view.trail=[];V.view.mode='play';V.view.paused=!connected;const overlay=root.document?.getElementById('pcOverlay');overlay?.classList.remove('show');if(overlay)overlay.innerHTML='';V.clearInput();
 if(connected)c.engine.ready();return c;
}
function tick(input){const c=current;if(c?.document.mode!=='ascend')return false;if(c.connected)c.engine.tick(input);return true;}
function retry(){if(current?.document.mode!=='ascend')return false;if(current.connected){current.engine.requestRetry();root.BladefallPrecisionView.view.paused=false;}return true;}
function finish(){const c=current;if(!c||!c.connected)return false;if(!c.localDone){c.localDone=true;c.send({workshop:'finished'});}if(c.remoteDone){root.BladefallWorkshopExploreRuntime.pause();root.BladefallWorkshopBridge.complete();}return true;}
function receive(packet){const c=current;if(!c||!c.connected||!packet||typeof packet!=='object')return;
 if(c.engine){c.engine.receive(packet);if(c.engine.state().connected&&(packet.ascend==='retry'&&c.role==='host'||packet.ascend==='frame'&&packet.retry===true&&c.role==='guest'))root.BladefallPrecisionView.view.paused=false;return;}
 if(packet.workshop==='finished'){c.remoteDone=true;if(c.localDone){root.BladefallWorkshopExploreRuntime.pause();root.BladefallWorkshopBridge.complete();}return;}
 const type=packet.type||packet.t;if(!allowed.has(type))return;
 root.netOnMessage(packet);
}
function disconnected(){if(!current)return;current.connected=false;if(current.engine){current.engine.stop();root.BladefallPrecisionView.view.paused=true;return;}if(root.__NET?.conn)root.__NET.conn.open=false;root.BladefallWorkshopExploreRuntime.pause();}
root.BladefallWorkshopNativePlay={start,stop,receive,tick,retry,complete:finish,disconnected,state:()=>current};
})(globalThis);
