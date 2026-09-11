import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source=await readFile(new URL('../public/index.html',import.meta.url),'utf8');

test('Test Mode triples ground, dash, and jetpack movement while refreshing Dash',()=>{
  assert.match(source,/const testSpeed=meta\.testMode\?3:1/);
  assert.match(source,/runSpeed\*effSpeed\(p\).*\*testSpeed/);
  assert.match(source,/const testDash=meta\.testMode&&!G\.cartMode/);
  assert.match(source,/if\(meta\.testMode\)p\.dodgeCdT=0/);
  assert.match(source,/\(movement\.dash\|\|testDash\)&&p\.dashBuf>0/);
  assert.match(source,/p\.dodgeCdT=meta\.testMode\?0:effDodgeCd\(p\)/);
  assert.match(source,/const JET_CAP=300\*\(meta\.testMode\?3:1\)/);
  assert.match(source,/p\.vy -= 1800 \* \(meta\.testMode\?3:1\)/);
  assert.match(source,/invincible · 3× movement\/jetpack · infinite dash/);
});

test('Test Mode jetpack is a revocable loan and never enters a save snapshot',()=>{
  assert.match(source,/function revokeTestModeLoaner\(player\)/);
  assert.match(source,/hasJetpack:!!p\.hasJetpack&&!p\._tmJet/);
  assert.match(source,/else revokeTestModeLoaner\(p\)/);
  assert.match(source,/if\(!meta\.testMode\)revokeTestModeLoaner\(\)/);
  assert.match(source,/p\._tmJet=false;\s*p\.fuel=p\.hasJetpack\?100:0/);
});
