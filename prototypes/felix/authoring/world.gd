@tool
extends Node2D
const Codec=preload("res://authoring/codec.gd")
@export var world_number=1
@export var chapter_title=""
@export var ambient_color=Color.WHITE
@export var accent_color=Color.WHITE
@export var flowers_color=Color.WHITE
@export var bunnies_color=Color.WHITE
@export var play_room_id=""
@export_group("Advanced world data")
@export var world_settings={}
@export var gameplay_settings={}
@export_storage var original_palette={}
@export_storage var source_fingerprint=""
@export_storage var format_version=1
func _ready():
 if Engine.is_editor_hint(): return
 get_node("Rooms").hide()
 var game=load("res://main.tscn").instantiate()
 game.initial_world=world_number
 game.initial_room=play_room_id
 add_child(game)
func compile_into(base): return Codec.compile_world(self,base)
func validate_data(data): return Codec.validate(self,data)
