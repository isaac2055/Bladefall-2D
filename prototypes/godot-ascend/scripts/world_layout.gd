extends RefCounted
## Native world-only repairs. The original room fixtures remain intact for movement parity tests.
static func build(source):
 var world = source.duplicate(true)
 if int(world.n)==2:
  # The authored fork's bottom-left shaft is offset one tile from the kitchen roof.
  # Open its overlapping roof tile in the native world only; keep browser fixtures intact.
  for d in world.rooms:
   if d.id=="cl2-w2-kitchen":
    var roof=d.map[0]
    roof[5]="."
    d.map[0]=roof
  return world
 if int(world.n)!=1: return world
 # The browser drew the final junction over the Gatehouse and relied on room ownership.
 # Give the overlook its own rock above the road, reached by a real, reversible stairwell.
 for s in world.sections:
  if s.room=="cl1-atlas-crossroads":
   s.x=435
   s.y=-110
   s.fire={"c":5,"r":9}
 for d in world.rooms:
  if d.id=="cl1-atlas-crossroads":
   d.cols=40
   d.rows=16
   d.exit="none"
   d.erase("atlasSockets")
   d.map=[]
   for r in range(16):
    var row=""
    for c in range(40):
     var ch="."
     if r==0 or r>=10 or c==0: ch="#"
     if c==39 and (r<6 or r>9): ch="#"
     if r==9 and c==5: ch="P"
     row+=ch
    d.map.append(row)
   d.name="The Upper Watch"
   d.decor=[{"k":"mast","c":30,"r":9},{"k":"milestone","c":10,"r":9},{"k":"palisade","c":18,"r":9}]
  # The room's old implicit ceiling must be visible and solid, not an invisible grab wall.
  if d.id=="cl1-o1-lookout":
   var cap=d.map[0]
   for c in range(40): cap[c]="#"
   d.map[0]=cap
 # A six-tile-wide stairwell links the final gallery's upper mouth to the overlook.
 var stair={"id":"godot-overlook-stair","name":"The Watch Stair","cols":8,"rows":34,"exit":"none","map":[],"lock":["strike","parry","portal"],"dropThru":true,"decor":[{"k":"sconce","c":0,"r":7},{"k":"sconce","c":0,"r":16},{"k":"sconce","c":0,"r":25}]}
 for r in range(34):
  var row=""
  for c in range(8):
   var ch="#" if c==0 or c==7 or r==0 or r==33 else "."
   if r in [6,7,8,9] and c==0: ch="."
   if r in [29,30,31,32] and c==7: ch="."
   if r in [10,13,16,19,22,25,28,31] and c in [1,2,3,4]: ch="="
   if r==32 and c==4: ch="P"
   row+=ch
  stair.map.append(row)
 world.rooms.append(stair)
 world.sections.append({"room":stair.id,"x":474,"y":-110,"fire":null,"connector":true})
 return world
