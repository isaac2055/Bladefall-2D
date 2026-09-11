import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
const campaign=readFileSync(new URL('../public/bladefall-campaign.js',import.meta.url),'utf8');
const progression=readFileSync(new URL('../public/bladefall-progression.js',import.meta.url),'utf8');
const shops=readFileSync(new URL('../public/bladefall-shops.js',import.meta.url),'utf8');
const start=source.indexOf('/* ---- STAGE 2 · BLACK WOODS');
const end=source.indexOf('/* ---- STAGE 3 · BROKEN CAUSEWAY',start);
const stage=source.slice(start,end);

test('Black Woods is a long-form five-room physical stage with no portal verb',()=>{
  assert.match(stage,/\{len:12400,portal:null,physicalExit:'black-woods-brute'/);
  for(const room of ['MOTHLIGHT REFUGE','OATHBLADE CLEARING','BITING CANOPY','MIRROR THICKET','ROOTBOUND PASSAGE'])
    assert.match(source,new RegExp(room));
  assert.doesNotMatch(stage,/\bSlate\(|\bAnchor\(|\bspSelfFling\(/);
  assert.match(campaign,/systems: \['weapon-awakening', 'single-jump-combat', 'false-surfaces'/);
  assert.doesNotMatch(campaign.slice(campaign.indexOf("id: 'black-woods'"),campaign.indexOf("id: 'brute'")),/portalVerb:/);
});

test('the refuge is enemy-free and spaces each resident, shop, and boundary landmark',()=>{
  assert.match(stage,/Gr\(0,2400\)/);
  assert.match(stage,/AmbientFigure\(430,0,'clock-keeper'/);
  assert.match(stage,/AmbientFigure\(1550,0,'resin-worker'/);
  assert.match(stage,/AmbientFigure\(2190,0,'quiet-veteran'/);
  assert.match(shops,/id: 'ethereal-goods', stageIndex: 1, x: 980/);
  const firstEnemy=stage.indexOf("{t:'grunt'");
  assert.ok(firstEnemy>stage.indexOf('Gr(9700,12400)'),'enemy declarations remain outside the authored object rooms');
  const baseEnemies=stage.slice(stage.indexOf(' enemies:['),stage.indexOf(' /* NG+1'));
  const enemyXs=[...baseEnemies.matchAll(/\{t:'[^']+',x:(\d+)/g)].map(match=>Number(match[1]));
  assert.ok(enemyXs.every(x=>x>=2400),'the refuge must not contain authored enemies');
});

test('the Oathblade owns a quiet acquisition beat before the first authored duel',()=>{
  assert.match(stage,/Scenery\(2800,0,'oathblade-stump'.*weaponAwakening:1/);
  assert.match(stage,/loot:\[\{x:2800,y:10,kind:'firstWeapon',sourceKind:'oathblade-stump'\}/);
  assert.match(source,/if\(best\.acquisitionId===BFWeaponProgressionModule\.FIRST_WEAPON\.id\)\s*return acquireAuthoredFirstWeapon\(best\)/);
  assert.match(stage,/\{t:'grunt',x:3470,patrol:\[3260,3820\].*forestRole:'oathblade-guard'/);
  assert.match(source,/if\(en\.forestRole\)\{e\.forestRole=en\.forestRole;e\.authoredEncounter=true;e\.active=hasCapability\('weapon'\);[\s\S]*?e\.forestCooldown=\.4\+\(en\.x%7\)\*\.11;\}/);
  assert.match(source,/for\(const enemy of G\.enemies\|\|\[\]\)if\(enemy\.authoredEncounter&&!enemy\.dead\)enemy\.active=true/);
  assert.match(source,/if\(G\.stageIndex>2&&!e\.boss&&!e\.creepy&&!a\.muster&&gameChance\('enemy'/);
});

test('Biting Canopy combines only single-jump rises, recoverable ground, thorn rhythm, and combat',()=>{
  assert.match(stage,/Gr\(4200,6700\),Check\(4280,0\)/);
  for(const rise of [65,130,195,260,325,250,185])assert.match(stage,new RegExp(`Pl\\(\\d+,\\d+,${rise}`));
  assert.equal((stage.match(/Sp\([^\n]+period:3\.[02]/g)||[]).length,3);
  assert.match(stage,/StoryRelic\(5420,360,'red-clasp'/);
  assert.match(stage,/forestRole:'canopy-controller'/);
  assert.match(stage,/forestRole:'canopy-diver'/);
});

test('Mirror Thicket uses wind-facing resin as one rule without an alternating answer pattern',()=>{
  assert.match(stage,/Gr\(6700,9700\),Check\(6780,0\)/);
  const thicket=stage.slice(stage.indexOf('// ROOM 4'),stage.indexOf('// ROOM 5'));
  assert.equal((thicket.match(/mirrorCopy:1/g)||[]).length,6);
  assert.equal((thicket.match(/mirrorTruth:1/g)||[]).length,8);
  assert.match(thicket,/resin-streamer'.*windDir:1/);
  assert.match(thicket,/resin-streamer'.*windDir:-1/);
  const choices=[];
  for(const match of thicket.matchAll(/Pl\((\d+),[^\n]+?(mirrorTruth:1|mirrorCopy:1)[^\n]*\)/g))
    choices.push({x:Number(match[1]),kind:match[2]==='mirrorTruth:1'?'T':'F'});
  const pattern=choices.sort((a,b)=>a.x-b.x).map(row=>row.kind).join('');
  assert.match(pattern,/TT/,'truths must sometimes be consecutive');
  assert.match(pattern,/FF/,'copies must sometimes be consecutive');
  assert.match(source,/const windward=dir>0\?-w\/2\+7:w\/2-43,leeward=dir>0\?w\/2-43:-w\/2\+7/);
  assert.match(source,/const rx=honest\?windward:leeward/);
  assert.doesNotMatch(source,/addText\(o\.x,GROUND_Y-o\.y-30,'FAKE!'/);
  assert.match(source,/if\(o\.portalDecoy&&o\.lampSeen\)/);
  assert.match(stage,/Object\.assign\(Wl\(9600,620,620,54\),\{slickL:1,slickR:1,rootWall:1,returnClingAfterGrip:1\}\)/);
  assert.match(stage,/Pl\(9600,220,620,\{truthSurface:1,rootboundCrown:1\}\)/);
});

test('Rootbound Passage gives the east side of the wall a reversible, hazardous platform route',()=>{
  const passage=stage.slice(stage.indexOf('// ROOM 5'),stage.indexOf(' ],\n npcs:'));
  assert.match(passage,/Check\(9780,560\)/);
  assert.equal((passage.match(/rootboundStep:1/g)||[]).length,8);
  assert.equal((passage.match(/rootThorns:1/g)||[]).length,4);
  assert.doesNotMatch(passage,/mirrorCopy:1/);
  const steps=[...passage.matchAll(/Pl\((\d+),(\d+),(\d+),\{truthSurface:1,rootboundStep:1\}/g)]
    .map(match=>({x:Number(match[1]),w:Number(match[2]),y:Number(match[3])}));
  assert.deepEqual(steps.map(step=>step.y),[560,490,420,350,280,210,140,70]);
  for(let i=1;i<steps.length;i++){
    assert.ok(Math.abs(steps[i].y-steps[i-1].y)<=70,'each reverse climb stays within the single jump rise');
    assert.ok(steps[i].x-steps[i-1].x-(steps[i].w+steps[i-1].w)/2<=60,'each step has a deliberate reachable gap');
  }
  assert.match(stage,/CoinOb\(10690,302\)/);
  assert.match(stage,/\{x:6320,y:285,kind:'namedMantle'.*name:'Mothsilk Mantle'.*sourceKind:'canopy-veteran-rack'\}/);
  assert.match(source,/if\(o\.rootThorns\)/);
});

test('Level 2 inherits compact anchored dialogue and Up-to-reread behavior',()=>{
  assert.match(source,/if\(!G\|\|G\.stageIndex<0\|\|G\.stageIndex>6\|\|!source\)return false/);
  assert.match(source,/const rooms=G\.stageIndex===0\?OUTSKIRTS_ROOM_CUES:G\.stageIndex===1\?BLACK_WOODS_ROOM_CUES:G\.stageIndex===2\?CAUSEWAY_ROOM_CUES:G\.stageIndex===5\?RUINED_KEEP_ROOM_CUES:G\.stageIndex===7\?FROSTFELL_ROOM_CUES:WARDEN_ROOM_CUES/);
  assert.match(source,/G\.stageIndex>=0&&G\.stageIndex<=4\)showOutskirtsAnnotation\(o,loreHtml/);
  assert.match(source,/if\(G\.stageIndex===1\)showOutskirtsAnnotation\(n,greeting/);
  assert.match(source,/G\.stageIndex<0\|\|G\.stageIndex>6/);
  assert.match(source,/wrapAnnotationLines\(c,a\.body,width-pad\*2,kind==='person'\?4:3\)/);
  assert.match(source,/function outskirtsAnnotationKind\(source,options\)/);
});

test('the dash return secret is visible early, capability-gated, and persistent',()=>{
  assert.match(stage,/Scenery\(6470,260,'root-seam'.*returnHook:'dash'.*vaultKeyId:'root-key'.*secretVerb:'dash-impact'/s);
  assert.match(stage,/secretCue:'One old root seam is bruised as if it remembers speed\.'/);
  assert.match(source,/meta\.loreRead\['black-woods-root-seam'\]=true;sightVaultSecretObject\(o\);persist\(\)/);
  assert.match(source,/o\.read=!!meta\.loreRead\['black-woods-root-seam'\]/);
  assert.match(progression,/\{ id: 'root-key', zone: 'black-woods'.*requirements: \['dash'\], returnVisit: true \}/);
});

test('all ordinary encounters are authored and the refuge cannot receive ecology filler',()=>{
  assert.equal((stage.match(/forestRole:/g)||[]).length,8);
  assert.equal((stage.match(/patrol:\[/g)||[]).length,8);
  assert.equal((stage.match(/noticeRange:/g)||[]).length,8);
  assert.match(source,/if\(G\.stageIndex>4\)seedVariantEnemies\(\)/);
  for(const role of ['oathblade-guard','canopy-controller','canopy-diver','mirror-pursuer','mirror-diver','root-stalker','root-guard','tunnel-controller'])
    assert.match(stage,new RegExp(`forestRole:'${role}'`));
});

test('all eight forest roles own readable perception and terrain-specific behavior loops',()=>{
  assert.match(source,/function updateForestPerception\(e,target,dt\)/);
  assert.match(source,/const insideCone=\(ahead&&Math\.abs\(dy\)<Math\.max\(96,Math\.abs\(dx\)\*\.68\)\)\|\|distance<170/);
  assert.match(source,/BFAISystem\.lineOfSight\(e,target\)/);
  assert.match(source,/awareness=e\.forestSight>=\.34\?'alert':e\.forestAlertT>0\?'search':e\.forestSight>\.08\?'suspicious':'unaware'/);
  assert.match(source,/Math\.max\(20,lo-900\).*Math\.min\(G\.levelLength-20,hi\+900\)/);
  const roles=['canopy-controller','tunnel-controller','canopy-diver','mirror-diver','root-stalker','oathblade-guard','mirror-pursuer','root-guard'];
  for(const role of roles)assert.match(source,new RegExp(`e\\.forestRole==='${role}'`));
  assert.match(source,/function forestSeedAttack\(e,target,sense,dt,eff,tunnel\)/);
  assert.match(source,/function updateForestDiver\(e,target,sense,dt,eff,mirror\)/);
  assert.match(source,/function updateForestStalker\(e,target,sense,dt,eff\)/);
  assert.match(source,/function updateForestDuelist\(e,target,sense,dt,eff,profile\)/);
  assert.match(source,/if\(updateForestEncounter\(e,target,dt,eff\)\)return/);
  assert.match(source,/e\.forestContactDanger\|\|e\.boss\|\|\s*\(!e\.forestRole&&BFAISystem\.directive\(e\)\.attack\)/s);
});

test('forest roles telegraph their commitments and react to the authored landscape',()=>{
  assert.match(source,/e\.forestRole==='mirror-pursuer'\|\|e\.forestRole==='mirror-diver'/);
  assert.match(source,/e\.forestNoiseX=o\.x;e\.forestNoiseY=o\.y;e\.forestNoiseT=3\.2/);
  assert.match(source,/forestEncounterState\(e,'seed-wind'.*'ROOTS'/s);
  assert.match(source,/G\.aoes\.push\(\{x:e\.forestAimX,y:e\.forestAimY,r:radius,t:\.72/);
  assert.match(source,/forestEncounterState\(e,'dive-mark'.*mirror\?'FEINT':'DIVE'/s);
  assert.match(source,/forestEncounterState\(e,'veil',\.62,'VEIL'/);
  assert.match(source,/cue:'SALUTE'/);
  assert.match(source,/cue:'HUNT'/);
  assert.match(source,/cue:'BRACE',shield:true/);
  assert.match(source,/e\.forestMode==='seed-wind'.*e\.forestAimX/s);
  assert.match(source,/e\.forestMode==='dive-mark'.*e\.forestDiveX/s);
  assert.match(stage,/patrol:\[10155,10305\].*forestRole:'root-stalker'/);
  assert.match(stage,/patrol:\[10845,10995\].*forestRole:'root-guard'/);
});

test('Black Woods and Broken Causeway share a bidirectional physical root tunnel',()=>{
  assert.match(source,/G\.stageIndex===1&&G\.p\.x>G\.levelLength\/2.*connector:'black-woods-brute'.*zone:'black-woods'.*targetStage:2/s);
  assert.match(source,/G\.stageIndex===2&&G\.p\.x<G\.levelLength\/2.*connector:'black-woods-brute'.*zone:'brute'.*targetStage:1/s);
  assert.match(stage,/Scenery\(12240,0,'root-tunnel'.*routeReveal:'brute'/);
  assert.match(source,/ROOT TUNNEL<\/b><br>The passage continues into Broken Causeway/);
});

test('the runtime exposes a Level 2 production receipt for playable acceptance',()=>{
  assert.match(source,/G\.blackWoodsProduction=G\.stageIndex===1\?/);
  assert.match(source,/rooms:\['mothlight-refuge','oathblade-clearing','biting-canopy','mirror-thicket','rootbound-passage'\]/);
  assert.match(source,/criticalCapabilities:\['jump','weapon'\],portalFree:/);
  assert.match(source,/refugeEnemies:\(G\.enemies\|\|\[\]\)\.filter/);
  assert.match(source,/authoredEncounters:\(G\.enemies\|\|\[\]\)\.filter\(e=>e\.authoredEncounter\)/);
  assert.match(source,/blackWoodsState:\(\)=>G&&G\.blackWoodsProduction\|\|null/);
});

test('Bram’s truth lesson concludes at the root wall instead of a stage boundary Black Woods never reaches',()=>{
  // Black Woods leaves through physical zone streaming, so nextStage()'s escort
  // payoff cannot fire here and Bram was previously never marked done at all.
  assert.match(source,/function concludeRootboundLesson\(n,p\)\{/);
  assert.match(source,/if\(G\.stageIndex!==1\|\|n\.profileId!=='bram'\|\|n\.done\|\|n\.state!=='follow'\)return false;/);
  // The conclusion is anchored to the authored wall, not a hard-coded x.
  assert.match(source,/const wall=G\.obstacles\.find\(o=>o\.rootWall&&!o\.gone\);/);
  assert.match(source,/if\(!wall\|\|p\.x<wall\.x\+wall\.w\|\|n\.x>=wall\.x\)return false;/);
  assert.match(source,/rootWall:1/);
  // It persists, so a reload or revisit restores his finished state.
  assert.match(source,/recordQuestEvent\(\{type:'traveler-helped',target:n\.profileId\},true\);/);
  assert.match(source,/if\(concludeRootboundLesson\(n,p\)\)continue;/);
  // Authored levels pay in their own currency, not a random legendary.
  assert.match(source,/if\(n\.profileId==='bram'\)\{\n\s*addGold\(60\);restoreBlood\(G\.p,Infinity\);persist\(\);/);
  // The escort plate mechanism needs Companion Command, which is not earned
  // until Emberdeep, so it must not be what gates his conclusion.
  const conclusion=source.slice(source.indexOf('function concludeRootboundLesson'),source.indexOf('function followerPathBlocked'));
  assert.doesNotMatch(conclusion,/followerOnly|FollowerPlate|companion/i);
});
