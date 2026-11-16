import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../public/bladefall-playtest.js', import.meta.url),'utf8');
test('The dedicated trial uses a clean profile, keeps the timer and invalidates hidden play',async()=>{
  const calls = [];
  let visibility;
  const document = {hidden:false,addEventListener(event,handler){if(event==='visibilitychange')visibility=handler;}};
  const context = {
    URLSearchParams,crypto,document,
    location:{search:'?dvTrial=outskirts-v1',hostname:'bladefall2d.pages.dev',protocol:'https:'},
    navigator:{onLine:true},
    localStorage:{
      getItem(key){calls.push(['read',key]);return '{"name":"Existing player"}';},
      setItem(key){calls.push(['write',key]);},
      removeItem(key){calls.push(['remove',key]);}
    },
    async fetch(){calls.push(['fetch']);throw Error('Unexpected sync');},
    BladefallPlaytestModel:{SEASON:'playtest-2026-10-v2',world:()=>({campaign:'base',name:'The Outskirts'})}
  };
  vm.runInNewContext(source,context);
  const game = context.BladefallPlaytest;
  assert.equal(game.state().data.name,'');
  assert.equal(game.clockShown(),true);
  game.start('explore','0');
  game.tick(62);
  assert.equal(game.state().run.ms,62000);
  document.hidden = true;
  visibility();
  const result = await game.complete({offer:false});
  assert.equal(result.eligible,false);
  assert.equal(result.reason,'tab hidden');
  game.setClock(false);
  await game.sync();
  assert.deepEqual(calls,[]);
});
