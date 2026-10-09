import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import '../../public/bladefall-playtest-worlds.js';
import '../../public/bladefall-playtest-model.js';
const base=process.env.PLAYTEST_TEST_URL||'http://localhost:8387',M=globalThis.BladefallPlaytestModel;
assert.ok(['localhost','127.0.0.1'].includes(new URL(base).hostname),'Fixture only writes to a local test Worker.');
const api=base+'/api/playtest',token='local-fixture-token-'.repeat(4),record={id:'cloudflare-record-01',player:'cloudflare-player-01',season:M.SEASON,mode:'explore',campaign:'base',world:'0',name:'Isolated QA',ms:23456,deaths:3,eligible:true};
const post=(kind,r,secret=token)=>fetch(api,{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify({kind,player:r.player,token:secret,record:r})});
if(!process.argv.includes('--read-only')){
 assert.equal((await post('time',record)).status,200);
 assert.equal((await post('time',{...record,ms:12})).status,200);
 assert.equal((await post('time',{...record,id:'cloudflare-record-02'},'wrong-token-'.repeat(6))).status,403);
 assert.equal((await post('feedback',{...record,id:'cloudflare-feedback-01',room:'test-room',fun:8,difficulty:3,comment:'Private Cloudflare QA'})).status,200);
}
const rows=await(await fetch(api)).json();assert.equal(rows.records.length,1);assert.equal(rows.records[0].ms,23456);assert.equal(rows.records[0].deaths,3);assert.ok(!JSON.stringify(rows).includes('Private Cloudflare QA'));
assert.equal((await fetch(base+'/api/feedback-export')).status,403);
const privateRows=await(await fetch(base+'/api/feedback-export',{headers:{Authorization:'Bearer local-test-export'}})).json();assert.equal(privateRows.feedback.length,1);
for(const path of ['/','/precision.html?pitch=climb&world=1'])assert.ok((await(await fetch(base+path)).text()).includes('7.301.0'));
assert.equal((await fetch(base+'/serve.mjs')).status,404);
const sw=await readFile(new URL('../../public/sw.js',import.meta.url),'utf8'),assets=sw.match(/const CORE_ASSETS = \[([\s\S]*?)\];/)[1].match(/'([^']+)'/g).map(s=>s.slice(1,-1));
for(let i=0;i<assets.length;i+=16)await Promise.all(assets.slice(i,i+16).map(async path=>assert.ok((await fetch(new URL(path,base+'/'))).ok,'Missing offline asset '+path)));
console.log('PASS: Cloudflare assets, complete offline asset list, immutable SQLite scores, ownership, private feedback, authenticated export'+(process.argv.includes('--read-only')?' and persistence across restart.':'.'));
