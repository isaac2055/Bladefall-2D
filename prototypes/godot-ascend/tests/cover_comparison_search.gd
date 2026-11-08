extends SceneTree
const S=preload("res://tests/woods_search.gd")
var results=[]
func search(source,index,label,prefix,goal,expected,extras={}):
 var d=source.duplicate(true);d.world.rooms[index].workshopGoal=goal
 var options={"budget":12000,"width":28,"depth":32,"start":prefix,"allow_super":true,"allow_hyper":true,"allow_wallbounce":true,"allow_ultra":true,"extra_actions":[[1,"dj"],[24,"rj"]]}
 options.merge(extras,true)
 var q=S.solve(d,index,options)
 results.append({"label":label,"expected":expected,"result":q})
 print("PASS " if q.found==expected else "FAIL ",label," ",JSON.stringify(q))
 if not OS.get_cmdline_user_args().is_empty():FileAccess.open(OS.get_cmdline_user_args()[0],FileAccess.WRITE).store_string(JSON.stringify(results,"  "))
func _initialize():
 var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/causeway-cover-comparison.json"));var a=d.world.rooms[0].puzzleRoutes[0].tape;var b=d.world.rooms[1].puzzleRoutes[0].tape
 search(d,0,"cleared guard permits shard retrieval after the airborne dodge",a.slice(0,9),[160,240,24,4],true)
 search(d,0,"first guard cannot be bypassed without a return bait",a.slice(0,4),[160,240,24,4],false,{"forbid_enemy_tell_face":1})
 search(d,0,"upright arm cannot replace the final crossing",a.slice(0,12),d.world.rooms[0].puzzleGoal,false,{"forbid_pose":{"Cover and crossing":["right","down","left"]}})
 search(d,1,"correct delivery and lower breach permit the ordinary finish",b.slice(0,34),d.world.rooms[1].puzzleGoal,true)
 var wrong=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/cover-comparison-wrong-bay.json")).tape
 search(d,1,"committed first-stop delivery into the wrong bay cannot reach the flag",wrong,d.world.rooms[1].puzzleGoal,false,{"forbid_pose":{"Loading dock":["left","right","down"]}})
 var ok=results.all(func(q):return q.expected==q.result.found)
 print("COVER COMPARISON SEARCH ","PASSED" if ok else "FAILED")
 quit(0 if ok else 1)
