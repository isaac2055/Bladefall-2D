extends SceneTree
var failures=0
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 if not ok: failures+=1
func _initialize(): run.call_deferred()
func run():
 var game=load("res://felix.tscn").instantiate()
 game.developer_mode=true
 root.add_child(game)
 await process_frame
 check(game.front_end!=null and game.controls_menu!=null and game.touch_controls!=null,"release menus and touch controls construct")
 game.front_end.open(false)
 check(game.paused and game.front_end.visible and not game.pause_box.visible,"title pauses game without settings covering it")
 game.set_paused(true)
 game.set_paused(false)
 check(game.paused and not game.pause_box.visible,"closing settings returns to paused title")
 game.front_end.continue_selected()
 check(not game.paused and not game.front_end.visible and game.title_box.visible,"new journey retains its chapter opening")
 game.black_time=3
 var touch=InputEventScreenTouch.new()
 touch.pressed=true
 game._unhandled_input(touch)
 check(game.story.phase=="play","touch starts the story prologue")
 game.set_paused(true)
 game.controls_menu.open()
 check(game.controls_menu.visible and game.paused,"remapping opens from settings")
 game.controls_menu.close()
 check(not game.controls_menu.visible and game.pause_box.visible,"remapping returns to settings")
 game.front_end.open(false)
 game.sampler.profile.completed={"1":true,"2":true,"3":true,"21":true,"22":true,"23":true,"101":true,"102":true}
 game.front_end.refresh_worlds()
 check(game.front_end.routes.item_count==9,"all nine routes become selectable through real progression")
 game.front_end.age=6
 await process_frame
 RenderingServer.force_draw(false)
 root.get_texture().get_image().save_png("res://shots/felix-title.png")
 game.queue_free()
 await process_frame
 for n in [21,22,23,101,102,103]:
  var world=preload("res://scripts/world.gd").new(JSON.parse_string(FileAccess.get_file_as_string("res://data/world%d.json"%n)))
  var story=preload("res://scripts/felix_challenge.gd").new(world)
  check(story.gifts.counter and story.gifts.sword and story.gifts.arms,"full challenge kit for %d"%n)
  check(world.data.world.rooms.all(func(room):return not room.has("people")),"challenge %d has no story cast"%n)
  world.shutdown()
 print("RELEASE SHELL FAILURES ",failures)
 quit(1 if failures else 0)
