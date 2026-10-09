import {readdir,stat} from 'node:fs/promises';
import {resolve} from 'node:path';
const base=resolve('public');let count=0;
async function scan(dir){for(const f of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,f.name);if(f.isDirectory())await scan(p);else {if((await stat(p)).size>25*1024*1024)throw Error('Cloudflare asset exceeds 25 MiB: '+p);count++;}}}
await scan(base);if(count>20000)throw Error('Too many static assets');console.log('Cloudflare static assets ready: '+count+' files. No private submissions are bundled.');
