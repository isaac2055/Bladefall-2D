// Local native authoring helper: complete a cap crossing and catch its far face.
import {readFileSync,writeFileSync} from 'node:fs';import {Core,keysToInput} from '../pcore-tape.mjs';import {snapshot,restore} from '../pcore-search.mjs';
const [path,face,tx,ty,stage]=process.argv.slice(2),x=JSON.parse(readFileSync(path)),start=Core.createGame([x.room]);
const part=+(process.env.CORE_PART||0);if(part){start.coreRun.index=part-1;Core.resetRoom(start);start.p.state='normal';start.p.respawnTimer=0;}
const tape=part?x.verification.partTapes[part]||[]:x.tape;
for(const[n,k]of tape)for(let i=0;i<n;i++)Core.step(start,keysToInput(k));
if(start.deaths)throw Error('Invalid prefix');const base=snapshot(start),cross=face==='l'?'l':'r',catchKey=face==='l'?'rg':'lg';let found;
outer:for(let up=0;up<=36;up+=2)for(let rise=2;rise<=12;rise+=2)for(let across=12;across<=42;across+=2){const g=restore(base),t=[];let dead=false;
for(const[n,k]of[[up,'ug'],[rise,'ugj'],[across,cross+'j'],[50,catchKey]]){let used=0;for(;used<n;used++){Core.step(g,keysToInput(k));if(g.deaths){dead=true;break;}if(k===catchKey&&g.p.state==='climb'&&Math.abs(g.p.x-Number(tx))<2&&Math.abs(g.p.y-Number(ty))<24){t.push([used+1,k]);found={g,t};break outer;}}if(dead)break;if(n)t.push([n,k]);}}
if(!found)throw Error('No cap/catch in input range');if(part){x.verification.partTapes[part]=[...tape,...found.t];x.verification.partReached={...x.verification.partReached,[part]:+stage};}else{x.tape.push(...found.t);x.verification.reachedStage=+stage;}writeFileSync(path,JSON.stringify(x,null,2)+'\n');console.log(found.t,found.g.p.x,found.g.p.y,found.g.p.stamina);
