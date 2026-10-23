// Headless page for Explore quest checks: serves public/ itself, opens the game with no service worker, and
// installs small play helpers (window.__q). Used by scripts/quests/errands-check.mjs.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {extname,join,normalize} from 'node:path';
import {fileURLToPath} from 'node:url';
import {launchChrome} from '../../tests/launch-chrome.mjs';
const ROOT=fileURLToPath(new URL('../../public/',import.meta.url));
const TYPES={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.mp3':'audio/mpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.webp':'image/webp'};
export async function open(path='index.html',ready=null){
 const server=http.createServer(async(req,res)=>{try{const p=normalize(decodeURIComponent(new URL(req.url,'http://x').pathname)).replace(/^\/+/,'')||'index.html';const body=await readFile(join(ROOT,p));res.writeHead(200,{'content-type':TYPES[extname(p)]||'application/octet-stream'});res.end(body);}catch{res.writeHead(404);res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await launchChrome({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage();await page.setViewport({width:1440,height:900});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.evaluateOnNewDocument(()=>{Object.defineProperty(navigator,'serviceWorker',{get:()=>undefined});localStorage.setItem('bladefall.climb.unlock-all.v1','1');});
 await page.goto(`http://127.0.0.1:${server.address().port}/${path}`,{waitUntil:'load'});
 if(ready){await page.waitForFunction(ready,{timeout:30000});await new Promise(r=>setTimeout(r,1500));return {page,errors,close:async()=>{await browser.close();server.close();}};}
 await page.waitForFunction(()=>typeof beginRun==='function'&&typeof BladefallSideStories!=='undefined',{timeout:30000});
 await page.evaluate(()=>{
  const Q=window.__q={};
  Q.setup=(stage,id)=>{beginRun(0,null,{hp:1,dmg:1},{startStage:stage,levelSelect:true});mode='play';
   G.sessionCapabilities=BladefallCapabilities.createState({acquired:BladefallProgression.abilities.map(a=>a.id)});
   G.sessionSideStories=BladefallSideStories.reduce(null,id,{type:'choice',choice:'short'}).state;BladefallSideStoryWorld.install();BladefallSideStoryWorld.apply();};
  Q.row=id=>BladefallSideStories.row(BladefallSideStoryWorld.state(),id);
  Q.er=()=>G.obstacles.filter(o=>o.sideStoryRole==='errand').map(o=>({e:o.errand,task:o.task,x:Math.round(o.x),y:Math.round(o.y),gone:!!o.gone,held:!!o.held,perch:o.perch}));
  Q.frames=(n,k={})=>{const keys=__BF.input.keys,pr=__BF.input.pressed;for(let i=0;i<n;i++){if(mode==='conversation'){BladefallConversation.close();mode='play';}for(const c in k)keys[c]=!!k[c];if(k.press){pr[k.press]=true;}update(1/60);BFKeyboard.clearPressed();}for(const c in k)keys[c]=false;};
  Q.swing=()=>{const pr=__BF.input.pressed,k=__BF.input.keys,A=kbCode('attack');pr[A]=true;k[A]=true;let m=0;for(let i=0;i<26;i++){update(1/60);BFKeyboard.clearPressed();if(i===2)k[A]=false;m=Math.max(m,G.p.swingT||0);}return m;};
  // walk to x (jumping toward higher targets); stop on arrival
  Q.walk=(tx,ty=null,max=2400)=>{const keys=__BF.input.keys,pr=__BF.input.pressed,J=kbCode('jump');let last=-100;
   for(let f=0;f<max;f++){if(mode==='conversation'){BladefallConversation.close();mode='play';}
    const dx=tx-G.p.x;keys.ArrowLeft=dx<-8;keys.ArrowRight=dx>8;
    if(ty!=null&&G.p.onGround&&ty>G.p.y+15&&f-last>25&&Math.abs(dx)<240){pr[J]=true;last=f;}
    keys[J]=f-last<24;update(1/60);BFKeyboard.clearPressed();
    if(Math.abs(dx)<10&&(ty==null||Math.abs(G.p.y-ty)<24)){keys.ArrowLeft=keys.ArrowRight=keys[J]=false;return f;}}
   keys.ArrowLeft=keys.ArrowRight=keys[J]=false;return -1;};
  Q.put=(x,y)=>{Object.assign(G.p,{x,y,vx:0,vy:0});Q.frames(10);};
 });
 return {page,errors,close:async()=>{await browser.close();server.close();}};
}
