/* CO-OP, PLAYED BY TWO BROWSERS (7.169).
   Owner: "Please add co-op back into the game. This way, I can show my friend the game
   without him going crazy by showing him the way + helping him (so actions should be
   shared, only way it is really co-op.)"
     Two isolated Chrome contexts (two saves) run the real game. PeerJS is replaced by an
   in-page stand-in whose packets the test relays between the pages, so nothing touches
   the internet. Every check is made on the game's own state after real messages. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { resolve, sep, extname } from 'node:path';
import { launchChrome } from './launch-chrome.mjs';

const FAKE_PEER = `(() => {
  class Emitter { constructor(){ this._h = {}; } on(e, f){ (this._h[e] = this._h[e] || []).push(f); return this; }
    emit(e, ...a){ for(const f of (this._h[e] || [])) try{ f(...a); }catch(err){ console.error('fakepeer ' + e + ': ' + (err && err.stack || err)); } } }
  const conns = {};
  class FakeConn extends Emitter {
    constructor(peer, remote, id){ super(); this.peer = peer; this.peerId = remote; this.connId = id; this.open = false; this._closed = false;
      this.dataChannel = { bufferedAmount:0 }; conns[id] = this; }
    send(data){ if(this.open) window.__relay(JSON.stringify({ k:'data', connId:this.connId, data })); }
    close(){ if(this._closed) return; this._closed = true; const was = this.open; this.open = false;
      window.__relay(JSON.stringify({ k:'close', connId:this.connId })); if(was) this.emit('close'); }
  }
  class FakePeer extends Emitter {
    constructor(id, opts){ super(); if(id && typeof id === 'object'){ opts = id; id = null; }
      this.id = id || ('anon-' + Math.random().toString(36).slice(2, 8)); this.open = false; this.destroyed = false;
      window.__relay(JSON.stringify({ k:'register', id:this.id })).then(r => { r = JSON.parse(r);
        if(!r.ok){ this.emit('error', { type:'unavailable-id' }); return; } this.open = true; this.emit('open', this.id); }); }
    connect(remote){ const id = this.id + '>' + remote + '#' + Math.random().toString(36).slice(2, 6); const c = new FakeConn(this, remote, id);
      window.__relay(JSON.stringify({ k:'connect', from:this.id, to:remote, connId:id })).then(r => { if(!JSON.parse(r).ok) this.emit('error', { type:'peer-unavailable' }); });
      return c; }
    reconnect(){} destroy(){ if(this.destroyed) return; this.destroyed = true; this.open = false;
      for(const c of Object.values(conns)) if(c.peer === this) c.close(); window.__relay(JSON.stringify({ k:'unregister', id:this.id })); }
  }
  window.__peers = {};
  window.Peer = function(id, opts){ const p = new FakePeer(id, opts); window.__peers[p.id] = p; return p; };
  window.__fakeDeliver = json => { const m = JSON.parse(json);
    if(m.k === 'incoming'){ const peer = window.__peers[m.to]; if(!peer || peer.destroyed) return;
      const c = new FakeConn(peer, m.from, m.connId); c.open = true; peer.emit('connection', c); setTimeout(() => c.emit('open'), 5); }
    else if(m.k === 'opened'){ const c = conns[m.connId]; if(c && !c._closed){ c.open = true; setTimeout(() => c.emit('open'), 10); } }
    else if(m.k === 'data'){ const c = conns[m.connId]; if(c && c.open) c.emit('data', m.data); }
    else if(m.k === 'close'){ const c = conns[m.connId]; if(c && !c._closed){ c._closed = true; const was = c.open; c.open = false; if(was) c.emit('close'); } } };
})();`;

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function coopPair(t, latencyMs=0) {
  const root = fileURLToPath(new URL('../public/', import.meta.url));
  const server = createServer(async (req, res) => {
    try {
      const path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://x').pathname));
      if (!path.startsWith(root.endsWith(sep) ? root : root + sep)) throw new Error('path');
      const body = await readFile(path);
      res.writeHead(200, { 'Content-Type': { '.html':'text/html', '.js':'text/javascript' }[extname(path)] || 'application/octet-stream' });
      res.end(body);
    } catch { if (!res.headersSent) res.writeHead(404); res.end(); }
  });
  t.after(() => new Promise(done => { server.close(() => done()); server.closeAllConnections(); }));
  await new Promise(ok => server.listen(0, '127.0.0.1', ok));
  const browser = await launchChrome({ headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'] });
  t.after(() => browser.close());
  const registry = new Map(), links = new Map(), sides = {}, queues = {};
  const deliverNow = (side, obj) => { const page = sides[side] && sides[side].page; if (!page) return;
    queues[side] = (queues[side] || Promise.resolve()).then(() => page.evaluate(j => window.__fakeDeliver && window.__fakeDeliver(j), JSON.stringify(obj)).catch(() => {})); };
  const deliver=(side,obj)=>latencyMs?setTimeout(()=>deliverNow(side,obj),latencyMs):deliverNow(side,obj);
  async function open(name, existing) {
    const ctx = existing ? existing.ctx : await browser.createBrowserContext();
    const page = existing ? existing.page : await ctx.newPage();
    const errors = existing ? existing.errors : [];
    if (!existing) {
      await page.setViewport({ width: 1280, height: 720 });
      page.on('pageerror', e => errors.push(String(e.message || e)));
      await page.exposeFunction('__relay', async json => {
        const m = JSON.parse(json);
        if (m.k === 'register') { if (registry.has(m.id)) return '{"ok":false}'; registry.set(m.id, name); return '{"ok":true}'; }
        if (m.k === 'unregister') { if (registry.get(m.id) === name) registry.delete(m.id); return '{}'; }
        if (m.k === 'connect') { const to = registry.get(m.to); if (!to) return '{"ok":false}';
          links.set(m.connId, { a: name, b: to }); deliver(to, { k: 'incoming', to: m.to, from: m.from, connId: m.connId });
          deliver(name, { k: 'opened', connId: m.connId }); return '{"ok":true}'; }
        const l = links.get(m.connId); if (!l) return '{}';
        const other = l.a === name ? l.b : l.a;
        if (m.k === 'data') deliver(other, { k: 'data', connId: m.connId, data: m.data });
        if (m.k === 'close') { links.delete(m.connId); deliver(other, { k: 'close', connId: m.connId }); }
        return '{}';
      });
      await page.evaluateOnNewDocument(FAKE_PEER);
    }
    await page.goto(`http://127.0.0.1:${server.address().port}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__NET && typeof beginRun === 'function' && typeof openCoop === 'function', { timeout: 30000 });
    await sleep(600);
    await page.mouse.click(8, 8);   // a first gesture, so no key press is spent unlocking audio
    sides[name] = { name, ctx, page, errors };
    return sides[name];
  }
  const host = await open('host'), guest = await open('guest');
  const ev = (side, f, ...a) => side.page.evaluate(f, ...a);
  const until = async (side, f, ms = 15000) => { const t0 = Date.now();
    while (Date.now() - t0 < ms) { if (await ev(side, f)) return true; await sleep(100); } return false; };
  const connect = async () => {
    await ev(host, () => { __NET.libLoaded = true; netHost(); });
    assert.ok(await until(host, () => __NET.status === 'waiting' && !!__NET.code), 'the host opens a room');
    const code = await ev(host, () => __NET.code);
    await ev(guest, c => { __NET.libLoaded = true; netJoin(c); }, code);
    assert.ok(await until(host, () => __NET.status === 'connected'), 'the friend joins');
    assert.ok(await until(guest, () => __NET.status === 'connected'));
    await sleep(300);
    return code;
  };
  const view = side => ev(side, () => ({ mode, stage: __BF.G ? __BF.G.stageIndex : null,
    x: __BF.G && __BF.G.p ? Math.round(__BF.G.p.x) : null, y: __BF.G && __BF.G.p ? Math.round(__BF.G.p.y) : null,
    obstacles: __BF.G ? __BF.G.obstacles.length : 0, enemies: __BF.G ? __BF.G.enemies.length : 0,
    caps: __BF.G && __BF.G.sessionCapabilities ? __BF.G.sessionCapabilities.acquired.length : 0,
    coop: !!(__BF.G && __BF.G.coopSession), ghostX: __NET.ghost ? Math.round(__NET.ghost.x) : null,
    ghostStage: __NET.ghost ? __NET.ghost.stage : null }));
  const keepAlive = side => ev(side, () => { if (!window.__keep) window.__keep = setInterval(() => { const G = __BF.G; if (G && G.p) { G.p.invuln = Math.max(G.p.invuln || 0, 3); } }, 100); });
  /* Teleport BOTH knights (the tether keeps partners together, so moving one alone just
     gets it dragged back) and tell each machine where its partner now stands. */
  const placeBoth = async (hp, gp) => {
    const put = (side, me, them) => ev(side, (me, them) => {
      Object.assign(__BF.G.p, { x: me.x, y: me.y, vx: 0, vy: 0, floorPlat: null }, me.face ? { face: me.face } : {});
      const g = __NET.ghost; if (g) Object.assign(g, { x: them.x, y: them.y, tx: them.x, ty: them.y, vx: 0, vy: 0 });
      if (__NET.isHost()) __NET.remoteCanonical = Object.assign({}, __NET.remoteCanonical || {}, { x: them.x, y: them.y, vx: 0, vy: 0 });
      if (__NET.remoteBuffer) __NET.remoteBuffer.clear();
    }, me, them);
    /* Packets already in flight still carry the old positions, and under a loaded machine the
       relay can hand them over after the move; the tether then acts on a partner who is not
       there. A real knight never jumps thousands of units, so re-place until both machines
       agree on where both knights stand. */
    const agrees = (side, me, them) => ev(side, (me, them) => !!__NET.ghost &&
      Math.abs(__BF.G.p.x - me.x) < 60 && Math.abs(__NET.ghost.x - them.x) < 60, me, them);
    for (let k = 0; k < 8; k++) {
      await put(host, hp, gp); await put(guest, gp, hp);
      await sleep(400);
      if (await agrees(host, hp, gp) && await agrees(guest, gp, hp)) return;
    }
  };
  return { host, guest, open, ev, until, connect, view, keepAlive, sides, placeBoth };
}

test('the friend can find co-op on a fresh save, join, and both begin in the same world', { timeout: 180000 }, async (t) => {
  const c = await coopPair(t);
  assert.equal(await c.ev(c.guest, () => { titleScreen(); return !!document.getElementById('coopBtn'); }), true,
    'the Co-op button is on the title screen of a save that has never played');
  await c.connect();
  await c.ev(c.host, () => document.getElementById('coopGo').click());
  assert.ok(await c.until(c.guest, () => mode === 'play' && __BF.G && __BF.G.stageIndex === 0), 'the friend is taken into the Outskirts');
  await sleep(800);
  const h = await c.view(c.host), g = await c.view(c.guest);
  assert.equal(h.stage, 0); assert.equal(g.stage, 0);
  assert.equal(g.obstacles, h.obstacles, 'the same world, object for object');
  assert.equal(g.enemies, h.enemies);
  assert.equal(g.caps, h.caps, 'the same kit');
  assert.ok(h.coop && g.coop, 'both are in a co-op session');
  // The friend moves with real keys; the host sees them move.
  const before = (await c.view(c.host)).ghostX;
  await c.guest.page.keyboard.down('ArrowRight'); await sleep(900); await c.guest.page.keyboard.up('ArrowRight');
  await sleep(300);
  assert.ok((await c.view(c.host)).ghostX > before + 60, 'the host sees the friend run');
  assert.deepEqual(c.host.errors, []); assert.deepEqual(c.guest.errors, []);
});

test('both knights must reach an exit, with free movement while either waits', { timeout: 180000 }, async (t) => {
  const c = await coopPair(t);
  await c.connect();
  await c.ev(c.host, () => coopStartRun('select', 1));   // Black Woods: an exit each way
  assert.ok(await c.until(c.guest, () => mode === 'play' && __BF.G && __BF.G.stageIndex === 1));
  await c.keepAlive(c.host); await c.keepAlive(c.guest);
  await sleep(600);
  // The friend reaches the west exit first; the host stays in the level.
  await c.ev(c.host,()=>Object.assign(G.p,{x:1400,y:0,vx:0,vy:0}));
  await c.ev(c.guest, () => Object.assign(__BF.G.p, { x: 120, y: 0, vx: 0, vy: 0, face: -1 }));
  await c.guest.page.keyboard.down('ArrowLeft');
  await sleep(1200);
  assert.equal(await c.ev(c.host,()=>G.stageIndex),1);assert.equal(await c.ev(c.guest,()=>mode),'play');
  await c.ev(c.host,()=>Object.assign(G.p,{x:55,y:0,vx:0,vy:0,face:-1}));
  const guestLed = await c.until(c.host, () => __BF.G.stageIndex === 0 && mode === 'play', 20000);
  await c.guest.page.keyboard.up('ArrowLeft');
  assert.ok(guestLed, 'the host followed the friend into the Outskirts');
  assert.ok(await c.until(c.guest, () => __BF.G.stageIndex === 0 && mode === 'play'), 'and the friend is there too');
  await sleep(800);
  let h = await c.view(c.host), g = await c.view(c.guest);
  assert.ok(Math.abs(h.x - g.x) < 200, `side by side (${h.x} / ${g.x})`);
  assert.equal(g.obstacles, h.obstacles); assert.equal(g.enemies, h.enemies);
  // Now the HOST leads east again.
  const len = await c.ev(c.host, () => __BF.G.levelLength);
  await c.ev(c.host, L => Object.assign(__BF.G.p, { x: L - 120, y: 0, vx: 0, vy: 0, face: 1 }), len);
  // 7.231: the Outskirts exit is the Mothlight gatehouse door at L-200, so the waiting friend stands clear of it.
  await c.ev(c.guest, L => Object.assign(__BF.G.p, { x: L - 420, y: 0, vx: 0, vy: 0, face: 1 }), len);
  await c.host.page.keyboard.down('ArrowRight');
  await sleep(1200);assert.equal(await c.ev(c.host,()=>G.stageIndex),0);
  await c.guest.page.keyboard.down('ArrowRight');
  const hostLed = await c.until(c.guest, () => __BF.G.stageIndex === 1 && mode === 'play', 20000);
  await c.host.page.keyboard.up('ArrowRight');await c.guest.page.keyboard.up('ArrowRight');
  assert.ok(hostLed, 'the friend followed the host back into the Black Woods');
  await sleep(800);
  h = await c.view(c.host); g = await c.view(c.guest);
  assert.equal(h.stage, 1); assert.equal(g.obstacles, h.obstacles); assert.equal(g.enemies, h.enemies);
  assert.ok(Math.abs(h.x - g.x) < 200, 'side by side again');
  assert.deepEqual(c.host.errors, []); assert.deepEqual(c.guest.errors, []);
});

test('what the friend does changes the host\'s world: a ship part, an ability, a ground pound', { timeout: 180000 }, async (t) => {
  const c = await coopPair(t);
  await c.connect();
  await c.ev(c.host, () => coopStartRun('select', 5));   // the Ruined Keep holds the sail
  assert.ok(await c.until(c.guest, () => mode === 'play' && __BF.G && __BF.G.stageIndex === 5));
  await c.keepAlive(c.host); await c.keepAlive(c.guest);
  await sleep(600);
  // The friend claims the sail with Up. The HOST's world is the one that records it.
  const sail = await c.ev(c.guest, () => { const o = __BF.G.obstacles.find(q => q.shipPart); return { x: o.x, y: o.y - 22 }; });
  await c.placeBoth({ x: sail.x - 120, y: sail.y + 4 }, { x: sail.x, y: sail.y + 4 });
  assert.ok(await c.until(c.guest, () => __BF.G.p.onGround, 10000), 'the friend stands on the sail\'s ledge');
  await sleep(400);
  // Held until the host has it: under a loaded machine a short tap can fall between frames.
  await c.guest.page.keyboard.down('ArrowUp');
  const claimed = await c.until(c.host, () => shipPartHeld('ship-part-sail'), 15000);
  await c.guest.page.keyboard.up('ArrowUp');
  assert.ok(claimed, 'the host\'s world holds the sail the friend took');
  assert.ok(await c.until(c.guest, () => shipPartHeld('ship-part-sail'), 10000), 'and the friend\'s count agrees');
  // An ability earned on one machine is carried by both.
  // (The ladder grants only the next ability, in its own region: the Keep's is wall-jump.)
  const had = await c.ev(c.guest, () => hasCapability('wall-jump'));
  assert.equal(had, false);
  assert.equal(await c.ev(c.host, () => grantPermanentCapability('wall-jump', 'test', { quiet: true }).changed), true);
  assert.ok(await c.until(c.guest, () => hasCapability('wall-jump'), 10000), 'the friend carries the host\'s new ability');
  // A ground pound by the friend breaks brittle rock in the host's world.
  const br = await c.ev(c.host, () => { const G = __BF.G;
    const o = { type: 'plat', x: G.p.x + 600, y: 0, w: 120, h: 14, brittle: 1 }; G.obstacles.push(o);
    return G.obstacles.length - 1; });
  await c.ev(c.guest, () => { const G = __BF.G; G.obstacles.push({ type: 'plat', x: G.p.x + 600, y: 0, w: 120, h: 14, brittle: 1 }); });
  const at = await c.ev(c.host, i => ({ x: __BF.G.obstacles[i].x, y: __BF.G.obstacles[i].y }), br);
  await c.ev(c.guest, a => netSend({ t: 'slamIntent', x: a.x, y: a.y }), at);
  let broke = false;
  for (let k = 0; k < 40 && !broke; k++) { broke = await c.ev(c.host, i => !!__BF.G.obstacles[i].gone, br); if (!broke) await sleep(100); }
  assert.ok(broke, 'the host\'s rock breaks under the friend\'s strike: '+JSON.stringify(await c.ev(c.host, i=>({mode,rock:__BF.G.obstacles[i],conversation:!!document.getElementById('fieldConversation')}),br)));
  assert.ok(await c.until(c.guest,()=>__BF.G.obstacles.some(o=>o.brittle&&o.gone)), 'the broken rock is synchronized while the host is in dialogue');
  assert.match(await c.ev(c.guest, () => slamImpact.toString()), /netSend\(\{t:'slamIntent'/, 'and the friend\'s own slam sends that strike');
  assert.deepEqual(c.host.errors, []); assert.deepEqual(c.guest.errors, []);
});

test('Continue brings the friend into the host\'s own journey and leaves the save untouched', { timeout: 180000 }, async (t) => {
  const c = await coopPair(t);
  // Give the host a real journey: a Continue at the Ruined Keep with eight abilities.
  await c.ev(c.host, () => {
    const acquired = ['jump','weapon','dash','portal-single','portal-pair','wall-jump','counter','double-jump'];
    meta.capabilities = BFCapabilitiesModule.createState({ acquired });
    beginRun(0, null, { hp: 1, dmg: 1 }, { startStage: 5 });
    meta.sideStories=BladefallSideStories.reduce(meta.sideStories,'gatekeeper',{type:'choice',choice:'short'}).state;
    saveRunAtStage(5, snapOf(G.p)); titleScreen();
  });
  const saved = () => JSON.stringify({ stage: meta.run.stageIndex, caps: meta.capabilities.acquired, ck: meta.recovery.activeCheckpoint, deaths: meta.recovery.deaths, sideStories:meta.sideStories });
  const before = await c.ev(c.host, new Function(`return (${saved})()`));
  await c.connect();
  await c.ev(c.host, () => document.getElementById('coopContinue').click());
  assert.ok(await c.until(c.guest, () => mode === 'play' && __BF.G && __BF.G.stageIndex === 5), 'both are at the host\'s Keep');
  await sleep(600);
  assert.equal(await c.ev(c.guest, () => hasCapability('double-jump')), true, 'the friend carries the host\'s abilities');
  for(const side of [c.host,c.guest])assert.equal(await c.ev(side,()=>BladefallSideStories.row(G.sessionSideStories,'gatekeeper').phase),'active','Continue carries saved dialogue progress for both players');
  // A checkpoint in the co-op journey must not overwrite the host's Continue.
  await c.ev(c.host, () => { __BF.G.stageIndex; activateRuntimeCheckpoint('test:coop', { x: __BF.G.p.x, y: __BF.G.p.y }, 'checkpoint', null, true); });
  await c.ev(c.host, () => { __BF.G.p.dead = true; die(); });
  const after = await c.ev(c.host, new Function(`return (${saved})()`));
  assert.equal(after, before, 'the host\'s save is exactly as it was');
  assert.deepEqual(c.host.errors, []); assert.deepEqual(c.guest.errors, []);
});

test('a reloaded guest returns to its own checkpoint in the shared region', { timeout: 180000 }, async (t) => {
  const c = await coopPair(t);
  const code = await c.connect();
  await c.ev(c.host, () => coopStartRun('select', 3));
  assert.ok(await c.until(c.guest, () => mode === 'play' && __BF.G && __BF.G.stageIndex === 3));
  await c.ev(c.host,()=>{G.p.x=1000;G.p.ckSet=true;G.p.ckX=1000;G.p.ckY=0;});
  await c.ev(c.guest,()=>{G.p.ckSet=true;G.p.ckX=250;G.p.ckY=0;});await sleep(300);
  // The friend's tab reloads: a brand-new page with no session.
  await c.open('guest', c.sides.guest);
  await c.ev(c.guest, k => { __NET.libLoaded = true; netJoin(k); }, code);
  assert.ok(await c.until(c.guest, () => __NET.status === 'connected'), 'reconnected');
  assert.ok(await c.until(c.guest, () => mode === 'play' && __BF.G && __BF.G.stageIndex === 3 && __BF.G.coopSession, 15000),
    'and put straight back into the host\'s region');
  const h = await c.view(c.host), g = await c.view(c.guest);
  assert.equal(await c.ev(c.guest,()=>G.p.ckX),250,'reconnect does not carry the guest to the leader');
  assert.equal(g.obstacles, h.obstacles);
});

test('every region builds the same world on both machines', { timeout: 300000 }, async (t) => {
  const c = await coopPair(t);
  await c.connect();
  const rows = [];
  for (const i of await c.ev(c.host,()=>STAGES.map((s,i)=>s&&!s.cut?i:null).filter(i=>i!==null))) {
    await c.ev(c.host, k => { titleScreen(); coopStartRun('select', k); }, i);
    const ok = await c.until(c.guest, new Function(`return mode==='play'&&!!__BF.G&&__BF.G.stageIndex===${i}&&!!__BF.G.coopSession`), 20000);
    await sleep(500);
    const h = await c.view(c.host), g = await c.view(c.guest);
    rows.push({ i, ok, h: [h.obstacles, h.enemies], g: [g.obstacles, g.enemies] });
  }
  for (const r of rows) {
    assert.ok(r.ok, `stage ${r.i}: the friend arrived`);
    assert.deepEqual(r.g, r.h, `stage ${r.i}: the same objects and enemies (host ${r.h} / friend ${r.g})`);
  }
  assert.deepEqual(c.host.errors, []); assert.deepEqual(c.guest.errors, []);
});

test('a wipe restarts each knight at their own checkpoint; quitting brings both back to the lobby', { timeout: 180000 }, async (t) => {
  const c = await coopPair(t);
  await c.connect();
  await c.ev(c.host, () => coopStartRun('select', 1));
  assert.ok(await c.until(c.guest, () => mode === 'play' && __BF.G && __BF.G.stageIndex === 1));
  await sleep(500);
  await c.placeBoth({ x: 3000, y: 0 }, { x: 3060, y: 0 });
  // 7.233: only the knight's own flag sets a checkpoint, so each knight plants one.
  await c.ev(c.host, () => activateRuntimeCheckpoint('player-flag:test:wipe', { x: 3000, y: 0 }, 'checkpoint', null, true));
  await c.ev(c.guest,()=>activateRuntimeCheckpoint('player-flag:test:guest-wipe',{x:1400,y:0},'checkpoint',null,true));
  // Both knights go down: the guest first, then the host.
  await c.ev(c.guest, () => coopDownPlayer(__BF.G.p));
  assert.ok(await c.until(c.host, () => __NET.ghost && __NET.ghost.downed, 5000), 'the host sees the friend go down');
  await c.ev(c.host, () => coopDownPlayer(__BF.G.p));
  assert.ok(await c.until(c.guest, () => mode === 'play' && !__BF.G.p.downed, 8000), 'the friend is back on their feet');
  await sleep(600);
  const h = await c.view(c.host), g = await c.view(c.guest);
  assert.equal(h.stage, 1); assert.equal(g.stage, 1);
  assert.ok(Math.abs(h.x - 3000) < 80, `the host restarts at its checkpoint (${h.x})`);
  assert.ok(Math.abs(g.x - 1400) < 80, `the guest returns to its own checkpoint (${g.x})`);
  assert.equal(g.obstacles, h.obstacles);
  // The host quits: the friend is brought back to the co-op lobby, still connected.
  await c.ev(c.host, () => titleScreen());
  assert.ok(await c.until(c.guest, () => mode === 'title' && __NET.status === 'connected', 5000), 'the friend returns to the lobby');
  assert.deepEqual(c.host.errors, []); assert.deepEqual(c.guest.errors, []);
});

test('the boat ends Act 1 for both knights', { timeout: 180000 }, async (t) => {
  const c = await coopPair(t);
  await c.connect();
  await c.ev(c.host, () => coopStartRun('select', 13));
  assert.ok(await c.until(c.guest, () => mode === 'play' && __BF.G && __BF.G.stageIndex === 13));
  await sleep(500);
  await c.ev(c.host, () => { for (const [z, id] of [['updrafts','ship-part-keel'],['hollow-marksman','ship-part-mast'],['ruined-keep','ship-part-sail']])
    __BF.G.sessionZoneState = BFZoneStateModule.setCircuit(__BF.G.sessionZoneState, z, id, { open: true, solved: true }); });
  await c.ev(c.host,()=>{coopSendZoneSync();launchTheShip();});
  await sleep(500);assert.equal(await c.ev(c.host,()=>!!G.actTwoPending),false,'one player cannot sail alone');
  await c.ev(c.guest,()=>launchTheShip());
  let bothEnded = false;
  for (let k = 0; k < 60 && !bothEnded; k++) {
    await sleep(1000);
    for (const side of [c.host, c.guest]) await c.ev(side, () => { if (mode === 'cutscene') { const cs = document.getElementById('cutscene'); if (cs) cs.click(); } });
    bothEnded = (await c.ev(c.host, () => !!meta.actTwoReached)) && (await c.ev(c.guest, () => !!meta.actTwoReached));
  }
  assert.ok(bothEnded, 'both saves record the end of Act 1');
});

test('the partner is drawn as a knight in the pixel renderer: weapon, swing, tag, crimson cloak', { timeout: 120000 }, async (t) => {
  const c = await coopPair(t);
  await c.connect();
  await c.ev(c.host, () => coopStartRun('select', 2));
  assert.ok(await c.until(c.guest, () => mode === 'play' && __BF.G && __BF.G.stageIndex === 2));
  await sleep(600);
  const diff = await c.ev(c.host, () => {
    const g = __NET.ghost, p = __BF.G.p; window.update = () => {};
    Object.assign(g, { x: p.x + 90, y: p.y, tx: p.x + 90, ty: p.y, onGround: true, vx: 0, vy: 0, face: 1, hidden: false, stage: __BF.G.stageIndex });
    const grab = () => { __BF.drawFrame(); const cv = mainCanvas; return cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; };
    const count = (a, b) => { let n = 0; for (let k = 0; k < a.length; k += 4) if (a[k] !== b[k] || a[k + 1] !== b[k + 1] || a[k + 2] !== b[k + 2]) n++; return n; };
    g.weapon = null; g.atkTimer = 0; g.tag = 'PARTNER'; const bare = grab();
    g.weapon = { arche: 'sword', cls: 'melee' }; const armed = grab();
    g.atkTimer = 0.2; const swing = grab();
    g.tag = 'DOWNED'; g.downed = true; const down = grab();
    return { weapon: count(bare, armed), swing: count(armed, swing), downed: count(swing, down) };
  });
  assert.ok(diff.weapon > 20, `the partner's weapon is drawn (${diff.weapon} px)`);
  assert.ok(diff.swing > 20, `and its swing (${diff.swing} px)`);
  assert.ok(diff.downed > 20, `and a downed partner looks downed (${diff.downed} px)`);
});

/* The friend's connection handshake can be answered after the host has pressed Start: a
   resume then arrives for the region the friend is already in, stamped with where the host
   stood back then. Under load it pulled both knights back to the entrance. */
test('a handshake that crosses the start neither reloads the friend nor pulls them back', { timeout: 120000 }, async (t) => {
  const c = await coopPair(t);
  await c.connect();
  await c.ev(c.host, () => coopStartRun('select', 1));
  assert.ok(await c.until(c.guest, () => mode === 'play' && __BF.G && __BF.G.stageIndex === 1));
  await sleep(500);
  await c.placeBoth({ x: 3000, y: 0 }, { x: 3060, y: 0 });
  await c.ev(c.guest, () => { window.__loads = 0; const o = window.loadStage; window.loadStage = function () { window.__loads++; return o.apply(this, arguments); }; });
  await c.ev(c.host, () => netSend({ t: 'coopStage', reason: 'resume', i: 1, endpoint: null, seed: __NET.stageSeed, ng: 0,
    x: 70, y: 0, face: 1, session: coopSessionPacket() }));
  await sleep(800);
  const g = await c.view(c.guest), h = await c.view(c.host);
  assert.equal(await c.ev(c.guest, () => window.__loads), 0, 'the friend\'s region is not rebuilt');
  assert.ok(Math.abs(g.x - 3060) < 80, `the friend stays where they stood (${g.x})`);
  assert.ok(Math.abs(h.x - 3000) < 80, `and so does the host (${h.x})`);
  assert.deepEqual(c.host.errors, []); assert.deepEqual(c.guest.errors, []);
});

 test('independent movement, camera, pit recovery and portals coexist with shared enemy deaths', {timeout:120000},async t=>{
 const c=await coopPair(t);await c.connect();await c.ev(c.host,()=>coopStartRun('select',1));
 assert.ok(await c.until(c.guest,()=>G?.stageIndex===1&&mode==='play'));
 await c.keepAlive(c.host);await c.keepAlive(c.guest);
 await c.placeBoth({x:1200,y:0},{x:3000,y:0});
 const before=await c.ev(c.host,()=>G.p.x);await c.host.page.keyboard.down('ArrowLeft');await sleep(700);await c.host.page.keyboard.up('ArrowLeft');
 assert.ok(await c.ev(c.host,x=>G.p.x<x-50,before),'movement continues away from the partner');
 assert.ok(await c.ev(c.host,()=>Math.abs(G.p.x-NET.ghost.x)>1000),'no tether pulls either knight');
 await c.ev(c.host,()=>{G.cratePortals=[{x:1111,y:40,nx:1,ny:0,t:999}];});
 await c.ev(c.guest,()=>{G.cratePortals=[{x:3077,y:40,nx:-1,ny:0,t:999}];coopSyncPortals();});await sleep(300);
 assert.equal(await c.ev(c.host,()=>G.cratePortals[0].x),1111);assert.equal(await c.ev(c.guest,()=>G.cratePortals[0].x),3077);
 assert.ok(await c.until(c.host,()=>NET.ghost.personalPortals?.some(o=>o.x===3077)),'partner portals are visible as non-interactive outlines');
 const recovery=await c.ev(c.guest,()=>{G.p.ckSet=true;G.p.ckX=900;G.p.ckY=0;hurtPlayer(0,0,false);return G.p.x;});assert.equal(recovery,900);
 const foe=await c.ev(c.host,()=>G.enemies.findIndex(e=>!e.dead&&!e.boss));assert.ok(foe>=0);
 await c.ev(c.guest,i=>netSend({t:'combatIntent',i,d:250}),foe);
 assert.ok(await c.until(c.host,()=>G.enemies.some(e=>e.dead)),'guest damage kills on the host');
 assert.ok(await c.until(c.guest,new Function('return G.enemies['+foe+'].dead')),'guest sees the same death');
 const second=await c.ev(c.host,()=>{const i=G.enemies.findIndex(e=>!e.dead&&!e.boss);killEnemy(G.enemies[i],{enemyIndex:i});return i;});
 assert.ok(await c.until(c.guest,new Function('return G.enemies['+second+'].dead')),'host kills are seen by the guest too');
 assert.deepEqual(c.host.errors,[]);assert.deepEqual(c.guest.errors,[]);
 });

test('Act Two, Fractured exits and the final ending require both arrivals', {timeout:180000},async t=>{
 const c=await coopPair(t);await c.connect();
 for(const stage of [17,22,40]){
  await c.ev(c.host,k=>coopStartRun('select',k),stage);
  assert.ok(await c.until(c.guest,new Function(`return G?.stageIndex===${stage}&&mode==='play'`)));
  for(const side of [c.host,c.guest])await c.ev(side,()=>{
   G.actTwo.queue=[];G.p.invuln=999;
   if(G.stageIndex===17){G.actTwo.gateOpen=true;BladefallActTwo.kit.latch('landing-shores','shores-gate-open');}
   if(G.stageIndex===40){G.actTwo.yielded=true;G.actTwo.fight=false;if(G.boss)G.boss.dead=true;}
  });
  const pos=await c.ev(c.host,()=>{const x=G.levelLength-55;return {x,y:getFloor(x,1500).y};});
  await c.placeBoth(pos,{x:pos.x-500,y:pos.y});await sleep(500);
  assert.equal(await c.ev(c.host,()=>G.stageIndex),stage);assert.equal(await c.ev(c.host,()=>mode),'play','finishing first keeps controls active');
  await c.ev(c.guest,pos=>Object.assign(G.p,{...pos,face:1,vx:0,vy:0}),pos);
  if(stage===40){const ended=await c.until(c.host,()=>mode==='win');if(!ended)console.log('ENDING DEBUG',await c.ev(c.host,()=>({mode,over:G.actTwo.over,yielded:G.actTwo.yielded,x:G.p.x,local:G.coopExitLocal,remote:G.coopExitRemote})),await c.ev(c.guest,()=>({mode,over:G.actTwo.over,x:G.p.x,local:G.coopExitLocal})));assert.ok(ended);assert.ok(await c.until(c.guest,()=>mode==='win'));}
  else {const arrived=await c.until(c.host,new Function(`return G.stageIndex===${stage===22?25:stage+1}&&mode==='play'`));if(!arrived)console.log('EXIT DEBUG',stage,await c.ev(c.host,()=>({mode,stage:G.stageIndex,x:G.p.x,y:G.p.y,spec:physicalSeamSpec(),local:G.coopExitLocal,remote:G.coopExitRemote,ghost:NET.ghost&&{x:NET.ghost.x,y:NET.ghost.y,stage:NET.ghost.stage},cross:G.physicalSeamCrossing})),await c.ev(c.guest,()=>({mode,stage:G.stageIndex,x:G.p.x,y:G.p.y,spec:physicalSeamSpec(),local:G.coopExitLocal})));assert.ok(arrived);assert.ok(await c.until(c.guest,new Function(`return G.stageIndex===${stage===22?25:stage+1}&&mode==='play'`)));}
 }
 assert.deepEqual(c.host.errors,[]);assert.deepEqual(c.guest.errors,[]);
});


test('guest solves Causeway machinery; host owns doors and a changing enemy roster', {timeout:120000}, async t=>{
  const c=await coopPair(t,100);await c.connect();
  await c.ev(c.host,()=>coopStartRun('select',2));
  assert.ok(await c.until(c.guest,()=>G?.stageIndex===2&&mode==='play'));
  await c.keepAlive(c.host);await c.keepAlive(c.guest);
  const lever=await c.ev(c.guest,()=>{const o=G.obstacles.find(o=>o.repairCatch==='causeway-catch-yard');return {x:o.x,y:o.y};});
  await c.placeBoth({x:700,y:0},lever);
  await c.ev(c.guest,()=>pullLever(G.obstacles.find(o=>o.repairCatch==='causeway-catch-yard')));
  assert.ok(await c.until(c.host,()=>G.obstacles.some(o=>o.repairCatch==='causeway-catch-yard'&&o.struck)),'guest lever reaches host');
  // Align the authored hoist; only the guest stands beneath it.
  await c.placeBoth({x:700,y:0},{x:4050,y:0});
  await c.ev(c.host,()=>{const o=G.obstacles.find(o=>o.requiresRepairCatch);o.hoist=null;o.x=4050;});
  assert.ok(await c.until(c.host,()=>G.obstacles.some(o=>o.requiresRepairCatch&&o.state==='landed')),'guest triggers the host hoist');
  const upper=await c.ev(c.guest,()=>{const o=G.obstacles.find(o=>o.repairCatch==='causeway-catch-rise');return {x:o.x,y:o.y};});
  await c.placeBoth({x:700,y:0},upper);
  await c.ev(c.guest,()=>pullLever(G.obstacles.find(o=>o.repairCatch==='causeway-catch-rise')));
  assert.ok(await c.until(c.host,()=>doorOpen(G.obstacles.find(o=>o.causewayRepairShortcut))),'host gate opens');
  assert.ok(await c.until(c.guest,()=>doorOpen(G.obstacles.find(o=>o.causewayRepairShortcut))),'guest gate opens');
  await c.ev(c.host,()=>{const e=spawnEnemy('grunt',900);e.testSummon=true;});
  assert.ok(await c.until(c.guest,()=>G.enemies.some(e=>e.testSummon&&!e.dead)),'newly spawned enemy appears for guest');
  await c.ev(c.host,()=>{G.enemies=G.enemies.filter(e=>!e.testSummon);});
  assert.ok(await c.until(c.guest,()=>!G.enemies.some(e=>e.testSummon)),'removed enemy disappears for guest');
  const size=await c.ev(c.host,()=>{netPackWorldSnapshot(true);const full=JSON.stringify(netPackWorldSnapshot()).length;const delta=JSON.stringify(netPackWorldSnapshot(true)).length;return {full,delta};});
  assert.ok(size.delta<size.full*.7,JSON.stringify(size));
  assert.deepEqual(c.host.errors,[]);assert.deepEqual(c.guest.errors,[]);
});

test('co-op abilities survive stale resume, test mode is available, and dialogue can always close', {timeout:120000},async t=>{
  const c=await coopPair(t);await c.connect();await c.ev(c.host,()=>coopStartRun('select',12));
  assert.ok(await c.until(c.guest,()=>G?.stageIndex===12&&mode==='play'));
  const result=await c.ev(c.guest,()=>{
    const sess=coopSessionPacket();sess.caps=sess.caps.filter(id=>id!=='dash');
    applyCoopSession(sess,true);const dash=hasCapability('dash');
    meta.devUnlocked=false;openSettings();const test=!!document.getElementById('testModeChk');
    showOverlay(false);mode='play';openFieldConversation({name:'Oren',type:'ambientFigure'},'Oren','The road is open.');
    return {dash,test};
  });
  assert.deepEqual(result,{dash:true,test:true});
  await c.guest.page.click('#fieldConversation button');
  await c.guest.page.evaluate(()=>document.activeElement.blur());await c.guest.page.keyboard.press('Escape');
  assert.ok(await c.until(c.guest,()=>mode==='play'&&!document.getElementById('fieldConversation')));
  await c.ev(c.host,()=>{mode='play';NET.noteCapture=[];showOutskirtsAnnotation({x:0,y:0},'<b>DEVICE</b><br>Opened.',{});window.__noteCheck={mode,notes:NET.noteCapture.length};NET.noteCapture=null;});
  assert.deepEqual(await c.ev(c.host,()=>window.__noteCheck),{mode:'play',notes:1});
  assert.deepEqual(c.host.errors,[]);assert.deepEqual(c.guest.errors,[]);
});

test('the Cloaked Man shares guest engagement, health and phase changes', {timeout:120000},async t=>{
  const c=await coopPair(t);await c.connect();await c.ev(c.host,()=>coopStartRun('select',43));
  assert.ok(await c.until(c.guest,()=>G?.stageIndex===43&&mode==='play'));
  await c.keepAlive(c.host);await c.keepAlive(c.guest);
  const x=await c.ev(c.host,()=>BladefallCloakedMan.constants.ARENA.x1+150);
  await c.placeBoth({x:120,y:0},{x,y:0});
  assert.ok(await c.until(c.host,()=>G.actTwo.fight),'guest can start the fight');
  assert.ok(await c.until(c.guest,()=>G.actTwo.fight&&!!G.actTwo.man),'guest sees the same boss body');
  const before=await c.ev(c.host,()=>G.actTwo.hp);
  await c.ev(c.guest,()=>{const e=G.actTwo.man;netSend({t:'combatIntent',i:G.enemies.indexOf(e),d:20});});
  assert.ok(await c.until(c.host,new Function('return G.actTwo.hp < '+before)),'guest damage reaches shared health');
  assert.ok(await c.until(c.guest,new Function('return G.actTwo.hp < '+before)),'shared health returns to guest');
  await c.ev(c.host,()=>{G.actTwo.man.hp-=100000;});
  assert.ok(await c.until(c.host,()=>!!G.actTwo.trans||G.actTwo.phase>0));
  assert.ok(await c.until(c.guest,()=>!!G.actTwo.trans||G.actTwo.phase>0));
  assert.deepEqual(c.host.errors,[]);assert.deepEqual(c.guest.errors,[]);
});

test('opening Fractured kits reject later abilities and retain personal carrier state', {timeout:180000},async t=>{
 const c=await coopPair(t);await c.connect();
 for(const stage of [21,22,25]){
  await c.ev(c.host,stage=>coopStartRun('select',stage),stage);
  await c.ev(c.guest,stage=>window.__expectedEarlyStage=stage,stage);
  assert.ok(await c.until(c.guest,()=>G?.stageIndex===window.__expectedEarlyStage&&!!G.earlyPlatforming&&mode==='play'));
  const kit=await c.ev(c.guest,()=>{
   if(G.stageIndex!==25){coopMergeCaps(['jump','weapon','dash','portal-single','portal-pair','wall-jump']);const s=coopSessionPacket();s.caps=['jump','weapon','dash','portal-single','portal-pair','wall-jump'];applyCoopSession(s,true);}
   const a=G.earlyPlatforming,before={...a.used};a.armed=true;G.p.x=a.room.spawn[0];G.p.y=a.room.spawn[1];BladefallEarlyPlatforming.retry();
   return {movement:movementProfile(),personalReset:JSON.stringify(before)===JSON.stringify(a.used),retries:a.retries};
  });
  // 7.233 (owner): no local retries anywhere — a fall is recovered from the knight's own flag.
  assert.equal(kit.movement.dash,stage===25);assert.equal(kit.movement.wallJump,false);assert.equal(kit.movement.gravityFlip,false);assert.ok(kit.personalReset);assert.equal(kit.retries,0);
  assert.equal(await c.ev(c.host,()=>G.earlyPlatforming.retries),0,'guest retry cannot rewind host');
 }
 assert.deepEqual(c.host.errors,[]);assert.deepEqual(c.guest.errors,[]);
});


test('early carriers keep local motion in co-op, with no walkway beneath a crossing', {timeout:120000},async t=>{
 // 7.233 (owner): the Outskirts has no crossing; the counterweight lift is introduced in the Causeway,
 // and no return walkway is ever laid beneath it ("completely negates the risk").
 const c=await coopPair(t,70);await c.connect();await c.ev(c.host,()=>coopStartRun('select',2));
 assert.ok(await c.until(c.guest,()=>G?.stageIndex===2&&!!G.earlyPlatforming&&mode==='play'));
 await c.keepAlive(c.host);await c.keepAlive(c.guest);
 assert.ok(await c.until(c.guest,()=>!!G.earlyPlatforming?.clockSynced,8000),'the guest takes the host lift clock');
 const snapshot=await c.ev(c.guest,()=>{
  const o=G.obstacles.find(o=>o.earlyCarrier&&!o.earlyQuest),i=G.obstacles.indexOf(o),x=o.x,y=o.y;
  netApplyDynamicWorld([[i,99999,99999]]);
  return {preserved:o.x===x&&o.y===y,synced:G.earlyPlatforming.clockSynced};
 });assert.deepEqual(snapshot,{preserved:true,synced:true});
 assert.equal(await c.ev(c.guest,()=>G.obstacles.some(o=>o.earlyBridge)),false);
 assert.equal(await c.ev(c.guest,()=>getFloor(8900,10).o?1:0),0,'the void under the freight lift stays open');
 assert.deepEqual(c.host.errors,[]);assert.deepEqual(c.guest.errors,[]);
});


test('Silas maintenance tasks and released patrol fence are shared', {timeout:120000},async t=>{
 const c=await coopPair(t);await c.connect();await c.ev(c.host,()=>coopStartRun('select',2));
 assert.ok(await c.until(c.guest,()=>G?.stageIndex===2&&mode==='play'));
 await c.keepAlive(c.host);await c.keepAlive(c.guest);
 for(const side of [c.host,c.guest])await c.ev(side,()=>{G.sessionSideStories=BladefallSideStories.reduce(G.sessionSideStories,'defector',{type:'choice',choice:'short'}).state;BladefallSideStoryWorld.apply();});
 for(const [task,x,y,step] of [['brake',10790,130,1],['gear',11220,195,2],['gate',10887,130,3]]){
  await c.placeBoth({x:10730,y:130},{x,y});
  await c.ev(c.guest,task=>{
   if(task==='gear'){G.p.face=1;G.p.swingT=.15;G.p.pogoSwing=G.p.upSlashSwing=false;BladefallSideStoryWorld.update(1/60);}
   else BladefallSideStoryWorld.interact(G.obstacles.find(o=>o.sideStory==='defector'&&o.task===task));
   BladefallConversation.close();
  },task);
  const done=new Function('return BladefallSideStories.row(BladefallSideStoryWorld.state(),"defector").step === '+step);
  assert.ok(await c.until(c.host,done),'host receives '+task);assert.ok(await c.until(c.guest,done),'guest receives '+task);
 }
 for(const side of [c.host,c.guest])assert.ok(await c.until(side,()=>G.obstacles.find(o=>o.sideStoryRole==='patrolFence').gone));
 assert.deepEqual(c.host.errors,[]);assert.deepEqual(c.guest.errors,[]);
});
