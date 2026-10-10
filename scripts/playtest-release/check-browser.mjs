// Isolated browser profiles and a temporary server store; never touches real playtest submissions.
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {mkdtemp,mkdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url)),temp=await mkdtemp(join(tmpdir(),'bladefall-browser-check-'));
const socket=createServer();await new Promise(r=>socket.listen(0,'127.0.0.1',r));const port=socket.address().port;await new Promise(r=>socket.close(r));
const env={...process.env,PORT:String(port),PLAYTEST_DATA_DIR:join(temp,'submissions'),PLAYTEST_TEST_URL:'http://localhost:'+port+'/',PLAYTEST_ARTIFACT_DIR:join(root,'scripts/playtest-release/.cache/checks')};
await mkdir(env.PLAYTEST_ARTIFACT_DIR,{recursive:true});
const server=spawn(process.execPath,['public/serve.mjs'],{cwd:root,env,stdio:['ignore','pipe','inherit']});
try{
 await new Promise((resolve,reject)=>{server.stdout.on('data',d=>{if(String(d).includes('serving on'))resolve();});server.once('error',reject);server.once('exit',code=>reject(Error('Server exited '+code)));});
 const requested=process.argv.slice(2),all=['browser-check','explore-check','world-check','public-mobile-check','final-check','release-integration'];
 for(const name of requested.length?requested:all){
  if(!all.includes(name))throw Error('Unknown fixture '+name);
  await new Promise((resolve,reject)=>{const child=spawn(process.execPath,['scripts/playtest-release/fixture-'+name+'.mjs'],{cwd:root,env,stdio:'inherit'});child.once('error',reject);child.once('exit',code=>code===0?resolve():reject(Error(name+' exited '+code)));});
 }
}finally{server.kill();await new Promise(r=>server.once('close',r));await rm(temp,{recursive:true,force:true});}
