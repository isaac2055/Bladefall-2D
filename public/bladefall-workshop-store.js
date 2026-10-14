/* Private device library. A failed save never replaces the last durable version. */
(function(root){
'use strict';
const PREFIX='bladefall.workshop.document.v1.';
function create({indexedDB=root.indexedDB,storage=root.localStorage,now=()=>new Date().toISOString()}={}){
 const M=root.BladefallWorkshopModel;let connection;
 const metadata=row=>({id:row.document.id,name:row.document.name,mode:row.document.mode,revision:row.document.revision,updatedAt:row.updatedAt,source:row.document.source});
 function check(old,next){if(old&&(old.document.revision>next.revision||old.document.revision===next.revision&&!M.equal(old.document,next)))throw Error('A newer or different version is already saved. Reopen it or save a separate copy.');}
 function db(){if(!indexedDB)return null;if(!connection)connection=new Promise((resolve,reject)=>{const request=indexedDB.open('bladefall-workshop',2);request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('documents'))request.result.createObjectStore('documents',{keyPath:'id'});if(!request.result.objectStoreNames.contains('journals'))request.result.createObjectStore('journals',{keyPath:'id'});};request.onsuccess=()=>{const d=request.result;d.onversionchange=()=>{d.close();connection=null;};resolve(d);};request.onerror=()=>{connection=null;reject(request.error||Error('Could not open the level library.'));};request.onblocked=()=>{connection=null;reject(Error('Close the other level-editor tab and retry saving.'));};});return connection;}
 async function save(input){const document=M.validate(input),row={id:document.id,document,updatedAt:now()};
  if(!indexedDB){const key=PREFIX+encodeURIComponent(document.id),old=storage.getItem(key);check(old?JSON.parse(old):null,document);storage.setItem(key,JSON.stringify(row));return metadata(row);}
  const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction('documents','readwrite'),store=tx.objectStore('documents'),read=store.get(document.id);let failure;
   read.onsuccess=()=>{try{check(read.result,document);store.put(row);}catch(e){failure=e;tx.abort();}};
   tx.oncomplete=()=>resolve(metadata(row));tx.onabort=tx.onerror=()=>reject(failure||tx.error||Error('Level save failed.'));
  });
 }
 async function load(id){let row;if(!indexedDB){const text=storage.getItem(PREFIX+encodeURIComponent(id));row=text?JSON.parse(text):null;}else{const d=await db();row=await new Promise((resolve,reject)=>{const r=d.transaction('documents').objectStore('documents').get(id);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}return row?M.validate(row.document):null;}
 async function list(){let rows=[];if(!indexedDB){for(let i=0;i<storage.length;i++){const key=storage.key(i);if(key?.startsWith(PREFIX)){try{const row=JSON.parse(storage.getItem(key));M.validate(row.document);rows.push(row);}catch{ /* Keep unreadable documents on disk for recovery. */ }}}}else{const d=await db();rows=await new Promise((resolve,reject)=>{const r=d.transaction('documents').objectStore('documents').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}return rows.map(metadata).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));}
 async function remove(id){if(!indexedDB){storage.removeItem(PREFIX+encodeURIComponent(id));return;}const d=await db();await new Promise((resolve,reject)=>{const tx=d.transaction('documents','readwrite');tx.objectStore('documents').delete(id);tx.oncomplete=resolve;tx.onerror=tx.onabort=()=>reject(tx.error||Error('Could not remove the draft.'));});}
 async function saveJournal(id,value){const row={id,value:M.json(value)};if(!indexedDB){storage.setItem('bladefall.workshop.journal.'+encodeURIComponent(id),JSON.stringify(row.value));return;}const d=await db();await new Promise((resolve,reject)=>{const tx=d.transaction('journals','readwrite');tx.objectStore('journals').put(row);tx.oncomplete=resolve;tx.onerror=tx.onabort=()=>reject(tx.error||Error('Could not preserve the pending edit.'));});}
 async function loadJournal(id){if(!indexedDB){const text=storage.getItem('bladefall.workshop.journal.'+encodeURIComponent(id));return text?M.json(JSON.parse(text)):null;}const d=await db();const row=await new Promise((resolve,reject)=>{const request=d.transaction('journals').objectStore('journals').get(id);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});return row?M.json(row.value):null;}
 return Object.freeze({save,load,list,remove,saveJournal,loadJournal});
}
root.BladefallWorkshopStore={create};
})(globalThis);
