extends SceneTree
const World=preload("res://scripts/world.gd")
const Run=preload("res://scripts/sampler_run.gd")
const StorySave=preload("res://scripts/felix_save.gd")
const WorldSave=preload("res://scripts/world_save.gd")
const Transfer=preload("res://scripts/save_transfer.gd")
func _initialize(): run.call_deferred()
func run():
 var folder="user://felix-capacity-qa-%d"%OS.get_process_id()
 var target=folder+"-import"
 for dir in [folder,target]: DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(dir))
 StorySave.directory=folder
 for n in [1,2,3,21,22,23,101,102,103]:
  var world=World.new(JSON.parse_string(FileAccess.get_file_as_string("res://data/world%d.json"%n)))
  var tracker=Run.new(folder.path_join("felix-garden.json"))
  tracker.start(world)
  if n<21:
   var script=[preload("res://scripts/felix_story.gd"),preload("res://scripts/woods_story.gd"),preload("res://scripts/phantom_story.gd")][n-1]
   var story=script.new(world)
   StorySave.write_payload(StorySave.capture(world,story,tracker))
  else: WorldSave.write(world,tracker)
  tracker.profile.save_profile()
  world.shutdown()
 var bundle=Transfer.export_bundle(folder)
 print("ALL NINE CHECKPOINTS ",bundle.length()," bytes; limit ",Transfer.LIMIT)
 var error=Transfer.import_bundle(bundle,target)
 if error!="": push_error(error)
 print("PASS all nine routes fit and import together" if error=="" else "FAIL full collection cannot import")
 for dir in [folder,target]:
  for name in DirAccess.get_files_at(dir): DirAccess.remove_absolute(ProjectSettings.globalize_path(dir.path_join(name)))
  DirAccess.remove_absolute(ProjectSettings.globalize_path(dir))
 quit(0 if error=="" else 1)
