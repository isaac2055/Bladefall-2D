extends Node
const World = preload("res://scripts/world.gd")
const Core = preload("res://scripts/core.gd")
const Loader = preload("res://scripts/room_loader.gd")
const Landscape = preload("res://scripts/landscape.gd")
const Controls = preload("res://scripts/controls.gd")
const Sound = preload("res://scripts/audio.gd")
var data
var world
const CHAPTERS=[1,2,3,21,22,23,4]
var workshop_completed={}
var workshop_shards={}
var workshop_controls:HBoxContainer
var workshop_demo_picker:OptionButton
var workshop_previous:Button
var workshop_next:Button
var chapters = {}
var chapter_number = 1
var initial_world=1
var initial_room=""
var chapter_picker: OptionButton
var pause_title: Label
var pause_description: Label
var quest_label: Label
var notice_label: Label
var notice_time=0.0
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
var restart_button: Button
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
var mixer_panel:Control
var mixer_effect_picker:OptionButton
var mixer_effect_slider:HSlider
var mixer_effect_label:Label
var mixer_effect_names=[]
var mixer_level_labels={}
var preferences = ConfigFile.new()
var preferences_path="user://prototype-settings.cfg"
var npc_picker: OptionButton
var design_picker: OptionButton
var feel_picker:OptionButton
var environment_picker: OptionButton
var appearance_preview: Control
var preview_clock=0.0
var preview_people=[]
var test_mode = false
var closing = false
var measured_frames=[]
var last_frame_usec=0
var real_frame_times=[]
var measured_physics=[]
var journey=[]
var journey_frame=0
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
func button(parent,value,callback,sound=true):
 var b = Button.new()
 b.text = value
 b.focus_mode = Control.FOCUS_NONE
 b.add_theme_font_size_override("font_size",16)
 b.add_theme_stylebox_override("normal",style("#182831","#3e5157"))
 b.add_theme_stylebox_override("hover",style("#293c41","#d1b478"))
 b.add_theme_stylebox_override("pressed",style("#435148","#e5cf93"))
 b.pressed.connect(func():
  if sound: audio.effect("ui-select",0.6)
  callback.call())
 parent.add_child(b)
 return b
func _ready():
 get_tree().auto_accept_quit = false
 Controls.bind()
 # macOS OpenGL VSync intermittently waits an extra display interval on this host.
 # Pace presentation to the actual display instead; simulation remains fixed at 60 Hz.
 if OS.get_name()=="macOS" and DisplayServer.get_name()!="headless":
  var refresh=DisplayServer.screen_get_refresh_rate()
  if refresh>0:
   DisplayServer.window_set_vsync_mode(DisplayServer.VSYNC_DISABLED)
   Engine.max_fps=int(round(refresh))
 if not test_mode: preferences.load(preferences_path)
 RenderingServer.set_default_clear_color(Color("0b131c"))
 data = JSON.parse_string(FileAccess.get_file_as_string("res://data/world1.json"))
 world=World.new(data)
 data=world.data
 sim=world.active()
 audio = Sound.new()
 for bus in audio.levels: audio.levels[bus] = float(preferences.get_value("audio",bus,audio.levels[bus]))
 audio.voices_enabled = preferences.get_value("audio","voices",true)
 audio.effect_levels=preferences.get_value("audio_effects","levels",{}).duplicate(true)
 audio.effect_levels.erase("ui-pause")
 add_child(audio)
 # Construct all chapters before play; selecting a chapter preserves its live state.
 for number in CHAPTERS:
  var chapter_data=data if number==1 else JSON.parse_string(FileAccess.get_file_as_string("res://data/world%d.json"%number))
  var chapter_world=world if number==1 else World.new(chapter_data)
  var container = SubViewportContainer.new()
  container.position = Vector2(0,48)
  container.size = Vector2(1280,736)
  container.stretch = true
  container.stretch_shrink = 1
  var view = SubViewport.new()
  view.size = Vector2i(1280,736)
  view.render_target_update_mode = SubViewport.UPDATE_ALWAYS if number==1 else SubViewport.UPDATE_DISABLED
  view.canvas_item_default_texture_filter = Viewport.DEFAULT_CANVAS_ITEM_TEXTURE_FILTER_NEAREST
  container.add_child(view)
  add_child(container)
  var scene = Landscape.new()
  scene.scale = Vector2(4,4)
  scene.world_data = chapter_world.data
  scene.runtime = chapter_world
  scene.walking_style=1
  scene.npc_design=clampi(int(preferences.get_value("display","npc_design",1)),0,2)
  scene.knight_design=clampi(int(preferences.get_value("display","knight_design",0)),0,2)
  if number==1:
   scene.knight_design=clampi(int(preferences.get_value("display","outskirts_knight_design",scene.knight_design)),0,9)
   scene.npc_design=clampi(int(preferences.get_value("display","outskirts_npc_design",scene.npc_design)),0,7)
   scene.environment_design=int(preferences.get_value("display","outskirts_environment",0))
   if not scene.environment_design in Landscape.Themes.CHOICES: scene.environment_design=0
   scene.environment_feel=clampi(int(preferences.get_value("display","outskirts_surface",0)),0,2)
  scene.reduced_motion = preferences.get_value("display","reduced_motion",false)
  view.add_child(scene)
  scene.load_scene(chapter_world.active())
  scene.set_process(number==1)
  if number!=1:
   scene.process_mode=Node.PROCESS_MODE_DISABLED
   for item in scene.lights:
    item.node.hide()
    item.sparks.emitting=false
   scene.wind.emitting=false
  container.visible=number==1
  chapters[number]={"world":chapter_world,"landscape":scene,"container":container,"viewport":view}
 landscape=chapters[1].landscape
 viewport=chapters[1].viewport
 audio.world_runtime=world
 audio.spoken.connect(show_subtitle)
 landscape.reduced_motion = preferences.get_value("display","reduced_motion",false)
 create_interface()
 if initial_world!=1: switch_chapter(initial_world)
 if initial_room!="": current=world.regions.find(initial_room)
 var args = OS.get_cmdline_user_args()
 for i in range(args.size()):
  if args[i]=="--capture" and i+1<args.size(): capture_path = args[i+1]
  elif args[i]=="--capture-audio" and i+1<args.size(): audio_capture_path = args[i+1];audio.start_capture()
  elif args[i]=="--capture-after" and i+1<args.size(): screenshot_after = int(args[i+1])
  elif args[i]=="--menu": capture_menu = true
  elif args[i]=="--watch": watch = true
  elif args[i] in ["--tour","--quest-tour","--causeway-tour","--silas-tour"]:
   switch_chapter(3 if args[i] in ["--causeway-tour","--silas-tour"] else 2)
   var tour_file={"--tour":"world2-tour","--quest-tour":"elsie-tour","--causeway-tour":"world3-tour","--silas-tour":"silas-tour"}[args[i]]
   var recording=JSON.parse_string(FileAccess.get_file_as_string("res://data/"+tour_file+".json"))
   if recording.has("start_room"): current=world.regions.find(recording.start_room)
   for part in recording.tape:
    for frame in range(int(part[0])): journey.append(part[1])
  elif args[i]=="--fractured-tour" and i+1<args.size():
   var number=int(args[i+1])
   switch_chapter(number)
   var recording=JSON.parse_string(FileAccess.get_file_as_string("res://data/world%d-tour.json"%number))
   for part in recording.tape:
    for frame in range(int(part[0])): journey.append(part[1])
  elif args[i]=="--no-lighting": landscape.lit=false
  elif args[i]=="--no-shadows":
   for item in landscape.lights: item.node.shadow_enabled=false
  elif args[i]=="--world" and i+1<args.size(): switch_chapter(int(args[i+1]))
  elif args[i]=="--room" and i+1<args.size(): current = int(args[i+1])
 load_section(current)
 if watch and tape.is_empty(): next_section()
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
 var menu = button(header,"II  Esc",func():set_paused(not paused),false)
 menu.position = Vector2(1176,5)
 menu.size = Vector2(88,38)
 quest_label=text(root_ui,"",13,"#c4c8aa")
 quest_label.position=Vector2(24,56)
 notice_label=text(root_ui,"",18,"#ead9a7")
 notice_label.position=Vector2(24,91)
 notice_label.size=Vector2(1200,60)
 notice_label.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART
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
 card.position = Vector2(330,24)
 card.size = Vector2(620,784)
 card.add_theme_stylebox_override("panel",style("#14232e","#697b77",10))
 pause_panel.add_child(card)
 var scroll=ScrollContainer.new()
 scroll.horizontal_scroll_mode=ScrollContainer.SCROLL_MODE_DISABLED
 scroll.custom_minimum_size=Vector2(600,760)
 card.add_child(scroll)
 var column = VBoxContainer.new()
 column.size_flags_horizontal=Control.SIZE_EXPAND_FILL
 column.add_theme_constant_override("separation",6)
 scroll.add_child(column)
 pause_title=text(column,"THE OUTSKIRTS",26,"#e4d6ad")
 pause_description=text(column,"A road through the old watch · Ascend",13,"#90a6ac")
 var row = HBoxContainer.new()
 row.add_theme_constant_override("separation",8)
 column.add_child(row)
 button(row,"Resume",func():set_paused(false),false)
 button(row,"Retry · R",func():retry_room();set_paused(false))
 watch_button = button(row,"Watch reference",func():toggle_watch();set_paused(false))
 workshop_controls=HBoxContainer.new()
 workshop_controls.add_theme_constant_override("separation",8)
 column.add_child(workshop_controls)
 workshop_previous=button(workshop_controls,"Previous room",func():workshop_room(-1))
 workshop_next=button(workshop_controls,"Next room · N",func():workshop_room(1))
 button(workshop_controls,"Hint · H",func():show_workshop_hint();set_paused(false))
 workshop_controls.hide()
 workshop_demo_picker=OptionButton.new()
 workshop_demo_picker.focus_mode=Control.FOCUS_NONE
 column.add_child(workshop_demo_picker)
 workshop_demo_picker.hide()
 button(column,"Sound mixer · channels and individual effects",open_mixer,false)
 restart_button=button(column,"Start world over",restart_world)
 chapter_picker=OptionButton.new()
 for number in CHAPTERS:
  chapter_picker.add_item(("Test · " if number==4 else str(number)+" · ")+chapters[number].world.data.world.name)
 chapter_picker.item_selected.connect(func(index):switch_chapter(CHAPTERS[index]);set_paused(false))
 column.add_child(chapter_picker)
 text(column,"EXPLORE A SECTION",12,"#bba984")
 room_picker = OptionButton.new()
 room_picker.custom_minimum_size = Vector2(560,40)
 room_picker.focus_mode = Control.FOCUS_NONE
 for i in range(data.world.rooms.size()): room_picker.add_item("%02d · %s" % [i+1,data.world.rooms[i].get("name",data.world.rooms[i].id)])
 room_picker.item_selected.connect(func(index):load_section(index);set_paused(false))
 column.add_child(room_picker)
 text(column,"OUTSKIRTS APPEARANCE",12,"#bba984")
 text(column,"Walking · Measured",14,"#a6b7bb")
 design_picker=OptionButton.new()
 for id in Landscape.KnightStyles.CHOICES: design_picker.add_item("Knight · "+Landscape.KnightStyles.NAMES[id],id)
 design_picker.select(design_picker.get_item_index(landscape.knight_design))
 design_picker.item_selected.connect(func(index):apply_character_settings(design_picker.get_item_id(index),chapters[1].landscape.npc_design))
 column.add_child(design_picker)
 npc_picker=OptionButton.new()
 for id in Landscape.Styles.CHOICES: npc_picker.add_item("People · "+Landscape.Styles.NAMES[id],id)
 npc_picker.select(npc_picker.get_item_index(landscape.npc_design))
 npc_picker.item_selected.connect(func(index):apply_character_settings(chapters[1].landscape.knight_design,npc_picker.get_item_id(index)))
 column.add_child(npc_picker)
 environment_picker=OptionButton.new()
 for id in Landscape.Themes.CHOICES: environment_picker.add_item("Scenery · "+Landscape.Themes.NAMES[id],id)
 environment_picker.select(environment_picker.get_item_index(chapters[1].landscape.environment_design))
 environment_picker.item_selected.connect(func(index):apply_environment_settings(environment_picker.get_item_id(index)))
 column.add_child(environment_picker)
 feel_picker=OptionButton.new()
 for label in Landscape.Themes.FEELS: feel_picker.add_item("Treatment · "+label)
 feel_picker.select(chapters[1].landscape.environment_feel)
 feel_picker.item_selected.connect(apply_surface_settings)
 column.add_child(feel_picker)
 appearance_preview=Control.new()
 appearance_preview.custom_minimum_size=Vector2(560,168)
 appearance_preview.mouse_filter=Control.MOUSE_FILTER_IGNORE
 for name in ["vey","mara","rowan","elsie","silas"]:
  var found=false
  for chapter in chapters.values():
   for room in chapter.world.data.world.rooms:
    for person in room.get("people",[]):
     if person.who==name and not found:
      preview_people.append(person)
      found=true
 appearance_preview.draw.connect(draw_appearance_preview)
 column.add_child(appearance_preview)
 text(column,"Idle / walk / turn · People preview below",12,"#90a6ac")
 var voices = CheckBox.new()
 voices.text = "Spoken dialogue (subtitles stay on)"
 voices.button_pressed = audio.voices_enabled
 voices.toggled.connect(set_voices)
 column.add_child(voices)
 var reduced = CheckBox.new()
 reduced.text = "Reduce motion and screen shake"
 reduced.button_pressed = landscape.reduced_motion
 reduced.toggled.connect(func(value):
  for chapter in chapters.values(): chapter.landscape.reduced_motion=value
  save_preferences())
 column.add_child(reduced)
 var light_row = HBoxContainer.new()
 column.add_child(light_row)
 button(light_row,"Lighting on / off",func():landscape.lit = not landscape.lit)
 button(light_row,"Fullscreen · F11",toggle_fullscreen)
 text(column,"ARROWS  Move and aim\nSPACE / C / J  Jump     D / X / K  Dash\nA / Z / SHIFT / L  Cling, climb, carry or throw\nW / V / I  Strike     R  Retry     M  Music\nController: stick / d-pad · A jump · X/B dash · LB cling",15,"#b5c0bd")
 text(column,"Native Ascend · six preloaded chapters",12,"#70888f")
 pause_panel.hide()
 build_mixer()
func apply_character_settings(design,npc):
 var scene=chapters[1].landscape
 scene.knight_design=clampi(design,0,9)
 scene.npc_design=clampi(npc,0,7)
 scene.queue_redraw()
 scene.front.queue_redraw()
 design_picker.select(design_picker.get_item_index(scene.knight_design))
 npc_picker.select(npc_picker.get_item_index(scene.npc_design))
 appearance_preview.queue_redraw()
 save_preferences()
func apply_environment_settings(index):
 chapters[1].landscape.set_environment_design(index)
 environment_picker.select(environment_picker.get_item_index(index))
 save_preferences()
func apply_surface_settings(index):
 chapters[1].landscape.set_environment_feel(index)
 feel_picker.select(index)
 save_preferences()
func draw_appearance_preview():
 var old_ink=landscape.ink
 landscape.ink=appearance_preview
 appearance_preview.draw_rect(Rect2(0,0,560,168),Color("#0e1a26"))
 appearance_preview.draw_set_transform(Vector2(72,12),0,Vector2(5,5))
 for i in range(3):
  var pose=sim.p.duplicate(true)
  pose.merge({"vx":0 if i==0 else 90,"vy":0,"facing":-1 if i==2 else 1,"state":"normal","onGround":true,"tired":false,"parryTimer":0,"strikeTimer":0,"carrying":null,"dashes":1},true)
  landscape.draw_knight(pose,Vector2(i*32,0),preview_clock*65)
 appearance_preview.draw_set_transform(Vector2(40,150),0,Vector2(3,3))
 for i in range(preview_people.size()): landscape.draw_person(preview_people[i],Vector2(i*32,0),false)
 appearance_preview.draw_set_transform(Vector2.ZERO)
 landscape.ink=old_ink
func set_voices(value):
 audio.voices_enabled = value
 if not value: audio.speech.stop()
 save_preferences()
func save_preferences():
 if test_mode: return
 for bus in audio.levels: preferences.set_value("audio",bus,audio.levels[bus])
 preferences.set_value("audio","voices",audio.voices_enabled)
 preferences.set_value("audio_effects","levels",audio.effect_levels)
 preferences.set_value("display","reduced_motion",landscape.reduced_motion)
 preferences.set_value("display","walking_style",1)
 preferences.set_value("display","outskirts_npc_design",chapters[1].landscape.npc_design)
 preferences.set_value("display","outskirts_knight_design",chapters[1].landscape.knight_design)
 preferences.set_value("display","outskirts_environment",chapters[1].landscape.environment_design)
 preferences.set_value("display","outskirts_surface",chapters[1].landscape.environment_feel)
 preferences.save(preferences_path)
func toggle_fullscreen():
 DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED if DisplayServer.window_get_mode()==DisplayServer.WINDOW_MODE_FULLSCREEN else DisplayServer.WINDOW_MODE_FULLSCREEN)
func _unhandled_input(event):
 if event.is_echo(): return
 if event.is_action_pressed("knight_pause"):
  if mixer_panel!=null and mixer_panel.visible: close_mixer()
  else: set_paused(not paused)
  get_viewport().set_input_as_handled()
 elif event.is_action_pressed("knight_retry") and not paused: retry_room()
 elif event is InputEventKey and event.pressed:
  if chapter_number==4 and event.physical_keycode==KEY_N: workshop_room(1)
  elif chapter_number==4 and event.physical_keycode==KEY_H: show_workshop_hint()
  elif event.physical_keycode==KEY_F11: toggle_fullscreen()
  elif event.physical_keycode==KEY_M:
   if audio.levels.Music>0: mute_music_level=audio.levels.Music;audio.levels.Music=0.0
   else: audio.levels.Music=mute_music_level
   audio.apply_levels()
   sync_mixer()
   save_preferences()
func set_paused(value):
 if not value and mixer_panel!=null:
  mixer_panel.hide()
  audio.stop_previews()
 paused = value
 pause_panel.visible = value
 if value:
  for bus in volume_sliders: volume_sliders[bus].set_value_no_signal(audio.levels[bus])
 landscape.set_process(not value)
 audio.set_paused(value)

func show_subtitle(who,line,seconds):
 subtitle_name.text = who.to_upper()
 subtitle_text.text = line
 subtitle_text.visible_characters = -1
 subtitle_time = max(seconds+0.5,4.0)
 subtitle_age = 0.0
 subtitle_panel.show()
 landscape.speaker = who.to_lower()
func _process(delta):
 preview_clock+=delta
 if paused:
  appearance_preview.queue_redraw()
  return
 var frame_usec=Time.get_ticks_usec()
 if capture_path!="" and ticks>30:
  measured_frames.append(delta*1000)
  if last_frame_usec>0: real_frame_times.append((frame_usec-last_frame_usec)/1000.0)
 last_frame_usec=frame_usec
 notice_time=max(0,notice_time-delta)
 notice_label.modulate.a=min(1.0,notice_time)
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
  sim.world_context=world
  world.configure_live_core(sim)
  if world.seam_tiles.has(sim.room.id):
   world.set_seam(sim.room.id,true)
   sim.room=world.parsed[sim.room.id]
  hold = 0
  watch_button.text = "Watch solution" if chapter_number==4 else "Watch reference"
 else:
  watch = true
  load_section(current)
  if tape.is_empty(): next_section()
func load_section(index,smooth_join=false):
 current = index
 var id=data.world.rooms[index].id
 world.enter(id,true)
 sim=world.active()
 if watch:
  sim.autonomous_sweepers=false
  sim.pollen_config={}
  sim.white_flowers=[]
  sim.load_room(world.watch_room(id))
  if world.seam_tiles.has(id): world.set_seam(id,true)
  world.restore_progress(sim)
  sim.world_context=null
 else:
  world.configure_live_core(sim)
  sim.world_context=world
 landscape.load_scene(sim,smooth_join)
 audio.room_changed(sim)
 tape = []
 var recording=data.world.tapes.get(sim.room.id,[])
 if chapter_number==4: recording=workshop_recording()
 for part in recording:
  for i in range(int(part[0])): tape.append(part[1])
 tape_frame = 0
 hold = 0
 room_picker.select(index)
 watch_button.text = "Take control" if watch else ("Watch solution" if chapter_number==4 else "Watch reference")
 title.text = data.world.name.to_upper()+" · "+(("SOLUTION" if chapter_number==4 else "REFERENCE") if watch else "ASCEND")
 room_banner.text = sim.room.name.to_upper()
 banner_time = 2.4
 if chapter_number==4:
  notice_time=0
  quest_label.text=bearing_caption()

func workshop_room(direction):
 if chapter_number!=4: return
 watch=false
 load_section(posmod(current+direction,data.world.rooms.size()))
 set_paused(false)

func show_workshop_hint():
 if chapter_number!=4: return
 notice_label.text=sim.room.def.hint
 notice_time=12

func workshop_recording():
 var selected=max(0,workshop_demo_picker.selected)
 workshop_demo_picker.clear()
 var routes=sim.room.def.get("workshopRoutes",[])
 for route in routes: workshop_demo_picker.add_item("Demonstration · "+route.name)
 if routes.is_empty(): return data.world.tapes.get(sim.room.id,[])
 workshop_demo_picker.select(min(selected,routes.size()-1))
 return routes[workshop_demo_picker.selected].tape

func workshop_goal_reached():
 if chapter_number!=4 or not sim.p.onGround or sim.p.state in ["dead","respawn"]: return false
 if sim.room.def.get("workshopRequireShard",false) and not workshop_has_shard(): return false
 var goal=sim.room.def.workshopGoal
 return Rect2(goal[0],goal[1]-2,goal[2],goal[3]+4).has_point(Vector2(sim.p.x+sim.p.w/2.0,sim.p.y+sim.p.h))

func tick_workshop():
 if not workshop_goal_reached(): return
 var first_clear=not workshop_completed.has(sim.room.id)
 var shard_clear=workshop_has_shard() and not workshop_shards.has(sim.room.id)
 if not first_clear and not shard_clear: return
 workshop_completed[sim.room.id]=true
 if shard_clear: workshop_shards[sim.room.id]=true
 room_picker.set_item_text(current,("◆ " if workshop_shards.has(sim.room.id) else "✓ ")+"%02d · %s"%[current+1,sim.room.name])
 notice_label.text="Shard brought home · room complete" if sim.room.def.get("workshopRequireShard",false) else ("Finish reached with the shard · optional detour complete" if shard_clear else "Finish reached")
 notice_time=8
 audio.effect("gem",.6)

func workshop_has_shard():
 return chapter_number==4 and sim.ents.any(func(e):return e.type=="shard" and e.get("gone",false))
func input_now(): return Controls.read()
func decode(keys):
 var raw = {}
 var letters = {"l":"l","r":"r","u":"u","d":"d","jump":"j","dash":"x","grab":"g","strike":"s","parry":"p","portal":"q"}
 for key in letters: raw[key] = letters[key] in keys
 return raw
func _physics_process(_delta):
 if sim==null or paused: return
 var physics_start=Time.get_ticks_usec()
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
    world.tick_inactive()
    tape_frame += 1
  elif journey_frame<journey.size():
   world.step(decode(journey[journey_frame]))
   journey_frame+=1
  else: world.step(input_now())
  var effects = landscape.after_tick(before)
  audio.events(effects)
  audio.tick(sim,1.0/60.0)
  if not world.notices.is_empty():
   notice_label.text=world.notices.pop_front()
   notice_time=4.0
   audio.effect("quest",0.6)
  if watch and sim.exited: hold=45
  if not watch and world.update_region():
   sim=world.active()
   current=world.regions.find(world.active_id)
   landscape.sim=sim
   landscape.active_position=world.placements[world.active_id]
   landscape.snap_actor()
   room_picker.select(current)
   room_banner.text=sim.room.name.to_upper()
   banner_time=1.4
  if chapter_number==4 and not watch: tick_workshop()
  quest_label.text=bearing_caption()

 dash_label.text = "◆ DASH" if sim.p.dashes>0 else "◇ DASH"
 dash_label.modulate = Color("edbf74") if sim.p.dashes>0 else Color("687e91")
 death_label.text = "%d DEATHS" % sim.deaths
 if watch: status.text = "ORIGINAL ROUTE     ·     Esc opens the menu     ·     Take control to play the updated world"
 else: status.text = "← → MOVE     SPACE / C JUMP     D DASH     A CLING / CARRY     W STRIKE     R RETRY"
 if chapter_number==4: status.text="← → MOVE     SPACE JUMP     D + ARROWS DASH     A CLING     R RETRY     H HINT     Esc MENU"
 if chapter_number==4 and watch: status.text="DEMONSTRATION     ·     Esc → Take control to play     ·     R repeats the route"
 if capture_path!="" and ticks>30: measured_physics.append((Time.get_ticks_usec()-physics_start)/1000.0)
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
    if tape.is_empty() and watch: watch=false;sim.world_context=world;world.configure_live_core(sim);watch_button.text="Watch reference"
    return
 watch = false
func capture():
 if capture_menu: set_paused(true)
 await RenderingServer.frame_post_draw
 var result = get_viewport().get_texture().get_image().save_png(capture_path)
 if audio_capture_path!="": audio.save_capture(audio_capture_path)
 var report = {"fps":Engine.get_frames_per_second(),"audio":audio.counts,"presentation":landscape.observed,"shadow_occluders":landscape.occluder_count,"lights":landscape.lights.size(),"room":sim.room.id,"camera":[landscape.camera.x,landscape.camera.y]}
 report.frame_ms=timing_stats(measured_frames)
 report.wall_frame_ms=timing_stats(real_frame_times)
 report.refresh_hz=DisplayServer.screen_get_refresh_rate()
 report.vsync=DisplayServer.window_get_vsync_mode()
 report.chapter_render_modes={}
 for number in chapters: report.chapter_render_modes[number]=chapters[number].viewport.render_target_update_mode
 report.physics_ms=timing_stats(measured_physics)
 report.draw_calls=Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME)
 report.draw_cpu_us=landscape.draw_cpu_us
 report.engine_process_ms=Performance.get_monitor(Performance.TIME_PROCESS)*1000
 report.engine_physics_ms=Performance.get_monitor(Performance.TIME_PHYSICS_PROCESS)*1000
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

func bearing_caption():
 if chapter_number==4:
  if sim.room.def.get("workshopRequireShard",false):
   return "SHARD BROUGHT HOME" if workshop_shards.has(sim.room.id) else ("SHARD FOUND · BRING IT HOME" if workshop_has_shard() else "BRING THE FAR SHARD BACK TO THE FLAG")
  if not sim.ents.any(func(e):return e.type=="shard"):
   return "FINISH REACHED" if workshop_completed.has(sim.room.id) else "REACH THE GOLD FLAG"
  var shard="SHARD BANKED" if workshop_shards.has(sim.room.id) else ("SHARD FOUND · BRING IT TO THE FLAG" if workshop_has_shard() else "OPTIONAL SHARD")
  return ("FINISH REACHED" if workshop_completed.has(sim.room.id) else "REACH THE GOLD FLAG")+" · "+shard
 if sim.p.get("pollen",0)>0: return "WHITE FLOWER SAP · movement weakened · %.1fs"%(sim.p.pollen/60.0)
 if chapter_number>=21:
  var prefix="♥ %d · "%world.heart_count() if world.heart_count()>0 else ""
  if sim.oath_root!=null and not sim.oath_root.taken:
   return prefix+("OATHBLADE · Press ↑ near the freed blade" if sim.oath_root.released else "OATHBLADE · Stand on the root counterweight to free the blade")
  if sim.root_lash!=null and sim.root_lash.crown!=null and not sim.root_lash.crown.cut: return prefix+"Cut the root crown · the timed roots stop when it falls"
  if sim.sentinel!=null and not sim.sentinel.done: return prefix+"Ride the committed hammer or shoulders, then reach the bell"
  for reward in world.data.get("branchRewards",[]):
   if world.active_id in reward.rooms: return prefix+reward.title+(" · Heart earned" if world.branch_hearts.has(reward.id) else " · Optional heart")
  return prefix+sim.room.def.get("hint",world.data.world.name)
 if chapter_number==3:
  var prefix="♥ %d · "%world.heart_count() if world.heart_count()>0 else ""
  if world.quest_complete: return prefix+"The Clockwork Defector complete"
  if world.quest_key: return prefix+"SILAS · Hang the winding key on the toll hook"
  if world.silas_step==1: return prefix+"SILAS · The governor stopped · take the key from Silas"
  if world.silas_met: return prefix+"SILAS · Strike the governor’s bright tooth"
  return prefix+"BROKEN CAUSEWAY · Speak with Silas on the patrol road"
 if chapter_number==2:
  var prefix="♥ %d · "%world.heart_count() if world.heart_count()>0 else ""
  if world.quest_complete: return prefix+"A Place for Supper complete"
  if world.quest_lantern: return prefix+"ELSIE · Bring the lantern home · falling lets the moths take it back"
  if world.elsie_met: return prefix+"ELSIE · Follow the lantern moths through her branch"
  return prefix+"BLACK WOODS · Speak with Elsie at her kitchen"
 var parts=[]
 for name in ["ASH","GLASS","IRON"]: parts.append(("◆ " if world.bearings.has(name) else "◇ ")+name)
 return "MARA · "+"   ".join(parts)
func retry_room():
 if watch:
  load_section(current)
  return
 world.retry()
 sim=world.active()
 landscape.snap_actor()
func restart_world():
 if chapter_number==4:
  workshop_completed.clear()
  workshop_shards.clear()
  for i in range(data.world.rooms.size()): room_picker.set_item_text(i,"%02d · %s"%[i+1,data.world.rooms[i].name])
 world.restart()
 audio.restart_world()
 subtitle_panel.hide()
 subtitle_time=0
 landscape.speaker=""
 landscape.clock=0
 ticks=0
 hold=0
 tape=[]
 tape_frame=0
 watch=false
 watch_button.text="Watch solution" if chapter_number==4 else "Watch reference"
 title.text=data.world.name.to_upper()+" · ASCEND"
 current=0
 sim=world.active()
 landscape.runtime=world
 landscape.load_scene(sim)
 room_picker.select(0)
 room_banner.text=sim.room.name.to_upper()
 banner_time=2.4
 quest_label.text=bearing_caption()
 notice_label.text="A new journey · "+data.world.name
 notice_time=3
 set_paused(false)

func switch_chapter(number):
 if number==chapter_number or not chapters.has(number): return
 var old=chapters[chapter_number]
 old.container.hide()
 old.viewport.render_target_update_mode=SubViewport.UPDATE_DISABLED
 old.landscape.set_process(false)
 old.landscape.process_mode=Node.PROCESS_MODE_DISABLED
 for item in old.landscape.lights:
  item.node.hide()
  item.sparks.emitting=false
 old.landscape.wind.emitting=false
 chapter_number=number
 var chapter=chapters[number]
 world=chapter.world
 data=world.data
 sim=world.active()
 sim.world_context=world
 world.configure_live_core(sim)
 landscape=chapter.landscape
 viewport=chapter.viewport
 audio.world_runtime=world
 audio.change_chapter(number)
 chapter.container.show()
 viewport.render_target_update_mode=SubViewport.UPDATE_ALWAYS
 landscape.process_mode=Node.PROCESS_MODE_INHERIT
 landscape.set_process(not paused)
 landscape.load_scene(sim)
 current=world.regions.find(world.active_id)
 watch=false
 tape=[]
 hold=0
 tape_frame=0
 watch_button.text="Watch solution" if number==4 else "Watch reference"
 room_picker.clear()
 for i in range(data.world.rooms.size()): room_picker.add_item(("◆ " if number==4 and workshop_shards.has(data.world.rooms[i].id) else ("✓ " if number==4 and workshop_completed.has(data.world.rooms[i].id) else ""))+"%02d · %s" % [i+1,data.world.rooms[i].get("name",data.world.rooms[i].id)])
 room_picker.select(current)
 chapter_picker.select(CHAPTERS.find(number))
 design_picker.disabled=number!=1
 npc_picker.disabled=number!=1
 environment_picker.disabled=number!=1
 feel_picker.disabled=number!=1
 design_picker.select(design_picker.get_item_index(landscape.knight_design))
 npc_picker.select(npc_picker.get_item_index(landscape.npc_design))
 title.text=data.world.name.to_upper()+" · ASCEND"
 pause_title.text=data.world.name.to_upper()
 pause_description.text="A road through the old watch · Ascend" if number==1 else ("Moths, pale resin and the lantern tree · Ascend" if number==2 else "Iron, counterweights and the toll road · Ascend")
 if number>=21: pause_description.text="The remembered road · Fractured Ascend"
 workshop_controls.visible=number==4
 workshop_demo_picker.visible=number==4
 workshop_previous.visible=number==4 and data.world.rooms.size()>1
 workshop_next.visible=workshop_previous.visible
 if number==4:
  pause_description.text="Four movement puzzles · N for next room · H for a hint"
  workshop_recording()
 room_banner.text=sim.room.name.to_upper()
 banner_time=2.4
 subtitle_panel.hide()
 subtitle_time=0
 quest_label.text=bearing_caption()

func _exit_tree():
 for chapter in chapters.values(): chapter.world.shutdown()

func timing_stats(samples):
 if samples.is_empty(): return {}
 var ordered=samples.duplicate()
 ordered.sort()
 return {"samples":ordered.size(),"median":ordered[int(ordered.size()*0.5)],"p95":ordered[min(ordered.size()-1,int(ordered.size()*0.95))],"p99":ordered[min(ordered.size()-1,int(ordered.size()*0.99))],"worst":ordered[-1]}

func sync_mixer():
 for bus in volume_sliders:
  volume_sliders[bus].set_value_no_signal(audio.levels[bus])
  mixer_level_labels[bus].text=str(roundi(audio.levels[bus]*100))+"%"
func open_mixer():
 set_paused(true)
 pause_panel.hide()
 mixer_panel.show()
 sync_mixer()
 update_effect_mixer()
func close_mixer():
 audio.stop_previews()
 mixer_panel.hide()
 pause_panel.show()
func update_effect_mixer():
 if mixer_effect_picker.selected<0: return
 var name=mixer_effect_names[mixer_effect_picker.selected]
 var level=float(audio.effect_levels.get(name,1.0))
 mixer_effect_slider.set_value_no_signal(level)
 mixer_effect_label.text=mixer_effect_picker.get_item_text(mixer_effect_picker.selected)+" · "+("Disabled" if level<=0 else str(roundi(level*100))+"%")
 var bus="Efforts" if name.begins_with("kn-") else "Interface" if name.begins_with("ui-") else "Effects"
 if audio.levels[bus]<=0 or audio.levels.Master<=0: mixer_effect_label.text+=" · channel muted"
func build_mixer():
 mixer_panel=Control.new()
 mixer_panel.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
 root_ui.add_child(mixer_panel)
 var scrim=ColorRect.new()
 scrim.color=Color(.02,.04,.07,.92)
 scrim.size=Vector2(1280,832)
 mixer_panel.add_child(scrim)
 var card=PanelContainer.new()
 card.position=Vector2(250,20)
 card.size=Vector2(780,792)
 card.add_theme_stylebox_override("panel",style("#14232e","#697b77",10))
 mixer_panel.add_child(card)
 var scroll=ScrollContainer.new()
 scroll.horizontal_scroll_mode=ScrollContainer.SCROLL_MODE_DISABLED
 card.add_child(scroll)
 var column=VBoxContainer.new()
 column.size_flags_horizontal=Control.SIZE_EXPAND_FILL
 column.add_theme_constant_override("separation",6)
 scroll.add_child(column)
 text(column,"SOUND MIXER",24,"#e4d6ad")
 button(column,"Back to pause",close_mixer,false)
 text(column,"Zero mutes a channel. Changes save automatically.",15,"#a8b8bc")
 for bus in audio.levels:
  var row=HBoxContainer.new()
  column.add_child(row)
  var label=text(row,{"Efforts":"Knight efforts","Interface":"Menu sounds"}.get(bus,bus),16)
  label.custom_minimum_size.x=150
  var slider=HSlider.new()
  slider.custom_minimum_size=Vector2(450,30)
  slider.max_value=1
  slider.step=.01
  slider.value=audio.levels[bus]
  volume_sliders[bus]=slider
  var percent=text(row,str(roundi(slider.value*100))+"%",14,"#a8b8bc")
  mixer_level_labels[bus]=percent
  slider.value_changed.connect(func(value):
   audio.levels[bus]=value
   audio.apply_levels()
   percent.text=str(roundi(value*100))+"%"
   update_effect_mixer()
   save_preferences())
  row.add_child(slider)
 text(column,"INDIVIDUAL EFFECTS",18,"#e4d6ad")
 text(column,"Pick an effect, adjust its level, then Preview. Zero disables it.",14,"#a8b8bc")
 mixer_effect_picker=OptionButton.new()
 mixer_effect_names=audio.manifest.effects.keys()
 mixer_effect_names.sort()
 for name in mixer_effect_names: mixer_effect_picker.add_item(name.replace("kn-","Knight effort · ").replace("ui-","Interface · ").replace("-"," "))
 column.add_child(mixer_effect_picker)
 mixer_effect_label=text(column,"",15,"#d0c19d")
 mixer_effect_slider=HSlider.new()
 mixer_effect_slider.max_value=1
 mixer_effect_slider.step=.01
 mixer_effect_slider.custom_minimum_size.y=30
 column.add_child(mixer_effect_slider)
 mixer_effect_picker.item_selected.connect(func(_i):audio.stop_previews();update_effect_mixer())
 mixer_effect_slider.value_changed.connect(func(value):
  audio.set_effect_level(mixer_effect_names[mixer_effect_picker.selected],value)
  update_effect_mixer()
  save_preferences())
 var preview=HBoxContainer.new()
 column.add_child(preview)
 button(preview,"Preview effect / next take",func():audio.preview_effect(mixer_effect_names[mixer_effect_picker.selected]),false)
 button(preview,"Stop preview",audio.stop_previews,false)
 var beds=HBoxContainer.new()
 column.add_child(beds)
 button(beds,"Preview music",func():audio.preview_path(audio.manifest.chapters[str(chapter_number)].music,"Music"),false)
 button(beds,"Preview ambience",func():audio.preview_path(audio.manifest.chapters[str(chapter_number)].ambience,"Ambience"),false)
 button(beds,"Preview dialogue",func():audio.preview_path(audio.manifest.voices.values()[0].path,"Voices"),false)
 button(column,"Restore mixer defaults",func():
  audio.effect_levels.clear()
  audio.refresh_effect_levels()
  var defaults={"Master":1.0,"Music":.55,"Effects":.7,"Voices":.9,"Ambience":.4,"Efforts":.7,"Interface":.7}
  for bus in defaults:
   audio.levels[bus]=defaults[bus]
   volume_sliders[bus].value=defaults[bus]
  audio.apply_levels()
  update_effect_mixer()
  save_preferences(),false)
 update_effect_mixer()
 mixer_panel.hide()
