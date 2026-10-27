extends SceneTree
## Witnesses, mechanic restrictions, reproduced shortcuts and the real application's retry flow.
const R=preload("res://tests/workshop_routes.gd")
const Core=preload("res://scripts/core.gd")
const Loader=preload("res://scripts/room_loader.gd")
const Authoring=preload("res://scripts/authoring_data.gd")
const Codec=preload("res://authoring/codec.gd")
const Main=preload("res://main.tscn")
var checks=[]
var proofs=[]
var windows={}
var failed=false
func _initialize():run.call_deferred()
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 checks.append({"passed":bool(ok),"label":label});failed=failed or not ok
func route(data,index,variant=0,mode=""):
 return R.play(data,index,data.world.rooms[index].workshopRoutes[variant].tape,mode)
func count_event(proof,kind):return proof.events.filter(func(e):return e.kind==kind).size()
func lit(core):return core.ents.filter(func(e):return e.type=="stone" and e.get("lit",false)).size()
func run():
 var source=JSON.parse_string(FileAccess.get_file_as_string("res://data/world4.json"))
 var data=Authoring.read(source)
 var fixture=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/woods-workshop.json"))
 for i in range(8):check(Codec.first_difference(data.world.rooms[i],fixture.existingRooms[i])=="","previous room preserved: "+fixture.existingRooms[i].name)
 check(data.world.rooms.size()==17,"six contained Woods puzzles and three larger combinations append to the existing eight")
 var native=load("res://levels/world4.tscn").instantiate()
 check(Codec.first_difference(Authoring.baseline(source),native.compile_into(Authoring.baseline(source)))=="","native authoring roundtrip preserves every layout, object and recording")
 for i in range(8,17):
  var room=data.world.rooms[i]
  check(room.get("workshopBiome","")=="woods" and "strike" not in room.lock and "parry" in room.lock and "portal" in room.lock,"Woods mechanics enabled without later-world abilities: "+room.name)
  if i<14:check(room.cols==40 and room.rows==23,"contained room fits one gameplay screen: "+room.name)
  else:check(room.cols>40 or room.rows>23,"combined puzzle has its own larger room: "+room.name)
  var node=native.get_node("Rooms").get_child(i)
  check(Codec.objects(node).all(func(o):return o.position.x==round(o.position.x/8)*8 and o.position.y==round(o.position.y/8)*8),"gameplay objects retain the 8px authoring grid: "+room.name)
  for variant in range(room.workshopRoutes.size()):
   var p=route(data,i,variant)
   proofs.append({"room":room.id,"variant":variant,"proof":p})
   check(p.finish and p.deaths==0 and not p.advanced,"ordinary deathless solution: "+room.name+" / "+room.workshopRoutes[variant].name)
 native.free()
 for config in [[8,"no_pods"],[9,"no_bells"],[10,"no_pods"],[11,"no_pods"],[11,"permanent_crumble"],[12,"no_pods"],[14,"no_pods"],[15,"no_pods"],[15,"no_bells"],[15,"permanent_crumble"],[16,"no_pods"],[16,"no_bells"]]:
  check(not route(data,config[0],0,config[1]).finish,"recorded route depends on "+config[1]+": "+data.world.rooms[config[0]].name)
 for i in [10,14]:check(count_event(route(data,i),"bell")==0 and count_event(route(data,i),"pod")>0,"selective pod cut leaves the adjacent bell silent: "+data.world.rooms[i].name)
 check(route(data,11).crumbles.any(func(e):return e.state=="broken") and count_event(route(data,11),"pod")==1,"Hollow Landing uses the collapsed opening and pod rebound")
 check(route(data,15).crumbles.any(func(e):return e.state=="broken") and count_event(route(data,15),"bell")==1,"Hollow Crown links collapse, pod and restored trunk")
 var low=route(data,13);var high=route(data,13,1)
 check(count_event(low,"pod")==0 and low.landings.any(func(e):return e[2]==133),"Forked Canopy lower route uses the low phase branch without a pod")
 check(count_event(high,"pod")==1 and high.landings.any(func(e):return e[2]==53),"Forked Canopy upper route lands on the high branch")
 check(not route(data,13,1,"no_bells").landings.any(func(e):return e[2]==53),"bell preparation changes access to the high route")
 var left=route(data,16);var right=route(data,16,1)
 check(left.stakes.size()==2 and right.stakes.size()==2 and left.stakes[0].x<right.stakes[0].x,"Two Boughs supports both wing orders with ordinary inputs")
 for bypass in fixture.bypasses:
  var former=data.duplicate(true);former.world.rooms[bypass.index]=bypass.room
  check(R.play(former,bypass.index,bypass.tape,bypass.mode).finish,"positive control reproduces bypass: "+bypass.room.name)
  check(not R.play(data,bypass.index,bypass.tape,bypass.mode).finish,"revised geometry rejects that successful bypass: "+bypass.room.name)
 for config in [[8,5],[9,3],[10,3],[11,3],[12,4],[13,3],[14,3],[15,3]]:
  var result=R.timing_window(data,config[0],config[1],3)
  windows[data.world.rooms[config[0]].id]=result
  check(result.size()>=3,"multiple input timings remain playable: "+data.world.rooms[config[0]].name+" "+str(result))
 # Completion must require both stakes even if the knight can physically reach a flag.
 for i in [12,14,16]:
  var core=Core.new(data.constants.duplicate(true),data.playerDefaults);core.load_room(Loader.parse(data.world.rooms[i]))
  var g=core.room.def.workshopGoal;core.p.x=g[0];core.p.y=g[1]-core.p.h;core.p.onGround=true
  check(not R.at_goal(core),"unlit stakes cannot award completion: "+data.world.rooms[i].name)
  for e in core.ents:
   if e.type=="stone":e.lit=true
  check(R.at_goal(core),"lighting all stakes unlocks completion: "+data.world.rooms[i].name)
 await check_application(data)
 var args=OS.get_cmdline_user_args()
 if not args.is_empty():FileAccess.open(args[0],FileAccess.WRITE).store_string(JSON.stringify({"checks":checks,"proofs":proofs,"timing":windows},"  "))
 print("WOODS WORKSHOP ","FAILED" if failed else "PASSED"," · ",checks.size()," checks")
 quit(1 if failed else 0)
func check_application(data):
 var app=Main.instantiate();app.test_mode=true;app.initial_world=4
 root.add_child(app);await process_frame;app.set_physics_process(false)
 app.load_section(16)
 var tape=data.world.rooms[16].workshopRoutes[0].tape.slice(0,17)
 app.journey=[];app.journey_frame=0
 for part in tape:
  for f in range(int(part[0])):app.journey.append(part[1])
 for f in range(app.journey.size()):app._physics_process(1.0/60.0)
 app.journey=[];app.journey_frame=0
 check(lit(app.sim)==1,"actual application lights the first bough and returns to the hub")
 app.retry_room()
 for f in range(80):app._physics_process(1.0/60.0)
 check(lit(app.sim)==1 and app.sim.phase==0 and app.sim.p.dashes==1,"R retry preserves the cleared wing while resetting phase and movement")
 app.sim.die()
 for f in range(100):app._physics_process(1.0/60.0)
 check(lit(app.sim)==1 and app.sim.p.state=="normal","death and automatic respawn preserve the cleared wing")
 app.world.restart();app.sim=app.world.active();app.load_section(16)
 check(lit(app.sim)==0,"full restart clears both bough stakes")
 app.load_section(12)
 for e in app.sim.ents:
  if e.type=="stone":e.lit=true
 app.retry_room()
 check(lit(app.sim)==0,"ordinary stake room retries retain their clean puzzle reset")
 for i in [13,16]:
  for v in range(2):
   app.load_section(i);app.workshop_demo_picker.select(v);app.toggle_watch()
   for f in range(app.tape.size()):app._physics_process(1.0/60.0)
   check(app.workshop_goal_reached() and app.sim.deaths==0,"application plays alternate solution: "+data.world.rooms[i].workshopRoutes[v].name)
   app.toggle_watch()
 app.load_section(8)
 check(app.landscape.forest,"Woods workshop selects the forest presentation")
 app.load_section(0)
 check(not app.landscape.forest,"returning to the original workshop restores its presentation")
 app.queue_free();await process_frame
