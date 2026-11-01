extends SceneTree
const Main=preload("res://main.tscn")
const C=preload("res://authoring/codec.gd")
const A=preload("res://scripts/authoring_data.gd")
const Rope=preload("res://scripts/rope_devices.gd")
var failed=false
var app
func _initialize():run.call_deferred()
func check(ok,label):
 print("PASS " if ok else "FAIL ",label);failed=failed or not ok
func normalized(r):
 r=r.duplicate(true)
 if r.id=="cl21-atlas-crossroads":
  for k in ["to","toFloor"]:r.atlasMain.erase(k);r.atlasSockets[0].erase(k)
 return r
func play(parts):
 app.journey=[];app.journey_frame=0
 for part in parts:
  for f in range(int(part[0])):app.journey.append(part[1])
 for f in range(app.journey.size()):app._physics_process(1.0/60.0)
func at_goal(c):
 var g=c.room.def.puzzleGoal
 return c.p.onGround and Rect2(g[0],g[1]-2,g[2],g[3]+4).has_point(Vector2(c.p.x+4,c.p.y+11))
func restored(c,index):
 if c.p.get("hook")!=null or c.p.state in ["dead","respawn"] or c.p.dashes!=1:return false
 if index==41:return c.ents.filter(func(e):return e.type=="crumble").all(func(e):return not e.get("broken",false) and e.get("shaking",0)==0)
 if index==42:
  var e=c.ents.filter(func(e):return e.type=="hookCarrier")[0];var point=Rope.point(e)
  return e.clock<100 and abs(e.x+e.remX-point.x)<.00001 and abs(e.y+e.remY-point.y)<.00001
 return c.ents.filter(func(e):return e.type=="zip").all(func(e):return e.state=="idle" and e.x==e.ox and e.y==e.oy)
func run():
 var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/world21.json"));var prior=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/next-fractured-preservation.json"))
 for r in d.world.rooms:
  if prior.rooms.has(r.id):check(C.fingerprint(normalized(r))==prior.rooms[r.id],"old room preserved except the documented junction incoming link: "+r.id)
 for id in prior.tapes:check(C.fingerprint(d.world.tapes[id])==prior.tapes[id],"prior recording preserved: "+id)
 for before in prior.sections:
  var now=d.world.sections.filter(func(s):return s.room==before.room)[0]
  check(now==before if before.room!="cl21-atlas-crossroads" else now.x==710 and now.y==-224 and now.fire==before.fire,"prior placement preserved or junction moved after the additions: "+before.room)
 var meta=d.world.duplicate(true)
 for k in ["rooms","tapes","sections","requiredMainRooms"]:meta.erase(k)
 check(C.fingerprint(meta)==prior.metadata and C.fingerprint(d.constants)==prior.constants and C.fingerprint(d.playerDefaults)==prior.defaults,"quests, optional spaces, rewards and movement settings preserved")
 check(d.world.requiredMainRooms.slice(0,17)==prior.required and d.world.requiredMainRooms.size()==20,"three separate challenges follow the existing seventeen")
 var native=load("res://levels/world21.tscn").instantiate();var base=A.baseline(d)
 check(native.get_node("Rooms").get_child_count()==44 and C.first_difference(base,native.compile_into(base))=="" and native.validate_data(native.compile_into(base)).is_empty(),"44 editable native rooms validate and compile exactly to source");native.free()
 app=Main.instantiate();app.test_mode=true;app.initial_world=21;root.add_child(app);await process_frame;app.set_physics_process(false)
 check(app.room_picker.item_count==31 and [41,42,43].all(func(i):return app.room_picker.get_item_index(i)>=0),"named section selector exposes all three additions")
 for i in range(41,44):
  app.world.restart();app.watch=false;app.load_section(i);var room=d.world.rooms[i];var deaths=app.sim.deaths
  check(app.puzzle_hint_button.visible and app.bearing_caption().contains(room.question),"optional hint and question: "+room.name)
  app.show_workshop_hint();check(app.notice_label.text==room.hint,"current authored hint: "+room.name)
  play(room.puzzleRoutes[0].tape)
  check(at_goal(app.sim) and app.sim.deaths==deaths and app.world.checkpoint_id==room.id,"actual live controller clear with independent checkpoint: "+room.name)
  app.toggle_watch();deaths=app.sim.deaths;var found=false
  for f in range(app.tape.size()):
   app._physics_process(1.0/60.0);found=found or at_goal(app.sim)
   if app.sim.exited:break
  check(found and app.sim.exited and app.sim.deaths==deaths,"complete Watch reference reaches the real exit: "+room.name)
  app.toggle_watch();app.retry_room();play([[70,""]]);check(restored(app.sim,i),"retry after Watch restores live machinery: "+room.name)
  if i==42:
   var carrier=app.sim.ents.filter(func(e):return e.type=="hookCarrier")[0]
   play([[posmod(-int(carrier.clock),int(carrier.period)),""]])
  deaths=app.sim.deaths;play(room.puzzleRoutes[0].tape)
  check(at_goal(app.sim) and app.sim.deaths==deaths,"complete live clear after retry: "+room.name)
  for death in [false,true]:
   app.world.restart();app.load_section(i);play(room.puzzleRoutes[0].tape.slice(0,[11,3,20][i-41]))
   var modified=app.sim.ents.any(func(e):return e.type=="crumble" and e.get("broken",false) or e.type=="zip" and e.state=="back") or app.sim.p.get("hook")!=null
   check(modified,"interrupted puzzle has changed machinery or an attached rope: "+room.name)
   if death:app.sim.die()
   else:app.retry_room()
   play([[70,""]]);check(restored(app.sim,i),("death" if death else "retry")+" clears the interrupted state: "+room.name)
 check(app.workshop_completed.is_empty(),"campaign references do not award workshop completions")
 app.queue_free();await process_frame;print("NEXT FRACTURED APP ","FAILED" if failed else "PASSED");quit(1 if failed else 0)
