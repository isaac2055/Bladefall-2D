/* A general, geometry-derived traversal bot for a single loaded level.
 *
 * Every export here is evaluated inside the page by scripts/run-bot.mjs, so each
 * one must be self-contained: no imports, no closure over module scope.
 *
 * The shape is the one the owner asked for and the Frostfell solver prototyped
 * by hand: derive segments from the level's own geometry, steer heuristically
 * toward the next one, branch with TAS save/restore when a hop stalls, and
 * report either the winning inputs or the exact segment that failed. Unlike
 * scripts/frostfell-route.mjs it reads no bespoke authoring flag, so it runs on
 * any level whose geometry is loaded.
 *
 * What it does NOT claim: bosses, puzzles that need interaction or portals,
 * and cross-zone streaming are all outside it. It solves traversal.
 */

export function solveLevel(options) {
  const tas = window.__BF.tas;
  const opt = Object.assign({
    goalX: null,            // default: the far end of the level in the travel direction
    direction: null,        // +1 / -1; default: away from the side the knight spawned on
    restoreFrom: null,
    maxSegments: 160,
    maxCandidates: 4,
    allowBloodLoss: false,
    hopExpansions: 700,     // macro expansions per hop attempt
    hopDepth: 70,           // macros along one path (~1000 frames)
    noProgressLimit: 9,     // consecutive non-improving macros before a path is abandoned
    totalExpansions: 30000,
    traceLimit: 400,
  }, options || {});

  // ---- movement envelope, read from the runtime rather than guessed ----------
  const tuning = (window.__BF.movementState && window.__BF.movementState().profile.tuning) || {};
  const RUN = tuning.runSpeed || 200, JUMP = tuning.jumpVelocity || 480, GRAV = tuning.gravity || 1400;
  const apex = (JUMP * JUMP) / (2 * GRAV);
  const can = (id) => { try { return hasCapability(id); } catch (_) { return false; } };
  const hasDouble = can('double-jump'), hasDash = can('dash');
  const hasWeapon = can('weapon') && !!(G.p && G.p.weapon);
  const MAX_RISE = apex * (hasDouble ? 2.35 : 1.15) + 40;
  const MAX_REACH = RUN * (2 * JUMP / GRAV) * (hasDouble ? 2.4 : 1.5) + (hasDash ? 240 : 0) + 90;

  // ---- geometry ------------------------------------------------------------
  // Ledge objects are cached by GEOMETRY, not by obstacle: restoreState() hands
  // back a fresh clone of the world, so obstacle objects change on every restore
  // while the graph, the segment stack and standingOn() must still agree on what
  // "the same ledge" is. Two coincident spans collapse into one ledge, which is
  // the right answer for routing.
  const ledgeCache = new Map();
  const bySpan = new Map();   // full obstacle span -> its sub-ledges
  let all = [];
  const spanKey = (x0, x1, y) => `${Math.round(x0)}:${Math.round(x1)}:${Math.round(y)}`;
  // A wall or closed door standing on a platform cuts it into separate ledges:
  // a knight on one side cannot reach the other, and a graph that treated the
  // whole span as one node believed it could walk straight through the wall.
  function standingBlockers() {
    return G.obstacles.filter((o) => !o.gone && (o.type === 'wall' || (o.type === 'door' && !doorOpen(o))));
  }
  function ledges() {
    const live = new Set();
    const blockers = standingBlockers();
    bySpan.clear();
    for (const o of G.obstacles) {
      if (o.type !== 'plat' || o.ceiling || o.gone || o.fake || o.invisible || (o.y || 0) < 0) continue;
      const y = o.y || 0, X0 = o.x - o.w / 2, X1 = o.x + o.w / 2;
      const cuts = blockers
        .filter((b) => b.x > X0 + 4 && b.x < X1 - 4 && b.y > y + 50 && b.y - b.h < y + 10)
        .map((b) => [b.x - (b.w || 26) / 2, b.x + (b.w || 26) / 2]).sort((a, b) => a[0] - b[0]);
      const pieces = []; let start = X0;
      for (const [c0, c1] of cuts) { if (c0 - start >= 24) pieces.push([start, c0]); start = Math.max(start, c1); }
      if (X1 - start >= 24) pieces.push([start, X1]);
      if (!pieces.length) pieces.push([X0, X1]);
      const subs = [];
      for (const [x0, x1] of pieces) {
        const k = spanKey(x0, x1, y);
        let l = ledgeCache.get(k);
        if (!l) { l = {}; ledgeCache.set(k, l); }
        l.ref = o; l.x = (x0 + x1) / 2; l.w = x1 - x0; l.y = y; l.x0 = x0; l.x1 = x1;
        live.add(k); subs.push(l);
      }
      bySpan.set(spanKey(X0, X1, y), subs);
    }
    for (const k of [...ledgeCache.keys()]) if (!live.has(k)) ledgeCache.delete(k);
    all = [...ledgeCache.values()];
    return all;
  }
  const key = (l) => spanKey(l.x0, l.x1, l.y);
  function standingOn() {
    const p = G.p;
    const fp = p.floorPlat;
    if (fp && fp.type === 'plat') {
      const subs = bySpan.get(spanKey(fp.x - fp.w / 2, fp.x + fp.w / 2, fp.y || 0)) || [];
      const l = subs.find((s) => p.x >= s.x0 - 8 && p.x <= s.x1 + 8) || subs[0];
      if (l) return l;
    }
    let best = null;
    for (const l of all) {
      if (p.x < l.x0 - 8 || p.x > l.x1 + 8 || Math.abs((p.y || 0) - l.y) > 6) continue;
      if (!best || l.y > best.y) best = l;
    }
    return best;
  }
  const ledgeUnder = (x, y) => {
    let best = null;
    for (const l of all) {
      if (x < l.x0 - 10 || x > l.x1 + 10 || l.y > y + 6) continue;
      if (!best || l.y > best.y) best = l;
    }
    return best;
  };
  function hazardsBetween(ax, bx) {
    const lo = Math.min(ax, bx) - 60, hi = Math.max(ax, bx) + 60;
    return G.obstacles.filter((o) => !o.gone && (o.type === 'spikes' || o.type === 'trap') && o.x > lo && o.x < hi).length;
  }

  // ---- direction and goal ---------------------------------------------------
  if (opt.restoreFrom) tas.restoreState(opt.restoreFrom);
  ledges();
  const baseTravel = opt.direction || (G.p.x > G.levelLength / 2 ? -1 : 1);
  let travel = baseTravel;   // direction of the current drive
  let dir = travel;          // direction of the current search (macros)
  const bossAhead = G.enemies.find((e) => e.boss && !e.dead && (e.x - G.p.x) * baseTravel > 0);
  let goalKind = 'level-end';
  let goalX = opt.goalX == null ? (baseTravel > 0 ? G.levelLength - 120 : 120) : opt.goalX;
  if (opt.goalX == null && bossAhead) {
    const threshold = bossAhead.x - baseTravel * 520;
    if ((threshold - goalX) * baseTravel < 0) { goalX = threshold; goalKind = 'boss-threshold'; }
  }
  let crossedBoundary = false, wrongWayBoundary = false, allowBoundary = true;
  const stepFrame = (input) => {
    try { tas.stepFrames(1, input); return true; }
    catch (error) {
      if (!/zone boundary/i.test(String(error && error.message))) throw error;
      // The level has a seam at each end; only the one on the goal side, reached
      // by the main drive, counts as completion.
      if (allowBoundary && (G.p.x - G.levelLength / 2) * baseTravel > 0) crossedBoundary = true; else wrongWayBoundary = true;
      return false;
    }
  };
  const reachedGoal = () => crossedBoundary || (baseTravel > 0 ? G.p.x >= goalX : G.p.x <= goalX);
  const front = (l) => travel > 0 ? l.x1 : l.x0;
  const back = (l) => travel > 0 ? l.x0 : l.x1;
  const gapTo = (a, b) => travel > 0 ? b.x0 - a.x1 : a.x0 - b.x1;

  // A wall or closed door whose span covers both ledge heights cannot be walked
  // or jumped through; a candidate behind one is not a candidate.
  function blockedBetween(a, b) {
    const lo = Math.min(a.x1, b.x1), hi = Math.max(a.x0, b.x0);
    if (hi <= lo) return false;                       // spans overlap: nothing lies between them
    const yLo = Math.min(a.y, b.y), yHi = Math.max(a.y, b.y);
    return G.obstacles.some((o) => {
      if (o.gone || o.x <= lo || o.x >= hi) return false;
      if (o.type !== 'wall' && !(o.type === 'door' && !doorOpen(o))) return false;
      return o.y > yHi + 50 && o.y - o.h < yLo + 10;
    });
  }
  function doorsBetween(a, xTo) {
    const lo = Math.min(front(a), xTo), hi = Math.max(front(a), xTo);
    return G.obstacles.filter((o) => !o.gone && o.type === 'door' && !doorOpen(o) && o.x > lo && o.x < hi && o.y > a.y + 50 && o.y - o.h < a.y + 10);
  }

  // ---- macro-actions ----------------------------------------------------------
  // A macro drives the knight for a short burst through `step`, which advances
  // one frame, records the input, and returns a bail reason if the frame ended
  // badly. Every macro ends with jump released so the next macro's press is a
  // new edge; the harness treats a held button as a single press.
  let D, B, MACROS, macroByName;
  const fixed = (frames) => (step) => { for (const f of frames) { const why = step(f); if (why) return why; } return null; };
  const rep = (input, n) => Array.from({ length: n }, () => input);
  // Run toward the leading edge of whatever the knight stands on and stop there,
  // so a plain run does not blindly step off into a pit.
  const toEdge = (margin, max) => (step) => {
    for (let i = 0; i < max; i++) {
      const l = standingOn();
      if (!l || !G.p.onGround) return null;
      if ((front(l) - G.p.x) * dir <= margin) return null;
      const why = step(D); if (why) return why;
    }
    return null;
  };
  const then = (...parts) => (step) => { for (const part of parts) { const why = part(step); if (why) return why; } return null; };
  function buildMacros(d) {
    dir = d;
    D = dir > 0 ? { right: true } : { left: true };
    B = dir > 0 ? { left: true } : { right: true };
    MACROS = [
      { name: 'run', exec: fixed(rep(D, 12)) },
      { name: 'toEdge', exec: toEdge(6, 120) },
      { name: 'edgeJump21', exec: then(toEdge(10, 120), fixed([...rep({ ...D, jump: true }, 21), ...rep(D, 5)])) },
      { name: 'edgeJump12', exec: then(toEdge(10, 120), fixed([...rep({ ...D, jump: true }, 12), ...rep(D, 8)])) },
      { name: 'edgeDrop', exec: then(toEdge(-14, 120), fixed(rep(D, 10))) },
      { name: 'jump21', exec: fixed([...rep({ ...D, jump: true }, 21), ...rep(D, 5)]) },
      { name: 'jump12', exec: fixed([...rep({ ...D, jump: true }, 12), ...rep(D, 8)]) },
      { name: 'jump6', exec: fixed([...rep({ ...D, jump: true }, 6), ...rep(D, 10)]) },
      { name: 'jumpUp', exec: fixed([...rep({ jump: true }, 21), ...rep({}, 4)]) },
      { name: 'wait', exec: fixed(rep({}, 12)) },
      { name: 'back', exec: fixed(rep(B, 10)) },
      { name: 'backJump', exec: fixed([...rep({ ...B, jump: true }, 14), ...rep(B, 6)]) },
    ];
    if (hasDash) MACROS.push({ name: 'dash', exec: fixed([...rep({ ...D, dash: true }, 2), ...rep(D, 12)]) },
      { name: 'jumpDash', exec: fixed([...rep({ ...D, jump: true }, 10), ...rep({ ...D, dash: true }, 2), ...rep(D, 10)]) },
      { name: 'edgeJumpDash', exec: then(toEdge(10, 120), fixed([...rep({ ...D, jump: true }, 12), ...rep({ ...D, dash: true }, 2), ...rep(D, 12)])) });
    MACROS.push({ name: 'double', exec: fixed([...rep({ ...D, jump: true }, 12), ...rep(D, 2), ...rep({ ...D, jump: true }, 14), ...rep(D, 6)]) },
      { name: 'doubleLate', exec: fixed([...rep({ ...D, jump: true }, 16), ...rep(D, 10), ...rep({ ...D, jump: true }, 14), ...rep(D, 6)]) },
      { name: 'edgeDouble', exec: then(toEdge(10, 120), fixed([...rep({ ...D, jump: true }, 14), ...rep(D, 8), ...rep({ ...D, jump: true }, 14), ...rep(D, 6)])) },
      { name: 'airJump', exec: fixed([...rep({ ...D, jump: true }, 14), ...rep(D, 4)]) });
    if (hasWeapon) MACROS.push({ name: 'strike', exec: fixed([...rep({ ...D, attack: true }, 2), ...rep(D, 12)]) });
    macroByName = Object.fromEntries(MACROS.map((m) => [m.name, m]));
  }
  buildMacros(travel);

  function threatAhead(reach) {
    const p = G.p;
    return G.enemies.some((e) => !e.dead && Math.abs((e.y || 0) - (p.y || 0)) < 90 &&
      (e.x - p.x) * dir > -20 && Math.abs(e.x - p.x) < reach);
  }
  // Move ordering is where the domain knowledge lives: it is only an ordering,
  // so a wrong guess costs budget, not correctness.
  function orderedMacros() {
    const p = G.p, names = [];
    if (!p.onGround) {
      names.push('run');
      if (hasDash) names.push('dash');
      names.push(hasDouble ? 'airJump' : 'back', hasDouble ? 'back' : 'airJump', 'wait');
    } else if (threatAhead(150)) {
      names.push('wait', 'toEdge', 'edgeJump21', 'jump21', 'jump12', 'back', 'backJump', 'run', 'edgeJump12', 'edgeDrop', 'jump6');
      if (hasWeapon) names.unshift('strike');
      if (hasDash) names.splice(4, 0, 'jumpDash', 'edgeJumpDash');
      names.push('edgeDouble', 'double');
    } else {
      names.push('edgeJump21', 'edgeJump12', 'toEdge', 'run', 'jump21', 'jump12', 'edgeDrop', 'jump6');
      if (hasDash) names.push('edgeJumpDash', 'dash', 'jumpDash');
      if (hasDouble) names.push('edgeDouble', 'double', 'doubleLate');
      names.push('jumpUp', 'wait', 'back', 'backJump');
      if (!hasDouble) names.push('edgeDouble', 'double', 'doubleLate');
      if (hasWeapon) names.push('strike');
    }
    return names.map((n) => macroByName[n]).filter(Boolean);
  }

  // ---- ledge graph: which ledges can lead to the goal at all ----------------------
  // Edges are envelope-reachable hops that no wall or closed door bars and that
  // no failed attempt has removed. Distances run from the goal side, so a
  // candidate is simply a neighbour that is closer to the goal than we are.
  let dist = new Map();
  let transitionBans = new Map();
  const ban = (from, to) => { const k = key(from); if (!transitionBans.has(k)) transitionBans.set(k, new Set()); transitionBans.get(k).add(key(to)); };
  function neighbours(a) {
    const bans = transitionBans.get(key(a)) || new Set();
    const out = [];
    for (const b of all) {
      if (b === a || bans.has(key(b))) continue;
      if ((front(b) - back(a)) * travel <= 30) continue;      // entirely behind us
      const gap = Math.max(0, gapTo(a, b));
      if (gap > MAX_REACH || b.y - a.y > MAX_RISE || b.y < a.y - 700) continue;
      if (blockedBetween(a, b)) continue;
      out.push({ b, cost: 1 + gap / 300 + Math.abs(b.y - a.y) / 200 + hazardsBetween(front(a), back(b)) * 0.6 });
    }
    return out;
  }
  function rebuildGraph(seedsOf) {
    ledges();
    const rev = new Map(all.map((l) => [l, []]));
    for (const a of all) for (const { b, cost } of neighbours(a)) rev.get(b).push({ a, cost });
    dist = new Map();
    let seeds = seedsOf().filter(Boolean);
    if (!seeds.length && all.length) seeds = [all.reduce((m, l) => (front(l) - front(m)) * travel > 0 ? l : m, all[0])];
    const pq = seeds.map((l) => ({ l, d: 0 }));
    for (const l of seeds) dist.set(l, 0);
    while (pq.length) {
      pq.sort((x, y) => x.d - y.d);
      const { l, d } = pq.shift();
      if (d > dist.get(l)) continue;
      for (const { a, cost } of rev.get(l) || []) {
        const nd = d + cost;
        if (nd < (dist.get(a) ?? Infinity)) { dist.set(a, nd); pq.push({ l: a, d: nd }); }
      }
    }
  }
  const distOf = (l) => dist.get(l) ?? Infinity;

  // ---- one hop: depth-first macro search with backtracking ----------------------
  let totalExpansions = 0;
  function searchAhead(from, banned, allowBlood, target, budget, goalTest) {
    const hopBudget = budget || opt.hopExpansions;
    const zoneX = target ? (dir > 0 ? Math.min(target.x1 - 14, target.x + target.w / 2 - 14) : Math.max(target.x0 + 14, target.x - target.w / 2 + 14)) : goalX;
    const zoneY = target ? target.y : from.y;
    const h = () => {
      const p = G.p;
      const dx = target ? Math.max(0, target.x0 + 6 - p.x, p.x - (target.x1 - 6)) : Math.abs(zoneX - p.x);
      return dx + Math.abs((p.y || 0) - zoneY) * 0.6 + (p.onGround ? 0 : 8);
    };
    const landed = () => {
      if (!G.p.onGround) return null;
      if (goalTest) return goalTest() ? (standingOn() || from) : null;
      const l = standingOn();
      if (!l || l === from || banned.has(key(l))) return null;
      const dFrom = distOf(from), dl = distOf(l);
      if (dl < dFrom) return l;
      if (dFrom === Infinity && (front(l) - front(from)) * travel > 40 && !blockedBetween(from, l)) return l;
      return null;
    };
    const floorY = Math.min(from.y, target ? target.y : from.y) - 900;
    const startX = G.p.x;
    // Falling below the ground plane with nothing anywhere beneath is a pit: the
    // only outcome is a Blood and a checkpoint teleport.
    const doomed = () => {
      const p = G.p;
      if (p.onGround || !(p.vy > 0) || (p.y || 0) > -20) return false;
      return !all.some((l) => l.x0 - 300 < p.x && p.x < l.x1 + 300 && l.y < (p.y || 0) + 2);
    };

    const zoneNear = target ? (dir > 0 ? target.x0 : target.x1) : zoneX;
    const zoneFar = target ? (dir > 0 ? target.x1 : target.x0) : zoneX;
    const runToZone = { name: 'runToZone', exec: (step) => {
      for (let i = 0; i < 160; i++) {
        if (!G.p.onGround) return null;
        const to = (target ? target.x : zoneX) - G.p.x;
        if (Math.abs(to) < 8) return null;
        const why = step(to > 0 ? { right: true } : { left: true }); if (why) return why;
      }
      return null;
    } };
    // Approach macros: walk to a launch point a fixed distance before the target
    // and jump there. A thin platform's underside is solid, so jumping from
    // beneath it bonks; the launch point has to be short of its near edge, and
    // that spot is one expansion away instead of a long chain of 40-unit runs.
    const approach = (offset, hold, extra) => ({ name: `approach${offset}h${hold}${extra || ''}`, exec: (step) => {
      if (!target || !G.p.onGround) return null;
      const here = standingOn();
      let launch = dir > 0 ? target.x0 - offset : target.x1 + offset;
      if (here) launch = dir > 0 ? Math.min(launch, here.x1 - 8) : Math.max(launch, here.x0 + 8);
      if ((launch - G.p.x) * dir < -14) return null;
      for (let i = 0; i < 220; i++) {
        if (!G.p.onGround) return null;
        const to = launch - G.p.x;
        if (Math.abs(to) < 5) break;
        const why = step(to > 0 ? { right: true } : { left: true }); if (why) return why;
      }
      for (let i = 0; i < hold; i++) {
        const input = { ...D, jump: true };
        if (extra === 'dash' && i >= 5 && i < 7) input.dash = true;
        const why = step(input); if (why) return why;
      }
      if (extra === 'double') {
        for (let i = 0; i < 3; i++) { const why = step(D); if (why) return why; }
        for (let i = 0; i < 14; i++) { const why = step({ ...D, jump: true }); if (why) return why; }
      }
      for (let i = 0; i < 6; i++) { const why = step(D); if (why) return why; }
      return null;
    } });
    const approaches = [];
    const crystals = G.obstacles.filter((o) => o.type === 'crystal' && !o.gone && (o.y || 0) <= from.y + apex + 60 && (o.y || 0) >= from.y - 20 &&
      o.x >= from.x0 - 60 && o.x <= from.x1 + 320);
    for (const c of crystals) {
      for (const k of [0, 14, 28]) for (const second of [20, 16, 25]) for (const lead of [0, 5]) {
        approaches.push({ name: `crystal${k}s${second}l${lead}`, exec: (step) => {
          if (!G.p.onGround) return null;
          const launch = c.x - dir * k;
          const here = standingOn();
          if (here && (launch < here.x0 + 4 || launch > here.x1 - 4)) return null;
          for (let i = 0; i < 260; i++) {
            if (!G.p.onGround) return null;
            const to = launch - G.p.x;
            if (Math.abs(to) < 4) break;
            const why = step(to > 0 ? { right: true } : { left: true }); if (why) return why;
          }
          // Straight up into the crystal, then the refilled jump carries forward.
          for (let i = 0; i < second + 22; i++) {
            const rise = i < 21, again = i >= second && i < second + 16;
            const input = (rise || again) ? { jump: true } : {};
            if (i < lead || i >= second) Object.assign(input, D);
            const why = step(input); if (why) return why;
          }
          return null;
        } });
      }
    }
    if (target) {
      for (const offset of [40, 70, 100, 20, 130]) for (const hold of [21, 12]) {
        approaches.push(approach(offset, hold));
        if (hasDash) approaches.push(approach(offset, hold, 'dash'));
        if (hasDouble) approaches.push(approach(offset, hold, 'double'));
      }
      // Without Double Jump a second press only works through a crystal, so it
      // goes last rather than never.
      if (!hasDouble) for (const offset of [40, 70, 100]) approaches.push(approach(offset, 21, 'double'));
    }
    const order = () => {
      const names = orderedMacros();
      // On the ground with the zone at this height and no body in the way, the
      // straight run is overwhelmingly the right first try.
      if (G.p.onGround && Math.abs((G.p.y || 0) - zoneY) < 6 && !threatAhead(150)) names.unshift(runToZone);
      if (G.p.onGround && approaches.length) {
        const at = threatAhead(150) ? 1 : 0;   // keep 'wait' first when a body is close
        names.splice(at, 0, ...approaches);
      }
      return names;
    };
    tas.saveState('h0');
    const blood0 = G.p.blood;
    const path = [{ save: 'h0', tried: 0, order: order(), h: h(), noProg: 0, inputs: null }];
    let expansions = 0, bestH = Infinity;
    const attempts = [], histogram = {};
    while (path.length) {
      const node = path[path.length - 1];
      if (node.tried >= node.order.length || path.length > opt.hopDepth) { path.pop(); continue; }
      if (expansions >= hopBudget || totalExpansions >= opt.totalExpansions) break;
      const macro = node.order[node.tried++];
      tas.restoreState(node.save);
      expansions++; totalExpansions++;
      const frames = [];
      const step = (input) => {
        if (!stepFrame(input)) { frames.push(input); if (wrongWayBoundary) { wrongWayBoundary = false; return 'wrong-seam'; } return 'boundary'; }
        frames.push(input);
        if (G.p.dead) return 'died';
        if (!allowBlood && G.p.blood < blood0) return 'blood';
        if ((G.p.y || 0) < floorY && doomed()) return 'fell';
        if ((G.p.x - startX) * dir < -600) return 'retreated';
        if (doomed()) return 'pit';
        return null;
      };
      const why = macro.exec(step);
      histogram[why || 'ok'] = (histogram[why || 'ok'] || 0) + 1;
      attempts.push({ depth: path.length, macro: macro.name, why: why || 'ok', x: Math.round(G.p.x), y: Math.round(G.p.y || 0) });
      if (attempts.length > 24) attempts.shift();
      if (why === 'boundary') {
        const inputs = [];
        for (const n of path) if (n.inputs) inputs.push(...n.inputs);
        inputs.push(...frames);
        return { ok: true, inputs, ledge: { x: G.p.x, w: 0, y: G.p.y || 0, x0: G.p.x, x1: G.p.x, ref: null, exit: true }, expansions, depth: path.length, boundary: true };
      }
      if (why) continue;
      if (!frames.length) continue;
      const l = landed();
      if (l) {
        const inputs = [];
        for (const n of path) if (n.inputs) inputs.push(...n.inputs);
        inputs.push(...frames);
        return { ok: true, inputs, ledge: l, expansions, depth: path.length, dFrom: distOf(from), dTo: distOf(l), via: macro.name, sameSpan: key(l) === key(from) };
      }
      const hh = h(); bestH = Math.min(bestH, hh);
      // Past the far side of the zone on foot is a miss, not a position to build on.
      if (G.p.onGround && (G.p.x - zoneFar) * dir > 80) { histogram.overshot = (histogram.overshot || 0) + 1; continue; }
      const improved = hh < node.h - 0.75;
      const purposeful = macro.name === 'wait' && threatAhead(340);
      const noProg = improved ? 0 : node.noProg + (purposeful ? 0.34 : 1);
      if (noProg > opt.noProgressLimit) continue;
      const save = 'h' + path.length;
      tas.saveState(save);
      path.push({ save, tried: 0, order: order(), h: Math.min(hh, node.h), noProg, inputs: frames });
    }
    tas.restoreState('h0');
    return { ok: false, expansions, bestH: Math.round(bestH), histogram, attempts };
  }

  // ---- mechanisms -----------------------------------------------------------------
  const mechanisms = [];   // receipt: every activation attempted
  // Activators the level offers: quest residents and catches (Up), plain levers
  // (a weapon swing) and plates (stand). "Done" is read from the object itself.
  const actId = (o) => `${o.type}:${o.repairCatch || o.questActor || o.keepDropRelease && o.id || o.id || ''}:${Math.round(o.x)}:${Math.round(o.y || 0)}`;
  const isActivator = (o) => !o.gone && (
    o.questActor || o.repairCatch || o.keepDropRelease ||
    (o.type === 'lever' && !o.arrowOnly && !o.bruteChain && !o.frostThermalReceiver) ||
    (o.type === 'plate' && !o.crateOnly && !o.followerOnly && !o.trapOnly && !o.enemyOnly && !o.relayOnly));
  const activators = () => G.obstacles.filter(isActivator).map((first) => {
    const id = actId(first);
    const live = () => G.obstacles.find((o) => actId(o) === id) || first;
    const kind = first.type === 'plate' ? 'plate' : (first.type === 'lever' && !first.repairCatch && !first.keepDropRelease) ? 'lever' :
      (first.repairCatch || first.keepDropRelease) ? 'catch' : first.questActor ? 'actor' : 'other';
    return {
      id, kind, x: first.x, y: first.y || 0, live,
      get o() { return live(); },
      how: kind === 'plate' ? 'stand' : kind === 'lever' ? 'strike' : 'interact',
      done: () => { const o = live(); return kind === 'plate' ? !!o.pressed : kind === 'lever' ? (o.timer > 0 || o.flip > 0) :
        kind === 'catch' ? !!o.struck :
        kind === 'actor' ? !(typeof BFQuestsModule !== 'undefined' && BFQuestsModule.contact(activeQuestProgress(), o.questActor, questProgressionContext()))
          : !!(o.asked || o.done || o.spoken || o.read || o.talked); },
      reach: kind === 'catch' ? { xr: 100, yr: 110 } : kind === 'plate' ? { xr: 20, yr: 12 } : { xr: 60, yr: 90 },
    };
  });

  // Route to an activator with the full multi-segment driver, then operate it.
  function visitAndActivate(act, allowBlood) {
    const near = () => Math.abs(G.p.x - act.x) <= act.reach.xr && Math.abs((G.p.y || 0) - act.y) <= act.reach.yr;
    const inputs = [];
    if (!near()) {
      const target = ledgeUnder(act.x, act.y + 6);
      if (!target) return null;
      const res = drive({
        direction: Math.sign(act.x - G.p.x) || baseTravel, seeds: () => [target], done: near, point: () => ({ x: act.x, y: act.y }),
        maxSegments: 80, allowBoundary: false, mechanisms: false, allowBlood, label: 'detour',
      });
      if (!res.ok) return null;
      inputs.push(...res.inputs);
    }
    const press = (input, n) => { for (let i = 0; i < n; i++) { if (!stepFrame(input)) break; inputs.push(input); } };
    const before = act.done();
    if (act.how === 'interact') {
      // Signs and props share floors with residents; close in until Up would
      // address this object rather than whatever else is nearest.
      for (let i = 0; i < 60; i++) {
        const c = typeof outskirtsInteractionCandidate === 'function' ? outskirtsInteractionCandidate() : null;
        if ((c && actId(c) === act.id) || Math.abs(act.x - G.p.x) < 3) break;
        press(act.x > G.p.x ? { right: true } : { left: true }, 1);
      }
      press({ interact: true }, 1); press({}, 4);
    } else if (act.how === 'strike') { press({ attack: true }, 2); press({}, 12); }
    else { press({}, 8); }
    mechanisms.push({ kind: act.kind, id: act.id, x: Math.round(act.x), y: Math.round(act.y), how: act.how, before, after: act.done(), frames: inputs.length });
    if (act.done() === before && !before) return null;
    return inputs;
  }

  // Blocked by a closed door: work the level's mechanisms until it opens.
  function clearDoors(doorsAtStart, allowBlood) {
    const used = [];
    const doorIds = doorsAtStart.map((d) => `${Math.round(d.x)}:${Math.round(d.y)}`);
    const doors = { some: (f) => live().some(f), every: (f) => live().every(f), map: (f) => live().map(f) };
    const live = () => G.obstacles.filter((o) => o.type === 'door' && doorIds.includes(`${Math.round(o.x)}:${Math.round(o.y)}`));
    const ceiling = totalExpansions + Math.round(opt.totalExpansions * 0.35);
    for (let round = 0; round < 6 && doors.some((d) => !doorOpen(d)) && totalExpansions < ceiling; round++) {
      const todo = activators().filter((a) => !a.done())
        .sort((a, b) => (b.o.questActor ? 1 : 0) - (a.o.questActor ? 1 : 0) || Math.abs(a.x - G.p.x) - Math.abs(b.x - G.p.x));
      if (!todo.length) break;
      let any = false;
      for (const act of todo) {
        if (totalExpansions >= ceiling) break;
        tas.saveState('act-start');
        const got = visitAndActivate(act, allowBlood);
        if (got) { used.push(...got); any = true; if (doors.every((d) => doorOpen(d))) break; }
        else tas.restoreState('act-start');
      }
      if (!any) break;
    }
    return doors.every((d) => doorOpen(d)) ? used : null;
  }

  // ---- the driver: chain segments toward a goal, backtracking over ledges ------
  const saveNames = { n: 0 };
  function drive(cfg) {
    const outerTravel = travel, outerBans = transitionBans, outerAllow = allowBoundary;
    travel = cfg.direction; buildMacros(travel); transitionBans = new Map(); allowBoundary = cfg.allowBoundary;
    const tag = 'd' + (saveNames.n++) + '-';
    const winning = [], solved = [], history = [];
    const note = (row) => { if (history.length < 240) history.push(row); };
    let current = standingOn();
    if (!current) { for (let i = 0; i < 60 && !G.p.onGround; i++) stepFrame({}); ledges(); current = standingOn(); }
    if (!current) current = { x: G.p.x, w: 0, y: G.p.y || 0, x0: G.p.x - 20, x1: G.p.x + 20, ref: null, virtual: true };
    const stack = [{ save: tag + 'seg0', ledge: current, inputsBefore: 0 }];
    tas.saveState(tag + 'seg0');
    let failure = null, backtracks = 0, lastTried = null, lastFrom = null;

    while (stack.length && solved.length < cfg.maxSegments) {
      if (totalExpansions >= opt.totalExpansions) { failure = { failedSegment: solved.length, reason: 'expansion budget exhausted', from: lastFrom, tried: lastTried }; break; }
      const top = stack[stack.length - 1];
      tas.restoreState(top.save);
      if (cfg.done()) break;
      rebuildGraph(cfg.seeds);
      const cur = top.ledge;
      const bannedFrom = transitionBans.get(key(cur)) || new Set();
      const dcur = distOf(cur);
      const ranked = neighbours(cur).map((r) => ({ ...r, d: distOf(r.b) })).sort((x, y) => (x.d - y.d) || (x.cost - y.cost));
      // Neighbours the static model says can reach the goal come first; the rest
      // are kept, briefly, because fields and mechanisms are not in the model.
      const cands = [...ranked.filter((r) => r.d < dcur).map((r) => r.b), ...ranked.filter((r) => !(r.d < dcur)).slice(0, 2).map((r) => r.b)].slice(0, opt.maxCandidates);
      if (!cands.length) {
        const fallback = all
          .filter((l) => l !== cur && (front(l) - back(cur)) * travel > 30 && !bannedFrom.has(key(l)) && l.y > cur.y - 700 && !blockedBetween(cur, l))
          .sort((a, b) => (Math.max(0, gapTo(cur, a)) + Math.abs(a.y - cur.y)) - (Math.max(0, gapTo(cur, b)) + Math.abs(b.y - cur.y)))
          .slice(0, 2);
        cands.push(...fallback);
        if (!cands.length) cands.push(null);
      }
      let advanced = null, costed = false, tried = [];
      lastFrom = { x0: cur.x0, x1: cur.x1, y: cur.y }; lastTried = tried;
      if (dcur === 0 && cfg.point) {
        const pt = cfg.point();
        const pseudo = { x: pt.x, w: 40, y: pt.y, x0: pt.x - 20, x1: pt.x + 20, ref: null };
        for (const blood of (cfg.allowBlood ? [true] : [false, true])) {
          tas.restoreState(top.save);
          const res = searchAhead(cur, bannedFrom, blood, pseudo, opt.hopExpansions, cfg.done);
          note({ seg: solved.length, from: Math.round(front(cur)), to: 'point:' + Math.round(pt.x), blood, exp: res.expansions, ok: !!res.ok, bestH: res.bestH });
          if (res.ok) { advanced = res; costed = blood; break; }
          tried.push({ target: 'point', x: Math.round(pt.x), bloodAllowed: blood, expansions: res.expansions, bestH: res.bestH, histogram: res.histogram, sample: res.attempts.slice(-12) });
        }
        if (!advanced) {
          if (stack.length === 1) { failure = { failedSegment: solved.length, reason: 'the goal is on this ledge but could not be reached along it', from: lastFrom, tried }; break; }
          const dead = stack.pop(); backtracks++;
          note({ backtrack: true, banned: key(dead.ledge), seg: solved.length - 1 });
          ban(stack[stack.length - 1].ledge, dead.ledge);
          solved.pop();
          continue;
        }
        winning.length = top.inputsBefore; winning.push(...advanced.inputs);
        solved.push({ seg: solved.length, point: true, to: { x: Math.round(pt.x), y: Math.round(pt.y) }, frames: advanced.inputs.length, expansions: advanced.expansions, costBlood: costed });
        const save = tag + 'seg' + stack.length; tas.saveState(save);
        stack.push({ save, ledge: standingOn() || cur, inputsBefore: winning.length });
        continue;
      }

      // A closed door between here and the goal, with no modelled way round,
      // means the level wants its mechanisms worked first.
      if (cfg.mechanisms && dcur === Infinity) {
        const doors = doorsBetween(cur, goalX);
        if (doors.length) {
          const got = clearDoors(doors, cfg.allowBlood);
          if (got) {
            winning.length = top.inputsBefore; winning.push(...got);
            const here = standingOn() || cur;
            solved.push({ seg: solved.length, mechanism: true, to: { x0: here.x0, x1: here.x1, y: here.y }, frames: got.length, doors: doors.map((d) => ({ x: d.x, circuit: d.circuit ?? null })) });
            const save = tag + 'seg' + stack.length; tas.saveState(save);
            stack.push({ save, ledge: here, inputsBefore: winning.length });
            continue;
          }
          tried.push({ target: 'door', doors: doors.map((d) => ({ x: d.x, circuit: d.circuit ?? null })), mechanisms: mechanisms.slice(-8) });
        }
      }

      const passes = [
        { budget: Math.round(opt.hopExpansions * 0.3), blood: false, keep: cands.length },
        { budget: opt.hopExpansions, blood: false, keep: 2 },
        { budget: Math.round(opt.hopExpansions * 0.7), blood: true, keep: 1 },
      ];
      let order = cands.slice();
      for (const pass of passes) {
        if (pass.blood && cfg.allowBlood) break;
        const scored = [];
        for (const cand of order.slice(0, pass.keep)) {
          tas.restoreState(top.save);
          const res = searchAhead(cur, bannedFrom, pass.blood || cfg.allowBlood, cand, pass.budget);
          note({ seg: solved.length, from: Math.round(front(cur)), to: cand ? Math.round(back(cand)) + ':' + Math.round(cand.y) : 'goal', blood: pass.blood, exp: res.expansions, ok: !!res.ok, bestH: res.bestH });
          if (res.ok) { advanced = res; costed = pass.blood; break; }
          scored.push({ cand, bestH: res.bestH });
          tried.push({ target: cand ? { x0: cand.x0, x1: cand.x1, y: cand.y } : 'goal', bloodAllowed: pass.blood, budget: pass.budget, expansions: res.expansions, bestH: res.bestH, histogram: res.histogram, sample: res.attempts.slice(-12) });
        }
        if (advanced) break;
        order = scored.sort((a, b) => a.bestH - b.bestH).map((r) => r.cand);
        if (!order.length) break;
      }

      if (!advanced) {
        if (stack.length === 1) { failure = { failedSegment: solved.length, reason: 'every hop from the current ledge failed', from: lastFrom, tried }; break; }
        const dead = stack.pop(); backtracks++;
        note({ backtrack: true, banned: key(dead.ledge), seg: solved.length - 1 });
        ban(stack[stack.length - 1].ledge, dead.ledge);
        solved.pop();
        continue;
      }
      winning.length = top.inputsBefore;
      winning.push(...advanced.inputs);
      solved.push({ seg: solved.length, from: { x0: cur.x0, x1: cur.x1, y: cur.y }, to: { x0: advanced.ledge.x0, x1: advanced.ledge.x1, y: advanced.ledge.y }, frames: advanced.inputs.length, expansions: advanced.expansions, depth: advanced.depth, costBlood: costed, dFrom: advanced.dFrom, dTo: advanced.dTo, via: advanced.via, x: Math.round(G.p.x), y: Math.round(G.p.y || 0) });
      const save = tag + 'seg' + stack.length;
      tas.saveState(save);
      stack.push({ save, ledge: advanced.ledge, inputsBefore: winning.length });
    }
    const ok = cfg.done();
    if (!ok && !failure) failure = { failedSegment: solved.length, reason: stack.length ? 'segment limit reached' : 'no route', from: lastFrom, tried: lastTried };
    travel = outerTravel; buildMacros(travel); transitionBans = outerBans; allowBoundary = outerAllow;
    return { ok, inputs: winning, solved, history, backtracks, failure, label: cfg.label };
  }

  // ---- main drive, then replay to prove the route is real -------------------------
  tas.saveState('bot-origin');
  const main = drive({
    direction: baseTravel, seeds: () => all.filter((l) => (front(l) - goalX) * travel >= 0), done: reachedGoal,
    point: () => ({ x: goalX, y: (standingOn() || { y: G.p.y || 0 }).y }),
    maxSegments: opt.maxSegments, allowBoundary: true, mechanisms: true, allowBlood: opt.allowBloodLoss, label: 'main',
  });
  const reached = tas.getPlayerState();
  tas.restoreState('bot-origin');
  let replayFrames = 0;
  for (const input of main.inputs) { if (!stepFrame(input)) break; replayFrames++; }
  const replay = tas.getPlayerState();
  const replayIdentical = JSON.stringify(reached) === JSON.stringify(replay);

  return {
    pass: reachedGoal() && !G.p.dead,
    direction: baseTravel, goalX, goalKind, crossedBoundary, reachedX: Math.round(replay.x),
    segments: main.solved.length, backtracks: main.backtracks,
    frames: main.inputs.length, replayFrames, expansions: totalExpansions, replayIdentical,
    capabilities: { doubleJump: hasDouble, dash: hasDash, weapon: hasWeapon },
    envelope: { maxRise: Math.round(MAX_RISE), maxReach: Math.round(MAX_REACH) },
    costedSegments: main.solved.filter((r) => r.costBlood).length,
    blood: G.p.blood,
    mechanisms,
    history: main.history,
    ...(main.failure || {}),
    solved: main.solved.slice(0, opt.traceLimit),
    winningInputs: main.inputs,
  };
}

/* Bootstrap helpers: put the harness on a given stage with the constitutional
   capability prefix, without repositioning the knight. */
export function bootstrapStage(stageIndex) {
  const tas = window.__BF.tas;
  // Same TAS-safe entry the Frostfell validator uses: level select hydrates the
  // constitutional capability prefix for this stage, and the knight is left at
  // the authored spawn rather than being repositioned.
  tasPrepareRun();
  tasDeterministicCall(() => beginRun(0, null, { hp: 1, dmg: 1 },
    { startStage: stageIndex, levelSelect: true, testRun: true, runSeed: 0xB07 }));
  for (let i = 0; i < 90 && !G.p.onGround; i++) tas.stepFrames(1, {});
  tas.stepFrames(2, {});
  return {
    stage: G.stageIndex, levelLength: G.levelLength,
    // Level select hydrates the prefix into the active (session) store, not meta.
    capabilities: [...((activeCapabilityProgress() && activeCapabilityProgress().acquired) || [])],
    p: tas.getPlayerState(),
  };
}
