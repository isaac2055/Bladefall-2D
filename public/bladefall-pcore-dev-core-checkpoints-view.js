/* Persistent Core anchors and their visible save lanterns. Stored separately from plant/reward progress. */
(function(root){'use strict';const KEY='bladefall.cores.checkpoints.v1';
const read=()=>{try{return JSON.parse(root.localStorage.getItem(KEY))||{};}catch{return {};}};
const key=g=>g.room.def.coreProgressKey||g.room.id;
function saved(def){let value=read()[def.coreProgressKey||def.id];if(!value||!Number.isInteger(value.index)||value.index<0)return null;const revision=def.coreProgressRevision||1;if(value.revision!==revision){const index=def.coreProgressMigrations?.[value.revision]?.[value.index];if(!Number.isInteger(index))return null;value={...value,index,revision};}return def.coreCheckpoints?.[value.index]?value:null;}
function save(g){if(!g.room.def.coreCheckpoints||g.coreRun?.index<0)return false;const values=read();values[key(g)]={index:g.coreRun.index,revision:g.room.def.coreProgressRevision||1};try{root.localStorage.setItem(KEY,JSON.stringify(values));return true;}catch{return false;}}
function clear(def){const values=read();delete values[def.coreProgressKey||def.id];try{root.localStorage.setItem(KEY,JSON.stringify(values));}catch{}}
function restore(g){const value=saved(g.room.def);if(!value)return false;g.coreRun={room:g.room.id,index:value.index};root.BladefallPrecisionCore.resetRoom(g);g.p.state='normal';g.p.respawnTimer=0;return true;}
function draw(b,g){const points=g.room.def.coreCheckpoints;if(!points)return;b.save();try{if(g.flipped){b.translate(0,g.room.h);b.scale(1,-1);}for(const [i,q]of points.entries()){
 const x=q.c*8+4,y=(q.r+1)*8,lit=i<=(g.coreRun?.index??-1);b.fillStyle='#655b46';b.fillRect(x-7,y-3,14,3);b.fillStyle=lit?'#e4c773':'#82958a';b.fillRect(x-3,y-14,6,10);b.fillStyle=lit?'#fff2ac':'#c0d9ca';b.fillRect(x-1,y-17-(Math.floor(g.frame/12)%2),2,10);b.fillStyle='#d4c6a4';b.font='6px monospace';b.fillText(String(i+2),x+7,y-6);
 }}finally{b.restore();}}
function event(e,{view,burst}){if(e.type!=='core-checkpoint')return;burst(e.x,e.y-8,12,'#ffe5a2',25,25);const st=root.BladefallPitchView?.climb?.state?.();
 if(!view.replay&&!view.g.coreDemo&&st?.world?.core&&!st.review){const ok=save(view.g);root.BladefallPitchView.climb.announce(`Part ${e.part-1} saved · Part ${e.part}/${view.g.room.def.coreCheckpoints.length+1}${ok?'':' · save active for this run'}`,200);}
}
root.BladefallCoreProgress={saved,save,clear,restore};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'core-checkpoints',draw,event});
})(globalThis);
