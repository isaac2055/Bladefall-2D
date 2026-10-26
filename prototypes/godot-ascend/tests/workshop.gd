extends SceneTree
## Exercise distinct ordinary-input approaches, optional recovery, UI and isolation.
const Main=preload("res://main.tscn")
const Authoring=preload("res://scripts/authoring_data.gd")
const Codec=preload("res://authoring/codec.gd")
var app
var failed=false
var checks=[]
var output=""
var screenshots={}
var routes=[]
func _initialize(): run.call_deferred()
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 checks.append({"passed":bool(ok),"label":label})
 failed=failed or not ok
func key(code):
 var event=InputEventKey.new()
 event.physical_keycode=code
 event.keycode=code
 event.pressed=true
 app._unhandled_input(event)
func has_shard(): return app.workshop_has_shard()
func shot(name):
 if output=="" or DisplayServer.get_name()=="headless": return
 app.landscape.snap_actor()
 for f in range(30): app.landscape._process(1.0/60.0)
 app.banner_time=0
 app.room_banner.modulate.a=0
 app.notice_time=0
 app.notice_label.modulate.a=0
 await process_frame
 await RenderingServer.frame_post_draw
 root.get_texture().get_image().save_png(output+"/"+name+".png")
func journey(parts):
 app.journey=[]
 app.journey_frame=0
 for part in parts:
  for f in range(int(part[0])): app.journey.append(part[1])
func play(route_index,capture=false):
 app.watch=false
 app.load_section(0)
 journey(routes[route_index].tape)
 var proof={"route":routes[route_index].name,"max_x":app.sim.p.x,"refills":0,"right_bank":false,"moving_cling":false,"crumble_landing":false,"shard_recovery":false,"advanced":false}
 var start_deaths=app.sim.deaths
 var refill_used=false
 for f in range(app.journey.size()):
  app._physics_process(1.0/60.0)
  var core=app.sim
  proof.max_x=max(proof.max_x,core.p.x)
  for kind in ["super","hyper","wallbounce","ultra"]: proof.advanced=proof.advanced or kind in core.events
  var bank=core.p.onGround and core.p.x>=264 and core.p.y==125
  proof.right_bank=proof.right_bank or bank
  var bridge=false
  var carrier=false
  for e in core.ents:
   if e.type=="refill":
    if e.timer>0 and not refill_used: proof.refills+=1
    refill_used=e.timer>0
   if e.type=="zip": carrier=core.p.state=="climb" and e.state=="go" and e.x>e.ox+104
   if e.type=="crumble": bridge=core.standing(e)
  proof.moving_cling=proof.moving_cling or carrier
  proof.crumble_landing=proof.crumble_landing or bridge
  var recovering=has_shard() and core.p.state=="climb" and core.p.x==256
  proof.shard_recovery=proof.shard_recovery or recovering
  if capture:
   for item in [["under-the-pier",carrier],["eastern-bank",bank],["broken-span",bridge],["shard-wall-catch",recovering]]:
    if item[1] and not screenshots.has(item[0]):
     screenshots[item[0]]=true
     await shot(item[0])
 proof.finish=app.workshop_goal_reached()
 proof.deaths=app.sim.deaths-start_deaths
 proof.shard=has_shard()
 proof.frames=app.journey.size()
 app.journey=[]
 app.journey_frame=0
 return proof
func run():
 if not OS.get_cmdline_user_args().is_empty():
  output=OS.get_cmdline_user_args()[0]
  DirAccess.make_dir_recursive_absolute(output)
 var source=JSON.parse_string(FileAccess.get_file_as_string("res://data/world4.json"))
 var chapter=load("res://levels/world4.tscn").instantiate()
 var baseline=Authoring.baseline(source)
 var compiled=chapter.compile_into(baseline)
 check(Codec.first_difference(baseline,compiled)=="","native aqueduct preserves maps, route recordings and device settings")
 check(chapter.validate_data(compiled).is_empty(),"saved aqueduct validates")
 chapter.free()
 app=Main.instantiate()
 app.test_mode=true
 app.initial_world=4
 root.add_child(app)
 await process_frame
 app.set_physics_process(false)
 var original_campaign=app.chapters[1].world.data.duplicate(true)
 check(app.chapter_number==4 and app.world.regions==["workshop-aqueduct"],"direct launcher opens the new room without campaign progress")
 check(app.room_picker.item_count==1 and not app.workshop_previous.visible and not app.workshop_next.visible,"old exercise rooms are removed from the workshop menu")
 check(app.world.data.constants==app.chapters[1].world.data.constants,"ordinary Outskirts movement constants retained")
 check(not app.workshop_goal_reached() and not has_shard(),"spawn starts outside finish and optional pickup")
 check(app.workshop_demo_picker.item_count==3,"all three optional demonstrations available before playing")
 check(app.landscape.camera_float==Vector2.ZERO,"whole aqueduct visible before departure")
 check(app.sim.ents.all(func(e):return e.has("source_room") and e.has("source_id")),"fresh workshop devices retain ownership for retry and death recovery")
 await shot("aqueduct-start")
 routes=app.sim.room.def.workshopRoutes
 var proofs=[]
 for i in range(routes.size()):
  var proof=await play(i,true)
  proofs.append(proof)
  check(proof.finish and proof.deaths==0,"deathless ordinary-input route: "+routes[i].name)
  check(not proof.advanced,"no advanced movement required: "+routes[i].name)
  await shot("route-%d-finish"%i)
 check(proofs[0].moving_cling and proofs[0].right_bank and proofs[0].crumble_landing,"eastern route connects carrier, far bank and temporary upper landing")
 check(proofs[1].max_x<144 and proofs[1].refills==1 and not proofs[1].right_bank,"western approach uses refill and wall departure without visiting the far bank")
 check(proofs[2].shard and proofs[2].shard_recovery and proofs[2].finish,"optional detour includes pickup, wall recovery and return to the flag")
 check(app.workshop_completed.has("workshop-aqueduct") and app.workshop_shards.has("workshop-aqueduct"),"normal finish and optional finish tracked separately")
 app.retry_room()
 check(not has_shard() and not app.workshop_goal_reached() and app.workshop_shards.has("workshop-aqueduct"),"retry resets route and pickup while retaining a banked optional finish")
 app.restart_world()
 check(app.workshop_completed.is_empty() and app.workshop_shards.is_empty(),"restart clears both completion records")
 app.load_section(0)
 journey(routes[2].tape.slice(0,5))
 for f in range(app.journey.size()): app._physics_process(1.0/60.0)
 app.journey=[]
 app.journey_frame=0
 check(has_shard() and app.workshop_shards.is_empty(),"pickup is carried until the finish, rather than awarded at touch")
 app.sim.die()
 for f in range(50): app._physics_process(1.0/60.0)
 check(not has_shard() and app.workshop_shards.is_empty(),"dying after pickup restores shard without awarding the optional objective")
 app.retry_room()
 key(KEY_H)
 check(app.notice_time>0 and app.notice_label.text==app.sim.room.def.hint,"hint remains optional")
 for i in range(routes.size()):
  app.watch=false
  app.workshop_demo_picker.select(i)
  app.toggle_watch()
  var deaths=app.sim.deaths
  for f in range(app.tape.size()): app._physics_process(1.0/60.0)
  check(app.watch and app.workshop_goal_reached() and app.sim.deaths==deaths,"demonstration playback: "+routes[i].name)
 check(app.workshop_completed.is_empty() and app.workshop_shards.is_empty(),"demonstrations award neither player completion nor shard completion")
 app.toggle_watch()
 check(not app.watch and app.sim.world_context==app.world,"Take control restores live world physics")
 app.restart_world()
 var carrier=app.sim.ents.filter(func(e):return e.type=="zip")[0]
 check(carrier.state=="idle" and carrier.x==carrier.ox,"new attempt resets carrier to its starting position")
 check(Codec.first_difference(original_campaign,app.chapters[1].world.data)=="","workshop leaves current campaign data untouched")
 app.switch_chapter(1)
 check(not app.workshop_controls.visible and not app.workshop_demo_picker.visible and app.watch_button.text=="Watch reference","campaign keeps its ordinary interface")
 app.switch_chapter(4)
 app.set_paused(true)
 await shot("aqueduct-menu")
 if output!="":
  var file=FileAccess.open(output+"/checks.json",FileAccess.WRITE)
  file.store_string(JSON.stringify({"checks":checks,"routes":proofs},"  "))
 print("AQUEDUCT ","FAILED" if failed else "PASSED"," · ",checks.size()," checks")
 await app.close_app(1 if failed else 0)
