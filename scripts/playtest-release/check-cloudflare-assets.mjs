import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import {resolve} from 'node:path';
const base=resolve('public');let count=0;
// Pages publishes this directory; the separately deployed Worker owns the API and storage.
const pages=JSON.parse(await readFile('wrangler.jsonc','utf8'));
const worker=JSON.parse(await readFile('wrangler.worker.jsonc','utf8'));
const pkg=JSON.parse(await readFile('package.json','utf8'));
assert.equal(pages.name,'bladefall2d');
assert.equal(resolve(pages.pages_build_output_dir),base,'Pages must publish public/, not the repository root');
for(const key of ['main','assets','durable_objects','migrations'])assert(!(key in pages),'Worker-only configuration belongs in wrangler.worker.jsonc: '+key);
assert.equal(worker.name,'bladefall-2d');
assert.equal(worker.main,'cloudflare/worker.js');
assert.equal(resolve(worker.assets.directory),base);
assert.equal(worker.assets.binding,'ASSETS');
assert.deepEqual(worker.assets.run_worker_first,['/api/*','/.netlify/functions/*']);
assert.deepEqual(worker.durable_objects.bindings,[{name:'PLAYTEST',class_name:'PlaytestStore'}]);
assert.deepEqual(worker.migrations,[{tag:'v1',new_sqlite_classes:['PlaytestStore']}]);
for(const name of ['deploy','dev:cloudflare','verify:cloudflare'])assert.match(pkg.scripts[name],/--config wrangler\.worker\.jsonc(?:\s|$)/,name+' must explicitly select the Worker configuration');
assert.match(pkg.scripts['verify:cloudflare'],/--dry-run(?:\s|$)/);
const api=JSON.parse(await readFile('wrangler.api.jsonc','utf8'));
assert.equal(api.name,worker.name);assert.equal(api.main,'cloudflare/playtest-api.js');assert(!api.assets,'API Worker must not duplicate game assets');assert.equal(api.workers_dev,false);assert.equal(api.preview_urls,false);
assert.deepEqual(api.durable_objects,worker.durable_objects);assert.deepEqual(api.migrations,worker.migrations);
assert.match(pkg.scripts['deploy:api'],/--config wrangler\.api\.jsonc(?:\s|$)/);
const proposed=JSON.parse(await readFile('scripts/playtest-release/pages-api-binding.json','utf8'));
assert.deepEqual(proposed.services,[{binding:'PLAYTEST_API',service:api.name}]);assert.deepEqual(proposed.env.preview.services,[]);
if(pages.services){assert.deepEqual(pages.services,proposed.services);assert.deepEqual(pages.env.preview.services,[]);}
assert.deepEqual(JSON.parse(await readFile('public/_routes.json','utf8')),{version:1,include:['/api/playtest','/api/feedback-export','/api/workshop'],exclude:[]});
assert((await stat(resolve(base,'index.html'))).isFile(),'Pages output needs an index.html');
async function scan(dir){for(const f of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,f.name);if(f.isDirectory())await scan(p);else {if((await stat(p)).size>25*1024*1024)throw Error('Cloudflare asset exceeds 25 MiB: '+p);count++;}}}
await scan(base);if(count>20000)throw Error('Too many static assets');console.log('Cloudflare configuration checked: Pages publishes public/; API-only service configuration and legacy Worker preserved. Pages API binding '+(pages.services?'staged':'not activated')+'. Static assets: '+count+' files.');
