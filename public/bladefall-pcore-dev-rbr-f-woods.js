/* The echo's Oathblade must be released by its counterweight and deliberately taken.
   Resin branches obey the wind clock; a dash cannot change their held edge.
   (7.280, opt-in, for the Fractured Woods' Oath Root; rooms without these fields are untouched)
   - lashes:[{c0,r0,c1,r1,period,on,phase}]: thorned roots that strike out of the ceiling and walls on a fixed clock.
     The rectangle (tiles) kills while ((t+phase)%period) < on; for the 30 frames before, it shows as a dotted
     outline. Nothing random, nothing aimed: the same clock every try. They fall still once the crown is cut.
   - rootCrown:{c,r}: the Oath Root's crown, a 2×2 knot at tile (c,r). A cut from the blade severs it (event
     root-cut); until then every gate (G) in the room stays shut. */
(function(root){'use strict';const C=()=>root.BladefallPrecisionCore;
function reset(g){const d=g.room.def;g.oathRoot=d.oathRoot?{...d.oathRoot,released:false,taken:false}:null;g.resinWind=d.resinWind?{...d.resinWind,t:0,phase:0}:null;
 if(g.oathRoot)for(const e of g.ents)if(e.type==='gate')e.devKeyed=true;
 if(g.resinWind)for(const [i,b]of g.resinWind.branches.entries())g.ents.push({type:'resinBranch',id:'resin-'+i,dev:true,solid:b.phase===0||b.phase===2,x:b.c*8,y:b.r*8,w:b.w*8,h:4,phase:b.phase});
 g.rootLash=d.lashes||d.rootCrown?{t:0,lashes:(d.lashes||[]).map(l=>({...l,on:l.on,period:l.period,phase:l.phase||0,live:false,warn:false})),crown:d.rootCrown?{...d.rootCrown,cut:false}:null}:null;
 if(g.rootLash&&g.rootLash.crown)for(const e of g.ents)if(e.type==='gate')e.devKeyed=true;
}
function input(g,raw){const o=g.oathRoot,p=g.p;if(!o||p.state==='dead'||p.state==='respawn')return raw;
 if(o.released&&!o.taken&&raw.u&&Math.abs(p.x+4-(o.bladeC*8+4))<14&&Math.abs(p.y+11-(o.bladeR*8+8))<16){o.taken=true;C().emit(g,'oath-taken',{x:o.bladeC*8+4,y:o.bladeR*8});}
 return o.taken?raw:{...raw,strike:false};
}
function lashState(L,l){const k=(L.t+l.phase)%l.period;l.live=!(L.crown&&L.crown.cut)&&k<l.on;l.warn=!l.live&&!(L.crown&&L.crown.cut)&&k>=l.period-30;}
function before(g){const w=g.resinWind;if(w){if(g.awake)w.t++;w.phase=Math.floor(w.t/w.period)%2;for(const e of g.ents)if(e.type==='resinBranch')e.solid=e.phase===2||e.phase===w.phase;}
 const L=g.rootLash;if(L){if(g.awake)L.t++;for(const l of L.lashes)lashState(L,l);}
}
function after(g){const o=g.oathRoot,p=g.p;
 if(o&&!o.released&&p.state!=='dead'&&p.state!=='respawn'&&p.onGround&&p.y+p.h===o.r*8&&p.x+p.w>o.c*8&&p.x<(o.c+2)*8){o.released=true;C().emit(g,'oath-roots',{x:o.c*8+8,y:o.r*8});}
 const L=g.rootLash,Core=C();if(!L||p.state==='dead'||p.state==='respawn')return;
 for(const l of L.lashes)if(l.live&&Core.overlap(p.x,p.y,p.w,9,l.c0*8,l.r0*8,(l.c1-l.c0+1)*8,(l.r1-l.r0+1)*8)){Core.kill(g,p,'root-lash');return;}
 const c=L.crown;if(c&&!c.cut&&p.strikeTimer>0){const sb=Core.strikeBox(p);if(Core.overlap(sb[0],sb[1],sb[2],sb[3],c.c*8-2,c.r*8-2,20,20)){c.cut=true;g.freeze=Math.max(g.freeze,6);Core.emit(g,'root-cut',{x:c.c*8+8,y:c.r*8+8});for(const l of L.lashes)lashState(L,l);}}
}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'rbr-f-woods',reset,input,before,after,gateHold:g=>!!(g.oathRoot&&!g.oathRoot.taken)||!!(g.rootLash&&g.rootLash.crown&&!g.rootLash.crown.cut)});
})(typeof window!=='undefined'?window:globalThis);
