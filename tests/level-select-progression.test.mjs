import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source=await readFile(new URL('../public/index.html',import.meta.url),'utf8');

test('Level Select hydrates the constitutional ability prefix earned before each stage',()=>{
  assert.match(source,/function levelSelectCapabilitiesForStage\(stageIndex\)/);
  assert.match(source,/zone\.stageIndex<target/);
  assert.match(source,/sessionCapabilities:opts&&opts\.levelSelect\?levelSelectCapabilitiesForStage/);
  for(const call of [
    'placementPlan(activeCapabilityProgress()',
    'sanitizeMouths(activeCapabilityProgress()',
    'sanitizeWeapon(activeCapabilityProgress()',
    'attackEligibility(activeCapabilityProgress()',
  ])assert.ok(source.includes(call),call);
});

