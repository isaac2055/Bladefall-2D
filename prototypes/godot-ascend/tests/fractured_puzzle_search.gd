extends SceneTree
## Fresh inputs with positive controls; negative results are limited by the stated budget.
const S=preload("res://tests/woods_search.gd")
var failed=false
func _initialize():
 var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/world21.json"))
 for r in d.world.rooms:
  if r.has("puzzleGoal"):r.workshopGoal=r.puzzleGoal
 var selected=OS.get_cmdline_user_args()
 var out=[]
 for item in [
  [38,10,{},true,"lowered runway continuation"],
  [38,8,{"forbid_slide_y":true},false,"no lowering"],
  [38,10,{"forbid_ground_dash":true,"forbid_ground_recovery_before_x":224},false,"walking jump and air dash without recharging on the launch surface"],
  [39,10,{},true,"home-facing finish"],
  [39,4,{"forbid_zip_face":"left"},false,"wrong-face alternatives"],
  [39,0,{"mode":"static"},false,"idle carriage"],
  [39,14,{"target_gallery":true},true,"upper gallery continuation"],
  [39,4,{"target_gallery":true,"forbid_zip_face":"left"},false,"upper gallery without the home-facing contact"],
  [39,0,{"target_gallery":true,"mode":"static"},false,"upper gallery with an idle carriage"],
  [40,29,{},true,"closed-door continuation"],
  [40,29,{"mode":"held_open"},false,"leave door open"],
  [40,29,{"forbid_ground_dash":true},true,"late air-dash alternative still uses the closed runway"]]:
  if selected.size()>1 and int(selected[1])!=item[0]:continue
  var opt={"start":d.world.rooms[item[0]].puzzleRoutes[0].tape.slice(0,item[1]),"budget":20000,"width":50,"depth":50,"allow_super":true};opt.merge(item[2],true)
  var case_data=d.duplicate(true)
  if item[2].get("target_gallery",false):case_data.world.rooms[39].workshopGoal=[104,136,312,4]
  var q=S.solve(case_data,item[0],opt);var ok=q.found==item[3];failed=failed or not ok
  print("PASS " if ok else "FAIL ",item[4]," ",q);out.append({"index":item[0],"label":item[4],"passed":ok,"result":q})
 var args=OS.get_cmdline_user_args()
 if not args.is_empty():FileAccess.open(args[0],FileAccess.WRITE).store_string(JSON.stringify(out,"  ")+"\n")
 quit(1 if failed else 0)
