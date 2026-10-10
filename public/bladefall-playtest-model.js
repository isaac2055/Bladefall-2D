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
root.BladefallPlaytestModel=Object.freeze({SEASON,MODES,CAMPAIGNS,catalog,world,valid,best,aggregate,publicBest,format,compare,compareHearts});
})(globalThis);
