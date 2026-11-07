extends SceneTree
## Witnesses, physical dependencies, nearby timings, and exact timed-device replay.
const Core=preload("res://scripts/core.gd")
const L=preload("res://scripts/room_loader.gd")
const R=preload("res://tests/workshop_routes.gd")
const S=preload("res://tests/woods_search.gd")
var failed=false
func check(ok,label):
 print("PASS " if ok else "FAIL ",label);failed=failed or not ok
func play(d,index,tape,mode=""):
 var room=d.world.rooms[index].duplicate(true);room.workshopGoal=room.puzzleGoal
 var c=Core.new(d.constants.duplicate(true),d.playerDefaults);c.load_room(L.parse(room))
 if mode=="no_lantern":c.ents=c.ents.filter(func(e):return e.type!="lantern")
 if mode=="no_pod":c.ents=c.ents.filter(func(e):return e.type!="pod")
 if mode=="no_crown":c.root_lash.crown=null
 if mode=="no_second_resin":c.ents=c.ents.filter(func(e):return e.type!="resinBranch" or e.phase!=1)
 var q={"finish":false,"deaths":0,"waves":0,"pods":0,"cut":false,"placed":false,"door":false,"release":false,"anticipated":false,"departed":false,"early_dash":false}
 var on_first=false;var ever_first=false
 for part in tape:
  for tick in range(part[0]):
   c.step(R.decode(part[1]))
   q.finish=q.finish or R.at_goal(c)
   if "super" in c.events:q.waves+=1
   if "pod" in c.events:q.pods+=1
   q.cut=q.cut or "root-cut" in c.events
   if c.resin_wind!=null:
    var first=c.ents.filter(func(e):return e.type=="resinBranch" and e.phase==0)[0]
    var second=c.ents.filter(func(e):return e.type=="resinBranch" and e.phase==1)
    var standing=c.standing(first) and first.solid
    if on_first and not standing and not q.departed:
     q.departed=true;q.anticipated=not second.is_empty() and not second[0].solid
    on_first=standing;ever_first=ever_first or standing
   var lamp=c.ents.filter(func(e):return e.type=="lantern")
   var door=c.ents.filter(func(e):return e.type=="held")
   q.placed=q.placed or c.ents.any(func(e):return e.type=="plate" and e.down) and not lamp.is_empty() and c.p.carrying==null
   q.door=q.door or not door.is_empty() and not door[0].solid and c.p.x>=248 and c.p.y>312
   if "dash-start" in c.events and c.p.x<248 and q.placed:q.early_dash=true
   q.release=q.release or q.door and not lamp.is_empty() and lamp[0].y>272
   if c.deaths>0:q.deaths=c.deaths;return q
 q.first=ever_first
 return q
func _initialize():
 var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/world22.json"))
 for index in [40,41,42]:
  var tape=d.world.rooms[index].puzzleRoutes[0].tape
  var q=play(d,index,tape)
  check(q.finish and q.deaths==0 and q.waves==1,"deathless wavedash reference: "+d.world.rooms[index].name)
  if index==40:
   check(q.first and q.anticipated,"depart the first resin before the second hardens")
   check(not play(d,index,tape,"no_second_resin").finish,"the resin landing physically supplies the recovery")
  if index==41:
   check(q.placed and q.door and q.release and not q.early_dash,"place cargo, cross the open door without dashing, then remove its support")
   check(not play(d,index,tape,"no_lantern").finish,"the unloaded door blocks the demonstrated route")
  if index==42:
   check(q.pods==1 and q.cut,"pod ascent reaches the crown before the return")
   check(not play(d,index,tape,"no_crown").finish,"live return lashes reject the same route without the crown cut")
   check(not play(d,index,tape,"no_pod").finish,"the demonstrated ascent needs the seed")
  for segment in {40:[2,5,6],41:[14,15,16],42:[3,11,12]}[index]:
   var wins=[]
   for delta in range(-4,5):
    var t=tape.duplicate(true);t[segment][0]+=delta
    var result=play(d,index,t)
    if result.finish and result.deaths==0 and result.waves==1:wins.append(delta)
   check(wins.size()>=3,"nearby successful timings "+str([index,segment])+": "+str(wins))
 var shortcut=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/woods-next-walk-bypass.json"))
 var former=d.duplicate(true);former.world.rooms[42]=shortcut.room
 check(play(former,42,shortcut.tape).finish and not play(d,42,shortcut.tape).finish,"walking shortcut clears its former layout and fails the shortened runway")
 var ordinary=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/woods-next-ordinary-bypasses.json"))
 for k in range(3):
  var f=ordinary.cases[k];var previous=d.duplicate(true);previous.world.rooms[40+k]=f.room
  check(play(previous,40+k,f.tape).finish and not play(d,40+k,f.tape).finish,"ordinary shortcut succeeds before and fails after: "+str(40+k))
 var faces=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/woods-next-wall-jumps.json"))
 for f in faces.cases:
  var earlier=d.duplicate(true);earlier.world.rooms[int(f.index)]=f.room
  check(play(earlier,int(f.index),f.tape).finish and not play(d,int(f.index),f.tape).finish,"canopy wall-jump shortcut succeeds before and fails after: "+str(f.index))
 # Search snapshots must restore both independent device clocks, including crown state.
 for index in [40,42]:
  var c=Core.new(d.constants.duplicate(true),d.playerDefaults);c.load_room(L.parse(d.world.rooms[index]))
  for i in range(35):c.step({})
  var state=S.snapshot(c)
  for i in range(96):c.step({"r":true})
  var expected=S.snapshot(c)
  S.restore(c,state)
  for i in range(96):c.step({"r":true})
  check(S.snapshot(c)==expected,"exact timed-device snapshot/replay: "+str(index))
 print("FRACTURED WOODS NEXT ","FAILED" if failed else "PASSED")
 quit(1 if failed else 0)
