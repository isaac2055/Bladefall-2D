extends SceneTree
const S=preload("res://tests/woods_search.gd")
func _initialize():
 var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/world21.json"))
 for r in d.world.rooms:
  if r.has("puzzleGoal"):r.workshopGoal=r.puzzleGoal
 var args=OS.get_cmdline_user_args();var results=[]
 var ok=true
 for item in [
 [41,13,{},true,"cleared ceiling continuation"],
 [41,11,{"mode":"permanent_crumble"},false,"permanent ceiling above lower landing"],
 [41,0,{"mode":"permanent_crumble"},false,"unbroken upper detour"],
 [42,7,{},true,"far resting bank"],
 [42,2,{"max_hook_length":36},false,"high hanging position"],
 [42,0,{"mode":"no_hooks"},false,"near-bank direct escape"],
 [43,23,{},true,"return landing continuation"],
 [43,17,{"park_zip_after_start":"home"},false,"parked home carriage"],
 [43,17,{"park_zip_after_start":"far"},false,"parked far carriage"],
 [43,24,{"gallery":true},true,"upper gallery continuation"],
 [43,17,{"park_zip_after_start":"home","gallery":true},false,"gallery with home carriage"],
 [43,17,{"park_zip_after_start":"far","gallery":true},false,"gallery with far carriage"]]:
  if args.size()>1 and item[0]!=int(args[1]):continue
  var qd=d.duplicate(true)
  if item[2].get("gallery",false):qd.world.rooms[43].workshopGoal=[200,192,440,4]
  var opt={"start":d.world.rooms[item[0]].puzzleRoutes[0].tape.slice(0,item[1]),"budget":24000,"width":60,"depth":50,"allow_super":true,"allow_ultra":true}
  if item[0]==42:opt.extra_actions=[[6,"g"],[18,"g"],[6,"gd"],[18,"gd"],[6,"gu"],[18,"gu"],[6,"rdg"],[18,"rdg"]]
  opt.merge(item[2],true)
  var q=S.solve(qd,item[0],opt);var pass_case=q.found==item[3];ok=ok and pass_case;print("PASS" if pass_case else "FAIL"," ",item[4]," ",q);results.append({"index":item[0],"label":item[4],"passed":pass_case,"result":q})
 if not args.is_empty():FileAccess.open(args[0],FileAccess.WRITE).store_string(JSON.stringify(results,"  ")+"\n")
 quit(0 if ok else 1)
