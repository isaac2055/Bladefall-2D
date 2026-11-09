extends SceneTree
const Transfer=preload("res://scripts/save_transfer.gd")
const Profile=preload("res://scripts/run_profile.gd")
const Save=preload("res://scripts/world_save.gd")
const World=preload("res://scripts/world.gd")
const Run=preload("res://scripts/sampler_run.gd")
var failures=0
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 if not ok: failures+=1
func _initialize(): run.call_deferred()
func run():
 var directory="user://transfer-test-%d"%OS.get_process_id()
 DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(directory))
 var profile=Profile.new(directory.path_join(Transfer.PROFILE))
 profile.completed={"1":true};profile.garden(1).root=true;profile.save_profile()
 var world=World.new(JSON.parse_string(FileAccess.get_file_as_string("res://data/world1.json")))
 var sampler=Run.new(profile.path);sampler.start(world)
 world.active().deaths=3;sampler.profile.run.deaths=3
 check(Save.write(world,sampler),"checkpoint created")
 var original=Transfer.export_bundle(directory)
 var checkpoint=FileAccess.get_file_as_bytes(Save.path(profile,1))
 profile.completed={};profile.save_profile();Save.clear(profile,1)
 check(Transfer.import_bundle(original,directory)=="","valid portable bundle imports")
 var restored=Profile.new(profile.path)
 check(restored.completed.get("1",false) and restored.garden(1).root,"Garden rewards preserved")
 check(FileAccess.get_file_as_bytes(Save.path(profile,1))==checkpoint,"binary checkpoint survives byte for byte")
 check(Save.restore(world,sampler) and sampler.profile.run.deaths==3,"imported checkpoint resumes")
 var bundle=JSON.parse_string(original)
 bundle.files["../outside.json"]="eA=="
 check(Transfer.import_bundle(JSON.stringify(bundle),directory)!="","reject path traversal")
 bundle.files.erase("../outside.json")
 checkpoint[checkpoint.size()-1]^=255
 bundle.files[Transfer.PROFILE+".world-1.save"]=Marshalls.raw_to_base64(checkpoint)
 check(Transfer.import_bundle(JSON.stringify(bundle),directory)!="","reject corrupt checkpoint")
 check(Transfer.export_bundle(directory)==original,"invalid import leaves live saves untouched")
 bundle=JSON.parse_string(original);bundle.files.erase(Transfer.PROFILE+".world-1.save")
 check(Transfer.import_bundle(JSON.stringify(bundle),directory)=="" and not Save.exists(profile,1),"missing checkpoint clears stale local run")
 check(FileAccess.file_exists(directory.path_join("bladefall-before-import.json")),"prior save backup retained")
 world.shutdown()
 for name in DirAccess.get_files_at(directory): DirAccess.remove_absolute(ProjectSettings.globalize_path(directory.path_join(name)))
 DirAccess.remove_absolute(ProjectSettings.globalize_path(directory))
 print("SAVE TRANSFER FAILURES ",failures)
 quit(1 if failures else 0)
