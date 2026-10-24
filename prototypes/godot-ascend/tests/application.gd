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
 root.add_child(app)
 await process_frame
 app.set_physics_process(false)
 if not check(app.room_picker.item_count==29,"all 29 authored rooms available"): return
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
 for i in range(29):
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
 var takeover_position = [app.sim.p.x,app.sim.p.y]
 app.watch_button.pressed.emit()
 if not check(not app.watch and takeover_position==[app.sim.p.x,app.sim.p.y],"Take control keeps the current position and returns to keyboard play"): return
 print("PASS application integration")
 quit(0)
