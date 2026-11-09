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
 if not w.has("campaignWorkshop"): return
 var route=w.campaignWorkshop
 var defs={}
 for d in w.rooms: defs[d.id]=d
 var x=0
 var top=0
 for s in w.sections:
  if s.room in route.rooms: continue
  x=maxi(x,int(s.x)+int(defs[s.room].get("cols",40)))
  top=mini(top,int(s.y))
 x+=16
 top-=12
 route.walks=[]
 route.walkTargets={}
 route.landing={}
 for i in range(route.rooms.size()):
  var id=route.rooms[i]
  var d=defs[id]
  var spawn=spawn_tile(d)
  var width=maxi(int(d.get("cols",40)),int(spawn.x)+8)
  var walk_id="bladefall-gallery-%d-%d"%[int(w.n),i]
  var map=[]
  for r in range(7):
   var row=""
   for c in range(width):
    row+="#" if r==0 or r==6 or c==0 or c==width-1 else "P" if r==5 and c==2 else "."
   map.append(row)
  var walk={"id":walk_id,"name":"The Lantern Gallery","cols":width,"rows":7,"map":map,"exit":"none","lock":[],"palette":w.get("palette","outskirts"),"gallery":true,"galleryDock":int(spawn.x)}
  w.rooms.append(walk)
  w.sections.append({"room":walk_id,"x":x,"y":top,"fire":{"c":2,"r":5}})
  for s in w.sections:
   if s.room==id:
    s.x=x
    s.y=top+10
  route.walks.append(walk_id)
  route.walkTargets[walk_id]=id
  route.landing[id]="" # final room ends this world
  if i>0: route.landing[route.rooms[i-1]]=walk_id
  x+=width+8
 w.samplerFinish=route.rooms[-1]
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
