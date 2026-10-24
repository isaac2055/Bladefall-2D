extends SceneTree
const Main = preload("res://main.tscn")
func _initialize(): run.call_deferred()
func check(ok,message):
 if not ok:
  push_error(message)
  quit(1)
  return false
 print("PASS ",message)
 return true
func run():
 var app = Main.instantiate()
 app.test_mode = true
 root.add_child(app)
 await process_frame
 app.set_physics_process(false)
 if not check(app.room_picker.item_count==app.data.world.rooms.size(),"all preloaded rooms available"): return
 Input.use_accumulated_input = false
 var before = app.sim.p.x
 var key = InputEventKey.new()
 key.keycode = KEY_RIGHT
 key.physical_keycode = KEY_RIGHT
 key.pressed = true
 Input.parse_input_event(key)
 for i in range(20): app._physics_process(1.0/60.0)
 key = key.duplicate()
 key.pressed = false
 Input.parse_input_event(key)
 if not check(app.sim.p.x>before+15,"real keyboard input moves the native player"): return
 key = InputEventKey.new()
 key.keycode = KEY_SPACE
 key.physical_keycode = KEY_SPACE
 key.pressed = true
 Input.parse_input_event(key)
 app._physics_process(1.0/60.0)
 key = key.duplicate()
 key.pressed = false
 Input.parse_input_event(key)
 if not check(app.sim.p.vy<0,"real Space press jumps"): return
 for i in range(app.data.world.rooms.size()):
  app.load_section(i)
  if not check(app.sim.room.id==app.data.world.rooms[i].id,"load "+app.sim.room.id): return
 app.watch = true
 app.load_section(0)
 var visited = {}
 for i in range(7000):
  visited[app.sim.room.id] = true
  if app.sim.room.id=="cl1-atlas-crossroads": break
  app._physics_process(1.0/60.0)
 if not check(visited.size()==15 and app.sim.deaths==0,"Watch traverses all 14 main challenges to the crossroads without deaths"): return
 if not check(not app.watch,"Watch ends cleanly at the world 1 crossroads"): return
 app.watch = true
 app.load_section(0)
 for i in range(20): app._physics_process(1.0/60.0)
 var takeover_position = [app.sim.p.x,app.sim.p.y]
 app.watch_button.pressed.emit()
 if not check(not app.watch and takeover_position==[app.sim.p.x,app.sim.p.y],"Take control keeps the current position and returns to keyboard play"): return
 app.world.bearings.ASH=true
 app.world.active().deaths=4
 app.audio.heard.test=true
 app.set_paused(true)
 app.restart_button.pressed.emit()
 if not check(not app.paused and app.world.bearings.is_empty() and app.world.active_id=="cl1-o1-road" and app.sim.deaths==0 and app.audio.heard.is_empty(),"Start world over restarts the full game without closing the app"): return
 # Exercise native death while a foreign lantern changes the active entity list.
 for i in range(app.data.world.rooms.size()):
  if app.data.world.rooms[i].id=="cl1-o1-gate": app.load_section(i);break
 app.sim.p.x=44
 app.sim.p.y=133
 app.world.step({"grab":true})
 for i in range(44):
  app.world.step({"l":true})
  app.world.update_region()
 app.sim=app.world.active()
 app.current=app.data.world.rooms.find(app.sim.room.def)
 app.landscape.load_scene(app.sim)
 if not check(app.sim.p.carrying!=null,"cross-room lantern is carried before native death"): return
 app.sim.die()
 for i in range(50): app._physics_process(1.0/60.0)
 var lamps=0
 for core in app.world.cores.values():
  for e in core.ents:
   if e.type=="lantern" and e.source_room=="cl1-o1-gate": lamps+=1
 if not check(app.sim.p.state!="dead" and lamps==1,"native death restores a foreign lantern without entity-effect errors or duplicates"): return
 print("PASS application integration")
 app.queue_free()
 await process_frame
 await create_timer(0.15).timeout
 quit(0)
