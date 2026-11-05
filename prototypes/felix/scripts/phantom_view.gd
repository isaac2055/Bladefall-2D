extends "res://scripts/landscape.gd"
## Chapter Three over Codex's Causeway tiles and devices. On top: Phantom (Felix in a hood and mask,
## with a stick dagger), the big man he tails, Mom and the boy at the handoff, Dad's car, Friday
## going to sunset, and the drive at night under passing streetlights.
## Native pixel sprites; people remain feet-anchored to phantom_story.stand_spot.


const SPRITES={
 "bottle-cap":preload("res://art/phantom/bottle-cap.png"),
 "boy-give":preload("res://art/phantom/boy-give.png"),
 "boy-point":preload("res://art/phantom/boy-point.png"),
 "boy-stand":preload("res://art/phantom/boy-stand.png"),
 "boy-walk-0":preload("res://art/phantom/boy-walk-0.png"),
 "boy-walk-1":preload("res://art/phantom/boy-walk-1.png"),
 "boy-walk-2":preload("res://art/phantom/boy-walk-2.png"),
 "boy-walk-3":preload("res://art/phantom/boy-walk-3.png"),
 "brute-attack":preload("res://art/phantom/brute-attack.png"),
 "brute-hurt":preload("res://art/phantom/brute-hurt.png"),
 "brute-idle":preload("res://art/phantom/brute-idle.png"),
 "brute-tell":preload("res://art/phantom/brute-tell.png"),
 "car":preload("res://art/phantom/car.png"),
 "chain":preload("res://art/phantom/chain.png"),
 "dagger":preload("res://art/phantom/dagger.png"),
 "duffel":preload("res://art/phantom/duffel.png"),
 "folded":preload("res://art/phantom/folded.png"),
 "gravel":preload("res://art/phantom/gravel.png"),
 "hand":preload("res://art/phantom/hand.png"),
 "headlights":preload("res://art/phantom/headlights.png"),
 "hood":preload("res://art/phantom/hood.png"),
 "id-card":preload("res://art/phantom/id-card.png"),
 "light-pool":preload("res://art/phantom/light-pool.png"),
 "light-shaft":preload("res://art/phantom/light-shaft.png"),
 "man-back":preload("res://art/phantom/man-back.png"),
 "man-back-warm":preload("res://art/phantom/man-back-warm.png"),
 "man-bag":preload("res://art/phantom/man-bag.png"),
 "man-bag-warm":preload("res://art/phantom/man-bag-warm.png"),
 "man-coffees":preload("res://art/phantom/man-coffees.png"),
 "man-coffees-warm":preload("res://art/phantom/man-coffees-warm.png"),
 "man-hold":preload("res://art/phantom/man-hold.png"),
 "man-hold-warm":preload("res://art/phantom/man-hold-warm.png"),
 "man-phone":preload("res://art/phantom/man-phone.png"),
 "man-phone-warm":preload("res://art/phantom/man-phone-warm.png"),
 "man-stand":preload("res://art/phantom/man-stand.png"),
 "man-stand-warm":preload("res://art/phantom/man-stand-warm.png"),
 "man-walk-0":preload("res://art/phantom/man-walk-0.png"),
 "man-walk-0-warm":preload("res://art/phantom/man-walk-0-warm.png"),
 "man-walk-1":preload("res://art/phantom/man-walk-1.png"),
 "man-walk-1-warm":preload("res://art/phantom/man-walk-1-warm.png"),
 "man-walk-2":preload("res://art/phantom/man-walk-2.png"),
 "man-walk-2-warm":preload("res://art/phantom/man-walk-2-warm.png"),
 "man-walk-3":preload("res://art/phantom/man-walk-3.png"),
 "man-walk-3-warm":preload("res://art/phantom/man-walk-3-warm.png"),
 "mask":preload("res://art/phantom/mask.png"),
 "mom-down":preload("res://art/phantom/mom-down.png"),
 "mom-stand":preload("res://art/phantom/mom-stand.png"),
 "mom-walk-0":preload("res://art/phantom/mom-walk-0.png"),
 "mom-walk-1":preload("res://art/phantom/mom-walk-1.png"),
 "mom-walk-2":preload("res://art/phantom/mom-walk-2.png"),
 "mom-walk-3":preload("res://art/phantom/mom-walk-3.png"),
 "mom-wave":preload("res://art/phantom/mom-wave.png"),
 "parking-stripe":preload("res://art/phantom/parking-stripe.png"),
 "rear-face":preload("res://art/phantom/rear-face.png"),
 "rivets":preload("res://art/phantom/rivets.png"),
 "sky-day":preload("res://art/phantom/sky-day.png"),
 "sky-night":preload("res://art/phantom/sky-night.png"),
 "sky-sunset":preload("res://art/phantom/sky-sunset.png"),
 "sleeve-warm":preload("res://art/phantom/sleeve-warm.png"),
 "streetlamp":preload("res://art/phantom/streetlamp.png"),
 "sun":preload("res://art/phantom/sun.png"),
 "tie":preload("res://art/phantom/tie.png"),
 "viaduct":preload("res://art/phantom/viaduct.png"),
}

func sprite(name,at,size=Vector2.ZERO,tint=Color.WHITE):
 var texture=SPRITES[name]
 if size==Vector2.ZERO: ink.draw_texture(texture,at.round(),tint*ink_color)
 else: ink.draw_texture_rect(texture,Rect2(at.round(),size),false,tint*ink_color)

func person_sprite(who,m):
 var pose=m.pose
 if pose=="walk": pose+="-"+str(int(clock*8)%4)
 var name=who+"-"+pose
 if who=="man" and m.soft: name+="-warm"
 var texture=SPRITES[name]
 ink.draw_set_transform(m.position.round()-camera,0,Vector2(m.facing,1))
 sprite(name,Vector2(-24,1-texture.get_height()))
 ink.draw_set_transform(-camera)

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
# The base background calls this virtual function; a single sun and reflective water.
func draw_causeway():
 var late=clamp(story.late,0,1) if story!=null else 0.0
 var night=story!=null and (story.in_drive or story.phase in ["ending","end"])
 sprite("sky-night" if night else "sky-day",Vector2.ZERO)
 if not night:
  sprite("sky-sunset",Vector2.ZERO,Vector2.ZERO,Color(1,1,1,late))
  sprite("sun",Vector2(235-camera.x*.01,75+late*23))
 for layer in range(3):
  var pitch=96-layer*12
  var shift=fposmod(camera.x*(.045+layer*.065),pitch)
  for i in range(-1,6):
   var tone=Color(.62,.66,.77,.38) if night else Color(.83,.81,.87,.35+layer*.12)
   sprite("viaduct",Vector2(i*pitch-shift,116+layer*23-camera.y*.025),Vector2(pitch,110),tone)
 if night and story.in_drive:
  var sweep=fposmod(clock*140,520)-100
  sprite("light-shaft",Vector2(sweep-48,0),Vector2.ZERO,Color(1,1,1,.4+story.streetlight()))

func draw_backdrop():
 if story==null or sim==null: return
 ink=backdrop
 backdrop.draw_set_transform(-camera)
 var view=Rect2(camera-Vector2(60,60),Vector2(440,304))
 if story.car.visible and view.has_point(story.car.position+Vector2(40,0)): draw_car(story.car.position)
 if story.man.visible and view.has_point(story.man.position): draw_man(story.man)
 if story.mom.visible and view.has_point(story.mom.position): draw_mom(story.mom)
 if story.boy.visible and view.has_point(story.boy.position): draw_boy(story.boy)
 # After the transfer, the bag sits in front of Isaac instead of disappearing behind him.
 if story.man.visible and story.man.pose=="bag" and view.has_point(story.man.position):
  duffel(story.man.position+Vector2(-13*story.man.facing,-27))
 ink=self

# The same authored poses are used throughout the walk, clues and handoff.
func draw_man(m):
 person_sprite("man",m)
 if m.pose=="hold":
  var a=m.position+Vector2(10,-58)
  var b=story.mom.position+Vector2(4,-56)
  # Sleeve texture follows the existing shoulder-to-shoulder connection.
  ink.draw_set_transform(a.round()-camera,(b-a).angle()-PI/2)
  sprite("sleeve-warm",Vector2(-3,0),Vector2(6,a.distance_to(b)))
  ink.draw_set_transform(-camera)
  sprite("hand",b-Vector2(2,0))
 if m.pose=="coffees":
  for x in [-7,12]:
   var steam=m.position+Vector2(x*m.facing,-50)
   line(steam,steam+Vector2(sin(clock*2+x),-4),Color(.92,.9,.82,.35),1)

func draw_mom(m): person_sprite("mom",m)

func draw_boy(b):
 person_sprite("boy",b)
 if b.bag:
  var offset=Vector2(b.facing*16 if b.pose=="give" else -b.facing*10,-26 if b.pose=="give" else -18)
  duffel(b.position+offset)

func duffel(at): sprite("duffel",at+Vector2(-10,-6))

func draw_car(at):
 at=at.round()
 sprite("headlights",at+Vector2(78,-29))
 sprite("car",at+Vector2(0,-30))
 if story.in_car: sprite("rear-face",at+Vector2(23,-27))

func draw_hound(e,origin):
 if not e.get("brute",false):
  super.draw_hound(e,origin)
  return
 # Same 24 x 16 visible envelope as the enemy. Only its costume changes.
 var pose="hurt" if e.flash>0 else "tell" if e.state=="tell" else "attack" if e.state=="attack" else "idle"
 var at=origin+Vector2(e.x,e.y)
 ink.draw_set_transform(at-camera+Vector2(e.w if e.face<0 else 0,0),0,Vector2(e.face,1))
 sprite("brute-"+pose,Vector2.ZERO)
 for i in range(e.get("cracks",0)):
  line(Vector2(5+i*5,7),Vector2(7+i*5,11),"#d4ba8c",1)
 ink.draw_set_transform(-camera)
 if e.state=="tell":
  box(at.x+11,at.y-6,1,3,"#f4d390")
  box(at.x+11,at.y-2,1,1,"#f4d390")

# Small dressings attach to the existing top surfaces; the tile atlas stays intact.
func draw_bridge_details(surface):
 var n=hash_at(int(surface.x),int(surface.y),37)
 if n%7==0: sprite("rivets",surface+Vector2(0,1))
 if n%19==0: sprite("gravel",surface+Vector2(0,-3))
 if n%101==0: sprite("bottle-cap",surface+Vector2(1,-4))
 # Chains hang only into open space below a ledge, never across the play surface.
 var cell=Vector2i(floori(surface.x/8),floori(surface.y/8))
 if n%61==0 and runtime!=null:
  var clear=true
  for y in range(1,6):
   if runtime.cells.get(cell+Vector2i(0,y),0)!=0: clear=false
  if clear: sprite("chain",surface+Vector2(0,8))

# ---------------------------------------------------------------- in front
func draw_front():
 draw_play_plane()
 if story==null or sim==null: return
 ink=front
 front.draw_set_transform(Vector2.ZERO)
 if not story.badge.taken:
  var d=story.badge.at-camera
  if Rect2(-20,-20,360,224).has_point(d): id_card(d+Vector2(-6,-5+sin(clock*2)*1.2))
 if riding and story.ride!=null:
  # Headlights carry Felix between rooms, using the original ride state and clock.
  var top=actor-camera
  sprite("light-shaft",top+Vector2(-8,-190),Vector2(26,202),Color(1,1,1,.9))
 ink=self

func id_card(at): sprite("id-card",at)

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
  sprite("folded",actor+Vector2(9,3))

# A dark hood over his light and a mask across his eyes.
func mask(center,facing):
 sprite("hood",center+Vector2(-5,-8))
 sprite("mask",center+Vector2(-4,-2))
 ink.draw_set_transform(center-camera,0,Vector2(-facing,1))
 sprite("tie",Vector2(3,-1+round(sin(clock*6))))
 ink.draw_set_transform(-camera)

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
 ink.draw_set_transform(hand-camera,aim.angle())
 sprite("dagger",Vector2(-2,-2))
 ink.draw_set_transform(-camera)

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

# Chapter Three foreground copy: preserve the engine loops and their draw order.
func draw_play_plane():
 if sim==null: return
 var profile_start=Time.get_ticks_usec()
 ink = front
 paint_transform=Transform2D(0,-camera)
 ink.draw_set_transform_matrix(paint_transform)
 var view = Rect2(camera-Vector2(20,35),Vector2(360,235))
 for surface in surfaces:
  if not view.has_point(surface): continue
  Art.grass(self,surface)
  draw_bridge_details(surface)
 if runtime!=null and sim.world_context!=null and runtime.data.has("whiteFlowers"):
  for patch in runtime.data.whiteFlowers.patches:
   var at=runtime.placements[patch.room]+Vector2(patch.x,patch.y)
   if not view.has_point(at): continue
   var previous=ink_color
   ink_color*=Color(patch.get("tint","ffffffff"))
   for i in range(max(1,ceili(float(patch.w)/2.6))):
    var top=at+Vector2(1+i*2.6,1+sin(clock*1.5+i)*.25)
    Styles.line(self,at+Vector2(1+i*2.6,patch.h),top,"#839b83",.5)
    Styles.oval(self,top,Vector2(1.5,.9),"#fffbee","#cdd8c7",.12)
    circle(top,.3,"#d0c397")
   ink_color=previous
 if Rect2(camera,Vector2(320,184)).grow(40).has_point(LOT+Vector2(128,248)):
  sprite("parking-stripe",LOT+Vector2(130,247))
  sprite("parking-stripe",LOT+Vector2(178,247))
 for item in decorations:
  var point = item.origin+Vector2(item.d.c*8,item.d.r*8+8)
  if view.has_point(point) and (item.d.k not in ["trumpets","fern"] or Art.flora_safe(self,point)): draw_prop(item.d.k,point,item.d)
 for point in fires:
  if view.has_point(point): draw_fire(point)
 for item in people:
  var point = item.origin+Vector2(item.d.c*8,item.d.r*8+8)
  if view.has_point(point): draw_person(item.d,point,item.room==sim.room.id)
 # Every room's actual state is visible before entry and retained after departure.
 var scenes=runtime.cores.values() if runtime!=null else [sim]
 for scene in scenes:
  var origin=scene.world_origin if runtime!=null else active_position
  if not Rect2(origin,Vector2(scene.room.w,scene.room.h)).intersects(view): continue
  if world_data.world.has("campaignWorkshop") and scene.room.id==world_data.world.campaignWorkshop.entry:
   var door=origin+Vector2(scene.room.spawn.x+scene.p.w/2.0,scene.room.spawn.y+scene.p.h)
   line(door+Vector2(-10,0),door+Vector2(-10,-25),"#87c9dc",2)
   line(door+Vector2(10,0),door+Vector2(10,-25),"#87c9dc",2)
   line(door+Vector2(-10,-25),door+Vector2(10,-25),"#87c9dc",2)
   line(door+Vector2(0,-13),door+Vector2(0,-20),"#d4f2f7",1)
   line(door+Vector2(0,-20),door+Vector2(-3,-17),"#d4f2f7",1)
   line(door+Vector2(0,-20),door+Vector2(3,-17),"#d4f2f7",1)
  if scene.room.def.has("workshopGoal"):
   var goal=scene.room.def.workshopGoal
   var flag=origin+Vector2(goal[0]+goal[2]/2.0,goal[1])
   # A sodium streetlight marks exactly the same workshop goal rectangle.
   sprite("streetlamp",flag+Vector2(-4,-124))
   sprite("light-shaft",flag+Vector2(-goal[2]/2.0-6,-115),Vector2(goal[2]+12,115),Color(1,1,1,.65))
   sprite("light-pool",flag+Vector2(-goal[2]/2.0-6,-4),Vector2(goal[2]+12,9))
  for r in range(max(0,floori((view.position.y-origin.y)/8)),min(int(scene.room.rows),ceili((view.end.y-origin.y)/8))):
   for c in range(max(0,floori((view.position.x-origin.x)/8)),min(int(scene.room.cols),ceili((view.end.x-origin.x)/8))):
    var t=scene.room.grid[r*int(scene.room.cols)+c]
    var glyph=scene.room.def.map[r][c]
    if glyph in ["-","(",")"]:
     var rail=origin+Vector2(c*8,(int(scene.room.rows)-1-r if scene.flipped else r)*8)
     box(rail.x,rail.y,8,2,"#debe82" if glyph!= "-" else "#a9b2be")
     box(rail.x+2,rail.y+3,3,4,"#585b68")
     if glyph!= "-": line(rail+Vector2(2,3),rail+Vector2(6,5),"#efac69",1)
    if glyph=="%":
     var surface=origin+Vector2(c*8,(int(scene.room.rows)-1-r if scene.flipped else r)*8)
     box(surface.x,surface.y,8,8,"#c8c8cc")
     box(surface.x+1,surface.y+1,6,1,"#edf0ed")
     line(surface+Vector2(2,3),surface+Vector2(6,6),"#9d95ad",.8)
    if t>=3:
     if scene.flipped: t=4 if t==3 else (3 if t==4 else t)
     draw_hazard(t,origin+Vector2(c*8,(int(scene.room.rows)-1-r if scene.flipped else r)*8))
  for e in scene.ents:
   var painted=e
   if scene.flipped:
    painted=e.duplicate(true)
    scene.GravityDevice.mirror_body(painted,scene.room.h)
    if e.type=="zipline":
     painted.ay=scene.room.h-e.ay
     painted.by=scene.room.h-e.by
   if Rect2(origin+Vector2(painted.x,painted.y),Vector2(painted.w,painted.h)).grow(18).intersects(view): draw_entity(painted,origin)
  draw_region_devices(scene,origin,view)
  for wave in scene.brute_waves:
   var point=origin+Vector2(wave.x,wave.y)
   if view.has_point(point):
    for k in range(4): box(point.x-1+k,point.y-2-k%2*3,1,2+k%2*3,"#d6ad76")
  for enemy in scene.combat.get("enemies",[]):
   if not enemy.get("dead",false) and view.has_point(origin+Vector2(enemy.x,enemy.y)): draw_hound(enemy,origin)
  for e in scene.sweepers:
   var point=origin+Vector2(e.x,e.y)
   Art.dust_bunny(self,e,origin)
 for trail in trails:
  var alpha = trail.life/trail.max*(.15 if reduced_motion else .48)
  var col=Color(trail.color,alpha)
  box(trail.p.x+1,trail.p.y+1,6,9,col)
  if not reduced_motion:
   line(trail.p+Vector2(4,5),trail.p+Vector2(4,5)-trail.dir*12,Color(trail.color,alpha*.55),2)
 for part in particles:
  var col = part.color
  col.a = clamp(part.life/part.max,0,1)*0.8
  if part.get("spark",false):
   circle(part.p,1.8,Color(accent,col.a*.12))
   line(part.p,part.p-part.v.normalized()*4,col,1)
   box(part.p.x,part.p.y,1,1,Color(1,.95,.82,col.a))
  elif part.get("dust",false):
   circle(part.p,1.2,Color(col,col.a*.35))
   box(part.p.x,part.p.y,1,1,col)
  else: box(part.p.x,part.p.y,1,1,col)
 draw_feel_world()
 if runtime!=null:
  if int(world_data.world.n)==2: draw_elsie_quest()
  if causeway and int(world_data.world.n)==3: draw_silas_quest()
  draw_world_hearts()
 if sim.p.state!="dead":
  if sim.flipped: ink.draw_set_transform(Vector2(-camera.x,-camera.y+actor.y*2+sim.p.h),0,Vector2(1,-1))
  draw_knight()
  if sim.flipped: ink.draw_set_transform(-camera)
 ink.draw_set_transform(Vector2.ZERO)
 draw_award_screen()
 if flash>0 and not reduced_motion: box(0,0,320,184,Color(0.92,0.85,0.65,flash*0.7))
 if fade>0: box(0,0,320,184,Color(0.03,0.05,0.08,fade*2.5))
 draw_cpu_us.foreground=Time.get_ticks_usec()-profile_start
