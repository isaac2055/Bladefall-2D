extends "res://scripts/landscape.gd"
## Chapter Two over Codex's Black Woods: its forest, tiles and devices are drawn as they are.
## On top: Felix (the light, then Sir Felix), the boy walking with him, the afternoon going to
## dusk, Dad's cabin, the storm, and the flashlight story.

const FelixBody=preload("res://scripts/felix_body.gd")
const Story=preload("res://scripts/woods_story.gd")
var body=FelixBody.new()
var story=null
var riding=false
var gift_pulse=0.0
var felix_glow=1.0
var felix_light: PointLight2D
var beam_light: PointLight2D
var cabin_light: PointLight2D
var glow: Texture2D
var drops=[]
var backdrop: Node2D       # the boy, Dad and the cabin: in front of the forest, behind the tiles
# Dad's cabin stands on the overlook's floor, where Felix comes down to it, in world pixels.
var CABIN=Rect2()
var FLOOR_Y=0.0

func _ready():
 var hall=runtime.placements.get(Story.CABIN,Vector2.ZERO)
 FLOOR_Y=hall.y+22*8
 CABIN=Rect2(hall.x+14*8,FLOOR_Y-320,300,320)
 super._ready()
 glow=radial()
 felix_light=point_light(Color(1,.97,.88),1.0,.9)
 beam_light=point_light(Color(.85,.92,1),1.6,1.4)
 cabin_light=point_light(Color(1,.8,.5),1.3,3.0)
 for i in range(140): drops.append(Vector2(hash_at(i,7)%340,hash_at(i,9)%200))
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
 felix_light.visible=sim.p.state!="dead"
 # In Dad's story the flashlight follows the knight; at the goal it is a bright pool.
 beam_light.visible=story.in_tale or story.ride!=null
 beam_light.position=actor+Vector2(4,-10)-camera
 var lit_cabin=story.power and story.room==Story.CABIN
 cabin_light.visible=story.room==Story.CABIN
 cabin_light.position=Vector2(CABIN.position.x+150,CABIN.position.y+150)-camera
 cabin_light.energy=1.3 if lit_cabin else (.5 if story.dad.flashlight else 0.0)
 cabin_light.color=Color(1,.8,.5) if lit_cabin else Color(.8,.88,1)
 backdrop.queue_redraw()

# ---------------------------------------------------------------- behind the play plane
func _draw():
 super._draw()
 if story==null or sim==null: return
 ink=self
 # Late light: the forest warms, then darkens, in front of Codex's sky.
 var late=story.dusk
 box(0,0,320,184,Color(1,.55,.3,.10*clamp(late*2,0,1)*(1-clamp(late*1.6-.6,0,1))))
 box(0,0,320,184,Color(.05,.06,.14,.35*clamp(late*1.6-.6,0,1)))
 if story.thunder>0: box(0,0,320,184,Color(.85,.9,1,.25*story.thunder))

func draw_backdrop():
 if story==null or sim==null: return
 ink=backdrop
 backdrop.draw_set_transform(-camera)
 var view=Rect2(camera-Vector2(30,30),Vector2(380,244))
 if story.in_tale or story.room in story.tale_rooms: tale_backdrop(view)
 if view.intersects(CABIN.grow(80)): cabin()
 draw_boy()
 if story.dad.visible and view.intersects(CABIN.grow(120)): draw_dad()
 ink=self

# Dad's cabin, seen from a firefly's height: the bottom log, the step and the lit door.
func cabin():
 var c=CABIN
 var lit=story.power
 box(c.position.x,c.position.y,c.size.x,c.size.y,"#3a2a20")
 for r in range(0,int(c.size.y),22):
  box(c.position.x,c.position.y+r,c.size.x,19,"#5a3f2a" if (r/22)%2==0 else "#523825")
  circle(Vector2(c.position.x+4,c.position.y+r+9),9,"#6e5036")
  circle(Vector2(c.end.x-4,c.position.y+r+9),9,"#6e5036")
 # The door, warm until the power goes.
 var door=Rect2(c.position.x+170,c.end.y-190,82,190)
 box(door.position.x-6,door.position.y-6,door.size.x+12,door.size.y+6,"#2a1d15")
 box(door.position.x,door.position.y,door.size.x,door.size.y,"#e8b46a" if lit else "#1c2234")
 if lit:
  box(door.position.x+8,door.position.y+10,door.size.x-16,70,"#f5cf8a")
 # A window with a rope-light Dad hung for the weekend.
 var win=Rect2(c.position.x+40,c.position.y+90,90,70)
 box(win.position.x-5,win.position.y-5,win.size.x+10,win.size.y+10,"#2a1d15")
 box(win.position.x,win.position.y,win.size.x,win.size.y,"#f2c47d" if lit else "#151a29")
 line(Vector2(win.position.x+45,win.position.y),Vector2(win.position.x+45,win.end.y),"#2a1d15",4)
 line(Vector2(win.position.x,win.position.y+35),Vector2(win.end.x,win.position.y+35),"#2a1d15",4)
 for i in range(9):
  var at=Vector2(c.position.x+20+i*32,c.position.y+70+sin(i*1.3)*4)
  circle(at,2.4,(Color("#ffd98a") if i%2==0 else Color("#ff9f7a")) if lit else Color("#3b3f52"))
 # The porch step, big as a cliff.
 box(c.position.x+140,c.end.y-24,150,24,"#6b4b33")
 box(c.position.x+140,c.end.y-24,150,4,"#8a6545")
 marker("Felix's Weekend Castle",Vector2(c.position.x+40,c.position.y+30),9,Color("#f3e6c8",.75 if lit else .3))

func marker(text_value,at,size,color):
 ink.draw_string(ThemeDB.fallback_font,at,text_value,HORIZONTAL_ALIGNMENT_LEFT,-1,size,color*ink_color)

# Dad: a big shape sitting on the porch step, backlit by the door, so we never see his face.
# Side view, facing out toward Felix (drawn facing left, then mirrored). Later, the boy asleep
# across his lap.
func dad_point(): return Vector2(CABIN.position.x+236,FLOOR_Y)

func draw_dad():
 var at=dad_point()
 backdrop.draw_set_transform_matrix(Transform2D(Vector2(-1,0),Vector2(0,1),Vector2(2*at.x-camera.x,-camera.y)))
 var lit=story.power
 var body=Color("#1d1b24")
 var rim=Color("#f2b866") if lit else Color("#9fb4dc")
 var seat=at+Vector2(10,-24)
 # Boots, shins, knees up, thighs back to the step.
 var knee=at+Vector2(-48,-62)
 var hip=seat+Vector2(6,-8)
 polygon([at+Vector2(-74,0),at+Vector2(-74,-12),at+Vector2(-58,-16),at+Vector2(-42,-16),at+Vector2(-40,0)],body)
 polygon([at+Vector2(-60,-14),at+Vector2(-44,-14),knee+Vector2(8,2),knee+Vector2(-10,0)],body)
 polygon([knee+Vector2(-10,-6),knee+Vector2(6,-12),hip+Vector2(8,-8),hip+Vector2(4,12),knee+Vector2(8,8)],body)
 # Back, shoulders, head bowed toward the boy.
 var shoulder=hip+Vector2(-8,-70)
 polygon([hip+Vector2(-10,10),hip+Vector2(22,10),shoulder+Vector2(24,-2),shoulder+Vector2(-8,-6)],body)
 circle(shoulder+Vector2(-6,-22),16,body)
 # Rim light from the doorway behind him.
 line(shoulder+Vector2(24,-2),hip+Vector2(22,10),rim,2)
 ink.draw_arc(shoulder+Vector2(-6,-22),16,-PI*.45,PI*.2,10,rim*ink_color,2)
 line(knee+Vector2(6,-12),hip+Vector2(8,-8),Color(rim,.6),1.5)
 # Forearm on his knee; the flashlight in his hand once the power goes.
 var hand=knee+Vector2(-6,-16)
 line(shoulder+Vector2(4,6),knee+Vector2(4,-14),body,8)
 line(knee+Vector2(4,-14),hand,body,7)
 if story.dad.flashlight:
  box(hand.x-16,hand.y-4,16,8,"#2b2f3a")
  box(hand.x-18,hand.y-5,3,10,"#d8e2f0")
  var beam=PackedVector2Array([hand+Vector2(-18,-5),hand+Vector2(-170,-50),hand+Vector2(-170,70),hand+Vector2(-18,5)])
  ink.draw_colored_polygon(beam,Color(.9,.95,1,.10))
 if story.dad.lap: boy_asleep(seat+Vector2(-30,-14))
 backdrop.draw_set_transform(-camera)

# Dad's story: rain in the dark, and the flashlight finding the knight.
func tale_backdrop(view):
 box(view.position.x,view.position.y,view.size.x,view.size.y,Color(.02,.03,.08,.35))

func draw_front():
 super.draw_front()
 if story==null or sim==null: return
 ink=front
 front.draw_set_transform(Vector2.ZERO)
 if story.raining>0:
  var fall=clock*260
  for i in range(drops.size()):
   var d=drops[i]
   var x=fposmod(d.x-fall*.25-camera.x*.3,340)-10
   var y=fposmod(d.y+fall-camera.y*.3,200)-10
   line(Vector2(x,y),Vector2(x-1.5,y+6),Color(.75,.82,1,.28*story.raining),.6)
 # The secret: the boy's drawing of Sir Felix, pinned to a root.
 if not story.drawing.taken:
  var d=story.drawing.at-camera
  if Rect2(-20,-20,360,224).has_point(d):
   var bob=sin(clock*2)*1.2
   box(d.x-5,d.y-6+bob,10,8,"#efe6cf")
   box(d.x-5,d.y-6+bob,10,1,"#d8433a")
   circle(Vector2(d.x-1,d.y-2+bob),1.6,"#f3d27a")
   line(Vector2(d.x+1,d.y-3+bob),Vector2(d.x+3.5,d.y-5+bob),"#8a6545",.6)
 # Dad's flashlight: it points at where the story goes next, and carries the knight there.
 if story.in_tale and sim.room.def.has("workshopGoal") and not riding:
  var goal=sim.room.def.workshopGoal
  var pool=active_position+Vector2(goal[0]+goal[2]/2.0,goal[1])-camera
  var wobble=sin(clock*.9)*6
  ink.draw_colored_polygon(PackedVector2Array([pool+Vector2(-10+wobble,-260),pool+Vector2(10+wobble,-260),pool+Vector2(goal[2]/2.0+4,2),pool+Vector2(-goal[2]/2.0-4,2)]),Color(.9,.95,1,.09))
  ink.draw_colored_polygon(PackedVector2Array([pool+Vector2(-goal[2]/2.0-4,2),pool+Vector2(goal[2]/2.0+4,2),pool+Vector2(goal[2]/2.0,5),pool+Vector2(-goal[2]/2.0,5)]),Color(.95,.97,1,.25))
 if riding and story.ride!=null:
  var top=actor-camera
  ink.draw_colored_polygon(PackedVector2Array([top+Vector2(-2,-200),top+Vector2(10,-200),top+Vector2(14,12),top+Vector2(-6,12)]),Color(.9,.95,1,.12))
 front.draw_set_transform_matrix(paint_transform)

# ---------------------------------------------------------------- the boy
# He stands back in the forest's depth, softer than the play plane, except while he knights Felix.
func draw_boy():
 var b=story.boy
 if not b.visible or b.pose=="lap": return
 if story.in_tale or story.room in story.tale_rooms: return
 var at=b.position
 var keep=ink_color
 if b.follow: ink_color=Color(.66,.7,.68,.78)
 match b.pose:
  "kneel": boy_kneeling(at,b.facing,b.prop)
  _: boy_standing(at,b.facing,b.pose)
 ink_color=keep

func boy_head(c,face_dir,mood_name):
 circle(c,15,"#f1c9a5")
 polygon([c+Vector2(-16,-2),c+Vector2(-14,-14),c+Vector2(-4,-19),c+Vector2(8,-18),c+Vector2(16,-9),c+Vector2(15,-1),c+Vector2(9,-9),c+Vector2(0,-8),c+Vector2(-8,-11)],"#5b3a24")
 polygon([c+Vector2(-2,-17),c+Vector2(2,-25),c+Vector2(5,-17)],"#5b3a24")
 var e=c+Vector2(face_dir*3,1)
 if mood_name=="asleep":
  line(e+Vector2(-7,0),e+Vector2(-3,0),"#3b2a22",1.2)
  line(e+Vector2(3,0),e+Vector2(7,0),"#3b2a22",1.2)
 else:
  circle(e+Vector2(-5,0),2.2,"#2b211c")
  circle(e+Vector2(5,0),2.2,"#2b211c")
  box(e.x-5.5,e.y-1,1,1,"#ffffff")
  box(e.x+4.5,e.y-1,1,1,"#ffffff")
  ink.draw_arc(e+Vector2(0,5),3.5,.2,PI-.2,8,Color("#7a4636")*ink_color,1.2)
 circle(c+Vector2(-9+face_dir*2,5),2.6,Color("#f09a8a",.35))
 circle(c+Vector2(9+face_dir*2,5),2.6,Color("#f09a8a",.35))

# Two years older than the first night: a striped t-shirt, shorts, a backpack for the weekend.
func shirt(rect):
 box(rect.position.x,rect.position.y,rect.size.x,rect.size.y,"#d8553f")
 for y in range(int(rect.position.y)+4,int(rect.end.y),8): box(rect.position.x,y,rect.size.x,3,"#f0e2c4")

func boy_standing(at,facing,pose):
 var run=pose=="run"
 var t=clock*9
 for side in [-1,1]:
  var swing=sin(t+(0.0 if side<0 else PI))*(12 if run else 0)
  line(at+Vector2(side*5,-56),at+Vector2(side*5+swing,-2),"#f1c9a5",7)
  box(at.x+side*5+swing-6,at.y-6,13,6,"#4c6fb5")
 box(at.x-14,at.y-66,28,14,"#3a557f")
 box(at.x-facing*20-6,at.y-104,12,34,"#4c8a5a")
 shirt(Rect2(at+Vector2(-13,-106),Vector2(26,44)))
 var arm_b=at+Vector2(12,-100)
 var arm_a=at+Vector2(-12,-100)
 if pose=="point": line(arm_b,arm_b+Vector2(facing*24,-22),"#f1c9a5",6)
 else: line(arm_b,arm_b+Vector2(4+sin(t)*(8 if run else 1),28),"#f1c9a5",6)
 line(arm_a,arm_a+Vector2(-4-sin(t)*(8 if run else 1),28),"#f1c9a5",6)
 boy_head(at+Vector2(0,-122),facing,"look")

func boy_kneeling(at,facing,prop):
 shirt(Rect2(at+Vector2(-13,-68),Vector2(26,42)))
 box(at.x-14,at.y-30,28,12,"#3a557f")
 line(at+Vector2(-6,-22),at+Vector2(-18*facing,-2),"#f1c9a5",7)
 line(at+Vector2(6,-22),at+Vector2(10,-2),"#f1c9a5",7)
 var hand=at+Vector2(facing*22,-48)
 line(at+Vector2(facing*10,-62),hand,"#f1c9a5",6)
 if prop=="stick":
  # Dad's walking stick, held out like a sword, its tip on the knight's shoulder.
  var tip=actor+Vector2(4,-1+sin(clock*2)*1.5)
  line(hand,tip,"#7a5233",4)
  line(hand+Vector2(facing*12,6),hand+Vector2(facing*12,6)+Vector2(-facing*3,-8),"#7a5233",2)
 boy_head(at+Vector2(0,-84),facing,"look")

# Curled up across Dad's knees, head on his arm.
func boy_asleep(at):
 shirt(Rect2(at+Vector2(-20,-14),Vector2(46,24)))
 line(at+Vector2(24,0),at+Vector2(44,10),"#f1c9a5",7)
 boy_head(at+Vector2(-30,-14),-1,"asleep")
 if fmod(clock,4.0)<2.6:
  var z=fmod(clock,4.0)
  marker("z",at+Vector2(-44-z*4,-34-z*8),9,Color(.85,.88,1,.6*(1-z/2.6)))

# ---------------------------------------------------------------- Felix
func draw_knight(pose=null,at=Vector2(INF,INF),phase_override=-1.0):
 var p=sim.p
 var g=story.gifts if story!=null else {"legs":true,"cape":true,"arms":true,"face":true,"sword":true,"helmet":true}
 var center=body.draw(self,g)
 if g.get("helmet",false): helmet(center,p.facing)
 if g.get("sword",false): sword(center,p)
 elif story!=null and story.phase in ["ending","end"] and story.end_time>12.5:
  # Set down beside him for the night.
  line(Vector2(actor.x+10,actor.y+10),Vector2(actor.x+19,actor.y+10),"#c9b48a",1.2)
  box(actor.x+11,actor.y+7,4,3,"#b89b6a")

# A cardboard helmet with a crayon plume.
func helmet(center,facing):
 var c=center+Vector2(0,-1.2)
 polygon([c+Vector2(-3.8,.4),c+Vector2(-3.6,-2.6),c+Vector2(-1.5,-4.2),c+Vector2(1.5,-4.2),c+Vector2(3.6,-2.6),c+Vector2(3.8,.4)],"#c9a46a")
 box(c.x-3.8,c.y-.4,7.6,.9,"#a88350")
 box(c.x+facing*.6-.4,c.y-6.2,.9,2.2,"#d8433a")
 box(c.x+facing*.6-1.1,c.y-6.6,2.2,.9,"#d8433a")

# Dad's stick, now a sword: it swings with the strike.
func sword(center,p):
 var f=p.facing
 var swing=p.get("strikeTimer",0)
 var hand=center+Vector2(f*3.6,1.4)
 var tip=hand+Vector2(f*5.2,-4.2)
 if p.state=="strike" or swing>0:
  var dir=p.get("strikeDir",{"x":f,"y":0})
  var d=Vector2(dir.get("x",f) if dir is Dictionary else f,dir.get("y",0) if dir is Dictionary else 0)
  if d==Vector2.ZERO: d=Vector2(f,0)
  tip=hand+d.normalized()*7.5
 line(hand,tip,"#9b7046",1.3)
 line(hand+(tip-hand)*.2+Vector2(0,-1.2),hand+(tip-hand)*.2+Vector2(0,1.2),"#6e4c2e",.9)

# The secret's reward is the boy's drawing, not a heart.
func draw_world_hearts(): pass

func target_camera():
 if riding: return Vector2(actor.x-153,actor.y-100)
 # At the cabin, frame Dad, the boy and Felix together while the scene plays.
 if story!=null and story.room==Story.CABIN and story.dad.visible and (story.freeze>0 or story.phase in ["ending","end"]):
  var mid=(dad_point().x+actor.x)/2.0
  return Vector2(mid-160,actor.y-133)
 return super.target_camera()
