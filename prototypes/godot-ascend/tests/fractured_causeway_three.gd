extends SceneTree
## The first three Fractured Causeway studies: tear properties as puzzles.
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
 var q={"finish":false,"deaths":0,"rides":0,"exits":[],"exited":false}
 for part in tape:
  for i in range(int(part[0])):
   c.step(R.decode(part[1]))
   q.finish=q.finish or R.at_goal(c)
   q.exited=q.exited or c.exited
   if "zip-in" in c.events: q.rides+=1
   if "zip-out" in c.events: q.exits.append([c.p.vx,c.p.vy,c.p.dashes])
   if c.deaths>0:
    q.deaths=c.deaths
    return q
 return q
func clears(q): return q.finish and q.deaths==0
func _initialize():
 var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/world23.json"))
 var ids=["cl23-puzzle-line-away","cl23-puzzle-line-keeps-speed","cl23-puzzle-line-runs-home"]
 for id in ids:
  var r=room(d,id)
  check(r!=null and r.puzzleStudy and r.lock==["parry","portal"] and r.dashes==1,"study exists with parry and portal locked: "+id)
  check(d.world.requiredMainRooms.has(id) and d.world.tapes.has(id),"required on the road with a reference recording: "+id)
  var ref=r.puzzleRoutes[0].tape
  var q=play(d,id,ref)
  check(clears(q) and q.exited,"deathless reference reaches the goal and leaves by the exit: "+id)
  check(not play(d,id,ref,"no_lines").finish,"the reference needs its tear: "+id)
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
 quit(1 if failed else 0)
