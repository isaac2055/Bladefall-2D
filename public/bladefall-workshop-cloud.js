/* Local-first cloud drafts. Queue metadata is small; level bodies stay in the durable device library. */
(function(root){
'use strict';
const KEY='bladefall.workshop.cloud.v1',CHUNK=240000;let singleton;
function create({local=root.BladefallWorkshopStore.create(),storage=root.localStorage,fetcher=(...args)=>root.fetch(...args),profile=()=>root.BladefallPlaytest?.state().data,endpoint,notify=()=>{},auto=true}={}){
 const M=root.BladefallWorkshopModel;
 endpoint=endpoint||(['appassets.bladefall','localhost','127.0.0.1','[::1]',''].includes(root.location.hostname)?'https://bladefall2d.pages.dev/api/workshop':'/api/workshop');
 let records={};try{records=JSON.parse(storage.getItem(KEY))||{};}catch{}
 let running=null,timer=null,closed=false;const listeners=new Set();
 const report=id=>{notify(id,state(id));for(const fn of listeners)fn(id,state(id));};
 function persist(){storage.setItem(KEY,JSON.stringify(records));}
 function state(id){const r=records[id];return {status:r?.status||'local',message:r?.error||({synced:'Saved privately to the cloud',uploading:'Saved locally · uploading',pending:'Saved locally · cloud upload queued',conflict:'Saved locally · cloud version differs'}[r?.status]||'Saved on this device'),metadata:r?.metadata||null};}
 async function request(payload){const p=profile();if(!p?.player||!p?.token)throw Error('Cloud profile is not available yet.');const response=await fetcher(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,player:p.player,token:p.token})});let body;try{body=await response.json();}catch{throw Error('Cloud service is unavailable. Your draft remains on this device.');}if(!response.ok){const error=Error(body.error==='conflict'?'The cloud has another version. Open it from the library or create a separate copy.':'Cloud save unavailable ('+response.status+'). Your draft remains on this device.');error.conflict=body.error==='conflict';error.current=body.current;throw error;}return body;}
 async function hash(text){return Array.from(new Uint8Array(await root.crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),v=>v.toString(16).padStart(2,'0')).join('');}
 async function upload(id){const doc=await local.load(id);if(!doc)return;const before=records[id]||{},row=records[id]={...before,status:'uploading',error:null};report(id);
  try{const text=JSON.stringify(doc),digest=await hash(text);if(row.metadata?.digest===digest){row.pending=false;row.status='synced';persist();report(id);return row.metadata;}
   const parts=Math.ceil(text.length/CHUNK);for(let index=0;index<parts;index++)await request({op:'chunk',upload:digest,index,text:text.slice(index*CHUNK,(index+1)*CHUNK)});
   const result=await request({op:'commit',upload:digest,parts,base:row.metadata?.digest||null});if(!result.saved||result.metadata?.digest!==digest)throw Error('The cloud did not confirm this version.');
   const latest=await local.load(id),again=latest&&!M.equal(latest,doc);records[id]={metadata:result.metadata,pending:!!again,status:again?'pending':'synced',error:null};persist();report(id);return result.metadata;
  }catch(e){const current=records[id]||row;records[id]={...current,pending:!e.conflict,status:e.conflict?'conflict':'pending',error:e.message,current:e.current||null};try{persist();}catch{}report(id);throw e;}
 }
 async function sync(){if(closed)return;if(running)return running;running=(async()=>{for(const [id,r]of Object.entries(records))if(r.pending){try{await upload(id);}catch{/* Retain the document and metadata for reconnect. */}}})().finally(()=>{running=null;});return running;}
 function schedule(){if(!auto||closed)return;clearTimeout(timer);timer=setTimeout(()=>void sync(),750);}
 async function save(doc){const result=await local.save(doc),old=records[doc.id];records[doc.id]={...old,pending:old?.status!=='conflict',status:old?.status==='conflict'?'conflict':'pending',error:old?.status==='conflict'?old.error:null};try{persist();}catch{records[doc.id].error='Saved locally; cloud queue metadata could not be saved.';}report(doc.id);schedule();return result;}
 async function refreshPending(){for(const row of await local.list())if(!records[row.id]||records[row.id].metadata?.revision!==row.revision&&records[row.id].status!=='conflict'){records[row.id]={...records[row.id],pending:true,status:'pending'};}try{persist();}catch{}schedule();}
 async function flush(id){for(let attempt=0;attempt<3;attempt++){await sync();if(records[id]?.status==='conflict')throw Error(state(id).message);const latest=await local.load(id);if(!latest)throw Error('Save this level first.');if(records[id]?.status==='synced'&&records[id]?.metadata?.revision===latest.revision&&!records[id]?.pending)return records[id].metadata;records[id]={...records[id],pending:true,status:'pending'};}throw Error(state(id).message||'Edits are still arriving. Retry sharing once the upload finishes.');}
 async function download(id){const result=await request({op:'get',id}),doc=M.validate(result.document);const current=await local.load(id);if(current&&!M.equal(current,doc)){
   const copy=M.create({id:root.crypto.randomUUID(),mode:doc.mode,name:(doc.name+' cloud copy').slice(0,160),source:doc.source,definition:doc.definition});await save(copy);return copy;
  }
  await local.save(doc);records[id]={metadata:result.metadata,status:'synced',pending:false};persist();report(id);return doc;
 }
 async function share(id){const meta=await flush(id),result=await request({op:'share',id,digest:meta.digest});if(!/^[a-f0-9]{64}$/.test(result.share||''))throw Error('The service did not provide a share link.');const url=new URL(meta.mode==='ascend'?'precision.html':'index.html',new URL(endpoint,root.location.href).origin+'/');url.searchParams.set('workshopShare',result.share);return {url:url.href,token:result.share,revision:result.revision};}
 async function shared(token){const response=await fetcher(endpoint+'?share='+encodeURIComponent(token));if(!response.ok)throw Error('This shared level is unavailable or its link was revoked.');const body=await response.json();return M.validate(body.document);}
 const online=()=>void sync();root.addEventListener?.('online',online);const interval=auto?root.setInterval(()=>{if(root.navigator?.onLine!==false)void sync();},30000):null;
 if(auto)void refreshPending().catch(()=>{});
 return {save,load:local.load,list:local.list,remove:local.remove,cloud:{state,subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn);},sync,flush,list:async()=>(await request({op:'list'})).drafts,download,share,shared,revoke:token=>request({op:'revoke',share:token})},close(){closed=true;clearTimeout(timer);if(interval)root.clearInterval(interval);root.removeEventListener?.('online',online);listeners.clear();}};
}
root.BladefallWorkshopCloud={create,library:()=>singleton||(singleton=create())};
})(globalThis);
