/* Two native co-op seats per pinned test. The build host relays authenticated participants only. */
(function(root){
'use strict';
function create({deliver}){
 const tests=new Map();
 function register(test){if(tests.has(test.id))return;tests.set(test.id,{players:[null,null],generation:0});for(const[id,t]of tests)if(tests.size>32&&!t.players.some(Boolean))tests.delete(id);}
 function roster(id,t){const message={type:'play',event:'roster',test:id,generation:++t.generation,players:t.players.slice()};for(const actor of t.players)if(actor)deliver(actor,message);}
 function receive(actor,raw){const m=root.BladefallWorkshopModel.json(raw),t=tests.get(m.test);if(!t)throw Error('This shared test is no longer available. Start a new test.');
  if(m.action==='join'){if(t.players.includes(actor)){deliver(actor,{type:'play',event:'roster',test:m.test,generation:t.generation,players:t.players.slice()});return;}const seat=t.players.indexOf(null);if(seat<0){deliver(actor,{type:'play',event:'full',test:m.test});return;}t.players[seat]=actor;roster(m.test,t);return;}
  const seat=t.players.indexOf(actor);if(seat<0)throw Error('Join this test before sending game input.');
  if(m.action==='restart'){roster(m.test,t);return;}
  if(m.action==='leave'){t.players[seat]=null;roster(m.test,t);return;}
  if(m.action!=='packet'||m.generation!==t.generation||!m.packet||typeof m.packet!=='object'||JSON.stringify(m.packet).length>2*1024*1024)return;
  const other=t.players[1-seat];if(other)deliver(other,{type:'play',event:'packet',test:m.test,generation:t.generation,from:actor,packet:m.packet});
 }
 function disconnect(actor){for(const[id,t]of tests){const seat=t.players.indexOf(actor);if(seat>=0){t.players[seat]=null;roster(id,t);}}}
 return {register,receive,disconnect};
}
root.BladefallWorkshopPlayLink={create};
})(globalThis);
