extends SceneTree
## Native routes, actual application play, causal counterfactuals and reproduced shortcuts.
const Main=preload("res://main.tscn")
const Core=preload("res://scripts/core.gd")
const Loader=preload("res://scripts/room_loader.gd")
const Authoring=preload("res://scripts/authoring_data.gd")
const Codec=preload("res://authoring/codec.gd")
const Routes=preload("res://tests/workshop_routes.gd")
var app
var failed=false
var checks=[]
var output=""
var reports=[]
var captured={}
var searches={}
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
func has_contact(proof,at,state="",dash=-1):
 return proof.contacts.any(func(e):return e.origin==at and (state=="" or e.state==state) and (dash<0 or e.dash==dash))
func phase_test(data,index,mode,expected=false):
 var p=Routes.play(data,index,data.world.rooms[index].workshopRoutes[0].tape,mode)
 reports[index].ablations[mode]=p
 check(p.finish==expected,"%s: %s"%[data.world.rooms[index].name,mode])
 return p
func clock_case(data,config):
 var rows=[]
 for r in range(23): rows.append("#".repeat(40) if r in [0,22] else "#"+".".repeat(38)+"#")
 var row=rows[19];row[9]="P";rows[19]=row
 row=rows[20]
 for x in range(8,11): row[x]="Z"
 rows[20]=row
 var route=[8,0]
 if not config.is_empty(): route.append(config)
 var d={"id":"clock","map":rows,"exit":"none","zips":[route]}
 var c=Core.new(data.constants.duplicate(true),data.playerDefaults)
 c.load_room(Loader.parse(d))
 var counts={}
 for f in range(600):
  c.step({})
  var state=c.ents[0].state
  counts[state]=counts.get(state,0)+1
  if state=="idle": break
 return {"counts":counts,"deaths":c.deaths}
func check_native(source,fixtures):
 var chapter=load("res://levels/world4.tscn").instantiate()
 var base=Authoring.baseline(source)
 var compiled=chapter.compile_into(base)
 check(Codec.first_difference(base,compiled)=="","native workshop rooms preserve geometry, timings, colors and recordings")
 check(chapter.validate_data(compiled).is_empty(),"saved workshop validates")
 check(chapter.get_node("Rooms").get_child_count()==24,"twenty-four independently editable rooms")
 for i in range(2): check(Codec.first_difference(fixtures.acceptedRooms[i],compiled.world.rooms[i])=="","accepted room preserved: "+compiled.world.rooms[i].name)
 var timed=null
 for room in chapter.get_node("Rooms").get_children():
  for item in room.get_node("Objects").get_children():
   if item.kind=="Fixture" and item.glyph=="Z" and item.parameters.has("holdFrames"): timed=item;break
  if timed!=null: break
 check(timed!=null and timed.parameters.holdFrames==60,"ferry pause is editable on its own native object")
 if timed!=null:
  timed.parameters.holdFrames=0
  check(not chapter.validate_data(chapter.compile_into(base)).is_empty(),"native validation rejects a zero-length pause")
  timed.parameters.holdFrames=60.5
  check(not chapter.validate_data(chapter.compile_into(base)).is_empty(),"native validation rejects fractional timing")
  timed.parameters.holdFrames=60
  timed.parameters.returnFrames=45
  var edited=chapter.compile_into(base)
  var edited_ferry=edited.world.rooms[3]
  var parsed=Loader.parse(edited_ferry)
  check(parsed.entities.any(func(e):return e.type=="zip" and e.get("holdFrames",0)==60 and e.get("returnFrames",0)==45),"edited native timing reaches the gameplay loader")
 chapter.free()
 var ordinary=clock_case(compiled,{})
 check(ordinary.deaths==0 and ordinary.counts.wind==4 and ordinary.counts.go==30 and ordinary.counts.hold==30 and ordinary.counts.back==120,"default moving-block cycle remains 4/30/30/120 frames")
 var authored=clock_case(compiled,{"holdFrames":60,"returnFrames":45})
 check(authored.deaths==0 and authored.counts.wind==4 and authored.counts.go==30 and authored.counts.hold==60 and authored.counts.back==45,"authored timing changes only pause/return duration")
 return compiled
func check_routes(data):
 for i in range(data.world.rooms.size()):
  var d=data.world.rooms[i]
  var p=Routes.play(data,i,d.workshopRoutes[0].tape)
  reports.append({"room":d.id,"baseline":p,"ablations":{},"timing":{}})
  check(p.finish and p.deaths==0 and not p.advanced,"deathless ordinary-input route: "+d.name)
 for i in range(8): phase_test(data,i,"static")
 phase_test(data,0,"no_x_boost");phase_test(data,0,"no_y_boost")
 phase_test(data,1,"no_boost",true)
 phase_test(data,1,"park_high");phase_test(data,1,"park_low")
 phase_test(data,2,"no_x_boost");phase_test(data,2,"no_y_boost",true)
 phase_test(data,2,"freeze:carrier")
 phase_test(data,3,"no_return_dash");phase_test(data,3,"no_refill");phase_test(data,3,"park:ferry")
 phase_test(data,4,"no_x_boost");phase_test(data,4,"no_y_boost");phase_test(data,4,"no_refill")
 var p=phase_test(data,4,"park:counter")
 check(p.shard,"Engine parked-weight counterfactual happens after collecting the seal")
 p=phase_test(data,4,"hold:counter")
 check(p.shard,"Engine raised-weight counterfactual retains the seal trip")
 phase_test(data,5,"no_y_boost");phase_test(data,5,"no_home_refill");phase_test(data,5,"park:ferry")
 p=phase_test(data,5,"early:finish")
 check(p.shard,"premature finishing lift still allows the outward pickup before failing the return")
 check(has_contact(reports[0].baseline,[288,128],"go",0),"Relay reaches its second moving block with no dash")
 check(has_contact(reports[1].baseline,[88,144],"back",0),"Counterweight catches the returning foothold with no dash")
 check(has_contact(reports[2].baseline,[152,96],"go",1),"Lintel preserves its dash while the horizontal carrier moves")
 var ferry=reports[3].baseline
 var first_gate=9999
 for c in ferry.contacts:
  if c.origin==[352,152]: first_gate=min(first_gate,c.f)
 check(first_gate<ferry.pickup_frame and has_contact(ferry,[272,184],"back"),"Ferry prepares its gate outward and catches its carrier on return")
 var engine=reports[4].baseline
 check(has_contact(engine,[320,144],"go",0) and has_contact(engine,[320,144],"back",0),"Engine uses opposite trips of the same counterweight with no dash")
 check(engine.refills.any(func(r):return r.x==344 and r.y==104),"Engine's pocket restores the dash while the machine's cycle continues")
 check(engine.landings.size()==2,"Engine has no permanent landing between the initial launch and finish")
 var circuit=reports[5].baseline
 check(has_contact(circuit,[272,184],"back") and has_contact(circuit,[256,64],"go",0),"Circuit connects the returning ferry to the finishing lift")
 check(circuit.refills.any(func(r):return r.x==320 and r.y==104),"Circuit reaches the high home crystal before the final transfer")
 check(circuit.actions.any(func(a):return a.kind=="walljump" and a.vy< -180 and a.dash==0),"Circuit's final height comes from an upward launch without a dash")
 for pair in [[2,7,3],[3,6,5],[4,16,10],[5,18,5]]:
  var window=Routes.timing_window(data,pair[0],pair[1])
  reports[pair[0]].timing[str(pair[1])]=window
  check(window.size()>=pair[2],"multiple ordinary-input timings: "+data.world.rooms[pair[0]].name+" "+str(window))
func check_shortcuts(data,fixtures):
 var former=data.duplicate(true)
 former.world.rooms[2]=fixtures.formerLintel
 check(Routes.play(former,2,fixtures.lintelEscape).finish,"positive control reproduces the reported lintel escape in the former room")
 var escaped=Routes.play(data,2,fixtures.lintelEscape)
 check(not escaped.finish,"revised lintel blocks that exact moving-lift escape")
 var bypasses=0
 var attempts=0
 for wait_time in range(25,66,5):
  for walk in [6,8,10,12,14]:
   for held in [12,20,26]:
    for aim in ["ux","rux"]:
     var tape=[[20,"l"],[15,"lj"],[wait_time,""],[walk,"r"],[held,"j"],[10,aim],[70,"rg"]]
     var p=Routes.play(data,2,tape)
     attempts+=1
     if p.finish and not has_contact(p,[152,96]): bypasses+=1
 searches.lintel={"attempts":attempts,"bypasses":bypasses}
 check(bypasses==0,"active-lift timing/direction search cannot skip the horizontal carrier")
 var relaxed=data.duplicate(true)
 relaxed.world.rooms[3]=fixtures.formerFerry
 check(Routes.play(relaxed,3,fixtures.formerFerryUnprepared).finish,"positive control reproduces the late-preparation win in the earlier ferry draft")
 var wrong=Routes.play(data,3,fixtures.ferryUnprepared)
 var gate_after=false
 for c in wrong.contacts:
  if c.origin==[352,152] and c.f>wrong.pickup_frame: gate_after=true
 check(wrong.shard and gate_after and not wrong.finish,"collecting first and priming the gate on return no longer clears the Ferry")
 bypasses=0;attempts=0
 for wait_time in range(12,27,2):
  for release in range(2,13,2):
   for landing in range(0,11,2):
    var tape=fixtures.ferryUnprepared.duplicate(true)
    tape[fixtures.ferryLateSearch.waitIndex][0]=wait_time
    tape[fixtures.ferryLateSearch.releaseIndex][0]=release
    tape[fixtures.ferryLateSearch.landingIndex][0]=landing
    var p=Routes.play(data,3,tape)
    attempts+=1
    if p.finish and p.deaths==0: bypasses+=1
 searches.ferry_late={"attempts":attempts,"bypasses":bypasses}
 check(bypasses==0,"retimed late gate activation cannot recover the ferry in the tested search")
 bypasses=0;attempts=0
 for index in [3,5]:
  var prefix=data.world.rooms[index].workshopRoutes[0].tape.slice(0,10)
  for held in [5,8,12,20,26]:
   for aim in ["ux","lux","lx"]:
    for recovery in ["lg","rgu"]:
     var tape=prefix.duplicate(true)
     tape.append_array([[held,"ljg"],[10,aim],[100,recovery]])
     var p=Routes.play(data,index,tape)
     attempts+=1
     if p.finish and not has_contact(p,[272,184],"back"): bypasses+=1
 searches.return_roof={"attempts":attempts,"bypasses":bypasses}
 check(bypasses==0,"return-wall jumps and dashes cannot use the roof lip to skip the returning ferry")
 # The high crystal and finishing lift must not be reachable directly from the entrance floor.
 bypasses=0;attempts=0
 for run_time in [0,6,12,17]:
  for held in [8,12,20,26]:
   for aim in ["ux","rux","lux"]:
    var p=Routes.play(data,5,[[run_time,"r"],[held,"rj"],[12,aim],[40,"rgu"],[40,"lg"]])
    attempts+=1
    if p.finish or p.refills.any(func(r):return r.x==320 and r.y==104): bypasses+=1
 searches.circuit_floor={"attempts":attempts,"bypasses":bypasses}
 check(bypasses==0,"entrance jump/dash search cannot reach the Circuit's high refill or finish")
func app_route(index):
 app.watch=false
 app.load_section(index)
 await shot("%d-start"%index)
 journey(app.sim.room.def.workshopRoutes[0].tape)
 var deaths=app.sim.deaths
 var finish=false
 var camera_ok=true
 var camera_positions=[]
 for f in range(app.journey.size()):
  app._physics_process(1.0/60.0)
  finish=finish or app.workshop_goal_reached()
  app.landscape.snap_actor()
  var target=app.landscape.target_camera()-app.landscape.active_position
  camera_ok=camera_ok and target.x>=0 and target.y>=0 and target.x<=max(0,app.sim.room.w-320) and target.y<=max(0,app.sim.room.h-184)
  camera_positions.append(target)
  var phase=""
  for role in app.sim.room.def.get("workshopDevices",{}):
   var e=Routes.device(app.sim,role)
   if e!=null and app.sim.riding(e) and e.state in ["go","back"]: phase="%d-%s-%s"%[index,role,e.state]
  if app.workshop_has_shard() and not captured.has("%d-pickup"%index): phase="%d-pickup"%index
  if phase!="" and not captured.has(phase):
   captured[phase]=true
   await shot(phase)
 app.journey=[]
 app.journey_frame=0
 check(finish and app.sim.deaths==deaths,"live application clear: "+app.sim.room.name)
 check(app.workshop_completed.has(app.sim.room.id),"completion awarded: "+app.sim.room.name)
 check(camera_ok,"camera remains inside authored room bounds: "+app.sim.room.name)
 if index<2: check(camera_positions.all(func(v):return v==Vector2.ZERO),"accepted room keeps its fixed framing: "+app.sim.room.name)
 elif app.sim.room.def.get("cols",40)>40 or app.sim.room.def.get("rows",23)>23: check(camera_positions.any(func(v):return v!=camera_positions[0]),"camera follows the larger room: "+app.sim.room.name)
 await shot("%d-finish"%index)
func check_application(data):
 app=Main.instantiate()
 app.test_mode=true
 app.initial_world=4
 root.add_child(app)
 await process_frame
 app.set_physics_process(false)
 var campaign=app.chapters[1].world.data.duplicate(true)
 check(app.chapter_number==4 and app.room_picker.item_count==24,"direct launch exposes all twenty-four workshop rooms")
 check(app.workshop_previous.visible and app.workshop_next.visible,"previous/next room controls are available")
 check(app.world.data.constants==app.chapters[1].world.data.constants,"all rooms retain Outskirts player movement constants")
 for i in range(data.world.rooms.size()): await app_route(i)
 for i in [3,4,5,7]:
  app.load_section(i)
  app.retry_room()
  var goal=app.sim.room.def.workshopGoal
  # A goal-condition unit check, separate from every ordinary-input completion above.
  app.sim.p.x=goal[0]+8;app.sim.p.y=goal[1]-app.sim.p.h;app.sim.p.onGround=true
  check(not app.workshop_goal_reached(),"flag requires the carried pickup: "+app.sim.room.name)
  app.retry_room()
  check(not app.workshop_has_shard(),"retry restores an unbanked pickup: "+app.sim.room.name)
 app.restart_world()
 check(app.workshop_completed.is_empty() and app.workshop_shards.is_empty(),"full restart clears session awards")
 app.load_section(5)
 journey(data.world.rooms[5].workshopRoutes[0].tape.slice(0,10))
 for f in range(app.journey.size()): app._physics_process(1.0/60.0)
 app.journey=[];app.journey_frame=0
 check(app.workshop_has_shard() and app.workshop_shards.is_empty(),"Circuit pickup is carried before a successful return")
 app.sim.die()
 for f in range(50): app._physics_process(1.0/60.0)
 check(not app.workshop_has_shard() and app.workshop_shards.is_empty(),"death restores the carried pickup without banking it")
 key(KEY_H)
 check(app.notice_time>0 and app.notice_label.text==app.sim.room.def.hint,"hint remains optional")
 for i in range(data.world.rooms.size()):
  app.watch=false
  app.load_section(i)
  app.toggle_watch()
  var deaths=app.sim.deaths
  for f in range(app.tape.size()): app._physics_process(1.0/60.0)
  check(app.watch and app.workshop_goal_reached() and app.sim.deaths==deaths,"solution playback: "+app.sim.room.name)
  app.toggle_watch()
 check(app.workshop_completed.is_empty() and app.workshop_shards.is_empty(),"watching solutions awards no player completion")
 check(not app.watch and app.sim.world_context==app.world,"Take control restores live world physics")
 app.load_section(data.world.rooms.size()-1)
 app.workshop_room(1)
 check(app.sim.room.id=="workshop-relay","next room wraps to Relay")
 app.workshop_room(-1)
 check(app.sim.room.id=="workshop-temporary-dock","previous room wraps to The Dock You Need Only Once")
 check(Codec.first_difference(campaign,app.chapters[1].world.data)=="","workshop leaves campaign data untouched")
 app.switch_chapter(1)
 check(not app.workshop_controls.visible and not app.workshop_demo_picker.visible,"campaign retains its ordinary interface")
 app.switch_chapter(4)
 app.set_paused(true)
 await shot("workshop-menu")
func run():
 if not OS.get_cmdline_user_args().is_empty():
  output=OS.get_cmdline_user_args()[0]
  DirAccess.make_dir_recursive_absolute(output)
 var source=JSON.parse_string(FileAccess.get_file_as_string("res://data/world4.json"))
 var fixtures=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/workshop-regressions.json"))
 var data=check_native(source,fixtures)
 check_routes(data)
 check_shortcuts(data,fixtures)
 await check_application(data)
 if output!="":
  var file=FileAccess.open(output+"/checks.json",FileAccess.WRITE)
  file.store_string(JSON.stringify({"checks":checks,"rooms":reports,"searches":searches},"  "))
 print("LINKED WORKSHOP ","FAILED" if failed else "PASSED"," · ",checks.size()," checks")
 await app.close_app(1 if failed else 0)
