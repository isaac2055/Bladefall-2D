/* Bladefall — ACT TWO (2026-09-23).

   Act Two lives in its own file because index.html is over its release budget. Like
   bladefall-coop-journey.js this is plain code over the page's globals (G, meta, Pl, Seam,
   hurtPlayer, ...), resolved at CALL time, so it may load before the inline script. The
   page reaches it through a handful of one-line hooks; nothing here runs on its own.

   STAGE 16 · THUNDER CLIFFS. The boat built from three countries leaves the Throne's
   beach and crosses a storm to the King's sea-gate, where his three-headed beast is
   chained to the harbour wall.

     THE VOYAGE IS TIMED, NOT WALKED. The ship stands still and the sea goes past it:
     every wave, bolt, hulk and chain arrives on a clock, the deck is honest stable
     ground (a flag can stand on it), and a death restarts the current LEG, not the
     crossing. Five legs, each one idea:
       push-off      — the deck, and nothing asking anything of it
       the red wake  — swells over the deck, then iron that draws lightning
       the rigging   — breakers only the yard clears; the rigging is a road only while
                       the sail pulls it TAUT (the hydra's lesson, safe)
       the tow       — a derelict fouled to the bow; its tow lines are the road across
                       and back, a slate pair is the other answer (the lesson, mixed)
       the chain gate— iron sweeping the deck at two heights: jump the low, stay down
                       for the high
     then the harbour slides in and the ship docks.

     THE CHAINED HYDRA. Evade a committed attack, hook its bright collar (or dash
     onto its taut chain), then slam the strained staple. Two cracks free each head;
     freed heads persist through ordinary recovery. The cap shares the wreck windlass's
     slam cue, and completing a chain ascent earns a short strike window.

     THE CHAINHOOK is Oren's hook recovered from that wreck windlass. Three stable
     rings teach A on the return voyage; the Hydra expands it into combat, and the
     beast's release still requires it to reach the ship shoved away from the quay.

   LATER REGIONS register here (BladefallActTwo.register(stageIndex, impl)) from their own
   files — bladefall-landing-shores.js is stage 17 — and share what the whole act owns:
   the Chainhook, which works in every Act Two region, and THE WHITE FLOWER, the sickness
   taken at the Colony Gate, which greys Blood measures in every region after it. */
(function installBladefallActTwo(root){
'use strict';

const CLIFFS = 16;

/* ── Ship (world units; y up; the deck is the level's floor) ───────────────── */
const DECK_X1 = 520, DECK_X2 = 2280;
const QUARTER = { x:700, w:300, y:100 };
const FORE = { x:2130, w:300, y:100 };
const YARD = { x:1400, w:420, y:270 };
const MAST_X = 1400;
const SPAWN = { x:980, y:0 };
const SHIP_DRIFT = -250;             // the beast shoves the ship off the quay by this much

/* ── Harbour (final positions; it slides in from the east when the ship docks) ─ */
const HARBOUR_SLIDE = 2600, DOCK_SECONDS = 7;
const QUAY_X1 = 3000, QUAY_X2 = 5600;
/* The staples: one per head, high in the cliff, each over its own ledge. The ledges
   are out of every jump's reach (430+ against a double-jump apex of ~148 and no wall to
   climb), so a TAUT chain is the only road to a lock. Chain lengths are the heads'
   reach; the quay's safe gaps fall between their ground circles. */
const STAPLES = [
  { id:'bite',  x:3350, y:430, len:560, home:{ x:3690, y:300 } },
  { id:'tide',  x:4300, y:470, len:620, home:{ x:4560, y:330 } },
  { id:'storm', x:5250, y:430, len:560, home:{ x:5310, y:330 } },
];
const BODY = { x:5900, y:0 };
/* The derelict of the tow leg: 1,070 past the forecastle's lip, which no kit crosses
   (671 flat), so the tow lines — or a slate pair — are the only ways onto it and back. */
const HULK = { x:3750, w:800, y:60 }, HULK_SLIDE = 1600;
/* Pier pilings and the ship's forestay ring: the Chainhook's first, mandatory use. The
   quay's lip (3000) is 970 from the shoved bow (2030) and 100 below its forecastle. */
/* Measured centre to ring: quay lip (3010,22) -> 331; hang under the first -> 373; hang
   under the second -> 438 to the forestay ring, which is over the forecastle's shoved
   span (1730-2030), so letting go there lands you aboard. Range 470 covers each hop. */
const RINGS = [ { x:2760, y:240 }, { x:2390, y:250 } ];      // pier pilings (harbour)
const SHIP_RING = { x:1960 - SHIP_DRIFT, y:300 };             // forestay ring, before the shove
const HOOK_RANGE = 470, HOOK_SPEED = 950, HOOK_HANG = 1.7;
const RIDE_SPEED = 1050;
const TOW_RINGS = [{ x:3120, y:220 }, { x:2700, y:220 }, { x:2240, y:220 }];

const LEG_NAMES = ['PUSH-OFF','THE RED WAKE','THE RIGGING','THE TOW','THE CHAIN GATE','THE HARBOUR OF CHAINS'];
const RELEASE_CUE = Object.freeze({ id:'cliffs-unburdening', src:'./audio/music/unburdening-the-colossus.mp3',
  title:'Unburdening the Colossus', artist:'Aerth score', mood:'an enormous chained creature set free', once:true });

/* ── The act's regions ─────────────────────────────────────────────────────── */
const STAGES = {};
function register(i, impl){ STAGES[i] = impl; }
function stageImpl(){ return G && G.stageIndex !== CLIFFS && STAGES[G.stageIndex] || null; }

/* ── Level ─────────────────────────────────────────────────────────────────── */
let cachedLevel = null;
function level(i){
  if(i !== CLIFFS){ const s = STAGES[i]; return s && s.level ? s.level() : null; }
  return cachedLevel || (cachedLevel = buildCliffsLevel());
}
function buildCliffsLevel(){
  const ship = (o) => Object.assign(o, { actShip:1 });
  const deck = (x, w, y, art, extra) => ship(Pl(x, w, y, Object.assign({ h:art === 'deck' ? 22 : 16, actArt:art, supportedBy:'hull' }, extra || {})));
  // Harbour and hulk pieces are authored where they END UP; initCliffs puts them out at sea.
  const harbour = (o) => Object.assign(o, { actHarbour:1, fx:o.x });
  const hulk = (o) => Object.assign(o, { actHulk:1, fx:o.x, fy:o.y });
  const rig = (ax, ay, bx, by, id) => ship(Object.assign(Seam(ax, ay, bx, by, { setDown:1 }), { actArt:'rigging', actId:id, gone:true }));
  const tow = (ax, ay, bx, by, id) => Object.assign(Seam(ax, ay, bx, by, {}), { actArt:'tow', actId:id, gone:true });
  const objects = [
    // THE SHIP. The hull, mast and sail draw first so the decks stand in front of them.
    ship({ type:'actShip', x:1400, y:0, w:1900, h:560 }),
    deck(1400, DECK_X2 - DECK_X1, 0, 'deck'),
    deck(QUARTER.x, QUARTER.w, QUARTER.y, 'quarterdeck'),
    deck(905, 70, 50, 'step'), deck(1895, 70, 50, 'step'),
    deck(FORE.x, FORE.w, FORE.y, 'forecastle'),
    // The yard is above every breaker (they stand 262 high) and out of every jump's
    // reach from the decks (100 + 148 < 270). Only the rigging, pulled taut, reaches it.
    deck(YARD.x, YARD.w, YARD.y, 'yard', { h:10 }),
    rig(850, 122, 1205, YARD.y, 'rig-aft'),
    rig(1985, 122, 1595, YARD.y, 'rig-fore'),
    // Iron draws the storm: the stern lantern, the bow windlass, the masthead band.
    ship({ type:'actIron', actId:'lantern', x:585, y:QUARTER.y, w:24, h:56 }),
    ship({ type:'actIron', actId:'windlass', x:2230, y:FORE.y, w:44, h:34 }),
    ship({ type:'actIron', actId:'masthead', x:MAST_X, y:YARD.y, w:40, h:230 }),
    // The rest is the ship's own lantern-post; the helm is where the ship is cast off.
    ship({ type:'actProp', kind:'stern-post', x:650, y:QUARTER.y, w:30, h:40, restSiteAnchor:'stern-lantern' }),
    ship({ type:'actProp', kind:'helm', x:780, y:QUARTER.y, w:40, h:52, actTwoUp:1, actVerb:'CAST OFF', actHelm:1 }),
    // The bow's iron-shod bulkhead holds a mouth. It is one half of the tow's second answer.
    ship(Object.assign(SlateWall(DECK_X2 + 12, FORE.y, 120), { actArt:'slate' })),
    // The forestay ring is part of the ship, so the shove carries it with the bow.
    ship({ type:'actRing', actId:'ring-ship', x:SHIP_RING.x, y:SHIP_RING.y, w:30, h:30, shipRing:1, gone:true }),
    // THE TOW (leg 3). Everything arrives from the east and is carried when it drifts.
    hulk(Pl(HULK.x, HULK.w, HULK.y, { h:26, actArt:'hulk', move:{ dx:0, dy:0, period:1 } })),
    hulk(Pl(4050, 100, 110, { h:16, actArt:'hulk-windlass', actWindlass:1, move:{ dx:0, dy:0, period:1 } })),
    hulk(Object.assign(SlateWall(3342, HULK.y, 120), { actArt:'slate' })),
    // The lines are made fast on the forecastle, clear of the bow bulkhead: a dash begun
    // against a wall is refused, so a line cleated at the very lip could never be taken.
    Object.assign(tow(2210, 122, 3375, HULK.y + 22, 'tow-a'), { actHulkEnd:1, hulkX:3375, towPhase:0 }),
    Object.assign(tow(2100, 122, 3470, HULK.y + 22, 'tow-b'), { actHulkEnd:1, hulkX:3470, towPhase:1.7 }),
    ...TOW_RINGS.map((r, i) => ({ type:'actRing', actId:'tow-ring-' + i, x:r.x, y:r.y, w:30, h:30, towRing:true, gone:true })),
    // THE HARBOUR OF CHAINS. It stays out at sea until the ship docks.
    harbour({ type:'actCliff', x:4300, y:0, w:3400, h:900 }),
    harbour(Pl(2640, 700, 0, { h:22, actArt:'pier', actId:'pier' })),
    harbour(Pl(4300, QUAY_X2 - QUAY_X1, 0, { h:30, actArt:'quay' })),
    harbour(Pl(3620, 160, 120, { h:24, actArt:'block' })),
    harbour(Pl(4960, 160, 120, { h:24, actArt:'block' })),
    ...STAPLES.map(s => harbour(Pl(s.x, 124, s.y, { h:18, actArt:'ledge', actStapleLedge:s.id }))),
    ...STAPLES.map(s => harbour({ type:'actStaple', actId:s.id, x:s.x, y:s.y, w:52, h:52 })),
    // The rock the body stands on never moves: it is far past anything the voyage shows.
    Pl(BODY.x, 320, 0, { h:40, actArt:'rock' }),
    // After the beast goes: the pilings the pier leaves, and Oren's hook where the storm
    // lock fell.
    ...RINGS.map((r, i) => harbour({ type:'actRing', actId:'ring-' + i, x:r.x, y:r.y, w:30, h:30, piling:1, gone:true })),
    harbour({ type:'actRelic', actId:'hook', x:5210, y:0, w:44, h:30, actTwoUp:1, actVerb:'TAKE THE HOOK', gone:true }),
  ];
  return {
    len:6400, portal:null, spawnX:SPAWN.x, spawnY:SPAWN.y, authoredEcology:true,
    bossX:BODY.x, bossSkipCircuit:'cliffs-hydra', bossSkipZone:'thunder-cliffs',
    build(){ initCliffs(); },
    objects, loot:[], npcs:[], enemies:[],
  };
}

/* ── Persistence (zone circuits; Level Select reads its own session state) ──── */
function zoneCircuits(){
  try{
    const zs = G.levelSelectMode ? G.sessionZoneState : meta.zoneState;
    return BFZoneStateModule.hydrate(zs, 'thunder-cliffs', []).circuits || {};
  }catch(_e){ return {}; }
}
function circuitSet(c, id){ const v = c[id]; return v === true || !!(v && (v.open || v.solved)); }
function latch(id){ try{ markPersistentCircuitOpen(id, 'thunder-cliffs'); }catch(_e){} }
function zoneCircuitsOf(zone){
  try{
    const zs = G.levelSelectMode ? G.sessionZoneState : meta.zoneState;
    return BFZoneStateModule.hydrate(zs, zone, []).circuits || {};
  }catch(_e){ return {}; }
}
function latchIn(zone, id){ try{ markPersistentCircuitOpen(id, zone); }catch(_e){} }

/* ── Init (the level's build hook: objects exist, zone hydration has not run) ─ */
function refsById(){
  const refs = {};
  for(const o of G.obstacles) if(o.actId) refs[o.actId] = o;
  return refs;
}
function initCliffs(){
  const c = zoneCircuits();
  const released = circuitSet(c, 'cliffs-hydra');
  const docked = released || circuitSet(c, 'cliffs-docked');
  let leg = 0;
  for(let n = 4; n >= 1; n--) if(circuitSet(c, 'cliffs-leg-' + n)){ leg = n; break; }
  const A = G.actTwo = {
    stage:CLIFFS, leg:docked ? 5 : leg, legT:0, docked, dockT:docked ? DOCK_SECONDS : 0, released,
    waves:[], bolts:[], sweeps:[], wakes:[], flash:0, rain:0.55, sail:0.2, dist:0, speed:docked ? 0 : 160,
    hulk:{ state:leg >= 4 || docked ? 'sunk' : 'away', t:0, off:HULK_SLIDE, prevOff:HULK_SLIDE, sink:0 }, harbourOff:docked ? 0 : HARBOUR_SLIDE,
    shipOff:released ? SHIP_DRIFT : 0, shoveT:released ? 9 : 0, castOff:null, releaseMusicT:0,
    spawned:{}, legShown:-1, cliffNear:docked ? 1 : 0, echoAt:docked ? 0 : 1,
  };
  // Old saves past the wreck also receive the relocated discovery.
  if((leg >= 4 || docked) && !hasCapability('chain-hook')) grantPermanentCapability('chain-hook', 'thunder-cliffs-windlass', { quiet:true });
  applyHarbourOffset(A.harbourOff);
  if(docked) settleHarbour();
  // A platform with a `move` spec is re-seated on its origin every frame, so the hulk's
  // must have one from the start or it would snap to x 0 before the tow leg ever runs.
  placeHulk(A.hulk);
  if(A.shipOff) shiftShip(A.shipOff);
  if(released){
    const refs = refsById();
    if(refs.pier) refs.pier.gone = true;
    A.pierBroken = true;
    for(const o of G.obstacles) if(o.type === 'actRing' && !o.towRing) o.gone = false;
    if(refs.hook) refs.hook.gone = hasCapability('chain-hook');
    // AFTER THE BEAST HAS GONE, YOU WAKE ON THE QUAY. The ship is off the quay and only
    // the hook reaches it; arriving on its deck without the hook would be a softlock.
    G.p.x = 3300; G.p.y = 0; G.p.ckX = G.p.x; G.p.ckY = 0; G.p.face = -1;
  }
}
function applyHarbourOffset(off){
  for(const o of G.obstacles) if(o.actHarbour) o.x = o.fx + off;
}
function settleHarbour(){
  for(const o of G.obstacles) if(o.actHarbour){ o.x = o.fx; delete o.move; o.dxf = 0; o.dyf = 0; }
}
/* The whole ship moves as one: decks, rigging, props and the rest marker. */
function shiftShip(dx){
  for(const o of G.obstacles){
    if(!(o.actShip || o.type === 'restSite')) continue;
    o.x += dx; if(o.x0 != null) o.x0 += dx;
    if(o.type === 'seam'){ o.ax += dx; o.bx += dx; }
  }
}

/* ── Arrival and the road out ─────────────────────────────────────────────── */
function arrival(){ return { x:SPAWN.x, y:SPAWN.y }; }
/* A later region's own arrival for a crossing into it (compatibilityZoneArrival). */
function arrivalFor(plan){
  for(const s of Object.values(STAGES)) if(s.arrival){ const a = s.arrival(plan); if(a) return a; }
  return null;
}
function seamSpec(){
  // Thunder Cliffs has no walked seam: the helm's cast-off asks for its crossing itself.
  const s = stageImpl();
  return s && s.seamSpec ? s.seamSpec() : null;
}
/* Ask the page for a crossing, the way the Act One card's Continue does. */
function crossTo(connector, zone, targetStage){
  G.courtTravelRequest = { connector, zone, targetStage, forward:true, commitClear:true };
  try{ updatePhysicalWorldSeams(); }catch(_e){}
}

/* ── Frame (early: before the player moves) ───────────────────────────────── */
function handles(stageIndex){ return stageIndex === CLIFFS || !!STAGES[stageIndex]; }
function update(dt){
  if(!G || !(G.stageIndex >= CLIFFS)) return;
  const p = G.p;
  if(p.dead){ p.actHook = null; p.actRide = null; }
  updateAffliction(dt, p);
  if(G.stageIndex === CLIFFS) updateCliffs(dt, p);
  else { const s = stageImpl(); if(s && s.update) s.update(dt, p); }
  updateHookInput(p);
}
function updateCliffs(dt, p){
  const A = G.actTwo; if(!A || A.stage !== CLIFFS) return;
  A.flash = Math.max(0, A.flash - dt * 2.6);
  if(A.releaseMusicT > 0) A.releaseMusicT = Math.max(0, A.releaseMusicT - dt);
  if(!A.docked) updateVoyage(A, dt, p); else updateHarbour(A, dt, p);
  updateWaves(A, dt, p);
  updateBolts(A, dt, p);
  updateSweeps(A, dt, p);
  if(A.castOff) updateCastOff(A, dt, p);
  A.dist += A.speed * dt;
  const name = LEG_NAMES[Math.min(5, A.leg)];
  if(A.legShown !== A.leg){
    A.legShown = A.leg;
    const tag = document.getElementById('stageTag');
    if(tag) tag.textContent = 'THUNDER CLIFFS · ' + name;
    if(A.leg >= 1 && A.leg <= 4) latch('cliffs-leg-' + A.leg);
  }
}

/* ── The voyage: a clock per leg ──────────────────────────────────────────── */
function beginLeg(A, n){ A.leg = n; A.legT = 0; A.spawned = {}; }
function once(A, key){ if(A.spawned[key]) return false; A.spawned[key] = true; return true; }
function updateVoyage(A, dt, p){
  A.legT += dt;
  const t = A.legT;
  A.echoAt = Math.max(0, A.echoAt - dt / 20);
  const rigAft = G.obstacles.find(o => o.actId === 'rig-aft'), rigFore = G.obstacles.find(o => o.actId === 'rig-fore');
  let taut = false;
  if(A.leg === 0){
    A.speed = 150; A.rain = 0.5; A.sail = 0.3 + 0.1 * Math.sin(t);
    if(t > 3 && once(A, 'swell')) wave(A, 48, false);
    if(t > 9) beginLeg(A, 1);
  } else if(A.leg === 1){
    A.speed = 230; A.rain = 0.75; A.sail = 0.45 + 0.15 * Math.sin(t * 1.3);
    // Swells first, alone; then the storm finds the iron; then both.
    for(const s of [2, 6, 10, 18, 25]) if(t > s && once(A, 'w' + s)) wave(A, 48, false);
    const strikes = [[13, 'lantern'], [16, 'windlass'], [21, 'lantern'], [24, 'masthead'], [28, 'windlass']];
    for(const [s, id] of strikes) if(t > s && once(A, 'b' + s)) boltAtIron(A, id, 1.6, 1);
    if(t > 33) beginLeg(A, 2);
  } else if(A.leg === 2){
    A.speed = 280; A.rain = 0.9;
    /* THE BREAKER AND THE SAIL ARE ONE GUST. The rigging pulls taut as the wall rises at
       the bow and stays taut until it has nearly arrived, so there is always a window
       to climb — wait for the sail, then go. Between breakers the rigging still fills on
       an ordinary rhythm so the road can be tried with nothing chasing you. */
    const arrivals = [10, 21, 32];
    for(const at of arrivals){
      // 262: over the best double jump off a raised deck (100 + 147 measured), under the yard (270).
      if(t > at - 3.4 && once(A, 'k' + at)) wave(A, 262, true);
      if(t > at - 5 && t < at + 4) taut = true;
    }
    if((t % 3.2) < 1.6) taut = true;
    for(const s of [15, 26]) if(t > s && once(A, 'w' + s)) wave(A, 48, false);
    if(t > 16 && once(A, 'gulls')) spawnGulls(2);
    if(t > 25 && once(A, 'mast')) boltAtIron(A, 'masthead', 1.8, 1);
    A.sail = taut ? Math.min(1, A.sail + dt * 3) : Math.max(0.35, A.sail - dt * 1.5);
    if(t > 39) beginLeg(A, 3);
  } else if(A.leg === 3){
    updateTow(A, dt, p);
  } else if(A.leg === 4){
    A.speed = 250; A.rain = 0.85; A.sail = 0.6 + 0.2 * Math.sin(t * 1.1);
    A.cliffNear = Math.min(1, A.cliffNear + dt / 30);
    // Two heights, one rule each: the LOW chain is jumped, the HIGH one is ducked by
    // staying on the main deck. The pairs at 15 and 24 ask for both, one after the other.
    const sweeps = [[2.5,'low'],[6,'high'],[9.5,'low'],[13,'high'],[15.5,'low'],[16.9,'high'],[20.5,'low'],[24,'high'],[25.3,'low']];
    for(const [s, kind] of sweeps) if(t > s && once(A, 's' + s)) sweep(A, kind);
    for(const [s, id] of [[8, 'windlass'], [18.5, 'lantern'], [22.5, 'windlass']]) if(t > s && once(A, 'b' + s)) boltAtIron(A, id, 1.6, 1);
    if(t > 4 && once(A, 'gulls')) spawnGulls(2);
    if(t > 29) beginLeg(A, 5);
  } else if(A.leg === 5){
    // DOCKING: the harbour comes in off the storm and meets the bow.
    A.speed = Math.max(0, 180 - A.legT * 30); A.rain = 0.7; A.sail = Math.max(0.1, A.sail - dt * 0.4);
    A.cliffNear = 1;
    A.dockT = Math.min(DOCK_SECONDS, A.dockT + dt);
    const k = A.dockT / DOCK_SECONDS, ease = 1 - Math.pow(1 - k, 3);
    A.harbourOff = HARBOUR_SLIDE * (1 - ease);
    applyHarbourOffset(A.harbourOff);
    if(A.dockT >= DOCK_SECONDS){
      A.docked = true; settleHarbour(); latch('cliffs-docked');
      G.shake = Math.max(G.shake || 0, 5); if(meta.soundOn) SFX.land();
    }
  }
  for(const r of [rigAft, rigFore]) if(r) r.gone = !taut;
}

/* THE TOW. A derelict drifts in and is lashed to the bow by two lines. The ship will
   not make way until its windlass lets go — come down hard on it — and then it drags
   off east and founders. Getting back is the lines while they still hold, or a mouth
   on each slate. A knight left aboard goes down with it: the sea rewinds you to the
   ship, and the voyage carries on without the wreck. */
function updateTow(A, dt, p){
  const H = A.hulk, t = A.legT;
  A.rain = 0.6; A.sail = 0.25;
  if(H.state === 'away'){ H.state = 'arriving'; H.t = 0; spawnCrabs(); }
  H.t += dt;
  if(H.state === 'arriving'){
    A.speed = Math.max(40, 220 - H.t * 40);
    H.off = HULK_SLIDE * Math.pow(Math.max(0, 1 - H.t / 6), 2);
    if(H.t >= 6){ H.state = 'lashed'; H.t = 0; H.off = 0; }
  } else if(H.state === 'lashed'){
    A.speed = 20;
    if(Math.floor(t) % 7 === 0 && once(A, 'lw' + Math.floor(t))) wave(A, 40, false);
    const windlass = G.obstacles.find(o => o.actWindlass);
    if(windlass && p.slamming && Math.abs(p.x - windlass.x) < 60 && p.y - windlass.y < 90 && p.y > windlass.y - 10){
      H.state = 'drifting'; H.t = 0;
      if(!hasCapability('chain-hook')){
        grantPermanentCapability('chain-hook', 'thunder-cliffs-windlass', { quiet:true });
        latch('cliffs-hook');
        showOutskirtsAnnotation(windlass, '<b>CHAINHOOK</b><br>Oren’s mark on the shank.<br>' + escText(keyLabel(kbCode('hook'))) + ' — hook to the bright iron rings. Jump or press Down to let go.', { accent:'#c9d4dc', manual:true, radius:360 });
      }
      p.slamming = false; p.vy = -420;
      G.shake = Math.max(G.shake || 0, 7);
      if(meta.soundOn) SFX.hit();
      burst(windlass.x, windlass.y + 20, '#c9d4dc', 18);
      // A mouth left on the drifting hull would hang in the air; the pair is spent.
      if(G.cratePortals) G.cratePortals = G.cratePortals.filter(m => Math.abs(m.x - windlass.x) > 1200);
    }
  } else if(H.state === 'drifting'){
    A.speed = Math.min(240, 40 + H.t * 60);
    H.off = Math.min(160, H.t * 45);
    if(H.t > 3.4 && p.x < 3350) H.sink = Math.min(1, H.sink + dt / 6);
    if(H.t > 10 && (p.x <= DECK_X2 || p.dead)){ H.state = 'sunk'; beginLeg(A, 4); }
  }
  for(const o of G.obstacles) if(o.towRing) o.gone = H.state !== 'drifting';
  // Do not abandon a player still making the first hook crossing.
  if(H.state === 'drifting' && H.t >= 9 && p.x > DECK_X2 && !p.dead) H.t = 9;
  placeHulk(H);
  // Crabs aboard ride the hulk the way the knight does; when it founders they go with it.
  const dOff = H.off - H.prevOff; H.prevOff = H.off;
  for(const e of G.enemies) if(e.actOnHulk && !e.dead){
    e.x += dOff;
    if(H.sink > 0.5){ e.dead = true; e.hp = 0; }
  }
  // The lines: taut on the swell, alternating; they part once the hulk is dragging off.
  for(const o of G.obstacles){
    if(o.type !== 'seam' || !o.actHulkEnd) continue;
    const parted = H.state === 'sunk' || (H.state === 'drifting' && H.t > 3.2) || H.state === 'arriving';
    o.gone = parted || ((t + o.towPhase) % 3.4) >= 1.8;
    o.parted = parted && H.state !== 'arriving';
  }
}
/* Seat the hull, its windlass, its slate and the far ends of the tow lines. */
function placeHulk(H){
  const sinkY = -H.sink * 160, sunk = H.state === 'sunk' || H.sink > 0.85;
  for(const o of G.obstacles){
    if(o.actHulk){
      const x = o.fx + H.off, y = o.fy + sinkY;
      if(o.move){ o.x0 = x; o.y0 = y; if(o.x == null || H.state !== 'drifting') { o.x = x; o.y = y; } }
      else { o.x = x; o.y = y; }
      o.gone = sunk;
    } else if(o.type === 'seam' && o.actHulkEnd){
      o.bx = o.hulkX + H.off; o.by = HULK.y + 22 + sinkY; o.x = (o.ax + o.bx) / 2;
      if(sunk) o.gone = true;
    }
  }
}

/* ── Waves: water sweeping the deck from the bow. You cannot dash through water. ─ */
function wave(A, h, big){
  A.waves.push({ x:DECK_X2 + (big ? 420 : 260) + A.shipOff, h, big, speed:big ? 380 : 430, hit:false, age:0 });
}
function updateWaves(A, dt, p){
  for(const w of A.waves){
    w.age += dt; w.x -= w.speed * dt;
    const reach = w.big ? 46 : 34;
    if(!w.hit && !p.dead && p.invuln <= 0 && Math.abs(p.x - w.x) < reach && p.y < w.h && p.y + p.h > -20 && !p.actRide && !p.actHook){
      w.hit = true;
      // WATER IS NOT DODGED. hurtPlayer ignores anything that lands during a dash, and a dash
      // through a breaker is exactly the skip the rigging exists to close — so the wave
      // ends the dash first. (Lightning keeps the ordinary dash rule: a strike can be beaten.)
      p.dodgeTimer = 0;
      hurtPlayer(10, -1, true);
      if(!p.dead){ p.vx = -(w.big ? 460 : 330); p.vy = -(w.big ? 360 : 260); p.onGround = false; p.floorPlat = null; }
    }
  }
  A.waves = A.waves.filter(w => w.x > -600);
}
/* ── Lightning: iron is struck, after a second of crackle you can see. ─────── */
function boltAtIron(A, id, warn, measures){
  const o = G.obstacles.find(q => q.actId === id); if(!o) return;
  A.bolts.push({ x:o.x, y:o.y, top:o.y + (o.h || 40), r:id === 'masthead' ? 64 : 70, t:warn, warn, measures, iron:id, struck:false, life:0.35 });
}
function boltAt(A, x, y, warn, measures){
  A.bolts.push({ x, y, top:y + 60, r:60, t:warn, warn, measures, struck:false, life:0.35 });
}
function updateBolts(A, dt, p){
  for(const b of A.bolts){
    if(!b.struck){
      b.t -= dt;
      if(b.t <= 0){
        b.struck = true; A.flash = Math.max(A.flash, 0.9);
        G.shake = Math.max(G.shake || 0, 4);
        if(meta.soundOn) SFX.magic('storm');
        if(!p.dead && p.invuln <= 0 && Math.abs(p.x - b.x) < b.r && p.y >= b.y - 30 && !p.actHook)
          hurtPlayer(12, Math.sign(p.x - b.x) || 1, true, b.measures);
        burst(b.x, b.y + 10, '#e8f4ff', 20);
      }
    } else b.life -= dt;
  }
  A.bolts = A.bolts.filter(b => !b.struck || b.life > 0);
}
/* ── The chain gate's sweeping iron: LOW is jumped, HIGH is ducked. ─────────── */
function sweep(A, kind){
  A.sweeps.push({ kind, x:DECK_X2 + 700, speed:520, y0:kind === 'low' ? 10 : 96, y1:kind === 'low' ? 48 : 152, hit:false });
}
function updateSweeps(A, dt, p){
  for(const s of A.sweeps){
    s.x -= s.speed * dt;
    if(!s.hit && !p.dead && p.invuln <= 0 && Math.abs(p.x - s.x) < 26 && p.y < s.y1 && p.y + p.h > s.y0){
      s.hit = true; p.dodgeTimer = 0; hurtPlayer(10, -1, true);   // iron is not dodged either
      if(!p.dead){ p.vx = -300; p.vy = -220; }
    }
  }
  A.sweeps = A.sweeps.filter(s => s.x > -400);
}

/* ── Enemies the voyage brings ────────────────────────────────────────────── */
function spawnGulls(n){
  const p = G.p;
  for(let i = 0; i < n; i++){
    const e = spawnEnemy('stormgull', DECK_X2 + 200 + i * 160);
    Object.assign(e, { y:300 + i * 40, baseY:300 + i * 40, safeY:300, active:true, noDrop:true, noticeRange:900, face:-1 });
  }
}
function spawnCrabs(){
  for(const x of [3620, 3900]){
    const e = spawnEnemy('reefcrab', x + HULK_SLIDE);
    Object.assign(e, { y:HULK.y, baseY:HULK.y, safeY:HULK.y, noDrop:true, noticeRange:520, face:-1,
      frontShield:true, shieldFace:-1, turnDelay:1.05, actOnHulk:true, patrolMin:x - 140, patrolMax:x + 140 });
  }
}

/* ── After docking: the harbour, and what the beast leaves behind ─────────── */
function updateHarbour(A, dt, p){
  A.speed = 0; A.sail = 0.1; A.cliffNear = 1;
  A.rain = A.released ? 0.4 : 0.7;
  const boss = G.boss && G.boss.hydraFight ? G.boss : null;
  if(boss && !boss.active && !A.released && p.x > QUAY_X1 + 60 && p.onGround){
    boss.active = true;
    G.shake = Math.max(G.shake || 0, 6);
  }
  // The beast's wake runs west under the water; where it meets the pier, the pier goes.
  for(const w of A.wakes){ w.t += dt; w.x += w.speed * dt; }
  const wake = A.wakes[0];
  if(wake && !A.pierBroken && wake.x < 2990){
    A.pierBroken = true;
    const pier = G.obstacles.find(o => o.actId === 'pier');
    if(pier){ pier.gone = true; burst(2640, 0, '#6e4a30', 30); }
    for(const o of G.obstacles) if(o.type === 'actRing' && !o.towRing) o.gone = false;
    A.shoveT = 0.0001;
    G.shake = Math.max(G.shake || 0, 12);
    if(meta.soundOn) SFX.land();
  }
  A.wakes = A.wakes.filter(w => w.x > -800);
  if(A.shoveT > 0 && A.shoveT < 9){
    // The beast's wake shoves the ship off the quay, carrying anyone aboard.
    const before = A.shipOff;
    A.shoveT = Math.min(9, A.shoveT + dt);
    const k = Math.min(1, A.shoveT / 1.6);
    A.shipOff = SHIP_DRIFT * (1 - Math.pow(1 - k, 2));
    const dx = A.shipOff - before;
    if(dx){ shiftShip(dx); if(p.onGround && p.floorPlat && p.floorPlat.actShip) p.x += dx; }
    if(k >= 1) A.shoveT = 9;
  }
}

/* ── The Chainhook ────────────────────────────────────────────────────────── */
function hookTargets(p, exclude){
  const cx = p.x, cy = p.y + 22, out = [];
  // Bars that are down stand between you and any ring behind them.
  const bars = G.obstacles.filter(o => o.actBars && !o.gone);
  for(const o of G.obstacles){
    if(o.type !== 'actRing' || o.gone || o === exclude) continue;
    const dx = o.x - cx, dy = o.y - cy, d = Math.hypot(dx, dy);
    if(d > HOOK_RANGE || d < 24) continue;
    if(o.ceLineOfSight&&G.obstacles.some(w=>{
      if(w.ceRoom!==o.ceRoom||w.gone||!(w.ceCrag||w.type==='wall'))return false;
      const low=w.type==='wall'?w.y-w.h:w.y,top=w.type==='wall'?w.y:w.y+w.h;
      let near=0,far=1;
      for(const [origin,delta,min,max]of [[cx,dx,w.x-w.w/2-13,w.x+w.w/2+13],[cy,dy-36,low-22,top+22]]){
        if(Math.abs(delta)<1e-8){if(origin<min||origin>max)return false;continue;}
        const a=(min-origin)/delta,b=(max-origin)/delta;near=Math.max(near,Math.min(a,b));far=Math.min(far,Math.max(a,b));if(near>far)return false;
      }
      return near<1&&far>0;
    }))continue;
    if(bars.some(b => (b.x - cx) * (b.x - o.x) < 0)) continue;
    // Facing rings win ties; rings behind you are allowed but cost more.
    out.push({ o, d, score:d + (Math.sign(dx) === (p.face || 1) ? 0 : 140) });
  }
  const boss = G.stageIndex === CLIFFS && G.boss;
  if(boss && boss.active && boss.hydra && !boss.dead) for(const h of boss.hydra.heads){
    if(!h.taut || h.free) continue;
    const d = Math.hypot(h.x - cx, h.y + 4 - cy);
    if(d <= HOOK_RANGE) out.push({ o:{ x:h.x, y:h.y + 4, actHydraHead:h }, d, score:d - 120 });
  }
  return out.sort((a, b) => a.score - b.score);
}
function updateHookInput(p){
  if(!hasCapability('chain-hook') || p.dead) return;
  if(!keyPressedFor('hook')) return;
  if(p.seamRide || p.actRide || G.physicalSeamCrossing) return;
  const current = p.actHook && p.actHook.ring;
  const best = hookTargets(p, current)[0];
  if(!best){ if(meta.soundOn) SFX.hit(); return; }
  const ring = best.o;
  if(ring.actHydraHead){ startChainRide(p, ring.actHydraHead); return; }
  p.actHook = { ring, state:'pull', t:0, fx:p.x, fy:p.y, tx:ring.x, ty:ring.y - 58, len:Math.max(1, Math.hypot(ring.x - p.x, ring.y - 58 - p.y)), hangT:0 };
  p.slamming = false; p.dodgeTimer = 0;
  if(meta.soundOn) SFX.windGate ? SFX.windGate(160, ring.x) : SFX.dodge();
}

/* ── Frame (late: after collision, like a seam ride) ──────────────────────── */
function lateUpdate(dt){
  if(!G || !(G.stageIndex >= CLIFFS)) return;
  const p = G.p;
  if(p.dead){ p.actHook = null; p.actRide = null; return; }
  updateHook(dt, p);
  if(G.stageIndex === CLIFFS){ if(G.actTwo && G.actTwo.stage === CLIFFS) updateChainRide(dt, p); }
  else { const s = stageImpl(); if(s && s.lateUpdate) s.lateUpdate(dt, p); }
  clampAfflicted(p);
}
function updateHook(dt, p){
  if(p.actHook){
    const h = p.actHook;
    if(h.ring.gone){ p.actHook = null; }
    else if(h.state === 'pull'){
      h.t = Math.min(1, h.t + dt * HOOK_SPEED / h.len);
      p.x = h.fx + (h.tx - h.fx) * h.t; p.y = h.fy + (h.ty - h.fy) * h.t;
      p.vx = 0; p.vy = 0; p.onGround = false; p.floorPlat = null; p.invuln = Math.max(p.invuln || 0, 0.06);
      if(h.t >= 1){ h.state = 'hang'; h.hangT = 0; p.dodgeCdT = 0; if(meta.soundOn) SFX.land(); }
    } else {
      h.hangT += dt;
      // A JUMP OUT OF THE HANG IS A GROUND JUMP. Coyote time is held open while hanging,
      // so the ordinary jump code (which ran earlier this frame) gave a full jump and left
      // the air jump — and it is seen here as upward speed, which ends the hang.
      if(p.vy * (G.gravityFlipped?-1:1) < -120){ p.actHook = null; }
      else if((h.hangT > HOOK_HANG && !h.ring.ceWait) || (typeof input !== 'undefined' && input.down)){ p.actHook = null; p.jumps = 0; }
      else {
        p.x = h.tx; p.y = h.ty; p.vx = 0; p.vy = 0; p.onGround = false; p.floorPlat = null;
        p.jumps = 0; p.coyote = 0.12; p.airRefill = true;
      }
    }
  }
}

/* ── Stage-16 Up targets: the hook, and the helm ──────────────────────────── */
function interact(o){
  if(!G || !o) return false;
  if(G.stageIndex !== CLIFFS){ const s = stageImpl(); return !!(s && s.interact && s.interact(o)); }
  if(o.actId === 'hook' && !o.gone){
    const grant = grantPermanentCapability('chain-hook', 'thunder-cliffs-lock', { quiet:true });
    o.gone = true; o.read = true;
    latch('cliffs-hook');
    restoreBlood(G.p, Infinity);
    activateRuntimeCheckpoint('thunder-cliffs:hook', { x:o.x, y:0 }, 'checkpoint', null, true);
    showOutskirtsAnnotation(o, '<b>CHAINHOOK</b><br>A chainwright’s hook, jammed in the lock until the lock gave. The mark on its shank is Oren’s.<br>' +
      'Press ' + escText(keyLabel(kbCode('hook'))) + ' near iron and the hook hauls you to it.', { accent:'#c9d4dc', manual:true, radius:360 });
    if(meta.soundOn) SFX.levelup();
    return !!(grant && (grant.changed || grant.ok));
  }
  if(o.actHelm){
    if(!G.actTwo || !G.actTwo.released){
      showOutskirtsAnnotation(o, '<b>THE HELM</b><br>The storm holds the ship to its course. There is nowhere to steer yet.', { accent:'#c9d4dc' });
      return true;
    }
    if(!G.actTwo.castOff){ G.actTwo.castOff = { t:0 }; if(meta.soundOn) SFX.windGate ? SFX.windGate(200, o.x) : SFX.pickup(); }
    return true;
  }
  return false;
}
function updateCastOff(A, dt, p){
  A.castOff.t += dt;
  A.speed = Math.min(220, A.castOff.t * 90); A.sail = Math.min(1, A.sail + dt);
  // The harbour falls away east; the ship does not need to move for the sea to.
  applyHarbourOffset(A.castOff.t * A.castOff.t * 90);
  if(A.castOff.t > 3.2 && !A.castOff.done){
    A.castOff.done = true;
    latch('cliffs-cast-off');
    // The holed boat runs before the current onto the Landing Shores. Co-op: the host
    // carries both knights, as at every seam.
    if(STAGES[CLIFFS + 1]) crossTo('cliffs-landing', 'thunder-cliffs', CLIFFS + 1);
    else { try{ commitStageCompletion(); }catch(_e){} showFrontierCard('THUNDER CLIFFS · BEHIND YOU', 'CHARMA SHORES', 'The Landing Shores',
      'The current carries the holed boat toward a grey shore under a golden spire.'); }
  }
}
/* WHERE THE ACT STOPS FOR NOW. A region that is not built yet is said plainly rather than
   pretended: the card names what comes next and returns to the title. */
function showFrontierCard(behind, title, subtitle, line){
  if(typeof coopFinishTogether==='function'&&!coopFinishTogether('frontier',()=>showFrontierCard(behind,title,subtitle,line)))return;
  mode = 'win'; showGameUI(false);
  showOvHTML(`<div class="card">
    <p class="ovsub" style="letter-spacing:.34em;margin:0 0 6px;">${behind}</p>
    <h1 class="title" style="margin:0 0 4px;">${title}</h1>
    <p class="subtitle" style="margin:0 0 18px;">${subtitle}</p>
    <p class="hint" style="margin:0 0 20px;">${line}<br>Act Two ends here for now: ${subtitle.replace(/^The /, 'the ')} ${/s$/.test(subtitle) ? 'are' : 'is'} the next region to be built.</p>
    <button class="bigbtn" id="actTwoFrontierGo">Continue</button></div>`);
  const b = document.getElementById('actTwoFrontierGo'); if(b) b.onclick = () => titleScreen();
}

/* ── Leaving Act One: the card's Continue sails into stage 16 ─────────────── */
function setSail(){
  if(!G){ titleScreen(); return; }
  G.actTwoPending = false;
  showOverlay(false); mode = 'play'; showGameUI(true);
  // Co-op: the host carries both knights across, as at every seam.
  G.courtTravelRequest = { connector:'king-thunder-cliffs', zone:'abyss-king', targetStage:CLIFFS, forward:true, commitClear:true };
  updatePhysicalWorldSeams();
}

/* ── Music: the release plays once, over whatever the harbour was playing ──── */
function musicCue(){
  if(G && G.stageIndex !== CLIFFS){ const s = stageImpl(); return s && s.musicCue ? s.musicCue() : null; }
  return G && G.stageIndex === CLIFFS && G.actTwo && G.actTwo.releaseMusicT > 0 ? RELEASE_CUE : null;
}

/* ═════════════════════════ THE CHAINED HYDRA ══════════════════════════════ */
function hydraArena(e){
  Object.assign(e, { hydraFight:true, openingIntangible:true, noDrop:true, active:false, noticeRange:1,
    x:BODY.x, y:0, baseY:0, safeY:0, face:-1, portalGate:'hydraLocks' });
  e.maxHp = Math.max(e.maxHp || 1, 9999); e.hp = e.maxHp;
  e.hydra = {
    phase:1, phaseT:0, thrashT:4, callT:5,
    heads:STAPLES.map(s => ({ id:s.id, sx:s.x, sy:s.y, len:s.len, hx:s.home.x, hy:s.home.y,
      // Heads wait under the water beside the body until their phase, then rise to their post.
      x:s.id === 'bite' ? s.home.x : BODY.x + 150, y:s.id === 'bite' ? s.home.y : -240, st:s.id === 'bite' ? 'idle' : 'sunk', t:0, cd:1.2,
      cracks:0, free:false, taut:false, rode:false, bitten:false, tx:0, ty:0, full:false, flinch:0, crackle:0, look:0 })),
    release:null,
  };
  const c = zoneCircuits();
  for(const h of e.hydra.heads) if(circuitSet(c, 'cliffs-head-' + h.id)){ h.free = true; h.cracks = 2; h.st = 'freed'; h.y = -260; e.hydra.phase++; }
  e.hydra.phase = Math.min(3, e.hydra.phase);
}
function headById(e, id){ return e.hydra.heads.find(h => h.id === id); }
function playerCenter(){ const p = G.p; return { x:p.x, y:p.y + 22 }; }
function clampToChain(h, x, y){
  const dx = x - h.sx, dy = y - h.sy, d = Math.hypot(dx, dy) || 1;
  if(d <= h.len - 6) return { x, y, full:false };
  return { x:h.sx + dx / d * h.len, y:h.sy + dy / d * h.len, full:true };
}
function strainAim(h, x, y){
  const dx = x - h.sx, dy = y - h.sy, d = Math.hypot(dx, dy) || 1;
  const aim = clampToChain(h, h.sx + dx / d * (h.len + 80), h.sy + dy / d * (h.len + 80));
  // A near bait must not bury the head (and its usable collar) beneath the quay.
  if(aim.y < 22) return { x:h.sx + (Math.sign(dx) || 1) * Math.sqrt(h.len * h.len - (h.sy - 22) ** 2), y:22, full:true };
  return aim;
}
function moveToward(h, tx, ty, speed, dt){
  const dx = tx - h.x, dy = ty - h.y, d = Math.hypot(dx, dy);
  if(d <= speed * dt || d < 1){ h.x = tx; h.y = ty; return true; }
  h.x += dx / d * speed * dt; h.y += dy / d * speed * dt; return false;
}
function headBites(h, dmgMeasures){
  const p = G.p, c = playerCenter();
  if(p.dead || p.invuln > 0 || p.actRide) return false;
  if(Math.hypot(c.x - h.x, c.y - h.y) > 46) return false;
  hurtPlayer(12, Math.sign(c.x - h.x) || 1, true, dmgMeasures);
  return true;
}
function updateHydra(e, target, dt){
  const H = e.hydra; if(!H) return;
  e.x = BODY.x; e.y = 0; e.vx = 0; e.vy = 0; e.lunge = 0; e.hp = e.maxHp; e.atkTimer = 1;
  const A = G.actTwo; if(!A) return;
  H.phaseT += dt;
  if(H.release){ updateRelease(e, H, A, dt); return; }
  for(const h of H.heads){
    if(h.flinch > 0) h.flinch -= dt;
    h.lockWindow = Math.max(0, (h.lockWindow || 0) - dt);
    if(h.st === 'freed'){ moveToward(h, BODY.x + 200, -260, 380, dt); h.taut = false; continue; }
    const active = (H.phase === 1 && h.id === 'bite') || (H.phase === 2 && h.id === 'tide') || (H.phase === 3 && h.id === 'storm');
    if(h.st === 'sunk'){
      if(active){ moveToward(h, h.hx, h.hy, 260, dt); if(Math.abs(h.y - h.hy) < 4){ h.st = 'idle'; h.cd = 1.4; } }
      h.taut = false; continue;
    }
    if(!active){
      // A waiting head watches from its post and keeps its chain slack.
      h.taut = false; h.st = 'idle';
      moveToward(h, h.hx + Math.sin(G.time * 0.8 + h.sx) * 18, h.hy + Math.cos(G.time * 0.9 + h.sx) * 14, 120, dt);
      continue;
    }
    if(h.id === 'bite') updateBiteHead(h, dt);
    else if(h.id === 'tide') updateTideHead(h, A, dt);
    else updateStormHead(h, A, dt);
  }
  // Phase pressure from the others: in the tide phase the storm head still calls the
  // sky down now and then; in the storm phase the body thrashes swells across the quay.
  if(H.phase === 2){ H.callT -= dt; if(H.callT <= 0){ H.callT = 7.5; stormCall(A, 1, 1); } }
  if(H.phase === 3){ H.thrashT -= dt; if(H.thrashT <= 0){ H.thrashT = 5.5; harbourSwell(A); } }
  checkLockStrikes(e, H, A);
}
function engaged(h){
  const c = playerCenter();
  return Math.hypot(c.x - h.sx, c.y - h.sy) < h.len + 320;
}
/* THE BITE HEAD — its chain goes taut on every committed lunge. Dodge the head; its bright collar and taut chain become
   a hook/dash road to the exposed lock. */
function updateBiteHead(h, dt){
  h.t += dt;
  if(h.st === 'idle'){
    h.taut = false; h.cd -= dt;
    moveToward(h, h.hx + Math.sin(G.time) * 20, h.hy + Math.cos(G.time * 1.3) * 16, 160, dt);
    headBites(h, 1);
    if(h.cd <= 0 && engaged(h)){ h.st = 'wind'; h.t = 0; }
  } else if(h.st === 'wind'){
    const c = playerCenter();
    const away = Math.sign(h.x - c.x) || 1;
    moveToward(h, h.hx + away * 70, h.hy + 40, 200, dt);
    if(h.t >= 0.8){
      const aim = strainAim(h, c.x, c.y);
      h.tx = aim.x; h.ty = aim.y; h.full = aim.full; h.st = 'lunge'; h.t = 0; h.bitten = false;
      if(meta.soundOn) SFX.dodge();
    }
  } else if(h.st === 'lunge'){
    const arrived = moveToward(h, h.tx, h.ty, 1650, dt);
    if(!h.bitten && headBites(h, 1)) h.bitten = true;
    if(arrived){
      if(h.full){ h.st = 'strain'; h.t = 0; h.taut = true; h.rode = false; G.shake = Math.max(G.shake || 0, 3); if(meta.soundOn) SFX.land(); }
      else { h.st = 'recover'; h.t = 0; }
    }
  } else if(h.st === 'strain'){
    h.taut = true;
    h.x = h.tx + Math.sin(h.t * 40) * 3; h.y = h.ty + Math.cos(h.t * 33) * 3;
    if(!h.bitten && headBites(h, 1)) h.bitten = true;
    if(h.t >= 3.4){ h.st = 'recover'; h.t = 0; h.taut = false; }
  } else if(h.st === 'recover' || h.st === 'recoil'){
    h.taut = false;
    if(moveToward(h, h.hx, h.hy, h.st === 'recoil' ? 700 : 520, dt) || h.t > 2){ h.cd = h.st === 'recoil' ? 1.6 : 1.0; h.st = 'idle'; }
  }
}
/* THE TIDE HEAD — rears back to the end of its chain to spit a wave along the quay.
   The rear is its taut window: jump the wave, and the chain is right there. A knight
   who waits on its ledge instead is swept off it. */
function updateTideHead(h, A, dt){
  h.t += dt;
  const p = G.p, onLedge = Math.abs(p.x - h.sx) < 80 && p.y >= h.sy - 6 && p.y < h.sy + 60 && !p.actRide;
  if(h.st === 'idle'){
    h.taut = false; h.cd -= dt;
    moveToward(h, h.hx + Math.sin(G.time * 0.9) * 22, h.hy + Math.cos(G.time * 1.1) * 18, 160, dt);
    headBites(h, 1);
    if(onLedge && h.cd <= 0){ h.st = 'swipe'; h.t = 0; h.bitten = false; }
    else if(h.cd <= 0 && engaged(h)){ h.st = 'rear'; h.t = 0; }
  } else if(h.st === 'swipe'){
    const tx = h.sx + 20, ty = h.sy + 40;
    if(h.t < 0.7) moveToward(h, h.sx + 220, h.sy + 90, 300, dt);
    else { moveToward(h, tx, ty, 1400, dt); if(!h.bitten && headBites(h, 1)){ h.bitten = true; p.vx = 380; p.vy = -200; } }
    if(h.t > 1.3){ h.st = 'recover'; h.t = 0; }
  } else if(h.st === 'rear'){
    // To the end of the chain, out over the water.
    const aim = clampToChain(h, h.sx + 900, h.sy - 480);
    const arrived = moveToward(h, aim.x, aim.y, 520, dt);
    h.taut = arrived; if(arrived && !h.spat){ h.spat = true; h.rode = false; h.tautT = 0; }
    if(h.spat){
      h.tautT += dt;
      if(h.tautT > 0.25 && !h.waveSent){ h.waveSent = true; A.waves.push({ x:h.x - 20, h:58, big:false, speed:420, hit:false, age:0 }); if(meta.soundOn) SFX.windGate ? SFX.windGate(120, h.x) : null; }
      if(h.tautT > 3.4){ h.st = 'recover'; h.t = 0; h.taut = false; h.spat = false; h.waveSent = false; }
    }
  } else if(h.st === 'recover' || h.st === 'recoil'){
    h.taut = false; h.spat = false; h.waveSent = false;
    if(moveToward(h, h.hx, h.hy, h.st === 'recoil' ? 700 : 460, dt) || h.t > 2){ h.st = 'idle'; h.cd = 1.8; }
  }
}
/* THE STORM HEAD — calls lightning at where you stand, then slams at you. A slam that
   runs out of chain holds it taut, and iron calls the storm: the chain crackles and is
   struck. Ride it early or not at all. */
function stormCall(A, count, measures){
  const p = G.p;
  for(let i = 0; i < count; i++) boltAt(A, p.x + (i - (count - 1) / 2) * 90, p.onGround ? p.y : Math.max(0, p.y - 60), 1.2 + i * 0.35, measures);
}
function updateStormHead(h, A, dt){
  h.t += dt;
  if(h.st === 'idle'){
    h.taut = false; h.cd -= dt; h.crackle = 0;
    moveToward(h, h.hx + Math.sin(G.time * 0.7) * 20, h.hy + Math.cos(G.time) * 16, 160, dt);
    headBites(h, 1);
    if(h.cd <= 0 && engaged(h)){ h.st = 'call'; h.t = 0; }
  } else if(h.st === 'call'){
    moveToward(h, h.hx + 60, h.hy + 190, 260, dt);
    if(h.t > 0.3 && !h.called){ h.called = true; stormCall(A, 3, 2); }
    if(h.t > 2.4){ const c = playerCenter(), aim = strainAim(h, c.x, c.y); h.tx = aim.x; h.ty = aim.y; h.full = aim.full; h.st = 'wind'; h.t = 0; }
  } else if(h.st === 'wind'){
    moveToward(h, h.x + (Math.sign(h.x - h.tx) || 1) * 20, h.y + 30, 160, dt);
    if(h.t >= 0.55){ h.st = 'lunge'; h.t = 0; h.bitten = false; h.called = false; if(meta.soundOn) SFX.dodge(); }
  } else if(h.st === 'lunge'){
    const arrived = moveToward(h, h.tx, h.ty, 1700, dt);
    if(!h.bitten && headBites(h, 2)) h.bitten = true;
    if(arrived){
      if(h.full){ h.st = 'strain'; h.t = 0; h.taut = true; h.rode = false; G.shake = Math.max(G.shake || 0, 5); }
      else { h.st = 'recover'; h.t = 0; }
    }
  } else if(h.st === 'strain'){
    h.taut = true; h.crackle = Math.max(0, (h.t - 1.7) / 0.9);
    h.x = h.tx + Math.sin(h.t * 44) * 3; h.y = h.ty + Math.cos(h.t * 37) * 3;
    if(h.t >= 2.6){
      // The storm finds the chain.
      h.st = 'recover'; h.t = 0; h.taut = false; h.crackle = 0; A.flash = Math.max(A.flash, 1);
      const p = G.p;
      if(!p.dead && (p.actRide && p.actRide.head === h || nearChain(h, 30))){
        p.actRide = null;
        hurtPlayer(12, -1, true, 2);
        if(!p.dead){ p.vx = -260; p.vy = -200; }
      }
      if(meta.soundOn) SFX.magic('storm');
    }
  } else if(h.st === 'recover' || h.st === 'recoil'){
    h.taut = false; h.crackle = 0;
    if(moveToward(h, h.hx, h.hy, h.st === 'recoil' ? 700 : 480, dt) || h.t > 2.2){ h.st = 'idle'; h.cd = 1.5; }
  }
}
function harbourSwell(A){ A.waves.push({ x:QUAY_X2 + 120, h:48, big:false, speed:420, hit:false, age:0 }); }

/* ── Riding a taut chain up to its staple ─────────────────────────────────── */
function segmentDistance(px, py, ax, ay, bx, by){
  const vx = bx - ax, vy = by - ay, l2 = vx * vx + vy * vy || 1;
  const t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / l2));
  return { d:Math.hypot(px - (ax + vx * t), py - (ay + vy * t)), t };
}
function nearChain(h, tol){
  const c = playerCenter(), s = segmentDistance(c.x, c.y, h.x, h.y, h.sx, h.sy);
  return s.d < tol;
}
function startChainRide(p, h){
  const tx = h.sx, ty = h.sy + 68;
  p.actRide = { head:h, t:0, fx:p.x, fy:p.y, tx, ty, len:Math.max(1, Math.hypot(tx - p.x, ty - p.y)) };
  p.dodgeTimer = 0; p.slamming = false; p.actHook = null;
  if(meta.soundOn) SFX.magic('void');
}
function updateChainRide(dt, p){
  const e = G.boss && G.boss.hydraFight && !G.boss.dead ? G.boss : null;
  if(p.actRide){
    const r = p.actRide;
    r.t = Math.min(1, r.t + dt * RIDE_SPEED / r.len);
    p.x = r.fx + (r.tx - r.fx) * r.t; p.y = r.fy + (r.ty - r.fy) * r.t;
    p.vx = 0; p.vy = 0; p.onGround = false; p.floorPlat = null; p.invuln = Math.max(p.invuln || 0, 0.06);
    if(r.t >= 1){
      // Set down just over the lock with a lift, so the strike is one press away.
      p.actRide = null; r.head.rode = true; r.head.lockWindow = 1.8;
      p.vy = -300; p.jumps = Math.min(p.jumps, 1); p.airRefill = true; p.dodgeCdT = 0;
      if(meta.soundOn) SFX.land();
    }
    return;
  }
  if(!e || !e.hydra || !(p.dodgeTimer > 0) || p.seamRide || p.actHook) return;
  const c = playerCenter();
  for(const h of e.hydra.heads){
    if(!h.taut || h.free) continue;
    const s = segmentDistance(c.x, c.y, h.x, h.y, h.sx, h.sy);
    // Not in the last stretch under the staple: the chain is boarded, not the ledge.
    if(s.d > 40 || s.t > 0.86) continue;
    startChainRide(p, h);
    return;
  }
}
/* A LOCK UNDER STRAIN CRACKS; A SLACK LOCK ONLY RINGS. And only a knight who came up
   its own chain this time (with a brief earned window after dismount) can reach it hard enough — which is what keeps the chain the
   verb, rather than a ledge you wait on. */
function checkLockStrikes(e, H, A){
  const p = G.p;
  if(!p.slamming || !(p.vy > 0)) return;
  for(const h of H.heads){
    if(h.free) continue;
    if(Math.abs(p.x - h.sx) > 46 || p.y - h.sy > 90 || p.y < h.sy - 12) continue;
    p.slamming = false;
    if((h.taut || h.lockWindow > 0) && h.rode){
      h.cracks++; h.lockWindow = 0; h.taut = false; h.rode = false; h.st = 'recoil'; h.t = 0; h.flinch = 0.6;
      p.vy = -560; G.shake = Math.max(G.shake || 0, 8); G.hitstop = Math.max(G.hitstop || 0, 0.06);
      burst(h.sx, h.sy + 20, '#ffe9c4', 26);
      if(meta.soundOn) SFX.hit();
      if(h.cracks >= 2) freeHead(e, H, A, h);
    } else {
      p.vy = -300; burst(h.sx, h.sy + 20, '#8b939b', 8);
      if(meta.soundOn) SFX.hit();
    }
    return;
  }
}
function freeHead(e, H, A, h){
  latch('cliffs-head-' + h.id);
  h.free = true; h.st = 'freed'; h.taut = false; h.freedAt = G.time;
  G.shake = Math.max(G.shake || 0, 10);
  if(H.phase < 3){
    H.phase++; H.phaseT = 0;
    activateRuntimeCheckpoint('thunder-cliffs:head-' + h.id, { x:STAPLES[H.phase - 1].x - 220, y:0 }, 'checkpoint', null, true);
  }
  else beginRelease(e, H, A);
}
/* THE RELEASE. It is not killed. The last lock goes, the rest of the iron goes with it,
   it looks at you — once — and it goes under and out, and the pier goes with it. */
function beginRelease(e, H, A){
  H.release = { t:0, pier:false };
  A.released = true; A.releaseMusicT = 46;
  latch('cliffs-hydra');
  try{ offerExploreWorldClear();recordWorldClear(); }catch(_e){}
  try{ recordSessionClear(CLIFFS); }catch(_e){}
  const refs = refsById();
  if(refs.hook){ refs.hook.gone = hasCapability('chain-hook'); refs.hook.dropT = 0; }
  activateRuntimeCheckpoint('thunder-cliffs:release', { x:5150, y:0 }, 'checkpoint', null, true);
  try{ captureCurrentZonePersistence(); if(!G.levelSelectMode) persist(); }catch(_e){}
}
function updateRelease(e, H, A, dt){
  const R = H.release; R.t += dt;
  const p = G.p;
  for(const h of H.heads){ h.taut = false; h.free = true; }
  if(R.t < 1.4){
    // Up out of the water together — low enough that the look that follows is on screen.
    for(const h of H.heads) moveToward(h, h.hx + (h.id === 'tide' ? 0 : h.id === 'bite' ? -40 : 60), h.hy + 110, 260, dt);
    G.shake = Math.max(G.shake || 0, 6);
  } else if(R.t < 3){
    // It looks at the knight.
    for(const h of H.heads){ h.look = 1; moveToward(h, h.x + Math.sign(p.x - h.x) * 10, h.y, 40, dt); }
  } else {
    for(const h of H.heads) moveToward(h, BODY.x + 300, -400, 700, dt);
    // Under the surface and west: the wake runs the length of the harbour (updateHarbour).
    if(R.t > 3.2 && !R.wakeOut){ R.wakeOut = true; A.wakes.push({ x:BODY.x, speed:-1100, t:0 }); }
  }
  if(R.t > 5.5 && !e.dead){
    e.dead = true; e.hydraGone = true;
    if(G.boss === e) G.boss = e;
    try{ hudUpdate(); }catch(_e){}
  }
}

/* ── Small shared effects ─────────────────────────────────────────────────── */
function burst(x, y, color, n){
  for(let i = 0; i < n; i++) G.particles.push({ x:x + (Math.random() - 0.5) * 30, y:GROUND_Y - y - Math.random() * 20,
    vx:(Math.random() - 0.5) * 320, vy:-60 - Math.random() * 260, sz:2 + Math.random() * 4, color, life:0.4 + Math.random() * 0.4 });
}

/* ═══════════════════════════ THE WHITE FLOWER ══════════════════════════════
   The sickness taken at the Colony Gate by a knight who takes the kneeling man's hand.
   It is never named. Every half-minute of play one Blood measure greys over and stays
   grey — rest does not bring it back — until three are left, and a white trumpet flower
   opens on the cloak for each. The Colony's water is what turns them (stage 18).
   The choice lives with the campaign (meta.actTwoPath); a Level Select run keeps its own. */
const AFFLICTION_STEP = 30, AFFLICTION_FLOOR = 3, MENDED_STEP = 6;
/* oren: 'kneeling' (the choice still open) | 'helped' | 'struck' | 'left' (you left the Colony
   without him — forsaken, but not by your hand). Cured, the grey measures turn gold: MENDED. */
function freshPath(){ return { oren:'kneeling', strikes:0, infected:false, grey:0, greyT:0, mended:false, gold:0, orenKnown:false, colony:null }; }
/* A Level Select run into the act's later regions starts on the path its player picked
   (pickPath); the first path() of the run takes it. */
let pendingPath = null;
function path(){
  if(!G) return freshPath();
  if(G.levelSelectMode){
    if(!G.actTwoSessionPath){ G.actTwoSessionPath = Object.assign(freshPath(), pendingPath || {}); pendingPath = null; }
    return G.actTwoSessionPath;
  }
  if(!meta.actTwoPath || typeof meta.actTwoPath !== 'object') meta.actTwoPath = freshPath();
  return meta.actTwoPath;
}
function savePath(){ try{ if(!G.levelSelectMode) persist(); }catch(_e){} }
/* The path as it stands, without creating one: Act One reads this every frame. */
function peekPath(){ return !G ? null : G.levelSelectMode ? (G.actTwoSessionPath || null) : (meta.actTwoPath || null); }
function greyMeasures(p){
  const P = path(); if(!P.infected || !p) return 0;
  const max = Math.max(1, Math.round(p.maxBlood || 5));
  return Math.max(0, Math.min(P.grey, max - AFFLICTION_FLOOR));
}
function afflict(){
  const P = path(); if(P.infected) return;
  P.infected = true; P.grey = 0; P.greyT = 0;
  savePath();
}
/* SABLE'S WATER. The flowers close; every measure the sickness had greyed — and the one it
   took at the touch — comes back gold, and a gold measure mends itself. */
function cure(){
  const P = path(); if(!P.infected) return false;
  const max = Math.max(1, Math.round((G.p && G.p.maxBlood) || 5));
  P.gold = Math.max(1, Math.min(max - 1, 1 + (P.grey || 0)));
  P.infected = false; P.grey = 0; P.greyT = 0; P.mended = true;
  if(G.p){ restoreBlood(G.p, Infinity); try{ hudUpdate(); }catch(_e){} }
  savePath();
  return true;
}
/* MENDED: a measure lost comes back after six seconds without a wound, one at a time. */
const mend = { last:null, t:0 };
function updateMended(dt, p){
  const P = peekPath(); if(!P || !P.mended || p.dead){ mend.last = null; return; }
  if(mend.last == null || p.blood < mend.last) mend.t = 0;
  mend.last = p.blood;
  if(p.blood >= Math.round(p.maxBlood)){ mend.t = 0; return; }
  mend.t += dt;
  if(mend.t >= MENDED_STEP){
    mend.t = 0; p.blood = Math.min(Math.round(p.maxBlood), p.blood + 1); mend.last = p.blood;
    try{ syncBloodMirror(p); hudUpdate(); }catch(_e){}
    burst(p.x, p.y + 30, '#f3d67a', 8);
  }
}
/* MENDED goes where the knight goes — Act One too. Called for every stage (index.html). */
function everywhere(dt){ if(G && G.p && typeof mode !== 'undefined' && mode === 'play') updateMended(dt, G.p); }
function updateAffliction(dt, p){
  if(!(G.stageIndex > CLIFFS) || p.dead) return;
  const P = path(); if(!P.infected) return;
  const max = Math.max(1, Math.round(p.maxBlood || 5));
  if(P.grey >= max - AFFLICTION_FLOOR) return;
  P.greyT += dt;
  if(P.greyT >= AFFLICTION_STEP){
    P.greyT -= AFFLICTION_STEP; P.grey++;
    burst(p.x, p.y + 34, '#f4f1e6', 12);        // it opens where you can see it
    clampAfflicted(p);
    try{ hudUpdate(); }catch(_e){}
    savePath();
  }
}
/* A grey measure cannot be filled: Blood is held under the grey, whatever restored it. */
function clampAfflicted(p){
  if(!(G.stageIndex > CLIFFS)) return;
  const g = greyMeasures(p); if(!g) return;
  const usable = Math.round(p.maxBlood) - g;
  if(p.blood > usable){ p.blood = usable; try{ syncBloodMirror(p); }catch(_e){} }
}
let hudStyled = false;
function hud(el, p){
  if(!el || !p) return;
  if(!hudStyled && typeof document !== 'undefined'){
    hudStyled = true;
    const st = document.createElement('style');
    st.textContent = '.blood-measure.flowered{border-color:#8f8b7e;background:#24221f}' +
      '.blood-measure.flowered>i{width:0!important}' +
      '.blood-measure.flowered::after{content:"";position:absolute;left:50%;top:50%;width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50% 50% 50% 0;background:#f1eee2;box-shadow:0 0 4px rgba(255,255,255,.8)}' +
      '.blood-measure.mended{border-color:#d8b25a;box-shadow:0 0 4px rgba(243,214,122,.55)}' +
      '.blood-measure.mended>i{background:linear-gradient(90deg,#b8923c,#f3d67a)}';
    document.head.appendChild(st);
  }
  const g = G && G.stageIndex > CLIFFS ? greyMeasures(p) : 0, n = Math.round(p.maxBlood);
  const P = peekPath(), gold = P && P.mended ? Math.min(n, P.gold || 0) : 0;
  [...el.children].forEach((pip, i) => { pip.classList.toggle('flowered', i >= n - g && i < n); pip.classList.toggle('mended', i >= n - gold && i < n); });
}

/* ═══════════════════════ THE KING'S PEOPLE (act-wide) ═══════════════════════
   The Belled — his conscripts, the colony's sick with pikes in their hands — and the
   Sunguard who ring them on. A region spawns them into its own encounters and hands each
   frame to foeUpdate with that encounter's state S ({ foes, st, silenced }). */
const BELLED = { keep:96, keepStep:40, wind:0.6, drivenWind:0.38, thrust:0.24, lunge:360, reach:104, recover:0.8 };
const SUNGUARD = { wind:0.55, swing:0.2, reach:132, recover:0.75, turn:1.1, fightTurn:0.9 };
function foeBaseline(e){
  // An elite roll would resize a conscript into a brute; these are what they are.
  if(e.elite){
    const a = EARCH[e.type]; e.elite = null; e.w = a.w; e.h = a.h; e.xp = a.xp; e.speed = a.speed; e.dmg = a.dmg * (G.ngDmg || 1);
    e.hp = e.maxHp = Math.round(a.hp * (G.ngHp || 1) * (1 + G.stageIndex * 0.10));      // the ordinary stage scaling
  }
  // Act One's muster buff holds here too (owner: keep it until the balance pass).
  try{ if(typeof musterRecalled === 'function' && musterRecalled()) applyRecallBaseline(e); }catch(_e){}
}
/* s: { x, y, x1, x2, enc, slot, st ('post' | 'arrive' | 'close'), ringer, bellAt:{x,y}, post:{x,y} (a shackle) } */
function spawnBelled(S, s){
  const e = spawnEnemy('belled', s.x);
  foeBaseline(e);
  const st = s.st || 'arrive';
  Object.assign(e, { y:s.y, baseY:s.y, floorY:s.y, safeX:s.x, safeY:s.y, active:true, noDrop:true, noticeRange:1, face:s.face || -1,
    actFoe:'belled', enc:s.enc, st, t:0, slot:s.slot || 0, ringer:!!s.ringer, bellAt:s.bellAt || null, shackle:s.post || null,
    sweeping:st === 'post', driven:0, hes:1.2, windT:BELLED.wind, x1:s.x1, x2:s.x2 });
  S.foes.push(e);
  return e;
}
/* s: { x, y, x1, x2, enc, home, face, st ('post' | 'guard' | 'fight'), bell ('ringing' | 'none'), ringer } */
function spawnSunguard(S, s){
  const e = spawnEnemy('sunguard', s.x);
  foeBaseline(e);
  const face = s.face || -1;
  Object.assign(e, { y:s.y, baseY:s.y, floorY:s.y, safeX:s.x, safeY:s.y, active:true, noDrop:true, noticeRange:1, face,
    actFoe:'sunguard', enc:s.enc, st:s.st || 'post', t:0, frontShield:true, shieldFace:face, postFace:face, turnDelay:SUNGUARD.turn,
    homeX:s.home == null ? s.x : s.home, bell:s.bell || 'ringing', ringer:!!s.ringer, bellSwing:0, lastHp:e.hp, x1:s.x1, x2:s.x2 });
  S.foes.push(e);
  return e;
}
/* One frame of a Belled or a Sunguard. States a region scripts itself ('script') are left alone. */
function foeUpdate(e, p, dt, A, S){
  e.t += dt;
  if(e.st === 'script') return;
  e.y = e.floorY; e.vy = 0; e.onGround = true;
  e.x = Math.max(e.x1, Math.min(e.x2, e.x));
  if(e.freezeT > 0 || e.floatT > 0 || e.hurtKb > 0){ e.vx = 0; return; }
  if(e.actFoe === 'sunguard') updateSunguard(e, p, dt, A, S);
  else updateBelled(e, p, dt, A, S);
}
/* THE BELLED. They close to a stand-off, and there they hesitate — shaking, pike low —
   until they talk themselves into a thrust, or a bell does it for them. The thrust is a
   short lunge you can read: the pike goes back first. */
function updateBelled(e, p, dt, A, S){
  // A shackled man beaten down cannot run: he yields where the chain holds him and kneels.
  // (Killing him from there takes a deliberate string of blows.)
  if(e.shackle && e.st !== 'sit' && e.st !== 'flee' && e.hp < e.maxHp * 0.4){ e.st = 'sit'; e.t = 0; e.hp = e.maxHp; e.yielded = true; burst(e.x, e.y + 30, '#e9e2cf', 8); }
  const dx = p.x - e.x, adx = Math.abs(dx), want = BELLED.keep + e.slot * BELLED.keepStep;
  if(e.driven > 0) e.driven -= dt;
  if(e.st !== 'thrust' && e.st !== 'flee' && e.st !== 'sit' && e.st !== 'freed') e.face = Math.sign(dx) || e.face;
  const step = (dir, mul) => { e.x = Math.max(e.x1, Math.min(e.x2, e.x + dir * e.speed * (e.slowT > 0 ? 0.5 : 1) * mul * dt)); e.walking = true; };
  e.walking = false;
  switch(e.st){
    case 'post':
      if(S.st === 'live'){ e.st = 'rouse'; e.t = 0; e.sweeping = false; }
      break;
    case 'arrive':
      // Out of a tent, a postern or down a stair, then into the fight.
      step(Math.sign(dx) || -1, 0.8);
      if(e.t > 0.9){ e.st = 'close'; e.t = 0; }
      break;
    case 'rouse':
      // Brooms down, pikes up. A ringer strikes his post's bell first.
      if(e.ringer && !e.rang && e.t > 0.35 && e.bellAt){ e.rang = true; toll(A, S, e.bellAt); }
      if(e.t > 0.9 + e.slot * 0.3){ e.st = 'close'; e.t = 0; }
      break;
    case 'close':
      if(adx > want + 12) step(Math.sign(dx), e.driven > 0 ? 1.6 : 1);
      else if(adx < want - 34) step(-Math.sign(dx), 0.6);
      else if(e.zealot) windUp(e, BELLED.drivenWind);          // the forsaken's sick do not hesitate
      else { e.st = 'hesitate'; e.t = 0; e.hes = 0.9 + Math.random() * 1.3; }
      if((e.driven > 0 || e.zealot) && adx < want + 90 && e.st === 'close'){ windUp(e, BELLED.drivenWind); }
      break;
    case 'hesitate':
      if(adx < want - 40) step(-Math.sign(dx), 0.5);
      if(adx > want + 70){ e.st = 'close'; e.t = 0; }
      else if(e.t > e.hes || e.driven > 0) windUp(e, e.driven > 0 ? BELLED.drivenWind : BELLED.wind);
      break;
    case 'wind':
      if(e.t >= e.windT){ e.st = 'thrust'; e.t = 0; e.hit = false; if(meta.soundOn) SFX.dodge(); }
      break;
    case 'thrust':
      if(e.t < BELLED.thrust) e.x = Math.max(e.x1, Math.min(e.x2, e.x + e.face * BELLED.lunge * dt));
      if(!e.hit && pikeReaches(e, p, BELLED.reach)){ e.hit = true; foeStrike(e, p); }
      if(e.t >= BELLED.thrust){ e.st = 'recover'; e.t = 0; }
      break;
    case 'recover':
      if(e.t >= BELLED.recover){ e.st = 'close'; e.t = 0; }
      break;
    case 'sit':
      // The bell has stopped and the shackle holds him: the pike goes down and he sits.
      break;
    case 'flee':
      // The bell has stopped. The pike goes down and they run.
      e.face = Math.sign(e.fleeX - e.x) || 1;
      e.x += e.face * 150 * dt; e.walking = true; e.x1 = -1e9; e.x2 = 1e9;
      if(e.t > 3.5 || Math.abs(e.x - e.fleeX) < 12){ e.fled = true; e.dead = true; e.hp = 0; }
      break;
  }
}
function windUp(e, t){ e.st = 'wind'; e.t = 0; e.windT = t; e.driven = 0; }
function pikeReaches(e, p, reach){
  if(p.dead) return false;
  const fwd = (p.x - e.x) * e.face;
  return fwd > -10 && fwd < reach + p.w / 2 && p.y < e.y + 44 && p.y + p.h > e.y + 14;
}
function foeStrike(e, p){
  if(p.invuln > 0 || p.dodgeTimer > 0) return;
  if(typeof tryPlayerCounter === 'function' && tryPlayerCounter('melee', e.face, e)) return;
  hurtPlayer(e.dmg, e.face, true);
}
/* THE BELL. A stroke is seen (a ring of sound off the bell) and heard, and every conscript
   still standing off is driven at you. */
function toll(A, S, at){
  A.tolls.push({ x:at.x, y:at.y, t:0 });
  if(meta.soundOn){ if(SFX.windGate) SFX.windGate(90, at.x); else SFX.hit(); }
  if(S) for(const e of S.foes) if(!e.dead && e.actFoe === 'belled' && (e.st === 'close' || e.st === 'hesitate')) e.driven = 1.2;
}
/* THE SUNGUARD. Shield to the front, turned slowly. On guard he holds his post and strikes
   whatever comes in front of him; fighting, he comes for you. If he carries a bell, the
   first blow that lands is on it. A ringer on a tower only rings, and runs when silenced. */
function updateSunguard(e, p, dt, A, S){
  const dx = p.x - e.x, adx = Math.abs(dx), toward = Math.sign(dx) || e.shieldFace;
  e.walking = false;
  if(e.bellSwing > 0) e.bellSwing = Math.max(0, e.bellSwing - dt * 2.5);
  if(e.st === 'flee'){
    e.face = Math.sign(e.fleeX - e.x) || 1; e.shieldFace = e.face; e.x1 = -1e9; e.x2 = 1e9;
    e.x += e.face * 170 * dt; e.walking = true;
    if(e.t > 4 || Math.abs(e.x - e.fleeX) < 12){ e.fled = true; e.dead = true; e.hp = 0; }
    return;
  }
  if(e.st === 'post'){ e.shieldFace = e.postFace; e.face = e.postFace; if(S.st === 'live'){ e.st = e.ringer ? 'ring' : 'guard'; e.t = 0; } return; }
  if(e.bell === 'ringing' && e.hp < e.lastHp){ silence(A, S, e); if(e.ringer) return; }
  e.lastHp = e.hp;
  if(e.st === 'ring'){ e.face = e.shieldFace = e.postFace; return; }   // the ringer only rings
  // The shield turns late: stand behind him long enough and it comes round.
  if(toward !== e.shieldFace){
    e._turnT = (e._turnT || 0) + dt;
    if(e._turnT >= (e.bell === 'ringing' ? SUNGUARD.turn : SUNGUARD.fightTurn)){ e.shieldFace = toward; e._turnT = 0; }
  } else e._turnT = 0;
  if(e.st !== 'wind' && e.st !== 'swing') e.face = e.shieldFace;
  if(e.st === 'guard' || e.st === 'fight'){
    if(e.st === 'fight' && adx > 110 && Math.abs(p.y - e.y) < 90){ e.x += toward * e.speed * dt; e.walking = true; }
    else if(e.st === 'guard' && Math.abs(e.x - e.homeX) > 8){ e.x += Math.sign(e.homeX - e.x) * e.speed * 0.6 * dt; e.walking = true; }
    e.cd = (e.cd || 0) - dt;
    if(e.cd <= 0 && adx < SUNGUARD.reach && Math.sign(dx) === e.shieldFace && Math.abs(p.y - e.y) < 70){ e.st = 'wind'; e.t = 0; e.face = e.shieldFace; }
  } else if(e.st === 'wind'){
    if(e.t >= SUNGUARD.wind){ e.st = 'swing'; e.t = 0; e.hit = false; if(meta.soundOn) SFX.slash(); }
  } else if(e.st === 'swing'){
    if(!e.hit && pikeReaches(e, p, SUNGUARD.reach)){ e.hit = true; foeStrike(e, p); if(!p.dead) p.vx = e.face * 320; }
    if(e.t >= SUNGUARD.swing){ e.st = 'recover'; e.t = 0; }
  } else if(e.st === 'recover'){
    if(e.t >= SUNGUARD.recover){ e.st = e.bell === 'ringing' || e.holdPost ? 'guard' : 'fight'; e.t = 0; e.cd = 0.6; }
  }
}
/* The bell cracks: the conscripts it drove drop their pikes. They run for fleeX(f), or sit
   where a shackle holds them; a ringer runs too. */
function silence(A, S, e, fleeX){
  e.bell = 'silenced'; S.silenced = true; e.bellSwing = 0;
  A.stingerT = 29; A.flash = Math.max(A.flash || 0, 0.5);
  burst(e.x - e.shieldFace * 18, e.y + 34, '#f3d67a', 18);
  G.shake = Math.max(G.shake || 0, 6); G.hitstop = Math.max(G.hitstop || 0, 0.08);
  if(meta.soundOn) SFX.hit();
  const to = fleeX || S.fleeX || ((f) => f.x - 900 * (Math.sign(G.p.x - f.x) || 1));
  for(const f of S.foes) if(!f.dead && f.actFoe === 'belled'){
    if(f.zealot) continue;                                     // no bell drives these; none stops them
    if(f.shackle){ f.st = 'sit'; f.t = 0; }
    else { f.st = 'flee'; f.t = 0; f.fleeX = to(f); f.dropped = true; }
  }
  // A ringer drops off his tower and runs.
  if(e.ringer){ e.st = 'flee'; e.t = 0; e.floorY = 0; e.fleeX = S.ringerFleeX != null ? S.ringerFleeX : e.x + 600; }
}
/* The beaten are not killed: they kneel a moment, then get up and go — away from you. */
function recordFallen(A, S, p){
  for(const e of S.foes) if(e.dead && !e.recorded){
    e.recorded = true;
    if(!e.fled) A.fallen.push({ x:e.x, y:e.y, face:e.face, t:0, kind:e.actFoe, away:Math.sign(e.x - p.x) || 1 });
  }
}
function updateFallen(A, dt){
  for(const f of A.fallen){ f.t += dt; if(f.t > 2.4) f.x += f.away * 70 * dt; }
  A.fallen = A.fallen.filter(f => f.t < 7);
}
/* A companion keeps a pace behind you, and is never left on the far side of a fall. */
function follow(O, p, dt){
  const tx = p.x - (p.face || 1) * 64, dx = tx - O.x;
  if(Math.abs(p.x - O.x) > 620 || Math.abs(p.y - O.y) > 260){ O.x = p.x - (p.face || 1) * 50; O.y = p.y; O.vx = 0; }
  else if(Math.abs(dx) > 20){ O.vx = Math.sign(dx) * Math.min(230, Math.abs(dx) * 3); O.x += O.vx * dt; O.face = Math.sign(dx); }
  else { O.vx = 0; O.face = Math.sign(p.x - O.x) || O.face; }
  if(p.onGround && Math.abs(p.y - O.y) > 2) O.y += Math.sign(p.y - O.y) * Math.min(Math.abs(p.y - O.y), 600 * dt);
}
/* A person speaks with the three answers every conversation offers; a thing is only read. */
function say(src, html, responses, accent){
  const a = accent || '#e9e2cf';
  const opts = responses ? { accent:a, radius:320, kind:'person', responses } : { accent:a, radius:320 };
  // The speaker's id goes with it, so a question someone can answer (Act Three's rift shards) finds them.
  try{ showOutskirtsAnnotation({ x:src.x, y:src.y, accent:a, actId:src.actId, residentId:src.residentId }, html, opts); }catch(_e){}
}
const foes = Object.freeze({ BELLED, SUNGUARD, spawnBelled, spawnSunguard, update:foeUpdate, toll, silence, recordFallen, updateFallen, pikeReaches, strike:foeStrike });

/* ── Level Select: which road did this knight take? ──────────────────────────
   A region after the choice cannot be entered with the kit alone: who walks with you, what
   Sable's water did and who fights for whom depend on the gate. Level Select asks, and the
   run starts on that path (Level Select must give exactly what a playthrough would). */
const PATHS = {
  18:[
    ['hand', 'He took the man’s hand', 'Oren walks in with you; the white flower has begun.', { oren:'helped', infected:true, grey:1, greyT:10 }],
    ['past', 'He walked past', 'The man still kneels at the gate. The choice is open until you leave.', { oren:'kneeling' }],
    ['struck', 'He struck him', 'The forsaken path.', { oren:'struck', strikes:2, forsaken:true }],
  ],
  19:[
    ['hand', 'The colony turned', 'Oren, cured, and the sick walk with you; your gold measures mend.', { oren:'helped', mended:true, gold:2, orenKnown:true, colony:'turned' }],
    ['left', 'He left him kneeling', 'The forsaken path: the sick fight for the King.', { oren:'left', forsaken:true }],
    ['struck', 'He struck him', 'The forsaken path: the sick fight for the King.', { oren:'struck', strikes:2, forsaken:true }],
  ],
};
function pickPath(stage, go){
  const rows = PATHS[Math.min(stage, 19)];
  if(!rows || typeof showOvHTML !== 'function') return false;
  showOvHTML(`<div class="card">
    <p class="ovsub" style="letter-spacing:.3em;margin:0 0 6px;">ACT TWO · LEVEL SELECT</p>
    <h1 class="ovh" style="margin:0 0 6px;">The man at the Colony Gate</h1>
    <p class="ovsub" style="margin:0 0 14px;">Which road did this knight take?</p>
    <div class="choices">${rows.map(([id, name, desc]) => `<button class="choice" data-path="${id}"><div class="cname">${name}</div><div class="cdesc">${desc}</div></button>`).join('')}</div>
    <button class="bigbtn ghost" id="pathBack">Back</button></div>`);
  document.querySelectorAll('[data-path]').forEach(b => b.onclick = () => {
    const row = rows.find(r => r[0] === b.dataset.path);
    pendingPath = Object.assign({}, row[3]);
    go();
  });
  const back = document.getElementById('pathBack');
  if(back) back.onclick = () => { pendingPath = null; if(typeof openLevelSelect === 'function') openLevelSelect(); else titleScreen(); };
  return true;
}

/* ── What a later region hands back to the page ───────────────────────────── */
function updateFoe(e, p, dt){ const s = stageImpl(); if(s && s.updateFoe) s.updateFoe(e, p, dt); }
function swing(p, w){ const s = stageImpl(); if(s && s.swing) s.swing(p, w); }
function voidFloor(p){ const s = stageImpl(); return s && s.voidFloor ? s.voidFloor(p) : -400; }
function cameraFloor(p){
  // Keep the high lock and the knight in the same view while reading a Hydra opening.
  if(G.stageIndex === CLIFFS) return G.actTwo && G.actTwo.docked && !G.actTwo.released && p && p.x > QUAY_X1 ? 90 : null;
  const s = stageImpl(); return s && s.cameraFloor ? s.cameraFloor(p) : null;
}
function cameraCeiling(p){ const s = stageImpl(); return s && s.cameraCeiling ? s.cameraCeiling(p) : null; }
/* The shared kit a region file builds with. */
const kit = Object.freeze({ zoneCircuits:zoneCircuitsOf, circuitSet, latch:latchIn, burst, crossTo, showFrontierCard,
  path, afflict, cure, greyMeasures, savePath, playerCenter, segmentDistance, HOOK_RANGE, foes, follow, say });

root.BladefallActTwo = Object.freeze({
  CLIFFS, level, handles, update, lateUpdate, interact, arrival, arrivalFor, seamSpec, setSail, musicCue,
  hydraArena, updateHydra, hookTargets, register, updateFoe, swing, hud, voidFloor, cameraFloor, cameraCeiling, path, kit, everywhere, pickPath, peekPath,
  constants:Object.freeze({ DECK_X1, DECK_X2, QUARTER, FORE, YARD, MAST_X, SPAWN, SHIP_DRIFT, HARBOUR_SLIDE, QUAY_X1, QUAY_X2,
    STAPLES, BODY, HULK, RINGS, HOOK_RANGE, LEG_NAMES }),
});
})(typeof window !== 'undefined' ? window : globalThis);
