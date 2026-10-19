/* Local-first scores and optional feedback. Requests stay on the origin hosting this game. */
(function(root){'use strict';
const M=root.BladefallPlaytestModel,KEY='bladefall.playtest.v1',uuid=()=>crypto.randomUUID();
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY))||{};}catch{return {};}};
let data=Object.assign({season:M.SEASON,player:uuid(),token:uuid()+uuid(),name:'',records:[],feedback:[],recordings:[],outbox:[],remote:[],settings:{feedback:false},unlocks:{explore:[],survival:[]}},read());
function persist(){localStorage.setItem(KEY,JSON.stringify(data));}
if(data.season!==M.SEASON){
 // Course changes start a comparable board; retain the previous scores and unsent feedback in backups.
 data.archives=[...(data.archives||[]),{season:data.season,records:data.records,remote:data.remote,feedback:data.feedback,outbox:data.outbox}];
 data.records=[];data.remote=[];data.feedback=data.feedback.map(r=>({...r,season:M.SEASON}));data.outbox=data.outbox.filter(x=>(x.kind==='feedback'||x.kind==='recording')).map(x=>({...x,record:{...x.record,season:M.SEASON}}));data.season=M.SEASON;
}
try{if(!data.resetLegacy){for(const k of ['bladefall_leaderboards_v1','bladescent.times.v1']){const old=localStorage.getItem(k);if(old)localStorage.setItem(k+'.before-playtest-reset',old);localStorage.removeItem(k);}data.resetLegacy=true;}persist();}catch{}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const local=()=>['localhost','127.0.0.1','[::1]',''].includes(location.hostname);
const endpoint=(location.hostname==='appassets.bladefall'||local())?'https://bladefall2d.pages.dev/api/playtest':'/api/playtest';let syncing=false,syncAgain=false,adapter={},run=null,dialog=null,clock=null;
const allRecords=()=>[...new Map([...data.remote,...data.records].map(r=>[r.id,r])).values()];
async function sync(){if(syncing){syncAgain=true;return;}if(navigator.onLine===false||location.protocol==='file:')return;syncing=true;try{for(const item of [...data.outbox]){const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...item,player:data.player,token:data.token})});if(!response.ok)throw Error('pending');const ack=await response.json();if(ack.saved!==true||ack.id!==item.record.id)throw Error('unconfirmed');data.outbox=data.outbox.filter(x=>x.record.id!==item.record.id);persist();}const response=await fetch(endpoint+'?season='+encodeURIComponent(M.SEASON));if(response.ok){const rows=await response.json();if(Array.isArray(rows.records)){data.remote=rows.records.filter(M.valid);persist();}}}catch{/* Keep unsent data until this game's own endpoint is available. */}finally{syncing=false;if(syncAgain){syncAgain=false;queueMicrotask(()=>void sync());}}}
function queue(kind,record){const before=JSON.stringify(data);try{data[kind==='time'?'records':kind==='recording'?'recordings':'feedback'].push(kind==='recording'?{id:record.id,name:record.name,room:record.room,frames:record.frames,recordedAt:record.recordedAt}:record);data.outbox.push({kind,record});persist();}catch(e){data=JSON.parse(before);throw e;}void sync();}
function feedbackState(id){const exists=data.feedback.some(r=>r.id===id);return !exists?'unsaved':data.outbox.some(x=>x.record.id===id)?'pending':'synced';}
function saveFeedback(info){
 const record={...info,id:info.id||uuid(),season:M.SEASON,player:data.player,world:String(info.world),room:info.room||'',name:info.name||info.room,ms:Math.round(info.ms||0),deaths:info.deaths||0,build:info.build||'7.334.0',at:info.recordedAt||new Date().toISOString()};
 if(!M.validFeedback(record))throw Error('Invalid feedback');
 if(feedbackState(record.id)==='unsaved')queue('feedback',record);else void sync();
 return record.id;
}
function saveRecording(info){const record={...info,format:'bladefall-route-v1',id:info.id||uuid(),season:M.SEASON,player:data.player};if(!M.validRecording(record))throw Error('Invalid recording');if(!data.recordings.some(r=>r.id===record.id))queue('recording',record);else void sync();return record.id;}
function recordingState(id){return !data.recordings.some(r=>r.id===id)?'unsaved':data.outbox.some(x=>x.record.id===id)?'pending':'synced';}
function setup(options){adapter=options||{};ensure();}
function ensure(){if(dialog||!root.document)return;const style=document.createElement('style');style.textContent='#bfPlaytestDialog{z-index:10000;background:#161d2a;color:#eee4cc;border:1px solid #c7aa69;border-radius:12px;width:min(640px,90vw);max-height:84dvh;overflow:auto;box-sizing:border-box;padding:24px;font:16px system-ui;touch-action:pan-y}#bfPlaytestDialog::backdrop{background:#000c}#bfPlaytestDialog button,#bfPlaytestDialog input,#bfPlaytestDialog select,#bfPlaytestDialog textarea{font:inherit;box-sizing:border-box;padding:9px;margin:5px 0;background:#273448;color:#fff;border:1px solid #6f8198;border-radius:6px;touch-action:manipulation}#bfPlaytestDialog button{cursor:pointer}#bfPlaytestDialog [aria-pressed=true]{border-color:#edc55d;background:#514627}#bfPlaytestDialog label{display:block;margin:12px 0}#bfPlaytestDialog label input,#bfPlaytestDialog label select,#bfPlaytestDialog textarea{width:100%}#bfPlaytestDialog table{width:100%;text-align:left;border-collapse:collapse}#bfPlaytestDialog td,#bfPlaytestDialog th{padding:8px 5px;border-bottom:1px solid #394559}#bfPlaytestDialog .ptrow{display:flex;gap:8px;flex-wrap:wrap;align-items:center}#bfTrialClock{position:fixed;top:8px;right:12px;z-index:19;background:#141b25dc;color:#eddbad;border-radius:5px;padding:5px 8px;font:12px monospace;pointer-events:none}';document.head.appendChild(style);dialog=document.createElement('dialog');dialog.id='bfPlaytestDialog';document.body.appendChild(dialog);dialog.addEventListener('cancel',e=>e.preventDefault());clock=document.createElement('div');clock.id='bfTrialClock';clock.hidden=true;document.body.appendChild(clock);for(const type of ['keydown','keyup'])root.addEventListener(type,e=>{if(dialog.open)e.stopImmediatePropagation();},true);}
function show(html){ensure();const release=adapter.pause?.()||(()=>{});adapter.clearInput?.();dialog.innerHTML=html;dialog.showModal();let closed=false;return ()=>{if(closed)return;closed=true;dialog.close();adapter.clearInput?.();release();};}
function start(mode,world,{eligible=true,reason='',force=false}={}){const w=M.world(mode,world);if(!w){run=null;refresh();return null;}if(!force&&run&&!run.done&&run.mode===mode&&run.world===String(world))return run;run={id:uuid(),season:M.SEASON,mode,world:String(world),campaign:w.campaign,name:w.name,ms:0,deaths:0,hearts:0,heartIds:[],eligible,reason,done:false};refresh();return run;}
function invalidate(reason){if(run&&!run.done){run.eligible=false;run.reason=reason;refresh();}}
function tick(seconds){if(run&&!run.done&&!dialog?.open){run.ms+=seconds*1000;refresh();}}
function death(){if(run&&!run.done){run.deaths++;refresh();}}
function collectHeart(id){
 if(!run||run.done||run.mode!=='survival'||typeof id!=='string'||!id||run.heartIds.includes(id)||run.hearts>=(M.world(run.mode,run.world)?.hearts||0))return false;
 run.heartIds.push(id);run.hearts=run.heartIds.length;refresh();return true;
}
const hasHeart=id=>!!run?.heartIds?.includes(id);
function refresh(){if(clock){clock.hidden=!run||data.settings.clock!==true;clock.textContent=run?`${M.format(run.ms)} · ${run.deaths} deaths${run.mode==='survival'?` · ♥ ${run.hearts}/${M.world(run.mode,run.world)?.hearts||0}`:''}${run.eligible?'':' · practice'}`:'';}}
function clockShown(){return data.settings.clock===true;}   /* (7.320) the speedrun timer is off unless turned on */function setClock(v){data.settings.clock=!!v;persist();refresh();}function feedbackEnabled(){return !!data.settings.feedback;}function setFeedback(value){data.settings.feedback=!!value;persist();}
function feedback(info,force=false){
 if(!force&&!feedbackEnabled())return Promise.resolve();
 return new Promise(resolve=>{
  // (7.354) Number buttons, not a <select>: Explore's page swallowed mouse clicks on the native picker.
  const score=(key,label,max)=>`<fieldset style="border:0;padding:0;margin:6px 0"><legend>${label} /${max}</legend><input type="hidden" name="${key}" value=""><span style="display:flex;flex-wrap:wrap;gap:4px">${Array.from({length:max},(_,i)=>`<button type="button" data-score="${key}" data-v="${i+1}" style="min-width:34px">${i+1}</button>`).join('')}</span></fieldset>`;
  const draftKey=[info.mode,info.campaign,info.world,info.room,info.revision||info.build||'7.329.0'].join(':'),draft=data.reviewDrafts?.[draftKey]||{id:uuid(),values:{}};
  const close=show(`<form><h2>Feedback · ${esc(info.name)}</h2>${score('fun','Fun',10)}${score('difficulty','Difficulty',5)}<label>Comment (optional)<textarea name="comment" maxlength="4000" rows="3"></textarea></label><p>Your draft stays on this device. Save uploads your ratings and comment; other testers can read them under Leaderboards → Read testers’ feedback. Offline submissions retry automatically.</p><p role="alert" id="ptError"></p><button type="submit">Save feedback</button> <button type="button" id="ptSkip">Skip</button></form>`),form=dialog.querySelector('form');
  for(const [key,value] of Object.entries(draft.values)){const field=form.elements.namedItem(key);if(field)field.value=value;}
  const mark=()=>form.querySelectorAll('[data-score]').forEach(x=>{const on=form.elements.namedItem(x.dataset.score).value===x.dataset.v;x.style.background=on?'#e8b04a':'';x.style.color=on?'#111':'';x.setAttribute('aria-pressed',on);});
  form.querySelectorAll('[data-score]').forEach(x=>x.onclick=()=>{form.elements.namedItem(x.dataset.score).value=x.dataset.v;mark();form.dispatchEvent(new Event('input'));});mark();
  form.addEventListener('input',()=>{draft.values=Object.fromEntries(new FormData(form));data.reviewDrafts=data.reviewDrafts||{};data.reviewDrafts[draftKey]=draft;try{persist();}catch{dialog.querySelector('#ptError').textContent='Could not save this draft. Your text is still here.';}});
  const done=()=>{close();resolve();};dialog.querySelector('#ptSkip').onclick=done;
  form.onsubmit=e=>{e.preventDefault();const f=new FormData(form);if(!f.get('fun')||!f.get('difficulty')){dialog.querySelector('#ptError').textContent='Choose a Fun and a Difficulty rating.';return;}try{saveFeedback({...info,id:draft.id,fun:+f.get('fun'),difficulty:+f.get('difficulty'),comment:String(f.get('comment')||'')});}catch{dialog.querySelector('#ptError').textContent='Storage is full. Your text is still here; free space or copy it before leaving.';return;}if(data.reviewDrafts){delete data.reviewDrafts[draftKey];try{persist();}catch{}}done();};
 });
}

/* (7.354) Everyone's saved feedback, readable in the game: ratings and comments, newest first, filterable by game. */
async function readFeedback(back){
 const close=show(`<h2>Testers’ feedback</h2><p id="ptFbStatus">Loading…</p><div id="ptFbList" style="max-height:60dvh;overflow:auto"></div><button id="ptFbBack">Back</button>`);
 dialog.querySelector('#ptFbBack').onclick=()=>{close();back?.();};
 let rows=[],mode='all';
 const render=()=>{const list=rows.filter(r=>mode==='all'||r.mode===mode);
  dialog.querySelector('#ptFbStatus').innerHTML=`<span class="ptrow">${[['all','All'],['explore','Explore'],['survival','Ascend'],['review','Rooms & Cores']].map(([k,l])=>`<button data-fbmode="${k}" aria-pressed="${mode===k}">${l}</button>`).join('')}</span> ${list.length} note${list.length===1?'':'s'}`;
  dialog.querySelectorAll('[data-fbmode]').forEach(b=>b.onclick=()=>{mode=b.dataset.fbmode;render();});
  dialog.querySelector('#ptFbList').innerHTML=list.length?list.map(r=>`<div style="border-top:1px solid #3a4250;padding:8px 0"><b>${esc(r.name||r.room||r.world)}</b> <small>${esc(r.mode==='survival'?'Ascend':r.mode==='explore'?'Explore':r.mode)}${r.campaign?' · '+esc(r.campaign):''} · ${esc(String(r.at||'').slice(0,10))}${r.build?' · '+esc(r.build):''}</small><br>Fun ${r.fun}/10 · Difficulty ${r.difficulty}/5${r.comment?`<p style="margin:4px 0;white-space:pre-wrap">${esc(r.comment)}</p>`:''}</div>`).join(''):'<p>No feedback yet.</p>';};
 try{const res=await fetch(endpoint+'?feedback=1',{cache:'no-store'});if(!res.ok)throw Error(res.status);rows=(await res.json()).feedback||[];render();}
 catch{dialog.querySelector('#ptFbStatus').textContent='Could not load feedback (offline, or the server is busy). Try again later.';}
}
const table=(rows,mode)=>rows.length?`<table><thead><tr><th>#</th><th>Player</th><th>Time</th><th>Deaths</th>${mode==='survival'?'<th>Hearts</th>':''}</tr></thead><tbody>${rows.map((r,i)=>`<tr><td>${i+1}</td><td>${esc(r.name)}</td><td>${M.format(r.ms)}</td><td>${r.deaths}</td>${mode==='survival'?`<td>♥ ${r.hearts||0}</td>`:''}</tr>`).join('')}</tbody></table>`:'<p>No saved times yet.</p>';
async function complete({next,walk,menu,menuLabel='Previous menu',feedbackInfo,offer=true}={}){if(!run||run.done)return false;const result={...run,ms:Math.max(1,Math.round(run.ms)),at:new Date().toISOString()};run.done=true;refresh();if(feedbackInfo)await feedback({...result,...feedbackInfo});if(!offer)return result;const close=show(`<h2>${esc(M.world(result.mode,result.world).name)} complete</h2><p>${M.format(result.ms)} · ${result.deaths} deaths${result.mode==='survival'?` · ♥ ${result.hearts}/${M.world(result.mode,result.world)?.hearts||0}`:''}</p><h3>Top 5 · ${result.mode==='explore'?'🪐 Explore':'✨ Ascend'}</h3><div id="ptTop"></div>${result.eligible?`<form id="ptSave"><label>Leaderboard name<input name="name" value="${esc(data.name)}" maxlength="40" required placeholder="Name or nickname"></label><p>Saving publishes this name, world, time, deaths and collected hearts on this game's leaderboard.</p><button>Save my time</button></form>`:`<p>Practice run: ${esc(result.reason||'not completed continuously')}.</p>`}<p id="ptStatus" role="status"></p><div class="ptrow">${next?'<button id="ptNext">Skip to next world</button>':''}${walk?'<button id="ptWalk">Walk to next world</button>':''}<button id="ptMenu">${esc(menuLabel)}</button></div>`);const render=()=>{if(dialog.open&&dialog.querySelector('#ptTop'))dialog.querySelector('#ptTop').innerHTML=table(M.best(allRecords(),{mode:result.mode,campaign:result.campaign,world:result.world}).slice(0,5),result.mode);};render();void sync().then(render);for(const[id,fn]of [['ptNext',next],['ptWalk',walk],['ptMenu',menu]])dialog.querySelector('#'+id)?.addEventListener('click',()=>{close();fn?.();});dialog.querySelector('#ptSave')?.addEventListener('submit',e=>{e.preventDefault();const name=String(new FormData(e.target).get('name')).trim().slice(0,40);if(!name)return;try{data.name=name;queue('time',{...result,player:data.player,name});e.target.remove();dialog.querySelector('#ptStatus').textContent='Saved on this device. Pending submissions retry automatically.';render();}catch{dialog.querySelector('#ptStatus').textContent='Could not save. Free storage and try again.';}});return result;}
/* What the leaderboards may name (7.351): worlds this player has reached show their names; the rest read "???",
   and so does the Fractured campaign until one of its worlds is open. Test modes (Explore's five taps, Ascend's
   five Screen-shake presses, the developer unlock) reveal everything. Works on both pages (index and precision). */
function readJSON(k){try{return JSON.parse(localStorage.getItem(k))||null;}catch{return null;}}
function revealAll(){
 if(root.BladefallMounts?.testMode?.())return true;
 const m=typeof meta!=='undefined'?meta:readJSON('bladefall_v2');if(m?.devUnlocked)return true;
 return !!readJSON('bladefall.pcore.v1')?.assist?.testMode;
}
function known(mode,campaign,id){
 if(revealAll()||data.records.some(r=>r.mode===mode&&String(r.world)===String(id)))return true;
 if(campaign==='fractured')return !!data.unlocks[mode]?.includes(String(id));
 const n=Number(id);
 if(mode==='explore'){const m=typeof meta!=='undefined'?meta:readJSON('bladefall_v2')||{};return n===0||n<=Math.max(m.bestStage||0,m.reach?.[0]||0,m.run?.stageIndex||0);}
 const cp=readJSON('bladefall.climb.atlas.v1')?.checkpoint;return n===1||n<=(cp?.world||1);
}
const campaignKnown=(mode,campaign)=>campaign==='base'||M.catalog.some(w=>w.mode===mode&&w.campaign===campaign&&known(mode,campaign,w.id));
function boards(initial='survival'){
 let mode=initial,campaign='base',section='world',sort='time',wid=M.catalog.find(w=>w.mode===mode&&w.campaign===campaign).id;
 const close=show('');
 const render=()=>{
  if(!campaignKnown(mode,campaign))campaign='base';
  const worlds=M.catalog.filter(w=>w.mode===mode&&w.campaign===campaign);
  if(!worlds.some(w=>w.id===wid))wid=worlds[0].id;if(mode!=='survival')sort='time';
  const rows=section==='whole'?M.aggregate(allRecords(),mode,campaign,sort):M.best(allRecords(),{mode,campaign,world:wid,sort});
  dialog.innerHTML=`<h2>Leaderboards · ${sort==='hearts'?'hearts, then time':'fastest time'}</h2>
   <div class="ptrow">${M.MODES.map(x=>`<button data-mode="${x}" aria-pressed="${mode===x}">${x==='explore'?'🪐 Explore':'✨ Ascend'}</button>`).join('')}</div>
   <div class="ptrow">${M.CAMPAIGNS.map(x=>campaignKnown(mode,x)?`<button data-campaign="${x}" aria-pressed="${campaign===x}">${x==='base'?'Base':'Fractured'}</button>`:`<button disabled aria-disabled="true">???</button>`).join('')}</div>
   <div class="ptrow"><button data-section="world" aria-pressed="${section==='world'}">By world</button><button data-section="whole" aria-pressed="${section==='whole'}">Whole game</button></div>
   ${mode==='survival'?`<div class="ptrow"><button data-sort="time" aria-pressed="${sort==='time'}">Fastest time</button><button data-sort="hearts" aria-pressed="${sort==='hearts'}">Most hearts · fastest time</button></div>`:''}
   ${section==='world'?`<p style="margin:12px 0 4px">World</p><div class="ptrow" id="ptWorld" style="max-height:30dvh;overflow:auto">${worlds.map(w=>known(mode,campaign,w.id)?`<button data-world="${w.id}" aria-pressed="${w.id===wid}">${esc(w.name)}</button>`:`<button disabled aria-disabled="true">???</button>`).join('')}</div>`:`<p>Sum of each player's ${sort==='hearts'?'most-hearts, then fastest':'fastest'} continuous clear of all ${worlds.length} worlds. Improve any world to improve your total. Base and Fractured stay separate.</p>`}
   ${table(rows,mode)}${adapter.startTrial?`<button id="ptStartTrial">Start ${section==='whole'?'first world':'selected world'} time trial</button>`:''}
   <p>${data.outbox.length} pending submissions. ${sort==='hearts'?'More hearts rank first; equal heart counts are ranked by time.':'Ranks use time; deaths'+(mode==='survival'?' and hearts':'')+' are shown alongside.'} Hearts count only those earned during this run.</p>
   <button id="ptReadFeedback">Read testers’ feedback</button> <details><summary>Backup and transfer</summary><p>Earlier course revisions are retained in your backup.</p><button id="ptExport">Back up scores & feedback</button><label>Restore backup<input type="file" id="ptImport" accept="application/json"></label></details><button id="ptClose">Back</button><p id="ptStatus" role="status"></p>`;
  // A new game or campaign starts at its first world (the Outskirts), not at whichever id the last one had.
  for(const type of ['mode','campaign','section','sort'])dialog.querySelectorAll('[data-'+type+']').forEach(b=>b.onclick=()=>{if(type==='mode'){if(mode!==b.dataset.mode)wid=null;mode=b.dataset.mode;}else if(type==='campaign'){if(campaign!==b.dataset.campaign)wid=null;campaign=b.dataset.campaign;}else if(type==='sort')sort=b.dataset.sort;else section=b.dataset.section;render();});
  // A list of buttons, not a <select>: the native picker did not open in every browser (owner, private window).
  dialog.querySelectorAll('[data-world]').forEach(b=>b.onclick=()=>{wid=b.dataset.world;render();});
  dialog.querySelector('#ptStartTrial')?.addEventListener('click',()=>{const chosen=section==='whole'?worlds[0].id:wid;if(adapter.canStartTrial&&!adapter.canStartTrial(mode,chosen)){dialog.querySelector('#ptStatus').textContent='Find the matching base-world item to unlock this Fractured world.';return;}close();adapter.startTrial(mode,chosen);});
  dialog.querySelector('#ptClose').onclick=close;dialog.querySelector('#ptExport').onclick=exportData;
  dialog.querySelector('#ptReadFeedback').onclick=()=>{close();readFeedback(boards);};
  dialog.querySelector('#ptImport').onchange=async e=>{try{importData(JSON.parse(await e.target.files[0].text()));render();}catch{dialog.querySelector('#ptStatus').textContent='Invalid backup, or it belongs to another profile. Export this profile before replacing it.';}};
 };
 render();void sync().then(()=>{if(dialog.open&&dialog.querySelector('#ptWorld'))render();});
}
function exportData(){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify({schema:'bladefall-playtest-backup',data},null,2)],{type:'application/json'}));a.href=url;a.download='bladefall-playtest-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function importData(raw){
 const incoming=raw?.data;
 if(raw?.schema!=='bladefall-playtest-backup'||incoming?.season!==M.SEASON||!/^[a-zA-Z0-9-]{8,128}$/.test(incoming?.player||'')||typeof incoming?.token!=='string'||incoming.token.length<48||incoming.token.length>160)throw Error('invalid backup');
 const feedbackValid=r=>r&&r.player===incoming.player&&M.validFeedback(r);
 if(!Array.isArray(incoming.records)||!incoming.records.every(r=>M.valid(r)&&r.player===incoming.player)||!Array.isArray(incoming.feedback)||!incoming.feedback.every(feedbackValid)||!Array.isArray(incoming.outbox)||!incoming.outbox.every(x=>x.kind==='time'?M.valid(x.record)&&x.record.player===incoming.player:(x.kind==='feedback'&&feedbackValid(x.record)||x.kind==='recording'&&x.record.player===incoming.player&&M.validRecording(x.record))))throw Error('invalid records');
 if(data.player!==incoming.player&&(data.records.length||data.feedback.length||data.outbox.length))throw Error('different player');
 const merge=(a,b,key=x=>x.id)=>[...new Map([...a,...b].map(x=>[key(x),x])).values()];
 const before=data;
 data={...data,archives:merge(data.archives||[],Array.isArray(incoming.archives)?incoming.archives:[],x=>x.season),player:incoming.player,token:incoming.token,name:incoming.name||data.name,unlocks:Object.fromEntries(M.MODES.map(mode=>[mode,[...new Set([...data.unlocks[mode],...(Array.isArray(incoming.unlocks?.[mode])?incoming.unlocks[mode].filter(id=>M.world(mode,id)?.campaign==='fractured').map(String):[])])]])),records:merge(data.records,incoming.records),feedback:merge(data.feedback,incoming.feedback),recordings:merge(data.recordings,Array.isArray(incoming.recordings)?incoming.recordings.filter(r=>r&&typeof r.id==='string'):[]),outbox:merge(data.outbox,[...incoming.outbox,...incoming.records.map(record=>({kind:'time',record})),...incoming.feedback.map(record=>({kind:'feedback',record}))],x=>x.record.id)};
 try{persist();}catch(e){data=before;throw e;}void sync();
}

// A new game closes what the old save had opened (Explore's Fractured echoes); Ascend's own are untouched.
function relock(mode){if(data.unlocks[mode]?.length){data.unlocks[mode]=[];persist();}}
function unlock(mode,world){const list=data.unlocks[mode];world=String(world);if(!list.includes(world)){list.push(world);persist();return true;}return false;}
const unlocked=(mode,world)=>data.unlocks[mode]?.includes(String(world));
root.BladefallPlaytest={isOpen:()=>!!dialog?.open,reset:()=>{run=null;refresh();},setup,start,tick,death,collectHeart,hasHeart,invalidate,complete,feedback,saveFeedback,feedbackState,saveRecording,recordingState,feedbackEnabled,setFeedback,clockShown,setClock,boards,exportData,importData,unlock,unlocked,relock,sync,state:()=>({run,data}),isPublic:()=>!local(),model:M};
root.document?.addEventListener('visibilitychange',()=>{if(document.hidden)invalidate('tab hidden');});
root.addEventListener?.('online',sync);root.addEventListener?.('pagehide',()=>{if(run&&!run.done)invalidate('world interrupted');});root.setInterval?.(()=>{if(!document.hidden&&data.outbox.length)void sync();},30000);
})(globalThis);
