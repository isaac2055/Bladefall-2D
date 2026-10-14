// Local authoring source. Re-running deliberately clears this draft's route proofs.
import {writeFileSync} from 'node:fs';
import {coreCrumbleGrace} from './core-difficulty.mjs';
// The Landing Shores: rock basins each on their own tide (tides:[…]). Floats ride the sea and pin the careless to
// the thorns above; drowned thorns are safe only while the sea covers them; currents push the swimmer; crumbling
// stone gives no grace. Sections are written one beat at a time and proved in order.
const cols=168,rows=128,m=Array.from({length:rows},()=>Array(cols).fill('.'));
let strict=false,base=null;
function rect(c,r,w,h,ch='#'){for(let y=r;y<r+h;y++)for(let x=c;x<c+w;x++){if(!m[y]||x<0||x>=cols)throw Error('Outside room '+[c,r]);if(strict&&base[y][x]==='.'&&m[y][x]!=='.'&&!(m[y][x]==='#'&&ch==='#'))throw Error('Overlap at '+[x,y]+': '+m[y][x]+' under '+ch);m[y][x]=ch;}}
const put=(c,r,ch)=>rect(c,r,1,1,ch);
const crown=(c,r,h,w=2)=>{rect(c,r,w,h);rect(c,r-1,w,1,'^');rect(c,r+h,w,1,'v');};
rect(0,0,cols,1);rect(0,1,1,rows-1);rect(cols-1,1,1,rows-1);rect(1,1,1,rows-3,'>');rect(cols-2,1,1,rows-3,'<');rect(1,rows-2,cols-2,1,'^');rect(0,rows-1,cols,1);
const stages=[],checkpoints=[],tides=[],currents=[];
const land=(c,r,w,extra={})=>stages.push({x:(c+Math.floor(w/2))*8,y:r*8-11,...extra});
const onFloat=(c,r,w,extra={})=>stages.push({x:(c+Math.floor(w/2))*8,y:r*8-11-40,air:true,ground:true,toleranceY:48,...extra});
const save=(c,r,w,name,facing=1)=>{rect(c,r,w,1);checkpoints.push({c:c+Math.floor(w/2),r:r-1,width:w*8,facing,name});land(c,r,w);};
// a basin: walls, a thorn floor, rock beneath; its tide rises from below the thorns to `high`
const basin=(c0,c1,top,bot,high,beat,shallow=false)=>{const deep=shallow?bot+3-top:rows-1-top;if(shallow)rect(c0-1,top+3,1,deep-3);else rect(c0-1,top,1,deep);rect(c1+1,top,1,deep);rect(c0,bot,c1-c0+1,1,'^');rect(c0,bot+1,c1-c0+1,shallow?2:rows-2-bot);tides.push({c0,c1,low:bot+1,high,r0:Math.min(high,top)-3,r1:bot+1,...beat});};
const SECTIONS=[
 // 1 · The Ebb: off crumbling stone onto a float; ride the sea and leave before the float meets the thorns above;
 // hyper off the float across a thorn reef to crumbling stone, straight onto a capped wall, and over its cap.
 ()=>{rect(3,118,7,1,'~');put(5,117,'P');
  basin(12,25,118,126,112,{hold:40,move:70,phase:0});rect(17,125,4,1,'F');rect(15,109,8,1,'v');
  onFloat(17,125,4);
  rect(26,120,12,1,'^');rect(26,121,12,rows-2-121);
  rect(35,113,4,1,'~');land(35,113,4);
  crown(46,98,15);stages.push({x:45*8-2,y:104*8,grip:true,toleranceY:48});
  save(51,99,7,'The Ebb');},
 // 2 · The Undertow: a wide basin whose thorn floor is safe only under water, and a current that pushes you back.
 // Swim east while the sea holds, out through a low sea-gate under thorns, onto crumbling stone and a seed.
 ()=>{rect(51,100,7,rows-2-100);
  basin(59,92,99,112,101,{hold:170,move:60,phase:40});
  rect(87,92,6,8);rect(87,99,6,1,'v');rect(87,103,6,9);rect(93,92,1,8);rect(93,100,1,3,'.');   // the sea-gate: a tunnel at rows 100–102
  rect(59,100,1,1,'.');currents.push({c:62,r:100,w:24,h:12,dx:-40,dy:0});
  stages.push({x:70*8,y:101*8,air:true,swim:true,toleranceY:24,toleranceX:40});
  stages.push({x:90*8,y:101*8,air:true,swim:true,toleranceY:24,toleranceX:24});
  rect(97,101,4,1,'~');land(97,101,4);
  put(106,95,'b');stages.push({x:106*8,y:95*8,event:'pogo-loft',eventAt:true,eventRadius:24});
  save(113,92,7,'The Undertow');},
 // 3 · The Relay: three wells step up the cliff, each float on its own clock and each with thorns over its peak.
 // Leave every float before its thorns, for the next float as it rises; capped walls between leave nowhere to stand.
 ()=>{rect(113,93,7,rows-2-93);
  const wells=[[122,127,92,104,0],[131,136,84,98,70],[140,145,78,92,140]];
  for(const [c0,c1,top,bot,phase]of wells){basin(c0,c1,top,bot,top-1,{hold:30,move:70,phase});rect(c0-1,top-1,1,1,'^');rect(c1+1,top-1,1,1,'^');rect(c0+1,bot-1,4,1,'F');rect(c0,top-4,c1-c0+1,1,'v');onFloat(c0+1,bot-1,4,{y:((bot-1)+(top-2))/2*8-11,toleranceY:((bot-1)-(top-2))*4+8});}
  save(150,76,7,'The Relay');},
 // 4 · The Spouts: back west over the cliff. Crumbling stone into a water column whose current carries you up past
 // thorned walls; leave it at the top for a ledge, a seed and crumbling stone, then the second spout to the save.
 ()=>{rect(150,77,7,rows-2-77);
  crown(158,58,16);stages.push({x:157*8-2,y:66*8,grip:true,toleranceY:48});
  put(154,63,'o');rect(144,62,4,1,'~');land(144,62,4);
  rect(130,44,3,23,'w');rect(130,67,3,1);rect(129,46,1,21,'>');currents.push({c:130,r:44,w:3,h:23,dx:0,dy:-120});
  stages.push({x:131*8,y:56*8,air:true,swim:true,toleranceY:48,toleranceX:16});
  rect(119,45,5,1);land(119,45,5);
  put(112,40,'b');stages.push({x:112*8,y:40*8,event:'pogo-loft',eventAt:true,eventRadius:24});
  rect(98,43,4,1,'~');land(98,43,4);
  rect(88,28,3,23,'w');rect(88,51,3,1);rect(87,30,1,21,'>');rect(91,30,1,21,'<');currents.push({c:88,r:28,w:3,h:23,dx:0,dy:-120});
  stages.push({x:89*8,y:40*8,air:true,swim:true,toleranceY:48,toleranceX:16});
  save(75,30,7,'The Spouts',-1);},
 // 5 · The Drowned Stair: down the west cliff through three basins whose seas rise in turn. Drop only into a full
 // basin (its thorns are drowned), climb its west rim onto crumbling stone, and wait for the next sea below.
 ()=>{const steps=[[57,69,40,54,0],[38,50,52,66,90],[19,31,64,78,180]];rect(72,40,4,1,'~');rect(72,41,4,3);land(72,40,4);
  for(const [i,[c0,c1,top,bot,phase]]of steps.entries()){basin(c0,c1,top,bot,top+1,{hold:70,move:60,phase},true);rect(c0,top-4,c1-c0+1,1,'v');
   stages.push({x:(c0+Math.floor((c1-c0)/2))*8,y:(top+2)*8,air:true,swim:true,toleranceY:24,toleranceX:40});
   if(i<2){rect(c0-5,top+12,4,1,'~');rect(c0-5,top+13,4,3);}}
  save(5,70,7,'The Drowned Stair',-1);rect(5,71,7,3);},
 // 6 · The Last Tide: up the third spout, a float that rises into thorns, a hyper to crumbling stone, a seed and
 // stepping stones over the cliff top, a last basin swum against its undertow while the sea holds, and a final
 // seed, crumbling stone and mid-air refill for the dash out of the east wall.
 ()=>{rect(13,40,3,29,'w');rect(13,69,3,1);rect(16,42,1,27,'<');currents.push({c:13,r:40,w:3,h:29,dx:0,dy:-130});
  stages.push({x:14*8,y:54*8,air:true,swim:true,toleranceY:48,toleranceX:16});
  rect(18,39,4,1,'~');land(18,39,4);
  basin(26,40,31,42,30,{hold:40,move:70,phase:60},true);rect(31,41,4,1,'F');rect(29,23,10,1,'v');
  onFloat(31,41,4,{y:36*8-11,toleranceY:48});
  rect(48,27,4,1,'~');land(48,27,4);
  put(58,21,'b');stages.push({x:58*8,y:21*8,event:'pogo-loft',eventAt:true,eventRadius:24});
  rect(69,23,3,1,'~');land(69,23,3);
  rect(78,21,6,1);land(78,21,6);   // a stone lookout: read the last sea before you go
  basin(96,120,20,30,20,{hold:150,move:60,phase:0},true);currents.push({c:98,r:20,w:20,h:10,dx:-50,dy:0});
  stages.push({x:108*8,y:21*8,air:true,swim:true,toleranceY:24,toleranceX:40});
  put(129,14,'b');stages.push({x:129*8,y:14*8,event:'pogo-loft',eventAt:true,eventRadius:24});
  rect(139,17,4,1,'~');land(139,17,4);
  put(151,12,'o');rect(cols-2,8,2,9,'.');stages.push({x:cols*8,y:16*8-11,exit:true});}
];
const LIMIT=+((typeof process!=='undefined'&&process.env.SECTION_LIMIT)||SECTIONS.length);
base=m.map(r=>r.slice());SECTIONS.slice(0,LIMIT).forEach((f,i)=>{strict=i>=3;f();});
const room={id:'bank-f112',name:'The Tide Keeps Time',cols,rows,exit:'right',core:17,coreProgressKey:'core-shores',coreProgressRevision:2,coreCheckpoints:checkpoints,crumbleExtraFrames:coreCrumbleGrace(17),movement:'survive-2',aim8:true,dashes:1,study:true,dropThru:true,palette:'shores',rbr:17,lock:[],tides,currents,hint:'Every basin keeps its own tide. A float rides the sea up to the thorns above: leave in time. Drowned thorns are safe only while the sea covers them. Crumbling stone gives no grace.',map:m.map(r=>r.join(''))};
writeFileSync('scripts/room-bank/fractured/112-bank-f112.json',JSON.stringify({room,bank:{side:'fractured',batch:29,run:19,collection:'cores',coreIndex:17,format:'superroom',localOnly:true,acceptance:'candidate',needsReview:true,status:'authoring',author:'Claude',difficulty:5,worlds:[17,37],tags:['tide','float','swim','current','crumble','seed','wall'],newMechanics:['multi-tide'],role:'Landing Shores Core: every basin keeps its own sea',solution:'Read each basin’s tide: ride floats and leave before the thorns, swim drowned reefs while the sea holds, fight currents, and spend crumbling stone at once.',requiredEvents:['splash','core-checkpoint'],requiredEventCounts:{splash:8,'pogo-loft':4,crumble:5,walljump:1,'core-checkpoint':checkpoints.length},coreDescription:'Every basin keeps its own sea. Leave on the tide, not after it.',draft:true,humanReview:'Unverified authoring draft; not published.'},tape:[],verification:{stages,partTapes:[]}},null,2)+'\n');
