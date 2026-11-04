extends SceneTree
## godot --headless --path . -s tools/dump-world.gd -- <world-json> [--unjoined]
## Prints each room's placement (tiles), size, spawn and exit, for planning joins.
func _init():
 var args=OS.get_cmdline_user_args()
 var data=JSON.parse_string(FileAccess.get_file_as_string("res://data/%s.json"%args[0]))
 var world=preload("res://scripts/world.gd").new(data)
 var ids=world.placements.keys()
 ids.sort_custom(func(a,b):return world.placements[a].x<world.placements[b].x)
 for id in ids:
  var room=world.parsed.get(id)
  if room==null: continue
  var p=world.placements[id]/8
  print("%-34s x=%5d y=%5d  %3dx%-3d spawn=(%d,%d) exit=%s goal=%s"%[id,p.x,p.y,room.cols,room.rows,room.spawn.x/8,room.spawn.y/8,room.def.get("exit",""),room.def.get("workshopGoal","")])
 var out=""
 for i in range(args.size()):
  if args[i]=="--png": out=args[i+1]
 if out!="":
  var lo=Vector2i(999999,999999)
  var hi=Vector2i(-999999,-999999)
  for id in ids:
   if abs(world.placements[id].x)>20000: continue
   var a=Vector2i(world.placements[id]/8)
   lo=Vector2i(min(lo.x,a.x),min(lo.y,a.y))
   hi=Vector2i(max(hi.x,a.x+world.parsed[id].cols),max(hi.y,a.y+world.parsed[id].rows))
  var image=Image.create(hi.x-lo.x,hi.y-lo.y,false,Image.FORMAT_RGB8)
  image.fill(Color(.08,.08,.1))
  for id in ids:
   if abs(world.placements[id].x)>20000: continue
   var a=Vector2i(world.placements[id]/8)
   var room=world.parsed[id]
   for r in range(room.rows):
    for c in range(room.cols):
     var at=a+Vector2i(c,r)-lo
     if image.get_pixel(at.x,at.y).r<.1: image.set_pixel(at.x,at.y,Color(.16,.18,.22))
  for key in world.cells:
   var at=key-lo
   if at.x<0 or at.y<0 or at.x>=image.get_width() or at.y>=image.get_height(): continue
   var v=world.cells[key]
   if v==1: image.set_pixel(at.x,at.y,Color(.75,.72,.65))
   elif v>1: image.set_pixel(at.x,at.y,Color(.9,.3,.3))
  for id in ids:
   if abs(world.placements[id].x)>20000: continue
   var sp=Vector2i(world.placements[id]/8)+Vector2i(int(world.parsed[id].spawn.x/8),int(world.parsed[id].spawn.y/8))-lo
   for d in [Vector2i(0,0),Vector2i(1,0),Vector2i(0,1),Vector2i(1,1)]:
    var q=sp+d
    if q.x>=0 and q.y>=0 and q.x<image.get_width() and q.y<image.get_height(): image.set_pixel(q.x,q.y,Color(.2,1,.3))
  image.save_png(out)
  print("map origin ",lo," size ",hi-lo)
 quit()
