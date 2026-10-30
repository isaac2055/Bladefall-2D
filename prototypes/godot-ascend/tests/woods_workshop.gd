extends SceneTree
## Route witnesses, physical state decisions, old shortcuts and native/app integration.
const R=preload("res://tests/workshop_routes.gd")
const Core=preload("res://scripts/core.gd")
const Loader=preload("res://scripts/room_loader.gd")
const Authoring=preload("res://scripts/authoring_data.gd")
const Codec=preload("res://authoring/codec.gd")
const Main=preload("res://main.tscn")
var checks=[]
var proofs=[]
var failed=false
func _initialize():run.call_deferred()
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 checks.append({"passed":bool(ok),"label":label});failed=failed or not ok
func replay(data,index,tape):
 var c=Core.new(data.constants.duplicate(true),data.playerDefaults)
 c.load_room(Loader.parse(data.world.rooms[index]))
 for part in tape:
  for f in range(int(part[0])):c.step(R.decode(part[1]))
 return c
func run():
 var source=JSON.parse_string(FileAccess.get_file_as_string("res://data/world4.json"));var data=Authoring.read(source)
 var fixture=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/woods-workshop.json"))
 for i in range(8):check(Codec.first_difference(data.world.rooms[i],fixture.existingRooms[i])=="","original movement room preserved: "+fixture.existingRooms[i].name)
 check(data.world.rooms.size()==24,"eight rooms in each of Outskirts, Woods and Causeway")
 check(data.world.retiredWorkshopRoomIds.size()==9,"nine retired layouts are absent from the active workshop")
 var native=load("res://levels/world4.tscn").instantiate()
 check(Codec.first_difference(Authoring.baseline(source),native.compile_into(Authoring.baseline(source)))=="","native scene roundtrip preserves every layout and recording")
 for i in range(8,11):
  var room=data.world.rooms[i]
  check(room.workshopBiome=="woods" and "strike" not in room.lock and "parry" in room.lock and "portal" in room.lock,"Woods mechanics available: "+room.name)
  check(Codec.objects(native.get_node("Rooms").get_child(i)).all(func(o):return o.position.x==round(o.position.x/8)*8 and o.position.y==round(o.position.y/8)*8),"objects retain the 8px grid: "+room.name)
  var p=R.play(data,i,room.workshopRoutes[0].tape);proofs.append({"room":room.id,"proof":p})
  check(p.finish and p.deaths==0 and not p.advanced,"deathless ordinary solution: "+room.name)
  if i>8:
   check(not room.get("workshopRequireStakes",false) and not room.get("workshopRequireShard",false),"finish depends on physical access, without collectible quotas: "+room.name)
   for mode in ["no_pods","no_bells"]:check(not R.play(data,i,room.workshopRoutes[0].tape,mode).finish,"recorded plan depends on "+mode+": "+room.name)
 native.free()
 var orchard=data.world.rooms[9].workshopRoutes[0].tape
 var catch_state=replay(data,9,orchard.slice(0,10))
 check(catch_state.phase==0 and catch_state.p.onGround and catch_state.p.y==149,"Orchard pod flight preserves the amber landing")
 for direction in ["l","r","u","d","lu","ru","ld","rd"]:
  var wrong=orchard.slice(0,8)+[[12,direction+"x"],[100,"rgu"]]
  var p=R.play(data,9,wrong)
  check(not p.landings.any(func(e):return e[2]==149),"rebound dash removes the amber catch: "+direction)
 var prepared=replay(data,9,orchard.slice(0,15))
 check(prepared.phase==1 and prepared.p.dashes==1 and prepared.p.y<90,"upper bell prepares the phase without spending the exit dash")
 var unprepared=orchard.duplicate(true);unprepared[14]=[5,""]
 check(not R.play(data,9,unprepared).finish,"skipping upper preparation removes the exit landing when dashing")
 var crown=data.world.rooms[10].workshopRoutes[0].tape
 var crossing=replay(data,10,crown.slice(0,8))
 check(crossing.phase==1 and crossing.p.x>224 and crossing.p.dashes==1,"pod carries the knight beyond earlier roots without changing phase")
 var early=crown.slice(0,7)+[[16,"rj"],[12,"rux"],[100,"rgu"]]
 var blocked=replay(data,10,early)
 check(blocked.deaths>0 or blocked.p.x<256,"restoring roots early blocks the lower crossing")
 var restored=replay(data,10,crown.slice(0,11))
 check(restored.phase==0 and restored.p.onGround and restored.p.x>=304,"restoring after crossing provides a safe far-bank arrival")
 var atop=replay(data,10,crown.slice(0,15))
 check(atop.phase==0 and atop.p.onGround and atop.p.y==125,"restored roots provide the return climb to the crown")
 check(not data.world.rooms[10].map.any(func(row):return "~" in row),"Crown commitment uses phase geometry without a crumble timer")
 var bypasses=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/woods-consolidation-bypasses.json"))
 for b in bypasses:
  var before=data.duplicate(true);before.world.rooms[int(b.index)]=b.room;before.world.rooms[int(b.index)].workshopGoal=b.goal
  check(R.play(before,int(b.index),b.tape,"no_pods").finish,"positive control reproduces discovered pod skip: "+b.room.name)
  var after=data.duplicate(true);after.world.rooms[int(b.index)].workshopGoal=b.goal
  check(not R.play(after,int(b.index),b.tape,"no_pods").finish,"current geometry rejects that pod skip: "+b.room.name)
 for config in [[9,7],[9,14],[10,7],[10,15]]:
  var window=R.timing_window(data,config[0],config[1],6)
  check(window.size()>=5,"multiple arrival timings: "+data.world.rooms[config[0]].name+" "+str(window))
 var app=Main.instantiate();app.test_mode=true;app.initial_world=4;root.add_child(app);await process_frame;app.set_physics_process(false)
 for i in range(8,11):
  app.load_section(i);app.toggle_watch()
  for f in range(app.tape.size()):app._physics_process(1.0/60.0)
  check(app.workshop_goal_reached() and app.sim.deaths==0,"actual application solution playback: "+data.world.rooms[i].name)
  app.toggle_watch();app.retry_room()
  check(app.sim.phase==0 and app.sim.p.dashes==1,"retry resets phase and movement: "+data.world.rooms[i].name)
 app.load_section(8);check(app.landscape.forest,"consolidated rooms retain forest presentation")
 app.load_section(0);check(not app.landscape.forest,"original movement presentation restored")
 app.queue_free();await process_frame
 var args=OS.get_cmdline_user_args()
 if not args.is_empty():FileAccess.open(args[0],FileAccess.WRITE).store_string(JSON.stringify({"checks":checks,"proofs":proofs},"  "))
 print("WOODS WORKSHOP ","FAILED" if failed else "PASSED"," · ",checks.size()," checks");quit(1 if failed else 0)
