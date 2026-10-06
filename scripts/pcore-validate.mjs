// Structural checks for Precision Core rooms: 40x23 maps, one spawn, an exit opening.
import {Core,Rooms} from './pcore-tape.mjs';
let bad=0;
for(const [ci,ch] of Rooms.chapters.entries())for(const [ri,d] of ch.rooms.entries()){
 const errs=[];
 if(d.map.length!==23)errs.push('rows '+d.map.length);
 d.map.forEach((r,i)=>{if(r.length!==40)errs.push('row '+i+' len '+r.length);});
 const P=d.map.join('').split('P').length-1;if(P!==1)errs.push('spawns '+P);
 try{Core.parseRoom(d,0);}catch(e){errs.push(e.message);}
 if(errs.length){bad++;console.log(`${ch.id}/${d.id}: ${errs.join('; ')}`);}
}
console.log(bad?`${bad} room(s) malformed`:'all rooms well-formed');
process.exit(bad?1:0);
