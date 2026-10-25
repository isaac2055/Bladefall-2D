extends Node2D
## Pixel art is drawn in Explore's authored world units; the viewport downsamples by two.
var world
var camera=Vector2.ZERO
var camera_float=Vector2.ZERO
var old_actor=Vector2.ZERO
var current_actor=Vector2.ZERO
var actor=Vector2.ZERO
var clock=0.0
var paused=false
var reduced_motion=false
var lights_enabled=true
var canvas: CanvasModulate
var front: Node2D
var scenery_roots=[]
var current_stage=-1
var lights=[]
var guide_light: PointLight2D
var lantern_light: PointLight2D
var particles=[]
var plume=[]
var terrain_count=0
var occluder_count=0
var speaker=""
var flash=0.0
var shake=0.0
var room_name=""
var ambience: GPUParticles2D
func _ready():
 texture_filter=CanvasItem.TEXTURE_FILTER_NEAREST
 for index in range(world.regions.size()):
  var root=Node2D.new()
  root.z_index=1
  add_child(root)
  root.draw.connect(draw_static.bind(index,root))
  scenery_roots.append(root)
  for o in world.regions[index].obstacles:
   if o.type not in ["plat","wall"] or o.get("fake",false): continue
   var h=min(float(o.get("h",16)),250.0)
   var poly=OccluderPolygon2D.new()
   poly.polygon=PackedVector2Array([Vector2(o.x-o.w/2,-o.get("y",0)),Vector2(o.x+o.w/2,-o.get("y",0)),Vector2(o.x+o.w/2,-o.get("y",0)+h),Vector2(o.x-o.w/2,-o.get("y",0)+h)])
   var shade=LightOccluder2D.new()
   shade.occluder=poly
   root.add_child(shade)
   occluder_count+=1
  for o in world.regions[index].obstacles:
   if o.type=="scenery" and o.get("kind","") in ["watchfire","boundary-lantern","dead-clock","oathblade-stump","root-seam"]:
    add_light(root,index,Vector2(o.x,-o.get("y",0)-35),o.get("kind","")=="watchfire")
 guide_light=add_light(scenery_roots[1],1,Vector2(6900,-28),false)
 lantern_light=add_light(scenery_roots[1],1,Vector2(5320,-12),false)
 front=Node2D.new()
 front.z_index=2
 front.draw.connect(draw_dynamic)
 add_child(front)
 canvas=CanvasModulate.new()
 canvas.color=Color("b1bfd0")
 add_child(canvas)
 ambience=GPUParticles2D.new()
 ambience.position=Vector2(640,300)
 ambience.amount=55
 ambience.lifetime=10
 ambience.preprocess=6
 ambience.visibility_rect=Rect2(-800,-500,1600,1000)
 var material=ParticleProcessMaterial.new()
 material.emission_shape=ParticleProcessMaterial.EMISSION_SHAPE_BOX
 material.emission_box_extents=Vector3(800,450,0)
 material.direction=Vector3(-1,0,0)
 material.spread=18
 material.gravity=Vector3(0,-0.5,0)
 material.initial_velocity_min=8
 material.initial_velocity_max=20
 material.scale_min=0.7
 material.scale_max=1.2
 material.color=Color(0.73,0.82,0.71,0.45)
 ambience.process_material=material
 ambience.z_index=4
 add_child(ambience)
 var post=ColorRect.new()
 post.size=Vector2(1280,736)
 post.z_index=10
 post.mouse_filter=Control.MOUSE_FILTER_IGNORE
 var grading=ShaderMaterial.new()
 grading.shader=preload("res://shaders/atmosphere.gdshader")
 grading.set_shader_parameter("strength",0.65)
 post.material=grading
 add_child(post)
 snap()
func add_light(parent,index,position_in_world,embers):
 var light=PointLight2D.new()
 var img=Image.create(128,128,false,Image.FORMAT_RGBA8)
 for y in range(128):
  for x in range(128):
   var d=Vector2(x-64,y-64).length()/64.0
   img.set_pixel(x,y,Color(1.0,0.75,0.39,pow(max(0,1-d),2)))
 light.texture=ImageTexture.create_from_image(img)
 light.position=position_in_world
 light.texture_scale=2.4 if embers else 1.3
 light.energy=1.25
 light.shadow_enabled=true
 light.shadow_filter=Light2D.SHADOW_FILTER_PCF5
 light.shadow_color=Color(0.02,0.03,0.05,0.65)
 parent.add_child(light)
 lights.append({"node":light,"stage":index,"fire":embers})
 if embers:
  var sparks=GPUParticles2D.new()
  sparks.position=position_in_world+Vector2(0,15)
  sparks.amount=13
  sparks.lifetime=1.8
  sparks.preprocess=0.5
  sparks.visibility_rect=Rect2(-60,-130,120,150)
  var material=ParticleProcessMaterial.new()
  material.direction=Vector3(0,-1,0)
  material.spread=24
  material.gravity=Vector3(-3,-12,0)
  material.initial_velocity_min=14
  material.initial_velocity_max=36
  material.scale_min=0.7
  material.scale_max=1.8
  material.color=Color(1,0.62,0.2,0.9)
  sparks.process_material=material
  parent.add_child(sparks)
 return light
func hash_at(x,y=0,salt=0): return posmod(int(x)*73856093^int(y)*19349663^salt*83492791,2147483647)
func box(target,x,y,w,h,color): target.draw_rect(Rect2(round(x),round(y),w,h),Color(color))
func line(target,a,b,color,width=2): target.draw_line(a,b,Color(color),width,false)
func poly(target,points,color): target.draw_colored_polygon(PackedVector2Array(points),Color(color))
func stone(target,o,forest):
 if o.get("fake",false): return
 var x=o.x-o.w/2
 var y=-o.get("y",0)
 var h=float(o.get("h",14))
 if o.get("deep",false): h=max(h,300)
 var color=Color("263a36") if forest else Color("303946")
 box(target,x,y,o.w,h,color.darkened(0.12))
 var rows=ceili(h/16)
 for r in range(rows):
  var offset=8 if r%2 else 0
  for c in range(ceili(o.w/24)+1):
   var left=max(x,x+c*24-offset)
   var right=min(x+o.w,x+c*24-offset+23)
   if right<=left: continue
   var tint=hash_at(int(o.x)+c,r)%5*0.018
   box(target,left,y+r*16+1,right-left,min(14.0,h-r*16-1),color.lightened(tint))
   if hash_at(c,int(o.x),r)%11==0: line(target,Vector2(left+4,y+r*16+5),Vector2(left+10,y+r*16+10),color.darkened(0.25))
 var edge=Color("9aa174") if forest else Color("8b9477")
 box(target,x,y,o.w,3,edge)
 box(target,x,y+3,o.w,3,Color("56684b"))
 for i in range(ceili(o.w/14)):
  var gx=x+i*14+hash_at(i,int(o.x))%7
  var hgrass=4+hash_at(i,int(o.y))%7
  line(target,Vector2(gx,y),Vector2(gx+2,y-hgrass),"667e53")
  if i%3==0: line(target,Vector2(gx+3,y),Vector2(gx+7,y-hgrass+3),"74835b")
func draw_static(index,target):
 var forest=index==1
 for o in world.regions[index].obstacles:
  if o.type in ["plat","wall"]:
   if o.get("crumble",false): continue
   stone(target,o,forest)
   terrain_count+=1
func snap():
 actor=Vector2(world.p.x,-world.p.y)
 current_actor=actor
 old_actor=actor
 camera_float=Vector2(max(0,world.p.x-380),max(0,world.p.y-70))
 camera=camera_float
 plume.clear()
 for i in range(8): plume.append(actor+Vector2(-i*5,-51+i*2))
func before_tick(): old_actor=current_actor
func after_tick():
 current_actor=Vector2(world.p.x,-world.p.y)
 if current_actor.distance_to(old_actor)>250: snap()
 for event in world.events:
  var point=Vector2(event.x,-event.y)
  match event.kind:
   "jump","land": burst(point,8,Color("b1b39a"),65)
   "bearing","weapon","ward","quest","gate","bell": burst(point-Vector2(0,30),18,Color("e5d89a"),100)
   "hit","chop": flash=0.05;burst(point,12,Color("e5dcb8"),170)
   "roots": shake=0.2;burst(point,26,Color("a59364"),120)
   "launch": burst(point,20,Color("e8d5a1"),140)
   "kill": shake=0.1;burst(point,20,Color("bec1b3"),150)
   "hurt","death": shake=0.25;burst(point-Vector2(0,20),24,Color("b96c62"),160)
   "respawn","region": snap()
func burst(point,count,color,speed):
 for i in range(count):
  var angle=i*TAU/count+0.4
  var v=Vector2(cos(angle),sin(angle))*speed*(0.45+(i%4)*0.17)
  particles.append({"p":point,"v":v,"life":0.25+(i%5)*0.07,"color":color,"size":2 if i%3 else 4})
func _process(delta):
 if not paused:
  clock+=delta
  actor=old_actor.lerp(current_actor,Engine.get_physics_interpolation_fraction())
  var target=Vector2(max(0,actor.x-440+world.p.vx*0.35),max(0,-actor.y-70))
  camera_float.x=lerp(camera_float.x,target.x,1-exp(-delta*5.5))
  var screen_y=600+actor.y+camera_float.y
  if screen_y<220: camera_float.y=lerp(camera_float.y,220-600-actor.y,1-exp(-delta*5))
  elif screen_y>600: camera_float.y=lerp(camera_float.y,max(0,-actor.y),1-exp(-delta*5))
  camera=Vector2(round(camera_float.x/2)*2,round(camera_float.y/2)*2)
  if not reduced_motion and shake>0: camera+=Vector2(sin(clock*57)*shake*16,cos(clock*63)*shake*10)
  flash=max(0,flash-delta)
  shake=max(0,shake-delta)
  for e in particles:
   e.life-=delta
   e.p+=e.v*delta
   e.v.y+=230*delta
  particles=particles.filter(func(e):return e.life>0)
  if plume.size()==8:
   plume[0]=actor+Vector2(-world.p.face*8,-51)
   for i in range(1,8):
    var target_plume=plume[i-1]+Vector2(-world.p.face*5,2+sin(clock*6-i*0.6)*1.5)
    plume[i]=plume[i].lerp(target_plume,min(1.0,delta*18))
 if current_stage!=world.stage:
  current_stage=world.stage
  for i in range(scenery_roots.size()): scenery_roots[i].visible=i==current_stage
  canvas.color=Color("b9c7b2") if current_stage==1 else Color("b1bfd0")
 for i in range(scenery_roots.size()): scenery_roots[i].position=Vector2(-camera.x,600+camera.y)
 for item in lights:
  item.node.enabled=lights_enabled
  item.node.energy=1.1+(sin(clock*7+item.node.position.x)*0.08 if item.fire and not reduced_motion else 0)
 if guide_light!=null:
  var guide=world.regions[1].npcs[0]
  guide_light.position=Vector2(guide.x+22,-guide.y-25)
 if lantern_light!=null:
  lantern_light.position=Vector2(world.lantern.x,-world.lantern.y-12)
  lantern_light.enabled=lights_enabled and world.elsie>=2
 canvas.visible=lights_enabled
 ambience.emitting=not reduced_motion
 front.queue_redraw()
 queue_redraw()
func _draw():
 if world==null: return
 var forest=world.stage==1
 box(self,0,0,1280,736,"101d1a" if forest else "111c2b")
 for i in range(65):
  var x=fposmod(i*137.3-camera.x*0.035,1280)
  var y=35+hash_at(i)%340
  if not forest: box(self,x,y,2,2,"596875")
 var moon=Vector2(fposmod(980-camera.x*0.035,1550),130)
 draw_circle(moon,43,Color("5e7070" if forest else "9da69a"))
 draw_circle(moon+Vector2(18,-9),41,Color("152421" if forest else "15202d"))
 for layer in range(3):
  var color=["1a2c2b","213637","29413e"][layer] if forest else ["1b2c3a","223440","2b4148"][layer]
  var points=[Vector2(0,736)]
  for x in range(-80,1380,80):
   var sample=x+camera.x*(0.04+layer*0.07)
   var y=330+layer*72+sin(sample*0.002+layer)*55+sin(sample*0.007+layer)*22+camera.y*(0.08+layer*0.03)
   points.append(Vector2(x,y))
  points.append(Vector2(1400,736))
  poly(self,points,color)
 if forest:
  for layer in range(3):
   var scale_factor=0.15+layer*0.15
   for i in range(11):
    var x=fposmod(i*173+layer*68-camera.x*scale_factor,1500)-100
    var y=620+camera.y*scale_factor
    tree(self,x,y,160+hash_at(i,layer)%260,["172e2a","20372e","294331"][layer],i,0.45+layer*0.2)
 else:
  for i in range(10):
   var x=fposmod(i*231-camera.x*0.23,2300)-200
   var y=592+camera.y*0.18
   box(self,x,y-260,47,260,"243943")
   box(self,x-8,y-274,63,17,"2c424b")
   for j in range(4): box(self,x-8+j*17,y-282,11,10,"2c424b")
   box(self,x+18,y-226,8,20,"667061")
  for i in range(6):
   var x=fposmod(i*270-camera.x*0.35,1700)-200
   var y=596+camera.y*0.28
   line(self,Vector2(x,y),Vector2(x+8,y-150),"475748",6)
   poly(self,[Vector2(x+8,y-150),Vector2(x+115,y-125),Vector2(x+44,y-103)],"33494a")
 # Restrained horizontal mist layers; they move at their own depth.
 for i in range(5):
  var x=fposmod(i*360-camera.x*0.08+clock*2,1800)-300
  draw_rect(Rect2(x,410+i*42+camera.y*0.08,360,20),Color(0.38,0.48,0.49,0.025))
func tree(target,x,y,h,color,seed,foliage_scale=1.0):
 var c=Color(color)
 poly(target,[Vector2(x-18,y),Vector2(x-9,y-h),Vector2(x+5,y-h-16),Vector2(x+20,y)],c.darkened(0.08))
 line(target,Vector2(x-5,y-4),Vector2(x-2,y-h+15),c.lightened(0.08),4)
 for j in range(5):
  var side=1 if j%2 else -1
  var by=y-h*(0.35+j*0.105)
  line(target,Vector2(x,by+22),Vector2(x+side*(55+j*8),by-20),c,10-j)
 for j in range(8):
  var px=x+(hash_at(seed,j)%220-110)*foliage_scale
  var py=y-h+(hash_at(seed,j,2)%100-50)*foliage_scale
  var w=(70+hash_at(seed,j,4)%80)*foliage_scale
  poly(target,[Vector2(px-w/2,py),Vector2(px-w*.3,py-24),Vector2(px+w*.2,py-30),Vector2(px+w/2,py-8),Vector2(px+w*.38,py+15),Vector2(px-w*.3,py+19)],c.lightened((j%3)*0.025))
func visible(x,w=160): return x+w>camera.x and x-w<camera.x+1280
func draw_dynamic():
 var target=front
 var shift=Vector2(-camera.x,600+camera.y)
 target.draw_set_transform(shift)
 var forest=world.stage==1
 for zone in world.region().authored.get("blight",[]):
  for gx in range(int(zone[0]),int(zone[1]),18):
   if not visible(gx,20): continue
   var support=world.floor_at(gx,32)
   if support.id<0: continue
   var by=-support.y
   line(target,Vector2(gx,by),Vector2(gx-2,by-16),"6d805f",2)
   poly(target,[Vector2(gx-7,by-16),Vector2(gx-2,by-25),Vector2(gx+4,by-16)],"bbc8a7")
 for o in world.objects():
  if not visible(o.x,o.get("w",120)): continue
  if o.type=="plat":
   if o.get("fake",false):
    var c=Color("59764f")
    c.a=0.28 if world.bram_follow else 0.68
    box(target,o.x-o.w/2,-o.y,o.w,8,c)
    line(target,Vector2(o.x+o.w/2-14,-o.y-8),Vector2(o.x+o.w/2-8,-o.y+2),"dbab55",3)
   elif o.get("crumble",false) and not o.gone: stone(target,o,forest)
  elif o.type=="earlyBlade":
   var spent=o.get("usedUntil",0)>world.clock
   line(target,Vector2(o.x,-o.y-130),Vector2(o.x,-o.y),"526842",4)
   poly(target,[Vector2(o.x-22,-o.y),Vector2(o.x-14,-o.y-18),Vector2(o.x+14,-o.y-18),Vector2(o.x+22,-o.y)],"6b7053" if spent else "b19a60")
   box(target,o.x-15,-o.y+2,30,5,"677a57" if spent else "e4d8a6")
  elif o.type=="scenery": prop(target,o)
  elif o.type=="ambientFigure": person(target,o.x,-o.y,o.name,o.get("accent","#b9b6a2"),true)
  elif o.type=="surveyStake":
   box(target,o.x-3,-o.y-42,6,42,"73837e")
   var on=o.get("aligned",false)
   var c=Color(o.accent).lightened(0.3) if on else Color(o.accent)
   line(target,Vector2(o.x-18,-o.y-34),Vector2(o.x+18,-o.y-34 if on else -o.y-44),c,4)
   box(target,o.x-5,-o.y-47,10,6,c)
   if on: target.draw_circle(Vector2(o.x,-o.y-44),11,Color(c,0.14))
  elif o.type=="crate":
   box(target,o.x-o.w/2,-o.y-o.h,o.w,o.h,"665740")
   box(target,o.x-o.w/2+4,-o.y-o.h+4,o.w-8,o.h-8,"8b8060")
   line(target,Vector2(o.x-o.w/2,-o.y-o.h/2),Vector2(o.x+o.w/2,-o.y-o.h/2),"343d41",4)
   box(target,o.x-o.w/2+5,-o.y-4,9,8,"242c34")
   box(target,o.x+o.w/2-14,-o.y-4,9,8,"242c34")
  elif o.type=="spikes":
   var up=fposmod(world.region().time+o.get("phase",0),o.period)<o.upT
   var h=26 if up else 6
   for i in range(int(o.w/14)):
    var x=o.x-o.w/2+i*14
    poly(target,[Vector2(x,-o.y),Vector2(x+6,-o.y-h),Vector2(x+12,-o.y)],"b8c0a8" if up else "60735b")
  elif o.type=="storyRelic" and not o.get("read",false):
   var y=-o.y-25+sin(clock*2+o.x)*4
   poly(target,[Vector2(o.x,y-8),Vector2(o.x+7,y),Vector2(o.x,y+8),Vector2(o.x-7,y)],o.accent)
   target.draw_circle(Vector2(o.x,y),18,Color(Color(o.accent),0.08))
  elif o.type=="restSite":
   box(target,o.x-20,-o.y-5,40,5,"86755c")
   box(target,o.x-16,-o.y-20,32,3,"ac9467")
   fire(target,o.x,-o.y-6,0.7)
 for item in world.region().pickups:
  if item.get("taken",false) or not visible(item.x): continue
  if item.has("weapon"):
   sword(target,item.x,-item.y-20,1,1.25)
  else:
   poly(target,[Vector2(item.x-12,-item.y-30),Vector2(item.x+12,-item.y-30),Vector2(item.x+20,-item.y),Vector2(item.x-20,-item.y)],"8fbca7")
 for n in world.region().npcs:
  if visible(n.x):
   person(target,n.x,-n.y,n.name,n.get("robe","#778b64"),false)
   if n.name=="Bram":
    var lp=Vector2(n.x+22,-n.y-25)
    target.draw_circle(lp,100,Color(0.8,0.79,0.44,0.045))
    box(target,lp.x-4,lp.y-6,8,12,"ead79a")
 if world.stage==0:
  person(target,250,-0,"Rowan","718371",false)
  box(target,360,-55,4,55,"74624a")
  if world.rowan>=4: bell(target,360,-48)
  var tower={"x":1370.0,"y":0.0,"kind":"bell-tower"}
  prop(target,tower)
  box(target,1050,-7,62,7,"8f9290")
  if world.rowan in [2,3]: box(target,1045,-50,8,45,"b7a87b")
 else:
  person(target,700,0,"Elsie","986d59",false)
  prop(target,{"x":790.0,"y":0.0,"kind":"elsie-kitchen"})
  if world.elsie==1: moths(target,world.moth+Vector2(0,38))
  if world.elsie>=2:
   var lp=Vector2(world.lantern.x,-world.lantern.y-12)
   target.draw_circle(lp,70,Color(0.98,0.76,0.35,0.06))
   box(target,lp.x-7,lp.y-10,14,20,"b8995b")
   box(target,lp.x-4,lp.y-7,8,14,"f6de88")
  var lx=2290.0
  box(target,lx-27,-18,54,18,"5e4937")
  target.draw_circle(Vector2(lx+24,-9),10,Color("ac9270"))
  for i in range(world.log_hits): line(target,Vector2(lx-18+i*14,-20),Vector2(lx-23+i*14,-5),"252d28",3)
  if world.log_hits>=3: box(target,lx+40,-6,58,6,"b29973")
 for hazard in world.region().hazards:
  if not visible(hazard.x,hazard.r+50): continue
  var h=24+sin(clock*20)*5
  for i in range(7):
   var gx=hazard.x-hazard.r+i*hazard.r/3
   poly(target,[Vector2(gx-8,-hazard.y),Vector2(gx,-hazard.y-h),Vector2(gx+8,-hazard.y)],hazard.color)
 for shot in world.region().projectiles:
  if not visible(shot.x): continue
  if shot.spore:
   target.draw_circle(Vector2(shot.x,-shot.y),shot.size+5,Color(0.55,0.67,0.35,0.16))
   for i in range(5):
    var a=clock*2+i*TAU/5
    target.draw_circle(Vector2(shot.x+cos(a)*7,-shot.y+sin(a)*7),5,Color("a5b077"))
  else: line(target,Vector2(shot.x,-shot.y),Vector2(shot.x-shot.vx*.07,-shot.y+shot.vy*.07),"d9b885",4)
 for e in world.region().enemies:
  if not e.dead and visible(e.x): enemy(target,e)
 if not world.ride.is_empty():
  if forest: moths(target,Vector2(actor.x,-actor.y+35))
  else:
   var dir=sign(world.ride.end-world.ride.start)
   var flap=sin(clock*8)*26
   poly(target,[actor+Vector2(-13,22),actor+Vector2(-100,-15-flap),actor+Vector2(-63,30),actor+Vector2(-25,39)],"738064")
   poly(target,[actor+Vector2(13,22),actor+Vector2(100,-15-flap),actor+Vector2(63,30),actor+Vector2(25,39)],"66795c")
   box(target,actor.x-32,actor.y+1,64,24,"75836b")
   poly(target,[actor+Vector2(dir*24,16),actor+Vector2(dir*51,7),actor+Vector2(dir*58,30),actor+Vector2(dir*30,35)],"94a17c")
   box(target,actor.x+dir*44,actor.y+16,5,3,"e0d0a0")
 if not world.p.dead:
  knight(target,actor)
  if world.bell_held: bell(target,actor.x-22*world.p.face,actor.y-28)
 for e in particles:
  box(target,e.p.x,e.p.y,e.size,e.size,Color(e.color,min(1,e.life*4)))
 target.draw_set_transform(Vector2.ZERO)
 if flash>0 and not reduced_motion: target.draw_rect(Rect2(0,0,1280,736),Color(0.95,0.9,0.7,0.045))
func fire(target,x,y,scale_factor=1.0):
 for i in range(5):
  var h=(15+sin(clock*11+i*2)*5+i*3)*scale_factor
  box(target,x-13*scale_factor+i*5*scale_factor,y-h,7*scale_factor,h,"fff19a" if i%2 else "f1ba55")
 line(target,Vector2(x-19,y+3),Vector2(x+19,y+3),"84705a",6)
func moths(target,p):
 for i in range(7):
  var a=clock*1.8+i*TAU/7
  var m=Vector2(p.x+cos(a)*25,-p.y+sin(a*1.3)*13)
  var span=3+abs(sin(clock*13+i))*5
  line(target,m-Vector2(span,-3),m,"d9d7a0",3)
  line(target,m,m+Vector2(span,-3),"d9d7a0",3)
func bell(target,x,y):
 poly(target,[Vector2(x-10,y+4),Vector2(x-7,y-9),Vector2(x+7,y-9),Vector2(x+10,y+4)],"c3ad74")
 box(target,x-12,y+4,24,4,"e1ca8a")
 box(target,x-2,y+8,4,5,"6f6244")
func prop(target,o):
 var x=o.x
 var y=-o.get("y",0)
 var kind=o.get("kind","")
 match kind:
  "watchfire": fire(target,x,y)
  "fallen-tent":
   poly(target,[Vector2(x-75,y),Vector2(x-5,y-105),Vector2(x+82,y)],"51624e")
   poly(target,[Vector2(x-5,y-105),Vector2(x+18,y),Vector2(x-42,y)],"293d37")
   line(target,Vector2(x-5,y-105),Vector2(x+82,y),"98a184",3)
   line(target,Vector2(x-5,y-105),Vector2(x-94,y),"7c8169",2)
  "dead-clock":
   box(target,x-5,y-110,10,110,"4e625b")
   target.draw_circle(Vector2(x,y-110),28,Color("b6b296"))
   target.draw_circle(Vector2(x,y-110),22,Color("8f987f"))
   line(target,Vector2(x,y-110),Vector2(x,y-126),"3b514d",4)
   line(target,Vector2(x,y-110),Vector2(x+13,y-103),"3b514d",4)
  "bell-tower":
   box(target,x-70,y-325,8,325,"685b48")
   box(target,x+62,y-325,8,325,"685b48")
   line(target,Vector2(x-70,y-320),Vector2(x+70,y-320),"9b8b67",8)
   for j in range(4):
    var by=y-j*75
    line(target,Vector2(x-65,by),Vector2(x+65,by-75),"544b3e",4)
   if world.rowan<3: bell(target,x,y-308)
  "boundary-lantern":
   box(target,x-3,y-85,6,85,"7c7052")
   box(target,x-11,y-84,22,30,"4d5546")
   box(target,x-6,y-79,12,20,"c7cf88")
  "signal-mast","survey-post","watch-standard","resin-streamer":
   var h=160 if kind=="resin-streamer" else 100
   box(target,x-3,y-h,6,h,"76836d")
   var sway=sin(clock*2+x)*6
   poly(target,[Vector2(x,y-h),Vector2(x+70,y-h+14+sway),Vector2(x+48,y-h+50+sway),Vector2(x,y-h+28)],"a19368" if kind=="resin-streamer" else "71816b")
  "broken-palisade":
   for i in range(6):
    var h=45+hash_at(i,int(x))%25
    poly(target,[Vector2(x+i*18-50,y),Vector2(x+i*18-50,y-h),Vector2(x+i*18-45,y-h-13),Vector2(x+i*18-40,y-h),Vector2(x+i*18-40,y)],"73785e")
   box(target,x-65,y-28,130,7,"5c644e")
  "white-trumpets":
   for i in range(6):
    var px=x+i*14-38
    line(target,Vector2(px,y),Vector2(px-3,y-32),"7e956d",3)
    poly(target,[Vector2(px-8,y-31),Vector2(px-3,y-43),Vector2(px+5,y-31)],"c5ceaf")
  "oathblade-stump","mirror-stump":
   poly(target,[Vector2(x-70,y),Vector2(x-35,y-25),Vector2(x-22,y-52),Vector2(x+25,y-52),Vector2(x+38,y-19),Vector2(x+80,y)],"675440")
   line(target,Vector2(x-4,y-44),Vector2(x-10,y-5),"a48d5c",5)
   if kind=="oathblade-stump":
    var weight=world.regions[1].obstacles.filter(func(q):return q.get("oathbladeCounterweight",false))[0]
    line(target,Vector2(x-12,y-35),Vector2(3425,-260),"7a8454",4)
    if not weight.get("released",false):
     for i in range(4): line(target,Vector2(x-30+i*18,y),Vector2(x+12-i*6,y-65),"617744",5)
  "oathblade-counterweight":
   var released=o.get("released",false)
   var drop=65 if released else 0
   line(target,Vector2(x,-420),Vector2(x,y+drop),"8e9d72",4)
   box(target,x-30,y+drop,60,66,"63704e")
   box(target,x-23,y+drop+5,46,8,"9b9c71")
  "elsie-kitchen":
   box(target,x-90,y-80,180,80,"4c5140")
   box(target,x-74,y-72,40,45,"2b392f")
   box(target,x+40,y-61,30,29,"c3a66c")
   poly(target,[Vector2(x-108,y-80),Vector2(x,y-134),Vector2(x+108,y-80)],"6e6a4d")
   box(target,x-24,y-48,48,7,"a58b65")
   box(target,x-18,y-41,5,41,"7a674f")
   box(target,x+13,y-41,5,41,"7a674f")
  "mothlight-gate","hollow-ring","root-tunnel","mothlight-tunnel","split-root-arch":
   var h=170 if kind!="hollow-ring" else 710
   line(target,Vector2(x-80,y),Vector2(x-75,y-h+50),"435747",24)
   line(target,Vector2(x+80,y),Vector2(x+67,y-h+50),"354b41",28)
   line(target,Vector2(x-75,y-h+50),Vector2(x,y-h),"52604b",20)
   line(target,Vector2(x,y-h),Vector2(x+67,y-h+50),"52604b",20)
   if kind=="mothlight-gate":
    box(target,x-30,y-85,60,85,"132523")
    fire(target,x+45,y-55,0.6)
  "resin-rack":
   box(target,x-55,y-48,110,5,"8c7658")
   for i in range(5):
    box(target,x-49+i*22,y-47,3,47,"665b48")
    box(target,x-44+i*22,y-70,10,18,"bba45b")
  "bitten-tree": tree(target,x,y,230,"344d35",42,1.2)
  "mile-stone":
   box(target,x-13,y-30,26,30,"7a8271")
   box(target,x-7,y-22,12,3,"a8ac8d")
  "abandoned-kit","collapsed-stretcher","overlook-cache","patrol-cache":
   box(target,x-23,y-20,46,20,"6e7059")
   line(target,Vector2(x-24,y-9),Vector2(x+24,y-9),"989379",3)
  _:
   if world.stage==1: line(target,Vector2(x-45,y),Vector2(x+35,y-14),"536747",8)
func person(target,x,y,name,robe,seated):
 var h=32 if seated else 48
 var bob=sin(clock*1.6+x)*1.5
 if name=="Mara" and world.chart:
  # She packs the chart at her station; no teleporting to a different part of the road.
  bob=sin(clock*2)*2
 box(target,x-9,y-h+13+bob,18,h-17,robe)
 box(target,x-7,y-h-2+bob,14,15,"c3a17f")
 box(target,x-9,y-h-7+bob,18,8,"777b67")
 var walking=sin(clock*10)*3 if name=="Bram" and world.bram_follow else 0.0
 box(target,x-8,y-6+walking,6,6,"252e32")
 box(target,x+2,y-6-walking,6,6,"252e32")
 if name=="Mara":
  box(target,x+6,y-32,18,16,"c9c299")
  line(target,Vector2(x+9,y-27),Vector2(x+20,y-27),"66765e",2)
 elif name=="Rowan":
  line(target,Vector2(x-16,y),Vector2(x-16,y-47),"897554",4)
  box(target,x-23,y-49,15,5,"b8bfa8")
 elif name=="Elsie":
  box(target,x-7,y-29,14,24,"c3b18b")
  box(target,x-15,y-h-8,30,4,"cbbd99")
 elif name=="Hale": line(target,Vector2(x-8,y-31),Vector2(x+10,y-20),"c5bea1",5)
 if speaker==name: target.draw_circle(Vector2(x,y-h-20),4,Color("dfcf9b"))
func sword(target,x,y,face,scale_factor=1.0):
 line(target,Vector2(x,y+9*scale_factor),Vector2(x+face*38*scale_factor,y-12*scale_factor),"d5dedb",5*scale_factor)
 line(target,Vector2(x+face*6*scale_factor,y+12*scale_factor),Vector2(x+face*15*scale_factor,y-2*scale_factor),"b3a26d",4*scale_factor)
func knight(target,at):
 var p=world.p
 if p.invuln>0 and int(clock*14)%2==0: return
 var step=sin(clock*abs(p.vx)*0.075)*5 if p.onGround and abs(p.vx)>10 else 0
 var x=at.x
 var y=at.y
 var lean=clamp(p.vx/200,-1,1)*3
 poly(target,[Vector2(x-10,y-36),Vector2(x-20-p.vx*.015,y-8),Vector2(x+8,y-12),Vector2(x+10,y-33)],"666f60")
 box(target,x-9,y-16,7,14+step,"38424c")
 box(target,x+2,y-16,7,14-step,"2d3843")
 box(target,x-11,y-3+step,11,4,"9ba5a0")
 box(target,x+2,y-3-step,11,4,"8b9793")
 box(target,x-11+lean,y-37,22,24,"a6b2ae")
 box(target,x-8+lean,y-35,16,6,"c5cfbf")
 box(target,x+5+lean,y-32,5,16,"627b7b")
 box(target,x-13+lean,y-39,12,7,"ced3be")
 box(target,x+3+lean,y-39,12,7,"c2c9b8")
 box(target,x-11+lean,y-52,22,16,"bbc6bd")
 box(target,x-7+lean,y-54,16,4,"e0e1c7")
 box(target,x-10+lean,y-45,20,4,"354952")
 box(target,x+(4 if p.face>0 else -9)+lean,y-44,7,2,"e7d5a7")
 for i in range(plume.size()-1): line(target,plume[i],plume[i+1],"c6b18a" if i<3 else "9a9a78",max(2,7-i))
 if world.weapon:
  if p.swingT>0:
   var t=1-p.swingT/0.22
   var center=Vector2(x+p.face*12,y-26)
   var points=[center]
   for i in range(8):
    var a=-1.3+(i/7.0)*2.4+t*0.4
    points.append(center+Vector2(p.face*cos(a)*62,sin(a)*48))
   poly(target,points,Color(0.87,0.87,0.7,0.25))
   if p.upSwing: line(target,Vector2(x,y-28),Vector2(x,y-82),"e4e5c5",6)
   else: sword(target,x+p.face*15,y-24,p.face,1.2)
  else: line(target,Vector2(x+p.face*13,y-23),Vector2(x+p.face*23,y-1),"c7d2cd",4)
func enemy(target,e):
 var x=e.x
 var y=-e.y
 var c=Color("89947d") if e.type=="grunt" else Color("8e7f9c")
 if e.mode=="veil":
  var aim=Vector2(e.get("aimX",x),-e.get("aimY",-y))
  target.draw_arc(aim,28,PI,TAU,12,Color("bba1d3"),3)
  c=Color("45445b")
 if e.hitFlash>0: c=Color("e3d6bd")
 if e.mode=="root-wind":
  var ground=world.floor_at(e.aimX,10)
  if ground.id>=0:
   var cy=-ground.y
   var color=Color("d4b57e")
   color.a=0.2+sin(clock*15)*0.1
   target.draw_rect(Rect2(e.aimX-64,cy-5,128,7),color)
   for i in range(5): line(target,Vector2(e.aimX-50+i*25,cy),Vector2(e.aimX-54+i*25,cy-10),"aa9d64",3)
 if e.mode=="dive-mark":
  line(target,Vector2(x,y-e.h/2),Vector2(e.aimX,-e.aimY),Color(0.91,0.75,0.46,0.32),2)
  target.draw_arc(Vector2(e.aimX,-e.aimY),20,0,TAU,12,Color("ceb786"),2)
 if e.type=="flyer":
  var flap=sin(clock*11)*17
  poly(target,[Vector2(x-7,y-e.h+7),Vector2(x-50,y-e.h-20+flap),Vector2(x-38,y-e.h+16),Vector2(x-13,y-e.h+26)],"728b75")
  poly(target,[Vector2(x+7,y-e.h+7),Vector2(x+50,y-e.h-20+flap),Vector2(x+38,y-e.h+16),Vector2(x+13,y-e.h+26)],"668371")
 if e.type=="toxling":
  c=Color("839369")
  for i in range(4): target.draw_circle(Vector2(x-15+i*10,y-e.h+3+(i%2)*8),9,Color("92a978"))
 var lean=e.face*(10 if e.mode=="strike" else 0)
 box(target,x-11+lean,y-e.h+9,22,e.h-14,c.darkened(0.15))
 box(target,x-14+lean,y-e.h+4,28,9,c)
 box(target,x-9+lean,y-e.h-6,18,17,c.lightened(0.12))
 box(target,x-10+lean,y-e.h+1,20,4,"293b37")
 box(target,x+e.face*5+lean,y-e.h+1,4,3,"dbb78c")
 box(target,x-10,y-8,7,8,"37433c")
 box(target,x+3,y-8,7,8,"37433c")
 var weapon_x=x+e.face*(21+lean)
 line(target,Vector2(weapon_x,y-5),Vector2(weapon_x+e.face*4,y-42),"a0a58b",4)
 if e.get("frontShield",false):
  var shield_x=x+e.face*18
  box(target,shield_x-5,y-e.h+7,10,e.h-6,"9a9b73")
  box(target,shield_x-3,y-e.h+10,6,e.h-12,"586f5a")
 if e.mode in ["wind","root-wind","spore-wind","dive-mark"]:
  var duration=0.78 if e.mode=="root-wind" else (0.6 if e.mode in ["spore-wind","dive-mark"] else (0.52 if e.get("forestRole","")=="root-guard" else 0.42))
  target.draw_arc(Vector2(x,y-e.h-13),11,-PI/2,TAU*clamp(1-e.timer/duration,0,1)-PI/2,12,Color("e7bf76"),3)
  poly(target,[Vector2(x,y-e.h-30),Vector2(x+5,y-e.h-20),Vector2(x-5,y-e.h-20)],"e7bf76")
 elif e.mode=="recover":
  line(target,Vector2(x-8,y-e.h-14),Vector2(x+8,y-e.h-14),"9cae9a",3)
 if e.hp<e.maxHp:
  box(target,x-17,y-e.h-20,34,3,"2a3639")
  box(target,x-17,y-e.h-20,34*e.hp/e.maxHp,3,"b6a37d")
