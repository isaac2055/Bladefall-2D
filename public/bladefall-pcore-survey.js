/* Precision Core — difficulty survey (7.256). A review tool for the owner, off unless switched on (main menu →
   Difficulty survey, or precision.html?survey). While on:
   - every level starts its own count: deaths, time, retries and "watched the intended route", per room;
   - after the last room of a level, a short card asks difficulty 1–10 and fun 1–5, with optional flags
     (out of place, feels like a repeat, weak, found a skip) and a one-line note;
   - the menu shows each level's survey result in place of its best deaths;
   - Export writes a JSON file and a CSV file of every level, for reordering by difficulty and theme.
   Its log lives apart from the normal save (localStorage 'bladefall.pcore.survey.v1'), so switching it on or
   resetting it never touches cleared levels, shards or best deaths. Gate trials never show it. */
(function(root){
'use strict';
const KEY='bladefall.pcore.survey.v1';
const FLAGS=[['place','Out of place'],['repeat','Feels like a repeat'],['weak','Weak'],['skip','Found a skip']];
function load(){try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&s.levels)return s;}catch(e){}return {active:false,started:null,levels:{}};}
let S=load();
function write(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
try{if(new URLSearchParams(location.search).has('survey')&&!S.active){S.active=true;S.started=S.started||new Date().toISOString();write();}}catch(e){}
const R=()=>root.BladefallPrecisionRooms;
const esc=t=>String(t??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let run=null;   // the level being played now

function rec(id){return S.levels[id]||(S.levels[id]={runs:[],rating:null});}
function labelOf(i){const c=R().chapters[i];return c.label||String(i+1);}
const api={
 active:()=>S.active,
 /* Hooks called by the view. */
 start(ci,{seenBefore,assist}){
  if(!S.active)return;
  const ch=R().chapters[ci];
  run={ci,id:ch.id,at:new Date().toISOString(),seenBefore:!!seenBefore,assist:{stamina:!!assist?.infiniteStamina,speed:assist?.speed||1},rooms:{},room:null};
 },
 room(id){if(!run)return null;return run.rooms[id]||(run.rooms[id]={deaths:0,frames:0,retries:0,watched:false});},
 death(id){const r=api.room(id);if(r)r.deaths++;},
 retry(id){const r=api.room(id);if(r)r.retries++;},
 watched(id){const r=api.room(id);if(r)r.watched=true;},
 frame(id){const r=api.room(id);if(r)r.frames++;},
 /* End of a level: store the run, then show the card. `nav` = {next, again, chapters, showOverlay, hasNext, nextName}. */
 levelDone(ci,nav){
  if(!S.active||!run||run.ci!==ci)return false;
  const ch=R().chapters[ci],L=rec(ch.id),rooms=run.rooms;
  const deaths=Object.values(rooms).reduce((n,r)=>n+r.deaths,0),frames=Object.values(rooms).reduce((n,r)=>n+r.frames,0);
  L.runs.push({at:run.at,seenBefore:run.seenBefore,assist:run.assist,deaths,frames,rooms});
  run=null;write();
  card(ci,L,nav);return true;
 },
 /* For the menu. */
 summary(id){const L=S.levels[id];if(!L)return '';const first=L.runs[0],rt=L.rating;
  const bits=[];if(rt&&rt.diff)bits.push(`diff ${rt.diff}`);if(rt&&rt.fun)bits.push(`fun ${rt.fun}`);if(first)bits.push(`${first.deaths} death${first.deaths===1?'':'s'}`);if(rt&&rt.flags?.length)bits.push('⚑');
  return bits.join(' · ');},
 progress(){const n=R().chapters.length,rated=R().chapters.filter(c=>S.levels[c.id]?.rating?.diff).length;return {n,rated};},
 panel,
};

function card(ci,L,nav,context=null){
 const ch=context?.chapter||R().chapters[ci],last=L.runs[L.runs.length-1],rt=L.rating||{diff:0,fun:0,flags:[],note:''};
 const secs=Math.round(last.frames/60),retries=Object.values(last.rooms).reduce((n,r)=>n+r.retries,0),watched=Object.values(last.rooms).some(r=>r.watched);
 const scale=(name,n,val)=>`<div class="svScale" data-scale="${name}">${Array.from({length:n},(_,i)=>`<button class="pcMini svPick${val===i+1?' on':''}" aria-label="${name==='diff'?'Difficulty':'Fun'} ${i+1} of ${n}" aria-pressed="${val===i+1}" data-v="${i+1}">${i+1}</button>`).join('')}</div>`;
 nav.showOverlay(`<div class="pcCard"><h1>${esc(context?.label||labelOf(ci))} · ${esc(ch.name)}</h1><p class="pcSub">${esc(ch.outro||'')}</p>
 <table class="pcTable"><tr><td>Deaths</td><td>${last.deaths}${L.runs.length>1?` <span class="svDim">(first run ${L.runs[0].deaths})</span>`:''}</td></tr><tr><td>Time</td><td>${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}</td></tr>${retries?`<tr><td>Retries</td><td>${retries}</td></tr>`:''}${watched?'<tr><td>Watched the route</td><td>yes</td></tr>':''}${last.seenBefore?'<tr><td>Played before</td><td>yes</td></tr>':''}</table>
 <p class="svQ">Difficulty <span class="svDim">1 trivial · 10 brutal</span></p>${scale('diff',10,rt.diff)}
 <p class="svQ">Fun <span class="svDim">1 a chore · 5 a highlight</span></p>${scale('fun',5,rt.fun)}
 ${context?`<label class="svFlags"><input type="checkbox" id="svOff" ${rt.off?'checked':''}> Something seemed off</label>`:`<div class="svFlags">${FLAGS.map(([k,t])=>`<button class="pcChip svFlag${rt.flags.includes(k)?' on':''}" data-flag="${k}">${t}</button>`).join('')}</div>`}
 <input class="svNote" id="svNote" aria-label="Optional feedback" ${context&&!rt.off?'hidden':''} maxlength="200" placeholder="Note (optional): where it belongs, what felt off…" value="${esc(rt.note)}">
 ${nav.hasNext?`<button class="pcBtn" id="svNext" data-focus-first>${context?'Save · Continue':'Save · Next: '+esc(nav.nextName)}</button>`:''}<div class="pcRow"><button class="pcBtn ghost" id="svAgain">Save · Replay</button><button class="pcBtn ghost" id="svChapters" data-back>Save · ${context?'All regions':'Chapters'}</button></div></div>`);
 const o=document.getElementById('pcOverlay');
 o.querySelectorAll('.svScale').forEach(row=>row.querySelectorAll('.svPick').forEach(b=>b.onclick=()=>{rt[row.dataset.scale]=+b.dataset.v;row.querySelectorAll('.svPick').forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',String(x===b));});}));
 o.querySelectorAll('.svFlag').forEach(b=>b.onclick=()=>{const k=b.dataset.flag,i=rt.flags.indexOf(k);if(i<0)rt.flags.push(k);else rt.flags.splice(i,1);b.classList.toggle('on',i<0);});
 const note=document.getElementById('svNote');
 const off=document.getElementById('svOff');
 if(off)off.onchange=()=>{rt.off=off.checked;note.hidden=!rt.off;};
 // Typing a note must not move the menu focus or pause the game.
 note.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'||e.key==='Escape')note.blur();});
 const save=go=>()=>{rt.note=note.value.trim();if(rt.diff||rt.fun||rt.flags.length||rt.note||rt.off){rt.at=new Date().toISOString();L.rating=rt;}(context?.write||write)();go();};
 if(nav.hasNext)document.getElementById('svNext').onclick=save(nav.next);
 document.getElementById('svAgain').onclick=save(nav.again);
 document.getElementById('svChapters').onclick=save(nav.chapters);
}

/* The menu panel: switch on/off, progress, export, reset. */
function panel(nav){
 const {n,rated}=api.progress();
 nav.showOverlay(`<div class="pcCard"><h1>Difficulty survey</h1>
 <p class="pcSub">A review run for sorting the levels by difficulty and theme. While it is on, every level counts its own deaths, time and retries from zero. After each level, rate it: difficulty 1–10 and fun 1–5, with optional flags and a note. Your cleared levels, shards and best deaths are untouched.</p>
 <table class="pcTable"><tr><td>Survey</td><td>${S.active?'on':'off'}</td></tr><tr><td>Levels rated</td><td>${rated} of ${n}</td></tr>${S.started?`<tr><td>Started</td><td>${esc(S.started.slice(0,10))}</td></tr>`:''}</table>
 <button class="pcBtn" id="svToggle" data-focus-first>${S.active?'Switch the survey off':'Switch the survey on'}</button>
 <div class="pcRow"><button class="pcBtn ghost" id="svExport">Export results (JSON + CSV)</button><button class="pcBtn ghost" id="svReset">Reset the survey…</button></div>
 <button class="pcBtn ghost" id="svBack" data-back>Back</button></div>`);
 document.getElementById('svToggle').onclick=()=>{S.active=!S.active;if(S.active&&!S.started)S.started=new Date().toISOString();write();panel(nav);};
 document.getElementById('svExport').onclick=exportAll;
 document.getElementById('svReset').onclick=()=>{if(confirm('Clear every survey rating and count? Your normal progress is kept.')){S={active:S.active,started:S.active?new Date().toISOString():null,levels:{}};write();panel(nav);}};
 document.getElementById('svBack').onclick=nav.back;
}

function rows(){
 return R().chapters.map((c,i)=>{const L=S.levels[c.id]||{runs:[],rating:null},f=L.runs[0],rt=L.rating||{};
  const sum=k=>f?Object.values(f.rooms).reduce((n,r)=>n+(+r[k]||0),0):'';
  return {order:i+1,label:labelOf(i),id:c.id,name:c.name,part:c.part||'I',rooms:c.rooms.length,palette:c.palette||'',
   difficulty:rt.diff||'',fun:rt.fun||'',flags:(rt.flags||[]).join(' '),note:rt.note||'',
   deaths:f?f.deaths:'',seconds:f?Math.round(f.frames/60):'',retries:sum('retries'),watched:f?Object.values(f.rooms).some(r=>r.watched)?1:0:'',
   played_before:f?(f.seenBefore?1:0):'',assist:f?((f.assist.stamina?'stamina ':'')+(f.assist.speed<1?'speed'+f.assist.speed:'')).trim():'',runs:L.runs.length,
   room_deaths:f?c.rooms.map(r=>f.rooms[r.id]?.deaths??'').join('/'):''};});
}
function download(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);}
function exportAll(){
 const day=new Date().toISOString().slice(0,10),r=rows(),cols=Object.keys(r[0]);
 const csv=[cols.join(','),...r.map(o=>cols.map(k=>{const v=String(o[k]);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;}).join(','))].join('\n');
 download(`precision-survey-${day}.csv`,csv,'text/csv');
 download(`precision-survey-${day}.json`,JSON.stringify({exported:new Date().toISOString(),survey:S,levels:r},null,1),'application/json');
}

/* Styles for the card and panel (the page's own sheet covers the rest). */
if(typeof document!=='undefined'){const st=document.createElement('style');st.textContent=`
 .svQ{margin:12px 0 6px;font-size:13px;color:#e9dcc0}.svDim{color:#7d8494;font-size:12px}
 .svScale{display:flex;flex-wrap:wrap;gap:4px}.svScale .pcMini{min-width:34px}
 .svPick.on{background:#c9a86a;color:#1a1408;border-color:#c9a86a}
 .svFlags{display:flex;flex-wrap:wrap;gap:6px;margin:14px 0 8px}.svFlag.on{border-color:#c9a86a;background:#3a3222;color:#f0d9a8}
 .svNote{width:100%;box-sizing:border-box;background:#1a1e27;color:#e9dcc0;border:1px solid #3a4150;font:inherit;font-size:13px;padding:8px;margin:4px 0 10px}
 .pcMeta .svTag{color:#c9a86a}`;document.head.appendChild(st);}


/* Room by Room uses the same review card, with its own records and a card at every exit. */
const ROOM_KEY='bladefall.rbr.survey.v1';
let RS;try{RS=JSON.parse(localStorage.getItem(ROOM_KEY));}catch(e){}
if(!RS||!RS.rooms)RS={active:true,rooms:{}};
const roomWrite=()=>{try{localStorage.setItem(ROOM_KEY,JSON.stringify(RS));}catch(e){}};
let roomRun=null;
const roomStats=id=>!roomRun?null:(roomRun.rooms[id]||(roomRun.rooms[id]={deaths:0,frames:0,retries:0,watched:false}));
api.rbr={
 active:()=>RS.active,
 start(ci,{assist}={}){roomRun={ci,at:new Date().toISOString(),assist:assist||{},rooms:{}};},
 frame(id){const r=roomStats(id);if(r)r.frames++;},
 death(id){const r=roomStats(id);if(r)r.deaths++;},
 retry(id){const r=roomStats(id);if(r)r.retries++;},
 watched(id){const r=roomStats(id);if(r)r.watched=true;},
 roomDone(ch,room,nav){
  if(!RS.active)return false;
  const stats=roomStats(room.id)||{deaths:0,frames:0,retries:0,watched:false};
  const L=RS.rooms[room.id]||(RS.rooms[room.id]={region:ch.rbr,name:room.name,runs:[],rating:null});
  L.runs.push({at:roomRun?.at||new Date().toISOString(),assist:roomRun?.assist||{},seenBefore:L.runs.length>0,deaths:stats.deaths,frames:stats.frames,rooms:{[room.id]:{...stats}}});
  if(roomRun)delete roomRun.rooms[room.id];
  roomWrite();card(0,L,nav,{chapter:room,label:ch.name,write:roomWrite});return true;
 },
 panel(nav){
  const rated=Object.values(RS.rooms).filter(r=>r.rating).length;
  nav.showOverlay(`<div class="pcCard"><h1>Room reviews</h1><p class="pcSub">After each room: difficulty 1–10, fun 1–5, and an optional report of anything that seemed off. Reviews are saved separately from your progress.</p><p>${rated} rooms reviewed</p><button class="pcBtn" id="rsvToggle">Room reviews: ${RS.active?'on':'off'}</button><button class="pcBtn ghost" id="rsvExport">Export reviews (JSON + CSV)</button><button class="pcBtn ghost" id="rsvBack" data-back>Back</button></div>`);
  document.getElementById('rsvToggle').onclick=()=>{RS.active=!RS.active;roomWrite();api.rbr.panel(nav);};
  document.getElementById('rsvBack').onclick=nav.back;
  document.getElementById('rsvExport').onclick=()=>{
   const rows=Object.entries(RS.rooms).map(([id,L])=>({id,region:L.region,name:L.name,difficulty:L.rating?.diff||'',fun:L.rating?.fun||'',off:!!L.rating?.off,note:L.rating?.note||'',runs:L.runs.length}));
   const cols=['id','region','name','difficulty','fun','off','note','runs'];
   const csv=[cols.join(','),...rows.map(r=>cols.map(k=>'"'+String(r[k]).replace(/"/g,'""')+'"').join(','))].join('\n');
   download('room-reviews.csv',csv,'text/csv');download('room-reviews.json',JSON.stringify(RS,null,2),'application/json');
  };
 }
};

root.BladefallPrecisionSurvey=api;
})(typeof window!=='undefined'?window:globalThis);
