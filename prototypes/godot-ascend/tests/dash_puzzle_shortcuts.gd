extends SceneTree
## Bounded ordinary-input searches: a negative result is not an impossibility proof.
const Search=preload("res://tests/woods_search.gd")
var failed=false
func check(ok,label):
 print("PASS " if ok else "FAIL ",label);failed=failed or not ok
func _initialize():
 var data=JSON.parse_string(FileAccess.get_file_as_string("res://data/world4.json"));var results=[]
 var mistakes=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/dash-puzzle-mistakes.json"))
 var cases=[
  [19,{"start":data.world.rooms[19].workshopRoutes[0].tape.slice(0,6),"forbid_landing":["hingeArm"]},"skip the removable refill landing"],
  [20,{"slide_max_x":320},"finish without the useful stone dock"],
  [20,{"start":mistakes.wrongDockAttempt.slice(0,20),"slide_max_x":320},"salvage an open shaft without recovering the wrongly docked stone"],
  [21,{"forbid_weight":true},"finish without delivering the lantern load"],
  [21,{"start":data.world.rooms[21].workshopRoutes[0].tape.slice(0,51),"forbid_recoil_jump":true},"replace the final recoil launch"]
 ]
 for pair in cases:
  var options={"budget":18000,"depth":40,"width":110};options.merge(pair[1],true)
  var result=Search.solve(data,pair[0],options);results.append({"case":pair[2],"result":result})
  check(not result.has("error") and not result.found,"bounded search: "+pair[2]+" "+str(result))
 for pair in [[19,10],[20,21],[21,53]]:
  var result=Search.solve(data,pair[0],{"start":data.world.rooms[pair[0]].workshopRoutes[0].tape.slice(0,pair[1]),"budget":6000,"depth":12,"width":60})
  results.append({"positive":pair[0],"result":result})
  check(result.found,"positive control finds an ordinary continuation: "+str(pair[0])+" "+str(result))
 var args=OS.get_cmdline_user_args()
 if not args.is_empty():FileAccess.open(args[0],FileAccess.WRITE).store_string(JSON.stringify(results,"  "))
 print("DASH SHORTCUT SEARCHES ","FAILED" if failed else "PASSED");quit(1 if failed else 0)
