/* The Emerald Ascent as a map you read (7.280): the approved nested diamonds (LLM-HANDOFF/emerald-ascent-map.html),
   one node per region, for BOTH emeralds. Sunspire Palace, and the Fractured Palace below it, are flank territories.
   It draws the atlas (open roads, visited regions, solved rooms) and never changes it.

   - mount(host,{atlas,current}) draws the map into host: zoom (wheel, pinch, + / −), pan (drag), fit all, frame
     either emerald, find me; tap a region for its roads, which are open, and what opens a sealed one.
   - describeSocket(junction,socket,atlas) says where a junction mouth goes and whether it is open; the passage art
     writes it on the mouth's sign and the view says it when the knight walks into a sealed mouth.
   - mouths(n,atlas) lists a region's mouths: which junction, which wall, which tier, where each goes. */
(function(root){
'use strict';
const AT=()=>root.BladefallClimbAtlas,CL=()=>root.BladefallClimb,PS=()=>root.BladefallClimbPassages;
const SX=160,SY=100,NW=152,NH=60,TIP=[0,8.65],FLIP=17.3;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nameOf=n=>CL()?.world?.(n)?.name||PS()?.names?.[n]||('Region '+n);
const worldOf=n=>CL()?.world?.(n)||null;
const defIn=(n,id)=>worldOf(n)?.rooms.find(d=>d.id===id)||null;
const atlasNow=()=>root.BladefallPitchView?.climb?.state?.()?.atlas||null;

/* ---------------------------------------------------------------- what a mouth leads to */
function finished(n,atlas){const w=worldOf(n);return !!(atlas&&w&&(atlas.complete?atlas.complete(n):atlas.state.solved[w.atlasEnd||w.sections.at(-1)?.room]));}
// Where a region's own start is reached from (its incoming roads), so a sealed road can say how to get round to it.
function approaches(n){return AT().links.filter(l=>l.kind==='road'&&l.b===n).map(l=>nameOf(l.a));}
function reason(link,atlas,long=false){
 const l=typeof link==='string'?AT().links.find(x=>x.id===link):link;if(!l)return '';
 const need=(l.kind==='road'?[l.a]:[l.a,l.b]).filter(n=>!finished(n,atlas));
 if(!need.length)return 'opens on your next visit';
 let text='finish '+need.map(nameOf).join(' and ');
 if(long){const via=need.map(n=>{const from=approaches(n);return from.length?`${nameOf(n)} begins from ${from.join(' or ')}`:'';}).filter(Boolean);if(via.length)text+=' ('+via.join('; ')+')';}
 return text;
}
function regionOfDef(def){return def.atlasRegion??CL()?.worlds?.find(w=>w.rooms.includes(def))?.n;}
function placeOf(dest,dd){return !dd?'start':dd.atlasGate?'postern':String(dest).endsWith('-atlas-crossroads')?'end':'start';}
const placeWords={start:'start of its climb',end:'end of its climb',postern:'postern over its road'};
function describeSocket(def,s,atlas){
 if(!def||!s||!s.link)return null;
 atlas=atlas||atlasNow();
 const l=AT().links.find(x=>x.id===s.link);if(!l)return null;
 const region=regionOfDef(def),to=l.a===region?l.b:l.a;
 let dest=null;try{dest=atlas?.endpoint?.(l.id,to)||null;}catch(e){}
 const dd=dest&&defIn(to,dest),place=placeOf(dest,dd),open=!atlas||!!atlas.state.open[l.id];
 return {link:l.id,kind:l.kind,to,toName:nameOf(to),place,placeName:dd?.name||'',where:placeWords[place]+(dd?.name?' · '+dd.name:''),
  open,reason:open?null:reason(l,atlas),reasonLong:open?null:reason(l,atlas,true),passage:PS()?.designs?.[l.id]?.[0]||''};
}
const roleOf=d=>d.atlasGate?'postern':d.id.endsWith('-atlas-arrival')?'arrival':'end';
const roleWords={arrival:'where you arrive, before the climb',end:'at the end of the climb',postern:'a postern over the road'};
function mouths(n,atlas){
 const w=worldOf(n);if(!w)return [];atlas=atlas||atlasNow();
 const order={arrival:0,postern:1,end:2},out=[];
 for(const d of w.rooms.filter(d=>d.atlasJunction).sort((a,b)=>order[roleOf(a)]-order[roleOf(b)])){
  const socks=(d.atlasSockets||[]).filter(s=>s.link&&!s.preview);
  for(const s of socks){
   const same=socks.filter(p=>p.edge===s.edge).sort((a,b)=>a.floor-b.floor),i=same.indexOf(s);
   const tier=same.length<2?'':(same.length===2?['upper','lower']:['upper','middle','lower','lowest','last'])[i]||'';
   const info=describeSocket(d,s,atlas);if(info)out.push({junction:d.name,junctionId:d.id,role:roleOf(d),edge:s.edge,tier,...info});
  }
 }
 return out;
}
function progress(n,atlas,room){
 const w=worldOf(n);if(!w)return null;
 const def=id=>w.rooms.find(d=>d.id===id);
 const main=w.sections.filter(s=>!def(s.room)?.connector).map(s=>s.room);
 const solved=main.filter(r=>atlas?.state.solved[r]).length;
 let at=null;
 if(room){
  const i=main.indexOf(room),d=def(room);
  if(i>=0)at={kind:'section',i:i+1,name:d?.name||''};
  else if(d?.atlasGate)at={kind:'postern',name:d.name};
  else if(d?.id.endsWith('-atlas-arrival'))at={kind:'arrival',name:d.name};
  else if(d?.id.endsWith('-atlas-crossroads'))at={kind:'end',name:d.name};
  else{const q=[...w.quests,...(w.secrets||[])].find(q=>q.sections.some(s=>s.room===room));if(q)at={kind:'branch',name:q.title||'a side way'};}
 }
 return {total:main.length,solved,cleared:finished(n,atlas),at};
}

/* ---------------------------------------------------------------- the drawing */
// Map units: the approved coordinates (x right, y down) times SX/SY. The Fractured emerald is the base one turned
// over (y' = 17.3 − y), so its top tip is the Path to the Palace's point; the Fractured Path stands to its right.
const FACETS=[[[15,13,9],.07],[[15,9,14],.045],[[13,16,8,9],.04],[[14,9,7,20],.075],[[16,17,4,8],.08],[[17,18,2,4],.04],
 [[18,19,1,2],.09],[[20,19,1,3],.045],[[1,2,4,6,5,3],.045],[[6,8,9,7],.09],[[9,10,15,12],.04]];
const OUTER=[15,13,16,17,18,19,[1.9,7.1],[2.65,4.8],[2.1,2.5],14];
const PALACE={
 20:{outer:[[1.45,.6],[2.1,2.5],[2.65,4.8],[1.9,7.1],[0,8.65]],inner:[[1.45,.6],[1.62,2.58],[2.18,4.8],[1.48,6.92],[.35,8.02],[0,8.65]],
  via:{14:[[1.97,2.45]],19:[[1.69,7.01]]},caption:'Sunspire Palace · the whole right flank'},
 40:{outer:[[1.45,16.7],[2.1,14.8],[2.65,12.5],[2.5,10.3],[1.9,8.9]],inner:[[1.45,16.7],[1.62,14.72],[2.18,12.5],[2.08,10.55],[1.72,9.4],[1.9,8.9]],
  via:{34:[[1.97,14.85]],39:[[2.36,10.2]]},caption:'The Fractured Palace · its right flank'}};
// (38–39 crosses the gap between the emeralds above the Fractured Outskirts, under the Path to the Palace)
const VIA={'38-39':[[-.95,9.27],[.95,9.27]]};
const COLORS={1:'#b8b287',2:'#749881',3:'#b98b73',4:'#c0ae83',5:'#b29370',6:'#9b91bd',7:'#78999e',8:'#a4cbd8',9:'#c5e4ec',10:'#c97a52',
 11:'#b98a5a',12:'#9f92d8',13:'#8a73b8',14:'#6f93b8',15:'#b0905a',16:'#8aa0b8',17:'#c8bc8a',18:'#b08a68',19:'#d8c89a',20:'#e6c070'};
function mix(a,b,t){const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),x=p(a),y=p(b);return '#'+x.map((v,i)=>Math.round(v+(y[i]-v)*t).toString(16).padStart(2,'0')).join('');}
const colorOf=n=>n>20?mix(COLORS[n-20]||'#8a8f9a','#9a7be0',.45):COLORS[n]||'#8a8f9a';
function pos(n){const p=AT().positions[n];return p?[p[0]*SX,p[1]*SY]:null;}
const at=([x,y])=>[x*SX,y*SY];
const flipPt=([x,y])=>[x,FLIP-y];
// a facet corner: a region number (the Fractured twin is n+20; the twin of 19 is the shared tip) or a literal point
function corner(v,fr){if(Array.isArray(v))return at(fr?flipPt(v):v);if(!fr)return pos(v);return v===19?at(TIP):pos(v+20);}
const baseOf=n=>n>20?n-20:n;
function groupOf(l){
 if(l.kind==='crossing')return 'crossing';
 if((l.a>20)!==(l.b>20))return 'descent';
 const a=baseOf(l.a),b=baseOf(l.b);
 if(a<=9&&b<=9)return 'inner';
 return 'outer';
}
function routeOf(l){
 const a=pos(l.a),b=pos(l.b);if(!a||!b)return null;
 for(const [p,q] of [[l.a,l.b],[l.b,l.a]]){
  const t=PALACE[p];if(!t)continue;
  if(t.via[q]){const pts=[pos(p),...t.via[q].map(at),pos(q)];return p===l.a?pts:pts.reverse();}
  if(l.kind==='crossing'){const port=palacePort(p,q);return p===l.a?[port,pos(q)]:[pos(q),port];}
 }
 if(VIA[l.id])return [a,...VIA[l.id].map(at),b];
 return [a,b];
}
function palacePort(p,q){
 const t=PALACE[p],y=AT().positions[q][1],inner=t.inner;
 for(let i=1;i<inner.length;i++){const [x0,y0]=inner[i-1],[x1,y1]=inner[i];if((y>=y0&&y<=y1)||(y<=y0&&y>=y1)){const k=(y-y0)/((y1-y0)||1);return at([x0+(x1-x0)*k,y]);}}
 return pos(p);
}
function midOf(pts){
 let total=0;const seg=[];for(let i=1;i<pts.length;i++){const d=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);seg.push(d);total+=d;}
 let half=total/2;for(let i=0;i<seg.length;i++){if(half<=seg[i]){const k=half/(seg[i]||1);return [pts[i][0]+(pts[i+1][0]-pts[i][0])*k,pts[i][1]+(pts[i+1][1]-pts[i][1])*k];}half-=seg[i];}
 return pts[0];
}
function along(pts,t){
 let total=0;const seg=[];for(let i=1;i<pts.length;i++){const d=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);seg.push(d);total+=d;}
 let left=Math.max(0,Math.min(1,t))*total;for(let i=0;i<seg.length;i++){if(left<=seg[i]){const k=left/(seg[i]||1);return [pts[i][0]+(pts[i+1][0]-pts[i][0])*k,pts[i][1]+(pts[i+1][1]-pts[i][1])*k];}left-=seg[i];}
 return pts.at(-1);
}
function wrap(name,max=15){
 const words=String(name).split(' '),lines=[''];
 for(const w of words){const cur=lines.at(-1);if(!cur)lines[lines.length-1]=w;else if((cur+' '+w).length<=max)lines[lines.length-1]=cur+' '+w;else lines.push(w);}
 if(lines.length>2)return [lines[0],lines.slice(1).join(' ')];
 return lines;
}
const gem=`${-NW/2},0 ${-NW/2+17},${-NH/2} ${NW/2-17},${-NH/2} ${NW/2},0 ${NW/2-17},${NH/2} ${-NW/2+17},${NH/2}`;
const lockGlyph='<rect x="-5" y="-1" width="10" height="8" rx="1.5"/><path d="M-3,-1v-3a3,3 0 0 1 6,0v3" fill="none"/>';

const CSS=`
.cm-wrap{position:relative;margin:8px 0 4px}
.cm-view{position:relative;height:clamp(240px,68vh,720px);background:radial-gradient(ellipse at 50% 35%,#132019 0%,#0b1016 60%,#090c11 100%);border:1px solid #2c3340;overflow:hidden;overflow:clip;touch-action:none;cursor:grab;user-select:none;-webkit-user-select:none}
.cm-view.cm-drag{cursor:grabbing}
.cm-view svg{position:absolute;left:0;top:0;width:100%;height:100%;display:block}
@media (max-height:520px){.cm-view{height:calc(100vh - 150px);min-height:200px}}
.cm-tools{display:flex;flex-wrap:wrap;gap:4px;margin:0 0 4px}
.cm-zoom>*{pointer-events:auto}
.cm-chipbar{position:absolute;left:6px;top:6px;max-width:min(calc(100% - 64px),420px);background:#0d1218e6;border:1px solid #3a4252;color:#efe6cf;font-size:12px;padding:4px 8px;z-index:1;cursor:pointer;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-sizing:border-box}
@media (max-width:620px),(max-height:520px){.cm-chipbar{max-width:min(calc(100% - 64px),260px);font-size:11px}.cm-chipbar small{font-size:10.5px}}
.cm-card.cm-short{padding:8px 12px!important}.cm-card.cm-short>h1{font-size:15px!important;margin:0 0 2px!important}.cm-card.cm-short>h1+.pcSub{display:none}
@media (max-width:520px){.cm-tools .cm-b[data-cm]:not(select){flex:1 1 auto;padding:6px 6px!important;font-size:13px!important}}
.cm-chipbar b{color:#f0d9a8}.cm-chipbar small{color:#aab0bd;font-size:11px}
.cm-wrap button.cm-b,.cm-wrap select.cm-b{background:#161c26e6;color:#e3dac4;border:1px solid #3a4252;font:inherit;font-size:12px;padding:5px 9px;min-height:30px;cursor:pointer;border-radius:0}
.cm-wrap button.cm-b:hover{background:#222a37}
.cm-wrap select.cm-b{max-width:100%;flex:1 1 180px}
.cm-zoom{position:absolute;right:6px;top:6px;display:flex;flex-direction:column;gap:4px;z-index:1}
.cm-zoom .cm-b{width:38px;font-size:18px!important;line-height:1;padding:4px 0!important}
html.pcTouch .cm-wrap button.cm-b,html.pcTouch .cm-wrap select.cm-b{min-height:40px;font-size:14px;padding:6px 10px}
html.pcTouch .cm-zoom .cm-b{width:44px;min-height:44px}
.cm-legend{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:11.5px;color:#aab0bd;margin:6px 0 2px}
.cm-legend span{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
.cm-detail{margin:8px 0 6px;font-size:13px;line-height:1.5;color:#d8d0bb;min-height:3.5em}
.cm-detail h2{margin:0 0 2px;font-size:15px;color:#f0d9a8;font-weight:600;letter-spacing:.03em}
.cm-detail .cm-chip{display:inline-block;font-size:11px;padding:1px 6px;margin-left:6px;border:1px solid #4a5364;color:#cfd6e2;vertical-align:2px}
.cm-detail .cm-chip.here{border-color:#e7c873;color:#ffe9a8}.cm-detail .cm-chip.done{border-color:#c9a86a;color:#e7c873}.cm-detail .cm-chip.next{border-color:#5fbf86;color:#8ff0b3}
.cm-detail ul{list-style:none;padding:0;margin:6px 0 0}
.cm-detail li{padding:5px 0 5px;border-top:1px solid #232a35}
.cm-detail small{color:#9aa3b2;font-size:12px}
.cm-detail h3{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#c9a86a;margin:10px 0 2px;font-weight:600}
.cm-open{color:#86e3aa}.cm-sealed{color:#e8a487}
.cm-svg text{font-family:ui-monospace,Menlo,Consolas,monospace;pointer-events:none}
.cm-svg .cm-name,.cm-svg .cm-numN,.cm-svg .cm-near{display:none}
.cm-svg.lod-near .cm-name,.cm-svg.lod-near .cm-numN,.cm-svg.lod-near .cm-near{display:inline}
.cm-svg.lod-near .cm-numF{display:none}
.cm-svg .cm-close{display:none}.cm-svg.lod-close .cm-close{display:inline}
.cm-svg .cm-node{cursor:pointer}
.cm-svg .cm-pulse{transform-box:fill-box;transform-origin:center;animation:cmPulse 1.6s ease-out infinite}
@keyframes cmPulse{0%{opacity:.75;transform:scale(.6)}100%{opacity:0;transform:scale(1.25)}}
`;
function injectCss(){if(typeof document==='undefined'||document.getElementById('cm-css'))return;const s=document.createElement('style');s.id='cm-css';s.textContent=CSS;document.head.appendChild(s);}

function buildSvg(model){
 const {atlas,here,selected,regions}=model,P=[];
 const facet=(pts,color,op)=>`<polygon points="${pts.map(p=>p.join(',')).join(' ')}" fill="${color}" fill-opacity="${op}"/>`;
 // the two emeralds' facets: green above, violet below
 for(const fr of [false,true]){
  const color=fr?'#9a7be0':'#49c27a';
  if(regions.some(n=>fr?n>20:n<=20)){
   P.push(facet(OUTER.map(v=>corner(v,fr)),color,.035));
   for(const [ids,op] of FACETS)P.push(facet(ids.map(v=>corner(v,fr)),color,op));
  }
 }
 // the palace territories: one region each, the whole right flank
 for(const [n,t] of Object.entries(PALACE)){
  if(!pos(+n))continue;
  const pts=[...t.outer,...t.inner.slice(1,-1).reverse()].map(at),sel=+n===selected;
  const color=+n>20?'#9a7be0':'#49c27a';
  P.push(`<polygon points="${pts.map(p=>p.join(',')).join(' ')}" fill="${color}" fill-opacity="${sel?.2:.11}" stroke="${color}" stroke-opacity=".6" stroke-width="1.6"/>`);
  const c=pos(+n);P.push(`<text class="cm-near" x="${c[0]+18}" y="${c[1]+NH/2+22}" text-anchor="middle" font-size="12" fill="#9fb6a8" fill-opacity=".85">${esc(t.caption)}</text>`);
 }
 P.push(`<text x="0" y="${-0.62*SY}" text-anchor="middle" font-size="22" letter-spacing="6" fill="#7fbf95" fill-opacity=".45">THE EMERALD ASCENT</text>`);
 if(regions.some(n=>n>20))P.push(`<text x="0" y="${(FLIP+.62)*SY+8}" text-anchor="middle" font-size="22" letter-spacing="6" fill="#ab95e6" fill-opacity=".5">THE FRACTURED EMERALD</text>`);
 // links: open roads solid, open crossings dashed, sealed ones grey with a lock
 const style={inner:['#efe4c2','#4b5262'],outer:['#6fd39a','#3d5a4b'],descent:['#f0cf7a','#5e5644'],crossing:['#b99cff','#4c4466']};
 const labels=[];
 for(const l of AT().links){
  const pts=routeOf(l);if(!pts)continue;
  const open=!!atlas.state.open[l.id],g=groupOf(l),[on,off]=style[g],sel=l.a===selected||l.b===selected,mine=here?.link===l.id;
  const d=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join('');
  const dash=open?(g==='crossing'?'9 6':'none'):(g==='crossing'?'2 6':'4 7');
  const seen=[l.a,l.b].some(n=>atlas.state.visited[n]||model.info[n]?.next);
  P.push(`<path d="${d}" fill="none" stroke="${open?on:off}" stroke-width="${(open?3:2)+(sel||mine?1.6:0)}" stroke-opacity="${open?(sel||mine?1:.82):(sel?.95:seen?.7:.4)}" stroke-dasharray="${dash}" stroke-linecap="round"/>`);
  const [mx,my]=midOf(pts);
  const known=[l.a,l.b].some(n=>atlas.state.visited[n]||model.info[n]?.next);
  if(!open&&known)P.push(`<g transform="translate(${mx.toFixed(1)},${my.toFixed(1)}) scale(1.25)" fill="${sel?'#e8a487':'#8d8571'}" stroke="${sel?'#e8a487':'#8d8571'}" stroke-width="1.3">${lockGlyph}</g>`);
  if(sel){const [ax,ay]=pts[0],[bx,by]=pts.at(-1),len=Math.hypot(bx-ax,by-ay)||1;let nx=-(by-ay)/len,ny=(bx-ax)/len;if(ny<0){nx=-nx;ny=-ny;}const ox=mx+nx*16,oy=my+ny*16+4;
   labels.push(`<text class="cm-close" x="${ox.toFixed(1)}" y="${oy.toFixed(1)}" text-anchor="${Math.abs(nx)>.5?(nx>0?'start':'end'):'middle'}" font-size="10.5" fill="${open?'#bfe9cf':'#f0b9a2'}" stroke="#0b1016" stroke-width="3.5" paint-order="stroke">${esc(PS()?.designs?.[l.id]?.[0]||'')}</text>`);}
 }
 // Sunspire's three entrances on its inner edge (and any the Fractured Palace gains)
 for(const l of AT().links)if(l.kind==='crossing')for(const p of [l.a,l.b])if(PALACE[p]&&!PALACE[p].via[p===l.a?l.b:l.a]){const [x,y]=palacePort(p,p===l.a?l.b:l.a);P.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="#b99cff"/>`);}
 P.push(...labels);
 // regions
 for(const n of regions){
  const c=pos(n),info=model.info[n],w=worldOf(n);if(!c)continue;
  const visited=!!atlas.state.visited[n],current=here?.world===n&&!here.link,next=info.next,cleared=info.progress?.cleared,sel=n===selected;
  const base=colorOf(n),fill=visited?mix(base,'#10151c',.58):'#1a2029',stroke=current?'#fff1b3':sel?'#a9d4ff':cleared?'#e7c873':next?'#6fe0a0':visited?mix(base,'#ffffff',.15):'#3f4757';
  const text=visited||next||current?'#efe6cf':'#8f97a5',name=wrap(w?.name||nameOf(n));
  const g=[`<g class="cm-node" data-n="${n}" transform="translate(${c[0].toFixed(1)},${c[1].toFixed(1)})">`];
  if(current)g.push(`<circle class="cm-pulse" r="${NW*.55}" fill="none" stroke="#ffe08a" stroke-width="4"/>`);
  if(next&&!current)g.push(`<polygon points="${gem}" fill="none" stroke="#6fe0a0" stroke-opacity=".35" stroke-width="9"/>`);
  g.push(`<polygon points="${gem}" fill="${fill}" stroke="${stroke}" stroke-width="${current?3.4:sel?3:cleared||next?2.4:1.6}"${!visited&&!next&&!current?' stroke-dasharray="5 4"':''}/>`);
  // far: the number alone, large; near: number, name, progress
  g.push(`<text class="cm-numF" y="10" text-anchor="middle" font-size="28" font-weight="700" fill="${text}">${n}</text>`);
  g.push(`<text class="cm-numN" y="${name.length>1?-13:-8}" text-anchor="middle" font-size="12.5" font-weight="700" fill="${cleared?'#e7c873':text}" fill-opacity=".9">${n}${cleared?' ✓':''}</text>`);
  name.forEach((line,i)=>g.push(`<text class="cm-name" y="${(name.length>1?3:9)+i*14}" text-anchor="middle" font-size="13.5" fill="${text}">${esc(line)}</text>`));
  const pr=info.progress;
  if(pr&&pr.total&&(visited||current)){const wbar=84,done=pr.solved/pr.total;g.push(`<g class="cm-near"><rect x="${-wbar/2}" y="${NH/2-8}" width="${wbar}" height="3" fill="#2b323e"/><rect x="${-wbar/2}" y="${NH/2-8}" width="${(wbar*done).toFixed(1)}" height="3" fill="${cleared?'#e7c873':'#7fd3a0'}"/></g>`);}
  if(current){
   g.push(`<g transform="translate(0,${-NH/2-16})"><path d="M0,9L-8,-3L0,-11L8,-3Z" fill="#ffd36b" stroke="#fff3c4" stroke-width="1.5"/></g>`);
   const at=pr?.at,where=at?.kind==='section'?`section ${at.i} of ${pr.total}`:at?.kind==='arrival'?'at its arrival':at?.kind==='end'?'at its end':at?.kind==='postern'?'at a postern':at?.kind==='branch'?'on a side way':'';
   g.push(`<text class="cm-near" y="${-NH/2-30}" text-anchor="middle" font-size="12" font-weight="700" fill="#ffe9a8" stroke="#0b1016" stroke-width="4" paint-order="stroke">YOU</text>`);void where;
   g.push(`<text class="cm-numF" y="${-NH/2-30}" text-anchor="middle" font-size="22" font-weight="700" fill="#ffe9a8" stroke="#0b1016" stroke-width="5" paint-order="stroke">YOU</text>`);
  }
  g.push('</g>');P.push(g.join(''));
 }
 // the knight inside a passage: a pin on that road
 if(here?.link){
  const l=AT().links.find(x=>x.id===here.link),pts=l&&routeOf(l);
  if(pts){const [x,y]=along(pts,here.t??.5);P.push(`<g transform="translate(${x.toFixed(1)},${y.toFixed(1)})"><circle class="cm-pulse" r="30" fill="none" stroke="#ffe08a" stroke-width="4"/><circle r="9" fill="#ffd36b" stroke="#fff3c4" stroke-width="2.5"/><text y="-18" text-anchor="middle" font-size="13" font-weight="700" fill="#ffe9a8" stroke="#0b1016" stroke-width="4" paint-order="stroke">YOU · ${esc(PS()?.designs?.[l.id]?.[0]||'')}</text></g>`);}
 }
 return P.join('');
}

/* ---------------------------------------------------------------- mount: the map, its controls and the region card */
function mount(host,opts={}){
 injectCss();
 const atlas=opts.atlas||atlasNow();if(!host||!atlas)return null;
 const cardEl=host.closest?.('.pcCard');if(cardEl){cardEl.classList.add('cm-card');const short=()=>cardEl.classList.toggle('cm-short',innerHeight<=520);short();}
 const regions=Object.keys(AT().positions).map(Number).filter(n=>worldOf(n)).sort((a,b)=>a-b);
 const here=opts.current||null;
 const info={};
 for(const n of regions){
  const visited=!!atlas.state.visited[n];
  info[n]={progress:progress(n,atlas,here?.world===n?here.room:null),next:!visited&&AT().links.some(l=>(l.a===n||l.b===n)&&atlas.state.open[l.id])};
 }
 const startN=here?.world&&regions.includes(here.world)?here.world:regions[0];
 const model={atlas,here,selected:startN,regions,info};
 const fractured=regions.some(n=>n>20);
 const bounds={x:-(2.65*SX+NW/2+34),y:-(0.62*SY+40),w:2*(2.65*SX+NW/2+34),h:(fractured?(FLIP+.62)*SY+50:8.65*SY+NH+40)+(0.62*SY+40)};
 const frames={
  all:bounds,
  base:{x:bounds.x+20,y:-NH/2-50,w:bounds.w-40,h:8.65*SY+NH+70},
  fractured:{x:bounds.x+20,y:8.45*SY,w:bounds.w-40,h:(FLIP-8.45)*SY+NH/2+40}
 };
 host.innerHTML=`<div class="cm-wrap">
  <div class="cm-tools">
    <select class="cm-b" data-cm="pick" aria-label="Show a region">${regions.map(n=>`<option value="${n}"${n===startN?' selected':''}>${n} · ${esc(nameOf(n))}</option>`).join('')}</select>
    ${opts.onStart?'<button class="cm-b" id="cmPlayWorld">Play world</button>':''}
    <button class="cm-b" data-cm="me">Find me</button>
    <button class="cm-b" data-cm="all">Fit all</button>
    <button class="cm-b" data-cm="base">Emerald</button>
    ${fractured?'<button class="cm-b" data-cm="fractured">Fractured</button>':''}
  </div>
  <div class="cm-view" role="application" aria-label="The Emerald Ascent map. Drag to move, pinch or scroll to zoom, tap a region for its roads.">
   <svg class="cm-svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Two nested emeralds of regions, joined by roads"></svg>
   <div class="cm-chipbar" aria-hidden="true"></div>
   <div class="cm-zoom"><button class="cm-b" data-cm="in" aria-label="Zoom in">+</button><button class="cm-b" data-cm="out" aria-label="Zoom out">−</button></div>
  </div>
  <div class="cm-legend">
   <span><svg width="26" height="8"><path d="M1,4H25" stroke="#6fd39a" stroke-width="3"/></svg>open road</span>
   <span><svg width="26" height="8"><path d="M1,4H25" stroke="#b99cff" stroke-width="2.5" stroke-dasharray="6 4"/></svg>open crossing</span>
   <span><svg width="34" height="12"><path d="M1,6H33" stroke="#4b5262" stroke-width="2" stroke-dasharray="4 5"/><g transform="translate(17,5)" fill="#8d8571" stroke="#8d8571" stroke-width="1.2">${lockGlyph}</g></svg>sealed (finish a region)</span>
   <span><svg width="16" height="14"><path d="M8,13L1,5L8,-2L15,5Z" transform="translate(0,1) scale(1,.9)" fill="#ffd36b"/></svg>you</span>
   <span><svg width="22" height="12"><polygon points="1,6 5,1 17,1 21,6 17,11 5,11" fill="#1a2029" stroke="#6fe0a0" stroke-width="2"/></svg>open to you, not yet visited</span>
   <span><svg width="22" height="12"><polygon points="1,6 5,1 17,1 21,6 17,11 5,11" fill="#2a2a22" stroke="#e7c873" stroke-width="2"/></svg>cleared ✓</span>
  </div>
  <div class="cm-detail" aria-live="polite"></div>
 </div>`;
 const view=host.querySelector('.cm-view'),svg=host.querySelector('svg'),chipbar=host.querySelector('.cm-chipbar'),detail=host.querySelector('.cm-detail'),pick=host.querySelector('[data-cm="pick"]');
 let W=1,H=1,k=1,cx=0,cy=0,kMin=.1,kMax=2.6,anim=null;
 function measure(){const r=view.getBoundingClientRect();W=Math.max(1,r.width);H=Math.max(1,r.height);}
 function fitK(f){return Math.min(W/f.w,H/f.h);}
 function clamp(){
  kMin=Math.min(fitK(bounds)*.85,.5);k=Math.max(kMin,Math.min(kMax,k));
  const hw=W/2/k,hh=H/2/k;
  cx=bounds.w/2>hw?Math.max(bounds.x+hw*.35,Math.min(bounds.x+bounds.w-hw*.35,cx)):bounds.x+bounds.w/2;
  cy=bounds.h/2>hh?Math.max(bounds.y+hh*.35,Math.min(bounds.y+bounds.h-hh*.35,cy)):Math.max(bounds.y,Math.min(bounds.y+bounds.h,cy));
 }
 let lod='';
 function apply(){
  clamp();
  svg.setAttribute('viewBox',`${(cx-W/2/k).toFixed(2)} ${(cy-H/2/k).toFixed(2)} ${(W/k).toFixed(2)} ${(H/k).toFixed(2)}`);
  // names once they are readable (≈8 px); passage names on the chosen region's roads once those are
  const next=(k*13.5>=7.2?'lod-near':'lod-far')+(k>=.82?' lod-close':'');
  if(next!==lod){lod=next;svg.setAttribute('class','cm-svg '+lod);}
 }
 function frameTo(f,animate=true,pad=1){
  const tk=fitK(f)*pad,tx=f.x+f.w/2,ty=f.y+f.h/2;
  if(!animate){k=tk;cx=tx;cy=ty;apply();return;}
  const k0=k,x0=cx,y0=cy,t0=performance.now();cancelAnimationFrame(anim);
  const step=now=>{const t=Math.min(1,(now-t0)/260),e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;k=k0*Math.pow(tk/k0,e);cx=x0+(tx-x0)*e;cy=y0+(ty-y0)*e;apply();if(t<1&&host.isConnected)anim=requestAnimationFrame(step);};
  anim=requestAnimationFrame(step);
 }
 function focusPoint(p,zoom=1.05){frameTo({x:p[0]-W/2/zoom,y:p[1]-H/2/zoom,w:W/zoom,h:H/zoom});}
 function herePoint(){
  if(here?.link){const l=AT().links.find(x=>x.id===here.link),pts=l&&routeOf(l);if(pts)return along(pts,here.t??.5);}
  return pos(here?.world||startN)||[0,0];
 }
 function render(){svg.innerHTML=buildSvg(model);apply();}
 function card(n){
  const w=worldOf(n),inf=info[n],pr=inf.progress,visited=!!atlas.state.visited[n],current=here?.world===n;
  const chips=[current?`<span class="cm-chip here">${here.link?'you are on its road':'you are here'}</span>`:'',pr?.cleared?'<span class="cm-chip done">cleared</span>':'',
   inf.next?'<span class="cm-chip next">open to you</span>':'',!visited&&!inf.next&&!current?'<span class="cm-chip">not yet visited</span>':''].join('');
  let where='';
  if(current&&here.link){const l=AT().links.find(x=>x.id===here.link);where=l?`You are on ${esc(PS()?.designs?.[l.id]?.[0]||'the road')}, the road between ${esc(nameOf(l.a))} and ${esc(nameOf(l.b))}.`:'';}
  else if(pr){
   const a=current&&!here.link?pr.at:null;
   where=a?.kind==='section'?`You are in section ${a.i} of ${pr.total}${a.name?' ('+esc(a.name)+')':''} · ${pr.solved} cleared.`
    :a?.kind==='arrival'?`You are at ${esc(a.name)}, where you arrive, before section 1 of ${pr.total} · ${pr.solved} cleared.`
    :a?.kind==='end'?`You are at ${esc(a.name)}, past the last of its ${pr.total} sections · ${pr.solved} cleared.`
    :a?.kind==='postern'?`You are at ${esc(a.name)}, a postern over its road · ${pr.solved} of ${pr.total} sections cleared.`
    :a?.kind==='branch'?`You are on ${esc(a.name)}, a side way · ${pr.solved} of ${pr.total} sections cleared.`
    :`${pr.solved} of ${pr.total} sections cleared.`;
  }
  const ms=mouths(n,atlas);
  const groups=[];
  for(const m of ms){let g=groups.find(x=>x.id===m.junctionId);if(!g)groups.push(g={id:m.junctionId,name:m.junction,role:m.role,list:[]});g.list.push(m);}
  const li=m=>`<li><b>${m.edge==='left'?'←':'→'} ${esc(m.toName)}</b> · ${m.open?'<span class="cm-open">open</span>':'<span class="cm-sealed">sealed</span>'}<br><small>${esc([m.tier,m.edge].filter(Boolean).join(' '))} mouth · ${esc(m.passage)} · arrives at the ${esc(m.where)}${m.open?'':'<br>Opens when you '+esc(m.reasonLong)}</small></li>`;
  const onRoad=current&&here.link&&AT().links.find(x=>x.id===here.link);
  const state=onRoad?`on ${PS()?.designs?.[onRoad.id]?.[0]||'the road'} to ${nameOf(onRoad.a===n?onRoad.b:onRoad.a)}`:current?'you are here':pr?.cleared?'cleared':inf.next?'open to you':visited?'visited':'not yet visited';
  const sealed=ms.filter(m=>!m.open).length;
  chipbar.innerHTML=`<b>${n} · ${esc(w?.name||nameOf(n))}</b> <small>· ${esc(state)}${pr?` · ${pr.solved}/${pr.total} sections`:''}${ms.length?` · ${ms.length-sealed} road${ms.length-sealed===1?'':'s'} open${sealed?`, ${sealed} sealed`:''}`:''}</small>`;
  detail.innerHTML=`<h2>${n} · ${esc(w?.name||nameOf(n))}${chips}</h2><div>${where}</div>${groups.length?groups.map(g=>`<h3>${esc(g.name)} · ${esc(roleWords[g.role])}</h3><ul>${g.list.map(li).join('')}</ul>`).join(''):'<div><small>No roads leave this region yet.</small></div>'}`;
  const play=host.querySelector('#cmPlayWorld');if(play){const locked=opts.canStart&&!opts.canStart(n);play.disabled=!!locked;play.textContent=locked?'Locked':'Play world';play.title=locked?'Find this world’s base keepsake':'Play '+(w?.name||nameOf(n));play.setAttribute('aria-label',play.title);play.onclick=()=>opts.onStart(n);if(locked)detail.insertAdjacentHTML('beforeend','<p>Find this world’s base keepsake to unlock its Fractured echo.</p>');}
 }
 function select(n,pan=false){
  if(!regions.includes(n))return;model.selected=n;if(pick)pick.value=String(n);render();card(n);
  if(pan){const p=pos(n),hw=W/2/k,hh=H/2/k;if(Math.abs(p[0]-cx)>hw*.7||Math.abs(p[1]-cy)>hh*.7)focusPoint(p,Math.max(k,.75));}
 }
 // pointers: one drags, two pinch; a tap on a region selects it
 const pts=new Map();let gesture=null,moved=0,downNode=null;
 const local=e=>{const r=view.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top];};
 const worldAt=([sx,sy])=>[cx+(sx-W/2)/k,cy+(sy-H/2)/k];
 view.addEventListener('pointerdown',e=>{
  if(e.target.closest('.cm-zoom'))return;
  if(e.target.closest('.cm-chipbar')){detail.scrollIntoView({block:'nearest',behavior:'smooth'});return;}
  cancelAnimationFrame(anim);
  pts.set(e.pointerId,local(e));try{view.setPointerCapture(e.pointerId);}catch(err){}
  if(pts.size===1){moved=0;downNode=e.target.closest?.('[data-n]')?.getAttribute('data-n')||null;gesture={kind:'drag',last:local(e)};}
  else if(pts.size===2){const [a,b]=[...pts.values()];gesture={kind:'pinch',d0:Math.hypot(a[0]-b[0],a[1]-b[1])||1,k0:k,m0:worldAt([(a[0]+b[0])/2,(a[1]+b[1])/2])};downNode=null;}
  view.classList.add('cm-drag');e.preventDefault();
 });
 view.addEventListener('pointermove',e=>{
  if(!pts.has(e.pointerId))return;const p=local(e),prev=pts.get(e.pointerId);pts.set(e.pointerId,p);
  if(gesture?.kind==='drag'&&pts.size===1){const dx=p[0]-gesture.last[0],dy=p[1]-gesture.last[1];moved+=Math.abs(dx)+Math.abs(dy);gesture.last=p;if(moved>6){cx-=dx/k;cy-=dy/k;apply();}}
  else if(gesture?.kind==='pinch'&&pts.size>=2){const [a,b]=[...pts.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1])||1,mid=[(a[0]+b[0])/2,(a[1]+b[1])/2];k=gesture.k0*d/gesture.d0;clamp();cx=gesture.m0[0]-(mid[0]-W/2)/k;cy=gesture.m0[1]-(mid[1]-H/2)/k;apply();moved+=99;}
  void prev;
 });
 const up=e=>{
  if(!pts.has(e.pointerId))return;pts.delete(e.pointerId);
  if(pts.size===0){view.classList.remove('cm-drag');if(gesture?.kind==='drag'&&moved<=6&&downNode)select(+downNode);gesture=null;downNode=null;}
  else if(pts.size===1){const [p]=[...pts.values()];gesture={kind:'drag',last:p};}
 };
 view.addEventListener('pointerup',up);view.addEventListener('pointercancel',up);
 view.addEventListener('wheel',e=>{
  e.preventDefault();cancelAnimationFrame(anim);
  const p=local(e),wp=worldAt(p),f=Math.exp(-(e.deltaMode===1?e.deltaY*16:e.deltaY)*.0016);
  k*=f;clamp();cx=wp[0]-(p[0]-W/2)/k;cy=wp[1]-(p[1]-H/2)/k;apply();
 },{passive:false});
 view.addEventListener('scroll',()=>{view.scrollTop=0;view.scrollLeft=0;});
 host.querySelectorAll('[data-cm]').forEach(b=>{
  const act=b.getAttribute('data-cm');
  if(act==='pick'){b.addEventListener('change',()=>select(+b.value,true));return;}
  b.addEventListener('click',()=>{
   if(act==='in'||act==='out'){const f=act==='in'?1.4:1/1.4;frameTo({x:cx-W/2/(k*f),y:cy-H/2/(k*f),w:W/(k*f),h:H/(k*f)});}
   else if(act==='me'){focusPoint(herePoint(),Math.max(k,1));if(here?.world)select(here.world);}
   else frameTo(frames[act]);
  });
 });
 // start: the emerald you are in, whole, with you marked
 measure();render();card(startN);
 frameTo((here?.world||startN)>20?frames.fractured:frames.base,false);
 let ro=null;
 if(typeof ResizeObserver!=='undefined'){ro=new ResizeObserver(()=>{if(!host.isConnected){ro.disconnect();return;}const ow=W,oh=H;measure();if(Math.abs(ow-W)+Math.abs(oh-H)>1){k*=Math.sqrt((W*H)/(ow*oh))||1;apply();}});ro.observe(view);}
 return {select,frame:name=>frames[name]&&frameTo(frames[name]),findMe:()=>focusPoint(herePoint(),Math.max(k,1)),state:()=>({k,cx,cy,W,H,lod,selected:model.selected}),destroy(){ro?.disconnect();host.innerHTML='';}};
}

root.BladefallClimbMap={mount,describeSocket,mouths,reason,progress};
})(typeof window!=='undefined'?window:globalThis);
