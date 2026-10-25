extends SceneTree
const World=preload("res://scripts/world.gd")
var w
var recording=[]
func step(raw):
 var keys=""
 for pair in [["l","l"],["r","r"],["u","u"],["d","d"],["jump","j"],["dash","x"],["grab","g"],["strike","s"]]:
  if raw.get(pair[0],false): keys+=pair[1]
 if not recording.is_empty() and recording[-1][1]==keys: recording[-1][0]+=1
 else: recording.append([1,keys])
 w.step(raw)
 if w.update_region(): print("REGION ",w.active_id," ",Vector2(w.active().p.x,w.active().p.y))
 if "death" in w.active().events: print("DEATH ",w.active_id," ",Vector2(w.active().p.x,w.active().p.y))
func run(n,raw):
 for i in range(n): step(raw)
 print("RUN ",n," ",raw," => ",w.active_id," ",Vector2(w.active().p.x,w.active().p.y)," deaths ",w.active().deaths)
func settle(x,y):
 for i in range(360):
  var p=w.active().p
  if p.x==x and abs(p.y-y)<=1 and p.vx==0 and p.onGround: break
  var dx=x-p.x
  var desired=clamp(dx*12,-90,90)
  step({"r":dx!=0 and p.vx<desired-1,"l":dx!=0 and p.vx>desired+1})
 print("SETTLED ",w.active_id," ",Vector2(w.active().p.x,w.active().p.y))
func _initialize():
 w=World.new(JSON.parse_string(FileAccess.get_file_as_string("res://data/world3.json")))
 w.enter("cl3-c3-upper",true)
 run(12,{"jump":true})
 run(12,{"u":true,"dash":true})
 run(12,{"l":true,"grab":true,"u":true})
 for hop in range(14):
  step({})
  step({"jump":true})
  for i in range(26): step({"l":true,"jump":i<12})
  print("HOP ",hop," ",w.active_id," ",Vector2(w.active().p.x,w.active().p.y))
  if w.active_id=="cl3-secret-e2" and w.active().p.y<=178: break
 run(12,{"r":true,"jump":true,"grab":true,"u":true})
 run(10,{"r":true})
 run(20,{})
 settle(24,149)
 var entered=false
 for part in w.data.world.tapes["cl3-secret-e2"]:
  if entered: break
  for i in range(int(part[0])):
   var raw={}
   for pair in [["l","l"],["r","r"],["u","u"],["d","d"],["jump","j"],["dash","x"],["grab","g"],["strike","s"]]: raw[pair[0]]=pair[1] in part[1]
   step(raw)
   if w.active_id!="cl3-secret-e2": entered=true;break
 run(100,{"r":true,"grab":true,"u":true})
 run(100,{"grab":true,"u":true})
 run(1,{"l":true,"jump":true,"grab":true})
 run(80,{"l":true})
 run(80,{})
 run(165,{"l":true})
 run(20,{})
 settle(16,149)
 run(1,{"d":true,"jump":true})
 run(100,{"d":true})
 var ok=w.active_id=="cl3-c3-upper" and w.active().deaths==0 and w.secret_hearts.has("secret-3")
 if ok:
  var file=FileAccess.open(OS.get_cmdline_user_args()[0],FileAccess.WRITE)
  file.store_string(JSON.stringify({"world":3,"start_room":"cl3-c3-upper","frames":w.frames,"tape":recording},"  ")+"\n")
  file.close()
 print("PASS" if ok else "FAIL"," Cog Heart entrance, challenge, reward and return · ",w.frames," frames · ",w.active().deaths," deaths · ",w.secret_hearts)
 w.shutdown()
 quit(0 if ok else 1)
