/* Intended routes for level-builder drafts (7.340). A draft copied from the game keeps the game's route in
   definition.route; Test play checks it against the edited room, records a clean clear as the new route,
   and can search for one (bladefall-route-solver.js) that follows the old route or the player's own run.
   Builder side: describe() and bar(). Test-play side: check(), begin(), frame(), fresh(), exit(). */
(function(root){
'use strict';
const RS=()=>root.BladefallRouteSolver,TYPE='bladefall-workshop-route',COMMAND='bladefall-workshop-route-command';
const send=data=>root.parent.postMessage({type:TYPE,...data},root.location.origin);
const keysOf=inp=>[['l','l'],['r','r'],['u','u'],['d','d'],['jump','j'],['dash','x'],['grab','g'],['strike','s'],['parry','p'],['portal','q']].filter(([k])=>inp[k]).map(([,k])=>k).join('');
const secs=f=>(f/60).toFixed(1)+' s';

/* ---------------------------------------------------------------- seeding (pages that run the game) */
// The game's own route for a room, stored with the physics flags the game plays that room with.
function seed(room,tape,flags={}){try{return RS()?.route(room,tape,{flags,source:'original'})||null;}catch{return null;}}
function attach(definition,tape,flags={}){if(definition?.kind!=='ascend'||definition.route)return definition;const room=root.BladefallWorkshopAscend.compile(definition);
 const route=tape?seed(room,tape,flags):null;return {...definition,route:route||{tape:null,path:[],flags,source:'none',room:RS()?.digest(room)||''}};}

/* ---------------------------------------------------------------- builder */
function describe(doc){const r=doc?.definition?.route;if(doc?.mode!=='ascend')return '';if(!r?.tape)return 'No intended route yet · clear the level in Test play to record one';
 let current=false;try{current=RS().digest(root.BladefallWorkshopAscend.compile(doc.definition))===r.room;}catch{}
 return current?`Intended route (${r.source}) fits this version`:`Level edited since its intended route was made · Test play checks it`;}
// Route controls on the Test play bar. Returns a cleanup function.
function bar({bar,status,frame,doc,ui}){
 if(doc.mode!=='ascend')return ()=>{};
 const info=document.createElement('span'),watch=document.createElement('button'),find=document.createElement('button'),use=document.createElement('button');
 info.style.cssText='opacity:.85';watch.textContent='Watch route';find.textContent='Find a route';use.textContent='Use my run';watch.hidden=find.hidden=use.hidden=true;
 bar.append(watch,find,use,info);let pending=null,fits=false,busy=false;
 const command=(action,extra={})=>frame.contentWindow.postMessage({type:COMMAND,document:doc.id,action,...extra},root.location.origin);
 const show=()=>{watch.hidden=!fits||busy;find.hidden=busy;use.hidden=!pending||busy;};
 function adopt(route,text){if(!ui.apply({path:['definition','route'],value:route}))return;fits=true;pending=null;command('adopted',{route});info.textContent=text;show();}
 watch.onclick=()=>command('watch');
 find.onclick=()=>{busy=true;show();info.textContent='Searching for a route…';command('solve');};
 use.onclick=()=>{if(pending?.route){adopt(pending.route,'Your clear is now the intended route · Watch route to see it');return;}busy=true;show();info.textContent='Making a clean route from your run…';command('solve-run');};
 const receive=e=>{if(e.source!==frame.contentWindow||e.origin!==root.location.origin||e.data?.type!==TYPE||e.data.document!==doc.id)return;const m=e.data;
  if(m.event==='status'){fits=!!m.ok;info.textContent=m.ok?`Intended route fits (${m.source}, ${secs(m.frames)})`:m.has?`Your edits broke the intended route (it ${m.death>=0?'dies at '+secs(m.death):'stops short of the exit'}) · clear the level without dying to record a new one, or Find a route`:'No intended route yet · clear the level without dying to record one, or Find a route';}
  else if(m.event==='progress')info.textContent=m.text;
  else if(m.event==='route'){busy=false;if(m.kind==='solved'||!fits)adopt(m.route,m.kind==='solved'?`Found a route (${secs(m.route.frames)}) and saved it · Watch route to check it`:`Recorded your clean clear (${secs(m.route.frames)}) as the intended route`);else{pending={route:m.route};info.textContent='Clean clear · Use my run to make it the intended route';}}
  else if(m.event==='attempt'){pending={attempt:true};info.textContent=`You reached the exit with ${m.deaths} death${m.deaths===1?'':'s'} · Use my run to make a clean route that follows it`;}
  else if(m.event==='failed'){busy=false;info.textContent='No route found: '+m.reason+' · clear the level without dying to record one';}
  else if(m.event==='watched')status.textContent='The intended route reached the exit · Restart test to play';
  show();};
 root.addEventListener('message',receive);return ()=>root.removeEventListener('message',receive);
}

/* ---------------------------------------------------------------- test play */
let live=null;   // {doc,room,route,flags,lives,life,attempt,solving}
// Does the draft's route still reach the exit in the edited room? Run before the test registers tapes.
function check(doc,room){const route=doc.definition?.route;if(!route?.tape||!RS())return {has:false,ok:false};const r=RS().play(room,route.tape,{flags:route.flags||{}});return {has:true,ok:r.ok,death:r.death,frames:r.ok?r.exit+1:r.frames,source:route.source};}
function begin(doc,room,g,checked){
 const route=doc.definition?.route,flags=route?.flags||{},C=root.BladefallPrecisionCore;
 if(flags.dropThru!=null)g.dropThru=!!flags.dropThru;if(flags.springUp!=null)g.springUp=!!flags.springUp;
 // Start the test the way Watch and the solver start it: entered with the test's own rules in place.
 C.enterRoom(g,g.roomIndex);live={doc,room,route,flags,lives:[],life:null,attempt:null,solving:false};fresh(g);
 send({document:doc.id,event:'status',...(checked||{has:false,ok:false})});
}
const atSpawn=g=>Math.abs(g.p.x-g.room.spawn.x)<1&&Math.abs(g.p.y-g.room.spawn.y)<1;
function fresh(g){if(!live||!g)return;live.lives=[];live.life={fresh:atSpawn(g),keys:[],poses:[],died:false};}
function frame(g,inp){
 if(!live||live.solving)return;const p=g.p;
 if(!live.life){if(p.state==='dead'||p.state==='respawn')return;live.life={fresh:false,keys:[],poses:[],died:false};}
 const life=live.life;if(life.keys.length>60*60*20)return;
 life.keys.push(keysOf(inp));if(life.keys.length%RS().SAMPLE===1)life.poses.push(RS().pose(g));
 if(g.events.some(e=>e.type==='death')){life.died=true;live.lives.push(life);if(live.lives.length>400)live.lives.shift();live.life=null;}
}
// The run that reached the exit, back through the earlier lives that reached each place it restarted from.
function chain(){const out=[live.life];let first=live.life;
 for(let i=live.lives.length-1;i>=0&&!first.fresh;i--){const L=live.lives[i],s=first.poses[0];if(!s)break;const j=L.poses.findIndex(q=>Math.hypot(q[0]-s[0],q[1]-s[1])<12);if(j<0)continue;out.unshift({...L,poses:L.poses.slice(0,j+1)});first=L;}
 return out.flatMap(l=>l.poses);}
function exit(watched){
 if(!live)return;if(watched){send({document:live.doc.id,event:'watched'});return;}
 const life=live.life;if(!life)return;
 if(life.fresh&&!life.died){const route=RS().route(live.room,RS().zip(life.keys),{flags:live.flags,source:'recorded'});if(route.ok){send({document:live.doc.id,event:'route',kind:'clean',route});return;}}
 live.attempt={path:chain()};send({document:live.doc.id,event:'attempt',deaths:live.lives.length});
}
async function solve(path){
 const V=root.BladefallPrecisionView;if(!live||live.solving)return;live.solving=true;if(V)V.view.paused=true;
 try{const r=await RS().solveAsync(live.room,{tape:live.route?.tape||null,path:path||live.route?.path||null,flags:live.flags,onProgress:p=>{if(p.text)send({document:live.doc.id,event:'progress',text:'Searching · '+p.text});}});
  if(r.ok)send({document:live.doc.id,event:'route',kind:'solved',route:{...r.route,source:'solved'}});else send({document:live.doc.id,event:'failed',reason:r.reason});}
 catch(e){send({document:live.doc.id,event:'failed',reason:e.message});}
 finally{live.solving=false;}
}
root.addEventListener?.('message',e=>{
 if(!root.BLADEFALL_WORKSHOP_PLAY||!live||e.source!==root.parent||e.origin!==root.location.origin||e.data?.type!==COMMAND||e.data.document!==live.doc.id)return;
 const V=root.BladefallPrecisionView,R=root.BladefallPrecisionRooms,m=e.data;
 if(m.action==='watch'&&R.tapes[live.room.id]&&V){V.view.paused=false;const o=document.getElementById('pcOverlay');if(o){o.classList.remove('show');o.innerHTML='';}V.watchRoute();}
 else if(m.action==='solve')void solve(null);
 else if(m.action==='solve-run'&&live.attempt)void solve(live.attempt.path);
 else if(m.action==='adopted'&&Array.isArray(m.route?.tape)){live.route=m.route;R.tapes[live.room.id]=m.route.tape;}
});
root.BladefallWorkshopRoutes=Object.freeze({seed,attach,describe,bar,check,begin,frame,fresh,exit,state:()=>live});
})(globalThis);
