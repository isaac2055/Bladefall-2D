/* Survive's rewards (7.319): perfect clears, the twenty plants, C-sides and the four knight skins.

   Perfect clear: a world finished from its start without dying on its road (optional routes do not count, and for
   now skips are allowed, so a perfect clear is always possible). A perfect base world gives the bottom half of its
   world's plant; a perfect Fractured world gives the top half. With both halves, that world's C-side unlocks. The
   C-sides themselves are not built yet (docs/plans/c-sides.md is the handoff); csideBeaten(k) records one beaten.

   Skins (Settings-free: the world map's Garden & skins card). Each is earned once and kept:
     ascendant   every base world (1–20) beaten
     fractured   every Fractured world (21–40) beaten
     heartbound  every heart and Vesper beaten (100%)
     gardener    every C-side beaten (the rarest)
   A locked skin shows as a silhouette; pressing it five times previews it in the card only. It can be worn only once
   earned. Each skin looks different with and without a dash: its scarf, plume and trim carry the dash colour.

   State: localStorage bladefall.climb.rewards.v1 {perfect:{n:true}, csides:{k:true}, skin:'id'|null, seen:{…}}. */
(function(root){
'use strict';
const KEY='bladefall.climb.rewards.v1';
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY))||{};}catch(e){return {};}};
const write=v=>{try{localStorage.setItem(KEY,JSON.stringify(v));}catch(e){}};
const state=()=>Object.assign({perfect:{},csides:{},skin:null,seen:{}},read());

// One plant per world pair; the bottom half from the base world, the top from its Fractured echo.
const PLANTS=Object.freeze([
 null,
 {name:'Outskirts Trumpet',root:'Trumpet Bulb',top:'White Trumpet',col:'#f4f0e0',root_col:'#c9b98a'},
 {name:'Black Woods Oak',root:'Taproot',top:'Crown of Leaves',col:'#5f9a52',root_col:'#7a5a3a'},
 {name:'Causeway Ivy',root:'Clinging Rootlets',top:'Climbing Vine',col:'#4f8a4a',root_col:'#8a6a4a'},
 {name:'Updraft Dandelion',root:'Milkroot',top:'Seed Clock',col:'#f2f0e8',root_col:'#b0905a'},
 {name:'Marksman Thistle',root:'Spined Root',top:'Thistle Head',col:'#b07ad0',root_col:'#8a7a5a'},
 {name:'Keep Mushroom',root:'Mycelium',top:'Fruiting Body',col:'#c94a3a',root_col:'#e9dfc9'},
 {name:'Warden Fern',root:'Rhizome',top:'Fiddlehead',col:'#6aa05a',root_col:'#6a4a2a'},
 {name:'Frostfell Snowdrop',root:'Snow Bulb',top:'Snowdrop Bell',col:'#e8f4ff',root_col:'#a8b8c8'},
 {name:'Sorcerer’s Glass Lotus',root:'Lotus Tuber',top:'Glass Bloom',col:'#cfe8ff',root_col:'#8aa0b0'},
 {name:'Ember Cactus',root:'Water Root',top:'Ember Bloom',col:'#ff7a3a',root_col:'#7a6a3a'},
 {name:'Colossus Sunflower',root:'Deep Root',top:'Sun Head',col:'#ffc83a',root_col:'#6a4a2a'},
 {name:'Inverted Orchid',root:'Air Roots',top:'Orchid Spur',col:'#d08ae0',root_col:'#9ab07a'},
 {name:'Tyrant Moonflower',root:'Moon Corm',top:'Moonflower',col:'#e0d8ff',root_col:'#5a4a7a'},
 {name:'Abyss Thornrose',root:'Rose Cane',top:'Thornrose',col:'#c0304a',root_col:'#4a3a2a'},
 {name:'Deep Line Kelp',root:'Holdfast',top:'Kelp Frond',col:'#4a8a6a',root_col:'#5a4a2a'},
 {name:'Cliffside Edelweiss',root:'Crevice Root',top:'Edelweiss Star',col:'#f0f0e8',root_col:'#8a8a7a'},
 {name:'Shore Sea Holly',root:'Sand Runner',top:'Holly Thistle',col:'#8ab0d8',root_col:'#c8b88a'},
 {name:'Colony Clover',root:'Stolon',top:'Four-Leaf Clover',col:'#5ac85a',root_col:'#6a5a3a'},
 {name:'Pilgrim’s Lavender',root:'Woody Crown',top:'Lavender Spike',col:'#a08ae0',root_col:'#7a6a4a'},
 {name:'Sunspire Lily',root:'Golden Bulb',top:'Sunspire Lily',col:'#ffe08a',root_col:'#c8a85a'}]);

// (7.321) Isaac's pick: the first four keep the base knight's plume (no crest); the second set carries its own touches.
// how: earned by play; buy: a share of every heart collected opens it instead (hearts are not spent).
const SKINS=Object.freeze([
 {id:'ascendant',name:'The Ascendant',how:'Beat every base world (1–20)',
  pal:{helm:'#e8c873',helmD:'#a8873a',visor:'#1a1208',body:'#1f6b46',trimOn:'#7fffb0',trimOff:'#3a6a50',belt:'#3a2a12',hilt:'#ffe9a8',legs:'#132a1e',scarfOn:'#7fffb0',scarfOff:'#4a6a58'}},
 {id:'fractured',name:'The Fractured',how:'Beat every Fractured world (21–40)',
  pal:{helm:'#d7c8ff',helmD:'#7a5ec0',visor:'#120a24',body:'#2a1d4a',trimOn:'#c39cff',trimOff:'#4a4060',belt:'#1a1230',hilt:'#efe4ff',legs:'#140e26',scarfOn:'#c39cff',scarfOff:'#4a4060'}},
 {id:'echo',name:'Echo Self',how:'Beat your Echo and Vesper',fx:'echo',
  pal:{helm:'#b9b7d4',helmD:'#7d7a9c',visor:'#30204d',body:'#645087',trimOn:'#86e6d8',trimOff:'#4a4a6a',belt:'#312940',hilt:'#eee5ff',legs:'#312940',scarfOn:'#86e6d8',scarfOff:'#5a5a78'}},
 {id:'gilded',name:'Gilded Sovereign',how:'Every heart, your Echo and Vesper',fx:'glint',
  pal:{helm:'#ffd75a',helmD:'#b8861c',visor:'#c0182a',body:'#e8b23a',trimOn:'#fff3b0',trimOff:'#9a7a2a',belt:'#7a1a24',hilt:'#fff8d8',legs:'#8a5a12',scarfOn:'#fff1a0',scarfOff:'#a08a4a'}},
 {id:'prism',name:'Prism Paladin',how:'Everything: every world and heart, your Echo, Vesper and every C-side',fx:'prism',
  pal:{helm:'#ffffff',helmD:'#c8d8e8',visor:'#3a4a6a',body:'#e8f0f8',trimOn:'prism',trimOff:'#a8b8c8',belt:'#8ad8ff',hilt:'#ffffff',legs:'#9aaabb',scarfOn:'prism',scarfOff:'#8a9aaa'}},
 {id:'ember',name:'Ember Wretch',how:'',buy:.5,fx:'ember',
  pal:{helm:'#3a2a24',helmD:'#1a120e',visor:'#ffb030',body:'#2a1a14',trimOn:'#ff7a20',trimOff:'#6a3a1a',belt:'#ff5a10',hilt:'#ffd080',legs:'#140c08',scarfOn:'#ff9a30',scarfOff:'#5a3a2a'}},
 {id:'starlit',name:'Starlit Regalia',how:'Beat the Abyss King',fx:'stars',
  pal:{helm:'#e8ecff',helmD:'#8a94c8',visor:'#0a0c22',body:'#141a44',trimOn:'#bcd0ff',trimOff:'#3a4270',belt:'#c8d0ff',hilt:'#ffffff',legs:'#0a0e2a',scarfOn:'#9fd0ff',scarfOff:'#3a4a6a'}},
 {id:'haunt',name:'The Haunt',how:'Beat the Fractured King',fx:'ghost',
  pal:{helm:'#9adfb8',helmD:'#4a8a6a',visor:'#d8ffe0',body:'#5aa080',trimOn:'#c8ffd8',trimOff:'#4a6a5a',belt:'#2a4a3a',hilt:'#d8ffe0',legs:'#3a6a50',scarfOn:'#8affb8',scarfOff:'#3a5a4a'}},
 {id:'heartbound',name:'Heartbound',how:'',buy:.75,
  pal:{helm:'#fff4f8',helmD:'#d9a2b8',visor:'#3a1424',body:'#7a2a4a',trimOn:'#ff9fd0',trimOff:'#8a5a6a',belt:'#ffd36b',hilt:'#fff4f8',legs:'#3a1424',scarfOn:'#ff6fb5',scarfOff:'#7a5a68'}},
 {id:'gardener',name:'The Gardener',how:'',buy:.25,
  pal:{helm:'#5a3e24',helmD:'#2e1e10',visor:'#e9dfc9',body:'#1a3a24',trimOn:'#e9dfc9',trimOff:'#4a3a2a',belt:'#2e1e10',hilt:'#c8e8a0',legs:'#120c06',scarfOn:'prism',scarfOff:'#5a4a32'}}]);

/* ---------------------------------------------------------------- the reckoning */
const CL=()=>root.BladefallClimb,PV=()=>root.BladefallPitchView?.climb;
function climbSave(){try{return JSON.parse(localStorage.getItem('bladefall.climb.v1'))||{};}catch(e){return {};}}
function beaten(n){const s=PV()?.state?.();return !!(climbSave().cleared?.[n]||s?.atlas?.complete?.(n));}
function hearts(){return PV()?.heartTotals?.()||{got:0,total:0};}
function heartsAll(){const h=hearts();return !!(h.total&&h.got>=h.total);}
const allBeaten=(a,z)=>{for(let n=a;n<=z;n++)if(!beaten(n))return false;return true;};
const fin=()=>root.BladefallClimbFinale?.state?.()||{};
function csidesAll(){const r=state();for(let k=1;k<=20;k++)if(!r.csides[k])return false;return true;}
// hearts needed to open a skin by its share (rounded up)
function price(s){const h=hearts();return s.buy&&h.total?Math.ceil(h.total*s.buy):null;}
function earned(id){
 if(root.BladefallClimbFinale?.unlockedAll?.())return true;   // (7.321) the five-press 100% view opens every skin too (and closes them again)
 const r=state(),s=SKINS.find(x=>x.id===id);if(!s)return false;
 if(s.buy&&r.bought?.[id])return true;
 if(id==='ascendant')return allBeaten(1,20);
 if(id==='fractured')return allBeaten(21,40);
 if(id==='echo')return !!(fin().echo&&fin().vesper);
 if(id==='gilded')return heartsAll()&&!!(fin().echo&&fin().vesper);
 if(id==='prism')return heartsAll()&&!!(fin().echo&&fin().vesper)&&allBeaten(1,40)&&csidesAll();
 if(id==='starlit')return beaten(14);
 if(id==='haunt')return beaten(34);
 return false;
}
function canBuy(id){const s=SKINS.find(x=>x.id===id),p=s&&price(s);return !!(p&&!earned(id)&&hearts().got>=p);}
function buy(id){if(!canBuy(id))return false;const r=state();r.bought=r.bought||{};r.bought[id]=true;write(r);return true;}
function plantOf(n){return PLANTS[n>20?n-20:n]||null;}
function halves(k){const r=state();return {root:!!r.perfect[k],top:!!r.perfect[k+20]};}
function csideOpen(k){const h=halves(k);return h.root&&h.top;}
// a world finished perfectly: its half of the plant, and maybe its C-side
function perfect(n){
 if(n<1||n>40)return null;const r=state(),k=n>20?n-20:n,p=PLANTS[k];if(r.perfect[n])return {already:true,plant:p};
 r.perfect[n]=true;write(r);const h=halves(k);
 return {half:n>20?p.top:p.root,plant:p,cside:h.root&&h.top,k};
}
function csideBeaten(k){const r=state();r.csides[k]=true;write(r);}
function skin(){const r=state(),s=SKINS.find(x=>x.id===r.skin);return s&&earned(s.id)?s:null;}
function wear(id){const r=state();if(id&&!earned(id))return false;r.skin=id||null;write(r);return true;}
// newly earned skins, said once
function newlyEarned(){const r=state(),out=[];for(const s of SKINS)if(earned(s.id)&&!r.seen[s.id]){r.seen[s.id]=true;out.push(s);}if(out.length)write(r);return out;}

/* ---------------------------------------------------------------- drawing a knight in a skin */
const px=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
function prism(t){const h=(t*4)%360;return `hsl(${h},90%,70%)`;}
function scarf(pal,dash,t){const c=dash?pal.scarfOn:pal.scarfOff;return c==='prism'?prism(t||0):c;}
// the knight's 8x11 sprite in a skin (the same shape as the default knight, drawn from the feet)
function sprite(b,x,y,f,pose,pal,dash,t=0,squash=1,stretch=1,run=0,silhouette=null,fx=null){
 // a prism colour shifts with time; an echo is trailed by a fainter self while the dash is held; a haunt is see-through
 if(!silhouette){pal={...pal};for(const k in pal)if(pal[k]==='prism')pal[k]=prism(t+(k==='trimOn'?60:0));}
 if(fx==='echo'&&dash&&!silhouette){const a=b.globalAlpha;b.globalAlpha=a*.35;sprite(b,x-3*f,y,f,pose,pal,dash,t,squash,stretch,run,null,null);b.globalAlpha=a;}
 const alpha0=b.globalAlpha;if(fx==='ghost'&&!silhouette)b.globalAlpha=alpha0*(dash?.8:.5);
 const sy=Math.min(1.35,stretch)/Math.max(1,squash),sx=Math.max(1,squash)/Math.min(1.35,stretch);
 const hgt=Math.round(11*sy),wid=Math.max(6,Math.round(8*sx)),bx=x+4-wid/2,by=y+11-hgt;
 const C=k=>silhouette||pal[k],sc=silhouette||scarf(pal,dash,t),trim=silhouette||(dash?pal.trimOn:pal.trimOff);
 if(pose==='dash'&&!silhouette){px(b,bx,by,wid,hgt,sc);return;}
 const leg=pose==='run'?Math.floor(run)%2:0;
 px(b,bx+1,by+hgt-2,2,2,C('legs'));px(b,bx+wid-3,by+hgt-2,2,2,C('legs'));if(pose==='run')px(b,bx+(leg?0:2),by+hgt-1,2,1,C('legs'));
 px(b,bx+1,by+4,wid-2,hgt-6,C('body'));px(b,bx+1,by+4,wid-2,1,trim);
 px(b,bx+1,by+hgt-4,wid-2,1,C('belt'));px(b,f>0?bx:bx+wid-1,by+hgt-6,1,4,C('hilt'));
 px(b,bx+1,by,wid-2,5,C('helm'));px(b,bx+1,by+4,wid-2,1,C('helmD'));if(!silhouette)px(b,f>0?bx+wid-4:bx+2,by+2,2,1,pal.visor);
 // the crest: each skin's own mark, lit with the dash colour while a dash is held
 const crest=pal.crest,hi=silhouette||(dash?sc:C('helmD'));
 if(crest==='crown'){px(b,bx+1,by-2,1,2,hi);px(b,bx+wid/2-0.5,by-3,1,3,hi);px(b,bx+wid-2,by-2,1,2,hi);}
 else if(crest==='shard'){px(b,bx+wid/2-1,by-3,2,3,hi);px(b,f>0?bx:bx+wid-1,by+4,1,2,hi);}
 else if(crest==='heart'){px(b,bx+wid/2-2,by-2,1,1,hi);px(b,bx+wid/2+1,by-2,1,1,hi);px(b,bx+wid/2-2,by-1,4,1,hi);px(b,bx+wid/2-1,by,2,1,hi);if(!silhouette)px(b,bx+wid/2-1,by+6,2,1,dash?sc:pal.trimOff);}
 else if(crest==='flower'){px(b,bx+wid/2-1,by-3,2,2,hi);px(b,bx+wid/2-2,by-2,1,1,silhouette||'#8ad06a');px(b,bx+wid/2+1,by-2,1,1,silhouette||'#8ad06a');}
 else px(b,bx+wid/2-1,by-2,2,2,sc);
 px(b,f>0?bx+1:bx+wid-3,by+4,2,1,sc);
 if(pose==='climb')px(b,f>0?bx+wid-1:bx,by+3,1,3,C('helm'));
 if(pose==='rise')px(b,f>0?bx:bx+wid-1,by+3,1,2,C('helm'));
 if(!silhouette&&fx){
  if(fx==='glint'){const g=(t%40)/40;px(b,bx+1+g*(wid-2),by+1+g*(hgt-3),1,1,'#ffffff');}
  else if(fx==='stars'){for(const [sx,sy] of [[2,5],[5,7],[3,8]])px(b,bx+sx,by+sy,1,1,dash?'#ffffff':'#8a94c8');}
  else if(fx==='prism'&&dash){for(let q=0;q<4;q++)px(b,f>0?bx-2-q:bx+wid+1+q,by+4+q,1,1,prism(t+q*40));}
  else if(fx==='ghost')px(b,f>0?bx+wid-4:bx+2,by+2,2,1,dash?'#c8ffd8':'#6a9a80');
  else if(fx==='ember'){px(b,bx+2,by+6,1,1,'#ff7a20');px(b,bx+wid-3,by+hgt-3,1,1,'#ff5a10');if(!dash){const a=b.globalAlpha;b.globalAlpha=a*.6;px(b,bx+wid/2,by-3-((t>>3)%2),1,1,'#7a7a7a');b.globalAlpha=a;}}
 }
 b.globalAlpha=alpha0;
}

/* ---------------------------------------------------------------- the Garden & skins card */
function card(api,back){
 const r=state(),open=k=>csideOpen(k);
 const rows=PLANTS.slice(1).map((p,i)=>{const k=i+1,h=halves(k),w1=CL()?.world(k)?.name||('World '+k),w2=CL()?.world(k+20)?.name||('World '+(k+20));
  const cw=(root.BladefallClimbCsides?.worlds||[]).find(w=>w.cside===k),canPlay=cw&&(open(k)||root.BladefallClimbFinale?.unlockedAll?.());
  return `<tr><td style="color:${p.col}">✿ ${p.name}</td><td title="perfect ${w1}">${h.root?'● '+p.root:'○ '+p.root}</td><td title="perfect ${w2}">${h.top?'● '+p.top:'○ '+p.top}</td><td>${canPlay?`<button class="pcBtn ghost" data-cside="${cw.n}" style="padding:2px 8px">${r.csides[k]?'C-side ✓ · again':'Play C-side'}</button>`:r.csides[k]?'C-side ✓':open(k)?'<span style="color:#ffd98a">C-side open · coming soon</span>':''}</td></tr>`;}).join('');
 // (7.326) Only the skins you have, and the next one on each track: the story (base, Fractured, Echo, all hearts,
 // everything) and the hearts (21, 41, 61). Starlit Regalia and the Haunt are surprises, shown once earned.
 const STORY=['ascendant','fractured','echo','gilded','prism'],HEARTS=['gardener','ember','heartbound'];
 const nextOf=list=>list.find(id=>!earned(id));
 const visible=SKINS.filter(s=>earned(s.id)||s.id===nextOf(STORY)||s.id===nextOf(HEARTS));
 const howOf=s=>s.buy?`${price(s)} hearts`:s.how;
 const sk=visible.map(s=>`<button class="pcChoice" data-skin="${s.id}" style="text-align:left;display:flex;align-items:center;gap:10px"><canvas width="96" height="40" data-skin-art="${s.id}" style="image-rendering:pixelated;width:144px;height:60px;flex:none"></canvas><span style="display:flex;flex-direction:column;gap:2px;min-width:0"><span class="pcName">${earned(s.id)?s.name:'???'}${r.skin===s.id&&earned(s.id)?' · worn':''}</span><span class="pcDesc">${howOf(s)}${earned(s.id)?'':canBuy(s.id)?' · <b style="color:#ffd98a">open it now</b>':''}</span></span></button>`).join('');
 api.showOverlay(`<div class="pcCard wide"><h1>Garden &amp; skins</h1>
  <p class="pcSub">Finish a world without dying on its road (optional routes don’t count) for half of its plant: the bottom from the base world, the top from its Fractured echo. Both halves open that world’s C-side.</p>
  <table class="pcTable" style="font-size:.85em"><tr><td></td><td>Bottom (base)</td><td>Top (Fractured)</td><td></td></tr>${rows}</table>
  <h2 class="pcPart">Skins</h2><p class="pcSub">With a dash · without. ♥ ${hearts().got} collected (never spent). Press a locked one five times for a glimpse.</p>
  <div class="pcGrid"><button class="pcChoice" data-skin="" style="text-align:left;display:flex;align-items:center;gap:10px"><canvas width="96" height="40" data-skin-art="" style="image-rendering:pixelated;width:144px;height:60px;flex:none"></canvas><span style="display:flex;flex-direction:column;gap:2px;min-width:0"><span class="pcName">The knight${!r.skin?' · worn':''}</span><span class="pcDesc">The original</span></span></button>${sk}</div>
  <button class="pcBtn" id="rwBack" data-back>Done</button></div>`);
 const KNIGHT={helm:'#b9c2cf',helmD:'#7c8796',visor:'#1a1f28',body:'#2d4a78',trimOn:'#4a6aa0',trimOff:'#4a6aa0',belt:'#6b4e2a',hilt:'#c9ced8',legs:'#1c2130',scarfOn:'#ffb347',scarfOff:'#56708c'};
 const peek={},paint=()=>{for(const cv of document.querySelectorAll('[data-skin-art]')){const id=cv.dataset.skinArt,s=id?SKINS.find(x=>x.id===id):{id:'',pal:KNIGHT},b=cv.getContext('2d');b.clearRect(0,0,96,40);
  const show=!id||earned(id)||peek[id]>=5,sil=show?null:'#2a2f3a',t=performance.now()/16;
  // two still poses (with a dash, without one): the stride is held, so nothing jitters
  b.save();b.scale(3,3);sprite(b,4,1,1,'idle',s.pal,true,t,1,1,0,sil,s.fx);sprite(b,20,1,-1,'idle',s.pal,false,t,1,1,0,sil,s.fx);b.restore();}};
 paint();const timer=setInterval(()=>{if(!document.querySelector('[data-skin-art]')){clearInterval(timer);return;}paint();},100);
 document.querySelectorAll('[data-skin]').forEach(el=>el.onclick=()=>{const id=el.dataset.skin;
  if(!id){wear(null);card(api,back);return;}
  if(earned(id)){wear(id);card(api,back);return;}
  if(canBuy(id)){buy(id);wear(id);card(api,back);return;}   // (7.321) opened by the hearts you have collected (they are not spent)
  peek[id]=(peek[id]||0)+1;if(peek[id]===5){const s=SKINS.find(x=>x.id===id);el.querySelector('.pcName').textContent=s.name;el.querySelector('.pcDesc').textContent=howOf(s)+' · a glimpse';}paint();});
 document.querySelectorAll('[data-cside]').forEach(el=>el.onclick=()=>{clearInterval(timer);root.BladefallPitchView?.climb?.startWorld(+el.dataset.cside);});
 document.getElementById('rwBack').onclick=()=>{clearInterval(timer);back();};
}

root.BladefallClimbRewards=Object.freeze({PLANTS,SKINS,state,earned,canBuy,buy,price,perfect,halves,csideOpen,csideBeaten,skin,wear,newlyEarned,sprite,scarf,plantOf,card,
 reset(){write({});}});
})(typeof window!=='undefined'?window:globalThis);
