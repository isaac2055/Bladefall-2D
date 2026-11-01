extends SceneTree
## Ordinary-input references and causal counterfactuals for the nine-room lineup.
const Core=preload("res://scripts/core.gd")
const Loader=preload("res://scripts/room_loader.gd")
const R=preload("res://tests/workshop_routes.gd")
var data
var failed=false
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 failed=failed or not ok
func play(index,tape,mode="",override=null):
 var c=Core.new(data.constants.duplicate(true),data.playerDefaults)
 c.load_room(Loader.parse(data.world.rooms[index] if override==null else override))
 if mode=="no_hooks":c.ents=c.ents.filter(func(e):return e.type not in ["hookCarrier","ring"])
 if mode=="no_lantern":c.ents=c.ents.filter(func(e):return e.type!="lantern")
 if mode=="permanent":
  for e in c.ents:
   if e.type=="crumble":e.type="slide"
 var result={"core":c,"finish":false,"wave":false,"rope":false,"stone":false,"return_landing":false}
 var segment=0
 for part in tape:
  if mode=="remove_stone" and segment==12:c.ents=c.ents.filter(func(e):return e.type!="slide")
  for tick in range(int(part[0])):
   if mode=="fixed_stone":
    for e in c.ents:
     if e.type=="slide":e.x=e.ox;e.y=e.oy;e.remX=0;e.remY=0;e.moving=false
   c.step(R.decode(part[1]))
   result.finish=result.finish or R.at_goal(c)
   result.wave=result.wave or "super" in c.events
   result.rope=result.rope or c.p.get("hook")!=null
   result.stone=result.stone or c.ents.any(func(e):return e.type=="slide" and (e.x!=e.ox or e.y!=e.oy))
   result.return_landing=result.return_landing or c.ents.any(func(e):return e.type=="zip" and e.state=="back" and c.standing(e))
   if c.deaths>0:return result
  segment+=1
 return result
func _initialize():
 data=JSON.parse_string(FileAccess.get_file_as_string("res://data/world21.json"))
 for room in data.world.rooms:
  if room.has("puzzleGoal"):room.workshopGoal=room.puzzleGoal
 check(data.world.requiredMainRooms.size()==23,"23 required challenges include nine appended studies")
 for index in [42,44,45,46]:
  var tape=data.world.rooms[index].puzzleRoutes[0].tape
  var q=play(index,tape)
  check(q.finish and q.core.deaths==0 and q.wave,"deathless wavedash reference: "+data.world.rooms[index].name)
  if index==42:check(q.rope and q.stone,"Catch combines rope access, stone preparation and the final wave")
  if index==46:check(q.return_landing,"Bridge lands on the returning carriage")
  var mode={42:"no_hooks",44:"no_lantern",45:"fixed_stone",46:"permanent"}[index]
  check(not play(index,tape,mode).finish,"reference depends on preparation: "+mode)
  var segment={42:20,44:19,45:6,46:15}[index]
  var clears=[]
  for delta in range(-3,4):
   var varied=tape.duplicate(true);varied[segment][0]+=delta
   var sample=play(index,varied)
   if sample.finish and sample.core.deaths==0:clears.append(delta)
  check(clears.size()>=3,"nearby setup timings "+str(index)+": "+str(clears))
 var witnesses=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/fractured-nine-witnesses.json"))
 var recovery=play(45,witnesses.stoneRecovery)
 check(recovery.finish and recovery.core.deaths==0,"wrong lower dock can be restored and followed by a complete clear")
 var door=data.world.rooms[44].duplicate(true)
 door.workshopGoal=[208,160,48,4]
 var before=door.duplicate(true)
 for x in range(10,24):
  var row=before.map[23];row[x]=".";before.map[23]=row
 for y in [24,25]:
  var row=before.map[y];row[24]="#";before.map[y]=row
 check(play(44,witnesses.doorBypass,"",before).finish and not play(44,witnesses.doorBypass,"",door).finish,"witnessed starting-roof shortcut succeeds before the guard and fails afterward")
 var guarded_stone=data.world.rooms[45].duplicate(true)
 guarded_stone.workshopGoal=[360,176,32,4]
 var stone=guarded_stone.duplicate(true)
 for y in range(29,34):
  for x in [39,42]:
   var row=stone.map[y];row[x]=".";stone.map[y]=row
 check(play(45,witnesses.stoneBypass,"remove_stone",stone).finish and not play(45,witnesses.stoneBypass,"remove_stone",guarded_stone).finish,"witnessed fixed-stop wall jump succeeds before side guards and fails afterward")
 print("FRACTURED NINE PHYSICS ","FAILED" if failed else "PASSED")
 quit(1 if failed else 0)
