extends SceneTree
const Main=preload("res://main.tscn")
const Run=preload("res://scripts/sampler_run.gd")
const Bindings=preload("res://scripts/controls.gd")
const Remap=preload("res://scripts/control_remap.gd")
var app
var failed=0
var profile_path=""
var controls_path=""
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 if not ok: failed+=1
func labels(node):
 var out=[]
 if node is Label or node is BaseButton: out.append(node.text)
 for child in node.get_children(): out.append(labels(child))
 return "\n".join(out)
func joy(button,pressed=true,device=0):
 var event=InputEventJoypadButton.new();event.device=device;event.button_index=button;event.pressed=pressed
 Input.parse_input_event(event)
 return event
func axis(value):
 var event=InputEventJoypadMotion.new();event.axis=JOY_AXIS_LEFT_X;event.axis_value=value;Input.parse_input_event(event)
func shot(name):
 if DisplayServer.get_name()=="headless": return
 await process_frame
 await process_frame
 await RenderingServer.frame_post_draw
 root.get_texture().get_image().save_png("/tmp/bladefall-player-"+name+".png")
 print("PASS rendered ",name)
func _initialize(): run.call_deferred()
func run():
 var nonce=str(OS.get_process_id())+"-"+str(Time.get_ticks_usec())
 profile_path="user://player-release-"+nonce+".json"
 controls_path="user://player-controls-"+nonce+".cfg"
 app=Main.instantiate();app.test_mode=true;app.sampler=Run.new(profile_path)
 root.add_child(app)
 await process_frame
 app.set_physics_process(false)
 app.controls_menu.settings_path=controls_path
 Bindings.bind(controls_path)
 app.set_dev_mode(false)
 app.discover_current()
 check(app.chapter_picker.item_count==1 and app.chapter_picker.get_item_id(0)==1,"new player sees only Outskirts; no Test / Workshop or unknown worlds")
 check(app.room_picker.item_count==1 and app.room_picker.get_item_id(0)==0,"section menu contains only the arrived starting section")
 check(app.dev_nodes.all(func(node):return not node.visible),"mixer, visual settings and animation examples hidden")
 var uniform=true
 for chapter in app.chapters.values():
  var s=chapter.landscape
  uniform=uniform and s.knight_design==5 and s.npc_design==7 and s.environment_design==0 and s.walking_style==1 and s.environment_feel==2 and s.player_styles_locked
 check(uniform,"Brush knight, Paper Cutout people, Original scenery, Measured walking and Weathered treatment in every world")
 app.set_paused(true)
 await shot("pause")
 var before_focus=root.gui_get_focus_owner()
 joy(JOY_BUTTON_DPAD_RIGHT)
 await process_frame
 joy(JOY_BUTTON_DPAD_RIGHT,false)
 check(root.gui_get_focus_owner()!=null and root.gui_get_focus_owner()!=before_focus,"controller D-pad navigates focused pause buttons")
 for i in range(4): app.register_dev_tap()
 check(not app.dev_mode,"four dialogue clicks do not unlock developer mode")
 app.reset_dev_taps();app.register_dev_tap()
 check(not app.dev_mode,"interrupted tap sequence resets")
 for i in range(4): app.voices_button.pressed.emit()
 check(app.dev_mode and app.chapter_picker.item_count==9 and app.dev_nodes.all(func(node):return node.visible),"five consecutive spoken-dialogue clicks reveal developer settings")
 check(not labels(app.chapter_picker).contains("Test ·"),"Test label removed")
 app.chapters[1].landscape.environment_design=3
 app.chapters[1].landscape.knight_design=1
 app.set_dev_mode(false)
 check(app.landscape.environment_design==0 and app.landscape.knight_design==5,"leaving developer mode restores the requested player appearance")
 check(app.chapter_picker.item_count==1,"leaving developer mode restores discovery gates")
 var unseen=app.world.regions.find("cl1-o1-muster")
 var origin=app.world.active_id
 app.load_section(unseen)
 app.switch_chapter(3)
 check(app.world.active_id==origin and app.chapter_number==1,"hidden section/world cannot be loaded through player navigation")
 # Reference is a separate simulation: even a completed demo cannot move the live player.
 app.set_paused(false)
 var live=app.world.active()
 var position=Vector2(live.p.x,live.p.y)
 var discovered_before=app.sampler.profile.discovered.duplicate(true)
 app.toggle_watch()
 check(app.watch and app.sim!=live and app.watch_button.text=="Try yourself","player reference uses detached simulation and Try yourself")
 var solid=live.room.grid[0]
 app.sim.room.grid[0]=99
 check(live.room.grid[0]==solid,"reference terrain is a deep copy of the live room")
 app.sim.room.grid[0]=solid
 var machinery=live.room.boost[0]
 app.sim.room.boost[0]=17
 check(live.room.boost[0]==machinery,"reference machinery metadata is isolated from the live room")
 app.sim.room.boost[0]=machinery
 for i in range(100): app._physics_process(1.0/60)
 app.sim.p.x=app.sim.room.w-1;app.sim.exited=true
 app.next_section()
 check(app.world.active_id==origin and Vector2(live.p.x,live.p.y)==position and app.sampler.profile.discovered==discovered_before,"watch cannot move live player, advance sections or discover anything")
 app.toggle_watch()
 check(not app.watch and app.sim==app.world.active() and app.sim.p.x==app.sim.room.spawn.x and app.sim.p.y==app.sim.room.spawn.y,"Try yourself returns to the original section start, never the demo finish")
 check(app.sampler.profile.run.eligible and app.sampler.profile.run.deaths==1,"Try yourself counts a real retry and preserves the ability to finish the world")
 # Finishing a demo leaves a deliberate return/takeover choice in both modes.
 app.set_dev_mode(true)
 app.set_paused(false)
 app.toggle_watch()
 app.sim.exited=true
 app.hold=1
 app._physics_process(1.0/60)
 check(app.paused and app.watch and app.watch_button.text=="Take control" and app.world.active_id==origin,"developer reference completion keeps Take control available without an automatic room skip")
 app.toggle_watch()
 app.set_dev_mode(false)
 app.restart_world()
 # Discovery saves independently of the transient run and only exposes real arrivals.
 app.sampler.profile.discover(1,"cl1-o1-verge")
 app.rebuild_section_menu()
 check(app.room_picker.item_count==2,"only newly arrived real section is added, without placeholders")
 var loaded=preload("res://scripts/run_profile.gd").new(profile_path)
 check(loaded.has_room(1,"cl1-o1-verge") and not loaded.has_world(2),"discovered sections persist without unlocking unvisited worlds")
 # First completion UI, natural onward route, and bonus route arrival.
 app.sampler.profile.start(1)
 app.sampler.profile.tick("finish",3)
 app.sampler.result=app.sampler.profile.finish()
 app.sampler_overlay.showing_result=true
 app.sampler_overlay.show_result()
 check(labels(app.sampler_overlay.content).contains("Garden & records is now in Settings") and app.sampler.result.first_clear,"first Outskirts completion announces the Garden menu")
 await shot("first-clear")
 app.title_screen.open(false)
 var next_world=app.title_screen.worlds.get_item_index(2)
 check(next_world>=0,"Black Woods remains selectable after closing the completion screen")
 app.title_screen.worlds.select(next_world)
 app.title_screen.start_selected()
 check(app.chapter_number==2 and app.sampler.profile.has_world(2) and app.chapter_picker.item_count==2,"continue to the next world records arrival and exposes it")
 check(app.room_picker.item_count==1,"newly arrived world initially lists only its start")
 var remembered=preload("res://scripts/run_profile.gd").new(profile_path)
 remembered.discover(1,origin,false)
 check(remembered.last_world==2,"bootstrapping the first world does not erase the remembered title selection")
 app.travel_to_world(21)
 check(app.chapter_number==2,"Fractured cannot open before all three base clears")
 for base in [2,3]:
  app.sampler.profile.start(base);app.sampler.profile.tick("end",1);app.sampler.profile.finish()
 app.travel_to_world(21)
 check(app.chapter_number==21 and app.sampler.profile.has_world(21),"cleared base world offers its Fractured route without exposing later worlds")
 # Watching during a carried attempt cannot preserve a shiny checkpoint.
 app.sampler.profile.garden(1).root=true
 app.sampler.profile.garden(1).top=true
 app.world.restart()
 app.sampler.start(app.world,true,true)
 app.sync_sampler_scene()
 app.toggle_watch()
 app.toggle_watch()
 check(not app.sampler.carrying() and app.world.frames==0 and app.world.active_id==app.world.data.world.atlasStart,"Try yourself in a shiny attempt resets the full world")
 # Controller buttons, axes, keyboard fallback, remap and persistence use real InputMap events.
 app.controls_menu.open()
 app.controls_menu.hide()
 joy(JOY_BUTTON_A)
 await process_frame
 check(Bindings.read().jump,"controller south button drives gameplay Jump action")
 joy(JOY_BUTTON_A,false)
 for device in [1,3]:
  joy(JOY_BUTTON_A,true,device)
  await process_frame
  check(Bindings.read().jump,"a secondary/reconnected controller drives Jump: "+str(device))
  joy(JOY_BUTTON_A,false,device)
 axis(-1)
 await process_frame
 check(Bindings.read().l and not Bindings.read().r,"left-stick axis drives movement")
 axis(0)
 app.controls_menu.open()
 app.controls_menu.listen("jump",true)
 var y=InputEventJoypadButton.new();y.button_index=JOY_BUTTON_Y;y.pressed=true
 app.controls_menu._input(y)
 check(InputMap.action_get_events(Bindings.ACTIONS.jump).any(func(e):return e is InputEventJoypadButton and e.button_index==JOY_BUTTON_Y),"controller Jump remap applies")
 check(InputMap.action_get_events(Bindings.ACTIONS.jump).any(func(e):return e is InputEventKey),"controller remap preserves keyboard fallback")
 Bindings.bind(controls_path)
 joy(JOY_BUTTON_Y,true,3)
 await process_frame
 check(Bindings.read().jump,"saved controller binding reloads and drives Jump")
 joy(JOY_BUTTON_Y,false,3)
 var key=InputEventKey.new();key.physical_keycode=KEY_T;key.pressed=true
 app.controls_menu.listen("jump",false);app.controls_menu._input(key)
 Bindings.bind(controls_path)
 check(InputMap.action_get_events(Bindings.ACTIONS.jump).any(func(e):return e is InputEventKey and e.physical_keycode==KEY_T),"keyboard remap also persists")
 app.controls_menu.listen("dash",true)
 var cancel=InputEventJoypadButton.new();cancel.button_index=JOY_BUTTON_START;cancel.pressed=true
 app.controls_menu._input(cancel)
 check(app.controls_menu.waiting=="","Start cancels binding capture so controller users cannot become trapped")
 app.controls_menu.connection_changed(0,false)
 check(app.controls_menu.message.text.contains("Keyboard controls remain"),"controller disconnect retains keyboard navigation")
 await shot("controls")
 app.controls_menu.close()
 # Opening is paused, skippable and reaches an interactive discovery-filtered title.
 app.title_screen.open(true)
 var frames=app.world.frames
 app._physics_process(1.0/60)
 check(app.world.frames==frames and app.paused,"gameplay and run clock wait behind opening/title")
 app.title_screen.age=2.6
 await shot("studio")
 app.title_screen._process(2)
 check(app.title_screen.phase=="cutscene","Willow Studios animation transitions to Bladefall cutscene")
 app.title_screen.age=4.7
 await shot("cutscene")
 app.title_screen._process(2)
 check(app.title_screen.phase=="title" and app.title_screen.menu.visible,"animated cutscene resolves to title menu")
 check(app.title_screen.worlds.item_count==4,"title menu includes the base worlds and Fractured Outskirts, with Cores still locked")
 await shot("title")
 app.controls_menu.open()
 check(app.controls_menu.visible and app.controls_menu.get_index()>app.title_screen.get_index(),"title-screen remapping opens above the title, with controller focus")
 app.controls_menu.close()
 check(root.gui_get_focus_owner()==app.title_screen.play,"closing title remapping restores Play focus")
 var settings_button=app.title_screen.menu.get_children().filter(func(n):return n is Button and n.text=="Settings")[0]
 settings_button.pressed.emit()
 check(app.root_ui.visible and app.pause_panel.is_visible_in_tree(),"title Settings opens a visible player pause/settings card")
 app.set_paused(false)
 check(app.paused and not app.root_ui.visible,"returning from title Settings keeps the world paused behind the title")
 var reduced=app.landscape.reduced_motion
 app.landscape.reduced_motion=true
 app.title_screen.open(true)
 check(app.title_screen.phase=="title","reduced-motion preference skips animated opening")
 app.landscape.reduced_motion=reduced
 check(app.title_screen.worlds.get_item_index(101)<0,"Core is absent before the three Fractured clears")
 for n in [21,22,23]: app.sampler.profile.completed[str(n)]=true
 app.title_screen.refresh_worlds()
 var core_index=app.title_screen.worlds.get_item_index(101)
 check(core_index>=0,"first Core is available after all three Fractured clears")
 app.title_screen.worlds.select(core_index)
 app.title_screen.start_selected()
 check(app.chapter_number==101 and app.sampler.profile.has_world(101),"Core first arrival is reachable without developer mode")
 app.title_screen.open(false)
 app.title_screen.start_selected()
 check(not app.title_screen.visible and not app.paused and app.root_ui.visible and app.sampler.profile.run.eligible,"title Play starts a fresh eligible journey")
 check(InputMap.action_get_events(Bindings.ACTIONS.pause).any(func(e):return e is InputEventKey and e.physical_keycode==KEY_ESCAPE),"Escape always remains a safe menu fallback")
 print("PHYSICAL CONTROLLERS ",Input.get_connected_joypads())
 print("PLAYER RELEASE FAILURES ",failed)
 app.queue_free()
 await process_frame
 for n in [1,2,3,21,22,23,101,102,103]: preload("res://scripts/world_save.gd").clear(preload("res://scripts/run_profile.gd").new(profile_path),n)
 DirAccess.remove_absolute(ProjectSettings.globalize_path(profile_path))
 DirAccess.remove_absolute(ProjectSettings.globalize_path(controls_path))
 quit(1 if failed else 0)
