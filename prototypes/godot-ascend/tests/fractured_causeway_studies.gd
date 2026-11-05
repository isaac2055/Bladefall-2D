extends SceneTree
## The nine Fractured Causeway studies: tear properties, timed mouths, the brute as a key and the lift.
## Physical witnesses, counterfactuals and nearby timings; no input quotas.
const Core=preload("res://scripts/core.gd")
const L=preload("res://scripts/room_loader.gd")
const R=preload("res://tests/workshop_routes.gd")
var failed=false
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 failed=failed or not ok
func room(d,id):
 for r in d.world.rooms:
  if r.id==id: return r
 return null
func play(d,id,tape,mode=""):
 var r=room(d,id).duplicate(true)
 r.workshopGoal=r.puzzleGoal
 var c=Core.new(d.constants.duplicate(true),d.playerDefaults)
 c.load_room(L.parse(r))
 if mode=="no_lines": c.ents=c.ents.filter(func(e):return e.type!="zipline")
 if mode=="two_way":
  for e in c.ents:
   if e.type=="zipline": e.oneWay=false
 var q={"finish":false,"deaths":0,"rides":0,"exits":[],"exited":false,"brute_dead":false,"breach":false}
 for part in tape:
  for i in range(int(part[0])):
   c.step(R.decode(part[1]))
   q.finish=q.finish or R.at_goal(c)
   q.exited=q.exited or c.exited
   if "zip-in" in c.events: q.rides+=1
   if "zip-out" in c.events: q.exits.append([c.p.vx,c.p.vy,c.p.dashes])
   if c.combat.has("enemies"):
    q.brute_dead=c.combat.enemies.any(func(e):return e.get("dead",false))
    q.breach=q.breach or "breach" in c.events
   if c.deaths>0:
    q.deaths=c.deaths
    return q
 return q
func clears(q): return q.finish and q.deaths==0
func _initialize():
 var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/world23.json"))
 var ids=["cl23-puzzle-line-away","cl23-puzzle-line-keeps-speed","cl23-puzzle-line-runs-home","cl23-puzzle-sill-clock","cl23-puzzle-line-downhill","cl23-puzzle-keep-weight-off","cl23-puzzle-line-on-beat","cl23-puzzle-line-behind-wall","cl23-puzzle-lift-on-beat"]
 for id in ids:
  var r=room(d,id)
  check(r!=null and r.puzzleStudy and r.lock==["parry","portal"] and r.dashes==1,"study exists with parry and portal locked: "+id)
  check(d.world.requiredMainRooms.has(id) and d.world.tapes.has(id),"required on the road with a reference recording: "+id)
  var ref=r.puzzleRoutes[0].tape
  var q=play(d,id,ref)
  check(clears(q) and q.exited,"deathless reference reaches the goal and leaves by the exit: "+id)
  if not r.lines.is_empty(): check(not play(d,id,ref,"no_lines").finish,"the reference needs its tear: "+id)
 # 1 · The Line That Carries You Away from the Exit: the tear's refill is the second dash.
 var a="cl23-puzzle-line-away"
 var ref1=room(d,a).puzzleRoutes[0].tape
 var q1=play(d,a,ref1)
 check(q1.rides==1 and q1.exits[0][1]<0 and q1.exits[0][2]==1,"the backward line throws upward and returns the dash")
 check(not play(d,a,[[40,"r"],[1,"rj"],[16,"rj"],[1,"ux"],[16,""],[40,"ur"],[120,"r"]]).finish,"riding without spending the returned dash falls short")
 check(not play(d,a,[[40,"r"],[1,"rj"],[16,"rj"],[1,"ux"],[16,""],[30,"lg"],[60,"ug"],[60,"r"]]).finish,"the shaft wall cannot replace the dash with a climb")
 check(not play(d,a,[[40,"r"],[1,"rj"],[10,"rj"],[1,"urx"],[80,"r"]]).finish,"a jump and dash toward the exit cannot reach it")
 var near1=[]
 for n in [12,14,18,20]:
  var t=ref1.duplicate(true);t[2]=[n,"rj"]
  if clears(play(d,a,t)):near1.append(n)
 check(near1.size()>=3,"nearby launch timings catch the line: "+str(near1))
 # 2 · The Line That Will Not Set You Down: the plain flat line keeps its speed.
 var b="cl23-puzzle-line-keeps-speed"
 var q2=play(d,b,room(d,b).puzzleRoutes[0].tape)
 check(q2.rides==1 and abs(q2.exits[0][0])>=200,"the lower line throws at full line speed")
 check(not play(d,b,[[10,""],[1,"j"],[12,"j"],[1,"rx"],[60,""],[1,"rj"],[10,"rj"],[1,"rx"],[60,"r"]]).finish,"the set-down perch is a caged dead end")
 check(not play(d,b,[[30,"r"],[1,"rj"],[12,"rj"],[1,"rx"],[80,"r"]]).finish,"a jump and dash from the shelf cannot reach the slot")
 var near2=[]
 for n in [6,8,12,14]:
  if clears(play(d,b,[[n,""],[1,"rx"],[60,""],[200,"r"]])):near2.append(n)
 check(near2.size()>=3,"nearby start timings: "+str(near2))
 var dropped=0
 var up=[[10,""],[1,"j"],[12,"j"],[1,"rx"],[60,""]]
 for walk in [6,10,14]:
  for fall in [0,4,8,12]:
   for aim in ["rx","drx","urx"]:
    var t=up+[[walk,"l"],[3,"l"]]+([[fall,""]] if fall else [])+[[1,aim],[10,aim.substr(0,aim.length()-1)],[60,"r"]]
    if play(d,b,t).finish:dropped+=1
 check(dropped==0,"36 drops from the perch with a dash under it all fail")
 # 3 · The Line That Only Runs Home: out on foot across cracked sills, back on the line.
 var c="cl23-puzzle-line-runs-home"
 var ref3=room(d,c).puzzleRoutes[0].tape
 var q3=play(d,c,ref3)
 check(q3.rides==1 and q3.exits[0][2]==1,"one ride home from the lit end, with the dash returned")
 check(not play(d,c,ref3.slice(0,18)+[[60,"l"],[1,"lj"],[14,"lj"],[60,"l"]]).finish,"walking back over the sills does not lead out")
 var line=room(d,c).lines[0]
 check(line.oneWay and line.a[0]>line.b[0],"the live mouth is the far end; the near end is closed")
 var near3=[]
 for n in [44,49,52,56]:
  var t=ref3.slice(0,18)+[[1,"lx"],[6,"l"],[n,""],[1,"ux"],[8,"u"],[24,"ur"],[300,"r"]]
  if clears(play(d,c,t)):near3.append(n)
 check(near3.size()>=3,"nearby dash timings after the ride: "+str(near3))

 # 4 · The Sill That Starts the Clock: the sill's shake decides when you pass the timed mouth.
 var e4="cl23-puzzle-sill-clock"
 var hits=[]
 for w in range(0,96,6):
  if clears(play(d,e4,[[w,""],[64,"r"],[30,""],[1,"rx"],[6,"r"],[200,"r"]])):hits.append(w)
 check(hits.size()>=3 and hits.size()<=8,"only some starting moments in the 96-frame cycle pass the open mouth: "+str(hits))
 check(not play(d,e4,[[40,"r"],[1,"rj"],[16,"rj"],[1,"rx"],[100,"r"]]).finish,"jumping the shaft reaches nothing: its wall is whole but for the slit")
 # 5 · The Line You Must Ride Downhill: the climbing line keeps no speed, the falling one does.
 var e5="cl23-puzzle-line-downhill"
 var q5=play(d,e5,[[30,"r"],[1,"rx"],[6,"r"],[200,"r"]])
 check(q5.rides==1 and q5.exits[0][0]>150 and q5.exits[0][1]>0,"the downhill line throws forward with its speed")
 check(not play(d,e5,[[30,"r"],[1,"rx"],[6,"r"],[200,"r"]]).finish,"the throw alone falls short: the returned dash is part of it")
 var uphill=0
 for k in [8,10,12]:
  for dd in [8,16,24,30,36,44,52,60]:
   for aim in ["rx","drx","urx"]:
    for steer in ["r","","l"]:
     var t=[[24,"r"],[8,""],[1,"j"],[k,"j"],[1,"rx"],[6,"r"],[dd,steer],[1,aim],[8,aim.substr(0,aim.length()-1)],[200,"r"]]
     if play(d,e5,t).finish:uphill+=1
 check(uphill==0,"216 rides up the climbing line, each with a dash after, all fall short")
 var near5=[]
 for k in [20,22,24]:
  if clears(play(d,e5,[[30,"r"],[1,"rx"],[6,"r"],[k,"r"],[1,"rx"],[8,"r"],[200,"r"]])):near5.append(k)
 check(near5.size()==3,"nearby dash timings after the throw: "+str(near5))
 # 6 · The Weight You Keep Off the Hound: its charge breaks the door; the weight kills the key.
 var e6="cl23-puzzle-keep-weight-off"
 var ref6=room(d,e6).puzzleRoutes[0].tape
 var q6=play(d,e6,ref6)
 check(q6.breach and not q6.brute_dead,"the reference opens the door with the brute's charge and leaves it alive")
 var trap=play(d,e6,[[64,"r"],[20,""],[1,"j"],[12,"j"],[1,"dx"],[8,"d"],[60,""],[100,"r"],[100,""],[200,"r"]])
 check(trap.brute_dead and not trap.breach and not trap.finish,"dropping the weight on the brute leaves the door shut for good")
 check(not play(d,e6,ref6.slice(0,4)+[[200,"r"]]).finish,"standing in the charge without jumping fails")
 var near6=[]
 for j in [70,72,74,76]:
  if clears(play(d,e6,ref6.slice(0,4)+[[j,""],[1,"j"],[14,"j"],[30,""],[120,"r"]])):near6.append(j)
 check(near6.size()>=3,"nearby jump timings over the charge and its wave: "+str(near6))
 # 7 · The Line That Opens on the Beat: leave late in the first window, or wait on the cracked perch.
 var e7="cl23-puzzle-line-on-beat"
 var seen7={}
 for w in [0,4,8]:
  for wait in [0,12,24]:
   var t=[[24,"r"],[8,""],[w,""],[1,"rx"],[6,"r"],[22,""],[wait,""],[1,"rx"],[6,"r"],[160,"r"]]
   seen7[str([w,wait])]=clears(play(d,e7,t))
 check(not seen7[str([0,0])] and seen7[str([0,12])],"leaving early and dashing on landing fails; waiting on the perch for the second beat clears")
 check(not play(d,e7,[[30,"r"],[1,"rj"],[12,"rj"],[1,"rx"],[100,"r"]]).finish,"the cracked perch is out of reach without the first line")
 # 8 · The Line Behind the Brittle Wall: the brute opens the alcove; the ledge keeps you out of its charge.
 var e8="cl23-puzzle-line-behind-wall"
 var ref8=room(d,e8).puzzleRoutes[0].tape
 var q8=play(d,e8,ref8)
 check(q8.breach and q8.rides==1 and not q8.brute_dead,"the brute breaks the alcove and the one-way line lifts you out")
 check(not play(d,e8,[[168,"r"],[4,"r"],[60,""],[1,"l"],[30,""],[44,"r"],[2,""],[1,"ux"],[8,"u"],[28,""],[1,"ux"],[8,"u"],[30,"ur"],[120,"r"]]).finish,"leaving the ledge before the brute is sent away again fails")
 check(not play(d,e8,[[160,"r"],[1,"rj"],[10,"rj"],[1,"urx"],[8,"ur"],[100,"r"]]).finish and not play(d,e8,[[168,"r"],[4,"r"],[30,""],[1,"rj"],[10,"rj"],[1,"urx"],[8,"ur"],[100,"r"]]).finish,"the exit corridor is out of reach from the walkway and the ledge")
 var waits8=[]
 for w in [160,200,240,300]:
  var t=ref8.duplicate(true);t[2]=[w,""]
  if clears(play(d,e8,t)):waits8.append(w)
 check(waits8.size()==4,"any long wait on the ledge works: "+str(waits8))
 # 9 · The Lift That Keeps the Beat: when you step on the lift decides whether the mouth is open as you fly past.
 var e9="cl23-puzzle-lift-on-beat"
 var steps=[]
 for w in range(0,120,12):
  if clears(play(d,e9,[[w,""],[26,"r"],[1,""],[20,""],[1,"rj"],[20,"rj"],[1,"ux"],[8,"u"],[24,""],[1,"ux"],[8,"u"],[24,"ur"],[320,"r"]])):steps.append(w)
 check(steps.size()>=3 and steps.size()<=5,"only some moments to step on the lift catch the open mouth: "+str(steps))
 check(not play(d,e9,[[26,"r"],[1,""],[20,""],[1,"rj"],[20,"rj"],[1,"ux"],[8,"u"],[60,"r"]]).finish,"the lift's throw and a dash cannot reach the corridor without the line")
 var near9=[]
 for k in [18,20,22]:
  if clears(play(d,e9,[[60,""],[26,"r"],[1,""],[20,""],[1,"rj"],[k,"rj"],[1,"ux"],[8,"u"],[24,""],[1,"ux"],[8,"u"],[24,"ur"],[320,"r"]])):near9.append(k)
 check(near9.size()==3,"nearby dash timings in flight: "+str(near9))
 quit(1 if failed else 0)
