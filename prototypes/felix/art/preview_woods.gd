extends SceneTree
## Art-only pose sheet: no world, simulation or story is changed.
class Gallery extends "res://scripts/woods_view.gd":
 func _ready(): texture_filter=CanvasItem.TEXTURE_FILTER_NEAREST
 func _process(_delta): pass
 func _draw():
  ink=self
  ink_color=Color.WHITE
  camera=Vector2.ZERO
  paint_transform=Transform2D.IDENTITY
  box(0,0,720,460,"#273347")
  clock=1.3
  story={"power":true,"in_tale":false,"phase":"play","gifts":{"legs":true,"cape":true,"arms":true,"face":true,"helmet":true,"sword":true},"end_time":0.0}
  boy_standing(Vector2(60,115),1,"stand")
  boy_standing(Vector2(135,115),1,"run")
  actor=Vector2(220,103)
  boy_kneeling(Vector2(280,115),-1,"stick")
  for i in range(6):
   actor=Vector2(350+i*57,95)
   plume=[]
   for k in range(8):plume.append(actor+Vector2(1-k*1.3,3+sin(k)))
   sim={"K":{"strikeFrames":5},"p":{"state":"normal","onGround":true,"vx":30,"vy":-10,"dashDir":Vector2.RIGHT,"facing":1,"dashes":1,"pollen":0,"stamina":60,"carrying":null,"strikeTimer":0}}
   if i==1: sim.p.facing=-1
   if i in [2,3]:
    sim.p.state="strike"
    sim.p.strikeTimer=4 if i==2 else 1
    sim.p.strikeDir={"x":1,"y":0} if i==2 else {"x":0,"y":-1}
   if i==4:
    sim.p.state="climb"
    sim.p.pollen=45
   if i==5:
    story.phase="ending"
    story.end_time=13
    story.gifts.helmet=false
    story.gifts.sword=false
   draw_knight()
   marker(["idle","left","swing","upward","slime/climb","set down"][i],actor+Vector2(-12,32),9,Color.WHITE)
  marker("56 px Isaac: stand, run, kneel with the stick",Vector2(16,142),10,Color.WHITE)
  sprite("dad-warm",Vector2(25,184))
  sprite("dad-cold",Vector2(170,184))
  boy_asleep(Vector2(208,244))
  marker("84 px seated Dad: doorway / flashlight rim",Vector2(18,333),10,Color.WHITE)
  for i in range(4):
   var name=["fern","mushroom","leaf","acorn"][i]
   sprite(name,Vector2(350+i*70,240))
  sprite("drawing",Vector2(655,234),Vector2(36,34))
  sprite("lantern",Vector2(355,355),Vector2(22,30))
  sprite("helmet",Vector2(415,350),Vector2(27,27))
  sprite("sword",Vector2(470,355),Vector2(33,15))
  marker("cold story lantern / cardboard helmet / walking-stick sword",Vector2(330,411),9,Color.WHITE)
func _initialize(): call_deferred("capture")
func capture():
 var viewport=SubViewport.new()
 viewport.size=Vector2i(1440,920)
 viewport.render_target_update_mode=SubViewport.UPDATE_ALWAYS
 root.add_child(viewport)
 var gallery=Gallery.new()
 gallery.scale=Vector2(2,2)
 viewport.add_child(gallery)
 for frame in range(4): await process_frame
 RenderingServer.force_draw(false)
 var path="res://shots/ch2-poses.png"
 var error=viewport.get_texture().get_image().save_png(path)
 print("WOODS ART PREVIEW ",path," result=",error)
 quit(error)
