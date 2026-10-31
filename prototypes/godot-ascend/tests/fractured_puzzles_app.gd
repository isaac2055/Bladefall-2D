extends SceneTree
const Main=preload("res://main.tscn")
const Codec=preload("res://authoring/codec.gd")
const Authoring=preload("res://scripts/authoring_data.gd")
var failed=false
var app
func check(ok,label):
 print("PASS " if ok else "FAIL ",label);failed=failed or not ok
func _initialize():run.call_deferred()
func goal(c):
 var g=c.room.def.puzzleGoal
 return c.p.onGround and Rect2(g[0],g[1]-2,g[2],g[3]+4).has_point(Vector2(c.p.x+4,c.p.y+11))
func play(parts):
 app.journey=[];app.journey_frame=0
 for part in parts:
  for f in range(int(part[0])):app.journey.append(part[1])
 for f in range(app.journey.size()):app._physics_process(1.0/60.0)
func restored(c):
 return c.p.carrying==null and c.ents.all(func(e):return (e.type!="slide" or e.x==e.ox and e.y==e.oy) and (e.type!="zip" or e.state=="idle" and e.x==e.ox and e.y==e.oy)) and (not c.room.def.id.ends_with("door-shut") or c.ents.any(func(e):return e.type=="plate" and e.down) and c.ents.any(func(e):return e.type=="held" and not e.solid) and c.ents.filter(func(e):return e.type=="lantern").size()==1)
func run():
 var source=JSON.parse_string(FileAccess.get_file_as_string("res://data/world21.json"))
 var prior=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/fractured-outskirts-v028-preservation.json"))
 for i in range(38):
  var r=source.world.rooms[i].duplicate(true)
  if r.id in ["cl21-bank-f63","cl21-atlas-crossroads"]:r.erase("atlasSockets")
  if r.id=="cl21-atlas-crossroads":r.erase("atlasMain")
  check(Codec.fingerprint(r)==prior.rooms[r.id],"retained definition preserved except the two documented end links: "+r.id)
 for id in prior.tapes:check(Codec.fingerprint(source.world.tapes[id])==prior.tapes[id],"old recording unchanged: "+id)
 for s in prior.sections:
  var now=source.world.sections.filter(func(q):return q.room==s.room)[0]
  check(now==s if s.room!="cl21-atlas-crossroads" else now.x==462 and now.y==-200 and now.fire==s.fire,"prior placement preserved or junction moved after new rooms: "+s.room)
 var meta=source.world.duplicate(true)
 for key in ["rooms","tapes","sections","requiredMainRooms"]:meta.erase(key)
 check(Codec.fingerprint(meta)==prior.worldMetadata,"quests, optional spaces, rewards and other chapter metadata preserved")
 check(Codec.fingerprint(source.constants)==prior.constants and Codec.fingerprint(source.playerDefaults)==prior.playerDefaults,"movement constants and player defaults preserved")
 check(source.world.requiredMainRooms.slice(0,14)==prior.requiredMainRooms and source.world.requiredMainRooms.size()==17,"three additions follow the fourteen required challenges")
 var native=load("res://levels/world21.tscn").instantiate();var baseline=Authoring.baseline(source)
 check(native.get_node("Rooms").get_child_count()==41 and Codec.first_difference(baseline,native.compile_into(baseline))=="","41 editable native rooms compile exactly to source")
 check(native.validate_data(native.compile_into(baseline)).is_empty(),"new native chapter validation")
 native.free()
 app=Main.instantiate();app.test_mode=true;app.initial_world=21;root.add_child(app);await process_frame;app.set_physics_process(false)
 check(app.room_picker.item_count==41,"chapter picker exposes all three appended rooms")
 for i in range(38,41):
  app.watch=false;app.load_section(i)
  var room=source.world.rooms[i];var deaths=app.sim.deaths
  if i>38:check(app.notice_label.text=="" and app.notice_time==0,"previous-room hint cleared on room selection")
  check(app.puzzle_hint_button.visible and app.bearing_caption().contains(room.question),"question appears without revealing the full route: "+room.name)
  app.show_workshop_hint();check(app.notice_label.text==room.hint,"optional detailed hint: "+room.name)
  play(room.puzzleRoutes[0].tape)
  check(goal(app.sim) and app.sim.deaths==deaths,"actual live controller clear: "+room.name)
  check(app.world.checkpoint_id==room.id,"separate room checkpoint: "+room.name)
  app.retry_room();play([[60,""]]);check(restored(app.sim),"retry restores this puzzle: "+room.name)
  app.toggle_watch();deaths=app.sim.deaths
  var found=false
  for f in range(app.tape.size()):
   app._physics_process(1.0/60.0);found=found or goal(app.sim)
   if app.sim.exited:break
  check(found and app.sim.exited and app.sim.deaths==deaths,"actual Watch reference reaches physical exit: "+room.name)
  app.toggle_watch();app.retry_room();play([[60,""]])
  check(restored(app.sim),"retry after Watch restores live puzzle state: "+room.name)
  for death in [false,true]:
   app.load_section(i);play(room.puzzleRoutes[0].tape.slice(0,[10,2,25][i-38]));play([[2,""]])
   var modified=app.sim.ents.any(func(e):return e.type=="slide" and e.y!=e.oy or e.type=="zip" and e.x!=e.ox) or app.sim.p.carrying!=null
   check(modified,"reset begins from modified machinery or held cargo: "+room.name)
   if death:app.sim.die()
   else:app.retry_room()
   play([[70,""]]);check(restored(app.sim) and app.sim.p.state not in ["dead","respawn"],("death" if death else "retry")+" restores unfinished puzzle: "+room.name)
 check(app.workshop_completed.is_empty(),"campaign references do not award workshop completions")
 app.queue_free();await process_frame
 print("FRACTURED PUZZLES APP ","FAILED" if failed else "PASSED");quit(1 if failed else 0)
