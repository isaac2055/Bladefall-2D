extends SceneTree
## Visual QA only: renders production draw functions without starting the simulation.
## godot --path . --script art/preview.gd -- shots/art-preview.png
class Gallery extends "res://scripts/felix_view.gd":
 func _ready(): texture_filter=CanvasItem.TEXTURE_FILTER_NEAREST
 func _process(_delta): pass
 func _draw():
  ink=self
  ink_color=Color.WHITE
  paint_transform=Transform2D.IDENTITY
  camera=Vector2.ZERO
  box(0,0,640,480,"#242b46")
  clock=1.25
  walking=9
  boy_sitting(Vector2(45,139),true)
  boy_sitting(Vector2(115,139),false)
  boy_standing(Vector2(195,139),1,"stand")
  boy_standing(Vector2(275,139),1,"run")
  boy_kneeling(Vector2(355,139),1,"sock")
  boy_standing(Vector2(445,139),1,"point")
  boy_standing(Vector2(545,139),1,"wave")
  for i in range(7): marker(["crying","looking","stand","run","sock","point","wave"][i],Vector2(22+i*83,155),9,Color.WHITE)
  story={"boy":{"hidden":false,"asleep":true},"ride":null}
  boy_in_bed(Vector2(150,205))
  story.boy.asleep=false
  boy_in_bed(Vector2(350,205))
  story.boy.hidden=true
  boy_in_bed(Vector2(570,205))
  marker("asleep",Vector2(45,240),9,Color.WHITE)
  marker("in bed",Vector2(255,240),9,Color.WHITE)
  marker("under the quilt",Vector2(455,240),9,Color.WHITE)
  var states=["light","legs","cape","arms","face","dash","slime","climb","basket","carry"]
  for i in range(states.size()):
   actor=Vector2(22+i*62,280)
   plume=[]
   for k in range(8): plume.append(actor+Vector2(1-k*1.5,3+sin(k)*.6))
   sim={"p":{"state":"normal","onGround":true,"vx":30,"vy":-10,"dashDir":Vector2.RIGHT,"facing":1,"dashes":1,"pollen":0,"stamina":65,"carrying":null}}
   story.gifts={"legs":i>=1,"cape":i>=2,"arms":i>=3,"face":i>=4}
   if i==5: sim.p.state="dash"
   if i==6: sim.p.pollen=45
   if i==7: sim.p.state="climb"
   riding=i==8
   if i==9: sim.p.carrying={}
   draw_knight()
   marker(states[i],actor+Vector2(-8,30),9,Color.WHITE)
  riding=false
  for i in range(10): photo(Vector2(30+i*62,352),i,0,2)
  marker("ten good days",Vector2(20,388),9,Color.WHITE)
  for i in range(4): draw_hazard(i+3,Vector2(25+i*30,405))
  nightlight(Vector2(165,405))
  pixel("props/dust-bunny",Vector2(205,399))
  pixel("props/jar",Vector2(245,405))
  crayon_star(Vector2(290,407),true)
  pixel("props/slime",Vector2(340,407))
  pixel("props/basket",Vector2(390,407))
  for i in range(4): pixel("props/block-"+["a","b","c","d"][i],Vector2(440+i*16,405))
  pixel("props/drawing",Vector2(545,401))
  ink.draw_texture_rect(preload("res://art/tiles/bedroom.png"),Rect2(20,442,480,24),false)

func _initialize():
 call_deferred("capture")

func capture():
 var viewport=SubViewport.new()
 viewport.size=Vector2i(640,480)
 viewport.render_target_update_mode=SubViewport.UPDATE_ALWAYS
 root.add_child(viewport)
 viewport.add_child(Gallery.new())
 for frame in range(4): await process_frame
 await RenderingServer.frame_post_draw
 var args=OS.get_cmdline_user_args()
 var path=args[0] if args.size()>0 else "res://shots/art-preview.png"
 var result=viewport.get_texture().get_image().save_png(path)
 print("ART PREVIEW ",path," result=",result)
 quit(result)
