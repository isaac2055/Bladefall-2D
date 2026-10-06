// Room by Room: put a reviewed region on the page. Adds its file to FILES (bladefall-rbr.js), to sw.js and
// build-deploy.sh between the rbr-regions markers, and wires its own device module(s), if any, into
// precision.html, sw.js and build-deploy.sh.   node scripts/rbr-src/accept.mjs 03
import {readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..'),pub=resolve(root,'public'),V='7.264.0';
const nn=process.argv[2];const file=readdirSync(pub).find(f=>f.startsWith(`bladefall-rbr-${nn}-`)&&f.endsWith('.js'));
if(!file){console.error('no region file for',nn);process.exit(1);}
const key=file.slice(14,-3),devKey=key.slice(3);
const edit=(p,fn)=>{const f=resolve(root,p),s=readFileSync(f,'utf8'),t=fn(s);if(t!==s){writeFileSync(f,t);console.log('updated',p);}};
edit('public/bladefall-rbr.js',s=>s.includes(`'${key}'`)?s:s.replace(/const FILES=\[([^\]]*)\];/,(m,a)=>`const FILES=[${a?a+',':''}'${key}'];`));
const devs=[`bladefall-pcore-dev-rbr-${devKey}.js`,`bladefall-pcore-dev-rbr-${devKey}-view.js`].filter(f=>existsSync(resolve(pub,f)));
const swAdd=[file,...devs];
edit('public/sw.js',s=>{for(const f of swAdd)if(!s.includes(`'./${f}?`))s=s.replace('  // rbr-regions:end',`  './${f}?v=${V}',\n  // rbr-regions:end`);return s;});
edit('build-deploy.sh',s=>{for(const f of swAdd)if(!s.includes(`  ${f}\n`))s=s.replace('  # rbr-regions:end',`  ${f}\n  # rbr-regions:end`);return s;});
edit('public/precision.html',s=>{
 for(const f of devs){if(s.includes(`"${f}?`))continue;
  const anchor=f.endsWith('-view.js')?'<script src="bladefall-pcore-parts.js':'<script src="bladefall-pcore-dev-beam-view.js';
  s=s.replace(anchor,`<script src="${f}?v=${V}"></script>\n${anchor}`);}
 return s;});
