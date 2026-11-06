extends RefCounted
## Return objectives for physical campaign puzzles; collection resets with the room.
const Pickups=preload("res://scripts/workshop_pickups.gd")
static func required(definition):
 return definition.get("puzzleStudy",false) and definition.get("workshopRequireAllShards",false)
static func at_flag(core):
 if not required(core.room.def) or core.p.state in ["dead","respawn"] or not core.p.onGround: return false
 var g=core.room.def.puzzleGoal
 return Rect2(g[0],g[1]-2,g[2],g[3]+4).has_point(Vector2(core.p.x+core.p.w/2.0,core.p.y+core.p.h))
static func is_return_gate(core,entity):
 var gate=core.room.def.get("puzzleReturnGate",[])
 return required(core.room.def) and entity.type=="gate" and gate.size()==2 and entity.x==gate[0] and entity.y==gate[1]
static func update(core):
 if not required(core.room.def): return
 if not core.puzzle_returned and at_flag(core) and Pickups.ready(core.room.def,core.ents):
  core.puzzle_returned=true
  core.emit_event("gate-open")
 for e in core.ents:
  if is_return_gate(core,e):
   e.open=core.puzzle_returned
   if not e.open: e.t=0
