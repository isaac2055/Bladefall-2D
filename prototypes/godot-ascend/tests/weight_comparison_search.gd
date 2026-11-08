extends SceneTree
const S=preload("res://tests/woods_search.gd")
var results=[]
func search(d,index,label,prefix,goal,expected,extras={}):
 var source=d.duplicate(true);source.world.rooms[index].workshopGoal=goal
 var options={"budget":16000,"width":32,"depth":36,"start":prefix,"allow_super":true,"allow_hyper":true,"allow_wallbounce":true,"allow_ultra":true,"extra_actions":[[1,"dj"],[24,"rj"],[1,"g"],[1,"dg"],[1,"rg"],[5,""],[8,"rj"]]}
 options.merge(extras,true)
 var q=S.solve(source,index,options);results.append({"label":label,"expected":expected,"result":q})
 print("PASS " if q.found==expected else "FAIL ",label," ",JSON.stringify(q))
 if not OS.get_cmdline_user_args().is_empty():FileAccess.open(OS.get_cmdline_user_args()[0],FileAccess.WRITE).store_string(JSON.stringify(results,"  "))
func _initialize():
 var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/causeway-weight-comparison.json"));var a=d.world.rooms[0].puzzleRoutes[0].tape;var b=d.world.rooms[1].puzzleRoutes[0].tape
 search(d,0,"A delivered lantern permits its ordinary-hop finish",a.slice(0,17),d.world.rooms[0].puzzleGoal,true)
 search(d,1,"B cleared side opening permits its ordinary-hop finish",b.slice(0,21),d.world.rooms[1].puzzleGoal,true)
 search(d,0,"A bottom route and both-wall climb without the lantern",[],d.world.rooms[0].puzzleGoal,false,{"mode":"no_lantern"})
 search(d,0,"A delivered lantern cannot turn a return to the first plate into a second launch",a.slice(0,9),[192,208,64,4],false)
 search(d,1,"B cannot walk beneath the unloaded receiver or use the lower-right route",[],d.world.rooms[1].puzzleGoal,false,{"mode":"no_lantern"})
 search(d,0,"A keeping the lantern airborne cannot replace delivery",a.slice(0,8),d.world.rooms[0].puzzleGoal,false,{"mode_after_start":"no_lantern"})
 var ok=results.all(func(q):return q.result.found==q.expected)
 print("WEIGHT COMPARISON SEARCH ","PASSED" if ok else "FAILED");quit(0 if ok else 1)
