/* Player-text overrides. The Dialogue Editor (dialogue-editor.html) saves edits here; the game
   swaps any displayed string for its edit at the moment it is shown.

   - Edits are keyed by the ORIGINAL text (the catalog, bladefall-text-catalog.js, lists every
     original with its file and line), or by a BladefallDialogue id for that module's entries
     (those keep their own store, bladefall_dialogue_overrides_v1).
   - apply(text) matches whole pieces of what is shown: the whole string, then each run of text
     between HTML tags, then each line, then each " · " part, ignoring surrounding quotes and
     whitespace, and an ALL-CAPS display of a mixed-case original. Originals of 12+ characters are
     also replaced inside longer strings, which covers lines assembled around a live value.
     Edits to a catalog FRAGMENT (a piece of a line built around a live value, e.g. "QUEST" in
     "QUEST · <title>") are kept apart as `parts` and replaced wherever they appear as whole words.
   - Choke points call apply() explicitly (conversation panel, annotations, toasts, notices,
     overlay cards, floating text). install() adds two catch-alls: canvas text (fillText,
     strokeText, measureText, so widths agree) and DOM text nodes (a MutationObserver). Both are
     idle — a single boolean test — when there are no edits.
   - A page opts out with <html data-bf-text="off"> (the editor shows originals). */
(function(root, factory){
  const api = factory(root);
  if(typeof module === 'object' && module.exports) module.exports = api;
  root.BladefallText = api;
  if(root.document) api.install();   // a page opts out with <html data-bf-text="off">
})(typeof globalThis !== 'undefined' ? globalThis : this, function(root){
  'use strict';
  const KEY = 'bladefall_text_overrides_v1', DIALOGUE_KEY = 'bladefall_dialogue_overrides_v1', FORMAT = 'bladefall-text-overrides';
  const LONG = 12, CACHE_MAX = 4000;
  let exactMap = new Map(), upperMap = new Map(), subs = [], cache = new Map(), active = false, observer = null, installed = false;

  function storage(){ try{ return root.localStorage || null; }catch(_e){ return null; } }
  function readStore(){
    const s = storage(); if(!s) return { byText:{}, parts:{} };
    try{ const raw = JSON.parse(s.getItem(KEY) || '{}') || {}; return { byText:clean(raw.byText), parts:clean(raw.parts) }; }catch(_e){ return { byText:{}, parts:{} }; }
  }
  function readByText(){ return readStore().byText; }
  function clean(byText){
    const out = {};
    if(byText && typeof byText === 'object') for(const o of Object.keys(byText)){ const n = byText[o]; if(o && typeof n === 'string' && n !== o) out[o] = n; }
    return out;
  }
  /* Rebuild the lookup from both stores (or from explicit tables, for tests). */
  const LETTER = 'A-Za-z\u00c0-\u024f';
  function wordPattern(o){
    const esc = o.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp((new RegExp('^[' + LETTER + ']').test(o) ? '(?<![' + LETTER + '])' : '') + esc + (new RegExp('[' + LETTER + ']$').test(o) ? '(?![' + LETTER + '])' : ''), 'g');
  }
  function load(table, partsTable){
    const store = table || partsTable ? { byText:clean(table), parts:clean(partsTable) } : readStore();
    const byText = store.byText;
    exactMap = new Map(Object.entries(byText));
    const D = root.BladefallDialogue;
    if(!table && D && D.ENTRIES){
      // Id edits are already resolved when the game builds its levels; mapping their default
      // text too makes an edit saved while the game is open show without a reload.
      const ids = D.load ? D.load() : {};
      for(const id of Object.keys(ids)){ const base = D.ENTRIES[id] && D.ENTRIES[id].text;
        if(base && !/\{\w+\}/.test(base) && ids[id] !== base && !exactMap.has(base)) exactMap.set(base, ids[id]); }
    }
    upperMap = new Map();
    for(const [o, n] of exactMap) if(/[a-z]/.test(o) && !exactMap.has(o.toUpperCase())) upperMap.set(o.toUpperCase(), n.toUpperCase());
    subs = [...exactMap].filter(([o]) => o.length >= LONG).map(([o, n]) => [o, n, null])
      .concat(Object.entries(store.parts).filter(([o]) => o.trim().length >= 2).map(([o, n]) => [o, n, wordPattern(o)]))
      .sort((a, b) => b[0].length - a[0].length);
    cache.clear(); active = exactMap.size > 0 || subs.length > 0;
    if(active && installed) startObserver();
    return exactMap.size;
  }
  function save(byText, parts){
    const s = storage(), value = clean(byText), pieces = clean(parts === undefined ? readStore().parts : parts);
    if(s) try{ s.setItem(KEY, JSON.stringify({ format:FORMAT, version:1, byText:value, parts:pieces })); }catch(_e){}
    load(); return value;
  }
  function overrides(){ return readStore(); }

  /* ── Matching ─────────────────────────────────────────────────────────── */
  const QUOTED = /^([“"‘'«(]+)([\s\S]+?)([”"’'»).,!?…]*[”"’'»)])$/;
  function exact(t){
    let hit = exactMap.get(t); if(hit !== undefined) return hit;
    hit = upperMap.get(t); if(hit !== undefined) return hit;
    const q = QUOTED.exec(t);
    if(q){ const inner = exact(q[2]); if(inner !== undefined) return q[1] + inner + q[3]; }
    const lead = /^([◇◆✦▤•↑↓←→⟶]+\s*)([\s\S]+)$/.exec(t);
    if(lead){ const inner = exact(lead[2]); if(inner !== undefined) return lead[1] + inner; }
    return undefined;
  }
  function plain(s){
    if(typeof s !== 'string' || !/[A-Za-z]/.test(s)) return s;
    const lead = /^\s*/.exec(s)[0], rest = s.slice(lead.length), trail = /\s*$/.exec(rest)[0], core = rest.slice(0, rest.length - trail.length);
    if(!core) return s;
    let out = exact(core);
    if(out === undefined && /\n/.test(core)){ const parts = core.split(/(\n+)/), joined = parts.map((p, i) => i % 2 ? p : plain(p)).join(''); if(joined !== core) out = joined; }
    if(out === undefined && core.indexOf(' · ') > 0){ const joined = core.split(' · ').map(plain).join(' · '); if(joined !== core) out = joined; }
    if(out === undefined){ let r = core;
      for(const [o, n, re] of subs) if(r.indexOf(o) >= 0) r = re ? r.replace(re, () => n) : r.split(o).join(n);
      if(r !== core) out = r; }
    return out === undefined ? s : lead + out + trail;
  }
  const ENT = { '&amp;':'&', '&lt;':'<', '&gt;':'>', '&quot;':'"', '&#39;':"'", '&#x27;':"'", '&nbsp;':' ' };
  function decode(s){ return s.replace(/&(?:amp|lt|gt|quot|nbsp|#39|#x27);/g, e => ENT[e]); }
  function encode(s){ return s.replace(/[&<>]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' })[c]); }
  // Each run of text between tags is matched on its own (a title, a line of speech).
  function html(s){
    return s.replace(/(^|>)([^<]+)(?=<|$)/g, (all, gt, txt) => { const d = decode(txt), r = plain(d); return r === d ? all : gt + encode(r); });
  }
  const TAG = /<\/?[a-z][^>]*>/i;
  function apply(text, ctx){
    if(!active || typeof text !== 'string' || !text) return text;
    const asHtml = ctx === true || (ctx && typeof ctx === 'object' && 'html' in ctx ? !!ctx.html : TAG.test(text));
    const key = (asHtml ? 'h' : 'p') + text;
    let r = cache.get(key); if(r !== undefined) return r;
    r = asHtml ? html(text) : plain(text);
    if(cache.size > CACHE_MAX) cache.clear();
    cache.set(key, r); return r;
  }
  function applyPlain(text){ return apply(text, { html:false }); }

  /* ── Catch-alls ───────────────────────────────────────────────────────── */
  const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'NOSCRIPT', 'SELECT', 'OPTION']);
  function fixText(node){
    const v = node.data; if(!v || !/[A-Za-z]/.test(v)) return;
    const p = node.parentNode; if(p && (SKIP.has(p.nodeName) || p.isContentEditable)) return;
    const r = applyPlain(v); if(r !== v) node.data = r;
  }
  function walk(node){
    if(!node) return;
    if(node.nodeType === 3){ fixText(node); return; }
    if(node.nodeType !== 1 || SKIP.has(node.nodeName)) return;
    for(let c = node.firstChild; c; c = c.nextSibling) walk(c);
  }
  function startObserver(){
    const doc = root.document; if(!doc || !doc.body || observer || !root.MutationObserver) return;
    walk(doc.body);
    observer = new root.MutationObserver(list => {
      if(!active) return;
      for(const m of list){ if(m.type === 'characterData') fixText(m.target); else for(const n of m.addedNodes) walk(n); }
    });
    observer.observe(doc.body, { childList:true, characterData:true, subtree:true });
  }
  function patchCanvas(){
    for(const name of ['CanvasRenderingContext2D', 'OffscreenCanvasRenderingContext2D']){
      const P = root[name] && root[name].prototype; if(!P || P.__bladefallText) continue;
      for(const k of ['fillText', 'strokeText', 'measureText']){
        const original = P[k]; if(typeof original !== 'function') continue;
        P[k] = function(t, ...rest){ return original.call(this, active && typeof t === 'string' ? applyPlain(t) : t, ...rest); };
      }
      Object.defineProperty(P, '__bladefallText', { value:true });
    }
  }
  function install(){
    const doc = root.document;
    if(installed || !doc || (doc.documentElement && doc.documentElement.getAttribute('data-bf-text') === 'off')) return false;
    installed = true; load(); patchCanvas();
    if(doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', () => { if(active) startObserver(); });
    else if(active) startObserver();
    if(root.addEventListener) root.addEventListener('storage', e => { if(e.key === KEY || e.key === DIALOGUE_KEY) load(); });
    return true;
  }

  /* ── Hand-off format ──────────────────────────────────────────────────── */
  // Export: { format, version, exported, dialogue:{id:text}, text:[{original, edited, file, line, kind, owner}] }
  function exportData(catalog){
    const D = root.BladefallDialogue, store = readStore(), where = new Map();
    for(const e of (catalog && catalog.entries) || []) if(!where.has(e.text)) where.set(e.text, e);
    return { format:FORMAT, version:1, exported:new Date().toISOString(),
      dialogue: D && D.load ? D.load() : {},
      text: [...Object.keys(store.byText).map(o => [o, store.byText[o], false]), ...Object.keys(store.parts).map(o => [o, store.parts[o], true])].map(([o, n, part]) => {
        const e = where.get(o) || {};
        return { original:o, edited:n, fragment:part, file:e.file || null, line:e.line || null, places:e.places || null, kind:e.kind || null, region:e.region || null, owner:e.owner || null }; }) };
  }
  // Accepts this format, a bare {byText}, or the old editor's bare {id:text} dialogue file.
  function importData(raw){
    const D = root.BladefallDialogue, out = { dialogue:0, text:0 };
    if(!raw || typeof raw !== 'object') throw new Error('not an object');
    let ids = null, pairs = null, pieces = null;
    if(raw.format === FORMAT || Array.isArray(raw.text) || raw.dialogue){ ids = raw.dialogue || {}; pairs = {}; pieces = {};
      for(const row of raw.text || []) if(row && typeof row.original === 'string' && typeof row.edited === 'string') (row.fragment ? pieces : pairs)[row.original] = row.edited; }
    else if(raw.byText || raw.parts){ pairs = raw.byText || {}; pieces = raw.parts || {}; }
    else ids = raw;
    if(ids && D){ const safe = D.safeOverrides(ids), merged = Object.assign(D.load(), safe); D.save(merged); out.dialogue = Object.keys(safe).length; }
    if(pairs || pieces){ const now = readStore(), a = clean(pairs), b = clean(pieces);
      save(Object.assign(now.byText, a), Object.assign(now.parts, b)); out.text = Object.keys(a).length + Object.keys(b).length; }
    load(); return out;
  }

  return Object.freeze({ KEY, DIALOGUE_KEY, FORMAT, apply, applyPlain, load, save, overrides, install,
    exportData, importData, isActive: () => active, _plain: plain, _html: html });
});
