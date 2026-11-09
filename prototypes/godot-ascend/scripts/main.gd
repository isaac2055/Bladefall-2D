extends Node
const World = preload("res://scripts/world.gd")
const Core = preload("res://scripts/core.gd")
const Loader = preload("res://scripts/room_loader.gd")
const Landscape = preload("res://scripts/landscape.gd")
const Controls = preload("res://scripts/controls.gd")
const Sound = preload("res://scripts/audio.gd")
const SectionMenu = preload("res://scripts/section_menu.gd")
const CampaignWorkshop = preload("res://scripts/campaign_workshop.gd")
var sampler=preload("res://scripts/sampler_run.gd").new()
var sampler_overlay
var story
var dev_mode=false
var dev_nodes=[]
var gameplay_settings_nodes=[]
var hud_nodes=[]
var title_subtitle_visible=false
var garden_button:Button
var settings_back:Button
var settings_card:PanelContainer
var settings_scroll:ScrollContainer
const SaveState=preload("res://scripts/world_save.gd")
var game_started=false
var save_room=""
var save_frame=0
var save_deaths=-1
var save_checkpoint=-2
var save_riding=false
var basic_volume_sliders={}
var dev_taps=0
var dev_last_tap=0
var voices_button:CheckBox
var controls_menu
var title_screen
var watch_origin=""
var section_heading:Label
var focus_resume:Button
var campaign_up_held=false
var data
var world
const CHAPTERS=[1,2,3,21,22,23,101,102,103]
var workshop_completed={}
var workshop_shards={}
var puzzle_hint_button:Button
var workshop_controls:HBoxContainer
var workshop_demo_picker:OptionButton
var workshop_previous:Button
var workshop_next:Button
var chapters = {}
var chapter_number = 1
var cover_comparison=false
var causeway_launch_rooms=false
var weight_comparison=false
var initial_world=1
var initial_room=""
var chapter_picker: OptionButton
var pause_title: Label
var pause_description: Label
var quest_label: Label
var notice_label: Label
var notice_time=0.0
var hint_room_id=""
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
 b.focus_mode = Control.FOCUS_ALL
 b.add_theme_font_size_override("font_size",16)
 b.add_theme_stylebox_override("normal",style("#182831","#3e5157"))
 b.add_theme_stylebox_override("hover",style("#293c41","#d1b478"))
 b.add_theme_stylebox_override("pressed",style("#435148","#e5cf93"))
 b.pressed.connect(func():
  reset_dev_taps()
  if sound: audio.effect("ui-select",0.6)
  callback.call())
 parent.add_child(b)
 return b
func _ready():
 get_tree().auto_accept_quit = false
 DisplayServer.window_set_title("Bladefall")
 dev_mode=test_mode or initial_room!="" or initial_world!=1 or "--world" in OS.get_cmdline_user_args() or "--room" in OS.get_cmdline_user_args() or "--capture" in OS.get_cmdline_user_args()
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
 audio.voices_enabled = preferences.get_value("audio","voices",false) if preferences.get_value("audio","speech_default_v46",false) else false
 preferences.set_value("audio","speech_default_v46",true)
 audio.effect_levels=preferences.get_value("audio_effects","levels",{}).duplicate(true)
 audio.effect_levels.erase("ui-pause")
 add_child(audio)
 cover_comparison=cover_comparison or "--cover-comparison" in OS.get_cmdline_user_args()
 causeway_launch_rooms=causeway_launch_rooms or "--causeway-launch-rooms" in OS.get_cmdline_user_args()
 weight_comparison=weight_comparison or "--weight-comparison" in OS.get_cmdline_user_args()
 # Construct all chapters before play; selecting a chapter preserves its live state.
 for number in CHAPTERS:
  var chapter_data=data if number==1 else JSON.parse_string(FileAccess.get_file_as_string("res://data/world%d.json"%number))
  if number==23 and weight_comparison: chapter_data=JSON.parse_string(FileAccess.get_file_as_string("res://data/causeway-weight-comparison.json"))
  elif number==23 and causeway_launch_rooms: chapter_data=JSON.parse_string(FileAccess.get_file_as_string("res://data/causeway-launch-rooms.json"))
  elif number==23 and cover_comparison: chapter_data=JSON.parse_string(FileAccess.get_file_as_string("res://data/causeway-cover-comparison.json"))
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
  scene.knight_design=5
  scene.npc_design=7
  scene.environment_design=0
  scene.environment_feel=2
  scene.player_styles_locked=not dev_mode
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
 sampler.start(world,not watch and initial_room=="" and current==0 and journey.is_empty())
 if "--room" in args or "--watch" in args or "--tour" in args or "--fractured-tour" in args: sampler.invalidate()
 world.sampler_practice=not sampler.profile.run.eligible
 landscape.sampler=sampler
 sampler_overlay=preload("res://scripts/sampler_overlay.gd").new()
 sampler_overlay.app=self
 root_ui.add_child(sampler_overlay)
 controls_menu=preload("res://scripts/controls_menu.gd").new()
 controls_menu.app=self
 add_child(controls_menu)
 title_screen=preload("res://scripts/front_end.gd").new()
 title_screen.app=self
 add_child(title_screen)
 story=preload("res://scripts/road_story.gd").new()
 story.app=self
 add_child(story)
 controls_menu.move_to_front()
 game_started=test_mode or dev_mode
 apply_player_visibility()
 if not dev_mode:
  sampler.profile.discover(chapter_number,world.active_id,false)
  rebuild_world_menu()
  rebuild_section_menu()
 if not test_mode and not dev_mode: title_screen.open(true)
 else: title_screen.hide()
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
 settings_card=card
 card.position = Vector2(330,24)
 card.size = Vector2(620,784)
 card.add_theme_stylebox_override("panel",style("#14232e","#697b77",10))
 pause_panel.add_child(card)
 var scroll=ScrollContainer.new()
 settings_scroll=scroll
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
 focus_resume=button(row,"Resume",func():set_paused(false),false)
 gameplay_settings_nodes.append(row)
 settings_back=button(column,"Back",func():set_paused(false),false)
 button(row,"Retry · R",func():retry_room();set_paused(false))
 watch_button = button(row,"Watch reference",func():toggle_watch();set_paused(false))
 puzzle_hint_button=button(row,"Hint · H",func():show_workshop_hint();set_paused(false))
 puzzle_hint_button.hide()
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
 dev_nodes.append(button(column,"Sound mixer · channels and individual effects",open_mixer,false))
 restart_button=button(column,"Start world over",restart_world)
 gameplay_settings_nodes.append(restart_button)
 chapter_picker=OptionButton.new()
 chapter_picker.focus_mode=Control.FOCUS_ALL
 rebuild_world_menu()
 chapter_picker.item_selected.connect(func(index):switch_chapter(chapter_picker.get_item_id(index));set_paused(false))
 column.add_child(chapter_picker)
 gameplay_settings_nodes.append(chapter_picker)
 section_heading=text(column,"EXPLORE A SECTION · PRACTICE",12,"#bba984")
 gameplay_settings_nodes.append(section_heading)
 room_picker = OptionButton.new()
 room_picker.custom_minimum_size = Vector2(560,40)
 room_picker.focus_mode = Control.FOCUS_ALL
 room_picker.fit_to_longest_item=false
 rebuild_section_menu()
 room_picker.item_selected.connect(func(index):
  if watch: toggle_watch()
  load_section(room_picker.get_item_id(index))
  notice_label.text="Section practice · Start world over for a full journey and rewards"
  notice_time=5
  set_paused(false))
 column.add_child(room_picker)
 gameplay_settings_nodes.append(room_picker)
 dev_nodes.append(text(column,"APPEARANCE",12,"#bba984"))
 dev_nodes.append(text(column,"Walking · Measured",14,"#a6b7bb"))
 design_picker=OptionButton.new()
 for id in Landscape.KnightStyles.CHOICES: design_picker.add_item("Knight · "+Landscape.KnightStyles.NAMES[id],id)
 design_picker.select(design_picker.get_item_index(landscape.knight_design))
 design_picker.item_selected.connect(func(index):apply_character_settings(design_picker.get_item_id(index),chapters[1].landscape.npc_design))
 column.add_child(design_picker)
 dev_nodes.append(design_picker)
 npc_picker=OptionButton.new()
 for id in Landscape.Styles.CHOICES: npc_picker.add_item("People · "+Landscape.Styles.NAMES[id],id)
 npc_picker.select(npc_picker.get_item_index(landscape.npc_design))
 npc_picker.item_selected.connect(func(index):apply_character_settings(chapters[1].landscape.knight_design,npc_picker.get_item_id(index)))
 column.add_child(npc_picker)
 dev_nodes.append(npc_picker)
 environment_picker=OptionButton.new()
 for id in Landscape.Themes.CHOICES: environment_picker.add_item("Scenery · "+Landscape.Themes.NAMES[id],id)
 environment_picker.select(environment_picker.get_item_index(chapters[1].landscape.environment_design))
 environment_picker.item_selected.connect(func(index):apply_environment_settings(environment_picker.get_item_id(index)))
 column.add_child(environment_picker)
 dev_nodes.append(environment_picker)
 feel_picker=OptionButton.new()
 for label in Landscape.Themes.FEELS: feel_picker.add_item("Treatment · "+label)
 feel_picker.select(chapters[1].landscape.environment_feel)
 feel_picker.item_selected.connect(apply_surface_settings)
 column.add_child(feel_picker)
 dev_nodes.append(feel_picker)
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
 dev_nodes.append(appearance_preview)
 dev_nodes.append(text(column,"Idle / walk / turn · People preview below",12,"#90a6ac"))
 var voices = CheckBox.new()
 voices_button=voices
 voices.text = "Spoken dialogue (subtitles stay on)"
 voices.button_pressed = audio.voices_enabled
 voices.toggled.connect(set_voices)
 voices.pressed.connect(register_dev_tap)
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
 dev_nodes.append(button(light_row,"Lighting on / off",func():landscape.lit = not landscape.lit))
 button(light_row,"Fullscreen · F11",toggle_fullscreen)
 var controls_hint=text(column,"",14,"#b5c0bd")
 dev_nodes.append(controls_hint)
 controls_hint.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART
 controls_hint.text="Use Controls and remapping to see or change your bindings. Controller menus: stick / D-pad, A to select, B to go back."
 var basic_audio=HBoxContainer.new()
 column.add_child(basic_audio)
 for bus in ["Master","Music"]:
  text(basic_audio,bus,14,"#b5c0bd")
  var slider=HSlider.new()
  slider.custom_minimum_size=Vector2(180,25)
  slider.min_value=0;slider.max_value=1;slider.step=.05;slider.value=audio.levels[bus]
  slider.value_changed.connect(func(value):audio.levels[bus]=value;audio.apply_levels();save_preferences())
  basic_audio.add_child(slider)
  basic_volume_sliders[bus]=slider
 button(column,"Controls and remapping",func():controls_menu.open(),false)
 garden_button=button(column,"Garden & records",func():sampler_overlay.open_garden(),false)
 gameplay_settings_nodes.append(button(column,"Title menu",func():title_screen.open(false),false))
 button(column,"Quit game",func():close_app(),false)
 dev_nodes.append(button(column,"Leave developer mode",func():set_dev_mode(false),false))
 hud_nodes=[header,quest_label,notice_label,room_banner,status]
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
 if event.is_action_pressed("knight_pause") or paused and event.is_action_pressed("ui_cancel"):
  if controls_menu!=null and controls_menu.visible:
   controls_menu.close()
  elif sampler_overlay!=null and sampler_overlay.panel.visible: sampler_overlay.close()
  elif mixer_panel!=null and mixer_panel.visible: close_mixer()
  elif title_screen!=null and title_screen.visible: title_screen.show_title()
  else: set_paused(not paused)
  get_viewport().set_input_as_handled()
 elif event.is_action_pressed("knight_retry") and not paused: retry_room()
 elif event is InputEventKey and event.pressed:
  if (dev_mode or test_mode) and chapter_number!=4 and not (cover_comparison or causeway_launch_rooms or weight_comparison) and event.physical_keycode==KEY_N and not paused:
   developer_next()
  elif (chapter_number==4 or (cover_comparison or causeway_launch_rooms or weight_comparison) and chapter_number==23) and event.physical_keycode==KEY_N: workshop_room(1)
  elif event.physical_keycode==KEY_H and (is_workshop_room() or sim.room.def.get("puzzleStudy",false)): show_workshop_hint()
  elif event.physical_keycode==KEY_F11: toggle_fullscreen()
  elif event.physical_keycode==KEY_M:
   if audio.levels.Music>0: mute_music_level=audio.levels.Music;audio.levels.Music=0.0
   else: audio.levels.Music=mute_music_level
   audio.apply_levels()
   sync_mixer()
   save_preferences()
func set_paused(value):
 if not value and watch and not dev_mode and (sim.exited or tape_frame>=tape.size()): value=true
 if value: maybe_autosave(true)
 if title_screen!=null and title_screen.visible and not value:
  paused=true
  pause_panel.hide()
  root_ui.hide()
  title_screen.play.grab_focus()
  return
 if not value and mixer_panel!=null:
  mixer_panel.hide()
  audio.stop_previews()
 paused = value
 pause_panel.visible = value
 if value:
  rebuild_world_menu()
  rebuild_section_menu()
  apply_player_visibility()
  focus_pause()
  for bus in volume_sliders: volume_sliders[bus].set_value_no_signal(audio.levels[bus])
  for bus in basic_volume_sliders: basic_volume_sliders[bus].set_value_no_signal(audio.levels[bus])
 apply_player_visibility()
 landscape.set_process(not value)
 audio.set_paused(value)
 if title_screen!=null and title_screen.visible: audio.music.stream_paused=false

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
  if dev_mode: appearance_preview.queue_redraw()
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
 if dev_mode:
  sampler.invalidate()
  world.sampler_practice=true
 if watch:
  if dev_mode:
   var snapshot=sim.p.duplicate(true)
   watch=false
   sim=world.active()
   sim.p=snapshot
   sim.world_context=world
   world.configure_live_core(sim)
   landscape.runtime=world
   landscape.load_scene(sim)
  else:
   watch=false
   sampler.retry(world)
   sim=world.active()
   current=world.regions.find(world.active_id)
   sim.world_context=world
   world.configure_live_core(sim)
   landscape.runtime=world
   landscape.load_scene(sim)
  hold=0
  tape=[]
  watch_origin=""
  watch_button.text="Watch reference"
  title.text=data.world.name.to_upper()+" · ASCEND"
  status.text=Controls.prompt()
  subtitle_panel.hide()
  subtitle_time=0
  return
 watch_origin=world.active_id
 var id=data.world.rooms[current].id
 var recording=data.world.tapes.get(id,[])
 if recording.is_empty() and not dev_mode:
  notice_label.text="No reference for this section."
  notice_time=3
  return
 watch=true
 load_section(current)
 if tape.is_empty() and dev_mode: next_section()
func load_section(index,smooth_join=false):
 if index<0 or index>=data.world.rooms.size(): return
 var id=data.world.rooms[index].id
 if not dev_mode and not sampler.profile.has_room(chapter_number,id) and id!=world.data.world.get("atlasStart",""): return
 if not watch:
  maybe_autosave(true)
  sampler.invalidate()
  world.sampler_practice=true
 if chapter_number!=4: watch_button.disabled=false
 current=index
 if watch:
  if watch_origin=="": watch_origin=world.active_id
  sim=Core.new(data.constants.duplicate(true),data.playerDefaults.duplicate(true))
  sim.load_room(world.watch_room(id).duplicate(true))
  sim.autonomous_sweepers=false
  sim.pollen_config={}
  sim.white_flowers=[]
  sim.world_context=null
  landscape.runtime=null
 else:
  world.enter(id,true)
  sim=world.active()
  world.configure_live_core(sim)
  sim.world_context=world
  landscape.runtime=world
 landscape.load_scene(sim,smooth_join)
 audio.room_changed(sim)
 tape = []
 var recording=data.world.tapes.get(sim.room.id,[])
 if is_workshop_room(): recording=workshop_recording()
 for part in recording:
  for i in range(int(part[0])): tape.append(part[1])
 tape_frame = 0
 hold = 0
 select_section_menu()
 clear_other_room_hint()
 puzzle_hint_button.visible=sim.room.def.get("puzzleStudy",false) or sim.room.def.get("campaignWorkshop",false)
 watch_button.text = ("Take control" if dev_mode else "Try yourself") if watch else ("Watch solution" if is_workshop_room() else "Watch reference")
 title.text = data.world.name.to_upper()+" · "+(("SOLUTION" if chapter_number==4 else "REFERENCE") if watch else "ASCEND")
 room_banner.text = sim.room.name.to_upper()
 banner_time = 2.4
 workshop_demo_picker.visible=dev_mode and is_workshop_room()
 if is_workshop_room():
  notice_time=0
  quest_label.text=bearing_caption()

func workshop_room(direction):
 if chapter_number!=4 and not ((cover_comparison or causeway_launch_rooms or weight_comparison) and chapter_number==23): return
 watch=false
 load_section(posmod(current+direction,data.world.rooms.size()))
 set_paused(false)

func clear_other_room_hint():
 if hint_room_id!="" and hint_room_id!=sim.room.id:
  notice_time=0
  notice_label.text=""
  notice_label.modulate.a=0
  hint_room_id=""

func show_workshop_hint():
 if not is_workshop_room() and not sim.room.def.get("puzzleStudy",false): return
 hint_room_id=sim.room.id
 notice_label.text=sim.room.def.hint
 notice_time=12

func workshop_recording():
 var selected=max(0,workshop_demo_picker.selected)
 workshop_demo_picker.clear()
 var routes=sim.room.def.get("workshopRoutes",[])
 for route in routes: workshop_demo_picker.add_item("Demonstration · "+route.name)
 watch_button.disabled=routes.is_empty() and data.world.tapes.get(sim.room.id,[]).is_empty()
 if routes.is_empty(): return data.world.tapes.get(sim.room.id,[])
 workshop_demo_picker.select(min(selected,routes.size()-1))
 return routes[workshop_demo_picker.selected].tape

const WorkshopPickups=preload("res://scripts/workshop_pickups.gd")

func is_workshop_room():
 return chapter_number==4 or (cover_comparison or causeway_launch_rooms or weight_comparison) and chapter_number==23 or sim.room.def.get("campaignWorkshop",false)

func workshop_goal_reached():
 return is_workshop_room() and CampaignWorkshop.goal_reached(sim)

func tick_workshop():
 if not workshop_goal_reached(): return
 if sim.room.def.get("campaignWorkshop",false):
  if not world.campaign_completed.has(sim.room.id):
   world.campaign_completed[sim.room.id]=true
   rebuild_section_menu()
   notice_label.text="Room complete · Up at the flag to continue"
   notice_time=8
   audio.effect("gem",.6)
  return
 var first_clear=not workshop_completed.has(sim.room.id)
 var shard_clear=workshop_has_shard() and not workshop_shards.has(sim.room.id)
 if not first_clear and not shard_clear: return
 workshop_completed[sim.room.id]=true
 if shard_clear: workshop_shards[sim.room.id]=true
 rebuild_section_menu()
 notice_label.text="All %d shards brought home · room complete"%WorkshopPickups.counts(sim.ents)[1] if sim.room.def.get("workshopRequireAllShards",false) else sim.room.def.get("workshopCompleteText","Shard brought home · room complete") if sim.room.def.get("workshopRequireShard",false) else ("Finish reached with the shard · optional detour complete" if shard_clear else "Finish reached")
 notice_time=8
 audio.effect("gem",.6)

func workshop_has_shard():
 return is_workshop_room() and sim.ents.any(func(e):return e.type=="shard" and e.get("gone",false))
func input_now(): return Controls.read()
func decode(keys):
 var raw = {}
 var letters = {"l":"l","r":"r","u":"u","d":"d","jump":"j","dash":"x","grab":"g","strike":"s","parry":"p","portal":"q"}
 for key in letters: raw[key] = letters[key] in keys
 return raw
func _physics_process(_delta):
 if sim==null or paused: return
 if story!=null and story.physics_tick(_delta): return
 var physics_start=Time.get_ticks_usec()
 ticks += 1
 if (not sampler.ride.is_empty() or sampler.failure_frames>0) and not watch:
  landscape.previous_actor=landscape.current_actor
  var state=sampler.tick(world)
  if state in ["landed","reset"]: sync_sampler_scene()
  if state=="ride":
   var at=sampler.ride_point()
   landscape.current_actor=at
  maybe_autosave()
  return
 if hold>0:
  landscape.previous_actor = landscape.current_actor
  hold -= 1
  if hold==0 and watch:
   set_paused(true)
   watch_button.grab_focus()
 else:
  var before = landscape.before_tick()
  var live_input=input_now()
  if watch:
   if tape_frame<tape.size():
    sim.step(decode(tape[tape_frame]))
    tape_frame += 1
  elif journey_frame<journey.size():
   world.step(decode(journey[journey_frame]))
   journey_frame+=1
  else: world.step(live_input)
  var effects = landscape.after_tick(before)
  audio.events(effects)
  if not watch: audio.tick(sim,1.0/60.0)
  if not watch and not world.notices.is_empty():
   hint_room_id=""
   notice_label.text=world.notices.pop_front()
   notice_time=4.0
   audio.effect("quest",0.6)
  if watch and sim.exited and hold==0: hold=45
  if not watch and world.update_region():
   sim=world.active()
   current=world.regions.find(world.active_id)
   landscape.sim=sim
   landscape.active_position=world.placements[world.active_id]
   landscape.snap_actor()
   select_section_menu()
   clear_other_room_hint()
   puzzle_hint_button.visible=sim.room.def.get("puzzleStudy",false) or sim.room.def.get("campaignWorkshop",false)
   room_banner.text=sim.room.name.to_upper()
   banner_time=1.4
  if is_workshop_room() and not watch: tick_workshop()
  if not watch:
   if not dev_mode: discover_current()
   var event=sampler.tick(world,not journey.is_empty())
   if event in ["reset","landed"]: sync_sampler_scene()
  if not dev_mode: sampler.profile.collect_hearts(world)
  maybe_autosave()
  quest_label.text=bearing_caption()

 dash_label.text = "◆ DASH" if sim.p.dashes>0 else "◇ DASH"
 dash_label.modulate = Color("edbf74") if sim.p.dashes>0 else Color("687e91")
 death_label.text = "%d DEATHS" % sim.deaths
 if watch: status.text = "REFERENCE · Start / Esc opens the menu · "+("Take control" if dev_mode else "Try yourself to restart this section")
 else: status.text = Controls.prompt()+(" · N Next (awards enabled)" if dev_mode else "")
 if chapter_number==4: status.text="← → MOVE     SPACE JUMP     D + ARROWS DASH     A CLING     R RETRY     H HINT     Esc MENU"
 if chapter_number==4 and sim.room.def.get("workshopBiome","")=="woods": status.text="← → MOVE   SPACE JUMP   D DASH   A CLING   W + ARROWS CUT   R RETRY   H HINT   Esc MENU"
 if chapter_number==4 and watch: status.text="DEMONSTRATION · Esc opens the menu"
 if capture_path!="" and ticks>30: measured_physics.append((Time.get_ticks_usec()-physics_start)/1000.0)
 if capture_path!="" and ticks==screenshot_after: capture.call_deferred()
func campaign_travel(raw):
 var pressed=raw.get("u",false)
 var rising=pressed and not campaign_up_held
 campaign_up_held=pressed
 if not rising or not data.world.has("campaignWorkshop"): return
 var route=data.world.campaignWorkshop
 var target=""
 if sim.room.id==route.entry:
  var feet=Vector2(sim.p.x+sim.p.w/2.0,sim.p.y+sim.p.h)
  var spawn=Vector2(sim.room.spawn.x+sim.p.w/2.0,sim.room.spawn.y+sim.p.h)
  if sim.p.onGround and sim.p.state not in ["dead","respawn"] and feet.distance_to(spawn)<=24: target=route.rooms[0]
 elif sim.room.def.get("campaignWorkshop",false) and workshop_goal_reached():
  var index=route.rooms.find(sim.room.id)
  target=route.rooms[index+1] if index+1<route.rooms.size() else route.entry
 if target=="": return
 watch=false
 for i in range(data.world.rooms.size()):
  if data.world.rooms[i].id==target:
   load_section(i)
   break

func next_section():
 if not dev_mode: return
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
func select_section_menu():
 var menu_index=room_picker.get_item_index(current)
 room_picker.select(menu_index)
 if menu_index<0:
  room_picker.select(-1)
  room_picker.text="Connecting passage" if dev_mode else "Sections visited"

func rebuild_section_menu():
 room_picker.clear()
 for entry in SectionMenu.entries(data):
  var id=data.world.rooms[entry.index].id
  if not dev_mode and not sampler.profile.has_room(chapter_number,id): continue
  var mark=""
  if chapter_number==4:
   mark="◆ " if workshop_shards.has(id) else ("✓ " if workshop_completed.has(id) else "")
  if world.campaign_completed.has(id): mark="✓ "
  var label=entry.label if dev_mode else "%02d · %s"%[room_picker.item_count+1,data.world.rooms[entry.index].name]
  room_picker.add_item(mark+label,entry.index)
 select_section_menu()

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
 elif what==NOTIFICATION_APPLICATION_FOCUS_OUT and is_node_ready() and not paused: set_paused(true)
func close_app(code=0):
 if closing: return
 maybe_autosave(true)
 closing = true
 paused = true
 set_physics_process(false)
 audio.shutdown()
 await get_tree().create_timer(0.15).timeout
 get_tree().quit(code)

func bearing_caption():
 if data.world.has("campaignWorkshop") and sim.room.id==data.world.campaignWorkshop.entry:
  return "%d / %d PUZZLES COMPLETE · STEP ONTO THE LANTERN HOIST"%[world.campaign_completed.size(),data.world.campaignWorkshop.rooms.size()]
 if is_workshop_room():
  if sim.room.def.get("campaignWorkshop",false):
   if workshop_goal_reached(): return "ROOM COMPLETE · THE HOIST IS ARRIVING"
   if sim.room.def.get("workshopRequireAllShards",false):
    var counts=WorkshopPickups.counts(sim.ents)
    return "SHARDS %d / %d · COLLECT ALL AND RETURN TO THE FLAG"%[counts[0],counts[1]]
   if sim.room.def.get("workshopRequireShard",false): return "SHARD FOUND · RETURN TO THE FLAG" if workshop_has_shard() else "BRING THE FAR SHARD BACK TO THE FLAG"
   if sim.room.def.get("workshopRequireStakes",false):
    var stakes=sim.ents.filter(func(e):return e.type=="stone")
    return "STAKES %d / %d · REACH THE GOLD FLAG"%[stakes.filter(func(e):return e.get("lit",false)).size(),stakes.size()]
   return "REACH THE GOLD FLAG · THE HOIST WILL CARRY YOU ON"
  if sim.room.def.get("workshopRequireStakes",false):
   var stakes=sim.ents.filter(func(e):return e.type=="stone")
   var lit_stakes=stakes.filter(func(e):return e.get("lit",false)).size()
   return "FINISH REACHED" if workshop_completed.has(sim.room.id) else ("STAKES %d / %d · REACH THE GOLD FLAG"%[lit_stakes,stakes.size()])
  if sim.room.def.get("workshopRequireAllShards",false):
   var count=WorkshopPickups.counts(sim.ents)
   return "ALL %d SHARDS BROUGHT HOME"%count[1] if workshop_shards.has(sim.room.id) else "SHARDS %d / %d · %s"%[count[0],count[1],"RETURN TO THE GOLD FLAG" if WorkshopPickups.ready(sim.room.def,sim.ents) else "COLLECT ALL, THEN RETURN"]
  if sim.room.def.get("workshopRequireShard",false):
   return sim.room.def.get("workshopCompleteText","SHARD BROUGHT HOME") if workshop_shards.has(sim.room.id) else (sim.room.def.get("workshopReturnText","SHARD FOUND · BRING IT HOME") if workshop_has_shard() else sim.room.def.get("workshopObjective","BRING THE FAR SHARD BACK TO THE FLAG"))
  if not sim.ents.any(func(e):return e.type=="shard"):
   return "FINISH REACHED" if workshop_completed.has(sim.room.id) else "REACH THE GOLD FLAG"
  var shard="SHARD BANKED" if workshop_shards.has(sim.room.id) else ("SHARD FOUND · BRING IT TO THE FLAG" if workshop_has_shard() else "OPTIONAL SHARD")
  return ("FINISH REACHED" if workshop_completed.has(sim.room.id) else "REACH THE GOLD FLAG")+" · "+shard
 if sim.p.get("pollen",0)>0: return "WHITE FLOWER SAP · movement weakened · %.1fs"%(sim.p.pollen/60.0)
 if chapter_number>100:
  # A Core is one continuous room in parts; each save lantern keeps the next part.
  var saves=sim.room.def.get("coreCheckpoints",[])
  var index=int(sim.core_run.index) if sim.core_run!=null else -1
  return "CORE · PART %d / %d · %s"%[index+2,saves.size()+1,("last save: "+saves[index].get("name","Save point")) if index>=0 else "Retry returns to your latest lantern"]
 if chapter_number>=21:
  var prefix="♥ %d · "%world.heart_count() if world.heart_count()>0 else ""
  if sim.room.def.get("puzzleStudy",false):return prefix+sim.room.def.question+" · H: hint"
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
 if not sampler.result.is_empty():
  restart_world()
  return
 if watch:
  load_section(current)
  return
 sampler.retry(world)
 sim=world.active()
 landscape.snap_actor()
func restart_world():
 if story!=null: story.cancel()
 SaveState.clear(sampler.profile,chapter_number)
 game_started=true
 if chapter_number==4:
  workshop_completed.clear()
  workshop_shards.clear()
  rebuild_section_menu()
 world.restart()
 world.sampler_practice=false
 sampler.start(world,chapter_number!=4)
 if sampler_overlay!=null: sampler_overlay.showing_result=false
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
 watch_button.text="Watch solution" if is_workshop_room() else "Watch reference"
 title.text=data.world.name.to_upper()+" · ASCEND"
 sim=world.active()
 current=world.regions.find(world.active_id)
 landscape.runtime=world
 landscape.load_scene(sim)
 select_section_menu()
 room_banner.text=sim.room.name.to_upper()
 banner_time=2.4
 quest_label.text=bearing_caption()
 notice_label.text="A new journey · "+data.world.name
 notice_time=3
 rebuild_world_menu()
 rebuild_section_menu()
 apply_player_visibility()
 set_paused(false)
 maybe_autosave(true)

func switch_chapter(number):
 if number==chapter_number or not chapters.has(number): return
 if not dev_mode and (number==4 or not sampler.profile.has_world(number)): return
 if number>=101 and not dev_mode and not test_mode and not sampler.profile.core_open(number-100):
  notice_label.text="Earn the base root and Fractured crown to unlock this Core."
  notice_time=5
  select_world_menu()
  return
 maybe_autosave(true)
 if story!=null: story.cancel()
 sampler.invalidate()
 var old=chapters[chapter_number]
 old.landscape.runtime=old.world
 watch_origin=""
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
 sampler.start(world,world.frames==0 and not world.sampler_practice and world.active_id==world.data.world.get("atlasStart",world.regions[0]) and number!=4)
 landscape.sampler=sampler
 if sampler_overlay!=null: sampler_overlay.showing_result=false
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
 watch_button.text="Watch solution" if is_workshop_room() else "Watch reference"
 watch_button.disabled=false
 rebuild_section_menu()
 select_world_menu()
 design_picker.disabled=number!=1
 npc_picker.disabled=number!=1
 environment_picker.disabled=number!=1
 feel_picker.disabled=number!=1
 design_picker.select(design_picker.get_item_index(landscape.knight_design))
 npc_picker.select(npc_picker.get_item_index(landscape.npc_design))
 title.text=data.world.name.to_upper()+" · ASCEND"
 pause_title.text=data.world.name.to_upper()
 pause_description.text="A road through the old watch · Ascend" if number==1 else ("Moths, pale resin and the lantern tree · Ascend" if number==2 else "Iron, counterweights and the toll road · Ascend")
 if number in [21,22,23]: pause_description.text="The remembered road · Fractured Ascend"
 if number>=101: pause_description.text="The heart of the world · Core Ascend"
 clear_other_room_hint()
 puzzle_hint_button.visible=sim.room.def.get("puzzleStudy",false) or sim.room.def.get("campaignWorkshop",false)
 workshop_controls.visible=dev_mode and (number==4 or (cover_comparison or causeway_launch_rooms or weight_comparison) and number==23)
 workshop_demo_picker.visible=dev_mode and is_workshop_room()
 workshop_previous.visible=(number==4 or (cover_comparison or causeway_launch_rooms or weight_comparison) and number==23) and data.world.rooms.size()>1
 workshop_next.visible=workshop_previous.visible
 if number==4:
  pause_description.text="%d movement rooms · N for next room · H for a hint"%data.world.rooms.size()
  workshop_recording()
 elif is_workshop_room(): workshop_recording()
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
 if not dev_mode: return
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

func sync_sampler_scene():
 if not dev_mode: discover_current()
 sim=world.active()
 current=world.regions.find(world.active_id)
 landscape.sim=sim
 landscape.active_position=world.placements[world.active_id]
 landscape.snap_actor()
 select_section_menu()

func reset_dev_taps():
 dev_taps=0
 dev_last_tap=0
func register_dev_tap():
 var now=Time.get_ticks_msec()
 if now-dev_last_tap>2000: dev_taps=0
 dev_taps+=1
 dev_last_tap=now
 if dev_taps>=5:
  set_dev_mode(true)
  reset_dev_taps()
func set_dev_mode(value):
 dev_mode=value
 if not value:
  if chapter_number==4 or not sampler.profile.has_world(chapter_number): switch_chapter(sampler.profile.last_world if sampler.profile.has_world(sampler.profile.last_world) else 1)
  if not sampler.profile.has_room(chapter_number,world.active_id):
   var start_id=world.data.world.get("atlasStart",world.regions[0])
   world.enter(start_id,true)
   sim=world.active()
   current=world.regions.find(start_id)
   landscape.runtime=world
   landscape.load_scene(sim)
  discover_current()

 if not value:
  for chapter in chapters.values():
   chapter.landscape.knight_design=5
   chapter.landscape.npc_design=7
   chapter.landscape.walking_style=1
   chapter.landscape.environment_design=0
   chapter.landscape.set_environment_feel(2)
 for chapter in chapters.values(): chapter.landscape.player_styles_locked=not value
 rebuild_world_menu()
 rebuild_section_menu()
 apply_player_visibility()
 notice_label.text="Developer mode enabled" if value else "Player mode"
 notice_time=4
func apply_player_visibility():
 var from_title=title_screen!=null and title_screen.visible
 for node in hud_nodes: node.visible=not from_title
 if sampler_overlay!=null: sampler_overlay.clock_label.visible=not from_title
 if from_title:
  if subtitle_panel.visible: title_subtitle_visible=true
  subtitle_panel.hide()
 elif title_subtitle_visible:
  subtitle_panel.visible=subtitle_time>0
  title_subtitle_visible=false
 for node in gameplay_settings_nodes: node.visible=not from_title
 if settings_card!=null:
  settings_scroll.custom_minimum_size=Vector2(600,470 if from_title else 760)
  settings_card.position=Vector2(330,166 if from_title else 24)
  settings_card.set_deferred("size",Vector2(620,500 if from_title else 784))
 if settings_back!=null: settings_back.visible=from_title
 if pause_title!=null: pause_title.text="SETTINGS" if from_title else data.world.name.to_upper()
 if pause_description!=null: pause_description.visible=not from_title
 if garden_button!=null: garden_button.visible=sampler.profile.completed.get("1",false)
 for node in dev_nodes: node.visible=dev_mode
 workshop_controls.visible=dev_mode and chapter_number==4
 workshop_demo_picker.visible=dev_mode and is_workshop_room()
 if watch: watch_button.text="Take control" if dev_mode else "Try yourself"
func rebuild_world_menu():
 if chapter_picker==null: return
 chapter_picker.clear()
 for n in CHAPTERS:
  if not dev_mode and (n==4 or not sampler.profile.has_world(n)): continue
  chapter_picker.add_item(world_label(n),n)
 select_world_menu()
func select_world_menu():
 if chapter_picker!=null: chapter_picker.select(chapter_picker.get_item_index(chapter_number))
func discover_current():
 if world==null or dev_mode or watch: return
 if sampler.profile.discover(chapter_number,world.active_id):
  rebuild_section_menu()
  rebuild_world_menu()
func travel_to_world(number):
 if not chapters.has(number) or not sampler.profile.available(number): return
 var target=chapters[number].world
 sampler.profile.discover(number,target.data.world.get("atlasStart",target.regions[0]))
 rebuild_world_menu()
 switch_chapter(number)
 restart_world()
 if sampler_overlay!=null:
  sampler_overlay.panel.hide()
  sampler_overlay.scrim.hide()
func focus_pause():
 if title_screen!=null and title_screen.visible and settings_back!=null and settings_back.is_visible_in_tree():
  settings_back.grab_focus()
  return
 if focus_resume!=null and pause_panel.is_visible_in_tree(): focus_resume.grab_focus()
func _input(event):
 if event is InputEventJoypadButton and event.pressed or event is InputEventJoypadMotion and absf(event.axis_value)>.5: Controls.using_controller=true
 elif event is InputEventKey and event.pressed or event is InputEventMouseButton and event.pressed: Controls.using_controller=false
 if dev_taps==0: return
 if event is InputEventMouseButton and event.pressed:
  if event.button_index!=MOUSE_BUTTON_LEFT or voices_button==null or not voices_button.get_global_rect().has_point(event.position): reset_dev_taps()
 elif event is InputEventKey and event.pressed and not event.echo:
  if not event.is_action_pressed("ui_accept") or get_viewport().gui_get_focus_owner()!=voices_button: reset_dev_taps()
 elif event is InputEventJoypadButton and event.pressed:
  if not event.is_action_pressed("ui_accept") or get_viewport().gui_get_focus_owner()!=voices_button: reset_dev_taps()

func focus_first(node):
 if not node.is_visible_in_tree(): return false
 if node is BaseButton and node.focus_mode!=Control.FOCUS_NONE:
  node.grab_focus()
  return true
 for child in node.get_children():
  if child is Control and focus_first(child): return true
 return false

func world_label(number):
 var label=chapters[number].world.data.world.name
 return "Core %d · %s"%[number-100,label.trim_suffix(" · Core")] if number>=101 else label

func maybe_autosave(force=false):
 if not game_started or dev_mode or watch or sampler.profile.run.is_empty(): return
 sampler.profile.collect_hearts(world)
 var checkpoint=int(sim.core_run.index) if sim!=null and sim.core_run!=null else -1
 var riding=not sampler.ride.is_empty()
 var frames=int(sampler.profile.run.frames)
 if not force and world.active_id==save_room and sim.deaths==save_deaths and checkpoint==save_checkpoint and riding==save_riding and frames-save_frame<600: return
 if SaveState.write(world,sampler,audio):
  save_room=world.active_id;save_deaths=sim.deaths;save_checkpoint=checkpoint;save_frame=frames;save_riding=riding
func resume_world(number):
 if not sampler.profile.has_world(number): return false
 switch_chapter(number)
 if not SaveState.restore(world,sampler,audio):
  restart_world()
  return false
 game_started=true
 watch=false;hold=0;tape=[];journey=[]
 sync_sampler_scene()
 landscape.runtime=world
 landscape.load_scene(sim)
 if not sampler.ride.is_empty():
  var point=sampler.ride_point()
  landscape.current_actor=point;landscape.previous_actor=point;landscape.actor=point
  landscape.camera_float=point-Vector2(153,100)
 if sampler_overlay!=null: sampler_overlay.showing_result=false
 set_paused(false)
 return true

func developer_next():
 if not (dev_mode or test_mode) or paused or not sampler.ride.is_empty() or story!=null and story.active(): return
 if watch:
  watch=false;tape=[];hold=0
  world.enter(watch_origin if world.cores.has(watch_origin) else world.active_id,true)
  sim=world.active();landscape.runtime=world
 if sampler.profile.run.is_empty() or sampler.profile.run.finished: sampler.start(world,true)
 sampler.profile.run.eligible=true
 world.sampler_practice=false
 sampler.dev_next(world)
 sampler.profile.collect_hearts(world)
 var key=str(chapter_number)
 if not sampler.profile.discovered.has(key): sampler.profile.discovered[key]={}
 for id in sampler.profile.run.cleared: sampler.profile.discovered[key][id]=true
 sampler.profile.discover(chapter_number,world.active_id)
 sampler.profile.save_profile()
 sync_sampler_scene()
 if story!=null: story.check_begin()
 discover_current()
 maybe_autosave(true)
