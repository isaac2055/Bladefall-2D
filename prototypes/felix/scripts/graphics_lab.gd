extends VBoxContainer
## Dev-only controls. These preferences never enter a campaign save.
signal changed
const PRESETS=["Original","Clear","Atmospheric"]
const SCALES=["Auto","Full","Half"]
const Atmosphere=preload("res://scripts/graphics_lab_atmosphere.gd")
var options={"preset":0,"particles":true,"shadows":true,"post":true,"atmosphere":false,"scale":0}
var active=false
var enabled_once=false
var path="user://dev-graphics.cfg"
var args:PackedStringArray
var preset_picker:OptionButton
var scale_picker:OptionButton
var switches={}
var cli_override=false

func setup(parent,font:Font,is_mobile,launch_args):
 args=launch_args
 parent.add_child(self)
 var header=CheckButton.new()
 header.text="Graphics Lab" if is_mobile else "Graphics Lab · F9 cycles looks"
 add_child(header)
 var detail=VBoxContainer.new()
 detail.hide()
 add_child(detail)
 header.toggled.connect(func(value):detail.visible=value)
 preset_picker=OptionButton.new()
 for title in PRESETS: preset_picker.add_item(title)
 preset_picker.add_item("Custom")
 preset_picker.set_item_disabled(3,true)
 preset_picker.item_selected.connect(func(i):select_preset(i,true))
 detail.add_child(preset_picker)
 for entry in [["particles","Ambient particles"],["shadows","Decorative shadows"],["post","Vignette and grain"],["atmosphere","Atmospheric accents"]]:
  var control=CheckButton.new()
  control.text=entry[1]
  switches[entry[0]]=control
  control.toggled.connect(func(value):set_override(entry[0],value))
  detail.add_child(control)
 scale_picker=OptionButton.new()
 for title in SCALES: scale_picker.add_item("Render scale · "+title)
 scale_picker.item_selected.connect(func(i):set_override("scale",i))
 detail.add_child(scale_picker)
 var reset=Button.new()
 reset.text="Reset to Original"
 reset.pressed.connect(func():select_preset(0,true))
 detail.add_child(reset)
 for control in [header]+detail.get_children():
  if font!=null: control.add_theme_font_override("font",font)
  if is_mobile:
   control.custom_minimum_size.y=56
   control.add_theme_font_size_override("font_size",25)
 sync_controls()
 hide()

func set_active(value):
 active=value
 visible=value
 if not value or enabled_once: return
 enabled_once=true
 cli_override="--capture" in args
 for arg in args:
  if arg.begins_with("--graphics-preset=") or arg.begins_with("--graphics-scale="): cli_override=true
 if not cli_override:
  var config=ConfigFile.new()
  if config.load(path)==OK:
   options.preset=clampi(int(config.get_value("graphics","preset",0)),0,3)
   options.scale=clampi(int(config.get_value("graphics","scale",0)),0,2)
   for key in switches: options[key]=bool(config.get_value("graphics",key,options[key]))
 for arg in args:
  if arg.begins_with("--graphics-preset="):
   var index=PRESETS.find(arg.get_slice("=",1).capitalize())
   if index>=0: select_preset(index,false)
  if arg.begins_with("--graphics-scale="):
   var index=SCALES.find(arg.get_slice("=",1).capitalize())
   if index>=0: options.scale=index
 sync_controls()

func handle_shortcut(event):
 if not active or not event is InputEventKey or not event.pressed or event.echo or event.physical_keycode!=KEY_F9: return false
 select_preset((options.preset+1)%PRESETS.size() if options.preset<PRESETS.size() else 0,true)
 return true

func select_preset(index,persist):
 options.preset=index
 options.particles=index!=1
 options.shadows=index!=1
 options.post=index!=1
 options.atmosphere=index==2
 options.scale=0
 sync_controls()
 if persist: save_and_emit()

func set_override(key,value):
 options[key]=value
 options.preset=3
 sync_controls()
 save_and_emit()

func save_and_emit():
 if not cli_override:
  var config=ConfigFile.new()
  for key in options: config.set_value("graphics",key,options[key])
  config.save(path)
 changed.emit()

func sync_controls():
 preset_picker.select(options.preset)
 scale_picker.select(options.scale)
 for key in switches: switches[key].set_pressed_no_signal(options[key])

func apply(view,container,auto_shrink,style):
 var shrink=auto_shrink
 if active:
  if options.scale==1: shrink=1
  if options.scale==2: shrink=2
 # Container and overlays stay in the same logical 1280x832 coordinates.
 if container.stretch_shrink!=shrink:
  container.stretch_shrink=shrink
  view.scale=Vector2.ONE*(4.0/shrink)
 view.lab_particles=not active or options.particles
 view.lab_post=not active or options.post
 view.post.visible=view.lab_post
 var shadows=not active or options.shadows
 for item in view.lights:
  var light=item.node
  if not shadows:
   if not light.has_meta("lab_original_shadow"): light.set_meta("lab_original_shadow",light.shadow_enabled)
   light.shadow_enabled=false
  elif light.has_meta("lab_original_shadow"):
   light.shadow_enabled=light.get_meta("lab_original_shadow")
   light.remove_meta("lab_original_shadow")
 if active and options.atmosphere:
  if view.lab_atmosphere==null:
   view.lab_atmosphere=Atmosphere.new()
   view.lab_atmosphere.style=style
   view.add_child(view.lab_atmosphere)
  view.lab_atmosphere.show()
 elif view.lab_atmosphere!=null: view.lab_atmosphere.hide()
 view.refresh_lab_effects()

func diagnostics(container):
 var result=options.duplicate() if active else {"preset":0,"particles":true,"shadows":true,"post":true,"atmosphere":false,"scale":0}
 result.render_shrink=container.stretch_shrink
 return result

static func timing_stats(samples):
 if samples.is_empty(): return {}
 var ordered=samples.duplicate()
 ordered.sort()
 return {"samples":ordered.size(),"median":ordered[int(ordered.size()*.5)],"p95":ordered[int(ordered.size()*.95)],"worst":ordered[-1]}
