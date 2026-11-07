extends SceneTree
const Main=preload("res://main.tscn")
const C=preload("res://authoring/codec.gd")
const A=preload("res://scripts/authoring_data.gd")
const S=preload("res://tests/woods_search.gd")
const R=preload("res://tests/workshop_routes.gd")
var failed=false
func _initialize():run.call_deferred()
func check(ok,label):
 print("PASS " if ok else "FAIL ",label);failed=failed or not ok
func normalized(room):
 room=room.duplicate(true)
 if room.has("atlasMain"):
  for link in [room.atlasMain,room.atlasSockets[0]]:link.erase("to");link.erase("toFloor")
 return room
func goal(c):
 var g=c.room.def.puzzleGoal
 return c.p.state not in ["dead","respawn"] and c.p.onGround and Rect2(g[0],g[1]-2,g[2],g[3]+4).has_point(Vector2(c.p.x+4,c.p.y+11))
func play(app,tape):
 app.journey=[];app.journey_frame=0
 for part in tape:
  for tick in range(part[0]):app.journey.append(part[1])
 for tick in range(app.journey.size()):app._physics_process(1.0/60);app.landscape._process(1.0/60)
func run():
 var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/world22.json"))
 var before=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/woods-next-preservation.json"))
 for room in d.world.rooms:
  if before.rooms.has(room.id):
   check(C.fingerprint(normalized(room))==before.rooms[room.id],"previous room preserved: "+room.id)
   check(C.fingerprint(d.world.tapes.get(room.id,[]))==before.tapes[room.id],"previous recording preserved: "+room.id)
 for section in before.sections:
  if section.room=="cl22-atlas-crossroads":continue
  check(d.world.sections.filter(func(s):return s.room==section.room)[0]==section,"previous position and checkpoint preserved: "+section.room)
 var meta=d.world.duplicate(true)
 for key in ["rooms","tapes","sections","requiredMainRooms"]:meta.erase(key)
 check(C.fingerprint(meta)==before.metadata,"quests, secrets and world metadata preserved")
 check(C.fingerprint(d.constants)==before.constants and C.fingerprint(d.playerDefaults)==before.defaults,"movement constants preserved")
 check(d.world.requiredMainRooms.slice(0,16)==before.required and d.world.requiredMainRooms.size()==22 and d.world.rooms.size()==46,"nine independent additions, twenty-two main rooms")
 var native=load("res://levels/world22.tscn").instantiate();var base=A.baseline(d)
 check(C.first_difference(base,native.compile_into(base))=="" and native.validate_data(native.compile_into(base)).is_empty(),"native editor data matches source and validates");native.free()
 var args=OS.get_cmdline_user_args();var source_root=args[0] if not args.is_empty() else "res://"
 check(FileAccess.get_sha256(source_root.path_join("levels/world1.tscn"))==before.world1,"local World 1 edit preserved")
 var app=Main.instantiate();app.test_mode=true;app.initial_world=22;root.add_child(app);await process_frame;app.set_physics_process(false)
 for index in [40,41,42]:
  var room=d.world.rooms[index]
  app.world.restart();app.watch=false;app.load_section(index)
  check(app.world.checkpoint_id==room.id and app.room_picker.get_selected_id()==index,"own checkpoint and named selection: "+room.name)
  app.show_workshop_hint();check(app.notice_label.text==room.hint,"optional hint: "+room.name)
  play(app,room.puzzleRoutes[0].tape)
  check(goal(app.sim) and app.sim.deaths==0,"actual application clear: "+room.name)
  app.toggle_watch();var observed=false;var core=app.sim
  for tick in range(app.tape.size()):
   app._physics_process(1.0/60);observed=observed or goal(core)
   if core.exited:break
  check(observed and core.exited and core.deaths==0,"complete Watch reaches the flag and physical exit: "+room.name)
  app.toggle_watch()
  for death in [false,true]:
   app.world.restart();app.load_section(index)
   play(app,room.puzzleRoutes[0].tape.slice(0,{40:6,41:25,42:9}[index]))
   if death:app.sim.die()
   else:app.retry_room()
   play(app,[[90,""]])
   # Retry restores phase, lantern, resin clock and crown; the clock may advance while idle.
   check(app.sim.phase==0 and app.sim.p.carrying==null and (app.sim.root_lash==null or not app.sim.root_lash.crown.cut) and app.sim.ents.all(func(e):return e.type!="lantern" or e.x==e.ox),"death/retry restores preparation: "+str([index,death]))
   play(app,room.puzzleRoutes[0].tape)
   check(goal(app.sim),"reference remains usable after retry: "+str([index,death]))
 app.queue_free();await process_frame;await create_timer(.1).timeout
 print("FRACTURED WOODS NEXT APP ","FAILED" if failed else "PASSED")
 quit(1 if failed else 0)
