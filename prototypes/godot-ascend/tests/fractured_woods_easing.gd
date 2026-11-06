extends SceneTree
## Compare identical timing samples against the previous build, plus real return rules.
const Main=preload("res://main.tscn")
const Core=preload("res://scripts/core.gd")
const L=preload("res://scripts/room_loader.gd")
const R=preload("res://tests/workshop_routes.gd")
const Pickups=preload("res://scripts/workshop_pickups.gd")
var failed=false
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 failed=failed or not ok
func count_timings(data,room,index):
 room=room.duplicate(true);room.workshopGoal=room.puzzleGoal
 var segment=13 if index==37 else 18
 var clears=0
 for dash in range(8,17):
  for delay in range(12,35,2):
   var c=Core.new(data.constants.duplicate(true),data.playerDefaults);c.load_room(L.parse(room))
   var tape=room.puzzleRoutes[0].tape.duplicate(true);tape[segment][0]=dash;tape[segment+1][0]=delay
   var wave=false;var finish=false
   for part in tape:
    for tick in range(int(part[0])):
     c.step(R.decode(part[1]));wave=wave or "super" in c.events;finish=finish or R.at_goal(c)
     if c.deaths>0:break
    if c.deaths>0:break
   if finish and wave and c.deaths==0:clears+=1
 return clears
func play(app,tape):
 app.journey=[];app.journey_frame=0
 for part in tape:
  for tick in range(int(part[0])):app.journey.append(part[1])
 for tick in range(app.journey.size()):app._physics_process(1.0/60.0)
func gate(core):return core.ents.filter(func(e):return e.type=="gate" and e.x==544)[0]
func _initialize():run.call_deferred()
func run():
 var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/world22.json"))
 var before=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/woods-036-before.json"))
 for index in [37,38]:
  var prior=count_timings(d,before[str(index)],index)
  var current=count_timings(d,d.world.rooms[index],index)
  check(current>prior,"more deathless powered timing samples: %d · %d -> %d / 108"%[index,prior,current])
 var app=Main.instantiate();app.test_mode=true;app.initial_world=22;root.add_child(app);await process_frame;app.set_physics_process(false)
 var room=d.world.rooms[39];var route=room.puzzleRoutes[0].tape
 for death in [false,true]:
  app.world.restart();app.load_section(39)
  play(app,route.slice(0,14))
  check(Pickups.counts(app.sim.ents)==[1,2] and not gate(app.sim).get("open",false),"outward rebound collects only the first shard; exit stays closed")
  check("1 / 2" in app.bearing_caption(),"campaign HUD shows carried return items")
  if death:app.sim.die()
  else:app.retry_room()
  play(app,[[70,""]])
  check(Pickups.counts(app.sim.ents)==[0,2] and not app.sim.puzzle_returned and not gate(app.sim).get("open",false),"death/retry clears unreturned items and closes the gate")
  check(not app.world.progress.has(room.id),"return items never become permanent campaign bearings")
 for missing in [0,1]:
  app.world.restart();app.load_section(39)
  var items=app.sim.ents.filter(func(e):return e.type=="shard")
  items[missing].x=1000
  play(app,route)
  check(app.sim.p.onGround and app.sim.p.x>=40 and app.sim.p.x<88 and app.sim.p.y==117 and Pickups.counts(app.sim.ents)==[1,2],"actual home arrival with one missing item: "+str(missing))
  check(not app.sim.puzzle_returned and not gate(app.sim).get("open",false),"either missing shard rejects the return")
  play(app,d.world.tapes[room.id].slice(route.size()))
  check(app.world.active_id==room.id and app.sim.p.x<=536 and app.sim.deaths==0,"closed physical gate blocks onward campaign travel")
 app.world.restart();app.load_section(39)
 # Collecting everything away from home cannot open the gate.
 for e in app.sim.ents:
  if e.type=="shard":e.gone=true
 play(app,[[1,""]])
 check(not app.sim.puzzle_returned and not gate(app.sim).get("open",false),"both collected items still require a return to the flag")
 app.world.restart();app.load_section(39);play(app,route)
 check(Pickups.counts(app.sim.ents)==[2,2] and app.sim.puzzle_returned and gate(app.sim).open and app.sim.deaths==0,"live intended route returns both items and opens the gate")
 check("EXIT OPEN" in app.bearing_caption(),"HUD confirms the successful return")
 play(app,d.world.tapes[room.id].slice(route.size()))
 check(app.world.active_id=="cl22-atlas-crossroads" and app.sim.deaths==0,"returned items allow the actual onward exit")
 app.world.restart();app.load_section(39);app.toggle_watch()
 var c=app.sim
 for tick in range(app.tape.size()):
  app._physics_process(1.0/60.0)
  if c.exited:break
 check(c.puzzle_returned and c.exited and c.deaths==0,"Watch collects both, returns them and clears the physical gate")
 app.queue_free();await process_frame
 print("FRACTURED WOODS EASING ","FAILED" if failed else "PASSED")
 quit(1 if failed else 0)
