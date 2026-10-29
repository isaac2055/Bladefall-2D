extends SceneTree
## Fresh input branches, with finite budgets; absence is not a uniqueness proof.
const S=preload("res://tests/woods_search.gd")
var failed=false
var results=[]
func check(result,expected,label):
 var ok=result.found==expected;failed=failed or not ok
 print("PASS " if ok else "FAIL ",label," · ",result.nodes," branches")
 results.append({"passed":ok,"label":label,"result":result})
func _initialize():
 var data=JSON.parse_string(FileAccess.get_file_as_string("res://data/world4.json"))
 for i in [13,14,15]:
  var tape=data.world.rooms[i].workshopRoutes[0].tape
  var start=tape.slice(0,tape.size()-1 if i!=14 else tape.size()-2)
  check(S.solve(data,i,{"start":start,"budget":2000,"width":30,"depth":12}),true,"positive search finishes from the legitimate late approach: "+data.world.rooms[i].name)
 for pair in [[13,"d"],[14,"strike"],[15,"d"],[15,"strike"]]:
  var altered=data.duplicate(true);altered.world.rooms[pair[0]].lock.append(pair[1])
  var result=S.solve(altered,pair[0],{"budget":8000,"width":45,"depth":36})
  check(result,false,"no ordinary finish found without "+("loading" if pair[1]=="d" else "turning")+": "+data.world.rooms[pair[0]].name)
 var args=OS.get_cmdline_user_args()
 if not args.is_empty():FileAccess.open(args[0],FileAccess.WRITE).store_string(JSON.stringify(results,"  "))
 quit(1 if failed else 0)
