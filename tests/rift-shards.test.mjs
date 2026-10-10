// Act Three's gate: the rift shards. One in each of the twenty regions of Acts One and Two, never
// on the road — behind a conversation, a quest, a hidden place or a road you did not have to take.
// All twenty open the Fractured regions. Level Select's Fractured tab replaces the NG+ tiers.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const pub = (n) => new URL('../public/' + n, import.meta.url);
const read = (n) => readFileSync(pub(n), 'utf8');
const source = read('index.html');
const rs = read('bladefall-rift-shards.js');
const renderer = read('bladefall-respec-renderer.js');

const world = { meta:{}, G:{ levelSelectMode:false, p:{ x:0, y:0 }, particles:[], obstacles:[], stageIndex:0 }, persisted:0, toasts:[], cards:[] };
const sandbox = vm.createContext({ Math, Object, JSON, window:{}, console,
  meta:world.meta, G:world.G, GROUND_Y:700, mode:'play',
  persist(){ world.persisted++; }, toast(m){ world.toasts.push(m); }, SFX:{}, hurtPlayer(){},
  BladefallConversation:{ show(o){ world.cards.push(o.title); } }, showOverlay(){}, showGameUI(){}, hudUpdate(){} });
vm.runInContext(rs, sandbox);
const R = sandbox.window.BladefallRiftShards;

test('twenty shards: one for each region of Acts One and Two, each off the road', () => {
  assert.equal(R.TOTAL, 20);
  assert.equal(R.SHARDS.length, 20);
  const stages = Array.from(R.SHARDS, s => s.stage).sort((a, b) => a - b);
  assert.deepEqual(stages, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20], 'every region but the cut slot');
  assert.equal(new Set(R.SHARDS.map(s => s.id)).size, 20);
  const kinds = new Set(R.SHARDS.map(s => s.how));
  for(const k of ['dialogue', 'quest', 'hidden', 'route']) assert.ok(kinds.has(k), k + ' shards exist');
  for(const s of R.SHARDS){
    assert.ok(s.hint && s.hint.length > 20, s.id + ' has a hint for the ledger');
    if(s.how === 'hidden' || s.how === 'route') assert.ok(Number.isFinite(s.x) && Number.isFinite(s.y), s.id + ' has a place');
    if(s.how === 'quest') assert.match(read('bladefall-quests.js'), new RegExp("id: '" + s.quest + "'"), s.id + ': its quest exists');
    if(s.how === 'dialogue') assert.ok(s.npc || s.look, s.id + ': someone or something to ask');
  }
});

test('the page carries one-line hooks only, and each is there', () => {
  assert.match(source, /if\(typeof BladefallRiftShards!=='undefined'\)BladefallRiftShards\.update\(dt\);/, 'every frame, every stage');
  assert.match(source, /const rs=BladefallRiftShards\.converse\(source,title,line,options\)/, 'conversations');
  assert.match(source, /if\(typeof BladefallRiftShards!=='undefined'&&responses\[i\]\[2\]\)BladefallRiftShards\.chose\(responses\[i\]\);/);
  assert.doesNotMatch(source, /window\.BladefallRiftShards/, 'hooks safe where there is no window (tests lift functions into sandboxes)');
  assert.match(source, /BladefallRiftShards\.questDone\(last\.questId\)/, 'quests');
  assert.match(source, /BladefallRiftShards\.titleButton\(\)/, 'the title');
  assert.match(renderer, /if\(r && r\.draw && curG\) r\.draw\(EXT_API\)/, 'drawn in every region');
  assert.match(read('bladefall-landing-shores.js'), /BladefallRiftShards\.look\('cloth'\)/, 'the violet silk');
  assert.match(read('bladefall-sunspire.js'), /BladefallRiftShards\.showLedger\(titleScreen, true\)/, 'the end of Act Two shows the ledger');
  assert.match(read('bladefall-act-two.js'), /actId:src\.actId, residentId:src\.residentId/, 'Act Two\'s speakers are known by id');
  assert.match(read('bladefall-palace-path.js'), /riftLedge:1/, 'the Overlook ledge');
});

test('a question stays open until it is asked the right way', () => {
  const c = R.converse({ actId:'servant' }, 'A SERVANT', 'line', {});
  assert.ok(c && c.options.person);
  assert.equal(c.options.responses.length, 3);
  assert.equal(c.options.responses.filter(r => r[3]).length, 1, 'exactly one answer gives the shard');
  const wrong = c.options.responses.find(r => !r[3]), right = c.options.responses.find(r => r[3]);
  R.chose(wrong);
  const again = R.converse({ actId:'servant' }, 'A SERVANT', 'line', {});
  assert.notEqual(again.options.interaction, c.options.interaction, 'a new conversation: the choices come back');
  R.chose(right);
  assert.ok(R.held('palace'));
  assert.equal(R.converse({ actId:'servant' }, 'A SERVANT', 'line', {}), null, 'asked and answered: she is herself again');
  assert.equal(R.converse({ actId:'nobody' }, 'x', 'y', {}), null);
});

test('the first shard explains itself; the rest say where they came from and how many', () => {
  assert.equal(R.count(), 1);
  assert.match(rs, /if\(first\) pendingCard = S;/, 'the first gets a card, when whatever is open has closed');
  R.grant('outskirts');
  assert.match(world.toasts.at(-1), /RIFT SHARD<\/b> · The Outskirts — 2 of 20/);
  assert.equal(R.grant('outskirts'), false, 'never twice');
  assert.ok(world.persisted > 0, 'held shards are saved');
});

test('all twenty open the echoes; fewer do not', () => {
  assert.equal(R.complete(), false);
  assert.match(fnBody('beginActThree'), /if\(!complete\(\) \|\| !A3\) return;/);
  for(const s of R.SHARDS) R.grant(s.id);
  assert.equal(R.count(), 20); assert.equal(R.complete(), true);
  assert.match(fnBody('beginActThree'), /beginRun\(0, null, \{ hp:1, dmg:1 \}, \{ startStage:A3\.STAGE \}\)/);
});

test('LEVEL SELECT: one Fractured tab in place of the NG+ tiers, all twenty echoes listed', () => {
  assert.match(source, /const tabs=\[0,'fx'\]\.map/);
  assert.doesNotMatch(source, /\$\{i===0\?'Base':'NG\+'\+i\}/, 'the NG+ tabs are gone');
  const names = Array.from(R.FRACTURED, r => r[0]);
  // In the originals' order (the chain follows the source regions: the Causeway is region 2, the Updrafts 3).
  assert.deepEqual(names, ['Fractured Outskirts', 'Fractured Woods', 'Fractured Causeway', 'Fractured Updrafts', 'Fractured Marksman',
    'Fractured Keep', 'Fractured Warden', 'Fractured Frostfell', 'Fractured Sorcerer', 'Fractured Emberdeep', 'Fractured Colossus',
    'The Fractured Inversion', 'The Fractured Tyrant', 'The Fractured King', 'The Fractured Line', 'Fractured Cliffs', 'Fractured Shores',
    'The Fractured Colony', 'The Fractured Path', 'Fractured Palace']);
  sandbox.window.BladefallExploreFinale={visible:()=>true};
  const rows = R.levelSelectRows();
  // Twenty echoes numbered 21–40, then Final Echo (41) and Vesper (42) when the finale unlock allows them.
  assert.equal((rows.match(/class="choice lvlbtn"/g) || []).length, 22);
  assert.deepEqual([...rows.matchAll(/min-width:26px;display:inline-block;">(\d+)</g)].map(m => +m[1]), Array.from({ length:22 }, (_, i) => 21 + i));
  assert.doesNotMatch(rows, /Fractured Celeste/);
  assert.match(rows, /data-fx="45"[^]*The Final Echo/);
  sandbox.window.BladefallExploreFinale={visible:()=>false};
  assert.doesNotMatch(R.levelSelectRows(),/The Final Echo|Vesper/);
  assert.match(source, /beginRun\(0,null,\{hp:1,dmg:1\},\{startStage:\+b\.dataset\.fx,levelSelect:true\}\)/, 'a built echo starts from the tab');
});

function fnBody(name){
  const start = rs.indexOf('function ' + name + '(');
  const brace = rs.indexOf('{', start); let depth = 0;
  for(let i = brace; i < rs.length; i++){ if(rs[i] === '{') depth++; else if(rs[i] === '}' && --depth === 0) return rs.slice(start, i + 1); }
  return '';
}
