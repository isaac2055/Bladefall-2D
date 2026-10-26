@tool
extends Node2D
const Painter=preload("res://scripts/landscape.gd")
const Styles=preload("res://scripts/character_styles.gd")
const Art=preload("res://scripts/art_details.gd")
@export_enum("Prop","NPC","Bunny","Fixture","Spawn","White flower","Mechanism") var kind="Prop"
@export var enabled=true
@export var tint=Color.WHITE
@export var petal_color=Color.WHITE
@export_enum("Inherit:-1","Pixel:0","Ink:1","Illustration:2") var character_style=-1
@export var glyph=""
@export var footprint=Vector2i.ONE
@export_range(1,3600,1) var period=180
@export var phase=0
@export_range(.5,24,.5) var radius=4.0
@export var loop_path=false
@export_group("Mechanism values")
@export var parameters={}
@export_storage var original_position=Vector2.ZERO
@export_storage var original_petal_color=Color.WHITE
@export_storage var field_path=[]
@export_storage var array_element=false
@export_storage var preview_entity={}
@export_storage var preview_offset=Vector2.ZERO
@export_storage var preview_kind=""
@export_storage var world_number=1
var painter
var drawn_hash=0
func _enter_tree():
 drawn_hash=0
 if not Engine.is_editor_hint():
  set_process(false)
  return
 painter=Painter.new()
 painter.world_data={"world":{"n":world_number,"props":owner.world_settings.get("props",{}) if owner!=null and owner.get("world_settings")!=null else {}}}
 painter.fractured=world_number>=21
 painter.forest=world_number in [2,22]
 painter.causeway=world_number in [3,23]
 painter.configure_mood()
 if has_node("MotionPath") and not get_node("MotionPath").curve.changed.is_connected(queue_redraw): get_node("MotionPath").curve.changed.connect(queue_redraw)
func _exit_tree():
 if is_instance_valid(painter): painter.free()
 painter=null
func _process(_delta):
 if not Engine.is_editor_hint() or not is_instance_valid(painter): return
 var palette={}
 if owner!=null and owner.get("original_palette")!=null:
  for field in ["ambient","accent","flowers","bunnies"]:
   if owner.get(field+"_color").to_html()!=owner.original_palette[field]: palette[field]=owner.get(field+"_color").to_html()
 var current=hash([palette,kind,enabled,tint,petal_color,character_style,glyph,footprint,radius,loop_path,parameters])
 if current!=drawn_hash:
  drawn_hash=current
  if owner!=null and owner.get("world_settings")!=null: painter.world_data.world.props=owner.world_settings.get("props",{})
  painter.world_data.world.authoring_palette=palette
  painter.configure_mood()
  queue_redraw()
func _draw():
 if not Engine.is_editor_hint() or not is_instance_valid(painter): return
 if not enabled:
  draw_line(Vector2(-3,-3),Vector2(3,3),Color(.9,.3,.3),1)
  return
 painter.ink=self
 painter.paint_transform=Transform2D.IDENTITY
 painter.clock=0
 painter.ink_color=tint if kind!="Bunny" else Color.WHITE
 match kind:
  "Prop": painter.draw_prop(parameters.get("k","trumpets"),Vector2.ZERO,{"petal_color":petal_color.to_html()} if petal_color!=original_petal_color else {})
  "NPC":
   painter.npc_design=1 if character_style<0 else character_style
   painter.draw_person(parameters,Vector2.ZERO,false)
  "Bunny":
   var b={"x":0,"y":0,"radius":radius,"tint":tint.to_html()}
   Art.dust_bunny(painter,b,Vector2.ZERO)
  "Fixture":
   if preview_entity.is_empty():
    draw_rect(Rect2(Vector2.ZERO,Vector2(footprint)*8),Color(.7,.65,.85,.5),false,.6)
    draw_string(ThemeDB.fallback_font,Vector2(1,6),glyph,HORIZONTAL_ALIGNMENT_LEFT,-1,6,Color.WHITE)
   else:
    var e=preview_entity.duplicate(true)
    if glyph in "ABKZGHM~VXQCY":
     e.w=footprint.x*8
     e.h=footprint.y*8
    painter.draw_entity(e,-Vector2(e.x,e.y)+preview_offset)
  "Spawn":
   draw_circle(Vector2(4,4),4,Color(.4,.8,1,.3))
   draw_line(Vector2(4,-4),Vector2(4,12),Color("#91c8ee"),.6)
   draw_line(Vector2(-4,4),Vector2(12,4),Color("#91c8ee"),.6)
  "White flower":
   draw_rect(Rect2(Vector2.ZERO,Vector2(footprint)),Color(.9,.95,.7,.15))
   for i in range(max(1,ceili(float(footprint.x)/2.6))):
    var at=Vector2(1+i*2.6,1)
    Styles.line(painter,Vector2(at.x,footprint.y),at,"#839b83",.5)
    Styles.oval(painter,at,Vector2(1.5,.9),"#fffbee","#cdd8c7",.12)
  "Mechanism":
   if not preview_entity.is_empty():
    if preview_kind=="enemy": painter.draw_hound(preview_entity,-Vector2(preview_entity.x,preview_entity.y))
    else: painter.draw_entity(preview_entity,-Vector2(preview_entity.x,preview_entity.y))
   else:
    draw_circle(Vector2.ZERO,3,Color("#b6b2da"),false,.6)
    draw_string(ThemeDB.fallback_font,Vector2(4,1),name,HORIZONTAL_ALIGNMENT_LEFT,-1,4,Color("#b6b2da"))
 if has_node("MotionPath"):
  var curve=get_node("MotionPath").curve
  var points=curve.get_baked_points()
  if points.size()>1: draw_polyline(points,Color(.8,.7,.4,.6),.45)
  if loop_path and curve.point_count>1: draw_line(curve.get_point_position(0),curve.get_point_position(curve.point_count-1),Color(.8,.7,.4,.6),.45)
