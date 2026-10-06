// Room by Room: a small map builder for authoring rooms as rectangles instead of hand-typed rows.
//   const m=grid(); m.rect(0,18,39,22,'#'); m.put(3,17,'P'); m.rows() -> ['####…', …]
export function grid(cols=40,rows=23,fill='.'){
 const g=Array.from({length:rows},()=>Array(cols).fill(fill));
 const api={cols,rows,
  rect(c0,r0,c1,r1,ch){for(let r=Math.max(0,r0);r<=Math.min(rows-1,r1);r++)for(let c=Math.max(0,c0);c<=Math.min(cols-1,c1);c++)g[r][c]=ch;return api;},
  put(c,r,ch){if(r>=0&&r<rows&&c>=0&&c<cols)g[r][c]=ch;return api;},
  frame(ch='#'){api.rect(0,0,cols-1,0,ch);api.rect(0,rows-1,cols-1,rows-1,ch);api.rect(0,0,0,rows-1,ch);api.rect(cols-1,0,cols-1,rows-1,ch);return api;},
  rows(){return g.map(r=>r.join(''));},
  print(){console.log(api.rows().map((r,i)=>String(i).padStart(2)+' '+r).join('\n'));return api;},
 };
 return api;
}
