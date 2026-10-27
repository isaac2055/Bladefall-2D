extends SceneTree
const R=preload("res://tests/workshop_routes.gd")
const Core=preload("res://scripts/core.gd")
const Loader=preload("res://scripts/room_loader.gd")
const Authoring=preload("res://scripts/authoring_data.gd")
const Codec=preload("res://authoring/codec.gd")
const Main=preload("res://main.tscn")
var failed=false
var checks=[]
var proofs=[]
func _initialize():run.call_deferred()
func check(ok,label):
 print("PASS " if ok else "FAIL ",label);checks.append({"passed":bool(ok),"label":label});failed=failed or not ok
func replay(data,i,tape):
 var c=Core.new(data.constants.duplicate(true),data.playerDefaults);c.load_room(Loader.parse(data.world.rooms[i]))
 for part in tape:
  for f in range(int(part[0])):c.step(R.decode(part[1]))
 return c
func run():
 var source=JSON.parse_string(FileAccess.get_file_as_string("res://data/world4.json"));var data=Authoring.read(source)
 var old=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/woods-v020.json"))
 for i in range(3):check(Codec.first_difference(data.world.rooms[i+8],old.rooms[i])=="","previous Woods room preserved: "+old.rooms[i].name)
 var native=load("res://levels/world4.tscn").instantiate()
 check(Codec.first_difference(Authoring.baseline(source),native.compile_into(Authoring.baseline(source)))=="","all thirteen native rooms roundtrip")
 for i in [11,12]:
  var room=data.world.rooms[i];var tape=room.workshopRoutes[0].tape;var p=R.play(data,i,tape)
  proofs.append({"room":room.id,"proof":p})
  check(p.finish and p.deaths==0 and not p.advanced,"deathless ordinary solution: "+room.name)
  check(room.cols>40 or room.rows>23,"independent scrolling room: "+room.name)
  check(not room.get("workshopRequireStakes",false) and (room.get("workshopRequireAllShards",false) if i==12 else not room.get("workshopRequireShard",false)),"authored finish requirement: "+room.name)
  check(Codec.objects(native.get_node("Rooms").get_child(i)).all(func(o):return o.position==o.position.snapped(Vector2(8,8))),"8px gameplay objects: "+room.name)
  check(not R.play(data,i,tape,"no_pods").finish,"recorded route uses the pod: "+room.name)
 native.free()
 var hollow=data.world.rooms[11].workshopRoutes[0].tape
 var opened=replay(data,11,hollow.slice(0,4))
 check(opened.phase==1 and opened.p.onGround and opened.p.y==205,"Hollow descent reaches the blue pocket beneath the divider")
 var emerged=replay(data,11,hollow.slice(0,8))
 check(emerged.phase==1 and emerged.p.y+emerged.p.h<=152,"pod clears the missing far cap before restoration")
 var restored=replay(data,11,hollow.slice(0,10)+[[1,""]])
 check(restored.phase==0 and restored.p.onGround and restored.p.y==141,"restored far cap catches the returning feet")
 var permanent=data.duplicate(true);var rows=permanent.world.rooms[11].map
 rows[19]=rows[19].substr(0,21)+"#########"+rows[19].substr(30)
 check(not R.play(permanent,11,hollow).finish,"a permanent cap blocks the upward route")
 var seed=data.world.rooms[12].workshopRoutes[0].tape
 var pod_events=proofs[1].proof.events.filter(func(e):return e.kind=="pod")
 check(data.world.rooms[12].map.reduce(func(n,row):return n+row.count("b"),0)==1 and pod_events.size()==2,"one physical pod supplies both crossings")
 check(pod_events[0].position[0]>=216 and pod_events[1].position[0]<200,"the two uses approach different faces of the housing")
 var bank=replay(data,12,seed.slice(0,10))
 check(bank.phase==1 and bank.p.onGround and bank.p.x>280,"outward rebound preserves blue through the far-side recovery")
 var inside=replay(data,12,seed.slice(0,21))
 check(inside.phase==0 and inside.p.x<200,"phase is changed after crossing to the inside of the upper partition")
 var home=replay(data,12,seed.slice(0,27))
 check(home.phase==1 and home.p.onGround and home.p.y==149,"return rebound and dash create the blue homeward landing")
 for b in JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/returning-seed-bypasses.json")):
  var former=data.duplicate(true);former.world.rooms[12]=b.room
  var current=data.duplicate(true)
  if b.has("goal"):former.world.rooms[12].workshopGoal=b.goal;current.world.rooms[12].workshopGoal=b.goal
  check(R.play(former,12,b.tape,b.mode).finish,"positive control reproduces former shortcut: "+b.mode)
  check(not R.play(current,12,b.tape,b.mode).finish,"revised housing rejects shortcut: "+b.mode)
 for pair in [[11,7],[11,5],[12,5],[12,24],[12,29]]:
  var w=R.timing_window(data,pair[0],pair[1],6)
  check(w.size()>=5,"multiple input timings: "+data.world.rooms[pair[0]].name+" "+str(w))
 var app=Main.instantiate();app.test_mode=true;app.initial_world=4;root.add_child(app);await process_frame;app.set_physics_process(false)
 for i in [11,12]:
  app.load_section(i);app.toggle_watch()
  for f in range(app.tape.size()):app._physics_process(1.0/60.0)
  check(app.workshop_goal_reached() and app.sim.deaths==0,"actual game demonstration: "+data.world.rooms[i].name)
  app.toggle_watch();app.retry_room()
  check(app.sim.phase==0 and app.sim.p.dashes==1,"retry restores the initial puzzle: "+data.world.rooms[i].name)
 app.queue_free();await process_frame
 var args=OS.get_cmdline_user_args()
 if not args.is_empty():FileAccess.open(args[0],FileAccess.WRITE).store_string(JSON.stringify({"checks":checks,"proofs":proofs},"  "))
 print("NEW WOODS ROOMS ","FAILED" if failed else "PASSED"," · ",checks.size()," checks");quit(1 if failed else 0)
