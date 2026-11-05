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
 if mode=="no_wall":c.ents=c.ents.filter(func(e):return e.type!="toggle" or e.x!=192)
 var q={"finish":false,"deaths":0,"waves":0,"pods":0,"bells":0,"loft":false,"low":false,"climbed":false,"climb_stamina":110.0,"advanced":false,"history":[],"frames":0,"climb_frames":0}
 for part in tape:
  for tick in range(int(part[0])):
   if mode=="permanent":
    for e in c.ents:
     if e.type=="crumble":e.broken=false;e.shaking=0
   if mode=="no_wall":
    for e in c.ents:
     if e.type=="toggle" and e.x==192:e.solid=false
   c.step(R.decode(part[1]));q.frames+=1;q.finish=q.finish or R.at_goal(c)
   for event in c.events:
    if event in ["super","pod","bell","dash-start","land"]:q.history.append([q.frames,event,c.p.x,c.p.y,c.phase,c.p.vx,c.p.dashes])
   if mode=="pod_without_speed" and "pod" in c.events:c.p.vx=sign(c.p.vx)*90
   if "super" in c.events:q.waves+=1
   if "pod" in c.events:q.pods+=1
   if "bell" in c.events:q.bells+=1
   q.loft=q.loft or "pogo-loft" in c.events;q.low=q.low or "pogo-low" in c.events
   q.advanced=q.advanced or ["hyper","super","wallbounce","late-wallbounce","late-reverse"].any(func(e):return e in c.events)
   if c.p.state=="climb":q.climb_frames+=1;q.climbed=true;q.climb_stamina=min(q.climb_stamina,c.p.stamina)
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
 check(room.zips==old.zips and room.puzzleGoal==old.puzzleGoal and room.map[28]==old.map[28] and room.map[30]==old.map[30],"Bridge restores original destination, crumble opening and carriage footprint, keeping its timing")
 var forgiving=route.duplicate(true);forgiving[18]=[20,"j"];forgiving[19][0]=18
 var recovery=play(a,46,forgiving)
 check(not recovery.finish,"the former ordinary-jump fallback no longer reaches the restored-height finish")
 var clear_hops=[]
 for hop in range(8,17):
  var varied=route.duplicate(true);varied[18][0]=hop
  var q=play(a,46,varied)
  if q.finish and q.deaths==0 and q.waves==1:clear_hops.append(hop)
 check(clear_hops.size()>=3,"several nearby Bridge setup hops preserve the wavedash: "+str(clear_hops))
 for index in [37,38,39]:
  var tape=b.world.rooms[index].puzzleRoutes[0].tape
  var q=play(b,index,tape)
  check(q.finish and q.deaths==0 and q.advanced and q.waves==1,"deathless Fractured wavedash reference: "+b.world.rooms[index].name)
  check(not play(b,index,tape,"no_pods").finish and not play(b,index,tape,"no_bells").finish,"reference depends on its pod and phase preparation: "+str(index))
  if index==37:check(q.pods==2 and q.bells==1 and q.loft and q.low,"one pod supplies high and low rebounds around the bell change")
  if index==38:check(q.pods==1 and q.bells==2,"shared bell used from both faces before the momentum-preserving high rebound")
  if index==39:check(q.climbed and q.climb_stamina>5 and q.climb_frames<90 and q.pods==1,"shorter finite-stamina climb connects to an outward pod transfer")
  for segment in {37:[2,13],38:[18,21],39:[9,16]}[index]:
   var clears=[]
   for delta in range(-4,5):
    var varied=tape.duplicate(true);varied[segment][0]+=delta
    if varied[segment][0]<1:continue
    var sample=play(b,index,varied)
    if sample.finish and sample.deaths==0:clears.append(delta)
   check(clears.size()>=3,"nearby timings "+str([index,segment])+": "+str(clears))
 var before=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/fractured-difficulty-before.json"))
 # Departure/cut timing can vary when the player adjusts the return and landing.
 # Do not confuse one fixed end-to-end tape's timing with a one-frame mechanic.
 for sample in [[8,4,16,18],[9,5,14,18],[10,6,14,24],[11,7,10,18],[12,8,12,22]]:
  var varied=b.world.rooms[39].puzzleRoutes[0].tape.duplicate(true)
  for pair in [[10,sample[0]],[11,sample[1]],[12,sample[2]],[14,sample[3]]]:varied[pair[0]][0]=pair[1]
  var q=play(b,39,varied)
  check(q.finish and q.deaths==0 and q.pods==1 and q.waves==1,"nearby Wall departure/cut with adjusted return: "+str(sample))
 for index in [37,38,39]:
  var prior=before.chapters["22"][str(index)]
  check(play(b,index,prior.room.puzzleRoutes[0].tape,"",prior.room).finish and not play(b,index,prior.room.puzzleRoutes[0].tape).finish,"old easy reference clears its original room but misses the revised flag: "+str(index))
 var recovery_route=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/woods-three-recovery.json"))
 check(play(b,37,recovery_route.tape,"",before.chapters["22"]["37"].room).finish,"historical wrong-return recovery remains a valid positive control on its original layout")
 var alternate=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/woods-three-alternate.json"))
 check(play(b,37,alternate.tape,"no_pods",before.chapters["22"]["37"].room).finish and not play(b,37,alternate.tape,"no_pods").finish,"former short bell-only alternate clears before, fails after the new high bell and connected finish")
 var shortcut=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/woods-runway-shortcut.json"))
 check(play(b,37,shortcut.tape,"",shortcut.room).finish and not play(b,37,shortcut.tape).finish,"search-discovered coyote jump clears the long runway but fails after the shorter runway and farther landing")
 var bypasses=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/woods-035-bypasses.json"))
 for f in bypasses.cases:
  check(play(b,int(f.index),f.tape,"",f.room).finish and not play(b,int(f.index),f.tape).finish,"0.35 shortcut succeeds before, fails after: "+f.label)
 for path in bypasses.files:
  var args=OS.get_cmdline_user_args()
  var source_root=args[0] if not args.is_empty() else "res://"
  check(FileAccess.get_sha256(source_root.path_join(path))==bypasses.files[path],"banked Bridge or unrelated source untouched: "+path)
 var momentum=play(b,38,b.world.rooms[38].puzzleRoutes[0].tape,"pod_without_speed")
 check(not momentum.finish,"Crossing reference needs sideways speed carried through the high pod rebound")
 check(not play(b,39,b.world.rooms[39].puzzleRoutes[0].tape,"no_wall").finish,"Wall reference needs the restored climbing face")
 for index in [37,38]:
  var q=play(b,index,b.world.rooms[index].puzzleRoutes[0].tape)
  var wave=q.history.filter(func(e):return e[1]=="super")[0][0]
  var after=q.history.filter(func(e):return e[0]>wave and e[1]=="land")
  check(after.size()==1,"no resting contact between the wave and final landing: "+str(index))
 for fixture in JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/woods-three-shortcuts.json")):
  var d=a if fixture.chapter==21 else b
  var prior=play(d,int(fixture.index),fixture.tape,fixture.mode,fixture.room)
  var current=play(d,int(fixture.index),fixture.tape,fixture.mode)
  check(prior.finish and prior.deaths==0 and not current.finish,"witnessed shortcut works before its guard and fails afterward: "+fixture.label)
 print("FRACTURED WOODS THREE PHYSICS ","FAILED" if failed else "PASSED")
 quit(1 if failed else 0)
