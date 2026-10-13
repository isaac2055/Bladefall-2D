import assert from 'node:assert/strict';
await import('../../public/bladefall-pcore.js');
await import('../../public/bladefall-coop-practice-core.js');
await import('../../public/bladefall-coop-practice-session.js');
const S=globalThis.BladefallCoopPracticeSession;let time=0;const sent=[],h=S.create({now:()=>time,send:m=>sent.push(m)}),token='guest-session-token-123';
assert(h.receive({type:'hello',token}));
const input=(seq,buttons,epoch=0)=>({type:'input',token,epoch,seq,buttons});
assert(h.receive(input(1,{r:true})));h.tick();const x=h.state.game.games[1].p.x;
assert(!h.receive(input(1,{l:true})));assert(!h.receive(input(0,{l:true})));
assert(!h.receive({type:'state',token,x:999,complete:true}));assert.equal(h.state.game.complete,false);
// Press and release arriving between simulation ticks still produce one jump.
h.receive(input(2,{jump:true}));h.receive(input(3,{}));h.tick();assert(h.state.game.games[1].p.vy<0);
// Shared reset invalidates in-flight messages from the previous world state.
h.receive(input(4,{reset:true}));h.tick();assert.equal(h.state.epoch,1);assert(!h.receive(input(5,{r:true},0)));assert(h.receive(input(5,{},1)));
const prior=h.state.game.frame;time=1600;h.tick();assert.equal(h.state.connected,false);assert.equal(h.state.game.frame,prior);
assert(!h.receive({type:'hello',token:'a-different-player-token'}));
assert(h.receive({type:'hello',token}));assert.equal(sent.at(-1).rejoin,true);assert.equal(h.state.epoch,2);assert(!h.receive(input(20,{r:true},1)));h.tick();assert.equal(h.state.game.frame,prior+1);
// Sustained input across 120 ms packet delays advances machinery only at native tick rate.
for(let i=0;i<120;i++){time+=1000/60;if(i%7===0)h.receive(input(6+i,{},2));h.tick();}
assert.equal(h.state.game.frame,prior+121);assert(h.state.connected);
assert.equal(S.clean({r:'yes',jump:1,dash:true,position:888}).r,false);
console.log('PASS: guest button validation, duplicates/reordering, short press preservation, stale reset rejection, disconnect pause, authenticated rejoin, and delayed input at fixed simulation rate.');
