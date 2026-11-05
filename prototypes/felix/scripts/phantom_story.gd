extends RefCounted
## Chapter Three, Phantom. Isaac is ten. Every other Friday he is handed over halfway, at the lot
## across the Causeway. This Friday the bridge is stuck, so Mom and her new friend walk him over to
## Dad's car. Knights are for little kids now: Felix becomes Phantom, a spy, and tails the big man
## across the Causeway to find out what he's hiding. Three clues, each one misread. At the lot,
## through the back window of Dad's car, the boy sees what the clues meant: Mom's smile drops the
## moment she thinks he's gone, and the man puts his arm around her. The boy keeps it to himself.
## The drive to Dad's is ten rooms of quiet back-seat thinking; on Sunday night he hands the man
## his bag.

const CAMP="cl3-c3-camp"
const BORROW="cl3-bank-b39"
const HOIST="cl3-c3-hoist"
const PATROL="cl3-c3-patrol"
const CHAIN="cl3-c3-chain"
const UPPER="cl3-c3-upper"
const RISE="cl3-c3-rise"
const WELL="cl3-c3-well"
const STAIR="cl3-bank-b11"
const ROAD="cl3-c3-road"
const GANTRY="cl3-c3-gantry"
const BRACE="cl3-c3-brace"
const BRUTE="cl3-bank-b68"
const LOT="cl3-atlas-crossroads"
const SECRET="cl3-secret-e2"
# How late it is: 0 Friday afternoon, 1 sunset at the lot.
const LATE={CAMP:0.0,BORROW:.05,HOIST:.1,PATROL:.18,CHAIN:.26,UPPER:.34,RISE:.42,WELL:.5,
 "cl3-walk-3-3":.55,STAIR:.6,"cl3-walk-4-16":.65,ROAD:.7,GANTRY:.78,BRACE:.85,BRUTE:.92,LOT:1.0}
# The drive to Dad's: one beat as Felix drops into each room and one at its light.
# [line, who, line, who]: "dad" is the front seat, "boy" the back, "note" Phantom's notebook.
const DRIVE=[
 ["so. how was the week, bud?","dad","...fine.","boy"],
 ["you hungry? we could get burgers.","dad","...yeah. okay.","boy"],
 ["CLUE 1: his phone keeps buzzing.","note","...it was her. calling him.","note"],
 ["you're quiet tonight.","dad","...just tired.","boy"],
 ["CLUE 2: he keeps looking back.","note","...not at me. at her.","note"],
 ["want the radio on?","dad","...sure.","boy"],
 ["CLUE 3: two coffees.","note","...one was for her.","note"],
 ["your mom doing okay?","dad","...yeah. she's okay.","boy"],
 ["and that guy? he alright?","dad","...yeah. he's alright.","boy"],
 ["almost there, bud.","dad","MISSION: case closed.","note"],
]

var phase="black"
var gifts={"legs":true,"cape":true,"arms":true,"face":true,"mask":false,"dagger":false,"counter":false}
# The people at the handoff. Positions are their feet, in world pixels.
var boy={"visible":true,"position":Vector2.ZERO,"pose":"stand","facing":1,"target":null,"speed":0.0,"then":"","bag":true}
var mom={"visible":true,"position":Vector2.ZERO,"pose":"stand","facing":1,"target":null,"speed":0.0,"then":""}
var man={"visible":true,"position":Vector2.ZERO,"pose":"stand","facing":1,"target":null,"speed":0.0,"then":"","lead":false,"bag":false,"soft":false}
var car={"visible":false,"position":Vector2.ZERO,"leaving":false,"speed":0.0,"dad":true}
var lines=[]
var hint={"text":"","life":0.0}
var freeze=0
var cue=[]
var cue_clock=0
var done={}
var clock=0.0
var room=""
var felix=Vector2.ZERO
var pulse_request=0.0
var door_slam=false
var cut=""
var late=0.0
var in_drive=false
var drive_done=false
var in_car=false         # Felix rides in the back seat: not drawn
var clues=[]
var end_time=0.0
var deaths_at_end=0
var ride=null
var tale_rooms=[]
var photos=[]            # the stretches of the drive Felix finished
var badge={"kind":"badge","at":Vector2.ZERO,"taken":false}
var world_ref=null
var snap_request=false

func _init(world):
 world_ref=world
 tale_rooms=world.data.world.campaignWorkshop.rooms
 # The top of the Glass Ladder, before its way out.
 badge.at=world.placements.get(SECRET,Vector2.ZERO)+Vector2(30*8,3*8+2)
 var camp=world.placements.get(CAMP,Vector2.ZERO)
 var start=camp+Vector2(world.parsed[CAMP].spawn.x,world.parsed[CAMP].spawn.y)
 place(world,boy,start.x+44,start.y+11,7)
 place(world,mom,start.x+78,start.y+11,9)
 place(world,man,start.x+108,start.y+11,10)
 boy.facing=-1
 mom.facing=-1
 man.facing=-1

func title(): return ["Chapter Three","the halfway point"]

func end_stats():
 return "%d %s   ·   %d of 3 clues   ·   %d of %d miles%s"%[deaths_at_end,"fall" if deaths_at_end==1 else "falls",clues.size(),photos.size(),tale_rooms.size(),"   ·   Phantom's ID card" if badge.taken else ""]

func skip_prologue():
 phase="play"
 gifts.mask=true
 gifts.dagger=true
 done.opening=true
 man.lead=true
 boy.visible=false
 mom.visible=false

func blocking(): return freeze>0 or ride!=null or phase in ["black","ending","end"]

# who: "boy" (or the radio, once he's behind), "mom", "man", "dad", "above", "below".
func say(text_value,anchor="boy",seconds=2.6):
 lines.clear()
 lines.append({"text":text_value,"anchor":anchor,"life":seconds,"max":seconds})

func radio(text_value,seconds=2.6):
 say("kssht— "+text_value,"below",seconds)

func show_hint(text_value,seconds=4.5):
 hint.text=text_value
 hint.life=seconds

# Where a speaker's words appear, in world pixels (felix_main asks).
func anchor_at(anchor):
 match anchor:
  "boy": return boy.position+Vector2(0,-62)
  "mom": return mom.position+Vector2(0,-74)
  "man": return man.position+Vector2(0,-84)
  "dad": return car.position+Vector2(20,-40)
 return null

func start():
 if phase!="black": return
 phase="play"
 pulse_request=1.0

func scene(frames,steps):
 freeze=frames
 cue_clock=0
 cue=steps

func tick(world,sim,delta):
 clock+=delta
 room=world.active_id
 felix=world.position()
 for line in lines:
  if line.get("delay",0)>0: line.delay-=delta
  else: line.life-=delta
 lines=lines.filter(func(l):return l.life>0)
 hint.life=max(0,hint.life-delta)
 late=lerp(late,1.0 if in_drive or drive_done else LATE.get(room,late),1-exp(-delta*.4))
 tick_people(world,delta)
 if car.leaving: car.position.x+=car.speed*delta
 if freeze>0:
  freeze-=1
  cue_clock+=1
  while not cue.is_empty() and cue_clock>=cue[0][0]: cue.pop_front()[1].call()
  return
 if phase=="ending":
  tick_ending(delta)
  return
 if phase!="play": return
 # The drive: Felix is out of the car and playing; Mom, the man and the boy stay at the lot.
 if room in tale_rooms or room.begins_with("story-walk-"):
  in_drive=true
  in_car=false
  man.lead=false
  man.visible=false
  mom.visible=false
  boy.visible=false
 var origin=world.placements.get(room,Vector2.ZERO)
 # The Causeway, tailing the target.
 if room==CAMP and not done.has("opening") and sim.p.onGround: opening()
 if room==BORROW and not done.has("status"):
  done.status=true
  radio("Phantom, come in. what's the target doing?")
 if room==HOIST and not done.has("fast"):
  done.fast=true
  radio("he's fast for a big guy.")
 if room==PATROL and not done.has("clue1") and felix.x>origin.x+12*8: clue(1,"phone","his phone. AGAIN.","CLUE 1: his phone keeps buzzing.")
 if room==CHAIN and not done.has("hurry"):
  done.hurry=true
  radio("mom says hurry up. dad's waiting.")
 if room==UPPER and not done.has("clue2") and felix.x>origin.x+10*8: clue(2,"back","he keeps looking BACK. he knows.","CLUE 2: he keeps looking back.")
 if room==RISE and not done.has("clue3") and felix.x>origin.x+12*8: clue(3,"coffees","TWO coffees?? who's the other one for?","CLUE 3: two coffees.")
 if room==WELL and not done.has("doing"):
  done.doing=true
  radio("you're doing great, Phantom.")
 if room==ROAD and not done.has("almost"):
  done.almost=true
  radio("I can see the lot. almost there.")
 if room==BRACE and not done.has("counter"):
  done.counter=true
  gifts.counter=true
  pulse_request=1.0
  radio("if something swings at you, F. spies dodge and hit back.",3.4)
  show_hint("F   counter",5.0)
 if room==BRUTE and not done.has("brute"):
  done.brute=true
  man.lead=false
  man.visible=false
  radio("PHANTOM. the target— he's HUGE.",2.6)
  lines.append({"text":"kssht— ...wait. is he CLEARING the road?","anchor":"below","life":2.8,"max":2.8,"delay":6.0})
 if room==LOT and not done.has("handoff") and not drive_done and sim.p.onGround and felix.x<origin.x+14*8: handoff(world)
 if room==SECRET and not badge.taken and felix.distance_to(badge.at)<14:
  badge.taken=true
  pulse_request=1.0
  show_hint("found: Phantom's ID card",4.0)
 # The drive. Over a room with no way to drop in, the headlights lower him to its start.
 if room.begins_with("story-walk-") and ride==null and sim.p.onGround:
  var next=int(room.trim_prefix("story-walk-"))
  if next<tale_rooms.size():
   var below=world.parsed[tale_rooms[next]]
   if below.def.has("lowerAt") and felix.x>=below.def.lowerAt*8-4:
    ride={"room":room,"landing":below.def.id,"from":felix,"to":world.placements[below.def.id]+Vector2(below.spawn.x,below.spawn.y),"t":0.0,"photo":-1,"lower":true}
 var index=tale_rooms.find(room)
 if index>=0:
  if not done.has("drive-in:"+room):
   done["drive-in:"+room]=true
   drive_line(DRIVE[index][0],DRIVE[index][1],4.0)
   if sim.room.def.get("workshopRequireAllShards",false): show_hint("find all three, then bring them to the light",4.5)
   elif sim.room.def.get("workshopRequireShard",false): show_hint("find the last piece, then bring it to the light",4.5)
  if ride==null and preload("res://scripts/campaign_workshop.gd").goal_reached(sim):
   world.campaign_completed[room]=true
   pulse_request=.8
   if not room in photos: photos.append(room)
   drive_line(DRIVE[index][2],DRIVE[index][3],3.4)
   var landing=world.wardrobe_landing[room]
   if landing=="":
    # Sunday night: back at the lot.
    drive_done=true
    ride={"room":room,"landing":LOT,"from":felix,"to":felix+Vector2(0,-150),"t":0.0,"photo":index}
   else:
    var spawn=world.parsed[landing].spawn
    ride={"room":room,"landing":landing,"from":felix,"to":world.placements[landing]+Vector2(spawn.x,spawn.y),"t":0.0,"photo":index}
 if drive_done and room==LOT and not done.has("ending"): begin_ending(world,sim)

func drive_line(text_value,who,seconds):
 match who:
  "dad": say(text_value,"above",seconds)
  "boy": say(text_value,"below",seconds)
  _: show_hint(text_value,seconds+1.0)

# At the camp, where the bridge is stuck: knights are for little kids now.
func opening():
 done.opening=true
 boy.facing=-1
 scene(900,[
  [1,func(): say("bridge is stuck again. we'll walk you over to dad's car.","mom",3.0)],
  [190,func(): say("psst. Felix.","boy",1.6)],
  [290,func(): say("knights are for little kids.","boy",2.2)],
  [420,func():
    gifts.mask=true
    pulse_request=1.2
    say("you're a spy now. codename... PHANTOM.","boy",2.8)],
  [600,func():
    gifts.dagger=true
    pulse_request=.8
    say("spies don't carry swords. they carry daggers.","boy",2.6)],
  [760,func():
    boy.pose="point"
    say("your target: the big guy. find out what he's hiding.","boy",3.0)],
  [900,func():
    boy.pose="stand"
    radio("I'll be on the radio.",2.0)
    show_hint("W   dagger        tail the target across the Causeway",5.0)
    man.facing=1
    man.lead=true]])

func clue(number,pose,said,note):
 done["clue%d"%number]=true
 clues.append(number)
 # He stops where the spy can see him.
 var spot=stand_spot(world_ref,felix.x+64,felix.y+11,11)
 if spot!=null:
  man.position=spot
  man.target=null
 man.pose=pose
 man.hold=3.5
 man.facing=-1 if pose=="back" else 1
 radio(said,2.8)
 show_hint(note,5.0)

# The lot at the far end of the Causeway. Dad's car is waiting. Then the back window.
func handoff(world):
 done.handoff=true
 var lot=world.placements[LOT]
 var floor_y=lot.y+34*8
 man.lead=false
 man.soft=true
 man.target=null
 man.visible=true
 mom.visible=true
 boy.visible=true
 man.pose="stand"
 man.position=Vector2(lot.x+9*8,floor_y)
 mom.position=Vector2(lot.x+12*8,floor_y)
 boy.position=Vector2(lot.x+5*8,floor_y)
 man.facing=1
 mom.facing=1
 boy.facing=1
 car.visible=true
 car.position=Vector2(lot.x+16*8,lot.y+31*8)
 scene(1400,[
  [1,func(): say("there's my guy!","dad",2.2)],
  [150,func():
    walk(boy,Vector2(lot.x+14*8,floor_y),"stand")
    say("see you sunday, sweetheart. love you.","mom",2.8)],
  [330,func(): say("...love you too.","boy",2.0)],
  [460,func():
    man.facing=1
    say("see ya, bud.","man",2.0)],
  [580,func(): say("...bye.","boy",1.6)],
  [680,func():
    boy.visible=false
    boy.bag=false
    in_car=true
    pulse_request=.4],
  [760,func():
    car.leaving=true
    car.speed=0.0],
  [770,func(): car.speed=40.0],
  [820,func(): car.speed=90.0],
  # Through the back window. Her smile drops the moment she thinks he's gone.
  [960,func(): mom.pose="wave"],
  [1080,func(): mom.pose="down"],
  [1200,func(): man.pose="hold"],
  [1400,func():
    car.leaving=false
    car.visible=false
    in_drive=true
    cut="story-walk-0"]])

func walk(who,target,then):
 who.target=target
 who.speed=60.0
 who.then=then
 who.pose="walk"

func tick_people(world,delta):
 if man.get("hold",0)>0:
  man.hold-=delta
  if man.hold<=0 and not man.soft: man.pose="stand"
 # The secret is Felix's alone.
 if man.lead: man.visible=room!=SECRET
 if man.lead and phase=="play" and freeze==0 and man.get("hold",0)<=0:
  var rect=world.rectangles.get(room,Rect2())
  var sim=world.active()
  if sim.p.onGround: man.ground=felix.y+11
  var ahead=clamp(felix.x+110,rect.position.x+20,rect.end.x-20)
  var to=stand_spot(world,ahead,man.get("ground",rect.end.y-40),11)
  if to!=null and (abs(to.x-man.position.x)>24 or abs(to.y-man.position.y)>4):
   if man.position.distance_to(to)>400: man.position=to
   man.target=to
   man.speed=clamp(abs(to.x-man.position.x)*1.4,50,220)
   man.then="stand"
   man.pose="walk"
 for who in [boy,mom,man]:
  if who.target==null: continue
  # People walk on floors: a new floor level is reached at once, never by floating to it.
  if abs(who.target.y-who.position.y)>2: who.position.y=who.target.y
  var to=who.target-who.position
  if abs(to.x)>1: who.facing=1 if to.x>0 else -1
  if to.length()<=who.speed*delta:
   who.position=who.target
   who.target=null
   who.pose=who.then
   continue
  who.position+=to.normalized()*who.speed*delta

func place(world,who,x,ground_y,tall):
 var spot=stand_spot(world,x,ground_y,tall)
 who.position=spot if spot!=null else Vector2(x,ground_y)

# Somewhere a person `tall` tiles high can stand near x: floor or a ledge under their feet,
# nothing above them, no spikes. Prefers the floor nearest ground_y, then the nearest x.
var spot_cache={}
func stand_spot(world,x,ground_y,tall):
 var key=Vector3i(floori(x/8),roundi(ground_y/8),tall)
 if spot_cache.has(key): return spot_cache[key]
 var cells=world.cells
 var found=null
 for dx in [0,1,-1,2,-2,3,-3,4,-4,6,-6,8,-8,10,-10,13,-13,16,-16]:
  var cx=key.x+dx
  for dy in [0,-1,1,-2,2,-3,3,-4,4,-6,6,-8,8]:
   var r=key.y+dy
   if not fits(cells,cx,r,tall): continue
   found=Vector2(cx*8+4,r*8)
   break
  if found!=null: break
 spot_cache[key]=found
 return found

func fits(cells,cx,r,tall):
 for x in [cx-1,cx,cx+1]:
  if not cells.get(Vector2i(x,r),0) in [1,2]: return false
  for y in range(r-tall,r):
   if cells.get(Vector2i(x,y),0)!=0: return false
 return true

func ride_point(delta):
 ride.t+=delta
 if ride.get("lower",false):
  var drop=max(1.0,(ride.to.y-ride.from.y)/90.0)
  if ride.t<.35: return ride.from
  var u=ride.t-.35
  if u<drop: return ride.from.lerp(ride.to,ease(u/drop,-1.6))
  return null
 var top=Vector2(ride.from.x,ride.to.y)
 var rise=max(1.0,(ride.from.y-top.y)/90.0)
 var across=abs(ride.to.x-top.x)/140.0
 if across>0: across=max(.4,across)
 if ride.t<.35: return ride.from
 var t=ride.t-.35
 if t<rise: return ride.from.lerp(top,ease(t/rise,-1.6))
 t-=rise
 if t<across: return top.lerp(ride.to,ease(t/across,-1.6))
 return null

# Sunday night, the same lot. He gets out of Dad's car and hands the big man his bag.
func begin_ending(world,sim):
 done.ending=true
 phase="ending"
 end_time=0.0
 deaths_at_end=sim.deaths
 in_drive=false
 in_car=false
 var lot=world.placements[LOT]
 var floor_y=lot.y+34*8
 # Felix stands by the car, at the bottom of the lot.
 sim.p.x=13*8
 sim.p.y=34*8-sim.p.h
 sim.p.vx=0
 sim.p.vy=0
 snap_request=true
 car.visible=true
 car.leaving=false
 car.position=Vector2(lot.x+16*8,lot.y+31*8)
 man.visible=true
 man.pose="stand"
 man.facing=1
 man.position=Vector2(lot.x+6*8,floor_y)
 mom.visible=true
 mom.pose="stand"
 mom.facing=1
 mom.position=Vector2(lot.x+3*8,floor_y)
 boy.visible=true
 boy.bag=true
 boy.facing=-1
 boy.pose="stand"
 boy.position=Vector2(lot.x+15*8,floor_y)

func tick_ending(delta):
 end_time+=delta
 if end_time>.5 and not done.has("sunday"):
  done.sunday=true
  show_hint("sunday night",3.0)
 if end_time>2.5 and not done.has("walkover"):
  done.walkover=true
  walk(boy,man.position+Vector2(14,0),"give")
 if end_time>3.0 and not done.has("there"):
  done.there=true
  say("there he is.","mom",2.2)
 if end_time>6.2 and not done.has("hey"):
  done.hey=true
  boy.bag=false
  man.bag=true
  man.pose="bag"
  say("hey.","boy",1.8)
 if end_time>8.4 and not done.has("gotit"):
  done.gotit=true
  say("...hey, bud. got it.","man",2.4)
 if end_time>11.0 and not done.has("home"):
  done.home=true
  say("let's go home.","mom",2.2)
 # The mask comes off. The mission's over.
 if end_time>13.0 and gifts.mask:
  gifts.mask=false
  gifts.dagger=false
  pulse_request=.6
 if end_time>16.5: phase="end"

func felix_radius():
 if phase in ["ending","end"]: return 1.25
 # A spy keeps his light low.
 if gifts.mask: return .95+late*.15
 return 1.1

# Friday gold going to sunset over the water; the drive is night with passing streetlights.
func ambient():
 if phase=="black": return Color(0,0,0)
 var day=Color(1,.96,.88)
 var sunset=Color(1,.76,.6)
 var tone=day.lerp(sunset,clamp(late,0,1))
 if in_drive: tone=Color(.36,.38,.52).lerp(Color(.95,.72,.48),streetlight()*.45)
 if phase in ["ending","end"]: tone=Color(.42,.43,.56)
 return tone

func streetlight(): return pow(max(0,sin(clock*1.4)),10)

func music_level():
 if freeze>0 and room==LOT: return -80.0
 if in_drive: return -18.0
 if phase in ["ending","end"]: return -16.0
 return -10.0

func dark_amount(): return 0.0

func items(): return [badge]
