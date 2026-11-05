extends SceneTree
## Tests are intentionally excluded from the shipping PCK. Supply only test inputs,
## never game scripts/data/scenes, as an overlay when checking the shipped game.
var pack=PCKPacker.new()
var added=0
func include_tree(path):
 for name in DirAccess.get_directories_at(path):include_tree(path.path_join(name))
 for name in DirAccess.get_files_at(path):
  if name.ends_with(".uid") or name.ends_with(".import"):continue
  var resource=path.path_join(name)
  assert(resource.begins_with("res://tests/"))
  assert(pack.add_file(resource,ProjectSettings.globalize_path(resource))==OK)
  added+=1
func _initialize():
 var args=OS.get_cmdline_user_args()
 assert(not args.is_empty())
 assert(pack.pck_start(args[0])==OK)
 include_tree("res://tests")
 assert(pack.flush()==OK)
 print("TEST OVERLAY READY · ",added," test-only files")
 quit()
