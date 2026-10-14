import '../public/bladefall-workshop-model.js';
import '../public/bladefall-workshop-ascend.js';
import '../public/bladefall-workshop-explore.js';
const M=globalThis.BladefallWorkshopModel,CHUNK=240000,MAX_PARTS=Math.ceil(M.MAX_BYTES/CHUNK);
const id=s=>typeof s==='string'&&/^[a-zA-Z0-9-]{8,128}$/.test(s),digest=s=>typeof s==='string'&&/^[a-f0-9]{64}$/.test(s);
export const workshopHash=async s=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),v=>v.toString(16).padStart(2,'0')).join('');
const response=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
const headKey=(player,key)=>'workshop-heads/'+player+'/'+key;
export async function readWorkshop(store,player,version){
 const meta=await store.get('workshop-versions/'+player+'/'+version);if(!meta||!Number.isInteger(meta.parts)||meta.parts<1||meta.parts>MAX_PARTS)return null;
 const chunks=await Promise.all(Array.from({length:meta.parts},(_,i)=>store.get('workshop-chunks/'+player+'/'+version+'/'+i)));if(chunks.some(c=>typeof c?.text!=='string'))return null;
 const text=chunks.map(c=>c.text).join('');if(text.length>M.MAX_BYTES||await workshopHash(text)!==version)return null;
 return {document:M.validate(JSON.parse(text)),metadata:meta};
}
export async function handleWorkshop(request,store){
 const url=new URL(request.url);
 if(request.method==='GET'){
  const token=url.searchParams.get('share');if(!digest(token))return response({error:'share-not-found'},404);
  const share=await store.get('workshop-shares/'+token);if(!share||share.revoked)return response({error:'share-not-found'},404);
  const saved=await readWorkshop(store,share.player,share.digest);return saved?response({document:saved.document,revision:saved.document.revision}):response({error:'share-not-found'},404);
 }
 if(request.method!=='POST')return response({error:'method'},405);
 const origin=request.headers.get('origin');if(origin&&origin!==url.origin&&origin!=='https://appassets.bladefall'&&!/^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d{1,5})?$/.test(origin))return response({error:'origin'},403);
 if(+(request.headers.get('content-length')||0)>1048576)return response({error:'size'},413);const text=await request.text();if(text.length>1048576)return response({error:'size'},413);
 let p;try{p=JSON.parse(text);}catch{return response({error:'json'},400);}
 if(!p||!id(p.player)||typeof p.token!=='string'||p.token.length<48||p.token.length>160)return response({error:'profile'},400);
 const tokenHash=await workshopHash(p.token),ownerKey='owners/'+p.player;await store.setJSON(ownerKey,{tokenHash},{onlyIfNew:true});if((await store.get(ownerKey))?.tokenHash!==tokenHash)return response({error:'profile-token'},403);
 const owner=p.player;
 if(p.op==='list'){const entries=(await store.list({prefix:'workshop-heads/'+owner+'/'})).blobs;const rows=await Promise.all(entries.map(e=>store.get(e.key)));return response({drafts:rows.filter(Boolean)});}
 if(p.op==='get'){if(!id(p.id))return response({error:'id'},400);const head=await store.get(headKey(owner,p.id));if(!head)return response({error:'not-found'},404);const saved=await readWorkshop(store,owner,head.digest);return saved?response(saved):response({error:'incomplete-upload'},503);}
 if(p.op==='chunk'){
  if(!digest(p.upload)||!Number.isInteger(p.index)||p.index<0||p.index>=MAX_PARTS||typeof p.text!=='string'||p.text.length>CHUNK)return response({error:'chunk'},400);
  const key='workshop-chunks/'+owner+'/'+p.upload+'/'+p.index;await store.setJSON(key,{text:p.text},{onlyIfNew:true});if((await store.get(key))?.text!==p.text)return response({error:'chunk-conflict'},409);return response({saved:true,index:p.index});
 }
 if(p.op==='commit'){
  if(!digest(p.upload)||!Number.isInteger(p.parts)||p.parts<1||p.parts>MAX_PARTS||!(p.base===null||digest(p.base)))return response({error:'commit'},400);
  const chunks=await Promise.all(Array.from({length:p.parts},(_,i)=>store.get('workshop-chunks/'+owner+'/'+p.upload+'/'+i)));if(chunks.some(c=>typeof c?.text!=='string'))return response({error:'missing-chunk'},409);
  const content=chunks.map(c=>c.text).join('');if(content.length>M.MAX_BYTES)return response({error:'size'},413);if(await workshopHash(content)!==p.upload)return response({error:'digest'},400);
  let doc;try{doc=M.validate(JSON.parse(content));if(!id(doc.id))throw Error('id');(doc.mode==='ascend'?globalThis.BladefallWorkshopAscend:globalThis.BladefallWorkshopExplore).compile(doc.definition);}catch{return response({error:'invalid-level'},400);}
  const key=headKey(owner,doc.id),old=await store.get(key);if(old?.digest===p.upload)return response({saved:true,metadata:old});
  if((old?.digest||null)!==p.base||old&&doc.revision<old.revision)return response({error:'conflict',current:old},409);
  const meta={id:doc.id,name:doc.name,mode:doc.mode,revision:doc.revision,digest:p.upload,parts:p.parts,updatedAt:new Date().toISOString()};
  await store.setJSON('workshop-versions/'+owner+'/'+p.upload,meta,{onlyIfNew:true});
  if(!store.compareAndSet)return response({error:'atomic-storage-unavailable'},503);
  if(!await store.compareAndSet(key,old,meta))return response({error:'conflict',current:await store.get(key)},409);
  return response({saved:true,metadata:meta});
 }
 if(p.op==='share'){
  if(!id(p.id))return response({error:'id'},400);const head=await store.get(headKey(owner,p.id));if(!head)return response({error:'not-found'},404);
  if(p.digest!==head.digest)return response({error:'conflict',current:head},409);
  const token=crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-','');await store.setJSON('workshop-shares/'+token,{player:owner,digest:head.digest,id:p.id},{onlyIfNew:true});return response({share:token,revision:head.revision});
 }
 if(p.op==='revoke'){
  if(!digest(p.share))return response({error:'share-not-found'},404);const key='workshop-shares/'+p.share,share=await store.get(key);if(!share||share.player!==owner)return response({error:'share-not-found'},404);await store.setJSON(key,{...share,revoked:true});return response({revoked:true});
 }
 return response({error:'operation'},400);
}
