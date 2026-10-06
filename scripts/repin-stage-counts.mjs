// Re-pin the data-module count tests to what the modules now report, after an echo is registered.
// Run from the repo root: node scripts/repin-stage-counts.mjs
import { readFileSync, writeFileSync } from 'node:fs';
const R = process.cwd() + '/';
await import(R + 'public/bladefall-progression.js');
await import(R + 'public/bladefall-zones.js');
await import(R + 'public/bladefall-recovery.js');
await import(R + 'public/bladefall-world.js');
await import(R + 'public/bladefall-authoring.js');
await import(R + 'public/bladefall-campaign.js');
const P = globalThis.BladefallProgression.validate(), Z = globalThis.BladefallZones.validateCatalog();
const Rc = globalThis.BladefallRecovery.validateCatalog(), W = globalThis.BladefallWorld.validateGraph();
const C = globalThis.BladefallCampaign.validateBlueprints();
const n = C.stages;
const edits = [
  ['tests/progression.test.mjs', /zones: \d+, connectors: \d+,/, `zones: ${P.zones}, connectors: ${P.connectors},`],
  ['tests/zones.test.mjs', /zones: \d+, seams: \d+, endpoints: \d+, streamCells: \d+,/, `zones: ${Z.zones}, seams: ${Z.seams}, endpoints: ${Z.endpoints}, streamCells: ${Z.streamCells},`],
  ['tests/recovery.test.mjs', /sites: \d+, stations: \d+ \}/, `sites: ${Rc.sites}, stations: ${Rc.stations} }`],
  ['tests/world.test.mjs', /nodes: \d+, routes: \d+, endingRoutes:/, `nodes: ${W.nodes}, routes: ${W.routes}, endingRoutes:`],
  ['tests/world.test.mjs', /node\.stageIndex\)\)\.size, \d+\);/, `node.stageIndex)).size, ${W.nodes});`],
  ['tests/campaign.test.mjs', /assert\.equal\(stages\.length, \d+\);/, `assert.equal(stages.length, ${n});`],
  ['tests/campaign.test.mjs', /warnings: \[\], stages: \d+ \}/, `warnings: [], stages: ${n} }`],
  ['tests/campaign.test.mjs', /map\(\(item\) => item\.id\)\)\.size, \d+\);/, `map((item) => item.id)).size, ${n});`],
  ['tests/charters.test.mjs', /assert\.equal\(catalog\.length, \d+\);/, `assert.equal(catalog.length, ${n});`],
  ['tests/baseline.test.mjs', /assert\.equal\(report\.game\.stageCount, \d+\);/, `assert.equal(report.game.stageCount, ${n});`],
];
for(const [f, re, to] of edits){
  const s = readFileSync(R + f, 'utf8'); if(!re.test(s)) throw Error('no anchor in ' + f + ': ' + re);
  writeFileSync(R + f, s.replace(re, to));
}
console.log({ progression:[P.zones, P.connectors], zones:[Z.zones, Z.seams, Z.endpoints, Z.streamCells], sites:Rc.sites, world:[W.nodes, W.routes], stages:n });
