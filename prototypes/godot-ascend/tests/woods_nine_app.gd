extends SceneTree
## Preserve the accepted six and verify the three additions in the real application.
const Main=preload("res://main.tscn")
const C=preload("res://authoring/codec.gd")
const A=preload("res://scripts/authoring_data.gd")
const R=preload("res://tests/workshop_routes.gd")
var failed=false
func check(ok,label):
 print("PASS " if ok else "FAIL ",label);failed=failed or not ok
func _initialize():run.call_deferred()
func normalized(room):
 room=room.duplicate(true)
 if room.has("atlasMain"):
  for link in [room.atlasMain,room.atlasSockets[0]]:link.erase("to");link.erase("toFloor")
 return room
func play(app,tape):
 app.journey=[];app.journey_frame=0
 for part in tape:
  for tick in range(int(part[0])):app.journey.append(part[1])
 for tick in range(app.journey.size()):app._physics_process(1.0/60);app.landscape._process(1.0/60)
func at_goal(c):
 var g=c.room.def.puzzleGoal
 return c.p.state not in ["dead","respawn"] and c.p.onGround and Rect2(g[0],g[1]-2,g[2],g[3]+4).has_point(Vector2(c.p.x+4,c.p.y+11))
func initial(c,i):
 if i==43:return c.ents.filter(func(e):return e.type=="hingeArm").all(func(e):return e.dir=="up" and e.turns==0)
 if i==44:return not c.oath_root.released and not c.oath_root.taken
 return c.resin_wind.t==0 and c.ents.filter(func(e):return e.type=="resinBranch").all(func(e):return e.solid==(e.phase==0))
func run():
 var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/world22.json"))
 var before=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/woods-nine-preservation.json"))
 for room in d.world.rooms:
  if before.rooms.has(room.id):
   check(C.fingerprint(normalized(room))==before.rooms[room.id] and C.fingerprint(d.world.tapes.get(room.id,[]))==before.tapes[room.id],"prior room and reference preserved: "+room.id)
 for section in before.sections:
  if section.room=="cl22-atlas-crossroads":continue
  check(d.world.sections.filter(func(s):return s.room==section.room)[0]==section,"prior placement and checkpoint preserved: "+section.room)
 var metadata=d.world.duplicate(true)
 for key in ["rooms","tapes","sections","requiredMainRooms"]:metadata.erase(key)
 check(C.fingerprint(metadata)==before.metadata and C.fingerprint(d.constants)==before.constants and C.fingerprint(d.playerDefaults)==before.defaults,"chapter metadata, quests and shared physics preserved")
 check(d.world.rooms.size()==46 and d.world.requiredMainRooms.size()==22 and d.world.requiredMainRooms.slice(0,before.required.size())==before.required,"nine additions: six banked plus three new independent challenges")
 var native=load("res://levels/world22.tscn").instantiate();var base=A.baseline(d)
 check(C.first_difference(base,native.compile_into(base))=="" and native.validate_data(native.compile_into(base)).is_empty(),"native editor/source parity and validation");native.free()
 var args=OS.get_cmdline_user_args();var source=args[0] if not args.is_empty() else "res://"
 check(FileAccess.get_sha256(source.path_join("levels/world1.tscn"))==before.world1,"unrelated World 1 edit preserved")
 var app=Main.instantiate();app.test_mode=true;app.initial_world=22;root.add_child(app);await process_frame;app.set_physics_process(false)
 for i in [43,44,45]:
  var room=d.world.rooms[i];var tape=room.puzzleRoutes[0].tape
  app.world.restart();app.watch=false;app.load_section(i)
  check(app.world.checkpoint_id==room.id and app.room_picker.get_selected_id()==i,"own checkpoint and named menu: "+room.name)
  play(app,[[90,""]]);check(initial(app.sim,i),"preparation remains intact while inspecting the room: "+str(i))
  app.show_workshop_hint();check(app.notice_label.text==room.hint,"optional hint: "+room.name)
  play(app,tape);check(at_goal(app.sim) and app.sim.deaths==0,"actual application clear: "+room.name)
  app.toggle_watch();var observed=false;var core=app.sim
  for tick in range(app.tape.size()):
   app._physics_process(1.0/60);observed=observed or at_goal(core)
   if core.exited:break
  check(observed and core.exited and core.deaths==0,"complete Watch reaches the flag and physical exit: "+room.name)
  app.toggle_watch()
  for death in [false,true]:
   app.world.restart();app.watch=false;app.load_section(i)
   play(app,tape.slice(0,{43:8,44:14,45:7}[i]))
   if death:app.sim.die()
   else:app.retry_room()
   play(app,[[90,""]])
   check(initial(app.sim,i),"death/retry restores preparation: "+str([i,death]))
   var previous_deaths=app.sim.deaths
   play(app,tape);check(at_goal(app.sim) and app.sim.deaths==previous_deaths,"reference usable after reset: "+str([i,death]))
 app.queue_free();await process_frame;await create_timer(.1).timeout
 print("WOODS NINE APP ","FAILED" if failed else "PASSED")
 quit(1 if failed else 0)
