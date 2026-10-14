import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,readdirSync} from 'node:fs';
import {Rooms} from '../pcore-tape.mjs';
import '../../public/bladefall-workshop-ascend-coop-core.js';
globalThis.BLADEFALL_CLIMB=true;
const require=createRequire(import.meta.url);
for(const f of ['climb','climb-bank-passages','climb-atlas','climb-passages','climb-passage-tapes','climb-worlds','climb-finale-tapes','climb-finale','climb-core-tapes','climb-cores'])require('../../public/bladefall-'+f+'.js');
const bank=['base','fractured'].flatMap(side=>readdirSync(`scripts/room-bank/${side}`).filter(f=>f.endsWith('.json')).map(f=>JSON.parse(readFileSync(`scripts/room-bank/${side}/${f}`)).room));
const S=globalThis.BladefallWorkshopAscendCoopCore,defs=[...Rooms.all,...globalThis.BladefallClimb.worlds.flatMap(w=>w.rooms),...bank];
for(const d of defs){assert.deepEqual(S.unsupported(d),[],d.id);const s=S.create(d);for(let i=0;i<3;i++)S.step(s);assert.equal(s.g.players.length,2,d.id);}
console.log(`PASS: ${defs.length} loaded course/campaign/Core/bank definitions support shared creation and three native frames. Startup coverage, not whole-route co-op proof.`);
