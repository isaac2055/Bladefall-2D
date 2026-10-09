/* Bladefall — ACT THREE · the rift shards (2026-09-24).

   Your Echo stayed on the Throne's beach when the boat left, and then it walked your roads
   backwards. Everywhere it passed it left a sliver of itself: a rift shard, violet glass that
   hums. There is one in each of the twenty regions of Acts One and Two. They are never on the
   road: each is behind a conversation, a quest, a hidden place or a road you did not have to
   take. Each shard immediately opens its matching echo — the Fractured regions of Act Three.

   Making the collection clear: the first shard you find explains itself on a card; every
   shard after says which region it came from and how many you hold; the ledger (title screen,
   and the end of Act Two) lists every region, what you hold, and a hint for what you don't.

   The page carries one-line hooks only (index.html is over its size budget): install and
   update each frame (`update`), the draw call in the renderer (`draw`), conversations
   (`converse` / `chose`), finished quests (`questDone`), and the title's button. */
(function installRiftShards(root){
'use strict';

const TOTAL = 20;
/* how: 'dialogue' — a question someone answers; 'quest' — a quest's reward; 'hidden' — a place
   off the road; 'route' — at the end of a road you did not have to take. */
const SHARDS = [
  // (Olan the Road Keeper is a quiet figure in the v4 regions: he cannot be asked. The shard is on
  // the climb above his cut instead — the Outskirts' Sealed Recollection, a return-visit route.)
  { id:'outskirts', stage:0, region:'The Outskirts', how:'route', x:6830, y:515,
    hint:'Above the signal mast at the Watcher’s Cut, where only a climb goes: the road before.' },
  { id:'black-woods', stage:1, region:'Black Woods', how:'route', x:9430, y:605,
    hint:'The long way round, where the wood lies about the road.' },
  { id:'causeway', stage:2, region:'Broken Causeway', how:'quest', quest:'release-the-causeway',
    hint:'Oren has work that needs doing on the Causeway.' },
  { id:'updrafts', stage:3, region:'The Updrafts', how:'route', x:9020, y:900,
    hint:'At the end of the Needlewind branch that goes nowhere.' },
  { id:'marksman', stage:4, region:'Hollow Marksman', how:'quest', quest:'the-open-watch',
    hint:'Daro keeps an open watch, and wants it kept.' },
  { id:'keep', stage:5, region:'Ruined Keep', how:'hidden', x:16810, y:1080,
    hint:'High in the Keep, among the masked bells.' },
  { id:'warden', stage:6, region:'The Warden', how:'route', x:5480, y:805,
    hint:'In the sealed cell, off the road, where a sentence was read before yours.' },
  { id:'frostfell', stage:7, region:'Frostfell', how:'quest', quest:'kindling-the-sky',
    hint:'Someone out in the cold wants the sky lit.' },
  { id:'sorcerer', stage:8, region:'Frost Sorcerer', how:'route', x:11370, y:200,
    hint:'Along the petitioners’ gallery, by the cold hand.' },
  { id:'emberdeep', stage:9, region:'Emberdeep', how:'quest', quest:'couriers-proof',
    hint:'A courier needs proof carried where she cannot go.' },
  { id:'colossus', stage:10, region:'Ember Colossus', how:'hidden', x:16150, y:-100,
    hint:'Down where the Furnace General was cast.' },
  { id:'inversion', stage:11, region:'The Inversion', how:'hidden', x:520, y:262,
    hint:'In the sanctum on the ceiling.' },
  { id:'tyrant', stage:12, region:'The Void Tyrant', how:'hidden', x:15900, y:260,
    hint:'In the roof loft where the Citadel’s last refugee slept.' },
  { id:'king', stage:13, region:'The Abyss King', how:'hidden', x:18370, y:-900,
    hint:'On the Throne’s beach, above the tide, where you left it.' },
  { id:'deep-line', stage:15, region:'The Deep Line', how:'route', x:13700, y:90,
    hint:'At the end of the line that remembers — if you ever found the Deep Line.' },
  { id:'cliffs', stage:16, region:'Thunder Cliffs', how:'hidden', x:1600, y:370, ship:true,
    hint:'Up in the rigging, past the end of the yard.' },
  { id:'shores', stage:17, region:'The Landing Shores', how:'dialogue', look:'cloth',
    hint:'Something violet is caught on the jetty’s gilt nails.' },
  { id:'colony', stage:18, region:'The Colony', how:'dialogue', npc:'sick-woman',
    hint:'The woman by the Colony’s gate has seen more than the King.' },
  { id:'path', stage:19, region:'The Path to the Palace', how:'route', x:5740, y:660,
    hint:'Below the lip of the Hydra Overlook, if you dare the drop.' },
  { id:'palace', stage:20, region:'Sunspire Palace', how:'dialogue', npc:'servant',
    hint:'The servant in the gold mask noticed your face.' },
];
const BY_ID = Object.fromEntries(SHARDS.map(s => [s.id, s]));

/* ── State ─────────────────────────────────────────────────────────────────
   Held shards are the save's (meta.riftShards); a Level Select run keeps its own, like its
   quests and zone state, and never writes the save. */
function store(){
  if(typeof G !== 'undefined' && G && G.levelSelectMode) return G.sessionRiftShards || (G.sessionRiftShards = {});
  if(typeof meta === 'undefined') return {};
  return meta.riftShards || (meta.riftShards = {});
}
function held(id){ return !!store()[id]; }
function count(){ const s = store(); return SHARDS.filter(x => s[x.id]).length; }
function complete(){ return count() >= TOTAL; }

function grant(id){
  const S = BY_ID[id]; if(!S || held(id)) return false;
  const first = count() === 0;
  store()[id] = true;
  const echo=builtStage(S.stage);if(echo!=null)root.BladefallPlaytest?.unlock('explore',echo);
  meta.riftPortals=meta.riftPortals||{};meta.riftPortals[S.stage]={x:G.p.x+48,y:G.p.y,to:echo};
  persist();
  try{ if(!(G && G.levelSelectMode)) persist(); }catch(_e){}
  try{ if(meta.soundOn) SFX.magic(); }catch(_e){}
  try{
    const p = G.p;
    for(let i = 0; i < 18; i++) G.particles.push({ x:p.x + (Math.random() - 0.5) * 30, y:GROUND_Y - p.y - 24 - Math.random() * 30,
      vx:(Math.random() - 0.5) * 160, vy:-60 - Math.random() * 120, sz:2 + Math.random() * 2, color:i % 3 ? '#b98cff' : '#f0e6ff', life:0.7 });
  }catch(_e){}
  if(first) pendingCard = S; else try{ toast(`<b style="color:#c9a8ff">RIFT SHARD</b> · ${S.region} — ${count()} of ${TOTAL}`, 3200); }catch(_e){}
  return true;
}
/* The first shard explains the collection, once — when whatever was open (a conversation) has closed. */
let pendingCard = null;
function firstCard(S){
  try{
    mode = 'conversation';
    BladefallConversation.show({ title:'A RIFT SHARD', accent:'#b98cff',
      text:`A sliver of violet glass, cold, and humming like a struck bell. It is the colour your Echo was.\n\nIt came this way — backwards, down a road you had already walked — and it left this behind. There will be one in every region you have crossed: twenty. Each shard opens its matching Fractured region immediately. A violet portal waits here; press your Take Item control beside it to enter. You can return through the portal or select the unlocked echo from Level Select.\n\n${S.region}: 1 of ${TOTAL}.`,
      onClose:() => { mode = 'play'; try{ showOverlay(false); showGameUI(true); hudUpdate(); }catch(_e){} } });
  }catch(_e){ try{ toast('<b>RIFT SHARD</b> · 1 of ' + TOTAL, 3200); }catch(_e2){} }
}

/* ── Shards in the world (hidden places and roads you did not have to take) ── */
let lastObs = null;
function install(){
  if(typeof G === 'undefined' || !G || !G.obstacles) return;
  if(lastObs === G.obstacles) return;
  for(const S of SHARDS)if(held(S.id)||meta.riftShards?.[S.id]){const echo=builtStage(S.stage);if(echo!=null)root.BladefallPlaytest?.unlock('explore',echo);}
  lastObs = G.obstacles;
  for(const S of SHARDS){
    if(S.stage !== G.stageIndex || S.x == null || held(S.id)) continue;
    if(G.obstacles.some(o => o.riftShard === S.id)) continue;
    // At the spot's own height: a recollection floats up to ~45 over its ledge, so standing there takes it.
    const o = { type:'riftShard', riftShard:S.id, x:S.x, y:S.y, w:34, h:44, t:0 };
    // On the Thunder Cliffs the shard is in the ship's rigging: it moves when the ship is shoved.
    if(S.ship){ o.actShip = 1; o.x += (G.actTwo && G.actTwo.shipOff) || 0; }
    G.obstacles.push(o);
  }
}
function update(dt){
  if(typeof G === 'undefined' || !G || !G.p) return;
  install();
  updateRiftPortal(dt);
  if(typeof mode !== 'undefined' && mode !== 'play') return;
  if(pendingCard){ const S = pendingCard; pendingCard = null; firstCard(S); return; }
  const p = G.p; if(p.dead) return;
  for(const o of G.obstacles){
    if(o.type !== 'riftShard' || o.gone) continue;
    o.t = (o.t || 0) + dt;
    if(Math.abs(p.x - o.x) < 30 && Math.abs(p.y + p.h / 2 - o.y) < 60){ o.gone = true; grant(o.riftShard); }
  }
}
/* Drawn by the renderer in every region: violet glass, turning, with a slow pulse of light. */
function draw(api){
  if(typeof G === 'undefined' || !G || !G.obstacles) return;
  drawRiftPortal(api);
  const { B, WX, WY } = api, t = api.time || 0;
  for(const o of G.obstacles){
    if(o.type !== 'riftShard' || o.gone) continue;
    const x = WX(o.x), y = WY(o.y) + Math.round(Math.sin(t * 2 + o.x) * 2);
    if(x < -30 || x > api.bw + 30) continue;
    api.glow(x, y, 22, '185,140,255', .35 + .15 * Math.sin(t * 3));
    const w = Math.max(1, Math.round(3 + 2 * Math.cos(t * 1.7)));
    B(x - w, y - 9, w * 2, 18, '#8a5cd8'); B(x - w + 1, y - 12, Math.max(1, w * 2 - 2), 3, '#b98cff'); B(x - w + 1, y + 9, Math.max(1, w * 2 - 2), 3, '#6b3fb0');
    B(x - 1, y - 8, 1, 14, '#f0e6ff');
    if((t * 4 + o.x) % 3 < .2) B(x + 4, y - 14, 1, 1, '#ffffff');
  }
}

/* ── Conversations ─────────────────────────────────────────────────────────
   A shard held by someone is a question you can ask them. It gets its own conversation (its
   own attitude key), so choosing another line first does not close it off: ask again later. */
function asks(){ const m = typeof meta !== 'undefined' ? meta : {}; return (G && G.levelSelectMode) ? (G.sessionRiftAsks || (G.sessionRiftAsks = {})) : (m.riftAsks || (m.riftAsks = {})); }
const TALKS = {
  'sick-woman':{ id:'colony',
    line:'She pulls her blanket closer. “Before the King, another one came through that gate. Looked like you. Didn’t stop—went straight through the tents like we weren’t there, and a bell rang for it that nobody pulled.”',
    responses:[
      ['What did it leave behind?', '“A bit of itself. Glass. Fell out of the air right by my cup.” She holds it out. It is violet, and it hums against your palm.', true],
      ['Did it hurt anyone?', '“Didn’t so much as look at anyone. That was worse, somehow.”'],
      ['You’re feverish.', '“We all are. Doesn’t mean I didn’t see it.”'],
    ] },
  servant:{ id:'palace',
    line:'The servant stops scrubbing. Under the gold mask her eyes go to your face and stay there. “You were here already, sir. Last night, in the Hall of Hours. You stood in front of the big dial and it went backwards.”',
    responses:[
      ['That wasn’t me. What did it leave?', '“This, sir. On the floor under the dial.” She wipes a sliver of violet glass on her apron and gives it to you. “I’ve tried polishing it. It won’t take a shine.”', true],
      ['Backwards?', '“A quarter to four, then half past three, then three. Then it was gone.”'],
      ['Keep scrubbing.', '“Yes, sir. The gold’s for him.”'],
    ] },
};
function converse(source, title, line, options){
  if(!source) return null;
  const key = source.residentId || source.actId || null, T = key && TALKS[key];
  if(!T || held(T.id)) return null;
  const n = asks()[T.id] || 0;
  return { line:T.line, options:Object.assign({}, options || {}, { person:true, interaction:'rift-shard:' + T.id + ':' + n,
    responses:T.responses.map(r => [r[0], r[1], T.id, !!r[2]]) }) };
}
/* A response was chosen: give the shard if it was the right question; otherwise the question
   stays open for another visit. */
function chose(r){
  if(!r || !r[2]) return;
  if(r[3]) grant(r[2]);
  else { const a = asks(); a[r[2]] = (a[r[2]] || 0) + 1; try{ if(!(G && G.levelSelectMode)) persist(); }catch(_e){} }
}
/* Things you look at (the Landing Shores' violet silk). */
function look(what){
  const S = SHARDS.find(s => s.look === what); if(!S || held(S.id)) return '';
  grant(S.id);
  return '<br><br>Knotted in the silk, a sliver of violet glass. It hums when you touch it.';
}
function questDone(questId){ const S = SHARDS.find(s => s.quest === questId); if(S) grant(S.id); }

/* ── The ledger, and the way into Act Three ────────────────────────────────── */
function ledgerRows(){
  return SHARDS.map(S => {
    const got = held(S.id);
    return `<div class="choice" style="cursor:default;padding:9px 12px;">
      <div class="cname" style="font-size:14px;"><span style="color:${got ? '#c9a8ff' : 'var(--muted)'};min-width:22px;display:inline-block;">${got ? '◆' : '◇'}</span>${S.region}
      <span class="ckey">${got ? 'FOUND' : S.how.toUpperCase()}</span></div>
      ${got ? '' : `<div class="cdesc">${S.hint}</div>`}</div>`;
  }).join('');
}
function showLedger(onBack, fromActTwo){
  const done = SHARDS.some(S=>held(S.id)||meta.riftShards?.[S.id]);
  const intro = fromActTwo
    ? 'The hydra sets you down on the island’s shore. Your Echo is not here. It went back into the roads you walked, and every region kept a piece of it.'
    : 'Your Echo is hiding in the echoes of the roads you walked. Every region kept a piece of it.';
  showOvHTML(`<div class="card"><p class="ovsub" style="letter-spacing:.3em;margin:0 0 6px;">ACT THREE · THE ECHOES</p>
    <h2 class="ovh" style="margin:0 0 6px;">Rift Shards — ${count()} of ${TOTAL}</h2>
    <p class="ovsub" style="margin:0 0 12px;">${intro} ${done ? 'Your collected shards have opened their matching echoes.' : 'Each shard opens its matching echo immediately.'}</p>
    <div class="choices" id="riftList" style="max-height:44vh;overflow-y:auto;gap:8px;">${ledgerRows()}</div>
    <button class="bigbtn" id="riftGo" ${done ? '' : 'disabled style="opacity:.4;"'}>${done ? 'Choose an unlocked Fractured world' : 'Find a shard to open its echo'}</button>
    <button class="bigbtn ghost" id="riftBack">Back</button></div>`);
  const go = document.getElementById('riftGo'); if(go && done) go.onclick = ()=>{lvlSelTab='fx';openLevelSelect();};
  const back = document.getElementById('riftBack'); if(back) back.onclick = () => (onBack || titleScreen)();
}
function beginActThree(){
  const A3 = root.BladefallFracturedOutskirts;
  if(!complete() || !A3) return;
  try{ if(typeof coopActive==='function'&&coopActive()){if(NET.isHost())coopStartRun('select',A3.STAGE);else openCoop();}else beginRun(0, null, { hp:1, dmg:1 }, { startStage:A3.STAGE }); }catch(_e){ titleScreen(); }
}
/* ── The Fractured regions: Act Three's echoes of all twenty ───────────────────
   Level Select's Fractured tab lists them all; a region is playable once its echo is built. */
const FRACTURED = [
  ['Fractured Outskirts', 0], ['Fractured Woods', 1], ['Fractured Causeway', 2], ['Fractured Updrafts', 3],
  ['Fractured Marksman', 4], ['Fractured Keep', 5], ['Fractured Warden', 6], ['Fractured Frostfell', 7],
  ['Fractured Sorcerer', 8], ['Fractured Emberdeep', 9], ['Fractured Colossus', 10], ['The Fractured Inversion', 11],
  ['The Fractured Tyrant', 12], ['The Fractured King', 13], ['The Fractured Line', 15], ['Fractured Cliffs', 16],
  ['Fractured Shores', 17], ['The Fractured Colony', 18], ['The Fractured Path', 19], ['Fractured Palace', 20],
];
function builtStage(source){
  const F = root.BladefallFractured;
  return F ? F.echoFor(source) : null;
}
/* Numbered 21–40, after the Base tab's 01–20 (owner, 2026-09-26). Fractured Celeste is reached from the title
   screen's Precision Courses, not here. The last row is the final echo's battle, 41, still to be built; the fight
   after it is the Base tab's 42. */
const FINAL_ECHO = { tag:'41', name:'The Final Echo' };
function levelSelectRows(){
  const last = `<button class="choice lvlbtn" disabled style="opacity:.5;border-color:#8a5cd8;"><div class="cname"><span style="color:#c9a8ff;min-width:26px;display:inline-block;">${FINAL_ECHO.tag}</span>${FINAL_ECHO.name}<span class="ckey">PLACEHOLDER · NOT YET BUILT</span></div></button>`;
  return FRACTURED.map(([name, source], i) => {
    const at = builtStage(source), tag = String(i + 21);
    if(at == null) return `<button class="choice lvlbtn" disabled style="opacity:.35;"><div class="cname"><span style="color:var(--muted);min-width:26px;display:inline-block;">${tag}</span>${name}<span class="ckey">NOT YET BUILT</span></div></button>`;
    if(!root.BladefallPlaytest?.unlocked('explore',at)&&!held(SHARDS.find(s=>s.stage===source)?.id)&&!meta.riftShards?.[SHARDS.find(s=>s.stage===source)?.id])return `<button class="choice lvlbtn" disabled><div class="cname">${tag} · ${name}<span class="ckey">Find its Rift Shard</span></div></button>`;
    return `<button class="choice lvlbtn" data-fx="${at}"><div class="cname"><span style="color:#c9a8ff;min-width:26px;display:inline-block;">${tag}</span>${name}<span class="ckey" style="text-transform:uppercase;">echo</span></div></button>`;
  }).join('') + last;
}
function titleButton(){
  if(typeof meta === 'undefined' || !(meta.actTwoDone || count() > 0)) return '';
  return `<button class="bigbtn ghost" id="riftBtn" style="border-color:#8a5cd8;">✦ Rift Shards — ${count()} of ${TOTAL}${complete() ? ' · Act Three' : ''}</button>`;
}
function bindTitle(){ const b = document.getElementById('riftBtn'); if(b) b.onclick = () => showLedger(titleScreen, false); }


/* Optional, persistent entrances. The campaign snapshot stays separate while an echo is explored. */
let portalCooldown=0;
function currentPortal(){
 if(!G)return null;
 if(G.stageIndex>=21&&G.stageIndex<=40){
  const source=SHARDS.find(S=>builtStage(S.stage)===G.stageIndex);if(!source)return null;
  G.riftEntrances=G.riftEntrances||{};const spawn=G.riftEntrances[G.stageIndex]||(G.riftEntrances[G.stageIndex]={x:G.p.x,y:G.p.y});
  return {...spawn,to:source.stage,returning:true};
 }
 return meta.riftPortals?.[G.stageIndex]||null;
}
function useRiftPortal(){
 const portal=currentPortal();if(!portal||portal.to==null)return false;
 root.BladefallPlaytest?.invalidate('left world through a Fractured portal');
 if(!portal.returning){
  const point={x:G.p.x,y:G.p.y},selected=!!G.levelSelectMode,prior=structuredClone(meta.run);
  saveRunAtStage(G.stageIndex,snapOf(G.p));
  meta.riftReturn={run:structuredClone(meta.run),point,echo:portal.to,selected,prior};meta.run=prior;persist();
  beginRun(0,null,{hp:1,dmg:1},{startStage:portal.to,levelSelect:true});
 }else if(meta.riftReturn?.echo===G.stageIndex){
  const back=meta.riftReturn;meta.run=back.run;persist();continueRun();
  G.p.x=back.point.x;G.p.y=back.point.y;G.p.ckX=G.p.x;G.p.ckY=G.p.y;G.p.ckSet=true;
  G.levelSelectMode=!!back.selected;if(back.selected)meta.run=back.prior;persist();
 }else beginRun(0,null,{hp:1,dmg:1},{startStage:portal.to,levelSelect:true});
 portalCooldown=1;return true;
}
function updateRiftPortal(dt){
 portalCooldown=Math.max(0,portalCooldown-dt);if(mode!=='play'||portalCooldown||G.p.dead)return;
 const portal=currentPortal();if(!portal)return;
 if(Math.abs(G.p.x-portal.x)<54&&Math.abs(G.p.y-portal.y)<80&&keyPressedFor('pickup'))useRiftPortal();
}
function drawRiftPortal(api){
 const p=currentPortal();if(!p)return;const {B,WX,WY}=api,x=WX(p.x),y=WY(p.y+28);
 if(x<-50||x>api.bw+50)return;api.glow(x,y,30,'185,140,255',.6);
 B(x-12,y-20,3,40,'#a378f4');B(x+9,y-20,3,40,'#a378f4');B(x-9,y-23,18,3,'#d9bbff');B(x-9,y+20,18,3,'#d9bbff');B(x-7,y-17,14,34,'#352550');
 if(Math.abs(G.p.x-p.x)<70)try{api.ctx.fillStyle='#e2ceff';api.ctx.font='10px monospace';api.ctx.textAlign='center';api.ctx.fillText(keyLabel(kbCode('pickup'))+' · '+(p.returning?'Return':'Fractured'),x,y-30);api.ctx.textAlign='left';}catch{}
}

root.BladefallRiftShards = Object.freeze({
  useRiftPortal,currentPortal,
  TOTAL, SHARDS, FRACTURED, held, count, complete, grant, install, update, draw, converse, chose, look, questDone,
  showLedger, beginActThree, titleButton, bindTitle, levelSelectRows,
});
})(typeof window !== 'undefined' ? window : globalThis);
