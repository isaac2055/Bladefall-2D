import {launchChrome} from '../../../tests/launch-chrome.mjs';
const W=+process.argv[2];const b=await launchChrome({headless:true,args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1280,height:720});
await p.goto('http://localhost:8371/precision.html?pitch=climb&world='+W,{waitUntil:'domcontentloaded'});
await p.waitForFunction(()=>window.BladefallPrecisionView?.view.g,{timeout:120000});
await p.evaluate(()=>{const V=BladefallPrecisionView;V.view.paused=false;for(let i=0;i<40;i++)V.advance(['']);});
await p.screenshot({path:decodeURIComponent(new URL('./shot-w'+W+'.png',import.meta.url).pathname)});await b.close();
