/* The C-sides (7.325): bonus worlds opened by a perfect clear of both halves of a world pair (bladefall-climb-
   rewards.js). Each is a short Survive world, off the atlas, played from the Garden & skins card. Handoff for the
   other nineteen: docs/plans/c-sides.md.

   C-side 1 · Trumpet Hollow (the Outskirts). Candidate E, Claude's one try, beside Codex's candidates A–D in the
   Room Bank. The Outskirts' own devices, at full pressure: crumbling ground that falls under you, refill crystals that
   are the only way across, and survey stakes that must all be lit before the gate opens. Real void under every room.
     1 · The Falling Survey: light two stakes over a road that crumbles behind you.
     2 · Crystal Ladder: no ground to stand on; climb from crystal to crystal.
     3 · The Last Stake: three stakes, high, low and far, and a gate home. */
(function(root){
'use strict';
const CL=root.BladefallClimb;if(!CL)return;
const TAPES=root.BladefallClimbCsideTapes||{};
function grid(cols,rows){return Array.from({length:rows},(_,r)=>Array.from({length:cols},(_,c)=>r===0||c===0||c===cols-1?'#':'.'));}
const put=(g,c,r,ch)=>{if(g[r]&&g[r][c]!==undefined)g[r][c]=ch;};
const run=(g,c0,c1,r,ch)=>{for(let c=c0;c<=c1;c++)put(g,c,r,ch);};
const col=(g,c,r0,r1,ch)=>{for(let r=r0;r<=r1;r++)put(g,c,r,ch);};
const done=g=>g.map(r=>r.join(''));
const seam=(c,r0,r1)=>Array.from({length:r1-r0+1},(_,i)=>[c,r0+i,'#']);
const base={movement:'survive-2',aim8:true,dashes:1,study:true,dropThru:true,palette:'outskirts',cside:1};

// 1 · The Falling Survey (48×23): two stakes high over a crumbling road, the gate at the far end
function falling(){const g=grid(48,23);
 run(g,1,5,21,'#');run(g,1,5,22,'#');run(g,42,46,21,'#');run(g,42,46,22,'#');run(g,6,41,22,'^');
 for(const c of [9,16,23,30,37])run(g,c,c+2,18,'~');
 put(g,13,14,'o');put(g,27,14,'o');put(g,35,13,'o');
 put(g,19,9,'c');put(g,33,8,'c');
 col(g,47,17,20,'G');put(g,2,20,'P');return done(g);}
// 2 · Crystal Ladder (40×30): in from the lower left, out at the upper right; nothing to stand on between
function ladder(){const g=grid(40,30);
 run(g,1,6,29,'#');run(g,7,38,29,'^');col(g,0,25,28,'.');
 for(const [c,r] of [[11,24],[17,19],[11,14],[18,9],[26,6]])put(g,c,r,'o');
 col(g,22,12,26,'#');col(g,23,12,26,'>');   // a thorned spine between the two halves of the climb
 run(g,30,38,6,'#');col(g,39,2,5,'.');put(g,2,28,'P');return done(g);}
// 3 · The Last Stake (56×30): three stakes (high, low over the thorns, far), crumbling islands and crystals, the gate
function laststake(){const g=grid(56,30);
 run(g,1,5,14,'#');col(g,0,10,13,'.');run(g,1,54,29,'^');run(g,1,54,28,'.');
 for(const [c,r] of [[10,17],[24,20],[38,17]])run(g,c,c+3,r,'~');
 for(const [c,r] of [[16,12],[30,13],[44,12],[36,22]])put(g,c,r,'o');   // (36,22): the way back up from the low stake
 put(g,20,6,'c');put(g,32,24,'c');put(g,46,8,'c');
 run(g,50,54,14,'#');col(g,55,10,13,'G');put(g,2,13,'P');return done(g);}

const rooms=[
 {...base,id:'cs1-falling',origin:'cs1-falling',name:'The Falling Survey',cols:48,rows:23,map:falling(),exit:'right',
  hint:'Light both stakes; the road crumbles behind you and the crystals are the only way up.',question:'Which stake do you light first?'},
 {...base,id:'cs1-ladder',origin:'cs1-ladder',name:'Crystal Ladder',cols:40,rows:30,map:ladder(),exit:'right',seam:seam(0,25,28),
  hint:'No ground between: dash from crystal to crystal, round the thorned spine.',question:'Which way does the next dash go?'},
 {...base,id:'cs1-laststake',origin:'cs1-laststake',name:'The Last Stake',cols:56,rows:30,map:laststake(),exit:'right',seam:seam(0,10,13),
  hint:'Three stakes, high, low and far: every one opens the gate home.',question:'Where does the low stake leave you?'}];
const W={n:101,key:'c-side-1',cside:1,name:'C-Side · Trumpet Hollow',palette:'outskirts',kit:['dash'],
 blurb:'The Outskirts at full pressure: the road falls, the crystals carry you, every stake must burn.',outro:'The trumpet sounds.',
 sections:[{room:'cs1-falling',x:0,y:0,fire:{c:2,r:20}},{room:'cs1-ladder',x:48,y:-8,fire:{c:2,r:28}},{room:'cs1-laststake',x:88,y:-16,fire:{c:2,r:13}}],
 quests:[],secrets:[],rooms,tapes:{},folk:{},props:{},saved:[],difficulty:{min:5,max:5},atlasStart:'cs1-falling',
 passages:[],atlasPassagesReady:true,requiredBankRooms:[],requiredMainRooms:[]};
for(const d of rooms)if(TAPES[d.id])W.tapes[d.id]=TAPES[d.id];
if(CL.wanted)CL.addWorld(W);
root.BladefallClimbCsides=Object.freeze({worlds:[W],rooms});
})(typeof window!=='undefined'?window:globalThis);
