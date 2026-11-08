extends SceneTree
## Physical clearance at the reported seed approach, and the harder Wall preparation.
const Core=preload("res://scripts/core.gd")
const L=preload("res://scripts/room_loader.gd")
const R=preload("res://tests/workshop_routes.gd")
var failed=false
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 failed=failed or not ok
func core(data,room):
 room=room.duplicate(true);room.workshopGoal=room.puzzleGoal
 var c=Core.new(data.constants.duplicate(true),data.playerDefaults);c.load_room(L.parse(room));return c
func play(c,tape):
 var low=false;var finish=false
 for part in tape:
  for tick in range(int(part[0])):
   c.step(R.decode(part[1]));low=low or "pogo-low" in c.events;finish=finish or R.at_goal(c)
   if c.deaths>0:return {"low":false,"finish":false}
 return {"low":low,"finish":finish}
func approach_samples(data,room):
 var survivors=0;var rebounds=0
 for slide in range(1,9):
  for fall in range(5,17):
   var c=core(data,room)
   var tape=room.puzzleRoutes[0].tape.slice(0,13).duplicate(true)
   tape[9][0]=slide;tape[10][0]=fall
   var q=play(c,tape)
   if c.deaths==0:survivors+=1
   if q.low:rebounds+=1
 return [survivors,rebounds]
func _initialize():
 var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/world22.json"))
 var before=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/woods-037-before.json"))
 var old=approach_samples(d,before["37"])
 var current=approach_samples(d,d.world.rooms[37])
 check(current[0]==96 and current[1]>old[1],"seed approach survives all 96 samples; successful low rebounds %d -> %d"%[old[1],current[1]])
 check(old[0]<current[0],"positive control: previous thorn-lined approach kills some of the same attempts")
 var room=d.world.rooms[39];var tape=room.puzzleRoutes[0].tape
 var c=core(d,room)
 play(c,tape.slice(0,4))
 check(c.deaths==0 and c.phase==1 and c.p.dashes==0 and not c.p.onGround,"Wall crossing spends the dash and leaves the Amber bank absent")
 play(c,tape.slice(4,5))
 check("bell" in c.events and c.phase==0 and c.p.dashes==0,"airborne bell restores the bank while the dash is unavailable")
 play(c,tape.slice(5,6))
 check(c.deaths==0 and c.p.onGround and c.p.dashes==1,"restored bank supplies a real landing and dash recovery")
 var earlier=before["39"]
 var substitute=earlier.puzzleRoutes[0].tape.duplicate(true);substitute[5]=[12,"lx"]
 var old_core=core(d,earlier);old_core.ents=old_core.ents.filter(func(e):return e.type!="bell")
 check(play(old_core,substitute).finish,"positive control: a ground dash replaces the old Wall bell and clears without bells")
 c=core(d,room);c.ents=c.ents.filter(func(e):return e.type!="bell")
 check(not play(c,tape).finish,"the current crossing cannot idle on the absent bank without its bell")
 c=core(d,room)
 check(not play(c,earlier.puzzleRoutes[0].tape).finish,"the prior short climb and transfer no longer clear the raised return")
 var shortcut=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/woods-spawn-climb.json"))
 for guarded in [false,true]:
  var candidate=(room if guarded else shortcut.room).duplicate(true)
  candidate.puzzleGoal=shortcut.goal;candidate.workshopRequireAllShards=false
  var actor=core(d,candidate);actor.ents=actor.ents.filter(func(e):return e.type!="pod")
  var reached=play(actor,shortcut.tape).finish
  check(reached!=guarded,"spawn-side climb reaches the return without a seed before the guard, fails after: "+str(guarded))
 print("FRACTURED WOODS CLEARANCE ","FAILED" if failed else "PASSED")
 quit(1 if failed else 0)
