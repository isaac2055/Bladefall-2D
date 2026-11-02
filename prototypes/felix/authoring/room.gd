@tool
extends Node2D
@export var room_id=""
@export var room_title=""
@export_range(4,200,1) var map_width=40
@export_range(4,200,1) var map_height=23
@export_group("Advanced room data")
@export var settings={}
@export_storage var original_fields=[]
@export_storage var array_fields=[]
@export_storage var original_spawn=Vector2.ZERO
var drawn_hash=0
func _ready():
 if not Engine.is_editor_hint(): set_process(false)
func _process(_delta):
 if not Engine.is_editor_hint(): return
 var current=hash([map_width,map_height,room_title,room_id])
 if current!=drawn_hash:
  drawn_hash=current
  queue_redraw()
func _draw():
 if not Engine.is_editor_hint(): return
 draw_rect(Rect2(0,0,map_width*8,map_height*8),Color(.6,.75,.85,.45),false,.5)
 draw_string(ThemeDB.fallback_font,Vector2(1,-4),room_title+" · "+room_id,HORIZONTAL_ALIGNMENT_LEFT,-1,6,Color("#bacacd"))
