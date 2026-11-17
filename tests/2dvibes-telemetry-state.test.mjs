import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
test('The read-only game measurement surface excludes menus, watch, test mode and editor previews',()=>{
 const source=fs.readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 const code=source.match(/function gameTelemetryState\(\)\{return [^\n]+/)[0];
 let watching=false,dialog=false;
 const context={G:{stageIndex:0},mode:'play',meta:{testMode:false},watchLike:()=>watching,BladefallPlaytest:{isOpen:()=>dialog}};
 vm.createContext(context);vm.runInContext(code,context);
 const state=()=>JSON.parse(JSON.stringify(context.gameTelemetryState()));
 assert.deepEqual(state(),{schema:2,level:'stage:0',playing:true});
 watching=true;assert.equal(state().playing,false);watching=false;
 context.meta.testMode=true;assert.equal(state().playing,false);context.meta.testMode=false;
 context.G.workshopBlank=true;assert.equal(state().playing,false);context.G.workshopBlank=false;
 context.mode='pause';assert.equal(state().playing,false);context.mode='play';dialog=true;assert.equal(state().playing,false);
 assert(!('player'in state())&&!('x'in state()));
});
