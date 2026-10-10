import test from 'node:test';
import assert from 'node:assert/strict';
await import('../public/bladefall-input.js');
const I=globalThis.BladefallInput;
test('letter keys and saved bindings ignore case, with physical codes preferred',()=>{
 for(const ch of 'abcdefghijklmnopqrstuvwxyz')for(const key of [ch,ch.toUpperCase()]){
  assert.equal(I.eventCode({key}),'Key'+ch.toUpperCase());
  assert.equal(I.normalizeCode(key),'Key'+ch.toUpperCase());
  assert.equal(I.eventCode({code:'Key'+ch.toUpperCase(),key:ch.toUpperCase(),shiftKey:true}),'Key'+ch.toUpperCase());
 }
 assert.equal(I.eventCode({code:'Unidentified',key:'D'}),'KeyD');
 assert.equal(I.eventCode({code:'KeyW',key:'z'}),'KeyW');
 const target=new EventTarget(),keyboard=I.createKeyboardState(target);
 for(const [type,key] of [['keydown','D'],['keyup','d']]){const e=new Event(type);Object.defineProperty(e,'key',{value:key});target.dispatchEvent(e);assert.equal(keyboard.isDown('KeyD'),type==='keydown');}
 const held=new Event('keydown');Object.defineProperty(held,'key',{value:'D'});target.dispatchEvent(held);target.dispatchEvent(new Event('blur'));assert.equal(keyboard.isPressed('KeyD'),false);keyboard.detach();
});
test('gamepad analog movement, button edges and disconnect release correctly',()=>{
 const pad={connected:true,mapping:'standard',axes:[.4,0],buttons:[{pressed:false,value:0}]};
 const state=I.createGamepadState({getGamepads:()=>[pad]},({button,x})=>({right:x>.28,jump:button(0)}));
 state.poll();assert.equal(state.isDown('right'),true);assert.equal(state.isPressed('right'),true);
 state.clearPressed();state.poll();assert.equal(state.isPressed('right'),false);
 pad.buttons[0]={pressed:true,value:1};state.poll();assert.equal(state.isPressed('jump'),true);
 state.poll();assert.equal(state.isPressed('jump'),false);
 pad.connected=false;state.poll();assert.equal(state.isDown('jump'),false);assert.equal(state.isDown('right'),false);
});
