// THE WHOLE ROAD, from the White Court's Ember Door to the Throne Gate. These are
// the invariants that span regions, so no single region's suite can catch them —
// every one of them was broken at some point by a change two rooms away.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = n => readFile(new URL('../public/' + n, import.meta.url), 'utf8');
const source = await read('index.html');
const recovery = await read('bladefall-recovery.js');
const zones = await read('bladefall-zones.js');
// The late cues live in index.html's LEVEL_MUSIC table, not the audio module.
const audio = source;
const campaign = await read('bladefall-campaign.js');

function fn(name){
  const start = source.indexOf('function ' + name + '(');
  assert.ok(start >= 0, name + ' exists');
  const brace = source.indexOf('{', start); let depth = 0;
  for(let i = brace; i < source.length; i++){
    if(source[i] === '{') depth++;
    else if(source[i] === '}' && --depth === 0) return source.slice(start, i + 1);
  }
  throw Error('unterminated ' + name);
}

// The road, in order, with the direction each region is walked.
const ROAD = [
  { stage: 8,  zone: 'frost-sorcerer', runs: 'east' },
  { stage: 9,  zone: 'emberdeep',      runs: 'east' },
  { stage: 10, zone: 'ember-colossus', runs: 'east' },
  { stage: 11, zone: 'inversion',      runs: 'west' },
  { stage: 12, zone: 'void-tyrant',    runs: 'west' },
];
const CONNECTORS = ['sorcerer-emberdeep', 'emberdeep-colossus', 'colossus-inversion', 'inversion-tyrant', 'tyrant-king'];

test('every seam on the road exists in both directions', () => {
  const spec = fn('physicalSeamSpec');
  // Forward, region by region.
  assert.match(spec, /connector:'emberdeep-colossus',zone:'emberdeep',targetStage:10/);
  assert.match(spec, /connector:'colossus-inversion',zone:'ember-colossus',targetStage:11/);
  assert.match(spec, /connector:'inversion-tyrant',zone:'inversion',targetStage:12/);
  assert.match(spec, /connector:'tyrant-king',zone:'void-tyrant',targetStage:13/);
  // And back.
  assert.match(spec, /connector:'emberdeep-colossus',zone:'ember-colossus',targetStage:9/);
  assert.match(spec, /connector:'inversion-tyrant',zone:'void-tyrant',targetStage:11/);
  // The two vertical returns are height thresholds, not edges — the wind-shaft pattern.
  assert.match(fn('updateInversion'), /beginPhysicalBranchTransition\('colossus-inversion','inversion'/);
  // The White Court's Ember Door and Emberdeep's answer to it are interactions.
  assert.match(source, /courtAction:'emberdeep'/);
  assert.match(source, /courtAction:'emberdeep-return'/);
  assert.match(fn('interactWhiteCourt'), /courtAction==='emberdeep'[\s\S]*?connector:'sorcerer-emberdeep',zone:'frost-sorcerer',targetStage:9/);
});

test('the direction each region is walked is the direction the map draws it', () => {
  const spec = fn('physicalSeamSpec');
  // A region walked EAST leaves by its east edge facing east; one walked WEST leaves
  // by its west edge facing west. Getting this backwards is how a player ends up
  // shoved into the gate they were trying to leave through.
  assert.match(spec, /targetStage:10,\s*warm:G\.p\.x>=G\.levelLength-1400/, 'Emberdeep runs east');
  assert.match(spec, /connector:'inversion-tyrant',zone:'inversion',targetStage:12,\s*warm:G\.p\.x<=1400,\s*cross:G\.p\.x<=62&&G\.p\.face<0/, 'the Inversion runs west');
  assert.match(spec, /connector:'tyrant-king'[\s\S]*?cross:G\.p\.x<=62&&G\.p\.face<0/, 'and so does the Citadel');
  // The two right-to-left regions are ENTERED facing the way they run. A vertical
  // seam's inward vector is horizontal, so it hands back the default +1 and points a
  // player who just fell in at the wall behind them.
  assert.match(fn('compatibilityZoneArrival'),
    /plan\.targetZoneId==='inversion'\|\|plan\.targetZoneId==='void-tyrant'\)face=x>length\/2\?-1:1/);
  // And a failed crossing must nudge off whichever edge the player is on.
  assert.match(fn('updatePhysicalWorldSeams'), /G\.p\.x\+=\(G\.p\.x<\(G\.levelLength\|\|0\)\/2\?1:-1\)\*48/);
});

test('every endpoint on the road lands somewhere a person chose', () => {
  // A side ratio cannot place an arrival in a region with a plateau, a shaft or a
  // diagonal. All eight endpoints are authored.
  const arrival = fn('compatibilityZoneArrival');
  for(const pin of [
    /sorcerer-emberdeep'&&plan\.targetZoneId==='emberdeep'\)\{x=330;y=ED;\}/,
    /sorcerer-emberdeep'&&plan\.targetZoneId==='frost-sorcerer'/,
    /emberdeep-colossus'&&plan\.targetZoneId==='emberdeep'/,
    /colossus-inversion'&&plan\.targetZoneId==='inversion'/,
    /colossus-inversion'&&plan\.targetZoneId==='ember-colossus'/,
    /inversion-tyrant'&&plan\.targetZoneId==='void-tyrant'/,
    /inversion-tyrant'&&plan\.targetZoneId==='inversion'/,
    /tyrant-king'&&plan\.targetZoneId==='abyss-king'/,
  ]) assert.match(arrival, pin, 'an endpoint falls back to a side ratio');
  // Emberdeep arrives on its PLATEAU. A y of 0 there is 640 units inside solid rock.
  assert.match(arrival, /y=ED;/, 'and Emberdeep lands on its datum, not the world floor');
});

test('each verb is paid for at a protected midpoint and required after it', () => {
  const grants = [
    ['companion-command', 'claimEmberMemory',     9,  'emberdeep-colossus'],
    ['downward-strike',   'claimFoundryMemory',   10, 'colossus-inversion'],
    ['gravity-flip',      'claimInversionMemory', 11, 'inversion-tyrant'],
  ];
  const spec = fn('physicalSeamSpec');
  for(const [id, claim, stage, connector] of grants){
    const body = fn(claim);
    assert.match(body, new RegExp("grantPermanentCapability\\('" + id + "'"), `${id} is granted`);
    assert.match(body, new RegExp('G\\.stageIndex!==' + stage), 'in its own region');
    assert.match(body, /activateRuntimeCheckpoint\(/, 'at a point the run can return to');
    assert.doesNotMatch(body, /G\.boss&&G\.boss\.dead/, 'and not withheld until after a fight');
    // And the road past it will not open without it.
    assert.match(spec, new RegExp("connector:'" + connector + "'[\\s\\S]{0,260}?requires:'" + id + "'"),
      `${connector} does not require ${id}`);
  }
  assert.match(fn('updatePhysicalWorldSeams'), /if\(spec\.requires&&!hasCapability\(spec\.requires\)\)return;/,
    'and the requirement is actually enforced');
  // Downward Strike is also what opens the Foundry's floor, and the caps refuse until
  // the machine is down.
  assert.match(fn('shatterBrittle'), /o\.foundryFissureCap&&foundryColossusStanding\(\)/);
});

test('a region’s rest site is where its level put it, not where a ratio lands', () => {
  // installZoneRestSite matches an anchor by the CONTRACT's id and silently falls back
  // to a ratio otherwise. Emberdeep's site was floating in room 2 and the Inversion's
  // was standing in the middle of the polarity gauntlet, both for one renamed string.
  assert.match(fn('installZoneRestSite'), /o\.restSiteAnchor===contract\.id/);
  const contracts = new Map();
  for(const m of recovery.matchAll(/\['([a-z-]+)', '([a-z-]+)', '[^']+', [\d.]+, (?:true|false)\]/g))
    contracts.set(m[2], m[1]);
  for(const { zone } of ROAD){
    const id = contracts.get(zone);
    assert.ok(id, `${zone} has a rest-site contract`);
    assert.ok(source.includes("restSiteAnchor:'" + id + "'"),
      `${zone}'s level declares no anchor named '${id}', so its rest site falls back to a ratio`);
  }
  // And no level may declare an anchor that answers to nothing.
  for(const m of source.matchAll(/restSiteAnchor:'([a-z-]+)'/g))
    assert.ok([...contracts.values()].includes(m[1]), `'${m[1]}' is an anchor with no contract behind it`);
});

test('nothing on the road explains itself with a sign', () => {
  for(const name of ['EMBERDEEP_LEVEL', 'FOUNDRY_LEVEL', 'INVERSION_LEVEL', 'VOID_TYRANT_LEVEL']){
    const start = source.indexOf('const ' + name + '=');
    assert.ok(start >= 0, name + ' exists');
    const end = source.indexOf('\n};', start);
    const body = source.slice(start, end);
    assert.doesNotMatch(body, /\bSign\(/, `${name} still signposts`);
  }
  // The arena builders must not push one either.
  assert.doesNotMatch(fn('setupParadoxBoss'), /Sign\(/);
  assert.doesNotMatch(fn('installParadoxFloor'), /Sign\(/);
  assert.doesNotMatch(fn('installFoundryBed'), /Sign\(/);
});

test('the recall reaches every region on the road, and each has its own cue', () => {
  for(const { zone, stage } of ROAD){
    assert.ok(new RegExp("\\n  '?" + zone + "'?:\\[").test(source), `no Muster roster for ${zone}`);
  }
  // Each late region asks for its own cue rather than falling through to the legacy
  // score — walking four regions to one loop is how a road stops feeling like travel.
  for(const id of ['emberdeep-eternal-furnace','foundry-obsidian-foundry','inversion-inverted-gravity','tyrant-paradox-void-assault'])
    assert.ok(audio.includes("id:'" + id + "'") || audio.includes("id: '" + id + "'"), `no cue ${id}`);
  // The late road's placeholders were replaced by its own score (2026-09-19);
  // nothing on it may slip back to a flagged stand-in.
  assert.doesNotMatch(audio.slice(audio.indexOf('const LEVEL_MUSIC='), audio.indexOf('const DEFAULT_LEVEL_MUSIC=')), /interim:true/);
});

test('the late road is authored end to end, and its lengths agree', () => {
  for(const { stage } of ROAD)
    assert.match(source, new RegExp(stage + ':[A-Z_]+_LEVEL'), `stage ${stage} is not a custom level`);
  // 11 grew 9,000 -> 13,500 -> 16,100 on 2026-09-20: rooms 1-5 moved east by 4,500 to
  // open the Path of Inversion, then everything east of the Fissure moved 2,600 more to
  // open the Last Breath. The Fissure and the west gate have never moved.
  const lens = { 9: 16400, 10: 16600, 11: 16100, 12: 17000 };
  for(const [stage, len] of Object.entries(lens)){
    assert.match(source, new RegExp('len:' + len), `stage ${stage} length`);
  }
  assert.match(campaign, /name: 'The Inversion', len: 16100/);
  assert.match(campaign, /name: 'The Void Tyrant', len: 17000/);
  // No custom level grows a procedural coda past its own finale any more.
  assert.match(campaign, /id: 'inversion',[\s\S]*?customExtension: 0/);
  // And the world graph agrees which way each seam runs.
  assert.match(zones, /'colossus-inversion', 'ember-colossus', 'south'[\s\S]*?'inversion', 'north'/);
  assert.match(zones, /'inversion-tyrant', 'inversion', 'west'/);
  assert.match(zones, /'tyrant-king', 'void-tyrant', 'west'/);
});
