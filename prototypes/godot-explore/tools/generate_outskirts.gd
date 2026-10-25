extends SceneTree
const World=preload("res://scripts/world.gd")
const Nav=preload("res://tools/navigator.gd")
var world
var nav
var path
func save_route():
 var tape=[]
 var keys={"left":"l","right":"r","jump":"j","attack":"a","interact":"u","pickup":"c","command":"e","flag":"f"}
 for raw in nav.recorded:
  var text=""
  for key in keys:
   if raw.get(key,false): text+=keys[key]
  if not tape.is_empty() and tape[-1][1]==text: tape[-1][0]+=1
  else: tape.append([1,text])
 var file=FileAccess.open(path,FileAccess.WRITE)
 file.store_string(JSON.stringify({"tape":tape,"frames":nav.recorded.size(),"endStage":world.stage,"x":world.p.x,"y":world.p.y,"deaths":world.deaths,"blood":world.p.blood}))
 file.close()
func step(raw,n=1):
 for i in range(n): world.step(raw);nav.recorded.append(raw)
func _initialize():
 path=OS.get_cmdline_user_args()[0]
 world=World.new(JSON.parse_string(FileAccess.get_file_as_string("res://data/world.json")))
 nav=Nav.new(world)
 var goals=[Vector2(550,0),Vector2(650,34),Vector2(925,0),Vector2(1220,58),Vector2(1480,0),Vector2(1760,68),Vector2(1950,0),Vector2(2340,0),Vector2(2890,0),Vector2(3095,54),Vector2(3270,56),Vector2(3600,0),Vector2(3935,62),Vector2(4150,32),Vector2(4470,0),Vector2(4870,0),Vector2(5140,45),Vector2(5240,110),Vector2(5450,160),Vector2(5630,118),Vector2(5820,145),Vector2(6000,175),Vector2(6210,125),Vector2(6360,130),Vector2(6570,12),Vector2(6850,0),Vector2(7275,0),Vector2(7660,72),Vector2(8020,0),Vector2(8360,55),Vector2(8580,78),Vector2(8990,0),Vector2(10400,0),Vector2(11370,0),Vector2(11710,0),Vector2(12010,65),Vector2(12240,48),Vector2(12470,28),Vector2(12815,0),Vector2(13140,42),Vector2(13480,0)]
 if OS.get_cmdline_user_args().size()>1:
  var cached=JSON.parse_string(FileAccess.get_file_as_string(path))
  var remaining=int(OS.get_cmdline_user_args()[1])
  for part in cached.tape:
   for i in range(min(remaining,int(part[0]))):
    var raw={}
    for pair in [["left","l"],["right","r"],["jump","j"],["attack","a"],["interact","u"],["pickup","c"]]: raw[pair[0]]=pair[1] in part[1]
    step(raw)
    remaining-=1
   if remaining<=0: break
  print("RESUME verified replay ",world.point()," frames ",nav.recorded.size())
  var resume_x=float(OS.get_cmdline_user_args()[2]) if OS.get_cmdline_user_args().size()>2 else 5450.0
  goals=goals.filter(func(v):return v.x>resume_x)
 for goal in goals:
  if goal.x==6210:
   for i in range(100):
    if world.p.x>=6060: break
    step({"right":true})
   step({"right":true,"jump":true})
   for i in range(65):
    if world.p.onGround and world.p.x>6198: break
    step({"right":true,"jump":true})
   step({"right":true})
   print("SENTRY BYPASS ",world.point()," blood ",world.p.blood)
  var ok=nav.go(goal,750)
  if goal.x==1950: step({"interact":true});step({},2)
  if goal.x in [2340.0,6000.0,11370.0]: step({},36)
  print("GOAL ",goal," ",ok," at ",world.point()," deaths ",world.deaths," blood ",world.p.blood," frames ",nav.recorded.size())
  save_route()
  if not ok: quit(1);return
 for i in range(50):
  if world.stage==1: break
  step({"right":true})
 save_route()
 print("END ",world.stage," ",world.point()," bearings ",world.bearings," deaths ",world.deaths)
 quit(0 if world.stage==1 and world.deaths==0 else 1)
