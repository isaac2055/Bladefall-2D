extends SceneTree
## Finite input searches; a negative result is explicitly budget-limited evidence.
const S=preload("res://tests/woods_search.gd")
var results=[]
var failed=false
func search(d,index,label,start,expected,ordinary=false):
 var options={"budget":24000,"width":36,"depth":36,"start":start,"allow_super":true,"allow_hyper":true,"allow_wallbounce":true,"allow_ultra":true}
 if ordinary:
  for k in ["allow_super","allow_hyper","allow_wallbounce","allow_ultra"]:options[k]=false
 var q=S.solve(d,index,options)
 var ok=q.found==expected;failed=failed or not ok
 print("PASS " if ok else "FAIL ",label," ",JSON.stringify(q))
 results.append({"index":index,"label":label,"expected":expected,"passed":ok,"result":q})
 var args=OS.get_cmdline_user_args()
 if not args.is_empty():FileAccess.open(args[0],FileAccess.WRITE).store_string(JSON.stringify(results,"  "))
func _initialize():
 var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/world22.json"))
 for room in d.world.rooms:
  if room.has("puzzleGoal"):room.workshopGoal=room.puzzleGoal
 for index in [40,41,42]:
  var t=d.world.rooms[index].puzzleRoutes[0].tape
  search(d,index,"positive control: find a finish from the final transfer",t.slice(0,{40:7,41:17,42:13}[index]),true)
 for index in [40,41,42]:
  search(d,index,"attempt ordinary movement from the prepared departure",d.world.rooms[index].puzzleRoutes[0].tape.slice(0,{40:5,41:14,42:9}[index]),false,true)
 var v=d.duplicate(true)
 v.world.rooms[40].resinWind.branches=v.world.rooms[40].resinWind.branches.filter(func(b):return b.phase!=1)
 search(v,40,"resin landing removed, powered alternatives allowed",d.world.rooms[40].puzzleRoutes[0].tape.slice(0,3),false)
 v=d.duplicate(true)
 v.world.rooms[40].resinWind.branches=v.world.rooms[40].resinWind.branches.filter(func(b):return b.phase!=0)
 search(v,40,"first branch removed, attempt direct approach from spawn",[],false)
 v=d.duplicate(true)
 for y in range(v.world.rooms[41].map.size()):v.world.rooms[41].map[y]=v.world.rooms[41].map[y].replace("l",".")
 search(v,41,"unloaded door from spawn, powered alternatives allowed",[],false)
 v=d.duplicate(true);v.world.rooms[42].erase("rootCrown")
 search(v,42,"crown absent: attempt a different return from the far perch",d.world.rooms[42].puzzleRoutes[0].tape.slice(0,7),false)
 v=d.duplicate(true)
 for y in range(v.world.rooms[42].map.size()):v.world.rooms[42].map[y]=v.world.rooms[42].map[y].replace("b",".")
 search(v,42,"seed absent: attempt another ascent from spawn",[],false)
 print("FRACTURED WOODS NEXT SEARCH ","FAILED" if failed else "PASSED")
 quit(1 if failed else 0)
