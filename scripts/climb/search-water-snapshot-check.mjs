import assert from 'node:assert/strict';
import {Core} from '../pcore-tape.mjs';
import {snapshot,restore} from '../pcore-search.mjs';
const map=Array.from({length:23},()=>'.'.repeat(40).split(''));map[20][4]='P';for(let c=0;c<40;c++)map[21][c]='#';for(let r=10;r<=20;r++)for(let c=10;c<=12;c++)map[r][c]='w';
const g=Core.createGame([{id:'water-snapshot-fixture',cols:40,rows:23,map:map.map(r=>r.join('')),exit:'right',thaw:180}]),base=snapshot(g),a=restore(base),b=restore(base),W=globalThis.BladefallPrecisionWater,cell=a.water.pools[0].cells[0];
W.freeze(a,a.water.pools[0]);assert.equal(a.room.grid[cell],Core.SOLID);for(const other of[g,base,b]){assert.equal(other.room.grid[cell],Core.EMPTY);assert.equal(other.room.ice[cell],0);assert.equal(other.water.pools[0].frozen,0);}
const frozen=snapshot(a),c=restore(frozen);W.thaw(a,a.water.pools[0]);assert.equal(a.room.grid[cell],Core.EMPTY);for(const other of[frozen,c]){assert.equal(other.room.grid[cell],Core.SOLID);assert.equal(other.room.ice[cell],1);assert.equal(other.water.pools[0].frozen,180);}
assert.notEqual(a.room.grid,b.room.grid);assert.notEqual(a.room.ice,b.room.ice);console.log('PASS: native freeze/thaw and ice traction state remain isolated between search siblings and restored snapshots.');
