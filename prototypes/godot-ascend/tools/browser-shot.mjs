// Capture the shipping browser renderer in the same authored room for comparison.
import {open} from '../../../scripts/quests/harness.mjs';import fs from 'node:fs';
const {page,errors,close}=await open('precision.html?pitch=climb&world=1&nosw=1',()=>!!window.BladefallPitchView?.climb?.watchWorlds);
try{
 await page.setViewport({width:1024,height:720});
 await page.evaluate(()=>BladefallPitchView.climb.watchWorlds([1]));
 await new Promise(r=>setTimeout(r,1600));
 fs.mkdirSync('.cache/godot',{recursive:true});
 await page.screenshot({path:'.cache/godot/browser-world1.png'});
 console.log(errors);
}finally{await close();}
