extends SceneTree
## Focused checks for conversation idling, Dad's presence and the handoff-to-drive cut.
## Godot --path . --script art/check_scene_regressions.gd
var failed=false
var output="res://shots/scene-fixes"

func _initialize(): call_deferred("run_checks")

func check(value,message):
 print("PASS " if value else "FAIL ",message)
 if not value: failed=true

func load_chapter(chapter,room):
 var Main=load("res://scripts/felix_main.gd")
 Main.chapter=chapter
 var game=load("res://felix.tscn").instantiate()
 root.add_child(game)
 game.set_physics_process(false)
 game.story.skip_prologue()
 game.begin_play()
 game.go_to(room)
 game.story.room=room
 return game

func shot(game,name):
 game.cover.color.a=0
 game.view.fade=0
 game.view.flash=0
 game.view.camera_float=game.view.target_camera()
 for i in range(6): await process_frame
 RenderingServer.force_draw(false)
 check(root.get_texture().get_image().save_png(output+"/"+name+".png")==OK,"capture "+name)

func idle_check(game,label):
 game.sim.p.vx=150
 game.sim.p.vy=0
 game.sim.p.onGround=true
 game.sim.p.state="normal"
 var at=game.view.current_actor
 var tape=game.script_frame
 game._physics_process(1.0/60)
 var pose=game.view.body.pose(game.view)
 check(pose.vx==0 and pose.state=="normal",label+": idle presentation")
 check(game.sim.p.vx==150,label+": simulation momentum preserved")
 check(game.view.current_actor==at and game.script_frame==tape,label+": actor and input tape held")

func run_checks():
 DirAccess.make_dir_recursive_absolute(output)
 var game=load_chapter(2,"cl2-atlas-crossroads")
 var origin=game.world.placements[game.story.CABIN]
 game.sim.p.x=30*8
 game.sim.p.y=22*8-game.sim.p.h
 game.sim.p.onGround=true
 game.view.snap_actor()
 game.story.felix=game.world.position()
 game.story.boy.follow=false
 game.story.boy.position=game.view.dad_point()+Vector2(-80,0)
 check(game.story.dad.visible and not game.story.done.has("cabin"),"Dad present before arrival dialogue")
 await shot(game,"dad-before-dialogue")
 game.story.arrive(game.world)
 idle_check(game,"Dad conversation")
 await shot(game,"dad-dialogue-idle-a")
 game.view.walking+=25
 await shot(game,"dad-dialogue-idle-b")
 game.queue_free()
 await process_frame

 game=load_chapter(3,"cl3-atlas-crossroads")
 game.sim.p.x=5*8
 game.sim.p.y=34*8-game.sim.p.h
 game.sim.p.onGround=true
 game.view.snap_actor()
 game.story.handoff(game.world)
 idle_check(game,"Car conversation")
 await shot(game,"car-dialogue-idle")
 # Continue the actual main loop through the back-seat cue and the cut to the drive.
 while game.story.cue_clock<680: game._physics_process(1.0/60)
 check(game.story.in_car,"Back-seat cue hides Felix only at the lot")
 while game.story.freeze>0: game._physics_process(1.0/60)
 check(game.world.active_id=="story-walk-0" and game.story.in_drive and not game.story.in_car,"Drive cut clears back-seat visibility state")
 game.sim.p.vx=150
 check(game.view.body.pose(game.view).vx==150,"Live gameplay keeps the moving pose")
 await shot(game,"drive-entry-visible")
 check(game.view.felix_light.visible,"Felix light restored after car scene")
 for room in ["workshop-wrong-first-turn","workshop-return-launch"]:
  game.go_to(room)
  game.story.room=room
  await shot(game,room+"-visible")
  check(not game.story.in_car and game.view.felix_light.visible,"Felix visible in "+room)
 game.go_to(game.story.BRACE)
 game.story.lines.clear()
 game.story.hint.life=0
 game.story.tick(game.world,game.sim,1.0/60)
 check(game.story.gifts.counter and game.story.lines.is_empty() and game.story.hint.life==0,"Counter remains available without tutorial dialogue or hint")
 game.queue_free()
 await process_frame
 quit(1 if failed else 0)
