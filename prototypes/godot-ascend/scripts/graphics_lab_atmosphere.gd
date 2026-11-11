extends Node2D
## Scenery is screen-sized and stays below solid tiles, devices and story actors.
const HAZE=[Color("#6379a0"),Color("#c69769"),Color("#6e8464"),Color("#738db7"),Color("#6379a0"),Color("#6379a0")]
const MOTES=[Color("#f2a66c"),Color("#f2ca94"),Color("#b9d57a"),Color("#a5bbdd"),Color("#f2a66c"),Color("#f2a66c")]
var style=0 # Bladefall, bedroom, Felix Woods, Felix Causeway, Bladefall Woods, Bladefall Causeway
var scenery=0
var accents=false
var speed=2
var weather=0
var palette=0
var backdrop_strength=1.0
var weather_strength=1.0
var density=1
var parallax=true
var age=0.0
var previous_clock=-1.0
var offset=0.0
var motion=true

func configure(region,backdrop,show_accents,motion_speed,weather_kind,backdrop_gain=1.0,weather_gain=1.0,weather_density=1,camera_motion=true,scenery_palette=0):
 style=region
 scenery=backdrop
 accents=show_accents
 speed=motion_speed
 weather=weather_kind
 backdrop_strength=backdrop_gain
 weather_strength=weather_gain
 density=weather_density
 parallax=camera_motion
 palette=scenery_palette
 queue_redraw()

func update_sample(world_clock,camera_x,reduced):
 var moving=not reduced and speed>0
 var rate=0.35 if speed==1 else 1.0
 var initial=previous_clock<0.0
 var elapsed=clampf(world_clock-previous_clock,0.0,0.1) if not initial else 0.0
 previous_clock=world_clock
 # Changing speed preserves the phase of the weather already in flight.
 var next_age=age+elapsed*rate if moving and accents else age
 var next_offset=offset
 if moving and parallax:
  var target=camera_x*rate
  next_offset=target if initial else lerpf(offset,target,1.0-exp(-elapsed*6.0))
 if next_age==age and next_offset==offset and motion==moving: return
 age=next_age
 offset=next_offset
 motion=moving
 queue_redraw()

func _draw():
 if scenery!=0 and backdrop_strength>0.0: draw_scenery()
 if not accents or weather_strength<=0.0: return
 var haze=tinted(HAZE[style])
 var mote=tinted(MOTES[style])
 for band in range(12):
  var t=(band+1)/12.0
  draw_rect(Rect2(0,100+band*7,320,7),Color(haze,t*t*.13*weather_strength))
 if not motion: return
 if weather in [3,4]:
  draw_seasonal_weather()
 elif weather==1:
  for i in range([12,32,48][density]):
   var x=fposmod(i*81.17-age*21.0-offset*.12,320.0)
   var y=fposmod(i*51.03+age*(58.0+i%4*5.0),177.0)
   draw_line(Vector2(floor(x),floor(y)),Vector2(floor(x)-2,floor(y)+6),Color(tinted(Color("#9fb8da")),.30*weather_strength))
 else:
  for i in range([10,26 if style!=3 else 16,40][density]):
   var x=fposmod(i*127.31+age*(4.0+i%4)-offset*.12,320.0)
   var y=fposmod(i*41.79-age*(1.0+i%3),177.0)
   var pulse=(.20+.14*sin(i*1.7+age*1.3))*weather_strength
   var at=Vector2(floor(x),floor(y))
   if weather==2:
    draw_rect(Rect2(at-Vector2(1,0),Vector2(3,1)),Color(mote,pulse*.65))
    draw_rect(Rect2(at-Vector2(0,1),Vector2(1,3)),Color(mote,pulse))
   else: draw_rect(Rect2(at,Vector2(2 if i%5==0 else 1,1)),Color(mote,pulse))

func tinted(color):
 if palette==0: return color
 var scale=Vector3(1.22,.97,.68) if palette==1 else Vector3(.78,1.02,1.22)
 return Color(minf(1.0,color.r*scale.x),minf(1.0,color.g*scale.y),minf(1.0,color.b*scale.z),color.a)

func draw_seasonal_weather():
 var leaves=weather==4
 var count=[6,12,20][density] if leaves else [12,26,42][density]
 for i in range(count):
  var drift=sin(age*(.7+i%3*.1)+i*2.17)
  var x=fposmod(i*71.31+age*(2.0+i%3)+drift*(7 if leaves else 4)-offset*.10,320.0)
  var y=fposmod(i*47.23+age*(9.0+i%4*3.0),177.0)
  var at=Vector2(floor(x),floor(y))
  if leaves:
   var color=Color("#c78548") if i%3==0 else (Color("#d9b76a") if i%3==1 else Color("#9a704f"))
   color.a=(.40+i%3*.10)*weather_strength
   draw_set_transform(at,drift*.8)
   draw_colored_polygon(PackedVector2Array([Vector2(-3,0),Vector2(0,-2),Vector2(3,0),Vector2(0,2)]),color)
   draw_line(Vector2(-2,0),Vector2(2,0),Color("#f1d69d",.30*weather_strength))
   draw_set_transform(Vector2.ZERO)
  else:
   var color=Color("#d2e4ed",(.30+i%3*.12)*weather_strength)
   draw_rect(Rect2(at,Vector2(2 if i%4==0 else 1,2 if i%4==0 else 1)),color)
   if i%4==0: draw_rect(Rect2(at-Vector2.ONE,Vector2(4,4)),Color(color,.055*weather_strength))

func draw_scenery():
 var night=scenery==2
 var upper=Color("#1c2a57",.45) if night else Color(tinted(HAZE[style]),.31)
 var lower=Color("#25334d",.7) if night else Color(tinted(HAZE[style]).darkened(.48),.62)
 upper=tinted(upper) if night else upper
 lower=tinted(lower) if night else lower
 upper.a*=backdrop_strength
 lower.a*=backdrop_strength
 for i in range(9):
  var fraction=i/8.0
  draw_rect(Rect2(0,i*21,320,21),upper.lerp(lower,fraction))
 if style==1:
  draw_wallpaper(night)
  return
 # Keep the authored sun/moon: another disc can collide with the original sky.
 if style in [3,5]:
  draw_shore(lower)
 elif style in [2,4]:
  draw_tree_bands(lower)
 else:
  draw_ridges(lower)

func draw_wallpaper(night):
 var paper=Color("#829bc8",.17) if night else Color("#efd4a4",.20)
 paper=tinted(paper)
 paper.a*=backdrop_strength
 var shift=floor(fposmod(offset*.08,16))
 for x in range(-16,336,16):
  var edge=x-shift
  draw_rect(Rect2(edge,0,2,152),paper)
  for y in range(16,151,24):
   var center=Vector2(edge+8,y)
   draw_colored_polygon(PackedVector2Array([center+Vector2(0,-3),center+Vector2(3,0),center+Vector2(0,3),center+Vector2(-3,0)]),paper)
 draw_rect(Rect2(0,147,320,3),Color(paper,.30*backdrop_strength))
 draw_rect(Rect2(0,151,320,33),Color("#2d2937",.32*backdrop_strength))

func draw_tree_bands(base):
 for layer in range(2):
  var spacing=29+layer*12
  var shift=floor(fposmod(offset*(.05+layer*.08),spacing))
  var tone=Color(base.darkened(layer*.21),(.51+layer*.14)*backdrop_strength)
  for i in range(-1,13):
   var x=i*spacing-shift
   var peak=67+layer*25+posmod(i*23,31)
   draw_rect(Rect2(x-1,peak,3+layer,184-peak),tone)
   draw_colored_polygon(PackedVector2Array([Vector2(x,peak-24),Vector2(x-13-layer*4,peak+38),Vector2(x+14+layer*4,peak+38)]),tone)

func draw_shore(base):
 var shore=Color(base.darkened(.3),.58*backdrop_strength)
 draw_rect(Rect2(0,122,320,62),shore)
 for i in range(14):
  var x=fposmod(i*79.0-offset*.13,320.0)
  var y=127+posmod(i*19,51)
  draw_rect(Rect2(floor(x),y,12+i%4*6,1),Color(tinted(Color("#9cb3cd")),.22*backdrop_strength))
 var shift=floor(fposmod(offset*.08,72))
 for i in range(-1,6):
  var x=i*72+posmod(i*13,11)-shift
  var tip=103+posmod(i*19,15)
  # Rounded-off silhouettes read as distant posts rather than landing ledges.
  draw_colored_polygon(PackedVector2Array([Vector2(x,tip),Vector2(x+2,tip-3),Vector2(x+4,tip+1),Vector2(x+5,154),Vector2(x-1,154)]),Color(shore.darkened(.24),.46*backdrop_strength))

func draw_ridges(base):
 for layer in range(2):
  var shift=floor(fposmod(offset*(.05+layer*.07),64))
  var points=PackedVector2Array([Vector2(-64,184)])
  for i in range(8):
   points.append(Vector2(i*64-shift-32,100+layer*25+posmod(i*29,34)))
  points.append(Vector2(416,184))
  draw_colored_polygon(points,Color(base.darkened(.13+layer*.15),.63*backdrop_strength))
