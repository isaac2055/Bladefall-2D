extends RefCounted
## Finish rules shared by the application and route verification.
static func counts(entities):
 var items=entities.filter(func(e):return e.type=="shard")
 return [items.filter(func(e):return e.get("gone",false)).size(),items.size()]
static func ready(definition,entities):
 var count=counts(entities)
 if definition.get("workshopRequireAllShards",false): return count[1]>0 and count[0]==count[1]
 return not definition.get("workshopRequireShard",false) or count[0]>0
