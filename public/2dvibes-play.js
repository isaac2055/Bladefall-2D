// The site focuses this wrapper after launch/fullscreen. Pass that focus into
// the nested game so keyboard input works without an extra canvas click.
const gameFrame = document.querySelector('#game');
const focusGame = () => {
 if (document.hidden) return;
 gameFrame.focus({preventScroll:true});
 gameFrame.contentWindow.focus();
};
window.addEventListener('focus', focusGame);
gameFrame.addEventListener('load', focusGame);
// Only published challenge IDs can select an in-game route.
const challenge = new URLSearchParams(location.search).get('challenge');
if (challenge === 'outskirts-v1') {
  document.querySelector('#game').src = '/?dvTrial=outskirts-v1';
}
(()=>{const frame=document.querySelector('#game');const allowed=new Set(['https://2dvibes.com','https://www.2dvibes.com','https://2dvibes.pages.dev']);let origin;try{origin=new URL(document.referrer).origin;}catch{return;}const trialPreview = challenge === 'outskirts-v1' && origin === 'https://outskirts-trial.2dvibes.pages.dev';
if(parent===window||(!allowed.has(origin)&&!trialPreview))return;
window.addEventListener('message', event => {
 if (event.source === parent && event.origin === origin && event.data?.type === '2dvibes:focus') focusGame();
});
if (challenge === 'outskirts-v1') {
  window.addEventListener('message', ({source, origin: senderOrigin, data}) => {
    if (source !== frame.contentWindow || senderOrigin !== location.origin ||
        data?.type !== 'bladefall:outskirts-result') return;
    const {ms, deaths, eligible} = data;
    if (!Number.isSafeInteger(ms) || ms < 1 || !Number.isSafeInteger(deaths) ||
        deaths < 0 || typeof eligible !== 'boolean') return;
    parent.postMessage({type: '2dvibes:trial-result', challenge, ms, deaths, eligible}, origin);
  });
}
 const emit=(event,value=0)=>parent.postMessage({type:'2dvibes:loader',event,value},origin);let ready=false,runId=null,last=0,active=0,finished=false,course=null,inputDocument=null,engagement=null;emit('load_requested');
 setInterval(()=>{try{const api=frame.contentWindow.BladefallPlaytest;if(!api)return;if(inputDocument!==frame.contentDocument){inputDocument=frame.contentDocument;engagement=window.dvCreateEngagement(inputDocument,inputDocument,frame.contentWindow,()=>emit('first_canvas_input'));}if(!ready){ready=true;emit('engine_ready');}const run=api.state().run;if(!run)return;if(run.id!==runId){const nextCourse=run.mode+':'+run.world;if(runId&&course===nextCourse)emit('retry');course=nextCourse;runId=run.id;last=run.ms;finished=false;active=0;emit('gameplay_start');}const delta=run.ms-last;last=run.ms;if(!document.hidden&&engagement.active()&&delta>0&&!finished){active+=Math.min(delta,1100);if(active>=10000){emit('gameplay_active',Math.round(active));active=0;}}if(run.done&&!finished){finished=true;emit('completion');}}catch{/* Child navigation may temporarily make its API unavailable. */}},1000);
})();
