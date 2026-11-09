extends SceneTree
const Main=preload("res://main.tscn")
const Run=preload("res://scripts/sampler_run.gd")
const World=preload("res://scripts/world.gd")
const Inputs=preload("res://tests/workshop_routes.gd")
var app
var failed=0
var path=""
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 if not ok: failed+=1
func _initialize(): run.call_deferred()
func next_key():
 var event=InputEventKey.new();event.physical_keycode=KEY_N;event.pressed=true
 app._unhandled_input(event)
func clear_panel():
 app.sampler_overlay.panel.hide();app.sampler_overlay.scrim.hide();app.sampler_overlay.showing_result=false
 app.set_paused(false)
func run():
 path="user://road-presentation-%d.json"%OS.get_process_id()
 app=Main.instantiate();app.test_mode=true;app.sampler=Run.new(path);root.add_child(app)
 await process_frame
 app.set_physics_process(false)
 app.title_screen.open(false)
 app.set_paused(true)
 check(not app.audio.music.stream_paused and app.paused,"title Settings freezes gameplay while title music keeps playing")
 app.set_paused(false)
 check(not app.audio.music.stream_paused,"Back from title Settings keeps music playing")
 app.title_screen.hide();app.root_ui.show();app.set_paused(false);app.set_paused(true)
 check(app.audio.music.stream_paused,"in-game Settings pauses music")
 app.set_paused(false)
 check(not app.audio.music.stream_paused,"Resume restores game music")
 app.test_mode=false;app.dev_mode=false
 var before=app.world.active_id
 var before_frames=app.sampler.profile.run.frames
 next_key()
 check(app.world.active_id==before and app.sampler.profile.run.frames==before_frames,"N is unavailable to ordinary players")
 app.test_mode=true;app.set_dev_mode(true)
 for n in [1,2,3]:
  clear_panel();app.switch_chapter(n);app.restart_world()
  var intros=0
  var hops=0
  while app.sampler.result.is_empty() and hops<80:
   next_key();hops+=1
   if app.story.active():
    intros+=1
    check(app.sampler.result.is_empty(),"establishing shot precedes any world award: "+str(n))
    for i in range(260): app.story.physics_tick(1.0/60)
    check(app.sampler.profile.story_seen.get("lift-%d"%n,false),"first-time lift reveal is persisted: "+str(n))
    app.sampler.tick(app.world)
   if not app.sampler.ride.is_empty():
    var target=app.sampler.ride.target
    var count=0
    var old=app.sampler.ride_point()
    var max_jump=0.0
    while not app.sampler.ride.is_empty() and count<1000:
     app.sampler.tick(app.world);count+=1
     if not app.sampler.ride.is_empty():
      var point=app.sampler.ride_point();max_jump=maxf(max_jump,point.distance_to(old));old=point
    app.sync_sampler_scene()
    check(app.world.active_id==target and not app.world.active_id.begins_with("bladefall-gallery"),"single ride docks directly in next challenge")
    check(app.world.checkpoint_id==target and max_jump<30,"continuous movement retains the destination checkpoint")
  check(intros==1 and not app.sampler.result.is_empty(),"developer N completes the full base route with one establishing scene: "+str(n))
  check(app.sampler.profile.garden(n).root_shiny and app.sampler.profile.board(n).size()==1,"developer skips award real perfects and records: "+str(n))
  app.story.begin_ending()
  check(app.sampler.profile.completed.get(str(n),false) and not app.sampler_overlay.panel.visible,"world is saved before ending presentation, with result card delayed")
  for i in range(290): app.story.physics_tick(1.0/60)
  check(app.story.ending_ready and app.sampler_overlay.panel.visible and app.paused,"ending fades into actual completion menu: "+str(n))
  check(app.landscape.story.get("phase","")=="ending","results retain the exact in-world ending tableau")
 check(app.sampler.profile.all_bases_clear() and app.sampler.profile.available(21),"N follows normal three-base unlock progression")
 for n in [21,22,23]:
  for carrying in [false,true]:
   clear_panel();app.switch_chapter(n);app.restart_world()
   if carrying: app.sampler.start(app.world,true,true)
   var skips=0
   while app.sampler.result.is_empty() and skips<80:
    next_key();skips+=1
    if app.story.active():
     for i in range(260): app.story.physics_tick(1.0/60)
     app.sampler.tick(app.world)
    while not app.sampler.ride.is_empty(): app.sampler.tick(app.world)
    app.sync_sampler_scene()
   check(not app.sampler.result.is_empty() and app.sampler.profile.garden(n-20).top,"N previews real Fractured completion: "+str(n))
   if carrying: check(app.sampler.profile.garden(n-20).flower_shiny,"N previews carried shiny flower: "+str(n))
 clear_panel();app.switch_chapter(101);app.restart_world();next_key()
 check(not app.sampler.result.is_empty() and app.sampler.profile.garden(1).core,"N can preview Core awards")
 clear_panel();app.restart_world();app.sampler.profile.garden(1).core=true;app.sampler.start(app.world,true,true);next_key()
 check(app.sampler.profile.garden(1).core_shiny,"carried developer clear previews shiny Core reward")
 clear_panel();app.restart_world();app.sim.deaths=3;next_key()
 check(app.sampler.result.get("deaths",-1)==3,"Core N preserves actual deaths")
 clear_panel();app.switch_chapter(1);app.restart_world();app.sim.deaths=2
 # Start from the final puzzle to exercise a partial developer test run.
 var last=app.world.data.world.campaignWorkshop.rooms[-1]
 app.world.enter(last,true);app.sync_sampler_scene();app.sim.deaths=2;next_key()
 check(app.sampler.result.get("deaths",-1)==2,"developer clear preserves deaths instead of forcing perfect results")
 # All optional secrets have actual visible pickups, including the missing Outskirts one.
 for n in [1,2,3,21,22,23]:
  var w=World.new(JSON.parse_string(FileAccess.get_file_as_string("res://data/world%d.json"%n)))
  var rewards=w.data.get("secretRewards",[])+w.data.get("branchRewards",[])
  check(not rewards.is_empty(),"purple hearts are defined in optional bonus routes: "+str(n))
  for reward in rewards:
   check(not reward.room in w.data.world.get("campaignWorkshop",{}).get("rooms",[]),"bonus heart is outside affixed main route")
   w.enter(reward.room,true)
   w.active().p.x=reward.x-4;w.active().p.y=reward.y-5.5;w.active().p.state="normal"
   w.branch_entered[reward.id]=true
   w.tick_secret_hearts();w.tick_branch_rewards()
   check(w.secret_hearts.has(reward.id) or w.branch_hearts.has(reward.id),"touching visible bonus heart awards it: "+reward.id)
  app.sampler.profile.collect_hearts(w)
  w.shutdown()
 var reloaded=Run.new(path)
 check(reloaded.profile.heart_count()>=10 and reloaded.profile.story_seen.get("lift-1",false),"bonus hearts and story reveals survive profile reload")
 clear_panel();app.switch_chapter(23);app.restart_world()
 app.cover_comparison=true
 var comparison_index=app.current
 next_key()
 check(app.current==posmod(comparison_index+1,app.data.world.rooms.size()),"isolated comparison launchers retain N navigation")
 app.cover_comparison=false
 app.queue_free();await process_frame
 for n in [1,2,3,21,22,23,101,102,103]: preload("res://scripts/world_save.gd").clear(reloaded.profile,n)
 DirAccess.remove_absolute(ProjectSettings.globalize_path(path))
 print("ROAD PRESENTATION FAILURES ",failed)
 quit(1 if failed else 0)
