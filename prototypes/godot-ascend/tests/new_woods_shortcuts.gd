extends SceneTree
## Fresh ordinary-input searches. Finite budgets and beam pruning limit coverage.
const S=preload("res://tests/woods_search.gd")
var failed=false
var results=[]
func check(found,expected,label,result):
 var ok=found==expected;failed=failed or not ok
 print("PASS " if ok else "FAIL ",label," · ",result.nodes," branches")
 results.append({"passed":ok,"label":label,"result":result})
func _initialize():
 var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/world4.json"))
 var selected=OS.get_cmdline_user_args()
 if "--finish-only" in selected:
  finish_case(d)
  FileAccess.open(selected[-1],FileAccess.WRITE).store_string(JSON.stringify(results,"  "))
  quit(1 if failed else 0);return
 var control=d.duplicate(true);control.world.rooms[11].workshopGoal=[168,152,72,4]
 var positive=S.solve(control,11,{"start":d.world.rooms[11].workshopRoutes[0].tape.slice(0,8),"budget":6000,"width":40,"depth":25})
 check(positive.found,true,"search finds a new Hollow landing after the legitimate pod rebound",positive)
 var hollow=S.solve(control,11,{"mode":"no_pods","budget":30000,"width":70,"depth":50})
 check(hollow.found,false,"no pod-free Hollow ascent found within budget",hollow)
 var former=d.duplicate(true);var b=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/returning-seed-bypasses.json"))[0]
 former.world.rooms[12]=b.room
 var before=S.solve(former,12,{"start":b.tape.slice(0,7),"max_x":272,"budget":30000,"width":70,"depth":50})
 check(before.found,true,"search finds a former Seed shortcut without the far bank",before)
 var seed=S.solve(d,12,{"start":d.world.rooms[12].workshopRoutes[0].tape.slice(0,7),"max_x":272,"budget":30000,"width":70,"depth":50})
 check(seed.found,false,"no finish avoiding the Seed far bank found within budget",seed)
 var approach=d.duplicate(true);approach.world.rooms[12].workshopGoal=[280,232,72,4]
 # This intermediate physical crossing must not fail merely for missing finish pickups.
 approach.world.rooms[12].workshopRequireShard=false
 approach.world.rooms[12].workshopRequireAllShards=false
 var no_pod=S.solve(approach,12,{"mode":"no_pods","budget":30000,"width":70,"depth":50})
 check(no_pod.found,false,"no pod-free Seed outward crossing found within budget",no_pod)
 finish_case(d)
 var args=OS.get_cmdline_user_args()
 if not args.is_empty():FileAccess.open(args[0],FileAccess.WRITE).store_string(JSON.stringify(results,"  "))
 quit(1 if failed else 0)
func finish_case(d):
 var whole=S.solve(d,12,{"mode":"no_pods","budget":30000,"width":70,"depth":50})
 check(whole.found,false,"no pod-free Seed finish from spawn found within budget",whole)
