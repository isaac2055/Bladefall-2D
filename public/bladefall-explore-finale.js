/* Explore's last encounter. Displayed worlds 41/42 preserve the old precision-course IDs. */
(function installExploreFinale(root){
'use strict';
const ECHO_STAGE=45, VESPER_STAGE=43, ZONE='final-echo';
const A2=root.BladefallActTwo, F=root.BladefallFractured;
const MAIN=Object.freeze([...Array.from({length:14},(_,i)=>i),...Array.from({length:26},(_,i)=>i+15)]);
const CHOICES=Object.freeze({kill:Object.freeze({power:1.15,title:'KILL',line:'You silence the voice. Your blade is sharper; the empty space still belongs to Vesper.'}),merge:Object.freeze({power:3,title:'MERGE',line:'You take the offered hand. Not forgiveness for everything. A promise to stop facing it alone.'}),forget:Object.freeze({power:.7,title:'FORGET',line:'You turn away. Part of your strength goes with the memory. The road remains open.'})});
function state(){return meta.exploreFinale||(meta.exploreFinale={cleared:[],choice:null,echoDefeated:false,vesperDefeated:false});}
function noteClear(stage){
 if(!G||G.stageIndex!==stage||meta.testMode||G.usedTestMode||G.coopSession||G.bossRush||G.ngPlus||!MAIN.includes(stage))return false;
 const s=state();s.cleared=Array.isArray(s.cleared)?s.cleared:[];
 if(!s.cleared.includes(stage)){s.cleared.push(stage);persist();}return true;
}
function allWorldsCompleted(){
 const s=state(),cleared=new Set(s.cleared||[]),world=new Set(meta.world?.cleared||[]);
 for(const stage of MAIN)if(world.has(BFWorldModule.stageId(stage)))cleared.add(stage);
 // Existing saved solo world finishes count; no online stranger's records and no unlock-only inference.
 const data=root.BladefallPlaytest?.state().data;
 const records=[...(data?.records||[]),...(Array.isArray(data?.archives)?data.archives.flatMap(a=>Array.isArray(a?.records)?a.records:[]):[])];
 for(const r of records)if(r?.mode==='explore'&&r.player===data.player&&r.eligible!==false)cleared.add(Number(r.world));
 return MAIN.every(i=>cleared.has(i));
}
function visible(){
 const host=root.location?.hostname||'',local=root.location?.protocol==='file:'||/^(localhost|127\.0\.0\.1|\[::1\])$/.test(host);
 return local||allWorldsCompleted();
}
function choice(){return G?.coopSession?G.finalEchoChoice||null:state().choice;}
function vesperMerged(){return !!(G?.vesperFromEcho&&G.vesperMergeReady&&choice()==='merge');}
function vesperWard(){return vesperMerged()?1:(G?.vesperFromEcho ? .25 : .01);}
function power(){return !G||G.battle||G.bossRush||G.vesperEncounter||[41,42,44].includes(G.stageIndex)||G.stageIndex===VESPER_STAGE&&!G.vesperFromEcho?1:(CHOICES[choice()]?.power||1);}
function resetInput(){if(typeof input==='object')for(const k of Object.keys(input))if(typeof input[k]==='boolean')input[k]=false;}
function travel(stage,encounter){
 const fromEcho=stage===VESPER_STAGE&&!encounter&&G.stageIndex===ECHO_STAGE&&G.actTwo?.won&&!!G.echoVictoryChoice;
 G.vesperFromEcho=!!fromEcho;G.vesperMergeReady=!!fromEcho&&G.echoVictoryChoice==='merge';
 G.vesperEncounter=!!encounter;G.finaleTransfer=true;G.zonePersistenceManifest=null;
 loadStage(stage);delete G.finaleTransfer;
 G.p.dead=false;G.p.vx=G.p.vy=0;G.p.x=stage===VESPER_STAGE?2920:420;G.p.y=0;
 restoreBlood(G.p,Infinity);G.p.invuln=1;G.p.ckSet=true;G.p.ckX=G.p.x;G.p.ckY=0;
 activateRuntimeCheckpoint((stage===VESPER_STAGE?'cloaked-man':'final-echo')+':arrival',{x:G.p.x,y:0},'checkpoint',null,true);
 G.checkpointLoadout=snapOf(G.p);saveRunAtStage(stage,G.checkpointLoadout);
 resetInput();mode='play';showOverlay(false);showGameUI(true);hudUpdate();
}
function card(title,line,buttons){
 mode='finale';showGameUI(false);resetInput();
 document.getElementById('toast')?.classList.remove('show');
 showOvHTML(`<div class="card"><p class="ovsub">EXPLORE · THE LAST ROAD</p><h1 class="title">${title}</h1><p class="hint" style="line-height:1.65;margin:20px 0;">${line}</p>${buttons.map((b,i)=>`<button class="bigbtn ${i?'ghost':''}" id="finale-${i}">${b.label}</button>`).join('')}</div>`);
 buttons.forEach((b,i)=>{document.getElementById('finale-'+i).onclick=b.act;});
}
function afterPalace(){
 noteClear(40);state().encounterReached=true;persist();
 card('VESPER','Beyond the fallen king, a cloaked figure waits.<br><br>“Forty roads, and still you bring only the half of yourself you can bear to look at.”',[
  {label:'Step beyond the throne',act:()=>travel(VESPER_STAGE,true)}]);
}
function encounterDefeat(){
 if(!G?.vesperEncounter)return false;
 G.vesperEncounter=false;G.p.dead=false;state().encounterDefeated=true;persist();
 card('A VOICE IN THE DARK','Vesper lowers his blade. “You cannot cut away what is missing.”<br><br>The fall has no floor. Then a familiar hand catches yours. Your Echo stands where Vesper stood.',[
  {label:'Face your final Echo',act:()=>travel(ECHO_STAGE,false)}]);return true;
}
function choose(value){
 if(!CHOICES[value]||!G||G.stageIndex!==ECHO_STAGE||!G.actTwo?.won)return false;
 G.echoVictoryChoice=value;
 if(G.coopSession)G.finalEchoChoice=value;else{state().choice=value;state().echoDefeated=true;persist();}
 card(CHOICES[value].title,CHOICES[value].line+'<br><br>Vesper waits beyond the mirror.',[
  {label:'Return to Vesper',act:()=>travel(VESPER_STAGE,false)}]);return true;
}
function choices(){
 card('THE FINAL ECHO','Your reflection lowers its sword. “I am the fear that kept you moving. The anger that kept you alive. You do not have to like all of me. But I am yours.”<br><br>This choice is saved. Defeat the Echo again to choose another path.',[
  {label:'Kill · +15% blade power; Vesper remains overwhelming',act:()=>choose('kill')},
  {label:'Merge · unite your strength and break Vesper’s ward',act:()=>choose('merge')},
  {label:'Forget · −30% blade power; leave the memory behind',act:()=>choose('forget')}]);
}
function ending(){
 if(!G.coopSession){state().vesperDefeated=true;meta.cloakedManDefeated=true;meta.gameBeaten=true;meta.run=null;persist();}
 const c=choice(),line=c==='merge'?'The cloak settles. Two shadows stand in the dawn, then move as one. You have not become someone else. You have stopped leaving yourself behind.':c==='kill'?'Vesper falls. You lift your blade, stronger, and listen for a voice that will not answer. The victory is yours; so is the silence.':'Vesper falls, and you cannot remember why the empty place beside you matters. You walk into morning carrying less than you brought.';
 card('VESPER IS STILL',line+'<br><br>EXPLORE COMPLETE<br><small>Vesper designed by Isaac’s little brother.</small>',[{label:'Return to title menu',act:titleScreen}]);
}
// Two readable phases, long recovery windows, no projectile curtains. Less demanding than Vesper's four forms.
const K=Object.freeze({len:2200,arena:[480,1980],pools:[220,260],tell:[.7,.6],recovery:[1.25,1.05],dashSpeed:680,jumpTell:.9});
function level(){return {len:K.len,portal:null,spawnX:420,spawnY:0,authoredEcology:true,objects:[GrAt(0,K.len,0),Pl(950,180,120),Pl(1550,180,120)],loot:[],npcs:[],enemies:[],build:init};}
function init(){
 const A=G.actTwo={stage:ECHO_STAGE,t:0,phase:0,hp:K.pools[0],maxHp:K.pools[0],fight:false,won:false,spawned:false,checkpoints:{},foe:null,waves:[],hitT:0};
 F.setKit(root.BladefallCloakedMan.constants.KIT);restoreBlood(G.p,Infinity);
 A.bar={label:'THE FINAL ECHO · THE PART YOU LEFT',hp:A.hp,maxHp:A.maxHp,active:true,dead:false,boss:true,x:1200,y:0,w:28,h:44};
}
function spawn(x=1550,clone=false){
 const A=G.actTwo,e=spawnEnemy('grunt',x);
 Object.assign(e,{actFoe:'finalEcho',echoClone:clone,kind:'fly',x,y:0,w:28,h:44,vx:0,vy:0,active:true,noDrop:true,boss:false,xp:0,maxHp:1e6,hp:1e6,hpWas:1e6,face:-1,st:'rest',t:0,order:0,portalGate:null,color:'#c9a8ff'});if(!clone)A.foe=e;A.spawned=true;return e;
}
function restoreFlagEcho(){
 const A=G?.actTwo;if(!A||A.stage!==ECHO_STAGE||A.won)return false;
 // A planted flag holds the fight; returning leaves another part of the Echo behind.
 const source=A.foe||G.enemies.find(e=>e.actFoe==='finalEcho');
 if(!source)return false;
 A.foe=source;A.spawned=true;G.boss=A.bar;
 const clone=spawn(Math.max(560,Math.min(1900,source.x+(source.x>1200?-180:180))),true);
 clone.order=(source.order||0)+1;clone.t=-.55;clone.st='rest';A.flagReturns=(A.flagReturns||0)+1;return true;
}
function overlap(p,x0,x1,y0,y1){return p.x+p.w/2>Math.min(x0,x1)&&p.x-p.w/2<Math.max(x0,x1)&&p.y+p.h>y0&&p.y<y1;}
function hit(p,e){if(!p.dead&&p.invuln<=0&&p.dodgeTimer<=0){if(typeof tryPlayerCounter==='function'&&tryPlayerCounter('melee',e.face,e)){e.st='rest';e.t=-.6;return;}hurtPlayer(20,e.face,true,3);}}
function updateFoe(e,p,dt){
 const A=G.actTwo;if(!A||A.stage!==ECHO_STAGE||e.actFoe!=='finalEcho')return;
 const loss=(Math.max(0,e.hpWas-e.hp)+(e.dead?1e6:0))*.25;e.hp=e.hpWas=1e6;e.dead=false;e.vx=e.vy=0;
 if(loss&&A.fight&&!A.won){A.hp=Math.max(0,A.hp-loss);A.hitT=.2;
  if(A.hp<=0){if(A.phase===0){A.phase=1;A.hp=A.maxHp=K.pools[1];A.bar.label='THE FINAL ECHO · STAY WITH ME';e.st='rest';e.t=-1;restoreBlood(p,2);}
   else{A.won=true;A.fight=false;for(const foe of G.enemies)if(foe.actFoe==='finalEcho'){foe.active=false;foe.portalGate='echo-yielded';}A.bar.dead=true;A.bar.active=false;G.boss=null;choices();return;}}}
 e.t+=dt;e.face=Math.sign(p.x-e.x)||e.face;
 if(!A.fight||A.won||p.dead)return;
 if(e.counterStunT>0){e.counterStunT=0;e.st='rest';e.t=-.45;}
 switch(e.st){
 case 'rest':if(e.t>K.recovery[A.phase]){e.st=e.order++%3===2?'leap-tell':'dash-tell';e.t=0;e.targetX=Math.max(560,Math.min(1900,p.x));e.dir=Math.sign(e.targetX-e.x)||e.face;}break;
 case 'dash-tell':if(e.t>K.tell[A.phase]){e.st='dash';e.t=0;}break;
 case 'dash':e.x=Math.max(520,Math.min(1940,e.x+e.dir*K.dashSpeed*dt));if(overlap(p,e.x-48,e.x+48,0,72))hit(p,e);if(e.t>.52||e.x===520||e.x===1940){e.st='rest';e.t=0;}break;
 case 'leap-tell':if(e.t>K.jumpTell){e.st='leap';e.t=0;e.fromX=e.x;}break;
 case 'leap':{const a=Math.min(1,e.t/.8);e.x=e.fromX+(e.targetX-e.fromX)*a;e.y=230*Math.sin(a*Math.PI);if(a>=1){e.y=0;e.st='rest';e.t=0;A.waves.push({x:e.x,dir:-1,t:0},{x:e.x,dir:1,t:0});}break;}
 }
 A.bar.hp=A.hp;A.bar.maxHp=A.maxHp;
}
function update(dt,p){
 const A=G.actTwo;if(!A||A.stage!==ECHO_STAGE)return;A.t+=dt;A.hitT=Math.max(0,A.hitT-dt);if(!A.spawned)spawn();
 if(A.won)return;if(!A.fight&&p.x>500){A.fight=true;G.boss=A.bar;}
 if(A.fight){p.x=Math.max(505,Math.min(1950,p.x));G.boss=A.bar;}
 for(const w of A.waves){w.t+=dt;w.x+=w.dir*280*dt;if(overlap(p,w.x-22,w.x+22,0,30))hit(p,A.foe);}A.waves=A.waves.filter(w=>w.t<3);
 F.checkpoints(A,p,ZONE,[{id:'mirror',x:420}]);
}
function draw(phase,api,e){
 const {B,WX,WY,Z,ctx}=api,A=api.G?.actTwo;if(!A||A.stage!==ECHO_STAGE)return false;
 if(phase==='backdrop'){F.art.sky(api,['#08091c','#24233d'],'final-echo');return true;}
 if(phase==='enemy'&&e.actFoe==='finalEcho'){
  api.drawFigure(WX(e.x)-6,WY(e.y)-22,{face:e.face,blade:true,air:e.y>0,dashing:e.st==='dash',run:e.st==='dash',anim:A.t*8,idle:A.t,atkT:e.st==='dash'?.7:e.st==='dash-tell'?.95:0,hurt:A.hitT>0,
   pal:{hood:'#b9b7d4',cloak:'#645087',cloakLit:'#a997d1',cloakDark:'#312940',scarf:'#86e6d8',skin:'#eee5ff',eye:'#30204d'}});return true;
 }
 if(phase==='world'){
  for(const w of A.waves)B(WX(w.x)-22*Z,WY(30),44*Z,30*Z,'#b5a3ed');
  for(const foe of api.G.enemies.filter(e=>e.actFoe==='finalEcho')){
   if(foe.st==='dash-tell')B(WX(foe.x),WY(4),(foe.dir*360)*Z,3*Z,'#f2b583');
   if(foe.st==='leap-tell')B(WX(foe.targetX)-35*Z,WY(5),70*Z,5*Z,'#f2b583');
  }return true;
 }
 if(phase==='overlay'){ctx.save();ctx.font='8px monospace';ctx.fillStyle='#d8cdf5';ctx.textAlign='center';ctx.fillText(A.won?'You can choose what comes next.':'READ THE CUT · JUMP THE WAVE · STRIKE THE RECOVERY',api.bw/2,api.bh-16);ctx.restore();return true;}
 return false;
}
A2.register(ECHO_STAGE,Object.freeze({level,update,updateFoe,interact:()=>false,swing(){},voidFloor:()=>-120,cameraFloor:()=>0,seamSpec:()=>null,musicCue:()=>({id:'final-echo',src:'./audio/music/fractured-the-last-spark-of-darrow.mp3',title:'The Last Spark of Darrow',artist:'Aerth score'})}));
root.BladefallActTwoArt.register(ECHO_STAGE,Object.freeze({draw}));
root.BladefallExploreFinale=Object.freeze({ECHO_STAGE,VESPER_STAGE,MAIN,CHOICES,K,state,noteClear,allWorldsCompleted,visible,choice,power,vesperMerged,vesperWard,restoreFlagEcho,travel,afterPalace,encounterDefeat,choose,ending});
})(typeof window!=='undefined'?window:globalThis);
