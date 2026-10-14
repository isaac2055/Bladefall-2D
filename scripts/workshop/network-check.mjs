import assert from 'node:assert/strict';import {EventEmitter} from 'node:events';
import '../../public/bladefall-workshop-network.js';
const N=globalThis.BladefallWorkshopNetwork,wire=[],a=new EventEmitter(),b=new EventEmitter();a.open=b.open=true;a.send=m=>wire.push(structuredClone(m));b.send=()=>{};const received=[],errors=[];
const sender=N.channel(a,()=>{},e=>errors.push(e.message)),receiver=N.channel(b,m=>received.push(m),e=>errors.push(e.message));
const large={type:'state',document:{name:'Large level',map:'🌱'.repeat(1200000)}};sender.send(large);assert(wire.length>40);const packets=[...wire];for(const p of packets.slice(0,-1).reverse()){b.emit('data',p);b.emit('data',p);}assert.equal(received.length,0);b.emit('data',packets.at(-1));assert.equal(received.length,1);assert.deepEqual(received[0],large);assert.equal(errors.length,0);
b.emit('data',{kind:'bladefall-workshop-chunk',id:'bad',index:0,total:100000,text:'bad'});assert.equal(errors.length,1);sender.close();assert.throws(()=>sender.send({}),/closed/);receiver.close();b.emit('data',packets[0]);assert.equal(received.length,1);
const codes=new Set(Array.from({length:20},()=>N.makeCode()));assert.equal(codes.size,20);assert([...codes].every(c=>/^[A-HJ-NP-Z2-9]{6}$/.test(c)));
console.log('PASS: multi-megabyte Unicode document chunking, reordered/duplicate packets, incomplete and oversized message guards, connection cleanup and room codes.');
