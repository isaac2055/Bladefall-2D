import assert from 'node:assert/strict';
import '../../public/bladefall-workshop-model.js';import '../../public/bladefall-workshop-play-link.js';import '../../public/bladefall-workshop-collaboration.js';
const M=globalThis.BladefallWorkshopModel,C=globalThis.BladefallWorkshopCollaboration;
const doc=M.create({id:'shared-level',mode:'ascend',name:'Shared',definition:{left:{x:0},right:{x:100}}});
const changed=[],tests=[],journals=new Map(),wire=[];
const host=C.host({document:doc,onChange:d=>changed.push(d.revision),onTest:t=>tests.push(t)});
function member(actor,saved=null){const g=C.guest({actor,token:'secret-'+actor,saved,persist:value=>journals.set(actor,structuredClone(value)),onTest:t=>tests.push(t)});let link;const connect=()=>{link=host.connect(m=>wire.push(()=>g.receive(m)));g.connect(m=>wire.push(()=>link.receive(m)));};connect();return {g,connect,drop:()=>{link.close();g.disconnect();},receive:m=>link.receive(m)};}
function flush(){let cap=100;while(wire.length){assert(cap-->0,'message loop');wire.shift()();}}
const alice=member('alice'),bob=member('bob');flush();assert(alice.g.state().connected);assert.deepEqual(alice.g.session.snapshot(),doc);
// Same-base disjoint changes both survive; conflicting changes are visibly rejected.
assert(alice.g.session.submit('ignored',[{path:['definition','left','x'],value:10}]).pending);
assert(bob.g.session.submit('ignored',[{path:['definition','right','x'],value:110}]).pending);flush();assert.equal(host.snapshot().revision,2);assert.deepEqual(alice.g.session.snapshot(),host.snapshot());assert.deepEqual(bob.g.session.snapshot(),host.snapshot());
assert(alice.g.session.submit('',[{path:['definition','left','x'],value:20}]).pending);assert(bob.g.session.submit('',[{path:['definition','left','x'],value:30}]).pending);flush();assert.equal(host.snapshot().definition.left.x,20);assert(bob.g.state().error.includes('Someone changed'));assert.equal(bob.g.state().pending,null);
assert(bob.g.session.undo().pending);flush();assert.equal(host.snapshot().definition.right.x,100);assert.equal(host.snapshot().definition.left.x,20,'partner undo leaves my edit alone');
// Disconnect AFTER commit but BEFORE ack, then reload guest from durable journal: exactly once.
assert(alice.g.session.submit('',[{path:['definition','right','x'],value:150}]).pending);wire.shift()();const appliedRevision=host.snapshot().revision;assert(journals.get('alice').pending);wire.length=0;alice.drop();flush();const reloaded=member('alice',journals.get('alice'));flush();assert.equal(host.snapshot().revision,appliedRevision);assert.equal(reloaded.g.state().pending,null);assert.equal(reloaded.g.session.snapshot().definition.right.x,150);
assert(reloaded.g.session.undo().pending);wire.shift()();const undoneRevision=host.snapshot().revision;wire.length=0;reloaded.drop();flush();const afterUndo=member('alice',journals.get('alice'));flush();assert.equal(host.snapshot().revision,undoneRevision,'rejoined undo is not applied twice');assert.equal(afterUndo.g.session.snapshot().definition.right.x,100);
// Host changes are visible to all; a partner cannot undo a field overwritten later.
host.session.submit('host',[{path:['definition','left','x'],value:77}]);flush();assert.equal(bob.g.session.snapshot().definition.left.x,77);assert(afterUndo.g.session.undo().pending);flush();assert(afterUndo.g.state().error.includes('Someone changed'));assert.equal(host.snapshot().definition.left.x,77);
let error;const impostor=host.connect(m=>{if(m.type==='error')error=m.message;});impostor.receive({type:'hello',actor:'alice',token:'wrong',name:'Fake'});assert(error.includes('belongs'));const before=host.snapshot();bob.receive({type:'edit',id:'spoof',transaction:{document:doc.id,actor:'host',sequence:2,base:before.revision,changes:[]}});flush();assert.deepEqual(host.snapshot(),before);
const invitation=host.test();flush();assert(tests.length>=3);assert(tests.every(t=>t.document.revision===invitation.document.revision));host.session.submit('host',[{path:['name'],value:'Later'}]);flush();assert.equal(invitation.document.name,'Shared','test revision is immutable while builders keep editing');
afterUndo.drop();flush();assert.equal(afterUndo.g.session.submit('',[{path:['name'],value:'Offline'}]).ok,false);assert(journals.get('alice').document);
console.log('PASS: two collaborators, disjoint merge/conflict feedback, own undo, host edits, durable unacknowledged edit/undo reconnect, identity protection, offline preservation, immutable shared test revision.');

const isolated=C.host({document:doc});let sending=true;const broken=isolated.connect(()=>{if(!sending)throw Error('socket closed');});broken.receive({type:'hello',actor:'gone-peer',token:'gone-token',name:'Gone'});sending=false;assert(isolated.session.submit('host',[{path:['name'],value:'Still durable'}]).ok);assert.equal(isolated.snapshot().name,'Still durable');
// Async durable stores must finish before an edit goes onto the wire.
const barriers=[],messages=[];const durable=C.guest({actor:'durable-builder',token:'durable-token',persist:()=>new Promise(resolve=>barriers.push(resolve))});durable.connect(m=>messages.push(m));durable.receive({type:'state',epoch:'durable-session',document:doc,sequence:1,history:{undo:0,redo:0},people:[]});for(const release of barriers.splice(0))release();await Promise.resolve();messages.length=0;assert(durable.session.submit('',[{path:['name'],value:'Durable first'}]).pending);assert.equal(messages.length,0);barriers.shift()();await Promise.resolve();assert.equal(messages[0].type,'edit');
console.log('PASS: outgoing collaborator edits wait for durable recovery storage.');

// Native game packets use the same authenticated co-builder connection.
const playEvents=[],playHost=C.host({document:doc,onPlay:m=>playEvents.push(['host',m])});
const playGuest=C.guest({actor:'player-two',token:'player-token',onPlay:m=>playEvents.push(['guest',m])});
const playWire=[];const playSocket=playHost.connect(m=>playWire.push(()=>playGuest.receive(m)));playGuest.connect(m=>playWire.push(()=>playSocket.receive(m)));
function flushPlay(){let limit=100;while(playWire.length){assert(limit-->0);playWire.shift()();}}
flushPlay();const pinned=playHost.test();flushPlay();playHost.play({action:'join',test:pinned.id});playGuest.play({action:'join',test:pinned.id});flushPlay();
const roster=playEvents.at(-1)[1];assert.equal(roster.event,'roster');assert(roster.players.every(Boolean));
playGuest.play({action:'packet',test:pinned.id,generation:roster.generation,packet:{t:'input',n:1}});flushPlay();assert.equal(playEvents.at(-1)[0],'host');assert.equal(playEvents.at(-1)[1].packet.n,1);
playHost.play({action:'packet',test:pinned.id,generation:roster.generation,packet:{t:'snapshot',frame:20}});flushPlay();assert.equal(playEvents.at(-1)[0],'guest');assert.equal(playEvents.at(-1)[1].packet.frame,20);
playSocket.close();flushPlay();assert.equal(playEvents.at(-1)[0],'host');assert.equal(playEvents.at(-1)[1].players[1],null);
console.log('PASS: authenticated co-build transport carries bidirectional native play and disconnect rosters.');
