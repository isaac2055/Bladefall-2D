import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
const source=await readFile(new URL('../../../public/index.html',import.meta.url),'utf8');
const literal=source.match(/const KB_DEFAULTS=(\{[^;]+\});/)[1];
const defaults=vm.runInNewContext('('+literal+')');
const verbs={left:'left',right:'right',jump:'jump',attack:'attack',dash:'dash',command:'companion',pickup:'pickup',flag:'checkpoint',pause:'pause'};
const keys=Object.fromEntries(Object.entries(verbs).map(([native,original])=>[native,[defaults[original]]]));
keys.interact=['ArrowUp'];
const data={source:'public/index.html / KB_DEFAULTS and beginOutskirtsInteraction',sha256:createHash('sha256').update(source).digest('hex'),keys};
const target=new URL('../data/controls.json',import.meta.url);
if(process.argv.includes('--check')){
 if(JSON.stringify(JSON.parse(await readFile(target,'utf8')))!==JSON.stringify(data))throw Error('Explore controls changed; re-import');
}else await writeFile(target,JSON.stringify(data,null,2)+'\n');
console.log('Explore browser keyboard defaults verified');
