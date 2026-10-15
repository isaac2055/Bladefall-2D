// Native evidence for Sunspire's loop launch and carrier deadline.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {Core,expand,keysToInput} from '../pcore-tape.mjs';
import {snapshot,restore} from '../pcore-search.mjs';
const source=JSON.parse(readFileSync(new URL('../room-bank/fractured/115-bank-f115.json',import.meta.url)));
const g=Core.createGame([source.room]);let loop=null,board=null,depart=null,refill=null,returnSeed=null,carrierSave=null;
for(const k of expand(source.tape)){
 Core.step(g,keysToInput(k));assert.equal(g.deaths,0);
 for(const e of g.events){if(e.type==='pogo-loft'&&g.p.x>1080&&g.p.x<1120&&g.p.y>490&&g.p.y<530)returnSeed={frame:g.frame,x:g.p.x,y:g.p.y};if(e.type==='core-checkpoint'&&e.index===3)carrierSave=g.frame;if(e.type==='portal-pass'&&e.kind==='knight'&&g.p.x>=1008&&g.p.x<=1040&&g.p.y>800&&g.p.y<900){assert(g.p.vy<=-300);loop={frame:g.frame,vy:g.p.vy};}if(e.type==='refill'&&g.p.y>530&&g.p.y<575&&g.p.x>1100&&g.p.x<1150)refill={frame:g.frame,x:g.p.x,y:g.p.y};}
 const lift=g.ents.find(e=>e.type==='zip'),riding=g.p.onGround&&Math.abs(g.p.y+g.p.h-lift.y)<1&&g.p.x+g.p.w>lift.x&&g.p.x<lift.x+lift.w;
 if(!board&&riding)board=snapshot(g);else if(board&&!depart&&!riding)depart=g.frame;
 g.events.length=0;
}
assert(loop);assert(board);assert(depart);assert(refill);assert(returnSeed);assert(carrierSave);assert(refill.frame<returnSeed.frame&&returnSeed.frame<carrierSave);
const idle=restore(board);let deadline=null;
for(let n=1;n<=150;n++){Core.step(idle,keysToInput(''));if(idle.deaths){assert(idle.events.some(e=>e.type==='death'&&e.cause==='spikes'));deadline=n;break;}idle.events.length=0;}
assert(deadline&&deadline<60,'idle rider must meet the authored ceiling before the endpoint');assert(depart-board.frame<deadline,'proved departure precedes the idle death');
const fresh=Core.createGame([source.room]);fresh.coreRun.index=1;Core.resetRoom(fresh);fresh.p.state='normal';fresh.p.respawnTimer=0;let freshFrames=0;
for(const k of expand(source.verification.partTapes[2])){Core.step(fresh,keysToInput(k));freshFrames++;assert.equal(fresh.deaths,0);fresh.events.length=0;if(fresh.coreRun.index>=2)break;}assert.equal(fresh.coreRun.index,2);
const restart=Core.createGame([source.room]);restart.coreRun.index=2;Core.resetRoom(restart);restart.p.state='normal';restart.p.respawnTimer=0;let carrierRestartFrames=0;
for(const k of expand(source.verification.partTapes[3])){Core.step(restart,keysToInput(k));carrierRestartFrames++;assert.equal(restart.deaths,0);restart.events.length=0;if(restart.coreRun.index>=3)break;}assert.equal(restart.coreRun.index,3);
export const proof={loopLaunch:loop,freshLoopFrames:freshFrames,carrier:{board:board.frame,departure:depart,idleDeathAfter:deadline},refill,returnSeed,carrierSave,carrierRestartFrames,limits:'Native loop/carrier routes and idle-rider probe; no human difficulty or exhaustive bypass claim.'};
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify({result:'PASS',...proof}));
