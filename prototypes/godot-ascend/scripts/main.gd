extends Node
const Core = preload("res://scripts/core.gd")
const Loader = preload("res://scripts/room_loader.gd")
const Landscape = preload("res://scripts/landscape.gd")
const Controls = preload("res://scripts/controls.gd")
const Sound = preload("res://scripts/audio.gd")
var data
var sim
var landscape
var audio
var current = 0
var watch = false
var paused = false
var tape = []
var tape_frame = 0
var hold = 0
var status: Label
var title: Label
var room_picker: OptionButton
var watch_button: Button
var capture_path = ""
var capture_menu = false
var audio_capture_path = ""
var ticks = 0
var screenshot_after = 100
var viewport: SubViewport
var pause_panel: Control
var subtitle_panel: PanelContainer
var subtitle_name: Label
var subtitle_text: Label
var subtitle_time = 0.0
var subtitle_age = 0.0
var room_banner: Label
var banner_time = 0.0
var dash_label: Label
var death_label: Label
var root_ui: Control
var mute_music_level = 0.55
var volume_sliders = {}
var preferences = ConfigFile.new()
var test_mode = false
var closing = false
func text(parent,value,size,color="#d8dfd9"):
 var l = Label.new()
 l.text = value
 l.add_theme_font_size_override("font_size",size)
 l.add_theme_color_override("font_color",Color(color))
 parent.add_child(l)
 return l
func style(background,border="#515b5c",radius=5):
 var s = StyleBoxFlat.new()
 s.bg_color = Color(background)
 s.border_color = Color(border)
 s.set_border_width_all(1)
 s.set_corner_radius_all(radius)
 s.content_margin_left = 14
 s.content_margin_right = 14
 s.content_margin_top = 9
 s.content_margin_bottom = 9
 return s
func button(parent,value,callback):
 var b = Button.new()
 b.text = value
 b.focus_mode = Control.FOCUS_NONE
 b.add_theme_font_size_override("font_size",16)
 b.add_theme_stylebox_override("normal",style("#182831","#3e5157"))
 b.add_theme_stylebox_override("hover",style("#293c41","#d1b478"))
 b.add_theme_stylebox_override("pressed",style("#435148","#e5cf93"))
 b.pressed.connect(func():audio.effect("ui-select",0.6);callback.call())
 parent.add_child(b)
 return b
func _ready():
 get_tree().auto_accept_quit = false
 Controls.bind()
 if not test_mode: preferences.load("user://prototype-settings.cfg")
 RenderingServer.set_default_clear_color(Color("0b131c"))
 data = JSON.parse_string(FileAccess.get_file_as_string("res://data/world1.json"))
 sim = Core.new(data.constants,data.playerDefaults)
 audio = Sound.new()
 for bus in audio.levels: audio.levels[bus] = float(preferences.get_value("audio",bus,audio.levels[bus]))
 audio.voices_enabled = preferences.get_value("audio","voices",true)
 add_child(audio)
 var container = SubViewportContainer.new()
 container.position = Vector2(0,48)
 container.size = Vector2(1280,736)
 container.stretch = true
 container.stretch_shrink = 2
 viewport = SubViewport.new()
 viewport.size = Vector2i(640,368)
 viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
 viewport.canvas_item_default_texture_filter = Viewport.DEFAULT_CANVAS_ITEM_TEXTURE_FILTER_NEAREST
 container.add_child(viewport)
 add_child(container)
 landscape = Landscape.new()
 landscape.scale = Vector2(2,2)
 landscape.world_data = data
 viewport.add_child(landscape)
 audio.spoken.connect(show_subtitle)
 landscape.reduced_motion = preferences.get_value("display","reduced_motion",false)
 create_interface()
 var args = OS.get_cmdline_user_args()
 for i in range(args.size()):
  if args[i]=="--capture" and i+1<args.size(): capture_path = args[i+1]
  elif args[i]=="--capture-audio" and i+1<args.size(): audio_capture_path = args[i+1];audio.start_capture()
  elif args[i]=="--capture-after" and i+1<args.size(): screenshot_after = int(args[i+1])
  elif args[i]=="--menu": capture_menu = true
  elif args[i]=="--watch": watch = true
  elif args[i]=="--room" and i+1<args.size(): current = int(args[i+1])
 load_section(current)
func create_interface():
 root_ui = Control.new()
 root_ui.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
 root_ui.mouse_filter = Control.MOUSE_FILTER_IGNORE
 add_child(root_ui)
 var header = Panel.new()
 header.position = Vector2(0,0)
 header.size = Vector2(1280,48)
 header.add_theme_stylebox_override("panel",style("#101c25","#344049",0))
 root_ui.add_child(header)
 var logo = text(header,"B L A D E F A L L",19,"#e0d2ac")
 logo.position = Vector2(24,10)
 title = text(header,"THE OUTSKIRTS",14,"#90a4a9")
 title.position = Vector2(285,14)
 dash_label = text(header,"◆ DASH",15,"#e6ba70")
 dash_label.position = Vector2(955,13)
 death_label = text(header,"0 DEATHS",14,"#a3b1b5")
 death_label.position = Vector2(1060,14)
 var menu = button(header,"II  Esc",func():set_paused(not paused))
 menu.position = Vector2(1176,5)
 menu.size = Vector2(88,38)
 room_banner = text(root_ui,"",27,"#e7dcc0")
 room_banner.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
 room_banner.position = Vector2(160,77)
 room_banner.size = Vector2(960,42)
 status = text(root_ui,"← → MOVE     SPACE / C JUMP     D DASH     A CLING / CARRY     W STRIKE     R RETRY",14,"#8fa2a7")
 status.position = Vector2(24,799)
 subtitle_panel = PanelContainer.new()
 subtitle_panel.position = Vector2(185,677)
 subtitle_panel.size = Vector2(910,85)
 subtitle_panel.add_theme_stylebox_override("panel",style("#0c1822e6","#738375",4))
 root_ui.add_child(subtitle_panel)
 var subtitles = VBoxContainer.new()
 subtitle_panel.add_child(subtitles)
 subtitle_name = text(subtitles,"",14,"#e2bf7c")
 subtitle_text = text(subtitles,"",18,"#f0ede0")
 subtitle_text.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
 subtitle_panel.hide()
 pause_panel = Control.new()
 pause_panel.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
 root_ui.add_child(pause_panel)
 var scrim = ColorRect.new()
 scrim.color = Color(0.02,0.04,0.07,0.85)
 scrim.size = Vector2(1280,832)
 pause_panel.add_child(scrim)
 var card = PanelContainer.new()
 card.position = Vector2(330,44)
 card.size = Vector2(620,744)
 card.add_theme_stylebox_override("panel",style("#14232e","#697b77",10))
 pause_panel.add_child(card)
 var column = VBoxContainer.new()
 column.add_theme_constant_override("separation",10)
 card.add_child(column)
 text(column,"THE OUTSKIRTS",30,"#e4d6ad")
 text(column,"A road through the old watch · Ascend",15,"#90a6ac")
 var row = HBoxContainer.new()
 row.add_theme_constant_override("separation",8)
 column.add_child(row)
 button(row,"Resume",func():set_paused(false))
 button(row,"Retry · R",func():load_section(current);set_paused(false))
 watch_button = button(row,"Watch route",func():toggle_watch();set_paused(false))
 text(column,"EXPLORE A SECTION",12,"#bba984")
 room_picker = OptionButton.new()
 room_picker.custom_minimum_size = Vector2(560,40)
 room_picker.focus_mode = Control.FOCUS_NONE
 for i in range(data.world.rooms.size()): room_picker.add_item("%02d · %s" % [i+1,data.world.rooms[i].get("name",data.world.rooms[i].id)])
 room_picker.item_selected.connect(func(index):load_section(index);set_paused(false))
 column.add_child(room_picker)
 text(column,"SOUND",12,"#bba984")
 for bus in ["Music","Effects","Voices","Ambience"]:
  var sound_row = HBoxContainer.new()
  column.add_child(sound_row)
  var name_label = text(sound_row,bus,16)
  name_label.custom_minimum_size.x = 110
  var slider = HSlider.new()
  slider.custom_minimum_size = Vector2(420,30)
  slider.max_value = 1
  slider.step = 0.01
  slider.value = audio.levels[bus]
  volume_sliders[bus] = slider
  slider.value_changed.connect(func(value):audio.levels[bus]=value;audio.apply_levels();save_preferences())
  sound_row.add_child(slider)
 var voices = CheckBox.new()
 voices.text = "Spoken dialogue (subtitles stay on)"
 voices.button_pressed = audio.voices_enabled
 voices.toggled.connect(set_voices)
 column.add_child(voices)
 var reduced = CheckBox.new()
 reduced.text = "Reduce motion and screen shake"
 reduced.button_pressed = landscape.reduced_motion
 reduced.toggled.connect(func(value):landscape.reduced_motion=value;save_preferences())
 column.add_child(reduced)
 var light_row = HBoxContainer.new()
 column.add_child(light_row)
 button(light_row,"Lighting on / off",func():landscape.lit = not landscape.lit)
 button(light_row,"Fullscreen · F11",toggle_fullscreen)
 text(column,"ARROWS  Move and aim\nSPACE / C / J  Jump     D / X / K  Dash\nA / Z / SHIFT / L  Cling, climb, carry or throw\nW / V / I  Strike     R  Retry     M  Music\nController: stick / d-pad · A jump · X/B dash · LB cling",15,"#b5c0bd")
 text(column,"An Ascend prototype · The Outskirts",12,"#70888f")
 pause_panel.hide()
func set_voices(value):
 audio.voices_enabled = value
 if not value: audio.speech.stop()
 save_preferences()
func save_preferences():
 if test_mode: return
 for bus in audio.levels: preferences.set_value("audio",bus,audio.levels[bus])
 preferences.set_value("audio","voices",audio.voices_enabled)
 preferences.set_value("display","reduced_motion",landscape.reduced_motion)
 preferences.save("user://prototype-settings.cfg")
func toggle_fullscreen():
 DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED if DisplayServer.window_get_mode()==DisplayServer.WINDOW_MODE_FULLSCREEN else DisplayServer.WINDOW_MODE_FULLSCREEN)
func _unhandled_input(event):
 if event.is_echo(): return
 if event.is_action_pressed("knight_pause"):
  set_paused(not paused)
  get_viewport().set_input_as_handled()
 elif event.is_action_pressed("knight_retry") and not paused: load_section(current)
 elif event is InputEventKey and event.pressed:
  if event.physical_keycode==KEY_F11: toggle_fullscreen()
  elif event.physical_keycode==KEY_M:
   if audio.levels.Music>0: mute_music_level=audio.levels.Music;audio.levels.Music=0.0
   else: audio.levels.Music=mute_music_level
   audio.apply_levels()
   save_preferences()
func set_paused(value):
 paused = value
 pause_panel.visible = value
 if value:
  for bus in volume_sliders: volume_sliders[bus].set_value_no_signal(audio.levels[bus])
 landscape.set_process(not value)
 audio.set_paused(value)
 if value: audio.effect("ui-pause",0.6)
 else: audio.effect("ui-back",0.6)
func show_subtitle(who,line,seconds):
 subtitle_name.text = who.to_upper()
 subtitle_text.text = line
 subtitle_text.visible_characters = -1
 subtitle_time = max(seconds+0.5,4.0)
 subtitle_age = 0.0
 subtitle_panel.show()
 landscape.speaker = who.to_lower()
func _process(delta):
 if paused: return
 banner_time = max(0,banner_time-delta)
 room_banner.modulate.a = clamp(banner_time,0,1)
 if subtitle_time>0:
  subtitle_time -= delta
  subtitle_age += delta
  subtitle_panel.modulate.a = min(1.0,subtitle_age*5)*min(1.0,subtitle_time*3)
  if subtitle_time<=0: subtitle_panel.hide();landscape.speaker=""
func toggle_watch():
 if watch:
  watch = false
  hold = 0
  watch_button.text = "Watch route"
 else:
  watch = true
  load_section(current)
func load_section(index,smooth_join=false):
 current = index
 sim.prev = {}
 sim.buf = {"jump":0,"dash":0,"grab":0,"strike":0,"parry":0,"portal":0}
 sim.freeze = 0
 sim.load_room(Loader.parse(data.world.rooms[index]))
 landscape.load_scene(sim,smooth_join)
 audio.room_changed()
 tape = []
 for part in data.world.tapes.get(sim.room.id,[]):
  for i in range(int(part[0])): tape.append(part[1])
 tape_frame = 0
 hold = 0
 room_picker.select(index)
 watch_button.text = "Take control" if watch else "Watch route"
 title.text = "THE OUTSKIRTS · "+("WATCHING" if watch else "ASCEND")
 room_banner.text = sim.room.name.to_upper()
 banner_time = 2.4
func input_now(): return Controls.read()
func decode(keys):
 var raw = {}
 var letters = {"l":"l","r":"r","u":"u","d":"d","jump":"j","dash":"x","grab":"g","strike":"s","parry":"p","portal":"q"}
 for key in letters: raw[key] = letters[key] in keys
 return raw
func _physics_process(_delta):
 if sim==null or paused: return
 ticks += 1
 if hold>0:
  landscape.previous_actor = landscape.current_actor
  hold -= 1
  if hold==0 and watch: next_section()
 else:
  var before = landscape.before_tick()
  if watch:
   if tape_frame<tape.size():
    sim.step(decode(tape[tape_frame]))
    tape_frame += 1
  else: sim.step(input_now())
  var effects = landscape.after_tick(before)
  audio.events(effects)
  audio.tick(sim,1.0/60.0)
  if sim.exited:
   if watch: hold = 45
   else: next_section()
 dash_label.text = "◆ DASH" if sim.p.dashes>0 else "◇ DASH"
 dash_label.modulate = Color("edbf74") if sim.p.dashes>0 else Color("687e91")
 death_label.text = "%d DEATHS" % sim.deaths
 if watch: status.text = "RECORDED ROUTE     ·     Esc opens the menu     ·     Take control to play"
 else: status.text = "← → MOVE     SPACE / C JUMP     D DASH     A CLING / CARRY     W STRIKE     R RETRY"
 if capture_path!="" and ticks==screenshot_after: capture.call_deferred()
func next_section():
 var sections = data.world.sections
 var index = -1
 for i in range(sections.size()):
  if sections[i].room==sim.room.id: index = i
 if index>=0 and index+1<sections.size():
  var target = sections[index+1].room
  for i in range(data.world.rooms.size()):
   if data.world.rooms[i].id==target:
    var source = sections[index]
    var destination = sections[index+1]
    var snapshot = {"p":sim.p.duplicate(true),"prev":sim.prev.duplicate(),"buf":sim.buf.duplicate()}
    load_section(i,true)
    if not watch:
     sim.carry_from(snapshot,{"x":source.x*8,"y":source.y*8},{"x":destination.x*8,"y":destination.y*8},sim.room.def.get("atlasJunction",false))
     landscape.snap_actor()
    if tape.is_empty() and watch: watch=false;watch_button.text="Watch route"
    return
 watch = false
func capture():
 if capture_menu: set_paused(true)
 await RenderingServer.frame_post_draw
 var result = get_viewport().get_texture().get_image().save_png(capture_path)
 if audio_capture_path!="": audio.save_capture(audio_capture_path)
 var report = {"fps":Engine.get_frames_per_second(),"audio":audio.counts,"presentation":landscape.observed,"shadow_occluders":landscape.occluder_count,"lights":landscape.lights.size(),"room":sim.room.id,"camera":[landscape.camera.x,landscape.camera.y]}
 var file = FileAccess.open(capture_path+".json",FileAccess.WRITE)
 file.store_string(JSON.stringify(report,"  "))
 file.close()
 print("Capture: ",capture_path," result ",result," ",report)
 await close_app(0 if result==OK else 1)

func _notification(what):
 if what==NOTIFICATION_WM_CLOSE_REQUEST: close_app()
func close_app(code=0):
 if closing: return
 closing = true
 paused = true
 set_physics_process(false)
 audio.shutdown()
 await get_tree().create_timer(0.15).timeout
 get_tree().quit(code)
