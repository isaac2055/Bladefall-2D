import {DurableObject} from 'cloudflare:workers';
import {handle} from '../server/playtest-service.mjs';
import {readWorkshop} from '../server/workshop-service.mjs';

// One strongly consistent SQLite store for this playtest. Nothing lives in static assets.
export class PlaytestStore extends DurableObject {
  constructor(ctx,env){
    super(ctx,env);
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS records (key TEXT PRIMARY KEY, value TEXT NOT NULL)');
    this.store={
      get:async key=>{const rows=ctx.storage.sql.exec('SELECT value FROM records WHERE key = ?',key).toArray();return rows.length?JSON.parse(rows[0].value):null;},
      setJSON:async(key,value,{onlyIfNew=false}={})=>{
        const result=ctx.storage.sql.exec(onlyIfNew?'INSERT OR IGNORE INTO records (key,value) VALUES (?,?)':'INSERT INTO records (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',key,JSON.stringify(value));
        return {modified:result.rowsWritten>0};
      },
      compareAndSet:async(key,expected,value)=>{const result=expected===null?ctx.storage.sql.exec('INSERT OR IGNORE INTO records (key,value) VALUES (?,?)',key,JSON.stringify(value)):ctx.storage.sql.exec('UPDATE records SET value = ? WHERE key = ? AND value = ?',JSON.stringify(value),key,JSON.stringify(expected));return result.rowsWritten>0;},
      list:async({prefix=''})=>({blobs:ctx.storage.sql.exec('SELECT key FROM records WHERE substr(key,1,?) = ? ORDER BY key',prefix.length,prefix).toArray()})
    };
  }
  async fetch(request){
    if(new URL(request.url).pathname==='/api/feedback-export'){
      if(!this.env.FEEDBACK_EXPORT_TOKEN)return new Response('Export not configured',{status:404});
      if(request.headers.get('Authorization')!=='Bearer '+this.env.FEEDBACK_EXPORT_TOKEN)return new Response('Forbidden',{status:403});
      const rows=[];for(const {key} of (await this.store.list({prefix:'feedback/'})).blobs)rows.push(await this.store.get(key));
      const recordings=[];for(const {key} of (await this.store.list({prefix:'recordings/'})).blobs)recordings.push(await this.store.get(key));
      const workshops=[];for(const {key} of (await this.store.list({prefix:'workshop-heads/'})).blobs){const player=key.split('/')[1],head=await this.store.get(key),saved=await readWorkshop(this.store,player,head.digest);if(saved)workshops.push({player,...saved});}
      return Response.json({feedback:rows,recordings,workshops},{headers:{'Cache-Control':'no-store'}});
    }
    return handle(request,this.store);
  }
}
export default {
  async fetch(request,env){
    const path=new URL(request.url).pathname;
    if(['/api/playtest','/.netlify/functions/playtest','/api/feedback-export','/api/workshop'].includes(path)){
      try{return await env.PLAYTEST.get(env.PLAYTEST.idFromName('playtest-v1')).fetch(request);}
      catch{return Response.json({error:'storage-unavailable'},{status:503,headers:{'Cache-Control':'no-store'}});}
    }
    return env.ASSETS.fetch(request);
  }
};
