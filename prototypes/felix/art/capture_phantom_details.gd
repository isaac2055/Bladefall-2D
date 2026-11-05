extends SceneTree
## Art fixture using the real view and story cues; does not edit the game or route data.
## Godot --path . --script art/capture_phantom_details.gd -- --chapter 3 --from cl3-atlas-crossroads
func _initialize(): call_deferred("capture_details")

func save_frame(game,name):
 game.story.lines.clear()
 game.story.hint.life=0
 game.cover.color.a=0
 game.view.fade=0
 game.view.flash=0
 game.view.camera=game.view.target_camera()
 for i in range(5): await process_frame
 RenderingServer.force_draw(false)
 var error=root.get_texture().get_image().save_png("res://shots/ch3-details/"+name+".png")
 if error!=OK: push_error("Could not capture "+name)
 print("PHANTOM ART DETAIL ",name," result=",error)

func capture_details():
 DirAccess.make_dir_recursive_absolute("res://shots/ch3-details")
 var Main=load("res://scripts/felix_main.gd")
 Main.chapter=3
 var game=load("res://felix.tscn").instantiate()
 root.add_child(game)
 await create_timer(.25).timeout
 game.set_paused(true)
 game.pause_box.hide()
 game.story.phase="play"
 game.story.gifts.mask=true
 game.story.gifts.dagger=true
 game.story.late=1.0
 game.story.handoff(game.world)
 # Reach the actual back-seat cue while the car is still at the lot.
 for i in range(700): game.story.tick(game.world,game.sim,1.0/60)
 await save_frame(game,"rear-window")
 # Inspect the collision-sized Brute at its real room and spawn, not a resized mockup.
 game.go_to("cl3-bank-b68")
 game.story.freeze=0
 game.story.cue.clear()
 game.story.in_car=false
 game.story.car.visible=false
 game.story.man.visible=false
 game.story.mom.visible=false
 game.story.boy.visible=false
 game.view.snap_actor()
 await save_frame(game,"brute")
 # The standard secret shot has already collected the badge. Freeze just before collection.
 game.go_to("cl3-secret-e2")
 game.sim.p.x=208
 game.sim.p.y=20
 game.story.badge.taken=false
 game.view.snap_actor()
 await save_frame(game,"id-card")
 game.queue_free()
 await process_frame
 quit()
