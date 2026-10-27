extends SceneTree
## Fresh inputs after mechanic restrictions, not only replayed intended routes.
## Beam pruning and finite budgets limit the claim to the explored search space.
const Search=preload("res://tests/woods_search.gd")
var failed=false
func _initialize():
 var data=JSON.parse_string(FileAccess.get_file_as_string("res://data/world4.json"))
 var fixture=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/woods-workshop.json"))
 var former=data.duplicate(true);former.world.rooms[11]=fixture.bypasses[1].room
 var positive=Search.solve(former,11,{"mode":"permanent_crumble","budget":18000,"width":40,"depth":40})
 failed=not positive.found
 print("PASS " if positive.found else "FAIL ","fresh search finds a bypass in the former Hollow Landing")
 var results={"positive_control":positive,"cases":[]}
 for config in [[8,"no_pods"],[9,"no_bells"],[10,"no_pods"],[11,"permanent_crumble"],[11,"no_pods"],[15,"permanent_crumble"]]:
  var result=Search.solve(data,config[0],{"mode":config[1],"budget":24000,"width":40,"depth":40})
  results.cases.append({"room":data.world.rooms[config[0]].id,"mode":config[1],"result":result})
  print("FAIL " if result.found else "PASS ",data.world.rooms[config[0]].name," / ",config[1]," · ",result.nodes," branches", " · bypass found" if result.found else " · no bypass found within this search")
  failed=failed or result.found
 var args=OS.get_cmdline_user_args()
 if not args.is_empty():FileAccess.open(args[0],FileAccess.WRITE).store_string(JSON.stringify(results,"  "))
 quit(1 if failed else 0)
