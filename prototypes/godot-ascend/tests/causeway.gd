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
 var outskirts=app.world
 app.chapter_picker.item_selected.emit(2)
 var w=app.world
 check(app.chapter_number==3 and w.cores.size()==28,"chapter selector loads all 28 Causeway rooms")
 check(app.landscape.causeway and app.audio.music.stream==app.audio.stream(app.audio.manifest.chapters["3"].music,true),"Causeway art and existing score selected")
 app.switch_chapter(1)
 check(app.world==outskirts,"Outskirts state survives chapter switch")
 app.switch_chapter(3)
 check(app.world==w,"Causeway state survives chapter switch")
 for section in w.data.world.sections:
  if not w.data.world.tapes.has(section.room): continue
  app.watch=true
  app.load_section(w.regions.find(section.room))
  var sim=app.sim
  for i in range(app.tape.size()): app._physics_process(1.0/60)
  check(sim.exited and sim.deaths==0,"Watch finishes "+section.room)
 app.watch=false
 w.enter("cl3-c3-brace",true)
 app.audio.room_changed(w.active())
 check(app.audio.music.stream==app.audio.stream(app.audio.manifest.chapters["3"].bossMusic,true),"existing Iron Juggernaut score plays in Brute arenas")
 w.restart()
 app.audio.room_changed(w.active())
 w.silas_voice()
 var sp=w.data.quest.tooth
 w.enter(sp.room,true)
 var c=w.active()
 c.p.x=sp.x-12
 c.p.y=sp.y-5
 c.p.strikeDir={"x":1,"y":0}
 c.p.strikeTimer=5
 c.frame=70
 w.tick_silas()
 check(w.silas_step==0 and w.governor_flash>0,"closed governor tooth clangs without advancing")
 c.p.strikeTimer=0
 w.tick_silas()
 c.p.strikeTimer=5
 c.frame=144
 w.tick_silas()
 check(w.silas_step==1 and not w.quest_complete,"bright tooth stops the governor")
 sp=w.data.quest.giver
 w.enter(sp.room,true)
 c=w.active()
 c.p.x=sp.x-4
 c.p.y=sp.y-5.5
 w.tick_silas()
 check(w.quest_key,"Silas hands over the key after the governor stops")
 c.deaths+=1
 c.p.state="dead"
 w.tick_silas()
 check(not w.quest_key and w.silas_step==1,"death returns key to Silas while retaining stopped governor")
 w.enter(sp.room,true)
 c=w.active()
 c.p.x=sp.x-4
 c.p.y=sp.y-5.5
 w.tick_silas()
 sp=w.data.quest.hook
 w.enter(sp.room,true)
 c=w.active()
 c.p.x=sp.x-4
 c.p.y=sp.y-5.5
 w.tick_silas()
 check(w.quest_complete and w.heart_count()==1 and w.quest_award_frame==w.frames,"hanging the key grants one heart with award animation")
 var award=w.quest_award_frame
 w.tick_silas()
 w.retry()
 check(w.quest_complete and w.quest_award_frame==award and w.heart_count()==1,"retry retains quest reward without duplicate awards")
 for key in ["defector:line0","defector:line1","defector:done"]:
  check(app.audio.manifest.voices.has(key) and app.audio.stream(app.audio.manifest.voices[key].path)!=null,"existing recording decodes: "+key)
 w.restart()
 check(not w.silas_met and w.silas_step==0 and not w.quest_complete and not w.quest_key,"restart clears Causeway quest and rewards")
 app.queue_free()
 await process_frame
 await create_timer(.15).timeout
 quit(1 if failed else 0)
