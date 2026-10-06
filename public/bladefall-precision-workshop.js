/* Individually reviewable movement experiments. Stage 44 only; original courses stay intact.
   Authoring coordinates use positive-up y. All transient state is snapshot-owned by G. */
(function(root){
'use strict';
const BANK=[6,7,8,9,11,17,19,20,22,24],BASEBANK=[16,13,14,15],CANDIDATES=[10,18,12,21,23,25,26,27,28,29],BASE=[0,1,2,3,4,5];
const catalog=[
 {kind:'linked-rails',title:'A · The Second Train',width:2160,feature:'Linked rails',family:'Standard remix',hint:'Dash drives both rails. Gold jump → gold jump → rift. The second carriage DROPS when it retracts.'},
 {kind:'violet-vault',title:'B · Out of the Seam',width:2520,feature:'Vein-exit vault',family:'Standard remix',hint:'Vault from both gold rift lips, then hook the suspended ring. Carry the release to the far bank.'},
 {kind:'borrowed-seconds',title:'C · Borrowed Seconds',width:2000,feature:'Collapsing footholds',family:'Standard remix',hint:'Cracked stone sags, then falls. Read the different ledges; jump even just after the edge gives way.'},
 {kind:'polarity',title:'D · Polarity Loom',width:2780,feature:'Gravity prisms',family:'New + old',hint:'Prism → ceiling rift → prism → ring → rift vault. Keep the restored dash for the next connection.'},
 {kind:'stormglass',title:'E · Stormglass',width:2800,feature:'Aether conservatory',family:'New + old',hint:'Thread the stone teeth and moving cutter. Strike the spring pod to rebound; bank low into the zipline.'},
 {kind:'recoil',title:'F · The Recoil Choir',width:2200,feature:'Dash ricochet bells',family:'New + old',hint:'Pogo the shell beetle. Dash into gold bells from the marked side; their arrows launch you toward the next catch.'},
 {kind:'last-departure',title:'G · Last Departure',width:3600,hard:true,feature:'Falling rail / vault / ricochet',family:'Fractured',hint:'Two gold departures, no waiting. Vault into the bell, land on failing stone, vault again.'},
 {kind:'needle-thread',title:'H · Needle and Thread',width:4520,hard:true,feature:'Vault chain / crumble / uppercut / ricochet',family:'Fractured',hint:'Three vaults lead to a failing perch; uppercut the seed, catch the bell and vault across the last wall.'},
 {kind:'faultline',title:'I · Faultline Fugue',width:3400,hard:true,feature:'Fracturing stone / pogo / ricochet',family:'Fractured',hint:'Four failing ledges → shell beetle → bell → sliver of stone → vault. Keep each air jump until it matters.'},
 {kind:'inside-out',title:'J · Inside Out',width:4160,hard:true,feature:'Four inversions / ring / vault / bell',family:'Fractured',hint:'Weave between floors twice; light the halfway rest. The ring feeds a vault into the second ceiling; drop into the final bell.'},
 {kind:'storm-chase',title:'K · Storm Chase',width:14400,hard:true,feature:'Free steering / angled springs / flight exits',family:'Base candidate',hint:'Curve around scattered rock islands, choose your approach to each spring, and dash out of flight into a cable. Docks let you prepare the next crossing.'},
 {kind:'mercy',title:'L · No Ground for Mercy',width:3860,hard:true,feature:'Shell beetle / three bells / zipline / uppercut / vault',family:'Fractured',hint:'The choir continues: zipline to a crumbling perch, upward slash, ricochet, then a high rift vault.'},
 {kind:'rootworks',title:'M · Rootworks',width:4120,hard:true,feature:'Four hoists / return trap / growing vines',family:'Candidate',hint:'Ride the returning hoist. Unfold the curled roots; landing on the first releases the brake connected to the later lift.'},
 {kind:'wake-behind',title:'N · The Wake Behind',width:2700,hard:true,feature:'A pursuer follows your earlier movements',family:'Candidate',hint:'Climb the folded ruin. Your wake follows where you were: keep moving when the route turns back.'},
 {kind:'recoil-well',title:'O · Recoil Well',width:3000,hard:true,feature:'Aimable opposing recoil / vertical route',family:'Candidate',hint:'Dash into pressure pods to recoil the opposite way. Use different approach angles to climb the well and open its spillway.'},
 {kind:'lantern-thief',title:'P · The Lantern Thief',width:3400,hard:true,feature:'Carry / throw / recapture a seed lantern',family:'Candidate',hint:'Hook picks up or throws the seed lantern. Send it through the small opening, then follow by the lower route and recover it.'},
 {kind:'switchback-engine',title:'H · Switchback Engine',width:2880,hard:true,feature:'Dash shifts the future footholds',family:'Candidate',hint:'Each dash switches the cyan and amber machinery. Climb back over your approach, then jump without changing the bridge you need.'},
 {kind:'switchback-fractured',title:'H-F · Switchback Aftershock',width:4060,hard:true,feature:'Switches / ring / pogo / bell / rift',family:'Candidate',hint:'Switch into a ring catch, pogo onto the upper machinery, then ricochet. Dash through the final rift to finish.'},
 {kind:'storm-fractured',title:'K-F · Storm Artery',width:15020,hard:true,feature:'Flight reversals / moving hazards / branching clearances',family:'Fractured candidate',hint:'Descend around the hanging roots, turn back through open air, then choose your line over the later islands. Springs redirect; you steer the recovery.'},
 {kind:'rootworks-fractured',title:'M-F · The Withering Works',width:4880,hard:true,feature:'Vertical hoist / roots / return hatch / bell / rebound',family:'Fractured candidate',hint:'Rise to the first root before the return hatch. The second root feeds a bell and upper hoist; pound into the long exit transfer.'},
 {kind:'wake-fractured',title:'N-F · The Closing Wake',width:3800,hard:true,feature:'Falling pursuit / bell / crumble / vault / pogo',family:'Fractured candidate',hint:'The entry zipline drops you above a falling staircase. Escape your wake through a bell, failing ledge, vault, pogo and ring.'},
 {kind:'recoil-fractured',title:'O-F · Inverted Pressure',width:3720,hard:true,feature:'Diagonal recoil approaches / ceiling inversion / zipline',family:'Fractured candidate',hint:'Stand above each pressure pod and aim diagonally down. The opposing launch changes sides before the crest, ceiling and exit cable.'},
 {kind:'lantern-fractured',title:'P-F · Borrowed Light',width:3400,hard:true,feature:'Lantern / switching footholds / crumble docks',family:'Candidate',hint:'Carry and throw while dashes switch the supports. Missed throws return; hold A to recall. Land to recover the lift of repeated air dashes.'},
 {kind:'return-stroke',title:'Q · The Return Stroke',width:7400,hard:true,feature:'Counterweight / ground pound / zipline / ring',family:'Candidate',hint:'Two lift-and-rebound crossings. Stand at either cable end, catch the rings, then take the closing bell to the far bank.'},
 {kind:'return-stroke-fractured',title:'Q-F · The Final Stroke',width:6000,hard:true,feature:'Two rebounds / vertical counterweight / two ziplines / blade',family:'Fractured candidate',hint:'Pound into the first zipline, ride the vertical lift, then drop beneath the hanging tooth onto the second anvil. Finish with ring, uppercut, bell and rift.'},
 {"kind": "unspent-step", "title": "R \u00b7 The Unspent Step", "width": 3100, "hard": true, "feature": "Switch state / pogo / return route", "family": "Fractured candidate", "hint": "Which dash would remove your next landing?"},
 {"kind": "borrowed-weight", "title": "S \u00b7 Borrowed Weight", "width": 3400, "hard": true, "feature": "Lantern ballast / moving supports", "family": "Fractured candidate", "hint": "Leave the light to raise a route; recover it from the other side."},
 {"kind": "second-impression", "title": "T \u00b7 Second Impression", "width": 3200, "hard": true, "feature": "Echo stepping stones / crumbles", "family": "Fractured candidate", "hint": "Your first crossing lays the footholds for your return."},
 {"kind": "quiet-garden", "title": "U \u00b7 The Quiet Garden", "width": 3400, "hard": true, "feature": "Dash-sensitive thorns / root growth", "family": "Fractured candidate", "hint": "The same dash opens a vine and wakes the thorns. Find a safe place to spend it."},
 {"kind": "return-address", "title": "V \u00b7 Return Address", "width": 3500, "hard": true, "feature": "Programmable rail / gravity / ring", "family": "Fractured candidate", "hint": "Aim the empty carriage first, then take the route you just created."}
];
const campaignPlan=[["Outskirts", "Crumbling footing", "Read cracks, then jump across a short creek.", "Combine stable refuges with one collapsing path.", null, null], ["Black Woods", "Up-pogo pods", "One hanging resin pod above safe ground.", "Mix canopy launches with crumble landings.", null, null], ["Broken Causeway", "Counterweight momentum", "A visible freight hoist and generous gold departure.", "Ride, launch, land on a failing support; later link two hoists.", null, 6], ["Updrafts", "Jetpack", "Learn thrust, coast and landing in a sheltered aerie.", "Fly between moving counterweights and canopy pods.", null, null], ["Hollow Marksman", "Portal redirection", "See both mouths; predict the exit direction.", "Carry jetpack or hoist momentum through a chosen mouth.", null, null], ["Ruined Keep", "Wall jump", "A safe two-wall climb.", "Choose wall contact versus a portal or failing ledge.", null, null], ["Warden", "Directional recoil pods", "Aim down into a low pressure bulb from a broad perch.", "Recoil Well adapted to the available kit; later revisit the full banked route.", 14, null], ["Frostfell", "Double-jump commitment", "Two ledges make the saved second jump visible.", "Crumble cadence plus blade launches and momentum.", null, 8], ["Frost Sorcerer", "Aether form", "Free steering in a broad chamber; learn dash exit.", "Curve around ice islands and choose where to return to the ground.", null, null], ["Emberdeep", "Dash-grown roots", "Watch a curled vine unfold beside solid ground.", "Hoist return paths and timed roots become a route-planning problem.", null, 19], ["Ember Colossus", "Ground-pound anvils", "A rebound plate under a safe drop.", "Counterweight momentum into a low rebound, then an elevated transfer.", null, 24], ["Inversion", "Gravity prisms", "One invert/restore pair with obvious safe surfaces.", "Alternate floor and ceiling around previously learned obstacles.", null, 9], ["Void Tyrant", "Ziplines / tears", "A grounded departure and arrival show the whole crossing.", "Vaults and blade launches choose which tear mouth to catch.", null, 7], ["Abyss King", "Delayed echoes", "Observe a delayed copy on a safe loop.", "Revisit your approach at another height before the wake closes it.", 13, 20], ["Deep Line", "Rail-cart branching", "One safe fork and a visible destination.", "Choose momentum, jump timing and collapsing track at later forks.", null, null], ["Thunder Cliffs", "Chainhook release", "Hang safely, then jump to a broad ledge.", "Pogo and momentum feed ring catches; preserve the exit jump.", null, 11], ["Landing Shores", "Ricochet bells", "A bell with a readable outgoing arc.", "Tide refuges, tears and hook releases redirect into bells.", null, null], ["Colony", "Carried lantern", "Throw through a window, follow the separate route.", "Trade carried slow fall against opening remote passages.", 15, 22], ["Palace Path", "Dash-switched machinery", "Toggle two visible supports from a safe ledge.", "Choose when to dash and when a jump or pogo must preserve the state.", 16, 17], ["Sunspire Palace", "Light routing", "Aim one mirror to a visible receiver.", "Carry/leave light while portals and changing supports create the route.", null, null]];
let requested=null,requestedSingle=false;
const C=()=>root.BladefallCeleste;
function active(){return !!(typeof G!=='undefined'&&G?.stageIndex===44&&G.celeste);}
function room(){return G.celeste.rooms[G.celeste.room];}
function state(){return G.celeste.workshop||(G.celeste.workshop={vault:0,vaults:0,prisms:0,bells:0,wind:0,crumbles:0});}
function objects(){return G.obstacles.filter(o=>o.ceRoom===G.celeste.room);}
function overlap(p,o){return p.x+p.w/2>o.x-o.w/2&&p.x-p.w/2<o.x+o.w/2&&p.y+p.h>o.y&&p.y<o.y+o.h;}
function playlist(i=G.celeste.room){return i<6?BASE:BANK.includes(i)?BANK:BASEBANK.includes(i)?BASEBANK:CANDIDATES;}
function nextRoom(){const p=playlist();return p[Math.min(p.indexOf(G.celeste.room)+1,p.length-1)];}
function lastRoom(){return active()?(G.celeste.runEnd??playlist().at(-1)):0;}
function width(kind){return catalog.find(r=>r.kind===kind)?.width;}
function build(kind,b){
 const {r,x,add,plat,hazard:rawHazard,tear,ring,blade,gale:rawGale,gravity,portal}=b,hard=catalog.find(c=>c.kind===kind)?.hard;
 r.demo=true;r.workshopHard=!!hard;
 if(root.BladefallPrecisionPuzzles?.build(kind,b))return;
 if(root.BladefallPrecisionFractured?.build(kind,b))return;
 if(root.BladefallPrecisionCandidates?.build(kind,b))return;
 const shape=kind==='storm-fractured'?'storm-chase':kind;
 const gale=(px,py,refill=false)=>{if(shape==='storm-chase'){if(refill&&[2700,4990].includes(px))return;if(refill&&px===1730){px=2420;py=295;}if(refill&&px===4550){px=5170;py=310;}const o=rawGale(px,py,refill);o.ceFlightTime=kind==='storm-fractured'?4.6:4.85;return o;}return rawGale(px,py,refill);};
 const hazard=(px,y,w,h,...args)=>{if(shape!=='storm-chase'||h<300)return rawHazard(px,y,w,h,...args);
  // Physical stepped crags: taper near the flight corridor, widen into the rock bed.
  const floor=y<0,n=Math.ceil(h/65);for(let j=0;j<n;j++){
   const yy=y+j*65,hh=Math.min(65,y+h-yy),tip=floor?j===n-1:j===0,near=(floor?n-1-j:j)<2;
   // Isolated boulders and branching shelves away from the passage, not continuous columns.
   if(!near&&j%3===1)continue;
   const ww=tip?w*.58:near?w*(.8+.35*Math.sin(j*1.7)**2):w*(1.3+.7*Math.sin(j*1.7)**2),offset=tip?0:Math.sin(j*2.4)*w*(near?.16:.7);
   Object.assign(rawHazard(px+offset,yy,ww,hh),{ceCrag:true});
   if(!near&&j%3===0)Object.assign(rawHazard(px+(j%2?1:-1)*w*1.4,yy+hh*.35,w*.8,24),{ceCrag:true});
  }
 };

 const vein=(px,y,w,h,vault=false)=>add({type:'ceVein',x:x+px,y,w,h,ceId:r.i+':vein:'+px,ceVault:vault});
 const rail=(px,tx,y,delay)=>plat(px,hard?88:120,y,{ceShuttle:true,ceLinked:true,ceDrop:true,ceHomeX:x+px,ceHomeY:y,ceToX:x+tx,ceDelay:delay,labArmed:false});
 const rock=(px,y,w=66)=>plat(px,w,y,{ceCrumble:true,ceHomeY:y,ceCrumbleTime:hard?.23:.32});
 const prism=(px,y,up)=>add({type:'cePrism',x:x+px,y,w:hard?36:46,h:hard?84:110,ceUp:up});
 const arch=(px,y,up)=>{const id=r.i+':gravity-'+px;r.required.push(id);add({type:'ceGravityArch',x:x+px,y,w:50,h:200,inverted:up,ceMark:id});};
 const bell=(px,y,dx,dy)=>add({type:'ceRicochet',x:x+px,y,w:hard?42:54,h:hard?42:54,dx,dy});
 const mover=(px,y,span,period,phase=0)=>add({type:'ceHazard',x:x+px,y,w:hard?44:36,h:hard?56:42,ceMover:true,ceHomeY:y,ceSpan:span,cePeriod:period,cePhase:phase});
 const spring=(px,y,dx=.8,dy=.6)=>add({type:'ceAetherSpring',x:x+px,y,w:46,h:46,dx,dy});
 if(shape==='linked-rails'||shape==='last-departure'){
  rail(440,830,30,0);rail(900,1230,110,.65);vein(1680,120,hard?180:220,hard?145:180,hard);
  hazard(1530,-400,50,520);hazard(1820,hard?580:440,60,450);
  if(hard){bell(2070,385,.78,.63);rock(2490,220,54);hazard(2290,-400,42,680);vein(2730,230,160,120,true);hazard(2980,-400,40,750);}
 }else if(shape==='violet-vault'||shape==='needle-thread'){
  vein(475,60,hard?160:180,hard?118:160,true);hazard(900,-400,hard?70:60,620);
  vein(1180,200,hard?160:200,hard?120:160,true);hazard(hard?1600:1580,-400,60,775);hazard(1060,620,400,200);
  if(hard){bell(1740,370,.9,-.44);vein(2070,180,170,120,true);hazard(2440,-400,60,760);hazard(2160,550,250,200);rock(2750,0,66);blade(3010,105,'uppercut');bell(3200,205,.78,.63);vein(3560,260,180,140,true);hazard(3900,-400,55,830);}
  else ring(2000,240,true);
 }else if(shape==='borrowed-seconds'||shape==='faultline'){
  for(const [px,y,w]of [[520,60,80],[790,160,54],[1100,60,70],[1360,140,44]])rock(px,y,hard?Math.max(34,w-18):w);
  hazard(670,-400,46,560);hazard(950,345,46,500);hazard(1240,-400,46,560);
  if(hard){blade(1660,130,'pogo');bell(1900,295,.78,.63);rock(2350,170,42);vein(2590,220,180,130,true);hazard(2875,-400,50,745);mover(2130,480,50,2.4);}
 }else if(shape==='polarity'||shape==='inside-out'){
  gravity();b.roof(400,1020,420);prism(440,75,true);arch(700,240,true);vein(850,250,190,180);hazard(670,-400,60,570);
  prism(1160,hard?310:290,false);arch(1320,100,false);hazard(1390,400,90,450);ring(1640,240,true);
  vein(1970,200,180,200,true);hazard(2270,-400,60,770);
  if(hard){plat(1740,110,200,{ceRest:true});add({type:'ceCheckpoint',x:x+1740,y:200,w:110,h:150});prism(2450,430,true);b.roof(2360,2890,650);arch(2640,450,true);vein(2770,470,170,180);prism(3060,540,false);arch(3210,230,false);bell(3360,350,.78,.63);hazard(3500,-400,50,625);}
 }else if(shape==='stormglass'||shape==='storm-chase'){
  portal(305,35,790,235);gale(865,230);
  // Still air here; crosswinds are reserved for a later dedicated introduction.
  hazard(1180,-400,80,hard?635:620);hazard(1490,hard?335:350,80,500);hazard(1810,-400,80,hard?670:650);hazard(2140,hard?325:340,80,500);
  mover(1360,230,75,2.7,hard?2.876:2.157);spring(1630,235);gale(1730,300,true);
  r.flightPath=[[1050,285],[1250,285],[1350,220],[1550,220],[1610,235],[1740,330],[1890,330],[2020,205],[2230,205]];
  if(hard){hazard(2430,-400,80,640);hazard(2770,335,70,500);hazard(3080,-400,90,650);mover(2350,300,95,2.1,5.62);spring(2600,220);gale(2700,280,true);mover(2940,240,95,2.8,2.084);r.flightPath.push([2490,305],[2560,220],[2670,250],[2830,220],[3000,320],[3170,320],[3320,210]);tear(3420,210,3700,240,{setDown:1});gale(3740,250);gale(4550,245,true);spring(4850,235);gale(4990,300,true);hazard(4090,320,100,550);hazard(4380,-400,110,650);hazard(4670,345,120,500);hazard(5120,-400,120,640);hazard(5300,340,90,500);r.flightPath2=[[3930,225],[4210,210],[4490,315],[4620,230],[4820,210],[4970,310],[5180,285],[5300,230],[5330,200]];tear(5410,210,5720,240,{setDown:1});gale(5745,245);root.BladefallPrecisionCandidates.finishStorm({...b,gale});}
  else tear(2340,190,2590,0,{setDown:1});
 }else if(shape==='recoil'||shape==='mercy'){
  blade(430,35,'pogo');bell(650,180,.78,.63);hazard(930,-400,64,620);
  bell(1030,315,.9,-.44);hazard(1290,610,80,300);bell(1290,120,.78,.63);
  tear(1720,215,2020,hard?150:0,{setDown:1});
  if(hard){rock(2030,150,54);blade(2290,255,'uppercut');bell(2480,355,.78,.63);vein(2840,410,180,140,true);hazard(3180,-400,55,980);}
 }
 // Every hazard is a visible, pixel-built physical obstacle; no divider/receipt walls.
}
function init(){
 if(!active())return;const a=G.celeste;a.single=requestedSingle;requestedSingle=false;a.room=requested??CANDIDATES[0];a.runEnd=playlist(a.room).at(-1);requested=null;a.checkpoint=a.rooms[a.room].x+120;
 // init occurs before the engine installs the authored spawn; start() selects again after beginRun.
}
function select(i,single=true){
 if(!active()||!Number.isInteger(i)||!G.celeste.rooms[i])return;
 const a=G.celeste;a.room=i;a.runEnd=playlist(i).at(-1);a.single=single;a.complete=false;a.workshopCheckpoint=null;a.checkpoint=a.rooms[i].x+120;C().retry(true);a.deaths=0;G.cam=a.rooms[i].x;G.camY=0;G.stageBanner=0;mode='play';showOverlay(false);
}
function reset(){
 if(!active())return;root.BladefallPrecisionCandidates?.reset();root.BladefallPrecisionPuzzles?.reset();G.celeste.workshop=null;const cp=G.celeste.workshopCheckpoint;
 if(cp?.room===G.celeste.room){G.p.x=cp.x;G.p.y=cp.y;G.celeste.checkpoint=cp.x;G.celeste.workshop={...cp.workshop};G.celeste.used=cp.used.slice();C().labState().veins=cp.veins;}
 G.cam=cp?.room===G.celeste.room?Math.max(room().x,cp.x-300):room().x;G.camY=0;
 for(const o of objects()){o.ceTriggered=false;o.ceFellAt=-1;if(o.ceOrbit)o.x=o.ceAnchorX;o.ceSpent=false;o.ceTimer=0;o.ceReact=0;o.ceWasSpent=false;o.ceCornerUntil=0;if(o.ceCrumble||o.ceDrop){o.gone=false;o.y=o.ceHomeY;}if(o.ceMover)o.y=o.ceHomeY;}
 for(const link of objects()){
  if(link.type==='ceGrowthLink'){const rock=objects().find(o=>o.ceCrumble&&o.x===link.x);rock.ceBloom=true;rock.gone=true;}
  if(link.type==='ceOrbitLink'){const pod=objects().find(o=>o.type==='ceBlade'&&o.x===link.x);if(pod){pod.ceOrbit=true;pod.ceAnchorX=link.x;pod.ceAmplitude=link.ceAmplitude;pod.cePeriod=link.cePeriod;pod.cePhase=link.cePhase;}}
  if(link.type==='ceReturnLink'){const rail=objects().find(o=>o.ceLinked&&o.ceHomeX===link.x);rail.ceReturnDrop=true;}
 }
}

function dash(p,a){
 if(!active())return;root.BladefallPrecisionCandidates?.dash(p,a);root.BladefallPrecisionPuzzles?.dash(p,a);
 if(['linked-rails','last-departure'].includes(room().kind)&&p.onGround&&p.floorPlat?.ceLinked){
  if(objects().filter(o=>o.ceLinked).every(o=>o.labArmed)){a.ride=true;return;}
  const base=G.time;for(const o of objects().filter(o=>o.ceLinked)){o.labStart=base+o.ceDelay;o.labArmed=true;}
  a.ride=true;
 }
}
function veinExit(p,o){if(active()&&o.ceVault){const a=state();a.vault=.14;a.vaultDir=Math.sign(p.vx)||1;}}
function before(dt,p){
 if(!active())return;root.BladefallPrecisionCandidates?.before(dt,p);root.BladefallPrecisionPuzzles?.before(dt,p);const a=state();a.springCue=Math.max(0,(a.springCue||0)-dt);a.vault=Math.max(0,a.vault-dt);
 if(a.vault>0&&(keyPressedFor('jump')||p.jumpBuf>0||G.celeste.jumpWindow>0)){
  a.vaultLaunch=true;a.vault=0;G.celeste.jumpWindow=0;
 }
 for(const o of objects()){
  o.ceReact=Math.max(0,(o.ceReact||0)-dt);if(o.ceSpent&&!o.ceWasSpent)o.ceReact=.5;o.ceWasSpent=!!o.ceSpent;
  if(o.ceOrbit)o.x=o.ceAnchorX+Math.sin(G.celeste.clock*2*Math.PI/o.cePeriod+o.cePhase)*o.ceAmplitude;
  if(o.type==='ceGrowthLink'||o.ceSluice){const source=objects().find(s=>s.type==='ceRicochet'&&s.x===o.ceSourceX);if(source?.ceSpent&&!o.ceTriggered){o.ceTriggered=true;o.ceAt=G.celeste.clock;}
   const open=o.ceTriggered&&G.celeste.clock-o.ceAt<o.ceDuration;if(o.ceSluice)o.gone=open;
   else{const rock=objects().find(s=>s.ceBloom&&s.x===o.x);rock.gone=!open||rock.ceTimer===0&&rock.ceFellAt>=o.ceAt;if(open)rock.ceGrow=Math.min(1,(G.celeste.clock-o.ceAt)/.15);}
  }
  if(o.ceDrop){
   const t=o.labArmed?G.time-o.labStart:0,drop=o.ceReturnDrop?2.35:1.15;o.gone=t>=drop;
   o.y=o.ceHomeY-(o.gone?Math.pow(t-drop,2)*760:0);
   if(o.gone&&p.floorPlat===o){p.onGround=false;p.floorPlat=null;p.coyote=.10;}
  }
  if(o.ceLinked&&p.onGround&&p.floorPlat===o){p._ballisticT=0;p.vx=0;}
  if(o.ceMover)o.y=o.ceHomeY+Math.sin(G.celeste.clock*2*Math.PI/o.cePeriod+o.cePhase)*o.ceSpan;
  if(!o.ceCrumble||o.gone)continue;
  const riding=p.onGround&&p.floorPlat===o;
  if(riding&&!o.ceTimer){o.ceTimer=o.ceCrumbleTime;a.crumbles++;}
  if(o.ceTimer>0){
   const oldY=o.y;o.ceTimer=Math.max(0,o.ceTimer-dt);o.y=o.ceHomeY-6*Math.pow(1-o.ceTimer/o.ceCrumbleTime,2);
   if(riding)p.y+=o.y-oldY;
   if(o.ceTimer===0){o.gone=true;o.ceFellAt=G.celeste.clock;if(riding){p.onGround=false;p.floorPlat=null;p.coyote=.10;a.coyoteEvents=(a.coyoteEvents||0)+1;}}
  }
 }
}
function late(dt,p){
 if(!active())return;root.BladefallPrecisionCandidates?.late(dt,p);const a=state(),l=C().labState();
 for(const rock of objects())if(rock.ceCrumble&&!rock.gone&&p.vy>=0&&Math.abs(p.x-rock.x)<rock.w/2+p.w/2-4&&G.celeste.prevY>=rock.y-5&&p.y<=rock.y+5&&p.y>=rock.y-8){p.y=rock.y;p.vy=0;p.onGround=true;p.floorPlat=rock;p.jumps=0;p.maxJumps=2;p.coyote=.10;p.dodgeTimer=0;l.charge=1;}

 if(a.vaultLaunch){a.vaultLaunch=false;p.vx=a.vaultDir*680;p.vy=G.gravityFlipped?720:-720;p.jumpCutOk=false;p._ballisticT=.38;p.jumps=1;p.jumpBuf=0;p.onGround=false;p.floorPlat=null;l.charge=1;p.dodgeCdT=0;a.vaults++;}
 for(const o of objects()){
  if(o.type==='ceCheckpoint'&&overlap(p,o)&&a.prisms>=2&&!G.celeste.workshopCheckpoint){G.celeste.workshopCheckpoint={room:G.celeste.room,x:o.x,y:o.y,workshop:{...a},used:G.celeste.used.slice(),veins:l.veins};G.celeste.checkpoint=o.x;o.ceReact=1.2;}
  if(o.type==='cePrism'&&!o.ceSpent&&overlap(p,o)&&p.dodgeTimer>0){
   o.ceSpent=true;G.gravityFlipped=o.ceUp;G.celeste.prevFlip=o.ceUp;C().mark(G.celeste.room+':gravity');p.dodgeTimer=0;p.dodgeCdT=0;l.charge=1;p.vx=480;p.vy=o.ceUp?-360:240;p._ballisticT=.35;p.jumpCutOk=false;a.prisms++;
  }
  if(o.type==='ceRicochet'&&!o.ceSpent&&overlap(p,o)&&p.dodgeTimer>0&&l.dx>0){
   o.ceSpent=true;p.dodgeTimer=0;p.dodgeCdT=0;l.charge=1;p.vx=o.dx*850;p.vy=-o.dy*850;p._ballisticT=.46;p.jumpCutOk=false;p.jumps=1;p.slamming=false;a.bells++;
  }
 }
}
function contact(p,o){
 if(!active())return false;
 const a=G.celeste,L=o.x-o.w/2,R=o.x+o.w/2,B=o.y,T=o.y+o.h;
 const ox=Math.min(p.x+p.w/2-L,R-(p.x-p.w/2)),oy=Math.min(p.y+p.h-B,T-p.y);
 if(ox<=0||oy<=0)return false;
 if(o.ceWake)G.celeste.candidates.wakeHits=(G.celeste.candidates.wakeHits||0)+1;
 // A six-unit corner lip accepts near misses without stopping or consuming dash.
 if(!o.ceMover&&((ox<7&&oy<7)||(a.clock<o.ceCornerUntil&&ox<10&&oy<10))){
  if(p.y>T-p.h/2)p.y=T+.1;else p.y=B-p.h-.1;
  if(!(a.clock<o.ceCornerUntil))o.ceCornerUntil=a.clock+.07;if(a.flight){a.flight.x=p.x;a.flight.y=p.y;}a.cornerGrace=.07;return false;
 }
 a.contacts=(a.contacts||0)+1;a.lastContact={x:p.x-room().x,y:p.y,type:o.type};
 const fromLeft=a.prevX+p.w/2<=L+2,fromRight=a.prevX-p.w/2>=R-2;
 if(fromLeft||fromRight||ox<oy)p.x=(fromLeft||!fromRight&&p.x<o.x)?L-p.w/2-.1:R+p.w/2+.1;
 else if(p.y+p.h/2>(B+T)/2)p.x=p.x<o.x?L-p.w/2-.1:R+p.w/2+.1;else p.y=B-p.h-.1;
 a.flight=null;const l=C().labState();l.phase=null;l.ride=false;
 p.dodgeTimer=0;p._ballisticT=0;p._flungT=0;p.vx=0;p.vy=G.gravityFlipped?Math.min(-90,p.vy):Math.max(90,p.vy);p.onGround=false;p.floorPlat=null;p.slamming=false;
 o.ceReact=.25;return true;
}
function flightSpeed(){return active()&&room().workshopHard?410:350;}
function flightTarget(f,target,dt){if(!active()||!(f.kickT>0))return target;f.kickT=Math.max(0,f.kickT-dt);f.turn=0;return Math.atan2(f.vy,f.vx);}
function windFlight(dt,f){
 if(!active())return;for(const o of objects())if(o.type==='ceWind'&&f.x>o.x-o.w/2&&f.x<o.x+o.w/2&&f.y>o.y&&f.y<o.y+o.h){
  // A steady, visibly directed field: no random gust can invalidate a learned route.
  f.x+=o.wx*dt;f.y+=o.wy*dt;state().wind+=dt;
 }
 if(active())for(const o of objects())if(o.type==='ceAetherSpring'&&!o.ceSpent&&Math.hypot(f.x-o.x,f.y+22-o.y)<38){o.ceSpent=true;if(o.cePrecisionKick){f.x=o.x;f.y=o.y-22;}f.vx=o.dx*590;f.vy=o.dy*590;f.speed=590;f.turn=0;f.kickT=o.cePrecisionKick?.18:.12;if(!room().flightBudgeted)f.t+=.7;state().springs=(state().springs||0)+1;state().springCue=1.4;state().springDirection=o.dx<0?'←':o.dx>0?'→':o.dy>0?'↑':'↓';}
}
function start(i=null,playlist=false){if(typeof coopActive==='function'&&coopActive()&&NET.isGuest()){openCoop();return;}requested=i;requestedSingle=i!==null&&!playlist;C().start(44);if(active())select(i??CANDIDATES[0],i!==null&&!playlist);}
function menu(which){
 const tab=which==='bank'?'bank':which==='base-bank'?'base-bank':'candidates',list=tab==='bank'?BANK:tab==='base-bank'?BASEBANK:CANDIDATES,banked=tab!=='candidates';
 mode='celeste-menu';
 const proposal=banked?'<section id="pwCampaignPlan"><h2>Proposed '+(tab==='bank'?'Fractured':'Base')+' campaign placements</h2><p>Planning only — these rooms have not been inserted into the campaign. '+(tab==='bank'?'All mechanics may be combined here; each region still gets a clear identity. Ten of twenty placements have an approved room.':'One new focus per level. Teach it safely, then combine it with earlier mechanics. Four approved rooms await adaptation to the local ability kit.')+'</p>'+campaignPlan.map((p,n)=>{const id=p[tab==='bank'?5:4];return '<details style="padding:10px;border-bottom:1px solid #44515b"><summary>'+(n+1)+'. '+p[0]+' · '+p[1]+(id!=null?' — '+catalog[id].title:' — proposal')+'</summary><p>'+p[2]+' '+p[3]+'</p>'+(id!=null?'<p>Approved demonstration: '+catalog[id].title+'. Placement can change.</p>':'<p>Unbuilt proposal. No new campaign content has been added.</p>')+'</details>';}).join('')+'</section>':'';
 showOvHTML('<div class="card" style="width:100%;max-width:100%"><h1 class="ovh">'+(tab==='bank'?'Fractured Bank · 10 / 20':tab==='base-bank'?'Base Bank · 4 / 20':'Ten Candidates')+'</h1><p class="ovsub">'+(banked?'Approved rooms, preserved for future placement. See the twenty-level plan below.':'Five revisions and five new puzzle rooms. Each has a decision to solve as well as movement to execute.')+'</p><div style="display:flex;flex-wrap:wrap;gap:8px"><button class="bigbtn ghost" id="pwHardTab">Candidates</button><button class="bigbtn ghost" id="pwBaseBankTab">Base Bank</button><button class="bigbtn ghost" id="pwBankTab">Fractured Bank</button></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr));gap:8px">'+list.map(i=>'<button class="choice" id="pw'+i+'"><div class="cname">'+catalog[i].title+'</div><div class="cdesc">'+catalog[i].feature+'<br>'+catalog[i].hint+'</div></button>').join('')+'</div><button class="bigbtn" id="pwAll">Play this set</button>'+proposal+'<button class="bigbtn ghost" id="pwBack">Precision Courses</button></div>','mapcard');
 for(const i of list)document.getElementById('pw'+i).onclick=()=>start(i);
 document.getElementById('pwHardTab').onclick=()=>menu(true);document.getElementById('pwBaseBankTab').onclick=()=>menu('base-bank');document.getElementById('pwBankTab').onclick=()=>menu('bank');document.getElementById('pwAll').onclick=()=>start(list[0],true);document.getElementById('pwBack').onclick=C().menu;
}
function flightReport(a){
 const receipts=a.flightReceipts||[];if(!receipts.length)return '';
 return '<section id="pwFlightReport"><h2>Aether pickup times</h2><p>Time left just before each pickup. Refills aim for less than 0.50s.</p><table style="width:100%;text-align:left"><thead><tr><th>Pickup</th><th>Time left</th><th>New charge</th></tr></thead><tbody>'+receipts.map((v,i)=>'<tr><td>'+(i+1)+' · '+(v.refill?'Refill':'Form')+'</td><td>'+(v.remaining==null?'New transformation':Math.max(0,v.remaining).toFixed(2)+'s')+'</td><td>'+v.capacity.toFixed(2)+'s</td></tr>').join('')+'</tbody></table></section>';
}
function complete(){
 mode='celeste-complete';const a=G.celeste;
 showOvHTML('<div class="card"><h1 class="ovh">'+(a.single?room().title:(BASEBANK.includes(a.room)?'Base bank complete':BANK.includes(a.room)?'Fractured bank complete':a.room>=6?'Candidate set complete':'Workshop complete'))+'</h1><p class="ovsub">'+a.deaths+' retries · Keep, revise, or replace this experiment.</p>'+flightReport(a)+'<button class="bigbtn" id="pwAgain">Replay room</button><button class="bigbtn" id="pwNext">Next room</button><button class="bigbtn ghost" id="pwChoose">Choose a room</button></div>');
 document.getElementById('pwAgain').onclick=()=>start(a.room);document.getElementById('pwNext').onclick=()=>start(playlist()[((playlist().indexOf(a.room)+1)%playlist().length)]);document.getElementById('pwChoose').onclick=menu;
}
function draw(phase,api,o){
 if(api.G.stageIndex!==44)return false;
 if(root.BladefallPrecisionPuzzles?.draw(phase,api,o))return true;
 if(root.BladefallPrecisionCandidates?.draw(phase,api,o))return true;
 if(root.BladefallPrecisionArt?.draw(phase,api,o))return true;const {ctx:c,B,WX,WY,Z}=api;
 const text=(s,x,y,col='#d7e9f4',size=9)=>{c.save();c.textAlign='left';c.textBaseline='alphabetic';c.fillStyle=col;c.font=size+'px monospace';c.fillText(s,x,y);c.restore();};
 if(phase==='plat'&&o.ceCrumble){if(o.gone)return true;const x=WX(o.x-o.w/2),y=WY(o.y);B(x,y,o.w*Z,10,'#59677c');B(x,y,o.w*Z*(o.ceTimer?o.ceTimer/.30:1),3,'#ffcf91');text(o.ceTimer?'GO!':'0.30',x,y-8);return true;}
 if(phase==='object'&&o.type==='ceWind'){
  const x=WX(o.x-o.w/2),y=WY(o.y+o.h);c.save();c.globalAlpha=.13;B(x,y,o.w*Z,o.h*Z,'#72d7e2');c.restore();
  for(let k=0;k<5;k++){const xx=x+((k*71+G.celeste.clock*o.wx*.25)%(o.w*Z)+o.w*Z)%(o.w*Z),yy=y+30+k*21;text(o.wy>0?'↖':'↘',xx,yy,'#73c9d5',16);}text(o.wy>0?'UPDRAFT / HEADWIND':'DOWNDRAFT / TAILWIND',x+3,y-8,'#9ee8ed',7);return true;
 }
 if(phase==='object'&&(o.type==='cePrism'||o.type==='ceRicochet')){
  const x=WX(o.x),y=WY(o.y+o.h/2),col=o.ceSpent?'#46556e':o.type==='cePrism'?'#c3a4ff':'#ffd083';
  c.save();c.strokeStyle=col;c.lineWidth=3;c.beginPath();if(o.type==='cePrism'){c.moveTo(x,y-26*Z);c.lineTo(x+22*Z,y);c.lineTo(x,y+26*Z);c.lineTo(x-22*Z,y);c.closePath();}else c.arc(x,y,27*Z,0,Math.PI*2);c.stroke();c.restore();
  text(o.type==='cePrism'?(o.ceUp?'↑':'↓'):(o.dy>0?'↗':'↘'),x-7,y+5,col,16);text(o.ceSpent?'SPENT':'DASH',x-16,y-34*Z,col,7);return true;
 }
 if(phase==='object'&&o.type==='ceVein'&&o.ceVault){const x=WX(o.x+o.w/2),y=WY(o.y+o.h);B(x-3,y,6,o.h*Z,'#efc56f');text('EXIT + JUMP',x-35,y-8,'#ffdc94',7);}
 if(phase==='overlay'){
  const a=G.celeste,r=room(),ready=(a.lab?.charge??1)>0;
  api.B(8,37,Math.min(api.bw-16,310),24,'#141b21');text(r.title,16,48,'#e0d6ba',9);
  text((ready?'◆ DASH READY':'◇ DASH SPENT')+(a.workshopCheckpoint?.room===a.room?' · REST LIT':''),16,58,ready?'#94c0bd':'#a39883',7);
  if(a.clock<4&&G.p.x<r.x+330)text(r.hint,16,75,'#c2c5b4',7);
  if(a.workshop?.springCue>0){text('SPRING KICK '+(a.workshop.springDirection||'→'),api.bw/2-35,90,'#d1ae69',8);}
  const candidate=a.candidates,seed=objects().find(o=>o.type==='ceSeed');
  const cue=r.dashSwitch?((candidate?.phase?'AMBER':'CYAN')+' OPEN · DASH SWITCHES THE ENGINE'):r.kind.startsWith('lantern-')?(seed?.ceCarried?'LANTERN LIFT · SLOW FALL · A + ARROWS TO THROW':(r.lanternRecall?'HOLD A TO RECALL MISSED THROW':'A NEAR LANTERN · RECOVER')):r.wake&&candidate?.wakeStarted?'YOUR WAKE IS CATCHING UP':r.kind.startsWith('rootworks')&&G.p.floorPlat?.ceTrap?'RIDE IT HOME · HATCH OPENS ON RETURN':'';
  if(cue)text(cue,16,87,'#c6c6a5',7);
  if(r.lanternRecall)text(seed?.ceCarried?'LANTERN LIFT · SLOW FALL':'HOLD A TO RECALL A MISSED THROW',16,100,'#b9d5a0',7);
  if(r.noDashFlight&&!api.G.p.onGround&&a.lab?.airDashes>1)text('LAND TO RECOVER DASH LIFT',16,r.lanternRecall?111:100,'#c5b596',7);
  if(state().vault>0)text('JUMP → VAULT',api.bw/2-38,82,'#d1ae69',9);
  text('AIM ↑↓←→ + '+keyLabel(kbCode('dash'))+' · JUMP '+keyLabel(kbCode('jump'))+' · HOOK '+keyLabel(kbCode('hook'))+' · RETRY '+keyLabel(kbCode('checkpoint')),16,api.bh-12,'#b0b7ad',7);
  if(api.G.coopSession)text('PARTNER '+(a.peerProgress?.ready?'FINISHED':'TRAVERSING'),16,api.bh-24,'#b4a9bb',7);
  if(a.flight){api.B(api.bw/2-40,api.bh-26,80,3,'#34463e');api.B(api.bw/2-40,api.bh-26,80*Math.max(0,a.flight.t)/(a.flight.maxT||C().flightTime(a.stage)),3,a.flight.t<.8?'#dfb17a':'#94c0bd');text('AETHER '+a.flight.t.toFixed(1)+'s',api.bw/2-36,api.bh-31,a.flight.t<.8?'#dfb17a':'#94c0bd',7);}
  return true;
 }
 return false;
}
root.BladefallPrecisionWorkshop=Object.freeze({catalog,campaignPlan,BANK,BASEBANK,CANDIDATES,BASE,playlist,nextRoom,width,lastRoom,build,init,reset,contact,dash,veinExit,before,late,windFlight,flightSpeed,flightTarget,start,select,menu,complete,draw});
})(typeof window!=='undefined'?window:globalThis);
