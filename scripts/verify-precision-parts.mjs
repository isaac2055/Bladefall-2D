// Runs every later-part verifier (scripts/verify-precision-part-NNN.mjs) and the device fixtures, in order.
import {readdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const here=dirname(fileURLToPath(import.meta.url));
const files=['verify-precision-devices.mjs',...readdirSync(here).filter(f=>/^verify-precision-part-\d{3}\.mjs$/.test(f)).sort()];
let bad=0;
for(const f of files){
 const t=Date.now(),r=spawnSync(process.execPath,[resolve(here,f)],{encoding:'utf8'});
 const tail=(r.stdout||'').trim().split('\n').pop();
 console.log(`${r.status===0?'ok  ':'FAIL'} ${f}: ${tail} (${((Date.now()-t)/1000).toFixed(0)} s)`);
 if(r.status!==0){bad++;console.log((r.stdout||'').split('\n').filter(l=>l.includes('FAIL')).join('\n'),(r.stderr||'').slice(-800));}
}
process.exit(bad?1:0);
