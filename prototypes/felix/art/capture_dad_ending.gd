extends SceneTree
## Fast art fixture: renders the real ending view without replaying the chapter.
## Godot --path . --script art/capture_dad_ending.gd -- --from cl2-atlas-crossroads
func _initialize(): call_deferred("capture")
func capture():
 DirAccess.make_dir_recursive_absolute("res://shots/b3-implemented")
 var Main=load("res://scripts/felix_main.gd")
 Main.chapter=2
 var game=load("res://felix.tscn").instantiate()
 root.add_child(game)
 await create_timer(.25).timeout
 game.set_paused(true)
 game.pause_box.hide()
 game.story.freeze=0
 game.story.cue.clear()
 game.story.dusk=1.0
 game.story.begin_ending(game.sim)
 for i in range(810): game.story.tick_ending(1.0/60)
 game.story.lines.clear()
 game.cover.color.a=0
 game.view.camera=game.view.target_camera()
 for i in range(5): await process_frame
 RenderingServer.force_draw(false)
 var result=root.get_texture().get_image().save_png("res://shots/b3-implemented/11-ending.png")
 print("DAD ENDING ART CAPTURE ",result)
 game.queue_free()
 await process_frame
 quit(result)
