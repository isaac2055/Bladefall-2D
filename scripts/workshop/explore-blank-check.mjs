import assert from 'node:assert/strict';
import {exploreRuntime} from './explore-runtime-harness.mjs';
const app=await exploreRuntime('?workshopSource=1');
try{
 const {w}=app,A=w.BladefallWorkshopExplore,M=w.BladefallWorkshopModel,R=w.BladefallWorkshopExploreRuntime;
 const blank=A.blank();assert.equal(A.compile(blank).blank,true);
 const session=M.session(M.create({id:'blank',name:'My new level',mode:'explore',definition:blank}),{validateDefinition:d=>A.compile(d.definition)});
 assert(session.submit('builder',A.insert(blank,{id:'my-platform',glyph:'plat',x:300,y:-100})).ok);
 const edited=session.snapshot().definition;R.start(edited);const g=w.__BF.G;
 assert(w.movementProfile().dash);assert(w.__BF.G.p.weapon);
 assert(g.workshopBlank);assert.equal(g.obstacles.length,2);assert.equal(g.enemies.length,0);assert.equal(g.npcs.length,0);assert.equal(g.openingActRemaster,null);assert.equal(g.campaignBlueprint,null);assert.equal(g.levelLength,2400);assert.equal(g.p.x,100);
 // A fresh draft has an editable solid floor, not an invisible falling loop.
 for(let f=0;f<120;f++)w.gameUpdate();assert.equal(g.p.y,0);assert(g.p.onGround);
 // Traverse the whole level over ten seconds, including a platform landing.
 for(let f=0;f<600;f++){g.p.x=100+f*3;w.gameUpdate();}
 assert.equal(g.obstacles.length,2,'no campaign terrain appears');assert.equal(g.enemies.length,0);assert.equal(g.npcs.length,0);assert(!g.outskirtsRoomCard);assert.equal(w.__BF.mode,'play');
 g.p.x=380;g.p.y=150;g.p.vy=-100;for(let f=0;f<90;f++)w.gameUpdate();assert.equal(g.p.y,100,'edited platform is solid in native physics');
 w.die();assert.equal(w.__BF.G.p.x,100);assert(w.__BF.G.workshopBlank);assert.equal(w.__BF.G.obstacles.length,2);
 R.retry();assert.equal(w.__BF.G.p.x,100);assert.equal(w.__BF.G.obstacles.length,2);assert.equal(w.__BF.G.leaderboardEligible,false);assert.equal(w.__BF.G.worldProgressEligible,false);
 w.__BF.G.p.x=2280;w.__BF.G.p.y=0;w.gameUpdate();assert.equal(w.__BF.mode,'portal_prompt');w.document.getElementById('portalYes').click();assert.equal(w.__BF.mode,'pause','exit completes preview');
 // Designer flags remain in the room, activate on touch, and survive death rebuilds.
 const flags=M.session(M.create({id:'flags',name:'Flags',mode:'explore',definition:A.blank()}),{validateDefinition:d=>A.compile(d.definition)});
 assert(flags.submit('builder',A.insert(flags.snapshot().definition,{id:'checkpoint',glyph:'check',x:600,y:-64})).ok);
 assert(flags.submit('builder',A.insert(flags.snapshot().definition,{id:'exit',glyph:'exit',x:900,y:-310})).ok);
 const flagged=flags.snapshot().definition;R.start(flagged);w.__BF.G.p.x=612;w.__BF.G.p.y=0;w.gameUpdate();assert.equal(w.__BF.G.p.ckX,612);assert.equal(w.__BF.G.p.ckY,40);w.die();assert.equal(w.__BF.G.p.x,612);assert.equal(w.__BF.G.p.y,40);assert(w.__BF.G.obstacles.some(o=>o.type==='check'));
 // The raised exit follows its edited height; walking beneath it cannot finish the level.
 w.__BF.G.p.x=945;w.__BF.G.p.y=0;w.gameUpdate();assert.equal(w.__BF.mode,'play');w.__BF.G.p.y=200;w.__BF.G.p.vy=0;w.gameUpdate();assert.equal(w.__BF.mode,'portal_prompt');w.document.getElementById('portalYes').click();assert.equal(w.__BF.mode,'pause');
 R.retry();assert.equal(w.__BF.G.p.x,100,'full test restart uses authored spawn');
 for(const [kit,dash,weapon]of [['jump',false,false],['dash',true,true],['full',true,true]]){const d=A.blank();d.graph.nodes[d.graph.entry.$ref].props.kit=kit;R.start(d);assert.equal(!!w.movementProfile().dash,dash,kit);assert.equal(!!w.__BF.G.p.weapon,weapon,kit);R.retry();assert.equal(!!w.movementProfile().dash,dash,kit+' retry');}
 const ui=w.BladefallWorkshopUI.open({document:M.create({id:'kit-ui',name:'Kit',mode:'explore',definition:A.blank()}),adapter:A,onSave:async()=>{}});
 const kitField=ui.element.querySelector('[data-level=kit]');assert.equal(kitField.tagName,'SELECT');kitField.value='jump';kitField.dispatchEvent(new w.Event('change'));assert.equal(A.compile(ui.snapshot().definition).kit,'jump');await ui.save();ui.close();
 const ctx=w.document.createElement('canvas').getContext('2d'),translations=[];ctx.translate=(x,y)=>translations.push([x,y]);w.drawPortal(ctx,{x:100,y:0,t:0});const base=translations[0][1];translations.length=0;w.drawPortal(ctx,{x:100,y:200,t:0});assert.equal(translations[0][1],base-200,'rendered exit follows edited height');
 assert.deepEqual(app.errors,[]);
 console.log('PASS: blank Explore native creation, edited platform collision, ten-second traversal without campaign objects/story, checkpoint death/restart, raised exit rendering/completion, and starting ability kits through native runtime and editor controls.');
}finally{app.close();}
