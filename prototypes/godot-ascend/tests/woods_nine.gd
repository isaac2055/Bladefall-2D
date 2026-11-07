extends SceneTree
## Three new physical dependencies, forgiving inputs and regression witnesses.
const Core=preload("res://scripts/core.gd")
const L=preload("res://scripts/room_loader.gd")
const R=preload("res://tests/workshop_routes.gd")
const S=preload("res://tests/woods_search.gd")
var failed=false
func check(ok,label):
 print("PASS " if ok else "FAIL ",label);failed=failed or not ok
func play(d,index,tape,mode="",replacement=null):
 var room=d.world.rooms[index].duplicate(true) if replacement==null else replacement.duplicate(true)
 room.workshopGoal=room.puzzleGoal
 if mode=="lid_solid":room.resinWind.branches[0].phase=2
 if mode=="no_receiver":room.resinWind.branches=room.resinWind.branches.slice(0,1)
 var c=Core.new(d.constants.duplicate(true),d.playerDefaults);c.load_room(L.parse(room))
 if mode=="no_seed":c.ents=c.ents.filter(func(e):return e.type!="pod")
 var q={"finish":false,"deaths":0,"turn":false,"jam_knight":false,"waves":0,"pods":0,"root":false,"blade":false,"armed_pod":false,"through_open_lid":false,"receiver":false}
 for part in tape:
  for tick in range(int(part[0])):
   var raw=R.decode(part[1])
   if mode=="no_turn":raw.strike=false
   if mode=="no_blade":raw.u=false
   c.step(raw)
   q.finish=q.finish or R.at_goal(c)
   q.turn=q.turn or "hinge-turn" in c.events
   q.jam_knight=q.jam_knight or c.ents.any(func(e):return e.type=="hingeArm" and e.get("jamReason","")=="knight")
   q.root=q.root or "oath-roots" in c.events
   q.blade=q.blade or "oath-taken" in c.events
   if "super" in c.events:q.waves+=1
   if "pod" in c.events:
    q.pods+=1;q.armed_pod=q.armed_pod or c.oath_root!=null and c.oath_root.taken
   if index==45:
    var lid=c.ents.filter(func(e):return e.type=="resinBranch" and (e.phase==0 or e.phase==2))[0]
    q.through_open_lid=q.through_open_lid or q.pods>0 and c.p.y+c.p.h<=lid.y and c.p.x>=lid.x and c.p.x+c.p.w<=lid.x+lid.w and not lid.solid
    q.receiver=q.receiver or c.ents.any(func(e):return e.type=="resinBranch" and e.phase==1 and e.solid and c.standing(e))
   if c.deaths>0:q.deaths=c.deaths;return q
 return q
func _initialize():
 var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/world22.json"))
 for i in [43,44,45]:
  var t=d.world.rooms[i].puzzleRoutes[0].tape
  var q=play(d,i,t)
  check(q.finish and q.deaths==0,"deathless preferred route: "+d.world.rooms[i].name)
  if i==43:
   check(q.turn and q.waves==1,"turn the branch and use its powered launch")
   check(not play(d,i,t,"no_turn").finish,"upright branch cannot supply the demonstrated runway")
   var jam=[[88,"r"],[20,""],[40,"j"],[1,"ls"],[20,""]]
   var blocked=play(d,i,jam)
   check(blocked.jam_knight and not blocked.turn and blocked.deaths==0,"standing in the destination safely jams the branch against the knight")
   var fixed=play(d,i,jam+[[1,"dj"],[30,""],[1,"us"],[20,""]])
   check(fixed.turn and fixed.deaths==0,"drop beside the pivot to clear the same obstruction")
  if i==44:
   check(q.root and q.blade and q.pods==1 and q.armed_pod,"release the oathblade, retrieve it, and use it on the return seed")
   check(not play(d,i,t,"no_blade").finish,"leaving the blade bound prevents the demonstrated seed route")
   check(not play(d,i,t,"no_seed").finish,"the acquired blade still needs the seed for the high return")
  if i==45:
   check(q.pods==1 and q.through_open_lid and q.receiver,"high rebound crosses the absent lid and lands on the solid receiving branch")
   check(not play(d,i,t,"lid_solid").finish,"a lid that stays solid blocks the same high rebound")
   check(not play(d,i,t,"no_receiver").finish and not play(d,i,t,"no_seed").finish,"receiving branch and seed each contribute physically")
   var early=t.duplicate(true);early[2][0]=1
   check(not play(d,i,early).finish,"taking the same route before the opening fails")
  for segment in {43:[0,6,10],44:[1,16,18],45:[2,3,5]}[i]:
   var wins=[]
   for delta in range(-4,5):
    var adjusted=t.duplicate(true);adjusted[segment][0]+=delta
    var result=play(d,i,adjusted)
    if result.finish and result.deaths==0:wins.append(delta)
   check(wins.size()>=3,"nearby complete timings "+str([i,segment])+": "+str(wins))
 var bypasses=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/woods-nine-bypasses.json"))
 for k in range(bypasses.size()):
  var old=bypasses[k]
  check(play(d,43,old.tape,"",old.room).finish and not play(d,43,old.tape).finish,"reproduced former hinge shortcut rejected: "+str(k))
 # Oath acquisition must survive test-search snapshots exactly, like both clocks.
 for i in [44,45]:
  var c=Core.new(d.constants.duplicate(true),d.playerDefaults);c.load_room(L.parse(d.world.rooms[i]))
  var t=d.world.rooms[i].puzzleRoutes[0].tape
  var prefix=t.slice(0,13) if i==44 else t.slice(0,2)
  for part in prefix:
   for tick in range(part[0]):c.step(R.decode(part[1]))
  var state=S.snapshot(c)
  for tick in range(50):c.step(R.decode("u" if i==44 else ""))
  var expected=S.snapshot(c);S.restore(c,state)
  for tick in range(50):c.step(R.decode("u" if i==44 else ""))
  check(S.snapshot(c)==expected,"exact oath/resin snapshot replay: "+str(i))
 print("WOODS NINE ","FAILED" if failed else "PASSED")
 quit(1 if failed else 0)
