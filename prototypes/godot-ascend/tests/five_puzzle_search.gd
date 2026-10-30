extends SceneTree
## Bounded searches choose fresh ordinary inputs; negative results are not impossibility proofs.
const S=preload("res://tests/woods_search.gd")
var failed=false
func _initialize():
 var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/world4.json"))
 var dock=d.duplicate(true);dock.world.rooms[23].workshopGoal=[240,184,16,4]
 var bare=d.duplicate(true);bare.world.rooms[22].map=bare.world.rooms[22].map.map(func(row):return row.replace("l","."))
 var cases=[
  ["positive: fresh Canopy finish",d,20,{"start":d.world.rooms[20].workshopRoutes[1].tape.slice(0,31),"budget":8000,"width":50,"depth":30},true],
  ["Root without moving the stone",d,19,{"slide_max_x":112,"budget":16000,"width":65,"depth":40},false],
  ["Dock service before any preparation",dock,23,{"slide_max_x":128,"forbid_pose":{"A":["right","down","left"]},"budget":30000,"width":90,"depth":45},false],
  ["Dock service after first shove but no A bridge",dock,23,{"start":d.world.rooms[23].workshopRoutes[0].tape.slice(0,4),"slide_max_x":176,"forbid_pose":{"A":["right","down","left"]},"budget":24000,"width":80,"depth":45},false],
  ["Weight without a lantern",bare,22,{"budget":24000,"width":80,"depth":45},false],
  ["positive: ferry return without inherited horizontal movement",d,21,{"start":d.world.rooms[21].workshopRoutes[0].tape.slice(0,22),"disable_lift_x_after_start":true,"budget":24000,"width":80,"depth":45},true],
  ["Ferry with return transport removed",d,21,{"start":d.world.rooms[21].workshopRoutes[0].tape.slice(0,18),"freeze_zip_after_start":true,"budget":30000,"width":90,"depth":45},false],
  ["Dock finish while stone stays at temporary dock",d,23,{"start":d.world.rooms[23].workshopRoutes[0].tape.slice(0,30),"slide_max_x":176,"budget":24000,"width":80,"depth":45},false]
 ]
 var results=[]
 for item in cases:
  var selection=OS.get_cmdline_user_args()
  if selection.size()>1 and not selection[1] in item[0]:continue
  var result=S.solve(item[1],item[2],item[3]);var ok=result.found==item[4] and not result.has("error")
  failed=failed or not ok
  print("PASS " if ok else "FAIL ",item[0]," · ",result.nodes," branches · found=",result.found)
  results.append({"label":item[0],"passed":ok,"options":item[3],"result":result})
  var args=OS.get_cmdline_user_args()
  if not args.is_empty():FileAccess.open(args[0],FileAccess.WRITE).store_string(JSON.stringify(results,"  "))
 print("FIVE PUZZLE SEARCH ","FAILED" if failed else "PASSED");quit(1 if failed else 0)
