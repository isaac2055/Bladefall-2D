extends SceneTree
const World=preload("res://scripts/world.gd")
const Nav=preload("res://tools/navigator.gd")
var w
var nav
var destination
var which
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
 f.store_string(JSON.stringify({"quest":which,"tape":tape,"frames":nav.recorded.size(),"x":w.p.x,"y":w.p.y,"deaths":w.deaths,"blood":w.p.blood,"rowan":w.rowan,"elsie":w.elsie}));f.close()
func go(x,y):
 var ok=nav.go(Vector2(x,y),max(750,ceili(abs(w.p.x-x)/200*60)+300))
 print("GOAL ",Vector2(x,y)," ",ok," at ",w.point()," blood ",w.p.blood," quests ",w.rowan," / ",w.elsie," frames ",nav.recorded.size())
 if ok: save_route()
 return ok
func _initialize():
 which=OS.get_cmdline_user_args()[0]
 destination=OS.get_cmdline_user_args()[1]
 w=World.new(JSON.parse_string(FileAccess.get_file_as_string("res://data/world.json")))
 nav=Nav.new(w)
 var resumed=OS.get_cmdline_user_args().size()>2
 if resumed:
  if which=="elsie": w.enter(1,150,0)
  var cached=JSON.parse_string(FileAccess.get_file_as_string(destination))
  for part in cached.tape:
   for i in range(int(part[0])):
    var raw={}
    for pair in [["left","l"],["right","r"],["jump","j"],["attack","a"],["interact","u"],["pickup","c"]]: raw[pair[0]]=pair[1] in part[1]
    step(raw)
  print("RESUME actual inputs ",which," ",w.point()," quest ",w.rowan," / ",w.elsie)
 if which=="rowan":
  if not resumed:
   if not go(250,0): quit(1);return
   step({"interact":true});step({})
   for goal in [Vector2(550,0),Vector2(650,34),Vector2(925,0)]:
    if not go(goal.x,goal.y): quit(1);return
   var cart=w.objects().filter(func(o):return o.type=="crate")[0]
   for i in range(200):
    if cart.x>=1040: break
    step({"right":true})
   step({"interact":true});step({})
   if w.rowan!=2: push_error("normal cart/brake step failed");quit(1);return
   for goal in [Vector2(1220,58),Vector2(1300,114),Vector2(1190,170),Vector2(1300,226),Vector2(1370,282)]:
    if not go(goal.x,goal.y): quit(1);return
   step({"interact":true});step({})
   if not w.bell_held: push_error("bell release failed");quit(1);return
  if not resumed:
   for goal in [Vector2(1300,226),Vector2(1190,170),Vector2(1220,58)]:
    if not go(goal.x,goal.y): quit(1);return
  if not go(1100,0): quit(1);return
  step({"left":true,"jump":true})
  step({"left":true,"jump":true},45)
  for goal in [Vector2(925,0),Vector2(650,34),Vector2(360,0)]:
   if not go(goal.x,goal.y): quit(1);return
  step({"interact":true});step({})
  if not go(250,0): quit(1);return
  step({"interact":true});step({})
  if w.rowan!=5: push_error("Rowan claim failed");quit(1);return
  step({"interact":true});step({},451)
  print("DRAKE OUT ",w.point())
  step({"interact":true});step({},451)
  print("DRAKE HOME ",w.point())
 else:
  if not resumed:
   w.enter(1,150,0)
   var tours=JSON.parse_string(FileAccess.get_file_as_string("res://data/tours.json"))
   var remaining=1594
   for part in tours.forest.tape:
    for i in range(min(int(part[0]),remaining)):
     var raw={}
     for pair in [["left","l"],["right","r"],["jump","j"],["attack","a"],["interact","u"],["pickup","c"]]: raw[pair[0]]=pair[1] in part[1]
     if w.elsie==0 and abs(w.p.x-700)<62: raw.interact=true
     step(raw)
     remaining-=1
    if remaining<=0: break
   print("CHASE PREFIX ",w.point()," quest ",w.elsie," moth ",w.moth)
   for i in range(90):
    if w.p.x<5298 and not w.p.onGround: break
    step({"left":true})
   for i in range(150):
    if w.elsie==2: break
    step({"left":w.p.x>5330,"right":w.p.x<5310})
   if w.elsie!=2 or not w.lantern_held: push_error("normal moth chase catch failed");quit(1);return
   print("LANTERN CAUGHT ",w.point()," blood ",w.p.blood)
   for i in range(300):
    var jump=not w.p.onGround or not w.prev.get("jump",false)
    step({"left":true,"jump":jump})
    if w.p.onGround and w.p.y==65 and w.p.x<4920: break
   if not go(4870,65): quit(1);return
   for i in range(60):
    if w.p.x<=4845: break
    step({"left":true})
   step({"left":true,"jump":true})
   for i in range(90):
    if w.p.onGround and w.p.y==130: break
    step({"left":true,"jump":true})
   if not go(4720,130): quit(1);return
   for i in range(50):
    if w.p.x<=4660: break
    step({"left":true})
   step({"left":true,"jump":true})
   for i in range(130):
    if w.p.onGround and w.p.y==0 and w.p.x<4480: break
    step({"left":true,"jump":true})
   if not go(3820,0): quit(1);return
  if not go(820,0): quit(1);return
  if w.elsie!=3: push_error("normal lantern home failed");quit(1);return
  if not go(2290,0): quit(1);return
  for i in range(3): step({"attack":true});step({},26)
  if w.elsie!=4: push_error("normal log task failed");quit(1);return
  if not go(700,0): quit(1);return
  step({"interact":true});step({})
  if w.elsie!=5: push_error("Elsie claim failed");quit(1);return
  step({"interact":true});step({},451)
  print("MOTH OUT ",w.point())
  step({"interact":true});step({},451)
  print("MOTH HOME ",w.point())
 save_route()
 var ok=w.deaths==0 and (w.rowan==5 if which=="rowan" else w.elsie==5)
 print("PASS normal-input full quest ",which," deaths ",w.deaths," blood ",w.p.blood," frames ",nav.recorded.size())
 quit(0 if ok else 1)
