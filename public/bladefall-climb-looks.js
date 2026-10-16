/* Ascend (7.342): every room wears the look of the world it stands in. Presentation only: no room definition,
   collision, tape or save is changed, and a copied room (Pause → Edit this level) keeps its own palette field.

   - Base worlds (1–20): a room imported from the Room Bank (and each world's closing superroom) was authored with
     its bank palette (path, cliffs, foundry, …), some of which Ascend never defined, so it drew as the generic
     footing grey in the middle of the world's own stone. It now takes its world's palette; native rooms keep theirs
     (the Black Woods' mothlight and thicket glades, for one, are the woods' own).
   - Fractured worlds (21–40) all shared one palette that Ascend never defined either (every one drew as footing),
     and one generic violet skyline. Each now has its own palette and sky, taken from that world's Explore art
     (bladefall-fractured-*-art.js), and its backdrop is the base world's skyline under the fractured sky. */
(function(root){
'use strict';
const BASE={1:'outskirts',2:'woods',3:'causeway',4:'updrafts',5:'marksman',6:'keep',7:'gaol',8:'frost',9:'court',10:'ember',
 11:'foundry',12:'inversion',13:'citadel',14:'throne',15:'deepline',16:'cliffs',17:'shores',18:'colony',19:'palace',20:'sunspire'};
// sky: the backdrop gradient (top, horizon), from the Explore world's sky. The rest is the tile palette.
const FRACTURED={
 21:{name:'fr-outskirts',sky:['#07060f','#4a1c2a'],sky0:'#07060f',sky1:'#140d22',far:'#1c1428',rock:'#3e3646',rockD:'#2b2530',edge:'#a090c0',moss:'#7a6a9a',accent:'#c9a8ff'},
 22:{name:'fr-woods',sky:['#05060c','#2a1a34'],sky0:'#05060c',sky1:'#0c1020',far:'#151722',rock:'#352f3d',rockD:'#221e28',edge:'#7f9286',moss:'#4e6a4a',accent:'#ffd27a'},
 23:{name:'fr-causeway',sky:['#07050a','#3a1a14'],sky0:'#07050a',sky1:'#140a10',far:'#1a1214',rock:'#433838',rockD:'#2a2424',edge:'#b08a74',moss:'#6a3a24',accent:'#f0d890'},
 24:{name:'fr-updrafts',sky:['#04050b','#241a3a'],sky0:'#04050b',sky1:'#0a0d1c',far:'#141724',rock:'#3c3848',rockD:'#23212c',edge:'#8aa6b4',moss:'#7a52c8',accent:'#c8ebff'},
 25:{name:'fr-marksman',sky:['#06050c','#2e1a30'],sky0:'#06050c',sky1:'#100c1e',far:'#15121e',rock:'#3a3038',rockD:'#241d24',edge:'#a58a70',moss:'#5c4430',accent:'#e6d296'},
 26:{name:'fr-keep',sky:['#05050a','#221a2c'],sky0:'#05050a',sky1:'#0c0c18',far:'#181622',rock:'#3e3a48',rockD:'#26242e',edge:'#8a94a8',moss:'#5a6272',accent:'#9fd6ff'},
 27:{name:'fr-gaol',sky:['#07050a','#26192c'],sky0:'#07050a',sky1:'#110c16',far:'#1e1626',rock:'#46384e',rockD:'#2a2031',edge:'#b395ca',moss:'#4e4558',accent:'#e3c48f'},
 28:{name:'fr-frost',sky:['#0a0a10','#34221c'],sky0:'#0a0a10',sky1:'#15121a',far:'#1b1519',rock:'#4a4450',rockD:'#2c2830',edge:'#a8c4d2',moss:'#9fc6dc',accent:'#ffb060'},
 29:{name:'fr-court',sky:['#070910','#1f2638'],sky0:'#070910',sky1:'#0e1320',far:'#121826',rock:'#3e4860',rockD:'#252c3c',edge:'#b8d8ea',moss:'#7fa6c0',accent:'#aadcff'},
 30:{name:'fr-ember',sky:['#070506','#271510'],sky0:'#070506',sky1:'#110b0a',far:'#140d0b',rock:'#4a403a',rockD:'#2a2422',edge:'#9a8a80',moss:'#a0402a',accent:'#ff7a2a'},
 31:{name:'fr-foundry',sky:['#080505','#2c150c'],sky0:'#080505',sky1:'#130a08',far:'#170d0a',rock:'#4e3e34',rockD:'#2e2420',edge:'#8fb0c2',moss:'#7a3a1a',accent:'#ffd27a'},
 32:{name:'fr-inversion',sky:['#07060e','#1d1632'],sky0:'#07060e',sky1:'#0d0a1a',far:'#141024',rock:'#3a3450',rockD:'#2a2636',edge:'#c9a2ff',moss:'#5c5474',accent:'#e0c8ff'},
 33:{name:'fr-citadel',sky:['#07060c','#1c1830'],sky0:'#07060c',sky1:'#0d0b16',far:'#15121f',rock:'#433d50',rockD:'#24212c',edge:'#8a96ad',moss:'#8c8298',accent:'#c47bff'},
 34:{name:'fr-throne',sky:['#05060a','#161a28'],sky0:'#05060a',sky1:'#0a0c14',far:'#11141d',rock:'#3a4658',rockD:'#282b36',edge:'#8aa0b8',moss:'#5a6072',accent:'#d8b7ff'},
 35:{name:'fr-deepline',sky:['#050505','#18140f'],sky0:'#050505',sky1:'#0a0908',far:'#12100c',rock:'#3a3226',rockD:'#241f18',edge:'#b8b0a4',moss:'#4e4436',accent:'#ffc45a'},
 36:{name:'fr-cliffs',sky:['#05070a','#182333'],sky0:'#05070a',sky1:'#0a0f16',far:'#101722',rock:'#3c4856',rockD:'#28313c',edge:'#8aa4b8',moss:'#5c6c7c',accent:'#b4d2ff'},
 37:{name:'fr-shores',sky:['#07080a','#1a2228'],sky0:'#07080a',sky1:'#0c1014',far:'#11161b',rock:'#40392e',rockD:'#2a2620',edge:'#c8d8de',moss:'#4a6a6a',accent:'#ffe3a0'},
 38:{name:'fr-colony',sky:['#08080a','#1c1c20'],sky0:'#08080a',sky1:'#0e0e10',far:'#131316',rock:'#4a4038',rockD:'#302a24',edge:'#8a806e',moss:'#5a5046',accent:'#ffd070'},
 39:{name:'fr-path',sky:['#1a160e','#4a4026'],sky0:'#1a160e',sky1:'#2a2416',far:'#302a1a',rock:'#5e5644',rockD:'#3a3428',edge:'#c8b890',moss:'#8a7a5a',accent:'#ffecaa'},
 40:{name:'fr-sunspire',sky:['#0c0a08','#241f16'],sky0:'#0c0a08',sky1:'#14110c',far:'#1a1712',rock:'#4e4b44',rockD:'#3a3832',edge:'#b8b2a0',moss:'#8a96ad',accent:'#fff0b0'},
};
const palettes={};for(const f of Object.values(FRACTURED))palettes[f.name]=f;
const worldOf=id=>{const m=/^cl(\d+)-/.exec(id||'');return m?+m[1]:null;};
const climbWorld=n=>root.BladefallClimb?.world?.(n)||null;
// The palette name a world is drawn with (its rooms, passages and backdrop).
function worldPalette(n,fallback){
 if(FRACTURED[n])return FRACTURED[n].name;
 return climbWorld(n)?.palette||fallback;
}
// The palette name a room is drawn with: its world's, unless it is a native room of a base world.
function roomPalette(def,n=worldOf(def?.id)){
 if(!def)return null;
 if(!n||n>40)return def.palette;          // Cores, the finale and anything outside the forty worlds keep their own.
 if(FRACTURED[n])return FRACTURED[n].name;
 if(def.campaignImport||def.bank||def.bankOrigin)return worldPalette(n,def.palette);
 return def.palette;
}
// The backdrop and stone-detail theme of a room: the base world's, and whether it is the fractured version.
function theme(def,id=def?.id){
 const n=worldOf(id);
 if(n&&n<=20)return {key:BASE[n],fractured:null,n};
 if(n&&FRACTURED[n])return {key:BASE[n-20],fractured:FRACTURED[n],n};
 return {key:def?.palette,fractured:null,n};
}
// The four colours the borderland between worlds blends (sky, mid, rock, light), for a Fractured world.
const mix=(a,b,t)=>{const n=parseInt(a.slice(1),16),m=parseInt(b.slice(1),16);return '#'+[16,8,0].map(s=>Math.round(((n>>s)&255)*(1-t)+((m>>s)&255)*t).toString(16).padStart(2,'0')).join('');};
function passageColors(n){const f=FRACTURED[n];return f?[mix(f.sky1,f.far,.5),mix(f.rock,f.edge,.45),f.rock,f.accent]:null;}
root.BladefallClimbLooks={BASE,FRACTURED,palettes,worldOf,worldPalette,roomPalette,theme,passageColors};
})(typeof window!=='undefined'?window:globalThis);
