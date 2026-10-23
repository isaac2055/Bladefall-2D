// A level edited or published while its room is on screen must repaint: the old tiles' painted layer (cached by
// room id) used to stay, so old spikes were drawn while the new ones hurt (Isaac, 7.375). Plays The Gallery (Ruined
// Keep) first as the original, applies the published edit in the same session (what the editor's save does), and
// checks the picture against a page that had the edit from the start: they must match pixel for pixel.
//   node scripts/quests/published-refresh-check.mjs
import {open} from './harness.mjs';
const URL_='precision.html?pitch=climb&world=1&nosw=1',ready=()=>!!window.BladefallPitchView?.climb?.startWorld;
const prep=(drop)=>{const PV=window.BladefallPitchView,V=window.BladefallPrecisionView,st=PV.climb.state(),w=window.BladefallClimb.world(6),P=window.BLADEFALL_PUBLISHED_LEVELS.ascend;
 window.__entry=P['k6-q-gallery'];if(drop)delete P['k6-q-gallery'];
 PV.climb.startWorld(6,w.chapter.rooms.findIndex(r=>r.id==='cl6-k6-q-gallery'));V.advance(Array(10).fill(''));
 const g=st.view.g;Object.assign(g.p,{x:60,y:140,vx:0,vy:0});V.advance(Array(5).fill(''));};
// the painted room only: tiles are painted into a cached layer; compare that layer's pixels, not the animated frame
const shot=async page=>page.evaluate(()=>{const V=window.BladefallPrecisionView,g=V.view.g,c=document.createElement('canvas');c.width=g.room.w;c.height=g.room.h;
 const b=c.getContext('2d'),pal={rockD:'#222',rock:'#444',edge:'#888',moss:'#4a4'};const saved=V.view.cam;V.view.cam={x:0,y:0};
 try{V.drawStatic(b,g,pal);}finally{V.view.cam=saved;}return c.toDataURL();});
let fail=null;
const a=await open(URL_,ready),b=await open(URL_,ready);
try{
 await b.page.evaluate(prep,false);const fresh=await shot(b.page);                       // had the edit from the start
 await a.page.evaluate(prep,true);const stale=await shot(a.page);                         // the original, painted and cached
 await a.page.evaluate(()=>{window.BladefallPrecisionView.view.g;window.BladefallClimb;const P=window.BLADEFALL_PUBLISHED_LEVELS.ascend;P['k6-q-gallery']=window.__entry;window.BladefallWorkshopBridge.refreshAscendRoom();const st=window.BladefallPitchView.climb.state(),g=st.view.g;Object.assign(g.p,{x:60,y:140,vx:0,vy:0});window.BladefallPrecisionView.advance(Array(5).fill(''));});
 const after=await shot(a.page);
 console.log('before refresh matches a fresh page:',stale===fresh,'| after refresh matches:',after===fresh);
 if(stale===fresh)fail='the test did not start from the original room';
 else if(after!==fresh)fail='the picture after the edit still differs from a page that had it from the start (stale painted layer)';
}catch(e){fail=e.message;}
await a.close();await b.close();
if(fail){console.log('FAIL: '+fail);process.exit(1);}
console.log('PASS');
