import {writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {localStore} from './local-store.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url)),online=process.argv.includes('--online');
const rows=[];
if(online){
 const site=process.env.PLAYTEST_SITE_URL,token=process.env.PLAYTEST_EXPORT_TOKEN;
 if(!site||!token)throw Error('Set PLAYTEST_SITE_URL and PLAYTEST_EXPORT_TOKEN privately before an online export.');
 const url=new URL('/api/feedback-export',site);if(url.protocol!=='https:')throw Error('Online exports require HTTPS.');
 const response=await fetch(url,{headers:{Authorization:'Bearer '+token},redirect:'error'});
 if(!response.ok)throw Error('Feedback export failed: HTTP '+response.status);
 rows.push(...(await response.json()).feedback);
}else{
 const store=localStore(resolve(root,'scripts/playtest-release/.cache/submissions'));
 for(const {key}of(await store.list({prefix:'feedback/'})).blobs)rows.push(await store.get(key,{type:'json'}));
}
const cols=['at','player','mode','campaign','world','room','name','fun','difficulty','comment','ms','deaths','build'];
const csv=[cols,...rows.map(r=>cols.map(c=>r[c]??''))].map(row=>row.map(v=>'"'+String(/^[=+@-]/.test(String(v))?"'"+v:v).replace(/"/g,'""')+'"').join(',')).join('\r\n');
const dir=resolve(root,'scripts/playtest-release/.cache/exports');await mkdir(dir,{recursive:true});
await writeFile(resolve(dir,'feedback-'+(online?'online':'local')+'.csv'),csv,{mode:0o600});console.log('Exported '+rows.length+' private feedback entries to '+dir);
