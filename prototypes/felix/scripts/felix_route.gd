extends RefCounted
## Felix's approved exercises stay intact. Only their approaches and earned exits connect.
const Route=preload("res://scripts/affixed_route.gd")
static func prepare(data):
 var w=data.world
 var chapter=int(w.n)
 var route=w.campaignWorkshop
 route.geometry=true
 route.walks=[]
 route.walkTargets={}
 route.landing={}
 var defs={}
 for d in w.rooms: defs[d.id]=d
 var x={1:563,2:500,3:720}[chapter]
 var previous={1:481,2:490,3:710}[chapter]
 var floor_y={1:-84,2:-35,3:-55}[chapter]
 var prefix="felix-walk-" if chapter==1 else "story-walk-"
 var title={1:"The Top of the Wardrobe",2:"The Storm",3:"The Drive"}[chapter]
 if chapter==1:
  for r in [22,23,24,25]: Route.set_glyph(defs["godot-overlook-stair"],7,r,".")
 else:
  var arrival="cl%d-atlas-arrival"%chapter
  var passage="cl%d-passage-"%chapter
  w.rooms=w.rooms.filter(func(d):return d.id!=arrival and not str(d.id).begins_with(passage))
  w.sections=w.sections.filter(func(s):return s.room!=arrival and not str(s.room).begins_with(passage))
  w.passages=w.get("passages",[]).filter(func(s):return not str(s.room).begins_with(passage))
  route.entry=""
 for i in range(route.rooms.size()):
  var id=route.rooms[i]
  var d=defs[id]
  var spawn=Route.spawn_tile(d)
  var incoming=int(spawn.y)+1
  var walk_id=prefix+str(i)
  add_walk(w,walk_id,title,previous,x,floor_y)
  route.walks.append(walk_id)
  route.walkTargets[walk_id]=id
  route.landing[id]="" if i==route.rooms.size()-1 else prefix+str(i+1)
  put_section(w,id,x,floor_y-incoming)
  d.roadApproach=[0,incoming*8-32,int(spawn.x)*8,32]
  d.roadEntrance=[]
  for c in range(int(spawn.x)):
   for r in range(maxi(0,incoming-3),incoming): d.roadEntrance.append([c,r,0])
   d.roadEntrance.append([c,incoming-4,1])
   d.roadEntrance.append([c,incoming,1])
  Route.add_exit(d)
  var goal=d.workshopGoal
  floor_y=floor_y-incoming+int(goal[1]/8)
  previous=x+int(d.get("cols",40))
  x=previous+16
 if chapter==1:
  var final_walk=prefix+str(route.rooms.size())
  add_walk(w,final_walk,title,previous,x,floor_y)
  route.walks.append(final_walk)
  route.landing[route.rooms[-1]]=final_walk
  var sill=defs["cl1-atlas-crossroads"]
  for r in [6,7,8,9]:
   Route.set_glyph(sill,0,r,".")
   Route.set_glyph(sill,39,r,"#")
  put_section(w,sill.id,x,floor_y-10)
static func add_walk(w,id,title,left,right,floor_y):
 var width=right-left
 var map=[]
 for r in range(5):
  var row=""
  for c in range(width): row+="#" if r in [0,4] else "P" if r==3 and c==2 else "."
  map.append(row)
 w.rooms.append({"id":id,"name":title,"cols":width,"rows":5,"map":map,"exit":"right","lock":[],"roadConnector":true,"wardrobeWalk":true})
 w.sections.append({"room":id,"x":left,"y":floor_y-4,"fire":null,"connector":true})
static func put_section(w,id,x,y):
 for s in w.sections:
  if s.room==id:
   s.x=x
   s.y=y
   s.fire=null
   return
 w.sections.append({"room":id,"x":x,"y":y,"fire":null})
