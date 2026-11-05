extends "res://scripts/landscape.gd"
## Chapter Three over Codex's Causeway tiles and devices. On top: Phantom (Felix in a hood and mask,
## with a stick dagger), the big man he tails, Mom and the boy at the handoff, Dad's car, Friday
## going to sunset, and the drive at night under passing streetlights.
## Placeholder drawing in code: each figure is one function, ready to be swapped for sprites.

const FelixBody=preload("res://scripts/felix_body.gd")
const Story=preload("res://scripts/phantom_story.gd")
var body=FelixBody.new()
var story=null
var riding=false
var gift_pulse=0.0
var felix_glow=1.0
var felix_light: PointLight2D
var beam_light: PointLight2D
var goal_light: PointLight2D
var head_light: PointLight2D
var glow: Texture2D
var backdrop: Node2D       # the people and the car: in front of the sky, behind the tiles
var LOT=Vector2.ZERO

func _ready():
 LOT=runtime.placements.get(Story.LOT,Vector2.ZERO)
 super._ready()
 glow=radial()
 felix_light=point_light(Color(1,.97,.88),1.0,.9)
 beam_light=point_light(Color(1,.9,.7),1.5,1.4)
 goal_light=point_light(Color(1,.82,.55),1.2,1.0)
 head_light=point_light(Color(1,.95,.8),1.3,1.6)
 backdrop=Node2D.new()
 add_child(backdrop)
 move_child(backdrop,tiles.get_index())
 backdrop.draw.connect(draw_backdrop)

func radial():
 var image=Image.create(128,128,false,Image.FORMAT_RGBA8)
 for y in range(128):
  for x in range(128):
   var d=Vector2(x-64,y-64).length()/64.0
   image.set_pixel(x,y,Color(1,1,1,pow(max(0,1-d),1.8)))
 return ImageTexture.create_from_image(image)

func point_light(color,energy,scale_value):
 var light=PointLight2D.new()
 light.texture=glow
 light.color=color
 light.energy=energy
 light.texture_scale=scale_value
 add_child(light)
 return light

func _process(delta):
 super._process(delta)
 if sim==null or story==null: return
 gift_pulse=max(0,gift_pulse-delta)
 ambient.color=story.ambient()
 felix_glow=lerp(felix_glow,story.felix_radius(),1-exp(-delta*3))
 felix_light.position=actor+Vector2(4,5)-camera
 felix_light.texture_scale=felix_glow*(1+gift_pulse*.6)
 felix_light.energy=1.0+gift_pulse*1.5
 felix_light.visible=sim.p.state!="dead" and not story.in_car
 beam_light.visible=story.ride!=null
 beam_light.position=actor+Vector2(4,-10)-camera
 goal_light.visible=story.in_drive and sim.room.def.has("workshopGoal") and not riding
 if goal_light.visible:
  var goal=sim.room.def.workshopGoal
  goal_light.position=active_position+Vector2(goal[0]+goal[2]/2.0,goal[1]-8)-camera
 head_light.visible=story.car.visible
 head_light.position=story.car.position+Vector2(78,-8)-camera
 head_light.energy=1.3 if story.phase in ["ending","end"] or story.late>.9 else .6
 backdrop.queue_redraw()

# ---------------------------------------------------------------- behind the play plane
func _draw():
 super._draw()
 if story==null or sim==null: return
 ink=self
 # The sun going down over the water: a warm wash low in the sky.
 var sunset=clamp(story.late,0,1)
 if not story.in_drive and story.phase not in ["ending","end"]:
  for i in range(12):
   box(0,100+i*7,320,7,Color(1,.55,.3,sunset*.035*(i+1)/2.0))
  circle(Vector2(250-camera.x*.01,118-sunset*20),14,Color(1,.78,.5,.25+sunset*.35))
 else:
  # Night: the drive and Sunday. Streetlights sweep past in the drive.
  box(0,0,320,184,Color(.04,.05,.12,.55))
  for i in range(24):
   var at=Vector2(fposmod(i*53.3-camera.x*.05,330),fposmod(i*29.1,90))
   box(at.x,at.y,1,1,Color(.9,.92,1,.35+.25*sin(clock+i)))
  if story.in_drive:
   var sweep=fposmod(clock*140,520)-100
   polygon([Vector2(sweep,0),Vector2(sweep+60,0),Vector2(sweep+10,184),Vector2(sweep-50,184)],Color(1,.75,.4,.10*story.streetlight()+.04))

func draw_backdrop():
 if story==null or sim==null: return
 ink=backdrop
 backdrop.draw_set_transform(-camera)
 var view=Rect2(camera-Vector2(60,60),Vector2(440,304))
 if story.car.visible and view.has_point(story.car.position+Vector2(40,0)): draw_car(story.car.position)
 if story.man.visible and view.has_point(story.man.position): draw_man(story.man)
 if story.mom.visible and view.has_point(story.mom.position): draw_mom(story.mom)
 if story.boy.visible and view.has_point(story.boy.position): draw_boy(story.boy)
 ink=self

# A plain figure: legs, body, arms, head. Everything is feet-up from `at`.
func legs(at,height,color,walking,phase=0.0):
 var swing=sin(clock*8+phase)*(3.0 if walking else 0.0)
 line(at+Vector2(-2,-height),at+Vector2(-2-swing,0),color,3)
 line(at+Vector2(2,-height),at+Vector2(2+swing,0),color,3)
 box(at.x-4-swing,at.y-1,4,2,"#1d1d24")
 box(at.x+swing,at.y-1,4,2,"#1d1d24")

func draw_man(m):
 var at=m.position.round()
 var f=m.facing
 var walking=m.pose=="walk"
 # A big man in a brown work jacket and a knit cap. Softer once the boy has seen him clear the road.
 var jacket=Color("#7a5236") if m.soft else Color("#5c3c29")
 legs(at,30,"#364055",walking)
 box(at.x-11,at.y-62,22,34,jacket)
 box(at.x-11,at.y-34,22,4,jacket.darkened(.25))
 line(at+Vector2(0,-60),at+Vector2(0,-31),jacket.darkened(.3),1)
 box(at.x-5,at.y-64,10,3,"#d9c7a8")
 var head=at+Vector2(f*1,-72)
 circle(head,8,"#c99a76")
 box(head.x-8,head.y-9,16,6,"#33424a")
 box(head.x-8,head.y-4,16,2,"#28343a")
 if m.pose!="back": box(head.x+f*3,head.y-1,2,2,"#2a1d18")
 else: box(head.x-f*4,head.y-1,2,2,"#2a1d18")
 box(head.x-5+f*1,head.y+3,10,3,"#7a5a44")
 var shoulder_l=at+Vector2(-10,-58)
 var shoulder_r=at+Vector2(10,-58)
 var swing=sin(clock*8)*(4.0 if walking else .5)
 match m.pose:
  "phone":
   line(shoulder_l,at+Vector2(-12,-36),jacket,5)
   line(shoulder_r,head+Vector2(f*6,4),jacket,5)
   box(head.x+f*6-2,head.y-2,4,7,"#1b1d24")
   box(head.x+f*6-1,head.y-1,2,4,Color(.7,.9,1,.8+sin(clock*12)*.2))
  "coffees":
   for side in [-1,1]:
    var hand=at+Vector2(side*10+f*6,-38)
    line(at+Vector2(side*10,-58),hand,jacket,5)
    box(hand.x-3,hand.y-7,6,8,"#f2ece0")
    box(hand.x-3,hand.y-4,6,3,"#8a5a3a")
    line(hand+Vector2(0,-8),hand+Vector2(sin(clock*2+side)*2,-14),Color(1,1,1,.35),1)
  "hold":
   # An arm around her shoulders.
   line(shoulder_l,at+Vector2(-12,-36),jacket,5)
   line(shoulder_r,story.mom.position+Vector2(4,-56),jacket,5)
  "bag":
   line(shoulder_l,at+Vector2(-12,-36),jacket,5)
   line(shoulder_r,at+Vector2(12,-36),jacket,5)
   duffel(at+Vector2(12,-30))
  _:
   line(shoulder_l,at+Vector2(-12-swing,-36),jacket,5)
   line(shoulder_r,at+Vector2(12+swing,-36),jacket,5)

func draw_mom(m):
 var at=m.position.round()
 var f=m.facing
 var coat=Color("#4d7377")
 legs(at,26,"#2f3446",m.pose=="walk",1.3)
 box(at.x-8,at.y-54,16,30,coat)
 box(at.x-7,at.y-55,14,4,"#c75f5f")
 var down=m.pose=="down"
 var head=at+Vector2(f*1,-61+(2 if down else 0))
 # Long hair falls behind.
 box(head.x-7,head.y-6,14,16,"#5a3a2a")
 circle(head,6,"#e0b495")
 if not down:
  box(head.x+f*2,head.y-1,2,1,"#2a1d18")
  box(head.x+f*1-1,head.y+3,4,1,"#a0524a")
 else:
  box(head.x+f*2-1,head.y+1,3,1,"#2a1d18")
 box(head.x-7,head.y-8,14,4,"#5a3a2a")
 var shoulder_l=at+Vector2(-7,-51)
 var shoulder_r=at+Vector2(7,-51)
 match m.pose:
  "wave":
   line(shoulder_l,at+Vector2(-9,-30),coat,4)
   line(shoulder_r,at+Vector2(14,-66+sin(clock*9)*3),coat,4)
  "down":
   line(shoulder_l,at+Vector2(-9,-30),coat,4)
   line(shoulder_r,head+Vector2(f*2,4),coat,4)
  _:
   line(shoulder_l,at+Vector2(-9,-30),coat,4)
   line(shoulder_r,at+Vector2(9,-30),coat,4)

func draw_boy(b):
 var at=b.position.round()
 var f=b.facing
 var hoodie=Color("#2f4a78")
 legs(at,20,"#3a5072",b.pose=="walk",.6)
 box(at.x-7,at.y-42,14,23,hoodie)
 box(at.x-7,at.y-24,14,3,hoodie.darkened(.25))
 box(at.x-2,at.y-34,4,1,"#e8e2d0")
 var head=at+Vector2(f*1,-48)
 circle(head,6,"#e6b996")
 box(head.x-6,head.y-7,12,4,"#3a2a20")
 box(head.x-6+(0 if f>0 else 9),head.y-4,3,4,"#3a2a20")
 box(head.x+f*3-1,head.y-1,2,2,"#241a14")
 # The hood down behind his neck.
 box(at.x-6-f*2,at.y-44,10,4,hoodie.darkened(.15))
 var shoulder_l=at+Vector2(-6,-40)
 var shoulder_r=at+Vector2(6,-40)
 if b.pose=="point":
  line(shoulder_l,at+Vector2(-8,-24),hoodie,4)
  line(shoulder_r,at+Vector2(f*20,-50),hoodie,4)
 elif b.pose=="give":
  line(shoulder_l,at+Vector2(-8,-24),hoodie,4)
  line(shoulder_r,at+Vector2(f*14,-34),hoodie,4)
 else:
  var swing=sin(clock*8)*(3.0 if b.pose=="walk" else .4)
  line(shoulder_l,at+Vector2(-8-swing,-24),hoodie,4)
  line(shoulder_r,at+Vector2(8+swing,-24),hoodie,4)
 if b.bag: duffel(at+Vector2(-f*10 if b.pose!="give" else f*16,-26))

func duffel(at):
 box(at.x-8,at.y,16,9,"#3d5a4a")
 box(at.x-8,at.y,16,2,"#4f7360")
 line(at+Vector2(-5,0),at+Vector2(0,-5),"#2b3d33",1)
 line(at+Vector2(0,-5),at+Vector2(5,0),"#2b3d33",1)

# Dad's car, facing right, with Dad's shape in the driver's window.
func draw_car(at):
 at=at.round()
 var paint=Color("#46566e")
 box(at.x,at.y-18,80,12,paint)
 polygon([at+Vector2(14,-18),at+Vector2(24,-30),at+Vector2(58,-30),at+Vector2(68,-18)],paint)
 polygon([at+Vector2(18,-19),at+Vector2(26,-28),at+Vector2(40,-28),at+Vector2(40,-19)],"#9fb4c8")
 polygon([at+Vector2(42,-19),at+Vector2(42,-28),at+Vector2(56,-28),at+Vector2(64,-19)],"#9fb4c8")
 if story.car.dad:
  circle(at+Vector2(50,-24),4,"#22252e")
  box(at.x+46,at.y-21,8,3,"#22252e")
 box(at.x,at.y-8,80,2,paint.darkened(.3))
 for x in [16,64]:
  circle(at+Vector2(x,-5),6,"#1a1b20")
  circle(at+Vector2(x,-5),2.5,"#8d929c")
 box(at.x+76,at.y-16,4,3,"#fff2c4")
 box(at.x,at.y-16,3,3,"#d8443c")

# ---------------------------------------------------------------- in front
func draw_front():
 super.draw_front()
 if story==null or sim==null: return
 ink=front
 front.draw_set_transform(Vector2.ZERO)
 if not story.badge.taken:
  var d=story.badge.at-camera
  if Rect2(-20,-20,360,224).has_point(d): id_card(d+Vector2(-6,-5+sin(clock*2)*1.2))
 if story.in_drive and sim.room.def.has("workshopGoal") and not riding:
  # The finish is a streetlight's pool.
  var goal=sim.room.def.workshopGoal
  var pool=active_position+Vector2(goal[0]+goal[2]/2.0,goal[1])-camera
  var width=goal[2]+12
  polygon([pool+Vector2(-4,-120),pool+Vector2(4,-120),pool+Vector2(width/2,0),pool+Vector2(-width/2,0)],Color(1,.78,.45,.13))
  box(pool.x-2,pool.y-124,4,6,"#e9c27a")
 if riding and story.ride!=null:
  # Headlights sweep him on.
  var top=actor-camera
  polygon([top+Vector2(-4,-200),top+Vector2(14,-200),top+Vector2(16,12),top+Vector2(-8,12)],Color(1,.92,.7,.16))
 if story.in_car and story.car.visible:
  # The back window: a small face looking out the rear of the leaving car.
  var c=story.car.position-camera
  box(c.x+20,c.y-27,6,6,Color(1,.97,.85,.85))
 ink=self

func id_card(at):
 box(at.x,at.y,12,9,"#f1ead6")
 box(at.x,at.y,12,2,"#c0392b")
 box(at.x+1,at.y+3,4,4,"#2f4a78")
 box(at.x+6,at.y+3,5,1,"#4a4a4a")
 box(at.x+6,at.y+5,4,1,"#4a4a4a")

# ---------------------------------------------------------------- Felix
func draw_knight(pose=null,at=Vector2(INF,INF),phase_override=-1.0):
 if story!=null and story.in_car: return
 var p=sim.p
 var g=story.gifts if story!=null else {"legs":true,"cape":true,"arms":true,"face":true,"mask":true,"dagger":true}
 var center=body.draw(self,g)
 if g.get("mask",false): mask(center,p.facing)
 if g.get("dagger",false): dagger(center,p)
 elif story!=null and story.phase in ["ending","end"] and story.end_time>13.0:
  # The hood and mask folded by his feet.
  box(actor.x+9,actor.y+8,6,2,"#23252f")
  box(actor.x+10,actor.y+7,3,1,"#3a3d4c")

# A dark hood over his light and a mask across his eyes.
func mask(center,facing):
 polygon([center+Vector2(-5,-1),center+Vector2(-4,-6),center+Vector2(0,-8),center+Vector2(4,-6),center+Vector2(5,-1),center+Vector2(3,-4),center+Vector2(-3,-4)],"#262838")
 box(center.x-4,center.y-2,8,2,"#14151c")
 box(center.x-2+facing,center.y-2,1,1,"#ffffff")
 box(center.x+1+facing,center.y-2,1,1,"#ffffff")
 line(center+Vector2(-facing*4,-1),center+Vector2(-facing*7,1+sin(clock*6)),"#14151c",1)

# Dad's walking stick, snapped short.
func dagger(center,p):
 var f=p.facing
 var swing=p.get("strikeTimer",0)
 var hand=center+Vector2(f*3.6,1.4)
 var aim=Vector2(f*3.2,-2.6)
 if p.state=="strike" or swing>0:
  var dir=p.get("strikeDir",{"x":f,"y":0})
  aim=Vector2(dir.get("x",f) if dir is Dictionary else f,dir.get("y",0) if dir is Dictionary else 0)
  if aim==Vector2.ZERO: aim=Vector2(f,0)
  var u=clamp(float(swing)/max(1,sim.K.get("strikeFrames",5)),0,1)
  aim=aim.normalized().rotated((u-.5)*1.15*f)*5.0
 line(hand,hand+aim,"#8a6440",1.6)
 box((hand+aim).x-.5,(hand+aim).y-.5,1,1,"#c9a77c")

func draw_world_hearts(): pass
func draw_silas_quest(): pass

func target_camera():
 if riding: return Vector2(actor.x-153,actor.y-100)
 # At the lot, frame the people and the car while a scene plays.
 if story!=null and story.room==Story.LOT and (story.freeze>0 or story.phase in ["ending","end"]):
  var left=LOT.x
  var watch=story.man.position.x
  if story.car.leaving and story.car.position.x<watch+180: watch=lerp(watch,story.car.position.x,.3)
  return Vector2(left-8 if story.phase in ["ending","end"] else watch-120,LOT.y+34*8-150)
 return super.target_camera()
