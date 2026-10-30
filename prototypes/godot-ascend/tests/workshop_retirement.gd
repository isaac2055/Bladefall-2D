extends SceneTree
const Codec=preload("res://authoring/codec.gd")
const Authoring=preload("res://scripts/authoring_data.gd")
const Main=preload("res://main.tscn")
const RETIRED=["workshop-stored-rise","workshop-turned-span","workshop-loaded-span"]
var failed=false
func _initialize():run.call_deferred()
func check(ok,label):
 print("PASS " if ok else "FAIL ",label);failed=failed or not ok
func run():
 var source=JSON.parse_string(FileAccess.get_file_as_string("res://data/world4.json"))
 var old=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/workshop-v025-editor.json"))
 var hashes=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/workshop-v025-hashes.json"))
 var expected=old.rooms.filter(func(r):return r.id not in RETIRED).map(func(r):return r.id)
 expected.append_array(["workshop-root-stop","workshop-two-canopies","workshop-root-ferry","workshop-move-the-weight","workshop-temporary-dock"])
 expected.append_array(["workshop-load-lift","workshop-descending-invitation","workshop-missing-root","workshop-midair-landing","workshop-spring-stone","workshop-return-launch"])
 check(source.world.rooms.map(func(r):return r.id)==expected,"retained nineteen IDs stay in order, followed by eleven additions")
 var counts={"outskirts":0,"woods":0,"causeway":0}
 for room in source.world.rooms:
  counts[room.get("workshopBiome","outskirts")]+=1
  if hashes.has(room.id):check(Codec.fingerprint(room)==hashes[room.id],"retained geometry, settings and recordings unchanged: "+room.name)
 check(counts=={"outskirts":10,"woods":10,"causeway":10},"distribution is ten rooms in each biome")
 for id in RETIRED:
  check(id in source.world.retiredWorkshopRoomIds and not source.world.tapes.has(id) and not source.world.sections.any(func(s):return s.room==id),"retired metadata excludes active tape and section: "+id)
 var native=load("res://levels/world4.tscn").instantiate()
 check(native.get_node("Rooms").get_child_count()==30 and Codec.first_difference(Authoring.baseline(source),native.compile_into(Authoring.baseline(source)))=="","native chapter preserves the original twenty-four and adds six rooms")
 native.free()
 var app=Main.instantiate();app.test_mode=true;app.initial_world=4;root.add_child(app);await process_frame;app.set_physics_process(false)
 check(app.room_picker.item_count==30 and app.world.data.world.rooms.map(func(r):return r.id)==expected,"actual application picker and gameplay use only the retained rooms")
 app.load_section(13);check(app.sim.room.id=="workshop-borrowed-bridge","Causeway puzzle launcher index reaches Bridge You Must Remove")
 app.load_section(16);check(app.sim.room.id=="workshop-spent-landing","dash puzzle launcher index reaches Landing You Must Spend")
 app.queue_free();await process_frame
 print("WORKSHOP RETIREMENT ","FAILED" if failed else "PASSED");quit(1 if failed else 0)
