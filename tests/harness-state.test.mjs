import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
const harness = await readFile(new URL('../public/bladefall-harness.js', import.meta.url), 'utf8');

test('the TAS snapshot refuses functions, so entity state must not carry any', () => {
  // This is the rule that made the bug expensive: saveState() throws rather than
  // silently dropping a function, so one function on one entity takes the whole
  // branching facility down for that level.
  assert.match(harness, /if \(typeof item === 'function' \|\| typeof item === 'symbol'\) throw new Error\('Unsupported TAS state value'\);/);
});

test('an elite enemy stores only its affix data, never the affix function', () => {
  // ELITE_AFFIX rows still hold f; it is applied once at spawn.
  assert.match(source, /const ELITE_AFFIX=\{/);
  const table = source.slice(source.indexOf('const ELITE_AFFIX={'), source.indexOf('/* Combat */'));
  for (const affix of ['savage', 'bulwark', 'swift', 'volatile']) {
    assert.match(table, new RegExp(`${affix}:\\{n:'[^']+',c:'#[0-9a-f]+',f:e=>`), `${affix} still declares its effect`);
  }
  // But the entity copy must be data only. Object.assign({key:k},ELITE_AFFIX[k])
  // copied f onto e.elite and broke saveState() on every level that rolled one.
  assert.doesNotMatch(source, /e\.elite=Object\.assign\(\{key:k\},ELITE_AFFIX\[k\]\)/);
  assert.match(source, /const affix=ELITE_AFFIX\[k\];\n\s*e\.elite=\{key:k,n:affix\.n,c:affix\.c\};\n\s*affix\.f\(e\);/);

  // Nothing reads the function back off the entity, so dropping it changes no
  // behaviour; the renderer only ever wants the name and colour.
  assert.doesNotMatch(source, /e\.elite\.f|enemy\.elite\.f/);
  assert.match(source, /e\.elite\.c/);
  assert.match(source, /e\.elite\.n/);
});
