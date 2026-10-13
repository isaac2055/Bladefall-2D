/* Scores compare the same course revision; collectible runs retain their own personal best. */
(function(root){'use strict';
const SEASON='playtest-2026-10-v2',MODES=['survival','explore'],CAMPAIGNS=['base','fractured'];
const catalog=root.BladefallPlaytestWorlds||[];
const world=(mode,id)=>catalog.find(w=>w.mode===mode&&w.id===String(id));
const hearts=r=>r.mode==='survival'?(r.hearts||0):0;
function valid(r){
 const w=r&&world(r.mode,r.world);
 return !!r&&r.season===SEASON&&MODES.includes(r.mode)&&CAMPAIGNS.includes(r.campaign)&&w?.campaign===r.campaign&&Number.isSafeInteger(r.ms)&&r.ms>0&&r.ms<=604800000&&Number.isSafeInteger(r.deaths)&&r.deaths>=0&&r.deaths<1000000&&(r.hearts==null||Number.isSafeInteger(r.hearts)&&r.hearts>=0&&r.hearts<=(w.hearts||0))&&typeof r.id==='string'&&/^[a-zA-Z0-9-]{8,80}$/.test(r.id)&&typeof r.player==='string'&&/^[a-zA-Z0-9-]{8,128}$/.test(r.player)&&typeof r.name==='string'&&r.name.trim().length>0&&r.name.length<=40;
}
// Review feedback shares private storage with campaign feedback; it never enters scoreboards.
function validFeedback(r){
 if(!r||r.season!==SEASON)return false;
 const course=world(r.mode,r.world),review=r.mode==='review'&&['room-bank','cores'].includes(r.campaign)&&(/^(?:\d{1,4}|bank-(?:base|fractured)-[a-z0-9-]+)$/.test(String(r.world)))&&typeof r.room==='string'&&/^(bank-[bf]\d{2,}|core-[a-z0-9-]+)$/.test(r.room);
 if(!(review||course?.campaign===r.campaign&&!!course))return false;
 if(!Number.isInteger(r.fun)||r.fun<1||r.fun>10||!Number.isInteger(r.difficulty)||r.difficulty<1||r.difficulty>5||typeof r.comment!=='string'||r.comment.length>4000||typeof (r.room||'')!=='string'||(r.room||'').length>160)return false;
 if(r.suitability!=null&&(!Number.isInteger(r.suitability)||r.suitability<1||r.suitability>5))return false;
 for(const [key,max] of [['tester',80],['session',128],['origin',160],['outcome',32],['practiceReason',160],['revision',40],['bankSide',20],['recordedAt',40]])if(r[key]!=null&&(typeof r[key]!=='string'||r[key].length>max))return false;
 if(r.part!=null&&(!Number.isInteger(r.part)||r.part<1||r.part>3))return false;
 for(const key of ['x','y'])if(r[key]!=null&&(!Number.isSafeInteger(r[key])||Math.abs(r[key])>1000000))return false;
 return (r.frames==null||Number.isSafeInteger(r.frames)&&r.frames>=0)&&(r.bankBatch==null||Number.isSafeInteger(r.bankBatch)&&r.bankBatch>=0)&&(r.assisted==null||typeof r.assisted==='boolean');
}
function validRecording(r){
 if(!r||r.season!==SEASON||r.format!=='bladefall-route-v1'||typeof r.room!=='string'||!/^[a-zA-Z0-9_-]{1,160}$/.test(r.room)||typeof r.scene!=='string'||r.scene.length>900000||!Number.isSafeInteger(r.frames)||r.frames<1||r.frames>18000)return false;
 for(const [key,max] of [['name',160],['world',160],['build',80],['revision',80],['recordedAt',40],['outcome',80]])if(typeof r[key]!=='string'||r[key].length>max)return false;
 if(typeof r.assisted!=='boolean'||!Array.isArray(r.tape)||r.tape.length>18000||!r.tape.every(x=>Array.isArray(x)&&x.length===2&&Number.isInteger(x[0])&&x[0]>0&&x[0]<=18000&&typeof x[1]==='string'&&/^[lrudjxgspq]{0,10}$/.test(x[1]))||r.tape.reduce((n,x)=>n+x[0],0)!==r.frames)return false;
 if(!Array.isArray(r.poses)||r.poses.length>6000||!r.poses.every(x=>Array.isArray(x)&&x.length===5&&x.slice(0,4).every(v=>Number.isFinite(v)&&Math.abs(v)<1e7)&&typeof x[4]==='string'&&x[4].length<32))return false;
 if(!Array.isArray(r.markers)||r.markers.length>100||!r.markers.every(x=>Number.isInteger(x.frame)&&x.frame>=0&&x.frame<=r.frames&&typeof x.kind==='string'&&x.kind.length<40&&typeof x.scene==='string'&&x.scene.length<900000))return false;
 try{if(JSON.stringify(r).length>1200000)return false;JSON.parse(r.scene);for(const m of r.markers)JSON.parse(m.scene);}catch{return false;}return true;
}
const compare=(a,b)=>a.ms-b.ms||String(a.at||'').localeCompare(String(b.at||''))||a.id.localeCompare(b.id);
const compareHearts=(a,b)=>hearts(b)-hearts(a)||compare(a,b);
function best(records,{mode,campaign,world:wid,sort='time'}={}){
 const order=sort==='hearts'?compareHearts:compare,out=new Map();
 for(const r of records.filter(valid)){
  if(mode&&r.mode!==mode||campaign&&r.campaign!==campaign||wid!=null&&r.world!==String(wid))continue;
  const key=[r.player,r.mode,r.campaign,r.world].join(':');
  if(!out.has(key)||order(r,out.get(key))<0)out.set(key,r);
 }
 return [...out.values()].sort(order);
}
function aggregate(records,mode,campaign,sort='time'){
 const need=catalog.filter(w=>w.mode===mode&&w.campaign===campaign).map(w=>w.id),players=new Map();
 for(const r of best(records,{mode,campaign,sort})){
  if(!players.has(r.player))players.set(r.player,[]);players.get(r.player).push(r);
 }
 return [...players].flatMap(([player,rows])=>need.length&&need.every(id=>rows.some(r=>r.world===id))?[{
  id:player,player,name:rows.slice().sort((a,b)=>String(b.at).localeCompare(String(a.at)))[0].name,mode,campaign,
  ms:rows.reduce((n,r)=>n+r.ms,0),deaths:rows.reduce((n,r)=>n+r.deaths,0),hearts:rows.reduce((n,r)=>n+hearts(r),0),
  worlds:need.length,at:rows.map(r=>r.at).sort().at(-1),parts:rows.map(r=>r.id)
 }]:[]).sort(sort==='hearts'?compareHearts:compare);
}
// The API must keep a slower heart run even when the player also has a faster any-percent run.
const publicBest=records=>[...new Map([...best(records),...best(records,{sort:'hearts'})].map(r=>[r.id,r])).values()];
const format=ms=>{const n=Math.floor(ms/10);return `${Math.floor(n/6000)}:${String(Math.floor(n/100)%60).padStart(2,'0')}.${String(n%100).padStart(2,'0')}`;};
root.BladefallPlaytestModel=Object.freeze({SEASON,MODES,CAMPAIGNS,catalog,world,valid,validFeedback,validRecording,best,aggregate,publicBest,format,compare,compareHearts});
})(globalThis);
