extends SceneTree
const Main=preload("res://main.tscn")
const Art=preload("res://scripts/art_details.gd")
var app
var canvas
var people={}
var items={}
var bunny
func _initialize(): run.call_deferred()
func run():
 app=Main.instantiate()
 app.test_mode=true
 root.add_child(app)
 await process_frame
 app.set_physics_process(false)
 app.set_process(false)
 for chapter in app.chapters.values():
  for core in chapter.world.cores.values():
   for person in core.room.def.get("people",[]):
    if not people.has(person.who): people[person.who]=person
   for e in core.ents:
    if not items.has(e.type): items[e.type]=e.duplicate(true)
   if not core.sweepers.is_empty(): bunny=core.sweepers[0].duplicate(true)
 var overlay=CanvasLayer.new()
 overlay.layer=100
 root.add_child(overlay)
 canvas=Node2D.new()
 overlay.add_child(canvas)
 canvas.draw.connect(paint)
 await process_frame
 await RenderingServer.frame_post_draw
 if not OS.get_cmdline_user_args().is_empty(): root.get_texture().get_image().save_png(OS.get_cmdline_user_args()[0])
 print("PASS native character, collectible, foliage and hazard art sheet rendered")
 app.queue_free()
 overlay.queue_free()
 await process_frame
 await create_timer(.15).timeout
 quit()
func caption(at,value): canvas.draw_string(ThemeDB.fallback_font,at,value,HORIZONTAL_ALIGNMENT_LEFT,-1,14,Color("#bdccce"))
func paint():
 canvas.draw_rect(Rect2(0,0,1280,832),Color("#12202d"))
 var a=app.landscape
 var old=a.ink
 var design=a.knight_design
 a.ink=canvas
 canvas.draw_set_transform(Vector2(0,28),0,Vector2(4,4))
 for j in range(3):
  a.knight_design=j
  for i in range(2):
   var pose=app.sim.p.duplicate(true)
   pose.merge({"vx":0 if i==0 else 90,"vy":0,"facing":1,"state":"normal","onGround":true,"parryTimer":0,"strikeTimer":0,"carrying":null},true)
   a.draw_knight(pose,Vector2(26+j*95+i*22,14),11)
 a.knight_design=design
 var names=["vey","mara","rowan","elsie","silas"]
 for i in range(names.size()): a.draw_person(people[names[i]],Vector2(27+i*61,82),false)
 var kinds=["refill","shard","stone","lantern","feather","prism","anvil","ring"]
 for i in range(kinds.size()):
  var e=items[kinds[i]]
  a.draw_entity(e,Vector2(22+i*39-e.x-e.w/2,123-e.y-e.h/2))
 for t in [3,4,5,6]: a.draw_hazard(t,Vector2(15+(t-3)*23,174))
 if bunny!=null:
  bunny.x=139
  bunny.y=178
  Art.dust_bunny(a,bunny,Vector2.ZERO)
 Art.flowers(a,Vector2(196,183))
 Art.fern(a,Vector2(246,183))
 canvas.draw_set_transform(Vector2.ZERO)
 caption(Vector2(20,22),"KNIGHT STUDY · idle and moving · the same 8 × 11 body")
 for i in range(3): caption(Vector2(104+i*380,156),["Classic","Wayfarer","Sentinel"][i])
 caption(Vector2(20,234),"PEOPLE OF THE ROAD")
 for i in range(names.size()): caption(Vector2(100+i*244,380),names[i].capitalize())
 caption(Vector2(20,460),"COLLECTIBLES AND DEVICES · original pickup and collision bounds")
 for i in range(kinds.size()): caption(Vector2(65+i*156,558),kinds[i].capitalize())
 caption(Vector2(20,650),"HAZARDS AND FOLIAGE · safe flowers use colored petals; hazards retain pale points")
 caption(Vector2(60,802),"Four hazard orientations")
 caption(Vector2(510,802),"Dust bunny")
 caption(Vector2(760,802),"Flowers")
 caption(Vector2(960,802),"Fern")
 a.ink=old
