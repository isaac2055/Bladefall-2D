/* PeerJS transport with bounded chunking for large level documents. The protocol is transport-independent. */
(function(root){
'use strict';
const CHUNK=48000,MAX=24*1024*1024,ALPHABET='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let loading;
function loadPeer(){if(root.Peer)return Promise.resolve();return loading||(loading=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='peerjs.min.js';script.onload=()=>resolve();script.onerror=()=>{loading=null;script.remove();reject(Error('Could not load co-building. Please retry.'));};document.head.append(script);}));}
function channel(connection,onMessage,onError=()=>{}){
 const partial=new Map();let closed=false;
 function receive(packet){if(closed)return;try{
  if(!packet||packet.kind!=='bladefall-workshop-chunk'||typeof packet.id!=='string'||packet.id.length>80||!Number.isInteger(packet.index)||!Number.isInteger(packet.total)||packet.total<1||packet.total>Math.ceil(MAX/CHUNK)||packet.index<0||packet.index>=packet.total||typeof packet.text!=='string'||packet.text.length>CHUNK)throw Error('Invalid co-build packet.');
  const now=Date.now();for(const[id,row]of partial)if(now-row.at>30000)partial.delete(id);
  let row=partial.get(packet.id);if(!row){if(partial.size>=4)throw Error('Too many incomplete co-build messages.');row={at:now,total:packet.total,parts:new Map(),size:0};partial.set(packet.id,row);}
  if(row.total!==packet.total)throw Error('Changed co-build packet count.');
  if(row.parts.has(packet.index)){if(row.parts.get(packet.index)!==packet.text)throw Error('Changed co-build packet contents.');return;}
  row.parts.set(packet.index,packet.text);row.size+=packet.text.length;if(row.size>MAX)throw Error('Co-build message is too large.');
  if(row.parts.size===row.total){partial.delete(packet.id);const text=Array.from({length:row.total},(_,i)=>row.parts.get(i)).join('');onMessage(JSON.parse(text));}
 }catch(e){partial.clear();onError(e);}}
 connection.on('data',receive);
 return {send(message){if(closed||!connection.open)throw Error('Your co-build connection is closed.');const text=JSON.stringify(message);if(text.length>MAX)throw Error('This edit exceeds the co-build message limit.');const id=root.crypto.randomUUID(),total=Math.max(1,Math.ceil(text.length/CHUNK));for(let index=0;index<total;index++)connection.send({kind:'bladefall-workshop-chunk',id,index,total,text:text.slice(index*CHUNK,(index+1)*CHUNK)});},close(){closed=true;partial.clear();connection.off?.('data',receive);}};
}
const roomId=code=>'bladefall-builder-'+code.toLowerCase();
function makeCode(){return Array.from(root.crypto.getRandomValues(new Uint8Array(6)),n=>ALPHABET[n%ALPHABET.length]).join('');}
async function connect({role,code=makeCode(),protocol,onStatus=()=>{}}){
 code=code.trim().toUpperCase();if(!/^[A-HJ-NP-Z2-9]{6}$/.test(code))throw Error('Enter the six-character build code.');
 await loadPeer();let closed=false,peer,guestConnection=null;const channels=new Map();
 const status=(phase,message)=>{if(!closed)onStatus({role,code,phase,message});};
 function attach(connection){let wire,hostLink;
  connection.on('open',()=>{if(closed){connection.close();return;}wire=channel(connection,msg=>role==='host'?hostLink.receive(msg):protocol.receive(msg),e=>status('error',e.message));channels.set(connection,wire);
   if(role==='host')hostLink=protocol.connect(msg=>wire.send(msg));else{guestConnection=connection;protocol.connect(msg=>wire.send(msg));}status('connected',role==='host'?'A collaborator connected.':'Connected to the build.');
  });
  connection.on('close',()=>{wire?.close();channels.delete(connection);if(role==='host'){hostLink?.close();status('hosting','Build code '+code+' · waiting for collaborators.');}else if(!guestConnection||guestConnection===connection){protocol.disconnect();status('lost','Connection lost. Reconnect to send any pending edit.');}});
  connection.on('error',e=>status('error',e.message||'The connection failed.'));
 }
 peer=new root.Peer(role==='host'?roomId(code):undefined,{debug:0});
 peer.on('open',()=>{if(closed)return;if(role==='host')status('hosting','Build code '+code+' · share it with your friends.');else{status('joining','Joining '+code+'…');attach(peer.connect(roomId(code),{reliable:true}));}});
 peer.on('connection',connection=>{if(role==='host')attach(connection);else connection.close();});
 peer.on('disconnected',()=>{status('lost','Matchmaking disconnected. Reconnect if a friend cannot join.');});
 peer.on('error',e=>status('error',e.message||'Could not connect to this build.'));
 status('starting',role==='host'?'Starting your build…':'Connecting…');
 return {role,code,reconnect(){if(closed)return;if(peer.disconnected)peer.reconnect();if(role==='guest'){guestConnection?.close();status('joining','Rejoining '+code+'…');attach(peer.connect(roomId(code),{reliable:true}));}},close(){closed=true;for(const[c,w]of channels){w.close();c.close();}channels.clear();peer.destroy();if(role==='guest')protocol.disconnect();}};
}
root.BladefallWorkshopNetwork={channel,connect,makeCode};
})(globalThis);
