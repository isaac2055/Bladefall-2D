import {launchChrome} from '../../../tests/launch-chrome.mjs';
const b=await launchChrome({headless:true,args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1280,height:900});
await p.goto('http://localhost:8371/precision.html?pitch=climb&world=29',{waitUntil:'domcontentloaded'});
await p.waitForFunction(()=>window.BladefallPrecisionView?.view.g,{timeout:120000});
await p.evaluate(()=>{window.BladefallPitchView.menu();});await new Promise(r=>setTimeout(r,800));
const has=true;
await p.screenshot({path:decodeURIComponent(new URL('./map-40.png',import.meta.url).pathname)});console.log('menu button',has);await b.close();
