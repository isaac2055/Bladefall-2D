extends SceneTree
const S=preload("res://tests/woods_search.gd")
var results=[]
func run_search(d,i,label,start,expected,extras={}):
 var options={"budget":18000,"width":32,"depth":32,"start":start,"allow_super":true,"allow_hyper":true,"allow_wallbounce":true,"allow_ultra":true}
 options.merge(extras,true)
 var q=S.solve(d,i,options)
 print("PASS " if q.found==expected else "FAIL ",label," ",JSON.stringify(q))
 results.append({"label":label,"expected":expected,"result":q})
 if not OS.get_cmdline_user_args().is_empty():FileAccess.open(OS.get_cmdline_user_args()[0],FileAccess.WRITE).store_string(JSON.stringify(results,"  "))
func _initialize():
 var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/world23.json"))
 for r in d.world.rooms:
  if r.has("puzzleGoal"):r.workshopGoal=r.puzzleGoal
 var w=d.world.rooms[38].puzzleRoutes[0].tape
 var f=d.world.rooms[39].puzzleRoutes[0].tape
 run_search(d,38,"prepared weight finish",w.slice(0,22),true)
 run_search(d,39,"prepared fold finish",f.slice(0,14),true)
 run_search(d,38,"self loading without lantern",[],false,{"mode":"no_lantern"})
 var no_boost=d.duplicate(true);no_boost.constants.liftYCap=0
 run_search(no_boost,38,"empty handed without lift boost",w.slice(0,22),false,{"forbid_recoil_jump":true})
 run_search(d,39,"climb cannot be replaced by jumping and dashing from the bank",f.slice(0,2),false,{"forbid_climb":true})
 run_search(d,39,"wall kept vertical after climb",f.slice(0,8),false,{"forbid_pose":{"Return runway":["right","up","left"]}})
 run_search(d,39,"line removed after folding",f.slice(0,10),false,{"mode":"no_lines"})
 run_search(d,39,"ordinary finish after line",f.slice(0,14),false,{"allow_super":false,"allow_hyper":false,"allow_wallbounce":false,"allow_ultra":false})
 var ok=results.all(func(q):return q.result.found==q.expected)
 print("CAUSEWAY SEARCH ","PASSED" if ok else "FAILED")
 quit(0 if ok else 1)
