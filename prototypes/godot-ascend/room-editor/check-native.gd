extends SceneTree
const Authoring=preload("res://scripts/authoring_data.gd")
const Codec=preload("res://authoring/codec.gd")
const Core=preload("res://scripts/core.gd")
const Loader=preload("res://scripts/room_loader.gd")
var failed=false
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 failed=failed or not ok
func _initialize(): run.call_deferred()
func run():
 var args=OS.get_cmdline_user_args()
 var source=JSON.parse_string(FileAccess.get_file_as_string("res://data/world4.json"))
 var original=Authoring.read(source,args[0])
 var no_edit=Authoring.read(source,args[1])
 var edited=Authoring.read(source,args[2])
 var restored=Authoring.read(source,args[3])
 check(Codec.first_difference(original,restored)=="","backup restoration preserves full native data, including prior demonstrations")
 check(Codec.first_difference(original,no_edit)=="","no-edit dedicated save preserves the complete native chapter")
 check(edited.world.rooms.size()==22,"edited native scene retains twenty-two rooms")
 for i in range(1,original.world.rooms.size()): check(Codec.first_difference(original.world.rooms[i],edited.world.rooms[i])=="","unselected room preserved: "+original.world.rooms[i].name)
 var room=edited.world.rooms[0]
 var parsed=Loader.parse(room)
 check(room.name=="Editor test room","room title reaches gameplay")
 check(parsed.grid[10*parsed.cols+5]==1 and parsed.grid[8*parsed.cols+5]==0,"moved terrain changes actual collision")
 check(parsed.entities.any(func(e):return e.type=="zip" and e.x==80 and e.y==152 and e.w==32 and e.tx==144 and e.ty==136 and e.get("holdFrames",30)==45),"moved lift, moved destination and timing reach the runtime")
 check(parsed.entities.any(func(e):return e.type=="refill" and e.x==128 and e.y==80),"new dragged refill reaches the runtime")
 check(room.workshopRoutes.is_empty() and edited.world.tapes[room.id].is_empty(),"changed room does not offer a stale solution")
 var app=preload("res://main.tscn").instantiate()
 app.test_mode=true;app.initial_world=4
 root.add_child(app)
 await process_frame
 app.set_physics_process(false)
 # Use the edited authored room through the same gameplay controller as a normal launch.
 app.world.data.world.rooms[0]=room
 app.world.data.world.tapes[room.id]=edited.world.tapes[room.id]
 app.world.parsed[room.id]=parsed
 app.world.cores[room.id].load_room(parsed)
 app.load_section(0)
 check(app.sim.room.name=="Editor test room" and app.watch_button.disabled,"actual game loads edited room and disables outdated demonstration")
 var before=app.sim.p.x
 for i in range(15): app.sim.step({"r":true})
 check(app.sim.p.x>before,"edited room accepts ordinary gameplay input")
 app.switch_chapter(1)
 check(not app.watch_button.disabled,"campaign reference button remains enabled")
 await app.close_app(1 if failed else 0)
