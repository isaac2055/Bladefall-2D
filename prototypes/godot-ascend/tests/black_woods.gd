extends SceneTree
const Main=preload("res://main.tscn")
var app
func _initialize(): run.call_deferred()
func check(ok,message):
 if not ok:
  push_error(message)
  app.queue_free()
  quit(1)
  return false
 print("PASS ",message)
 return true
func run():
 app=Main.instantiate()
 app.test_mode=true
 root.add_child(app)
 await process_frame
 app.set_physics_process(false)
 var outskirts=app.world
 outskirts.bearings.ASH=true
 app.chapter_picker.item_selected.emit(1)
 if not check(app.chapter_number==2 and int(app.data.world.n)==2 and app.world.cores.size()==27,"Black Woods chapter selector activates all 27 preloaded rooms"): return
 if not check(app.landscape.forest and app.audio.music.stream==app.audio.stream(app.audio.manifest.chapters["2"].music,true),"forest presentation and reused regional score selected"): return
 var woods=app.world
 woods.active().p.x+=2
 var point=woods.position()
 app.switch_chapter(1)
 if not check(app.world==outskirts and app.world.bearings.has("ASH"),"switching back preserves Outskirts progress"): return
 app.switch_chapter(2)
 if not check(app.world==woods and woods.position()==point,"returning preserves Black Woods position and simulations"): return
 # Every imported main-road route runs through the actual application Watch mode.
 for section in app.data.world.sections:
  var id=section.room
  if not app.data.world.tapes.has(id): continue
  app.watch=true
  app.load_section(app.world.regions.find(id))
  var sim=app.sim
  for i in range(app.tape.size()): app._physics_process(1.0/60.0)
  if not check(sim.exited and sim.deaths==0,"Watch reaches "+id+" exit without death"): return
 app.watch=false
 var w=app.world
 w.restart()
 w.elsie_voice()
 for perch in w.data.quest.perches:
  w.enter(perch.room,true)
  w.active().p.x=perch.x-4
  w.active().p.y=perch.y-5.5
  w.tick_elsie()
 if not check(w.quest_lantern and not w.quest_complete,"existing route-derived moth perches give Elsie's lantern"): return
 w.active().deaths+=1
 w.active().p.state="dead"
 w.tick_elsie()
 if not check(not w.quest_lantern and w.elsie_perch==4,"death returns the lantern to the final moth perch"): return
 var last=w.data.quest.perches[4]
 w.enter(last.room,true)
 w.active().p.x=last.x-4
 w.active().p.y=last.y-5.5
 w.tick_elsie()
 w.enter("cl2-w2-kitchen",true)
 w.active().p.x=88
 w.active().p.y=132.5
 w.tick_elsie()
 if not check(w.quest_complete and not w.quest_lantern and w.quest_award_frame==w.frames,"hand-in at Elsie grants the heart and award animation"): return
 var frame=w.quest_award_frame
 w.frames+=60
 w.tick_elsie()
 if not check(w.quest_award_frame==frame,"completed quest cannot award a duplicate heart"): return
 for key in ["refuge:line0","refuge:line1","refuge:done"]:
  if not check(app.audio.manifest.voices.has(key) and app.audio.stream(app.audio.manifest.voices[key].path)!=null,"existing recording resolves: "+key): return
 w.restart()
 if not check(not w.elsie_met and not w.quest_complete and not w.quest_lantern,"full restart resets Black Woods quest state"): return
 app.queue_free()
 await process_frame
 quit(0)
