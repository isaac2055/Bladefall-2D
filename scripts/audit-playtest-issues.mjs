/* PLAYTEST ISSUE AUDIT — look for the classes of problem the owner keeps finding by hand.
 *
 * Each check is named after a category in docs/PLAYTEST-ISSUE-TAXONOMY.md, so a finding
 * reads as "this is a known kind of problem", not as a bare coordinate. It measures the
 * real engine: each stage is loaded in headless Chrome with the kit Level Select would give
 * it. It never edits a level. A finding is a lead to look at on screen, not a verdict —
 * several categories are routinely intentional (a one-way drop, a wide optional floor).
 *
 * Usage:
 *   node scripts/audit-playtest-issues.mjs                 (stages 0 and 1)
 *   node scripts/audit-playtest-issues.mjs --stages 0,1,2,5
 *   node scripts/audit-playtest-issues.mjs --stages all    (every campaign stage 0–13, 15)
 *   node scripts/audit-playtest-issues.mjs --json out.json
 */
import { createServer } from 'node:http';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { resolve, extname, join } from 'node:path';
import { launchChrome } from '../tests/launch-chrome.mjs';

const argv = process.argv.slice(2);
const arg = (n, f) => { const i = argv.indexOf('--' + n); return i >= 0 && argv[i + 1] ? argv[i + 1] : f; };
const root = resolve(arg('root', 'public'));
const stagesArg = arg('stages', '0,1');
const stages = stagesArg === 'all' ? [0,1,2,3,4,5,6,7,8,9,10,11,12,13,15] : stagesArg.split(',').map(Number);

/* ---- static checks (source text) ---- */
async function staticFindings(){
  const out = [];
  const files = (await readdir(root)).filter(f => f === 'index.html' || (f.startsWith('bladefall-') && f.endsWith('.js')));
  for(const f of files){
    const lines = (await readFile(join(root, f), 'utf8')).split('\n');
    lines.forEach((line, i) => {
      // V1 · a filled wedge sized by an enemy's notice range is a vision cone (removed 7.231):
      // a line reading noticeRange with a lineTo(...) and fill() within the next four lines.
      if(!/noticeRange/.test(line)) return;
      const near = lines.slice(i, i + 5).join('\n');
      if(/lineTo\([^)]*range/.test(near) && /\.fill\(\)/.test(near))
        out.push({ category:'V1', title:'vision cone drawn', where:`${f}:${i + 1}` });
    });
  }
  return out;
}

/* ---- live checks (in the page) ---- */
const AUDIT = (stage) => {
  const B = window.__BF, out = [];
  B.tas.resetGame();
  const acquired = B.capabilities.abilities
    .filter(a => a.id === 'jump' || ((B.progression.zone(a.unlockZone) || {}).stageIndex < stage)).map(a => a.id);
  B.G.sessionCapabilities = B.capabilities.createState({ acquired });
  B.reloadStage(stage); B.tas.stepFrames(1, {});
  const G = B.G, p = G.p;
  // Reserves appear only after the Muster recall; install them so I1 can see them.
  try{ if(typeof installRecallReturnRoute === 'function') installRecallReturnRoute(B.world.stageId ? B.world.stageId(stage) : BFWorldModule.stageId(stage)); }catch(e){}
  const dj = (p.maxJumps || 1) > 1, dash = acquired.includes('dash');
  const RISE = dj ? 140 : 76, REACH = dj ? 230 : 130;   // measured single / double jump, with margin
  const plats = G.obstacles.filter(o => o.type === 'plat' && !o.gone && !o.fake && !o.ceilingOnly && !o.ceiling);
  const edges = o => ({ l:o.x - o.w / 2, r:o.x + o.w / 2, y:o.y || 0 });

  // E1 · patrol ends past the end of the enemy's footing (it used to jitter at the lip forever).
  for(const e of G.enemies){
    if(e.kind === 'fly' || e.boss || !Number.isFinite(e.patrolMin) || !Number.isFinite(e.patrolMax)) continue;
    for(const end of [e.patrolMin, e.patrolMax]){
      const f = getFloor(end, (e.y || 0) + 12);
      const ok = f.o && (Math.abs(f.y - (e.y || 0)) < 58 || (f.y < (e.y || 0) && (e.y || 0) - f.y <= 520));
      if(!ok) out.push({ category:'E1', title:`${e.type} patrol end over no footing`, at:[Math.round(end), Math.round(e.y || 0)], spawn:Math.round(e.spawnX || e.x) });
    }
  }
  // P1 · stacked / near-duplicate platforms: overlapping spans within 40 of each other in height.
  // P2 · squeeze: a platform directly over another with less than a body and a jump between them.
  for(let i = 0; i < plats.length; i++) for(let j = i + 1; j < plats.length; j++){
    const a = edges(plats[i]), b = edges(plats[j]); if(a.y <= 4 && b.y <= 4) continue;
    const over = Math.min(a.r, b.r) - Math.max(a.l, b.l), dy = Math.abs(a.y - b.y);
    if(over > 20 && dy < 40 && (plats[i].w < 800 && plats[j].w < 800))
      out.push({ category:'P1', title:'stacked / duplicate platforms', at:[plats[i].x + '@' + a.y, plats[j].x + '@' + b.y], overlap:Math.round(over) });
    else if(over > 0 && over < 26 && dy >= 40 && dy < 64 && Math.min(a.y, b.y) > 4)
      out.push({ category:'P2', title:'upper ledge overlaps the lower by less than a body, with little headroom', at:[plats[i].x + '@' + a.y, plats[j].x + '@' + b.y], overlap:Math.round(over) });
  }
  // R1 · a raised ledge nothing below can reach with the stage's kit: it can only be dropped onto.
  for(const P of plats){
    const a = edges(P); if(a.y <= 20 || P.crumble || P.move) continue;
    const from = plats.some(S => { const s = edges(S); if(S === P) return false; const rise = a.y - s.y; if(rise < 0 || rise > RISE) return false;
      const gap = Math.max(0, Math.max(s.l, a.l) - Math.min(s.r, a.r)); return gap <= REACH; });
    if(!from && !G.obstacles.some(o => o.type === 'wall' && Math.abs(o.x - P.x) < P.w / 2 + 60))
      out.push({ category:'R1', title:`ledge reachable only from above (${dj ? 'double' : 'single'} jump${dash ? ' + dash' : ''})`, at:[P.x + '@' + a.y], optional:!!(P.optional || P.optionalRoute || P.returnHook) });
  }
  // I1 · an interactable on a raised surface that answers a knight on the floor below or mid-jump.
  if(typeof outskirtsInteractionCandidate === 'function' && typeof outskirtsAuthoredInteractable === 'function'){
    const save = { x:p.x, y:p.y, vx:p.vx, vy:p.vy, onGround:p.onGround, floorPlat:p.floorPlat };
    for(const o of G.obstacles){
      if(!outskirtsAuthoredInteractable(o) || o.type === 'plat') continue;
      const sup = getFloor(o.x, (o.y || 0) + 4); if(!sup.o || sup.y < 40) continue;
      const below = getFloor(o.x, sup.y - 30); const by = below.o && below.y < sup.y - 20 ? below.y : 0; if(sup.y - by < 50) continue;
      for(const [y, ground] of [[by, true], [by + RISE, false]]){
        Object.assign(p, { x:o.x, y, vx:0, vy:0, onGround:ground, floorPlat:ground ? below.o : null });
        if(outskirtsInteractionCandidate() === o){ out.push({ category:'I1', title:`${o.type}${o.title ? ' "' + o.title + '"' : ''} usable from ${ground ? 'the floor below' : 'mid-jump'}`, at:[Math.round(o.x), Math.round(o.y || 0)] }); break; }
      }
    }
    Object.assign(p, save);
  }
  // F1 · a platform route over continuous, safe floor: the walker can ignore it.
  const raised = plats.filter(o => (o.y || 0) >= 30 && (o.y || 0) <= 420 && !o.optional && !o.optionalRoute && !o.returnHook && !o.sideStory).map(edges).sort((a, b) => a.l - b.l);
  const spans = []; for(const s of raised){ const last = spans[spans.length - 1]; if(last && s.l <= last.r + 160) last.r = Math.max(last.r, s.r), last.n++; else spans.push({ l:s.l, r:s.r, n:1 }); }
  for(const s of spans){
    if(s.n < 3 || s.r - s.l < 450) continue;
    let covered = 0, total = 0;
    for(let x = s.l; x <= s.r; x += 20){ total++; const f = getFloor(x, 10); const hurt = typeof blightZoneAt === 'function' && blightZoneAt(x, (f.y || 0) + 2);
      const spikes = G.obstacles.some(o => o.type === 'spikes' && Math.abs(o.x - x) < (o.w || 60) / 2);
      if(f.o && f.y > -40 && f.y < 20 && !hurt && !spikes) covered++; }
    if(covered / total > .8) out.push({ category:'F1', title:`${s.n} raised platforms over walkable, harmless floor`, at:[Math.round(s.l) + '–' + Math.round(s.r)] });
  }
  return { stage, name:(B.world.stageName ? B.world.stageName(stage) : null), kit:acquired, findings:out };
};

const server = createServer(async (req, res) => {
  try {
    const path = resolve(root, '.' + new URL(req.url, 'http://x').pathname);
    if(!path.startsWith(root + '/')) throw 0;
    const types = { '.html':'text/html', '.js':'application/javascript', '.mp3':'audio/mpeg', '.png':'image/png', '.svg':'image/svg+xml' };
    res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream' });
    res.end(await readFile(path));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const browser = await launchChrome({ headless:true, protocolTimeout:600_000 });
const report = { generated:new Date().toISOString(), static:await staticFindings(), stages:[] };
try {
  const page = await browser.newPage();
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html?tas=1`, { waitUntil:'domcontentloaded' });
  await page.waitForFunction(() => window.__BF?.tas);
  for(const s of stages){
    try{ report.stages.push(await page.evaluate(AUDIT, s)); }
    catch(e){ report.stages.push({ stage:s, error:String(e.message || e).slice(0, 300), findings:[] }); }
  }
  report.pageErrors = errors;
} finally { await browser.close(); server.close(); }

const NAMES = { V1:'Vision cones', E1:'Enemy patrol past its footing', P1:'Stacked / duplicate platforms', P2:'Narrow overlap between ledges',
  R1:'Ledge reachable only from above', I1:'Raised interactable usable from below', F1:'Platforms over a free floor' };
for(const f of report.static) console.log(`[${f.category}] ${NAMES[f.category]} — ${f.where}`);
for(const s of report.stages){
  console.log(`\nStage ${s.stage}${s.error ? ' — ERROR ' + s.error : ''}  (${(s.findings || []).length} findings)`);
  for(const f of s.findings || []) console.log(`  [${f.category}] ${f.title}  ${JSON.stringify(f.at)}${f.optional ? '  (optional)' : ''}`);
}
if(arg('json')) await writeFile(arg('json'), JSON.stringify(report, null, 2));
