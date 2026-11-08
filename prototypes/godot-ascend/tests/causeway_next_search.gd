extends SceneTree
const S=preload("res://tests/woods_search.gd")
var results=[]
func search(d,index,label,prefix,expected,extras={}):
 if OS.get_cmdline_user_args().size()>1 and index!=int(OS.get_cmdline_user_args()[1]):return
 var options={"budget":12000,"width":28,"depth":32,"start":prefix,"allow_super":true,"allow_hyper":true,"allow_wallbounce":true,"allow_ultra":true}
 options.merge(extras,true)
 var q=S.solve(d,index,options)
 print("PASS " if q.found==expected else "FAIL ",label," ",JSON.stringify(q))
 results.append({"label":label,"index":index,"expected":expected,"result":q})
 if not OS.get_cmdline_user_args().is_empty():FileAccess.open(OS.get_cmdline_user_args()[0],FileAccess.WRITE).store_string(JSON.stringify(results,"  "))
func _initialize():
 var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/world23.json"))
 for r in d.world.rooms:
  if r.has("puzzleGoal"):r.workshopGoal=r.puzzleGoal
 var b=d.world.rooms[40].puzzleRoutes[0].tape
 var c=d.world.rooms[41].puzzleRoutes[0].tape
 var t=d.world.rooms[42].puzzleRoutes[0].tape
 for index in [40,41,42]:
  var ref=d.world.rooms[index].puzzleRoutes[0].tape
  search(d,index,"prepared finish "+str(index),ref.slice(0,{40:35,41:35,42:18}[index]),true)
 for index in [40,41,42]:
  var ref=d.world.rooms[index].puzzleRoutes[0].tape
  search(d,index,"ordinary finish "+str(index),ref.slice(0,{40:35,41:35,42:18}[index]),false,{"allow_super":false,"allow_hyper":false,"allow_wallbounce":false,"allow_ultra":false})
 search(d,40,"far bridge not restored",b.slice(0,20),false,{"forbid_pose":{"Far bridge":["left"]}})
 search(d,40,"near bridge not completed",b.slice(0,10),false,{"forbid_pose":{"Near bridge":["right"]}})
 search(d,40,"return line removed",b.slice(0,20),false,{"mode_after_start":"no_lines"})
 search(d,41,"cover kept horizontal",c.slice(0,2),false,{"forbid_pose":{"Sight cover":["down","left","up"]}})
 search(d,42,"lantern absent",[],false,{"mode":"no_lantern"})
 search(d,42,"dock kept in throwing position",t.slice(0,8),false,{"forbid_pose":{"Throwing dock":["down","left","up"]}})
 var ok=results.all(func(q):return q.result.found==q.expected)
 print("CAUSEWAY NEXT SEARCH ","PASSED" if ok else "FAILED")
 quit(0 if ok else 1)
