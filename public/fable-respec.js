/* Bladefall — "Fable Respec": standalone look + feel trial.
   Physics start from the main game's tuning (26x44 hero, gravity 1400, run 200,
   jump 480 / second 450, coyote .1, buffer .12, jump cut 170, dash .22s at 3x
   with .15 gravity, wall slide 80, wall jump 350/500, wall coyote .09) and add
   feel work: turn-around boost, apex hang, landing squash, dash afterimages,
   camera lookahead. Everything on screen is redrawn pixel-art on a 640x360
   buffer. Press T for the live tuner. Nothing here is imported by index.html. */
(() => {
'use strict';

// ── Palette ────────────────────────────────────────────────────────────────
const P = {
  skyTop:'#120f24', skyMid:'#2b1d4e', skyLow:'#6b3a6e', horizon:'#d97b5a',
  moon:'#ffe9c4', far:'#1c1636', mid:'#251c44', near:'#2f2352', fog:'rgba(214,170,220,.06)',
  stone:'#4a3f66', stoneLit:'#6a5b8c', stoneDark:'#2d2540', stoneLine:'#1a1428',
  grass:'#7fd6a8', grassDark:'#3e9c78', grassLit:'#c8ffe0', root:'#3a2a44',
  cloak:'#2f4d8f', cloakLit:'#4a76c8', cloakDark:'#1d2f5c', skin:'#f2c9a0', hood:'#1b2340', eye:'#9ff4ff',
  scarf:'#ff7f5c', blade:'#dff6ff', bladeGlow:'rgba(120,220,255,.35)',
  slime:'#5fd3a7', slimeDark:'#2c8c6a', slimeLit:'#c7ffe6', slimeEye:'#1a1030', wisp:'#ffb26b', wispCore:'#fff4d6',
  ink:'#e8e2f2', dim:'#8d86a3', amber:'#ffb454', danger:'#ff5c7a', cyan:'#6be7ff',
};

// ── Feel tuning (live-editable with T) ─────────────────────────────────────
const TUNE = {
  runSpeed:200, groundAccel:22, turnBoost:1.8, airAccel:9, airDrag:1.2,
  gravity:1400, fallCap:900, jumpVelocity:480, secondJump:450, jumpCut:220,
  apexScale:.55, apexBand:60, coyote:.10, jumpBuffer:.12,
  dashSpeed:600, dashDuration:.22, dashGravity:.15, dashFallCap:140, dashCooldown:.30,
  wallSlide:80, wallJumpX:350, wallJumpY:500, wallCoyote:.09,
  camLook:90, camLerp:4, portalMin:260, portalMax:900,
};
const TUNE_META = [
  ['runSpeed','Run speed',100,360,5],['groundAccel','Ground accel',6,40,1],['turnBoost','Turn boost',1,3,.1],['airAccel','Air accel',2,24,1],['airDrag','Air drag',0,12,.2],
  ['gravity','Gravity',700,2400,25],['jumpVelocity','Jump',300,700,10],['secondJump','Second jump',200,650,10],['jumpCut','Jump cut',0,400,10],
  ['apexScale','Apex gravity',.2,1,.05],['coyote','Coyote (s)',0,.25,.01],['jumpBuffer','Buffer (s)',0,.3,.01],
  ['dashSpeed','Dash speed',300,1000,20],['dashDuration','Dash time (s)',.08,.5,.01],['dashCooldown','Dash cooldown',0,.8,.02],
  ['wallSlide','Wall slide',20,300,5],['wallJumpX','Wall jump X',150,600,10],['wallJumpY','Wall jump Y',250,700,10],['wallCoyote','Wall coyote',0,.25,.01],
  ['camLook','Cam lookahead',0,200,5],['camLerp','Cam lerp',1,12,.5],['portalMin','Portal min speed',100,600,10],['portalMax','Portal max speed',300,1400,20],
];

// ── Buffer + display ───────────────────────────────────────────────────────
const BW = 640, BH = 360, Z = 0.5, INSPECT = /inspect/.test(location.search);
const cvs = document.getElementById('c');
const ctx = cvs.getContext('2d', { alpha:false });
ctx.imageSmoothingEnabled = false;
function fit(){ const s = Math.max(1, Math.floor(Math.min(innerWidth / BW, innerHeight / BH))); cvs.style.width = (BW*s)+'px'; cvs.style.height = (BH*s)+'px'; }
addEventListener('resize', fit); fit();

function hash(x, y){ let h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function rng(seed){ let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

// ── Level ──────────────────────────────────────────────────────────────────
const GROUND = 560, LEVEL_W = 10600;
const solids = [
  // ground runs; the gaps are pits sized to demand specific moves
  {x:0,    y:GROUND, w:1120, h:200},          // A: basics
  {x:1320, y:GROUND, w:920,  h:200},          // B  (pit 1120-1320: double jump)
  {x:2560, y:GROUND, w:1440, h:200},          // C  (pit 2240-2560: double jump + dash)
  {x:4260, y:GROUND, w:420,  h:200},          // D  (pit 4000-4260: portal launch)
  {x:4760, y:GROUND, w:320,  h:200},          //    (hole 4680-4760: floor portal)
  {x:5280, y:GROUND, w:2320, h:200},          // E  (pit 5080-5280: portal flight clears it hands-free)
  {x:7600, y:GROUND, w:600,  h:200},          // F: linked portal (one mouth + fixed anchor)
  {x:8200, y:GROUND-288, w:400, h:488},       //    cliff carrying the anchor
  {x:8600, y:GROUND, w:800,  h:200},          // F run-out / G: twin portals
  {x:9780, y:GROUND, w:820,  h:200},          // G far side (chasm 9480-9780: a high wall mouth clears it hands-free, a low one needs a dash)
  // A
  {x:640,  y:GROUND-64,  w:224, h:64}, {x:960, y:GROUND-176, w:128, h:32, float:true},
  // B
  {x:1500, y:GROUND-96,  w:160, h:96}, {x:1900, y:GROUND-150, w:96, h:32, float:true},
  // C: wall shaft (doorway at the bottom of the left wall), top ledge, portal frame
  {x:3000, y:GROUND-352, w:32, h:304, wall:true}, {x:3160, y:GROUND-352, w:32, h:352, wall:true},
  {x:3192, y:GROUND-352, w:208, h:32}, {x:3416, y:GROUND-440, w:32, h:120, wall:true},
  {x:2700, y:GROUND-64, w:160, h:64},
  // pillar behind portal B
  {x:3868, y:GROUND-348, w:32, h:96, float:true},
  // D: high drop platform feeding the floor portal, frame behind portal D
  {x:4400, y:GROUND-256, w:128, h:32, float:true}, {x:4978, y:GROUND-352, w:32, h:104, float:true},
  // E: rhythm stones, a tall wall to climb over, run-out to the gate
  {x:5700, y:GROUND-120, w:96, h:32, float:true}, {x:5900, y:GROUND-220, w:96, h:32, float:true},
  {x:6120, y:GROUND-300, w:128, h:32, float:true},
  {x:6500, y:GROUND-400, w:32, h:400, wall:true},
  {x:6900, y:GROUND-64, w:192, h:64},
  // F: step stone and high ledge above the floor slate (fall in from up high)
  {x:7780, y:GROUND-130, w:80, h:32, float:true}, {x:7960, y:GROUND-260, w:96, h:32, float:true},
  // G: climb tower, pillar with the wall slate, safety lip under it
  {x:9040, y:GROUND-420, w:32, h:420, wall:true}, {x:9400, y:GROUND-320, w:32, h:320, wall:true}, {x:9432, y:GROUND-24, w:48, h:24},
];
// slate panels: the only surfaces a player mouth will hold on. side = the way the panel faces.
const slates = [
  {x:7900, y:GROUND, w:160, h:8, side:'floor'}, {x:8192, y:GROUND-200, w:8, h:120, side:'left'},
  {x:9200, y:GROUND, w:128, h:8, side:'floor'}, {x:9432, y:GROUND-300, w:8, h:200, side:'right'},
];
const anchors = [ {id:'F', x:8360, y:GROUND-288-6, w:80, h:28, nx:0, ny:-1, to:null, col:P.cyan, anchor:true} ];
const pickups = [ {x:7700, y:GROUND-36, kind:'single', taken:false}, {x:9100, y:GROUND-36, kind:'pair', taken:false} ];
let playerMouths = [], mouthSeq = 0, texts = [];
const caps = { portal:'none' };
const portals = [
  {id:'A', x:3400, y:GROUND-432, w:16, h:80, nx:-1, ny:0,  to:'B', col:P.amber},
  {id:'B', x:3900, y:GROUND-340, w:16, h:80, nx:1,  ny:0,  to:'A', col:P.amber},
  {id:'C', x:4680, y:GROUND-6,   w:80, h:28, nx:0,  ny:-1, to:'D', col:P.cyan},
  {id:'D', x:5010, y:GROUND-344, w:16, h:80, nx:1,  ny:0,  to:'C', col:P.cyan},
];
const signs = [
  {x:1000, y:GROUND-64, t:'DOUBLE JUMP'}, {x:2120, y:GROUND-64, t:'JUMP · JUMP · DASH'}, {x:2880, y:GROUND-64, t:'CLING & WALL JUMP'},
  {x:3250, y:GROUND-352, t:'RUN INTO THE LIGHT'}, {x:4420, y:GROUND-256, t:'DROP IN'}, {x:6300, y:GROUND, t:'CLIMB OVER'},
  {x:7880, y:GROUND, t:'F · SET A MOUTH ON THE SLATE'}, {x:8000, y:GROUND-260, t:'FALL IN FROM UP HIGH'}, {x:8150, y:GROUND, t:'OR CLING & SET IT ON THE WALL'},
  {x:9180, y:GROUND, t:'F · FLOOR MOUTH'}, {x:9380, y:GROUND, t:'F · WALL MOUTH · F AGAIN CLEARS'}, {x:9020, y:GROUND, t:'CLIMB · DROP IN · FLY'},
];
const spawnEnemies = () => [
  {t:'slime', x:520, y:GROUND}, {t:'slime', x:1700, y:GROUND}, {t:'wisp', x:1920, y:GROUND-300},
  {t:'slime', x:2760, y:GROUND-64}, {t:'wisp', x:3090, y:GROUND-200}, {t:'slime', x:3700, y:GROUND},
  {t:'slime', x:4400, y:GROUND}, {t:'wisp', x:4900, y:GROUND-260}, {t:'slime', x:5800, y:GROUND},
  {t:'wisp', x:6300, y:GROUND-320}, {t:'slime', x:6950, y:GROUND-64}, {t:'slime', x:7150, y:GROUND},
  {t:'slime', x:7820, y:GROUND}, {t:'wisp', x:8450, y:GROUND-360}, {t:'slime', x:8700, y:GROUND}, {t:'slime', x:10050, y:GROUND}, {t:'wisp', x:10250, y:GROUND-280},
];
const checkpoints = [80, 1400, 2600, 4300, 5400, 7620, 8640, 9860];
const gate = { x: 10480, y: GROUND - 96, w: 48, h: 96 };

// ── State ──────────────────────────────────────────────────────────────────
const keys = {};
let player, enemies, parts, ghosts, cam, time = 0, shake = 0, fade = 1, won = false, hp = 3, lastCk = 0, hurtT = 0, hitstop = 0, runT = 0;
function makePlayer(x){ return {x, y:GROUND-44, w:26, h:44, vx:0, vy:0, face:1, onGround:false, coyote:0, jumpBuf:0, jumps:0, jumpHeld:false,
  onWall:false, wallDir:0, wallCoyote:0, dashT:0, dashCd:0, dashDir:1, dashReady:true, portalCd:0, restMouth:null, restKind:null, pvx:0, pvy:0, jumpCutOk:false,
  anim:0, squash:0, stretch:0, atk:0, atkCd:0, landT:0, idle:0}; }
function reset(x){
  player = makePlayer(x ?? checkpoints[0]);
  enemies = spawnEnemies().map(e => ({...e, w:e.t==='slime'?26:22, h:e.t==='slime'?20:22, y:e.y-(e.t==='slime'?20:0), vx:e.t==='slime'?60:0, vy:0, hp:e.t==='slime'?2:1, dir:1, flash:0, anim:Math.random()*6, dead:0}));
  parts = []; ghosts = []; texts = []; cam = {x:player.x - BW/Z/2, y:GROUND - 520}; fade = 1; won = false; runT = 0;
  if(x == null){ caps.portal = 'none'; for(const k of pickups) k.taken = false; playerMouths = []; for(const a of anchors) a.to = null; }   // full restart only
}
reset();
window.__fableRespec = () => ({ player, cam, enemies, hp, won, TUNE, caps, playerMouths, anchors, texts, step: dt => step(dt), draw: () => draw() });   // debug hook: scripted checks can step without rAF

// ── Input ──────────────────────────────────────────────────────────────────
const KEYMAP = { ArrowLeft:'L', KeyA:'L', ArrowRight:'R', KeyD:'R', ArrowUp:'J', KeyW:'J', Space:'J', KeyZ:'J', KeyX:'A', KeyJ:'A', KeyK:'A',
  ShiftLeft:'D', ShiftRight:'D', KeyC:'D', KeyL:'D', KeyF:'P', KeyV:'P', KeyR:'reset', KeyT:'tune' };
function press(k){ if(k==='J'){ player.jumpBuf = TUNE.jumpBuffer; player.jumpHeld = true; } if(k==='A') attack(); if(k==='D') dash(); if(k==='P') placePortal(); }
addEventListener('keydown', e => { const k = KEYMAP[e.code]; if(!k) return; if(e.target && e.target.tagName === 'INPUT') return; e.preventDefault();
  if(k==='reset'){ hp=3; reset(); return; } if(k==='tune'){ toggleTuner(); return; } if(!keys[k]){ keys[k]=1; press(k); } });
addEventListener('keyup', e => { const k = KEYMAP[e.code]; if(k){ keys[k]=0; if(k==='J') player.jumpHeld = false; } });
for(const [id,k] of [['tL','L'],['tR','R'],['tJ','J'],['tA','A'],['tD','D'],['tP','P']]){
  const el = document.getElementById(id); if(!el) continue;
  const down = e => { e.preventDefault(); keys[k]=1; press(k); };
  const up = e => { e.preventDefault(); keys[k]=0; if(k==='J') player.jumpHeld = false; };
  el.addEventListener('pointerdown', down); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('pointerleave', up);
}

// ── Tuner panel ────────────────────────────────────────────────────────────
let tuner = null;
function toggleTuner(){
  if(tuner){ tuner.remove(); tuner = null; return; }
  tuner = document.createElement('div'); tuner.id = 'tuner';
  tuner.innerHTML = '<h3>Feel tuner <span>T to close · R restart</span></h3>';
  for(const [k,label,min,max,step] of TUNE_META){
    const row = document.createElement('label');
    row.innerHTML = `<span>${label}</span><input type="range" min="${min}" max="${max}" step="${step}" value="${TUNE[k]}"><b>${TUNE[k]}</b>`;
    const inp = row.querySelector('input'), val = row.querySelector('b');
    inp.oninput = () => { TUNE[k] = parseFloat(inp.value); val.textContent = inp.value; };
    tuner.appendChild(row);
  }
  const btn = document.createElement('button'); btn.textContent = 'Copy values'; btn.onclick = () => { navigator.clipboard && navigator.clipboard.writeText(JSON.stringify(TUNE, null, 1)); btn.textContent = 'Copied'; setTimeout(() => btn.textContent = 'Copy values', 900); };
  tuner.appendChild(btn); document.body.appendChild(tuner);
}

// ── Particles ──────────────────────────────────────────────────────────────
function puff(x, y, n, col, spd, life, up, g){
  for(let i=0;i<n;i++){ const a = Math.random()*Math.PI*2, s = spd*(.3+Math.random()*.7);
    parts.push({x, y, vx:Math.cos(a)*s, vy:Math.sin(a)*s - (up||0), life, max:life, col, r:1+Math.random()*2, g:g ?? (up?300:0)}); }
}
function ring(x, y, col){ for(let i=0;i<10;i++){ const a = i/10*Math.PI*2; parts.push({x:x+Math.cos(a)*6, y:y+Math.sin(a)*3, vx:Math.cos(a)*90, vy:Math.sin(a)*40, life:.28, max:.28, col, r:1.5, g:0}); } }

// ── Actions ────────────────────────────────────────────────────────────────
function overlap(a,b){ return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y; }
function attack(){
  if(player.atkCd > 0 || won) return;
  player.atk = .2; player.atkCd = .32;
  const hx = player.face > 0 ? player.x + player.w : player.x - 46, box = {x:hx, y:player.y - 6, w:46, h:player.h + 6};
  for(const e of enemies){ if(e.dead || !overlap(box, e)) continue;
    e.hp--; e.flash = .15; e.vx = player.face * 220; e.vy = -160; shake = Math.max(shake, 3); hitstop = Math.max(hitstop, .04);
    puff(e.x+e.w/2, e.y+e.h/2, 6, P.blade, 160, .35);
    if(e.hp <= 0){ e.dead = .4; puff(e.x+e.w/2, e.y+e.h/2, 18, e.t==='slime'?P.slime:P.wisp, 220, .6, 120); shake = 5; hitstop = .07; }
  }
}
function dash(){
  const p = player; if(won || p.dashT > 0 || p.dashCd > 0 || !p.dashReady) return;
  const ax = (keys.R?1:0) - (keys.L?1:0);
  p.dashDir = ax || (p.onWall ? -p.wallDir : p.face); p.face = p.dashDir;
  p.dashT = TUNE.dashDuration; p.dashCd = TUNE.dashCooldown; p.dashReady = false; p.onWall = false;
  p.vy = Math.min(p.vy, 0) * .3; p.stretch = 1; shake = Math.max(shake, 2);
  puff(p.x+13, p.y+30, 8, P.eye, 140, .3);
}
function say(str, col, x, y){ texts.push({x: x ?? player.x + player.w/2, y: y ?? player.y - 14, str, col: col || P.ink, life:1.6, max:1.6}); }
function placePortal(){
  const p = player; if(won || p.portalCd > 0) return;
  if(caps.portal === 'none'){ say('THE SLATE HOLDS NO MEMORY', P.dim); return; }
  let mouth;
  if(p.onWall){
    const nx = -p.wallDir, faceX = p.wallDir > 0 ? p.x + p.w - 16 : p.x;   // mouth sits on the player's side of the face
    const slate = slates.find(s => s.side === (nx < 0 ? 'left' : 'right') && overlap({x:p.x - 10, y:p.y, w:p.w + 20, h:p.h}, s));   // the panel sits just off the face, whichever side the wall is
    if(!slate){ wontHold(p.wallDir > 0 ? p.x + p.w : p.x, p.y + 20); return; }
    mouth = {x:faceX, y:Math.max(slate.y, Math.min(slate.y + slate.h - 80, p.y - 18)), w:16, h:80, nx, ny:0};
  } else if(p.onGround){
    const slate = slates.find(s => s.side === 'floor' && overlap({x:p.x, y:p.y + p.h, w:p.w, h:4}, s));
    if(!slate){ wontHold(p.x + p.w/2, p.y + p.h); return; }
    mouth = {x:Math.max(slate.x, Math.min(slate.x + slate.w - 80, p.x + p.w/2 - 40)), y:p.y + p.h - 6, w:80, h:28, nx:0, ny:-1};
  } else { say('STAND ON A SURFACE TO SET A MOUTH', P.dim); return; }
  mouth.col = P.eye; mouth.player = true; mouth.id = 'P' + (++mouthSeq);
  if(caps.portal === 'single'){
    const anchor = anchors.find(a => Math.abs(a.x - p.x) < 1000);
    if(!anchor){ say('ONE MOUTH NEEDS A FIXED COUNTERPART', P.amber); return; }
    playerMouths = [mouth]; mouth.to = anchor.id; anchor.to = mouth.id;   // a fresh press moves the one mouth
    say('MOUTH SET — FIXED LINK READY', P.eye);
  } else {
    if(playerMouths.length >= 2){ playerMouths = []; say('MOUTHS CLEARED', P.dim); p.portalCd = .25; return; }
    playerMouths.push(mouth);
    if(playerMouths.length === 2){ playerMouths[0].to = playerMouths[1].id; playerMouths[1].to = playerMouths[0].id; say('PAIR COMPLETE', P.eye); }
    else say('MOUTH SET — PLACE ITS TWIN', P.eye);
  }
  p.portalCd = .3; p.restMouth = mouth.id; p.restKind = 'placed';   // you're standing on it: it fires once you leave and come back
  puff(mouth.x + mouth.w/2, mouth.y + mouth.h/2, 12, P.eye, 160, .4); shake = Math.max(shake, 2);
}
function wontHold(x, y){ say("WON'T HOLD — FIND THE SLATE", P.amber, x, y - 20); puff(x, y, 6, P.amber, 120, .3); }
function hurt(){
  if(hurtT > 0 || fade > .5) return;
  hp--; hurtT = 1.1; shake = 7; hitstop = .08; puff(player.x+13, player.y+22, 14, P.danger, 200, .5);
  if(hp <= 0){ hp = 3; fade = 1; reset(checkpoints[lastCk]); }
  else { player.vy = -300; player.vx = -player.face * 240; player.dashT = 0; }
}

// ── Simulation ─────────────────────────────────────────────────────────────
function touching(b, dir){ const probe = {x: dir>0 ? b.x+b.w : b.x-1, y:b.y+6, w:1, h:b.h-12}; return solids.some(s => overlap(probe, s)); }
function solidAt(x, y){ return solids.some(s => x >= s.x && x < s.x+s.w && y >= s.y && y < s.y+s.h); }
function moveBody(b, dt, isPlayer){
  b.pvx = b.vx; b.pvy = b.vy; b.x += b.vx*dt; b.hitWall = false;
  for(const s of solids) if(overlap(b, s)){ if(b.vx > 0) b.x = s.x - b.w; else if(b.vx < 0) b.x = s.x + s.w; b.vx = 0; b.hitWall = true; }
  if(isPlayer) b.x = Math.max(0, Math.min(LEVEL_W - b.w, b.x));
  b.y += b.vy*dt; b.onGround = false;
  for(const s of solids) if(overlap(b, s)){ if(b.vy > 0){ b.y = s.y - b.h; b.onGround = true; } else if(b.vy < 0){ b.y = s.y + s.h; } b.vy = 0; }
}
function allMouths(){ return portals.concat(anchors, playerMouths); }
function usePortal(p){
  const cx = p.x + p.w/2, cy = p.y + p.h/2, mouths = allMouths();
  let resting = false;
  for(const m of mouths){
    const py = m.ny < 0 ? p.y + p.h - 2 : m.ny > 0 ? p.y + 2 : cy;   // floor mouths are entered feet-first
    const inZone = cx >= m.x && cx <= m.x+m.w && py >= m.y - 8 && py <= m.y+m.h + 8;
    if(m.id === p.restMouth){
      const near = cx > m.x - 24 && cx < m.x+m.w + 24;
      if(p.restKind === 'placed'){ if(near && py > m.y - 30 && py < m.y+m.h + 30){ resting = true; continue; } continue; }   // a mouth you just set: step off or hop and drop back in
      if(near && (!p.onGround || inZone)){ resting = true; continue; }   // a mouth you came out of: quiet until you leave sideways or stand elsewhere
      continue;
    }
    if(!inZone) continue;
    if(m.id === p.restMouth){ resting = true; continue; }   // still on the mouth you just set or came out of
    if(p.portalCd > 0) continue;
    const into = p.pvx*m.nx + p.pvy*m.ny; if(into > -40) continue;   // must be moving into the mouth (velocity before landing)
    const out = mouths.find(o => o.id === m.to); if(!out) continue;
    const speed = Math.max(TUNE.portalMin, Math.min(TUNE.portalMax, Math.hypot(p.pvx, p.pvy)));   // speed as it was before any landing zeroed it
    puff(cx, cy, 14, m.col, 200, .45);
    const ex = out.x + out.w/2 + out.nx * (out.w/2 + p.w/2 + 6), ey = out.y + out.h/2 + out.ny * (out.h/2 + p.h/2 + 6);
    p.x = ex - p.w/2; p.y = ey - p.h/2; p.vx = out.nx * speed; p.vy = out.ny * speed;
    if(out.nx) p.face = out.nx; p.portalCd = .35; p.restMouth = out.id; p.restKind = 'exit'; p.jumpCutOk = false; p.onWall = false; p.onGround = false; p.dashT = 0; p.dashReady = true; p.jumps = Math.min(p.jumps, 1);
    cam.x += (ex - cx) * .6; cam.y += (ey - cy) * .6;   // camera jumps most of the way so the exit reads instantly
    puff(ex, ey, 14, out.col, 200, .45); shake = Math.max(shake, 3); hitstop = .03;
    return;
  }
  if(!resting) p.restMouth = null;
}
function step(dt){
  time += dt;
  if(hitstop > 0){ hitstop -= dt; return; }
  const p = player, ax = (keys.R?1:0) - (keys.L?1:0);
  const dashing = p.dashT > 0;
  if(!won && !dashing){
    const target = ax * TUNE.runSpeed;
    let k = p.onGround ? TUNE.groundAccel : (ax ? TUNE.airAccel : TUNE.airDrag);   // no input in the air keeps momentum
    if(ax && Math.sign(p.vx) === -ax) k *= TUNE.turnBoost;                     // snap turn-arounds
    p.vx += (target - p.vx) * Math.min(1, k*dt);
    if(Math.abs(p.vx) < 4 && !ax) p.vx = 0;
    if(ax) p.face = ax;
  }
  // wall contact
  const leftT = !p.onGround && touching(p, -1), rightT = !p.onGround && touching(p, 1);
  p.onWall = !dashing && (leftT || rightT) && p.vy > -60;
  if(p.onWall){ p.wallDir = leftT ? -1 : 1; p.wallCoyote = TUNE.wallCoyote; p.dashReady = true; p.jumps = Math.min(p.jumps, 1); } else p.wallCoyote -= dt;
  // grounded bookkeeping
  if(p.onGround){ p.coyote = TUNE.coyote; p.jumps = 0; p.dashReady = true; } else p.coyote -= dt;
  p.jumpBuf -= dt;
  // jumps: ground / coyote, wall, then the second leap
  if(p.jumpBuf > 0 && !won){
    if(p.coyote > 0){ p.jumpBuf = 0; p.coyote = 0; p.jumps = 1; p.vy = -TUNE.jumpVelocity; p.onGround = false; p.stretch = 1; p.jumpCutOk = true; puff(p.x+13, p.y+44, 6, P.dim, 90, .3); }
    else if(p.onWall || p.wallCoyote > 0){ const wd = p.wallDir; p.jumpBuf = 0; p.wallCoyote = 0; p.vx = -wd * TUNE.wallJumpX; p.vy = -TUNE.wallJumpY; p.face = -wd; p.jumps = 1; p.onWall = false; p.stretch = 1; p.dashT = 0; p.jumpCutOk = false;   // wall jumps commit: a tap still clears the climb
      puff(p.x + (wd>0 ? p.w : 0), p.y+24, 8, P.stoneLit, 120, .35); }
    else if(p.jumps === 1){ p.jumpBuf = 0; p.jumps = 2; p.vy = -TUNE.secondJump; p.stretch = 1; p.dashT = 0; p.jumpCutOk = true; ring(p.x+13, p.y+40, P.eye); }
    else if(p.jumps === 0){ p.jumps = 1; }  // walked off an edge past coyote: the next press is the second leap
  }
  if(p.jumpCutOk && !p.jumpHeld && p.vy < -TUNE.jumpCut && !dashing){ p.vy = -TUNE.jumpCut; p.jumpCutOk = false; }   // variable height, jumps only: portal launches keep their speed
  // gravity: dash floats, apex hangs, wall slides
  let g = TUNE.gravity;
  if(dashing) g *= TUNE.dashGravity;
  else if(Math.abs(p.vy) < TUNE.apexBand && !p.onGround && p.jumpHeld) g *= TUNE.apexScale;
  p.vy += g * dt;
  const cap = dashing ? TUNE.dashFallCap : TUNE.fallCap; if(p.vy > cap) p.vy = cap;
  if(p.onWall && ax === p.wallDir && p.vy > TUNE.wallSlide){ p.vy = TUNE.wallSlide; if(Math.random() < dt*30) parts.push({x:p.x + (p.wallDir>0 ? p.w : 0), y:p.y+30+Math.random()*10, vx:-p.wallDir*20, vy:-40, life:.3, max:.3, col:P.stoneLit, r:1, g:200}); }
  if(dashing){ p.vx = p.dashDir * TUNE.dashSpeed; p.dashT -= dt; if(p.dashT <= 0){ p.vx = p.dashDir * TUNE.runSpeed * 1.15; } ghosts.push({x:p.x, y:p.y, face:p.face, t:.22}); if(Math.random() < dt*40) parts.push({x:p.x+13-p.dashDir*10, y:p.y+10+Math.random()*30, vx:-p.dashDir*60, vy:0, life:.25, max:.25, col:P.eye, r:1, g:0}); }
  p.dashCd -= dt; p.portalCd -= dt;
  moveBody(p, dt, true);
  if(p.hitWall && dashing) p.dashT = 0;
  usePortal(p);
  if(p.onGround){ if(p.landT > 0){ p.squash = 1; shake = Math.max(shake, Math.min(4, p.landT*.006)); puff(p.x+13, p.y+44, Math.min(12, p.landT*.02|0), P.dim, 120, .35); p.landT = 0; } }
  else p.landT = Math.max(p.landT, p.vy);
  p.anim += dt * (Math.abs(p.vx) > 20 ? Math.abs(p.vx)/20 : 0);
  p.idle += dt; p.squash *= Math.pow(.02, dt); p.stretch *= Math.pow(.02, dt);
  p.atk = Math.max(0, p.atk - dt); p.atkCd = Math.max(0, p.atkCd - dt); hurtT = Math.max(0, hurtT - dt);
  if(Math.abs(p.vx) > 120 && p.onGround && Math.random() < dt*10) puff(p.x+13 - p.face*8, p.y+43, 1, P.dim, 30, .4);
  if(p.y > GROUND + 260){ hp = 3; fade = 1; shake = 8; reset(checkpoints[lastCk]); }
  for(let i=0;i<checkpoints.length;i++) if(p.x > checkpoints[i] - 20) lastCk = i;
  for(const k of pickups){ if(k.taken) continue; if(Math.abs(p.x + p.w/2 - k.x) < 24 && Math.abs(p.y + p.h/2 - k.y) < 34){ k.taken = true; caps.portal = k.kind; playerMouths = []; for(const a of anchors) a.to = null; puff(k.x, k.y, 24, P.cyan, 220, .8, 60); ring(k.x, k.y, P.moon); shake = 4; hitstop = .06;
    say(k.kind === 'single' ? 'LINKED PORTAL — F SETS ONE MOUTH ON SLATE' : 'TWIN PORTALS — F TWICE, A THIRD CLEARS', P.cyan, k.x, k.y - 30); } }
  for(const t of texts){ t.life -= dt; t.y -= 14*dt; } texts = texts.filter(t => t.life > 0);
  if(!won && overlap(p, gate)){ won = true; puff(gate.x+24, gate.y+48, 40, P.amber, 260, 1.2, 100); shake = 4; }
  if(!won && fade <= 0) runT += dt;

  for(const e of enemies){
    if(e.dead){ e.dead -= dt; continue; }
    e.flash = Math.max(0, e.flash - dt); e.anim += dt;
    if(e.t === 'slime'){
      e.vy += 1400*dt;
      if(e.onGround && Math.random() < dt*.9){ e.vy = -260; }
      moveBody(e, dt, false); e.vx *= e.onGround ? Math.pow(.001, dt) : 1;
      if(e.hitWall || (e.onGround && !solidAt(e.x + e.w/2 + e.dir*18, e.y + e.h + 4))){ e.dir = -e.dir; e.vx = e.dir*60; e.hitWall = false; }
      if(Math.abs(e.vx) < 30 && e.onGround) e.vx = e.dir * 60;
    } else {
      const dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1;
      if(d < 360 && !won){ e.vx += (dx/d)*140*dt; e.vy += (dy/d)*140*dt; }
      e.vx *= Math.pow(.35, dt); e.vy *= Math.pow(.35, dt);
      e.x += e.vx*dt; e.y += e.vy*dt + Math.sin(e.anim*3)*.4;
      if(Math.random() < dt*20) parts.push({x:e.x+11, y:e.y+11, vx:-e.vx*.2, vy:-e.vy*.2 - 10, life:.5, max:.5, col:P.wisp, r:2, g:0});
    }
    if(overlap(p, e) && !won){ if(dashing){ e.hp = 0; e.dead = .4; puff(e.x+e.w/2, e.y+e.h/2, 18, e.t==='slime'?P.slime:P.wisp, 220, .6, 120); shake = 5; hitstop = .05; } else hurt(); }
  }
  enemies = enemies.filter(e => !(e.dead && e.dead <= 0));
  for(const q of parts){ q.life -= dt; q.vy += (q.g||0)*dt; q.x += q.vx*dt; q.y += q.vy*dt; q.vx *= Math.pow(.2, dt); }
  parts = parts.filter(q => q.life > 0);
  for(const gh of ghosts) gh.t -= dt; ghosts = ghosts.filter(gh => gh.t > 0);

  // camera: lookahead scales with speed, soft vertical, clamped
  const lead = p.face * TUNE.camLook + p.vx * .28;
  const lookX = p.x + p.w/2 + lead - (BW/Z)/2;
  const lookY = Math.min(GROUND + 200 - BH/Z, p.y + p.h/2 - (BH/Z)*.58 + (p.onWall ? -40 : 0));
  cam.x += (lookX - cam.x) * Math.min(1, dt*TUNE.camLerp); cam.y += (lookY - cam.y) * Math.min(1, dt*3);
  cam.x = Math.max(0, Math.min(LEVEL_W - BW/Z, cam.x));
  shake = Math.max(0, shake - dt*22); fade = Math.max(0, fade - dt*2.4);
}

// ── Pre-rendered backdrop ──────────────────────────────────────────────────
function layer(w, h, draw){ const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; draw(g); return c; }
const sky = layer(BW, BH, g => {
  const gr = g.createLinearGradient(0,0,0,BH); gr.addColorStop(0,P.skyTop); gr.addColorStop(.45,P.skyMid); gr.addColorStop(.8,P.skyLow); gr.addColorStop(1,P.horizon);
  g.fillStyle = gr; g.fillRect(0,0,BW,BH);
  const r = rng(7); for(let i=0;i<140;i++){ const x = r()*BW|0, y = r()*BH*.6|0, a = .25 + r()*.6; g.fillStyle = `rgba(255,240,220,${a})`; g.fillRect(x,y,1,1); }
  const halo = g.createRadialGradient(500,70,20,500,70,96); halo.addColorStop(0,'rgba(255,214,160,.28)'); halo.addColorStop(.4,'rgba(255,214,160,.08)'); halo.addColorStop(1,'rgba(255,214,160,0)'); g.fillStyle = halo; g.fillRect(400,-30,200,200);
  g.fillStyle = P.moon; g.beginPath(); g.arc(500,70,22,0,7); g.fill();
  g.fillStyle = 'rgba(200,160,140,.35)'; g.fillRect(492,62,4,3); g.fillRect(506,78,6,4); g.fillRect(498,84,3,2);
});
function hills(seed, w, base, amp, col, spires){
  return layer(w, 420, g => {
    const r = rng(seed); g.fillStyle = col;
    for(let x=0;x<w;x+=4){ const n = Math.sin(x*.012+seed)*amp + Math.sin(x*.031+seed*3)*amp*.4; const yy = base + n | 0; g.fillRect(x, yy, 4, 420-yy); if(spires && r() < .05){ const h = 20+r()*60|0, sw = 3+r()*5|0; g.fillRect(x, yy-h, sw, h); g.fillRect(x-1, yy-h+6, sw+2, 2); } }
    for(let x=0;x<w;x+=6){ if(r() < .5){ const h = 6+r()*16|0, yy = base + Math.sin(x*.012+seed)*amp + Math.sin(x*.031+seed*3)*amp*.4 | 0; g.fillRect(x+2, yy-h, 2, h); g.fillRect(x+1, yy-h+2, 4, 3); g.fillRect(x, yy-h+5, 6, 3); } }
  });
}
const far = hills(3, 1024, 120, 22, P.far, true), mid = hills(11, 1024, 140, 18, P.mid, false), near = hills(29, 1024, 160, 14, P.near, true);
const vignette = layer(BW, BH, g => { const gr = g.createRadialGradient(BW/2,BH/2,BH*.35,BW/2,BH/2,BW*.72); gr.addColorStop(0,'rgba(0,0,0,0)'); gr.addColorStop(1,'rgba(6,3,14,.75)'); g.fillStyle = gr; g.fillRect(0,0,BW,BH); });

// ── Rendering ──────────────────────────────────────────────────────────────
let ox = 0, oy = 0;
const R = (x, y, w, h, col) => { ctx.fillStyle = col; ctx.fillRect(Math.round(x*Z - ox), Math.round(y*Z - oy), Math.max(1, Math.round(w*Z)), Math.max(1, Math.round(h*Z))); };
const B = (x, y, w, h, col) => { ctx.fillStyle = col; ctx.fillRect(Math.round(x), Math.round(y), w, h); };

function draw(){
  const sx = (Math.random()-.5)*shake, sy = (Math.random()-.5)*shake;
  ox = Math.round(cam.x*Z + sx); oy = Math.round(cam.y*Z + sy);
  ctx.drawImage(sky, 0, 0);
  for(const [img, px, py] of [[far,.15,.05],[mid,.3,.1],[near,.5,.18]]){
    const shift = -((ox*px) % img.width), yy = 30 - oy*py;
    for(let x = shift - img.width; x < BW; x += img.width) ctx.drawImage(img, Math.round(x), Math.round(yy));
  }
  ctx.fillStyle = P.fog; for(let i=0;i<4;i++){ const y = 200 + i*34 + Math.sin(time*.3+i)*6 - oy*.2; ctx.fillRect(0, Math.round(y), BW, 14); }
  drawSolids(); drawSlates(); drawSigns(); drawGate();
  for(const m of allMouths()) drawPortal(m);
  drawPickups();
  for(const e of enemies) drawEnemy(e);
  for(const gh of ghosts){ ctx.globalAlpha = gh.t/.22*.45; drawHero(gh.x, gh.y, gh.face, true); } ctx.globalAlpha = 1;
  drawPlayer();
  for(const q of parts){ ctx.globalAlpha = q.life/q.max; R(q.x, q.y, q.r*2, q.r*2, q.col); } ctx.globalAlpha = 1;
  drawForeground(); drawTexts();
  ctx.globalCompositeOperation = 'lighter';
  const lx = Math.round((player.x+13)*Z - ox), ly = Math.round((player.y+20)*Z - oy);
  const gl = ctx.createRadialGradient(lx,ly,4,lx,ly,70); gl.addColorStop(0,'rgba(120,200,255,.16)'); gl.addColorStop(1,'rgba(120,200,255,0)'); ctx.fillStyle = gl; ctx.fillRect(lx-70,ly-70,140,140);
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(vignette, 0, 0);
  drawHUD();
  if(INSPECT){ const px = Math.round(player.x*Z - ox) - 44, py = Math.round(player.y*Z - oy) - 18; ctx.fillStyle = P.stoneLine; ctx.fillRect(BW-404, 22, 404, 200); ctx.drawImage(cvs, px, py, 100, 48, BW-400, 24, 400, 192); }
  if(fade > 0){ ctx.fillStyle = `rgba(6,3,14,${fade})`; ctx.fillRect(0,0,BW,BH); }
}

function drawSolids(){
  const vx0 = cam.x - 64, vx1 = cam.x + BW/Z + 64;
  for(const s of solids){
    if(s.x+s.w < vx0 || s.x > vx1) continue;
    const bx = Math.round(s.x*Z - ox), by = Math.round(s.y*Z - oy), bw = Math.round(s.w*Z), bh = Math.round(s.h*Z);
    if(s.float){ ctx.fillStyle = 'rgba(6,3,14,.25)'; ctx.fillRect(bx+2, by+bh, bw-4, 3); }
    B(bx, by, bw, bh, P.stone);
    for(let yy = 6; yy < bh; yy += 8){ B(bx, by+yy, bw, 1, P.stoneLine); const off = ((yy/8)|0) % 2 ? 8 : 0;
      for(let xx = off; xx < bw; xx += 16){ B(bx+xx, by+yy, 1, Math.min(8, bh-yy), P.stoneLine); if(hash(s.x+xx, s.y+yy) < .18) B(bx+xx+2, by+yy+2, 5, 3, P.stoneLit); if(hash(s.x+xx+3, s.y+yy) < .12) B(bx+xx+8, by+yy+3, 4, 2, P.stoneDark); } }
    B(bx, by, 1, bh, P.stoneLit); B(bx+bw-1, by, 1, bh, P.stoneDark); B(bx, by+bh-1, bw, 1, P.stoneDark);
    if(s.wall){ // climbable faces: chipped edge runes so the affordance reads
      for(let yy = 6; yy < bh-4; yy += 10){ B(bx+1, by+yy, 2, 1, P.grassLit); B(bx+bw-3, by+yy+5, 2, 1, P.grassLit); }
      B(bx, by, bw, 2, P.stoneLit);
    } else {
      B(bx, by, bw, 3, P.grass); B(bx, by, bw, 1, P.grassLit); B(bx, by+3, bw, 1, P.grassDark);
      for(let xx = 0; xx < bw; xx += 3){ const h = hash(s.x+xx, s.y); if(h < .35){ B(bx+xx, by-1-(h*6|0), 1, 2+(h*6|0), h<.15?P.grassLit:P.grass); } if(h > .93) B(bx+xx, by-2, 1, 1, P.scarf); }
    }
    if(s.float) for(let xx = 4; xx < bw-4; xx += 7){ const h = hash(s.x+xx, 99); if(h < .5) B(bx+xx, by+bh, 1, 3+(h*12|0), P.root); }
    ctx.strokeStyle = P.stoneLine; ctx.lineWidth = 1; ctx.strokeRect(bx-.5, by-.5, bw+1, bh+1);
  }
}
function drawSlates(){
  for(const s of slates){ const bx = Math.round(s.x*Z - ox), by = Math.round(s.y*Z - oy), bw = Math.round(s.w*Z), bh = Math.round(s.h*Z); if(bx + bw < -10 || bx > BW + 10) continue;
    const pulse = .5 + .5*Math.sin(time*3 + s.x);
    if(s.side === 'floor'){ B(bx, by-1, bw, 5, '#d9cfee'); B(bx, by-1, bw, 1, '#f4efff'); B(bx, by+3, bw, 1, '#8f84ad'); for(let x = 3; x < bw-2; x += 6) B(bx+x, by+1, 2, 1, pulse > .5 ? P.eye : '#8fd0e6'); }
    else { const fx = s.side === 'left' ? bx - 4 : bx; B(fx, by, 4, bh, '#d9cfee'); B(s.side === 'left' ? fx : fx+3, by, 1, bh, '#f4efff'); for(let y = 3; y < bh-2; y += 6) B(fx+1, by+y, 2, 1, pulse > .5 ? P.eye : '#8fd0e6'); }
  }
}
function drawPickups(){
  for(const k of pickups){ if(k.taken) continue; const bx = Math.round(k.x*Z - ox), by = Math.round(k.y*Z - oy) + Math.round(Math.sin(time*2.5)*2); if(bx < -30 || bx > BW+30) continue;
    ctx.globalCompositeOperation = 'lighter'; const gl = ctx.createRadialGradient(bx,by,1,bx,by,26); gl.addColorStop(0,'rgba(107,231,255,.5)'); gl.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle = gl; ctx.fillRect(bx-26,by-26,52,52); ctx.globalCompositeOperation = 'source-over';
    B(bx-3, by-1, 7, 3, P.cyan); B(bx-1, by-3, 3, 7, P.cyan); B(bx-1, by-1, 3, 3, P.moon); if(k.kind === 'pair'){ B(bx-6, by-6, 2, 2, P.cyan); B(bx+5, by+5, 2, 2, P.cyan); }
    for(let i=0;i<3;i++){ const a = time*1.8 + i*2.1; B(bx + Math.cos(a)*9, by + Math.sin(a)*5, 1, 1, P.moon); }
  }
}
function drawTexts(){
  ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center';
  for(const t of texts){ const a = Math.min(1, t.life / .4); ctx.globalAlpha = a; const bx = Math.round(t.x*Z - ox), by = Math.round(t.y*Z - oy); ctx.fillStyle = P.skyTop; ctx.fillText(t.str, bx+1, by+1); ctx.fillStyle = t.col; ctx.fillText(t.str, bx, by); }
  ctx.globalAlpha = 1;
}
function drawSigns(){
  ctx.font = '7px monospace'; ctx.textAlign = 'center';
  for(const s of signs){ const bx = Math.round(s.x*Z - ox), by = Math.round(s.y*Z - oy); if(bx < -80 || bx > BW+80) continue;
    B(bx-1, by-14, 2, 14, P.root); B(bx-3, by-2, 6, 2, P.root); ctx.fillStyle = P.dim; ctx.fillText(s.t, bx, by-18); }
}
function drawGate(){
  const bx = Math.round(gate.x*Z - ox), by = Math.round(gate.y*Z - oy);
  ctx.globalCompositeOperation = 'lighter';
  const gl = ctx.createRadialGradient(bx+12,by+24,2,bx+12,by+24,40); gl.addColorStop(0,`rgba(255,180,84,${won?.5:.22})`); gl.addColorStop(1,'rgba(255,180,84,0)'); ctx.fillStyle = gl; ctx.fillRect(bx-30,by-20,84,90);
  ctx.globalCompositeOperation = 'source-over';
  B(bx, by, 24, 48, P.stoneDark); B(bx+2, by+2, 20, 44, P.skyTop);
  B(bx+3, by+4, 18, 40, won ? P.amber : '#6b3a6e'); B(bx+5, by+8, 14, 32, won ? P.moon : '#2b1d4e');
  B(bx-2, by-3, 28, 3, P.stoneLit); B(bx-2, by+48, 28, 2, P.stoneDark);
  for(let i=0;i<3;i++){ const yy = by + 8 + ((time*30 + i*14) % 36 | 0); B(bx+8+i*4, yy, 1, 1, P.moon); }
}
function drawPortal(m){
  const bx = Math.round(m.x*Z - ox), by = Math.round(m.y*Z - oy), bw = Math.round(m.w*Z), bh = Math.round(m.h*Z);
  if(bx < -60 || bx > BW+60) return;
  const cx = bx + bw/2, cy = by + bh/2, rx = m.nx ? 5 : bw/2, ry = m.nx ? bh/2 : 5;
  ctx.globalCompositeOperation = 'lighter';
  const linked = !!allMouths().find(o => o.id === m.to);
  const gl = ctx.createRadialGradient(cx,cy,2,cx,cy,34); gl.addColorStop(0, m.col === P.amber ? 'rgba(255,180,84,.38)' : linked ? 'rgba(107,231,255,.38)' : 'rgba(107,231,255,.12)'); gl.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle = gl; ctx.fillRect(cx-34,cy-34,68,68);
  ctx.globalCompositeOperation = 'source-over';
  ctx.save(); ctx.translate(cx, cy); ctx.scale(rx/10, ry/10);
  ctx.fillStyle = P.skyTop; ctx.beginPath(); ctx.arc(0,0,10,0,7); ctx.fill();
  ctx.strokeStyle = linked ? m.col : P.dim; ctx.lineWidth = 10/Math.max(rx,ry)*2.2; ctx.beginPath(); ctx.arc(0,0,10,0,7); ctx.stroke();
  ctx.restore();
  if(m.anchor){ B(cx-rx-3, cy-ry-2, 3, ry*2+4, P.stoneLit); B(cx+rx, cy-ry-2, 3, ry*2+4, P.stoneLit); }
  if(!linked) return;
  for(let i=0;i<5;i++){ const a = time*2.4 + i*1.26, r = 1 + (i%2); B(cx + Math.cos(a)*rx*.7 + m.nx*Math.sin(a)*4, cy + Math.sin(a)*ry*.7 + m.ny*Math.cos(a)*4, r, r, i%2 ? P.moon : m.col); }
  const ax = cx + m.nx*(rx+4), ay = cy + m.ny*(ry+4); B(ax, ay, 1, 1, m.col); B(ax + m.nx, ay + m.ny, 1, 1, m.col);
}

function drawHero(wx, wy, f, ghost){
  const p = player, px = Math.round(wx*Z - ox), py = Math.round(wy*Z - oy);
  const run = !ghost && p.onGround && Math.abs(p.vx) > 20, air = ghost ? true : !p.onGround, wall = !ghost && p.onWall && !p.onGround, dashing = ghost || p.dashT > 0;
  const cyc = Math.sin(p.anim*1.7);
  const sq = ghost ? -.2 : (p.squash*.35 - p.stretch*.25);
  ctx.save(); ctx.translate(px+6, py+22);
  if(dashing) ctx.scale(1.18, .86); else ctx.scale(1+sq, 1-sq);
  ctx.translate(-(px+6), -(py+22));
  if(!ghost && hurtT > 0 && (hurtT*20|0)%2) ctx.globalAlpha = .45;
  const bob = run ? Math.round(Math.abs(cyc)*1.5) : (!air && Math.sin(p.idle*2.2) > .6 ? 1 : 0);
  const lean = run ? f : (dashing ? f*2 : 0);
  if(!ghost && p.onGround){ ctx.fillStyle = 'rgba(6,3,14,.35)'; ctx.fillRect(px+1, py+21, 11, 2); }
  const trail = ghost ? -f*4 : Math.max(-4, Math.min(4, -p.vx*.012)), lift = wall ? -3 : (air ? Math.max(-3, Math.min(3, -p.vy*.006)) : 0);
  const cl = ghost ? P.cloakLit : P.cloak, cd = ghost ? P.cloakLit : P.cloakDark, hd = ghost ? P.cloak : P.hood;
  for(let i=0;i<6;i++){ const w = 7 - (i>3?i-3:0), x = px + 3 + Math.round(trail*(i/5)), y = py + 8 + i + Math.round(lift*(i/5)); B(x - (f>0?0:1), y+bob, w, 1, i<2?P.cloakLit:(i>4?cd:cl)); }
  const l1 = run ? Math.round(cyc*2) : 0, l2 = run ? -Math.round(cyc*2) : 0;
  if(wall){ B(px+4, py+16, 2, 5, hd); B(px+7, py+17, 3, 3, hd); }
  else if(air){ B(px+4, py+16, 2, 5, hd); B(px+7, py+15, 2, 4, hd); }
  else { B(px+4+l1*f, py+16, 2, 6-Math.abs(l1)*.5|0, hd); B(px+7+l2*f, py+16, 2, 6-Math.abs(l2)*.5|0, hd); }
  B(px+3+lean*.5, py+9+bob, 7, 8, cl); B(px+3+lean*.5, py+9+bob, 7, 1, P.cloakLit); B(px+5, py+12+bob, 3, 1, cd);
  B(px+3, py+14+bob, 7, 1, P.scarf);
  B(px + (f>0? 1 : 9) + Math.round(trail*.6), py+8+bob, 3, 1, P.scarf); B(px + (f>0? 0 : 11) + Math.round(trail*.9), py+9+bob, 2, 1, P.scarf);
  B(px+2, py+1+bob, 9, 8, hd); B(px+3, py+bob, 7, 1, hd); B(px+2, py+1+bob, 1, 6, P.cloakLit);
  if(!ghost){
    B(px+(f>0?5:3), py+4+bob, 5, 4, P.skin);
    const eyeX = f>0 ? px+8 : px+4; B(eyeX, py+5+bob, 1, 1, P.eye); B(eyeX + (f>0?-2:2), py+5+bob, 1, 1, P.eye);
    if(wall){ const hx = p.wallDir > 0 ? px+12 : px; B(hx, py+9+bob, 1, 3, P.skin); }   // hand on the wall
    if(p.atk > 0){
      const t = 1 - p.atk/.2, ang = (-1.1 + t*2.2) * f, cx = px+6+f*4, cy = py+11+bob;
      ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = P.bladeGlow; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, 13, f>0?-1.2:Math.PI-1.2, f>0?ang:Math.PI-ang, f<0); ctx.stroke(); ctx.lineWidth = 1; ctx.globalCompositeOperation = 'source-over';
      for(let i=3;i<15;i++){ B(cx + Math.cos(ang)*i*f, cy + Math.sin(ang)*i, 1, 1, i>12?P.eye:P.blade); }
      B(cx, cy, 2, 2, P.amber);
    } else {
      const gx = px + (f>0?1:10), gy = py+7+bob; for(let i=0;i<7;i++) B(gx + (f>0?i*-.3:i*.3)|0, gy+i, 1, 1, i%3===((time*6)|0)%3 ? P.eye : P.blade);
    }
  }
  ctx.restore(); ctx.globalAlpha = 1;
}
function drawPlayer(){ drawHero(player.x, player.y, player.face, false); }

function drawEnemy(e){
  const bx = Math.round(e.x*Z - ox), by = Math.round(e.y*Z - oy);
  if(bx < -40 || bx > BW+40) return;
  if(e.dead){ ctx.globalAlpha = e.dead/.4; }
  if(e.t === 'slime'){
    const w = 13, h = 10, sq = e.onGround ? Math.abs(Math.sin(e.anim*4))*.15 : -.2;
    ctx.save(); ctx.translate(bx+w/2, by+h); ctx.scale(1+sq, 1-sq); ctx.translate(-(bx+w/2), -(by+h));
    ctx.fillStyle = 'rgba(6,3,14,.3)'; ctx.fillRect(bx+1, by+h-1, w-2, 2);
    const body = e.flash>0 ? P.ink : P.slime, dark = e.flash>0 ? P.ink : P.slimeDark;
    B(bx+1, by+2, w-2, h-2, body); B(bx+2, by, w-4, 2, body); B(bx, by+4, w, h-5, body);
    B(bx+2, by+h-2, w-4, 2, dark); B(bx+w-2, by+3, 1, h-5, dark);
    B(bx+3, by+1, 3, 1, P.slimeLit); B(bx+2, by+2, 1, 2, P.slimeLit);
    const ex = e.dir>0 ? bx+8 : bx+3; B(ex, by+4, 2, 2, P.slimeEye); B(ex + (e.dir>0?-4:4), by+4, 2, 2, P.slimeEye); B(ex, by+4, 1, 1, P.ink);
    if(Math.sin(e.anim*2.3) > .9){ B(ex, by+4, 2, 1, dark); }
    B(bx+5, by+8, 3, 1, dark);
    ctx.restore();
    if(e.onGround && Math.random()<.03) parts.push({x:e.x+Math.random()*e.w, y:e.y+e.h, vx:0, vy:8, life:.5, max:.5, col:P.slimeDark, r:1, g:0});
  } else {
    ctx.globalCompositeOperation = 'lighter';
    const gl = ctx.createRadialGradient(bx+6,by+6,1,bx+6,by+6,22); gl.addColorStop(0,'rgba(255,178,107,.45)'); gl.addColorStop(1,'rgba(255,178,107,0)'); ctx.fillStyle = gl; ctx.fillRect(bx-16,by-16,44,44);
    ctx.globalCompositeOperation = 'source-over';
    const fl = e.flash>0;
    B(bx+3, by+1, 5, 9, fl?P.ink:P.wisp); B(bx+1, by+3, 9, 5, fl?P.ink:P.wisp); B(bx+4, by+3, 3, 3, P.wispCore);
    B(bx+4, by+4, 1, 1, P.slimeEye); B(bx+6, by+4, 1, 1, P.slimeEye);
    const tw = Math.sin(e.anim*6); B(bx-2, by+5+(tw>0?1:0), 3, 1, P.wisp); B(bx+10, by+5+(tw<0?1:0), 3, 1, P.wisp);
  }
  ctx.globalAlpha = 1;
}

function drawForeground(){
  const p = 1.25, shift = -((ox*p) % 96);
  ctx.fillStyle = 'rgba(16,12,32,.8)';
  for(let x = shift - 96; x < BW; x += 96){ for(let i=0;i<12;i++){ const h = hash(i, 5); const gx = x + i*8 + (h*6|0), gy = Math.round(GROUND*Z - oy) + 4 + (h*16|0), gh = 4 + (h*9|0); if(gy > BH) continue; ctx.fillRect(gx, gy-gh, 1, gh); if(h > .5) ctx.fillRect(gx+1, gy-gh+1, 1, 1); } }
}

function drawHUD(){
  for(let i=0;i<3;i++){ const x = 10 + i*14, y = 10, c = i < hp ? P.danger : P.stoneDark; B(x, y+1, 2, 4, c); B(x+2, y, 3, 6, c); B(x+5, y, 3, 6, c); B(x+8, y+1, 2, 4, c); B(x+3, y+6, 4, 2, c); B(x+4, y+8, 2, 1, c); B(x+2, y+1, 2, 1, i < hp ? '#ffb3c0' : P.stone); }
  // ability pips: second leap and dash readiness
  const p = player, jumpOk = p.onGround || p.jumps < 2, dashOk = p.dashReady && p.dashCd <= 0 && p.dashT <= 0;
  B(10, 22, 6, 6, jumpOk ? P.eye : P.stoneDark); B(11, 23, 4, 4, jumpOk ? P.skyTop : P.stoneDark); B(12, 24, 2, 2, jumpOk ? P.eye : P.stoneDark);
  B(20, 22, 8, 6, dashOk ? P.amber : P.stoneDark); B(22, 24, 6, 2, dashOk ? P.moon : P.stoneLine);
  ctx.font = '8px monospace'; ctx.fillStyle = P.dim; ctx.textAlign = 'right'; ctx.fillText('FABLE RESPEC · T TUNER', BW-8, 16);
  ctx.fillText((runT|0) + 's', BW-8, 26);
  ctx.textAlign = 'left'; ctx.fillStyle = caps.portal === 'none' ? P.stoneLit : P.cyan;
  ctx.fillText(caps.portal === 'none' ? 'PORTAL · —' : caps.portal === 'single' ? `LINKED PORTAL · ${playerMouths.length}/1` : `TWIN PORTALS · ${playerMouths.length}/2`, 10, 38);
  if(won){ ctx.textAlign = 'center'; ctx.font = 'bold 14px monospace'; ctx.fillStyle = P.amber; ctx.fillText('THE DREAM YIELDS', BW/2, BH*.4); ctx.font = '8px monospace'; ctx.fillStyle = P.ink; ctx.fillText(`${runT.toFixed(1)}s · R to run it again`, BW/2, BH*.4 + 16); }
}

// ── Loop ───────────────────────────────────────────────────────────────────
let last = performance.now();
function frame(now){
  let dt = Math.min(.05, (now - last)/1000); last = now;
  const steps = dt > 1/100 ? 2 : 1; for(let i=0;i<steps;i++) step(dt/steps);   // sub-step so dash speeds never tunnel
  draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();
