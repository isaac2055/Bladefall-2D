extends SceneTree
## Used by check-web.mjs with an actual browser download, not a synthetic save.
const Transfer=preload("res://scripts/save_transfer.gd")
const World=preload("res://scripts/world.gd")
const Run=preload("res://scripts/sampler_run.gd")
const Save=preload("res://scripts/world_save.gd")
func _initialize(): run.call_deferred()
func run():
 var args=OS.get_cmdline_user_args()
 var folder="user://web-native-transfer-%d"%OS.get_process_id()
 DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(folder))
 var error=Transfer.import_bundle(FileAccess.get_file_as_string(args[0]),folder)
 if error!="": print("FAIL ",error);quit(1);return
 var sampler=Run.new(folder.path_join(Transfer.PROFILE))
 var world=World.new(JSON.parse_string(FileAccess.get_file_as_string("res://data/world1.json")))
 if not Save.restore(world,sampler) or not sampler.profile.run.eligible or sampler.profile.run.frames<60: print("FAIL browser checkpoint cannot resume natively");quit(1);return
 print("PASS browser checkpoint resumes natively, room ",world.active_id," frames ",sampler.profile.run.frames," deaths ",sampler.profile.run.deaths)
 var config=ConfigFile.new()
 config.load(folder.path_join("prototype-settings.cfg"));config.set_value("display","reduced_motion",true);config.save(folder.path_join("prototype-settings.cfg"))
 var file=FileAccess.open(args[1],FileAccess.WRITE);file.store_string(Transfer.export_bundle(folder));file.close()
 world.shutdown()
 for name in DirAccess.get_files_at(folder): DirAccess.remove_absolute(ProjectSettings.globalize_path(folder.path_join(name)))
 DirAccess.remove_absolute(ProjectSettings.globalize_path(folder))
 quit()
