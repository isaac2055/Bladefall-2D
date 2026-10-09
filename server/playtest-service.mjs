import '../public/bladefall-playtest-worlds.js';
import '../public/bladefall-playtest-model.js';
const M=globalThis.BladefallPlaytestModel;
const id=s=>typeof s==='string'&&/^[a-zA-Z0-9-]{8,128}$/.test(s);
const hash=async s=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),v=>v.toString(16).padStart(2,'0')).join('');
const response=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
export async function handle(request,store){
 if(request.method==='GET'){
  const listing=await store.list({prefix:'times/'+M.SEASON+'/'}),records=[];
  for(let i=0;i<listing.blobs.length;i+=20){const rows=await Promise.all(listing.blobs.slice(i,i+20).map(b=>store.get(b.key,{type:'json'})));records.push(...rows.filter(M.valid));}
  return response({season:M.SEASON,records:M.best(records)});
 }
 if(request.method!=='POST')return response({error:'method'},405);
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return response({error:'origin'},403);
 if(+(request.headers.get('content-length')||0)>16384)return response({error:'size'},413);
 const body=await request.text();if(body.length>16384)return response({error:'size'},413);
 let payload;try{payload=JSON.parse(body);}catch{return response({error:'json'},400);}
 if(!payload||typeof payload!=='object'||Array.isArray(payload))return response({error:'json'},400);
 const {kind,player,token,record:r}=payload;
 if(!id(player)||typeof token!=='string'||token.length<48||token.length>160||!r||r.player!==player||!id(r.id)||r.season!==M.SEASON)return response({error:'profile'},400);
 let record;
 if(kind==='time'){
  if(!M.valid(r)||r.eligible!==true)return response({error:'invalid-time'},400);
  record={id:r.id,season:M.SEASON,player,name:r.name.trim(),mode:r.mode,campaign:r.campaign,world:String(r.world),ms:r.ms,deaths:r.deaths,at:new Date().toISOString()};
 }else if(kind==='feedback'){
  if(!M.world(r.mode,r.world)||M.world(r.mode,r.world).campaign!==r.campaign||!Number.isInteger(r.fun)||r.fun<1||r.fun>10||!Number.isInteger(r.difficulty)||r.difficulty<1||r.difficulty>5||typeof r.comment!=='string'||r.comment.length>4000||String(r.room||'').length>160)return response({error:'invalid-feedback'},400);
  record={id:r.id,season:M.SEASON,player,mode:r.mode,campaign:r.campaign,world:String(r.world),room:String(r.room||''),name:String(r.name||M.world(r.mode,r.world).name).slice(0,160),fun:r.fun,difficulty:r.difficulty,comment:r.comment,ms:Number.isFinite(r.ms)?Math.max(0,Math.round(r.ms)):0,deaths:Number.isInteger(r.deaths)?Math.max(0,r.deaths):0,build:String(r.build||'').slice(0,40),at:new Date().toISOString()};
 }else return response({error:'kind'},400);
 const ownerKey='owners/'+player,tokenHash=await hash(token);await store.setJSON(ownerKey,{tokenHash},{onlyIfNew:true});
 if((await store.get(ownerKey,{type:'json'}))?.tokenHash!==tokenHash)return response({error:'profile-token'},403);
 const key=(kind==='time'?'times/':'feedback/')+M.SEASON+'/'+player+'/'+r.id;
 await store.setJSON(key,record,{onlyIfNew:true});return response({saved:true,id:r.id});
}
export async function importSeed(store,entries){const safe=entries.filter(([key])=>/^(owners|times|feedback)\//.test(key));for(let i=0;i<safe.length;i+=16)await Promise.all(safe.slice(i,i+16).map(([key,value])=>store.setJSON(key,value,{onlyIfNew:true})));}
