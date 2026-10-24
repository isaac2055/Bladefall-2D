// Build the approved quest recording plan; existing exact dialogue is reused.
import fs from 'node:fs';import vm from 'node:vm';
const c={};vm.createContext(c);for(const f of ['bladefall-quest-round2-stories.js','bladefall-voice.js'])vm.runInContext(fs.readFileSync('public/'+f,'utf8'),c);
const cast=JSON.parse(fs.readFileSync('scripts/voice/cast.json')),catalog=JSON.parse(fs.readFileSync('scripts/voice/lines.json'));
cast['Stranded sailor']=cast['Apprentice (Ascend)'];
const main={cartographer:'Cartographer',recruit:'Recruit',quota:'Maker',neighbors:'Wendell',sailors:'Hallam'};
const folders={cartographer:'updrafts',recruit:'marksman',quota:'emberdeep',neighbors:'inversion',sailors:'cliffs'};
const plan=[],norm=c.BladefallVoice.norm,seen=new Set(Object.values(c.BladefallVoice.LINES).map(norm));
function add(id,text,who){if(!text||seen.has(norm(text)))return;seen.add(norm(text));if(!cast[who])throw Error('No cast for '+who);plan.push({id,text,speaker:who,voice_id:cast[who].id});catalog[id]=text;}
for(const[id,q]of Object.entries(c.BladefallQuestRound2Stories.stories)){
 const speaker=main[id],prefix=folders[id]+'/round2.'+id;
 const beats=(value,key,fallback=speaker)=>{if(typeof value==='string')add(prefix+'.'+key,value,fallback);else if(Array.isArray(value)){const rows=Array.isArray(value[0])?value:[value];rows.forEach(([who,text],i)=>add(prefix+'.'+key+'.'+i,text,who==='them'?speaker:who==='knight'?'The Knight':who));}};
 for(const key of ['opening','accept','firstReturn','ready','ending','longEnding','after','rewardLine'])beats(q[key],key);
 beats(q.short,'short','The Knight');if(q.thanks)beats(q.thanks,'thanks','The Knight');
 for(const[key,text]of Object.entries(q.says))beats(text,'task.'+key);
 q.ascendLines.forEach((text,i)=>add('ascend/round2.'+id+'.'+i,text,speaker));add('ascend/round2.'+id+'.done',q.ascendDone,speaker);
}
for(const[who,key,text]of [
 ['Breaker','breaker.0','Mark the piece, then follow it. Hands clear of the stamp.'],['Breaker','breaker.1','Same white mark. I will hold the chute while you work the catch.'],
 ['Ottilie','ottilie.0','Park the pot before turning. His down is not my down.'],['Ottilie','ottilie.1','I have this end. Tip the tray gently.']
])add('ascend/round2.'+key.replace(/ /g,''),text,who);
fs.mkdirSync('.cache/round2/voice',{recursive:true});fs.writeFileSync('.cache/round2/voice/plan.json',JSON.stringify(plan,null,2));
fs.writeFileSync('scripts/voice/lines.json',JSON.stringify(catalog,null,1)+'\n');fs.writeFileSync('scripts/voice/cast.json',JSON.stringify(cast,null,1)+'\n');
console.log(plan.length,'new recordings,',plan.reduce((n,p)=>n+p.text.length,0),'characters.');
