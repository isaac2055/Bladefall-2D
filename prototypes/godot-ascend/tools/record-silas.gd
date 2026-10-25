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
 if w.active_id=="cl3-c3-patrol" and abs(w.active().p.x+4-88)<44 and abs(w.active().p.y+11-112)<25: w.silas_voice()
 if "death" in w.active().events: print("DEATH ",w.active_id," ",Vector2(w.active().p.x,w.active().p.y))
func run(n,raw):
 for i in range(n): step(raw)
 print("RUN ",n," ",raw," => ",w.active_id," ",Vector2(w.active().p.x,w.active().p.y)," vel ",Vector2(w.active().p.vx,w.active().p.vy)," stage ",w.silas_step," key ",w.quest_key," deaths ",w.active().deaths)
func settle(x,y):
 for i in range(360):
  var p=w.active().p
  if p.x==x and abs(p.y-y)<=1 and p.vx==0 and p.onGround: break
  var dx=x-p.x
  var desired=clamp(dx*12,-90,90)
  step({"r":dx!=0 and p.vx<desired-1,"l":dx!=0 and p.vx>desired+1})
 print("SETTLED ",w.active_id," ",Vector2(w.active().p.x,w.active().p.y))
func tape(id):
 var entered=false
 for part in w.data.world.tapes[id]:
  if entered: break
  for i in range(int(part[0])):
   var raw={}
   for pair in [["l","l"],["r","r"],["u","u"],["d","d"],["jump","j"],["dash","x"],["grab","g"],["strike","s"]]: raw[pair[0]]=pair[1] in part[1]
   step(raw)
   if w.active_id!=id or (id=="cl3-c3-q-governor" and w.active().p.x>=285): entered=true;break
 print("TAPE ",id," => ",w.active_id," ",Vector2(w.active().p.x,w.active().p.y))
func _initialize():
 w=World.new(JSON.parse_string(FileAccess.get_file_as_string("res://data/world3.json")))
 w.enter("cl3-c3-patrol",true)
 run(20,{"l":true})
 run(8,{})
 # Climb the two-tile branch shaft in the patrol road's west wall.
 run(18,{"jump":true,"l":true})
 run(12,{"u":true,"dash":true})
 run(90,{"l":true,"grab":true,"u":true})
 run(8,{"r":true,"jump":true,"grab":true,"u":true})
 run(12,{"r":true})
 run(25,{})
 settle(24,149)
 tape("cl3-c3-q-ladder")
 for i in range(90):
  step({"r":true,"grab":true,"u":true})
  if w.active_id=="cl3-c3-q-governor" and w.active().p.y==117 and w.active().p.onGround: break
 settle(16,117)
 tape("cl3-c3-q-governor")
 run(8,{})
 for i in range(144):
  if w.active().frame%144<40: break
  step({})
 run(1,{"strike":true})
 run(24,{"r":true})
 run(100,{"r":true,"grab":true,"u":true})
 run(100,{"grab":true,"u":true})
 run(1,{"l":true,"jump":true,"grab":true})
 run(200,{"l":true})
 run(100,{"l":true})
 run(100,{})
 run(1,{"d":true,"jump":true})
 run(12,{"d":true,"dash":true})
 run(70,{"d":true})
 run(32,{"l":true})
 run(45,{})
 run(150,{"l":true,"grab":true,"u":true})
 settle(16,149)
 run(1,{"d":true,"jump":true})
 run(70,{"d":true})
 run(42,{"r":true})
 run(12,{})
 settle(64,101)
 tape("cl3-c3-patrol")
 settle(16,149)
 tape("cl3-c3-chain")
 var ok=w.quest_complete and not w.quest_key and w.active().deaths==0
 if ok:
  var file=FileAccess.open(OS.get_cmdline_user_args()[0],FileAccess.WRITE)
  file.store_string(JSON.stringify({"world":3,"start_room":"cl3-c3-patrol","frames":w.frames,"tape":recording},"  ")+"\n")
  file.close()
 print("PASS" if ok else "FAIL"," full Silas quest · ",w.frames," normal-input frames · completion ",w.quest_complete," key ",w.quest_key," deaths ",w.active().deaths)
 w.shutdown()
 quit(0 if ok else 1)
