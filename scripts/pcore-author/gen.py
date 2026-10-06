# Writes a Precision Core part file from room grids, chapter metadata and tapes.
import json,sys,importlib,os
def emit(out,part,title,header,chapters,rooms,tapes):
    L=[]
    L.append(header.rstrip()+'\n(function(root){\n\'use strict\';\nconst chapters=[')
    for ch in chapters:
        rs=[]
        for rm in ch['rooms']:
            extra=''.join(f',{k}:{json.dumps(v)}' for k,v in rm.get('def',{}).items())
            rs.append(f" {{id:{json.dumps(rm['id'])},name:{json.dumps(rm['name'])},hint:{json.dumps(rm.get('hint',''))}{extra},question:{json.dumps(rm['question'])},map:{rooms[rm['id']].js()}}}")
        lab=f",label:{json.dumps(ch['label'])}" if ch.get('label') else ''
        lv=f",level:{ch['level']}" if ch.get('level') is not None else ''
        bn=",bonus:true" if ch.get('bonus') else ''
        L.append(f" {{id:{json.dumps(ch['id'])},name:{json.dumps(ch['name'])}{lv}{bn}{lab},palette:{json.dumps(ch['palette'])},blurb:{json.dumps(ch['blurb'])},outro:{json.dumps(ch['outro'])},rooms:[\n"+',\n'.join(rs)+"]},")
    L.append('];')
    L.append('const tapes={')
    for ch in chapters:
        for rm in ch['rooms']:
            t=tapes.get(rm['id'])
            if t is not None: L.append(f" {json.dumps(rm['id'])}:{json.dumps(t,separators=(',',':'))},")
    L.append('};')
    L.append(f"root.BladefallPrecisionRooms.addPart({{part:{json.dumps(part)},title:{json.dumps(title)},chapters,tapes}});")
    L.append("})(typeof window!=='undefined'?window:globalThis);\n")
    open(out,'w').write('\n'.join(L))
