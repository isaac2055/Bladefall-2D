extends Node
## Existing project recordings only. Buses isolate dialogue and duck music without cutting a line.
signal spoken(name: String, text: String, seconds: float)
var world_runtime=null
var manifest = {}
var cache = {}
var music: AudioStreamPlayer
var ambience: AudioStreamPlayer
var speech: AudioStreamPlayer
var fire: AudioStreamPlayer
var voices_enabled = true
var heard = {}
var voice_queue = []
var active_voice = {}
var counts = {"effects":0,"voices":0,"steps":0}
var cycle = {}
var elapsed = 0.0
var effort_time = -10.0
var foot_clock = 0.0
var work_clock = 0.0
var paused = false
var levels = {"Master":1.0,"Music":0.55,"Effects":0.7,"Voices":0.9,"Ambience":0.4,"Efforts":0.7,"Interface":0.7}
var effect_levels={}
var last_effect=""
var capture_effect: AudioEffectCapture
var recorded = PackedVector2Array()
const EVENT_CLIPS = {"pollen-slow":"rune","land-heavy":"land-hard","sentinel-bell":"bell","sentinel-stun":"stone-hit","sentinel-relocate":"shatter","oath-taken":"rune","oath-roots":"crumble","root-cut":"swing","zip-in":"zip","zip-out":"grab","hook":"grab","moving-hook":"grab","unhook":"grab","moving-unhook":"grab","mirror":"lever","shutter-open":"lever","shutter-shut":"stone-hit","feather":"gem","feather-back":"gem","anvil":"stone-hit","void-in":"portal","void-out":"portal","gravity":"rune","portal-open":"portal","portal-pass":"portal","portal-close":"lever","portal-fizzle":"stone-hit","parry":"parry","parry-success":"parry","boost":"zip","switch-high":"lever","switch-low":"lever","cart-bump":"stone-hit","cart-land":"land-hard","stone-hit":"stone-hit","stone-stop":"stone-hit","recoil-load":"lever","recoil-release":"zip","recoil-jam":"stone-hit","hinge-turn":"lever","hinge-jam":"stone-hit","brute-crack":"shatter","brute-stamp":"land-hard","enemy-tell":"stone-hit","breach":"shatter","enemy-defeat":"shatter","jump":"jump","walljump":"walljump","super":"dash","hyper":"dash","wallbounce":"walljump","dash-start":"dash","land":"land-soft","refill":"gem","death":"death","strike":"swing","stone-lit":"rune","gate-open":"gate","crumble":"crumble","crumble-shake":"crumble","shard":"gem","zip-start":"zip","zip-stop":"stone-hit","pickup":"lantern","throw":"dash","plate":"plate","held-open":"lever","held-close":"lever","lantern-lost":"shatter","climbhop":"grab","grab":"grab"}
func _ready():
 manifest = JSON.parse_string(FileAccess.get_file_as_string("res://data/audio.json"))
 # Warm the reused resources before gameplay; first hits/lines do not load files mid-frame.
 for recording in manifest.files: stream(recording.path)
 for bus in levels:
  if AudioServer.get_bus_index(bus)<0:
   AudioServer.add_bus()
   AudioServer.set_bus_name(AudioServer.bus_count-1,bus)
   AudioServer.set_bus_send(AudioServer.bus_count-1,"Master")
 apply_levels()
 var index = AudioServer.get_bus_index("Master")
 if AudioServer.get_bus_effect_count(index)==0:
  var limiter = AudioEffectLimiter.new()
  limiter.ceiling_db = -0.6
  AudioServer.add_bus_effect(index,limiter)
 music = player("Music")
 music.stream = stream(manifest.music,true)
 music.volume_db = -8
 music.play()
 ambience = player("Ambience")
 ambience.stream = stream(manifest.ambience,true)
 ambience.volume_db = -10
 ambience.play()
 fire = player("Ambience")
 fire.stream = stream(manifest.effects["spot-fire"][0],true)
 fire.volume_db = -40
 fire.play()
 speech = player("Voices")
 speech.finished.connect(func():active_voice = {})
 apply_levels()
func player(bus):
 var node = AudioStreamPlayer.new()
 node.bus = bus
 add_child(node)
 return node
func stream(relative,loop = false):
 var key = relative+str(loop)
 if not cache.has(key):
  var original = load("res://audio/"+relative)
  assert(original is AudioStreamMP3,"Missing recorded stream: "+relative)
  var clip = original.duplicate()
  clip.loop = loop
  cache[key] = clip
 return cache[key]
func apply_levels():
 for bus in levels:
  AudioServer.set_bus_volume_db(AudioServer.get_bus_index(bus),linear_to_db(max(0.0001,levels[bus])))
  AudioServer.set_bus_mute(AudioServer.get_bus_index(bus),levels[bus]<=0.0001)
func effect(name,gain = 1.0,pitch = 1.0,preview=false):
 if name=="ui-pause" or float(effect_levels.get(name,1.0))<=0: return
 if not manifest.effects.has(name): return
 var files = manifest.effects[name]
 var index = cycle.get(name,0)%files.size()
 cycle[name] = index+1
 var node = player("Efforts" if name.begins_with("kn-") else "Interface" if name.begins_with("ui-") else "Effects")
 node.set_meta("preview",preview)
 node.set_meta("effect_name",name)
 node.set_meta("base_gain",.48*gain)
 last_effect=name
 node.stream = stream(files[index])
 node.volume_db = linear_to_db(max(0.0001,0.48*gain*float(effect_levels.get(name,1.0))))
 node.pitch_scale = pitch
 node.finished.connect(node.queue_free)
 node.play()
 counts.effects += 1
func set_effect_level(name,value):
 effect_levels[name]=clampf(value,0,1)
 refresh_effect_levels()
func refresh_effect_levels():
 for node in get_children():
  if node is AudioStreamPlayer and node.has_meta("effect_name"):
   var level=float(effect_levels.get(node.get_meta("effect_name"),1.0))
   if level<=0:
    node.stop()
    node.queue_free()
   else: node.volume_db=linear_to_db(max(.0001,node.get_meta("base_gain")*level))
func stop_previews():
 for node in get_children():
  if node is AudioStreamPlayer and node.get_meta("preview",false):
   node.stop()
   node.queue_free()
func preview_effect(name):
 stop_previews()
 effect(name,1.0,1.0,true)
func preview_path(path,bus):
 stop_previews()
 var node=player(bus)
 node.set_meta("preview",true)
 node.stream=stream(path)
 node.volume_db=-8 if bus=="Music" else -10 if bus=="Ambience" else -1 if bus=="Voices" else 0
 node.finished.connect(node.queue_free)
 node.play()
func events(types):
 for kind in types:
  if EVENT_CLIPS.has(kind): effect(EVENT_CLIPS[kind],0.32 if kind=="crumble-shake" else 1.0)
  if kind=="death": effort("kn-death",true)
  elif kind in ["jump","walljump","super","hyper","dash-start","climbhop"] and elapsed-effort_time>1.6 and not speech.playing and (cycle.get("effort",0)%3)==0:
   effort("kn-dash" if kind=="dash-start" else ("kn-climb" if kind=="climbhop" else "kn-jump"))
  if kind in ["jump","walljump","super","hyper","dash-start","climbhop"]: cycle.effort = cycle.get("effort",0)+1
func effort(name,force = false):
 if speech.playing and not force: return
 effort_time = elapsed
 effect(name,0.58)
func room_changed(core=null):
 if world_runtime!=null:
  var chapter=manifest.chapters.get(str(int(world_runtime.data.world.n)),manifest.chapters["1"])
  var id=core.room.id if core!=null else world_runtime.active_id
  var boss=id in ["cl3-c3-brace","cl3-bank-b68","cl23-fc23-standard","cl23-fc23-west","cl23-fc23-east","cl23-bank-f69"]
  var score=stream(chapter.get("bossMusic",chapter.music) if boss else chapter.music,true)
  if music.stream!=score:
   music.stream=score
   music.play()
 # A heard line finishes naturally across a doorway; repeated retry does not restart the recording.
 foot_clock = 0.1
func tick(core,delta):
 elapsed += delta
 if paused: return
 if world_runtime!=null and int(world_runtime.data.world.n)==3 and world_runtime.quest_complete and not heard.has("defector:done"):
  # The hook is the hand-in. Retire the carry instruction at that exact beat.
  heard["defector:done"]=true
  var reminder=manifest.voices["defector:line1"].id
  var offer=manifest.voices["defector:line0"].id
  voice_queue=voice_queue.filter(func(line):return line.id!=reminder and line.id!=offer)
  speech.stop()
  say(manifest.voices["defector:done"])
 var p = core.p
 if p.onGround and p.state=="normal" and abs(p.vx)>20:
  foot_clock -= delta
  if foot_clock<=0:
   effect("step-dirt",0.42,1.0+sin(elapsed)*0.025)
   counts.steps += 1
   foot_clock = 0.26
 else: foot_clock = min(foot_clock,0.07)
 work_clock -= delta
 if work_clock<=0 and (p.state=="climb" and abs(p.vy)>4 or p.state=="normal" and p.vy>0 and core.climb_check(p.facing)):
  effect("wallslide",0.2)
  work_clock = 0.35
  if elapsed-effort_time>2.8 and not speech.playing: effort("kn-climb")
 for who in core.room.def.get("people",[]):
  if abs(p.x+4-who.c*8)<44 and abs(p.y+11-(who.r*8+8))<25:
   var key = core.room.id+":"+who.who+":line"
   if world_runtime!=null and world_runtime.branch_hearts.has(who.get("quest","")) and who.has("lineDone"): key=core.room.id+":"+who.who+":lineDone"
   if who.who=="mara" and world_runtime!=null and world_runtime.mara_complete:
    key="cl1-o1-muster:mara:lineDone"
    world_runtime.register_mara()
   if who.who=="elsie" and world_runtime!=null and int(world_runtime.data.world.n)==2:
    # Hand-in triggers inside this approach radius. Do not start the carry reminder
    # on the last few steps home and leave it speaking over the completion line.
    if world_runtime.quest_lantern and not world_runtime.quest_complete: continue
    key=world_runtime.elsie_voice()
   if who.who=="silas" and world_runtime!=null and int(world_runtime.data.world.n)==3: key=world_runtime.silas_voice()
   if not heard.has(key):
    heard[key] = true
    if manifest.voices.has(key): voice_queue.append(manifest.voices[key])
    else: spoken.emit(who.get("name",who.who.capitalize()),who.line,6.0)
 if not speech.playing and not voice_queue.is_empty(): say(voice_queue.pop_front())
 var fires = core.room.def.get("decor",[]).filter(func(d):return d.k=="watchfire")
 var distance = abs(p.x-fires[0].c*8) if not fires.is_empty() else 1000.0
 fire.volume_db = lerp(fire.volume_db,linear_to_db(max(0.0001,0.35*(1-clamp(distance/150,0,1)))),0.08)
func say(line):
 active_voice = line
 spoken.emit(line.name,line.text,line.seconds)
 if voices_enabled:
  speech.stream = stream(line.path)
  speech.volume_db = -1
  speech.play()
  counts.voices += 1
func set_paused(value):
 paused = value
 for node in get_children():
  if node is AudioStreamPlayer: node.stream_paused = value
func _process(delta):
 if not is_instance_valid(music): return
 music.volume_db = move_toward(music.volume_db,-17.0 if speech.playing else -8.0,delta*16)
 if capture_effect!=null:
  var count = capture_effect.get_frames_available()
  if count>0: recorded.append_array(capture_effect.get_buffer(count))
func start_capture():
 capture_effect = AudioEffectCapture.new()
 capture_effect.buffer_length = 2.0
 AudioServer.add_bus_effect(0,capture_effect)
func save_capture(path):
 var file = FileAccess.open(path,FileAccess.WRITE)
 var bytes = recorded.size()*4
 file.store_buffer("RIFF".to_ascii_buffer())
 file.store_32(bytes+36)
 file.store_buffer("WAVEfmt ".to_ascii_buffer())
 file.store_32(16)
 file.store_16(1)
 file.store_16(2)
 file.store_32(int(AudioServer.get_mix_rate()))
 file.store_32(int(AudioServer.get_mix_rate())*4)
 file.store_16(4)
 file.store_16(16)
 file.store_buffer("data".to_ascii_buffer())
 file.store_32(bytes)
 for sample in recorded:
  file.store_16(int(clamp(sample.x,-1,1)*32767)&65535)
  file.store_16(int(clamp(sample.y,-1,1)*32767)&65535)
 file.close()

func shutdown():
 if capture_effect!=null:
  for i in range(AudioServer.get_bus_effect_count(0)-1,-1,-1):
   if AudioServer.get_bus_effect(0,i)==capture_effect: AudioServer.remove_bus_effect(0,i)
  capture_effect = null
 for node in get_children():
  if node is AudioStreamPlayer:
   node.stop()
   node.stream = null
 cache.clear()

func _exit_tree(): shutdown()

func restart_world():
 heard.clear()
 voice_queue.clear()
 active_voice={}
 speech.stop()
 music.seek(0)
 foot_clock=0

func change_chapter(number):
 var chapter=manifest.chapters.get(str(number),manifest.chapters["1"])
 music.stream=stream(chapter.music,true)
 music.play()
 ambience.stream=stream(chapter.ambience,true)
 ambience.play()
 speech.stop()
 voice_queue.clear()
 active_voice={}
