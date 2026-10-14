// Add requested mid-leg anchors while preserving every previously earned save.
import {readFileSync,writeFileSync} from 'node:fs';
const additions={
 96:[{c:85,r:95,facing:1,name:'The Lower Verge'},{c:109,r:58,facing:-1,name:'The Broken Return'},{c:32,r:28,facing:1,name:'The Upper Turn'}],
 97:[{c:53,r:57,facing:1,name:'The Seed Catch'},{c:112,r:42,facing:1,name:'The Sapling Rest'},{c:81,r:28,facing:-1,name:'The Resin Crossing'},{c:72,r:18,facing:1,name:'The Crown Catch'}],
 98:[{c:78,r:84,facing:1,name:'The Momentum Catch'},{c:95,r:54,facing:-1,name:'The Hanging Return'}],
 99:[{c:34,r:91,facing:1,name:'The First Bellows'},{c:84,r:37,facing:-1,name:'The Lit Crossing'}],
 100:[{c:100,r:98,facing:1,name:'The Lower Watch'},{c:87,r:59,facing:-1,name:'The Grip Gallery'}],
};
for(const id of (process.argv.slice(2).length?process.argv.slice(2).map(Number):Object.keys(additions).map(Number))){
 const path=`scripts/room-bank/fractured/${id}-bank-f${id}.json`,x=JSON.parse(readFileSync(path));if(x.room.coreCheckpoints.some(q=>q.name===additions[id][0].name))continue;
 if(id===97){
  if(x.room.coreProgressRevision!==3)throw Error('Oath geometry migration requires revision 3.');
  const m=x.room.map.map(r=>r.split(''));for(const[c,r]of [[53,58],[112,43],[72,19]])for(let a=c-1;a<=c+1;a++)m[r][a]='~';x.room.map=m.map(r=>r.join(''));
  // A held jump gives the second seed cut its new landing-relative timing.
  const frames=x.tape.flatMap(([n,k])=>Array(n).fill(k));frames.splice(135,0,...Array(9).fill('j'));x.tape=[];
  for(const k of frames){if(x.tape.at(-1)?.[1]===k)x.tape.at(-1)[0]++;else x.tape.push([1,k]);}
 }
 const old=x.room.coreCheckpoints,points=[],indices=[];for(let i=0;i<old.length;i++){if(additions[id][i])points.push({...additions[id][i],width:24,resetClocks:false});indices.push(points.length);points.push(old[i]);}
 const revision=x.room.coreProgressRevision||1,migrations=x.room.coreProgressMigrations||{};
 for(const key of Object.keys(migrations))migrations[key]=migrations[key].map(i=>indices[i]);migrations[revision]=indices;
 x.room.coreCheckpoints=points;x.room.coreProgressRevision=revision+1;x.room.coreProgressMigrations=migrations;
 x.verification.previousPartTapes=x.verification.partTapes;x.verification.partTapes=[];x.verification.midpointSavesPending=true;
 if(x.bank.requiredEventCounts?.['core-checkpoint'])x.bank.requiredEventCounts['core-checkpoint']=points.length;
 writeFileSync(path,JSON.stringify(x,null,2)+'\n');console.log(id,points.length,'checkpoints, migration',indices);
}
