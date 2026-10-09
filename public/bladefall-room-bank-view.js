/* Room bank: approved reserves and a separate review queue of revised/new candidates. */
(function(root){
'use strict';
const PV=root.BladefallPitchView,R=()=>root.BladefallPrecisionRooms,B=()=>root.BladefallRoomBank,S=()=>root.BladefallClimbSession;
const old={start:PV.start,menu:PV.menu,holding:PV.holding,exit:PV.exit,chapterDone:PV.chapterDone,palette:PV.palette};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tagName=t=>({'recoil-platform':'Recoil plates','impulse-seed':'Impulse seeds','moving-hook':'Moving anchors','cargo-clasp':'Cargo clasps','hinge-arm':'Hinged stone arms','step-relay':'Landing relays','vector-refill':'Directional crystals',sweeper:'Moving thorns',zip:'Moving carriage',zipline:'Tears'}[t]||t.replaceAll('-',' '));
const groupOf=x=>x.bank.acceptance==='banked'?'banked':x.bank.collection==='superrooms'?'superrooms':x.bank.run>=2?'run'+x.bank.run:x.bank.run===1?'run1':'review';
const groups=()=>B().groups||['run7','run6','run5','superrooms','run4','run3','run2','run1','review','banked'];
const groupButton=g=>g==='superrooms'?'bankSuperrooms':g==='banked'?'bankApproved':g==='review'?'bankReview':'bankRun'+g.slice(3);
const groupLabel=g=>g==='superrooms'?'Superrooms':g==='banked'?'Banked':g==='review'?'Earlier review':g==='run1'?'Run 1 revisions':'Run '+g.slice(3);
const formatLabel=x=>x.bank.format==='extended'?`Extended room · ${x.room.cols||40} × ${x.room.rows||23} tiles`:x.bank.format==='superroom'?'Superroom':'Compact room';
let st=null,side='base',group='run'+(B().activeRun||7),difficulty='all';
function entries(){return B().records.filter(x=>x.bank.side===side&&groupOf(x)===group);}
function start(id){
 const record=B().records.find(x=>x.room.id===id);if(!record)return;
 side=record.bank.side;group=groupOf(record);
 const ci=R().chapters.findIndex(c=>c.bank===side&&c.bankGroup===group),ch=R().chapters[ci];if(!ch)return;
 const ri=Math.max(0,ch.rooms.findIndex(r=>r.id===id));
 syncModeLink(ch.rooms[ri].id);
 st.world={n:'bank-'+side+'-'+group,name:ch.name,atlasStart:ch.rooms[0].id,atlasEnd:ch.rooms.at(-1).id};
 st.api.startChapter(ci,ri);st.view.wipe=0;st.view.wipeTo=null;S().start();
 root.BladefallPrecisionView.clearInput();
}
function syncModeLink(id){const link=document.querySelector('#bsBar a');if(link)link.href='precision.html?pitch=bank&side='+side+'&group='+group+'&mode='+(S().state().mode==='review'?'play':'review')+(id?'&room='+encodeURIComponent(id):'');}
function menu(){
 syncModeLink();st.view.mode='menu';st.view.paused=false;st.view.replay=null;st.api.music(false);
 const all=B().records,rows=entries().filter(x=>difficulty==='all'||x.bank.difficulty===+difficulty);
 const count=(which,kind)=>all.filter(x=>(!which||x.bank.side===which)&&groupOf(x)===kind).length;
 st.api.showOverlay(`<div class="pcCard wide"><h1>Room Bank</h1><p class="pcSub">${group==='run7'?'Run 7: learn timed movement, develop it, then combine it in demanding patrol and return routes.':group==='run6'?'Run 6 revisions: deliberate portal relinking, an active hook ride, a rebuilt tide loop and corrected movement puzzles.':group==='run5'?'Run 5 review: revised cart, recoil and return-launch rooms, plus the retained ram puzzle. Approved rooms are in Banked.':group==='superrooms'?'The previous four superrooms remain here for later refinements and review.':group==='run4'?'Run 4: new movement techniques meet recoil plates, impulse seeds and moving anchors.':group==='run3'?'Run 3 revision: the fixed divider makes the slingshot the intended route. Approved rooms are in Banked.':group==='run2'?'Run 2 revisions: more forgiving reverse launches. The approved parry-and-wavedash route is Banked.':group==='run1'?'Run 1 approvals are in Banked.':group==='banked'?'Approved reserves, kept outside campaign progression.':'Earlier revisions and candidates awaiting your review.'} Difficulty is an author estimate.</p>
 <div class="pcRow">${groups().map(g=>`<button class="pcBtn ${group===g?'':'ghost'}" id="${groupButton(g)}">${groupLabel(g)} · ${count(null,g)}</button>`).join('')}</div>
 <div class="pcRow"><button class="pcBtn ${side==='base'?'':'ghost'}" id="bankBase">Base · ${count('base',group)}</button><button class="pcBtn ${side==='fractured'?'':'ghost'}" id="bankFractured">Fractured · ${count('fractured',group)}</button></div>
 <label class="pcOpt">Estimated difficulty <select id="bankDifficulty"><option value="all">All</option>${[1,2,3,4,5].map(n=>`<option value="${n}" ${String(n)===difficulty?'selected':''}>${n} / 5</option>`).join('')}</select></label>
 <div class="pcGrid">${rows.map(x=>`<button class="pcChoice" data-bank-room="${x.room.id}"><span class="pcNum">${esc(x.room.id.replace('bank-','').toUpperCase())}</span><span class="pcName">${esc(x.room.name)}</span><span class="pcDesc">${esc(x.bank.tags.map(tagName).join(' · '))}</span><span class="pcMeta">${x.bank.acceptance==='banked'?(x.bank.reclassifiedFrom?'Banked · moved to '+(x.bank.side==='base'?'Base':'Fractured'):'Banked'):x.bank.acceptance==='revised'?'Revised · review again':x.bank.collection==='superrooms'?'Superroom · review pending':x.bank.run>=2?'Run '+x.bank.run+' candidate':x.bank.run===1?'Run 1 candidate':'New candidate'} · Estimated ${x.bank.difficulty}/5${x.bank.format?' · '+formatLabel(x):''}${x.bank.newMechanics.length?(x.bank.run>=5?' · full synthesis':x.bank.collection==='superrooms'?' · shared systems':x.bank.run===4?' · movement + entity':x.bank.run===3?' · new entity':x.bank.run===2?' · new movement':' · new mechanic'):''}</span></button>`).join('')}</div>
 ${rows.length?'':'<p class="pcSub">No rooms match this selection.</p>'}
 <button class="pcBtn" id="bankSet" ${entries().length?'':'disabled'}>Start all ${entries().length} ${side==='base'?'base':'Fractured'} rooms ${group==='banked'?'in the bank':'to review'}</button><a class="pcBtn ghost" href="index.html" data-back>Title menu</a></div>`);
 const chooseGroup=value=>{group=value;if(!entries().length){side=side==='base'?'fractured':'base';}menu();};
 for(const g of groups())document.getElementById(groupButton(g)).onclick=()=>chooseGroup(g);
 document.getElementById('bankBase').onclick=()=>{side='base';menu();};
 document.getElementById('bankFractured').onclick=()=>{side='fractured';menu();};
 document.getElementById('bankDifficulty').onchange=e=>{difficulty=e.target.value;menu();};
 document.getElementById('bankSet').onclick=()=>start(entries()[0]?.room.id);
 document.querySelectorAll('[data-bank-room]').forEach(b=>b.onclick=()=>start(b.dataset.bankRoom));
 st.view.g=null;S().refresh();
}
PV.start=function(q,api){
 if(q.get('pitch')!=='bank')return old.start.call(this,q,api);
 document.title='Bladefall · Room Bank';side=q.get('side')==='fractured'?'fractured':'base';group=groups().includes(q.get('group'))?q.get('group'):'run'+(B().activeRun||7);
 st={api,view:api.view,world:null,sessionConfig:{title:'Room Bank',baseUrl:'precision.html?pitch=bank',build:B().version,unit:'Set',suitability:'1 = poor fit · 5 = excellent fit for the suggested worlds and role',describe:d=>{const b=d.bank;return b?`${b.side==='base'?'Base':'Fractured'}${b.run?' · Run '+b.run:''} · ${b.acceptance==='banked'?'banked':b.acceptance==='revised'?'revised':'new candidate'} · ${b.worlds.length?'suggested worlds '+b.worlds.join(', '):'placement to review'} · ${b.role}`:'';}}};
 S().init(st,q);menu();
 const requested=q.get('room');if(B().records.some(x=>x.room.id===requested))start(requested);
 return true;
};
PV.menu=function(){if(!st)return old.menu.call(this);menu();return true;};
PV.holding=function(){if(!st)return old.holding.call(this);if(st.lastRoom!==st.view.g?.room.id){st.lastRoom=st.view.g?.room.id;syncModeLink(st.lastRoom);}S().tick();return false;};
PV.exit=function(view,nextRoom){
 if(!st)return old.exit.call(this,view,nextRoom);
 const resume=()=>{view.wipe=16;view.wipeTo=nextRoom;};
 if(S().complete(view.g.room.def,resume))return true;
 return false;
};
PV.chapterDone=function(ci,api){
 if(!st)return old.chapterDone.call(this,ci,api);
 st.view.mode='card';st.view.replay=null;api.music(false);
 api.showOverlay(`<div class="pcCard"><h1>${esc(R().chapters[ci].name)} complete</h1><p class="pcSub">Reviews keep each room’s stable ID and revision. Approved rooms remain available in the Banked tab.</p><button class="pcBtn" id="bankAgain">Replay this set</button><button class="pcBtn ghost" id="bankMenu" data-back>Room Bank</button></div>`);
 document.getElementById('bankAgain').onclick=()=>start(entries()[0].room.id);document.getElementById('bankMenu').onclick=menu;return true;
};
PV.palette=function(ch){if(!st)return old.palette.call(this,ch);return root.BladefallPrecisionView?.palettes[st.view.g?.room.def.palette]||root.BladefallPrecisionView?.palettes[side==='base'?'causeway':'throne'];};
root.BladefallRoomBankView={menu,start,state:()=>st};
})(globalThis);
