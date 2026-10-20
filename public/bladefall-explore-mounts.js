/* Explore (7.343–7.344): quest shortcuts. Finishing a region's side story leaves you a way across it: Rowan's
   bell brings the Bellwing down out of the Outskirts' belfry, Elsie's lantern moths carry you through the Black
   Woods, the Cartographer lends his kite, and so on, one per region (MOUNTS below). Each has two roosts: one by
   the person who gave it to you, one at the far end of the region (short of the exit, or of a boss's arena; never
   past either). Up at a roost offers the ride; it sets the knight down by the other roost, facing on.

   Three kinds of ride:
   - flight: an arc over the region (a creature or a craft carries the knight; the camera follows).
   - zip: a line strung between the two roosts; the knight hangs from a trolley or a rope arrow's line.
   - blink: a way through (a postern, a mirror, a cart into the dark): the screen fades out at one roost and in
     at the other, for regions whose rock and ceilings a flight would pass through.

   A ride is a short cinematic: the world holds still, as for a gate walk. It opens only when the story is
   finished (its kind ending) and the region's own ability is yours (the Oathblade before the moths will lift
   you, Dash before Silas's trolley), so a shortcut never skips what the region gives.

   NOTHING BUT THE OUTSKIRTS IS SKIPPED THE FIRST TIME (Isaac, 7.346). The Outskirts are a long walk of plain
   jumps, so the Bellwing waits by the camp and may fly you past them at once. Everywhere else the shortcut is
   for coming back: its home roost is at the region's far end (the exit, or the edge of the boss's arena while
   the boss stands), the mount waits there, and the other roost (at the region's entrance) only opens once
   you have stood at the home roost on foot, which means having played the region through to its end. Every
   shortcut runs both ways, and a mount that travels stays where it set you down: fly the Bellwing to the
   Mothlight Door and it is perched there when you come back to backtrack; at the empty roost, Up calls it
   over. Lines and passages (zip, blink) are fixed at both ends. The Deep Line has none: the cart is the ride. Nothing here runs under
   the watch/TAS rules (Watch, ● Record, route building), in co-op, or in a boss rush, so routes, recordings and
   the shared session never see it. Hold the way you are going to hurry a flight or a zip. */
(function(root){
'use strict';
/* near: where a roost goes. 'actor' is the story's giver (plus off), 'end' the far end of the region the way it
   is walked, 'start' its entrance, 'arena' just short of the first boss's arena. A number is an x. The roost is
   set on the nearest standable floor (steady, not crumbling or moving). */
const MOUNTS={
 // Region 0: the Outskirts. Explicit roosts on open road; the drake lands you short of the Mothlight Door.
 0:{id:'bellwing',name:'The Bellwing',story:'gatekeeper',accent:'#d8b070',kind:'flight',art:'drake',creature:true,seat:15,cruise:404,speed:1400,
  roosts:[{id:'camp',x:1050,land:900,face:-1,label:'the camp',flyTo:'door'},
          {id:'door',x:13330,land:13440,face:1,label:'the Mothlight Door',flyTo:'camp'}],
  intro:'The bronze drake from the old belfry. It followed the bell down and never went back up.',
  // From up there the whole road lies open: the three bearings Mara asked for line up on their own, so the
  // flight does her survey and the chart is yours without walking back to the Muster (Isaac, 7.344).
  arrive:to=>to.id==='door'&&outskirtsSurveyFromTheAir()},
 1:{id:'moths',name:'The Mothlight Swarm',story:'refuge',accent:'#c4ecd0',kind:'flight',art:'moths',seat:-62,cruise:330,speed:1250,
  roosts:[{id:'far',near:'end',label:'the Brute Road'},{id:'edge',near:'start',label:'the woods’ edge'}],
  verb:'↑  CALL THE MOTHS',go:'Ride the moths to',
  intro:'Elsie’s lantern draws the woods’ moths in clouds now that it hangs right. Hold up the light and enough of them will lift you over the canopy.'},
 2:{id:'trolley',name:'Silas’s Chain Trolley',story:'defector',accent:'#d59a68',kind:'zip',art:'zip',speed:1300,
  roosts:[{id:'camp',near:'arena',label:'Chainwake Camp'},{id:'far',near:'start',label:'the causeway’s west end'}],
  verb:'↑  RIDE THE CHAIN',go:'Ride the chain to',
  intro:'Silas ran the old maintenance chain from the camp to the causeway’s far end. “It counts its own links now. Hold on and it will take you.”'},
 3:{id:'kite',name:'The Cartographer’s Kite',story:'cartographer',accent:'#9fe0ff',kind:'flight',art:'kite',seat:-70,cruise:420,speed:1250,
  roosts:[{id:'far',near:'end',label:'the canyon’s end'},{id:'mouth',near:'start',label:'the canyon mouth'}],
  verb:'↑  TAKE THE KITE',go:'Kite to',
  intro:'The Cartographer’s survey kite, its frame mended and the spar re-strung. On this wind it will carry a knight the length of the canyon.'},
 // 7.347: each of these rides its own way (Isaac: a line like the Causeway's, a drake like the Bellwing's, doors
 // that are only doors: make them distinct). launch/throw are a ballistic arc; ground follows the floor of the
 // region; slide an ice road; ceiling a run upside down; rift hops between mirror shards; rail a cart in the dark.
 4:{id:'ballista',name:'The Recruit’s Ballista',story:'recruit',accent:'#c8b07a',kind:'launch',art:'ballista',speed:1500,arc:.2,
  roosts:[{id:'far',near:'arena',label:'the Marksman’s ridge'},{id:'trail',near:'start',label:'the trailhead'}],
  verb:'↑  MAN THE BALLISTA',go:'Ride the bolt to',
  intro:'The Recruit re-strung the old siege ballistas at both ends of the hollow and swears a bolt will carry a knight. Hold on to the fletching.'},
 5:{id:'bell-ropes',name:'The Archivist’s Bell-Ropes',story:'archivist',accent:'#b8c0d8',kind:'swing',art:'bellrope',hop:900,speed:1250,
  roosts:[{id:'far',near:'end',label:'the Keep’s far wall'},{id:'gate',near:'start',label:'the gatehouse'}],
  verb:'↑  TAKE THE BELL-ROPES',go:'Swing the bell-ropes to',
  intro:'The Archivist found the ringers’ plan: the Keep’s bell-ropes were hung so a ringer could cross the whole wall without touching the ground. Each rope swings you to the next.'},
 6:{id:'cage',name:'The Keeper’s Cage Run',story:'keeper',accent:'#9fb8b0',kind:'cage',art:'cage',travels:true,cruise:300,speed:1150,
  roosts:[{id:'far',near:'arena',label:'the Gaol’s west yard'},{id:'crown',near:'start',label:'the Eastern Crown'}],
  verb:'↑  STEP INTO THE CAGE',go:'Ride the cage to',
  intro:'The Service Keeper stood aside and unchained the jailers’ cage. It runs on the old overhead rail the length of the Gaol, high above the cells.'},
 7:{id:'sled',name:'The Perfect-Day Sled',story:'winter',accent:'#e0f0ff',kind:'ground',art:'sled',travels:true,seat:8,speed:1100,
  roosts:[{id:'far',near:'end',label:'the summit road'},{id:'gate',near:'start',label:'the warden’s gate'}],
  verb:'↑  TAKE THE SLED',go:'Sled to',
  intro:'Her sled from the perfect day, waxed and ready, and the street’s dogs in harness. They know every road in Frostfell, up and down.'},
 8:{id:'winter-road',name:'The Winter Road',story:'ember-pet',accent:'#bfe4ff',kind:'slide',art:'fox',seat:0,cruise:230,speed:1300,
  roosts:[{id:'far',near:'arena',label:'the Court’s last stair'},{id:'sluice',near:'start',label:'the sluice'}],
  verb:'↑  FOLLOW THE WINTER',go:'Skate the ice road to',
  intro:'The little winter you kept has grown into a frost fox. It runs ahead of you and freezes a road out of the air; the road melts behind your heels.'},
 9:{id:'ore',name:'The Quota Cart',story:'quota',accent:'#ff9a4a',kind:'rail',art:'cart',seat:10,speed:1250,
  roosts:[{id:'far',near:'end',label:'the Deep Stair'},{id:'head',near:'start',label:'the mine head'}],
  verb:'↑  RIDE THE CART',go:'Ride the cart to',
  intro:'The workers kept one ore cart off the quota for you. The line runs through the dark the length of Emberdeep.'},
 10:{id:'throw',name:'The Automaton’s Throw',story:'automaton',accent:'#ffc070',kind:'throw',art:'throw',travels:true,staysBehind:true,seat:0,arc:.24,speed:1400,
  roosts:[{id:'far',near:'arena',label:'the last bay'},{id:'gate',near:'start',label:'the foundry gate'}],
  verb:'↑  ASK FOR A THROW',go:'Be thrown to',
  intro:'The war automaton has found small work it likes: throwing you. It braces, cups its hands and waits.'},
 11:{id:'ceiling',name:'The Ceiling Way',story:'neighbors',accent:'#c9a0ff',kind:'ceiling',art:'hatch',cruise:340,speed:1150,
  roosts:[{id:'far',near:'end',label:'the west gate'},{id:'fall',near:'start',label:'the Fall In'}],
  verb:'↑  TAKE THE CEILING WAY',go:'Walk the ceiling to',
  intro:'The neighbours took tea on the ceiling and showed you their way up. Upside down, the Inversion is one long corridor.'},
 12:{id:'mirror',name:'The Other Side',story:'figure',accent:'#d6b0ff',kind:'rift',art:'mirror',hop:1500,
  roosts:[{id:'far',near:'arena',label:'the Tyrant’s hall'},{id:'east',near:'start',label:'the east gate'}],
  verb:'↑  STEP THROUGH',go:'Step through to',
  intro:'The Figure’s mirror. Its shards hang the length of the Citadel now, and the glass remembers you: step in, and step out of the next one, and the next.'},
 13:{id:'alarm',name:'The Last Alarm',story:'alarm',accent:'#c9b8ff',kind:'sprint',art:'bell',speed:1500,
  roosts:[{id:'far',near:'arena',label:'the throne road'},{id:'gate',near:'start',label:'the Throne’s gate'}],
  verb:'↑  RING THE ALARM',go:'Ring and go to',
  intro:'The Bellkeeper’s last alarm. Ring it and every door on the throne road opens for one breath: run, and the bell carries you.'},
 16:{id:'skiff',name:'The Sailors’ Skiff',story:'sailors',accent:'#a8dcff',kind:'flight',art:'skiff',seat:12,cruise:110,speed:1250,
  roosts:[{id:'far',near:'arena',label:'the hydra’s water'},{id:'landing',near:'start',label:'the cliff landing'}],
  verb:'↑  TAKE THE SKIFF',go:'Sail to',
  intro:'The sailors’ skiff, for luck. It runs before any wind along these cliffs.'},
 17:{id:'rocket',name:'The Birthday Rocket',story:'birthday',accent:'#ffd070',kind:'flight',art:'rocket',seat:10,cruise:520,speed:1500,
  roosts:[{id:'far',near:'end',label:'the far shore'},{id:'beach',near:'start',label:'the landing beach'}],
  verb:'↑  LIGHT THE ROCKET',go:'Launch to',
  intro:'The biggest rocket from the party, saved for you. All at once, the Organizer says: light it and hold on.'},
 18:{id:'crane',name:'The Paper Crane',story:'mother',accent:'#f0e6d0',kind:'flight',art:'crane',seat:14,cruise:380,speed:1250,
  roosts:[{id:'far',near:'end',label:'the road gate'},{id:'gate',near:'start',label:'the Colony gate'}],
  verb:'↑  RIDE THE CRANE',go:'Fly the crane to',
  intro:'Her child folded a paper crane for you, and in the Colony that is enough: it unfolds big enough to carry you.'},
 19:{id:'cloak',name:'The Pilgrim’s Feather Cloak',story:'pilgrim',accent:'#fff0c0',kind:'flight',art:'cloak',seat:0,cruise:360,speed:1150,
  roosts:[{id:'far',near:'end',label:'the palace steps'},{id:'road',near:'start',label:'the palace road'}],
  verb:'↑  WEAR THE CLOAK',go:'Glide to',
  intro:'The lightest pilgrim’s feather cloak. Jump from the shrine wall and the road will pass beneath you.'},
 20:{id:'moonflower',name:'The Moonflower',story:'garden',accent:'#e8f0ff',kind:'flight',art:'seed',seat:-64,cruise:400,speed:1150,
  roosts:[{id:'far',near:'arena',label:'the Day King’s court'},{id:'gate',near:'start',label:'the palace gate'}],
  verb:'↑  TAKE THE MOONFLOWER',go:'Float to',
  intro:'A moonflower from the night garden, gone to seed. Its pod lifts at dusk and drifts where you point it.'},
};
// Regions walked right to left: their 'end' is the west edge and their 'start' the east.
const WEST=new Set([6,11,12]);
const ok=()=>typeof G!=='undefined'&&!!G&&!G.workshopBlank;
const mount=()=>ok()?MOUNTS[G.stageIndex]||null:null;
/* Shortcut test mode (7.345): five taps on Base in the level select open every region's shortcut for runs
   started from the level select, story or no story, and lift the "Not yet" ability gate, so each one can be
   tried at once. It is kept on this device until five more taps; campaign runs never see it. */
const TEST_KEY='bladefall.mounts.test';
let testOn=(()=>{try{return root.localStorage?.getItem(TEST_KEY)==='1';}catch(e){return false;}})();
function setTestMode(on){testOn=!!on;try{on?root.localStorage.setItem(TEST_KEY,'1'):root.localStorage.removeItem(TEST_KEY);}catch(e){}return testOn;}
const testing=()=>testOn&&ok()&&!!G.levelSelectMode;
function earned(m){
 if(testing())return true;
 try{return root.BladefallSideStories.row(root.BladefallSideStoryWorld.state(),m.story).phase==='completed';}catch(e){return false;}
}
const usable=()=>!watchLike()&&!G.coopSession&&!G.bossRush;
/* Where each region's mount is perched and whether its home roost has been reached on foot. A campaign keeps
   them in the save (meta.mounts); a level-select run keeps them for the session (G.sessionMounts, carried by
   savedRunSession), like its side stories. */
function store(){
 if(G.levelSelectMode)return G.sessionMounts||(G.sessionMounts={perch:{},reached:{}});
 if(typeof meta==='undefined')return G.mountStore||(G.mountStore={perch:{},reached:{}});
 const s=meta.mounts||(meta.mounts={});s.perch=s.perch||{};s.reached=s.reached||{};return s;
}
const keep=()=>{if(!G.levelSelectMode&&typeof persist==='function')persist();};
const travels=m=>m.kind==='flight'||!!m.travels;   // a creature or craft: one of it, wherever it last set you down
// Rides on a path of their own (7.347): the knight's feet follow it (no hovering anchor, no flight lift).
const PATHED=new Set(['launch','throw','ground','slide','rail','ceiling','rift','sprint','swing','cage']);
const perchOf=m=>store().perch[G.stageIndex]||G.mountRoosts?.[0]?.id;
const opened=()=>G.stageIndex===0||testing()||!!store().reached[G.stageIndex];
// What this region gives (its own ability) must already be yours.
function missing(){
 if(testing())return [];
 try{
  const here=new Set(levelSelectCapabilitiesForStage(G.stageIndex).acquired),next=levelSelectCapabilitiesForStage(G.stageIndex+1).acquired;
  return next.filter(id=>!here.has(id)&&!hasCapability(id));
 }catch(e){return [];}
}
const abilityName=id=>(typeof BFCapabilitiesModule!=='undefined'&&BFCapabilitiesModule.abilities.find(a=>a.id===id)?.name)||id;
function outskirtsSurveyFromTheAir(){
 if(G.stageIndex!==0)return;
 const stakes=G.obstacles.filter(o=>o.type==='surveyStake');
 let turned=0;for(const o of stakes)if(!o.aligned){o.aligned=true;o.flash=1;turned++;}
 if(G.outskirtsSurvey)G.outskirtsSurvey.aligned=stakes.length;
 const mara=(G.npcs||[]).find(n=>n.kind==='survey');
 if(mara&&!mara.done){
  mara.asked=true;mara.done=true;
  if(typeof coopGrantTravelerReward==='function')coopGrantTravelerReward(mara);
  if(typeof recordQuestEvent==='function')recordQuestEvent({type:'traveler-helped',target:mara.profileId},true);
  if(typeof toast==='function')toast('<b style="color:#e4d9a7">MARA’S FIELD CHART</b><br>From the air the road lies open: ASH, GLASS and IRON line up in one glance. You mark the bearings on Mara’s chart. It’s yours now, and she’ll have it copied at the Muster.',7000);
 }else if(turned&&typeof toast==='function')toast('<b style="color:#e4d9a7">THE THREE BEARINGS</b><br>From the air, ASH, GLASS and IRON line up in one glance.',5000);
}
// ---- where the roosts stand -----------------------------------------------------------------------------
const steady=o=>o.type==='plat'&&!o.gone&&!o.ceiling&&!o.fake&&!o.invisible&&!o.crumble&&!o.move&&!o.earlyCarrier&&!o.sideStory&&!o.gate;
function floorAt(x){
 let y=0;for(const o of G.obstacles)if(o.type==='plat'&&!o.gone&&!o.ceiling&&!o.fake&&(o.y||0)<=60&&x>=o.x-o.w/2&&x<=o.x+o.w/2)y=Math.max(y,o.y||0);
 return y;
}
// The nearest steady floor to a target x (a giver's roost also prefers the giver's own floor height), and a
// place on it at least 170 units from anything else Up would answer, so Up at the roost means the roost.
function spot(target,refY=null){
 let best=null,bd=Infinity;
 for(const o of G.obstacles){
  if(!steady(o)||o.w<150)continue;const x0=o.x-o.w/2,x1=o.x+o.w/2,d=(target<x0?x0-target:target>x1?target-x1:0)+(refY==null?0:Math.abs((o.y||0)-refY)*2);
  if(d<bd-1||(Math.abs(d-bd)<=1&&o.w>best.w)){bd=d;best=o;}
 }
 if(!best)return null;
 const x0=best.x-best.w/2,x1=best.x+best.w/2,y=best.y||0,lo=x0+100,hi=x1-100;
 const others=G.obstacles.filter(o=>!o.mountRoost&&o!==best&&(o.sideStory&&o.sideStoryRole!=='step'||typeof outskirtsAuthoredInteractable==='function'&&(()=>{try{return outskirtsAuthoredInteractable(o);}catch(e){return false;}})()));
 const clear=x=>!others.some(o=>Math.abs(o.x-x)<170&&Math.abs((o.y||0)-y)<130);
 let x=Math.max(lo,Math.min(hi,target));
 if(!clear(x))for(let k=1;k<=40;k++){const a=x+k*30,b=x-k*30;if(a<=hi&&clear(a)){x=a;break;}if(b>=lo&&clear(b)){x=b;break;}}
 return {x,y,x0,x1};
}
function bossEdge(fwd){
 const b=(G.enemies||[]).filter(e=>e.boss&&!e.dead).sort((a,c)=>fwd>0?a.x-c.x:c.x-a.x)[0];if(!b)return null;
 const edge=re=>Object.keys(b).filter(k=>re.test(k)&&Number.isFinite(b[k])).map(k=>b[k]);
 const e=fwd>0?Math.min(...edge(/ArenaL$/),Infinity):Math.max(...edge(/ArenaR$/),-Infinity);
 return Number.isFinite(e)?e:b.x-fwd*700;
}
function resolve(m){
 if(m.roosts.every(r=>Number.isFinite(r.x)))return m.roosts.map(r=>({...r,y:floorAt(r.x),x0:-Infinity,x1:Infinity}));
 const fwd=WEST.has(G.stageIndex)?-1:1,len=G.levelLength;
 const actor=G.obstacles.find(o=>o.sideStoryRole==='actor');
 const out=[];
 for(const r of m.roosts){
  // A fallen boss leaves the home roost by the region's exit instead of short of its arena.
  const arena=r.near==='arena'?bossEdge(fwd):null,near=r.near==='arena'&&arena==null?'end':r.near;
  let t=near==='actor'?(actor?actor.x:null):near==='end'?(fwd>0?len-700:700):near==='start'?(fwd>0?600:len-600):near==='arena'?arena:near;
  if(t==null)return null;
  if(near==='actor')t+=(r.off||0)*fwd;else if(near==='arena')t-=fwd*320;
  const s=spot(t,r.near==='actor'?actor.y||0:null);if(!s)return null;
  out.push({...r,x:s.x,y:s.y,x0:s.x0,x1:s.x1});
 }
 out[0].flyTo=out[1].id;out[1].flyTo=out[0].id;
 return out;
}
function install(){
 if(!ok())return;
 G.obstacles=G.obstacles.filter(o=>!o.mountRoost);G.mountFlight=null;G.mountRoosts=null;G.mountHome=null;
 const m=mount();if(!m||!usable())return;
 const roosts=resolve(m);if(!roosts)return;
 // Reaching the home roost on foot counts whether or not the story is finished yet.
 G.mountHome=roosts[0];
 if(!earned(m))return;
 G.mountRoosts=roosts;
 const st=store();if(!roosts.some(r=>r.id===st.perch[G.stageIndex]))st.perch[G.stageIndex]=roosts[0].id;
 placeRoosts();
}
// The home roost always; the far one once the region has been played to its end (the Outskirts at once).
function placeRoosts(){
 const m=mount();G.obstacles=G.obstacles.filter(o=>!o.mountRoost);
 for(const r of opened()?G.mountRoosts:[G.mountRoosts[0]])G.obstacles.push({type:'mountRoost',mountRoost:r.id,mount:m.id,x:r.x,y:r.y,w:96,h:70,accent:m.accent});
}
function noteReached(){
 const h=G.mountHome;if(!h||G.mountFlight||G.p.dead||store().reached[G.stageIndex])return;
 if(Math.abs(G.p.x-h.x)>240||Math.abs((G.p.y||0)-h.y)>160||!G.p.onGround)return;
 store().reached[G.stageIndex]=true;keep();
 const m=mount();if(!G.mountRoosts)return;
 placeRoosts();
 if(typeof toast==='function')toast('<b style="color:'+m.accent+'">'+m.name.toUpperCase()+'</b><br>The way back is open: ↑ here to '+G.mountRoosts[1].label+'.',4200);
}
const roostOf=o=>G.mountRoosts?.find(r=>r.id===o.mountRoost)||null;
const otherOf=r=>G.mountRoosts?.find(x=>x.id===r.flyTo)||null;
function interactable(o){return !!(mount()&&roostOf(o)&&!G.mountFlight&&usable());}
function prompt(o){
 const m=mount();
 if(travels(m)&&perchOf(m)!==o.mountRoost)return m.creature?'↑  WHISTLE':'↑  CALL IT OVER';
 return m.verb||'↑  RIDE THE '+m.name.replace(/^The /,'').toUpperCase();
}
function panel(m,text,choices){
 const session=G;
 const close=()=>{if(G!==session)return;mode='play';BFKeyboard.clearPressed();showGameUI(true);hudUpdate();};
 BladefallConversation.show({title:m.name,text,accent:m.accent,onClose:close,choices});
 mode='conversation';document.getElementById('bosshpwrap')?.classList.remove('on');
 return true;
}
function interact(o){
 const m=mount(),r=roostOf(o);if(!m||!r)return false;
 const to=otherOf(r);if(!to)return false;
 const lacking=missing();
 if(lacking.length)return panel(m,'Not yet. '+m.name.replace(/^The /,'the ').replace(/^./,ch=>ch.toUpperCase())+' waits until this region has given you what it keeps: '+lacking.map(abilityName).join(', ')+'.');
 const here=!travels(m)||perchOf(m)===r.id;
 const text=here?m.intro+(m.creature?' It shakes out its wings and looks toward '+to.label+'.':''):
  m.creature?'You whistle. Somewhere far down the road, wings open.':m.name.replace(/^The /,'The ')+' waits at '+to.label+'. Call it over?';
 // (7.353) one action, no menu: closing the panel (Esc) is how you decline.
 return panel(m,text,[{label:(m.go||'Fly to')+' '+to.label,action:()=>{BladefallConversation.close();start(m,r,to,!here);}}]);
}
// ---- the ride --------------------------------------------------------------------------------------------
const ease=u=>u*u*u*(u*(u*6-15)+10);
function landing(to,dir){
 if(Number.isFinite(to.land))return {x:to.land,y:floorAt(to.land),face:to.face};
 return {x:Math.max(to.x0+24,Math.min(to.x1-24,to.x+dir*110)),y:to.y,face:dir};
}
function start(m,from,to,arriving){
 const dir=to.x>from.x?1:-1,land=landing(to,dir),dist=Math.abs(land.x-from.x),pathed=PATHED.has(m.kind);
 const rest=pathed?0:m.kind==='zip'?110:m.seat>=0?26:70;   // the mount's anchor above the floor at rest
 const f=G.mountFlight={kind:'ride',mode:m.kind,art:m.art,from,to,land,dir,arrive:arriving?0:1,mount:0,u:0,t:0,lock:0,phase:0,
  dur:m.kind==='blink'?2:dist/(m.speed||1300),seat:m.kind==='zip'?-56:(m.seat||0),
  // Low enough that the road stays in view below (the view is VH units tall, the ground a fifth of it up).
  cruise:Math.min(m.cruise||300,Math.round(VH*.62)),y0:from.y+rest,y1:land.y+rest,x:from.x,y:from.y+rest};
 // A ballistic arc's height grows with its length, within the view.
 if(m.kind==='launch'||m.kind==='throw')f.H=Math.max(220,Math.min(Math.round(VH*.55),dist*(m.arc||.2)));
 if(m.kind==='ground'||m.kind==='rail'||m.kind==='sprint')f.prof=profile(from.x,land.x,from.y,land.y,m.kind==='rail'?14:6);
 if(m.kind==='rift'){
  // Mirror shards hang along the way, one every `hop` units; the knight steps out of each into the next.
  const n=Math.max(2,Math.round(dist/(m.hop||1500)));f.hops=[];
  for(let i=0;i<=n;i++){const x=from.x+(land.x-from.x)*i/n;f.hops.push({x,y:i===0?from.y:i===n?land.y:floorUnder(x,Math.max(from.y,land.y)+200)});}
  f.dur=n*.85;
 }
 if(m.kind==='swing')Object.assign(f,swingPlan(from,land,dir,x=>floorUnder(x,Math.max(from.y,land.y)+200),330,1.05,520,m.speed||1050));
 if(m.kind==='cage')f.rail=Math.max(from.y,land.y)+(m.cruise||300)+170;
 if(m.kind==='sprint'||m.kind==='rift'||m.kind==='ceiling'||m.kind==='swing')f.mount=1;   // no climbing on: he goes
 if(m.kind==='launch')f.y0=from.y+30;   // he rides the bolt from where it lies in the ballista
}
const HAND=46;   // his feet below the rope's end, which is in his raised hands
/* The bell-ropes (7.349): a real pendulum. He leaps up to the first rope, swings through its low point (fast at
   the bottom, slowing at the ends), lets go at the top of the swing, flies to the next rope and catches it, and
   at the last one drops to the floor. Ropes hang every so often; each has its anchor (a bell) a rope's length
   plus his height above its low point, which keeps clear of the floor under it. Pieces share the ride's time by
   the ground they cover. */
function swingPlan(from,land,dir,floor,L,th,gap,speed){
 const dist=Math.abs(land.x-from.x),half=(L+HAND)*Math.sin(th),n=Math.max(1,Math.floor(dist/(2*half+gap)));
 const ropes=[],pieces=[];let cur={x:from.x,y:from.y};
 for(let j=0;j<n;j++){
  const ax=from.x+dir*dist*(j+.5)/n,bottom=Math.max(floor(ax),floor(ax-dir*half),floor(ax+dir*half))+36,ay=bottom+L+HAND;
  const rope={ax,ay,L,th},lift=(L+HAND)*(1-Math.cos(th)),catchP={x:ax-dir*half,y:bottom+lift};
  ropes.push(rope);pieces.push({type:'fly',A:cur,B:catchP,H:j===0?150:140});pieces.push({type:'swing',j});
  cur={x:ax+dir*half,y:bottom+lift};
 }
 pieces.push({type:'fly',A:cur,B:{x:land.x,y:land.y},H:90});
 // Time by ground covered, but a swing never rushes under .38 s.
 const w=pieces.map(q=>q.type==='swing'?Math.max(2*half,.38*speed):Math.max(60,Math.abs(q.B.x-q.A.x)));const sum=w.reduce((a,b)=>a+b,0);
 let acc=0;for(let i=0;i<pieces.length;i++){pieces[i].u0=acc/sum;acc+=w[i];pieces[i].u1=acc/sum;}
 return {ropes,pieces,dur:sum/speed};
}
function swingAt(f,u){
 const P=f.pieces;let i=0;while(i<P.length-1&&u>P[i].u1)i++;
 const q=P[i],k=Math.max(0,Math.min(1,(u-q.u0)/Math.max(1e-6,q.u1-q.u0)));
 if(q.type==='fly'){const x=q.A.x+(q.B.x-q.A.x)*k,y=q.A.y+(q.B.y-q.A.y)*k+4*q.H*k*(1-k);return {x,y,a:0,rope:-1,piece:i,k};}
 const r=f.ropes[q.j],th=-r.th*Math.cos(Math.PI*k),sx=Math.sin(th)*f.dir,cy=Math.cos(th);
 return {x:r.ax+sx*(r.L+HAND),y:r.ay-cy*(r.L+HAND),a:th,rope:q.j,hx:r.ax+sx*r.L,hy:r.ay-cy*r.L,w:Math.sin(Math.PI*k),piece:i,k};
}
// The floor a ride on the ground follows: from the start height, step to whichever standable floor under each x is
// nearest the last (never up more than a jump's worth: those are ledges overhead), keep the height across gaps,
// then smooth it and ease it into both ends. Lines in the dark (rail) are smoothed harder.
function profile(x0,x1,ya,yb,smooth){
 const n=Math.max(2,Math.ceil(Math.abs(x1-x0)/24)),raw=[];let h=ya;
 for(let i=0;i<=n;i++){
  const x=x0+(x1-x0)*i/n;let best=null;
  for(const o of G.obstacles){if(!steady(o)||x<o.x-o.w/2||x>o.x+o.w/2)continue;const top=o.y||0;if(top>h+170)continue;if(best==null||Math.abs(top-h)<Math.abs(best-h))best=top;}
  if(best!=null)h=best;raw.push(h);
 }
 const sm=raw.map((_,i)=>{let a=0,k=0;for(let j=-smooth;j<=smooth;j++){const v=raw[i+j];if(v!=null){a+=v;k++;}}return a/k;});
 return sm.map((v,i)=>{const a=i/n,wa=Math.max(0,1-a/.06),wb=Math.max(0,1-(1-a)/.06);return v*(1-wa-wb)+ya*wa+yb*wb;});
}
const profAt=(f,x)=>{const P=f.prof,i=Math.max(0,Math.min(P.length-1,(x-f.from.x)/(f.land.x-f.from.x)*(P.length-1))),a=Math.floor(i),b=Math.min(P.length-1,a+1);return P[a]+(P[b]-P[a])*(i-a);};
function floorUnder(x,below){let y=0;for(const o of G.obstacles)if(steady(o)&&x>=o.x-o.w/2&&x<=o.x+o.w/2&&(o.y||0)<=below)y=Math.max(y,o.y||0);return y;}
// Where a pathed ride has the knight's feet at progress u (0..1): {x, y, a (the path's angle), flip, hidden}.
function trace(f,u){
 const dx=f.land.x-f.from.x;
 switch(f.mode){
  case 'launch':case 'throw':{const x=f.from.x+dx*u,y=f.y0+(f.y1-f.y0)*u+4*f.H*u*(1-u),dy=(f.y1-f.y0)+4*f.H*(1-2*u);return {x,y,a:Math.atan2(dy,Math.abs(dx))};}
  case 'ground':case 'rail':case 'sprint':{const x=f.from.x+dx*ease(u),y=profAt(f,x),y2=profAt(f,x+f.dir*24);return {x,y,a:Math.atan2(y2-y,24)};}
  case 'slide':{const lift=ease(Math.min(1,u/.14))*ease(Math.min(1,(1-u)/.16)),base=f.y0+(f.y1-f.y0)*u,apex=Math.max(f.y0,f.y1)+f.cruise;
   return {x:f.from.x+dx*ease(u),y:base+(apex-base)*lift,a:0};}
  case 'ceiling':{
   // Gravity turns over: he falls up to the ceiling, runs it upside down, and falls back down at the far end.
   const up=ease(Math.min(1,u/.1)),down=ease(Math.min(1,(1-u)/.1)),k=Math.min(up,down),base=f.y0+(f.y1-f.y0)*u,ceil=Math.max(f.y0,f.y1)+f.cruise;
   return {x:f.from.x+dx*ease(u),y:base+(ceil-44-base)*k,a:0,flip:k>.5,ceil};}
  case 'swing':return swingAt(f,u);
  case 'cage':{
   // Hoisted up to the rail, run along it, lowered at the far end; the cage swings as it goes.
   const up=ease(Math.min(1,u/.12)),down=ease(Math.min(1,(1-u)/.12)),k=Math.min(up,down),base=f.y0+(f.y1-f.y0)*u;
   const x=f.from.x+(f.land.x-f.from.x)*(u<.12?0:u>.88?1:ease((u-.12)/.76));
   return {x,y:base+(f.rail-(f.hang||170)-base)*k,a:Math.sin(u*Math.PI*9)*.09*k,hang:k};}
  case 'rift':{
   const n=f.hops.length-1,s=Math.min(n-1e-6,u*n),i=Math.floor(s),k=s-i,A=f.hops[i],B=f.hops[i+1];
   // In at one shard (.0–.3), a streak of light (.3–.7), out of the next (.7–1).
   const m=k<.3?0:k>.7?1:ease((k-.3)/.4);return {x:A.x+(B.x-A.x)*m,y:A.y+(B.y-A.y)*m,a:0,hidden:k>.22&&k<.78,seg:i,k};}
 }
 return {x:f.from.x,y:f.y0,a:0};
}
function update(dt){
 if(G?.mountHome&&usable())noteReached();
 const f=G?.mountFlight;if(!f)return false;
 const p=G.p;G.time+=dt;f.t+=dt;
 if(f.kind==='arrive'){
  // Whistled for and left at the roost: it lands and waits there.
  if(f.t>=f.dur){store().perch[G.stageIndex]=f.roost.id;keep();G.mountFlight=null;}
  return false;   // the world keeps running while it comes
 }
 // The world holds still while he rides, so he needs no invulnerability (whose blink made him flash all ride).
 p.vx=0;p.vy=0;p.invuln=0;p.hurtFlash=0;p.atkTimer=0;p.dodgeTimer=0;p.slamming=false;
 if(f.arrive<1){f.arrive=Math.min(1,f.arrive+dt/1.4);p.onGround=true;cameraTo(p.x,p.y,dt);return true;}
 if(f.mode==='blink')return blink(f,p,dt);
 if(f.mount<1){
  // He climbs on (or takes hold).
  if(f.mount===0)f.climbFrom={x:p.x,y:p.y};
  f.mount=Math.min(1,f.mount+dt/.45);const k=ease(f.mount);
  p.x=f.climbFrom.x+(f.from.x-f.dir*4-f.climbFrom.x)*k;p.y=f.climbFrom.y+(f.y0+f.seat-f.climbFrom.y)*k+Math.sin(Math.PI*k)*30;
  p.face=f.dir;p.onGround=true;f.x=f.from.x;f.y=f.y0;cameraTo(p.x,p.y,dt);return true;
 }
 const hurry=keyDownFor(f.dir>0?'right':'left')?1.9:1;
 f.u=Math.min(1,f.u+dt/f.dur*hurry);
 const u=f.u,base=f.y0+(f.y1-f.y0)*u;
 f.x=f.from.x+(f.land.x-f.from.x)*ease(u);
 if(PATHED.has(f.mode)){
  const q=trace(f,u);f.x=q.x;f.y=q.y;f.a=q.a;f.flip=!!q.flip;f.ceil=q.ceil;p.mergeHidden=!!q.hidden;
  // Running modes animate his legs (the renderers read vx and runAnim).
  if(f.mode==='sprint'||f.mode==='ceiling'&&q.flip){p.vx=f.dir*260;p.runAnim=(p.runAnim||0)+dt*(f.mode==='sprint'?22:14);}
 }
 else if(f.mode==='zip')f.y=f.y0+(f.y1-f.y0)*ease(u)-Math.sin(Math.PI*u)*40;   // a line sags a little under the weight
 else{
  const lift=ease(Math.min(1,u/.12))*ease(Math.min(1,(1-u)/.15)),apex=Math.max(f.y0,f.y1)+f.cruise;
  f.y=base+(apex-base)*lift+Math.sin(f.t*3.1)*9*lift;
 }
 p.x=f.x-(PATHED.has(f.mode)?0:f.dir*4);p.y=f.y+f.seat;p.face=f.dir;p.onGround=true;
 f.lock=Math.min(1,f.lock+dt*1.5);cameraTo(f.x+f.dir*VW*.12,f.mode==='ceiling'?f.y+90:f.y,dt,f.lock);
 if(u>=1)arrive(f,p);
 return true;
}
// A way through: he steps in at one roost (fade out), the passage takes him (dark), he steps out at the other.
function blink(f,p,dt){
 const u=f.t/f.dur;
 if(u<.35){p.face=f.dir;p.mergeHidden=u>.25;cameraTo(f.from.x,f.from.y,dt);}
 else if(u<.6){if(!f.moved){f.moved=true;p.x=f.land.x;p.y=f.land.y;cameraTo(p.x,p.y,1,1);}p.mergeHidden=true;}
 else{p.mergeHidden=u<.72;p.face=f.land.face;cameraTo(p.x,p.y,dt);}
 if(u>=1){p.mergeHidden=false;arrive(f,p);}
 return true;
}
function arrive(f,p){
 // Set down by the far roost, facing on.
 p.x=f.land.x;p.y=f.land.y;p.vx=0;p.vy=0;p.onGround=false;p.face=f.land.face;p.safeX=p.x;p.mergeHidden=false;
 // A mount that travels is perched where it set him down; the automaton stays where it threw him from.
 const m=mount();if(m&&travels(m)){store().perch[G.stageIndex]=m.staysBehind?f.from.id:f.to.id;keep();}
 G.mountFlight=null;BFKeyboard.clearPressed();
 try{m?.arrive?.(f.to);}catch(e){}
 if(typeof addText==='function')addText(p.x,GROUND_Y-p.y-70,f.to.label.toUpperCase(),m?.accent||'#d8b070',true);
}
// The camera eases onto the ride, then holds it (lock 1): at full speed an eased camera fell a screen behind.
// The knight rides in the upper third of the view with the road below.
function cameraTo(x,y,dt,lock=0){
 const tx=Math.max(0,Math.min(Math.max(0,G.levelLength-VW),x-VW*.5)),ty=Math.max(0,y-GROUND_Y+VH*.3);
 const k=Math.max(1-Math.exp(-5*dt),lock);G.cam+=(tx-G.cam)*k;G.camY+=(ty-G.camY)*k;
 if(typeof BFCamera!=='undefined')BFCamera.sync(G.cam,G.camY);
}
// ---- drawing ---------------------------------------------------------------------------------------------
// Every piece is drawn side on in world units, facing +x and mirrored for -x; (x, y) is world space (y up).
const SY=y=>GROUND_Y-y;
function at(c,x,y,dir){c.save();c.translate(Math.round(x),Math.round(SY(y)));c.scale(dir,1);}
const fill=(c,col,pts)=>{c.fillStyle=col;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
const box=(c,col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
const BRONZE={body:'#8a6a3a',dark:'#4a3420',belly:'#c9a46a',wing:'#6b4a2a',edge:'#d8b070',eye:'#ffd27a',horn:'#e8dcc0'};
const RIME={body:'#9fc0d8',dark:'#4a6a86',belly:'#e6f4ff',wing:'#7fa6c8',edge:'#e8f8ff',eye:'#bfe4ff',horn:'#ffffff'};
function wing(c,a,near,P){
 c.save();c.translate(-4,-10);c.rotate(-a);
 c.fillStyle=near?P.wing:P.dark;c.globalAlpha=near?.95:.8;
 c.beginPath();c.moveTo(0,0);c.lineTo(-14,-38);c.lineTo(10,-56);c.lineTo(30,-34);c.lineTo(26,-6);c.closePath();c.fill();
 c.globalAlpha=1;c.strokeStyle=P.edge;c.lineWidth=2;
 c.beginPath();c.moveTo(0,0);c.lineTo(10,-56);c.moveTo(0,0);c.lineTo(30,-34);c.moveTo(0,0);c.lineTo(-14,-38);c.stroke();
 c.restore();
}
function drake(c,x,y,dir,t,pose,P=BRONZE){
 // pose: 'perch' (sitting, wings folded) or 'fly'; (x,y) is the body's centre
 const fly=pose==='fly',flap=fly?Math.sin(t*9)*.75:0,breathe=Math.sin(t*2)*1.2;
 c.save();c.translate(Math.round(x),Math.round(SY(y)));c.scale(dir,1);
 if(!fly){c.fillStyle='rgba(0,0,0,.28)';c.beginPath();c.ellipse(0,26,40,5,0,0,Math.PI*2);c.fill();}
 if(fly)wing(c,.35+flap,false,P);
 c.strokeStyle=P.body;c.lineWidth=7;c.lineCap='round';
 const sw=Math.sin(t*(fly?4:1.4))*(fly?6:3);
 c.beginPath();c.moveTo(-28,2);c.quadraticCurveTo(-56,8+sw,-80,(fly?4:20)+sw);c.stroke();
 c.fillStyle=P.edge;c.beginPath();c.moveTo(-80,(fly?4:20)+sw);c.lineTo(-92,(fly?-2:14)+sw);c.lineTo(-90,(fly?10:26)+sw);c.closePath();c.fill();
 c.fillStyle=P.dark;
 if(fly){c.fillRect(-14,10,10,5);c.fillRect(8,10,10,5);}
 else{c.fillRect(-18,8,7,18);c.fillRect(12,8,7,18);c.fillRect(-21,24,11,3);c.fillRect(10,24,11,3);}
 c.fillStyle=P.body;c.beginPath();c.ellipse(0,breathe*.3,34,15+breathe*.3,0,0,Math.PI*2);c.fill();
 c.fillStyle=P.belly;c.beginPath();c.ellipse(4,7,24,6,0,0,Math.PI*2);c.fill();
 for(let i=-20;i<=16;i+=9){c.fillStyle=P.dark;c.fillRect(i,-15,3,4);}
 const hy=fly?-4:-22-breathe;
 c.strokeStyle=P.body;c.lineWidth=11;c.beginPath();c.moveTo(24,-4);c.quadraticCurveTo(38,-8,46,hy);c.stroke();
 c.fillStyle=P.body;c.beginPath();c.moveTo(42,hy-8);c.lineTo(66,hy-2);c.lineTo(64,hy+5);c.lineTo(42,hy+7);c.closePath();c.fill();
 c.fillStyle=P.horn;c.beginPath();c.moveTo(44,hy-7);c.lineTo(36,hy-17);c.lineTo(49,hy-8);c.closePath();c.fill();
 c.fillStyle=P.eye;c.fillRect(53,hy-4,4,3);
 if(!fly&&Math.sin(t*.7)>.97){c.fillStyle=P===RIME?'rgba(220,240,255,.6)':'rgba(255,170,90,.5)';c.beginPath();c.arc(70,hy+2,4,0,Math.PI*2);c.fill();}
 if(!fly){c.fillStyle=P.wing;c.beginPath();c.moveTo(-18,-10);c.lineTo(14,-12);c.lineTo(-4,-30);c.closePath();c.fill();
  c.strokeStyle=P.edge;c.lineWidth=2;c.beginPath();c.moveTo(-18,-10);c.lineTo(-4,-30);c.lineTo(14,-12);c.stroke();}
 c.restore();
}
function moths(c,x,y,t,n,spread,lantern){
 c.save();
 for(let i=0;i<n;i++){
  const a=t*(1.4+(i%5)*.23)+i*2.4,r=spread*(.45+.55*((i*37)%11)/11),mx=x+Math.cos(a)*r,my=y+Math.sin(a*1.3)*r*.55,flap=Math.sin(t*22+i)>0?3:1;
  c.globalAlpha=.85;box(c,'#c4ecd0',mx-flap,SY(my)-1,flap,2);box(c,'#c4ecd0',mx+1,SY(my)-1,flap,2);box(c,'#f4fff0',mx,SY(my)-1,1,2);
  c.globalAlpha=.18;c.fillStyle='#c4ecd0';c.beginPath();c.arc(mx,SY(my),6,0,Math.PI*2);c.fill();
 }
 if(lantern){c.globalAlpha=1;box(c,'#3a3028',x-4,SY(y)-6,8,10);c.globalAlpha=.9;box(c,'#e8d890',x-2,SY(y)-4,4,6);c.globalAlpha=.25;c.fillStyle='#fff2b0';c.beginPath();c.arc(x,SY(y)-1,14,0,Math.PI*2);c.fill();}
 c.restore();
}
function kite(c,x,y,dir,t,flying){
 at(c,x,y,dir);c.rotate(flying?-.35+Math.sin(t*3)*.05:-.15);
 fill(c,'#2a4a60',[[0,-34],[24,0],[0,30],[-20,0]]);fill(c,'#9fe0ff',[[0,-30],[20,0],[0,0]]);fill(c,'#5fa6c8',[[0,0],[-16,0],[0,26]]);
 c.strokeStyle='#e8f4ff';c.lineWidth=1.5;c.beginPath();c.moveTo(0,-34);c.lineTo(0,30);c.moveTo(-20,0);c.lineTo(24,0);c.stroke();
 c.strokeStyle='#d8c890';c.lineWidth=1;c.beginPath();c.moveTo(0,30);for(let i=1;i<6;i++)c.lineTo(Math.sin(t*6+i)*5-i*3,30+i*9);c.stroke();
 c.restore();
}
function sled(c,x,y,dir,t,moving){
 at(c,x,y,dir);
 box(c,'#7a4e2c',-26,-6,52,6);box(c,'#a8714a',-26,-8,52,2);box(c,'#3a2a20',-22,0,4,6);box(c,'#3a2a20',18,0,4,6);
 c.strokeStyle='#c8d8e8';c.lineWidth=2;c.beginPath();c.moveTo(-30,6);c.lineTo(26,6);c.quadraticCurveTo(36,6,34,-4);c.stroke();
 if(moving){c.globalAlpha=.6;for(let i=0;i<8;i++){const k=(t*3+i/8)%1;box(c,'#f4fbff',-30-k*60,4-k*16+Math.sin(i)*4,2,2);}}
 c.restore();
}
function skiff(c,x,y,dir,t,moving){
 at(c,x,y,dir);
 fill(c,'#5a3a24',[[-36,-8],[38,-8],[28,8],[-30,8]]);box(c,'#8a6a44',-34,-10,70,3);
 box(c,'#4a3020',-2,-70,3,62);fill(c,'#e8e0c8',[[1,-68],[30,-20],[1,-14]]);fill(c,'#c8c0a8',[[-2,-62],[-26,-18],[-2,-16]]);
 if(moving){c.globalAlpha=.5;for(let i=0;i<6;i++)box(c,'#d8f0ff',-40-i*10-((t*120)%10),8+(i%2)*2,6,2);}
 c.restore();
}
function rocket(c,x,y,dir,t,lit){
 at(c,x,y,dir);c.rotate(lit?0:-Math.PI/2*0);
 fill(c,'#c84030',[[-30,-6],[22,-6],[34,0],[22,6],[-30,6]]);box(c,'#ffd070',-30,-2,52,2);fill(c,'#8a2a20',[[-30,-6],[-38,-14],[-24,-6]]);fill(c,'#8a2a20',[[-30,6],[-38,14],[-24,6]]);
 if(lit){for(let i=0;i<12;i++){const k=((t*4+i/12)%1);c.globalAlpha=1-k;box(c,i%2?'#ffd070':'#ff8a3a',-34-k*70,Math.sin(i*7+t*9)*6*k-1,3,3);}c.globalAlpha=1;}
 c.restore();
}
function crane(c,x,y,dir,t,flying){
 at(c,x,y,dir);const f=flying?Math.sin(t*5)*16:0;
 fill(c,'#f0e6d0',[[-30,0],[0,-8],[34,-4],[0,8]]);fill(c,'#d8ccb0',[[34,-4],[44,-22],[38,-4]]);fill(c,'#f0e6d0',[[-30,0],[-44,-20],[-24,-2]]);
 fill(c,flying?'#e8dcc0':'#e0d4b8',[[-8,-6],[6,-6],[-2,-36-f]]);
 c.strokeStyle='#b8a888';c.lineWidth=1;c.beginPath();c.moveTo(-30,0);c.lineTo(34,-4);c.stroke();
 c.restore();
}
function cloakWings(c,x,y,dir,t,flying){
 at(c,x,y,dir);const f=flying?Math.sin(t*4)*6:0;
 fill(c,'#fff0c0',[[-2,-34],[-46,-22+f],[-40,-12+f],[-30,-16+f],[-22,-6+f],[-2,-18]]);
 c.strokeStyle='#d8c890';c.lineWidth=1;c.beginPath();c.moveTo(-2,-30);c.lineTo(-44,-20+f);c.moveTo(-6,-24);c.lineTo(-30,-14+f);c.stroke();
 c.restore();
}
function seed(c,x,y,t){
 c.save();const sy=SY(y);
 c.globalAlpha=.25;c.fillStyle='#e8f0ff';c.beginPath();c.arc(x,sy,30,0,Math.PI*2);c.fill();c.globalAlpha=1;
 for(let i=0;i<14;i++){const a=i/14*Math.PI*2+Math.sin(t)*.1;c.strokeStyle='#e8f0ff';c.lineWidth=1;c.beginPath();c.moveTo(x,sy);c.lineTo(x+Math.cos(a)*22,sy+Math.sin(a)*14-6);c.stroke();box(c,'#ffffff',x+Math.cos(a)*22-1,sy+Math.sin(a)*14-7,2,2);}
 box(c,'#b8c8e8',x-3,sy-3,6,6);c.strokeStyle='#c8d8f0';c.beginPath();c.moveTo(x,sy+3);c.lineTo(x,sy+40);c.stroke();
 c.restore();
}
function automaton(c,x,y,dir,t,throwing){
 at(c,x,y,dir);const k=throwing?Math.min(1,throwing):0;
 box(c,'#4a3a30',-14,-60,28,40);box(c,'#6a5444',-12,-58,24,10);box(c,'#ffc070',-6,-55,4,3);box(c,'#ffc070',3,-55,4,3);
 box(c,'#3a2c24',-12,-20,8,20);box(c,'#3a2c24',4,-20,8,20);box(c,'#5a4838',14,-56+k*-20,8,30);box(c,'#5a4838',-22,-56,8,28);
 c.restore();
}
function comet(c,x,y,dir,t){
 c.save();for(let i=0;i<14;i++){const k=i/14;c.globalAlpha=(1-k)*.7;box(c,i%3?'#ffc070':'#ff7a2a',x-dir*(10+k*90)+Math.sin(t*20+i)*3,SY(y)-20+Math.cos(i*3+t*15)*4*k,3,3);}c.restore();
}
function doorArt(c,x,y,dir,t,kind,accent,glow){
 at(c,x,y,1);
 if(kind==='door'||kind==='gate'){box(c,'#2a2630',-20,-64,40,64);box(c,kind==='gate'?'#4a5a58':'#5a4a3a',-16,-60,32,60);
  if(kind==='gate')for(let i=-12;i<=12;i+=6)box(c,'#2a3434',i,-60,2,60);else{box(c,'#3a2c22',-16,-32,32,2);box(c,accent,8,-32,3,3);}}
 else if(kind==='mirror'){box(c,'#3a2c40',-18,-70,36,70);box(c,'#8a7aa8',-14,-66,28,62);c.globalAlpha=.4+.2*Math.sin(t*2);box(c,'#e8d8ff',-12,-64,10,58);c.globalAlpha=1;}
 else if(kind==='hatch'){box(c,'#2a2236',-22,-110,44,12);box(c,'#5a4a7a',-18,-108,36,8);for(let i=0;i<5;i++)box(c,'#3a3050',-14,-96+i*18,28,3);box(c,'#3a3050',-16,-98,3,98);box(c,'#3a3050',13,-98,3,98);}
 else if(kind==='bell'){box(c,'#2a2230',-26,-90,4,90);box(c,'#2a2230',22,-90,4,90);box(c,'#2a2230',-26,-92,52,5);fill(c,'#8a78a0',[[-14,-82],[14,-82],[18,-50],[-18,-50]]);box(c,'#c9b8ff',-2,-50,4,6);}
 else if(kind==='cart'||kind==='handcar'){box(c,'#3a3028',-46,-2,92,3);box(c,'#2a2420',-40,-30,80,24);box(c,'#5a4838',-38,-28,76,4);
  for(const wx of [-26,24]){c.fillStyle='#1a1614';c.beginPath();c.arc(wx,-6,7,0,Math.PI*2);c.fill();}
  if(kind==='handcar'){box(c,'#5a4838',-2,-56,4,28);box(c,'#7a6448',-22,-58+Math.sin(t*3)*4,44,4);}else box(c,'#ff7a2a',-30,-36,60,6);}
 if(glow>0){c.globalAlpha=glow*.6;c.fillStyle=accent;c.beginPath();c.arc(0,-40,46,0,Math.PI*2);c.fill();c.globalAlpha=1;}
 c.restore();
}
function post(c,x,y,accent,tall){
 const gx=x,gy=SY(y),h=tall?120:74;
 c.save();box(c,'#3a2c22',gx+34,gy-h,6,h);box(c,'#3a2c22',gx+22,gy-h,30,5);
 c.fillStyle=accent;c.globalAlpha=.85;c.beginPath();c.arc(gx+37,gy-h+12,4,0,Math.PI*2);c.fill();c.restore();
}
// The mount at rest by its roost.
function rest(c,m,o,t){
 const x=o.x,y=o.y||0,dir=(otherOf(roostOf(o))?.x??x+1)>x?1:-1;
 switch(m.art){
  case 'drake':return drake(c,x,y+26,dir,t,'perch');
  case 'rime':return drake(c,x,y+26,dir,t,'perch',RIME);
  case 'moths':return moths(c,x+37,y+58,t,10,20,true);
  case 'kite':return kite(c,x,y+40,dir,t,false);
  case 'sled':return sledTeam(c,x,y,dir,t,false);
  case 'skiff':return skiff(c,x,y+8,dir,t,false);
  case 'rocket':return rocket(c,x,y+40,dir,t,false);
  case 'crane':return crane(c,x,y+14,dir,t,false);
  case 'cloak':{post(c,x-40,y,m.accent,false);return cloakWings(c,x+2,y+70,-1,t,false);}
  case 'seed':return seed(c,x,y+70,t);
  case 'throw':return automaton(c,x,y,dir,t,0);
  case 'cage':{post(c,x-60,y,'#9fb8b0',true);c.save();c.strokeStyle='#5a6060';c.lineWidth=2;c.beginPath();c.moveTo(x,SY(y+118));c.lineTo(x,SY(y+62));c.stroke();c.restore();
   box(c,'#3a2c22',x-24,SY(y+120),50,5);cageArt(c,x,y,0,false);cageArt(c,x,y,0,true);return;}
 }
}
function drawRoost(c,o){
 const m=mount();if(!m||!roostOf(o))return;
 const f=G.mountFlight,t=G.time||0;
 if(m.kind==='blink'){
  const glow=f?.kind==='ride'&&(f.from.id===o.mountRoost&&f.t<f.dur*.4||f.to.id===o.mountRoost&&f.t>f.dur*.55)?Math.sin(Math.PI*Math.min(1,(f.t%f.dur)/(f.dur*.4))):0;
  return doorArt(c,o.x,o.y||0,1,t,m.art,m.accent,glow);
 }
 const riding=f?.kind==='ride'&&f.arrive>=1,toward=(otherOf(roostOf(o))?.x??o.x+1)>o.x?1:-1;
 // Fixed at both ends: the cart line's head, the hatch up to the ceiling, the mirror, the bell. They light as a ride
 // leaves or reaches them; the cart is out on the line while it runs.
 if(m.kind==='rail'||m.kind==='ceiling'||m.kind==='rift'||m.kind==='sprint'){
  const glow=riding?(f.from.id===o.mountRoost?Math.max(0,1-f.u/.12):f.to.id===o.mountRoost?Math.max(0,(f.u-.88)/.12):0):0;
  if(m.kind==='rail'&&riding&&f.mount>=1&&f.u<1&&(f.from.id===o.mountRoost))return post(c,o.x-37,o.y||0,m.accent,false);
  doorArt(c,o.x,o.y||0,1,t,m.art,m.accent,glow);
  if(m.kind==='rift')shard(c,o.x,o.y||0,t,glow);
  return;
 }
 if(m.kind==='launch')return ballista(c,o.x,o.y||0,toward,t,!(riding&&f.from.id===o.mountRoost&&f.mount>=1&&f.u<1));
 if(m.kind==='swing'){post(c,o.x-37,o.y||0,m.accent,true);bellAnchor(c,o.x,(o.y||0)+130,m.accent,t);
  if(!(riding&&f.u<1)){c.save();c.strokeStyle='#d8c8a0';c.lineWidth=2;c.beginPath();c.moveTo(o.x,SY((o.y||0)+114));c.lineTo(o.x+Math.sin(t*1.4)*4,SY((o.y||0)+46));c.stroke();c.restore();}
  return;}
 if(m.kind==='slide'){
  cairn(c,o.x,o.y||0,m.accent,t);
  const near=G.mountRoosts.reduce((a,b)=>Math.abs(b.x-G.p.x)<Math.abs(a.x-G.p.x)?b:a);
  if(!riding&&near.id===o.mountRoost)fox(c,o.x-26*toward,o.y||0,toward,t,false);
  return;
 }
 if(m.kind==='zip'){post(c,o.x-37,o.y||0,m.accent,true);return zipStub(c,o,t);}
 post(c,o.x,o.y||0,m.accent,false);
 // Called over (or coming for a ride from the far roost): the drakes fly in; anything else glides in.
 const coming=f?.kind==='arrive'&&f.roost.id===o.mountRoost?ease(Math.min(1,f.t/f.dur)):f?.kind==='ride'&&f.from.id===o.mountRoost&&f.arrive<1?ease(f.arrive):null;
 if(coming!=null){
  const dx=(1-coming)*f.dir*-520,dy=(1-coming)*420;
  if(m.art==='drake'||m.art==='rime')return drake(c,o.x+dx,(o.y||0)+26+dy,f.dir,t,coming<.9?'fly':'perch',m.art==='rime'?RIME:BRONZE);
  c.save();c.globalAlpha=Math.min(1,coming*1.4);rest(c,m,{...o,x:o.x+dx,y:(o.y||0)+dy},t);c.restore();return;
 }
 if(f?.kind==='ride'&&f.from.id===o.mountRoost&&m.art!=='throw')return;   // it is under him
 if(perchOf(m)===o.mountRoost)rest(c,m,o,t);
}
function zipStub(c,o,t){
 const other=otherOf(roostOf(o));if(!other)return;
 const dir=other.x>o.x?1:-1;c.save();c.strokeStyle='#c8b890';c.lineWidth=1.5;c.beginPath();c.moveTo(o.x,SY((o.y||0)+110));c.lineTo(o.x+dir*260,SY((o.y||0)+110+(other.y-(o.y||0))*260/Math.abs(other.x-o.x)));c.stroke();
 box(c,'#5a4a3a',o.x-4,SY((o.y||0)+110)-2,8,8);c.restore();
}
function drawUnder(c){
 const f=G?.mountFlight;if(!f||f.kind!=='ride'||f.arrive<1||f.mode==='blink')return;
 const t=G.time||0,m=mount(),flying=f.mount>=1,x=flying?f.x:f.from.x,y=flying?f.y:f.y0,d=f.dir;
 if(f.mode==='zip'){
  c.save();c.strokeStyle='#c8b890';c.lineWidth=1.5;c.beginPath();c.moveTo(f.from.x,SY(f.y0));c.quadraticCurveTo((f.from.x+f.land.x)/2,SY((f.y0+f.y1)/2-80),f.land.x,SY(f.y1));c.stroke();
  box(c,'#5a4a3a',x-6,SY(y)-4,12,8);c.strokeStyle='#8a7a5a';c.beginPath();c.moveTo(x,SY(y)+4);c.lineTo(x,SY(y)+16);c.stroke();c.restore();
  return;
 }
 if(PATHED.has(f.mode)){
  const a=f.a||0;
  switch(f.mode){
   case 'launch':if(flying&&f.u<1){c.save();c.translate(Math.round(f.x),Math.round(SY(f.y-4)));c.scale(d,1);bolt(c,-a);c.restore();speedLines(c,f.x,f.y-6,d,t,'#e8dcc0',4,70);}return;
   case 'throw':
    if(f.u<.3){const k=f.u/.3;c.save();c.globalAlpha=1-k*.6;automaton(c,f.from.x,f.from.y,d,t,1);c.restore();}
    if(!flying)automaton(c,f.from.x+d*30,f.from.y,d,t,f.mount);
    else if(f.u<1){speedLines(c,f.x,f.y+10,d,t,'#ffe0b0',6,110);}
    return;
   case 'ground':return sledTeam(c,flying?f.x:f.from.x,flying?f.y:f.from.y,d,t,flying,flying?a:0);
   case 'rail':if(flying){rails(c,f,t);}return;
   case 'sprint':if(flying){speedLines(c,f.x,f.y,d,t,'#c9b8ff',9,140);
     c.save();for(let i=1;i<=3;i++){const q=trace(f,Math.max(0,f.u-i*.012));c.globalAlpha=.22-i*.05;box(c,'#c9b8ff',q.x-7,SY(q.y)-44,14,44);}c.restore();}
    bellRings(c,f.from.x,f.from.y,0,f.t,mount()?.accent||'#c9b8ff');return;
   case 'slide':if(flying){iceRoad(c,f,t);const q=trace(f,Math.min(1,f.u+90/Math.max(1,Math.abs(f.land.x-f.from.x))));fox(c,q.x,q.y,d,t,true);}return;
   case 'ceiling':if(f.u>.04&&f.u<.96)ceilingBand(c,f,t);
    if(f.u<.14||f.u>.86){c.save();c.globalAlpha=.7;for(let i=0;i<10;i++){const k=((t*3+i/10)%1);box(c,'#c9a0ff',f.x+Math.sin(i*2.3)*24,SY(f.y+k*80*(f.flip?-1:1)+20),2,2);}c.restore();}
    return;
   case 'swing':if(flying)swingRopes(c,f,t);return;
   case 'cage':if(flying){railTrack(c,f,t);c.save();c.strokeStyle='#5a6060';c.lineWidth=2;c.beginPath();c.moveTo(f.x,SY(f.rail));c.lineTo(f.x+Math.sin(f.a||0)*-60,SY(f.y+62));c.stroke();c.restore();}
    cageArt(c,flying?f.x:f.from.x,flying?f.y:f.from.y,flying?f.a||0:0,false);return;
   case 'rift':{
    for(const h of f.hops)shard(c,h.x,h.y,t,0);
    const q=trace(f,f.u);
    if(q.hidden){const A=f.hops[q.seg],B=f.hops[q.seg+1],e=ease(Math.min(1,Math.max(0,(q.k-.22)/.56)));
     c.save();c.strokeStyle='#e8d8ff';c.lineCap='round';c.globalAlpha=.85;c.lineWidth=6;c.beginPath();const sx=A.x+(B.x-A.x)*Math.max(0,e-.25),ex=A.x+(B.x-A.x)*e;
     c.moveTo(sx,SY(A.y+40+(B.y-A.y)*Math.max(0,e-.25)));c.lineTo(ex,SY(A.y+40+(B.y-A.y)*e));c.stroke();c.lineWidth=2;c.strokeStyle='#ffffff';c.stroke();c.restore();}
    return;}
  }
  return;
 }
 switch(f.art){
  case 'drake':return drake(c,x,y,d,t,flying?'fly':'perch');
  case 'rime':return drake(c,x,y,d,t,flying?'fly':'perch',RIME);
  case 'moths':return moths(c,x,y,t,22,30,false);
  case 'kite':{kite(c,x,y,d,t,flying);c.save();c.strokeStyle='#d8c890';c.lineWidth=1;c.beginPath();c.moveTo(x,SY(y-28));c.lineTo(G.p.x+4,SY(G.p.y+40));c.stroke();c.restore();return;}
  case 'sled':return sled(c,x,y-20,d,t,flying);
  case 'skiff':return skiff(c,x,y-18,d,t,flying);
  case 'rocket':return rocket(c,x,y-16,d,t,flying);
  case 'crane':return crane(c,x,y-10,d,t,flying);
  case 'cloak':return cloakWings(c,G.p.x,G.p.y+44,d,t,flying);
  case 'seed':{seed(c,x,y,t);return;}
  case 'throw':if(flying)comet(c,G.p.x,G.p.y,d,t);if(f.u<.2){const k=f.u/.2;c.save();c.globalAlpha=1-k;automaton(c,f.from.x,f.from.y,d,t,1);c.restore();}if(!flying)automaton(c,f.from.x+d*30,f.from.y,d,t,f.mount);return;
 }
}
function drawOver(c){
 const f=G?.mountFlight;if(!f||f.kind!=='ride'||f.arrive<1)return;
 if(f.mode==='blink'){
  // The way through: a fade to the dark between the two roosts.
  const u=f.t/f.dur,a=u<.35?Math.max(0,(u-.2)/.15):u<.6?1:Math.max(0,1-(u-.6)/.15);
  if(a>0){c.save();c.globalAlpha=a;c.fillStyle='#05040a';c.fillRect(G.cam-2000,-(G.camY||0)-6000,VW+4000,12000);c.restore();}
  return;
 }
 if(f.mode==='cage'){cageArt(c,f.mount>=1?f.x:f.from.x,f.mount>=1?f.y:f.from.y,f.mount>=1?f.a||0:0,true);return;}
 if(f.mode==='rail'){cartBody(c,f.mount>=1?f.x:f.from.x,f.mount>=1?f.y:f.from.y,f.dir,G.time||0,f.mount>=1?f.a||0:0);if(f.mount>=1&&f.u<1)darkness(c,f);return;}
 if(f.mount<1)return;
 if(f.art==='drake'||f.art==='rime'){c.save();c.translate(Math.round(f.x),Math.round(SY(f.y)));c.scale(f.dir,1);wing(c,.35+Math.sin((G.time||0)*9)*.75,true,f.art==='rime'?RIME:BRONZE);c.restore();}
 if(f.art==='moths')moths(c,f.x,f.y-30,G.time||0,8,34,false);
}
// The knight's own pose on a pathed ride, for the renderers: turned with a slope or a tumble (rot, radians,
// clockwise on screen), upside down on the ceiling (flip), running (run, rate) or in the air (air). Null: as usual.
// The knight's look on any ride: steady (1), or steadily faded (Settings › Faded rides), which reads as
// passing through the walls and rock the rides cross.
function heroAlpha(){
 const f=G?.mountFlight;if(!f||f.kind!=='ride'||f.arrive<1)return 1;
 return typeof meta!=='undefined'&&meta.rideGhost?.5:1;
}
function heroPose(){
 const f=G?.mountFlight;if(!f||f.kind!=='ride'||f.arrive<1||f.mount<1||f.u>=1||!PATHED.has(f.mode))return null;
 switch(f.mode){
  case 'throw':return {rot:f.dir*ease(f.u)*Math.PI*4,air:true};   // two somersaults, landing on his feet
  case 'ceiling':return f.flip?{flip:true,run:true,rate:14}:{air:true};
  case 'sprint':return {run:true,rate:24};
  case 'launch':return {rot:-f.dir*f.a*.8};
  case 'ground':case 'rail':return {rot:-f.dir*f.a};
  case 'slide':return {rot:f.dir*.12};
  case 'swing':return {rot:-f.dir*(f.a||0),air:true};
  case 'cage':return {rot:-f.a};
 }
 return null;
}
// ---- the new rides' art (7.347) ----------------------------------------------------------------------------
function bolt(c,rot){c.save();c.rotate(rot);box(c,'#7a5a3a',-36,-2,68,4);box(c,'#9a7a52',-36,-2,68,1);fill(c,'#c8ccd8',[[32,-6],[46,0],[32,6]]);
 fill(c,'#c8b07a',[[-36,-2],[-48,-9],[-41,-2]]);fill(c,'#c8b07a',[[-36,2],[-48,9],[-41,2]]);c.restore();}
function ballista(c,x,y,dir,t,loaded){
 at(c,x,y,dir);
 box(c,'#3a2c22',-26,-10,8,10);box(c,'#3a2c22',16,-10,8,10);box(c,'#5a4434',-30,-22,62,12);box(c,'#6a5040',-30,-22,62,3);
 c.save();c.translate(2,-28);c.rotate(-.42);
 box(c,'#6a5040',-36,-5,74,8);box(c,'#3a2c22',-40,-7,8,12);
 c.strokeStyle='#8a6a48';c.lineWidth=4;c.beginPath();c.moveTo(28,-30);c.quadraticCurveTo(44,-1,28,28);c.stroke();
 c.strokeStyle='#e0d0a8';c.lineWidth=1;c.beginPath();c.moveTo(28,-30);c.lineTo(loaded?-22:8,-1);c.lineTo(28,28);c.stroke();
 if(loaded){c.translate(4,-6);bolt(c,0);}
 c.restore();c.restore();
}
function dog(c,x,y,dir,t,run,ph){
 at(c,x,y,dir);const s=run?Math.sin(t*20+ph):0;
 box(c,'#d8dce4',-14,-19,28,10);box(c,'#8a94a4',-14,-19,28,3);box(c,'#e8ecf2',11,-25,11,9);fill(c,'#aab2c0',[[13,-25],[15,-31],[18,-25]]);
 box(c,'#1a1a22',19,-22,2,2);box(c,'#3a3030',21,-19,2,2);fill(c,'#d8dce4',[[-14,-17],[-24,-25+s*3],[-15,-12]]);
 for(const [lx,k] of [[-12,1],[-6,-1],[6,-1],[11,1]])box(c,'#c4c8d0',lx+s*k*3,-9,3,9);
 c.restore();
}
function sledTeam(c,x,y,dir,t,moving,a=0){
 // The sled and her two dogs in harness ahead, all on the road's slope.
 c.save();c.translate(Math.round(x),Math.round(SY(y)));c.rotate(-dir*a);c.translate(-Math.round(x),-Math.round(SY(y)));
 sled(c,x,y,dir,t,moving);
 for(const [k,ph] of [[1,0],[2,1.7]]){const dx=x+dir*(30+k*40);dog(c,dx,y+1,dir,t,moving,ph);}
 c.strokeStyle='#8a6a48';c.lineWidth=1;c.beginPath();c.moveTo(x+dir*30,SY(y+6));c.lineTo(x+dir*104,SY(y+14));c.stroke();
 c.restore();
}
function fox(c,x,y,dir,t,run){
 at(c,x,y,dir);const s=run?Math.sin(t*22):0;
 c.globalAlpha=.25;c.fillStyle='#bfe4ff';c.beginPath();c.arc(0,-10,18,0,Math.PI*2);c.fill();c.globalAlpha=1;
 box(c,'#eef6ff',-10,-13,20,7);box(c,'#bfe4ff',-10,-13,20,2);box(c,'#f8fcff',8,-18,8,7);fill(c,'#dceeff',[[9,-18],[11,-23],[13,-18]]);box(c,'#3a6a9a',14,-16,2,2);
 fill(c,'#f8fcff',[[-10,-11],[-22,-18+s*3],[-24,-12],[-12,-8]]);fill(c,'#bfe4ff',[[-22,-18+s*3],[-26,-16],[-24,-12]]);
 for(const [lx,k] of [[-8,1],[-3,-1],[4,-1],[8,1]])box(c,'#dceeff',lx+s*k*2,-6,2,6);
 c.restore();
}
function cairn(c,x,y,accent,t){
 // A frost cairn: where the ice road starts.
 const gx=x+30,gy=SY(y);c.save();
 box(c,'#8aa8c0',gx-12,gy-12,24,12);box(c,'#a8c4d8',gx-9,gy-22,18,10);box(c,'#c8dcec',gx-6,gy-30,12,8);
 c.globalAlpha=.45+.2*Math.sin(t*2);c.fillStyle=accent;c.beginPath();c.arc(gx,gy-34,6,0,Math.PI*2);c.fill();c.restore();
}
function iceRoad(c,f,t){
 // The road freezes a little ahead of him and melts a little behind.
 const u=f.u,pts=[],du=1/Math.max(1,Math.abs(f.land.x-f.from.x));
 for(let d=-420;d<=140;d+=14){const v=Math.max(0,Math.min(1,u+d*du));const q=trace(f,v);pts.push([q.x,q.y,d/420*.16]);}
 c.save();c.lineCap='round';
 for(const [w,col,al] of [[16,'#9fd0f0',.28],[7,'#d8f0ff',.55],[2,'#ffffff',.9]]){
  c.globalAlpha=al;c.strokeStyle=col;c.lineWidth=w;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,SY(y-3)):c.moveTo(x,SY(y-3)));c.stroke();}
 c.globalAlpha=.8;for(let i=0;i<pts.length;i+=3){const [x,y,k]=pts[i];if(k<-.1)continue;box(c,'#ffffff',x+Math.sin(t*7+i)*6,SY(y-6)-Math.cos(t*5+i)*5,2,2);}
 c.restore();
}
function cartBody(c,x,y,dir,t,a=0){
 c.save();c.translate(Math.round(x),Math.round(SY(y)));c.rotate(-dir*a);c.scale(dir,1);
 box(c,'#2a2420',-30,-26,60,22);box(c,'#5a4838',-28,-24,56,4);box(c,'#ff7a2a',-24,-30,48,4);box(c,'#3a3028',-30,-6,60,3);
 for(const wx of [-18,18]){c.fillStyle='#1a1614';c.beginPath();c.arc(wx,-2,6,0,Math.PI*2);c.fill();c.fillStyle='#6a5444';c.fillRect(wx-1,-3,2,2);}
 box(c,'#e8c060',22,-36,4,6);   // the lantern on its post
 c.restore();
}
function rails(c,f,t){
 c.save();const span=900,step=24;
 c.strokeStyle='#6a5a4a';c.lineWidth=2;for(const off of [0,5]){c.beginPath();let first=true;
  for(let x=f.x-span;x<=f.x+span;x+=step){const lo=Math.min(f.from.x,f.land.x),hi=Math.max(f.from.x,f.land.x);if(x<lo||x>hi)continue;const y=profAt(f,x)-off;first?c.moveTo(x,SY(y)):c.lineTo(x,SY(y));first=false;}c.stroke();}
 for(let x=Math.ceil((f.x-span)/40)*40;x<=f.x+span;x+=40){const lo=Math.min(f.from.x,f.land.x),hi=Math.max(f.from.x,f.land.x);if(x<lo||x>hi)continue;box(c,'#3a3028',x-5,SY(profAt(f,x))-2,10,5);}
 c.globalAlpha=.9;for(let i=0;i<6;i++){const k=((t*6+i/6)%1);box(c,i%2?'#ffd070':'#ff8a3a',f.x-f.dir*(18+k*40)+(i%3-1)*6,SY(f.y)+2-k*14,2,2);}
 c.restore();
}
function darkness(c,f){
 // Through the dark: only the cart's lantern lights the line.
 const x=f.x,y=SY(f.y+20),g=c.createRadialGradient(x,y,50,x,y,520);
 g.addColorStop(0,'rgba(8,4,2,0)');g.addColorStop(.5,'rgba(8,4,2,.72)');g.addColorStop(1,'rgba(8,4,2,.93)');
 const k=Math.min(1,f.u/.06,(1-f.u)/.06);
 c.save();c.globalAlpha=Math.max(0,k);c.fillStyle=g;c.fillRect(G.cam-2000,-(G.camY||0)-6000,VW+4000,12000);c.restore();
}
function shard(c,x,y,t,glow){
 c.save();const sy=SY(y+60)+Math.sin(t*2+x*.01)*4;
 c.globalAlpha=.25+glow*.5;c.fillStyle='#d6b0ff';c.beginPath();c.arc(x,sy,16+glow*14,0,Math.PI*2);c.fill();
 c.globalAlpha=1;fill(c,'#6a4a8a',[[x,sy-22],[x+10,sy],[x,sy+22],[x-10,sy]]);fill(c,'#c8b0f0',[[x,sy-18],[x+6,sy],[x,sy+4]]);
 c.restore();
}
function bellRings(c,x,y,t0,t,accent){
 const k=t-t0;if(k<0||k>1.6)return;c.save();c.strokeStyle=accent;
 for(let i=0;i<3;i++){const r=(k-i*.18)*700;if(r<=0)continue;c.globalAlpha=Math.max(0,.6-(k-i*.18)/1.6*.6);c.lineWidth=3;c.beginPath();c.arc(x,SY(y+60),r,0,Math.PI*2);c.stroke();}
 c.restore();
}
function speedLines(c,x,y,dir,t,col='#ffffff',n=7,len=90){
 c.save();for(let i=0;i<n;i++){const k=((t*5+i*.37)%1);c.globalAlpha=(1-k)*.55;box(c,col,x-dir*(20+k*len)-(dir<0?len*.4:0),SY(y+8+i*6)+Math.sin(i*3)*3,len*.4,1);}c.restore();
}
function ceilingBand(c,f,t){
 // The neighbours' ceiling: a run of upside-down floor, dripping, over him.
 const y=SY(f.ceil);c.save();
 for(let x=Math.floor((f.x-700)/40)*40;x<=f.x+700;x+=40){box(c,'#3a2c52',x,y-14,40,14);box(c,'#5a4a7a',x,y-2,40,2);box(c,'#2a2040',x+38,y-14,2,14);
  if((x/40)%3===0)box(c,'#c9a0ff',x+12,y+((t*30+x)%26),2,3);}
 c.restore();
}
function bellAnchor(c,x,y,accent,t){
 const sy=SY(y);c.save();box(c,'#3a2c22',x-26,sy-8,52,6);box(c,'#5a4434',x-24,sy-8,48,2);
 fill(c,'#8a7aa0',[[x-9,sy-2],[x+9,sy-2],[x+12,sy+16],[x-12,sy+16]]);box(c,accent,x-2,sy+16,4,4);c.restore();
}
function ropeLine(c,x0,y0,x1,y1,b1,b2,col,w){
 // A rope is never a ruled line (7.350: the owner still saw straight lines). It is drawn as a cubic whose two
 // inner points stand off the straight line by b1 (a third of the way down) and b2 (two thirds): the same sign
 // bends it into a bow, opposite signs into an S.
 const dx=x1-x0,dy=y1-y0,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
 c.save();c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(x0,SY(y0));
 c.bezierCurveTo(x0+dx/3+nx*b1,SY(y0+dy/3+ny*b1),x0+dx*2/3+nx*b2,SY(y0+dy*2/3+ny*b2),x1,SY(y1));c.stroke();c.restore();
}
// Which way a rope's normal (as ropeLine takes it) points against a horizontal motion: +1 or -1.
const against=(x0,y0,x1,y1,dir)=>{const dy=y1-y0,len=Math.hypot(x1-x0,dy)||1;return -dy/len*dir>0?-1:1;};
function swingRopes(c,f,t){
 // Every bell within reach and its rope: the one he holds runs to his hands and bows with the swing; the ones he
 // has let go swing back and settle; the ones ahead hang and sway, waiting.
 const accent=mount()?.accent||'#b8c0d8',q=swingAt(f,f.u),P=f.pieces;
 f.ropes.forEach((r,j)=>{
  if(Math.abs(r.ax-f.x)>1500)return;
  bellAnchor(c,r.ax,r.ay,accent,t);
  if(q.rope===j){
   // Held: it trails the swing, bowed back against the way he is going, most where it is fastest (the bottom).
   const s=against(r.ax,r.ay,q.hx,q.hy,f.dir),bend=s*(16+46*q.w);
   ropeLine(c,r.ax,r.ay-16,q.hx,q.hy,bend*.75,bend,'#d8c8a0',2.4);return;}
  const relU=P.find(p=>p.type==='swing'&&p.j===j).u1,since=(f.u-relU)*f.dur;
  const angAt=s=>s>0?r.th*Math.exp(-1.6*s)*Math.cos(5.2*s)*f.dir:Math.sin(t*1.3+j)*.05;
  const ang=angAt(since),vel=(angAt(since+.03)-ang)/.03;
  const ex=r.ax+Math.sin(ang)*r.L,ey=r.ay-Math.cos(ang)*r.L;
  // Let go, it whips back and settles, bending against its own swing; waiting, it hangs in a lazy S.
  const whip=since>0?Math.max(-60,Math.min(60,-vel*14)):0,lazy=Math.sin(t*1.7+j*2)*20;
  ropeLine(c,r.ax,r.ay-16,ex,ey,whip*.7+lazy,whip-lazy,'#b8a888',2);
  box(c,'#6a5444',ex-2,SY(ey)-2,4,6);   // the knot at its end
 });
}
function cageArt(c,x,y,a,front){
 // The jailers' cage: a floor, bars, a ring and its chain up to the rail. (x, y): its floor.
 c.save();c.translate(Math.round(x),Math.round(SY(y)));c.rotate(a);
 if(!front){box(c,'#2a2a30',-22,-2,44,4);box(c,'#3a3a44',-24,-62,48,4);}
 else{for(let i=-20;i<=20;i+=8)box(c,'#4a4a56',i-1,-60,2,58);box(c,'#5a5a66',-24,-62,48,3);box(c,'#3a3a44',-22,-2,44,3);}
 c.restore();
}
function railTrack(c,f,t){
 const y=SY(f.rail);c.save();box(c,'#2e3434',f.x-1200,y-6,2400,6);box(c,'#4a5654',f.x-1200,y-6,2400,2);
 for(let x=Math.floor((f.x-1200)/160)*160;x<=f.x+1200;x+=160){box(c,'#2e3434',x-3,y,6,18);}
 c.restore();
}
// ---- the level select's gallery (7.345) -------------------------------------------------------------------
// A small looping scene of one region's shortcut on a card canvas (w×h pixels): its two roosts, the way between
// and the ride, drawn with the same art as the game. Card units are world units scaled by k, ground near the foot.
function knight(c,x,y,dir){
 at(c,x,y,dir);
 box(c,'#7a2a2a',-10,-31,6,22);box(c,'#2a2a34',-7,-44,14,14);box(c,'#c8ccd8',-6,-43,12,12);box(c,'#1a1a22',1,-39,5,2);
 box(c,'#9aa0b0',-6,-31,13,19);box(c,'#3a3a46',-6,-12,5,12);box(c,'#3a3a46',2,-12,5,12);box(c,'#e8e8f0',8,-36,2,20);box(c,'#8a7a5a',6,-17,6,2);
 c.restore();
}
function preview(c,stage,t,w,h){
 const m=MOUNTS[stage];if(!m||typeof GROUND_Y==='undefined')return false;
 const k=Math.min(w/420,h/240),gy=h-18,W=w/k,A=56,B=W-56,top=(gy-14)/k;
 c.save();c.beginPath();c.rect(0,0,w,h);c.clip();
 const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#10141e');sky.addColorStop(1,'#262c38');c.fillStyle=sky;c.fillRect(0,0,w,h);
 c.globalAlpha=.5;for(let i=0;i<18;i++){c.fillStyle='#d8e0f0';c.fillRect((i*97+stage*31)%w,(i*53+stage*17)%(gy*.6),1,1);}c.globalAlpha=1;
 c.fillStyle='#2a2622';c.fillRect(0,gy,w,h-gy);c.fillStyle=m.accent;c.globalAlpha=.35;c.fillRect(0,gy,w,2);c.globalAlpha=1;
 c.translate(0,gy);c.scale(k,k);c.translate(0,-GROUND_Y);
 const loop=3.6,ph=(t%loop)/loop,u=Math.min(1,Math.max(0,(ph-.12)/.76)),e=ease(u),dir=1;
 const label=(x,text,al)=>{c.save();c.translate(x,SY(-6));c.scale(1/k,1/k);c.font='600 11px system-ui,sans-serif';c.textAlign=al;c.fillStyle='#c8c0b0';c.fillText(text,0,12);c.restore();};
 const dash=pts=>{c.save();c.setLineDash([6,7]);c.strokeStyle=m.accent;c.globalAlpha=.55;c.lineWidth=2;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,SY(y)):c.moveTo(x,SY(y)));c.stroke();c.restore();};
 if(m.kind==='blink'){
  doorArt(c,A,0,1,t,m.art,m.accent,u>0&&u<.4?Math.sin(Math.PI*u/.4):0);doorArt(c,B,0,1,t,m.art,m.accent,u>.55&&u<.95?Math.sin(Math.PI*(u-.55)/.4):0);
  dash([[A+30,90],[(A+B)/2,140],[B-30,90]]);
  if(u<.32)knight(c,A-50+Math.min(1,u/.28)*50,0,1);else if(u>.62)knight(c,B+Math.min(1,(u-.62)/.3)*46,0,1);
  const a=u<.35?Math.max(0,(u-.22)/.13):u<.6?1:Math.max(0,1-(u-.6)/.12);
  if(a>0){c.save();c.globalAlpha=a*.85;c.fillStyle='#05040a';c.fillRect(-50,SY(top+40),W+100,top+80);c.restore();}
 }else if(PATHED.has(m.kind)){
  // The same paths as the game's (trace), on a made-up road: a gentle rise for the sled, a long flat line otherwise.
  const f={mode:m.kind,from:{x:A,y:0},land:{x:B,y:0},dir:1,y0:m.kind==='launch'?30:0,y1:0,u,
   H:Math.min(top*.62,(B-A)*.5),cruise:Math.min(m.cruise||200,top*.55),
   prof:Array.from({length:41},(_,i)=>m.kind==='ground'?Math.sin(i/40*Math.PI)*46+Math.sin(i*.8)*5:m.kind==='rail'?Math.sin(i/40*Math.PI)*16:0),
   hops:[0,1,2,3].map(i=>({x:A+(B-A)*i/3,y:0})),rail:top-14,hang:100};
  if(m.kind==='swing'){Object.assign(f,swingPlan({x:A,y:0},{x:B,y:0},1,()=>0,Math.min(84,top-140),.9,60,700));f.dur=2.5;}
  const riding=u>0&&u<1,q=trace(f,u);Object.assign(f,{x:q.x,y:q.y,a:q.a||0,flip:!!q.flip,ceil:q.ceil});
  const pose=(x,y,rot,flip)=>{c.save();c.translate(x,SY(y+22));if(rot)c.rotate(rot);if(flip)c.scale(1,-1);c.translate(-x,-SY(y+22));knight(c,x,y,1);c.restore();};
  switch(m.kind){
   case 'launch':ballista(c,A,0,1,t,!riding);ballista(c,B,0,-1,t,true);
    if(riding){c.save();c.translate(q.x,SY(q.y-4));bolt(c,-q.a);c.restore();speedLines(c,q.x,q.y-6,1,t,'#e8dcc0',4,60);pose(q.x,q.y,-q.a*.8);}else knight(c,u<=0?A-40:B+30,0,1);break;
   case 'throw':automaton(c,A,0,1,t,u<.25?1:0);
    if(riding){speedLines(c,q.x,q.y+10,1,t,'#ffe0b0',6,90);pose(q.x,q.y,ease(u)*Math.PI*4);}else knight(c,u<=0?A+30:B,0,1);break;
   case 'ground':post(c,A,0,m.accent,false);post(c,B,0,m.accent,false);sledTeam(c,q.x,q.y,1,t,riding,q.a);pose(q.x,q.y+8,-q.a);break;
   case 'rail':doorArt(c,A,0,1,t,'cart',m.accent,0);doorArt(c,B,0,1,t,'cart',m.accent,0);
    if(riding){rails(c,f,t);knight(c,q.x,q.y+10,1);cartBody(c,q.x,q.y,1,t,q.a);
     const g=c.createRadialGradient(q.x,SY(q.y+20),30,q.x,SY(q.y+20),260);g.addColorStop(0,'rgba(8,4,2,0)');g.addColorStop(1,'rgba(8,4,2,.88)');
     c.save();c.globalAlpha=Math.min(1,u/.08,(1-u)/.08);c.fillStyle=g;c.fillRect(-50,SY(top+40),W+100,top+80);c.restore();}
    else knight(c,u<=0?A-36:B+36,0,1);break;
   case 'slide':cairn(c,A,0,m.accent,t);cairn(c,B,0,m.accent,t);
    if(riding){iceRoad(c,f,t);const r=trace(f,Math.min(1,u+.05));fox(c,r.x,r.y,1,t,true);pose(q.x,q.y,.12);}else{fox(c,u<=0?A+44:B+44,0,1,t,false);knight(c,u<=0?A:B,0,1);}break;
   case 'ceiling':doorArt(c,A,0,1,t,'hatch',m.accent,0);doorArt(c,B,0,1,t,'hatch',m.accent,0);
    if(riding){if(u>.04&&u<.96)ceilingBand(c,f,t);pose(q.x,q.y,0,q.flip);}else knight(c,u<=0?A+30:B+30,0,1);break;
   case 'rift':doorArt(c,A,0,1,t,'mirror',m.accent,0);doorArt(c,B,0,1,t,'mirror',m.accent,0);for(const h of f.hops)shard(c,h.x,h.y,t,0);
    if(riding&&q.hidden){const Ah=f.hops[q.seg],Bh=f.hops[q.seg+1],e=ease(Math.min(1,Math.max(0,(q.k-.22)/.56)));
     c.save();c.strokeStyle='#e8d8ff';c.lineWidth=6;c.lineCap='round';c.beginPath();c.moveTo(Ah.x+(Bh.x-Ah.x)*Math.max(0,e-.25),SY(40));c.lineTo(Ah.x+(Bh.x-Ah.x)*e,SY(40));c.stroke();c.restore();}
    else knight(c,riding?q.x:u<=0?A+30:B+30,0,1);break;
   case 'swing':post(c,A-37,0,m.accent,true);post(c,B-37,0,m.accent,true);
    if(riding){f.u=u;swingRopes(c,f,t);pose(q.x,q.y,-(q.a||0));}
    else{f.u=u<=0?0:1;swingRopes(c,f,t);knight(c,u<=0?A+20:B-20,0,1);}break;
   case 'cage':post(c,A-60,0,m.accent,true);post(c,B-60,0,m.accent,true);
    {const y=SY(f.rail);box(c,'#2e3434',-50,y-6,W+100,6);box(c,'#4a5654',-50,y-6,W+100,2);for(let x=0;x<W;x+=120)box(c,'#2e3434',x-3,y,6,14);}
    {const cx=riding?q.x:u<=0?A:B,cy=riding?q.y:0,a=riding?q.a:0;c.save();c.strokeStyle='#5a6060';c.lineWidth=2;c.beginPath();c.moveTo(cx,SY(f.rail));c.lineTo(cx,SY(cy+62));c.stroke();c.restore();
     cageArt(c,cx,cy,a,false);pose(cx,cy,-a);cageArt(c,cx,cy,a,true);}break;
   case 'sprint':doorArt(c,A,0,1,t,'bell',m.accent,0);doorArt(c,B,0,1,t,'bell',m.accent,0);
    if(riding){bellRings(c,A,0,0,u*2.2,m.accent);speedLines(c,q.x,q.y,1,t,'#c9b8ff',9,110);knight(c,q.x,q.y,1);}else knight(c,u<=0?A+30:B+30,0,1);break;
  }
 }else if(m.kind==='zip'){
  post(c,A-37,0,m.accent,true);post(c,B-37,0,m.accent,true);
  const y0=110,yAt=v=>y0-Math.sin(Math.PI*v)*40;
  c.save();c.strokeStyle='#c8b890';c.lineWidth=1.5;c.beginPath();for(let i=0;i<=30;i++){const v=i/30;i?c.lineTo(A+(B-A)*v,SY(yAt(v))):c.moveTo(A,SY(yAt(0)));}c.stroke();c.restore();
  const x=A+(B-A)*e,y=yAt(e);box(c,'#5a4a3a',x-6,SY(y)-4,12,8);c.save();c.strokeStyle='#8a7a5a';c.beginPath();c.moveTo(x,SY(y)+4);c.lineTo(x,SY(y)+16);c.stroke();c.restore();
  knight(c,x-4,y-56,1);
 }else{
  const ground=m.seat>=0?26:70,cruise=Math.min(m.cruise||300,top*.42),lift=v=>ease(Math.min(1,v/.12))*ease(Math.min(1,(1-v)/.15));
  const yAt=v=>ground+cruise*lift(v)+Math.sin(t*3.1)*6*lift(v);
  if(m.art!=='cloak'&&m.art!=='throw'){post(c,A,0,m.accent,false);post(c,B,0,m.accent,false);}
  const path=[];for(let i=0;i<=30;i++){const v=i/30;path.push([A+(B-A)*ease(v),yAt(v)+(m.seat<0?m.seat:0)]);}dash(path);
  const x=A+(B-A)*e,y=yAt(u),flying=u>0&&u<1,seat=m.seat||0;
  switch(m.art){
   case 'drake':case 'rime':{const P=m.art==='rime'?RIME:BRONZE;drake(c,x,y,dir,t,flying?'fly':'perch',P);knight(c,x-4,y+seat,dir);
    if(flying){c.save();c.translate(Math.round(x),Math.round(SY(y)));wing(c,.35+Math.sin(t*9)*.75,true,P);c.restore();}break;}
   case 'moths':moths(c,x,y,t,22,30,false);knight(c,x-4,y+seat,dir);moths(c,x,y-30,t,8,34,false);break;
   case 'kite':kite(c,x,y,dir,t,flying);knight(c,x-4,y+seat,dir);c.save();c.strokeStyle='#d8c890';c.lineWidth=1;c.beginPath();c.moveTo(x,SY(y-28));c.lineTo(x,SY(y+seat+40));c.stroke();c.restore();break;
   case 'sled':sled(c,x,y,dir,t,flying);knight(c,x-4,y+6,dir);break;
   case 'skiff':skiff(c,x,y,dir,t,flying);knight(c,x-12,y+9,dir);break;
   case 'rocket':rocket(c,x,y,dir,t,flying);knight(c,x-6,y+5,dir);break;
   case 'crane':crane(c,x,y,dir,t,flying);knight(c,x+4,y+6,dir);break;
   case 'cloak':knight(c,x,y,dir);cloakWings(c,x,y+44,dir,t,flying);break;
   case 'seed':seed(c,x,y,t);knight(c,x-4,y+seat,dir);break;
   case 'throw':automaton(c,A,0,dir,t,u<.15?u/.15:0);if(flying)comet(c,x,y,dir,t);knight(c,x,y,dir);break;
  }
 }
 c.restore();
 // Labels in card pixels: where it starts and where it sets you down.
 c.save();c.font='600 11px system-ui,sans-serif';c.fillStyle='#d8d0c0';c.textBaseline='bottom';
 const [r0,r1]=m.roosts;c.textAlign='left';c.fillText(r0.label,6,h-3);c.textAlign='right';c.fillText('⇄ '+r1.label,w-6,h-3);c.restore();
 return true;
}
root.BladefallMounts=Object.freeze({MOUNTS,install,interactable,prompt,interact,update,drawRoost,drawUnder,drawOver,
 flying:()=>!!(G?.mountFlight?.kind==='ride'),roosts:()=>G?.mountRoosts||null,missing,preview,heroPose,heroAlpha,
 perch:()=>G?.mountRoosts?perchOf(mount()):null,reached:()=>!!(G&&store().reached[G.stageIndex]),
 testMode:()=>testOn,setTestMode});
})(typeof window!=='undefined'?window:globalThis);
