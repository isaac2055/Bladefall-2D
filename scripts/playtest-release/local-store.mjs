import {mkdir,readFile,open,link,rename,unlink,readdir} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {resolve,dirname} from 'node:path';
export function localStore(root){const path=key=>{if(!/^(owners|times|feedback)\/[a-zA-Z0-9/-]+$/.test(key))throw Error('key');return resolve(root,key+'.json');};return {
 async get(key){try{return JSON.parse(await readFile(path(key),'utf8'));}catch(e){if(e.code==='ENOENT')return null;throw e;}},
 async setJSON(key,value,{onlyIfNew=false}={}){
  const file=path(key);await mkdir(dirname(file),{recursive:true,mode:0o700});
  const temporary=file+'.'+randomUUID()+'.tmp',fd=await open(temporary,'wx',0o600);
  try{await fd.writeFile(JSON.stringify(value));await fd.sync();}finally{await fd.close();}
  try{if(onlyIfNew)await link(temporary,file);else await rename(temporary,file);return {modified:true};}
  catch(e){if(e.code==='EEXIST')return {modified:false};throw e;}
  finally{await unlink(temporary).catch(e=>{if(e.code!=='ENOENT')throw e;});}
 },
 async list({prefix=''}){const blobs=[];async function walk(dir,base=''){let files;try{files=await readdir(dir,{withFileTypes:true});}catch(e){if(e.code==='ENOENT')return;throw e;}for(const f of files){const key=base+f.name;if(f.isDirectory())await walk(resolve(dir,f.name),key+'/');else if(key.endsWith('.json')&&key.slice(0,-5).startsWith(prefix))blobs.push({key:key.slice(0,-5)});}}await walk(root);return {blobs};}
};}
