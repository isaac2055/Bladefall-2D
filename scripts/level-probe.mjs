/* LEVEL PROBE — measure a level in a real headless browser, with the real stage kit.
 *
 * Why this exists: the shared preview pane freezes rAF when hidden, the TAS harness
 * boots with only `jump`, and a hand-written input search once reported a known-good
 * climb as unreachable. Every one of those produced a confident wrong answer. This
 * probe fixes the three at once: its own server and headless Chrome (rAF runs), the
 * level-select kit for the stage (not stage 0's), and cling-aware CONTROLLERS instead
 * of blind input grids — plus `validate`, which runs them on climbs the owner has
 * already played, so the instrument is proven before it is believed.
 *
 * Usage:
 *   node scripts/level-probe.mjs --stage 12 --script path/to/probe.js   (returns JSON)
 *   node scripts/level-probe.mjs --stage 12 --shot out.png --at 13300,500 [--crop x,y,w,h]
 *   node scripts/level-probe.mjs --validate
 *
 * A probe script is the BODY of an async function receiving `P` (see PROBE_API) and
 * returning JSON. It runs in the page.
 */
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import puppeteer from 'puppeteer';

const argv = process.argv.slice(2);
const arg = (n, f) => { const i = argv.indexOf('--' + n); return i >= 0 && argv[i + 1] ? argv[i + 1] : f; };
const has = (n) => argv.includes('--' + n);

const root = resolve(arg('root', 'public'));
const types = { '.html':'text/html', '.js':'application/javascript', '.mjs':'application/javascript',
  '.mp3':'audio/mpeg', '.png':'image/png', '.svg':'image/svg+xml', '.webmanifest':'application/manifest+json' };
const server = createServer(async (req, res) => {
  try {
    const path = resolve(root, '.' + new URL(req.url, 'http://x').pathname);
    if(!path.startsWith(root + '/')) throw 0;
    res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream' });
    res.end(await readFile(path));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));

/* Installed into the page once. Everything a probe needs, and nothing that edits the
   level: probes MEASURE. */
const PROBE_API = () => {
  const B = window.__BF;
  const FULL = ['jump','weapon','dash','portal-single','portal-pair','wall-jump','counter',
    'double-jump','attunement','companion-command','downward-strike','gravity-flip'];
  const P = {
    B,
    get G(){ return B.G; },
    /* Load a stage with the kit Level Select would give it: every ability whose owning
       zone comes before the stage. `kit:'full'` forces all twelve. */
    load(stage, opts = {}){
      B.tas.resetGame();
      const acquired = opts.kit === 'full' ? FULL : B.capabilities.abilities
        .filter(a => a.id === 'jump' || ((B.progression.zone(a.unlockZone) || {}).stageIndex < stage))
        .map(a => a.id);
      B.G.sessionCapabilities = B.capabilities.createState({ acquired });
      if(opts.endpoint) B.G._pendingZoneEndpoint = opts.endpoint;
      B.reloadStage(stage);
      B.tas.stepFrames(1, {});
      if(opts.noEnemies !== false) B.G.enemies.length = 0;
      return { stage, acquired, maxJumps: B.G.p.maxJumps, len: B.G.levelLength };
    },
    place(x, y){ const p = B.G.p; Object.assign(p, { x, y, vx:0, vy:0, dead:false, jumps:0,
      dodgeCdT:0, dodgeTimer:0, airRefill:false, seamRide:null, onGround:false, ckX:x, ckY:y, ckSet:true }); },
    step(n = 1, inp = {}, keep = {}){
      for(let i = 0; i < n; i++){
        if(keep.noEnemies) B.G.enemies.length = 0;
        if(keep.immortal){ B.G.p.invuln = 9; B.G.p.blood = B.G.p.maxBlood; }
        B.tas.stepFrames(1, inp);
      }
      return P.state();
    },
    state(){ const p = B.G.p; return { x:Math.round(p.x), y:Math.round(p.y), vx:Math.round(p.vx), vy:Math.round(p.vy),
      onGround:!!p.onGround, onWall:!!p.onWall, wallDir:p.wallDir||0, riding:!!p.seamRide, dead:!!p.dead,
      blood:+(p.blood||0).toFixed(2), floor:p.floorPlat ? Math.round(p.floorPlat.x) + '@' + p.floorPlat.y : null,
      wallX: p.wallObj ? p.wallObj.x : null }; },
    /* Named surfaces, so results read as places, not coordinates. */
    surfaceAt(x, y, tol = 14){
      for(const o of B.G.obstacles) if(o.type === 'plat' && !o.gone &&
        x >= o.x - o.w / 2 - 6 && x <= o.x + o.w / 2 + 6 && Math.abs((o.y || 0) - y) <= tol) return o;
      return null;
    },
    /* Put the knight ON a face, clinging, at height y. side=+1 is the EAST face (the
       knight stands east of the wall, pressing west); -1 the WEST face. Isolates the
       move being tested from the approach to it. */
    clingAt(wall, side, y, keep = {}){
      const o = typeof wall === 'object' ? wall : B.G.obstacles.find(q => q.type === 'wall' && q.x === wall);
      if(!o) return { clung:false, reason:'no wall' };
      const w = o.w || 26, toward = side > 0 ? 'left' : 'right';
      P.place(o.x + side * (w / 2 + 14), y);
      B.G.p.vx = side > 0 ? -200 : 200;
      for(let i = 0; i < 8; i++){ const t = P.step(1, { [toward]:true }, keep); if(t.onWall) return { clung:true, at:t }; }
      return { clung:false, at:P.state() };
    },
    /* One wall jump from a cling, then steer: `plan` is a list of [frame, input] edits.
       Returns where the knight comes to rest. The workhorse every move is built from. */
    fromCling(wall, side, y, plan, keep = {}, maxF = 90){
      const c = P.clingAt(wall, side, y, keep); if(!c.clung) return { clung:false, at:c.at };
      const away = side > 0 ? 'right' : 'left', toward = side > 0 ? 'left' : 'right';
      const script = {}; for(const [f, inp] of plan) script[f] = Object.assign(script[f] || {}, inp);
      let best = B.G.p.y, landed = null;
      for(let f = 0; f < maxF; f++){
        const inp = Object.assign({}, script[f] || {});
        if(inp.away){ inp[away] = true; delete inp.away; }
        if(inp.toward){ inp[toward] = true; delete inp.toward; }
        const t = P.step(1, inp, keep); best = Math.max(best, t.y);
        if(t.dead){ landed = { dead:true }; break; }
        if(f > 2 && t.onGround){ landed = t; break; }
      }
      return { clung:true, best:Math.round(best), landed, end:P.state() };
    },
    /* The FACE-LADDER move, the region's motif: cling, jump AWAY, dash BACK onto a shelf.
       Hold-away for a frames, then toward; dash at frame d; optional air jump at j. */
    faceLadder(wall, side, y, opts = {}){
      let best = null; const tried = [];
      for(const a of opts.a || [3,5,7,9,12]) for(const d of opts.d || [a, a+2, a+4, a+7, a+10])
        for(const j of opts.j || [-1, a+1, a+3, a+6]){
          const plan = [[0,{ jump:true, away:true }]];
          for(let f = 1; f < a; f++) plan.push([f, { away:true }]);
          for(let f = a; f < 90; f++) plan.push([f, { toward:true }]);
          plan.push([d, { dodge:true }]); if(j >= 0) plan.push([j, { jump:true }]);
          const r = P.fromCling(wall, side, y, plan, opts.keep || {});
          if(r.landed && !r.landed.dead && r.landed.y > y && (!best || r.landed.y > best.landed.y)) best = { ...r, a, d, j };
          tried.push(r.landed && r.landed.floor);
        }
      return { best, distinctLandings:[...new Set(tried.filter(Boolean))] };
    },
    /* SINGLE-FACE CLIMB: wall-jump, drift away briefly, come back and spend the air jump
       into the same face; repeat. Does repeated cycling on ONE column gain height? */
    climbFace(wall, side, y, opts = {}){
      const c = P.clingAt(wall, side, y, opts.keep || {}); if(!c.clung) return { clung:false };
      const away = side > 0 ? 'right' : 'left', toward = side > 0 ? 'left' : 'right';
      const trace = [Math.round(B.G.p.y)]; let best = B.G.p.y, cyc = 0;
      const wx = c.at.wallX;
      for(; cyc < (opts.cycles || 14); cyc++){
        P.step(1, { jump:true, [away]:true }, opts.keep || {});
        for(let i = 0; i < (opts.awayF ?? 4); i++) P.step(1, { [away]:true }, opts.keep || {});
        let back = false;
        for(let i = 0; i < 45; i++){
          const inp = { [toward]:true }; if(i === (opts.djAt ?? 3)) inp.jump = true;
          const t = P.step(1, inp, opts.keep || {}); best = Math.max(best, t.y);
          if(t.onWall && t.wallX === wx){ back = true; break; }
          if(t.onGround){ break; }
        }
        trace.push(Math.round(B.G.p.y));
        if(!back) break;
      }
      return { clung:true, startY:y, best:Math.round(best), cycles:cyc, trace, end:P.state() };
    },
    /* SEARCH: can the knight get from where they stand to `target` at all?
       Breadth-first over MACROS — the moves a player actually makes, including the two
       the old bot never had (cling-cycling a single face, and dashing into a seam end) —
       with a beam, TAS snapshots for branching, and a coarse state grid for dedup.
         target(s)  -> true when reached (s = P.state())
         forbid(s)  -> true prunes the branch (e.g. "without ever riding a seam")
       Returns a WITNESS (macro names, in order) when it finds one. A witness is proof:
       it happened in the engine. A miss is only "not within this budget", which is why
       the budget is reported alongside it. */
    search(opts){
      const B2 = B, keep = opts.keep || { noEnemies:true };
      const beam = opts.beam || 90, depthMax = opts.depth ?? 9, tx = opts.goal ? opts.goal[0] : null, ty = opts.goal ? opts.goal[1] : null;
      const R = (d) => d < 0 ? 'left' : 'right';
      const mk = (name, frames) => ({ name, frames });
      const rep = (n, f) => Array.from({ length:n }, () => f);
      const macrosFor = P.macros = P.macros || ((s) => {
        const out = [];
        for(const d of [-1, 1]){
          const D = { [R(d)]:true }, tag = d < 0 ? 'L' : 'R';
          out.push(mk('walk' + tag, [...rep(12, D), {}]));
          out.push(mk('jump' + tag, [...rep(8, { ...D, jump:true }), ...rep(16, D), {}]));
          out.push(mk('jumpDash' + tag, [{ ...D, jump:true }, ...rep(4, { ...D, jump:true }), { ...D, dodge:true }, ...rep(20, D), {}]));
          out.push(mk('dash' + tag, [{ ...D, dodge:true }, ...rep(14, D), {}]));
          out.push(mk('dj' + tag, [...rep(6, { ...D, jump:true }), ...rep(2, D), ...rep(8, { ...D, jump:true }), ...rep(18, D), {}]));
          out.push(mk('djDash' + tag, [...rep(6, { ...D, jump:true }), ...rep(2, D), ...rep(4, { ...D, jump:true }), { ...D, dodge:true }, ...rep(22, D), {}]));
          out.push(mk('late' + tag, [...rep(10, D), ...rep(6, { ...D, jump:true }), D, { ...D, dodge:true }, ...rep(18, D), {}]));
        }
        if(s.onWall){
          const away = s.wallDir > 0 ? 'left' : 'right', toward = s.wallDir > 0 ? 'right' : 'left';
          const A = { [away]:true }, T = { [toward]:true };
          out.push(mk('climb', [{ ...A, jump:true }, ...rep(4, A), ...rep(3, T), { ...T, jump:true }, ...rep(22, T), {}]));
          out.push(mk('kickBack', [{ ...A, jump:true }, ...rep(6, A), ...rep(26, T), {}]));
          out.push(mk('kickBackDash', [{ ...A, jump:true }, ...rep(6, A), ...rep(2, T), { ...T, dodge:true }, ...rep(24, T), {}]));
          out.push(mk('kickBackDj', [{ ...A, jump:true }, ...rep(6, A), ...rep(3, T), { ...T, jump:true }, ...rep(26, T), {}]));
          out.push(mk('kickAway', [{ ...A, jump:true }, ...rep(28, A), {}]));
          out.push(mk('kickAwayDash', [{ ...A, jump:true }, ...rep(4, A), { ...A, dodge:true }, ...rep(24, A), {}]));
        }
        out.push(mk('wait', [...rep(20, {}), {}]));
        return out;
      });
      const key = (s) => [s.floor || (s.onWall ? 'w' + s.wallX : 'air'), Math.round(s.x / 16), Math.round(s.y / 16),
        Math.round(s.vx / 200), s.onWall ? 1 : 0, B2.G.p.jumps, s.riding ? 1 : 0,
        // TIME PHASE. Timed seams and spikes open on a beat; without this, "wait for the
        // beat" returns to a state already seen and is deduped away — so a search could
        // never time a jump, and every "not found" on a timed element was unearned.
        Math.floor((B2.G.time || 0) / 0.4) % 8].join('|');
      const seen = new Set();
      let frontier = [{ slot:'n0_0', path:[], s:P.state() }];
      B2.tas.saveState('n0_0'); seen.add(key(frontier[0].s));
      let explored = 0, framesRun = 0, bestDist = Infinity, bestState = null;
      for(let depth = 0; depth < depthMax && frontier.length; depth++){
        const next = [];
        for(const node of frontier){
          B2.tas.restoreState(node.slot);
          const base = P.state();
          for(const m of macrosFor(base)){
            B2.tas.restoreState(node.slot);
            let s = base, pruned = false, hit = false, rodeAny = false;
            for(const f of m.frames){
              try{ s = P.step(1, f, keep); }catch(e){ pruned = true; break; }
              framesRun++;
              if(s.riding) rodeAny = true;
              if(s.dead || (opts.forbid && opts.forbid(s))){ pruned = true; break; }
              if(opts.target(s)){ hit = true; break; }
            }
            explored++;
            // a respawn teleports you home; that is a failed branch, not a route
            if(!pruned && Math.hypot(s.x - base.x, s.y - base.y) > 1400 && !rodeAny) pruned = true;
            if(pruned) continue;
            const path = node.path.concat(m.name);
            if(hit) return { found:true, path, at:s, depth:depth + 1, explored, framesRun };
            // settle in the air a few frames is fine; dedupe on the grid
            const k = key(s); if(seen.has(k)) continue; seen.add(k);
            const dist = tx == null ? 0 : Math.hypot(s.x - tx, (s.y - ty) * 1.4);
            if(dist < bestDist){ bestDist = dist; bestState = { s, path }; }
            next.push({ path, s, dist });
          }
        }
        next.sort((a, b) => a.dist - b.dist);
        const keepN = next.slice(0, beam);
        // keep some diversity: the highest-reaching and the farthest-travelled survive too
        const extra = next.slice(beam).sort((a, b) => b.s.y - a.s.y).slice(0, Math.floor(beam / 3));
        frontier = [];
        for(const [i, n] of [...keepN, ...extra].entries()){
          // re-derive the state for this node by replaying its last macro from its parent is
          // costly; instead snapshot now by replaying the path from the start snapshot.
          B2.tas.restoreState('n0_0');
          for(const name of n.path){ const m = macrosFor(P.state()).find(q => q.name === name); if(!m){ break; } for(const f of m.frames) P.step(1, f, keep); }
          const slot = 'n' + (depth + 1) + '_' + i; B2.tas.saveState(slot);
          frontier.push({ slot, path:n.path, s:P.state() });
        }
      }
      return { found:false, explored, framesRun, depth:depthMax, beam, closest:bestState ? { at:bestState.s, path:bestState.path, dist:Math.round(bestDist) } : null };
    },
    /* REPLAY a witness path from the current state and log it, so a surprising route can
       be understood before anything is "fixed" on a guess. Uses the same macro set. */
    replay(path, opts = {}){
      if(!P.macros){ B.tas.saveState('__rp'); P.search({ target:() => false, depth:0 }); B.tas.restoreState('__rp'); }
      const log = []; const keep = opts.keep || { noEnemies:true };
      let f = 0;
      for(const name of path){
        const m = P.macros(P.state()).find(q => q.name === name);
        if(!m){ log.push({ missing:name }); break; }
        for(const inp of m.frames){
          const s = P.step(1, inp, keep); f++;
          const p = B.G.p;
          if(f % (opts.every || 3) === 0 || s.riding || s.onWall)
            log.push({ f, m:name, x:s.x, y:s.y, vx:s.vx, vy:s.vy, g:s.onGround ? 1 : 0, w:s.onWall ? s.wallX : 0,
              r:s.riding ? 1 : 0, j:p.jumps, dcd:+(p.dodgeCdT||0).toFixed(2), bal:+(p._ballisticT||0).toFixed(2),
              fl:+(p._flungT||0).toFixed(2), air:p.airRefill ? 1 : 0 });
        }
      }
      return { end:P.state(), log };
    },
    /* Paint one frame and return it as a PNG data URL, optionally cropped and scaled. */
    shot(crop, scale = 1){
      B.drawFrame();
      const c = document.querySelector('canvas');
      if(!crop) return c.toDataURL('image/png');
      const [x, y, w, h] = crop, o = document.createElement('canvas');
      o.width = w * scale; o.height = h * scale;
      const g = o.getContext('2d'); g.imageSmoothingEnabled = false;
      g.drawImage(c, x, y, w, h, 0, 0, w * scale, h * scale);
      return o.toDataURL('image/png');
    },
  };
  window.__P = P;
  return true;
};

const browser = await puppeteer.launch({ headless:true, protocolTimeout:1_800_000,
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args:['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width:1440, height:900, deviceScaleFactor:1 });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
let exitCode = 0;
try {
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html?tas=1`, { waitUntil:'domcontentloaded' });
  await page.waitForFunction(() => window.__BF?.tas && window.__BF?.drawFrame);
  await page.evaluate(PROBE_API);

  if(has('validate')){
    /* The instrument has to reproduce what the owner has already done in play before
       anything it says about new geometry is believed. */
    const out = await page.evaluate(async () => {
      const P = window.__P, r = {}, K = { noEnemies:true, immortal:true };
      // ROOM 3, the climb the owner has played and called "easy to just climb the walls".
      // From a cling on wall 10680's east face, the face-ladder move must land on the
      // shelf that wall carries, Pl(10830,160,470).
      P.load(12);
      const fl = P.faceLadder(10680, +1, 380, { keep:K });
      r.room3_faceLadder_lands = fl.best ? fl.best.landed.floor : null;
      r.room3_faceLadder_timing = fl.best ? { a:fl.best.a, d:fl.best.d, j:fl.best.j } : null;
      r.room3_distinctLandings = fl.distinctLandings;
      // And room 1's ladder, the one the owner asked for more of.
      P.load(12);
      const f1 = P.faceLadder(14860, +1, 380, { keep:K });
      r.room1_faceLadder_lands = f1.best ? f1.best.landed.floor : null;
      // Single-face climb on the tallest bare column in room 3 (9280, top 1660).
      P.load(12);
      r.room3_singleFace_9280 = P.climbFace(9280, +1, 900, { keep:K });
      return r;
    });
    console.log(JSON.stringify(out, null, 1));
  } else if(arg('script')){
    const body = await readFile(resolve(arg('script')), 'utf8');
    const stage = Number(arg('stage', '12'));
    const out = await page.evaluate(new Function('stage', `return (async () => { const P = window.__P; ${body} })();`), stage);
    console.log(JSON.stringify(out, null, 1));
  } else if(arg('shot')){
    const stage = Number(arg('stage', '12'));
    const [x, y] = arg('at', '0,0').split(',').map(Number);
    const crop = arg('crop') ? arg('crop').split(',').map(Number) : null;
    const url = await page.evaluate((stage, x, y, crop, scale, settle, endpoint) => {
      const P = window.__P; P.load(stage, { endpoint });
      for(let i = 0; i < settle; i++){ P.place(x, y); P.step(1, {}, { noEnemies:true, immortal:true }); }
      return P.shot(crop, scale);
    }, stage, x, y, crop, Number(arg('scale', '1')), Number(arg('settle', '40')), arg('endpoint', null));
    await writeFile(resolve(arg('shot')), Buffer.from(url.split(',')[1], 'base64'));
    console.log('wrote', arg('shot'));
  }
} catch (e) { console.error('probe failed:', e.message); exitCode = 1; }
if(errors.length){ console.error('page errors:', errors.slice(0, 5)); }
await browser.close(); server.close();
process.exit(exitCode);
