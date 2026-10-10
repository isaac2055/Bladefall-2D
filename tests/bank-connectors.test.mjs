import test from 'node:test';
import assert from 'node:assert/strict';
import {connectorVertical,connectorOffsetDrop} from '../scripts/climb/bank-connectors.mjs';
import {runTape,EXTRA_TAPES} from '../scripts/climb/seam-tools.mjs';
test('quiet vertical roads work at both entrances and each representative taller height',()=>{
 for(const height of [16,28,44,68])for(const from of ['left','right'])for(const down of [false,true]){
  const room=connectorVertical(from,height,'inversion',down);assert(room,`${from} / ${height} / ${down?'down':'up'}`);
  const tape=EXTRA_TAPES[room.id],result=runTape(room,tape);assert.equal(result.deaths,0);assert(result.exit&&!result.exit.side);
  assert(tape.every(([,keys])=>/^[lrj]*$/.test(keys)),'a quiet road requires only walking and ordinary jumping');
  assert.equal(room.cols,8);assert.equal(room.rows,height);assert.equal(room.exit,down?'down':'up');
 }
});
test('invalid directions and too-short vertical roads are rejected',()=>{assert.equal(connectorVertical('up',16,'inversion'),null);assert.equal(connectorVertical('right',7,'inversion'),null);});

test('offset drops provide a walking approach and a laterally separated descent',()=>{
 for(const height of [16,28,44,68])for(const from of ['left','right']){const d=connectorOffsetDrop(from,height,'fractured'),r=runTape(d,EXTRA_TAPES[d.id]);assert(r.exit&&!r.deaths);assert.equal(d.cols,24);assert(from==='right'?r.snap.x>18*8:r.snap.x<6*8);assert(EXTRA_TAPES[d.id].every(([,k])=>/^[lr]*$/.test(k)));}
});

test('narrow descending tail has a real landing and zero-death downward routes',async()=>{
 const {connectorDropShaft}=await import('../scripts/climb/bank-connectors.mjs');
 for(const H of [16,28,44,68]){
  const d=connectorDropShaft(H,'fractured');assert(d);
  assert.equal(d.cols,6);assert.equal(d.map[3].slice(1,3),'==');
  const result=runTape(d,EXTRA_TAPES[d.id]);assert(result.exit&&!result.exit.side);assert.equal(result.deaths,0);
 }
});
