import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
const world=readFileSync(new URL('../public/bladefall-world.js',import.meta.url),'utf8');
const progression=readFileSync(new URL('../public/bladefall-progression.js',import.meta.url),'utf8');
const recovery=readFileSync(new URL('../public/bladefall-recovery.js',import.meta.url),'utf8');
const quests=readFileSync(new URL('../public/bladefall-quests.js',import.meta.url),'utf8');
const dialogue=readFileSync(new URL('../public/bladefall-dialogue.js',import.meta.url),'utf8');
const start=source.indexOf('/* ---- STAGE 1 · THE OUTSKIRTS');
const end=source.indexOf('/* ---- STAGE 2 · BLACK WOODS',start);
const stage=source.slice(start,end);

function freshSurfaces(){
  const rows=[];
  for(const line of stage.split('\n')){
    if(line.includes('returnHook:'))continue;
    let match=line.match(/\bGr\((\d+),(\d+)\)/);
    if(match)rows.push({left:+match[1],right:+match[2],y:0,line});
    match=line.match(/\bPl\((\d+),(\d+),(\d+)/);
    if(match){const x=+match[1],w=+match[2];rows.push({left:x-w/2,right:x+w/2,y:+match[3],line});}
  }
  return rows;
}
function jumpReach(rise){
  const velocity=480,gravity=1400,runSpeed=200,disc=velocity*velocity-2*gravity*rise;
  return disc<0?-Infinity:runSpeed*(velocity+Math.sqrt(disc))/gravity;
}
function gap(a,b){return a.right<b.left?b.left-a.right:b.right<a.left?a.left-b.right:0;}
function routeExists(surfaces,fromX,toX){
  const starts=surfaces.map((row,i)=>row.left<=fromX&&row.right>=fromX?i:-1).filter(i=>i>=0);
  const goals=new Set(surfaces.map((row,i)=>row.left<=toX&&row.right>=toX?i:-1).filter(i=>i>=0));
  const seen=new Set(starts),queue=[...starts];
  while(queue.length){
    const i=queue.shift();if(goals.has(i))return true;
    for(let j=0;j<surfaces.length;j++)if(!seen.has(j)&&gap(surfaces[i],surfaces[j])<=jumpReach(surfaces[j].y-surfaces[i].y)){
      seen.add(j);queue.push(j);
    }
  }
  return false;
}

test('Outskirts is an extended six-room jump-only opening with no completion portal',()=>{
  assert.match(stage,/\{len:13800,physicalExit:'outskirts-black-woods'/);
  for(const room of ['POISONED VERGE','CAMP ECHO','WATCHER\'S CUT','HOLLOW MILE','BROKEN MUSTER','MOTHLIGHT DESCENT'])
    assert.match(stage,new RegExp(room));
  assert.doesNotMatch(stage,/\bCry\(/);
  assert.doesNotMatch(stage.split('\n').filter(line=>!line.includes('returnHook:')).join('\n'),/\bWl\(/);
  assert.doesNotMatch(stage,/\bSp\(/);
  assert.doesNotMatch(stage,/portal:/);
  assert.match(source,/else G\.portal=L\.portal==null\?null:/);
});

test('the mandatory authored surfaces are traversable and reversible with the real single jump',()=>{
  const surfaces=freshSurfaces();
  assert.ok(routeExists(surfaces,70,13738),'fresh route must reach the east seam');
  assert.ok(routeExists(surfaces,13738,70),'the same surfaces must support walking back west');
  assert.ok(surfaces.some(row=>row.left<=6520&&row.right>=6520&&row.y===170),'fresh coin has an authored landing');
  assert.equal(jumpReach(0)<160,true,'the dash overlook gap must exceed an ordinary level jump');
  assert.match(stage,/Pl\(6540,140,170,\{returnHook:'dash'/);
  assert.match(stage,/Pl\(6830,120,170,\{returnHook:'dash',optional:true,dashOverlook:true/);
});

test('fresh route is weaponless and random ecology cannot contaminate it',()=>{
  assert.match(stage,/loot:\[\]/);
  assert.doesNotMatch(stage,/kind:'weapon'|kind:'armor'|kind:'firstWeapon'/);
  assert.equal((stage.match(/\{t:'grunt'/g)||[]).length,6);
  assert.equal((stage.match(/\{t:'shadeling'/g)||[]).length,1);
  assert.equal((stage.match(/noDrop:true/g)||[]).length,7);
  assert.match(source,/if\(G\.stageIndex>4\)seedVariantEnemies\(\)/);
  assert.match(source,/if\(G\.stageIndex>2&&!e\.boss&&!e\.creepy&&!a\.muster&&gameChance\('enemy'/);
  assert.equal((stage.match(/CoinOb\(/g)||[]).length,1);
  assert.match(stage,/CoinOb\(6520,192\)/);
  assert.match(stage,/StoryRelic\(1480,237,'first-draught'.*returnHook:'double-jump'/);
  assert.doesNotMatch(stage,/StoryRelic\([^\n]*'red-clasp'/);
});

test('Outskirts authors three bearings and visible later-ability return hooks',()=>{
  for(const bearing of ['ASH','GLASS','IRON'])assert.match(stage,new RegExp(`bearingName:'${bearing}'`));
  assert.match(stage,/npcs:\[\{x:1950,kind:'survey',anchoredResident:true\}\]/);
  assert.match(source,/n\.x=10410;n\.y=0;n\.vy=0;n\.anchoredResident=true/);
  for(const ability of ['double-jump','dash','weapon','wall-jump'])assert.match(stage,new RegExp(`returnHook:'${ability}'`));
  assert.match(stage,/sentinelVigil:true/);
});

test('the return-visit Sentinel remains dormant until an armed player explicitly opens the vigil',()=>{
  assert.match(source,/function installOutskirtsSentinel\(\)/);
  assert.match(source,/e\.unique=true;e\.noDrop=true;e\.sentinelVigil=true/);
  assert.match(source,/spawnEnemy\('grunt',3760\)/);
  assert.match(source,/e\.active=false;e\.vigilChallenge=false;e\.vigilAwakenT=0/);
  assert.match(source,/function activateOutskirtsVigil\(source\)/);
  assert.match(source,/e\.vigilChallenge=true;e\.vigilAwakenT=\.9/);
  assert.match(source,/if\(!e\.vigilChallenge\)\{e\.active=false;e\.vx=0;continue;\}/);
  assert.match(source,/if\(e\.sentinelVigil\)\{[\s\S]*attemptVaultSecret\('sentinel-key','defeat-sentinel',true\);[\s\S]*grantAuthoredAdvancementBundle\(\{forgeSeals:1\},'secret:sentinel-vigil'\)/);
  assert.match(stage,/vaultKeyId:'sentinel-key'/);
});

test('the Hollow Mile patrol owns a persistent post-weapon correspondence cache',()=>{
  assert.match(stage,/Scenery\(9090,0,'patrol-cache',\{patrolCache:true,returnHook:'weapon'/);
  assert.match(source,/function outskirtsHollowPatrolAlive\(\)/);
  assert.match(source,/meta\.loreRead\['outskirts-patrol-cache'\]=true/);
  assert.match(source,/credit\(meta\.equipment,\{iron:3,weave:1\},'outskirts-patrol-cache'\)/);
});

test('the Watcher’s Cut dash gap owns a persistent dead-drop reward',()=>{
  assert.match(stage,/Scenery\(6830,170,'overlook-cache',\{dashOverlook:true,returnHook:'dash'\}\)/);
  assert.match(source,/meta\.loreRead\['outskirts-dash-overlook'\]=true;addGold\(40\);persist\(\)/);
  assert.match(source,/o\.read=!!meta\.loreRead\['outskirts-dash-overlook'\]/);
  assert.match(source,/function standingOnOutskirtsReturn\(o\)/);
  assert.match(source,/o\.dashOverlook&&floor\.dashOverlook/);
  assert.match(source,/\(o\.dashOverlook\|\|o\.wallJumpOverlook\)&&!standingOnOutskirtsReturn\(o\)/);
});

test('every later-ability return owns a distinct persistent payoff',()=>{
  assert.match(stage,/StoryRelic\(1480,237,'first-draught'.*returnHook:'double-jump'/);
  assert.match(stage,/sentinelVigil:true.*vaultKeyId:'sentinel-key'/s);
  assert.match(stage,/patrolCache:true,returnHook:'weapon'/);
  assert.match(stage,/wallJumpOverlook:true/);
  assert.match(source,/meta\.loreRead\['outskirts-wall-overlook'\]=true/);
  assert.match(source,/credit\(meta\.equipment,\{iron:1,weave:1\},'outskirts-wall-overlook'\)/);
  assert.match(source,/returnRewards:.*'wall-jump-overlook'/s);
});

test('Mara moves forward, awards the field chart instead of healing, and visibly starts the wider road quest',()=>{
  assert.match(source,/meta\.outskirtsMaraRelocated=true;persist\(\)/);
  assert.match(source,/n\.x=10280/);
  assert.match(source,/meta\.outskirtsFieldChart=true;meta\.outskirtsMaraRelocated=true;addGold\(35\);persist\(\)/);
  assert.match(source,/FIELD CHART ACQUIRED · \+35g/);
  assert.match(source,/MAP \+ JOURNAL UNLOCKED/);
  const surveyBranch=source.slice(source.indexOf("} else if(n.kind==='survey'){"),source.indexOf("} else { // fetch",source.indexOf("} else if(n.kind==='survey'){")));
  assert.doesNotMatch(surveyBranch,/p\.hp=/);
  assert.match(quests,/Mara gives you her field chart/);
  assert.match(surveyBranch,/recordQuestEvent\(\{type:'traveler-helped',target:n\.profileId\},true\)/);
  assert.match(source,/chartOwned\?'<button class="bigbtn ghost" id="mapBtn">◇ Dream Map/);
  assert.doesNotMatch(source,/Journal · No field chart/);
});

test('the opening’s clue hierarchy keeps four concrete story observations legible',()=>{
  assert.match(stage,/warmAsh:1/);
  assert.match(stage,/flowerClue:1/);
  assert.match(stage,/fieldClock:true,clockTime:'3:40'/);
  assert.match(stage,/StoryRelic\(1480,237,'first-draught'/);
  assert.match(source,/The camp was abandoned recently\. The coals are still warm\./);
  assert.match(source,/Crushed white petals surround the cot and stain a discarded tin cup\./);
  assert.match(source,/The second hand shakes but does not move forward/);
  assert.match(dialogue,/A tin cup rolls from a gloved hand beside a tent/);
  assert.match(dialogue,/You have no weapon\. Stay out of a patrol’s reach and jump past when it turns\./);
  assert.match(dialogue,/The upper path is shorter and holds the GLASS stake/);
});

test('avoidance encounters escalate deliberately and point to authored recovery ground',()=>{
  assert.equal((stage.match(/noticeRange:/g)||[]).length,7);
  assert.equal((stage.match(/openingSpeed:/g)||[]).length,7);
  assert.equal((stage.match(/encounterRole:/g)||[]).length,7);
  assert.equal((stage.match(/safeRefugeX:/g)||[]).length,7);
  assert.match(source,/sensedDistance<\(e\.noticeRange\|\|VW\*0\.6\)/);
  assert.match(source,/e\.speed\*\(e\.openingSpeed\|\|1\)/);
  assert.match(source,/function updateOutskirtsAvoidanceEncounter\(e,target,dt,eff\)/);
  for(const role of ['turn-and-pass','platform-bypass','upper-sentry','commit-and-hop','short-recovery','final-feint'])
    assert.match(source,new RegExp(`e\\.encounterRole==='${role}'`));
  for(const tell of ['TURNING','RUSH','RECOVER','INSPECTING STANDARD','LOOKING UP','GUARDING LOW','WATCH THE SHADOW','REAPPEAR'])
    assert.match(source,new RegExp(tell));
  assert.match(source,/if\(updateOutskirtsAvoidanceEncounter\(e,target,dt,eff\)\)return/);
  assert.match(source,/contactAuthorized&&!e\.openingIntangible&&!e\.dead/);
});

test('Level 1 landing audio is quiet for small hops and reserves chainmail for hard falls',()=>{
  assert.match(source,/if\(speed<270\)return/);
  assert.match(source,/speed>=360\)playLevel1Sample\(terrain\+'Land'/);
  assert.match(source,/gain:speed>=620\?\.24:\.12/);
  assert.match(source,/caption:\(speed>=620\?'hard ':''\)\+'armored '/);
  assert.match(source,/SFX\.land\(BFEnvironment\.material\(fl\.o,false\)\.id,p\.x,p\.vy\)/);
});

test('The Outskirts uses one player-facing name across map, progression, recovery, and quest text',()=>{
  assert.match(world,/'The Outskirts'/);
  assert.match(progression,/'The Outskirts'/);
  assert.match(recovery,/'Outskirts Camp'/);
  assert.match(quests,/Return to Mara at Broken Muster in The Outskirts\./);
  assert.doesNotMatch(world+progression+recovery+quests,/Shallow March|March Camp/);
});

test('Mothlight Tunnel streams forward and the Black Woods seam streams back',()=>{
  assert.match(source,/function physicalSeamSpec\(\)/);
  assert.match(source,/G\.stageIndex===0.*connector:'outskirts-black-woods'.*zone:'outskirts'/s);
  assert.match(source,/G\.stageIndex===1.*connector:'outskirts-black-woods'.*zone:'black-woods'/s);
  assert.match(source,/commitPhysicalDeparture\(spec\.targetStage\)/);
  assert.match(source,/updatePhysicalWorldSeams\(\);\s*BFZoneStreamer\.tick\(dt\)/);
  assert.match(stage,/boundary-lantern'.*routeReveal:'black-woods'/);
  assert.match(source,/FIELD CHART UPDATED.*Mothlight Tunnel leads east to Black Woods/s);
});

test('the later western wall-jump breach is a real bidirectional Warden seam',()=>{
  assert.equal((stage.match(/westernBreach:true/g)||[]).length,5);
  assert.match(stage,/physicalSeam:'outskirts-warden'/);
  assert.match(stage,/type:'updraft'.*requiresWorld:'keep-west-seal'.*westernBreach:true/s);
  assert.match(source,/G\.stageIndex===0\)return\{connector:'outskirts-warden'.*G\.p\.y>=450/s);
  assert.match(source,/G\.stageIndex===6.*connector:'outskirts-warden'.*zone:'warden'/s);
  assert.match(source,/if\(spec\.commitClear\)commitPhysicalDeparture/);
  assert.match(source,/plan\.connectorId==='outskirts-warden'&&plan\.targetZoneId==='outskirts'\)\{x=70;y=500/);
});

test('rooms own distinct environmental compositions and bounded avoidance patrols',()=>{
  for(const kind of ['verge-silhouette','camp-ridge','watchers-cut','hollow-mile','broken-muster','mothlight-tunnel']){
    assert.match(stage,new RegExp(`'${kind}'`));
    assert.match(source,new RegExp(`kind==='${kind}'`));
  }
  assert.equal((stage.match(/patrol:\[/g)||[]).length,7);
  assert.match(source,/e\.patrolMin=en\.patrol\[0\];e\.patrolMax=en\.patrol\[1\]/);
  assert.match(source,/const pursuitX=e\.boss\?rawPursuitX:Math\.max\(20,Math\.min\(G\.levelLength-20,rawPursuitX\)\)/);
});

test('Outskirts exposes a room-level production diagnostic for acceptance',()=>{
  assert.match(source,/G\.outskirtsProduction=G\.stageIndex===0\?/);
  assert.match(source,/version:2,rooms:/);
  assert.match(source,/rooms:\['poisoned-verge','camp-echo','watchers-cut','hollow-mile','broken-muster','mothlight-descent'\]/);
  assert.match(source,/physicalReturnBranch:'outskirts-warden'/);
  assert.match(source,/maraX:\(G\.npcs\|\|\[\]\)\.find/);
  assert.match(source,/outskirtsState:\(\)=>G&&G\.outskirtsProduction\|\|null/);
});

test('room identity respects presentation and accessibility settings',()=>{
  assert.match(source,/BFPresentation\.publish\('location:room'/);
  assert.match(source,/showSoundCaption\(room\.name\+'\. '\+room\.line/);
  assert.match(source,/meta\.largeText\?16:13/);
  assert.match(source,/meta\.highContrast\?'#fff2a8':'#d8c48f'/);
  assert.match(source,/stageTag\.setAttribute\('aria-live','polite'\)/);
});

test('Level 1 keeps location cues brief and repeat reads reward-free',()=>{
  assert.match(source,/A second timed room card used to/);
  assert.match(source,/G\.outskirtsRoomCard=null/);
  assert.equal((source.match(/G\.stageBannerMax=G\.stageIndex===0\?3\.2:2\.6/g)||[]).length,2);
  assert.match(source,/durationMs==null\?2200:durationMs/);
  assert.match(source,/BFKeyboard\.isPressed\('ArrowUp'\)\)beginOutskirtsInteraction\(\)/);
  assert.match(source,/function outskirtsReplayText\(o\)/);
  assert.match(source,/function replayNearbyOutskirtsSource\(\)/);
  assert.match(source,/if\(replay\)\{showOutskirtsAnnotation\(o,replay,\{manual:true\}\);return true;\}/);
});

test('all enemy attacks spend HP in place while environmental hazards retain recovery',()=>{
  assert.match(source,/function enemyDamageStaysInPlace\(e\)\{return !!e;\}/);
  assert.equal((source.match(/enemyDamageStaysInPlace\(e\)/g)||[]).length,3);
  assert.match(source,/const hitDir=Math\.sign\(pr\.vx\)\|\|1/);
  assert.match(source,/else\{hurtPlayer\(pr\.dmg,hitDir,true,pr\.bloodDamage\);pr\.life=0;\}/);
  assert.match(source,/G\.aoes\.push\(\{x:e\.x,r:46,t:1\.35,dmg:e\.dmg,color:'#9fd84a',real:true\}\)/);
  assert.match(source,/hurtPlayer\(o\.dmg,Math\.sign\(p\.x-o\.x\)\|\|1,false,o\.needleMaze\?1:undefined\)/);
  assert.match(source,/hurtPlayer\(0, 0, false\)/);
});

test('Level 1 loops Strange Worlds quietly under the prologue and fades to exploration level',()=>{
  assert.match(source,/0:Object\.freeze\(\{id:'outskirts-strange-worlds',src:'\.\/audio\/music\/strange-worlds\.ogg'/);
  assert.match(source,/title:'Strange Worlds',artist:'Pizza Doggy'/);
  assert.match(source,/function syncLevelMusic\(requestPlay\)/);
  assert.match(source,/syncLevelMusic\(false\)/);
  const musicSync=source.slice(source.indexOf('function syncLevelMusic(requestPlay)'),source.indexOf('const BFCore=',source.indexOf('function syncLevelMusic(requestPlay)')));
  assert.match(musicSync,/const cue=currentLevelMusicCue\(\),previous=music\.dataset\.levelCue/);
  assert.doesNotMatch(musicSync,/mode==='play'/);
  assert.match(musicSync,/silentOpening=!G\|\|mode==='title'/);
  assert.match(musicSync,/music\.dataset\.levelCue='silent-opening'/);
  assert.match(source,/musicMix:opts&&opts\.intro&&!\(ngPlus\|\|0\)\?\.24:1/);
  assert.match(source,/G\.musicMixTarget=1/);
});

test('the opening is text-only, nonliteral, and carries only the quiet level score',()=>{
  assert.match(source,/if\(scene==='text-only'\)\{/);
  assert.match(source,/Layered mist, worn-gold/);
  assert.match(source,/c\.strokeRect\(w\*\.07,h\*\.09,w\*\.86,h\*\.82\)/);
  assert.match(source,/scriptId==='prologue'[\s\S]*top:50%[\s\S]*letter-spacing:\.055em/);
  assert.doesNotMatch(source,/mode==='cutscene'&&G\.stageIndex===0&&G\.time===0/);
});

test('Mara and the three stakes explain one concrete road-survey objective',()=>{
  assert.match(stage,/Scenery\(2180,0,'survey-post'/);
  assert.match(stage,/SurveyStake\(2340,0,'verge',\{bearingName:'ASH'/);
  assert.match(dialogue,/Three survey bearings mark the old road: ash by my camp, glass on the upper path, and iron beyond the broken platforms/i);
  assert.match(source,/Western starting point fixed beside the abandoned camp/);
  assert.match(source,/Elevated sightline fixed through Watcher’s Cut/);
  assert.match(source,/Eastern endpoint fixed at Broken Muster/);
  assert.match(dialogue,/All three agree\. The tunnel is real/);
  assert.match(source,/surveyTag\.textContent='▤ MARA '\+aligned\+'\/3 · '\+next/);
  assert.match(source,/A sword-shaped lock seals this platform\. Return after finding a weapon in Black Woods/);
  assert.match(stage,/SurveyStake\(11370,62,'muster',\{bearingName:'IRON'/);
  assert.match(source,/Return west across the broken crossing to Mara/);
});

test('opening clocks drift by one minute on each Black Woods return and Hale reacts to the sword',()=>{
  assert.match(source,/function openingClockTime\(\)/);
  assert.match(source,/advanceOpeningClock\('black-woods-return'\)/);
  assert.match(source,/plan\.sourceZoneId==='black-woods'&&plan\.targetZoneId==='outskirts'/);
  assert.match(source,/openingClockMinute:Math\.max\(0,Math\.floor\(Number\(meta\.openingClockMinute\)\|\|0\)\)/);
  assert.match(source,/name:'Hale'.*armedDialogue:'“So it did remember\./s);
  assert.match(source,/residentId==='woods-veteran'.*BFDialogueModule\.text\(hasCapability\('weapon'\)\?'woods\.hale\.after':'woods\.hale\.before'\)/s);
});

test('opening-zone discoveries use one deterministic Up interaction and never queue stale copy',()=>{
  assert.match(source,/function showOutskirtsAnnotation\(source,html,options\)/);
  assert.doesNotMatch(source,/G\.outskirtsAnnotationPending=next;return false/);
  assert.match(source,/function outskirtsInteractionCandidate\(\)/);
  assert.match(source,/rows\.sort\(\(a,b\)=>a\.score-b\.score\|\|a\.priority-b\.priority\|\|a\.o\.x-b\.o\.x\)/);
  assert.match(source,/if\(BF_TAS_ENABLED\?!!\(tasInjected&&tasInjected\.pressed\.interact\):BFKeyboard\.isPressed\('ArrowUp'\)\)beginOutskirtsInteraction\(\)/);
  assert.match(source,/if\(!o\.lore\|\|o\.read\|\|G\.outskirtsInteractionTarget!==o\)continue/);
  assert.match(source,/Math\.hypot\(G\.p\.x-source\.x,\(G\.p\.y\|\|0\)-\(source\.y\|\|0\)\)>a\.radius\)\)clearOutskirtsAnnotation/);
  assert.match(source,/function drawOutskirtsAnnotation\(c\)/);
  assert.match(source,/function outskirtsAnnotationKind\(source,options\)/);
  for(const kind of ['person','sign','marker','memory','object'])assert.match(source,new RegExp("'"+kind+"'"));
  assert.match(source,/wrapAnnotationLines\(c,a\.body,width-pad\*2,kind==='person'\?4:3\)/);
  assert.match(source,/const verb=target\./);
  assert.match(source,/target\.repairCatch\|\|target\.keepDropRelease\?'↑  RELEASE':target\.questActor\?'↑  TALK':target\.sentinelVigil&&hasCapability\('weapon'\)\?'↑  CHALLENGE'/);
  assert.match(source,/ctx\.fillText\(verb,target\.x/);
  assert.doesNotMatch(source,/G&&G\.stageIndex===0\?10000/);
});

test('Watcher’s Cut makes the upper route shorter, narrow, unstable, and watched',()=>{
  assert.match(stage,/ROOM 3 · WATCHER'S CUT \(4700–7000\)/);
  assert.match(stage,/Pl\(5140,180,38\).*'low-road'/);
  assert.match(stage,/Pl\(5740,84,118,\{crumble:1\}\).*'high-road'/);
  assert.match(stage,/Pl\(6260,88,125,\{crumble:1\}\).*'high-road'/);
  assert.match(stage,/encounterRole:'upper-sentry'/);
  assert.match(source,/updateOutskirtsPerception\(e,target,dt\)/);
  assert.match(source,/BFAISystem\.lineOfSight\(e,target\)/);
  assert.match(source,/en\.encounterRole==='upper-sentry'\)e\.shot=\{count:1/);
  assert.match(source,/bossShoot\(e,target\);e\.openingAlertT=0/);
  for(const state of ['suspicious','alert','search'])assert.match(source,new RegExp(`'${state}'`));
});

test('Dream Map uses a hand-authored legible layout and hides unknown names',()=>{
  assert.match(source,/const DREAM_MAP_LAYOUT=Object\.freeze\(\{/);
  for(const id of ['outskirts','black-woods','updrafts','ruined-keep','deep-line'])
    assert.match(source,new RegExp(`'${id}':\\{x:`));
  assert.match(source,/node\.status==='hidden'\?'':`<text/);
  assert.match(source,/viewBox="0 0 900 590"/);
  assert.match(source,/class="card mapcard"/);
  assert.match(source,/showOvHTML\([\s\S]*?`,'mapcard'\);/);
  assert.match(source,/ovcard\.className='card'\+\(cardClass\?' '\+cardClass:''\)/);
  assert.match(source,/MARA’S ROAD SURVEY/);
  assert.match(source,/Three fixed points verify that the old road still meets Mothlight Tunnel/);
});
