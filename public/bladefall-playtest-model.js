/* Shared score contract: a season is a fresh board; whole-game rows use one best continuous clear per world. */
(function(root){'use strict';
const SEASON='playtest-2026-10-v1',MODES=['explore','survival'],CAMPAIGNS=['base','fractured'];
const catalog=root.BladefallPlaytestWorlds||[];
const world=(mode,id)=>catalog.find(w=>w.mode===mode&&w.id===String(id));
function valid(r){return !!r&&r.season===SEASON&&MODES.includes(r.mode)&&CAMPAIGNS.includes(r.campaign)&&world(r.mode,r.world)?.campaign===r.campaign&&Number.isSafeInteger(r.ms)&&r.ms>0&&r.ms<=604800000&&Number.isSafeInteger(r.deaths)&&r.deaths>=0&&r.deaths<1000000&&typeof r.id==='string'&&/^[a-zA-Z0-9-]{8,80}$/.test(r.id)&&typeof r.player==='string'&&/^[a-zA-Z0-9-]{8,128}$/.test(r.player)&&typeof r.name==='string'&&r.name.trim().length>0&&r.name.length<=40;}
const compare=(a,b)=>a.ms-b.ms||String(a.at||'').localeCompare(String(b.at||''))||a.id.localeCompare(b.id);
function best(records,{mode,campaign,world:wid}={}){const out=new Map();for(const r of records.filter(valid)){if(mode&&r.mode!==mode||campaign&&r.campaign!==campaign||wid!=null&&r.world!==String(wid))continue;const key=[r.player,r.mode,r.campaign,r.world].join(':');if(!out.has(key)||compare(r,out.get(key))<0)out.set(key,r);}return [...out.values()].sort(compare);}
function aggregate(records,mode,campaign){const need=catalog.filter(w=>w.mode===mode&&w.campaign===campaign).map(w=>w.id),players=new Map();for(const r of best(records,{mode,campaign})){if(!players.has(r.player))players.set(r.player,[]);players.get(r.player).push(r);}return [...players].flatMap(([player,rows])=>need.length&&need.every(id=>rows.some(r=>r.world===id))?[{id:player,player,name:rows.slice().sort((a,b)=>String(b.at).localeCompare(String(a.at)))[0].name,mode,campaign,ms:rows.reduce((n,r)=>n+r.ms,0),deaths:rows.reduce((n,r)=>n+r.deaths,0),worlds:need.length,at:rows.map(r=>r.at).sort().at(-1),parts:rows.map(r=>r.id)}]:[]).sort(compare);}
const format=ms=>{const n=Math.floor(ms/10);return `${Math.floor(n/6000)}:${String(Math.floor(n/100)%60).padStart(2,'0')}.${String(n%100).padStart(2,'0')}`;};
root.BladefallPlaytestModel=Object.freeze({SEASON,MODES,CAMPAIGNS,catalog,world,valid,best,aggregate,format,compare});
})(globalThis);
