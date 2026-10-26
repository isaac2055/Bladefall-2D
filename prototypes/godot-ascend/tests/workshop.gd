extends SceneTree
## Four real application routes, their causal dependencies, recovery and editor round trip.
const Main=preload("res://main.tscn")
const Authoring=preload("res://scripts/authoring_data.gd")
const Codec=preload("res://authoring/codec.gd")
const Routes=preload("res://tests/workshop_routes.gd")
var app
var failed=false
var checks=[]
var output=""
var reports=[]
var captured={}
func _initialize(): run.call_deferred()
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 checks.append({"passed":bool(ok),"label":label})
 failed=failed or not ok
func shot(name):
 if output=="" or DisplayServer.get_name()=="headless": return
 app.landscape.snap_actor()
 for f in range(30): app.landscape._process(1.0/60.0)
 app.banner_time=0
 app.room_banner.modulate.a=0
 app.notice_time=0
 app.notice_label.modulate.a=0
 await process_frame
 # A paused/occluded Mac window may stop scheduling draws, leaving frame_post_draw pending.
 RenderingServer.force_draw()
 root.get_texture().get_image().save_png(output+"/"+name+".png")
func journey(parts):
 app.journey=[]
 app.journey_frame=0
 for part in parts:
  for f in range(int(part[0])): app.journey.append(part[1])
func key(code):
 var event=InputEventKey.new()
 event.physical_keycode=code
 event.keycode=code
 event.pressed=true
 app._unhandled_input(event)
func app_route(index):
 app.watch=false
 app.load_section(index)
 await shot("%d-start"%index)
 journey(app.sim.room.def.workshopRoutes[0].tape)
 var deaths=app.sim.deaths
 var finish=false
 for f in range(app.journey.size()):
  app._physics_process(1.0/60.0)
  finish=finish or app.workshop_goal_reached()
  var phase=""
  if index==0 and app.sim.p.state=="climb" and app.sim.p.dashes==0 and app.sim.p.x==280: phase="relay-second-catch"
  if index==1 and app.sim.p.state=="climb" and app.sim.p.x==120: phase="returning-foothold"
  if index==2 and app.sim.p.state=="climb" and app.sim.p.x>176 and app.sim.p.x<210: phase="lintel-side-ride"
  if index==3 and app.workshop_has_shard() and app.sim.p.state=="climb" and app.sim.p.x==296: phase="ferry-far-wall"
  if index==3 and app.workshop_has_shard() and app.sim.p.dashes==0 and app.sim.p.y+app.sim.p.h==136 and app.sim.p.x<240: phase="ferry-return-catch"
  if phase!="" and not captured.has(phase):
   captured[phase]=true
   await shot(phase)
 app.journey=[]
 app.journey_frame=0
 check(finish and app.sim.deaths==deaths,"live ordinary-input clear: "+app.sim.room.name)
 check(app.workshop_completed.has(app.sim.room.id),"live completion awarded: "+app.sim.room.name)
 await shot("%d-finish"%index)
func run():
 if not OS.get_cmdline_user_args().is_empty():
  output=OS.get_cmdline_user_args()[0]
  DirAccess.make_dir_recursive_absolute(output)
 var source=JSON.parse_string(FileAccess.get_file_as_string("res://data/world4.json"))
 var chapter=load("res://levels/world4.tscn").instantiate()
 var base=Authoring.baseline(source)
 var compiled=chapter.compile_into(base)
 check(Codec.first_difference(base,compiled)=="","all four native scenes preserve maps, settings and recordings")
 check(chapter.validate_data(compiled).is_empty(),"saved workshop validates")
 check(chapter.get_node("Rooms").get_child_count()==4,"four independently editable room nodes")
 chapter.free()
 for index in range(4):
  var d=compiled.world.rooms[index]
  var tape=d.workshopRoutes[0].tape
  var proof=Routes.play(compiled,index,tape)
  reports.append({"room":d.id,"baseline":proof,"ablations":{},"timing":{}})
  check(proof.finish and proof.deaths==0 and not proof.advanced,"deathless route without advanced moves: "+d.name)
  for mode in ["static","no_dash","no_x_boost","no_y_boost"]:
   var result=Routes.play(compiled,index,tape,mode)
   reports[index].ablations[mode]=result
   var expected=mode=="no_y_boost" and index>0 or mode=="no_x_boost" and index==1
   check(result.finish==expected,"causal check %s: %s"%[mode,d.name])
 var relay=reports[0].baseline
 check(relay.landings.size()==2,"relay has no standing reset between its two launches")
 check(relay.contacts.any(func(e):return e.origin==[288,128] and e.player_state=="climb" and e.dash==0),"relay reaches second counterweight with zero dashes")
 check(relay.actions.any(func(a):return a.kind=="walljump" and a.vy< -200 and a.dash==0),"relay final height comes from an upward launch with zero dashes")
 var door=reports[1].baseline
 check(door.contacts.any(func(e):return e.origin==[88,144] and e.state=="back" and e.dash==0),"returning door requires a returning foothold after the dash")
 for mode in ["park_high","park_low"]:
  var result=Routes.play(compiled,1,compiled.world.rooms[1].workshopRoutes[0].tape,mode)
  reports[1].ablations[mode]=result
  check(not result.finish,"counterweight cannot be replaced by a block parked "+mode)
 var lintel=reports[2].baseline
 check(lintel.landings.size()==2,"lintel has no standing reset between its first departure and exit")
 check(lintel.contacts.any(func(e):return e.origin==[152,96] and e.player_state=="climb" and e.dash==1),"lintel transfer preserves the dash on the horizontal block")
 check(lintel.actions.any(func(a):return a.kind=="walljump" and a.vx>240 and a.dash==1),"lintel exit uses horizontal launch momentum before spending the dash")
 var early=compiled.world.rooms[2].workshopRoutes[0].tape.duplicate(true)
 early[2][0]=40
 var early_proof=Routes.play(compiled,2,early)
 reports[2].early_launch=early_proof
 check(not early_proof.finish and early_proof.deaths>0 and early_proof.frames<110 and early_proof.final_position[1]==90,"launching near the upper stop before the boost settles hits the lintel")
 var ferry=reports[3].baseline
 check(ferry.first_pickup_dash==1,"ferry reaches the pickup while preserving the dash")
 check(ferry.contacts.any(func(e):return e.state=="back" and e.dash==0),"ferry catches the returning carrier with zero dashes")
 var no_return=Routes.play(compiled,3,compiled.world.rooms[3].workshopRoutes[0].tape,"no_return_dash")
 reports[3].ablations.no_return_dash=no_return
 check(no_return.shard and not no_return.finish,"pickup alone cannot complete the return without its dash")
 # Try several direct launches from A, aiming at the finish instead of boarding B.
 # These are bounded shortcut searches, not a claim to enumerate all human inputs.
 for index in [0,2]:
  var attempts=0
  var bypasses=0
  var prefix=compiled.world.rooms[index].workshopRoutes[0].tape.slice(0,4)
  for held in [8,12,20,28]:
   for aim in ["ux","rux","lux"]:
    for recovery in ["lgu","rgu"]:
     var tape=prefix.duplicate(true)
     tape.append_array([[held,"rj"],[6,aim],[80,recovery]])
     attempts+=1
     if Routes.play(compiled,index,tape).finish: bypasses+=1
  reports[index].direct_finish_search={"attempts":attempts,"successes":bypasses}
  check(bypasses==0,"direct finish search cannot skip the second block: "+compiled.world.rooms[index].name)
 var return_bypasses=0
 var return_attempts=0
 for wait_time in [0,5,10,20]:
  for held in [5,8,12,20,28,36]:
   var tape=compiled.world.rooms[3].workshopRoutes[0].tape.slice(0,7)
   tape.append_array([[wait_time,"rg"],[held,"lj"],[100,"lg"]])
   var result=Routes.play(compiled,3,tape)
   return_attempts+=1
   if result.finish or result.contacts.any(func(e):return e.state=="back"): return_bypasses+=1
 reports[3].dashless_return_search={"attempts":return_attempts,"successes":return_bypasses}
 check(return_bypasses==0,"different wall-jump timings cannot catch the retreating ferry without a dash")
 # Nearby timings are independent successful witnesses, not proof against every possible bypass.
 for pair in [[0,8,9],[1,7,10],[2,7,4],[3,7,6]]:
  var window=Routes.timing_window(compiled,pair[0],pair[1])
  reports[pair[0]].timing[str(pair[1])]=window
  check(window.size()>=pair[2],"multiple successful timings: "+compiled.world.rooms[pair[0]].name+" "+str(window))
 app=Main.instantiate()
 app.test_mode=true
 app.initial_world=4
 root.add_child(app)
 await process_frame
 app.set_physics_process(false)
 var original_campaign=app.chapters[1].world.data.duplicate(true)
 check(app.chapter_number==4 and app.world.regions.size()==4,"direct launcher opens all four workshop rooms")
 check(app.room_picker.item_count==4 and app.workshop_previous.visible and app.workshop_next.visible,"workshop menu exposes room selection and next/previous")
 check(app.world.data.constants==app.chapters[1].world.data.constants,"Outskirts movement constants unchanged")
 check(not app.bearing_caption().contains("SHARD"),"rooms without a shard have a truthful objective")
 for i in range(4):
  await app_route(i)
 check(app.workshop_shards.has("workshop-ferry"),"ferry return banks the carried pickup")
 app.retry_room()
 check(not app.workshop_has_shard() and not app.workshop_goal_reached(),"ferry spawn flag cannot award a clear without its shard")
 # Walk to the flag at spawn without going out: still incomplete.
 journey([[12,"l"],[12,""]])
 for f in range(app.journey.size()): app._physics_process(1.0/60.0)
 check(not app.workshop_goal_reached(),"standing on the home flag before pickup is not completion")
 app.journey=[]
 app.journey_frame=0
 app.restart_world()
 check(app.workshop_completed.is_empty() and app.workshop_shards.is_empty(),"restart clears both completion records")
 app.load_section(3)
 journey(compiled.world.rooms[3].workshopRoutes[0].tape.slice(0,7))
 for f in range(app.journey.size()): app._physics_process(1.0/60.0)
 app.journey=[]
 app.journey_frame=0
 check(app.workshop_has_shard() and app.workshop_shards.is_empty(),"far pickup is carried before successful return")
 app.sim.die()
 for f in range(50): app._physics_process(1.0/60.0)
 check(not app.workshop_has_shard() and app.workshop_shards.is_empty(),"death restores the unbanked shard")
 app.retry_room()
 key(KEY_H)
 check(app.notice_time>0 and app.notice_label.text==app.sim.room.def.hint,"hint is available on request")
 for i in range(4):
  app.watch=false
  app.load_section(i)
  app.toggle_watch()
  var deaths=app.sim.deaths
  for f in range(app.tape.size()): app._physics_process(1.0/60.0)
  check(app.watch and app.workshop_goal_reached() and app.sim.deaths==deaths,"solution playback: "+app.sim.room.name)
  app.toggle_watch()
 check(app.workshop_completed.is_empty() and app.workshop_shards.is_empty(),"demonstrations award neither player completion nor shard completion")
 check(not app.watch and app.sim.world_context==app.world,"Take control restores live world physics")
 check(Codec.first_difference(original_campaign,app.chapters[1].world.data)=="","workshop leaves campaign data untouched")
 app.switch_chapter(1)
 check(not app.workshop_controls.visible and not app.workshop_demo_picker.visible,"campaign keeps its ordinary interface")
 app.switch_chapter(4)
 app.workshop_room(1)
 check(app.sim.room.id=="workshop-relay","next room wraps to the first room")
 app.workshop_room(-1)
 check(app.sim.room.id=="workshop-ferry","previous room wraps to the final room")
 app.set_paused(true)
 await shot("workshop-menu")
 if output!="":
  var file=FileAccess.open(output+"/checks.json",FileAccess.WRITE)
  file.store_string(JSON.stringify({"checks":checks,"rooms":reports},"  "))
 print("LINKED WORKSHOP ","FAILED" if failed else "PASSED"," · ",checks.size()," checks")
 await app.close_app(1 if failed else 0)
