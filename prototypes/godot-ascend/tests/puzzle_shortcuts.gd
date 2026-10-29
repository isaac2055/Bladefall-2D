extends SceneTree
const S=preload("res://tests/woods_search.gd")
var failed=false
var results=[]
func _initialize():
 var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/world4.json"))
 var bridge_only="--bridge-only" in OS.get_cmdline_user_args()
 for i in ([16] if bridge_only else [16,17,18]):
  var tape=d.world.rooms[i].workshopRoutes[0].tape
  verify(S.solve(d,i,{"start":tape.slice(0,tape.size()-2),"budget":2500,"width":30,"depth":15}),true,"positive control finds a fresh finish: "+d.world.rooms[i].name)
 var outward=d.duplicate(true);outward.world.rooms[16].workshopGoal=[240,144,64,4];outward.world.rooms[16].workshopRequireShard=false;outward.world.rooms[16].lock.append("strike")
 verify(S.solve(outward,16,{"budget":12000,"width":50,"depth":40}),false,"no ordinary far-bank visit without making the bridge within budget")
 var first=d.world.rooms[16].workshopRoutes[0].tape
 verify(S.solve(d,16,{"start":first.slice(0,6),"forbid_pose":{"A":["down","left"]},"budget":12000,"width":50,"depth":40}),false,"no shard return while preserving the bridge within budget")
 if bridge_only:
  var out=OS.get_cmdline_user_args()[-1]
  FileAccess.open(out,FileAccess.WRITE).store_string(JSON.stringify(results,"  "))
  quit(1 if failed else 0);return
 verify(S.solve(d,17,{"forbid_pose":{"B":["right"]},"budget":10000,"width":45,"depth":40}),false,"no finish without staging B right within budget")
 var second=d.world.rooms[17].workshopRoutes[0].tape
 verify(S.solve(d,17,{"start":second.slice(0,29),"forbid_pose":{"B":["up"]},"budget":12000,"width":50,"depth":40}),false,"no finish avoiding the final B climb after collecting the shard within budget")
 verify(S.solve(d,18,{"forbid_weight":true,"budget":12000,"width":50,"depth":40}),false,"no finish without leaving a lantern load within budget")
 var args=OS.get_cmdline_user_args()
 if not args.is_empty():FileAccess.open(args[0],FileAccess.WRITE).store_string(JSON.stringify(results,"  "))
 quit(1 if failed else 0)
func verify(result,expected,label):
 var ok=result.found==expected;failed=failed or not ok
 print("PASS " if ok else "FAIL ",label," · ",result.nodes," branches")
 results.append({"passed":ok,"label":label,"result":result})
