extends SceneTree
## Fresh bounded search; lack of a solution is not a proof of impossibility.
const Search=preload("res://tests/woods_search.gd")
var failed=false
func _initialize():
 var data=JSON.parse_string(FileAccess.get_file_as_string("res://data/world4.json"))
 var bypasses=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/woods-consolidation-bypasses.json"))
 var results=[]
 for b in bypasses:
  var index=int(b.index)
  var former=data.duplicate(true);former.world.rooms[index]=b.room;former.world.rooms[index].workshopGoal=b.goal
  var positive=Search.solve(former,index,{"mode":"no_pods","budget":24000,"width":60,"depth":40})
  print("PASS " if positive.found else "FAIL ","fresh search finds the former shortcut: ",b.room.name)
  failed=failed or not positive.found
  var current=data.duplicate(true);current.world.rooms[index].workshopGoal=b.goal
  var negative=Search.solve(current,index,{"mode":"no_pods","budget":30000,"width":60,"depth":45})
  print("FAIL " if negative.found else "PASS ","pod-free approach search: ",b.room.name," · ",negative.nodes," branches", " · shortcut found" if negative.found else " · none found within budget")
  failed=failed or negative.found
  results.append({"room":b.room.id,"positive_control":positive,"current":negative})
 var args=OS.get_cmdline_user_args()
 if not args.is_empty():FileAccess.open(args[0],FileAccess.WRITE).store_string(JSON.stringify(results,"  "))
 quit(1 if failed else 0)
