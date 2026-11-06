extends SceneTree
## Cores 1-3 (worlds 101-103) in the actual application: selection, Watch, save points, retry and restart.
## Movement parity with the browser is proven separately by tools/parity.mjs --world=101/102/103.
const Main=preload("res://main.tscn")
const R=preload("res://tests/workshop_routes.gd")
var app
var failed=false
func _initialize(): run.call_deferred()
func check(ok,message):
 print("PASS " if ok else "FAIL ",message)
 failed=failed or not ok
func run():
 app=Main.instantiate()
 app.test_mode=true
 root.add_child(app)
 await process_frame
 app.set_physics_process(false)
 var names={101:"Outskirts · Core",102:"Black Woods · Core",103:"Causeway · Core"}
 var saves_expected={101:6,102:8,103:4}
 for number in [101,102,103]:
  check(app.CHAPTERS.has(number),"Core %d is a chapter"%(number-100))
  app.chapter_picker.item_selected.emit(app.CHAPTERS.find(number))
  var w=app.world
  check(app.chapter_number==number and w.data.world.name==names[number],"selected "+names[number])
  check(app.chapter_picker.get_item_text(app.CHAPTERS.find(number)).begins_with("Core %d · "%(number-100)),"menu names it Core %d"%(number-100))
  check(app.audio.music.stream==app.audio.stream(app.audio.manifest.chapters[str(number-100)].music,true),"plays its base world's score")
  check(app.landscape.forest==(number==102) and app.landscape.causeway==(number==103) and not app.landscape.fractured,"wears its base world's backdrop")
  var id=w.data.world.rooms[0].id
  var points=w.data.world.rooms[0].coreCheckpoints
  # Watch: the authored reference clears the whole Core in the continuous world.
  app.watch=true
  app.load_section(w.regions.find(id))
  var sim=app.sim
  var saved=[]
  for i in range(app.tape.size()):
   app._physics_process(1.0/60)
   if "core-checkpoint" in sim.events: saved.append(sim.core_run.index)
   if sim.exited: break
  check(sim.exited and sim.deaths==0,"Watch clears "+names[number]+" without dying")
  check(saved.size()==saves_expected[number] and saved==range(saves_expected[number]),"Watch lights every save lantern in order: "+str(saved))
  check(app.bearing_caption().begins_with("CORE · PART %d / %d"%[points.size()+1,points.size()+1]),"HUD shows the last part: "+app.bearing_caption())
  # Save points in normal play: reach the first lantern, die, respawn on it; Retry keeps it; restart clears it.
  app.watch=false
  w.restart()
  app.sim=w.active()
  sim=app.sim
  var keys=[]
  for part in w.data.world.tapes[id]:
   for i in range(int(part[0])): keys.append(part[1])
  var reached=-1
  for f in range(keys.size()):
   w.step(R.decode(keys[f]))
   w.update_region()
   sim=w.active()
   if sim.core_run!=null and sim.core_run.index==0:
    reached=f
    break
  check(reached>0,"normal play earns the first save lantern")
  var q=points[0]
  sim.die()
  for i in range(80):
   w.step(R.decode(""))
   sim=w.active()
   if sim.p.state=="normal": break
  check(sim.p.x==q.c*8 and sim.p.y==q.r*8+8-sim.p.h and sim.core_run.index==0,"death respawns on the first lantern")
  w.retry()
  sim=w.active()
  check(sim.p.x==q.c*8 and sim.core_run.index==0,"Retry returns to the latest lantern")
  w.restart()
  sim=w.active()
  check(sim.core_run==null or sim.core_run.index==-1,"Start world over clears the saves")
  check(sim.p.x==sim.room.spawn.x and sim.p.y==sim.room.spawn.y,"Start world over starts at the Core's entrance")
 quit(1 if failed else 0)
