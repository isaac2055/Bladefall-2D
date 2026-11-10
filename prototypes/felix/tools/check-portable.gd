extends SceneTree
## Restore a real browser/Android export through the shipped native data and save codec.
const Save=preload("res://scripts/felix_save.gd")
const Transfer=preload("res://scripts/save_transfer.gd")
const World=preload("res://scripts/world.gd")
const Run=preload("res://scripts/sampler_run.gd")
func _initialize(): run.call_deferred()
func run():
 var args=OS.get_cmdline_user_args()
 if args.is_empty(): push_error("Pass a portable Felix save path");quit(1);return
 var target="user://portable-qa-%d"%OS.get_process_id()
 DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(target))
 var result=Transfer.import_bundle(FileAccess.get_file_as_string(args[0]),target)
 if result!="": push_error(result);quit(1);return
 Save.directory=target
 var n=1
 var world=World.new(JSON.parse_string(FileAccess.get_file_as_string("res://data/world%d.json"%n)))
 var story=preload("res://scripts/felix_story.gd").new(world)
 var tracker=Run.new(target.path_join("felix-garden.json"))
 var ok=Save.restore(world,story,tracker)
 print("RESTORED ",world.active_id," gifts=",story.gifts," phase=",story.phase," position=",world.position())
 if args.has("--legs") and not story.gifts.legs: push_error("Touch journey did not acquire legs");quit(1);return
 if not ok or story.phase!="play" or world.active().p.state=="dead": push_error("Portable checkpoint did not restore live gameplay");quit(1);return
 print("PASS portable Felix checkpoint restored on ",Engine.get_version_info().string)
 world.shutdown()
 for name in DirAccess.get_files_at(target): DirAccess.remove_absolute(ProjectSettings.globalize_path(target.path_join(name)))
 DirAccess.remove_absolute(ProjectSettings.globalize_path(target))
 quit()
