import {getStore} from '@netlify/blobs';
import seed from './playtest-seed.json' with {type:'json'};
import {handle,importSeed} from '../lib/playtest-service.mjs';
let seeded;
export default async function(request){
 const store=getStore({name:'bladefall-playtest-v1',consistency:'strong'});
 try{if(!seeded)seeded=importSeed(store,seed).catch(e=>{seeded=null;throw e;});await seeded;return await handle(request,store);}
 catch{return Response.json({error:'storage-unavailable'},{status:503});}
};
