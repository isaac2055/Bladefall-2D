(function installBladefallInput(root) {
  'use strict';

  function createKeyboardState(eventTarget) {
    if (!eventTarget || typeof eventTarget.addEventListener !== 'function') {
      throw new TypeError('Keyboard state requires an event target');
    }

    const keys = Object.create(null);
    const pressed = Object.create(null);

    const onKeyDown = (event) => {
      if (!event.repeat) pressed[event.code] = true;
      keys[event.code] = true;
    };
    const onKeyUp = (event) => {
      keys[event.code] = false;
    };
    const onBlur = () => {
      for (const code in keys) keys[code] = false;
    };

    eventTarget.addEventListener('keydown', onKeyDown);
    eventTarget.addEventListener('keyup', onKeyUp);
    eventTarget.addEventListener('blur', onBlur);

    function isDown(code) {
      return !!keys[code];
    }

    function isPressed(code) {
      return !!pressed[code];
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

  root.BladefallInput = Object.freeze({ createKeyboardState });
})(typeof globalThis !== 'undefined' ? globalThis : window);
