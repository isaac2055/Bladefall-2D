"""Chapter Two's authored pixel sprites. Rebuild from the Felix folder with Pillow.
Coordinates are world pixels. Runtime draws committed PNGs; no imaging dependency in-game.
"""
from pathlib import Path
from PIL import Image, ImageDraw
R=Path(__file__).resolve().parent/'woods'
R.mkdir(exist_ok=True)
def new(w,h):
 im=Image.new('RGBA',(w,h));return im,ImageDraw.Draw(im)
def save(im,name): im.save(R/(name+'.png'))
def pattern(name,rows,p):
 assert len(set(map(len,rows)))==1,name
 im,d=new(len(rows[0]),len(rows))
 for y,row in enumerate(rows):
  for x,c in enumerate(row):
   if c!='.':d.point((x,y),fill=p[c])
 save(im,name)
# The gifts remain small enough for the shared 8 x 9 body seam.
card=dict(h='#f1d49e',m='#c99e69',s='#987349',d='#725548',r='#c75d63',p='#eb8d7e')
pattern('helmet',['....p....','...pr....','...rr....','..hhhhh..','.hhmmmhh.','hmmmsmmmh','hmsmmmsmh','hdddddddh','.ss...ss.'],card)
pattern('helmet-down',['..hhhhh..','.hhmmmhh.','hmmmsmmmh','hdddddddh','.ss...ss.','.........'],card)
pattern('sword',['..h........','..m........','ddmhhhhhhm.','..dmmmmmmms','..s........'],dict(h='#e6c18d',m='#ad8055',s='#6b554b',d='#7e5e46'))
pattern('sword-down',['..h.........','ddmhhhhhhhhm','..dmmmmmmmms','..s.........'],dict(h='#e6c18d',m='#ad8055',s='#6b554b',d='#7e5e46'))
# Isaac at seven: the same hair tuft and warm cheeks, in weekend clothes.
for mood in ['look','asleep']:
 im,d=new(24,28)
 d.polygon([(4,9),(19,9),(21,14),(20,21),(16,25),(9,25),(4,22),(2,16)],fill='#c18f83')
 d.polygon([(5,9),(18,10),(20,14),(18,21),(14,23),(8,22),(4,18)],fill='#e7b99a')
 d.polygon([(5,12),(11,9),(17,12),(17,16),(7,17)],fill='#f7d4ac')
 d.polygon([(2,15),(2,8),(5,4),(10,3),(13,0),(15,4),(19,4),(22,9),(21,16),(17,10),(12,11),(8,8),(5,12)],fill='#50373b')
 d.polygon([(4,9),(7,5),(12,5),(15,6),(18,5),(20,9),(14,8),(10,9),(7,7)],fill='#785249')
 d.line([(6,6),(10,4)],fill='#9c6c53')
 d.rectangle((4,18,6,19),fill='#d99688');d.rectangle((16,18,18,19),fill='#d99688')
 if mood=='asleep':
  d.line([(6,16),(9,16)],fill='#58414a');d.line([(15,16),(18,16)],fill='#58414a')
 else:
  for x in [7,16]:
   d.rectangle((x,14,x+1,16),fill='#403440');d.point((x,14),fill='#fff1d5')
 d.line([(10,20),(12,21),(14,20)],fill='#855251')
 save(im,'boy-head-'+mood)
im,d=new(18,25);d.rectangle((0,0,17,24),fill='#ad584b')
d.rectangle((1,1,14,23),fill='#cf7659');d.rectangle((1,0,3,23),fill='#e4916a')
for y in [5,13,21]:d.rectangle((1,y,15,y+2),fill='#efdbb2')
d.polygon([(5,0),(9,3),(13,0)],fill='#b18b77');d.line([(2,24),(16,24)],fill='#92544a');save(im,'boy-shirt')
im,d=new(6,31);d.rectangle((0,0,5,9),fill='#425b79');d.rectangle((1,0,3,7),fill='#64809a')
d.rectangle((1,9,4,26),fill='#d5aa8d');d.line([(1,10),(1,24)],fill='#edc4a0')
d.rectangle((0,26,5,30),fill='#41688d');d.line([(0,29),(5,29)],fill='#bbc3c5');save(im,'boy-leg')
im,d=new(5,22);d.rectangle((0,0,4,4),fill='#c56f55');d.rectangle((1,5,3,20),fill='#e4b696')
d.line([(1,5),(1,18)],fill='#f4ccaa');d.rectangle((0,19,3,21),fill='#d2a38e');save(im,'boy-arm')
im,d=new(11,21);d.rectangle((1,1,9,20),fill='#3b6555');d.rectangle((2,2,7,17),fill='#6d8a62')
d.line([(3,3),(6,3)],fill='#a6ad7c');d.rectangle((3,12,8,17),fill='#4d7359')
d.point((5,12),fill='#c6bc8c');save(im,'boy-pack')
im,d=new(36,37);d.polygon([(9,0),(25,0),(26,23),(8,23)],fill='#c37157')
for y in [5,13,20]:d.rectangle((9,y,24,y+2),fill='#ead7b0')
d.rectangle((8,23,26,28),fill='#486582')
d.polygon([(9,28),(1,34),(0,36),(11,36),(17,29)],fill='#dcb190')
d.polygon([(22,27),(24,35),(32,35),(31,31),(28,26)],fill='#dcb190')
d.line([(0,36),(10,36)],fill='#46698c');d.line([(24,36),(33,36)],fill='#46698c');save(im,'boy-kneel')
im,d=new(64,30)
# Curled sideways; the face is small, with closed eyes, never a floating giant head.
d.polygon([(19,10),(42,8),(47,14),(44,23),(19,23)],fill='#ba6a56')
for y in [13,20]:d.rectangle((22,y,44,y+2),fill='#e6d4b1')
d.polygon([(44,16),(52,18),(56,23),(53,27),(45,23)],fill='#4b6380')
d.line([(53,24),(59,25),(61,28)],fill='#cda48c',width=4)
d.line([(61,28),(63,28)],fill='#567e9c',width=2)
d.ellipse((1,2,22,23),fill='#d8ad94')
d.polygon([(1,14),(1,7),(5,2),(13,0),(20,4),(22,10),(16,8),(10,10),(6,7)],fill='#5f4141')
d.line([(5,13),(8,13)],fill='#5a4249');d.line([(14,13),(17,13)],fill='#5a4249')
d.point((6,17),fill='#cf9386');d.line([(25,15),(20,22),(13,23)],fill='#e5ba97',width=3)
save(im,'boy-asleep')
# Dad has no eyes, mouth or face detail: only a seated silhouette and a backlit edge.
for state,rim in [('warm','#e1b978'),('cold','#8eafcb')]:
 im,d=new(104,128)
 def pts(p):return [(x+66,y+128) for x,y in p]
 body='#171c29';shade='#202637'
 for p in [
  [(-63,-1),(-63,-10),(-49,-15),(-33,-13),(-32,-1)],
  [(-51,-12),(-38,-13),(-37,-60),(-49,-65),(-56,-58)],
  [(-52,-65),(-45,-76),(19,-43),(24,-24),(12,-25),(-41,-57)],
  [(1,-23),(25,-24),(25,-83),(12,-94),(-5,-88),(-2,-58)],
  [(-3,-84),(4,-91),(7,-78),(-37,-72),(-50,-75),(-52,-82)],
 ]:d.polygon(pts(p),fill=body)
 d.rectangle((63,27,76,44),fill=body)
 d.ellipse((48,5,74,32),fill=body)
 d.polygon([(54,7),(60,2),(68,4),(73,10),(70,13)],fill=body)
 d.polygon(pts([(12,-83),(19,-82),(21,-35),(14,-33)]),fill=shade)
 d.line(pts([(18,-91),(24,-83),(24,-29)]),fill=rim,width=2)
 d.arc((48,5,74,32),260,45,fill=rim,width=1)
 d.line(pts([(-44,-73),(-19,-61),(17,-42)]),fill=rim,width=1)
 d.line(pts([(-62,-3),(-34,-3)]),fill='#303346')
 d.line(pts([(-50,-15),(-45,-56)]),fill='#2d3448')
 save(im,'dad-'+state)
pattern('flashlight',['..hhhh............','hhssshdddddddddddd','hwwwwhmmmmmmmmmmms','hwwwwhmmmmmmmmmmms','hhssshdddddddddddd','..ssss............'],
 dict(h='#b2cad9',s='#647f9b',w='#eff4de',m='#333c50',d='#222b3d'))
# Cabin details are deliberately brought into the porch framing, on the same background wall.
for lit in [True,False]:
 im,d=new(300,320)
 d.rectangle((0,0,299,319),fill='#332d30')
 for y in range(0,320,22):
  d.rectangle((0,y,299,y+18),fill='#665044' if (y//22)%2==0 else '#59483e')
  d.line([(0,y),(299,y)],fill='#8c7056');d.line([(0,y+18),(299,y+18)],fill='#382f2e')
  for x in range(8,300,43):
   d.line([(x,y+5),(min(x+23,299),y+5)],fill='#755c49')
   d.line([(x+4,y+12),(min(x+34,299),y+12)],fill='#493b35')
  for x in [3,289]:
   d.ellipse((x-7,y+1,x+10,y+17),fill='#80654d');d.ellipse((x-3,y+4,x+7,y+14),outline='#574639')
 # Door and threshold.
 d.rectangle((158,133,245,319),fill='#302c35')
 d.rectangle((162,137,241,319),fill='#a17e59' if lit else '#526078')
 d.rectangle((166,141,237,317),fill='#e0b377' if lit else '#1d2b42')
 d.rectangle((169,144,233,316),fill='#edcb8a' if lit else '#25334b')
 d.rectangle((173,147,229,214),fill='#f3dca3' if lit else '#2c3c56')
 d.line([(167,140),(167,315)],fill='#f7e2b0' if lit else '#8795a7')
 # Window, visible beside Dad, with four panes.
 d.rectangle((247,184,297,252),fill='#2a2932');d.rectangle((250,187,294,249),fill='#a38565' if lit else '#66778b')
 for xx in [253,275]:
  for yy in [190,221]:
   d.rectangle((xx,yy,xx+17,yy+26),fill='#eac48a' if lit else '#293b54')
   d.line([(xx+1,yy+2),(xx+15,yy+2)],fill='#f7e0a4' if lit else '#647c95')
 d.rectangle((271,189,274,247),fill='#594a42')
 # Rope lights sag subtly across the wall. Off means visible glass, not emitting bulbs.
 last=None
 for i in range(11):
  x=100+i*18;y=177+(i%4 in [1,2])*3
  if last:d.line([last,(x,y)],fill='#423b3d')
  col=('#ffe0a0' if i%2==0 else '#e9a57e') if lit else '#5b6c80'
  d.line([(x,y),(x,y+2)],fill='#56505a');d.rectangle((x-1,y+3,x+1,y+5),fill=col)
  if lit:d.point((x,y+3),fill='#fff0c1')
  last=(x,y)
 # Carved sign; exact lettering is retained in the view's marker call.
 d.rectangle((110,188,244,212),fill='#352f31');d.rectangle((112,189,242,210),fill='#b5956b' if lit else '#6a737a')
 d.line([(114,191),(239,191)],fill='#dcc297' if lit else '#99a0a1')
 for x in [115,238]:d.point((x,207),fill='#514846')
 # Step, edge wear and large plank ends.
 d.rectangle((140,296,289,319),fill='#675244');d.rectangle((140,296,289,298),fill='#a58a69')
 d.rectangle((142,301,287,316),fill='#57453c')
 for x in [152,194,237,278]:
  d.line([(x,301),(x,316)],fill='#332f30');d.line([(x+3,303),(min(x+25,287),303)],fill='#7b6049')
 save(im,'cabin-on' if lit else 'cabin-off')
# Daylight is in the sky and tree palette, not a color wash over the play plane.
for name,top,bottom in [('afternoon',(76,103,100),(180,175,119)),('dusk',(48,59,86),(151,113,108)),('night',(13,23,42),(47,68,82))]:
 im,d=new(320,184)
 for y in range(184):
  t=y/183;col=tuple(int(a+(b-a)*t)//4*4 for a,b in zip(top,bottom))
  d.line([(0,y),(319,y)],fill=col)
  if y%4==0:
   for x in range((y//4)%2,320,8):d.point((x,y),fill=tuple(min(255,c+3) for c in col))
 save(im,'sky-'+name)
im,d=new(20,20);d.ellipse((0,0,19,19),fill='#cfa875');d.ellipse((2,1,18,17),fill='#f0d5a0');save(im,'sun')
im,d=new(96,32)
d.polygon([(0,29),(0,21),(9,21),(9,15),(18,15),(18,9),(31,9),(31,5),(47,5),(47,12),(60,12),(60,18),(75,18),(75,22),(95,22),(95,31),(0,31)],fill='#53667d')
d.line([(10,23),(28,23),(28,19),(55,19)],fill='#718195')
save(im,'cloud')
im,d=new(320,184)
for x in [198,237,282]:
 d.polygon([(x,0),(x+9,0),(x-75,184),(x-115,184)],fill=(255,219,150,18))
save(im,'shafts')
# Stepped foliage clusters and bark chips: three authored tree silhouettes.
for variant in range(3):
 im,d=new(64,184)
 d.polygon([(26,0),(38,0),(36,125),(44,183),(18,183),(25,128)],fill='#3e5a50')
 d.polygon([(28,6),(31,5),(29,150),(24,179),(22,179)],fill='#65806a')
 for y in [20,58,103,143]:
  d.line([(29,y),(35,y-3)],fill='#849078');d.line([(25,y+6),(29,y+3)],fill='#293f40')
 for j,(cx,cy) in enumerate([(24,21),(36,45),(20,76),(38,101)]):
  cx+=(-3 if variant==1 else 2 if variant==2 else 0)
  d.polygon([(31,cy+14),(cx-17,cy-4),(cx-19,cy-6),(cx-15,cy-8),(34,cy+6)],fill='#3b564b')
  pts=[(cx-25,cy+3),(cx-25,cy-4),(cx-20,cy-4),(cx-20,cy-10),(cx-12,cy-10),(cx-12,cy-15),(cx-3,cy-18),(cx+8,cy-15),(cx+8,cy-10),(cx+18,cy-10),(cx+18,cy-4),(cx+25,cy-4),(cx+25,cy+4),(cx+18,cy+4),(cx+18,cy+9),(cx+4,cy+11),(cx-6,cy+8),(cx-18,cy+10)]
  d.polygon(pts,fill=['#496951','#527257','#42644f'][variant])
  for xx,yy in [(cx-12,cy-8),(cx+2,cy-12),(cx+10,cy-3),(cx-3,cy+4)]:
   d.polygon([(xx-5,yy),(xx-2,yy-2),(xx+4,yy-2),(xx+6,yy),(xx+2,yy+2)],fill='#6f865f')
   d.line([(xx,yy),(xx+3,yy)],fill='#88956d')
 save(im,'tree-'+str(variant))
# Light cone and landing pool: transparent edge pixels, no gold finish flag.
im,d=new(64,192)
for y in range(192):
 half=3+y/191*28
 for x in range(64):
  e=max(0,1-abs(x-31.5)/half)
  a=int(34*e*(.4+.6*y/191))
  if a:d.point((x,y),fill=(179,209,238,a))
save(im,'beam')
im,d=new(48,8)
for y in range(8):
 for x in range(48):
  e=max(0,1-((x-23.5)/24)**2-((y-3.5)/5)**2)
  d.point((x,y),fill=(192,222,245,int(e*85)))
save(im,'pool')
pattern('lantern',['....sss....','...shhs....','...s..s....','..sssssss..','..shhhhhs..','..swsswws..','..swmhmws..','..swmhmws..','..swmhmws..','..swmhmws..','..swmhmws..','..shhhhhs..','..sssssss..','....sss....','...........'],dict(s='#536d91',h='#c5daec',w='#edf1d3',m='#9ac4d3'))
pattern('mote',['.h.','hhh','.h.'],dict(h='#d7e7e4'))
pattern('rain-0',['.h','.h','.m','.m','m.','m.','s.','..'],dict(h='#bed6e7',m='#7b9fb9',s='#527a97'))
pattern('rain-1',['.h','.h','.m','.m','.m','.m','m.','m.','s.','s.','..','..'],dict(h='#c9dfed',m='#8dafc5',s='#5f839e'))
pattern('splash',['.h..h.','h.mm.h','..mm..'],dict(h='#acc8d9',m='#7497b0'))
im,d=new(32,184)
d.line([(26,0),(17,42),(23,42),(10,91),(16,89),(4,141),(9,138),(0,183)],fill='#d6e7ee',width=2)
d.line([(16,64),(28,82),(31,117)],fill='#a3c8dd')
save(im,'lightning')
# Firefly scale cues. These are background dressing, never collidable objects.
im,d=new(38,34)
d.line([(18,33),(19,14),(22,1)],fill='#729268')
for y,w in [(6,5),(11,9),(16,13),(22,17),(28,13)]:
 for side in [-1,1]:
  d.polygon([(19,y+2),(19+side*w,y-5),(19+side*(w-3),y+1),(19,y+5)],fill='#496d55')
  d.line([(19,y+2),(19+side*(w-2),y-2)],fill='#839763')
save(im,'fern')
im,d=new(44,23)
d.polygon([(1,22),(10,9),(20,2),(29,0),(40,5),(43,11),(36,18),(19,21)],fill='#4e7657')
d.line([(2,22),(19,13),(39,5)],fill='#8b9c69',width=2)
for x,y in [(12,15),(22,11),(31,7)]:
 d.line([(x,y),(x-1,y-7)],fill='#759361');d.line([(x,y),(x+7,y+1)],fill='#759361')
save(im,'leaf')
im,d=new(30,32);d.polygon([(13,11),(18,10),(18,27),(24,31),(9,31),(12,25)],fill='#d0bf9d')
d.polygon([(2,14),(2,10),(6,10),(6,6),(11,3),(18,1),(24,5),(27,9),(29,14)],fill='#9b685a')
d.line([(3,14),(27,14)],fill='#e3c7a1',width=2)
for x,y in [(11,7),(20,8),(22,11)]:d.rectangle((x,y,x+2,y+1),fill='#d3ac8b')
d.line([(14,17),(14,26)],fill='#ead6b0');save(im,'mushroom')
im,d=new(14,18);d.ellipse((2,4,12,17),fill='#a78052')
d.polygon([(3,7),(11,7),(10,14),(7,17),(4,14)],fill='#c4a06b')
d.line([(6,9),(6,14)],fill='#e0ba80')
d.polygon([(0,6),(2,3),(5,2),(8,2),(12,4),(13,7),(0,7)],fill='#6c6250')
for x in [2,5,8,11]:d.point((x,5),fill='#9a8d63')
d.line([(7,1),(8,0)],fill='#7e7353');save(im,'acorn')
im,d=new(16,20)
for points in [[(7,19),(0,6),(2,8),(8,18)],[(8,19),(5,0),(8,6),(10,19)],[(9,19),(15,4),(14,12),(11,19)]]:
 d.polygon(points,fill='#4f795c')
d.line([(8,19),(6,4)],fill='#8c9f6c');save(im,'grass')
# The boy's secret drawing, with a red pin and crayon Sir Felix.
im,d=new(18,17);d.polygon([(1,1),(16,1),(17,3),(16,15),(14,16),(0,15)],fill='#eee1be')
d.rectangle((8,0,9,2),fill='#c36566')
d.ellipse((4,5,11,12),fill='#e8c680');d.ellipse((5,6,10,10),fill='#fff0bd')
d.line([(5,5),(5,3),(10,3),(11,5)],fill='#a58665')
d.line([(8,3),(8,2)],fill='#c36566')
for x in [6,9]:d.point((x,8),fill='#705a66')
d.line([(7,10),(8,11),(9,10)],fill='#705a66')
d.line([(5,12),(4,14)],fill='#705a66');d.line([(10,12),(11,14)],fill='#705a66')
d.line([(11,10),(15,5)],fill='#a58665');d.line([(3,8),(1,10)],fill='#bd6572')
save(im,'drawing')
