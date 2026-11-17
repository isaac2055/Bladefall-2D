import test from 'node:test';
import assert from 'node:assert/strict';
await import('../public/bladefall-explore-touch.js');
class Element extends EventTarget {
 style={};
 getBoundingClientRect(){return {left:0,top:0};}
 setPointerCapture(){}
}
function setup(){
 const input={left:true},zone=new Element(),gestureZone=new Element(),joy=new Element(),knob=new Element();
 let playing=true,dash=true,preset='smooth',fixed=false;
 const control=globalThis.BladefallExploreTouch.create({input,zone,gestureZone,joy,knob,
  playing:()=>playing,canDash:()=>dash,preset:()=>preset,fixedStick:()=>fixed,stickLayout:()=>({x:100,y:100,r:52})});
 const event=(id,x,y)=>({pointerType:'touch',pointerId:id,clientX:x,clientY:y,preventDefault(){}});
 const down=(id,x,y,role='gesture')=>control.down(event(id,x,y),role);
 const move=(id,x,y)=>control.move(event(id,x,y));
 const up=(id,x,y,canceled=false)=>control.end(event(id,x,y),canceled);
 return {input,joy,knob,control,down,move,up,playing:v=>playing=v,dash:v=>dash=v,preset:v=>preset=v,fixed:v=>fixed=v};
}
test('Smooth taps jump with a minimum hold and a release between rapid taps',()=>{
 const t=setup();assert.equal(t.control.state().stick,false);
 t.down(1,700,200);t.up(1,700,200);
 assert.equal(t.input.jump,true);assert.equal(t.input.jumpEdge,true);
 t.input.jumpEdge=false;t.control.tick(.1);assert.equal(t.input.jump,true);
 t.down(2,700,200);t.up(2,700,200);assert.equal(t.input.jump,false);
 t.control.tick(.03);assert.equal(t.input.jump,true);assert.equal(t.input.jumpEdge,true);
 t.control.tick(.1);t.control.tick(.1);assert.equal(t.input.jump,false);
});
test('Right swipe dashes without jumping, aims temporarily, then restores a held movement stick',()=>{
 const t=setup();t.down(1,100,200,'stick');t.move(1,145,200);assert.ok(t.input.jx>.7);
 t.down(2,650,200);t.move(2,610,150);
 assert.equal(t.input.dodge,true);assert.equal(t.input.dodgeEdge,true);assert.equal(t.input.jump,false);
 assert.equal(t.input.jx,-1);assert.equal(t.input.jz,-1);
 t.up(2,610,150);t.control.tick(.1);assert.equal(t.input.dodge,false);
 t.control.tick(.03);assert.ok(t.input.jx>.7);assert.equal(t.input.jz,0);
 t.up(1,145,200);assert.equal(t.input.jx,0);assert.equal(t.joy.style.display,'none');
});
test('Floating stick follows the thumb; a stationary quick left tap also jumps',()=>{
 const t=setup();t.down(1,150,200,'stick');assert.equal(t.joy.style.display,'block');
 t.move(1,350,200);assert.equal(t.input.jx,1);assert.equal(t.joy.style.left,'246px');
 t.up(1,350,200);assert.equal(t.input.jump,false);
 t.down(2,120,200,'stick');t.up(2,120,200);assert.equal(t.input.jump,true);
});
test('A held tap followed by a swipe gives a jump-dash; locked dash is never granted',()=>{
 const t=setup();t.down(1,650,200);t.control.tick(.08);assert.equal(t.input.jump,true);
 t.move(1,700,200);assert.equal(t.input.dodge,true);assert.equal(t.input.jump,true);
 t.control.releaseAll();t.dash(false);t.down(2,650,200);t.move(2,700,200);
 assert.equal(t.input.dodge,false);assert.equal(t.input.dodgeEdge,false);
});
test('Canceled pointers, pause and resize-style cleanup cannot leave steering or gestures held',()=>{
 const t=setup();t.down(1,650,200);t.up(1,650,200,true);assert.equal(t.input.jump,false);
 t.down(2,100,200,'stick');t.move(2,140,200);t.down(3,650,200);t.control.tick(.08);
 assert.equal(t.input.jump,true);assert.ok(t.input.jx>0);
 t.playing(false);t.control.tick(.02);
 assert.equal(t.input.jump,false);assert.equal(t.input.dodge,false);assert.equal(t.input.jx,0);
 assert.equal(t.control.state().pointers,0);assert.equal(t.input.left,true,'physical movement state stays independent');
});
test('The button fallback keeps ordinary button holds and edited fixed sticks working',()=>{
 const t=setup();t.preset('buttons');t.control.tick(0);t.input.jump=true;t.control.tick(.02);assert.equal(t.input.jump,true);
 t.input.jump=false;t.down(1,100,200,'stick');t.up(1,100,200);assert.equal(t.input.jump,false);
 t.fixed(true);t.down(2,100,100,'stick');t.move(2,200,100);assert.equal(t.input.jx,1);assert.equal(t.joy.style.left,'48px');
});
