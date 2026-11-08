extends SceneTree
const S=preload("res://tests/woods_search.gd")
var results=[]
func search(source,label,prefix,goal,expected,change=""):
 var d=source.duplicate(true);var room=d.world.rooms[41];room.workshopGoal=goal
 if change=="first_sealed":room.combat.doors[0].brittle=false
 if change=="second_sealed":room.combat.doors[1].brittle=false
 if change=="no_first_line":room.lines[0].a=[2,55]
 var q=S.solve(d,41,{"budget":12000,"width":28,"depth":32,"start":prefix,"allow_super":true,"allow_hyper":true,"allow_wallbounce":true,"allow_ultra":true})
 results.append({"label":label,"expected":expected,"result":q})
 print("PASS " if q.found==expected else "FAIL ",label," ",JSON.stringify(q))
 if not OS.get_cmdline_user_args().is_empty():FileAccess.open(OS.get_cmdline_user_args()[0],FileAccess.WRITE).store_string(JSON.stringify(results,"  "))
func _initialize():
 var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/world23.json"));var t=d.world.rooms[41].puzzleRoutes[0].tape
 search(d,"first breach gives physical access to the first alcove",t.slice(0,18),[88,336,24,4],true)
 search(d,"sealed first barrier cannot be jumped around",t.slice(0,18),[88,336,24,4],false,"first_sealed")
 search(d,"low guarded lane cannot replace the first alcove crossing",t.slice(0,18),[264,400,56,4],false,"no_first_line")
 search(d,"second breach gives physical access to the finishing alcove",t.slice(0,30),[328,400,40,4],true)
 search(d,"sealed second barrier cannot be jumped around",t.slice(0,22),[328,400,40,4],false,"second_sealed")
 var ok=results.all(func(q):return q.expected==q.result.found)
 print("COVER TWO BAITS SEARCH ","PASSED" if ok else "FAILED")
 quit(0 if ok else 1)
