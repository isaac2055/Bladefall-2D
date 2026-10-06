// Keeps precision.html, sw.js and build-deploy.sh in step with the Precision Core's later files (7.254+):
// device modules (bladefall-pcore-dev-*.js and their -view drawers), bladefall-pcore-parts.js, and the
// part files (bladefall-pcore-part-NNN-*.js, in level order). Usage: node scripts/pcore-sync-page.mjs <version>
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const here=dirname(fileURLToPath(import.meta.url)),root=resolve(here,'..'),pub=resolve(root,'public');
const v=process.argv[2];if(!v){console.error('usage: node scripts/pcore-sync-page.mjs <version>');process.exit(1);}
const all=readdirSync(pub).sort();
const dev=all.filter(f=>/^bladefall-pcore-dev-.*\.js$/.test(f));
const parts=all.filter(f=>/^bladefall-pcore-part-\d{3}.*\.js$/.test(f));
const files=[...dev.filter(f=>!f.endsWith('-view.js')),...dev.filter(f=>f.endsWith('-view.js')),'bladefall-pcore-parts.js',...parts];
const block=(open,close,lines)=>`${open}\n${lines.join('\n')}\n${close}`;
function splice(text,open,close,lines,anchor){
 const i=text.indexOf(open),j=text.indexOf(close);
 if(i>=0&&j>i)return text.slice(0,i)+block(open,close,lines)+text.slice(j+close.length);
 const a=text.indexOf(anchor);if(a<0)throw new Error('anchor not found: '+anchor);
 const end=text.indexOf('\n',a)+1;return text.slice(0,end)+block(open,close,lines)+'\n'+text.slice(end);
}
// precision.html: after the combat view, before the page's own view script.
{const p=resolve(pub,'precision.html');let t=readFileSync(p,'utf8');
 t=splice(t,'<!-- pcore-late:start -->','<!-- pcore-late:end -->',files.map(f=>`<script src="${f}?v=${v}"></script>`),'bladefall-pcore-combat-view.js');
 writeFileSync(p,t);}
// sw.js precache.
{const p=resolve(pub,'sw.js');let t=readFileSync(p,'utf8');
 t=splice(t,'  // pcore-late:start','  // pcore-late:end',files.map(f=>`  './${f}?v=${v}',`),"'./bladefall-pcore-combat-view.js");
 writeFileSync(p,t);}
// build-deploy.sh asset list.
{const p=resolve(root,'build-deploy.sh');let t=readFileSync(p,'utf8');
 t=splice(t,'  # pcore-late:start','  # pcore-late:end',files.map(f=>`  ${f}`),'  bladefall-pcore-rooms.js');
 writeFileSync(p,t);}
console.log(`synced ${files.length} files at v=${v}`);
