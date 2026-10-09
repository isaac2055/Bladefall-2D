/* Survive playtest ratings and local, per-world time trials. */
(function(root){
'use strict';
const KEY='bladescent.reviews.v1',TIMES='bladescent.times.v1',BUILD='7.283.0';
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))||fallback;}catch{return fallback;}};
const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const format=f=>`${Math.floor(f/3600)}:${String(Math.floor(f/60)%60).padStart(2,'0')}.${String(Math.floor(f%60*100/60)).padStart(2,'0')}`;
let ticks=0,lastDeaths=0;
const campaign=()=>config.title!=='Room Bank';
let config={};
let st,mode='play',run=null,roomStats={},rated=new Set(),pending=false,bar,dialog;
const tester=read('bladescent.tester.v1',null)||('tester-'+(root.crypto?.randomUUID?.()||Date.now()).toString().slice(0,8));
function download(data,name,type){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([data],{type}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function exportReviews(){const rows=read(KEY,[]),columns=['tester','session','build','world','room','origin','name','outcome','fun','difficulty','suitability','comment','frames','deaths','assisted','practiceReason','recordedAt','revision','bankSide','bankBatch'];const csv=[columns,...rows.map(r=>columns.map(k=>r[k]??''))].map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');download(csv,(config.title==='Room Bank'?'room-bank-reviews-':'survive-reviews-')+new Date().toISOString().slice(0,10)+'.csv','text/csv');}
function init(state,params){st=state;config=state.sessionConfig||{};mode=params.get('mode')==='review'?'review':'play';if(campaign())root.BladefallPlaytest?.setup({startTrial:(which,id)=>{if(which==='survival')root.BladefallPitchView.climb.startWorld(+id);else location.href='index.html?timeTrial='+encodeURIComponent(id);},canStartTrial:(which,id)=>root.BladefallPlaytest.model.world(which,id)?.campaign==='base'||root.BladefallPlaytest.unlocked(which,id),pause:()=>{const old=st.view.paused;st.view.paused=true;return ()=>{st.view.paused=old;};},clearInput:()=>root.BladefallPrecisionView.clearInput?.()});try{write('bladescent.tester.v1',tester);}catch{}if(bar)return;
 const css=document.createElement('style');css.textContent='#bsBar{position:fixed;z-index:30;top:8px;left:50%;transform:translateX(-50%);display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:center;background:#141822ed;color:#ead9b2;padding:7px 12px;border:1px solid #756749;border-radius:8px;font:13px monospace;max-width:95vw}#bsBar button,#bsBar a{font:inherit;color:inherit;background:#252b39;border:1px solid #756749;border-radius:4px;padding:5px;cursor:pointer}#bsDialog{color:#ece5d7;background:#171c29;border:1px solid #a9925b;border-radius:12px;max-width:520px;width:calc(100% - 48px);max-height:85vh;overflow:auto;padding:24px;font:16px system-ui}#bsDialog::backdrop{background:#000b}#bsDialog label{display:block;margin:16px 0}#bsDialog select,#bsDialog textarea,#bsDialog input{box-sizing:border-box;width:100%;padding:10px;font:inherit;color:#eee;background:#242c3c;border:1px solid #8590a0;border-radius:5px}#bsDialog button{padding:10px 15px;margin:5px;font:inherit;cursor:pointer}#bsDialog small{color:#bcc6d6}';document.head.appendChild(css);
 bar=document.createElement('nav');bar.id='bsBar';bar.setAttribute('aria-label',(config.title||'Survive')+' mode');bar.innerHTML=`<strong>${mode==='review'?'Review mode':'Play mode'}</strong><span id="bsClock"></span>${mode==='review'?'<button id="bsRate">Rate room</button><button id="bsExport">Export reviews</button>':'<button id="bsTimes">Local times</button>'}<a href="${config.baseUrl||'precision.html?pitch=climb'}&mode=${mode==='review'?'play':'review'}">${mode==='review'?'Play':'Review'} mode</a>`;document.body.appendChild(bar);
 dialog=document.createElement('dialog');dialog.id='bsDialog';document.body.appendChild(dialog);dialog.addEventListener('cancel',e=>e.preventDefault());
 // Typing a review must never move the knight, skip a room, or activate menu shortcuts.
 root.addEventListener('keydown',e=>{if(dialog.open)e.stopImmediatePropagation();},true);
 root.addEventListener('keyup',e=>{if(dialog.open)e.stopImmediatePropagation();},true);
 if(campaign()){bar.innerHTML='<strong>Survival</strong><span id="bsClock" hidden></span><button id="bsTimes">Leaderboards</button>';if(mode==='review')root.BladefallPlaytest?.setFeedback(true);mode='play';}
 bar.querySelector('#bsExport')?.addEventListener('click',exportReviews);
 bar.querySelector('#bsRate')?.addEventListener('click',()=>rate(st.view.g?.room.def,()=>{},'incomplete'));
 bar.querySelector('#bsTimes')?.addEventListener('click',()=>campaign()?root.BladefallPlaytest?.boards('survival'):times());
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&run)invalidate('tab hidden');});
}
function start(){if(!st?.world)return;const d=st.view.g?.room.def;
 run={world:st.world.n,frames:0,done:false,eligible:d?.id===st.world.atlasStart,reason:d?.id===st.world.atlasStart?'':'room select',session:root.crypto?.randomUUID?.()||String(Date.now())};roomStats={};rated=new Set();lastDeaths=st.view.chapterStats.deaths;if(campaign())root.BladefallPlaytest?.start('survival',st.world.n,{eligible:run.eligible,reason:run.reason,force:true});refresh();}
function invalidate(reason){if(campaign())root.BladefallPlaytest?.invalidate(reason);if(run){run.eligible=false;run.reason=reason;if(['assist','game speed','route demonstration','co-op'].includes(reason))run.assisted=true;}}
function tick(){if(!st?.view.g)return;if(!run||run.world!==st.world.n)start();
 if(st.walkTrial&&st.view.g.room.id===st.world.atlasStart){st.walkTrial=false;start();}const v=st.view,g=v.g;if(v.replay)invalidate('route demonstration');if(g.assist?.infiniteStamina)invalidate('assist');
 if(++ticks%60===1){const saved=read('bladefall.pcore.v1',{});if(saved.assist?.speed&&saved.assist.speed!==1)invalidate('game speed');}
 if(root.BladefallClimbCoop?.status&&root.BladefallClimbCoop.status!=='off')invalidate('co-op');
 if(mode==='play'&&!run.done)run.frames++;
 if(campaign()){root.BladefallPlaytest?.tick(1/60);const deaths=v.chapterStats.deaths;for(let i=lastDeaths;i<deaths;i++)root.BladefallPlaytest?.death();lastDeaths=deaths;}
 const r=roomStats[g.room.id]||(roomStats[g.room.id]={frames:0,startDeaths:v.chapterStats.deaths});r.frames++;if(ticks%15===0)refresh();}
function refresh(){if(!bar)return;const rateButton=bar.querySelector('#bsRate');if(rateButton)rateButton.disabled=!challenge(st?.view.g?.room.def);bar.querySelector('#bsClock').textContent=mode==='review'?`${read(KEY,[]).length} saved ratings`:run?`${format(run.frames)} · ${config.title==='Room Bank'?st.world.name:'World '+run.world}${run.eligible?'':' · practice'}`:(config.title==='Room Bank'?'Set timer starts on entry':'World timer starts on entry');}
function challenge(d){return d&&!d.connector&&!d.passage&&!d.atlasJunction&&!d.atlasTransit&&!d.atlasGate;}
function complete(d,continuation){if(!challenge(d)||pending)return false;
 if(campaign()){
  if(root.BladefallPlaytest?.feedbackEnabled()&&!rated.has(d.id)){
   pending=true;const stats=roomStats[d.id]||{frames:0,startDeaths:st.view.chapterStats.deaths};
   void root.BladefallPlaytest.feedback({mode:'survival',campaign:st.world.n>20?'fractured':'base',world:String(st.world.n),room:d.id,name:d.name,ms:Math.round(stats.frames*1000/60),deaths:st.view.chapterStats.deaths-stats.startDeaths}).then(()=>{rated.add(d.id);pending=false;continuation();});return true;
  }
  return false;
 }
 if(mode==='review'&&!rated.has(d.id)){rate(d,continuation,'completed');return true;}
 if(mode==='play'&&run&&!run.done&&d.id===st.world.atlasEnd){run.done=true;if(run.eligible){const rows=read(TIMES,[]);rows.push({world:run.world,frames:run.frames,build:config.build||BUILD,recordedAt:new Date().toISOString()});try{write(TIMES,rows);}catch{invalidate('times could not be saved');}}refresh();}return false;}
function rate(d,continuation,outcome){if(!challenge(d)||pending||!st?.view.g)return;pending=true;const v=st.view,wasPaused=v.paused;v.paused=true;root.BladefallPrecisionView.clearInput?.();
 const r=roomStats[d.id]||{frames:0,startDeaths:v.chapterStats.deaths};
 const scale=(name,max,help)=>`<label>${name} /${max}<select name="${name.toLowerCase()}" required><option value="">Choose a score</option>${Array.from({length:max},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join('')}</select><small>${help}</small></label>`;
 dialog.innerHTML=`<form id="bsRating"><h2>Review: ${esc(d.name||d.id)}</h2><p>${esc(config.describe?config.describe(d):'World '+st.world.n+' · '+st.world.name)}</p><label>Tester name or code<input name="tester" value="${esc(read('bladescent.tester.v1',tester))}" required maxlength="80"></label>${scale('Fun',10,'1 = not enjoyable · 10 = excellent')}${scale('Difficulty',5,'1 = very easy · 5 = very hard')}${scale('Suitability',5,config.suitability||'1 = poor fit · 5 = excellent fit for this world and point in the game')}<label>Comments (optional)<textarea name="comment" rows="3" maxlength="4000"></textarea></label><small>Saved on this device. Export your reviews before sending results to the organizer.</small><p id="bsError" role="alert"></p><button type="submit">Save and continue</button>${outcome==='incomplete'?'<button type="button" id="bsCancel">Return without rating</button>':''}</form>`;
 const close=()=>{dialog.close();pending=false;root.BladefallPrecisionView.clearInput?.();v.paused=wasPaused;};
 dialog.querySelector('#bsCancel')?.addEventListener('click',close);
 dialog.querySelector('form').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);const values=Object.fromEntries(f);if(!values.tester.trim())return;if(![ ['fun',10],['difficulty',5],['suitability',5]].every(([k,max])=>Number.isInteger(+values[k])&&+values[k]>=1&&+values[k]<=max))return;
 try{const rows=read(KEY,[]);rows.push({tester:values.tester.trim(),session:run.session,build:config.build||BUILD,world:st.world.n,room:d.id,revision:d.bank?.revision||'',bankSide:d.bank?.side||'',bankBatch:d.bank?.batch||'',origin:d.origin||d.id,name:d.name,outcome,fun:+values.fun,difficulty:+values.difficulty,suitability:+values.suitability,comment:values.comment,frames:r.frames,deaths:v.chapterStats.deaths-r.startDeaths,assisted:!!run.assisted,practiceReason:run.reason,recordedAt:new Date().toISOString()});write(KEY,rows);write('bladescent.tester.v1',values.tester.trim());}catch{dialog.querySelector('#bsError').textContent='Could not save. Free storage and try again; your review is still here.';return;}
 if(outcome==='completed')rated.add(d.id);close();refresh();continuation();};dialog.showModal();}
function times(){const v=st.view,paused=v.paused;v.paused=true;const rows=read(TIMES,[]).filter(r=>r.build===(config.build||BUILD)).sort((a,b)=>String(a.world).localeCompare(String(b.world),undefined,{numeric:true})||a.frames-b.frames);dialog.innerHTML=`<h2>${esc(config.title||'Survive')} · Local times</h2><p>${config.title==='Room Bank'?'Per-set':'Per-world'}, unassisted times for build ${esc(config.build||BUILD)}. Pauses are excluded. Room selection, skips, demonstrations, co-op and assists are practice runs. These records are stored on this device.</p>${rows.length?'<ol>'+rows.slice(0,100).map(r=>`<li>${config.unit||'World'} ${esc(r.world)} — ${format(r.frames)}</li>`).join('')+'</ol>':'<p>No completed time trials yet.</p>'}<button id="bsClose">Continue</button>`;dialog.querySelector('button').onclick=()=>{dialog.close();v.paused=paused;};dialog.showModal();}
function request(d,cb,outcome){if(mode!=='review'||!challenge(d)||pending)return false;rate(d,cb,outcome);return true;}
root.BladefallClimbSession={request,init,start,tick,complete,invalidate,refresh,exportReviews,state:()=>({mode,run,pending})};
})(globalThis);
