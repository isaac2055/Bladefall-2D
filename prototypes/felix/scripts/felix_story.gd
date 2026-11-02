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
const LATE=["cl1-o1-muster","cl1-o1-yard",GATE,CURTAIN]
const PILLOW=Vector2(1490,-64)

var phase="black"        # black, play, ending, end
var gifts={"legs":false,"cape":false,"arms":false,"face":false}
var boy={"visible":true,"position":Vector2(104,144),"pose":"crying","facing":-1,"prop":"","asleep":false,"target":null,"speed":0.0,"then":""}
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
var end_time=0.0
var deaths_at_end=0
var crayons=0
var travel=""
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

func blocking(): return freeze>0 or phase in ["black","ending","end"]

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
 # The first drawing, hidden above the desk.
 if room==SECRET and not drawing.taken and felix.distance_to(drawing.at)<10:
  drawing.taken=true
  pulse_request=1.0
  show_hint("found: the first drawing of you",4.0)
 # Past the curtain room's last flap: up into the top of the wardrobe.
 if room==CURTAIN and sim.p.onGround and sim.p.x<64 and sim.p.y<48 and travel=="":
  travel=wardrobe_rooms[0]
 # Each wardrobe room ends at a drawing; the last one leads out to the windowsill.
 var index=wardrobe_rooms.find(room)
 if index>=0 and travel=="" and preload("res://scripts/campaign_workshop.gd").goal_reached(sim):
  world.campaign_completed[room]=true
  pulse_request=.8
  travel=wardrobe_rooms[index+1] if index+1<wardrobe_rooms.size() else SILL
 if index==0 and not done.has("wardrobe"):
  done.wardrobe=true
  show_hint("the top of the wardrobe",3.5)
 if index>=0 and not done.has("objective:"+room):
  done["objective:"+room]=true
  if sim.room.def.get("workshopRequireAllShards",false): show_hint("bring both crayons back to the drawing",4.5)
  elif sim.room.def.get("workshopRequireShard",false): show_hint("bring the crayon back to the drawing",4.5)
 # The first slime puddle teaches itself.
 if sim.p.get("pollen",0)>0 and gifts.legs and not done.has("slime"):
  done.slime=true
  say("eww, SLIME!","boy" if boy.pose!="bed" and boy.visible else "above",2.2)
 if room==SILL and sim.p.onGround and not done.has("ending"):
  begin_ending(world,sim)

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
 end_time=0.0
 deaths_at_end=sim.deaths
 for core in world.cores.values():
  for e in core.ents:
   if e.type=="shard" and e.get("gone",false) and core.room.def.has("bearing"): crayons+=1

func tick_ending(delta):
 end_time+=delta
 dark_target=0.0
 if end_time>1.2 and not done.has("whisper"):
  done.whisper=true
  say("...Felix.","below",4.2)
 if end_time>3.0 and not gifts.face:
  gifts.face=true
  pulse_request=1.4
 if end_time>7.5: phase="end"

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

func moon_strength():
 if room in [CURTAIN,SILL]: return 1.3 if phase=="play" else 2.0
 return .5

func dark_amount(): return dark

func items(): return [drawing]
