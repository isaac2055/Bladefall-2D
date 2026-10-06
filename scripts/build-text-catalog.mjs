#!/usr/bin/env node
/* Builds public/bladefall-text-catalog.js: every player-readable string in the game, with the
   file and line it comes from, what kind of text it is, who owns or says it, and its region.
   The Dialogue Editor lists this catalog; public/bladefall-text.js applies edits at runtime.

   Sources: the runtime scripts index.html loads (its <script src> tags, in order), index.html's
   inline scripts, and index.html's static markup. A small JS lexer (strings, templates,
   comments, regex literals) walks each file; a string is kept when it sits in a display context
   (a text key such as dialogue:/text:/label:, or an argument to toast(), say(),
   showOutskirtsAnnotation(), addText(), fillText() …) or when it reads as prose. Strings with
   HTML are split at their tags, since the game matches each run of text between tags.
   BladefallDialogue's ENTRIES keep their ids (edits to them are stored by id).

   Usage: node scripts/build-text-catalog.mjs [--check]   (--check: exit 1 if the file is stale) */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUB = resolve(ROOT, 'public');
const OUT = resolve(PUB, 'bladefall-text-catalog.js');
const require = createRequire(import.meta.url);

/* ── Lexer ───────────────────────────────────────────────────────────── */
const KEYWORD_BEFORE_REGEX = /^(return|typeof|instanceof|in|of|new|delete|void|throw|case|do|else|yield|await)$/;
function cook(raw, quote){
  try{ return Function('"use strict";return (' + quote + raw + quote + ');')(); }catch(_e){ return null; }
}
export function lex(src){
  const toks = []; let i = 0, line = 1; const n = src.length; const braces = []; let tplSeq = 0; const tplStack = [];
  const last = () => { for(let k = toks.length - 1; k >= 0; k--) return toks[k]; return null; };
  const regexOk = () => { const t = last(); if(!t) return true;
    if(t.type === 'num' || t.type === 'str' || t.type === 'tpl' || t.type === 'regex') return false;
    if(t.type === 'name') return KEYWORD_BEFORE_REGEX.test(t.value);
    return !/^[)\]}]$/.test(t.value); };
  function readTemplate(startLine, id, first){
    // reads from i (just after ` or }) to the closing ` or ${ ; emits a tpl chunk
    let raw = '', l = startLine; const s = i;
    while(i < n){ const c = src[i];
      if(c === '\\'){ raw += c + src[i + 1]; if(src[i + 1] === '\n') line++; i += 2; continue; }
      if(c === '`'){ i++; toks.push({ type:'tpl', raw, value:cook(raw, '`'), line:l, tpl:id, end:true, first, start:s }); return 'end'; }
      if(c === '$' && src[i + 1] === '{'){ i += 2; toks.push({ type:'tpl', raw, value:cook(raw, '`'), line:l, tpl:id, end:false, first, start:s }); return 'expr'; }
      if(c === '\n') line++;
      raw += c; i++;
    }
    return 'end';
  }
  while(i < n){
    const c = src[i];
    if(c === '\n'){ line++; i++; continue; }
    if(c === ' ' || c === '\t' || c === '\r') { i++; continue; }
    if(c === '/' && src[i + 1] === '/'){ while(i < n && src[i] !== '\n') i++; continue; }
    if(c === '/' && src[i + 1] === '*'){ const e = src.indexOf('*/', i + 2); const body = src.slice(i, e < 0 ? n : e + 2); line += (body.match(/\n/g) || []).length; i = e < 0 ? n : e + 2; continue; }
    if(c === '\'' || c === '"'){
      const l = line, s = i; let j = i + 1, raw = '';
      while(j < n && src[j] !== c){ if(src[j] === '\\'){ raw += src[j] + src[j + 1]; if(src[j + 1] === '\n') line++; j += 2; continue; } if(src[j] === '\n') break; raw += src[j]; j++; }
      i = j + 1; toks.push({ type:'str', raw, value:cook(raw, c), line:l, quote:c, start:s }); continue;
    }
    if(c === '`'){ i++; const id = ++tplSeq; const r = readTemplate(line, id, true); if(r === 'expr'){ braces.push('tpl'); tplStack.push(id); } continue; }
    if(c === '/' && regexOk()){
      let j = i + 1, cls = false;
      while(j < n){ const d = src[j]; if(d === '\\'){ j += 2; continue; } if(d === '\n') break; if(d === '[') cls = true; else if(d === ']') cls = false; else if(d === '/' && !cls) break; j++; }
      j++; while(j < n && /[a-z]/i.test(src[j])) j++;
      toks.push({ type:'regex', value:src.slice(i, j), line }); i = j; continue;
    }
    if(/[A-Za-z_$À-￿]/.test(c)){ let j = i + 1; while(j < n && /[\w$À-￿]/.test(src[j])) j++; toks.push({ type:'name', value:src.slice(i, j), line }); i = j; continue; }
    if(/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1]))){ let j = i + 1; while(j < n && /[\w.]/.test(src[j])) j++; toks.push({ type:'num', value:src.slice(i, j), line }); i = j; continue; }
    if(c === '{'){ braces.push('{'); toks.push({ type:'punc', value:'{', line }); i++; continue; }
    if(c === '}'){
      const top = braces.pop();
      if(top === 'tpl'){ i++; const id = tplStack.pop(); const r = readTemplate(line, id, false); if(r === 'expr'){ braces.push('tpl'); tplStack.push(id); } continue; }
      toks.push({ type:'punc', value:'}', line }); i++; continue;
    }
    const three = src.slice(i, i + 3), two = src.slice(i, i + 2);
    const op = ['===', '!==', '**=', '...', '>>>', '<<=', '>>=', '&&=', '||=', '??='].includes(three) ? three
      : ['=>', '==', '!=', '<=', '>=', '&&', '||', '??', '?.', '++', '--', '+=', '-=', '*=', '/=', '%=', '<<', '>>', '|=', '&=', '^='].includes(two) ? two : c;
    toks.push({ type:'punc', value:op, line }); i += op.length;
  }
  return toks;
}

/* ── Context walk ────────────────────────────────────────────────────── */
const TEXT_KEYS = new Map(Object.entries({
  dialogue:'dialogue', revisitDialogue:'dialogue', musterDialogue:'dialogue', armedDialogue:'dialogue', greeting:'dialogue',
  ask:'dialogue', thanks:'dialogue', found:'dialogue', line:'dialogue', citadelLine:null, opening:'dialogue', accept:'dialogue',
  question:'reply', discussion:'dialogue', ready:'dialogue', ending:'dialogue', longEnding:'dialogue', refusal:'dialogue',
  after:'dialogue', afterHarsh:'narration', burnLine:'dialogue', harsh:'reply', short:'reply', forks:'dialogue',
  offer:'dialogue', active:'dialogue', turnIn:'dialogue', complete:'dialogue', intro:'quest', responses:'dialogue',
  good:'narration', bad:'narration', danger:'bark', death:'notice', rescue:'notice', keeper:'name', name:'name', title:'title',
  subtitle:'title', text:'text', body:'text', html:'text', description:'description', desc:'description', detail:'task',
  label:'label', hint:'hint', prompt:'prompt', message:'notice', msg:'notice', caption:'text', card:'text', note:'text',
  lore:'description', summary:'text', tagline:'text', objective:'task', reveal:'text', clue:'text', evidence:'narration',
  occupation:'title', questTitle:'title', questItem:'name', resolutions:'reply', banner:'title', heading:'title', words:'text',
}));
const DISPLAY_CALLS = [
  [/^(?:\w+\.)*toast$/, 'toast'], [/^showStationNotice$/, 'notice'], [/^addText$/, 'hud'], [/^showOutskirtsAnnotation$/, 'annotation'],
  [/^(?:kit\.)?say$/, 'dialogue'], [/^inspect$/, 'description'], [/^panel$/, 'dialogue'], [/^openFieldConversation$/, 'dialogue'],
  [/^(?:\w+\.)*show$/, 'dialogue'], [/^showOvHTML$/, 'card'], [/^(?:\w+\.)*fillText$/, 'canvas'], [/^(?:\w+\.)*strokeText$/, 'canvas'],
  [/^task$/, 'task'], [/^LoreMarker$/, 'description'], [/^c$/, 'reply'], [/^publish$/, null], [/^card$/, 'card'],
  [/^(?:\w+\.)*(textContent|innerText)$/, 'ui'], [/^playCutscene$/, 'narration'], [/^confirm$/, 'ui'], [/^alert$/, 'ui'],
];
const NON_DISPLAY_CALL = /^(console\.\w+|errors\.push|assert\w*|Error|TypeError|RangeError|RegExp|require|import|fetch|postMessage|.*\.(getElementById|querySelector|querySelectorAll|closest|matches|addEventListener|removeEventListener|setAttribute|getAttribute|removeAttribute|hasAttribute|setProperty|getPropertyValue|getItem|setItem|removeItem|match|matchAll|replace|replaceAll|split|test|exec|includes|startsWith|endsWith|indexOf|lastIndexOf|join|padStart|padEnd|toggle|add|remove|contains|createElement|createElementNS|getContext|play|load|open|keys|has|get|set|delete|find|filter|some|every|map|forEach|reduce|localeCompare|stringify|parse|register|latch|dispatchEvent|registerEcho|circuitOpen|push|unshift|concat|put|match)|hasCapability|circuitOpen|persistentCircuitOpen|markPersistentCircuitOpen|recordQuestEvent|kbCode|keyLabel|grantJourneyGift|grantJourneyReward|stageId|zoneFor|latch|gtag|define|Symbol|getComputedStyle|matchMedia|new|activateRuntimeCheckpoint|grantPermanentCapability|playMusic|SFX\.\w+|music\w*|loadTrack|setTrack|cue|BFPresentation\.publish|publish|emit|on|off|once|trigger|localStorage\.\w+|sessionStorage\.\w+|Object\.\w+|Array\.\w+|JSON\.\w+|Math\.\w+|Number|String|parseInt|parseFloat|encodeURIComponent|decodeURIComponent|atob|btoa|setTimeout|setInterval|requestAnimationFrame|structuredClone)$/;
const NON_DISPLAY_KEYS = /^(reason|error|errors|why|repair|id|ids|type|t|kind|key|k|sfx|src|url|href|color|accent|fill|stroke|font|role|residentId|profileId|questActor|actId|zone|zoneId|stageId|target|capability|circuitId|zoneEntityId|silhouette|scene|arche|slot|rarity|toolId|mode|state|st|dir|face|sound|music|track|cue|anim|layer|shape|icon|className|cls|css|style|pattern|format|schema|path|file|event|action|value|symptom|reality|clarity|relic|memoryId|clockId|rank|boss|biome|theme|palette|filter|shopId|shopKey|giver|payload|route|bearingName|connector|restSiteAnchor|physicalSeam|physicalExit|keepReturn|sideStory|sideStoryRole|task|phase|node|resolution|flag|gift|reward|interaction|lesson|beat|beatId|courtAction|courtRoom|authoringOwner|authoringRoom|searcherSign|routeReveal|ownerId|region|kindName|unlock|requires|excludes|contract|selectTag|scriptId|cueId|audio|img|image|sprite|frame|anchor|tag|tags|level|stage|source|origin|group|category|shortcut|mouth|side|variant|motif|preset|ease|align|textAlign|textBaseline|globalCompositeOperation|lineCap|lineJoin|direction|position|display|visibility|overflow|cursor|pointerEvents|zIndex|transform|transition|animation|background|border|margin|padding|width|height|minWidth|maxWidth|top|left|right|bottom|opacity|content|outline|boxShadow|textShadow|fontFamily|fontWeight|fontSize|lineHeight|letterSpacing|whiteSpace|textTransform|accentColor)$/;
const CTRL = /^(if|for|while|switch|catch|function|return|typeof|with)$/;

/* Region names from the campaign, so the editor can group by where text is met. */
function stageNames(){
  const hadWindow = 'window' in globalThis;
  try{ if(!hadWindow) globalThis.window = globalThis; const m = require(resolve(PUB, 'bladefall-campaign.js'));
    return (globalThis.BladefallCampaign || m).stageCatalog().map(s => s.name); }
  catch(_e){ return []; }
  finally{ if(!hadWindow) delete globalThis.window; }
}
const STAGE = stageNames();
const stageLabel = i => (Number.isInteger(i) && STAGE[i] && STAGE[i] !== '(cut)') ? String(i).padStart(2, '0') + ' · ' + STAGE[i] : null;
const FILE_REGION = [
  [/landing-shores/, 17], [/colony-art|bladefall-colony\.js/, 18], [/palace-path/, 19], [/sunspire/, 20], [/cloaked-man/, 43],
  [/causeway-story/, 2], [/fractured-outskirts/, 21], [/fractured-woods/, 22], [/fractured-updrafts/, 23], [/fractured-marksman/, 24],
  [/fractured-causeway/, 25], [/fractured-keep/, 26], [/fractured-warden/, 27], [/fractured-frostfell/, 28], [/fractured-sorcerer/, 29],
  [/fractured-emberdeep/, 30], [/fractured-colossus/, 31], [/fractured-inversion/, 32], [/fractured-tyrant/, 33], [/fractured-king/, 34],
  [/fractured-line/, 35], [/fractured-cliffs/, 36], [/fractured-shores/, 37], [/fractured-colony/, 38], [/fractured-path/, 39], [/fractured-palace/, 40],
];
const FILE_GROUP = [
  [/act-two/, 'Act Two (shared)'], [/fractured(-art)?\.js$/, 'Act Three (shared)'], [/celeste/, 'Celeste courses'], [/rift-shards/, 'Rift shards'],
  [/conversation/, 'Voices (reply choices)'], [/cinematics/, 'Cinematics'], [/quests/, 'Quests'], [/shops/, 'Shops'], [/side-stor/, 'Side stories'],
  [/opening-stories|early-platforming/, 'The opening'], [/dialogue\.js$/, 'Dialogue entries'],
];
const INDEX_LEVEL_CONST = { UPDRAFTS:3, HOLLOW_MARKSMAN:4, FROSTFELL:7, RUINED_KEEP:5, WARDEN:6, INVERSION:11, VOID_TYRANT:12, SECRET:15, WHITE_COURT:8, FOUNDRY:10, EMBERDEEP:9, ABYSS_KING:13 };
/* Is this string something a player reads? */
const IGNORE = new Set(['use strict']);
function prose(s){ return /[a-z]{2,}/i.test(s) && (/\s/.test(s.trim()) || /[.!?…”’]$/.test(s.trim())) && !/^[\w$.\-\/:#%?=&]+$/.test(s); }
function codeLike(s){
  const t = s.trim();
  if(!/[A-Za-z]/.test(t)) return true;
  if(/[<>]|=["']|\bstyle=|\bclass=/.test(t)) return true;                        // pieces of markup
  if(/^[a-z0-9_$.:\/-]+$/.test(t)) return true;                                  // lower-case ids
  if(/^(#|rgba?\(|hsla?\()/.test(t) || /^\d/.test(t) && !/\s[a-z]/i.test(t)) return true;
  if(/[{};]\s*$/.test(t) && /:/.test(t)) return true;                           // CSS
  if(/^[\w-]+\s*:\s*[^\s].*;/.test(t)) return true;                             // css declarations
  if(/(^|\s)(px|em|rem|vh|vw)\b/.test(t) && /\d(px|em|rem|vh|vw)/.test(t) && !/[.!?]$/.test(t)) return true;
  if(/^\.?\/?[\w\-]+(\.[\w]+)+(\?.*)?$/.test(t)) return true;                  // file names
  if(/^[a-z]+(-[a-z0-9]+)+$/.test(t) || /^[a-z]+[A-Z]\w*$/.test(t)) return true;  // ids, camelCase
  if(/^[a-z_$][\w$]*(\.[\w$]+)+$/.test(t)) return true;                         // member paths
  if(/^(bold|normal|italic|\d{3})?\s*\d+px/.test(t) || /sans-serif|monospace|system-ui|Georgia,/.test(t)) return true;   // canvas fonts
  if(/=>|function\s*\(|\bconst\b|\bvar\b|\breturn\b.*;/.test(t)) return true;
  if(/^(click|keydown|keyup|pointerdown|pointerup|touchstart|touchend|resize|visibilitychange|load|error|input|change|submit)$/.test(t)) return true;
  return false;
}
function segmentsOf(value){
  let v = value;
  // A literal may start inside a tag (">TITLE") or end inside one ("<b style=\"color:"); cut those off.
  const firstClose = v.indexOf('>'), firstOpen = v.indexOf('<');
  if(firstClose >= 0 && (firstOpen < 0 || firstClose < firstOpen) && /^[^\s<>]*["']?$/.test(v.slice(0, firstClose))) v = '\u0000' + v.slice(firstClose + 1);
  const lastOpen = v.lastIndexOf('<'), lastClose = v.lastIndexOf('>');
  if(lastOpen >= 0 && lastOpen > lastClose) v = v.slice(0, lastOpen) + '\u0000';
  if(v === value && !/<\/?[a-z][^>]*>/i.test(value)) return [value];
  return v.replace(/<br\s*\/?>/gi, '\u0000').replace(/<[^>]*>/g, '\u0000').split('\u0000')
    .map(s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, '\'').replace(/&nbsp;/g, ' '))
    .map(s => s.trim()).filter(Boolean);
}

function scan(src, file, lineOffset, regionOf, out){
  const toks = lex(src);
  const stack = [{ type:'root', q:0, keys:{} }]; // frames: {type:'root'|'('|'['|'{', callee, arg, key, q, keys:{}, assign}
  let fnName = null, pendingRegion = null; const fnAt = [];
  const sig = k => toks[k];
  for(let k = 0; k < toks.length; k++){
    const t = toks[k];
    if(t.type === 'name' && t.value === 'function' && toks[k + 1] && toks[k + 1].type === 'name'){ fnName = toks[k + 1].value; fnAt.push(fnName); }
    // index.html's level data: const X_LEVEL={…} and const LEVELS=[{stage 0},{stage 1},{stage 2}]
    if(t.type === 'name' && sig(k - 1) && /^(const|let|var)$/.test(sig(k - 1).value) && sig(k + 1) && sig(k + 1).value === '='){
      const lv = /^([A-Z_]+)_LEVEL$/.exec(t.value);
      pendingRegion = t.value === 'LEVELS' ? 'array' : lv ? (INDEX_LEVEL_CONST[lv[1]] != null ? stageLabel(INDEX_LEVEL_CONST[lv[1]]) : lv[1] === 'BONUS' ? 'Bonus stage' : null) : null;
    }
    if(t.type === 'punc'){
      const top = stack[stack.length - 1];
      if(t.value === '('){
        // callee: name(.name)* before, unless a control keyword
        let callee = null, j = k - 1;
        if(sig(j) && sig(j).type === 'name' && !CTRL.test(sig(j).value)){ const parts = [sig(j).value]; j--;
          while(sig(j) && sig(j).value === '.' && sig(j - 1) && sig(j - 1).type === 'name'){ parts.unshift(sig(j - 1).value); j -= 2; }
          callee = parts.join('.'); if(sig(j) && sig(j).value === 'function') callee = null; }
        else if(sig(j) && sig(j).value === '=' && sig(j - 1) && sig(j - 1).type === 'name' && /^(textContent|innerText|innerHTML)$/.test(sig(j - 1).value)) callee = sig(j - 1).value;
        stack.push({ type:'(', callee, arg:0, q:0 });
      }else if(t.value === '['){ stack.push({ type:'[', arg:0, q:0, levelArray:pendingRegion === 'array' }); pendingRegion = null; }
      else if(t.value === '{'){ const parent = stack[stack.length - 1];
        stack.push({ type:'{', key:null, q:0, keys:{}, region:pendingRegion && pendingRegion !== 'array' ? pendingRegion : parent && parent.levelArray ? stageLabel(parent.arg || 0) : null }); pendingRegion = null; }
      else if(t.value === ')' || t.value === ']' || t.value === '}'){ if(stack.length > 1) stack.pop(); }
      else if(t.value === ',' && top){ top.arg = (top.arg || 0) + 1; top.q = 0; top.assign = null; if(top.type === '{') top.key = null; }
      else if(t.value === '=' && top && sig(k - 1) && sig(k - 1).type === 'name'){ top.assign = sig(k - 1).value; }
      else if(t.value === '?' && top){ top.q++; }
      else if(t.value === ':' && top && top.q > 0){ top.q--; }
      else if(t.value === ';' && top){ top.assign = null; if(top.type === '{') top.key = null; }
      continue;
    }
    // object keys: (name|str|num) followed by ':' at an object frame with no pending ternary
    const top = stack[stack.length - 1];
    if((t.type === 'name' || t.type === 'str' || t.type === 'num') && toks[k + 1] && toks[k + 1].value === ':' && top && top.type === '{' && top.q === 0){
      top.key = t.type === 'str' ? t.value : t.value; k++; continue;
    }
    // assignment of a text property: x.textContent='...' / x.innerHTML=`...`
    if(t.type !== 'str' && t.type !== 'tpl') continue;
    const value = t.value; if(typeof value !== 'string' || !value.trim()) continue;
    // context
    let key = null, keyFrame = null, call = null, callArg = null, inArray = false, owner = null, speaker = null, stageIdx = null, frameRegion = null;
    for(let s = stack.length - 1; s >= 0 && !frameRegion; s--) frameRegion = stack[s].region || null;
    const inner = stack[stack.length - 1], outer = stack[stack.length - 2];
    const pair = inner.type === '[' && outer && outer.type === '[' ? inner.arg || 0 : null;   // [[label, reply], …]
    if(inner.assign && TEXT_KEYS.has(inner.assign)) key = inner.assign;
    for(let s = stack.length - 1; s >= 0; s--){
      const f = stack[s];
      if(f.type === '[') inArray = true;
      if(f.type === '{' && key === null && f.key){ key = f.key; keyFrame = f; }
      if(f.type === '{'){ if(!owner && (f.keys.name || f.keys.title || f.keys.id)) owner = f.keys.name || f.keys.title || f.keys.id; if(!speaker && (f.keys.speaker || f.keys.name || f.keys.keeper)) speaker = f.keys.speaker || f.keys.name || f.keys.keeper;
        if(stageIdx === null && Number.isInteger(f.keys.stage)) stageIdx = f.keys.stage; if(stageIdx === null && Number.isInteger(f.keys.stageIndex)) stageIdx = f.keys.stageIndex; }
      if(f.type === '(' && !call && f.callee){ call = f.callee; callArg = f.arg; if(key === null) break; }
    }
    // remember identifying keys on the innermost object for later siblings
    if(top && top.type === '{' && top.key && /^(id|name|title|speaker|keeper)$/.test(top.key) && t.type === 'str') top.keys[top.key] = value;
    const prevT = toks[k - 1], nextT = toks[k + 1];
    const fragment = (prevT && prevT.value === '+') || (nextT && nextT.value === '+') || (t.type === 'tpl' && !(t.first && t.end));
    // classify
    let kind = null, display = false;
    if(key && NON_DISPLAY_KEYS.test(key) && !prose(value)) continue;
    if(key && TEXT_KEYS.has(key)){ kind = TEXT_KEYS.get(key); display = kind !== null; if(kind === null) continue; }
    if(!kind && call){
      if(NON_DISPLAY_CALL.test(call) && !(call.endsWith('.push') && /queue|lines|beats|cards/.test(call))) continue;
      for(const [re, kd] of DISPLAY_CALLS) if(re.test(call)){ kind = kd; display = kd !== null; break; }
    }
    if(!kind && /^(textContent|innerText|innerHTML)$/.test(String(call))) { kind = 'ui'; display = true; }
    if(pair !== null && (display || /conversation|rift-shards|act-two|colony|landing|sunspire|side-stor/.test(file) || key === 'forks' || key === 'responses')){ kind = pair === 0 ? 'reply' : 'dialogue'; display = true;
      if(!speaker && key && /conversation/.test(file)) speaker = key.charAt(0).toUpperCase() + key.slice(1); }
    void keyFrame; void callArg;
    for(const piece of segmentsOf(value)){
      const seg = fragment ? piece.replace(/^[\s·:—–|,+]+|[\s·:—–|,+]+$/g, '') : piece;
      if(!/[A-Za-z]/.test(seg) || IGNORE.has(seg)) continue;
      const isProse = prose(seg);
      if(codeLike(seg) && !(display && /^[A-Z“"‘(][^_]*$/.test(seg))) continue;
      if(!display && !isProse) continue;
      if(!display && /^[A-Z][A-Z0-9_]*$/.test(seg)) continue;
      if(seg.length < 2) continue;
      let k2 = kind || (/^“[\s\S]*”$/.test(seg) ? 'dialogue' : 'text');
      if(/^“/.test(seg) && (k2 === 'text' || k2 === 'annotation' || k2 === 'description')) k2 = 'dialogue';
      out.push({ text:seg, kind:k2, file, line:t.line + lineOffset, region:(Number.isInteger(stageIdx) && stageLabel(stageIdx)) || frameRegion || regionOf(t.line + lineOffset), owner:owner || fnAt.at(-1) || null, speaker:speaker || null, fragment:!!fragment });
    }
  }
}

/* Static text in index.html's markup (menus, title screen, help). */
function scanMarkup(html, out){
  const masked = html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, m => m.replace(/[^\n]/g, ' ')).replace(/<!--[\s\S]*?-->/g, m => m.replace(/[^\n]/g, ' '));
  const re = />([^<>]+)</g; let m;
  while((m = re.exec(masked))){
    const raw = m[1]; if(!/[A-Za-z]{2,}/.test(raw)) continue;
    const text = raw.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, '\'').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    if(!text || codeLike(text) && !/^[A-Z]/.test(text)) continue;
    const line = masked.slice(0, m.index).split('\n').length;
    out.push({ text, kind:'menu', file:'public/index.html', line, region:'Menus', owner:null, speaker:null, fragment:false });
  }
}

export function build(){
  const index = readFileSync(resolve(PUB, 'index.html'), 'utf8');
  const out = [];
  // 1. BladefallDialogue entries keep their ids.
  const dialogueSrc = readFileSync(resolve(PUB, 'bladefall-dialogue.js'), 'utf8');
  const D = require(resolve(PUB, 'bladefall-dialogue.js'));
  const dialogueKinds = { npc:'dialogue', sign:'sign', item:'description', object:'description', ui:'notice' };
  for(const row of D.catalog()){
    const at = dialogueSrc.indexOf('\'' + row.id + '\''), line = at < 0 ? null : dialogueSrc.slice(0, at).split('\n').length;
    out.push({ text:row.text, kind:dialogueKinds[row.type] || row.type, file:'public/bladefall-dialogue.js', line, region:stageLabel(row.level) || 'General', owner:row.speaker, speaker:row.type === 'npc' ? row.speaker : null, fragment:false, id:row.id });
  }
  // 2. index.html inline scripts.
  const scriptRe = /<script([^>]*)>([\s\S]*?)<\/script>/gi; let m; const files = [];
  while((m = scriptRe.exec(index))){
    const attrs = m[1]; const src = /\bsrc=["']([^"'?]+)/.exec(attrs);
    if(src){ files.push(src[1]); continue; }
    if(/type=["']?(application\/json|text\/template)/.test(attrs)) continue;
    const startLine = index.slice(0, m.index + m[0].indexOf('>') + 1).split('\n').length - 1;
    scan(m[2], 'public/index.html', startLine, () => 'General', out);
  }
  scanMarkup(index, out);
  // 3. The runtime modules, in load order.
  // Engine-only modules (save repair, streaming, authoring audits) show nothing to the player.
  const SKIP = /^(littlejs\.min|peerjs\.min|bladefall-dialogue|bladefall-text|bladefall-text-catalog|bladefall-harness|bladefall-foundation-audit|bladefall-authoring|bladefall-charters|bladefall-release|bladefall-streaming)\.js$/;
  for(const f of files){
    if(SKIP.test(f) || !existsSync(resolve(PUB, f))) continue;
    const src = readFileSync(resolve(PUB, f), 'utf8');
    let region = null; for(const [re, st] of FILE_REGION) if(re.test(f)){ region = stageLabel(st); break; }
    if(!region) for(const [re, g] of FILE_GROUP) if(re.test(f)){ region = g; break; }
    scan(src, 'public/' + f, 0, () => region || 'General', out);
  }
  // Merge duplicates: one entry per text (edits are keyed by text), every place kept.
  const byText = new Map(), idTexts = new Set(out.filter(e => e.id).map(e => e.text));
  for(const e of out){
    if(!e.id && idTexts.has(e.text)) continue;          // the id entry already owns this text
    const k = e.id ? 'id:' + e.id : e.text, have = byText.get(k);
    if(have){ if(!have.places.some(p => p[0] === e.file && p[1] === e.line)) have.places.push([e.file, e.line]); if(have.kind === 'text' && e.kind !== 'text') have.kind = e.kind; continue; }
    byText.set(k, { ...e, places:[[e.file, e.line]] });
  }
  return [...byText.values()];
}

function serialise(entries){
  const kinds = [...new Set(entries.map(e => e.kind))].sort(), files = [...new Set(entries.flatMap(e => e.places.map(p => p[0])))].sort(),
    regions = [...new Set(entries.map(e => e.region))].sort();
  const rows = entries.map(e => {
    const row = [e.text, kinds.indexOf(e.kind), regions.indexOf(e.region), e.owner || 0, e.speaker || 0, e.places.map(p => [files.indexOf(p[0]), p[1]]), e.fragment ? 1 : 0];
    if(e.id) row.push(e.id); return row; });
  return `/* GENERATED by scripts/build-text-catalog.mjs — do not edit by hand; run \`node scripts/build-text-catalog.mjs\`.
   Every player-readable string, for the Dialogue Editor. ${entries.length} entries. */
(function(root){
'use strict';
const KINDS=${JSON.stringify(kinds)};
const REGIONS=${JSON.stringify(regions)};
const FILES=${JSON.stringify(files)};
const ROWS=${JSON.stringify(rows).replace(/\],\[/g, '],\n[')};
const entries=ROWS.map((r,i)=>Object.freeze({key:r[7]?'id:'+r[7]:'t:'+r[0],id:r[7]||null,text:r[0],kind:KINDS[r[1]],region:REGIONS[r[2]],owner:r[3]||null,speaker:r[4]||null,
  places:r[5].map(p=>Object.freeze({file:FILES[p[0]],line:p[1]})),file:FILES[r[5][0][0]],line:r[5][0][1],fragment:!!r[6],order:i}));
const api=Object.freeze({count:entries.length,kinds:KINDS,regions:REGIONS,files:FILES,entries:Object.freeze(entries)});
if(typeof module==='object'&&module.exports)module.exports=api;
root.BladefallTextCatalog=api;
})(typeof globalThis!=='undefined'?globalThis:this);
`;
}

if(process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
  const entries = build(), text = serialise(entries);
  if(process.argv.includes('--check')){
    const now = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
    if(now !== text){ console.error('bladefall-text-catalog.js is stale: run node scripts/build-text-catalog.mjs'); process.exit(1); }
    console.log('catalog is current (' + entries.length + ' entries)');
  }else{
    writeFileSync(OUT, text);
    const by = {}; for(const e of entries) by[e.kind] = (by[e.kind] || 0) + 1;
    console.log('wrote ' + OUT.replace(ROOT + '/', '') + ' — ' + entries.length + ' entries');
    console.log(Object.entries(by).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + v).join(', '));
  }
}
