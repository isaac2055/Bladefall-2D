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
 check(p.has_world(21) and not p.has_world(101),"three bases unlock only Fractured Outskirts")
 for n in [22,23,101,102,103]: check(not p.has_world(n),"later advanced world stays locked: "+str(n))
 p.discovered["23"]={};p.discovered["103"]={}
 check(not p.has_world(23) and not p.has_world(103),"old discovery data cannot bypass sequential gates")
 check(not p.can_carry(21),"newly unlocked Fractured has no unearned flower pickup")
 for n in [21,22,23,101,102]:
  p.start(n);p.tick("end");p.finish()
  if n!=23: check(p.has_world(n+1),"clearing a world unlocks the next in its chain: "+str(n))
  if n in [21,22]: check(not p.has_world(101),"Core waits for all three Fractured clears")
  if n==23: check(p.has_world(101),"third Fractured clear opens Core Outskirts")
 var ui_path=path+".ui"
 var ui=Profile.new(ui_path)
 for n in [1,2]: ui.start(n);ui.tick("end");ui.finish()
 var app=Main.instantiate();app.test_mode=true;app.sampler=Run.new(ui_path);root.add_child(app)
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
 for first in [21]:
  check(app.sampler_overlay.content.get_children().any(func(node):return node is Button and node.text=="Continue to "+app.world_label(first)),"third-base results offer the first advanced route: "+str(first))
 check(not app.sampler_overlay.content.get_children().any(func(node):return node is Button and node.text=="Continue to "+app.world_label(101)),"third-base results cannot offer a locked Core")
 app.sampler.profile.discovered["101"]={};app.sampler.profile.completed["101"]=true;app.sampler.profile.garden(1).core=true
 app.sampler.profile.save_profile()
 var legacy=Profile.new(ui_path)
 check(not legacy.available(101) and legacy.garden(1).core and legacy.completed.get("101",false),"legacy premature Core discovery cannot bypass the gate; earned rewards remain")
 app.sampler.profile.completed.erase("101")
 app.sampler.profile.completed["21"]=true;app.sampler.profile.completed["22"]=true
 app.switch_chapter(23);app.restart_world();app.sampler.profile.tick("end");app.sampler.result=app.sampler.profile.finish()
 app.sampler_overlay.show_result()
 check(app.sampler_overlay.content.get_children().any(func(node):return node is Button and node.text=="Continue to "+app.world_label(101)),"third Fractured results offer Core Outskirts")
 app.title_screen.refresh_worlds()
 check(app.title_screen.worlds.get_item_index(101)>=0,"Core enters the title menu after all three Fractured clears")
 for n in app.CHAPTERS: app.SaveState.clear(app.sampler.profile,n)
 app.queue_free();await process_frame
 DirAccess.remove_absolute(ProjectSettings.globalize_path(ui_path))
 var saved=Profile.new(path)
 for n in [1,2,3,21,22,23,101,102,103]: preload("res://scripts/world_save.gd").clear(saved,n)
 DirAccess.remove_absolute(ProjectSettings.globalize_path(path))
 quit(1 if failures else 0)
