extends SceneTree
## Integration coverage for the revised Catch and three new Fractured rooms.
const Main=preload("res://main.tscn")
const C=preload("res://authoring/codec.gd")
const A=preload("res://scripts/authoring_data.gd")
var failed=false
func _initialize():run.call_deferred()
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 failed=failed or not ok
func goal(c):
 var g=c.room.def.puzzleGoal
 return c.p.state not in ["dead","respawn"] and c.p.onGround and Rect2(g[0],g[1]-2,g[2],g[3]+4).has_point(Vector2(c.p.x+4,c.p.y+11))
func play(app,tape):
 app.journey=[];app.journey_frame=0
 for part in tape:
  for f in range(int(part[0])):app.journey.append(part[1])
 for f in range(app.journey.size()):app._physics_process(1.0/60.0)
func run():
 var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/world21.json"))
 var before=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/fractured-nine-preservation.json"))
 for room in d.world.rooms:
  if before.rooms.has(room.id):
   check(C.fingerprint(room)==before.rooms[room.id],"accepted room preserved: "+room.id)
   check(C.fingerprint(d.world.tapes.get(room.id,[]))==before.tapes[room.id],"accepted recording preserved: "+room.id)
 for section in before.sections:
  check(d.world.sections.filter(func(s):return s.room==section.room)[0]==section,"accepted placement preserved: "+section.room)
 check(C.fingerprint(d.constants)==before.constants and C.fingerprint(d.playerDefaults)==before.defaults,"movement settings unchanged")
 check(d.world.requiredMainRooms.slice(0,before.required.size())==before.required,"previous required road retained")
 var args=OS.get_cmdline_user_args()
 var source_root=args[0] if not args.is_empty() else "res://"
 check(FileAccess.get_sha256(source_root.path_join("levels/world1.tscn"))==before.world1,"user World 1 scene untouched")
 var base=A.baseline(d)
 var native=load("res://levels/world21.tscn").instantiate()
 check(C.first_difference(base,native.compile_into(base))=="" and native.validate_data(native.compile_into(base)).is_empty(),"native rooms compile exactly and validate")
 native.free()
 var app=Main.instantiate();app.test_mode=true;app.initial_world=21;root.add_child(app);await process_frame;app.set_physics_process(false)
 for index in [42,44,45,46]:
  app.world.restart();app.watch=false;app.load_section(index)
  var room=d.world.rooms[index]
  check(app.room_picker.get_selected_id()==index and app.puzzle_hint_button.visible,"menu and hint expose "+room.name)
  app.show_workshop_hint();check(app.notice_label.text==room.hint,"authored hint "+room.name)
  play(app,room.puzzleRoutes[0].tape)
  check(goal(app.sim) and app.sim.deaths==0 and app.world.checkpoint_id==room.id,"actual deathless live clear and independent checkpoint: "+room.name)
  app.toggle_watch()
  var observed=false;var core=app.sim
  for f in range(app.tape.size()):
   app._physics_process(1.0/60.0);observed=observed or goal(core)
   if core.exited:break
  check(observed and core.exited and core.deaths==0,"Watch reaches actual exit: "+room.name)
  app.toggle_watch();app.retry_room()
  check(app.sim.ents.filter(func(e):return e.type in ["slide","zip"]).all(func(e):return e.x==e.ox and e.y==e.oy and (e.type!="zip" or e.state=="idle")),"retry restores stone pose: "+room.name)
  play(app,room.puzzleRoutes[0].tape.slice(0,7))
  app.sim.die();play(app,[[70,""]])
  check(app.sim.p.state not in ["dead","respawn"] and app.sim.ents.filter(func(e):return e.type in ["slide","zip"]).all(func(e):return e.x==e.ox and e.y==e.oy and (e.type!="zip" or e.state=="idle")),"death restores initial stone: "+room.name)
 check(app.workshop_completed.is_empty(),"Fractured clears do not award workshop practice")
 app.queue_free();await process_frame
 print("FRACTURED NINE APP ","FAILED" if failed else "PASSED")
 quit(1 if failed else 0)
