extends SceneTree
## Play the actual saved workshop through the application with ordinary inputs.
const Main=preload("res://main.tscn")
const Authoring=preload("res://scripts/authoring_data.gd")
const Codec=preload("res://authoring/codec.gd")
var app
var failed=false
var results=[]
var output=""
func _initialize(): run.call_deferred()
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 results.append({"pass":bool(ok),"label":label})
 failed=failed or not ok
func goal(): return app.workshop_goal_reached()
func key(code):
 var event=InputEventKey.new()
 event.physical_keycode=code
 event.keycode=code
 event.pressed=true
 app._unhandled_input(event)
func route(index,parts):
 app.watch=false
 app.load_section(index)
 app.journey=[]
 app.journey_frame=0
 for part in parts:
  for i in range(int(part[0])): app.journey.append(part[1])
 var uses=0
 var was_used=false
 var crumble=false
 var moving_cling=false
 var far_rest=false
 var boosted=false
 var advanced=false
 var dash_starts=0
 for f in range(app.journey.size()):
  app._physics_process(1.0/60.0)
  var core=app.sim
  if "dash-start" in core.events: dash_starts+=1
  for kind in ["super","hyper","wallbounce","ultra"]: advanced=advanced or kind in core.events
  for e in core.ents:
   if e.type=="refill":
    var used=e.timer>0
    if used and not was_used: uses+=1
    was_used=used
   elif e.type=="crumble": crumble=crumble or e.get("broken",false)
   elif e.type=="zip":
    moving_cling=moving_cling or (core.p.state=="climb" and e.state=="go" and e.x>e.ox+32)
  boosted=boosted or core.p.vy< -190
  far_rest=far_rest or (index==5 and core.p.onGround and core.p.x>=200 and core.p.y<100)
 app.journey=[]
 app.journey_frame=0
 return {"finish":goal(),"deaths":app.sim.deaths,"refill_uses":uses,"crumble":crumble,"moving_cling":moving_cling,"boosted":boosted,"far_rest":far_rest,"advanced":advanced,"dash_starts":dash_starts}
func shot(name):
 if output=="" or DisplayServer.get_name()=="headless": return
 app.banner_time=0
 app.room_banner.modulate.a=0
 app.notice_time=0
 app.notice_label.modulate.a=0
 app.landscape._process(1.0/60.0)
 await process_frame
 await RenderingServer.frame_post_draw
 root.get_texture().get_image().save_png(output+"/"+name+".png")
func run():
 if not OS.get_cmdline_user_args().is_empty():
  output=OS.get_cmdline_user_args()[0]
  DirAccess.make_dir_recursive_absolute(output)
 var source=JSON.parse_string(FileAccess.get_file_as_string("res://data/world4.json"))
 var scene=load("res://levels/world4.tscn").instantiate()
 var base=Authoring.baseline(source)
 var compiled=scene.compile_into(base)
 check(Codec.first_difference(base,compiled)=="","six-room native scene round trip preserves all authored data")
 check(scene.validate_data(compiled).is_empty(),"native scene validates")
 scene.free()
 app=Main.instantiate()
 app.initial_world=4
 app.test_mode=true
 root.add_child(app)
 await process_frame
 app.set_physics_process(false)
 check(app.chapter_number==4 and app.current==0 and app.world.regions.size()==6,"direct launch starts workshop without campaign progress")
 check(app.workshop_controls.visible and app.room_picker.item_count==6,"every room and workshop navigation immediately available")
 check(app.watch_button.text=="Watch solution","workshop offers an optional solution replay")
 check(app.world.data.constants==app.chapters[1].world.data.constants,"ordinary Outskirts movement constants unchanged")
 var outskirts=app.chapters[1].world.data.duplicate(true)
 for i in range(6):
  app.load_section(i)
  app.landscape._process(1.0/60.0)
  check(app.world.active_id==source.world.rooms[i].id and not goal(),"direct room access and distinct start: "+source.world.rooms[i].name)
  check(app.landscape.camera_float==app.world.placements[app.world.active_id],"whole puzzle visible at rest: "+source.world.rooms[i].name)
  await shot("room-%d-start"%(i+1))
  var proof=route(i,source.world.tapes[source.world.rooms[i].id])
  check(proof.finish and proof.deaths==0,"ordinary-input deathless solution: "+source.world.rooms[i].name)
  check(not proof.advanced,"no advanced movement required: "+source.world.rooms[i].name)
  if i==0: check(proof.dash_starts==1,"Keep Something Back saves its single dash for the crossing")
  if i==1: check(proof.refill_uses==1 and proof.dash_starts==2,"Below the Answer uses the crystal and redirects upward")
  if i==2: check(proof.crumble,"Let the Road Fall opens the lower route by collapsing the bridge")
  if i==3: check(proof.boosted,"Borrowed Height actually inherits upward lift momentum")
  if i==4: check(proof.moving_cling,"The Other Side actually rides by clinging to the moving lift")
  if i==5: check(proof.refill_uses==2 and proof.far_rest,"Return Ticket rests across the room and reuses the same crystal")
  await shot("room-%d-finish"%(i+1))
 check(app.workshop_completed.size()==6,"all six player finishes recorded")
 # Failed plans remain failures; these are not merely wider obstacle courses.
 var spent=route(0,[[5,"lux"],[10,"l"],[125,"lgu"],[12,"rj"],[5,"rux"],[50,"r"]])
 check(not spent.finish,"spending the dash on the approach does not complete Keep Something Back")
 var straight=route(1,[[20,"rj"],[5,"rx"],[60,"r"]])
 check(not straight.finish,"following the crystal horizontally does not solve Below the Answer")
 var rushing=route(2,[[120,"r"],[30,""]])
 check(not rushing.finish,"rushing across the cracked road leaves the player above the required lower route")
 var late=route(3,[[30,"r"],[45,""],[25,"rj"],[5,"rux"],[30,"r"]])
 check(not late.finish,"jumping after the lift's momentum expires cannot reach Borrowed Height's landing")
 var top=route(4,[[22,"rj"],[55,"r"],[30,""]])
 check(not top.finish,"boarding on top cannot carry the player through The Other Side's arch")
 # Room selection resets machinery; retry preserves the player's completion tally.
 app.load_section(4)
 check(app.sim.ents.filter(func(e):return e.type=="zip")[0].state=="idle","reselecting a room resets its lift to the boarding position")
 key(KEY_H)
 check(app.notice_time>0 and app.notice_label.text==app.sim.room.def.hint,"H reveals a hint only on request")
 key(KEY_N)
 check(app.current==5 and not app.paused,"N selects the next room without a completion requirement")
 key(KEY_N)
 check(app.current==0,"next-room selection wraps back to the first room")
 app.retry_room()
 check(app.workshop_completed.size()==6 and not goal(),"retry returns to room spawn and retains completion tally")
 # Replays use the same spawn and physics, and do not award player completion.
 app.workshop_completed.clear()
 app.watch=true
 app.load_section(5)
 for f in range(app.tape.size()): app._physics_process(1.0/60.0)
 check(goal() and app.sim.deaths==0 and app.workshop_completed.is_empty(),"optional solution replay works without awarding player completion")
 app.toggle_watch()
 check(not app.watch and app.sim.world_context==app.world,"Take control returns the replay to live physics")
 app.restart_world()
 check(app.current==0 and app.workshop_completed.is_empty(),"Start world over resets the workshop")
 check(not "✓" in app.room_picker.get_item_text(0),"Start world over clears completed-room markers")
 check(Codec.first_difference(outskirts,app.chapters[1].world.data)=="","workshop play leaves the campaign's saved room data untouched")
 app.switch_chapter(1)
 check(app.chapter_number==1 and not app.workshop_controls.visible and app.watch_button.text=="Watch reference","campaign retains its ordinary interface")
 app.switch_chapter(4)
 app.set_paused(true)
 await shot("workshop-menu")
 if output!="":
  var file=FileAccess.open(output+"/checks.json",FileAccess.WRITE)
  file.store_string(JSON.stringify(results,"  "))
 print("WORKSHOP ","FAILED" if failed else "PASSED"," · ",results.size()," checks")
 await app.close_app(1 if failed else 0)
