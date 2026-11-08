extends SceneTree
const S=preload("res://tests/woods_search.gd")
var results=[]
func search(d,index,label,prefix,expected,extras={}):
 var options={"budget":12000,"width":28,"depth":32,"start":prefix,"allow_super":true,"allow_hyper":true,"allow_wallbounce":true,"allow_ultra":true,"extra_actions":[[1,"dj"],[24,"rj"],[1,"us"],[1,"s"],[1,"ds"]]}
 options.merge(extras,true)
 var q=S.solve(d,index,options);results.append({"label":label,"expected":expected,"result":q})
 print("PASS " if q.found==expected else "FAIL ",label," ",JSON.stringify(q))
 if not OS.get_cmdline_user_args().is_empty():FileAccess.open(OS.get_cmdline_user_args()[0],FileAccess.WRITE).store_string(JSON.stringify(results,"  "))
func _initialize():
 var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/causeway-launch-rooms.json"));var a=d.world.rooms[0].puzzleRoutes[0].tape;var b=d.world.rooms[1].puzzleRoutes[0].tape
 search(d,0,"prepared receiving plate permits the short finish",a.slice(0,23),true)
 search(d,0,"lantern omitted from the whole room",[],false,{"mode":"no_lantern"})
 var no_boost=d.duplicate(true);no_boost.constants.liftYCap=0
 search(no_boost,0,"divider crossing without stored launch",a.slice(0,9),false,{"forbid_recoil_jump":true})
 search(d,1,"folded roof permits the upper transfer",b.slice(0,6),true)
 search(d,1,"horizontal roof cannot be bypassed from the chamber",b.slice(0,3),false,{"forbid_pose":{"Roof":["down","left","up"]}})
 var ok=results.all(func(q):return q.result.found==q.expected)
 print("CAUSEWAY LAUNCH SEARCH ","PASSED" if ok else "FAILED");quit(0 if ok else 1)
