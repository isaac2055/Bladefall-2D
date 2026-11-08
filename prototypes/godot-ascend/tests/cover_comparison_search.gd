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
 search(d,0,"prepared upper pocket is reachable through the first alcove",a.slice(0,19),[264,224,24,4],true)
 search(d,0,"intact cover cannot replace first preparation",a.slice(0,3),[160,288,24,4],false,{"forbid_pose":{"Cover and crossing":["up","right","down"]}})
 search(d,0,"expert climb after the first breach remains a valid alternative to its line",a.slice(0,19),[264,224,24,4],true,{"mode_after_start":"no_lines"})
 search(d,0,"upright shelter cannot replace the rightward crossing",a.slice(0,23),d.world.rooms[0].puzzleGoal,false,{"forbid_pose":{"Cover and crossing":["right","down","left"]}})
 search(d,1,"loaded and folded dock permits the normal finish",b.slice(0,18),d.world.rooms[1].puzzleGoal,true)
 search(d,1,"folding before loading leaves the brute separated",[[10,""],[10,"l"],[15,""],[1,"ls"],[20,""]]+b.slice(10,13),d.world.rooms[1].puzzleGoal,false,{"forbid_pose":{"Loading dock":["left","right","down"]}})
 var ok=results.all(func(q):return q.expected==q.result.found)
 print("COVER COMPARISON SEARCH ","PASSED" if ok else "FAILED")
 quit(0 if ok else 1)
