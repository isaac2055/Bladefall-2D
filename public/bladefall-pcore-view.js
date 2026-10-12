/* Precision Core view: pixel renderer, input, audio, menus and the fixed-step loop.
   The simulation (bladefall-pcore.js) owns every rule; this file only reads its state and
   its event queue. One room is one 320x184 screen, scaled by a whole number. */
(function(root){
'use strict';
const C=root.BladefallPrecisionCore,R=root.BladefallPrecisionRooms;
const {TILE,COLS,ROWS,H,SOLID,THRU,SPIKE_UP,SPIKE_DOWN,SPIKE_LEFT,SPIKE_RIGHT}=C;
let W=C.W; // Render width may widen on landscape phones; simulation coordinates stay unchanged.
const SAVE='bladefall.pcore.v1';
// 7.256: the owner's difficulty survey (bladefall-pcore-survey.js), off unless switched on; never in gate trials.
const SV=()=>view.trial?null:view.pitch?(R.chapters[view.chapter]?.rbr?root.BladefallPrecisionSurvey?.rbr:null):root.BladefallPrecisionSurvey;
const TOUCH=()=>root.BladefallPrecisionTouch||null;
const touchUI=()=>!!TOUCH()?.active();

/* ---------------------------------------------------------------- save */
function loadSave(){try{return JSON.parse(localStorage.getItem(SAVE))||{};}catch(e){return {};}}
function writeSave(s){try{localStorage.setItem(SAVE,JSON.stringify(s));}catch(e){}}
const save=Object.assign({shards:[],cleared:{},best:{},assist:{},options:{shake:true,sound:true,music:true}},loadSave());
save.options=Object.assign({shake:true,sound:true,music:true},save.options);
save.assist.infiniteStamina=!!save.assist.testMode;   // (7.314) infinite stamina is test mode's alone

/* ---------------------------------------------------------------- input */
/* Every action can sit on several keys and several controller buttons. The player's choices
   live in the save (save.binds); anything not rebound falls back to these defaults. The sticks
   always move and aim, Esc always pauses or backs out, and menus always answer arrows / d-pad /
   stick + Enter / A + Esc / B, so no set of bindings can lock a player out. */
const ACTIONS=[['l','Move left'],['r','Move right'],['u','Up · aim up · climb'],['d','Down · aim down'],
 ['jump','Jump'],['dash','Dash (8 directions)'],['grab','Grab · climb · carry / throw'],
 ['strike','Blade strike (↑ / ↓ in air to aim)'],['parry','Parry · arrows aim returned shots'],
 ['portal','Portal · fires the way you aim'],['retry','Retry room'],['pause','Pause · back']];
const PLAY_ACTIONS=['l','r','u','d','jump','dash','grab','strike','parry','portal'];
const LATCHED=['jump','dash','grab','strike','parry','portal'];
const KEY_DEFAULTS={l:['ArrowLeft'],r:['ArrowRight'],u:['ArrowUp'],d:['ArrowDown'],
 jump:['Space','KeyC','KeyJ'],dash:['KeyD','KeyX','KeyK'],grab:['KeyA','KeyZ','ShiftLeft','ShiftRight','KeyL'],
 strike:['KeyW','KeyV','KeyI'],parry:['KeyF','KeyO'],portal:['KeyP'],retry:['KeyR'],pause:[]};
// Standard gamepad mapping: 0 A · 1 B · 2 X · 3 Y · 4 LB · 5 RB · 6 LT · 7 RT · 8 Back · 9 Start · 10 LS · 11 RS · 12-15 d-pad
const PAD_DEFAULTS={l:[14],r:[15],u:[12],d:[13],jump:[0],dash:[2,1],grab:[4,6],strike:[3],parry:[7],portal:[5],retry:[8],pause:[9]};
const RESERVED_KEYS=new Set(['Escape','MetaLeft','MetaRight','Tab']);
const copyBinds=d=>Object.fromEntries(Object.entries(d).map(([k,v])=>[k,v.slice()]));
function loadBinds(){
 const b=save.binds||{},out={keys:copyBinds(KEY_DEFAULTS),pad:copyBinds(PAD_DEFAULTS)};
 for(const kind of ['keys','pad'])for(const [a] of ACTIONS)if(b[kind]&&Array.isArray(b[kind][a]))out[kind][a]=b[kind][a].slice();
 // 7.252: P became the portal key (Esc still pauses) and RB the portal button (Y still strikes).
 // A save from before the portal keeps its other choices; only those two defaults move.
 if(!(b.keys&&b.keys.portal)){out.keys.pause=out.keys.pause.filter(k=>k!=='KeyP');for(const a in out.keys)if(a!=='portal')out.keys[a]=out.keys[a].filter(k=>k!=='KeyP');out.keys.portal=['KeyP'];}
 if(!(b.pad&&b.pad.portal)){for(const a in out.pad)if(a!=='portal')out.pad[a]=out.pad[a].filter(i=>i!==5);out.pad.portal=[5];}
 return out;
}
const binds=loadBinds();
for(const codes of Object.values(binds.keys))for(let n=0;n<codes.length;n++)codes[n]=root.BladefallInput.normalizeCode(codes[n]);
function saveBinds(){save.binds=binds;writeSave(save);}
function keyAction(code){for(const [a] of ACTIONS)if(binds.keys[a].includes(code))return a;return null;}
const keys=new Set();
const latch=new Set();     // actions held when a menu closed: ignored until released, so the A that picks a chapter is not also a jump
let lastDevice='mouse',activePad=-1,capture=null;

function allPads(){try{return [...(navigator.getGamepads?navigator.getGamepads():[])].filter(p=>p&&p.connected);}catch(e){return [];}}
const btn=(gp,i)=>{const x=gp&&gp.buttons[i];return !!x&&(x.pressed||x.value>.5);};
function padBusy(gp){return gp.buttons.some((x,i)=>i<17&&(x.pressed||x.value>.5))||gp.axes.slice(0,2).some(v=>Math.abs(v)>.5);}
function pickPad(){
 // Follow whichever controller was touched last; otherwise prefer one with the standard layout.
 const pads=allPads();if(!pads.length){activePad=-1;return null;}
 for(const gp of pads)if(padBusy(gp)&&gp.index!==activePad){activePad=gp.index;break;}
 return pads.find(p=>p.index===activePad)||pads.find(p=>p.mapping==='standard')||pads[0];
}
function padStyle(gp){const id=(gp&&gp.id||'').toLowerCase();
 if(/054c|dualsense|dualshock|playstation|ps4|ps5/.test(id))return 'ps';
 if(/057e|nintendo|pro controller|joy-con/.test(id))return 'nin';return 'xbox';}
const PAD_NAMES={xbox:['A','B','X','Y','LB','RB','LT','RT','View','Menu','LS','RS'],
 ps:['✕','○','□','△','L1','R1','L2','R2','Share','Options','L3','R3'],
 nin:['B','A','Y','X','L','R','ZL','ZR','−','+','LS','RS']};
function padName(i,gp){if(i>=12&&i<=15)return 'D-pad '+['↑','↓','←','→'][i-12];if(i===16)return 'Home';
 return PAD_NAMES[padStyle(gp||pickPad())][i]||('Button '+i);}
function keyName(code){
 const M={ArrowLeft:'←',ArrowRight:'→',ArrowUp:'↑',ArrowDown:'↓',Space:'Space',ShiftLeft:'L-Shift',ShiftRight:'R-Shift',
  ControlLeft:'L-Ctrl',ControlRight:'R-Ctrl',AltLeft:'L-Alt',AltRight:'R-Alt',Enter:'Enter',Backspace:'Backspace',
  Semicolon:';',Quote:"'",Comma:',',Period:'.',Slash:'/',Backslash:'\\',BracketLeft:'[',BracketRight:']',Minus:'-',Equal:'=',Backquote:'`',CapsLock:'Caps'};
 if(M[code])return M[code];if(code.startsWith('Key'))return code.slice(3);if(code.startsWith('Digit'))return code.slice(5);
 if(code.startsWith('Numpad'))return 'Num '+code.slice(6);return code;}
/* The label a prompt should show for an action: the first controller button while a controller
   is the device in use, otherwise the first key. */
function actionLabel(a){
 if(touchUI()&&TOUCH().label(a))return TOUCH().label(a);
 if(lastDevice==='pad'&&binds.pad[a].length)return padName(binds.pad[a][0]);
 return binds.keys[a].length?keyName(binds.keys[a][0]):(binds.pad[a].length?padName(binds.pad[a][0]):'—');}
function readPad(){
 const gp=pickPad();if(!gp)return {};
 const ax=gp.axes[0]||0,ay=gp.axes[1]||0,out={};
 for(const [a] of ACTIONS)out[a]=binds.pad[a].some(i=>btn(gp,i));
 out.l=out.l||ax<-.45;out.r=out.r||ax>.45;out.u=out.u||ay<-.45;out.d=out.d||ay>.45;
 out.any=PLAY_ACTIONS.some(a=>out[a]);
 // raw menu directions and buttons, independent of bindings
 out.nav={l:ax<-.5||btn(gp,14),r:ax>.5||btn(gp,15),u:ay<-.5||btn(gp,12),d:ay>.5||btn(gp,13),ok:btn(gp,0),back:btn(gp,1)};
 if(padBusy(gp))setDevice('pad');
 return out;
}
function currentInput(dt=0){
 const i={l:false,r:false,u:false,d:false,jump:false,dash:false,grab:false,strike:false,parry:false,portal:false};
 for(const k of keys){const a=keyAction(k);if(a&&a in i)i[a]=true;}
 const pad=readPad();for(const k in i)if(pad[k])i[k]=true;
 // Touch (7.258): the thumbs' gestures, read on game time so their windows hold at any refresh rate.
 const touch=TOUCH()?.read(dt);if(touch){for(const k in i)if(touch[k]===true)i[k]=true;if(touch.aim)i.aim=touch.aim;if(touch.any)pad.any=true;}
 for(const a of [...latch]){if(i[a])i[a]=false;else latch.delete(a);}
 return {input:i,pad};
}
function latchHeld(){const {input}=currentInput();for(const a of LATCHED)if(input[a])latch.add(a);}
function setDevice(d){if(d==='pad')TOUCH()?.setActive(false);if(d===lastDevice)return;lastDevice=d;if(typeof document!=='undefined'&&document.body)document.body.classList.toggle('pcNav',d==='key'||d==='pad');}

/* ---------------------------------------------------------------- menu navigation (keyboard + controller) */
const nav={held:{},since:{},last:{}};
function focusables(){const o=overlay();return o?[...o.querySelectorAll('button,a[href],input,select')].filter(el=>!el.disabled&&el.offsetParent!==null):[];}
function focusFirst(){if(touchUI()&&lastDevice!=='key'&&lastDevice!=='pad')return;   // no focus ring under a thumb
 const f=focusables();const pick=overlay().querySelector('[data-focus-first]')||f[0];if(pick){pick.focus({preventScroll:false});}}
function moveFocus(dir){
 const f=focusables();if(!f.length)return;const cur=document.activeElement;
 if(!f.includes(cur)){focusFirst();return;}
 const el=document.activeElement;
 if(el.tagName==='SELECT'&&(dir==='l'||dir==='r')){const n=el.selectedIndex+(dir==='r'?1:-1);if(n>=0&&n<el.options.length){el.selectedIndex=n;el.dispatchEvent(new Event('change',{bubbles:true}));}return;}
 const a=el.getBoundingClientRect(),ax=a.left+a.width/2,ay=a.top+a.height/2;
 let best=null,bs=Infinity;
 for(const c of f){if(c===el)continue;const r=c.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=cx-ax,dy=cy-ay;
  const main=dir==='l'?-dx:dir==='r'?dx:dir==='u'?-dy:dy,side=dir==='l'||dir==='r'?Math.abs(dy):Math.abs(dx);
  if(main<=2||((dir==='l'||dir==='r')&&side>main*2+24))continue;const s=main+side*2.2;if(s<bs){bs=s;best=c;}}
 if(best){best.focus();best.scrollIntoView({block:'nearest',inline:'nearest'});}
}
function menuConfirm(){const el=document.activeElement;if(!focusables().includes(el)){focusFirst();return;}el.click();}
function menuBack(){const o=overlay();const b=o&&o.querySelector('[data-back]');if(b){b.click();return true;}return false;}
function menuNav(pad){
 if(!pad.nav||capture)return;const now=performance.now();
 for(const d of ['l','r','u','d']){const on=pad.nav[d];
  if(on&&!nav.held[d]){nav.since[d]=now;nav.last[d]=now;moveFocus(d);}
  else if(on&&now-nav.since[d]>340&&now-nav.last[d]>110){nav.last[d]=now;moveFocus(d);}
  nav.held[d]=on;}
 if(pad.nav.ok&&!nav.held.ok)menuConfirm();
 if(pad.nav.back&&!nav.held.back)menuBack();
 nav.held.ok=pad.nav.ok;nav.held.back=pad.nav.back;
}
function overlayOpen(){const o=overlay();return !!o&&o.classList.contains('show');}

/* ---------------------------------------------------------------- rebinding */
function startCapture(kind,action,redraw){
 const gp=pickPad();
 capture={kind,action,redraw,t:performance.now(),held:new Set(gp?gp.buttons.map((x,i)=>x.pressed||x.value>.5?i:-1).filter(i=>i>=0):[])};
 redraw();
}
function endCapture(){const c=capture;capture=null;if(c)c.redraw();}
function assign(kind,action,value){
 const list=binds[kind];let moved=null;
 for(const [a] of ACTIONS){if(a===action)continue;const i=list[a].indexOf(value);if(i>=0){list[a].splice(i,1);moved=a;}}
 if(!list[action].includes(value))list[action].push(value);
 saveBinds();
 view.bindNote=moved?`${kind==='keys'?keyName(value):padName(value)} moved from “${ACTIONS.find(x=>x[0]===moved)[1]}”.`:'';
}
function pollCapture(){
 if(!capture)return;
 if(performance.now()-capture.t>6000){view.bindNote='No input — nothing changed.';endCapture();return;}
 const gp=pickPad();if(!gp)return;
 if(capture.kind!=='pad'){ // a controller player can still back out of a keyboard capture with B
  if(btn(gp,1)&&!capture.held.has(1)){view.bindNote='Cancelled.';nav.held.back=true;endCapture();}
  else if(!btn(gp,1))capture.held.delete(1);
  return;}
 for(let i=0;i<gp.buttons.length&&i<17;i++){const on=btn(gp,i);
  if(on&&!capture.held.has(i)){assign('pad',capture.action,i);nav.held.ok=nav.held.back=true;endCapture();return;}
  if(!on)capture.held.delete(i);}
}

/* ---------------------------------------------------------------- audio */
let actx=null,musicEl=null;
// (7.311) iPhone Safari only starts sound inside a touch: the first touches wake the audio with a silent sound.
if(typeof document!=='undefined'){const WAKE=['touchend','pointerup','keydown'],wake=()=>{
 try{const a=ac();if(!a)return;if(a.state!=='running')a.resume();const b=a.createBufferSource();b.buffer=a.createBuffer(1,1,22050);b.connect(a.destination);b.start(0);
  if(a.state==='running')for(const t of WAKE)document.removeEventListener(t,wake,true);}catch(e){}};
 for(const t of WAKE)document.addEventListener(t,wake,true);}
function ac(){if(!save.options.sound)return null;if(!actx){try{actx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return null;}}if(actx.state==='suspended')actx.resume();return actx;}
function tone(freq,dur,type='square',vol=.05,slide=0,delay=0){
 const a=ac();if(!a)return;const t=a.currentTime+delay,o=a.createOscillator(),gn=a.createGain();
 o.type=type;o.frequency.setValueAtTime(freq,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,freq+slide),t+dur);
 gn.gain.setValueAtTime(vol,t);gn.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(gn).connect(a.destination);o.start(t);o.stop(t+dur+.02);
}
function noise(dur,vol=.05,hp=800,delay=0){
 const a=ac();if(!a)return;const t=a.currentTime+delay,n=Math.floor(a.sampleRate*dur),buf=a.createBuffer(1,n,a.sampleRate),d=buf.getChannelData(0);
 for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
 const s=a.createBufferSource(),fl=a.createBiquadFilter(),gn=a.createGain();s.buffer=buf;fl.type='highpass';fl.frequency.value=hp;gn.gain.value=vol;
 s.connect(fl).connect(gn).connect(a.destination);s.start(t);
}
const SFX={
 parry:()=>{tone(960,.13,'triangle',.06,440);noise(.05,.03,1800);},'enemy-tell':()=>tone(190,.09,'triangle',.018,70),'enemy-shot':()=>noise(.07,.02,1800),'enemy-hit':()=>noise(.08,.04,500),'guard-block':()=>tone(340,.08,'square',.03),'enemy-defeat':()=>noise(.15,.05,400),'receiver-lit':()=>tone(880,.25,'triangle',.05,440),'breach':()=>noise(.3,.07,200),
 jump:()=>tone(330,.08,'square',.035,180),walljump:()=>{tone(300,.08,'square',.035,220);noise(.05,.02,2000);},
 dash:()=>{noise(.16,.06,1200);tone(180,.12,'sawtooth',.03,-80);},
 super:()=>{tone(260,.12,'square',.04,300);noise(.1,.03,1500);},hyper:()=>{tone(220,.14,'square',.04,380);noise(.12,.04,1500);},
 wallbounce:()=>{tone(420,.14,'triangle',.05,320);},
 land:()=>noise(.05,.025,300),refill:()=>{tone(880,.08,'triangle',.05);tone(1320,.12,'triangle',.04,0,.06);},
 'refill-dash':()=>{},death:()=>{noise(.3,.08,150);tone(140,.3,'sawtooth',.05,-90);},
 'stone-hit':()=>{noise(.12,.07,200);tone(90,.12,'square',.04,-30);},'stone-stop':()=>{noise(.18,.09,120);tone(70,.2,'square',.05,-20);},
 phase:()=>tone(520,.06,'square',.03,-120),strike:()=>noise(.07,.035,3000),pod:()=>{tone(200,.1,'triangle',.06,260);noise(.06,.03,900);},
 bell:()=>{tone(660,.5,'triangle',.05);tone(990,.4,'sine',.03);},'stone-lit':()=>{tone(740,.15,'triangle',.05);tone(1110,.2,'sine',.03,0,.05);},
 'gate-open':()=>{tone(392,.3,'triangle',.05);tone(523,.3,'triangle',.05,0,.1);tone(784,.45,'triangle',.05,0,.2);},
 crumble:()=>noise(.2,.05,250),'crumble-shake':()=>noise(.08,.02,600),spring:()=>tone(240,.18,'square',.04,500),
 shard:()=>{[880,1175,1480,1760].forEach((f,i)=>tone(f,.18,'triangle',.045,0,i*.05));},
 'zip-start':()=>tone(160,.25,'sawtooth',.03,240),'zip-stop':()=>{noise(.15,.07,200);},
 pickup:()=>tone(500,.08,'triangle',.04,120),throw:()=>noise(.08,.03,1600),plate:()=>tone(300,.06,'square',.03),
 'held-open':()=>tone(250,.2,'triangle',.04,120),'held-close':()=>tone(250,.2,'triangle',.04,-100),
 'lantern-lost':()=>tone(400,.3,'sine',.03,-200),climbhop:()=>tone(360,.05,'square',.02,80),exit:()=>{},
};

/* ---------------------------------------------------------------- palettes */
const PAL={
 combat:{sky0:'#14131c',sky1:'#26212a',far:'#302c38',rock:'#454550',rockD:'#292b35',edge:'#8b8793',moss:'#677867',accent:'#b8e4d0'},
 footing:{sky0:'#10141d',sky1:'#1b2230',far:'#212a39',rock:'#3a4252',rockD:'#262c38',edge:'#6b7890',moss:'#5e7a4f',accent:'#c9a86a'},
 spent:{sky0:'#141019',sky1:'#241a2a',far:'#2d2233',rock:'#433a4d',rockD:'#2b2433',edge:'#7f6f93',moss:'#6a7d58',accent:'#e0b06a'},
 blade:{sky0:'#0f1612',sky1:'#18241c',far:'#1f2e24',rock:'#34443a',rockD:'#222d26',edge:'#6c8a70',moss:'#7fa05d',accent:'#d8c27a'},
 tally:{sky0:'#16120c',sky1:'#271f14',far:'#33291b',rock:'#4a3f2f',rockD:'#30291e',edge:'#8f7a5a',moss:'#6e7d4a',accent:'#f0c86a'},
 switch:{sky0:'#0c1418',sky1:'#132028',far:'#1a2b35',rock:'#34424c',rockD:'#212b33',edge:'#6f8796',moss:'#5c7a6a',accent:'#9fd8e0'},
 stone:{sky0:'#13110f',sky1:'#221d19',far:'#2c2621',rock:'#4a433b',rockD:'#2f2a25',edge:'#8a7e70',moss:'#6d7651',accent:'#d6b27c'},
 lantern:{sky0:'#0b1210',sky1:'#12201b',far:'#182a23',rock:'#2f3f38',rockD:'#1f2a25',edge:'#65887a',moss:'#86b06a',accent:'#b9f08a'},
 summit:{sky0:'#161220',sky1:'#2a2238',far:'#352b47',rock:'#4a4460',rockD:'#2f2b3f',edge:'#9a8fbf',moss:'#8a9a7a',accent:'#ffd48a'},
 // 7.254: one palette per later region.
 gaol:{sky0:'#101114',sky1:'#1c1d22',far:'#26272e',rock:'#4a4b52',rockD:'#2c2d33',edge:'#8d8f99',moss:'#5f6b5a',accent:'#e0c27a'},
 frost:{sky0:'#0d141c',sky1:'#18263a',far:'#223449',rock:'#4a5a6e',rockD:'#2c3848',edge:'#a8c4dc',moss:'#cfe4f2',accent:'#bfe4ff'},
 court:{sky0:'#0e1419',sky1:'#1a2630',far:'#24323e',rock:'#5a6470',rockD:'#343c46',edge:'#c8d2dc',moss:'#8ab0a8',accent:'#9fd7ff'},
 ember:{sky0:'#170c0a',sky1:'#2a1410',far:'#3a1c15',rock:'#4a3430',rockD:'#2e201d',edge:'#9a6a55',moss:'#7a4a2a',accent:'#ff9a4a'},
 foundry:{sky0:'#121112',sky1:'#221e1d',far:'#2e2824',rock:'#4d4642',rockD:'#302b28',edge:'#9a8a78',moss:'#6a5a3a',accent:'#f0b060'},
 inversion:{sky0:'#110d1a',sky1:'#1e1630',far:'#291f40',rock:'#463d5c',rockD:'#2b253a',edge:'#a898d0',moss:'#7a6aa0',accent:'#c9a0ff'},
 citadel:{sky0:'#12100e',sky1:'#221e1a',far:'#2e2924',rock:'#5a5348',rockD:'#35302a',edge:'#c8bca4',moss:'#7a7458',accent:'#ffcf6a'},
 throne:{sky0:'#0c0a10',sky1:'#18121e',far:'#22182a',rock:'#3a2e44',rockD:'#231c2a',edge:'#8a78a0',moss:'#5a4a6a',accent:'#c9b8ff'},
 deepline:{sky0:'#0d0c0b',sky1:'#1a1714',far:'#25201b',rock:'#453c33',rockD:'#2b251f',edge:'#8a7a66',moss:'#5a5040',accent:'#ffe07a'},
 cliffs:{sky0:'#0f1420',sky1:'#1e2a3e',far:'#2a3a52',rock:'#4a5462',rockD:'#2e3540',edge:'#9aa8ba',moss:'#6a8a6a',accent:'#ffe2a0'},
 shores:{sky0:'#0c1418',sky1:'#16283a',far:'#1e3448',rock:'#4a5a5a',rockD:'#2c3838',edge:'#b0c8c0',moss:'#6a9a7a',accent:'#a8dcff'},
 colony:{sky0:'#0c0d0c',sky1:'#181a17',far:'#22251f',rock:'#3e4238',rockD:'#262922',edge:'#7a806e',moss:'#5a6a48',accent:'#fff2b0'},
 palace:{sky0:'#1a1610',sky1:'#2e2718',far:'#3c3320',rock:'#6a5e44',rockD:'#443c2c',edge:'#e0d0a0',moss:'#8a9a5a',accent:'#ffd05a'},
 sunspire:{sky0:'#1e1a12',sky1:'#3a3020',far:'#4a3e28',rock:'#7a6a4a',rockD:'#4e4430',edge:'#fff0c0',moss:'#aab070',accent:'#fffbe8'},
};

/* ---------------------------------------------------------------- state */
const view={viewportW:C.W,viewportH:C.H,canvas:null,ctx:null,buf:null,b:null,scale:3,g:null,chapter:0,mode:'menu',wipe:0,wipeTo:null,shake:{x:0,y:0,t:0,mag:0},
 parts:[],trail:[],scarf:[],flash:0,paused:false,replay:null,roomTimer:0,chapterStats:null,frameAcc:0,last:0,speed:1,cardT:0,
 anim:{run:0,squash:1,stretch:1,lastState:'normal'},deathAt:null,lastPad:{},cam:{x:0,y:0},camRoom:null,trial:null};
let seedRand=1;
function rnd(){seedRand=(seedRand*16807)%2147483647;return (seedRand-1)/2147483646;}
function hash(x,y){let h=(x*374761393+y*668265263)^0x5bd1e995;h=(h^(h>>>13))*1274126177;return ((h^(h>>>16))>>>0)/4294967295;}

/* ---------------------------------------------------------------- chapter / room flow */
function chapterOf(roomIndex){let n=0;for(let c=0;c<R.chapters.length;c++){if(roomIndex<n+R.chapters[c].rooms.length)return c;n+=R.chapters[c].rooms.length;}return R.chapters.length-1;}
function chapterStart(c){let n=0;for(let i=0;i<c;i++)n+=R.chapters[i].rooms.length;return n;}
function palette(){const ch=R.chapters[view.chapter];return root.BladefallPitchView?.palette?.(ch)||PAL[ch.palette]||PAL.footing;}
function startChapter(c,roomOffset=0){
 view.chapter=c;const start=chapterStart(c)+roomOffset;
 view.g=C.createGame(R.all,{room:start,shards:save.shards,assist:save.assist});
 view.chapterStats={deaths:0,frames:0,start:performance.now()};
 SV()?.start(c,{seenBefore:!!save.cleared['chapter:'+R.chapters[c].id],assist:save.assist});
 view.mode='play';view.paused=false;view.replay=null;view.parts=[];view.trail=[];resetScarf();view.roomTimer=0;hideOverlay();
 music(true);
}
function resetScarf(){const p=view.g?view.g.p:null;view.scarf=[];for(let i=0;i<5;i++)view.scarf.push({x:p?p.x+4:0,y:p?p.y+3:0});}
function nextRoom(){
 view.replay=null;
 const g=view.g,next=g.roomIndex+1,ch=chapterOf(g.roomIndex);
 const endOfChapter=next>=chapterStart(ch)+R.chapters[ch].rooms.length;
 const id=R.chapters[ch].id;
 save.cleared[g.room.id]=true;
 if(endOfChapter){
  save.cleared['chapter:'+id]=true;const d=view.chapterStats.deaths;
  if(save.best[id]===undefined||d<save.best[id])save.best[id]=d;
  save.shards=[...g.shards];writeSave(save);
  if(view.trial){trialLevelDone(ch);return;}
  if(root.BladefallPitchView?.chapterDone?.(ch,{showOverlay,hideOverlay,startChapter,music}))return;
  if(SV()?.active()){view.mode='card';view.replay=null;view.wipe=0;view.wipeTo=null;music(false);
   const more=ch+1<R.chapters.length;
   if(SV().levelDone(ch,{showOverlay,hasNext:more,nextName:more?R.chapters[ch+1].name:'',next:()=>startChapter(ch+1),again:()=>startChapter(ch),chapters:mainMenu}))return;}
  chapterCard();return;
 }
 save.shards=[...g.shards];writeSave(save);
 C.enterRoom(g,next);view.trail=[];resetScarf();view.roomTimer=0;
}
const takeoverOK=()=>!!save.assist.testMode||!root.BladefallPitchView?.climb?.state?.();   // (7.314) a watched Survive route is not a skip
function retryRoom(){if(!view.g)return;SV()?.retry(view.g.room.id);view.replay=null;C.resetRoom(view.g);view.g.p.state='normal';view.g.p.respawnTimer=0;view.trail=[];resetScarf();}

/* ---------------------------------------------------------------- loop */
function frame(now){
 requestAnimationFrame(frame);
 const dt=Math.min(.1,(now-(view.last||now))/1000);view.last=now;
 loop(dt);
}
function pauseOrBack(){if(overlayOpen()){if(!menuBack()&&view.mode==='play')togglePause();}else togglePause();}
function loop(dt){
 const {input,pad}=currentInput(dt);
 const capturing=!!capture;pollCapture();
 const lp=view.lastPad;view.lastPad=pad;
 if(!capturing){
  const wasOpen=overlayOpen(),pauseEdge=pad.pause&&!lp.pause;
  if(pauseEdge)pauseOrBack();
  if(wasOpen&&overlayOpen()&&!pauseEdge)menuNav(pad);else if(pad.nav)Object.assign(nav.held,pad.nav);
  if(pad.retry&&!lp.retry&&view.mode==='play'&&!view.paused&&!overlayOpen())retryRoom();
  if(view.replay&&pad.any&&!lp.any&&view.mode==='play'&&!view.paused&&takeoverOK())view.replay=null;
 }else if(pad.nav)Object.assign(nav.held,pad.nav);
 if(view.mode==='play'&&!view.paused){
  view.frameAcc+=dt*(save.assist.speed||1);
  let steps=0;
  while(view.frameAcc>=1/60&&steps<5){view.frameAcc-=1/60;steps++;tick(input);}
 }else view.frameAcc=0;
 render();
}
function tick(input){
 if(view.mode!=='play'||view.paused)return;
 const g=view.g;
 if(view.wipe>0){view.wipe--;if(view.wipe===8&&view.wipeTo){view.wipeTo();view.wipeTo=null;}return;}
 view.lastInput=input;if(root.BladefallPitchView?.holding?.())return;
 let inp=input;
 if(view.replay){
  const r=view.replay;inp=keysToInput(r.frames[r.i]||'');r.i++;
  if(r.i>r.frames.length+90){if(takeoverOK())view.replay=null;else{retryRoom();root.BladefallPitchView?.climb?.announce?.('Your turn',150);return;}}
 }
 if(!view.replay)SV()?.frame(g.room.id);
 C.step(g,inp);view.chapterStats.frames++;if(g.awake!==false)view.roomTimer++;
 for(const e of g.events)handleEvent(e);
 g.events.length=0;
 updateVisuals();
}
function keysToInput(k){return {l:k.includes('l'),r:k.includes('r'),u:k.includes('u'),d:k.includes('d'),jump:k.includes('j'),dash:k.includes('x'),grab:k.includes('g'),strike:k.includes('s'),parry:k.includes('p'),portal:k.includes('q')};}

/* ---------------------------------------------------------------- events → feedback */
function burst(x,y,n,col,speed=60,life=24,grav=0,size=1){for(let i=0;i<n;i++){const a=rnd()*Math.PI*2,s=speed*(.4+rnd()*.6);view.parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life,max:life,col,grav,size});}}
function dust(x,y,n=4,dir=0){for(let i=0;i<n;i++)view.parts.push({x:x+(rnd()-.5)*6,y,vx:(rnd()-.5)*30+dir*25,vy:-rnd()*18,life:16+rnd()*8,max:24,col:'#b8b0a0',grav:10,size:1});}
function shake(mag,t=8){if(!save.options.shake)return;view.shake.mag=Math.max(view.shake.mag,mag);view.shake.t=Math.max(view.shake.t,t);}
function handleEvent(e){
 // A spatial transfer in a scrolling room must not leave its next action off-screen.
 // Ordinary travel retains the eased camera; one-screen rooms still stay at zero.
 if((e.type==='respawn'||e.type==='echo-swap'||e.type==='portal-pass'&&e.kind==='knight')&&view.g&&(view.g.room.w>W||view.g.room.h>H))view.camRoom=null;
 TOUCH()?.event(e);
 const s=SFX[e.type];if(s&&save.options.sound)s(e);
 for(const d of root.BladefallPrecisionDeviceViews||[]){if(save.options.sound)d.sfx?.[e.type]?.(e,{tone,noise});d.event?.(e,{view,burst,dust,shake,palette});}
 const pal=palette();
 switch(e.type){
  case 'parry':burst(e.x,e.y,14,'#b5ffea',70,18);shake(1.5,5);break;
  case 'enemy-pogo':burst(e.x,e.y,10,'#dfb873',60,20);break;
  case 'enemy-defeat':burst(e.x,e.y,14,'#ad897c',60,28,60);break;
  case 'receiver-lit':case 'combat-gate':burst(e.x,e.y,16,'#a8f6dc',55,28);break;
  case 'breach':burst(e.x,e.y,28,'#bb9274',80,30,100,2);shake(2,8);break;
  case 'jump':dust(e.x,e.y,4);view.anim.stretch=1.35;break;
  case 'super':case 'hyper':dust(e.x,e.y,8,sign(view.g.p.vx));view.anim.stretch=1.3;break;
  case 'walljump':dust(e.x,e.y,5,e.dir);break;
  case 'wallbounce':burst(e.x,e.y,8,'#ffe2a0',50,18);break;
  case 'land':dust(e.x,e.y,Math.min(8,2+e.speed/40|0));view.anim.squash=Math.min(1.45,1+e.speed/400);break;
  case 'dash':shake(1.5,6);view.flash=2;burst(e.x,e.y,6,'#ffffff',40,12);break;
  case 'refill':burst(e.x,e.y,10,'#8ff0b0',50,22);break;
  case 'death':burst(e.x,e.y,18,'#ffb347',90,30,40,2);burst(e.x,e.y,10,'#cfd8e6',60,30,60,1);shake(3,12);view.deathAt={x:e.x,y:e.y,t:0};view.chapterStats.deaths++;if(view.g&&!view.replay)SV()?.death(view.g.room.id);break;
  case 'respawn':view.trail=[];resetScarf();break;
  case 'stone-hit':shake(2.5,8);dust(e.x-(e.dx||0)*8,e.y,6);break;
  case 'stone-stop':shake(3,10);burst(e.x,e.y,10,'#a89a88',50,24,80);break;
  case 'phase':view.flash=1;break;
  case 'pod':burst(e.x,e.y,8,'#d9c37a',60,20,60);shake(1.5,5);break;
  case 'bell':burst(e.x,e.y,10,'#f2d58a',40,30);break;
  case 'stone-lit':burst(e.x,e.y,12,pal.accent,45,28);break;
  case 'gate-open':burst(e.x,e.y,24,pal.accent,70,40,0,1);shake(2,10);break;
  case 'crumble':for(let i=0;i<e.w/4;i++)view.parts.push({x:e.x-e.w/2+rnd()*e.w,y:e.y+rnd()*8,vx:(rnd()-.5)*20,vy:rnd()*20,life:30,max:30,col:pal.rock,grav:300,size:2});break;
  case 'spring':dust(e.x,e.y+3,5);break;
  case 'shard':burst(e.x,e.y,20,'#ffd6f0',70,40);shake(1,4);break;
  case 'zip-stop':shake(2.5,8);break;
  case 'lantern-lost':burst(e.x,e.y,8,'#b9f08a',30,30);break;
  case 'exit':beginExit();break;
 }
}
function beginExit(){if(root.BladefallPitchView?.exit?.(view,nextRoom))return;view.wipe=16;view.wipeTo=nextRoom;}
function sign(v){return v>0?1:v<0?-1:0;}
function updateVisuals(){
 const g=view.g,p=g.p;
 for(const q of view.parts){q.x+=q.vx/60;q.y+=q.vy/60;q.vy+=q.grav/60;q.life--;}
 view.parts=view.parts.filter(q=>q.life>0);
 // Dash afterimages
 if(p.state==='dash'&&g.frame%2===0)view.trail.push({x:p.x,y:p.y,f:p.facing,life:14,col:p.dashes>0?'#ffb347':'#6f8cae'});
 for(const t of view.trail)t.life--;view.trail=view.trail.filter(t=>t.life>0);
 // Scarf follows the helm
 const head={x:p.x+4-p.facing*2,y:p.y+3};let prev=head;
 for(let i=0;i<view.scarf.length;i++){const n=view.scarf[i];const tx=prev.x-p.facing*1.5,ty=prev.y+.6;n.x+=(tx-n.x)*.55;n.y+=(ty-n.y)*.55;const dx=n.x-prev.x,dy=n.y-prev.y,d=Math.hypot(dx,dy);if(d>2){n.x=prev.x+dx/d*2;n.y=prev.y+dy/d*2;}prev=n;}
 view.anim.squash+=(1-view.anim.squash)*.25;view.anim.stretch+=(1-view.anim.stretch)*.25;
 if(p.onGround&&Math.abs(p.vx)>10)view.anim.run+=Math.abs(p.vx)/600;
 if(view.shake.t>0){view.shake.t--;view.shake.x=(rnd()-.5)*2*view.shake.mag;view.shake.y=(rnd()-.5)*2*view.shake.mag;if(view.shake.t===0)view.shake.mag=0;}else{view.shake.x=view.shake.y=0;}
 if(view.flash>0)view.flash--;
 if(view.deathAt){view.deathAt.t++;if(view.deathAt.t>40)view.deathAt=null;}
}

/* ---------------------------------------------------------------- drawing */
function px(b,x,y,w,h,col){b.fillStyle=col;b.fillRect(Math.round(x),Math.round(y),w,h);}
function drawBackground(b,pal){
 if(root.BladefallPitchView?.background(b,pal,view,W,H))return;
 const gr=b.createLinearGradient(0,0,0,H);gr.addColorStop(0,pal.sky0);gr.addColorStop(1,pal.sky1);b.fillStyle=gr;b.fillRect(0,0,W,H);
 // Distant arches and pillars, fixed per chapter.
 const seed=view.chapter*97+3;
 // Far masonry is kept dim and edgeless so nothing in the backdrop reads as a foothold.
 b.fillStyle=pal.far;b.globalAlpha=.32;
 for(let i=0;i<7;i++){const x=Math.floor(hash(i,seed)*W),w=10+Math.floor(hash(seed,i)*16),top=40+Math.floor(hash(i*3,seed)*70);b.fillRect(x,top,w,H-top);}
 b.globalAlpha=.2;for(let i=0;i<4;i++){const x=Math.floor(hash(i+20,seed)*W),r=18+hash(seed,i+9)*20,top=30+hash(i,seed+5)*40;b.beginPath();b.arc(x,top+r,r,Math.PI,0);b.lineWidth=5;b.strokeStyle=pal.far;b.stroke();}b.globalAlpha=1;
 // Drifting motes
 const t=view.g?view.g.frame:0;b.fillStyle=pal.accent;b.globalAlpha=.25;
 for(let i=0;i<14;i++){const x=(hash(i,seed+1)*W+t*(.05+hash(i,2)*.1))%W,y=(hash(seed,i+4)*H+Math.sin(t/60+i)*6+H)%H;b.fillRect(x|0,y|0,1,1);}
 b.globalAlpha=1;
}
function solidTile(g,c,r){const RC=g.room.cols||COLS,RR=g.room.rows||ROWS;if(c<0||c>=RC)return true;if(r<0)return g.room.exit!=='up'&&g.room.def.side!=='up';if(r>=RR)return false;return g.room.grid[r*RC+c]===SOLID;}
function drawTiles(b,g,pal){
 const COLS=g.room.cols||C.COLS,ROWS=g.room.rows||C.ROWS;
 for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
  const t=g.room.grid[r*COLS+c],x=c*TILE,y=r*TILE;
  if(t===SOLID){
   const open={u:!solidTile(g,c,r-1),d:!solidTile(g,c,r+1),l:!solidTile(g,c-1,r),rt:!solidTile(g,c+1,r)};
   const exposed=open.u||open.d||open.l||open.rt;
   px(b,x,y,8,8,exposed?pal.rock:pal.rockD);
   // Masonry texture
   const h=hash(c,r);if(exposed){if(h>.6)px(b,x+1+(h*5|0),y+3,2,1,pal.rockD);if(h<.3)px(b,x+2,y+5+(h*6|0)%2,3,1,pal.rockD);}
   else if(h>.8)px(b,x+(h*6|0),y+(h*13|0)%7,1,1,pal.rock);
   if(open.u){px(b,x,y,8,1,pal.edge);if(hash(c,r+99)>.45){px(b,x+(hash(c,r+3)*5|0),y,3,2,pal.moss);px(b,x+(hash(c,r+7)*7|0),y+2,1,1,pal.moss);}}
   if(open.l)px(b,x,y,1,8,pal.edge);
   if(open.rt)px(b,x+7,y,1,8,pal.edge);
   if(open.d)px(b,x,y+7,8,1,'#00000055');
  }else if(t===THRU){px(b,x,y,8,2,pal.edge);px(b,x,y+2,8,1,pal.rockD);if((c+r)%2===0)px(b,x+3,y+3,2,3,pal.rockD);}
  else if(t>=SPIKE_UP)drawSpike(b,t,x,y);
 }
}
/* Tiles never change inside a room, so the masonry, backwall and roots are drawn once. */
// Several rooms at once: the Climb (7.265) draws the sections around the knight as well as his own.
// room.rev changes when a room's tiles change while it is played (a Climb seam closing behind the knight).
const staticCache=new Map();
function drawStatic(b,g,pal,localCamera){
 const terrain=g.room.def.atlasTerrain;
 if(!terrain){b.drawImage(staticLayer(g,pal),0,0);if(root.BladefallClimb?.geography)root.BladefallClimbPassageArt?.details(b,g);return;}
 pal=root.BladefallClimbPassageArt.terrainPalette(g.room.def,pal);
 const geo=root.BladefallClimb?.geography,where=geo?.rooms.get(g.room.id),camera=view.pitch?.cam||{x:0,y:0};
 const cam=localCamera||(where?{x:camera.x-where.x*8,y:camera.y-where.y*8}:view.cam);
 const c0=Math.max(0,Math.floor(cam.x/8)-2),c1=Math.min(g.room.cols,Math.ceil((cam.x+W)/8)+2),r0=Math.max(0,Math.floor(cam.y/8)-2),r1=Math.min(g.room.rows,Math.ceil((cam.y+H)/8)+2);
 const style=g.room.def.atlasTransit.style,covered=['roots','canopy','spillway','chains','procession'].includes(style);
 for(let r=r0;r<r1;r++)for(const [start,end] of terrain.spans[r])for(let c=Math.max(c0,start);c<Math.min(c1,end);c++){
  const tile=g.room.grid[r*g.room.cols+c],x=c*8,y=r*8;
  if(tile===SOLID){
   b.fillStyle=pal.rockD;b.fillRect(x,y,8,8);
   if(r>0&&g.room.grid[(r-1)*g.room.cols+c]!==SOLID){b.fillStyle=pal.edge;b.fillRect(x,y,8,1);if(hash(c,r)>.55){b.fillStyle=pal.moss;b.fillRect(x+3,y-2,1,3);}}
   b.fillStyle=pal.rock;b.fillRect(x+1,y+3,5,1);
  }else if(tile===THRU){b.fillStyle=pal.rock;b.fillRect(x,y,8,3);b.fillStyle=pal.edge;b.fillRect(x,y,8,1);}
  else if(covered){b.fillStyle=pal.rockD;b.globalAlpha=.25;b.fillRect(x,y,8,8);b.globalAlpha=1;}
 }
 // Landmarks follow the actual road instead of the room's bounding rectangle.
 // Their spacing is measured along the route, including its vertical shafts.
 for(let i=24;i<terrain.path.length-16;i+=112){
  const p=terrain.path[i],x=p.c*8,y=p.r*8;if(x<cam.x-80||x>cam.x+W+80||y<cam.y-70||y>cam.y+H+80)continue;
  b.save();b.globalAlpha=.45;b.strokeStyle=pal.edge;b.lineWidth=2;
  if(style==='roots'||style==='canopy'){
   b.strokeStyle=pal.moss;b.beginPath();b.moveTo(x-28,y+16);b.bezierCurveTo(x-42,y-70,x+43,y-65,x+30,y+8);b.stroke();
   for(let j=0;j<4;j++){b.fillStyle=pal.moss;b.fillRect(x-22+j*13,y-42-(j%2)*7,6,2);}
  }else if(style==='thaw'||style==='glass'){
   b.fillStyle=pal.edge;b.beginPath();b.moveTo(x-30,y-4);b.lineTo(x-24,y-31);b.lineTo(x-16,y-8);b.closePath();b.fill();
   b.fillStyle='#cde8f0';b.fillRect(x-25,y-20,1,15);
  }else if(style==='chains'){
   for(let j=0;j<8;j++)b.strokeRect(x+25,y-64+j*8,3,5);
   b.strokeRect(x+12,y-22,26,20);b.beginPath();b.moveTo(x+20,y-22);b.lineTo(x+20,y-2);b.moveTo(x+29,y-22);b.lineTo(x+29,y-2);b.stroke();
  }else{
   b.beginPath();b.moveTo(x-30,y+8);b.lineTo(x-30,y-14);b.bezierCurveTo(x-30,y-54,x+30,y-54,x+30,y-14);b.lineTo(x+30,y+8);b.stroke();
   if(style==='belltower'){b.fillStyle='#b89b65';b.beginPath();b.moveTo(x-5,y-39);b.lineTo(x+5,y-39);b.lineTo(x+9,y-26);b.lineTo(x-9,y-26);b.closePath();b.fill();}
   if(style==='aqueduct'||style==='spillway'){b.strokeStyle='#77aaa5';b.beginPath();b.moveTo(x+20,y-45);b.lineTo(x+20,y+6);b.stroke();}
  }
  b.restore();
 }
 root.BladefallClimbPassageArt?.details(b,g,cam);
}
function staticLayer(g,pal){
 const key=g.room.id+'|'+view.chapter+'|'+(g.flipped?1:0)+'|'+(g.room.rev||0);
 const hit=staticCache.get(key);if(hit)return hit;
 // A room larger than the screen (merge pitches) gets a layer its own size; the camera picks the window.
 const COLS=g.room.cols||C.COLS,ROWS=g.room.rows||C.ROWS,W=COLS*TILE,H=ROWS*TILE;
 const cv=document.createElement('canvas');cv.width=W;cv.height=H;const b=cv.getContext('2d');b.clearRect(0,0,W,H);
 // Backwall: dark masonry in the hollows next to rock, so a room reads as a carved space, not a void.
 const near=(c,r,d)=>{for(let y=-d;y<=d;y++)for(let x=-d;x<=d;x++)if(solidTile(g,c+x,r+y)&&c+x>=0&&c+x<COLS&&r+y>=0&&r+y<ROWS)return true;return false;};
 for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
  if(g.room.grid[r*COLS+c]!==0||g.room.def.pocket||g.room.def.atlasTransit)continue;   // a pocket's air is the base game's world
  const d1=near(c,r,1),d2=d1||near(c,r,2);if(!d2)continue;
  const x=c*TILE,y=r*TILE;b.globalAlpha=d1?.55:.28;b.fillStyle=pal.rockD;b.fillRect(x,y,8,8);
  b.globalAlpha=d1?.35:.18;b.fillStyle='#000';b.fillRect(x,y+((c+r)%2?3:7),8,1);b.fillRect(x+((r%2)?2:6),y,1,((c+r)%2?3:7));
 }
 b.globalAlpha=1;
 drawTiles(b,g,pal);
 // Hanging roots under overhangs and tufts on ledges.
 for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
  if(g.room.grid[r*COLS+c]!==SOLID)continue;const x=c*TILE,y=r*TILE;
  if(r+1<ROWS&&g.room.grid[(r+1)*COLS+c]===0&&hash(c,r+31)>.72){const len=2+Math.floor(hash(c,r+7)*7),xx=x+1+Math.floor(hash(r,c)*6);b.fillStyle=pal.moss;b.globalAlpha=.8;b.fillRect(xx,y+8,1,len);if(len>4)b.fillRect(xx+1,y+8+len-2,1,2);b.globalAlpha=1;}
  if(r>0&&g.room.grid[(r-1)*COLS+c]===0&&hash(c+5,r)>.8){b.fillStyle=pal.moss;b.fillRect(x+2+Math.floor(hash(c,r+2)*4),y-2,1,2);b.fillRect(x+4+Math.floor(hash(c,r+3)*3),y-1,1,1);}
 }
 if(!g.room.def.atlasTransit)root.BladefallClimbArt?.terrain(b,g,pal);
 root.BladefallClimbPassageArt?.terrain(b,g);
 staticCache.set(key,cv);if(staticCache.size>12)staticCache.delete(staticCache.keys().next().value);return cv;
}
function drawSpike(b,t,x,y){
 const bone='#d9d4c7',dark='#8a8375';
 for(let i=0;i<2;i++){
  if(t===SPIKE_UP){px(b,x+i*4+1,y+5,2,3,dark);px(b,x+i*4+1,y+4,2,1,bone);px(b,x+i*4+1,y+5,1,2,bone);}
  else if(t===SPIKE_DOWN){px(b,x+i*4+1,y,2,3,dark);px(b,x+i*4+1,y+3,2,1,bone);px(b,x+i*4+1,y+1,1,2,bone);}
  else if(t===SPIKE_LEFT){px(b,x+5,y+i*4+1,3,2,dark);px(b,x+4,y+i*4+1,1,2,bone);px(b,x+5,y+i*4+1,2,1,bone);}
  else {px(b,x,y+i*4+1,3,2,dark);px(b,x+3,y+i*4+1,1,2,bone);px(b,x+1,y+i*4+1,2,1,bone);}
 }
}
function drawEntities(b,g,pal){
 const t=g.frame,stonesLeft=g.ents.filter(e=>e.type==='stone'&&!e.lit).length;
 // Connectors first, under everything: plates to held gates, zips to targets.
 for(const e of g.ents){
  if(e.type==='zip'){b.strokeStyle='#5b5344';b.setLineDash([2,2]);b.beginPath();b.moveTo(e.ox+e.w/2+.5,e.oy+e.h/2+.5);b.lineTo(e.tx+e.w/2+.5,e.ty+e.h/2+.5);b.stroke();b.setLineDash([]);
   px(b,e.tx+e.w/2-1,e.ty+e.h/2-1,3,3,'#6d6552');}
  if(e.type==='plate'){for(const h of g.ents.filter(q=>q.type==='held')){b.strokeStyle=e.down?'#e8c46a88':'#6a5a3a88';b.setLineDash([1,3]);b.beginPath();b.moveTo(e.x+4.5,e.y+2.5);b.lineTo(e.x+4.5,Math.min(e.y+4,H-1)+.5);b.lineTo(h.x+h.w/2+.5,Math.min(e.y+4,H-1)+.5);b.lineTo(h.x+h.w/2+.5,h.y+h.h+.5);b.stroke();b.setLineDash([]);}}
 }
 // Machinery and blocks first, so small things (a stone sealed inside a pillar) stay visible.
 const BACK={toggle:0,gate:0,held:0,crumble:0,zip:0,slide:0,thru:0,plate:1};
 const order=g.ents.slice().sort((a,b)=>(BACK[a.type]??2)-(BACK[b.type]??2));
 for(const e of order){
  if(e.gone)continue;
  switch(e.type){
   case 'refill':{
    if(e.timer>0){b.strokeStyle='#3f6b52';b.beginPath();b.moveTo(e.x+4.5,e.y+.5);b.lineTo(e.x+7.5,e.y+4.5);b.lineTo(e.x+4.5,e.y+7.5);b.lineTo(e.x+1.5,e.y+4.5);b.closePath();b.stroke();break;}
    const bob=Math.round(Math.sin(t/14+e.x)*1);
    b.fillStyle='#8ff0b0';b.beginPath();b.moveTo(e.x+4,e.y-1+bob);b.lineTo(e.x+8,e.y+4+bob);b.lineTo(e.x+4,e.y+9+bob);b.lineTo(e.x,e.y+4+bob);b.closePath();b.fill();
    px(b,e.x+3,e.y+2+bob,2,4,'#e8fff0');px(b,e.x+2,e.y+4+bob,1,1,'#3f9c68');
    if(t%40<4)px(b,e.x+6,e.y+bob,1,1,'#ffffff');
    break;}
   case 'stone':{
    // A standing rune stone: dim with a slow pulse until lit, then bright with a halo.
    const lit=e.lit,pulse=(Math.sin(t/12)+1)/2;
    if(!lit){b.globalAlpha=.18+.22*pulse;b.fillStyle=pal.accent;b.fillRect(e.x-1,e.y-1,10,10);b.globalAlpha=1;}
    px(b,e.x+1,e.y+1,6,7,lit?pal.accent:'#6d6552');px(b,e.x+2,e.y,4,1,lit?pal.accent:'#6d6552');
    px(b,e.x+1,e.y+7,6,1,lit?'#8a6a2a':'#3e392f');
    px(b,e.x+3,e.y+2,2,1,lit?'#fff4d0':'#c9b27a');px(b,e.x+2,e.y+3,1,2,lit?'#fff4d0':'#c9b27a');px(b,e.x+5,e.y+3,1,2,lit?'#fff4d0':'#c9b27a');px(b,e.x+3,e.y+5,2,1,lit?'#fff4d0':'#c9b27a');
    if(lit){b.globalAlpha=.25+.1*Math.sin(t/10);px(b,e.x-2,e.y-2,12,12,pal.accent);b.globalAlpha=1;}
    break;}
   case 'gate':{
    if(e.open){if(e.t<24){b.globalAlpha=1-e.t/24;drawBars(b,e,pal.accent,'#40361f');b.globalAlpha=1;}break;}
    drawBars(b,e,'#8f8468','#2a251c');
    // One pip per unlit stone.
    const total=g.ents.filter(s=>s.type==='stone').length;
    for(let i=0;i<total;i++)px(b,e.x+e.w/2-total*2+i*4+1,e.y+2,2,2,i<total-stonesLeft?pal.accent:'#4a4230');
    break;}
   case 'held':{
    if(!e.solid){b.globalAlpha=.25;drawBars(b,e,'#c9a24f','#3a2f1a');b.globalAlpha=1;px(b,e.x,e.y,e.w,2,'#c9a24f');break;}
    drawBars(b,e,'#b08a45','#2a2116');break;}
   case 'plate':px(b,e.x,e.y+(e.down?1:0),8,e.down?1:2,e.down?'#e8c46a':'#a0864a');px(b,e.x-1,e.y+2,10,1,'#4a3e28');break;
   case 'toggle':{
    const cyan=e.phase===0,base=cyan?'#4fc3d9':'#e3a148',dark=cyan?'#1e5563':'#6b4318';
    if(e.solid){px(b,e.x,e.y,e.w,e.h,dark);b.strokeStyle=base;b.strokeRect(e.x+.5,e.y+.5,e.w-1,e.h-1);
     for(let yy=e.y+3;yy<e.y+e.h-2;yy+=4)for(let xx=e.x+3;xx<e.x+e.w-2;xx+=4)px(b,xx,yy,1,1,base);}
    else{b.strokeStyle=base+(e.pending&&t%8<4?'ff':'55');b.setLineDash([2,2]);b.strokeRect(e.x+.5,e.y+.5,e.w-1,e.h-1);b.setLineDash([]);}
    break;}
   case 'slide':{
    const sx=e.moving?Math.round(rnd()-.5):0,x=e.x+sx,y=e.y,w=e.w,h=e.h;
    px(b,x,y,w,h,'#4d463d');px(b,x+1,y+1,w-2,h-2,'#6a6052');
    px(b,x,y,w,1,'#b0a28a');px(b,x,y,1,h,'#8f836f');px(b,x+w-1,y,1,h,'#3a342c');px(b,x,y+h-1,w,1,'#2e2923');
    // Chevrons on every face point outward: dash into a face and the stone runs away from you.
    const cx=x+w/2,cy=y+h/2,ink='#2e2923',gold='#d6b27c';
    px(b,cx-1,y+2,2,1,ink);px(b,cx-2,y+3,4,1,ink);
    px(b,cx-1,y+h-3,2,1,ink);px(b,cx-2,y+h-4,4,1,ink);
    px(b,x+2,cy-1,1,2,ink);px(b,x+3,cy-2,1,4,ink);
    px(b,x+w-3,cy-1,1,2,ink);px(b,x+w-4,cy-2,1,4,ink);
    px(b,cx-1,cy-1,2,2,gold);
    break;}
   case 'zip':{
    px(b,e.x,e.y,e.w,e.h,'#3d3a33');b.strokeStyle='#8c8062';b.strokeRect(e.x+.5,e.y+.5,e.w-1,e.h-1);
    const on=e.state==='go'||e.state==='wind'||e.state==='hold';
    const cx=e.x+e.w/2,cy=e.y+e.h/2,a=t/(on?3:20);
    for(let k=0;k<4;k++){const ang=a+k*Math.PI/2;px(b,Math.round(cx+Math.cos(ang)*3)-1,Math.round(cy+Math.sin(ang)*3)-1,2,2,'#b8a67a');}
    px(b,cx-1,cy-1,2,2,on?'#ff7a4a':e.state==='back'?'#e0b050':'#7bd88a');
    px(b,e.x,e.y,e.w,1,'#b8a67a');
    break;}
   case 'thru':{
    // Atlas junctions have their own decorated platforms; ordinary rooms still need a visible top.
    if(g.room.def.atlasJunction)break;
    px(b,e.x,e.y,e.w,1,pal.edge);px(b,e.x,e.y+1,e.w,2,pal.rock);
    for(let x=3;x<e.w;x+=8)px(b,e.x+x,e.y+3,2,2,pal.rockD);
    break;}
   case 'crumble':{
    if(e.broken){b.strokeStyle='#ffffff18';b.strokeRect(e.x+.5,e.y+.5,e.w-1,e.h-1);break;}
    const jx=e.shaking>0?(rnd()-.5)*2:0;
    for(let x=0;x<e.w;x+=8){px(b,e.x+x+jx,e.y,8,e.h,pal.rock);px(b,e.x+x+jx,e.y,8,1,pal.edge);px(b,e.x+x+2+jx,e.y+2,1,3,pal.rockD);px(b,e.x+x+3+jx,e.y+4,2,1,pal.rockD);px(b,e.x+x+6+jx,e.y+1,1,2,pal.rockD);}
    break;}
   case 'pod':{
    const ready=e.timer===0,sw=Math.round(Math.sin(t/20+e.x)*1);
    px(b,e.x+4,e.y-4,1,5,'#4a5a38');px(b,e.x+3,e.y-4,3,1,'#4a5a38');
    if(ready){px(b,e.x+1+sw,e.y,6,8,'#c9a84a');px(b,e.x+sw,e.y+2,8,4,'#c9a84a');px(b,e.x+2+sw,e.y+1,2,3,'#f3dc8a');px(b,e.x+2+sw,e.y+7,4,1,'#7a5a24');px(b,e.x+5+sw,e.y+3,1,3,'#9a7a34');
     if(t%50<3)px(b,e.x+6+sw,e.y,1,1,'#fff6c0');}
    else{px(b,e.x+3,e.y+1,2,4,'#5d5a3a');px(b,e.x+2,e.y+2,1,2,'#5d5a3a');}
    break;}
   case 'bell':{
    const sw=e.timer>0?Math.round(Math.sin(e.timer)*2):0;
    px(b,e.x+1,e.y-2,6,1,'#5b4a30');px(b,e.x+4,e.y-1,1,2,'#5b4a30');
    px(b,e.x+2+sw,e.y+1,4,5,'#d4a94c');px(b,e.x+1+sw,e.y+5,6,2,'#d4a94c');px(b,e.x+3+sw,e.y+2,1,3,'#f6e0a0');px(b,e.x+3+sw,e.y+7,2,1,'#6b5220');
    break;}
   case 'spring':{const c=e.timer>0;px(b,e.x+1,e.y+(c?1:-2),6,1,'#c9a86a');px(b,e.x+2,e.y+(c?2:-1),1,c?1:3,'#6a8a4a');px(b,e.x+5,e.y+(c?2:-1),1,c?1:3,'#6a8a4a');px(b,e.x,e.y+2,8,1,'#4a3e28');break;}
   case 'shard':{
    const bob=Math.round(Math.sin(t/12)*1.5),x=e.x,y=e.y+bob;
    b.fillStyle='#ffc6e8';b.beginPath();b.moveTo(x+4,y-1);b.lineTo(x+7,y+3);b.lineTo(x+4,y+9);b.lineTo(x+1,y+3);b.closePath();b.fill();
    px(b,x+3,y+1,2,5,'#fff0fa');if(t%30<3)px(b,x+7,y-1,1,1,'#ffffff');
    break;}
   case 'lantern':{
    if(e.returning){b.globalAlpha=.4*(e.timer/40);}
    const x=e.x,y=e.y;px(b,x+3,y-1,2,1,'#6b5a3a');px(b,x+1,y,6,1,'#6b5a3a');
    px(b,x+1,y+1,6,6,'#2f4a2a');px(b,x+2,y+2,4,4,'#b9f08a');px(b,x+3,y+3,2,2,'#effff0');px(b,x+1,y+7,6,1,'#6b5a3a');
    b.globalAlpha=.12;b.fillStyle='#b9f08a';b.beginPath();b.arc(x+4,y+4,9+Math.sin(t/9),0,Math.PI*2);b.fill();b.globalAlpha=1;
    break;}
  }
 }
}
function drawBars(b,e,light,dark){
 px(b,e.x,e.y,e.w,e.h,dark);
 for(let x=e.x+1;x<e.x+e.w-1;x+=3)px(b,x,e.y,1,e.h,light);
 px(b,e.x,e.y,e.w,1,light);px(b,e.x,e.y+e.h-1,e.w,1,light);
 for(let y=e.y+6;y<e.y+e.h-1;y+=10)px(b,e.x,y,e.w,1,light);
}
function scarfColor(p){if(p.dashFlash>0&&p.dashFlash%4<2)return '#ffffff';return p.dashes>0?'#ffb347':'#56708c';}
function drawKnight(b,g){
 const p=g.p;if(p.state==='dead')return;
 if(p.state==='respawn'){const k=p.respawnTimer/10;b.globalAlpha=1-k;}
 // Afterimages
 for(const t of view.trail){b.globalAlpha=t.life/14*.5;drawKnightSprite(b,t.x,t.y,t.f,'dash',t.col,t.col,1,1,0);}
 b.globalAlpha=p.state==='respawn'?1-p.respawnTimer/10:1;
 const scarf=scarfColor(p);
 // Scarf behind the body
 for(let i=view.scarf.length-1;i>=0;i--){const n=view.scarf[i],s=i<4?2:1;px(b,n.x-s/2,n.y-s/2,s,s,scarf);}
 let pose=p.state==='climb'?'climb':p.state==='dash'?'dash':!p.onGround?(p.vy<0?'rise':'fall'):Math.abs(p.vx)>10?'run':'idle';
 const tired=p.stamina<20&&(p.state==='climb'||p.stamina<20&&g.frame%10<5);
 const body=tired&&g.frame%6<3?'#c05050':'#2d4a78';
 drawKnightSprite(b,p.x,p.y,p.facing,pose,body,scarf,view.anim.squash,view.anim.stretch,view.anim.run);
 // Blade strike arc
 if(p.strikeTimer>0){
  const d=p.strikeDir,k=p.strikeTimer/5;b.strokeStyle=`rgba(255,244,214,${.4+.6*k})`;b.lineWidth=2;b.beginPath();
  const cx=p.x+4+d.x*9,cy=p.y+5+d.y*9,start=Math.atan2(d.y,d.x)-1.2,end=Math.atan2(d.y,d.x)+1.2;
  b.arc(cx-d.x*5,cy-d.y*5,9,start,end);b.stroke();b.lineWidth=1;
 }
 b.globalAlpha=1;
}
function drawKnightSprite(b,x,y,f,pose,body,scarf,squash,stretch,run){
 // 8x11 box; sprite drawn from the feet so squash keeps the knight grounded.
 const sy=Math.min(1.35,stretch)/Math.max(1,squash),sx=Math.max(1,squash)/Math.min(1.35,stretch);
 const hgt=Math.round(11*sy),wid=Math.max(6,Math.round(8*sx)),bx=x+4-wid/2,by=y+11-hgt;
 const helm='#b9c2cf',helmD='#7c8796',skin='#1a1f28';
 if(pose==='dash'&&body===scarf){px(b,bx,by,wid,hgt,body);return;}
 const leg=pose==='run'?Math.floor(run)%2:0;
 // legs
 px(b,bx+1,by+hgt-2,2,2,'#1c2130');px(b,bx+wid-3,by+hgt-2,2,2,'#1c2130');
 if(pose==='run'){px(b,bx+(leg?0:2),by+hgt-1,2,1,'#1c2130');}
 // body
 px(b,bx+1,by+4,wid-2,hgt-6,body);px(b,bx+1,by+4,wid-2,1,'#4a6aa0');
 // belt + sword hilt
 px(b,bx+1,by+hgt-4,wid-2,1,'#6b4e2a');px(b,f>0?bx:bx+wid-1,by+hgt-6,1,4,'#c9ced8');
 // helm with visor slit facing
 px(b,bx+1,by,wid-2,5,helm);px(b,bx+1,by+4,wid-2,1,helmD);px(b,f>0?bx+wid-4:bx+2,by+2,2,1,skin);
 // plume tuft carries the dash colour too
 px(b,bx+wid/2-1,by-2,2,2,scarf);px(b,f>0?bx+1:bx+wid-3,by+4,2,1,scarf);
 if(pose==='climb'){px(b,f>0?bx+wid-1:bx,by+3,1,3,helm);}
 if(pose==='rise')px(b,f>0?bx:bx+wid-1,by+3,1,2,helm);
}
function drawParticles(b){for(const q of view.parts){b.globalAlpha=Math.min(1,q.life/q.max*1.5);px(b,q.x,q.y,q.size,q.size,q.col);}b.globalAlpha=1;}

/* A room larger than one screen (merge pitches) scrolls: the camera follows the knight and stops at the
   room's edges. A one-screen room keeps the camera at 0, exactly as before. */
function updateCamera(g){
 if(root.BladefallPitchView?.camera?.(g,view))return;   // the Climb: one camera over the whole world
 const rw=g.room.w||W,rh=g.room.h||H,p=g.p;
 if(rw<=W&&rh<=H){view.cam.x=view.cam.y=0;view.camRoom=g.room.id;return;}
 const tx=Math.max(0,Math.min(rw-W,p.x+4-W/2)),ty=Math.max(0,Math.min(rh-H,p.y+5-H*.55));
 if(view.camRoom!==g.room.id){view.cam.x=tx;view.cam.y=ty;view.camRoom=g.room.id;return;}
 view.cam.x+=(tx-view.cam.x)*.18;view.cam.y+=(ty-view.cam.y)*.14;
}
function render(){
 const cv=view.canvas,ctx=view.ctx,b=view.b;
 // On a touch screen the canvas runs at device pixels (crisp pixel art that fills the height); elsewhere as before.
 const dpr=touchUI()?Math.min(3,window.devicePixelRatio||1):1;view.dpr=dpr;
 const sw=Math.round(window.innerWidth*dpr),sh=Math.round(window.innerHeight*dpr);if(cv.width!==sw||cv.height!==sh){cv.width=sw;cv.height=sh;}
 ctx.imageSmoothingEnabled=false;
 const PV=root.BladefallPitchView,pocket=PV&&PV.pocket&&PV.pocket();
 if(pocket)ctx.clearRect(0,0,sw,sh);else{ctx.fillStyle='#07080b';ctx.fillRect(0,0,sw,sh);}
 const full=(touchUI()||window.matchMedia('(pointer:coarse)').matches)&&window.innerWidth>=window.innerHeight&&!pocket;
 W=full?Math.ceil(sw/(sh/H)):C.W;view.viewportW=W;view.viewportH=H;
 if(view.buf.width!==W){view.buf.width=W;view.b.imageSmoothingEnabled=false;}
 const fit=Math.min(sw/W,(sh-8*dpr)/H);
 const scale=pocket?pocket.scale*dpr:full?sh/H:dpr>1?(fit>=3?Math.floor(fit):fit):Math.max(1,Math.floor(fit));view.scale=scale;
 const ox=pocket?pocket.ox*dpr:Math.floor((sw-W*scale)/2),oy=pocket?pocket.oy*dpr:Math.floor((sh-H*scale)/2);
 if(!view.g){return;}
 const g=view.g,pal=palette();
 updateCamera(g);
 drawBackground(b,pal);
 b.save();b.translate(Math.round(view.shake.x),Math.round(view.shake.y));
 b.translate(-Math.round(view.cam.x),-Math.round(view.cam.y));
 // Device views (7.254) draw behind the entities, among them, and in front of the knight. A room whose
 // gravity is flipped is simulated mirrored; drawing it under a vertical flip puts it back upright.
 const DV=root.BladefallPrecisionDeviceViews||[];
 if(g.flipped){b.translate(0,H);b.scale(1,-1);}
 const sharedTerrain=PV?.drawWorld?.(b,g,view,pal);
 if(!sharedTerrain)drawStatic(b,g,pal);for(const d of DV)d.drawBack?.(b,g,view,pal);
 drawEntities(b,g,pal);PV?.draw(b,g,view);root.BladefallPrecisionCombatView?.draw(b,g);root.BladefallPrecisionFoesView?.draw(b,g);root.BladefallPrecisionPortalsView?.draw(b,g,view);
 for(const d of DV)d.draw?.(b,g,view,pal);
 drawKnight(b,g);
 for(const d of DV)d.drawFront?.(b,g,view,pal);
 drawParticles(b);
 b.restore();
 if(view.flash>0){b.globalAlpha=.08;b.fillStyle='#ffffff';b.fillRect(0,0,W,H);b.globalAlpha=1;}
 if(view.wipe>0){const k=view.wipe>8?(16-view.wipe)/8:view.wipe/8;b.fillStyle='#07080b';b.fillRect(0,0,Math.ceil(W*k),H);}
 // Merge pitches: a slide between screens (Celeste's camera), drawn from the old room's last frame.
 const src=PV&&PV.slideFrame?PV.slideFrame(view.buf,W,H)||view.buf:view.buf;
 ctx.drawImage(src,ox,oy,W*scale,H*scale);
 if(!pocket)drawHud(ctx,ox,oy,scale,g);
 PV?.hud?.(ctx,ox,oy,scale,g,view);
 TOUCH()?.draw(ctx,dpr);
 // Review aid: ?inspect magnifies the area around the knight.
 if(view.inspect){const z=view.inspect,p=g.p,cw=Math.floor(sw/z/2),chh=Math.floor(sh/z/2);ctx.fillStyle='#000';ctx.fillRect(0,0,sw,sh);
  ctx.drawImage(view.buf,Math.max(0,Math.min(W-cw,p.x+4-cw/2)),Math.max(0,Math.min(H-chh,p.y-chh/2)),cw,chh,0,0,cw*z*2,chh*z*2);}
}
/* Room hints were written for the default keys; show whatever the player has bound instead. */
function localizeHint(t){
 t=t.replaceAll('{echo}',actionLabel('portal')).replaceAll('{companion}',actionLabel('portal'));
 const L=actionLabel,arrows=binds.keys.l[0]==='ArrowLeft'&&binds.keys.r[0]==='ArrowRight';
 // Touch: the same sentences in gestures ("Tap jumps", "Swipe dashes", "hold on a wall…").
 if(touchUI()){const cap=s=>s[0].toUpperCase()+s.slice(1);
  return t.replace(/^Arrows move/,'Left thumb moves').replace(/Space jumps/,cap(L('jump'))+' jumps').replace(/hold A on/,(TOUCH().settings().map.grab==='hold'?'hold right thumb on':'hold '+L('grab')+' on'))
   .replace(/(^|· )D dashes/,(m,p)=>p+cap(L('dash'))+' dashes').replace(/(^|· )W strikes/,(m,p)=>p+cap(L('strike'))+' strikes').replace(/(^|· )W cuts/,(m,p)=>p+cap(L('strike'))+' cuts')
   .replace(/(^|· )F parries/,(m,p)=>p+cap(L('parry'))+' parries').replace(/(^|· )P fires/,(m,p)=>p+cap(L('portal'))+' fires').replace(/(^|· )A picks up/,(m,p)=>p+cap(L('grab'))+' picks up').replace(/A again throws/,L('grab')+' again throws')
   .replace(/↓\+A\b/,'↓+'+L('grab'));}
 const mv=lastDevice==='pad'?'Stick':arrows?'Arrows':`${L('l')} / ${L('r')}`;
 return t.replace(/^Arrows move/,mv+' move').replace(/Space jumps/,L('jump')+' jumps').replace(/hold A on/,'hold '+L('grab')+' on')
  .replace(/^D dashes/,L('dash')+' dashes').replace(/^W strikes/,L('strike')+' strikes').replace(/^W cuts/,L('strike')+' cuts')
  .replace(/^F parries/,L('parry')+' parries').replace(/^A picks up/,L('grab')+' picks up').replace(/A again throws/,L('grab')+' again throws')
  .replace(/↓\+A\b/,'↓+'+L('grab'));
}
function drawHud(ctx,ox,oy,scale,g){
 const fs=Math.max(10,Math.round(scale*4.2),Math.round(10*(view.dpr||1)));ctx.font=`${fs}px ui-monospace,Menlo,monospace`;ctx.textBaseline='top';
 const ch=R.chapters[view.chapter],localIndex=g.roomIndex-chapterStart(view.chapter)+1;
 const numbered=ch.climb?ch.rooms.slice(0,ch.mainCount).filter(r=>!r.connector&&!r.passage):null,number=numbered?.findIndex(r=>r.id===g.room.id);
 const pad=Math.round(scale*3);
 // Room card for two seconds after entering
 if(view.roomTimer<150&&view.mode==='play'&&!g.room.def.atlasJunction&&!g.room.def.atlasTransit){const a=Math.min(1,(150-view.roomTimer)/40);ctx.globalAlpha=a;
  ctx.fillStyle='#000000aa';const txt=g.room.def.atlasTransit||g.room.def.atlasJunction?g.room.name:ch.climb?(number>=0?`${ch.name} · ${number+1}/${numbered.length} · ${g.room.name}`:`${ch.name} · ${g.room.name}`):ch.mainCount&&localIndex>ch.mainCount?`${ch.name} · ${g.room.name||''}`:`${ch.name} · ${localIndex}/${ch.mainCount||ch.rooms.length} · ${g.room.name||''}`;   // Room by Room: quest rooms carry no numberconst w=ctx.measureText(txt).width;ctx.fillRect(ox+pad-4,oy+pad-3,w+8,fs+6);
  ctx.fillStyle='#e9dcc0';ctx.fillText(txt,ox+pad,oy+pad);ctx.globalAlpha=1;}
 // Deaths and shards
 const shardsTotal=ch.pitch?0:R.all.reduce((n,d)=>n+(d.map.join('').split('*').length-1),0);   // a merge pitch has no shards
 const right=`✕ ${view.chapterStats.deaths}`+(shardsTotal?`   ◆ ${g.shards.size}/${shardsTotal}`:'');
 ctx.fillStyle='#00000088';const rw=ctx.measureText(right).width;ctx.fillRect(ox+W*scale-rw-pad-6,oy+pad-3,rw+10,fs+6);
 ctx.fillStyle='#cfc6b4';ctx.fillText(right,ox+W*scale-rw-pad,oy+pad);
 if(view.replay){ctx.fillStyle='#ffcf7a';ctx.fillText(takeoverOK()?'▶ INTENDED ROUTE — any input to take over':'▶ INTENDED ROUTE — then it is your turn, from the fire',ox+pad,oy+H*scale-fs-pad);}
 else if(g.awake===false&&g.room.def.movement!=='survive-2'&&g.room.def.bank?.run!==3&&!g.room.def.showHintAtRest){ctx.fillStyle='#d8cfb9';const lk=g.room.def.lock||[];ctx.fillText(`Look first · act when ready · ${lk.includes('parry')?'':actionLabel('parry')+' parry · '}${lk.includes('strike')?'':actionLabel('strike')+' blade · '}${lastDevice==='pad'?actionLabel('pause'):'Esc'} room question`,ox+pad,oy+H*scale-fs-pad);}
 else if(g.room.hint&&view.roomTimer<600){ctx.globalAlpha=Math.min(1,(600-view.roomTimer)/60);ctx.fillStyle='#d8cfb9';
  // A hint wider than the room (big touch text, long gesture names) breaks at its middle dot onto two lines.
  const text=localizeHint(g.room.hint),room=W*scale-pad*2;let lines=[text];
  if(ctx.measureText(text).width>room){const bits=text.split(' · ');let best=1,bd=1e9;for(let k=1;k<bits.length;k++){const a=bits.slice(0,k).join(' · '),b=bits.slice(k).join(' · '),d=Math.max(ctx.measureText(a).width,ctx.measureText(b).width);if(d<bd){bd=d;best=k;}}
   if(bits.length>1)lines=[bits.slice(0,best).join(' · '),bits.slice(best).join(' · ')];}
  lines.forEach((l,i)=>ctx.fillText(l,ox+pad,oy+H*scale-fs-pad-(lines.length-1-i)*(fs+3)));ctx.globalAlpha=1;}
 if(save.assist.infiniteStamina||(save.assist.speed&&save.assist.speed<1)){ctx.fillStyle='#8fb0d0';ctx.fillText('ASSIST',ox+W*scale-ctx.measureText('ASSIST').width-pad,oy+pad+fs+6);}
}

/* ---------------------------------------------------------------- menus (DOM) */
function overlay(){return document.getElementById('pcOverlay');}
function showOverlay(html){const o=overlay();o.innerHTML=html;o.classList.add('show');focusFirst();}
function hideOverlay(){overlay().classList.remove('show');overlay().innerHTML='';capture=null;latchHeld();}
function mainMenu(){
 if(root.BladefallPitchView?.menu?.())return;
 view.mode='menu';view.paused=false;music(false);
 const PARTS={I:'Part I · First Ascent — one idea at a time',II:'Part II · The Deep Climb — ideas combined, a little harder',III:'Part III · The High Road — medium to hard',IV:'Part IV · Foes — the blade and the parry become the route',V:'Part V · Portals — one end, then both',VI:'Part VI · Portals and Everything Before',optional:'Momentum · X — optional, and on the move',...(R.partTitles||{})};
 const card=(c,i)=>{
  const done=save.cleared['chapter:'+c.id],shardIds=c.rooms.flatMap(r=>{const out=[];let n=0;const flat=r.map.join('');for(const ch of flat)if(ch==='*')out.push(r.id);return out;});
  const got=c.rooms.reduce((n,r)=>n+[...save.shards].filter(s=>s.startsWith(r.id+':')).length,0);
  return `<button class="pcChoice" data-ch="${i}"><span class="pcNum">${c.label||i+1}</span><span class="pcName">${c.name}${done?' <em>✓</em>':''}</span><span class="pcDesc">${c.blurb}</span><span class="pcMeta">${c.rooms.length} room${c.rooms.length===1?'':'s'}${shardIds.length?` · ◆ ${got}/${shardIds.length}`:''}${SV()?.active()?(SV().summary(c.id)?` · <span class="svTag">${SV().summary(c.id)}</span>`:''):save.best[c.id]!==undefined?` · best ${save.best[c.id]} deaths`:''}</span></button>`;};
 const parts=Object.keys(PARTS).map(part=>{const list=R.chapters.map((c,i)=>[c,i]).filter(([c])=>(c.part||'I')===part);return list.length?{part,title:PARTS[part],html:`<div class="pcGrid">${list.map(([c,i])=>card(c,i)).join('')}</div>`}:null;}).filter(Boolean);
 // On a touch screen the parts are pages you swipe between, with a tab strip; elsewhere one long list.
 const rows=touchUI()?`<div class="pcTabs" role="tablist">${parts.map((p,k)=>`<button class="pcTab" data-tab="${k}" role="tab">${p.part==='optional'?'Mo':p.part}</button>`).join('')}</div>
 <div class="pcPages">${parts.map(p=>`<section class="pcPage"><h2 class="pcPart">${p.title}</h2>${p.html}</section>`).join('')}</div>`
  :parts.map(p=>`<h2 class="pcPart">${p.title}</h2>${p.html}`).join('');
 showOverlay(`<div class="pcCard wide"><h1>Precision Core</h1><p class="pcSub">A new physics for Bladefall: integer pixels, one dash, one screen per room. Every room asks a question — find the answer, then execute it.</p>${rows}
 <div class="pcRow">${SV()?`<button class="pcBtn ghost" id="pcSurvey">Difficulty survey${SV().active()?` · on · ${SV().progress().rated}/${SV().progress().n} rated`:''}</button>`:''}<button class="pcBtn ghost" id="pcControls">Controls</button><button class="pcBtn ghost" id="pcAssist">Assist &amp; options</button><a class="pcBtn ghost" href="index.html">Back to Bladefall</a></div></div>`);
 overlay().querySelectorAll('[data-ch]').forEach(b=>b.onclick=()=>{save.menuPage=pageNow();writeSave(save);startChapter(+b.dataset.ch);});
 const pages=overlay().querySelector('.pcPages'),tabs=[...overlay().querySelectorAll('.pcTab')];
 function pageNow(){return pages?Math.round(pages.scrollLeft/Math.max(1,pages.clientWidth)):0;}
 if(pages){
  const mark=()=>{const k=pageNow();tabs.forEach((t,i)=>t.classList.toggle('on',i===k));const on=tabs[k];if(on)on.scrollIntoView({block:'nearest',inline:'nearest'});};
  tabs.forEach(t=>t.onclick=()=>{pages.scrollTo({left:+t.dataset.tab*pages.clientWidth,behavior:'smooth'});});
  pages.addEventListener('scroll',()=>{clearTimeout(pages._t);pages._t=setTimeout(mark,60);},{passive:true});
  const start=Math.min(tabs.length-1,save.menuPage||0);requestAnimationFrame(()=>{pages.scrollLeft=start*pages.clientWidth;mark();});
 }
 document.getElementById('pcControls').onclick=()=>touchUI()?TOUCH().card(mainMenu):controlsCard(mainMenu);
 if(SV())document.getElementById('pcSurvey').onclick=()=>SV().panel({showOverlay,back:mainMenu});
 document.getElementById('pcAssist').onclick=()=>assistCard(mainMenu);
}
function controlsCard(back){
 const gp=pickPad(),fid=document.activeElement&&document.activeElement.dataset?document.activeElement.dataset.fid:null;
 const redraw=()=>controlsCard(back);
 const chip=(kind,a,v,i)=>`<button class="pcChip" data-fid="rm-${kind}-${a}-${i}" data-rm="${kind}|${a}|${i}" title="Remove">${kind==='keys'?keyName(v):padName(v,gp)}<span aria-hidden="true"> ✕</span></button>`;
 const add=(kind,a)=>{const on=capture&&capture.kind===kind&&capture.action===a;
  return `<button class="pcAdd${on?' on':''}" data-fid="add-${kind}-${a}" data-add="${kind}|${a}">${on?(kind==='keys'?'Press a key… (Esc cancels)':'Press a button…'):'+ '+(kind==='keys'?'key':'button')}</button>`;};
 const rows=ACTIONS.map(([a,label])=>`<tr><td>${a==='portal'&&view.g?.echoOn?'Echo · place / swap':a==='portal'&&view.g?.relay?'Oren · hold / follow':label}</td>
  <td><div class="pcChips">${binds.keys[a].map((v,i)=>chip('keys',a,v,i)).join('')}${binds.keys[a].length?'':'<span class="pcNone">unbound</span>'}${add('keys',a)}</div></td>
  <td><div class="pcChips">${binds.pad[a].map((v,i)=>chip('pad',a,v,i)).join('')}${add('pad',a)}</div></td></tr>`).join('');
 const status=gp?`Controller: ${gp.id.replace(/\s*\(.*$/,'').slice(0,48)||'connected'}${gp.mapping==='standard'?'':' · non-standard layout, buttons may be mislabelled'}`
  :'No controller detected. Connect one and press any button on it (browsers hide controllers until a button is pressed).';
 showOverlay(`<div class="pcCard mid"><h1>Controls</h1><label class="pcSub"><input id="pcFeedbackToggle" type="checkbox" ${root.BladefallPlaytest?.feedbackEnabled()?'checked':''}> Review mode · rate each Survival room</label>
 <p class="pcSub">${status}</p>
 <table class="pcTable pcBinds"><tr><th>Action</th><th>Keyboard</th><th>Controller</th></tr>${rows}</table>
 <p class="pcSub pcNote">${view.bindNote||'Select a key or button to remove it. “+” adds one; a key already in use moves here.'}</p>
 <p class="pcSub">Always on: the left stick moves and aims · Esc pauses and backs out · M toggles music (unless bound) · in menus, arrows / d-pad / stick move, Enter / Space / ${padName(0,gp)} choose, Esc / ${padName(1,gp)} go back.</p>
 <p class="pcSub">Your plume shows your dash: <b style="color:#ffb347">ember</b> = ready, <b style="color:#56708c">slate</b> = spent. It flashes white when it returns.</p>
 <div class="pcRow"><button class="pcBtn ghost" id="pcResetK" data-fid="resetK">Reset keyboard</button><button class="pcBtn ghost" id="pcResetP" data-fid="resetP">Reset controller</button></div>
 <button class="pcBtn" id="pcBack" data-back data-fid="back">Back</button></div>`);
 document.getElementById('pcFeedbackToggle').onchange=e=>root.BladefallPlaytest?.setFeedback(e.target.checked);
 const o=overlay();
 o.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{const [kind,a,i]=b.dataset.rm.split('|');const v=binds[kind][a].splice(+i,1)[0];saveBinds();
  view.bindNote=`Removed ${kind==='keys'?keyName(v):padName(v,gp)} from “${ACTIONS.find(x=>x[0]===a)[1]}”.`;redraw();});
 o.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{const [kind,a]=b.dataset.add.split('|');
  if(capture&&capture.kind===kind&&capture.action===a){view.bindNote='Cancelled.';endCapture();return;}
  view.bindNote='';startCapture(kind,a,redraw);});
 document.getElementById('pcResetK').onclick=()=>{binds.keys=copyBinds(KEY_DEFAULTS);saveBinds();view.bindNote='Keyboard reset to defaults.';redraw();};
 document.getElementById('pcResetP').onclick=()=>{binds.pad=copyBinds(PAD_DEFAULTS);saveBinds();view.bindNote='Controller reset to defaults.';redraw();};
 document.getElementById('pcBack').onclick=()=>{capture=null;view.bindNote='';back();};
 view.onPadChange=()=>{if(overlay().querySelector('.pcBinds'))redraw();else view.onPadChange=null;};
 if(fid){const m=fid.match(/^rm-(\w+)-(\w+)-/);const el=o.querySelector(`[data-fid="${fid}"]`)||(m&&o.querySelector(`[data-fid="add-${m[1]}-${m[2]}"]`));if(el)el.focus();}
}
function assistCard(back,{fromMenu=false}={}){
 const a=save.assist,o=save.options,climb=!!root.BladefallPitchView?.climb?.state?.(),F=root.BladefallClimbFinale;
 // (7.314) the full-map switch only from the Survive menu (title → Survive), never mid-world
 const finaleMap=!!(F&&climb&&fromMenu);
 const reviewRow=root.BladefallPlaytest?`<label class="pcOpt"><input type="checkbox" id="opReview" ${root.BladefallPlaytest.feedbackEnabled()?'checked':''}> Review mode · rate each room when you finish it</label>
 <label class="pcOpt"><input type="checkbox" id="opClock" ${root.BladefallPlaytest.clockShown?.()!==false?'checked':''}> Show the run timer</label>`:'';
 showOverlay(`<div class="pcCard"><h1>Assist &amp; options</h1><p class="pcSub">The rooms are built to be hard and fair. If a rule gets in the way of your fun, change it. Nothing is locked behind these settings.</p>
 ${a.testMode?'<p class="pcSub" style="color:#8fd8ff">Test mode is on: infinite skips and climbing stamina, and you can take over a watched route.</p>':''}
 <label class="pcOpt">Game speed <select id="asSpeed">${[1,.9,.8,.7,.6,.5].map(s=>`<option value="${s}" ${((a.speed||1)===s)?'selected':''}>${Math.round(s*100)}%</option>`).join('')}</select></label>
 <label class="pcOpt"><input type="checkbox" id="opShake" ${o.shake?'checked':''}> Screen shake</label>
 <label class="pcOpt"><input type="checkbox" id="opSound" ${o.sound?'checked':''}> Sound effects</label>
 <label class="pcOpt"><input type="checkbox" id="opMusic" ${o.music?'checked':''}> Music</label>
 ${reviewRow}
 ${finaleMap?`<label class="pcOpt"><input type="checkbox" id="opFinaleMap" ${F.preview()?'checked':''}> Show the full map (Vesper and your Echo)</label>`:''}
 <p class="pcSub" id="asNote" style="color:#ffd98a"></p>
 <button class="pcBtn" id="pcBack" data-back>Done</button></div>`);
 const $=id=>document.getElementById(id),note=t=>{$('asNote').textContent=t;};
 const upd=()=>{a.speed=+$('asSpeed').value;o.shake=$('opShake').checked;o.sound=$('opSound').checked;o.music=$('opMusic').checked;
  if($('opReview'))root.BladefallPlaytest.setFeedback($('opReview').checked);if($('opClock'))root.BladefallPlaytest.setClock?.($('opClock').checked);
  if(finaleMap)F.setPreview($('opFinaleMap').checked);a.infiniteStamina=!!a.testMode;writeSave(save);if(view.g)view.g.assist.infiniteStamina=a.infiniteStamina;};
 overlay().querySelectorAll('input,select').forEach(el=>el.onchange=upd);
 // (7.314) every five presses of Screen shake turn test mode on or off: infinite skips and climbing stamina in
 // Survive, and a watched route can be taken over
 {let presses=0;$('opShake').addEventListener('click',()=>{if(++presses%5)return;a.testMode=!a.testMode;a.infiniteStamina=a.testMode;writeSave(save);if(view.g)view.g.assist.infiniteStamina=a.infiniteStamina;
  note(a.testMode?'Test mode on: infinite skips and climbing stamina.':'Test mode off.');});}
 // (7.312/7.314) every five presses of Show the full map turn the 100% view on or off: every world playable,
 // 41 and 42 too, and the map shown complete. Off, the map is as it was.
 if(finaleMap){let presses=0;$('opFinaleMap').addEventListener('click',()=>{if(++presses%5)return;const on=!F.unlockedAll();F.setUnlockedAll(on);
  note(on?'Every Survive world is unlocked, Vesper and your Echo too, and the map shows the game 100% complete.':'Back to your own progress: the map shows what you have really done.');});}
 $('pcBack').onclick=()=>{upd();if(view.mode==='play')music(true);else music(false);back();};
}
function togglePause(){
 if(view.mode!=='play')return;
 if(view.paused){view.paused=false;hideOverlay();return;}
 view.paused=true;const g=view.g,ch=R.chapters[view.chapter],base=chapterStart(view.chapter);
 const hasTape=!!R.tapes[g.room.id],backPassage=ch.climb&&root.BladefallClimbBankPassages?.previousLink(root.BladefallPitchView?.climb?.state()?.world,g.room.id);
 let roomLabel=0;const rooms=ch.rooms.map((r,i)=>r.passage||r.connector||ch.climb&&i>=ch.mainCount?'':`<button class="pcMini ${base+i===g.roomIndex?'on':''}" title="${r.name}" data-room="${i}">${++roomLabel}${save.cleared[r.id]?'✓':''}</button>`).join('');   // the Climb's passages and shafts are not levels
 let optionalLabel=0;const optional=ch.climb?ch.rooms.map((r,i)=>i>=ch.mainCount&&!r.passage&&!r.connector?`<button class="pcMini ${base+i===g.roomIndex?'on':''}" title="${r.name}" aria-label="Optional ${optionalLabel+1}: ${r.name}" data-room="${i}">O${++optionalLabel}${save.cleared[r.id]?'✓':''}</button>`:'').join(''):'';
 const skipInfo=ch.climb?root.BladefallPitchView?.climb?.skipInfo?.():null;
 const selectable=(ch.climb?ch.rooms.slice(0,ch.mainCount):ch.rooms).filter(r=>!r.passage&&!r.connector),selected=selectable.findIndex(r=>r.id===g.room.id);
 const optionalRooms=ch.climb?ch.rooms.slice(ch.mainCount).filter(r=>!r.passage&&!r.connector):[],optionalSelected=optionalRooms.findIndex(r=>r.id===g.room.id);
 const roomStatus=selected>=0?`room ${selected+1} of ${selectable.length}`:optionalSelected>=0?`optional O${optionalSelected+1}`:'connecting passage';
 showOverlay(`<div class="pcCard"><h1>Paused</h1>${view.trial?`<p class="pcSub">${view.trial.title||'The gate'} · level ${view.chapter+1} of ${view.trial.from}–${view.trial.to}</p>`:''}<p class="pcSub">${ch.name} · ${roomStatus}${g.room.name?' · '+g.room.name:''}</p>
 ${g.room.def.question?`<p class="pcSub">${g.room.def.question}</p>`:''}
 <button class="pcBtn" id="pcResume" data-back>Resume</button><button class="pcBtn ghost" id="pcRetry">Retry room</button>
 ${hasTape?'<button class="pcBtn ghost" id="pcWatch">Watch the intended route (review)</button>':''}
 ${backPassage?'<button class="pcBtn ghost" id="pcReturnPassage">Return through passage</button>':''}
 <p class="pcSub">Room select${optional?' · O = optional route':''}</p><div class="pcMiniRow">${rooms}${optional}</div>
 ${skipInfo?`<button class="pcBtn ghost" id="pcSkipSection" ${skipInfo.allowed?'':'disabled'}>Skip ${skipInfo.finale?'finale':'section'} · costs ${skipInfo.cost} · ${skipInfo.remaining===Infinity?"∞":skipInfo.remaining} left</button>${!skipInfo.allowed?`<p class="pcSub">${skipInfo.reason||'This section cannot be skipped.'}</p>`:''}`:''}
 ${ch.climb&&!view.trial?'<button class="pcBtn ghost" id="pcChapters">World map</button>':''}
 <button class="pcBtn ghost" id="pcCtl">Controls</button><button class="pcBtn ghost" id="pcAssist">Assist &amp; options</button>${view.trial?'<button class="pcBtn ghost" id="pcLeave">Leave the gate (you keep the levels you finished)</button>':!ch.climb?'<button class="pcBtn ghost" id="pcChapters">Chapters</button>':''}
 ${ch.climb?'<a class="pcBtn ghost" href="index.html">Return to title menu</a>':''}</div>`);
 document.getElementById('pcResume').onclick=togglePause;
 document.getElementById('pcSkipSection')?.addEventListener('click',()=>{if(!root.BladefallPitchView.climb.skipInfo().allowed)return;view.paused=false;hideOverlay();root.BladefallPitchView.climb.skipSection({fromPause:true});});
 document.getElementById('pcReturnPassage')?.addEventListener('click',()=>root.BladefallPitchView.climb.returnPassage());
 document.getElementById('pcCtl').onclick=()=>{const back=()=>{view.paused=false;togglePause();};touchUI()?TOUCH().card(back):controlsCard(back);};
 document.getElementById('pcRetry').onclick=()=>{togglePause();retryRoom();};
 if(hasTape)document.getElementById('pcWatch').onclick=()=>{togglePause();watchRoute();};
 overlay().querySelectorAll('[data-room]').forEach(b=>b.onclick=()=>{root.BladefallClimbSession?.invalidate('room select');view.paused=false;hideOverlay();C.enterRoom(g,base+(+b.dataset.room));view.replay=null;view.trail=[];resetScarf();view.roomTimer=0;});
 document.getElementById('pcAssist').onclick=()=>assistCard(()=>{view.paused=false;togglePause();});
 if(view.trial)document.getElementById('pcLeave').onclick=()=>{hideOverlay();view.paused=false;view.mode='card';music(false);tellHost({type:'trial-left',level:view.chapter+1});};
 else {document.getElementById('pcChapters').onclick=mainMenu;if(ch.climb)document.getElementById('pcChapters').textContent='World map';}
}
function watchRoute(){
 const g=view.g,tape=R.tapes[g.room.id];if(!tape)return;
 SV()?.watched(g.room.id);
 C.enterRoom(g,g.roomIndex);view.trail=[];resetScarf();
 const frames=[];for(const [n,k]of tape)for(let i=0;i<n;i++)frames.push(k);
 view.replay={frames,i:0};
}
function chapterCard(){
 view.mode='card';view.replay=null;view.wipe=0;view.wipeTo=null;music(false);
 const c=view.chapter,ch=R.chapters[c],st=view.chapterStats,secs=Math.round(st.frames/60);
 const got=ch.rooms.reduce((n,r)=>n+[...view.g.shards].filter(s=>s.startsWith(r.id+':')).length,0),total=ch.rooms.reduce((n,r)=>n+(r.map.join('').split('*').length-1),0);
 const next=c+1<R.chapters.length;
 showOverlay(`<div class="pcCard"><h1>${ch.name}</h1><p class="pcSub">${ch.outro||'Chapter complete.'}</p>
 <table class="pcTable"><tr><td>Deaths</td><td>${st.deaths}</td></tr><tr><td>Time</td><td>${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}</td></tr>${total?`<tr><td>Shards</td><td>◆ ${got}/${total}</td></tr>`:''}</table>
 ${next?`<button class="pcBtn" id="pcNext">Next: ${R.chapters[c+1].name}</button>`:''}<button class="pcBtn ghost" id="pcAgain">Replay chapter</button><button class="pcBtn ghost" id="pcChapters" data-back>Chapters</button></div>`);
 if(next)document.getElementById('pcNext').onclick=()=>startChapter(c+1);
 document.getElementById('pcAgain').onclick=()=>startChapter(c);
 document.getElementById('pcChapters').onclick=mainMenu;
}

/* ---------------------------------------------------------------- gate trials (7.251)
   The main game opens precision.html?trial=<id>&from=<level>&to=<level> in a frame over the world.
   Levels are chapter numbers (level 1 = the first chapter). The trial plays them in order, reports each
   finished level to the host so a player who leaves keeps their place, and reports the cleared gate. */
function tellHost(msg){try{if(root.parent&&root.parent!==root)root.parent.postMessage({source:'bladefall-pcore',id:view.trial&&view.trial.id,...msg},'*');}catch(e){}}
function trialLevelDone(ch){
 const t=view.trial,st=view.chapterStats,level=ch+1;
 t.deaths+=st.deaths;t.frames+=st.frames;
 view.mode='card';view.replay=null;view.wipe=0;view.wipeTo=null;
 if(level<t.to&&ch+1<R.chapters.length){
  tellHost({type:'trial-progress',level:level+1});
  const nx=R.chapters[ch+1];
  showOverlay(`<div class="pcCard"><h1>${R.chapters[ch].name}</h1><p class="pcSub">${R.chapters[ch].outro||''}</p>
  <p class="pcSub">${t.title||'The gate'} · level ${level} of ${t.from}–${t.to} cleared</p>
  <button class="pcBtn" id="pcNext" data-focus-first>Next: ${nx.name}</button></div>`);
  document.getElementById('pcNext').onclick=()=>startChapter(ch+1);
  return;
 }
 music(false);const secs=Math.round(t.frames/60);
 showOverlay(`<div class="pcCard"><h1>The gate yields</h1><p class="pcSub">${t.title?t.title+' · ':''}levels ${t.from}–${t.to} cleared</p>
 <table class="pcTable"><tr><td>Deaths</td><td>${t.deaths}</td></tr><tr><td>Time</td><td>${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}</td></tr></table>
 <button class="pcBtn" id="pcThrough" data-focus-first>Step through</button></div>`);
 document.getElementById('pcThrough').onclick=()=>{hideOverlay();tellHost({type:'trial-cleared',deaths:t.deaths,frames:t.frames});};
}

/* ---------------------------------------------------------------- music */
function music(on){
 // A mode may name its own track (the Climb: each world's base-game music); otherwise Crystalline Trials.
 const want=(view.g&&root.BladefallPitchView?.track?.(view))||'audio/music/crystalline-trials.mp3';
 if(musicEl&&musicEl.dataset.src!==want){musicEl.pause();musicEl=null;}
 if(!musicEl){musicEl=new Audio(want);musicEl.dataset.src=want;musicEl.loop=true;musicEl.volume=.32;}
 if(on&&save.options.music){musicEl.play().catch(()=>{});}else musicEl.pause();
}

/* ---------------------------------------------------------------- boot */
function boot(){
 view.canvas=document.getElementById('pcCanvas');view.ctx=view.canvas.getContext('2d');
 view.buf=document.createElement('canvas');view.buf.width=W;view.buf.height=H;view.b=view.buf.getContext('2d');view.b.imageSmoothingEnabled=false;
 TOUCH()?.init({canvas:view.canvas,view,save,writeSave,overlayOpen,showOverlay,overlay,controlsCard,
  pause:()=>{if(view.mode==='play')togglePause();},retry:()=>{if(view.mode==='play'&&!view.paused)retryRoom();},
  // Android back: pause in play, step back in a menu; at the chapter list it leaves the page (returns false).
  back:()=>{if(overlayOpen()){if(menuBack())return true;if(view.mode==='play'){togglePause();return true;}return false;}if(view.mode==='play'){togglePause();return true;}return false;},
  onDevice:d=>{if(d)setDevice(d);}});
 window.addEventListener('keydown',e=>{
  const code=root.BladefallInput.eventCode(e);
  setDevice('key');ac();
  if(capture){e.preventDefault();if(e.repeat)return;
   if(code==='Escape'){view.bindNote='Cancelled.';endCapture();}
   else if(capture.kind!=='keys'){}
   else if(RESERVED_KEYS.has(code)){view.bindNote=`${keyName(code)} is reserved.`;endCapture();}
   else{assign('keys',capture.action,code);endCapture();}
   return;}
  const open=overlayOpen();
  if(open){const dir={ArrowLeft:'l',ArrowRight:'r',ArrowUp:'u',ArrowDown:'d'}[code];
   if(dir){e.preventDefault();moveFocus(dir);return;}
   if(code==='Space'){e.preventDefault();if(!e.repeat)menuConfirm();return;}}
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(code))e.preventDefault();
  if(e.repeat)return;
  const act=keyAction(code);
  if(view.replay&&view.mode==='play'&&!view.paused&&PLAY_ACTIONS.includes(act)&&takeoverOK()){view.replay=null;}
  keys.add(code);
  if(code==='Escape'||act==='pause'){pauseOrBack();return;}
  if(act==='retry'&&view.mode==='play'&&!view.paused&&!open){retryRoom();return;}
  if(code==='KeyM'&&!act){save.options.music=!save.options.music;writeSave(save);music(view.mode==='play');}
 });
 window.addEventListener('pointerdown',()=>setDevice('mouse'));
 const padChange=()=>{pickPad();if(view.onPadChange)view.onPadChange();};
 window.addEventListener('gamepadconnected',padChange);window.addEventListener('gamepaddisconnected',padChange);
 window.addEventListener('keyup',e=>keys.delete(root.BladefallInput.eventCode(e)));
 window.addEventListener('blur',()=>keys.clear());
 const q=new URLSearchParams(location.search);view.inspect=+(q.get('inspect')||0);
 if(q.has('pitch')&&root.BladefallPitchView){root.BladefallPitchView.start(q,{startChapter,showOverlay,hideOverlay,music,view});}
 else if(q.has('trial')){
  const from=Math.max(1,+q.get('from')||1),to=Math.max(from,+q.get('to')||from),start=Math.min(to,Math.max(from,+q.get('start')||from));
  view.trial={id:q.get('trial'),from,to,title:q.get('title')||'',deaths:0,frames:0};
  document.body.classList.add('pcTrial');startChapter(start-1);tellHost({type:'trial-ready',level:start});
 }else if(q.has('combat')||q.has('foes')){startChapter(Math.max(0,R.chapters.findIndex(c=>c.part==='IV')),0);}else if(q.has('chapter')){startChapter(+q.get('chapter')||0,+(q.get('room')||0));}else mainMenu();
 requestAnimationFrame(frame);
}
/* Review/verification aid: run the real loop (keyboard and pad included) for n display frames. */
function pump(n=1){for(let i=0;i<n;i++)loop(1/60);return {room:view.g?.room.id,x:view.g?.p.x,y:view.g?.p.y,state:view.g?.p.state};}
/* Review/verification aid: advance the running room by exact input frames, then draw once. */
function advance(frames){for(const k of frames)tick(keysToInput(k));render();return {room:view.g.room.id,x:view.g.p.x,y:view.g.p.y,state:view.g.p.state,dashes:view.g.p.dashes,phase:view.g.phase};}
/* Room by Room (7.259): enter any room of the running game (a quest branch and its return), keeping pickups. */
function goRoom(i){if(!view.g)return;root.BladefallClimbSession?.invalidate('room select');save.shards=[...view.g.shards];save.cleared[view.g.room.id]=true;writeSave(save);view.replay=null;C.enterRoom(view.g,i);view.trail=[];resetScarf();view.roomTimer=0;}
function persist(){if(view.g){save.shards=[...view.g.shards];writeSave(save);}}
/* Another room's game drawn where the caller has translated to (the Climb's neighbouring sections). */
function drawOther(b,g2,pal,localCamera){
 const DV=root.BladefallPrecisionDeviceViews||[];
 drawStatic(b,g2,pal,localCamera);for(const d of DV)d.drawBack?.(b,g2,view,pal);
 drawEntities(b,g2,pal);root.BladefallPrecisionCombatView?.draw(b,g2);root.BladefallPrecisionFoesView?.draw(b,g2);root.BladefallPrecisionPortalsView?.draw(b,g2,view);
 for(const d of DV){d.draw?.(b,g2,view,pal);d.drawFront?.(b,g2,view,pal);}
}
root.BladefallPrecisionView={clearInput:()=>{keys.clear();latchHeld();},options:(back,o)=>assistCard(back,o),testMode:()=>!!save.assist.testMode,boot,view,startChapter,retryRoom,mainMenu,advance,pump,goRoom,persist,drawOther,drawStatic,palettes:PAL,drawKnight:drawKnightSprite};
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();}
})(typeof window!=='undefined'?window:globalThis);
