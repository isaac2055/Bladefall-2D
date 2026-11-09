extends SceneTree
const Main=preload("res://main.tscn")
const Run=preload("res://scripts/sampler_run.gd")
var app
var path=""
func _initialize(): run.call_deferred()
func shot(name):
 for i in range(8): await process_frame
 await RenderingServer.frame_post_draw
 root.get_texture().get_image().save_png("/tmp/bladefall-v47-"+name+".png")
 print("PASS captured ",name)
func run():
 path="user://road-shots-%d.json"%OS.get_process_id()
 app=Main.instantiate();app.test_mode=true;app.sampler=Run.new(path);root.add_child(app)
 await process_frame
 app.set_physics_process(false);app.set_dev_mode(true)
 for n in [1,2,3]:
  app.switch_chapter(n);app.restart_world();app.set_physics_process(false)
  var route=app.world.data.world.campaignWorkshop
  app.world.enter(route.entry,true);app.sync_sampler_scene();app.story.begin("reveal")
  for i in range(155): app.story.physics_tick(1.0/60)
  await shot("reveal-"+str(n))
  app.story.cancel()
  app.world.enter(route.rooms[-1],true);app.sync_sampler_scene()
  var goal=app.sim.room.def.get("workshopGoal",app.sim.room.def.get("puzzleGoal",[]))
  app.sim.p.x=goal[0];app.sim.p.y=goal[1]-11
  app.landscape.snap_actor()
  for id in app.world.data.world.get("requiredMainRooms",[]): app.sampler.profile.mark_clear(id)
  for id in route.rooms: app.sampler.profile.mark_clear(id)
  app.sampler.complete(app.world)
  app.story.begin_ending()
  for i in range(150): app.story.physics_tick(1.0/60)
  await shot("ending-"+str(n))
  for i in range(140): app.story.physics_tick(1.0/60)
  await create_timer(.55).timeout
  await shot("results-"+str(n))
  app.sampler_overlay.panel.hide();app.sampler_overlay.scrim.hide();app.set_paused(false)
 app.story.cancel();app.switch_chapter(1);app.restart_world();app.set_physics_process(false)
 app.world.enter("cl1-secret-r2",true);app.sync_sampler_scene()
 var heart=app.world.data.secretRewards[0]
 app.landscape.camera_float=app.world.placements[heart.room]+Vector2(heart.x-153,heart.y-70)
 app.landscape.camera=app.landscape.camera_float
 app.landscape.set_process(false)
 app.landscape.ink.queue_redraw()
 await shot("bonus-heart")
 app.queue_free();await process_frame
 var p=preload("res://scripts/run_profile.gd").new(path)
 for n in [1,2,3,21,22,23,101,102,103]: preload("res://scripts/world_save.gd").clear(p,n)
 DirAccess.remove_absolute(ProjectSettings.globalize_path(path))
 quit()
