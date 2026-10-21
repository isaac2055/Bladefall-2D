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
const BANK=Object.freeze({bell:1,bolt:1,'boss-fall':1,'boss-roar':1,campfire:1,chain:1,chest:1,coin:1,coins:1,crumble:1,dash:2,death:1,door:1,
 'enemy-alert':1,'enemy-arrow':1,'enemy-die':2,'enemy-shot':1,fanfare:1,gate:1,gem:1,grab:1,gust:1,heal:1,'hit-armor':2,'hit-flesh':1,hurt:1,jump:2,key:1,
 'land-hard':1,'land-soft':2,lantern:1,lever:1,magic:1,pack:1,page:1,parry:1,plate:1,pod:1,portal:1,powerup:1,quest:1,rune:1,shatter:1,
 splash:1,spring:1,'step-dirt':3,'step-metal':3,'step-snow':3,'step-stone':2,'step-wood':3,'stone-hit':1,swing:2,switch:1,turret:1,'ui-move':1,
 'ui-open':1,'ui-select':1,walljump:1,wallslide:1,zip:1});
// relative loudness of each clip (they are all peak-normalised on disk)
const LEVEL=Object.freeze({'step-dirt':.32,'step-stone':.3,'step-wood':.32,'step-metal':.26,'step-snow':.34,jump:.4,'land-soft':.42,'land-hard':.6,
 dash:.5,walljump:.45,grab:.4,wallslide:.3,swing:.55,'hit-flesh':.45,'hit-armor':.55,parry:.6,'enemy-die':.5,hurt:.6,death:.7,bolt:.5,'enemy-shot':.4,
 'enemy-arrow':.4,turret:.45,'enemy-alert':.35,magic:.45,'boss-roar':.8,'boss-fall':.8,coin:.45,coins:.5,gem:.45,key:.5,chest:.6,gate:.65,door:.55,lever:.55,plate:.45,
 switch:.45,crumble:.5,bell:.6,campfire:.5,heal:.5,powerup:.5,portal:.55,chain:.45,lantern:.5,page:.45,quest:.5,zip:.45,pod:.5,'stone-hit':.55,
 rune:.5,'ui-move':.25,'ui-select':.3,'ui-open':.35,splash:.55,spring:.5,pack:.35,fanfare:.55,shatter:.5,gust:.5});
const BEDS=Object.freeze(['plains','forest','heights','cave','forge','snow','shore','hall','void','dungeon']);
// how loud each bed sits under the music by default (7.367: all quieter; the forest's insects much quieter)
const BEDLEVEL=Object.freeze({plains:.55,forest:.28,heights:.45,cave:.5,forge:.45,snow:.45,shore:.5,hall:.5,void:.4,dungeon:.4});
/* The official defaults. Paste an export from the Sound mixer here: {"sounds":{"jump":{"v":1,"vol":0.8}},"beds":{"forest":0.5}}.
   v is the version (0 = A, 1 = B, 2 = C); vol multiplies the sound (1 = as shipped). */
const DEFAULT_MIX=Object.freeze({sounds:{},beds:{}});
const GROUPS=[['Movement',['step-stone','step-dirt','step-wood','step-metal','step-snow','jump','land-soft','land-hard','dash','walljump','grab','wallslide','spring','splash','pack','zip']],
 ['Combat',['swing','bolt','hit-flesh','hit-armor','parry','hurt','death','enemy-alert','enemy-shot','enemy-arrow','turret','enemy-die','magic','boss-roar','boss-fall']],
 ['World',['coin','coins','gem','key','chest','gate','door','lever','plate','switch','crumble','stone-hit','pod','rune','bell','campfire','heal','powerup','portal','chain','lantern','page','quest','shatter','gust','fanfare']],
 ['Menus',['ui-move','ui-select','ui-open']]];
const LABEL={'step-stone':'Footsteps · stone','step-dirt':'Footsteps · dirt','step-wood':'Footsteps · wood','step-metal':'Footsteps · metal','step-snow':'Footsteps · snow',
 jump:'Jump','land-soft':'Landing','land-hard':'Hard landing',dash:'Dash',walljump:'Wall jump',grab:'Ledge grab',wallslide:'Wall slide',spring:'Spring / boost pad',
 splash:'Splash',pack:'Pack (jetpack)',zip:'Zip line',swing:'Sword swing',bolt:'Your bow',  'hit-flesh':'Hitting an enemy','hit-armor':'Hitting armour / shield',
 parry:'Parry',hurt:'You get hurt',death:'You fall',  'enemy-alert':'Enemy notices you','enemy-shot':'Enemy magic shot','enemy-arrow':'Enemy arrow',turret:'Trap / turret fires',
 'enemy-die':'Enemy defeated',magic:'Magic','boss-roar':'Boss roar','boss-fall':'Boss falls',coin:'Coin',coins:'Purchase',gem:'Crystal / shard',key:'Key',chest:'Chest',
 gate:'Stone gate',door:'Door',lever:'Lever',plate:'Pressure plate',switch:'Switch',crumble:'Crumbling ground','stone-hit':'Stone block',pod:'Seed pod',rune:'Rune / secret',
 bell:'Bell',campfire:'Checkpoint fire',heal:'Heal / revive',powerup:'Power-up / level up',portal:'Portal',chain:'Chain lift',lantern:'Lantern',page:'Notes and signs',
 quest:'Task done',shatter:'Lantern breaks',gust:'Wind gate',fanfare:'Victory','ui-move':'Menu tick','ui-select':'Menu confirm','ui-open':'Someone greets you'};
const BEDLABEL={plains:'Open fields',forest:'Black Woods (night insects)',heights:'High wind',cave:'Caves',forge:'Fire and lava',snow:'Snow wind',shore:'Shore waves',
 hall:'Palace halls',void:'Fractured / void',dungeon:'Dungeon'};
let mix=load();
function load(){let m=null;try{m=JSON.parse(root.localStorage?.getItem(KEY)||'null');}catch(_e){}return {sounds:{...DEFAULT_MIX.sounds,...(m?.sounds||{})},beds:{...DEFAULT_MIX.beds,...(m?.beds||{})}};}
function save(){try{root.localStorage?.setItem(KEY,JSON.stringify(mix));}catch(_e){}}
const pick=name=>Math.max(0,Math.min(2,mix.sounds[name]?.v|0)),vol=name=>mix.sounds[name]?.vol??1,bedVol=b=>mix.beds[b]??1;
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
function wake(){const a=ac();if(a&&a.state==='suspended')a.resume().catch(()=>{});if(a&&!preloaded){preloaded=true;preload();}}
if(typeof document!=='undefined')for(const t of ['pointerdown','touchend','keydown'])document.addEventListener(t,wake,{capture:true,passive:true});
function paths(name,v=pick(name)){return v?[BASE+name+(v===1?'.b':'.c')+'.mp3']:Array.from({length:BANK[name]},(_,i)=>BASE+name+(BANK[name]>1?'-'+(i+1):'')+'.mp3');}
function fetchBuffer(path){
 if(buffers.has(path))return Promise.resolve(buffers.get(path));if(pending.has(path))return pending.get(path);
 const a=ac();if(!a||!root.fetch)return Promise.resolve(null);
 const p=root.fetch(path).then(r=>r.ok?r.arrayBuffer():null).then(b=>b?new Promise((res,rej)=>a.decodeAudioData(b,res,rej)):null)
  .then(buf=>{buffers.set(path,buf);pending.delete(path);return buf;}).catch(()=>{buffers.set(path,null);pending.delete(path);return null;});
 pending.set(path,p);return p;
}
function preload(names){for(const n of names||Object.keys(BANK))for(const p of paths(n))fetchBuffer(p);}
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
 const a=ac();if(!a)return false;if(a.state==='suspended')a.resume().catch(()=>{});
 const now=a.currentTime*1000,gap=opts.gap??35;if(now-(lastAt.get(name)??-1e9)<gap)return true;lastAt.set(name,now);
 const list=paths(name),i=(turn.get(name)||0)%list.length;turn.set(name,i+1);
 const path=list[i],buf=buffers.get(path);
 if(buf===undefined){fetchBuffer(path).then(b=>{if(b)start(b,name,opts);});return true;}   // first use: plays as soon as it decodes
 if(!buf)return false;
 return start(buf,name,opts);
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
#bfSfxMixer button,#bfSfxMixer select{background:#22314a;color:#e8eef7;border:1px solid #4a6286;border-radius:4px;padding:4px 8px;font:inherit}
#bfSfxMixer input[type=range]{width:100%}#bfSfxMixer .pct{text-align:right;font-variant-numeric:tabular-nums;color:#bcd}
#bfSfxMixer textarea{width:100%;height:80px;background:#0d131c;color:#dfe;border:1px solid #3a4a62;font:12px monospace}
#bfSfxMixer small{color:#8fa3bf}@media(max-width:560px){#bfSfxMixer .row{grid-template-columns:1fr auto auto;}#bfSfxMixer .row input,#bfSfxMixer .row .pct{grid-column:span 1}}</style>
<div class="box"><header><b>Sound mixer</b><button data-x="export">Export</button><button data-x="import">Import</button><button data-x="reset">Reset all</button><button data-x="close">Done</button></header>
<div class="list"><small>Pick a version (A, B or C) and a volume for each sound; ▶ plays it. Changes apply at once and are kept on this device. Export gives a text you can send to make your mix the game's default.</small><div data-io hidden><textarea data-text></textarea><button data-x="apply">Apply pasted mix</button></div><div data-rows></div></div></div>`;
 const rows=el.querySelector('[data-rows]'),row=(label,id,isBed)=>{const r=document.createElement('div');r.className='row';
  const v=isBed?null:pick(id),volume=isBed?bedVol(id):vol(id);
  r.innerHTML=`<span>${label}</span>${isBed?'<span></span>':`<select data-v>${['A','B','C'].map((t,i)=>`<option value="${i}" ${i===v?'selected':''}>${t}</option>`).join('')}</select>`}<button data-t>▶</button><input type="range" min="0" max="200" step="5" value="${Math.round(volume*100)}"><span class="pct">${Math.round(volume*100)}%</span>`;
  const range=r.querySelector('input'),pct=r.querySelector('.pct');
  range.oninput=()=>{const x=+range.value/100;pct.textContent=range.value+'%';if(isBed){mix.beds[id]=x;refresh();}else mix.sounds[id]={...(mix.sounds[id]||{}),vol:x};save();};
  r.querySelector('[data-t]').onclick=()=>isBed?testBed(id):test(id);
  if(!isBed)r.querySelector('[data-v]').onchange=e=>{mix.sounds[id]={...(mix.sounds[id]||{}),v:+e.target.value};save();preload([id]);test(id);};
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
root.BladefallSfx=Object.freeze({play,has,preload,ambience,configure,state,forTheme,forWorld,openMixer,exportMix,importMix,resetMix,BANK,BEDS});
})(globalThis);
