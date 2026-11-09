extends SceneTree
const Main=preload("res://main.tscn")
const Run=preload("res://scripts/sampler_run.gd")
const Controls=preload("res://scripts/controls.gd")
var failures=0
var app
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 if not ok: failures+=1
func finger(index,point,pressed=true,canceled=false):
 var event=InputEventScreenTouch.new();event.index=index;event.position=point;event.pressed=pressed;event.canceled=canceled
 app.touch_controls._input(event)
func drag(index,point):
 var event=InputEventScreenDrag.new();event.index=index;event.position=point;app.touch_controls._input(event)
func step(count):
 for frame in range(count): app._physics_process(1.0/60)
func _initialize(): run.call_deferred()
func run():
 var path="user://touch-test-%d.json"%OS.get_process_id()
 app=Main.instantiate();app.test_mode=true;app.sampler=Run.new(path);root.add_child(app)
 await process_frame
 app.set_physics_process(false);app.set_paused(false);app.title_screen.hide();app.game_started=true
 app.touch_controls.enabled=true
 var origin=app.world.position()
 finger(0,Vector2(160,660));drag(0,Vector2(245,660));step(20)
 check(Controls.read().r and app.world.position().x>origin.x+10,"real game moves from touch stick input")
 finger(1,Vector2(1170,704));step(2)
 check(Controls.read().r and Controls.read().jump and app.sim.p.vy<0,"independent fingers move and jump together")
 finger(1,Vector2(1170,704),false);finger(0,Vector2(245,660),false)
 check(not Controls.read().r and not Controls.read().jump,"releasing fingers releases only touch actions")
 finger(0,Vector2(160,660));drag(0,Vector2(230,590));finger(1,Vector2(1008,686))
 check(Controls.read().r and Controls.read().u and Controls.read().dash,"diagonal stick aim can be held with Dash")
 finger(1,Vector2(1008,686),false,true);finger(0,Vector2(230,590),false,true)
 check(Controls.touch.is_empty(),"touch cancellation cannot leave a stuck direction or action")
 for verb in ["grab","strike","parry","portal"]:
  finger(2,app.touch_controls.BUTTONS[verb].at)
  check(Controls.read()[verb],"touch supports "+verb)
  finger(2,Vector2.ZERO,false)
 Input.action_press(Controls.ACTIONS.l)
 finger(3,Vector2(160,660));drag(3,Vector2(80,660));app.touch_controls.release_all()
 check(Controls.read().l,"touch cleanup does not release a held keyboard/controller action")
 Input.action_release(Controls.ACTIONS.l)
 finger(3,Vector2(160,660));drag(3,Vector2(240,660))
 app.touch_controls._notification(NOTIFICATION_APPLICATION_FOCUS_OUT)
 check(Controls.touch.is_empty(),"focus loss releases all touch input")
 finger(4,Vector2(1200,174))
 check(app.paused and Controls.touch.is_empty(),"touch Pause opens settings and releases held actions")
 app.set_paused(false)
 finger(5,Vector2(160,660));drag(5,Vector2(240,660));get_root().size_changed.emit()
 check(Controls.touch.is_empty(),"rotation/resize cancels pending touches")
 for n in app.CHAPTERS: app.SaveState.clear(app.sampler.profile,n)
 app.queue_free();await process_frame
 DirAccess.remove_absolute(ProjectSettings.globalize_path(path))
 print("TOUCH CONTROLS FAILURES ",failures)
 quit(1 if failures else 0)
