import {readFile,writeFile,mkdir,copyFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {join,dirname} from 'node:path';
const root=fileURLToPath(new URL('../../../',import.meta.url));
const project=fileURLToPath(new URL('../',import.meta.url));
const prior=JSON.parse(await readFile(join(root,'prototypes/godot-ascend/data/audio.json'),'utf8'));
const lines=JSON.parse(await readFile(join(root,'scripts/voice/lines.json'),'utf8'));
const manifest={music:['music/midnight-field.mp3','music/watchful-greenwood.mp3'],ambience:['sfx/amb/plains.mp3','sfx/amb/forest.mp3'],effects:prior.effects,voices:{},files:[]};
const paths=new Set([...manifest.music,...manifest.ambience,...Object.values(manifest.effects).flat()]);
for(const folder of ['outskirts','woods'])for(const name of (await readdir(join(root,'public/audio/voice',folder))).sort()){
 if(!name.endsWith('.mp3'))continue;
 const id=folder+'/'+name.slice(0,-4);
 if(!lines[id])continue;
 const path='voice/'+id+'.mp3';paths.add(path);
 manifest.voices[id]={id,path,text:lines[id]};
}
for(const path of [...paths].sort()){
 const source=join(root,'public/audio',path),dest=join(project,'audio',path);
 const bytes=await readFile(source),sha256=createHash('sha256').update(bytes).digest('hex');
 if(process.argv.includes('--check')){
  const current=await readFile(dest);if(createHash('sha256').update(current).digest('hex')!==sha256)throw Error('Changed recording '+path);
 }else{await mkdir(dirname(dest),{recursive:true});await copyFile(source,dest);}
 manifest.files.push({path,source:'public/audio/'+path,sha256});
}
if(!process.argv.includes('--check'))await writeFile(join(project,'data/audio.json'),JSON.stringify(manifest,null,2)+'\n');
else if(JSON.stringify(JSON.parse(await readFile(join(project,'data/audio.json'),'utf8')))!==JSON.stringify(manifest))throw Error('Audio manifest or subtitle text changed; re-import');
console.log(`${paths.size} existing recordings; ${Object.keys(manifest.voices).length} voiced Explore lines. No generation.`);
