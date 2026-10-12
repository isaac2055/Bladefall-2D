/* Survive's last two worlds (7.309), Explore's last road in Survive's form: each is a chain of sections with a fire at
   each, ending in a boss room (devices: bladefall-pcore-dev-finale.js). Neither is on the atlas; both appear on the
   map only once all forty worlds are complete, as surprise extras.

   41 · Your Echo, below the Fractured emerald. Your Echo runs ahead of you, then fights you twice: THE PART YOU LEFT,
        then STAY WITH ME. When it yields you choose, as in Explore: Kill, Merge or Forget. The choice is saved;
        defeat it again to choose another path.
   42 · Vesper, True King, above the Emerald Ascent. Merged with your Echo, his ward breaks: three cuts end each of
        his four forms (the final showdown). Otherwise his ward holds, and only someone who can go minutes without
        being touched will finish him.
   State: localStorage bladefall.climb.finale.v1 {echo, choice, vesper}. */
(function(root){
'use strict';
const CL=root.BladefallClimb;if(!CL)return;
const KEY='bladefall.climb.finale.v1';
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY))||{};}catch(e){return {};}};
const write=v=>{try{localStorage.setItem(KEY,JSON.stringify(v));}catch(e){}};
const state=()=>Object.assign({echo:false,choice:null,vesper:false},typeof localStorage!=='undefined'?read():{});
const NEED=Object.freeze({merge:3,kill:10,none:15,forget:18});

/* ---------------------------------------------------------------- rooms */
// A room drawn from walls up: border, a two-row floor, openings, '=' ledges, P.
function room(cols,rows,{floor,ledges=[],open=[],gate=[],P}){
 const g=Array.from({length:rows},(_,r)=>Array.from({length:cols},(_,c)=>r===0||r>=floor||c===0||c===cols-1?'#':'.'));
 for(const [c0,c1,r] of ledges)for(let c=c0;c<=c1;c++)g[r][c]='=';
 for(const [c,r0,r1] of open)for(let r=r0;r<=r1;r++)g[r][c]='.';
 for(const [c,r0,r1] of gate)for(let r=r0;r<=r1;r++)g[r][c]='G';
 g[P[1]][P[0]]='P';
 return g.map(r=>r.join(''));
}
const seamAt=(c,r0,r1)=>Array.from({length:r1-r0+1},(_,i)=>[c,r0+i,'#']);
const base={movement:'survive-2',aim8:true,dashes:1,study:true,dropThru:true};
const R41=[
 {...base,id:'cl41-mirror',origin:'cl41-mirror',name:'Where You Left Yourself',palette:'echo-shore',cols:40,rows:23,
  map:room(40,23,{floor:21,ledges:[[18,22,18]],gate:[[39,17,20]],P:[3,20]}),
  echoDuel:{floor:21,c:30,arena:[1,38],wake:12,script:['dash','leap'],leave:42},
  hint:'Your Echo runs at you along the floor: jump it. It lands where you stood and the ground ripples out: jump the ripples.',
  question:'What does your Echo do just before it runs?'},
 {...base,id:'cl41-part',origin:'cl41-part',name:'The Part You Left',palette:'echo-shore',cols:48,rows:23,
  map:room(48,23,{floor:21,ledges:[[9,14,18],[33,38,18]],open:[[0,17,20]],gate:[[47,17,20]],P:[2,20]}),seam:seamAt(0,17,20),
  echoDuel:{floor:21,c:34,arena:[1,46],wake:5,need:3,leave:50},
  hint:'Cut your Echo only while it recovers, drawn bright, after it runs or lands. Parry as it reaches you and it staggers.',
  question:'When can your blade reach your Echo?'},
 {...base,id:'cl41-stay',origin:'cl41-stay',name:'Stay With Me',palette:'echo-shore',exit:'none',cols:48,rows:23,
  map:room(48,23,{floor:21,ledges:[[7,11,18],[21,26,18],[36,40,18]],open:[[0,17,20]],P:[2,20]}),seam:seamAt(0,17,20),
  echoDuel:{floor:21,c:36,arena:[1,46],wake:5,kneel:true,phases:[   // (7.317) four phases, fourteen wounds; one death and it starts over
   {name:'STAY WITH ME',need:3,tell:28,recover:48,wave:3.2,ghost:26},
   {name:"DON'T LEAVE AGAIN",need:3,tell:26,recover:44,wave:3.4,ghost:24,double:true},
   {name:'I AM STILL YOU',need:4,tell:24,recover:40,wave:3.6,ghost:22,double:true,leapEvery:2},
   {name:'ALL OF ME',need:4,tell:22,recover:36,wave:3.8,ghost:20,double:true,leapEvery:2}]},
  hint:'Every run comes twice: its afterimage follows the same line. Four phases; fall once and it begins again.',
  question:'Where is the second run going?'}];
const R42=[
 {...base,id:'cl42-road',origin:'cl42-road',name:'The Throne Road',palette:'true-throne',cols:40,rows:23,
  map:room(40,23,{floor:21,ledges:[[5,11,18],[19,25,18],[32,37,18],[9,15,15],[24,30,15]],open:[[39,17,20]],P:[2,20]}),
  curtain:{first:70,every:170,speed:2.2,gaps:['floor','low','high','low'],surfaces:{floor:21,low:18,high:15},from:'right'},
  hint:'His bats cross the whole road in a wall. Stand at the height of its one gap as it passes: the floor, a low ledge or a high one.',
  question:'Where is the gap in the next wall?'},
 {...base,id:'cl42-throne',origin:'cl42-throne',name:'Vesper, True King',palette:'true-throne',exit:'none',cols:48,rows:28,
  map:room(48,28,{floor:26,ledges:[[4,11,23],[36,43,23],[14,33,20]],open:[[0,22,25]],P:[2,25]}),seam:seamAt(0,22,25),
  vesper:{floor:26,c:30,arena:[1,46],top:6,wake:5,need:3,ledges:[[4,11,23],[36,43,23],[14,33,20]],surfaces:{floor:26,low:23,high:20}},
  hint:'He opens after each attack, drawn bright: cut him then. Merged with your Echo, three cuts end each form; otherwise his ward holds.',
  question:'Who did you bring with you?'}];
const PALETTES={
 'echo-shore':{sky0:'#08091c',sky1:'#15142e',far:'#24233d',rock:'#3b3756',rockD:'#24213a',edge:'#b9b7d4',moss:'#5f8d8a',accent:'#86e6d8'},
 'true-throne':{sky0:'#07060f',sky1:'#140d22',far:'#2a1330',rock:'#34303e',rockD:'#22202a',edge:'#8a5cd8',moss:'#4a1c2a',accent:'#c9a8ff'}};
const W41={n:41,key:'your-echo',name:'Your Echo',palette:'echo-shore',kit:['dash','strike','parry'],palettes:PALETTES,
 blurb:'Below the Fractured emerald, the part of you that you left behind is waiting.',
 outro:'Your Echo lowers its sword.',
 sections:[{room:'cl41-mirror',x:0,y:0,fire:{c:3,r:20}},{room:'cl41-part',x:40,y:0,fire:{c:2,r:20}},{room:'cl41-stay',x:88,y:0,fire:{c:2,r:20}}],
 quests:[],secrets:[],rooms:R41,tapes:{},folk:{},props:{},saved:[],difficulty:{min:5,max:7},atlasStart:'cl41-mirror',finale:true,passages:[],atlasPassagesReady:true,requiredBankRooms:[],requiredMainRooms:[]};
const W42={n:42,key:'true-king',name:'Vesper, True King',palette:'true-throne',kit:['dash','strike','parry'],palettes:PALETTES,
 blurb:'Above the Emerald Ascent, the true king of this world waits on the throne.',
 outro:'Vesper is still.',
 sections:[{room:'cl42-road',x:0,y:0,fire:{c:2,r:20}},{room:'cl42-throne',x:40,y:-5,fire:{c:2,r:25}}],
 quests:[],secrets:[],rooms:R42,tapes:{},folk:{},props:{},saved:[],difficulty:{min:6,max:10},atlasStart:'cl42-road',finale:true,passages:[],atlasPassagesReady:true,requiredBankRooms:[],requiredMainRooms:[]};
// the intended routes (merged, for 42), proven by scripts/climb/finale-check.mjs
const TAPES=root.BladefallClimbFinaleTapes||{};
for(const w of [W41,W42])for(const d of w.rooms)if(TAPES[d.id])w.tapes[d.id]=TAPES[d.id];
if(CL.wanted){CL.addWorld(W41);CL.addWorld(W42);}

/* ---------------------------------------------------------------- unlocking, the ward */
const PV=()=>root.BladefallPitchView?.climb;
function forced(){const q=root.location?.search||'';return /[?&](finale|review)\b/.test(q);}
// Both appear once every world 1–40 is complete (or on a review link, or with ?finale for testing).
// (7.312) the hidden switch: five presses of Settings → Show the finished map open every Survive world, 41 and 42 too
const ALL='bladefall.climb.unlock-all.v1';
// (7.314) a view over the save, not a change to it: off again, every world is as locked as it was
function unlockedAll(){try{return localStorage.getItem(ALL)==='1';}catch(e){return false;}}
function setUnlockedAll(on){try{if(on)localStorage.setItem(ALL,'1');else localStorage.removeItem(ALL);}catch(e){}}
function unlockAll(){setUnlockedAll(true);}
function canPlay(n){return n<=20||(n>40?open():unlockedAll()||!!PV()?.fracturedOpen?.(n));}   // (7.316) the purple heart plus the beaten base world
function open(){
 if(forced()||unlockedAll())return true;const atlas=PV()?.state()?.atlas;if(!atlas)return false;
 for(let n=1;n<=40;n++)if(!atlas.complete(n))return false;return true;
}
function merged(){const s=state();return !!(s.echo&&s.choice==='merge');}
function vesperNeed(){const s=state();return NEED[s.echo&&s.choice?s.choice:'none'];}
function mapState(){const s=state();return {open:open(),echo:!!s.echo,vesper:!!s.vesper,choice:s.choice,merged:merged()};}
// (7.310) Settings → Show the finished map: the crowns and the whole gem at full brilliance, whatever is beaten
const PREVIEW='bladefall.climb.map-preview.v1';
function preview(){try{return localStorage.getItem(PREVIEW)==='1';}catch(e){return false;}}
function setPreview(on){try{if(on)localStorage.setItem(PREVIEW,'1');else localStorage.removeItem(PREVIEW);}catch(e){}}

/* ---------------------------------------------------------------- the choice and the ending */
const CHOICES=Object.freeze({
 kill:{title:'KILL',label:'Kill · a sharper blade; Vesper’s ward still holds',line:'You silence the voice. Your blade is sharper; the empty space still belongs to Vesper.'},
 merge:{title:'MERGE',label:'Merge · become whole and break Vesper’s ward',line:'You take the offered hand. Not forgiveness for everything. A promise to stop facing it alone.'},
 forget:{title:'FORGET',label:'Forget · leave the memory; Vesper’s ward grows',line:'You turn away. Part of your strength goes with the memory. The road remains open.'}});
function card(html,buttons,even=false){
 const s=PV()?.state();if(!s)return;const view=s.view;view.mode='card';view.paused=true;view.replay=null;s.api.music(false);
 s.api.showOverlay(`<div class="pcCard">${html}${buttons.map((b,i)=>`<button class="pcBtn${i||even?' ghost':''}" id="clFin${i}"${i?'':' data-focus-first'}>${b.label}</button>`).join('')}</div>`);
 buttons.forEach((b,i)=>{const el=document.getElementById('clFin'+i);if(el)el.onclick=b.act;});
}
function echoYielded(){
 const s=PV()?.state();if(!s||s.world?.n!==41||s.view.replay)return;
 setTimeout(()=>card(`<h1>Your Echo</h1><p class="pcSub">Your reflection lowers its sword. “I am the fear that kept you moving. The anger that kept you alive. You do not have to like all of me. But I am yours.”</p><p class="pcSub">This choice is saved. Defeat your Echo again to choose another path.</p>`,
  ['kill','merge','forget'].map(k=>({label:CHOICES[k].label,act:()=>choose(k)})),true),700);
}
function choose(k){
 const v=state();v.echo=true;v.choice=k;write(v);
 card(`<h1>${CHOICES[k].title}</h1><p class="pcSub">${CHOICES[k].line}</p><p class="pcSub">Vesper waits above the Emerald Ascent.${k==='merge'?' His ward will break.':' His ward still holds.'}</p>`,
  [{label:'Face Vesper',act:()=>PV()?.startWorld(42)},{label:'Return to the map',act:()=>PV()?.menu()}]);
}
function vesperStill(){
 const s=PV()?.state();if(!s||s.world?.n!==42||s.view.replay)return;
 const v=state(),c=v.echo?v.choice:null;v.vesper=true;write(v);
 const line=c==='merge'?'The cloak settles. Two shadows stand in the dawn, then move as one. You have not become someone else. You have stopped leaving yourself behind.'
  :c==='kill'?'Vesper falls. You lift your blade, stronger, and listen for a voice that will not answer. The victory is yours; so is the silence.'
  :c==='forget'?'Vesper falls, and you cannot remember why the empty place beside you matters. You walk into morning carrying less than you brought.'
  :'Vesper falls to a blade that never once let him touch it. Far below the Fractured emerald, your Echo is still waiting.';
 setTimeout(()=>card(`<h1>Vesper is still</h1><p class="pcSub">${line}</p><p class="pcSub">SURVIVE COMPLETE<br><small>Vesper designed by Isaac’s little brother.</small></p>`,
  [{label:'Return to the map',act:()=>PV()?.menu()},{label:'Return to title menu',act:()=>{location.href='index.html';}}]),900);
}
function say(kind){
 const s=PV()?.state();if(!s||s.view.replay)return;const id=s.view.g?.room.id;
 if(kind==='echo-leave')PV().announce(id==='cl41-mirror'?'“You left me here.”':'“Stay with me.”',200);
 if(kind==='vesper-wake')PV().announce(merged()?'“So. This time you brought all of yourself.”':'“Forty roads, and still you bring only the half of yourself you can bear to look at.”',300);
}
// Explore's music for the last road; each of Vesper's forms keeps its own theme.
const FORM_TRACKS=['iron-oath-of-the-night-attack','through-the-void-breach','fractured-the-black-procession','the-breaking-of-the-keeps'];
function track(n,g){
 if(n===41)return 'audio/music/fractured-the-last-spark-of-darrow.mp3';
 if(n!==42)return null;const z=g?.vesper;
 return 'audio/music/'+(z&&z.mode!=='idle'?FORM_TRACKS[z.form]:'fractured-the-last-spark-of-darrow')+'.mp3';
}
root.BladefallClimbFinale=Object.freeze({state,open,merged,vesperNeed,mapState,preview,setPreview,unlockAll,unlockedAll,setUnlockedAll,canPlay,echoYielded,vesperStill,choose,say,track,NEED,worlds:[W41,W42],
 reset(){write({});}});
})(typeof window!=='undefined'?window:globalThis);
