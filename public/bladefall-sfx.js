/* (7.366) Recorded sound effects and ambient loops, shared by Explore (index.html) and Ascend (pcore view).
   Clips live in audio/sfx/ and audio/sfx/amb/<bed>.mp3 (20 s seamless loops). Each host says whether sound is on and how
   loud: BladefallSfx.configure({enabled,volume}). play() returns false when it has no clip for a name, so a host keeps
   its synthesized sound as the fallback.
   (7.367) Every sound has three versions: A = name.mp3 (or name-1…n.mp3, takes that alternate), B = name.b.mp3,
   C = name.c.mp3. The Sound mixer (openMixer, in both settings menus) picks a version and a volume per sound and per
   ambient bed. Choices are kept on this device (localStorage) and can be exported as JSON; pasting an export into
   DEFAULT_MIX below makes it the game's default for everyone. */
(function(root){
'use strict';
const BASE='./audio/sfx/',KEY='bladefall.sfx.mix.v1';
// version A: name → number of takes on disk (1 = name.mp3; more = name-1.mp3 … name-n.mp3)
const BANK=Object.freeze({bell:1,bolt:1,'boss-fall':1,'boss-roar':1,campfire:1,chain:1,chest:1,coin:1,coins:1,crumble:1,dash:1,death:1,door:1,
 'enemy-alert':1,'enemy-arrow':1,'enemy-die':2,'enemy-shot':1,fanfare:1,gate:1,gem:1,grab:1,gust:1,heal:1,'hit-armor':2,'hit-flesh':1,hurt:1,jump:2,key:1,
 'land-hard':1,'land-soft':2,lantern:1,lever:1,magic:1,pack:1,page:1,parry:1,plate:1,pod:1,portal:1,powerup:1,quest:1,rune:1,shatter:1,
 splash:1,spring:1,'step-dirt':3,'step-metal':3,'step-snow':3,'step-stone':2,'step-wood':3,'stone-hit':1,swing:2,switch:1,turret:1,'ui-move':1,
 'ui-open':1,'ui-select':1,walljump:1,wallslide:1,zip:1,
 'ride-drake':1,'ride-moths':1,'ride-zip':1,'ride-kite':1,'ride-bolt':1,'ride-rope':1,'ride-cage':1,'ride-sled':1,'ride-ice':1,'ride-cart':1,'ride-throw':1,'ride-ceiling':1,'ride-mirror':1,'ride-sprint':1,'ride-skiff':1,'ride-rocket':1,'ride-crane':1,'ride-cloak':1,'ride-seed':1,'mount-drake':1,'mount-ballista':1,'mount-rocket':1,'mount-latch':1,'mount-dogs':1,'mount-lift':1,
 // (7.373) enemy and boss voices, the knight's effort sounds (alternating takes), work, weather, places, menus
 'vo-imp-alert':1,'vo-imp-hurt':1,'vo-imp-die':1,'vo-soldier-alert':1,'vo-soldier-hurt':1,'vo-soldier-die':1,'vo-hulk-alert':1,'vo-hulk-hurt':1,'vo-hulk-die':1,'vo-wing-alert':1,'vo-wing-hurt':1,'vo-wing-die':1,'vo-crawl-alert':1,'vo-crawl-hurt':1,'vo-crawl-die':1,'vo-spirit-alert':1,'vo-spirit-hurt':1,'vo-spirit-die':1,'vo-hound-alert':1,'vo-hound-hurt':1,'vo-hound-die':1,'boss-brute-roar':1,'boss-brute-hurt':1,'boss-brute-die':1,'boss-warden-roar':1,'boss-warden-hurt':1,'boss-warden-die':1,'boss-archer-roar':1,'boss-archer-hurt':1,'boss-archer-die':1,'boss-sorcerer-roar':1,'boss-sorcerer-hurt':1,'boss-sorcerer-die':1,'boss-colossus-roar':1,'boss-colossus-hurt':1,'boss-colossus-die':1,'boss-tyrant-roar':1,'boss-tyrant-hurt':1,'boss-tyrant-die':1,'boss-king-roar':1,'boss-king-hurt':1,'boss-king-die':1,'boss-hydra-roar':1,'boss-hydra-hurt':1,'boss-hydra-die':1,'kn-jump':6,'kn-jump2':6,'kn-land':6,'kn-hurt':6,'kn-death':2,'kn-dash':6,'kn-strike':6,'kn-climb':6,'work-whetstone':1,'work-pencil':1,'work-cloth':1,'work-whittle':1,'work-ladle':1,'work-tick':1,'work-shake':1,'work-slosh':1,'work-gulp':1,'work-rag':1,'work-hammer':1,'work-sweep':1,'work-saw':1,'work-chain':1,'work-rope':1,'work-scrub':1,'work-pages':1,'work-tinker':1,'wx-rain':1,'wx-storm':1,'wx-blizzard':1,'wx-thunder':1,'spot-waterfall':1,'spot-stream':1,'spot-pot':1,'spot-fire':1,'spot-forge':1,'spot-crowd':1,'spot-chimes':1,'spot-lava':1,'spot-clock':1,'ui-map':1,'ui-bag':1,'ui-pause':1,'ui-back':1,'ui-world':1});
// relative loudness of each clip (they are all peak-normalised on disk)
const LEVEL=Object.freeze({'step-dirt':.32,'step-stone':.3,'step-wood':.32,'step-metal':.26,'step-snow':.34,jump:.4,'land-soft':.42,'land-hard':.6,
 dash:.5,walljump:.45,grab:.4,wallslide:.3,swing:.55,'hit-flesh':.45,'hit-armor':.55,parry:.6,'enemy-die':.5,hurt:.6,death:.7,bolt:.5,'enemy-shot':.4,
 'enemy-arrow':.4,turret:.45,'enemy-alert':.35,magic:.45,'boss-roar':.8,'boss-fall':.8,coin:.45,coins:.5,gem:.45,key:.5,chest:.6,gate:.65,door:.55,lever:.55,plate:.45,
 switch:.45,crumble:.5,bell:.6,campfire:.5,heal:.5,powerup:.5,portal:.55,chain:.45,lantern:.5,page:.45,quest:.5,zip:.45,pod:.5,'stone-hit':.55,
 rune:.5,'ui-move':.25,'ui-select':.3,'ui-open':.35,splash:.55,spring:.5,pack:.35,fanfare:.55,shatter:.5,gust:.5,
 'ride-drake':.4,'ride-moths':.4,'ride-zip':.4,'ride-kite':.4,'ride-bolt':.4,'ride-rope':.4,'ride-cage':.4,'ride-sled':.4,'ride-ice':.4,'ride-cart':.4,'ride-throw':.4,'ride-ceiling':.4,'ride-mirror':.4,'ride-sprint':.4,'ride-skiff':.4,'ride-rocket':.4,'ride-crane':.4,'ride-cloak':.4,'ride-seed':.4,'mount-drake':.55,'mount-ballista':.55,'mount-rocket':.55,'mount-latch':.55,'mount-dogs':.55,'mount-lift':.55,
 'vo-imp-alert':0.35,'vo-imp-hurt':0.4,'vo-imp-die':0.45,'vo-soldier-alert':0.35,'vo-soldier-hurt':0.4,'vo-soldier-die':0.45,'vo-hulk-alert':0.35,'vo-hulk-hurt':0.4,'vo-hulk-die':0.45,'vo-wing-alert':0.35,'vo-wing-hurt':0.4,'vo-wing-die':0.45,'vo-crawl-alert':0.35,'vo-crawl-hurt':0.4,'vo-crawl-die':0.45,'vo-spirit-alert':0.35,'vo-spirit-hurt':0.4,'vo-spirit-die':0.45,'vo-hound-alert':0.35,'vo-hound-hurt':0.4,'vo-hound-die':0.45,'boss-brute-roar':0.75,'boss-brute-hurt':0.5,'boss-brute-die':0.8,'boss-warden-roar':0.75,'boss-warden-hurt':0.5,'boss-warden-die':0.8,'boss-archer-roar':0.75,'boss-archer-hurt':0.5,'boss-archer-die':0.8,'boss-sorcerer-roar':0.75,'boss-sorcerer-hurt':0.5,'boss-sorcerer-die':0.8,'boss-colossus-roar':0.75,'boss-colossus-hurt':0.5,'boss-colossus-die':0.8,'boss-tyrant-roar':0.75,'boss-tyrant-hurt':0.5,'boss-tyrant-die':0.8,'boss-king-roar':0.75,'boss-king-hurt':0.5,'boss-king-die':0.8,'boss-hydra-roar':0.75,'boss-hydra-hurt':0.5,'boss-hydra-die':0.8,'kn-jump':0.38,'kn-jump2':0.38,'kn-land':0.38,'kn-hurt':0.38,'kn-death':0.55,'kn-dash':0.38,'kn-strike':0.38,'kn-climb':0.38,'work-whetstone':0.32,'work-pencil':0.32,'work-cloth':0.32,'work-whittle':0.32,'work-ladle':0.32,'work-tick':0.32,'work-shake':0.32,'work-slosh':0.32,'work-gulp':0.32,'work-rag':0.32,'work-hammer':0.32,'work-sweep':0.32,'work-saw':0.32,'work-chain':0.32,'work-rope':0.32,'work-scrub':0.32,'work-pages':0.32,'work-tinker':0.32,'wx-rain':0.4,'wx-storm':0.4,'wx-blizzard':0.4,'wx-thunder':0.55,'spot-waterfall':0.45,'spot-stream':0.45,'spot-pot':0.45,'spot-fire':0.45,'spot-forge':0.45,'spot-crowd':0.45,'spot-chimes':0.45,'spot-lava':0.45,'spot-clock':0.45,'ui-map':0.3,'ui-bag':0.3,'ui-pause':0.3,'ui-back':0.3,'ui-world':0.4});
const BEDS=Object.freeze(['plains','forest','heights','cave','forge','snow','shore','hall','void','dungeon']);
// how loud each bed sits under the music by default (7.367: all quieter; the forest's insects much quieter)
const BEDLEVEL=Object.freeze({plains:.55,forest:.28,heights:.45,cave:.5,forge:.45,snow:.45,shore:.5,hall:.5,void:.4,dungeon:.4});
/* The official defaults. Paste an export from the Sound mixer here: {"sounds":{"jump":{"v":1,"vol":0.8}},"beds":{"forest":0.5}}.
   v is the version (0 = A, 1 = B, 2 = C); vol multiplies the sound (1 = as shipped). */
const DEFAULT_MIX=Object.freeze({sounds:{},beds:{}});
const GROUPS=[['Movement',['step-stone','step-dirt','step-wood','step-metal','step-snow','jump','land-soft','land-hard','dash','walljump','grab','wallslide','spring','splash','pack','zip']],
 ['Combat',['swing','bolt','hit-flesh','hit-armor','parry','hurt','death','enemy-alert','enemy-shot','enemy-arrow','turret','enemy-die','magic','boss-roar','boss-fall']],
 ['World',['coin','coins','gem','key','chest','gate','door','lever','plate','switch','crumble','stone-hit','pod','rune','bell','campfire','heal','powerup','portal','chain','lantern','page','quest','shatter','gust','fanfare']],
 ['Shortcuts (Explore rides)',['ride-drake','ride-moths','ride-zip','ride-kite','ride-bolt','ride-rope','ride-cage','ride-sled','ride-ice','ride-cart','ride-throw','ride-ceiling','ride-mirror','ride-sprint','ride-skiff','ride-rocket','ride-crane','ride-cloak','ride-seed','mount-drake','mount-ballista','mount-rocket','mount-latch','mount-dogs','mount-lift']],
 ['Knight (effort sounds)',['kn-jump','kn-jump2','kn-land','kn-hurt','kn-death','kn-dash','kn-strike','kn-climb']],
 ['Enemy voices',['vo-imp-alert','vo-imp-hurt','vo-imp-die','vo-soldier-alert','vo-soldier-hurt','vo-soldier-die','vo-hulk-alert','vo-hulk-hurt','vo-hulk-die','vo-wing-alert','vo-wing-hurt','vo-wing-die','vo-crawl-alert','vo-crawl-hurt','vo-crawl-die','vo-spirit-alert','vo-spirit-hurt','vo-spirit-die','vo-hound-alert','vo-hound-hurt','vo-hound-die']],
 ['Bosses',['boss-brute-roar','boss-brute-hurt','boss-brute-die','boss-warden-roar','boss-warden-hurt','boss-warden-die','boss-archer-roar','boss-archer-hurt','boss-archer-die','boss-sorcerer-roar','boss-sorcerer-hurt','boss-sorcerer-die','boss-colossus-roar','boss-colossus-hurt','boss-colossus-die','boss-tyrant-roar','boss-tyrant-hurt','boss-tyrant-die','boss-king-roar','boss-king-hurt','boss-king-die','boss-hydra-roar','boss-hydra-hurt','boss-hydra-die']],
 ['People at work',['work-whetstone','work-pencil','work-cloth','work-whittle','work-ladle','work-tick','work-shake','work-slosh','work-gulp','work-rag','work-hammer','work-sweep','work-saw','work-chain','work-rope','work-scrub','work-pages','work-tinker']],
 ['Weather',['wx-rain','wx-storm','wx-blizzard','wx-thunder']],
 ['Places (near you)',['spot-waterfall','spot-stream','spot-pot','spot-fire','spot-forge','spot-crowd','spot-chimes','spot-lava','spot-clock']],
 ['Menus',['ui-move','ui-select','ui-open','ui-map','ui-bag','ui-pause','ui-back','ui-world']]];
const LABEL={'step-stone':'Footsteps · stone','step-dirt':'Footsteps · dirt','step-wood':'Footsteps · wood','step-metal':'Footsteps · metal','step-snow':'Footsteps · snow',
 jump:'Jump','land-soft':'Landing','land-hard':'Hard landing',dash:'Dash',walljump:'Wall jump',grab:'Ledge grab',wallslide:'Wall slide',spring:'Spring / boost pad',
 splash:'Splash',pack:'Pack (jetpack)',zip:'Zip line',swing:'Sword swing',bolt:'Your bow',  'hit-flesh':'Hitting an enemy','hit-armor':'Hitting armour / shield',
 parry:'Parry',hurt:'You get hurt',death:'You fall',  'enemy-alert':'Enemy notices you','enemy-shot':'Enemy magic shot','enemy-arrow':'Enemy arrow',turret:'Trap / turret fires',
 'enemy-die':'Enemy defeated',magic:'Magic','boss-roar':'Boss roar','boss-fall':'Boss falls',coin:'Coin',coins:'Purchase',gem:'Crystal / shard',key:'Key',chest:'Chest',
 gate:'Stone gate',door:'Door',lever:'Lever',plate:'Pressure plate',switch:'Switch',crumble:'Crumbling ground','stone-hit':'Stone block',pod:'Seed pod',rune:'Rune / secret',
 bell:'Bell',campfire:'Checkpoint fire',heal:'Heal / revive',powerup:'Power-up / level up',portal:'Portal',chain:'Chain lift',lantern:'Lantern',page:'Notes and signs',
 quest:'Task done',shatter:'Lantern breaks',gust:'Wind gate',fanfare:'Victory','ui-move':'Menu tick','ui-select':'Menu confirm','ui-open':'Someone greets you',
 'ride-drake':'Bellwing in flight','ride-moths':'Moth swarm','ride-zip':'Chain trolley','ride-kite':'Kite','ride-bolt':'Riding the ballista bolt','ride-rope':'Bell-ropes','ride-cage':'Cage run','ride-sled':'Dog sled','ride-ice':'Winter Road slide','ride-cart':'Quota cart','ride-throw':'Automaton’s throw','ride-ceiling':'Ceiling Way','ride-mirror':'Mirror crossing','ride-sprint':'Last Alarm sprint','ride-skiff':'Sky skiff','ride-rocket':'Birthday rocket','ride-crane':'Paper crane','ride-cloak':'Feather cloak','ride-seed':'Moonflower drift','mount-drake':'Bellwing takes off','mount-ballista':'Ballista fires','mount-rocket':'Rocket lights','mount-latch':'Trolley / cage / cart latch','mount-dogs':'Sled dogs set off','mount-lift':'Lift-off',
 'vo-imp-alert':'Imps (grunts, emberlings, frostlings…) notices you','vo-imp-hurt':'Imps (grunts, emberlings, frostlings…) is hit','vo-imp-die':'Imps (grunts, emberlings, frostlings…) falls','vo-soldier-alert':'Soldiers notices you','vo-soldier-hurt':'Soldiers is hit','vo-soldier-die':'Soldiers falls','vo-hulk-alert':'Hulks notices you','vo-hulk-hurt':'Hulks is hit','vo-hulk-die':'Hulks falls','vo-wing-alert':'Fliers notices you','vo-wing-hurt':'Fliers is hit','vo-wing-die':'Fliers falls','vo-crawl-alert':'Crawlers notices you','vo-crawl-hurt':'Crawlers is hit','vo-crawl-die':'Crawlers falls','vo-spirit-alert':'Spirits and casters notices you','vo-spirit-hurt':'Spirits and casters is hit','vo-spirit-die':'Spirits and casters falls','vo-hound-alert':'Rift hounds notices you','vo-hound-hurt':'Rift hounds is hit','vo-hound-die':'Rift hounds falls','boss-brute-roar':'Brute roars','boss-brute-hurt':'Brute is hit','boss-brute-die':'Brute falls','boss-warden-roar':'Warden roars','boss-warden-hurt':'Warden is hit','boss-warden-die':'Warden falls','boss-archer-roar':'Hollow Marksman roars','boss-archer-hurt':'Hollow Marksman is hit','boss-archer-die':'Hollow Marksman falls','boss-sorcerer-roar':'Frost Sorcerer roars','boss-sorcerer-hurt':'Frost Sorcerer is hit','boss-sorcerer-die':'Frost Sorcerer falls','boss-colossus-roar':'Ember Colossus roars','boss-colossus-hurt':'Ember Colossus is hit','boss-colossus-die':'Ember Colossus falls','boss-tyrant-roar':'Void Tyrant roars','boss-tyrant-hurt':'Void Tyrant is hit','boss-tyrant-die':'Void Tyrant falls','boss-king-roar':'Abyss King roars','boss-king-hurt':'Abyss King is hit','boss-king-die':'Abyss King falls','boss-hydra-roar':'Hydra roars','boss-hydra-hurt':'Hydra is hit','boss-hydra-die':'Hydra falls','kn-jump':'Knight · jump','kn-jump2':'Knight · double jump','kn-land':'Knight · hard landing','kn-hurt':'Knight · hurt','kn-death':'Knight · falls','kn-dash':'Knight · dash','kn-strike':'Knight · heavy strike','kn-climb':'Knight · climb / ledge pull','work-whetstone':'Whetstone','work-pencil':'Pencil / chalk','work-cloth':'Cloth','work-whittle':'Whittling','work-ladle':'Ladle on pot','work-tick':'Clock ticking','work-shake':'Shaking a clock','work-slosh':'Sloshing resin / water','work-gulp':'A drink','work-rag':'Polishing','work-hammer':'Hammer','work-sweep':'Broom','work-saw':'Saw','work-chain':'Chain links','work-rope':'Rope','work-scrub':'Scrubbing','work-pages':'Pages','work-tinker':'Tinkering','wx-rain':'Rain','wx-storm':'Storm wind and rain','wx-blizzard':'Blizzard','wx-thunder':'Thunder','spot-waterfall':'Waterfall','spot-stream':'Stream','spot-pot':'Bubbling pot','spot-fire':'Campfire crackle','spot-forge':'Forge','spot-crowd':'Camp murmur','spot-chimes':'Wind chimes','spot-lava':'Lava','spot-clock':'Clockwork','ui-map':'Map opens','ui-bag':'Bag opens','ui-pause':'Pause','ui-back':'Back / close','ui-world':'World / level chosen'};
const BEDLABEL={plains:'Open fields',forest:'Black Woods (night insects)',heights:'High wind',cave:'Caves',forge:'Fire and lava',snow:'Snow wind',shore:'Shore waves',
 hall:'Palace halls',void:'Fractured / void',dungeon:'Dungeon'};
let mix=load();
function load(){let m=null;try{m=JSON.parse(root.localStorage?.getItem(KEY)||'null');}catch(_e){}return {sounds:{...DEFAULT_MIX.sounds,...(m?.sounds||{})},beds:{...DEFAULT_MIX.beds,...(m?.beds||{})}};}
function save(){try{root.localStorage?.setItem(KEY,JSON.stringify(mix));}catch(_e){}}
// (7.372) how many versions a sound has (A, B, C; the dash also D (7.372.1: D was the favourite and is now A; D holds the take that was A))
const NVER={dash:4},nver=n=>NVER[n]||3;
const pick=name=>Math.max(0,Math.min(nver(name)-1,mix.sounds[name]?.v|0)),vol=name=>mix.sounds[name]?.vol??1,bedVol=b=>mix.beds[b]??1;
let ctx=null,out=null,bedBus=null,settings={enabled:()=>true,volume:()=>.8,ambience:()=>true,ambienceVolume:()=>.5};
const buffers=new Map(),pending=new Map(),turn=new Map(),lastAt=new Map();
let bed=null,preloaded=false;   // bed: {name,src,gain}
function ac(){
 if(ctx)return ctx;const AC=root.AudioContext||root.webkitAudioContext;if(!AC)return null;
 try{ctx=new AC();out=ctx.createGain();out.connect(ctx.destination);bedBus=ctx.createGain();bedBus.connect(ctx.destination);}catch(_e){ctx=null;}
 return ctx;
}
function ramp(param,v,tc){try{if(param.setTargetAtTime)param.setTargetAtTime(v,ctx.currentTime,tc);else param.value=v;}catch(_e){try{param.value=v;}catch(_e2){}}}
// (7.367) the first touch or key wakes the audio and decodes every chosen clip, so no sound is silent on its first use
function wake(){const a=ac();if(a&&a.state!=='running')a.resume().catch(()=>{});if(a&&!preloaded){preloaded=true;preload();}}
if(typeof document!=='undefined')for(const t of ['pointerdown','touchend','keydown'])document.addEventListener(t,wake,{capture:true,passive:true});
function paths(name,v=pick(name)){return v?[BASE+name+'.'+'abcd'[v]+'.mp3']:Array.from({length:BANK[name]},(_,i)=>BASE+name+(BANK[name]>1?'-'+(i+1):'')+'.mp3');}
function fetchBuffer(path){
 if(buffers.has(path))return Promise.resolve(buffers.get(path));if(pending.has(path))return pending.get(path);
 const a=ac();if(!a||!root.fetch)return Promise.resolve(null);
 const p=root.fetch(path).then(r=>r.ok?r.arrayBuffer():null).then(b=>b?new Promise((res,rej)=>a.decodeAudioData(b,res,rej)):null)
  .then(buf=>{buffers.set(path,buf);pending.delete(path);return buf;}).catch(()=>{buffers.set(path,null);pending.delete(path);return null;});
 pending.set(path,p);return p;
}
// (7.373) long loops (rides, weather, places) load when first used, not with every clip on the first touch
const LONG=n=>/^(ride-|spot-)/.test(n)||n==='wx-rain'||n==='wx-storm'||n==='wx-blizzard';
function preload(names){for(const n of names||Object.keys(BANK).filter(n=>!LONG(n)))for(const p of paths(n))fetchBuffer(p);}
function has(name){return !!BANK[name];}
function on(){try{return settings.enabled()!==false;}catch(_e){return true;}}
function start(buf,name,opts){
 const a=ctx;let master=1;try{master=+settings.volume();}catch(_e){}
 try{
  const g=a.createGain();g.gain.value=Math.max(0,Math.min(2,(LEVEL[name]??.5)*(opts.gain??1)*vol(name)*(opts.raw?1:master)));
  const s=a.createBufferSource();s.buffer=buf;const spread=opts.detune??.05;s.playbackRate.value=(opts.rate||1)*(1+(Math.random()*2-1)*spread);
  let node=s;
  if(opts.pan&&a.createStereoPanner){const p=a.createStereoPanner();p.pan.value=Math.max(-1,Math.min(1,opts.pan));node.connect(p);node=p;}
  node.connect(g);g.connect(out);s.start();return true;
 }catch(_e){return false;}   // an audio graph without these features: the host's own sound plays instead
}
/* opts: gain (×LEVEL), rate, pan (-1…1), detune (random ± rate spread), gap (min ms between repeats of this name) */
function play(name,opts={}){
 if(!BANK[name])return false;if(!on())return true;if(vol(name)<=0)return true;
 const a=ac();if(!a)return false;if(a.state!=='running')a.resume().catch(()=>{});
 // (7.368) wall-clock gap: the audio clock stops while the context is suspended, and every later play looked like a repeat
 const now=root.performance?root.performance.now():Date.now(),gap=opts.gap??35;if(now-(lastAt.get(name)??-1e9)<gap)return true;lastAt.set(name,now);
 const list=paths(name),i=(turn.get(name)||0)%list.length;turn.set(name,i+1);
 const path=list[i],buf=buffers.get(path);
 if(buf===undefined){fetchBuffer(path).then(b=>{if(b)start(b,name,opts);});return true;}   // first use: plays as soon as it decodes
 if(!buf)return false;
 return start(buf,name,opts);
}
/* (7.370) A looping sound for as long as something lasts (a shortcut ride): loop(name) starts it and returns a stop(fade)
   function. It follows the sound's mixer version and volume like play().
   (7.373) stop.set(gain, pan) changes its loudness while it runs (a waterfall as you walk past); opts.random starts it at
   a random point so two of the same loop don't play in step. */
function loop(name,opts={}){
 const none=()=>{};none.set=()=>{};if(!BANK[name]||!on()||vol(name)<=0)return none;const a=ac();if(!a)return none;if(a.state!=='running')a.resume().catch(()=>{});
 let src=null,g=null,pn=null,stopped=false,want=opts.gain??1,pan=opts.pan||0;const path=paths(name)[0];
 const level=()=>{let master=1;try{master=+settings.volume();}catch(_e){}return Math.max(0,Math.min(2,(LEVEL[name]??.4)*want*vol(name)*master*(on()?1:0)));};
 fetchBuffer(path).then(buf=>{if(!buf||stopped)return;try{
  g=a.createGain();g.gain.value=0;g.connect(out);src=a.createBufferSource();src.buffer=buf;src.loop=true;
  if(a.createStereoPanner){pn=a.createStereoPanner();pn.pan.value=pan;src.connect(pn);pn.connect(g);}else src.connect(g);
  src.start(0,opts.random?Math.random()*buf.duration:0);ramp(g.gain,level(),.15);}catch(_e){}});
 const stop=(fade=.5)=>{stopped=true;if(g)ramp(g.gain,0,fade/3);const s=src;setTimeout(()=>{try{s?.stop();}catch(_e){}},fade*1000+200);};
 stop.set=(gain,p)=>{if(stopped)return;want=gain;if(p!=null)pan=Math.max(-1,Math.min(1,p));if(g)ramp(g.gain,level(),.12);if(pn)ramp(pn.pan,pan,.12);};
 return stop;
}
/* Ambient bed: one 20 s loop at a time, crossfaded. ambience(null) fades it out. */
function bedTarget(name,gain=1){let level=.5;try{level=+settings.ambienceVolume()*(settings.ambience()!==false&&on()?1:0);}catch(_e){}return Math.max(0,Math.min(1,level*gain*(BEDLEVEL[name]??.5)*bedVol(name)));}
function ambience(name,opts={}){
 const want=name&&BEDS.includes(name)?name:null,a=ac();if(!a)return;
 const target=bedTarget(want,opts.gain??1);
 if(bed&&bed.name===want){ramp(bed.gain.gain,target,.4);return;}
 if(bed){const old=bed;ramp(old.gain.gain,0,.6);setTimeout(()=>{try{old.src?.stop();}catch(_e){}},3000);bed=null;}
 if(!want)return;
 const path=BASE+'amb/'+want+'.mp3';try{bed={name:want,src:null,gain:a.createGain()};bed.gain.gain.value=0;bed.gain.connect(bedBus);}catch(_e){bed=null;return;}
 const mine=bed;fetchBuffer(path).then(buf=>{if(!buf||bed!==mine)return;try{const s=a.createBufferSource();s.buffer=buf;s.loop=true;s.connect(mine.gain);
  s.start(0,Math.random()*Math.max(0,buf.duration-1));mine.src=s;ramp(mine.gain.gain,bedTarget(want,opts.gain??1),.8);}catch(_e){}});
}
function refresh(){if(bed)ambience(bed.name);}
function configure(next){settings={...settings,...next};refresh();}
function state(){return {context:ctx?.state||'none',bed:bed?.name||null,loaded:[...buffers.keys()].filter(k=>buffers.get(k)).length};}
// Explore stage themes and Ascend world keys → the bed and the ground underfoot. (7.367) No ticking machinery bed:
// the Causeway gets wind, the Deep Line the cave.
const THEME={plains:['plains','dirt'],forest:['forest','dirt'],badlands:['heights','stone'],canyon:['heights','stone'],ruins:['hall','stone'],
 dungeon:['dungeon','stone'],frost:['snow','snow'],volcano:['forge','stone'],void:['void','stone'],apex:['void','stone'],storm:['heights','stone'],
 shore:['shore','dirt'],colony:['cave','dirt'],path:['plains','dirt'],sunspire:['hall','stone'],fractured:['void','stone']};
const STAGE={15:['cave','wood']};   // Explore stage index → its own bed when the theme is shared (the Deep Line is "badlands")
const WORLD={outskirts:['plains','dirt'],woods:['forest','dirt'],causeway:['heights','wood'],updrafts:['heights','stone'],marksman:['heights','stone'],
 keep:['hall','stone'],gaol:['dungeon','stone'],frostfell:['snow','snow'],sorcerer:['snow','snow'],emberdeep:['forge','stone'],colossus:['forge','metal'],
 inversion:['void','stone'],tyrant:['void','stone'],king:['void','stone'],deepline:['cave','wood'],cliffs:['heights','stone'],shores:['shore','dirt'],
 colony:['cave','dirt'],path:['plains','dirt'],sunspire:['hall','stone']};
function forTheme(theme,stage){return STAGE[stage]||THEME[theme]||['plains','stone'];}
function forWorld(key){if(!key)return ['plains','stone'];const base=String(key).replace(/^f-/,'');const r=WORLD[base]||['plains','stone'];return /^f-/.test(key)?['void',r[1]]:r;}

/* ---- Sound mixer: a version and a volume for every sound and ambient bed, export / import as JSON ---- */
function exportMix(){const o={sounds:{},beds:{}};for(const [k,s] of Object.entries(mix.sounds))if((s.v|0)||(s.vol??1)!==1)o.sounds[k]={v:s.v|0,vol:+(s.vol??1).toFixed(2)};
 for(const [k,v] of Object.entries(mix.beds))if(v!==1)o.beds[k]=+v.toFixed(2);return JSON.stringify(o);}
function importMix(text){const o=JSON.parse(text);if(!o||typeof o!=='object')throw Error('Not a sound mix.');mix={sounds:{...(o.sounds||{})},beds:{...(o.beds||{})}};save();refresh();preload();}
function resetMix(){mix={sounds:{...DEFAULT_MIX.sounds},beds:{...DEFAULT_MIX.beds}};save();refresh();}
function test(name){wake();const a=ac();if(!a)return;const p=paths(name),path=p[Math.floor(Math.random()*p.length)];fetchBuffer(path).then(b=>{if(b)start(b,name,{raw:false,detune:0});});}
let bedTest=null;
function testBed(b){wake();const a=ac();if(!a)return;try{bedTest?.stop();}catch(_e){}if(bedTest?._bed===b){bedTest=null;return;}
 fetchBuffer(BASE+'amb/'+b+'.mp3').then(buf=>{if(!buf)return;const s=a.createBufferSource(),g=a.createGain();s.buffer=buf;g.gain.value=bedTarget(b)||.3*(BEDLEVEL[b]??.5);s.connect(g).connect(a.destination);s.start();s._bed=b;bedTest=s;setTimeout(()=>{try{s.stop();}catch(_e){}},8000);});}
function openMixer(){
 if(typeof document==='undefined')return;document.getElementById('bfSfxMixer')?.remove();
 const el=document.createElement('div');el.id='bfSfxMixer';
 el.innerHTML=`<style>#bfSfxMixer{position:fixed;inset:0;z-index:100000;background:rgba(6,9,14,.9);color:#e8eef7;font:14px system-ui,sans-serif;display:flex;align-items:center;justify-content:center}
#bfSfxMixer .box{background:#141b26;border:1px solid #3a4a62;border-radius:8px;width:min(720px,96vw);max-height:92vh;display:flex;flex-direction:column}
#bfSfxMixer header{display:flex;gap:8px;align-items:center;padding:10px 12px;border-bottom:1px solid #2c3a50;flex-wrap:wrap}#bfSfxMixer header b{flex:1}
#bfSfxMixer .list{overflow:auto;padding:4px 12px 12px}#bfSfxMixer h3{margin:14px 0 6px;font-size:13px;color:#9fb6d6;text-transform:uppercase;letter-spacing:.05em}
#bfSfxMixer .row{display:grid;grid-template-columns:1fr auto auto minmax(90px,170px) 44px;gap:8px;align-items:center;padding:3px 0}
#bfSfxMixer [data-v] button{padding:4px 7px;margin-right:2px}#bfSfxMixer button,#bfSfxMixer select{background:#22314a;color:#e8eef7;border:1px solid #4a6286;border-radius:4px;padding:4px 8px;font:inherit}
#bfSfxMixer input[type=range]{width:100%}#bfSfxMixer .pct{text-align:right;font-variant-numeric:tabular-nums;color:#bcd}
#bfSfxMixer textarea{width:100%;height:80px;background:#0d131c;color:#dfe;border:1px solid #3a4a62;font:12px monospace}
#bfSfxMixer small{color:#8fa3bf}@media(max-width:560px){#bfSfxMixer .row{grid-template-columns:1fr auto auto;}#bfSfxMixer .row input,#bfSfxMixer .row .pct{grid-column:span 1}}</style>
<div class="box"><header><b>Sound mixer</b><button data-x="export">Export</button><button data-x="import">Import</button><button data-x="reset">Reset all</button><button data-x="close">Done</button></header>
<div class="list"><small>Pick a version (A, B or C; tap to hear it) and a volume for each sound; ▶ plays it. Changes apply at once and are kept on this device. Export gives a text you can send to make your mix the game's default.</small><div data-io hidden><textarea data-text></textarea><button data-x="apply">Apply pasted mix</button></div><div data-rows></div></div></div>`;
 const rows=el.querySelector('[data-rows]'),row=(label,id,isBed)=>{const r=document.createElement('div');r.className='row';
  const v=isBed?null:pick(id),volume=isBed?bedVol(id):vol(id);
  r.innerHTML=`<span>${label}</span>${isBed?'<span></span>':`<span data-v>${'ABCD'.slice(0,nver(id)).split('').map((t,i)=>`<button data-vi="${i}" style="${i===v?'background:#4a7ad0;border-color:#9cc0ff':''}">${t}</button>`).join('')}</span>`}<button data-t>▶</button><input type="range" min="0" max="200" step="5" value="${Math.round(volume*100)}"><span class="pct">${Math.round(volume*100)}%</span>`;
  const range=r.querySelector('input'),pct=r.querySelector('.pct');
  range.oninput=()=>{const x=+range.value/100;pct.textContent=range.value+'%';if(isBed){mix.beds[id]=x;refresh();}else mix.sounds[id]={...(mix.sounds[id]||{}),vol:x};save();};
  r.querySelector('[data-t]').onclick=()=>isBed?testBed(id):test(id);
  if(!isBed)r.querySelectorAll('[data-vi]').forEach(b=>b.onclick=()=>{const vi=+b.dataset.vi;mix.sounds[id]={...(mix.sounds[id]||{}),v:vi};save();preload([id]);test(id);
   r.querySelectorAll('[data-vi]').forEach(o=>o.style.cssText=+o.dataset.vi===vi?'background:#4a7ad0;border-color:#9cc0ff':'');});
  return r;};
 for(const [g,names] of GROUPS){const h=document.createElement('h3');h.textContent=g;rows.append(h);for(const n of names)if(BANK[n])rows.append(row(LABEL[n]||n,n,false));}
 const h=document.createElement('h3');h.textContent='Ambient sounds';rows.append(h);for(const b of BEDS)rows.append(row(BEDLABEL[b]||b,b,true));
 const io=el.querySelector('[data-io]'),text=el.querySelector('[data-text]');
 el.addEventListener('click',async e=>{const x=e.target.dataset?.x;if(!x)return;
  if(x==='close'){try{bedTest?.stop();}catch(_e){}el.remove();}
  else if(x==='export'){const s=exportMix();io.hidden=false;text.value=s;text.select();try{await root.navigator.clipboard.writeText(s);text.insertAdjacentHTML('afterend','');}catch(_e){}
   try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([s],{type:'application/json'}));a.download='bladefall-sound-mix.json';a.click();}catch(_e){}}
  else if(x==='import'){io.hidden=false;text.value='';text.placeholder='Paste an exported sound mix here';text.focus();}
  else if(x==='apply'){try{importMix(text.value);openMixer();}catch(err){root.alert('That is not a sound mix: '+err.message);}}
  else if(x==='reset'){if(root.confirm('Put every sound back to its default version and volume?')){resetMix();openMixer();}}});
 document.body.append(el);wake();
}
root.BladefallSfx=Object.freeze({play,loop,has,preload,ambience,configure,state,forTheme,forWorld,openMixer,exportMix,importMix,resetMix,BANK,BEDS});
})(globalThis);
