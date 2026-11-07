extends SceneTree
const S=preload("res://tests/woods_search.gd")
var results=[]
func search(d,i,label,start,expected,extras={}):
 var options={"budget":24000,"width":36,"depth":36,"start":start,"allow_super":true,"allow_hyper":true,"allow_wallbounce":true,"allow_ultra":true}
 options.merge(extras,true)
 var q=S.solve(d,i,options)
 var pass_test=q.found==expected
 print("PASS " if pass_test else "FAIL ",label," ",JSON.stringify(q))
 results.append({"label":label,"expected":expected,"passed":pass_test,"result":q})
 var args=OS.get_cmdline_user_args()
 if not args.is_empty():FileAccess.open(args[0],FileAccess.WRITE).store_string(JSON.stringify(results,"  "))
func _initialize():
 var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/world22.json"))
 for r in d.world.rooms:
  if r.has("puzzleGoal"):r.workshopGoal=r.puzzleGoal
 for i in [43,44,45]:
  var t=d.world.rooms[i].puzzleRoutes[0].tape
  search(d,i,"positive control finish "+str(i),t.slice(0,{43:12,44:20,45:7}[i]),true)
 search(d,43,"upright branch locked; find another route",d.world.rooms[43].puzzleRoutes[0].tape.slice(0,2),false,{"forbid_pose":{"Runway branch":["right","down","left"]}})
 search(d,43,"ordinary movement after preparing the horizontal branch",d.world.rooms[43].puzzleRoutes[0].tape.slice(0,8),false,{"allow_super":false,"allow_hyper":false,"allow_wallbounce":false,"allow_ultra":false})
 search(d,44,"blade retrieved but seed absent",d.world.rooms[44].puzzleRoutes[0].tape.slice(0,16),false,{"mode":"no_pods"})
 var blocked=d.duplicate(true);blocked.world.rooms[45].resinWind.branches[0].phase=2
 search(blocked,45,"lid never disappears; try another way up",d.world.rooms[45].puzzleRoutes[0].tape.slice(0,2),false)
 var ok=results.all(func(r):return r.passed)
 print("WOODS NINE SEARCH ","PASSED" if ok else "FAILED")
 quit(0 if ok else 1)
