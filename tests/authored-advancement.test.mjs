import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');

test('the retired random level-up loop has no runtime or HUD entry point', () => {
  assert.doesNotMatch(source, /id="xpFill"/);
  assert.doesNotMatch(source, /id="lvlBadge"/);
  assert.doesNotMatch(source, /UPGRADE_POOL|function openLevelUp|queueLevelUp/);
  assert.doesNotMatch(source, /G\.p\.xp\s*\+=|\+['"] XP/);
  assert.match(source, /Ordinary kills feed authored materials/);
});

test('undiscovered movement inputs remain silent while still recording diagnostics', () => {
  const start = source.indexOf('function lockedMovementFeedback(action)');
  const end = source.indexOf('function recordMovementUse(action)', start);
  const body = source.slice(start, end);
  assert.match(body, /movementDiagnostics\.blocked/);
  assert.doesNotMatch(body, /addText|SFX\./);
});

test('charged attacks require Focus in both the input and combat authorities', () => {
  assert.match(source, /const focusReady=hasWeaponTechnique\('focus'\)/);
  assert.match(source, /charged=chargeMod>1&&hasWeaponTechnique\('focus'\)/);
  assert.match(source, /BFWeaponProgressionModule\.migrateTechniques\(meta\.weaponTechniques\)/);
});

