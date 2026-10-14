// Executes the actual Explore page scripts in a DOM, without browser automation or network access.
import {Script} from 'node:vm';
import {readFileSync} from 'node:fs';import {JSDOM} from 'jsdom';
export async function exploreRuntime(query='',{beforeScript}={}){
 const html=readFileSync('public/index.html','utf8'),dom=new JSDOM(html,{url:'http://localhost/index.html'+query,runScripts:'outside-only'}),w=dom.window,errors=[];dom.virtualConsole.on('jsdomError',e=>errors.push(e.message));
 w.requestAnimationFrame=()=>0;w.cancelAnimationFrame=()=>{};w.structuredClone=structuredClone;w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){},addListener(){}});w.fetch=async()=>({ok:true,json:async()=>({}),text:async()=>''});
 w.AudioContext=class{constructor(){this.state='suspended';this.destination={};this.currentTime=0;}resume(){return Promise.resolve();}createGain(){return {gain:{value:0},connect(){}};}};
 w.HTMLMediaElement.prototype.play=()=>Promise.resolve();w.HTMLMediaElement.prototype.pause=()=>{};w.HTMLMediaElement.prototype.load=()=>{};
 const brush=new Proxy({measureText:s=>({width:String(s).length*7}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),createPattern:()=>null,getImageData:()=>({data:new Uint8ClampedArray(4)}),globalAlpha:1},{get:(t,k)=>k in t?t[k]:()=>{},set:(t,k,v)=>(t[k]=v,true)});w.HTMLCanvasElement.prototype.getContext=()=>brush;w.HTMLCanvasElement.prototype.toDataURL=()=>'';
 for(const script of w.document.querySelectorAll('script')){
  if(script.type&&script.type!=='text/javascript')continue;
  const src=script.getAttribute('src');if(src&&/^https?:|^\/\//.test(src))continue;
  if(beforeScript)await beforeScript(w,src);
  const source=src?readFileSync('public/'+src.replace(/^\.\//,'').split('?')[0],'utf8'):script.textContent;
  try{new Script(source,{filename:src||'index-inline.js'}).runInContext(dom.getInternalVMContext());if(src?.includes('littlejs'))new Script("headlessMode=true;mainCanvas=document.createElement('canvas');mainCanvas.width=1280;mainCanvas.height=720;").runInContext(dom.getInternalVMContext());}catch(e){dom.window.close();throw Error((src||'index-inline.js')+': '+e.stack);}
 }
 await Promise.resolve();
 return {dom,w,errors,close:()=>dom.window.close()};
}
if(process.argv[1]?.endsWith('explore-runtime-harness.mjs')){const app=await exploreRuntime();console.log('Loaded actual Explore runtime:',app.w.__BF.STAGES.length,'stages');app.w.beginRun(0,null,{hp:1,dmg:1},{startStage:0,levelSelect:true,testRun:true});console.log('Stage 0:',app.w.__BF.G.obstacles.length,'objects;',app.errors.length,'DOM errors');app.close();}
