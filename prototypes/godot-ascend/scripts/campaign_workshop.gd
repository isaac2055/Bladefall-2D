extends RefCounted
## The approved native workshop is shared by its practice chapter and home worlds.
## Navigation links preserve the enclosed puzzles and their authored finish rules.
const Pickups=preload("res://scripts/workshop_pickups.gd")
static func append(data,workshop):
 var number=int(data.world.n)
 if number not in [1,2,3]: return
 var biome={1:"outskirts",2:"woods",3:"causeway"}[number]
 var ids=[]
 var entry="cl%d-atlas-crossroads"%number
 var entry_section=data.world.sections.filter(func(section):return section.room==entry)[0]
 var x=0.0
 var placements=data.world.sections.duplicate()
 placements.append_array(data.world.get("passages",[]))
 for branch in data.world.get("quests",[])+data.world.get("secrets",[]): placements.append_array(branch.sections)
 for section in placements:
  var definition=data.world.rooms.filter(func(room):return room.id==section.room)[0]
  x=max(x,section.x+definition.get("cols",40))
 x+=32
 var y=entry_section.y
 for definition in workshop.world.rooms:
  if definition.get("workshopBiome","outskirts")!=biome: continue
  var room=definition.duplicate(true)
  room.campaignWorkshop=true
  ids.append(room.id)
  data.world.rooms.append(room)
  data.world.sections.append({"room":room.id,"x":x,"y":y,"fire":null})
  data.world.tapes[room.id]=workshop.world.tapes.get(room.id,[]).duplicate(true)
  x+=room.get("cols",40)+16
 data.world.campaignWorkshop={"entry":entry,"rooms":ids}

static func goal_reached(core):
 var definition=core.room.def
 if not definition.has("workshopGoal") or not core.p.onGround or core.p.state in ["dead","respawn"]: return false
 if not Pickups.ready(definition,core.ents): return false
 if definition.get("workshopRequireStakes",false) and core.ents.any(func(e):return e.type=="stone" and not e.get("lit",false)): return false
 var goal=definition.workshopGoal
 return Rect2(goal[0],goal[1]-2,goal[2],goal[3]+4).has_point(Vector2(core.p.x+core.p.w/2.0,core.p.y+core.p.h))
