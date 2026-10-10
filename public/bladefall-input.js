(function installBladefallInput(root) {
  'use strict';

  // Physical key codes ignore Shift/Caps Lock. Some Android/embedded browsers only
  // supply key: normalize that fallback too, including old single-letter bindings.
  function normalizeCode(value) {
    const raw=String(value||'');
    if (/^[a-z]$/i.test(raw)) return 'Key'+raw.toUpperCase();
    if (/^key[a-z]$/i.test(raw)) return 'Key'+raw.slice(-1).toUpperCase();
    if (/^[0-9]$/.test(raw)) return 'Digit'+raw;
    return ({' ':'Space',Spacebar:'Space',Esc:'Escape',Left:'ArrowLeft',Right:'ArrowRight',Up:'ArrowUp',Down:'ArrowDown'})[raw]||raw;
  }
  function eventCode(event) {
    return normalizeCode(event.code&&event.code!=='Unidentified'?event.code:event.key);
  }
  function createGamepadState(navigatorObject, mapping) {
    const held=Object.create(null),pressed=Object.create(null);let connected=false;
    function poll() {
      let pads=[];try{pads=Array.from(navigatorObject.getGamepads?.()||[]).filter(p=>p&&p.connected);}catch{}
      const busy=p=>p.buttons.some(b=>b.pressed||b.value>.5)||p.axes.slice(0,2).some(v=>Math.abs(v)>.28);
      const pad=pads.find(busy)||pads.find(p=>p.mapping==='standard')||pads[0];connected=!!pad;
      const button=i=>!!pad?.buttons[i]&&(pad.buttons[i].pressed||pad.buttons[i].value>.5);
      const next=mapping({button,x:pad?.axes[0]||0,y:pad?.axes[1]||0,connected});
      for(const k of new Set([...Object.keys(held),...Object.keys(next)])){pressed[k]=!!next[k]&&!held[k];held[k]=!!next[k];}
      return connected;
    }
    return Object.freeze({poll,isDown:a=>!!held[a],isPressed:a=>!!pressed[a],connected:()=>connected,
      clearPressed:()=>{for(const a in pressed)pressed[a]=false;},reset:()=>{for(const a in held)held[a]=false;for(const a in pressed)pressed[a]=false;}});
  }
  function createKeyboardState(eventTarget) {
    if (!eventTarget || typeof eventTarget.addEventListener !== 'function') {
      throw new TypeError('Keyboard state requires an event target');
    }

    const keys = Object.create(null);
    const pressed = Object.create(null);

    const onKeyDown = (event) => {
      if (!event.repeat) pressed[eventCode(event)] = true;
      keys[eventCode(event)] = true;
    };
    const onKeyUp = (event) => {
      keys[eventCode(event)] = false;
    };
    const onBlur = () => {
      for (const code in keys) keys[code] = false;
      clearPressed();
    };

    eventTarget.addEventListener('keydown', onKeyDown);
    eventTarget.addEventListener('keyup', onKeyUp);
    eventTarget.addEventListener('blur', onBlur);

    function isDown(code) {
      return !!keys[normalizeCode(code)];
    }

    function isPressed(code) {
      return !!pressed[normalizeCode(code)];
    }

    function clearPressed() {
      for (const code in pressed) pressed[code] = false;
    }

    function reset() {
      for (const code in keys) keys[code] = false;
      clearPressed();
    }

    function detach() {
      eventTarget.removeEventListener('keydown', onKeyDown);
      eventTarget.removeEventListener('keyup', onKeyUp);
      eventTarget.removeEventListener('blur', onBlur);
      reset();
    }

    return Object.freeze({ keys, pressed, isDown, isPressed, clearPressed, reset, detach });
  }

  root.BladefallInput = Object.freeze({ createKeyboardState, normalizeCode, eventCode, createGamepadState });
})(typeof globalThis !== 'undefined' ? globalThis : window);
