# Tiny room-drawing helper: a 40x23 grid, rectangles and points, printed as JS map rows.
class G:
    def __init__(s,fill='.'):
        s.m=[[fill]*40 for _ in range(23)]
    def rect(s,c,r,w,h,ch='#'):
        for y in range(r,r+h):
            for x in range(c,c+w):
                if 0<=x<40 and 0<=y<23: s.m[y][x]=ch
        return s
    def put(s,c,r,ch): s.m[r][c]=ch; return s
    def walls(s,exit='right',rows=None):
        s.rect(0,0,40,1); s.rect(0,0,1,23); s.rect(39,0,1,23); s.rect(0,20,40,3)
        return s
    def js(s):
        rows=[''.join(r) for r in s.m]
        assert all(len(r)==40 for r in rows) and len(rows)==23
        assert sum(r.count('P') for r in rows)==1, 'spawns'
        return '[\n'+',\n'.join("  '"+r.replace('\\','\\\\')+"'" for r in rows)+']'
    def show(s): print('\n'.join(''.join(r) for r in s.m))
