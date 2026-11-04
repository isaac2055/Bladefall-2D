extends RefCounted
## Felix himself: the ball of light and whatever the boy has imagined onto him so far.
## Shared by every chapter. A chapter's view calls draw() for the body, then adds its own
## costume or props around the returned center. Gifts: legs, cape, arms, face.

func draw(v,g):
 var p=v.sim.p
 var x=v.actor.x
 var y=v.actor.y
 var stretch=Vector2.ONE
 if p.state=="dash" and not v.reduced_motion: stretch=Vector2(1+.35*abs(p.dashDir.x),1+.35*abs(p.dashDir.y))
 var amount=v.squash*(.3 if v.reduced_motion else 1.0)
 stretch*=Vector2(1+amount,1/(1+amount))
 var bob=0.0 if g.legs else sin(v.clock*3)*1.2-1.5
 var center=Vector2(x+4,y+4.5+bob)
 var walking_now=p.onGround and p.state=="normal" and abs(p.vx)>10
 var cycle=v.walking/4.2
 # The sock cape trails from the back, red and white, faded while the dash is spent.
 if g.cape:
  var ready=p.dashes>0
  var root=center+Vector2(-p.facing*2.5,-1.5)
  var shift=root-v.plume[0]
  for i in range(1,v.plume.size()):
   var a=v.plume[i-1]+shift
   var b=v.plume[i]+shift
   var col=(Color("#d4504a") if i%2 else Color("#f3eee6")) if ready else (Color("#6d5a66") if i%2 else Color("#8a8494"))
   v.line(a,b,col,max(1.4,3.0-i*.25))
 # Legs: two little strokes to the floor.
 if g.legs:
  for side in [-1,1]:
   var stride=sin(cycle+(0.0 if side<0 else PI)) if walking_now else 0.0
   var hip=center+Vector2(side*1.4,2.8)
   var foot=Vector2(x+4+side*1.8+stride*1.6,y+11-max(0,-stride)*1.2)
   if not p.onGround: foot=hip+Vector2(side*1.2,3.5)
   v.line(hip,foot,"#fff7e2",.9)
   v.box(foot.x-.6,foot.y-.8,1.6,.9,"#fff7e2")
 # Arms: reach for the wall while climbing.
 if g.arms:
  for side in [-1,1]:
   var shoulder=center+Vector2(side*3.2,.6)
   var hand=shoulder+Vector2(side*2.2,1.8+sin(cycle+side)*(.8 if walking_now else .2))
   if p.state=="climb" and side==p.facing: hand=shoulder+Vector2(side*2.4,-2.2+sin(v.clock*10)*(.6 if abs(p.vy)>1 else 0))
   v.line(shoulder,hand,"#fff7e2",.8)
 # The light itself.
 v.ink.draw_set_transform_matrix(v.paint_transform*Transform2D(0,stretch,0,center))
 var pulse=sin(v.clock*2.2)*.3+v.gift_pulse*2.0
 v.circle(Vector2.ZERO,7+pulse,Color(1,.97,.85,.06))
 v.circle(Vector2.ZERO,5+pulse*.6,Color(1,.97,.85,.14))
 v.circle(Vector2.ZERO,3.6,"#fff6dc")
 v.circle(Vector2(-.8,-.9),2.2,"#ffffff")
 var slimed=clamp(float(p.get("pollen",0))/45.0,0,1)
 if slimed>0:
  v.circle(Vector2(0,.8),3.4,Color("#5fcf4a",.75*slimed))
  v.circle(Vector2(1.2,-1.4),1.1,Color("#c9ffb0",.8*slimed))
 if g.face:
  var f=p.facing
  v.box(-1.6+f*.7,-.6,.9,1.2,"#4a3a2e")
  v.box(.8+f*.7,-.6,.9,1.2,"#4a3a2e")
  v.ink.draw_arc(Vector2(f*.6,1),1.2,.3,PI-.3,6,Color("#4a3a2e")*v.ink_color,.5)
 v.ink.draw_set_transform_matrix(v.paint_transform)
 if slimed>0:
  for i in range(2):
   var age=fposmod(v.clock*1.6+i*.5,1.0)
   v.circle(center+Vector2(-1.5+i*3,3.5+age*5),.7,Color("#5fcf4a",(1-age)*slimed))
 if p.state=="climb":
  v.box(x+1,y-5,6,1,Color(0,0,0,.4))
  v.box(x+1,y-5,6*clamp(p.stamina/110,0,1),1,"#fff1c4")
 return center
