#!/usr/bin/env node
/* NECESSITY AUDIT — "can the player SKIP this?"
 *
 * Every other check in this repo asks whether authored geometry can be REACHED. None of
 * them asked whether it can be AVOIDED, and that is the whole difference between a road
 * and decoration beside a road. The Citadel shipped eight seams, a cling tower, five
 * spent ledges, a plate and a slam pocket, and a floor-walk from the east gate to the
 * arena skipped every one of them — because the level had exactly two holes in its floor
 * in seventeen thousand units.
 *
 * The model is deliberately GENEROUS to the player: anything it says is skippable really
 * is skippable, because it only ever grants moves the kit provably has. Measured reach is
 * 671 flat, 726 off a 210 drop, 774 off a 400 drop; apex is +148 and a single jump is
 * +82. If a route exists under those numbers, a player can walk it.
 *
 *   node scripts/necessity-audit.mjs [stage...]      (default: 11 12 13)
 */
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const SRC = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');

/* ── the kit, measured, never guessed ───────────────────────────────────────── */
export const KIT = {
  reachFlat: 671,      // run + double jump + air dash, landing at the same height
  reachDrop: 774,      // the same, landing 400 lower
  apex: 148,           // the top of a double jump above the takeoff
  singleJump: 82,
};
// A horizontal gap is crossable if the landing is not too high and the span fits the
// reach for that height change. Dropping buys distance; climbing spends it.
export function canCross(gap, dy){
  if(dy > KIT.apex) return false;                 // cannot land above the apex
  if(dy >= 0) return gap <= KIT.reachFlat * (1 - dy / (KIT.apex * 2.2));
  return gap <= Math.min(KIT.reachDrop, KIT.reachFlat + (-dy) * 0.26);
}

/* ── loading an authored level out of index.html ────────────────────────────── */
/* The constructor list is DERIVED, not hand-kept. A hardcoded list is the same
   brittleness this whole script exists to catch: it silently goes stale the moment a
   level uses a helper nobody remembered to add, and the audit dies instead of
   reporting. Scan the level body for every `Name(` and pull in any that is a top-level
   function in index.html, following their own dependencies transitively. */
function ctorsFor(body){
  const wanted = new Set(), out = [];
  const scan = src => { for(const m of src.matchAll(/\b([A-Z][A-Za-z0-9_]*)\s*\(/g)) wanted.add(m[1]); };
  scan(body);
  const done = new Set();
  while(true){
    const next = [...wanted].find(n => !done.has(n));
    if(!next) break;
    done.add(next);
    const fn = fnFrom(next);
    if(fn){ out.push(fn); scan(fn); }
  }
  return out;
}

function fnFrom(name){
  const start = SRC.indexOf('function ' + name + '(');
  if(start < 0) return '';
  const brace = SRC.indexOf('{', start); let depth = 0;
  for(let i = brace; i < SRC.length; i++){
    if(SRC[i] === '{') depth++;
    else if(SRC[i] === '}' && --depth === 0) return SRC.slice(start, i + 1);
  }
  return '';
}
const STAGES = {
  11: { name:'The Inversion',   decl:'const INVERSION_LEVEL=',   end:'\nconst VOID_TYRANT_LEVEL=' },
  12: { name:'Paradox Citadel', decl:'const VOID_TYRANT_LEVEL=', end:'\nconst SECRET_LEVEL=' },
  13: { name:'Drowned Throne',  decl:'const ABYSS_KING_LEVEL=',  end:'\nconst CUSTOM_LEVELS=' },
  // Stops at the mirror helper, not at the next level: the RETURN variant and its
  // resolver now sit between SECRET_LEVEL and the White Court.
  15: { name:'Deep Line',       decl:'const SECRET_LEVEL=',       end:'\nfunction mirrorDeepLine' },
};
export function loadLevel(stage){
  const spec = STAGES[stage];
  const start = SRC.indexOf(spec.decl);
  const end = SRC.indexOf(spec.end, start);
  if(start < 0 || end < 0) throw Error('cannot find stage ' + stage);
  // Constants the level bodies close over. A slice can run right up to the NEXT level's
  // arena constant, so anything the slice already declares must not be declared again —
  // that is an "Identifier has already been declared" and it takes the whole audit down.
  const body = SRC.slice(start, end);
  // Same principle as the constructors: DERIVE the constants the body closes over
  // rather than listing them. Anything SHOUT_CASE the body mentions and does not itself
  // declare gets pulled from index.html, transitively.
  const helpers = ctorsFor(body);
  /*   COMMENTS ARE NOT CODE. The SHOUT_CASE sweep below used to run over comments too,
     so a sentence like "OREN'S POST POWERS THE ZIP-LINE" requested a constant named
     POWERS, found an unrelated multi-line `const POWERS={` elsewhere in index.html, and
     emitted `const POWERS={;` — a syntax error that took the whole audit down. The level
     cannot close over a word in a comment; strip them before looking for identifiers. */
  const stripComments = (t) => t.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:'"\\])\/\/[^\n]*/g, '$1');
  const scanSrc = stripComments(body) + '\n' + helpers.map(stripComments).join('\n');
  const consts = (() => {
    const want = new Set(), lines = [];
    for(const m of scanSrc.matchAll(/\b([A-Z][A-Z0-9_]{2,})\b/g)) want.add(m[1]);
    const done = new Set();
    while(true){
      const n = [...want].find(k => !done.has(k));
      if(!n) break;
      done.add(n);
      if(new RegExp('const\\s+' + n + '\\s*=').test(body)) continue;   // the body owns it
      /* Siblings on one line (`const A=1,B=2;`) are not preceded by `const`, so match
         either form — but an ARRAY value contains commas, and a comma-terminated capture
         turns `const PATH_LANE=[40,454,868]` into `const PATH_LANE=[40;`, which is a
         syntax error that takes the whole audit down. Try the bracketed form first. */
      const m = new RegExp('(?:const\\s+|,)' + n + '\\s*=\\s*(\\[[^\\]]*\\])').exec(SRC)
        || new RegExp('(?:const\\s+|,)' + n + '\\s*=\\s*([^;,\\n]+)').exec(SRC);
      if(!m) continue;
      lines.push(`const ${n}=${m[1].replace(/\/\/.*$/, '').trim().replace(/,$/, '')};`);
      for(const d of m[1].matchAll(/\b([A-Z][A-Z0-9_]{2,})\b/g)) want.add(d[1]);
    }
    return lines.join('\n');
  })();
  const prelude = 'const G={};\n' + consts + '\n' + helpers.join('\n') + '\n';
  // The NEWLINE matters: a slice can end on a trailing `// comment` line, and without
  // it the appended expression is swallowed and the level comes back undefined.
  return vm.runInNewContext(prelude + body + '\n;' + spec.decl.replace('const ','').replace('=',''),
    { Math, Object });
}

/* ── the traversal model ────────────────────────────────────────────────────── */
const span = o => ({ left: o.x - (o.w || 0) / 2, right: o.x + (o.w || 0) / 2 });

/* Surfaces you can stand on. A seam is NOT a surface — it is an edge, added separately,
   because the entire question is whether the road needs it. */
function surfaces(level){
  return (level.objects || [])
    .filter(o => o && o.type === 'plat' && !o.gone)
    .map((o, i) => ({ id:i, y:o.y || 0, ...span(o), obj:o }));
}
function edges(level, surfs, opts = {}){
  const out = [];
  const allow = opts.allow || (() => true);
  for(const a of surfs) for(const b of surfs){
    if(a === b) continue;
    if(!allow(a.obj) || !allow(b.obj)) continue;
    // overlapping surfaces at reachable height: step up or drop down
    const overlap = a.right > b.left && b.right > a.left;
    const dy = b.y - a.y;
    if(overlap){ if(dy <= KIT.apex) out.push([a.id, b.id, 'step']); continue; }
    const gap = b.left > a.right ? b.left - a.right : a.left - b.right;
    if(canCross(gap, dy)) out.push([a.id, b.id, 'jump']);
  }
  // seams are rides between their two ends, landing on whatever surface holds each end
  if(opts.withSeams !== false){
    for(const s of (level.objects || []).filter(o => o && o.type === 'seam')){
      if(!allow(s)) continue;
      const at = (x, y) => surfs.filter(f => x >= f.left - 60 && x <= f.right + 60 && Math.abs(f.y - y) <= 90);
      /*   AN END WITH NOTHING UNDER IT IS STILL AN END. A seam you JUMP for (and dash
         off the far end of) hangs in mid-air by design; requiring a surface under each
         end made the audit call a real route "broken" and would have made it blind to a
         real skip. So: an end is BOARDED from any surface that holds it or from which the
         kit can reach it (the board is a dash that passes within 46 of the end), and a
         ride EXITS onto any surface that holds the far end or that the kit can fall or
         jump to from there. Same conservative KIT as every other edge. */
      const MOUTH = 46;
      const gapTo = (f, x) => x < f.left ? f.left - x : x > f.right ? x - f.right : 0;
      const boardFrom = (x, y) => surfs.filter(f => at(x, y).includes(f) ||
        canCross(Math.max(0, gapTo(f, x) - MOUTH), y - f.y));
      const exitTo = (x, y) => surfs.filter(f => at(x, y).includes(f) || canCross(gapTo(f, x), f.y - y));
      for(const [ex, ey, fx, fy] of [[s.ax, s.ay, s.bx, s.by], [s.bx, s.by, s.ax, s.ay]])
        for(const a of boardFrom(ex, ey)) for(const b of exitTo(fx, fy))
          if(a !== b) out.push([a.id, b.id, 'seam']);
    }
  }
  /* A clingable wall is a LADDER ON THAT WALL — not a general-purpose link between
     everything near it. The first version said "any two surfaces within 300 of the
     wall, within its height + apex", which on a 1,150-tall face connected essentially
     the whole room and made every object look individually removable. You have to be
     beside the face to take it, and you cannot arrive above its top. */
  for(const w of (level.objects || []).filter(o => o && o.type === 'wall' && o.clingSurface && !o.gone)){
    if(!allow(w)) continue;
    const top = w.y || 0, base = top - (w.h || 0);
    // 300, to match the engine: wallJumpHorizontalVelocity is 350, so a shelf within
    // ~300 of a face you can ladder is a place the kick reaches. 130 was my own
    // invention and it cut the road at the first rung by five units.
    const beside = surfs.filter(f => f.right >= w.x - 300 && f.left <= w.x + 300);
    for(const a of beside) for(const b of beside){
      if(a === b) continue;
      if(a.y < base - KIT.apex) continue;          // cannot reach the face from here
      if(b.y > top + KIT.apex) continue;           // cannot arrive above its head + a jump
      // NO "climb no more than the wall is tall" rule: you ladder to the TOP of the
      // face and jump from there, so a 360 wall legitimately puts you on a 430 shelf.
      // That invented cap broke the model's route and made the level look at fault.
      out.push([a.id, b.id, 'cling']);
    }
  }
  return out;
}
function reaches(surfs, edgeList, fromX, toX){
  const start = surfs.filter(s => fromX >= s.left - 80 && fromX <= s.right + 80).map(s => s.id);
  // Same reasoning for the goal itself: a surface far below the boss is not the boss.
  const goal = new Set(surfs.filter(s => toX >= s.left - 120 && toX <= s.right + 120 &&
    Math.abs(s.y) <= 200).map(s => s.id));
  if(!start.length || !goal.size) return null;                 // cannot judge
  const adj = new Map();
  for(const [a, b] of edgeList){ if(!adj.has(a)) adj.set(a, []); adj.get(a).push(b); }
  const seen = new Set(start); const q = [...start];
  while(q.length){
    const n = q.shift();
    if(goal.has(n)) return true;
    for(const m of adj.get(n) || []) if(!seen.has(m)){ seen.add(m); q.push(m); }
  }
  return false;
}

/* ── standing room ───────────────────────────────────────────────────────────
   "Is there floor under this?" — the check that was never run for stages 12 and 13.
   The idiom already existed (tests/white-court-v4-stage.test.mjs defines a `supports`
   helper); it was simply never written for the late game, and then large voids were
   carved into both levels while every enemy, checkpoint and plate kept its old
   coordinate. Eight entities ended up standing on nothing. Two of them were CHECKPOINTS,
   which is not cosmetic: a flag with no surface can only be touched while falling, and
   once armed it respawns you into the hole it hangs in — the out-of-bounds penalty fires
   and rewinds you to it again, forever. */
/* The muster roster for a stage, read out of index.html's own table so the audit and the
   game cannot drift apart. Keyed by ZONE id, which is what the roster table uses. */
const ZONE_OF_STAGE = { 0:'outskirts', 1:'black-woods', 2:'brute', 3:'updrafts',
  4:'hollow-marksman', 5:'ruined-keep', 6:'warden', 7:'frostfell', 8:'frost-sorcerer',
  9:'emberdeep', 10:'ember-colossus', 11:'inversion', 12:'void-tyrant', 13:'abyss-king' };
export function musterRosterFor(stage){
  const zone = ZONE_OF_STAGE[stage];
  if(!zone) return [];
  const table = /const MUSTER_ROSTERS=Object\.freeze\(\{([\s\S]*?)\n\}\);/.exec(SRC);
  if(!table) return [];
  const block = new RegExp("\\n  '?" + zone + "'?:\\[([\\s\\S]*?)\\n  \\]").exec(table[1]);
  if(!block) return [];
  const rows = [];
  for(const m of block[1].matchAll(/\['([a-z]+)',\s*(-?\d+),\s*(-?\d+)/g))
    rows.push([m[1], Number(m[2]), Number(m[3])]);
  return rows;
}
export function standingRoom(stage){
  const level = loadLevel(stage);
  const objs = level.objects || [];
  const surfaces = objs.filter(o => o && o.type === 'plat' && !o.gone)
    .map(o => ({ left:o.x - (o.w || 0) / 2, right:o.x + (o.w || 0) / 2, y:o.y || 0, gated:!!o.gate }));
  // A body is supported if some surface spans its x at (or just under) its own y.
  const supported = (x, y) => surfaces.some(s =>
    x >= s.left - 10 && x <= s.right + 10 && Math.abs((y || 0) - s.y) <= 24);
  const floating = [];
  const check = (kind, x, y, label, flies) => {
    if(flies) return;
    if(!supported(x, y)) floating.push({ kind, x:Math.round(x), y:Math.round(y || 0), label });
  };
  // Flying archetypes legitimately hang in the air; everything else needs a surface.
  const FLYERS = new Set(['voidbat', 'gargoyle', 'stormmote', 'shadeling', 'moth', 'wisp']);
  for(const o of objs){
    if(!o) continue;
    if(o.type === 'check') check('checkpoint', o.x, o.y, 'Check', false);
    else if(o.type === 'plate') check('plate', o.x, o.y, o.id || 'plate', false);
  }
  for(const e of level.enemies || [])
    check('enemy', e.x, e.y || 0, e.t, FLYERS.has(e.t));
  /*   A LEVEL HAS TWO SOURCES OF ENEMIES AND THIS ONLY EVER CHECKED ONE. The muster bell
     installs a whole roster into a zone from MUSTER_ROSTERS, authored in its own table —
     so after voids were cut into the Citadel, three crownguards from its roster hung in
     mid-air while this sweep reported the level clean, because they are not in the
     level's own `enemies` array. Checking one source and calling it "every body" is the
     failure that produced the owner's "this enemy guy is hanging out in the middle of
     nowhere", twice, after the check supposedly existed. */
  for(const [type, x, y] of musterRosterFor(stage)){
    if(type === 'standard') continue;                  // a banner prop, not a body
    check('muster', x, y || 0, type, FLYERS.has(type));
  }
  for(const n of level.npcs || []) check('npc', n.x, n.y || 0, n.profileId || n.kind, false);
  return { stage, name:STAGES[stage].name, floating };
}

/* ── the audit ──────────────────────────────────────────────────────────────── */
export function audit(stage){
  const level = loadLevel(stage);
  /* A CART LEVEL IS NOT WALKED, SO THIS MODEL CANNOT JUDGE IT — and saying so is the
     point. The Deep Line's road is the rail: the cart carries you, gaps are launches
     rather than jumps, and "could the player have walked past this" is a question with
     no meaning there. Forcing an answer would produce a confident wrong one in whichever
     direction the defaults point, which is the failure that cost this audit two passes.
     The necessity of a cart level's content is a different measurement and it is not
     built; until it is, this reports honestly rather than silently. */
  if(level.cart){
    return { stage, name:STAGES[stage].name, len:level.len, cart:true, model:'not-applicable',
      reason:'cart level: the rail is the road, so walking necessity does not apply',
      floorOnlyRouteExists:false, baselineReachable:true,
      counts:{ candidates:0, skippable:0, required:0, gated:0, skippableChallenges:0 },
      counts2:{ sections:0, skippableSections:0 },
      skippableSections:[], requiredSections:[], skippableChallenges:[],
      skippable:[], required:[], gates:[] };
  }
  const spawnX = level.spawnX ?? 240;
  // The destination is the boss where there is one, and otherwise the far gate — the
  // end of the road OPPOSITE the spawn, since these regions are walked in both
  // directions depending on how the world graph enters them.
  const bossX = level.bossX ?? (spawnX > level.len / 2 ? 120 : level.len - 120);
  /* THE ARENA FLOOR IS PUSHED AT RUNTIME (installParadoxFloor / setupKingBoss), across
     roughly bossX-1350 .. bossX+350, and nothing authored stands inside that band. It
     has to be modelled or the boss is unreachable on paper and the audit reports every
     object in the level as load-bearing — the exact mirror of the bug it exists to find.
     Both mistakes came from treating "I cannot judge this" as an answer. */
  const surfs = surfaces(level);
  // ...AND AT HIS OWN HEIGHT. A sub-area authored under the arena (the Throne's beach
  // sits at y -900 and spans his x) otherwise satisfies this test, so the audit skips
  // the arena stand-in and then resolves the GOAL to a surface the boss is nowhere
  // near — nine hundred units below him, reachable by nothing.
  if(!surfs.some(s => bossX >= s.left && bossX <= s.right && Math.abs(s.y) <= 24)){
    surfs.push({ id:-1, y:0, left:bossX - 1350, right:bossX + 350,
      obj:{ type:'plat', deep:true, x:bossX - 500, w:1700, y:0, _arenaFloor:true } });
  }

  // 1. THE HEADLINE. If a route exists using ONLY deep ground — no authored platform,
  //    no seam, no wall — then every authored challenge in the level is decoration.
  const deeps = surfs.filter(s => s.obj.deep);
  const floorOnly = reaches(deeps, edges(level, deeps, { withSeams:false }), spawnX, bossX);

  // 2. PER-OBJECT. Remove one authored thing and ask whether the boss is still reachable
  //    without it. Doors/plates/gates are excluded: they are circuits, not geometry, and
  //    this model does not simulate them — they are reported separately.
  const full = edges(level, surfs);
  const baseline = reaches(surfs, full, spawnX, bossX);
  /* When the route does not exist the audit must say WHERE, or every object reads as
     load-bearing and the report is worse than useless — that mistake cost two passes. */
  let frontier = null;
  if(baseline === false){
    const adj = new Map();
    for(const [a, b] of full){ if(!adj.has(a)) adj.set(a, []); adj.get(a).push(b); }
    const start = surfs.filter(s => spawnX >= s.left - 80 && spawnX <= s.right + 80).map(s => s.id);
    const seen = new Set(start), q = [...start];
    while(q.length){ const n = q.shift(); for(const m of adj.get(n) || []) if(!seen.has(m)){ seen.add(m); q.push(m); } }
    const reached = surfs.filter(s => seen.has(s.id));
    const heading = spawnX > bossX ? -1 : 1;
    const edge = reached.reduce((a, b) => (heading < 0 ? b.left < a.left : b.right > a.right) ? b : a);
    const missed = surfs.filter(s => !seen.has(s.id))
      .sort((a, b) => heading < 0 ? b.left - a.left : a.right - b.right).slice(0, 5);
    frontier = { reachedTo:{ left:Math.round(edge.left), right:Math.round(edge.right), y:edge.y },
      nextUnreached: missed.map(s => ({ left:Math.round(s.left), right:Math.round(s.right), y:s.y })) };
  }
  const skippable = [], required = [], gates = [];
  const candidates = (level.objects || []).filter(o => o &&
    (o.type === 'seam' || (o.type === 'plat' && !o.deep) || (o.type === 'wall' && o.clingSurface)));
  for(const o of candidates){
    /* Circuits and PORTAL SURFACES are exempt. A slate face is not traversal geometry —
       it is somewhere to put a mouth, and what makes it mandatory is the boss fight,
       which this model does not simulate. Judging it by "can I walk past it" would
       always say yes and would be answering the wrong question. */
    if(o.gate || o.circuit || o.slate || o.tyrantFace){ gates.push(o); continue; }
    const kept = surfs.filter(s => s.obj !== o);
    const still = reaches(kept, edges(level, kept, { allow: x => x !== o }), spawnX, bossX);
    if(still === null) throw Error('necessity audit cannot judge a route without ' + (o.type||'object') +
      ' at ' + Math.round(o.x) + " — the model is wrong, not the level");
    (still === false ? required : skippable).push(o);
  }
  /* THE INVARIANT. A beat tagged teach/test/twist is a CHALLENGE — the level claiming
     it asks the player for something. If such a thing can be removed and the boss is
     still reachable, the level does not actually ask. 'recovery' and 'reward' beats are
     allowed to be skippable: a checkpoint ledge or a lore stone beside the road is
     furniture on purpose. This is "every section mandatory or cut", as an assertion. */
  const beatOf = o => o.elementalActBeat || o.tyrantActBeat || o.kingActBeat ||
    o.inversionActBeat || o.finaleActBeat || o.beat || null;
  const systemOf = o => o.elementalActSystem || o.system || null;
  const CHALLENGE = new Set(['teach','test','twist']);

  /* THE RIGHT GRANULARITY IS THE SECTION, NOT THE OBJECT. A climbing chain has
     redundancy on purpose — pull one rung of seven and the other six still make a
     route, so a per-object test calls every rung optional and says nothing useful.
     What the rule actually means is: can the player get past THIS SECTION without
     doing it? So each authored system is removed WHOLE and the route re-tested. */
  const systems = new Map();
  for(const o of candidates){
    const sys = systemOf(o);
    if(!sys || !CHALLENGE.has(beatOf(o))) continue;
    // SLATE ONLY. A gated PLATFORM is still road — Oren's planks are the one crossing
    // of the void and are circuit-gated, so excluding them here emptied the section
    // and reported the only mandatory crossing in the level as bypassable.
    // Portal surfaces and CIRCUIT hardware are both exempt: a plate, a door and a
    // door seal are made mandatory by their circuit, not by geometry, and asking
    // "can I walk past this plate" answers the wrong question. A section left with
    // no traversal geometry at all is a circuit puzzle and is not reported here.
    if(o.slate || o.tyrantFace) continue;
    if(o.type === 'plate' || o.type === 'door' || o.doorSeal || o.circuit) continue;
    if(!systems.has(sys)) systems.set(sys, []);
    systems.get(sys).push(o);
  }
  const skippableSections = [], requiredSections = [];
  for(const [sys, objs] of systems){
    const drop = new Set(objs);
    const kept = surfs.filter(x => !drop.has(x.obj));
    const still = reaches(kept, edges(level, kept, { allow: x => !drop.has(x) }), spawnX, bossX);
    (still === false ? requiredSections : skippableSections).push({ system:sys, objects:objs.length });
  }
  const skippableChallenges = skippable.filter(o => CHALLENGE.has(beatOf(o)));
  return { stage, name:STAGES[stage].name, len:level.len, spawnX, bossX,
    floorOnlyRouteExists:floorOnly, baselineReachable:baseline, frontier,
    counts:{ candidates:candidates.length, skippable:skippable.length,
             required:required.length, gated:gates.length,
             skippableChallenges:skippableChallenges.length },
    counts2:{ sections:systems.size, skippableSections:skippableSections.length },
    beatOf, systemOf, skippableSections, requiredSections,
    skippableChallenges, skippable, required, gates };
}

function label(o){
  const k = o.type === 'seam' ? `seam ${Math.round(o.ax)},${Math.round(o.ay)}->${Math.round(o.bx)},${Math.round(o.by)}`
    : `${o.type} x=${Math.round(o.x)} y=${Math.round(o.y || 0)}`;
  const tags = [o.spentLedge && 'spent', o.brittle && 'brittle', o.slate && 'slate',
    o.period && 'timed', o.clingSurface && 'cling'].filter(Boolean);
  return k + (tags.length ? ` [${tags.join(',')}]` : '');
}

const isCLI = process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop());
if(isCLI){
const stages = process.argv.slice(2).filter(a => /^\d+$/.test(a)).map(Number).length
  ? process.argv.slice(2).filter(a => /^\d+$/.test(a)).map(Number) : [11, 12, 13];
let bad = 0;
for(const s of stages){
  const r = audit(s);
  console.log(`\n═══ stage ${r.stage} · ${r.name} · ${r.len} units ═══`);
  const sr = standingRoom(s);
  if(sr.floating.length){
    console.log(`  STANDING ON NOTHING: ${sr.floating.length}`);
    for(const f of sr.floating) console.log(`    ! ${f.kind} ${f.label} at ${f.x},${f.y}`);
  } else console.log('  standing room: every body has a surface under it');
  if(r.model === 'not-applicable'){ console.log('  ' + r.reason.toUpperCase()); continue; }
  console.log(`  spawn ${r.spawnX} → boss ${r.bossX}`);
  console.log(`  FLOOR-ONLY ROUTE TO THE BOSS: ${r.floorOnlyRouteExists ? 'YES — every authored challenge is optional' : 'no'}`);
  if(r.frontier){ console.log('  ROUTE BROKEN. reached as far as', JSON.stringify(r.frontier.reachedTo));
    console.log('    next unreached:', JSON.stringify(r.frontier.nextUnreached)); }
  console.log(`  authored geometry: ${r.counts.candidates}  ·  required ${r.counts.required}  ·  SKIPPABLE ${r.counts.skippable}  ·  circuit-gated ${r.counts.gated}`);
  console.log(`  challenge SECTIONS: ${r.counts2.sections}  ·  SKIPPABLE ${r.counts2.skippableSections}`);
  for(const x of r.skippableSections) console.log(`    ✗ "${x.system}" (${x.objects} objects) can be bypassed entirely`);
  for(const x of r.requiredSections)  console.log(`    ✓ "${x.system}" (${x.objects} objects) is the road`);
  if(r.floorOnlyRouteExists) bad++;
  if(r.skippable.length){
    console.log('  skippable:');
    for(const o of r.skippable) console.log('    · ' + label(o));
  }
  if(r.required.length){
    console.log('  load-bearing:');
    for(const o of r.required) console.log('    · ' + label(o));
  }
}
if(process.argv.includes('--strict') && bad) process.exit(1);
}
