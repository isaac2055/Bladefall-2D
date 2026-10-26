extends SceneTree
var failures=0
func _initialize(): run.call_deferred()
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 if not ok: failures+=1
func run():
 for number in [1,2,3,21,22,23,4]:
  var chapter=load("res://levels/world%d.tscn"%number).instantiate()
  var areas=chapter.get_node("Rooms")
  var target=areas.get_child(min(1,areas.get_child_count()-1)).room_id
  chapter.play_room_id=target
  root.add_child(chapter)
  var game=chapter.get_child(-1)
  game.set_physics_process(false)
  game.set_process(false)
  check(game.chapter_number==number and game.world.active_id==target,"F6 chapter %d launches selected room %s"%[number,target])
  chapter.queue_free()
  await process_frame
 quit(1 if failures else 0)
