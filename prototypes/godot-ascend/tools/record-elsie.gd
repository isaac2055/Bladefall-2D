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
 w.update_region()
 if w.active_id=="cl2-w2-kitchen" and abs(w.active().p.x+4-88)<44 and abs(w.active().p.y+11-144)<25: w.elsie_voice()
func run(n,raw):
 for i in range(n): step(raw)
 print("RUN ",n," ",raw," => ",w.active_id," ",Vector2(w.active().p.x,w.active().p.y)," vel ",Vector2(w.active().p.vx,w.active().p.vy)," ground ",w.active().p.onGround," perch ",w.elsie_perch," deaths ",w.active().deaths)
func settle(x,y):
 for i in range(360):
  var p=w.active().p
  if p.x==x and abs(p.y-y)<=1 and abs(p.vx)<0.001 and p.onGround: break
  var dx=x-p.x
  var desired=clamp(dx*12,-90,90)
  step({"r":dx!=0 and p.vx<desired-1,"l":dx!=0 and p.vx>desired+1})
 print("SETTLED ",w.active_id," ",Vector2(w.active().p.x,w.active().p.y))
func _initialize():
 w=World.new(JSON.parse_string(FileAccess.get_file_as_string("res://data/world2.json")))
 w.enter("cl2-w2-kitchen",true)
 var stop=false
 for part in w.data.world.tapes["cl2-w2-kitchen"]:
  if stop: break
  for i in range(int(part[0])):
   var raw={}
   for pair in [["l","l"],["r","r"],["u","u"],["d","d"],["jump","j"],["dash","x"],["grab","g"],["strike","s"]]: raw[pair[0]]=pair[1] in part[1]
   step(raw)
   if w.active().p.x>=275: stop=true;break
 run(8,{})
 run(14,{"l":true})
 run(5,{})
 run(20,{"l":true,"jump":true})
 run(8,{"l":true,"u":true,"dash":true})
 run(18,{"l":true})
 run(1,{"r":true,"strike":true})
 run(8,{"l":true,"u":true,"dash":true})
 run(50,{"l":true})
 run(12,{})
 settle(24,133)
 for frame in range(240): step({"r":frame>=10 and frame<27,"jump":frame>=1 and frame<20,"grab":true,"u":true})
 for frame in range(121): step({"l":frame<12,"r":frame>=12 and frame<18 or frame>=26,"jump":frame>=18 and frame<40,"grab":frame>=26,"u":true})
 settle(16,133)
 var entered=false
 for part in w.data.world.tapes["cl2-w2-q-fork"]:
  if entered: break
  for i in range(int(part[0])):
   var raw={}
   for pair in [["l","l"],["r","r"],["u","u"],["d","d"],["jump","j"],["dash","x"],["grab","g"],["strike","s"]]: raw[pair[0]]=pair[1] in part[1]
   step(raw)
   if w.active_id!="cl2-w2-q-fork": entered=true;break
 print("FORK END ",w.active_id," ",Vector2(w.active().p.x,w.active().p.y)," lantern ",w.quest_lantern," perch ",w.elsie_perch," deaths ",w.active().deaths)
 run(75,{"l":true,"grab":true,"u":true})
 run(160,{"l":true})
 run(100,{"l":true})
 run(1,{"d":true,"jump":true})
 run(70,{"d":true})
 run(12,{"l":true})
 run(35,{})
 run(44,{"r":true})
 print("QUEST COMPLETE ",w.quest_complete," lantern ",w.quest_lantern," room ",w.active_id," deaths ",w.active().deaths)
 var ok=w.quest_complete and not w.quest_lantern and w.active_id=="cl2-w2-kitchen" and w.active().deaths==0
 if ok:
  var file=FileAccess.open(OS.get_cmdline_user_args()[0],FileAccess.WRITE)
  file.store_string(JSON.stringify({"world":2,"start_room":"cl2-w2-kitchen","frames":w.frames,"tape":recording},"  ")+"\n")
  file.close()
  print("PASS full Elsie quest · ",w.frames," normal-input frames · no deaths, warps, resets or forced quest steps")
 else: push_error("Full Elsie quest did not finish")
 w.shutdown()
 quit(0 if ok else 1)
