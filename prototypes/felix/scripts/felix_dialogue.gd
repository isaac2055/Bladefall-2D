extends RefCounted
## Narration follows the player through connected rooms instead of being cut off at the next door.
static func remaining(lines):
 var seconds=0.0
 for line in lines:
  if line.life>0: seconds=maxf(seconds,maxf(0,line.get("delay",0))+float(line.life))
 return seconds
static func append(lines,text,anchor,seconds):
 var delay=remaining(lines)
 lines.append({"text":text,"anchor":anchor,"life":seconds,"max":seconds,"delay":delay+.15 if delay>0 else 0.0})
