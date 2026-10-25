extends SceneTree
const Main=preload("res://main.tscn")
var app
var failed=false
func _initialize(): run.call_deferred()
func check(ok,message):
 print("PASS " if ok else "FAIL ",message)
 failed=failed or not ok
func run():
 app=Main.instantiate()
 app.test_mode=true
 root.add_child(app)
 await process_frame
 app.set_physics_process(false)
 check(app.chapters.size()==6 and app.chapter_picker.item_count==6,"six preloaded Ascend chapters are selectable")
 var counts={21:38,22:37,23:37}
 for number in [21,22,23]:
  app.chapter_picker.item_selected.emit(app.CHAPTERS.find(number))
  var w=app.world
  check(app.chapter_number==number and w.cores.size()==counts[number],"all authored rooms loaded for "+w.data.world.name)
  check(app.landscape.fractured,"Fractured presentation selected")
  check(app.audio.music.stream==app.audio.stream(app.audio.manifest.chapters[str(number)].music,true),"existing regional score selected")
  var routes=0
  for d in app.data.world.rooms:
   if not app.data.world.tapes.has(d.id) or d.get("atlasTransit",false) or "-socket-" in d.id: continue
   app.watch=true
   app.load_section(w.regions.find(d.id))
   var sim=app.sim
   for i in range(app.tape.size()):
    app._physics_process(1.0/60)
    if sim.exited: break
   check(sim.exited and sim.deaths==0,"Watch completes "+d.id)
   routes+=1
  print("WATCHED ",number," · ",routes," authored routes")
  app.watch=false
  w.restart()
  app.sim=w.active()
  # Gating is tested as a fixture; continuous branch journeys prove physical access separately.
  for reward in w.data.branchRewards:
   w.enter(reward.room,true)
   var c=w.active()
   c.p.x=reward.x-4
   c.p.y=reward.y-5.5
   w.tick_branch_rewards()
   check(not w.branch_hearts.has(reward.id),"practice/back entry seals "+reward.id)
  w.restart()
  for reward in w.data.branchRewards:
   w.enter(reward.host,true)
   w.enter(reward.rooms[0])
   if reward.room!=reward.rooms[0]: w.enter(reward.room)
   var c=w.active()
   c.p.x=reward.x-4
   c.p.y=reward.y-5.5
   w.tick_branch_rewards()
   check(w.branch_hearts.has(reward.id),"front entry and completion awards "+reward.id)
   var count=w.heart_count()
   var award=w.quest_award_frame
   w.tick_branch_rewards()
   w.retry()
   check(w.heart_count()==count and w.quest_award_frame==award,"reward awarded once and retained on retry: "+reward.id)
  w.restart()
  check(w.heart_count()==0,"restart clears Fractured rewards")
  var position=w.position()
  app.switch_chapter(1)
  app.switch_chapter(number)
  check(app.world==w and w.position()==position,"chapter switch preserves Fractured position and state")
 app.queue_free()
 await process_frame
 await create_timer(.15).timeout
 quit(1 if failed else 0)
