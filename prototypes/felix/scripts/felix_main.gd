extends Node
## Felix. Chapter One, The New House: one continuous climb on the Outskirts' road.
## Chapter Two, Sir Felix: the Black Woods to Dad's cabin, then Dad's story on a stormy night.
## Chapter Three, Phantom: across the Causeway to the handoff, then the drive to Dad's.
const World=preload("res://scripts/world.gd")
const View=preload("res://scripts/felix_view.gd")
const Story=preload("res://scripts/felix_story.gd")
const WoodsView=preload("res://scripts/woods_view.gd")
const WoodsStory=preload("res://scripts/woods_story.gd")
const PhantomView=preload("res://scripts/phantom_view.gd")
const PhantomStory=preload("res://scripts/phantom_story.gd")
const NAMES=["","The New House","Sir Felix","Phantom"]
const CHAPTERS=[1,2,3,21,22,23,101,102,103]
const Challenge=preload("res://scripts/felix_challenge.gd")
const ChallengeView=preload("res://scripts/felix_challenge_view.gd")
const FrontEnd=preload("res://scripts/felix_front_end.gd")
const WorldSave=preload("res://scripts/world_save.gd")
const NUMBERS=["","One","Two","Three"]
const Controls=preload("res://scripts/controls.gd")
const Sound=preload("res://scripts/audio.gd")
const ChapterMusic=preload("res://scripts/felix_music.gd")

const SaveState=preload("res://scripts/felix_save.gd")
const Run=preload("res://scripts/sampler_run.gd")
var sampler
var front_end
var controls_menu
var journal
static var carry_requested=false
const SaveTransfer=preload("res://scripts/save_transfer.gd")
var transfer_status:Label
var transfer_dialog:FileDialog
var web_import_callback
var web_pause_callback
var reduced_motion=false
var settings=ConfigFile.new()
var touch_controls
var mobile=false
static var booted=false
static var show_studio=true
static var play_on_ready=false
var developer_mode=false
const GraphicsLab=preload("res://scripts/graphics_lab.gd")
var graphics_lab: GraphicsLab
const GraphicsPhoto=preload("res://scripts/graphics_photo.gd")
var graphics_photo:GraphicsPhoto
var world_container: SubViewportContainer
var capture_wall_times=[]
var capture_physics_times=[]
var last_capture_frame_usec=0
var save_error=""
var last_autosave_tick=0
var last_saved_room=""
var saved_phase=""
var saved_checkpoint=""
var saved_deaths=-1
var saved_milestones=[]
var next_save_retry_tick=0
var recovery_blocked=false
var recovery_notice=""
var recovery_time=8.0
static var resume_on_ready=true
var world
var sim
var view
var story
var audio
var viewport: SubViewport
var crayon: Font
var line_labels=[]
var hint_label: Label
var cover: ColorRect
var title_box: VBoxContainer
var title_main: Label
var title_sub: Label
var prompt_label: Label
var end_box: VBoxContainer
var end_stats: Label
var pause_box: PanelContainer
var paused=false
var black_time=0.0
var end_shown=false
var retry_held=false
var music_db=-80.0
var chapter_music
var music_picker: OptionButton
var music_description: Label
# Developer flags.
var capture_path=""
var capture_after=120
var script_tape=[]
var script_frame=0
var ticks=0
var report=false
var chain=false
# Survives the scene reload between chapters.
static var chapter=1

func _ready():
 get_tree().auto_accept_quit=false
 Controls.bind()
 settings.load("user://felix-settings.cfg")
 reduced_motion=bool(settings.get_value("accessibility","reduced_motion",false))
 RenderingServer.set_default_clear_color(Color("05060a"))
 crayon=SystemFont.new()
 crayon.font_names=PackedStringArray(["Chalkboard SE","Marker Felt","Comic Sans MS","Noteworthy"])
 var args=OS.get_cmdline_user_args()
 if args.has("--chapter"): chapter=int(args[args.find("--chapter")+1])
 var lab_requested="--dev-graphics" in args or Array(args).any(func(arg):return arg.begins_with("--graphics-preset=") or arg.begins_with("--graphics-scale="))
 developer_mode=developer_mode or lab_requested or Array(args).any(func(arg):return arg in ["--from","--reference","--tour","--script","--capture"])
 mobile=OS.has_feature("mobile") or DisplayServer.is_touchscreen_available()
 sampler=Run.new(SaveState.directory.path_join("felix-garden.json") if not developer_mode else "user://felix-qa-%d.json"%OS.get_process_id())
 if not booted and not args.has("--chapter") and not developer_mode: chapter=sampler.profile.last_world
 booted=true
 if chapter not in CHAPTERS: chapter=1
 var data=JSON.parse_string(FileAccess.get_file_as_string("res://data/world%d.json"%chapter))
 world=World.new(data)
 sim=world.active()
 story=Challenge.new(world) if chapter>=21 else [Story,Story,WoodsStory,PhantomStory][chapter].new(world)
 sampler.start(world,not developer_mode,carry_requested and chapter>=21)
 if chapter>=21: story.tracker=sampler
 audio=Sound.new()
 audio.levels.Efforts=0.0
 audio.levels.Ambience=0.0
 audio.levels.Music=0.45
 audio.world_runtime=world
 add_child(audio)
 audio.music.volume_db=-80
 var half_resolution=mobile or chapter in [2,22,102]
 var container=SubViewportContainer.new()
 world_container=container
 container.position=Vector2(0,48)
 container.size=Vector2(1280,736)
 container.stretch=true
 container.stretch_shrink=2 if half_resolution else 1
 viewport=SubViewport.new()
 viewport.size=Vector2i(640,368) if half_resolution else Vector2i(1280,736)
 viewport.canvas_item_default_texture_filter=Viewport.DEFAULT_CANVAS_ITEM_TEXTURE_FILTER_NEAREST
 container.add_child(viewport)
 add_child(container)
 view=ChallengeView.new() if chapter>=21 else [View,View,WoodsView,PhantomView][chapter].new()
 view.scale=Vector2(2,2) if half_resolution else Vector2(4,4)
 view.reduced_motion=reduced_motion
 view.world_data=world.data
 view.runtime=world
 if chapter>=21:
  view.felix_story=story
  view.sampler=sampler
 else: view.story=story
 viewport.add_child(view)
 view.load_scene(sim)
 audio.room_changed(sim)
 chapter_music=ChapterMusic.new()
 chapter_music.setup(audio.music)
 build_interface()
 graphics_lab.set_active(lab_requested)
 apply_graphics_lab()
 if not developer_mode:
  if resume_on_ready and restore_checkpoint():
   if chapter>=21: story.start()
   sim=world.active()
   view.load_scene(sim)
   if story.phase!="black": title_box.hide()
   remember_saved_checkpoint()
  else:
   if resume_on_ready: recover_rejected_checkpoint()
   save_checkpoint()
 front_end=FrontEnd.new()
 front_end.app=self
 add_child(front_end)
 controls_menu=preload("res://scripts/controls_menu.gd").new()
 controls_menu.app=self
 add_child(controls_menu)
 journal=preload("res://scripts/felix_journal.gd").new()
 journal.app=self
 add_child(journal)
 touch_controls=preload("res://scripts/felix_touch_controls.gd").new()
 touch_controls.app=self
 add_child(touch_controls)
 if not developer_mode and not play_on_ready: front_end.open(show_studio)
 else: front_end.hide()
 show_studio=false
 if OS.has_feature("web"):
  web_pause_callback=JavaScriptBridge.create_callback(func(_args): pause_for_interruption())
  JavaScriptBridge.get_interface("window").felixPauseForInterruption=web_pause_callback
 play_on_ready=false
 for i in range(args.size()):
  match args[i]:
   "--capture": capture_path=args[i+1]
   "--capture-after": capture_after=int(args[i+1])
   "--from":
    story.skip_prologue()
    begin_play()
    world.enter(args[i+1],true)
    sim=world.active()
    view.load_scene(sim)
   "--place":
    sim.p.x=float(args[i+1])
    sim.p.y=float(args[i+2])
    view.snap_actor()
   "--script": load_script(args[i+1])
   "--reference": play_reference(args[i+1])
   "--report": report=true
   "--photos": story.photos=world.data.world.campaignWorkshop.rooms.duplicate()
   "--chain": chain=true
   "--tour": play_tour()

func build_interface():
 var ui=Control.new()
 ui.set_anchors_preset(Control.PRESET_FULL_RECT)
 ui.mouse_filter=Control.MOUSE_FILTER_IGNORE
 add_child(ui)
 for i in range(3):
  var label=Label.new()
  label.add_theme_font_override("font",crayon)
  label.add_theme_font_size_override("font_size",30)
  label.add_theme_color_override("font_color",Color("#fff4dc"))
  label.add_theme_color_override("font_outline_color",Color(0,0,0,.65))
  label.add_theme_constant_override("outline_size",8)
  label.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
  label.size=Vector2(700,48)
  label.hide()
  ui.add_child(label)
  line_labels.append(label)
 hint_label=Label.new()
 hint_label.add_theme_font_override("font",crayon)
 hint_label.add_theme_font_size_override("font_size",22)
 hint_label.add_theme_color_override("font_color",Color("#cfd6f0"))
 hint_label.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
 hint_label.position=Vector2(0,792)
 hint_label.size=Vector2(1280,32)
 ui.add_child(hint_label)
 cover=ColorRect.new()
 cover.color=Color.BLACK
 cover.set_anchors_preset(Control.PRESET_FULL_RECT)
 cover.mouse_filter=Control.MOUSE_FILTER_IGNORE
 ui.add_child(cover)
 title_box=VBoxContainer.new()
 title_box.position=Vector2(0,300)
 title_box.size=Vector2(1280,240)
 title_box.alignment=BoxContainer.ALIGNMENT_CENTER
 ui.add_child(title_box)
 var opening=story.title() if story.has_method("title") else ["sniff...",""]
 title_main=crayon_label(title_box,opening[0],34,Color("#9aa3c4"))
 title_sub=crayon_label(title_box,opening[1],22,Color("#69708e"))
 prompt_label=crayon_label(title_box,"",20,Color("#4d5470"))
 end_box=VBoxContainer.new()
 end_box.position=Vector2(0,250)
 end_box.size=Vector2(1280,330)
 end_box.alignment=BoxContainer.ALIGNMENT_CENTER
 end_box.hide()
 ui.add_child(end_box)
 crayon_label(end_box,"Felix",72,Color("#fff1c9"))
 crayon_label(end_box,world_label(chapter),28,Color("#c9cfe8"))
 end_stats=crayon_label(end_box,"",22,Color("#9aa3c4"))
 crayon_label(end_box,"press any button to return to the title" if chapter>=3 else "press any button for Chapter %s"%NUMBERS[chapter+1],20,Color("#6f7694"))
 pause_box=PanelContainer.new()
 var panel=StyleBoxFlat.new()
 panel.bg_color=Color(.04,.05,.09,.92)
 panel.set_corner_radius_all(10)
 panel.content_margin_left=28
 panel.content_margin_right=28
 panel.content_margin_top=22
 panel.content_margin_bottom=22
 pause_box.add_theme_stylebox_override("panel",panel)
 pause_box.position=Vector2(360,85)
 pause_box.size=Vector2(560,670)
 pause_box.hide()
 ui.add_child(pause_box)
 var column=VBoxContainer.new()
 column.add_theme_constant_override("separation",12)
 var scroll=ScrollContainer.new()
 scroll.custom_minimum_size=Vector2(500,506 if mobile else 610)
 scroll.horizontal_scroll_mode=ScrollContainer.SCROLL_MODE_DISABLED
 if mobile:
  var settings_layout=VBoxContainer.new()
  settings_layout.add_theme_constant_override("separation",8)
  pause_box.add_child(settings_layout)
  var quick=HBoxContainer.new()
  quick.add_theme_constant_override("separation",8)
  settings_layout.add_child(quick)
  for item in [["Resume",func():set_paused(false)],["Export",export_portable_save],["Import",import_portable_save]]:
   var action=button(quick,item[0],item[1],false)
   action.custom_minimum_size.x=154
   action.add_theme_font_size_override("font_size",28)
  settings_layout.add_child(scroll)
 else: pause_box.add_child(scroll)
 scroll.add_child(column)
 column.custom_minimum_size.x=480
 crayon_label(column,"paused",30,Color("#fff1c9"))
 crayon_label(column,"Music",20,Color("#c9cfe8"))
 music_picker=OptionButton.new()
 music_picker.add_theme_font_override("font",crayon)
 music_picker.add_theme_font_size_override("font_size",32 if mobile else 20)
 if mobile:
  music_picker.custom_minimum_size.y=96
  music_picker.get_popup().add_theme_font_size_override("font_size",32)
  music_picker.get_popup().add_theme_constant_override("v_separation",40)
 column.add_child(music_picker)
 for i in range(chapter_music.tracks.size()):
  music_picker.add_item(chapter_music.tracks[i].title,i)
  music_picker.set_item_disabled(i,not chapter_music.available(i))
 music_picker.selected=chapter_music.selected
 music_picker.item_selected.connect(func(index):
  if chapter_music.select_track(index):
   music_description.text=chapter_music.tracks[index].description
   audio.music.stream_paused=false)
 music_description=crayon_label(column,"",16,Color("#9aa3c4"))
 music_description.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART
 if chapter_music.selected>=0:
  music_description.text=chapter_music.tracks[chapter_music.selected].description
 else:
  music_description.text="Original score"
 var music_volume=HSlider.new()
 music_volume.min_value=0
 music_volume.max_value=100
 music_volume.step=1
 music_volume.value=chapter_music.gain*100
 music_volume.tooltip_text="Music volume"
 music_volume.accessibility_name="Music volume"
 music_volume.value_changed.connect(func(value):chapter_music.set_gain(value/100.0))
 column.add_child(music_volume)
 var motion=CheckButton.new()
 motion.text="Reduced motion"
 motion.button_pressed=reduced_motion
 motion.toggled.connect(func(value):
  reduced_motion=value
  view.reduced_motion=value
  apply_graphics_lab()
  settings.set_value("accessibility","reduced_motion",value)
  settings.save("user://felix-settings.cfg"))
 if mobile:
  motion.custom_minimum_size.y=96
  motion.add_theme_font_size_override("font_size",28)
 column.add_child(motion)
 graphics_lab=GraphicsLab.new()
 graphics_lab.setup(column,crayon,mobile,OS.get_cmdline_user_args())
 graphics_lab.changed.connect(apply_graphics_lab)
 graphics_lab.photo_requested.connect(open_graphics_photo)
 button(column,"Garden and records",func():journal.open(),false)
 button(column,"Controls and remapping",func():controls_menu.open(),false)
 button(column,"Export save",export_portable_save,false)
 button(column,"Import save",import_portable_save,false)
 transfer_status=crayon_label(column,"",16,Color("#b5bdd4"))
 transfer_status.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART
 for item in [["Keep climbing",func():set_paused(false)],["Begin the chapter again",restart_chapter],["Title and chapters",func():set_paused(false);front_end.open(false)],["Quit",close_app]]:
  button(column,item[0],item[1],false)

func crayon_label(parent,value,size,color):
 var label=Label.new()
 label.text=value
 label.add_theme_font_override("font",crayon)
 label.add_theme_font_size_override("font_size",maxi(size,28) if mobile else size)
 label.add_theme_color_override("font_color",color)
 label.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
 parent.add_child(label)
 return label

func begin_play():
 story.start()
 title_box.hide()

func world_label(n):
 if n in [1,2,3]: return "Chapter %s · %s"%[NUMBERS[n],NAMES[n]]
 var home=n-100 if n>=101 else n-20
 return ("Core" if n>=101 else "Fractured")+" "+["","Outskirts","Woods","Causeway"][home]

func button(parent,value,action,_primary=false):
 var result=Button.new()
 result.text=value
 result.custom_minimum_size.y=96 if mobile else 48
 result.add_theme_font_override("font",crayon)
 result.add_theme_font_size_override("font_size",32 if mobile else 24)
 result.pressed.connect(action)
 parent.add_child(result)
 return result

func has_checkpoint(n):
 return SaveState.read(n).get("story",{}).get("phase","black")!="black" if n<21 else WorldSave.exists(sampler.profile,n)

func restore_checkpoint():
 return SaveState.restore(world,story,sampler,audio) if chapter<21 else WorldSave.restore(world,sampler,audio)

func recover_rejected_checkpoint():
 var target=SaveState.path(chapter) if chapter<21 else WorldSave.path(sampler.profile,chapter)
 if not FileAccess.file_exists(target): return
 recovery_blocked=not WorldSave.archive_rejected(target)
 recovery_notice="Could not read or back up this checkpoint. Saving is paused to protect it." if recovery_blocked else "The previous checkpoint could not be loaded. A recovery copy was kept."
 transfer_status.text=recovery_notice

func load_chapter(n,resume=true,carry=false):
 save_checkpoint()
 chapter=n
 carry_requested=carry
 resume_on_ready=resume
 play_on_ready=true
 get_tree().reload_current_scene()

func restart_chapter(): load_chapter(chapter,false)

func save_checkpoint():
 if developer_mode or sampler==null or recovery_blocked or not SaveState.stable(story): return false
 if chapter<21: bank_memories()
 var ok=SaveState.write_payload(SaveState.capture(world,story,sampler,audio)) if chapter<21 else WorldSave.write(world,sampler,audio)
 save_error="" if ok else "Couldn't save progress. Please export a backup before closing."
 if ok:
  sampler.profile.last_world=chapter
  sampler.profile.save_profile()
  remember_saved_checkpoint()
 else: next_save_retry_tick=ticks+60
 return ok

func remember_saved_checkpoint():
 last_autosave_tick=ticks
 last_saved_room=world.active_id
 saved_phase=story.phase
 saved_checkpoint=world.checkpoint_id
 saved_deaths=sim.deaths
 saved_milestones=save_milestones()

func save_milestones():
 if chapter>=21:
  return [sim.core_run.index if sim.core_run!=null else -1, sampler.carrying(), sampler.failure_frames>0]
 var keepsake=story.get("drawing") if chapter<3 else story.get("badge")
 var clues=story.get("clues")
 return [story.photos.size(),story.done.size(),bool(keepsake.taken),int(story.get("crayons")) if chapter==1 else 0,clues.size() if clues!=null else 0]

func bank_memories():
 var key="felix-chapter-%d"%chapter
 var kept=sampler.profile.story_seen.get(key,{"photos":[],"secret":false,"crayons":0})
 for id in story.photos:
  if id not in kept.photos: kept.photos.append(id)
 var item=story.get("drawing") if chapter<3 else story.get("badge")
 if item!=null and item.taken: kept.secret=true
 if chapter==1: kept.crayons=maxi(int(kept.get("crayons",0)),story.crayons)
 sampler.profile.story_seen[key]=kept

func text(parent,value,size=20,color="#c9cfe8"):
 return crayon_label(parent,value,size,Color(color))

func focus_pause():
 var buttons=pause_box.find_children("*","Button",true,false)
 if not buttons.is_empty(): buttons[0].grab_focus()

func reset_dev_taps(): pass

func retry_room():
 if chapter>=21: sampler.retry(world)
 else:
  world.retry()
  world.active().deaths+=1
 sim=world.active()
 view.sim=sim
 view.active_position=world.placements[world.active_id]
 view.snap_actor()

func _exit_tree():
 if world!=null: world.shutdown()

func close_app():
 save_checkpoint()
 get_tree().quit()

func set_paused(value):
 if not value and graphics_photo!=null:
  graphics_photo.close()
  return
 if value: save_checkpoint()
 paused=value or (front_end!=null and front_end.visible)
 pause_box.visible=value
 audio.set_paused(value)
 # Let the selected score play while its menu is open for comparison.
 audio.music.stream_paused=false

func _input(event):
 if event is InputEventJoypadButton or event is InputEventJoypadMotion and absf(event.axis_value)>.5: Controls.using_controller=true
 elif event is InputEventKey or event is InputEventScreenTouch: Controls.using_controller=false

func input_hint(value):
 var hints={"SPACE   jump":["jump","jump"],"D + ARROWS   dash":["dash","aim and dash"],"HOLD A   cling and climb":["grab","hold to cling and climb"],"W   strike":["strike","strike"],"F   counter":["parry","counter"]}
 if not hints.has(value): return value
 var verb=hints[value][0]
 var label={"jump":"JUMP","dash":"DASH + stick","grab":"CARRY","strike":"STRIKE","parry":"PARRY"}[verb] if mobile and not Controls.using_controller else Controls.Remap.short_label(Controls.ACTIONS[verb],Controls.using_controller)
 return label+" · "+hints[value][1]

func _unhandled_input(event):
 if graphics_photo!=null: return
 if graphics_lab!=null and graphics_lab.handle_shortcut(event):
  get_viewport().set_input_as_handled()
  return
 if front_end!=null and front_end.visible or controls_menu!=null and controls_menu.visible or journal!=null and journal.visible: return
 if event.is_action_pressed("knight_pause") and (paused or graphics_lab.active or story.phase in ["play","ending"]):
  set_paused(not paused)
  return
 if story.phase=="black" and black_time>1.2 and (event is InputEventKey or event is InputEventJoypadButton or event is InputEventMouseButton or event is InputEventScreenTouch) and event.pressed:
  begin_play()
 if story.phase=="end" and end_shown and black_time>2.0 and (event is InputEventKey or event is InputEventJoypadButton or event is InputEventMouseButton or event is InputEventScreenTouch) and event.pressed:
  if chapter<3: load_chapter(chapter+1,false)
  else: front_end.open(false)

func _notification(what):
 if what==NOTIFICATION_WM_CLOSE_REQUEST: close_app()
 if what==NOTIFICATION_WM_GO_BACK_REQUEST:
  if journal!=null and journal.visible: journal.close()
  elif controls_menu!=null and controls_menu.visible: controls_menu.close()
  elif front_end!=null and front_end.visible: close_app()
  else: set_paused(not paused)
 if what in [NOTIFICATION_APPLICATION_FOCUS_OUT,NOTIFICATION_APPLICATION_PAUSED] and is_node_ready():
  pause_for_interruption()

func pause_for_interruption():
 # Developer screenshot runs may deliberately render in a background window.
 if not paused and capture_path=="":
  set_paused(true)
  if touch_controls!=null: touch_controls.release_all()
  focus_pause()

func gated(raw):
 if not story.gifts.legs: raw.jump=false
 if not story.gifts.cape: raw.dash=false
 if not story.gifts.arms: raw.grab=false
 if not story.gifts.get("sword",false) and not story.gifts.get("dagger",false): raw.strike=false
 if not story.gifts.get("counter",false): raw.parry=false
 if chapter<21: raw.portal=false
 return raw

func recorded_input():
 if script_frame>=script_tape.size(): return null
 var keys=script_tape[script_frame]
 script_frame+=1
 var raw={}
 var letters={"l":"l","r":"r","u":"u","d":"d","jump":"j","dash":"x","grab":"g","strike":"s","parry":"p","portal":"q"}
 for key in letters: raw[key]=letters[key] in keys
 return raw

var chain_puzzle=""
var chain_wait=0
func decode_input(keys):
 var raw={}
 var letters={"l":"l","r":"r","u":"u","d":"d","jump":"j","dash":"x","grab":"g","strike":"s","parry":"p","portal":"q"}
 for key in letters: raw[key]=letters[key] in keys
 return raw

func scripted_input():
 if not chain: return recorded_input()
 var id=world.active_id
 if not sim.room.def.get("campaignWorkshop",false) or world.campaign_completed.has(id): return decode_input("r")
 if chain_puzzle!=id:
  if chain_wait>0:
   chain_wait-=1
   return decode_input("")
  var spawn=sim.room.spawn
  var approach=world.road_approach_active(id)
  var target=maxf(0,spawn.x-16) if approach else spawn.x
  if approach and sim.p.x>=spawn.x-16 and absf(sim.p.vx)<.1 and sim.p.onGround:
   chain_wait=4
   return decode_input("r")
  var dx=target-sim.p.x
  if absf(dx)<.1 and absf(sim.p.vx)<.1 and sim.p.onGround and not approach:
   if is_equal_approx(absf(sim.p.remX),.5):
    chain_wait=4
    return decode_input("l" if sim.p.remX>0 else "r")
   chain_puzzle=id
   script_tape=[]
   script_frame=0
   for part in world.data.world.tapes.get(id,[]):
    for i in range(int(part[0])): script_tape.append(part[1])
   return decode_input("")
  var aim=dx-sim.p.vx*absf(sim.p.vx)/(2*float(sim.K.runReduce))
  return decode_input("r" if aim>.25 else "l" if aim< -.25 else "")
 return recorded_input()

func _physics_process(_delta):
 ticks+=1
 if report and ticks%300==0: print("FPS ",Engine.get_frames_per_second()," AT ",world.active_id," p=",Vector2(sim.p.x,sim.p.y)," state=",sim.p.state," deaths=",sim.deaths," tape=",script_frame,"/",script_tape.size()," phase=",story.phase)
 if capture_path!="" and ticks==capture_after: capture.call_deferred()
 if paused: return
 var capture_start=Time.get_ticks_usec() if capture_path!="" and ticks>30 else 0
 if story.phase=="black" and not script_tape.is_empty() and ticks==40: begin_play()
 if not story.blocking():
  var before=view.before_tick()
  var raw=scripted_input()
  if raw==null: raw=Controls.read()
  world.step(gated(raw))
  var effects=view.after_tick(before)
  audio.events(effects)
  audio.tick(sim,1.0/60.0)
  world.notices.clear()
  if world.update_region():
   sim=world.active()
   view.sim=sim
   view.active_position=world.placements[world.active_id]
   view.snap_actor()
   if report: print("ROOM ",world.active_id," deaths=",sim.deaths," frame=",ticks)
   save_checkpoint()
  var retry=Input.is_action_pressed("knight_retry")
  if retry and not retry_held and sim.p.state not in ["dead","respawn"]: retry_room()
  retry_held=retry
 else:
  view.previous_actor=view.current_actor
 if chapter<21:
  sampler.profile.tick(world.active_id,maxi(0,sim.deaths-sampler.last_deaths))
  sampler.last_deaths=sim.deaths
 story.tick(world,sim,1.0/60.0)
 if sim!=world.active():
  sim=world.active()
  view.load_scene(sim)
 for id in world.campaign_completed: sampler.profile.mark_clear(id)
 if chapter<21 and story.phase=="end" and not sampler.profile.run.finished:
  sampler.profile.finish(world.data.world.campaignWorkshop.rooms)

 if story.ride!=null:
  var point=story.ride_point(1.0/60.0)
  if point==null:
   var landing=story.ride.landing
   story.ride=null
   view.riding=false
   world.enter(landing,true)
   sim=world.active()
   view.sim=sim
   view.active_position=world.placements[landing]
   view.snap_actor()
   if report: print("ROOM ",landing," (basket) frame=",ticks)
   if chain and sim.room.def.get("campaignWorkshop",false):
    # Lowered straight into a room: play its route from the start.
    pending_room=landing
    script_tape=[]
    for i in range(60): script_tape.append("")
    script_frame=0
   elif chain: walk_into_next()
  else:
   view.riding=true
   view.previous_actor=view.current_actor
   view.current_actor=point
 # A cut in the story (into Dad's tale, or back out of it): a short fade, then that place.
 if story.get("cut")!=null and story.cut!="":
  var to=story.cut
  story.cut=""
  go_to(to)
  script_tape=[]
 if story.get("snap_request")==true:
  story.snap_request=false
  view.snap_actor()
 if story.door_slam:
  story.door_slam=false
  audio.effect("gate",1.0)
 if story.pulse_request>0:
  view.gift_pulse=story.pulse_request
  view.burst(view.current_actor+Vector2(4,5),18,Color("#fff4d6"),26)
  story.pulse_request=0.0
 # Keep immediate saves at progress boundaries; otherwise limit expensive full snapshots.
 var boundary=last_saved_room!=world.active_id or saved_phase!=story.phase or saved_checkpoint!=world.checkpoint_id or saved_deaths!=sim.deaths or saved_milestones!=save_milestones()
 if not developer_mode and ticks>=next_save_retry_tick and (boundary or ticks-last_autosave_tick>=600): save_checkpoint()
 if capture_start>0: capture_physics_times.append((Time.get_ticks_usec()-capture_start)/1000.0)

func _process(delta):
 if capture_path!="" and ticks>30 and not paused:
  var now=Time.get_ticks_usec()
  if last_capture_frame_usec>0: capture_wall_times.append((now-last_capture_frame_usec)/1000.0)
  last_capture_frame_usec=now
 black_time+=delta
 # The black opening: a child crying somewhere in a dark room.
 if story.phase=="black":
  cover.color.a=1.0
  title_main.modulate.a=clamp((black_time-.6)/1.2,0,1)
  prompt_label.text="press any button" if black_time>2.2 else ""
  prompt_label.modulate.a=.5+sin(black_time*2)*.3
 elif story.phase=="play" or story.phase=="ending":
  cover.color.a=max(0,cover.color.a-delta*.6)
 if story.phase=="end":
  if not end_shown:
   end_shown=true
   black_time=0
   end_stats.text=story.end_stats() if story.has_method("end_stats") else "%d %s   ·   %d photos   ·   crayons found: %d of 3%s"%[story.deaths_at_end,"fall" if story.deaths_at_end==1 else "falls",story.photos.size(),story.crayons,"   ·   the first drawing" if story.drawing.taken else ""]
  cover.color.a=min(.88,cover.color.a+delta*.5)
  end_box.visible=black_time>1.0
  end_box.modulate.a=clamp((black_time-1.0)/1.5,0,1)
 # Music arrives once the boy stops crying.
 var want=chapter_music.volume_db(story.music_level(),paused)
 music_db=lerp(music_db,want,1-exp(-delta*.5))
 audio.music.volume_db=music_db
 update_lines()
 if not paused and story.phase!="black": recovery_time=maxf(0.0,recovery_time-delta)
 var message=save_error if save_error!="" else (recovery_notice if recovery_time>0.0 or recovery_blocked else "")
 hint_label.text=message if message!="" else input_hint(story.hint.text)
 hint_label.modulate.a=1.0 if message!="" else clamp(story.hint.life,0,1)

func anchor_point(anchor):
 var camera=view.camera
 if story.has_method("anchor_at"):
  var spoken=story.anchor_at(anchor)
  if spoken!=null: return (spoken-camera)*4+Vector2(0,48)
 match anchor:
  "boy":
   var b=story.boy
   var head=b.position+Vector2(0,-130 if b.pose in ["stand","run","wave","point"] else (-100 if b.pose=="kneel" else -90))
   if b.pose=="bed": head=b.position+Vector2(0,-30)
   return (head-camera)*4+Vector2(0,48)
  "bed": return (story.boy.position+Vector2(0,-30)-camera)*4+Vector2(0,48)
  "above": return Vector2(640,120)
  "below": return Vector2(640,690)
 return Vector2(640,200)

func update_lines():
 var shown=story.lines.filter(func(l):return l.get("delay",0)<=0)
 for i in range(line_labels.size()):
  var label=line_labels[i]
  if i>=shown.size():
   label.hide()
   continue
  var line=shown[i]
  label.show()
  label.text=line.text
  var point=anchor_point(line.anchor)
  point.x=clamp(point.x,360,920)
  point.y=clamp(point.y,90,740)
  label.position=point-Vector2(350,24+i*40)
  label.modulate.a=clamp(min(line.life,(line.max-line.life)*4),0,1)

# Rooms that are not joined in space: a short fade, then the next one.
func go_to(id):
 cover.color.a=.9
 var total_deaths=sim.deaths
 world.enter(id,true)
 sim=world.active()
 sim.deaths=total_deaths
 view.load_scene(sim)
 # A chapter cut must retain the score selected in the merged Music menu.
 var selected_score=audio.music.stream
 var score_position=audio.music.get_playback_position()
 audio.room_changed(sim)
 if chapter_music!=null and chapter_music.selected>=0:
  audio.music.stream=selected_score
  audio.music.play(score_position)
 if report: print("ROOM ",id," deaths=",sim.deaths," frame=",ticks)
 if chain:
  script_tape=[]
  script_frame=0
  for part in world.data.world.tapes.get(id,[]):
   for i in range(int(part[0])): script_tape.append(part[1])

# Route checks: walk from the landing to the next hatch and drop in, then play that room's
# stored route from its authored start.
var walking_in=false
var pending_room=""
func walk_into_next():
 walking_in=true
 script_tape=[]
 script_frame=0
 for i in range(900): script_tape.append("r")

func load_script(name):
 var plans={
  "left":[[40,""],[120,"l"]],
  "stair":[[40,""],[100,"l"],[1,"j"],[16,"j"],[40,""],[1,"j"],[16,"j"],[40,""],[1,"j"],[16,"j"],[40,""],[700,"r"],[200,""]],
  "prologue":[[60,""],[150,"r"],[200,""],[30,"r"],[1,"rj"],[14,"rj"],[40,"r"],[210,""],[60,"r"],[200,""]],
 }
 for part in plans.get(name,[]):
  for i in range(int(part[0])): script_tape.append(part[1])

func play_reference(room_id):
 # Drive the live world with the room's original reference recording.
 story.skip_prologue()
 begin_play()
 world.enter(room_id,true)
 sim=world.active()
 view.load_scene(sim)
 for part in world.data.world.tapes.get(room_id,[]):
  for i in range(int(part[0])): script_tape.append(part[1])

# Chapter Two's whole road from Codex's recorded tour, played from its first room with every
# story scene on the way (the tape waits while a scene holds the world still).
func play_tour():
 var recording=JSON.parse_string(FileAccess.get_file_as_string("res://data/world%d-tour.json"%chapter))
 begin_play()
 world.enter(recording.visited[0],true)
 sim=world.active()
 view.load_scene(sim)
 for part in recording.tape:
  for i in range(int(part[0])): script_tape.append(part[1])
 # The recording stops at the overlook's top; walk down the decks to Dad's cabin.
 for i in range(700 if chapter==2 else 240): script_tape.append("l" if chapter==2 else "r")

func open_graphics_photo():
 if graphics_photo!=null or not paused or not graphics_lab.active or (front_end!=null and front_end.visible) or story.phase not in ["play","ending"]: return
 if touch_controls!=null: touch_controls.release_all()
 graphics_photo=GraphicsPhoto.new()
 add_child(graphics_photo)
 graphics_photo.closed.connect(func():
  graphics_photo=null
  graphics_lab.photo_button.grab_focus())
 graphics_photo.setup(self,viewport,view,graphics_lab,"Felix")

func apply_graphics_lab():
 if graphics_lab==null: return
 var home=chapter if chapter<21 else (chapter-100 if chapter>=101 else chapter-20)
 graphics_lab.apply(view,world_container,2 if mobile or chapter in [2,22,102] else 1,home)

func capture():
 for i in range(3): await get_tree().process_frame
 # A window in the background may not have been redrawn lately; draw this frame now.
 _process(0.0)
 view._process(0.0)
 RenderingServer.force_draw(false)
 var error=get_viewport().get_texture().get_image().save_png(capture_path)
 var result={"room":world.active_id,"graphics":graphics_lab.diagnostics(world_container),"wall_frame_ms":GraphicsLab.timing_stats(capture_wall_times),"physics_ms":GraphicsLab.timing_stats(capture_physics_times),"draw_calls":Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME),"draw_cpu_us":view.draw_cpu_us}
 var file=FileAccess.open(capture_path+".json",FileAccess.WRITE)
 if file!=null: file.store_string(JSON.stringify(result,"  "))
 get_tree().quit(error)

func export_portable_save():
 save_checkpoint()
 sampler.profile.save_profile()
 var bundle=SaveTransfer.export_bundle()
 if OS.has_feature("web"):
  JavaScriptBridge.download_buffer(bundle.to_utf8_buffer(),"Felix-save.json","application/json")
  transfer_status.text="Save exported. Keep this file to move or back up your progress."
 else:
  open_transfer_dialog(true,bundle)
func import_portable_save():
 if OS.has_feature("web"):
  web_import_callback=JavaScriptBridge.create_callback(func(args):receive_portable_save(str(args[0])))
  var browser=JavaScriptBridge.get_interface("window")
  browser.felixImportSave=web_import_callback
  JavaScriptBridge.eval("""(() => { const input=document.createElement('input'); input.type='file'; input.accept='.json,application/json'; input.onchange=async()=>{const file=input.files[0];if(!file)return;if(file.size>33554432){window.felixImportSave('');return;}window.felixImportSave(await file.text());}; input.click(); })()""",true)
 else:
  open_transfer_dialog(false)
func open_transfer_dialog(exporting,bundle=""):
 if is_instance_valid(transfer_dialog): transfer_dialog.queue_free()
 transfer_dialog=FileDialog.new()
 transfer_dialog.use_native_dialog=true
 transfer_dialog.access=FileDialog.ACCESS_FILESYSTEM
 transfer_dialog.file_mode=FileDialog.FILE_MODE_SAVE_FILE if exporting else FileDialog.FILE_MODE_OPEN_FILE
 transfer_dialog.filters=PackedStringArray(["*.json ; Felix save"])
 transfer_dialog.title="Export Felix save" if exporting else "Import Felix save"
 if exporting: transfer_dialog.current_file="Felix-save.json"
 transfer_dialog.file_selected.connect(func(path):
  if exporting:
   var file=FileAccess.open(path,FileAccess.WRITE)
   if file==null: transfer_status.text="Cannot write the save file."
   else:
    file.store_string(bundle);file.close()
    transfer_status.text="Save exported."
  else:
   var file=FileAccess.open(path,FileAccess.READ)
   if file==null or file.get_length()>SaveTransfer.LIMIT: transfer_status.text="Cannot read this save file."
   else: receive_portable_save(file.get_as_text()))
 add_child(transfer_dialog)
 transfer_dialog.popup_centered_ratio(0.7)
func receive_portable_save(source):
 var error=SaveTransfer.import_bundle(source)
 if error!="":
  transfer_status.text=error
  return
 # Reload from the imported files without saving the outgoing in-memory run.
 resume_on_ready=true
 booted=false
 play_on_ready=false
 get_tree().reload_current_scene()
