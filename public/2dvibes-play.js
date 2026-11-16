// Only published challenge IDs can select an in-game route.
const challenge = new URLSearchParams(location.search).get('challenge');
if (challenge === 'outskirts-v1') {
  document.querySelector('#game').src = '/?timeTrial=0';
}
(()=>{const frame=document.querySelector('#game');const allowed=new Set(['https://2dvibes.com','https://www.2dvibes.com','https://2dvibes.pages.dev']);let origin;try{origin=new URL(document.referrer).origin;}catch{return;}const trialPreview = challenge === 'outskirts-v1' && origin === 'https://outskirts-trial.2dvibes.pages.dev';
if(parent===window||(!allowed.has(origin)&&!trialPreview))return;
function sendTrialResult(run) {
  if (challenge !== 'outskirts-v1' || run.mode !== 'explore' || run.world !== '0' ||
      run.campaign !== 'base' || run.season !== 'playtest-2026-10-v2') return;
  const ms = Math.round(run.ms);
  if (!Number.isSafeInteger(ms) || ms < 1 || !Number.isSafeInteger(run.deaths) || run.deaths < 0) return;
  parent.postMessage({
    type: '2dvibes:trial-result',
    challenge,
    ms,
    deaths: run.deaths,
    eligible: run.eligible === true
  }, origin);
}
 const emit=(event,value=0)=>parent.postMessage({type:'2dvibes:loader',event,value},origin);let ready=false,runId=null,last=0,active=0,finished=false,course=null,inputDocument=null,engagement=null;emit('load_requested');
 setInterval(()=>{try{const api=frame.contentWindow.BladefallPlaytest;if(!api)return;if(inputDocument!==frame.contentDocument){inputDocument=frame.contentDocument;engagement=window.dvCreateEngagement(inputDocument,inputDocument,frame.contentWindow,()=>emit('first_canvas_input'));}if(!ready){ready=true;emit('engine_ready');}const run=api.state().run;if(!run)return;if(run.id!==runId){const nextCourse=run.mode+':'+run.world;if(runId&&course===nextCourse)emit('retry');course=nextCourse;runId=run.id;last=run.ms;finished=false;active=0;emit('gameplay_start');}const delta=run.ms-last;last=run.ms;if(!document.hidden&&engagement.active()&&delta>0&&!finished){active+=Math.min(delta,1100);if(active>=10000){emit('gameplay_active',Math.round(active));active=0;}}if(run.done&&!finished){finished=true;emit('completion');sendTrialResult(run);}}catch{/* Child navigation may temporarily make its API unavailable. */}},1000);
})();
