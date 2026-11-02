extends RefCounted
## Menu positions are presentation only; item IDs remain the original room indices.
static func entries(data):
 var rooms=data.world.rooms
 var result=[]
 if int(data.world.n)==4:
  for i in range(rooms.size()): result.append({"index":i,"label":"%02d · %s"%[i+1,rooms[i].name]})
  return result
 var by_id={}
 for i in range(rooms.size()): by_id[rooms[i].id]=i
 var seen={}
 var road=data.world.sections.duplicate()
 # Native World 1's repair stair was appended to the source array, although it
 # physically leads into the final overlook. Present it before that destination.
 if int(data.world.n)==1:
  var stairs=road.filter(func(section):return section.room=="godot-overlook-stair")
  if stairs.size()==1:
   road.erase(stairs[0])
   for i in range(road.size()):
    if road[i].room=="cl1-atlas-crossroads": road.insert(i,stairs[0]);break
 var groups=[{"sections":road,"kind":""}]
 for branch in data.world.get("quests",[]): groups.append({"sections":branch.sections,"kind":"Side route"})
 for branch in data.world.get("secrets",[]): groups.append({"sections":branch.sections,"kind":"Secret"})
 groups.append({"sections":data.world.get("passages",[]),"kind":"Passage preview"})
 for group in groups:
  for section in group.sections:
   if not by_id.has(section.room) or seen.has(section.room): continue
   var index=by_id[section.room]
   var room=rooms[index]
   var title=str(room.get("name","")).strip_edges()
   # Tiny unnamed passage pieces have no authored practice spawn. They remain in
   # the continuous world, but are not destinations in the section selector.
   if title.is_empty() or not room.map.any(func(row):return "P" in row): continue
   seen[section.room]=true
   var suffix="" if group.kind=="" else " · "+group.kind
   result.append({"index":index,"label":"%02d · %s%s"%[result.size()+1,title,suffix]})
 return result
