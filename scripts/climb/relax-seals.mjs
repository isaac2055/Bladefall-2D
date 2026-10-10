// Isaac (7.308.1): an entrance seals behind you only when the room needs that wall. The 7.307 import sealed every
// bank room and every room after a new connection. A seal stays only where the room's own route plays differently
// with its entrance open, where the original climb build already sealed that room (7.265.2: its route, side way or
// door needs the wall), or where a retracting entry ledge must withdraw. Run alone it relaxes the saved registry.
import {readFileSync,writeFileSync,renameSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import {Core,keysToInput,expand} from '../pcore-tape.mjs';
const copy=x=>JSON.parse(JSON.stringify(x));
function closed(d){const map=d.map.map(r=>r.split(''));for(const [c,r,ch]of d.seam)map[r][c]=ch;return {...d,map:map.map(r=>r.join(''))};}
function route(def,tape){const g=Core.createGame([def],{room:0});g.dropThru=def.campaignImport?!!def.dropThru:true;g.springUp=!def.campaignImport;
 const fr=expand(tape);let deaths=0;for(let i=0;i<fr.length+60;i++){Core.step(g,keysToInput(fr[i]||''));
  for(const e of g.events){if(e.type==='death')deaths++;if(e.type==='exit'){const p=g.p;return {exit:e.side||e.dir||'exit',frame:i,deaths,snap:JSON.stringify([p.x,+p.remX.toFixed(4),p.y,+p.remY.toFixed(4),+p.vx.toFixed(3),+p.vy.toFixed(3),p.state,p.dashes])};}}g.events.length=0;}return {exit:null,deaths};}
// A doorway must let you walk back out. Where thorns on its inner lip point into the room inside its opening (B22's
// spiked west wall, cut by its entrance tunnel), walking in is safe but walking or jumping back kills. Those thorns become part
// of the doorway: open while it is open, restored with the wall when it seals, so the reviewed puzzle is unchanged.
const AWAY={'>':[1,0],'<':[-1,0],'v':[0,1],'^':[0,-1]};
export function clearDoorways(w){const fixed=[];
 for(const d of w.rooms){if(!d.seam?.length)continue;const grid=d.map.map(r=>r.split('')),inSeam=new Set(d.seam.map(([c,r])=>c+','+r)),add=[];
  const solid=(c,r)=>{const ch=(grid[r]||[])[c];return ch===undefined||'#%TGHNV-'.includes(ch);};
  for(const [c,r] of d.seam){if(grid[r][c]!=='.'&&grid[r][c]!==' ')continue;
   for(const [ch,[dc,dr]] of Object.entries(AWAY)){const sc=c+dc,sr=r+dr;if(grid[sr]?.[sc]!==ch||inSeam.has(sc+','+sr)||add.some(a=>a[0]===sc&&a[1]===sr))continue;
    if(dr===0){// a side doorway: any thorn inside its opening, down to the floor under this doorway column
     let f=r;while(inSeam.has(c+','+(f+1)))f++;if(!solid(c,f+1))continue;}
    else if(!(inSeam.has((c-1)+','+r)||inSeam.has((c+1)+','+r)))continue;   // a floor or ceiling doorway: directly in its width
    add.push([sc,sr,ch]);}}
  if(!add.length)continue;
  // the whole doorway height is cleared on that lip, not only the two floor rows
  for(const a of [...add])if(a[2]==='>'||a[2]==='<'){for(const [c,r] of d.seam){if(c!==a[0]-AWAY[a[2]][0])continue;const ch=grid[r][a[0]];if(ch===a[2]&&!add.some(b=>b[0]===a[0]&&b[1]===r))add.push([a[0],r,ch]);}}
  for(const [c,r,ch] of add){grid[r][c]='.';d.seam.push([c,r,ch]);}d.map=grid.map(r=>r.join(''));fixed.push(d.id+':'+add.length);}
 return fixed;}
// Mutates world w; `source` is its pre-integration world (for the original 7.265 seals). Returns the ids kept sealed.
export function relaxSeals(w,source){const kept=[],opened=[],doorways=clearDoorways(w);
 for(const d of w.rooms){if(!d.closeWhilePlayed||!d.seam?.length)continue;
  const native=!d.campaignImport&&source?.rooms.find(r=>r.id===d.id);
  if(d.entryBridge||native?.closeWhilePlayed){kept.push(d.id);continue;}
  const tape=w.tapes[d.id];if(!tape){kept.push(d.id);continue;}
  const a=route(closed(d),tape),b=route(d,tape);
  // Identical exit (frame and state), so every saved join proof into the next room stays exact.
  if(a.exit&&b.exit===a.exit&&!a.deaths&&!b.deaths&&a.frame===b.frame&&a.snap===b.snap){delete d.closeWhilePlayed;opened.push(d.id);}else kept.push(d.id);}
 w.bankIntegration={...w.bankIntegration,sealedEntrances:kept,clearedDoorways:[...(w.bankIntegration?.clearedDoorways||[]),...doorways]};return {kept,opened,doorways};}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const dest='public/bladefall-climb-worlds.js',text=readFileSync(dest,'utf8'),head=text.slice(0,text.indexOf('CL.addWorld(')),tail=text.slice(text.lastIndexOf('\n})(typeof window'));
 const worlds=[];vm.runInNewContext(text,{BladefallClimb:{addWorld:w=>worlds.push(w)}});
 const source=JSON.parse(readFileSync('scripts/climb/source-worlds-7.303.json','utf8'));let k=0,o=0;
 const fixed=[];for(const w of worlds){const r=relaxSeals(w,source.find(s=>s.n===w.n));k+=r.kept.length;o+=r.opened.length;fixed.push(...r.doorways.map(x=>w.n+':'+x));}console.log('doorways cleared:',fixed.join(' ')||'none');
 const out=head+worlds.map(w=>`CL.addWorld(${JSON.stringify(w)});`).join('\n')+tail;
 if(process.argv.includes('--check')){if(out!==text)throw Error('Seals not relaxed: run node scripts/climb/relax-seals.mjs');}
 else{writeFileSync(dest+'.tmp',out);renameSync(dest+'.tmp',dest);}
 console.log(`entrances kept sealed: ${k}; opened: ${o}`);
}
