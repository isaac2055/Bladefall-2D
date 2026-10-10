// Quiet vertical roads for continuous bank imports. Visible one-way stairs make
// tall climbs ordinary repeated jumps, without stamina or movement-tech demands.
import {Core,runTape,EXTRA_TAPES} from './seam-tools.mjs';
let serial=0;
export function connectorVertical(from,H,palette,down=false){
 if(!['left','right'].includes(from)||!Number.isInteger(H)||H<8)return null;
 const C=8,enterLeft=from==='right',g=Array.from({length:H},()=>Array(C).fill('#'));
 for(let r=down?1:0;r<(down?H:H-1);r++)for(let c=2;c<=5;c++)g[r][c]='.';
 const mouth=down?1:H-4;
 for(let r=mouth;r<mouth+3;r++)for(let c=enterLeft?0:2;c<(enterLeft?6:C);c++)g[r][c]='.';
 const spawnRow=down?3:H-2;g[spawnRow][enterLeft?1:6]='P';
 if(!down)for(let r=H-4;r>=1;r-=3)for(let c=2;c<=5;c++)g[r][c]='=';
 const id=`bank-vertical-${++serial}`,def={id,name:'The Connecting Road',connector:true,cols:C,rows:H,map:g.map(r=>r.join('')),exit:down?'down':'up',palette};
 // Core is imported explicitly alongside its native runner: this module does
 // not emulate the climb, move the player, or synthesize a completion event.
 if(Core.TILE!==8)throw Error('Update connector tile geometry for the current Core');
 const tape=[[12,enterLeft?'r':'l'],...(down?[[H*8,'']]:Array.from({length:Math.ceil(H/3)+2},()=>[[20,'j'],[18,'']]).flat())];
 const result=runTape(def,tape);
 if(!result.exit||result.exit.side||result.deaths)return null;
 EXTRA_TAPES[id]=tape;return def;
}

// An upper corridor separates the descent from an earlier tall shaft. This is
// useful for a room whose fire is inset from the left edge and whose exit returns
// left: dropping immediately beside the old shaft would obstruct that exit.
export function connectorOffsetDrop(from,H,palette,width=24){
 if(!['left','right'].includes(from)||!Number.isInteger(H)||H<8||!Number.isInteger(width)||width<16)return null;
 const right=from==='right',C=width,shaft=right?C-6:2,g=Array.from({length:H},()=>Array(C).fill('#'));
 for(let r=1;r<H;r++)for(let c=shaft;c<shaft+4;c++)g[r][c]='.';
 for(let r=1;r<=3;r++)for(let c=right?0:shaft;c<(right?shaft+4:C);c++)g[r][c]='.';
 const spawn=right?1:C-2;g[3][spawn]='P';
 const id=`bank-offset-drop-${++serial}`,def={id,name:'The Connecting Road',connector:true,cols:C,rows:H,map:g.map(r=>r.join('')),exit:'down',palette};
 const walk=Math.ceil(Math.abs((shaft+1.5-spawn)*8)/1.5),tape=[[walk,right?'r':'l'],[H*8,'']],result=runTape(def,tape);
 if(!result.exit||result.exit.side||result.deaths)return null;
 EXTRA_TAPES[id]=tape;return def;
}

// The narrow lower leg of a dogleg descent. Its small landing is a real fire
// footing; stepping to the right drops through the open half of the shaft.
export function connectorDropShaft(H,palette){
 if(!Number.isInteger(H)||H<8)return null;
 const C=6,g=Array.from({length:H},()=>Array(C).fill('#'));
 for(let r=0;r<H;r++)for(let c=1;c<=4;c++)g[r][c]='.';
 g[2][2]='P';g[3][1]='=';g[3][2]='=';
 const id=`bank-drop-shaft-${++serial}`,def={id,name:'The Connecting Road',connector:true,cols:C,rows:H,map:g.map(r=>r.join('')),exit:'down',palette};
 const tape=[[12,'r'],[H*8,'']],result=runTape(def,tape);
 if(!result.exit||result.exit.side||result.deaths)return null;
 EXTRA_TAPES[id]=tape;return def;
}
