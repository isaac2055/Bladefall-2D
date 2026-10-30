extends SceneTree
## Reproduce discovered shortcuts in their original drafts before checking revisions.
const R=preload("res://tests/workshop_routes.gd")
func _initialize():
 var args=OS.get_cmdline_user_args()
 var data=JSON.parse_string(FileAccess.get_file_as_string(args[0] if not args.is_empty() else "res://data/world4.json"))
 var cases=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/five-puzzle-bypasses.json"))
 var failed=false
 for item in cases:
  var old=data.duplicate(true);old.world.rooms[int(item.index)]=item.room.duplicate(true)
  old.world.rooms[int(item.index)].workshopGoal=item.goal
  var positive=R.play(old,int(item.index),item.tape,item.mode)
  var revised=data.duplicate(true)
  if item.get("intermediate",false):revised.world.rooms[int(item.index)].workshopGoal=item.get("revisedGoal",item.goal)
  var negative=R.play(revised,int(item.index),item.tape,item.mode)
  var ok=positive.finish and positive.deaths==0 and not negative.finish
  print("PASS " if ok else "FAIL ",item.label," · original finish=",positive.finish," revised finish=",negative.finish)
  failed=failed or not ok
 quit(1 if failed else 0)
