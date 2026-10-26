import http from 'node:http';
import {readFile,writeFile,mkdir,rename,copyFile,readdir,stat,rm} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createHash,randomUUID,randomBytes} from 'node:crypto';
import {execFile,spawn} from 'node:child_process';
import {promisify} from 'node:util';
import {validate} from './model.mjs';
const exec=promisify(execFile),here=path.dirname(fileURLToPath(import.meta.url)),project=path.dirname(here),repo=path.resolve(project,'../..');
export const nativeScene=path.join(project,'levels/world4.tscn');
export const cache=path.join(repo,'.cache/room-editor');
const engine=process.env.GODOT||path.join(repo,'.cache/godot/Godot.app/Contents/MacOS/Godot');
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
export async function bridge(mode,scene,input,destination){
 await mkdir(cache,{recursive:true});const id=randomUUID(),out=path.join(cache,id+'.json'),doc=path.join(cache,id+'-input.json');
 try{
  if(input)await writeFile(doc,JSON.stringify(input));
  const args=['--headless','--path',project,'--script',path.join(here,'bridge.gd'),'--',mode,scene,out];
  if(input)args.push(doc,destination);
  let failure;try{await exec(engine,args,{timeout:60000,maxBuffer:1024*1024});}catch(error){failure=error;}
  const response=JSON.parse(await readFile(out,'utf8').catch(()=>{throw new Error('Godot could not read the workshop. '+(failure?.stderr||failure?.stdout||failure?.message||''));}));
  if(!response.ok)throw new Error(response.errors.join('\n'));
  return response.document;
 }finally{await Promise.allSettled([rm(out,{force:true}),rm(doc,{force:true})]);}
}
export async function start({scene=nativeScene,port=48741,open=false,test=false}={}){
 if(!existsSync(engine))throw new Error('Godot is missing. Run Play Ascend.command once, then reopen this editor.');
 await mkdir(cache,{recursive:true});const backups=path.join(cache,test?'test-backups':'backups');await mkdir(backups,{recursive:true});
 let busy=false,game=null,closed=false;const token=randomBytes(24).toString('hex');
 const revision=async()=>digest(await readFile(scene));
 const current=async()=>{const before=await revision();const doc=await bridge('read',scene);if(before!==await revision())throw new Error('The level changed while loading. Please reload.');return {...doc,revision:before};};
 let loaded=await current();
 const server=http.createServer(async(req,res)=>{
  const send=(status,value)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(value));};
  try{
   const host=`127.0.0.1:${server.address().port}`;
   if(req.headers.host!==host)return send(403,{error:'Use the editor’s local address.'});
   if(req.headers.origin&&req.headers.origin!==`http://${host}`)return send(403,{error:'This editor only accepts its own local page.'});
   const url=new URL(req.url,`http://${host}`);
   if(req.method==='GET'&&url.pathname==='/api/meta')return send(200,{token,project,version:1});
   if(req.method==='GET'&&url.pathname==='/api/document'){if(loaded.revision!==await revision())loaded=await current();return send(200,loaded);}
   if(req.method==='GET'&&url.pathname==='/api/play-status')return send(200,{playing:!!game&&game.exitCode===null,pid:game?.pid||null});
   if(req.method==='GET'&&url.pathname==='/api/backups'){
    const names=(await readdir(backups)).filter(n=>/^[\dT_Z.-]+\.tscn$/.test(n)).sort().reverse();
    return send(200,{backups:await Promise.all(names.slice(0,40).map(async name=>({id:name,time:(await stat(path.join(backups,name))).mtime.toISOString()})))});
   }
   if(req.method==='GET'&&url.pathname==='/api/backup'){
    const id=url.searchParams.get('id');if(!id||!/^[\dT_Z.-]+\.tscn$/.test(id))return send(400,{error:'Choose a saved backup.'});
    return send(200,{...await bridge('read',path.join(backups,id)),revision:await revision(),restoreFrom:id});
   }
   if(req.method==='POST'&&url.pathname.startsWith('/api/')){
    if(req.headers['x-editor-token']!==token)return send(403,{error:'Reload the editor before saving.'});
    let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>3*1024*1024)return send(413,{error:'File is too large.'});}
    const body=JSON.parse(raw||'{}');
    if(url.pathname==='/api/save'){
     if(busy)return send(409,{error:'Another save is in progress. Try again in a moment.'});busy=true;
     const staged=path.join(cache,randomUUID()+'.tscn');
     try{
      if(body.revision!==await revision())return send(409,{error:'This level changed outside the editor. Export your draft, then Reload saved before merging your edits.'});
      const errors=validate(body);if(errors.length)return send(422,{error:errors.join('\n')});
      const original=await current();
      if(body.rooms.some((r,i)=>r.id!==original.rooms[i].id))return send(422,{error:'Keep the workshop’s original room IDs and order.'});
      let baseScene=scene;
      if(body.restoreFrom){
       if(typeof body.restoreFrom!=='string'||!/^[\dT_Z.-]+\.tscn$/.test(body.restoreFrom))return send(422,{error:'Choose a valid saved backup.'});
       baseScene=path.join(backups,body.restoreFrom);
      }
      await bridge('apply',baseScene,body,staged);
      // Reopen the serialized native scene, rather than trusting the in-memory edit.
      const checked=await bridge('read',staged);
      const savedErrors=validate(checked);if(savedErrors.length)throw new Error(savedErrors.join('\n'));
      if(body.revision!==await revision())return send(409,{error:'The level changed during save. Your draft was not written. Reload saved before retrying.'});
      const backup=path.join(backups,new Date().toISOString().replaceAll(':','_')+'.tscn');
      await copyFile(scene,backup);await rename(staged,scene);
      loaded={...checked,revision:await revision()};return send(200,{document:loaded,backup:path.basename(backup)});
     }finally{busy=false;await rm(staged,{force:true});}
    }
    if(url.pathname==='/api/play'){
     if(test)return send(403,{error:'Play is disabled in test mode.'});
     if(busy)return send(409,{error:'Wait for the current save to finish.'});
     if(body.revision!==await revision())return send(409,{error:'Save your current level before playing.'});
     const doc=await current(),index=doc.rooms.findIndex(r=>r.id===body.room);if(index<0)return send(422,{error:'Choose a workshop room.'});
     if(game&&game.exitCode===null){
      const previous=game;
      await new Promise(resolve=>{const timer=setTimeout(()=>previous.kill('SIGKILL'),2500);previous.once('exit',()=>{clearTimeout(timer);resolve();});previous.kill();});
     }
     const launched=spawn(engine,['--path',project,'--','--world','4','--room',String(index)],{stdio:'ignore'});game=launched;
     launched.on('exit',()=>{if(game===launched)game=null;});
     await new Promise((resolve,reject)=>{launched.once('spawn',resolve);launched.once('error',error=>{if(game===launched)game=null;reject(error);});});
     return send(200,{playing:true,room:body.room,pid:launched.pid});
    }
    return send(404,{error:'Unknown action.'});
   }
   if(req.method!=='GET')return send(405,{error:'Unsupported action.'});
   const files={'/':'index.html','/client.mjs':'client.mjs','/model.mjs':'model.mjs','/style.css':'style.css'};
   if(!Object.hasOwn(files,url.pathname))return send(404,{error:'Not found.'});
   const name=files[url.pathname],content=await readFile(path.join(here,name));
   res.writeHead(200,{'Content-Type':name.endsWith('.css')?'text/css':name.endsWith('.mjs')?'text/javascript':'text/html','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' blob: data:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'",'X-Content-Type-Options':'nosniff'});res.end(content);
  }catch(error){send(500,{error:error.message});}
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});
 const url=`http://127.0.0.1:${server.address().port}`;
 if(open)spawn(process.platform==='darwin'?'open':process.platform==='win32'?'explorer':'xdg-open',[url],{stdio:'ignore'}).on('error',()=>{});
 return {server,url,token,close:async()=>{if(closed)return;closed=true;if(game&&game.exitCode===null)game.kill();await new Promise(resolve=>server.close(resolve));}};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  // Reuse this checkout's editor if it is already running.
  const existing=await fetch('http://127.0.0.1:48741/api/meta',{signal:AbortSignal.timeout(700)}).then(r=>r.json()).catch(()=>null);
  if(existing?.project===project){spawn(process.platform==='darwin'?'open':'xdg-open',['http://127.0.0.1:48741'],{stdio:'ignore'});console.log('Opened the running workshop editor.');}
  else{
   const options={port:existing?0:48741,open:process.argv.includes('--open')};
   let editor;try{editor=await start(options);}catch(error){if(error.code!=='EADDRINUSE')throw error;editor=await start({...options,port:0});}
   console.log(`Bladefall Room Editor\n${editor.url}\nKeep this window open while editing. Your campaign is separate.\nPress Ctrl+C to stop.`);
   for(const sig of ['SIGINT','SIGTERM'])process.once(sig,()=>{editor.close().then(()=>process.exit(0));});
  }
 }catch(error){console.error(error.message);process.exitCode=1;}
}
