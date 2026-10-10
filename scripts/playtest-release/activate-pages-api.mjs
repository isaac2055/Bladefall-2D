// Run only AFTER the bladefall-2d API Worker has deployed in the same account.
// No network mutation or credentials are handled here: this stages the Pages binding.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
const file='wrangler.jsonc',pages=JSON.parse(readFileSync(file,'utf8'));
const proposed=JSON.parse(readFileSync('scripts/playtest-release/pages-api-binding.json','utf8'));
assert.equal(pages.name,'bladefall2d');assert.equal(pages.pages_build_output_dir,'./public');
const active=JSON.stringify(pages.services)===JSON.stringify(proposed.services);
if(process.argv.includes('--activate')){
 assert(!pages.services||active,'Unexpected existing service binding; review rather than overwrite');
 assert(!pages.env||Object.keys(pages.env).every(k=>k==='preview'),'Unexpected Pages environments; merge explicitly');
 assert(!pages.env?.preview||Object.keys(pages.env.preview).every(k=>k==='services'),'Unexpected preview bindings; merge explicitly');
 Object.assign(pages,proposed);writeFileSync(file,JSON.stringify(pages,null,2)+'\n');
 console.log('Pages binding staged. Commit/redeploy Pages only after the API Worker is live. Preview API remains unbound.');
}else console.log(active?'Pages production API binding is staged; preview API is disabled.':'Pages API is not connected. Deploy the API Worker, then run this script with --activate and redeploy Pages.');
