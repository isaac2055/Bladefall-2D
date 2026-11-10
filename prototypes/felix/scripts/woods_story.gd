extends RefCounted
## Chapter Two, Sir Felix. Two years on, every other weekend is at Dad's new cabin through the
## woods. The boy walks Felix there; in a clearing he knights him with Dad's stick. That night a
## storm knocks the power out, and Dad tells a knight story by flashlight: Felix plays it out,
## room by room, until the boy is asleep on Dad's lap and Dad takes the watch.

const REFUGE="cl2-w2-refuge"
const CLEARING="cl2-w2-clearing"
const DESCENT="cl2-w2-descent"
const BRIAR="cl2-w2-briar"
const KITCHEN="cl2-w2-kitchen"
const RETURN="cl2-bank-f22"
const EDGE="cl2-w2-edge"
const MIRROR="cl2-w2-mirror"
const FERRY="cl2-bank-b23"
const ROOTBOUND="cl2-w2-rootbound"
const TREE="cl2-bank-b67"
const CABIN="cl2-atlas-crossroads"
const SECRET="cl2-secret-w2"
# How late it is in each room of the walk: 0 afternoon, 1 night.
const DUSK={REFUGE:0.0,CLEARING:.05,DESCENT:.1,BRIAR:.15,KITCHEN:.25,RETURN:.35,
 "cl2-walk-2-10":.4,EDGE:.45,MIRROR:.55,FERRY:.65,ROOTBOUND:.75,TREE:.85,CABIN:.95}
# Dad's story, one beat as Felix drops into each room and one as he reaches its light.
const TALE=[
 ["once upon a time, Sir Felix walked out into the storm...","he had to borrow a branch to cross the first gap."],
 ["the trees out there grew all crooked.","but crooked trees still hold you up."],
 ["deep in the woods was a hollow tree with a crown inside.","the crown was too big. he left it for the king."],
 ["then the wind blew so hard the whole forest turned over.","Sir Felix didn't even fall down."],
 ["a wizard needed three magic seeds.","...three. good counting, Sir Felix."],
 ["then a giant stone came rolling down the hill.","and the knight found the root that stops stones."],
 ["two paths through the treetops. which one did he take?","the brave one."],
 ["a river, and no bridge. only a little ferry.","he brought the last piece home across the water."],
 ["it got so dark, the knight had to carry his own light.","and the light carried him."],
 ["at the very top of the tallest tree...","...the dragon was fast asleep."],
]
# The boy's voice from the cabin, now and then. [room index, at the light?, line]
const INTERRUPTIONS=[[0,false,"he doesn't have a horse."],[3,true,"I wouldn't fall down either."],
 [6,true,"the BRAVE one."],[9,false,"...is there a dragon?"]]

var phase="black"
var gifts={"legs":true,"cape":true,"arms":true,"face":true,"sword":false,"helmet":false}
var boy={"hidden":false,"visible":true,"position":Vector2.ZERO,"pose":"stand","facing":1,"prop":"","asleep":false,"target":null,"speed":0.0,"then":"","follow":false}
var dad={"visible":true,"flashlight":false,"lap":false}
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
var thunder=0.0          # 1 at a lightning strike, fading
var thunder_request=false
var raining=0.0
var power=true
var cut=""
var dusk=0.0
var in_tale=false
var tale_done=false
var end_time=0.0
var deaths_at_end=0
var deaths_at_tale=0
var ride=null
var tale_rooms=[]
var photos=[]            # the stretches of Dad's story Felix finished
var drawing={"kind":"drawing","at":Vector2.ZERO,"taken":false}
var world_ref=null

func _init(world):
 world_ref=world
 tale_rooms=world.data.world.campaignWorkshop.rooms
 var origin=world.placements.get(SECRET,Vector2.ZERO)
 # Where Codex's secret heart was: the end of Read the Colors.
 drawing.at=origin+Vector2(308,107)
 var start=world.placements.get(REFUGE,Vector2.ZERO)
 boy.position=start+Vector2(9*8,18*8)

func title(): return ["Chapter Two","every other weekend"]

func end_stats():
 return "%d %s   ·   %d of %d parts of the story%s"%[deaths_at_end,"fall" if deaths_at_end==1 else "falls",photos.size(),tale_rooms.size(),"   ·   the drawing of Sir Felix" if drawing.taken else ""]

func skip_prologue():
 phase="play"
 gifts.sword=true
 gifts.helmet=true
 done.knighted=true
 done.opening=true
 boy.follow=true

func blocking(): return freeze>0 or ride!=null or phase in ["black","ending","end"]

func say(text_value,anchor="boy",seconds=2.6):
 lines.clear()
 lines.append({"text":text_value,"anchor":anchor,"life":seconds,"max":seconds})

func show_hint(text_value,seconds=4.5):
 hint.text=text_value
 hint.life=seconds

func start():
 if phase!="black": return
 phase="play"
 pulse_request=1.0

# A scene stops the world: each step is [frame, callable].
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
 thunder=max(0,thunder-delta*1.6)
 dusk=lerp(dusk,1.0 if in_tale or room==CABIN else DUSK.get(room,dusk),1-exp(-delta*.4))
 # Storm: thunder every few seconds once it has started, more often in Dad's story.
 if raining>0 and fmod(clock,7.3 if in_tale else 9.1)<delta: strike()
 tick_boy(world,delta)
 if freeze>0:
  freeze-=1
  cue_clock+=1
  while not cue.is_empty() and cue_clock>=cue[0][0]: cue.pop_front()[1].call()
  return
 if phase=="ending":
  tick_ending(delta)
  return
 if phase!="play": return
 if room in tale_rooms or room.begins_with("story-walk-"): in_tale=true
 var origin=world.placements.get(room,Vector2.ZERO)
 # The walk to Dad's.
 if room==REFUGE and not done.has("opening"):
  done.opening=true
  scene(260,[
   [1,func(): say("dad's new house is through the woods.","boy",2.4)],
   [150,func():
     say("come on, Felix!","boy",1.8)
     boy.follow=true]])
 if room==CLEARING and not done.has("knighted") and felix.x>=origin.x+9*8: knighting()
 if room==DESCENT and not done.has("moths"):
  done.moths=true
  say("moths! get 'em, Sir Felix!","boy",2.2)
  show_hint("a cut moth throws you, and gives your dash back")
 if room==BRIAR and not done.has("thorns"):
  done.thorns=true
  say("careful. those are pokey.","boy",2.2)
 if room==KITCHEN and not done.has("hungry"):
  done.hungry=true
  say("dad said he's making pancakes.","boy",2.4)
  lines.append({"text":"he always burns them.","anchor":"boy","life":2.2,"max":2.2,"delay":2.6})
 if room==RETURN and not done.has("sunset"):
  done.sunset=true
  say("the sun's going down.","boy",2.4)
 if room==EDGE and not done.has("swap"):
  done.swap=true
  say("whoa. the branches keep CHANGING.","boy",2.4)
  show_hint("every dash swaps which branches are real",5.0)
 if room==MIRROR and not done.has("bell"):
  done.bell=true
  show_hint("a struck bell swaps them too",4.0)
 if room==FERRY and not done.has("creek"):
  done.creek=true
  say("dad says don't go near the creek.","boy",2.4)
  lines.append({"text":"...we're not NEAR it. we're ON it.","anchor":"boy","life":2.4,"max":2.4,"delay":2.8})
 if room==ROOTBOUND and not done.has("far"):
  done.far=true
  strike(.5)
  say("...was that thunder?","boy",2.2)
 if room==TREE and not done.has("tree"):
  done.tree=true
  say("the BIG tree! dad's is right past it!","boy",2.6)
 if room==CABIN and sim.p.onGround and felix.x<origin.x+52*8 and felix.y>origin.y+18*8 and not done.has("cabin") and not tale_done: arrive(world)
 if room==SECRET and not drawing.taken and felix.distance_to(drawing.at)<12:
  drawing.taken=true
  pulse_request=1.0
  show_hint("found: a drawing of Sir Felix",4.0)
 # The imagined journey now continues through physical passages.
 var index=tale_rooms.find(room)
 if index>=0:
  if not done.has("tale-in:"+room):
   done["tale-in:"+room]=true
   say(TALE[index][0],"above",4.0)
   for item in INTERRUPTIONS:
    if item[0]==index and not item[1]: lines.append({"text":item[2],"anchor":"below","life":2.4,"max":2.4,"delay":4.2})
   if sim.room.def.get("workshopRequireAllShards",false): show_hint("find all three, then bring them to the light",4.5)
   elif sim.room.def.get("workshopRequireShard",false): show_hint("find the last piece, then bring it to the light",4.5)
  if not world.campaign_completed.has(room) and preload("res://scripts/campaign_workshop.gd").goal_reached(sim):
   world.campaign_completed[room]=true
   world.open_road_exit(room,true)
   pulse_request=.8
   if not room in photos: photos.append(room)
   say(TALE[index][1],"above",3.4)
   for item in INTERRUPTIONS:
    if item[0]==index and item[1]: lines.append({"text":item[2],"anchor":"below","life":2.4,"max":2.4,"delay":3.4})
   if index==tale_rooms.size()-1:
    # A chapter scene change, after the final line has time to land.
    tale_done=true
    freeze=300
    cue_clock=0
    cue=[[300,func(): cut=CABIN]]
 if tale_done and room==CABIN and not done.has("ending"): begin_ending(sim)

# Dad's walking stick, a seven-year-old's ceremony, and a knight.
func knighting():
 done.knighted=true
 boy.follow=false
 boy.target=null
 boy.pose="kneel"
 boy.prop="stick"
 # He kneels a step away, facing the knight.
 boy.facing=-1 if boy.position.x>felix.x else 1
 boy.position.x=felix.x+4-boy.facing*64
 boy.position.y=felix.y+11
 scene(560,[
  [1,func(): say("wait. stop right there.","boy",2.0)],
  [120,func(): say("this is dad's stick. but now it's a SWORD.","boy",2.6)],
  [280,func(): say("kneel.","boy",1.4)],
  [370,func():
    gifts.helmet=true
    pulse_request=.8
    say("I dub thee...","boy",1.8)],
  [470,func():
    gifts.sword=true
    boy.prop=""
    pulse_request=1.4
    say("SIR FELIX!","boy",2.0)],
  [560,func():
    show_hint("W   swing your sword",5.0)
    boy.pose="run"
    boy.follow=true]])

# Dad's cabin at dusk; then the storm takes the power, and Dad starts a story.
func arrive(world):
 done.cabin=true
 boy.follow=false
 var hall=world.placements[CABIN]
 var spot=Vector2(hall.x+14*8+150,hall.y+22*8)
 if boy.position.distance_to(spot)>500: boy.position=Vector2(felix.x+120,spot.y)
 walk_boy(spot,"stand")
 boy.pose="run"
 boy.facing=1
 dad.visible=true
 scene(1320,[
  [1,func(): say("there's my guy!","above",2.2)],
  [140,func(): say("DAD! this is Sir Felix.","boy",2.4)],
  [300,func(): say("...Sir Felix. very nice to meet you, sir.","above",2.8)],
  [480,func():
    raining=1.0
    strike()],
  [560,func():
    strike()
    power=false
    say("whoa. there goes the power.","above",2.4)],
  [720,func():
    dad.flashlight=true
    say("...I don't like storms.","boy",2.4)],
  [880,func(): say("hey. c'mere. want a story?","above",2.4)],
  [1030,func(): say("...a knight one.","boy",2.0)],
  [1150,func(): say("a knight one. once upon a time, there was a knight named—","above",2.6)],
  [1300,func(): say("SIR FELIX.","boy",1.6)],
  [1320,func():
    in_tale=true
    deaths_at_tale=0
    cut="story-walk-0"]])

func strike(power_value=1.0):
 thunder=power_value
 thunder_request=true

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

# The boy walks with Felix through the woods, a little ahead, in the background.
func tick_boy(world,delta):
 if boy.follow and phase=="play" and freeze==0:
  var rect=world.rectangles.get(room,Rect2())
  var sim=world.active()
  # He walks a little ahead, on the ground Felix last stood on.
  if sim.p.onGround: boy.ground=felix.y+11
  var ahead=felix.x+(70 if boy.facing>=0 else -70)
  ahead=clamp(ahead,rect.position.x+20,rect.end.x-20)
  var to=stand_spot(world,ahead,boy.get("ground",rect.end.y-40))
  if to==null: to=boy.position
  if abs(to.x-boy.position.x)>18 or abs(to.y-boy.position.y)>4:
   boy.target=to
   boy.speed=clamp(abs(to.x-boy.position.x)*1.6,60,260)
   boy.then="stand"
   boy.pose="run"
 if boy.target==null: return
 var to=boy.target-boy.position
 if abs(to.x)>1: boy.facing=1 if to.x>0 else -1
 if to.length()<=boy.speed*delta:
  boy.position=boy.target
  boy.target=null
  boy.pose=boy.then
  return
 boy.position+=to.normalized()*boy.speed*delta

# Somewhere the boy can really stand near x: a solid floor (or a ledge) under his feet, nothing
# in the 80 px above him, and no spikes or thorns where he stands. Prefers the floor nearest
# Felix's, then the nearest x. Cached per tile so it is cheap to ask every frame.
const BOY_TALL=8
var spot_cache={}
func stand_spot(world,x,ground_y):
 var key=Vector2i(floori(x/8),roundi(ground_y/8))
 if spot_cache.has(key): return spot_cache[key]
 var cells=world.cells
 var found=null
 for dx in [0,1,-1,2,-2,3,-3,4,-4,6,-6,8,-8,10,-10,13,-13,16,-16,20,-20]:
  var cx=key.x+dx
  for dy in [0,-1,1,-2,2,-3,3,-4,4,-5,5,-6,6,-8,8]:
   var r=key.y+dy
   if not boy_fits(cells,cx,r): continue
   found=Vector2(cx*8+4,r*8)
   break
  if found!=null: break
 spot_cache[key]=found
 return found

func boy_fits(cells,cx,r):
 for x in [cx-1,cx,cx+1]:
  if not cells.get(Vector2i(x,r),0) in [1,2]: return false
  for y in range(r-BOY_TALL,r):
   if cells.get(Vector2i(x,y),0)!=0: return false
 return true

func walk_boy(target,then):
 boy.target=target
 boy.speed=140.0
 boy.then=then

func begin_ending(sim):
 done.ending=true
 phase="ending"
 end_time=0.0
 deaths_at_end=sim.deaths
 in_tale=false
 dad.visible=true
 dad.flashlight=true
 dad.lap=true
 boy.visible=true
 boy.asleep=true
 boy.pose="lap"
 raining=.45

func tick_ending(delta):
 end_time+=delta
 if end_time>1.5 and not done.has("watch1"):
  done.watch1=true
  say("...and Sir Felix kept watch all night,","above",3.4)
 if end_time>5.2 and not done.has("watch2"):
  done.watch2=true
  say("so nobody had to be scared.","above",3.0)
 if end_time>9.0 and not done.has("watch3"):
  done.watch3=true
  say("...I've got the watch tonight, Sir Felix.","above",3.6)
 # The helmet and the sword set down by Felix's feet.
 if end_time>12.5 and gifts.sword:
  gifts.sword=false
  gifts.helmet=false
  pulse_request=.6
 if end_time>16.0: phase="end"

func felix_radius():
 if phase in ["ending","end"]: return 1.3
 return 1.15+dusk*.25

# Afternoon gold to dusk to the storm; the flashlight story is cold and blue.
func ambient():
 if phase=="black": return Color(0,0,0)
 var day=Color(1,.97,.9)
 var night=Color(.36,.38,.52)
 var tone=day.lerp(Color(.92,.66,.52),clamp(dusk*2,0,1)).lerp(night,clamp(dusk*1.6-.6,0,1))
 if in_tale: tone=Color(.3,.33,.48)
 if phase in ["ending","end"]: tone=Color(.34,.33,.42)
 return tone.lerp(Color(.9,.92,1.1),thunder*.7)

func music_level():
 if freeze>0 and room==CABIN: return -80.0
 if in_tale: return -18.0
 if phase in ["ending","end"]: return -16.0
 return -10.0

func dark_amount(): return 0.0

func items(): return [drawing]
