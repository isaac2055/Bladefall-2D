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
const NUMBERS=["","One","Two","Three"]
const Controls=preload("res://scripts/controls.gd")
const Sound=preload("res://scripts/audio.gd")
const ChapterMusic=preload("res://scripts/felix_music.gd")

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
 RenderingServer.set_default_clear_color(Color("05060a"))
 crayon=SystemFont.new()
 crayon.font_names=PackedStringArray(["Chalkboard SE","Marker Felt","Comic Sans MS","Noteworthy"])
 var args=OS.get_cmdline_user_args()
 if args.has("--chapter"): chapter=int(args[args.find("--chapter")+1])
 var data=JSON.parse_string(FileAccess.get_file_as_string("res://data/world%d.json"%chapter))
 world=World.new(data)
 sim=world.active()
 story=[Story,Story,WoodsStory,PhantomStory][chapter].new(world)
 audio=Sound.new()
 audio.levels.Efforts=0.0
 audio.levels.Ambience=0.0
 audio.levels.Music=0.45
 audio.world_runtime=world
 add_child(audio)
 audio.music.volume_db=-80
 var container=SubViewportContainer.new()
 container.position=Vector2(0,48)
 container.size=Vector2(1280,736)
 container.stretch=true
 viewport=SubViewport.new()
 viewport.size=Vector2i(1280,736)
 viewport.canvas_item_default_texture_filter=Viewport.DEFAULT_CANVAS_ITEM_TEXTURE_FILTER_NEAREST
 container.add_child(viewport)
 add_child(container)
 view=[View,View,WoodsView,PhantomView][chapter].new()
 view.scale=Vector2(4,4)
 view.world_data=world.data
 view.runtime=world
 view.story=story
 viewport.add_child(view)
 view.load_scene(sim)
 audio.room_changed(sim)
 chapter_music=ChapterMusic.new()
 chapter_music.setup(audio.music)
 build_interface()
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
 crayon_label(end_box,"Chapter %s  ·  %s"%[NUMBERS[chapter],NAMES[chapter]],28,Color("#c9cfe8"))
 end_stats=crayon_label(end_box,"",22,Color("#9aa3c4"))
 crayon_label(end_box,"to be continued" if chapter==3 else "press any button for Chapter %s"%NUMBERS[chapter+1],20,Color("#6f7694"))
 pause_box=PanelContainer.new()
 var panel=StyleBoxFlat.new()
 panel.bg_color=Color(.04,.05,.09,.92)
 panel.set_corner_radius_all(10)
 panel.content_margin_left=28
 panel.content_margin_right=28
 panel.content_margin_top=22
 panel.content_margin_bottom=22
 pause_box.add_theme_stylebox_override("panel",panel)
 pause_box.position=Vector2(400,215)
 pause_box.size=Vector2(480,390)
 pause_box.hide()
 ui.add_child(pause_box)
 var column=VBoxContainer.new()
 column.add_theme_constant_override("separation",12)
 pause_box.add_child(column)
 crayon_label(column,"paused",30,Color("#fff1c9"))
 crayon_label(column,"Music",20,Color("#c9cfe8"))
 music_picker=OptionButton.new()
 music_picker.add_theme_font_override("font",crayon)
 music_picker.add_theme_font_size_override("font_size",20)
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
 for item in [["Keep climbing",func():set_paused(false)],["Begin the chapter again",restart_chapter],["Chapter %s"%NUMBERS[chapter%3+1],func():chapter=chapter%3+1;restart_chapter()],["Quit",func():get_tree().quit()]]:
  var button=Button.new()
  button.text=item[0]
  button.add_theme_font_override("font",crayon)
  button.add_theme_font_size_override("font_size",22)
  button.pressed.connect(item[1])
  column.add_child(button)

func crayon_label(parent,value,size,color):
 var label=Label.new()
 label.text=value
 label.add_theme_font_override("font",crayon)
 label.add_theme_font_size_override("font_size",size)
 label.add_theme_color_override("font_color",color)
 label.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
 parent.add_child(label)
 return label

func begin_play():
 story.start()
 title_box.hide()

func restart_chapter():
 get_tree().reload_current_scene()

func set_paused(value):
 paused=value
 pause_box.visible=value
 audio.set_paused(value)
 # Let the selected score play while its menu is open for comparison.
 audio.music.stream_paused=false

func _unhandled_input(event):
 if event.is_action_pressed("knight_pause") and story.phase in ["play","ending"]:
  set_paused(not paused)
  return
 if story.phase=="black" and black_time>1.2 and (event is InputEventKey or event is InputEventJoypadButton) and event.pressed:
  begin_play()
 if story.phase=="end" and end_shown and black_time>2.0 and (event is InputEventKey or event is InputEventJoypadButton) and event.pressed:
  if chapter<3: chapter+=1
  restart_chapter()

func _notification(what):
 if what==NOTIFICATION_WM_CLOSE_REQUEST: get_tree().quit()

func gated(raw):
 if not story.gifts.legs: raw.jump=false
 if not story.gifts.cape: raw.dash=false
 if not story.gifts.arms: raw.grab=false
 if not story.gifts.get("sword",false) and not story.gifts.get("dagger",false): raw.strike=false
 if not story.gifts.get("counter",false): raw.parry=false
 raw.portal=false
 return raw

func scripted_input():
 if script_frame>=script_tape.size(): return null
 var keys=script_tape[script_frame]
 script_frame+=1
 var raw={}
 var letters={"l":"l","r":"r","u":"u","d":"d","jump":"j","dash":"x","grab":"g","strike":"s","parry":"p","portal":"q"}
 for key in letters: raw[key]=letters[key] in keys
 return raw

func _physics_process(_delta):
 ticks+=1
 if report and ticks%300==0: print("FPS ",Engine.get_frames_per_second()," AT ",world.active_id," p=",Vector2(sim.p.x,sim.p.y)," state=",sim.p.state," deaths=",sim.deaths," tape=",script_frame,"/",script_tape.size()," phase=",story.phase)
 if capture_path!="" and ticks==capture_after: capture.call_deferred()
 if paused: return
 if story.phase=="black" and not script_tape.is_empty() and ticks==40: begin_play()
 if chain and pending_room!="" and script_frame>=script_tape.size():
  var spawn=world.parsed[pending_room].spawn
  print("LANDED ",pending_room," at ",Vector2(sim.p.x,sim.p.y)," spawn ",Vector2(spawn.x,spawn.y)," state=",sim.p.state," deaths=",sim.deaths)
  world.enter(pending_room,true)
  sim=world.active()
  view.load_scene(sim,true)
  script_tape=[]
  script_frame=0
  for part in world.data.world.tapes.get(pending_room,[]):
   for i in range(int(part[0])): script_tape.append(part[1])
  pending_room=""
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
   if chain and walking_in and sim.room.def.get("campaignWorkshop",false):
    walking_in=false
    pending_room=sim.room.id
    script_tape=[]
    for i in range(240): script_tape.append("")
    script_frame=0
   view.sim=sim
   view.active_position=world.placements[world.active_id]
   view.snap_actor()
   if report: print("ROOM ",world.active_id," deaths=",sim.deaths," frame=",ticks)
  var retry=Input.is_action_pressed("knight_retry")
  if retry and not retry_held and sim.p.state not in ["dead","respawn"]:
   world.retry()
   sim=world.active()
   view.snap_actor()
  retry_held=retry
 else:
  view.previous_actor=view.current_actor
 story.tick(world,sim,1.0/60.0)
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

func _process(delta):
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
 hint_label.text=story.hint.text
 hint_label.modulate.a=clamp(story.hint.life,0,1)

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
 world.enter(id,true)
 sim=world.active()
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

func capture():
 for i in range(3): await get_tree().process_frame
 # A window in the background may not have been redrawn lately; draw this frame now.
 _process(0.0)
 view._process(0.0)
 RenderingServer.force_draw(false)
 get_viewport().get_texture().get_image().save_png(capture_path)
 get_tree().quit()
