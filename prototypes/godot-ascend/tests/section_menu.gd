extends SceneTree
const Main=preload("res://main.tscn")
const Menu=preload("res://scripts/section_menu.gd")
var failures=[]
func _initialize(): run.call_deferred()
func check(ok,message):
 if not ok: failures.append(message);push_error(message)
func run():
 var app=Main.instantiate()
 app.test_mode=true
 root.add_child(app)
 await process_frame
 app.set_physics_process(false)
 for number in [1,2,3,21,22,23,4]:
  app.switch_chapter(number)
  var rooms=app.data.world.rooms
  var entries=Menu.entries(app.data)
  check(entries.size()==app.room_picker.item_count,"world %d menu population"%number)
  var shown=[]
  for i in range(entries.size()):
   var raw=app.room_picker.get_item_id(i)
   var room=rooms[raw]
   check(not room.get("name","").strip_edges().is_empty(),"named destination "+room.id)
   check(room.map.any(func(row):return "P" in row),"authored spawn "+room.id)
   check(not shown.has(room.id),"unique menu destination "+room.id)
   shown.append(room.id)
   app.set_paused(true)
   app.room_picker.item_selected.emit(i)
   check(not app.paused and app.current==raw and app.sim.room.id==room.id,"selection loads actual room "+room.id)
   check(app.room_picker.selected==i,"selection follows raw room ID "+room.id)
   check(app.sim.p.x>=0 and app.sim.p.x+app.sim.p.w<=app.sim.room.w and app.sim.p.y>=0 and app.sim.p.y+app.sim.p.h<=app.sim.room.h,"spawn within room "+room.id)
  for room in rooms:
   if not room.get("name","").strip_edges().is_empty(): check(shown.has(room.id),"all named destinations retained "+room.id)
  for section in app.data.world.sections:
   var def=rooms.filter(func(room):return room.id==section.room)[0]
   if not def.get("name","").strip_edges().is_empty(): check(shown.has(section.room),"main destination retained "+section.room)
  var expected=[]
  for section in app.data.world.sections:
   if shown.has(section.room): expected.append(section.room)
  if number==1:
   check(shown.find("godot-overlook-stair")+1==shown.find("cl1-atlas-crossroads"),"native stair appears immediately before the overlook")
   expected.erase("godot-overlook-stair")
   var without_stair=shown.duplicate()
   without_stair.erase("godot-overlook-stair")
   check(without_stair.slice(0,expected.size())==expected,"other Outskirts destinations retain road order")
  else: check(shown.slice(0,expected.size())==expected,"main road menu order in world %d"%number)
  for room in rooms:
   if room.get("name","").strip_edges().is_empty():
    app.load_section(rooms.find(room))
    check(app.room_picker.selected==-1 and app.room_picker.text=="Connecting passage","internal connector never selects another destination "+room.id)
    break
  app.restart_world()
  check(app.room_picker.get_selected_id()==app.current and app.sim.room.id==rooms[app.current].id,"restart selection matches actual starting room in world %d"%number)
  print("CHECKED world %d · %d destinations, %d internal pieces hidden"%[number,entries.size(),rooms.size()-entries.size()])
 # Raw index launchers and Watch still use room indices, independently of menu order.
 app.switch_chapter(21)
 app.load_section(41)
 check(app.sim.room.id=="cl21-puzzle-walked-ceiling","existing room launcher index preserved")
 app.switch_chapter(4)
 app.load_section(0)
 app.workshop_completed[app.sim.room.id]=true
 app.rebuild_section_menu()
 check(app.room_picker.get_item_text(0).begins_with("✓ "),"workshop completion marker preserved")
 app.restart_world()
 check(not app.room_picker.get_item_text(0).begins_with("✓ "),"workshop restart clears marker")
 app.queue_free()
 await process_frame
 print("SECTION MENU PASSED" if failures.is_empty() else "SECTION MENU FAILED: "+str(failures))
 quit(0 if failures.is_empty() else 1)
