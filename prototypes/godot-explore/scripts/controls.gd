extends RefCounted
const KEYS={"left":[KEY_LEFT],"right":[KEY_RIGHT],"jump":[KEY_SPACE],"attack":[KEY_W],"dash":[KEY_D],"interact":[KEY_UP],"command":[KEY_E],"pickup":[KEY_C],"flag":[KEY_R],"pause":[KEY_ESCAPE]}
static func bind():
 var source=JSON.parse_string(FileAccess.get_file_as_string("res://data/controls.json"))
 var special={"ArrowLeft":KEY_LEFT,"ArrowRight":KEY_RIGHT,"ArrowUp":KEY_UP,"Space":KEY_SPACE,"Escape":KEY_ESCAPE}
 for key in KEYS:
  var name="explore_"+key
  if not InputMap.has_action(name): InputMap.add_action(name)
  InputMap.action_erase_events(name)
  for code in source.keys[key]:
   var event=InputEventKey.new()
   event.physical_keycode=special.get(code,code.unicode_at(3) if code.begins_with("Key") else 0)
   InputMap.action_add_event(name,event)
 var pads={"left":JOY_BUTTON_DPAD_LEFT,"right":JOY_BUTTON_DPAD_RIGHT,"jump":JOY_BUTTON_A,"attack":JOY_BUTTON_X,"interact":JOY_BUTTON_Y,"pickup":JOY_BUTTON_LEFT_SHOULDER,"flag":JOY_BUTTON_BACK,"pause":JOY_BUTTON_START}
 for key in pads:
  var event=InputEventJoypadButton.new()
  event.button_index=pads[key]
  InputMap.action_add_event("explore_"+key,event)
 for pair in [["left",-1.0],["right",1.0]]:
  var axis=InputEventJoypadMotion.new()
  axis.axis=JOY_AXIS_LEFT_X
  axis.axis_value=pair[1]
  InputMap.action_add_event("explore_"+pair[0],axis)
static func read():
 var raw={}
 for key in KEYS: raw[key]=Input.is_action_pressed("explore_"+key)
 return raw
