extends SceneTree
const Main=preload("res://main.tscn")
const Run=preload("res://scripts/sampler_run.gd")
const Inputs=preload("res://tests/workshop_routes.gd")
var failed=0
var app
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 if not ok: failed+=1
func _initialize(): run.call_deferred()
func run():
 var path="user://sampler-app-test-%d.json"%Time.get_ticks_usec()
 app=Main.instantiate()
 app.test_mode=true
 app.sampler=Run.new(path)
 root.add_child(app)
 await process_frame
 app.set_physics_process(false)
 check(app.sampler.profile.run.eligible,"fresh launch is a ranked full-world attempt")
 app.load_section(1)
 check(not app.sampler.profile.run.eligible,"room picker changes to practice")
 app.switch_chapter(2)
 app.switch_chapter(1)
 check(not app.sampler.profile.run.eligible,"chapter switching cannot turn a room jump into an eligible run")
 app.restart_world()
 check(app.sampler.profile.run.eligible,"Start world over restores eligibility")
 app.toggle_watch()
 check(not app.sampler.profile.run.eligible,"Watch invalidates rewards and leaderboard")
 app.toggle_watch()
 app.restart_world()
 app.test_mode=false
 app.dev_mode=false
 app.switch_chapter(101)
 check(app.chapter_number==1,"Core locked until both flower parts")
 app.test_mode=true
 app.dev_mode=true
 for base in [1,2,3]: app.sampler.profile.completed[str(base)]=true
 for n in [1,2,3]:
  var p=app.sampler.profile.garden(n)
  p.root=true;p.top=true;p.core=true
 for n in [21,22,23,101,102,103]:
  app.switch_chapter(n)
  app.restart_world()
  var acquired=false
  for frame in range(30):
   app.world.step(Inputs.decode("l"))
   var event=app.sampler.tick(app.world)
   if app.sampler.carrying():
    acquired=true
    check(event=="reset" and app.world.active_id==app.world.data.world.atlasStart and app.world.frames==0,"start pickup begins a fresh carried attempt: "+str(n))
    break
  check(acquired,"reward patch reachable by backtracking: "+str(n))
  app.sync_sampler_scene()
  app.sim.die()
  var event=app.sampler.tick(app.world)
  while app.sampler.failure_frames>0: event=app.sampler.tick(app.world)
  app.sync_sampler_scene()
  check(event=="reset" and not app.sampler.carrying() and app.world.active_id==app.world.data.world.atlasStart,"death resets world and drops carried reward: "+str(n))
 app.switch_chapter(102)
 app.restart_world()
 app.sim.p.x=app.sim.room.w-16
 app.sim.p.y=8
 app.sim.p.onGround=true
 app.sampler.tick(app.world)
 check(app.sampler.result.is_empty(),"standing beside a closed Core exit cannot award a clear")
 app.restart_world()
 app.retry_room()
 check(app.sampler.profile.run.deaths==1,"manual Retry counts in deaths and denies a perfect casual clear")
 app.switch_chapter(1)
 check(not app.sampler.carrying(),"changing worlds cancels shiny attempt")
 app.sampler_overlay.open_garden()
 check(app.paused and app.sampler_overlay.panel.visible,"Garden pauses run and displays rewards/records")
 if DisplayServer.get_name()!="headless":
  await process_frame
  await process_frame
  root.get_texture().get_image().save_png("/tmp/bladefall-garden.png")
 app.sampler_overlay.close()
 app.switch_chapter(101)
 app.restart_world()
 # UI fixture, distinct from the separately tested real completion predicate.
 app.sampler.profile.run.frames=3785
 app.sampler.profile.run.deaths=4
 app.sampler.result=app.sampler.profile.finish()
 app.sampler_overlay.showing_result=true
 app.sampler_overlay.show_result()
 check(app.paused and app.sampler_overlay.panel.visible and app.sampler.profile.board(101).size()==1,"finish card shows saved result and local board")
 if DisplayServer.get_name()!="headless":
  for i in range(4): await process_frame
  root.get_texture().get_image().save_png("/tmp/bladefall-results.png")
 DirAccess.remove_absolute(ProjectSettings.globalize_path(path))
 print("APP SAMPLER FAILURES ",failed)
 app.queue_free()
 await process_frame
 quit(1 if failed else 0)
