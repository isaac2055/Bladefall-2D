extends SceneTree
const World=preload("res://scripts/world.gd")
var w
func step(raw):
 w.step(raw)
 w.update_region()
func run(n,raw):
 for i in range(n): step(raw)
func _initialize():
 w=World.new(JSON.parse_string(FileAccess.get_file_as_string("res://data/world2.json")))
 w.enter("cl2-w2-descent",true)
 run(8,{"jump":true})
 run(18,{"u":true,"dash":true})
 run(20,{"l":true,"grab":true,"u":true})
 for i in range(200):
  step({"grab":true,"u":true})
  if w.active().p.y<=22 and w.active().p.state=="climb": break
 run(0,{})
 run(12,{"r":true,"jump":true,"grab":true,"u":true})
 run(6,{"r":true,"grab":true,"u":true})
 run(12,{"l":true,"jump":true,"grab":true,"u":true})
 run(6,{"grab":true,"u":true})
 run(12,{"r":true,"jump":true,"grab":true,"u":true})
 run(20,{"r":true,"grab":true,"u":true})
 run(1,{"jump":true,"grab":true})
 run(12,{"jump":true})
 run(12,{"r":true})
 run(8,{})
 var target=w.active().room.spawn
 for i in range(240):
  var p=w.active().p
  if p.x==target.x and p.y==target.y and p.vx==0 and p.onGround: break
  var dx=target.x-p.x
  var desired=clamp(dx*12,-90,90)
  step({"r":dx!=0 and p.vx<desired-1,"l":dx!=0 and p.vx>desired+1})
 var entered=false
 for part in w.data.world.tapes["cl2-secret-w2"]:
  if entered: break
  var raw={}
  for pair in [["l","l"],["r","r"],["u","u"],["d","d"],["jump","j"],["dash","x"],["grab","g"],["strike","s"]]: raw[pair[0]]=pair[1] in part[1]
  for i in range(int(part[0])):
   step(raw)
   if w.active_id!="cl2-secret-w2": entered=true;break
 run(100,{"r":true,"grab":true,"u":true})
 run(100,{"grab":true,"u":true})
 run(1,{"l":true,"jump":true,"grab":true})
 run(180,{"l":true})
 run(120,{"l":true})
 run(100,{})
 var ok=w.active_id=="cl2-w2-clearing" and w.active().deaths==0 and w.secret_hearts.has("secret-2")
 print("PASS" if ok else "FAIL"," normal-input secret entrance, challenge, Moss Heart and full return · ",w.frames," frames · ",w.active().deaths," deaths · heart ",w.secret_hearts)
 if ok:
  var award=w.quest_award_frame
  w.claim_secret(w.data.secretRewards[0])
  ok=w.heart_count()==1 and w.quest_award_frame==award
  w.retry()
  ok=ok and w.secret_hearts.has("secret-2")
  w.restart()
  ok=ok and w.secret_hearts.is_empty()
  w.enter("cl2-secret-w2",true)
  var reward=w.data.secretRewards[0]
  w.active().p.x=reward.x-4
  w.active().p.y=reward.y-5.5
  w.tick_secret_hearts()
  ok=ok and w.secret_hearts.is_empty()
  print("PASS" if ok else "FAIL"," secret reward persistence, no duplicate award, restart and sealed preview/back entry")
 w.shutdown()
 quit(0 if ok else 1)
