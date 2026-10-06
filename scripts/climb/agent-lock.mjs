// Heartbeat lock for the hourly Climb routine (worlds 15–20, then the fractured worlds).
//   node scripts/climb/agent-lock.mjs status        → prints ACTIVE or FREE (exit 0 if free, 3 if active)
//   node scripts/climb/agent-lock.mjs claim "note"  → takes the lock (refuses if ACTIVE)
//   node scripts/climb/agent-lock.mjs beat "note"   → refreshes the heartbeat (do this at least every 10 minutes)
//   node scripts/climb/agent-lock.mjs release "summary"
// "Active" means: the heartbeat is under 15 minutes old. An open but idle chat never refreshes it, and a crashed run
// stops refreshing it, so neither blocks the next hour's run (no false positives from processes or open sessions).
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const file=resolve(root,'LLM-HANDOFF/locks/climb-15-20.json');
const STALE_MIN=15;
const [cmd='status',...rest]=process.argv.slice(2),note=rest.join(' ');
let lock=null;try{lock=JSON.parse(readFileSync(file,'utf8'));}catch(e){}
const ageMin=lock?.heartbeat?(Date.now()-Date.parse(lock.heartbeat))/60000:Infinity;
const active=!!lock&&!lock.released&&ageMin<STALE_MIN;
const write=o=>{mkdirSync(dirname(file),{recursive:true});writeFileSync(file,JSON.stringify(o,null,1)+'\n');};
const now=new Date().toISOString();
if(cmd==='status'){
 console.log(active?`ACTIVE — heartbeat ${ageMin.toFixed(1)} min ago (${lock.note||''}), run started ${lock.started}`:`FREE${lock?` — last run ${lock.released?'released':'stale'} (heartbeat ${isFinite(ageMin)?ageMin.toFixed(0)+' min ago':'never'})`:''}`);
 process.exit(active?3:0);
}
if(cmd==='claim'){
 if(active){console.log(`REFUSED — another run is active (heartbeat ${ageMin.toFixed(1)} min ago)`);process.exit(3);}
 write({started:now,heartbeat:now,note,released:false,previous:lock?{started:lock.started,heartbeat:lock.heartbeat,released:lock.released,summary:lock.summary}:null});
 console.log('CLAIMED');process.exit(0);
}
if(cmd==='beat'){if(!lock){console.log('no lock to beat');process.exit(1);}write({...lock,heartbeat:now,note:note||lock.note});console.log('beat');process.exit(0);}
if(cmd==='release'){if(lock)write({...lock,heartbeat:now,released:true,summary:note});console.log('released');process.exit(0);}
console.log('unknown command');process.exit(1);
