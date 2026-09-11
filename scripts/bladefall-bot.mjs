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
    goalX: null,          // default: the far end of the level
    restoreFrom: null,    // optional save name to start from
    maxSegments: 120,
    maxCandidates: 4,     // how many next-ledges to try before declaring failure
    allowBloodLoss: false,
    traceLimit: 400,
  }, options || {});

  // ---- movement envelope, read from the runtime rather than guessed ----------
  const tuning = (window.__BF.movementState && window.__BF.movementState().profile.tuning) || {};
  const RUN = tuning.runSpeed || 200;
  const JUMP = tuning.jumpVelocity || 480;
  const GRAV = tuning.gravity || 1400;
  const apex = (JUMP * JUMP) / (2 * GRAV);              // ~82 at stock tuning
  const can = (id) => { try { return hasCapability(id); } catch (_) { return false; } };
  const hasDouble = can('double-jump'), hasDash = can('dash');
  // Generous envelope: geometry only proposes, the simulation disposes.
  const MAX_RISE = apex * (hasDouble ? 2.35 : 1.15) + 40;
  const MAX_REACH = RUN * (2 * JUMP / GRAV) * (hasDouble ? 2.4 : 1.5) + (hasDash ? 240 : 0) + 90;

  // ---- geometry ------------------------------------------------------------
  function ledges() {
    return G.obstacles
      .filter((o) => o.type === 'plat' && !o.ceiling && !o.gone && !o.fake && !o.invisible && (o.y || 0) >= 0)
      .map((o) => ({ x: o.x, w: o.w, y: o.y || 0, x0: o.x - o.w / 2, x1: o.x + o.w / 2, ref: o }))
      .sort((a, b) => a.x0 - b.x0 || a.y - b.y);
    }
  function hazardsBetween(ax, bx) {
    const lo = Math.min(ax, bx) - 60, hi = Math.max(ax, bx) + 60;
    return G.obstacles.filter((o) => !o.gone && (o.type === 'spikes' || o.type === 'trap') && o.x > lo && o.x < hi).length;
  }
  function standingOn(all) {
    const p = G.p;
    let best = null;
    for (const l of all) {
      if (p.x < l.x0 - 8 || p.x > l.x1 + 8) continue;
      if (Math.abs((p.y || 0) - l.y) > 6) continue;
      if (!best || l.y > best.y) best = l;
    }
    return best;
  }

  // ---- heuristic steering --------------------------------------------------
  // Proportional control with a velocity lookahead, the same idea the Frostfell
  // solver used, but with the dead zone scaled to current speed so the knight
  // does not oscillate on ice.
  function steer(targetX) {
    const p = G.p, lead = p.vx * 0.13, err = targetX - p.x - lead;
    const dead = 3 + Math.min(6, Math.abs(p.vx) * 0.02);
    return { right: err > dead, left: err < -dead };
  }

  // ---- one hop, with branching search --------------------------------------
  // A live threat is any body that can cost Blood on contact, whether or not it
  // has noticed the knight yet.
  function threatAhead(dir, reach) {
    const p = G.p;
    return G.enemies.some((e) => !e.dead && Math.abs((e.y || 0) - (p.y || 0)) < 90 &&
      (e.x - p.x) * dir > -20 && Math.abs(e.x - p.x) < (reach || 150));
  }

  function solveHop(from, to, budget, allowBlood) {
    const forward = to.x0 >= from.x0 ? 1 : -1;
    // Aim just inside the landing so a slight overshoot still lands.
    const aim = forward > 0 ? Math.min(to.x1 - 12, to.x + to.w / 2 - 12) : Math.max(to.x0 + 12, to.x - to.w / 2 + 12);
    const rise = to.y - from.y;
    const flat = Math.abs(rise) < 4 && from.x1 >= to.x0 - 2 && from.x0 <= to.x1 + 2;

    // Plans are ordered cheapest-first and the search stops at the first landing,
    // so the expensive combinations only cost anything on a hop that is genuinely
    // hard. `delay` idles on the launch ledge, which is what clears a patrolling
    // body or a timed hazard; `evade` hops over one that closes in on the walk.
    const plans = [];
    for (const delay of [0, 'clear', 96, 210]) {
     for (const evadeAt of [60, 90, 130]) {
      if (flat) plans.push({ kind: 'walk', delay, evadeAt });
      for (const inset of [26, 54, 10, 84, 120]) {
        for (const hold of [16, 10, 22, 6]) {
          plans.push({ kind: 'jump', inset, hold, delay, evadeAt });
          if (hasDouble) for (const at of [20, 26, 14, 32]) plans.push({ kind: 'double', inset, hold, at, delay, evadeAt });
          if (hasDash) for (const dashAt of [2, 8]) plans.push({ kind: 'dash', inset, hold, dashAt, delay, evadeAt });
        }
      }
     }
    }

    const attempts = [];
    const cap = budget || 900;
    for (const plan of plans) {
      if (attempts.length >= cap) break;
      tas.restoreState('hop-start');
      const blood0 = G.p.blood, seq = [];
      const step = (input) => { tas.stepFrames(1, input); seq.push(input); };
      // Edge-triggered hop: press for a few frames, then force a release so the
      // following press registers as a new one.
      let pressT = 0, releaseT = 0, lastX = G.p.x, stuck = 0;
      const wantHop = (dir) => {
        // No horizontal progress while grounded means something is in the way -
        // a body, a step, or a doorway. All three are answered by a hop.
        if (G.p.onGround && Math.abs(G.p.x - lastX) < 0.8) stuck++; else stuck = 0;
        lastX = G.p.x;
        return (G.p.onGround && threatAhead(dir, plan.evadeAt)) || stuck >= 6;
      };
      const evadeJump = (dir) => {
        const want = wantHop(dir);
        if (pressT > 0) { pressT--; return true; }
        if (releaseT > 0) { releaseT--; return false; }
        if (want) { pressT = 13; releaseT = 3; stuck = 0; return true; }
        return false;
      };
      let bailed = false;
      const bail = () => {
        if (G.p.dead) return 'died';
        if (!allowBlood && G.p.blood < blood0) return 'blood';
        return null;
      };

      // Idle on the launch ledge. This is the search dimension that turns a
      // patrol or a timed hazard from a wall into a window. `delay === 'clear'`
      // waits for an actual opening instead of guessing a patrol's period.
      if (plan.delay === 'clear') {
        for (let i = 0; i < 420 && threatAhead(forward, 330); i++) {
          step({ jump: evadeJump(forward) });
          if (bail()) { bailed = true; break; }
        }
      } else for (let i = 0; i < (plan.delay || 0); i++) {
        step({ jump: evadeJump(forward) });
        if (bail()) { bailed = true; break; }
      }

      // Walk to the launch point, hopping over anything that closes in.
      if (!bailed && plan.kind !== 'walk') {
        const edge = forward > 0 ? from.x1 - plan.inset : from.x0 + plan.inset;
        const walkBudget = Math.ceil(Math.abs(edge - G.p.x) / (RUN / 60)) + 140;
        for (let i = 0; i < walkBudget && G.p.onGround && Math.abs(G.p.x - edge) > 6; i++) {
          const input = { right: G.p.x < edge, left: G.p.x > edge };
          if (evadeJump(Math.sign(edge - G.p.x) || forward)) input.jump = true;
          step(input);
          if (bail()) { bailed = true; break; }
        }
      }

      let landed = false, reason = bailed ? (bail() || 'bailed') : 'timeout';
      const flightBudget = plan.kind === 'walk'
        ? Math.ceil(Math.abs(aim - G.p.x) / (RUN / 60)) + 180
        : 170;
      if (!bailed) for (let i = 0; i < flightBudget; i++) {
        const input = steer(aim);
        if (plan.kind === 'walk') {
          if (evadeJump(forward)) input.jump = true;
        } else {
          if (i < plan.hold) input.jump = true;
          else if (G.p.onGround && evadeJump(forward)) input.jump = true;
          if (plan.kind === 'double') {
            if (i >= plan.at && i < plan.at + 18) input.jump = true;
            else if (i >= plan.hold && i < plan.at) input.jump = false;
          }
          if (plan.kind === 'dash' && i >= plan.dashAt && i < plan.dashAt + 3) input.dash = true;
        }
        step(input);
        const why = bail();
        if (why) { reason = why; break; }
        if ((G.p.y || 0) < Math.min(from.y, to.y) - 420) { reason = 'fell'; break; }
        if (i > 4 && G.p.onGround && Math.abs((G.p.y || 0) - to.y) < 1.5 && G.p.x > to.x0 - 6 && G.p.x < to.x1 + 6) {
          landed = true; reason = 'landed'; break;
        }
      }
      attempts.push({ plan: plan.kind, inset: plan.inset ?? null, hold: plan.hold ?? null,
        at: plan.at ?? null, dashAt: plan.dashAt ?? null, delay: plan.delay, evadeAt: plan.evadeAt, reason, frames: seq.length,
        x: Math.round(G.p.x), y: Math.round(G.p.y || 0) });
      if (landed) return { ok: true, inputs: seq, attempts: attempts.length, plan: attempts.at(-1) };
    }
    return { ok: false, attempts };
  }

  // ---- chain segments to the goal ------------------------------------------
  if (opt.restoreFrom) tas.restoreState(opt.restoreFrom);
  const all = ledges();
  const goalX = opt.goalX == null ? G.levelLength - 120 : opt.goalX;
  const winningInputs = [];
  const solved = [];
  let current = standingOn(all);
  if (!current) return { pass: false, reason: 'the knight is not standing on any extractable ledge', p: tas.getPlayerState() };

  tas.saveState('bot-origin');
  for (let seg = 0; seg < opt.maxSegments; seg++) {
    if (G.p.x >= goalX) break;
    // Candidate next ledges: ahead of us, inside the movement envelope, ranked
    // by how much ground they gain without over-reaching.
    const cands = all
      .filter((l) => l !== current && l.x1 > current.x1 + 4)
      .filter((l) => l.x0 - current.x1 <= MAX_REACH && l.y - current.y <= MAX_RISE)
      .filter((l) => l.y > current.y - 700)
      .sort((a, b) => (b.x1 - b.w * 0.001) - (a.x1 - a.w * 0.001))
      .slice(0, opt.maxCandidates * 3)
      .sort((a, b) => {
        const gain = (l) => Math.min(l.x1, goalX) - current.x1;
        const cost = (l) => Math.abs(l.y - current.y) * 0.5 + Math.max(0, l.x0 - current.x1) + hazardsBetween(current.x1, l.x0) * 40;
        return (cost(a) - gain(a)) - (cost(b) - gain(b));
      })
      .slice(0, opt.maxCandidates);

    if (!cands.length) return { pass: false, failedSegment: seg, reason: 'no candidate ledge within the movement envelope',
      from: { x0: current.x0, x1: current.x1, y: current.y }, solved, p: tas.getPlayerState() };

    tas.saveState('hop-start');
    let advanced = null, tried = [], costed = false;
    for (const cand of cands) {
      const res = solveHop(current, cand, 0, opt.allowBloodLoss);
      if (res.ok) { advanced = { cand, res }; break; }
      tried.push({ to: { x0: cand.x0, x1: cand.x1, y: cand.y }, attempts: res.attempts.slice(-6) });
    }
    // A hostile level is not unsolvable just because no route through it is free.
    // Spending Blood is ordinary play, so fall back to it and say so.
    if (!advanced && !opt.allowBloodLoss) for (const cand of cands) {
      const res = solveHop(current, cand, 0, true);
      if (res.ok) { advanced = { cand, res }; costed = true; break; }
      tried.push({ to: { x0: cand.x0, x1: cand.x1, y: cand.y }, bloodAllowed: true, attempts: res.attempts.slice(-6) });
    }
    if (!advanced) {
      tas.restoreState('hop-start');
      return { pass: false, failedSegment: seg, reason: 'every candidate hop failed',
        from: { x0: current.x0, x1: current.x1, y: current.y }, tried, solved, p: tas.getPlayerState() };
    }
    winningInputs.push(...advanced.res.inputs);
    solved.push({ seg, to: { x0: advanced.cand.x0, x1: advanced.cand.x1, y: advanced.cand.y },
      plan: advanced.res.plan, frames: advanced.res.inputs.length, costBlood: costed });
    current = advanced.cand;
  }

  // ---- replay the accumulated inputs to prove the route is real -------------
  const reached = tas.getPlayerState();
  tas.restoreState('bot-origin');
  for (const input of winningInputs) tas.stepFrames(1, input);
  const replay = tas.getPlayerState();
  const replayIdentical = JSON.stringify(reached) === JSON.stringify(replay);

  return {
    pass: G.p.x >= goalX && !G.p.dead,
    goalX, reachedX: Math.round(replay.x), segments: solved.length,
    frames: winningInputs.length, replayIdentical,
    capabilities: { doubleJump: hasDouble, dash: hasDash },
    envelope: { maxRise: Math.round(MAX_RISE), maxReach: Math.round(MAX_REACH) },
    costedSegments: solved.filter((r) => r.costBlood).length,
    solved: solved.slice(0, opt.traceLimit),
    winningInputs,
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
  tas.stepFrames(2, {});
  return {
    stage: G.stageIndex, levelLength: G.levelLength,
    capabilities: (meta.capabilities && meta.capabilities.acquired) || [],
    p: tas.getPlayerState(),
  };
}
