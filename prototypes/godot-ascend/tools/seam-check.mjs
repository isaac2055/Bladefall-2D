import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';import {reference,root} from './reference.mjs';
const ctx=reference(),C=ctx.BladefallPrecisionCore,CL=ctx.BladefallClimb,w=CL.world(1),fixtures=[];
for(let i=0;i<w.sections.length-1;i++){
 const a=w.sections[i],b=w.sections[i+1],def=w.rooms.find(d=>d.id===a.room),to=w.rooms.find(d=>d.id===b.room),tape=w.tapes[a.room];if(!tape)throw Error('No route for seam '+a.room);
 const g=C.createGame([def]);
 for(const [n,k]of tape)for(let f=0;f<n&&!g.exited;f++){const raw={};for(const[key,ch]of Object.entries({l:'l',r:'r',u:'u',d:'d',jump:'j',dash:'x',grab:'g',strike:'s'}))raw[key]=(k||'').includes(ch);C.step(g,raw);}
 if(!g.exited||g.deaths)throw Error('Browser route did not finish '+a.room);
 const snapshot={p:{...g.p},prev:{...g.prev},buf:{...g.buf}},source={x:a.x*8,y:a.y*8},target={x:b.x*8,y:b.y*8},continuous=!!(def.atlasJunction||to.atlasJunction||def.atlasTerrain||to.atlasTerrain);
 const dest=C.createGame([to]);CL.carry(C,dest,CL.snap(g),source,target,continuous);
 const expected={};for(const[k,v]of Object.entries(dest.p))if(['number','string','boolean'].includes(typeof v))expected[k]=v;
 fixtures.push({from:a.room,to:b.room,snapshot,source,target,continuous,expected,clear:!C.solidAt(dest,dest.p.x,dest.p.y,dest.p.w,dest.p.h)});
}
const file=path.join(root,'.cache/godot/seams.json');fs.writeFileSync(file,JSON.stringify(fixtures));
const result=spawnSync(process.env.GODOT||path.join(root,'.cache/godot/Godot.app/Contents/MacOS/Godot'),['--headless','--path',path.join(root,'prototypes/godot-ascend'),'--script','res://tests/seams.gd','--',file],{encoding:'utf8',timeout:30000});process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');process.exit(result.status??1);
