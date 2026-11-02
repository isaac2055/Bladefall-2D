extends RefCounted
## Keep the source defaults in data; use physical keys so keyboard layouts retain their positions.
const ACTIONS = {"l":"move_left","r":"move_right","u":"aim_up","d":"aim_down","jump":"knight_jump","dash":"knight_dash","grab":"knight_grab","strike":"knight_strike","parry":"knight_parry","portal":"knight_portal","retry":"knight_retry","pause":"knight_pause"}
static func bind():
 var source = JSON.parse_string(FileAccess.get_file_as_string("res://data/controls.json"))
 var special = {"ArrowLeft":KEY_LEFT,"ArrowRight":KEY_RIGHT,"ArrowUp":KEY_UP,"ArrowDown":KEY_DOWN,"Space":KEY_SPACE,"ShiftLeft":KEY_SHIFT,"ShiftRight":KEY_SHIFT}
 for verb in ACTIONS:
  var action = ACTIONS[verb]
  if not InputMap.has_action(action): InputMap.add_action(action)
  InputMap.action_erase_events(action)
  for code in source.keys[verb]:
   var event = InputEventKey.new()
   event.physical_keycode = special.get(code,code.unicode_at(3) if code.begins_with("Key") else 0)
   if event.physical_keycode!=0: InputMap.action_add_event(action,event)
 # Godot's SDL buttons differ from the browser's Gamepad indices; map named equivalents.
 var pads = {"l":[JOY_BUTTON_DPAD_LEFT],"r":[JOY_BUTTON_DPAD_RIGHT],"u":[JOY_BUTTON_DPAD_UP],"d":[JOY_BUTTON_DPAD_DOWN],"jump":[JOY_BUTTON_A],"dash":[JOY_BUTTON_X,JOY_BUTTON_B],"grab":[JOY_BUTTON_LEFT_SHOULDER],"strike":[JOY_BUTTON_Y],"parry":[],"portal":[JOY_BUTTON_RIGHT_SHOULDER],"retry":[JOY_BUTTON_BACK],"pause":[JOY_BUTTON_START]}
 for verb in pads:
  for index in pads[verb]:
   var event = InputEventJoypadButton.new()
   event.button_index = index
   InputMap.action_add_event(ACTIONS[verb],event)
 for pair in [["l",JOY_AXIS_LEFT_X,-1.0],["r",JOY_AXIS_LEFT_X,1.0],["u",JOY_AXIS_LEFT_Y,-1.0],["d",JOY_AXIS_LEFT_Y,1.0],["grab",JOY_AXIS_TRIGGER_LEFT,1.0],["parry",JOY_AXIS_TRIGGER_RIGHT,1.0]]:
  var event = InputEventJoypadMotion.new()
  event.axis = pair[1]
  event.axis_value = pair[2]
  InputMap.action_add_event(ACTIONS[pair[0]],event)
 var escape = InputEventKey.new()
 escape.physical_keycode = KEY_ESCAPE
 InputMap.action_add_event(ACTIONS.pause,escape)
static func read():
 var raw = {}
 for verb in ACTIONS:
  if verb not in ["retry","pause"]: raw[verb] = Input.is_action_pressed(ACTIONS[verb])
 return raw
