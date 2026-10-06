#!/usr/bin/env node
/* Writes the owner's Dialogue Editor edits back into the source.
   Usage: node scripts/apply-text-edits.mjs <bladefall-text-edits.json> [--write]
   Without --write it only reports what it would change.

   The file is the editor's Export JSON: { dialogue:{id:text}, text:[{original, edited, file, line, places}] }.
   - dialogue ids: the `text:` of that entry in public/bladefall-dialogue.js.
   - text edits: the original is looked for inside string literals in each file it came from. It is
     replaced when it occurs exactly once near the recorded line (±60 lines) or exactly once in the
     file; anything else is listed as needing a hand edit (it moved, it is assembled from pieces, or
     it appears several times). Quotes and backslashes are escaped for each literal's own quote style.
   Afterwards: node --check the files, run the tests, then node scripts/build-text-catalog.mjs. */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lex } from './build-text-catalog.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [input, flag] = process.argv.slice(2);
if(!input){ console.error('usage: node scripts/apply-text-edits.mjs <export.json> [--write]'); process.exit(2); }
const write = flag === '--write';
const data = JSON.parse(readFileSync(resolve(input), 'utf8'));
const files = new Map(); const get = f => { if(!files.has(f)) files.set(f, readFileSync(resolve(ROOT, f), 'utf8')); return files.get(f); };
const escapeFor = (s, q) => s.replace(/\\/g, '\\\\').replace(new RegExp(q === '`' ? '`|\\$\\{' : q, 'g'), m => '\\' + m).replace(/\n/g, '\\n');
const done = [], manual = [];

/* Literal spans in a file: [start, end, quote, raw] (index.html: its inline scripts only). */
function literals(src, file){
  const spans = [];
  const scan = (code, offset) => {
    // re-lex to get raw positions: lex() reports `start` for strings/templates relative to `code`
    for(const t of lex(code)) if((t.type === 'str' || t.type === 'tpl') && t.start != null){
      const q = t.type === 'str' ? t.quote : '`', begin = offset + t.start + 1;
      spans.push([begin, begin + t.raw.length, q, t.raw, t.line]); }
  };
  if(file.endsWith('.html')){ const re = /<script([^>]*)>([\s\S]*?)<\/script>/gi; let m;
    while((m = re.exec(src))){ if(/\bsrc=/.test(m[1])) continue; const offset = m.index + m[0].indexOf('>') + 1, lineOffset = src.slice(0, offset).split('\n').length - 1;
      const before = spans.length; scan(m[2], offset); for(let k = before; k < spans.length; k++) spans[k][4] += lineOffset; } }
  else scan(src, 0);
  return spans;
}
function replaceIn(file, original, edited, line){
  const src = get(file), spans = literals(src, file), hits = [];
  for(const [a, b, q, raw, l] of spans){ const needle = escapeFor(original, q); let i = raw.indexOf(needle);
    while(i >= 0){ hits.push({ at:a + i, len:needle.length, q, line:l }); i = raw.indexOf(needle, i + needle.length); } }
  const near = line ? hits.filter(h => Math.abs(h.line - line) <= 60) : [];
  const pick = near.length === 1 ? near[0] : hits.length === 1 ? hits[0] : null;
  if(!pick) return hits.length ? `${hits.length} places match — edit by hand` : 'not found in a string literal (moved, or assembled from pieces)';
  files.set(file, src.slice(0, pick.at) + escapeFor(edited, pick.q) + src.slice(pick.at + pick.len)); return null;
}
for(const [id, text] of Object.entries(data.dialogue || {})){
  const f = 'public/bladefall-dialogue.js', src = get(f), key = src.indexOf("'" + id + "'");
  const m = key < 0 ? null : /text:(['"])((?:\\.|(?!\1).)*)\1/.exec(src.slice(key));
  if(!m){ manual.push(`${f}  id ${id}: entry not found`); continue; }
  const at = key + m.index + 5 + 1, q = m[1];
  files.set(f, src.slice(0, at) + escapeFor(text, q) + src.slice(at + m[2].length)); done.push(`${f}  id ${id}`);
}
for(const row of data.text || []){
  const places = row.places && row.places.length ? row.places : row.file ? [{ file:row.file, line:row.line }] : [];
  if(!places.length){ manual.push(`(unknown file)  "${row.original}"`); continue; }
  for(const p of places){ const why = replaceIn(p.file, row.original, row.edited, p.line);
    (why ? manual : done).push(`${p.file}:${p.line || '?'}  "${row.original.slice(0, 60)}"${why ? ' — ' + why : ''}`); }
}
if(write) for(const [f, s] of files) writeFileSync(resolve(ROOT, f), s);
console.log((write ? 'Changed' : 'Would change') + ` ${done.length}:\n  ` + done.join('\n  '));
if(manual.length) console.log(`Needs a hand edit (${manual.length}):\n  ` + manual.join('\n  '));
