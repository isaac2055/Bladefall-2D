extends SceneTree
const Main=preload("res://main.tscn")
var app
func _initialize(): run.call_deferred()
func check(ok,message):
 if not ok: push_error(message);quit(1);return false
 print("PASS ",message)
 return true
func key(code,value):
 var e=InputEventKey.new()
 e.physical_keycode=code;e.keycode=code;e.pressed=value
 Input.parse_input_event(e)
func run():
 app=Main.instantiate();app.test_mode=true;root.add_child(app)
 await process_frame
 app.set_physics_process(false)
 Input.use_accumulated_input=false
 var x=app.world.p.x
 key(KEY_RIGHT,true)
 for i in range(30): app._physics_process(1.0/60)
 key(KEY_RIGHT,false)
 if not check(app.world.p.x>x+60,"real arrow events move the native Explore player"): return
 key(KEY_SPACE,true);app._physics_process(1.0/60);key(KEY_SPACE,false)
 if not check(app.world.p.vy<0,"Space jumps with Explore's own movement model"): return
 app.restart()
 key(KEY_D,true);app._physics_process(1.0/60);key(KEY_D,false)
 if not check(app.world.p.vx==0 and app.world.p.vy==0 and not app.world.weapon,"fresh movement does not grant a dash or weapon"): return
 app.restart()
 key(KEY_R,true);app._physics_process(1.0/60);key(KEY_R,false)
 if not check(app.world.flags==0 and app.world.checkpoint.x==70,"R plants the starting earned checkpoint flag"): return
 app.world.p.x=450
 app.set_paused(true);app.retry_button.pressed.emit()
 if not check(not app.paused and app.world.p.x==70,"the actual retry button returns to the planted flag"): return
 app.world.p.x=250
 key(KEY_UP,true);app._physics_process(1.0/60);key(KEY_UP,false)
 app.audio._process(0.01)
 if not check(app.audio.talking() and app.speech_panel.visible and app.speech_name.text=="ROWAN","Up starts the existing Rowan conversation with matching subtitles"): return
 var frame=app.world.frame
 for i in range(10): app._physics_process(1.0/60)
 if not check(app.world.frame==frame,"one-way conversation holds gameplay while the recording plays"): return
 while app.audio.talking(): app.audio.advance()
 app.world.p.x=1950
 app.world.prev={};app.input_gate=false
 key(KEY_UP,true);app._physics_process(1.0/60)
 app.audio._process(0.01)
 while app.audio.talking(): app.audio.advance()
 app._physics_process(1.0/60)
 if not check(not app.audio.talking(),"holding Continue does not immediately reopen the same conversation"): return
 key(KEY_UP,false);app._physics_process(1.0/60)
 app.audio.start_capture()
 app.audio.effect("ui-select",1)
 var peak=0.0
 for i in range(15):
  await create_timer(0.1).timeout
  for sample in app.audio.recorded: peak=max(peak,abs(sample.x),abs(sample.y))
  if peak>0.001: break
 if not check(peak>0.001,"Godot's actual mixed output contains music and effects"): return
 var decoded=0
 for row in app.audio.manifest.files:
  var clip=app.audio.stream(row.path)
  var hash=HashingContext.new();hash.start(HashingContext.HASH_SHA256);hash.update(clip.data)
  if not check(clip.get_length()>0 and hash.finish().hex_encode()==row.sha256,"exact reused recording and decode: "+row.path): return
  decoded+=1
 if not check(decoded==141,"all 141 existing recordings decode with exact source hashes"): return
 var before=app.world.frame
 app.set_paused(true)
 for i in range(12): app._physics_process(1.0/60)
 if not check(app.world.frame==before and app.audio.music.stream_paused,"pause freezes gameplay and pauses audio"): return
 app.set_paused(false)
 for bus in app.volume_sliders: app.volume_sliders[bus].value=0
 await create_timer(0.25).timeout
 app.audio.recorded=PackedVector2Array();app.audio.capture_effect.clear_buffer()
 await create_timer(0.15).timeout
 peak=0
 for sample in app.audio.recorded: peak=max(peak,abs(sample.x),abs(sample.y))
 if not check(peak<0.0001,"all four volume sliders actually mute the output bus"): return
 app.world.weapon=true;app.world.chart=true;app.world.elsie=5;app.world.deaths=4
 app.set_paused(true);app.restart_button.pressed.emit()
 if not check(not app.paused and not app.world.weapon and not app.world.chart and app.world.elsie==0 and app.world.deaths==0,"the actual full restart button clears the journey without reopening the app"): return
 if not check(app.landscape.occluder_count==113 and app.landscape.lights.size()==10,"authored terrain has native shadow occluders and point lights"): return
 app.world.chart=true
 app.update_hud()
 app.map_button.pressed.emit()
 if not check(app.map_panel.visible and app.paused,"Mara's earned field chart opens as an actual two-region map"): return
 app.toggle_map()
 if not check(not app.map_panel.visible and not app.paused,"closing the chart resumes the same journey"): return
 app.watch_button.pressed.emit()
 for i in range(9000):
  while app.audio.talking(): app.audio.advance()
  app._physics_process(1.0/60)
  if not app.watching: break
 if not check(not app.watching and app.world.stage==1 and app.world.p.x>12150 and app.world.deaths==0 and app.world.weapon and app.world.bearings.size()==3,"the real Watch button traverses both complete regions with normal controls and no deaths"): return
 app.watch_button.pressed.emit()
 for i in range(30): app._physics_process(1.0/60)
 var position=app.world.point()
 app.watch_button.pressed.emit()
 if not check(not app.watching and app.world.point()==position,"Take control retains the exact live player position"): return
 print("PASS native Explore application, controls, recordings, mixing, conversation, map, Watch, retry and restart")
 await app.close_app()
