extends VBoxContainer
## Dev-only controls. These preferences never enter a campaign save.
signal changed
const PRESETS=["Original","Clear","Atmospheric","Illustrated","Nightfall","Autumn","Frostlight"]
const CUSTOM=7
const FINISHES=["Original","Grit","Etched","Brushed"]
const SCENERIES=["Original","Illustrated","Nightfall"]
const MOTIONS=["Still","Gentle","Full"]
const WEATHER=["Motes","Rain","Glints","Snow","Leaves"]
const PALETTES=["Original","Amber","Frost"]
const DENSITIES=["Sparse","Balanced","Lush"]
const Surface=preload("res://shaders/surface_finish.gdshader")
const SCALES=["Auto","Full","Half"]
const Atmosphere=preload("res://scripts/graphics_lab_atmosphere.gd")
const DEFAULTS={"preset":0,"particles":true,"shadows":true,"post":true,"atmosphere":false,"scale":0,"finish":0,"scenery":0,"motion":2,"weather":0,"density":1,"surface_strength":100,"backdrop_strength":100,"weather_strength":100,"parallax":true,"palette":0}
var options=DEFAULTS.duplicate()
var extra_pickers={}
var strength_sliders={}
var strength_labels={}
var comparing=false
var favorite={}
var compare_button:Button
var recall_button:Button
var feedback:Label
var badge:Label
var badge_time=0.0
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
 preset_picker.set_item_disabled(CUSTOM,true)
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
 var extras=CheckButton.new()
 extras.text="Surface, scenery and weather"
 detail.add_child(extras)
 var extra=VBoxContainer.new()
 extra.hide()
 detail.add_child(extra)
 extras.toggled.connect(func(value):extra.visible=value)
 for entry in [["finish","Surface",FINISHES],["scenery","Backdrop",SCENERIES],["motion","Scenery motion",MOTIONS],["weather","Weather",WEATHER],["palette","Scenery palette",PALETTES],["density","Weather density",DENSITIES]]:
  var picker=OptionButton.new()
  for title in entry[2]: picker.add_item(entry[1]+" · "+title)
  if entry[0]=="weather": picker.tooltip_text="Uses the Atmospheric accents switch."
  if entry[0]=="motion": picker.tooltip_text="Affects only the experimental scenery and weather."
  picker.item_selected.connect(func(i):set_override(entry[0],i))
  extra.add_child(picker)
  extra_pickers[entry[0]]=picker
 for entry in [["surface_strength","Surface strength"],["backdrop_strength","Backdrop strength"],["weather_strength","Weather strength"]]:
  var label=Label.new()
  extra.add_child(label)
  strength_labels[entry[0]]=label
  var slider=HSlider.new()
  slider.min_value=0
  slider.max_value=100
  slider.step=5
  slider.accessibility_name=entry[1]
  slider.tooltip_text=entry[1]+". Zero removes this experimental pass."
  slider.value_changed.connect(func(value):set_override(entry[0],int(value)))
  extra.add_child(slider)
  strength_sliders[entry[0]]=slider
 var parallax=CheckButton.new()
 parallax.text="Scenery follows camera"
 parallax.toggled.connect(func(value):set_override("parallax",value))
 switches.parallax=parallax
 extra.add_child(parallax)
 compare_button=Button.new()
 compare_button.text="Compare with Original · F8"
 compare_button.pressed.connect(toggle_comparison)
 detail.add_child(compare_button)
 var keep=Button.new()
 keep.text="Save favorite look"
 keep.pressed.connect(save_favorite)
 detail.add_child(keep)
 recall_button=Button.new()
 recall_button.text="Recall favorite look"
 recall_button.pressed.connect(recall_favorite)
 detail.add_child(recall_button)
 feedback=Label.new()
 feedback.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART
 detail.add_child(feedback)
 var layer=CanvasLayer.new()
 layer.layer=90
 add_child(layer)
 badge=Label.new()
 badge.position=Vector2(730,62)
 badge.size=Vector2(530,32)
 badge.horizontal_alignment=HORIZONTAL_ALIGNMENT_RIGHT
 badge.add_theme_font_size_override("font_size",18)
 badge.add_theme_color_override("font_color",Color("#fff2cf"))
 badge.add_theme_color_override("font_shadow_color",Color("#10121b"))
 badge.add_theme_constant_override("shadow_offset_x",2)
 badge.add_theme_constant_override("shadow_offset_y",2)
 badge.mouse_filter=Control.MOUSE_FILTER_IGNORE
 layer.add_child(badge)
 badge.hide()
 set_process(false)
 var reset=Button.new()
 reset.text="Reset to Original"
 reset.pressed.connect(func():select_preset(0,true))
 detail.add_child(reset)
 for control in [header]+detail.get_children().filter(func(node):return node is BaseButton)+extra.get_children():
  if font!=null: control.add_theme_font_override("font",font)
  if is_mobile:
   control.custom_minimum_size.y=56
   control.add_theme_font_size_override("font_size",25)
 sync_controls()
 hide()

func set_active(value):
 active=value
 visible=value
 if not value:
  comparing=false
  badge.hide()
  set_process(false)
 if not value or enabled_once: return
 enabled_once=true
 cli_override="--capture" in args
 for arg in args:
  if arg.begins_with("--graphics-"): cli_override=true
 if not cli_override:
  var config=ConfigFile.new()
  if config.load(path)==OK:
   read_options(config)
   var stored=config.get_value("favorite","options",{})
   if stored is Dictionary and not stored.is_empty(): favorite=validated(stored,int(config.get_value("graphics","version",1)))
 for arg in args:
  if arg.begins_with("--graphics-preset="):
   var index=PRESETS.find(arg.get_slice("=",1).capitalize())
   if index>=0: select_preset(index,false)
  if arg.begins_with("--graphics-scale="):
   var index=SCALES.find(arg.get_slice("=",1).capitalize())
   if index>=0: options.scale=index
  for key in ["surface_strength","backdrop_strength","weather_strength"]:
   if arg.begins_with("--graphics-"+key.replace("_","-")+"="):
    options[key]=clampi(int(arg.get_slice("=",1)),0,100)
    options.preset=CUSTOM
 sync_controls()

func validated(values,version=4):
 var result=DEFAULTS.duplicate()
 result.preset=clampi(int(values.get("preset",0)),0,CUSTOM)
 if version==1 and result.preset==3 or version<4 and result.preset==5: result.preset=CUSTOM
 for key in ["scale","scenery","motion","density","palette"]:
  result[key]=clampi(int(values.get(key,DEFAULTS[key])),0,2)
 result.finish=clampi(int(values.get("finish",0)),0,FINISHES.size()-1)
 result.weather=clampi(int(values.get("weather",0)),0,WEATHER.size()-1)
 for key in ["particles","shadows","post","atmosphere","parallax"]:
  result[key]=bool(values.get(key,DEFAULTS[key]))
 for key in ["surface_strength","backdrop_strength","weather_strength"]:
  result[key]=clampi(int(values.get(key,DEFAULTS[key])),0,100)
 return result

func read_options(config):
 var values={}
 for key in DEFAULTS: values[key]=config.get_value("graphics",key,DEFAULTS[key])
 # Preserve both earlier custom-preset slots, including saved favorites.
 options=validated(values,int(config.get_value("graphics","version",1)))

func toggle_comparison():
 if not active: return
 comparing=not comparing
 sync_controls()
 announce("Original · F8 to return" if comparing else current_name())
 changed.emit()

func current_name():
 return PRESETS[options.preset] if options.preset<CUSTOM else "Custom look"

func save_favorite():
 favorite=options.duplicate()
 sync_controls()
 feedback.text="Favorite saved."
 save_and_emit()

func recall_favorite():
 if favorite.is_empty(): return
 comparing=false
 options=validated(favorite)
 sync_controls()
 feedback.text="Favorite recalled."
 announce(current_name())
 save_and_emit()

func announce(value):
 badge.text="Graphics Lab · "+value
 badge_time=2.0
 badge.show()
 set_process(not comparing)

func _process(delta):
 if comparing: return
 badge_time-=delta
 if badge_time<=0:
  badge.hide()
  set_process(false)

func handle_shortcut(event):
 if not active or not event is InputEventKey or not event.pressed or event.echo: return false
 if event.physical_keycode==KEY_F8:
  toggle_comparison()
  return true
 if event.physical_keycode!=KEY_F9: return false
 select_preset((options.preset+1)%PRESETS.size() if options.preset<PRESETS.size() else 0,true)
 return true

func select_preset(index,persist):
 comparing=false
 options=DEFAULTS.duplicate()
 feedback.text=""
 options.preset=index
 options.particles=index!=1
 options.shadows=index!=1
 options.post=index!=1
 options.atmosphere=index>=2
 if index==3:
  options.finish=2
  options.scenery=1
  options.motion=1
  options.weather=2
 elif index==4:
  options.finish=1
  options.scenery=2
  options.weather=1
  options.particles=false
 elif index in [5,6]:
  options.finish=3 if index==5 else 1
  options.scenery=1 if index==5 else 2
  options.palette=1 if index==5 else 2
  options.weather=4 if index==5 else 3
  options.motion=1
  options.particles=false
  options.backdrop_strength=85
  options.weather_strength=85
 sync_controls()
 if persist:
  announce(current_name())
  save_and_emit()

func set_override(key,value):
 var was_comparing=comparing
 feedback.text=""
 comparing=false
 options[key]=value
 options.preset=CUSTOM
 sync_controls()
 if was_comparing: announce(current_name())
 save_and_emit()

func save_and_emit():
 if not cli_override:
  var config=ConfigFile.new()
  config.set_value("graphics","version",4)
  for key in options: config.set_value("graphics",key,options[key])
  if not favorite.is_empty(): config.set_value("favorite","options",favorite)
  if config.save(path)!=OK: feedback.text="Could not save developer preferences."
 changed.emit()

func sync_controls():
 preset_picker.select(options.preset)
 scale_picker.select(options.scale)
 for key in switches: switches[key].set_pressed_no_signal(options[key])
 for key in extra_pickers: extra_pickers[key].select(options[key])
 for key in strength_sliders:
  strength_sliders[key].set_value_no_signal(options[key])
  strength_labels[key].text=strength_sliders[key].accessibility_name+" · %d%%"%options[key]
 compare_button.text="Return to "+current_name()+" · F8" if comparing else "Compare with Original · F8"
 recall_button.disabled=favorite.is_empty()

func apply(view,container,auto_shrink,style):
 var look=DEFAULTS if comparing else options
 var shrink=auto_shrink
 if active:
  if look.scale==1: shrink=1
  if look.scale==2: shrink=2
 # Container and overlays stay in the same logical 1280x832 coordinates.
 if container.stretch_shrink!=shrink:
  container.stretch_shrink=shrink
  view.scale=Vector2.ONE*(4.0/shrink)
 view.lab_particles=not active or look.particles
 view.lab_post=not active or look.post
 view.post.visible=view.lab_post
 var shadows=not active or look.shadows
 for item in view.lights:
  var light=item.node
  if not shadows:
   if not light.has_meta("lab_original_shadow"): light.set_meta("lab_original_shadow",light.shadow_enabled)
   light.shadow_enabled=false
  elif light.has_meta("lab_original_shadow"):
   light.shadow_enabled=light.get_meta("lab_original_shadow")
   light.remove_meta("lab_original_shadow")
 var finish=int(look.finish) if active else 0
 if finish!=0 and look.surface_strength>0:
  if not view.tiles.has_meta("lab_original_material"):
   # A Dictionary can retain a null material without removing the metadata.
   view.tiles.set_meta("lab_original_material",{"value":view.tiles.material})
   var treatment=ShaderMaterial.new()
   treatment.shader=Surface
   view.tiles.material=treatment
  view.tiles.material.set_shader_parameter("finish",finish)
  view.tiles.material.set_shader_parameter("strength",look.surface_strength/100.0)
 elif view.tiles.has_meta("lab_original_material"):
  view.tiles.material=view.tiles.get_meta("lab_original_material").value
  view.tiles.remove_meta("lab_original_material")
 if active and (look.atmosphere and look.weather_strength>0 or look.scenery!=0 and look.backdrop_strength>0):
  if view.lab_atmosphere==null:
   view.lab_atmosphere=Atmosphere.new()
   view.add_child(view.lab_atmosphere)
   if "backdrop" in view and view.backdrop!=null:
    view.move_child(view.lab_atmosphere,view.backdrop.get_index())
  view.lab_atmosphere.configure(style,look.scenery,look.atmosphere,look.motion,look.weather,look.backdrop_strength/100.0,look.weather_strength/100.0,look.density,look.parallax,look.palette)
  view.lab_atmosphere.show()
 elif view.lab_atmosphere!=null: view.lab_atmosphere.hide()
 view.refresh_lab_effects()

func diagnostics(container):
 var result=options.duplicate() if active and not comparing else DEFAULTS.duplicate()
 result.comparing_original=comparing
 result.render_shrink=container.stretch_shrink
 return result

static func timing_stats(samples):
 if samples.is_empty(): return {}
 var ordered=samples.duplicate()
 ordered.sort()
 return {"samples":ordered.size(),"median":ordered[int(ordered.size()*.5)],"p95":ordered[int(ordered.size()*.95)],"worst":ordered[-1]}
