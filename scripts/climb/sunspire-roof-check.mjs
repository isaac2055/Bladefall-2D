// Final roof drop: two airborne downward seed strikes, with no walk-out floor.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {Core,expand,keysToInput,runRoom} from '../pcore-tape.mjs';
import {snapshot,restore} from '../pcore-search.mjs';
const source=JSON.parse(readFileSync(new URL('../room-bank/fractured/115-bank-f115.json',import.meta.url))),g=Core.createGame([source.room]);let drop=null,strike=null;const seeds=[],lands=[];
for(const k of expand(source.tape)){Core.step(g,keysToInput(k));assert.equal(g.deaths,0);for(const e of g.events){if(e.type==='portal-pass'&&e.kind==='knight'&&g.p.x>1100&&g.p.y<100&&g.p.vy>=250)drop=snapshot(g);if(!drop)continue;if(e.type==='strike')strike=e;if(e.type==='pogo-loft'){assert.equal(strike?.dir.y,1);seeds.push({frame:g.frame,x:g.p.x,y:g.p.y});}if(e.type==='land')lands.push({frame:g.frame,x:g.p.x,y:g.p.y});}g.events.length=0;}
assert(drop);assert(g.exited);assert.equal(seeds.length,2);assert(seeds[0].x>1120&&seeds[0].x<1170);assert(seeds[1].x>1220&&seeds[1].x<1270);assert(lands.every(p=>p.x>=1330),'no landing shelf between the roof drop and exit');
const idle=restore(drop);let deadline=0;for(;deadline<100&&!idle.deaths;deadline++){Core.step(idle,keysToInput(''));idle.events.length=0;}assert(idle.deaths);
const removals=[];for(const[c,r]of [[142,20],[155,18]]){const map=source.room.map.slice();assert.equal(map[r][c],'b');map[r]=map[r].slice(0,c)+'.'+map[r].slice(c+1);const probe=runRoom([{...source.room,map}],0,source.tape);assert(!probe.exited&&probe.deaths>0);removals.push({c,r,deaths:probe.deaths});}
export const proof={roofDrop:{frame:drop.frame,vy:drop.p.vy},downwardSeedStrikes:seeds,landings:lands,idleDeathAfter:deadline,seedRemovalSensitivity:removals,limits:'Native route and removal sensitivity checks; not an exhaustive search of alternate routes.'};
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify({result:'PASS',...proof}));
