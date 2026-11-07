extends SceneTree
## The tempting dash closes the door; the visible lower path and repair loop work.
const Core=preload("res://scripts/core.gd")
const L=preload("res://scripts/room_loader.gd")
const R=preload("res://tests/workshop_routes.gd")
const C=preload("res://authoring/codec.gd")
var failed=false
func check(ok,label):
 print("PASS " if ok else "FAIL ",label);failed=failed or not ok
func play(d,tape,permanent=false):
 var room=d.world.rooms[41].duplicate(true);room.workshopGoal=room.puzzleGoal
 if permanent:
  for y in range(room.map.size()):room.map[y]=room.map[y].replace("B","#")
 var c=Core.new(d.constants.duplicate(true),d.playerDefaults);c.load_room(L.parse(room))
 var q={"finish":false,"deaths":0,"placed":false,"blocked":false,"crossed":false,"fell":false,"lower":false,"early_dash":false,"waves":0,"pickups":0,"replaced":false,"air_throw":false}
 for part in tape:
  for tick in range(int(part[0])):
   c.step(R.decode(part[1]))
   var lamp=c.ents.filter(func(e):return e.type=="lantern")[0]
   var plate=c.ents.filter(func(e):return e.type=="plate")[0]
   var door=c.ents.filter(func(e):return e.type=="held")[0]
   q.placed=q.placed or plate.down and not lamp.held and not door.solid
   q.air_throw=q.air_throw or "throw" in c.events and not c.p.onGround
   q.fell=q.fell or q.placed and lamp.y>plate.y+10 and not lamp.held
   q.blocked=q.blocked or q.placed and lamp.y>plate.y+2 and door.solid and c.p.x==224 and c.p.y<344 and c.p.y+11>312
   q.crossed=q.crossed or c.p.x>=248 and c.p.y>312
   q.lower=q.lower or q.placed and c.p.x>168 and c.p.x<224 and c.p.onGround and c.p.y==341
   q.early_dash=q.early_dash or q.placed and c.p.x<248 and "dash-start" in c.events
   if "super" in c.events:q.waves+=1
   if "pickup" in c.events:q.pickups+=1
   q.replaced=q.replaced or q.fell and plate.down and not lamp.held and not door.solid
   q.finish=q.finish or R.at_goal(c)
   if c.deaths>0:break
 q.deaths=c.deaths
 return q
func _initialize():
 var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/world22.json"))
 var before=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/lantern-bait-preservation.json"))
 var room=d.world.rooms[41];var tape=room.puzzleRoutes[0].tape;var old=before.old_lantern
 for current in d.world.rooms:
  if current.id==room.id:continue
  var normalized=current.duplicate(true)
  if normalized.has("atlasMain"):
   for link in [normalized.atlasMain,normalized.atlasSockets[0]]:link.erase("to");link.erase("toFloor")
  check(C.fingerprint(normalized)==before.rooms[current.id] and C.fingerprint(d.world.tapes.get(current.id,[]))==before.tapes[current.id],"other room and reference preserved: "+current.id)
 var metadata=d.world.duplicate(true)
 for key in ["rooms","tapes","sections","requiredMainRooms"]:metadata.erase(key)
 check(C.fingerprint(metadata)==before.metadata and d.world.sections==before.sections and d.world.requiredMainRooms==before.required,"chapter metadata, placement and checkpoints preserved")
 check(C.fingerprint(d.constants)==before.constants and C.fingerprint(d.playerDefaults)==before.defaults,"shared movement preserved")
 check(range(room.map.size()).all(func(y):return room.map[y].substr(29)==old.map[y].substr(29)) and room.puzzleGoal==old.puzzleGoal,"door and complete final geometry preserved")
 check(tape.slice(tape.size()-6)==old.puzzleRoutes[0].tape.slice(old.puzzleRoutes[0].tape.size()-6),"exact final six inputs preserved")
 var original=before.throw_setup
 check(tape.slice(0,23)==original,"approved throw, retrieval, carrying jumps and set-down inputs restored")
 check(room.map[41].substr(14,14)==".............." and room.map[43].substr(21,7)=="......." and room.map[44].substr(23,3)=="###" and room.map[45].substr(21,7)==".......","real pit before the door with an isolated lower ledge, no continuous floor")
 var safe=play(d,tape)
 check(safe.air_throw and safe.pickups==2 and safe.finish and safe.deaths==0 and safe.placed and safe.lower and safe.crossed and not safe.early_dash and safe.waves==1,"lower path clears without disturbing the plate before the door")
 var bait=tape.slice(0,25)+[[20,"r"],[12,"rx"],[30,"r"],[20,""]]
 var bad=play(d,bait);print("BAIT OBSERVATION ",JSON.stringify(bad))
 check(bad.fell and bad.blocked and not bad.crossed and bad.deaths==0,"tempting dash drops the lantern and physically hits the closed door")
 var control=play(d,bait,true)
 check(control.crossed and not control.fell,"positive control: permanent lantern support lets that dash pass the door")
 var recovery=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/lantern-bait-recovery.json"))
 var repaired=play(d,recovery)
 check(repaired.blocked and repaired.pickups==3 and repaired.replaced and repaired.finish and repaired.deaths==0,"failed dash, retrieve, re-place and finish without death, retry or state reset")
 for segment in [25,27,29]:
  var wins=[]
  for delta in range(-3,4):
   var adjusted=tape.duplicate(true);adjusted[segment][0]+=delta
   var result=play(d,adjusted)
   if result.finish and result.deaths==0 and result.lower and not result.early_dash:wins.append(delta)
  check(wins.size()>=3,"nearby lower-path timings "+str(segment)+": "+str(wins))
 print("LANTERN BAIT ","FAILED" if failed else "PASSED")
 quit(1 if failed else 0)
