import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';

const source=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
const world=readFileSync(new URL('../public/bladefall-world.js',import.meta.url),'utf8');
const progression=readFileSync(new URL('../public/bladefall-progression.js',import.meta.url),'utf8');
const recovery=readFileSync(new URL('../public/bladefall-recovery.js',import.meta.url),'utf8');
const quests=readFileSync(new URL('../public/bladefall-quests.js',import.meta.url),'utf8');
const dialogue=readFileSync(new URL('../public/bladefall-dialogue.js',import.meta.url),'utf8');
const start=source.indexOf('/* ---- STAGE 1 · THE OUTSKIRTS');
const end=source.indexOf('/* ---- STAGE 2 · BLACK WOODS',start);
const stage=source.slice(start,end);

// Evaluate the authored data with the production floor constructors. This
// covers negative elevations and object flags without regex-dropping surfaces.
const Dialogue=createRequire(import.meta.url)('../public/bladefall-dialogue.js');
const makeObject=type=>(x,y,kind,options)=>({type,x,y,kind,...options});
const authored=runInNewContext(
  source.slice(source.indexOf('function Pl('),source.indexOf('function Gr('))+
  source.slice(source.indexOf('function Gr(')).split('\n')[0]+
  '\n('+stage.slice(stage.indexOf('{len:')).trim().replace(/,$/,'')+')',{
    BFDialogueModule:Dialogue,
    OpeningBeat:(object,beat,system)=>Object.assign(object,{openingActBeat:beat,openingActSystem:system}),
    Scenery:makeObject('scenery'),AmbientFigure:makeObject('ambientFigure'),
    SurveyStake:makeObject('surveyStake'),StoryRelic:makeObject('storyRelic'),
    SealedRecollection:(x,y,zone,title,options)=>({type:'storyRelic',x,y,zone,title,...options}),
    Wl:(x,y,h,w)=>({type:'wall',x,y,h,w}),Spring:(x,y,power)=>({type:'spring',x,y,power}),
    Check:(x,y)=>({type:'check',x,y}),CoinOb:(x,y)=>({type:'coin',x,y})
  });
function freshSurfaces(){
  return authored.objects.filter(o=>o.type==='plat'&&!o.returnHook)
    .map(o=>({...o,left:o.x-o.w/2,right:o.x+o.w/2}));
}
function sourceBetween(from,to){
  const a=source.indexOf(from),b=source.indexOf(to,a+from.length);
  assert.ok(a>=0&&b>a,'production source block exists: '+from);
  return source.slice(a,b);
}
function jumpReach(rise){
  const velocity=480,gravity=1400,runSpeed=200,disc=velocity*velocity-2*gravity*rise;
  return disc<0?-Infinity:runSpeed*(velocity+Math.sqrt(disc))/gravity;
}
function gap(a,b){return a.right<b.left?b.left-a.right:b.right<a.left?a.left-b.right:0;}
function routeExists(surfaces,fromX,toX){
  const from=typeof fromX==='number'?{x:fromX}:fromX,to=typeof toX==='number'?{x:toX}:toX;
  const matches=(row,point)=>row.left<=point.x&&row.right>=point.x&&(point.y===undefined||row.y===point.y);
  const starts=surfaces.map((row,i)=>matches(row,from)?i:-1).filter(i=>i>=0);
  const goals=new Set(surfaces.map((row,i)=>matches(row,to)?i:-1).filter(i=>i>=0));
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

test('missed opening hops and the Camp Echo crossing land on shallow recoverable beds',()=>{
  const floors=runInNewContext(
    sourceBetween('function platTop(', 'function doorOpen(')+
    sourceBetween('function getFloor(', 'function getFloorY(')+';getFloor',
    {G:{obstacles:authored.objects}});
  for(const [left,right,y] of [[600,730,-22],[1120,1310,-24],[1650,1880,-26],[3830,4240,-26]]){
    for(let x=left+1;x<right;x+=17){
      const floor=floors(x,-6);
      assert.equal(floor.y,y,`missed hop at ${x} has the authored recovery floor`);
      assert.ok(floor.o.openingCreek);
    }
    assert.ok(routeExists(freshSurfaces(),{x:(left+right)/2,y},{x:left-20,y:0}),'west bank is recoverable');
    assert.ok(routeExists(freshSurfaces(),{x:(left+right)/2,y},{x:right+20,y:0}),'east bank is recoverable');
  }
});

test('Watcher’s Cut has an independent optional high path above a reversible sheltered road',()=>{
  const all=freshSurfaces(),banks=all.filter(o=>o.x>=4700&&o.x<=7000&&o.y===0);
  const low=all.filter(o=>o.openingActSystem==='low-road').concat(banks);
  const high=all.filter(o=>o.openingActSystem==='high-road').concat(banks);
  for(const road of [low,high]){
    assert.ok(routeExists(road,{x:4900,y:0},{x:6900,y:0}),'road independently reaches the east bank');
  }
  assert.ok(routeExists(low,{x:6900,y:0},{x:4900,y:0}),'the sheltered road independently returns west');
  assert.ok(routeExists(high,{x:4900,y:0},{x:6000,y:175}),'GLASS is reachable with one jump at a time');
  assert.ok(routeExists(high,{x:4900,y:0},{x:6520,y:170}),'coin has a reachable upper landing');
  assert.ok(!routeExists(low,{x:4900,y:0},{x:6000,y:175}),'the sheltered bypass does not masquerade as the upper route');
  const bed=low.find(o=>o.openingLowRoad);
  assert.equal(bed.y,-22);
  for(const perch of high.filter(o=>o.crumble)){
    assert.ok(bed.left<=perch.left&&bed.right>=perch.right,'crumbling perches fall onto the sheltered road');
  }
});

test('Broken Muster is a continuous peaceful rest with an optional reachable survey lookout',()=>{
  const camp=freshSurfaces().find(o=>o.left===9300&&o.right===11500&&o.y===0);
  assert.ok(camp,'the inhabited camp has an uninterrupted floor');
  assert.ok(authored.enemies.every(e=>e.x<9300||e.x>11500),'no enemy is authored among the surveyor and last vane');
  assert.ok(authored.enemies.every(e=>e.patrol[1]<9300||e.patrol[0]>11500),'patrol paths do not cut through the rest');
  const lookout=freshSurfaces().filter(o=>o.openingActSystem==='survey-lookout').concat(camp);
  assert.ok(routeExists(lookout,{x:10410,y:0},{x:11370,y:62}),'IRON is a short optional climb');
  assert.ok(routeExists(lookout,{x:11370,y:62},{x:10410,y:0}),'the surveyor remains easy to revisit');
});

test('fresh route is weaponless and random ecology cannot contaminate it',()=>{
  assert.match(stage,/loot:\[\]/);
  assert.doesNotMatch(stage,/kind:'weapon'|kind:'armor'|kind:'firstWeapon'/);
  assert.equal((stage.match(/\{t:'grunt'/g)||[]).length,5);
  assert.equal((stage.match(/\{t:'shadeling'/g)||[]).length,1);
  assert.equal((stage.match(/noDrop:true/g)||[]).length,6);
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
  assert.doesNotMatch(source,/FIELD CHART ACQUIRED · \+35g|MAP \+ JOURNAL UNLOCKED|MARA MOVES EAST/);
  assert.match(source,/n\.departForMuster&&\(n\.x<G\.cam-80\|\|n\.x>G\.cam\+VW\+80\)/);
  const surveyBranch=source.slice(source.indexOf("} else if(n.kind==='survey'){"),source.indexOf("} else { // fetch",source.indexOf("} else if(n.kind==='survey'){")));
  assert.doesNotMatch(surveyBranch,/p\.hp=/);
  assert.match(quests,/Mara gives you her field chart/);
  assert.match(surveyBranch,/recordQuestEvent\(\{type:'traveler-helped',target:n\.profileId\},true\)/);
  assert.match(source,/chartOwned\?'<button class="bigbtn ghost" id="mapBtn">◇ Dream Map/);
  assert.doesNotMatch(source,/Journal · No field chart/);
});

test('Mara requires a deliberate interaction, relocates out of view, and grants the chart once without a bag',()=>{
  const n={kind:'survey',profileId:'mara',x:1950,y:0,asked:false,done:false};
  const G={stageIndex:0,cam:1400,npcs:[n],p:{x:1950,y:0,hp:3},outskirtsSurvey:{aligned:0,total:3},outskirtsProduction:{}};
  const meta={soundOn:false,gold:0},annotations=[],events=[];
  const profile=runInNewContext('({'+sourceBetween('  mara:{','  bram:{')+'}).mara',{BFDialogueModule:Dialogue});
  const surveyStart="} else if(n.kind==='survey'){";
  const surveyBody=sourceBetween(surveyStart,'} else { // fetch').slice(surveyStart.length);
  const relocation=sourceBetween("    if(n.kind==='survey'&&n.departForMuster",'    const near=');
  const api=runInNewContext(
    sourceBetween('function outskirtsReplayText(', 'function outskirtsAuthoredInteractable(')+
    sourceBetween('function beginOutskirtsInteraction(', 'function replayNearbyOutskirtsSource(')+
    sourceBetween('function coopTravelerIndex(', 'function coopSendTravelerIntent(')+
    `;({begin:beginOutskirtsInteraction,reward:()=>coopGrantTravelerReward(n),relocate(){${relocation}},tick(){
      const residentInteraction=G.outskirtsInteractionTarget;G.outskirtsInteractionTarget=null;
      const near=Math.abs(p.x-n.x)<52&&Math.abs(p.y-n.y)<70;
      ${surveyBody}
    }})`,{
      n,p:G.p,G,meta,profile,VW:1024,
      outskirtsInteractionCandidate:()=>n,travelerProfile:()=>profile,travelerLabel:()=>profile.name,
      showOutskirtsAnnotation:(_,html)=>annotations.push(html),escText:s=>s,
      coopSendTravelerIntent:()=>{},recordQuestEvent:event=>events.push(event),persist:()=>{},
      addGold:amount=>{meta.gold+=amount;}
    });
  api.tick();
  assert.equal(n.asked,false,'passing the surveyor does not begin dialogue');
  assert.equal(annotations.length,0);
  api.begin();api.tick();
  assert.equal(n.asked,true);
  assert.match(annotations.at(-1),/bearings/i);
  assert.equal(n.x,1950,'talking does not teleport the surveyor on screen');
  api.relocate();assert.equal(n.x,1950);
  G.p.x=3500;G.cam=2900;api.relocate();assert.equal(n.x,10280);
  G.p.x=n.x;api.begin();api.tick();
  assert.match(annotations.at(-1),/stretch of road/,'an incomplete repeat talk uses real progress copy');
  assert.doesNotMatch(annotations.at(-1),/undefined/);
  G.outskirtsSurvey.aligned=3;
  api.tick();assert.equal(n.done,false,'completion still requires interaction');
  api.begin();api.tick();
  assert.equal(n.done,true,'replay text must not swallow the reward interaction');
  assert.equal(meta.outskirtsFieldChart,true);
  assert.equal(meta.gold,35);
  assert.equal(G.p.hp,3);
  assert.equal(meta.inventory,undefined,'chart acquisition has no inventory dependency');
  assert.ok(events.some(e=>e.type==='traveler-helped'&&e.target==='mara'));
  api.reward();assert.equal(meta.gold,35,'repeated reward calls cannot duplicate currency');
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
  assert.equal(authored.objects.filter(o=>o.type==='ambientFigure'&&o.quietV4).length,2);
  assert.match(source,/if\(!o\|\|o\.quietV4\)return false/);
  const openingDialogue=Dialogue.catalog().filter(row=>row.id.startsWith('outskirts.'));
  assert.ok(openingDialogue.every(row=>!(/Press|upper path|jump past|new ability|Return after/.test(row.text))));
});

test('avoidance encounters escalate deliberately and point to authored recovery ground',()=>{
  assert.equal((stage.match(/noticeRange:/g)||[]).length,6);
  assert.equal((stage.match(/openingSpeed:/g)||[]).length,6);
  assert.equal((stage.match(/encounterRole:/g)||[]).length,6);
  assert.equal((stage.match(/safeRefugeX:/g)||[]).length,6);
  assert.match(source,/sensedDistance<\(e\.noticeRange\|\|VW\*0\.6\)/);
  assert.match(source,/e\.speed\*\(e\.openingSpeed\|\|1\)/);
  assert.match(source,/function updateOutskirtsAvoidanceEncounter\(e,target,dt,eff\)/);
  for(const role of ['turn-and-pass','platform-bypass','upper-sentry','commit-and-hop','short-recovery','final-feint'])
    assert.match(source,new RegExp(`e\\.encounterRole==='${role}'`));
  const stateChange=sourceBetween('function outskirtsEncounterState(', 'function updateOutskirtsPerception(');
  assert.match(stateChange,/e\.openingState=state;e\.openingTimer=timer/);
  assert.doesNotMatch(stateChange,/addText|toast|showStationNotice/);
  assert.match(source,/if\(updateOutskirtsAvoidanceEncounter\(e,target,dt,eff\)\)return/);
  assert.match(source,/contactAuthorized&&!e\.openingIntangible&&!e\.dead/);
});

test('the upper sentry ignores the sheltered road and commits its shot before the player drops away',()=>{
  const spec=authored.enemies.find(e=>e.encounterRole==='upper-sentry');
  const e={...spec,face:-1,openingState:'watch',patrolMin:spec.patrol[0],patrolMax:spec.patrol[1]};
  // At this range the old peripheral sight check could see directly through
  // the sheltered road. Leave line-of-sight clear to exercise the lane rule.
  const target={x:e.x-70,y:-22,h:44},shots=[];
  const update=runInNewContext(
    sourceBetween('function outskirtsEncounterState(', 'function forestEncounterState(')+
    ';updateOutskirtsAvoidanceEncounter',{
      G:{stageIndex:0,p:target},hasCapability:()=>false,
      BFAISystem:{lineOfSight:()=>true},bossShoot:(_,aim)=>shots.push({...aim})
    });
  const frame=()=>update(e,target,1/60,100);
  for(let i=0;i<60;i++)frame();
  assert.equal(e.openingSight,0);
  assert.equal(e.openingState,'watch');
  assert.equal(shots.length,0);
  target.y=175;
  for(let i=0;i<30&&e.openingState!=='warn';i++)frame();
  assert.equal(e.openingState,'warn','the exposed upper route is acquired');
  assert.equal(shots.length,0,'the warning pose precedes the shot');
  const committed={...target};
  assert.deepEqual({...e.openingAim},committed);
  target.x+=180;target.y=-22;
  for(let i=0;i<45&&shots.length===0;i++)frame();
  assert.equal(shots.length,1);
  assert.deepEqual(shots[0],committed,'the projectile targets the warned position, not a player who has dropped away');
  assert.equal(e.openingState,'recover');
  assert.equal(e.openingAim,null);
  for(let i=0;i<150;i++)frame();
  assert.equal(shots.length,1,'remaining on the lower road does not reacquire the player');
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
  assert.equal((stage.match(/patrol:\[/g)||[]).length,6);
  assert.match(source,/e\.patrolMin=en\.patrol\[0\];e\.patrolMax=en\.patrol\[1\]/);
  assert.match(source,/const pursuitX=e\.boss\?rawPursuitX:Math\.max\(20,Math\.min\(G\.levelLength-20,rawPursuitX\)\)/);
});

test('Outskirts exposes a room-level production diagnostic for acceptance',()=>{
  assert.match(source,/G\.outskirtsProduction=G\.stageIndex===0\?/);
  assert.match(source,/version:4,rooms:/);
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

test('Level 1 loops Midnight Field quietly under the prologue and fades to exploration level',()=>{
  assert.match(source,/0:Object\.freeze\(\{id:'outskirts-midnight-field',src:'\.\/audio\/music\/midnight-field\.mp3'/);
  assert.match(source,/title:'Midnight Field',artist:'Bladefall score'/);
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

test('Mara offers one optional road survey while the stakes respond without route banners',()=>{
  assert.match(stage,/Scenery\(2180,0,'survey-post'/);
  assert.match(stage,/SurveyStake\(2340,0,'verge',\{bearingName:'ASH'/);
  assert.match(stage,/SurveyStake\(11370,62,'muster',\{bearingName:'IRON'/);
  const ask=Dialogue.text('outskirts.mara.ask'),done=Dialogue.text('outskirts.mara.done');
  assert.match(ask,/bearings/i);assert.match(ask,/chart/i);
  assert.match(done,/tunnel reaches the woods/i);assert.match(done,/chart/i);
  for(const line of [ask,done])assert.ok(line.split(/\s+/).length<=16,'Mara stays brief: '+line);
  const alignment=sourceBetween("}else if(o.type==='surveyStake'&&!o.aligned",'// Incidental people establish');
  assert.match(alignment,/o\.aligned=true;o\.flash=1/);
  assert.match(alignment,/coopSendTravelerIntent/);
  assert.match(alignment,/SFX\.pickup/);
  assert.doesNotMatch(alignment,/addText|showOutskirtsAnnotation|NEXT:|Return west/);
  assert.doesNotMatch(source,/surveyTag\.textContent='▤ MARA '|REPORT TO MARA/);
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
  // The verb chain grows as regions land; assert each branch exists rather than
  // pinning its exact order, which any new speaker would otherwise break.
  const verbChain=source.slice(source.indexOf('const verb=target.'));
  assert.match(verbChain,/target\.repairCatch\|\|target\.keepDropRelease\?'↑  RELEASE'/);
  assert.match(verbChain,/target\.questActor\|\|target\.kind==='survey'[^?]*\?'↑  TALK'/);
  assert.match(verbChain,/target\.sentinelVigil&&hasCapability\('weapon'\)\?'↑  CHALLENGE'/);
  assert.match(source,/ctx\.fillText\(pr\.verb,pr\.target\.x/);
  assert.match(source,/prompt:interactionPrompt\(\)/);
  assert.doesNotMatch(source,/G&&G\.stageIndex===0\?10000/);
});

test('Watcher’s Cut makes the optional upper route elevated, unstable, and watched',()=>{
  assert.match(stage,/ROOM 3 · WATCHER'S CUT \(4700–7000\)/);
  const high=freshSurfaces().filter(o=>o.openingActSystem==='high-road');
  assert.equal(high.filter(o=>o.crumble).length,2);
  assert.ok(high.every(o=>o.y>=45));
  assert.ok(high.every(o=>o.w<=200));
  assert.match(stage,/encounterRole:'upper-sentry'/);
  assert.match(source,/updateOutskirtsPerception\(e,target,dt\)/);
  assert.match(source,/BFAISystem\.lineOfSight\(e,target\)/);
  assert.match(source,/en\.encounterRole==='upper-sentry'\)e\.shot=\{count:1/);
  assert.match(source,/bossShoot\(e,e\.openingAim\|\|target\);e\.openingAim=null;e\.openingAlertT=0/);
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
