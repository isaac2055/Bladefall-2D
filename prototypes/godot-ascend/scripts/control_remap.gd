extends RefCounted
## Persistent per-device-class bindings; menus keep Godot's standard navigation.
const PATH="user://bladefall-controls.cfg"
static var overrides={}
static var deadzone=.25
static func load_settings(path=PATH):
 var config=ConfigFile.new()
 overrides={}
 deadzone=.25
 if config.load(path)==OK:
  overrides=config.get_value("bindings","overrides",{})
  deadzone=clampf(float(config.get_value("bindings","deadzone",.25)),.15,.5)
static func save_settings(path=PATH):
 var config=ConfigFile.new()
 config.set_value("bindings","overrides",overrides)
 config.set_value("bindings","deadzone",deadzone)
 return config.save(path)==OK
static func encode(event):
 if event is InputEventJoypadButton: return {"kind":"button","code":int(event.button_index)}
 if event is InputEventJoypadMotion: return {"kind":"axis","code":int(event.axis),"sign":1 if event.axis_value>0 else -1}
 if event is InputEventKey: return {"kind":"key","code":int(event.physical_keycode if event.physical_keycode else event.keycode)}
 return {}
static func decode(binding):
 if binding.kind=="button":
  var e=InputEventJoypadButton.new();e.device=-1;e.button_index=int(binding.code);return e
 if binding.kind=="axis":
  var e=InputEventJoypadMotion.new();e.device=-1;e.axis=int(binding.code);e.axis_value=float(binding.sign);return e
 var e=InputEventKey.new();e.physical_keycode=int(binding.code);return e
static func controller(event): return event is InputEventJoypadButton or event is InputEventJoypadMotion
static func apply(actions):
 for verb in actions:
  var action=actions[verb]
  InputMap.action_set_deadzone(action,deadzone)
  for device in ["keyboard","controller"]:
   var key=verb+":"+device
   if not overrides.has(key): continue
   for e in InputMap.action_get_events(action):
    if controller(e)==(device=="controller"): InputMap.action_erase_event(action,e)
   InputMap.action_add_event(action,decode(overrides[key]))
 # A physical Escape and Start always remain safe ways to pause/cancel.
 var escape=InputEventKey.new();escape.physical_keycode=KEY_ESCAPE
 InputMap.action_add_event(actions.pause,escape)
 var start=InputEventJoypadButton.new();start.device=-1;start.button_index=JOY_BUTTON_START
 InputMap.action_add_event(actions.pause,start)
static func bind(verb,event,actions,path=PATH):
 var binding=encode(event)
 if binding.is_empty(): return false
 overrides[verb+(":controller" if controller(event) else ":keyboard")]=binding
 apply(actions)
 return save_settings(path)
static func label(action,pad):
 var labels=[]
 for e in InputMap.action_get_events(action):
  if controller(e)!=pad: continue
  var value=describe(e)
  labels.append(value)
 return " / ".join(labels) if not labels.is_empty() else "Unbound"

static func describe(event):
 if event is InputEventKey: return OS.get_keycode_string(event.physical_keycode)
 if event is InputEventJoypadButton:
  return {JOY_BUTTON_A:"A / Cross",JOY_BUTTON_B:"B / Circle",JOY_BUTTON_X:"X / Square",JOY_BUTTON_Y:"Y / Triangle",JOY_BUTTON_BACK:"Back / Select",JOY_BUTTON_START:"Start / Options",JOY_BUTTON_LEFT_SHOULDER:"LB / L1",JOY_BUTTON_RIGHT_SHOULDER:"RB / R1",JOY_BUTTON_LEFT_STICK:"L3",JOY_BUTTON_RIGHT_STICK:"R3",JOY_BUTTON_DPAD_UP:"D-pad up",JOY_BUTTON_DPAD_DOWN:"D-pad down",JOY_BUTTON_DPAD_LEFT:"D-pad left",JOY_BUTTON_DPAD_RIGHT:"D-pad right"}.get(event.button_index,"Button %d"%event.button_index)
 if event.axis in [JOY_AXIS_TRIGGER_LEFT,JOY_AXIS_TRIGGER_RIGHT]: return "LT / L2" if event.axis==JOY_AXIS_TRIGGER_LEFT else "RT / R2"
 var stick="Left stick " if event.axis in [JOY_AXIS_LEFT_X,JOY_AXIS_LEFT_Y] else "Right stick "
 var horizontal=event.axis in [JOY_AXIS_LEFT_X,JOY_AXIS_RIGHT_X]
 return stick+(("left" if event.axis_value<0 else "right") if horizontal else ("up" if event.axis_value<0 else "down"))

static func short_label(action,pad):
 for event in InputMap.action_get_events(action):
  if controller(event)==pad: return describe(event)
 return "unbound"

static func conflicts(verb,event,actions):
 var result=[]
 var encoded=encode(event)
 for other in actions:
  if other==verb: continue
  if InputMap.action_get_events(actions[other]).any(func(e):return encode(e)==encoded): result.append(other)
 return result
