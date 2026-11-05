extends SceneTree
## Loaded by absolute filename alongside --main-pack. Mount excluded test fixtures
## before compiling the selected test, then let its normal _initialize run.
func _init():
 var overlay=OS.get_environment("ASCEND_TEST_OVERLAY")
 var script_path=OS.get_environment("ASCEND_TEST_SCRIPT")
 if overlay=="" or not ProjectSettings.load_resource_pack(overlay):
  push_error("Cannot mount the test-only overlay")
  quit(1);return
 if not script_path.begins_with("res://tests/"):
  push_error("Expected a test script resource")
  quit(1);return
 var selected=load(script_path)
 if selected==null:
  push_error("Cannot load selected packaged test")
  quit(1);return
 print("PACKAGED TEST STARTED · ",script_path)
 set_script(selected)
