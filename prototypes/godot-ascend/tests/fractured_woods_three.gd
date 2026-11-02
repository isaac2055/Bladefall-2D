extends SceneTree
## Physical witnesses, causal counterfactuals and nearby timings; no input quotas.
const Core=preload("res://scripts/core.gd")
const L=preload("res://scripts/room_loader.gd")
const R=preload("res://tests/workshop_routes.gd")
var failed=false
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 failed=failed or not ok
func play(d,index,tape,mode="",override=null):
 var room=d.world.rooms[index].duplicate(true) if override==null else override.duplicate(true)
 room.workshopGoal=room.puzzleGoal
 var c=Core.new(d.constants.duplicate(true),d.playerDefaults);c.load_room(L.parse(room))
 if mode=="no_pods":c.ents=c.ents.filter(func(e):return e.type!="pod")
 if mode=="no_bells":c.ents=c.ents.filter(func(e):return e.type!="bell")
 var q={"finish":false,"deaths":0,"waves":0,"pods":0,"bells":0,"loft":false,"low":false,"climbed":false,"climb_stamina":110.0,"advanced":false}
 for part in tape:
  for tick in range(int(part[0])):
   if mode=="permanent":
    for e in c.ents:
     if e.type=="crumble":e.broken=false;e.shaking=0
   c.step(R.decode(part[1]));q.finish=q.finish or R.at_goal(c)
   if "super" in c.events:q.waves+=1
   if "pod" in c.events:q.pods+=1
   if "bell" in c.events:q.bells+=1
   q.loft=q.loft or "pogo-loft" in c.events;q.low=q.low or "pogo-low" in c.events
   q.advanced=q.advanced or ["hyper","super","wallbounce","late-wallbounce","late-reverse"].any(func(e):return e in c.events)
   if c.p.state=="climb":q.climbed=true;q.climb_stamina=min(q.climb_stamina,c.p.stamina)
   if c.deaths>0:q.deaths=c.deaths;return q
 q.phase=c.phase
 return q
func _initialize():
 var a=JSON.parse_string(FileAccess.get_file_as_string("res://data/world21.json"))
 var b=JSON.parse_string(FileAccess.get_file_as_string("res://data/world22.json"))
 var old=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/bridge-before-easing.json"))
 var room=a.world.rooms[46];var route=room.puzzleRoutes[0].tape
 var positive=play(a,46,route)
 check(positive.finish and positive.deaths==0 and positive.waves==1,"revised Bridge has a deathless wavedash finish")
 check(play(a,46,old.puzzleRoutes[0].tape,"",old).finish,"positive control: original Bridge reference still clears its original geometry")
 check(not play(a,46,route,"permanent").finish,"the revised Bridge reference still needs its crumble opening")
 check(room.zips==old.zips and route[18][0]>old.puzzleRoutes[0].tape[18][0] and route.size()<old.puzzleRoutes[0].tape.size(),"longer setup hop and one fewer control segment, with unchanged carriage timing")
 var forgiving=route.duplicate(true);forgiving[18]=[20,"j"];forgiving[19][0]=18
 var recovery=play(a,46,forgiving)
 check(recovery.finish and recovery.deaths==0,"longer hop and later landing retain a finish without a perfect wavedash")
 var clear_hops=[]
 for hop in range(8,17):
  var varied=route.duplicate(true);varied[18][0]=hop
  var q=play(a,46,varied)
  if q.finish and q.deaths==0 and q.waves==1:clear_hops.append(hop)
 check(clear_hops.size()>=3,"several nearby Bridge setup hops preserve the wavedash: "+str(clear_hops))
 for index in [37,38,39]:
  var tape=b.world.rooms[index].puzzleRoutes[0].tape
  var q=play(b,index,tape)
  check(q.finish and q.deaths==0 and not q.advanced,"ordinary-input deathless reference: "+b.world.rooms[index].name)
  check(not play(b,index,tape,"no_pods").finish and not play(b,index,tape,"no_bells").finish,"reference depends on its pod and phase preparation: "+str(index))
  if index==37:check(q.pods==2 and q.bells==1 and q.loft and q.low,"one pod supplies high and low rebounds around the bell change")
  if index==38:check(q.pods==1 and q.bells==2,"shared bell used from both faces before the side rebound")
  if index==39:check(q.climbed and q.climb_stamina>5 and q.pods==1,"restored wall climb reaches the pod with ordinary finite stamina")
  for segment in {37:[2,9],38:[2,20],39:[9,11]}[index]:
   var clears=[]
   for delta in range(-4,5):
    var varied=tape.duplicate(true);varied[segment][0]+=delta
    if varied[segment][0]<1:continue
    var sample=play(b,index,varied)
    if sample.finish and sample.deaths==0:clears.append(delta)
   check(clears.size()>=3,"nearby timings "+str([index,segment])+": "+str(clears))
 var recovery_route=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/woods-three-recovery.json"))
 var recovered=play(b,int(recovery_route.index),recovery_route.tape)
 check(recovered.finish and recovered.deaths==0,"wrong return approach can recover from the closed ceiling and complete without retry")
 var alternate=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/woods-three-alternate.json"))
 var alt=play(b,int(alternate.index),alternate.tape,"no_pods")
 check(alt.finish and alt.deaths==0 and alt.pods==0 and alt.bells==1 and alt.advanced,"retained advanced alternate still prepares its landing with the bell")
 for fixture in JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/woods-three-shortcuts.json")):
  var d=a if fixture.chapter==21 else b
  var prior=play(d,int(fixture.index),fixture.tape,fixture.mode,fixture.room)
  var current=play(d,int(fixture.index),fixture.tape,fixture.mode)
  check(prior.finish and prior.deaths==0 and not current.finish,"witnessed shortcut works before its guard and fails afterward: "+fixture.label)
 print("FRACTURED WOODS THREE PHYSICS ","FAILED" if failed else "PASSED")
 quit(1 if failed else 0)
