import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const finishSource = html.slice(
  html.indexOf('function offerExploreWorldClear('),
  html.indexOf('function recordWorldClear()')
);

test('The Outskirts exit delivers its original result after the active run changes', async () => {
  const initialRun = {world:'0', done:false, ms:67890, deaths:3, eligible:false};
  let activeRun = initialRun;
  const messages = [];
  const calls = [];
  const origin = 'https://bladefall2d.pages.dev';
  const context = {
    G:{stageIndex:0, outskirtsTrial:true},
    location:{origin},
    window:{parent:{postMessage:(data,target)=>messages.push({...data,target})}},
    BladefallPlaytest:{
      state:()=>({run:activeRun}),
      model:{world:()=>({campaign:'base',name:'The Outskirts',id:'0'})},
      async complete(options) {
        calls.push(options.offer);
        const snapshot = {...activeRun};
        activeRun.done = true;
        return snapshot;
      }
    }
  };
  context.window.window = context.window;
  vm.runInNewContext(finishSource,context);
  context.offerExploreWorldClear();
  assert.equal(calls.length,0);

  const crossing = {connectorId:'outskirts-black-woods',sourceZoneId:'outskirts',targetZoneId:'black-woods'};
  context.offerExploreWorldClear(true);
  context.offerExploreWorldClear(true,{...crossing,connectorId:'side-exit'});
  context.offerExploreWorldClear(true,{...crossing,sourceZoneId:'black-woods',targetZoneId:'outskirts'});
  assert.equal(calls.length,0);
  assert.equal(context.G.outskirtsTrial,true);
  context.offerExploreWorldClear(true,crossing);
  context.offerExploreWorldClear(true,crossing);
  activeRun = {world:'1', done:false, ms:0, deaths:0, eligible:true};
  context.G.stageIndex = 1;
  await Promise.resolve();
  assert.deepEqual(calls,[false]);
  assert.equal(context.G.outskirtsTrial,false);
  assert.deepEqual(messages,[{
    type:'bladefall:outskirts-result',ms:67890,deaths:3,eligible:false,target:origin
  }]);

  context.G.stageIndex = 0;
  activeRun = {...initialRun,done:false};
  context.offerExploreWorldClear(true);
  await Promise.resolve();
  assert.deepEqual(calls,[false,undefined]);
  assert.equal(messages.length,1);
});
