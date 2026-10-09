// Private function asset: never write submissions into the public game directory.
import {writeFile,mkdir,readFile} from 'node:fs/promises';import {fileURLToPath} from 'node:url';import {resolve} from 'node:path';import {localStore} from './local-store.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url)),store=localStore(resolve(root,'scripts/playtest-release/.cache/submissions')),entries=[];
for(const {key}of(await store.list({})).blobs)entries.push([key,await store.get(key)]);
if(!entries.length){try{entries.push(...JSON.parse(await readFile(resolve(root,'netlify/functions/playtest-seed.json'),'utf8')));}catch{}}
await mkdir(resolve(root,'netlify/functions'),{recursive:true});await writeFile(resolve(root,'netlify/functions/playtest-seed.json'),JSON.stringify(entries),{mode:0o600});console.log('Prepared '+entries.filter(([k])=>k.startsWith('times/')||k.startsWith('feedback/')).length+' local submissions as a private function asset.');
