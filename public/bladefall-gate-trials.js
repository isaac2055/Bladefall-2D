/* Gate Trials (7.251): abyssal walls that crash down across the road and are answered in the
   Precision Core. Approaching one brings it down from the sky; pressing Up at it (or talking to
   the person waiting by it) opens precision.html?trial=… in a frame over the world. Clearing the
   trial's levels breaks the wall open for good. Olan and Mara join the knight along the way.

   Levels are Precision Core chapter numbers (level 1 = the first chapter of Part I).
   A gate with `levels:null` is placed and falls like the others, but its levels are not built
   yet: it lets the knight through for the current visit and says what is planned.

   The main game owns every rule outside the frame. This module only adds walls to G.obstacles,
   draws them, runs short scenes, and keeps its state in meta.gateTrials (or a session copy in
   Level Select and co-op). TAS runs (BF_TAS_ENABLED, unless ?gates is set), co-op sessions and
   index.html?gates=off (for route bots and regression runs) see every gate as already open. */
(function(root){
'use strict';

const WALL_W=104,WALL_TOP=3200,WALL_H=3400,FALL_T=1.05,OPEN_T=1.4;
const GATES=[
 // ---- The Outskirts (stage 0)
 {id:'olan',stage:0,x:5020,trigger:{minX:4700},levels:[1,5],title:"Olan's Gate",host:'olan',
  planned:'Part I · First Ascent, levels 1–5'},
 {id:'mara',stage:0,x:10580,trigger:{minX:10250},levels:[6,9],title:"Mara's Gate",host:'mara',
  planned:'Part I · First Ascent, levels 6–9'},
 // ---- Black Woods (stage 1)
 {id:'hale',stage:1,x:2420,trigger:{minX:2080},levels:[10,14],title:"Hale's Gate",host:'hale',
  planned:'Part II · The Deep Climb, levels 10–14'},
 {id:'bram',stage:1,x:7060,trigger:{minX:6750},levels:[15,19],title:"Bram's Gate",host:'bram',
  planned:'Part II · The Deep Climb, levels 15–19'},
 // ---- Broken Causeway (stage 2): the Drop Yard repair opens the way to the first gate;
 // the second only comes down once the Brute is dead, across the road back west.
 {id:'causeway-yard',stage:2,x:5480,trigger:{minX:5390},levels:[20,24],title:'The Drop Yard Gate',
  planned:'Part III · The High Road, levels 20–24'},
 {id:'causeway-brute',stage:2,x:10480,trigger:{bruteDead:true},levels:[25,29],title:"The Brute's Gate",
  planned:'Part III · The High Road, levels 25–29'},
 // ---- Updrafts (stage 3): behind the two wind gates.
 {id:'updrafts-choir',stage:3,x:8480,trigger:{minX:8400},levels:[30,34],title:'The Choir Gate',
  planned:'Part IV · Foes, levels 30–34'},
 {id:'updrafts-vane',stage:3,x:13480,trigger:{minX:13400},levels:[35,39],title:'The Vane Gate',
  planned:'Part IV · Foes, levels 35–39'},
 // ---- Hollow Marksman (stage 4)
 {id:'marksman-watch',stage:4,x:880,trigger:{minX:560},levels:[40,49],title:'The Watch Gate',host:'marksman-mara',
  planned:'Part IV · Foes, levels 40–49'},
 {id:'marksman-mantlet',stage:4,x:8700,trigger:{minX:8620},levels:[50,54],title:'The Mantlet Gate',
  planned:'Part V · Portals, levels 50–54 (one portal)'},
 {id:'marksman-clearance',stage:4,x:14916,w:40,trigger:{minX:14700,bossDead:true},levels:[55,59],title:'The Deadeye Gate',
  planned:'Part V · Portals, levels 55–59 (two portals)'},
 // ---- Ruined Keep (stage 5)
 {id:'keep-weight',stage:5,x:8020,trigger:{minX:7940},levels:[60,64],title:'The Weight Gate',
  planned:'Part VI · Portals and Everything Before, levels 60–64'},
 {id:'keep-grip',stage:5,x:13200,w:52,trigger:{minX:13130},levels:[65,69],title:'The Grip Gate',
  planned:'Part VI · Portals and Everything Before, levels 65–69'},
 // Optional: on the return stair between the belfry and the Deep Line landing. Nothing behind it is
 // needed now; from the Abyss King's side it becomes the shortcut home.
 {id:'keep-stair',stage:5,x:17235,w:50,trigger:{near:320},levels:[70,74],title:'The Stair Gate',host:'keep-sweeper',optional:true,
  planned:'Momentum X1–X5, levels 70–74'},
 // ---- The Warden / the Gaol (stage 6). Walked WEST, so the approach triggers are maxX.
 // Behind the Hush Engine's portcullis (the two brakes), and past the Sentence Well once he falls.
 {id:'warden-hush',stage:6,x:7780,trigger:{maxX:7860},levels:[75,78],title:'The Hush Gate',
  planned:'Part VII · The Gaol, levels 75–78'},
 {id:'warden-well',stage:6,x:400,trigger:{bossDead:true,minX:490},levels:[79,82],title:'The Sentence Gate',
  planned:'Part VII · The Gaol, levels 79–82'},
 // ---- Frostfell (stage 7): behind the hearth door, and behind the thermal door before the Second Step.
 {id:'frost-hearth',stage:7,x:4760,w:52,trigger:{minX:4700},levels:[83,86],title:'The Hearth Gate',
  planned:'Part VIII · Frostfell, levels 83–86'},
 {id:'frost-thermal',stage:7,x:6580,w:60,trigger:{minX:6525},levels:[87,90],title:'The Thermal Gate',
  planned:'Part VIII · Frostfell, levels 87–90'},
 // ---- White Court (stage 8): behind the Glassworks' cold gate, and between the tribunal and the Ember Door.
 {id:'court-glass',stage:8,x:10580,trigger:{minX:10480},levels:[91,94],title:'The Glass Gate',
  planned:'Part IX · The White Court, levels 91–94'},
 {id:'court-tribunal',stage:8,x:15330,trigger:{bossDead:true,minX:15120},levels:[95,98],title:'The Tribunal Gate',
  planned:'Part IX · The White Court, levels 95–98'},
 // ---- Emberdeep (stage 9): past the Draw's seal and Oren's pad, and past the pour floor's far post.
 {id:'ember-draw',stage:9,x:8060,trigger:{minX:7960},levels:[99,102],title:'The Draw Gate',
  planned:'Part X · Emberdeep, levels 99–102'},
 {id:'ember-pour',stage:9,x:14470,w:60,trigger:{minX:14390},levels:[103,106],title:'The Pour Gate',
  planned:'Part X · Emberdeep, levels 103–106'},
 // ---- The Foundry (stage 10): behind the counterweight gate, and on the fissure floor once the Colossus falls.
 {id:'foundry-anvil',stage:10,x:4370,trigger:{minX:4290},levels:[107,110],title:'The Anvil Gate',
  planned:'Part XI · The Foundry, levels 107–110'},
 {id:'foundry-fissure',stage:10,x:15720,trigger:{bossDead:true,minX:15480},levels:[111,114],title:'The Casting Gate',
  planned:'Part XI · The Foundry, levels 111–114'},
 // ---- The Inversion (stage 11), walked WEST: behind the drop-lock's second door, and in the Void Fissure
 // after the Path of Inversion.
 {id:'inversion-lock',stage:11,x:8545,w:52,trigger:{maxX:8595},levels:[115,118],title:'The Drop-Lock Gate',
  planned:'Part XII · Inversion, levels 115–118'},
 {id:'inversion-fissure',stage:11,x:1100,trigger:{maxX:1240},levels:[119,122],title:'The Fissure Gate',
  planned:'Part XII · Inversion, levels 119–122'},
 // ---- The Citadel / Void Tyrant (stage 12), walked WEST: on the far bank past Oren's zip-line, and
 // between the three-band arena and the Throne Gate once the Tyrant falls.
 {id:'citadel-line',stage:12,x:11650,trigger:{maxX:11820},levels:[123,127],title:'The Line Gate',
  planned:'Part XIII · The Citadel, levels 123–127'},
 {id:'citadel-crown',stage:12,x:330,trigger:{bossDead:true,minX:400},levels:[128,131],title:'The Crown Gate',
  planned:'Part XIII · The Citadel, levels 128–131'},
 // ---- The Drowned Throne (stage 13): off the Two Marks' exit shelf (past the door's echo latch), and
 // between the throne and the rail head once the King falls.
 {id:'throne-marks',stage:13,x:4910,w:52,trigger:{minX:4690},levels:[132,135],title:'The Marks Gate',
  planned:'Part XIV · The Throne, levels 132–135'},
 {id:'throne-rail',stage:13,x:18100,trigger:{bossDead:true,minX:17990},levels:[136,139],title:'The Rail Gate',
  planned:'Part XIV · The Throne, levels 136–139'},
 // ---- The Deep Line (stage 15). A cart level ridden both ways: `deepReturn` installs a gate only on its
 // own ride. East: where the first fork's two lines rejoin. West, toward the Throne and the boat: on the
 // broad landing past the Black Gap, the last flat ground before the rail head.
 {id:'line-fork',stage:15,x:4500,trigger:{minX:4300,deepReturn:false},levels:[140,144],title:'The Fork Gate',
  planned:'Part XV · The Deep Line, levels 140–144'},
 {id:'line-return',stage:15,x:700,trigger:{maxX:900,deepReturn:true},levels:[145,149],title:'The Homeward Gate',
  planned:'Part XV · The Deep Line, levels 145–149'},
 // ---- Thunder Cliffs (stage 16): on the pier once the ship docks, and at the quay's lip after the release.
 {id:'cliffs-pier',stage:16,x:2900,trigger:{docked:true,minX:2500},levels:[150,154],title:'The Pier Gate',
  planned:'Part XVI · Thunder Cliffs, levels 150–154'},
 {id:'cliffs-lip',stage:16,x:3200,trigger:{bossDead:true,maxX:3450},levels:[155,159],title:'The Staple Gate',
  planned:'Part XVI · Thunder Cliffs, levels 155–159'},
 // ---- The Landing Shores (stage 17): behind the Sun Arch, and past the Colony Gate's palisade.
 {id:'shores-arch',stage:17,x:8500,trigger:{minX:8420},levels:[160,164],title:'The Sun Arch Gate',
  planned:'Part XVII · The Landing Shores, levels 160–164'},
 {id:'shores-palisade',stage:17,x:12560,trigger:{minX:12460},levels:[165,169],title:'The Palisade Gate',
  planned:'Part XVII · The Landing Shores, levels 165–169'},
 // ---- The Colony (stage 18): behind the well's yard gate, and behind the road gate.
 {id:'colony-yard',stage:18,x:7720,w:60,trigger:{minX:7650},levels:[170,174],title:'The Yard Gate',
  planned:'Part XVIII · The Colony, levels 170–174'},
 {id:'colony-road',stage:18,x:10500,trigger:{minX:10370},levels:[175,179],title:'The Road Gate',
  planned:'Part XVIII · The Colony, levels 175–179'},
 // ---- The Path to the Palace (stage 19): on the apron past the Hydra Overlook, and behind the Sun Gate.
 {id:'path-overlook',stage:19,x:7120,trigger:{minX:6940},levels:[180,184],title:'The Overlook Gate',
  planned:'Part XIX · Palace Path, levels 180–184'},
 {id:'path-sun',stage:19,x:9900,trigger:{minX:9680},levels:[185,189],title:'The Palace Gate',
  planned:'Part XIX · Palace Path, levels 185–189'},
 // ---- Sunspire (stage 20): behind the Sun Court's gate, and on the sea terrace after the King in Daylight.
 {id:'sunspire-court',stage:20,x:2840,trigger:{minX:2760},levels:[190,194],title:'The Court Gate',
  planned:'Part XX · Sunspire, levels 190–194'},
 {id:'sunspire-terrace',stage:20,x:10860,trigger:{minX:10760},levels:[195,199],title:'The Terrace Gate',
  planned:'Part XX · Sunspire, levels 195–199'},
 // Optional: the far end of the terrace, past the hydra. Nothing is behind it; the ride leaves from the
 // hydra's head, west of it, and its short reach keeps it out of the boarding.
 {id:'sunspire-last',stage:20,x:11650,w:40,trigger:{minX:11575,near:80},levels:[200,200],title:'The Last Gate',optional:true,
  planned:'Level 200, the capstone'},
];
const byId=Object.fromEntries(GATES.map(g=>[g.id,g]));
const OFF=false;   // baseline switch for comparisons: true removes every gate and the party

/* ---------------------------------------------------------------- state */
function blank(){return {fallen:{},cleared:{},level:{},party:{olan:'',mara:''},seen:{}};}
function session(){return !!(G&&(G.levelSelectMode||G.coopSession));}
function state(){
 if(session()){if(!G.sessionGateTrials)G.sessionGateTrials=seedSession(G.stageIndex);return G.sessionGateTrials;}
 if(!meta.gateTrials)meta.gateTrials=blank();
 const s=meta.gateTrials;for(const k of ['fallen','cleared','level','seen'])if(!s[k])s[k]={};if(!s.party)s.party={olan:'',mara:''};
 return s;
}
function save(){if(!session()&&typeof persist==='function')persist();}
// Level Select starts mid-story: every gate in an earlier region is behind you, and the party is
// whoever would be walking with you by then.
function seedSession(stage){
 const s=blank();
 for(const g of GATES)if(g.stage<stage){s.fallen[g.id]=true;s.cleared[g.id]=true;}
 if(stage>=1){s.party.olan='with';s.party.mara='with';}
 if(stage>=2){s.party.olan='lamp';s.party.mara='ahead';}
 return s;
}
function bypassed(){
 try{if(new URLSearchParams(location.search).get('gates')==='off')return true;}catch(e){}   // route bots and regression runs
 if(typeof BF_TAS_ENABLED!=='undefined'&&BF_TAS_ENABLED){try{return !new URLSearchParams(location.search).has('gates');}catch(e){return true;}}
 return !!(G&&(G.coopSession||G.mergeRoad));   // Merge Pitch C plays the road without gates
}
function isOpen(g){const s=state();return !!(s.cleared[g.id]||bypassed()||(g.levels===null&&G.gateWaived&&G.gateWaived[g.id]));}
function party(){return state().party;}

/* ---------------------------------------------------------------- install (after each stage build) */
function install(){
 if(OFF||!G||!G.obstacles)return;
 G.obstacles=G.obstacles.filter(o=>!o.gateTrial);
 G.gateScene=null;G.gateTrail=[];G.gateWaived=G.gateWaived&&G.gateWaived.stage===G.stageIndex?G.gateWaived:{stage:G.stageIndex};
 const s=state();
 for(const g of GATES){
  if(g.stage!==G.stageIndex)continue;
  if(g.trigger&&g.trigger.deepReturn!==undefined&&!!G.deepLineReturn!==g.trigger.deepReturn)continue;   // the Deep Line's two rides
  const open=isOpen(g),fallen=!!s.fallen[g.id]||open;
  G.obstacles.push({type:'wall',gateTrial:g.id,gateTrialWall:1,x:g.x,y:WALL_TOP,h:WALL_H,w:g.w||WALL_W,
   clingSurface:0,noCling:1,gone:!fallen||open,fallen,open,fallT:fallen?FALL_T:0,openT:open?OPEN_T:0,seed:g.x});
 }
 if(G.stageIndex===5)placeSweeper();
 placeParty();
}
function wallOf(id){return G.obstacles.find(o=>o.gateTrialWall&&o.gateTrial===id);}

/* ---------------------------------------------------------------- party: Olan and Mara */
const PARTY_LOOK={
 olan:{name:'Olan',title:'Road Keeper',pal:{cloak:'#5d5a52',cloakLit:'#8b8779',cloakDark:'#37352f',hood:'#2c2a26',scarf:'#b89a5e',skin:'#cdb294',eye:'#f0e2c0'},gap:46},
 mara:{name:'Mara',title:'Road Surveyor',pal:{cloak:'#6f6a4e',cloakLit:'#a39c74',cloakDark:'#45412f',hood:'#3a3627',scarf:'#d9cfa8',skin:'#d8bf9f',eye:'#fff1cc'},gap:92},
 bram:{name:'Bram',title:'Lamp Carrier',pal:{cloak:'#4f5a41',cloakLit:'#7d8a66',cloakDark:'#303827',hood:'#262d20',scarf:'#b9b884',skin:'#cfb497',eye:'#eef0c8'}},
 sweeper:{name:'Idris',title:'Bell-Sweeper',pal:{cloak:'#5a4f5c',cloakLit:'#877a8b',cloakDark:'#352e37',hood:'#2a242c',scarf:'#b18a5b',skin:'#cbb198',eye:'#efe2cc'}},
};
function followers(){
 const pt=party(),out=[];
 if(pt.olan==='with'||(pt.olan==='lamp'&&G.stageIndex!==1))out.push('olan');
 if(pt.mara==='with'&&G.stageIndex<=1)out.push('mara');
 return out;
}
function placeParty(){
 const p=G.p;if(!p)return;
 G.gateTrail=[{x:p.x,y:p.y}];
 followers().forEach((who,i)=>{
  const f={type:'gateParty',gateTrial:'party',who,x:p.x-(PARTY_LOOK[who].gap),y:p.y,w:26,h:48,face:1,idx:0,moving:false,lead:(i+1)};
  G.obstacles.push(f);
 });
 const pt=party();
 // Olan has left his post at the verge; Mara walks with you instead of waiting at the Muster.
 if(G.stageIndex===0&&pt.olan)G.obstacles=G.obstacles.filter(o=>!(o.type==='ambientFigure'&&o.residentId==='outskirts-roadkeeper'));
 if(G.stageIndex===0&&pt.mara==='with'&&G.npcs)G.npcs=G.npcs.filter(n=>n.profileId!=='mara');
 // Black Woods after Bram's gate: Olan carries Bram's lamp; Bram stays by his gate.
 if(G.stageIndex===1&&pt.olan==='lamp')skinLampBearer(false);
}
function skinLampBearer(fresh){
 const n=(G.npcs||[]).find(n=>n.profileId==='bram');
 if(!n)return;
 n.gateSkin='olan';n.name='Olan';
 if(!n.done&&(fresh||n.state==='idle')){n.state='follow';if(typeof coopSendTravelerIntent==='function')try{coopSendTravelerIntent(n,'follow');}catch(e){}}
 if(fresh){n.x=G.p.x-40;n.y=G.p.y;n.vx=0;n.vy=0;}
 const gate=byId.bram;
 if(!G.obstacles.some(o=>o.gateTrial==='bram-post'))
  G.obstacles.push({type:'gateParty',gateTrial:'bram-post',who:'bram',x:gate.x-150,y:0,w:26,h:48,face:1,still:true});
}
function placeSweeper(){
 const g=byId['keep-stair'];
 G.obstacles.push({type:'gateParty',gateTrial:'keep-sweeper',who:'sweeper',x:g.x-120,y:760,w:26,h:48,face:1,still:true});
}
function updateParty(dt){
 const p=G.p,trail=G.gateTrail;if(!p||!trail)return;
 const last=trail[trail.length-1];
 if(!last||Math.hypot(p.x-last.x,p.y-last.y)>1.5)trail.push({x:p.x,y:p.y});
 if(trail.length>900){const cut=trail.length-900;trail.splice(0,cut);for(const f of G.obstacles)if(f.type==='gateParty'&&!f.still)f.idx=Math.max(0,f.idx-cut);}
 for(const f of G.obstacles){
  if(f.type!=='gateParty'||f.still)continue;
  if(f.leaving){f.x+=f.face*340*dt;f.moving=true;if(Math.abs(f.x-p.x)>900)f.gone=true;continue;}
  const gap=PARTY_LOOK[f.who].gap;let steps=0;const ox=f.x;
  while(f.idx<trail.length-1&&steps<3&&Math.hypot(trail[f.idx+1].x-p.x,trail[f.idx+1].y-p.y)>gap){f.idx++;steps++;}
  if(trail.length-1-f.idx>320)f.idx=trail.length-1-60;   // fell far behind: close the distance
  const t=trail[Math.min(f.idx,trail.length-1)];
  if(Math.hypot(t.x-p.x,t.y-p.y)>gap||f.idx===0){f.x=t.x;f.y=t.y;}
  f.moving=Math.abs(f.x-ox)>.4;if(f.moving)f.face=Math.sign(f.x-ox)||f.face;else f.face=Math.sign(p.x-f.x)||f.face;
 }
}

/* ---------------------------------------------------------------- dialogue */
const LINES={
 olan:{
  offer:['“Every time I come to it, it drops like that. Like it heard me coming.”',
   '“It isn’t locked. It’s asking. There are things it wants done — climbs, crossings — and I can’t do them on my own. I’ve tried.”',
   '“Will you help me through?”'],
  help:'“Then come — stay close. It opens from inside, if you’re quick enough.”',
  refuse:'“…I’m sorry. I’m not asking twice.”',
  thanks:'“You did it. I’ve stood at that wall half my life and never once seen what’s past it. Mind if I walk with you? I’d like to see where the road goes.”',
  back:'“Still there? It’ll wait. So will I.”',
  follow:['“I keep thinking it’ll come down again behind us.”','“Mara said the road bends north after the Muster. I’ve never seen it bend.”','“Lead on. I’m right behind you.”'],
 },
 mara:{
  offer:['“You two as well? It came down in front of me an hour ago. I’ve been measuring it since. It doesn’t measure.”',
   '“Olan. You got through yours? …Then help me with mine. Black Woods is on the other side, and I mean to chart it.”'],
  thanks:'“Well. That’s the strangest survey I’ll ever file. Come on, both of you — the Woods won’t map themselves.”',
  follow:['“Stay on the path. The Woods move the path when you’re not looking.”','“I’m writing all this down. Nobody will believe any of it.”'],
  ahead:'“I’ll run ahead and see what the roots are hiding. Don’t dawdle — I won’t wait forever.”',
 },
 hale:{
  offer:['“Visitors. Figured as much — nobody comes this deep for the trees.”',
   '“You’ll want to see the gate. Everyone does. Go on, then; show them how it’s done.”'],
  thanks:'“Huh. Faster than the last lot. The Woods are yours, for what they’re worth.”',
 },
 bram:{
  offer:['“No. Not through that. I’ve watched it swallow people whole and spit them out on the far side, shaking.”',
   '“You go. I’ll… I’ll hold the lamp here. For when you come back.”'],
  thanks:'“You came out. You actually came out.” He looks at the lamp, then at Olan. “I can’t go past it. You carry it — you’re braver than me. It shows what’s real in the Thicket. Keep it lit.”',
  after:'“Go on. The lamp’s better with you than with me.”',
 },
 'marksman-mara':{
  offer:['“There you are. This one’s a beauty — the best of them yet. Ten turns of it, and not one of them kind.”'],
  aside:'(How did she get here before you? You left her behind in the Woods… You let it go. There is a gate to answer.)',
 },
 'keep-sweeper':{
  offer:['“Nothing behind that wall worth finding, friend. Just the stair and the damp.”',
   '“You’ve already got the grip. Whatever’s down there, you’ll come up the other side of it soon enough — then maybe you’ll want it open.”',
   '“Still. It’ll let you try now, if you’re stubborn.”'],
 },
 wall:'The wall is black the way deep water is black. Something in it is listening.',
};
function speak(title,lines,choices,accent,onDone){
 const list=[].concat(lines);let i=0;
 const step=()=>{
  const last=i===list.length-1,text=list[i];
  BladefallConversation.show({title,text,accent:accent||'#9b8cff',
   choices:last?(choices||[{label:'Continue',action:()=>close(onDone)}]):[{label:'Continue',action:()=>{i++;step();}}],
   onClose:()=>{if(G&&mode==='conversation'){mode='play';showGameUI(true);}}});
  mode='conversation';
 };
 step();
}
function close(then){
 try{BladefallConversation.close();}catch(e){}
 if(G&&mode==='conversation'){mode='play';showGameUI(true);}
 if(typeof BFKeyboard!=='undefined')BFKeyboard.clearPressed();
 if(then)then();
}

/* ---------------------------------------------------------------- scenes (input locked) */
function beginScene(kind,gate,extra){G.gateScene={kind,gate,t:0,...extra};}
function endScene(){G.gateScene=null;try{BFCamera.reset(G.cam,G.camY);}catch(e){}}
function crashSound(x){
 if(!meta.soundOn||typeof impactSfx!=='function')return;
 try{impactSfx({layers:[[180,34,1.4,0.42,'lowpass',1.1],[1400,160,0.55,0.16,'bandpass',0.7],[60,28,1.8,0.3,'lowpass',0.9]],body:.38,bodyF:34,bodyDur:1.4,drop:.62},'hit',x,'[the sky splits — something vast lands]');}catch(e){}
}
function openSound(x){
 if(!meta.soundOn)return;
 try{if(typeof tonalSfx==='function')tonalSfx('gate-open',[[0,[.16,,392,.02,.4,.6,1]],[.18,[.14,,587,.02,.5,.8,1]],[.4,[.12,,784,.03,.6,1,1]]],x);else SFX.levelup();}catch(e){try{SFX.levelup();}catch(_){}}
}
function dust(o,n,col){
 if(!G.particles)return;
 for(let i=0;i<n;i++){const s=Math.random()<.5?-1:1;G.particles.push({x:o.x+s*(o.w/2+Math.random()*30),y:GROUND_Y-landY(o)-Math.random()*20,
  vx:s*(60+Math.random()*240),vy:-40-Math.random()*180,sz:2+Math.random()*3,color:col||(i%3?'#2a2140':'#8a7dff'),life:.6+Math.random()*.7});}
}
// The wall stands on whatever floor is under it; for the landing dust use the knight's height if close.
function landY(o){return Math.abs(G.p.x-o.x)<700?G.p.y:0;}
function updateScene(dt){
 const sc=G.gateScene,p=G.p,wall=sc.gate&&wallOf(sc.gate.id);
 sc.t+=dt;G.time+=dt;G.shake=(G.shake||0)*.9;
 p.jumpBuf=p.atkBuf=p.dashBuf=0;
 // Frame the knight and the wall together while the scene holds the camera.
 if(typeof VW!=='undefined'){const fx=wall?(p.x+wall.x)/2:p.x,tx=Math.max(0,Math.min((G.levelLength||1e9)-VW,fx-VW*.5));G.cam+=(tx-G.cam)*Math.min(1,dt*3);}
 if(sc.kind!=='kick'){p.vx=0;p.vy=0;}
 if(sc.kind==='fall'){
  wall.fallT=Math.min(FALL_T,sc.t);
  if(!sc.landed&&sc.t>=FALL_T){
   sc.landed=true;wall.gone=false;wall.fallen=true;state().fallen[sc.gate.id]=true;save();
   // Nothing is ever crushed: a knight inside the footprint is set down on the side he came from.
   const half=wall.w/2+14;if(Math.abs(p.x-wall.x)<half)p.x=wall.x+(sc.side||-1)*half;
   G.shake=meta.reducedMotion?0:22;G.hitstop=4;dust(wall,34);crashSound(wall.x);if(typeof buzz==='function')buzz(120);
  }
  if(sc.t>=FALL_T+.9){endScene();afterFall(sc.gate);}
  return true;
 }
 if(sc.kind==='guide'||sc.kind==='kick'){
  const face=Math.sign(wall.x-p.x)||1,target=wall.x-face*(wall.w/2+6);
  if(sc.kind==='guide'){p.x+=Math.sign(target-p.x)*Math.min(Math.abs(target-p.x),220*dt);p.face=face;if(Math.abs(target-p.x)<1&&sc.t<1.1)sc.t=Math.max(sc.t,.9);}
  else{
   if(sc.t<.35){const olan=G.obstacles.find(o=>o.type==='gateParty'&&o.who==='olan')||sc.olan;if(olan){olan.x+= (p.x-face*30-olan.x)*Math.min(1,dt*12);olan.face=face;}}
   else{if(!sc.hit){sc.hit=true;G.shake=meta.reducedMotion?0:12;if(meta.soundOn)try{SFX.hurt();}catch(e){}sc.x0=p.x;}
    const k=Math.min(1,(sc.t-.35)/.45);p.x=sc.x0+(target-sc.x0)*k;p.y=sc.y0+Math.sin(k*Math.PI)*70;p.face=face;}
  }
  if(sc.t>=(sc.kind==='kick'?.95:(Math.abs(target-p.x)<1?1.1:2.2))){p.y=sc.y0;endScene();enterTrial(sc.gate);}
  return true;
 }
 if(sc.kind==='open'){
  wall.openT=Math.min(OPEN_T,sc.t);
  if(sc.t>.35&&!wall.gone){wall.gone=true;dust(wall,26,'#b8adff');openSound(wall.x);G.shake=meta.reducedMotion?0:6;}
  if(sc.t>=OPEN_T){wall.open=true;endScene();afterOpen(sc.gate);}
  return true;
 }
 if(sc.kind==='mara-leaves'){
  if(sc.t>1.6){endScene();}
  return true;
 }
 endScene();return false;
}

/* ---------------------------------------------------------------- triggers */
function triggered(g){
 const p=G.p,t=g.trigger||{};
 if(t.bruteDead&&!(G.stageIndex===2&&(G.bossDone||(G.boss&&G.boss.dead))))return false;
 if(t.bossDead&&!(G.bossDone||(G.boss&&G.boss.dead)))return false;
 if(t.docked&&!(G.actTwo&&G.actTwo.docked))return false;   // Thunder Cliffs: only once the ship is in
 if(t.minX!==undefined&&p.x<t.minX)return false;
 if(t.maxX!==undefined&&p.x>t.maxX)return false;          // regions walked west
 // Only a wall the knight is actually walking up to comes down (not one far behind a seam or checkpoint).
 if(Math.abs(p.x-g.x)>(t.near!==undefined?t.near:700))return false;
 return true;
}
function checkFalls(){
 const s=state();
 for(const g of GATES){
  if(g.stage!==G.stageIndex||s.fallen[g.id]||isOpen(g))continue;
  const wall=wallOf(g.id);if(!wall||!triggered(g))continue;
  beginScene('fall',g,{side:Math.sign(G.p.x-g.x)||-1});
  return true;
 }
 return false;
}
function afterFall(g){
 // A person waiting by the gate speaks as soon as the dust settles.
 if(g.host==='olan'&&!party().olan)return hostTalk(g);
 if(g.host==='mara'&&party().mara!=='with')return hostTalk(g);
 if(g.host==='marksman-mara'||g.host==='hale'||g.host==='bram')return hostTalk(g);
 if(G.p)addTextSafe(g.x,'UP · ANSWER THE GATE','#b8adff');
}
function addTextSafe(x,txt,col){try{addText(x,GROUND_Y-(G.p.y||0)-120,txt,col,true);}catch(e){}}

/* ---------------------------------------------------------------- talking at a gate */
const AGAIN={olan:['OLAN',LINES.olan.back],mara:['MARA','“Ready? The Woods aren’t getting any closer.”'],hale:['HALE','“Still here? Go on. They’re watching.”'],
 bram:['BRAM','“I’ll hold the lamp. You go.”'],'marksman-mara':['MARA','“Ten turns. I’ll wait at the top.”']};
function hostTalk(g){
 const L=LINES,tell=(who,lines,choices,then)=>speak(who,lines,choices,'#b8adff',then),st=state();
 // A second visit is a short word, not the whole introduction.
 if(st.seen[g.id]&&AGAIN[g.host]){const [who,line]=AGAIN[g.host];
  return tell(who,line,[{label:'Into the gate',action:()=>close(()=>startGuide(g))},{label:'Not yet',action:()=>close()}]);}
 if(g.host){st.seen[g.id]=true;save();}
 if(g.host==='olan'){
  return tell('OLAN · ROAD KEEPER',L.olan.offer,[
   {label:'I’ll help you through.',action:()=>{close();speak('OLAN',L.olan.help,[{label:'Into the gate',action:()=>close(()=>startGuide(g))}]);}},
   {label:'Find someone else.',action:()=>{close();speak('OLAN',L.olan.refuse,[{label:'…',action:()=>close(()=>startKick(g))}]);}}]);
 }
 if(g.host==='mara'){
  return tell('MARA · ROAD SURVEYOR',L.mara.offer,[{label:'Into the gate',action:()=>close(()=>startGuide(g))},{label:'Not yet',action:()=>close()}]);
 }
 if(g.host==='hale')return tell('HALE',L.hale.offer,[{label:'Into the gate',action:()=>close(()=>startGuide(g))},{label:'Not yet',action:()=>close()}]);
 if(g.host==='bram')return tell('BRAM',L.bram.offer,[{label:'Into the gate',action:()=>close(()=>startGuide(g))},{label:'Not yet',action:()=>close()}]);
 if(g.host==='marksman-mara'){
  return tell('MARA',L['marksman-mara'].offer,[{label:'Continue',action:()=>{close();
   speak('',L['marksman-mara'].aside,[{label:'Into the gate',action:()=>close(()=>startGuide(g))},{label:'Not yet',action:()=>close()}],'#6d6a80');}}]);
 }
 if(g.host==='keep-sweeper'){
  return tell('IDRIS · BELL-SWEEPER',L['keep-sweeper'].offer,[{label:'Try the gate anyway',action:()=>close(()=>gateCard(g))},{label:'Leave it',action:()=>close()}]);
 }
 return gateCard(g);
}
function gateCard(g){
 if(g.levels===null){
  return speak(g.title.toUpperCase(),[LINES.wall,`Its trial is not carved yet. Planned: ${g.planned}.`,'For now the wall lets you through.'],
   [{label:'Pass through',action:()=>close(()=>waive(g))},{label:'Not yet',action:()=>close()}]);
 }
 const s=state(),at=s.level[g.id];
 const where=at&&at>g.levels[0]?` You reached level ${at} last time.`:'';
 speak(g.title.toUpperCase(),[LINES.wall,`Levels ${g.levels[0]}–${g.levels[1]} of the Precision Core.${where}`],
  [{label:'Answer the gate',action:()=>close(()=>startGuide(g))},{label:'Not yet',action:()=>close()}]);
}
function startGuide(g){const p=G.p;beginScene('guide',g,{y0:p.y});}
function startKick(g){
 const p=G.p,olan=G.obstacles.find(o=>o.type==='ambientFigure'&&o.residentId==='outskirts-roadkeeper');
 beginScene('kick',g,{y0:p.y,olan});
}
function waive(g){G.gateWaived[g.id]=true;const w=wallOf(g.id);if(w)beginScene('open',g);}

/* ---------------------------------------------------------------- the trial frame */
let frame=null,listening=false;
function enterTrial(g){
 const s=state(),start=Math.max(g.levels[0],Math.min(g.levels[1],s.level[g.id]||g.levels[0]));
 mode='gate-trial';try{showGameUI(false);}catch(e){}
 const music=document.getElementById('bgMusic');if(music)try{music.pause();}catch(e){}
 if(!listening){window.addEventListener('message',onMessage);listening=true;}
 frame=document.createElement('iframe');
 frame.id='gateTrialFrame';frame.title=g.title;
 frame.src=`precision.html?trial=${encodeURIComponent(g.id)}&from=${g.levels[0]}&to=${g.levels[1]}&start=${start}&title=${encodeURIComponent(g.title)}`;
 frame.style.cssText='position:fixed;inset:0;width:100vw;height:100vh;border:0;z-index:9000;background:#07080b';
 frame.dataset.gate=g.id;frame.dataset.ready='';
 document.body.appendChild(frame);
 frame.addEventListener('load',()=>{try{frame.contentWindow.focus();}catch(e){}});
 G.gateTrialOpen={id:g.id,t:performance.now()};
}
function leaveFrame(){
 if(frame){frame.remove();frame=null;}
 G.gateTrialOpen=null;mode='play';try{showGameUI(true);}catch(e){}
 if(typeof BFKeyboard!=='undefined')BFKeyboard.clearPressed();
 if(typeof syncLevelMusic==='function')try{syncLevelMusic(true);}catch(e){}
 try{window.focus();}catch(e){}
}
function onMessage(e){
 const d=e.data;if(!d||d.source!=='bladefall-pcore'||!frame||d.id!==frame.dataset.gate)return;
 const g=byId[d.id],s=state();
 if(d.type==='trial-ready'){frame.dataset.ready='1';return;}
 if(d.type==='trial-progress'){s.level[g.id]=d.level;save();return;}
 if(d.type==='trial-left'){s.level[g.id]=d.level;save();leaveFrame();
  const w=wallOf(g.id),p=G.p;if(w&&p){const side=Math.sign(p.x-w.x)||-1;p.x=w.x+side*(w.w/2+30);}
  return;}
 if(d.type==='trial-cleared'){
  s.cleared[g.id]=true;s.level[g.id]=g.levels[1];save();leaveFrame();
  beginScene('open',g);
 }
}

/* ---------------------------------------------------------------- after a gate opens */
function afterOpen(g){
 const pt=party();
 if(g.id==='olan'){
  speak('OLAN',LINES.olan.thanks,[{label:'Walk with me',action:()=>close(()=>joinOlan())}]);
  return;
 }
 if(g.id==='mara'){
  speak('MARA',LINES.mara.thanks,[{label:'Onward',action:()=>close(()=>{pt.mara='with';save();
   if(G.npcs)G.npcs=G.npcs.filter(n=>n.profileId!=='mara');
   const p=G.p;G.obstacles.push({type:'gateParty',gateTrial:'party',who:'mara',x:p.x-PARTY_LOOK.mara.gap,y:p.y,w:26,h:48,face:1,idx:Math.max(0,G.gateTrail.length-1)});})}]);
  return;
 }
 if(g.id==='hale'){speak('HALE',LINES.hale.thanks);return;}
 if(g.id==='bram'){
  speak('BRAM',LINES.bram.thanks,[{label:'Continue',action:()=>{close();
   // The lamp changes hands: Bram's escort becomes Olan carrying it. Mara runs on ahead.
   pt.olan='lamp';save();
   G.obstacles=G.obstacles.filter(o=>!(o.type==='gateParty'&&o.who==='olan'));
   skinLampBearer(true);
   speak('MARA',LINES.mara.ahead,[{label:'See you there',action:()=>close(()=>{pt.mara='ahead';save();
    const m=G.obstacles.find(o=>o.type==='gateParty'&&o.who==='mara');if(m){m.leaving=true;m.face=1;}})}]);}}]);
  return;
 }
}
function joinOlan(){
 const pt=party();pt.olan='with';save();
 const post=G.obstacles.find(o=>o.type==='ambientFigure'&&o.residentId==='outskirts-roadkeeper');
 const x=post?post.x:G.p.x-PARTY_LOOK.olan.gap,y=post?post.y||0:G.p.y;
 G.obstacles=G.obstacles.filter(o=>o!==post);
 G.gateTrail=[{x,y},{x:G.p.x,y:G.p.y}];
 G.obstacles.push({type:'gateParty',gateTrial:'party',who:'olan',x,y,w:26,h:48,face:1,idx:0});
 // Mara has not set out yet: she passes the two of you on her way to the Muster (seen, not teleported).
 const mara=(G.npcs||[]).find(n=>n.profileId==='mara');
 if(mara&&!meta.outskirtsMaraRelocated&&typeof beginMaraRun==='function'){try{beginMaraRun(mara);}catch(e){}}
}

/* ---------------------------------------------------------------- per frame (returns true while a scene holds input) */
function update(dt){
 if(OFF)return false;
 if(!G||!G.p||typeof mode==='undefined'||mode!=='play')return false;
 if(G.gateScene)return updateScene(dt);
 if(checkFalls())return true;
 updateParty(dt);
 // Walls fading open / closed keep their clocks moving.
 for(const o of G.obstacles)if(o.gateTrialWall&&o.fallen&&o.fallT<FALL_T)o.fallT=Math.min(FALL_T,o.fallT+dt);
 return false;
}

/* ---------------------------------------------------------------- Up: gates, hosts and the party */
function interact(){
 if(OFF)return false;
 if(!G||!G.p||mode!=='play'||G.gateScene)return false;
 const p=G.p,s=state(),near=(o,r)=>Math.abs(o.x-p.x)<r&&Math.abs((o.y||0)-p.y)<110;
 // People first: a host by a sealed gate, the party, Bram at his post, the sweeper.
 for(const o of G.obstacles){
  if(o.type!=='gateParty'||!near(o,64))continue;
  if(o.who==='sweeper'){const g=byId['keep-stair'];if(!isOpen(g)&&s.fallen[g.id])return hostTalk(g),true;speak('IDRIS',LINES['keep-sweeper'].offer[0]);return true;}
  if(o.who==='bram'){speak('BRAM',LINES.bram.after);return true;}
  // Olan and Mara walk right behind the knight: Up is for looking and striking upward, never for
  // chatting with the party (owner, 7.251.1).
 }
 for(const g of GATES){
  if(g.stage!==G.stageIndex||isOpen(g)||!s.fallen[g.id])continue;
  const w=wallOf(g.id);if(!w)continue;
  const hostNear=hostObject(g);
  if(Math.abs(p.x-w.x)<w.w/2+70||(hostNear&&near(hostNear,72))){hostTalk(g);return true;}
 }
 return false;
}
function hostObject(g){
 if(g.host==='olan')return G.obstacles.find(o=>o.type==='ambientFigure'&&o.residentId==='outskirts-roadkeeper');
 if(g.host==='hale')return G.obstacles.find(o=>o.type==='ambientFigure'&&o.residentId==='woods-veteran');
 if(g.host==='bram')return (G.npcs||[]).find(n=>n.profileId==='bram');
 if(g.host==='mara')return (G.npcs||[]).find(n=>n.profileId==='mara');
 if(g.host==='marksman-mara')return G.obstacles.find(o=>o.type==='ambientFigure'&&o.questActor==='daro');
 return null;
}

/* ---------------------------------------------------------------- drawing (respec renderer EXT_API) */
function draw(A,o){
 if(o.type==='gateParty')return drawPerson(A,o,o.who);
 if(o.gateSkin==='olan')return drawPerson(A,o,'olan',true);
 if(o.gateTrialWall)return drawWall(A,o);
 return false;
}
function drawPerson(A,o,who,lamp){
 if(o.gone)return true;
 const look=PARTY_LOOK[who]||PARTY_LOOK.olan,x=A.WX(o.x),y=A.WY(o.y||0),f=o.face||1,t=A.time;
 const moving=o.moving||(o.state==='follow'&&Math.abs(o.vx||0)>8);
 A.drawFigure(x-7,y-22,{face:f,air:false,idle:t+o.x,anim:moving?t*9:0,vx:moving?f*60:0,pal:look.pal});
 const B=A.B;
 if(who==='olan'){pixelStaff(A,x-f*6,y,f);}
 if(who==='mara'){B(x+f*4-3,y-12,7,5,'#d9cfa8');B(x+f*4-2,y-11,4,1,'#8f8761');}
 if(who==='sweeper'){B(x+f*8,y-16,1,16,'#6b5a44');B(x+f*6,y-1,5,2,'#9c8a6a');}
 if(who==='bram'&&!lamp){B(x+f*7,y-9,4,5,'#3e3e2a');}
 if(lamp){const lx=x+f*9,ly=y-13;B(lx,ly-4,1,5,'#8a7a58');B(lx-3,ly,7,8,'#4c4c31');B(lx-2,ly+1,5,5,'#d5d6a0');A.glow(lx,ly+3,34,'203,221,151',.3);}
 return true;
}
function pixelStaff(A,x,y,f){A.B(x,y-24,1,24,'#7a6a4a');A.B(x-1,y-26,3,3,'#b89a5e');}
function drawWall(A,o){
 if(!o.fallen&&!(G.gateScene&&G.gateScene.kind==='fall'&&G.gateScene.gate.id===o.gateTrial))return true;
 const ctx=A.ctx,Z=A.Z||.5,g=byId[o.gateTrial],pending=g&&g.levels===null,t=A.time;
 const sc=G.gateScene;
 let drop=0;if(sc&&sc.kind==='fall'&&sc.gate.id===o.gateTrial){const k=Math.min(1,sc.t/FALL_T);drop=(1-k*k)*900;}
 let lift=0,alpha=1;if(o.open||(sc&&sc.kind==='open'&&sc.gate.id===o.gateTrial)){const k=Math.min(1,(sc&&sc.kind==='open'?sc.t:OPEN_T)/OPEN_T);lift=k*k*700;alpha=1-k;}
 if(alpha<=0.01)return true;
 const w=Math.max(2,Math.round(o.w*Z)),x0=Math.round(A.WX(o.x)-w/2);
 const top=Math.round(A.WY(o.y)-(drop+lift)*Z),bot=Math.round(A.WY(o.y-o.h)-(drop+lift)*Z);
 const y0=Math.max(-40,top),y1=Math.min(A.bh+40,bot);if(y1<=y0)return true;
 ctx.save();ctx.globalAlpha=alpha;
 // An aura of darkness around the slab, and a pool of void where it meets the ground.
 const halo=ctx.createLinearGradient(x0-44,0,x0+w+44,0);halo.addColorStop(0,'rgba(12,6,28,0)');halo.addColorStop(.35,'rgba(24,10,52,.55)');halo.addColorStop(.65,'rgba(24,10,52,.55)');halo.addColorStop(1,'rgba(12,6,28,0)');
 ctx.fillStyle=halo;ctx.fillRect(x0-44,y0,w+88,y1-y0);
 if(!drop&&!lift&&G.p){const gy=Math.round(A.WY(landY(o)));const pool=ctx.createRadialGradient(x0+w/2,gy,2,x0+w/2,gy,w*1.6);pool.addColorStop(0,'rgba(40,16,90,.55)');pool.addColorStop(1,'rgba(10,4,24,0)');ctx.fillStyle=pool;ctx.fillRect(x0-w*1.6,gy-w*.8,w*4.2,w*1.2);
  for(let i=0;i<14;i++){const k=(t*.25+A.hash(o.seed,i))%1,mx=x0+w/2+(A.hash(o.seed+i,5)-.5)*w*2.6,my=gy-k*90;ctx.fillStyle=`rgba(170,150,255,${(1-k)*.8})`;ctx.fillRect(Math.round(mx),Math.round(my),1,1);}}
 // The slab: black as deep water, with its own stars.
 const body=ctx.createLinearGradient(x0,0,x0+w,0);body.addColorStop(0,'#07040f');body.addColorStop(.5,pending?'#141221':'#120a26');body.addColorStop(1,'#07040f');
 ctx.fillStyle=body;ctx.fillRect(x0,y0,w,y1-y0);
 for(let i=0;i<70;i++){
  const hy=A.hash(o.seed+i,17),hx=A.hash(o.seed-i,31);
  const sy=y0+((hy*(y1-y0)+t*(6+hx*14))%(y1-y0)),sx=x0+1+Math.floor(hx*(w-2));
  const tw=.4+.6*Math.abs(Math.sin(t*(1+hx*2)+i));ctx.fillStyle=i%9===0?`rgba(170,150,255,${tw})`:`rgba(220,215,255,${tw*.6})`;ctx.fillRect(sx,Math.floor(sy),1,1);
 }
 // A nebula seam down the middle — the part that listens.
 const cx=x0+w/2,pulse=.5+.5*Math.sin(t*1.7+o.seed);
 const seam=ctx.createLinearGradient(cx-6,0,cx+6,0);const hue=pending?'140,140,160':'150,120,255';
 seam.addColorStop(0,`rgba(${hue},0)`);seam.addColorStop(.5,`rgba(${hue},${.35+.35*pulse})`);seam.addColorStop(1,`rgba(${hue},0)`);
 ctx.fillStyle=seam;ctx.fillRect(cx-6,y0,12,y1-y0);
 // Runes near the knight's height, dim on an unbuilt gate.
 const ry=Math.round(A.WY((G.p?G.p.y:0)+40));
 for(let i=-3;i<=3;i++){const yy=ry+i*9;if(yy<y0||yy>y1)continue;const on=pending?.25:.4+.5*Math.abs(Math.sin(t*2+i));ctx.fillStyle=`rgba(190,170,255,${on})`;ctx.fillRect(cx-2,yy,4,1);ctx.fillRect(cx-1,yy-2,2,5);}
 // Edges crackle.
 ctx.fillStyle='rgba(120,90,255,.55)';for(let yy=y0;yy<y1;yy+=5){if(A.hash(o.seed+yy,Math.floor(t*8))>.7){ctx.fillRect(x0-1,yy,1,2);}if(A.hash(o.seed-yy,Math.floor(t*8)+3)>.7)ctx.fillRect(x0+w,yy,1,2);}
 if(drop>0){ctx.fillStyle='rgba(160,140,255,.25)';for(let i=0;i<6;i++)ctx.fillRect(x0+Math.floor(A.hash(o.seed,i)*w),y0-40-i*12,1,40);}
 ctx.restore();
 return true;
}

root.BladefallGateTrials=Object.freeze({GATES,install,update,interact,draw,state,isOpen,enterTrial,byId,seedSession});
})(typeof window!=='undefined'?window:globalThis);
