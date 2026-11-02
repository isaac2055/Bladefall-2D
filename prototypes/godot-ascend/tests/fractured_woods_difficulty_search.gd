extends SceneTree
## Finite fresh-input searches supplement the hand-authored witnesses.
## A failed search is budget-limited evidence, not proof of difficulty or uniqueness.
const S=preload("res://tests/woods_search.gd")
var failed=false
var results=[]
func record(index,label,result,expected):
 var ok=result.found==expected
 failed=failed or not ok
 print("PASS " if ok else "FAIL ",index," ",label," · ",JSON.stringify(result))
 results.append({"room":index,"case":label,"passed":ok,"result":result})
 var args=OS.get_cmdline_user_args()
 if not args.is_empty():FileAccess.open(args[0],FileAccess.WRITE).store_string(JSON.stringify(results,"  "))
func _initialize():
 var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/world22.json"))
 for room in d.world.rooms:
  if room.has("puzzleGoal"):room.workshopGoal=room.puzzleGoal
 var short=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/woods-runway-shortcut.json"))
 var before=d.duplicate(true)
 before.world.rooms[37]=short.room
 before.world.rooms[37].workshopGoal=short.room.puzzleGoal
 record(37,"positive control: find an ordinary-movement finish on the former long runway",S.solve(before,37,{"budget":20000,"width":65,"depth":35,"start":short.tape.slice(0,12)}),true)
 for index in [37,38,39]:
  var tape=d.world.rooms[index].puzzleRoutes[0].tape
  record(index,"no ordinary-movement payoff found within budget",S.solve(d,index,{"budget":20000,"width":65,"depth":35,"start":tape.slice(0,{37:12,38:15,39:15}[index])}),false)
 for index in [37,38,39]:
  record(index,"no pod-free route found from spawn within budget",S.solve(d,index,{"budget":25000,"width":75,"depth":45,"mode":"no_pods","allow_super":true,"allow_ultra":true}),false)
 print("FRACTURED WOODS DIFFICULTY SEARCH ","FAILED" if failed else "PASSED")
 quit(1 if failed else 0)
