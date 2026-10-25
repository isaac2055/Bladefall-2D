extends Node
signal spoken(name,text,seconds)
signal quiet
var manifest
var music: AudioStreamPlayer
var ambience: AudioStreamPlayer
var fire: AudioStreamPlayer
var old_music: AudioStreamPlayer
var speech: AudioStreamPlayer
var cache={}
var cycle={}
var levels={"Music":0.5,"Effects":0.7,"Voices":0.9,"Ambience":0.4}
var voices_enabled=true
var paused=false
var queue=[]
var active={}
var subtitle_time=0.0
var stage=-1
var footsteps=0.0
var counts={"effects":0,"voices":0,"steps":0}
var capture_effect: AudioEffectCapture
var recorded=PackedVector2Array()
const FX={"jump":"jump","clang":"stone-hit","root-attack":"crumble","launch":"zip","land":"land-soft","bearing":"rune","quest":"quest","swing":"swing","hit":"stone-hit","chop":"stone-hit","roots":"gate","kill":"shatter","hurt":"stone-hit","death":"death","respawn":"rune","weapon":"lantern","ward":"gem","flag":"plate","gate":"gate","bell":"lever","pickup":"lantern","moths":"work-cloth","page":"work-pages","rest":"rune","ride":"zip"}
func _ready():
 manifest=JSON.parse_string(FileAccess.get_file_as_string("res://data/audio.json"))
 for bus in levels:
  if AudioServer.get_bus_index(bus)<0:
   AudioServer.add_bus()
   AudioServer.set_bus_name(AudioServer.bus_count-1,bus)
   AudioServer.set_bus_send(AudioServer.bus_count-1,"Master")
 apply_levels()
 if AudioServer.get_bus_effect_count(0)==0:
  var limiter=AudioEffectLimiter.new()
  limiter.ceiling_db=-0.6
  AudioServer.add_bus_effect(0,limiter)
 music=player("Music")
 ambience=player("Ambience")
 speech=player("Voices")
 fire=player("Ambience")
 fire.stream=stream(manifest.effects["spot-fire"][0],true)
 fire.volume_db=-60
 fire.play()
func player(bus):
 var node=AudioStreamPlayer.new()
 node.bus=bus
 add_child(node)
 return node
func stream(path,loop=false):
 var key=path+str(loop)
 if not cache.has(key):
  var original=load("res://audio/"+path)
  var clip=original.duplicate()
  clip.loop=loop
  cache[key]=clip
 return cache[key]
func region_changed(index):
 if stage==index: return
 stage=index
 var crossfade=music.playing
 if crossfade:
  if is_instance_valid(old_music): old_music.stop();old_music.queue_free()
  old_music=music
  music=player("Music")
 music.stream=stream(manifest.music[index],true)
 music.volume_db=-32 if crossfade else -8
 music.play()
 ambience.stream=stream(manifest.ambience[index],true)
 ambience.volume_db=-12
 ambience.play()
func apply_levels():
 for bus in levels:
  AudioServer.set_bus_volume_db(AudioServer.get_bus_index(bus),linear_to_db(max(0.0001,levels[bus])))
  AudioServer.set_bus_mute(AudioServer.get_bus_index(bus),levels[bus]<=0.0001)
func effect(name,gain=1.0):
 if not manifest.effects.has(name): return
 var choices=manifest.effects[name]
 var i=cycle.get(name,0)
 cycle[name]=i+1
 var node=player("Effects")
 node.stream=stream(choices[i%choices.size()])
 node.volume_db=linear_to_db(max(0.0001,gain*0.48))
 node.finished.connect(node.queue_free)
 node.play()
 counts.effects+=1
func handle(events):
 for event in events:
  if event.kind=="speech":
   if manifest.voices.has(event.voice):
    var row=manifest.voices[event.voice].duplicate()
    row.name=event.name
    queue.append(row)
  elif FX.has(event.kind): effect(FX[event.kind],0.7)
func tick(world,dt):
 region_changed(world.stage)
 if paused or world.p.dead: return
 var distance=10000.0
 for o in world.objects():
  if o.type=="scenery" and o.get("kind","")=="watchfire": distance=min(distance,abs(o.x-world.p.x))
 fire.volume_db=lerp(fire.volume_db,linear_to_db(max(0.0001,0.3*(1-clamp(distance/260,0,1)))),0.08)
 if world.p.onGround and abs(world.p.vx)>35:
  footsteps-=dt
  if footsteps<=0:
   effect("step-dirt",0.35)
   footsteps=0.28
   counts.steps+=1
 else: footsteps=min(footsteps,0.05)
func talking(): return not active.is_empty() or not queue.is_empty()
func advance():
 speech.stop()
 active={}
 subtitle_time=0
 if queue.is_empty(): quiet.emit()
 else: start_next()
func start_next():
 if queue.is_empty(): return
 active=queue.pop_front()
 var clip=stream(active.path)
 subtitle_time=max(3.0,clip.get_length()+0.4)
 spoken.emit(active.name,active.text,subtitle_time)
 if voices_enabled:
  speech.stream=clip
  speech.play()
  counts.voices+=1
func _process(dt):
 if paused: return
 if active.is_empty() and not queue.is_empty(): start_next()
 if not active.is_empty():
  subtitle_time-=dt
  if subtitle_time<=0: advance()
 if music!=null:
  music.volume_db=move_toward(music.volume_db,-17.0 if talking() else -8.0,dt*(16 if talking() else 48))
 if is_instance_valid(old_music):
  old_music.volume_db=move_toward(old_music.volume_db,-60,dt*52)
  if old_music.volume_db<=-59:
   old_music.stop();old_music.stream=null;old_music.queue_free();old_music=null
 if capture_effect!=null:
  var n=capture_effect.get_frames_available()
  if n>0: recorded.append_array(capture_effect.get_buffer(n))
func set_paused(value):
 paused=value
 for node in get_children():
  if node is AudioStreamPlayer: node.stream_paused=value
func restart():
 queue.clear()
 active={}
 subtitle_time=0
 speech.stop()
 music.seek(0)
 footsteps=0
 quiet.emit()
func start_capture():
 capture_effect=AudioEffectCapture.new()
 capture_effect.buffer_length=2.0
 AudioServer.add_bus_effect(0,capture_effect)
func save_capture(path):
 var f=FileAccess.open(path,FileAccess.WRITE)
 var bytes=recorded.size()*4
 f.store_buffer("RIFF".to_ascii_buffer());f.store_32(36+bytes)
 f.store_buffer("WAVEfmt ".to_ascii_buffer());f.store_32(16);f.store_16(1);f.store_16(2)
 f.store_32(int(AudioServer.get_mix_rate()));f.store_32(int(AudioServer.get_mix_rate())*4)
 f.store_16(4);f.store_16(16);f.store_buffer("data".to_ascii_buffer());f.store_32(bytes)
 for sample in recorded:
  f.store_16(int(clamp(sample.x,-1,1)*32767)&65535)
  f.store_16(int(clamp(sample.y,-1,1)*32767)&65535)
 f.close()
func shutdown():
 if capture_effect!=null:
  for i in range(AudioServer.get_bus_effect_count(0)-1,-1,-1):
   if AudioServer.get_bus_effect(0,i)==capture_effect: AudioServer.remove_bus_effect(0,i)
  capture_effect=null
 for node in get_children():
  if node is AudioStreamPlayer: node.stop();node.stream=null
 cache.clear()
func _exit_tree(): shutdown()
