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
# Isaac at seven, authored at 56 px tall: tuft, cheeks, stripes and weekend backpack.
for mood in ['look','asleep']:
 im,d=new(18,20)
 d.polygon([(3,6),(14,6),(16,10),(15,15),(12,18),(6,18),(2,14),(1,10)],fill='#c79583')
 d.polygon([(4,7),(13,7),(15,10),(13,15),(10,17),(5,15),(3,12)],fill='#e7b99a')
 d.polygon([(4,8),(8,6),(12,8),(12,11),(5,11)],fill='#f7d4ac')
 d.polygon([(1,10),(1,6),(4,3),(7,2),(10,0),(11,3),(14,3),(17,7),(16,12),(13,7),(9,8),(6,6),(3,10)],fill='#50373b')
 d.line([(3,6),(6,4),(10,4),(13,5)],fill='#81594c')
 d.point((6,3),fill='#a27457')
 for x in [3,13]:d.point((x,13),fill='#d99688')
 if mood=='asleep':
  d.line([(4,11),(6,11)],fill='#58414a');d.line([(11,11),(13,11)],fill='#58414a')
 else:
  for x in [5,12]:
   d.line([(x,10),(x,12)],fill='#403440');d.point((x,10),fill='#fff1d5')
 d.line([(7,14),(8,15),(10,14)],fill='#855251')
 save(im,'boy-head-'+mood)
im,d=new(12,18);d.polygon([(2,0),(9,0),(11,4),(11,17),(0,17),(0,4)],fill='#ad584b')
d.rectangle((1,2,9,16),fill='#cf7659');d.line([(1,3),(1,15)],fill='#e4916a')
for y in [4,10,16]:d.rectangle((1,y,10,y+1),fill='#efdbb2')
d.polygon([(4,0),(6,2),(8,0)],fill='#d9aa8f');save(im,'boy-shirt')
im,d=new(4,21);d.rectangle((0,0,3,5),fill='#425b79');d.line([(1,0),(1,4)],fill='#64809a')
d.rectangle((1,6,2,17),fill='#d5aa8d');d.line([(1,6),(1,15)],fill='#edc4a0')
d.rectangle((0,18,3,20),fill='#41688d');d.line([(0,19),(3,19)],fill='#bbc3c5');save(im,'boy-leg')
im,d=new(4,16);d.rectangle((0,0,3,3),fill='#c56f55');d.rectangle((1,4,2,14),fill='#e4b696')
d.line([(1,4),(1,12)],fill='#f4ccaa');d.rectangle((0,14,2,15),fill='#d2a38e');save(im,'boy-arm')
im,d=new(8,15);d.rectangle((0,1,6,14),fill='#3b6555');d.rectangle((1,2,5,12),fill='#6d8a62')
d.line([(2,3),(4,3)],fill='#a6ad7c');d.rectangle((2,9,6,12),fill='#4d7359');d.point((4,9),fill='#c6bc8c');save(im,'boy-pack')
im,d=new(26,25);d.polygon([(7,0),(18,0),(19,15),(6,15)],fill='#c37157')
for y in [3,8,13]:d.rectangle((7,y,17,y+1),fill='#ead7b0')
d.rectangle((6,16,19,19),fill='#486582')
d.polygon([(7,19),(1,23),(0,24),(9,24),(12,19)],fill='#dcb190')
d.polygon([(16,18),(17,23),(23,23),(22,20),(20,18)],fill='#dcb190')
d.line([(0,24),(8,24)],fill='#46698c');d.line([(17,24),(24,24)],fill='#46698c');save(im,'boy-kneel')
# Right-facing curled pose, at the same native scale as the standing boy.
im,d=new(47,23)
d.polygon([(12,7),(31,6),(34,11),(31,18),(11,18)],fill='#ba6a56')
for y in [10,15]:d.rectangle((12,y,31,y+1),fill='#e6d4b1')
d.polygon([(11,12),(5,14),(2,18),(5,21),(15,17)],fill='#4b6380')
d.line([(5,19),(1,21),(4,22)],fill='#cda48c',width=2)
d.line([(2,22),(5,22)],fill='#567e9c',width=1)
d.polygon([(33,5),(42,5),(46,10),(45,16),(41,20),(35,20),(31,16),(30,10)],fill='#ddb49b')
d.polygon([(30,12),(30,7),(33,3),(38,1),(41,3),(44,4),(46,8),(46,12),(42,8),(38,9),(35,7),(32,12)],fill='#5f4141')
d.line([(33,12),(35,12)],fill='#5a4249');d.line([(41,12),(43,12)],fill='#5a4249')
d.point((43,16),fill='#cf9386');d.line([(27,12),(29,18),(35,18)],fill='#e5ba97',width=2)
save(im,'boy-asleep')
# Stepped translucent ellipse: a contact shadow, drawn above the ground line.
im,d=new(22,5)
for y,left,right,a in [(0,6,15,16),(1,2,19,38),(2,0,21,65),(3,2,19,42),(4,6,15,18)]:
 d.line([(left,y),(right,y)],fill=(18,27,29,a))
save(im,'boy-shadow')
# A 116 px seated adult, slightly smaller than the original 128 px Dad. The doorway silhouettes his profile;
# the face has no eyes, mouth, skin color or illuminated facial plane.
for state,rim in [('warm','#d3b582'),('cold','#89a9c4')]:
 im,d=new(84,116)
 outline='#141c27';shirt='#222c36';fold='#2d3742';denim='#263342'
 # Far shoe and bent leg, visible under the near knee.
 d.polygon([(43, 90), (54, 89), (56, 105), (65, 110), (65, 114), (47, 114), (44, 108)], fill=outline)
 d.polygon([(47, 94), (52, 94), (52, 107), (58, 110), (48, 110)], fill='#202c3b')
 # Back, rounded shoulder, shirt hem and seated hip.
 d.polygon([(28, 28), (38, 28), (41, 34), (49, 35), (55, 43), (53, 61), (47, 74), (47, 87), (41, 94), (23, 94), (18, 89), (19, 63), (19, 46), (23, 37)], fill=outline)
 d.polygon([(26, 37), (36, 34), (46, 40), (48, 58), (42, 75), (43, 86), (24, 87), (23, 72), (23, 49)], fill=shirt)
 d.line([(24, 57), (26, 69), (25, 80)], fill=fold)
 d.line([(29, 83), (37, 84)], fill='#3a4149')
 # Thigh turns into the knee, with a distinct shin and grounded boot.
 d.polygon([(35, 81), (49, 81), (65, 87), (72, 92), (73, 99), (72, 110), (80, 111), (83, 114), (82, 115), (61, 115), (59, 111), (60, 99), (55, 97), (37, 96), (29, 93)], fill=outline)
 d.polygon([(38, 84), (50, 86), (65, 92), (67, 95), (65, 108), (61, 109), (62, 97), (55, 94), (37, 93)], fill=denim)
 d.line([(42, 87), (58, 90), (65, 94)], fill='#3b4653')
 d.line([(68, 99), (67, 108)], fill='#414a57')
 d.line([(64, 113), (79, 113)], fill='#3a414a')
 # Neck and slightly bowed, stepped head profile; no facial features.
 d.polygon([(30, 21), (40, 23), (40, 35), (32, 38), (28, 32)], fill=outline)
 d.polygon([(26, 6), (30, 2), (37, 0), (43, 5), (46, 11), (46, 14), (48, 17), (46, 20), (44, 26), (38, 31), (31, 28), (28, 21), (25, 14)], fill=outline)
 d.polygon([(28, 8), (31, 3), (37, 2), (41, 5), (32, 5), (29, 11)], fill='#25303b')
 # Far arm rests on the lap; near arm bends gently to the flashlight hand.
 d.polygon([(23, 43), (28, 44), (26, 67), (34, 75), (42, 78), (42, 83), (31, 83), (22, 75), (20, 67)], fill='#1c2632')
 d.line([(24, 52), (24, 67), (30, 75)], fill='#34404a')
 d.polygon([(43, 40), (49, 41), (53, 49), (52, 60), (55, 64), (65, 63), (68, 66), (66, 71), (53, 72), (47, 67), (43, 55)], fill=outline)
 d.polygon([(46, 44), (48, 46), (49, 57), (48, 61), (53, 67), (62, 66), (62, 69), (52, 69), (46, 63)], fill=shirt)
 d.line([(53, 71), (60, 71)], fill='#40464c')
 # Light catches the back, shoulder seam and edge of the knees, never the face.
 d.line([(28, 6), (26, 11), (26, 17)], fill=rim)
 d.line([(28, 25), (30, 29), (28, 34), (24, 37), (22, 43), (20, 54), (20, 69)], fill=rim)
 d.line([(23, 86), (23, 90), (29, 93)], fill=rim)
 d.line([(42, 83), (52, 84), (64, 89)], fill=rim)
 d.point((66, 92), fill=rim)
 save(im,'dad-'+state)
# Right-pointing flashlight, small enough to sit inside the curled hand.
im,d=new(14,6);d.rectangle((0,1,9,4),fill='#364251');d.line([(1,2),(8,2)],fill='#677c90')
d.rectangle((9,0,13,5),fill='#7991a5');d.rectangle((10,1,13,4),fill='#cadbe0')
d.line([(13,1),(13,4)],fill='#f0f2da');save(im,'flashlight')
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

# Twenty native 8x8 tiles, using the base view's exact atlas indices. There are
# no masonry seams: sparse root strands connect the irregular soil clusters.
atlas=Image.new('RGBA',(160,8))
for v in range(20):
 im,d=new(8,8)
 if v==15:
  d.line([(0,1),(3,1),(5,0),(7,0)],fill='#af956a')
  d.line([(0,2),(4,2),(6,1),(7,1)],fill='#6f5743')
  d.line([(0,3),(3,3),(5,2),(7,2)],fill='#44392f')
  d.line([(3,2),(4,4)],fill='#6f5743');d.point((4,3),fill='#b09b6b')
 else:
  deep=v>=16
  base=['#514336','#574838','#4c4035','#544536'][v%4]
  if deep:base=['#332f2a','#37312b','#302e2a','#39322a'][v%4]
  d.rectangle((0,0,7,7),fill=base)
  # Soil clods and leaf litter; deliberately no regular border or mortar line.
  for x,y in [(1,2),(5,5),(6,1)]:
   x=(x+v*3)%8;y=(y+v)%8
   d.line([(x,y),(min(7,x+1),y)],fill='#423a30' if not deep else '#2c2a26')
   if not deep:d.point(((x+1)%8,(y+1)%8),fill='#756044')
  if v in [0,1,2,3]:
   for x in range(8):
    d.point((x,0),fill=['#8b985b','#a2aa70','#6b8050','#8e9a62'][(x+v)%4])
    d.point((x,1),fill='#596a43' if (x+v)%3 else '#7a8850')
    if (x+v)%3==0:d.point((x,2),fill='#55633b')
   d.line([(1,4),(2,6),(4,7)],fill='#8b714b')
  elif v in [8,9]:
   x=0 if v==8 else 7;side=1 if v==8 else -1
   d.line([(x,0),(x+side,3),(x,6),(x,7)],fill='#9b8055')
   d.line([(x+side,0),(x+side*2,3),(x+side,7)],fill='#6e573c')
   d.point((x+side*3,5),fill='#82905b')
  elif v==10:
   d.line([(0,6),(3,5),(5,6),(7,5)],fill='#8d724c')
   d.line([(0,7),(3,6),(5,7),(7,6)],fill='#3c342c')
  elif v in [4,11,13,17]:
   root='#776044' if not deep else '#504333'
   d.line([(2,0),(2,2),(3,4),(2,7)],fill=root)
   d.line([(3,4),(5,5),(7,5)],fill=root)
   if not deep:d.point((2,1),fill='#8d724f')
  elif v in [6,12,14]:
   d.line([(0,3),(3,3),(5,5),(7,5)],fill='#6a543b')
   d.point((4,4),fill='#806a4a')
 atlas.paste(im,(v*8,0))
save(atlas,'terrain')
# Wooden foreground rails and a root-bound block, at their original tile size.
im=atlas.crop((15*8,0,16*8,8));d=ImageDraw.Draw(im)
d.line([(3,3),(3,7)],fill='#796446');d.point((4,6),fill='#ac9465');save(im,'twig-rail')
im=atlas.crop((4*8,0,5*8,8));d=ImageDraw.Draw(im)
d.line([(0,1),(3,2),(5,4),(7,4)],fill='#af8c59')
d.line([(5,0),(5,3),(4,6),(4,7)],fill='#7d623f');save(im,'bark-block')
# Thorns retain the two sharp tips and full 8x8 hazard envelope in all directions.
im,d=new(8,8)
d.line([(0,7),(3,6),(7,7)],fill='#69504b')
for x in [0,4]:
 d.polygon([(x,7),(x+1,4),(x+2,0),(x+2,4),(min(7,x+4),7)],fill='#9d7f70')
 d.line([(x+2,0),(x+1,5)],fill='#e0c5a1')
 d.line([(x+2,4),(min(7,x+3),5)],fill='#c6a382')
 d.point((x+2,6),fill='#55433c')
save(im,'thorn-3');save(im.transpose(Image.Transpose.FLIP_TOP_BOTTOM),'thorn-4')
save(im.transpose(Image.Transpose.TRANSPOSE),'thorn-5');save(im.transpose(Image.Transpose.ROTATE_270),'thorn-6')
