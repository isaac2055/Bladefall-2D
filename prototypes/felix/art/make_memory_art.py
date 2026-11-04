"""Ten 22px memory photographs; paper, tiny portraits and distinct family outings.
Rebuild via make_prop_art.py. All coordinates are authored world pixels.
"""
from pathlib import Path
from PIL import Image, ImageDraw
R = Path(__file__).resolve().parent
TITLES = ['A day at the beach', 'Birthday candles', 'Camping together', 'Our snowman',
          'In the garden', 'A road trip', 'Home on the sofa', 'At the zoo',
          'Out on the lake', 'The yellow kite']
SKY = ['#87c2d7','#b18ca6','#89b5c2','#a7c4d0','#8bbec5',
       '#b4c9ca','#baa0a5','#a5c6be','#a6becf','#e2bc8b']
GROUND = ['#dbc590','#bd947a','#8b9b78','#e5e3db','#809d6b',
          '#86908d','#a38683','#86a877','#729aaa','#97ad79']

def family(d, y=8):
    # Hair, cheeks, clothes and two feet make three separate portraits readable.
    for x, top, shirt, hair in [(3,y,'#55768c','#5e4e4e'),
                                (7,y-1,'#ac7180','#785755'),
                                (11,y+2,'#e2c17e','#82614b')]:
        short = x==11
        d.rectangle((x,top,x+2,top+2), fill='#edc2a2')
        d.line([(x,top),(x+2,top)],fill=hair)
        d.point((x+2,top+1),fill='#745b60')
        bottom = min(14, top+(4 if short else 6))
        d.rectangle((x,top+3,x+2,bottom),fill=shirt)
        d.point((x,top+3),fill='#d5c5b6')
        if bottom<14:
            d.point((x,bottom+1),fill='#5e6277')
            d.point((x+2,bottom+1),fill='#5e6277')

def make_memories():
    for i in range(10):
        im=Image.new('RGBA',(22,22));d=ImageDraw.Draw(im)
        d.rectangle((0,0,21,21),fill='#e2d3b7')
        d.rectangle((0,0,20,20),fill='#f5edda')
        d.line([(1,0),(20,0)],fill='#fff9e9')
        d.rectangle((1,1,20,15),fill='#8a8083')
        d.rectangle((2,2,19,14),fill=SKY[i])
        d.rectangle((2,11,19,14),fill=GROUND[i])
        if i==0:
            d.rectangle((2,8,19,10),fill='#619cae')
            d.line([(2,10),(7,10),(9,9),(14,9),(15,10),(19,10)],fill='#d5dfcd')
            d.rectangle((15,3,17,5),fill='#f5df9b')
            d.polygon([(15,11),(18,11),(17,8)],fill='#b97b78')
            d.point((17,9),fill='#f0d19f')
        elif i==1:
            for x,y in [(3,3),(8,4),(13,3),(18,5)]:
                d.point((x,y),fill='#e4bf8d')
            d.rectangle((14,10,19,13),fill='#f1d5c4')
            d.line([(14,10),(19,10)],fill='#c18698')
            d.point((15,12),fill='#ad7891');d.point((18,12),fill='#ad7891')
            for x in [15,18]:
                d.line([(x,8),(x,9)],fill='#eee2c8');d.point((x,7),fill='#f6d17f')
        elif i==2:
            for x in [2,8,18]:
                d.line([(x,4),(x,10)],fill='#6e7f75')
                d.polygon([(x,2),(x-2,7),(x+2,7)],fill='#5f8680')
            d.polygon([(12,12),(16,6),(20,12)],fill='#cc9d82')
            d.polygon([(16,7),(16,12),(19,12)],fill='#916c70')
            d.rectangle((13,13,19,14),fill='#ae8390')
        elif i==3:
            for x,y in [(4,3),(10,5),(17,3),(3,9)]:d.point((x,y),fill='#f4efe1')
            d.ellipse((14,9,19,14),fill='#f6f1e5')
            d.rectangle((15,6,18,9),fill='#f6f1e5')
            d.line([(15,6),(18,6)],fill='#5d7182')
            d.rectangle((16,4,17,5),fill='#5d7182')
            d.point((18,7),fill='#b98d79');d.point((17,11),fill='#687d8a')
            d.line([(15,10),(18,10)],fill='#bb8991')
        elif i==4:
            d.line([(17,5),(17,13)],fill='#6a8067')
            d.ellipse((13,2,20,8),fill='#698f79')
            d.rectangle((15,3,18,5),fill='#8fa77f')
            for x,y in [(15,5),(18,6)]:d.point((x,y),fill='#d7b47f')
            for x in [3,8,14,18]:d.point((x,13),fill='#e4c593')
        elif i==5:
            d.polygon([(2,9),(6,6),(10,9)],fill='#8eaaa5')
            d.polygon([(7,9),(12,5),(18,9)],fill='#8eaaa5')
            d.line([(2,13),(19,13)],fill='#e6d6aa')
            d.rectangle((13,10,19,12),fill='#b6747b')
            d.rectangle((14,8,18,10),fill='#b6747b')
            d.line([(14,9),(17,9)],fill='#c6d4ce')
            for x in [14,18]:d.point((x,13),fill='#4c566c')
        elif i==6:
            d.rectangle((3,8,14,14),fill='#8e718e')
            d.line([(3,8),(14,8)],fill='#c4a0ab')
            d.rectangle((15,3,18,7),fill='#e1cead')
            d.rectangle((16,4,17,6),fill='#9a9e9d')
            d.rectangle((17,11,19,14),fill='#a18478')
            d.line([(18,8),(18,11)],fill='#788b74')
            d.line([(16,8),(19,8)],fill='#788b74')
        elif i==7:
            d.line([(2,10),(19,10)],fill='#c6c2a3')
            d.rectangle((16,4,17,11),fill='#dfbd7b')
            d.rectangle((15,3,18,5),fill='#dfbd7b')
            d.rectangle((14,10,19,12),fill='#dfbd7b')
            for x in [15,18]:d.line([(x,12),(x,14)],fill='#ad8f6d')
            for x,y in [(16,6),(17,9),(15,11)]:d.point((x,y),fill='#a78361')
            d.point((18,4),fill='#5e6369')
        elif i==8:
            d.rectangle((2,9,19,14),fill='#769eb1')
            for x,y in [(3,10),(9,13),(16,13)]:d.line([(x,y),(x+2,y)],fill='#bdc9c3')
            d.line([(16,4),(16,11)],fill='#eee1c1')
            d.polygon([(17,4),(19,9),(17,9)],fill='#eee1c1')
            d.polygon([(13,11),(19,11),(17,13),(15,13)],fill='#aa7f73')
        else:
            d.rectangle((2,10,19,14),fill='#99ae7d')
            d.polygon([(16,3),(19,5),(16,8),(14,5)],fill='#e2b76c')
            d.polygon([(16,3),(16,8),(14,5)],fill='#bd8490')
            d.line([(16,8),(15,9),(16,10),(14,12)],fill='#e4d2ae')
            d.point((15,10),fill='#bd8490')
        family(d, 7 if i==6 else 8)
        # Paper captions are nonverbal pen marks, not new story text.
        d.line([(3,18),(7+i%3,18)],fill='#b7a28d')
        d.line([(10,18),(15+i%3,18)],fill='#b7a28d')
        d.point((18,19),fill='#c49a91')
        dest=R/'props'/f'photo-{i}.png';dest.parent.mkdir(exist_ok=True)
        im.save(dest)

if __name__=='__main__':make_memories()
