extends SceneTree
const World=preload("res://scripts/world.gd")
func _initialize():
 var w=World.new(JSON.parse_string(FileAccess.get_file_as_string("res://data/world3.json")))
 var tour=JSON.parse_string(FileAccess.get_file_as_string("res://data/cog-heart-tour.json"))
 w.enter(tour.start_room,true)
 var visited={}
 for part in tour.tape:
  var raw={}
  for pair in [["l","l"],["r","r"],["u","u"],["d","d"],["jump","j"],["dash","x"],["grab","g"],["strike","s"]]: raw[pair[0]]=pair[1] in part[1]
  for i in range(int(part[0])):
   w.step(raw)
   w.update_region()
   visited[w.active_id]=true
 var ok=w.frames==tour.frames and w.active_id==tour.start_room and w.active().deaths==0 and w.secret_hearts.has("secret-3")
 for id in ["cl3-secret-e2","cl3-pass-14","cl3-pass-15","cl3-pass-16"]:
  ok=ok and visited.has(id)
 print("PASS" if ok else "FAIL"," full Cog Heart entrance, challenge and return · ",w.frames," normal-input frames · ",w.active().deaths," deaths")
 var award=w.quest_award_frame
 w.claim_secret(w.data.secretRewards[0])
 w.retry()
 ok=ok and w.heart_count()==1 and w.quest_award_frame==award
 w.restart()
 ok=ok and w.heart_count()==0
 w.enter("cl3-secret-e2",true)
 var reward=w.data.secretRewards[0]
 w.active().p.x=reward.x-4
 w.active().p.y=reward.y-5.5
 w.tick_secret_hearts()
 ok=ok and w.heart_count()==0
 print("PASS" if ok else "FAIL"," reward retained on retry, awarded once, reset on restart and sealed on practice/back entry")
 w.shutdown()
 quit(0 if ok else 1)
