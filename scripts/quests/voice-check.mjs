// Verify every live dialogue line in the three revised quests has a decodable, matching recording.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const c={};vm.createContext(c);
for(const name of ['side-stories','climb-errands','voice'])vm.runInContext(fs.readFileSync(`public/bladefall-${name}.js`,'utf8'),c);
let count=0;const checked=new Set();
function check(text){
 const id=c.BladefallVoice.clipFor(text);assert.ok(id,`No voice for: ${text}`);
 if(checked.has(id))return;checked.add(id);
 const path=`public/audio/voice/${id}.mp3`;assert.ok(fs.existsSync(path),path);
 const duration=Number(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','csv=p=0',path]));
 assert.ok(duration>0&&Number.isFinite(duration),path);count++;
}
for(const id of ['refuge','defector','archivist']){
 const q=c.BladefallSideStories.byId[id];
 for(const key of ['opening','short','accept','ready','ending','longEnding','after','rewardLine','thanks'])if(typeof q[key]==='string')check(q[key]);
 for(const rows of [q.firstReturn,q.readyLines])for(const row of rows||[])check(row[1]);
 for(const text of Object.values(q.says))check(text);
 for(const text of c.BladefallClimbErrands.QUESTS[id].lines)check(text);check(c.BladefallClimbErrands.QUESTS[id].doneLine);
}
console.log(`PASS: ${count} distinct quest dialogue recordings match current text and decode.`);
