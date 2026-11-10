extends Control
const Bindings=preload("res://scripts/controls.gd")
const Remap=preload("res://scripts/control_remap.gd")
const NAMES={"l":"Move / aim left","r":"Move / aim right","u":"Aim up","d":"Aim down / drop","jump":"Jump","dash":"Dash","grab":"Climb / carry / throw","strike":"Strike","parry":"Parry","portal":"Portal","retry":"Retry","pause":"Pause"}
var app
var settings_path=Remap.PATH
var waiting=""
var pad=true
var rows={}
var message:Label
var connection:Label
var zone:Label
func _ready():
 set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
 var shade=ColorRect.new();shade.color=Color(.02,.04,.07,.96);shade.size=Vector2(1280,832);add_child(shade)
 var scroll=ScrollContainer.new();scroll.position=Vector2(180,45);scroll.size=Vector2(920,740);scroll.horizontal_scroll_mode=ScrollContainer.SCROLL_MODE_DISABLED;add_child(scroll)
 var box=VBoxContainer.new();box.custom_minimum_size.x=890;box.add_theme_constant_override("separation",8);scroll.add_child(box)
 app.text(box,"CONTROLS",30,"#e4d5a7")
 if app.mobile:
  app.text(box,"TOUCH · Left thumb moves and aims in eight directions. Tap Jump or Dash with your right thumb. Hold Carry to climb; tap it beside an object to carry or throw. Strike, Parry and Portal also use the stick’s aim. Retry and Pause sit above the action buttons.",28)
 connection=app.text(box,"",15)
 message=app.text(box,"Choose a binding, then press a key, controller button or move an axis. Escape / Start cancels.",15)
 for verb in Bindings.ACTIONS:
  var row=HBoxContainer.new();box.add_child(row)
  var name_label=app.text(row,NAMES[verb],16);name_label.custom_minimum_size.x=210
  rows[verb]=[]
  for is_pad in [false,true]:
   var button=app.button(row,"",func():listen(verb,is_pad),false)
   button.custom_minimum_size=Vector2(320,96 if app.mobile else 34)
   button.add_theme_font_size_override("font_size",26 if app.mobile else 13)
   rows[verb].append(button)
 zone=app.text(box,"Stick / trigger deadzone",15)
 var slider=HSlider.new();slider.min_value=.15;slider.max_value=.5;slider.step=.05;slider.value=Remap.deadzone;box.add_child(slider)
 slider.value_changed.connect(func(value):Remap.deadzone=value;Remap.apply(Bindings.ACTIONS);Remap.save_settings(settings_path);refresh())
 var footer=HBoxContainer.new();box.add_child(footer)
 app.button(footer,"Restore defaults",func():
  Remap.overrides={};Remap.deadzone=.25;Remap.save_settings(settings_path);Bindings.bind(settings_path);slider.value=.25;refresh(),false)
 app.button(footer,"Done",close,false)
 Input.joy_connection_changed.connect(connection_changed)
 refresh()
 hide()
func refresh():
 var connected=Input.get_connected_joypads()
 connection.text="Controller: "+Input.get_joy_name(connected[0]) if not connected.is_empty() else "Connect a controller at any time. Left stick / D-pad to navigate menus, A to select, B to go back."
 zone.text="Stick / trigger deadzone: %d%%"%roundi(Remap.deadzone*100)
 for verb in rows:
  rows[verb][0].text="Keyboard · "+Remap.label(Bindings.ACTIONS[verb],false)
  rows[verb][1].text="Controller · "+Remap.label(Bindings.ACTIONS[verb],true)
func connection_changed(_device,_connected):
 refresh()
 if visible: message.text="Controller connected." if _connected else "Controller disconnected. Keyboard controls remain available."
func open():
 app.set_paused(true)
 app.pause_box.hide()
 app.reset_dev_taps()
 waiting=""
 message.text="Choose a binding, then press a key, controller button or move an axis. Escape / Start cancels."
 refresh();show();move_to_front();rows.jump[1].grab_focus()
func close():
 waiting=""
 hide()
 app.set_paused(true)
 if app.front_end!=null and app.front_end.visible:
  app.pause_box.hide()
  app.front_end.play.grab_focus()
 else: app.focus_pause()
func listen(verb,is_pad):
 waiting=verb;pad=is_pad
 message.text="Press a controller button or move a stick / trigger… Escape / Start cancels." if pad else "Press a key… Escape / Start cancels."
func _input(event):
 if not visible: return
 if waiting=="":
  if event.is_action_pressed("ui_cancel"):
   close();get_viewport().set_input_as_handled()
  return
 if event is InputEventKey and event.pressed and event.keycode==KEY_ESCAPE or event is InputEventJoypadButton and event.pressed and event.button_index==JOY_BUTTON_START:
  waiting="";message.text="Binding cancelled.";get_viewport().set_input_as_handled();return
 var accepted=false
 if pad:
  accepted=event is InputEventJoypadButton and event.pressed or event is InputEventJoypadMotion and absf(event.axis_value)>.65
 else: accepted=event is InputEventKey and event.pressed and not event.echo
 if not accepted: return
 var shared=Remap.conflicts(waiting,event,Bindings.ACTIONS)
 var ok=Remap.bind(waiting,event,Bindings.ACTIONS,settings_path)
 waiting=""
 message.text="Binding saved." if ok else "Binding applied; settings could not be saved."
 if not shared.is_empty():
  var names=[]
  for verb in shared: names.append(NAMES[verb])
  message.text+=" Also bound to "+", ".join(names)+"."
 refresh()
 get_viewport().set_input_as_handled()
