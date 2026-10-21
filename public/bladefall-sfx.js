/* (7.366) Recorded sound effects and ambient loops, shared by Explore (index.html) and Ascend (pcore view).
   Clips live in audio/sfx/<name>[-n].mp3 (n picks among takes, so repeated sounds vary) and audio/sfx/amb/<bed>.mp3
   (20 s seamless loops). Each host says whether sound is on and how loud: BladefallSfx.configure({enabled,volume}).
   play() returns false when it has no clip for a name, so a host keeps its synthesized sound as the fallback.
   Clips decode on first use (or preload()), so the very first play of a sound can be silent while it loads. */
(function(root){
'use strict';
const BASE='./audio/sfx/';
// name → number of takes on disk (1 = name.mp3; more = name-1.mp3 … name-n.mp3)
const BANK=Object.freeze({bell:1,bolt:1,'boss-fall':1,'boss-roar':1,campfire:1,chain:1,chest:1,coin:1,coins:1,crumble:1,dash:2,death:1,door:1,
 'enemy-alert':1,'enemy-die':2,'enemy-shot':1,fanfare:1,gate:1,gem:1,grab:1,gust:1,heal:1,'hit-armor':2,'hit-flesh':2,hurt:1,jump:2,key:1,
 'land-hard':1,'land-soft':2,lantern:1,lever:1,magic:1,pack:1,page:1,parry:1,plate:1,pod:1,portal:1,powerup:1,quest:1,rune:1,shatter:1,
 splash:1,spring:1,'step-dirt':3,'step-metal':3,'step-snow':3,'step-stone':2,'step-wood':3,'stone-hit':1,swing:2,switch:1,'ui-move':1,
 'ui-open':1,'ui-select':1,walljump:1,wallslide:1,zip:1});
// relative loudness of each clip (they are all peak-normalised on disk)
const LEVEL=Object.freeze({'step-dirt':.32,'step-stone':.3,'step-wood':.32,'step-metal':.26,'step-snow':.34,jump:.4,'land-soft':.42,'land-hard':.6,
 dash:.5,walljump:.45,grab:.4,wallslide:.3,swing:.55,'hit-flesh':.6,'hit-armor':.55,parry:.6,'enemy-die':.5,hurt:.6,death:.7,bolt:.45,'enemy-shot':.4,
 'enemy-alert':.35,magic:.45,'boss-roar':.8,'boss-fall':.8,coin:.45,coins:.5,gem:.45,key:.5,chest:.6,gate:.65,door:.55,lever:.55,plate:.45,
 switch:.45,crumble:.5,bell:.6,campfire:.5,heal:.5,powerup:.5,portal:.55,chain:.45,lantern:.5,page:.45,quest:.5,zip:.45,pod:.5,'stone-hit':.55,
 rune:.5,'ui-move':.25,'ui-select':.3,'ui-open':.35,splash:.55,spring:.5,pack:.45,fanfare:.55,shatter:.5,gust:.5});
const BEDS=Object.freeze(['plains','forest','heights','cave','forge','snow','shore','hall','void','machine','dungeon']);
let ctx=null,out=null,bedBus=null,settings={enabled:()=>true,volume:()=>.8,ambience:()=>true,ambienceVolume:()=>.5};
const buffers=new Map(),pending=new Map(),turn=new Map(),lastAt=new Map();
let bed=null;   // {name,src,gain}
function ac(){
 if(ctx)return ctx;const AC=root.AudioContext||root.webkitAudioContext;if(!AC)return null;
 try{ctx=new AC();out=ctx.createGain();out.connect(ctx.destination);bedBus=ctx.createGain();bedBus.connect(ctx.destination);}catch(_e){ctx=null;}
 return ctx;
}
function ramp(param,v,tc){try{if(param.setTargetAtTime)param.setTargetAtTime(v,ctx.currentTime,tc);else param.value=v;}catch(_e){try{param.value=v;}catch(_e2){}}}
function wake(){const a=ac();if(a&&a.state==='suspended')a.resume().catch(()=>{});}
if(typeof document!=='undefined')for(const t of ['pointerdown','touchend','keydown'])document.addEventListener(t,wake,{capture:true,passive:true});
function url(name,take){return BASE+name+(BANK[name]>1?'-'+take:'')+'.mp3';}
function fetchBuffer(path){
 if(buffers.has(path))return Promise.resolve(buffers.get(path));if(pending.has(path))return pending.get(path);
 const a=ac();if(!a||!root.fetch)return Promise.resolve(null);
 const p=root.fetch(path).then(r=>r.ok?r.arrayBuffer():null).then(b=>b?new Promise((res,rej)=>a.decodeAudioData(b,res,rej)):null)
  .then(buf=>{buffers.set(path,buf);pending.delete(path);return buf;}).catch(()=>{buffers.set(path,null);pending.delete(path);return null;});
 pending.set(path,p);return p;
}
function preload(names){for(const n of names||Object.keys(BANK))for(let i=1;i<=(BANK[n]||0);i++)fetchBuffer(url(n,i));}
function has(name){return !!BANK[name];}
function on(){try{return settings.enabled()!==false;}catch(_e){return true;}}
/* opts: gain (×LEVEL), rate, pan (-1…1), detune (random ± rate spread), gap (min ms between repeats of this name) */
function play(name,opts={}){
 if(!BANK[name])return false;if(!on())return true;
 const a=ac();if(!a)return false;if(a.state==='suspended')a.resume().catch(()=>{});
 const now=a.currentTime*1000,gap=opts.gap??35;if(now-(lastAt.get(name)??-1e9)<gap)return true;lastAt.set(name,now);
 const take=(turn.get(name)||0)%BANK[name]+1;turn.set(name,take);
 const path=url(name,take),buf=buffers.get(path);
 if(buf===undefined){fetchBuffer(path);return true;}   // loading: this one plays silently, the next one sounds
 if(!buf)return false;
 let vol=1;try{vol=+settings.volume();}catch(_e){}
 try{
 const g=a.createGain();g.gain.value=Math.max(0,Math.min(1.5,(LEVEL[name]??.5)*(opts.gain??1)*vol));
 const s=a.createBufferSource();s.buffer=buf;const spread=opts.detune??.05;s.playbackRate.value=(opts.rate||1)*(1+(Math.random()*2-1)*spread);
 let node=s;
 if(opts.pan&&a.createStereoPanner){const p=a.createStereoPanner();p.pan.value=Math.max(-1,Math.min(1,opts.pan));node.connect(p);node=p;}
 node.connect(g);g.connect(out);s.start();return true;
 }catch(_e){return false;}   // an audio graph without these features: the host's own sound plays instead
}
/* Ambient bed: one 20 s loop at a time, crossfaded. ambience(null) fades it out. */
function ambience(name,opts={}){
 const want=name&&BEDS.includes(name)?name:null,a=ac();if(!a)return;
 let level=.5;try{level=+settings.ambienceVolume()*(settings.ambience()!==false&&on()?1:0);}catch(_e){}
 const target=Math.max(0,Math.min(1,level*(opts.gain??1)));
 if(bed&&bed.name===want){ramp(bed.gain.gain,target,.4);return;}
 if(bed){const old=bed;ramp(old.gain.gain,0,.6);setTimeout(()=>{try{old.src?.stop();}catch(_e){}},3000);bed=null;}
 if(!want)return;
 const path=BASE+'amb/'+want+'.mp3';try{bed={name:want,src:null,gain:a.createGain()};bed.gain.gain.value=0;bed.gain.connect(bedBus);}catch(_e){bed=null;return;}
 const mine=bed;fetchBuffer(path).then(buf=>{if(!buf||bed!==mine)return;try{const s=a.createBufferSource();s.buffer=buf;s.loop=true;s.connect(mine.gain);
  s.start(0,Math.random()*Math.max(0,buf.duration-1));mine.src=s;ramp(mine.gain.gain,target,.8);}catch(_e){}});
}
function refresh(){if(bed)ambience(bed.name);}
function configure(next){settings={...settings,...next};refresh();}
function state(){return {context:ctx?.state||'none',bed:bed?.name||null,loaded:[...buffers.keys()].filter(k=>buffers.get(k)).length};}
// Explore stage themes and Ascend world keys → the bed and the ground underfoot
const THEME={plains:['plains','dirt'],forest:['forest','dirt'],badlands:['machine','stone'],canyon:['heights','stone'],ruins:['hall','stone'],
 dungeon:['dungeon','stone'],frost:['snow','snow'],volcano:['forge','stone'],void:['void','stone'],apex:['void','stone'],storm:['heights','stone'],
 shore:['shore','dirt'],colony:['cave','dirt'],path:['plains','dirt'],sunspire:['hall','stone'],fractured:['void','stone']};
const WORLD={outskirts:['plains','dirt'],woods:['forest','dirt'],causeway:['machine','wood'],updrafts:['heights','stone'],marksman:['heights','stone'],
 keep:['hall','stone'],gaol:['dungeon','stone'],frostfell:['snow','snow'],sorcerer:['snow','snow'],emberdeep:['forge','stone'],colossus:['forge','metal'],
 inversion:['void','stone'],tyrant:['void','stone'],king:['void','stone'],deepline:['cave','wood'],cliffs:['heights','stone'],shores:['shore','dirt'],
 colony:['cave','dirt'],path:['plains','dirt'],sunspire:['hall','stone']};
function forTheme(theme){return THEME[theme]||['plains','stone'];}
function forWorld(key){if(!key)return ['plains','stone'];const base=String(key).replace(/^f-/,'');const r=WORLD[base]||['plains','stone'];return /^f-/.test(key)?['void',r[1]]:r;}
root.BladefallSfx=Object.freeze({play,has,preload,ambience,configure,state,forTheme,forWorld,BANK,BEDS});
})(globalThis);
