extends SceneTree
## The retained Brittle Wall draft; the other eight studies were rejected.
## Physical witnesses, counterfactuals and nearby timings; no input quotas.
const Main=preload("res://main.tscn")
const Codec=preload("res://authoring/codec.gd")
const Authoring=preload("res://scripts/authoring_data.gd")
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
func _initialize():run.call_deferred()
func run():
 var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/world23.json"))
 var rejected=["cl23-puzzle-line-away","cl23-puzzle-line-keeps-speed","cl23-puzzle-line-runs-home","cl23-puzzle-sill-clock","cl23-puzzle-line-downhill","cl23-puzzle-keep-weight-off","cl23-puzzle-line-on-beat","cl23-puzzle-lift-on-beat"]
 for id in rejected:
  check(room(d,id)==null and not d.world.tapes.has(id) and not d.world.requiredMainRooms.has(id) and not d.world.sections.any(func(section):return section.room==id),"rejected room absent from active chapter, recordings and progression: "+id)
 var ids=["cl23-puzzle-line-behind-wall"]
 for id in ids:
  var r=room(d,id)
  check(r!=null and r.puzzleStudy and r.lock==["parry","portal"] and r.dashes==1,"study exists with parry and portal locked: "+id)
  check(d.world.requiredMainRooms.has(id) and d.world.tapes.has(id),"required on the road with a reference recording: "+id)
  var ref=r.puzzleRoutes[0].tape
  var q=play(d,id,ref)
  check(clears(q) and q.exited,"deathless reference reaches the goal and leaves by the exit: "+id)
  if not r.lines.is_empty(): check(not play(d,id,ref,"no_lines").finish,"the reference needs its tear: "+id)
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
 var native=load("res://levels/world23.tscn").instantiate()
 var base=Authoring.baseline(d);var compiled=native.compile_into(base)
 check(Codec.first_difference(base,compiled)=="" and native.validate_data(compiled).is_empty(),"native editor matches the pruned chapter and validates")
 native.free()
 var app=Main.instantiate();app.test_mode=true;app.initial_world=23;root.add_child(app)
 await process_frame;app.set_physics_process(false)
 app.load_section(37)
 check(app.sim.room.id==e8 and app.room_picker.get_selected_id()==37 and app.world.checkpoint_id==e8,"launcher index, room selection and checkpoint reach the retained draft")
 check(app.data.world.rooms.size()==38 and app.data.world.rooms.filter(func(r):return str(r.id).begins_with("cl23-puzzle-")).size()==1,"actual application contains only the retained added room")
 app.watch=true;app.load_section(37)
 var sim=app.sim
 for tick in range(app.tape.size()):
  app._physics_process(1.0/60)
  if sim.exited:break
 check(sim.exited and sim.deaths==0,"retained Watch still reaches the physical exit in the application")
 app.watch=false;app.load_section(37)
 for tick in range(180):app.sim.step(R.decode("r"))
 app.retry_room()
 check(app.sim.p.x==app.sim.room.spawn.x and app.sim.ents.filter(func(e):return e.type=="brittle").all(func(e):return not e.open),"retry restores the retained room and its unbroken wall")
 app.queue_free();await process_frame
 print("CAUSEWAY RETAINED ","FAILED" if failed else "PASSED")
 quit(1 if failed else 0)
