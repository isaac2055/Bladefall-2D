import {createHash} from 'node:crypto';import fs from 'node:fs';import vm from 'node:vm';import path from 'node:path';import {fileURLToPath} from 'node:url';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
export function reference(){
 const ctx=vm.createContext({console,BLADEFALL_CLIMB:true});ctx.__loadedSources={};
 const run=name=>{const source=fs.readFileSync(path.join(root,'public',name+'.js'),'utf8');ctx.__loadedSources[name+'.js']=createHash('sha256').update(source).digest('hex');return vm.runInContext(source,ctx,{filename:name});};
 for(const name of ['bladefall-pcore','bladefall-pcore-combat','bladefall-pcore-foes','bladefall-pcore-portals'])run(name);
 for(const name of fs.readdirSync(path.join(root,'public')).sort())if(/^bladefall-pcore-dev-.*\.js$/.test(name)&&!/-view\.js$/.test(name)&&!name.includes('cargo-clasp'))run(name.slice(0,-3));
 run('bladefall-pcore-dev-cargo-clasp');
 for(const name of ['bladefall-climb-atlas','bladefall-climb-passages','bladefall-climb','bladefall-climb-worlds'])run(name);
 return ctx;
}
