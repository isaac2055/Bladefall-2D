extends SceneTree
func _initialize(): run.call_deferred()
func run():
 var game=load("res://felix.tscn").instantiate()
 game.developer_mode=true
 root.add_child(game)
 await process_frame
 game.front_end.open(false)
 await process_frame
 RenderingServer.force_draw(false)
 var args=OS.get_cmdline_user_args()
 if not args.is_empty(): root.get_texture().get_image().save_png(args[0])
 if not FileAccess.file_exists("res://GODOT-LICENSE.txt") or not FileAccess.file_exists("res://audio/ATTRIBUTION.txt"):
  push_error("Packaged licenses or audio credits are missing")
  quit(1)
  return
 if game.world.active_id!="cl1-o1-road" or game.front_end.routes.item_count<1:
  push_error("Packaged Felix did not construct its real title and world")
  quit(1)
  return
 print("PASS packaged Felix title, story world, audio and artwork")
 game.queue_free()
 await process_frame
 quit()
