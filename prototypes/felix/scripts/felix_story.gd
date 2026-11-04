extends RefCounted
## Night One. A scared five-year-old in a new house imagines a light, then gives it
## legs, a cape and arms at the moment it needs them. At the window, half asleep,
## he gives it a name.

const ROAD="cl1-o1-road"
const VERGE="cl1-o1-verge"
const FLOWERS="cl1-o1-flowers"
const UNDER_BED="cl1-bank-b21"
const CAMP="cl1-o1-camp"
const GATE="cl1-o1-gate"
const CURTAIN="cl1-bank-b62"
const SILL="cl1-atlas-crossroads"
const SECRET="cl1-secret-r2"
const WARDROBE="campaignWorkshop"
const STAIR="godot-overlook-stair"
const LATE=["cl1-o1-muster","cl1-o1-yard",GATE,CURTAIN]
const PILLOW=Vector2(1490,-64)

var phase="black"        # black, play, ending, end
var gifts={"legs":false,"cape":false,"arms":false,"face":false}
var boy={"hidden":false,"visible":true,"position":Vector2(104,144),"pose":"crying","facing":-1,"prop":"","asleep":false,"target":null,"speed":0.0,"then":""}
var lines=[]              # {text, anchor, at, life, max}
var hint={"text":"","life":0.0}
var freeze=0
var cue=[]                # timed steps while frozen: [frame, callable]
var cue_clock=0
var done={}
var clock=0.0
var room=""
var felix=Vector2.ZERO
var moved_frames=0
var dark_target=0.0
var dark=0.0
var drawing={"kind":"drawing","at":Vector2.ZERO,"taken":false}
var pulse_request=0.0
var door_slam=false
var end_time=0.0
var deaths_at_end=0
var crayons=0
var photos=[]           # wardrobe rooms whose photo Felix brought up, in order
var ride=null           # the basket lifting Felix out of a finished wardrobe room
var wardrobe_rooms=[]

func _init(world):
 wardrobe_rooms=world.data.world.campaignWorkshop.rooms
 var origin=world.placements.get(SECRET,Vector2.ZERO)
 drawing.at=origin+Vector2(24*8+4,3*8+4)

func skip_prologue():
 phase="play"
 for key in ["legs","cape","arms"]: gifts[key]=true
 for key in ["spark","noticed","legs","cape","arms","bedtime"]: done[key]=true
 boy.pose="bed"
 boy.asleep=true
 boy.position=PILLOW

func blocking(): return freeze>0 or ride!=null or phase in ["black","ending","end"]

func say(text_value,anchor="boy",seconds=2.6):
 # One voice at a time: a new line replaces whatever was still showing or waiting.
 lines.clear()
 lines.append({"text":text_value,"anchor":anchor,"life":seconds,"max":seconds})

func show_hint(text_value,seconds=4.5):
 hint.text=text_value
 hint.life=seconds

func start():
 if phase!="black": return
 phase="play"
 done.spark=true
 pulse_request=1.0
 done.notice_at=clock+1.2

# A gift stops the world for a breath: the boy says it, then it is so.
func gift(name,before,after,hint_text):
 done[name]=true
 freeze=150
 cue_clock=0
 say(before,"boy",2.2)
 cue=[[70,func():
   gifts[name]=true
   pulse_request=1.0
   say(after,"boy",1.8)],
  [150,func(): show_hint(hint_text)]]

func tick(world,sim,delta):
 clock+=delta
 room=world.active_id
 felix=world.position()
 for line in lines:
  if line.get("delay",0)>0: line.delay-=delta
  else: line.life-=delta
 lines=lines.filter(func(l):return l.life>0)
 hint.life=max(0,hint.life-delta)
 dark=lerp(dark,dark_target,1-exp(-delta*.8))
 tick_boy(delta)
 if freeze>0:
  freeze-=1
  cue_clock+=1
  while not cue.is_empty() and cue_clock>=cue[0][0]: cue.pop_front()[1].call()
  return
 if phase=="ending":
  tick_ending(delta)
  return
 if phase!="play": return
 if abs(sim.p.vx)>5: moved_frames+=1
 # The floor, the first night.
 if room==ROAD:
  if not done.has("noticed") and clock>=done.get("notice_at",INF):
   done.noticed=true
   boy.pose="looking"
   say("...oh!","boy",1.6)
   lines.append({"text":"hi.","anchor":"boy","life":3.0,"max":3.0,"delay":1.7})
  if not gifts.legs and not done.has("legs") and felix.x>=66:
   boy.pose="looking"
   gift("legs","wait — you need LEGS.","there!","SPACE   jump")
   cue.append([150,func():
     boy.pose="run"
     boy.facing=1
     walk_boy(Vector2(586,144),"kneel")
     say("come on!","boy",1.6)])
 if room==VERGE and gifts.legs and not done.has("cape") and felix.x>=462:
  gift("cape","heroes need a cape.","now FLY!","D + ARROWS   dash")
  cue[0][1]=func():
   gifts.cape=true
   pulse_request=1.0
   boy.prop=""
   say("now FLY!","boy",1.8)
  cue.append([150,func():
    boy.pose="run"
    walk_boy(Vector2(704,144),"point")])
 if room==FLOWERS and gifts.cape and not done.has("arms") and felix.x>=730:
  gift("arms","it's too tall... you need ARMS!","hold on tight!","HOLD A   cling and climb")
  cue.append([150,func():
    say("I'm going to bed. you check under it, ok?","boy",3.2)
    boy.pose="run"
    walk_boy(Vector2(1010,144),"bed")])
 if room==UNDER_BED and not done.has("under"):
  done.under=true
  say("is anything under there?","above",3.0)
 if room==CAMP and not done.has("bedtime"):
  done.bedtime=true
  say("...is it safe?","bed",2.4)
  lines.append({"text":"ok. goodnight, light.","anchor":"bed","life":5.0,"max":5.0,"delay":2.6})
 if done.has("bedtime") and not boy.asleep and done.has("bedtime_clock"):
  if clock>done.bedtime_clock: boy.asleep=true
 elif done.has("bedtime") and not done.has("bedtime_clock"): done.bedtime_clock=clock+8.0
 if room=="cl1-o1-yard" and not done.has("mumble"):
  done.mumble=true
  say("...mm... too dark...","below",3.4)
 # The dark climbs as the night goes on; the nightlight pushes it back.
 dark_target=0.0
 if room in ["cl1-o1-cracked","cl1-bank-b22","cl1-o1-mile"]: dark_target=.25
 if room in LATE: dark_target=.5
 if room==GATE: dark_target=.7
 if room==CURTAIN: dark_target=.85
 if room==GATE or room==CURTAIN:
  for core in [world.cores[GATE]]:
   for e in core.ents:
    if e.type=="plate" and e.get("down",false): dark_target=min(dark_target,.3)
 # The turn: at the top of the stair, the parents through the floor. The boy hides under
 # the quilt, and Felix goes after the good days packed away in the wardrobe boxes.
 if room==STAIR and not done.has("fight"):
  done.fight=true
  boy.asleep=false
  boy.hidden=false
  freeze=620
  cue_clock=0
  say("...you said you'd be here by six—","below",2.6)
  cue=[[160,func(): say("...not tonight. not in front of him.","below",2.6)],
   [320,func(): say("then when? it's always 'not tonight'—","below",2.4)],
   [450,func():
     door_slam=true
     dark=1.0
     boy.hidden=true
     say("(a door closes)","below",2.0)],
   [540,func():
     say("...","bed",1.6)
     pulse_request=1.0],
   [620,func(): show_hint("the good days are packed in the boxes up here",5.0)]]
 if done.has("fight") and wardrobe_rooms.find(room)>=0: dark_target=.55
 # The first drawing, hidden above the desk.
 if room==SECRET and not drawing.taken and felix.distance_to(drawing.at)<10:
  drawing.taken=true
  pulse_request=1.0
  show_hint("found: the first drawing of you",4.0)
 # Each wardrobe room ends at a drawing on a string: the basket lifts Felix out to the walkway.
 var index=wardrobe_rooms.find(room)
 if index>=0 and ride==null and preload("res://scripts/campaign_workshop.gd").goal_reached(sim):
  world.campaign_completed[room]=true
  pulse_request=.8
  if not room in photos: photos.append(room)
  var landing=world.wardrobe_landing[room]
  var spawn=world.parsed[landing].spawn
  ride={"room":room,"landing":landing,"from":felix,"to":world.placements[landing]+Vector2(spawn.x,spawn.y),"t":0.0,"photo":index}
 if index>=0 and not done.has("objective:"+room):
  done["objective:"+room]=true
  if sim.room.def.get("workshopRequireAllShards",false): show_hint("find both torn pieces, then bring them to the photo",4.5)
  elif sim.room.def.get("workshopRequireShard",false): show_hint("find the torn corner, then bring it to the photo",4.5)
 # The first slime puddle teaches itself.
 if sim.p.get("pollen",0)>0 and gifts.legs and not done.has("slime"):
  done.slime=true
  say("eww, SLIME!","boy" if boy.pose!="bed" and boy.visible else "above",2.2)
 if room==SILL and sim.p.onGround and not done.has("ending"):
  begin_ending(world,sim)

# Up the string to the walkway, then along it to the next stretch. Returns Felix's
# top-left in world pixels, or null once the ride is over.
func ride_point(delta):
 ride.t+=delta
 var top=Vector2(ride.from.x,ride.to.y)
 var rise=max(1.0,(ride.from.y-top.y)/90.0)
 var across=max(.4,abs(ride.to.x-top.x)/140.0)
 if ride.t<.35: return ride.from
 var t=ride.t-.35
 if t<rise: return ride.from.lerp(top,ease(t/rise,-1.6))
 t-=rise
 if t<across: return top.lerp(ride.to,ease(t/across,-1.6))
 return null

func walk_boy(target,then):
 boy.target=target
 boy.speed=95.0
 boy.then=then

func tick_boy(delta):
 if boy.target==null: return
 var to=boy.target-boy.position
 boy.facing=1 if to.x>0 else -1
 if to.length()<=boy.speed*delta:
  boy.position=boy.target
  boy.target=null
  boy.pose=boy.then
  if boy.then=="kneel":
   boy.facing=-1
   boy.prop="sock"
  elif boy.then=="bed":
   boy.position=PILLOW
  return
 boy.position+=to.normalized()*boy.speed*delta

func begin_ending(world,sim):
 done.ending=true
 phase="ending"
 boy.hidden=false
 boy.asleep=true
 end_time=0.0
 deaths_at_end=sim.deaths
 for core in world.cores.values():
  for e in core.ents:
   if e.type=="shard" and e.get("gone",false) and core.room.def.has("bearing"): crayons+=1

func tick_ending(delta):
 end_time+=delta
 dark_target=0.0
 if end_time>1.2 and not done.has("naming"):
  done.naming=true
  say("I think I'll name you...","below",2.8)
 if end_time>4.0 and not done.has("whisper"):
  done.whisper=true
  say("...Felix.","below",4.2)
 if end_time>5.8 and not gifts.face:
  gifts.face=true
  pulse_request=1.4
 if end_time>10.0: phase="end"

func felix_radius():
 if phase=="black": return .15
 if not gifts.legs: return .55
 if phase in ["ending","end"]: return 1.6
 return 1.25

func ambient():
 if phase=="black": return Color(0,0,0)
 var night=Color(.5,.52,.68)
 if not gifts.legs: night=Color(.12,.12,.18)
 night=night.lerp(Color(.3,.3,.44),dark)
 if phase in ["ending","end"]: night=night.lerp(Color(.62,.66,.86),clamp(end_time/3.0,0,1))
 return night

# Music: none until the boy stops crying, quieter after the fight, gone while it happens.
func music_level():
 if not gifts.legs: return -80.0
 if done.has("fight") and freeze>0 and room==STAIR: return -80.0
 if done.has("fight") and not phase in ["ending","end"]: return -20.0
 return -10.0

func moon_strength():
 if room in [CURTAIN,SILL]: return 1.3 if phase=="play" else 2.0
 return .5

func dark_amount(): return dark

func items(): return [drawing]
