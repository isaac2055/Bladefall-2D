class_name AscendRoomLoader
extends RefCounted
## Reads the original 8px authored maps in Godot; exported parsed rooms are test oracles only.
static func parse(definition: Dictionary):
 var cols = int(definition.get("cols",40))
 var rows = int(definition.get("rows",23))
 var grid = []
 var seen = {}
 grid.resize(cols*rows)
 grid.fill(0)
 var room = {"id":definition.id,"name":definition.get("name",definition.id),"def":definition,"cols":cols,"rows":rows,"w":cols*8,"h":rows*8,"grid":grid,"entities":[],"spawn":null,"maxDashes":definition.get("dashes",1),"exit":definition.get("exit","right")}
 var groups = []
 var chars = {"#":1,"%":1,"=":2,"^":3,"v":4,"<":5,">":6}
 var types = {"o":"refill","c":"stone","b":"pod","x":"bell","s":"spring","*":"shard","l":"lantern","_":"plate"}
 for r in range(rows):
  for c in range(cols):
   var ch = glyph(definition,c,r)
   var i = r*cols+c
   if chars.has(ch): grid[i] = chars[ch]
   elif ch=="P": room.spawn = {"x":c*8,"y":r*8+8-11}
   elif ch in ["A","B","K","Z","G","H","M","~"]:
    if seen.has(i): continue
    var w = 0
    while c+w<cols and glyph(definition,c+w,r)==ch and not seen.has(r*cols+c+w): w += 1
    var h = 1
    while r+h<rows:
     var fits = true
     for k in range(w):
      if glyph(definition,c+k,r+h)!=ch or seen.has((r+h)*cols+c+k):
       fits = false
       break
     if not fits: break
     h += 1
    for y in range(h):
     for k in range(w): seen[(r+y)*cols+c+k] = true
    groups.append({"ch":ch,"x":c*8,"y":r*8,"w":w*8,"h":h*8})
   elif types.has(ch):
    var e = {"type":types[ch],"x":c*8,"y":r*8,"w":8,"h":8}
    if ch=="s":
     e.y += 5
     e.h = 3
    elif ch=="_":
     e.y += 6
     e.h = 2
    room.entities.append(e)
 var zi = 0
 for group in groups:
  var e = {"x":group.x,"y":group.y,"w":group.w,"h":group.h}
  match group.ch:
   "A","B":
    e.type = "toggle"
    e.phase = 0 if group.ch=="A" else 1
    e.solid = group.ch=="A"
    e.body = groups.find(group)
   "K": e.type = "slide"
   "Z":
    e.type = "zip"
    var zips = definition.get("zips",[])
    var z = zips[zi] if zi<zips.size() else [0,-4]
    zi += 1
    e.tx = group.x+z[0]*8
    e.ty = group.y+z[1]*8
   "G": e.type = "gate"
   "H":
    e.type = "held"
    e.solid = true
   "M": e.type = "thru"
   "~": e.type = "crumble"
  room.entities.append(e)
 assert(room.spawn!=null,"Map needs a P spawn: "+definition.id)
 return room
static func glyph(d,c,r):
 if r>=d.map.size() or c>=d.map[r].length(): return "."
 return d.map[r][c]
