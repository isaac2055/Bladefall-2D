extends RefCounted
## Native approved rooms, joined by walkable galleries and completion-triggered lantern hoists.
const Authoring=preload("res://scripts/authoring_data.gd")
static func prepare(data):
 var w=data.world
 if int(w.n)==23 and w.has("samplerAppendedRooms"):
  for room in w.rooms:
   if room.id in w.samplerAppendedRooms: room.campaignWorkshop=true
  w.campaignWorkshop={"entry":"cl23-atlas-crossroads","rooms":w.samplerAppendedRooms.duplicate()}
  # The replaced cover stays available as a study; the approved route bypasses it.
  w.retiredSamplerRooms=["cl23-puzzle-cover-take-away"]
  w.requiredMainRooms=w.get("requiredMainRooms",[]).filter(func(id):return not id in w.retiredSamplerRooms)
 if int(w.n)==23:
  # Keep the obsolete cover study in the native library, and use its road footprint as a safe bypass.
  for i in range(w.rooms.size()):
   if w.rooms[i].id!="cl23-puzzle-cover-take-away": continue
   var old=w.rooms[i]
   var cols=int(old.get("cols",112))
   var map=[]
   for r in range(int(old.get("rows",64))):
    var row=""
    for c in range(cols):
     var floor_row=16+floori(float(c)*21/(cols-1))
     row+="P" if c==34 and r==floor_row-1 else "." if r>=floor_row-3 and r<floor_row else "#"
    map.append(row)
   w.rooms[i]={"id":old.id,"name":"The Freight Bypass","cols":cols,"rows":map.size(),"map":map,"exit":"right","lock":old.get("lock",[]),"palette":old.get("palette","fractured"),"roadConnector":true}
 if int(w.n)==23:
  for room in w.rooms:
   if room.id=="cl23-puzzle-delivery-cannot-ride": add_exit(room)
 if not w.has("campaignWorkshop"): return
 var route=w.campaignWorkshop
 var defs={}
 for d in w.rooms: defs[d.id]=d
 route.geometry=true
 route.walks=[]
 route.walkTargets={}
 route.landing={}
 var entry=defs[route.entry]
 var section=w.sections.filter(func(s):return s.room==route.entry)[0]
 var start=spawn_tile(entry)
 # A staircase leaves the old rest junction onto its roof; the original approach stays open.
 var stair_end=int(start.x)+2*(int(start.y)+1)
 for c in range(int(start.x),mini(stair_end,int(entry.get("cols",40)))):
  var floor_row=maxi(1,int(start.y)+1-(c-int(start.x))/2)
  for r in range(maxi(0,floor_row-4),floor_row): set_glyph(entry,c,r,".")
  for r in range(floor_row,int(start.y)+2): set_glyph(entry,c,r,"#")
 set_glyph(entry,int(start.x),int(start.y),"P")
 var roof_x=int(section.x)+stair_end-6
 var floor_y=int(section.y)
 var occupied=w.sections.duplicate()
 occupied.append_array(w.get("passages",[]))
 for branch in w.get("quests",[])+w.get("secrets",[]): occupied.append_array(branch.sections)
 var right=0
 for s in w.sections:
  if s.room not in route.rooms: right=maxi(right,int(s.x)+int(defs[s.room].get("cols",40)))
 var first_x=maxi(right+16,roof_x+30)
 var high=floor_y-8
 var offset=0
 var test_x=first_x
 # Reserve the whole puzzle footprint, including optional roads and inter-world passages.
 for id in route.rooms:
  var d=defs[id]
  var incoming=int(spawn_tile(d).y)+1
  var width=int(d.get("cols",40))
  var bottom=offset-incoming+int(d.get("rows",d.map.size()))
  for s in occupied:
   if s.room in route.rooms: continue
   var end=int(s.x)+int(defs[s.room].get("cols",40))
   if int(s.x)<test_x+width and end>test_x: high=mini(high,int(s.y)-bottom-8)
  var goal=d.get("workshopGoal",d.get("puzzleGoal",[]))
  offset+=int(goal[1]/8)-incoming
  test_x+=width+16
 for s in occupied:
  if s.room in route.rooms: continue
  var end=int(s.x)+int(defs[s.room].get("cols",40))
  if int(s.x)<first_x and end>roof_x+14: high=mini(high,int(s.y)-8)
 var shaft_id="bladefall-road-stair-%d"%int(w.n)
 var shaft_height=floor_y-high+4
 var shaft_map=[]
 var points=[]
 for r in range(shaft_height+1):
  var row=""
  var platform=r>=4 and r<shaft_height-1 and (shaft_height-r)%3==0
  var side=int((shaft_height-r)/3)%2
  for c in range(14):
   var ch="#" if c in [0,13] or r==0 else "."
   if r>=shaft_height-2: ch="."
   if r in [1,2,3] and c==13: ch="."
   if r in [4,shaft_height]: ch="="
   if platform and (c in [1,2,3,4,5,6,7] if side==0 else c in [6,7,8,9,10,11,12]): ch="="
   if r==shaft_height-1 and c==4: ch="P"
   row+=ch
  shaft_map.append(row)
  if platform: points.push_front([roof_x+(3 if side==0 else 10),high-4+r])
 for c in range(stair_end-6,mini(stair_end+8,int(entry.get("cols",40)))): set_glyph(entry,c,0,".")
 w.rooms.append({"id":shaft_id,"name":"The Upper Passage","cols":14,"rows":shaft_height+1,"map":shaft_map,"exit":"right","roadConnector":true,"lock":[],"roadStair":true,"roadWaypoints":points})
 defs[shaft_id]=w.rooms[-1]
 w.sections.append({"room":shaft_id,"x":roof_x,"y":high-4,"fire":null,"connector":true})
 roof_x+=14
 floor_y=high
 var x=first_x
 for i in range(route.rooms.size()):
  var id=route.rooms[i]
  var d=defs[id]
  var spawn=spawn_tile(d)
  var width=int(d.get("cols",40))
  var incoming_floor=int(spawn.y)+1
  d.roadApproach=[0,incoming_floor*8-32,int(spawn.x)*8,32]
  d.roadEntrance=[]
  for c in range(int(spawn.x)):
   for r in range(maxi(0,incoming_floor-3),incoming_floor): d.roadEntrance.append([c,r,0])
   d.roadEntrance.append([c,incoming_floor-4,1])
   d.roadEntrance.append([c,incoming_floor,1])
  var walk_id="bladefall-gallery-%d-%d"%[int(w.n),i]
  var length=x-roof_x
  var map=[]
  for r in range(5):
   var row=""
   for c in range(length): row+="#" if r in [0,4] else "P" if r==3 and c==2 else "."
   map.append(row)
  var home=preload("res://scripts/run_profile.gd").home(int(w.n))
  var walk={"id":walk_id,"name":{1:"The Watch Walk",2:"The Ranger Crossing",3:"The Service Walk"}[home],"cols":length,"rows":5,"map":map,"exit":"right","lock":[],"palette":w.get("palette","outskirts"),"roadConnector":true,"decor":[{"k":"sconce","c":4,"r":2}]}
  w.rooms.append(walk)
  w.sections.append({"room":walk_id,"x":roof_x,"y":floor_y-4,"fire":null,"connector":true})
  for s in w.sections:
   if s.room==id:
    s.x=x
    s.y=floor_y-incoming_floor
  route.walks.append(walk_id)
  route.walkTargets[walk_id]=id
  route.landing[id]="" if i==route.rooms.size()-1 else route.rooms[i+1]
  var goal=d.get("workshopGoal",d.get("puzzleGoal",[]))
  var exit_floor=int(goal[1]/8)
  add_exit(d)
  roof_x=x+width
  floor_y=floor_y-incoming_floor+exit_floor
  x=roof_x+16
 w.samplerFinish=route.rooms[-1]
static func add_exit(d):
 var goal=d.get("workshopGoal",d.get("puzzleGoal",[]))
 var floor_row=int(goal[1]/8)
 d.roadExit=[]
 for c in range(int(goal[0]/8),int(d.get("cols",40))):
  for r in range(maxi(0,floor_row-7),floor_row): d.roadExit.append([c,r,0])
  d.roadExit.append([c,floor_row,1])
static func set_glyph(d,c,r,ch,terrain_only=false):
 if r<0 or r>=d.map.size() or c<0 or c>=d.map[r].length(): return
 if terrain_only and d.map[r][c] not in [".","#","%","=","^","v","<",">"]: return
 var row=d.map[r]
 row[c]=ch
 d.map[r]=row
static func spawn_tile(definition):
 for r in range(definition.map.size()):
  var c=definition.map[r].find("P")
  if c>=0: return Vector2i(c,r)
 return Vector2i(2,2)
static func at_goal(core):
 var d=core.room.def
 var g=d.get("workshopGoal",d.get("puzzleGoal",[]))
 if g.size()!=4 or core.p.state in ["dead","respawn"] or not core.p.onGround: return false
 if not preload("res://scripts/workshop_pickups.gd").ready(d,core.ents): return false
 if d.get("workshopRequireStakes",false) and core.ents.any(func(e):return e.type=="stone" and not e.get("lit",false)): return false
 return Rect2(g[0],g[1]-2,g[2],g[3]+4).has_point(Vector2(core.p.x+core.p.w/2.0,core.p.y+core.p.h))
