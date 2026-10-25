extends Node
const World=preload("res://scripts/world.gd")
const Landscape=preload("res://scripts/landscape.gd")
const Sound=preload("res://scripts/audio.gd")
const Chart=preload("res://scripts/chart.gd")
const Controls=preload("res://scripts/controls.gd")
var world
var landscape
var audio
var viewport: SubViewport
var paused=false
var map_panel: Control
var map_scrim: ColorRect
var map_ink: Control
var map_button: Button
var menu_panel: Control
var title: Label
var health: Label
var gear: Label
var objective: Label
var notice: Label
var room_banner: Label
var room_time=0.0
var last_room=""
var footer: Label
var speech_panel: Control
var speech_name: Label
var speech_text: Label
var room_picker: OptionButton
var volume_sliders={}
var settings=ConfigFile.new()
var test_mode=false
var capture_path=""
var capture_after=90
var capture_audio=""
var capture_menu=false
var ticks=0
var closing=false
var input_gate=false
var watching=false
var watch_button: Button
var tour_frames=[]
var tour_index=0
var restart_button: Button
var retry_button: Button
func label(parent,value,size,color="#d8dfd5"):
 var l=Label.new()
 l.text=value
 l.add_theme_font_size_override("font_size",size)
 l.add_theme_color_override("font_color",Color(color))
 parent.add_child(l)
 return l
func style(bg,border="#586c68",radius=5):
 var s=StyleBoxFlat.new()
 s.bg_color=Color(bg)
 s.border_color=Color(border)
 s.set_border_width_all(1)
 s.set_corner_radius_all(radius)
 s.content_margin_left=14;s.content_margin_right=14
 s.content_margin_top=9;s.content_margin_bottom=9
 return s
func button(parent,value,callback):
 var b=Button.new()
 b.text=value
 b.focus_mode=Control.FOCUS_NONE
 b.add_theme_font_size_override("font_size",16)
 b.add_theme_stylebox_override("normal",style("#172a30","#405953"))
 b.add_theme_stylebox_override("hover",style("#293e3c","#c6bd8b"))
 b.pressed.connect(func():audio.effect("ui-select",0.6);callback.call())
 parent.add_child(b)
 return b
func _ready():
 get_tree().auto_accept_quit=false
 Controls.bind()
 if not test_mode: settings.load("user://explore-settings.cfg")
 world=World.new(JSON.parse_string(FileAccess.get_file_as_string("res://data/world.json")))
 audio=Sound.new()
 for bus in audio.levels: audio.levels[bus]=float(settings.get_value("audio",bus,audio.levels[bus]))
 audio.voices_enabled=settings.get_value("audio","voices",true)
 add_child(audio)
 var container=SubViewportContainer.new()
 container.position=Vector2(0,48)
 container.size=Vector2(1280,736)
 container.stretch=true
 container.stretch_shrink=2
 viewport=SubViewport.new()
 viewport.size=Vector2i(640,368)
 viewport.render_target_update_mode=SubViewport.UPDATE_ALWAYS
 viewport.canvas_item_default_texture_filter=Viewport.DEFAULT_CANVAS_ITEM_TEXTURE_FILTER_NEAREST
 container.add_child(viewport)
 add_child(container)
 landscape=Landscape.new()
 landscape.world=world
 landscape.scale=Vector2(0.5,0.5)
 landscape.reduced_motion=settings.get_value("display","reduced_motion",false)
 viewport.add_child(landscape)
 interface()
 audio.spoken.connect(show_speech)
 audio.quiet.connect(on_quiet)
 var args=OS.get_cmdline_user_args()
 var stage_arg=0
 var spawn_x=-1.0
 var spawn_y=0.0
 var requested_watch=false
 for i in range(args.size()):
  if args[i]=="--capture" and i+1<args.size(): capture_path=args[i+1]
  elif args[i]=="--capture-after" and i+1<args.size(): capture_after=int(args[i+1])
  elif args[i]=="--capture-audio" and i+1<args.size(): capture_audio=args[i+1];audio.start_capture()
  elif args[i]=="--stage" and i+1<args.size(): stage_arg=int(args[i+1])
  elif args[i]=="--x" and i+1<args.size(): spawn_x=float(args[i+1])
  elif args[i]=="--y" and i+1<args.size(): spawn_y=float(args[i+1])
  elif args[i]=="--menu": capture_menu=true
  elif args[i]=="--watch": requested_watch=true
 if stage_arg==1: world.enter(1,210,0)
 if spawn_x>=0: world.p.x=spawn_x;world.p.y=spawn_y
 if requested_watch: toggle_watch()
 landscape.snap()
 audio.region_changed(world.stage)
 update_hud()
func interface():
 var ui=CanvasLayer.new()
 add_child(ui)
 var root=Control.new()
 root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
 root.mouse_filter=Control.MOUSE_FILTER_IGNORE
 ui.add_child(root)
 var header=Panel.new()
 header.size=Vector2(1280,48)
 header.add_theme_stylebox_override("panel",style("#101f27","#334b4b",0))
 root.add_child(header)
 var brand=label(header,"B L A D E F A L L",20,"#dfcf9d")
 brand.position=Vector2(24,9)
 title=label(header,"THE OUTSKIRTS · EXPLORE",14,"#9eb2ac")
 title.position=Vector2(285,14)
 health=label(header,"",19,"#c78f82")
 health.position=Vector2(860,10)
 var menu=button(header,"II  Esc",func():set_paused(not paused))
 menu.position=Vector2(1176,5);menu.size=Vector2(88,38)
 objective=label(root,"",14,"#ccceb2")
 objective.position=Vector2(24,57)
 notice=label(root,"",18,"#e8d9a4")
 notice.position=Vector2(24,89)
 room_banner=label(root,"",26,"#e3d6ae")
 room_banner.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
 room_banner.position=Vector2(260,112);room_banner.size=Vector2(760,42)
 gear=label(root,"",13,"#99b4aa")
 gear.position=Vector2(24,752)
 var foot=Panel.new()
 foot.position=Vector2(0,784);foot.size=Vector2(1280,48)
 foot.add_theme_stylebox_override("panel",style("#102027","#334b4b",0))
 root.add_child(foot)
 footer=label(foot,"← → MOVE    SPACE JUMP    ↑ TALK / USE    W STRIKE    C TAKE    R FLAG",13,"#9eb3ad")
 footer.position=Vector2(24,14)
 speech_panel=PanelContainer.new()
 speech_panel.position=Vector2(80,650)
 speech_panel.size=Vector2(1120,126)
 speech_panel.add_theme_stylebox_override("panel",style("#101f27f5","#87917a",6))
 root.add_child(speech_panel)
 var text_box=VBoxContainer.new()
 speech_panel.add_child(text_box)
 speech_name=label(text_box,"",14,"#dec58b")
 speech_text=label(text_box,"",17,"#e8e7d8")
 speech_text.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART
 label(text_box,"↑ / SPACE  Continue",12,"#91a79c")
 speech_panel.hide()
 menu_panel=Control.new()
 menu_panel.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
 root.add_child(menu_panel)
 var scrim=ColorRect.new()
 scrim.size=Vector2(1280,832);scrim.color=Color(0.01,0.03,0.04,0.88)
 menu_panel.add_child(scrim)
 var card=PanelContainer.new()
 card.position=Vector2(330,26);card.size=Vector2(620,780)
 card.add_theme_stylebox_override("panel",style("#14282d","#71877a",9))
 menu_panel.add_child(card)
 var scroll=ScrollContainer.new()
 scroll.custom_minimum_size=Vector2(592,752)
 scroll.horizontal_scroll_mode=ScrollContainer.SCROLL_MODE_DISABLED
 card.add_child(scroll)
 var column=VBoxContainer.new()
 column.size_flags_horizontal=Control.SIZE_EXPAND_FILL
 column.add_theme_constant_override("separation",8)
 scroll.add_child(column)
 label(column,"THE LONG ROAD",30,"#e1d5a8")
 label(column,"The Outskirts & Black Woods · Explore draft",15,"#9cb5a9")
 var row=HBoxContainer.new();row.add_theme_constant_override("separation",8);column.add_child(row)
 button(row,"Resume",func():set_paused(false))
 retry_button=button(row,"Retry from flag",retry)
 watch_button=button(row,"Watch a new journey",toggle_watch)
 restart_button=button(column,"Start journey over",restart)
 map_button=button(column,"Mara’s field chart · M",toggle_map)
 label(column,"EXPLORE A REGION",12,"#c9bd8e")
 room_picker=OptionButton.new()
 room_picker.custom_minimum_size=Vector2(560,40)
 for r in world.regions: room_picker.add_item(r.catalog.name)
 room_picker.item_selected.connect(preview)
 column.add_child(room_picker)
 label(column,"SOUND",12,"#c9bd8e")
 for bus in audio.levels:
  var sound_row=HBoxContainer.new()
  column.add_child(sound_row)
  var name=label(sound_row,bus,16)
  name.custom_minimum_size=Vector2(108,34)
  var slider=HSlider.new()
  slider.custom_minimum_size=Vector2(420,34)
  slider.min_value=0;slider.max_value=1;slider.step=0.01;slider.value=audio.levels[bus]
  slider.value_changed.connect(func(value):audio.levels[bus]=value;audio.apply_levels();save_settings())
  sound_row.add_child(slider)
  volume_sliders[bus]=slider
 var voices=CheckBox.new()
 voices.text="Spoken dialogue (subtitles stay on)"
 voices.button_pressed=audio.voices_enabled
 voices.toggled.connect(set_voices)
 column.add_child(voices)
 var motion=CheckBox.new()
 motion.text="Reduce motion and particles"
 motion.button_pressed=landscape.reduced_motion
 motion.toggled.connect(func(value):landscape.reduced_motion=value;save_settings())
 column.add_child(motion)
 row=HBoxContainer.new();column.add_child(row)
 button(row,"Lighting on / off",func():landscape.lights_enabled=not landscape.lights_enabled)
 button(row,"Fullscreen · F11",fullscreen)
 label(column,"ARROWS Move   SPACE Jump   ↑ Talk / use",15,"#aabeb1")
 label(column,"W Strike   C Take   R Plant earned checkpoint flag",15,"#aabeb1")
 label(column,"Controller: stick / d-pad · A jump · X strike · Y talk",14,"#aabeb1")
 label(column,"Begin unarmed. Later abilities remain memories.",14,"#809d8f")
 label(column,"Watch starts fresh; take control at any time.",13,"#809d8f")
 menu_panel.hide()
 map_scrim=ColorRect.new()
 map_scrim.size=Vector2(1280,832)
 map_scrim.color=Color(0.01,0.03,0.04,0.88)
 root.add_child(map_scrim)
 map_panel=PanelContainer.new()
 map_panel.position=Vector2(65,70);map_panel.size=Vector2(1150,670)
 map_panel.add_theme_stylebox_override("panel",style("#13282a","#8c957a",8))
 root.add_child(map_panel)
 var map_column=VBoxContainer.new();map_panel.add_child(map_column)
 map_ink=Chart.new();map_ink.world=world;map_ink.custom_minimum_size=Vector2(1120,580)
 map_column.add_child(map_ink)
 button(map_column,"Close chart · M",toggle_map)
 hide_chart()
func toggle_map():
 if not world.chart:
  world.cue("Find Mara's three bearings to complete the field chart")
  update_hud()
  return
 if map_panel.visible:
  hide_chart()
  set_paused(false)
 else:
  set_paused(true)
  menu_panel.hide()
  map_ink.queue_redraw()
  map_scrim.show()
  map_panel.show()
func save_settings():
 if test_mode: return
 for bus in audio.levels: settings.set_value("audio",bus,audio.levels[bus])
 settings.set_value("audio","voices",audio.voices_enabled)
 settings.set_value("display","reduced_motion",landscape.reduced_motion)
 settings.save("user://explore-settings.cfg")
func set_paused(value):
 paused=value
 menu_panel.visible=value
 audio.set_paused(value)
 landscape.paused=value
func fullscreen():
 DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED if DisplayServer.window_get_mode()==DisplayServer.WINDOW_MODE_FULLSCREEN else DisplayServer.WINDOW_MODE_FULLSCREEN)
func on_quiet():
 speech_panel.hide()
 landscape.speaker=""
 input_gate=Input.is_action_pressed("explore_interact") or Input.is_action_pressed("explore_jump") or Input.is_action_pressed("explore_command") or Input.is_action_pressed("explore_attack")
 world.prev={}
func show_speech(name,text_value,seconds):
 speech_name.text=name.to_upper()
 speech_text.text=text_value
 speech_panel.show()
 footer.text="↑ / SPACE  Continue    ·    Esc  Pause"
 landscape.speaker=name
func _unhandled_input(event):
 if event.is_action_pressed("explore_pause"):
  if map_panel.visible: toggle_map()
  else: set_paused(not paused)
 elif event is InputEventKey and event.pressed and event.physical_keycode==KEY_M: toggle_map()
 elif event is InputEventKey and event.pressed and event.physical_keycode==KEY_F11: fullscreen()
 elif audio.talking() and (event.is_action_pressed("explore_interact") or event.is_action_pressed("explore_jump")):
  audio.advance()
  get_viewport().set_input_as_handled()
func _physics_process(dt):
 ticks+=1
 if paused or audio.talking():
  landscape.old_actor=landscape.current_actor
  return
 var raw=decode(tour_frames[tour_index]) if watching and tour_index<tour_frames.size() else Controls.read()
 if input_gate and not watching:
  if raw.interact or raw.jump or raw.command or raw.attack: return
  input_gate=false
  world.prev={}
 landscape.before_tick()
 world.step(raw)
 if watching:
  tour_index+=1
  if tour_index>=tour_frames.size(): stop_watching()
 landscape.after_tick()
 audio.handle(world.events)
 audio.tick(world,dt)
 update_hud()
func _process(dt):
 if paused: return
 room_time=max(0,room_time-dt)
 room_banner.modulate.a=min(1,room_time)
 notice.modulate.a=min(1,world.quest_time)
 if capture_path!="" and ticks>=capture_after:
  var destination=capture_path
  capture_path=""
  capture(destination)
func update_hud():
 title.text=world.region().catalog.name.to_upper()+" · "+("WATCHING" if watching else "EXPLORE")
 health.text="● ".repeat(max(0,int(world.p.blood)))+"○ ".repeat(max(0,5-int(world.p.blood)))
 objective.text=world.objective()
 footer.text=world.hint()
 notice.text=world.quest_cue
 gear.text=("OATHBLADE" if world.weapon else "UNARMED")+"    ·    "+("MOTHSILK MANTLE    ·    " if world.mantle else "")+str(world.flags)+" FLAG    ·    "+str(world.deaths)+" DEATHS"
 for room in world.region().rooms:
  if world.p.x>=room.x1 and world.p.x<room.x2 and room.id!=last_room:
   last_room=room.id
   room_banner.text=room.name
   room_time=3.0
 map_button.disabled=not world.chart
 room_picker.select(world.stage)
func restart():
 stop_watching()
 world.restart()
 hide_chart()
 audio.restart()
 landscape.snap()
 audio.region_changed(0)
 last_room=""
 update_hud()
 set_paused(false)
func retry():
 hide_chart()
 stop_watching()
 world.retry()
 audio.restart()
 landscape.snap()
 update_hud()
 set_paused(false)
func preview(index):
 hide_chart()
 stop_watching()
 world.enter(index,210 if index==1 else 70,0)
 world.retry()
 audio.restart()
 landscape.snap()
 last_room=""
 update_hud()
 set_paused(false)
func capture(path):
 if capture_menu: set_paused(true)
 await RenderingServer.frame_post_draw
 var code=get_viewport().get_texture().get_image().save_png(path)
 if capture_audio!="": audio.save_capture(capture_audio)
 var report={"fps":Engine.get_frames_per_second(),"stage":world.stage,"player":[world.p.x,world.p.y],"objects":world.objects().size(),"occluders":landscape.occluder_count,"lights":landscape.lights.size(),"audio":audio.counts}
 var f=FileAccess.open(path+".json",FileAccess.WRITE);f.store_string(JSON.stringify(report,"  "));f.close()
 print("Capture ",path," ",report)
 await close_app(0 if code==OK else 1)
func close_app(code=0):
 if closing: return
 closing=true
 set_physics_process(false)
 audio.shutdown()
 await get_tree().create_timer(0.15).timeout
 get_tree().quit(code)
func _notification(what):
 if what==NOTIFICATION_WM_CLOSE_REQUEST: close_app()

func decode(keys):
 var raw={}
 for pair in [["left","l"],["right","r"],["jump","j"],["attack","a"],["interact","u"],["pickup","c"],["command","e"],["flag","f"]]: raw[pair[0]]=pair[1] in keys
 return raw
func stop_watching():
 watching=false
 if watch_button!=null: watch_button.text="Watch a new journey"
func toggle_watch():
 if watching:
  stop_watching()
  set_paused(false)
  update_hud()
  return
 restart()
 tour_frames=[]
 var tours=JSON.parse_string(FileAccess.get_file_as_string("res://data/tours.json"))
 for name in ["outskirts","forest"]:
  for part in tours[name].tape:
   for i in range(int(part[0])): tour_frames.append(part[1])
 tour_index=0
 watching=true
 watch_button.text="Take control"
 set_paused(false)
 update_hud()

func set_voices(value):
 audio.voices_enabled=value
 if not value: audio.speech.stop()
 save_settings()

func hide_chart():
 if map_panel!=null: map_panel.hide()
 if map_scrim!=null: map_scrim.hide()
