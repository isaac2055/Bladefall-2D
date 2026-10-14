import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,readdirSync} from 'node:fs';
import {Core,Rooms,runRoom} from '../pcore-tape.mjs';
import '../../public/bladefall-workshop-model.js';
import '../../public/bladefall-workshop-ascend.js';
globalThis.BLADEFALL_CLIMB=true;const require=createRequire(import.meta.url);for(const f of ['climb','climb-bank-passages','climb-atlas','climb-passages','climb-passage-tapes','climb-worlds','climb-finale-tapes','climb-finale','climb-core-tapes','climb-cores'])require('../../public/bladefall-'+f+'.js');
const A=globalThis.BladefallWorkshopAscend,M=globalThis.BladefallWorkshopModel;
const bank=['base','fractured'].flatMap(side=>readdirSync(`scripts/room-bank/${side}`).filter(f=>f.endsWith('.json')).map(f=>JSON.parse(readFileSync(`scripts/room-bank/${side}/${f}`))));
let total=0;for(const room of [...Rooms.all,...globalThis.BladefallClimb.worlds.flatMap(w=>w.rooms),...bank.map(s=>s.room)]){assert.deepEqual(A.compile(A.fromRoom(room)),JSON.parse(JSON.stringify(room)),room.id+' round-trip');total++;}
const source=bank.find(s=>s.room.id==='bank-f105'),definition=A.fromRoom(source.room),doc=M.create({id:'draft',mode:'ascend',name:'Ember edit',definition}),s=M.session(doc,{validateDefinition:d=>A.compile(d.definition)});
const slabs=A.objects(definition).filter(b=>b.data.glyph==='E'),first=slabs[0],second=slabs[1];
const swap=s.submit('player',[A.move(definition,first.id,{x:second.x,y:second.y,w:second.w,h:second.h}),A.move(definition,second.id,{x:first.x,y:first.y,w:first.w,h:first.h})]);assert(swap.ok,swap.error);
const changed=A.compile(s.snapshot().definition);assert.deepEqual(changed.slabs[0],source.room.slabs[1]);assert.deepEqual(changed.slabs[1],source.room.slabs[0],'timing follows the moved object');assert(s.undo('player').ok);assert.deepEqual(A.compile(s.snapshot().definition),source.room);
const original=s.snapshot();const spawn=A.objects(definition).find(o=>o.data.glyph==='P');assert(!s.submit('player',[{path:spawn.path,remove:true}]).ok);assert.deepEqual(s.snapshot(),original,'invalid deletion is rejected atomically');
const proof=runRoom([A.compile(s.snapshot().definition)],0,source.tape);assert(proof.exited&&proof.deaths===0,'compiled unchanged room runs with identical native mechanics');
console.log(`PASS: ${total} complete room definitions round-trip losslessly; device settings follow swapped bodies; undo restores geometry/configuration; invalid spawn removal rolls back; Ember native route still completes.`);
