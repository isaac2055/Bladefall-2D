// Frame-for-frame digest of every taped Precision Core room (including the merge pitches), for proving a
// core change leaves existing rooms untouched. Prints one hash; with --write FILE stores it, with --check FILE compares.
//   node scripts/pcore-digest-all.mjs --write /tmp/before.txt ; (change) ; node scripts/pcore-digest-all.mjs --check /tmp/before.txt
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
globalThis.BLADEFALL_PITCHES=true;
const here=dirname(fileURLToPath(import.meta.url)),require=createRequire(import.meta.url);
const {Core,Rooms,expand,keysToInput}=await import('./pcore-tape.mjs');
require(resolve(here,'../public/bladefall-pcore-pitches.js'));
const h=createHash('sha256');let n=0;const per={};
for(const [i,d] of Rooms.all.entries()){
 const tape=Rooms.tapes[d.id];if(!tape)continue;
 const g=Core.createGame(Rooms.all,{room:i});const r=createHash('sha1');
 for(const k of [...expand(tape),...Array(30).fill('')]){Core.step(g,keysToInput(k));r.update(Core.digest(g));g.events.length=0;}
 per[d.id]=r.digest('hex');h.update(d.id+per[d.id]);n++;
}
const sum=h.digest('hex');console.log(n,'rooms',sum);
const a=process.argv.indexOf('--write'),c=process.argv.indexOf('--check');
if(a>0)writeFileSync(process.argv[a+1],JSON.stringify({sum,per}));
if(c>0){const old=JSON.parse(readFileSync(process.argv[c+1],'utf8'));const bad=Object.keys(old.per).filter(k=>old.per[k]!==per[k]);
 console.log(bad.length?'CHANGED: '+bad.join(' '):'identical to the stored digest');process.exit(bad.length?1:0);}
