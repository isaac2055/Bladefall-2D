extends SceneTree
const Main = preload("res://main.tscn")
var app
func _initialize(): run.call_deferred()
func check(ok,message):
 if not ok:
  push_error(message)
  quit(1)
  return false
 print("PASS ",message)
 return true
func key(code,pressed):
 var event = InputEventKey.new()
 event.keycode = code
 event.physical_keycode = code
 event.pressed = pressed
 Input.parse_input_event(event)
func peak(samples):
 var value = 0.0
 for sample in samples: value=max(value,abs(sample.x),abs(sample.y))
 return value
func run():
 app = Main.instantiate()
 app.test_mode = true
 root.add_child(app)
 await process_frame
 app.set_physics_process(false)
 Input.use_accumulated_input = false
 key(KEY_D,true)
 var raw = app.input_now()
 app._physics_process(1.0/60.0)
 if not check(raw.dash and not raw.r and app.sim.p.state=="dash","D dashes and does not move right"): return
 key(KEY_D,false)
 app.load_section(0)
 app.sim.p.x=8
 app.sim.p.y=110
 app.sim.p.vy=1
 app.sim.p.facing=-1
 app.sim.p.onGround=false
 key(KEY_A,true)
 raw=app.input_now()
 app._physics_process(1.0/60.0)
 if not check(raw.grab and not raw.l and app.sim.p.state=="climb","A clings to the real wall and does not move left"): return
 key(KEY_A,false)
 app.load_section(0)
 key(KEY_C,true)
 raw=app.input_now()
 app._physics_process(1.0/60.0)
 if not check(raw.jump and not raw.strike and app.sim.p.vy<0,"C jumps and does not strike"): return
 key(KEY_C,false)
 for i in range(app.data.world.rooms.size()):
  if app.data.world.rooms[i].id=="cl1-bank-b21": app.load_section(i);break
 key(KEY_W,true)
 raw=app.input_now()
 app._physics_process(1.0/60.0)
 if not check(raw.strike and not raw.u and app.sim.p.strikeTimer>0,"W strikes and does not aim up"): return
 key(KEY_W,false)
 var axis = InputEventJoypadMotion.new()
 axis.device=0
 axis.axis=JOY_AXIS_LEFT_X
 axis.axis_value=1.0
 Input.parse_input_event(axis)
 if not check(app.input_now().r,"controller left stick moves right"): return
 axis=axis.duplicate()
 axis.axis_value=0.0
 Input.parse_input_event(axis)
 var pad = InputEventJoypadButton.new()
 pad.device=0
 pad.button_index=JOY_BUTTON_LEFT_SHOULDER
 pad.pressed=true
 Input.parse_input_event(pad)
 if not check(app.input_now().grab,"controller LB uses cling/carry"): return
 pad=pad.duplicate()
 pad.pressed=false
 Input.parse_input_event(pad)
 app.audio.start_capture()
 app.load_section(0)
 app.audio.heard.clear()
 app.audio.voice_queue.clear()
 app.audio.speech.stop()
 app._physics_process(1.0/60.0)
 app.audio.effect("ui-select",1.0)
 for i in range(20):
  await create_timer(0.1).timeout
  if peak(app.audio.recorded)>0.001: break
 var decoded = 0
 for recording in app.audio.manifest.files:
  var clip = app.audio.stream(recording.path)
  var bytes = clip.data
  var hashing = HashingContext.new()
  hashing.start(HashingContext.HASH_SHA256)
  hashing.update(bytes)
  if not check(hashing.finish().hex_encode()==recording.sha256,"exact recording bytes: "+recording.path): return
  if not check(clip.get_length()>0,"decode "+recording.path): return
  decoded += 1
 if not check(decoded==app.audio.manifest.files.size() and decoded>=79,"every reused recording decodes in native Godot"): return
 if not check(app.audio.music.playing and app.audio.music.stream.get_length()>10 and app.audio.ambience.playing,"original score and ambient bed decode and play"): return
 if not check(app.audio.speech.playing and app.subtitle_name.text=="VEY" and app.subtitle_text.text==app.audio.active_voice.text,"Vey recording and exact matching subtitles play on approach"): return
 if not check(peak(app.audio.recorded)>0.001,"Godot's actual output bus contains non-silent audio"): return
 var music_id = app.audio.music.get_instance_id()
 app.audio._process(0.6)
 if not check(app.audio.music.volume_db<=-16.9,"music ducks underneath speech"): return
 var voice_count=app.audio.counts.voices
 for i in range(20): app._physics_process(1.0/60.0)
 if not check(app.audio.counts.voices==voice_count,"nearby NPC speech is not restarted or overlapped each frame"): return
 var music_key = InputEventKey.new()
 music_key.physical_keycode = KEY_M
 music_key.pressed = true
 app._unhandled_input(music_key)
 app.set_paused(true)
 if not check(app.volume_sliders.Music.value==0.0,"music shortcut and pause-menu slider stay synchronized"): return
 app._unhandled_input(music_key)
 app.set_paused(false)
 var frame=app.sim.frame
 app.set_paused(true)
 for i in range(10): app._physics_process(1.0/60.0)
 if not check(app.sim.frame==frame and app.audio.music.stream_paused and app.audio.speech.stream_paused,"pause freezes simulation and pauses music and dialogue"): return
 app.set_paused(false)
 if not check(not app.audio.music.stream_paused and not app.audio.speech.stream_paused,"resume continues the existing streams"): return
 var levels=app.audio.levels.duplicate()
 for bus in app.audio.levels: app.audio.levels[bus]=0.0
 app.audio.apply_levels()
 await create_timer(0.25).timeout
 app.audio.recorded=PackedVector2Array()
 app.audio.capture_effect.clear_buffer()
 await create_timer(0.15).timeout
 if not check(peak(app.audio.recorded)<0.0001,"all four volume controls actually mute the mix"): return
 app.audio.levels=levels
 app.audio.apply_levels()
 app.set_voices(false)
 if not check(not app.audio.speech.playing and app.subtitle_panel.visible,"voices can be disabled while readable subtitles remain"): return
 if not check(app.audio.music.get_instance_id()==music_id,"room changes keep the same uninterrupted music player"): return
 app.audio.voices_enabled = true
 var approached = 0
 for i in range(app.data.world.rooms.size()):
  var definition = app.data.world.rooms[i]
  for who in definition.get("people",[]):
   var id = definition.id+":"+who.who+":line"
   if not app.audio.manifest.voices.has(id): continue
   app.load_section(i)
   app.audio.speech.stop()
   app.audio.heard.clear()
   app.audio.voice_queue.clear()
   app.sim.p.x = who.c*8
   app.sim.p.y = who.r*8+8-app.sim.p.h
   app.audio.tick(app.sim,1.0/60.0)
   if not check(app.audio.active_voice.id==app.audio.manifest.voices[id].id,"correct recorded line on approach: "+who.who): return
   approached += 1
 if not check(approached==6,"all six main-road NPC approaches play their matching recordings"): return
 if not check(app.landscape.occluder_count>100 and app.landscape.lights.size()>5 and app.landscape.lights[0].node.shadow_enabled,"native lighting includes actual terrain shadow occluders"): return
 app.landscape.reduced_motion=true
 app.landscape._process(1.0/60.0)
 if not check(not app.landscape.wind.emitting,"reduced motion disables the ambient particle drift"): return
 print("PASS polish: controls, real audio, subtitles, pause, mixing and presentation")
 app.queue_free()
 await process_frame
 await create_timer(0.15).timeout
 quit(0)
