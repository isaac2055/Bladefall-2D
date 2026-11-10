extends SceneTree
const World=preload("res://scripts/world.gd")
const Run=preload("res://scripts/sampler_run.gd")
const Save=preload("res://scripts/world_save.gd")
var failures=0
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 if not ok: failures+=1
func _initialize(): run.call_deferred()
func run():
 var profile_path="user://felix-challenge-save-qa-%d.json"%OS.get_process_id()
 for n in [21,22,23,101,102,103]:
  var source=JSON.parse_string(FileAccess.get_file_as_string("res://data/world%d.json"%n))
  var world=World.new(source)
  var tracker=Run.new(profile_path)
  tracker.start(world)
  for f in range(20): world.step({});world.update_region();tracker.tick(world)
  var player=world.active().p.duplicate(true)
  var frame=world.active().frame
  check(Save.write(world,tracker),"challenge %d writes its checkpoint"%n)
  var restored=World.new(source)
  var restored_tracker=Run.new(profile_path)
  check(Save.restore(restored,restored_tracker),"challenge %d resumes"%n)
  check(restored.active_id==world.active_id and restored.checkpoint_id==world.checkpoint_id,"challenge %d individual checkpoint retained"%n)
  check(restored.active().p==player and restored.active().frame==frame,"challenge %d exact actor and machinery clock retained"%n)
  check(restored_tracker.profile.run==tracker.profile.run,"challenge %d active score retained"%n)
  restored_tracker.profile.garden(restored_tracker.profile.home(n)).top=true
  restored_tracker.profile.garden(restored_tracker.profile.home(n)).core=true
  restored_tracker.start(restored,true,true)
  check(restored_tracker.carrying(),"challenge %d earned carry mode starts"%n)
  check(Save.write(restored,restored_tracker),"challenge %d stores carry restart marker"%n)
  check(Save.restore(restored,restored_tracker) and not restored_tracker.carrying() and restored.frames==0,"challenge %d carry resume restarts the full route"%n)
  Save.clear(restored_tracker.profile,n)
  restored.shutdown()
  world.shutdown()
 DirAccess.remove_absolute(ProjectSettings.globalize_path(profile_path))
 print("CHALLENGE SAVE FAILURES ",failures)
 quit(1 if failures else 0)
