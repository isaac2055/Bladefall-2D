/* Run 9 opt-in geography. A lit bearing gives an existing lift its second, higher destination. */
(function(root){'use strict';const C=()=>root.BladefallPrecisionCore;
function reset(g){g.wardenBreaks=(g.room.def.wardenBreaks||[]).map(d=>{const e=g.ents.find(e=>e.type==='held'&&e.x===d.c*8&&e.y===d.r*8);if(!e)throw Error('Missing Warden shutter');e.type='wardenShutter';e.dev=true;e.solid=true;return{d,e,broken:false};});g.bearingLifts=(g.room.def.bearingLifts||[]).map(d=>({d,e:g.ents.find(e=>e.type==='zip'&&e.ox===d.c*8&&e.oy===d.r*8),raised:false}));}
function before(g){const stones=g.ents.filter(e=>e.type==='stone');if(!stones.length||!stones.every(e=>e.lit))return;for(const q of g.bearingLifts||[]){if(q.raised||!q.e)continue;q.raised=true;q.e.tx=q.e.ox+q.d.after[0]*8;q.e.ty=q.e.oy+q.d.after[1]*8;C().emit(g,'bearing-lift-raised',{x:q.e.tx+q.e.w/2,y:q.e.ty});}}
function settle(g){for(const q of g.wardenBreaks||[]){if(q.broken||!g.warden||g.warden.wounds<q.d.wounds)continue;q.broken=true;q.e.solid=false;C().emit(g,'warden-shutter',{x:q.e.x+q.e.w/2,y:q.e.y+q.e.h/2});}}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'run9-base',reset,before,after:g=>{if(!g.players)settle(g);},afterPlayers:settle});
})(typeof window!=='undefined'?window:globalThis);
