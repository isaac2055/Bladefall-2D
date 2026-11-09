extends SceneTree
const World=preload("res://scripts/world.gd")
const Run=preload("res://scripts/sampler_run.gd")
const Save=preload("res://scripts/world_save.gd")
const Reveal=preload("res://scripts/passage_reveal.gd")
var failures=0
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 if not ok: failures+=1
func _initialize(): run.call_deferred()
func run():
 var path="user://passage-reveal-%d.json"%OS.get_process_id()
 for n in [1,2,3,23]:
  var data=JSON.parse_string(FileAccess.get_file_as_string("res://data/world%d.json"%n))
  var world=World.new(data)
  var tracker=Run.new(path)
  var signature=world.content_signature
  for id in world.road_base:
   var patches=world.parsed[id].def.get("roadExit",[])
   if patches.is_empty(): continue
   world.enter(id,true);tracker.start(world)
   world.campaign_completed[id]=true;tracker.profile.mark_clear(id)
   var origin=Vector2i(world.placements[id]/8)
   var old=[]
   for patch in patches: old.append(world.cells.get(origin+Vector2i(patch[0],patch[1]),0))
   world.open_road_exit(id,true)
   var state=world.road_opening[id]
   var unchanged=true;var safe=true
   for i in range(patches.size()):
    var cell=Vector2i(patches[i][0],patches[i][1])
    unchanged=unchanged and Reveal.visual_value(world,id,cell,world.cells.get(origin+cell,0))==old[i]
    safe=safe and world.cells[origin+cell]==patches[i][2]
   check(unchanged and safe,"completion retains the old image while making the earned route safe: "+id)
   for frame in range(12): Reveal.tick(world)
   var first=state.changes[0].cell.x*8
   var last=state.changes[-1].cell.x*8
   check(Reveal.phase(state,first)>0 and Reveal.phase(state,last)==0,"reveal travels from the flag toward the next doorway")
   var prior_age=state.age
   world.open_road_exit(id,true)
   check(state.age==prior_age,"standing on the flag does not restart the reveal")
   check(Save.write(world,tracker),"mid-reveal save writes")
   var restored=World.new(data)
   var restored_tracker=Run.new(path)
   check(Save.restore(restored,restored_tracker) and restored.road_opened.has(id) and restored.road_opening.is_empty(),"resume settles the earned passage without replay or transport")
   check(restored.checkpoint_id==id and restored_tracker.profile.run.eligible and restored_tracker.result.is_empty(),"individual checkpoint and scoring eligibility survive")
   restored.shutdown()
   for frame in range(80): Reveal.tick(world)
   check(world.road_opening.is_empty() and world.content_signature==signature,"animation retires without changing the layout fingerprint")
   Save.clear(tracker.profile,n)
  world.restart()
  check(world.road_opened.is_empty() and world.road_opening.is_empty(),"new run restores every original puzzle and closed exit")
  world.shutdown()
 DirAccess.remove_absolute(ProjectSettings.globalize_path(path))
 print("PASSAGE REVEAL FAILURES ",failures)
 quit(1 if failures else 0)
