/* Native Explore integration. The parent campaign stays paused while a separate frame tests drafts. */
(function(root){
'use strict';
function create(api){
 let baseline=null,captureError=null,definition=null;
 const A=()=>root.BladefallWorkshopExplore,M=()=>root.BladefallWorkshopModel;
 function loaded(){
  const g=api.state();if(!g)return;
  if(definition){
   const level=A().compile(definition,{nativeRoot:g});
   Object.assign(g,level.context||{});g.workshopBlank=!!level.blank;
   for(const key of [...A().collections,'boss','portal','stageIndex','levelLength','killGoal'])g[key]=level[key];
   g.p.x=g.p.ckX=level.start.x;g.p.y=g.p.ckY=level.start.y;g.p.ckSet=true;g.p.vx=g.p.vy=0;g.p.floorPlat=null;
   g.leaderboardEligible=g.worldProgressEligible=false;g.usedTestMode=true;g.workshop=true;g.levelSelectMode=true;g.coopSession=false;g.bossRush=null;
   api.rebuild();return;
  }
  try{baseline=A().fromState(g);captureError=null;}catch(e){baseline=null;captureError=e;}
 }
 function loadBlank(){if(!definition)return false;const level=A().compile(definition);if(!level.blank)return false;loaded();api.blankLoadout?.(level.kit||'full');return true;}
 function capture(){if(captureError)throw captureError;if(!baseline)loaded();if(captureError)throw captureError;return M().json(baseline);}
 function captureSource(index){if(!root.BLADEFALL_WORKSHOP_SOURCE)throw Error('Source loading requires an isolated catalogue frame.');if(!Number.isInteger(index)||!api.stages()[index])throw Error('Unknown Explore level.');definition=null;baseline=null;captureError=null;api.begin(index);api.pause();return capture();}
 function start(def){const level=A().compile(def);if(!api.stages()[level.stageIndex])throw Error('This Explore stage is unavailable.');definition=M().json(def);api.begin(level.stageIndex);}
 function retry(){if(definition)start(definition);}
 function changingStage(i){if(definition&&i!==A().compile(definition).stageIndex){complete();return true;}return false;}
 function complete(){if(!definition)return false;if(root.BladefallWorkshopNativePlay?.complete())return true;api.pause();root.BladefallWorkshopBridge.complete();return true;}
 return {drawWorkshop:api.drawWorkshop,loaded,loadBlank,capture,captureSource,start,retry,changingStage,complete,pause:api.pause,resume:api.resume,state:api.state,stages:api.stages};
}
root.BladefallWorkshopExploreRuntimeFactory={create};
})(globalThis);
