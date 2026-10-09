/* Bladefall — ACT THREE · the Fractured core (2026-09-24).

   What every echo shares, so each Fractured region is only its own rooms and its own C-side:
     the kit — the original's kit at that point of the journey (session capabilities, never the
       save's), and the blade handed over where the original handed it over;
     the Muster — forced on, each body given the role the Muster's own installer gives it;
     checkpoints, the echo-to-echo seam, the end card;
     the registry Level Select's Fractured tab reads (which echoes are built);
     the art's night: sky, hills, ash, the violet seams, the vignette.
   Echoes register with the Act Two core's region registry as stages 21+ (it owns seams,
   arrivals, foes and the art hook). */
(function installFracturedCore(root){
'use strict';
const A2 = root.BladefallActTwo;
if(!A2 || !A2.register) return;
const kit = A2.kit;

/* ── Which echoes exist ─────────────────────────────────────────────────── */
const ECHOES = {};                                   // source stage → echo stage
function registerEcho(source, stage){ ECHOES[source] = stage; }
function echoFor(source){ return Object.prototype.hasOwnProperty.call(ECHOES, source) ? ECHOES[source] : null; }
function nextEcho(stage){
  // Stage IDs are save identities; travel follows the originals, not construction order.
  const built = Object.keys(ECHOES).map(Number).sort((a, b) => a - b).map(source => ECHOES[source]);
  const at = built.indexOf(stage);
  return at < 0 ? null : (built[at + 1] ?? null);
}

/* ── The kit ──────────────────────────────────────────────────────────────── */
/* The first two echoes use only their corresponding base-game verbs (owner, 2026-09-27).
   Later echoes retain the existing dash policy. This is a temporary level kit, never a save edit. */
function setKit(ids){
  try{
    G.echoKit = ids.slice(); G.echoNoArsenal = !ids.includes('dash');
    G.sessionCapabilities = BFCapabilitiesModule.createState({ acquired:[21,22].includes(G.stageIndex)||ids.includes('dash') ? ids.slice() : ids.concat('dash') });
    if(!ids.includes('weapon')){ G.p.weapon = null; if(G.p.weapons) G.p.weapons = []; }
    else if(!G.p.weapon) G.p.weapon = oathbladeWeapon();
    syncMovementCapabilities(G.p); syncWeaponCapabilities(G.p);
  }catch(_e){}
}
function kitIds(){ try{ return (G.echoKit || G.sessionCapabilities && G.sessionCapabilities.acquired || []).slice(); }catch(_e){ return []; } }
/* An ability the original handed over part-way through its region (the Keep's Mason's Grip): add it to
   this session's kit only. */
function grant(id){
  const ids = kitIds(); if(!ids.includes(id)) ids.push(id);
  setKit(ids);
  try{ hudUpdate(); }catch(_e){}
}
function grantBlade(){
  const ids = kitIds(); if(!ids.includes('weapon')) ids.push('weapon');
  setKit(ids);
  try{ G.p.weapon = oathbladeWeapon(); syncWeaponCapabilities(G.p); hudUpdate(); }catch(_e){}
}

/* ── The Muster, on every echo ────────────────────────────────────────────── */
function muster(){
  G.musterForced = true;
  for(const e of G.enemies){
    if(e.actFoe || e.boss) continue;
    // The engine clamps a mustered body to [musterMin, musterMax] every frame; with no patrol those were
    // undefined and its x went NaN the first frame it moved. No patrol: a beat either side of where it stands.
    Object.assign(e, { muster:true, authoredEncounter:true, musterMin:e.patrolMin ?? e.x - 240, musterMax:e.patrolMax ?? e.x + 240 });
    if(['outrider', 'gaoler', 'canopywing', 'chainmarshal'].includes(e.type)){ e.musterRole = e.type; e.recallHomeY = e.y || 0; e.recallCooldown = 1.2; }
    if(e.type === 'signaler') e.musterRole = 'signaler';
    if(e.type === 'shieldbearer' || e.type === 'chainmarshal'){ e.frontShield = true; e.shieldFace = e.shieldFace || -1; e.turnDelay = 1.15; }
    try{ applyRecallBaseline(e); }catch(_e){}
  }
}

/* ── Checkpoints, the road on, the card ───────────────────────────────────── */
function checkpoints(A, p, zone, list){
  if(!p.onGround || p.dead) return;
  for(const c of list) if(!A.checkpoints[c.id] && Math.abs(p.x - c.x) < 60 && Math.abs(p.y - (c.y || 0)) < 6){
    A.checkpoints[c.id] = true;
    try{ activateRuntimeCheckpoint(zone + ':' + c.id, { x:c.x, y:c.y || 0 }, 'checkpoint', null, true); }catch(_e){}
  }
}
/* East out of an echo: into the next built echo by a walked seam, or the card that says what is next. */
function seamOn(stage, zone, connector, len, ready){
  const p = G.p, next = nextEcho(stage);
  if(!ready || next == null || !A2.handles(next) || p.x < len - 1400) return null;
  return { connector, zone, targetStage:next, warm:true, cross:p.x >= len - 62 && p.face > 0, forward:true, commitClear:true };
}
function endCard(behind, title, subtitle, line, built){
  if(typeof coopFinishTogether==='function'&&!coopFinishTogether('echo-end',()=>endCard(behind,title,subtitle,line,built)))return;
  mode = 'win'; showGameUI(false);
  showOvHTML(`<div class="card">
    <p class="ovsub" style="letter-spacing:.34em;margin:0 0 6px;">${behind}</p>
    <h1 class="title" style="margin:0 0 4px;">${title}</h1>
    <p class="subtitle" style="margin:0 0 18px;">${subtitle}</p>
    <p class="hint" style="margin:0 0 20px;">${line}${built ? '' : `<br>${title.replace(/^THE /, 'The ').toLowerCase().replace(/(^|\s)\S/g, s => s.toUpperCase())} is the next echo to be built.`}</p>
    <button class="bigbtn" id="echoGo">Continue</button></div>`);
  const b = document.getElementById('echoGo'); if(b) b.onclick = () => titleScreen();
}
function clear(stage){
  try{ commitStageCompletion(); }catch(_e){}
  try{ offerExploreWorldClear();recordWorldClear(); }catch(_e){}
  try{ recordSessionClear(stage); }catch(_e){}
}

/* ── The jump the echoes are built for (measured) — used by tests and by level checks ── */
const JUMP = { run:199, g:1349, vy:459, apex:78, far:136 };
function reach(dy, j){ const J = j || JUMP, d = J.vy * J.vy - 2 * J.g * dy; return d < 0 ? -1 : J.run * (J.vy + Math.sqrt(d)) / J.g; }

/* ── The night every echo shares (art helpers; api is the renderer's EXT_API) ── */
const skyCache = {};
function sky(api, cols, key){
  const k = key + api.bw + 'x' + api.bh;
  if(!skyCache[k]) skyCache[k] = api.layer(api.bw, api.bh, g => {
    const gr = g.createLinearGradient(0, 0, 0, api.bh);
    cols.forEach((c, i) => gr.addColorStop(i / (cols.length - 1) * .95, c));
    g.fillStyle = gr; g.fillRect(0, 0, api.bw, api.bh);
    for(let i = 0; i < 80; i++){ const x = (i * 97) % api.bw, y = (i * 53) % Math.round(api.bh * .5); g.fillStyle = i % 7 ? 'rgba(220,210,240,.3)' : 'rgba(201,168,255,.55)'; g.fillRect(x, y, 1, 1); }
  });
  api.ctx.drawImage(skyCache[k], 0, 0);
}
function bands(api, list, horizon){
  const { B, bw, bh } = api;
  list.forEach(([par, col, amp, f, shape], i) => {
    for(let x = 0; x < bw; x += 2){
      const wx = (x - bw / 2) / (api.Z * par) + api.camX + bw / (2 * api.Z);
      let h = Math.round(amp * (.6 + .4 * Math.sin(wx * f + i)) + 18 + Math.sin(wx * f * 3.1) * 6);
      if(shape === 'trees') h += Math.round(Math.abs(Math.sin(wx * .05)) * amp * .6 * (Math.floor(wx / 23) % 2));
      B(x, horizon - h, 2, bh - horizon + h, col);
    }
  });
}
function ash(api, col){
  const { ctx, bw, bh } = api, t = api.time;
  ctx.fillStyle = col || 'rgba(190,180,200,.3)';
  for(let i = 0; i < 36; i++){ const x = ((i * 131 + t * 20 * (1 + i % 3)) % (bw + 20)) - 10, y = ((i * 71 + t * 28) % bh); ctx.fillRect(x, y, 1, 1); }
}
function seams(api, s, base, col){
  for(let x = s.x0; x < s.x1; x += 2){ const k = api.hash((x + base) >> 1, 21); if(k > .965){ api.B(x, s.y + 2, 1, 3 + Math.round(k * 20) % 6, col || '#8a5cd8'); if(k > .99) api.B(x, s.y + 1, 1, 1, '#c9a8ff'); } }
}
function vignette(api, rgb, a){
  const { ctx, bw, bh } = api;
  const g = ctx.createRadialGradient(bw / 2, bh / 2, bh * .35, bw / 2, bh / 2, bh * .85);
  g.addColorStop(0, `rgba(${rgb},0)`); g.addColorStop(1, `rgba(${rgb},${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, bw, bh);
}

root.BladefallFractured = Object.freeze({
  registerEcho, echoFor, nextEcho, setKit, kitIds, grant, grantBlade, muster, checkpoints, seamOn, endCard, clear, JUMP, reach,
  art:Object.freeze({ sky, bands, ash, seams, vignette }),
});
})(typeof window !== 'undefined' ? window : globalThis);
