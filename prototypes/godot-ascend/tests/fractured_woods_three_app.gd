extends SceneTree
## Native preservation, live controls, complete references and independent resets.
const Main=preload("res://main.tscn")
const C=preload("res://authoring/codec.gd")
const A=preload("res://scripts/authoring_data.gd")
var failed=false
func _initialize():run.call_deferred()
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 failed=failed or not ok
func normalized(room):
 room=room.duplicate(true)
 if room.has("atlasMain"):
  for link in [room.atlasMain,room.atlasSockets[0]]:link.erase("to");link.erase("toFloor")
 return room
func goal(c):
 var g=c.room.def.puzzleGoal
 return preload("res://scripts/workshop_pickups.gd").ready(c.room.def,c.ents) and c.p.state not in ["dead","respawn"] and c.p.onGround and Rect2(g[0],g[1]-2,g[2],g[3]+4).has_point(Vector2(c.p.x+4,c.p.y+11))
func play(app,tape):
 app.journey=[];app.journey_frame=0
 for part in tape:
  for tick in range(int(part[0])):app.journey.append(part[1])
 for tick in range(app.journey.size()):
  app._physics_process(1.0/60.0)
  app.landscape._process(1.0/60.0)
func run():
 var fixture=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/woods-three-preservation.json"))
 var chapters={}
 for n in [21,22]:
  var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/world%d.json"%n));chapters[n]=d
  var before=fixture.chapters[str(n)]
  for room in d.world.rooms:
   if before.rooms.has(room.id):
    check(C.fingerprint(normalized(room))==before.rooms[room.id],"prior definition preserved: "+room.id)
    check(C.fingerprint(d.world.tapes.get(room.id,[]))==before.tapes[room.id],"prior reference preserved: "+room.id)
  for section in before.sections:check(d.world.sections.filter(func(s):return s.room==section.room)[0]==section,"prior placement preserved: "+section.room)
  var meta=d.world.duplicate(true)
  for key in ["rooms","tapes","sections","requiredMainRooms"]:meta.erase(key)
  check(C.fingerprint(meta)==before.metadata,"quests, secrets and other metadata preserved: "+str(n))
  check(C.fingerprint(d.constants)==before.constants and C.fingerprint(d.playerDefaults)==before.defaults,"physics unchanged: "+str(n))
  check(d.world.requiredMainRooms.slice(0,before.required.size())==before.required,"prior completion requirements preserved: "+str(n))
  var native=load("res://levels/world%d.tscn"%n).instantiate();var base=A.baseline(d)
  check(C.first_difference(base,native.compile_into(base))=="" and native.validate_data(native.compile_into(base)).is_empty(),"native source parity and validation: "+str(n));native.free()
 for edge in fixture.sharedEdges:
  var newer=chapters[22].world.rooms.filter(func(r):return r.id==edge.new)[0]
  var older=chapters[22].world.rooms.filter(func(r):return r.id==edge.old)[0]
  check(edge.pairs.all(func(p):return newer.map[int(p[1])][int(p[0])]=="#" and older.map[int(p[3])][int(p[2])]=="#"),"shared secret-passage wall unchanged: "+edge.old)
 var args=OS.get_cmdline_user_args();var source_root=args[0] if not args.is_empty() else "res://"
 for path in fixture.files:check(FileAccess.get_sha256(source_root.path_join(path))==fixture.files[path],"unrelated native source untouched: "+path)
 check(chapters[22].world.rooms.size()==40 and chapters[22].world.requiredMainRooms.size()==16,"three independent Woods additions follow the existing thirteen challenges")
 var app=Main.instantiate();app.test_mode=true;app.initial_world=21;root.add_child(app);await process_frame;app.set_physics_process(false)
 for pair in [[21,46],[22,37],[22,38],[22,39]]:
  var n=pair[0];var index=pair[1]
  if app.chapter_number!=n:app.switch_chapter(n)
  app.world.restart();app.watch=false;app.load_section(index)
  var room=chapters[n].world.rooms[index]
  check(app.room_picker.get_selected_id()==index and app.puzzle_hint_button.visible,"named menu and hint: "+room.name)
  app.show_workshop_hint();check(app.notice_label.text==room.hint,"current authored hint: "+room.name)
  play(app,room.puzzleRoutes[0].tape)
  check(goal(app.sim) and app.sim.deaths==0 and app.world.checkpoint_id==room.id,"deathless live clear and own checkpoint: "+room.name)
  app.landscape.snap_actor();app.landscape._process(1.0/60.0)
  var screen_y=app.world.position().y-app.landscape.camera_float.y
  check(screen_y>=24 and screen_y<=132,"camera leaves visible space below the player: "+room.name)
  app.toggle_watch();var observed=false;var core=app.sim
  for tick in range(app.tape.size()):
   app._physics_process(1.0/60.0);observed=observed or goal(core)
   if core.exited:break
  check(observed and core.exited and core.deaths==0,"complete Watch reaches the physical exit: "+room.name)
  app.toggle_watch()
  for death in [false,true]:
   app.world.restart();app.load_section(index)
   play(app,room.puzzleRoutes[0].tape.slice(0,{46:18,37:8,38:3,39:9}[index]))
   check(app.sim.phase!=0 or app.sim.p.state=="climb" or app.sim.ents.any(func(e):return e.type=="zip" and e.state!="idle"),"interrupted puzzle has changed state: "+room.name)
   if death:app.sim.die()
   else:app.retry_room()
   play(app,[[70,""]])
   var reset=app.sim.phase==0 and app.sim.p.state not in ["dead","respawn","climb"] and app.sim.p.get("hook")==null and app.world.checkpoint_id==room.id
   reset=reset and app.sim.ents.all(func(e):return (e.type!="zip" or e.state=="idle" and e.x==e.ox and e.y==e.oy) and (e.type!="crumble" or not e.get("broken",false)) and (e.type not in ["pod","bell"] or e.timer==0))
   check(reset,("death" if death else "retry")+" restores the local puzzle: "+room.name)
 check(app.workshop_completed.is_empty(),"Fractured clears stay separate from workshop completion")
 app.queue_free();await process_frame
 print("FRACTURED WOODS THREE APP ","FAILED" if failed else "PASSED")
 quit(1 if failed else 0)
