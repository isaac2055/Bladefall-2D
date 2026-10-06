// Apply agents' climbOrders to scripts/climb/spec.mjs: node apply-orders.mjs orders.json [--dry]
// orders.json: [{world, order?, quests?, secretRooms?, savedForLater?}]
import {readFileSync,writeFileSync} from 'node:fs';
const specPath=new URL('../spec.mjs',import.meta.url);
let s=readFileSync(specPath,'utf8');
const orders=JSON.parse(readFileSync(process.argv[2],'utf8')),dry=process.argv.includes('--dry');
const lit=a=>'['+a.map(x=>`'${String(x).replace(/'/g,"\\'")}'`).join(',')+']';
function span(n){
 const i=s.indexOf(` {n:${n},`);if(i<0)throw new Error('no world '+n);
 let d=0,j=i+1;for(;j<s.length;j++){if(s[j]==='{')d++;else if(s[j]==='}'){d--;if(d===0)break;}}
 return [i+1,j+1];
}
function setArr(body,key,arr,within=null){
 // replace key:[...] (first occurrence, or inside `within:{...}`)
 let start=0,end=body.length;
 if(within){const w=body.indexOf(within+':{');if(w<0)return body.replace(/^\{n:\d+,/,m=>`${m}${within}:{${key}:${lit(arr)}},`);start=w;let d=0;for(let j=body.indexOf('{',w);j<body.length;j++){if(body[j]==='{')d++;else if(body[j]==='}'){d--;if(d===0){end=j;break;}}}}
 const k=body.indexOf(key+':[',start);
 if(k<0||k>end){const ins=within?body.indexOf('{',start)+1:body.indexOf(',')+1;return body.slice(0,ins)+`${key}:${lit(arr)},`+body.slice(ins);}
 let d=0,j=k+key.length+1;for(;j<body.length;j++){if(body[j]==='[')d++;else if(body[j]===']'){d--;if(d===0)break;}}
 return body.slice(0,k)+`${key}:${lit(arr)}`+body.slice(j+1);
}
const log=[];
for(const o of orders){
 const [a,b]=span(o.world);let body=s.slice(a,b);const before=body;
 if(o.order&&o.order.length)body=setArr(body,'order',o.order);
 if(o.quests&&o.quests.length)body=setArr(body,'quests',o.quests);
 if(o.secretRooms&&o.secretRooms.length)body=setArr(body,'rooms',o.secretRooms,'secret');
 s=s.slice(0,a)+body+s.slice(b);
 log.push(`world ${o.world}: ${before===body?'unchanged':'updated'}`);
 for(const id of o.savedForLater||[])if(!s.includes(` '${id}':`)){const k=s.indexOf('export const SAVED_FOR_LATER={');const e=s.indexOf('\n',k);s=s.slice(0,e+1)+` '${id}':'kept for later (7.280 cleanup)',\n`+s.slice(e+1);log.push(`  saved ${id}`);}
}
if(!dry)writeFileSync(specPath,s);
console.log(log.join('\n'));
