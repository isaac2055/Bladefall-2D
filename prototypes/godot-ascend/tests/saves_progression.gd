extends SceneTree
const World=preload("res://scripts/world.gd")
const Run=preload("res://scripts/sampler_run.gd")
const Save=preload("res://scripts/world_save.gd")
const Inputs=preload("res://tests/workshop_routes.gd")
const Main=preload("res://main.tscn")
var failed=0
var files=[]
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 if not ok: failed+=1
func profile(name):
 var path="user://save-tests-%d-%s.json"%[OS.get_process_id(),name]
 files.append(path)
 return Run.new(path)
func base_unlocks(p):
 for n in [1,2,3]: p.completed[str(n)]=true
func make(n): return World.new(JSON.parse_string(FileAccess.get_file_as_string("res://data/world%d.json"%n)))
func advance(w,r,keys):
 w.step(Inputs.decode(keys));w.update_region();r.tick(w)
func digest(core): return Save.digest(var_to_bytes([core.p,core.ents,core.combat,core.foes,core.frame,core.deaths]))
func _initialize(): run.call_deferred()
func run():
 var r=profile("rules")
 for n in [1,2,3]:
  r.profile.start(n);r.profile.tick("end",4)
  var result=r.profile.finish()
  check(r.profile.garden(n).root and not r.profile.garden(n).root_shiny,"normal clear with deaths grants the root: "+str(n))
  if n<3: check(r.profile.has_world(n+1),"beating base unlocks the next world even before arrival/restart")
  check(r.profile.available(21)==(n==3),"Fractured stays gated until all three base clears")
 r.profile.start(1);r.profile.tick("end");r.profile.finish()
 check(r.profile.garden(1).root_shiny,"deathless full base run upgrades root to shiny")
 var reload=preload("res://scripts/run_profile.gd").new(r.profile.path)
 check(reload.all_bases_clear() and reload.has_world(2) and reload.available(23) and reload.garden(1).root_shiny,"rewards/unlocks survive reload")
 for spec in [[2,"workshop-returning"],[22,"cl22-puzzle-lantern-above-door"],[23,"cl23-weight-airborne"],[102,"core-black-woods"]]:
  var n=spec[0];var id=spec[1]
  var w=make(n)
  w.enter(id,true)
  var attempt=profile(str(n));base_unlocks(attempt.profile);attempt.start(w)
  var tape=[]
  for part in w.data.world.tapes[id]:
   for i in range(int(part[0])): tape.append(part[1])
  var half=mini(130,tape.size()/2)
  for i in range(half): advance(w,attempt,tape[i])
  # Include unbanked items/return progress and exact moving-device phase.
  check(Save.write(w,attempt),"atomic live-world snapshot writes: "+str(n))
  var restored=make(n)
  var continued=Run.new(attempt.profile.path)
  check(Save.restore(restored,continued),"fresh process-shaped world restores: "+str(n))
  check(digest(w.active())==digest(restored.active()) and continued.profile.run==attempt.profile.run,"position, machinery, inventory, deaths, time and room progress match")
  var exact=true
  for i in range(half,mini(tape.size(),half+120)):
   advance(w,attempt,tape[i]);advance(restored,continued,tape[i])
   if digest(w.active())!=digest(restored.active()): exact=false;break
  check(exact,"restored gameplay follows identical subsequent inputs: "+str(n))
  Save.clear(attempt.profile,n)
  w.shutdown();restored.shutdown()
 # Entity references must remain references, not duplicate carried lantern/cart objects.
 var w=make(1)
 w.enter("cl1-o1-gate",true)
 var a=profile("carry");a.start(w)
 var lamp=w.active().ents.filter(func(e):return e.type=="lantern")[0]
 w.active().p.carrying=lamp
 check(Save.write(w,a),"carried-object state saves")
 var restored=make(1);var b=Run.new(a.profile.path)
 Save.restore(restored,b)
 check(restored.active().ents.any(func(e):return is_same(e,restored.active().p.carrying)),"carried object rebinds to its actual entity after load")
 # In-flight saves retain travel progress exactly.
 w.active().p.carrying=null
 a.begin_ride(w,w.data.world.campaignWorkshop.walks[0])
 for i in range(30): a.tick(w)
 var point=a.ride_point()
 Save.write(w,a);Save.restore(restored,b)
 check(b.ride_point().distance_to(point)<.0001,"in-flight travel resumes at the same point")
 # Shiny attempts have no resumable partial world.
 a.profile.garden(1).root=true;a.profile.garden(1).top=true;a.profile.garden(1).core=true;base_unlocks(a.profile)
 var core_world=make(101);a.start(core_world,true,true);core_world.active().core_run.index=2
 Save.write(core_world,a)
 var core_restore=make(101);var c=Run.new(a.profile.path)
 Save.restore(core_restore,c)
 check(not c.carrying() and core_restore.active().core_run.index==-1,"saved shiny attempt restarts the whole world, never its checkpoint")
 Save.clear(a.profile,101);core_world.shutdown();core_restore.shutdown()
 # Tampering/truncation and changed room data are rejected before decoding state.
 check(Save.read(a.profile,1,"wrong-content").is_empty(),"changed level revision cannot restore a stale snapshot")
 var file=FileAccess.open(Save.path(a.profile,1),FileAccess.WRITE);file.store_string("broken");file.close()
 check(Save.read(a.profile,1,w.content_signature).is_empty(),"corrupt save is rejected safely")
 Save.clear(a.profile,1);w.shutdown();restored.shutdown()
 # Purple hearts are permanent, unique and independent of a world restart.
 w=make(22);a=profile("hearts")
 var reward=w.data.branchRewards[0]
 w.claim_branch(reward);a.profile.collect_hearts(w);a.profile.collect_hearts(w)
 check(a.profile.heart_count(22)==1 and w.award_color=="#ba82e6","bonus awards a purple heart exactly once")
 w.restart();a.profile.collect_hearts(w)
 var p=preload("res://scripts/run_profile.gd").new(a.profile.path)
 check(p.heart_count(22)==1,"purple hearts persist through restart and reload")
 w.shutdown()
 # Public UI, no-skipping opening, contextual settings, Continue and collection reveal.
 var app=Main.instantiate();app.test_mode=true;app.sampler=profile("ui");root.add_child(app)
 await process_frame
 app.set_physics_process(false);app.set_dev_mode(false);app.game_started=false
 app.title_screen.open(true)
 check(not app.audio.voices_enabled,"spoken dialogue defaults off")
 check(not app.title_screen.menu.visible and app.title_screen.phase=="studio","opening starts without a Skip button")
 var event=InputEventKey.new();event.keycode=KEY_ENTER;event.pressed=true
 app.title_screen._input(event)
 check(app.title_screen.phase=="studio","opening input cannot skip the sequence")
 app.title_screen.show_title();app.root_ui.show();app.root_ui.move_to_front();app.set_paused(true)
 check(app.gameplay_settings_nodes.all(func(node):return not node.visible) and app.hud_nodes.all(func(node):return not node.visible) and app.settings_back.visible,"title Settings contains settings only")
 check(not app.garden_button.visible,"Garden is hidden before first Outskirts clear")
 app.sampler.profile.start(1);app.sampler.profile.tick("end",2);app.sampler.result=app.sampler.profile.finish()
 app.sampler_overlay.show_result()
 check(app.garden_button.visible and app.sampler.profile.has_world(2),"Outskirts clear unlocks Garden and Black Woods")
 app.restart_world()
 check(app.sampler.profile.has_world(2) and app.chapter_picker.get_item_index(2)>=0,"Restart world cannot hide Black Woods")
 app.title_screen.hide();app.root_ui.show();app.set_paused(true)
 check(app.gameplay_settings_nodes.all(func(node):return node.visible),"gameplay pause retains gameplay controls")
 app.world.active().p.x+=9
 app.maybe_autosave(true)
 app.title_screen.open(false)
 check(app.title_screen.play.text.begins_with("Continue"),"title offers Continue for a saved world")
 var pos=app.world.position()
 app.world.restart()
 app.title_screen.start_selected()
 check(app.world.position()==pos and app.sampler.profile.run.eligible,"Continue restores mid-world play with its scoring eligibility")
 print("SAVES/PROGRESSION FAILURES ",failed)
 app.queue_free();await process_frame
 for path in files:
  var cleanup_profile=preload("res://scripts/run_profile.gd").new(path)
  for n in [1,2,3,21,22,23,101,102,103]: Save.clear(cleanup_profile,n)
  if FileAccess.file_exists(path): DirAccess.remove_absolute(ProjectSettings.globalize_path(path))
 quit(1 if failed else 0)
