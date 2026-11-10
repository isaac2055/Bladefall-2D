// Export with Godot first, then package into Cloudflare Pages sized assets.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(project,'exports/web');
const godot=process.env.GODOT || path.resolve(project,'../../.cache/godot/Godot.app/Contents/MacOS/Godot');
await fs.rm(out,{recursive:true,force:true});
await fs.mkdir(path.join(out,'play'),{recursive:true});
for(const args of [['--editor','--import','--quit'],['--export-release','Web','exports/web/play/index.html']]) {
 const run=spawnSync(godot,['--headless','--path',project,...args],{encoding:'utf8'});
 if(run.status!==0 || /SCRIPT ERROR|Parse Error|ERROR:/.test(run.stdout+run.stderr)) throw Error(run.stdout+run.stderr);
}
const manifest={version:'0.1.0',downloadBytes:0,files:{}};
for(const name of ['index.wasm','index.pck']) {
 const bytes=await fs.readFile(path.join(out,'play',name));
 const sha256=createHash('sha256').update(bytes).digest('hex');
 const directory=`assets/${sha256.slice(0,16)}`;
 await fs.mkdir(path.join(out,'play',directory),{recursive:true});
 const parts=[];
 for(let offset=0,index=0;offset<bytes.length;offset+=16*1024*1024,index++) {
  const compressed=gzipSync(bytes.subarray(offset,offset+16*1024*1024),{level:9});
  const file=`${directory}/${index}.bin`;
  await fs.writeFile(path.join(out,'play',file),compressed);
  parts.push({url:file,size:compressed.length});manifest.downloadBytes+=compressed.length;
 }
 manifest.files[name]={size:bytes.length,sha256,parts};
 await fs.unlink(path.join(out,'play',name));
}
await fs.writeFile(path.join(out,'play/manifest.json'),JSON.stringify(manifest,null,2)+'\n');
for(const file of ['index.html','style.css','player.js']) await fs.copyFile(path.join(project,'web',file),path.join(out,file));
await fs.copyFile(path.join(project,'web/play.html'),path.join(out,'play/index.html'));
await fs.copyFile(path.join(project,'art/app-icon.svg'),path.join(out,'icon.svg'));
await fs.copyFile(path.join(project,'web/scene.png'),path.join(out,'scene.png'));
await fs.writeFile(path.join(out,'credits.txt'),await fs.readFile(path.join(project,'GODOT-LICENSE.txt'),'utf8')+'\n\n'+await fs.readFile(path.join(project,'audio/ATTRIBUTION.txt'),'utf8'));
await fs.writeFile(path.join(out,'_headers'),`/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n/play/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/play/manifest.json\n  Cache-Control: no-cache\n/play/index.html\n  Cache-Control: no-cache\n/player.js\n  Cache-Control: no-cache\n`);
async function check(dir) {for(const file of await fs.readdir(dir,{withFileTypes:true})){const target=path.join(dir,file.name);if(file.isDirectory())await check(target);else if((await fs.stat(target)).size>25*1024*1024)throw Error(`Pages asset too large: ${target}`);}}
await check(out);
console.log(`Web build: ${out}\nDownload: ${(manifest.downloadBytes/1024/1024).toFixed(1)} MiB; every Pages file below 25 MiB.`);
