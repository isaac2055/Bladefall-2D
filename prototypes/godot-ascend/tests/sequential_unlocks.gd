extends SceneTree
const Profile=preload("res://scripts/run_profile.gd")
const Main=preload("res://main.tscn")
const Run=preload("res://scripts/sampler_run.gd")
var failures=0
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 if not ok: failures+=1
func _initialize(): run.call_deferred()
func run():
 var path="user://sequence-%d.json"%OS.get_process_id()
 var p=Profile.new(path)
 for n in [1,2,3]: p.start(n);p.tick("end");p.finish()
 check(p.has_world(21) and p.has_world(101),"three bases unlock only the first of each advanced chain")
 for n in [22,23,102,103]: check(not p.has_world(n),"later advanced world stays locked: "+str(n))
 p.discovered["23"]={};p.discovered["103"]={}
 check(not p.has_world(23) and not p.has_world(103),"old discovery data cannot bypass sequential gates")
 check(not p.can_carry(21),"newly unlocked Fractured has no unearned flower pickup")
 for n in [21,22,101,102]:
  p.start(n);p.tick("end");p.finish()
  check(p.has_world(n+1),"clearing a world unlocks the next in its chain: "+str(n))
 var app=Main.instantiate();app.test_mode=true;app.sampler=Run.new(path);root.add_child(app)
 await process_frame
 app.set_physics_process(false)
 check(not app.chapters.has(4) and not app.CHAPTERS.has(4),"Movement Workshop is absent even in developer mode")
 check(app.audio.chapter_audio(21).music==app.audio.chapter_audio(1).music,"Fractured Outskirts uses replacement Midnight Field")
 for n in [2,3]:
  check(app.audio.chapter_audio(n+20).music!=app.audio.chapter_audio(n).music,"Fractured retains its distinct regional score: "+str(n))
  check(app.audio.chapter_audio(n+100).music==app.audio.chapter_audio(n).music,"Core uses base regional score: "+str(n))
 app.switch_chapter(3);app.restart_world()
 app.sampler.profile.tick("end");app.sampler.result=app.sampler.profile.finish()
 app.sampler_overlay.showing_result=true;app.sampler_overlay.show_result()
 for first in [21,101]:
  check(app.sampler_overlay.content.get_children().any(func(node):return node is Button and node.text=="Continue to "+app.world_label(first)),"third-base results offer the first advanced route: "+str(first))
 app.queue_free();await process_frame
 var saved=Profile.new(path)
 for n in [1,2,3,21,22,23,101,102,103]: preload("res://scripts/world_save.gd").clear(saved,n)
 DirAccess.remove_absolute(ProjectSettings.globalize_path(path))
 quit(1 if failures else 0)
