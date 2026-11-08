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
 if mode=="no_receiver":room.resinWind.branches.remove_at(1)
 if mode=="no_runway":room.resinWind.branches.remove_at(2)
 var c=Core.new(d.constants.duplicate(true),d.playerDefaults);c.load_room(L.parse(room))
 if mode=="no_seed":c.ents=c.ents.filter(func(e):return e.type!="pod")
 if mode in ["no_low_seed","no_high_seed"]:c.ents=c.ents.filter(func(e):return not (e.type=="pod" and e.x==(104 if mode=="no_low_seed" else 232)))
 var dash_trace={}
 var q={"wavedash":false,"low":0,"high":0,"pocket":false,"runway":false,"finish":false,"deaths":0,"turn":false,"jam_knight":false,"waves":0,"pods":0,"root":false,"blade":false,"armed_pod":false,"through_open_lid":false,"receiver":false}
 for part in tape:
  for tick in range(int(part[0])):
   var raw=R.decode(part[1])
   if mode=="no_turn":raw.strike=false
   if mode=="no_blade":raw.u=false
   if mode=="phase_one" and c.resin_wind!=null:c.resin_wind.t=min(c.resin_wind.t,298)
   c.step(raw)
   q.finish=q.finish or R.at_goal(c)
   q.turn=q.turn or "hinge-turn" in c.events
   q.jam_knight=q.jam_knight or c.ents.any(func(e):return e.type=="hingeArm" and e.get("jamReason","")=="knight")
   q.root=q.root or "oath-roots" in c.events
   q.blade=q.blade or "oath-taken" in c.events
   dash_trace=S.observe_dash(c,dash_trace)
   if "super" in c.events:
    q.waves+=1;q.wavedash=q.wavedash or dash_trace.get("air",false) and dash_trace.get("down",false)
   if "pogo-low" in c.events:q.low+=1
   if "pogo-loft" in c.events:q.high+=1
   if "pod" in c.events:
    q.pods+=1;q.armed_pod=q.armed_pod or c.oath_root!=null and c.oath_root.taken
   if index==45:
    q.pocket=q.pocket or c.p.onGround and c.p.y+11==280 and c.p.x>=256
    q.runway=q.runway or c.ents.any(func(e):return e.type=="resinBranch" and e.phase==0 and e.x==296 and e.solid and c.standing(e))
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
   check(q.root and q.blade and q.pods==2 and q.armed_pod and q.low==1 and q.high==1,"short blade setup followed by distinct low and high rebounds")
   for mode in ["no_blade","no_low_seed","no_high_seed"]:
    check(not play(d,i,t,mode).finish,"each seed and blade contributes physically: "+mode)
   var high=t.duplicate(true);high[7][1]="rdsj";high[8][1]="rj"
   check(play(d,i,high).deaths>0,"holding jump at the first seed hits the thorn canopy")
   var low=t.duplicate(true);low[13][1]="rds";low[14][1]="r"
   check(not play(d,i,low).finish,"low rebound at the second seed cannot reach the upper flag")
  if i==45:
   check(q.pods==1 and q.through_open_lid and q.receiver and q.pocket and q.runway and q.waves==1 and q.wavedash,"opening, temporary perch, lower pocket, opposite-phase runway and powered finish")
   for mode in ["lid_solid","no_receiver","no_seed","no_runway","phase_one"]:
    check(not play(d,i,t,mode).finish,"each physical stage contributes: "+mode)
   var wait=t.duplicate(true);wait[9][1]=""
   check(not play(d,i,wait).finish,"waiting on the first receiving perch cannot clear the room")
   var early=t.duplicate(true);early[10][0]=1
   check(not play(d,i,early).finish,"leaving the lower pocket before the next phase fails")
  for segment in {43:[0,6,10],44:[6,8,14],45:[2,9,12,16]}[i]:
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
 var shortcuts=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/woods-revision-bypasses.json"))
 for old in shortcuts:
  check(play(d,int(old.i),old.tape,"",old.room).finish and not play(d,int(old.i),old.tape,old.mode).finish,"reproduced seed/runway shortcut rejected: "+old.label)
 # Oath acquisition must survive test-search snapshots exactly, like both clocks.
 for i in [44,45]:
  var c=Core.new(d.constants.duplicate(true),d.playerDefaults);c.load_room(L.parse(d.world.rooms[i]))
  var t=d.world.rooms[i].puzzleRoutes[0].tape
  var prefix=t.slice(0,4) if i==44 else t.slice(0,2)
  for part in prefix:
   for tick in range(part[0]):c.step(R.decode(part[1]))
  var state=S.snapshot(c)
  for tick in range(50):c.step(R.decode("u" if i==44 else ""))
  var expected=S.snapshot(c);S.restore(c,state)
  for tick in range(50):c.step(R.decode("u" if i==44 else ""))
  check(S.snapshot(c)==expected,"exact oath/resin snapshot replay: "+str(i))
 print("WOODS NINE ","FAILED" if failed else "PASSED")
 quit(1 if failed else 0)
