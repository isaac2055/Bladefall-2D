extends SceneTree
## Cargo transfer, real carrying restrictions, preserved finish and nearby input witnesses.
const Core=preload("res://scripts/core.gd")
const L=preload("res://scripts/room_loader.gd")
const R=preload("res://tests/workshop_routes.gd")
const C=preload("res://authoring/codec.gd")
var failed=false
func check(ok,label):
 print("PASS " if ok else "FAIL ",label);failed=failed or not ok
func play(d,tape,mode="",room_override=null):
 var room=d.world.rooms[41].duplicate(true) if room_override==null else room_override.duplicate(true)
 room.workshopGoal=room.puzzleGoal
 var c=Core.new(d.constants.duplicate(true),d.playerDefaults);c.load_room(L.parse(room))
 var q={"finish":false,"deaths":0,"throw":false,"air_throw":false,"crossed_empty":false,"retrieved":false,"carry_jumps":0,"placed":false,"wave":false,"pickup_count":0}
 for part in tape:
  for tick in range(part[0]):
   var raw=R.decode(part[1]);var was_carry=c.p.carrying!=null;var grounded=c.p.onGround
   if mode=="no_throw" and was_carry:raw.grab=false
   c.step(raw)
   q.finish=q.finish or R.at_goal(c)
   if "throw" in c.events:
    q.throw=true;q.air_throw=q.air_throw or not grounded
   if "dash-start" in c.events and c.p.x<168:q.crossed_empty=c.p.carrying==null
   if "pickup" in c.events:
    q.pickup_count+=1
    q.retrieved=q.retrieved or c.p.x>=160 and c.p.y<=245 and q.throw
   if "jump" in c.events and was_carry and c.p.x>=160:q.carry_jumps+=1
   q.wave=q.wave or "super" in c.events
   q.placed=q.placed or c.ents.any(func(e):return e.type=="plate" and e.down and c.p.carrying==null)
   if c.deaths>0:q.deaths=c.deaths;return q
 return q
func carrier_cross(d,shortened=false):
 var room=d.world.rooms[41].duplicate(true)
 if shortened:
  var row=room.map[32]
  for x in range(17,21):row[x]="#"
  room.map[32]=row
 var wins=[];var attempts=0
 # These are normal-input starts: pick up, walk to the bank, then vary the takeoff
 # and jump release. No player placement, physics changes, dash or throw assists.
 for approach in range(12,25):
  for held in [4,8,12,16,20,24,28,32,40]:
   var c=Core.new(d.constants.duplicate(true),d.playerDefaults);c.load_room(L.parse(room))
   for part in [[9,"r"],[1,"g"],[1,""],[approach,"r"]]:
    for tick in range(part[0]):c.step(R.decode(part[1]))
   if not c.p.onGround or c.p.carrying==null:continue
   attempts+=1
   var reached=false
   for tick in range(110):
    c.step(R.decode("rj" if tick<held else "r"))
    reached=reached or c.p.carrying!=null and c.p.onGround and c.p.x>=128 and c.p.y+11==256
   if reached:wins.append([approach,held])
 return {"attempts":attempts,"wins":wins}
func _initialize():
 var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/world22.json"))
 var before=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/lantern-transfer-preservation.json"))
 var room=d.world.rooms[41];var old=before.old_lantern;var tape=room.puzzleRoutes[0].tape
 for current in d.world.rooms:
  if current.id==room.id:continue
  var normalized=current.duplicate(true)
  if normalized.has("atlasMain"):
   for link in [normalized.atlasMain,normalized.atlasSockets[0]]:link.erase("to");link.erase("toFloor")
  check(C.fingerprint(normalized)==before.rooms[current.id] and C.fingerprint(d.world.tapes.get(current.id,[]))==before.tapes[current.id],"other room and reference preserved: "+current.id)
 check(d.world.sections==before.sections and d.world.requiredMainRooms==before.required,"all chapter positions, checkpoints and requirements preserved")
 check(C.fingerprint(d.constants)==before.constants and C.fingerprint(d.playerDefaults)==before.defaults,"shared movement unchanged")
 check(range(room.map.size()).all(func(y):return room.map[y].substr(29)==old.map[y].substr(29)) and room.puzzleGoal==old.puzzleGoal,"entire approved final jump geometry preserved")
 check(tape.slice(tape.size()-6)==old.puzzleRoutes[0].tape.slice(old.puzzleRoutes[0].tape.size()-6),"approved final jump inputs preserved")
 check(not room.map.any(func(row):return "x" in row),"no redundant bell in the new opening")
 var q=play(d,tape)
 check(q.finish and q.deaths==0 and q.wave,"deathless full route with the approved wavedash finish")
 check(q.air_throw and q.crossed_empty and q.retrieved and q.pickup_count==2 and q.carry_jumps==2 and q.placed,"airborne throw, empty crossing, retrieval and two carrying jumps prepare the plate")
 check(not play(d,tape,"no_throw").finish,"keeping the cargo in hand rejects the demonstrated crossing")
 var positive=carrier_cross(d,true);var actual=carrier_cross(d)
 check(not positive.wins.is_empty(),"positive control: a shorter gap can be crossed while carrying")
 check(actual.attempts>=70 and actual.wins.is_empty(),"no carrying-only crossing in "+str(actual.attempts)+" normal-input takeoff/release samples")
 for segment in [3,4,6,14,17]:
  var wins=[]
  for delta in range(-3,4):
   var t=tape.duplicate(true);t[segment][0]+=delta
   var result=play(d,t)
   if result.finish and result.deaths==0 and result.retrieved and result.carry_jumps==2:wins.append(delta)
  check(wins.size()>=3,"nearby complete transfer timings "+str(segment)+": "+str(wins))
 print("LANTERN TRANSFER ","FAILED" if failed else "PASSED")
 quit(1 if failed else 0)
