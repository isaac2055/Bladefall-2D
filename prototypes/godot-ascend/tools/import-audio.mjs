// Reuse shipped recordings byte-for-byte. No network, synthesis or ElevenLabs calls.
import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';import {createRequire} from 'node:module';import {createHash} from 'node:crypto';import {root} from './reference.mjs';
const require=createRequire(import.meta.url),voice=require(path.join(root,'public/bladefall-voice.js'));
const project=path.join(root,'prototypes/godot-ascend'),worlds=[1,2,3].map(n=>JSON.parse(fs.readFileSync(path.join(project,`data/world${n}.json`))).world);
const source=fs.readFileSync(path.join(root,'public/bladefall-sfx.js'),'utf8'),ctx=vm.createContext({console});vm.runInContext(source,ctx);const bank=ctx.BladefallSfx.BANK;
const effects=['jump','walljump','dash','land-soft','land-hard','grab','wallslide','step-dirt','step-stone','swing','death','gem','rune','gate','crumble','zip','stone-hit','lantern','plate','lever','shatter','quest','ui-open','ui-select','ui-move','ui-pause','ui-back','spot-fire','work-cloth','work-whetstone','work-pages','kn-jump','kn-jump2','kn-dash','kn-land','kn-death','kn-climb'];
const manifest={music:'music/midnight-field.mp3',ambience:'sfx/amb/plains.mp3',effects:{},voices:{},unvoiced:[],files:[]};
function copy(relative){const input=path.join(root,'public/audio',relative),output=path.join(project,'audio',relative);const bytes=fs.readFileSync(input),sha256=createHash('sha256').update(bytes).digest('hex');if(process.argv.includes('--check')){if(!fs.existsSync(output)||!bytes.equals(fs.readFileSync(output)))throw Error('Recording differs: '+relative);}else{fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,bytes);}manifest.files.push({path:relative,source:'public/audio/'+relative,sha256,bytes:bytes.length});return relative;}
manifest.chapters={'1':{music:manifest.music,ambience:manifest.ambience},'2':{music:'music/watchful-greenwood.mp3',ambience:'sfx/amb/forest.mp3'},'3':{music:'music/the-iron-causeway.mp3',bossMusic:'music/iron-juggernaut.mp3',ambience:'sfx/amb/heights.mp3'}};
for(const chapter of Object.values(manifest.chapters)){copy(chapter.music);copy(chapter.ambience);if(chapter.bossMusic)copy(chapter.bossMusic);}
for(const name of effects){manifest.effects[name]=[];for(let i=1;i<=bank[name];i++)manifest.effects[name].push(copy('sfx/'+name+(bank[name]>1?'-'+i:'')+'.mp3'));}
for(const world of worlds)for(const room of world.rooms)for(const person of room.people||[])for(const field of ['line','lineDone']){const text=person[field];if(!text)continue;const id=voice.clipFor(text);const key=room.id+':'+person.who+':'+field;if(!id){manifest.unvoiced.push({key,text});continue;}manifest.voices[key]={text,id,seconds:voice.SECONDS[id],name:person.name||person.who[0].toUpperCase()+person.who.slice(1),path:'voice/'+id+'.mp3'};if(!manifest.files.some(f=>f.path==='voice/'+id+'.mp3'))copy('voice/'+id+'.mp3');}
const quest=JSON.parse(fs.readFileSync(path.join(project,'data/world2.json'))).quest;
for(const [key,text]of [['refuge:line0',quest.lines[0]],['refuge:line1',quest.lines[1]],['refuge:done',quest.doneLine]]){
 const id=voice.clipFor(text);if(!id)throw Error('Existing quest recording missing: '+text);
 manifest.voices[key]={text,id,seconds:voice.SECONDS[id],name:'Elsie',path:'voice/'+id+'.mp3'};
 if(!manifest.files.some(f=>f.path==='voice/'+id+'.mp3'))copy('voice/'+id+'.mp3');
}
const silas=JSON.parse(fs.readFileSync(path.join(project,'data/world3.json'))).quest;
for(const [key,text]of [['defector:line0',silas.lines[0]],['defector:line1',silas.lines[1]],['defector:done',silas.doneLine]]){
 const id=voice.clipFor(text);if(!id)throw Error('Existing quest recording missing: '+text);
 manifest.voices[key]={text,id,seconds:voice.SECONDS[id],name:'Silas',path:'voice/'+id+'.mp3'};
 if(!manifest.files.some(f=>f.path==='voice/'+id+'.mp3'))copy('voice/'+id+'.mp3');
}
const output=path.join(project,'data/audio.json'),json=JSON.stringify(manifest,null,2)+'\n';if(process.argv.includes('--check')){if(fs.readFileSync(output,'utf8')!==json)throw Error('Audio manifest is stale');}else fs.writeFileSync(output,json);
console.log(`${manifest.files.length} existing files; ${Object.keys(manifest.voices).length} recorded NPC lines; ${manifest.unvoiced.length} existing unvoiced line(s). No generation.`);
