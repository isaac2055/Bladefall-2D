/* Local, deterministic browser fixtures: transitions are fast-forwarded, actual keyboard blade contact is not. */
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {launchChrome} from '../../tests/launch-chrome.mjs';
const out=resolve('scripts/climb/.cache/explore-finale-7.304');await mkdir(out,{recursive:true});
const browser=await launchChrome({headless:true,args:['--no-sandbox']});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const mime={'.js':'text/javascript','.html':'text/html','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.mp3':'audio/mpeg','.ogg':'audio/ogg','.json':'application/json','.webmanifest':'application/manifest+json'};
// Local assets with a production origin exercise the real public-only UI branch without uploading a build.
await page.setRequestInterception(true);page.on('request',async req=>{try{const u=new URL(req.url());if(u.hostname!=='bladefall2d.pages.dev')return req.abort();const path=resolve('public','.'+(u.pathname==='/'?'/index.html':u.pathname));if(!path.startsWith(resolve('public')+'/'))return req.abort();const body=await readFile(path);await req.respond({status:200,contentType:mime[extname(path)]||'application/octet-stream',body});}catch{await req.respond({status:404,body:''});}});
const pause=ms=>new Promise(r=>setTimeout(r,ms));const checks=[];
try{
 await page.goto('https://bladefall2d.pages.dev/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>typeof beginRun==='function');
 await page.evaluate(()=>{meta.soundOn=false;meta.flagHintShown=true;openLevelSelect();});assert.equal(await page.$('.lvlbtn[data-i="43"]'),null);
 await page.evaluate(()=>{lvlSelTab='fx';openLevelSelect();});assert.equal(await page.$('.lvlbtn[data-fx="45"]'),null);checks.push('Public Level Select hides both finale rows before forty clears.');
 await page.evaluate(()=>{meta.exploreFinale={cleared:[...BladefallExploreFinale.MAIN]};lvlSelTab=0;openLevelSelect();});assert.ok(await page.$('.lvlbtn[data-i="43"]'));
 await page.evaluate(()=>{lvlSelTab='fx';openLevelSelect();});assert.ok(await page.$('.lvlbtn[data-fx="45"]'));checks.push('Both rows become available after all forty distinct clears.');
 await page.evaluate(()=>{beginRun(0,null,{hp:1,dmg:1},{startStage:40,levelSelect:true});G.actTwo.yielded=true;G.p.x=10200-100;});await page.waitForSelector('#finale-0');assert.match(await page.$eval('#ovcard',x=>x.innerText),/VESPER/);
 await page.click('#finale-0');await page.waitForFunction(()=>!!G.actTwo?.man);assert.equal(await page.evaluate(()=>G.stageIndex),43);assert.equal(await page.evaluate(()=>G.vesperEncounter),true);
 const secretHp=await page.evaluate(()=>G.actTwo.hp);await page.evaluate(()=>{G.actTwo.man.hp-=99999;});await pause(60);assert.equal(await page.evaluate(()=>G.actTwo.hp),secretHp);
 await page.evaluate(()=>{G.p.invuln=0;G.p.dodgeTimer=0;G.p.starT=0;hurtPlayer(999,0,true,99);});await page.waitForSelector('#finale-0');assert.match(await page.$eval('#ovcard',x=>x.innerText),/A VOICE IN THE DARK/);
 await page.click('#finale-0');await page.waitForFunction(()=>!!G.actTwo?.foe);assert.equal(await page.evaluate(()=>G.stageIndex),45);checks.push('Palace exit → first Vesper encounter; ordinary damage cannot clear phase I; actual lethal damage → Final Echo.');
 await page.evaluate(()=>{G.p.x=1510;G.p.face=1;G.actTwo.foe.st='rest';G.actTwo.foe.t=-1;G.actTwo.fight=true;});const before=await page.evaluate(()=>G.actTwo.hp);await page.keyboard.down('KeyW');await pause(80);await page.keyboard.up('KeyW');await pause(220);const after=await page.evaluate(()=>G.actTwo.hp);assert.ok(after<before,JSON.stringify(await page.evaluate(()=>({mode,hp:G.actTwo.hp,p:G.p.x,dead:G.p.dead,weapon:G.p.weapon,atk:G.p.atkCd,enemy:G.actTwo.foe.x,session:G.sessionCapabilities})))) ;checks.push(`Normal keyboard blade contact damages Echo: ${before} → ${after.toFixed(2)} HP.`);
 await page.screenshot({path:out+'/echo-combat.png'});
 // Exercise ordinary retry as well as the story-loss hook.
 await page.evaluate(()=>{G.p.invuln=0;G.p.dodgeTimer=0;hurtPlayer(999,0,true,99);});assert.equal(await page.evaluate(()=>G.stageIndex),45);assert.equal(await page.evaluate(()=>mode),'play');checks.push('A regular Echo death retries its own checkpoint; it does not repeat the story defeat.');
 await pause(100);await page.evaluate(()=>{G.p.x=1510;G.actTwo.fight=true;G.actTwo.hp=1;G.actTwo.foe.hp-=10;});await pause(80);assert.equal(await page.evaluate(()=>G.actTwo.phase),1);
 await page.evaluate(()=>{G.actTwo.hp=1;G.actTwo.foe.hp-=10;});await page.waitForSelector('#finale-1');await page.screenshot({path:out+'/echo-choices.png'});await page.click('#finale-1');assert.equal(await page.evaluate(()=>BladefallExploreFinale.power()),3);await page.click('#finale-0');await pause(100);
 assert.equal(await page.evaluate(()=>G.stageIndex),43);assert.equal(await page.evaluate(()=>G.vesperEncounter),false);await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>typeof continueRun==='function');await page.evaluate(()=>{meta.soundOn=false;continueRun();});assert.equal(await page.evaluate(()=>G.stageIndex),43);assert.equal(await page.evaluate(()=>meta.exploreFinale.choice),'merge');assert.equal(await page.evaluate(()=>BladefallExploreFinale.power()),3);checks.push('Merge returns to the real Vesper fight and survives page reload + Continue.');
 const damage={};for(const choice of ['kill','merge','forget']){
  await page.evaluate(c=>{meta.exploreFinale.choice=c;beginRun(0,null,{hp:1,dmg:1},{startStage:43,levelSelect:true});G.p.x=2920;},choice);await page.waitForFunction(()=>!!G.actTwo?.man);
  await page.evaluate(()=>{const e=G.actTwo.man;G.p.x=e.x-35;G.p.face=1;e.st='stalk';e.t=0;G.actTwo.cool=2;G.p.invuln=2;});const hp=await page.evaluate(()=>G.actTwo.hp);await page.keyboard.down('KeyW');await pause(80);await page.keyboard.up('KeyW');await pause(160);damage[choice]=hp-await page.evaluate(()=>G.actTwo.hp);
 }
 assert.ok(damage.kill>damage.forget&&damage.forget>0,JSON.stringify(damage));assert.ok(damage.merge>damage.kill*8);checks.push('Real blade damage against Vesper respects all three choices: '+JSON.stringify(damage));
 // Move to each legal vulnerability window and fast-forward phase HP to validate the complete ending plumbing.
 await page.evaluate(()=>{meta.exploreFinale.choice='merge';beginRun(0,null,{hp:1,dmg:1},{startStage:43,levelSelect:true});G.p.x=2920;});await page.waitForFunction(()=>!!G.actTwo?.man);
 await page.evaluate(()=>{const c=BladefallCloakedMan.constants;for(let phase=0;phase<4;phase++){
  const A=G.actTwo;A.hp=c.POOLS.slice(phase+1).reduce((a,b)=>a+b,0)+1;const e=phase<2?A.man:phase===2?A.spider.head:A.eyes[0];if(phase===3)A.giant.exposed=10;e.hp=e.hpWas-10;BladefallActTwo.updateFoe(e,G.p,1/60);for(let i=0;i<500;i++){if(mode==='finale')break;G.p.invuln=99;BladefallActTwo.update(1/60);}}
 });await page.waitForSelector('#finale-0');assert.equal(await page.evaluate(()=>meta.gameBeaten),true);assert.equal(await page.evaluate(()=>meta.exploreFinale.vesperDefeated),true);assert.equal(await page.evaluate(()=>meta.run),null);assert.match(await page.$eval('#ovcard',x=>x.innerText),/EXPLORE COMPLETE/);await page.screenshot({path:out+'/explore-complete.png'});checks.push('All four real Vesper phases lead to the chosen ending, completion flags, and cleared Continue slot.');
 assert.deepEqual(errors,[]);await writeFile(out+'/browser.json',JSON.stringify({ok:true,checks,damage,errors,scope:'Browser fixtures accelerate boss HP and palace completion; keyboard blade damage, checkpoint recovery, UI, persistence and stage transitions execute normally.'},null,2)+'\n');console.log(checks.join('\n'));
}finally{await browser.close();}
