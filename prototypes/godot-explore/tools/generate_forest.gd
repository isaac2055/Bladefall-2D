extends SceneTree
const World=preload("res://scripts/world.gd")
const Nav=preload("res://tools/navigator.gd")
var w
var nav
var destination
var phase=""
func step(raw,n=1):
 for i in range(n): w.step(raw);nav.recorded.append(raw)
func save_route():
 var tape=[]
 var keys={"left":"l","right":"r","jump":"j","attack":"a","interact":"u","pickup":"c","command":"e","flag":"f"}
 for raw in nav.recorded:
  var text=""
  for key in keys:
   if raw.get(key,false): text+=keys[key]
  if not tape.is_empty() and tape[-1][1]==text: tape[-1][0]+=1
  else: tape.append([1,text])
 var f=FileAccess.open(destination,FileAccess.WRITE)
 f.store_string(JSON.stringify({"tape":tape,"frames":nav.recorded.size(),"stage":w.stage,"x":w.p.x,"y":w.p.y,"deaths":w.deaths,"blood":w.p.blood,"phase":phase}))
 f.close()
func go(x,y):
 var ok=nav.go(Vector2(x,y),750)
 print("GOAL ",Vector2(x,y)," ",ok," at ",w.point()," deaths ",w.deaths," blood ",w.p.blood," frames ",nav.recorded.size())
 if ok: phase=str(x)+":"+str(y);save_route()
 return ok
func pod(id):
 var o=w.objects().filter(func(o):return o.get("earlyId","")==id)[0]
 step({"right":true,"jump":true})
 for i in range(70):
  if abs(w.p.x-o.x)<35 and w.p.y>=o.y-108 and w.p.y<=o.y-34:
   step({"right":true,"interact":true,"attack":true,"jump":true})
   if w.events.any(func(e):return e.kind=="launch"):
    print("LAUNCH ",id," ",w.point()," frames ",nav.recorded.size())
    return true
  step({"right":true,"jump":true})
  if w.p.dead: break
 print("FAIL pod ",id," p ",w.point())
 return false
func _initialize():
 destination=OS.get_cmdline_user_args()[0]
 w=World.new(JSON.parse_string(FileAccess.get_file_as_string("res://data/world.json")))
 w.enter(1,150,0)
 nav=Nav.new(w)
 if OS.get_cmdline_user_args().size()>1:
  var cached=JSON.parse_string(FileAccess.get_file_as_string(destination))
  for part in cached.tape:
   for i in range(int(part[0])):
    var raw={}
    for pair in [["left","l"],["right","r"],["jump","j"],["attack","a"],["interact","u"],["pickup","c"]]: raw[pair[0]]=pair[1] in part[1]
    step(raw)
  phase=cached.phase
  print("RESUME actual input replay ",phase," at ",w.point()," frames ",nav.recorded.size())
 else:
  for goal in [Vector2(700,0),Vector2(2000,0),Vector2(2850,0),Vector2(3020,70),Vector2(3225,135),Vector2(3425,205),Vector2(3640,40)]:
   if not go(goal.x,goal.y): quit(1);return
  step({"pickup":true});step({})
  if not w.weapon: push_error("normal first-weapon route failed");quit(1);return
  print("OATHBLADE RECOVERED with normal input")
  if not go(4140,0): quit(1);return
  for i in range(160):
   if w.p.x>=4455: break
   step({"right":true})
  if not pod("blade-0"): quit(1);return
  for i in range(90):
   if w.p.onGround and w.p.y>=125: break
   step({"right":true})
  if not go(4720,130): quit(1);return
  for goal in [Vector2(4940,195),Vector2(5160,260),Vector2(5420,325)]:
   if not go(goal.x,goal.y): quit(1);return
 for crossing in [[5500,5700,250],[5770,5980,185],[6050,6260,250]]:
  if not jump_crossing(crossing[0],crossing[1],crossing[2]): quit(1);return
 if not go(6320,250): quit(1);return
 step({"pickup":true});step({})
 print("MANTLE ",w.mantle)
 if not go(6110,250): quit(1);return
 step({"left":true,"jump":true})
 for i in range(100):
  if w.p.onGround and w.p.y==185: break
  step({"left":true,"jump":true})
 if not go(5980,185): quit(1);return
 for i in range(120):
  step({"right":true})
  if w.p.onGround and w.p.y==0 and w.p.x>6100: break
 if not go(6130,0): quit(1);return
 for i in range(60):
  if w.p.x>=6185: break
  step({"right":true})
 if not pod("blade-1"): quit(1);return
 for id in ["blade-2","blade-3"]:
  var o=w.objects().filter(func(o):return o.get("earlyId","")==id)[0]
  var hit=false
  for i in range(90):
   if abs(w.p.x-o.x)<35 and w.p.y>=o.y-108 and w.p.y<=o.y-34 and w.p.atkCd<=0:
    step({"right":true,"interact":true,"attack":true})
    if w.events.any(func(e):return e.kind=="launch"): hit=true;break
   step({"right":true})
   if w.p.dead: break
  print("CHAIN ",id," ",hit," at ",w.point())
  if not hit: quit(1);return
 for i in range(150):
  if w.p.onGround and w.p.x>=6740: break
  step({"right":true})
 if not go(6900,0): quit(1);return
 step({"interact":true});step({})
 for goal in [Vector2(7600,0),Vector2(7820,70),Vector2(8050,140),Vector2(8280,210),Vector2(8510,280),Vector2(8740,350),Vector2(8970,420),Vector2(9200,490),Vector2(9430,560),Vector2(9600,620),Vector2(9770,560),Vector2(10000,490),Vector2(10230,420),Vector2(10460,350),Vector2(10690,280),Vector2(10920,210),Vector2(11150,140),Vector2(11380,70),Vector2(11600,0),Vector2(12210,0)]:
  if not go(goal.x,goal.y): quit(1);return
 phase="complete"
 save_route()
 print("END FOREST ",w.point()," deaths ",w.deaths," blood ",w.p.blood," weapon ",w.weapon," mantle ",w.mantle)
 quit(0 if w.deaths==0 and w.weapon else 1)

func jump_crossing(launch_x,target_x,target_y):
 for i in range(200):
  if w.p.x>=launch_x: break
  step({"right":true})
 step({"right":true,"jump":true})
 for i in range(100):
  if w.p.onGround and abs(w.p.y-target_y)<7: break
  step({"right":true,"jump":true})
 return go(target_x,target_y)
