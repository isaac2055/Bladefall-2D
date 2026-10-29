extends SceneTree
const Authoring=preload("res://scripts/authoring_data.gd")
const Core=preload("res://scripts/core.gd")
const Loader=preload("res://scripts/room_loader.gd")
var failed=false
func check(ok,label):
 print("PASS " if ok else "FAIL ",label);failed=failed or not ok
func _initialize():
 var args=OS.get_cmdline_user_args()
 var source=JSON.parse_string(FileAccess.get_file_as_string("res://data/world4.json"))
 var data=Authoring.read(source,args[0]);var room=data.world.rooms[int(args[1])]
 var core=Core.new(data.constants.duplicate(true),data.playerDefaults);core.load_room(Loader.parse(room))
 var definitions=room.get("recoilPlatforms",[])+room.get("hingeArms",[])
 check(not definitions.is_empty(),"browser-added mechanisms reach the compiled room")
 for d in definitions:
  var type="recoilPlatform" if d.has("depth") else "hingeArm"
  var found=core.ents.filter(func(e):return e.type==type and e.label==d.id)
  check(found.size()==1,"one runtime body per browser-authored mechanism")
  if found.is_empty():continue
  var e=found[0]
  if type=="recoilPlatform":
   check(e.x==d.c*8 and e.y==d.r*8 and e.w==d.w*8 and e.depth==d.depth*8 and e.loadFrames==d.loadFrames and e.releaseSpeed==d.releaseSpeed,"edited recoil geometry and charge settings reach simulation")
  else:
   check(e.pivotX==d.c*8 and e.pivotY==d.r*8 and e.length==d.length and e.dir==d.dir,"edited hub, length and direction reach simulation")
 quit(1 if failed else 0)
