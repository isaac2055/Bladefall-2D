extends RefCounted
## A completion opens a built passage in a short, left-to-right mechanical sequence.
## Puzzle data and fingerprints stay unchanged. Resume settles earned passages open.
const WAVE_FRAMES=36.0
const PANEL_FRAMES=18.0
static func begin(world,id):
 var room=world.parsed[id]
 var goal=room.def.get("workshopGoal",room.def.get("puzzleGoal",[]))
 var changes=[]
 var by_cell={}
 var origin=Vector2i(world.placements[id]/8)
 for patch in room.def.get("roadExit",[]):
  var cell=Vector2i(patch[0],patch[1])
  changes.append({"cell":cell,"before":world.cells.get(origin+cell,0),"after":int(patch[2])})
 for change in changes: by_cell[change.cell]=change
 world.road_opening[id]={"age":0,"start":float(goal[0]),"span":maxf(8,room.w-goal[0]),"changes":changes,"by_cell":by_cell,"retired":[]}
static func phase(state,x):
 var delay=clampf((x-state.start)/state.span,0,1)*WAVE_FRAMES
 return smoothstep(0,1,clampf((float(state.age)-delay)/PANEL_FRAMES,0,1))
static func tick(world):
 for id in world.road_opening.keys():
  var state=world.road_opening[id]
  state.age+=1
  # Keep the warm route cue for a moment after the mechanism settles.
  if state.age>=90: world.road_opening.erase(id)
  world.mark_road_terrain(id)
static func visual_value(world,id,cell,value):
 if not world.road_opening.has(id): return value
 var state=world.road_opening[id]
 var change=state.by_cell.get(cell)
 if change!=null and change.before!=change.after:
  # Collision becomes safe on completion. Presentation retains the old surface
  # until its panel lifts, so no whole-room terrain replacement is visible.
  return change.before if phase(state,cell.x*8)<=0 else 0
 return value
static func draw(art,view):
 var world=art.runtime
 if world==null: return
 var atlas=art.tiles.tile_set.get_source(0).texture
 for id in world.road_base:
  var room=world.parsed[id]
  var goal=room.def.get("workshopGoal",room.def.get("puzzleGoal",[]))
  if goal.size()!=4: continue
  var origin=world.placements[id]
  var start=origin+Vector2(goal[0],goal[1])
  var finish=origin+Vector2(room.w,goal[1])
  if not Rect2(start-Vector2(8,64),Vector2(room.w-goal[0]+24,80)).intersects(view): continue
  var opened=world.road_opened.has(id)
  var state=world.road_opening.get(id,{})
  # A permanent, readable doorway announces the service walk before it opens.
  var door=Vector2(minf(finish.x-8,start.x+goal[2]-4),start.y)
  var trim=Color("#8b8d74") if art.forest else Color("#919999") if art.causeway else Color("#a39676")
  for dx in [-5,5]:
   art.box(door.x+dx,door.y-30,2,30,trim.darkened(.32))
   art.box(door.x+dx-1,door.y-30,4,3,trim)
   art.box(door.x+dx-1,door.y-3,4,3,trim)
   for y in [-22,-12]: art.line(door+Vector2(dx,y),door+Vector2(dx+2,y),trim.darkened(.6),.6)
  art.box(door.x-7,door.y-33,16,3,trim)
  art.line(door+Vector2(-5,-28),door+Vector2(7,-28),trim.darkened(.4),1)
  var light=1.0 if opened else .18
  if not state.is_empty(): light=lerpf(.18,1,smoothstep(0,12,float(state.age)))
  art.circle(door+Vector2(1,-37),4,Color(1,.78,.4,.09*light))
  art.line(door+Vector2(1,-33),door+Vector2(1,-40),trim.darkened(.15),.7)
  art.box(door.x-1,door.y-39,5,5,trim.darkened(.5))
  art.box(door.x,door.y-38,3,3,Color(.96,.78,.42,light))
  if not opened: continue
  # Leading-edge panels retract into the lintel, rather than replacing a whole
  # room in one frame. Reduced motion uses a quiet dissolve with the same timing.
  if not state.is_empty():
   for change in state.changes:
    if change.before==change.after: continue
    var at=origin+Vector2(change.cell)*8
    if not view.grow(8).has_point(at): continue
    var t=phase(state,change.cell.x*8)
    # Keep a clear silhouette and never draw an old wall over the live knight.
    var distance=absf(at.x-(art.actor.x+4))
    if distance<20 and state.age>0: t=maxf(t,1-distance/20)
    if t<=0: continue
    if change.before in [1,2] and t<1:
     var variant=art.hash_at(int(at.x/8),int(at.y/8))%4 if change.before==1 else 15
     var height=8.0 if art.reduced_motion else 8*(1-t)
     art.ink.draw_texture_rect_region(atlas,Rect2(at,Vector2(8,height)),Rect2(variant*8,0,8,height),Color(1,1,1,1-t if art.reduced_motion else 1))
    elif change.before>=3 and t<1:
     var color=art.ink_color
     art.ink_color.a*=1-t
     art.draw_hazard(change.before,at-Vector2(0,0 if art.reduced_motion else t*4))
     art.ink_color=color
    if change.after==1:
     var variant=art.hash_at(int(at.x/8),int(at.y/8))%4
     var height=8*t
     art.ink.draw_texture_rect_region(atlas,Rect2(at+Vector2(0,8-height),Vector2(8,height)),Rect2(variant*8,8-height,8,height),Color(1,1,1,t))
   for entity in state.retired:
    if not Rect2(origin+Vector2(entity.x,entity.y),Vector2(entity.get("w",8),entity.get("h",8))).grow(16).intersects(view): continue
    var t=smoothstep(0,24,float(state.age))
    if t>=1: break
    var ghost=entity.duplicate()
    ghost.y-=0 if art.reduced_motion else 12*t
    var color=art.ink_color
    art.ink_color.a*=1-t
    art.draw_entity(ghost,origin)
    art.ink_color=color
  # Bronze rail edging and a chain of warm lamps carry the eye into the next room.
  for x in range(int(start.x)+8,int(finish.x),16):
   var t=1.0 if state.is_empty() else phase(state,x-origin.x)
   if t<=0 or not view.grow(16).has_point(Vector2(x,start.y)): continue
   art.line(Vector2(x,start.y+1),Vector2(minf(x+15,finish.x),start.y+1),Color(trim,t*.9),1)
   if posmod(x-int(start.x)-8,48)==0:
    art.line(Vector2(x,start.y+2),Vector2(x,start.y+8),Color(trim.darkened(.35),t),1)
    art.box(x,start.y-2,3,1,Color(.95,.78,.45,t))
 # Connected galleries have their own repeated architecture, rather than bare
 # replacement tiles. Lamps ignite from the completed source toward the next door.
 var route=world.data.world.get("campaignWorkshop",{})
 for i in range(route.get("walks",[]).size()):
  var id=route.walks[i]
  var origin=world.placements[id]
  var width=world.parsed[id].w
  if not Rect2(origin,Vector2(width,40)).intersects(view): continue
  var lit=i==0 or world.road_opened.has(route.rooms[i-1])
  var color=Color("#728271") if art.forest else Color("#78848a") if art.causeway else Color("#94866a")
  for x in range(8,int(width),48):
   var at=origin+Vector2(x,32)
   art.line(at,at+Vector2(0,-23),color.darkened(.3),1)
   art.line(at+Vector2(0,-23),at+Vector2(8,-29),color,1)
   art.box(at.x+9,at.y-27,2,3,Color("#e4c17d") if lit else Color("#716c52"))
   art.line(at+Vector2(-6,2),at+Vector2(40,2),color,1)
