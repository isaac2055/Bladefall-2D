extends SceneTree
## Fresh-input searches with positive controls. A negative result is budget-limited evidence.
const S=preload("res://tests/woods_search.gd")
var failed=false
var results=[]
func probe(data,index,options,expected,label):
 var q=S.solve(data,index,options);var ok=q.found==expected;failed=failed or not ok
 print("PASS " if ok else "FAIL ",label," · ",q)
 results.append({"label":label,"passed":ok,"result":q})
func _initialize():
 var data=JSON.parse_string(FileAccess.get_file_as_string("res://data/world4.json"))
 var selected=OS.get_cmdline_user_args()
 for i in range(24,30):
  if selected.size()>1 and int(selected[1])!=i:continue
  var t=data.world.rooms[i].workshopRoutes[0].tape
  var prefix=[24,13,10,5,5,12][i-24]
  var d=data.duplicate(true)
  if i==28:d.world.rooms[i].workshopGoal=[232,120,24,4]
  if i==29:d.world.rooms[i].workshopGoal=[232,160,32,4];d.world.rooms[i].workshopRequireShard=false;prefix=3
  probe(d,i,{"start":t.slice(0,prefix),"budget":12000,"width":40,"depth":45},true,"fresh ordinary continuation, room "+str(i+1))
  var options={"budget":12000,"width":40,"depth":45}
  match i:
   24:options.mode="static"
   25:options.start=t.slice(0,11);options.freeze_zip_after_start=true
   26:options.mode="no_lantern"
   27:options.mode="no_pods"
   28:options.start=t.slice(0,2);options.forbid_recoil_jump=true
   29:options.forbid_recoil_jump=true
  probe(d,i,options,false,"no shortcut found within budget, room "+str(i+1))
 if not selected.is_empty():FileAccess.open(selected[0],FileAccess.WRITE).store_string(JSON.stringify(results,"  ")+"\n")
 quit(1 if failed else 0)
